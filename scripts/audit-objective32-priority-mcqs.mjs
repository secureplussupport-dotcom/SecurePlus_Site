import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';

const scriptPath='scripts/audit-objective32-priority-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json',reportPath='docs/phase-2b5-objective32-priority-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json',firstPath='docs/drafts/phase-2b5-objective23-fastlane-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'c6b3adcb1f3dd6b64c1384d63383527f2d7fdeb5f2a3c3fea65369f57bbbf0f6');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
// Only substantive arrays overlay the frozen inventory; inspection references earn no credit.
for(const path of [firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json',basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
  assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const ranked=c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('3.2')&&!c.previous.has(r.recordId)).sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en'));
const selected=ranked.slice(0,12),deferred=ranked.slice(12),ids=["m715", "m718", "m729", "m420", "m636", "m018", "m299", "m321", "m418", "m056", "m227", "m314"];
assert.equal(ranked.length,22);assert.deepEqual(selected.map(r=>r.questionId),ids);assert.deepEqual(selected.map(r=>r.priorityScore),[130,130,130,125,40,35,35,35,35,25,25,25]);assert.deepEqual(deferred.map(r=>r.questionId),["m063", "m147", "m152", "m153", "m286", "m292", "m095", "m097", "m151", "m291"]);
const meanings=[
  "Choose the enforced full-tunnel VPN configuration for the stipulated corporate/internet IP-routing policy, with IPv4/IPv6/DNS and exception/failure coverage verification still required.",
  "Recognize DHCP from the specified initial IPv4 lease configuration; DORA and snooping teaching do not turn protocol naming into whole 3.2 security application.",
  "Choose a controlled administrative jump path into the protected zone; a jump-server name alone does not establish configured hardening, authentication or audit.",
  "Identify verified SSH host keys as the offered server-authentication property versus ordinary unprotected Telnet; retained all-Telnet wording and trust-process limits remain held.",
  "Identify TCP 22 for the stipulated standard-port SSH destination from approved management sources; whole numbered port-lookup scope and actual rule enforcement remain separate.",
  "Recognize the stated blocking behaviour on inline-gateway failure as fail-closed, without assessing universal industry appropriateness or eliminating availability/safety risk.",
  "Choose split tunnelling for corporate private access while other internet traffic uses a local path; routing choice does not itself guarantee private exposure or complete inspection.",
  "Choose an inline application proxy to enforce the stipulated supported browser upload before forwarding; no universal CASB mode or successful block is established.",
  "Identify encrypted and integrity-protected transport as the missing property of the stipulated sensitive plaintext HTTP traffic; one combined property decision, not two independent subskills.",
  "Recognize the offered Layer 3 IP-forwarding device role as routing, using explicitly Layer 2/bridge-mode contrasts; whole 3.2 definition scope remains held.",
  "Recognize the offered enforced API boundary as a defence-in-depth principle example; whole numbered principle-naming scope and protection of permitted API operations remain held.",
  "Recognize the offered IPsec VPN suite for IP-layer tunnelling, with encryption-enabled ESP and tunnel configuration required; generic encryption/same-network shorthand remains held."
];
const holds=[
  "HOLD every VPN as full-tunnel, the full-tunnel label as universal leak prevention, all traffic as encrypted beyond the VPN gateway or encrypted routing as a clean endpoint. Current policy explicitly requires corporate/internet IP traffic through the gateway; test IPv4, IPv6, DNS, more-specific/excluded/local routes and failure behaviour before claiming coverage. Browser-only proxy and website reverse-proxy constraints are supplied, not universal limits of every proxy product; a standalone HIDS does not route traffic. Snapshot automatic-all-packets and every-app-proxy-manually-configured absolutes are superseded. Null authored input makes false structural change flags uninformative about snapshot changes. Correlate with m299/m314 without independent route/encryption/DNS components. No endpoint, VPN, packet, proxy, failure or confidentiality is tested.",
  "HOLD DHCP naming as whole 3.2 applied infrastructure security, DORA as every lease/renewal/IPv6 exchange, configured values as necessarily trusted or DHCP snooping as an attack. Initial DHCPv4 commonly follows Discover/Offer/Request/Acknowledge; renewals and known-address flows differ, and DHCPv6 is not this exchange. The snapshot incorrectly names DHCP snooping as an attack; effective feedback correctly treats it as a defence against rogue-server behaviour, requiring configured trust/coverage rather than automatic protection. DNS supports more records than simple name-to-address lookup; LDAP/SNMP purposes do not issue this lease. Acronym metadata is not separately assessed. HOLD whole numbered protocol-recognition scope with 3.2 context, no forced alternative code. Source is snapshot-only; no log, server, lease, snooping control, rogue traffic or network is inspected.",
  "HOLD a jump server as inherently hardened, authorised, audited or immune to compromise, separate zones as physical air gaps, or every bastion as necessarily an administrative jump host. The stipulation blocks direct corporate administration but requires an approved indirect administrative path; restrict identities, routes, sessions and downstream rights, and review logging. A reverse/forward proxy product may have other integrations, but the offered application/content purposes do not provide this designated jump path by themselves. Snapshot built-in logging/authentication assumptions are qualified; observed medium-to-easy difficulty is uncalibrated and TLS metadata is not assessed. Snapshot-only source adds no authored substitute. No access, identity, zone, hardening, log or successful maintenance is tested.",
  "HOLD presented or signed SSH host keys as verified device identity without an approved trusted binding, blind first-use/change acceptance as safe, server authentication as user authentication, or the SSH label as automatic prevention of active attacks. Current key/main correctly require host-key verification; the retained stem says Telnet cannot without restricting all extensions, while ordinary Telnet is the intended contrast. Telnet authentication/encryption extensions exist, so the broad impossibility contrast remains held; this is not a recommendation to deploy them. Compression, timeouts and rate limits have different purpose and may coexist. Captured difficulty hard differs from authored/effective easy, and captured domain 1 is superseded by effective 3.2 context; none calibrates difficulty. Correlate with m636/m418/m314 and existing PKI trust holds without independent identity evidence. No host key, credential, session, server, Telnet extension or attack is tested.",
  "HOLD registered/common ports as proof of the protocol, SSH as always TCP 22, a port-only choice as a complete least-privilege firewall rule or allowed traffic as verified trusted administration. Current stem explicitly stipulates standard-port SSH and approved sources, correcting the authored ambiguous secure-shell purpose and outbound-only shorthand. Direction, source/destination identities, reachable service, stateful behaviour and host-key/user authorisation remain separate configuration. TLS on TCP 443 and encrypted tunnels can also serve remote access; the stipulated standard SSH port selects this answer. Generic repeated-key feedback is superseded; imported QB1 input is not external certification and observed medium-to-easy difficulty is uncalibrated. HOLD whole 3.2 scope for a standard-port lookup with architecture context only, no forced alternate objective. No port, rule, connection, key, reachability or allowed session is tested.",
  "HOLD fail-closed as universal security, every failure as blocking all paths, fail-closed as always fail-safe, or hospital/e-commerce/classified/financial labels as automatic failure-policy decisions. The supplied gateway blocks on hardware failure, sacrificing availability; redundant/bypass paths and safety requirements still need analysis. Current question asks one behaviour rather than the authored compound behaviour/appropriate-environment answer; old industry-wide default choices are superseded. Load balancing may support resilience but does not define this failure posture; passive monitoring observes copies, not the stipulated inline blocking. Correlate with m020/m154 safety constraints without converting behaviour naming into proven safe configuration. No hardware failure, path, redundant gateway, outage or policy is tested.",
  "HOLD split routing as privacy by itself, every noncorporate flow as correctly classified, off-tunnel DNS filtering as full content inspection, a VPN as same LAN/subnet or guaranteed performance/capacity benefit. Private resource exposure, authentication, route enforcement, endpoint trust, IPv4/IPv6/DNS and approved direct services still need configuration. A VPN gateway may itself be reachable publicly; this does not mean internal services must be published. Publishing/port-forwarding are offered contrasting exposure changes, not every possible access-controlled proxy design. Authored always-improved-performance and DNS-security-completes-filtering shorthand are superseded; stem spelling does not create scenario novelty. Closely correlate with m715 route-policy choice in one provisional family; no independent privacy/inspection evidence. No resource, route, VPN, DNS filter, internet access or exposure is tested.",
  "HOLD inline placement alone as successful blocking of every cloud upload, proxy as always reverse mode, every managed device as automatically routed, or every API mode as unable to enforce policy. The current request specifies browser-to-cloud in-flight blocking, supported request visibility and enforcement; TLS inspection, app/browser support, policy, bypass and failure behaviour determine coverage. Offline archive, scheduled report and passive copy do not themselves stop this request; other integrations can enforce separate actions. Authored CASB reverse/forward managed-device conflation and absolute API-no-real-time claim are superseded by an inline generic control, same key index but different task/choices. Current hard-to-medium difficulty is uncalibrated. Compare m149 discovery versus live enforcement without inheriting approval or independent product capability. No cloud app, upload, TLS intercept, proxy, policy or successful block is tested.",
  "HOLD TLS as automatic endpoint trust, encryption as non-repudiation or payload harmlessness, a terminating proxy as end-to-end application secrecy, every wire byte as hidden, or HTTP/2 multiplexing/compression/flow control as cryptographic protection. The premise explicitly lacks TLS and another protective tunnel; validated TLS can protect channel confidentiality and integrity between its endpoints, with identity validation and negotiated parameters required. The single combined key does not separately establish encryption and integrity competencies. Authored specific h2c/HPACK/CRIME claims and misleading TLS-dependent feature contrasts are not transferred into this general current task; original domain 1 is superseded by effective 3.2 secure-communication scope. Correlate SSH/IPsec channel protection while preserving prior identity, algorithm and crypto holds. No capture, transport, certificate, TLS handshake, parser or confidentiality/integrity result is tested.",
  "HOLD all managed switches as Layer 2 only, every access point as incapable of routing, a router as automatically firewalling/encrypting or device marketing names as exclusive functions. Current distractors explicitly restrict the offered switch to Layer 2 and access point to bridge mode, correcting authored universal role claims; actual integrated devices can perform more roles. MAC frame forwarding and signal repetition contrast with the asked IP-routing function, not with implemented security placement. HOLD whole 3.2 applied-security scope for pure device-function definition; keep network context without forcing a different objective. No route, forwarding table, bridge, signal, firewall, device or secure topology is tested.",
  "HOLD requiring an API as automatic removal of direct database reachability, all architectural layers as independent physical/security tiers, parameterised queries as already implemented, or a compromised application as unable to use permitted API operations. Enforce database routes/identities, narrow API authorisation and review allowed operations; the supplied intended boundary is teaching, not observed containment. Current key names defence in depth alone rather than the authored compound attack-surface-reduction/defence pair; no separately scored principles. Fail-secure concerns failure behaviour, which is not supplied here; non-repudiation and secrecy have different purpose. HOLD whole 3.2 applied-control scope for principle-label recognition with context only, no forced 1.2/2.5 reassignment. Authored hard/domain 1 becomes effective medium/domain 3, uncalibrated. Correlate m138/m133/m065/m298 boundary holds without independent family evidence. No API, database, credential, query, attack path or protection is tested.",
  "HOLD the whole IPsec suite as unconditional encryption, AH as encrypting, all ESP security associations as confidentiality-enabled, tunnel mode as the only mode, or remote/site-to-site routing as literal same subnet/private trust. Current feedback qualifies encryption-enabled ESP and AH limits, while the retained encrypted-tunnelling/same-network shorthand needs bounded interpretation. SSH can support forwarding and IP tunnels; the dedicated IP-layer suite is the offered best fit, not an exclusive assertion that other technologies can never tunnel. FTPS secures file-transfer channels; LDAP directory purpose is separate. Authored legacy algorithm examples and one deployment pairing are not approved/current configuration guidance. One suite-choice answer does not assess AH/ESP/IKE or modes independently. Preserve prior IPsec/PFS/identity holds and correlate m715/m299/m418 without new family independence. No tunnel, negotiation, algorithm, route, key or encrypted connection is tested."
];
const mainTeaching=[
  "An enforced full-tunnel route policy sends required IP traffic through its gateway; address families, DNS, exceptions and failure coverage require verification.",
  "DHCP supplies the described IPv4 lease; initial DORA is common, and configured snooping is a defensive feature rather than an attack.",
  "A jump server can mediate administrative entry across zones when access, hardening and auditing are explicitly configured.",
  "SSH server authentication requires verified host-key trust; ordinary unprotected Telnet lacks that mechanism, but all extensions are not excluded by the stem.",
  "TCP 22 is the stipulated conventional SSH destination; protocol identity and complete firewall/session permissions require more than a port label.",
  "Fail-closed blocks the stipulated path on failure and trades availability for boundary enforcement; suitability depends on safety and uptime needs.",
  "Split tunnelling assigns corporate routes to the VPN and other traffic to local internet access, with possible central-inspection bypass and no automatic privacy guarantee.",
  "A supported inline proxy can enforce before forwarding the stipulated request; visibility, routing, policy and bypass limits still matter.",
  "Validated TLS protects channel confidentiality and integrity between endpoints; multiplexing, compression and rate management are other functions.",
  "IP routing is a Layer 3 role, distinct from the stipulated Layer 2 switching/bridging and physical signal repetition.",
  "An enforced API boundary can add defence in depth, while a compromised application may still misuse permitted API operations.",
  "IPsec tunnel mode encapsulates original packets; confidentiality requires enabled ESP encryption, and AH supplies no encryption."
];
const contrasts=[
  [
    "The stipulated one-browser HTTP proxy does not route other applications' IP traffic.",
    "A website reverse proxy protects that application path rather than enforcing this endpoint-wide IP-routing policy.",
    "A standalone host-detection agent does not by itself establish the required encrypted gateway route."
  ],
  [
    "DNS returns name and other record information rather than issuing this dynamic host-address lease.",
    "LDAP accesses directory information rather than supplying the stipulated lease configuration.",
    "SNMP manages/monitors devices rather than providing this DHCPv4 lease exchange."
  ],
  [
    "The offered forward proxy mediates client-service requests rather than supplying the designated protected-zone administrative jump path.",
    "The offered application reverse proxy fronts service traffic rather than supplying the described administrative jump path.",
    "Web-content filtering restricts content rather than creating the stipulated administrative route."
  ],
  [
    "Compression changes representation/bandwidth rather than establishing trusted server identity.",
    "Idle timeouts can be separately configured and do not provide the distinguishing cryptographic identity binding.",
    "Login rate limits concern service/policy configuration rather than verified SSH host-key server authentication."
  ],
  [
    "TCP 23 conventionally denotes ordinary Telnet rather than the stipulated standard SSH listener.",
    "UDP 53 commonly carries DNS rather than the specified standard-port SSH administration.",
    "TCP 443 commonly carries HTTPS and may support other remote access, but this premise expressly chooses standard-port SSH."
  ],
  [
    "Fail-open permits traffic despite enforcement failure, unlike the supplied blocking behaviour.",
    "Load balancing distributes work or supports resilience but does not define whether this failed gateway allows traffic.",
    "A passive copy observes traffic rather than being the stipulated inline blocking enforcement path."
  ],
  [
    "Full tunnelling sends the required internet routes through the gateway too, contrary to the local-internet requirement.",
    "The offered inbound port forwarding changes service exposure rather than establishing the requested private routed tunnel.",
    "The offered public publishing changes internal-resource exposure rather than meeting the supplied private-access constraint."
  ],
  [
    "An offline archive supports later analysis rather than blocking the current upload before forwarding.",
    "A scheduled configuration report examines state rather than occupying the live request enforcement path.",
    "A passive tap sees copies; it does not itself block the original request, although other integrated controls may act."
  ],
  [
    "Multiplexing combines logical streams and does not encrypt or authenticate the stipulated contents.",
    "Header compression changes size/representation rather than making the original contents confidential.",
    "Flow control manages transmission rate rather than cryptographic confidentiality or integrity."
  ],
  [
    "The expressly Layer 2 switch forwards frames by MAC rather than carrying out the asked IP-routing role.",
    "A hub repeats signals without this IP-address forwarding decision.",
    "The expressly bridge-mode access point bridges links; integrated routing in other device modes is not the stipulated function."
  ],
  [
    "An enforced access boundary does not depend merely on secrecy of the design.",
    "Fail-secure describes a failure posture; the supplied scenario concerns layered access rather than a failure event.",
    "Non-repudiation concerns attributable action/origin evidence rather than this tier-access boundary."
  ],
  [
    "FTPS secures FTP transfer channels with TLS rather than being the dedicated IP-layer tunnel suite.",
    "SSH supports secure access/forwarding and can tunnel, but the dedicated IP-layer suite offered here is IPsec.",
    "LDAP accesses directory information rather than being the requested encrypted network-tunnel suite."
  ]
];
const families=[
  "remote_endpoint_route_policy_choice",
  "IPv4_dynamic_lease_protocol_recognition",
  "controlled_cross_zone_administrative_path_choice",
  "trusted_remote_server_identity_property_recognition",
  "standard_SSH_destination_port_recognition",
  "inline_enforcement_failure_behaviour_recognition",
  "remote_endpoint_route_policy_choice",
  "in_flight_supported_application_request_enforcement_placement",
  "transport_channel_confidentiality_integrity_property_recognition",
  "IP_forwarding_device_role_recognition",
  "layered_API_boundary_principle_recognition",
  "dedicated_IP_layer_tunnel_suite_recognition"
];
const preciseHolds=[
  null,
  "whole_numbered_DHCP_protocol_recognition_scope",
  null,
  "ordinary_Telnet_not_all_extensions_and_host_key_trust_scope",
  "whole_numbered_standard_port_lookup_scope",
  null,
  null,
  null,
  null,
  "whole_numbered_IP_routing_device_definition_scope",
  "whole_numbered_layered_principle_recognition_and_API_boundary_limit",
  "IPsec_suite_not_unconditional_encryption_or_same_subnet"
];
const roles=[
  "one_full_route_policy_choice_not_independent_coverage_components",
  "IPv4_lease_protocol_name_whole_scope_held",
  "controlled_admin_jump_path_choice",
  "host_key_server_authentication_property_qualified",
  "standard_port_lookup_whole_scope_held",
  "one_failure_behaviour_not_environment_appropriateness",
  "one_split_route_policy_choice_not_exposure_proof",
  "inline_request_enforcement_placement_choice",
  "one_combined_channel_property_choice_not_independent_components",
  "IP_routing_role_name_whole_scope_held",
  "one_layered_boundary_principle_name_whole_scope_held",
  "IP_layer_suite_choice_not_independent_AH_ESP_IKE_skills"
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
    "assessedCodes": [],
    "contextCodes": [
      "3.2"
    ],
    "status": "held_whole_numbered_protocol_port_device_or_principle_recognition_scope"
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
    "status": "held_whole_numbered_protocol_port_device_or_principle_recognition_scope"
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
    "status": "held_whole_numbered_protocol_port_device_or_principle_recognition_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.2"
    ],
    "status": "held_whole_numbered_protocol_port_device_or_principle_recognition_scope"
  },
  {
    "assessedCodes": [
      "3.2"
    ],
    "contextCodes": [],
    "status": "narrow_infrastructure_control_or_secure_communication_understanding_inferred_pending_owner"
  }
];
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();
assert.equal(selected.filter(r=>r.flags.stemChanged).length,5);assert.equal(selected.filter(r=>r.flags.optionsChanged).length,8);assert.deepEqual(selected.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m636']);
const questionProposals=selected.map((row,i)=>{
  const s=c.questions.get(row.recordId),q=s.q,shuffled=shuffle(q);assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);
  assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
  for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
  assert.equal(q.correct,s.preQuestion.correct);
  if(i<4){assert.equal(s.snapshots.length,1);assert.equal(s.captures.length,1);const replay=publicationPipeline(c.bank).overrides(s.snapshots).mcqs.find(x=>x.id===q.id),{_baseOrder,_adminOrder,...semantics}=replay;assert.equal(sig(semantics),row.revisions.localEffective);assert.equal(s.pub._adminOrder,s.captures[0].sort_order);if(i<3)assert.equal(s.authored,null);else{assert(s.authored);assert.notEqual(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);}}else{assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert(s.authored);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);assert.equal(q.correct,s.authored.correct);}

  return{recordId:row.recordId,questionId:q.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:i<4,sourceLayerDisposition:i<3?'snapshot_only_no_authored_or_imported_substitute':i===3?'authored_then_captured_snapshot_then_effective_editorial':'authored_equals_preeditorial_but_differs_from_effective',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',assessedUnderstanding:meanings[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],skillRoleProposal:roles[i],numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:families[i],familyStatus:'provisional_comparison_no_independence_approval',optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0}};
});
assert.equal(questionProposals.filter(r=>r.snapshotReplayChecked).length,4);assert.equal(questionProposals.filter(r=>r.revisions.authored===null).length,3);
const explanationProposals=questionProposals.map((parent,i)=>{
  const s=c.questions.get(parent.recordId),q=s.q,indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct);assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
  return{recordId:'explanation:'+parent.recordId,kind:'explanation_bundle',parentId:parent.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:parent.sourceRevision,parentPublishedRevision:parent.publishedRecordSignature,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:mainTeaching[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],withheldPreciseContrast:preciseHolds[i],roleProposal:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:contrasts[i][k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId)),broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('3.2')),old=broad.filter(r=>c.previous.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id)),counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
assert.equal(broad.length,220);assert.equal(old.length,39);assert.equal(selectedIds.size,24);assert.equal(remaining.length,157);assert.equal(broad.filter(r=>r.kind==='mcq').length,22);assert.equal(remaining.filter(r=>r.kind==='mcq').length,10);assert.equal(remaining.filter(r=>r.kind==='pbq').length,5);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,15);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,priorQuestions=bankRows.filter(r=>c.previous.has(r.recordId)),priorFeedback=bankRows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorQuestions.length,215);assert.equal(priorFeedback.length,215);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,priorQuestions:215,newQuestions:12,combinedQuestions:227,remainingQuestions:256,combinedMcqs:211,remainingMcqs:184,combinedLocalPbqs:16,remainingLocalPbqs:72,pairedFeedbackCombined:227,pairedFeedbackRemaining:256};
assert.equal(priorQuestions.filter(r=>r.kind==='mcq').length + 12,bankProgress.combinedMcqs);assert.equal(priorQuestions.filter(r=>r.kind==='pbq').length,16);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective31FinalHeldDispositions:base.explanationProposals.filter(r=>r.withheldPreciseContrast).map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal}))};
const legacy24=priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds,old23=legacy24.earlierHolds;
assert.equal(old23.objective23Holds.m305WholeScopeHold.objectiveScopeProposal.status,'held_whole_numbered_mitigation_choice_scope');assert.equal(old23.objective23Holds.priorHolds.m046HeldContrast,'named_individual_requirement_in_spear_phishing_wrong_feedback');assert.equal(old23.objective23Holds.priorHolds.m432WholeNumberedScopeHeld,true);assert.equal(old23.objective23FeedbackHolds.length,4);assert.equal(legacy24.objective24HeldDispositions.length,4);assert.equal(priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.objective24SecondHeldDispositions.length,3);assert.equal(priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.objective24FinalHeldDispositions.length,6);assert.deepEqual(priorHolds.inheritedHolds.inheritedHolds.objective25HeldDispositions.map(r=>r.withheldPreciseContrast),['zero_day_unknownness_and_numbered_gap_scope','separation_of_duties_permission_scope_exclusivity']);
assert.equal(priorHolds.inheritedHolds.objective31PriorityHeldDispositions.length,5);assert.equal(priorHolds.objective31FinalHeldDispositions.length,6);
const comparisonSpecs=[
  {
    "ids": [
      "mcq:m715",
      "mcq:m299",
      "mcq:m314",
      "mcq:m061",
      "mcq:m619",
      "mcq:m706"
    ],
    "meaning": "Full/split endpoint routing choices strongly correlate in one provisional route-policy family; a tunnel suite choice does not independently demonstrate route, DNS, identity or privacy coverage. Preserve physical/logical isolation and DNS-forwarding holds; a routed VPN is neither an air gap nor literally one trusted subnet."
  },
  {
    "ids": [
      "mcq:m420",
      "mcq:m636",
      "mcq:m418",
      "mcq:m314",
      "mcq:m714"
    ],
    "meaning": "Trusted server identity, conventional port lookup, combined channel-property recognition and IPsec suite identification are different scopes. Key presentation, signatures, port numbers and encryption labels do not prove trust, freshness or configured protection. Preserve prior attestation/crypto/PKI scope and implementation limits without independent identity components."
  },
  {
    "ids": [
      "mcq:m018",
      "mcq:m729",
      "mcq:m227",
      "mcq:m138",
      "mcq:m133",
      "mcq:m065",
      "mcq:m154",
      "mcq:m020",
      "mcq:m298"
    ],
    "meaning": "A gateway failure posture, controlled administrative path and layered API principle differ from observed containment or safety. Allowed API/admin traffic can still be abused; multiple logical layers need enforced identities/routes, and industry labels do not decide outage policy. Preserve safety, required-path, composite-control and physical-tier holds; no independently successful boundaries."
  },
  {
    "ids": [
      "mcq:m321",
      "mcq:m149",
      "mcq:m261",
      "glossary:ngfw",
      "glossary:waf"
    ],
    "meaning": "Supported in-flight proxy enforcement differs from cloud discovery and a specific decoded request-inspection premise. Products/integrations overlap and data/visibility/route coverage remain separate. Preserve CASB exact-scope and inspection-limit holds; current inline placement does not inherit a universal reverse-proxy or API-mode guarantee."
  },
  {
    "ids": [
      "mcq:m718",
      "mcq:m056",
      "mcq:m619",
      "mcq:m636"
    ],
    "meaning": "DHCP lease naming, IP-forwarding role, VLAN naming and standard SSH port lookup are prerequisites rather than measured applied infrastructure protection. Correct defensive snooping terminology does not independently assess configuration, and restricted device modes do not prove all integrated products have one function. Whole numbered scope and no independent evidence remain held."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids,comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const r=c.records.get(id),p=c.previous.get(id);assert(r);return{recordId:id,sourceRevision:r.sourceSignature,localRevision:r.localRevisionSignature??null,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null,status:selectedIds.has(id)?'current_substantive_disposition':p?'prior_disposition_reference_only':'inspection_only_no_new_credit'};}),newFamilyCredit:0,independenceApproved:false}));
const priorBatchComparisons=base.questionProposals.map(r=>{assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);return{recordId:r.recordId,sourceRevision:r.sourceRevision,publishedRecordSignature:r.publishedRecordSignature,feedbackRevision:c.records.get('explanation:'+r.recordId).sourceSignature,priorDecisionRevision:sig(r),status:'prior_substantive_reference_no_new_credit'};});
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'4fce668209f8f7ec670881abef0e4ad229c9527c',sourceBindings:[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective31-final-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective31-final-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)}],triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,baselinePriorQuestions:125,substantiveOverlayPackets:[firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json',basePath].map(path=>({path,sha256:hashFile(path)})),currentPriorQuestions:215},bankSignature:c.ledger.bankSignature,selectionPolicy:'First 12 of 22 undispositioned objective 3.2 MCQs by existing triage priority then record ID; structural cues do not prove correctness or semantic error',selectedQuestionRecordIds:ids.map(id=>'mcq:'+id),selectedFeedbackRecordIds:ids.map(id=>'explanation:mcq:'+id),deferredObjective32QuestionRecordIds:deferred.map(r=>r.recordId),questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorBatchComparisons,priorHolds,objective32Census:census,objective32Denominator:{broadCandidates:220,priorAgentDispositions:39,newAgentDispositions:24,combinedAgentDispositions:63,remaining:157,remainingByKind:counts(remaining)},remainingObjective32RecordIds:remaining.map(r=>r.id),bankProgress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};

function validate(value){
  assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);assert.deepEqual(value.sourceBindings,packet.sourceBindings);
  assert.deepEqual(value.selectedQuestionRecordIds,selected.map(r=>r.recordId));assert.deepEqual(value.selectedFeedbackRecordIds,selected.map(r=>'explanation:'+r.recordId));assert.deepEqual(value.deferredObjective32QuestionRecordIds,deferred.map(r=>r.recordId));
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
  assert.deepEqual(value.objective32Census,census);assert.deepEqual(value.remainingObjective32RecordIds,remaining.map(r=>r.id));assert.deepEqual(value.objective32Denominator,packet.objective32Denominator);assert.deepEqual(value.bankProgress,bankProgress);assert.deepEqual(value.separateAssessmentDenominator,packet.separateAssessmentDenominator);
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
  reject(p=>p.questionProposals[i].revisions.authored=i<3?p.questionProposals[i].revisions.preEditorialSnapshotMerged:null);
  reject(p=>p.questionProposals[i].snapshotReplayChecked=!p.questionProposals[i].snapshotReplayChecked);
  reject(p=>p.questionProposals[i].capturedOverrideBindings=i<4?[]:[{captureIdentityRevision:'invented'}]);
  if(i<4)for(const field of ['captureIdentityRevision','capturedAt','payloadFingerprint','snapshotRevision'])reject(p=>p.questionProposals[i].capturedOverrideBindings[0][field]='stale');
  reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);
  reject(p=>p.explanationProposals[i].parentLocalRevision=p.questionProposals[(i+1)%12].sourceRevision);
  reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%12].sourceRevision);
  for(let k=0;k<3;k++)reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');
}
for(const [i,h]of preciseHolds.entries())if(h)reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);for(const i of [1,4,9,10])reject(p=>p.questionProposals[i].objectiveScopeProposal.assessedCodes=['3.2']);
// Each inherited contrast is independently removable in a negative probe; the full chain stays bound.
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);
for(const path of holdPaths)reject(p=>{let target=p.priorHolds;for(const key of path.slice(0,-1))target=target[key];target[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{const old=p.priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
reject(p=>p.questionProposals[0].newFamilyCredit=1);reject(p=>p.questionProposals[0].humanApproved=true);reject(p=>p.questionProposals[0].primaryConceptProposal='invented');reject(p=>p.questionProposals[0].independentEvidence=true);
reject(p=>p.explanationProposals[0].deliveryGate='free_before_submission_all_options');reject(p=>p.explanationProposals[0].approvedRemediation=true);reject(p=>p.explanationProposals[0].distractorCorrections[0].assessedSecondary=true);reject(p=>p.explanationProposals[0].masteryWeight=1);
reject(p=>p.selectedQuestionRecordIds[9]=selected[0].recordId);reject(p=>p.questionProposals.pop());reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.deferredObjective32QuestionRecordIds.push(selected[0].recordId));
reject(p=>p.objective32Census.pop());reject(p=>p.objective32Census.push(p.objective32Census[0]));reject(p=>p.objective32Census.find(r=>r.recordId===remaining[0].id).status='new_agent_disposition_pending_owner');reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.separateAssessmentDenominator.privateVariants=0);
reject(p=>p.priorBatchComparisons.pop());reject(p=>p.questionProposals[0].objectiveScopeProposal={assessedCodes:['3.2','2.4'],contextCodes:[],status:'approved'});reject(p=>p.questionProposals[7].skillRoleProposal='observed_successful_upload_prevention');reject(p=>p.sourceBindings[0].sha256='stale');reject(p=>p.activationAllowed=true);for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
packet.negativeMutationChecks=negativeMutationChecks;
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(packet,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),packet,'Packet/source disposition drift');
const report=[
  '# Phase 2B-5 — objective 3.2 priority MCQs and feedback',
  '**NOT READY.** Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. Only this finite source-bound packet, report and focused audit change; existing helpers are reused without runtime/configuration/package or duplicate bank ledger changes.',
  '## Exact selection and census',
  '**12 of 22** undispositioned effective objective 3.2 MCQs in deterministic priority-descending/record-ID order: **'+ids.join(', ')+'**, with twelve paired feedback (**24 new pending agent judgments**). Deferred ten: **'+deferred.map(r=>r.questionId).join(', ')+'**. Effective stems, choices, keys, main and all wrong corrections, authored/preeditorial/snapshot inputs and capture metadata were read locally; machine triage prioritises reading and earns zero semantic credit.',
  'Objective 3.2 broad source-tag union: **220 records; 39 prior + 24 new = 63 pending agent dispositions; 157 remain**. Prior 39 comprise one deck container, thirteen flashcards and 25 glossary definitions, with no prior tagged MCQ/feedback judgments. Remaining: ten MCQs, five local PBQs, fifteen paired feedback and **127 support/instructional records**. Held judgments count as reviewed, not approved; source tags neither approve precise scope nor establish complete exam coverage.',
  '| Remaining kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
  'Bank: **215 prior + 12 new = 227/483 questions** and 227 paired feedback pending owner. These comprise **211/395 MCQs + 16/88 local PBQs**. **256 questions and 256 paired feedback remain**, comprising **184 MCQs + 72 local PBQs**. Two private variants, nine starter assessments and two guest demos remain separate; inspection/census references get no new substantive credit.',
  '## Twelve substantive judgments',
  '| ID | Priority | Effective understanding | Qualification |\n| --- | ---: | --- | --- |\n'+questionProposals.map(r=>'| '+r.questionId+' | '+r.sourcePriority+' | '+r.assessedUnderstanding+' | '+r.contentQualification+' |').join('\n'),
  '## Source precedence and every correction',
  'm715/m718/m729 are snapshot-only, with no authored/imported substitute. Their captured active upserts are dated 2026-07-09, 2026-07-12 and 2026-07-26 respectively; each snapshot payload matches the preeditorial input. False authored stem/options/feedback flags reflect null source, not unchanged snapshot teaching. m715 replaces an automatic-all-packets VPN claim with an explicitly full-route policy and bounded browser/website contrasts. m718 replaces DHCP-snooping-as-attack teaching with configured defence and narrows the initial exchange to IPv4. m729 qualifies jump-host hardening/authentication/auditing as configured duties rather than guaranteed built-ins. m718/m729 observed medium becomes easy; acronym labels are not independently assessed.',
  'm420 has authored input, then a captured active 2026-07-19 snapshot with domain 1, hard difficulty and metadata changes, then effective domain 3/easy qualified host-key teaching. Its authored easy differs from captured hard; neither is calibrated. All four actual production override-pipeline replays preserve effective semantics and captured administrative sort order, binding capture identity/date/payload fingerprint/snapshot hashes. No newer private payload is fetched or claimed.',
  'The remaining eight authored revisions equal preeditorial, differ from effective, and have no captures/snapshots. Only m636 has imported provenance (QB1 question 36), an observed input label rather than certification. Five authored stem differences are m636/m018/m299/m321/m418; m299 includes spelling. Eight option-list differences are m420/m018/m299/m321/m418/m056/m227/m314. All observed key indices remain unchanged, which does not establish unchanged tasks, contrasts or feedback.',
  'm636 adds explicit standard-port SSH/approved sources, replaces repeated generic wrong feedback and changes observed medium to easy. m018 replaces the compound failure-mode/environment task and universal industry choices with one failure-behaviour recognition. m299 simplifies labels and removes automatic DNS-filter/performance claims. m321 replaces a misleading reverse-proxy managed-device/API-impossibility taxonomy with supported inline request placement, observed hard to medium. m418 replaces narrow h2c/HPACK/CRIME claims with a plaintext-transport property task, authored domain 1 to effective domain 3. m056 restricts switch/access-point functions instead of generalising all products. m227 replaces a compound attack-surface/defence pair with one principle and adds explicit wrong feedback, observed hard/domain 1 to medium/domain 3. m314 removes legacy algorithm/one-pairing shorthand and adds explicit wrong feedback with encryption-enabled ESP/AH qualification. All difficulty remains observed and uncalibrated.',
  explanationProposals.map((r,i)=>'**'+ids[i]+' main:** '+r.mainTeachingUnderstanding+' Three wrong-option contrasts: '+r.distractorCorrections.map(d=>d.teachingRationale).join(' ')).join('\n\n'),
  '**36 effective wrong corrections** bind exact choice/correction/main/bundle/parent-local/parent-published revisions. Six precise holds cover m718 DHCP naming scope, m420 ordinary-Telnet/extensions/host-key trust, m636 port-lookup scope, m056 routing-definition scope, m227 principle-naming/API-boundary scope and m314 unconditional encryption/same-subnet shorthand. Four whole-numbered naming/lookup scopes retain 3.2 context with no assessed code; other eight narrow control/property scope proposals remain inferred pending owner, not approved whole-objective competence. No forced alternative code, assessed secondary concept, independent subcomponent, implemented remediation or learner recovery.',
  'All twelve actual fixed-randomness pure shuffles preserve keyed choice, choice multiset and selected-wrong correction remapping. MCQPractice/shuffle/wrong-feedback source units and practice selector match prior bindings. Main feedback requires submitted Pro; wrong feedback is conditional on the selected wrong option. Pool/set/guest delivery, browser entitlement/tooltip/disabled-option interaction and learner outcomes remain unobserved. No React, grading/session/storage/sync, telemetry, endpoint, VPN, DHCP, host key, API, upload, TLS, firewall, database, network, attack or recovery handler executes.',
  '## Correlation and primary references',
  comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
  'The prior ten final-3.1 questions have exact source/feedback/prior-decision references; all six final and five priority 3.1 holds remain. m715/m299 share a provisional endpoint route-policy family with zero independent credit. Compound full-route coverage, confidentiality/integrity and suite-choice labels are one keyed decision each; m018 no longer assesses environment suitability, and m227 no longer separately asks two principles. Canonical concepts, approved roles/families, calibrated difficulty, weights, evidence, human approval, useful teaching publication and activation remain zero/null/false.',
  '[CompTIA SY0-701 v7 §3.2](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) concerns applying infrastructure security through placement/zones/failure posture/inline-versus-tap, jump/proxy appliances, effective controls and secure VPN/TLS/IPsec access. Basic protocol/port/device/principle naming does not by itself establish whole applied-security competence. Other limited scope proposals remain inferred pending owner rather than official certification.',
  '[Microsoft VPN routing](https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/vpn/vpn-routing) distinguishes explicit split routes and force-tunnel defaults with more-specific route exceptions. This supports m715/m299 route-policy distinctions, not automatic DNS/leak/privacy, clean endpoints or measured performance. Neither a tunnel nor a gateway label verifies configuration.',
  '[RFC2131 §3.1](https://www.rfc-editor.org/info/rfc2131/) describes initial DHCPv4 leasing and abbreviated known-address flows. [Cisco DHCP snooping documentation](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst6500/ios/15-5SY/config_guide/sup2T/15_4_sy_swcg_2T/dhcp_snooping.pdf) describes defensive filtering/rate limits and configuration prerequisites; it is not a product selection or executed command. m718 does not assess configured defence or turn DHCPv4 DORA into every lease transaction.',
  '[RFC4253 §8](https://www.rfc-editor.org/info/rfc4253/) requires trusted host-key binding for active-attack resistance. [RFC2941](https://www.rfc-editor.org/info/rfc2941/) specifies Telnet authentication/encryption negotiation extensions, supporting the retained broad Telnet-cannot contrast hold while ordinary unprotected Telnet remains the intended comparison. These sources do not approve algorithms, verify a key, authenticate a learner or recommend obsolete deployment.',
  '[Microsoft Bastion security](https://learn.microsoft.com/en-us/azure/bastion/secure-bastion) illustrates explicitly required access/network/privilege controls around a managed administrative intermediary. Our inference is that the generic jump-server name cannot itself prove those controls, and not every bastion is solely a jump host. No cloud service is selected, configured or accessed.',
  '[Microsoft conditional app control](https://learn.microsoft.com/en-us/defender-cloud-apps/proxy-intro-aad) documents supported browser/session policy enforcement, routing and client-bypass considerations, including reverse-proxy and direct-browser paths. This bounds m321 inline placement without a universal proxy-product/API impossibility claim or importing discovery skill from m149.',
  '[TLS1.3 RFC9846 §1](https://www.rfc-editor.org/info/rfc9846/) describes peer channel confidentiality/integrity and application identity verification requirements; the formerly cited RFC8446 is superseded. This bounds m418 between endpoints, without claiming every byte/metadata hidden, safe payload, non-repudiation or blanket end-to-end protection across termination points. No historical HPACK/CRIME claim is carried into the current task.',
  '[ESP RFC4303 §1](https://www.rfc-editor.org/info/rfc4303/) makes security services depend on selected association options; [AH RFC4302](https://www.rfc-editor.org/info/rfc4302/) concerns authentication/integrity rather than confidentiality. This supports conditional m314 encryption teaching without adopting historical algorithm lists or proving tunnel negotiation/routing. [OpenSSH manual](https://man.openbsd.org/ssh.1) documents forwarding and tunnel-device support, qualifying the SSH contrast without running it. Shared channel labels do not grant independently assessed AH/ESP/IKE understanding.',
  '## Preserved holds and remaining work',
  'Preserve all eleven earlier 3.1 precise holds: m714/m294/m296/m619/m638 and m021/m061/m149/m161/m058/m298, including attestation coverage/freshness, cloud tenancy/definition scope, regional exceptions, logical/physical isolation, IaC/playbook overlap, CASB scope and logical-layer/physical-tier ambiguity. Preserve m134 zero-day unknownness/numbered gap, m014 SoD permission exclusivity; all 2.4 document/DNS/source/distribution/kernel/authentication/definition holds; m305/m046/m432/m135 and four 2.3 feedback holds; actor/supplier, crypto/PKI/PFS, channel, Unicode, PBQ grading, targeting and delivery qualifications. New reviews clear none of these.',
  'Objective 3.2 remains **157/220** undispositioned: ten deferred MCQs and their feedback, local PBQs **p035, p044, p073, p078, p082** and their feedback, and 127 support records. Objective 3.1 stays **99/220** pending with four PBQs p016/p022/p047/p077, four feedback and 113 support remaining. Objective 2.5 stays 30/66 with 36 support remaining; 2.4 stays 91/199 with 108 remaining; 2.3 stays 60/162 with 102 remaining; 2.2 stays 61/134 with 73 remaining. Support census is not substantive review.',
  'Private p017 remains sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42, unavailable/unreviewed and null trusted. Active package remains **1878 records / 435 identities; 489 unresolved mappings; 2954 review decisions; seven existing primary proposals**, SHA-256 056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97. All 25 release hashes stay unchanged. Protected private review, 36 unsupported local PBQ grammars, remaining bank/support coverage and owner decisions remain gates.',
  '**NOT READY.** LOCAL/OFFLINE/default-off/unwired/learner-invisible. Owner approval of precise scope, concepts, roles, family independence, difficulty, weights, evidence/calibration and useful teaching remains outstanding. No runtime/live/private/Phase3 changes, migration, activation, shadow writes, cohort, deployment or pricing/legal change.',
  '## Validation',
  'Run node '+scriptPath+' and npm run audit:content-mapping. Validate exact first twelve/ten deferred priority selection, 220-record census, 39 + 24 objective and 215 + 12 bank counts, four actual captured-snapshot pipeline replays, 36 correction bindings and twelve actual shuffle/remap probes. **'+negativeMutationChecks+' rejected mutations** cover source/trusted-ID substitutions, stale/erased/invented captures and replay/authored drift, erased qualifications/holds, swapped/stale feedback, false scopes/roles/components/weights/evidence/remediation, corrupt selection/census/denominators, every inherited precise hold, source drift, forbidden payload export and activation. Full mapping suite: 29 tests and deterministic package check; 25 release hashes unchanged. Task-only **[skip deploy]** commit/push.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE32_PRIORITY_MCQS_NOT_READY',reviewedIds:ids,deferredIds:deferred.map(r=>r.questionId),newDispositions:24,bankProgress,objective32:packet.objective32Denominator,snapshotReplays:4,wrongCorrections:36,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
