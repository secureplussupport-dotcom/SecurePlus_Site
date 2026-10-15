import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport,feedbackBundle} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {compileRevision,gradeRevision,learnerRevision} from '../server/adaptive/revision.mjs';
const scriptPath='scripts/audit-local-pbq-feedback-proof.mjs',packetPath='docs/drafts/phase-2b5-local-pbq-feedback-proof-proposals.json',reportPath='docs/phase-2b5-local-pbq-feedback-proof-review.md';
const basePath='docs/drafts/phase-2b5-unified-local-pbq-proof-proposals.json',baseReport='docs/phase-2b5-unified-local-pbq-proof-review.md',baseAudit='scripts/audit-unified-local-pbq-proof.mjs';
for(const[path,sha256]of [[basePath,'d3a3abc30f2385139665a45a41c0d76a52a364424d8e1f4158d8d3d33c6c2fc6'],[baseReport,'26332e360fc6c5edd203b8c763b100c9577be6c26df75592ff80c51117aa802f'],[baseAudit,'e0299479dde3277b8e5ac826a47724573ab790389ca2ed5dc6f960471961952f']])assert.equal(hashFile(path),sha256);
const c=readReviewTriage(),base=readJson(basePath);verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson('docs/phase-2b5-question-review-ledger.json'),c.ledger);
const firstPath='docs/drafts/phase-2b5-first-six-remaining-pbq-grammars-proposals.json',secondPath='docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json',first=readJson(firstPath),second=readJson(secondPath);
for(const path of [firstPath,secondPath])assert.equal(hashFile(path),base.sourceBindings.find(b=>b.path===path).sha256);
const oldIds=['p004','p011','p029','p041','p043','p046','p211'],slotIds=[...first.candidateRecordIds,...second.candidateRecordIds].filter(id=>!['pbq:p007','pbq:p030'].includes(id)).map(id=>id.slice(4));
const ids=[...oldIds,...slotIds],candidateRecordIds=ids.map(id=>'explanation:pbq:'+id),pairedRecordIds=ids.flatMap(id=>['pbq:'+id,'explanation:pbq:'+id]),candidates=ids.map(id=>c.questions.get('pbq:'+id));
assert.deepEqual(candidateRecordIds,LOCAL_PBQ_FEEDBACK_RECORD_IDS);assert.equal(candidateRecordIds.length,17);
const previous=new Set(c.pkg.records.filter(r=>!base.remainingCatalogueRecordIds.includes(r.id)).map(r=>r.id));assert.equal(previous.size,1694);
const inventory=[...base.allPacketReconciliation.inventory,{path:basePath,sha256:hashFile(basePath),substantiveRows:0}].sort((a,b)=>a.path.localeCompare(b.path));assert.equal(inventory.length,143);
const actual=readdirSync('docs/drafts').filter(n=>n.startsWith('phase-2b5-')&&n.endsWith('.json')).map(n=>'docs/drafts/'+n).filter(path=>path!==packetPath&&['questionProposals','explanationProposals','instructionalProposals'].some(k=>Array.isArray(readJson(path)[k]))).sort();assert.deepEqual(actual,inventory.map(r=>r.path).sort());
const refs=new Set(),distinctInstructions=new Set();let rawInstructions=0;
for(const b of inventory){assert.equal(hashFile(b.path),b.sha256);const p=readJson(b.path);verifySourceBindings(Array.isArray(p.sourceBindings)?p.sourceBindings:Object.entries(p.sourceBindings||{}).map(([path,sha256])=>({path,sha256})));const rows=['questionProposals','explanationProposals','instructionalProposals'].flatMap(k=>p[k]||[]);assert.equal(rows.length,b.substantiveRows);for(const r of rows){assert.equal(r.publishedRecordSignature??r.sourceRevision,c.records.get(r.recordId).sourceSignature);if(previous.has(r.recordId))refs.add(r.recordId);}for(const r of p.instructionalProposals||[]){rawInstructions++;distinctInstructions.add(r.recordId);}}
assert.deepEqual([...refs].sort(),[...previous].sort());assert.deepEqual([rawInstructions,distinctInstructions.size],[786,772]);
const priorHeldRows=base.priorHeldRows;assert.equal(priorHeldRows.length,181);assert.equal(new Set(priorHeldRows.map(r=>r.recordId)).size,181);assert.equal(base.deferredSelectedRows.length,0);
for(const r of priorHeldRows){assert.equal(c.records.get(r.recordId).sourceSignature,r.sourceRevision);assert.equal(sig(readJson(r.packetPath)[r.field].find(x=>x.recordId===r.recordId)),r.priorDispositionRevision);assert(!r.resolved&&!r.newCredit);}
const selectedPriorHoldReferences=priorHeldRows.filter(r=>pairedRecordIds.includes(r.recordId));assert.equal(selectedPriorHoldReferences.length,27);
for(const b of base.priorStateBindings)assert.equal(sig(readJson(b.packetPath)[b.field]),b.sourceRevision);
const inherited=readJson('docs/drafts/phase-2b5-remaining-routing-selectors-proposals.json').priorHoldBindings;assert.equal(inherited.length,752);for(const b of inherited){assert.equal(sig(readJson(b.packetPath)[b.field]),b.sourceRevision);assert(!b.resolved&&!b.newCredit);}

for(const id of candidateRecordIds)assert(!previous.has(id));assert.equal(pairedRecordIds.filter(id=>previous.has(id)).length,7);
const priorPairedReferences=pairedRecordIds.map(recordId=>({recordId,priorCreditObserved:previous.has(recordId),references:inventory.flatMap(b=>{const p=readJson(b.path);return ['questionProposals','explanationProposals'].flatMap(field=>(p[field]||[]).filter(r=>r.recordId===recordId).map(r=>({packetPath:b.path,field,dispositionRevision:sig(r),sourceRevision:r.publishedRecordSignature??r.sourceRevision,newCredit:0})));}),holdReference:priorHeldRows.find(h=>h.recordId===recordId)??null,newCredit:0}));
assert.deepEqual(priorPairedReferences.filter(r=>r.priorCreditObserved).map(r=>r.recordId),oldIds.map(id=>'pbq:'+id));
import {compileOfflinePbqFeedback,projectOfflinePbqFeedback,LOCAL_PBQ_FEEDBACK_VERSION,LOCAL_PBQ_FEEDBACK_RECORD_IDS,LOCAL_PBQ_FEEDBACK_ENABLED_BY_DEFAULT} from './lib/content-mapping/local-pbq-feedback-proof.mjs';
const modulePath='scripts/lib/content-mapping/local-pbq-feedback-proof.mjs',oldPath='docs/drafts/phase-2b5-seven-feedback-gap-recheck-proposals.json',old=readJson(oldPath),oldAudit='scripts/audit-older-pbq-feedback-gaps.mjs';
assert.equal(hashFile(oldPath),base.sourceBindings.find(b=>b.path===oldPath).sha256);
assert.deepEqual(old.candidateRecordIds,oldIds.map(id=>'explanation:pbq:'+id));
// Reuse pinned pure grading/teaching probes; no older writer, census or learner handler runs.
const reusedProbe=sourceUnit(oldAudit,'const unit=(a,b)=>','const semantic={');
assert.equal(hashFile(oldAudit),base.sourceBindings.find(b=>b.path===oldAudit).sha256);
const probes=Function('assert','readFileSync','sourceUnit','sig','hashFile','candidates','compileRevision','gradeRevision','learnerRevision','feedbackBundle',reusedProbe.code+';return {units,sourceChecks,gradingChecks,teachingChecks,legacy,feedback,stripHints,sim,exam,completedReview};')(assert,readFileSync,sourceUnit,sig,hashFile,oldIds.map(id=>c.questions.get('pbq:'+id)),compileRevision,gradeRevision,learnerRevision,feedbackBundle);
const {legacy,feedback,stripHints,sim,exam,completedReview}=probes;
assert(sim.includes('part.solution')&&sim.includes('Object.entries(q.selectionFeedback)'));
assert(completedReview.includes('blank.answer')&&!completedReview.includes('blank.explanation')&&!completedReview.includes('blank.solution')&&!completedReview.includes('selectionFeedback'));
assert(!completedReview.includes('content={q?.diagram'));
assert(exam.includes('content={q?.diagram || q?.payload?.evidence?.diagram}'));
const fresh=await import('./lib/content-mapping/local-pbq-feedback-proof.mjs?fresh-feedback-instance');
assert.equal(LOCAL_PBQ_FEEDBACK_ENABLED_BY_DEFAULT,false);
let invalidInputChecks=0,projectionCases=0,projectedViews=0,reusedValueCases=0,partValueCases=0,correctCases=0,beforeAnswerChecks=0,defaultOffChecks=0,freshInstanceChecks=0;
const rejectInput=fn=>{assert.throws(fn);invalidInputChecks++;};
const allow=(value,keys)=>assert.deepEqual(Object.keys(value).sort(),keys.slice().sort());
const recipeUnits=[sourceUnit('scripts/audit-first-six-remaining-pbq-grammars.mjs','const directions=','function slotProjection('),sourceUnit('scripts/audit-remaining-six-pbq-grammars.mjs','function candidateSource(','function slotProjection(')];
const recipes=recipeUnits.map(u=>Function('assert',u.code+';return candidateSource;')(assert));
const rows=[],proofs=[];
for(const s of candidates){
 const q=s.pub,recordId=s.feedback.id,proof=compileOfflinePbqFeedback(recordId,q,{enabled:true}),m=proof.model,native=q.id==='p211';proofs.push(proof);
 assert.equal(proof.parentRevision,s.record.sourceSignature);assert.equal(proof.feedbackRevision,s.feedback.sourceSignature);assert.equal(sig(feedbackBundle(q)),s.feedback.sourceSignature);assert.equal(sig(m),proof.modelRevision);
 assert.equal(m.authority.authored,s.authored?sig(s.authored):null);assert.equal(m.authority.preEditorial,sig(s.preQuestion));assert.equal(m.authority.local,s.record.localRevisionSignature);assert.equal(m.authority.snapshots,s.snapshots.length);assert.equal(m.authority.captures,s.captures.length);assert.equal(m.authority.captureBinding,sig(s.row.capturedOverrides));
 assert.equal(m.authority.candidate.applied,false);assert(!Object.hasOwn(proof,'originalPublished'));assert(!/[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/.test(JSON.stringify(proof)));
 assert.equal(compileOfflinePbqFeedback(recordId,q),null);assert.equal(projectOfflinePbqFeedback(proof,[],q),null);defaultOffChecks+=2;
 const good=m.parts.map(p=>({componentId:p.id,valueId:p.acceptedValueIds[0]})),before=JSON.stringify(q),caseStart=projectionCases,viewStart=projectedViews,invalidStart=invalidInputChecks;
 for(const mode of ['practice_before_answer','exam_before_answer']){assert.equal(projectOfflinePbqFeedback(proof,[],q,{enabled:true,mode}),null);assert.equal(projectOfflinePbqFeedback(proof,good,q,{enabled:true,mode}),null);beforeAnswerChecks+=2;}
 const viewDigests=[];
 function evaluate(selections){
  const authoredValues=native?{}:Object.fromEntries(q.blanks.map((b,i)=>[b.id,m.values.find(v=>v.id===selections.find(s=>s.componentId===m.parts[i].id).valueId).label]));
  const selected=native?q.choices.indexOf(m.values.find(v=>v.id===selections[0].valueId).label):null,r=legacy(q,authoredValues,selected);
  assert(r.can&&r.answered);let firstView;
  for(const mode of ['practice_after_answer','exam_completed_review']){
   const view=projectOfflinePbqFeedback(proof,selections,q,{enabled:true,mode});
   allow(view,['version','questionId','mode','modelRevision','context','main','correct','score','evidencePrecision','parts','definitions','eligibleEvidence','newCredit']);
   assert(!/"(?:authority|grading|gradingKey|acceptedValueIds|dependencies|originalPublished|payload|hint|email|learnerId)"\s*:/.test(JSON.stringify(view)));
   assert.equal(view.correct,r.whole);assert.equal(view.score,r.whole?1:0);assert.equal(view.eligibleEvidence,false);assert.equal(view.newCredit,0);assert.equal(view.main,q.explanation);assert.equal(view.mode,mode);
   assert.deepEqual(view.context,Object.fromEntries(['title','scenario','question','diagram'].filter(k=>typeof q[k]==='string'&&q[k].trim()).map(k=>[k,q[k]])));
   assert.deepEqual(view.definitions,m.values.map(({id,label,definition})=>({id,label,definition})));
   for(const [i,p]of view.parts.entries()){
    allow(p,['id','sentence','selectedValueId','selectedLabel','correct','correctLabel','solution','selectedDefinition','correctDefinition']);
    const actual=native?{correct:r.whole,prompt:q.question,solution:feedback.pbqFeedbackBody(q.optionFeedback[q.correct]),correctAnswer:q.choices[q.correct]}:r.parts[i];
    assert.equal(p.correct,actual.correct);assert.equal(p.sentence,actual.prompt);assert.equal(p.solution,actual.solution);assert.equal(p.correctLabel,actual.correctAnswer);
    const selectedDefinition=native?feedback.pbqFeedbackBody(q.optionFeedback[q.choices.indexOf(p.selectedLabel)]):q.selectionFeedback[p.selectedLabel];assert.equal(p.selectedDefinition,selectedDefinition);
    assert.equal(p.correctDefinition,native?actual.solution:q.selectionFeedback[p.correctLabel]);
   }
   if(firstView){assert.deepEqual({...view,mode:firstView.mode},firstView);}else firstView=view;
   viewDigests.push(sig(view));projectedViews++;
  }
  projectionCases++;correctCases+=Number(r.whole);return firstView;
 }
 const correctView=evaluate(good);assert(correctView.correct);
 if(native){for(const value of m.values){evaluate([{componentId:value.id,valueId:value.id}]);partValueCases++;}}
 else{
  for(const [i,p]of m.parts.entries())for(const value of m.values){evaluate(good.map((s,j)=>j===i?{componentId:p.id,valueId:value.id}:s));partValueCases++;}
  for(const value of m.values){evaluate(m.parts.map(p=>({componentId:p.id,valueId:value.id})));reusedValueCases++;}
 }
 const reordered=projectOfflinePbqFeedback(proof,[...good].reverse(),q,{enabled:true,mode:'exam_completed_review'});assert.deepEqual(reordered,correctView.mode==='exam_completed_review'?correctView:{...correctView,mode:'exam_completed_review'});
 const round=fresh.projectOfflinePbqFeedback(JSON.parse(JSON.stringify(proof)),JSON.parse(JSON.stringify(good)),JSON.parse(JSON.stringify(q)),{enabled:true,mode:'exam_completed_review'});assert.deepEqual(round,reordered);freshInstanceChecks++;
 for(const mutate of [p=>p.model.parts[0].solution='stale',p=>p.model.parts[0].acceptedValueIds=[p.model.values.find(v=>!p.model.parts[0].acceptedValueIds.includes(v.id)).id],p=>p.model.values[0].definition='stale',p=>p.model.context.scenario='stale',p=>p.model.main='stale',p=>p.model.authority.candidate.feedback='stale',p=>p.model.authority.authored='fabricated',p=>p.model.authority.origin='private',p=>p.model.dependencies.compiler='stale',p=>p.model.version='stale',p=>p.eligibleEvidence=true,p=>p.newCredit=1,p=>p.trustedRevisionId='invented']){
  const bad=structuredClone(proof);mutate(bad);rejectInput(()=>projectOfflinePbqFeedback(bad,good,q,{enabled:true,mode:'exam_completed_review'}));bad.modelRevision=sig(bad.model);rejectInput(()=>projectOfflinePbqFeedback(bad,good,q,{enabled:true,mode:'practice_after_answer'}));rejectInput(()=>projectOfflinePbqFeedback(bad,[],q,{enabled:true,mode:'exam_before_answer'}));
 }
 for(const field of ['explanation','scenario',native?'optionFeedback':'selectionFeedback','id']){const bad=structuredClone(q);bad[field]=field==='id'?'p999':'stale';rejectInput(()=>compileOfflinePbqFeedback(recordId,bad,{enabled:true}));rejectInput(()=>projectOfflinePbqFeedback(proof,good,bad,{enabled:true,mode:'exam_completed_review'}));}
 for(const bad of [[],good.slice(0,-1),[...good,good[0]],[{componentId:'unknown',valueId:'unknown'}],good.map((s,i)=>i? s:{...s,extra:'invented'}),null,{},[{...good[0],valueId:m.parts[0].id}]]){
  if(JSON.stringify(bad)===JSON.stringify(good))continue;rejectInput(()=>projectOfflinePbqFeedback(proof,bad,q,{enabled:true,mode:'exam_completed_review'}));
 }
 for(const options of [{enabled:'true',mode:'exam_completed_review'},{enabled:true,mode:'in_progress'},{enabled:true,mode:'exam_after_answer'},{enabled:true,mode:'exam_completed_review',complete:true}])rejectInput(()=>projectOfflinePbqFeedback(proof,good,q,options));
 rejectInput(()=>compileOfflinePbqFeedback(recordId,q,{enabled:true,private:true}));
 for(const mutate of [p=>p.payload={private:true},p=>p.privateVariant=true,p=>p.type='HOTSPOT',p=>{if(native)p.choices.reverse();else p.selectionOptions.reverse();},p=>{if(native)p.optionFeedback[0]='stale';else p.blanks[0].explanation='stale';},p=>{if(native)p.correct=0;else p.blanks.reverse();}]){const changed=structuredClone(q);mutate(changed);rejectInput(()=>compileOfflinePbqFeedback(recordId,changed,{enabled:true}));rejectInput(()=>projectOfflinePbqFeedback(proof,good,changed,{enabled:true,mode:'exam_completed_review'}));}
 if(!oldIds.includes(q.id)){
  const recipe=recipes[first.candidateRecordIds.includes(s.record.id)?0:1],draft=recipe(s);assert.equal(sig(draft),m.authority.candidate.parent);assert.equal(sig(feedbackBundle(draft)),m.authority.candidate.feedback);
  if(sig(draft)!==sig(q)){rejectInput(()=>compileOfflinePbqFeedback(recordId,draft,{enabled:true}));rejectInput(()=>projectOfflinePbqFeedback(proof,good,draft,{enabled:true,mode:'exam_completed_review'}));}
 }
 assert.equal(JSON.stringify(q),before);
 const unified=base.rows.find(r=>'explanation:'+r.recordId===recordId),retained=old.retainedFeedbackHoldBindings.find(r=>r.recordId===recordId),candidate=unified?readJson(unified.priorPacketPath).localRemediationProposals.find(r=>r.recordId===unified.recordId):null;
 assert.equal(m.authority.candidate.rowRevision,sig(candidate??retained));assert.equal(m.authority.candidate.parent,candidate?.candidatePublishedRevision??s.record.sourceSignature);assert.equal(m.authority.candidate.feedback,candidate?.candidateFeedbackRevision??s.feedback.sourceSignature);
 const held=priorHeldRows.find(h=>h.recordId===recordId);assert(held&&!held.resolved);
 rows.push({recordId,parentId:s.record.id,parentRevision:s.record.sourceSignature,feedbackRevision:s.feedback.sourceSignature,localRevision:s.record.localRevisionSignature,authoredRevision:s.authored?sig(s.authored):null,preEditorialRevision:sig(s.preQuestion),snapshotRows:s.snapshots.length,captureRows:s.captures.length,sourceOrigin:m.authority.origin,candidateBinding:m.authority.candidate,candidateTextApplied:false,proofRevision:proof.modelRevision,grammar:m.grammar,stableHelperIdentitiesPreserved:true,partCount:m.parts.length,valueCount:m.values.length,partTeachingRevision:sig(m.parts.map(p=>p.solution)),definitionTeachingRevision:sig(m.values.map(v=>v.definition)),contextRevision:sig(m.context),mainRevision:sig(m.main),projectedViews:projectedViews-viewStart,projectionCases:projectionCases-caseStart,invalidInputChecks:invalidInputChecks-invalidStart,projectionDigestsRevision:sig(viewDigests),preAnswerFeedbackNull:true,correctAndWrongSelectionTeaching:true,practiceAndCompletedExamProjectionEqual:true,actualPracticePartsAvailable:!native,actualPracticeDefinitionsAvailable:!native,actualCompletedExamPartsAvailable:false,actualCompletedExamDefinitionsAvailable:false,actualPracticeRequiredDiagramAvailable:native?false:null,actualCompletedExamRequiredDiagramAvailable:native?false:null,actualOptionRationalesAvailableInBothModes:native?true:null,offlineRequiredDiagramIncluded:native,semanticReviewReused:true,priorSemanticReference:unified?{packetPath:unified.priorPacketPath,rowRevision:unified.priorRowRevision,reason:unified.semanticHoldReason,retainedConcern:unified.priorCandidateConcern}:{packetPath:oldPath,rowRevision:sig(retained),reason:readJson(held.packetPath)[held.field].find(r=>r.recordId===recordId).reason},feedbackHoldReference:held,currentHoldResolved:false,newQuestionCredit:0,newFeedbackCredit:0,newCompletePairCredit:0,newFamilyCredit:0,humanApproved:false,activationAllowed:false});
}
assert.equal(rows.length,17);assert.equal(partValueCases,356);assert.equal(reusedValueCases,74);
// Neither private variants nor adjacent held/supported parents are accepted as substituted sources.
for(const id of ['private:pbq:p003','explanation:private:pbq:p003','explanation:pbq:p007','explanation:pbq:p030','explanation:pbq:p008','explanation:pbq:p022','pbq:p004'])rejectInput(()=>compileOfflinePbqFeedback(id,candidates[0].pub,{enabled:true}));
rejectInput(()=>projectOfflinePbqFeedback(proofs[0],[],candidates[1].pub,{enabled:true,mode:'exam_before_answer'}));
let getterCalls=0;const getter={};Object.defineProperty(getter,'id',{enumerable:true,get(){getterCalls++;return'p004';}});const cyclic={};cyclic.self=cyclic;const sparse=Array(2),hidden={};Object.defineProperty(hidden,'hidden',{value:1});const symbol={};symbol[Symbol('x')]=1;
for(const bad of [getter,cyclic,sparse,hidden,symbol,new Date(),{nan:NaN},{large:'x'.repeat(20001)},{fn:()=>1},{big:1n},{undefined:undefined}]){rejectInput(()=>compileOfflinePbqFeedback(candidateRecordIds[0],bad,{enabled:true}));rejectInput(()=>projectOfflinePbqFeedback(bad,[],candidates[0].pub,{enabled:true,mode:'exam_before_answer'}));}
assert.equal(getterCalls,0);
const totals={rows:17,selectorRows:16,nativeScenarioRows:1,parts:rows.reduce((n,r)=>n+r.partCount,0),definitions:rows.reduce((n,r)=>n+r.valueCount,0),partValueCases,reusedValueCases,projectionCases,projectedViews,correctCases,beforeAnswerChecks,defaultOffChecks,freshInstanceChecks,invalidInputChecks,reusedOlderFullResponseCases:59416};

rejectInput(()=>projectOfflinePbqFeedback(proofs[0],[{componentId:proofs[1].model.parts[0].id,valueId:proofs[1].model.values[0].id}],candidates[0].pub,{enabled:true,mode:'exam_completed_review'}));
rejectInput(()=>gradeRevision(proofs[0],[]));totals.invalidInputChecks=invalidInputChecks;
assert.equal([...c.questions.values()].filter(s=>s.record.trustedRevisionId).length,447);
const {resolve,dirname,relative}=await import('node:path'),{isBuiltin}=await import('node:module'),graph=new Set(),externalPackages=new Set();
function walkImports(path){const absolute=resolve(path);if(graph.has(absolute))return;graph.add(absolute);for(const match of readFileSync(absolute,'utf8').matchAll(/(?:^|\n)\s*import\s+(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]/g)){const name=match[1];if(isBuiltin(name))continue;if(name.startsWith('.'))walkImports(resolve(dirname(absolute),name));else externalPackages.add(name);}}
walkImports(modulePath);assert.equal(externalPackages.size,0);
const dependencyAudit={...base.dependencyAudit,newProofStaticImportGraph:[...graph].map(path=>relative(process.cwd(),path)).sort(),newProofExternalPackageImports:[],auditResultRecheckedAgainstSameLockfile:true};
assert.equal(hashFile(dependencyAudit.lockfilePath),dependencyAudit.lockfileSha256);assert.equal(hashFile(dependencyAudit.packagePath),dependencyAudit.packageSha256);
const bankIds=[...c.questions.keys()],bankReconciliation={...base.bankReconciliation,selectedPriorQuestions:7,selectedPriorFeedback:0,selectedPriorCompletePairs:0,selectedRemainingQuestions:10,selectedRemainingFeedback:17,selectedRemainingCompletePairs:17};
assert.deepEqual([bankIds.length,bankIds.filter(id=>previous.has(id)).length,bankIds.filter(id=>previous.has('explanation:'+id)).length,bankIds.filter(id=>previous.has(id)&&previous.has('explanation:'+id)).length],[483,463,464,456]);
const priorStateBindings=Object.keys(base).map(field=>({packetPath:basePath,field,sourceRevision:sig(base[field]),resolved:false,newCredit:0}));
const sourceBindings=[...new Map([...base.sourceBindings,...[basePath,baseReport,baseAudit,modulePath,scriptPath].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];assert.equal(sourceBindings.length,444);verifySourceBindings(sourceBindings);
const protectedFiles=readJson('docs/evidence/phase-2b5/release-checksums.json').files;assert.equal(Object.keys(protectedFiles).length,25);verifySourceBindings(Object.entries(protectedFiles).map(([path,sha256])=>({path,sha256})));
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p))){assert(!readFileSync(root+'/'+path,'utf8').includes('local-pbq-feedback-proof'),'Runtime import added');}
const contract={modulePath,moduleSha256:hashFile(modulePath),version:LOCAL_PBQ_FEEDBACK_VERSION,enabledByDefault:false,compileInterface:'compileOfflinePbqFeedback(recordId, published, {enabled:false})',projectionInterface:'projectOfflinePbqFeedback(proof, selections, published, {enabled:false,mode})',afterAnswerModes:['practice_after_answer','exam_completed_review'],beforeAnswerModes:['practice_before_answer','exam_before_answer'],beforeAnswerResult:null,sourceAuthority:'17_fixed_original_LOCAL_parent_and_feedback_fingerprints;candidate_revisions_bound_but_not_applied',modelContract:'internal_JSON_proof_with_source_teaching;no_original_payload_or_hypothetical_UUID;stateless_recompile_and_canonical_equality',grading:'reuse_unified_ten_existing_v2_six_and_native_p211;whole_binary_coarse_no_new_credit',learner:'allowlisted_plain_text_context_main_parts_and_option_definitions_after_answer_only',dependencies:proofs[0].model.dependencies,selectionDefinitionsAreSourceContrastsNotInventedPairwiseReasons:true,p041SemanticHoldPreserved:true,p223SnapshotAuthorshipDirectionHoldsPreserved:true,ownerSessionAuthorizationImplemented:false,persistenceImplemented:false,authenticatedCompletionImplemented:false,reactIntegrationImplemented:false,activeImportGraphChanged:false,newTrustedCredit:0,activationAllowed:false};
const packet={schemaVersion:1,status:'LOCAL_SOURCE_BOUND_AFTER_ANSWER_PBQ_FEEDBACK_V1_VIABLE_DELIVERY_PROOF_ALL_HOLDS_NOT_READY',baselineCommit:'879254e41a00f361aea6bba8e7724450fdb94935',authority:{...base.authority,scope:'Exactly seventeen held feedback identities; shared LOCAL after-answer projection only, existing semantic reviews reused'},sourceBindings,allPacketReconciliation:{inventory,priorReconciliationBinding:{packetPath:basePath,sourceRevision:sig(base.allPacketReconciliation),newCredit:0}},instructionalReconciliation:base.instructionalReconciliation,candidateRecordIds,pairedRecordIds,selectedRecordIds:[],questionProposals:[],explanationProposals:[],instructionalProposals:[],deferredSelectedRows:[],selectionBinding:{olderPacketPath:oldPath,olderSelectionRevision:sig(old.candidateRecordIds),unifiedPacketPath:basePath,unifiedRowsRevision:sig(base.rows),omittedPreviouslyQualifiedFeedback:['explanation:pbq:p007','explanation:pbq:p030'],selectedRecordIdsRevision:sig(candidateRecordIds)},contract,rows,totals,bankReconciliation,priorPairedReferences,selectedPriorHoldReferences,separateParentHolds:base.separateParentHolds,dependencyAudit,probeSourceBindings:[reusedProbe.provenance,...recipeUnits.map(u=>u.provenance),...probes.units.map(u=>u.provenance)],reusedOlderProbeResults:{sourceChecksRevision:sig(probes.sourceChecks),gradingChecksRevision:sig(probes.gradingChecks),teachingChecksRevision:sig(probes.teachingChecks),completeResponseCases:59416,semanticReviewsRepeated:0},currentDeliveryComparison:{sourceDerivedPureGradingExecuted:true,practicePartSolutionsAndDefinitions:true,completedExamPartSolutionsAndDefinitions:false,p211OptionBodiesPresentInBothContexts:true,p211RequiredDiagramInPractice:false,p211RequiredDiagramInCompletedReview:false,p211RequiredDiagramInExamAnswering:true,offlineProjectionRetainsPartAndDefinitionText:true,offlineProjectionRetainsP211Diagram:true,reactRendered:false,learnerHandlersExecuted:false,browserObserved:false,currentDeliveryRepaired:false},candidateProgress:{offlineFeedbackProjectionRows:17,sourceSpecificParts:75,actualRuntimeDeliveryGapsRepaired:0,newLocalNativeGrammars:0,newCurrentQuestionCredit:0,newFeedbackCredit:0,newCompletePairCredit:0,currentHoldsResolved:0},catalogueProgress:{...base.catalogueProgress,selectedHeldRows:17},catalogueCensusBinding:base.catalogueCensusBinding,priorPageDispositionOverrides:base.priorPageDispositionOverrides,objectiveCoverageBinding:base.objectiveCoverageBinding,newObjectiveMemberships:0,newAllSourceObjectiveMemberships:0,remainingCatalogueRecordIds:base.remainingCatalogueRecordIds,supportProgress:base.supportProgress,bankProgress:base.bankProgress,remainingBankQuestions:base.remainingBankQuestions,remainingBankFeedback:base.remainingBankFeedback,remainingCompletePairRecordIds:base.remainingCompletePairRecordIds,feedbackOnHeldParents:base.feedbackOnHeldParents,feedbackOnUnreviewedUnsupportedParents:base.feedbackOnUnreviewedUnsupportedParents,starterProgress:base.starterProgress,guestProgress:base.guestProgress,glossaryProgress:base.glossaryProgress,containerProgress:base.containerProgress,priorStateBindings,priorInheritedFieldBindingsVerified:752,priorHeldRows,newDistinctHeldRecordIds:[],totalDistinctHeldRecords:181,inspectedQuestions:17,pairedFeedbackRecords:17,currentHoldsResolved:0,newCompletePairCredit:0,canonicalBoundary:base.canonicalBoundary,activePackageUnchanged:base.activePackageUnchanged,knownSavedMixedSetRestoreObservation:base.knownSavedMixedSetRestoreObservation,triageLedgerBinding:base.triageLedgerBinding,sourceSelectionBinding:base.sourceSelectionBinding,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,newTrustedCredit:0,newTrustedRevisionIds:[],newFamilyCredit:0,privatePayloadIncluded:false,privatePayloadFetched:false,privateCompiledHere:false,learnerRuntimeObserved:false,productionAction:false,phase3Work:false,unchangedReleaseHashes:25};
let expectedMutations,negativeMutationChecks=0;
function validate(v){assertSafeReviewExport(v);const{negativeMutationChecks,...body}=v;assert(isDeepStrictEqual(body,packet),'Feedback/source/selection/delivery/hold or credit drift');if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,expectedMutations);}
const reject=fn=>{const bad=structuredClone(packet);fn(bad);assert(!isDeepStrictEqual(bad,packet));assert.throws(()=>validate(bad));negativeMutationChecks++;};validate(packet);
for(let i=0;i<17;i++){for(const field of ['parentRevision','feedbackRevision','localRevision','authoredRevision','proofRevision','partTeachingRevision','definitionTeachingRevision','projectionDigestsRevision'])reject(p=>p.rows[i][field]='stale');for(const field of ['candidateTextApplied','currentHoldResolved','humanApproved','activationAllowed'])reject(p=>p.rows[i][field]=true);reject(p=>p.rows[i].newFeedbackCredit=1);reject(p=>p.rows[i].candidateBinding.feedback='stale');reject(p=>p.rows[i].projectionCases--);}
for(let i=0;i<181;i++)reject(p=>p.priorHeldRows[i].resolved=true);
for(let i=0;i<sourceBindings.length;i++)reject(p=>p.sourceBindings[i].sha256='stale');
for(let i=0;i<priorStateBindings.length;i++)reject(p=>p.priorStateBindings[i].sourceRevision='stale');
for(const field of ['humanApproved','published','activationAllowed','privatePayloadFetched','productionAction','phase3Work'])reject(p=>p[field]=true);
for(const field of ['newTrustedCredit','newFamilyCredit','masteryWeight','currentHoldsResolved','newObjectiveMemberships'])reject(p=>p[field]=1);
for(const field of ['newQuestions','newFullFeedback','newCompletePairs'])reject(p=>p.bankReconciliation[field]=1);
reject(p=>p.candidateRecordIds.reverse());reject(p=>p.contract.enabledByDefault=true);reject(p=>p.contract.p041SemanticHoldPreserved=false);reject(p=>p.contract.p223SnapshotAuthorshipDirectionHoldsPreserved=false);reject(p=>p.currentDeliveryComparison.currentDeliveryRepaired=true);reject(p=>p.dependencyAudit.nativeAuditClean=true);reject(p=>p.learnerId='synthetic');reject(p=>p.payload={private:true});
expectedMutations=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));
const sections=rows.map((r,i)=>`### ${i+1}. ${r.recordId}

Parent published: \`${r.parentRevision}\`; LOCAL effective: \`${r.localRevision}\`.
Feedback: \`${r.feedbackRevision}\`; authored: ${r.authoredRevision?'`'+r.authoredRevision+'`':'**null: captured snapshot only**'}; snapshot/capture rows:${r.snapshotRows}/${r.captureRows}.
Bound prior candidate parent/feedback: \`${r.candidateBinding.parent}\` / \`${r.candidateBinding.feedback}\`. Candidate row \`${r.candidateBinding.rowRevision}\` in \`${r.candidateBinding.packetPath}\`; candidate text is not applied.
New proof: \`${r.proofRevision}\`; ${r.partCount} parts, ${r.valueCount} offered values; ${r.projectionCases} focused response cases and ${r.projectedViews} after-answer views.

**Retained boundary, reused from the prior review:** ${r.priorSemanticReference.reason}${r.priorSemanticReference.retainedConcern?' '+r.priorSemanticReference.retainedConcern:''}

${r.grammar==='single_choice'?'Current practice and completed Exam already contain all four option bodies but omit the required diagram; the offline projection carries that exact diagram and all four bodies.':'Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text.'} Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.
`).join('\n');
const report=`# Phase 2B-5 — shared offline after-answer PBQ feedback proof

**VIABLE AS A SOURCE-BOUND DELIVERY PROOF; NOT READY FOR RUNTIME OR LEARNING ACTIVATION.** Baseline:879254e41a00f361aea6bba8e7724450fdb94935. Exactly17 held feedback identities: the seven older question-only gaps p004,p011,p029,p041,p043,p046,p211 plus ten slot rows p012,p019,p035,p056,p061,p067,p073,p077,p079,p223. The approved master plan remains product authority; Phase1 audit supplies historical current-state evidence. No unresolved product conflict changes behavior in this offline slice.

The new module is one shared compile/project contract reusing feedbackBundle, the unified local PBQ proof for ten rows, existing select-fill-v2 for six older rows and native whole-choice grading for p211. Existing helpers, active content and all181 holds are unchanged. Prior semantic reviews are bound and reused; zero new semantic reviews or feedback qualifications are claimed. p007/p030 retain their previously bounded feedback credit and are excluded; p008/p022 remain separately held.

## What the proof adds

compileOfflinePbqFeedback(recordId,published,{enabled:true}) returns an internal versioned JSON proof bound to fixed original LOCAL parent and feedback fingerprints, publication-stage provenance, prior candidate parent/feedback/row fingerprints and exact compiler/helper sources. It retains no raw originalPublished object or hypothetical trusted UUID. The internal model contains expected values and teaching; never send it before an answer.

projectOfflinePbqFeedback(proof,selections,published,{enabled:true,mode}) accepts practice_after_answer or exam_completed_review for teaching. Both require a valid complete stable selection, recompile the exact original source, and compare the entire proof beyond its recomputed checksum. practice_before_answer and exam_before_answer return null, even for a correct selection. All operations default off. Unknown options/modes, changed sources, changed/rehashed proofs and malformed selections fail closed; empty/incomplete completed responses are rejected. JSON limits reject getters without execution, non-JSON/hidden/symbol data, cycles, sparse arrays and excessive payloads.

After-answer output is an explicit plain-text allowlist: source context/main, each part's selected/correct labels, source solution and selected/correct option definitions, plus all offered definitions. Correct and plausible wrong selections receive the source-specific contrast; **juxtaposed source definitions are not newly authored pair-specific causal explanations**. Source slot order, stable helper IDs, offered-value restrictions, aliases and reusable values are preserved. No mandatory bijection or partial mastery is introduced. p211 carries its exact requirements diagram and all four source option bodies; no new scenario premise is invented.

Modes are caller declarations in an offline proof. No owner/session authorization, authenticated completed-exam gate, persisted submission, UI integration, escaping renderer or analytics/entitlement flow is implemented. A future trusted caller must authorize completion and render the plain text safely. This is not a production API or a way to grant learner access to feedback.

## Current delivery compared with the offline proposal

| Context | Sixteen selector rows | p211 SCENARIO |
|---|---|---|
| Current practice after answer | Part rationales/corrections plus option definitions | All4 option bodies; required diagram absent |
| Current completed expanded Exam | Prompt/selected/correction labels; no part rationale or definitions | All4 option bodies; required diagram absent |
| Proposed offline after-answer, both modes | Exact part rationales and selected/correct/all-option definitions | Exact requirements diagram and all4 option bodies |
| Proposed feedback before answer | null | null |

The audit executes pinned source-derived pure practice/Exam graders and existing feedback-body functions, and binds the actual JSX branches that include/omit each field. It does not render React, operate submit handlers or observe a browser. The protected current application remains unchanged, so its delivery gap is **not repaired in runtime**. Correct match/label recognition and content delivery do not establish learning, transfer or recovery.

## Exact row bindings and unresolved blockers

${sections}

p041's mixed/overlapping data-state and primary-protection judgment is preserved; carrying more teaching does not make those contexts exclusive. p223 still has no authored source, one snapshot/capture and the observed-pattern versus name-to-pattern direction mismatch; no authorship is inferred and its pending candidate is not adopted. Other parent taxonomy, categorical-control, access-model, zone/contract/efficacy scope, family and full-teaching holds retain their prior evidence. The common subset proved across all17 is **source-faithful offline delivery**, not complete semantic qualification.

## Verification and limits

- Initial contract check failed with module-not-found; implementation then passed all17 rows.
- ${totals.projectionCases} focused response cases /${totals.projectedViews} after-answer projections, including356 part/value branches and74 whole responses reusing one offered value in every slot. All75 source-specific parts and78 offered-value definitions match their pinned source teaching; both after-answer modes agree.
- ${totals.beforeAnswerChecks} null pre-answer checks,${totals.defaultOffChecks} default-off checks and17 JSON round trips through a fresh module instance. Source order, stable IDs and selection-order independence are asserted.
- ${totals.invalidInputChecks} rejected invalid/tampered inputs: source/private/candidate/array/text drift, recomputed proof checksums, key/rationale/provenance/version changes, foreign/missing/duplicate/wrong-role selections, bad modes/options and bounded JSON failures. No getter executes.
- Reused pinned older probes enumerate59,416 complete offered responses and compare native grading/part teaching, aliases and incomplete response boundaries. New focused projection tests do not claim exhaustive enumeration of every projected combination. Whole/coarse results match legacy; partial-ratio UI and incomplete Exam lifecycle remain untouched.
- ${negativeMutationChecks} altered packets rejected;143 prior packets,752 inherited fields,${priorStateBindings.length} immediate baseline fields,444 source fingerprints and25 protected release files reconcile. All447 native-supported revisions remain observed; new native support/trusted credit is zero.
- Required delivery gates: all29 mapping tests and exact package reproduction; deterministic packet/report recheck; git diff --check; skip-deploy exit0/control1; exact task-only commit/push and remote-byte verification, empty index and eight unrelated dirty entries preserved.

Read-only npm audit against the same pinned lockfile again exits1:7 existing advisories, including1 critical and4 high. The new module's inspected ${graph.size}-file static Node/data import path imports zero external packages; none of the advisory packages is in that path. No dependency change or project-wide security clearance is claimed.

## Prior, new and remaining

| Bank measure | Prior | New | Combined / total | Remaining |
|---|---:|---:|---:|---:|
| Questions |463|0|463/483|20|
| Full feedback |464|0|464/483|19|
| COMPLETE pairs |456|0|456/483|27|

| Within these seventeen pairs | Prior | New | Combined /17 | Remaining |
|---|---:|---:|---:|---:|
| Questions |7|0|7/17|10|
| Full feedback |0|0|0/17|17|
| COMPLETE pairs |0|0|0/17|17|

Catalogue1694/1878, remaining184; support748/834, remaining86; instructional786 raw/772 distinct/14 repeats. All181 existing holds remain exact:27 selected parent/feedback holds and154 others, zero additions or resolutions. No new canonical, objective, concept, difficulty, skill, family, teaching-link, human-review, mastery, trusted or activation credit.

No protected compiler/helper, active/runtime content, existing import statement, private/database payload, live/browser action, deployment, automation or Phase3 work. **OFFLINE DELIVERY PROOF ONLY; ALL CURRENT FEEDBACK HOLDS REMAIN.**
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report);
console.log(JSON.stringify({status:packet.status,version:LOCAL_PBQ_FEEDBACK_VERSION,...totals,negativeMutationChecks,sourceBindings:sourceBindings.length,priorPackets:inventory.length,priorInheritedFields:752,baselineStateBindings:priorStateBindings.length,nativeSupportedRevisionsReconciled:447,newQuestionCredit:0,newFeedbackCredit:0,newCompletePairs:0,currentHoldsResolved:0,totalDistinctHolds:181,catalogueDispositions:1694,catalogueRemaining:184,bankQuestions:463,bankFeedback:464,bankCompletePairs:456,remainingQuestions:20,remainingFeedback:19,remainingCompletePairs:27,existingDependencyAdvisories:7,proofExternalPackageImports:0,sha256:Object.fromEntries([modulePath,scriptPath,packetPath,reportPath].map(path=>[path,hashFile(path)]))}));
