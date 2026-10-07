import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {readSelectors,sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
import {getDeepDiveRecommendations} from '../src/lib/deepDiveRecommendations.js';
import {compileRevision} from '../server/adaptive/revision.mjs';
const packetPath='docs/drafts/phase-2b5-objective12-foundations-mcq-proposals.json',reportPath='docs/phase-2b5-objective12-foundations-mcq-review.md';
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex'),json=path=>JSON.parse(readFileSync(path));
const p=json(packetPath),pkg=json('docs/evidence/phase-2b5/mapping-package.json'),bank=readLearningPilotBank();
const records=new Map(pkg.records.map(r=>[r.id,r])),concepts=new Map(pkg.concepts.map(c=>[c.id,c]));
const priorPaths=['docs/drafts/phase-2b5-objective11-controls-mapping-proposals.json','docs/drafts/phase-2b5-objective11-support-mapping-proposals.json','docs/drafts/phase-2b5-objective12-zero-trust-mapping-proposals.json'];
const prior=priorPaths.map(json),previous=new Map();prior.forEach((packet,i)=>{for(const r of [...(packet.questionProposals||[]),...(packet.explanationProposals||[]),...(packet.instructionalProposals||[])])previous.set(r.recordId,{path:priorPaths[i],row:r});});
assert.equal(p.baselineCommit,'f2116329791935af8be95369c8e5a0097c81f713');assert.equal(p.status,'LOCAL_SEMANTIC_PROPOSALS_NOT_READY');
assert.equal(hash('docs/evidence/phase-2b5/mapping-package.json'),'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');
assert.deepEqual(priorPaths.map(hash),['0ba95c5c8f8a00e091daa9d852de0350a01ca00bedcba7c317155ea94cad88a9','46cf5a704690aa85606a1167b72f221aea09234635e3062aec067e7967abb4c9','fce8683567473a28ce8e903190e977345339f33df022ef56425c18d3bdfe225d']);
for(const s of p.sourceBindings)assert.equal(hash(s.path),s.sha256,'Source drift: '+s.path);
assert.equal(p.bankSignature,contentSignature(bank));
for(const key of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(p[key],false);assert.equal(p.masteryWeight,0);assert.equal(p.newFamilyCredit,0);
assert(!/"(?:q|question|prompt|clue|opts|options|answer|correct|wrongFeedback|optionFeedback|selectionFeedback|explanation|exp|payload|learnerId|email)"\s*:/.test(JSON.stringify(p)),'No authored grading or private payload fields');
const expectedIds=['m002','m033','m036','m044','m057','m103','m114','m201','m260','m399','m413','m602','m642','m653','m656'];
assert.deepEqual(p.questionProposals.map(r=>r.questionId),expectedIds);assert.equal(p.explanationProposals.length,15);
assert.deepEqual(expectedIds,bank.mcqs.filter(q=>prior[2].remainingObjective12RecordIds.includes('mcq:'+q.id)).map(q=>q.id));
const rows=[...p.questionProposals,...p.explanationProposals],selected=new Set(rows.map(r=>r.recordId));assert.equal(rows.length,30);assert.equal(selected.size,30);assert(rows.every(r=>!previous.has(r.recordId)),'Prior overlap');
const broad=pkg.records.filter(r=>r.objectiveCodes.includes('1.2')),old=broad.filter(r=>previous.has(r.id)),remaining=broad.filter(r=>!previous.has(r.id)&&!selected.has(r.id));
assert.equal(old.length,54);assert.equal(new Set([...old.map(r=>r.id),...selected]).size,84);assert.equal(remaining.length,42);
assert.deepEqual(p.priorDispositionReferences,old.map(r=>({recordId:r.id,sourceRevision:r.sourceSignature,priorPacketPath:previous.get(r.id).path,priorLocalProposalRevision:previous.get(r.id).row.sourceRevision})));
assert.deepEqual(p.remainingObjective12Records,remaining.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:'remaining_not_semantically_reviewed_here'})));
assert(!remaining.some(r=>r.kind==='mcq'));assert.deepEqual(remaining.filter(r=>['pbq','explanation_bundle'].includes(r.kind)).map(r=>r.id),['explanation:pbq:p055','pbq:p055']);
assert.equal(records.get('pbq:p055').precision,'coarse');assert(!selected.has('pbq:p055'));
for(const [key,value]of Object.entries({broadObjective12Candidates:126,priorDistinctObjective12Dispositions:54,newRecords:30,newMcqs:15,newFeedbackBundles:15,newPbqs:0,newInstructionalRecords:0,combinedDistinctDispositions:84,combinedMcqs:20,combinedMcqFeedback:20,remainingCandidates:42,remainingMcqs:0,remainingPbqs:1,remainingFeedbackBundles:1,remainingInstructionalOrContainerRecords:40}))assert.equal(p.denominator[key],value);
const proof=json('docs/evidence/phase-2b5/private-catalogue-read.json'),reconciliation=json('docs/evidence/phase-2b5/private-reconciliation.json');
const safe=proof.overrides.filter(row=>reconciliation.overrides.some(x=>x.id===row.question_id&&x.kind===row.question_kind&&x.capturedSignatureMatches&&x.payloadMatches));
const published=publicationPipeline(bank).overrides(safe),pubById=new Map(published.mcqs.map(q=>[q.id,q]));
const CIA=['sy0701.term.cia','sy0701.term.cia-triad'],least=['sy0701.term.least-privilege','sy0701.term.least-privilege-principle'];
const ciaIds=['m002','m033','m103','m399','m656'],leastIds=['m413','m653'],physicalIds=['m036','m602'];
const familyGroups={
 'service-access-availability-recognition':['m002'],
 'data-alteration-integrity-recognition':['m033','m103','m399','m656'],
 'controlled-vestibule-recognition':['m036','m602'],
 'split-sensitive-duties-recognition':['m044','m057','m114'],
 'joint-authorised-operation-recognition':['m201','m642'],
 'monitored-decoy-recognition':['m260'],
 'job-required-permission-scope-recognition':['m413','m653'],
};
const support=id=>assert.equal(concepts.get(id)?.nodeKind,'supporting_concept','Use existing support only');
function validateQuestion(row){
 const q=bank.mcqs.find(q=>q.id===row.questionId),pub=pubById.get(row.questionId),r=records.get(row.recordId);assert(q&&pub&&r);
 assert.equal(row.sourceRevision,contentSignature(q),'Stale local revision');assert.equal(row.publishedRecordSignature,contentSignature(pub),'Stale publication revision');assert.equal(row.publishedRecordSignature,r.sourceSignature);
 const {_baseOrder,...semantic}=pub;assert.equal(contentSignature(semantic),contentSignature(q),'Captured semantics differ from reviewed local fields');
 assert.equal(row.capturedTrustedRevisionId,compileRevision(pub,'mcq').revisionId);assert.equal(row.capturedTrustedRevisionId,r.trustedRevisionId);assert.equal(r.primaryConceptId,null);
 assert.equal(row.objectiveObserved,'1.2');assert.equal(row.domainObserved,q.ch);assert.equal(row.topicObserved,q.topic);assert.equal(row.publicationStatusObserved,'active');
 assert.equal(row.formatObserved,'MCQ');assert.equal(row.precisionObserved,'direct');assert.equal(row.difficultyObserved,q.difficulty,'No difficulty promotion');assert.equal(row.difficultyDisposition,'retain_source_label_without_calibration_or_transfer_claim');
 assert.equal(row.primaryConceptProposal,null,'No invented primary mastery');assert.deepEqual(row.secondaryConceptProposals,[],'No distractor secondary');assert.deepEqual(row.assessedCanonicalRoleProposals,[],'Precise unapproved assessed identities stay withheld');assert.equal(row.masteryWeight,0,'No new mastery');assert.equal(row.newFamilyCredit,0,'No new family credit');assert.equal(row.humanApproved,false);
 assert.deepEqual(row.withheldCanonicalCandidates,ciaIds.includes(q.id)?CIA:leastIds.includes(q.id)?least:[]);row.withheldCanonicalCandidates.forEach(support);
 assert.deepEqual(row.contextCanonicalRoleProposals,physicalIds.includes(q.id)?[{conceptId:'sy0701.term.tailgating',role:'scenario_context_not_assessed_control_identity',weight:0}]:[]);
 row.contextCanonicalRoleProposals.forEach(c=>support(c.conceptId));
 assert.deepEqual(row.objectiveScopeProposal.assessedCodes,leastIds.includes(q.id)?['4.6']:['1.2']);assert.equal(row.objectiveScopeProposal.activeObjectiveTagChanged,false);
 assert.equal(row.familyLabelProposal,Object.entries(familyGroups).find(([,ids])=>ids.includes(q.id))[0],'Do not fragment surface variants');
 assert(row.assessedUnderstanding.length>35&&row.excludedEvidenceClaims.length>=2);
 assert.deepEqual(row.legacyLessonProbe.lessonIds,getDeepDiveRecommendations([q],{limit:2}).map(d=>d.id));assert.equal(row.legacyLessonProbe.approvedRemediation,false);assert.equal(row.legacyLessonProbe.type,'local_single_miss_fixture_not_learner_session');
}
p.questionProposals.forEach(validateQuestion);const first=p.questionProposals[0];
assert.throws(()=>validateQuestion({...first,sourceRevision:'sha256:stale'}),/Stale local/);
assert.throws(()=>validateQuestion({...first,publishedRecordSignature:'sha256:stale'}),/Stale publication/);
assert.throws(()=>validateQuestion({...first,primaryConceptProposal:'recovery.rto'}),/invented primary/);
assert.throws(()=>validateQuestion({...first,assessedCanonicalRoleProposals:[{conceptId:'sy0701.objective.1.2',weight:1}]}),/stay withheld/);
assert.throws(()=>validateQuestion({...first,secondaryConceptProposals:['sy0701.term.digital-signature']}),/distractor secondary/);
assert.throws(()=>validateQuestion({...first,difficultyObserved:'hard'}),/difficulty promotion/);
assert.throws(()=>validateQuestion({...first,newFamilyCredit:1}),/family credit/);
assert.throws(()=>validateQuestion({...p.questionProposals.find(r=>r.questionId==='m653'),familyLabelProposal:'new-payroll-surface'}),/surface variants/);
assert.throws(()=>validateQuestion({...p.questionProposals.find(r=>r.questionId==='m413'),contextCanonicalRoleProposals:[{conceptId:least[0],role:'assessed',weight:1}]}));
const bundle=q=>({exp:q.exp,explanation:q.explanation,wrongFeedback:q.wrongFeedback,optionFeedback:q.optionFeedback,items:q.items,blanks:q.blanks,selectionFeedback:q.selectionFeedback});
for(const row of p.explanationProposals){
 const parent=p.questionProposals.find(q=>q.recordId===row.parentId);assert(parent);const q=bank.mcqs.find(q=>q.id===parent.questionId),pub=pubById.get(q.id);
 assert.equal(row.recordId,'explanation:'+parent.recordId);assert.equal(row.kind,'explanation_bundle');assert.equal(row.sourceRevision,contentSignature(bundle(q)));assert.equal(row.sourceRevision,contentSignature(bundle(pub)));assert.equal(row.sourceRevision,records.get(row.recordId).sourceSignature);
 assert.equal(row.parentLocalRevision,parent.sourceRevision);assert.equal(row.parentPublishedRevision,parent.publishedRecordSignature);assert.deepEqual(row.objectiveScopeProposal,parent.objectiveScopeProposal);
 assert.equal(row.roleProposal,'conditional_answer_linked_feedback_teaching');assert.equal(row.primaryConceptProposal,null);assert.deepEqual(row.secondaryConceptProposals,[]);assert.equal(row.masteryWeight,0);assert.equal(row.newFamilyCredit,0);assert.equal(row.humanApproved,false);assert.equal(row.independentEvidence,false);assert.equal(row.trustedRevisionId,null);assert.equal(row.familyRelation,'same_parent_feedback_not_independent_family');assert.equal(row.deliveryGate,'submitted_pro_feedback_access_selected_wrong_option_details');assert.equal(row.usefulnessAfterMissProposal.status,'source_reasoned_correction_not_validated_recovery');assert(row.usefulnessAfterMissProposal.rationale.length>60);
 const links=q.id==='m103'?['sy0701.term.hashing','sy0701.term.digital-signature']:q.id==='m656'?['sy0701.term.hashing']:[];
 assert.deepEqual(row.conceptLinkProposals,links.map(conceptId=>({conceptId,role:'instructional_mechanism_context_not_assessed_property',weight:0})));links.forEach(support);
 assert.deepEqual(row.withheldCanonicalCandidates,[...parent.withheldCanonicalCandidates,...(q.id==='m103'?['sy0701.term.mac']:[])]);row.withheldCanonicalCandidates.forEach(support);
 assert.equal(row.contentQualification,parent.contentQualification);
}
assert.equal(p.questionProposals.filter(r=>r.difficultyObserved==='medium').length,1);assert.equal(p.questionProposals.find(r=>r.difficultyObserved==='medium').questionId,'m399');
assert.deepEqual(p.familyGroups.map(g=>[g.label,g.recordIds]),Object.entries(familyGroups).map(([label,ids])=>[label,ids.map(id=>'mcq:'+id)]));for(const g of p.familyGroups){assert.equal(g.approvedIndependentFamilies,0);assert.equal(g.newFamilyCredit,0);}
assert.equal(p.priorFamilyComparisons.length,3);for(const group of p.priorFamilyComparisons){assert(previous.has(group.priorRecordId));assert(group.currentQuestionIds.every(id=>expectedIds.includes(id)));}
assert(p.questionProposals.find(r=>r.questionId==='m602').contentQualification);assert(p.questionProposals.find(r=>r.questionId==='m642').contentQualification);
for(const id of ['m044','m057','m114','m201','m642'])assert.equal(p.questionProposals.find(r=>r.questionId===id).objectiveScopeProposal.status,'related_general_principle_not_named_1.2_bullet');
assert.equal(p.canonicalBoundary.primaryMasteryProposalsWithheld,15);assert.equal(p.canonicalBoundary.newMasteryIdentities,0);assert.equal(p.canonicalBoundary.assessedCanonicalIdentitiesProposed,0);assert.equal(p.canonicalBoundary.topicOrSupportPromotionAllowed,false);assert.deepEqual(p.canonicalBoundary.ambiguitiesPreserved.CIA,CIA);assert.deepEqual(p.canonicalBoundary.ambiguitiesPreserved.leastPrivilege,least);assert.equal(p.canonicalBoundary.noRecoveryInferenceFromAvailabilityScenario,true);
const selectors=new Map(readSelectors().map(s=>['intervention:'+s.id,s]));assert.equal(p.selectorBindings.length,2);for(const s of p.selectorBindings){assert.equal(s.sourceRevision,selectors.get(s.recordId)?.sourceSignature);assert.equal(s.sourceRevision,records.get(s.recordId).sourceSignature);assert.equal(s.limitation,selectors.get(s.recordId).selector.mappingDependencies);}
assert.equal(p.deliveryBindings.length,1);for(const b of p.deliveryBindings)assert.deepEqual(sourceUnit(b.path,b.anchor,b.endAnchor).provenance,(({id,...rest})=>rest)(b));
const unit=sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal(').code;assert(unit.includes('const canSeeFeedback = user.tier === "pro";'));assert(unit.includes('getDeepDiveRecommendations(')&&unit.includes('getWrongOptionFeedback(current, i)')&&unit.includes('current.exp'));assert(unit.includes('showSelectedWrongFeedback=submitted&&canSeeFeedback&&i===selected&&i!==current.correct'));
for(const [key,count]of [['packageRecordsUnchanged','records'],['reviewQueueUnchanged','reviewQueue'],['unresolvedQuestionMappingsUnchanged','unresolvedQuestionMappings'],['existingPrimaryQuestionProposalsUnchanged','primaryQuestionProposals']])assert.equal(p.phaseWideBacklog[key],pkg.counts[count]);
for(const [kind,key]of [['mastery_concept','masteryConcepts'],['topic','topics'],['supporting_concept','supportingConcepts']])assert.equal(p.phaseWideBacklog.taxonomyUnchanged[key],pkg.concepts.filter(c=>c.nodeKind===kind).length);
assert.equal(p.phaseWideBacklog.humanApprovedNewMappings,0);assert.equal(p.phaseWideBacklog.eligibleNewEvidence,0);assert.equal(p.humanDecisionReferences.humanApprovalRequestedThisTurn,false);
assert.equal(p.privateBoundary.sourceRevision,'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42');assert.equal(p.privateBoundary.sourceRevision,records.get('private:pbq:p017').sourceSignature);assert.equal(p.privateBoundary.trustedRevisionId,null);assert.equal(p.privateBoundary.payloadReviewed,false);assert.equal(p.privateBoundary.masteryWeight,0);
const manifest=json('docs/evidence/phase-2b5/release-checksums.json');assert.equal(Object.keys(manifest.files).length,25);for(const [path,sha]of Object.entries(manifest.files))assert.equal(hash(path),sha,'Active release changed: '+path);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-objective12-foundations-mcq-proposals'),'Runtime proposal import');
assert(readFileSync(reportPath,'utf8').includes(hash(packetPath)),'Report packet binding');
console.log(JSON.stringify({status:'PASS_BOUND_OFFLINE_FOUNDATION_PROPOSALS_NOT_APPROVAL',counts:{newMcqs:15,newFeedback:15,newRecords:30,priorDispositions:54,combinedDispositions:84,remaining:42,remainingMcqs:0,remainingPbqs:1,remainingFeedback:1,remainingInstructional:40,familyLabels:7,approvedNewMappings:0,eligibleNewEvidence:0,unchangedReleaseHashes:25,queueUnchanged:2954,unresolvedQuestionMappingsUnchanged:489},sha256:Object.fromEntries([packetPath,reportPath,'scripts/audit-objective12-foundations-mcq.mjs'].map(path=>[path,hash(path)]))}));
