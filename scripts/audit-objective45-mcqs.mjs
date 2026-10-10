import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-objective45-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective45-mcqs-proposals.json',reportPath='docs/phase-2b5-objective45-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'1c6d3a6caf50b0c636e0f2c9ef709e959e5d448e638b9c7a3ddf9041cc3ef883');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);assert.equal(c.ledger.rows.filter(r=>legacyPrevious.has(r.recordId)).length,318);
const ids=["m443", "m712", "m730", "m637", "m616", "m069", "m407", "m456", "m634", "m356", "m144", "m184", "m278"];
const candidates=ids.map(id=>c.ledger.rows.find(r=>r.recordId==='mcq:'+id));
assert.equal(new Set(ids).size,13);assert(candidates.every(r=>r&&r.kind==='mcq'&&r.objectiveCodesObserved.includes('4.5')));
assert.deepEqual([...candidates].sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en')),candidates);
assert.deepEqual(candidates.map(r=>r.priorityScore),[135,130,130,55,40,35,35,35,30,25,20,20,20]);
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
assert.equal(inventory.length,60);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);
const excluded=candidates.filter(r=>c.previous.has(r.recordId)),selected=candidates.filter(r=>!c.previous.has(r.recordId));
assert.deepEqual(excluded,[]);assert.equal(selected.length,13);assert(candidates.every(r=>!c.previous.has('explanation:'+r.recordId)));
const exclusions=excluded.map(r=>{const p=c.previous.get(r.recordId);return{recordId:r.recordId,sourceRevision:r.revisions.localEffective,publishedRecordSignature:r.revisions.publishedCatalogue,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),priorFamilyLabel:p.row.familyLabelProposal,reason:'current_matching_prior_substantive_question_judgment_reused_feedback_still_unreviewed',newQuestionCredit:0,newFamilyCredit:0};});
const priorInventory=base.allPacketReconciliation.inventory;
assert.deepEqual(inventory.filter(r=>r.path!==basePath),priorInventory);
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorBank.length,360);assert.equal(priorFeedback.length,324);
const broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('4.5')),oldBroad=broad.filter(r=>c.previous.has(r.id));
assert.deepEqual(c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('4.5')&&!c.previous.has(r.recordId)).map(r=>r.questionId).sort(),[...ids].sort());
const reviews=[
  {
    "id": "m443",
    "meaning": "Choose filtering at the stipulated approved DNS resolver for central agentless malicious-domain resolution control.",
    "hold": "HOLD resolver policy as blocking every malicious connection or every BYOD device regardless of resolver enforcement. Direct-IP, cached names, alternate encrypted/plain resolvers, tunnels and off-network paths may bypass this boundary; DoH/DoT can also reach an approved filtering resolver and are not inherently malicious. Feed quality, policy exceptions, DNSSEC interaction and availability need validation. No blanket RPZ sinkhole action or product effectiveness is approved. Current stem supplies required resolver use rather than assuming all guest endpoints obey it; contrast the older DNS exfiltration/poisoning and enforced guest-boundary judgments without merging their families. No DNS query, feed, endpoint or bypass is tested.",
    "main": "Filtering applies to queries reaching the approved resolver; enforced use and bypass coverage require separate checks.",
    "contrasts": [
      "A managed host firewall can complement policy, but per-host configuration is not the requested central name-resolution control.",
      "EDR needs device-side deployment in this offered choice, outside the agentless requirement.",
      "A browser extension needs installation and does not cover every application or resolver path."
    ],
    "family": "approved_resolver_domain_filtering_choice"
  },
  {
    "id": "m712",
    "meaning": "Identify the switch as the authenticator in the explicitly supplied pass-through 802.1X exchange.",
    "hold": "HOLD role naming as proved admission, endpoint health, authorised application use or link encryption. The supplied switch relays EAP between endpoint and RADIUS; EAPOL and backend transport differ, and EAP methods/trust checks determine security. An authenticator can terminate some methods locally in other designs. Fail-open, guest/MAB exceptions, backend availability and actual policy can change admission. A CA may support EAP-TLS but is not the supplied port-enforcement role. Snapshot-only: do not invent an authored/imported source or endorse the old TACACS+ shorthand as universal EAP backend interchangeability. No switch, EAP method, certificate or RADIUS exchange executes.",
    "main": "The supplied switch controls the port and relays EAP; the backend server evaluates this authentication exchange.",
    "contrasts": [
      "The endpoint participates as supplicant; it is not the switch controlling port admission.",
      "This scenario assigns the authentication-server decision to RADIUS, distinct from the switch authenticator role.",
      "A CA issues certificates that a method may use; issuing them is not controlling this switch port."
    ],
    "family": "8021X_pass_through_authenticator_role_recognition"
  },
  {
    "id": "m730",
    "meaning": "Explain why an observable and spoofable MAC address is insufficient cryptographic device authentication.",
    "hold": "HOLD MAC allowlisting as useless for every administrative purpose or address spoofing as effortless guaranteed admission under other controls. Link-layer address knowledge is not cryptographic identity; enterprise authentication, encryption and enforced boundaries remain separate. Randomised addresses affect operational lists, and reboot persistence depends on configuration rather than universally losing entries. No vendor feature or universal frame-confidentiality/performance claim is certified. Snapshot-only; current options remove old rainbow-table, latency and duplicated collision text. Compare prior m147 MAC/SSID-versus-boundary contrast without new independent wireless evidence. No radio capture, impersonation, access point or connection is tested.",
    "main": "An address allowlist does not supply cryptographic proof of the device; observe/spoof risk remains even when the list persists.",
    "contrasts": [
      "The list compares configured address entries; an OUI/manufacturer prefix alone does not authenticate the device.",
      "Persistence is implementation-specific; mandatory reset on reboot is not the inherent security weakness.",
      "The address concerns a network interface, not a separate required address for every application."
    ],
    "family": "wireless_address_allowlist_authentication_limit"
  },
  {
    "id": "m637",
    "meaning": "Identify the supplied sensitive-data matching restriction as DLP capability rather than an appliance brand category.",
    "hold": "HOLD a matching payment-card pattern as proof of valid card data, malicious intent, regulatory violation or prevented exfiltration on every path. Context, classification, exception handling, false positives/negatives, encrypted/unsupported content and enforcement point matter. DLP may be integrated into NGFW/UTM/email/endpoint products; these are not mutually exclusive tool classes. Current capability options remove the imported DLP-versus-UTM/NGFW product overlap and replace generic repeated corrections. No independent pattern-analysis, compliance or incident evidence; no email, card data or DLP rule is inspected.",
    "main": "DLP governs sensitive-data handling; matching and blocking must be tuned and validated rather than assumed universally accurate.",
    "contrasts": [
      "Attack signatures identify intrusion patterns; the stipulated rule responds to protected data content.",
      "Failover preserves availability rather than detecting or restricting this sensitive content.",
      "Certificate validation concerns cryptographic trust, not the attachment content policy."
    ],
    "family": "sensitive_data_policy_capability_recognition"
  },
  {
    "id": "m616",
    "meaning": "Identify SPF from the stated source-IP authorisation check for the envelope-sender DNS policy.",
    "hold": "HOLD SPF pass as authenticated human sender, visible From alignment, safe content, DKIM signing or guaranteed delivery. MAIL FROM and HELO identities differ from the visible From field; mechanisms/includes, forwarding and DNS limits complicate a literal explicit-IP-list model. SPF results and receiver policy remain separate; alignment and DMARC policy are additional checks, not necessarily both SPF and DKIM passing. Imported generic corrections are replaced. Same provisional family as m144; no independently approved sender/authentication component or mail/DNS check.",
    "main": "SPF evaluates the source host for the envelope/HELO identity; visible-From alignment requires a separate DMARC evaluation.",
    "contrasts": [
      "DKIM validates a domain-key message signature, not this SPF source-IP policy check.",
      "DMARC uses aligned SPF or DKIM results and handling policy; SPF supplies the specified host check.",
      "NAC concerns network admission, not authorisation of mail-sending hosts for a domain."
    ],
    "family": "SPF_sending_host_authorisation_recognition"
  },
  {
    "id": "m069",
    "meaning": "Recognise stateful inspection as the capability tracking connection/session state.",
    "hold": "HOLD stateful as synonymous with safe application content, all packets of an established connection as legitimate, or firewall/proxy/NGFW/NAT functions as exclusive categories. Rules, state-table exhaustion, timeouts, asymmetric paths and protocol handling matter; UDP tracking differs from a TCP handshake. Static destination NAT is address translation; stateful NAT implementations may also track flows. Current feature question/options remove NGFW/proxy overlap from the authored firewall-type choice. No session table, packet, firewall rule or threat blocking is tested.",
    "main": "State tracking relates packets to connection context; policy and application safety still require separate evaluation.",
    "contrasts": [
      "Stateless filtering does not maintain the stipulated connection state; rule checks can coexist with stateful filtering.",
      "URL categories govern web destination policy rather than naming this connection-table function.",
      "Static destination translation does not itself name session inspection; translation and state tracking can coexist."
    ],
    "family": "stateful_connection_table_capability_recognition"
  },
  {
    "id": "m407",
    "meaning": "Identify the stipulated network-admission posture assessment as NAC.",
    "hold": "HOLD a device credential as proving patches or protection status, NAC as necessarily agentless or pre-admission checks as permanent safety. Reliable authorised posture collection, device identity, enforcement and reassessment require supported endpoint/product integration; evidence may be stale or forged. A WAF can consume external signals but request inspection alone does not supply the specified device checks. CRL status is only part of certificate validation; TLS certificates alone do not attest current software health. Current network-join premise removes authored HR-portal-only ambiguity. One combined decision, not separate patch/AV/certificate skills; same provisional posture family as m184/m634. No endpoint, credential or admission is tested.",
    "main": "NAC applies admission policy using posture evidence; certificate identity alone does not establish software compliance.",
    "contrasts": [
      "A WAF targets web requests and cannot infer these device-health facts from request inspection alone.",
      "Revocation checking does not itself establish patch status or active endpoint protection.",
      "TLS certificate exchange alone does not measure patch or protection status; authenticated posture evidence is additional."
    ],
    "family": "network_admission_posture_recognition"
  },
  {
    "id": "m456",
    "meaning": "Interpret mode 600 as owner read/write and zero group/other Unix permission fields on the supplied regular file.",
    "hold": "HOLD mode bits as universal owner-only actual access, owner as necessarily root, chmod changing ownership or this example as a command to run on /etc/shadow. Extended ACL masks/entries, capabilities/privileged access, filesystem/mount controls and existing open descriptors need separate evaluation; changing modes does not necessarily erase every ACL entry or revoke already-open access. File and directory execute/search semantics differ. Current regular-file bit interpretation removes authored root-only/PAM-specific policy guarantees. No new DAC canonical link, configuration skill or independently assessed octal components; no permission or system file is changed.",
    "main": "600 sets owner read/write and no group/other permission bits; actual ownership, ACLs and privileged access are separate.",
    "contrasts": [
      "The zero group/other fields do not give everyone read/write.",
      "The owner field is read plus write, without execute, and group is zero.",
      "600 sets neither owner execute nor group read/execute."
    ],
    "family": "Unix_regular_file_numeric_mode_interpretation"
  },
  {
    "id": "m634",
    "meaning": "Recognise the endpoint-compliance check used for network admission as posture assessment.",
    "hold": "HOLD posture checks as guaranteed malware-free admission, immediate remediation or a complete Zero Trust architecture. Evidence freshness, collector support/privileges, identity, policy exceptions and continued reassessment matter. Vulnerability scanning can supply evidence but is not identical to the specified compliance/admission process; DLP may coexist without measuring this baseline. Imported main is narrowed and fallback corrections replaced; stem/options/key unchanged. Strongly correlate m407/m184 in one provisional posture family rather than three independent health skills. No scan, baseline, admission or remediation executes.",
    "main": "Posture assessment compares endpoint condition with admission requirements; a passing snapshot does not prove ongoing safety.",
    "contrasts": [
      "A vulnerability scan may feed posture evidence; the specific admission-compliance process is posture assessment.",
      "Zero Trust is broader than this endpoint-compliance check and is not established by its name alone.",
      "DLP concerns sensitive-data handling rather than this patch/protection admission baseline."
    ],
    "family": "network_admission_posture_recognition"
  },
  {
    "id": "m356",
    "meaning": "Choose an authorised TLS interception proxy to inspect supported HTTPS content under the supplied visibility limitation.",
    "hold": "HOLD large HTTPS egress as confirmed theft, every DLP product as network-only/unable to see plaintext, or authorised interception as universally safe/compatible. Endpoint/application-side DLP differs from the supplied network visibility premise. The proxy terminates two TLS legs; validate upstream certificates, protect trust/signing keys and plaintext, and assess privacy/organisational authority, capacity, pinning, mTLS, application-layer encryption and protocol/bypass support. No universal legal mandate, exemption list, port-443 guarantee or latest product capability is inferred. Encryption retention can be analysed for metadata but does not alone produce plaintext. Existing encryption/PKI and guest-boundary holds remain separate; no proxy, decrypted content, key, network or user data is processed.",
    "main": "Supported TLS interception can expose plaintext for inspection while introducing another trusted endpoint and substantial validation/compatibility limits.",
    "contrasts": [
      "DNS logs give resolution metadata, not the TLS request/response plaintext.",
      "DNSSEC authenticates DNS data and does not decrypt TLS application content.",
      "Retaining encrypted packets alone does not supply decryption keys or application plaintext."
    ],
    "family": "authorised_TLS_interception_visibility_choice"
  },
  {
    "id": "m144",
    "meaning": "Recognise SPF as the domain mechanism authorising mail-sending hosts.",
    "hold": "HOLD the stem phrase on behalf of a domain as proof of visible From alignment or human/message legitimacy. SPF checks envelope-sender/HELO identity, is broader than a fixed IP list and can be affected by forwarding/DNS limits; DKIM signatures and DMARC aligned authentication are separate. DMARC does not require both checks to pass. S/MIME provides message signing/encryption with its own trust and recipient requirements, not DNS source-host policy. Current main narrows authored DNS-record shorthand; authored has no wrongFeedback, and effective corrections are specific. Same provisional family as m616 with zero independent coverage or mail verification.",
    "main": "SPF authorises source hosts for envelope/HELO identities; DMARC relates aligned authentication to the visible From domain.",
    "contrasts": [
      "DKIM signs covered message content/headers with a domain key rather than supplying the SPF sending-host policy.",
      "DMARC consumes aligned SPF or DKIM results; SPF names the source-authorisation mechanism asked about.",
      "S/MIME certificate message protection is not DNS authorisation of sending hosts."
    ],
    "family": "SPF_sending_host_authorisation_recognition"
  },
  {
    "id": "m184",
    "meaning": "Choose NAC with posture assessment for the stipulated personal-device VPN admission baseline.",
    "hold": "HOLD every personal device/product as supporting AV/patch posture checks, VPN identity/MFA as compliant endpoint health or quarantine as mandatory automatic remediation. Platform support, authorised collectors, privileges, freshness, fallback/exception policy and effective VPN enforcement must be verified. NAC assessment can deny/quarantine/restrict or direct remediation; it does not itself fix the device, and continuous checks are not universal defaults. VDI can integrate conditional access, and MFA can coexist with posture without supplying it alone. Current main removes automatic remediation-VLAN guarantee. Same provisional posture family as m407/m634; no independently assessed antivirus/patch/VPN skill or real personal-device inspection.",
    "main": "Network admission can use measured posture policy; noncompliance handling and remediation are configured outcomes requiring validation.",
    "contrasts": [
      "MFA addresses identity factors rather than supplying patch or antivirus facts by itself.",
      "A hosted desktop does not by itself implement this connecting-device admission posture check; integrations may add it.",
      "Content filtering targets accessible content rather than the specified endpoint-health baseline."
    ],
    "family": "network_admission_posture_recognition"
  },
  {
    "id": "m278",
    "meaning": "Select DMARC p=reject as the requested policy when neither SPF nor DKIM passes with visible-From alignment.",
    "hold": "HOLD failing just one check as DMARC failure when another aligned pass exists, or p=reject as universal enforced rejection/proof of benign mail. Receiver local policy may accept failures or reject passes; forwarding, discovery/alignment and exceptions matter. Current RFC9989 obsoletes RFC7489; historical reporting/sample/policy shorthand cannot be treated as current guaranteed behaviour. Reports are not universally received or safe to disclose, and this question does not assess configuration/rollout/report analysis. Current neither-aligned-pass stem replaces authored ambiguous failing-SPF-or-DKIM wording; no owner scope retag or independence approval. DNSSEC, SPF softfail and DKIM key length do not establish this disposition. No mail, DNS policy or receiver is tested.",
    "main": "DMARC can pass through either aligned SPF or aligned DKIM; reject requests failure handling subject to receiver discretion.",
    "contrasts": [
      "DNSSEC protects DNS-data authenticity, not the requested mail-authentication disposition.",
      "SPF softfail concerns source authorisation for envelope identity and is not this visible-From policy.",
      "A DKIM key size alone neither supplies aligned authentication for this message nor requests failure rejection."
    ],
    "family": "DMARC_aligned_failure_reject_policy_recognition"
  }
];
assert.deepEqual(reviews.map(r=>r.id),ids);
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();

const sourceChecks=candidates.map(row=>{
 const s=c.questions.get(row.recordId),q=s.q,pre=s.preQuestion,shuffled=shuffle(q);
 assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);assert.equal(q.correct,pre.correct);
 assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
 for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
 if(s.snapshots.length){assert.equal(s.snapshots.length,1);assert.equal(s.captures.length,1);const replay=publicationPipeline(c.bank).overrides(s.snapshots).mcqs.find(x=>x.id===q.id),{_baseOrder,_adminOrder,...semantics}=replay;assert.equal(sig(semantics),row.revisions.localEffective);assert.equal(s.pub._adminOrder,s.captures[0].sort_order);}
 else {assert.equal(s.captures.length,0);assert(s.authored);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);}
 assert.equal(s.authored===null,['m712','m730'].includes(q.id));assert.notEqual(sig(q.exp),sig(pre.exp));assert.notEqual(sig(q.wrongFeedback),sig(pre.wrongFeedback??null));
 return{recordId:row.recordId,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:s.snapshots.length>0,sourceLayerDisposition:s.authored===null?'snapshot_only_no_authored_or_imported_substitute':s.snapshots.length?'authored_then_captured_snapshot_then_effective_editorial':row.flags.importedSource?'imported_authored_equals_preeditorial_then_effective_editorial':'authored_equals_preeditorial_then_effective_editorial',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',authoredMissingWrongCorrections:s.authored===null?null:!s.authored.wrongFeedback,stemChangedFromPreeditorial:sig(q.q)!==sig(pre.q),optionsChangedFromPreeditorial:sig(q.opts)!==sig(pre.opts),mainCorrectionChanged:true,wrongCorrectionsChanged:true,optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0},status:'source_inspection_no_additional_question_credit'};
});
assert.equal(sourceChecks.filter(r=>r.snapshotReplayChecked).length,3);assert.equal(sourceChecks.filter(r=>r.stemChangedFromPreeditorial).length,11);assert.equal(sourceChecks.filter(r=>r.optionsChangedFromPreeditorial).length,8);assert.equal(candidates.filter(r=>r.flags.stemChanged).length,9);assert.equal(candidates.filter(r=>r.flags.optionsChanged).length,6);assert.deepEqual(candidates.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m637','m616','m634']);assert.equal(sourceChecks.filter(r=>r.authoredMissingWrongCorrections===true).length,4);
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
assert.equal(broad.length,169);assert.equal(oldBroad.length,37);assert.deepEqual(counts(oldBroad),{glossary_definition:28,keyword_guide:1,lesson:1,lesson_check:4,lesson_section:2,lesson_traps:1});assert.equal(selectedIds.size,26);assert.equal(remaining.length,106);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,4);assert.equal(remaining.filter(r=>r.kind==='pbq').length,4);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,combinedQuestions=new Set([...priorBank.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=bankRows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
assert.equal(combinedQuestions.size,373);assert.equal(combinedFeedback.size,337);assert.equal(paired.length,337);assert.equal(paired.filter(r=>r.kind==='mcq').length,321);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,olderQuestionOnlyDispositions:olderQuestions.length,allPacketPriorQuestions:priorBank.length,newQuestions:questionProposals.length,allPacketCombinedQuestions:combinedQuestions.size,remainingQuestionDispositions:483-combinedQuestions.size,combinedMcqs:bankRows.filter(r=>r.kind==='mcq'&&combinedQuestions.has(r.recordId)).length,combinedLocalPbqs:bankRows.filter(r=>r.kind==='pbq'&&combinedQuestions.has(r.recordId)).length,newFeedbackBundles:13,priorFullFeedback:priorFeedback.length,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.combinedMcqs,345);assert.equal(bankProgress.combinedLocalPbqs,28);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,36);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective46FinalHeldDispositions:base.explanationProposals.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal})),olderQuestionPacketBindings:olderQuestions.map(r=>({recordId:r.recordId,priorPacketPath:r.priorPacketPath,priorDispositionRevision:r.priorDispositionRevision,status:'existing_limits_preserved_no_full_feedback_or_approval_inherited'}))};
assert.equal(priorHolds.objective46FinalHeldDispositions.length,11);
const comparisonSpecs=[
  {
    "ids": [
      "m443",
      "m706",
      "m050",
      "m147"
    ],
    "meaning": "Approved-resolver filtering, encoded-DNS exfiltration, accepted cache poisoning and enforced guest traffic boundaries are different decisions. Prior resolver-safety, DNSSEC and segmentation holds persist. No cross-family merge, bypass success or independent remediation evidence follows."
  },
  {
    "ids": [
      "m407",
      "m634",
      "m184",
      "m712",
      "m621"
    ],
    "meaning": "Three posture-recognition questions share one provisional family. The 802.1X switch role and broader Zero Trust recognition concern different mechanisms; neither a certificate nor network admission proves continuing health. Device patch/AV/credential mentions are not separate assessed components. Preserve the prior m621 context-based trust judgment."
  },
  {
    "ids": [
      "m616",
      "m144",
      "m278"
    ],
    "meaning": "m616 and m144 share a provisional SPF sending-host recognition family; m278 names aligned-authentication reject policy. Visible From and envelope identities differ; either aligned authentication can pass. No independent mail deployment, DKIM-signature or DNSSEC competency is approved."
  },
  {
    "ids": [
      "m730",
      "m147",
      "m069",
      "m356"
    ],
    "meaning": "MAC identity weakness, guest boundary enforcement, session-state inspection and supported TLS content visibility are separate controls that can coexist. Earlier wireless/segmentation/PKI limits remain. A product name, option shuffle or different protocol noun does not establish a new independent family."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids.map(id=>'mcq:'+id),comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get('mcq:'+id),p=c.previous.get('mcq:'+id);return{recordId:s.row.recordId,sourceRevision:s.record.sourceSignature,localRevision:s.row.revisions.localEffective,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
const sourceBindings=[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective46-final-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective46-final-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)},...inventory.map(({path,sha256})=>({path,sha256}))];
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'a5171b3ef671458a6a10f5f93cf2f129a2d498ad',sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,legacyTrackedPriorQuestions:318},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences,status:'current_revision_bound_existing_question_judgments_no_new_credit_or_full_feedback_inference'},bankSignature:c.ledger.bankSignature,selectionPolicy:'Requested objective4.5 candidate set, ranked by existing structural triage then ID; all prior substantive packets reconciled before new question credit',candidateQuestionRecordIds:candidates.map(r=>r.recordId),selectedQuestionRecordIds:selected.map(r=>r.recordId),selectedFeedbackRecordIds:candidates.map(r=>'explanation:'+r.recordId),questionExclusions:exclusions,ambiguousPremiseOrContrastHolds:['mcq:m144','mcq:m356'],ambiguityDisposition:'qualified_pending_owner_not_resolved_or_approved',sourceChecks,questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorHolds,objective45Census:census,objective45Denominator:{broadCandidates:169,allPacketPriorDispositions:37,newQuestionDispositions:13,newFeedbackDispositions:13,newAgentDispositions:26,combinedAgentDispositions:63,remaining:106,remainingByKind:counts(remaining)},remainingObjective45RecordIds:remaining.map(r=>r.id),bankProgress,unchangedObjective46Progress:base.objective46Denominator,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},privateBoundary:{p017Revision:'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42',payloadReviewed:false,trustedRevisionId:null,localPilotFallbackDoesNotTransferToPrivate:true},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
function validate(value){
 assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);
 assert.equal(new Set(value.selectedQuestionRecordIds).size,13);assert.equal(value.questionProposals.length,13);assert.equal(value.explanationProposals.length,13);
 assert(value.questionProposals.every(r=>!c.previous.has(r.recordId)));assert(value.explanationProposals.every(r=>!legacyPrevious.has(r.recordId)));
 for(const r of value.questionProposals){const s=c.questions.get(r.recordId);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);}
 for(const r of value.explanationProposals){const s=c.questions.get(r.parentId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.record.localRevisionSignature);assert.equal(r.mainCorrectionRevision,sig(s.q.exp));assert.equal(r.wrongFeedbackRevision,sig(s.q.wrongFeedback));assert.equal(r.distractorCorrections.length,3);}
 // Every exported decision is checked against independently rebuilt current sources and fixed review judgments.
 const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);
}
let completedNegativeChecks;validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet);assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<13;i++){
 reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);reject(p=>p.questionProposals[i].trustedRevisionId=p.questionProposals[i].revisions.trustedCompilerObserved);reject(p=>p.questionProposals[i].contentQualification='');reject(p=>p.questionProposals[i].primaryConceptProposal='invented');reject(p=>p.questionProposals[i].humanApproved=true);reject(p=>p.questionProposals[i].newFamilyCredit=1);reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);reject(p=>p.questionProposals[i].familyLabelProposal='independent');reject(p=>p.questionProposals[i].objectiveScopeProposal={assessedCodes:['4.5'],contextCodes:[],status:'approved'});reject(p=>p.questionProposals[i].skillRoleProposal='invented');reject(p=>p.questionProposals[i].difficultyDisposition='calibrated');
}
for(let i=0;i<13;i++){
 reject(p=>p.sourceChecks[i].snapshotReplayChecked=!p.sourceChecks[i].snapshotReplayChecked);reject(p=>p.sourceChecks[i].revisions.authored=p.sourceChecks[i].revisions.authored===null?p.sourceChecks[i].revisions.preEditorialSnapshotMerged:null);reject(p=>p.sourceChecks[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);reject(p=>p.sourceChecks[i].optionShuffleProbe.feedbackRemapChecked=false);reject(p=>p.sourceChecks[i].sourcePriority=0);
 reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%13].sourceRevision);reject(p=>p.explanationProposals[i].parentLocalRevision='stale');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');reject(p=>p.explanationProposals[i].objectiveScopeProposal={assessedCodes:['4.5']});reject(p=>p.explanationProposals[i].mainCorrectionRevision='stale');reject(p=>p.explanationProposals[i].deliveryGate='all_before_submit');reject(p=>p.explanationProposals[i].approvedRemediation=true);
 for(let k=0;k<3;k++){reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].assessedSecondary=true);}
}
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);for(const path of holdPaths)reject(p=>{let r=p.priorHolds;for(const k of path.slice(0,-1))r=r[k];r[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{let old=p.priorHolds;for(let i=0;i<13;i++)old=old.inheritedHolds;old=old.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
for(let i=0;i<42;i++)reject(p=>p.allPacketReconciliation.olderQuestions[i].priorDispositionRevision='stale');
reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.allPacketReconciliation.olderQuestions.push(p.allPacketReconciliation.olderQuestions[0]));reject(p=>p.allPacketReconciliation.supportOnlyReferences[0].status='fully_reviewed');reject(p=>p.questionProposals.push({...p.questionProposals[0],recordId:ids[0]}));reject(p=>p.questionExclusions.push({recordId:'mcq:'+ids[0],newQuestionCredit:1}));reject(p=>p.ambiguousPremiseOrContrastHolds.pop());reject(p=>p.ambiguityDisposition='cleared');reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=373);reject(p=>p.objective45Census.pop());reject(p=>p.objective45Denominator.remaining=0);reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
completedNegativeChecks=negativeMutationChecks;
const exported={...packet,negativeMutationChecks};validate(exported);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const report=[
 '# Phase 2B-5 — objective 4.5 MCQs and complete feedback',
 '**NOT READY.** Review date: **11 October 2026**. Finite local draft only. Baseline **'+packet.baselineCommit+'**; packet SHA-256 **'+hashFile(packetPath)+'**. A disposition is a recorded judgment awaiting owner review. A hold preserves an unapproved claim without repairing learner content. MCQ means multiple-choice question; complete feedback means the main explanation plus all three wrong-choice corrections. This slice adds only its packet, report and focused audit.',
 '## Authority and finite selection',
 'The master plan and Phase 1 audit were read in full. Approved product decisions follow the master plan; the audit supplies historical implementation evidence. Current sources were checked again. No unresolved authority conflict affects this local review. New canonical mappings and scoring still require human review and separate approval.',
 'All thirteen effective objective4.5 MCQs were read in requested existing priority order: **'+ids.join(', ')+'**. Scores are **135,130,130,55,40,35,35,35,30,25,20,20,20**. Priority is a structural inspection order, not correctness or calibration. Every effective stem, offered choice, key, main and three wrong corrections was compared with the actual authored/imported or captured-snapshot source and preeditorial/effective precedence.',
 '**13 new question judgments + 13 new complete feedback judgments = 26 new pending rows.** All **60** existing substantive packets were hashed and reconciled against current row revisions first. No selected question or feedback bundle already has a substantive judgment; zero reused-parent exclusions, stale matching rows or private-source substitutions. Older question-only and support-link references receive no duplicate/new feedback credit. No additional source-insufficient row is deferred outside this finite set; qualifications remain pending, especially m144 envelope/visible-sender wording and m356 the unspecified network-only DLP visibility premise. No source hold is cleared.',
 'Only content understanding and provisional family comparisons are proposed. Every new objectiveScopeProposal, skillRoleProposal and feedback roleProposal is null. Primary concepts/trusted identities stay null, secondary/link arrays empty, and all weights/evidence/independence/publication/activation approvals false or zero. Difficulty is an observed uncalibrated source label. Neither protocol naming nor a correct option establishes operational skill.',
 '## Reconciliation and separate coverage',
 'The inventory verifies array and older dictionary source bindings. **42 distinct older question-only judgments (30 MCQs + 12 local PBQs)** remain reused history outside recent frozen-ledger overlays. Seventeen cross-packet reference occurrences receive no duplicate coverage. Twelve unmatched minimal link/context references, including five explanation links, remain outside complete-feedback or full-unit coverage. The ledger, helper, historical packets and active package are unchanged. **36** older question-only judgments still lack complete feedback.',
 '| Pending local coverage | Before | New here | After | Remaining |\n| --- | ---: | ---: | ---: | ---: |\n| All-packet question judgments | 360 | 13 | 373/483 | 110 |\n| Complete feedback judgments | 324 | 13 | 337/483 | 146 |\n| Question plus complete feedback pairs | 324 | 13 | 337/483 | 146 |',
 'Question coverage is **345/395 MCQs + 28/88 local PBQs**, leaving **50 MCQs + 60 PBQs**. Complete pairs are **321 MCQs + 16 PBQs**, leaving **74 MCQs + 72 PBQs** without complete feedback. These are pending local judgments, not approved learning evidence. The denominator remains483 local assessments; two private variants, nine starters and two guest demos are separate. Shuffles, comparisons and support links create no assessment coverage.',
 'Objective4.5 broad union: **169 records; 37 prior + 26 new = 63 pending dispositions; 106 remain**. Prior37 consists of28 glossary definitions and nine substantive PKI/email lesson-unit judgments: one lesson, one keyword guide, four checks/practice-keyword subunits, two sections and one traps unit. Existing narrow content understanding/holds are reused with zero duplicate credit, not recertified or granted new teaching roles. No prior question/complete-feedback row is in this objective union.',
 '**All13 effective objective4.5 MCQs and all13 paired MCQ feedback bundles now have pending judgments.** This closes the finite MCQ inventory, not the broader objective or approval process. Remaining: **four local PBQs**, **four PBQ feedback bundles** and **98 support/instructional records**. PBQ IDs: **'+remaining.filter(r=>r.kind==='pbq').map(r=>r.id).join(', ')+'**. The packet binds all169 census rows and all106 residual IDs. Private variants remain separate. Objective4.6 stays **89/151 pending dispositions,62 remaining**; no new4.6 review or credit.',
 '| Remaining objective4.5 kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
 '## Individual judgments and all correction contrasts',
 reviews.map(r=>'**'+r.id+' — new question and complete feedback.** '+r.meaning+'\n\n'+r.hold+'\n\nMain teaching: '+r.main+'\n\nWrong-choice contrasts, in current wrong-choice order: '+r.contrasts.map((t,k)=>(k+1)+'. '+t).join(' ')).join('\n\n'),
 'These are thirteen single keyed decisions. Patch/antivirus/certificate cues, TLS termination/inspection/re-encryption and octal permission fields do not yield independently scored components. Hold language does not fix the original learner wording or certify control efficacy.',
 '## Source precedence and delivery',
 '**Three selected snapshots, three captured bindings and three exact publication replays: m443,m712,m730.** Captured order and effective revision match after snapshot replay through the real editorial/publication pipeline. m443 has an authored source, with easy→medium snapshot difficulty before effective domain4 rewriting. **m712,m730 have no authored/imported alternative**; their snapshot-only content is inspected directly. Their frozen authored-comparison flags say no stem/options/feedback change because authored is null; direct snapshot-to-effective comparison instead shows all three changed. A false structural flag does not certify unchanged snapshot semantics.',
 '**Three imports: m637 (QB1 question37),m616 (question16),m634 (question34).** These actual imported/authored sources equal preeditorial revisions. Their generic repeated wrong corrections are replaced by specific effective contrasts. m637 changes capability options to avoid mutually exclusive DLP/UTM/NGFW appliance teaching; m616 narrows the SPF identity; m634 keeps stem/options/key while changing teaching.',
 'Across all13, **11 effective stems and eight option arrays differ from preeditorial**; frozen authored-comparison flags identify nine stems and six option arrays. All keyed positions remain unchanged; every main and wrong bundle changes. m634/m356 retain stems; m616/m634/m144/m184/m278 retain option arrays. m144/m184 stem differences are spelling normalisation, not independent new scenarios. Four authored rows lack wrongFeedback: **m356,m144,m184,m278**; effective editorial supplies specific corrections. All13 mains,39 choice/correction bindings and13 parent/feedback revisions are verified. **13 deterministic shuffle/remap probes** preserve the key and all wrong corrections, with zero family credit.',
 'Source qualifications: m443 adds enforced resolver use and bypass limits; m712 removes broad backend/TACACS+ shorthand; m730 replaces malformed/overbroad weakness options; m069 asks about capability rather than overlapping firewall types; m407 changes HR-portal context to actual network admission; m456 removes universal root-only /etc/shadow policy; m356 avoids competing all-HTTPS blocking options; m184 removes guaranteed remediation VLAN; m278 replaces ambiguous either-check-fails wording with neither-aligned-pass. None of these current-source observations changes learner content.',
 '| Question | Authored domain / difficulty | Preeditorial domain / difficulty | Effective domain / difficulty |\n| --- | --- | --- | --- |\n'+candidates.map(row=>{const s=c.questions.get(row.recordId);return'| '+row.questionId+' | '+(s.authored?s.authored.ch+' / '+s.authored.difficulty:'absent')+' | '+s.preQuestion.ch+' / '+s.preQuestion.difficulty+' | '+s.q.ch+' / '+s.q.difficulty+' |';}).join('\n'),
 'Ten preeditorial domain labels change to4; m069/m356/m184 already have4. Five medium labels become easy (m730,m637,m616,m069,m634); m278 easy becomes medium; m443 is authored easy→snapshot/effective medium. These are observed source metadata, not approved objective/difficulty retags. Feedback delivery remains conditional on selection, submission and entitlement, and wrong teaching depends on the submitted wrong choice. Static practice/shuffle/feedback/selector bindings match prior delivery. No browser pool/set/guest path, real DNS, EAP/RADIUS, radio, NAC posture, email, Unix permission, firewall, TLS proxy or receiver outcome is tested.',
 '## Provisional families and primary references',
 comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
 'm407/m634/m184 share one provisional network-admission-posture label, and m616/m144 share one provisional SPF sending-host label. m712 switch-role recognition, m730 address weakness, m443 approved-resolver filtering, m637 DLP capability, m069 state tracking, m456 numeric permissions, m356 TLS visibility and m278 aligned rejection policy are comparison labels only. No canonical merge, new independent scenario/family credit or operational approval. Prior PKI/email glossary/lesson dispositions do not constitute new complete feedback or independently delivered remediation here.',
 '[SPF RFC7208](https://www.rfc-editor.org/rfc/rfc7208.html) scopes source-host authorisation to MAIL FROM/HELO (§§2.3–2.4); it does not validate every other identity. Our inference keeps m616/m144 host checks distinct from visible-From alignment, safe message content and human identity.',
 '[DMARC RFC9989](https://www.rfc-editor.org/rfc/rfc9989.html) supersedes RFC7489/9091, defines aligned SPF-or-DKIM authentication and preserves receiver handling discretion (§5.4). Our inference keeps m278 neither-aligned-pass logic and reject-policy request separate from guaranteed rejection. Earlier RFC7489-based glossary/lesson holds remain unchanged; current standard publication does not silently approve or update their discovery/reporting/sample semantics. Reports and rollout are not assessed here.',
 '[EAP RFC3748](https://datatracker.ietf.org/doc/html/rfc3748) §2.3 defines pass-through forwarding and allows local method termination in other designs. [Cisco 802.1X guidance](https://www.cisco.com/c/en/us/support/docs/lan-switching/8021x/220919-troubleshoot-dot1x-on-catalyst-9000-seri.html) describes supplicant/authenticator/server roles and EAPOL versus RADIUS for the documented Catalyst/ISE versions. Our inference identifies the supplied switch role without certifying every vendor/version, admission result, posture or encryption.',
 '[Cisco ISE3.3 agentless posture example](https://www.cisco.com/c/en/us/support/docs/security/identity-services-engine/222260-configure-posture-agentless.html) requires reachable supported endpoints, administrative collection and particular condition support; its listed unsupported conditions include remediation and periodic reassessment. This is a dated implementation example, not a certification of current every-product features. Our inference retains m407/m634/m184 support, privilege, freshness and configured-enforcement limits. [NIST SP800-207](https://csrc.nist.gov/pubs/sp/800/207/final) distinguishes subject/device authentication and authorisation from implicit network/ownership trust; a posture check alone does not prove a whole Zero Trust architecture.',
 '[ISC RPZ documentation](https://www.isc.org/rpz/) describes policy response actions for queries reaching a resolver. Our inference retains m443 approved-resolver enforcement and alternate/direct-IP path limits, withholding advertised universal prevention and any vendor efficacy claim. DNS filtering, URL categories, traffic rules and telemetry are distinct functions.',
 '[NIST SP800-41r1](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-41r1.pdf) §2.1.2 describes connection state tables and distinct UDP handling. Our inference recognises the m069 function without treating all session traffic as benign or NAT/NGFW/proxy functions as mutually exclusive.',
 '[CISA counter-phishing guide](https://www.cisa.gov/sites/default/files/2023-09/CISA_CEG_Counter-Phishing_Guidance_for_Federal_Agencies%20Aug-23%20Revision.pdf) discusses HTTPS inspection tradeoffs and DLP/filtering as separate controls. Our inference retains m356 inspection/trust/compatibility limits and m637 content-policy versus product-class distinctions; it does not establish private-network authorisation, legal policy, plaintext availability or observed prevention. The linked historical HTTPS interception alert could not be retrieved directly in this review and is not treated as independently reverified.',
 '[GNU permission documentation](https://www.gnu.org/software/coreutils/manual/html_node/Setting-Permissions.html) and its [numeric-mode manual](https://www.gnu.org/s/coreutils/manual/coreutils.pdf) describe owner/group/other permission fields and owner read/write numeric modes. Only the indexed primary excerpts were retrievable for these pages; full-page retrieval was unavailable. Our inference confines m456 to the supplied regular-file permission bits while preserving ownership/ACL/privilege/open-access limits. No command was run against a user or system file.',
 '## Preserved holds and release boundary',
 'All eleven final objective4.6 precise holds are retained exactly, including m040 MAC/ABAC premise, m041 OTP activation, m072/m175 obsolete-access premise, m026 provisioning policy, m034 directory/Kerberos limits, m217 assertion validation and biometrics/SMS/location qualifications. The first eighteen4.6 and all earlier4.8/4.3/4.1/3.3/3.2/3.1/2.5/2.4/2.3/2.2/actor/supplier/crypto/PKI/PFS/channel/Unicode/PBQ grammar/grading/delivery/targeting holds remain in the inherited chain. m305 whole scope,m046 precise contrast and m432 whole numbered scope remain protected. Older42 question bindings, existing recovery/context limits and KEV/BOD26-04 current-policy uncertainty are preserved. This review transfers no prior pilot approval.',
 'Private p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, unavailable/unreviewed with null trusted identity. The older objective52 local fallback judgment does not review or transfer trust to that private variant. No private fetch/export/substitution. The packet exports no stems, offered choices, keys, option-indexed answers or learner records.',
 'Active package unchanged: **1878 records /435 identities /2954 review decisions /489 unresolved mappings /seven existing primary proposals**, SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All25 protected release hashes remain. Thirty-six unsupported local PBQ grammars, private-content review, remaining feedback/support coverage, substantive holds, owner decisions and calibration still block readiness.',
 '**NOT READY.** Local/offline/default-off/unwired/learner-invisible. No active package, runtime, canonical concept/role/tag, objective scope, skill, calibrated difficulty, teaching link, weight, publication, activation, learner evidence, shadow write, private processing, migration, cohort, live write, deployment or Phase3 change. Finite MCQ inventory closes; the broader phase and approvals remain open.',
 '## Validation and delivery',
 'Run node '+scriptPath+' and npm run audit:content-mapping. The focused audit rebuilds/matches the frozen ledger; verifies all60 prior packet/current-row bindings; confirms the exact13-MCQ set/priority; checks actual authored/imported/snapshot comparisons, three snapshot/capture publication replays,13 mains/39 wrong corrections,13 shuffle/remap probes, all169 census rows,106 residual IDs and separate question/feedback counts. **'+negativeMutationChecks+' rejected mutations** cover stale/trusted substitutions, source capture/replay fabrications, current/inherited hold erasure, cleared ambiguities, role/scope/difficulty/approval/weight changes, corrections, duplicate/missing inventory, support-link overcount, private fallback transfer, forbidden exports and activation.',
 'All29 mapping tests and deterministic package verification, all25 protected checksums, and git diff --check are required before committing only the three task files with **[skip deploy]**. Push completion requires exact equality of local HEAD,origin/main and remote refs/heads/main. The marker is checked with the configured Vercel ignore command; a source push does not establish live deployment. Browser/live/private delivery remains unverified, and unrelated dirty/generated files stay unstaged.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE45_MCQS_NOT_READY',candidateIds:ids,newQuestionDispositions:13,newFeedbackDispositions:13,bankProgress,objective45:packet.objective45Denominator,unchangedObjective46:packet.unchangedObjective46Progress,snapshotReplays:3,wrongCorrections:39,shuffleProbes:13,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
