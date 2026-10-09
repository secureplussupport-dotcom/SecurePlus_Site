import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';

const scriptPath='scripts/audit-objective41-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective41-mcqs-proposals.json',reportPath='docs/phase-2b5-objective41-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective33-mcqs-proposals.json',firstPath='docs/drafts/phase-2b5-objective23-fastlane-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'5a327c4cd187f9444397d7a8cdde49d17505cc7d24858edaa4cfd5bfb665dd14');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
// Only substantive arrays overlay the frozen inventory; inspection references earn no credit.
for(const path of [firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json',basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
  assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const ranked=c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('4.1')&&!c.previous.has(r.recordId)).sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en'));
const selected=ranked.slice(0,13),deferred=ranked.slice(13),ids=["m027", "m711", "m727", "m623", "m096", "m142", "m235", "m306", "m647", "m322", "m067", "m270", "m163"];
assert.equal(ranked.length,13);assert.deepEqual(selected.map(r=>r.questionId),ids);assert.deepEqual(selected.map(r=>r.priorityScore),[135,130,130,55,35,35,35,35,30,25,20,20,10]);
const meanings=[
  "Choose application-scoped management for personal-phone corporate apps without full-device enrolment; selective removal is not unique to MAM.",
  "Choose server-side permission checks for each requested object and action when a valid token still permits another user's private record; one authorisation fix.",
  "Choose the offered individual central-service enterprise wireless authentication exchange over shared credentials; encryption and trusted-server checks remain separate.",
  "Recognise MDM as the offered enrolled-mobile configuration and remote-command platform; whole numbered naming scope and completed wipe remain held.",
  "Choose enforced application control plus execution logging while preserving approved administration; one composite choice, not separate prevention/detection evidence.",
  "Choose an enforced approved-script policy boundary over a bypassable shell preference; actual interpreter/rule coverage remains required.",
  "Choose an inactivity lock with reauthentication to reduce unattended-session exposure, retaining the pre-lock access window and manual-lock need.",
  "Infer the supplied confirmed anonymous confidential-object download as public exposure; whole numbered hardening scope and broader bucket/remediation claims remain held.",
  "Recognise non-running source analysis as SAST; compilation is not excluded from all static analysis, and whole numbered method-naming scope remains held.",
  "Recognise earlier development security requirements/testing as shift left; whole numbered principle-naming scope and fixed savings claims remain held.",
  "Recognise company ownership with permitted personal use as COPE; CYOD selection can overlap, and whole numbered model-naming scope remains held.",
  "Recognise remembered HTTPS-only host policy as HSTS under the supplied valid-policy-learning premise; whole numbered header-naming scope remains held.",
  "Choose proper parameter binding for the shown untrusted SQL value instead of ad hoc quoting, length or case changes; no globally injection-free application is established."
];
const holds=[
  "HOLD selective wipe as unique to MAM, MAM as supporting every app/platform without enrolment, or app policy as complete device protection. The explicit no-full-device-enrolment requirement disambiguates this current app-management choice; app support, corporate/personal account separation and command delivery still matter. Full-device management can offer selective removal too, and MDM/MAM can coexist. COPE/COBO name employer ownership/use, not app-management techniques for these personal phones. The captured older stem relied only on avoiding full wipe; current wording adds the narrower enrolment requirement and main removes personal-data immunity. Authored hard, captured easy and effective medium are uncalibrated labels. One app-control choice gives no independent ownership, identity, wipe completion or privacy evidence. No phone, enrolment, corporate account, policy or deletion executes.",
  "HOLD valid tokens or OAuth metadata as automatically granting each object/action, checking one client-supplied user ID as complete authorisation, or token validation alone as a BOLA fix. Enforce server policy for the authenticated principal, tenant, requested object and operation; sharing/administrative roles may legitimately allow access beyond ownership, so owner-only equality is not a universal policy. Token scope/audience/lifetime and identity binding are separate requirements. Current single object-permission choice replaces snapshot compound API-function/BOLA/DoS wording and its token-prevents-BOLA/rate-limit-stops-DoS guarantees; no separate API-definition, authentication or rate-limit skill is assessed. Rate limits and opaque identifiers can complement controls but do not grant missing permission. Snapshot-only source, no authored substitute. Correlate prior m227 allowed-operation boundary; no API, token, identity, record request, cross-tenant read or successful fix is tested.",
  "HOLD an Enterprise/802.1X/EAP/RADIUS label as specifying a secure EAP method, directory mapping, mutual authentication, modern wireless suite or verified server identity. EAP methods and client profiles determine credentials and server-certificate validation; 802.1X access authentication is distinct from wireless cipher/key-handshake behaviour and can also apply to wired networks. Personal-mode authentication can be cryptographically strong, but the offered shared-password/voucher/address models do not meet the stipulated individual central-service requirement. Current options replace the snapshot ambiguous Enterprise/group-master-key distractor with expressly shared Personal mode; current main removes assigning the wireless four-way handshake directly to 802.1X. This is one combined framework choice, not independent EAP, RADIUS, directory or session-key evidence. Generic WPA-Enterprise naming is not a recommendation of every historical WPA suite. Snapshot-only, hard to medium uncalibrated. No supplicant, AP, RADIUS exchange, certificate or key derivation is tested.",
  "HOLD MDM naming as applied secure baselines, enrolment as proof of all required permissions/support, or sending a remote command as confirmed erasure. Supported operating systems, enrolment mode, connectivity and receipt/completion reporting govern actions; offline or failed commands leave data intact. UTM/NAC/XDR have different primary purposes but integrations can coexist, so product categories are not universally disjoint capabilities. Current stem bounds the target to enrolled corporate phones and requests commands, replacing authored all-device/encryption claims; three imported fallback corrections become specific contrasts. Imported QB1 question 23, domain 3 to 4 and medium to easy, uncalibrated. Hold whole 4.1 applied-technique scope for platform naming, retaining context without an alternate forced code. No device, baseline, encryption, management command or erasure occurs.",
  "HOLD an application-control label as a verified enforced allow policy, every unapproved script as wholly unable to run, or execution logging as blocking an attack. Interpreter/version/rule scope and allowed administrative paths matter; some enforcement constrains untrusted language features rather than rejecting every script. Audit mode alone is not the specified enforcement. Logs can be incomplete, disabled or unreviewed and need protected collection and response. Encoding can be legitimate or malicious, and representations vary; authentication/signatures do not prove safe code. Untested blanket removal risks required administration, without claiming removal can never be appropriate. Current generic enforcement/logging choice supersedes authored manually configured constrained-language/all-block-logging assertions and exclusive antivirus/patching contrasts. One composite decision has no separately scored prevention and detection components; strongly correlate m142 in one provisional family. No policy, PowerShell, encoded command, log or attack is executed.",
  "HOLD every application-control product/rule as rejecting all unapproved scripts, signed/approved scripts as necessarily safe, or execution-policy configuration as a security boundary against determined users. Enforce the intended policy across actual interpreters, trusted paths and allowed language features; application-control modes can constrain rather than prohibit some untrusted script execution. Audit-only mode is not the requested enforcement. The current key removes authored AllSigned/RemoteSigned as prevention of malicious unsigned scripts and replaces it with the desired enforced policy; approved-signature decisions remain separate from code safety. Firewall and FDE serve other boundaries and can coexist, but do not determine local script permission in the stated running session. Logging remains useful teaching, not a separately assessed control. Authored domain 2 becomes effective 4. Strongly correlate m096; no rule, signer, Windows endpoint, shell preference, script or bypass is tested.",
  "HOLD automatic locking as instant protection at departure, a screen saver as necessarily an authentication lock, or reauthentication as revoking every session/token and blocking all remote access. The inactivity threshold leaves an access window and must fit operational/accessibility needs; manual lock remains necessary when leaving. A lock protects the local interactive session, not stolen credentials or every background service. Current single configuration choice replaces authored compound policy-violation/security-champion/compensating-control labelling; no independent administrative-policy, control-category or security-culture skill is assessed. Password lifetime and hidden shortcuts do not impose the requested idle-session barrier. Authored domain 1 to effective 4 and medium to easy are uncalibrated source changes. No workstation, idle timer, authentication, lock, background service or exposure is tested.",
  "HOLD wildcard principal or one disabled public-access setting alone as universally anonymous readability, a single supplied object download as every object exposed, or exposure as proof of an actual breach or completed remediation. The effective premise supplies both an evaluated unauthenticated policy and successful confidential-object access; this is fictional source evidence, not our live bucket probe. Evaluate full policy/conditions, denies, resource scope, identity/KMS and public-access restrictions. At-rest encryption can coexist with an allowed service returning plaintext; its key length is not the stated access defect. Current evidence-based finding replaces authored Principal-star/all-files guarantee and unconditional block-public-access shortcut. Intended public service paths need impact review during remediation; verification must cover actual scope. Hold whole 4.1 applied-hardening scope for identifying a supplied finding, keep context only; authored domain 3 to 4. No bucket, file, policy, download, block setting, breach or fix is tested.",
  "HOLD SAST as always forbidding compilation, complete detection of logic/authorisation flaws, absence of false positives/negatives, or a result as confirmed exploitability. Static analysis does not execute the application under test; it can inspect source, bytecode or binaries and may require a build. The current stem describes a source-only tool that happens not to compile, rather than every implementation. Current main corrects the authored universal no-compilation statement and removes the imported page artifact; three fallback corrections become method-specific. DAST/fuzzing exercise software, while penetration assessments can include static review rather than being mutually exclusive tools. Hold whole 4.1 applied-security scope for method naming; correlate prior m157/m417 pre-provisioning inspection without merging IaC and application methods into independent evidence. Imported QB1 question 47; medium to easy uncalibrated. No scanner, build, app execution, finding or fix is tested.",
  "HOLD shift-left naming as completed SDLC security, dropping production/release checks, enforced CI/CD gates, universal earlier-is-cheaper economics or a fixed cost multiplier. The current requirement is early security integration, not moving organisation-chart/network sides or transferring all decisions to auditors. Security design, coding/build/testing and operational response can coexist; different checks require different artifacts and timing. Current options replace implausible handedness/chart distractors with lifecycle tradeoffs, and main removes authored 5-to-10-times per-phase guarantee. Hold whole 4.1 applied-technique scope for recognising a principle definition, with context only; strongly correlate m157/m417 earlier inspection without claiming a deployed scanner or separate phase components. Authored domain 3 becomes effective 4. No requirements, pipeline, scanner, release, incident response or savings measurement is executed.",
  "HOLD ownership/personal-use labels as maximum device control, all COPE devices as fully managed, automatic encryption/wipe or unlimited personal apps, and CYOD as a mutually exclusive ownership category. CYOD concerns selection from an approved list; its programme may also be corporate-owned and personally enabled. The current premise explicitly supplies employer ownership and permitted limited personal use, making COPE the most specific offered name, instead of authored MOST-control ranking. Actual management, privacy, app restrictions and enforcement depend on programme/platform policy. BYOD has personal ownership; COBO excludes the stipulated personal use. Hold whole 4.1 applied-technique scope for model naming with context only; correlate m027/m623 without conflating ownership with MAM/MDM. Medium to easy uncalibrated. No device purchase, ownership verification, enrolment, policy or wipe is performed.",
  "HOLD an HSTS header as protecting an unknown first HTTP visit without preload, the preload directive as completed list inclusion, every client as supporting/enforcing the policy, or HSTS as proving all traffic/content secure. The current stem explicitly supplies successful learning over valid HTTPS, fixing the authored bootstrap omission. Remembered host scope, expiry, subdomain inclusion, certificate trust/errors and supported user-agent behaviour matter; preload requires real acceptance/distribution and can affect subdomains. CSP can also request upgrading content, but it is not the offered remembered HTTPS-only host policy; framing and MIME controls have different purposes. Current main corrects directive-equals-preloaded wording. Hold whole 4.1 applied-hardening scope for header-name recognition, keep context only; prior TLS/host-key trust holds remain. Authored domain 2 to 4 and hard to medium are uncalibrated. No header, browser cache, TLS connection, preload submission or attack is tested.",
  "HOLD prepared-statement syntax alone as implemented safe binding, all SQL parts as parameterisable, a placeholder as a universal database-driver grammar, or one corrected value path as globally eliminating injection. Properly bind the shown untrusted value as data under a fixed query structure; identifiers/sort syntax and any downstream dynamic SQL need their own safe design. Ad hoc quoting, length and case changes alone do not supply this separation; a separately enforced allowlist/type conversion may constrain a specific value but is not the offered length-only control. Database authorisation/least privilege and output handling remain independent requirements. Current main removes authored unconditional never-interpreted-regardless-of-content teaching, while retained eliminates-risk stem is qualified to this correctly bound value path. Correlate m611/m012/m129 mechanism and m261/m286 filtering differences without independent role credit. Authored domain 3 becomes effective 4. No query, parameter, database, payload or remediation executes."
];
const mainTeaching=[
  "App management fits the no-full-device-enrolment scope when supported; selective removal alone does not distinguish every MAM/MDM deployment.",
  "Validate server-side permission for each object/action; token validity alone does not establish that access.",
  "Enterprise wireless can use the offered individual authentication exchange; method, server trust and cipher/handshake remain separate.",
  "MDM manages enrolled devices and sends supported commands; command submission is not completed erasure.",
  "Enforced application control restricts allowed behaviour while protected execution logs aid detection; neither label proves complete prevention.",
  "Use the actual enforced script-policy boundary rather than a bypassable shell preference; rule coverage and logging remain necessary.",
  "Inactivity locking imposes reauthentication after the threshold, leaving an earlier access window that manual locking reduces.",
  "The stipulated anonymous confidential-object access indicates exposure; restrict the unintended path and verify the full effective policy.",
  "SAST inspects a non-running application or its artifacts; it can include builds and does not validate every finding.",
  "Introduce security requirements/testing earlier while retaining later checks; no fixed savings ratio follows.",
  "COPE names employer ownership with permitted personal use; CYOD selection and management controls are separate dimensions.",
  "HSTS enforces remembered HTTPS for supported hosts/clients; accepted browser preload is separate from writing a directive.",
  "Proper parameter binding keeps the shown value separate from query syntax; other dynamic query fragments remain separate risks."
];
const contrasts=[
  [
    "Full-device management exceeds the expressly requested unenrolled app-only scope; it may nevertheless offer selective removal.",
    "COPE describes employer ownership and permitted personal use rather than managing these personally owned phones.",
    "COBO describes employer-owned business-only use, not an app-management method for personal phones."
  ],
  [
    "The token is already valid in the premise; keeping unchanged object permissions preserves the specific access defect.",
    "Per-IP limiting may reduce abuse volume but does not grant correct object/action permissions.",
    "Base64 is reversible encoding rather than an access-control decision; unguessable IDs also do not replace authorisation."
  ],
  [
    "The offered shared Personal-mode password does not establish individual central-service authentication; it need not be cryptographically weak.",
    "A shared voucher and observable MAC address do not implement the stipulated individual enterprise exchange.",
    "Changing a shared Personal-mode password does not create per-employee centrally managed authentication."
  ],
  [
    "Gateway UTM functions are not the primary mobile-enrolment/configuration role requested; integrated services can coexist.",
    "NAC governs admission/posture at network boundaries rather than primarily administering mobile configurations.",
    "XDR correlates detection/response rather than primarily managing mobile settings; response integrations do not make categories exclusive."
  ],
  [
    "Untested removal can disrupt the approved administration that the premise explicitly requires preserving.",
    "Encoding is not proof of malice and representation matching alone does not enforce permitted interpreter behaviour.",
    "Being signed in does not authorise every script or make execution safe."
  ],
  [
    "Firewall rules control network communication rather than the local script-approval decision.",
    "Stored-data encryption does not decide which scripts a running authorised session may execute.",
    "PowerShell execution policy is a bypassable safety/defence layer rather than the demanded malicious-user enforcement boundary."
  ],
  [
    "Removing a screen saver does not itself impose reauthentication after inactivity.",
    "Changing password expiry does not lock an already active unattended session.",
    "Hiding icons changes appearance rather than requiring authentication or limiting the current session."
  ],
  [
    "At-rest key length does not fix an allowed download path returning the object to an anonymous requester.",
    "The supplied evidence concerns read permission rather than backup retention.",
    "A session-free download is not fixed by changing expiry of authenticated user sessions."
  ],
  [
    "DAST observes the application running rather than the supplied source-only analysis.",
    "Fuzzing normally exercises inputs and behaviour rather than only inspecting this source structure.",
    "Penetration testing is a broader authorised assessment and may include static review; it is not the specific method name sought."
  ],
  [
    "Deferring until production discovers issues later rather than integrating earlier development checks.",
    "A release checklist alone does not replace security work during design, implementation and operation.",
    "External assurance can help but does not substitute for the team integrating security into development."
  ],
  [
    "BYOD supplies personal ownership, contrary to the stipulated employer-owned phones.",
    "CYOD concerns approved-list choice and can overlap with COPE; it does not alone specify ownership and permitted personal use.",
    "COBO excludes the personal use expressly permitted in this scenario."
  ],
  [
    "CSP constrains content and can request upgrades, but is not the persistent host HTTPS-only policy described.",
    "Framing restrictions address embedding/clickjacking rather than remembered HTTPS enforcement.",
    "MIME-sniffing restrictions address interpretation of content rather than remembered transport policy."
  ],
  [
    "Ad hoc quoting does not reliably preserve the intended code/data boundary across input and database grammar.",
    "A short input can still alter syntax; length-only validation is not parameter binding.",
    "Uppercasing does not keep untrusted SQL syntax from being interpreted."
  ]
];
const preciseHolds=[
  "MAM_supported_apps_and_nonexclusive_selective_wipe",
  "object_action_policy_not_token_or_owner_only",
  "enterprise_label_not_EAP_method_server_trust_or_key_proof",
  "whole_numbered_MDM_naming_and_command_not_erasure",
  "application_control_scope_and_logging_not_total_prevention",
  "app_control_not_universal_script_blocking",
  null,
  "whole_numbered_exposure_finding_and_single_object_scope",
  "whole_numbered_SAST_naming_and_compilation_scope",
  "whole_numbered_shift_left_naming_and_unmeasured_savings",
  "whole_numbered_COPE_naming_and_CYOD_overlap",
  "whole_numbered_HSTS_naming_and_bootstrap_preload_scope",
  "bound_value_path_not_global_SQL_injection_elimination"
];
const roles=[
  "unenrolled_corporate_app_management_choice",
  "per_object_action_authorisation_choice",
  "individual_enterprise_wireless_authentication_choice",
  "enrolled_mobile_management_platform_recognition",
  "approved_interpreter_use_control_and_logging_choice",
  "approved_script_execution_boundary_choice",
  "unattended_session_lock_configuration_choice",
  "confirmed_public_object_access_finding",
  "nonrunning_code_analysis_method_recognition",
  "earlier_SDLC_security_principle_recognition",
  "employer_owned_personal_use_model_recognition",
  "remembered_HTTPS_host_policy_recognition",
  "untrusted_SQL_value_binding_remediation_choice"
];
const families=[
  "unenrolled_corporate_app_scope_control_choice",
  "per_object_action_permission_enforcement_choice",
  "individual_central_wireless_authentication_choice",
  "mobile_configuration_command_platform_recognition",
  "approved_script_execution_policy_choice",
  "approved_script_execution_policy_choice",
  "inactivity_reauthentication_lock_choice",
  "confirmed_anonymous_confidential_object_exposure",
  "nonrunning_application_analysis_method_recognition",
  "early_SDLC_security_integration_principle_recognition",
  "corporate_owned_personal_use_model_recognition",
  "remembered_HTTPS_only_host_policy_recognition",
  "SQL_value_data_syntax_separation_choice"
];
const scopes=[
  {
    "assessedCodes": [
      "4.1"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_control_or_remediation_choice_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [
      "4.1"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_control_or_remediation_choice_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [
      "4.1"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_control_or_remediation_choice_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.1"
    ],
    "status": "held_whole_numbered_platform_finding_method_principle_model_or_header_recognition_scope"
  },
  {
    "assessedCodes": [
      "4.1"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_control_or_remediation_choice_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [
      "4.1"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_control_or_remediation_choice_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [
      "4.1"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_control_or_remediation_choice_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.1"
    ],
    "status": "held_whole_numbered_platform_finding_method_principle_model_or_header_recognition_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.1"
    ],
    "status": "held_whole_numbered_platform_finding_method_principle_model_or_header_recognition_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.1"
    ],
    "status": "held_whole_numbered_platform_finding_method_principle_model_or_header_recognition_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.1"
    ],
    "status": "held_whole_numbered_platform_finding_method_principle_model_or_header_recognition_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.1"
    ],
    "status": "held_whole_numbered_platform_finding_method_principle_model_or_header_recognition_scope"
  },
  {
    "assessedCodes": [
      "4.1"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_control_or_remediation_choice_pending_owner_not_whole_objective"
  }
];
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();
assert.equal(selected.filter(r=>r.flags.stemChanged).length,8);assert.equal(selected.filter(r=>r.flags.optionsChanged).length,7);assert.deepEqual(selected.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m623','m647']);
const questionProposals=selected.map((row,i)=>{
  const s=c.questions.get(row.recordId),q=s.q,shuffled=shuffle(q);assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);
  assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
  for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
  assert.equal(q.correct,s.preQuestion.correct);
  if(i<3){assert.equal(s.snapshots.length,1);assert.equal(s.captures.length,1);const replay=publicationPipeline(c.bank).overrides(s.snapshots).mcqs.find(x=>x.id===q.id),{_baseOrder,_adminOrder,...semantics}=replay;assert.equal(sig(semantics),row.revisions.localEffective);assert.equal(s.pub._adminOrder,s.captures[0].sort_order);if(i===0){assert(s.authored);assert.notEqual(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);assert.equal(q.correct,s.authored.correct);}else assert.equal(s.authored,null);}else{assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert(s.authored);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);assert.equal(q.correct,s.authored.correct);}


  return{recordId:row.recordId,questionId:q.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:i<3,sourceLayerDisposition:i===0?'authored_then_captured_snapshot_then_effective_editorial':i<3?'snapshot_only_no_authored_or_imported_substitute':'authored_equals_preeditorial_but_differs_from_effective',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',assessedUnderstanding:meanings[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],skillRoleProposal:roles[i],numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:families[i],familyStatus:'provisional_comparison_no_independence_approval',optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0}};
});
assert.equal(questionProposals.filter(r=>r.snapshotReplayChecked).length,3);assert.equal(questionProposals.filter(r=>r.revisions.authored===null).length,2);
const explanationProposals=questionProposals.map((parent,i)=>{
  const s=c.questions.get(parent.recordId),q=s.q,indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct);assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
  return{recordId:'explanation:'+parent.recordId,kind:'explanation_bundle',parentId:parent.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:parent.sourceRevision,parentPublishedRevision:parent.publishedRecordSignature,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:mainTeaching[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],withheldPreciseContrast:preciseHolds[i],roleProposal:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:contrasts[i][k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId)),broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('4.1')),old=broad.filter(r=>c.previous.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id)),counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
assert.equal(broad.length,203);assert.equal(old.length,17);assert.deepEqual(counts(old),{glossary_definition:17});assert.equal(selectedIds.size,26);assert.equal(remaining.length,160);assert.equal(broad.filter(r=>r.kind==='mcq').length,13);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);assert.deepEqual(remaining.filter(r=>r.kind==='pbq').map(r=>r.id),['pbq:p023']);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,1);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,priorQuestions=bankRows.filter(r=>c.previous.has(r.recordId)),priorFeedback=bankRows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorQuestions.length,245);assert.equal(priorFeedback.length,245);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,priorQuestions:245,newQuestions:13,combinedQuestions:258,remainingQuestions:225,combinedMcqs:242,remainingMcqs:153,combinedLocalPbqs:16,remainingLocalPbqs:72,pairedFeedbackCombined:258,pairedFeedbackRemaining:225};
assert.equal(priorQuestions.filter(r=>r.kind==='mcq').length+13,bankProgress.combinedMcqs);assert.equal(priorQuestions.filter(r=>r.kind==='pbq').length,16);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective33HeldDispositions:base.explanationProposals.filter(r=>r.withheldPreciseContrast).map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal}))};
assert.equal(priorHolds.objective33HeldDispositions.length,8);assert.equal(priorHolds.inheritedHolds.objective32FinalHeldDispositions.length,8);assert.equal(priorHolds.inheritedHolds.inheritedHolds.objective32PriorityHeldDispositions.length,6);
const prior17=old.map(r=>({recordId:r.id,sourceRevision:r.sourceSignature,priorPacketPath:c.previous.get(r.id).path,priorDispositionRevision:sig(c.previous.get(r.id).row),status:'prior_substantive_reference_no_new_credit'}));
const comparisonSpecs=[
  {
    "ids": [
      "mcq:m027",
      "mcq:m623",
      "mcq:m067"
    ],
    "meaning": "Unenrolled app management, enrolled-device command administration and corporate-ownership/personal-use naming are different dimensions. Selective deletion can overlap MAM/MDM, and CYOD can coexist with COPE. No ownership label proves privacy, configured management or completed wipe; no separate family independence is approved."
  },
  {
    "ids": [
      "mcq:m096",
      "mcq:m142",
      "mcq:m235",
      "mcq:m713"
    ],
    "meaning": "m096/m142 strongly correlate as approved-script execution-policy choices in one provisional family, with m096 adding logging as one composite keyed option. Audit evidence and authentication/signatures are not prevention or code safety. Inactivity lock instead concerns unattended interactive access; prior signature mismatch does not imply a single signer/policy cause."
  },
  {
    "ids": [
      "mcq:m711",
      "mcq:m163",
      "mcq:m306",
      "mcq:m227",
      "mcq:m611",
      "mcq:m012",
      "mcq:m129",
      "mcq:m261",
      "mcq:m286"
    ],
    "meaning": "Object/action permission, bound SQL value interpretation and public-object access findings describe different application/cloud boundaries. Prior SQL-flaw recognition and WAF parsing/filtering teach mechanisms rather than implementing parameter binding. An API tier or valid token cannot automatically authorise permitted operations. Preserve prior allowed-path, input, least-privilege and filtering holds without new independence or remediation credit."
  },
  {
    "ids": [
      "mcq:m727",
      "mcq:m270",
      "mcq:m152",
      "mcq:m420"
    ],
    "meaning": "Individual enterprise authentication, remembered HTTPS host policy, MAC-count admission and trusted SSH server identity have different trust and enforcement scopes. EAP/RADIUS labels, shared-key rotation, address observation and cached HTTPS policy are not interchangeable evidence. Preserve earlier identity/host-key/transport qualifications; no independent protocol components are scored."
  },
  {
    "ids": [
      "mcq:m647",
      "mcq:m322",
      "mcq:m157",
      "mcq:m417"
    ],
    "meaning": "Static application analysis, shift-left principle naming and pre-provisioning IaC inspection correlate in earlier security checks but are not identical tool/phase judgments. Compilation can support static analysis; later drift/runtime checks remain necessary. No scanner output, gate, economic multiplier or deployed security is established."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids,comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const r=c.records.get(id),p=c.previous.get(id);assert(r);return{recordId:id,sourceRevision:r.sourceSignature,localRevision:r.localRevisionSignature??null,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null,status:selectedIds.has(id)?'current_substantive_disposition':p?'prior_disposition_reference_only':'inspection_only_no_new_credit'};}),newFamilyCredit:0,independenceApproved:false}));
const priorBatchComparisons=base.questionProposals.map(r=>{assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);return{recordId:r.recordId,sourceRevision:r.sourceRevision,publishedRecordSignature:r.publishedRecordSignature,feedbackRevision:c.records.get('explanation:'+r.recordId).sourceSignature,priorDecisionRevision:sig(r),status:'prior_substantive_reference_no_new_credit'};});
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'da736744ad514165f965ffce50afe9af92b21ea4',sourceBindings:[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective33-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective33-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)}],triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,baselinePriorQuestions:125,substantiveOverlayPackets:[firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json',basePath].map(path=>({path,sha256:hashFile(path)})),currentPriorQuestions:245},bankSignature:c.ledger.bankSignature,selectionPolicy:'All 13 undispositioned objective 4.1 MCQs by existing triage priority then record ID; structural cues do not prove correctness or semantic error',selectedQuestionRecordIds:ids.map(id=>'mcq:'+id),selectedFeedbackRecordIds:ids.map(id=>'explanation:mcq:'+id),deferredObjective41QuestionRecordIds:deferred.map(r=>r.recordId),questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorBatchComparisons,priorObjective41Dispositions:prior17,priorHolds,objective41Census:census,objective41Denominator:{broadCandidates:203,priorAgentDispositions:17,newAgentDispositions:26,combinedAgentDispositions:43,remaining:160,remainingByKind:counts(remaining)},remainingObjective41RecordIds:remaining.map(r=>r.id),bankProgress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};

function validate(value){
  assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);assert.deepEqual(value.sourceBindings,packet.sourceBindings);
  assert.equal(value.status,'LOCAL_AGENT_REVIEW_NOT_READY');assert.equal(value.baselineCommit,packet.baselineCommit);assert.equal(value.bankSignature,packet.bankSignature);assert.deepEqual(value.instructionalProposals,[]);
  assert.deepEqual(value.selectedQuestionRecordIds,selected.map(r=>r.recordId));assert.deepEqual(value.selectedFeedbackRecordIds,selected.map(r=>'explanation:'+r.recordId));assert.deepEqual(value.deferredObjective41QuestionRecordIds,deferred.map(r=>r.recordId));
  assert.equal(new Set([...value.questionProposals,...value.explanationProposals].map(r=>r.recordId)).size,26);assert.equal(value.questionProposals.length,13);assert.equal(value.explanationProposals.length,13);
  for(const [i,r]of value.questionProposals.entries()){
    const s=c.questions.get(selected[i].recordId);assert.equal(r.recordId,selected[i].recordId);assert(!c.previous.has(r.recordId));assert.deepEqual(r.revisions,s.row.revisions);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);
    assert.deepEqual(r.capturedOverrideBindings,s.row.capturedOverrides);assert.equal(r.snapshotReplayChecked,s.snapshots.length>0);assert.deepEqual(r.triageFlags,s.row.flags);assert.equal(r.sourcePriority,s.row.priorityScore);assert.equal(r.difficultyObserved,s.q.difficulty);assert.equal(r.difficultyDisposition,'source_label_uncalibrated');assert.equal(r.familyStatus,'provisional_comparison_no_independence_approval');assert.equal(r.sourceLayerDisposition,questionProposals[i].sourceLayerDisposition);assert.deepEqual(r.optionShuffleProbe,questionProposals[i].optionShuffleProbe);assert.equal(r.assessedUnderstanding,meanings[i]);assert.equal(r.contentQualification,holds[i]);assert.deepEqual(r.objectiveScopeProposal,scopes[i]);assert.equal(r.skillRoleProposal,roles[i]);assert.equal(r.numberOfKeyedDecisions,1);assert.equal(r.familyLabelProposal,families[i]);
    assert.equal(r.trustedRevisionId,null);assert.equal(r.primaryConceptProposal,null);assert.deepEqual(r.secondaryConceptProposals,[]);for(const f of ['masteryWeight','newFamilyCredit'])assert.equal(r[f],0);for(const f of ['humanApproved','published','independentEvidence'])assert.equal(r[f],false);
  }
  for(const [i,r]of value.explanationProposals.entries()){
    const s=c.questions.get(selected[i].recordId),q=s.q,indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct);assert.equal(r.recordId,'explanation:'+s.row.recordId);assert.equal(r.parentId,s.row.recordId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.row.revisions.localEffective);assert.equal(r.parentPublishedRevision,s.record.sourceSignature);assert.equal(r.mainCorrectionRevision,sig(q.exp));assert.equal(r.wrongFeedbackRevision,sig(q.wrongFeedback));assert.equal(r.mainTeachingUnderstanding,mainTeaching[i]);assert.equal(r.contentQualification,holds[i]);assert.deepEqual(r.objectiveScopeProposal,scopes[i]);assert.equal(r.withheldPreciseContrast,preciseHolds[i]);assert.equal(r.deliveryGate,base.feedbackGate);
    assert.equal(r.distractorCorrections.length,3);for(const [k,d]of r.distractorCorrections.entries()){assert.equal(d.choiceRevision,sig(q.opts[indices[k]]));assert.equal(d.correctionRevision,sig(q.wrongFeedback[indices[k]]));assert.equal(d.teachingRationale,contrasts[i][k]);assert.equal(d.assessedSecondary,false);assert.equal(d.weight,0);}
    assert.equal(r.roleProposal,'conditional_parent_feedback_not_assessed_secondary');assert.equal(r.trustedRevisionId,null);assert.equal(r.primaryConceptProposal,null);assert.deepEqual(r.secondaryConceptProposals,[]);assert.deepEqual(r.conceptLinkProposals,[]);for(const f of ['masteryWeight','newFamilyCredit'])assert.equal(r[f],0);for(const f of ['humanApproved','published','independentEvidence','approvedRemediation','learnerObservedRecovery'])assert.equal(r[f],false);
  }
  assert.deepEqual(value.objective41Census,census);assert.deepEqual(value.remainingObjective41RecordIds,remaining.map(r=>r.id));assert.deepEqual(value.objective41Denominator,packet.objective41Denominator);assert.deepEqual(value.bankProgress,bankProgress);assert.deepEqual(value.separateAssessmentDenominator,packet.separateAssessmentDenominator);
  assert.deepEqual(value.priorObjective41Dispositions,prior17);assert.deepEqual(value.priorHolds,priorHolds);assert.deepEqual(value.comparisonGroups,comparisons);assert.deepEqual(value.priorBatchComparisons,priorBatchComparisons);assert.deepEqual(value.triageLedgerBinding,packet.triageLedgerBinding);assert.deepEqual(value.deliveryBindings,base.deliveryBindings);assert.equal(value.practiceSelectorBinding,base.practiceSelectorBinding);assert.equal(value.feedbackGate,base.feedbackGate);
  for(const f of ['activationAllowed','humanApproved','published','eligibleEvidence','scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved','tooltipDeliveryObserved'])assert.equal(value[f],false);assert.equal(value.masteryWeight,0);assert.equal(value.unchangedReleaseHashes,25);assert.equal(value.activeUnresolvedMappingsUnchanged, 489);
}
validate(packet);
let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet,'Negative mutation must actually change the packet');assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<13;i++){
  reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);
  reject(p=>p.questionProposals[i].trustedRevisionId=p.questionProposals[i].revisions.trustedCompilerObserved);
  reject(p=>p.questionProposals[i].contentQualification='');
  reject(p=>p.questionProposals[i].revisions.authored=p.questionProposals[i].revisions.authored===null?p.questionProposals[i].revisions.preEditorialSnapshotMerged:null);
  reject(p=>p.questionProposals[i].snapshotReplayChecked=!p.questionProposals[i].snapshotReplayChecked);
  reject(p=>p.questionProposals[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);
  reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);reject(p=>p.questionProposals[i].optionShuffleProbe.feedbackRemapChecked=false);
  reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');
  reject(p=>p.questionProposals[i].sourcePriority=0);reject(p=>p.questionProposals[i].familyLabelProposal='independent_new_family');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.questionProposals[i].triageFlags.optionsChanged=!p.questionProposals[i].triageFlags.optionsChanged);
  reject(p=>p.explanationProposals[i].parentLocalRevision=p.questionProposals[(i+1)%13].sourceRevision);
  reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%13].sourceRevision);
  for(let k=0;k<3;k++)reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');
}
for(const [i,h]of preciseHolds.entries())if(h)reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);for(const i of [3,7,8,9,10,11])reject(p=>p.questionProposals[i].objectiveScopeProposal.assessedCodes=['4.1']);
// Each inherited contrast is independently removable in a negative probe; the full chain stays bound.
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);
for(const path of holdPaths)reject(p=>{let target=p.priorHolds;for(const key of path.slice(0,-1))target=target[key];target[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{const old=p.priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
reject(p=>p.questionProposals[0].newFamilyCredit=1);reject(p=>p.questionProposals[0].humanApproved=true);reject(p=>p.questionProposals[0].primaryConceptProposal='invented');reject(p=>p.questionProposals[0].independentEvidence=true);
reject(p=>p.explanationProposals[0].deliveryGate='free_before_submission_all_options');reject(p=>p.explanationProposals[0].approvedRemediation=true);reject(p=>p.explanationProposals[0].distractorCorrections[0].assessedSecondary=true);reject(p=>p.explanationProposals[0].masteryWeight=1);
reject(p=>p.selectedQuestionRecordIds[12]=selected[0].recordId);reject(p=>p.questionProposals.pop());reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.deferredObjective41QuestionRecordIds.push(selected[0].recordId));
reject(p=>p.objective41Census.pop());reject(p=>p.objective41Census.push(p.objective41Census[0]));reject(p=>p.objective41Census.find(r=>r.recordId===remaining[0].id).status='new_agent_disposition_pending_owner');reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.separateAssessmentDenominator.privateVariants=0);
reject(p=>p.priorObjective41Dispositions.pop());reject(p=>p.priorBatchComparisons.pop());reject(p=>p.questionProposals[0].objectiveScopeProposal={assessedCodes:['4.1','2.4'],contextCodes:[],status:'approved'});reject(p=>p.questionProposals[7].skillRoleProposal='observed_bucket_remediation');reject(p=>p.sourceBindings[0].sha256='stale');reject(p=>p.activationAllowed=true);for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
reject(p=>p.status='READY');reject(p=>p.baselineCommit='stale');reject(p=>p.bankSignature='stale');reject(p=>p.instructionalProposals.push({recordId:'invented'}));
packet.negativeMutationChecks=negativeMutationChecks;
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(packet,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),packet,'Packet/source disposition drift');
const report=[
  '# Phase 2B-5 — objective 4.1 MCQs and paired feedback',
  '**NOT READY.** Local draft review only. Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. A pending agent disposition records a review and its limits. It does not approve owner decisions, learner scoring or production activation. Only this packet, report and focused audit change.',
  '## Exact selection and counts',
  '**Thirteen** current undispositioned effective MCQs, ordered by priority descending then record ID: **'+ids.join(', ')+'**. Scores: **135, 130, 130, 55, 35, 35, 35, 35, 30, 25, 20, 20, 10**. Every selected effective stem, option, key, main explanation and three wrong-choice corrections has been read. Each has sufficient local evidence; no candidate is deferred. Triage prioritises reading and supplies no semantic approval.',
  'Objective 4.1 broad source-tag union: **203 records; 17 prior + 26 new = 43 pending agent dispositions; 160 remain**. The prior seventeen are glossary definitions, not previously judged MCQs. New work is **13 questions + 13 paired feedback bundles**. All thirteen tagged MCQs and their feedback now have pending judgments, including holds. Remaining: **one PBQ (p023), its paired feedback and 158 support/instructional records**.',
  '| Remaining kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
  'Bank: **245 prior + 13 new = 258/483 questions**, with **258 paired feedback bundles** pending owner. These comprise **242/395 MCQs + 16/88 local PBQs**. **225 questions and 225 paired feedback remain: 153 MCQs + 72 local PBQs**. Support records in the broad census are not extra reviewed questions. Two private variants, nine starter assessments and two guest demos retain their separate denominator. Comparisons, shuffles and machine inventory earn no additional review credit.',
  '## What each question can establish',
  questionProposals.map(r=>'**'+r.questionId+' — priority '+r.sourcePriority+'.** '+r.assessedUnderstanding+'\n\n'+r.contentQualification).join('\n\n'),
  '## Source changes and every correction',
  'm027/m711/m727 each have one captured override and one snapshot. Three actual publication-pipeline replays reproduce the effective editorial revision and captured order. m027 has an authored source that differs from the captured preeditorial revision. m711/m727 are snapshot-only with null authored identities: no authored or imported substitute is invented. Their false authored-change flags do not mean their stem, options or feedback stayed unchanged. The other ten authored revisions equal their preeditorial revisions; all thirteen effective revisions differ from their preeditorial source. m623/m647 are imported **QB1 questions 23/47**. All keyed positions stay the same, which does not establish unchanged decision meaning.',
  'Eight authored-relative stem-change flags: **m027/m623/m096/m142/m235/m306/m067/m270**. Seven option-change flags: **m027/m623/m096/m142/m235/m306/m322**. m027 adds no full-device enrolment; m623 bounds the target to enrolled corporate phones and command submission; m096/m142 replace shell-preference/encoding shortcuts with desired script enforcement; m235 replaces compound policy/culture labels with idle-lock configuration; m306 adds evaluated anonymous access and a supplied confidential-object retrieval; m067 supplies ownership/use and asks for the most specific label; m270 supplies prior learning over valid HTTPS. m322 replaces implausible distractors with lifecycle tradeoffs. Snapshot-only m711 narrows compound API/token/rate-limit claims to per-object/action policy; m727 removes its ambiguous Enterprise/shared-key distractor and incorrect handshake attribution.',
  'm711/m727/m623/m306/m322/m163 move from source domain 3 to effective domain 4; m142/m270 move from 2 to 4, and m235 from 1 to 4. m027 difficulty moves authored hard → captured easy → effective medium. m711/m727 captured hard becomes effective medium; m623/m647/m067/m235 medium becomes easy; m270 hard becomes medium. Observed difficulty labels remain uncalibrated and do not alter scoring.',
  'Six authored rows lacked wrong-feedback bundles: **m142/m235/m306/m322/m270/m163** now have three effective corrections each. m623/m647 replace three generic imported fallback corrections apiece with specific contrasts. m027/m096/m067 have authored wrong-feedback to compare. m711/m727 replace snapshot corrections. Current main teaching narrows selective-wipe exclusivity, token/object permissions, wireless method/key roles, command-versus-erasure, shell policy, static-analysis compilation, fixed cost savings, ownership/control ranking, HSTS preload and globally safe SQL claims. These editorial differences are evidence to review, not publication or owner approval.',
  explanationProposals.map((r,i)=>'**'+ids[i]+' main teaching:** '+r.mainTeachingUnderstanding+'\n\nThree selected-wrong contrasts, in effective option-index order: '+r.distractorCorrections.map((d,k)=>(k+1)+'. '+d.teachingRationale).join(' ')).join('\n\n'),
  '**39 current wrong corrections** bind their choice, correction, main explanation, full bundle and parent local/published revisions. **Twelve precise holds** remain: m027 selective-wipe/app support; m711 object/action policy; m727 enterprise method/trust/key roles; m623 naming/command delivery; m096 application-control/logging coverage; m142 script enforcement; m306 whole-objective/single-object exposure scope; m647 static-analysis naming/compilation; m322 shift-left naming/economics; m067 COPE/CYOD naming overlap; m270 HSTS naming/bootstrap/preload; m163 the bound value path. m235 has general idle-window/session qualifications without a separate precise-contrast hold.',
  'Six whole numbered naming/finding scopes (**m623/m306/m647/m322/m067/m270**) retain 4.1 context with no assessed code. The other seven narrow control/remediation choices are inferred pending owner, not approved whole-objective competence. m096 prevention/logging and m727 authentication exchange are each one composite keyed choice, not independently scored components. No alternate forced code, canonical concept, assessed secondary role, family independence, weight, approved remediation or learner recovery is granted.',
  'Thirteen actual fixed-randomness pure shuffles preserve the keyed choice, choice multiset and selected-wrong correction remapping. Existing MCQPractice/shuffle/wrong-feedback source units and practice-selector signatures match the prior bindings. Main feedback is submitted-Pro gated; wrong feedback depends on the selected wrong choice. No browser entitlement, tooltip, disabled-option, pool/set/guest delivery or learner outcome is observed. No phone, management command, script, log, workstation, API/token/object request, wireless exchange, bucket download, scanner, pipeline, header/preload submission or SQL execution is performed. The successful download in m306 is a supplied fictional premise, not our live observation.',
  '## Family comparisons and primary references',
  comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
  'm096/m142 share the provisional approved-script execution family; logging in m096 does not earn a second evidence family. MAM/MDM/COPE concern app scope, device administration and ownership/use respectively. BOLA authorisation, SQL value binding and anonymous-object exposure are distinct boundaries. Generic wireless/header labels do not prove secure protocol configuration. Static-analysis and shift-left names correlate with earlier IaC inspection but do not establish configured tools or independent release gates. No topic bucket or option shuffle establishes a canonical family or independence.',
  '[CompTIA SY0-701 v7 §4.1](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) requires applying security techniques to computing resources. Recognising a supplied platform, model, method, principle, header or exposure finding can teach a prerequisite without demonstrating that whole applied scope. Our narrow scope judgments remain inferred pending owner and do not change active source tags.',
  '[Microsoft Intune app management](https://learn.microsoft.com/en-us/intune/app-management/overview) describes supported app/platform management with or without device enrolment and coexistence with device management. Our m027/m623/m067 inference keeps enrolment, ownership, app support and selective removal separate. A platform name or submitted command cannot prove completed erasure; no device action is executed.',
  '[Microsoft execution policies](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies) distinguishes shell safety settings from a security boundary. [Application control in PowerShell](https://learn.microsoft.com/en-us/powershell/scripting/security/app-control/application-control) describes enforced versus audit modes and language constraints on untrusted code. Our m096/m142 inference retains actual engine/rule coverage and logging limits instead of treating every application-control label as universally blocking scripts.',
  '[OWASP API broken object-level authorisation](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/) requires policy checks for the requested object/action. Token validity or opaque IDs alone do not supply that permission. Our m711 inference does not mandate ownership equality where legitimate sharing or administrator roles are allowed.',
  '[Microsoft NPS certificate requirements](https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-manage-cert-requirements) details EAP-TLS/PEAP certificate and client-trust requirements. Our m727 inference keeps specific EAP methods, trusted-server checks and wireless key/cipher behaviour separate from generic 802.1X/RADIUS naming; no directory or wireless configuration is verified.',
  '[AWS S3 public-access restrictions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) evaluates policy conditions and multiple blocking controls. Our m306 judgment uses the explicitly supplied anonymous confidential-object access, without generalising wildcard syntax or one disabled setting to every object or declaring an actual breach/remediation.',
  '[OWASP source-code analysis](https://community.owasp.org/Source_Code_Analysis_Tools) describes static methods, artifacts and accuracy limitations. Our m647 inference distinguishes not running the application from a universal prohibition on compilation. [NIST SSDF v1.1](https://csrc.nist.gov/pubs/sp/800/218/final) integrates security practices into development; it does not establish a fixed savings multiplier for m322 or eliminate later checks.',
  '[RFC 6797](https://www.rfc-editor.org/info/rfc6797/) describes learned host policy and bootstrap limitations. [Browser preload requirements](https://hstspreload.org/) distinguish eligibility/directives from actual submission, acceptance and distribution. Our m270 inference relies on the supplied prior valid-HTTPS learning premise; no preload submission or browser-cache state is verified.',
  '[OWASP SQL injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) separates bound values from query structure and identifies SQL syntax positions requiring other safe design. Our m163 inference limits the retained elimination claim to the correctly bound value path, preserving identifier, dynamic-SQL and driver-grammar qualifications. No query or fix is executed.',
  '## Preserved gates and remaining work',
  'All eight prior objective 3.3 precise holds remain: vaultless token/masking overlap, company tiers, residual identifiability, synthetic privacy/utility, CIA/modes, token variants, TLP/formal classification and state/transport shorthand. All fourteen prior 3.2 holds remain: eight final and six priority. The complete source-bound chain preserves eleven 3.1 holds and earlier objective2.5/2.4/2.3/2.2, actor/supplier, crypto/PKI/PFS, channels, Unicode, PBQ grammar/grading, delivery and targeting qualifications. New judgments clear none.',
  '4.1 remains **160/203** unreviewed records: p023, its feedback and 158 support records. 3.3 remains **130/164**: two PBQs, two feedback and 126 support; 3.2 remains **137/220**: five PBQs, five feedback and 127 support; 3.1 remains **121/220**: four PBQs, four feedback and 113 support. 2.5 remains 36/66 support; 2.4 remains 108/199; 2.3 remains 102/162; 2.2 remains 73/134. Inventories and completed MCQ slices do not establish completed phase coverage.',
  'Private p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, unavailable/unreviewed with null trusted identity. No private variant is inferred from local content. Active package remains **1878 records / 435 identities; 489 unresolved mappings; 2954 review decisions; seven existing primary proposals**, SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All 25 protected release hashes remain unchanged. Thirty-six unsupported local PBQ grammars, protected private review, remaining bank/support coverage and owner decisions remain gates.',
  '**NOT READY.** Local/offline/default-off/unwired/learner-invisible. Scope, canonical concepts/roles/families, independence, difficulty, weights, evidence/calibration and useful teaching still require owner approval. No runtime, private processing, live write, migration, activation, shadow write, cohort, deployment or Phase3 change.',
  '## Validation',
  'Run node '+scriptPath+' and npm run audit:content-mapping. The focused audit recomputes the exact thirteen/empty deferral, 203-record census, 17 + 26 objective and 245 + 13 bank counts, source provenance, three snapshot replays, 39 correction bindings and thirteen shuffle/remap probes. **'+negativeMutationChecks+' rejected mutations** cover source/trusted substitution, false authored/capture/replay/priority/flags/family, erased qualifications and every inherited precise hold, stale/swapped corrections, corrupt census/counts, unsupported scope/role/weight/evidence/remediation, forbidden payload export, ready-status substitution and activation. Full mapping suite: all 29 tests and deterministic package verification; 25 release hashes unchanged. Task-only **[skip deploy]** commit/push. Live/browser/private content is not checked.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE41_MCQS_NOT_READY',reviewedIds:ids,deferredIds:deferred.map(r=>r.questionId),newDispositions:26,bankProgress,objective41:packet.objective41Denominator,snapshotReplays:3,wrongCorrections:39,shuffleProbes:13,preciseHolds:preciseHolds.filter(Boolean).length,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
