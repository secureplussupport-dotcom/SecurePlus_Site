import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-objective46-final-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json',reportPath='docs/phase-2b5-objective46-final-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective46-mcqs-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'3fffad246f228ce42944c8e957e74e5a42d6f54a3d6689fd91598f0296a43aa3');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);
const ids=['m026','m034','m040','m041','m072','m107','m109','m117','m175','m217','m218'];
const candidates=ids.map(id=>c.ledger.rows.find(r=>r.recordId==='mcq:'+id));
assert.equal(new Set(ids).size,11);assert(candidates.every(r=>r&&r.kind==='mcq'&&r.objectiveCodesObserved.includes('4.6')));
assert.deepEqual([...candidates].sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en')),candidates);
assert.deepEqual(candidates.map(r=>r.priorityScore),Array(11).fill(10));
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
assert.equal(inventory.length,59);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);
const excluded=candidates.filter(r=>c.previous.has(r.recordId)),selected=candidates.filter(r=>!c.previous.has(r.recordId));
assert.deepEqual(excluded,[]);assert.equal(selected.length,11);assert(candidates.every(r=>!c.previous.has('explanation:'+r.recordId)));
const exclusions=excluded.map(r=>{const p=c.previous.get(r.recordId);return{recordId:r.recordId,sourceRevision:r.revisions.localEffective,publishedRecordSignature:r.revisions.publishedCatalogue,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),priorFamilyLabel:p.row.familyLabelProposal,reason:'current_matching_prior_substantive_question_judgment_reused_feedback_still_unreviewed',newQuestionCredit:0,newFamilyCredit:0};});
const priorInventory=base.allPacketReconciliation.inventory;
assert.deepEqual(inventory.filter(r=>r.path!==basePath),priorInventory);
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorBank.length,349);assert.equal(priorFeedback.length,313);
const broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('4.6')),oldBroad=broad.filter(r=>c.previous.has(r.id));
assert.deepEqual(c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('4.6')&&!c.previous.has(r.recordId)).map(r=>r.questionId),ids);
const reviews=[
  {
    "id": "m026",
    "meaning": "Recognise provisioning as the offered account/access process for a new employee.",
    "hold": "HOLD provisioning alone as defining approved access policy, HR job title as sufficient authorisation, or onboarding as only account creation. Governance/role design and approval determine appropriate permissions; provisioning implements them. Separation of duties and mandatory policy can constrain the result rather than being mutually exclusive workflows. Least privilege must be verified against duties, exceptions, applications and session/token state. No instantaneous provisioning/revocation or universal HR deadline follows. Compare m343 JML naming and m355 mover handling without independent lifecycle-component evidence. No HR integration or account change is run.",
    "main": "Create the approved accounts and role-appropriate access during onboarding, then verify actual permissions; the process label does not authorise arbitrary grants.",
    "contrasts": [
      "Offboarding removes access when authorisation ends; it is not the supplied initial grant.",
      "Duty separation constrains sensitive responsibilities and may inform approved provisioning, but does not name this account/access workflow.",
      "Mandatory policy can govern granted access; it is an enforcement model rather than the provisioning process."
    ],
    "family": "joiner_access_provisioning_recognition"
  },
  {
    "id": "m034",
    "meaning": "Recognise Kerberos from the explicitly supplied TGT and service-ticket mechanism for SSO.",
    "hold": "HOLD every service accepting one login forever, a service ticket as application authorisation, or Kerberos as confined to one realm or unable to delegate. Expiry, renewal, trust paths, clocks, replay checks and application policy remain implementation requirements. RADIUS/TACACS+ can coexist with Kerberos; LDAP supports directory and Bind authentication operations and can use SASL mechanisms, not only lookups. The offered protocols do not themselves identify this TGT architecture. Same provisional ticket-architecture family as m120; correlate m108 SSO naming and preserve m077 delegation correction. No KDC, ticket, replay or login test executes.",
    "main": "A TGT is used to obtain service tickets; that supports SSO without proving every application authorises access or sessions never expire.",
    "contrasts": [
      "RADIUS network-access AAA does not itself issue the described Kerberos TGT; integrations can use other identity backends.",
      "TACACS+ device-administration AAA is not the specified TGT/service-ticket mechanism.",
      "LDAP is a directory protocol with authentication operations and possible Kerberos integration, not itself this ticket-issuing architecture."
    ],
    "family": "Kerberos_ticket_architecture_recognition"
  },
  {
    "id": "m040",
    "meaning": "Recognise the intended MAC classification/clearance model while holding label-only ambiguity against ABAC.",
    "hold": "HOLD classification labels alone as uniquely excluding ABAC: ABAC can evaluate clearance, labels and other attributes. The stem names sensitivity/clearance and context but does not expressly state owner-independent enforcement; the effective explanation supplies that distinguishing MAC property. Hold the missing premise for owner review rather than silently rewriting the stem. Clearance alone does not authorise every lower-labelled operation: compartments, need-to-know, operation-specific read/write rules and trusted policy matter. RBAC and label checks can coexist. Government context is not proof of one universal implementation or legal obligation. Strongly correlate m109; no independent model deployment or objective-wide competence.",
    "main": "The intended MAC model centrally enforces mandatory policy beyond ordinary owner discretion; label/clearance clues alone can also fit an ABAC implementation.",
    "contrasts": [
      "DAC permits discretionary owner grants, constrained by applicable overarching policy; it does not name the intended mandatory classification enforcement.",
      "RBAC groups permissions by roles and can coexist with labels; the intended distinguishing feature is mandatory classification policy.",
      "ABAC can use labels and clearance attributes. Owner-independent mandatory enforcement is needed for a unique MAC distinction and is not explicit in this stem."
    ],
    "family": "mandatory_classification_access_model_recognition"
  },
  {
    "id": "m041",
    "meaning": "Choose the supplied card plus fingerprint as different factor categories, with implementation qualifications.",
    "hold": "HOLD all OTP applications as possession-only: multi-factor OTP authenticators may require a verified activation PIN/biometric. Two code entries alone do not establish another category; the offered apps do not specify activation or independent devices. A smart card may itself have activation requirements; the supplied card/biometric combination is a category example, not verified MFA/AAL strength. Biometrics are not secrets or standalone assurance; verify binding, sensor errors, liveness, recovery and endpoint dependencies separately. Password/security answers are knowledge, not recommended KBA. Shared provisional classification family with m006/m215 and new m107/m117/m218; no independent biometric/card skills or login test.",
    "main": "Possession plus biometric measurement are different categories in the intended example; code/app count alone does not establish category independence.",
    "contrasts": [
      "Password and security answers are both knowledge in the supplied premise; do not endorse security questions as secure authentication.",
      "A PIN and password are both knowledge without another specified factor.",
      "Two plain OTP outputs do not add a distinct category, but the current universal possession-only correction must be qualified for multi-factor OTP activation."
    ],
    "family": "authentication_factor_category_recognition"
  },
  {
    "id": "m072",
    "meaning": "Recognise the intended privilege-creep pattern after a finance-to-marketing move, subject to obsolete-access context.",
    "hold": "HOLD every retained old permission as unnecessary: the stem does not expressly rule out an approved transition or continuing duties. The explanation assumes old rights are obsolete; hold that premise instead of inventing authorisation facts. Privilege escalation need not always involve deliberate exploitation, and accumulated rights can also create a separation-of-duties conflict if the actual tasks conflict. Recertification and event-driven removal must verify actual entitlements; sessions/tokens/cached access can outlive a central role update. Same provisional mover family as prior m355 and new m175. No access review, actor intent, revocation latency or universal deadline is verified.",
    "main": "Obsolete rights retained through a move constitute privilege creep; authorised continuing duties or handoff require separate context.",
    "contrasts": [
      "Escalation concerns gaining unintended powers and can overlap the impact; this item intends retention of formerly legitimate rights, not proof of a specific exploit or intent.",
      "Failed-login lockout is a different control from entitlement accumulation.",
      "Accumulation may also violate task separation if duties conflict; the stem does not establish that specific conflict."
    ],
    "family": "mover_obsolete_access_accumulation"
  },
  {
    "id": "m107",
    "meaning": "Interpret the supplied badge and secret PIN requirements as possession plus knowledge categories.",
    "hold": "HOLD two fields/devices as proof of independent secure factors or a swipe badge as automatically cryptographic/phishing-resistant. The badge must be actually verified and the PIN secret, bound and enforced for the same authorised transaction; a printed/public identifier or bypass does not add a knowledge authenticator. Cloneability, shared/reused PINs, recovery, lockout and verifier/endpoint trust remain risks. Category naming is not a particular AAL or operational guarantee. Federation can coexist with MFA; the local factors alone do not establish it. Same provisional factor-classification family; no badge, PIN or account is tested.",
    "main": "The intended badge-plus-secret-PIN requirements represent possession and knowledge; actual validation and security strength require separate evidence.",
    "contrasts": [
      "Under the intended enforced requirements, the badge and secret PIN are different categories rather than one.",
      "No biometric measurement is specified; a PIN and badge do not imply a fingerprint/face check.",
      "Cross-system identity trust can use MFA, but two local factor requirements alone do not establish federation."
    ],
    "family": "authentication_factor_category_recognition"
  },
  {
    "id": "m109",
    "meaning": "Recognise MAC from the explicit classification policy that ordinary resource owners cannot change.",
    "hold": "HOLD MAC/ABAC as mutually exclusive implementations or clearance rank as universal permission for every read/write operation. Mandatory policy can be evaluated using attributes; need-to-know, compartments, trusted policy and operation-specific rules still matter. The key clue is non-discretionary classification enforcement, not military branding or labels alone. Special authorised policy administrators differ from ordinary resource owners; no system is immune to configuration failure or compromise. Same provisional family as m040, with a more explicit owner-control premise and no new independent deployment evidence. No policy or operating system is tested.",
    "main": "Mandatory owner-independent classification enforcement is the most specific intended model; implementation may also evaluate attributes.",
    "contrasts": [
      "DAC gives ordinary owners discretion to grant access, unlike the supplied non-overridable classification policy.",
      "RBAC roles can coexist with classifications, but roles alone do not name the specified mandatory enforcement.",
      "ABAC can evaluate labels; it is not incapable of implementing mandatory policy. MAC describes the non-discretionary model in this premise."
    ],
    "family": "mandatory_classification_access_model_recognition"
  },
  {
    "id": "m117",
    "meaning": "Classify the supplied fingerprint scan as a biometric category, separate from hardware, SMS and knowledge.",
    "hold": "HOLD biometrics as secret/unforgeable or sufficient standalone digital authentication. Sensor errors, liveness, privacy, recovery and binding matter; the categorical example is not a real scan or assurance result. SMS access is not a biometric and does not prove possession of one unique physical handset: forwarding, SIM swap, interception or compromised endpoint can expose codes. OTPs/SMS are not automatically phishing-resistant and implementation/delivery restrictions remain separate. Hardware tokens can require other activation factors without changing this object-category example. Strongly correlate m006 and m218 in the existing factor-classification family; no new independent scenario/biometric evidence.",
    "main": "Fingerprint is inherence; SMS proves access to a receiving channel under its security assumptions, not biological identity.",
    "contrasts": [
      "A hardware token is a possession example; its possible activation requirements are not tested here.",
      "The supplied SMS output is access to a phone/number channel, not a biometric; do not infer unique device possession or strong factor security.",
      "A remembered passphrase is knowledge rather than inherence."
    ],
    "family": "authentication_factor_category_recognition"
  },
  {
    "id": "m175",
    "meaning": "Recognise the intended obsolete-access accumulation through a finance-to-HR role move.",
    "hold": "HOLD a six-month duration as a universal revocation deadline or every dual-role grant as unauthorised. The current teaching assumes finance rights are obsolete; the unchanged stem does not expressly rule out justified continuing duties, so hold the premise. Document approved transitions and verify effective permissions across apps/sessions/tokens. A duty/role conflict may coexist if incompatible tasks are actually established; accumulation does not prove malicious intent. Current main removes authored automatic-revoke-all-previous-access guarantee. Same provisional mover family as m355/m072; no independent lifecycle or access-review execution.",
    "main": "Remove obsolete rights and approve justified continuing duties; privilege-creep naming depends on the old access no longer being needed.",
    "contrasts": [
      "A task-separation conflict may coexist, but incompatible duties are not specified; the intended pattern is obsolete rights surviving the move.",
      "The retention arose through a transfer rather than proving excessive initial onboarding.",
      "Role incompatibility needs specific conflicting responsibilities; the intended issue is retained unnecessary permissions."
    ],
    "family": "mover_obsolete_access_accumulation"
  },
  {
    "id": "m217",
    "meaning": "Identify the IdP as assertion issuer in the supplied SAML federation flow.",
    "hold": "HOLD a signature alone as automatic access, every SAML profile as signing in exactly one place, or the SP never handling credentials in any other flow. For the supplied flow the trusted IdP issues the assertion; the SP verifies issuer/key/signature, audience/recipient/time, request linkage and replay requirements for the actual binding, then applies its own authorisation. The browser transports data but cannot create the IdP signature without its signing capability; compromised IdP/signing keys remain risks. A CA certifies keys rather than creating this SAML identity assertion. Bearer theft, central trust and logout/revocation propagation remain separate; OIDC/OAuth use different mechanisms. Same provisional SAML family as m726; no live federation or provider-product certification.",
    "main": "The trusted IdP issues the assertion; the SP validates the actual profile and independently decides application permissions.",
    "contrasts": [
      "The SP consumes the trusted assertion and applies policy in this flow; one system may play different roles in another flow.",
      "The browser can carry an assertion, but possession of local credentials does not grant the IdP signing capability.",
      "A CA certificate can support key trust; it does not make the CA the SAML identity-assertion issuer."
    ],
    "family": "SAML_federated_assertion_recognition"
  },
  {
    "id": "m218",
    "meaning": "Classify a retinal scan as inherence and distinguish location context from an independent MFA category.",
    "hold": "HOLD retinal/iris scans as interchangeable measurements, biological traits as secrets/unforgeable or automatically sufficient standalone authentication. Geolocation can inform conditional access but does not independently establish another factor category; spoofing and proxy/network inference limit location trust. Liveness, sensor matching errors, privacy and accessible recovery require validation, and no biomedical or health inference follows from this vocabulary example. Current main removes the authored four-main-factors framing. Strongly correlate fingerprint naming m006/m117 and the existing factor-classification family rather than claim fresh transfer or independent sensor competence. No scan or location data is collected.",
    "main": "Retinal characteristics are biometric inherence; location is access context, not the measured biological trait or independently sufficient MFA factor.",
    "contrasts": [
      "The measured pattern is not remembered knowledge.",
      "The retina is an inherent characteristic rather than a possessed token; any device binding is a separate implementation question.",
      "Location is contextual data, not the retinal characteristic, and is not independently another MFA factor."
    ],
    "family": "authentication_factor_category_recognition"
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
 assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert(s.authored);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);assert.equal(q.correct,s.authored.correct);assert.equal(sig(q.q),sig(s.authored.q));assert.equal(sig(q.opts),sig(s.authored.opts));assert.notEqual(sig(q.exp),sig(s.authored.exp));
 return{recordId:row.recordId,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:false,sourceLayerDisposition:'authored_equals_preeditorial_then_effective_editorial',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',authoredMissingWrongCorrections:!s.authored.wrongFeedback,wrongCorrectionsChanged:sig(s.authored.wrongFeedback??null)!==sig(q.wrongFeedback),optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0},status:'source_inspection_no_additional_question_credit'};
});
assert.equal(sourceChecks.filter(r=>r.snapshotReplayChecked).length,0);assert.equal(candidates.filter(r=>r.flags.stemChanged||r.flags.optionsChanged||r.flags.importedSource||r.flags.capturedOverride||r.flags.snapshotOnlySource).length,0);assert.equal(sourceChecks.filter(r=>r.authoredMissingWrongCorrections).length,6);assert.equal(sourceChecks.filter(r=>r.wrongCorrectionsChanged).length,8);
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
assert.equal(broad.length,151);assert.equal(oldBroad.length,67);assert.deepEqual(counts(oldBroad),{explanation_bundle:18,glossary_definition:21,keyword_guide:1,lesson:1,lesson_check:4,lesson_section:3,lesson_traps:1,mcq:18});assert.equal(selectedIds.size,22);assert.equal(remaining.length,62);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);
assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,5);assert.deepEqual(remaining.filter(r=>r.kind==='pbq').map(r=>r.id),['pbq:p028','pbq:p045','pbq:p056','pbq:p058','pbq:p225']);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,combinedQuestions=new Set([...priorBank.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=bankRows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
assert.equal(combinedQuestions.size,360);assert.equal(combinedFeedback.size,324);assert.equal(paired.length,324);assert.equal(paired.filter(r=>r.kind==='mcq').length,308);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,olderQuestionOnlyDispositions:olderQuestions.length,allPacketPriorQuestions:priorBank.length,newQuestions:questionProposals.length,allPacketCombinedQuestions:combinedQuestions.size,remainingQuestionDispositions:483-combinedQuestions.size,combinedMcqs:bankRows.filter(r=>r.kind==='mcq'&&combinedQuestions.has(r.recordId)).length,combinedLocalPbqs:bankRows.filter(r=>r.kind==='pbq'&&combinedQuestions.has(r.recordId)).length,newFeedbackBundles:11,priorFullFeedback:priorFeedback.length,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.combinedMcqs,332);assert.equal(bankProgress.combinedLocalPbqs,28);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,36);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective46PriorityHeldDispositions:base.explanationProposals.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal})),olderQuestionPacketBindings:olderQuestions.map(r=>({recordId:r.recordId,priorPacketPath:r.priorPacketPath,priorDispositionRevision:r.priorDispositionRevision,status:'existing_limits_preserved_no_full_feedback_or_approval_inherited'}))};
assert.equal(priorHolds.objective46PriorityHeldDispositions.length,18);
const comparisonSpecs=[
  {
    "ids": [
      "m026",
      "m343",
      "m072",
      "m175",
      "m355",
      "m119",
      "m614"
    ],
    "meaning": "Provisioning/JML naming, obsolete-access accumulation and missed departure removal are related lifecycle decisions. m072/m175 share the prior m355 mover family but have less explicit obsolete-access premises. Transition authorisation and application/session outcomes remain held; no operational stage or deadline is independently proven."
  },
  {
    "ids": [
      "m034",
      "m120",
      "m108",
      "m077",
      "m319",
      "m217",
      "m726"
    ],
    "meaning": "m034 shares the prior m120 Kerberos ticket-architecture family; m217 shares the prior m726 SAML assertion family. TGT/service tickets, identity-assertion issuer, SSO reuse and OAuth resource delegation differ without protocol-name novelty proving independent evidence. Preserve Kerberos delegation/cross-realm and profile-specific federation-validation holds."
  },
  {
    "ids": [
      "m040",
      "m109"
    ],
    "meaning": "Strongly correlated MAC model recognition; m109 states owner-independent enforcement while m040 relies on its explanation for that distinguishing premise. ABAC can implement label policies; do not certify exclusive models or independent classification-policy scenarios."
  },
  {
    "ids": [
      "m041",
      "m107",
      "m117",
      "m218",
      "m006",
      "m215",
      "m408",
      "m216",
      "m721"
    ],
    "meaning": "m041/m107 combinations and m117/m218 biometric vocabulary join the prior m006/m215 provisional factor-classification family. Required local UV, WebAuthn method naming and RP/origin phishing resistance concern different implementation/threat limits. OTP activation, shared endpoints, SMS and recovery require qualification; no new independence or factor-strength approval."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids.map(id=>'mcq:'+id),comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get('mcq:'+id),p=c.previous.get('mcq:'+id);return{recordId:s.row.recordId,sourceRevision:s.record.sourceSignature,localRevision:s.row.revisions.localEffective,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
const sourceBindings=[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective46-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective46-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)},...inventory.map(({path,sha256})=>({path,sha256}))];
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'d174dd3a95cae0d85e09d488b0bf641066cc64b8',sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,legacyTrackedPriorQuestions:307},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences,status:'current_revision_bound_existing_question_judgments_no_new_credit_or_full_feedback_inference'},bankSignature:c.ledger.bankSignature,selectionPolicy:'Requested objective4.6 candidate set, ranked by existing structural triage then ID; all prior substantive packets reconciled before new question credit',candidateQuestionRecordIds:candidates.map(r=>r.recordId),selectedQuestionRecordIds:selected.map(r=>r.recordId),selectedFeedbackRecordIds:candidates.map(r=>'explanation:'+r.recordId),questionExclusions:exclusions,ambiguousPremiseOrContrastHolds:['mcq:m026','mcq:m040','mcq:m041','mcq:m072','mcq:m175'],ambiguityDisposition:'qualified_pending_owner_not_resolved_or_approved',sourceChecks,questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorHolds,objective46Census:census,objective46Denominator:{broadCandidates:151,allPacketPriorDispositions:67,newQuestionDispositions:11,newFeedbackDispositions:11,newAgentDispositions:22,combinedAgentDispositions:89,remaining:62,remainingByKind:counts(remaining)},remainingObjective46RecordIds:remaining.map(r=>r.id),bankProgress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},privateBoundary:{p017Revision:'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42',payloadReviewed:false,trustedRevisionId:null,localPilotFallbackDoesNotTransferToPrivate:true},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
function validate(value){
 assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);
 assert.equal(new Set(value.selectedQuestionRecordIds).size,11);assert.equal(value.questionProposals.length,11);assert.equal(value.explanationProposals.length,11);
 assert(value.questionProposals.every(r=>!c.previous.has(r.recordId)));assert(value.explanationProposals.every(r=>!legacyPrevious.has(r.recordId)));
 for(const r of value.questionProposals){const s=c.questions.get(r.recordId);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);}
 for(const r of value.explanationProposals){const s=c.questions.get(r.parentId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.record.localRevisionSignature);assert.equal(r.mainCorrectionRevision,sig(s.q.exp));assert.equal(r.wrongFeedbackRevision,sig(s.q.wrongFeedback));assert.equal(r.distractorCorrections.length,3);}
 // Every exported decision is checked against independently rebuilt current sources and fixed review judgments.
 const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);
}
let completedNegativeChecks;validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet);assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<11;i++){
 reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);reject(p=>p.questionProposals[i].trustedRevisionId=p.questionProposals[i].revisions.trustedCompilerObserved);reject(p=>p.questionProposals[i].contentQualification='');reject(p=>p.questionProposals[i].primaryConceptProposal='invented');reject(p=>p.questionProposals[i].humanApproved=true);reject(p=>p.questionProposals[i].newFamilyCredit=1);reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);reject(p=>p.questionProposals[i].familyLabelProposal='independent');reject(p=>p.questionProposals[i].objectiveScopeProposal={assessedCodes:['4.6'],contextCodes:[],status:'approved'});reject(p=>p.questionProposals[i].skillRoleProposal='invented');reject(p=>p.questionProposals[i].difficultyDisposition='calibrated');
}
for(let i=0;i<11;i++){
 reject(p=>p.sourceChecks[i].snapshotReplayChecked=!p.sourceChecks[i].snapshotReplayChecked);reject(p=>p.sourceChecks[i].revisions.authored=p.sourceChecks[i].revisions.authored===null?p.sourceChecks[i].revisions.preEditorialSnapshotMerged:null);reject(p=>p.sourceChecks[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);reject(p=>p.sourceChecks[i].optionShuffleProbe.feedbackRemapChecked=false);reject(p=>p.sourceChecks[i].sourcePriority=0);
 reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%11].sourceRevision);reject(p=>p.explanationProposals[i].parentLocalRevision='stale');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');reject(p=>p.explanationProposals[i].objectiveScopeProposal={assessedCodes:['4.6']});reject(p=>p.explanationProposals[i].mainCorrectionRevision='stale');reject(p=>p.explanationProposals[i].deliveryGate='all_before_submit');reject(p=>p.explanationProposals[i].approvedRemediation=true);
 for(let k=0;k<3;k++){reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].assessedSecondary=true);}
}
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);for(const path of holdPaths)reject(p=>{let r=p.priorHolds;for(const k of path.slice(0,-1))r=r[k];r[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{let old=p.priorHolds;for(let i=0;i<12;i++)old=old.inheritedHolds;old=old.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
for(let i=0;i<42;i++)reject(p=>p.allPacketReconciliation.olderQuestions[i].priorDispositionRevision='stale');
reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.allPacketReconciliation.olderQuestions.push(p.allPacketReconciliation.olderQuestions[0]));reject(p=>p.allPacketReconciliation.supportOnlyReferences[0].status='fully_reviewed');reject(p=>p.questionProposals.push({...p.questionProposals[0],recordId:ids[0]}));reject(p=>p.questionExclusions.push({recordId:'mcq:'+ids[0],newQuestionCredit:1}));reject(p=>p.ambiguousPremiseOrContrastHolds.pop());reject(p=>p.ambiguityDisposition='cleared');reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=360);reject(p=>p.objective46Census.pop());reject(p=>p.objective46Denominator.remaining=0);reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
completedNegativeChecks=negativeMutationChecks;
const exported={...packet,negativeMutationChecks};validate(exported);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const report=[
 '# Phase 2B-5 — final objective 4.6 MCQs and complete feedback',
 '**NOT READY.** Review date: **11 October 2026**. Finite local draft only. Baseline **'+packet.baselineCommit+'**; packet SHA-256 **'+hashFile(packetPath)+'**. A disposition is a recorded judgment awaiting owner review, not a scoring change. A hold keeps a claim unapproved without repairing learner content. MCQ means multiple-choice question; complete feedback includes the main explanation and all three wrong-choice corrections. This slice adds only its packet, report and focused audit.',
 '## Authority and finite selection',
 'The master plan and Phase 1 audit were read in full. Approved product decisions follow the master plan; the audit supplies historical implementation evidence. Current source facts were checked again. No unresolved authority conflict affects this local review. Concept mappings must be human reviewed before affecting mastery, and a content judgment does not supply that approval.',
 'The remaining eleven objective4.6 MCQs were read in the requested existing priority order: **'+ids.join(', ')+'**. Every priority score is **10**; all have effective-editorial/feedback change flags, without stem/option change flags, imports, captures or snapshot-only sources. Low structural priority does not establish correctness or resolve ambiguities. Each effective stem/options/key/main/three corrections was compared with its actual authored and preeditorial layer.',
 '**11 new question judgments + 11 new complete feedback judgments = 22 new pending rows.** All **59** existing substantive packets were inventoried, hashed and reconciled with current revisions first, including the previous eighteen-question objective4.6 packet. Zero parents or feedback bundles in this finite set already have a matching substantive judgment. Zero reused-parent exclusions or stale/private-source substitutions; no authored content is invented.',
 '**Ambiguity remains held**, particularly m026 process-versus-policy wording, m040 label-only MAC/ABAC distinction, m041 OTP activation and m072/m175 the unstated obsolete-access premise. These are qualified pending content judgments rather than cleared questions. No additional source-insufficient/private/stale row is deferred outside the slice; the holds themselves remain unresolved for owner review. MAC is mandatory access control, ABAC evaluates attributes, MFA combines factor categories, IdP issues identity assertions, and SP is the application that consumes them.',
 'Only content understanding and provisional family comparisons are proposed. Every new objectiveScopeProposal, skillRoleProposal and feedback roleProposal stays null. Canonical concept roles, objective tags, teaching links, difficulty calibration, independence, weights, publication, activation and learner evidence remain unapproved.',
 '## Reconciliation and separate coverage',
 'The all-packet inventory verifies array and older dictionary bindings. **42 distinct older question-only judgments (30 MCQs + 12 local PBQs)** remain reused history outside recent frozen-ledger overlays. Seventeen cross-packet reference occurrences receive no duplicate coverage. Twelve unmatched minimal link/context references, including five explanation links, remain outside complete-feedback or full-unit coverage. No historical packet, shared ledger, helper or active package is rewritten. **36** older question-only judgments still lack full feedback.',
 '| Pending local coverage | Before | New here | After | Remaining |\n| --- | ---: | ---: | ---: | ---: |\n| All-packet question judgments | 349 | 11 | 360/483 | 123 |\n| Complete feedback judgments | 313 | 11 | 324/483 | 159 |\n| Question plus complete feedback pairs | 313 | 11 | 324/483 | 159 |',
 'Question coverage is **332/395 MCQs + 28/88 local PBQs**, leaving **63 MCQs + 60 PBQs**. Complete pairs are **308 MCQs + 16 PBQs**, leaving **87 MCQs + 72 PBQs** without complete feedback. These are pending local judgments, not approved mastery evidence. The denominator stays 483 local assessments; two private variants, nine starters and two guest demos remain separate. Shuffles, comparisons, support links and inventory rows add no questions.',
 'Objective4.6 broad union: **151 records; 67 prior + 22 new = 89 pending dispositions; 62 remain**. Prior67 consists of the earlier eighteen MCQs and eighteen full feedback bundles,21 glossary definitions and10 substantive identity-zero-trust instructional-unit judgments (one lesson, one keyword guide, four checks/practice-keyword subunits, three sections and one traps unit). Those unit rows have actual revision-bound judgments; minimal context links do not. No new support-unit review or teaching-role approval is claimed.',
 '**All 29 effective objective4.6 MCQs and all 29 paired MCQ feedback bundles now have pending judgments.** This closes the finite MCQ review inventory, not the broader objective or approval process. Remaining: **five local PBQ questions**, **five PBQ feedback bundles** and **52 support/instructional records**. PBQ IDs: **'+remaining.filter(r=>r.kind==='pbq').map(r=>r.id).join(', ')+'**. No private record is in this objective union; private variants remain separately protected. The packet binds all151 census rows and all62 residual IDs.',
 '| Remaining objective4.6 kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
 '## Individual judgments and all correction contrasts',
 reviews.map(r=>'**'+r.id+' — new question and complete feedback.** '+r.meaning+'\n\n'+r.hold+'\n\nMain teaching: '+r.main+'\n\nWrong-choice contrasts, in current wrong-choice order: '+r.contrasts.map((t,k)=>(k+1)+'. '+t).join(' ')).join('\n\n'),
 'These are eleven single keyed decisions. Card/biometric and badge/PIN choices do not independently assess each component. A hold does not certify a correct implementation or resolve the original learner wording. Ambiguous alternatives remain explicit even though a qualified local disposition can be recorded.',
 '## Source precedence and delivery',
 '**Zero selected snapshots/captured overrides and zero selected snapshot replays**: all eleven have actual authored sources equal to their preeditorial revisions. There are no imported alternatives. Every effective revision differs from preeditorial, while all stems, offered options and keyed positions remain unchanged. Every main explanation changes. Unchanged options/positions do not prove source teaching is unchanged or an intended key is unambiguous.',
 'Six authored rows lack their own wrongFeedback: **m107,m109,m117,m175,m217,m218**. The effective editorial layer supplies all three specific corrections for each. Two additional existing correction bundles change: **m040,m072**. The current wrong-correction bundles for **m026,m034,m041** remain text-identical to their authored versions; they were still read fully. Thus eight changed bundles and three unchanged bundles all receive new substantive review. Eleven main signatures,33 choice/correction bindings and eleven parent/feedback revisions are verified. Eleven deterministic option-shuffle/remap probes preserve the key and all wrong corrections; no extra family credit.',
 'Source qualifications: m040 removes the old clearance-alone access guarantee and the ABAC-not-label-based assertion, but its unchanged stem still needs a distinguishing mandatory-policy premise. m072 removes escalation-as-always-active-exploit, but unnecessary old access is still assumed. m175 removes automatic removal of every previous-role permission and allows justified transition periods. m217 removes automatic signature-to-access teaching and requires SP validation/policy. m218 removes location as a fourth independent MFA factor. m041 still categorically calls both OTP apps possession-only; multi-factor activation is held. m034 directory-lookup shorthand must not teach that LDAP lacks Bind/authentication operations. None of these findings edits learner content.',
 '| Question | Authored domain / difficulty | Effective domain / difficulty |\n| --- | --- | --- |\n'+candidates.map(row=>{const s=c.questions.get(row.recordId);return'| '+row.questionId+' | '+s.authored.ch+' / '+s.authored.difficulty+' | '+s.q.ch+' / '+s.q.difficulty+' |';}).join('\n'),
 'Eight source domain1 labels become effective domain4; m026/m072/m175 remain domain4. Five source difficulties change to easy: m034/m040/m072 medium→easy and m109/m217 hard→easy. The other six remain easy. These are observed uncalibrated metadata, not approved retagging/difficulty. Feedback delivery stays conditional on selection, submission and entitlement; wrong teaching depends on the submitted wrong choice. Static practice/shuffle/feedback/selector source bindings match prior delivery code. No browser pool/set/guest path, real authentication, assertion, consent, KDC ticket, LDAP/RADIUS/TACACS exchange, account permission, HR/SCIM connector, biometric, badge/PIN, SMS or session result was tested.',
 '## Provisional families and primary references',
 comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
 'm034 reuses the provisional Kerberos ticket-architecture family from m120; m217 joins the SAML assertion family from m726. m072/m175 join the mover accumulation family from m355. m041/m107/m117/m218 join the existing m006/m215 factor-category family. m040/m109 share one new provisional mandatory-classification comparison label. m026 provisioning differs from broader JML naming but does not prove independent lifecycle execution. These are comparison labels with zero new family/evidence credit, not canonical merges or scoring approvals.',
 '[NIST SP800-162](https://csrc.nist.gov/pubs/sp/800/162/upd2/final) defines ABAC through subject/object/operation/environment attributes evaluated against policy. Our inference is that sensitivity and clearance are attributes, so labels alone do not exclude ABAC. m109 supplies an explicit owner-independent mandatory-policy clue; m040 does not. Neither item certifies a deployed classification policy, universal clearance rule or government requirement.',
 '[NIST SP800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) distinguishes single-factor OTP from OTP requiring a second activation factor (§§3.1.4–3.1.5), treats biometrics as non-secret and subject to authenticator requirements (§3.2.3), and limits out-of-band/PSTN use (§3.1.3). Its scope is network digital authentication, not certification of a physical swipe-access system. Our inference qualifies the two-OTP correction, SMS/biometric strength, factor independence and location context without approving a specific implementation or AAL.',
 '[Kerberos RFC4120](https://www.rfc-editor.org/rfc/rfc4120.html) specifies TGT/service-ticket exchanges, delegation/cross-realm support and replay requirements; §10 separates principal authentication from application authorisation. Our inference keeps m034 naming distinct from replay/mutual-authentication implementation and preserves m077 no-delegation correction holds. [LDAP RFC4511](https://www.rfc-editor.org/rfc/rfc4511.html) §4.2 defines Bind operations; directory access is broader than user lookup. Neither source verifies a live integration.',
 '[OASIS SAML2 profiles](https://docs.oasis-open.org/security/saml/v2.0/saml-profiles-2.0-os.pdf) §§4.1.4.3–4.1.4.5 require profile-specific SP validation and replay handling; unsolicited responses have different request-binding rules. Our inference identifies the assertion issuer while withholding automatic access, universal signing-placement, session safety or immediate global logout/revocation claims. No commercial IdP product/version capability is re-certified.',
 '## Preserved holds and release boundary',
 'All eighteen first-slice objective4.6 precise holds remain in exact source-bound rows, including RP/origin versus session protection, synced credentials/UV, client-certificate revocation, PAM/emergency access, OAuth/OIDC/consent, OTP categories, offboarding, mover permissions, Kerberos delegation/replay and JML integrations. All eighteen objective4.8, nineteen4.3, twelve4.1, eight3.3, fourteen3.2, eleven3.1 and earlier2.5/2.4/2.3/2.2/actor/supplier/crypto/PKI/PFS/channel/Unicode/PBQ grammar/grading/delivery/targeting holds remain in the exact inherited chain. m305 whole-scope, m046 precise contrast and m432 whole-numbered-scope limits remain; older contextual/recovery packet bindings and limits remain. Existing KEV/BOD26-04 current-policy uncertainty is not resolved by this slice. No prior pilot approval transfers to a new judgment.',
 'Private p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, unavailable/unreviewed with null trusted identity. The older objective52 local fallback judgment does not review or transfer trust to that private variant. No private fetch/export/substitution occurs. The new packet exports no stems, offered choices, keys, option-indexed answers or learner records.',
 'Active package unchanged: **1878 records / 435 identities / 2954 review decisions / 489 unresolved mappings / seven existing primary proposals**, SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All25 protected release hashes remain. Thirty-six unsupported local PBQ grammars, private-content review, remaining complete feedback/support coverage, owner decisions and calibration still block readiness.',
 '**NOT READY.** Local/offline/default-off/unwired/learner-invisible. No active package, runtime, canonical concept/role/family, objective tag, skill, calibrated difficulty, teaching link, weight, publication, activation, learner evidence, shadow write, private processing, migration, cohort, live write, deployment or Phase3 change. The finite MCQ inventory closes while substantive holds and the broader phase remain open.',
 '## Validation and delivery',
 'Run node '+scriptPath+' and npm run audit:content-mapping. The focused audit rebuilds and matches the frozen ledger; verifies all59 prior packet/current row bindings; confirms this is the exact remaining eleven-MCQ set; checks eleven authored/preeditorial comparisons, zero selected snapshot/import substitutions,11 main/33 wrong corrections,11 shuffle/remap probes, the151-record census and separate question/feedback counts. **'+negativeMutationChecks+' rejected mutations** cover stale/trusted substitutions, source capture/replay fabrications, current/inherited hold erasure, cleared ambiguities, role/scope/difficulty/approval/weight changes, wrong corrections, duplicate/missing inventory, support-link overcount, private fallback transfer, forbidden exports and activation.',
 'All29 mapping tests and deterministic package verification, all25 protected checksums, and git diff --check are required before committing only the three task files with **[skip deploy]**. Push completion requires exact equality of local HEAD, origin/main and remote refs/heads/main. The skip marker is checked using the configured Vercel ignore command; a source push is not evidence of live deployment. Browser/live/private delivery remains unverified, and unrelated dirty/generated files remain unstaged.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE46_FINAL_MCQS_NOT_READY',candidateIds:ids,newQuestionDispositions:11,newFeedbackDispositions:11,bankProgress,objective46:packet.objective46Denominator,snapshotReplays:0,wrongCorrections:33,shuffleProbes:11,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
