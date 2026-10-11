import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-objective43-45-46-pbqs.mjs',packetPath='docs/drafts/phase-2b5-objective43-45-46-pbqs-proposals.json',reportPath='docs/phase-2b5-objective43-45-46-pbqs-review.md';
const basePath='docs/drafts/phase-2b5-objective24-48-33-pbqs-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'2cbfb6d4d6910715c0035f704fdc4a41c748789cb5e61acacae0e7c83ed5fd2e');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective45-mcqs-proposals.json','docs/drafts/phase-2b5-objective54-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-risk-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-pilot-feedback-proposals.json','docs/drafts/phase-2b5-objective51-mcqs-proposals.json','docs/drafts/phase-2b5-objective53-55-assurance-proposals.json','docs/drafts/phase-2b5-objective44-49-operations-proposals.json','docs/drafts/phase-2b5-final-local-mcqs-proposals.json','docs/drafts/phase-2b5-objective44-49-operations-pbqs-proposals.json','docs/drafts/phase-2b5-older-pbq-feedback-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);assert.equal(c.ledger.rows.filter(r=>legacyPrevious.has(r.recordId)).length,392);
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
assert.equal(inventory.length,71);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);


assert.deepEqual(inventory.filter(r=>r.path!==basePath),base.allPacketReconciliation.inventory);
assert.equal(duplicateReferences.length,22);assert.equal(supportOnlyReferences.length,7);
const ids=['p001','p020','p064','p075','p080','p086','p226','p013','p067','p070','p079','p028','p045','p056','p058','p225'];
const candidates=ids.map(id=>c.questions.get('pbq:'+id)),creditedIds=ids.filter(id=>!['p067','p079','p056'].includes(id));
const credited=candidates.filter(s=>creditedIds.includes(s.q.id));
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorBank.length,434);assert.equal(priorFeedback.length,427);
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
const terminalDeliveryChecks=credited.filter(s=>s.q.type==='TERMINAL SIM').map(s=>{
 for(const input of ['process','GET','forget']){const result=terminalProbe(s.q,input);assert.equal(result.history.length,2);assert.equal(result.history[1].type,'output');assert.equal(result.history[1].text,s.q.answer);assert.equal(result.input,'');}
 assert.equal(terminalProbe(s.q,'  ').history.length,0);const error=terminalProbe(s.q,'nonsense');assert.equal(error.history[1].type,'error');assert(error.history[1].text.includes(s.q.hint));
 return {recordId:s.record.id,keywordOutputFixtures:3,emptyInputFixtures:1,unrecognisedInputFixtures:1,storedTextRevision:sig(s.q.answer),genericSubstringMatching:true,actualShellExecuted:false,typedInputGraded:false,practiceHintVisible:true,examStoredAnswerVisible:false,visiblePremiseSufficientForQualifiedDecision:true,measuredDecision:s.q.id==='p001'?'supplied_policy_correction_choice':'clock_freshness_reasoning_not_fault_diagnosis'};
});
const app=readFileSync('src/App.jsx','utf8');assert(app.includes('const FREE_PBQ_PREVIEW_ID = "p001";'));assert(app.includes('const isFreePBQPreview = question => question?.id === FREE_PBQ_PREVIEW_ID;'));assert(bankUnit.code.includes('if(isPro||isFreePBQPreview(q)||unlockedSet.has(q.id))onStart(q)'));assert(app.includes('onStart={question=>{if(isFreePBQPreview(question))setPbqQ(question);else goToSignup();}}'));
const previewPredicate=Function('FREE_PBQ_PREVIEW_ID','return question=>question?.id===FREE_PBQ_PREVIEW_ID;')('p001');assert(previewPredicate(c.questions.get('pbq:p001').q));assert(!previewPredicate(c.questions.get('pbq:p045').q));assert(!previewPredicate(null));
const previewObservation={recordId:'pbq:p001',legacyFreePreviewObserved:true,guestPreviewSourceObserved:true,bankPreviewOrProOrCoinGateObserved:true,liveBankBeforeLocalFallbackObserved:true,accessChangeApproved:false,activated:false,browserVerified:false};
assert(exam.includes('stripPbqHintsForExam(q)'));assert(!exam.includes('q.answer'));
const nonTerminalPrefix=sim.slice(0,sim.indexOf('  const runTerminal=')),nonTerminalSuffix=sim.slice(sim.indexOf('  const simType='));assert(!nonTerminalPrefix.includes('q.answer')&&!nonTerminalSuffix.includes('q.answer'));
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
const sourceChecks=candidates.map(s=>{
 assert.equal(s.row.flags.importedSource,false);
 const snapshotOnly=['p225','p226'].includes(s.q.id);assert.equal(s.authored===null,snapshotOnly);assert.equal(s.snapshots.length,snapshotOnly?1:0);assert.equal(s.captures.length,s.snapshots.length);
 if(s.authored)assert.equal(sig(s.authored),sig(s.preQuestion));else assert.equal(sig(s.snapshots[0].payload),sig(s.preQuestion));
 let revision=null,compilerError=null;try{revision=compileRevision(s.pub,'pbq');}catch(e){compilerError=e.message;}
 assert.equal(revision?.revisionId??null,s.record.trustedRevisionId);
 if(revision){assert.equal(revision.contentSha256,s.record.contentSha256);assert.equal(revision.evidencePrecision,'coarse');}
 else assert.equal(compilerError,'Unsupported question field: selectionFeedback');
 if(s.snapshots.length){const replay=publicationPipeline().overrides(s.captures).pbqs.find(q=>q.id===s.q.id);assert.equal(sig(replay),s.record.sourceSignature);}
 const fieldRevisions=Object.fromEntries(['title','type','question','scenario','choices','items','logData','diagram','currentConfig','codeBlock','answer','hint','hotspots','correct','correctOrder','explanation','wrongFeedback','objective','ch','difficulty'].map(field=>[field+'Revisions',{authored:sig(s.authored?.[field]??null),preeditorial:sig(s.preQuestion[field]??null),effective:sig(s.q[field]??null),changedFromAuthored:s.authored===null?null:sig(s.authored[field]??null)!==sig(s.q[field]??null),changedFromPreeditorial:sig(s.preQuestion[field]??null)!==sig(s.q[field]??null)}]));
 return{recordId:s.record.id,sourceRevision:s.record.localRevisionSignature,publishedRecordSignature:s.record.sourceSignature,feedbackRevision:s.feedback.sourceSignature,revisions:s.row.revisions,sourcePriority:s.row.priorityScore,authoredAvailable:s.authored!==null,authoredEqualsPreeditorial:s.authored===null?null:sig(s.authored)===sig(s.preQuestion),selectedSnapshotCount:s.snapshots.length,selectedCaptureCount:s.captures.length,selectedImports:false,snapshotReplayChecked:s.snapshots.length>0,capturedOverrideBindings:s.row.capturedOverrides,fieldRevisions,compilerStatus:revision?'supported_local_grammar':'unsupported_grammar',compilerError,trustedRevisionObserved:revision?.revisionId??null,trustedContentSha256Observed:revision?.contentSha256??null,precisionObserved:revision?.evidencePrecision??null};
});
const meanings={
  "p001": {
    "family": "specified-service-exposure-policy-correction",
    "meaning": "Select restriction of the one remaining broadly reachable database service under the supplied verified deployment policy.",
    "main": "The supplied policy establishes the remaining MySQL source restriction; confirm the change and required connectivity.",
    "hold": "HOLD the simulated scan as real discovery, proven Internet exposure or a universal port-risk ranking. Generic terminal keywords return stored text, with no commands, hosts or rule changes executed. The scenario alone supplies the decisive reachability and verified exceptions when exam hides stored output. Unchanged scan-execution title exceeds measured policy selection. Existing free-preview access is observation only, not activation or approved entitlement reconciliation.",
    "contrasts": [
      "Restricted administration meets the stated policy; disabling it is not the remaining correction.",
      "The verified redirect is a stipulated permitted use, not a general assertion that every HTTP service is safe.",
      "The stipulated management service restriction already meets policy; a port number alone establishes neither vulnerability nor comparative urgency."
    ]
  },
  "p020": {
    "family": "specified-vulnerability-work-package-ordering",
    "meaning": "Order six explicitly supplied discovery-to-final-report work packages.",
    "main": "Validate applicability and treatment outcome; the final completion report is distinct from continuous urgent-risk communication.",
    "hold": "HOLD a universal vulnerability lifecycle, mandatory silence until the final report, CVSS-only priority, or six independent operational skills. Ordering follows this team workflow; no scanning, treatment or validation is executed. Legacy position ratios and practice item teaching do not create per-concept evidence; completed exam has main teaching only.",
    "contrasts": [
      "Validation checks the applicable issue and service, not merely successful installation.",
      "Discovery includes confirming applicability before risk-ranking a purported weakness.",
      "Final validated-outcome reporting does not postpone urgent or preliminary risk communication.",
      "Severity needs exposure, threat and business context; no numeric ranking is measured.",
      "Approved remediation and interim mitigation remain distinct and require verification.",
      "Categorisation organises confirmed findings in this specified workflow; it need not be a separate serial stage everywhere."
    ]
  },
  "p064": {
    "family": "specified-vulnerability-programme-prerequisite-ordering",
    "meaning": "Order initial inventory, authorised scanning, validated risk priorities, approved treatment and verification under the supplied programme prerequisites.",
    "main": "Scope the programme and validate findings and outcomes; repeat as conditions change.",
    "hold": "HOLD a universally complete programme, universal inventory completion before every scan, or independently assessed inventory/scanning/prioritisation skills. Supplied initial-inventory premise and authorised scan prerequisites define this exercise. No inventory, scanner, risk calculation, patch or rescan runs. Current objective/domain changes are observed, unapproved canonical alignment. Retain legacy fractional-position versus trusted whole grading and incomplete exam position teaching.",
    "contrasts": [
      "Authorised scope and cadence precede this planned collection; coverage is not proven complete.",
      "Initial inventory establishes the supplied programme scope and needs maintenance.",
      "Treat validated priorities through approval and change processes; no deployed fix is observed.",
      "Threat, exposure and business context supplement severity; no KEV deadline or scoring model is approved.",
      "Verify security and service effectiveness; an installer success message is insufficient."
    ]
  },
  "p075": {
    "family": "specified-secure-development-gate-ordering",
    "meaning": "Order five development checks under explicit coding, merge, running-staging and final-test gates.",
    "main": "Security checks recur; static analysis need not stop at uncompiled source, and this sequence is illustrative.",
    "hold": "HOLD a universal SAST-review-DAST-penetration-test order, historical cost multipliers, or completed code analysis/testing. This scenario supplies the otherwise non-universal release gates; no source, pipeline, runtime target or penetration test is exercised. Compare early-integration recognition without independent operational skills, canonical objective approval or mastery. Retain incomplete exam position teaching and coarse whole score.",
    "contrasts": [
      "Final authorised testing follows running-build checks only under this stipulated release gate.",
      "Requirements and threat modelling guide implementation and can recur later.",
      "Static checks can assess source, bytecode or binaries without black-box execution; no universal pre-compilation guarantee.",
      "Dynamic checks need an executable target here; different pipelines can overlap checks.",
      "Peer review gates this merge but is not universally subsequent to all static analysis."
    ]
  },
  "p080": {
    "family": "contextual_vulnerability_remediation_priority",
    "meaning": "Choose the immediate treatment plan for a validated reachable actively exploited production flaw with an available approved fix.",
    "main": "Prioritise the supplied high exposure and exploitation context with verified temporary protection, emergency change and follow-up validation; track other findings.",
    "hold": "HOLD illustrative findings as live CVE advice, current vendor fixes, specific KEV deadlines or universal WAF prevention. Earlier historical CVE/version/severity/virtual-patch teaching remains superseded and held through source hashes. A generic LOG format does not make this executed SCA analysis. The combined plan is one decision, not independent vulnerability ranking and control execution.",
    "contrasts": [
      "Convenience alone does not outweigh the stipulated exposed exploitation risk.",
      "Lifecycle risk needs tracking, but does not outrank this confirmed immediate risk solely because maintenance ceased.",
      "Test downtime tolerance affects scheduling and does not automatically outrank the supplied exposed production finding."
    ]
  },
  "p086": {
    "family": "specified-emergency-patch-work-package-ordering",
    "meaning": "Order five emergency work packages using the supplied affected-asset, temporary-restriction, testing, plan-confirmation and deployment procedure.",
    "main": "Verify interim controls and final remediation/service health; keep communication and any incident containment running in parallel.",
    "hold": "HOLD this procedure as universal, a KEV listing as proof this host is compromised, one mandatory waiting window, or WAF/temporary controls as guaranteed exploitation prevention. No current directive deadline, active private advisory, actual patch, rollback or outcome is verified. Installation success is not validated remediation. Ordering and position ratios do not establish five independent skills; exam lacks item corrections.",
    "contrasts": [
      "Deployment includes post-change security and service checks in this work package.",
      "Identify applicable assets and exposure; a version alone need not prove exploitability.",
      "Staging checks and rollback reduce but do not eliminate production risk.",
      "Apply approved temporary restrictions and verify effectiveness; not every exploit traverses a WAF.",
      "Confirm this deployment plan without delaying prior warning, safety action or required incident coordination."
    ]
  },
  "p226": {
    "family": "security-assessment-content-standard-recognition",
    "meaning": "Recognise the standards suite for machine-readable configuration and vulnerability-assessment content under the narrowed scenario.",
    "main": "SCAP supplies interoperable assessment specifications; version, supported content and processing compatibility require validation.",
    "hold": "HOLD a standards-name choice as implemented interoperability, universal native tool integration, automatic remediation or a full business-risk calculation. Current snapshot-only source narrows earlier mixed threat-intelligence and configuration interoperability claims. No private payload fetch or substitute authored source; captured publication precedence is replayed locally. Acronym tags are observations, not approved concept roles.",
    "contrasts": [
      "Threat-intelligence expression/transport is not the specified assessment check content.",
      "Workflow orchestration does not replace the requested content specifications.",
      "Security-event normalisation is a different goal from defining these configuration assessment checks."
    ]
  },
  "p013": {
    "family": "specified-first-match-inbound-policy-selection",
    "meaning": "Select one complete simplified first-match inbound ruleset satisfying public web access, restricted SSH and final default deny.",
    "main": "Permits must precede final deny under the supplied first-match semantics, with return traffic handled separately.",
    "hold": "HOLD actual firewall editing, syntax/platform validation, tested packets, universal first-match firewall behaviour or separate service/source/order skills. Management is the stipulated subnet, not ANY. Defence in depth does not universally require a firewall to be the first layer. Current hard-to-medium difficulty is an uncalibrated observed change; no approval of scope or weights.",
    "contrasts": [
      "Restricting required public web traffic to management fails the business requirement.",
      "Any-source SSH exceeds the stated allowed source set.",
      "First-match deny shadows later permits in this simplified ruleset; it is not a universal platform rule-order claim."
    ]
  },
  "p070": {
    "family": "specified-host-service-source-policy-selection",
    "meaning": "Select the effective RDP source/service/default policy under the explicit no-overlapping-rule premise.",
    "main": "Restrict source and service and verify rule semantics and reachability for the stated policy.",
    "hold": "HOLD actual Windows commands/configuration, platform rule precedence, demonstrated Internet reachability or implemented RDP security. Any-source does not prove upstream public reachability. No overlapping rules is a premise, not observed host state. Extra domain-controller ingress is not justified by a generic need for domain communication. Outbound allow is the scenario requirement, not a universally recommended policy. Compare p013 without equating host and network rule evaluation.",
    "contrasts": [
      "Any-source RDP exceeds the requested management subnet even if upstream reachability is unknown.",
      "All ports from management exceeds the sole required inbound service.",
      "The additional subnet-wide ingress exception violates the specified unsolicited inbound deny; domain membership alone does not authorise it."
    ]
  },
  "p028": {
    "family": "specified-password-policy-bundle-selection",
    "meaning": "Choose the single offered password-policy bundle matching long values, compromised-value screening, rate limiting and MFA without arbitrary periodic resets.",
    "main": "Apply scoped password-verifier requirements, storage and guessing controls; the question selects a requirements match.",
    "hold": "HOLD a full compliant IAM deployment, universal numeric password length/lockout thresholds, unconditional no-reset policy or independently graded MFA/storage/screening skills. Current teaching removes earlier fixed five-attempt and universal 15-character-with-MFA claims. NIST single-factor versus MFA password minima differ; compromise-driven change remains required in its scope. Password factors remain non-phishing-resistant. No account/policy is changed or tested.",
    "contrasts": [
      "Frequent forced resets do not satisfy the supplied long-password policy.",
      "Composition alone omits required compromised-value screening and other controls.",
      "MFA does not remove safeguards for a password factor that is still accepted."
    ]
  },
  "p045": {
    "family": "kerberos-timestamp-replay-protection-reasoning",
    "meaning": "Select why synchronised clocks support Kerberos timestamp freshness alongside replay detection.",
    "main": "Configured skew bounds freshness; replay protection can reject duplicate authenticators within that tolerance.",
    "hold": "HOLD a performed time-skew diagnosis, real terminal or actual clock repair. Practice mock output contains the diagnostic; exam hides it, but the why-question is independently answerable from the explicit clock-synchronisation premise and alternatives. Do not claim delivered numeric fault evidence in exam. Five minutes is the supplied configuration/example, not universal protocol law or a safe authenticator-reuse window. Replay-cache or suitable application replay protection and cryptographic validation remain necessary; title overstates actual execution.",
    "contrasts": [
      "Synchronisation does not redefine every ticket lifetime.",
      "Time checks do not replace ticket/authenticator cryptographic verification.",
      "Being within allowed skew does not authorise replay of an already-used authenticator."
    ]
  },
  "p058": {
    "family": "compromised-password-screening-purpose-selection",
    "meaning": "Identify the control that checks proposed passwords against known compromised values.",
    "main": "Blocklist screening is the asked improvement and does not endorse the rest of the example policy.",
    "hold": "HOLD proof the takeover used a breached password, universal 12-character sufficiency, secure question-based recovery, arbitrary rotation or composition requirements. Compare p028 screening support without granting full-policy compliance or implementation evidence. No passwords, breach corpus, real users, policy changes or guessing outcomes are accessed. The operational-looking CONFIG label still assesses control-purpose selection.",
    "contrasts": [
      "A compromised value may meet a length threshold; length is a distinct control.",
      "Account history is not screening against the wider set of compromised values.",
      "Composition-compliant values may already be compromised."
    ]
  },
  "p225": {
    "family": "specified-XML-federation-delegation-pair-recognition",
    "meaning": "Select one paired protocol choice for signed XML federation and separate scoped API delegation.",
    "main": "SAML fits the explicit XML assertion requirement; OAuth is delegated authorisation, with issuer/audience/protocol protection validation required.",
    "hold": "HOLD two independent assessed skills from one paired key, actual federation/API integration or a universal SAML-only SSO preference. The snapshot-only current scenario narrows older ambiguous enterprise SSO branding. OIDC can supply sign-in; OAuth alone is not an identity assertion. Scoped tokens are not automatically revocable at every resource server: lifecycle, audience, replay, client and revocation propagation require design and verification. No end-to-end compatibility or token revocation is exercised.",
    "contrasts": [
      "OIDC sign-in does not meet the explicit SAML XML premise; SAML is not the requested OAuth-style delegation flow.",
      "Directory queries and Kerberos authentication do not provide the requested combined federation/delegation specifications.",
      "OAuth alone is not the requested sign-in assertion; WebAuthn is not calendar API delegation."
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
assert.equal(gradingChecks.reduce((n,x)=>n+x.fractionalLegacyPaths,0),679);
assert.equal(teachingChecks.reduce((n,x)=>n+x.newItemCorrections,0),21);assert.equal(teachingChecks.reduce((n,x)=>n+x.changedWrongCorrections,0),15);assert.equal(teachingChecks.reduce((n,x)=>n+x.newWrongCorrections,0),12);
const preservedRecentSemanticDeferrals=base.deferredSelectedRows;assert.equal(preservedRecentSemanticDeferrals.length,6);for(const r of preservedRecentSemanticDeferrals){assert.equal(r.newQuestionCredit,0);assert.equal(r.newFeedbackCredit,0);assert(!c.previous.has(r.recordId));assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);}
const preservedRecentGradingDeliveryHolds=base.questionProposals.filter(r=>['pbq:p084','pbq:p099'].includes(r.recordId)).map(r=>({recordId:r.recordId,priorDispositionRevision:sig(r),qualificationRevision:sig(r.contentQualification),resolved:false}));assert.equal(preservedRecentGradingDeliveryHolds.length,2);
const questionProposals=credited.map(s=>({recordId:s.record.id,questionId:s.q.id,kind:'pbq',sourceRevision:s.record.localRevisionSignature,publishedRecordSignature:s.record.sourceSignature,revisions:s.row.revisions,trustedRevisionObserved:s.record.trustedRevisionId,trustedContentSha256Observed:s.record.contentSha256,sourceInspectionRevision:sig(sourceChecks.find(r=>r.recordId===s.record.id)),assessedUnderstanding:meanings[s.q.id].meaning,contentQualification:meanings[s.q.id].hold,familyLabelProposal:meanings[s.q.id].family,familyStatus:'provisional_comparison_no_independence_approval',precisionObserved:'coarse',difficultyObserved:s.q.difficulty,difficultyDisposition:'source_label_uncalibrated',objectiveScopeProposal:null,skillRoleProposal:null,primaryConceptProposal:null,secondaryConceptProposals:[],assessedCanonicalRoleProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,partialWeightsAllowed:false,partialConceptWeights:[],componentMasteryApproved:false}));
const explanationProposals=credited.map((s,i)=>({recordId:s.feedback.id,kind:'explanation_bundle',parentId:s.record.id,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:s.record.localRevisionSignature,parentPublishedRevision:s.record.sourceSignature,parentTrustedRevisionObserved:s.record.trustedRevisionId,parentDispositionStatus:'new_complete_question_and_feedback_judgment',familyLabelProposal:meanings[s.q.id].family,mainTeachingUnderstanding:meanings[s.q.id].main,contentQualification:meanings[s.q.id].hold,mainCorrectionRevision:teachingChecks[i].mainRevision,teachingBindings:teachingChecks[i].teachingBindings,distractorOrPlacementCorrections:teachingChecks[i].contrasts,deliveryGate:teachingChecks[i].deliveryGate,mainStandalonePanel:teachingChecks[i].mainStandalonePanel,mainDeliveredViaCorrectOption:teachingChecks[i].mainDeliveredViaCorrectOption,objectiveScopeProposal:null,roleProposal:null,primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false}));
const deferredReasons=Object.fromEntries(['p067','p079','p056'].map(id=>[id,'SELECT & FILL is unsupported: selectionFeedback is an unknown field and the component grammar is not installed. Do not strip grading-bearing fields to manufacture another revision; no question or full-feedback credit.']));
const deferredSelectedRows=candidates.filter(s=>!creditedIds.includes(s.q.id)).map(s=>({recordId:s.record.id,feedbackRecordId:s.feedback.id,sourceRevision:s.record.localRevisionSignature,publishedRecordSignature:s.record.sourceSignature,feedbackRevision:s.feedback.sourceSignature,trustedRevisionObserved:s.record.trustedRevisionId,reason:deferredReasons[s.q.id],newQuestionCredit:0,newFeedbackCredit:0,semanticsFullyReviewed:false,sourcePayloadExported:false}));assert.equal(deferredSelectedRows.length,3);
const comparisonSpecs=[
 {ids:['pbq:p001','pbq:p013','pbq:p070'],meaning:'Policy/source/service matching across exposure, simplified first-match network rules and no-overlap host policy. Different rule assumptions do not establish independent operational implementation skills.'},
 {ids:['pbq:p080','mcq:m023'],meaning:'Reuse contextual vulnerability priority family; a richer supplied emergency plan does not demonstrate live SCA analysis, treatment or separate control skill.'},
 {ids:['pbq:p020','pbq:p064','pbq:p086','mcq:m071','pbq:p099'],meaning:'Supplied workflow/prerequisite ordering differs from choosing post-patch verification and phishing work packages. Preserve urgent communication, outcome verification, partial-position and incomplete exam teaching holds.'},
 {ids:['pbq:p075','mcq:m322'],meaning:'Explicit release gates narrow otherwise overlapping checks; compare early-integration recognition without universal gate order, savings, executed pipeline or canonical objective approval.'},
 {ids:['pbq:p028','pbq:p058'],meaning:'Whole requirements-bundle selection and narrow compromised-value screening overlap in one control purpose; neither proves deployed policy, takeover mechanism or full compliance.'},
 {ids:['pbq:p045','mcq:m120'],meaning:'Clock/replay reasoning differs from Kerberos architecture naming, but a terminal label does not create clock diagnosis, cache test or command-execution evidence.'},
 {ids:['pbq:p225','mcq:m217','pbq:p014'],meaning:'The single paired key combines XML federation and API delegation; preserve assertion validation and the earlier single-pair no-two-skills hold.'},
 {ids:['pbq:p226'],meaning:'Assessment-content standards recognition is not tool interoperability, assessment execution or automatic remediation.'}
];
const comparisonGroups=comparisonSpecs.map(g=>({recordIds:g.ids,comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get(id),p=c.previous.get(id);assert(s);return{recordId:id,sourceRevision:s.record.sourceSignature,localRevision:s.record.localRevisionSignature,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
assert.equal(c.previous.get('mcq:m023').row.familyLabelProposal,meanings.p080.family);
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId));assert.equal(selectedIds.size,26);
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(kind=>[kind,rows.filter(r=>r.kind===kind).length]));
const objectiveCoverage={};
for(const [code,total,priorCount,newCount]of [['4.3',86,45,14],['4.5',169,63,4],['4.6',151,89,8]]){
 const broad=c.pkg.records.filter(r=>r.objectiveCodes.includes(code)),prior=broad.filter(r=>c.previous.has(r.id)),fresh=broad.filter(r=>selectedIds.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id));
 assert.equal(broad.length,total);assert.equal(prior.length,priorCount);assert.equal(fresh.length,newCount);
 objectiveCoverage[code]={denominator:{broadCandidates:total,allPacketPriorDispositions:priorCount,priorByKind:counts(prior),newQuestionDispositions:fresh.filter(r=>r.kind==='pbq').length,newFeedbackDispositions:fresh.filter(r=>r.kind==='explanation_bundle').length,combinedAgentDispositions:priorCount+newCount,remaining:remaining.length,remainingLocal:remaining.filter(r=>!r.id.startsWith('private:')).length,remainingPrivateMetadataOnly:remaining.filter(r=>r.id.startsWith('private:')).length,remainingByKind:counts(remaining)},census:broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:r.id.startsWith('private:')?'unavailable_private_semantics_not_reviewed':c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'})),remainingRecordIds:remaining.map(r=>r.id)};
}
const memberships=new Map();for(const [code,v]of Object.entries(objectiveCoverage))for(const r of v.census)memberships.set(r.recordId,[...(memberships.get(r.recordId)||[]),code]);
const sharedObjectiveRecords=[...memberships].filter(([id,codes])=>codes.length>1).map(([recordId,objectiveCodesObserved])=>({recordId,objectiveCodesObserved}));assert([...selectedIds].every(id=>memberships.get(id).length===1));
const combinedQuestions=new Set([...priorBank.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=c.ledger.rows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,allPacketPriorQuestions:434,newQuestions:13,allPacketCombinedQuestions:combinedQuestions.size,combinedMcqs:395,combinedLocalPbqs:combinedQuestions.size-395,remainingQuestionDispositions:483-combinedQuestions.size,priorFullFeedback:427,priorLocalPbqFullFeedback:32,newFeedbackBundles:13,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,pairedMcqs:paired.filter(r=>r.kind==='mcq').length,pairedLocalPbqs:paired.filter(r=>r.kind==='pbq').length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.allPacketCombinedQuestions,447);assert.equal(bankProgress.fullFeedbackCombined,440);assert.equal(bankProgress.completeQuestionFeedbackPairs,440);assert.equal(bankProgress.pairedLocalPbqs,45);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,7);
for(const id of ['private:pbq:p003','private:explanation:pbq:p003','private:pbq:p017','private:explanation:pbq:p017']){const r=c.records.get(id);assert(r);assert.equal(r.trustedRevisionId,null);assert(!selectedIds.has(id)&&!c.previous.has(id));}
assert.equal(c.records.get('private:pbq:p003').sourceSignature,'sha256:f2eb1e715fa9fcda87ada668d7d17dfdf6b44840328d5ffeb460e3a342e502f2');assert.equal(c.records.get('private:pbq:p017').sourceSignature,'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42');
const preservedOlderFeedbackDeferrals=base.preservedOlderFeedbackDeferrals;assert.equal(preservedOlderFeedbackDeferrals.length,7);assert.deepEqual(preservedOlderFeedbackDeferrals.map(r=>r.parentId),['pbq:p004','pbq:p211','pbq:p011','pbq:p029','pbq:p046','pbq:p041','pbq:p043']);for(const r of preservedOlderFeedbackDeferrals){assert.equal(r.newFeedbackCredit,0);assert(!selectedIds.has(r.recordId));assert.equal(r.sourceRevision,c.records.get(r.recordId).sourceSignature);}
const priorHoldBindings=[...c.previous].filter(([id,p])=>p.row.contentQualification||p.row.taxonomyBlocker).map(([recordId,p])=>({recordId,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),qualificationRevision:sig(p.row.contentQualification??null),taxonomyBlockerRevision:sig(p.row.taxonomyBlocker??null),resolved:false}));
const p014=c.previous.get('pbq:p014');assert.equal(p014.row.numberOfKeyedDecisions,1);assert.equal(p014.row.partialWeightsAllowed,false);
const preservedSinglePairHold={recordId:'pbq:p014',priorPacketPath:p014.path,priorDispositionRevision:sig(p014.row),qualificationRevision:sig(p014.row.contentQualification),numberOfKeyedDecisions:1,partialWeightsAllowed:false,twoIndependentSkillsApproved:false,resolved:false};
const hiddenEvidenceReleaseHolds=base.hiddenEvidenceReleaseHolds;assert.equal(hiddenEvidenceReleaseHolds.length,2);for(const r of hiddenEvidenceReleaseHolds){assert.equal(r.priorDispositionRevision,sig(c.previous.get(r.recordId).row));assert.equal(r.storedEvidenceRendered,false);assert.equal(r.resolved,false);}
const recoveryRoleBindings=['pbq:p048','pbq:p211'].map(recordId=>{const p=c.previous.get(recordId);return{recordId,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),rationaleRevision:sig(p.row.rationale),taxonomyBlockerRevision:sig(p.row.taxonomyBlocker??null),existingPilotMappingRevision:sig(p.row.existingPilotMapping??null),masteryWeight:0,rolesPromoted:false,resolved:false};});
const sourceBindings=[...new Map([...base.sourceBindings,...inventory.map(r=>({path:r.path,sha256:r.sha256})),...[basePath,scriptPath,'server/adaptive/revision.mjs','src/lib/learningPersistenceContracts.js','scripts/lib/content-mapping/delivery-inventory.mjs','scripts/lib/content-mapping/publication.mjs'].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];verifySourceBindings(sourceBindings);
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'67d4de5bc0e0428eea68ac04c9140c390f564148',sourceBindings,selectionPolicy:'Sixteen explicit local operations candidates; complete source/grammar/delivery/semantic preflight before paired question-feedback credit; adapt down to thirteen',triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),inventoryOnly:true,legacyTrackedPriorQuestions:392},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences},candidateQuestionRecordIds:candidates.map(s=>s.record.id),selectedQuestionRecordIds:questionProposals.map(r=>r.recordId),selectedFeedbackRecordIds:explanationProposals.map(r=>r.recordId),sourceChecks,gradingChecks,teachingChecks,gradingSourceBindings:units.map(u=>u.provenance),questionProposals,explanationProposals,instructionalProposals:[],deferredSelectedRows,comparisonGroups,terminalDeliveryChecks,previewObservation,preservedRecentSemanticDeferrals,preservedRecentGradingDeliveryHolds,objectiveCoverage,sharedObjectiveRecords,distinctAffectedCatalogueRecords:memberships.size,sharedRecordsCreateNoAdditionalGlobalCredit:true,bankProgress,priorHolds:{sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHoldsRevision:sig(base.priorHolds),bindings:priorHoldBindings,earlierHoldsResolved:false},earliestHoldBindings:base.earliestHoldBindings,preservedKevTeachingHolds:base.preservedKevTeachingHolds,pilotBoundary:base.pilotBoundary,preservedPilotFeedbackLinkReconciliation:base.preservedPilotFeedbackLinkReconciliation,privateBoundary:base.privateBoundary,hiddenEvidenceReleaseHolds,preservedSinglePairHold,recoveryRoleBindings,preservedOlderFeedbackDeferrals,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},trustedInvalidSelectionsRejected:invalidSelections,tamperedRevisionsRejected:tamperedRevisions,duplicateDisplaysRejected:duplicateDisplays,tooltipDeliveryObserved:false,learnerRuntimeObserved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,canonicalScopeRolesSkillsWeightsTeachingApproved:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
let completedNegativeChecks;
function validate(value){assertSafeReviewExport(value);assert(!/"(?:correctOrder|componentId|valueId|authoredId|correctAnswer|selectedComponents|items|blanks)"\s*:/.test(JSON.stringify(value)));const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);}
validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const value=structuredClone(packet);mutate(value);assert.notDeepEqual(value,packet);assert.throws(()=>validate(value));negativeMutationChecks++;};
for(let i=0;i<candidates.length;i++){for(const field of ['sourceRevision','publishedRecordSignature','feedbackRevision','trustedRevisionObserved','compilerStatus'])reject(p=>p.sourceChecks[i][field]='stale');reject(p=>p.sourceChecks[i].revisions.authored='invented');}
for(let i=0;i<credited.length;i++){for(const field of ['sourceRevision','publishedRecordSignature','contentQualification','familyLabelProposal','sourceInspectionRevision'])reject(p=>p.questionProposals[i][field]='stale');reject(p=>p.questionProposals[i].primaryConceptProposal='invented');reject(p=>p.questionProposals[i].partialWeightsAllowed=true);reject(p=>p.questionProposals[i].humanApproved=true);reject(p=>p.questionProposals[i].newFamilyCredit=1);reject(p=>p.gradingChecks[i].componentMasteryApproved=true);reject(p=>p.gradingChecks[i].precision='direct');for(const field of ['sourceRevision','parentLocalRevision','parentPublishedRevision','contentQualification','deliveryGate'])reject(p=>p.explanationProposals[i][field]='stale');reject(p=>p.explanationProposals[i].masteryWeight=1);reject(p=>p.explanationProposals[i].approvedRemediation=true);reject(p=>p.explanationProposals[i].parentId=p.explanationProposals[(i+1)%credited.length].parentId);reject(p=>{const xs=p.explanationProposals[i].teachingBindings;[xs[0],xs[1]]=[xs[1],xs[0]];});reject(p=>{const xs=p.explanationProposals[i].distractorOrPlacementCorrections;[xs[0],xs[1]]=[xs[1],xs[0]];});for(let j=0;j<teachingChecks[i].teachingBindings.length;j++)reject(p=>p.explanationProposals[i].teachingBindings[j].teachingRevision='stale');for(let j=0;j<teachingChecks[i].contrasts.length;j++){reject(p=>p.explanationProposals[i].distractorOrPlacementCorrections[j].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorOrPlacementCorrections[j].assessedSecondary=true);}}
for(let i=0;i<priorHoldBindings.length;i++)reject(p=>p.priorHolds.bindings[i].resolved=true);
for(let i=0;i<7;i++)reject(p=>p.preservedOlderFeedbackDeferrals[i].newFeedbackCredit=1);
for(let i=0;i<2;i++){reject(p=>p.hiddenEvidenceReleaseHolds[i].storedEvidenceRendered=true);reject(p=>p.recoveryRoleBindings[i].rolesPromoted=true);}
for(const code of Object.keys(objectiveCoverage)){reject(p=>p.objectiveCoverage[code].denominator.newQuestionDispositions=99);reject(p=>p.objectiveCoverage[code].census.pop());reject(p=>p.objectiveCoverage[code].remainingRecordIds.pop());}
for(let i=0;i<3;i++){reject(p=>p.deferredSelectedRows[i].newQuestionCredit=1);reject(p=>p.deferredSelectedRows[i].newFeedbackCredit=1);reject(p=>p.deferredSelectedRows[i].reason='');}
for(let i=0;i<6;i++){reject(p=>p.preservedRecentSemanticDeferrals[i].newQuestionCredit=1);reject(p=>p.preservedRecentSemanticDeferrals[i].newFeedbackCredit=1);}
for(let i=0;i<2;i++){reject(p=>p.terminalDeliveryChecks[i].actualShellExecuted=true);reject(p=>p.terminalDeliveryChecks[i].typedInputGraded=true);reject(p=>p.preservedRecentGradingDeliveryHolds[i].resolved=true);}
reject(p=>p.previewObservation.activated=true);reject(p=>p.previewObservation.accessChangeApproved=true);
reject(p=>p.questionProposals.push(p.questionProposals[0]));reject(p=>p.explanationProposals.push(p.explanationProposals[0]));reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.pilotBoundary.roleWeightTeachingPublicationApprovalTransferred=true);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=483);reject(p=>p.preservedSinglePairHold.twoIndependentSkillsApproved=true);reject(p=>p.earliestHoldBindings=null);reject(p=>p.preservedKevTeachingHolds[0].currentDeadlineOrDirectiveRequirementsResolved=true);reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const key of ['q','options','correct','gradingKey','payload','learnerId'])reject(p=>p[key]='forbidden');
completedNegativeChecks=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const location=u=>'src/App.jsx:'+u.provenance.startLine;
const totals=gradingChecks.reduce((a,r)=>{for(const k of ['correctPaths','incorrectPaths','fractionalLegacyPaths','itemPositionPairings','displayPermutations','stableDisplayGradingPaths'])a[k]=(a[k]||0)+r[k];return a;},{});
const sourceCounts={authored:sourceChecks.filter(r=>r.authoredAvailable).length,snapshots:sourceChecks.reduce((n,r)=>n+r.selectedSnapshotCount,0),captures:sourceChecks.reduce((n,r)=>n+r.selectedCaptureCount,0)};
const report=`# Phase 2B-5 — local operations PBQ review (4.3 / 4.5 / 4.6)

**NOT READY.** Review date: **11 October 2026**. Baseline: **${packet.baselineCommit}**. Draft packet SHA-256: **${hashFile(packetPath)}**. Finite LOCAL/default-off/unwired/learner-invisible slice. Only this report, its draft packet and focused audit change.

## Authority and candidate preflight

The master plan and Phase 1 audit were read in full earlier in this continuing session. Approved product decisions follow the master plan; verified historical implementation follows the audit. Current source was rechecked. No unresolved authority conflict affects these draft judgments. Canonical objective scope, concepts, roles, difficulty, independence, weights, teaching publication and mastery remain unapproved.

Preflight all **16** candidates: **4.3 p001,p020,p064,p075,p080,p086,p226; 4.5 p013,p067,p070,p079; 4.6 p028,p045,p056,p058,p225**. Candidate status is not credit. Credit only **13 complete distinct question judgments and 13 separate full-feedback judgments**, pending independent and owner review: **${creditedIds.join(', ')}**.

| Deferred candidate | Reason | New question / feedback credit |
| --- | --- | --- |
${deferredSelectedRows.map(r=>'| '+r.recordId+' | '+r.reason+' | 0 / 0 |').join('\n')}

p067 is email-protocol selection; p079 is endpoint-control matching; p056 is access-model matching. Current editorial selection teaching does not install trusted component grammar. All retain null trusted revisions. Do not remove selectionFeedback, blanks, targets or mappings to manufacture a supported revision. No hidden, unsupported, ambiguous, unavailable-private or already-credited unit gains credit.

## Reconciliation and progress

Reconcile **71 prior substantive packets**, **42 older distinct question judgments (30 MCQs +12 PBQs)**, **22 duplicate references** and **seven support/link-only references**. Every current question/full-feedback judgment is deduplicated by record identity and bound exact revision. Older support links do not become full feedback. The frozen triage ledger is unchanged.

| Local bank coverage | Prior | New | Combined | Remaining |
| --- | ---: | ---: | ---: | ---: |
| Question judgments | 434 | 13 | 447/483 | 36 |
| PBQ question judgments | 39 | 13 | 52/88 | 36 |
| Full feedback / complete pairs | 427 | 13 | 440/483 | 43 |
| PBQ full feedback / complete pairs | 32 | 13 | 45/88 | 43 |
| Older question-only PBQ feedback gaps | 7 | 0 closed | 7 | 7 |

All395 MCQs retain pending question and full-feedback judgments. The483 local-bank denominator excludes two private alternative assessments, nine starters and two guest demos. These totals are review coverage, not content activation, owner approval, skill independence or learner mastery.

| Objective | Broad records | Prior pending | New questions | New feedback | Combined pending | Remaining local / private |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${Object.entries(objectiveCoverage).map(([code,v])=>'| '+code+' | '+v.denominator.broadCandidates+' | '+v.denominator.allPacketPriorDispositions+' | '+v.denominator.newQuestionDispositions+' | '+v.denominator.newFeedbackDispositions+' | '+v.denominator.combinedAgentDispositions+' | '+v.denominator.remainingLocal+' / '+v.denominator.remainingPrivateMetadataOnly+' |').join('\n')}

Across these catalogues: **406 summed memberships**, **${memberships.size} distinct records**, **${sharedObjectiveRecords.length} shared records**. Shared memberships create no extra global credit. Each new judgment belongs to one catalogue. Exact remaining IDs, source hashes, statuses and kind counts are in the packet.

${Object.entries(objectiveCoverage).map(([code,v])=>'**'+code+'** prior kinds: '+JSON.stringify(v.denominator.priorByKind)+'. Remaining kinds: '+JSON.stringify(v.denominator.remainingByKind)+'.').join('\n\n')}

Unaffected prior progress:2.4 **97/199** (102 local remaining),4.8 **53/130** (77 local),3.3 **35/164** (129 local),3.4 **35/176** (141 local),5.2 **66/141** (73 local+2 private),4.4 **36/120** (84 local),4.9 **20/96** (74 local+2 private). No copied objective label constitutes canonical scope approval.

## Qualified question and full-feedback judgments

${credited.map(s=>'**'+s.q.id+' — '+meanings[s.q.id].family+'.** '+meanings[s.q.id].meaning+'\n\nMain teaching judgment: '+meanings[s.q.id].main+'\n\n'+meanings[s.q.id].hold+'\n\n'+(s.q.type==='ORDERING'?'Placement contrasts in current item order; review prose, not learner edits:':'Wrong-choice contrasts in current wrong-choice order; review prose, not learner edits:')+'\n\n'+meanings[s.q.id].contrasts.map((t,j)=>(j+1)+'. '+t).join('\n')).join('\n\n')}

## Source precedence and teaching bindings

All16 effective, locally published, authored-when-available and preeditorial rows plus selected captures/snapshots were inspected. **${sourceCounts.authored} authored sources** exist and all14 equal their preeditorial sources. No selected imported sources. **Two snapshots and two captures** supply p225/p226; their authored sources are absent, and snapshot payloads equal the preeditorial rows. The actual pure publication pipeline replays both selected captures and matches the published record signatures. No private fetch, fabricated authored substitute or snapshot replay for other IDs is claimed.

The existing helper verifies the unchanged effective/published catalogue and current feedback-bundle signatures. Independent PBQ field hashes bind question, scenario, choices/items, log/config/diagram/code/answer/hint, key, teaching, objective/domain/difficulty. MCQ structural triage flags alone do not establish PBQ fields unchanged.

All13 main explanations change relative to the available authored/preeditorial layer. All numerical choice keys and four ordering keys remain unchanged. The four order questions gain **21 item teaching bodies**; nine choice questions have **36 option bodies and27 wrong corrections:15 changed and12 new**. No wrong correction is inferred from generic fallback text. Every teaching body is matched to its current choice or expected-position item with exact fingerprints. p075/p086 retain labels, p020/p064 revise labels. p013 difficulty changes hard→medium; p058 medium→easy. p064/p070 shift domain2→4, p075/p080 domain3→4, p045/p058 domain1→4. p028 objective4.1 becomes4.6; p045/p058 objective1.2 becomes4.6. p064/p075/p080/p086/p070 gain4.3/4.5 labels. These are observed editorial changes, not approved scope or calibration.

| Credited PBQ | Trusted revision observed | Trusted content SHA-256 |
| --- | --- | --- |
${credited.map(s=>'| '+s.q.id+' | '+s.record.trustedRevisionId+' | '+s.record.contentSha256+' |').join('\n')}

Trusted compiler identities are observations. All PBQ evidence remains coarse whole-question. A combined policy or paired-protocol answer is one decision, and ordered positions are not separately approved skills. New canonical primary/secondary roles and concept links remain null/empty; all weights are zero.

## Actual grading, permutation and delivery evidence

Extracted source expressions bind **${location(wholeUnit)}** (practice whole), **${location(partsUnit)}** (parts), **${location(canUnit)}** (submit), **${location(examUnit)}** (exam whole), **${location(answeredUnit)}** (answered), and **${location(initUnit)}** (exam initial state). Only pure expressions, the current trusted compiler/grader/projection and mock terminal callbacks execute. No actual submit, persistence, reward, analytics, live host, provider or destructive command runs.

Nine single-choice questions cover all **36 offered selections:9 correct and27 incorrect**. Practice/exam whole results and trusted binary scores agree. Null selection is unanswered/unsubmitable. Adversarial undefined opens the raw practice non-null gate but remains unanswered in exam; invalid non-null values can open legacy gates while remaining incorrect. UI starts null and emits valid numeric indices. These isolated expression limits are not browser-reproduced learner exploits.

The four ordering questions exhaust **1080 complete response permutations:4 correct and1076 incorrect**. p020 has720; p064/p075/p086 have120 each. All practice/exam/trusted whole decisions agree. **679 incorrect sequences yield fractional legacy position ratios but trusted whole score0**. Histograms are six-item0:265,1:264,2:135,3:40,4:15,6:1; five-item0:44,1:45,2:20,3:10,5:1. All **111 item-position pairs** (21 expected,90 wrong) are checked. Practice part solutions bind the expected-position item's teaching; they are not bespoke corrections for every wrong sequence.

| PBQ | Correct / wrong response paths | Fractional wrong legacy paths | Item-position pairs | Trusted fixture display permutations | Stable display grading paths |
| --- | --- | ---: | ---: | ---: | ---: |
${gradingChecks.map(r=>'| '+r.recordId+' | '+r.correctPaths+' / '+r.incorrectPaths+' | '+r.fractionalLegacyPaths+' | '+r.itemPositionPairings+' | '+r.displayPermutations+' | '+r.stableDisplayGradingPaths+' |').join('\n')}

All **${totals.displayPermutations} trusted display permutations** preserve identity through **${totals.stableDisplayGradingPaths} grading paths**. Practice/exam choices keep fixed stored order; projection permutations are local fixtures, not observed browser shuffles or additional independent evidence. Learner projections expose no key, answers or teaching.

Ordering starts with a shuffled complete array and is submitable without dragging. Empty orders are unanswered/unsubmitable. Correct-prefix plus an extra item passes the raw legacy whole expression; incomplete/duplicate arrays can open legacy gates and produce partial ratios. Trusted grading rejects incomplete, extra, duplicate, unknown or mismatched submissions. **${invalidSelections} invalid stable selections**, **${tamperedRevisions} tampered revisions** and **${duplicateDisplays} duplicate displays** are rejected. No uniform randomness, exploitability or persisted attempt is claimed.

Delivery binds **${location(simUnit)}**, **${location(examViewUnit)}**, **${location(feedbackUnit)}**, **${location(bankUnit)}** and **${location(sortableUnit)}**. p080 logData and four CONFIG/ACL currentConfig views supply their evidence in practice/exam; scenarios supply policy and workflow prerequisites. SortableOrderList renders labels before answering, without item teaching. All36 option teaching bodies appear in submitted accessible practice and completed expanded exam; main teaching arrives through the correct option rather than a duplicate standalone panel. Four order questions show main and21 expected-position corrections in practice; completed exam shows **main only**, with no per-position corrections or correct list for these no-target questions. Complete exam ordering remediation remains held. Non-terminal hints are not shown in practice; exam strips hints without altering grading content.

At **${location(terminalUnit)}**, p001/p045 each pass five mock fixtures: three generic keyword inputs (including a non-command substring word) produce the same stored output, empty input does nothing, and unrecognised input emits a hint. **No shell runs, typed command is not graded, and exam hides stored answer output.** p001's scenario supplies the policy violation independently; p045 asks why clocks support freshness, so credit is narrowly clock/replay reasoning, not numeric fault diagnosis. Its displayed numeric diagnostic is not present in exam. Titles suggesting executed scan/diagnosis remain held.

The observed free-preview predicate is **src/App.jsx:229 /361**: p001 only. Existing bank practice checks Pro/preview/coin access, guest bank permits p001 and sends other selections to signup (**src/App.jsx:34719**), and active selection prefers live bank before the permitted local fallback (**src/App.jsx:34769**). p001 preview-mode calculation is at **src/App.jsx:34771**. These source checks and pure predicate fixtures observe existing access; no entitlement, preview activation, learner text or master-plan free-choice reconciliation is changed. Exam retains its Pro/pass gate, pool eligibility and sampling limits. No browser, learner recovery or end-to-end execution was verified.

## Family comparisons and primary evidence

${comparisonGroups.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n')}

[NIST SP800-40r4 publication abstract](https://csrc.nist.gov/pubs/sp/800/40/r4/final) describes identifying, prioritising, installing and verifying patches. Our inference supports qualified verification teaching, not this exact team stage order or a current CVE treatment. [NIST SSDF publication abstract](https://csrc.nist.gov/pubs/sp/800/218/final) describes high-level practices integrated into different SDLC implementations; it does not prescribe p075's particular gates or cost multipliers. The CISA KEV page could not be retrieved in this check. No current catalogue entry, deadline, vendor fix or BOD requirement is verified; earlier policy-currentness holds remain.

[NIST SP800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html), password-verifier section3.1.1.2, distinguishes single-factor versus MFA minimum length, rejects arbitrary periodic changes/composition requirements in its scope, and requires whole-value blocklist comparison and rate limiting. Our inference preserves p028/p058's scoped purposes, not universal numeric thresholds or full example-policy approval. [RFC4120 section3.2.3](https://www.rfc-editor.org/rfc/rfc4120) discusses configured clock skew and replay cache or suitable application replay protection. It does not grant a safe replay window or prove actual diagnosis in p045.

[OASIS SAML core section1](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf) specifies XML assertions. [RFC6749 introduction/section3.3](https://www.rfc-editor.org/rfc/rfc6749) describes delegated scoped access, and [OIDC core abstract](https://openid.net/specs/openid-connect-core-1_0.html) describes its identity layer. Our inference distinguishes p225's explicit XML/delegation requirements without asserting universal SAML-only sign-in or tested token revocation. [NIST SCAP overview](https://csrc.nist.gov/projects/security-content-automation-protocol) describes assessment specifications for configuration/vulnerability information. Our inference confines p226 to standards-suite recognition; no compatibility or remediation is executed.

## Preserved holds, privacy and release boundary

All earlier decision and qualification hashes remain bound. Seven older full-feedback gaps remain zero-credit: **p004,p011,p029,p046,p041,p043** unsupported SELECT & FILL; **p211** critical diagram hidden in practice. Retain p211's coarse recovery/retention and WORM-not-malware taxonomy blocker and p048's coarse RTO/BIA pilot support. p089/p051 hidden LOG stored evidence remains unresolved. Preserve p074 hidden SCENARIO answer and p009 ambiguous exact ordering with zero credit; earlier p007/p030 unsupported hotspots and p036/p223 unsupported selection remain deferred. Preserve p014's one paired key/no two independent skills; p084 mock-terminal limitation; p099/p026/p048/p096 legacy position ratios, trusted whole grading and incomplete exam item teaching. p025's logged-deletion outcome overstatement remains held. No new coverage clears any earlier hold.

Private p003 question/feedback remain **sha256:f2eb1e715fa9fcda87ada668d7d17dfdf6b44840328d5ffeb460e3a342e502f2**; private p017 remain **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**. Both stay metadata-only/unavailable/unreviewed with null trusted identities, separate from local fallbacks. No fetch, export, substitution, private compilation or approval transfer. Earlier m305/m046/m432, m177 taxonomy, m631 validation, KEV/policy-currentness and teaching-link holds remain bound.

Frozen ledger SHA-256: **e0ceeec3c5cc8adb94b36175954a8cefaebcb4f29f4c66aa38c400f65de3bb12**. Active package: **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**, unchanged **1878 records/435 identities/2954 decisions/489 unresolved mappings/seven primary proposals**. All25 protected files remain exact. Exports contain fingerprints/counts/qualified judgments, no raw source stems, options, keyed sequences, stable grading IDs, private payload or learner data.

Run node **${scriptPath}**, npm run **audit:content-mapping**, and git diff --check. The focused audit rejects **${negativeMutationChecks} packet mutations** covering stale bindings, misassociated teaching/parents, unsupported or duplicate credit, erased holds, private substitutions, incorrect census and activation. All29 mapping tests and deterministic active-package reproduction are required before the task-only **[skip deploy]** commit/push. Verify deployment-skip hook, final HEAD=origin/main=remote, exact three file SHA-256 values and preserved unrelated work.

**Phase2B-5 NOT READY.** Remaining PBQ and feedback reviews, support content, private semantics, grammar/delivery gaps, canonical taxonomy/roles, calibration and owner/release approval remain open. No runtime edit, live/shadow write, migration, activation, deployment, cohort or Phase3 work. No browser or production verification is claimed.
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE43_45_46_PBQS_NOT_READY',newQuestions:13,newFeedback:13,deferred:deferredSelectedRows.map(r=>r.recordId),priorPackets:71,bankProgress,objectiveProgress:Object.fromEntries(Object.entries(objectiveCoverage).map(([code,v])=>[code,v.denominator])),gradingChecks,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
