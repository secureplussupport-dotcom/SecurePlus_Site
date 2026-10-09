import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';

const scriptPath='scripts/audit-objective32-final-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json',reportPath='docs/phase-2b5-objective32-final-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json',firstPath='docs/drafts/phase-2b5-objective23-fastlane-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'df3a8f73b10d91d50b3cc37b1eb5571b56cc7b02211ee025c1ee22ee3afa071a');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
// Only substantive arrays overlay the frozen inventory; inspection references earn no credit.
for(const path of [firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json',basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
  assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const ranked=c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('3.2')&&!c.previous.has(r.recordId)).sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en'));
const selected=ranked,deferred=[],ids=["m063", "m147", "m152", "m153", "m286", "m292", "m095", "m097", "m151", "m291"];
assert.equal(ranked.length,10);assert.deepEqual(selected.map(r=>r.questionId),ids);assert.deepEqual(selected.map(r=>r.priorityScore),[20,20,20,20,20,20,10,10,10,10]);
const meanings=[
  "Choose the stipulated application-scoped partner access control over offered broad VPN connectivity or unqualified placement/peering; a ZTNA label and all-alternative reach claim remain qualified.",
  "Choose enforced guest-to-corporate deny rules with required internet access over wireless-link or naming controls; one combined segmentation/firewall decision.",
  "Recognize the specified per-port MAC limit and shutdown policy as port security, not strong identity verification; whole numbered feature-name scope remains held.",
  "Recognize encryption-enabled ESP transport mode from protected original payload and retained outer IP header; AH/GRE distractor mode labels remain held.",
  "Choose the dedicated HTTP request-parameter inspection control for the stipulated SQL-injection filtering requirement, with TLS visibility and coding controls still required.",
  "Choose the offered combined VLAN/inter-VLAN ACL boundary on shared infrastructure, with enforceable paths and unmeasured efficiency assumptions qualified.",
  "Recognize default-deny on failure as the offered fail-closed principle label; whole numbered naming scope and fail-safe equivalence remain held.",
  "Recognize the offered WAF application-attack inspection purpose; nonexclusive product features and the retained blanket insider/network contrasts remain qualified.",
  "Recognize the offered destination-IP forwarding role as a router; near-duplicate correlation with m056 and whole numbered definition scope remain held.",
  "Recognize the offered screened public-service subnet pattern; literal total isolation, universal two-firewall claims and whole numbered naming scope remain held."
];
const holds=[
  "HOLD ZTNA naming as already enforced least privilege, automatic authentication/reassessment or absence of exploitable application paths. The keyed option explicitly stipulates application-only access; selected identity/resource policy and enforcement still matter. The offered VPN explicitly grants full network reach, not every VPN design; peering supplies routes rather than automatic authorisation. An internet DMZ containing one app does not necessarily expose the whole internal network or give every partner more resource reach; the retained main all-alternatives-more-reach claim is broader than supplied facts. Identity/ACL controls can restrict DMZ/VPN/peering designs, and ZTNA can coexist with them. Authored universal VPN/peering-access claims are superseded but main grouping remains held. One app-access choice adds no independent identity, device or monitoring evidence. Observed hard-to-medium difficulty is uncalibrated. Correlate m065/m014/m113/m729 without approved family independence. No partner, identity, route, app, session, policy or authorised access is tested.",
  "HOLD a VLAN label, wireless encryption or configured rule name as proving no guest-to-corporate reachability. The current stem requests no permitted service path and required internet access; enforce and test rules across IPv4/IPv6, routing/trunks, alternate gateways, relays and exceptions. One segmentation/firewall option does not isolate independent Layer 2 and Layer 3 knowledge. WPA3 link protection and MAC identification/hidden SSID are different controls and can coexist with traffic boundaries. Authored regardless-of-guest-actions blanket containment is superseded by required-policy teaching; seven new feedback bundles include this row. Closely correlate m292 in one provisional guest-boundary family and prior m619/m133/m138/m154; logical separation is not an air gap, invulnerable switch or safe required path. No wireless client, switch, rule, internet access, reachability or attack is tested.",
  "HOLD a single permitted/learned MAC as a strong user/device identity, automatic prevention of rogue/VLAN attacks, every platform as supporting the same violation modes, or the feature name as a configured defence. The premise supplies one address and shutdown, not validated bindings, learning, ageing or recovery. MAC addresses can be spoofed; limits can also disrupt legitimate multi-device ports. DAI/DHCP snooping can share binding data or interact, and 802.1X authentication is a distinct criterion that may coexist rather than being an exclusive product alternative. Current main removes authored blanket prevention, adds explicit wrong corrections and preserves observed uncalibrated difficulty. HOLD whole 3.2 application scope for naming a supplied policy, retaining context without forcing another code; no independently assessed DAI, DHCP or authentication component. No switch, MAC, supplicant, violation, shutdown, recovery or rogue endpoint is tested.",
  "HOLD generic IPsec as always encrypting, transport mode as only host-to-host, tunnel mode as only site-to-site or an outer header as immutable/authenticated by ESP. The effective premise expressly enables ESP encryption between hosts, correcting the old unqualified mode/encryption and fixed-use shorthand. ESP protects its encapsulated next-layer payload plus applicable trailer fields, while original outer metadata lies outside ESP protection; some ESP header metadata also stays visible. Retained AH-mode and GRE-mode distractor labels mix IPsec modes with protocols, although current wrong feedback correctly distinguishes them. AH supplies authentication/integrity rather than confidentiality; GRE alone is separate encapsulation, and can be combined with protected tunnels. One layout/mode choice does not assess independent algorithms, AH/ESP/IKE, key exchange or PFS. Preserve m314/PFS/identity qualifications. No header, packet, tunnel, negotiation, key, encryption or protected traffic is tested.",
  "HOLD WAF as universally preventing SQL injection/XSS/CSRF or all application flaws, the HTTP control label as configured visibility, or all IPS/NGFW products as incapable of equivalent request inspection. The requirement asks for dedicated HTTP-parameter filtering; supported parsers, rules, body limits, TLS visibility, placement and blocking mode determine effectiveness. Secure coding/parameter binding and authorisation still matter; the keyed control is not proven remediation of underlying flaws. Authored unqualified CSRF/OWASP-wide and universal layer/granularity claims are not carried into current teaching; three explicit wrong corrections are added and observed domain 2 becomes effective 3.2. Strongly correlate m097 purpose/attack-class recognition and m261 specific decoding limits without independent family evidence. No payload, scanner, TLS inspection, WAF/IPS/NGFW product, rule, block or fixed flaw is tested.",
  "HOLD shared-switch VLAN labels as absolute isolation, every ACL as denying all guest routes, or most-efficient/cost-effective as measured for this organisation. The offered option explicitly combines Layer 2 separation and controlled routed access; actual permitted paths, trunk/port settings, alternative routes, IP versions and service exceptions need enforcement. Physical separation can work and might be appropriate; current shared-infrastructure framing favours logical configuration but supplies no budget, performance or lifecycle comparison. One composite VLAN/ACL option gives no separately scored components. Authored guaranteed blocking/universal cost-efficiency claims are superseded, while retained most-efficient wording remains unmeasured. Closely correlate m147 in one provisional family and prior m619/m133/m138/m154 path/safety holds. Wireless encryption and MAC controls do not automatically set inter-network authorisation. No switch, firewall, ACL, cost, performance, guest path or isolation is tested.",
  "HOLD fail-secure/fail-closed wording as a universal safe state, all failure forms as denying every path, or denying all access as always suitable. The stipulated access-denial posture describes this boundary while losing availability; safety, recovery and alternate paths require separate analysis. Fail-safe is not necessarily fail-closed, and physical/life-safety needs cannot be inferred from this generic system. Current main narrows authored secure-state/all-open claims; defence layers and least functionality may coexist without defining the supplied failure result. HOLD whole 3.2 applied-infrastructure scope for abstract principle-label recognition with context only; closely correlate m018 narrow inline-gateway behaviour without granting its deployment context here. One combined synonym option is one decision. Observed medium-to-easy difficulty is uncalibrated. No failure, gateway, access denial, outage, safety or recovery is tested.",
  "HOLD WAF as fixing every flaw, guaranteed detection/blocking of SQLi/XSS, one product as only Layer 7 functionality or every insider/database threat as categorically outside possible web inspection. The main correctly describes application-traffic purpose and supplementary coding/authorisation, but retained wrong feedback says insiders are not WAFs without specifying a direct database path. Direct database traffic is outside a standalone HTTP inspection path; an insider using covered web requests may encounter WAF rules, while identity/permissions and allowed-operation abuse remain separate. Integrated services may also provide network/DDoS controls; volumetric link saturation differs from application request floods, and network-origin/IP checks can coexist without fixing spoofing. Strongly correlate m286 WAF-purpose choice and m261 parser/visibility limits; authored domain 2 becomes effective 3.2 without independent scope approval. No store, actor, request, database connection, WAF, bandwidth saturation or block is tested.",
  "HOLD all switching products as Layer 2 only, physical repetition as complete behaviour of integrated devices, or a routing role as encryption/firewalling/secure placement. The expressly Layer 2 distractor limits the comparison; integrated switches can also route and actual forwarding policy needs configuration. Current feedback adds three explicit contrasts rather than claiming secure infrastructure from the device name. This is a strong near-duplicate of m056 IP-forwarding recognition with minor stimulus/distractor changes, not independent scenario evidence; use the same provisional family. HOLD whole 3.2 applied-security scope for pure role definition, retaining context without forced alternate code. No route, IP packet, signal, frame, forwarding table, device or secure topology is tested.",
  "HOLD a DMZ as universally requiring two physical firewalls, public-facing services as disconnected from the internet, any separated subnet as invulnerable or an inner firewall as automatically preventing compromise reaching every internal asset. The supplied screened subnet uses two boundaries, but DMZs can be built with a multi-interface firewall and VLANs; zoning and enforced rules control permitted traffic, which can still carry risk. Retained isolating-from-both wording means controlled separation, not no communication or a physical air gap. Core VLANs can implement the chosen architecture, while core segmentation alone lacks the specified public-service boundary; access-controlled designs can combine features. Authored automatic containment/two-firewall definition is superseded by bounded policy teaching. HOLD whole 3.2 applied-infrastructure scope for architecture naming with context only. Correlate m061/m619/m147/m292/m298 boundary holds; no firewall, server, rule, zone, public path, compromise or containment is tested."
];
const mainTeaching=[
  "The stipulated application-only policy meets the partner least-privilege aim when enforced; DMZ/peering alternatives need explicit identity/access controls rather than assumed uniform broad reach.",
  "Enforce and test guest-to-corporate deny rules while allowing required internet traffic; VLAN and wireless labels alone do not establish that boundary.",
  "Port security applies the specified MAC limit and violation action; address acceptance does not strongly establish user/device identity.",
  "Encryption-enabled ESP transport protects encapsulated next-layer content while leaving the original outer IP header outside ESP; AH does not encrypt and protocol labels are not modes.",
  "Dedicated WAF HTTP filtering supports the stipulated parameter inspection when visibility/rules are configured; it supplements coding and cannot fix every flaw.",
  "VLAN separation plus enforced inter-VLAN ACLs can restrict guest access on shared infrastructure; actual paths and relative efficiency require verification.",
  "The specified default-deny failure posture is fail-closed, with availability/safety tradeoffs rather than a universal secure or safe state.",
  "A WAF inspects covered web traffic for application patterns and supplements coding/authorisation; direct database traffic and covered insider requests have different paths.",
  "Destination-IP forwarding is the router role; the stipulated Layer 2 and physical roles contrast with routing, not with already implemented security.",
  "A screened service subnet uses enforced boundary rules; permitted paths remain and a DMZ need not always use two separate firewall devices."
];
const contrasts=[
  [
    "The offered VPN expressly grants full network access, unlike the app-only policy; more restricted VPNs are not excluded in general.",
    "Internet-accessible DMZ placement alone omits partner-specific authorisation; it need not expose the whole internal network or necessarily grant broader resource reach.",
    "Peering supplies routes rather than application-scoped permission by itself; access rules can restrict a real peering design."
  ],
  [
    "WPA3 protects the wireless link rather than automatically setting guest-to-corporate routed permissions.",
    "MAC filtering concerns address-based device admission and does not establish the requested routed guest-service boundary.",
    "SSID hiding does not enforce destination authorisation for an already connected compromised guest."
  ],
  [
    "DAI validates ARP/binding consistency rather than being the supplied one-MAC shutdown criterion.",
    "DHCP snooping filters DHCP sources/builds bindings rather than itself imposing this port MAC-count violation policy.",
    "802.1X authenticates access through its roles; a static/count-based MAC policy is a different feature and may coexist."
  ],
  [
    "ESP tunnel mode encapsulates the original packet and adds a new outer IP header rather than leaving the original header as the visible outer header.",
    "AH is an authentication/integrity protocol, not a confidentiality mode; the retained AH-mode label is held.",
    "GRE is separate encapsulation, not an IPsec mode or encryption by itself; it can be carried with protected tunnels."
  ],
  [
    "Conventional state tracking concerns connections rather than the dedicated HTTP-parameter rule engine requested.",
    "IPS features can inspect application attacks, so the offered WAF purpose is more specific rather than universally more capable.",
    "NGFW products may include HTTP protection; effectiveness depends on the deployed features rather than the category label alone."
  ],
  [
    "Different wireless encryption settings do not set routed authorisation on the shared infrastructure.",
    "Separate physical switches can implement a boundary; the shared-switch scenario favours logical isolation without a measured universal efficiency claim.",
    "Corporate-SSID MAC filtering does not define guest-to-corporate routed permissions and an accepted address can be spoofed."
  ],
  [
    "Fail-open permits access despite the failure, contrary to the stipulated denial.",
    "Defence in depth describes multiple protections which can coexist, not specifically this failure posture.",
    "Least functionality reduces unnecessary services/components, not by itself the described access behaviour on failure."
  ],
  [
    "Volumetric link saturation differs from HTTP-request filtering; integrated services may provide separate DDoS protection and WAF rules may limit application floods.",
    "IP spoofing is a network-origin technique rather than the primary HTTP-attack purpose; origin/IP checks and other product layers may coexist.",
    "Direct database traffic lies outside a standalone WAF path, but covered web requests by insiders may be inspected; the blanket insider exclusion remains held."
  ],
  [
    "A hub repeats physical signals rather than consulting destination-IP routes.",
    "The expressly Layer 2 switch forwards by MAC rather than performing the asked IP-routing function.",
    "A repeater regenerates signals rather than applying the destination-IP forwarding decision."
  ],
  [
    "Core VLAN segmentation alone does not describe the specified screened public-service subnet, though VLANs may implement it.",
    "Split tunnelling selects endpoint VPN routes rather than defining this public-server security zone.",
    "A flat network lacks the distinct screened subnet described, even when some access rules exist."
  ]
];
const families=[
  "application_scoped_partner_access_choice",
  "enforced_guest_to_corporate_boundary_choice",
  "per_port_MAC_limit_failure_action_recognition",
  "encrypted_ESP_packet_layout_mode_recognition",
  "dedicated_HTTP_application_inspection_purpose",
  "enforced_guest_to_corporate_boundary_choice",
  "access_denial_failure_posture_recognition",
  "dedicated_HTTP_application_inspection_purpose",
  "IP_forwarding_device_role_recognition",
  "screened_public_service_subnet_recognition"
];
const preciseHolds=[
  "ZTNA_label_not_policy_and_alternative_reach_not_uniform",
  null,
  "whole_numbered_MAC_policy_feature_naming_scope",
  "AH_GRE_option_labels_not_IPsec_modes",
  null,
  "shared_switch_efficiency_unmeasured_and_composite_boundary",
  "whole_numbered_failure_principle_naming_and_safe_state_scope",
  "WAF_product_overlap_and_insider_path_contrast",
  "whole_numbered_IP_routing_device_definition_scope",
  "screened_subnet_not_absolute_isolation_or_universal_two_firewall_scope"
];
const roles=[
  "one_application_scoped_access_choice_not_identity_evidence",
  "one_combined_guest_boundary_choice_not_independent_L2_L3_skills",
  "MAC_policy_feature_name_whole_scope_held",
  "one_encrypted_ESP_layout_choice_not_independent_protocol_skills",
  "dedicated_HTTP_parameter_filter_control_choice",
  "one_combined_guest_boundary_choice_efficiency_qualified",
  "failure_principle_name_whole_scope_held",
  "covered_HTTP_attack_purpose_with_actor_path_contrast_held",
  "IP_routing_role_name_whole_scope_held",
  "screened_service_zone_name_isolation_and_whole_scope_held"
];
const scopes=[
  {
    "assessedCodes": [
      "3.2"
    ],
    "contextCodes": [],
    "status": "narrow_infrastructure_control_or_secure_communication_understanding_inferred_pending_owner"
  },
  {
    "assessedCodes": [
      "3.2"
    ],
    "contextCodes": [],
    "status": "narrow_infrastructure_control_or_secure_communication_understanding_inferred_pending_owner"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.2"
    ],
    "status": "held_whole_numbered_feature_principle_device_or_architecture_naming_scope"
  },
  {
    "assessedCodes": [
      "3.2"
    ],
    "contextCodes": [],
    "status": "narrow_infrastructure_control_or_secure_communication_understanding_inferred_pending_owner"
  },
  {
    "assessedCodes": [
      "3.2"
    ],
    "contextCodes": [],
    "status": "narrow_infrastructure_control_or_secure_communication_understanding_inferred_pending_owner"
  },
  {
    "assessedCodes": [
      "3.2"
    ],
    "contextCodes": [],
    "status": "narrow_infrastructure_control_or_secure_communication_understanding_inferred_pending_owner"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.2"
    ],
    "status": "held_whole_numbered_feature_principle_device_or_architecture_naming_scope"
  },
  {
    "assessedCodes": [
      "3.2"
    ],
    "contextCodes": [],
    "status": "narrow_infrastructure_control_or_secure_communication_understanding_inferred_pending_owner"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.2"
    ],
    "status": "held_whole_numbered_feature_principle_device_or_architecture_naming_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.2"
    ],
    "status": "held_whole_numbered_feature_principle_device_or_architecture_naming_scope"
  }
];
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();
assert.equal(selected.filter(r=>r.flags.stemChanged).length,6);assert.equal(selected.filter(r=>r.flags.optionsChanged).length,0);assert.deepEqual(selected.filter(r=>r.flags.importedSource).map(r=>r.questionId),[]);
const questionProposals=selected.map((row,i)=>{
  const s=c.questions.get(row.recordId),q=s.q,shuffled=shuffle(q);assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);
  assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
  for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
  assert.equal(q.correct,s.preQuestion.correct);
  assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert(s.authored);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);assert.equal(q.correct,s.authored.correct);

  return{recordId:row.recordId,questionId:q.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:false,sourceLayerDisposition:'authored_equals_preeditorial_but_differs_from_effective',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',assessedUnderstanding:meanings[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],skillRoleProposal:roles[i],numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:families[i],familyStatus:'provisional_comparison_no_independence_approval',optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0}};
});
assert.equal(questionProposals.filter(r=>r.snapshotReplayChecked).length,0);assert.equal(questionProposals.filter(r=>r.revisions.authored===null).length,0);
const explanationProposals=questionProposals.map((parent,i)=>{
  const s=c.questions.get(parent.recordId),q=s.q,indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct);assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
  return{recordId:'explanation:'+parent.recordId,kind:'explanation_bundle',parentId:parent.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:parent.sourceRevision,parentPublishedRevision:parent.publishedRecordSignature,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:mainTeaching[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],withheldPreciseContrast:preciseHolds[i],roleProposal:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:contrasts[i][k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId)),broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('3.2')),old=broad.filter(r=>c.previous.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id)),counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
assert.equal(broad.length,220);assert.equal(old.length,63);assert.equal(selectedIds.size,20);assert.equal(remaining.length,137);assert.equal(broad.filter(r=>r.kind==='mcq').length,22);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);assert.equal(remaining.filter(r=>r.kind==='pbq').length,5);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,5);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,priorQuestions=bankRows.filter(r=>c.previous.has(r.recordId)),priorFeedback=bankRows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorQuestions.length,227);assert.equal(priorFeedback.length,227);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,priorQuestions:227,newQuestions:10,combinedQuestions:237,remainingQuestions:246,combinedMcqs:221,remainingMcqs:174,combinedLocalPbqs:16,remainingLocalPbqs:72,pairedFeedbackCombined:237,pairedFeedbackRemaining:246};
assert.equal(priorQuestions.filter(r=>r.kind==='mcq').length + 10,bankProgress.combinedMcqs);assert.equal(priorQuestions.filter(r=>r.kind==='pbq').length,16);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective32PriorityHeldDispositions:base.explanationProposals.filter(r=>r.withheldPreciseContrast).map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal}))};
const legacy24=priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds,old23=legacy24.earlierHolds;
assert.equal(old23.objective23Holds.m305WholeScopeHold.objectiveScopeProposal.status,'held_whole_numbered_mitigation_choice_scope');assert.equal(old23.objective23Holds.priorHolds.m046HeldContrast,'named_individual_requirement_in_spear_phishing_wrong_feedback');assert.equal(old23.objective23Holds.priorHolds.m432WholeNumberedScopeHeld,true);assert.equal(old23.objective23FeedbackHolds.length,4);assert.equal(legacy24.objective24HeldDispositions.length,4);assert.equal(priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.objective24SecondHeldDispositions.length,3);assert.equal(priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.objective24FinalHeldDispositions.length,6);assert.deepEqual(priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.objective25HeldDispositions.map(r=>r.withheldPreciseContrast),['zero_day_unknownness_and_numbered_gap_scope','separation_of_duties_permission_scope_exclusivity']);
assert.equal(priorHolds.inheritedHolds.inheritedHolds.objective31PriorityHeldDispositions.length,5);assert.equal(priorHolds.inheritedHolds.objective31FinalHeldDispositions.length,6);assert.equal(priorHolds.objective32PriorityHeldDispositions.length,6);
const comparisonSpecs=[
  {
    "ids": [
      "mcq:m063",
      "mcq:m147",
      "mcq:m292",
      "mcq:m291",
      "mcq:m065",
      "mcq:m138",
      "mcq:m133",
      "mcq:m014",
      "mcq:m113",
      "mcq:m729",
      "mcq:m619",
      "mcq:m061",
      "mcq:m154"
    ],
    "meaning": "Application-scoped partner access, guest boundary choice and public-service zone recognition have different purposes but require enforced identity/routes. m147/m292 are closely correlated composite guest-isolation decisions in one provisional family. DMZs/VLANs/ZTNA can coexist; labels and required paths are not complete containment or physical isolation. Preserve prior SoD, safety, tier and nonexclusive architecture holds."
  },
  {
    "ids": [
      "mcq:m152",
      "mcq:m718",
      "mcq:m095",
      "mcq:m018",
      "mcq:m151",
      "mcq:m056",
      "mcq:m619",
      "mcq:m636"
    ],
    "meaning": "MAC-count/shutdown policy, DHCP naming, failure-denial labels, IP-forwarding roles, VLAN names and SSH port lookup are distinct prerequisite recognition scopes. Counted addresses do not establish strong identity, failure denial does not establish safety and device names do not demonstrate secure placement. m151/m056 are near-duplicates; m095 closely correlates with m018 without importing its inline context. Whole numbered naming holds remain."
  },
  {
    "ids": [
      "mcq:m153",
      "mcq:m314",
      "mcq:m715",
      "mcq:m299",
      "mcq:m418",
      "mcq:m420"
    ],
    "meaning": "Encryption-enabled ESP layout recognition differs from generic suite, route-policy and channel-property choices. Current m153 explicitly supplies encryption, while AH/GRE labels remain protocol/mode taxonomy issues. Outer metadata, trusted keys, allowed routes and confidentiality are not interchangeable skills. Preserve m314 conditional encryption/same-network and m420 trust/Telnet holds without independently assessed AH/ESP/IKE/PFS."
  },
  {
    "ids": [
      "mcq:m286",
      "mcq:m097",
      "mcq:m261",
      "mcq:m321",
      "mcq:m149",
      "mcq:m708"
    ],
    "meaning": "Dedicated HTTP control selection and WAF attack-purpose recognition strongly correlate in one provisional inspection-purpose family. Supported parser/TLS/body/rule coverage, live placement, cloud discovery and edge-capacity protection differ. Product features overlap, direct database traffic differs from covered insider requests and WAF alone is not volumetric saturation protection. Preserve m261 decoding premise, CASB scope and m708 conditional edge/origin coverage."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids,comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const r=c.records.get(id),p=c.previous.get(id);assert(r);return{recordId:id,sourceRevision:r.sourceSignature,localRevision:r.localRevisionSignature??null,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null,status:selectedIds.has(id)?'current_substantive_disposition':p?'prior_disposition_reference_only':'inspection_only_no_new_credit'};}),newFamilyCredit:0,independenceApproved:false}));
const priorBatchComparisons=base.questionProposals.map(r=>{assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);return{recordId:r.recordId,sourceRevision:r.sourceRevision,publishedRecordSignature:r.publishedRecordSignature,feedbackRevision:c.records.get('explanation:'+r.recordId).sourceSignature,priorDecisionRevision:sig(r),status:'prior_substantive_reference_no_new_credit'};});
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'4de0c6bbcc43ea8ad30f3e78cf50b17c2b616a00',sourceBindings:[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective32-priority-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective32-priority-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)}],triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,baselinePriorQuestions:125,substantiveOverlayPackets:[firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json',basePath].map(path=>({path,sha256:hashFile(path)})),currentPriorQuestions:227},bankSignature:c.ledger.bankSignature,selectionPolicy:'Final 10 undispositioned objective 3.2 MCQs by existing triage priority then record ID; structural cues do not prove correctness or semantic error',selectedQuestionRecordIds:ids.map(id=>'mcq:'+id),selectedFeedbackRecordIds:ids.map(id=>'explanation:mcq:'+id),deferredObjective32QuestionRecordIds:deferred.map(r=>r.recordId),questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorBatchComparisons,priorHolds,objective32Census:census,objective32Denominator:{broadCandidates:220,priorAgentDispositions:63,newAgentDispositions:20,combinedAgentDispositions:83,remaining:137,remainingByKind:counts(remaining)},remainingObjective32RecordIds:remaining.map(r=>r.id),bankProgress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};

function validate(value){
  assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);assert.deepEqual(value.sourceBindings,packet.sourceBindings);
  assert.deepEqual(value.selectedQuestionRecordIds,selected.map(r=>r.recordId));assert.deepEqual(value.selectedFeedbackRecordIds,selected.map(r=>'explanation:'+r.recordId));assert.deepEqual(value.deferredObjective32QuestionRecordIds,deferred.map(r=>r.recordId));
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
  assert.deepEqual(value.objective32Census,census);assert.deepEqual(value.remainingObjective32RecordIds,remaining.map(r=>r.id));assert.deepEqual(value.objective32Denominator,packet.objective32Denominator);assert.deepEqual(value.bankProgress,bankProgress);assert.deepEqual(value.separateAssessmentDenominator,packet.separateAssessmentDenominator);
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
  reject(p=>p.questionProposals[i].snapshotReplayChecked=!p.questionProposals[i].snapshotReplayChecked);
  reject(p=>p.questionProposals[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);
  reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);
  reject(p=>p.explanationProposals[i].parentLocalRevision=p.questionProposals[(i+1)%10].sourceRevision);
  reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%10].sourceRevision);
  for(let k=0;k<3;k++)reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');
}
for(const [i,h]of preciseHolds.entries())if(h)reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);for(const i of [2,6,8,9])reject(p=>p.questionProposals[i].objectiveScopeProposal.assessedCodes=['3.2']);
// Each inherited contrast is independently removable in a negative probe; the full chain stays bound.
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);
for(const path of holdPaths)reject(p=>{let target=p.priorHolds;for(const key of path.slice(0,-1))target=target[key];target[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{const old=p.priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
reject(p=>p.questionProposals[0].newFamilyCredit=1);reject(p=>p.questionProposals[0].humanApproved=true);reject(p=>p.questionProposals[0].primaryConceptProposal='invented');reject(p=>p.questionProposals[0].independentEvidence=true);
reject(p=>p.explanationProposals[0].deliveryGate='free_before_submission_all_options');reject(p=>p.explanationProposals[0].approvedRemediation=true);reject(p=>p.explanationProposals[0].distractorCorrections[0].assessedSecondary=true);reject(p=>p.explanationProposals[0].masteryWeight=1);
reject(p=>p.selectedQuestionRecordIds[9]=selected[0].recordId);reject(p=>p.questionProposals.pop());reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.deferredObjective32QuestionRecordIds.push(selected[0].recordId));
reject(p=>p.objective32Census.pop());reject(p=>p.objective32Census.push(p.objective32Census[0]));reject(p=>p.objective32Census.find(r=>r.recordId===remaining[0].id).status='new_agent_disposition_pending_owner');reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.separateAssessmentDenominator.privateVariants=0);
reject(p=>p.priorBatchComparisons.pop());reject(p=>p.questionProposals[0].objectiveScopeProposal={assessedCodes:['3.2','2.4'],contextCodes:[],status:'approved'});reject(p=>p.questionProposals[7].skillRoleProposal='observed_successful_upload_prevention');reject(p=>p.sourceBindings[0].sha256='stale');reject(p=>p.activationAllowed=true);for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
packet.negativeMutationChecks=negativeMutationChecks;
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(packet,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),packet,'Packet/source disposition drift');
const report=[
  '# Phase 2B-5 — objective 3.2 final MCQs and feedback',
  '**NOT READY.** Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. Only this finite source-bound packet, report and focused audit change, reusing existing helpers without runtime/configuration/package or duplicate bank ledger changes.',
  '## Exact selection and census',
  '**Final ten** undispositioned effective objective 3.2 MCQs in deterministic priority-descending/record-ID order: **'+ids.join(', ')+'**, with ten paired feedback (**20 new pending agent judgments**). No further tagged 3.2 MCQ/MCQ-feedback remains undispositioned. Every effective stem/choice/key/main/wrong correction and authored/preeditorial input was read locally; triage only prioritises review and earns zero semantic credit.',
  'Objective 3.2 broad source-tag union: **220 records; 63 prior + 20 new = 83 pending agent dispositions; 137 remain**. Prior 63 comprise twelve MCQs, twelve feedback, one deck container, thirteen flashcards and 25 glossary definitions. All **22 tagged MCQs and 22 paired feedback** now have pending agent judgments, including holds; this is not owner approval or complete objective coverage. Remaining: **five local PBQs, five feedback and 127 support/instructional records**.',
  '| Remaining kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
  'Bank: **227 prior + 10 new = 237/483 questions** and 237 paired feedback pending owner. These comprise **221/395 MCQs + 16/88 local PBQs**. **246 questions and 246 paired feedback remain**, comprising **174 MCQs + 72 local PBQs**. Two private variants, nine starter assessments and two guest demos stay separate; inspection/census references get no new substantive credit.',
  '## Ten substantive judgments',
  '| ID | Priority | Effective understanding | Qualification |\n| --- | ---: | --- | --- |\n'+questionProposals.map(r=>'| '+r.questionId+' | '+r.sourcePriority+' | '+r.assessedUnderstanding+' | '+r.contentQualification+' |').join('\n'),
  '## Source precedence and every correction',
  'All ten have authored inputs, with authored revisions equal to preeditorial and different from effective editorial revisions. None has a captured override, snapshot or imported input; no selected captured-snapshot replay is claimed. Six authored stem differences are m063/m147/m152/m153/m286/m292: m063/m152/m292 include organisation spelling, m147 replaces attack-immunity wording with required permitted-path policy, m153 explicitly supplies ESP encryption, and m286 replaces a universal web-attack taxonomy with a specific HTTP-parameter requirement. All ten option lists and keyed positions are unchanged; unchanged key/list does not establish unchanged meaning.',
  'm063 narrows universal VPN/peering access but retains an overbroad main grouping of alternative reach, observed hard to medium. m147 bounds regardless-of-guest-actions isolation. m152 removes rogue/VLAN-attack prevention guarantees while retaining spoofable-address limits. m153 replaces generic IPsec encryption/fixed deployment usage with explicit ESP layout but retains AH/GRE mode labels as distractors. m286 removes universal CSRF/OWASP coverage and qualifies TLS/coding/feature overlap. m292 removes measured-looking cost/efficiency guarantees while retaining most-efficient wording. m095 narrows secure-state/all-open guarantees, observed medium to easy. m097 supplements coding/authorisation but retains broad insider/network contrast exclusions. m151 adds precise physical/Layer2 contrasts without granting security from routing. m291 replaces universal two-firewall/automatic containment teaching but retains isolation/naming shorthand. m286/m097 authored domain 2 becomes effective domain 3. Every difficulty label remains observed and uncalibrated.',
  'Seven rows lacking authored wrong-feedback bundles now have three explicit corrections: m147/m152/m153/m286/m292/m151/m291. m063/m095/m097 have authored corrections to compare; retained portions still need bounded interpretation. New correction text is current source evidence, not automatically approved useful teaching.',
  explanationProposals.map((r,i)=>'**'+ids[i]+' main:** '+r.mainTeachingUnderstanding+' Three wrong-option contrasts: '+r.distractorCorrections.map(d=>d.teachingRationale).join(' ')).join('\n\n'),
  '**30 effective wrong corrections** bind exact choice/correction/main/bundle/parent-local/parent-published revisions. Eight precise holds cover m063 ZTNA/alternative reach, m152 MAC-policy naming scope, m153 AH/GRE mode taxonomy, m292 unmeasured efficiency/composite boundary, m095 failure-principle scope/safe state, m097 WAF product/insider-path contrasts, m151 routing-definition scope and m291 isolation/two-firewall/naming scope. Four whole numbered naming scopes retain 3.2 context with no assessed code; the other six narrow scope proposals remain inferred pending owner, not approved whole-objective competence. No forced alternate code, assessed secondary concept, independent component, implemented remediation or learner recovery.',
  'All ten actual fixed-randomness pure shuffles preserve keyed choice, choice multiset and selected-wrong correction remapping. MCQPractice/shuffle/wrong-feedback source units and practice selector match prior bindings. Main feedback requires submitted Pro; wrong feedback is conditional on the selected wrong option. Pool/set/guest delivery, browser entitlement/tooltip/disabled-option interaction and learner outcomes remain unobserved. No React, grading/session/storage/sync, telemetry, switch, firewall, guest/partner identity, VPN, IPsec, WAF, app/database, network, attack, shutdown or recovery handler executes.',
  '## Correlation and primary references',
  comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
  'The prior twelve 3.2 questions have exact source/feedback/prior-decision references and all six precise holds remain. m147/m292 share a provisional guest-boundary family; m286/m097 share a provisional dedicated HTTP-inspection-purpose family; m151 uses prior m056 IP-forwarding family without new independence. m095 closely correlates with m018 failure-denial recognition without supplying its inline context. Composite segmentation/firewall/ACL and app-scoped access choices are one keyed decision each, not separately scored policy/identity/layer components. Canonical concepts, approved roles/families, calibrated difficulty, weights, evidence, human approval, useful teaching publication and activation remain zero/null/false.',
  '[CompTIA SY0-701 v7 §3.2](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) concerns applying infrastructure security through placement/zones/failure posture, port-security, firewall/effective controls and secure communications. Supplied feature/principle/device/architecture names alone do not establish whole applied-security competence. Limited control/function scope proposals here remain inferred pending owner rather than official certification.',
  '[NIST SP800-207 §2.1](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf) describes least-privilege resource/session access and policy enforcement, not automatic trust from a product label. Our m063 inference is that the stipulated app-only option best fits, while DMZ/VPN/peering designs can combine identity/access controls and their reach cannot uniformly be inferred from names.',
  '[NIST SP800-41r1 §3](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-41r1.pdf) discusses DMZ interfaces and interzone firewall policy, including multi-interface designs. This supports bounded guest/public-service path reasoning, not mandatory two physical devices, absolute containment, universally greater alternative reach or measured switch cost-efficiency. Public services require permitted communication even when zoned.',
  '[Cisco port-security documentation](https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/cdp-lldp-mac-udld/cdp-lldp-mac-udld-configuration-guide/c-configure-mac.html) describes configured MAC limits and violation behaviour. [Cisco MAC-authentication limitations](https://www.cisco.com/c/en/us/td/docs/solutions/Enterprise/Security/TrustSec_1-99/MAB/MAB_Dep_Guide.html) explains spoofable address-based identity, distinct from credential authentication. Our inference for m152 is that a bare MAC-count policy does not become strong identity or universal rogue-device prevention. MAB is a separate feature; no product, supplicant, binding, command or shutdown is run.',
  '[ESP RFC4303 §3.1](https://www.rfc-editor.org/info/rfc4303/) distinguishes transport/tunnel placement and selected encryption/integrity fields; [AH RFC4302](https://www.rfc-editor.org/info/rfc4302/) supplies authentication/integrity rather than confidentiality. This bounds m153 original-header/payload teaching and AH/GRE taxonomy without importing unassessed algorithms, key exchange, PFS or fixed deployment guarantees. Retained mode-labelled distractors are held despite current corrections.',
  '[AWS WAF/Shield documentation](https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html) describes HTTP-request rules and separate/integrated DDoS capabilities, including origin-IP conditions. It illustrates feature overlap rather than selecting or testing a product. Our m097 path inference is that direct database traffic differs from insider requests crossing a web inspection point; actor category alone does not decide visibility or override authorisation. Rule support and TLS/coding boundaries remain necessary.',
  '[RFC1812 §5](https://www.rfc-editor.org/info/rfc1812/) describes destination-based IP forwarding. This supports the stipulated router role, not automatic secure placement or exclusion of routing from integrated switching products; m151 remains near-duplicate recognition with whole numbered scope held.',
  '## Preserved holds and remaining work',
  'Preserve six prior 3.2 precise holds: m718 DHCP naming, m420 ordinary-Telnet/host-key trust, m636 port lookup, m056 IP-routing definition, m227 API principle/boundary and m314 conditional encryption/same-network shorthand. Preserve all eleven 3.1 precise holds for m714/m294/m296/m619/m638/m021/m061/m149/m161/m058/m298; all m134/m014, objective2.4, m305/m046/m432/m135/four2.3 feedback, actor/supplier, crypto/PKI/PFS, channels, Unicode, PBQ grading, targeting and delivery qualifications. New judgments clear none of these.',
  'Objective 3.2 remaining **137/220**: PBQs **p035, p044, p073, p078, p082**, their five feedback and 127 support records; no undispositioned tagged MCQ or MCQ-feedback remains. Objective 3.1 stays **99/220** pending with four PBQs p016/p022/p047/p077, four feedback and 113 support remaining. Objective 2.5 stays 30/66 with 36 support remaining; 2.4 stays 91/199 with 108 remaining; 2.3 stays 60/162 with 102 remaining; 2.2 stays 61/134 with 73 remaining. Support census is not substantive review.',
  'Private p017 remains sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42, unavailable/unreviewed and null trusted. Active package remains **1878 records / 435 identities; 489 unresolved mappings; 2954 review decisions; seven existing primary proposals**, SHA-256 056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97. All 25 release hashes stay unchanged. Protected private review, 36 unsupported local PBQ grammars, remaining bank/support coverage and owner decisions remain gates.',
  '**NOT READY.** LOCAL/OFFLINE/default-off/unwired/learner-invisible. Owner approval of precise scope, concepts, roles, family independence, difficulty, weights, evidence/calibration and useful teaching remains outstanding. No runtime/live/private/Phase3 changes, migration, activation, shadow writes, cohort, deployment or pricing/legal change.',
  '## Validation',
  'Run node '+scriptPath+' and npm run audit:content-mapping. Validate exact final ten/empty deferral, 220-record census, 63 + 20 objective and 227 + 10 bank counts, no selected captures/snapshots/imports, 30 correction bindings and ten actual shuffle/remap probes. **'+negativeMutationChecks+' rejected mutations** cover source/trusted-ID substitutions, null-authored/invented captures/false replay, erased qualifications/holds, swapped/stale feedback, false scopes/roles/components/weights/evidence/remediation, corrupt selection/census/denominators, every inherited precise hold, source drift, forbidden payload export and activation. Full mapping suite: 29 tests and deterministic package check; 25 release hashes unchanged. Task-only **[skip deploy]** commit/push.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE32_FINAL_MCQS_NOT_READY',reviewedIds:ids,deferredIds:deferred.map(r=>r.questionId),newDispositions:20,bankProgress,objective32:packet.objective32Denominator,snapshotReplays:0,wrongCorrections:30,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
