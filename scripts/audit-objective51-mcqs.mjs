import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-objective51-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective51-mcqs-proposals.json',reportPath='docs/phase-2b5-objective51-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective52-pilot-feedback-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'1f9b6398e867497001d211c5e0d64cbbabbd71b4534ff04d232a03ea28ab9f46');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective45-mcqs-proposals.json','docs/drafts/phase-2b5-objective54-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-risk-mcqs-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);assert.equal(c.ledger.rows.filter(r=>legacyPrevious.has(r.recordId)).length,343);
const ids=['m028','m079','m083','m084','m155','m191','m200','m371','m398','m640'];
const candidates=ids.map(id=>c.ledger.rows.find(r=>r.recordId==='mcq:'+id));
assert.equal(new Set(ids).size,10);assert(candidates.every(r=>r&&r.kind==='mcq'&&r.objectiveCodesObserved.includes('5.1')));
// The supplied order is a set order, not a structural-priority ranking.
assert.deepEqual(candidates.map(r=>r.priorityScore),[10,10,20,20,35,20,135,35,25,55]);
const rankedIds=[...candidates].sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en')).map(r=>r.questionId);
// Inventory every substantive packet, including older dictionary-bound question-only judgments.
const inventory=[],olderQuestions=[],duplicateReferences=[],supportOnlyReferences=[];
for(const name of readdirSync('docs/drafts').filter(n=>n.startsWith('phase-2b5-')&&n.endsWith('.json')).sort()){
 const path='docs/drafts/'+name;if(path===packetPath)continue;const p=readJson(path);
 const arrays=['questionProposals','explanationProposals','instructionalProposals'];if(!arrays.some(k=>Array.isArray(p[k])))continue;
 const bindings=Array.isArray(p.sourceBindings)?p.sourceBindings:Object.entries(p.sourceBindings||{}).map(([path,sha256])=>({path,sha256}));verifySourceBindings(bindings);
 const rows=arrays.flatMap(k=>p[k]||[]);inventory.push({path,sha256:hashFile(path),substantiveRows:rows.length});
 for(const row of rows){
  const r=c.records.get(row.recordId);assert(r,'Missing prior record: '+row.recordId);assert.equal(row.publishedRecordSignature??row.sourceRevision,r.sourceSignature,'Prior source drift: '+row.recordId);
  const reference={recordId:row.recordId,kind:r.kind,sourceRevision:row.sourceRevision,publishedRecordSignature:r.sourceSignature,priorPacketPath:path,priorDispositionRevision:sig(row)};
  if(c.previous.has(row.recordId)){if(c.previous.get(row.recordId).path!==path)duplicateReferences.push(reference);continue;}
  if((p.questionProposals||[]).includes(row)){assert.equal(row.sourceRevision,r.localRevisionSignature);c.previous.set(row.recordId,{path,row});olderQuestions.push(reference);}
  else supportOnlyReferences.push({...reference,status:'link_or_context_only_not_full_current_feedback_or_unit_review'});
 }
}
assert.equal(inventory.length,64);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);
const excluded=candidates.filter(r=>c.previous.has(r.recordId)),selected=candidates.filter(r=>!c.previous.has(r.recordId));
assert.deepEqual(excluded,[]);assert.equal(selected.length,10);assert(candidates.every(r=>!c.previous.has('explanation:'+r.recordId)));
const exclusions=excluded.map(r=>{const p=c.previous.get(r.recordId);return{recordId:r.recordId,sourceRevision:r.revisions.localEffective,publishedRecordSignature:r.revisions.publishedCatalogue,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),priorFamilyLabel:p.row.familyLabelProposal,reason:'current_matching_prior_substantive_question_judgment_reused_feedback_still_unreviewed',newQuestionCredit:0,newFamilyCredit:0};});
const priorInventory=base.allPacketReconciliation.inventory;
assert.deepEqual(inventory.filter(r=>r.path!==basePath),priorInventory);
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorBank.length,385);assert.equal(priorFeedback.length,370);
const broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('5.1')),oldBroad=broad.filter(r=>c.previous.has(r.id));
assert.equal(c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('5.1')).length,10);
const pilotPath='docs/drafts/phase-2b5-objective52-pilot-mapping-proposals.json',pilot=readJson(pilotPath);

const preservedPilotQuestionProposals=pilot.questionProposals.filter(r=>r.disposition==='direct_pilot_proposal');
assert.deepEqual(preservedPilotQuestionProposals.map(r=>r.questionId),['m032','m086','m088','m196','m635']);
for(const r of preservedPilotQuestionProposals){assert.equal(r.sourceRevision,c.records.get(r.recordId).localRevisionSignature);assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);assert.equal(r.humanApproved,false);assert.equal(r.masteryWeight,0);}
verifySourceBindings(pilot.draftComparisons);assert.equal(hashFile(pilotPath),'de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c');
const draft=readJson(pilot.draftComparisons[0].path),clean=draft.questions.find(r=>r.id==='draft.pilot1.rpo.03');
const pilotBoundary={preservedPilotQuestionProposals,ownerContentDecisionBinding:{path:'docs/drafts/phase-2b5-pilot-batch-1-content-decision.md',sha256:hashFile('docs/drafts/phase-2b5-pilot-batch-1-content-decision.md')},ownerFamilyDecisionBinding:{path:'docs/drafts/phase-2b5-pilot-batch-1-family-decision.md',sha256:hashFile('docs/drafts/phase-2b5-pilot-batch-1-family-decision.md')},draftComparisons:pilot.draftComparisons,ownerReservedChoices:pilot.ownerReservedChoices,approvedContentRevisionsPreserved:true,approvedFamilyJudgmentsPreserved:true,newPilotRoleCredit:0,roleWeightTeachingPublicationApprovalTransferred:false,recoveryBoundary:'MTD is the outer business-interruption limit; RTO is the service-restoration target; RPO concerns recoverable data age. One contrast does not supply independently assessed secondary evidence. MTD remains supporting scope, not an explicit BIA exam bullet.',cleanPointBoundary:{recordId:clean.id,draftQuestionRevision:sig(clean),familyRationale:clean.familyRationale,accuracyCheck:clean.accuracyCheck,priorBankRecordId:'mcq:m088',priorBankRevision:c.records.get('mcq:m088').localRevisionSignature,hold:'Owner accepted the clean-point reasoning distinction from tested successful version cadence. This is editorial judgment, not psychometric independence, learner transfer or a clean-source guarantee.'},mttrGlossaryBoundary:pilot.instructionalProposals.find(r=>r.recordId==='glossary:mttr'),coarseRecoveryPbqBoundary:pilot.questionProposals.filter(r=>['pbq:p048','pbq:p211'].includes(r.recordId))};
assert.deepEqual(pilotBoundary,base.pilotBoundary);
const preservedPilotFeedbackLinkReconciliation=base.feedbackLinkReconciliation;assert.equal(preservedPilotFeedbackLinkReconciliation.length,5);
assert.equal(duplicateReferences.length,22);assert.equal(supportOnlyReferences.length,7);
const protectedHashes=readJson('docs/evidence/phase-2b5/release-checksums.json').files;assert.equal(Object.keys(protectedHashes).length,25);verifySourceBindings(Object.entries(protectedHashes).map(([path,sha256])=>({path,sha256})));
const reviews=[
  {
    "id": "m028",
    "meaning": "Identify the supplied mandatory measurable password-length requirement as a standard in the taught document hierarchy.",
    "hold": "HOLD twelve characters as a universal secure-password minimum, naming a standard as enforcement, or policies as unable to contain specific requirements. Adopted authority and document function matter; a policy can include a standard or incorporate another requirement. All three wrong corrections are retained and their categorical wording needs this context. The stated number is a supplied organisational example, not current authentication advice or assessed password implementation.",
    "main": "A standard supplies the concrete criterion beneath the taught policy direction. The requirement is local to the example; recognising it proves neither password strength nor enforcement.",
    "contrasts": [
      "The example explicitly mandates its criterion; an advisory guideline is not sufficient under that premise, although guidance can be incorporated into binding documents.",
      "The statement sets a measurable criterion rather than giving an ordered task sequence.",
      "The taught policy role is broader direction; actual policies may contain detailed rules, so document content and the adopted hierarchy are decisive."
    ],
    "family": "governance-document-function-discrimination"
  },
  {
    "id": "m079",
    "meaning": "Identify an ordered set of instructions for a security task as a procedure.",
    "hold": "HOLD every procedure as automatically mandatory or every policy/standard as incapable of containing task detail. Binding force follows adopted authority and applicable requirements, not the document title. The retained guideline correction overstates universal procedure enforcement. A phishing example does not assess reporting, evidence handling, classification or incident response execution. Same conservative document-discrimination family as the other hierarchy items.",
    "main": "A procedure tells staff the sequence for doing a task. Its steps and authority need actual definition and adoption; recognising the label does not perform them.",
    "contrasts": [
      "The supplied function is an ordered task sequence rather than broad management direction; real policies can include related instructions.",
      "A required criterion can inform a procedure without being the entire task sequence described.",
      "Advisory advice differs from the described task instructions; the retained mandatory-procedure claim remains qualified by organisational authority."
    ],
    "family": "governance-document-function-discrimination"
  },
  {
    "id": "m083",
    "meaning": "Identify permitted and prohibited daily use of organisational IT resources as acceptable-use policy content.",
    "hold": "HOLD an AUP as automatically lawful monitoring, employee consent or proven enforcement. The authorised limited-personal-use premise does not grant unrestricted use. Other policies may contain overlapping resource-use, classification or incident rules; retained continuity-unrelated and classification-does-not-govern wording is too exclusive if read universally. The main removes the authored universal-signature/onboarding suggestion, without proving any signature or compliance process.",
    "main": "An AUP explains permitted and prohibited resource use. The described permission is specific and conditional; actual enforcement and legal grounds remain unverified.",
    "contrasts": [
      "Incident-response policy focuses on handling incidents; unacceptable resource use can trigger that response, so these policies can overlap.",
      "Continuity policy focuses on sustaining operations during disruption; resource-use restrictions can support it, rather than being universally unrelated.",
      "Classification policy focuses on sensitivity and handling; those rules can affect resource use while the supplied permission-and-prohibition emphasis identifies acceptable use."
    ],
    "family": "acceptable-resource-use-policy-identification"
  },
  {
    "id": "m084",
    "meaning": "Recognise advice explicitly encouraged but not mandated as a guideline.",
    "hold": "HOLD the guideline label as permission to ignore binding requirements, or all procedures as enforced solely because of their name. The old claim that deviations never cause disciplinary consequences is removed from the main; the retained procedure correction remains categorical. The stem explicitly supplies optional advice, not a universal rule about every publication called a guideline. No actual screensaver setting, exception or disciplinary decision is supplied.",
    "main": "A guideline offers recommendations under this stated optional-advice premise. Advice cannot waive a separately binding rule; the document hierarchy is an instructional distinction.",
    "contrasts": [
      "The question stipulates advice without a mandatory organisational requirement; this does not mean every policy has one fixed form.",
      "The question stipulates recommendations rather than a required criterion; an externally published standard is not universally binding before adoption.",
      "An ordered procedure is a different document function; a procedure title alone does not make every step mandatory or enforced."
    ],
    "family": "governance-document-function-discrimination"
  },
  {
    "id": "m155",
    "meaning": "Name design-stage threat modelling from analysis of assets, trust boundaries, threats and security requirements before implementation.",
    "hold": "HOLD naming the activity as a completed threat model, validated requirements, guaranteed cost savings or universal proof that design fixes reduce rework. The old strongest-cost-reduction claim is removed; threat modelling should be revisited through the lifecycle and complements code/running-system tests. Multiple listed analysis inputs produce one naming decision, not independent asset, boundary and requirements skills. Authored domain3 to effective5 is observed, not approved whole-governance scope or a forced retag.",
    "main": "Threat modelling analyses how a design could be abused and which requirements address the risks. It can begin before code exists and needs revision and later validation.",
    "contrasts": [
      "DAST exercises running software; the supplied pre-code design analysis is a different activity.",
      "Penetration testing generally probes an implemented target; testing prototypes or discussing attacks can inform design without becoming the described threat model by title alone.",
      "SAST examines source code; a pre-code architectural model does not demonstrate source analysis."
    ],
    "family": "preimplementation-threat-model-activity-identification"
  },
  {
    "id": "m191",
    "meaning": "Recognise NIST CSF 2.0 from its explicitly supplied six function names.",
    "hold": "HOLD the earlier five-function CSF description as current version2.0, function naming as framework implementation or certification, or voluntary guidance as impossible to require through a policy or contract. The six functions are not strictly sequential stages and do not prescribe every control. ISO, PCI and SOC offerings can coexist. No actual profile, tier, control test, conformity or full framework competence is assessed.",
    "main": "CSF 2.0 organises outcomes into Govern, Identify, Protect, Detect, Respond and Recover. Identifying those names supplies one framework-recognition decision, not six independent functions or a certification.",
    "contrasts": [
      "ISO/IEC 27001 supplies ISMS requirements; the six named functions identify the supplied CSF version, even where both are used.",
      "PCI DSS concerns payment-account security requirements; its scope can overlap an organisation using CSF without having this function structure.",
      "SOC 2 involves reporting on relevant service-organisation controls against trust services criteria; a report does not make it the named CSF taxonomy."
    ],
    "family": "versioned-six-function-CSF-framework-identification"
  },
  {
    "id": "m200",
    "meaning": "Identify a mandatory technical standard as the taught way to make an encryption policy consistent across teams.",
    "hold": "HOLD writing a standard as actually resolving every implementation difference, a universal AES-256 or mode mandate, or title-only proof of approved cryptography. Policy can incorporate precise technical rules; the broader-policy distractor is qualified as supplied wording, not a prohibition on detailed policy. Procedures can incorporate standards and guidance can be adopted into requirements. Key handling, platform/data context, approved configuration, authorised exceptions, rollout and verification remain untested. Preserve authored hard to captured easy to effective medium as observed metadata, not calibration.",
    "main": "The missing function is an agreed mandatory technical baseline. A standard expresses it; implementation, communication and enforcement still need verification. The earlier algorithm example gives no new cryptographic-role credit.",
    "contrasts": [
      "Simply adding broad wording does not specify the required baseline; a sufficiently detailed adopted policy could incorporate it, so document function matters.",
      "Steps implement an agreed requirement and may incorporate it; instructions alone without that agreement do not resolve the described inconsistent baseline.",
      "Advisory recommendations alone do not bind choices under the supplied premise; incorporated requirements may have a different force."
    ],
    "family": "governance-document-function-discrimination"
  },
  {
    "id": "m371",
    "meaning": "Recognise the supplied mandatory management-approved encryption direction as a security policy.",
    "hold": "HOLD board approval as universal authority for every security document, management title as sufficient evidence of accountability or a blanket encryption mandate as technically implemented. Specific policy detail, incorporated standards and delegated approval may exist. Actual law, data classification, approved configuration, exception authority and enforcement remain unverified. Encryption words create no cryptographic implementation skill. Same conservative document-discrimination family despite the different keyed document class.",
    "main": "A policy states the required organisational outcome. The supplied approval is a premise for this recognition question, not proof of a real authorised or enforced policy.",
    "contrasts": [
      "A technical standard supplies concrete required criteria in the taught hierarchy; a policy can incorporate those criteria in practice.",
      "A procedure supplies task steps rather than just the broad requirement described.",
      "The example explicitly states a mandatory approved requirement rather than optional recommendations; actual adoption still governs its authority."
    ],
    "family": "governance-document-function-discrimination"
  },
  {
    "id": "m398",
    "meaning": "Identify account creation, review and revocation task instructions as a procedure.",
    "hold": "HOLD a procedure label as an executed account lifecycle, effective approvals, appropriate roles or verified secure onboarding. The main adds secure enrolment advice and removes the old reusable-password-by-email example; that teaching does not establish a implemented flow or assessed credential-handling skill. Policies and standards can incorporate task detail, and procedure authority is contextual. Same conservative document-discrimination family as m079 rather than new independence from changing the task.",
    "main": "A procedure documents the task sequence, relevant approvals and verification. Account and credential examples are supporting advice; no user account or credential is created or sent.",
    "contrasts": [
      "Management requirements can be documented in policy; the supplied ordered operational sequence is the procedural function.",
      "A standard can set required tools or practices without being the complete sequence; documents may incorporate each other.",
      "The supplied task instructions are more than advisory suggestions, but authority and enforcement are not established by the name alone."
    ],
    "family": "governance-document-function-discrimination"
  },
  {
    "id": "m640",
    "meaning": "Identify the business data owner from the explicitly supplied internal accountability for classification and business access and retention requirements.",
    "hold": "HOLD a data-owner title as exclusive authority over every legal duty, custodians as having no accountability, or internal ownership as equivalent to a legal controller. The stem now pins an internal company policy and replaces the old controller distractor with system operator; the current processor correction still needs its context distinguished from legal personal-data roles. Applicable law and delegated responsibilities constrain decisions. Legal roles depend on the actual processing functions and jurisdiction, not titles. No access/retention decision, asset classification or legal scope is determined.",
    "main": "Under the stated internal policy, the data owner is accountable for the described business requirements; custodians implement the agreed handling. These internal labels do not establish legal controller or processor status.",
    "contrasts": [
      "The supplied processing role does not by itself establish business-owner authority. The on-behalf description is a legal-role contrast only in its applicable personal-data context, not a finding about this company.",
      "A custodian principally implements handling in this taught allocation; delegations and combined responsibilities must be defined rather than assumed absent.",
      "System operation alone gives no classification authority; a person may hold multiple expressly assigned roles without those titles being equivalent."
    ],
    "family": "policy-specific-business-data-owner-identification"
  }
];
assert.deepEqual(reviews.map(r=>r.id),ids);
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();

const sourceChecks=candidates.map(row=>{
 const s=c.questions.get(row.recordId),q=s.q,pre=s.preQuestion,shuffled=shuffle(q);
 assert.equal(s.authored===null,false);
 if(s.snapshots.length){assert.equal(s.snapshots.length,1);assert.equal(s.captures.length,1);const replay=publicationPipeline(c.bank).overrides(s.snapshots).mcqs.find(x=>x.id===q.id),{_baseOrder,_adminOrder,...semantics}=replay;assert.equal(sig(semantics),row.revisions.localEffective);assert.equal(s.pub._adminOrder,s.captures[0].sort_order);}
 else{assert(s.authored);assert.equal(s.captures.length,0);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);}
 assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);assert.equal(q.correct,pre.correct);
 assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
 for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
 assert.notEqual(sig(q.exp),sig(pre.exp));const unchangedWrongCorrectionCount=q.opts.map((_,j)=>j).filter(j=>j!==q.correct&&pre.wrongFeedback?.[j]===q.wrongFeedback[j]).length;
 return{recordId:row.recordId,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:s.snapshots.length>0,sourceLayerDisposition:s.authored===null?'snapshot_only_no_authored_or_imported_substitute':s.snapshots.length?'authored_then_captured_snapshot_then_effective_editorial':row.flags.importedSource?'imported_authored_equals_preeditorial_then_effective_editorial':'authored_equals_preeditorial_then_effective_editorial',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',authoredMissingWrongCorrections:s.authored===null?null:!s.authored.wrongFeedback,stemChangedFromPreeditorial:sig(q.q)!==sig(pre.q),optionsChangedFromPreeditorial:sig(q.opts)!==sig(pre.opts),mainCorrectionChanged:true,wrongCorrectionsChanged:sig(q.wrongFeedback)!==sig(pre.wrongFeedback??null),changedWrongCorrectionCount:3-unchangedWrongCorrectionCount,unchangedWrongCorrectionCount,optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0},status:'source_inspection_no_additional_question_credit'};
});
assert.equal(sourceChecks.filter(r=>r.snapshotReplayChecked).length,1);assert.equal(sourceChecks.filter(r=>r.stemChangedFromPreeditorial).length,7);assert.equal(sourceChecks.filter(r=>r.optionsChangedFromPreeditorial).length,4);assert.equal(candidates.filter(r=>r.flags.stemChanged).length,7);assert.equal(candidates.filter(r=>r.flags.optionsChanged).length,5);assert.deepEqual(candidates.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m640']);assert.equal(sourceChecks.filter(r=>r.authoredMissingWrongCorrections).length,5);
assert.equal(sourceChecks.filter(r=>r.wrongCorrectionsChanged).length,7);assert.equal(sourceChecks.reduce((n,r)=>n+r.changedWrongCorrectionCount,0),19);assert.equal(sourceChecks.reduce((n,r)=>n+r.unchangedWrongCorrectionCount,0),11);
const meaningBoundaryChecks=[];
for(const id of ['m079','m084','m398']){const s=c.questions.get('mcq:'+id);assert(/procedure|step-by-step/i.test(s.q.q+' '+s.q.opts.join(' ')));meaningBoundaryChecks.push({recordId:s.row.recordId,stemRevision:sig(s.q.q),universalMandatoryProcedureClaimApproved:false,documentNameProvesEnforcement:false});}
const password=c.questions.get('mcq:m028');assert(/12-character/.test(password.q.q));meaningBoundaryChecks.push({recordId:password.row.recordId,stemRevision:sig(password.q.q),parameterSuppliedByExample:true,universalPasswordMinimumApproved:false,passwordImplementationObserved:false});
const csf=c.questions.get('mcq:m191');assert(/six functions in version 2.0/.test(csf.q.q));for(const name of ['Govern','Identify','Protect','Detect','Respond','Recover'])assert(csf.q.q.includes(name));meaningBoundaryChecks.push({recordId:csf.row.recordId,stemRevision:sig(csf.q.q),explicitVersion:'2.0',functionCountObserved:6,sixIndependentSkillsApproved:false,certificationEstablished:false,strictStageOrderClaimApproved:false});
const crypt=c.questions.get('mcq:m200');assert(/AES-128/.test(crypt.q.q)&&/AES-256/.test(crypt.q.q)&&/3DES/.test(crypt.q.q));meaningBoundaryChecks.push({recordId:crypt.row.recordId,stemRevision:sig(crypt.q.q),universalAlgorithmOrModeMandateApproved:false,standardNameProvesImplementation:false});
const owner=c.questions.get('mcq:m640');assert(/internal data-governance policy/.test(owner.q.q));meaningBoundaryChecks.push({recordId:owner.row.recordId,stemRevision:sig(owner.q.q),policySpecificAccountabilityPremise:true,legalControllerProcessorDetermined:false,internalOwnerProvesLegalRole:false});
const questionProposals=selected.map(row=>{
 const i=ids.indexOf(row.questionId),r=reviews[i],check=sourceChecks[i];
 return{recordId:row.recordId,questionId:r.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourceInspectionRevision:sig(check),assessedUnderstanding:r.meaning,contentQualification:r.hold,objectiveScopeProposal:null,skillRoleProposal:null,numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:r.family,familyStatus:'provisional_comparison_no_independence_approval',difficultyObserved:check.difficultyObserved,difficultyDisposition:'source_label_uncalibrated'};
});
const explanationProposals=candidates.map((row,i)=>{
 const s=c.questions.get(row.recordId),q=s.q,r=reviews[i],indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct),prior=c.previous.get(row.recordId);
 assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
 return{recordId:'explanation:'+row.recordId,kind:'explanation_bundle',parentId:row.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:row.revisions.localEffective,parentPublishedRevision:row.revisions.publishedCatalogue,parentDispositionStatus:prior?'existing_matching_question_judgment_reused':'new_question_judgment_in_this_packet',reusedParentDispositionRevision:prior?sig(prior.row):null,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:r.main,contentQualification:r.hold,objectiveScopeProposal:null,withheldPreciseContrast:r.family+'_limits',roleProposal:null,deliveryUnderstanding:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:r.contrasts[k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id));
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
assert.equal(broad.length,103);assert.equal(oldBroad.length,28);assert.deepEqual(counts(oldBroad),{glossary_definition:18,keyword_guide:1,lesson:1,lesson_check:4,lesson_section:3,lesson_traps:1});assert.equal(selectedIds.size,20);assert.equal(remaining.length,55);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,1);assert.equal(remaining.filter(r=>r.kind==='pbq').length,1);assert(broad.every(r=>!r.id.startsWith('private:')));
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:r.id.startsWith('private:')?'unavailable_private_semantics_not_reviewed':c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,combinedQuestions=new Set([...priorBank.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=bankRows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
assert.equal(combinedQuestions.size,395);assert.equal(combinedFeedback.size,380);assert.equal(paired.length,380);assert.equal(paired.filter(r=>r.kind==='mcq').length,364);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,olderQuestionOnlyDispositions:olderQuestions.length,allPacketPriorQuestions:priorBank.length,newQuestions:questionProposals.length,allPacketCombinedQuestions:combinedQuestions.size,remainingQuestionDispositions:483-combinedQuestions.size,combinedMcqs:bankRows.filter(r=>r.kind==='mcq'&&combinedQuestions.has(r.recordId)).length,combinedLocalPbqs:bankRows.filter(r=>r.kind==='pbq'&&combinedQuestions.has(r.recordId)).length,newFeedbackBundles:10,priorFullFeedback:priorFeedback.length,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.combinedMcqs,367);assert.equal(bankProgress.combinedLocalPbqs,28);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,15);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective52PilotFeedbackHeldDispositions:base.explanationProposals.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal})),olderQuestionPacketBindings:olderQuestions.map(r=>({recordId:r.recordId,priorPacketPath:r.priorPacketPath,priorDispositionRevision:r.priorDispositionRevision,status:'existing_limits_preserved_no_full_feedback_or_approval_inherited'}))};
assert.equal(priorHolds.objective52PilotFeedbackHeldDispositions.length,5);
const comparisonSpecs=[
  {
    "ids": [
      "m028",
      "m079",
      "m084",
      "m200",
      "m371",
      "m398"
    ],
    "meaning": "These six introductory recognitions conservatively share one document-function discrimination family. Required criteria, task steps, optional advice and broad direction are different meanings within one contrast set; changing task, number, wording or document key establishes no independence."
  },
  {
    "ids": [
      "m083",
      "m086",
      "m398"
    ],
    "meaning": "Acceptable-use policy, business-impact analysis and account procedure identify different supplied functions. Resource restrictions, continuity and data classification may interact; distinct introductory meanings do not prove non-overlapping plans or separately executed controls."
  },
  {
    "ids": [
      "m155",
      "m227",
      "m399"
    ],
    "meaning": "Design-stage activity naming differs from identifying an API boundary principle or integrity harm in an already supplied threat model. A threat-model context supplies no modelling operation or additional assessed component."
  },
  {
    "ids": [
      "m640",
      "m085",
      "m641",
      "m090"
    ],
    "meaning": "An expressly internal owner allocation differs from legal controller/processor function recognition, generic regulatory-driver naming and record-specific retention response. Titles do not establish jurisdiction, legal authority or compliance; exact prior legal holds remain."
  },
  {
    "ids": [
      "m191",
      "m605",
      "m731"
    ],
    "meaning": "Versioned CSF taxonomy recognition differs from strategic risk appetite and an authorised exception request. Naming Govern or management never approves a waiver, quantified risk limit, canonical role or achieved governance outcome."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids.map(id=>'mcq:'+id),comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get('mcq:'+id),p=c.previous.get('mcq:'+id);return{recordId:s.row.recordId,sourceRevision:s.record.sourceSignature,localRevision:s.row.revisions.localEffective,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
const sourceBindings=[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective52-pilot-feedback-review.md',sha256:hashFile('docs/phase-2b5-objective52-pilot-feedback-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)},...inventory.map(({path,sha256})=>({path,sha256})),pilotBoundary.ownerContentDecisionBinding,pilotBoundary.ownerFamilyDecisionBinding,{path:'docs/phase-2b5-objective52-pilot-mapping-review.md',sha256:hashFile('docs/phase-2b5-objective52-pilot-mapping-review.md')},...pilot.draftComparisons.map(({path,sha256})=>({path,sha256}))];
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'5395462ffdaa6e1d05658d03ccc57e983debf65c',sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,legacyTrackedPriorQuestions:343},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences,status:'current_revision_bound_prior_judgments_reconciled_before_new_credit'},bankSignature:c.ledger.bankSignature,selectionPolicy:'Requested objective5.1 governance candidate set in supplied order; existing structural ranking recorded separately; all prior substantive packets reconciled before new question credit',structuralPriorityQuestionIds:rankedIds,candidateQuestionRecordIds:candidates.map(r=>r.recordId),selectedQuestionRecordIds:selected.map(r=>r.recordId),selectedFeedbackRecordIds:candidates.map(r=>'explanation:'+r.recordId),questionExclusions:exclusions,ambiguousPremiseOrContrastHolds:['mcq:m028','mcq:m079','mcq:m083','mcq:m084','mcq:m200','mcq:m640'],ambiguityDisposition:'qualified_pending_owner_not_resolved_or_approved',sourceChecks,meaningBoundaryChecks,pilotBoundary,preservedPilotFeedbackLinkReconciliation,questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorHolds,objective51Census:census,objective51Denominator:{broadCandidates:103,localCandidates:103,privateMetadataOnlyCandidates:0,allPacketPriorDispositions:28,priorByKind:counts(oldBroad),newQuestionDispositions:10,newFeedbackDispositions:10,newAgentDispositions:20,combinedAgentDispositions:48,remaining:55,remainingLocal:55,remainingPrivateMetadataOnly:0,remainingByKind:counts(remaining)},remainingObjective51RecordIds:remaining.map(r=>r.id),bankProgress,unchangedObjective52Progress:base.objective52Denominator,unchangedObjective54Progress:base.unchangedObjective54Progress,unchangedObjective45Progress:base.unchangedObjective45Progress,unchangedObjective46Progress:base.unchangedObjective46Progress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},privateBoundary:{p017Revision:'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42',payloadReviewed:false,trustedRevisionId:null,localPilotFallbackDoesNotTransferToPrivate:true},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
function validate(value){
 assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);
 assert.equal(new Set(value.selectedQuestionRecordIds).size,10);assert.equal(value.questionProposals.length,10);assert.equal(value.explanationProposals.length,10);
 assert(value.questionProposals.every(r=>!c.previous.has(r.recordId)));assert(value.explanationProposals.every(r=>!legacyPrevious.has(r.recordId)));
 for(const r of value.questionProposals){const s=c.questions.get(r.recordId);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);}
 for(const r of value.explanationProposals){const s=c.questions.get(r.parentId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.record.localRevisionSignature);assert.equal(r.mainCorrectionRevision,sig(s.q.exp));assert.equal(r.wrongFeedbackRevision,sig(s.q.wrongFeedback));assert.equal(r.distractorCorrections.length,3);}
 // Every exported decision is checked against independently rebuilt current sources and fixed review judgments.
 const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);
}
let completedNegativeChecks;validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet);assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<10;i++){
 reject(p=>p.questionProposals[i].sourceRevision=p.sourceChecks[i].revisions.preEditorialSnapshotMerged);reject(p=>p.questionProposals[i].trustedRevisionId=p.sourceChecks[i].revisions.trustedCompilerObserved);reject(p=>p.questionProposals[i].contentQualification='');reject(p=>p.questionProposals[i].primaryConceptProposal='invented');reject(p=>p.questionProposals[i].humanApproved=true);reject(p=>p.questionProposals[i].newFamilyCredit=1);reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);reject(p=>p.questionProposals[i].familyLabelProposal='independent');reject(p=>p.questionProposals[i].objectiveScopeProposal={assessedCodes:['5.1'],contextCodes:[],status:'approved'});reject(p=>p.questionProposals[i].skillRoleProposal='invented');reject(p=>p.questionProposals[i].difficultyDisposition='calibrated');
}
for(let i=0;i<10;i++){
 reject(p=>p.sourceChecks[i].snapshotReplayChecked=!p.sourceChecks[i].snapshotReplayChecked);reject(p=>p.sourceChecks[i].revisions.authored=p.sourceChecks[i].revisions.authored===null?p.sourceChecks[i].revisions.preEditorialSnapshotMerged:null);reject(p=>p.sourceChecks[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);reject(p=>p.sourceChecks[i].optionShuffleProbe.feedbackRemapChecked=false);reject(p=>p.sourceChecks[i].sourcePriority=0);
 reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%10].sourceRevision);reject(p=>p.explanationProposals[i].parentLocalRevision='stale');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');reject(p=>p.explanationProposals[i].objectiveScopeProposal={assessedCodes:['5.1']});reject(p=>p.explanationProposals[i].mainCorrectionRevision='stale');reject(p=>p.explanationProposals[i].deliveryGate='all_before_submit');reject(p=>p.explanationProposals[i].approvedRemediation=true);
 for(let k=0;k<3;k++){reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].assessedSecondary=true);}
}
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);for(const path of holdPaths)reject(p=>{let r=p.priorHolds;for(const k of path.slice(0,-1))r=r[k];r[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{let old=p.priorHolds;for(let i=0;i<17;i++)old=old.inheritedHolds;old=old.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
for(let i=0;i<42;i++)reject(p=>p.allPacketReconciliation.olderQuestions[i].priorDispositionRevision='stale');
reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.allPacketReconciliation.olderQuestions.push(p.allPacketReconciliation.olderQuestions[0]));reject(p=>p.allPacketReconciliation.supportOnlyReferences[0].status='fully_reviewed');reject(p=>p.questionProposals.push({...p.questionProposals[0],recordId:ids[0]}));reject(p=>p.questionExclusions.push({recordId:'mcq:'+ids[0],newQuestionCredit:1}));reject(p=>p.ambiguousPremiseOrContrastHolds.pop());reject(p=>p.ambiguityDisposition='cleared');reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=373);reject(p=>p.objective51Census.pop());reject(p=>p.objective51Denominator.remaining=0);reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
reject(p=>p.unchangedObjective45Progress.remaining=0);reject(p=>p.unchangedObjective46Progress.remaining=0);reject(p=>p.structuralPriorityQuestionIds.reverse());reject(p=>p.sourceChecks[0].unchangedWrongCorrectionCount=0);reject(p=>p.sourceChecks[3].changedWrongCorrectionCount=3);
reject(p=>p.pilotBoundary.roleWeightTeachingPublicationApprovalTransferred=true);reject(p=>p.pilotBoundary.cleanPointBoundary.hold='');reject(p=>p.pilotBoundary.recoveryBoundary='');reject(p=>p.pilotBoundary.preservedPilotQuestionProposals[0].primaryConceptProposal=null);reject(p=>p.pilotBoundary.mttrGlossaryBoundary.conceptLinkProposals=['recovery.mttr']);reject(p=>p.preservedPilotFeedbackLinkReconciliation[0].duplicateCredit=1);reject(p=>p.unchangedObjective52Progress.remaining=0);reject(p=>p.unchangedObjective54Progress.remaining=0);
for(let i=0;i<10;i++){reject(p=>p.questionProposals[i].sourceInspectionRevision='stale');reject(p=>p.explanationProposals[i].parentDispositionStatus='existing_matching_question_judgment_reused');for(let k=0;k<3;k++){reject(p=>p.explanationProposals[i].distractorCorrections[k].choiceRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].teachingRationale='');}}
for(let i=0;i<meaningBoundaryChecks.length;i++)reject(p=>p.meaningBoundaryChecks[i].stemRevision='stale');reject(p=>p.meaningBoundaryChecks[0].universalMandatoryProcedureClaimApproved=true);reject(p=>p.meaningBoundaryChecks[3].universalPasswordMinimumApproved=true);reject(p=>p.meaningBoundaryChecks[4].sixIndependentSkillsApproved=true);reject(p=>p.meaningBoundaryChecks[4].explicitVersion='1.1');reject(p=>p.meaningBoundaryChecks[5].universalAlgorithmOrModeMandateApproved=true);reject(p=>p.meaningBoundaryChecks[6].internalOwnerProvesLegalRole=true);reject(p=>p.objective51Denominator.priorByKind.glossary_definition=30);
completedNegativeChecks=negativeMutationChecks;
const exported={...packet,negativeMutationChecks};validate(exported);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const report=[
 '# Phase 2B-5 — objective 5.1 governance MCQs and complete feedback',
 '**NOT READY.** Review date: **11 October 2026**. Finite local/offline review. Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. Only this packet, report and focused audit are added. A pending disposition records a source-bound judgment; a hold preserves an unresolved limitation without fixing learner content.',
 '## Authority and finite selection',
 'The master plan and Phase 1 audit were read in full earlier in this continuing session. The approved master plan governs product decisions; the audit supplies verified historical implementation facts. Current source bindings were rechecked. No unresolved authority conflict affects this local slice. Standing local content/family delegation permits draft review; canonical roles, scope, skills, calibrated difficulty, teaching links, weights, publication and activation remain separate gates.',
 'Requested order: **'+ids.join(', ')+'**. Scores in that order: **10,10,20,20,35,20,135,35,25,55**. Separate structural rank: **'+rankedIds.join(', ')+'**. Scores prioritise inspection; they do not establish correctness or difficulty. The actual effective question, all offered choices, key, main explanation and three wrong-choice corrections were compared with authored/imported, captured and preeditorial sources. All ten questions and all ten feedback bundles have no prior matching substantive review.',
 '**10 new question judgments +10 new complete-feedback judgments =20 new pending catalogue dispositions.** There are no reused selected parents, duplicate question credits, private substitutions or source-insufficient deferrals. Every new scope/skill/role proposal and primary/trusted identity stays null; secondary/link arrays stay empty, family credit and weights zero, and approval/publication/teaching/evidence/activation flags false. Difficulty is an observed uncalibrated label. One document or framework label does not demonstrate operational governance, legal compliance or independently assessed components.',
 '## All-packet reconciliation and exact coverage',
 'All **64 prior substantive packets** are reconciled against current source revisions, including **42 older distinct question judgments (30 MCQs+12 local PBQs)**. There are **22 duplicate cross-packet references** and **seven brief support/link references**, with zero new coverage from either. The five older pilot explanation links now reference already completed feedback reviews; their history is preserved separately with no extra credit. Fifteen older question-only judgments still lack full feedback after this slice. The frozen ledger and all prior packets remain unchanged.',
 '| Pending catalogue coverage | Prior | New | Combined | Remaining |\n| --- | ---: | ---: | ---: | ---: |\n| Question judgments | 385 | 10 | 395/483 | 88 |\n| Complete feedback | 370 | 10 | 380/483 | 103 |\n| Question and complete-feedback pairs | 370 | 10 | 380/483 | 103 |',
 'Questions become **367/395 MCQs+28/88 local PBQs**, leaving **28 MCQs+60 PBQs**. Complete pairs become **364 MCQs+16 local PBQs**, leaving **31 MCQs+72 PBQs** without complete feedback. The 483 local-assessment denominator excludes two private alternatives, nine starter assessments and two guest demos. “395 combined questions” is the total across formats, not completion of all 395 MCQs.',
 'Objective 5.1 has **103 local catalogue records and no private records**. Its **28 prior pending dispositions** are overlapping glossary and whole teaching-unit reviews, not ten earlier question reviews or approval of the entire objective. Their exact kinds are bound below. Add ten questions and ten feedback bundles for **48/103 pending dispositions**, leaving **55 local records**. All ten local objective 5.1 MCQs now have question and full-feedback pending judgments. All 103 census rows and all 55 residual IDs and revisions are bound in the packet.',
 '| Prior objective 5.1 kind | Count |\n| --- | ---: |\n'+Object.entries(counts(oldBroad)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
 '| Remaining objective 5.1 kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
 'The residual PBQ is **pbq:p039**, with its distinct **explanation:pbq:p039** bundle; neither has new coverage here. The other 53 residuals are two deck containers, 39 flashcards and 12 glossary definitions. Earlier overlapping lesson, checks, sections and traps retain their exact prior judgments and holds; no shared keyword creates additional coverage, scope approval or teaching-link approval. Objective 5.2 stays **63/141,78 remaining (76 local+two private)**; objective 5.4 stays **39/115,76 remaining**; objective 4.5 stays **63/169,106 remaining**; objective 4.6 stays **89/151,62 remaining**.',
 '## Ten judgments and all feedback corrections',
 reviews.map(r=>'**'+r.id+'.** '+r.meaning+'\n\n'+r.hold+'\n\nMain teaching judgment: '+r.main+'\n\nWrong-choice contrasts, in current wrong-choice order:\n\n'+r.contrasts.map((t,k)=>(k+1)+'. '+t).join('\n')).join('\n\n'),
 'Explicit ambiguity holds cover document title versus adopted function (m028/m200), universal mandatory-procedure wording (m079/m084), overly exclusive policy coverage (m083), and internal versus legal role authority (m640). Every selected question and feedback bundle remains qualified. Richer review reasoning does not rewrite or clear the actual learner text.',
 '## Source precedence and delivery checks',
 '**One actual captured/snapshot replay: m200.** The capture is an active upsert dated 26 July 2026, with sort_order **216** and payload fingerprint **e23b720151078f3e05afa277dbcbeb6258739e1a46d2396fa65e20790a9b0533**. The actual snapshot is replayed through the publication/editorial pipeline and matches the selected effective semantics and published ordering. Authored hard → captured easy → effective medium is observed metadata only. The snapshot narrows the old technical-parameter choice, supplies wrong corrections and an AES-256 illustration; effective editorial removes the illustration as a universal mandate. Captured status/order does not prove a current live database read or deployment.',
 '**One import: m640, QB1 question 40.** It equals its authored/preeditorial source. Current content changes the stem to a policy-specific internal allocation and replaces the old legal-controller alternative with system operator; copied generic feedback becomes specific role contrasts. The other eight uncaptured rows also have authored=preeditorial. All ten authored/imported rows exist; no snapshot-only or private substitute is used.',
 '**Seven preeditorial-to-effective stems change** (m083,m084,m155,m191,m200,m371,m640); spelling-only changes count as source changes, not new assessed understanding. **Four choice sets change** (m155,m371,m398,m640). Frozen authored-comparison flags show five option changes because m200 differs from authored even though its current options equal the captured/preeditorial options. All key positions remain unchanged, and all ten main explanations change.',
 '**Thirty wrong-choice corrections checked:19 new/changed and11 unchanged.** Seven whole wrong bundles change. m028,m079,m084 retain all three corrections, and m083 retains two; m083’s incident-policy correction changes only organisation spelling. m155,m191,m200,m371,m398 have no authored wrongFeedback. For m200 the captured source already supplies three corrections and an empty keyed entry; effective editorial changes the three non-key corrections. For the other four, effective editorial supplies all twelve wrong corrections. Retained text is inspected and qualified rather than assumed correct.',
 '| Question | Authored domain/difficulty | Preeditorial domain/difficulty | Effective domain/difficulty |\n| --- | --- | --- | --- |\n'+candidates.map(row=>{const s=c.questions.get(row.recordId);return'| '+row.questionId+' | '+s.authored.ch+'/'+s.authored.difficulty+' | '+s.preQuestion.ch+'/'+s.preQuestion.difficulty+' | '+s.q.ch+'/'+s.q.difficulty+' |';}).join('\n'),
 'm155 changes domain 3→5; no new whole-governance scope approval is inferred. Preeditorial difficulty changes for m084/m191/m640 medium→easy and m200 easy→medium. m200’s authored hard label is a separate source layer. Shorter wording, imported origin or management context does not calibrate difficulty or approve retagging.',
 '**Ten deterministic shuffles** execute the actual option-shuffle and wrong-feedback functions, preserve keyed meaning and verify every correction after remapping. Practice/launch selector signatures match earlier delivery bindings. Feedback remains conditional on selection, submission, entitlement and chosen wrong option. No browser pool, actual policy adoption, password setting, encryption configuration, account action, threat model, data ownership decision, legal scope or learner behaviour is observed.',
 'Seven source-bound meaning probes hold universal mandatory-procedure claims false for m079/m084/m398; hold m028’s 12-character example apart from a universal password baseline; bind m191 to version 2.0 and six functions without six skills or certification; keep m200 free of a universal algorithm/mode mandate; and retain m640’s policy-specific accountability without deciding legal roles. These are semantic-boundary checks, not numerical calculations, skills or operational tests.',
 '## Family comparisons and preserved authority',
 comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
 'The six hierarchy recognitions conservatively share **governance-document-function-discrimination**:m028,m079,m084,m200,m371,m398. They distinguish different taught functions within one repeated contrast set; this provisional shared-family judgment is neither a claim that their meanings are identical nor proof of independent transfers between document types. The remaining provisional labels describe AUP recognition, preimplementation threat-model activity naming, versioned CSF recognition and policy-specific business data ownership. Every new family has zero novelty/mastery credit and no independence approval.',
 'Existing m227/m399 threat-model-context limits and m085/m641/m090 controller/regulatory/retention qualifications remain exact. Encryption or account-task context gives no extra cryptographic/IAM skill. Management, board, owner, Govern and approval language gives no learner evidence of authority, exception approval or achieved governance. No role or canonical teaching link is invented.',
 'Exact historical owner content and family decisions, all three draft-comparison hashes and the five original recovery pilot-role proposals remain preserved. All 15 approved draft content revisions and 14 editorial family judgments stay separate from immutable draft flags. mtd.01 remains in m196’s existing family with zero novelty; rpo.03’s accepted clean-point distinction retains the no-psychometric-independence, no-learner-transfer and no-clean-source-guarantee caveat. The five full pilot feedback judgments and their brief-link reconciliation remain preserved. MTTR glossary and coarse p048/p211 support-only holds stay exact. No content/family approval transfers to metadata, teaching, weights or publication.',
 '## Primary-source support and inference limits',
 '[NIST CSF 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), 26 February 2024, section 2 names six functions and states their structure is not a sequence of required actions. Its role/policy outcomes call for defined, communicated authority and enforcement. Our inference keeps function-name recognition separate from achieving those outcomes. The [NIST CSF FAQ](https://www.nist.gov/cyberframework/faqs) states NIST does not certify or endorse CSF implementations and notes that policies or customers can require its use. This supports version and certification qualifications; no full framework implementation or conformity is assessed.',
 '[NIST SSDF 1.1, PW.1.1–PW.1.2](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218.pdf) describes design risk modelling and maintaining security requirements and decisions through the lifecycle. It supports identifying the supplied early analysis while withholding guaranteed cost savings, a completed model and independently assessed modelling steps. The [NIST policy glossary](https://csrc.nist.gov/glossary/term/policy) contains context-specific rule and organisational-direction definitions. Our inference qualifies a rigid title-only hierarchy rather than treating technical policy detail as impossible. The general SP800-12 publication was located, but detailed procedure searches failed; unseen contents are not used as authority.',
 '[ISO/IEC 27001 overview](https://www.iso.org/standard/27001), [PCI DSS overview](https://www.pcisecuritystandards.org/standards/pci-dss/) and [AICPA SOC resources](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) support the limited ISMS, payment-account security and service-control report contrasts. They can coexist with CSF. No full paid standard, SOC report, payment environment, version-specific control set or certification is inspected.',
 '[GDPR Article 4(7)–(8)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng) defines controller and processor by actual personal-data processing functions. Our inference prevents an internal owner label from establishing those legal roles. This question supplies an internal company policy, not GDPR applicability or a legal retention mandate. No jurisdiction, record, agreement, real processing role or compliance result is determined; earlier legal scope holds remain.',
 '## Preserved holds and release boundary',
 'All five preceding objective 5.2 pilot-feedback qualifications and all 16 risk-feedback holds remain inherited, including clean usable point/window assumptions, m086 plan overlap, m089 feedback-only multiplication premise, m374 cost horizon and m731 requesting rather than approving an exception. All 12 objective 5.4 holds,13 objective 4.5 holds,11 final/18 first objective 4.6 holds and every earlier scope, role, supplier, crypto, PKI, PFS, channel, Unicode, PBQ grammar/grading, delivery, targeting and policy-currentness hold remain exact. This includes m305 whole scope,m046 precise contrast,m432 numbered scope. No earlier limitation is erased.',
 'Private p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, unavailable/unreviewed with null trusted identity; its private explanation also remains unavailable. No private fetch, compilation, export or local-fallback substitution. Review exports contain no stems, offered choices, keys, option-indexed grading fields or learner records.',
 'Active package unchanged: **1878 records/435 identities/2954 review decisions/489 unresolved mappings/seven existing primary proposals**, SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All 25 protected release hashes remain exact. Private semantics,36 unsupported local PBQ grammars, residual coverage, substantive holds, canonical metadata, taxonomy and calibration still block readiness.',
 '**NOT READY.** Local/default-off/unwired/learner-invisible. No runtime, active-package, canonical role/scope/skill/difficulty, teaching/weight, learner evidence, shadow/live write, publication, migration, cohort, deployment, activation or Phase 3 change.',
 '## Validation and delivery',
 'Run node '+scriptPath+' and npm run audit:content-mapping. Focused validation rebuilds and matches the frozen ledger, reconciles all64 prior packets, checks ten new questions and ten complete bundles,30 correction bindings,one real captured replay,ten shuffles,seven meaning probes,103 objective census rows and55 residuals. **'+negativeMutationChecks+' rejected mutations** cover stale/trusted source substitutions,new-credit inflation,invented roles,incorrect choice/correction binding,source order/captures,qualification and inherited-hold erasure,universal document/technical/legal claims,duplicates,support overcount,forbidden exports,private substitution and activation.',
 'All29 mapping tests and deterministic package reproduction,25 protected file checks and git diff --check are required before the exact three-file **[skip deploy]** commit/push. The configured Vercel ignoreCommand skip marker is verified. Delivery requires exact local HEAD=origin/main=remote refs/heads/main and artifact hashes. A push establishes no live deployment; unrelated dirty/generated files remain unstaged.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE51_MCQS_NOT_READY',candidateIds:ids,newQuestionDispositions:10,newFeedbackDispositions:10,bankProgress,objective51:packet.objective51Denominator,unchangedObjective52:packet.unchangedObjective52Progress,snapshotReplays:1,wrongCorrections:30,changedWrongCorrections:19,unchangedWrongCorrections:11,shuffleProbes:10,meaningProbes:7,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
