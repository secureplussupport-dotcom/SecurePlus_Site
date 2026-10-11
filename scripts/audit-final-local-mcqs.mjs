import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-final-local-mcqs.mjs',packetPath='docs/drafts/phase-2b5-final-local-mcqs-proposals.json',reportPath='docs/phase-2b5-final-local-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective44-49-operations-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'da5bee2b47ccf1656cca47241d6bc56a0f432fd5d89983c456a20a337c9ba16a');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective45-mcqs-proposals.json','docs/drafts/phase-2b5-objective54-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-risk-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-pilot-feedback-proposals.json','docs/drafts/phase-2b5-objective51-mcqs-proposals.json','docs/drafts/phase-2b5-objective53-55-assurance-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);assert.equal(c.ledger.rows.filter(r=>legacyPrevious.has(r.recordId)).length,375);
const ids=["m183", "m185", "m194", "m288", "m502", "m631", "m177"];
const candidates=ids.map(id=>c.ledger.rows.find(r=>r.recordId==='mcq:'+id));
assert.equal(new Set(ids).size,7);assert(candidates.every(r=>r&&r.kind==='mcq'&&r.objectiveCodesObserved.some(code=>['4.7','5.6','4.2','3.4'].includes(code))));
// The supplied order is a set order, not a structural-priority ranking.
assert.deepEqual(candidates.map(r=>r.priorityScore),[25,35,35,35,35,55,10]);
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
assert.equal(inventory.length,67);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);
const excluded=candidates.filter(r=>c.previous.has(r.recordId)),selected=candidates.filter(r=>!c.previous.has(r.recordId));
assert.deepEqual(excluded.map(r=>r.questionId),['m177']);assert.equal(selected.length,6);assert(candidates.every(r=>!c.previous.has('explanation:'+r.recordId)));
const exclusions=excluded.map(r=>{const p=c.previous.get(r.recordId);return{recordId:r.recordId,sourceRevision:r.revisions.localEffective,publishedRecordSignature:r.revisions.publishedCatalogue,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),priorFamilyLabel:p.row.familyLabelProposal,reason:'current_matching_prior_substantive_question_judgment_reused_feedback_still_unreviewed',newQuestionCredit:0,newFamilyCredit:0};});
const priorInventory=base.allPacketReconciliation.inventory;
assert.deepEqual(inventory.filter(r=>r.path!==basePath),priorInventory);
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorBank.length,417);assert.equal(priorFeedback.length,404);
const objectiveCodes=['4.7','5.6','4.2','3.4'];
const broadByObjective=Object.fromEntries(objectiveCodes.map(code=>[code,c.pkg.records.filter(r=>r.objectiveCodes.includes(code))]));
for(const [code,n]of [['4.7',2],['5.6',3],['4.2',1],['3.4',1]])assert.equal(c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes(code)).length,n);
const pilotPath='docs/drafts/phase-2b5-objective52-pilot-mapping-proposals.json',pilot=readJson(pilotPath);

const preservedPilotQuestionProposals=pilot.questionProposals.filter(r=>r.disposition==='direct_pilot_proposal');
assert.deepEqual(preservedPilotQuestionProposals.map(r=>r.questionId),['m032','m086','m088','m196','m635']);
for(const r of preservedPilotQuestionProposals){assert.equal(r.sourceRevision,c.records.get(r.recordId).localRevisionSignature);assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);assert.equal(r.humanApproved,false);assert.equal(r.masteryWeight,0);}
verifySourceBindings(pilot.draftComparisons);assert.equal(hashFile(pilotPath),'de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c');
const draft=readJson(pilot.draftComparisons[0].path),clean=draft.questions.find(r=>r.id==='draft.pilot1.rpo.03');
const pilotBoundary={preservedPilotQuestionProposals,ownerContentDecisionBinding:{path:'docs/drafts/phase-2b5-pilot-batch-1-content-decision.md',sha256:hashFile('docs/drafts/phase-2b5-pilot-batch-1-content-decision.md')},ownerFamilyDecisionBinding:{path:'docs/drafts/phase-2b5-pilot-batch-1-family-decision.md',sha256:hashFile('docs/drafts/phase-2b5-pilot-batch-1-family-decision.md')},draftComparisons:pilot.draftComparisons,ownerReservedChoices:pilot.ownerReservedChoices,approvedContentRevisionsPreserved:true,approvedFamilyJudgmentsPreserved:true,newPilotRoleCredit:0,roleWeightTeachingPublicationApprovalTransferred:false,recoveryBoundary:'MTD is the outer business-interruption limit; RTO is the service-restoration target; RPO concerns recoverable data age. One contrast does not supply independently assessed secondary evidence. MTD remains supporting scope, not an explicit BIA exam bullet.',cleanPointBoundary:{recordId:clean.id,draftQuestionRevision:sig(clean),familyRationale:clean.familyRationale,accuracyCheck:clean.accuracyCheck,priorBankRecordId:'mcq:m088',priorBankRevision:c.records.get('mcq:m088').localRevisionSignature,hold:'Owner accepted the clean-point reasoning distinction from tested successful version cadence. This is editorial judgment, not psychometric independence, learner transfer or a clean-source guarantee.'},mttrGlossaryBoundary:pilot.instructionalProposals.find(r=>r.recordId==='glossary:mttr'),coarseRecoveryPbqBoundary:pilot.questionProposals.filter(r=>['pbq:p048','pbq:p211'].includes(r.recordId))};
assert.deepEqual(pilotBoundary,base.pilotBoundary);
const preservedPilotFeedbackLinkReconciliation=base.preservedPilotFeedbackLinkReconciliation;assert.equal(preservedPilotFeedbackLinkReconciliation.length,5);
assert.equal(duplicateReferences.length,22);assert.equal(supportOnlyReferences.length,7);
const protectedHashes=readJson('docs/evidence/phase-2b5/release-checksums.json').files;assert.equal(Object.keys(protectedHashes).length,25);verifySourceBindings(Object.entries(protectedHashes).map(([path,sha256])=>({path,sha256})));
const reviews=[
  {
    "id": "m183",
    "meaning": "Identify coordinated response playbooks as the distinguishing SOAR capability relative to the supplied traditional SIEM functions.",
    "hold": "HOLD orchestration as permission to contain/remediate everything without human involvement, guaranteed workload savings or safe completed response. Actions require defined authority, suitable integrations/permissions, validation and context; some can be authorised automatically while risky actions may require human approval. Modern products can combine SIEM/SOAR functions. Retention, correlation and dashboards can support playbooks without being mutually exclusive capabilities. One capability choice does not independently assess every playbook step, a production deployment or incident recovery. Authored hard to easy is uncalibrated.",
    "main": "SOAR coordinates tools and response workflows. A playbook must define permitted actions and checks; the platform name alone proves neither authority nor a successful incident response.",
    "contrasts": [
      "Central event retention/search is an established SIEM function and may also support SOAR. It is not the particular response-coordination distinction requested.",
      "SIEM rule correlation helps detection and may trigger a workflow. Detecting an event and authorising/executing its response remain separate.",
      "Dashboards support investigations in several products. Visualisation alone does not demonstrate coordinating response actions."
    ],
    "family": "response-playbook-orchestration-capability-identification"
  },
  {
    "id": "m185",
    "meaning": "Identify the structured threat-information representation and exchange-protocol roles of the STIX/TAXII pair.",
    "hold": "HOLD the two named roles as independently scored components, exchanged indicators as trusted/relevant or universal version/tool interoperability. The stem specifies no version; STIX2.1/TAXII2.1 primary sources illustrate distinct standards rather than approving a version for this question. STIX is not limited to IoCs or a required single transport, and TAXII is not restricted to only one content type. Machine readability does not establish intelligence accuracy, authorisation, freshness, confidence, compatibility or a validated automated blocking rule. Preserve the existing m722/m423 family and version/interoperability holds; no novelty from another pairing example.",
    "main": "STIX structures threat information and TAXII supports its exchange. Tools and analysts still need to check versions, permissions, relevance and confidence before acting on that information.",
    "contrasts": [
      "This reverses the supplied roles: representation belongs to STIX and exchange to TAXII. Recognising the pair is one keyed decision.",
      "CVSS communicates vulnerability severity and SCAP addresses standardised assessment content. Neither is the specific threat-information representation/exchange pair supplied here.",
      "Syslog event messaging and TLS transport protection serve different functions. Secure transport does not itself supply a structured threat-object model or trustworthy intelligence."
    ],
    "family": "STIX_TAXII_representation_exchange_pair"
  },
  {
    "id": "m194",
    "meaning": "Identify supportive phishing-awareness behaviour improvement as the stated purpose of simulated phishing and follow-up training.",
    "hold": "HOLD immediate training as universally most effective, falling clicks as proven risk reduction or simulations as actual safe/authorised campaigns. Difficulty, recipient context, delivery/technical filtering, denominator, comparable scenarios and reporting behaviour affect interpretation. Safe design, privacy and a supportive reporting culture require actual decisions and checks; no employee is tested, punished or trained here. Measuring and reducing susceptibility is one program-goal recognition choice, not evidence of measured change, validated learning transfer or independently assessed metrics. The authored causal/success claims are removed and remain unapproved.",
    "main": "The program aims to help staff recognise and report phishing. Its results need context: fewer clicks can reflect easier messages or changed delivery, rather than improved security behaviour.",
    "contrasts": [
      "Termination is not this stated learning purpose. Punitive treatment can discourage reporting; no employment or disciplinary policy is determined.",
      "Compliance evidence can be a benefit, but recognising that purpose is distinct from demonstrating improved behaviour or actual compliance.",
      "Mail filtering affects who sees a simulation. The stated program focuses on staff behaviour, without claiming technical controls are irrelevant."
    ],
    "family": "phishing-simulation-learning-purpose-identification"
  },
  {
    "id": "m288",
    "meaning": "Select established independent verification and approvals before acting on the unusual urgent payment request.",
    "hold": "HOLD a displayed From address, valid mailbox or successful SPF/DKIM/DMARC as business authorisation. The effective question asks for a next action and removes the unsupported choice of forged-header versus account-takeover attribution. A callback must use established trusted contact/approval channels, not details supplied in the message; a call or familiar voice alone does not guarantee identity or payment authority. Social pressure is a warning, not proof of one attack method. No transfer, callback, account investigation or email-policy change occurs. Observed domain2 to5 and hard to medium do not approve whole5.6 scope.",
    "main": "Verify the request using the organisation's established independent process and required approvals. Authentication of an email channel does not establish that a particular transfer was authorised.",
    "contrasts": [
      "The displayed address may be misleading and a real mailbox can be compromised. Neither its appearance nor authenticity proves payment authority.",
      "Replying stays in the potentially compromised channel. The independent established process is the relevant distinction.",
      "SPF/DKIM success concerns mail-domain handling/signatures, not the business approval. A legitimate authenticated account can send an unauthorised request."
    ],
    "family": "independent-payment-request-verification"
  },
  {
    "id": "m502",
    "meaning": "Choose a comparable phishing click-rate trend as a behavioural measure rather than a training-activity count.",
    "hold": "HOLD a trend as causal proof that training changed behaviour, guaranteed real-world risk reduction or complete employee security competence. Campaign difficulty/context, recipients, delivery/filtering, denominator, time window and reporting rates affect comparison. The effective question removes the authored causal phrase and four-quarter example; no real campaign data, effect size or threshold is supplied. A behaviour-linked measure is more direct than attendance/hours/topics in these choices, not universally the best or only program metric. Compare the correlated program-purpose reasoning in m194 without independence or transfer approval.",
    "main": "Clicks in comparable simulations describe a response to a phishing scenario more directly than hours spent in training. Context and other measures are still needed before drawing conclusions about causes or security outcomes.",
    "contrasts": [
      "Completion measures participation. It may be useful program evidence but does not by itself establish resistance to phishing.",
      "Hours describe activity or exposure rather than how staff respond. They can complement, rather than replace, behavioural measures.",
      "Topic count describes delivered breadth. It does not show how learners responded or prove training caused change."
    ],
    "family": "phishing-behaviour-versus-training-activity-metric"
  },
  {
    "id": "m631",
    "meaning": "Identify degaussing from a suitable rated magnetic field applied to supported magnetic media.",
    "hold": "HOLD whole4.2 scope, a precise canonical sanitisation role or completed asset decommissioning from this narrow technique name. Preserve the earlier missing-exact-sanitisation-identity and verification-versus-validation boundary. Media coercivity, hybrid components, tool rating/calibration, policy and acceptance matter; an unusable drive can still contain recoverable data. Degaussing does not sanitise flash/SSDs and is not automatically an approved destroy method. The effective suitable-media premise removes the old universal no-forensic-recovery guarantee and replaces the overlapping purge category distractor. Cryptographic erase requires suitable encryption/key handling; shredding and overwriting labels alone do not prove successful sanitisation. No media is erased or disposed of.",
    "main": "Degaussing uses a field appropriate to magnetic storage. Naming it does not establish suitability or success; execution verification and the final validation/acceptance decision are separate requirements.",
    "contrasts": [
      "Overwriting writes replacement data rather than using a magnetic field. Appropriate coverage and validation remain unverified.",
      "Shredding physically reduces media under an appropriate process. Its effectiveness depends on media and required outcomes, rather than the technique name alone.",
      "Cryptographic erase sanitises necessary key material under applicable prerequisites, rather than changing magnetic orientation. Merely deleting one key does not establish all target data is inaccessible."
    ],
    "family": "supported-magnetic-media-degaussing-identification"
  },
  {
    "id": "m177",
    "meaning": "Review full feedback for the existing differential-backup identification judgment, preserving its exact family with zero new question credit.",
    "hold": "HOLD a named full-plus-latest-differential set as an actual complete, clean, consistent or timely restoration. The differential must match its base and selected recovery point; engine-specific dependencies, catalogs, keys, integrity, access and restore validation remain unverified. Incremental recovery requires the applicable chain under its implementation, not every backup of every type universally. Snapshot mechanisms and dependencies vary. No universal differential speed/storage advantage, RTO/RPO assessment or clean-source guarantee is approved. Keep the prior unresolved mastery identity, identification judgment and exact backup-family decision unchanged; one answer supplies no independently scored secondary components.",
    "main": "Under the supplied backup model, use the relevant full base and latest differential based on it. The question names required backup-set semantics; successful restoration and recovery objectives still need actual evidence.",
    "contrasts": [
      "An incremental records changes from the applicable previous backup and depends on the required chain. A last incremental alone is insufficient under the supplied conventional model; actual implementations vary.",
      "A full backup covers the selected dataset, rather than only its changes since an earlier full backup. Inclusion and consistency must still be verified.",
      "A snapshot is a point-in-time representation with implementation-specific storage/dependencies. It is not automatically an independent differential backup or guaranteed clean recovery source."
    ],
    "family": "differential-backup-restore-set-identification"
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
assert.equal(sourceChecks.filter(r=>r.snapshotReplayChecked).length,0);assert.equal(sourceChecks.filter(r=>r.stemChangedFromPreeditorial).length,5);assert.equal(sourceChecks.filter(r=>r.optionsChangedFromPreeditorial).length,6);assert.deepEqual(candidates.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m631']);assert.equal(sourceChecks.filter(r=>r.authoredMissingWrongCorrections).length,5);
assert.equal(sourceChecks.filter(r=>r.wrongCorrectionsChanged).length,7);assert.equal(sourceChecks.reduce((n,r)=>n+r.changedWrongCorrectionCount,0),21);assert.equal(sourceChecks.reduce((n,r)=>n+r.unchangedWrongCorrectionCount,0),0);
const meaningBoundaryChecks=[];
function boundary(id,pattern,limits){const s=c.questions.get('mcq:'+id);assert(pattern.test(s.q.q+' '+s.q.opts.join(' ')));meaningBoundaryChecks.push({recordId:s.row.recordId,stemRevision:sig(s.q.q),offeredChoiceSetRevision:sig(s.q.opts),...limits});}
boundary('m183',/playbooks/,{unlimitedAutonomousResponseApproved:false,actualResponseExecuted:false,SIEMSOARFunctionsMutuallyExclusive:false});
boundary('m185',/STIX for formatting and TAXII for exchange/,{twoIndependentSkillsApproved:false,versionSuppliedByStem:false,interoperabilityOrIndicatorTrustEstablished:false});
for(const id of ['m194','m502'])boundary(id,/phishing/i,{causalTrainingEffectEstablished:false,lowerClicksProveLowerRisk:false,actualSimulationOrLearnerTransferObserved:false});
boundary('m288',/independent approval and callback/,{mailAuthenticationEstablishesPaymentAuthority:false,forgedHeaderOrAccountTakeoverDetermined:false,actualTransferOrCallbackPerformed:false});
boundary('m631',/supported magnetic media/,{wholeObjective42ScopeApproved:false,unusableMediaProvesSanitisation:false,verificationEqualsValidation:false,allMediaSanitisationGuaranteed:false});
boundary('m177',/LAST FULL backup/,{matchingBaseRequired:true,actualRestoreSucceeded:false,recoveryMetricOrCleanSourceEvidenceApproved:false,priorFamilyPreserved:true});
const questionReassessments=excluded.map(row=>{const prior=c.previous.get(row.recordId),r=reviews[ids.indexOf(row.questionId)];assert.equal(prior.row.familyLabelProposal,r.family);assert.equal(prior.row.disposition,'unresolved_mastery_identity');assert.equal(prior.row.primaryConceptProposal,null);assert.equal(prior.row.masteryWeight,0);return{...exclusions.find(x=>x.recordId===row.recordId),assessedUnderstanding:r.meaning,contentQualification:r.hold,familyLabelProposal:prior.row.familyLabelProposal,priorDispositionPreserved:true,priorDisposition:prior.row.disposition,priorTaxonomyBlocker:prior.row.taxonomyBlocker,objectiveScopeProposal:null,skillRoleProposal:null,primaryConceptProposal:null,trustedRevisionId:null,secondaryConceptProposals:[],masteryWeight:0,humanApproved:false,published:false,independentEvidence:false};});
const preservedKevTeachingHolds=base.preservedKevTeachingHolds;assert.equal(preservedKevTeachingHolds.length,2);for(const h of preservedKevTeachingHolds){const p=c.previous.get(h.recordId);assert.equal(h.priorDispositionRevision,sig(p.row));assert.equal(h.currentDeadlineOrDirectiveRequirementsResolved,false);}
const questionProposals=selected.map(row=>{
 const i=ids.indexOf(row.questionId),r=reviews[i],check=sourceChecks[i];
 return{recordId:row.recordId,questionId:r.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourceInspectionRevision:sig(check),assessedUnderstanding:r.meaning,contentQualification:r.hold,objectiveScopeProposal:null,skillRoleProposal:null,numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:r.family,familyStatus:'provisional_comparison_no_independence_approval',difficultyObserved:check.difficultyObserved,difficultyDisposition:'source_label_uncalibrated'};
});
const explanationProposals=candidates.map((row,i)=>{
 const s=c.questions.get(row.recordId),q=s.q,r=reviews[i],indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct),prior=c.previous.get(row.recordId);
 assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
 return{recordId:'explanation:'+row.recordId,kind:'explanation_bundle',parentId:row.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:row.revisions.localEffective,parentPublishedRevision:row.revisions.publishedCatalogue,parentDispositionStatus:prior?'existing_matching_question_judgment_reused':'new_question_judgment_in_this_packet',reusedParentDispositionRevision:prior?sig(prior.row):null,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:r.main,contentQualification:r.hold,objectiveScopeProposal:null,withheldPreciseContrast:r.family+'_limits',roleProposal:null,deliveryUnderstanding:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:r.contrasts[k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId));assert.equal(selectedIds.size,13);
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
function coverage(broad,expectedPrior,expectedNewQuestions,expectedNewFeedback,expectedRemaining){
 const prior=broad.filter(r=>c.previous.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id)),newQuestions=questionProposals.filter(p=>broad.some(r=>r.id===p.recordId)),newFeedback=explanationProposals.filter(p=>broad.some(r=>r.id===p.recordId));
 assert.equal(prior.length,expectedPrior);assert.equal(newQuestions.length,expectedNewQuestions);assert.equal(newFeedback.length,expectedNewFeedback);assert.equal(remaining.length,expectedRemaining);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);
 return{denominator:{broadCandidates:broad.length,localCandidates:broad.filter(r=>!r.id.startsWith('private:')).length,privateMetadataOnlyCandidates:broad.filter(r=>r.id.startsWith('private:')).length,allPacketPriorDispositions:prior.length,priorByKind:counts(prior),newQuestionDispositions:newQuestions.length,newFeedbackDispositions:newFeedback.length,newAgentDispositions:newQuestions.length+newFeedback.length,combinedAgentDispositions:prior.length+newQuestions.length+newFeedback.length,remaining:remaining.length,remainingLocal:remaining.filter(r=>!r.id.startsWith('private:')).length,remainingPrivateMetadataOnly:remaining.filter(r=>r.id.startsWith('private:')).length,remainingByKind:counts(remaining)},census:broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:r.id.startsWith('private:')?'unavailable_private_semantics_not_reviewed':c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'})),remainingRecordIds:remaining.map(r=>r.id)};
}
const objectiveCoverage={
 '4.7':coverage(broadByObjective['4.7'],4,2,2,34),
 '5.6':coverage(broadByObjective['5.6'],20,3,3,0),
 '4.2':coverage(broadByObjective['4.2'],22,1,1,44),
 '3.4':coverage(broadByObjective['3.4'],33,0,1,142)
};
for(const [code,total,priorKinds,remainingKinds]of [
 ['4.7',42,{glossary_definition:4},{glossary_definition:11,keyword_guide:2,lesson:2,lesson_check:8,lesson_section:9,lesson_traps:2}],
 ['5.6',26,{glossary_definition:10,keyword_guide:1,lesson:1,lesson_check:4,lesson_section:3,lesson_traps:1},{}],
 ['4.2',68,{glossary_definition:12,keyword_guide:1,lesson:1,lesson_check:4,lesson_section:3,lesson_traps:1},{deck_container:3,flashcard:22,glossary_definition:9,keyword_guide:1,lesson:1,lesson_check:4,lesson_section:3,lesson_traps:1}],
 ['3.4',176,{glossary_definition:20,keyword_guide:1,lesson:1,lesson_check:4,lesson_section:3,lesson_traps:1,mcq:1,pbq:2},{deck_container:6,explanation_bundle:2,flashcard:94,glossary_definition:30,keyword_guide:1,lesson:1,lesson_check:4,lesson_section:3,lesson_traps:1}]
]){const d=objectiveCoverage[code].denominator;assert.equal(d.broadCandidates,total);assert.equal(d.privateMetadataOnlyCandidates,0);assert.deepEqual(d.priorByKind,priorKinds);assert.deepEqual(d.remainingByKind,remainingKinds);}
const objectiveMemberships=new Map();for(const code of objectiveCodes)for(const r of broadByObjective[code])objectiveMemberships.set(r.id,[...objectiveMemberships.get(r.id)||[],code]);
const sharedObjectiveRecords=[...objectiveMemberships].filter(([id,codes])=>codes.length>1).map(([recordId,objectiveCodesObserved])=>({recordId,objectiveCodesObserved}));assert.equal(sharedObjectiveRecords.length,30);assert.equal(objectiveMemberships.size,278);assert(sharedObjectiveRecords.every(r=>!selectedIds.has(r.recordId)));assert([...selectedIds].every(id=>objectiveMemberships.get(id).length===1));
const bankRows=c.ledger.rows,combinedQuestions=new Set([...priorBank.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=bankRows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
assert.equal(combinedQuestions.size,423);assert.equal(combinedFeedback.size,411);assert.equal(paired.length,411);assert.equal(paired.filter(r=>r.kind==='mcq').length,395);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,olderQuestionOnlyDispositions:olderQuestions.length,allPacketPriorQuestions:priorBank.length,newQuestions:questionProposals.length,allPacketCombinedQuestions:combinedQuestions.size,remainingQuestionDispositions:483-combinedQuestions.size,combinedMcqs:bankRows.filter(r=>r.kind==='mcq'&&combinedQuestions.has(r.recordId)).length,combinedLocalPbqs:bankRows.filter(r=>r.kind==='pbq'&&combinedQuestions.has(r.recordId)).length,newFeedbackBundles:7,priorFullFeedback:priorFeedback.length,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.combinedMcqs,395);assert.equal(bankProgress.combinedLocalPbqs,28);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,12);
assert(olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).every(r=>r.kind==='pbq'));
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective44And49HeldDispositions:base.explanationProposals.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal})),olderQuestionPacketBindings:olderQuestions.map(r=>({recordId:r.recordId,priorPacketPath:r.priorPacketPath,priorDispositionRevision:r.priorDispositionRevision,status:'existing_limits_preserved_no_full_feedback_or_approval_inherited'}))};
assert.equal(priorHolds.objective44And49HeldDispositions.length,12);
const comparisonSpecs=[
  {
    "ids": [
      "m183",
      "m066",
      "m166",
      "m361",
      "m618"
    ],
    "meaning": "Response-playbook coordination is the supplied SOAR function; four prior SIEM recognitions share their exact correlation family. Products can combine them. A label or integration neither authorises actions nor proves successful detection, response or workload savings."
  },
  {
    "ids": [
      "m185",
      "m722",
      "m423"
    ],
    "meaning": "Reuse the existing STIX_TAXII_representation_exchange_pair family conservatively. The new stem supplies no version and one paired keyed choice; preserve earlier explicit-version/interoperability and trust limits with zero extra novelty or independent component credit."
  },
  {
    "ids": [
      "m194",
      "m502",
      "m288"
    ],
    "meaning": "Program-purpose recognition, behaviour-versus-activity metric selection and independent payment verification are related introductory decisions. Click trends do not establish causal training outcomes or business approval. Supportive training and comparable metrics remain conditional, without learner-transfer evidence."
  },
  {
    "ids": [
      "m288",
      "m271"
    ],
    "meaning": "Independent payment verification and server-side permission enforcement occur in different contexts, but both distinguish authentication from authority for a sensitive action. Neither mail authentication nor an authenticated application user establishes the required permission. Preserve separate families and scope limits; no attack method, shared mastery identity or independent evidence is inferred."
  },
  {
    "ids": [
      "m631",
      "m177",
      "m088"
    ],
    "meaning": "A sanitisation-technique label, backup-base/set identification and recovery-window reasoning are distinct tasks. Preserve missing exact sanitisation identity, validation/acceptance boundaries and the existing m177 backup family; no disposal success, clean restore, RTO/RPO or canonical-role approval transfers."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids.map(id=>'mcq:'+id),comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get('mcq:'+id),p=c.previous.get('mcq:'+id);return{recordId:s.row.recordId,sourceRevision:s.record.sourceSignature,localRevision:s.row.revisions.localEffective,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
const sourceBindings=[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective44-49-operations-review.md',sha256:hashFile('docs/phase-2b5-objective44-49-operations-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)},...inventory.map(({path,sha256})=>({path,sha256})),pilotBoundary.ownerContentDecisionBinding,pilotBoundary.ownerFamilyDecisionBinding,{path:'docs/phase-2b5-objective52-pilot-mapping-review.md',sha256:hashFile('docs/phase-2b5-objective52-pilot-mapping-review.md')},...pilot.draftComparisons.map(({path,sha256})=>({path,sha256}))];
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'616e1d35ba0efb5559f3025e557ecad76e0f486f',sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,legacyTrackedPriorQuestions:375},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences,status:'current_revision_bound_prior_judgments_reconciled_before_new_credit'},bankSignature:c.ledger.bankSignature,selectionPolicy:'Requested final six unreviewed local MCQs and m177 missing-feedback candidate set in supplied order; existing structural ranking recorded separately; all prior substantive packets reconciled before new question credit',structuralPriorityQuestionIds:rankedIds,candidateQuestionRecordIds:candidates.map(r=>r.recordId),selectedQuestionRecordIds:selected.map(r=>r.recordId),selectedFeedbackRecordIds:candidates.map(r=>'explanation:'+r.recordId),questionExclusions:exclusions,ambiguousPremiseOrContrastHolds:candidates.map(r=>r.recordId),ambiguityDisposition:'qualified_pending_owner_not_resolved_or_approved',sourceChecks,meaningBoundaryChecks,preservedKevTeachingHolds,questionReassessments,pilotBoundary,preservedPilotFeedbackLinkReconciliation,questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorHolds,objectiveCoverage,sharedObjectiveRecords,distinctAffectedCatalogueRecords:278,sharedRecordsCreateNoAdditionalGlobalCredit:true,bankProgress,unchangedObjective44Progress:base.objective44Denominator,unchangedObjective49Progress:base.objective49Denominator,unchangedObjective53Progress:base.unchangedObjective53Progress,unchangedObjective55Progress:base.unchangedObjective55Progress,unchangedObjective51Progress:base.unchangedObjective51Progress,unchangedObjective52Progress:base.unchangedObjective52Progress,unchangedObjective54Progress:base.unchangedObjective54Progress,unchangedObjective45Progress:base.unchangedObjective45Progress,unchangedObjective46Progress:base.unchangedObjective46Progress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},privateBoundary:base.privateBoundary,deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
function validate(value){
 assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);
 assert.equal(new Set(value.selectedQuestionRecordIds).size,6);assert.equal(value.questionProposals.length,6);assert.equal(value.explanationProposals.length,7);
 assert(value.questionProposals.every(r=>!c.previous.has(r.recordId)));assert(value.explanationProposals.every(r=>!legacyPrevious.has(r.recordId)));
 for(const r of value.questionProposals){const s=c.questions.get(r.recordId);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);}
 for(const r of value.explanationProposals){const s=c.questions.get(r.parentId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.record.localRevisionSignature);assert.equal(r.mainCorrectionRevision,sig(s.q.exp));assert.equal(r.wrongFeedbackRevision,sig(s.q.wrongFeedback));assert.equal(r.distractorCorrections.length,3);}
 // Every exported decision is checked against independently rebuilt current sources and fixed review judgments.
 const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);
}
let completedNegativeChecks;validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet);assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<6;i++){
 reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);reject(p=>p.questionProposals[i].trustedRevisionId='invented');reject(p=>p.questionProposals[i].sourceInspectionRevision='stale');reject(p=>p.questionProposals[i].contentQualification='');reject(p=>p.questionProposals[i].primaryConceptProposal='invented');reject(p=>p.questionProposals[i].humanApproved=true);reject(p=>p.questionProposals[i].newFamilyCredit=1);reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);reject(p=>p.questionProposals[i].familyLabelProposal='independent');reject(p=>p.questionProposals[i].objectiveScopeProposal={assessedCodes:['4.7'],status:'approved'});reject(p=>p.questionProposals[i].skillRoleProposal='invented');reject(p=>p.questionProposals[i].difficultyDisposition='calibrated');
}
for(let i=0;i<7;i++){
 reject(p=>p.sourceChecks[i].snapshotReplayChecked=!p.sourceChecks[i].snapshotReplayChecked);reject(p=>p.sourceChecks[i].revisions.authored=p.sourceChecks[i].revisions.authored===null?'invented':null);reject(p=>p.sourceChecks[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);reject(p=>p.sourceChecks[i].optionShuffleProbe.feedbackRemapChecked=false);reject(p=>p.sourceChecks[i].sourcePriority=0);reject(p=>p.sourceChecks[i].changedWrongCorrectionCount=99);
 reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%7].sourceRevision);reject(p=>p.explanationProposals[i].parentLocalRevision='stale');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');reject(p=>p.explanationProposals[i].objectiveScopeProposal={assessedCodes:['4.7']});reject(p=>p.explanationProposals[i].mainCorrectionRevision='stale');reject(p=>p.explanationProposals[i].deliveryGate='all_before_submit');reject(p=>p.explanationProposals[i].approvedRemediation=true);reject(p=>p.explanationProposals[i].parentDispositionStatus='unreconciled');reject(p=>p.explanationProposals[i].reusedParentDispositionRevision='invented');
 for(let k=0;k<3;k++){reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].choiceRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].teachingRationale='');reject(p=>p.explanationProposals[i].distractorCorrections[k].assessedSecondary=true);}
}
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);for(const path of holdPaths)reject(p=>{let r=p.priorHolds;for(const k of path.slice(0,-1))r=r[k];r[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{let old=p.priorHolds;for(let i=0;i<20;i++)old=old.inheritedHolds;old=old.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
for(let i=0;i<42;i++)reject(p=>p.allPacketReconciliation.olderQuestions[i].priorDispositionRevision='stale');
reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.allPacketReconciliation.olderQuestions.push(p.allPacketReconciliation.olderQuestions[0]));reject(p=>p.allPacketReconciliation.supportOnlyReferences[0].status='fully_reviewed');reject(p=>p.questionProposals.push({...p.questionProposals[0],recordId:'mcq:m177'}));reject(p=>p.questionExclusions.push({recordId:'mcq:m177',newQuestionCredit:1}));reject(p=>p.ambiguousPremiseOrContrastHolds.pop());reject(p=>p.ambiguityDisposition='cleared');reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=483);
for(const code of objectiveCodes){reject(p=>p.objectiveCoverage[code].census.pop());reject(p=>p.objectiveCoverage[code].remainingRecordIds.push('invented'));reject(p=>p.objectiveCoverage[code].denominator.newQuestionDispositions=99);reject(p=>p.objectiveCoverage[code].denominator.combinedAgentDispositions=999);}
reject(p=>p.sharedObjectiveRecords.pop());reject(p=>p.distinctAffectedCatalogueRecords=312);reject(p=>p.sharedRecordsCreateNoAdditionalGlobalCredit=false);
reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
for(const code of ['44','49','53','55','51','52','54','45','46'])reject(p=>p['unchangedObjective'+code+'Progress'].remaining=0);
reject(p=>p.structuralPriorityQuestionIds.reverse());reject(p=>p.sourceChecks[2].unchangedWrongCorrectionCount=3);reject(p=>p.pilotBoundary.roleWeightTeachingPublicationApprovalTransferred=true);reject(p=>p.pilotBoundary.cleanPointBoundary.hold='');reject(p=>p.pilotBoundary.recoveryBoundary='');reject(p=>p.pilotBoundary.preservedPilotQuestionProposals[0].primaryConceptProposal=null);reject(p=>p.pilotBoundary.mttrGlossaryBoundary.conceptLinkProposals=['recovery.mttr']);reject(p=>p.preservedPilotFeedbackLinkReconciliation[0].duplicateCredit=1);
for(let i=0;i<meaningBoundaryChecks.length;i++){reject(p=>p.meaningBoundaryChecks[i].stemRevision='stale');for(const [field,v]of Object.entries(meaningBoundaryChecks[i]))if(typeof v==='boolean')reject(p=>p.meaningBoundaryChecks[i][field]=!v);}
for(let i=0;i<2;i++){reject(p=>p.preservedKevTeachingHolds[i].contentQualification='resolved');reject(p=>p.preservedKevTeachingHolds[i].priorDispositionRevision='stale');reject(p=>p.preservedKevTeachingHolds[i].currentDeadlineOrDirectiveRequirementsResolved=true);}
reject(p=>p.privateBoundary.p003PayloadReviewed=true);reject(p=>p.privateBoundary.p003TrustedRevisionId='local-substitute');reject(p=>p.privateBoundary.p003Revision='local-substitute');
reject(p=>p.questionExclusions[0].newQuestionCredit=1);reject(p=>p.questionReassessments[0].newQuestionCredit=1);reject(p=>p.questionReassessments[0].familyLabelProposal='invented');reject(p=>p.questionReassessments[0].priorTaxonomyBlocker='resolved');reject(p=>p.questionReassessments[0].contentQualification='');
completedNegativeChecks=negativeMutationChecks;
const exported={...packet,negativeMutationChecks};validate(exported);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const report=[
 '# Phase 2B-5 — final local MCQs and m177 complete feedback',
 '**NOT READY.** Review date: **11 October 2026**. Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. Finite local/default-off/unwired/learner-invisible review; only the draft packet, this report and focused audit are added. Pending dispositions document qualified judgments without changing learner content.',
 '## Authority, sources and finite selection',
 'The approved master plan and Phase 1 audit were read in full earlier in this continuing session. Product decisions follow the master plan; historical implementation facts follow the audit. Current sources were rechecked and no unresolved authority conflict affects this local slice. Standing content/family delegation permits draft judgments, not canonical scope/roles/skills, calibrated difficulty, teaching links, weights, publication or activation.',
 'Requested order:**'+ids.join(', ')+'**. Scores:**25,35,35,35,35,55,10**. Structural rank:**'+rankedIds.join(', ')+'**. Each effective stem, every choice, key, main explanation and all three wrong corrections is compared with local/published/trusted and authored/imported/preeditorial/captured layers. Priorities and source difficulty labels do not establish correctness or calibration.',
 '**Six new question judgments+seven new complete-feedback judgments=13 new pending catalogue dispositions.** m177 already has a matching question judgment in objective34-semantic-proposals; preserve its exact **differential-backup-restore-set-identification** family, identification judgment, unresolved mastery identity, taxonomy blocker and source revisions with zero new question/family credit. Its full feedback is newly reviewed. All seven sources are sufficient for qualified review; no source-insufficient deferral or private substitute. All new precise scope/role/skill/primary/trusted proposals remain null, secondary/link arrays empty, weights/novelty zero and human/publication/teaching/evidence/activation flags false.',
 '## Exact reconciliation and coverage',
 'All **67 prior substantive packets** are reconciled before credit, including **42 older distinct question judgments (30 MCQs+12 local PBQs)**. **22 duplicate references** and **seven support/link-only references** add no coverage. Five historical pilot-feedback links remain preserved with zero extra credit. The frozen ledger, prior packets and active package are unchanged. Twelve older question-only judgments still lack full feedback after adding m177\'s bundle; all twelve are local PBQs.',
 '| Local bank coverage | Prior | New | Combined | Remaining |\n| --- | ---: | ---: | ---: | ---: |\n| Question judgments | 417 | 6 | 423/483 | 60 |\n| Complete feedback | 404 | 7 | 411/483 | 72 |\n| Question/full-feedback pairs | 404 | 7 | 411/483 | 72 |',
 '**All 395 local MCQs now have pending question and complete-feedback judgments.** Across formats, question coverage is395 MCQs+28/88 local PBQs; pairs are395 MCQs+16/88 local PBQs. The remaining60 questions and72 full-feedback gaps are local PBQs. The483 denominator excludes two private alternatives,nine starter assessments and two guest demos. This is catalogue review coverage, not human approval, production readiness, calibration or mastery evidence.',
 '| Affected objective | Broad records | Prior pending | New question | New feedback | Combined pending | Remaining |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: |\n'+objectiveCodes.map(code=>{const d=objectiveCoverage[code].denominator;return'| '+code+' | '+d.broadCandidates+' | '+d.allPacketPriorDispositions+' | '+d.newQuestionDispositions+' | '+d.newFeedbackDispositions+' | '+d.combinedAgentDispositions+' | '+d.remaining+' |';}).join('\n'),
 'All four affected objective catalogues are local, with zero private records. Every census row, residual ID and revision is bound. There are312 summed objective memberships but278 distinct catalogue records;30 records occur in multiple affected objectives. All13 new dispositions belong to one affected objective each, so global credit is counted once. Objective5.6\'s26/26 pending records include earlier overlapping teaching/glossary judgments; complete catalogue coverage does not approve whole5.6 scope or establish successful awareness training.',
 'Exact prior and remaining kinds:\n\n'+objectiveCodes.map(code=>'**'+code+'** prior:'+JSON.stringify(objectiveCoverage[code].denominator.priorByKind)+'; remaining:'+JSON.stringify(objectiveCoverage[code].denominator.remainingByKind)+'.').join('\n\n'),
 'Objective3.4\'s residual feedback is for local **p026 and p211**; their older question judgments do not supply complete-feedback review. All remaining objective4.7,4.2 and3.4 decks/cards/glossary/teaching units retain their source-bound residual census. Objective4.4 remains32/120,88 local remaining;4.9 remains14/96,82 remaining (80 local+two private);5.3 remains35/98,63 remaining;5.5 remains17/41,24 remaining;5.1 remains48/103,55 remaining;5.2 remains63/141,78 remaining (76 local+two private);5.4 remains39/115,76 remaining;4.5 remains63/169,106 remaining;4.6 remains89/151,62 remaining.',
 '## Seven qualified judgments and all corrections',
 reviews.map(r=>'**'+r.id+'.** '+r.meaning+'\n\n'+r.hold+'\n\nMain teaching judgment:'+r.main+'\n\nWrong-choice contrasts in current wrong-choice order:\n\n'+r.contrasts.map((t,k)=>(k+1)+'. '+t).join('\n')).join('\n\n'),
 '## Source precedence and delivery',
 '**Zero actual selected snapshot replays.** All seven authored/imported records exist and equal their preeditorial layer; selected captures/snapshots are absent. This is not a current private database read. **One import:m631,QB1 question31.** Its generic corrections become specific technique contrasts; removing the overlapping purge-category alternative does not resolve exact canonical sanitisation scope.',
 '**Five stems change:**m185,m194,m288,m502,m631. **Six option sets change:**m183,m185,m194,m288,m502,m631. All seven key positions remain unchanged and all seven main explanations change. **21 wrong corrections checked:all changed/new,zero unchanged.** m183,m185,m194,m288,m177 have no authored wrongFeedback, so15 corrections are new;m502/m631 replace their six authored corrections. Every current correction binds its actual choice/correction hashes, teaching rationale and zero secondary evidence/weight.',
 '| Question | Authored/preeditorial domain/difficulty | Effective domain/difficulty |\n| --- | --- | --- |\n'+candidates.map(row=>{const s=c.questions.get(row.recordId);return'| '+row.questionId+' | '+s.authored.ch+'/'+s.authored.difficulty+' | '+s.q.ch+'/'+s.q.difficulty+' |';}).join('\n'),
 'Observed domain changes:m2882→5,m1774→3. Difficulty changes:m183 hard→easy,m288 hard→medium,m631 medium→easy,m177 medium→easy. m185 now asks paired representation/exchange roles;m288 replaces unsupported attack-method attribution with independent verification;m502 removes causal wording and quarterly examples;m631 narrows to suitable supported media. All source labels and whole-objective tags remain observations, not calibrated or canonical approval.',
 '**Seven deterministic shuffles** execute the actual option-shuffle/wrong-feedback functions and preserve the key and all21 correction associations. Seven source-bound meaning probes bind stems/choice sets and reject autonomous-response guarantees, two independent protocol skills, causal/risk proof from clicks, payment approval from mail authentication, guaranteed sanitation from unusable media, verification/validation conflation and successful clean/RTO/RPO restoration from backup labels. Existing practice/launch bindings match. No numerical campaign effect, restore duration or recovery-age result is invented.',
 'Feedback remains conditional on selection,submission,entitlement and the selected wrong option. No SOAR playbook, threat feed, phishing campaign, payment/callback, media erasure, backup restore, learner behaviour or production action is executed.',
 '## Family comparisons and exact inherited authority',
 comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
 'm185 conservatively reuses **STIX_TAXII_representation_exchange_pair** with earlier version/trust/compatibility qualifications. m177 retains its exact earlier backup family and unresolved mastery identity. m194/m502 have related purpose/measurement reasoning without causal or independence approval. All new provisional labels receive zero novelty/mastery credit; multiple tools, paired roles or program outcomes supply no additional scored components.',
 '**m631 scope hold remains unresolved:**the current asset-management4.2 tag supplies context, not a precise sanitisation mastery identity or complete decommissioning/retention/disposal skill. Existing teaching qualifies verification but omits the distinct validation/acceptance boundary; this draft review does not fix that learner text or approve a new taxonomy node. A drive becoming unusable is not proof its data was sanitised.',
 'Exact owner content/family decisions, three draft-comparison hashes and five recovery pilot-role proposals remain preserved. All 15 approved draft revisions and 14 editorial families remain separate from immutable draft flags. mtd.01 stays in m196\'s family with zero novelty;rpo.03\'s accepted clean-point distinction retains no psychometric independence,learner transfer or clean-source guarantee. MTTR and coarse p048/p211 support-only limits remain. All twelve4.4/4.9 feedback holds, all earlier assurance/governance/risk/identity/forensics and other semantic limits, and earliest m305/m046/m432 holds remain exact. KEV/BOD current-policy/deadline qualifications are copied without resolution or re-certification.',
 '## Primary-source support and inference limits',
 '[NIST SP 800-61r3](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r3.pdf) treats tools,analysis,response and authority as contextual parts of incident handling. Our inference limits SOAR naming to response coordination, not successful or unconditionally autonomous execution. [OASIS STIX 2.1](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html) and [TAXII 2.1](https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html) distinguish information representation from exchange; TAXII\'s additional content types are not prohibited. These sources illustrate the roles but do not insert an unstated version or prove integration, trust or compatibility.',
 '[NIST Phish Scale guide](https://www.nist.gov/publications/nist-phish-scale-user-guide) and [NIST explanation of click-rate context](https://www.nist.gov/news-events/news/2020/09/phish-scale-nist-developed-method-helps-it-staff-see-why-users-click) describe message difficulty/recipient context and why clicks alone can mislead. Our inference withholds causal training success, universal teachable-moment superiority and whole security-behaviour competence. No campaign data or learner-transfer study is inspected. [FBI BEC guidance](https://www.fbi.gov/how-we-can-help-you/common-frauds-and-scams/business-email-compromise?source=govdelivery) supports independently established contact and payment verification. It does not determine this message\'s attack method or actual authority.',
 '[NIST SP 800-88r2](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-88r2.pdf),September 2025,section3.1.2 describes media/coercivity limits and potential drive damage without successful sanitisation;sections4.5.1–4.5.2 distinguish verification from validation/acceptance. Our inference keeps narrow technique recognition separate from suitability and completed outcomes. No degausser, media, key material or certificate is inspected. [Microsoft differential-backup documentation](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/differential-backups-sql-server?view=sql-server-ver17) illustrates matching base/latest-differential dependencies in SQL Server; the question does not identify that product,so implementation-specific prerequisites are not universalised. No restore, clean-point or timing is validated.',
 '## Release boundary and validation',
 'Private p003 question/feedback remain **sha256:f2eb1e715fa9fcda87ada668d7d17dfdf6b44840328d5ffeb460e3a342e502f2**,metadata-only/unavailable/unreviewed,null trusted identity. p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**,unavailable/unreviewed. Local fallbacks add no private coverage. No private fetch/compilation/export;exports contain no stems,choices,keys,option-indexed grading fields or learner records.',
 'Active package unchanged:**1878 records/435 identities/2954 review decisions/489 unresolved mappings/seven existing primary proposals**,SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All 25 protected hashes remain exact. Full MCQ pending-review coverage does not remove72 PBQ-feedback gaps,private semantics,36 unsupported local PBQ grammars,canonical taxonomy/calibration/teaching gates or unresolved holds.',
 '**NOT READY.** Local/default-off/unwired/learner-invisible. No runtime,active-package,canonical metadata,role/scope/skill/difficulty,teaching/weight,evidence,shadow/live write,migration,publication,cohort,deployment,activation or Phase 3 change.',
 'Run node '+scriptPath+' and npm run audit:content-mapping. Focused audit reconciles67 prior packets,bounds six new questions/one reused parent/seven complete bundles,21 corrections,zero selected snapshots,seven shuffles/seven meaning probes,and four separate objective censuses/residuals. **'+negativeMutationChecks+' rejected mutations** cover stale/incorrect source and choice bindings,hold erasure,duplicate or invented credit,family/taxonomy replacement,scope/role/weight approval,private substitution and activation.',
 'All 29 mapping tests,deterministic package reproduction,25 protected checks and git diff --check are required before the exact three-file **[skip deploy]** commit/push. Verify the configured deployment skip marker and exact HEAD=origin/main=remote plus artifact hashes. Push proves no live deployment;unrelated dirty/generated files remain unstaged.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_FINAL_LOCAL_MCQS_NOT_READY',candidateIds:ids,newQuestionDispositions:6,newFeedbackDispositions:7,reusedQuestions:1,bankProgress,objectiveProgress:Object.fromEntries(Object.entries(objectiveCoverage).map(([code,v])=>[code,v.denominator])),snapshotReplays:0,wrongCorrections:21,changedWrongCorrections:21,unchangedWrongCorrections:0,shuffleProbes:7,meaningProbes:7,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
