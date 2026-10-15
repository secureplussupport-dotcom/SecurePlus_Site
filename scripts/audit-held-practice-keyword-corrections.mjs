import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport,feedbackBundle} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit,readGlossary} from './lib/content-mapping/delivery-inventory.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {canonicalPayload} from '../src/lib/learningPersistenceContracts.js';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {getSy0701DeepDiveProfile} from '../src/data/sy0701DeepDiveMap.js';
const scriptPath='scripts/audit-held-practice-keyword-corrections.mjs',packetPath='docs/drafts/phase-2b5-held-practice-keyword-corrections-proposals.json',reportPath='docs/phase-2b5-held-practice-keyword-corrections-review.md';
const basePath='docs/drafts/phase-2b5-held-glossary-corrections-proposals.json',baseReport='docs/phase-2b5-held-glossary-corrections-review.md',baseAudit='scripts/audit-held-glossary-corrections.mjs';
for(const[path,sha256]of [[basePath,'1769acb10d885b40167a8e23b45c9ea01ea96cb82e3a8dffd2ed5b4887b03ec6'],[baseReport,'71e86befe9065f5ec6d423c4dfac0b85931c08224717ba639c83fc74b8409b1a'],[baseAudit,'56b51928d03bb30b76d69c206fa2805ede5f0d1874b9e5a5d6e456e0a5dd22f5']])assert.equal(hashFile(path),sha256);
const c=readReviewTriage(),base=readJson(basePath);verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson('docs/phase-2b5-question-review-ledger.json'),c.ledger);
import {buildDeepDivePracticeQuestions} from '../src/lib/deepDiveStudy.js';
const parentIds=['cloud-containers-automation','data-classification-lifecycle','ot-iot-cyber-physical','software-memory-concurrency','wifi-access-defense'];
const practiceIds=base.remainingCatalogueRecordIds.filter(id=>id.startsWith('practice:')&&parentIds.some(parent=>id.startsWith('practice:'+parent+':practice-keyword-'))),candidateRecordIds=[...practiceIds,'check:wifi-access-defense'];assert.equal(practiceIds.length,12);
const previous=new Set(c.pkg.records.filter(r=>!base.remainingCatalogueRecordIds.includes(r.id)).map(r=>r.id));assert.equal(previous.size,1694);
const inventory=[...base.allPacketReconciliation.inventory,{path:basePath,sha256:hashFile(basePath),substantiveRows:0}].sort((a,b)=>a.path.localeCompare(b.path));assert.equal(inventory.length,146);
const actual=readdirSync('docs/drafts').filter(n=>n.startsWith('phase-2b5-')&&n.endsWith('.json')).map(n=>'docs/drafts/'+n).filter(path=>path!==packetPath&&['questionProposals','explanationProposals','instructionalProposals'].some(k=>Array.isArray(readJson(path)[k]))).sort();assert.deepEqual(actual,inventory.map(r=>r.path).sort());
const refs=new Set(),distinctInstructions=new Set();let rawInstructions=0;
for(const b of inventory){assert.equal(hashFile(b.path),b.sha256);const p=readJson(b.path);verifySourceBindings(Array.isArray(p.sourceBindings)?p.sourceBindings:Object.entries(p.sourceBindings||{}).map(([path,sha256])=>({path,sha256})));const rows=['questionProposals','explanationProposals','instructionalProposals'].flatMap(k=>p[k]||[]);assert.equal(rows.length,b.substantiveRows);for(const r of rows){assert.equal(r.publishedRecordSignature??r.sourceRevision,c.records.get(r.recordId).sourceSignature);if(previous.has(r.recordId))refs.add(r.recordId);}for(const r of p.instructionalProposals||[]){rawInstructions++;distinctInstructions.add(r.recordId);}}
assert.deepEqual([...refs].sort(),[...previous].sort());assert.deepEqual([rawInstructions,distinctInstructions.size],[786,772]);
const priorHeldRows=base.priorHeldRows;assert.equal(priorHeldRows.length,181);assert.equal(new Set(priorHeldRows.map(r=>r.recordId)).size,181);assert.equal(base.deferredSelectedRows.length,0);
for(const r of priorHeldRows){assert.equal(c.records.get(r.recordId).sourceSignature,r.sourceRevision);assert.equal(sig(readJson(r.packetPath)[r.field].find(x=>x.recordId===r.recordId)),r.priorDispositionRevision);assert(!r.resolved&&!r.newCredit);}
const selectedPriorHoldReferences=priorHeldRows.filter(r=>candidateRecordIds.includes(r.recordId));assert.equal(selectedPriorHoldReferences.length,13);
for(const b of base.priorStateBindings)assert.equal(sig(readJson(b.packetPath)[b.field]),b.sourceRevision);
const inherited=readJson('docs/drafts/phase-2b5-remaining-routing-selectors-proposals.json').priorHoldBindings;assert.equal(inherited.length,752);for(const b of inherited){assert.equal(sig(readJson(b.packetPath)[b.field]),b.sourceRevision);assert(!b.resolved&&!b.newCredit);}

const parents=new Map(parentIds.map(id=>{const d=CONCEPT_DEEP_DIVES.find(d=>d.id===id),profile=getSy0701DeepDiveProfile(d);assert.equal(sig({d,profile}),c.records.get('lesson:'+id).sourceSignature);assert.equal(sig(profile.keywordGuide),c.records.get('keywords:'+id).sourceSignature);return[id,{d,profile}];}));
const currentQuestions=new Map([...parents.values()].flatMap(({d})=>buildDeepDivePracticeQuestions(d).slice(0,3).map(q=>['practice:'+q.id,q])));for(const id of practiceIds)assert.equal(sig(currentQuestions.get(id)),c.records.get(id).sourceSignature);
assert.equal(sig(parents.get('wifi-access-defense').d.check),c.records.get('check:wifi-access-defense').sourceSignature);
const definitions={
 IaC:'Defining and changing infrastructure using machine-readable configuration and automation. Files can be versioned and reviewed, but their existence does not prove review or security.',
 tokenization:'Replacing a sensitive value with a substitute token. Protection depends on token design and access to any mapping or recovery process; substitution alone does not prove anonymity.',
 ICS:'Umbrella category of systems that monitor or control industrial processes, including supervisory data-acquisition systems and distributed control systems.',
 SCADA:'Subtype of industrial control system that gathers field data and provides supervisory control, commonly across geographically dispersed sites.',
 'race condition':'Concurrent operations access shared state or resources without adequate synchronization, allowing interference and timing to change the result.',
 WPA3:'Wi-Fi security generation whose Personal mode uses Simultaneous Authentication of Equals (SAE) for password-based authentication, in place of the WPA2-Personal PSK mechanism.',
};
const reveal={question:'A university wants individual Wi-Fi credentials, revocation of future access and termination of active sessions without changing a shared password. What architecture and enforcement steps fit?',answer:'Use WPA-Enterprise with 802.1X/EAP and a RADIUS-backed identity service for individual accounts. Disable the account or credential for future authentication, and separately terminate established sessions through a supported authenticated disconnect mechanism, such as a RADIUS Disconnect-Request. Verify that enforcement succeeded. Reauthentication, cached authorization and device/server support affect timing; account disablement alone does not guarantee immediate disconnection.'};
const roots={
 'cloud-containers-automation':{referenceIds:['iac'],reason:'The shared IaC definition presumes review has already occurred; it contaminates all three complete feedback bundles.',remaining:'Source review, enforcement and security are separate from having configuration files; the broader parent guide remains partial/held.'},
 'data-classification-lifecycle':{referenceIds:['tokenization'],reason:'The shared token definition promises no useful meaning outside one system, omitting recovery/linkage conditions.',remaining:'Token/PAN guidance is used for a bounded counterexample; no anonymity, legal classification or PCI scope decision.'},
 'ot-iot-cyber-physical':{referenceIds:['ot'],reason:'ICS is an umbrella that includes SCADA; a generic industrial-process clue does not make the options exclusive.',remaining:'Explicit umbrella versus most-specific-subtype wording is required. No canonical parent/child concept mapping or independent family is inferred.'},
 'software-memory-concurrency':{referenceIds:['race'],reason:'The race definition says unsafe timing but omits concurrent interference with shared resources/state; all three feedback bundles repeat it.',remaining:'Definition recognition is not a demonstrated race exploit, mitigation, or memory/concurrency skill assessment.'},
 'wifi-access-defense':{referenceIds:['wifi','disconnect'],reason:'WPA3 is cued by exam membership, while the separate reveal overpromises immediate revocation from identity disablement.',remaining:'Personal SAE and enterprise identity authentication are different. Active-session termination requires supported enforcement and verification.'},
};
const externalReferences=[
 {id:'iac',url:'https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code',version:'Unversioned HashiCorp tutorial read2026-10-16',sections:'Configuration-file definition, workflow and collaboration',scope:'Files/versioning can support review; review/security are not automatic. Product claims of safe deployment are not a guarantee.'},
 {id:'tokenization',url:'https://listings.pcisecuritystandards.org/documents/Tokenization_Product_Security_Guidelines.pdf',version:'PCI SSC Tokenization Product Security Guidelines v1.0, April2015',sections:'Printed pages5-8: terminology, taxonomy, reversibility and mapping',reviewedPdfSha256:'c08663de804d159950ae0e2f80fde47c18ff715ed369e02b06e11ad8b3adbb5b',scope:'PAN substitution/recovery and customer/account linkage counterexamples only; generic privacy wording is a bounded inference, not PCI compliance or legal anonymization.'},
 {id:'ot',url:'https://csrc.nist.gov/glossary/term/industrial_control_system',version:'NIST CSRC entry citing SP800-82r3; read2026-10-16',sections:'ICS definitions including SCADA and distributed/local systems',scope:'Umbrella/subtype and distributed-site terminology; no assertion that all industrial control is SCADA or categories are exclusive.'},
 {id:'race',url:'https://cwe.mitre.org/data/definitions/362.html',version:'CWE-362, page identifies CWE4.20; read2026-10-16',sections:'Description',scope:'Concurrent access, shared resources and interference; no code, exploit, race timing or current application tested.'},
 {id:'wifi',url:'https://arubanetworking.hpe.com/techdocs/aos/wifi-design-deploy/security/modes/wpa3-personal/',version:'HPE Aruba AOS10 TechDocs, unversioned page read2026-10-16',sections:'Protocol: SAE versus WPA2-Personal PSK',scope:'Personal authentication distinction only; no universal PMF/cipher/transition-mode or deployment-security guarantee. Wi-Fi Alliance page unavailable.'},
 {id:'disconnect',url:'https://www.rfc-editor.org/rfc/rfc5176',version:'RFC5176, January2008',sections:'2.1,3 and security considerations',scope:'Separate Disconnect-Request ACK/NAK, session identification and authorized source; no guarantee of support, success or immediate termination.'},
].map(r=>({...r,retrieved:'2026-10-16',primary:true,fullDocumentReviewed:false,liveProductObserved:false}));
const builderUnit=sourceUnit('src/lib/deepDiveStudy.js','export function buildDeepDivePracticeQuestions(','export function formatDeepDiveReviewDate('),builderCode=builderUnit.code.replace(/^export /,'');
const originalBuilder=Function('getSy0701DeepDiveProfile',builderCode+';return buildDeepDivePracticeQuestions;')(getSy0701DeepDiveProfile);
for(const {d}of parents.values())assert.deepEqual(originalBuilder(d),buildDeepDivePracticeQuestions(d));
const candidateProfiles=new Map([...parents].map(([id,{profile}])=>[id,{...profile,keywordGuide:profile.keywordGuide.map(item=>({...item,meaning:definitions[item.term]??item.meaning}))}]));
const candidateBuilder=Function('getSy0701DeepDiveProfile',builderCode+';return buildDeepDivePracticeQuestions;')(d=>candidateProfiles.get(d.id));
const candidateQuestions=new Map([...parents.values()].flatMap(({d})=>candidateBuilder(d).slice(0,3).filter(q=>practiceIds.includes('practice:'+q.id)).map(q=>{
 const profile=candidateProfiles.get(d.id);q.optionFeedback=Object.fromEntries(profile.keywordGuide.map(e=>[e.term,e.meaning]));
 if(d.id==='ot-iot-cyber-physical')q.prompt=q.answer==='ICS'?'Which umbrella category is described, rather than one of its subtypes?':'Which most specific subtype in these choices matches this description?';
 return['practice:'+q.id,q];
})));
const originalParentsRevision=sig([...parents]),textPool={},intern=text=>{const id=sig(text);textPool[id]=text;return id;};
const draftRows=candidateRecordIds.map(recordId=>{
 const check=recordId.startsWith('check:'),parentId=check?'wifi-access-defense':recordId.split(':')[1],parent=parents.get(parentId),original=check?parent.d.check:currentQuestions.get(recordId),candidate=check?reveal:candidateQuestions.get(recordId),record=c.records.get(recordId),hold=selectedPriorHoldReferences.find(r=>r.recordId===recordId),prior=readJson(hold.packetPath)[hold.field].find(r=>r.recordId===recordId);
 assert.equal(sig(original),record.sourceSignature);let fields;
 if(check)fields=['question','answer'].map(field=>({fieldPath:'check.'+field,currentRevision:sig(original[field]),candidateRevision:sig(candidate[field]),candidateTextId:intern(candidate[field])}));
 else{
  assert.equal(candidate.answer,original.answer);assert.deepEqual(candidate.options,original.options);assert.equal(candidate.id,original.id);assert.equal(candidate.source,original.source);
  fields=['prompt','clue','explanation'].filter(k=>original[k]!==candidate[k]).map(field=>({fieldPath:field,currentRevision:sig(original[field]),candidateRevision:sig(candidate[field]),candidateTextId:intern(candidate[field])}));
  for(const option of original.options)if(original.optionFeedback[option]!==candidate.optionFeedback[option])fields.push({fieldPath:'optionFeedback.'+option,currentRevision:sig(original.optionFeedback[option]),candidateRevision:sig(candidate.optionFeedback[option]),candidateTextId:intern(candidate.optionFeedback[option])});
 }
 const body={recordId,parentRecordId:'lesson:'+parentId,sourceRevision:record.sourceSignature,parentRevision:c.records.get('lesson:'+parentId).sourceSignature,guideRevision:c.records.get('keywords:'+parentId).sourceSignature,candidateRevision:sig(candidate),priorHoldReference:hold,priorDispositionRevision:sig(prior),retainedPriorReason:prior.reason,rootCause:roots[parentId].reason,remainingBoundary:roots[parentId].remaining,referenceIds:check?['disconnect']:roots[parentId].referenceIds,fieldCorrections:fields,feedbackBundleRevision:check?null:sig([original.explanation,original.optionFeedback]),candidateFeedbackBundleRevision:check?null:sig([candidate.explanation,candidate.optionFeedback]),offeredLabelsAndKeyUnchanged:!check,scope:check?'ungraded_model_response_reveal':'guided_definition_recognition_only',parentSourceOrApprovalChanged:false,sourceGuideInstalled:false,currentHoldResolved:false,newCurrentTeachingCredit:0,newQuestionCredit:0,newFeedbackCredit:0,newCompletePairCredit:0,newTrustedCredit:0,newFamilyCredit:0,masteryWeight:0,humanApproved:false,canonicalApprovalTransferred:false,activationAllowed:false};return{...body,draftRevision:sig(body)};
});
assert.equal(draftRows.length,13);assert.equal(candidateQuestions.size,12);
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype,jsonUnit=sourceUnit('scripts/lib/content-mapping/local-pbq-feedback-proof.mjs','// Bound JSON data','function optIn('),jsonCopy=Function('assert','plain','canonicalPayload',jsonUnit.code+';return jsonCopy;')(assert,plain,canonicalPayload);
const escapeRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function validateQuestion(q){assert(q.options.length>=2&&q.options.length<=4);assert.equal(new Set(q.options.map(s=>s.trim().toLowerCase())).size,q.options.length,'Duplicate/ambiguous options');assert(q.options.includes(q.answer));assert(!new RegExp('(^|[^A-Za-z0-9])'+escapeRe(q.answer)+'(?=$|[^A-Za-z0-9])','i').test(q.prompt+' '+q.clue),'Keyed term must not be disclosed in prompt/clue');for(const value of [q.prompt,q.clue,q.explanation,...Object.values(q.optionFeedback)])assert(typeof value==='string'&&value.trim()&&!/[<>]/.test(value),'Plain complete teaching required');assert(q.options.every(option=>q.optionFeedback[option]?.trim()));}
function validateGuide(profile){assert.equal(new Set(profile.keywordGuide.map(e=>e.meaning.trim().toLowerCase())).size,profile.keywordGuide.length,'Duplicate clues');}
function previewDraft(row,parent,options={}){
 const o=jsonCopy(options);assert(plain(o)&&Object.keys(o).every(k=>['enabled','mode','choice'].includes(k)),'Unknown preview option');assert(o.enabled===undefined||typeof o.enabled==='boolean','Boolean opt-in required');if(o.enabled!==true)return null;
 const r=jsonCopy(row),expected=draftRows.find(r2=>r2.recordId===r?.recordId);assert(expected&&canonicalPayload(expected)===canonicalPayload(r),'Exact curated draft required');
 const p=jsonCopy(parent);assert.equal(sig(p),expected.parentRevision,'Stale exact parent/profile source');
 const check=r.recordId.startsWith('check:'),q=check?reveal:candidateQuestions.get(r.recordId);if(check){assert(['before_reveal','after_reveal'].includes(o.mode));assert(o.choice===undefined);return{recordId:r.recordId,mode:o.mode,prompt:q.question,...(o.mode==='after_reveal'?{modelResponse:q.answer}:{}),eligibleEvidence:false,newCredit:0};}
 assert(['before_answer','after_answer'].includes(o.mode));validateQuestion(q);if(o.choice!==undefined)assert(q.options.includes(o.choice),'Unknown offered choice');
 const view={recordId:r.recordId,mode:o.mode,prompt:q.prompt,clue:q.clue,options:q.options.slice(),eligibleEvidence:false,newCredit:0};
 if(o.mode==='after_answer'){assert(typeof o.choice==='string');return{...view,selected:o.choice,correct:o.choice===q.answer,correctLabel:q.answer,main:q.explanation,alternatives:q.options.filter(v=>v!==q.answer).map(label=>({label,body:q.optionFeedback[label]}))};}
 return view;
}
assert.equal(previewDraft(null,null),null);
let invalidInputChecks=0,beforeViews=0,afterViews=0,correctCases=0,incorrectCases=0,currentDuplicateLabelBranches=0,candidateDuplicateLabelBranches=0,fieldCorrectionChecks=0;const rejectInput=fn=>{assert.throws(fn);invalidInputChecks++;},previewBindings=[];
for(const row of draftRows){
 const parent=parents.get(row.parentRecordId.slice(7)),sourceParent={d:parent.d,profile:parent.profile};assert.equal(previewDraft(row,sourceParent),null);
 for(const field of row.fieldCorrections){assert.equal(sig(textPool[field.candidateTextId]),field.candidateRevision);fieldCorrectionChecks++;}
 const check=row.recordId.startsWith('check:');if(check){const before=previewDraft(row,sourceParent,{enabled:true,mode:'before_reveal'}),after=previewDraft(row,sourceParent,{enabled:true,mode:'after_reveal'});assert(!Object.hasOwn(before,'modelResponse'));assert.equal(after.modelResponse,reveal.answer);assert(/terminate established sessions/.test(after.modelResponse)&&/does not guarantee immediate/.test(after.modelResponse));beforeViews++;afterViews++;previewBindings.push({recordId:row.recordId,beforeRevision:sig(before),afterRevision:sig(after),graded:false});}
 else{
  const old=currentQuestions.get(row.recordId),q=candidateQuestions.get(row.recordId);validateQuestion(q);validateGuide(candidateProfiles.get(parent.d.id));const before=previewDraft(row,sourceParent,{enabled:true,mode:'before_answer'});
  assert(!/"(?:answer|correct|correctLabel|main|optionFeedback|explanation|gradingKey)"\s*:/.test(JSON.stringify(before)));assert(!new RegExp('(^|[^A-Za-z0-9])'+escapeRe(q.answer)+'(?=$|[^A-Za-z0-9])','i').test(before.prompt+' '+before.clue),'No literal keyed term in clue');beforeViews++;
  const afterDigests=[];for(const choice of q.options){const view=previewDraft(row,sourceParent,{enabled:true,mode:'after_answer',choice});assert.equal(view.correct,choice===old.answer);assert.equal(view.main,q.explanation);assert.deepEqual(view.alternatives,q.options.filter(v=>v!==q.answer).map(label=>({label,body:q.optionFeedback[label]})));assert.equal(view.newCredit,0);afterViews++;correctCases+=Number(view.correct);incorrectCases+=Number(!view.correct);afterDigests.push(sig(view));}
  for(const label of q.options.filter(v=>v!==q.answer)){assert(old.optionFeedback[label].startsWith(label+':'));currentDuplicateLabelBranches++;assert(!q.optionFeedback[label].startsWith(label+':'));candidateDuplicateLabelBranches+=Number(q.optionFeedback[label].startsWith(label+':'));}
  const html=renderToStaticMarkup(React.createElement('section',null,React.createElement('h3',null,before.clue),React.createElement('ul',null,q.options.map(label=>React.createElement('li',{key:label},React.createElement('strong',null,label))))));assert(!html.includes(q.explanation));
  previewBindings.push({recordId:row.recordId,beforeRevision:sig(before),allOfferedAfterRevisions:sig(afterDigests),plainTextSpecimenRevision:sig(html),gradedByExactLabelOnly:true});
  rejectInput(()=>previewDraft(row,sourceParent,{enabled:true,mode:'after_answer',choice:'__unknown__'}));rejectInput(()=>previewDraft(row,sourceParent,{enabled:true,mode:'after_answer'}));
  const duplicate=structuredClone(q);duplicate.options[1]=duplicate.options[0].toUpperCase();rejectInput(()=>validateQuestion(duplicate));const noFeedback=structuredClone(q);delete noFeedback.optionFeedback[q.options[0]];rejectInput(()=>validateQuestion(noFeedback));
 }
 for(const mutate of [p=>p.d.title='stale',p=>p.profile.keywordGuide[0].meaning='stale',p=>p.d.id='private',p=>p.privatePayload=true]){const changed=structuredClone(sourceParent);mutate(changed);rejectInput(()=>previewDraft(row,changed,{enabled:true,mode:check?'before_reveal':'before_answer'}));}
 for(const mutate of [r=>r.sourceRevision='stale',r=>r.parentRevision='stale',r=>r.candidateRevision='stale',r=>r.fieldCorrections[0].candidateRevision='stale',r=>r.currentHoldResolved=true,r=>r.humanApproved=true,r=>r.newCurrentTeachingCredit=1]){const bad=structuredClone(row);mutate(bad);const{draftRevision,...body}=bad;bad.draftRevision=sig(body);rejectInput(()=>previewDraft(bad,sourceParent,{enabled:true,mode:check?'before_reveal':'before_answer'}));}
 for(const options of [{enabled:'true'},{enabled:true,mode:'auto'},{enabled:true,mode:check?'before_reveal':'before_answer',trusted:true}])rejectInput(()=>previewDraft(row,sourceParent,options));
}
const badGuide=structuredClone(candidateProfiles.values().next().value);badGuide.keywordGuide[1].meaning=badGuide.keywordGuide[0].meaning;rejectInput(()=>validateGuide(badGuide));
const hostile='<script>synthetic</script><img src=x onerror=synthetic> &',escaped=renderToStaticMarkup(React.createElement('p',null,hostile));assert(!escaped.includes('<script>')&&!escaped.includes('<img'));assert(escaped.includes('&lt;script&gt;')&&escaped.includes('&amp;'));
const badMarkup=structuredClone(candidateQuestions.values().next().value);badMarkup.clue=hostile;rejectInput(()=>validateQuestion(badMarkup));
let getterCalls=0;const getter={};Object.defineProperty(getter,'recordId',{enumerable:true,get(){getterCalls++;return draftRows[0].recordId;}});const cyclic={};cyclic.self=cyclic;
for(const bad of [getter,cyclic,Array(2),{x:undefined},{x:NaN},{x:'x'.repeat(20001)}])rejectInput(()=>previewDraft(bad,{},{enabled:true,mode:'before_answer'}));assert.equal(getterCalls,0);
assert.equal(sig([...parents]),originalParentsRevision);assert.equal(beforeViews,13);assert.equal(afterViews,38);assert.equal(correctCases,12);assert.equal(incorrectCases,25);assert.equal(currentDuplicateLabelBranches,25);assert.equal(candidateDuplicateLabelBranches,0);
const appUnit=sourceUnit('src/App.jsx','function ConceptDeepDivesPage(','function FlashcardsPage('),app=readFileSync('src/App.jsx','utf8');
assert(app.includes('buildDeepDivePracticeQuestions(selectedDive).slice(0,3)'));assert(app.includes('practiceChoice===activePracticeQuestion.answer'));assert(app.includes('{practiceSubmitted&&('));assert(app.includes('<strong>{option}: </strong>{activePracticeQuestion.optionFeedback?.[option]}'));assert(app.includes('{!isAnswerVisible?(')&&app.includes('{selectedDive.check.answer}'));
const totals={rows:13,practiceRows:12,revealRows:1,parents:5,rootCauseGroups:5,sharedDefinitions:6,fieldCorrectionChecks,beforeViews,afterViews,correctCases,incorrectCases,currentDuplicateLabelBranches,candidateDuplicateLabelBranches,invalidInputChecks,defaultOffChecks:13,staticEscapingChecks:1};

const renderAlternatives=q=>renderToStaticMarkup(React.createElement('ul',null,q.options.filter(o=>o!==q.answer).map(o=>React.createElement('li',{key:o},React.createElement('strong',null,o+': '),q.optionFeedback[o]))));
const duplicateRendering=[];for(const [id,q]of candidateQuestions){const original=currentQuestions.get(id),oldHtml=renderAlternatives(original),newHtml=renderAlternatives(q);for(const label of q.options.filter(o=>o!==q.answer)){assert(oldHtml.includes('<strong>'+label+': </strong>'+label+':'));assert(!newHtml.includes('<strong>'+label+': </strong>'+label+':'));}duplicateRendering.push({recordId:id,currentHtmlRevision:sig(oldHtml),candidateHtmlRevision:sig(newHtml),fullInteractiveComponentRendered:false});}
const glossary=readGlossary(),lexicalProbes=[...candidateQuestions].map(([id,q])=>{const text=q.clue+' '+q.options.join(' / '),hits=glossary.matchTerms(text);assert.deepEqual(glossary.matchTerms(text.toUpperCase()),hits);return{recordId:id,matchedTermsRevision:sig(hits),actualPracticeTextUsesGlossaryRenderer:false};});assert(!appUnit.code.slice(appUnit.code.indexOf('<div className="deep-dive-practice-question">')).split('):practiceQuestions.length?(')[0].includes('<GlossaryText'));
const leak=structuredClone(candidateQuestions.values().next().value);leak.clue='The correct answer is '+leak.answer;rejectInput(()=>validateQuestion(leak));
const sampleParent=parents.values().next().value;rejectInput(()=>previewDraft(draftRows[0],{d:sampleParent.d,profile:sampleParent.profile},{enabled:true,mode:'before_answer',choice:'unknown'}));
totals.invalidInputChecks=invalidInputChecks;totals.duplicateRenderSpecimens=12;totals.lexicalMatcherProbes=12;
const priorStateBindings=Object.keys(base).map(field=>({packetPath:basePath,field,sourceRevision:sig(base[field]),resolved:false,newCredit:0})),sourceBindings=[...new Map([...base.sourceBindings,...[basePath,baseReport,baseAudit,scriptPath].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];assert.equal(sourceBindings.length,454);verifySourceBindings(sourceBindings);
const protectedFiles=readJson('docs/evidence/phase-2b5/release-checksums.json').files;assert.equal(Object.keys(protectedFiles).length,25);verifySourceBindings(Object.entries(protectedFiles).map(([path,sha256])=>({path,sha256})));
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('held-practice-keyword-corrections'),'Runtime candidate import added');
const dependencyAudit={...base.dependencyAudit,reviewDate:'2026-10-16',nativeAuditClean:false};assert.equal(hashFile('package-lock.json'),dependencyAudit.lockfileSha256);assert.equal(hashFile('package.json'),dependencyAudit.packageSha256);
const parentBindings=[...parents].map(([id,{d,profile}])=>({recordId:'lesson:'+id,sourceRevision:sig({d,profile}),guideRecordId:'keywords:'+id,guideRevision:sig(profile.keywordGuide),parentReviewReapproved:false,activeParentChanged:false}));
const packet={schemaVersion:1,status:'LOCAL_TWELVE_HELD_KEYWORD_CORRECTIONS_PLUS_WIFI_REVEAL_DRAFT_ALL_HOLDS_NOT_READY',baselineCommit:'268a4849f92878e86a8ece58e71235950cd5a947',authority:{...base.authority,scope:'Exactly twelve remaining held practice-keyword rows and one same-parent Wi-Fi reveal; source-bound offline wording only'},sourceBindings,allPacketReconciliation:{inventory,priorReconciliationBinding:{packetPath:basePath,sourceRevision:sig(base.allPacketReconciliation),newCredit:0}},instructionalReconciliation:base.instructionalReconciliation,candidateRecordIds,selectedRecordIds:[],questionProposals:[],explanationProposals:[],instructionalProposals:[],deferredSelectedRows:[],draftRows,candidateTextPool:textPool,sharedDefinitionDrafts:definitions,revealDraftTextIds:{questionTextId:intern(reveal.question),modelResponse:intern(reveal.answer)},rootCauses:roots,parentBindings,totals,previewBindings,duplicateRendering,lexicalProbes,externalReferences,selectedPriorHoldReferences,sourceProbeBindings:[builderUnit.provenance,appUnit.provenance,jsonUnit.provenance,...glossary.sourceUnits],previewContract:{enabledByDefault:false,exactCurrentParentAndProfileRequired:true,exactCuratedDraftRequired:true,sourceBuilderReplayed:true,candidateGuideOnlyInMemory:true,otSpecificityPromptOverrideOfflineOnly:true,labelsKeysAndOrderingPreserved:true,offeredChoiceEqualityOnly:true,preAnswerPayloadExcludesKeyFeedback:true,revealIsUngraded:true,actualRuntimeMatcherChanged:false,actualSourceStillHeld:true,learnerHandlersExecuted:false,fullInteractiveComponentRendered:false,browserObserved:false},outsideScopeIntegrationBoundary:{parentGlobalGuideEditsInstalled:false,newAuthoringSchemaInstalled:false,broaderGuideFanoutApproved:false,unselectedChildIdentitiesRequiringFutureReview:['practice:ot-iot-cyber-physical:practice-keyword-2','practice:wifi-access-defense:practice-keyword-1','practice:wifi-access-defense:practice-keyword-2'],unselectedChildDraftsOrDispositionsAdded:0,otherLessonGuideCardApprovalsTransferred:false,ordinaryOptionDefinitionsAreNotPairSpecificCausalReasons:true,ownerChoiceRequiredForThisOfflineDraft:false},dependencyAudit,candidateProgress:{keywordCandidateRows:12,sameParentRevealCandidateRows:1,parentClusters:5,currentHoldsResolved:0,newCurrentTeachingCredit:0,newDistinctHeldRecords:0},catalogueProgress:{...base.catalogueProgress,selectedHeldRows:13},catalogueCensusBinding:base.catalogueCensusBinding,priorPageDispositionOverrides:base.priorPageDispositionOverrides,objectiveCoverageBinding:base.objectiveCoverageBinding,newObjectiveMemberships:0,newAllSourceObjectiveMemberships:0,remainingCatalogueRecordIds:base.remainingCatalogueRecordIds,supportProgress:base.supportProgress,bankProgress:base.bankProgress,remainingBankQuestions:base.remainingBankQuestions,remainingBankFeedback:base.remainingBankFeedback,remainingCompletePairRecordIds:base.remainingCompletePairRecordIds,feedbackOnHeldParents:base.feedbackOnHeldParents,feedbackOnUnreviewedUnsupportedParents:base.feedbackOnUnreviewedUnsupportedParents,starterProgress:base.starterProgress,guestProgress:base.guestProgress,glossaryProgress:base.glossaryProgress,containerProgress:base.containerProgress,priorStateBindings,priorInheritedFieldBindingsVerified:752,priorHeldRows,newDistinctHeldRecordIds:[],totalDistinctHeldRecords:181,inspectedRecords:13,currentHoldsResolved:0,newCompletePairCredit:0,canonicalBoundary:base.canonicalBoundary,activePackageUnchanged:base.activePackageUnchanged,knownSavedMixedSetRestoreObservation:base.knownSavedMixedSetRestoreObservation,triageLedgerBinding:base.triageLedgerBinding,sourceSelectionBinding:base.sourceSelectionBinding,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,newTrustedCredit:0,newTrustedRevisionIds:[],newFamilyCredit:0,privatePayloadIncluded:false,privatePayloadFetched:false,privateCompiledHere:false,learnerRuntimeObserved:false,productionAction:false,phase3Work:false,unchangedReleaseHashes:25};
let expectedMutations,negativeMutationChecks=0;
function validate(v){assertSafeReviewExport(v);const{negativeMutationChecks,...body}=v;assert(isDeepStrictEqual(body,packet),'Practice source/parent/field/clue/feedback/hold or credit drift');if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,expectedMutations);}
const reject=fn=>{const bad=structuredClone(packet);fn(bad);assert(!isDeepStrictEqual(bad,packet));assert.throws(()=>validate(bad));negativeMutationChecks++;};validate(packet);
for(let i=0;i<13;i++){for(const field of ['sourceRevision','parentRevision','guideRevision','candidateRevision','priorDispositionRevision','draftRevision'])reject(p=>p.draftRows[i][field]='stale');for(const field of ['parentSourceOrApprovalChanged','sourceGuideInstalled','currentHoldResolved','humanApproved','canonicalApprovalTransferred','activationAllowed'])reject(p=>p.draftRows[i][field]=true);reject(p=>p.draftRows[i].newCurrentTeachingCredit=1);for(let j=0;j<draftRows[i].fieldCorrections.length;j++){reject(p=>p.draftRows[i].fieldCorrections[j].currentRevision='stale');reject(p=>p.draftRows[i].fieldCorrections[j].candidateTextId='invented');}}
for(let i=0;i<181;i++)reject(p=>p.priorHeldRows[i].resolved=true);
for(let i=0;i<sourceBindings.length;i++)reject(p=>p.sourceBindings[i].sha256='stale');
for(let i=0;i<priorStateBindings.length;i++)reject(p=>p.priorStateBindings[i].sourceRevision='stale');
for(const id of Object.keys(textPool))reject(p=>p.candidateTextPool[id]='Changed or unsupported teaching claim.');
for(const field of ['humanApproved','published','activationAllowed','privatePayloadFetched','productionAction','phase3Work'])reject(p=>p[field]=true);
for(const field of ['newTrustedCredit','newFamilyCredit','masteryWeight','currentHoldsResolved','newObjectiveMemberships'])reject(p=>p[field]=1);
reject(p=>p.previewContract.enabledByDefault=true);reject(p=>p.previewContract.preAnswerPayloadExcludesKeyFeedback=false);reject(p=>p.outsideScopeIntegrationBoundary.broaderGuideFanoutApproved=true);reject(p=>p.outsideScopeIntegrationBoundary.unselectedChildDraftsOrDispositionsAdded=3);reject(p=>p.dependencyAudit.nativeAuditClean=true);reject(p=>p.candidateRecordIds.reverse());reject(p=>p.learnerId='synthetic');reject(p=>p.payload={private:true});
expectedMutations=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));
const changes=draftRows.map(row=>`### ${row.recordId}

Current \`${row.sourceRevision}\`; candidate \`${row.candidateRevision}\`; parent \`${row.parentRevision}\`; guide \`${row.guideRevision}\`.
Prior hold \`${row.priorDispositionRevision}\` in \`${row.priorHoldReference.packetPath}\` remains exact. Complete draft \`${row.draftRevision}\`.

${row.fieldCorrections.map(f=>'- `'+f.fieldPath+'`: current `'+f.currentRevision+'` → candidate `'+f.candidateRevision+'`; replacement text ID `'+f.candidateTextId+'`.').join('\n')}

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.
`).join('\n');
const shared=Object.entries(definitions).map(([term,text])=>'- **'+term+'**: meaning text ID `'+sig(text)+'`; full candidate wording is in the appendix.').join('\n');
const textAppendix=Object.entries(textPool).map(([id,text])=>'- `'+id+'` — '+text).join('\n');
const report=`# Phase 2B-5 — held practice-keyword corrections and Wi-Fi reveal

**Thirteen source-bound offline candidates; all181 holds and current counts preserved.** Baseline:268a4849f92878e86a8ece58e71235950cd5a947. Exactly12 held practice-keyword records across cloud3,data3,OT2,memory3,Wi-Fi1, plus check:wifi-access-defense. Parents, guides and cards are bounded context; no additional child is reviewed or dispositioned. Master plan remains product authority; Phase1 audit supplies historical facts. No unresolved product decision changes behavior here.

## Root causes and precise draft wording

${shared}

These shared meanings are used in an in-memory profile copy by the exact existing buildDeepDivePracticeQuestions source. Current labels, keys, IDs, option ordering and objective source strings stay exact for the twelve candidates. The ICS prompt additionally asks for the umbrella category; the SCADA prompt asks for the most specific subtype. This makes the requested granularity explicit rather than claiming the two concepts are mutually exclusive. Those are candidate-only row prompt refinements, not an installed authoring override or canonical relationship.

The IaC, tokenization and race defects appear in every complete option-feedback set for their three-row groups, including rows keyed to another term. Correcting only the keyed clue would leave unsound alternative teaching. All offered definitions are therefore regenerated from the bounded candidate profile. For all twelve rows, the candidate optionFeedback stores the definition body without its redundant term prefix: the actual renderer already supplies that label. Twenty-five current label/definition branches display the prefix twice; all25 candidate branches remove it. Main explanations keep their one term prefix because that paragraph has no separate renderer label.

The current interface calls the alternatives panel “Why the other options do not fit” while showing general term definitions. Clearer definitions are contrasts, not newly authored pair-specific causal explanations or proof of learning. Current and candidate checks remain guided recognition by exact offered-label equality, not trusted grading, independent scenario families, concept mastery or observed recovery. All previous semantic/parent holds remain.

**Same-parent Wi-Fi reveal draft prompt:** ${reveal.question}

**Draft model response:** ${reveal.answer}

The reveal's question and response both change so architecture/credential disablement is separated from active-session enforcement. The source already renders this same parent's question and gated model response; no new workflow is invented. It remains an ungraded reveal with no attempt, disconnect request, account action or actual network test.

## Exact row and field bindings

Each field below references the deduplicated text pool in the packet and appendix. No answer label/key is exported as a concept mapping. Source-bound current/parent/guide/candidate revisions and the prior hold are separate.

${changes}

## Primary references and scope

${externalReferences.map(r=>'- ['+r.id+']('+r.url+') — '+r.version+'; '+r.sections+'. '+r.scope).join('\n')}

Only the stated sections were examined. The PCI PDF was securely retrieved from the primary listings host after web text-section retrieval failed, then read with the bundled PDF reader; reviewed bytes \`c08663de804d159950ae0e2f80fde47c18ff715ed369e02b06e11ad8b3adbb5b\`. Its taxonomy and account-linkage counterexample defeat a universal no-meaning/anonymity claim; this is not a PCI scope determination. The Wi-Fi Alliance page was unavailable; the exact SAE/PSK distinction uses vendor primary technical documentation. No current certification or algorithm-policy audit is claimed. RFC5176 may fail/NAK and requires authorized session targeting; an architecture label cannot prove immediate termination.

Prior lesson, guide and card packets supply the existing bounded definitions and parent delivery observations. They do not approve these changed revisions. The broader cloud guide/section holds, tokenization scope, industrial hierarchy, concurrency semantics, and Wi-Fi implementation limits stay explicit.

## Focused proof, rendering and integration limits

- Exact current builder replay matches the imported helper for all five parents;13 current record signatures, five complete parent/profile signatures and five guide signatures are bound. In-memory source parents stay byte-equivalent.
- 53 precise field corrections,13 default-off checks and13 pre-answer/pre-reveal projections pass. Practice before-answer output contains only prompt/clue/offered labels and no key, correction or feedback fields; the literal keyed term is absent from prompt/clue. The model response is absent before reveal. Offered answer labels themselves remain visible choices, as intended.
- All37 offered practice responses are checked:12 correct/25 wrong; with the ungraded reveal there are38 after-answer/reveal views. Exact label matching, all alternative definitions and unchanged option order are asserted.
- Twelve current/candidate static alternatives specimens confirm duplicate prefixes fall25→0. Twelve lexical matcher probes remain case-stable, but the actual practice question/feedback fields are plain React text and do not call GlossaryText. Matcher recognition does not establish tooltip delivery, semantic links or a new concept.
- ${totals.invalidInputChecks} invalid/stale-parent/profile/private/curated-row/mode/choice/duplicate-option/duplicate-clue/missing-feedback/key-leak/unsafe-markup/non-JSON inputs are rejected. Recomputed draft checksums do not authorize changed text. One independent hostile React text escape probe passes; no getter executes.
- ${negativeMutationChecks} altered packets are rejected;146 prior packets,752 inherited fields,${priorStateBindings.length} immediate baseline fields,454 source fingerprints and25 protected release files reconcile. Equality guards protect the exact reviewed drafts; they are not an independent general semantic/factuality detector.

No full interactive React page, browser/keyboard/screen-reader, learner handler, account session, network/control or active parent is exercised. A future global source-guide edit would also affect OT practice-keyword-2 and Wi-Fi practice-keyword-1/2, which are outside this13-row review. They receive no candidate disposition here; broader fanout and parent guide/lesson approval require a separate review. No new production schema is installed for the two specificity prompts. **No additional owner choice is required to review this offline draft; no human approval is inferred.**

## Prior, new and remaining

| Measure | Prior | New credit | Combined /total | Remaining |
|---|---:|---:|---:|---:|
| Catalogue dispositions |1694|0|1694/1878|184|
| Support teaching |748|0|748/834|86|
| Glossary definitions |150|0|150/162|12|
| Bank questions |463|0|463/483|20|
| Full bank feedback |464|0|464/483|19|
| COMPLETE pairs |456|0|456/483|27|

Selected13: prior qualified0,new0,remaining13. All181 existing holds remain exact, including these13; zero additions/resolutions. Instructional786 raw/772 distinct/14 repeats, prior PBQ proofs, all source-selection/private/census/ledger/native-v1/v2/specimen boundaries and glossary BPA/SOC owner decisions remain unchanged. No canonical role/objective/concept/teaching-link, human, novelty, family, trusted/mastery/activation credit is added.

Required gates: all29 mapping tests and deterministic package, deterministic packet/report recheck, git diff --check, actual skip-deploy exit0/control1, task-only commit/push with exact remote refs/bytes, empty index and eight unrelated dirty entries preserved. Native npm audit of unchanged packages/lockfile still reports7 existing advisories including1 critical/4 high; no dependency installation/fix or project-wide clearance is claimed.

## Deduplicated candidate field text

${textAppendix}

No active/runtime/protected/shared compiler/helper content, private/database/live/browser, automation, deployment or Phase3 change. **Offline text corrections only; all current-source holds stay unresolved.**
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report);
console.log(JSON.stringify({status:packet.status,...totals,negativeMutationChecks,sourceBindings:sourceBindings.length,priorPackets:inventory.length,priorInheritedFields:752,baselineStateBindings:priorStateBindings.length,newQuestionCredit:0,newFeedbackCredit:0,newCompletePairs:0,newTeachingCredit:0,currentHoldsResolved:0,totalDistinctHolds:181,catalogueDispositions:1694,catalogueRemaining:184,supportPrior:748,supportRemaining:86,bankQuestions:463,bankFeedback:464,bankCompletePairs:456,remainingQuestions:20,remainingFeedback:19,remainingCompletePairs:27,existingDependencyAdvisories:7,ownerChoiceRequired:false,sha256:Object.fromEntries([scriptPath,packetPath,reportPath].map(path=>[path,hashFile(path)]))}));
