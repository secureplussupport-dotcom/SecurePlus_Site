import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {readSelectors,sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {getSy0701DeepDiveProfile} from '../src/data/sy0701DeepDiveMap.js';
import {buildDeepDivePracticeQuestions,buildDeepDiveFlashcards} from '../src/lib/deepDiveStudy.js';
import {getDeepDiveRecommendations} from '../src/lib/deepDiveRecommendations.js';
const packetPath='docs/drafts/phase-2b5-objective12-zero-trust-mapping-proposals.json',reportPath='docs/phase-2b5-objective12-zero-trust-mapping-review.md';
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex'),json=path=>JSON.parse(readFileSync(path));
const p=json(packetPath),pkg=json('docs/evidence/phase-2b5/mapping-package.json'),bank=readLearningPilotBank();
const records=new Map(pkg.records.map(r=>[r.id,r])),concepts=new Map(pkg.concepts.map(c=>[c.id,c]));
const priorPaths=['docs/drafts/phase-2b5-objective11-controls-mapping-proposals.json','docs/drafts/phase-2b5-objective11-support-mapping-proposals.json'];
const previous=new Map();
for(const path of priorPaths){const old=json(path);for(const r of [...(old.questionProposals||[]),...(old.explanationProposals||[]),...(old.instructionalProposals||[])])previous.set(r.recordId,{path,row:r});}
assert.equal(p.baselineCommit,'667165a66688e1dbb2f024e9c665eea6e186ff20');assert.equal(p.status,'LOCAL_SEMANTIC_PROPOSALS_NOT_READY');
assert.equal(hash('docs/evidence/phase-2b5/mapping-package.json'),'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');
assert.equal(hash(priorPaths[0]),'0ba95c5c8f8a00e091daa9d852de0350a01ca00bedcba7c317155ea94cad88a9');
assert.equal(hash(priorPaths[1]),'46cf5a704690aa85606a1167b72f221aea09234635e3062aec067e7967abb4c9');
assert.equal(contentSignature(bank),p.bankSignature);
for(const s of p.sourceBindings)assert.equal(hash(s.path),s.sha256,'Source drift: '+s.path);
for(const key of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(p[key],false);
assert.equal(p.masteryWeight,0);assert.equal(p.newFamilyCredit,0);
assert(!/"(?:q|question|prompt|clue|options|opts|answer|correct|wrongFeedback|optionFeedback|selectionFeedback|explanation|exp|payload|learnerId|email)"\s*:/.test(JSON.stringify(p)),'No graded/private payload fields in review export');
const rows=[...p.questionProposals,...p.explanationProposals,...p.instructionalProposals],selected=new Set(rows.map(r=>r.recordId));
assert.equal(rows.length,20);assert.equal(selected.size,20);assert(rows.every(r=>!previous.has(r.recordId)),'Prior dispositions cannot inflate the new slice');
const broad=pkg.records.filter(r=>r.objectiveCodes.includes('1.2')),old=broad.filter(r=>previous.has(r.id));
const remaining=broad.filter(r=>!selected.has(r.id)&&!previous.has(r.id));
assert.deepEqual(p.census.broadObjective12Records,broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,disposition:previous.has(r.id)?'prior_objective11_disposition':selected.has(r.id)?'new_slice_proposal':'remaining_candidate_not_semantically_reviewed_here'})));
assert.deepEqual(p.reusedPriorDispositionReferences,old.map(r=>({recordId:r.id,sourceRevision:r.sourceSignature,priorPacketPath:previous.get(r.id).path,priorProposalRevision:previous.get(r.id).row.sourceRevision})));
assert(old.every(r=>previous.get(r.id).row.sourceRevision===r.sourceSignature));
assert.deepEqual(p.remainingObjective12RecordIds,remaining.map(r=>r.id));
assert.equal(broad.length,126);assert.equal(old.length,34);assert.equal(remaining.length,72);
assert.equal(new Set([...old.map(r=>r.id),...selected]).size,54);
for(const [key,value]of Object.entries({broadObjective12Candidates:126,effectiveMcqs:20,effectivePbqs:1,feedbackBundles:21,lessonContainers:3,lessonRelatedRecords:31,alreadyDispositionedInObjective11:34,newSliceRecords:20,newMcqs:5,newFeedbackBundles:5,newLessonRecords:10,distinctDispositionedObjective12CandidatesIncludingPrior:54,remainingObjective12Candidates:72,remainingEffectiveMcqs:15,remainingEffectivePbqs:1}))assert.equal(p.denominator[key],value);
const effective=[...bank.mcqs,...bank.pbqs].filter(q=>q.objective==='1.2');assert.equal(effective.length,21);
assert.deepEqual(p.census.effectiveQuestionRevisions,effective.map(q=>{const r=records.get((bank.mcqs.includes(q)?'mcq:':'pbq:')+q.id),e=records.get('explanation:'+r.id);return {recordId:r.id,sourceRevision:contentSignature(q),publishedRecordSignature:r.sourceSignature,feedbackRecordId:e.id,feedbackRevision:e.sourceSignature,difficultyObserved:q.difficulty,formatObserved:r.questionFormat,precisionObserved:r.precision,publicationStatusObserved:r.publicationStatus,trustedRevisionIdObserved:r.trustedRevisionId??null,disposition:selected.has(r.id)?'new_slice_question':'remaining_question'};}));
assert.equal(records.get('pbq:p055').precision,'coarse');assert(!selected.has('pbq:p055'));
const support=id=>assert.equal(concepts.get(id)?.nodeKind,'supporting_concept','Existing support node only');
function validateQuestion(row){
 const q=bank.mcqs.find(q=>q.id===row.questionId),r=records.get(row.recordId);assert(q&&r);
 assert.equal(row.sourceRevision,contentSignature(q),'Stale question revision');assert.equal(row.publishedRecordSignature,r.sourceSignature);
 assert.equal(row.capturedTrustedRevisionId,r.trustedRevisionId);assert.equal(row.evidencePrecisionObserved,'direct');
 assert.equal(row.objectiveObserved,'1.2');assert.equal(row.domainObserved,q.ch);assert.equal(row.difficultyObserved,q.difficulty);
 assert.equal(row.difficultyObserved,'easy','Do not promote source difficulty');assert.equal(row.difficultyDisposition,'retain_source_easy_not_calibrated_or_promoted');
 assert.equal(row.primaryConceptProposal,null,'No unapproved primary');assert.deepEqual(row.secondaryConceptProposals,[],'No distractor secondary');
 assert.equal(row.masteryWeight,0,'No mastery credit');assert.equal(row.newFamilyCredit,0,'No surface-family credit');assert.equal(row.humanApproved,false);
 assert.equal(row.topicContextProposal,'sy0701.objective.1.2');assert.deepEqual(row.objectiveScopeProposal.assessedCodes,['1.2']);
 assert.deepEqual(row.assessedCanonicalRoleProposals,row.questionId==='m038'?[]:[{conceptId:'sy0701.term.zero-trust',role:'assessed_supporting_meaning',weight:0}]);
 assert.deepEqual(row.supportConceptProposals,row.questionId==='m038'?['sy0701.term.zero-trust']:[]);
 for(const c of row.assessedCanonicalRoleProposals)support(c.conceptId);row.supportConceptProposals.forEach(support);
 assert.equal(row.familyLabelProposal,row.questionId==='m038'?'zero-trust-policy-engine-role':'implicit-network-trust-rejection');
 assert.deepEqual(row.legacyLessonProbe.lessonIds,getDeepDiveRecommendations([q],{limit:2}).map(d=>d.id));
 assert.deepEqual(row.legacyLessonProbe.lessonIds,['security-foundations-controls','identity-zero-trust']);
 assert.equal(row.legacyLessonProbe.approvedRemediation,false);assert.equal(row.legacyLessonProbe.type,'local_single_miss_fixture_not_learner_session');
}
assert.deepEqual(p.questionProposals.map(r=>r.questionId),['m007','m038','m158','m226','m621']);p.questionProposals.forEach(validateQuestion);
const first=p.questionProposals[0];
assert.throws(()=>validateQuestion({...first,sourceRevision:'sha256:stale'}),/Stale question/);
assert.throws(()=>validateQuestion({...first,primaryConceptProposal:'sy0701.objective.1.2'}),/unapproved primary/);
assert.throws(()=>validateQuestion({...first,secondaryConceptProposals:['sy0701.term.mfa']}),/distractor secondary/);
assert.throws(()=>validateQuestion({...first,difficultyObserved:'hard'}));
assert.throws(()=>validateQuestion({...first,newFamilyCredit:1}),/surface-family credit/);
assert.equal(p.questionProposals.filter(r=>r.familyLabelProposal==='implicit-network-trust-rejection').length,4);
const explanation=q=>({exp:q.exp,explanation:q.explanation,wrongFeedback:q.wrongFeedback,optionFeedback:q.optionFeedback,items:q.items,blanks:q.blanks,selectionFeedback:q.selectionFeedback});
assert.equal(p.explanationProposals.length,5);
for(const row of p.explanationProposals){const parent=p.questionProposals.find(q=>q.recordId===row.parentId),q=bank.mcqs.find(q=>q.id===parent.questionId);assert.equal(row.sourceRevision,contentSignature(explanation(q)));assert.equal(row.sourceRevision,records.get(row.recordId).sourceSignature);assert.equal(row.parentQuestionRevision,parent.sourceRevision);assert.equal(row.roleProposal,'conditional_feedback_teaching');assert.equal(row.deliveryGate,'submitted_pro_feedback_access_selected_wrong_option_details');}
const d=CONCEPT_DEEP_DIVES.find(d=>d.id==='identity-zero-trust'),profile=getSy0701DeepDiveProfile(d),generated=buildDeepDivePracticeQuestions(d);
assert.equal(generated.length,3);assert.deepEqual(profile.objectiveCodes,['4.6','1.2']);assert.deepEqual(profile.beyondSections,[2]);
const lessonValues=new Map([['lesson:'+d.id,{d,profile}],...d.sections.map((s,i)=>['section:'+d.id+':'+i,s]),['keywords:'+d.id,profile.keywordGuide],['traps:'+d.id,d.traps],['check:'+d.id,d.check],...generated.map(q=>['practice:'+q.id,q])]);
assert.equal(p.instructionalProposals.length,10);assert.deepEqual(p.instructionalProposals.map(r=>r.recordId),[...lessonValues.keys()]);
for(const row of [...p.explanationProposals,...p.instructionalProposals]){
 const r=records.get(row.recordId);assert.equal(row.sourceRevision,r.sourceSignature);assert.equal(row.kind,r.kind);assert.deepEqual(row.objectiveCodesObserved,r.objectiveCodes);
 assert.equal(row.primaryConceptProposal,null);assert.deepEqual(row.secondaryConceptProposals,[]);assert.equal(row.masteryWeight,0);assert.equal(row.newFamilyCredit,0);assert.equal(row.humanApproved,false);assert.equal(row.independentEvidence,false);assert.equal(row.trustedRevisionId,null);
 row.conceptLinkProposals.forEach(support);(row.withheldCanonicalCandidates||[]).forEach(support);
 if(lessonValues.has(row.recordId)){
  const value=lessonValues.get(row.recordId);assert.equal(row.sourceRevision,contentSignature(value));assert.equal(row.difficultyObserved.lesson,'Applied');
  assert.equal(row.difficultyDisposition,'instructional_Applied_label_not_assessment_calibration');
  for(const sub of row.subunits){const match=/^(body)?\[(\d+)\]$/.exec(sub.path);assert(match);const actual=match[1]?value.body[Number(match[2])]:value[Number(match[2])];assert.equal(sub.sourceRevision,contentSignature(actual));assert.equal(sub.weight,0);sub.conceptLinkProposals.forEach(support);sub.withheldCanonicalCandidates.forEach(support);}
 }
}
const instruction=id=>p.instructionalProposals.find(r=>r.recordId===id),least=['sy0701.term.least-privilege','sy0701.term.least-privilege-principle'];
assert.deepEqual(instruction('section:'+d.id+':0').objectiveCodesProposal,['4.6']);
assert.equal(instruction('section:'+d.id+':1').usefulnessAfterMissProposal.status,'partial_for_m038_not_complete_remediation');
assert.equal(instruction('section:'+d.id+':2').objectiveCodesProposal,null);assert.equal(instruction('section:'+d.id+':2').deliveredScopeObserved,'beyond_textbook');
assert.deepEqual(instruction('check:'+d.id).objectiveCodesProposal,['4.6']);
for(const row of p.instructionalProposals.filter(r=>r.recordId.startsWith('practice:'))){assert.equal(row.objectiveCodesProposal,null);assert.deepEqual(row.conceptLinkProposals,['sy0701.term.provisioning','sy0701.term.zero-trust']);assert.deepEqual(row.withheldCanonicalCandidates,least);assert.equal(row.familyRelation,'same_keyword_guide_no_independent_family');}
assert.deepEqual(p.canonicalBoundary.ambiguousLeastPrivilegeCandidates,least);assert.equal(p.canonicalBoundary.topicIsMastery,false);assert.equal(p.canonicalBoundary.newMasteryIdentities,0);assert.equal(p.canonicalBoundary.primaryMasteryProposalsWithheld,5);
assert.deepEqual(p.canonicalBoundary.priorAmbiguitiesUnchanged,['CIA versus CIA-triad','MAC cross-domain meanings','Role-based versus rule-based RBAC','TOU access-window/race-condition discrepancy']);
const lessonCandidates=CONCEPT_DEEP_DIVES.filter(d=>getSy0701DeepDiveProfile(d).objectiveCodes.includes('1.2'));
assert.deepEqual(p.census.lessonCandidates,lessonCandidates.map(d=>({lessonId:d.id,containerRevision:records.get('lesson:'+d.id).sourceSignature,profileCodesObserved:getSy0701DeepDiveProfile(d).objectiveCodes,beyondSectionIndexes:getSy0701DeepDiveProfile(d).beyondSections,recordIds:broad.filter(r=>r.id.includes(d.id)).map(r=>r.id),displayedGeneratedCheckIds:buildDeepDivePracticeQuestions(d).slice(0,3).map(q=>'practice:'+q.id),unusedGeneratedCheckIds:buildDeepDivePracticeQuestions(d).slice(3).map(q=>'practice:'+q.id),disposition:d.id==='identity-zero-trust'?'new_slice_lesson':previous.has('lesson:'+d.id)?'prior_objective11_lesson':'census_only_not_new_semantic_review'})));
assert.deepEqual(p.unusedSelectedLessonHelpers,buildDeepDiveFlashcards(d).map(c=>({recordId:'unused-card:'+c.id,sourceRevision:contentSignature(c),status:'not_delivered'})).sort((a,b)=>a.recordId.localeCompare(b.recordId,'en')));
assert.equal(p.unusedSelectedLessonHelpers.length,5);assert(p.unusedSelectedLessonHelpers.every(r=>!selected.has(r.recordId)&&pkg.exclusions.some(e=>e.id===r.recordId&&e.sourceSignature===r.sourceRevision)));
const selectors=new Map(readSelectors().map(s=>['intervention:'+s.id,s]));assert.equal(p.selectorBindings.length,3);
for(const s of p.selectorBindings){assert.equal(s.sourceRevision,selectors.get(s.recordId)?.sourceSignature);assert.equal(s.sourceRevision,records.get(s.recordId).sourceSignature);assert.equal(s.limitation,selectors.get(s.recordId).selector.mappingDependencies);}
for(const b of p.deliveryBindings)assert.deepEqual(sourceUnit(b.path,b.anchor,b.endAnchor).provenance,(({id,...rest})=>rest)(b));
const mcq=sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal(').code,lesson=sourceUnit('src/App.jsx','function ConceptDeepDivesPage(','function FlashcardsPage(').code;
assert(mcq.includes('const canSeeFeedback = user.tier === "pro";'));assert(lesson.includes('buildDeepDivePracticeQuestions(selectedDive).slice(0,3)'));
assert(lesson.includes('isPro')&&lesson.includes('freePreview')&&lesson.includes('beyondSections'));
for(const [key,count]of [['packageRecordsUnchanged','records'],['reviewQueueUnchanged','reviewQueue'],['unresolvedQuestionMappingsUnchanged','unresolvedQuestionMappings'],['existingPrimaryQuestionProposalsUnchanged','primaryQuestionProposals']])assert.equal(p.phaseWideBacklog[key],pkg.counts[count]);
for(const [kind,key]of [['mastery_concept','masteryConcepts'],['topic','topics'],['supporting_concept','supportingConcepts']])assert.equal(p.phaseWideBacklog.taxonomyUnchanged[key],pkg.concepts.filter(c=>c.nodeKind===kind).length);
assert.equal(p.privateBoundary.sourceRevision,records.get('private:pbq:p017').sourceSignature);assert.equal(p.privateBoundary.trustedRevisionId,null);assert.equal(p.privateBoundary.payloadReviewed,false);assert.equal(p.privateBoundary.masteryWeight,0);assert.equal(p.phaseWideBacklog.humanApprovedNewMappings,0);assert.equal(p.humanDecisionReferences.humanApprovalRequestedThisTurn,false);
const manifest=json('docs/evidence/phase-2b5/release-checksums.json');assert.equal(Object.keys(manifest.files).length,25);for(const [path,sha]of Object.entries(manifest.files))assert.equal(hash(path),sha,'Active release file changed: '+path);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-objective12-zero-trust-mapping-proposals'),'Runtime proposal import');
assert(readFileSync(reportPath,'utf8').includes(hash(packetPath)),'Report must bind exact packet SHA');
console.log(JSON.stringify({status:'PASS_BOUND_OFFLINE_ZERO_TRUST_PROPOSALS_NOT_APPROVAL',counts:{broadObjective12:126,priorDispositions:34,newRecords:20,mcqs:5,feedback:5,lessonRecords:10,combinedDistinctDispositions:54,remaining:72,approvedNewMappings:0,eligibleNewEvidence:0,releaseHashesUnchanged:25,queueUnchanged:2954,unresolvedQuestionMappingsUnchanged:489},sha256:Object.fromEntries([packetPath,reportPath,'scripts/audit-objective12-zero-trust-mapping.mjs'].map(path=>[path,hash(path)]))}));
