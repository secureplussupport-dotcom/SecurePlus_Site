import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
import {readStarterQuestions} from './lib/content-mapping/delivery-inventory.mjs';
import {readGuestPreview,verifyGuestPreview} from './lib/content-mapping/guest-preview.mjs';
import {createHash} from 'node:crypto';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {compileRevision} from '../server/adaptive/revision.mjs';

const scriptPath='scripts/audit-starter-guest-editorial-remediation.mjs';
const packetPath='docs/drafts/phase-2b5-starter-guest-editorial-remediation-proposals.json';
const reportPath='docs/phase-2b5-starter-guest-editorial-remediation-review.md';
const basePath='docs/drafts/phase-2b5-hotspot-pbq-remediation-proposals.json';
const baseReport='docs/phase-2b5-hotspot-pbq-remediation-review.md';
const baseAudit='scripts/audit-hotspot-pbq-remediation.mjs';
const starterPath='docs/drafts/phase-2b5-nine-starter-pairs-proposals.json';
const guestPath='docs/drafts/phase-2b5-fourteen-guest-demo-records-proposals.json';
for(const [path,sha256] of [
 [basePath,'3fcf3a327e936706e0161e8d296dd137434f94cbe32dd85ebeba8b9319a207c7'],
 [baseReport,'75b510feffe0a595937ea2648d97639fe1f796578f066221e3f35e9981938214'],
 [baseAudit,'c5067d3ce547249da755c1fd5985787b094c7445600594737f054c34a368243c'],
 [starterPath,'31a8f04dbe1d7317d424b76fdf2734bcfc7d12d92c43feb292bd3a969317b252'],
 [guestPath,'1ef92028563f01877e647547509b2971db985bbd54b966d8f6dded9896b62fa0'],
])assert.equal(hashFile(path),sha256);
const c=readReviewTriage(),base=readJson(basePath),starterPrior=readJson(starterPath),guestPrior=readJson(guestPath);
verifySourceBindings(base.sourceBindings);
assert.deepEqual(readJson('docs/phase-2b5-question-review-ledger.json'),c.ledger);
const starters=readStarterQuestions(),guest=readGuestPreview();assert(verifyGuestPreview(c.pkg));
const starterValues=Object.entries(starters.sets).flatMap(([experience,rows])=>rows.map(q=>({q,experience})));
const suffixes=['athena-new-confidentiality','athena-new-mfa','athena-new-phishing','athena-pro-hash','athena-pro-least-privilege','athena-pro-ransomware','athena-study-firewall','athena-study-rpo','athena-study-siem'];
assert.deepEqual(starterValues.map(s=>s.q.id).sort(),suffixes);
const guestPairs=[['guest-demo:mcq:access-control','guest-demo:mcq:feedback'],['guest-demo:pbq:incident-response-ordering','guest-demo:pbq:feedback']];
const candidateRecordIds=[...suffixes.flatMap(id=>['starter:'+id,'explanation:starter:'+id]),...guestPairs.flat()].sort();
const previous=new Set(c.pkg.records.filter(r=>!base.remainingCatalogueRecordIds.includes(r.id)).map(r=>r.id));assert.equal(previous.size,1688);
const inventory=[...base.allPacketReconciliation.inventory,{path:basePath,sha256:hashFile(basePath),substantiveRows:0}].sort((a,b)=>a.path.localeCompare(b.path));
const actual=readdirSync('docs/drafts').filter(n=>n.startsWith('phase-2b5-')&&n.endsWith('.json')).map(n=>'docs/drafts/'+n).filter(path=>path!==packetPath&&['questionProposals','explanationProposals','instructionalProposals'].some(k=>Array.isArray(readJson(path)[k]))).sort();
assert.equal(inventory.length,130);assert.deepEqual(actual,inventory.map(r=>r.path).sort());
const references=new Set();let rawInstructions=0;const distinctInstructions=new Set();
for(const binding of inventory){
 assert.equal(hashFile(binding.path),binding.sha256);const p=readJson(binding.path);
 verifySourceBindings(Array.isArray(p.sourceBindings)?p.sourceBindings:Object.entries(p.sourceBindings||{}).map(([path,sha256])=>({path,sha256})));
 const rows=['questionProposals','explanationProposals','instructionalProposals'].flatMap(k=>p[k]||[]);assert.equal(rows.length,binding.substantiveRows);
 for(const r of rows){assert.equal(r.publishedRecordSignature??r.sourceRevision,c.records.get(r.recordId).sourceSignature);if(previous.has(r.recordId))references.add(r.recordId);}
 for(const r of p.instructionalProposals||[]){rawInstructions++;distinctInstructions.add(r.recordId);}
}
assert.deepEqual([...references].sort(),[...previous].sort());assert.deepEqual([rawInstructions,distinctInstructions.size],[780,766]);
const priorHeldRows=[...base.priorHeldRows,...base.deferredSelectedRows.filter(r=>!base.priorHeldRows.some(h=>h.recordId===r.recordId)).map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,priorDispositionRevision:sig(r),packetPath:basePath,field:'deferredSelectedRows',status:r.status,resolved:false,newCredit:0}))];
assert.equal(priorHeldRows.length,171);assert.equal(new Set(priorHeldRows.map(r=>r.recordId)).size,171);
for(const r of priorHeldRows){assert.equal(c.records.get(r.recordId).sourceSignature,r.sourceRevision);assert.equal(sig(readJson(r.packetPath)[r.field].find(x=>x.recordId===r.recordId)),r.priorDispositionRevision);assert(!r.resolved&&!r.newCredit);}
for(const id of candidateRecordIds){assert(!previous.has(id));assert(priorHeldRows.some(r=>r.recordId===id));assert.deepEqual(c.records.get(id).objectiveCodes,[]);assert.equal(c.records.get(id).trustedRevisionId,null);}
for(const b of base.priorStateBindings)assert.equal(sig(readJson(b.packetPath)[b.field]),b.sourceRevision);
const inheritedBindings=readJson(base.priorStateBindings.find(b=>b.field==='priorHoldBindings').packetPath).priorHoldBindings;
assert.equal(inheritedBindings.length,752);for(const b of inheritedBindings){assert.equal(sig(readJson(b.packetPath)[b.field]),b.sourceRevision);assert(!b.resolved&&!b.newCredit);}
const priorStateBindings=['priorHeldRows','deferredSelectedRows','priorStateBindings','rowDispositions','editorialDrafts','candidateChecks','catalogueProgress','catalogueCensusBinding','objectiveCoverage','remainingCatalogueRecordIds','remainingBankQuestions','remainingBankFeedback','remainingCompletePairRecordIds','bankProgress','supportProgress','starterProgress','guestProgress','canonicalBoundary','activePackageUnchanged','knownSavedMixedSetRestoreObservation'].map(field=>({packetPath:basePath,field,sourceRevision:sig(base[field]),newCredit:0,resolved:false}));
const reuseSpecs=[[starterPath,['sourceChecks','gradingChecks','answerVisibilityChecks','experienceProbes','shuffleChecks','fallbackChecks','fallbackGlossaryBindings','semanticCounterexamples','familyComparisons','deliveryObservations']],[guestPath,['sourceChecks','mcqChecks','pbqStateChecks','pbqResponseChecks','feedbackCounterexample','malformedChecks','namespaceRejections','deliveryObservations']]];
const reusedEvidence=reuseSpecs.flatMap(([path,fields])=>fields.map(field=>{const p=readJson(path);assert(Object.hasOwn(p,field));return{packetPath:path,field,sourceRevision:sig(p[field]),currentSourcePinsVerified:true,approvalTransferred:false,newCredit:0};}));

const unit=(a,b)=>sourceUnit('src/App.jsx',a,b);
const getterUnit=unit('function getAthenaDiagnosticQuestions(','function AthenaSignupJourney(');
const getter=Function('ATHENA_STARTER_QUESTION_SETS',getterUnit.code+';return getAthenaDiagnosticQuestions;')(starters.sets);
const signupUnit=unit('function AthenaSignupJourney(','function AcademySignupWizard(');
const optionUnit=unit('            const correct=index===diagnosticQuestion.correct;','            return <button type="button" key={`${diagnosticQuestion.id}-${index}`}');
const optionState=Function('diagnosticQuestion','diagnosticSubmitted','diagnosticSelected','index',optionUnit.code+';return state;');
const shuffleUnit=unit('function shuffleMcqOptions(','function playAnswerSound(');
const shuffleFactory=Function('Math',shuffleUnit.code+';return shuffleMcqOptions;');
assert(signupUnit.code.includes('This is optional and is not a readiness score.'));
assert(signupUnit.code.includes('<p>{diagnosticQuestion.exp}</p>')&&!signupUnit.code.includes('wrongFeedback'));
assert(!signupUnit.code.includes('GlossaryText')&&!signupUnit.code.includes('isPro'));
const guestProbe=sourceUnit('scripts/audit-fourteen-guest-demo-records.mjs','const unit=(a,b)=>','const units=[');
const {mcqModel,mcqText,pbqModel,pbqText,mcqUnit,pbqUnit,cssUnit}=Function('sourceUnit','guest','assert','readFileSync','sig',guestProbe.code+';return {mcqModel,mcqText,pbqModel,pbqText,mcqUnit,pbqUnit,cssUnit};')(sourceUnit,guest,assert,readFileSync,sig);
assert(cssUnit.code.includes('answer-key-correct:hover')&&mcqUnit.code.includes('answer-key-correct'));
assert(pbqUnit.code.includes('event.dataTransfer.getData("text/plain")')&&pbqUnit.code.includes('next-step-hint'));
assert.equal(mcqText(1,false),mcqText(2,false));
const guestOrder=pbqModel('pbq',[null,null,null],()=>{},()=>{},()=>{});
assert.deepEqual(guestOrder.expected,['Contain','Eradicate','Recover']);
const currentWrong=pbqModel('pbq',['Contain','Recover','Eradicate'],()=>{},()=>{},()=>{});
assert(currentWrong.pbqComplete&&!currentWrong.pbqCorrect);assert(pbqText(true,false).includes('containment'));
let unknownPlaced;
pbqModel('pbq',[null,null,null],value=>{unknownPlaced=value;},()=>{},()=>{}).placeStep('__foreign_drop__',0);
assert.equal(unknownPlaced[0],'__foreign_drop__');
const sourceChecks=candidateRecordIds.map(recordId=>{
 const r=c.records.get(recordId),starter=recordId.includes('starter:'),parentId=starter?'starter:'+recordId.split('starter:')[1]:guest.records.find(x=>x.id===recordId).parentId??recordId;
 if(starter){
  const q=starterValues.find(s=>parentId==='starter:'+s.q.id).q;
  const prior=starterPrior.sourceChecks.find(s=>s.recordId===parentId);
  assert.equal(sig(q),c.records.get(parentId).sourceSignature);assert.throws(()=>compileRevision(q,'mcq'),{message:'Invalid question identity'});
  assert.equal(r.sourceSignature,recordId===parentId?sig(q):c.records.get('explanation:'+parentId).sourceSignature);
  assert(getter(starterValues.find(s=>s.q.id===q.id).experience).some(x=>sig(x)===sig(q)));
  return{recordId,kind:r.kind,parentRecordId:parentId,sourceRevision:r.sourceSignature,parentRevision:c.records.get(parentId).sourceSignature,authoredEqualsEffectiveAndCatalogue:true,sourceCitations:prior.sourceCitations,fieldRevisions:['q','opts','correct','exp','wrongFeedback'].map(field=>({fieldPath:field,sourceRevision:sig(q[field]??null)})),nativeIdentitySupported:false,sourcePayloadAvailable:true,privateLayerApplied:false,currentWrongOptionRationales:0};
 }
 const g=guest.records.find(x=>x.id===recordId),prior=guestPrior.sourceChecks.find(x=>x.recordId===recordId);
 assert.equal(g.sourceSignature,r.sourceSignature);assert.equal(prior.sourceRevision,r.sourceSignature);assert.deepEqual(g.sourceUnits,prior.sourceUnitBindings);
 return{recordId,kind:r.kind,parentRecordId:parentId,sourceRevision:r.sourceSignature,parentRevision:c.records.get(parentId).sourceSignature,revisionRecipe:prior.revisionRecipe,sourceCitations:prior.sourceCitations,sourceUnitBindings:g.sourceUnits,nativeIdentitySupported:false,sourcePayloadAvailable:false,privateLayerApplied:false,sourceIsReachableJSXNotQuestionObject:true};
});

// These are newly reviewed public drafts, never patches to the active literals.
const edits={
 'athena-new-confidentiality':[
  'A team wants only authorised people and systems to read its files. Which security goal does this describe?',
  'Confidentiality restricts access to information and its disclosure to authorised people and systems. Keeping a service online is a different goal.',
  {0:'Availability is about being able to use a service or information when needed. A service can be available while still exposing files to unauthorised readers.',2:'Redundancy provides spare components or copies to improve resilience. Extra copies do not, by themselves, restrict who may read information.',3:'Scalability is the ability to handle changes in workload or size. It does not define who is authorised to read a file.'},
  'confidentiality-recognition','Restricts the judgment to authorised reading/disclosure, not legal privacy compliance or a deployed control.'],
 'athena-new-mfa':[
  'An attacker knows an account password but does not have its separate authentication device. Which control can require a different factor before sign-in?',
  'Multi-factor authentication uses different factor types, such as a password you know and an authenticator device you possess. It can stop a password-only attacker, but the MFA label alone does not guarantee protection against every phishing or session attack.',
  {0:'A password hint is information that helps someone remember a password. It is not an independent authentication factor and may help an attacker guess the password.',1:'A shared login lets multiple people use the same account. Sharing credentials does not require another factor and makes individual accountability harder.',3:'Changing the length of a username does not require another authentication factor. Knowing the password remains the only proof in the stated password-only design.'},
  'mfa-factor-recognition','Makes the password-only attacker and separate possession factor explicit without promising universal phishing resistance.'],
 'athena-new-phishing':[
  'A message impersonates IT support and asks you to enter your password on a fake sign-in page. Which attack is this?',
  'Phishing uses a deceptive message or identity to persuade someone to disclose information or take an unsafe action. It can arrive through email, text or other messaging; this question does not test a real link or message.',
  {1:'Tailgating describes entering a restricted physical area by following another person. This scenario describes a deceptive message and fake sign-in page instead.',2:'Shoulder surfing means observing information, such as a password, over someone’s shoulder or by similar visual observation. The attacker here is asking the recipient to disclose it through a fake page.',3:'Dumpster diving means searching discarded material for useful information. No discarded paper, device or other waste is involved in the described message.'},
  'phishing-mechanism-recognition','Uses a concrete deceptive message rather than an email-only definition; no real phishing detection claim.'],
 'athena-pro-hash':[
  'A trusted publisher provides a SHA-256 digest for the exact file version you download. You hash the downloaded file bytes with SHA-256 and get a different digest. Which check has failed?',
  'The integrity comparison failed: the downloaded bytes do not match the trusted expected digest for that file version using the same algorithm. A mismatch does not explain whether the cause is corruption, a different file or malicious change, and a digest supplied by an attacker would not establish publisher authenticity.',
  {0:'Availability concerns being able to obtain or use the file or service. The file was downloaded and hashed; this result concerns whether its bytes match the expected version.',2:'Confidentiality concerns preventing unauthorised disclosure. A hash mismatch does not show that anyone read the file.',3:'Authentication concerns verifying an identity or source. The stated comparison assumes a trusted reference and checks file integrity; the mismatch alone does not identify a person or prove an authentication failure.'},
  'comparable-hash-integrity','Adds trusted expected version, identical algorithm and file-byte input. Does not infer an attacker or authenticity from a bare digest.'],
 'athena-pro-least-privilege':[
  'A reporting account receives only the read access needed for its assigned task. Which principle does this illustrate?',
  'Least privilege limits an account to the permissions needed for its assigned work. Naming the principle does not prove that a real permission set has been reviewed or correctly enforced.',
  {1:'Open access broadly permits access instead of limiting it to the account’s assigned task. That is the opposite of the restriction described here.',2:'Job rotation changes who performs duties over time. It does not, by itself, limit the permissions held by this reporting account.',3:'High availability keeps a service usable despite failures. It does not decide which reports an account is allowed to read.'},
  'minimum-permissions-recognition','Same introductory recognition family as the guest MCQ; do not count the two as independent evidence.'],
 'athena-pro-ransomware':[
  'Responders confirm ransomware is spreading between office computers. Their approved plan authorises network isolation, and no safety-critical service depends on those connections. Which action best limits further network spread now?',
  'Isolate the affected systems as authorised by the response plan to reduce further network spread. Coordinate the response and continue checking other systems: isolation does not remove the malware or prove that the whole incident is contained.',
  {1:'Deleting every log removes information needed to understand and investigate the incident. It does not stop the network connections carrying the spread.',2:'Immediate payment does not isolate affected computers or guarantee a working decryptor, data recovery or an end to the incident. It does not meet the stated containment task.',3:'Restarting every server indiscriminately can disrupt services and lose volatile evidence without closing the paths used for spread. Follow the supplied authorised isolation plan instead.'},
  'bounded-ransomware-response','Adds confirmation, authority, network-spread goal and safety premise; rejects a universal first action or guaranteed containment.'],
 'athena-study-firewall':[
  'A control evaluates network traffic against allow and deny rules. Which listed control has this main function?',
  'A firewall evaluates network traffic using its configured rules and allows or blocks traffic accordingly. Firewall types differ, and permitted traffic can still contain harmful activity.',
  {1:'A cryptographic hash produces a digest for a data input. It does not itself enforce network allow and deny rules.',2:'A digital certificate binds a public key to identity information under an issuer’s signature. It is not the device or service enforcing these traffic rules.',3:'A backup is a retained copy used to support recovery. Keeping a backup does not filter live network traffic.'},
  'firewall-function-recognition','Does not assume every firewall tracks connections or guarantees attack prevention.'],
 'athena-study-rpo':[
  'A service owner says losing more than 15 minutes of recent records after an outage is unacceptable. Which recovery target describes that limit?',
  'Recovery Point Objective (RPO) expresses the tolerable amount of recent data loss as a time window. Here the target is 15 minutes of records; whether a usable recovery point meets it must be checked, not assumed from a backup schedule.',
  {0:'Recovery Time Objective (RTO) is the target time for restoring the service. It answers how long recovery may take, rather than how much recent data may be lost.',2:'Mean Time to Repair or Recover (MTTR) is an average repair or recovery duration, with the exact expansion defined by the organisation. It is not the tolerable recent-data-loss window.',3:'Single Loss Expectancy (SLE) estimates the loss from one event, usually in money. It is not a recovery-point target measured in minutes of records.'},
  'rpo-data-loss-window','Separates a time-based data-loss target from restoration time, an average duration and a monetary estimate.'],
 'athena-study-siem':[
  'A security team wants to bring logs from many systems into one place and compare events for investigation. Which listed tool is designed for this purpose?',
  'A Security Information and Event Management (SIEM) system supports collecting and comparing security events from different sources. Useful results depend on enabled logs, relevant rules and investigation; collecting logs does not guarantee that every incident is detected.',
  {1:'A firewall primarily enforces traffic policy. It may produce logs, but it is not the cross-system log collection and comparison tool asked for here.',2:'A load balancer distributes traffic or work between services. That differs from bringing security events together for investigation.',3:'A password vault stores and manages credentials. It does not have the requested primary purpose of comparing security events from many systems.'},
  'siem-log-correlation-purpose','Generic purpose only; no current vendor capability, complete visibility or detection guarantee.'],
};
function mcqDraft(parentId,feedbackId,questionText,labels,key,mainTeaching,wrong,family,reviewRationale){
 const choices=labels.map((label,i)=>({id:'draft-choice:'+sig(parentId).slice(7,19)+':'+(i+1),label}));
 assert.equal(Object.keys(wrong).length,labels.length-1);assert(!Object.hasOwn(wrong,key));
 const body={parentRecordId:parentId,feedbackRecordId:feedbackId,parentSourceRevision:c.records.get(parentId).sourceSignature,feedbackSourceRevision:c.records.get(feedbackId).sourceSignature,format:'single_choice',questionText,choices,expectedChoiceId:choices[key].id,mainTeaching,optionTeaching:choices.map((choice,i)=>({choiceId:choice.id,verdict:i===key?'correct':'incorrect',text:i===key?mainTeaching:wrong[i]})),reviewFamily:family,reviewRationale};
 return finishDraft(body);
}
function finishDraft(body){
 const questionRevision=sig({format:body.format,questionText:body.questionText,choices:body.choices??null,steps:body.steps??null,expectedChoiceId:body.expectedChoiceId??null,expectedStepIds:body.expectedStepIds??null});
 const feedbackRevision=sig({mainTeaching:body.mainTeaching,optionTeaching:body.optionTeaching??null,stepTeaching:body.stepTeaching??null,permutationTeaching:body.permutationTeaching??null});
 return{...body,questionRevision,feedbackRevision,candidateRevision:sig(body),status:'CODEX_REVIEWED_LOCAL_CONTENT_DRAFT_ONLY',codexContentReviewed:true,humanReviewed:false,humanApproved:false,deliveryQualified:false,currentSourceHoldResolved:false,canonicalApproval:false,newCatalogueCredit:0,newPairCredit:0,newFamilyCredit:0,masteryWeight:0};
}
const localCandidates=starterValues.map(({q})=>{
 const [questionText,mainTeaching,wrong,family,reason]=edits[q.id];
 return mcqDraft('starter:'+q.id,'explanation:starter:'+q.id,questionText,q.opts,q.correct,mainTeaching,wrong,family,reason);
});
localCandidates.push(mcqDraft(guestPairs[0][0],guestPairs[0][1],
 'A reporting user can read only the reports needed for their assigned work. Which principle does this illustrate?',
 mcqModel('mcq',null).options,0,
 'Least privilege gives a user or account only the access needed for its assigned work. This terminology check does not prove that a real system enforces the correct permissions.',
 {1:'Tailgating refers to following someone into a restricted physical area. It does not describe limiting this user’s access to reports.',2:'Piggybacking is also used for following another person through an access point, with terminology that can overlap tailgating. It is not the minimum-permissions principle asked for here.'},
 'minimum-permissions-recognition','Shares the introductory least-privilege family with the reporting-account starter. No universal consent distinction between the two physical-entry terms is required.'));
const steps=[{id:'contain',label:'Contain',text:'Use the authorised isolation to reduce further network spread; continue coordination and assessment.'},{id:'eradicate',label:'Eradicate',text:'Address identified malware and its entry path, then check that the known cause has been removed.'},{id:'recover',label:'Recover',text:'Restore from verified clean backups and check service operation before reconnecting under the plan.'}];
const permutationTeaching=[
 [['contain','eradicate','recover'],'Correct for this supplied plan: limit further spread, address the known cause, then restore and verify services. Communication, investigation and evidence work may continue throughout.'],
 [['contain','recover','eradicate'],'Containment is already first in your sequence. The remaining error is restoring before addressing the identified malware and entry path, which can expose the restored service again. Put eradication before recovery for this plan.'],
 [['eradicate','contain','recover'],'This sequence starts cleanup while the affected computers can still spread ransomware. The supplied plan authorises safe network isolation first; then address the identified cause before recovery.'],
 [['eradicate','recover','contain'],'Both cleanup and restoration occur before the authorised isolation in this sequence. First reduce the continuing network spread, then address the known cause and restore verified services.'],
 [['recover','contain','eradicate'],'Recovery begins before limiting spread or addressing the identified cause. A restored service can be exposed again. Use the authorised containment, then eradication, before recovery under this plan.'],
 [['recover','eradicate','contain'],'Recovery is first and containment last, leaving both dependencies unmet at restoration time. Reduce continuing spread, address the known cause, and only then restore and verify services under this plan.'],
].map(([stepIds,text])=>({stepIds,text}));
localCandidates.push(finishDraft({parentRecordId:guestPairs[1][0],feedbackRecordId:guestPairs[1][1],parentSourceRevision:c.records.get(guestPairs[1][0]).sourceSignature,feedbackSourceRevision:c.records.get(guestPairs[1][1]).sourceSignature,format:'ordering',questionText:'Practice-only scenario: ransomware is confirmed on ordinary office computers and is still spreading over the network. The approved plan authorises isolating affected computers; assume no safety-critical service depends on those connections. Before restoring services, responders must address the identified malware and its entry path. Verified clean backups are available, and restored services must be checked before reconnection. Arrange these three work packages for this stated plan.',steps:steps.map(({id,label})=>({id,label})),expectedStepIds:['contain','eradicate','recover'],mainTeaching:'For this supplied plan, containment limits further spread, eradication addresses the known cause, and recovery restores and verifies services. Real response activities can overlap; this is a bounded plan-recognition exercise, not a universal linear incident model or evidence of successful containment.',stepTeaching:steps,permutationTeaching,reviewFamily:'bounded-ransomware-response',reviewRationale:'Adds explicit fictional network-spread, authority, safety and restoration dependencies. Feedback distinguishes the already-contained wrong order. Shares response content with the starter and bank rather than creating independent evidence.'}));
assert.equal(localCandidates.length,11);
const expectedDrafts=new Map(localCandidates.map(d=>[d.parentRecordId,d]));
function validateDraft(d){
 assert.deepEqual(d,expectedDrafts.get(d.parentRecordId),'Exact source-bound Codex draft required');
 assert.equal(d.parentSourceRevision,c.records.get(d.parentRecordId).sourceSignature);assert.equal(d.feedbackSourceRevision,c.records.get(d.feedbackRecordId).sourceSignature);
 assert(d.questionText.length>30&&d.mainTeaching.length>40);
 if(d.format==='single_choice'){
  assert.equal(new Set(d.choices.map(x=>x.id)).size,d.choices.length);assert.equal(new Set(d.choices.map(x=>x.label)).size,d.choices.length);
  assert.equal(d.optionTeaching.length,d.choices.length);assert.equal(d.optionTeaching.filter(t=>t.verdict==='correct').length,1);
  assert.equal(d.optionTeaching.find(t=>t.verdict==='correct').choiceId,d.expectedChoiceId);
  assert(d.optionTeaching.every(t=>t.text.length>40&&d.choices.some(c=>c.id===t.choiceId)));
  assert.equal(new Set(d.optionTeaching.map(t=>t.text)).size,d.choices.length);
 }else{assert.equal(d.permutationTeaching.length,6);assert.equal(new Set(d.permutationTeaching.map(t=>t.text)).size,6);assert.equal(d.stepTeaching.length,3);}
}
const enabledByDefault=false;
function reviewView(d,{enabled=enabledByDefault,submitted=false,response=null}={}){
 if(!enabled)return null;
 validateDraft(d);
 const view={format:d.format,questionText:d.questionText,choices:d.choices??null,steps:d.steps??null};
 if(!submitted)return view;
 let hit,teaching;
 if(d.format==='single_choice'){
  assert(typeof response==='string'&&d.choices.some(c=>c.id===response),'Offered choice ID required');
  hit=response===d.expectedChoiceId;teaching=d.optionTeaching;
 }else{
  assert(Array.isArray(response)&&response.length===3&&new Set(response).size===3&&response.every(id=>d.steps.some(s=>s.id===id)),'Three unique offered steps required');
  hit=isDeepStrictEqual(response,d.expectedStepIds);teaching=d.permutationTeaching.find(t=>isDeepStrictEqual(t.stepIds,response)).text;
 }
 return{...view,result:hit?'correct':'incorrect',mainTeaching:d.mainTeaching,teaching,stepTeaching:d.stepTeaching??null};
}
function renderReview(view){
 const h=React.createElement;
 const inputs=view.format==='single_choice'?view.choices.map(c=>h('button',{key:c.id,type:'button'},c.label)):view.steps.map((_,i)=>h('label',{key:i},'Step '+(i+1),h('select',{'aria-label':'Response step '+(i+1),defaultValue:''},h('option',{value:''},'Choose a step'),...view.steps.map(s=>h('option',{key:s.id,value:s.id},s.label)))));
 const feedback=view.result?h('section',{role:'status','aria-live':'polite'},h('h2',null,'Answer review: '+(view.result==='correct'?'Correct':'Review your answer')),h('p',null,view.mainTeaching),...(Array.isArray(view.teaching)?view.teaching.map(t=>h('p',{key:t.choiceId},view.choices.find(c=>c.id===t.choiceId).label+' — '+(t.verdict==='correct'?'Correct':'Incorrect')+': '+t.text)):[h('p',{key:'sequence'},view.teaching),...view.stepTeaching.map(s=>h('p',{key:s.id},s.label+': '+s.text))])):null;
 return renderToStaticMarkup(h('article',null,h('fieldset',null,h('legend',null,view.questionText),...inputs),feedback));
}
const permutations=xs=>xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(rest=>[x,...rest])):[[]];
const shuffleDraws=n=>n<2?[[]]:Array.from({length:n},(_,i)=>(i+.25)/n).flatMap(value=>shuffleDraws(n-1).map(rest=>[value,...rest]));
const draftChecks=[];let offeredPaths=0,wrongOptionCorrections=0,displayPermutations=0,displayChoiceChecks=0,invalidDraftCases=0,staticRenderChecks=0,currentOptionStateChecks=0;
const rejectDraft=fn=>{assert.throws(fn);invalidDraftCases++;};
for(const d of localCandidates){
 validateDraft(d);assert.equal(reviewView(d),null);const view=reviewView(d,{enabled:true});
 assert(!/"(?:expectedChoiceId|expectedStepIds|mainTeaching|teaching|result|optionTeaching|permutationTeaching)"\s*:/.test(JSON.stringify(view)));
 const initial=renderReview(view);assert(initial.includes('<fieldset>')&&initial.includes('<legend>'));assert(!initial.includes('Answer review'));assert(!initial.includes('answer-key-correct')&&!initial.includes('next-step-hint'));staticRenderChecks++;
 if(d.format==='single_choice'){
  for(const option of d.choices){const result=reviewView(d,{enabled:true,submitted:true,response:option.id});assert.equal(result.result,option.id===d.expectedChoiceId?'correct':'incorrect');assert.equal(result.teaching.length,d.choices.length);const markup=renderReview(result);assert(markup.includes('role="status"')&&markup.includes('aria-live="polite"')&&markup.includes('Answer review'));staticRenderChecks++;offeredPaths++;}
  wrongOptionCorrections+=d.choices.length-1;
  const seen=new Set();
  for(const draws of shuffleDraws(d.choices.length)){
   const pending=[...draws],math=Object.create(Math,{random:{value:()=>pending.shift()}});
   const shuffled=shuffleFactory(math)({opts:d.choices.map(c=>c.label),correct:d.choices.findIndex(c=>c.id===d.expectedChoiceId),exp:d.mainTeaching,wrongFeedback:Object.fromEntries(d.choices.flatMap((c,i)=>c.id===d.expectedChoiceId?[]:[[i,d.optionTeaching.find(t=>t.choiceId===c.id).text]]))});
   assert.equal(pending.length,0);assert.equal(shuffled.exp,d.mainTeaching);seen.add(sig(shuffled.opts));displayPermutations++;
   const order=shuffled.opts.map(label=>d.choices.find(c=>c.label===label)),markup=renderReview({...view,choices:order});
   assert.deepEqual([...markup.matchAll(/<button type="button">([^<]+)<\/button>/g)].map(m=>m[1]),order.map(c=>c.label));
   for(const [index,option] of order.entries()){
    assert.equal(reviewView(d,{enabled:true,submitted:true,response:option.id}).result,index===shuffled.correct?'correct':'incorrect');
    if(index!==shuffled.correct)assert.equal(shuffled.wrongFeedback[index],d.optionTeaching.find(t=>t.choiceId===option.id).text);
    displayChoiceChecks++;
   }
  }
  assert.equal(seen.size,shuffleDraws(d.choices.length).length);
  for(const response of [null,undefined,-1,{},'__foreign__',d.choices.map(x=>x.id)])rejectDraft(()=>reviewView(d,{enabled:true,submitted:true,response}));
 }else{
  for(const response of permutations(d.steps.map(s=>s.id))){const result=reviewView(d,{enabled:true,submitted:true,response});assert.equal(result.result,isDeepStrictEqual(response,d.expectedStepIds)?'correct':'incorrect');assert.equal(result.teaching,d.permutationTeaching.find(t=>isDeepStrictEqual(t.stepIds,response)).text);assert(renderReview(result).includes('Response step 3'));staticRenderChecks++;offeredPaths++;}
  for(const response of [null,[],['contain'],['contain','recover'],['contain','contain','recover'],['contain','eradicate','foreign'],['recover','eradicate','contain','extra']])rejectDraft(()=>reviewView(d,{enabled:true,submitted:true,response}));
  assert(reviewView(d,{enabled:true,submitted:true,response:['contain','recover','eradicate']}).teaching.includes('Containment is already first'));
 }
 rejectDraft(()=>reviewView({...d,parentSourceRevision:'stale'},{enabled:true}));
 rejectDraft(()=>reviewView({...d,feedbackSourceRevision:'stale'},{enabled:true}));
 rejectDraft(()=>reviewView({...d,candidateRevision:'stale'},{enabled:true}));
 const missing=structuredClone(d);if(d.format==='single_choice')missing.optionTeaching.pop();else missing.permutationTeaching.pop();missing.candidateRevision=sig(missing);rejectDraft(()=>reviewView(missing,{enabled:true}));
 const changedKey=structuredClone(d);if(d.format==='single_choice')changedKey.expectedChoiceId=d.choices.find(c=>c.id!==d.expectedChoiceId).id;else changedKey.expectedStepIds.reverse();changedKey.candidateRevision=sig(changedKey);rejectDraft(()=>reviewView(changedKey,{enabled:true}));
 draftChecks.push({parentRecordId:d.parentRecordId,feedbackRecordId:d.feedbackRecordId,candidateRevision:d.candidateRevision,questionRevision:d.questionRevision,feedbackRevision:d.feedbackRevision,codexContentReviewed:true,preAnswerTeachingFieldsAbsent:true,postAnswerCompleteCandidateTeaching:true,staticMarkupHasNativeControlsAndStatus:true,keyboardOrScreenReaderSessionObserved:false,currentSourceChanged:false,currentHoldResolved:false,newCredit:0});
}
for(const {q} of starterValues)for(let selected=0;selected<4;selected++)for(const submitted of [false,true])for(let index=0;index<4;index++){
 const state=optionState(q,submitted,selected,index);assert.equal(state==='correct',submitted&&index===q.correct);currentOptionStateChecks++;
}
assert.equal(currentOptionStateChecks,288);
const hash=algorithm=>createHash(algorithm).update('the exact same synthetic file bytes').digest('hex');assert.notEqual(hash('sha256'),hash('sha512'));assert.equal(hash('sha256'),hash('sha256'));
const escaping=renderReview({format:'single_choice',questionText:'<script>draft example</script>',choices:[{id:'x',label:'<img src=x onerror=bad>'}]});assert(escaping.includes('&lt;script&gt;')&&!escaping.includes('<script>')&&!escaping.includes('<img '));
assert.deepEqual([offeredPaths,wrongOptionCorrections,displayPermutations,displayChoiceChecks,invalidDraftCases,staticRenderChecks],[45,29,222,882,122,56]);
const familyComparisons=localCandidates.map(d=>{
 const term=d.reviewFamily==='minimum-permissions-recognition'?'least privilege':d.reviewFamily==='bounded-ransomware-response'?'ransomware':d.reviewFamily==='rpo-data-loss-window'?'RPO':d.reviewFamily==='comparable-hash-integrity'?'hash':d.choices?.find(c=>c.id===d.expectedChoiceId)?.label.split(' (')[0]??'ransomware';
 const re=new RegExp('\\b'+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i');
 const peers=c.bank.mcqs.filter(q=>re.test(q.q+' '+q.opts.join(' '))).map(q=>'mcq:'+q.id);
 return{parentRecordId:d.parentRecordId,candidateRevision:d.candidateRevision,codexLocalReviewGroup:d.reviewFamily,sharedCandidateIds:localCandidates.filter(x=>x.parentRecordId!==d.parentRecordId&&x.reviewFamily===d.reviewFamily).map(x=>x.parentRecordId),bankComparisonIds:peers,matchingMethod:'word_boundary_term_in_published_local_mcq_stem_or_choices_comparison_only',semanticFamilyInventoryExhaustive:false,independentEvidenceApproved:false,canonicalFamilyAssignment:null,newFamilyCredit:0};
});
assert.equal(new Set(localCandidates.map(d=>d.reviewFamily)).size,9);
assert.equal(familyComparisons.filter(r=>r.sharedCandidateIds.length===1).length,4);
assert(familyComparisons.find(r=>r.parentRecordId===guestPairs[0][0]).bankComparisonIds.includes('mcq:m113'));
assert(familyComparisons.find(r=>r.parentRecordId==='starter:athena-pro-ransomware').bankComparisonIds.includes('mcq:m169'));
const rowDispositions=candidateRecordIds.map(recordId=>{
 const d=localCandidates.find(d=>d.parentRecordId===recordId||d.feedbackRecordId===recordId);
 return{recordId,kind:c.records.get(recordId).kind,sourceRevision:c.records.get(recordId).sourceSignature,status:'CURRENT_SOURCE_HOLD_PRESERVED_NEW_REVISION_CONTENT_DRAFT_REVIEWED',candidateRevision:recordId===d.parentRecordId?d.questionRevision:d.feedbackRevision,codexContentReviewed:true,humanReviewed:false,humanApproved:false,currentHoldResolved:false,currentSourceDispositionCredit:0,learnerPairCredit:0,canonicalRole:null,objectiveScope:null,skillOrDifficultyAssignment:null,teachingLinks:[],familyIndependenceApproved:false,masteryWeight:0,published:false,activationAllowed:false};
});
const sourceBindings=[...new Map([...base.sourceBindings,...[basePath,baseReport,baseAudit,scriptPath].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];assert.equal(sourceBindings.length,393);verifySourceBindings(sourceBindings);
const protectedFiles=readJson('docs/evidence/phase-2b5/release-checksums.json').files;assert.equal(Object.keys(protectedFiles).length,25);verifySourceBindings(Object.entries(protectedFiles).map(([path,sha256])=>({path,sha256})));
const packet={schemaVersion:1,status:'LOCAL_TWENTYTWO_STARTER_GUEST_EDITORIAL_CANDIDATES_CURRENT_HOLDS_PRESERVED_NOT_READY',baselineCommit:'aeae43b1d79dd604b88903f07ed5cb6663a8960e',authority:{masterPlan:'docs/secureplus-rebrand-master-plan.md',historicalAudit:'docs/phase-1-product-loop-audit.md',delegatedCodexContentAndLocalFamilyJudgment:true,humanApprovalInferred:false,activeChangesAllowed:false,canonicalConceptSkillDifficultyObjectiveTeachingApproval:false},sourceBindings,allPacketReconciliation:{inventory,priorReconciliationBinding:{packetPath:basePath,sourceRevision:sig(base.allPacketReconciliation),newCredit:0}},instructionalReconciliation:{...base.instructionalReconciliation,newQualifiedRows:0,combinedRawRows:780,combinedDistinctRecords:766,combinedDuplicateOccurrences:14},candidateRecordIds,selectedRecordIds:[],questionProposals:[],explanationProposals:[],instructionalProposals:[],rowDispositions,deferredSelectedRows:[],deferredScopeRecordIds:[],sourceChecks,reusedEvidence,localCandidates,draftChecks,familyComparisons,deliverySourceBindings:[starters.provenance,getterUnit.provenance,signupUnit.provenance,optionUnit.provenance,shuffleUnit.provenance,guestProbe.provenance],currentDeliveryFindings:{signupMainParagraphOnly:true,signupExperienceIsNotSubscription:true,signupOptionalNotReadinessScore:true,signupPlainTextOptionsNoInlineGlossary:true,currentStarterNativeIdentitySupported:false,currentGuestNativePayloadContract:false,guestMcqPreAnswerKeyClassAndHover:true,guestMcqWrongChoicesShareGenericRetry:true,guestOrderingUnlabelledNextKeyHint:true,guestUnknownDropAccepted:true,guestAlreadyContainedWrongOrderMisdiagnosed:true,diagnosticFallbackGlossaryCueHeld:true},localReviewContract:{enabledByDefault:false,wired:false,exactSourceAndCandidateBindingRequired:true,publicDraftTextAndDraftKeysDeliberatelyReviewable:true,activeSourcePayloadNotExported:true,nativeIdsInvented:false,malformedResponsesRejected:true,postAnswerAllChoicesOrFullSequenceRationale:true,plainNativeControlAndPoliteStatusMarkup:true,interactiveAccessibilityVerified:false,separateDiagnosticCuePolicyUnchanged:true,currentFeedbackRendererModified:false,existingSpecimenOrAllowlistModified:false},checks:{currentOptionStateChecks,offeredPaths,wrongOptionCorrections,displayPermutations,displayChoiceChecks,invalidDraftCases,staticRenderChecks,orderingPermutations:6,orderingSpecificWrongCorrections:5,hashComparisonPremiseCounterexample:true,syntheticTextEscaped:true},candidateProgress:{codexReviewedQuestionDrafts:11,codexReviewedFeedbackDrafts:11,reviewedCandidatePairs:11,currentDeliveredQualifiedPairs:0,newActiveCatalogueCredit:0,newLearnerEvidence:0,newIndependentFamilyCredit:0,localComparisonGroups:9},catalogueProgress:{...base.catalogueProgress,selectedHeldRows:22,newDistinctHeldRows:0,newProposals:0,combinedPending:1688,remaining:190},catalogueCensusBinding:base.catalogueCensusBinding,objectiveCoverageBinding:{packetPath:basePath,field:'objectiveCoverage',sourceRevision:sig(base.objectiveCoverage),newCredit:0},newObjectiveMemberships:0,newAllSourceObjectiveMemberships:0,remainingCatalogueRecordIds:base.remainingCatalogueRecordIds,supportProgress:base.supportProgress,bankProgress:base.bankProgress,remainingBankQuestions:base.remainingBankQuestions,remainingBankFeedback:base.remainingBankFeedback,remainingCompletePairRecordIds:base.remainingCompletePairRecordIds,feedbackOnHeldParents:base.feedbackOnHeldParents,feedbackOnUnreviewedUnsupportedParents:base.feedbackOnUnreviewedUnsupportedParents,starterProgress:base.starterProgress,guestProgress:base.guestProgress,glossaryProgress:base.glossaryProgress,priorStateBindings,priorInheritedFieldBindingsVerified:752,priorHeldRows,priorHeldDeckReferences:base.priorHeldDeckReferences,newDistinctHeldRecordIds:[],totalDistinctHeldRecords:171,inspectedRecords:22,currentHoldsResolved:0,newCompletePairCredit:0,newStarterPairCredit:0,newGuestPairCredit:0,canonicalBoundary:base.canonicalBoundary,activePackageUnchanged:base.activePackageUnchanged,priorLimitedGuideReviewReference:base.priorLimitedGuideReviewReference,knownSavedMixedSetRestoreObservation:base.knownSavedMixedSetRestoreObservation,triageLedgerBinding:base.triageLedgerBinding,sourceSelectionBinding:base.sourceSelectionBinding,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,newTrustedCredit:0,newTrustedRevisionIds:[],newFamilyCredit:0,privatePayloadIncluded:false,privatePayloadFetched:false,privateCompiledHere:false,learnerRuntimeObserved:false,productionAction:false,phase3Work:false,unchangedReleaseHashes:25};
assert.equal(packet.remainingCatalogueRecordIds.length,190);assert.equal(packet.bankProgress.completePairs,456);
assert.deepEqual([packet.starterProgress.combinedQualifiedQuestions,packet.starterProgress.combinedQualifiedFeedback,packet.starterProgress.combinedQualifiedPairs],[0,0,0]);
assert.equal(packet.guestProgress.qualifiedPairs,0);
let expectedMutations,negativeMutationChecks=0;
function validate(v){assertSafeReviewExport(v);const{negativeMutationChecks,...body}=v;assert(isDeepStrictEqual(body,packet),'Draft/source/review/hold/credit drift');if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,expectedMutations);}
const reject=fn=>{const bad=structuredClone(packet);fn(bad);assert(!isDeepStrictEqual(bad,packet));assert.throws(()=>validate(bad));negativeMutationChecks++;};
validate(packet);
for(let i=0;i<22;i++){reject(p=>p.sourceChecks[i].sourceRevision='stale');reject(p=>p.rowDispositions[i].currentHoldResolved=true);reject(p=>p.rowDispositions[i].currentSourceDispositionCredit=1);reject(p=>p.rowDispositions[i].candidateRevision='stale');reject(p=>p.rowDispositions[i].humanReviewed=true);}
for(let i=0;i<11;i++){
 for(const k of ['parentSourceRevision','feedbackSourceRevision','questionRevision','feedbackRevision','candidateRevision'])reject(p=>p.localCandidates[i][k]='stale');
 reject(p=>p.localCandidates[i].currentSourceHoldResolved=true);reject(p=>p.localCandidates[i].deliveryQualified=true);reject(p=>p.localCandidates[i].humanApproved=true);
 reject(p=>p.familyComparisons[i].independentEvidenceApproved=true);reject(p=>p.draftChecks[i].keyboardOrScreenReaderSessionObserved=true);
 if(localCandidates[i].format==='single_choice')for(let j=0;j<localCandidates[i].optionTeaching.length;j++)reject(p=>p.localCandidates[i].optionTeaching[j].text='Generic retry');
 else for(let j=0;j<6;j++)reject(p=>p.localCandidates[i].permutationTeaching[j].text='Contain first');
}
for(let i=0;i<171;i++){reject(p=>p.priorHeldRows[i].resolved=true);reject(p=>p.priorHeldRows[i].priorDispositionRevision='stale');}
for(let i=0;i<sourceBindings.length;i++)reject(p=>p.sourceBindings[i].sha256='stale');
for(let i=0;i<inventory.length;i++)reject(p=>p.allPacketReconciliation.inventory[i].sha256='stale');
for(let i=0;i<reusedEvidence.length;i++)reject(p=>p.reusedEvidence[i].sourceRevision='stale');
for(let i=0;i<priorStateBindings.length;i++)reject(p=>p.priorStateBindings[i].sourceRevision='stale');
for(const k of ['combinedQuestions','combinedFullFeedback','completePairs'])reject(p=>p.bankProgress[k]++);
for(const k of ['humanApproved','published','activationAllowed','privatePayloadIncluded','privatePayloadFetched','privateCompiledHere','learnerRuntimeObserved','productionAction','phase3Work'])reject(p=>p[k]=true);
for(const k of ['q','options','answer','correct','gradingKey','payload','learnerId','email'])reject(p=>p[k]='forbidden');
reject(p=>p.status='READY');reject(p=>p.totalDistinctHeldRecords=149);reject(p=>p.currentHoldsResolved=22);reject(p=>p.catalogueProgress.combinedPending+=22);reject(p=>p.supportProgress.combinedPending++);reject(p=>p.starterProgress.combinedQualifiedPairs=9);reject(p=>p.guestProgress.qualifiedPairs=2);reject(p=>p.localReviewContract.enabledByDefault=true);reject(p=>p.localReviewContract.wired=true);reject(p=>p.localReviewContract.interactiveAccessibilityVerified=true);reject(p=>p.candidateProgress.newIndependentFamilyCredit=9);reject(p=>p.objectiveCoverageBinding.newCredit=22);reject(p=>p.remainingCatalogueRecordIds.pop());
expectedMutations=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-starter-guest-editorial-remediation-proposals'),'Runtime proposal import');
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));
const pairSections=localCandidates.map(d=>{
 const current=sourceChecks.filter(r=>[d.parentRecordId,d.feedbackRecordId].includes(r.recordId));
 const lines=current.flatMap(r=>r.sourceCitations).filter((r,i,rows)=>rows.findIndex(x=>x.path===r.path&&x.line===r.line)===i).map(r=>'`'+r.path+':'+r.line+'`').join(', ');
 const body=d.format==='single_choice'?
  d.choices.map(choice=>{const teaching=d.optionTeaching.find(t=>t.choiceId===choice.id);return '- **'+choice.label+' — '+(teaching.verdict==='correct'?'Correct':'Incorrect')+'.** '+teaching.text;}).join('\n'):
  '**Expected work-package order for this supplied plan:** '+d.expectedStepIds.map(id=>d.steps.find(s=>s.id===id).label).join(' → ')+'.\n\n'+d.stepTeaching.map(s=>'- **'+s.label+'.** '+s.text).join('\n')+'\n\n'+d.permutationTeaching.map(t=>'- **'+t.stepIds.map(id=>d.steps.find(s=>s.id===id).label).join(' → ')+'.** '+t.text).join('\n');
 return`### ${d.parentRecordId}\n\nPaired feedback identity: \`${d.feedbackRecordId}\`. **Codex-reviewed local content candidate; active question and feedback holds retained.**\n\n**Draft question:** ${d.questionText}\n\n${body}\n\n**Review judgment:** ${d.reviewRationale}\n\nLocal comparison group: \`${d.reviewFamily}\`. Candidate question revision: \`${d.questionRevision}\`; candidate feedback revision: \`${d.feedbackRevision}\`. Current source: ${lines}.\n`;
}).join('\n');
const report=`# Phase 2B-5 — starter and guest editorial remediation: 22 local identities

2026-10-15 (Asia/Singapore). Baseline: \`aeae43b1d79dd604b88903f07ed5cb6663a8960e\`.
**LOCAL/default-off/unwired/learner-invisible. Phase 2B-5 and production NOT READY.**

All nine starter question/feedback pairs and both guest assessment/feedback pairs were reviewed: **22 identities, none deferred**. Concrete candidates now contain bounded question premises, every offered MCQ correction and response-specific ordering teaching. Codex independently reviews **11 question drafts and 11 feedback drafts** as suitable bounded introductory content. This is the delegated content judgment, not human approval or current-source qualification. All **22 current-source holds** and all other prior holds remain unresolved: **171 total**, zero newly added or cleared.

The approved master plan supplies product decisions; the Phase 1 audit supplies historical implementation evidence. Current source is rechecked below. This slice changes no approved product decision or active behavior; there is no unresolved authority conflict requiring a learner-visible change. No canonical concept, role, objective scope, skill, difficulty, teaching link, weight, publication or activation is approved. The draft IDs retain their current logical parent/feedback identities; no invented native m/p IDs force compilation.

## Draft judgments versus current coverage

| Measure | Prior | New current-source credit | Current / total | Remaining |
|---|---:|---:|---:|---:|
| Catalogue dispositions |1688|0|1688 /1878|190|
| Support dispositions |748|0|748 /834|86|
| Bank questions |463|0|463 /483|20|
| Bank full feedback |464|0|464 /483|19|
| Bank COMPLETE pairs |456|0|456 /483|27|
| Starter questions/full feedback/pairs |0/0/0|0/0/0|0/9 for each|9 for each|
| Guest assessment questions/full feedback/pairs |0/0/0|0/0/0|0/2 for each|2 for each|
| Distinct current-source holds |171|0 added, 0 cleared|171|Unresolved|

Separately, **22 new-revision content drafts** have a Codex local judgment, forming **11 proposed content pairs**. They do not enter the table above: current catalogue signatures, identity contracts and actual feedback renderers are unchanged. Draft text completeness is not delivered-pair qualification, learning evidence or an accepted trusted revision. Guest bounded teaching remains 6/14; starters stay outside the 483 bank. Current bank feedback on held parents remains eight, with zero on unreviewed unsupported parents.

## Exact source and candidate revisions

| Current identity | Exact current revision | Reviewed candidate revision | Current disposition |
|---|---|---|---|
${rowDispositions.map(r=>'| '+r.recordId+' | `'+r.sourceRevision+'` | `'+r.candidateRevision+'` | HOLD retained; new revision is content-draft-only |').join('\n')}

Each pair's complete candidate fingerprint and separate question/feedback fingerprints are in the packet. All starter choice labels, order and correct index are retained; the guest MCQ also retains its three labels and key. The ordering candidate retains the three existing work-package names and expected sequence, while adding explicit fictional premises and complete teaching. New stems, explanations and corrections are authored public draft content. They are deliberately reviewable with their draft keys below, distinct from active source payloads and all private/learner data. No active field or publication is changed.

## Current delivery and blockers

The current signup getter copies one of three authored experience sets; Professional means experience, not a Pro subscription. The optional signup check is available before account creation and explicitly says it is not a readiness score. Plain button text provides no inline glossary. Check my answer is disabled until a choice exists, and choices lock after checking. After either correct or wrong selection, the actual signup renderer shows only the same main paragraph, with no authored per-distractor correction. All nine native attempts fail with Invalid question identity; no approved athena identity adapter exists. Adding text alone cannot implement a trusted identity or make the current UI deliver it.

Starter literal/effective/catalogue semantics match the existing reader; there is no MCQ/PBQ snapshot/private override layer for these nine. Exact q/opts/key/main/missing-feedback field fingerprints and getter/source locations are bound. The separate signed-in diagnostic currently chooses main-bank questions rather than starters. Its conditional empty/missing-pool fallback and pre-answer glossary assistance remain source-bound through the prior starter audit; the new drafts do not change that policy or claim current live starter exposure. A future supported fallback must either disclose assistance as teaching or remove answer-bearing glossary help from an unassisted check through separately authorised work.

The guest records are reachable JSX branches/subsurfaces, not standalone main-bank payloads. Their existing source-unit revision recipes, parent links and reachability match the catalogue. No private/editorial transformation is substituted. The MCQ grades immediately on click, allows retry and retains correct-key classes/hover cues before selection. Both wrong choices receive the same generic retry. A separate explanation showcase is already visible and is not attached to selected-answer feedback; it cannot silently substitute for complete corrections.

The guest ordering branch highlights the next keyed answer before completion and accepts an unknown plain-text drop into a slot. Its universal linear prompt omits incident/plan premises. All five wrong complete permutations receive one containment-first retry, including Contain → Recover → Eradicate, which already contains first. The fresh source replay reproduces that misleading diagnosis. These current handlers, CSS and sibling explanations remain unchanged and held. The ordering hint and unrelated synthetic review-path holds are outside this 22-record content slice and remain unresolved.

Current-source checks are source/expression replays only. No signup, account, analytics, profile, attempt save, real drag/drop, interactive component render, screen-reader session or browser is exercised. No Pro gate, pricing, credential flow, freemium route, native compiler, existing specimen or allowlist is changed.

## Reviewable beginner-readable local candidates

The following judgments cover the exact new revision text and offered alternatives. Introductory recognition is the bounded target; none establishes operational skill, independent novelty, readiness or mastery. The hash draft adds comparable algorithm/input/version/trusted-reference premises. Both ransomware drafts add approved-plan, authority, scope and safety assumptions instead of asserting a universal first action or guaranteed containment. The ordering scenario is newly authored fictional context, explicitly conditional and with no claim of actual response success.

${pairSections}

## Family and duplicate judgments

Codex groups these eleven proposed questions into **nine local comparison groups**, without assigning canonical scenario families or claiming nine independent evidence sources. The two minimum-permission questions are the same introductory recognition family, despite different placement and option counts. The ransomware starter and three-package guest sequence share containment/response teaching, though the latter also recognises supplied dependencies; format does not establish independence. They must not be counted as repeated independent proof of recovery or learning.

The current bank already includes related material: m113 covers least privilege; m169 uses bounded authorised ransomware-isolation premises; m334 names that containment activity. The packet supplies source-bound word-boundary stem/option comparison IDs for every local group. These lists flag overlap; they are not an exhaustive semantic family inventory, a proof that all hits are equivalent, or a claim that non-hits are novel. No missing objective/skill/family mapping is invented. Candidate wording is introductory even where the existing ID contains pro; experience labels supply no difficulty calibration or subscription entitlement.

## Review-path contract and focused proof

The audit contains one explicitly opted-in, source-bound local review view. Default calls return null; no runtime module imports it. It accepts only the exact current parent/feedback pins and reviewed candidate body. Before submission it projects the draft question and offered labels, with no expected choice/order, verdict or teaching fields. After a valid offered response it exposes the main teaching plus all option contrasts, or the exact sequence diagnosis and three step explanations. It rejects unknown choices, incomplete/duplicate/foreign steps, changed keys, missing teaching and stale source/candidate bindings, including mutations with a recomputed candidate fingerprint.

The static review markup uses a fieldset/legend, native named buttons or labelled selects, explicit Correct/Incorrect text and a polite status region. This makes the proposed reading path reviewable and avoids relying only on colour. Actual wiring still needs a keyboard-reachable Check/Review control, predictable focus/status announcement after submission and a persistent way to reread every rationale. A keyboard/screen-reader/browser session has not been tested. The static fixture does not hide the current sibling explanation showcase or repair its CSS; pre-answer field/markup checks are not a claim of unassisted full-page delivery or secret client-side keys.

| Focused check | Result |
|---|---|
| New offered MCQ answers and ordering responses |45 paths:39 MCQ choices plus6 complete sequences. Ten correct MCQ paths and one correct ordering path; all others receive their bound correction.|
| Authored wrong-option teaching |29 specific MCQ corrections; no generic retry substitutes for a selected misconception.|
| Ordering feedback |All six complete permutations have distinct text, including five wrong diagnoses. Contain → Recover → Eradicate explicitly recognises that containment is already first. Three work-package definitions remain visible after checking.|
| Display and correction identity |222 exact display permutations and882 choice checks through the existing shuffleMcqOptions source. The stable choice, remapped correct index and each wrong correction remain associated; native-button markup follows the shuffled order.|
| Invalid or substituted draft inputs |122 fail-closed cases cover malformed/unknown/multiple choices, missing/repeated/foreign/extra steps, stale parent/feedback/candidate revisions, removed rationale and changed/rehashed key.|
| Current signup visibility |288 direct option-state checks preserve selection-only styling before checking and correct marking afterward. The current paragraph-only feedback gap remains.|
| Static candidate review markup |56 pre/post render checks bind native controls, status and complete post-answer teaching. Synthetic markup-like strings are escaped. No interactive/a11y conformance result is inferred.|
| Hash counterexample |The same synthetic bytes produce different SHA-256/SHA-512 digests. The repaired premise uses one algorithm and the trusted expected exact version, without claiming a real file test.|

The older starter and guest audit evidence is reused through **18 field-level bindings**, including selection, score/shuffle/fallback/glossary checks, guest response/state/namespace cases and semantic/family counterexamples. Their current source fingerprints are verified; prior conclusions are not automatically upgraded. Prior primary-source definition/guide scopes and retrieval limits remain bound by those packets. No new full-standard, vendor, legal, live incident or system claim is made.

## Exact preservation and release limits

All **130 prior substantive packets** reconcile to1688 existing catalogue dispositions. Mechanical primary-array counts remain **780 raw /766 distinct /14 repeats**. All **171 prior held identities**, **752 inherited field bindings**, 20 current baseline-state bindings and **393 source-file pins** are checked. The full prior catalogue/objective censuses are retained by reference rather than copied again; all21 objective totals and remaining IDs are unchanged because these22 source records have no objective memberships. No current source credit is invented from chapter/topic names or new candidate prose.

The190 remaining catalogue IDs still include170 held records and20 unheld records. pbq:p036 retains its carried hold outside that remaining set; all171 holds remain unresolved. These counts overlap and are not additive. Existing private p003/p017, HOTSPOT current holds/drafts, held deck, limited-guide, RTO, source-choice, family/canonical and saved mixed-set restore boundaries remain unchanged.

The focused packet guard rejects **${negativeMutationChecks} altered packets** for stale source/draft/review state, missing rationale, false human/canonical/mastery/family/delivery claims, erased holds, inflated source/pair coverage, raw/private/learner fields and READY promotion. It scans runtime source for accidental proposal imports. Required release gates: deterministic write/recheck; all29 content-mapping tests and active-package reproduction; all25 protected release hashes; source/native-v1/v2/ledger/specimen pins; git diff --check; and the actual **skip exit0 / control1**.

Commit/push exactly this report, its proposal packet and focused audit with **[skip deploy]**. Post-push verification compares exact local/committed/GitHub artifact bytes and SHA-256s and matches HEAD/origin/main/remote main/GitHub API main. Preserve the eight unrelated dirty entries and an empty index. Git delivery is reported separately from production delivery.

No active source/content edit, trusted adapter, runtime/UI/allowlist change, private/live payload query, deployment, publication/activation, real learner action or Phase3 work occurs. The22-record local content-draft review is complete; current-source identity, full delivery and activation remain outstanding. **Phase 2B-5 and production NOT READY.**
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report);
console.log(JSON.stringify({status:packet.status,inspectedRecords:22,codexReviewedQuestionDrafts:11,codexReviewedFeedbackDrafts:11,priorHoldsPreserved:171,newDistinctHolds:0,currentHoldsResolved:0,newCurrentCatalogueCredit:0,newCompletePairCredit:0,negativeMutationChecks,checks:packet.checks,sourceBindings:393,priorPackets:130,priorInheritedFields:752,baselineStateBindings:20,catalogueDispositions:1688,catalogueRemaining:190,supportDispositions:748,supportRemaining:86,bankQuestions:463,bankFeedback:464,bankCompletePairs:456,starterPairs:0,guestPairs:0,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
