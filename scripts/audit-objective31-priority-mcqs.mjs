import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';

const scriptPath='scripts/audit-objective31-priority-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json',reportPath='docs/phase-2b5-objective31-priority-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective25-mcqs-proposals.json',firstPath='docs/drafts/phase-2b5-objective23-fastlane-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'b5692462c6d7deafc547f9bf1cb902f2fa609b7bc7a61d36f1afdfeda8598afd');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
// Only substantive arrays overlay the frozen inventory; inspection references earn no credit.
for(const path of [firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json',basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
  assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const ranked=c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('3.1')&&!c.previous.has(r.recordId)).sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en'));
const selected=ranked.slice(0,12),deferred=ranked.slice(12),ids=["m714", "m020", "m620", "m060", "m065", "m157", "m294", "m296", "m417", "m451", "m619", "m638"];
assert.deepEqual(selected.map(r=>r.questionId),ids);assert.deepEqual(deferred.map(r=>r.questionId),['m650','m017','m148','m021','m061','m149','m154','m161','m058','m298']);
const meanings=[
  "Choose fresh TPM-backed measured-state attestation against an approved baseline instead of trusting unsigned OS reporting, stored-data encryption or stale quotes; exact 3.1 assessment scope remains held.",
  "Choose bounded segmentation and tested compensating controls for the stipulated unsupported water-treatment controller while preserving safety and planning validated replacement.",
  "Identify the guest OS/application patching layer as the normal customer duty for the stipulated unmanaged IaaS VM, subject to service terms.",
  "Assign remediation of the stipulated provider-managed PaaS platform flaw to the provider without erasing customer application, identity, data or incident duties.",
  "Choose enforced workload boundaries and narrow service identities to limit a compromised development workload reaching finance data in a private cloud; one combined decision.",
  "Choose static IaC security scanning for proposed Terraform configuration before provisioning, without asserting complete security or enforced gates merely from a scan.",
  "Recognize the supplied general-market cloud offering as public cloud; definition recall does not establish the whole 3.1 security-implication comparison scope.",
  "Choose enforced central deployment restrictions within governed-account scope over reminders, retrospective billing or encryption; exact regional-control numbered scope remains held.",
  "Place the specified existing-template security scan before provisioning in the pipeline, alongside later drift/runtime checks; no successful gate is implemented.",
  "Recognize that the stipulated usable overprivileged shared service-account credential can authorise Kubernetes API actions beyond one compromised workload, without proving an attack.",
  "Recognize VLAN as the offered local logical segmentation mechanism; cross-network isolation and exact numbered technology-recognition scope remain held.",
  "Recognize IaC as the general infrastructure-definition practice; playbooks can implement it, the stem does not stipulate declarative syntax, and whole numbered definition scope remains held."
];
const holds=[
  "HOLD measured boot as absence of every runtime rootkit, every TPM as a separate discrete chip, every signed report as fresh/trusted, or the TPM alone as measuring and interpreting all software. Measurement-chain coverage, attestation-key trust, quote/log consistency, baseline quality and assessment freshness matter. Old snapshot hardware-log immunity, pre-boot signing and unique all-rootkit detection claims are superseded; reporting may support a separate response but is not itself remediation. HOLD exact 3.1 assessed scope for this attestation-mechanism choice; retain architecture context without forcing 1.4. Source-only triage false stem/feedback flags reflect null authored input, not unchanged snapshot teaching. No boot, malware, TPM, nonce, log, quote or recovery is executed.",
  "HOLD unsupported software as an automatic reason for shutdown, vendor status as proving physical impossibility of downtime, segmentation/VLAN as an air gap, or every compensating control as safe/effective. Current premises explicitly establish safety hazard and unready validated replacement, correcting the old causal shorthand. One combined segmentation/compensation choice gives no independent data-diode, firewall, monitoring or replacement evidence. Required communication, tested compatibility, residual-risk ownership and lifecycle planning remain necessary; future replacement is not abandoned. Old blanket negligence, antivirus incompatibility and multi-year planning claims are superseded. No controller, safety state, patch, segmentation, product or replacement is tested.",
  "HOLD IaaS as one universal contract or total transfer of security responsibility. The effective stem limits the service to a conventional unmanaged VM and normal patch ownership; managed options can move boundaries. Provider hardware, hypervisor and physical storage duties do not remove customer configuration/data/identity duties. One OS/application answer is not separately scored layer competence. Correlate with m060 PaaS responsibility, not approved independent evidence. Imported provenance identifies an authored input, not an external verified claim. No cloud agreement, patch, provider responsibility fulfilment or secure guest is tested.",
  "HOLD all PaaS orchestration as provider-managed regardless of terms, assigned platform remediation as equal division of every incident duty, or provider responsibility as customer immunity or legal liability determination. The effective stem now explicitly assigns the managed layer by agreement. Customer application/dependency, identity, data and response duties can coexist with provider platform patching. Authored unqualified category/accountability wording is superseded; one offered ownership decision does not assess all duties. Correlate with m620; no incident, agreement, platform, tenant or patch is actually inspected.",
  "HOLD private cloud as automatically trusted internally or free of shared-consumer/cross-workload risk; one organisation can contain multiple business units. One combined segmentation/service-identity answer does not isolate which control a learner understands. The original private-cloud-definition key and no-multitenancy-risk guarantee are superseded by a different task and key position. Perimeter controls, capacity limits and private addressing can coexist but do not enforce the stipulated internal authorisation requirement alone. Required paths and permissions still need review. Correlate with m138/m133 path control and m014/m113 permission purpose without new independent components, approved families or verified containment.",
  "HOLD template scanning as finding every insecure setting, rendering deployed infrastructure secure, or enforcing CI/CD denial merely because a scan is integrated. Tool grammar, policies, proposed values and later drift/runtime effects limit findings. Current specialised static-scan choice addresses the requested phase; generic WAF/network/EDR purposes are bounded contrasts, not claims that integrated platforms can never inspect configurations. Authored named products are removed without selecting or running replacements. Correlate strongly with m417 pre-provisioning scan timing; spelling/label changes alone do not establish scenario novelty. No Terraform, scanner, policy, pipeline, build or provisioned resource executes.",
  "HOLD deployment labels as automatic hardware ownership, uniform tenancy or security guarantees. The effective general-market offering supports public-cloud recognition; private cloud may be third-party managed and public services can include dedicated resources. Community and hybrid structures may coexist in an organisation but are not supplied for this offering. The authored always-shared/all-hardware and organisation-managed-private assumptions are superseded. HOLD whole 3.1 assessed scope: this asks a deployment-model definition rather than comparing security implications; retain cloud-model context without forcing another objective. No provider, tenancy, hardware, contract or security posture is observed.",
  "HOLD generic central guardrails as already configured, every identity/account/service as covered, regional request limits as full data sovereignty, or encryption as satisfying location policy. Current governed-account scope and exception/bypass teaching replace the authored universal AWS-org administrator guarantee. AWS SCPs have management-account/service-linked-role exceptions and do not grant permissions; those historical examples are not reintroduced into the effective key. HOLD exact 3.1 assessed scope for regional control selection versus architecture comparison; retain cloud context without forced 3.3. No policy, account, exception, location, resource or successful prevention is tested.",
  "HOLD pre-provisioning scanning as prevention of every exposure, template validation as all SDLC security, or pipeline presence as a measured enforcement result. Proposed templates must exist for this particular scan; requirements/design reviews can still analyse earlier artifacts. Post-deployment drift and periodic independent assessment remain useful complementary work. The current options remove misleading retrospective/design-only contrasts, and authored domain 1 is superseded by effective domain 3 IaC context. Correlate strongly with m157; one phase choice is not an independent implemented scanner, gate or drift-remediation component. No template, scan, environment or deployment is performed.",
  "HOLD shared identity alone as proven cluster takeover, host-memory escape, quota removal or disabled image verification. The premise supplies a usable cluster-admin credential; authentication validity, API reachability and other controls still constrain actions. One effect choice replaces the authored two-risk prompt without separately proving excessive privilege and lateral movement. Service-account roles and token availability differ from namespaced identity alone. Suggested narrower identities are teaching, not executed remediation. Correlate with least-privilege principles without independent family approval. No token is retrieved/exported, no API request is sent, and no cluster, exploit or recovery is tested.",
  "HOLD VLAN membership as sufficient to prevent all cross-communication on shared hardware. Layer 2 separation needs correct port/trunk configuration and inter-VLAN paths/authorisation; logical separation is not a physical air gap. The retained stem states prevention without those rules, while current main feedback qualifies it. SDN/SD-WAN can include VLANs, so technology scope differs rather than proving exclusive products. HOLD exact whole 3.1 assessed scope for naming the technology rather than comparing its security implications. Imported old generic feedback is superseded. Correlate with m133/m138 enforcement and m020 safety constraints; no switch, route, physical isolation or communication test is observed.",
  "HOLD IaC as necessarily declarative, automation playbooks as mutually exclusive with IaC, machine-readable definitions as proof of deployed/versioned safe infrastructure, or automation as reducing all misconfiguration. The retained wrong correction assumes declarative definitions not stated by the stem; playbooks can declare infrastructure and implement the general practice. Keep IaC as the offered broad label but hold the precise exclusivity and whole 3.1 definition-recall scope, without forcing another objective. SDN can participate in IaC and CI can validate it. Correlate with m157/m417 without granting their inspection skill to this definition. No template, playbook, provision, CI job or security result executes."
];
const mainTeaching=[
  "Fresh trusted measured-state evidence plus an approved baseline addresses the stated startup verification need; coverage and later runtime integrity remain separate.",
  "Preserve stated industrial safety using tested restricted communication and compensating controls while planning validated replacement.",
  "Normal unmanaged-IaaS guest OS/application patching is a customer duty; provider infrastructure and extra managed-service terms remain separate.",
  "The supplied agreement assigns the platform flaw to the provider while customer application, identity, data and response duties remain.",
  "Private-cloud workloads still need enforced internal boundaries and scoped identities to reduce cross-team access.",
  "Inspect proposed IaC configuration before deployment; supported policies and runtime drift limit what static findings establish.",
  "The supplied general-market offering describes public cloud without implying every private/public service has the same operator or tenancy.",
  "An enforced scoped deny can prevent prohibited deployments; test coverage, exceptions and bypasses rather than infer full location compliance.",
  "Scan available templates before provisioning and complement that gate with later resource/drift validation.",
  "A usable overprivileged API credential expands possible actions beyond the workload; narrower identities and exposure limits are suggested controls.",
  "VLANs separate Layer 2 traffic; correct switch and inter-network policy still determine wider reachability.",
  "IaC defines infrastructure as machine-readable configuration; automation can repeat insecure settings and playbooks may implement the same practice."
];
const contrasts=[
  [
    "Unsigned local reporting can be falsified by a compromised OS and lacks the offered protected-state evidence.",
    "Stored-data encryption does not by itself measure startup state against a baseline.",
    "A previously valid quote lacks current-assessment freshness; signature validity alone is insufficient."
  ],
  [
    "Doing nothing omits feasible risk reduction; accountable residual-risk acceptance is different from abandoning controls.",
    "An unvalidated immediate replacement conflicts with the stipulated safety and readiness constraints.",
    "An unvalidated endpoint product may disrupt this controller; compatibility must be tested rather than assumed."
  ],
  [
    "Provider physical host management differs from customer guest patch ownership in the stated unmanaged service.",
    "The underlying IaaS hypervisor is normally operated by the provider rather than the VM customer.",
    "Physical provider storage maintenance differs from customer storage configuration and data responsibilities."
  ],
  [
    "Customer application work remains a duty but the stipulated flaw is in the separately provider-managed layer.",
    "Tenant identity administration does not confer patch ownership of the stipulated provider orchestration layer.",
    "Data governance and incident obligations coexist with, but do not own, the assigned platform patch."
  ],
  [
    "The offered perimeter filter leaves the specified internal development-to-finance path open.",
    "CPU/memory quotas address consumption rather than authorising access to finance data.",
    "Private addresses alone do not supply the required internal route or identity permissions."
  ],
  [
    "A WAF request-inspection role does not directly scan the proposed Terraform configuration.",
    "Network probing of running services differs from the required undeployed-template static check.",
    "Endpoint behaviour observation is not the offered specialised IaC-template inspection."
  ],
  [
    "A one-organisation private service differs from this general-market shared offering; private operation need not be internal.",
    "A defined shared-concern community differs from open general-market access.",
    "The stated single offering does not establish linked distinct cloud environments."
  ],
  [
    "Developer reminders communicate policy without enforcing the proposed deployment request.",
    "Monthly billing occurs after the creation that policy seeks to prevent.",
    "Encryption can protect confidentiality while the resource still violates regional restrictions."
  ],
  [
    "Production drift monitoring happens after creation and cannot be this pre-provisioning template gate.",
    "Requirements analysis can address design risk but the specified template must exist to be scanned.",
    "Periodic assessment complements governance but is not a gate on each proposed provisioning change."
  ],
  [
    "API identity and permission do not themselves combine the pods process memory spaces.",
    "Quotas are separate configuration; authority to change them differs from their automatic removal.",
    "Registry/admission verification settings are separate; identity sharing does not automatically disable them."
  ],
  [
    "SDN is broader programmable network control and may configure VLANs; it is not an exclusive opposite.",
    "Physical air-gap isolation differs from the stipulated logical use of shared switch hardware.",
    "WAN connectivity control differs from this local Layer 2 segmentation mechanism."
  ],
  [
    "SDN programs network control but can participate in broader infrastructure definition.",
    "CI integrates/checks changes and can support IaC; it is not the infrastructure-definition practice itself.",
    "Automation playbooks may implement IaC; the assumed declarative/exclusive contrast remains held."
  ]
];
const families=[
  "fresh-measured-startup-state-verification-choice",
  "safety-constrained-unsupported-controller-mitigation",
  "service-agreement-layer-responsibility",
  "service-agreement-layer-responsibility",
  "combined-internal-boundary-and-identity-choice",
  "pre-provisioning-IaC-security-inspection",
  "general-market-cloud-model-recognition",
  "scoped-central-deployment-policy-choice",
  "pre-provisioning-IaC-security-inspection",
  "overprivileged-workload-API-credential-consequence",
  "logical-local-network-segmentation-recognition",
  "machine-readable-infrastructure-definition-recognition"
];
const preciseHolds=[
  "exact_numbered_attestation_scope",
  null,
  null,
  null,
  null,
  null,
  "whole_numbered_cloud_model_definition_scope",
  "exact_numbered_regional_control_scope",
  null,
  null,
  "logical_segmentation_not_cross_communication_guarantee_and_numbered_recognition_scope",
  "IaC_playbook_overlap_and_whole_numbered_definition_scope"
];
const roles=[
  "attestation_control_choice_exact_scope_held",
  "one_safety_constrained_combined_control_choice",
  "unmanaged_guest_patch_layer_recognition",
  "assigned_platform_patch_layer_recognition",
  "one_combined_network_identity_choice_not_independent_components",
  "static_template_inspection_tool_choice",
  "cloud_model_definition_whole_scope_held",
  "regional_control_choice_exact_scope_held",
  "template_scan_phase_choice",
  "one_API_privilege_effect_choice_not_executed_attack",
  "logical_segmentation_name_whole_scope_held",
  "IaC_definition_overlap_and_whole_scope_held"
];
const scopes=[
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.1"
    ],
    "status": "held_exact_numbered_or_definition_scope"
  },
  {
    "assessedCodes": [
      "3.1"
    ],
    "contextCodes": [],
    "status": "narrow_architecture_security_implication_inferred_pending_owner"
  },
  {
    "assessedCodes": [
      "3.1"
    ],
    "contextCodes": [],
    "status": "narrow_architecture_security_implication_inferred_pending_owner"
  },
  {
    "assessedCodes": [
      "3.1"
    ],
    "contextCodes": [],
    "status": "narrow_architecture_security_implication_inferred_pending_owner"
  },
  {
    "assessedCodes": [
      "3.1"
    ],
    "contextCodes": [],
    "status": "narrow_architecture_security_implication_inferred_pending_owner"
  },
  {
    "assessedCodes": [
      "3.1"
    ],
    "contextCodes": [],
    "status": "narrow_architecture_security_implication_inferred_pending_owner"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.1"
    ],
    "status": "held_exact_numbered_or_definition_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.1"
    ],
    "status": "held_exact_numbered_or_definition_scope"
  },
  {
    "assessedCodes": [
      "3.1"
    ],
    "contextCodes": [],
    "status": "narrow_architecture_security_implication_inferred_pending_owner"
  },
  {
    "assessedCodes": [
      "3.1"
    ],
    "contextCodes": [],
    "status": "narrow_architecture_security_implication_inferred_pending_owner"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.1"
    ],
    "status": "held_exact_numbered_or_definition_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.1"
    ],
    "status": "held_exact_numbered_or_definition_scope"
  }
];
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();
assert.equal(selected.filter(r=>r.flags.stemChanged).length,9);assert.equal(selected.filter(r=>r.flags.optionsChanged).length,7);assert.deepEqual(selected.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m620','m619','m638']);
const questionProposals=selected.map((row,i)=>{
  const s=c.questions.get(row.recordId),q=s.q,shuffled=shuffle(q);assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);
  assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
  for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
  if(i<2){assert.equal(s.snapshots.length,1);assert.equal(s.captures.length,1);const replay=publicationPipeline(c.bank).overrides(s.snapshots).mcqs.find(x=>x.id===q.id),{_baseOrder,_adminOrder,...semantics}=replay;assert.equal(sig(semantics),row.revisions.localEffective);assert.equal(s.pub._adminOrder,s.captures[0].sort_order);if(i===0)assert.equal(s.authored,null);else{assert(s.authored);assert.notEqual(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);}}else{assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);}
  return{recordId:row.recordId,questionId:q.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:i<2,sourceLayerDisposition:i===0?'snapshot_only_no_authored_or_imported_substitute':i===1?'authored_then_captured_snapshot_then_effective_editorial':'authored_equals_preeditorial_but_differs_from_effective',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',assessedUnderstanding:meanings[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],skillRoleProposal:roles[i],numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:families[i],familyStatus:'provisional_comparison_no_independence_approval',optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0}};
});
assert.equal(questionProposals.filter(r=>r.snapshotReplayChecked).length,2);assert.equal(questionProposals.filter(r=>r.revisions.authored===null).length,1);
const explanationProposals=questionProposals.map((parent,i)=>{
  const s=c.questions.get(parent.recordId),q=s.q,indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct);assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
  return{recordId:'explanation:'+parent.recordId,kind:'explanation_bundle',parentId:parent.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:parent.sourceRevision,parentPublishedRevision:parent.publishedRecordSignature,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:mainTeaching[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],withheldPreciseContrast:preciseHolds[i],roleProposal:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:contrasts[i][k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId)),broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('3.1')),old=broad.filter(r=>c.previous.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id)),counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
assert.equal(broad.length,220);assert.equal(old.length,55);assert.equal(selectedIds.size,24);assert.equal(remaining.length,141);assert.equal(broad.filter(r=>r.kind==='mcq').length,22);assert.equal(remaining.filter(r=>r.kind==='mcq').length,10);assert.equal(remaining.filter(r=>r.kind==='pbq').length,4);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,14);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,priorQuestions=bankRows.filter(r=>c.previous.has(r.recordId)),priorFeedback=bankRows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorQuestions.length,193);assert.equal(priorFeedback.length,193);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,priorQuestions:193,newQuestions:12,combinedQuestions:205,remainingQuestions:278,combinedMcqs:189,remainingMcqs:206,combinedLocalPbqs:16,remainingLocalPbqs:72,pairedFeedbackCombined:205,pairedFeedbackRemaining:278};
assert.equal(priorQuestions.filter(r=>r.kind==='mcq').length + 12,bankProgress.combinedMcqs);assert.equal(priorQuestions.filter(r=>r.kind==='pbq').length,16);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective25HeldDispositions:base.explanationProposals.filter(r=>r.withheldPreciseContrast).map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal}))};
const legacy24=priorHolds.inheritedHolds.inheritedHolds.inheritedHolds,old23=legacy24.earlierHolds;
assert.equal(old23.objective23Holds.m305WholeScopeHold.objectiveScopeProposal.status,'held_whole_numbered_mitigation_choice_scope');assert.equal(old23.objective23Holds.priorHolds.m046HeldContrast,'named_individual_requirement_in_spear_phishing_wrong_feedback');assert.equal(old23.objective23Holds.priorHolds.m432WholeNumberedScopeHeld,true);assert.equal(old23.objective23FeedbackHolds.length,4);assert.equal(legacy24.objective24HeldDispositions.length,4);assert.equal(priorHolds.inheritedHolds.inheritedHolds.objective24SecondHeldDispositions.length,3);assert.equal(priorHolds.inheritedHolds.objective24FinalHeldDispositions.length,6);assert.deepEqual(priorHolds.objective25HeldDispositions.map(r=>r.withheldPreciseContrast),['zero_day_unknownness_and_numbered_gap_scope','separation_of_duties_permission_scope_exclusivity']);
const comparisonSpecs=[
  {
    "ids": [
      "mcq:m714",
      "mcq:m433",
      "mcq:m094",
      "glossary:tpm",
      "glossary:bios",
      "glossary:apt"
    ],
    "meaning": "Startup measurement, later quote verification and runtime concealment are different evidence. Prior rootkit kernel/exclusive-concealment holds and APT capability/attribution limits remain. Trusted measured coverage is not all-malware detection, proof of freshness from a signature alone, or an implemented repair."
  },
  {
    "ids": [
      "mcq:m020",
      "mcq:m065",
      "mcq:m619",
      "mcq:m138",
      "mcq:m133",
      "mcq:m014",
      "mcq:m113",
      "mcq:m251",
      "mcq:m706",
      "glossary:zero%20trust",
      "glossary:acl"
    ],
    "meaning": "Safety-constrained OT mitigation, combined private-cloud identities/boundaries and VLAN technology recognition have different scopes. Logical separation does not prove physical air-gap isolation or safe access. Preserve m014 SoD and all channel/source-count holds; new composite choices add no independently scored permission, firewall or segmentation components."
  },
  {
    "ids": [
      "mcq:m620",
      "mcq:m060",
      "mcq:m294",
      "mcq:m296",
      "glossary:sla",
      "glossary:sow"
    ],
    "meaning": "IaaS/PaaS assigned layer duties share one provisional responsibility family. Public-cloud deployment definition does not determine contract or ownership; regional policy scope does not determine full data-location compliance. Neither transfers all customer duties nor proves a provider patches or a guardrail runs."
  },
  {
    "ids": [
      "mcq:m157",
      "mcq:m417",
      "mcq:m638",
      "mcq:m261",
      "glossary:waf",
      "glossary:ngfw"
    ],
    "meaning": "IaC scan-tool choice and pre-provisioning timing closely correlate; general IaC definition does not independently demonstrate inspection or enforcement. Playbooks can implement infrastructure definitions. Runtime request inspection and a template scan have different scope; no scanner, parser, pipeline or deployed policy runs."
  },
  {
    "ids": [
      "mcq:m451",
      "mcq:m065",
      "mcq:m014",
      "mcq:m113",
      "glossary:mac"
    ],
    "meaning": "Usable workload API privilege, combined network/identity control and least-privilege principle recognition differ. Shared identity is not memory isolation, namespace-wide automatic control removal or observed lateral movement. Preserve MAC polysemy and SoD permissions hold; no extra credential, actor or successful attack components."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids,comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const r=c.records.get(id),p=c.previous.get(id);assert(r);return{recordId:id,sourceRevision:r.sourceSignature,localRevision:r.localRevisionSignature??null,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null,status:selectedIds.has(id)?'current_substantive_disposition':p?'prior_disposition_reference_only':'inspection_only_no_new_credit'};}),newFamilyCredit:0,independenceApproved:false}));
const priorBatchComparisons=base.questionProposals.map(r=>{assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);return{recordId:r.recordId,sourceRevision:r.sourceRevision,publishedRecordSignature:r.publishedRecordSignature,feedbackRevision:c.records.get('explanation:'+r.recordId).sourceSignature,priorDecisionRevision:sig(r),status:'prior_substantive_reference_no_new_credit'};});
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'c0246b0ec22686d3d1f70acb0836c87b981571b2',sourceBindings:[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective25-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective25-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)}],triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,baselinePriorQuestions:125,substantiveOverlayPackets:[firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json',basePath].map(path=>({path,sha256:hashFile(path)})),currentPriorQuestions:193},bankSignature:c.ledger.bankSignature,selectionPolicy:'First 12 of 22 undispositioned objective 3.1 MCQs by existing triage priority then record ID; structural cues do not prove correctness or semantic error',selectedQuestionRecordIds:ids.map(id=>'mcq:'+id),selectedFeedbackRecordIds:ids.map(id=>'explanation:mcq:'+id),deferredObjective31QuestionRecordIds:deferred.map(r=>r.recordId),questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorBatchComparisons,priorHolds,objective31Census:census,objective31Denominator:{broadCandidates:220,priorAgentDispositions:55,newAgentDispositions:24,combinedAgentDispositions:79,remaining:141,remainingByKind:counts(remaining)},remainingObjective31RecordIds:remaining.map(r=>r.id),bankProgress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};

function validate(value){
  assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);assert.deepEqual(value.sourceBindings,packet.sourceBindings);
  assert.deepEqual(value.selectedQuestionRecordIds,selected.map(r=>r.recordId));assert.deepEqual(value.selectedFeedbackRecordIds,selected.map(r=>'explanation:'+r.recordId));assert.deepEqual(value.deferredObjective31QuestionRecordIds,deferred.map(r=>r.recordId));
  assert.equal(new Set([...value.questionProposals,...value.explanationProposals].map(r=>r.recordId)).size,24);assert.equal(value.questionProposals.length,12);assert.equal(value.explanationProposals.length,12);
  for(const [i,r]of value.questionProposals.entries()){
    const s=c.questions.get(selected[i].recordId);assert.equal(r.recordId,selected[i].recordId);assert(!c.previous.has(r.recordId));assert.deepEqual(r.revisions,s.row.revisions);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);
    assert.deepEqual(r.capturedOverrideBindings,s.row.capturedOverrides);assert.equal(r.snapshotReplayChecked,s.snapshots.length>0);assert.equal(r.assessedUnderstanding,meanings[i]);assert.equal(r.contentQualification,holds[i]);assert.deepEqual(r.objectiveScopeProposal,scopes[i]);assert.equal(r.skillRoleProposal,roles[i]);assert.equal(r.numberOfKeyedDecisions,1);assert.equal(r.familyLabelProposal,families[i]);
    assert.equal(r.trustedRevisionId,null);assert.equal(r.primaryConceptProposal,null);assert.deepEqual(r.secondaryConceptProposals,[]);for(const f of ['masteryWeight','newFamilyCredit'])assert.equal(r[f],0);for(const f of ['humanApproved','published','independentEvidence'])assert.equal(r[f],false);
  }
  for(const [i,r]of value.explanationProposals.entries()){
    const s=c.questions.get(selected[i].recordId),q=s.q,indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct);assert.equal(r.recordId,'explanation:'+s.row.recordId);assert.equal(r.parentId,s.row.recordId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.row.revisions.localEffective);assert.equal(r.parentPublishedRevision,s.record.sourceSignature);assert.equal(r.mainCorrectionRevision,sig(q.exp));assert.equal(r.wrongFeedbackRevision,sig(q.wrongFeedback));assert.equal(r.mainTeachingUnderstanding,mainTeaching[i]);assert.equal(r.contentQualification,holds[i]);assert.deepEqual(r.objectiveScopeProposal,scopes[i]);assert.equal(r.withheldPreciseContrast,preciseHolds[i]);assert.equal(r.deliveryGate,base.feedbackGate);
    assert.equal(r.distractorCorrections.length,3);for(const [k,d]of r.distractorCorrections.entries()){assert.equal(d.choiceRevision,sig(q.opts[indices[k]]));assert.equal(d.correctionRevision,sig(q.wrongFeedback[indices[k]]));assert.equal(d.teachingRationale,contrasts[i][k]);assert.equal(d.assessedSecondary,false);assert.equal(d.weight,0);}
    assert.equal(r.trustedRevisionId,null);assert.equal(r.primaryConceptProposal,null);assert.deepEqual(r.secondaryConceptProposals,[]);assert.deepEqual(r.conceptLinkProposals,[]);for(const f of ['masteryWeight','newFamilyCredit'])assert.equal(r[f],0);for(const f of ['humanApproved','published','independentEvidence','approvedRemediation','learnerObservedRecovery'])assert.equal(r[f],false);
  }
  assert.deepEqual(value.objective31Census,census);assert.deepEqual(value.remainingObjective31RecordIds,remaining.map(r=>r.id));assert.deepEqual(value.objective31Denominator,packet.objective31Denominator);assert.deepEqual(value.bankProgress,bankProgress);assert.deepEqual(value.separateAssessmentDenominator,packet.separateAssessmentDenominator);
  assert.deepEqual(value.priorHolds,priorHolds);assert.deepEqual(value.comparisonGroups,comparisons);assert.deepEqual(value.priorBatchComparisons,priorBatchComparisons);assert.deepEqual(value.triageLedgerBinding,packet.triageLedgerBinding);assert.deepEqual(value.deliveryBindings,base.deliveryBindings);assert.equal(value.practiceSelectorBinding,base.practiceSelectorBinding);assert.equal(value.feedbackGate,base.feedbackGate);
  for(const f of ['activationAllowed','humanApproved','published','eligibleEvidence','scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved','tooltipDeliveryObserved'])assert.equal(value[f],false);assert.equal(value.masteryWeight,0);assert.equal(value.unchangedReleaseHashes,25);assert.equal(value.activeUnresolvedMappingsUnchanged, 489);
}
validate(packet);
let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet,'Negative mutation must actually change the packet');assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<12;i++){
  reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);
  reject(p=>p.questionProposals[i].trustedRevisionId=p.questionProposals[i].revisions.trustedCompilerObserved);
  reject(p=>p.questionProposals[i].contentQualification='');
  reject(p=>p.explanationProposals[i].parentLocalRevision=p.questionProposals[(i+1)%12].sourceRevision);
  reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%12].sourceRevision);
  for(let k=0;k<3;k++)reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');
}
for(const [i,h]of preciseHolds.entries())if(h)reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);
reject(p=>p.questionProposals[0].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);reject(p=>p.questionProposals[0].snapshotReplayChecked=false);for(const field of ['captureIdentityRevision','capturedAt','payloadFingerprint','snapshotRevision'])reject(p=>p.questionProposals[0].capturedOverrideBindings[0][field]='stale');reject(p=>p.questionProposals[0].revisions.authored=p.questionProposals[0].revisions.preEditorialSnapshotMerged);
reject(p=>p.questionProposals[4].numberOfKeyedDecisions=3);reject(p=>p.questionProposals[9].newFamilyCredit=1);reject(p=>p.questionProposals[0].humanApproved=true);reject(p=>p.questionProposals[0].primaryConceptProposal='invented');
reject(p=>p.explanationProposals[0].deliveryGate='free_before_submission_all_options');reject(p=>p.explanationProposals[0].approvedRemediation=true);reject(p=>p.explanationProposals[0].distractorCorrections[0].assessedSecondary=true);
reject(p=>p.selectedQuestionRecordIds[9]=selected[0].recordId);reject(p=>p.questionProposals.pop());reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.deferredObjective31QuestionRecordIds.push(selected[0].recordId));
reject(p=>p.objective31Census.pop());reject(p=>p.objective31Census.push(p.objective31Census[0]));reject(p=>p.objective31Census.find(r=>r.recordId===remaining[0].id).status='new_agent_disposition_pending_owner');reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.separateAssessmentDenominator.privateVariants=0);
reject(p=>p.priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.earlierHolds.objective23Holds.m305WholeScopeHold=null);reject(p=>p.priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.earlierHolds.objective23Holds.priorHolds.m046HeldContrast=null);reject(p=>p.priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.earlierHolds.objective23Holds.priorHolds.m432WholeNumberedScopeHeld=false);for(let i=0;i<4;i++)reject(p=>p.priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.earlierHolds.objective23FeedbackHolds[i].withheldPreciseContrast=null);
for(let i=0;i<4;i++)reject(p=>p.priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.objective24HeldDispositions[i].withheldPreciseContrast=null);for(let i=0;i<3;i++)reject(p=>p.priorHolds.inheritedHolds.inheritedHolds.objective24SecondHeldDispositions[i].withheldPreciseContrast=null);for(let i=0;i<6;i++)reject(p=>p.priorHolds.inheritedHolds.objective24FinalHeldDispositions[i].withheldPreciseContrast=null);
reject(p=>p.priorBatchComparisons.pop());reject(p=>p.questionProposals[0].independentEvidence=true);reject(p=>p.explanationProposals[0].masteryWeight=1);reject(p=>p.questionProposals[0].objectiveScopeProposal={assessedCodes:['3.1','2.4'],contextCodes:[],status:'approved'});for(const i of [0,6,7,10,11])reject(p=>p.questionProposals[i].objectiveScopeProposal.assessedCodes=['3.1']);reject(p=>p.questionProposals[9].skillRoleProposal='observed_successful_API_attack');reject(p=>p.sourceBindings[0].sha256='stale');reject(p=>p.activationAllowed=true);for(let i=0;i<2;i++)reject(p=>p.priorHolds.objective25HeldDispositions[i].withheldPreciseContrast=null);for(const field of ['captureIdentityRevision','capturedAt','payloadFingerprint','snapshotRevision'])reject(p=>p.questionProposals[1].capturedOverrideBindings[0][field]='stale');reject(p=>p.questionProposals[1].snapshotReplayChecked=false);reject(p=>p.deferredObjective31QuestionRecordIds.pop());for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
packet.negativeMutationChecks=negativeMutationChecks;
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(packet,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),packet,'Packet/source disposition drift');
const report=[
  '# Phase 2B-5 — objective 3.1 priority MCQs and feedback',
  '**NOT READY.** Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. Only this finite packet, review report and focused audit change; existing source-bound helpers are reused. No duplicate bank ledger or runtime/configuration changes.',
  '## Exact selection and census',
  '**12 of 22** undispositioned effective objective 3.1 MCQs in deterministic risk-descending/record-ID order: **'+ids.join(', ')+'**, with twelve paired feedback bundles (**24 new pending agent judgments**). Deferred ten: **'+deferred.map(r=>r.questionId).join(', ')+'**. Every effective stem/choice/key/main and wrong correction, authored/preeditorial input, dated snapshot and capture metadata was read locally; triage only prioritises that reading.',
  'Objective 3.1 broad source-tag union: **220 records; 55 prior + 24 new = 79 pending agent dispositions; 141 remain**. Prior 55 comprise one deck container, 24 flashcards and 30 glossary definitions, with no already-dispositioned local 3.1 question or feedback. The remaining 141 comprise ten MCQs, four PBQs, fourteen paired feedback and 113 supporting/instructional records. Held judgments count as reviewed, not approved. Source tags are not precise scope approval or complete exam coverage.',
  '| Remaining kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
  'Bank: **193 prior + 12 new = 205/483 questions** and 205 paired feedback judgments pending owner. Reviewed questions comprise 189 MCQs + 16 local PBQs. **278 questions and 278 paired feedback remain**, comprising 206 MCQs + 72 local PBQs. Denominator remains 395 MCQs + 88 local PBQs. Two private variants, nine starter assessments and two guest demos stay separate; census and inspection references receive zero substantive credit.',
  '## Twelve substantive judgments',
  '| ID | Priority | Effective understanding | Qualification |\n| --- | ---: | --- | --- |\n'+questionProposals.map(r=>'| '+r.questionId+' | '+r.sourcePriority+' | '+r.assessedUnderstanding+' | '+r.contentQualification+' |').join('\n'),
  '## Source precedence and every correction',
  'm714 is snapshot-only with no authored/imported substitute. Its dated captured snapshot describes boot-rootkit detection with unqualified discrete-hardware/pre-boot-signing/immunity claims; effective editorial content replaces the task, choices and feedback with bounded measured-startup verification, changes observed domain 4 to domain 3 and difficulty from hard to medium, while acronym metadata remains observed rather than independently assessed. False authored stem/option/feedback triage flags do not establish semantic equality with that snapshot. m020 has an authored source, then a dated capture/snapshot with metadata changes, then effective editorial safety/readiness constraints and bounded controls. Its authored revision differs from preeditorial; the other ten authored revisions equal preeditorial and all differ from effective.',
  'Both m714/m020 actual production override-pipeline replays preserve effective semantics and captured administration order, binding capture identity/date/payload fingerprint/snapshot hashes. No newer private payload was fetched. Three imported inputs are m620/m619/m638; their QB1 provenance is an observed input label, not certification. Nine authored stem differences include spelling; seven option-list differences change contrasts. m065 changes the keyed position and task from model recall to workload control. m451 replaces an authored two-risk combined choice with one credential-effect choice. Unchanged key index elsewhere does not preserve meaning. m417 authored domain 1 is superseded by effective domain 3 IaC scope. Difficulty labels remain observed and uncalibrated.',
  explanationProposals.map((r,i)=>'**'+ids[i]+' main:** '+r.mainTeachingUnderstanding+' Three wrong-option contrasts: '+r.distractorCorrections.map(d=>d.teachingRationale).join(' ')).join('\n\n'),
  '**36** effective wrong corrections bind exact choice/correction/main/bundle/parent-local/parent-published revisions. Five explicit holds cover m714 exact attestation scope, m294 model-definition scope, m296 exact regional-control scope, m619 isolation premise and recognition scope, and m638 playbook overlap/definition scope. m638 feedback assumes declarative syntax absent from its stem. No correction creates assessed secondary concepts, independent components, implemented remediation or observed recovery.',
  'All twelve actual fixed-randomness pure shuffles preserve keyed choice, choice multiset and correction remapping. MCQPractice/shuffle/wrong-feedback source units and practice selector match the prior bindings. Main feedback requires submitted Pro; wrong feedback is conditional on the selected wrong option. Pool/set/guest delivery, browser entitlement/tooltip/disabled-option interaction and outcomes remain unobserved. No React, grading/session/storage/sync, telemetry, TPM/quote/token, industrial/controller, cloud, scanner, provisioning, network or attack handler executes.',
  '## Correlation and primary references',
  comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
  'The prior ten objective 2.5 questions have individual source/feedback references; earlier comparison records bind exact current and prior-decision revisions but earn no new substantive credit. m620/m060 share a provisional contract-layer family and m157/m417 share a provisional pre-provisioning-inspection family. Composite m020/m065 choices do not yield independently scored subskills; m451 no longer asks two risks. m638 definition does not inherit the scan-tool/timing skill. No canonical concepts, approved roles/family independence, calibrated difficulty, weights, evidence, human approval or publication is created.',
  '[CompTIA SY0-701 v7 §3.1](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) concerns comparing security implications of architecture models, including cloud responsibility, IaC, logical/physical isolation, containers and ICS/SCADA with availability and patch limitations. Definition-only questions do not establish that comparison; attestation and regional-control precise scope remain held rather than forcing alternative numbered objectives. Other narrow scope proposals are inferred pending owner review, not official certification.',
  '[NIST SP800-145](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf) distinguishes service and deployment models; a private cloud can include multiple organisational consumers and third-party operation. [AWS shared responsibility](https://aws.amazon.com/compliance/shared-responsibility-model/) describes normal IaaS guest responsibilities and service-dependent boundaries. m060 explicitly stipulates its PaaS contract; these sources do not decide legal liability or verify any provider action.',
  '[NIST SP800-82r3 §§5.2.3/6.2.1 and flaw remediation](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-82r3.pdf) discusses operational safety, tested changes and enforced network paths. This supports bounded compensating-control and logical-isolation reasoning, not a proven air gap, universal safe antivirus or blanket shutdown requirement.',
  '[Microsoft measured-boot documentation](https://learn.microsoft.com/en-us/windows/security/operating-system-security/system-security/secure-the-windows-10-boot-process#measured-boot) describes firmware measurements and later remote evaluation; [TPM fundamentals](https://learn.microsoft.com/en-us/windows/security/hardware-security/tpm/tpm-fundamentals) distinguishes protected processing from an always-discrete-chip assumption and permits separately triggered remediation. m714 does not establish all runtime malware detection, quote freshness from a signature alone or automatically performed repair.',
  '[AWS SCP documentation](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html) explains scoped permission limits, no permission grants and management-account/service-linked-role exceptions. These qualify the old m296 universal AWS guardrail claim; current generic governed-account enforcement remains proposed and untested.',
  '[Checkov documentation](https://www.checkov.io/1.Welcome/What%20is%20Checkov.html) illustrates static supported-IaC policy inspection; the product is not installed, chosen or run. [Ansible playbooks](https://docs.ansible.com/projects/ansible-core/devel/playbook_guide/playbooks_intro.html) can declare configurations and orchestrate deployment, supporting the m638 overlap hold. Neither universal misconfiguration detection nor exclusive declarative/imperative taxonomy follows.',
  '[Kubernetes service accounts](https://kubernetes.io/docs/concepts/security/service-accounts/) describe workload identity and usable-token checks; [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) describes authorisation. The m451 credential-effect premise is retained without retrieving a token, observing cluster takeover or assuming memory/quotas/image verification are automatically changed.',
  '## Preserved holds and remaining work',
  'All earlier source-bound holds remain, including m134 zero-day unknownness/numbered gap and m014 SoD permission exclusivity; m707/m258 whole 2.4 scope, m710 combined reflection decision and m050 DNS-target/BGP; m442 document chain, m633 typo/lookalike and m441 DNS/DGA; m024 authentication, m049 distribution/contrasts, m094 kernel/exclusive concealment and m125/m256/m268 definition scope; m305/m046/m432/m135, four objective 2.3 feedback holds, and prior actor/supplier, crypto/PKI, channel, Unicode, PBQ grading, targeting and delivery qualifications. New 3.1 judgments do not clear these or invent alternate scope.',
  'Objective 3.1 remaining PBQs: **p016, p022, p047, p077**, with their feedback; ten deferred MCQs have their feedback, and 113 support records remain. Objective 2.5 stays 30/66 pending with 36 support records remaining. Objective 2.4 stays 91/199 with 108 remaining (five PBQs p025/p027/p036/p066/p223, five feedback, 98 support); objective 2.3 stays 60/162 with 102 remaining; objective 2.2 stays 61/134 with 73 remaining. No support census is promoted to substantive review.',
  'Private p017 remains sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42, unavailable/unreviewed and null trusted. Active package remains **1878 records / 435 identities; 489 unresolved mappings; 2954 review decisions; seven existing primary proposals**, SHA-256 056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97. All 25 release hashes stay unchanged. Protected private review, 36 unsupported local PBQ grammars, remaining bank/support coverage and owner decisions remain gates.',
  '**NOT READY.** LOCAL/OFFLINE/default-off/unwired/learner-invisible. Owner approval of precise scope, concepts, roles, family independence, difficulty, weights, evidence/calibration and useful teaching remains outstanding. No runtime/live/private/Phase3 changes, migration, activation, shadow writes, cohort, deployment or pricing/legal change.',
  '## Validation',
  'Run node '+scriptPath+' and npm run audit:content-mapping. Validate exact first twelve/ten deferred selection, 220-record census, 55 + 24 objective and 193 + 12 bank counts, two captured-snapshot replays, 36 wrong corrections and twelve actual shuffle/remap probes. **'+negativeMutationChecks+' rejected mutations** cover source/trusted-ID substitutions, captures/snapshots/null-authored drift, erased qualifications/holds, swapped/stale feedback, false scope/roles/components/weights/evidence/remediation, corrupted selection/census/denominators, prior-hold loss, source drift and forbidden payload export/activation. Full mapping suite: 29 tests and deterministic package check; 25 release hashes unchanged. Task-only **[skip deploy]** commit/push.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE31_PRIORITY_MCQS_NOT_READY',reviewedIds:ids,deferredIds:deferred.map(r=>r.questionId),newDispositions:24,bankProgress,objective31:packet.objective31Denominator,snapshotReplays:2,wrongCorrections:36,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
