import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-residual-supported-pbqs.mjs',packetPath='docs/drafts/phase-2b5-residual-supported-pbqs-proposals.json',reportPath='docs/phase-2b5-residual-supported-pbqs-review.md';
const basePath='docs/drafts/phase-2b5-objective43-45-46-pbqs-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'9adc5bd1653505f7222004e1fbd1a01765c995523a46089e56d1978383499507');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective45-mcqs-proposals.json','docs/drafts/phase-2b5-objective54-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-risk-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-pilot-feedback-proposals.json','docs/drafts/phase-2b5-objective51-mcqs-proposals.json','docs/drafts/phase-2b5-objective53-55-assurance-proposals.json','docs/drafts/phase-2b5-objective44-49-operations-proposals.json','docs/drafts/phase-2b5-final-local-mcqs-proposals.json','docs/drafts/phase-2b5-objective44-49-operations-pbqs-proposals.json','docs/drafts/phase-2b5-older-pbq-feedback-proposals.json','docs/drafts/phase-2b5-objective24-48-33-pbqs-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);assert.equal(c.ledger.rows.filter(r=>legacyPrevious.has(r.recordId)).length,405);
import {compileRevision,gradeRevision,learnerRevision} from '../server/adaptive/revision.mjs';

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
assert.equal(inventory.length,72);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);


assert.deepEqual(inventory.filter(r=>r.path!==basePath),base.allPacketReconciliation.inventory);
assert.equal(duplicateReferences.length,22);assert.equal(supportOnlyReferences.length,7);
const ids=['p042','p032','p068','p016','p047','p044','p078','p023','p003','p039','p038'];
const candidates=ids.map(id=>c.questions.get('pbq:'+id)),creditedIds=ids.filter(id=>!['p032','p068','p047','p003'].includes(id));
const credited=candidates.filter(s=>creditedIds.includes(s.q.id));
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorBank.length,447);assert.equal(priorFeedback.length,440);
for(const s of candidates){assert(s);assert(!c.previous.has(s.record.id));assert(!c.previous.has(s.feedback.id));}
const protectedHashes=readJson('docs/evidence/phase-2b5/release-checksums.json').files;
assert.equal(Object.keys(protectedHashes).length,25);verifySourceBindings(Object.entries(protectedHashes).map(([path,sha256])=>({path,sha256})));
assert.equal(hashFile(ledgerPath),'e0ceeec3c5cc8adb94b36175954a8cefaebcb4f29f4c66aa38c400f65de3bb12');
const unit=(start,end)=>sourceUnit('src/App.jsx',start,end);
const wholeUnit=unit('  const isCorrect=()=>{','  const partResults=useMemo('),partsUnit=unit('  const partResults=useMemo(()=>{','  const partCorrectCount='),canUnit=unit('  const canSubmit=q.type===SELECT_FILL_PBQ_TYPE','  return('),examUnit=unit('  const pbqCorrect=(q,a={})=>{','  const isCorrect=(item,a={})=>'),answeredUnit=unit('  const isAnswered=(item,a={})=>{','  const answeredCount='),feedbackUnit=unit('function ensureFeedbackLead(','function inferPbqObjective('),stripUnit=unit('function stripPbqHintsForExam(','const FILL_BLANK_SPELLING_VARIANTS ='),simUnit=unit('function PBQSim(','function ExamModeGuideModal('),examViewUnit=unit('function ExamMode(','function CipherRewardToast('),bankUnit=unit('function PBQBank(','function PBQSim(');
const units=[wholeUnit,partsUnit,canUnit,examUnit,answeredUnit,feedbackUnit,stripUnit,simUnit,examViewUnit,bankUnit];
const examGrade=Function('SELECT_FILL_PBQ_TYPE',examUnit.code+';return pbqCorrect;')('SELECT & FILL'),examAnswered=Function('SELECT_FILL_PBQ_TYPE',answeredUnit.code+';return isAnswered;')('SELECT & FILL');
const feedbackFunctions=Function(feedbackUnit.code+';return {pbqFeedbackBody,hasSeparatePbqSolution};')(),stripHints=Function(stripUnit.code+';return stripPbqHintsForExam;')();
// Execute only extracted pure expressions; submit, persistence and reward handlers never run.
function legacy(q,selected,orderItems=[]){
 const names=['q','orderItems','blanks','selected','SELECT_FILL_PBQ_TYPE','useMemo'],values=[q,orderItems,{},selected,'SELECT & FILL',fn=>fn()];
 const whole=Function(...names,wholeUnit.code+';return isCorrect();')(...values),parts=Function(...names,partsUnit.code+';return partResults;')(...values),can=Function(...names,canUnit.code+';return Boolean(canSubmit);')(...values);
 assert.equal(whole,examGrade(q,{selected,orderItems}));
 return{whole,parts,can,answered:Boolean(examAnswered({kind:'pbq',q},{selected,orderItems})),ratio:parts.filter(p=>p.correct).length/parts.length};
}
function permutations(xs){return xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>j!==i)).map(rest=>[x,...rest])):[[]];}
const sim=simUnit.code,exam=examViewUnit.code;
for(const marker of ['{q.type==="HOTSPOT"&&(','content={q?.diagram || evidence?.diagram}','{q.type==="LOG ANALYSIS"&&(','content={q?.logData || evidence?.logData}','part.solution','Correct order:','(q.type===SELECT_FILL_PBQ_TYPE||partResults.length>1)','partCorrectCount/partResults.length','q.optionFeedback?.[index]','const [selected,setSelected]=useState(null);','const [orderItems,setOrderItems]=useState(()=>q.items?[...q.items].sort(()=>Math.random()-.5):[]);'])assert(sim.includes(marker));
assert.equal((sim.match(/content=\{q\?\.diagram/g)||[]).length,1);assert(sim.includes('{q.type==="CONFIG/ACL"&&('));assert(sim.includes('content={q?.currentConfig || evidence?.currentConfig}'));assert(exam.includes('content={q?.currentConfig || q?.payload?.evidence?.currentConfig}'));assert(exam.includes('content={q?.logData || q?.payload?.evidence?.logData}'));
assert(!sim.includes('canSeeFeedback'));assert(bankUnit.code.includes('const canOpen=isPro||preview||coinUnlocked;'));assert(exam.includes('onConsumeExamPass?.()'));
const reviewStart=exam.indexOf('if(done) return('),reviewEnd=exam.indexOf('  const q=current?.q;',reviewStart);assert(reviewStart>=0&&reviewEnd>reviewStart);
const completedReview=exam.slice(reviewStart,reviewEnd);
assert(exam.includes('content={q?.diagram || q?.payload?.evidence?.diagram}'));
const initUnit=unit('  const initAnswer=item=>{','  const updateQuestionCount=');
const initAnswer=Function('shuffle',initUnit.code+';return initAnswer;')(xs=>[...xs].reverse());units.push(initUnit);
assert(completedReview.includes('q.items&&q.targets'));assert(!completedReview.includes('part.solution')&&!completedReview.includes('q.correctOrder'));
assert(completedReview.includes('(item.kind==="mcq"||hasSeparatePbqSolution(q))'));assert(completedReview.includes('expanded&&item.kind==="pbq"'));assert(completedReview.includes('Option review'));
const terminalUnit=unit('  const runTerminal=()=>{','  const simType='),sortableUnit=unit('function SortableOrderList(','function StreakCelebrationModal(');units.push(terminalUnit,sortableUnit);assert(sortableUnit.code.includes('{item.label}'));assert(!sortableUnit.code.includes('item.explanation'));
function terminalProbe(q,termInput){let history=[],input=termInput;Function('q','termInput','setTermHistory','setTermInput',terminalUnit.code+';runTerminal();')(q,termInput,fn=>history=fn(history),value=>input=value);return{history,input};}
const terminalDeliveryChecks=candidates.filter(s=>s.q.type==='TERMINAL SIM').map(s=>{
 for(const input of ['process','GET','forget']){const result=terminalProbe(s.q,input);assert.equal(result.history.length,2);assert.equal(result.history[1].type,'output');assert.equal(result.history[1].text,s.q.answer);assert.equal(result.input,'');}
 assert.equal(terminalProbe(s.q,'  ').history.length,0);const error=terminalProbe(s.q,'nonsense');assert.equal(error.history[1].type,'error');assert(error.history[1].text.includes(s.q.hint));
 return {recordId:s.record.id,keywordOutputFixtures:3,emptyInputFixtures:1,unrecognisedInputFixtures:1,storedTextRevision:sig(s.q.answer),genericSubstringMatching:true,actualShellExecuted:false,typedInputGraded:false,practiceHintVisible:true,examStoredAnswerVisible:false,visiblePremiseSufficientForQualifiedDecision:s.q.id==='p023',newReviewCredit:s.q.id==='p023'?1:0,measuredDecision:s.q.id==='p023'?'mode_bit_risk_reasoning_no_scan_or_hardening':'deferred_hidden_exam_evidence_and_or_combined_targets'};
});
assert(exam.includes('stripPbqHintsForExam(q)'));assert(!exam.includes('q.answer'));
const nonTerminalPrefix=sim.slice(0,sim.indexOf('  const runTerminal=')),nonTerminalSuffix=sim.slice(sim.indexOf('  const simType='));assert(!nonTerminalPrefix.includes('q.answer')&&!nonTerminalSuffix.includes('q.answer'));
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
const citationPaths=['src/App.jsx','src/data/sy0701PbqReview.js','src/data/sy0701SecondPassReview.js','src/data/sy0701ConciseExplanations.js'];
const citationTexts=new Map(citationPaths.map(path=>[path,readFileSync(path,'utf8').split('\n')]));
function rowCitations(id){return citationPaths.flatMap(path=>{const pattern=path==='src/App.jsx'?new RegExp('(?:\\bid\\s*:\\s*"'+id+'"|"id"\\s*:\\s*"'+id+'")'):new RegExp('^\\s*(?:'+id+'\\s*:|"'+id+'"\\s*:)');return citationTexts.get(path).flatMap((line,i)=>pattern.test(line)?[{path,line:i+1,anchorRevision:sig(line)}]:[]);});}
const sourceChecks=candidates.map(s=>{
 assert.equal(s.row.flags.importedSource,false);
 assert(s.authored);assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert.equal(sig(s.authored),sig(s.preQuestion));
 let revision=null,compilerError=null;try{revision=compileRevision(s.pub,'pbq');}catch(e){compilerError=e.message;}
 assert.equal(revision?.revisionId??null,s.record.trustedRevisionId);
 if(revision){assert.equal(revision.contentSha256,s.record.contentSha256);assert.equal(revision.evidencePrecision,'coarse');}
 else assert.fail('All eleven preflight candidates must retain their observed supported grammar: '+compilerError);
 if(s.snapshots.length){const replay=publicationPipeline().overrides(s.captures).pbqs.find(q=>q.id===s.q.id);assert.equal(sig(replay),s.record.sourceSignature);}
 const citations=rowCitations(s.q.id);assert.equal(citations.filter(r=>r.path==='src/App.jsx').length,1);assert(citations.some(r=>r.path==='src/data/sy0701PbqReview.js'));
 const fieldRevisions=Object.fromEntries(['title','type','question','scenario','choices','items','logData','diagram','currentConfig','codeBlock','answer','hint','hotspots','correct','correctOrder','explanation','wrongFeedback','objective','ch','difficulty'].map(field=>[field+'Revisions',{authored:sig(s.authored?.[field]??null),preeditorial:sig(s.preQuestion[field]??null),effective:sig(s.q[field]??null),changedFromAuthored:s.authored===null?null:sig(s.authored[field]??null)!==sig(s.q[field]??null),changedFromPreeditorial:sig(s.preQuestion[field]??null)!==sig(s.q[field]??null)}]));
 return{recordId:s.record.id,sourceCitations:citations,sourceRevision:s.record.localRevisionSignature,publishedRecordSignature:s.record.sourceSignature,feedbackRevision:s.feedback.sourceSignature,revisions:s.row.revisions,sourcePriority:s.row.priorityScore,authoredAvailable:s.authored!==null,authoredEqualsPreeditorial:s.authored===null?null:sig(s.authored)===sig(s.preQuestion),selectedSnapshotCount:s.snapshots.length,selectedCaptureCount:s.captures.length,selectedImports:false,snapshotReplayChecked:s.snapshots.length>0,capturedOverrideBindings:s.row.capturedOverrides,fieldRevisions,compilerStatus:revision?'supported_local_grammar':'unsupported_grammar',compilerError,trustedRevisionObserved:revision?.revisionId??null,trustedContentSha256Observed:revision?.contentSha256??null,precisionObserved:revision?.evidencePrecision??null};
});
const meanings={
  "p042": {
    "family": "supplied-exploit-execution-event-recognition",
    "meaning": "Identify the earliest event explicitly establishing exploit-triggered unauthorised code execution in the supplied timeline.",
    "main": "Delivery alone is not execution; later network activity and confirmed theft occur after the expressly confirmed reader exploit.",
    "hold": "HOLD a universal first-foothold or mandatory kill-chain sequence, actual telemetry analysis, actor attribution or this external contact as proven command and control. Current main calls the later contact C2, while the supplied scenario establishes only external-service contact: that teaching overclaim remains unresolved. Exploit execution and later theft are explicit fictional premises, not facts inferred from receiving a document. No document, endpoint, loader, vulnerability or data transfer is executed. Observed objective2.1-to2.2 change is not canonical scope approval.",
    "contrasts": [
      "Delivery of malicious content does not itself prove triggered exploit execution.",
      "The supplied later network contact cannot be the first exploit execution; contact alone does not prove C2.",
      "Confirmed later theft is an impact in this stipulated chronology, not the earliest execution event."
    ]
  },
  "p016": {
    "family": "service-agreement-layer-responsibility",
    "meaning": "Identify the customer as the agreed owner of the supplied guest-patching and database-configuration duties.",
    "main": "The explicit unmanaged-service agreement determines these two failed tasks, without settling every shared control or legal responsibility.",
    "hold": "HOLD a universal IaaS allocation, all duties above the hypervisor as exclusively customer-owned, or passed physical-control review as proof of every provider control. Both tasks share one stipulated owner; the keyed decision is owner identification, not two independent patch/database skills. Operational ownership does not decide legal liability or actual causal responsibility beyond the fictional premise. Preserve prior service-agreement family qualifications; no live contract, provider, guest, patch or database setting is tested.",
    "contrasts": [
      "Operating physical infrastructure does not override the explicitly allocated guest duty.",
      "Facilities responsibility does not become guest-patching or database-configuration ownership simply because the host is rented.",
      "Publishing an update is distinct from the supplied duty to apply applicable guest updates."
    ]
  },
  "p044": {
    "family": "specified-two-device-zone-design-selection",
    "meaning": "Select the one segmentation design meeting the explicit two independently managed device and permitted-path requirements.",
    "main": "The keyed design matches the stipulated architecture; a single multi-interface firewall can also form a valid DMZ in another design.",
    "hold": "HOLD a universally strongest or always-required two-firewall architecture, guaranteed prevention of lateral movement or a database categorically forbidden from every zone called a DMZ. Source requirements, policy enforcement and permitted application paths determine this choice. Device count or an independently managed label does not verify isolation or absence of shared failure. This is a design-requirements choice, not implemented firewall configuration. Difficulty hard-to-medium remains uncalibrated; no canonical role, scope or independent skill approval.",
    "contrasts": [
      "The one-device zoned design is valid in general but fails the explicit two-device requirement.",
      "The flat trust segment does not meet the stipulated separation and filtered inner boundary.",
      "Unrestricted public database traffic violates this stated access policy; two devices alone do not make it safe."
    ]
  },
  "p078": {
    "family": "specified-three-tier-policy-vector-selection",
    "meaning": "Choose one complete five-rule action vector matching the explicitly allowed and forbidden tier paths.",
    "main": "Enforce the stipulated service/source/destination paths while treating stateful returns and default denial as stated assumptions.",
    "hold": "HOLD five independently assessed rules or a deployed ACL, packet reachability or actual three-tier enforcement. This is one complete policy-vector selection using one set of path requirements. Earlier authored binary question is replaced by full-vector alternatives while retaining numeric key0; that source change is bound, not silently interpreted as unchanged semantics. Blocking a direct web-to-database path does not prevent injection through an authorised application path. Return handling, rule evaluation and routes require real-platform validation; no universal all-applications tier policy is approved.",
    "contrasts": [
      "Permitting the direct external-to-application rule conflicts with the supplied allowed path set.",
      "This vector both removes a required service path and permits a forbidden bypass; no partial rule credit is granted.",
      "Blocking the required public web path fails the stated application requirement."
    ]
  },
  "p023": {
    "family": "mode-bit-other-read-risk-recognition",
    "meaning": "Interpret the supplied other-user octal read bit and its password-derived-data disclosure risk under the host-specific baseline.",
    "main": "Other-user read permission creates an offline-guessing exposure if effective access permits the read; apply the stated baseline with ownership/group/ACL checks.",
    "hold": "HOLD a real permission scan, chmod/chown execution, verified file readability, cracked passwords or a universal root:shadow640 requirement. The unchanged correct choice says any user can read: mode bits alone do not establish effective access past directory permissions, ACLs, MAC, namespaces and other controls, and records may have locked or unavailable password verifiers. Risk is possible offline guessing, not guaranteed recovery. chmod does not change ownership. Visible scenario and question supply644 independently of hidden exam mock output, so credit only read-bit/risk reasoning; title promises hardening that is not executed.",
    "contrasts": [
      "Octal4 is read rather than write; the relevant risk is disclosure of available password-derived values.",
      "The execute bit is a different permission; mode4 does not authorise running this data file.",
      "Setuid is a separate special bit and is not granted by the supplied644 mode."
    ]
  },
  "p039": {
    "family": "governance-document-function-discrimination",
    "meaning": "Identify the supplied mandatory measurable document as the standard under the taught document-function convention.",
    "main": "Distinguish high-level policy, mandatory measured requirements, procedural steps and optional recommendations in this supplied exercise.",
    "hold": "HOLD a universal exhaustive document hierarchy or policies as unable to include measurable requirements. Organisations may combine or incorporate standards and procedures into policies; adopted authority/function matters. The16-character and24-hour incident change examples are fictional organisational requirements, not general authentication advice, breach evidence or a legal deadline. Current wording preserves categorical procedure/guideline contrasts and needs this context. Naming a document does not establish enforcement, password security or governance implementation.",
    "contrasts": [
      "Leadership authority and mandatory high-level policy are not by themselves the specific measurement function sought here.",
      "Sequential task instructions serve the procedure function in this convention; documents may incorporate other requirement types.",
      "Optional recommendations serve the guideline function here; standards are mandatory under the supplied convention."
    ]
  },
  "p038": {
    "family": "specified-authorised-test-work-package-ordering",
    "meaning": "Order six authorised test work packages under explicit scope, active-probing, impact and cleanup-before-final-delivery prerequisites.",
    "main": "Follow this engagement procedure, verify permitted cleanup and keep safety/urgent findings communication continuous; real tests may iterate.",
    "hold": "HOLD a universal serial penetration methodology, success of every exploit, unlimited post-exploitation access or silence until the final report. The supplied engagement prerequisites establish the keyed work-package order, not six independent test skills. Reporting means final delivery after agreed cleanup here; findings/documentation/urgent notice can occur earlier. Removing all test artefacts remains subject to approved evidence retention and coordinated exceptions. No target, reconnaissance, probe, exploit, backdoor, test account or report is executed. Preserve legacy partial positions versus trusted whole grading and incomplete exam item teaching; observed4.3-to5.5 scope is unapproved.",
    "contrasts": [
      "Only authorised exploitation after the permitted discovery prerequisites is in scope; no successful exploit is demonstrated.",
      "Written permission, scope and safety limits precede active probing here; collection still requires authorisation.",
      "Final report delivery follows cleanup under this agreement; documentation and urgent warnings are not postponed.",
      "Active discovery supplies candidate reachable services; a port does not establish exploitable weakness.",
      "Impact assessment remains inside the stipulated authorised boundaries and depends on a confirmed foothold.",
      "Verify permitted artefact removal and coordinate retention/exceptions; no cleanup command runs."
    ]
  }
};
const gradingChecks=[],teachingChecks=[];
let invalidSelections=0,tamperedRevisions=0,duplicateDisplays=0;
for(const s of credited){
 const q=s.q,revision=compileRevision(s.pub,'pbq'),ordering=q.type==='ORDERING';
 const prior=s.authored??s.preQuestion;assert.notEqual(q.explanation,prior.explanation);if(ordering)assert.deepEqual(q.correctOrder,prior.correctOrder);else{assert.equal(q.correct,prior.correct);assert.deepEqual(q.choices,q.options);assert.equal(Object.keys(q.optionFeedback).length,4);assert.equal(Object.keys(q.wrongFeedback).length,3);}
 const initialized=initAnswer({kind:'pbq',q});assert.equal(initialized.selected,null);assert.equal(initialized.orderItems.length,ordering?q.items.length:0);
 const selectable=revision.components.filter(x=>x.kind===(ordering?'item':'option'));
 const positions=revision.components.filter(x=>x.kind==='position').sort((a,b)=>a.position-b.position);
 const pair=id=>({componentId:id,valueId:id});
 const stableOrder=xs=>xs.map((x,i)=>({componentId:positions[i]?.id??'unknown',valueId:selectable.find(c=>c.authoredId===x.id)?.id??'unknown'}));
 let correctPaths=0,incorrectPaths=0,fractionalLegacyPaths=0,displayPermutations=0,stableDisplayGradingPaths=0;const matchedPositionHistogram={},observedPairs=new Set();
 const responses=ordering?permutations(q.items):q.choices.map((_,j)=>j);
 for(const response of responses){
  const observed=ordering?legacy(q,null,response):legacy(q,response),selected=ordering?stableOrder(response):[pair(selectable.find(x=>x.label===q.choices[response]).id)],trusted=gradeRevision(revision,selected);
  assert.equal(trusted.correct,observed.whole);assert.equal(trusted.score,observed.whole?1:0);assert.equal(trusted.evidencePrecision,'coarse');assert(observed.can&&observed.answered);
  if(trusted.correct)correctPaths++;else incorrectPaths++;
  if(ordering){const matched=observed.parts.filter(p=>p.correct).length;matchedPositionHistogram[matched]=(matchedPositionHistogram[matched]||0)+1;if(observed.ratio>0&&observed.ratio<1){fractionalLegacyPaths++;assert.equal(trusted.score,0);}
   observed.parts.forEach((part,i)=>{observedPairs.add(i+':'+response[i].id);const item=q.items.find(x=>x.id===q.correctOrder[i]);assert.equal(part.solution,item.explanation);assert.equal(part.correctAnswer,item.label);});
   const delivered=learnerRevision(revision,selected.map(x=>x.valueId));assert.deepEqual(delivered.components.map(x=>x.id),selected.map(x=>x.valueId));assert.equal(gradeRevision(revision,selected).correct,trusted.correct);displayPermutations++;stableDisplayGradingPaths++;
  }
 }
 assert.equal(correctPaths,1);assert.equal(incorrectPaths,ordering?(q.items.length===6?719:119):3);
 if(!ordering){
  assert.deepEqual((({whole,ratio,can,answered})=>({whole,ratio,can,answered}))(legacy(q,null)),{whole:false,ratio:0,can:false,answered:false});
  const undef=legacy(q,undefined);assert(undef.can&&!undef.answered&&!undef.whole);
  for(const j of [-1,4,String(q.correct)]){const x=legacy(q,j);assert(!x.whole&&x.can&&x.answered);}
  for(const order of permutations(selectable.map(x=>x.id))){const delivered=learnerRevision(revision,order);assert.deepEqual(delivered.components.map(x=>x.id),order);displayPermutations++;for(const component of delivered.components){assert.equal(gradeRevision(revision,[pair(component.id)]).correct,component.label===q.choices[q.correct]);stableDisplayGradingPaths++;}}
 }else{
  const expected=q.correctOrder.map(id=>q.items.find(x=>x.id===id)),empty=legacy(q,null,[]),extra=legacy(q,null,[...expected,q.items[0]]),truncated=legacy(q,null,expected.slice(0,-1));
  assert(!empty.can&&!empty.answered&&!empty.whole);assert(extra.whole&&extra.ratio===1&&extra.can&&extra.answered);assert(!truncated.whole&&truncated.ratio>0&&truncated.can&&truncated.answered);
  const duplicate=[...expected];duplicate[1]=duplicate[0];const duplicateLegacy=legacy(q,null,duplicate);assert(!duplicateLegacy.whole&&duplicateLegacy.ratio>0&&duplicateLegacy.can&&duplicateLegacy.answered);assert.equal(observedPairs.size,q.items.length**2);
  const untouched=legacy(q,null,q.items);assert(untouched.can&&untouched.answered);
  assert.deepEqual(matchedPositionHistogram,q.items.length===6?{'0':265,'1':264,'2':135,'3':40,'4':15,'6':1}:{'0':44,'1':45,'2':20,'3':10,'5':1});
 }
 const valid=ordering?stableOrder(q.items):[pair(selectable[0].id)];
 const bad=ordering?[[],valid.slice(0,-1),[...valid,{componentId:'extra',valueId:'extra'}],valid.map((x,i)=>({...x,valueId:i===1?valid[0].valueId:x.valueId})),valid.map((x,i)=>({...x,componentId:i===1?valid[0].componentId:x.componentId})),valid.map((x,i)=>({...x,valueId:i===0?'unknown':x.valueId})),valid.map((x,i)=>({...x,componentId:i===0?selectable[0].id:x.componentId}))]:[[],[pair(selectable[0].id),pair(selectable[1].id)],[pair('unknown')],[{componentId:selectable[0].id,valueId:selectable[1].id}]];
 for(const selection of bad){assert.throws(()=>gradeRevision(revision,selection));invalidSelections++;}
 for(const field of ['contentSha256','gradingKey']){const stale=structuredClone(revision);if(field==='contentSha256')stale.contentSha256='stale';else stale.gradingKey.expected[0].valueId='invented';assert.throws(()=>gradeRevision(stale,valid));tamperedRevisions++;}
 const duplicateOrder=selectable.map(x=>x.id);duplicateOrder[1]=duplicateOrder[0];assert.throws(()=>learnerRevision(revision,duplicateOrder));duplicateDisplays++;
 const projected=learnerRevision(revision);assert(!/"(?:gradingKey|expected|answer|explanation|wrongFeedback|optionFeedback|feedback)"\s*:/.test(JSON.stringify(projected)));
 assert.equal(stripHints(q).hint,undefined);assert.equal(sig(stripHints(q).items??q.choices),sig(q.items??q.choices));
 assert.equal(feedbackFunctions.hasSeparatePbqSolution(q),ordering);
 const teachingBindings=ordering?q.items.map(item=>{assert(item.explanation?.trim());assert.equal(prior.items.find(x=>x.id===item.id)?.explanation,undefined);return{labelRevision:sig(item.label),teachingRevision:sig(item.explanation)};}):q.choices.map((choice,j)=>{const body=feedbackFunctions.pbqFeedbackBody(q.optionFeedback[j]);assert.equal(body,j===q.correct?q.explanation:q.wrongFeedback[j]);assert(q.optionFeedback[j].startsWith(j===q.correct?'Correct.':'Incorrect.'));return{choiceRevision:sig(choice),teachingRevision:sig(q.optionFeedback[j]),bodyRevision:sig(body)};});
 const contrasts=ordering?q.items.map((item,j)=>({labelRevision:sig(item.label),correctionRevision:sig(item.explanation),teachingRationale:meanings[q.id].contrasts[j],assessedSecondary:false,weight:0})):q.choices.map((_,j)=>j).filter(j=>j!==q.correct).map((j,k)=>({choiceRevision:sig(q.choices[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:meanings[q.id].contrasts[k],assessedSecondary:false,weight:0}));
 gradingChecks.push({recordId:s.record.id,mode:revision.gradingKey.answerMode,precision:'coarse',correctPaths,incorrectPaths,fractionalLegacyPaths,matchedPositionHistogram,itemPositionPairings:observedPairs.size,displayPermutations,stableDisplayGradingPaths,legacyPrepopulatedOrderCanSubmit:ordering,legacyExtraCorrectPrefixAccepted:ordering,trustedExtraOrderRejected:ordering,componentMasteryApproved:false});
 teachingChecks.push({recordId:s.record.id,mainRevision:sig(q.explanation),mainChanged:sig(q.explanation)!==sig(prior.explanation),teachingBindings,contrasts,newItemCorrections:ordering?q.items.length:0,newWrongCorrections:ordering?0:q.choices.map((_,j)=>j).filter(j=>j!==q.correct&&prior.wrongFeedback?.[j]===undefined).length,changedWrongCorrections:ordering?0:q.choices.map((_,j)=>j).filter(j=>j!==q.correct&&prior.wrongFeedback?.[j]!==undefined&&prior.wrongFeedback[j]!==q.wrongFeedback[j]).length,practiceHintVisible:q.type==='TERMINAL SIM',examHintsStripped:true,mainStandalonePanel:ordering,mainDeliveredViaCorrectOption:!ordering,practiceTeachingComplete:true,examItemTeachingComplete:!ordering,deliveryGate:ordering?'accessible_submitted_practice_main_and_position_teaching_completed_exam_main_only':'accessible_submitted_practice_all_options_completed_expanded_exam_all_options',learnerRuntimeObserved:false});
}
assert.equal(gradingChecks.reduce((n,x)=>n+x.fractionalLegacyPaths,0),454);
assert.equal(teachingChecks.reduce((n,x)=>n+x.newItemCorrections,0),6);assert.equal(teachingChecks.reduce((n,x)=>n+x.changedWrongCorrections,0),11);assert.equal(teachingChecks.reduce((n,x)=>n+x.newWrongCorrections,0),3);
const preservedRecentSemanticDeferrals=[...base.preservedRecentSemanticDeferrals,...base.deferredSelectedRows];assert.equal(preservedRecentSemanticDeferrals.length,9);for(const r of preservedRecentSemanticDeferrals){assert.equal(r.newQuestionCredit,0);assert.equal(r.newFeedbackCredit,0);assert(!c.previous.has(r.recordId));assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);}
const preservedRecentGradingDeliveryHolds=base.preservedRecentGradingDeliveryHolds;assert.equal(preservedRecentGradingDeliveryHolds.length,2);for(const r of preservedRecentGradingDeliveryHolds){assert.equal(r.priorDispositionRevision,sig(c.previous.get(r.recordId).row));assert.equal(r.resolved,false);}
const deferredPreflightChecks=candidates.filter(s=>!creditedIds.includes(s.q.id)).map(s=>{
 const q=s.q,revision=compileRevision(s.pub,'pbq'),options=revision.components.filter(c=>c.kind==='option');assert.equal(options.length,4);assert.equal(Object.keys(q.wrongFeedback).length,3);assert.equal(Object.keys(q.optionFeedback).length,4);let correctPaths=0,displayPermutations=0,stableGradingPaths=0;
 for(let j=0;j<4;j++){const observed=legacy(q,j),component=options.find(c=>c.label===q.choices[j]),selection=[{componentId:component.id,valueId:component.id}];assert.equal(gradeRevision(revision,selection).correct,observed.whole);assert.equal(gradeRevision(revision,selection).score,observed.whole?1:0);assert(observed.can&&observed.answered);if(observed.whole)correctPaths++;}
 assert.equal(correctPaths,1);for(const order of permutations(options.map(c=>c.id))){const delivered=learnerRevision(revision,order);assert.deepEqual(delivered.components.map(c=>c.id),order);displayPermutations++;for(const component of delivered.components){assert.equal(gradeRevision(revision,[{componentId:component.id,valueId:component.id}]).correct,component.label===q.choices[q.correct]);stableGradingPaths++;}}
 const teachingBindings=q.choices.map((choice,j)=>{assert.equal(feedbackFunctions.pbqFeedbackBody(q.optionFeedback[j]),j===q.correct?q.explanation:q.wrongFeedback[j]);return{choiceRevision:sig(choice),teachingRevision:sig(q.optionFeedback[j])};});
 assert(!feedbackFunctions.hasSeparatePbqSolution(q));assert.equal(stripHints(q).hint,undefined);
 if(['p032','p003'].includes(q.id)){assert(q.answer?.trim());assert(!q.logData&&!q.diagram&&!q.currentConfig&&!q.codeBlock);}
 return{recordId:s.record.id,compilerSupported:true,correctPaths,incorrectPaths:3,displayPermutations,stableGradingPaths,mainTeachingRevision:sig(q.explanation),teachingBindings,practiceOptionTeachingPresent:true,completedExpandedExamOptionTeachingPresent:true,examStoredOutputVisible:false,hiddenPreAnswerPremise:['p032','p003'].includes(q.id),combinedDistinctTargets:['p032','p068','p047'].includes(q.id),semanticApproval:false,newQuestionCredit:0,newFeedbackCredit:0};
});assert.equal(deferredPreflightChecks.length,4);
assert.equal(c.questions.get('pbq:p023').q.choices[c.questions.get('pbq:p023').q.correct],c.questions.get('pbq:p023').authored.choices[c.questions.get('pbq:p023').q.correct]);assert.equal(0o644&0o004,4);assert.equal(0o640&0o004,0);
const questionProposals=credited.map(s=>({recordId:s.record.id,questionId:s.q.id,kind:'pbq',sourceRevision:s.record.localRevisionSignature,publishedRecordSignature:s.record.sourceSignature,revisions:s.row.revisions,trustedRevisionObserved:s.record.trustedRevisionId,trustedContentSha256Observed:s.record.contentSha256,sourceInspectionRevision:sig(sourceChecks.find(r=>r.recordId===s.record.id)),assessedUnderstanding:meanings[s.q.id].meaning,contentQualification:meanings[s.q.id].hold,familyLabelProposal:meanings[s.q.id].family,familyStatus:'provisional_comparison_no_independence_approval',precisionObserved:'coarse',difficultyObserved:s.q.difficulty,difficultyDisposition:'source_label_uncalibrated',objectiveScopeProposal:null,skillRoleProposal:null,primaryConceptProposal:null,secondaryConceptProposals:[],assessedCanonicalRoleProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,partialWeightsAllowed:false,partialConceptWeights:[],componentMasteryApproved:false}));
const explanationProposals=credited.map((s,i)=>({recordId:s.feedback.id,kind:'explanation_bundle',parentId:s.record.id,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:s.record.localRevisionSignature,parentPublishedRevision:s.record.sourceSignature,parentTrustedRevisionObserved:s.record.trustedRevisionId,parentDispositionStatus:'new_complete_question_and_feedback_judgment',familyLabelProposal:meanings[s.q.id].family,mainTeachingUnderstanding:meanings[s.q.id].main,contentQualification:meanings[s.q.id].hold,mainCorrectionRevision:teachingChecks[i].mainRevision,teachingBindings:teachingChecks[i].teachingBindings,distractorOrPlacementCorrections:teachingChecks[i].contrasts,deliveryGate:teachingChecks[i].deliveryGate,mainStandalonePanel:teachingChecks[i].mainStandalonePanel,mainDeliveredViaCorrectOption:teachingChecks[i].mainDeliveredViaCorrectOption,objectiveScopeProposal:null,roleProposal:null,primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false}));
const deferredReasons={
 p032:'Supported whole-choice grammar, but the task combines XSS classification and root-cause remediation. Test/reflection/persistence observations are only stored terminal output, hidden in exam; an alert premise alone does not establish the full subtype. Zero credit under this slice combined-task and pre-answer visibility rules.',
 p068:'Supported whole-choice grammar and sufficient visible stored-comment premise, but the task explicitly combines root-cause rendering remediation with an additional defence-in-depth layer. Hold combined targets under this slice; no component split or partial credit. Hidden summary adds no unique premise.',
 p047:'Supported whole-choice grammar and visible normalized logData, but the prompt explicitly combines exposure conclusion and preventive guardrail choice. Hold combined targets under this slice; no separate conclusion/control mastery or full-feedback credit.',
 p003:'Supported LOCAL fallback whole-choice grammar, but task-critical simulated process/connection records are only in stored terminal output. Exam hides that field and the visible scenario does not supply the observed name/parent/PID-linked connection. Choices cannot replace missing evidence. Private p003 remains strictly separate and unavailable.'
};
const deferredSelectedRows=candidates.filter(s=>!creditedIds.includes(s.q.id)).map(s=>({recordId:s.record.id,feedbackRecordId:s.feedback.id,sourceRevision:s.record.localRevisionSignature,publishedRecordSignature:s.record.sourceSignature,feedbackRevision:s.feedback.sourceSignature,trustedRevisionObserved:s.record.trustedRevisionId,reason:deferredReasons[s.q.id],newQuestionCredit:0,newFeedbackCredit:0,semanticsFullyReviewed:false,sourcePayloadExported:false}));assert.equal(deferredSelectedRows.length,4);
const comparisonSpecs=[
 {ids:['pbq:p016','mcq:m017'],meaning:'Reuse the service-agreement layer-responsibility family. Explicit unmanaged terms narrow the otherwise assumed provider/customer allocation; identifying one owner does not demonstrate patching or settle legal liability.'},
 {ids:['pbq:p044','pbq:p078','pbq:p013','pbq:p070','mcq:m619'],meaning:'Compare specified zone/device design and one complete tier policy vector with simplified inbound/host policy and VLAN naming. Preserve architecture assumptions and avoid isolation guarantees, platform equivalence or independent rule credit.'},
 {ids:['pbq:p023','mcq:m711'],meaning:'Mode-bit read-risk reasoning and per-object server authorisation concern different permission mechanisms. Neither a mode nor a token alone proves effective access enforcement.'},
 {ids:['pbq:p039','mcq:m028'],meaning:'Reuse governance-document function discrimination, retaining incorporated-policy and organisation-specific password/timing qualifications.'},
 {ids:['pbq:p038','mcq:m349','pbq:p020','pbq:p099'],meaning:'Scenario-specified test work-package ordering differs from assessment purpose recognition and other supplied work orders. Preserve safety, authorised scope, verification, concurrent communication and incomplete exam position teaching.'},
 {ids:['pbq:p032','pbq:p068','pbq:p014'],meaning:'Compare XSS combined remediation targets against the earlier one paired key; none creates independent concepts or cures hidden exam test evidence. Current four-candidate deferrals create zero credit.'},
 {ids:['pbq:p003','pbq:p084','pbq:p040','pbq:p051'],meaning:'Local process investigation needs its delivered observations; mock output is not executed collection or proof of tool/actor identity. Private p003 is not compared, substituted or approved by any local family.'},
 {ids:['pbq:p042'],meaning:'A supplied exploit-execution event is narrow chronology recognition. Do not import a universal kill-chain stage model or infer proven C2 from external contact.'}
];
const comparisonGroups=comparisonSpecs.map(g=>({recordIds:g.ids,comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get(id),p=c.previous.get(id);assert(s);return{recordId:id,sourceRevision:s.record.sourceSignature,localRevision:s.record.localRevisionSignature,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
assert.equal(c.previous.get('mcq:m017').row.familyLabelProposal,meanings.p016.family);assert.equal(c.previous.get('mcq:m028').row.familyLabelProposal,meanings.p039.family);
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId));assert.equal(selectedIds.size,14);
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(kind=>[kind,rows.filter(r=>r.kind===kind).length]));
const objectiveCoverage={};
for(const [code,total,priorCount,newCount]of [['2.2',134,61,2],['2.3',162,60,0],['3.1',220,99,2],['3.2',220,83,4],['4.1',203,43,2],['4.9',96,20,0],['5.1',103,48,2],['5.5',41,17,2]]){
 const broad=c.pkg.records.filter(r=>r.objectiveCodes.includes(code)),prior=broad.filter(r=>c.previous.has(r.id)),fresh=broad.filter(r=>selectedIds.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id));
 assert.equal(broad.length,total);assert.equal(prior.length,priorCount);assert.equal(fresh.length,newCount);
 objectiveCoverage[code]={denominator:{broadCandidates:total,allPacketPriorDispositions:priorCount,priorByKind:counts(prior),newQuestionDispositions:fresh.filter(r=>r.kind==='pbq').length,newFeedbackDispositions:fresh.filter(r=>r.kind==='explanation_bundle').length,combinedAgentDispositions:priorCount+newCount,remaining:remaining.length,remainingLocal:remaining.filter(r=>!r.id.startsWith('private:')).length,remainingPrivateMetadataOnly:remaining.filter(r=>r.id.startsWith('private:')).length,remainingByKind:counts(remaining)},census:broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:r.id.startsWith('private:')?'unavailable_private_semantics_not_reviewed':c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'})),remainingRecordIds:remaining.map(r=>r.id)};
}
const memberships=new Map();for(const [code,v]of Object.entries(objectiveCoverage))for(const r of v.census)memberships.set(r.recordId,[...(memberships.get(r.recordId)||[]),code]);
const sharedObjectiveRecords=[...memberships].filter(([id,codes])=>codes.length>1).map(([recordId,objectiveCodesObserved])=>({recordId,objectiveCodesObserved}));assert([...selectedIds].every(id=>memberships.get(id).length===1));
const combinedQuestions=new Set([...priorBank.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=c.ledger.rows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,allPacketPriorQuestions:447,newQuestions:7,allPacketCombinedQuestions:combinedQuestions.size,combinedMcqs:395,combinedLocalPbqs:combinedQuestions.size-395,remainingQuestionDispositions:483-combinedQuestions.size,priorFullFeedback:440,priorLocalPbqFullFeedback:45,newFeedbackBundles:7,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,pairedMcqs:paired.filter(r=>r.kind==='mcq').length,pairedLocalPbqs:paired.filter(r=>r.kind==='pbq').length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.allPacketCombinedQuestions,454);assert.equal(bankProgress.fullFeedbackCombined,447);assert.equal(bankProgress.completeQuestionFeedbackPairs,447);assert.equal(bankProgress.pairedLocalPbqs,52);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,7);
const remainingBankQuestions=c.ledger.rows.filter(r=>!combinedQuestions.has(r.recordId)).map(r=>({recordId:r.recordId,sourceRevision:c.records.get(r.recordId).sourceSignature,trustedRevisionObserved:c.records.get(r.recordId).trustedRevisionId,status:c.records.get(r.recordId).trustedRevisionId===null?'unsupported_grammar_no_new_credit':'supported_unreviewed_preserved_or_current_deferral_no_new_credit'}));
const remainingBankFeedback=c.ledger.rows.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).map(r=>({recordId:'explanation:'+r.recordId,parentId:r.recordId,sourceRevision:c.records.get('explanation:'+r.recordId).sourceSignature,status:combinedQuestions.has(r.recordId)?'older_question_only_full_feedback_deferred':'question_and_full_feedback_deferred'}));
assert.equal(remainingBankQuestions.length,29);assert.equal(remainingBankQuestions.filter(r=>r.trustedRevisionObserved===null).length,23);assert.deepEqual(remainingBankQuestions.filter(r=>r.trustedRevisionObserved!==null).map(r=>r.recordId).sort(),['pbq:p003','pbq:p009','pbq:p032','pbq:p047','pbq:p068','pbq:p074']);assert.equal(remainingBankFeedback.length,36);assert.equal(remainingBankFeedback.filter(r=>r.status==='older_question_only_full_feedback_deferred').length,7);
for(const id of ['private:pbq:p003','private:explanation:pbq:p003','private:pbq:p017','private:explanation:pbq:p017']){const r=c.records.get(id);assert(r);assert.equal(r.trustedRevisionId,null);assert(!selectedIds.has(id)&&!c.previous.has(id));}
assert.equal(c.records.get('private:pbq:p003').sourceSignature,'sha256:f2eb1e715fa9fcda87ada668d7d17dfdf6b44840328d5ffeb460e3a342e502f2');assert.equal(c.records.get('private:pbq:p017').sourceSignature,'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42');
const preservedOlderFeedbackDeferrals=base.preservedOlderFeedbackDeferrals;assert.equal(preservedOlderFeedbackDeferrals.length,7);assert.deepEqual(preservedOlderFeedbackDeferrals.map(r=>r.parentId),['pbq:p004','pbq:p211','pbq:p011','pbq:p029','pbq:p046','pbq:p041','pbq:p043']);for(const r of preservedOlderFeedbackDeferrals){assert.equal(r.newFeedbackCredit,0);assert(!selectedIds.has(r.recordId));assert.equal(r.sourceRevision,c.records.get(r.recordId).sourceSignature);}
const priorHoldBindings=[...c.previous].filter(([id,p])=>p.row.contentQualification||p.row.taxonomyBlocker).map(([recordId,p])=>({recordId,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),qualificationRevision:sig(p.row.contentQualification??null),taxonomyBlockerRevision:sig(p.row.taxonomyBlocker??null),resolved:false}));
const p014=c.previous.get('pbq:p014');assert.equal(p014.row.numberOfKeyedDecisions,1);assert.equal(p014.row.partialWeightsAllowed,false);
const preservedSinglePairHold={recordId:'pbq:p014',priorPacketPath:p014.path,priorDispositionRevision:sig(p014.row),qualificationRevision:sig(p014.row.contentQualification),numberOfKeyedDecisions:1,partialWeightsAllowed:false,twoIndependentSkillsApproved:false,resolved:false};
const hiddenEvidenceReleaseHolds=base.hiddenEvidenceReleaseHolds;assert.equal(hiddenEvidenceReleaseHolds.length,2);for(const r of hiddenEvidenceReleaseHolds){assert.equal(r.priorDispositionRevision,sig(c.previous.get(r.recordId).row));assert.equal(r.storedEvidenceRendered,false);assert.equal(r.resolved,false);}
const recoveryRoleBindings=['pbq:p048','pbq:p211'].map(recordId=>{const p=c.previous.get(recordId);return{recordId,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),rationaleRevision:sig(p.row.rationale),taxonomyBlockerRevision:sig(p.row.taxonomyBlocker??null),existingPilotMappingRevision:sig(p.row.existingPilotMapping??null),masteryWeight:0,rolesPromoted:false,resolved:false};});
const sourceBindings=[...new Map([...base.sourceBindings,...inventory.map(r=>({path:r.path,sha256:r.sha256})),...[basePath,scriptPath,...citationPaths,'server/adaptive/revision.mjs','src/lib/learningPersistenceContracts.js','scripts/lib/content-mapping/delivery-inventory.mjs','scripts/lib/content-mapping/publication.mjs'].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];verifySourceBindings(sourceBindings);
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'386556012bcc580e17d7a24dd336634c486987c7',sourceBindings,selectionPolicy:'Eleven residual local candidates with supported frozen grammar; independently preflight sources, evidence visibility, grading, teaching and semantic targets; adapt down to seven complete pairs',triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),inventoryOnly:true,legacyTrackedPriorQuestions:405},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences},candidateQuestionRecordIds:candidates.map(s=>s.record.id),selectedQuestionRecordIds:questionProposals.map(r=>r.recordId),selectedFeedbackRecordIds:explanationProposals.map(r=>r.recordId),sourceChecks,gradingChecks,teachingChecks,gradingSourceBindings:units.map(u=>u.provenance),questionProposals,explanationProposals,instructionalProposals:[],deferredSelectedRows,comparisonGroups,terminalDeliveryChecks,deferredPreflightChecks,preservedPreviewObservation:base.previewObservation,preservedRecentSemanticDeferrals,preservedRecentGradingDeliveryHolds,objectiveCoverage,sharedObjectiveRecords,distinctAffectedCatalogueRecords:memberships.size,sharedRecordsCreateNoAdditionalGlobalCredit:true,bankProgress,remainingBankQuestions,remainingBankFeedback,priorHolds:{sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHoldsRevision:sig(base.priorHolds),bindings:priorHoldBindings,earlierHoldsResolved:false},earliestHoldBindings:base.earliestHoldBindings,preservedKevTeachingHolds:base.preservedKevTeachingHolds,pilotBoundary:base.pilotBoundary,preservedPilotFeedbackLinkReconciliation:base.preservedPilotFeedbackLinkReconciliation,privateBoundary:base.privateBoundary,hiddenEvidenceReleaseHolds,preservedSinglePairHold,recoveryRoleBindings,preservedOlderFeedbackDeferrals,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},trustedInvalidSelectionsRejected:invalidSelections,tamperedRevisionsRejected:tamperedRevisions,duplicateDisplaysRejected:duplicateDisplays,tooltipDeliveryObserved:false,learnerRuntimeObserved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,canonicalScopeRolesSkillsWeightsTeachingApproved:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
let completedNegativeChecks;
function validate(value){assertSafeReviewExport(value);assert(!/"(?:correctOrder|componentId|valueId|authoredId|correctAnswer|selectedComponents|items|blanks)"\s*:/.test(JSON.stringify(value)));const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);}
validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const value=structuredClone(packet);mutate(value);assert.notDeepEqual(value,packet);assert.throws(()=>validate(value));negativeMutationChecks++;};
for(let i=0;i<candidates.length;i++){for(const field of ['sourceRevision','publishedRecordSignature','feedbackRevision','trustedRevisionObserved','compilerStatus'])reject(p=>p.sourceChecks[i][field]='stale');reject(p=>p.sourceChecks[i].revisions.authored='invented');reject(p=>p.sourceChecks[i].sourceCitations[0].line++);reject(p=>p.sourceChecks[i].sourceCitations[0].anchorRevision='stale');}
for(let i=0;i<credited.length;i++){for(const field of ['sourceRevision','publishedRecordSignature','contentQualification','familyLabelProposal','sourceInspectionRevision'])reject(p=>p.questionProposals[i][field]='stale');reject(p=>p.questionProposals[i].primaryConceptProposal='invented');reject(p=>p.questionProposals[i].partialWeightsAllowed=true);reject(p=>p.questionProposals[i].humanApproved=true);reject(p=>p.questionProposals[i].newFamilyCredit=1);reject(p=>p.gradingChecks[i].componentMasteryApproved=true);reject(p=>p.gradingChecks[i].precision='direct');for(const field of ['sourceRevision','parentLocalRevision','parentPublishedRevision','contentQualification','deliveryGate'])reject(p=>p.explanationProposals[i][field]='stale');reject(p=>p.explanationProposals[i].masteryWeight=1);reject(p=>p.explanationProposals[i].approvedRemediation=true);reject(p=>p.explanationProposals[i].parentId=p.explanationProposals[(i+1)%credited.length].parentId);reject(p=>{const xs=p.explanationProposals[i].teachingBindings;[xs[0],xs[1]]=[xs[1],xs[0]];});reject(p=>{const xs=p.explanationProposals[i].distractorOrPlacementCorrections;[xs[0],xs[1]]=[xs[1],xs[0]];});for(let j=0;j<teachingChecks[i].teachingBindings.length;j++)reject(p=>p.explanationProposals[i].teachingBindings[j].teachingRevision='stale');for(let j=0;j<teachingChecks[i].contrasts.length;j++){reject(p=>p.explanationProposals[i].distractorOrPlacementCorrections[j].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorOrPlacementCorrections[j].assessedSecondary=true);}}
for(let i=0;i<credited.length;i++)for(const field of ['correctPaths','incorrectPaths','displayPermutations','stableDisplayGradingPaths','fractionalLegacyPaths','itemPositionPairings'])reject(p=>p.gradingChecks[i][field]++);
for(let i=0;i<priorHoldBindings.length;i++)reject(p=>p.priorHolds.bindings[i].resolved=true);
for(let i=0;i<7;i++)reject(p=>p.preservedOlderFeedbackDeferrals[i].newFeedbackCredit=1);
for(let i=0;i<2;i++){reject(p=>p.hiddenEvidenceReleaseHolds[i].storedEvidenceRendered=true);reject(p=>p.recoveryRoleBindings[i].rolesPromoted=true);}
for(const code of Object.keys(objectiveCoverage)){reject(p=>p.objectiveCoverage[code].denominator.newQuestionDispositions=99);reject(p=>p.objectiveCoverage[code].census.pop());reject(p=>p.objectiveCoverage[code].remainingRecordIds.pop());}
for(let i=0;i<4;i++){reject(p=>p.deferredSelectedRows[i].newQuestionCredit=1);reject(p=>p.deferredSelectedRows[i].newFeedbackCredit=1);reject(p=>p.deferredSelectedRows[i].reason='');}
for(let i=0;i<9;i++){reject(p=>p.preservedRecentSemanticDeferrals[i].newQuestionCredit=1);reject(p=>p.preservedRecentSemanticDeferrals[i].newFeedbackCredit=1);}
for(let i=0;i<3;i++){reject(p=>p.terminalDeliveryChecks[i].actualShellExecuted=true);reject(p=>p.terminalDeliveryChecks[i].typedInputGraded=true);}
for(let i=0;i<2;i++)reject(p=>p.preservedRecentGradingDeliveryHolds[i].resolved=true);
for(let i=0;i<4;i++){reject(p=>p.deferredPreflightChecks[i].newQuestionCredit=1);reject(p=>p.deferredPreflightChecks[i].newFeedbackCredit=1);reject(p=>p.deferredPreflightChecks[i].hiddenPreAnswerPremise=!p.deferredPreflightChecks[i].hiddenPreAnswerPremise);reject(p=>p.deferredPreflightChecks[i].correctPaths=4);reject(p=>p.deferredPreflightChecks[i].teachingBindings.reverse());}
reject(p=>p.remainingBankQuestions.pop());reject(p=>p.remainingBankFeedback.pop());reject(p=>p.preservedPreviewObservation.activated=true);reject(p=>p.preservedPreviewObservation.accessChangeApproved=true);
reject(p=>p.questionProposals.push(p.questionProposals[0]));reject(p=>p.explanationProposals.push(p.explanationProposals[0]));reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.pilotBoundary.roleWeightTeachingPublicationApprovalTransferred=true);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=483);reject(p=>p.preservedSinglePairHold.twoIndependentSkillsApproved=true);reject(p=>p.earliestHoldBindings=null);reject(p=>p.preservedKevTeachingHolds[0].currentDeadlineOrDirectiveRequirementsResolved=true);reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const key of ['q','options','correct','gradingKey','payload','learnerId'])reject(p=>p[key]='forbidden');
completedNegativeChecks=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const location=u=>'src/App.jsx:'+u.provenance.startLine;
const totals=gradingChecks.reduce((a,r)=>{for(const k of ['correctPaths','incorrectPaths','fractionalLegacyPaths','itemPositionPairings','displayPermutations','stableDisplayGradingPaths'])a[k]=(a[k]||0)+r[k];return a;},{});
const report=`# Phase 2B-5 — residual supported local PBQ preflight

**NOT READY.** Review date: **11 October 2026**. Baseline: **${packet.baselineCommit}**. Packet SHA-256: **${hashFile(packetPath)}**. ONE finite LOCAL/default-off/unwired/learner-invisible slice. Only this report, its draft packet and focused audit change.

## Authority and finite decision

The master plan and Phase1 audit were read in full earlier in this continuing session. Approved product decisions follow the master plan, verified historical implementation follows the audit, and current sources were rechecked. No unresolved authority conflict affects these draft judgments. This review does not approve canonical objective/concept/role/skill/difficulty/weight/independence, teaching publication, remediation or learner evidence.

Preflight all11 requested candidates: **2.2 p042; 2.3 p032,p068; 3.1 p016,p047; 3.2 p044,p078; 4.1 p023; 4.9 LOCAL p003; 5.1 p039; 5.5 p038**. All eleven compile with the currently observed trusted whole grammar; that is not semantic or delivery approval. None has an existing question or full-feedback disposition in the exact reconciled prior set.

Adapt down to **seven distinct complete question judgments plus seven separate complete-feedback judgments**, pending independent and owner review: **${creditedIds.join(', ')}**. The task's strict combined-target/hidden-evidence deferral rule applies to this slice; this does not retroactively change the dispositions or qualifications of older single-key paired questions.

| Deferred identity | Source, delivery or semantic reason | New question / feedback credit |
| --- | --- | --- |
${deferredSelectedRows.map(r=>'| '+r.recordId+' | '+r.reason+' | 0 / 0 |').join('\n')}

p032/p047 ask for distinct diagnosis/conclusion and control targets; p068 explicitly asks for root-cause rendering treatment and an additional defence layer. Their whole-choice grammars are supported, but no approved split exists. p068's stored-summary field is hidden in SCENARIO practice/exam, while its visible scenario independently supplies the stored-comment premise; its deferral is combined-target semantics, not missing critical evidence. p047 logData is visible in both modes; it is also a combined-target deferral. Zero full-feedback credit follows the zero whole-question credit.

p032's immediate-response/non-persistence test observations and p003's name/parent/PID/connection observations are only stored mock terminal output and are hidden in exam. p032's visible alert premise alone does not establish the full reflected subtype. p003's visible scenario asks to correlate records but does not supply them; options cannot replace missing evidence. No renderer, question, adapter or grading key is changed.

## Exact reconciliation and progress

Reconcile **72 prior substantive packets**, **42 older distinct question judgments (30 MCQs +12 PBQs)**, **22 duplicate references**, and **seven support/link-only references**. Verify prior decisions against current record revisions and immutable decision hashes. No support link becomes full current feedback and no shared catalogue membership creates duplicate credit. Frozen triage remains inventory only.

| Local bank coverage | Prior | New | Combined | Remaining |
| --- | ---: | ---: | ---: | ---: |
| Question judgments | 447 | 7 | 454/483 | 29 |
| PBQ question judgments | 52 | 7 | 59/88 | 29 |
| Full feedback / complete pairs | 440 | 7 | 447/483 | 36 |
| PBQ full feedback / complete pairs | 45 | 7 | 52/88 | 36 |
| Older question-only PBQ feedback gaps | 7 | 0 closed | 7 | 7 |

All395 MCQs remain reviewed pending independent/owner approval with full feedback. The483 local-bank denominator excludes two private alternatives, nine starters and two guest demos. The29 remaining question rows comprise **23 unsupported-grammar rows and six supported deferrals: the four candidates above plus prior p009/p074**. The36 remaining feedback bundles comprise these29 plus seven older question-only gaps. Their exact IDs, namespaces, revisions and statuses are in remainingBankQuestions/remainingBankFeedback; no unsupported or hidden row is silently removed from coverage.

| Objective | Broad records | Prior pending | New questions | New feedback | Combined pending | Remaining local / private |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${Object.entries(objectiveCoverage).map(([code,v])=>'| '+code+' | '+v.denominator.broadCandidates+' | '+v.denominator.allPacketPriorDispositions+' | '+v.denominator.newQuestionDispositions+' | '+v.denominator.newFeedbackDispositions+' | '+v.denominator.combinedAgentDispositions+' | '+v.denominator.remainingLocal+' / '+v.denominator.remainingPrivateMetadataOnly+' |').join('\n')}

Across these eight catalogues: **1179 summed memberships**, **${memberships.size} distinct records**, **${sharedObjectiveRecords.length} shared records**. Each new disposition belongs to one objective catalogue. All duplicate/shared records add no extra global credit. Exact objective row revisions, statuses, remaining IDs and kind counts are in the packet.

${Object.entries(objectiveCoverage).map(([code,v])=>'**'+code+'** prior kinds: '+JSON.stringify(v.denominator.priorByKind)+'. Remaining kinds: '+JSON.stringify(v.denominator.remainingByKind)+'.').join('\n\n')}

Unaffected progress remains4.3 **59/86** (27 local remaining),4.5 **67/169** (102 local),4.6 **97/151** (54 local),2.4 **97/199** (102 local),4.8 **53/130** (77 local),3.3 **35/164** (129 local),3.4 **35/176** (141 local),5.2 **66/141** (73 local+2 private),4.4 **36/120** (84 local). Observed objective memberships are inventory context, not canonical scope approval.

## Seven qualified question and complete-feedback judgments

${credited.map(s=>'**'+s.q.id+' — '+meanings[s.q.id].family+'.** '+meanings[s.q.id].meaning+'\n\nMain teaching judgment: '+meanings[s.q.id].main+'\n\n'+meanings[s.q.id].hold+'\n\n'+(s.q.type==='ORDERING'?'Placement contrasts in current item order; review prose, not learner edits:':'Wrong-choice contrasts in current wrong-choice order; review prose, not learner edits:')+'\n\n'+meanings[s.q.id].contrasts.map((t,j)=>(j+1)+'. '+t).join('\n')).join('\n\n')}

The credited judgments address one narrow event/owner/policy/permission/document decision or one supplied work-package order. p016's two failed tasks share one explicitly stipulated owner; p078 is one complete action-vector comparison, not independently scored rule components; p023 interprets one read-bit exposure without executing a hardening step. Distinct diagnosis-plus-remediation or root-plus-additional-layer targets in the deferred questions remain unapproved. p042's C2 wording and p023's any-user-readable wording are explicit unresolved teaching holds, not silently endorsed or corrected learner content.

## Source and teaching bindings

All11 candidates have authored sources equal to their preeditorial rows, with **zero selected imports, snapshots or captures**. Effective/local-published source and feedback fingerprints are verified through the existing source-bound helper and actual pure publication pipeline. No selected snapshot replay is claimed. Source checks independently fingerprint PBQ question/scenario, choices/items, log/config/diagram/code/answer/hints, grading key, all teaching, objective/domain/difficulty; MCQ structural flags alone do not prove PBQ stability.

Each row binds its authored declaration plus applicable editorial patch headers and final concise teaching. Citation line anchors are fingerprints, while whole source-file hashes and the full record revision bind their actual contents. Effective source is the pipeline combination, not a claim that a patch header alone defines the entire row.

| Candidate | Authored declaration | Effective editorial / concise teaching sources |
| --- | --- | --- |
${sourceChecks.map(r=>'| '+r.recordId+' | '+r.sourceCitations.filter(x=>x.path==='src/App.jsx').map(x=>x.path+':'+x.line).join(', ')+' | '+r.sourceCitations.filter(x=>x.path!=='src/App.jsx').map(x=>x.path+':'+x.line).join(', ')+' |').join('\n')}

All seven credited main explanations change. Six choice keys remain numerically unchanged, but p078's former binary question becomes a four-option full-vector task; five of six choice sets change, with p023's choices retained. All **24 credited option teaching bodies** bind current options/main/wrong sources. Of **18 wrong corrections**, **11 change,3 are newly supplied,4 are retained**. Retained corrections receive the qualified semantic judgment above rather than being skipped. p038's six labels and key are retained and it gains **six item teaching bodies**. p042 objective2.1 becomes2.2; p038 authored domain4/objective4.3 becomes domain5/objective5.5. p044 hard→medium is observed, uncalibrated. Deferred p032/p047 also change hard→medium but receive zero review credit.

The four deferred choices also have all16 option bodies checked against current main/wrong fingerprints and actual offered alternatives. Their teaching remains source-inspected, **not fully reviewed or credited**. Missing evidence/combined targets cannot be cured by well-formed post-answer teaching.

| Credited PBQ | Trusted revision observed | Trusted content SHA-256 |
| --- | --- | --- |
${credited.map(s=>'| '+s.q.id+' | '+s.record.trustedRevisionId+' | '+s.record.contentSha256+' |').join('\n')}

Existing trusted revisions are observations only. New trusted/primary identities and role/concept links stay null/empty, all weights zero, human/publishing/activation approval false. All PBQ grading remains coarse whole-question.

## Actual grading, permutations and delivery

Source expressions bind **${location(wholeUnit)}** (practice whole), **${location(partsUnit)}** (practice parts), **${location(canUnit)}** (submit), **${location(examUnit)}** (exam whole), **${location(answeredUnit)}** (answered) and **${location(initUnit)}** (exam initial state). Execute only pure extracted expressions, actual current trusted compile/grade/learner projection and mock terminal callbacks. No real submit, persistence, rewards, analytics, providers, hosts, file permission command, script injection, scanner, exploitation or destructive operation runs.

Six credited choices exhaust **24 offered paths:6 correct and18 wrong**; four deferred choices exhaust **16 offered paths:4 correct and12 wrong**. Practice/exam whole and trusted binary scores agree on these40 paths, but correct grading does not create deferred semantic credit. Null starts unanswered/unsubmitable; adversarial undefined can pass the raw practice gate while remaining unanswered in exam; invalid non-null values can open legacy gates and remain wrong. UI starts null and selects valid indices; no browser exploit is demonstrated.

p038 exhausts **720 complete order permutations:1 correct,719 wrong**. Whole grading agrees across practice/exam/trusted. **454 wrong orders yield fractional legacy position ratios**, while trusted whole score0 remains. Histogram0:265,1:264,2:135,3:40,4:15,6:1. All **36 item-position pairs** (6 expected,30 wrong) bind expected-position label and teaching. These are not bespoke semantic corrections for every wrong order or six independent skill results.

| Credited PBQ | Correct / wrong response paths | Fractional wrong legacy paths | Item-position pairs | Trusted display permutations | Stable display grading paths |
| --- | --- | ---: | ---: | ---: | ---: |
${gradingChecks.map(r=>'| '+r.recordId+' | '+r.correctPaths+' / '+r.incorrectPaths+' | '+r.fractionalLegacyPaths+' | '+r.itemPositionPairings+' | '+r.displayPermutations+' | '+r.stableDisplayGradingPaths+' |').join('\n')}

Credited fixtures cover **${totals.displayPermutations} display permutations and${totals.stableDisplayGradingPaths} grading paths**. Deferred fixtures add **96 display permutations and384 grading paths** with zero credit. Combined **960 displays /1680 grading paths** preserve stable component identity. These trusted fixture permutations are not observed browser choice shuffles, independent evidence or uniform randomness. No answer/key/teaching escapes the learner projection.

Ordering initializes a shuffled full list and can submit untouched. Empty lists are unanswered/unsubmitable; a correct prefix with an extra item passes the raw legacy whole expression, while truncated/duplicate arrays can pass gates with misleading position ratios. Trusted grading rejects incomplete/extra/duplicate/unknown/mismatched values. Credited trusted negatives reject **${invalidSelections} invalid stable selections**, **${tamperedRevisions} tampered revisions** and **${duplicateDisplays} duplicate display orders**. No persisted attempt is tested.

Delivery binds **${location(simUnit)}**, **${location(examViewUnit)}**, **${location(feedbackUnit)}**, **${location(bankUnit)}** and **${location(sortableUnit)}**. p042/p016/p039 scenarios supply the stipulated premises; p044/p078 configuration and scenarios are visible in both modes. p023's scenario/question explicitly supply644, so its hidden exam terminal output is not essential for the narrow octal read-bit decision. SortableOrderList shows labels before answer, without item explanation; p038's scenario supplies this engagement's order prerequisites. Submitted accessible practice and completed expanded exam deliver all24 credited option bodies; main is carried by the correct option rather than duplicate standalone teaching. p038 practice delivers main andsix expected-position corrections/correct list; completed exam shows **main only**, without item corrections/correct list for this no-target question. Full exam ordering remediation remains held.

At **${location(terminalUnit)}**, p023/p032/p003 each pass five mock fixtures: three generic keyword inputs including a non-command substring word return one stored output, empty input does nothing, unrecognised input emits a hint. **15 mock fixtures run no shell, executable, injected script or permission command**. Typed inputs are not graded. Practice output is user-triggered and may reveal the task solution; exam hides stored output. p023 still supports only mode-bit/risk reasoning, while p032/p003 remain hidden-premise deferrals. Non-terminal hints do not appear in practice; exam stripping preserves choice/item content.

Existing practice access remains Pro/legacy p001 preview/coin unlock; none of these11 candidates is p001. Existing preview observation is inherited unchanged. Exam keeps its Pro/pass and selection/eligibility limits. No entitlement, account, renderer, learner text, live-bank precedence or mastery changes. No learner recovery, browser journey or production runtime is verified.

## Family comparisons and primary evidence

${comparisonGroups.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n')}

[AWS shared-responsibility overview](https://aws.amazon.com/compliance/shared-responsibility-model/) describes service-dependent allocation and customer guest duties for conventional EC2. Our inference supports p016's explicit agreed boundary, not all IaaS products, legal liability or verified patch outcome. [NIST firewall guide abstract](https://csrc.nist.gov/pubs/sp/800/41/r1/final) discusses traffic-control policy and selecting/testing/managing firewalls. It does not approve universal two-device superiority or actual enforcement in p044/p078. Those choices rely on the supplied requirements.

[GNU Coreutils chmod manual source](https://raw.githubusercontent.com/coreutils/coreutils/master/man/chmod.x) defines octal read/write/execute bits and separate special bits. Our inference supports p023's numeric meaning without claiming file access, successful guessing or a universal Linux shadow baseline. Full GNU/POSIX/man7 pages were unavailable in this check; the official GNU source was retrieved. The pure octal fixtures check other-read present in644 and absent in640, without touching a file.

[NIST SP800-115 abstract](https://csrc.nist.gov/pubs/sp/800/115/final) describes authorised testing processes and their benefits/limits. It does not mandate p038's exact work-package order; that order is the explicit engagement premise. No exploitation or cleanup is attempted. [OWASP XSS prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) distinguishes context-specific rendering/encoding, HTML sanitisation and supplementary CSP. Our inference explains why p032 needs its full delivered observations and why p068 still combines two target layers; this source does not grant component credit or verify an application fix.

## Preserved holds, privacy and release boundary

Bind all prior decision/qualification hashes without clearing any. Seven older question-only feedback gaps remain exact zero-credit: **p004,p011,p029,p046,p041,p043** unsupported SELECT & FILL; **p211** critical practice diagram hidden. Preserve **p089/p051** hidden LOG output, **p074** hidden SCENARIO output, **p009** ordering ambiguity, all selection/hotspots grammar holds and the preceding **p067,p079,p056** deferrals. Preserve p014 one-pair/no-two-skills, p084 mock-terminal limit, p099/p026/p048/p096 partial-position versus whole grading and limited exam corrections, p048/p211 recovery-role/taxonomy/pilot limits and p025 deletion-outcome overstatement. Earlier m305/m046/m432, m177 taxonomy, m631 validation, KEV/policy-currentness and teaching-link holds remain unresolved.

**LOCAL p003 is a separate fallback** with its own observed compiled revision and zero new review credit here. Private p003 question/feedback retain **sha256:f2eb1e715fa9fcda87ada668d7d17dfdf6b44840328d5ffeb460e3a342e502f2**; private p017 retain **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**. Both remain metadata-only/unavailable/unreviewed with null trusted identities. No private payload fetch/export/semantic comparison, private compilation, local substitution, coverage or approval transfer occurs.

Frozen ledger SHA-256: **e0ceeec3c5cc8adb94b36175954a8cefaebcb4f29f4c66aa38c400f65de3bb12**. Active package: **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**, unchanged **1878 records/435 identities/2954 decisions/489 unresolved mappings/seven primary proposals**. All25 protected files remain exact. Exports contain fingerprint/count/qualification data, no raw stems/options/keyed sequence/stable grading IDs/private payload/learner data.

Run node **${scriptPath}**, npm run **audit:content-mapping**, and git diff --check. The focused audit rejects **${negativeMutationChecks} packet mutations**, including stale source/feedback, correction swaps and parent mismatches, grading/permutation drift, duplicate or deferred credit, private substitution, erased holds, altered coverage and activation. All29 mapping tests and deterministic package reproduction are required before task-only **[skip deploy]** commit/push. Verify configured skip hook, exact HEAD=origin/main=remote, final three file SHA-256 values and preserved unrelated dirty files.

**Phase2B-5 NOT READY.** No runtime/learner-visible edit, live/shadow write, migration, activation, deployment or Phase3. Remaining questions/feedback/support/private semantics, grammar/delivery/combined-target issues, taxonomy/roles, calibration and independent/owner/release approval remain open. No browser/private/production verification is claimed.
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_RESIDUAL_SUPPORTED_PBQS_NOT_READY',newQuestions:7,newFeedback:7,deferred:deferredSelectedRows.map(r=>r.recordId),priorPackets:72,bankProgress,objectiveProgress:Object.fromEntries(Object.entries(objectiveCoverage).map(([code,v])=>[code,v.denominator])),gradingChecks,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
