import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {getSy0701DeepDiveProfile} from '../src/data/sy0701DeepDiveMap.js';
import {buildDeepDivePracticeQuestions} from '../src/lib/deepDiveStudy.js';
import {compileRevision} from '../server/adaptive/revision.mjs';
import {QUESTION_MAPPINGS} from '../src/data/learningMappings.js';
const packetPath='docs/drafts/phase-2b5-objective11-controls-mapping-proposals.json';
const reportPath='docs/phase-2b5-objective11-controls-mapping-review.md';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const p=JSON.parse(readFileSync(packetPath)),pkg=JSON.parse(readFileSync('docs/evidence/phase-2b5/mapping-package.json'));
assert(!/"(?:q|question|prompt|clue|options|opts|answer|correct|wrongFeedback|optionFeedback|selectionFeedback|explanation|exp|payload|learnerId|email)"\s*:/.test(JSON.stringify(p)),'Review packet must withhold grading, question and private payload fields');
const records=new Map(pkg.records.map(r=>[r.id,r])),concepts=new Map(pkg.concepts.map(c=>[c.id,c]));
const bank=readLearningPilotBank(),questions=[...bank.mcqs,...bank.pbqs],byId=new Map(questions.map(q=>[q.id,q]));
assert.equal(p.status,'LOCAL_SEMANTIC_PROPOSALS_NOT_READY');
assert.equal(p.baselineCommit,'a63ba76e6e0e851762b4d474b7ed1a4a8f39a3af');
assert.equal(hash('docs/evidence/phase-2b5/mapping-package.json'),'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');
assert.equal(contentSignature(bank),p.bankSignature);
assert.equal(p.bankSignature,'sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391');
for(const k of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(p[k],false);
for(const k of ['masteryWeight','newFamilyCredit'])assert.equal(p[k],0);
for(const s of p.sourceBindings)assert.equal(hash(s.path),s.sha256,'Source binding changed: '+s.path);
function support(id){assert.equal(concepts.get(id)?.nodeKind,'supporting_concept','Only existing supporting identities, without promotion');}
function zero(row){
 assert.equal(row.primaryConceptProposal,null,'No invented primary mastery identity');
 assert.deepEqual(row.secondaryConceptProposals,[],'No contrast/whole-response secondary credit');
 assert.equal(row.humanApproved,false);assert.equal(row.masteryWeight,0);assert.equal(row.newFamilyCredit,0);
}
function validateQuestion(row){
 const q=byId.get(row.questionId),r=records.get(row.recordId);assert(q&&r);
 assert.equal(q.objective,'1.1');assert.equal(row.recordId,row.kind+':'+q.id);
 assert.equal(row.sourceRevision,contentSignature(q),'Stale effective question revision');
 assert.equal(row.sourceRevision,r.localRevisionSignature);assert.equal(row.publishedRecordSignature,r.sourceSignature);
 assert.equal(row.capturedTrustedRevisionId,compileRevision(q,row.kind).revisionId);
 assert.equal(row.capturedTrustedRevisionId,r.trustedRevisionId);
 assert.equal(row.capturedPrecision,r.precision);assert.equal(row.formatObserved,r.questionFormat);
 assert.equal(row.objectiveObserved,q.objective);assert.equal(row.domainObserved,q.ch);assert.equal(row.difficultyObserved,q.difficulty);
 zero(row);assert.equal(row.componentEvidenceWeight,0);assert.deepEqual(row.componentProposals,[],'No manufactured component outcomes');
 assert.equal(row.topicContextProposal,'sy0701.objective.1.1');assert.equal(row.objectiveReassignmentProposal,null);
 assert.equal(row.familyReviewStatus,'agent_comparison_pending_independent_gate');
 for(const c of row.assessedCanonicalRoleProposals){support(c.conceptId);assert.equal(c.role,'assessed_supporting_meaning');assert.equal(c.masteryWeight,0);}
 row.supportConceptProposals.forEach(support);
 assert(!QUESTION_MAPPINGS.some(m=>m.questionId===q.id),'This slice must not pretend existing pilot attribution');
 assert(row.assessedUnderstanding.length>15&&row.rationale.length>40&&row.familyLabelProposal);
 if(row.kind==='pbq')assert.equal(row.capturedPrecision,'coarse');
}
assert.deepEqual(p.questionProposals.map(r=>r.questionId).sort(),questions.filter(q=>q.objective==='1.1').map(q=>q.id).sort());
assert.equal(p.questionProposals.length,17);p.questionProposals.forEach(validateQuestion);
const question=id=>p.questionProposals.find(r=>r.questionId===id);
for(const ids of [['m001','m101','m401','m603'],['m003','m203']])assert.equal(new Set(ids.map(id=>question(id).familyLabelProposal)).size,1,'Surface variants share the decision');
assert.throws(()=>validateQuestion({...question('m001'),sourceRevision:'sha256:'+'0'.repeat(64)}),/Stale effective/);
assert.throws(()=>validateQuestion({...question('m205'),primaryConceptProposal:'controls.managerial'}),/invented primary/);
assert.throws(()=>validateQuestion({...question('m402'),secondaryConceptProposals:['recovery.rto']}),/secondary credit/);
assert.throws(()=>validateQuestion({...question('p021'),componentProposals:[{componentId:'detective'}]}),/manufactured component/);
assert.throws(()=>support('sy0701.term.generic-ids'),/existing supporting/);
assert.throws(()=>support('sy0701.objective.1.1'),/existing supporting/);
assert.deepEqual(question('m115').objectiveScopeProposal.assessedCodes,[]);
assert.deepEqual(question('m601').objectiveScopeProposal.contextCodes,['1.2','4.6']);
assert.deepEqual(question('m402').assessedCanonicalRoleProposals,[]);assert.deepEqual(question('p021').assessedCanonicalRoleProposals,[]);
const prior=JSON.parse(readFileSync('docs/drafts/phase-2b5-contextual-recovery-dispositions.json')).questionProposals.find(r=>r.questionId==='p060');
assert.equal(question('p060').sourceRevision,prior.sourceRevision);assert.equal(question('p060').familyLabelProposal,prior.familyLabelProposal);
assert.deepEqual(question('p060').supportConceptProposals,[]);
const d=CONCEPT_DEEP_DIVES.find(d=>d.id==='security-foundations-controls'),profile=getSy0701DeepDiveProfile(d),generated=buildDeepDivePracticeQuestions(d);
const explanations=q=>({exp:q.exp,explanation:q.explanation,wrongFeedback:q.wrongFeedback,optionFeedback:q.optionFeedback,items:q.items,blanks:q.blanks,selectionFeedback:q.selectionFeedback});
const values=new Map([
 ...p.questionProposals.map(r=>['explanation:'+r.recordId,explanations(byId.get(r.questionId))]),
 ['lesson:'+d.id,{d,profile}],...d.sections.map((s,i)=>['section:'+d.id+':'+i,s]),
 ['keywords:'+d.id,profile.keywordGuide],['traps:'+d.id,d.traps],['check:'+d.id,d.check],
 ...generated.slice(0,3).map(q=>['practice:'+q.id,q]),
]);
const scope=pkg.records.filter(r=>r.objectiveCodes.includes('1.1'));
const expectedTeaching=scope.filter(r=>!['mcq','pbq','explanation_bundle','flashcard','glossary_definition','deck_container'].includes(r.kind)).map(r=>r.id).sort();
assert.equal(expectedTeaching.length,11);
assert.deepEqual(p.instructionalProposals.map(r=>r.recordId).sort(),expectedTeaching);
assert.deepEqual(p.explanationProposals.map(r=>r.recordId).sort(),p.questionProposals.map(r=>'explanation:'+r.recordId).sort());
const all=[...p.questionProposals,...p.explanationProposals,...p.instructionalProposals],selected=new Set(all.map(r=>r.recordId));
assert.equal(all.length,45);assert.equal(selected.size,45);assert.equal(scope.length,69);
assert.deepEqual(p.remainingObjective11RecordIds,scope.filter(r=>!selected.has(r.id)).map(r=>r.id).sort());
assert.equal(p.remainingObjective11RecordIds.length,24);
for(const row of [...p.explanationProposals,...p.instructionalProposals]){
 const r=records.get(row.recordId);assert(r);zero(row);
 assert.equal(row.sourceRevision,contentSignature(values.get(row.recordId)),'Stale teaching revision');
 assert.equal(row.sourceRevision,r.sourceSignature);assert.deepEqual(row.objectiveCodesObserved,r.objectiveCodes);
 assert.equal(row.parentId,r.parentId??null);assert.equal(row.independentEvidence,false);row.conceptLinkProposals.forEach(support);
 if(row.kind==='explanation_bundle'){
  const parent=p.questionProposals.find(q=>q.recordId===row.parentId);assert(parent);
  assert.equal(row.parentQuestionRevision,parent.sourceRevision);assert.equal(row.semanticParentProposal,parent.recordId);
  assert.equal(row.familyRelation,'same_question_feedback_not_independent_family');
  assert.equal(row.deliveryBinding,parent.kind==='mcq'?'mcq-renderer':'pbq-renderer');
 }else{
  assert.equal(row.deliveryBinding,'lesson-renderer');
  for(const sub of row.subunits){
   const tokens=sub.path.match(/\w+|\d+/g)||[];const value=tokens.reduce((v,k)=>v[k],values.get(row.recordId));
   assert.equal(sub.sourceRevision,contentSignature(value),'Stale mixed-scope subunit');assert.equal(sub.masteryWeight,0);sub.conceptLinkProposals.forEach(support);
  }
  for(const id of row.withheldCanonicalCandidates||[])support(id);
 }
}
function validateCheckScope(row){assert.deepEqual(row.objectiveCodesProposal,['1.2'],'Generated definition check is not objective 1.1');assert.equal(row.trustedRevisionId,null);}
const practice=p.instructionalProposals.filter(r=>r.recordId.startsWith('practice:'));
assert.equal(practice.length,3);practice.forEach(validateCheckScope);
assert.throws(()=>validateCheckScope({...practice[0],objectiveCodesProposal:['1.1']}),/not objective 1.1/);
assert.deepEqual(p.generatedChecksExcluded.map(r=>r.recordId),generated.slice(3).map(q=>'practice:'+q.id));
for(const [i,e] of p.generatedChecksExcluded.entries()){
 assert.equal(e.sourceRevision,contentSignature(generated[i+3]));assert(!selected.has(e.recordId));
 assert.equal(pkg.exclusions.find(r=>r.id===e.recordId)?.status,'not_delivered');assert.equal(e.disposition,'not_delivered_not_slice_coverage');assert.equal(e.masteryWeight,0);
}
const optional=p.instructionalProposals.find(r=>r.recordId==='section:'+d.id+':3');
assert.equal(optional.deliveredScopeObserved,'beyond_textbook');assert.equal(records.get(optional.recordId).scope,'beyond_textbook');
assert.equal(optional.objectiveCodesProposal,null);assert.deepEqual(profile.beyondSections,[3]);
for(const b of p.deliveryBindings)assert.deepEqual(sourceUnit(b.path,b.anchor,b.endAnchor).provenance,(({id,...provenance})=>provenance)(b));
const app=readFileSync('src/App.jsx','utf8');
assert(app.includes('buildDeepDivePracticeQuestions(selectedDive).slice(0,3)'));
assert(app.includes('const FREE_DEEP_DIVE_PREVIEW_ID="web-social-dns-attacks";'));
assert.equal(concepts.get(p.canonicalBoundary.topicId).nodeKind,'topic');assert.equal(p.canonicalBoundary.topicIsMastery,false);
assert.equal(p.canonicalBoundary.primaryConceptProposalsWithheld,17);
assert.equal(p.phaseWideBacklog.reviewQueueUnchanged,pkg.counts.reviewQueue);assert.equal(pkg.counts.reviewQueue,2954);
assert.equal(p.phaseWideBacklog.unresolvedQuestionMappingsUnchanged,pkg.counts.unresolvedQuestionMappings);assert.equal(pkg.counts.unresolvedQuestionMappings,489);
assert.equal(p.phaseWideBacklog.existingPrimaryQuestionProposalsUnchanged,pkg.counts.primaryQuestionProposals);
for(const [kind,key] of [['mastery_concept','masteryConcepts'],['topic','topics'],['supporting_concept','supportingConcepts']])assert.equal(p.phaseWideBacklog.taxonomy[key],pkg.concepts.filter(c=>c.nodeKind===kind).length);
assert.equal(p.denominator.packageRecords,pkg.records.length);assert.equal(p.denominator.remainingPackageRecordsOutsideThisPacket,pkg.records.length-selected.size);
assert.equal(p.denominator.explanationBundles,p.explanationProposals.length);assert.equal(p.denominator.lessonRecords,p.instructionalProposals.length);
assert.equal(p.privateBoundary.sourceRevision,records.get('private:pbq:p017').sourceSignature);
assert.equal(p.privateBoundary.trustedRevisionId,null);assert.equal(p.privateBoundary.payloadReviewed,false);assert.equal(p.privateBoundary.masteryWeight,0);
assert.equal(p.humanDecisionReferences.humanApprovalRequestedThisTurn,false);assert.equal(p.phaseWideBacklog.humanApprovedNewMappings,0);
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));
for(const [path,sha] of Object.entries(manifest.files))assert.equal(hash(path),sha,'Active release file changed: '+path);
for(const root of ['src','api','server'])for(const file of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+file,'utf8').includes('phase-2b5-objective11-controls-mapping-proposals'),'Runtime proposal import');
console.log(JSON.stringify({status:'PASS_BOUND_OFFLINE_PROPOSALS_NOT_APPROVAL',counts:{questions:17,mcqs:15,pbqs:2,explanationBundles:17,lessonRecords:11,distinctPackageRecords:45,broadObjective11Candidates:69,remainingObjective11Candidates:24,generatedChecksNotDelivered:3,eligibleNewEvidence:0,queueUnchanged:2954,unresolvedQuestionMappingsUnchanged:489},sha256:Object.fromEntries([packetPath,reportPath,'scripts/audit-objective11-controls-mapping.mjs'].map(path=>[path,hash(path)]))}));
