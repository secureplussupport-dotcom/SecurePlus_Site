import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';

const scriptPath='scripts/audit-objective31-final-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json',reportPath='docs/phase-2b5-objective31-final-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json',firstPath='docs/drafts/phase-2b5-objective23-fastlane-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'d5d0a14185ff6c641a842a20378d443f531399c418c9f51f930425e08699c967');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
// Only substantive arrays overlay the frozen inventory; inspection references earn no credit.
for(const path of [firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json',basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
  assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const ranked=c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('3.1')&&!c.previous.has(r.recordId)).sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en'));
const selected=ranked,deferred=[],ids=["m650", "m017", "m148", "m021", "m061", "m149", "m154", "m161", "m058", "m298"];
assert.equal(selected.length,10);assert.deepEqual(selected.map(r=>r.questionId),ids);assert.deepEqual(selected.map(r=>r.priorityScore),[30,25,25,20,20,20,20,20,10,10]);
const meanings=[
  "Choose the shared-responsibility matrix/model as the offered resource for allocating customer/provider duties by cloud service layer, subject to service terms.",
  "Recognize guest OS patching and configuration as the normal customer duty in conventional IaaS, without assuming every managed service has the same agreement.",
  "Recognize guest OS patching and hardening as the normal customer duty for the stipulated AWS EC2 IaaS service; one combined layer-duty decision closely correlates with m017/m620.",
  "Recognize private cloud from exclusive use by one organisation; internal consumer tenancy and whole 3.1 definition-recall scope remain held.",
  "Recognize the explicitly physically disconnected control network as air-gapped; nonexclusive architectural contrasts and whole numbered recognition scope remain held.",
  "Choose CASB as the offered cloud-service discovery control category; data-source coverage and precise 3.1 control-selection scope remain held.",
  "Choose bounded VLAN/firewall restriction of required clinical traffic for stipulated unpatchable connected devices while validating safety and planning supported replacement; one combined decision.",
  "Recognize hybrid cloud from integrated distinct private/public clouds with coordinated workload movement, without assuming the label guarantees secure portability; whole numbered definition scope remains held.",
  "Recognize the provider-managed application offering as SaaS while retaining customer identity/access/settings/data duties; whole numbered definition scope remains held.",
  "Recognize the offered presentation/business/data structure label while holding logical-layer versus physical-tier ambiguity, nonexclusive patterns and whole numbered definition scope."
];
const holds=[
  "HOLD a responsibility matrix/model as one universal contract, proof of executed security work or a legal liability determination. Service model, selected features and agreement allocate duties; an SOW or SLA can contain the same allocation, so these documents are not mutually exclusive with a matrix. Risk appetite concerns acceptance, not itself a layer-duty map; a penalty clause is not a complete allocation. One compound matrix/model label is one resource-purpose decision, not two independent skills. Authored generic repeated-key wrong feedback is superseded by explicit purpose contrasts; imported QB1 provenance is an input label, not certification. Correlate with m017/m148/m620/m060; no provider, agreement, migration, patch, compliance or duty fulfilment is observed.",
  "HOLD the IaaS label as a complete service agreement, every provider as covering all network security, or customer patch ownership as proof of successful patching. Physical infrastructure/hypervisor duties differ from customer guest OS, apps, data, identities and virtual network policies; managed options may move the boundary. The stem does not explicitly stipulate unmanaged terms as m620 does, so conventional IaaS is an inference pending owner. Data-center spelling is not a new scenario; old always-provider and everything-above-hypervisor absolutes are superseded. One patch/configuration choice supplies no independent subcomponents. Closely correlate with m148 and m620 in one provisional layer-responsibility family. No cloud agreement, guest, physical host, patch or network policy is tested.",
  "HOLD EC2/IaaS duties as applying to every AWS managed service, host network ownership as every virtual policy, or patch/hardening responsibility as implemented protection. The stipulated service normally leaves guest OS/app/data/identity configuration with the customer; actual selected features and service terms still matter. One patch/hardening option is one duty choice, not separately measured abilities. Authored missing wrong feedback is replaced with three explicit layer contrasts; data-center spelling does not establish scenario novelty. Strong near-duplicate correlation with m017 and prior m620 does not create independent family evidence. No AWS resource, account, configuration, patch, provider action or safe guest is observed.",
  "HOLD private cloud as absence of all tenants or multitenancy risk. One exclusive organisation can contain multiple internal business-unit consumers; retained other-tenants wording is ambiguous about external organisations versus internal consumers. Private cloud can be operated by another party on or off premises; public services can offer dedicated resources. Community and hybrid describe other supplied criteria and can coexist in an organisation. Authored no-multitenancy-risk, always-logical public tenancy and public-required hybrid guarantees are superseded. HOLD whole 3.1 assessed scope because this asks a deployment definition rather than security-implication comparison; keep context without forcing another objective. No isolation, operator, tenancy, risk or cloud deployment is tested.",
  "HOLD physical disconnection as immunity to removable media, insider or supply-chain paths; the absence of wired/wireless paths between networks is a supplied premise, not empirically checked. Segmentation may be physical, and an isolated enclave can communicate internally or apply internal DMZ/Zero Trust controls, so the retained opposite-isolation and within-organisation contrasts are not exclusive architectural taxonomy. Internet disconnection alone would not establish a physical air gap; current stem is more explicit than the authored version. Authored highest-isolation guarantee is superseded but retained contrasts still need qualification. HOLD whole 3.1 scope for architecture naming rather than security implications. Correlate with m020/m619/m251/m706 without treating logical segmentation or forwarded DNS as physical isolation. No plant, network route, media, compromise, safety state or Zero Trust control is tested.",
  "HOLD a CASB category label as universal shadow-service visibility, mandatory inline deployment, automatically approved/blocked services or compliance. Discovery depends on available traffic/log/API/endpoint data, catalogue coverage, permissions and supported integrations; off-network use and unknown applications can be missed. NGFWs can discover cloud apps, DLP may be part of a CASB and SIEM can analyse supplied usage, so these are bounded purpose contrasts rather than exclusive product capabilities. Authored always-inline and no-NGFW-visibility claims are superseded; three wrong corrections are now explicit. HOLD exact 3.1 numbered scope because this selects a control category without comparing architectural security implications; retain cloud context without forcing another code. No logs, tenant, API grants, product, policy, block, user attribution or discovered service is observed.",
  "HOLD a VLAN label as sufficient containment, permitted clinical traffic as safe, antivirus/GPO support or incompatibility as universal, or all network shutdown as always appropriate. The offered combined VLAN/firewall rule retains required clinical paths, which still need enforcement and may carry attacks; validate device compatibility, safety and availability, and plan supported replacement. The fiction stipulates unpatchability, not a fact about all connected medical devices. One combined control choice does not independently measure segmentation, firewall policy or clinical rule design. Authored cannot-reach-any-system guarantee and categorical embedded-agent/GPO claims are superseded. Difficulty hard-to-medium remains observed, uncalibrated. Correlate with m020 safety-constrained mitigation without new family independence. No medical device, patient workflow, patch, firewall, allowed path, replacement or safety outcome is tested.",
  "HOLD hybrid cloud as always private-plus-public, always on premises, any use of unrelated providers, or a guarantee of sovereignty, elasticity or secure workload migration. This stem explicitly supplies distinct private/public clouds and integration; NIST also permits other combinations of distinct deployment types. Binding for movement differs from measured portability, access control, confidentiality, availability or costs. Current private-cloud wording corrects authored infrastructure-only shorthand; current feedback removes automatic location/scaling benefits and adds three contrasts. HOLD whole 3.1 definition-recognition scope; retain architecture context without forced alternate codes. Correlate cloud definitions and m650 responsibility purpose without independent scenario credit. No integration, migration, provider, workload, location or security posture is tested.",
  "HOLD provider-managed SaaS application layers as outsourcing all customer security. Identities, access, settings, data and selected agreement features remain duties; extensions can coexist with customer applications/functions. IaaS, PaaS and FaaS are offered responsibility/purpose contrasts, not a rigid ordinal ranking of every service; function runtime duties vary by management mode. Authored customer-only-account shorthand and FaaS-between-IaaS/PaaS ranking are superseded. HOLD whole 3.1 definition scope because service-name recognition alone does not compare security implications, even when feedback usefully describes layer duties. No service, runtime, provider, agreement, application or function is deployed or tested.",
  "HOLD three logical layers as proof of three physically separate deployment tiers, strict adjacent-only communication or measured blast-radius reduction. Layers may share a physical tier, and open/relaxed designs may skip intermediate layers; enforcement determines permitted paths. Microservices, SOA and event-driven patterns can coexist with layer/tier organisation rather than being exclusive opposites. Current main feedback qualifies security by restrictions but the retained stem only names logical layers, leaving the keyed physical-tier terminology gap. Authored automatic adjacency/containment claims are superseded and three wrong corrections are added. HOLD whole 3.1 definition scope with context only, without forcing another objective. No architecture deployment, API, database path, workload isolation or protection is tested."
];
const mainTeaching=[
  "A responsibility matrix/model maps agreed customer/provider layer duties; actual scope depends on service terms and selected features.",
  "Conventional IaaS normally assigns guest OS/app configuration to the customer and underlying physical/hypervisor operation to the provider.",
  "The specified EC2 service normally leaves guest patching/hardening with the customer; provider infrastructure ownership does not remove customer configuration duties.",
  "Private cloud is exclusive to one organisation, potentially with several internal consumers and third-party operation; exclusivity is not automatic security.",
  "Physical network separation describes an air gap but does not remove media, insider or supply-chain risks; other internal architectures can coexist.",
  "CASB discovery can use logs, APIs or traffic integrations rather than always sitting inline; discovery coverage and enforcement remain separate.",
  "Restrict required clinical connectivity with tested enforcement and preserve safety/availability while planning supported replacement; segmentation is not immunity.",
  "Hybrid combines integrated distinct cloud environments; mere concurrent provider use or ordinary on-premises infrastructure does not establish the definition.",
  "SaaS provides the managed application while customer access, identity, settings and data duties remain agreement-dependent.",
  "Presentation, business logic and data describe logical layers; physical tier separation and enforced communication require additional premises."
];
const contrasts=[
  [
    "Risk appetite concerns risk acceptance rather than itself mapping customer/provider layer duties.",
    "An SLA penalty clause concerns service remedies rather than being a complete responsibility allocation.",
    "An SOW can contain obligations or a matrix, but the offered matrix/model specifically maps layer duties; documents can overlap."
  ],
  [
    "Physical data-center security normally belongs to the IaaS provider, unlike guest configuration.",
    "The underlying hypervisor is normally provider-operated in conventional IaaS; managed exceptions depend on terms.",
    "Physical network hardware normally belongs to the provider; customer virtual-network policy remains separate."
  ],
  [
    "Physical host hardware operation differs from customer guest OS patching in the supplied EC2 service.",
    "The provider normally operates the underlying hypervisor rather than the customer guest.",
    "Physical data-center access controls are provider duties, separate from customer OS/application access configuration."
  ],
  [
    "Public cloud general-market availability differs from exclusive organisation use; dedicated public resources do not make tenancy a universal physical distinction.",
    "Community cloud serves a defined shared-concern community rather than only the stipulated exclusive organisation.",
    "Hybrid requires integration of distinct clouds; exclusivity alone does not establish integration and public cloud is not always required."
  ],
  [
    "A DMZ controls interzone paths; the retained opposite-isolation wording is held because an air-gapped enclave can have internal zones.",
    "Segmentation divides networks and may use physical separation; internal communication does not disprove disconnection from other networks.",
    "Zero Trust concerns explicit access verification and can coexist within a physically isolated architecture."
  ],
  [
    "NGFWs can recognise cloud applications; the offered CASB has a more specific cloud-service discovery purpose, subject to data sources.",
    "DLP primarily concerns sensitive-data use/movement and can be integrated with cloud-service discovery rather than being an exclusive alternative.",
    "A SIEM analyses supplied records and rules; visibility depends on inputs, while the offered CASB purpose is cloud-service usage discovery."
  ],
  [
    "A flat corporate network increases reachable exposure; an agent may be unsupported and is not sufficient isolation by itself.",
    "Disconnecting all communication may disrupt required clinical use; restrict validated necessary paths rather than assume shutdown is safe.",
    "Windows GPO compatibility cannot be assumed for every embedded device; enforcement and device support require validation."
  ],
  [
    "Public cloud alone does not describe the stipulated binding of distinct private and public clouds.",
    "Private cloud alone does not describe the supplied integrated public-cloud component.",
    "Community membership criteria differ from the supplied integration of distinct clouds, though deployment types may combine."
  ],
  [
    "IaaS normally leaves guest OS/application duties with the customer rather than delivering this complete provider-managed application.",
    "PaaS supports customer-developed/deployed applications rather than necessarily delivering the stipulated complete application.",
    "FaaS runs customer functions on a managed service and is not necessarily a complete provider end-user application or a fixed intermediate rank."
  ],
  [
    "Microservices concern independently deployable services and can coexist with layers/tiers; the three roles alone do not establish that pattern.",
    "SOA concerns reusable service organisation and can coexist with logical layers rather than being an exclusive opposite.",
    "Event-driven architecture concerns event-mediated communication and can coexist with layers; it does not by itself specify physical tiers."
  ]
];
const families=[
  "service-agreement-layer-responsibility",
  "service-agreement-layer-responsibility",
  "service-agreement-layer-responsibility",
  "exclusive-organisation-cloud-model-recognition",
  "physical-network-isolation-recognition",
  "cloud-service-discovery-control-choice",
  "safety-constrained-unsupported-controller-mitigation",
  "integrated-distinct-cloud-model-recognition",
  "provider-managed-application-service-recognition",
  "presentation-logic-data-structure-recognition"
];
const preciseHolds=[
  null,
  null,
  null,
  "private_cloud_tenant_polysemy_and_whole_numbered_definition_scope",
  "air_gap_segmentation_and_DMZ_contrasts_not_exclusive_and_numbered_recognition_scope",
  "exact_numbered_CASB_control_selection_scope",
  null,
  "whole_numbered_hybrid_model_definition_scope",
  "whole_numbered_SaaS_model_definition_scope",
  "logical_layers_not_physical_tiers_and_whole_numbered_definition_scope"
];
const roles=[
  "layer_responsibility_resource_purpose_choice",
  "normal_IaaS_guest_layer_duty_recognition",
  "EC2_guest_patch_hardening_one_layer_duty_choice",
  "private_cloud_definition_tenant_polysemy_scope_held",
  "physical_air_gap_name_nonexclusive_contrasts_scope_held",
  "cloud_discovery_control_category_exact_scope_held",
  "one_safety_constrained_combined_clinical_connectivity_choice",
  "integrated_cloud_definition_whole_scope_held",
  "provider_application_service_definition_whole_scope_held",
  "logical_layers_physical_tiers_definition_scope_held"
];
const scopes=[
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
assert.equal(selected.filter(r=>r.flags.stemChanged).length,5);assert.equal(selected.filter(r=>r.flags.optionsChanged).length,2);assert.deepEqual(selected.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m650']);
const questionProposals=selected.map((row,i)=>{
  const s=c.questions.get(row.recordId),q=s.q,shuffled=shuffle(q);assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);
  assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
  for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
  assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert(s.authored);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);assert.equal(q.correct,s.authored.correct);

  return{recordId:row.recordId,questionId:q.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:false,sourceLayerDisposition:'authored_equals_preeditorial_but_differs_from_effective',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',assessedUnderstanding:meanings[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],skillRoleProposal:roles[i],numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:families[i],familyStatus:'provisional_comparison_no_independence_approval',optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0}};
});
assert.equal(questionProposals.filter(r=>r.snapshotReplayChecked).length,0);assert.equal(questionProposals.filter(r=>r.revisions.authored===null).length,0);
const explanationProposals=questionProposals.map((parent,i)=>{
  const s=c.questions.get(parent.recordId),q=s.q,indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct);assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
  return{recordId:'explanation:'+parent.recordId,kind:'explanation_bundle',parentId:parent.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:parent.sourceRevision,parentPublishedRevision:parent.publishedRecordSignature,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:mainTeaching[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],withheldPreciseContrast:preciseHolds[i],roleProposal:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:contrasts[i][k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId)),broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('3.1')),old=broad.filter(r=>c.previous.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id)),counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
assert.equal(broad.length,220);assert.equal(old.length,79);assert.equal(selectedIds.size,20);assert.equal(remaining.length,121);assert.equal(broad.filter(r=>r.kind==='mcq').length,22);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);assert.equal(remaining.filter(r=>r.kind==='pbq').length,4);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,4);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,priorQuestions=bankRows.filter(r=>c.previous.has(r.recordId)),priorFeedback=bankRows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorQuestions.length,205);assert.equal(priorFeedback.length,205);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,priorQuestions:205,newQuestions:10,combinedQuestions:215,remainingQuestions:268,combinedMcqs:199,remainingMcqs:196,combinedLocalPbqs:16,remainingLocalPbqs:72,pairedFeedbackCombined:215,pairedFeedbackRemaining:268};
assert.equal(priorQuestions.filter(r=>r.kind==='mcq').length + 10,bankProgress.combinedMcqs);assert.equal(priorQuestions.filter(r=>r.kind==='pbq').length,16);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective31PriorityHeldDispositions:base.explanationProposals.filter(r=>r.withheldPreciseContrast).map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal}))};
const legacy24=priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds,old23=legacy24.earlierHolds;
assert.equal(old23.objective23Holds.m305WholeScopeHold.objectiveScopeProposal.status,'held_whole_numbered_mitigation_choice_scope');assert.equal(old23.objective23Holds.priorHolds.m046HeldContrast,'named_individual_requirement_in_spear_phishing_wrong_feedback');assert.equal(old23.objective23Holds.priorHolds.m432WholeNumberedScopeHeld,true);assert.equal(old23.objective23FeedbackHolds.length,4);assert.equal(legacy24.objective24HeldDispositions.length,4);assert.equal(priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.objective24SecondHeldDispositions.length,3);assert.equal(priorHolds.inheritedHolds.inheritedHolds.objective24FinalHeldDispositions.length,6);assert.deepEqual(priorHolds.inheritedHolds.objective25HeldDispositions.map(r=>r.withheldPreciseContrast),['zero_day_unknownness_and_numbered_gap_scope','separation_of_duties_permission_scope_exclusivity']);
assert.equal(priorHolds.objective31PriorityHeldDispositions.length,5);
const comparisonSpecs=[
  {
    "ids": [
      "mcq:m650",
      "mcq:m017",
      "mcq:m148",
      "mcq:m620",
      "mcq:m060",
      "mcq:m058",
      "glossary:sla",
      "glossary:sow"
    ],
    "meaning": "m017/m148 are strongly correlated conventional-IaaS duty choices, with m620 closely related and m060 the PaaS layer contrast; m650 maps agreed duties and m058 names a managed application service. One provisional responsibility family gives zero independent credit. SOW/SLA can contain allocations, selected features change boundaries, and no legal duty fulfilment or patch outcome is observed."
  },
  {
    "ids": [
      "mcq:m021",
      "mcq:m161",
      "mcq:m294",
      "mcq:m065",
      "mcq:m296"
    ],
    "meaning": "Private/public/hybrid deployment definitions differ from internal-control choice and regional enforcement. Exclusive organisational use permits internal consumers, hybrid requires binding distinct clouds, and no label supplies automatic location, tenancy or security guarantees. Preserve earlier definition/regional scope holds; new definitions do not inherit m065 control understanding."
  },
  {
    "ids": [
      "mcq:m061",
      "mcq:m154",
      "mcq:m020",
      "mcq:m619",
      "mcq:m251",
      "mcq:m706",
      "mcq:m138",
      "mcq:m133",
      "mcq:m014",
      "mcq:m113"
    ],
    "meaning": "Physical air-gap naming, logical segmentation, safety-constrained required connectivity and enforced path/permission reasoning are distinct. Segmentation/DMZ/Zero Trust can coexist internally with physical isolation; forwarded DNS is not physical separation. Medical and industrial composite mitigation choices correlate without independent components or verified safety. Preserve SoD and permitted-path/containment holds."
  },
  {
    "ids": [
      "mcq:m149",
      "mcq:m261",
      "glossary:ngfw",
      "glossary:waf"
    ],
    "meaning": "Cloud-service discovery depends on data sources, while offered network/request inspection has other scope. Integrated controls overlap; category names do not prove universal visibility or enforcement. Preserve m261 stipulated decoding/inspection limits and cloud-control numbered scope hold without new products or observed traffic."
  },
  {
    "ids": [
      "mcq:m298",
      "mcq:m638",
      "mcq:m157",
      "mcq:m417",
      "mcq:m619",
      "mcq:m138",
      "mcq:m065"
    ],
    "meaning": "Layer/tier pattern recognition, IaC definition and VLAN naming do not independently establish implemented boundaries, scan enforcement or restricted paths. Logical layers can share physical tiers and styles can coexist; IaC/playbooks overlap and available paths still matter. Preserve prior whole-definition and correlated scan-family holds."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids,comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const r=c.records.get(id),p=c.previous.get(id);assert(r);return{recordId:id,sourceRevision:r.sourceSignature,localRevision:r.localRevisionSignature??null,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null,status:selectedIds.has(id)?'current_substantive_disposition':p?'prior_disposition_reference_only':'inspection_only_no_new_credit'};}),newFamilyCredit:0,independenceApproved:false}));
const priorBatchComparisons=base.questionProposals.map(r=>{assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);return{recordId:r.recordId,sourceRevision:r.sourceRevision,publishedRecordSignature:r.publishedRecordSignature,feedbackRevision:c.records.get('explanation:'+r.recordId).sourceSignature,priorDecisionRevision:sig(r),status:'prior_substantive_reference_no_new_credit'};});
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'2f324714f5517896b3b94fac0962cdeb903bc748',sourceBindings:[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective31-priority-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective31-priority-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)}],triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,baselinePriorQuestions:125,substantiveOverlayPackets:[firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json',basePath].map(path=>({path,sha256:hashFile(path)})),currentPriorQuestions:205},bankSignature:c.ledger.bankSignature,selectionPolicy:'Final 10 undispositioned objective 3.1 MCQs by existing triage priority then record ID; structural cues do not prove correctness or semantic error',selectedQuestionRecordIds:ids.map(id=>'mcq:'+id),selectedFeedbackRecordIds:ids.map(id=>'explanation:mcq:'+id),deferredObjective31QuestionRecordIds:deferred.map(r=>r.recordId),questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorBatchComparisons,priorHolds,objective31Census:census,objective31Denominator:{broadCandidates:220,priorAgentDispositions:79,newAgentDispositions:20,combinedAgentDispositions:99,remaining:121,remainingByKind:counts(remaining)},remainingObjective31RecordIds:remaining.map(r=>r.id),bankProgress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};

function validate(value){
  assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);assert.deepEqual(value.sourceBindings,packet.sourceBindings);
  assert.deepEqual(value.selectedQuestionRecordIds,selected.map(r=>r.recordId));assert.deepEqual(value.selectedFeedbackRecordIds,selected.map(r=>'explanation:'+r.recordId));assert.deepEqual(value.deferredObjective31QuestionRecordIds,deferred.map(r=>r.recordId));
  assert.equal(new Set([...value.questionProposals,...value.explanationProposals].map(r=>r.recordId)).size,20);assert.equal(value.questionProposals.length,10);assert.equal(value.explanationProposals.length,10);
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
for(let i=0;i<10;i++){
  reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);
  reject(p=>p.questionProposals[i].trustedRevisionId=p.questionProposals[i].revisions.trustedCompilerObserved);
  reject(p=>p.questionProposals[i].contentQualification='');
  reject(p=>p.questionProposals[i].revisions.authored=null);
  reject(p=>p.questionProposals[i].snapshotReplayChecked=true);
  reject(p=>p.questionProposals[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);
  reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);
  reject(p=>p.explanationProposals[i].parentLocalRevision=p.questionProposals[(i+1)%10].sourceRevision);
  reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%10].sourceRevision);
  for(let k=0;k<3;k++)reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');
}
for(const [i,h]of preciseHolds.entries())if(h){reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);reject(p=>p.questionProposals[i].objectiveScopeProposal.assessedCodes=['3.1']);}
// Each inherited contrast is independently removable in a negative probe; the full chain stays bound.
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);
for(const path of holdPaths)reject(p=>{let target=p.priorHolds;for(const key of path.slice(0,-1))target=target[key];target[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{const old=p.priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
reject(p=>p.questionProposals[0].newFamilyCredit=1);reject(p=>p.questionProposals[0].humanApproved=true);reject(p=>p.questionProposals[0].primaryConceptProposal='invented');reject(p=>p.questionProposals[0].independentEvidence=true);
reject(p=>p.explanationProposals[0].deliveryGate='free_before_submission_all_options');reject(p=>p.explanationProposals[0].approvedRemediation=true);reject(p=>p.explanationProposals[0].distractorCorrections[0].assessedSecondary=true);reject(p=>p.explanationProposals[0].masteryWeight=1);
reject(p=>p.selectedQuestionRecordIds[9]=selected[0].recordId);reject(p=>p.questionProposals.pop());reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.deferredObjective31QuestionRecordIds.push(selected[0].recordId));
reject(p=>p.objective31Census.pop());reject(p=>p.objective31Census.push(p.objective31Census[0]));reject(p=>p.objective31Census.find(r=>r.recordId===remaining[0].id).status='new_agent_disposition_pending_owner');reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.separateAssessmentDenominator.privateVariants=0);
reject(p=>p.priorBatchComparisons.pop());reject(p=>p.questionProposals[0].objectiveScopeProposal={assessedCodes:['3.1','2.4'],contextCodes:[],status:'approved'});reject(p=>p.questionProposals[6].skillRoleProposal='observed_safe_clinical_containment');reject(p=>p.sourceBindings[0].sha256='stale');reject(p=>p.activationAllowed=true);for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
packet.negativeMutationChecks=negativeMutationChecks;
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(packet,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),packet,'Packet/source disposition drift');
const report=[
  '# Phase 2B-5 — objective 3.1 final MCQs and feedback',
  '**NOT READY.** Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. This finite packet, report and focused audit reuse existing source-bound helpers; no runtime, configuration, package or duplicate bank ledger change.',
  '## Exact selection and census',
  '**Final ten** undispositioned effective objective 3.1 MCQs in deterministic priority-descending/record-ID order: **'+ids.join(', ')+'**, with ten paired feedback bundles (**20 new pending agent judgments**). No further tagged 3.1 MCQ or MCQ-feedback remains undispositioned. All effective stems, choices, keys, main and three wrong corrections and authored/preeditorial inputs were read locally; structural triage only orders review.',
  'Objective 3.1 broad source-tag union: **220 records; 79 prior + 20 new = 99 pending agent dispositions; 121 remain**. Prior 79 comprise twelve MCQs, twelve feedback, one deck container, 24 flashcards and 30 glossary definitions. All **22 tagged MCQs and 22 paired feedback** now have pending agent judgments, including holds; this is neither owner approval nor complete objective coverage. Remaining: four local PBQs, their four feedback and **113 support/instructional records**.',
  '| Remaining kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
  'Bank: **205 prior + 10 new = 215/483 questions** and 215 paired feedback judgments pending owner. These are **199/395 MCQs + 16/88 local PBQs**. **268 questions and 268 paired feedback remain**, comprising **196 MCQs + 72 local PBQs**. Two private variants, nine starter assessments and two guest demos stay separate; census and comparison references receive zero substantive credit.',
  '## Ten substantive judgments',
  '| ID | Priority | Effective understanding | Qualification |\n| --- | ---: | --- | --- |\n'+questionProposals.map(r=>'| '+r.questionId+' | '+r.sourcePriority+' | '+r.assessedUnderstanding+' | '+r.contentQualification+' |').join('\n'),
  '## Source precedence and every correction',
  'All ten have authored inputs, with authored revisions equal to preeditorial and different from effective editorial revisions. No selected question has a captured override or published snapshot; no captured-snapshot replay is claimed. Imported provenance occurs only for m650 (QB1 question 50), an observed input label rather than external certification. Five authored stem differences are m021/m061/m149/m154/m161; m021/m149/m154 include spelling changes, m061 adds explicit physical disconnection and m161 clarifies private-cloud rather than generic infrastructure. Two option-list differences are m017/m148 data-centre spelling, not new scenarios. All keyed indices remain unchanged, which does not establish unchanged meaning.',
  'm650 replaces repeated generic key-based wrong feedback with specific duty-resource contrasts and changes observed medium to easy. m017 bounds everything-above-hypervisor and always-provider absolutes; m148 adds three authored-missing wrong corrections. m021 removes no-multitenancy-risk, public-only-logical and hybrid-must-public claims, but retains ambiguous other-tenants language. m061 improves physical-separation premises and residual-risk teaching but retains nonexclusive DMZ/segmentation contrasts. m149 removes mandatory-inline and absent-NGFW-visibility claims and adds three explicit wrong corrections. m154 replaces universal containment/agent claims with required clinical paths and tested safety, changing observed hard to medium. m161 removes assumed on-premises sovereignty/elasticity and adds three wrong corrections. m058 removes a false fixed FaaS ranking and narrows customer-duty shorthand. m298 adds three wrong corrections and qualifies path protection while retaining logical-layers versus physical-tiers ambiguity. Every difficulty label is observed and uncalibrated.',
  explanationProposals.map((r,i)=>'**'+ids[i]+' main:** '+r.mainTeachingUnderstanding+' Three wrong-option contrasts: '+r.distractorCorrections.map(d=>d.teachingRationale).join(' ')).join('\n\n'),
  '**30 effective wrong corrections** bind exact choice/correction/main/bundle/parent-local/parent-published revisions. Six explicit holds cover m021 tenancy/definition scope, m061 nonexclusive isolation contrasts/recognition scope, m149 exact CASB-control numbered scope, m161 hybrid-definition scope, m058 SaaS-definition scope and m298 logical-layer/physical-tier ambiguity/definition scope. Other four narrow 3.1 responsibility or safety-tradeoff scope proposals remain inferred pending owner. No forced alternate objective or assessed secondary concept, independent subcomponent, implemented remediation or observed recovery.',
  'All ten actual fixed-randomness pure shuffles preserve keyed choice, choice multiset and wrong-feedback remapping. MCQPractice/shuffle/wrong-feedback source units and practice selector match prior bindings. Main feedback requires submitted Pro; wrong feedback is conditional on the selected wrong option. Pool/set/guest delivery, browser entitlement/tooltip/disabled-option interaction and learner outcomes remain unobserved. No React, grading/session/storage/sync, telemetry, cloud/API, log, product, clinical/controller, provisioning, network, attack or recovery handler executes.',
  '## Correlation and primary references',
  comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
  'The prior twelve objective 3.1 questions have individual source/feedback/prior-decision references, with all five precise holds retained. m017/m148 are strongly correlated near-duplicates of normal IaaS layer duties; m650/m017/m148/m620/m060 share a provisional responsibility family. m154 reuses the provisional safety-constrained mitigation family with m020 without declaring different industries independent. Compound matrix/model, patch/configuration, patch/hardening and VLAN/firewall answers remain one keyed decision each. Definitions inherit neither implemented controls nor approved scenario independence. Canonical concepts, approved roles/families, calibrated difficulty, weights, eligible evidence, human approval, teaching publication and activation remain zero/null/false.',
  '[CompTIA SY0-701 v7 §3.1](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) asks for architecture security-implication comparisons, including cloud responsibility, hybrid, isolation and embedded/industrial systems with patch and availability considerations. Definitions and CASB category choice do not by themselves establish whole numbered comparison scope. Scope proposals here remain pending owner rather than official certification or automatic reassignment.',
  '[NIST SP800-145](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf) defines private cloud as exclusive organisational use that can include internal consumers and outside operation, and hybrid as binding distinct cloud types. Its service-layer distinctions bound IaaS/PaaS/SaaS recognition without declaring uniform security agreements. [AWS shared responsibility](https://aws.amazon.com/compliance/shared-responsibility-model/) describes EC2 guest OS/application and customer configuration duties alongside provider infrastructure duties; neither source verifies actual patches, protections or legal liability.',
  '[NIST SP800-82r3](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-82r3.pdf) discusses physical/logical segmentation, enforced necessary paths, tested changes and operational safety. [NIST SP800-41r1](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-41r1.pdf) describes DMZ/interzone policy. Our overlap judgment is an inference from those architectural distinctions: internal segmentation/DMZ policy is not excluded by absence of external network connections. These sources do not validate a medical device, plant safety or actual air gap.',
  '[Microsoft cloud-discovery API](https://learn.microsoft.com/en-us/defender-cloud-apps/api-discovery) describes uploaded firewall/proxy logs; [shadow-IT discovery](https://learn.microsoft.com/en-us/defender-cloud-apps/tutorial-shadow-it) discusses available discovery sources and catalogue limits; [endpoint integration](https://learn.microsoft.com/en-us/defender-cloud-apps/mde-integration) illustrates endpoint-based visibility without universal inline placement. This bounds m149 discovery and overlap teaching; a particular product capability neither proves all CASBs see every service nor constitutes selected or tested deployment.',
  '[AWS Lambda runtime responsibility](https://docs.aws.amazon.com/lambda/latest/dg/runtime-management-shared.html) distinguishes update duties by management mode; [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) retains customer code/dependency responsibilities. This qualifies FaaS layer shorthand without reinstating a false ordinal service-model ranking or running customer functions.',
  '[Microsoft N-tier architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/n-tier) distinguishes logical layers from physical tiers, allows layers on one tier and strict/relaxed communication designs. This directly supports the retained m298 terminology and automatic-adjacency holds. Different architectural styles may coexist; that coexistence judgment is an inference, not an observed deployment.',
  '## Preserved holds and remaining work',
  'All five prior 3.1 holds remain: m714 attestation scope/coverage/freshness, m294 cloud-definition scope, m296 regional policy scope/exceptions, m619 logical-isolation premise/recognition scope and m638 IaC/playbook overlap/definition scope. Preserve all earlier source-bound holds: m134 zero-day unknownness/numbered gap and m014 SoD permission exclusivity; m707/m258 whole 2.4 scope, m710 combined reflection decision and m050 DNS-target/BGP; m442 document chain, m633 typo/lookalike and m441 DNS/DGA; m024 authentication, m049 distribution/contrasts, m094 kernel/exclusive concealment and m125/m256/m268 definition scope; m305/m046/m432/m135, four objective 2.3 feedback holds, actor/supplier, crypto/PKI, channels, Unicode, PBQ grading, targeting and delivery qualifications. No new judgment clears an earlier hold.',
  'Objective 3.1 remaining: local PBQs **p016, p022, p047, p077**, their four feedback and 113 support records; no undispositioned tagged MCQ or MCQ feedback remains. Objective 2.5 stays 30/66 pending with 36 support remaining. Objective 2.4 stays 91/199 with 108 remaining (five PBQs p025/p027/p036/p066/p223, five feedback, 98 support); objective 2.3 stays 60/162 with 102 remaining; objective 2.2 stays 61/134 with 73 remaining. Support census is not substantive review.',
  'Private p017 remains sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42, unavailable/unreviewed and null trusted. Active package remains **1878 records / 435 identities; 489 unresolved mappings; 2954 review decisions; seven existing primary proposals**, SHA-256 056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97. All 25 release hashes remain unchanged. Protected private review, 36 unsupported local PBQ grammars, remaining bank/support coverage and owner decisions remain gates.',
  '**NOT READY.** LOCAL/OFFLINE/default-off/unwired/learner-invisible. Owner approval of precise scope, concepts, roles, family independence, difficulty, weights, evidence/calibration and useful teaching remains outstanding. No runtime/live/private/Phase3 changes, migration, activation, shadow writes, cohort, deployment or pricing/legal change.',
  '## Validation',
  'Run node '+scriptPath+' and npm run audit:content-mapping. Validate exact final ten selection/empty deferral, 220-record census, 79 + 20 objective and 205 + 10 bank counts, absence of selected captures/snapshots, 30 wrong corrections and ten actual shuffle/remap probes. **'+negativeMutationChecks+' rejected mutations** cover source/trusted-ID substitutions, false captures/replays/null-authored input, erased qualifications/holds, swapped/stale feedback, false scope/roles/components/weights/evidence/remediation, corrupt selection/census/denominators, every inherited precise hold, source drift, forbidden payload export and activation. Full mapping suite: 29 tests and deterministic package check; 25 release hashes unchanged. Task-only **[skip deploy]** commit/push.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE31_FINAL_MCQS_NOT_READY',reviewedIds:ids,deferredIds:deferred.map(r=>r.questionId),newDispositions:20,bankProgress,objective31:packet.objective31Denominator,snapshotReplays:0,wrongCorrections:30,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
