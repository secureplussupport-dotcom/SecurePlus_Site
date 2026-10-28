import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import seed from '../src/data/sy0701_flashcard_seed.json' with {type:'json'};
import schema from '../src/data/sy0701_flashcard_seed.schema.json' with {type:'json'};
import vocabulary from '../src/data/mcqConceptTagVocabulary.json' with {type:'json'};
import groups from '../src/data/mcqConceptTagGroups.json' with {type:'json'};
import {SY0701_ACRONYM_CARDS as cards,SY0701_ACRONYM_SETS as decks,getSy0701AcronymSet} from '../src/data/sy0701AcronymFlashcards.js';
import {flashcardFaces,personalisedFlashcards,partitionFlashcards,personalisedFlashcardGroups,personalisedFlashcardSet,recommendedFlashcardSets} from '../src/lib/flashcardConcepts.js';
import {advanceConceptStreak} from '../src/lib/mcqResultSummary.js';

// A small validator for the JSON-schema constructs used by this static bank.
function validate(value,rule,path='seed') {
  if(rule.type==='object') {
    assert.ok(value&&typeof value==='object'&&!Array.isArray(value),path);
    for(const key of rule.required||[])assert.ok(Object.hasOwn(value,key),`${path}.${key} required`);
    for(const [key,item] of Object.entries(value)) {
      const child=rule.properties?.[key]||rule.additionalProperties;
      assert.notEqual(child,false,`${path}.${key} unexpected`);
      if(child&&child!==true)validate(item,child,`${path}.${key}`);
    }
  } else if(rule.type==='array') {
    assert.ok(Array.isArray(value),path);
    assert.ok(value.length>=(rule.minItems??0)&&value.length<=(rule.maxItems??Infinity),`${path} size`);
    value.forEach((item,i)=>validate(item,rule.items,`${path}[${i}]`));
  } else if(rule.type==='integer') {
    assert.ok(Number.isInteger(value),path);
    assert.ok(value>=(rule.minimum??-Infinity)&&value<=(rule.maximum??Infinity),path);
  } else assert.equal(typeof value,rule.type,path);
}

test('static bank meets its strict schema and covers all 502 supplied entries once',()=>{
  validate(seed,schema);
  assert.equal(cards.length,502);assert.equal(decks.length,35);
  assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
  assert.deepEqual(seed.domains.map(d=>d.id),[1,2,3,4,5]);
  assert.ok(decks.every(d=>d.cards.length>=10&&d.cards.length<=20));
  assert.equal(new Set(seed.decks.flatMap(d=>d.card_ids)).size,502);
  for(const deck of seed.decks)for(const id of deck.card_ids)assert.equal(seed.cards.find(c=>c.id===id)?.domain_id,deck.domain_id);
  const known=new Set([...vocabulary,...Object.values(groups).flatMap(g=>g.tagIds)]);
  for(const card of cards) {
    assert.ok(card.id.length<=160);assert.ok(card.term.trim());
    assert.ok(card.keywords.length&&card.concept_tags.length);
    assert.ok(card.concept_tags.every(tag=>known.has(tag)),card.term);
  }
});

test('schema rejects malformed fields, missing flags, unknown fields and oversized decks',()=>{
  for(const mutate of [
    draft=>{draft.cards[0].definition=null;},
    draft=>{delete draft.cards[0].is_acronym;},
    draft=>{draft.cards[0].unexpected='value';},
    draft=>{draft.decks[0].card_ids=Array(21).fill(draft.cards[0].id);},
  ]) {
    const draft=structuredClone(seed);mutate(draft);assert.throws(()=>validate(draft,schema));
  }
});

test('all 313 prior card IDs and their definitions survive reorganisation',()=>{
  // Hash of the released 737b301 ID/definition pairs; no git history needed in CI.
  const preserved=cards.filter(card=>!card.id.startsWith('sy0701-card-'));
  assert.equal(preserved.length,313);
  const pairs=preserved.map(card=>[card.id,card.definition]).sort((a,b)=>a[0].localeCompare(b[0]));
  assert.equal(createHash('sha256').update(JSON.stringify(pairs)).digest('hex'),'97a10cda33f29237f20e601e6ebc7de1376eda559fa9eebe1194c3ffd855e6e4');
  for(const oldId of Object.keys(seed.legacy_decks))assert.ok(getSy0701AcronymSet(oldId));
});

test('term-first faces hide expansions and definitions until the answer, including pending cards',()=>{
  const rto=cards.find(c=>c.term==='RTO');
  assert.deepEqual(flashcardFaces(rto),{front:'RTO',fullForm:'Recovery Time Objective',definition:rto.definition});
  const blank=cards.find(c=>c.term==='Gap Analysis');
  assert.equal(blank.definition,'');assert.equal(flashcardFaces(blank).front,'Gap Analysis');
  assert.equal(flashcardFaces(blank).definition,'');
  assert.equal(cards.filter(c=>c.term==='RBAC').length,1);
  assert.notEqual(cards.find(c=>c.keywords[0].startsWith('Storage Area Network')).id,cards.find(c=>c.keywords[0].startsWith('Subject Alternative Name')).id);
});

test('two consecutive concept misses include every exact-tag card; correct answers reset it',()=>{
  let streak={};
  streak=advanceConceptStreak(streak,'risk.bia-rto-rpo',false);
  const state=()=>({concept_streaks:Object.entries(streak).map(([concept_tag,wrong_streak])=>({concept_tag,wrong_streak}))});
  assert.equal(personalisedFlashcards(state()).length,0);
  streak=advanceConceptStreak(streak,'ops.siem',false); // Different topic does not reset RTO.
  streak=advanceConceptStreak(streak,'risk.bia-rto-rpo',false);
  const matches=cards.filter(c=>c.concept_tags.includes('risk.bia-rto-rpo'));
  assert.deepEqual(personalisedFlashcards(state()),matches);
  assert.ok(matches.some(c=>c.term==='RTO'));assert.ok(matches.some(c=>c.term==='RPO'));
  streak=advanceConceptStreak(streak,'risk.bia-rto-rpo',true);
  assert.equal(personalisedFlashcards(state()).length,0);
  assert.equal(personalisedFlashcards({concept_streaks:[{concept_tag:'risk.bia-rto-rpo-extra',wrong_streak:2}]}).length,0);
});

test('overlapping tags do not duplicate cards and batching never drops matching cards',()=>{
  const picked=personalisedFlashcards({concept_streaks:[{concept_tag:'gov.nist-csf',wrong_streak:2},{concept_tag:'gov.iso-27001',wrong_streak:4}]});
  assert.equal(new Set(picked.map(c=>c.id)).size,picked.length);
  for(let n=0;n<=502;n++) {
    const parts=partitionFlashcards(cards.slice(0,n));
    assert.deepEqual(parts.flat(),cards.slice(0,n));
    assert.ok(parts.every(p=>p.length<=20));
    if(n>=10)assert.ok(parts.every(p=>p.length>=10));
  }
});

test('published UI uses one term-first flow and no editable card backend',()=>{
  const app=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
  const page=app.slice(app.indexOf('function FlashcardsPage('),app.indexOf('function ObjectivesPage('));
  assert.ok(!page.includes('FlashcardModeChooser'));
  assert.ok(page.includes('mcqEngineRequest("state")'));
  assert.ok(page.includes('personalisedFlashcards(engineState)'));
  assert.ok(page.includes('recommendedFlashcardSets(engineState)'));
  assert.ok(app.includes('disabled={!answerCopy}'));
});

test('personalised reviews use topic names within domains without losing or duplicating cards',()=>{
  const all=personalisedFlashcardGroups(cards);
  assert.equal(all.flatMap(set=>set.cards).length,cards.length);
  assert.equal(new Set(all.flatMap(set=>set.cards).map(card=>card.id)).size,cards.length);
  assert.equal(new Set(all.map(set=>set.id)).size,all.length);
  for(const set of all){
    assert(set.title);assert(set.cards.length<=20);
    assert(set.cards.every(card=>card.chapterId===set.chapterId));
    assert.equal(new Set(set.cards.map(card=>card.setId)).size,1);
  }
  const picked=[cards[0],cards[40],cards[120],cards[0]];
  assert.equal(personalisedFlashcardGroups(picked).flatMap(set=>set.cards).length,3);
  assert.deepEqual(personalisedFlashcardGroups([]),[]);
  const one=personalisedFlashcardGroups([cards[0]]);
  assert.equal(one[0].title,cards[0].setTitle);
  assert.equal(personalisedFlashcardGroups([cards[0],cards[1]])[0].id,one[0].id);
});
test('an oversized topic stays named and retains every card in bounded batches',()=>{
  const input=Array.from({length:41},(_,i)=>({...cards[0],id:'fixture-'+i,term:'Term '+String(i).padStart(2,'0')}));
  const parts=personalisedFlashcardGroups(input);
  assert.equal(parts.flatMap(set=>set.cards).length,41);
  assert.equal(new Set(parts.map(set=>set.title)).size,parts.length);
  assert(parts.every(set=>set.title.startsWith(cards[0].setTitle)&&set.cards.length<=20));
});

test('dashboard review metadata matches the two recommended topic sets',()=>{
 const oneState={concept_streaks:[{concept_tag:'sec.cia-triad',wrong_streak:2}]};
 const one=personalisedFlashcardSet(oneState);
 assert.equal(one.topicCount,1);assert.equal(one.title,one.cards[0].setTitle);
 const multiState={concept_streaks:[{concept_tag:'risk.bia-rto-rpo',wrong_streak:2},{concept_tag:'ops.siem',wrong_streak:2}]};
 const multi=personalisedFlashcardSet(multiState);
 assert(multi.topicCount>1);assert.equal(multi.title,'Your personalised topics');
 assert.deepEqual(multi.cards,recommendedFlashcardSets(multiState).flatMap(set=>set.cards));
 assert.equal(personalisedFlashcardSet({}),null);
});

test('recommendations show at most two relevant 15-card sets without duplicates or cross-domain padding',()=>{
 const state={concept_streaks:[{concept_tag:'risk.bia-rto-rpo',wrong_streak:4},{concept_tag:'ops.siem',wrong_streak:3},{concept_tag:'iam.mfa',wrong_streak:2},{concept_tag:'att.phishing',wrong_streak:2}]};
 const sets=recommendedFlashcardSets(state);
 assert.equal(sets.length,2);
 assert(sets[0].cards.some(card=>card.concept_tags.includes('risk.bia-rto-rpo')));
 assert(sets[1].cards.some(card=>card.concept_tags.includes('ops.siem')));
 for(const set of sets){assert.equal(set.cards.length,15);assert(set.cards.every(card=>card.chapterId===set.chapterId));}
 assert.equal(new Set(sets.flatMap(set=>set.cards).map(card=>card.id)).size,30);
 assert.deepEqual(recommendedFlashcardSets({}),[]);
 assert.equal(recommendedFlashcardSets({diagnostic_weak_tags:['iam.mfa']})[0].cards.length,15);
 assert.equal(recommendedFlashcardSets({concept_streaks:[{concept_tag:'iam.mfa',wrong_streak:0}]}).length,0);
 const limited=cards.filter(card=>card.concept_tags.includes('iam.mfa')).slice(0,1);
 assert.equal(recommendedFlashcardSets({diagnostic_weak_tags:['iam.mfa']},limited)[0].cards.length,1);
 const sameDomain=recommendedFlashcardSets({concept_streaks:[{concept_tag:'ops.siem',wrong_streak:3},{concept_tag:'ir.lifecycle-nist',wrong_streak:2}]});
 assert.equal(new Set(sameDomain.flatMap(set=>set.cards).map(card=>card.id)).size,sameDomain.flatMap(set=>set.cards).length);
});
