import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport,feedbackBundle} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
import {compileRevision,gradeRevision,learnerRevision} from '../server/adaptive/revision.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {feedbackSpecimen,evidenceSpecimen,renderSpecimen,SPECIMEN_ENABLED_BY_DEFAULT} from './lib/content-mapping/local-delivery-specimen.mjs';

const scriptPath='scripts/audit-older-pbq-editorial-remediation.mjs';
const packetPath='docs/drafts/phase-2b5-older-pbq-editorial-remediation-proposals.json';
const reportPath='docs/phase-2b5-older-pbq-editorial-remediation-review.md';
const basePath='docs/drafts/phase-2b5-public-learning-pages-proposals.json';
const baseReport='docs/phase-2b5-public-learning-pages-review.md';
const baseAudit='scripts/audit-public-learning-pages.mjs';
const olderPath='docs/drafts/phase-2b5-seven-feedback-gap-recheck-proposals.json';
for(const [path,sha256] of [
 [basePath,'46ec3e6ab80a2180cd7ec181637a57fd9eb4e4c05ee55bdbecaba62dc176065e'],
 [baseReport,'036a8971a1ccf1a3f8cbc498d10dc114eb99716022615bbd0cae722c5adcb953'],
 [baseAudit,'d0939eae6ce5ebb74297bbb927e85c882de39eee21693b841f3e446c34b4f69f'],
])assert.equal(hashFile(path),sha256);
const c=readReviewTriage(),base=readJson(basePath),older=readJson(olderPath);verifySourceBindings(base.sourceBindings);
assert.equal(hashFile(olderPath),base.sourceBindings.find(b=>b.path===olderPath).sha256);
assert.deepEqual(readJson('docs/phase-2b5-question-review-ledger.json'),c.ledger);
const ids=['p004','p011','p029','p041','p043','p046','p211'],candidates=ids.map(id=>c.questions.get('pbq:'+id));
const candidateRecordIds=candidates.flatMap(s=>[s.record.id,s.feedback.id]).sort();assert.equal(candidateRecordIds.length,14);
const previous=new Set(c.pkg.records.filter(r=>!base.remainingCatalogueRecordIds.includes(r.id)).map(r=>r.id));assert.equal(previous.size,1694);
for(const s of candidates){assert(previous.has(s.record.id));assert(!previous.has(s.feedback.id));assert(base.remainingBankFeedback.some(r=>r.recordId===s.feedback.id));}
const inventory=[...base.allPacketReconciliation.inventory,{path:basePath,sha256:hashFile(basePath),substantiveRows:6}].sort((a,b)=>a.path.localeCompare(b.path));assert.equal(inventory.length,132);
const actual=readdirSync('docs/drafts').filter(n=>n.startsWith('phase-2b5-')&&n.endsWith('.json')).map(n=>'docs/drafts/'+n).filter(path=>path!==packetPath&&['questionProposals','explanationProposals','instructionalProposals'].some(k=>Array.isArray(readJson(path)[k]))).sort();assert.deepEqual(actual,inventory.map(r=>r.path).sort());
const refs=new Set(),priorInstructions=new Set();let rawInstructions=0;
for(const b of inventory){assert.equal(hashFile(b.path),b.sha256);const p=readJson(b.path);verifySourceBindings(Array.isArray(p.sourceBindings)?p.sourceBindings:Object.entries(p.sourceBindings||{}).map(([path,sha256])=>({path,sha256})));const rows=['questionProposals','explanationProposals','instructionalProposals'].flatMap(k=>p[k]||[]);assert.equal(rows.length,b.substantiveRows);for(const r of rows){assert.equal(r.publishedRecordSignature??r.sourceRevision,c.records.get(r.recordId).sourceSignature);if(previous.has(r.recordId))refs.add(r.recordId);}for(const r of p.instructionalProposals||[]){rawInstructions++;priorInstructions.add(r.recordId);}}
assert.deepEqual([...refs].sort(),[...previous].sort());assert.deepEqual([rawInstructions,priorInstructions.size],[786,772]);
const priorHeldRows=[...base.priorHeldRows,...base.deferredSelectedRows.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,priorDispositionRevision:sig(r),packetPath:basePath,field:'deferredSelectedRows',status:r.status,resolved:false,newCredit:0}))];
assert.equal(priorHeldRows.length,181);assert.equal(new Set(priorHeldRows.map(r=>r.recordId)).size,181);
for(const r of priorHeldRows){assert.equal(c.records.get(r.recordId).sourceSignature,r.sourceRevision);assert.equal(sig(readJson(r.packetPath)[r.field].find(x=>x.recordId===r.recordId)),r.priorDispositionRevision);assert(!r.resolved&&!r.newCredit);}
assert.deepEqual(priorHeldRows.filter(r=>candidateRecordIds.includes(r.recordId)).map(r=>r.recordId).sort(),candidates.map(s=>s.feedback.id).sort());
for(const b of base.priorStateBindings)assert.equal(sig(readJson(b.packetPath)[b.field]),b.sourceRevision);
const inherited=readJson('docs/drafts/phase-2b5-remaining-routing-selectors-proposals.json').priorHoldBindings;assert.equal(inherited.length,752);for(const b of inherited){assert.equal(sig(readJson(b.packetPath)[b.field]),b.sourceRevision);assert(!b.resolved&&!b.newCredit);}

// Reuse the complete pinned pure probes, excluding the old census and writer.
const probePath='scripts/audit-older-pbq-feedback-gaps.mjs';assert.equal(hashFile(probePath),base.sourceBindings.find(b=>b.path===probePath).sha256);
const probeUnit=sourceUnit(probePath,'const unit=(a,b)=>','const semantic={');
const probes=Function('assert','readFileSync','sourceUnit','sig','hashFile','candidates','compileRevision','gradeRevision','learnerRevision','feedbackBundle',probeUnit.code+';return {units,sourceChecks,gradingChecks,teachingChecks,alternateResponseChecks,legacy,correctBlank,trustedInvalidSelections,tamperedRevisions,duplicateDisplays};')(assert,readFileSync,sourceUnit,sig,hashFile,candidates,compileRevision,gradeRevision,learnerRevision,feedbackBundle);
const {legacy,correctBlank}=probes;
const publication=publicationPipeline(c.bank).overrides([]).pbqs;
const sourceChecks=candidates.map((s,i)=>{
 assert.equal(s.captures.length,0);assert.equal(s.snapshots.length,0);assert.equal(sig(s.authored),sig(s.preQuestion));
 assert.equal(sig(publication.find(q=>q.id===s.q.id)),s.record.sourceSignature);assert.equal(sig(feedbackBundle(s.q)),s.feedback.sourceSignature);
 const prior=older.sourceChecks.find(r=>r.recordId===s.feedback.id);assert.equal(prior.parentPublishedRevision,s.record.sourceSignature);assert.equal(prior.sourceRevision,s.feedback.sourceSignature);
 const p=probes.sourceChecks[i];assert.equal(p.recordId,s.feedback.id);
 return{...prior,parentRecordId:s.record.id,parentQuestionDispositionPreserved:true,newQuestionCredit:0,authoredAndPreeditorialRevision:sig(s.authored),effectiveLocalRevision:s.record.localRevisionSignature,publishedParentRevision:s.record.sourceSignature,effectiveFeedbackRevision:s.feedback.sourceSignature,selectedCaptures:0,selectedSnapshots:0,importedLocalSource:s.q.id==='p211',privatePayloadRead:false};
});
const parentDispositionReferences=older.parentDispositionReferences;
for(const r of parentDispositionReferences){assert(previous.has(r.recordId));for(const b of r.priorRows){assert.equal(hashFile(b.path),b.fileSha256);const row=readJson(b.path).questionProposals.find(x=>x.recordId===r.recordId);assert.equal(sig(row),b.dispositionRevision);assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(r.recordId).sourceSignature);}}
const reusedEvidence=['sourceChecks','sourceDerivedGradingChecks','teachingBundleChecks','alternateResponseChecks','parentDispositionReferences','retainedFeedbackHoldBindings','sharedRemediation','externalReferences'].map(field=>{assert(Object.hasOwn(older,field));return{packetPath:olderPath,field,sourceRevision:sig(older[field]),currentSourcePinsVerified:true,approvalTransferred:false,newCredit:0};});
assert.equal(SPECIMEN_ENABLED_BY_DEFAULT,false);assert.equal(hashFile('scripts/lib/content-mapping/local-delivery-specimen.mjs'),'5dac33f8879aa56c5d66964193df35d5d088ac909562b7121fb5ba923a05b943');
for(const s of candidates)assert.equal(feedbackSpecimen(s.q,{},'exam_completed_expanded'),null);

// Manual distinctions are combined with exact slot/choice identities for reviewable drafts.
const meanings={
 p004:{'Phase 1':'plans, contacts, authority and tools ready before the incident','Phase 2':'initial detection, confirmation and scope analysis','Phase 3':'initial containment to limit spread and impact','Phase 4':'removing identified malicious components and addressing their entry condition','Phase 5':'restoring clean operations and checking for recurrence','Phase 6':'the plan’s post-response retrospective and improvements'},
 p011:{SLE:'the estimated loss from one event, calculated as asset value times the exposure fraction',ALE:'expected annual loss, calculated as single-event loss times expected annual frequency',Occurrence:'event occurrence or frequency within the named annual rate',Percentage:'the proportion of asset value lost; 40 percent must be used as 0.40 when multiplying'},
 p029:{SLE:'estimated loss from a single event',ALE:'expected annual loss after applying annual frequency',Occurrence:'event frequency in Annualized Rate of Occurrence','Exposure Factor':'the fraction of asset value lost in one event',Qualitative:'category-based judgments such as High, Medium and Low rather than a monetary estimate'},
 p043:{'Chain of Custody':'the record of who collected, handled and transferred evidence','Legal Hold':'suspending routine disposal of potentially relevant information while preservation duties apply','Threat Hunting':'proactive hypothesis-led searches for activity that automated detection may have missed',Tabletop:'a discussion-based exercise rather than live system actions','Digital Forensics':'documented acquisition, examination and analysis of digital evidence'},
 p046:{'Risk Transfer (financial instrument)':'insurance transferring covered financial losses under its policy terms','Risk Avoidance':'discontinuing the specified activity that creates the identified future exposure','Risk Acceptance':'an authorised informed decision to retain the specified residual exposure','Risk Mitigation':'reducing exposure, such as lowering account-compromise likelihood with MFA','Risk Transfer (contractual)':'an explicit service contract allocating specified losses or responsibilities'},
};
const mains={
 p004:'For this supplied simplified response flow, preparation precedes the event, followed by initial analysis, containment, addressing the malicious cause, verified restoration and a retrospective. Real incidents can repeat or overlap these activities; the phase labels do not establish a universal six-stage NIST workflow or successful response.',
 p011:'SLE estimates a single event’s loss: asset value multiplied by the exposure fraction. ALE multiplies SLE by expected annual frequency (ARO). Convert percentages to fractions and keep loss scope, units and periods consistent. Naming a formula is not performing a calibrated loss calculation.',
 p029:'SLE describes one event’s estimated loss and ALE applies expected annual frequency. Exposure factor is a loss fraction. Qualitative High/Medium/Low categories differ from monetary estimates; multiplying ordinal categories does not by itself produce a valid quantitative loss model.',
 p043:'Custody records document handling; a legal hold preserves potentially relevant information when duties apply; hunting tests hypotheses; a tabletop rehearses through discussion; digital forensics acquires and examines evidence using documented methods. These terms do not guarantee attribution, integrity, admissibility or universal authority to collect, and preservation obligations depend on context.',
 p046:'Risk responses depend on the stated activity and authority. Avoidance stops that activity; mitigation reduces exposure; acceptance retains informed approved exposure; transfer allocates specified consequences. Insurance and service-contract examples are both transfer and can overlap legally; their supplied subtype labels are not independent strategies. Outsourcing does not remove every responsibility.',
};
const localDrafts=candidates.filter(s=>Object.hasOwn(meanings,s.q.id)).map(s=>{
 const q=s.q,definitions=q.selectionOptions.map((label,i)=>({id:'draft-value:'+q.id+':'+i,label,meaning:meanings[q.id][label]}));assert(definitions.every(v=>v.meaning));
 const slots=q.blanks.map(b=>({id:b.id,context:b.sentence,sourcePartRevision:sig(b),sourceTeachingRevision:sig(b.explanation),candidateFocus:meanings[q.id][b.answer]}));
 const contrasts=q.blanks.flatMap(b=>definitions.map(value=>{
  const accepted=correctBlank(value.label,b),target=definitions.find(v=>v.label===b.answer);assert(target);
  let rationale=accepted?`For this supplied description, ${target.label} names ${target.meaning}. ${b.explanation}`:
   `This slot describes ${target.meaning}, so the intended label in this exercise is ${target.label}. Your selection, ${value.label}, names ${value.meaning}; it does not name the particular description requested here.`;
  if(!accepted&&q.id==='p046'&&target.label.startsWith('Risk Transfer')&&value.label.startsWith('Risk Transfer'))rationale=`Both labels describe transfer, so this is not a different broad response strategy. This prompt’s stated example is ${target.meaning}, labelled ${target.label} in this exercise. ${value.label} labels ${value.meaning}. Insurance and other contracts can overlap; these are the supplied example subtypes, not mutually exclusive universal categories.`;
  return{slotId:b.id,choiceId:value.id,verdict:accepted?'correct':'incorrect',candidateRationale:rationale,sourceParentRevision:s.record.sourceSignature,sourceFeedbackRevision:s.feedback.sourceSignature};
 }));
 const body={parentRecordId:s.record.id,feedbackRecordId:s.feedback.id,parentSourceRevision:s.record.sourceSignature,currentFeedbackRevision:s.feedback.sourceSignature,format:'source_bound_reusable_selector_feedback_draft',mainTeaching:mains[q.id],slots,definitions,contrasts,scope:'Supplied terminology and response-plan conventions only; no actual financial/legal/incident result or independent component mastery.'};
 return{...body,candidateRevision:sig(body),codexContentReviewed:true,humanReviewed:false,humanApproved:false,currentHoldResolved:false,currentDeliveryQualified:false,newCredit:0,masteryWeight:0};
});
const resilience=candidates.find(s=>s.q.id==='p211');
const p211Text=[
 'This set misses all three supplied requirements: a day-long site activation does not satisfy recovery in minutes, daily-only backups do not establish a usable recovery point within 15 minutes of lost records, and ordinary writable logs do not prevent early administrator alteration or deletion.',
 'This is the only offered set combining tested failover, tested short-interval recovery points and enforced retention against early administrator changes. It remains conditional on meeting the stated service deadline, the age and usability of the latest recovery point, dependencies and retention enforcement. WORM here means write once, read many storage, not a malware worm. Enforcement must prevent the specified administrator changes before retention expires; a hot-site, backup-interval or WORM label alone is not proof of an achieved RTO, RPO or retention result.',
 'Even if failover and retention meet their requirements, a daily backup alone can leave much more than 15 minutes of recent records unrecoverable. Recovery speed and protected logs do not compensate for failing the separate data-loss limit.',
 'Even if the service and database recovery requirements are met, an administrator-editable share permits the early changes the log-retention requirement forbids. Recovery controls cannot substitute for enforced retention against that administrator threat.',
];
const resilienceBody={parentRecordId:resilience.record.id,feedbackRecordId:resilience.feedback.id,parentSourceRevision:resilience.record.sourceSignature,currentFeedbackRevision:resilience.feedback.sourceSignature,format:'source_bound_whole_choice_feedback_draft',mainTeaching:p211Text[1],requiredEvidence:{fieldPath:'diagram',sourceRevision:sig(resilience.q.diagram),mustBeVisibleBeforePracticeAnswer:true,mustBeVisibleDuringCompletedReview:true},offeredChoiceRevisions:resilience.q.choices.map(sig),optionTeaching:p211Text.map((text,i)=>({choiceOrdinal:i+1,verdict:i===resilience.q.correct?'correct':'incorrect',candidateRationale:text})),scope:'Combined fictional service-recovery, recent-data-loss and administrator-resistant retention requirements; no separate concept proof or actual outcome.'};
localDrafts.push({...resilienceBody,candidateRevision:sig(resilienceBody),codexContentReviewed:true,humanReviewed:false,humanApproved:false,currentHoldResolved:false,currentDeliveryQualified:false,newCredit:0,masteryWeight:0});
assert.equal(localDrafts.length,6);
const semanticHold={parentRecordId:'pbq:p041',feedbackRecordId:'explanation:pbq:p041',parentSourceRevision:candidates[3].record.sourceSignature,currentFeedbackRevision:candidates[3].feedback.sourceSignature,status:'EXPLICIT_SEMANTIC_HOLD_NO_FULL_CONTRAST_DRAFT',reason:'The task calls these data states, but tape and email can also be at rest, in transit or in use. Disk/file and backup-media encryption are overlapping stored-data protections, while transport TLS and message encryption address different boundaries and can coexist. A blanket per-value wrong rationale would imply exclusions not established by the short prompts. Specify the threat, protected asset, key/access and channel/message boundaries or explicitly narrow to the closest named example before reviewing complete contrasts.',sourceGradingStillReplayed:true,priorCoarseParentDispositionPreserved:true,parentReapproved:false,currentFeedbackHoldResolved:false,newCredit:0};
const storage=candidates[3].q;assert(storage.blanks[0].sentence.includes('Data at rest'));assert(storage.blanks[3].sentence.includes('Backup data on tape'));assert(storage.selectionOptions.some(v=>v.includes('Disk or file encryption'))&&storage.selectionOptions.some(v=>v.includes('Backup-media encryption')));
assert(!legacy(storage,Object.fromEntries(storage.blanks.map((b,i)=>[b.id,i===0?storage.blanks[3].answer:b.answer]))).whole);

const knownDrafts=new Map(localDrafts.map(d=>[d.feedbackRecordId,d]));
function reviewDraft(s,draft,responses,mode,{enabled=false}={}){
 if(!enabled)return null;
 assert.deepEqual(draft,knownDrafts.get(s.feedback.id),'Exact reviewed draft required');
 assert.equal(draft.parentRecordId,s.record.id);assert.equal(draft.feedbackRecordId,s.feedback.id);
 assert.equal(sig(s.q),s.record.localRevisionSignature);assert.equal(draft.parentSourceRevision,s.record.sourceSignature);assert.equal(draft.currentFeedbackRevision,s.feedback.sourceSignature);
 assert(!s.record.id.startsWith('private:'));assert(['practice_after_answer','exam_completed_expanded'].includes(mode));
 if(s.q.type==='SELECT & FILL'){
  assert(Object.keys(responses).length===s.q.blanks.length&&Object.keys(responses).every(id=>s.q.blanks.some(b=>b.id===id)),'Complete offered slots required');
  assert(Object.values(responses).every(v=>s.q.selectionOptions.includes(v)),'Current literal UI values required');
  const source=feedbackSpecimen(s.q,responses,mode,{enabled:true});assert(source.parts.length===s.q.blanks.length);
  const corrections=source.parts.map(p=>{const value=draft.definitions.find(v=>v.label===responses[p.id]);const correction=draft.contrasts.find(t=>t.slotId===p.id&&t.choiceId===value.id);assert(correction);assert.equal(correction.verdict==='correct',p.correct);return correction;});
  return{source,mainTeaching:draft.mainTeaching,corrections,candidateRevision:draft.candidateRevision};
 }
 assert(Object.keys(responses).length===1&&Number.isInteger(responses.selected)&&responses.selected>=0&&responses.selected<4);
 const source=feedbackSpecimen(s.q,responses,mode,{enabled:true});assert.equal(source.requirements[0].content,s.q.diagram);
 return{source,mainTeaching:draft.mainTeaching,corrections:draft.optionTeaching,candidateRevision:draft.candidateRevision};
}
function* combinations(values,length,prefix=[]){if(prefix.length===length){yield prefix;return;}for(const value of values)yield*combinations(values,length,[...prefix,value]);}
let draftPairChecks=0,draftWrongContrasts=0,specimenRenders=0,offeredCompleteResponses=0,offeredWrongResponses=0,invalidDraftCases=0;
const draftChecks=[];const rejectDraft=fn=>{assert.throws(fn);invalidDraftCases++;};
for(const draft of localDrafts){
 const s=candidates.find(s=>s.feedback.id===draft.feedbackRecordId),q=s.q;
 assert.equal(reviewDraft(s,draft,{},'exam_completed_expanded'),null);
 if(q.type==='SELECT & FILL'){
  const all=Object.fromEntries(q.blanks.map(b=>[b.id,b.answer]));assert.equal(draft.contrasts.length,q.blanks.length*q.selectionOptions.length);
  for(const blank of q.blanks)for(const value of q.selectionOptions){
   const response={...all,[blank.id]:value},view=reviewDraft(s,draft,response,'exam_completed_expanded',{enabled:true});
   assert.equal(view.corrections.find(c=>c.slotId===blank.id).verdict==='correct',correctBlank(value,blank));
   assert(view.corrections.every(c=>c.candidateRationale.length>60));assert(renderSpecimen(view.source).includes('data-local-specimen'));specimenRenders++;draftPairChecks++;
   if(!correctBlank(value,blank))draftWrongContrasts++;
  }
  // Every complete wrong vector is covered by the same reviewed per-slot contrast table.
  for(const values of combinations(q.selectionOptions,q.blanks.length)){
   const wrong=q.blanks.flatMap((b,i)=>correctBlank(values[i],b)?[]:[{b,value:values[i]}]);
   for(const {b,value} of wrong){const valueId=draft.definitions.find(v=>v.label===value).id;assert(draft.contrasts.some(t=>t.slotId===b.id&&t.choiceId===valueId&&t.verdict==='incorrect'));}
   const legacyResult=legacy(q,Object.fromEntries(q.blanks.map((b,i)=>[b.id,values[i]])));assert.equal(legacyResult.whole,wrong.length===0);offeredCompleteResponses++;if(wrong.length)offeredWrongResponses++;
  }
  for(const bad of [{},{...all,foreign:'x'},{...all,[q.blanks[0].id]:'__unknown__'}])rejectDraft(()=>reviewDraft(s,draft,bad,'exam_completed_expanded',{enabled:true}));
 }else{
  for(let selected=0;selected<4;selected++){const view=reviewDraft(s,draft,{selected},'exam_completed_expanded',{enabled:true});assert.equal(view.source.wholeCorrect,selected===q.correct);assert.equal(view.corrections.length,4);assert(renderSpecimen(view.source).includes('Reviewed service requirements'));specimenRenders++;offeredCompleteResponses++;if(selected!==q.correct)offeredWrongResponses++;}
  for(const mode of ['practice_before_answer','exam_before_answer','exam_completed_expanded']){const view=evidenceSpecimen(q,mode,{enabled:true});assert.equal(view.panels[0].content,q.diagram);assert(renderSpecimen(view).includes('Reviewed service requirements'));specimenRenders++;}
  for(const bad of [{},{selected:-1},{selected:4},{selected:'1'},{selected:NaN},{selected:1,extra:true}])rejectDraft(()=>reviewDraft(s,draft,bad,'exam_completed_expanded',{enabled:true}));
 }
 rejectDraft(()=>reviewDraft(s,{...draft,parentSourceRevision:'stale'},{},'exam_completed_expanded',{enabled:true}));
 rejectDraft(()=>reviewDraft(s,{...draft,currentFeedbackRevision:'stale'},{},'exam_completed_expanded',{enabled:true}));
 const erased=structuredClone(draft);if(erased.contrasts)erased.contrasts.pop();else erased.optionTeaching.pop();erased.candidateRevision=sig(erased);rejectDraft(()=>reviewDraft(s,erased,{},'exam_completed_expanded',{enabled:true}));
 rejectDraft(()=>reviewDraft({...s,record:{...s.record,id:'private:'+s.record.id}},draft,{},'exam_completed_expanded',{enabled:true}));
 rejectDraft(()=>reviewDraft({...s,q:{...s.q,title:'substituted source'}},draft,{},'exam_completed_expanded',{enabled:true}));
 draftChecks.push({parentRecordId:s.record.id,feedbackRecordId:s.feedback.id,candidateRevision:draft.candidateRevision,codexContentReviewed:true,completeOfferedOutcomeContrastCoverage:true,currentRuntimeDeliveryQualified:false,existingDefaultOffSpecimenReused:true,sourceParentAndFeedbackPinned:true,humanApproved:false,currentHoldResolved:false,newCredit:0});
}
const p011=candidates[1].q,alias=p011.blanks.find(b=>b.acceptedAnswers?.length);assert.deepEqual(alias.acceptedAnswers,['Fraction','Proportion']);for(const value of alias.acceptedAnswers){assert(correctBlank(value,alias));assert(!p011.selectionOptions.includes(value));const response=Object.fromEntries(p011.blanks.map(b=>[b.id,b.id===alias.id?value:b.answer]));rejectDraft(()=>reviewDraft(candidates[1],localDrafts.find(d=>d.parentRecordId==='pbq:p011'),response,'exam_completed_expanded',{enabled:true}));}
assert.deepEqual([draftPairChecks,draftWrongContrasts,specimenRenders,offeredCompleteResponses,offeredWrongResponses,invalidDraftCases],[127,102,134,56291,56285,53]);
const observedResponsePaths=probes.gradingChecks.reduce((n,r)=>n+r.completeResponsePaths,0);assert.equal(observedResponsePaths,59416);
const rowDispositions=candidateRecordIds.map(recordId=>{const parent=recordId.startsWith('pbq:'),s=candidates.find(s=>s.record.id===recordId||s.feedback.id===recordId),draft=localDrafts.find(d=>d.feedbackRecordId===s.feedback.id);return{recordId,kind:c.records.get(recordId).kind,sourceRevision:c.records.get(recordId).sourceSignature,status:parent?'PRIOR_COARSE_PARENT_DISPOSITION_SOURCE_RECHECKED_NOT_REAPPROVED':draft?'CURRENT_FEEDBACK_HOLD_RETAINED_LOCAL_FULL_CONTRAST_DRAFT_REVIEWED':'CURRENT_FEEDBACK_HOLD_RETAINED_EXPLICIT_SEMANTIC_LIMIT',candidateFeedbackRevision:parent?null:draft?.candidateRevision??null,priorParentCreditPreserved:true,newQuestionCredit:0,newFeedbackCredit:0,newCompletePairCredit:0,currentHoldResolved:false,roleProposal:null,objectiveScopeProposal:null,difficultyProposal:null,skillLabelProposal:null,teachingLinkProposals:[],familyLabelProposal:null,newFamilyCredit:0,newTrustedCredit:0,masteryWeight:0,humanReviewed:false,humanApproved:false,published:false,activationAllowed:false};});
const priorStateBindings=['priorHeldRows','deferredSelectedRows','priorStateBindings','sourceChecks','instructionalProposals','catalogueProgress','catalogueCensusBinding','newPageDispositionOverrides','objectiveCoverageBinding','remainingCatalogueRecordIds','remainingBankQuestions','remainingBankFeedback','remainingCompletePairRecordIds','bankProgress','supportProgress','starterProgress','guestProgress','canonicalBoundary','activePackageUnchanged','knownSavedMixedSetRestoreObservation'].map(field=>({packetPath:basePath,field,sourceRevision:sig(base[field]),resolved:false,newCredit:0}));
const sourceBindings=[...new Map([...base.sourceBindings,...[basePath,baseReport,baseAudit,scriptPath].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];assert.equal(sourceBindings.length,407);verifySourceBindings(sourceBindings);
const protectedFiles=readJson('docs/evidence/phase-2b5/release-checksums.json').files;assert.equal(Object.keys(protectedFiles).length,25);verifySourceBindings(Object.entries(protectedFiles).map(([path,sha256])=>({path,sha256})));
const packet={schemaVersion:1,status:'LOCAL_SEVEN_OLDER_PBQ_PAIRS_SIX_FEEDBACK_DRAFTS_ONE_SEMANTIC_LIMIT_CURRENT_HOLDS_NOT_READY',baselineCommit:'4af7eaf0495102f1cc3acbfc05e57d6d03e4f29c',authority:{masterPlan:'docs/secureplus-rebrand-master-plan.md',historicalAudit:'docs/phase-1-product-loop-audit.md',scope:'Exactly seven older question-only PBQ/full-feedback pairs;14 identities; source-bound editorial remediation only',activeChangesAllowed:false,humanApprovalInferred:false,canonicalApprovalTransferred:false},sourceBindings,allPacketReconciliation:{inventory,priorReconciliationBinding:{packetPath:basePath,sourceRevision:sig(base.allPacketReconciliation),newCredit:0}},instructionalReconciliation:{...base.instructionalReconciliation,rawPriorRows:786,distinctPriorRecords:772,newQualifiedRows:0,newPageDispositionRows:0,newDistinctPageMechanismIdentities:0,combinedRawRows:786,combinedDistinctRecords:772,combinedDuplicateOccurrences:14},candidateRecordIds,selectedRecordIds:[],questionProposals:[],explanationProposals:[],instructionalProposals:[],rowDispositions,deferredSelectedRows:[],deferredScopeRecordIds:[],sourceChecks,parentDispositionReferences,reusedEvidence,localDrafts,semanticHold,draftChecks,currentSourceProbeBinding:probeUnit.provenance,currentSourceGradingChecks:probes.gradingChecks,currentTeachingBindings:probes.teachingChecks,currentAlternateResponseChecks:probes.alternateResponseChecks,deliverySourceBindings:probes.units.map(u=>u.provenance),checks:{observedResponsePaths,draftPairChecks,draftWrongContrasts,offeredCompleteResponses,offeredWrongResponses,specimenRenders,invalidDraftCases,sourcePairwiseComparisons:152,sourcePartRationales:30,p211WholeChoicePaths:4,p211StableDisplayPaths:96,p011AcceptedUnselectableAliases:2},currentDeliveryLimits:{sixSelectorsNativeUnsupported:true,completedExamPartTeachingMissing:true,p211PracticeRequiredDiagramMissing:true,p211ExamAnsweringDiagramPresent:true,p211CompletedReviewDiagramMissing:true,existingImmutableRetentionTaxonomyHoldUnresolved:true,localSpecimenCanProjectButIsDefaultOffAndUnwired:true,noNativeKernelAdapterOrAllowlistChanged:true},candidateProgress:{codexReviewedFeedbackDrafts:6,selectorDrafts:5,wholeChoiceDrafts:1,explicitSemanticLimitPairs:1,newCurrentFeedbackCredit:0,newCompletePairCredit:0,newQuestionCredit:0,all14CurrentIdentitiesAccountedFor:true},catalogueProgress:{...base.catalogueProgress,priorDispositions:1694,newProposals:0,newQualifiedPageMechanisms:0,selectedHeldRows:7,newDistinctHeldRows:0,combinedPending:1694,remaining:184,byKind:base.catalogueProgress.byKind.map(r=>({...r,prior:r.combined,new:0}))},catalogueCensusBinding:base.catalogueCensusBinding,priorPageDispositionOverrides:base.newPageDispositionOverrides,objectiveCoverageBinding:base.objectiveCoverageBinding,newObjectiveMemberships:0,newAllSourceObjectiveMemberships:0,remainingCatalogueRecordIds:base.remainingCatalogueRecordIds,supportProgress:base.supportProgress,bankProgress:base.bankProgress,remainingBankQuestions:base.remainingBankQuestions,remainingBankFeedback:base.remainingBankFeedback,remainingCompletePairRecordIds:base.remainingCompletePairRecordIds,feedbackOnHeldParents:base.feedbackOnHeldParents,feedbackOnUnreviewedUnsupportedParents:base.feedbackOnUnreviewedUnsupportedParents,starterProgress:base.starterProgress,guestProgress:base.guestProgress,glossaryProgress:base.glossaryProgress,priorStateBindings,priorInheritedFieldBindingsVerified:752,priorHeldRows,priorHeldDeckReferences:base.priorHeldDeckReferences,newDistinctHeldRecordIds:[],totalDistinctHeldRecords:181,inspectedRecords:14,currentHoldsResolved:0,newCompletePairCredit:0,canonicalBoundary:base.canonicalBoundary,activePackageUnchanged:base.activePackageUnchanged,priorLimitedGuideReviewReference:base.priorLimitedGuideReviewReference,knownSavedMixedSetRestoreObservation:base.knownSavedMixedSetRestoreObservation,triageLedgerBinding:base.triageLedgerBinding,sourceSelectionBinding:base.sourceSelectionBinding,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,newTrustedCredit:0,newTrustedRevisionIds:[],newFamilyCredit:0,privatePayloadIncluded:false,privatePayloadFetched:false,privateCompiledHere:false,learnerRuntimeObserved:false,productionAction:false,phase3Work:false,unchangedReleaseHashes:25};
assert.equal(packet.remainingCatalogueRecordIds.length,184);assert.equal(packet.remainingCompletePairRecordIds.length,27);assert.equal(packet.bankProgress.completePairs,456);
let expectedMutations,negativeMutationChecks=0;
function validate(v){assertSafeReviewExport(v);const{negativeMutationChecks,...body}=v;assert(isDeepStrictEqual(body,packet),'Source/editorial/semantic/delivery/parent/hold/credit drift');if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,expectedMutations);}
const reject=fn=>{const bad=structuredClone(packet);fn(bad);assert(!isDeepStrictEqual(bad,packet));assert.throws(()=>validate(bad));negativeMutationChecks++;};validate(packet);
for(let i=0;i<14;i++){reject(p=>p.rowDispositions[i].sourceRevision='stale');reject(p=>p.rowDispositions[i].newCompletePairCredit=1);reject(p=>p.rowDispositions[i].currentHoldResolved=true);reject(p=>p.rowDispositions[i].humanApproved=true);}
for(let i=0;i<7;i++){reject(p=>p.sourceChecks[i].sourceRevision='stale');reject(p=>p.sourceChecks[i].publishedParentRevision='stale');reject(p=>p.currentSourceGradingChecks[i].correctPaths++);reject(p=>p.parentDispositionReferences[i].questionJudgmentChanged=true);}
for(let i=0;i<6;i++){reject(p=>p.localDrafts[i].candidateRevision='stale');reject(p=>p.localDrafts[i].currentHoldResolved=true);reject(p=>p.localDrafts[i].humanApproved=true);reject(p=>p.draftChecks[i].currentRuntimeDeliveryQualified=true);if(localDrafts[i].contrasts)for(let j=0;j<localDrafts[i].contrasts.length;j++)reject(p=>p.localDrafts[i].contrasts[j].candidateRationale='Generic retry');else for(let j=0;j<4;j++)reject(p=>p.localDrafts[i].optionTeaching[j].candidateRationale='Generic retry');}
for(let i=0;i<181;i++){reject(p=>p.priorHeldRows[i].resolved=true);reject(p=>p.priorHeldRows[i].priorDispositionRevision='stale');}
for(let i=0;i<sourceBindings.length;i++)reject(p=>p.sourceBindings[i].sha256='stale');for(let i=0;i<inventory.length;i++)reject(p=>p.allPacketReconciliation.inventory[i].sha256='stale');for(let i=0;i<priorStateBindings.length;i++)reject(p=>p.priorStateBindings[i].sourceRevision='stale');for(let i=0;i<reusedEvidence.length;i++)reject(p=>p.reusedEvidence[i].sourceRevision='stale');
for(const k of ['combinedQuestions','combinedFullFeedback','completePairs'])reject(p=>p.bankProgress[k]++);for(const k of ['humanApproved','published','activationAllowed','privatePayloadIncluded','privatePayloadFetched','privateCompiledHere','learnerRuntimeObserved','productionAction','phase3Work'])reject(p=>p[k]=true);for(const k of ['q','options','answer','correct','gradingKey','payload','learnerId','email'])reject(p=>p[k]='forbidden');
reject(p=>p.semanticHold.status='QUALIFIED');reject(p=>p.semanticHold.currentFeedbackHoldResolved=true);reject(p=>p.status='READY');reject(p=>p.totalDistinctHeldRecords=174);reject(p=>p.catalogueProgress.combinedPending+=7);reject(p=>p.supportProgress.combinedPending++);reject(p=>p.currentDeliveryLimits.p211PracticeRequiredDiagramMissing=false);reject(p=>p.currentDeliveryLimits.completedExamPartTeachingMissing=false);reject(p=>p.remainingCompletePairRecordIds.pop());reject(p=>p.remainingCatalogueRecordIds.pop());reject(p=>p.candidateProgress.newCurrentFeedbackCredit=6);
expectedMutations=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-older-pbq-editorial-remediation-proposals'),'Runtime proposal import');
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));
const draftSections=localDrafts.map(d=>{
 const source=sourceChecks.find(r=>r.parentRecordId===d.parentRecordId);
 const body=d.contrasts?d.slots.map(slot=>{
  const rows=d.contrasts.filter(t=>t.slotId===slot.id);
  return'#### Slot '+slot.id+'\n\n'+slot.context+'\n\n'+rows.map(t=>'- **'+d.definitions.find(v=>v.id===t.choiceId).label+' — '+(t.verdict==='correct'?'Correct':'Incorrect')+'.** '+t.candidateRationale).join('\n');
 }).join('\n\n'):d.optionTeaching.map(t=>'- **Offered choice '+t.choiceOrdinal+' — '+(t.verdict==='correct'?'Correct':'Incorrect')+'.** '+t.candidateRationale).join('\n');
 return`### ${d.parentRecordId} / ${d.feedbackRecordId}\n\n**Codex-reviewed LOCAL feedback candidate, not current full-feedback credit.** Candidate revision: \`${d.candidateRevision}\`. Parent/feedback source revisions remain \`${d.parentSourceRevision}\` / \`${d.currentFeedbackRevision}\`.\n\n**Proposed main teaching:** ${d.mainTeaching}\n\n${body}\n\nSource: ${source.sourceCitations.map(c=>'`'+c.path+':'+c.line+'`').join(', ')}. Exact source field/part/choice revisions remain in the packet.\n`;
}).join('\n');
const report=`# Phase 2B-5 — seven older PBQ pairs: complete-feedback editorial remediation

2026-10-15 (Asia/Singapore). Baseline: \`4af7eaf0495102f1cc3acbfc05e57d6d03e4f29c\`.
**LOCAL/default-off/unwired/learner-invisible. Phase 2B-5 and production NOT READY.**

Exactly **14 current identities** were reviewed: p004,p011,p029,p041,p043,p046,p211 and their explanation:pbq counterparts. Six source-bound feedback drafts have a Codex local content judgment: **five selector contrast tables plus p211’s four complete-set explanations**. p041 receives an explicit semantic limit instead of invented exclusive contrasts. No requested current record is unaccounted for; the p041 editorial candidate is intentionally withheld for the stated reason.

All seven earlier parent question dispositions are retained as pending coarse judgments, not reapproved or given additional credit. All seven existing full-feedback holds remain, as do all **181 distinct prior holds**. There are **zero new current-source question/feedback/pair dispositions and no cleared holds**. Local proposed teaching is a different revision, and the current Exam/practice evidence and teaching gaps are not changed by a draft or an opt-in specimen.

The master plan remains approved product authority; the Phase1 audit remains historical implementation evidence. Current source and explicit finite review override neither. There is no product-behavior change, human approval, canonical concept/role/objective/skill/difficulty/family/teaching-link assignment, mastery or publication/activation decision.

## Exact current rows and candidate status

| Current identity | Exact current revision | Status |
|---|---|---|
${rowDispositions.map(r=>'| '+r.recordId+' | `'+r.sourceRevision+'` | '+r.status+' |').join('\n')}

The source checks bind each authored/imported, preeditorial, local-effective, published-parent and feedback revision, field/part/choice fingerprints and source locations. All seven have zero selected captured snapshots/overrides and authored/imported bytes matching their preeditorial form; p211 is imported **LOCAL** content, not a private variant. The actual local publication pipeline reproduces every selected published parent revision. Parent references verify eight exact old question rows across seven parents, including both p211 contexts. No old question credit is counted twice.

## Shared root cause and existing helper reuse

The existing source-bound offline specimen already allowlists these seven exact local sources. This current-code fact supersedes the historical recommendation to build a future projection, but does not imply any active integration. Its default remains false and no runtime imports, adapter, registry, allowlist or protected file changes. This audit reuses feedbackSpecimen, evidenceSpecimen and renderSpecimen rather than adding a second source-teaching/evidence renderer.

The current six Select & Fill bundles fail native version1 on selectionFeedback; removing that field still leaves answer/component grammar rejection. Current legacy practice uses reusable literal selectors, whole grading and a displayed fractional matched-part ratio. Exam counts a partly filled task answered but whole-grades it wrong. Source part rationales and shared-value definitions are present in practice and absent from completed expanded Exam review. New candidate contrast tables cannot install native support, alter that renderer or grant component mastery.

p211’s native whole-choice compiler remains the existing coarse revision observed by the source reader; no new trusted ID is exported or manufactured. Its requirements diagram is stored but not shown by current SCENARIO practice, appears while answering Exam, and is omitted in completed expanded review. The existing offline evidence specimen can show that exact source diagram before practice and during completed review. That is local feasibility, not a deployed or current learner-visible fix. The administrator-resistant WORM-retention taxonomy hold remains separate; a clear candidate definition does not fix a glossary or canonical label.

The new review contract returns null by default. Explicit opt-in requires the exact reviewed draft, unchanged parent/feedback source and a complete current offered response. Unknown/foreign slots, unknown values, malformed choices, private/source substitutions and missing teaching fail closed; reuse of offered values across slots remains legal. After a valid complete response, it returns the main draft and one bound contrast per slot, or all four p211 option explanations. It does not execute real submit/persistence/analytics code or expose a new trusted grammar.

## p041 — explicit semantic hold

${semanticHold.reason}

The source’s at-rest-on-disk and backup-on-tape prompts, disk/file encryption and backup-media encryption demonstrate the overlap. The pure legacy key still marks the tape-labelled choice wrong in the generic disk slot; a mechanical wrong result is not proof that backup encryption cannot protect stored data. Likewise TLS channel protection and S/MIME message protection can be combined and do not define five exclusive data states. No full wrong-choice contrast table is approved for this source without tighter threat/asset/key/access and channel/message premises or a clearly limited named-example contract.

The previous coarse parent disposition remains on record, with no new requalification, independent skill or automatic revocation. Its existing full-feedback semantic/delivery hold remains unresolved. This is the one pair without a complete revised teaching candidate; it is explicitly accounted for rather than included in the six draft count or disguised as complete generic feedback.

## Reviewable local candidate text

All text below is a public editorial draft, never merged into active source. Existing offered labels and intended response associations remain source-bound. The selector wrong-choice explanations name both the selected meaning and the requested meaning, rather than repeat only the answer key. The two transfer subtypes are explicitly described as overlapping illustrations of the same broad strategy. p011/p029 share formula vocabulary and do not create independent families. No invented monetary computation, legal result, incident success, recovery performance or learning benefit is inferred.

${draftSections}

## Offered-outcome coverage and limits

| Check | Result |
|---|---|
| Reused actual current scoring probes |59,416 complete responses across all seven current parents; legacy practice/Exam whole results agree under their current keys. Six selectors have30 part rationales/definitions and152 offered slot/value associations.|
| Five revised selector draft tables |127 offered slot/value pairs:25 intended matches and102 wrong-choice contrasts. p041’s25 source associations are replayed but not approved as revised semantic contrasts.|
| Complete candidate outcome coverage |56,291 full vectors/choices across the five selector drafts and p211;56,285 are wrong. Every wrong slot in every covered vector resolves to its exact reviewed contrast, including repeated values. There are six fully correct responses across these six tasks, not separate skills.|
| p211 complete offered responses |Four complete sets, one current keyed match and three revised full-set corrections. The first wrong option now discusses all three missed requirements rather than just service/data recovery.|
| Source specimen rendering |134 static source-specimen renders verify existing source part/definition teaching and p211 requirements projection. This does not render all56,291 vectors or wire the new candidate contrasts into the app.|
| Explicit contract rejection checks |${invalidDraftCases} stale/missing/rehashed teaching, malformed/unknown/incomplete/foreign/private/source substitution cases fail closed.|
| p011 alternatives |Fraction and Proportion remain accepted by the pure grader but absent from the literal current UI. They are not new offered choices; the strict offered-response draft contract rejects them while preserving that source fact.|
| Native p211 display identity |The reused current-source block checks24 stable display permutations/96 grading paths, malformed selections, integrity changes and duplicate displays. Existing native support is not new qualification or evidence delivery.|

The counter-rationale coverage proof is compositional: all finite whole vectors are marked by the actual legacy source, and each wrong slot is looked up in the reviewed exact slot/value contrast table. It does not assert that a source-defined key establishes universal conceptual exclusion. That distinction is why p041 remains withheld. The six selectors’ original59,412 complete paths include p041 and remain mechanical source evidence only. Current normalization, hints, aliases, practice completeness and Exam answered-state differences stay bound by the reused probes.

Candidate main/contrasts are separate from the existing source-specimen view and are deliberately reviewable in this report/packet. Real practice/Exam integration, pre/post-answer controls, persistent review access, browser/keyboard/screen-reader behavior and learner benefit remain untested. No React application, account, storage, payment, network, real scenario, legal process or learner attempt runs. Static offline rendering is not production observation.

## Reconciliation and preserved boundaries

| Measure | Prior | New current-source credit | Current /total | Remaining |
|---|---:|---:|---:|---:|
| Catalogue dispositions |1694|0|1694 /1878|184|
| Support teaching |748|0|748 /834|86|
| Bank questions |463|0|463 /483|20|
| Full feedback |464|0|464 /483|19|
| COMPLETE bank pairs |456|0|456 /483|27|
| Older question-only full-feedback gaps |7|0 resolved|7 gaps|7|
| Distinct unresolved holds |181|0 added,0 cleared|181|Unresolved|

The seven selected feedback records remain outside464; their prior parents remain within463. A candidate draft or source renderer fixture is not current qualified feedback, so no new COMPLETE pair is counted. Existing feedback on held parents remains8, with0 on unreviewed unsupported parents. Starter pairs stay0/9 and guest pairs0/2. Page dispositions stay6 bounded/10 held; selector dispositions stay7 bounded/19 held. The184 remaining catalogue IDs still contain180 held records and four unheld private variants; the carried pbq:p036 hold remains outside that remaining set. These overlapping counts are not additive.

All **132 previous substantive packets** reconcile to1694 distinct prior dispositions. Legacy primary-array counts remain **786 raw /772 distinct /14 repeats**; prior page/selector mechanism rows still have zero teaching credit. The audit verifies **407 source-file pins**, all **181 prior held identities/revisions**, **752 inherited field bindings**,20 new baseline-state bindings and eight reused evidence fields. The full prior catalogue/objective censuses and six page overrides are carried by reference; all21 objective totals/remaining IDs stay unchanged, with no new canonical scope from the selected parents’ observed tags.

All old source-choice, private p003/p017, HOTSPOT/starter/guest drafts, held decks, limited-guide, RTO/RPO/MTTR/retention, family/canonical and saved mixed-set restore boundaries remain exact/unresolved. Prior primary-reference scopes and retrieval limits remain pinned through the seven-feedback recheck packet; no fresh full-standard, legal/jurisdiction, vendor, financial-model or operational assessment is claimed.

## Validation and release limits

The focused packet guard rejects **${negativeMutationChecks} altered packets** for stale parent/source/feedback/draft bindings, generic substituted contrast, erased p041/prior holds, false actual delivery, pair/census inflation, human/canonical/family/trusted/mastery claims, raw/private/learner fields and READY promotion. All25 protected release hashes, native-v1/v2, ledger, mapping package, source choices and existing disabled specimen stay exact. Required gates are deterministic write/recheck, all29 content-mapping tests and deterministic active-package reproduction, git diff --check and actual **skip exit0 /control1**.

Commit/push exactly this report, its packet and focused audit with **[skip deploy]**. Verify HEAD/origin/main/remote main/GitHub API main and exact local/committed/remote artifact bytes/SHA-256s. Preserve eight unrelated dirty entries and an empty index. Git delivery does not establish deployment.

No active runtime/content edit, private/live/deployment action, adapter/allowlist/entitlement change, publication/activation or Phase3 work occurs. The finite14-record remediation review is complete, with six local feedback drafts and one explicit semantic limit; all current feedback holds remain. **Phase 2B-5 and production NOT READY.**
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report);
console.log(JSON.stringify({status:packet.status,inspectedRecords:14,priorParentDispositionsPreserved:7,priorFeedbackHoldsPreserved:7,codexReviewedFeedbackDrafts:6,explicitSemanticLimitPairs:1,newQuestionCredit:0,newFeedbackCredit:0,newCompletePairCredit:0,newDistinctHolds:0,totalDistinctHolds:181,negativeMutationChecks,checks:packet.checks,sourceBindings:407,priorPackets:132,priorInheritedFields:752,baselineStateBindings:20,catalogueDispositions:1694,catalogueRemaining:184,supportDispositions:748,supportRemaining:86,bankQuestions:463,bankFeedback:464,bankCompletePairs:456,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
