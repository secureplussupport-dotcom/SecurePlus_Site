import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gradePilotCheck } from '../src/pilots/sec01/checks.js';

const lesson = JSON.parse(readFileSync('src/pilots/sec01/lesson.json', 'utf8'));
const vocabulary = JSON.parse(readFileSync('src/data/mcqConceptTagVocabulary.json', 'utf8'));
test('SEC-01 keeps the proposed three concepts and one check per concept', () => {
  assert.equal(lesson.lesson_id, 'SEC-01');
  assert.equal(lesson.pilot_only, true);
  assert.deepEqual(lesson.mapped_tags, ['sec.cia-triad', 'sec.non-repudiation', 'sec.defense-in-depth']);
  assert(lesson.mapped_tags.every(tag => vocabulary.includes(tag)));
  assert.deepEqual(lesson.content.micro_checks.map(check => check.target_tag), lesson.mapped_tags);
  assert.equal(new Set(lesson.content.micro_checks.map(check => check.check_id)).size, 3);
  assert.deepEqual(lesson.content.micro_checks.map(check => check.correct_index), [1, 2, 1]);
});
test('micro-check feedback grades every choice correctly and rejects invalid choices', () => {
  for (const check of lesson.content.micro_checks) {
    assert.equal(new Set(check.options).size, 4);
    assert(check.explanation.length > 50);
    check.options.forEach((_, choice) => assert.equal(gradePilotCheck(check, choice), choice === check.correct_index));
    for (const invalid of [-1, 4, 0.5, NaN, null, undefined, '1']) {
      assert.throws(() => gradePilotCheck(check, invalid), RangeError);
    }
  }
});

const {lessonKeywords} = await import('../src/pilots/sec01/keywords.js');
const {createLessonBookmarks} = await import('../src/pilots/sec01/bookmarks.js');
test('keyword introduction uses the existing flashcard IDs and exact definitions',()=>{
  assert.equal(lessonKeywords.length,3);
  assert.equal(lessonKeywords[0].term,'CIA');
  assert.equal(lessonKeywords[0].definition,'Security triad: keep data private, accurate, and available when needed.');
  assert.equal(lessonKeywords[1].definition,''); // Preserve the bank’s pending definition.
  assert.ok(lessonKeywords[2].definition.includes('Layered security'));
});
function bookmarkFixture(signedIn=false){
  let session=signedIn?{access_token:'test-token',user:{id:'fixture',email:'learner@example.test'}}:null;
  const values=new Map([['starred:guest',JSON.stringify(['mcq:keep','flashcard:existing'])]]),calls=[];
  let cloud=['mcq:keep','flashcard:existing'],fail=false;
  const service=createLessonBookmarks({getSession:async()=>session,storage:{get:async key=>({value:values.get(key)}),set:async(key,value)=>values.set(key,value)},request:async(operation,body)=>{
    calls.push({operation,...body});if(fail)throw new Error('Offline');
    if(body.action==='list')return {stars:cloud.slice().reverse().map(question_key=>({question_key}))};
    cloud=body.action==='save'?[body.key,...cloud]:cloud.filter(key=>key!==body.key);
    return {saved:body.action==='save'};
  }});
  return {service,values,calls,setSession:value=>session=value,fail:()=>fail=true};
}
test('guest stars use the main Flashcards storage and preserve unrelated bookmarks',async()=>{
  const f=bookmarkFixture(),state=await f.service.load();
  let next=await f.service.toggle(state,lessonKeywords[0].id);
  assert.ok(next.keys.includes(`flashcard:${lessonKeywords[0].id}`));
  assert.ok(next.keys.includes('mcq:keep'));
  assert.deepEqual(JSON.parse(f.values.get('starred:guest')),next.keys);
  next=await f.service.toggle(next,lessonKeywords[0].id);
  assert.deepEqual(next.keys,state.keys);
  assert.equal(f.calls.length,0);
});
test('authenticated stars use the existing endpoint and failures never overwrite the cache',async()=>{
  const f=bookmarkFixture(true),state=await f.service.load();
  const next=await f.service.toggle(state,lessonKeywords[0].id);
  assert.deepEqual(f.calls.at(-1),{operation:'star',action:'save',key:`flashcard:${lessonKeywords[0].id}`,type:'flashcard',id:lessonKeywords[0].id});
  assert.deepEqual(JSON.parse(f.values.get('starred:learner@example.test')),next.keys);
  const before=f.values.get('starred:learner@example.test');
  f.fail();await assert.rejects(()=>f.service.toggle(next,lessonKeywords[0].id),/Offline/);
  assert.equal(f.values.get('starred:learner@example.test'),before);
});
test('sign-in changes stop a stale bookmark mutation',async()=>{
  const f=bookmarkFixture(),state=await f.service.load();
  f.setSession({access_token:'test-token',user:{id:'other'}});
  await assert.rejects(()=>f.service.toggle(state,lessonKeywords[0].id),/sign-in changed/);
  assert.equal(f.calls.length,0);
});
