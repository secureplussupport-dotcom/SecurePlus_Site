import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport,feedbackBundle} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {readPbqEnhancer} from './lib/read-authored-bank.mjs';
import {PBQ_REVIEW} from '../src/data/sy0701PbqReview.js';
import {compileRevision,gradeRevision,learnerRevision} from '../server/adaptive/revision.mjs';

const scriptPath='scripts/audit-hotspot-pbq-remediation.mjs';
const packetPath='docs/drafts/phase-2b5-hotspot-pbq-remediation-proposals.json';
const reportPath='docs/phase-2b5-hotspot-pbq-remediation-review.md';
const basePath='docs/drafts/phase-2b5-remaining-routing-selectors-proposals.json';
const baseReport='docs/phase-2b5-remaining-routing-selectors-review.md';
const baseAudit='scripts/audit-remaining-routing-selectors.mjs';
const designPath='docs/drafts/phase-2b5-unsupported-pbq-remediation-design.json';
const feedbackPath='docs/drafts/phase-2b5-seven-critical-pbq-feedback-proposals.json';
for(const [path,sha256] of [
  [basePath,'aea9830ffdc0632c4658546718885ce6f3e6acdd328b6972d15f1aaa39d9b042'],
  [baseReport,'1937c80175407242381cb32eec4f8760b7c68f2cd015ee6ccf1845d735c0b8a9'],
  [baseAudit,'10d0c870af8bd304db79da769c08974695324f3a27ec3e99535b0ed559169b1a'],
  [designPath,'754c40a982e0bc0b8c031493fde678b159f54a5fd1120d7a777bf0564d90ab99'],
  [feedbackPath,'25d3b76e67fb9e4a0f5dd4d946b8192939b1cd61e0b09657ad06a09cf50018be'],
])assert.equal(hashFile(path),sha256);
const c=readReviewTriage(),base=readJson(basePath),priorFeedback=readJson(feedbackPath);
verifySourceBindings(base.sourceBindings);
assert.deepEqual(readJson('docs/phase-2b5-question-review-ledger.json'),c.ledger);
const ids=['p007','p008','p022','p030'],candidates=ids.map(id=>c.questions.get('pbq:'+id));
const candidateRecordIds=candidates.flatMap(s=>[s.record.id,s.feedback.id]).sort();
const previous=new Set(c.pkg.records.filter(r=>!base.remainingCatalogueRecordIds.includes(r.id)).map(r=>r.id));
assert.equal(previous.size,1688);
assert.deepEqual(candidateRecordIds.filter(id=>previous.has(id)),['explanation:pbq:p007','explanation:pbq:p008','explanation:pbq:p030']);
assert.deepEqual([c.ledger.rows.filter(r=>previous.has(r.recordId)).length,c.ledger.rows.filter(r=>previous.has('explanation:'+r.recordId)).length,c.ledger.rows.filter(r=>previous.has(r.recordId)&&previous.has('explanation:'+r.recordId)).length],[463,464,456]);

// Carry source-bound dispositions, not copies of the full prior catalogue census.
const inventory=[...base.allPacketReconciliation.inventory,{path:basePath,sha256:hashFile(basePath),substantiveRows:5}].sort((a,b)=>a.path.localeCompare(b.path));
const actual=readdirSync('docs/drafts').filter(n=>n.startsWith('phase-2b5-')&&n.endsWith('.json')).map(n=>'docs/drafts/'+n).filter(path=>path!==packetPath&&['questionProposals','explanationProposals','instructionalProposals'].some(k=>Array.isArray(readJson(path)[k]))).sort();
assert.equal(inventory.length,129);assert.deepEqual(actual,inventory.map(r=>r.path).sort());
const refs=new Set();let rawInstructions=0;const distinctInstructions=new Set();
for(const binding of inventory){
  assert.equal(hashFile(binding.path),binding.sha256);
  const p=readJson(binding.path),rows=['questionProposals','explanationProposals','instructionalProposals'].flatMap(k=>p[k]||[]);
  verifySourceBindings(Array.isArray(p.sourceBindings)?p.sourceBindings:Object.entries(p.sourceBindings||{}).map(([path,sha256])=>({path,sha256})));
  assert.equal(rows.length,binding.substantiveRows);
  for(const r of rows){assert.equal(r.publishedRecordSignature??r.sourceRevision,c.records.get(r.recordId).sourceSignature);if(previous.has(r.recordId))refs.add(r.recordId);}
  for(const r of p.instructionalProposals||[]){rawInstructions++;distinctInstructions.add(r.recordId);}
}
assert.deepEqual([...refs].sort(),[...previous].sort());
assert.deepEqual([rawInstructions,distinctInstructions.size],[780,766]);
const priorHeldRows=[...base.priorHeldRows,...base.deferredSelectedRows.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,priorDispositionRevision:sig(r),packetPath:basePath,field:'deferredSelectedRows',status:r.status,resolved:false,newCredit:0}))];
assert.equal(priorHeldRows.length,169);assert.equal(new Set(priorHeldRows.map(r=>r.recordId)).size,169);
for(const r of priorHeldRows){assert.equal(c.records.get(r.recordId).sourceSignature,r.sourceRevision);assert.equal(sig(readJson(r.packetPath)[r.field].find(x=>x.recordId===r.recordId)),r.priorDispositionRevision);assert(!r.resolved&&!r.newCredit);}
for(const r of base.priorHoldBindings){assert.equal(sig(readJson(r.packetPath)[r.field]),r.sourceRevision);assert(!r.resolved&&!r.newCredit);}
const inheritedFields=['priorHoldBindings','priorHeldRows','deferredSelectedRows','instructionalProposals','sourceChecks','catalogueCensus','objectiveCoverage','remainingCatalogueRecordIds','remainingBankQuestions','remainingBankFeedback','remainingCompletePairRecordIds','feedbackOnHeldParents','feedbackOnUnreviewedUnsupportedParents','bankProgress','supportProgress','canonicalBoundary','activePackageUnchanged','instructionalReconciliation','knownSavedMixedSetRestoreObservation'];
const priorStateBindings=inheritedFields.map(field=>({packetPath:basePath,field,sourceRevision:sig(base[field]),resolved:false,newCredit:0}));
const reuseSpecs=[[designPath,['projectionChecks','rows']],[feedbackPath,['sourceChecks','sourceDerivedGradingChecks','teachingBundleChecks','alternateResponseChecks','explanationProposals','deferredSelectedRows','sharedRemediation']]];
const reusedEvidence=reuseSpecs.flatMap(([path,fields])=>{const p=readJson(path);return fields.map(field=>{assert(Object.hasOwn(p,field));return{packetPath:path,field,sourceRevision:sig(p[field]),currentSourcePinsVerified:true,approvalTransferred:false,newCredit:0};});});

// Execute the already-reviewed pure source probes; never a submit or save handler.
const probePath='scripts/audit-older-pbq-feedback-gaps.mjs';
const probeUnit=sourceUnit(probePath,'const unit=(a,b)=>','const appLines=');
assert.equal(hashFile(probePath),base.sourceBindings.find(b=>b.path===probePath).sha256);
const {units,legacy,feedback,stripHints,initAnswer,sim,exam,completedReview,can,examAnswered,correctBlank}=Function('sourceUnit','assert',probeUnit.code+';return {units,legacy,feedback,stripHints,initAnswer,sim,exam,completedReview,can,examAnswered,correctBlank};')(sourceUnit,assert);
assert(!sim.includes('q.hotspots')&&!exam.includes('q.hotspots'));
assert(!completedReview.includes('content={q?.diagram'));
const captures=[...c.questions.values()].flatMap(s=>s.captures);
const published=publicationPipeline(c.bank).overrides(captures).pbqs;
const citationPaths=['src/App.jsx','src/data/sy0701PbqReview.js','src/data/sy0701SecondPassReview.js','src/data/sy0701ConciseExplanations.js','src/data/sy0701PublishedSnapshot.js'];
const citations=id=>citationPaths.flatMap(path=>readFileSync(path,'utf8').split('\n').flatMap((line,index)=>{
  const pattern=['src/App.jsx','src/data/sy0701PublishedSnapshot.js'].includes(path)?new RegExp('(?:\\bid\\s*:\\s*"'+id+'"|"(?:id|question_id)"\\s*:\\s*"'+id+'")'):new RegExp('^\\s*(?:'+id+'\\s*:|"'+id+'"\\s*:)');
  return pattern.test(line)?[{path,line:index+1,anchorRevision:sig(line),fileSha256:hashFile(path)}]:[];
}));
const sourceChecks=candidates.map(s=>{
  assert(s.authored);assert.equal(s.q.type,'HOTSPOT');
  assert.equal(sig(s.q),s.record.localRevisionSignature);assert.equal(sig(s.pub),s.record.sourceSignature);
  assert.equal(sig(published.find(q=>q.id===s.q.id)),s.record.sourceSignature);
  assert.equal(sig(feedbackBundle(s.q)),s.feedback.sourceSignature);
  assert.equal(s.record.trustedRevisionId,null);assert.equal(s.feedback.trustedRevisionId,null);
  assert.throws(()=>compileRevision(s.pub,'pbq'),{message:'Unsupported question field: hotspots'});
  assert.equal(s.captures.length,s.q.id==='p030'?1:0);assert.equal(s.snapshots.length,s.captures.length);
  assert.equal(sig(s.authored)===sig(s.preQuestion),s.q.id!=='p030');
  assert.equal(c.pkg.records.filter(r=>r.id.startsWith('private:')&&r.id.endsWith(':'+s.q.id)).length,0);
  const prior=priorFeedback.sourceChecks.find(r=>r.recordId===s.feedback.id);
  assert.equal(prior.parentPublishedRevision,s.record.sourceSignature);assert.equal(prior.sourceRevision,s.feedback.sourceSignature);
  const fields=['type','scenario','question','diagram','hotspots','choices','options','correct','explanation','wrongFeedback','optionFeedback','difficulty'];
  return{recordId:s.record.id,feedbackRecordId:s.feedback.id,sourceRevision:s.record.sourceSignature,feedbackRevision:s.feedback.sourceSignature,revisions:s.row.revisions,sourceCitations:citations(s.q.id),fieldRevisions:fields.map(field=>({fieldPath:field,authored:sig(s.authored[field]??null),preeditorial:sig(s.preQuestion[field]??null),effective:sig(s.q[field]??null),published:sig(s.pub[field]??null)})),capturedOverrideBindings:s.row.capturedOverrides,selectedCaptureCount:s.captures.length,selectedSnapshotCount:s.snapshots.length,exactOriginalCompilerError:'Unsupported question field: hotspots',trustedRevisionObserved:null,privateAlternatives:[],privatePayloadRead:false};
});
assert.equal(sourceChecks[3].capturedOverrideBindings[0].payloadFingerprint,'e1eb5f73d90207ec1b2cde42478a58a6757bbee63845c263ae04dff89e7b54fe');
const cloud=candidates[2].q;
assert(cloud.choices[3].includes('Application layer')&&cloud.wrongFeedback[3].includes('not IAM'));
assert(cloud.hotspots[2].label.includes('Application Data')&&cloud.hotspots[3].label.includes('IAM'));
assert(!cloud.diagram.includes('[ Runtime / Middleware   ]  ← [C]'));

// Exact local editorial text only. It is never merged into the active publication pipeline.
const cloudDiagram=`CLOUD PROVIDER RESPONSIBILITY — supplied unmanaged IaaS agreement
[ Physical Data Centre ]
[ Network Hardware ]
[ Servers / Compute ]
[ Storage Hardware ]
[ Virtualisation Layer ]  ← [A]
━━━━━━━━━━━━━━━━━━━━━━━
CUSTOMER RESPONSIBILITY — guest software under this agreement
[ Guest Operating System ]  ← [B]
[ Runtime / Middleware ]    ← [C]
[ Application Code ]        ← [D]
[ Application Data ]
[ End Users / IAM ]
Additional managed services may use a different allocation.`;
const cloudCorrections={
  1:'Under the supplied unmanaged IaaS agreement, the customer manages the guest operating system. The highest provider-managed compute layer shown is the hypervisor beneath it.',
  2:'The runtime or middleware is customer-managed guest software under this agreement. It is above the provider-managed hypervisor, so it is not the highest provider-managed compute layer.',
  3:'The application layer is the customer code above the runtime and guest OS. This agreement assigns that guest software to the customer; the highest provider-managed compute layer shown is the hypervisor.',
};
const editorialDrafts=candidates.map(s=>({recordId:s.record.id,sourceRevision:s.record.sourceSignature,feedbackRevision:s.feedback.sourceSignature,policyVersion:'local-hotspot-whole-choice-candidate-v1',status:'DRAFT_ONLY_NOT_ACTIVE_NOT_APPROVED',operations:[{operation:'remove',fieldPath:'hotspots',beforeRevision:sig(s.pub.hotspots),purpose:'Retire ignored metadata only in the pinned diagnostic compilation candidate; retain the original source and its revision.'},...(s.q.id==='p022'?[{operation:'replace',fieldPath:'diagram',beforeRevision:sig(s.q.diagram),replacementText:cloudDiagram,proposedAuthoringLocation:'src/data/sy0701PbqReview.js:PBQ_REVIEW.p022.diagram'},...Object.entries(cloudCorrections).map(([index,text])=>({operation:'replace',fieldPath:'wrongFeedback.'+index,beforeRevision:sig(s.q.wrongFeedback[index]),replacementText:text,proposedAuthoringLocation:'src/data/sy0701ConciseExplanations.js:CONCISE_PBQ_REVIEW.p022.wrongFeedback.'+index}))]:[])],changesOfferedChoiceOrKey:false,activeHoldResolved:false,newCredit:0}));
const draftMap=structuredClone(PBQ_REVIEW);
draftMap.p022={...draftMap.p022,diagram:cloudDiagram,wrongFeedback:cloudCorrections};
const reviewPath='src/data/sy0701PbqReview.js',reviewText=readFileSync(reviewPath,'utf8');
const editorialCode=reviewText.slice(reviewText.indexOf('export function applyPbqEditorialReview(')).replace(/^export /,'');
assert(editorialCode.endsWith('\n'));assert(editorialCode.includes('next.optionFeedback = Object.fromEntries'));
const draftReview=Function('PBQ_REVIEW',editorialCode+';return applyPbqEditorialReview;')(draftMap);
const enhance=readPbqEnhancer();
const naiveCorrection=enhance({...cloud,wrongFeedback:{...cloud.wrongFeedback,3:cloudCorrections[3]}});
assert.equal(naiveCorrection.wrongFeedback[3],cloud.wrongFeedback[3]);
assert.notEqual(naiveCorrection.wrongFeedback[3],cloudCorrections[3]);
const precedenceCounterexample={recordId:'pbq:p022',wrongFeedbackOnlyPatchBeforeEnhancerRetainsStaleOptionAlias:true,activeCorrectionRevision:sig(cloud.wrongFeedback[3]),intendedCandidateCorrectionRevision:sig(cloudCorrections[3]),naiveEffectiveCorrectionRevision:sig(naiveCorrection.wrongFeedback[3]),finalEditorialAliasRegenerationRequired:true,activeSourceChanged:false};
const draftBank={...c.bank,pbqs:c.bank.pbqs.map(q=>ids.includes(q.id)?enhance(draftReview(c.questions.get('pbq:'+q.id).preQuestion)):q)};
const draftPublished=publicationPipeline(draftBank).overrides(captures).pbqs;
const compilerSource=readFileSync('server/adaptive/revision.mjs','utf8');
assert(compilerSource.includes("'diagram', 'hint'"));
// The existing learner projection copies diagram text, including answer-bearing prose.
const before=compileRevision(Object.fromEntries(Object.entries(candidates[0].pub).filter(([k])=>k!=='hotspots')),'pbq');
assert.equal(learnerRevision(before).diagram,candidates[0].q.diagram);
const defaultEnabled=false;
function project(recordId,source,draft,{enabled=defaultEnabled}={}){
  if(!enabled)return null;
  const s=candidates.find(s=>s.record.id===recordId);assert(s,'Finite LOCAL allowlist required');
  assert.equal(sig(source),s.record.sourceSignature,'Exact original published source required');
  assert.deepEqual(draft,editorialDrafts.find(d=>d.recordId===recordId),'Exact reviewed local draft required');
  assert.equal(source.type,'HOTSPOT');assert(source.diagram?.trim());assert.deepEqual(source.options,source.choices);
  assert.equal(source.hotspots.length,source.choices.length);
  assert.equal(new Set(source.hotspots.map(h=>h.id)).size,source.hotspots.length);
  assert(source.hotspots.every(h=>typeof h.correct==='boolean'));
  assert.deepEqual(source.hotspots.flatMap((h,i)=>h.correct?[i]:[]),[source.correct]);
  const candidate=structuredClone(draftPublished.find(q=>q.id===s.q.id));
  delete candidate.hotspots;
  assert.deepEqual(candidate.choices,source.choices);assert.deepEqual(candidate.options,source.options);
  assert.equal(candidate.correct,source.correct);
  const allowed=s.q.id==='p022'?['hotspots','diagram','wrongFeedback','optionFeedback']:['hotspots'];
  for(const key of new Set([...Object.keys(source),...Object.keys(candidate)]))if(!allowed.includes(key))assert.deepEqual(candidate[key],source[key],key);
  const revision=compileRevision(candidate,'pbq');assert.equal(revision.evidencePrecision,'coarse');
  return{candidate,revision};
}
const permutations=xs=>xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(rest=>[x,...rest])):[[]];
const responseChecks=[],teachingChecks=[],candidateChecks=[];
let projectionRejections=0,stableDisplayPaths=0,displayPermutations=0;
const rejectProjection=fn=>{assert.throws(fn);projectionRejections++;};
for(const s of candidates){
  const draft=editorialDrafts.find(d=>d.recordId===s.record.id);
  assert.equal(project(s.record.id,s.pub,draft),null);
  assert.equal(project(s.record.id,s.pub,draft,{enabled:false}),null);
  const {candidate,revision}=project(s.record.id,s.pub,draft,{enabled:true});
  const initial=initAnswer({kind:'pbq',q:s.q});assert.equal(initial.selected,null);
  assert(!legacy(s.q).can&&!legacy(s.q).answered&&!legacy(s.q).whole);
  assert.equal(stripHints(s.q).hint,undefined);assert(!feedback.hasSeparatePbqSolution(s.q));
  const optionBindings=s.q.choices.map((label,index)=>{
    const r=legacy(s.q,{},index),d=legacy(candidate,{},index);
    assert.equal(r.whole,index===s.q.correct);assert.equal(r.whole,d.whole);assert(r.can&&r.answered);
    assert.equal(r.parts.length,1);assert.equal(r.parts[0].correct,r.whole);
    const currentBody=feedback.pbqFeedbackBody(s.q.optionFeedback[index]);
    assert.equal(currentBody,index===s.q.correct?s.q.explanation:s.q.wrongFeedback[index]);
    const draftBody=feedback.pbqFeedbackBody(candidate.optionFeedback[index]);
    assert.equal(draftBody,index===candidate.correct?candidate.explanation:candidate.wrongFeedback[index]);
    assert(currentBody.length>25&&draftBody.length>25);
    if(s.q.id==='p022'&&index>0)assert.equal(draftBody,cloudCorrections[index]);
    else assert.equal(draftBody,currentBody);
    return{choiceOrdinal:index+1,choiceRevision:sig(label),currentTeachingRevision:sig(currentBody),candidateTeachingRevision:sig(draftBody),practicePostAnswerAvailable:true,completedExpandedExamAvailable:true,currentSemanticAlignmentQualified:s.q.id!=='p022',newFeedbackCredit:0};
  });
  const invalid=[null,undefined,-1,4,String(s.q.correct),NaN,{}].map(value=>{
    const result=legacy(s.q,{},value);assert(!result.whole);
    return{inputRevision:sig(String(value)),practiceCanSubmit:can(s.q,[],{},value,'SELECT & FILL',fn=>fn(),correctBlank),examCountsAnswered:Boolean(examAnswered({kind:'pbq',q:s.q},{selected:value})),wholeMarkedCorrect:false};
  });
  assert(can(s.q,[],{},undefined,'SELECT & FILL',fn=>fn(),correctBlank));
  assert(!examAnswered({kind:'pbq',q:s.q},{selected:undefined}));
  const options=revision.components.filter(r=>r.kind==='option');
  for(const order of permutations(options)){
    const view=learnerRevision(revision,order.map(r=>r.id));assert.equal(view.diagram,candidate.diagram);
    assert(!/"(?:hotspots|correct|gradingKey|expected|answer|optionFeedback|wrongFeedback|explanation|payload)"\s*:/.test(JSON.stringify(view)));
    displayPermutations++;
    for(const row of order){const result=gradeRevision(revision,[{componentId:row.id,valueId:row.id}]);assert.equal(result.correct,row.label===candidate.choices[candidate.correct]);stableDisplayPaths++;}
  }
  for(const selections of [[],[{componentId:'unknown',valueId:'unknown'}],[{componentId:options[0].id,valueId:options[1].id}],options.slice(0,2).map(r=>({componentId:r.id,valueId:r.id})),[{componentId:options[0].id,valueId:options[0].id,extra:'bad'}]])rejectProjection(()=>gradeRevision(revision,selections));
  rejectProjection(()=>project('private:'+s.record.id,s.pub,draft,{enabled:true}));
  rejectProjection(()=>project(s.record.id,{...s.pub,diagram:''},draft,{enabled:true}));
  rejectProjection(()=>project(s.record.id,{...s.pub,correct:(s.pub.correct+1)%4},draft,{enabled:true}));
  rejectProjection(()=>project(s.record.id,s.pub,{...draft,sourceRevision:'stale'},{enabled:true}));
  rejectProjection(()=>project(s.record.id,s.pub,{...draft,operations:[]},{enabled:true}));
  rejectProjection(()=>compileRevision({...candidate,unknownFutureField:true},'pbq'));
  rejectProjection(()=>compileRevision({...candidate,blanks:[{}]},'pbq'));
  const tampered=structuredClone(revision);tampered.semantic.display.diagram='changed';
  rejectProjection(()=>gradeRevision(tampered,[{componentId:options[0].id,valueId:options[0].id}]));
  rejectProjection(()=>learnerRevision(revision,[options[0].id,options[0].id,...options.slice(2).map(r=>r.id)]));
  responseChecks.push({recordId:s.record.id,currentOfferedPaths:4,currentCorrectPaths:1,currentWrongPaths:3,candidateOfferedPaths:4,keyAndChoiceOrderPreserved:true,unusedMetadataNotGraded:true,coarseWholeResponseOnly:true,invalidValueCases:invalid,undefinedSubmitAnsweredDiscrepancy:true,invalidValuesOfferedByCurrentUI:false});
  teachingChecks.push({recordId:s.feedback.id,sourceRevision:s.feedback.sourceSignature,optionBindings,currentDiagramVisiblePractice:true,currentDiagramVisibleAnsweringExam:true,currentDiagramVisibleCompletedExpandedExam:false,mainDeliveredViaCorrectOption:true,currentFeedbackProposalPreserved:previous.has(s.feedback.id),currentFullFeedbackHoldPreserved:s.q.id==='p022',freshBrowserObserved:false});
  candidateChecks.push({recordId:s.record.id,originalRevision:s.record.sourceSignature,candidateRevision:sig(candidate),candidateFeedbackRevision:sig(feedbackBundle(candidate)),originalCompilerSupported:false,originalTrustedRevisionId:null,candidateCompilesInMemory:true,candidateIsPublishedRevision:false,candidateTrustedRevisionExported:false,onlyDeclaredFieldsChanged:true,choiceAndKeyRevisionPreserved:true,answerBearingEvidenceProseRetained:true,preAnswerProjectionLacksKeyFieldsButCanContainTaskClues:true,humanApproved:false,canonicalApproval:false,newCredit:0});
}
assert.deepEqual([displayPermutations,stableDisplayPaths,projectionRejections],[96,384,56]);
assert(!draftPublished.find(q=>q.id==='p022').wrongFeedback[3].includes('IAM'));
assert(draftPublished.find(q=>q.id==='p022').optionFeedback[3].includes('application layer'));
assert.equal(sig(publicationPipeline(c.bank).overrides(captures).pbqs),sig(published));

const judgments={
  'pbq:p007':'PRESERVE_PARENT_HOLD: the visible fictional dashboard supports prioritising confirmed active encryption, without declaring other alerts harmless. The exact original remains compiler-unsupported and retains unused firmware/CVE metadata that differs from the revised diagram. A metadata-free candidate is a different revision, not a resolved current-source hold.',
  'pbq:p008':'NEW_PARENT_HOLD: the illustrative pseudocode supports locating SQL construction from untrusted input; it does not execute SQL, verify an exploit or implement safe authentication. Exact original hotspots metadata remains unsupported. A compilation-only candidate supplies no current trusted identity, whole-task qualification or new independent skill.',
  'pbq:p022':'NEW_PARENT_HOLD: the stipulated unmanaged IaaS allocation can support the hypervisor choice, but current labels/metadata name data and IAM while choices name runtime and application code. The final wrong correction addresses IAM instead of application code. The exact source is also compiler-unsupported; a corrected candidate cannot resolve the original revision.',
  'pbq:p030':'PRESERVE_PARENT_HOLD: the supplied fictional log identifies an undocumented handover rather than a universal signature rule, legal admissibility decision or requirement never to touch a source. Captured snapshot precedence and the uncalibrated difficulty change remain explicit. Exact original metadata is unsupported; no real forensic handling or original-source qualification follows.',
  'explanation:pbq:p007':'PRESERVE_PRIOR_BOUNDED_FEEDBACK: main and three option-specific corrections remain qualified only relative to the stipulated dashboard, with no new credit. Completed expanded Exam review still omits its diagram and the parent hold remains unresolved.',
  'explanation:pbq:p008':'PRESERVE_PRIOR_BOUNDED_FEEDBACK: the three alternatives distinguish connection, execution and password/session processing from unsafe SQL construction. Parameter binding/password verification teaching is not an executed fix or independent authentication skill. The newly explicit parent hold creates no complete pair.',
  'explanation:pbq:p022':'PRESERVE_FEEDBACK_HOLD: current fourth-choice correction still addresses IAM, not the offered application-code layer. The exact diagram/choice associations remain stale. Three candidate corrections and a relabelled candidate diagram are draft text only; current full feedback is not qualified.',
  'explanation:pbq:p030':'PRESERVE_PRIOR_BOUNDED_FEEDBACK: main and three alternatives support documentation, modern integrity hashing and appropriate forensic copies within the fictional evidence. No legal result or universal two-signature/untouched-original claim is approved; captured source and parent hold remain separate.',
};
const newDistinctHeldRecordIds=['pbq:p008','pbq:p022'];
const priorSelectedHoldIds=priorHeldRows.filter(r=>candidateRecordIds.includes(r.recordId)).map(r=>r.recordId).sort();
assert.deepEqual(priorSelectedHoldIds,['explanation:pbq:p022','pbq:p007','pbq:p030']);
assert(newDistinctHeldRecordIds.every(id=>!previous.has(id)&&!priorHeldRows.some(r=>r.recordId===id)));
const rowDispositions=candidateRecordIds.map(recordId=>({recordId,kind:c.records.get(recordId).kind,sourceRevision:c.records.get(recordId).sourceSignature,publishedRecordSignature:c.records.get(recordId).sourceSignature,status:previous.has(recordId)?'PRIOR_BOUNDED_FEEDBACK_RECHECK_NO_NEW_CREDIT':priorSelectedHoldIds.includes(recordId)?'EXISTING_HOLD_RETAINED':'NEW_PARENT_HOLD',contentQualification:judgments[recordId],qualificationHolds:previous.has(recordId)?['Parent and delivery limitations remain separate; no end-to-end learning claim.']:[judgments[recordId]],resolved:false,newCredit:0,newQuestionCredit:0,newFeedbackCredit:0,newCompletePairCredit:0,newTeachingCredit:0,newTrustedCredit:0,newFamilyCredit:0,roleProposal:null,objectiveScopeProposal:null,teachingLinkProposals:[],familyLabelProposal:null,masteryWeight:0,humanReviewed:false,humanApproved:false,published:false,activationAllowed:false}));
const deferredSelectedRows=rowDispositions.filter(r=>!previous.has(r.recordId));
assert.equal(deferredSelectedRows.length,5);
const feedbackOnHeldParents=[...base.feedbackOnHeldParents,{recordId:'explanation:pbq:p008',parentRecordId:'pbq:p008',parentQuestionDispositionApproved:false,completePair:false,newCompletePairCredit:0}];
const bankProgress={...base.bankProgress,newQuestions:0,newFullFeedback:0,newCompletePairs:0,feedbackOnHeldParents:8,feedbackOnUnreviewedUnsupportedParents:0,feedbackWithoutQualifiedParents:8};
assert.equal(bankProgress.combinedFullFeedback-bankProgress.completePairs,8);
const objectiveCoverage=Object.fromEntries(Object.entries(base.objectiveCoverage).map(([code,row])=>[code,{prior:row.denominator.combinedPendingDispositions,newDispositions:0,combined:row.denominator.combinedPendingDispositions,total:row.denominator.broadCandidates,remaining:row.denominator.remaining,remainingIdsRevision:sig(row.remainingRecordIds),baselineCensusRevision:sig(row.census)}]));
const catalogueProgress={...base.catalogueProgress,priorDispositions:1688,newProposals:0,newQualifiedSelectorDispositions:0,newQualifiedTeachingProposals:0,newQuestionProposals:0,newFeedbackProposals:0,selectedHeldRows:5,newDistinctHeldRows:2,combinedPending:1688,remaining:190,byKind:base.catalogueProgress.byKind.map(r=>({...r,prior:r.combined,new:0}))};
const remainingBankQuestions=base.remainingBankQuestions.map(r=>newDistinctHeldRecordIds.includes(r.recordId)?{...r,status:'explicit_current_source_parent_hold',holdSourceRevision:c.records.get(r.recordId).sourceSignature}:r);
const sourceBindings=[...new Map([...base.sourceBindings,...[basePath,baseReport,baseAudit,scriptPath].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];
assert.equal(sourceBindings.length,390);verifySourceBindings(sourceBindings);
const protectedFiles=readJson('docs/evidence/phase-2b5/release-checksums.json').files;
assert.equal(Object.keys(protectedFiles).length,25);verifySourceBindings(Object.entries(protectedFiles).map(([path,sha256])=>({path,sha256})));
const packet={schemaVersion:1,status:'LOCAL_FOUR_HOTSPOT_PAIRS_DRAFT_REMEDIATION_CURRENT_SOURCES_HELD_NOT_READY',baselineCommit:'5aa940b3eebd6b91c6a4c6531aeed35233ea29bc',authority:{masterPlan:'docs/secureplus-rebrand-master-plan.md',historicalAudit:'docs/phase-1-product-loop-audit.md',scope:'Exactly four LOCAL HOTSPOT parent/feedback pairs; offline source-bound design and editorial candidates only',canonicalApprovalTransferred:false,activeChangesAllowed:false},sourceBindings,allPacketReconciliation:{inventory,priorReconciliationBinding:{packetPath:basePath,sourceRevision:sig(base.allPacketReconciliation),newCredit:0}},instructionalReconciliation:{...base.instructionalReconciliation,rawPriorRows:780,distinctPriorRecords:766,newQualifiedRows:0,newSelectorDispositionRows:0,newDistinctSelectorIdentities:0,combinedRawRows:780,combinedDistinctRecords:766,combinedDuplicateOccurrences:14},candidateRecordIds,selectedRecordIds:[],selectedQuestionRecordIds:[],selectedFeedbackRecordIds:[],questionProposals:[],explanationProposals:[],instructionalProposals:[],rowDispositions,deferredSelectedRows,deferredScopeRecordIds:[],sourceChecks,reusedEvidence,editorialDrafts,precedenceCounterexample,rootCauseDesign:{policyVersion:'local-hotspot-whole-choice-candidate-v1',enabledByDefault:false,wired:false,finiteLocalIds:ids,originalSourceMustMatchExactly:true,dropOnlyIgnoredHotspotsInCandidate:true,preserveChoiceLabelsOrderAndKey:true,unknownFieldsStillRejected:true,noClickableRegionOrPositionSkill:true,originalAndCandidateRevisionsKeptSeparate:true,p022RepairsMustPrecedeFeedbackAliasGeneration:true,p022CorrectionsMustWinConciseOverlay:true,p030CapturedSnapshotMustRemainBeforeEditorial:true,completedExamEvidencePanelStillNeedsSeparatelyAuthorizedWork:true,currentHoldsAutomaticallyResolved:false,compilerOrRuntimeModified:false,postMissRecoveryOrLearningGainClaimed:false},responseChecks,teachingChecks,candidateChecks,deliverySourceBindings:[probeUnit.provenance,...units.map(u=>u.provenance)],deliveryObservations:{sourceOnly:true,reactRendered:false,freshBrowserObserved:false,realSubmitOrSaveHandlerExecuted:false,learnerHistoryRead:false,currentOfferedPaths:16,candidateOfferedPaths:16,displayPermutations,stableDisplayPaths,projectionRejections,invalidLegacyValueCases:28,currentCompletedExamDiagramAvailable:false,candidateCompletedExamDiagramRepairImplemented:false,preAnswerEvidenceMayContainTaskClues:true,noGenericAnswerFieldsInCandidateLearnerProjection:true},objectiveCoverage,newObjectiveMemberships:0,newAllSourceObjectiveMemberships:0,catalogueProgress,catalogueCensusBinding:{packetPath:basePath,field:'catalogueCensus',sourceRevision:sig(base.catalogueCensus),newCredit:0},remainingCatalogueRecordIds:base.remainingCatalogueRecordIds,supportProgress:{...base.supportProgress,priorFullDispositions:748,newQualifiedTeachingProposals:0,newSelectorCredit:0},bankProgress,remainingBankQuestions,remainingBankFeedback:base.remainingBankFeedback,remainingCompletePairRecordIds:base.remainingCompletePairRecordIds,feedbackOnHeldParents,feedbackOnUnreviewedUnsupportedParents:[],starterProgress:base.starterProgress,guestProgress:base.guestProgress,glossaryProgress:base.glossaryProgress,priorStateBindings,priorInheritedFieldBindingsVerified:base.priorHoldBindings.length,priorHeldRows,priorHeldDeckReferences:base.priorHeldDeckReferences,priorSelectedHoldIds,newDistinctHeldRecordIds,totalDistinctHeldRecords:171,inspectedRecords:8,newDistinctSemanticReviews:2,recheckedPriorDispositions:6,newQualifiedFeedbackProposals:0,newCompletePairCredit:0,canonicalBoundary:base.canonicalBoundary,activePackageUnchanged:base.activePackageUnchanged,priorLimitedGuideReviewReference:base.priorLimitedGuideReviewReference,knownSavedMixedSetRestoreObservation:base.knownSavedMixedSetRestoreObservation,triageLedgerBinding:base.triageLedgerBinding,sourceSelectionBinding:base.sourceSelectionBinding,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,newTrustedCredit:0,newTrustedRevisionIds:[],newFamilyCredit:0,privatePayloadIncluded:false,privatePayloadFetched:false,privateCompiledHere:false,learnerRuntimeObserved:false,productionAction:false,phase3Work:false,unchangedReleaseHashes:25};
assert.equal(base.priorHoldBindings.length,752);assert.equal(packet.remainingCatalogueRecordIds.length,190);
assert.equal(packet.remainingCatalogueRecordIds.filter(id=>[...priorHeldRows.map(r=>r.recordId),...newDistinctHeldRecordIds].includes(id)).length,170);
assert.equal(packet.remainingCatalogueRecordIds.filter(id=>![...priorHeldRows.map(r=>r.recordId),...newDistinctHeldRecordIds].includes(id)).length,20);
assert.deepEqual(priorHeldRows.filter(r=>!packet.remainingCatalogueRecordIds.includes(r.recordId)).map(r=>r.recordId),['pbq:p036']);
// Only newly authored public editorial text is allowed; no active stems, options or keys are exported.
assertSafeReviewExport(packet);
let expectedMutations,negativeMutationChecks=0;
function validate(v){assertSafeReviewExport(v);const {negativeMutationChecks,...body}=v;assert(isDeepStrictEqual(body,packet),'Source/draft/hold/delivery/accounting drift');if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,expectedMutations);}
const reject=fn=>{const bad=structuredClone(packet);fn(bad);assert(!isDeepStrictEqual(bad,packet));assert.throws(()=>validate(bad));negativeMutationChecks++;};
for(let i=0;i<sourceChecks.length;i++){
  for(const k of ['sourceRevision','feedbackRevision','exactOriginalCompilerError'])reject(p=>p.sourceChecks[i][k]='stale');
  for(let j=0;j<sourceChecks[i].fieldRevisions.length;j++)reject(p=>p.sourceChecks[i].fieldRevisions[j].effective='stale');
  for(let j=0;j<sourceChecks[i].sourceCitations.length;j++)reject(p=>p.sourceChecks[i].sourceCitations[j].line=0);
  for(let j=0;j<editorialDrafts[i].operations.length;j++){reject(p=>p.editorialDrafts[i].operations[j].beforeRevision='stale');reject(p=>p.editorialDrafts[i].operations[j].fieldPath='correct');}
  reject(p=>p.editorialDrafts[i].activeHoldResolved=true);reject(p=>p.candidateChecks[i].candidateIsPublishedRevision=true);
  for(let j=0;j<4;j++){reject(p=>p.teachingChecks[i].optionBindings[j].candidateTeachingRevision='stale');reject(p=>p.teachingChecks[i].optionBindings[j].choiceRevision='stale');}
}
for(let i=0;i<8;i++)for(const[k,v]of Object.entries({sourceRevision:'stale',contentQualification:'',resolved:true,newQuestionCredit:1,newFeedbackCredit:1,newCompletePairCredit:1,newTrustedCredit:1,newFamilyCredit:1,masteryWeight:1,humanReviewed:true,humanApproved:true,published:true,activationAllowed:true,roleProposal:'primary',familyLabelProposal:'independent'}))reject(p=>p.rowDispositions[i][k]=v);
for(let i=0;i<169;i++){reject(p=>p.priorHeldRows[i].resolved=true);reject(p=>p.priorHeldRows[i].priorDispositionRevision='stale');}
for(let i=0;i<sourceBindings.length;i++)reject(p=>p.sourceBindings[i].sha256='stale');
for(let i=0;i<inventory.length;i++)reject(p=>p.allPacketReconciliation.inventory[i].sha256='stale');
for(let i=0;i<priorStateBindings.length;i++)reject(p=>p.priorStateBindings[i].sourceRevision='stale');
for(let i=0;i<reusedEvidence.length;i++)reject(p=>p.reusedEvidence[i].sourceRevision='stale');
for(const code of Object.keys(objectiveCoverage))reject(p=>p.objectiveCoverage[code].newDispositions=1);
for(const k of ['combinedQuestions','combinedFullFeedback','completePairs','feedbackOnHeldParents','feedbackOnUnreviewedUnsupportedParents'])reject(p=>p.bankProgress[k]++);
for(const k of ['humanApproved','published','activationAllowed','privatePayloadIncluded','privatePayloadFetched','privateCompiledHere','learnerRuntimeObserved','productionAction','phase3Work'])reject(p=>p[k]=true);
for(const k of ['q','options','answer','correct','gradingKey','payload','learnerId','email'])reject(p=>p[k]='forbidden');
reject(p=>p.totalDistinctHeldRecords=169);reject(p=>p.newDistinctHeldRecordIds.pop());reject(p=>p.selectedRecordIds.push('pbq:p008'));reject(p=>p.catalogueProgress.combinedPending++);reject(p=>p.supportProgress.combinedPending++);reject(p=>p.remainingCatalogueRecordIds.pop());reject(p=>p.remainingBankQuestions.pop());reject(p=>p.remainingBankFeedback.pop());reject(p=>p.remainingCompletePairRecordIds.pop());reject(p=>p.rootCauseDesign.enabledByDefault=true);reject(p=>p.rootCauseDesign.currentHoldsAutomaticallyResolved=true);reject(p=>p.deliveryObservations.currentCompletedExamDiagramAvailable=true);reject(p=>p.deliveryObservations.preAnswerEvidenceMayContainTaskClues=false);reject(p=>p.editorialDrafts[2].operations[4].replacementText='IAM');reject(p=>p.status='READY');
expectedMutations=negativeMutationChecks;
const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-hotspot-pbq-remediation-proposals'),'Runtime proposal import');
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');
validate(readJson(packetPath));
const location=u=>'`'+u.path+':'+u.startLine+'`';
const sourceLocations=units.map(u=>location(u.provenance)).join(', ');
const report=`# Phase 2B-5 — four HOTSPOT PBQ pairs: root-cause design and local repair candidates

2026-10-15 (Asia/Singapore). Baseline: \`5aa940b3eebd6b91c6a4c6531aeed35233ea29bc\`.
**LOCAL/default-off/unwired/learner-invisible. Phase 2B-5 and production NOT READY.**

All eight specified identities were reviewed; none was deferred. Three existing bounded feedback proposals are preserved without new credit. Three existing holds remain, and two previously unreviewed parents now have explicit holds: **pbq:p008 and pbq:p022**. All **169 prior distinct holds** remain unresolved; total **171**. The four current parent revisions remain unsupported. Four separately fingerprinted compilation candidates are feasible in memory; that does not qualify the originals, publish the drafts or clear any hold.

The master plan remains approved product authority; the Phase 1 audit remains historical implementation evidence. This finite slice resolves the remediation design and supplies reviewable local editorial text. It does not implement or activate the repair. No authority conflict requires a learner behavior change within this scope.

## Eight exact current-source dispositions

| Identity | Current source revision | Disposition |
|---|---|---|
${rowDispositions.map(r=>'| '+r.recordId+' | `'+r.sourceRevision+'` | '+r.status+' |').join('\n')}

${rowDispositions.map(r=>'**'+r.recordId+'** — '+r.contentQualification+'\n').join('\n')}

Observed objective tags are 4.8 (p007/p030), 2.3 (p008), and 3.1 (p022). They identify comparison context only; no canonical concept, role, objective scope, difficulty calibration, teaching link, family, skill independence or mastery weight is approved. The original four HOTSPOT tasks still have null trusted identities. The three feedback qualifications concern their conditional source teaching, not complete parent tasks or demonstrated learning.

## One root cause, one bounded compatibility policy

Practice and Exam use a numeric index into the same four ordinary choices. Both render the diagram while answering. Neither renderer or whole grader reads hotspot correctness metadata or collects a diagram coordinate. The protected native compiler rejects each exact published source with **Unsupported question field: hotspots**. This is an unused-field compatibility gap, not evidence that four spatial skills exist.

Reuse the existing whole-choice compiler, stable option identities, coarse whole grader and learner allowlist. The local audit's default call returns null. Explicit opt-in accepts only these four LOCAL IDs, their exact original published revision and exact draft manifest. It verifies a nonempty diagram, identical choice aliases, unique metadata IDs and exactly one metadata key agreeing with the existing numeric key. Only the declared unused metadata is retired from the candidate; unknown or mixed-grammar fields still fail closed. Original and candidate fingerprints are retained separately, and hypothetical trusted UUIDs, grading keys and active content are not exported.

This policy is diagnostic code inside the focused audit only. It is not a registered adapter, an expanded native allowlist, a runtime import or a new publication path. Current source remains compiler-unsupported even when its candidate compiles. A future authorized implementation must decide the versioned original-to-candidate provenance contract, persistence identity and delivery boundary; it must not silently delete arbitrary unknown fields or infer approval from a successful compile.

Metadata retirement would prevent the stale p007 firmware/CVE labels and p022 data/IAM labels from entering that candidate grammar. It does not rewrite or resolve the active source. p007's supplied active encryption supports relative urgency, not a declaration that other alerts are harmless. p008's explicitly illustrative pseudocode identifies unsafe SQL construction, not a working exploit or secure authentication implementation. p030's log supplies a missing documented handover, not a universal signature rule or legal outcome. No new wording is needed for their bounded existing feedback.

## Exact local editorial proposal for p022

The offered choices and numeric key remain unchanged. The active diagram labels application data as C and IAM as D, while the offered choices use runtime and application code. The fourth wrong correction still contrasts IAM. The candidate labels the four offered layers consistently and replaces each wrong-option correction with a conditional contrast under the supplied unmanaged agreement.

**DRAFT ONLY — never applied to active source.** Proposed authoring locations: diagram at \`src/data/sy0701PbqReview.js:PBQ_REVIEW.p022.diagram\`; the three corrections at \`src/data/sy0701ConciseExplanations.js:CONCISE_PBQ_REVIEW.p022.wrongFeedback\`. Each operation binds its exact current field fingerprint in the packet.

\`\`\`text
${cloudDiagram}
\`\`\`

${Object.entries(cloudCorrections).map(([index,text])=>'- Offered choice '+(Number(index)+1)+' correction: '+text).join('\n')}

The source imports published review, then second-pass review, then the concise overlay. The latter shallowly replaces the wrongFeedback object; editing an earlier patch alone can lose the repair. The actual editorial function then regenerates options/optionFeedback before the enhancement pass. A fresh counterexample proves that changing wrongFeedback on an already enhanced object alone retains the old optionFeedback; enhancement restores the stale correction. The candidate therefore substitutes the final merged editorial entry before the actual alias-generation function and replays enhancement and publication in memory. Every candidate option-feedback body is checked against the intended correction. The p022 main explanation and all other offered choices, keys and task fields remain unchanged apart from the declared diagram/correction/derived-alias changes.

The candidate diagram and corrections are newly authored public draft text, deliberately distinct from the hashed active content. No raw current stem, option list, key, captured payload, private content or learner record is exported. No trusted revision or human/canonical approval is attached to the new text.

## Effective source and captured precedence

All four have authored rows. p007/p008/p022 have no selected capture or snapshot; p030 has one of each. p030's authored and preeditorial revisions differ. Its captured payload fingerprint remains \`e1eb5f73d90207ec1b2cde42478a58a6757bbee63845c263ae04dff89e7b54fe\`. The snapshot is merged before editorial review, concise corrections, alias generation and enhancement. The actual publication function recognizes the captured override and applies its order rather than restoring the old payload. Both active reconstruction and candidate reconstruction reuse those captured identities; no empty-override shortcut is substituted. A final fresh active replay is unchanged after candidate construction. No current private alternative exists for these four catalogue IDs, and no live/private query occurred.

| Parent | Authored revision | Preeditorial revision | Local effective revision | Published revision | Feedback revision | Captures/snapshots |
|---|---|---|---|---|---|---|
${sourceChecks.map(r=>'| '+r.recordId+' | `'+r.revisions.authored+'` | `'+r.revisions.preEditorialSnapshotMerged+'` | `'+r.revisions.localEffective+'` | `'+r.sourceRevision+'` | `'+r.feedbackRevision+'` | '+r.selectedCaptureCount+'/'+r.selectedSnapshotCount+' |').join('\n')}

The packet pins authored/preeditorial/effective/published fingerprints for type, scenario, question, diagram, hotspot metadata, choices/alias/key, main and alternative teaching and difficulty. It also pins row citations and current capture metadata. Raw authored wording is not substituted for delivered content.

${sourceChecks.map(r=>'Sources for **'+r.recordId+'**: '+r.sourceCitations.map(c=>'`'+c.path+':'+c.line+'`').join(', ')+'.').join('\n\n')}

## Actual delivery, scoring and teaching checks

The audit reuses the existing source-bound pure-probe block rather than a second renderer/grader implementation. Source-derived delivery/grading units: ${sourceLocations}. No React component, browser, timer, submit handler, storage, reward, analytics, account, database or entitlement action executes. PBQ access remains conditional on the existing Pro/preview/unlock path; Exam-pass logic remains unchanged.

| Check | Result and limit |
|---|---|
| Current offered responses | All 16 paths: four correct and twelve wrong; practice and Exam pure graders agree on one coarse whole-choice result. No hotspot-coordinate or component mastery. |
| Candidate responses | Same 16 offered paths and original labels/key/order; no silent answer change. |
| Candidate display permutations | 96 displays and 384 stable-identity grading paths. Every pre-answer projection excludes key/feedback/hotspot fields. |
| Semantic clue boundary | The learner allowlist copies diagram text. Fictional diagrams contain the premises needed to identify an answer; field exclusion does not prove the prose is cue-free or provide independent/novel evidence. No stronger assessment claim is made. |
| Invalid legacy values | 28 null/undefined/out-of-range/string/NaN/object cases remain wrong. Direct source expressions preserve the undefined discrepancy: practice canSubmit accepts it while Exam does not count it answered. Current choice buttons do not offer these invalid values. |
| Candidate rejection boundary | ${projectionRejections} cases reject foreign/private IDs, changed source, stale/missing draft operations, unknown/mixed fields, integrity drift, duplicate display identities and malformed/unknown/multiple stable selections. |
| Current feedback | All 16 option bodies bind main teaching through the correct option plus twelve alternative corrections. p007/p008/p030 retain their prior bounded feedback status; p022's current mismatch stays held. |
| Candidate p022 feedback | All three intended corrections survive the actual editorial alias generation and enhancement; stale IAM correction is absent. This is proposed text only, not current full-feedback credit. |
| Evidence delivery | Diagrams appear in practice and answering Exam. Completed expanded Exam review omits them. No evidence-panel repair is implemented or inferred. |

The omitted completed-review evidence and conditional feedback qualifications remain separate from the compiler gap. A future delivery fix must retain the source-bound diagram/context after both correct and wrong attempts without exposing generic key/payload fields. It cannot by itself validate the task's target, family, difficulty or learner benefit. These are source replays, not browser-observed or production behavior tests; no learning gains or recovery are demonstrated.

## Reused evidence, holds and exact reconciliation

Nine field-level bindings reuse the unsupported-PBQ design and seven-critical-feedback packet. Their source fingerprints still match. The old four diagnostic projection checks, 23-row source inventory, exact feedback/delivery checks, prior three feedback proposals, held p022 feedback and shared repair specification are references, not automatically transferred approval. No fresh standards/legal review is claimed; prior primary-reference scopes and their limits remain bound through that feedback packet. The new corrections are conditional on this fictional agreement, not universal cloud allocations.

All 129 prior substantive packets reconcile to **1688** distinct existing catalogue dispositions. Mechanical primary-array counts stay **780 raw / 766 distinct / 14 repeats**, including previously typed selector rows with zero teaching credit. The audit verifies **390 source-file bindings**, all **752 inherited field bindings**, ${priorStateBindings.length} new baseline-state bindings and every prior held identity/revision. Full prior catalogue/objective censuses are bound by reference to avoid duplicating unchanged inventories in this packet. All 21 tracked objective totals and remaining-ID fingerprints are unchanged.

| Measure | Prior | New | Current / total | Remaining |
|---|---:|---:|---:|---:|
| Catalogue dispositions |1688|0|1688 / 1878|190|
| Support dispositions |748|0|748 / 834|86|
| Bank question dispositions |463|0|463 / 483|20|
| Bank full feedback |464|0|464 / 483|19|
| COMPLETE bank pairs |456|0|456 / 483|27|
| Distinct unresolved holds |169|2|171|Unresolved|

The two new parent holds do not reduce the question denominator or remove the three prior bounded feedback proposals. **Feedback on explicitly held parents changes 7→8**, while feedback on unreviewed unsupported parents changes **1→0** because p008 now has an explicit parent hold. The same eight feedback records still lack qualified parents: **464−456=8**. This is a classification update, not a newly qualified or lost feedback record, a complete pair or new question credit. p022's held feedback remains outside the 464.

Among the 190 remaining catalogue identities, **170** are now held and **20** remain unheld. The carried pbq:p036 hold lies outside that remaining set because it retains a prior disposition; all **171** holds remain unresolved. These overlapping counts must not be added. Remaining bank identities and complete-pair identities are preserved; only p008/p022 receive explicit current-source hold status. Starter pairs stay 0/9; guest bounded records stay 6/14 with 0/2 qualified pairs. Selectors stay fully inspected, **7 bounded / 19 held**. All held deck, limited guide, private p003/p017, family/canonical, RTO and saved mixed-set restore boundaries remain unchanged.

## Validation and release limits

The focused export guard rejects **${negativeMutationChecks} altered packets**: stale source/field/citation/candidate revisions, changed draft operations, false publication/trust/teaching credit, erased holds, wrong denominators, inflated complete pairs, raw/key/private/learner exports and READY promotion. It also scans runtime sources for accidental proposal imports. Required gates are deterministic write/recheck, all **29 content-mapping tests** and deterministic active-package verification, all **25 protected release hashes**, source/native-v1/v2/ledger/specimen pins, git diff --check and actual skip marker **exit 0 / control 1**.

Release contains exactly this report, its proposal packet and focused audit in a **[skip deploy]** commit/push. Post-push verification must match HEAD, origin/main, remote main and GitHub API main, and compare exact local/committed/remote bytes and SHA-256s for all three artifacts. The eight unrelated dirty entries remain unstaged; the index is empty after release. Successful Git delivery is reported separately from deployment.

No active runtime/content edit, compiler/adapter/allowlist extension, learner-visible change, private/live payload query, migration, deployment, publication/activation, real account/attempt operation, or Phase 3 work occurs. No browser, current legal-standard conformance or learner-outcome check is claimed. The finite eight-record design/review is complete; current-source remediation and activation remain outstanding. **Phase 2B-5 and production NOT READY.**
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);
assert.equal(readFileSync(reportPath,'utf8'),report);
console.log(JSON.stringify({status:packet.status,inspectedRecords:8,priorBoundedFeedbackPreserved:3,priorSelectedHoldsPreserved:3,newDistinctHolds:2,totalDistinctHolds:171,newQuestionCredit:0,newFeedbackCredit:0,newCompletePairCredit:0,negativeMutationChecks,projectionRejections,currentOfferedPaths:16,candidateOfferedPaths:16,displayPermutations,stableDisplayPaths,sourceBindings:390,priorPackets:129,priorHoldBindingsVerified:752,baselineStateBindings:priorStateBindings.length,catalogueProgress:packet.catalogueProgress,supportProgress:packet.supportProgress,bankProgress:packet.bankProgress,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
