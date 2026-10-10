import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-objective53-55-assurance.mjs',packetPath='docs/drafts/phase-2b5-objective53-55-assurance-proposals.json',reportPath='docs/phase-2b5-objective53-55-assurance-review.md';
const basePath='docs/drafts/phase-2b5-objective51-mcqs-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'64b9384c639e53afae524979f7d3ee50cc38dfdcd1f364b53321f56e18f7dcec');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective45-mcqs-proposals.json','docs/drafts/phase-2b5-objective54-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-risk-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-pilot-feedback-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);assert.equal(c.ledger.rows.filter(r=>legacyPrevious.has(r.recordId)).length,353);
const ids=["m080", "m091", "m100", "m190", "m645", "m093", "m181", "m195", "m340", "m607", "m643", "m657"];
const candidates=ids.map(id=>c.ledger.rows.find(r=>r.recordId==='mcq:'+id));
assert.equal(new Set(ids).size,12);assert(candidates.every(r=>r&&r.kind==='mcq'&&r.objectiveCodesObserved.some(code=>['5.3','5.5'].includes(code))));
// The supplied order is a set order, not a structural-priority ranking.
assert.deepEqual(candidates.map(r=>r.priorityScore),[10,10,20,35,30,10,35,20,25,55,55,55]);
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
assert.equal(inventory.length,65);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);
const excluded=candidates.filter(r=>c.previous.has(r.recordId)),selected=candidates.filter(r=>!c.previous.has(r.recordId));
assert.deepEqual(excluded.map(r=>r.questionId),['m091','m645']);assert.equal(selected.length,10);assert(candidates.every(r=>!c.previous.has('explanation:'+r.recordId)));
const exclusions=excluded.map(r=>{const p=c.previous.get(r.recordId);return{recordId:r.recordId,sourceRevision:r.revisions.localEffective,publishedRecordSignature:r.revisions.publishedCatalogue,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),priorFamilyLabel:p.row.familyLabelProposal,reason:'current_matching_prior_substantive_question_judgment_reused_feedback_still_unreviewed',newQuestionCredit:0,newFamilyCredit:0};});
const priorInventory=base.allPacketReconciliation.inventory;
assert.deepEqual(inventory.filter(r=>r.path!==basePath),priorInventory);
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorBank.length,395);assert.equal(priorFeedback.length,380);
const broad53=c.pkg.records.filter(r=>r.objectiveCodes.includes('5.3')),broad55=c.pkg.records.filter(r=>r.objectiveCodes.includes('5.5'));
assert.equal(c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('5.3')).length,5);assert.equal(c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('5.5')).length,7);
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
    "id": "m080",
    "meaning": "Identify investigation of vendor policies and assurance evidence as due diligence before an agreement.",
    "hold": "HOLD a rigid due-diligence-before versus due-care-after boundary. Investigation and reasonable protective action can continue throughout a relationship. Report or certificate names alone do not establish security: actual scope, date, report type, exceptions, relevant customer responsibilities and remediation matter. No SOC 2 report or test result is supplied or inspected; no type or operating period is inferred. The question names an investigation, not vendor acceptance, risk transfer, completed monitoring or an approved supplier.",
    "main": "Due diligence checks what is known about the supplier and its risks. Reviewing evidence helps a decision and should inform continuing oversight; possession of reports is not a security guarantee.",
    "contrasts": [
      "Acceptance means choosing to retain a known risk; the described review gathers information before that decision.",
      "Due care means taking reasonable protective action. The specific investigation in the stem is due diligence; these responsibilities do not occupy exclusive pre-contract and post-contract periods.",
      "Transfer allocates specified consequences, often by contract or insurance. Reading evidence assesses risk and does not itself move liability."
    ],
    "family": "supplier-evidence-due-diligence-identification"
  },
  {
    "id": "m091",
    "meaning": "Identify the SLA function from measurable service commitments and agreed remedies; reuse the exact matching prior question judgment.",
    "hold": "HOLD the name SLA as achieved performance, a recovery guarantee or unlimited compensation. Measurement windows, exclusions, response versus resolution and remedies require actual terms. Response time is not MTTR and an uptime target is not a per-outage RTO. The unchanged NDA correction is too categorical outside this naming example. MOU, MSA and NDA documents can contain or incorporate service commitments; document titles alone do not establish binding force or mutually exclusive legal functions. No numerical availability calculation is supplied.",
    "main": "An SLA states measurable service targets and what the parties agreed should happen if they are missed. Recognising that function does not show the targets were achieved.",
    "contrasts": [
      "The supplied emphasis is measurable service performance rather than shared intentions. A document called an MOU may still contain binding or incorporated terms.",
      "Confidentiality is the NDA function used in this contrast. The retained statement does not rule out a combined agreement also containing service commitments.",
      "An MSA supplies broader relationship terms and may incorporate an SLA; recognising the particular service-level function does not require separate documents."
    ],
    "family": "sla-service-commitment-identification"
  },
  {
    "id": "m100",
    "meaning": "Identify a right-to-audit clause as permission for agreed examination of supplier controls and evidence.",
    "hold": "HOLD audit rights as unrestricted access, an audit actually performed or verified compliance. Scope, notice, confidentiality, other tenants and applicable law constrain access. Without this clause, independent reports or legal rights may still provide assurance; reliance only on self-reporting is not universal. All three wrong corrections are unchanged and remain qualified: compensation and liability terms require the real contract, while force majeure applicability is contextual and can affect continuity/security operations. No actual enforceability, payout, liability cap or automatic excuse is determined.",
    "main": "A right-to-audit clause lets the parties agree how evidence may be examined. Permission to inspect is separate from an inspection, its findings and follow-up.",
    "contrasts": [
      "Indemnification concerns specified compensation obligations, rather than the audit-access function. Combined clauses and actual enforceability require the real contract.",
      "A limitation clause concerns defined liability limits, rather than access to verify controls. It does not prove a particular cap or immunity.",
      "Force majeure concerns contract treatment of specified disruptive circumstances. The retained natural-disaster description is not a universal exemption or proof that such events are unrelated to security and continuity."
    ],
    "family": "contractual-audit-access-function-identification"
  },
  {
    "id": "m190",
    "meaning": "Recognise that outsourcing payroll processing does not automatically remove the organisation's applicable regulatory duties.",
    "hold": "HOLD every vendor breach as automatically causing controller fines, payroll PII as sufficient to establish GDPR applicability, or an internal owner title as a legal controller role. The fine is a supplied scenario premise, not a legal conclusion or calculated sanction. Applicable jurisdiction, actual processing functions, duties and conduct determine responsibilities; processors may have their own duties. Contractual allocation or compensation does not simply cancel obligations owed to a regulator. Earlier controller/processor and risk-transfer holds remain exact.",
    "main": "Hiring a processor does not automatically erase the duties of the organisation controlling the processing. Both parties can have responsibilities under the applicable law; the scenario does not determine a real case.",
    "contrasts": [
      "A contract cannot simply cancel the parties' obligations under applicable law. Allocation of costs or remedies is a separate contractual issue.",
      "A processor may have its own obligations; that does not automatically absolve a controller of its distinct duties.",
      "Legal duties and conduct matter, rather than only the network where a breach occurred. The supplied fine does not establish automatic liability for every breach."
    ],
    "family": "outsourced-processing-accountability-retention"
  },
  {
    "id": "m645",
    "meaning": "Identify SLA from availability metrics and remedies; preserve the existing m091 family and matching prior judgment.",
    "hold": "HOLD a service agreement as achieved availability, an outage recovery clock or independently assessed recovery design. Response and repair clocks differ; credits and penalties follow actual contract terms and applicable law. MOU, NDA and SOW documents can include or incorporate other functions. Imported wording is not family novelty. Preserve the earlier exact platform/capacity comparison and zero additional question/family credit.",
    "main": "Measurable ongoing service commitments identify the SLA function. The stated financial penalties and the explanation's service-credit example are possible agreed remedies, not proof of a particular enforceable payout.",
    "contrasts": [
      "Shared understanding is the MOU contrast; measurable service commitments identify the supplied SLA function, even in a combined document.",
      "Confidentiality is the NDA contrast. A combined agreement may include uptime terms, so the name does not exclude all other clauses.",
      "A SOW describes work and deliverables and may incorporate an SLA. The supplied emphasis is ongoing service performance."
    ],
    "family": "sla-service-commitment-identification"
  },
  {
    "id": "m093",
    "meaning": "Recognise evidence review against requirements as the supplied security-audit activity.",
    "hold": "HOLD the stem's explicit phrase security audit as independent evidence of discrimination: the question strongly cues its own answer. Absence of exploitation does not alone define an audit, and audits can include testing or use authorised technical evidence. Logs, account lists and rules without criteria, sampling and context do not establish operating effectiveness, compliance or auditor independence. Threat intelligence can use internal evidence; scanning is not exclusively automated. Observed domain 1 to 5 does not approve whole-objective scope.",
    "main": "An audit compares relevant evidence with defined requirements. Naming that activity does not perform control testing or demonstrate compliance; penetration-test findings can be audit inputs within an authorised scope.",
    "contrasts": [
      "A vulnerability scan looks for technical weaknesses; scanning can contribute audit evidence, but the supplied emphasis is requirement-based review.",
      "An authorised penetration test attempts to demonstrate exploitable weaknesses and impact. This review is not such a demonstration; an audit can nevertheless include technical testing.",
      "Threat intelligence investigates threats and adversaries using internal or external evidence. Such evidence may inform an audit, without making these functions identical."
    ],
    "family": "requirement-based-security-audit-identification"
  },
  {
    "id": "m181",
    "meaning": "Identify unknown-environment testing from the stated absence of prior internal architecture knowledge.",
    "hold": "HOLD being hired as authorisation for every target or action. Written authority, scope and rules of engagement are separate and unverified. Unknown knowledge does not necessarily mean an external starting position, no information can ever be learned, or unrestricted public-data collection. Replacing the old box terms and red-team distractor supplies no new skill. The source's domain 4 to 5 change and whole 5.5 placement remain observations, not approved operational scope. Compare m340 on the same knowledge-model family.",
    "main": "Unknown-environment describes what internal information the tester receives initially. It says nothing by itself about test location, permitted actions or permission to attack.",
    "contrasts": [
      "Known-environment testing supplies substantial internal information, contrary to this stated lack of prior architecture knowledge.",
      "Partially known testing supplies some internal knowledge or access; the question specifically supplies no prior internal architecture knowledge.",
      "Configuration review is an activity that compares settings with requirements, rather than a description of the tester's initial knowledge."
    ],
    "family": "tester-prior-knowledge-model-identification"
  },
  {
    "id": "m195",
    "meaning": "Recognise certification issued following the expressly supplied successful certification decision for a defined ISO/IEC 27001 ISMS scope.",
    "hold": "HOLD ordinary external auditing as automatically producing certification, an accredited-body label as an independently verified certificate, or certification as proof of zero vulnerabilities or all organisational compliance. The successful decision is a scenario premise; real certificate validity, scope, body competence and relevant findings are unverified. Accreditation is supplied here, not claimed compulsory for all certification. ISO develops standards and does not issue the certificate. The SOC 2 Type II alternative is not an inspected report. CSF is not an ISO certification or a universally prescribed maturity score.",
    "main": "The explicit successful certification decision supports the stated certificate result within the defined ISMS scope. A certificate is assurance about specified requirements, not a guarantee that every system is secure.",
    "contrasts": [
      "A penetration-test report records findings from authorised testing; it is not the certificate issued for the supplied ISMS decision.",
      "SOC 2 is a separate service-control assurance report. The stem does not supply a SOC engagement or actual Type II evidence.",
      "CSF is a risk-management framework, not the issuer of this ISO/IEC certificate. A framework profile or assessment is not interchangeable with certification."
    ],
    "family": "defined-ISMS-certification-result-identification"
  },
  {
    "id": "m340",
    "meaning": "Identify known-environment testing from supplied source code, architecture and extensive access.",
    "hold": "HOLD extensive access as authorisation for all actions, current or complete documentation, guaranteed testing efficiency or thoroughness. The scope and rules of engagement still need definition; supplied knowledge does not determine the starting position. External-position tests can have varying knowledge levels. The old efficiency/no-reconnaissance claim is removed; no observed time saving or attack result replaces it. Domain 4 to 5 remains observed metadata and the family is shared conservatively with m181.",
    "main": "Known-environment describes substantial prior internal information. It does not mean unlimited permission or specify whether testing starts inside or outside the network.",
    "contrasts": [
      "Unknown-environment testing gives little prior internal information, unlike the source and documentation supplied here.",
      "Partially known testing supplies less knowledge than this extensive information premise; no universal quantitative threshold is inferred.",
      "External position concerns where testing starts. It can coexist with known, partially known or unknown prior information."
    ],
    "family": "tester-prior-knowledge-model-identification"
  },
  {
    "id": "m607",
    "meaning": "Identify passive reconnaissance from existing third-party archives without querying the target infrastructure.",
    "hold": "HOLD public availability as legal permission, current accurate information or a universal passive-interaction guarantee. Live DNS/resolver activity can indirectly contact a target; the effective stem explicitly supplies archived third-party records and no target queries, rather than a network trace proving that boundary. No query, scan or exploitation is performed here. Passive terminology in other assessment contexts does not remove this scenario's interaction limit. Domain 2 to 5 and whole 5.5 scope remain observed, not a forced canonical remap.",
    "main": "Reading already existing third-party records fits the supplied passive boundary. Contact with a service and contact with the target must be distinguished; public information alone does not determine authorisation or accuracy.",
    "contrasts": [
      "Active scanning sends probes to target services; the stem explicitly supplies no target interaction.",
      "Reading existing records does not demonstrate an attempt to exploit a target.",
      "Fuzzing supplies varied program inputs. No such input testing is described by this archived-record review."
    ],
    "family": "third-party-archived-record-passive-reconnaissance"
  },
  {
    "id": "m643",
    "meaning": "Identify internal security-audit work from comparing deployed access controls with policies and applicable requirements.",
    "hold": "HOLD an internal assurance-team title as independent or objective audit work. Reporting arrangements, mandate, self-review safeguards, criteria, samples, reliable evidence, actual operation, exceptions and follow-up require inspection. The activity does not ensure compliance or create a certificate. Tabletop discussion and hunting findings can contribute assurance evidence; the current contrasts identify primary functions rather than mutually exclusive processes. Removing the overlapping change-management-audit alternative narrows the introductory question, not operational competence. Same conservative requirement-based audit family as m093.",
    "main": "An internal audit compares evidence with requirements to identify gaps. The scenario identifies a review purpose without proving independent oversight, control effectiveness or conformity.",
    "contrasts": [
      "Risk appetite defines willingness to take risk, rather than the particular conformity review supplied here. Appetite can inform requirements without being the audit.",
      "A tabletop principally rehearses responses through discussion. It can generate useful observations; it is not by itself the supplied evidence-based examination of deployed controls.",
      "Threat hunting searches for adversary activity. Its findings can be audit inputs, but its primary purpose differs from this requirement-based comparison."
    ],
    "family": "requirement-based-security-audit-identification"
  },
  {
    "id": "m657",
    "meaning": "Identify passive reconnaissance from historical third-party DNS data and archived documents without contacting targets.",
    "hold": "HOLD a second imported source or phrasing change as independent family novelty. Like m607, this is one archived-record interaction distinction, separate from the tester-knowledge axis of m181/m340. Public information does not establish lawful access, accuracy or absence of indirect live target queries; no network trace or tool action is observed. The imported PAGE 21 artifact disappears from main and all generic wrong corrections, but cleanup creates no learner competence. Domain 2 to 5 and whole-objective placement remain held observations.",
    "main": "Existing third-party archives meet the stated passive interaction boundary. Recognising the boundary does not validate those records or authorise further collection or attacks.",
    "contrasts": [
      "Active scanning probes the target, contrary to the explicit no-contact premise; public visibility would not itself make a probe passive.",
      "Fuzzing varies program inputs; reading archived records does not demonstrate that testing.",
      "No exploitation attempt is supplied. A later use of the information would need its own scope and authorisation."
    ],
    "family": "third-party-archived-record-passive-reconnaissance"
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
assert.equal(sourceChecks.filter(r=>r.snapshotReplayChecked).length,0);assert.equal(sourceChecks.filter(r=>r.stemChangedFromPreeditorial).length,7);assert.equal(sourceChecks.filter(r=>r.optionsChangedFromPreeditorial).length,6);assert.deepEqual(candidates.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m645','m607','m643','m657']);assert.equal(sourceChecks.filter(r=>r.authoredMissingWrongCorrections).length,4);
assert.equal(sourceChecks.filter(r=>r.wrongCorrectionsChanged).length,11);assert.equal(sourceChecks.reduce((n,r)=>n+r.changedWrongCorrectionCount,0),32);assert.equal(sourceChecks.reduce((n,r)=>n+r.unchangedWrongCorrectionCount,0),4);
const meaningBoundaryChecks=[];
function boundary(id,pattern,limits){const s=c.questions.get('mcq:'+id);assert(pattern.test(s.q.q));meaningBoundaryChecks.push({recordId:s.row.recordId,stemRevision:sig(s.q.q),...limits});}
boundary('m080',/Before signing/, {rigidDueDiligenceDueCareTimeBoundaryApproved:false,reportNameProvesSecurity:false});
boundary('m091',/minimum performance standards/, {achievedServicePerformanceEstablished:false,responseTimeEqualsMTTR:false,perOutageRecoveryGuaranteeApproved:false});
boundary('m100',/verify compliance/, {unrestrictedAccessApproved:false,actualAuditPerformed:false,clauseEstablishesCompliance:false});
boundary('m190',/regulatory fines/, {fineIsSuppliedScenarioPremise:true,everyVendorBreachAutomaticallyFinesController:false,applicableJurisdictionOrLegalRolesDetermined:false});
boundary('m195',/successful certification decision/, {explicitSuccessfulDecisionPremise:true,certificateActuallyVerified:false,zeroVulnerabilityGuaranteeApproved:false});
for(const id of ['m181','m340'])boundary(id,/penetration tester/i,{knowledgeDefinesStartingPosition:false,permissionForAllTargetsAndActionsEstablished:false});
boundary('m643',/internal assurance team/i,{teamTitleEstablishesIndependence:false,controlEffectivenessEstablished:false});
for(const id of ['m607','m657'])boundary(id,/third-party/,{archivedThirdPartyNoTargetContactIsSuppliedPremise:true,networkInteractionObserved:false,publicDataProvesAuthorisation:false});
const questionReassessments=excluded.map(row=>{const prior=c.previous.get(row.recordId),r=reviews[ids.indexOf(row.questionId)];assert.equal(prior.row.familyLabelProposal,r.family);assert.equal(prior.row.primaryConceptProposal,null);assert.equal(prior.row.masteryWeight,0);assert.equal(prior.row.humanApproved,false);return{...exclusions.find(x=>x.recordId===row.recordId),assessedUnderstanding:r.meaning,contentQualification:r.hold,familyLabelProposal:prior.row.familyLabelProposal,priorDispositionPreserved:true,priorPilotDisposition:prior.row.disposition,objectiveScopeProposal:null,skillRoleProposal:null,primaryConceptProposal:null,trustedRevisionId:null,secondaryConceptProposals:[],masteryWeight:0,humanApproved:false,published:false,independentEvidence:false};});
const questionProposals=selected.map(row=>{
 const i=ids.indexOf(row.questionId),r=reviews[i],check=sourceChecks[i];
 return{recordId:row.recordId,questionId:r.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourceInspectionRevision:sig(check),assessedUnderstanding:r.meaning,contentQualification:r.hold,objectiveScopeProposal:null,skillRoleProposal:null,numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:r.family,familyStatus:'provisional_comparison_no_independence_approval',difficultyObserved:check.difficultyObserved,difficultyDisposition:'source_label_uncalibrated'};
});
const explanationProposals=candidates.map((row,i)=>{
 const s=c.questions.get(row.recordId),q=s.q,r=reviews[i],indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct),prior=c.previous.get(row.recordId);
 assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
 return{recordId:'explanation:'+row.recordId,kind:'explanation_bundle',parentId:row.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:row.revisions.localEffective,parentPublishedRevision:row.revisions.publishedCatalogue,parentDispositionStatus:prior?'existing_matching_question_judgment_reused':'new_question_judgment_in_this_packet',reusedParentDispositionRevision:prior?sig(prior.row):null,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:r.main,contentQualification:r.hold,objectiveScopeProposal:null,withheldPreciseContrast:r.family+'_limits',roleProposal:null,deliveryUnderstanding:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:r.contrasts[k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId));assert.equal(selectedIds.size,22);
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
function coverage(broad,expectedPrior,expectedNewQuestions,expectedNewFeedback,expectedRemaining){
 const prior=broad.filter(r=>c.previous.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id)),newQuestions=questionProposals.filter(p=>broad.some(r=>r.id===p.recordId)),newFeedback=explanationProposals.filter(p=>broad.some(r=>r.id===p.recordId));
 assert.equal(prior.length,expectedPrior);assert.equal(newQuestions.length,expectedNewQuestions);assert.equal(newFeedback.length,expectedNewFeedback);assert.equal(remaining.length,expectedRemaining);assert(broad.every(r=>!r.id.startsWith('private:')));assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);
 return{denominator:{broadCandidates:broad.length,localCandidates:broad.length,privateMetadataOnlyCandidates:0,allPacketPriorDispositions:prior.length,priorByKind:counts(prior),newQuestionDispositions:newQuestions.length,newFeedbackDispositions:newFeedback.length,newAgentDispositions:newQuestions.length+newFeedback.length,combinedAgentDispositions:prior.length+newQuestions.length+newFeedback.length,remaining:remaining.length,remainingLocal:remaining.length,remainingPrivateMetadataOnly:0,remainingByKind:counts(remaining)},census:broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'})),remainingRecordIds:remaining.map(r=>r.id)};
}
assert.equal(broad53.length,98);assert.equal(broad55.length,41);
const coverage53=coverage(broad53,27,3,5,63),coverage55=coverage(broad55,3,7,7,24);
assert.deepEqual(coverage53.denominator.priorByKind,{glossary_definition:15,keyword_guide:1,lesson:1,lesson_check:4,lesson_section:3,lesson_traps:1,mcq:2});assert.deepEqual(coverage55.denominator.priorByKind,{glossary_definition:3});
assert.deepEqual(coverage53.denominator.remainingByKind,{deck_container:3,flashcard:48,glossary_definition:12});assert.deepEqual(coverage55.denominator.remainingByKind,{deck_container:1,explanation_bundle:1,flashcard:3,glossary_definition:6,keyword_guide:1,lesson:1,lesson_check:4,lesson_section:5,lesson_traps:1,pbq:1});
assert(coverage55.remainingRecordIds.includes('pbq:p038')&&coverage55.remainingRecordIds.includes('explanation:pbq:p038'));
const sharedObjectiveRecordIds=broad53.filter(r=>broad55.some(x=>x.id===r.id)).map(r=>r.id);assert.deepEqual(sharedObjectiveRecordIds,['glossary:ale','glossary:aro','glossary:nist','glossary:rpo','glossary:rto','glossary:sle','glossary:soc']);assert(sharedObjectiveRecordIds.every(id=>!selectedIds.has(id)));
const bankRows=c.ledger.rows,combinedQuestions=new Set([...priorBank.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=bankRows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
assert.equal(combinedQuestions.size,405);assert.equal(combinedFeedback.size,392);assert.equal(paired.length,392);assert.equal(paired.filter(r=>r.kind==='mcq').length,376);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,olderQuestionOnlyDispositions:olderQuestions.length,allPacketPriorQuestions:priorBank.length,newQuestions:questionProposals.length,allPacketCombinedQuestions:combinedQuestions.size,remainingQuestionDispositions:483-combinedQuestions.size,combinedMcqs:bankRows.filter(r=>r.kind==='mcq'&&combinedQuestions.has(r.recordId)).length,combinedLocalPbqs:bankRows.filter(r=>r.kind==='pbq'&&combinedQuestions.has(r.recordId)).length,newFeedbackBundles:12,priorFullFeedback:priorFeedback.length,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.combinedMcqs,377);assert.equal(bankProgress.combinedLocalPbqs,28);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,13);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective51HeldDispositions:base.explanationProposals.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal})),olderQuestionPacketBindings:olderQuestions.map(r=>({recordId:r.recordId,priorPacketPath:r.priorPacketPath,priorDispositionRevision:r.priorDispositionRevision,status:'existing_limits_preserved_no_full_feedback_or_approval_inherited'}))};
assert.equal(priorHolds.objective51HeldDispositions.length,10);
const comparisonSpecs=[
  {
    "ids": [
      "m091",
      "m645",
      "m032",
      "m635"
    ],
    "meaning": "Preserve the exact existing SLA family and older comparisons, without two new question credits. Naming availability commitments differs from recovery objectives or mechanisms; response time is not MTTR, and agreement text is not achieved service performance."
  },
  {
    "ids": [
      "m080",
      "m100",
      "m093",
      "m643",
      "m195"
    ],
    "meaning": "Diligence investigation, permission to audit, requirement-based examination and certification result are distinct introductory functions. Report or certificate possession neither performs an assessment nor proves all security. m093 and m643 conservatively share a requirement-based audit family without independence approval."
  },
  {
    "ids": [
      "m181",
      "m340",
      "m349"
    ],
    "meaning": "m181 and m340 share tester-prior-knowledge-model identification. Knowledge, starting position, authorisation and validation activity are different axes; no scope or successful attack is inferred from access or hiring."
  },
  {
    "ids": [
      "m607",
      "m657",
      "m181",
      "m340"
    ],
    "meaning": "The two archive-reading imports conservatively share one interaction-boundary family. Import source and wording supply no novelty. Passive versus active interaction is distinct from the initial tester-knowledge axis; public data is not universal authorisation."
  },
  {
    "ids": [
      "m190",
      "m085",
      "m640",
      "m031",
      "m604"
    ],
    "meaning": "Outsourcing accountability, legal processing roles, internal business-owner roles and risk transfer remain separate context-bound meanings. Contract cost allocation cannot simply waive regulatory duties; no jurisdiction, automatically imposed fine or new legal role is determined."
  },
  {
    "ids": [
      "m643",
      "m630",
      "m605"
    ],
    "meaning": "Audit review, tabletop rehearsal and appetite definition are primary functions that can exchange evidence. No label ensures independence, effectiveness, compliance or mutually exclusive activities."
  },
  {
    "ids": [
      "m195",
      "m191"
    ],
    "meaning": "The explicit successful ISMS certification decision differs from naming the CSF 2.0 functions. A profile or framework is not a certificate, and neither label proves universal conformity or security."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids.map(id=>'mcq:'+id),comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get('mcq:'+id),p=c.previous.get('mcq:'+id);return{recordId:s.row.recordId,sourceRevision:s.record.sourceSignature,localRevision:s.row.revisions.localEffective,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
const sourceBindings=[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective51-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective51-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)},...inventory.map(({path,sha256})=>({path,sha256})),pilotBoundary.ownerContentDecisionBinding,pilotBoundary.ownerFamilyDecisionBinding,{path:'docs/phase-2b5-objective52-pilot-mapping-review.md',sha256:hashFile('docs/phase-2b5-objective52-pilot-mapping-review.md')},...pilot.draftComparisons.map(({path,sha256})=>({path,sha256}))];
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'a2afa96f9eee5c5364ad89d4b2e8304e3927bf73',sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,legacyTrackedPriorQuestions:353},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences,status:'current_revision_bound_prior_judgments_reconciled_before_new_credit'},bankSignature:c.ledger.bankSignature,selectionPolicy:'Requested objectives5.3/5.5 assurance candidate set in supplied order; existing structural ranking recorded separately; all prior substantive packets reconciled before new question credit',structuralPriorityQuestionIds:rankedIds,candidateQuestionRecordIds:candidates.map(r=>r.recordId),selectedQuestionRecordIds:selected.map(r=>r.recordId),selectedFeedbackRecordIds:candidates.map(r=>'explanation:'+r.recordId),questionExclusions:exclusions,ambiguousPremiseOrContrastHolds:candidates.map(r=>r.recordId),ambiguityDisposition:'qualified_pending_owner_not_resolved_or_approved',sourceChecks,meaningBoundaryChecks,questionReassessments,pilotBoundary,preservedPilotFeedbackLinkReconciliation,questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorHolds,objective53Census:coverage53.census,objective55Census:coverage55.census,objective53Denominator:coverage53.denominator,objective55Denominator:coverage55.denominator,remainingObjective53RecordIds:coverage53.remainingRecordIds,remainingObjective55RecordIds:coverage55.remainingRecordIds,sharedObjectiveRecordIds,sharedRecordsCreateNoAdditionalGlobalCredit:true,bankProgress,unchangedObjective51Progress:base.objective51Denominator,unchangedObjective52Progress:base.unchangedObjective52Progress,unchangedObjective54Progress:base.unchangedObjective54Progress,unchangedObjective45Progress:base.unchangedObjective45Progress,unchangedObjective46Progress:base.unchangedObjective46Progress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},privateBoundary:{p017Revision:'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42',payloadReviewed:false,trustedRevisionId:null,localPilotFallbackDoesNotTransferToPrivate:true},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
function validate(value){
 assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);
 assert.equal(new Set(value.selectedQuestionRecordIds).size,10);assert.equal(value.questionProposals.length,10);assert.equal(value.explanationProposals.length,12);
 assert(value.questionProposals.every(r=>!c.previous.has(r.recordId)));assert(value.explanationProposals.every(r=>!legacyPrevious.has(r.recordId)));
 for(const r of value.questionProposals){const s=c.questions.get(r.recordId);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);}
 for(const r of value.explanationProposals){const s=c.questions.get(r.parentId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.record.localRevisionSignature);assert.equal(r.mainCorrectionRevision,sig(s.q.exp));assert.equal(r.wrongFeedbackRevision,sig(s.q.wrongFeedback));assert.equal(r.distractorCorrections.length,3);}
 // Every exported decision is checked against independently rebuilt current sources and fixed review judgments.
 const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);
}
let completedNegativeChecks;validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet);assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<10;i++){
 reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);reject(p=>p.questionProposals[i].trustedRevisionId='invented');reject(p=>p.questionProposals[i].sourceInspectionRevision='stale');reject(p=>p.questionProposals[i].contentQualification='');reject(p=>p.questionProposals[i].primaryConceptProposal='invented');reject(p=>p.questionProposals[i].humanApproved=true);reject(p=>p.questionProposals[i].newFamilyCredit=1);reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);reject(p=>p.questionProposals[i].familyLabelProposal='independent');reject(p=>p.questionProposals[i].objectiveScopeProposal={assessedCodes:['5.5'],status:'approved'});reject(p=>p.questionProposals[i].skillRoleProposal='invented');reject(p=>p.questionProposals[i].difficultyDisposition='calibrated');
}
for(let i=0;i<12;i++){
 reject(p=>p.sourceChecks[i].snapshotReplayChecked=true);reject(p=>p.sourceChecks[i].revisions.authored=null);reject(p=>p.sourceChecks[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);reject(p=>p.sourceChecks[i].optionShuffleProbe.feedbackRemapChecked=false);reject(p=>p.sourceChecks[i].sourcePriority=0);reject(p=>p.sourceChecks[i].changedWrongCorrectionCount=99);
 reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%12].sourceRevision);reject(p=>p.explanationProposals[i].parentLocalRevision='stale');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');reject(p=>p.explanationProposals[i].objectiveScopeProposal={assessedCodes:['5.5']});reject(p=>p.explanationProposals[i].mainCorrectionRevision='stale');reject(p=>p.explanationProposals[i].deliveryGate='all_before_submit');reject(p=>p.explanationProposals[i].approvedRemediation=true);reject(p=>p.explanationProposals[i].parentDispositionStatus='unreconciled');reject(p=>p.explanationProposals[i].reusedParentDispositionRevision='invented');
 for(let k=0;k<3;k++){reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].choiceRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].teachingRationale='');reject(p=>p.explanationProposals[i].distractorCorrections[k].assessedSecondary=true);}
}
for(let i=0;i<2;i++){reject(p=>p.questionExclusions[i].newQuestionCredit=1);reject(p=>p.questionReassessments[i].newQuestionCredit=1);reject(p=>p.questionReassessments[i].priorDispositionRevision='stale');reject(p=>p.questionReassessments[i].familyLabelProposal='new-independent-family');reject(p=>p.questionReassessments[i].contentQualification='');}
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);for(const path of holdPaths)reject(p=>{let r=p.priorHolds;for(const k of path.slice(0,-1))r=r[k];r[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{let old=p.priorHolds;for(let i=0;i<18;i++)old=old.inheritedHolds;old=old.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
for(let i=0;i<42;i++)reject(p=>p.allPacketReconciliation.olderQuestions[i].priorDispositionRevision='stale');
reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.allPacketReconciliation.olderQuestions.push(p.allPacketReconciliation.olderQuestions[0]));reject(p=>p.allPacketReconciliation.supportOnlyReferences[0].status='fully_reviewed');reject(p=>p.questionProposals.push({...p.questionProposals[0],recordId:'mcq:m091'}));reject(p=>p.questionExclusions.pop());reject(p=>p.ambiguousPremiseOrContrastHolds.pop());reject(p=>p.ambiguityDisposition='cleared');reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=483);
for(const code of ['53','55']){reject(p=>p['objective'+code+'Census'].pop());reject(p=>p['objective'+code+'Denominator'].remaining=0);reject(p=>p['remainingObjective'+code+'RecordIds'].pop());reject(p=>p['objective'+code+'Denominator'].newQuestionDispositions=12);}
reject(p=>p.sharedObjectiveRecordIds.pop());reject(p=>p.sharedRecordsCreateNoAdditionalGlobalCredit=false);reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
for(const code of ['51','52','54','45','46'])reject(p=>p['unchangedObjective'+code+'Progress'].remaining=0);
reject(p=>p.structuralPriorityQuestionIds.reverse());reject(p=>p.sourceChecks[2].unchangedWrongCorrectionCount=0);reject(p=>p.pilotBoundary.roleWeightTeachingPublicationApprovalTransferred=true);reject(p=>p.pilotBoundary.cleanPointBoundary.hold='');reject(p=>p.pilotBoundary.recoveryBoundary='');reject(p=>p.pilotBoundary.preservedPilotQuestionProposals[0].primaryConceptProposal=null);reject(p=>p.pilotBoundary.mttrGlossaryBoundary.conceptLinkProposals=['recovery.mttr']);reject(p=>p.preservedPilotFeedbackLinkReconciliation[0].duplicateCredit=1);
for(let i=0;i<meaningBoundaryChecks.length;i++){reject(p=>p.meaningBoundaryChecks[i].stemRevision='stale');for(const [field,v]of Object.entries(meaningBoundaryChecks[i]))if(typeof v==='boolean')reject(p=>p.meaningBoundaryChecks[i][field]=!v);}
completedNegativeChecks=negativeMutationChecks;
const exported={...packet,negativeMutationChecks};validate(exported);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const report=[
 '# Phase 2B-5 — objectives 5.3 and 5.5 assurance MCQs and complete feedback',
 '**NOT READY.** Review date: **11 October 2026**. Finite local/offline review. Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. Only the draft packet, this report and its focused audit are added. A pending disposition is a source-bound review judgment; its hold records a limitation without rewriting learner content.',
 '## Authority, scope and reconciliation',
 'The approved master plan and Phase 1 audit were read in full earlier in this continuing session. The master plan governs approved product decisions; the audit supplies historical implementation facts. Current source bindings were rechecked. No unresolved authority conflict affects this local slice. Standing local content/family delegation permits these draft judgments; canonical scope, roles, skills, teaching, weights, publication and activation remain separate gates.',
 'Requested order: **'+ids.join(', ')+'**. Source priority scores: **10,10,20,35,30,10,35,20,25,55,55,55**. Separate structural rank: **'+rankedIds.join(', ')+'**. Scores are inspection priorities, not correctness or difficulty calibration. Each current question, every choice, key, main explanation and all three wrong corrections are compared with published, authored/imported and preeditorial sources.',
 '**10 new question judgments +12 new complete-feedback judgments =22 new pending catalogue dispositions.** m091 and m645 already have matching question judgments in the contextual-recovery packet: exact family **sla-service-commitment-identification**, source revisions and outside-five-pilot disposition are preserved, with **zero new question/family credit**. Their full feedback is newly reviewed. No source-insufficient deferrals or private substitutes. All new precise scope/role/skill/primary/trusted proposals remain null, secondary/link arrays empty, weights and novelty credit zero, and human/publication/teaching/evidence/activation approvals false.',
 'All **65 prior substantive packets** are reconciled before credit, including **42 older distinct question judgments (30 MCQs+12 local PBQs)**. **22 duplicate cross-packet references** and **seven brief support/link references** add no coverage. Historical links to the five already reviewed pilot-feedback bundles remain separately preserved without extra credit. The frozen ledger and all prior packets remain unchanged. Thirteen older question-only judgments still lack full feedback after this slice.',
 '## Separate objective counts and residuals',
 '| Local assessment coverage | Prior | New | Combined | Remaining |\n| --- | ---: | ---: | ---: | ---: |\n| Question judgments | 395 | 10 | 405/483 | 78 |\n| Complete feedback | 380 | 12 | 392/483 | 91 |\n| Question and full-feedback pairs | 380 | 12 | 392/483 | 91 |',
 'Question coverage is **377/395 MCQs+28/88 local PBQs**, leaving **18 MCQs+60 PBQs**. Complete pairs are **376 MCQs+16 local PBQs**, leaving **19 MCQs+72 PBQs** without full feedback. The denominator excludes two private alternatives, nine starter assessments and two guest demos. Global counts deduplicate record identities.',
 '| Objective catalogue | Prior pending | New questions | New feedback | Combined pending | Remaining |\n| --- | ---: | ---: | ---: | ---: | ---: |\n| 5.3 supplier risk | 27 | 3 | 5 | 35/98 | 63 |\n| 5.5 audit and assessment | 3 | 7 | 7 | 17/41 | 24 |',
 'Both catalogues are entirely local; private metadata-only count is zero. All five objective 5.3 MCQs and all seven objective 5.5 MCQs now have pending question and complete-feedback judgments. Objective 5.3 prior kinds:\n\n'+Object.entries(coverage53.denominator.priorByKind).map(([k,n])=>'- '+k+': '+n).join('\n'),
 'Objective 5.5 prior kinds:\n\n'+Object.entries(coverage55.denominator.priorByKind).map(([k,n])=>'- '+k+': '+n).join('\n'),
 '| Remaining kind | Objective 5.3 | Objective 5.5 |\n| --- | ---: | ---: |\n'+[...new Set([...Object.keys(coverage53.denominator.remainingByKind),...Object.keys(coverage55.denominator.remainingByKind)])].sort().map(k=>'| '+k+' | '+(coverage53.denominator.remainingByKind[k]||0)+' | '+(coverage55.denominator.remainingByKind[k]||0)+' |').join('\n'),
 'Every one of the 98 and 41 census rows, residual IDs and source revisions is bound in the packet. The remaining objective 5.5 assessment is **pbq:p038**, with its distinct **explanation:pbq:p038**; neither is reviewed here. Seven broad records overlap objectives: **'+sharedObjectiveRecordIds.join(', ')+'**. The catalogues therefore contain **132 distinct records**, not 139 separate global records; none of the 22 new dispositions is an overlapping glossary record. Objective progress is reported separately and is not whole-objective approval.',
 'Prior objective coverage stays unchanged:5.1 **48/103,55 remaining**;5.2 **63/141,78 remaining (76 local+two private)**;5.4 **39/115,76 remaining**;4.5 **63/169,106 remaining**;4.6 **89/151,62 remaining**. Earlier overlapping teaching and glossary reviews keep their exact limits, rather than approving all shared scope.',
 '## Twelve judgments and all wrong-choice corrections',
 reviews.map(r=>'**'+r.id+'.** '+r.meaning+'\n\n'+r.hold+'\n\nMain teaching judgment: '+r.main+'\n\nWrong-choice contrasts, in current wrong-choice order:\n\n'+r.contrasts.map((t,k)=>(k+1)+'. '+t).join('\n')).join('\n\n'),
 '## Source precedence and delivery',
 '**Zero selected captured/snapshot replays.** All twelve authored/imported sources exist and equal their preeditorial layer; there are no selected captured upserts or snapshot-only substitutes. Local effective and published revisions are separately bound. The audit checks actual captures if present and rejects invented capture or snapshot claims for these rows; absence of a capture is not a current private database read.',
 '**Four imports:**m645 QB1 question45;m607 QB1 question7;m643 QB1 question43;m657 QB2 question7. All four receive specific effective main and wrong-choice feedback in place of generic imported corrections. m657 removes the PAGE21 extraction artifact. Imported origin, cleanup and changed alternatives create no independent-family credit.',
 '**Seven stems change:**m100,m190,m181,m195,m607,m643,m657. **Six option sets change:**m190,m181,m340,m607,m643,m657. Spelling-only differences are source changes, not new understanding. All twelve key positions are unchanged and all twelve main explanations change. The audit verifies these counts from exact source layers.',
 '**36 wrong-choice corrections checked:32 changed/new+four unchanged.** Eleven whole bundles change; m100 retains all three corrections and m091 retains its NDA correction. m190,m181,m195,m340 have no authored wrongFeedback, so their twelve effective corrections are new. Every retained and added correction has an individual choice hash, correction hash, teaching judgment and zero secondary evidence/weight; none is accepted solely because it is unchanged.',
 '| Question | Authored/preeditorial domain and difficulty | Effective domain and difficulty |\n| --- | --- | --- |\n'+candidates.map(row=>{const s=c.questions.get(row.recordId);return'| '+row.questionId+' | '+s.authored.ch+'/'+s.authored.difficulty+' | '+s.q.ch+'/'+s.q.difficulty+' |';}).join('\n'),
 'Observed cross-domain moves:m645 3→5,m093 1→5,m181/m340 4→5,m607/m657 2→5. Difficulty labels remain uncalibrated. Effective whole-objective tags do not approve exact assessment scope or force new canonical remaps, especially for reconnaissance, knowledge models and certification recognition.',
 '**Twelve deterministic shuffles** execute the actual option-shuffle and wrong-feedback functions, preserving keyed meaning and all 36 correction associations after remapping. Existing practice/launch delivery bindings match. Ten source-bound meaning probes keep diligence/care apart from rigid timing, SLA commitments apart from achieved recovery, audit access apart from actual inspection, the supplied fine apart from automatic legal liability, a supplied certification decision apart from real certificate verification, knowledge apart from position/permission, team title apart from independence and archived records apart from observed network interaction. No invented numerical SLA, fine, certification or recovery calculation is introduced.',
 'Feedback remains conditional on selection, submission, entitlement and the chosen wrong option. No browser pool, actual supplier monitoring, contract execution, audit, certificate verification, control test, target query, penetration test, learner behaviour or legal processing decision is observed.',
 '## Conservative family comparisons and preserved authority',
 comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
 'm091/m645 retain their earlier exact SLA label. m093/m643 share provisional requirement-based-security-audit-identification;m181/m340 share tester-prior-knowledge-model-identification;m607/m657 share third-party-archived-record-passive-reconnaissance. The remaining provisional meanings cover diligence, contractual audit access, outsourcing accountability and certification result. Shared families are conservative comparisons with zero new mastery/novelty credit, not psychometric independence or transfer proof. The explicitly cued m093 stem remains an ambiguity hold.',
 'Historical owner content/family decisions, all three draft-comparison hashes and the five original recovery pilot-role proposals remain exact. All15 approved draft content revisions and14 editorial family judgments are preserved separately from immutable draft flags. mtd.01 stays in m196\'s family with zero novelty; rpo.03\'s accepted clean-point distinction retains no psychometric independence, learner transfer or clean-source guarantee. MTTR glossary and coarse p048/p211 support-only holds remain exact. Earlier controller/processor, internal-owner, risk-transfer, tabletop, CSF and SLA comparisons retain their boundaries. No approval transfers to roles, canonical metadata, teaching, weights or publication.',
 '## Primary-source support and inference limits',
 '[NIST CSF2.0, GV.SC-05–07](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf) addresses contract requirements, diligence before formal relationships and continuing supplier-risk assessment/monitoring. Our inference keeps report review separate from acceptance, achieved security and ongoing oversight. A vendor document is not inspected simply because its type is named.',
 '[NIST SP800-115](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-115.pdf), September2008, AppendixB and glossary distinguishes authorised rules of engagement and evidence-review techniques. It supports scope/authority limits; the historical guide does not establish modern test tool behaviour, network traces or permission for this scenario. Our knowledge-versus-position and archived-record judgments are inferences from the explicitly supplied premises, not observed attacks.',
 '[IIA Global Internal Audit Standards2024](https://www.theiia.org/globalassets/site/standards/editable-versions/globalinternalauditstandards_2024january9_editable.pdf), objectivity safeguards and Standard7.1, requires attention to independence and impairments. Our inference rejects a team title as sufficient evidence of independent review. No charter, reporting line or actual control evidence is inspected.',
 '[ISO/IEC27001 overview](https://www.iso.org/standard/27001) describes ISMS requirements and distinguishes implementation from choosing certification. [ISO certification guidance](https://www.iso.org/certification.html) distinguishes certificates and accreditation, notes accreditation is not universally compulsory, and states ISO does not issue certificates. Our inference binds m195 to its explicitly successful certification decision without a zero-vulnerability or all-systems guarantee. No paid standard, certificate or certification engagement is inspected.',
 '[AICPA SOC resources](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) describe the service-organisation assurance-report function. Report names alone do not supply their actual scope, findings, period or applicability; the unspecified m080 report type is not upgraded to TypeII evidence. The TypeII distractor in m195 is not an inspected report.',
 '[GDPR Articles4(7)–(8),24 and28](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng) define functional controller/processor roles and their distinct responsibilities. This is conditional primary-source support for the outsourcing distinction, not a finding that GDPR applies to this payroll scenario or that every breach automatically creates a controller fine. Jurisdiction, facts and real agreements remain unverified. Document-function contrasts are instructional inferences, not legal advice about any supplied contract.',
 '## Preserved holds and release boundary',
 'All ten preceding objective5.1 feedback qualifications are inherited, including document title versus authority, mandatory-procedure overstatement, policy overlap, technical-baseline implementation and internal/legal-owner distinction. All earlier objective5.2 risk and pilot-feedback holds, objective5.4 holds,4.5 holds and both4.6 packets remain exact, including source-only multiplication, cost horizons, exception requests, clean-point and operational-plan overlap. Every earlier scope, role, supplier, crypto, PKI, PFS, channel, Unicode, PBQ grammar/grading, targeting, delivery and policy-currentness limitation remains. Earliest m305 whole scope,m046 precise contrast and m432 numbered-scope holds are explicitly tested against erasure.',
 'Private p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, unavailable/unreviewed with null trusted identity; its private feedback is likewise unavailable. No private fetch, compilation, export or local substitute. Exports contain no stems, offered choices, keys, option-indexed grading fields or learner data.',
 'Active package unchanged:**1878 records/435 identities/2954 review decisions/489 unresolved mappings/seven existing primary proposals**, SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All25 protected hashes remain exact. Private semantics,36 unsupported local PBQ grammars, residual coverage, held qualifications, canonical metadata, taxonomy and calibration still block readiness.',
 '**NOT READY.** Local/default-off/unwired/learner-invisible. No runtime, active-package, canonical role/scope/skill/difficulty, teaching/weight, learner evidence, shadow/live write, migration, publication, cohort, deployment, activation or Phase3 change.',
 '## Validation and delivery',
 'Run node '+scriptPath+' and npm run audit:content-mapping. Focused validation rebuilds the frozen ledger, reconciles65 prior packets, binds10 new questions/two reused parents/12 complete bundles, checks36 corrections/zero actual selected snapshots/12 shuffles/ten meaning probes, and separately checks98/41 census rows and63/24 residuals. **'+negativeMutationChecks+' rejected mutations** cover stale sources, wrong corrections, invented roles/trust/credit/captures, qualification/hold erasure, source swaps, objective overlap, support overcount, private substitution, forbidden exports and activation.',
 'All29 mapping tests, deterministic package reproduction,25 protected-file checks and git diff --check are required before the exact three-file **[skip deploy]** commit/push. The configured Vercel skip marker is verified. Delivery requires exact local HEAD=origin/main=remote refs/heads/main and artifact hash matching. Git push does not establish a live deployment; unrelated dirty/generated files remain unstaged.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE53_55_ASSURANCE_NOT_READY',candidateIds:ids,newQuestionDispositions:10,newFeedbackDispositions:12,reusedQuestions:2,bankProgress,objective53:packet.objective53Denominator,objective55:packet.objective55Denominator,snapshotReplays:0,wrongCorrections:36,changedWrongCorrections:32,unchangedWrongCorrections:4,shuffleProbes:12,meaningProbes:10,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
