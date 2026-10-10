import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-objective46-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective46-mcqs-proposals.json',reportPath='docs/phase-2b5-objective46-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective48-mcqs-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'22778131c06f01d50cac614bff2c4c1de24c6aea47d3e0f2369a3124610d7692');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);
const ids=["m721", "m726", "m180", "m216", "m224", "m318", "m319", "m408", "m614", "m006", "m215", "m229", "m355", "m077", "m108", "m119", "m120", "m343"];
const candidates=ids.map(id=>c.ledger.rows.find(r=>r.recordId==='mcq:'+id));
assert.equal(new Set(ids).size,18);assert(candidates.every(r=>r&&r.kind==='mcq'&&r.objectiveCodesObserved.includes('4.6')));
assert.deepEqual([...candidates].sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en')),candidates);
assert.deepEqual(candidates.map(r=>r.priorityScore),[130,130,35,35,35,35,35,35,30,25,25,25,25,20,20,20,20,20]);
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
assert.equal(inventory.length,58);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);
const excluded=candidates.filter(r=>c.previous.has(r.recordId)),selected=candidates.filter(r=>!c.previous.has(r.recordId));
assert.deepEqual(excluded,[]);assert.equal(selected.length,18);assert(candidates.every(r=>!c.previous.has('explanation:'+r.recordId)));
const exclusions=excluded.map(r=>{const p=c.previous.get(r.recordId);return{recordId:r.recordId,sourceRevision:r.revisions.localEffective,publishedRecordSignature:r.revisions.publishedCatalogue,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),priorFamilyLabel:p.row.familyLabelProposal,reason:'current_matching_prior_substantive_question_judgment_reused_feedback_still_unreviewed',newQuestionCredit:0,newFamilyCredit:0};});
const priorInventory=base.allPacketReconciliation.inventory;
assert.deepEqual(inventory.filter(r=>r.path!==basePath),priorInventory);
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorBank.length,331);assert.equal(priorFeedback.length,295);
const broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('4.6')),oldBroad=broad.filter(r=>c.previous.has(r.id));
const reviews=[
  {
    "id": "m721",
    "meaning": "Identify relying-party scope and service verification of signed origin-related data as the supplied passkey phishing resistance.",
    "hold": "HOLD a credential being mathematically tied to every exact URL, every authenticator recognising malicious gateways, or passkeys securing every later session cookie. RP-ID scope, client origin, challenge/type and signed-data checks require correct relying-party configuration; valid subdomains/related-origin policies can differ from one exact origin. Endpoint compromise, session theft, weak enrolment/recovery and implementation bypass remain risks. Hardware and synced credential storage differ. One composite keyed choice, not independent origin/signature/transport skills; correlate m216 method recognition and m408 user verification without new independence. Snapshot-only: no authored/imported substitute and no browser/authentication test.",
    "main": "Correct RP/origin validation resists lookalike-domain credential use; it does not eliminate endpoint, recovery or session compromise.",
    "contrasts": [
      "The RP stores the public key; secrecy of that public value is not the phishing defence.",
      "An authenticator is not a classifier for every malicious remote gateway.",
      "Authentication does not encrypt or guarantee security of every later session cookie."
    ],
    "family": "WebAuthn_RP_origin_phishing_resistance"
  },
  {
    "id": "m726",
    "meaning": "Recognise SAML from the supplied cross-domain identity assertion and signed XML exchange.",
    "hold": "HOLD any signed XML as necessarily SAML, every IdP/SP pair as interoperable, or protocol naming as valid federation. Authentication, attributes and authorisation statements differ; the SP still applies access policy. Validate issuer, trusted signature key, audience/recipient, time and request/replay binding for the actual profile. XML/signature does not imply encryption or theft-proof bearer sessions. Kerberos supports cross-realm trust and delegation; RADIUS/LDAP can participate as backends. Compare m108 SSO and m077/m319 OAuth without merging all identity protocols. Snapshot-only; no actual assertion or login is validated.",
    "main": "SAML exchanges XML identity assertions between security domains; the exact federation profile and validation remain separate.",
    "contrasts": [
      "RADIUS commonly supplies network-access AAA, not this described XML assertion exchange.",
      "LDAP accesses directory data and can back an IdP; it is not the specified assertion standard.",
      "Kerberos uses tickets and can cross realms; it does not use the described SAML assertions."
    ],
    "family": "SAML_federated_assertion_recognition"
  },
  {
    "id": "m180",
    "meaning": "Choose privileged credential vaulting plus authorised-use rotation over sharing, renaming or extending validity.",
    "hold": "HOLD vaulting/rotation eliminating theft or making every stolen secret immediately unusable. Restrict vault access, validate rotation timing/dependencies, service availability and break-glass access. A vault is itself a valuable target; issued tokens/live sessions and permissions need separate revocation. One composite choice does not assess vault, rotation, approval and auditing independently. Renaming may reduce trivial targeting without protecting the secret. Compare m318 privileged identity hygiene without assuming one independent operational result. No secrets or PAM configuration are changed.",
    "main": "Vaulting limits secret exposure and rotation can shorten useful stolen-secret lifetime; it does not eliminate all credential or session risk.",
    "contrasts": [
      "Sharing increases exposure and weakens individual accountability.",
      "A different account name does not protect the underlying secret.",
      "Longer validity extends potential exposure rather than improving secure storage."
    ],
    "family": "privileged_secret_vault_rotation_choice"
  },
  {
    "id": "m216",
    "meaning": "Recognise FIDO2/WebAuthn from the explicitly supplied WebAuthn API and signed public-key challenge.",
    "hold": "HOLD all FIDO2 credentials as hardware-only, passwordless, multifactor or never leaving their original device. Synced passkeys have different storage properties. RP-ID/origin/challenge validation and registration trust remain implementation requirements. Smart cards can also use public keys; the explicit API disambiguates this item. Recognition does not verify phishing resistance, UV enforcement or session safety. Correlate m721/m408; no independent component credit or hardware/API execution.",
    "main": "The WebAuthn API identifies this approach; public-key use alone would not exclude certificate smart cards.",
    "contrasts": [
      "TOTP uses shared-secret time codes rather than this WebAuthn challenge.",
      "Certificate smart cards can use public keys, but the explicit WebAuthn API identifies the offered method.",
      "RADIUS network AAA is not this browser credential API."
    ],
    "family": "WebAuthn_protocol_recognition"
  },
  {
    "id": "m224",
    "meaning": "Choose access removal plus enforced current client-certificate revocation checks for departed-user mTLS access.",
    "hold": "HOLD publishing revocation as guaranteed immediate denial or a server-certificate Must-Staple extension as automatic client-certificate revocation enforcement. The server verifies client identity; CRL/OCSP freshness, caching, fail policy and availability need actual validation. Existing TLS connections, sessions, tokens and application access require separate handling. A still-valid certificate is not ongoing employee authorisation; changing a display label does not alter the signed certificate/key. Preserve earlier PKI/revocation limits; no universal employment deadline or legal guarantee. No certificate, server or account is changed.",
    "main": "Remove authorisation, revoke the credential and verify current checks at the client-certificate verifier; publication alone is insufficient.",
    "contrasts": [
      "Waiting preserves the access window for an otherwise valid credential.",
      "Pinning can preserve trust in the departed credential rather than revoke it.",
      "A display label does not invalidate the key or change server authorisation."
    ],
    "family": "departed_client_certificate_access_revocation"
  },
  {
    "id": "m318",
    "meaning": "Choose MFA-protected emergency administrator access and separate least-privilege identities for routine work.",
    "hold": "HOLD all MFA as phishing-proof, routine role labels as verified least privilege, or blind key deletion as safe emergency access. Validate recovery, monitored break-glass access, actual permissions and availability. The generic cloud premise does not establish a particular AWS/CIS control number or rating. One combined decision is not independently tested MFA, role separation, audit or key hygiene. Correlate m180 without claiming a vault deployment. No administrator, credential or cloud account is modified.",
    "main": "Protect high-impact credentials and separate routine permissions while retaining controlled, tested emergency access.",
    "contrasts": [
      "Routine use increases exposure rather than providing reliable monitoring.",
      "Password sharing exposes a powerful secret and weakens accountability.",
      "Renaming changes neither authentication strength nor granted privilege."
    ],
    "family": "emergency_privileged_identity_hygiene"
  },
  {
    "id": "m319",
    "meaning": "Choose narrowly scoped OAuth access tokens for the supplied calendar resource delegation.",
    "hold": "HOLD OAuth alone as client identity login, all tokens as JWTs or necessarily short-lived, or stated scopes as proof the resource server enforces the intended limits. Validate audience, actual authorisation, expiry, redirect/transport and appropriate flow/PKCE controls separately. Malicious consent can grant an attacker legitimate scoped access; no password sharing does not eliminate bearer/session theft. OIDC adds an identity layer with its own ID-token validation. This rewritten item does not assess the older SPA PKCE-flow decision. Strongly correlate m077 in one provisional delegated-resource family; no grant or network request executes.",
    "main": "OAuth delegates resource access; resource-server enforcement and secure grants matter, while OIDC identity validation is a separate task.",
    "contrasts": [
      "Sharing exposes the primary password and bypasses limited delegation.",
      "An unrestricted admin key exceeds the event-reading requirement.",
      "Exporting a session cookie leaks an existing session instead of establishing controlled delegation."
    ],
    "family": "OAuth_delegated_resource_access"
  },
  {
    "id": "m408",
    "meaning": "Distinguish required local user verification from mere possession or touch of a lost FIDO2 key.",
    "hold": "HOLD all FIDO2 modes as requiring PIN/biometric verification, touch as user verification, or a signed UV flag as unique natural-person identity. The RP must require and check UV; local PIN/biometric activates signing rather than exporting the private key. Shared PINs/enrolment, unlocked state, sensor errors, weak recovery and endpoint compromise remain risks. Revoke lost credentials and handle sessions separately. RP scope addresses another threat, not who holds the key. Compare m721/m216 and factor vocabulary without extra independence; no key, PIN or biometric is tested.",
    "main": "Enforced local UV adds a requirement beyond possession; presence alone does not satisfy the stated policy.",
    "contrasts": [
      "A finder can touch the key, so presence does not establish the required UV.",
      "RP scoping restricts sites rather than identifying the current holder.",
      "The stored public key verifies signatures, not the person holding the authenticator."
    ],
    "family": "required_authenticator_user_verification"
  },
  {
    "id": "m614",
    "meaning": "Recognise failed offboarding from the supplied still-active departed-worker credential.",
    "hold": "HOLD credential use as proof the departed worker personally ran the script or one universal legal revocation deadline. The stipulated months-old departure supports a deprovisioning failure; attribution requires separate evidence. Central account disablement alone does not revoke all app sessions, tokens, API/service access or offline credentials. Retained business records differ from active access; integration, ownership and authorised timing need verification. Imported QB1 question14; specific effective corrections replace fallback text. Same provisional missed-departure family as m119, not independent evidence. No account/script investigation executes.",
    "main": "Offboarding removes authorised access at the required time; a valid departed-worker credential indicates a lifecycle-control gap without proving the actor.",
    "contrasts": [
      "Onboarding grants initial access rather than revoking departure access.",
      "Change governance may support a workflow, but departure specifically triggers offboarding.",
      "A failed-login threshold cannot remove otherwise valid departed-user access."
    ],
    "family": "missed_departure_deprovisioning"
  },
  {
    "id": "m006",
    "meaning": "Classify the fingerprint example as the biometric factor category.",
    "hold": "HOLD biometrics as secrets, unforgeable identity or automatically sufficient standalone authentication. Sensor error, liveness, privacy, alternative recovery and actual authenticator configuration require validation. A smart card may also need a PIN, but the object category here is possession. The offered code is explicitly hardware-generated; generic one-time strings or emailed codes are not inherently proof of possession. Current wrong-choice teaching generalises device/phone OTP and remains qualified. Strongly correlate m215 category counting; no biometric or independent factor implementation is assessed.",
    "main": "Fingerprint is a biometric category; the supplied card/token and PIN examples illustrate possession and knowledge, not validated MFA.",
    "contrasts": [
      "The card is a possessed object here; PIN activation could add a separate requirement.",
      "A PIN is knowledge, not a biometric trait.",
      "The supplied hardware-generated code relies on possession; do not generalise every OTP or delivery channel as equivalent."
    ],
    "family": "authentication_factor_category_recognition"
  },
  {
    "id": "m215",
    "meaning": "Count one factor category for a password and security answer; the username is an identifier.",
    "hold": "HOLD form-field count as factor independence or security questions as recommended secure authentication. Both secrets are knowledge; modern guidance does not endorse security-question authentication. Multiple categories alone do not prove secure enrolment, recovery or implementation. No extra factor follows from an identifier. Correlate m006 classification without new independent mastery evidence; no authentication flow is executed.",
    "main": "Distinct categories matter: username identifies the account, and both secrets are knowledge rather than MFA.",
    "contrasts": [
      "Three fields do not create three categories; username is an identifier.",
      "No possession or biometric requirement is supplied.",
      "Knowledge is present, although the security-question implementation is weak and not endorsed."
    ],
    "family": "authentication_factor_category_recognition"
  },
  {
    "id": "m229",
    "meaning": "Recognise temporary account lockout from the stipulated failed-login limit and waiting period.",
    "hold": "HOLD three attempts/five minutes as an approved universal threshold or lockout as complete brute-force/credential-stuffing prevention. Tune throttling and recovery against denial of service, enumeration, legitimate access and attack patterns. Distributed attempts across accounts can evade per-account controls, and a valid stolen credential can succeed without reaching the limit. Recognising a label does not verify rate-limit implementation or session revocation. No login attempts or control changes execute.",
    "main": "The stipulated pause is temporary lockout; its operational thresholds need separate validation.",
    "contrasts": [
      "Separation of duties divides responsibilities rather than pausing failed logins.",
      "Session expiration concerns an established session rather than these failed attempts.",
      "Password history limits reuse at password change rather than imposing this pause."
    ],
    "family": "temporary_failed_login_lockout_recognition"
  },
  {
    "id": "m355",
    "meaning": "Recognise privilege creep when obsolete sales access survives a role move to HR.",
    "hold": "HOLD every multi-role account as excessive or a separation-of-duties violation. The premise explicitly requires old access removal; authorised handoff can differ outside it. HR job title alone is not infallible permission approval. Session expiry/logout does not remove entitlements; integrations, exceptions and actual access reviews must be verified. No malice or independently executed joiner/mover/leaver stages are established. Compare m343 naming and m119/m614 departures without automatic family independence. No permissions change.",
    "main": "Remove obsolete permissions at the authorised role change and verify the resulting entitlements.",
    "contrasts": [
      "Retained excess permissions are an authorisation issue, not failed identity proof.",
      "The account gains access rather than hitting a login lockout.",
      "Ending a session does not automatically remove obsolete entitlements."
    ],
    "family": "mover_obsolete_access_accumulation"
  },
  {
    "id": "m077",
    "meaning": "Recognise OAuth as the offered delegated resource-authorisation framework.",
    "hold": "HOLD the current Kerberos wrong correction categorically denying resource delegation: Kerberos supports delegation/forwarded or proxy tickets and cross-realm trust. Narrow the contrast to the described OAuth grant model. SAML can convey authorisation information; LDAP can modify directory data and enforce its own access controls, not just lookups. OAuth alone does not give the client an OIDC identity assertion. Consent, scope/audience enforcement and bearer/session risks remain held. Same provisional OAuth family as m319, no independent evidence. No live grant, LDAP or Kerberos operation is run.",
    "main": "OAuth is the intended resource-delegation framework; OIDC identity login and Kerberos delegation are different mechanisms.",
    "contrasts": [
      "SAML XML assertions can carry authorisation data but are not the described OAuth grant model.",
      "Kerberos can delegate access using tickets; distinguish its mechanism without claiming delegation is impossible.",
      "LDAP is a directory protocol that may back identity systems, not the described OAuth framework."
    ],
    "family": "OAuth_delegated_resource_access"
  },
  {
    "id": "m108",
    "meaning": "Recognise SSO as cross-application reuse of authentication in the supplied scenario.",
    "hold": "HOLD SSO as never prompting again or granting every application permission. Expiry, context changes and sensitive operations can require renewed authentication/step-up; central IdP/session compromise has a wider blast radius. MFA can secure SSO, RADIUS can participate as a backend, and RBAC applies permissions; their exact order is not a universal protocol rule. SAML/OIDC/Kerberos are possible mechanisms with different profiles, not verified interoperability. Compare m726 without granting a tested federation workflow. No sessions or app logins execute.",
    "main": "SSO names authentication reuse; application authorisation and later step-up remain separate.",
    "contrasts": [
      "RADIUS network AAA may support a backend, but it is not the name for the described reuse.",
      "MFA adds factor requirements rather than itself providing cross-application sign-on.",
      "RBAC determines role permissions, not whether prompts are reused or suppressed."
    ],
    "family": "cross_application_SSO_recognition"
  },
  {
    "id": "m119",
    "meaning": "Recognise inadequate deprovisioning after the expressly supplied departure and revocation deadline.",
    "hold": "HOLD every still-employed last-day account as already invalid or one universal employment/legal deadline. The corrected premise states that authorisation ended and its required deadline passed. Retained records differ from active access; central disabling need not revoke all applications, sessions, tokens and offline credentials. Verify authorised exceptions and actual integration scope. Strongly correlate m614 incident context in the same provisional departure family. No account action or legal compliance verification executes.",
    "main": "The stipulated missed access-removal deadline is a deprovisioning failure, not merely a future departure.",
    "contrasts": [
      "Privilege creep is accumulation across duties; this specific failure is missed departure revocation.",
      "Duty separation concerns dividing tasks rather than this deadline.",
      "Onboarding grants access; the failed lifecycle stage here is removal."
    ],
    "family": "missed_departure_deprovisioning"
  },
  {
    "id": "m120",
    "meaning": "Recognise Kerberos from KDC/service tickets, timestamped authenticators and replay-cache architecture.",
    "hold": "HOLD ticket expiry alone as preventing replay inside the validity window or protocol naming as enforced mutual authentication/replay protection. Clock skew, replay cache or suitable alternate protections, cache sharing for principals and restart/failure handling require validation. Stolen tickets/session keys remain risks; authentication does not grant every authorisation. Kerberos can delegate and cross realms. LDAP may use Kerberos and network AAA protocols can coexist without being this architecture. No KDC, ticket replay or clock/cache test executes.",
    "main": "Timestamp and replay checks address authenticator reuse; ticket expiry and naming alone do not prove operational protection.",
    "contrasts": [
      "NTLM challenge-response differs from the supplied KDC/service-ticket architecture.",
      "RADIUS network AAA is not the specified TGT/service-ticket mechanism.",
      "LDAP directory access may work alongside Kerberos rather than being that ticket protocol."
    ],
    "family": "Kerberos_ticket_architecture_recognition"
  },
  {
    "id": "m343",
    "meaning": "Recognise employment identity lifecycle/JML automation from supplied joiner provisioning and leaver removal.",
    "hold": "HOLD a workflow label as evidence of successful revocation across apps/sessions or the stem as independently testing a mover stage. HR attributes can inform approved roles but are not an infallible authorisation source. Verify connectors, outages/retries, exceptions and outcomes. SCIM supports identity resource provisioning/managing operations, not every HR integration or universal instantaneous session logout. Zero Trust/RBAC/MFA may support the workflow without replacing it. Compare m355/m119/m614 without scoring each lifecycle component independently. No SCIM call, HR sync or account change executes.",
    "main": "JML names the lifecycle workflow; actual permissions and integration outcomes need verification.",
    "contrasts": [
      "Zero Trust is an access-policy approach rather than this employment-event workflow name.",
      "RBAC helps choose permissions; lifecycle events also trigger account/access changes.",
      "MFA enrolment is one account-management task, not the complete lifecycle."
    ],
    "family": "employment_identity_lifecycle_recognition"
  }
];
assert.deepEqual(reviews.map(r=>r.id),ids);
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();

const sourceChecks=candidates.map((row,i)=>{
 const s=c.questions.get(row.recordId),q=s.q,shuffled=shuffle(q);assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);assert.equal(q.correct,s.preQuestion.correct);
 assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
 for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
 if(i<2){assert.equal(s.snapshots.length,1);assert.equal(s.captures.length,1);const replay=publicationPipeline(c.bank).overrides(s.snapshots).mcqs.find(x=>x.id===q.id),{_baseOrder,_adminOrder,...semantics}=replay;assert.equal(sig(semantics),row.revisions.localEffective);assert.equal(s.pub._adminOrder,s.captures[0].sort_order);assert.equal(s.authored===null,true);}
 else{assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert(s.authored);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);assert.equal(q.correct,s.authored.correct);}
 return{recordId:row.recordId,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:i<2,sourceLayerDisposition:i<2?'snapshot_only_no_authored_or_imported_substitute':'authored_equals_preeditorial_then_effective_editorial',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',authoredMissingWrongCorrections:s.authored===null?null:!s.authored.wrongFeedback,optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0},status:'source_inspection_no_additional_question_credit'};
});
assert.equal(sourceChecks.filter(r=>r.snapshotReplayChecked).length,2);assert.equal(candidates.filter(r=>r.flags.stemChanged).length,11);assert.equal(candidates.filter(r=>r.flags.optionsChanged).length,10);assert.deepEqual(candidates.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m614']);assert.equal(sourceChecks.filter(r=>r.authoredMissingWrongCorrections===true).length,12);
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
assert.equal(broad.length,151);assert.equal(oldBroad.length,31);assert.deepEqual(counts(oldBroad),{glossary_definition:21,keyword_guide:1,lesson:1,lesson_check:4,lesson_section:3,lesson_traps:1});assert.equal(selectedIds.size,36);assert.equal(remaining.length,84);assert.equal(remaining.filter(r=>r.kind==='mcq').length,11);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,combinedQuestions=new Set([...priorBank.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=bankRows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
assert.equal(combinedQuestions.size,349);assert.equal(combinedFeedback.size,313);assert.equal(paired.length,313);assert.equal(paired.filter(r=>r.kind==='mcq').length,297);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,olderQuestionOnlyDispositions:olderQuestions.length,allPacketPriorQuestions:priorBank.length,newQuestions:questionProposals.length,allPacketCombinedQuestions:combinedQuestions.size,remainingQuestionDispositions:483-combinedQuestions.size,combinedMcqs:bankRows.filter(r=>r.kind==='mcq'&&combinedQuestions.has(r.recordId)).length,combinedLocalPbqs:bankRows.filter(r=>r.kind==='pbq'&&combinedQuestions.has(r.recordId)).length,newFeedbackBundles:18,priorFullFeedback:priorFeedback.length,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.combinedMcqs,321);assert.equal(bankProgress.combinedLocalPbqs,28);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,36);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective48HeldDispositions:base.explanationProposals.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal})),olderQuestionPacketBindings:olderQuestions.map(r=>({recordId:r.recordId,priorPacketPath:r.priorPacketPath,priorDispositionRevision:r.priorDispositionRevision,status:'existing_limits_preserved_no_full_feedback_or_approval_inherited'}))};
assert.equal(priorHolds.objective48HeldDispositions.length,18);
const comparisonSpecs=[
  {
    "ids": [
      "m721",
      "m216",
      "m408",
      "m006",
      "m215"
    ],
    "meaning": "RP/origin phishing resistance, API identification and required local UV address different decisions/threats; factor-category examples are narrower vocabulary. m006/m215 share a provisional factor-classification family. Correlate authenticator teaching without assuming all keys use UV, every credential is device-bound, or session security follows. No independent implementation or component credit."
  },
  {
    "ids": [
      "m319",
      "m077",
      "m726",
      "m108",
      "m120"
    ],
    "meaning": "m319/m077 share one provisional OAuth resource-delegation family; OIDC login is distinct. SAML assertion recognition and SSO reuse labels differ from Kerberos ticket recognition. Kerberos delegation/cross-realm support cannot be denied to make OAuth unique. Neither protocol names nor XML/tickets prove interoperable or secure live access."
  },
  {
    "ids": [
      "m180",
      "m318",
      "m224",
      "m614",
      "m119",
      "m355",
      "m343",
      "m229"
    ],
    "meaning": "PAM storage/rotation, emergency privilege hygiene and client-certificate revocation are related controls with separate dependencies. m614/m119 share a provisional missed-departure family; mover privilege accumulation and JML naming differ from verified lifecycle execution. Lockout pauses failed attempts rather than revoking valid access. No universal HR deadline, token/session invalidation or independent operational evidence."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids.map(id=>'mcq:'+id),comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get('mcq:'+id),p=c.previous.get('mcq:'+id);return{recordId:s.row.recordId,sourceRevision:s.record.sourceSignature,localRevision:s.row.revisions.localEffective,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
const sourceBindings=[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective48-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective48-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)},...inventory.map(({path,sha256})=>({path,sha256}))];
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'9b4d9cec37ce2fd56589592ea48238a64bad9fcd',sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,legacyTrackedPriorQuestions:289},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences,status:'current_revision_bound_existing_question_judgments_no_new_credit_or_full_feedback_inference'},bankSignature:c.ledger.bankSignature,selectionPolicy:'Requested objective4.6 candidate set, ranked by existing structural triage then ID; all prior substantive packets reconciled before new question credit',candidateQuestionRecordIds:candidates.map(r=>r.recordId),selectedQuestionRecordIds:selected.map(r=>r.recordId),selectedFeedbackRecordIds:candidates.map(r=>'explanation:'+r.recordId),questionExclusions:exclusions,sourceChecks,questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorHolds,objective46Census:census,objective46Denominator:{broadCandidates:151,allPacketPriorDispositions:31,newQuestionDispositions:18,newFeedbackDispositions:18,newAgentDispositions:36,combinedAgentDispositions:67,remaining:84,remainingByKind:counts(remaining)},remainingObjective46RecordIds:remaining.map(r=>r.id),bankProgress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},privateBoundary:{p017Revision:'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42',payloadReviewed:false,trustedRevisionId:null,localPilotFallbackDoesNotTransferToPrivate:true},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
function validate(value){
 assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);
 assert.equal(new Set(value.selectedQuestionRecordIds).size,18);assert.equal(value.questionProposals.length,18);assert.equal(value.explanationProposals.length,18);
 assert(value.questionProposals.every(r=>!c.previous.has(r.recordId)));assert(value.explanationProposals.every(r=>!legacyPrevious.has(r.recordId)));
 for(const r of value.questionProposals){const s=c.questions.get(r.recordId);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);}
 for(const r of value.explanationProposals){const s=c.questions.get(r.parentId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.record.localRevisionSignature);assert.equal(r.mainCorrectionRevision,sig(s.q.exp));assert.equal(r.wrongFeedbackRevision,sig(s.q.wrongFeedback));assert.equal(r.distractorCorrections.length,3);}
 // Every exported decision is checked against independently rebuilt current sources and fixed review judgments.
 const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);
}
let completedNegativeChecks;validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet);assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<18;i++){
 reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);reject(p=>p.questionProposals[i].trustedRevisionId=p.questionProposals[i].revisions.trustedCompilerObserved);reject(p=>p.questionProposals[i].contentQualification='');reject(p=>p.questionProposals[i].primaryConceptProposal='invented');reject(p=>p.questionProposals[i].humanApproved=true);reject(p=>p.questionProposals[i].newFamilyCredit=1);reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);reject(p=>p.questionProposals[i].familyLabelProposal='independent');reject(p=>p.questionProposals[i].objectiveScopeProposal={assessedCodes:['4.6'],contextCodes:[],status:'approved'});reject(p=>p.questionProposals[i].skillRoleProposal='invented');reject(p=>p.questionProposals[i].difficultyDisposition='calibrated');
}
for(let i=0;i<18;i++){
 reject(p=>p.sourceChecks[i].snapshotReplayChecked=!p.sourceChecks[i].snapshotReplayChecked);reject(p=>p.sourceChecks[i].revisions.authored=p.sourceChecks[i].revisions.authored===null?p.sourceChecks[i].revisions.preEditorialSnapshotMerged:null);reject(p=>p.sourceChecks[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);reject(p=>p.sourceChecks[i].optionShuffleProbe.feedbackRemapChecked=false);reject(p=>p.sourceChecks[i].sourcePriority=0);
 reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%18].sourceRevision);reject(p=>p.explanationProposals[i].parentLocalRevision='stale');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');reject(p=>p.explanationProposals[i].objectiveScopeProposal={assessedCodes:['4.6']});reject(p=>p.explanationProposals[i].mainCorrectionRevision='stale');reject(p=>p.explanationProposals[i].deliveryGate='all_before_submit');reject(p=>p.explanationProposals[i].approvedRemediation=true);
 for(let k=0;k<3;k++){reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].assessedSecondary=true);}
}
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);for(const path of holdPaths)reject(p=>{let r=p.priorHolds;for(const k of path.slice(0,-1))r=r[k];r[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{let old=p.priorHolds;for(let i=0;i<11;i++)old=old.inheritedHolds;old=old.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
for(let i=0;i<42;i++)reject(p=>p.allPacketReconciliation.olderQuestions[i].priorDispositionRevision='stale');
reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.allPacketReconciliation.olderQuestions.push(p.allPacketReconciliation.olderQuestions[0]));reject(p=>p.allPacketReconciliation.supportOnlyReferences[0].status='fully_reviewed');reject(p=>p.questionProposals.push({...p.questionProposals[0],recordId:ids[0]}));reject(p=>p.questionExclusions.push({recordId:'mcq:'+ids[0],newQuestionCredit:1}));reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=349);reject(p=>p.objective46Census.pop());reject(p=>p.objective46Denominator.remaining=0);reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
completedNegativeChecks=negativeMutationChecks;
const exported={...packet,negativeMutationChecks};validate(exported);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const report=[
 '# Phase 2B-5 — objective 4.6 MCQs and complete feedback',
 '**NOT READY.** This finite slice is a local draft review. Baseline **'+packet.baselineCommit+'**; packet SHA-256 **'+hashFile(packetPath)+'**. A disposition is a recorded judgment awaiting owner review. A hold keeps a claim unapproved; it does not repair or replace the learner content. MCQ means multiple-choice question. Complete feedback means the main explanation and all three wrong-choice corrections. Only this proposal packet, this report and its focused audit change.',
 '## Scope and selection',
 'The approved master plan and Phase 1 audit were read in full before review. The plan controls product decisions; the audit supplies historical implementation evidence. No unresolved conflict affects this finite local scope. Current source facts were checked again rather than assumed from the historical audit.',
 'All **18** requested questions were read in structural priority order: **'+ids.join(', ')+'**. Scores: **'+candidates.map(r=>r.priorityScore).join(', ')+'**. Priority flags guide reading; they do not prove correctness, novelty, skill scope or approval. Each effective stem, all options, key, main explanation and all three corrections was compared with available authored/imported, captured snapshot and effective layers.',
 '**18 new question dispositions + 18 new complete feedback dispositions = 36 new pending rows.** All 58 earlier substantive packets were reconciled first: the 57 inventoried in the previous objective4.8 packet plus that newly completed packet itself. None of these 18 parents or feedback bundles already has a matching substantive judgment. Zero reused-parent exclusions, stale-source deferrals or private substitutions; ambiguities remain in holds. Only content understanding and provisional family comparisons are proposed. New objective-scope, skill-role and canonical role proposals are null; no tag, difficulty calibration, teaching link, weight, publication or activation is approved.',
 '## Reconciliation and coverage',
 'All prior packet hashes and current source revisions were verified, including dictionary and array source bindings. Four older packets contribute **42 distinct current question-only judgments (30 MCQs + 12 local PBQs)** outside recent frozen-ledger overlays. They remain reused history, not new work or complete feedback approval. Seventeen cross-packet reference occurrences earn no duplicate credit. Twelve unmatched minimal link/context references remain separate, including five explanation links; those are not five full feedback bundles or independently reviewed teaching units. No historical packet, shared ledger or helper is rewritten.',
 '| Pending local coverage | Before | New | After | Remaining |\n| --- | ---: | ---: | ---: | ---: |\n| All-packet question judgments | 331 | 18 | 349/483 | 134 |\n| Complete feedback judgments | 295 | 18 | 313/483 | 170 |\n| Question plus complete feedback pairs | 295 | 18 | 313/483 | 170 |',
 'Question judgments are **321/395 MCQs + 28/88 local PBQs**; **74 MCQs + 60 PBQs** remain. Complete pairs are **297 MCQs + 16 local PBQs**; **98 MCQs + 72 PBQs** lack full feedback. **36 older question-only judgments** still lack full feedback. These measure pending review coverage, not usable adaptive evidence or mastery. The bank denominator stays 483; two private variants, nine starters and two guest demos remain separate. A shuffle, metadata inventory, support link or comparison is not another reviewed question.',
 'Objective4.6 broad union: **151 records; 31 prior + 36 new = 67 pending dispositions; 84 remain.** Prior coverage consists of **21 glossary definitions** and **10 substantive identity-zero-trust instructional-unit judgments** (one lesson, one keyword guide, four lesson checks/practice-keyword subunits, three sections and one traps unit). Those existing rows bind actual current units and contain substantive qualifications; they are distinct from minimal support links. They still do not approve usable teaching roles, canonical concepts or evidence. No new support/instructional unit review is claimed here.',
 '| Remaining objective4.6 kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
 'Remaining local PBQ question IDs: **'+remaining.filter(r=>r.kind==='pbq').map(r=>r.id).join(', ')+'**. Remaining private records, if any in this union: **'+(remaining.filter(r=>r.id.startsWith('private:')).map(r=>r.id).join(', ')||'none')+'**. The packet binds every one of the 151 census records and all 84 remaining IDs. The selected eighteen MCQ parents and all eighteen paired feedback bundles now have pending judgments. Eleven other objective4.6 MCQs remain outside this finite slice; PBQ grading, other feedback and teaching dependencies remain separately unresolved.',
 '## Individual content judgments and holds',
 reviews.map(r=>'**'+r.id+' — new question and complete feedback.** '+r.meaning+'\n\n'+r.hold+'\n\nMain teaching: '+r.main+'\n\nAll wrong-choice contrasts, in current wrong-choice order: '+r.contrasts.map((t,k)=>(k+1)+'. '+t).join(' ')).join('\n\n'),
 'No quantitative independence follows from these contrasts. Each question has one keyed decision, including composite PAM, emergency-admin and passkey choices. Qualitative limits are held in prose; new objectiveScopeProposal and skillRoleProposal remain null. Feedback roleProposal also remains null; its conditional delivery is descriptive, not a canonical teaching-role assignment.',
 '## Effective sources and delivery limits',
 '**Two actual snapshot publication-pipeline replays**, m721/m726, match current effective semantics and captured ordering. Both are snapshot-only with null authored revisions; no imported/authored substitute is invented. Their false authored-relative change flags cannot establish unchanged content. The other sixteen authored/imported revisions equal preeditorial revisions. All eighteen effective revisions differ from their preeditorial content while keyed option positions remain unchanged; position equality does not imply unchanged meaning.',
 'Eleven authored-relative stem-change flags: **m180,m216,m224,m318,m319,m408,m077,m108,m119,m120,m343**. Ten option-change flags: **m180,m216,m224,m318,m319,m408,m006,m215,m229,m355**. Some stem flags are spelling changes (m077,m108,m343), so the flag alone is not new semantic evidence. m119 replaces the ambiguous future/last-day departure with an expressly passed revocation deadline. m120 adds timestamp/replay-cache architecture rather than teaching ticket expiry alone. m319 now tests basic resource delegation rather than the old SPA PKCE-flow decision.',
 'm721 current teaching removes the old completely-unaffected-by-reverse-proxy claim. m216 qualifies private-key storage for hardware versus synced passkeys; smart-card public-key capability remains acknowledged. m224 replaces the client-certificate misuse of server Must-Staple and immediate-revocation guarantees. m318 removes vendor/CIS control-number and rating assumptions. m408 expressly requires local UV rather than assuming every FIDO2 key always requires PIN/biometric. m006 narrows the offered code to a hardware token, while its generic phone/OTP wrong correction still needs qualification. m215 treats a username as an identifier. m355 separates obsolete entitlement removal from logout. The current m077 Kerberos wrong correction still incorrectly denies delegation; that precise contrast is held without changing learner wording.',
 'Only **m614** is imported, from **QB1 question14**. Its three generic fallback corrections become specific effective teaching. Twelve authored sources lack their own wrongFeedback: **m180,m216,m224,m318,m319,m215,m229,m355,m108,m119,m120,m343**. Current main explanations and all **54 effective wrong corrections** are separately bound to exact parent/feedback and choice/correction signatures. Eighteen deterministic option-shuffle/remap probes preserve the keyed decision and map all corrections; probes add zero family or review credit.',
 '| Question | Source domain / difficulty | Effective domain / difficulty |\n| --- | --- | --- |\n'+candidates.map(row=>{const s=c.questions.get(row.recordId),a=s.authored??s.preQuestion;return'| '+row.questionId+' | '+a.ch+' / '+a.difficulty+' | '+s.q.ch+' / '+s.q.difficulty+' |';}).join('\n'),
 'Domains and difficulty labels above are observed source facts, not approved retags or calibration. Feedback remains conditional on actual question selection, submission and entitlement; a wrong correction depends on the selected wrong option. Static delivery code/source bindings were checked, but no browser pool/set/guest route, live login, consent, hardware key, biometric, LDAP/RADIUS/TACACS/Kerberos exchange, HR/SCIM integration, account revocation, PAM rotation, certificate request or session outcome was observed.',
 '## Provisional family comparisons and primary references',
 comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
 '**Three provisional shared pairs:** m319/m077 OAuth delegated-resource access; m614/m119 missed departure deprovisioning; m006/m215 factor-category recognition. Other authenticator, federation, privileged-access and lifecycle teaching is correlated but addresses different narrower decisions. No canonical family merge, independent evidence or extra component credit is approved.',
 '[W3C WebAuthn Level3](https://www.w3.org/TR/webauthn-3/) defines RP-scoped credentials, signed client-origin data, assertion verification and required user verification (§§5.8,6.2,7.2). Its UV definition does not identify a unique natural person, and presence differs from verification. Our content inference distinguishes RP/origin phishing resistance, method recognition and an expressly required UV policy; none proves session protection or an actual hardware implementation.',
 '[OAuth2 RFC6749](https://www.rfc-editor.org/rfc/rfc6749.html) describes limited resource access and leaves client-facing end-user authentication outside its scope. [OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html) adds an identity layer and ID-token validation. [OAuth security BCP RFC9700](https://www.rfc-editor.org/rfc/rfc9700.html) supplies current flow, redirect and token safeguards. Our inference holds client/resource-server validation, malicious consent and bearer risks separately; no grant or identity flow is tested.',
 '[OASIS SAML2 core](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf) distinguishes XML authentication, attribute and authorisation assertions. [Kerberos RFC4120](https://www.rfc-editor.org/rfc/rfc4120.html) supports cross-realm operation and delegation, and §3.2.3 specifies replay protection requirements. Our inference rejects the universal no-delegation correction in m077 and expiry-only protection, while preserving the narrower SAML/OAuth/Kerberos mechanisms.',
 '[RADIUS RFC2865](https://datatracker.ietf.org/doc/html/rfc2865) describes network-access authentication, authorisation and configuration. [TACACS+ RFC8907](https://www.rfc-editor.org/rfc/rfc8907.html) describes AAA, particularly device administration. These can coexist with directories or other identity mechanisms; names alone do not imply the offered SAML/XML, OAuth or Kerberos architecture. No standalone TACACS question or new teaching-unit judgment is added here.',
 '[NIST SP800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) distinguishes authenticators, biometrics and rate limiting; its digital-identity guidance does not make biometrics secrets or security questions recommended authentication. Our inference keeps category vocabulary separate from a tested MFA implementation and supplied lockout numbers separate from an approved operational threshold.',
 '[TLS Feature RFC7633](https://www.rfc-editor.org/rfc/rfc7633.html) describes server certificate status-feature expectations; it does not automatically implement client-certificate offboarding. [SCIM RFC7644](https://www.rfc-editor.org/rfc/rfc7644.html) manages identity resources using HTTP operations; it does not establish every HR connector or guarantee immediate app/session revocation. Our inference keeps m224 client-verifier checks and JML integration outcomes held.',
 '## Preserved gates',
 'All eighteen objective4.8 feedback holds are retained through their exact packet/row revisions, including copy integrity versus custody/admissibility, snapshot capability, historical/current response distinctions, exercise scope and anti-forensics timing. All nineteen objective4.3 precise holds, twelve 4.1, eight 3.3, fourteen 3.2, eleven 3.1 and earlier 2.5/2.4/2.3/2.2/actor/supplier/crypto/PKI/PFS/channel/Unicode/PBQ grammar/grading/delivery/targeting qualifications remain in the inherited chain. Older contextual/recovery limits and the m305 whole-scope, m046 precise contrast and m432 whole-numbered-scope holds remain. Existing KEV/BOD26-04 current-policy uncertainty is not re-certified or resolved by this identity review. No prior pilot approval is transferred to a new judgment.',
 'Private p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, unavailable/unreviewed with null trusted identity. The older objective52 local fallback judgment does not review or transfer trust to that private revision. No private payload fetch/export/substitution occurs. The new packet exports no stems, offered choices, keys, option-indexed answer payloads or learner data.',
 'The active package remains **1878 records / 435 identities / 2954 review decisions / 489 unresolved mappings / seven existing primary proposals**, SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All **25 protected release hashes** remain unchanged. Thirty-six unsupported local PBQ grammars, protected private review, remaining complete feedback/support coverage, owner decisions and calibration continue to block readiness.',
 '**NOT READY.** Local/offline/default-off/unwired/learner-invisible. No active package, runtime behavior, canonical concept/role/family, objective tag, skill, calibrated difficulty, link, weight, publication, activation, shadow write, private processing, migration, cohort, live write, deployment or Phase3 change. Completing this finite review slice does not complete the larger phase.',
 '## Validation and delivery',
 'Run node '+scriptPath+' and npm run audit:content-mapping. The focused audit rebuilds the frozen ledger; verifies all58 prior packet inventories, current references and dictionary bindings; validates eighteen source inspections, two snapshot replays, eighteen mains,54 wrong corrections,18 shuffle/remap probes, the exact151-record census and separate bank/feedback totals. **'+negativeMutationChecks+' negative mutations are rejected**, including stale/trusted source substitutions, erased current/inherited precise holds, role/scope assignments, approval/calibration/weights, missing or duplicate inventory, support-link overcount, wrong corrections, private fallback substitution, export leakage and activation.',
 'All29 mapping tests plus deterministic package verification, all25 protected checksums and git diff --check must pass before the task-only **[skip deploy]** commit/push. Final delivery compares local HEAD, origin/main and remote refs/heads/main exactly. Browser/live/private delivery remains unverified; these checks establish local review consistency, not production activation.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE46_MCQS_NOT_READY',candidateIds:ids,newQuestionDispositions:18,newFeedbackDispositions:18,bankProgress,objective46:packet.objective46Denominator,snapshotReplays:2,wrongCorrections:54,shuffleProbes:18,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
