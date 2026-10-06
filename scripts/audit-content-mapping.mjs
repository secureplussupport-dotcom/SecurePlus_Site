import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {buildPackage,digest,detectCatalogueIssues} from './lib/content-mapping/package.mjs';
import {verifyDeliveryInventory,readGlossary,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
import {getDeepDiveRecommendations} from '../src/lib/deepDiveRecommendations.js';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {PUBLISHED_CONTENT_SNAPSHOT} from '../src/data/sy0701PublishedSnapshot.js';
import {compileRevision} from '../server/adaptive/revision.mjs';
import {RETIRED_MCQ_REVIEW} from '../src/data/sy0701EditorialReview.js';
import {SY0701_OBJECTIVES} from '../src/data/sy0701DeepDiveMap.js';
const pkg=buildPackage(),bank=readLearningPilotBank(),pipeline=publicationPipeline();
test('published captured payload cannot overwrite editorial correction',()=>{
 const row=PUBLISHED_CONTENT_SNAPSHOT.find(r=>r.question_kind==='mcq'&&bank.mcqs.some(q=>q.id===r.question_id));
 const actual=pipeline.overrides([{...row,payload:{q:'incorrect stale replacement'}}]).mcqs.find(q=>q.id===row.question_id);
 assert.equal(actual.q,bank.mcqs.find(q=>q.id===row.question_id).q);
});
test('newer upsert, inactive draft, disable, retired upsert and forced ID use production rules',()=>{
 const q=bank.mcqs[0],row={question_kind:'mcq',question_id:q.id,status:'active',action:'upsert',updated_at:'2099-01-01',payload:{q:'new publication',id:'m999999'}};
 assert.equal(pipeline.overrides([row]).mcqs.find(x=>x.id===q.id).q,'new publication');
 assert.equal(pipeline.overrides([{...row,status:'draft'}]).mcqs.find(x=>x.id===q.id).q,q.q);
 assert.ok(!pipeline.overrides([{...row,action:'disable'}]).mcqs.some(x=>x.id===q.id));
 assert.ok(!pipeline.overrides([{...row,question_id:Object.keys(RETIRED_MCQ_REVIEW)[0]}]).mcqs.some(x=>x.id===Object.keys(RETIRED_MCQ_REVIEW)[0]));
});
test('remote PBQ before cutoff cannot undo review; later remote replaces it',()=>{
 const q=bank.pbqs.find(q=>q.editorialReviewed),old={...q,title:'old',remoteUpdatedAt:'2020-01-01'},later={...old,title:'new',remoteUpdatedAt:'2099-01-01'};
 assert.equal(pipeline.remote([q],[old])[0].title,q.title);assert.equal(pipeline.remote([q],[later])[0].title,'new');
 assert.equal(pipeline.remote([],[later])[0].id,q.id,'remote merge can reintroduce a live-disabled item; preserve current behavior');
});
test('all actual local questions counted once; private alternatives kept separate',()=>{
 assert.equal(pkg.counts.mcqs,bank.mcqs.length);assert.equal(pkg.counts.localPbqs,bank.pbqs.length);assert.equal(pkg.counts.privatePbqVariants,2);
 assert.equal(new Set(pkg.records.map(r=>r.id)).size,pkg.records.length);
 for(const kind of ['mcq','pbq'])for(const q of bank[kind+'s'])assert.equal(pkg.records.filter(r=>r.id===`${kind}:${q.id}`).length,1);
});
test('exact local/trusted revision identities and unsupported grammar remain honest',()=>{
 for(const r of pkg.records.filter(r=>r.localRevisionSignature)){const q=bank[r.kind+'s'].find(q=>q.id===r.questionId);assert.equal(r.localRevisionSignature,contentSignature(q));if(r.trustedRevisionId){const c=compileRevision(q,r.kind);assert.equal(r.trustedRevisionId,c.revisionId);assert.equal(r.contentSha256,c.contentSha256);}else assert.ok(r.revisionLimitation);}
 const q=bank.mcqs[0];assert.notEqual(compileRevision(q,'mcq').revisionId,compileRevision({...q,q:q.q+' changed'},'mcq').revisionId);
});
test('candidate refs, objective refs, IDs, roles and PBQ weights are valid',()=>{
 const concepts=new Set(pkg.concepts.map(c=>c.id));assert.equal(concepts.size,pkg.concepts.length);
 for(const r of pkg.records){for(const id of [r.primaryConceptId,...r.secondaryConceptIds,...r.candidateConceptIds].filter(Boolean))assert.ok(concepts.has(id),id);for(const code of r.objectiveCodes)assert.ok(SY0701_OBJECTIVES[code]);if(r.kind==='pbq'){assert.equal(r.precision,'coarse');assert.equal(r.weight,0);}assert.equal(r.mappingVersion,pkg.mappingVersion);assert.ok(r.sourceSignature.match(/^sha256:[a-f0-9]{64}$/));}
});
test('unused generated checks and cards excluded; active display capped at three per lesson',()=>{
 const checks=pkg.records.filter(r=>r.id.startsWith('practice:'));assert.equal(checks.length,96);assert.equal(pkg.exclusions.filter(r=>r.id.startsWith('practice:')).length,75);
 for(const l of pkg.records.filter(r=>r.kind==='lesson'))assert.equal(checks.filter(r=>r.parentId===l.id).length,3);
 assert.ok(pkg.exclusions.some(r=>r.status==='retired'));assert.ok(pkg.exclusions.some(r=>r.id.startsWith('unused-card:')));
});
test('private boundary is metadata-only; stale local payload never becomes private trusted ID',()=>{
 for(const r of pkg.records.filter(r=>r.id.startsWith('private:')&&r.kind==='pbq')){assert.equal(r.trustedRevisionId,null);assert.equal(r.primaryConceptId,null);assert.match(r.evidenceScope,/semantics_unreviewed/);assert.ok(pkg.reviewQueue.some(i=>i.recordId===r.id&&i.priority==='P0'));}
 const r=JSON.parse(readFileSync('docs/evidence/phase-2b5/private-reconciliation.json'));assert.equal(r.overrides.filter(x=>x.payloadMatches&&x.capturedSignatureMatches).length,56);assert.ok(r.pbqs.every(x=>!x.payloadMatches));
});
test('gaps, novelty, missing objectives and every unresolved question are actionable',()=>{
 assert.ok(pkg.reviewQueue.some(i=>i.reason==='independent_family_shortage'));assert.ok(pkg.reviewQueue.some(i=>i.reason==='missing_mapped_intervention'));assert.ok(pkg.reviewQueue.some(i=>i.reason==='missing_objective'));
 for(const r of pkg.records.filter(r=>['mcq','pbq'].includes(r.kind)&&!r.primaryConceptId))assert.ok(pkg.reviewQueue.some(i=>i.recordId===r.id));
 assert.equal(pkg.humanApproved,false);assert.equal(pkg.activationAllowed,false);assert.ok(Object.values(pkg.matrices.byConcept).every(c=>c.humanApprovedFamilyCount===0));
});
test('exports have no answer-bearing fields, stems, options, private payloads or learner records',()=>{
 const forbidden=new Set(['q','opts','choices','options','correct','answer','gradingKey','semantic','components','wrongFeedback','optionFeedback','selectionFeedback','correctOrder','payload','user_id','email','jwt','password','service_role_key']);
 const walk=x=>{if(x&&typeof x==='object')for(const [k,v] of Object.entries(x)){assert.ok(!forbidden.has(k),k);walk(v);}};walk(pkg);
 const text=JSON.stringify(pkg);for(const q of bank.mcqs)assert.ok(!text.includes(JSON.stringify(q.q).slice(1,-1)));
});
test('build is deterministic and committed artifacts match exact source inputs',()=>{
 assert.deepEqual(buildPackage(),pkg);assert.deepEqual(JSON.parse(readFileSync('docs/evidence/phase-2b5/mapping-package.json')),pkg);
 const hashes=JSON.parse(readFileSync('docs/evidence/phase-2b5/checksums.json')).files;for(const [name,hash] of Object.entries(hashes))assert.equal(digest(readFileSync('docs/evidence/phase-2b5/'+name)),hash);
});

test('adversarial duplicates, conflicts, stale revisions and orphan references are detected',()=>{
 const row={id:'mcq:m999',questionId:'m999',localRevisionSignature:'new',objectiveCodes:['1.1'],domainIds:['2'],primaryConceptId:'missing',secondaryConceptIds:[],candidateConceptIds:[],duplicateStemSignature:'same'};
 const findings=detectCatalogueIssues([row,{...row}], [{id:'unused'}], [{questionId:'m999',questionRevision:'old'},{questionId:'retired',questionRevision:'old'}]);
 for(const reason of ['duplicate_identity','duplicate_stem','domain_conflict','orphan_concept_reference','orphan_or_stale_mapping','orphan_concept'])assert.ok(findings.some(x=>x.reason===reason),reason);
});

test('new package stays out of browser and routed API import graph',()=>{
 const files=['src','api'].flatMap(root=>readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)).map(p=>root+'/'+p));
 for(const file of files){const source=readFileSync(file,'utf8');assert.ok(!/from\s*['"][^'"]*(?:content-mapping|server\/adaptive|phase-2b5)/.test(source));}
});

test('delivered glossary has a row-level census instead of only an App hash',()=>{
 const source=readFileSync('src/App.jsx','utf8');
 const a=source.indexOf('const ACRONYM_GLOSSARY_TERMS ='),b=source.indexOf('const ACRONYM_TERMS_SORTED =',a);
 const terms=Function(`"use strict";${source.slice(a,b)};return GLOSSARY_TERMS;`)();
 assert.equal(Object.keys(terms).length,162);
 const entries=[...pkg.records,...pkg.exclusions].filter(r=>r.kind==='glossary_definition');
 assert.equal(entries.length,Object.keys(terms).length);
 for(const [term,definition] of Object.entries(terms)){
  const r=entries.find(r=>r.term===term);assert.ok(r,term);assert.equal(r.definitionSignature,contentSignature(definition));
 }
});
test('all known delivered learning selectors are inventoried with exact source provenance',()=>{
 for(const id of ['deep-dive-recommendations','related-flashcard-lessons','smart-review','next-related-pbq','next-flashcard-deck','random-flashcards','starred-flashcards','diagnostic','practice-launch','exam-selection']){
  const r=pkg.records.find(r=>r.id===`intervention:${id}`);assert.ok(r,id);assert.ok(r.selector.inputs.length);assert.ok(r.selector.targetKinds.length);assert.ok(r.selector.sourceUnits.length);assert.ok(r.selector.deliveryEvidence.length);
 }
 assert.ok(pkg.sources.some(s=>s.path==='src/lib/deepDiveRecommendations.js'));
});

test('glossary uses renderer boundaries, binds source usage, and retains unobserved definitions',()=>{
 const {matchTerms}=readGlossary();
 assert.deepEqual(matchTerms('**SQL injection** RTO notRTOx'),['RTO','SQL injection']);
 assert.ok(verifyDeliveryInventory(pkg));
 const entries=pkg.records.filter(r=>r.kind==='glossary_definition');
 assert.equal(entries.filter(r=>r.usageReferences.some(x=>/^(mcq|pbq|lesson):/.test(x.recordId))).length,136);
 assert.equal(entries.filter(r=>r.usageReferences.length).length,153);
 for(const r of entries){assert.equal(r.weight,0);assert.equal(r.trustedRevisionId,null);assert.equal(r.definitionSource.path,'src/App.jsx');assert.ok(r.definitionSource.line>2230);}
 assert.ok(entries.some(r=>r.usageStatus==='no_local_reference_observed'));
});
test('missing glossary/selector rows and revision drift fail the completeness guard',()=>{
 for(const kind of ['glossary_definition','intervention_selector']){
  const copy=structuredClone(pkg);copy.records.splice(copy.records.findIndex(r=>r.kind===kind),1);
  assert.throws(()=>verifyDeliveryInventory(copy),/Incomplete/);
 }
 const drift=structuredClone(pkg);drift.records.find(r=>r.kind==='glossary_definition').definitionSignature='sha256:'+'0'.repeat(64);
 assert.throws(()=>verifyDeliveryInventory(drift),/Glossary revision mismatch/);
 const selector=structuredClone(pkg);selector.records.find(r=>r.kind==='intervention_selector').sourceSignature='sha256:'+'0'.repeat(64);
 assert.throws(()=>verifyDeliveryInventory(selector),/Selector revision mismatch/);
 const orphan=structuredClone(pkg);orphan.records.find(r=>r.kind==='glossary_definition'&&r.usageReferences.length).usageReferences[0].recordId='absent';
 assert.throws(()=>verifyDeliveryInventory(orphan),/Invalid glossary usage/);
 assert.throws(()=>verifyDeliveryInventory(pkg,{readSource:path=>readFileSync(path,'utf8')+(path==='src/App.jsx'?'\nfunction newLearningSelector() {}':'')}),/Delivery source drift/);
});
test('delivered selector metadata and real lesson recommendation outputs resolve to catalogue kinds',()=>{
 const kinds=new Set(pkg.records.map(r=>r.kind));
 for(const s of readSelectors())for(const kind of s.selector.targetKinds)assert.ok(kinds.has(kind),kind);
 const lessons=new Set(pkg.records.filter(r=>r.kind==='lesson').map(r=>r.id));
 for(const q of bank.mcqs){const a=getDeepDiveRecommendations([q],{limit:2}),b=getDeepDiveRecommendations([q],{limit:2});assert.deepEqual(a,b);for(const result of a)assert.ok(lessons.has('lesson:'+result.id));}
});
test('separate signup starter revisions and explanations are retained without fabricated runtime identities',()=>{
 const starters=pkg.records.filter(r=>r.kind==='starter_question');assert.equal(starters.length,9);
 for(const r of starters){assert.equal(r.trustedRevisionId,null);assert.ok(pkg.records.some(x=>x.parentId===r.id&&x.kind==='explanation_bundle'));assert.ok(pkg.reviewQueue.some(x=>x.recordId===r.id&&x.reason==='starter_semantic_review'));}
 assert.equal(pkg.counts.unresolvedQuestionMappings,pkg.records.filter(r=>['mcq','pbq','starter_question'].includes(r.kind)&&!r.primaryConceptId).length);
});
