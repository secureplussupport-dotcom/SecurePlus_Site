import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-objective44-49-operations.mjs',packetPath='docs/drafts/phase-2b5-objective44-49-operations-proposals.json',reportPath='docs/phase-2b5-objective44-49-operations-review.md';
const basePath='docs/drafts/phase-2b5-objective53-55-assurance-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'960c9c86e554707fef6d2a1d64fc7149c7a751e1c3cff380b3fcf05f4afa162a');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective45-mcqs-proposals.json','docs/drafts/phase-2b5-objective54-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-risk-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-pilot-feedback-proposals.json','docs/drafts/phase-2b5-objective51-mcqs-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);assert.equal(c.ledger.rows.filter(r=>legacyPrevious.has(r.recordId)).length,363);
const ids=["m066", "m076", "m078", "m166", "m179", "m312", "m361", "m618", "m709", "m140", "m176", "m366"];
const candidates=ids.map(id=>c.ledger.rows.find(r=>r.recordId==='mcq:'+id));
assert.equal(new Set(ids).size,12);assert(candidates.every(r=>r&&r.kind==='mcq'&&r.objectiveCodesObserved.some(code=>['4.4','4.9'].includes(code))));
// The supplied order is a set order, not a structural-priority ranking.
assert.deepEqual(candidates.map(r=>r.priorityScore),[10,25,10,20,35,35,35,30,130,10,25,35]);
const rankedIds=[...candidates].sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en')).map(r=>r.questionId);
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
assert.equal(inventory.length,66);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);
const excluded=candidates.filter(r=>c.previous.has(r.recordId)),selected=candidates.filter(r=>!c.previous.has(r.recordId));
assert.deepEqual(excluded,[]);assert.equal(selected.length,12);assert(candidates.every(r=>!c.previous.has('explanation:'+r.recordId)));
const exclusions=excluded.map(r=>{const p=c.previous.get(r.recordId);return{recordId:r.recordId,sourceRevision:r.revisions.localEffective,publishedRecordSignature:r.revisions.publishedCatalogue,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),priorFamilyLabel:p.row.familyLabelProposal,reason:'current_matching_prior_substantive_question_judgment_reused_feedback_still_unreviewed',newQuestionCredit:0,newFamilyCredit:0};});
const priorInventory=base.allPacketReconciliation.inventory;
assert.deepEqual(inventory.filter(r=>r.path!==basePath),priorInventory);
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorBank.length,405);assert.equal(priorFeedback.length,392);
const broad44=c.pkg.records.filter(r=>r.objectiveCodes.includes('4.4')),broad49=c.pkg.records.filter(r=>r.objectiveCodes.includes('4.9'));
assert.equal(c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('4.4')).length,9);assert.equal(c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('4.9')).length,3);
const pilotPath='docs/drafts/phase-2b5-objective52-pilot-mapping-proposals.json',pilot=readJson(pilotPath);

const preservedPilotQuestionProposals=pilot.questionProposals.filter(r=>r.disposition==='direct_pilot_proposal');
assert.deepEqual(preservedPilotQuestionProposals.map(r=>r.questionId),['m032','m086','m088','m196','m635']);
for(const r of preservedPilotQuestionProposals){assert.equal(r.sourceRevision,c.records.get(r.recordId).localRevisionSignature);assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);assert.equal(r.humanApproved,false);assert.equal(r.masteryWeight,0);}
verifySourceBindings(pilot.draftComparisons);assert.equal(hashFile(pilotPath),'de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c');
const draft=readJson(pilot.draftComparisons[0].path),clean=draft.questions.find(r=>r.id==='draft.pilot1.rpo.03');
const pilotBoundary={preservedPilotQuestionProposals,ownerContentDecisionBinding:{path:'docs/drafts/phase-2b5-pilot-batch-1-content-decision.md',sha256:hashFile('docs/drafts/phase-2b5-pilot-batch-1-content-decision.md')},ownerFamilyDecisionBinding:{path:'docs/drafts/phase-2b5-pilot-batch-1-family-decision.md',sha256:hashFile('docs/drafts/phase-2b5-pilot-batch-1-family-decision.md')},draftComparisons:pilot.draftComparisons,ownerReservedChoices:pilot.ownerReservedChoices,approvedContentRevisionsPreserved:true,approvedFamilyJudgmentsPreserved:true,newPilotRoleCredit:0,roleWeightTeachingPublicationApprovalTransferred:false,recoveryBoundary:'MTD is the outer business-interruption limit; RTO is the service-restoration target; RPO concerns recoverable data age. One contrast does not supply independently assessed secondary evidence. MTD remains supporting scope, not an explicit BIA exam bullet.',cleanPointBoundary:{recordId:clean.id,draftQuestionRevision:sig(clean),familyRationale:clean.familyRationale,accuracyCheck:clean.accuracyCheck,priorBankRecordId:'mcq:m088',priorBankRevision:c.records.get('mcq:m088').localRevisionSignature,hold:'Owner accepted the clean-point reasoning distinction from tested successful version cadence. This is editorial judgment, not psychometric independence, learner transfer or a clean-source guarantee.'},mttrGlossaryBoundary:pilot.instructionalProposals.find(r=>r.recordId==='glossary:mttr'),coarseRecoveryPbqBoundary:pilot.questionProposals.filter(r=>['pbq:p048','pbq:p211'].includes(r.recordId))};
assert.deepEqual(pilotBoundary,base.pilotBoundary);
const preservedPilotFeedbackLinkReconciliation=base.preservedPilotFeedbackLinkReconciliation;assert.equal(preservedPilotFeedbackLinkReconciliation.length,5);
assert.equal(duplicateReferences.length,22);assert.equal(supportOnlyReferences.length,7);
const protectedHashes=readJson('docs/evidence/phase-2b5/release-checksums.json').files;assert.equal(Object.keys(protectedHashes).length,25);verifySourceBindings(Object.entries(protectedHashes).map(([path,sha256])=>({path,sha256})));
const reviews=[
  {
    "id": "m066",
    "meaning": "Identify a SIEM from central aggregation, correlation and rule-based alerting across log sources.",
    "hold": "HOLD a tool name as complete monitoring coverage, a confirmed incident or a finished investigation. Collection, parsing, clock consistency, integrity, retention, accessible context, rule quality and validation remain unverified. IDS, firewalls and endpoint platforms may integrate with central analysis; their primary functions are introductory contrasts, not exclusive product capability boundaries. A SIEM does not inherently perform containment, patching or lawful reporting. Same conservative family as m166,m361,m618.",
    "main": "A SIEM brings records together and looks for related activity. An alert is a reason to examine evidence, rather than proof that an attack succeeded.",
    "contrasts": [
      "An IDS detects activity within its monitored scope and can supply alerts or logs to a SIEM. The old single-stream/no-aggregation claim is removed; the supplied central multi-source function identifies the SIEM.",
      "A firewall primarily enforces traffic policy and can contribute logs. Integrated analytics do not make enforcement equivalent to this central correlation function.",
      "Endpoint antimalware can detect and report malware and feed central analysis. Naming either tool does not establish its configuration or complete coverage."
    ],
    "family": "multi-source-SIEM-function-identification"
  },
  {
    "id": "m076",
    "meaning": "Select tuning the stated faulty rule together with validating detection coverage as the response to the supplied alert-quality problem.",
    "hold": "HOLD a tuning choice as measured improvement, guaranteed visibility or permission to silently suppress detections. Changes need authority, representative benign and attack examples, coverage and false-negative checks, ongoing review and a rollback path. Blind threshold increases or disabling the source can hide evidence. The supplied 10,000 alerts and capacity of50 are workload premises, not a false-positive rate, precision estimate, detection probability or risk-based triage performed. Tuning plus validation is one composite keyed choice, not two independently scored skills; incident urgency and prioritisation remain distinct.",
    "main": "Fix the misconfigured rule and test that useful detections still work. A lower alert count alone does not prove better security; prioritisation and analyst workload still need attention.",
    "contrasts": [
      "Longer retention can help historical analysis, but does not itself repair the stated faulty rule or today's alert quality.",
      "Disabling a source can remove both noisy events and valuable evidence. Under this premise, correcting and validating the rule addresses the cause; no universal prohibition on authorised maintenance is inferred.",
      "Storage capacity addresses retention or ingestion limits. It does not by itself improve the accuracy of this specified misconfigured rule."
    ],
    "family": "misconfigured-alert-rule-tuning-and-validation"
  },
  {
    "id": "m078",
    "meaning": "Identify NetFlow/IPFIX-style flow records from the supplied connection metadata rather than full-packet capture.",
    "hold": "HOLD PCAP as always complete packets or readable payloads, or a tool label as actual capture settings, packet retention or lower storage by a known factor. Snapshot length, filters, loss, observation points, export templates, sampling and encryption affect available information. The retained PCAP correction overstates completeness and universal storage overhead; the retained WAF correction names a primary function rather than excluding integrated logging. No claim that every possible IPFIX export contains only these listed fields is approved, and IPFIX is not merely one universal vendor NetFlow format. Records do not prove malicious intent or reliable attribution.",
    "main": "Flow records summarise observed communications under their configured fields. Packet capture can retain packet bytes, but its completeness and the ability to inspect application content depend on configuration and encryption.",
    "contrasts": [
      "PCAP can retain packet bytes; the unchanged full-packet/high-overhead statement needs capture-length, filtering, loss and encryption qualifications.",
      "An IDS performs detection and can use flows or packets. That purpose differs from the particular flow-record collection requested.",
      "A WAF primarily handles web-application traffic and may produce useful logs. The supplied flow-export function differs from that primary role; integrated capabilities are not ruled out."
    ],
    "family": "flow-record-versus-packet-capture-identification"
  },
  {
    "id": "m166",
    "meaning": "Identify a SIEM from organisation-wide log aggregation, correlation and alert generation.",
    "hold": "HOLD correlated activity as proven compromise, an alert as an authorised containment action or named sources as all telemetry successfully collected. IPS, EDR and DLP can integrate or combine features; their core functions are not mutually exclusive product silos. An IPS deployment is not universally limited to one network implementation, and DLP does not guarantee zero leakage. Domain4 stays observed; broad4.4 naming is not full detection/response competence. Same conservative SIEM family despite different alternatives.",
    "main": "A SIEM correlates records from several sources to highlight activity for investigation. Blocking and leakage controls may use that evidence but require their own authority, configuration and validation.",
    "contrasts": [
      "An IPS detects and can prevent activity at its enforcement point. Its logs may feed correlation; naming prevention does not establish successful blocking.",
      "EDR focuses on endpoint telemetry and response and may integrate broader analysis. The supplied requirement is central correlation across diverse sources.",
      "DLP focuses on information handling and leakage controls and can supply events. It neither guarantees prevention nor substitutes for the supplied general event-correlation function."
    ],
    "family": "multi-source-SIEM-function-identification"
  },
  {
    "id": "m179",
    "meaning": "Identify anomaly-based detection from deviations against the explicitly supplied normal-activity baseline.",
    "hold": "HOLD an anomaly as necessarily malicious, every unseen attack as detectable or fixed false-positive superiority/inferiority across all products. Baselines can be configured, learned or updated and require representative data, review and validation; the stem does not establish machine learning. Heuristics, signatures, protocol analysis and baseline methods can overlap in implementations. The effective correction's learned-baseline wording is qualified by this broader source premise. No baseline, threshold, detection rate or investigation is supplied.",
    "main": "Anomaly detection compares observed activity with what is defined as normal. Unusual legitimate activity can match, and malicious activity can fit or influence a baseline; both possibilities need investigation.",
    "contrasts": [
      "A signature matches a known pattern; the stated normal-baseline comparison more specifically identifies anomaly detection. Products can combine both.",
      "Heuristics use indicative rules or characteristics and can incorporate behavioural ideas. The explicit normal baseline, rather than an exclusive heuristic/anomaly taxonomy, determines this introductory contrast.",
      "Protocol analysis examines expected protocol behaviour. It may overlap behavioural methods; the question specifically supplies an organisational normal-activity baseline."
    ],
    "family": "baseline-deviation-detection-identification"
  },
  {
    "id": "m312",
    "meaning": "Select multi-source cloud threat detection and analysis for the supplied API, flow and DNS correlation requirement.",
    "hold": "HOLD source collection as analysis, anomaly labels as confirmed compromise or generic capability naming as an actual AWS service deployed or configured. Effective wording replaces vendor-service trivia and the old confusion between CloudTrail recording and GuardDuty analysis. The authored claim about all API calls is not retained as a universal logging guarantee. Log source, resolver, region, permission, availability, timestamp and retention context remain unverified. Web filtering, DDoS controls and vulnerability scans can contribute evidence without being identical primary functions. Observed domain3 to4 does not approve full4.4 or independent cloud skills.",
    "main": "The question asks for analysis of several kinds of activity, rather than merely storing records or filtering one traffic type. A suspicious pattern supplies a lead that needs validation and context.",
    "contrasts": [
      "Web filtering primarily examines requests and can contribute logs. It does not alone meet the supplied broader activity-correlation requirement.",
      "DDoS protection focuses on availability attacks. Related telemetry may help analysis, but this requirement is broader than a volumetric-protection function.",
      "Vulnerability scanning identifies weaknesses under its scope. Correlating observed account and network behaviour is a distinct supplied purpose; scan findings can still inform that analysis."
    ],
    "family": "multi-source-cloud-threat-analysis-capability-identification"
  },
  {
    "id": "m361",
    "meaning": "Recognise aggregation and cross-source event correlation as the SIEM capability supplied in the current question.",
    "hold": "HOLD the authored acronym expansion and two named functions as two current independent assessment components. The effective question now asks one capability recognition and shares the earlier SIEM family. Current records, accurate timestamps, reliable ingestion/parsing, meaningful rules, retention, access and validation are unverified. Orchestration integrations can trigger segmentation, remediation or identity workflows, but correlation alone neither enforces these controls nor grants authority. No real-time completeness, compliant retention or forensic admissibility is established.",
    "main": "A SIEM relates records across sources to support alerts and investigation. Its quality depends on the records and analysis; recognising the tool does not complete any response action.",
    "contrasts": [
      "Segmentation requires appropriate network and access-control enforcement. A SIEM may inform or orchestrate a change through integrations, but log aggregation itself is not isolation.",
      "Missing-patch indicators can be reported through a SIEM. Reporting them does not replace installing and validating an appropriate fix.",
      "Authentication-factor issuance belongs to identity-management functions. Integration with those systems does not make issuance the core log-correlation capability asked about."
    ],
    "family": "multi-source-SIEM-function-identification"
  },
  {
    "id": "m618",
    "meaning": "Identify a SIEM from the explicitly supplied central log collection, normalisation, retention and correlation requirement.",
    "hold": "HOLD an imported definition as new independent family evidence, a product purchased as sources actually connected, or retained logs as complete, intact, legally compliant or accessible for an investigation. NGFW, EDR and UTM products can integrate logging and analytics; the contrasts describe primary functions rather than exclusive capabilities. The requirement does not select a product version or validate real-time detection. Authored domain3 to4 and medium to easy remain observed metadata; keep the same conservative family as m066,m166,m361.",
    "main": "The supplied central cross-source log-analysis requirement identifies the SIEM function. Source configuration, data quality and testing still determine whether it works in practice.",
    "contrasts": [
      "An NGFW primarily enforces network policy and can log or integrate analytics. That primary enforcement function is distinct from the supplied central log system.",
      "EDR focuses on endpoint telemetry and response; it can feed or integrate wider analysis, while this requirement explicitly spans infrastructure sources.",
      "UTM combines gateway security functions and can include logging. Product integration does not erase the supplied SIEM log-correlation distinction."
    ],
    "family": "multi-source-SIEM-function-identification"
  },
  {
    "id": "m709",
    "meaning": "Identify port mirroring as copying selected switch traffic to the expressly passive IDS monitoring port.",
    "hold": "HOLD a traffic-copy feature as every packet observed, successful detection, readable encrypted content or a universal no-production-impact guarantee. Source/direction selection, switch support, filtering, oversubscription, duplicates, capture capacity and sensor configuration affect visibility. A passive sensor does not thereby gain inline blocking ability. The captured snapshot is sufficient source evidence; there is no authored/imported substitute. Stale ARP acronym metadata is not rendered evidence that ARP is being assessed; earlier false-reference holds stay exact. No switch, sensor or live traffic is configured.",
    "main": "Port mirroring sends selected traffic copies to a monitoring destination. The copy is an input to a sensor; it does not itself detect, block or prove an incident.",
    "contrasts": [
      "Port security restricts permitted device addresses under its configuration. It does not provide the requested general monitoring copy or prove devices are trustworthy.",
      "Port forwarding maps delivery to another address or port. That is a different operation from making a monitoring copy.",
      "DHCP snooping checks relevant DHCP messages and trusted-port configuration. It is not general traffic copying or a guarantee against every network attack."
    ],
    "family": "passive-sensor-port-mirroring-identification"
  },
  {
    "id": "m140",
    "meaning": "Choose DNS tunnelling as the most likely investigative hypothesis for the supplied unusually large TXT-query and generated-subdomain pattern.",
    "hold": "HOLD high DNS volume, a TXT query or encoded-looking names as confirmed compromise, C2, successful data loss or actor attribution. Approved services and load tests, resolver context, contents, timing, endpoint/account evidence and destination history need examination. No universal numeric detection threshold or fact that DNS is rarely blocked is approved. Query type alone does not show the payload or whether commands or data travelled in queries versus responses. The example domain is a supplied cue, not a contacted or validated threat. Observed domain2 to4 and whole4.9 placement do not approve containment, evidence handling, reporting or recovery skills.",
    "main": "This combination is a reason to investigate possible DNS tunnelling. It is a most-likely hypothesis under the choices, rather than a completed diagnosis or proof that data left the organisation.",
    "contrasts": [
      "A legitimate load test is possible but needs documented authority and expected activity; the scenario supplies none. Lack of that evidence is not proof no authorised test existed.",
      "Misconfiguration can cause unusual DNS behaviour, but does not best explain this combined encoded-looking, single-domain pattern. It is not ruled out by volume alone.",
      "Cache poisoning concerns false name-resolution information being accepted or retained. The supplied repetitive query/subdomain pattern more directly suggests possible data carriage; no actual cache contents are inspected."
    ],
    "family": "DNS-pattern-tunnelling-hypothesis-identification"
  },
  {
    "id": "m176",
    "meaning": "Select endpoint process, authentication and service-installation evidence to investigate the supplied lateral-movement hypothesis.",
    "hold": "HOLD choosing a source as actual logs collected, correlation performed or compromise confirmed. PsExec/WMI and network logons can be authorised administration; event IDs need provider, channel, audit policy, command-line settings, timestamps and account/host context. 4624/4688 are Security-log examples and7045 is normally a Service Control Manager System event, rather than all three belonging to Security. Missing records do not refute activity when telemetry is incomplete. The combined source choice is one decision, not independently scored logon/process/service skills. Evidence integrity, access, preservation, reporting and containment remain unperformed.",
    "main": "Host authentication and execution records can help test the hypothesis. Their presence and meaning must be correlated with authorised activity; IDs alone are not a verdict.",
    "contrasts": [
      "Deny-only firewall records describe blocked traffic and lack the host execution/authentication evidence central to this question. Other network records can still support the investigation.",
      "DHCP records help relate addresses to systems at a time, but do not establish which programs ran or accounts authenticated. They can contribute context.",
      "Badge records can add physical context but cannot by themselves demonstrate remote host execution. A combined investigation need not discard them."
    ],
    "family": "host-execution-authentication-evidence-selection"
  },
  {
    "id": "m366",
    "meaning": "Interpret the stated search output as matching recorded PowerShell launches with the selected encoded-command condition, grouped by host and account.",
    "hold": "HOLD a string-filter match as necessarily malicious, every PowerShell invocation captured, only administrators selected or executable code having run merely because a command line was recorded. Encoding has legitimate uses; audit/command-line collection, data loss, normalisation, search window, exact predicates, alternate spellings/aliases and other invocation paths limit coverage. The effective prose replaces the authored Splunk query and -enc example: no exact current SPL query or universal alias matching is inferred. No command or SIEM query is executed, decoded or changed; grouping is reporting, not containment or attribution. Whole4.9 scope and authored hard to medium stay unapproved observations.",
    "main": "A filter returns records that meet its conditions. Encoded command arguments can be legitimate; matched hosts/accounts identify leads within the available records, not confirmed attackers or complete PowerShell coverage.",
    "contrasts": [
      "Executions without the selected argument are outside this filter; missing telemetry or alternative invocations can also be absent. It does not list every PowerShell execution.",
      "The supplied inputs are execution records, rather than an inventory of installed-but-unused software.",
      "The filter supplies no administrator-only condition or test of malicious intent. Benign automation can match too."
    ],
    "family": "recorded-encoded-PowerShell-filter-interpretation"
  }
];
assert.deepEqual(reviews.map(r=>r.id),ids);
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();

const sourceChecks=candidates.map(row=>{
 const s=c.questions.get(row.recordId),q=s.q,pre=s.preQuestion,shuffled=shuffle(q);
 assert.equal(s.authored===null,row.questionId==='m709');
 if(s.snapshots.length){assert.equal(s.snapshots.length,1);assert.equal(s.captures.length,1);const replay=publicationPipeline(c.bank).overrides(s.snapshots).mcqs.find(x=>x.id===q.id),{_baseOrder,_adminOrder,...semantics}=replay;assert.equal(sig(semantics),row.revisions.localEffective);assert.equal(s.pub._adminOrder,s.captures[0].sort_order);}
 else{assert(s.authored);assert.equal(s.captures.length,0);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);}
 assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);assert.equal(q.correct,pre.correct);
 assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
 for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
 assert.notEqual(sig(q.exp),sig(pre.exp));const unchangedWrongCorrectionCount=q.opts.map((_,j)=>j).filter(j=>j!==q.correct&&pre.wrongFeedback?.[j]===q.wrongFeedback[j]).length;
 return{recordId:row.recordId,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:s.snapshots.length>0,sourceLayerDisposition:s.authored===null?'snapshot_only_no_authored_or_imported_substitute':s.snapshots.length?'authored_then_captured_snapshot_then_effective_editorial':row.flags.importedSource?'imported_authored_equals_preeditorial_then_effective_editorial':'authored_equals_preeditorial_then_effective_editorial',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',authoredMissingWrongCorrections:s.authored===null?null:!s.authored.wrongFeedback,stemChangedFromPreeditorial:sig(q.q)!==sig(pre.q),optionsChangedFromPreeditorial:sig(q.opts)!==sig(pre.opts),mainCorrectionChanged:true,wrongCorrectionsChanged:sig(q.wrongFeedback)!==sig(pre.wrongFeedback??null),changedWrongCorrectionCount:3-unchangedWrongCorrectionCount,unchangedWrongCorrectionCount,optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0},status:'source_inspection_no_additional_question_credit'};
});
assert.equal(sourceChecks.filter(r=>r.snapshotReplayChecked).length,1);assert.equal(sourceChecks.filter(r=>r.stemChangedFromPreeditorial).length,6);assert.equal(sourceChecks.filter(r=>r.optionsChangedFromPreeditorial).length,7);assert.deepEqual(candidates.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m618']);assert.equal(sourceChecks.filter(r=>r.authoredMissingWrongCorrections).length,7);assert.equal(sourceChecks.filter(r=>r.authoredMissingWrongCorrections===null).length,1);
assert.equal(sourceChecks.filter(r=>r.wrongCorrectionsChanged).length,12);assert.equal(sourceChecks.reduce((n,r)=>n+r.changedWrongCorrectionCount,0),34);assert.equal(sourceChecks.reduce((n,r)=>n+r.unchangedWrongCorrectionCount,0),2);
const mirrored=c.questions.get('mcq:m709');assert.deepEqual(mirrored.preQuestion,mirrored.snapshots[0].payload);assert.equal(mirrored.captures[0].sort_order,416);assert.equal(mirrored.captures[0].payload_sha256,'c5fe2e67be8526cb229cf12db26a39d250afc66d71eeaf8627d1319e26ca12f3');assert.equal(mirrored.captures[0].updated_at,'2026-07-05T04:26:03.663+00:00');
assert(mirrored.q.acronyms.includes('ARP'));assert(!/\bARP\b/.test(mirrored.q.q+' '+mirrored.q.opts.join(' ')+' '+mirrored.q.exp+' '+Object.values(mirrored.q.wrongFeedback).join(' ')));
const meaningBoundaryChecks=[];
function boundary(id,pattern,limits){const s=c.questions.get('mcq:'+id);assert(pattern.test(s.q.q+' '+s.q.opts.join(' ')));meaningBoundaryChecks.push({recordId:s.row.recordId,stemRevision:sig(s.q.q),offeredChoiceSetRevision:sig(s.q.opts),...limits});}
for(const id of ['m066','m166','m361','m618'])boundary(id,/correlat/i,{correlationEstablishesCompromise:false,monitoringToolPerformsContainmentOrRecovery:false,completeTelemetryObserved:false});
boundary('m076',/10,000 alerts per day.*50/,{suppliedWorkloadPremises:true,falsePositiveRateOrPrecisionEstablished:false,tuningCoverageValidatedInProduction:false,twoIndependentSkillsApproved:false});
boundary('m078',/WITHOUT capturing full packet contents/,{everyPacketCaptureCompleteOrDecrypted:false,exportTemplatesActuallyInspected:false});
boundary('m179',/established baseline/,{deviationProvesAttack:false,baselineNecessarilyMachineLearned:false});
boundary('m312',/API audit activity, network flows and DNS events/,{collectionEqualsThreatAnalysis:false,actualCloudServiceConfigured:false});
boundary('m709',/passive network IDS/,{allPacketsObserved:false,passiveCopyImpliesInlineBlocking:false,universalNoProductionImpactGuaranteeApproved:false,staleARPAcronymAssessed:false});
boundary('m140',/TXT record queries/,{mostLikelyHypothesisOnly:true,C2OrExfiltrationConfirmed:false,actualDNSQueryPerformed:false});
boundary('m176',/hypothesises/,{eventIDsAloneProveLateralMovement:false,allNamedEventsBelongToSecurityLog:false,sourceSelectionEqualsCompletedInvestigation:false});
boundary('m366',/-EncodedCommand/,{matchingRecordsCanBeBenign:true,allPowerShellExecutionsIncluded:false,administratorOnlyConditionSupplied:false,actualSIEMQueryExecuted:false,authoredSPLAliasSemanticsTransferred:false});
const preservedKevTeachingHolds=['m174','m262'].map(id=>{const p=c.previous.get('explanation:mcq:'+id);assert(p&&/BOD.*26-04/.test(p.row.contentQualification));return{recordId:p.row.recordId,sourceRevision:p.row.sourceRevision,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),contentQualification:p.row.contentQualification,currentDeadlineOrDirectiveRequirementsResolved:false};});
const questionProposals=selected.map(row=>{
 const i=ids.indexOf(row.questionId),r=reviews[i],check=sourceChecks[i];
 return{recordId:row.recordId,questionId:r.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourceInspectionRevision:sig(check),assessedUnderstanding:r.meaning,contentQualification:r.hold,objectiveScopeProposal:null,skillRoleProposal:null,numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:r.family,familyStatus:'provisional_comparison_no_independence_approval',difficultyObserved:check.difficultyObserved,difficultyDisposition:'source_label_uncalibrated'};
});
const explanationProposals=candidates.map((row,i)=>{
 const s=c.questions.get(row.recordId),q=s.q,r=reviews[i],indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct),prior=c.previous.get(row.recordId);
 assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
 return{recordId:'explanation:'+row.recordId,kind:'explanation_bundle',parentId:row.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:row.revisions.localEffective,parentPublishedRevision:row.revisions.publishedCatalogue,parentDispositionStatus:prior?'existing_matching_question_judgment_reused':'new_question_judgment_in_this_packet',reusedParentDispositionRevision:prior?sig(prior.row):null,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:r.main,contentQualification:r.hold,objectiveScopeProposal:null,withheldPreciseContrast:r.family+'_limits',roleProposal:null,deliveryUnderstanding:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:r.contrasts[k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId));assert.equal(selectedIds.size,24);
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
function coverage(broad,expectedPrior,expectedNewQuestions,expectedNewFeedback,expectedRemaining){
 const prior=broad.filter(r=>c.previous.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id)),newQuestions=questionProposals.filter(p=>broad.some(r=>r.id===p.recordId)),newFeedback=explanationProposals.filter(p=>broad.some(r=>r.id===p.recordId));
 assert.equal(prior.length,expectedPrior);assert.equal(newQuestions.length,expectedNewQuestions);assert.equal(newFeedback.length,expectedNewFeedback);assert.equal(remaining.length,expectedRemaining);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);
 return{denominator:{broadCandidates:broad.length,localCandidates:broad.filter(r=>!r.id.startsWith('private:')).length,privateMetadataOnlyCandidates:broad.filter(r=>r.id.startsWith('private:')).length,allPacketPriorDispositions:prior.length,priorByKind:counts(prior),newQuestionDispositions:newQuestions.length,newFeedbackDispositions:newFeedback.length,newAgentDispositions:newQuestions.length+newFeedback.length,combinedAgentDispositions:prior.length+newQuestions.length+newFeedback.length,remaining:remaining.length,remainingLocal:remaining.filter(r=>!r.id.startsWith('private:')).length,remainingPrivateMetadataOnly:remaining.filter(r=>r.id.startsWith('private:')).length,remainingByKind:counts(remaining)},census:broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:r.id.startsWith('private:')?'unavailable_private_semantics_not_reviewed':c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'})),remainingRecordIds:remaining.map(r=>r.id)};
}
assert.equal(broad44.length,120);assert.equal(broad49.length,96);
const coverage44=coverage(broad44,14,9,9,88),coverage49=coverage(broad49,8,3,3,82);
assert.deepEqual(coverage44.denominator.priorByKind,{glossary_definition:14});assert.deepEqual(coverage49.denominator.priorByKind,{glossary_definition:8});
assert.deepEqual(coverage44.denominator.remainingByKind,{deck_container:3,explanation_bundle:4,flashcard:29,glossary_definition:14,keyword_guide:3,lesson:3,lesson_check:12,lesson_section:13,lesson_traps:3,pbq:4});assert.deepEqual(coverage49.denominator.remainingByKind,{deck_container:3,explanation_bundle:7,flashcard:29,glossary_definition:14,keyword_guide:2,lesson:2,lesson_check:8,lesson_section:8,lesson_traps:2,pbq:7});
assert.equal(coverage49.denominator.localCandidates,94);assert.equal(coverage49.denominator.privateMetadataOnlyCandidates,2);assert.equal(coverage49.denominator.remainingLocal,80);assert.equal(coverage49.denominator.remainingPrivateMetadataOnly,2);
const privateP003=broad49.filter(r=>r.id.startsWith('private:'));assert.deepEqual(privateP003.map(r=>r.id),['private:explanation:pbq:p003','private:pbq:p003']);for(const r of privateP003){assert.equal(r.sourceSignature,'sha256:f2eb1e715fa9fcda87ada668d7d17dfdf6b44840328d5ffeb460e3a342e502f2');assert.equal(r.trustedRevisionId,null);assert(!selectedIds.has(r.id));assert(!c.previous.has(r.id));}
const sharedObjectiveRecordIds=broad44.filter(r=>broad49.some(x=>x.id===r.id)).map(r=>r.id);assert.equal(sharedObjectiveRecordIds.length,61);assert(sharedObjectiveRecordIds.every(id=>!selectedIds.has(id)));assert.equal(new Set([...broad44,...broad49].map(r=>r.id)).size,155);
const bankRows=c.ledger.rows,combinedQuestions=new Set([...priorBank.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=bankRows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
assert.equal(combinedQuestions.size,417);assert.equal(combinedFeedback.size,404);assert.equal(paired.length,404);assert.equal(paired.filter(r=>r.kind==='mcq').length,388);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,olderQuestionOnlyDispositions:olderQuestions.length,allPacketPriorQuestions:priorBank.length,newQuestions:questionProposals.length,allPacketCombinedQuestions:combinedQuestions.size,remainingQuestionDispositions:483-combinedQuestions.size,combinedMcqs:bankRows.filter(r=>r.kind==='mcq'&&combinedQuestions.has(r.recordId)).length,combinedLocalPbqs:bankRows.filter(r=>r.kind==='pbq'&&combinedQuestions.has(r.recordId)).length,newFeedbackBundles:12,priorFullFeedback:priorFeedback.length,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.combinedMcqs,389);assert.equal(bankProgress.combinedLocalPbqs,28);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,13);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective53And55HeldDispositions:base.explanationProposals.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal})),olderQuestionPacketBindings:olderQuestions.map(r=>({recordId:r.recordId,priorPacketPath:r.priorPacketPath,priorDispositionRevision:r.priorDispositionRevision,status:'existing_limits_preserved_no_full_feedback_or_approval_inherited'}))};
assert.equal(priorHolds.objective53And55HeldDispositions.length,12);
const comparisonSpecs=[
  {
    "ids": [
      "m066",
      "m166",
      "m361",
      "m618",
      "m312"
    ],
    "meaning": "The four explicit SIEM recognitions share one conservative function family. m312 selects a related cloud threat-analysis capability, rather than a vendor name. Collection, correlation, alerting, investigation and response remain different functions; sources or phrasing do not supply independent assessed components."
  },
  {
    "ids": [
      "m076",
      "m179",
      "m023",
      "m173",
      "m425"
    ],
    "meaning": "Rule tuning/validation, normal-baseline recognition and contextual vulnerability priority are distinct supplied decisions. Low alert volume or an anomaly alone does not establish precision, successful detection, risk-based triage or a universal priority order."
  },
  {
    "ids": [
      "m078",
      "m709",
      "m140"
    ],
    "meaning": "Flow export, a traffic-copy input and interpretation of a DNS-pattern hypothesis differ. None proves complete observation, plaintext access, malicious intent or evidence integrity; stale ARP metadata on m709 remains non-assessed."
  },
  {
    "ids": [
      "m176",
      "m366",
      "m140",
      "m243",
      "m333"
    ],
    "meaning": "Selecting relevant host evidence, interpreting a filter and recognising a DNS lead are bounded investigative decisions. Existing indicator-validation and telemetry-gap holds remain; no event ID or matched string alone confirms compromise or authorises containment."
  },
  {
    "ids": [
      "m361",
      "m366",
      "m086",
      "m089"
    ],
    "meaning": "SIEM capability, query interpretation, BIA naming and a source-limited risk calculation do not imply execution of a response plan. Incident management, evidence preservation, containment, reporting and recovery require separate authority and validation."
  },
  {
    "ids": [
      "m076",
      "m174",
      "m262"
    ],
    "meaning": "The two source-bound KEV/BOD teaching qualifications retain their unresolved current-policy and deadline details exactly. Tuning or alert prioritisation cannot resolve them, prescribe one universal response deadline or treat published mitigation guidance as a deployed validated control."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids.map(id=>'mcq:'+id),comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get('mcq:'+id),p=c.previous.get('mcq:'+id);return{recordId:s.row.recordId,sourceRevision:s.record.sourceSignature,localRevision:s.row.revisions.localEffective,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
const sourceBindings=[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective53-55-assurance-review.md',sha256:hashFile('docs/phase-2b5-objective53-55-assurance-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)},...inventory.map(({path,sha256})=>({path,sha256})),pilotBoundary.ownerContentDecisionBinding,pilotBoundary.ownerFamilyDecisionBinding,{path:'docs/phase-2b5-objective52-pilot-mapping-review.md',sha256:hashFile('docs/phase-2b5-objective52-pilot-mapping-review.md')},...pilot.draftComparisons.map(({path,sha256})=>({path,sha256}))];
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'5fc2a1f1a5cdeb4321fcb4daa46e5be3111a9144',sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,legacyTrackedPriorQuestions:363},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences,status:'current_revision_bound_prior_judgments_reconciled_before_new_credit'},bankSignature:c.ledger.bankSignature,selectionPolicy:'Requested objectives4.4/4.9 security-operations candidate set in supplied order; existing structural ranking recorded separately; all prior substantive packets reconciled before new question credit',structuralPriorityQuestionIds:rankedIds,candidateQuestionRecordIds:candidates.map(r=>r.recordId),selectedQuestionRecordIds:selected.map(r=>r.recordId),selectedFeedbackRecordIds:candidates.map(r=>'explanation:'+r.recordId),questionExclusions:exclusions,ambiguousPremiseOrContrastHolds:candidates.map(r=>r.recordId),ambiguityDisposition:'qualified_pending_owner_not_resolved_or_approved',sourceChecks,meaningBoundaryChecks,preservedKevTeachingHolds,pilotBoundary,preservedPilotFeedbackLinkReconciliation,questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorHolds,objective44Census:coverage44.census,objective49Census:coverage49.census,objective44Denominator:coverage44.denominator,objective49Denominator:coverage49.denominator,remainingObjective44RecordIds:coverage44.remainingRecordIds,remainingObjective49RecordIds:coverage49.remainingRecordIds,sharedObjectiveRecordIds,sharedRecordsCreateNoAdditionalGlobalCredit:true,bankProgress,unchangedObjective53Progress:base.objective53Denominator,unchangedObjective55Progress:base.objective55Denominator,unchangedObjective51Progress:base.unchangedObjective51Progress,unchangedObjective52Progress:base.unchangedObjective52Progress,unchangedObjective54Progress:base.unchangedObjective54Progress,unchangedObjective45Progress:base.unchangedObjective45Progress,unchangedObjective46Progress:base.unchangedObjective46Progress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},privateBoundary:{p003Revision:'sha256:f2eb1e715fa9fcda87ada668d7d17dfdf6b44840328d5ffeb460e3a342e502f2',p003PrivateRecordIds:privateP003.map(r=>r.id),p003PayloadReviewed:false,p003TrustedRevisionId:null,p017Revision:'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42',payloadReviewed:false,trustedRevisionId:null,localPilotFallbackDoesNotTransferToPrivate:true},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
function validate(value){
 assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);
 assert.equal(new Set(value.selectedQuestionRecordIds).size,12);assert.equal(value.questionProposals.length,12);assert.equal(value.explanationProposals.length,12);
 assert(value.questionProposals.every(r=>!c.previous.has(r.recordId)));assert(value.explanationProposals.every(r=>!legacyPrevious.has(r.recordId)));
 for(const r of value.questionProposals){const s=c.questions.get(r.recordId);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);}
 for(const r of value.explanationProposals){const s=c.questions.get(r.parentId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.record.localRevisionSignature);assert.equal(r.mainCorrectionRevision,sig(s.q.exp));assert.equal(r.wrongFeedbackRevision,sig(s.q.wrongFeedback));assert.equal(r.distractorCorrections.length,3);}
 // Every exported decision is checked against independently rebuilt current sources and fixed review judgments.
 const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);
}
let completedNegativeChecks;validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet);assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<12;i++){
 reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);reject(p=>p.questionProposals[i].trustedRevisionId='invented');reject(p=>p.questionProposals[i].sourceInspectionRevision='stale');reject(p=>p.questionProposals[i].contentQualification='');reject(p=>p.questionProposals[i].primaryConceptProposal='invented');reject(p=>p.questionProposals[i].humanApproved=true);reject(p=>p.questionProposals[i].newFamilyCredit=1);reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);reject(p=>p.questionProposals[i].familyLabelProposal='independent');reject(p=>p.questionProposals[i].objectiveScopeProposal={assessedCodes:['4.9'],status:'approved'});reject(p=>p.questionProposals[i].skillRoleProposal='invented');reject(p=>p.questionProposals[i].difficultyDisposition='calibrated');
}
for(let i=0;i<12;i++){
 reject(p=>p.sourceChecks[i].snapshotReplayChecked=!p.sourceChecks[i].snapshotReplayChecked);reject(p=>p.sourceChecks[i].revisions.authored=p.sourceChecks[i].revisions.authored===null?'invented':null);reject(p=>p.sourceChecks[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);reject(p=>p.sourceChecks[i].optionShuffleProbe.feedbackRemapChecked=false);reject(p=>p.sourceChecks[i].sourcePriority=0);reject(p=>p.sourceChecks[i].changedWrongCorrectionCount=99);
 reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%12].sourceRevision);reject(p=>p.explanationProposals[i].parentLocalRevision='stale');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');reject(p=>p.explanationProposals[i].objectiveScopeProposal={assessedCodes:['4.9']});reject(p=>p.explanationProposals[i].mainCorrectionRevision='stale');reject(p=>p.explanationProposals[i].deliveryGate='all_before_submit');reject(p=>p.explanationProposals[i].approvedRemediation=true);reject(p=>p.explanationProposals[i].parentDispositionStatus='unreconciled');reject(p=>p.explanationProposals[i].reusedParentDispositionRevision='invented');
 for(let k=0;k<3;k++){reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].choiceRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].teachingRationale='');reject(p=>p.explanationProposals[i].distractorCorrections[k].assessedSecondary=true);}
}
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);for(const path of holdPaths)reject(p=>{let r=p.priorHolds;for(const k of path.slice(0,-1))r=r[k];r[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{let old=p.priorHolds;for(let i=0;i<19;i++)old=old.inheritedHolds;old=old.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
for(let i=0;i<42;i++)reject(p=>p.allPacketReconciliation.olderQuestions[i].priorDispositionRevision='stale');
reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.allPacketReconciliation.olderQuestions.push(p.allPacketReconciliation.olderQuestions[0]));reject(p=>p.allPacketReconciliation.supportOnlyReferences[0].status='fully_reviewed');reject(p=>p.questionProposals.push({...p.questionProposals[0],recordId:'mcq:m066'}));reject(p=>p.questionExclusions.push({recordId:'mcq:m066',newQuestionCredit:1}));reject(p=>p.ambiguousPremiseOrContrastHolds.pop());reject(p=>p.ambiguityDisposition='cleared');reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=483);
for(const code of ['44','49']){reject(p=>p['objective'+code+'Census'].pop());reject(p=>p['objective'+code+'Denominator'].remaining=0);reject(p=>p['remainingObjective'+code+'RecordIds'].pop());reject(p=>p['objective'+code+'Denominator'].newQuestionDispositions=99);}
reject(p=>p.sharedObjectiveRecordIds.pop());reject(p=>p.sharedRecordsCreateNoAdditionalGlobalCredit=false);reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
for(const code of ['53','55','51','52','54','45','46'])reject(p=>p['unchangedObjective'+code+'Progress'].remaining=0);
reject(p=>p.structuralPriorityQuestionIds.reverse());reject(p=>p.sourceChecks[2].unchangedWrongCorrectionCount=0);reject(p=>p.pilotBoundary.roleWeightTeachingPublicationApprovalTransferred=true);reject(p=>p.pilotBoundary.cleanPointBoundary.hold='');reject(p=>p.pilotBoundary.recoveryBoundary='');reject(p=>p.pilotBoundary.preservedPilotQuestionProposals[0].primaryConceptProposal=null);reject(p=>p.pilotBoundary.mttrGlossaryBoundary.conceptLinkProposals=['recovery.mttr']);reject(p=>p.preservedPilotFeedbackLinkReconciliation[0].duplicateCredit=1);
for(let i=0;i<meaningBoundaryChecks.length;i++){reject(p=>p.meaningBoundaryChecks[i].stemRevision='stale');for(const [field,v]of Object.entries(meaningBoundaryChecks[i]))if(typeof v==='boolean')reject(p=>p.meaningBoundaryChecks[i][field]=!v);}
for(let i=0;i<2;i++){reject(p=>p.preservedKevTeachingHolds[i].contentQualification='resolved');reject(p=>p.preservedKevTeachingHolds[i].priorDispositionRevision='stale');reject(p=>p.preservedKevTeachingHolds[i].currentDeadlineOrDirectiveRequirementsResolved=true);}
reject(p=>p.privateBoundary.p003PayloadReviewed=true);reject(p=>p.privateBoundary.p003TrustedRevisionId='local-substitute');reject(p=>p.privateBoundary.p003Revision='local-substitute');
completedNegativeChecks=negativeMutationChecks;
const exported={...packet,negativeMutationChecks};validate(exported);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const report=[
 '# Phase 2B-5 — objectives 4.4 and 4.9 security-operations MCQs and complete feedback',
 '**NOT READY.** Review date: **11 October 2026**. Finite local/offline review. Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. Only the draft packet, this report and its focused audit are added. A pending disposition is a source-bound judgment; its hold records an unresolved limit without changing learner content.',
 '## Authority and finite selection',
 'The approved master plan and Phase 1 audit were read in full earlier in this continuing session. The master plan governs approved product decisions; the audit supplies historical implementation facts. Current source bindings were rechecked. No unresolved authority conflict affects this finite local slice. Standing local content/family delegation permits draft judgments; canonical scope, roles, skills, calibrated difficulty, teaching, weights, publication and activation remain separate gates.',
 'Requested order: **'+ids.join(', ')+'**. Source priorities: **10,25,10,20,35,35,35,30,130,10,25,35**. Structural rank: **'+rankedIds.join(', ')+'**. Scores prioritise inspection and do not establish correctness or difficulty. Each actual effective question, every choice, key, main explanation and all three wrong corrections are compared with local/published/trusted and authored/imported/captured/preeditorial sources.',
 '**12 new question judgments +12 new complete-feedback judgments =24 new pending catalogue dispositions.** All twelve questions and feedback bundles lack matching prior substantive judgments. No duplicate question credit, source-insufficient deferral or private substitute. New precise scope, role, skill, primary and trusted proposals remain null, secondary/link arrays empty, weights and novelty credit zero, and human/publication/teaching/evidence/activation approvals false. m709 uses its actual captured snapshot without inventing an authored source.',
 '## Reconciliation, separate objectives and residual coverage',
 'All **66 prior substantive packets** are reconciled before credit, including **42 older distinct question judgments (30 MCQs+12 local PBQs)**. **22 duplicate cross-packet references** and **seven brief support/link references** add no coverage. Historical links to the five already reviewed pilot-feedback bundles remain separate with zero extra credit. The frozen ledger and all prior packets are unchanged; thirteen older question-only judgments still lack full feedback.',
 '| Local assessment coverage | Prior | New | Combined | Remaining |\n| --- | ---: | ---: | ---: | ---: |\n| Question judgments | 405 | 12 | 417/483 | 66 |\n| Complete feedback | 392 | 12 | 404/483 | 79 |\n| Question and full-feedback pairs | 392 | 12 | 404/483 | 79 |',
 'Questions now cover **389/395 MCQs+28/88 local PBQs**, leaving **six MCQs+60 PBQs**. Complete pairs cover **388 MCQs+16 local PBQs**, leaving **seven MCQs+72 PBQs** without complete feedback. The 483 local-assessment denominator excludes two private alternatives, nine starter assessments and two guest demos. Counts deduplicate record identities.',
 '| Objective catalogue | Prior pending | New questions | New feedback | Combined pending | Remaining |\n| --- | ---: | ---: | ---: | ---: | ---: |\n| 4.4 monitoring/alerting | 14 | 9 | 9 | 32/120 | 88 local |\n| 4.9 incident response | 8 | 3 | 3 | 14/96 | 80 local+two private |',
 'Objective 4.4 contains 120 local records and no private metadata records. Objective 4.9 contains 94 local records+two private metadata-only p003 records. The prior dispositions are **14 and eight glossary definitions**, respectively; they do not approve the entire objectives. All nine local objective 4.4 MCQs and all three local 4.9 MCQs now have pending question/full-feedback judgments. The three 4.9 questions concern bounded investigative interpretation, not independently assessed incident-management, containment or recovery execution.',
 '| Remaining kind | Objective 4.4 | Objective 4.9 |\n| --- | ---: | ---: |\n'+[...new Set([...Object.keys(coverage44.denominator.remainingByKind),...Object.keys(coverage49.denominator.remainingByKind)])].sort().map(k=>'| '+k+' | '+(coverage44.denominator.remainingByKind[k]||0)+' | '+(coverage49.denominator.remainingByKind[k]||0)+' |').join('\n'),
 'Every one of the 120 and 96 census rows, residual IDs and source revisions is bound. Objective 4.4 residual local PBQs:**p024,p050,p089,p094**, each with separate feedback. Objective 4.9 residual local PBQs:**p003,p014,p015,p051,p083,p085**, each with separate feedback, plus distinct private p003 question/feedback records. The latter are not local-fallback substitutes. The objectives share **61 broad records** (29 flashcards,17 glossary definitions,five sections,four checks,three decks,one guide,one lesson and one trap unit), giving **155 distinct catalogue records**, rather than 216 separate global identities. No newly reviewed assessment overlaps the objectives; each of the 24 new dispositions is counted once globally.',
 'Earlier objective progress stays unchanged:5.3 **35/98,63 remaining**;5.5 **17/41,24 remaining**;5.1 **48/103,55 remaining**;5.2 **63/141,78 remaining (76 local+two private)**;5.4 **39/115,76 remaining**;4.5 **63/169,106 remaining**;4.6 **89/151,62 remaining**. Shared teaching/glossary records preserve exact prior qualifications, rather than expanding approved scope.',
 '## Twelve judgments and all wrong-choice corrections',
 reviews.map(r=>'**'+r.id+'.** '+r.meaning+'\n\n'+r.hold+'\n\nMain teaching judgment: '+r.main+'\n\nWrong-choice contrasts, in current wrong-choice order:\n\n'+r.contrasts.map((t,k)=>(k+1)+'. '+t).join('\n')).join('\n\n'),
 '## Source precedence and delivery checks',
 '**One actual captured/snapshot replay:m709.** The active upsert is dated **5 July 2026,04:26:03.663 UTC**, sort_order **416**, captured payload fingerprint **c5fe2e67be8526cb229cf12db26a39d250afc66d71eeaf8627d1319e26ca12f3**. Snapshot payload exactly matches the preeditorial source. Replay through the actual publication/editorial pipeline matches the current local semantics and published administrative order. No authored/imported m709 row exists; this is snapshot-only provenance, not a substituted local author or private record. Snapshot metadata does not prove a current live database read, switch configuration or deployment.',
 '**One import:m618,QB1 question18.** It equals its authored/preeditorial source and replaces three generic wrong corrections with specific contrasts. The other ten noncaptured rows also have authored=preeditorial sources. All twelve current source paths are sufficient for bounded review; no candidate is silently dropped.',
 '**Six preeditorial stems change:**m166,m179,m312,m361,m709,m366. **Seven option sets change:**m076,m179,m312,m361,m709,m176,m366. Authored-relative triage flags do not count m709 changes because there is no authored row. All twelve key positions remain unchanged; all twelve main explanations and all twelve whole wrong-correction bundles change.',
 '**36 wrong-choice corrections checked:34 changed/new+two unchanged.** Only m078 retains two individual corrections (PCAP and WAF); both are inspected and qualified. Seven authored rows have no wrongFeedback:m166,m179,m312,m361,m140,m176,m366,so their 21 current wrong corrections are new. m709 has three captured non-key corrections plus an empty keyed entry; its three current non-key corrections change. Every correction binds its actual choice hash, correction hash and teaching judgment with zero secondary evidence/weight.',
 '| Question | Authored domain/difficulty | Preeditorial domain/difficulty | Effective domain/difficulty |\n| --- | --- | --- | --- |\n'+candidates.map(row=>{const s=c.questions.get(row.recordId);return'| '+row.questionId+' | '+(s.authored?s.authored.ch+'/'+s.authored.difficulty:'unavailable; snapshot-only')+' | '+s.preQuestion.ch+'/'+s.preQuestion.difficulty+' | '+s.q.ch+'/'+s.q.difficulty+' |';}).join('\n'),
 'Observed domain changes:m312/m618 3→4,m140 2→4,and m709 captured2→effective4. Difficulty changes:m618 and m709 medium→easy,m140 and m366 hard→medium. These are source labels, not calibration or whole-objective scope approval. m361 replaces acronym/two-function wording with one capability decision;m312 replaces AWS product selection with capability recognition;m366 replaces specific SPL/-enc teaching with bounded prose filter interpretation. Removed trivia or a shorter stem creates no additional independent skill.',
 '**Twelve deterministic shuffles** execute the actual option-shuffle and wrong-feedback functions, preserving keyed meaning and all 36 correction associations after remapping. Existing practice/launch bindings match. Twelve source-bound meaning probes keep SIEM correlation apart from compromise/response, tuning apart from measured coverage, flows apart from guaranteed complete captures, anomaly deviation apart from attacks/mandatory ML, collection apart from cloud analysis, passive copying apart from blocking/all-packet guarantees, DNS leads apart from confirmed tunnelling, event IDs apart from proven lateral movement and matching encoded-command records apart from malicious/administrator-only/all-execution results.',
 'Feedback remains conditional on selection, submission, entitlement and the chosen wrong option. No SIEM query, PowerShell command, DNS lookup, packet capture, cloud configuration, baseline/rule change, incident investigation, evidence collection, containment, report, recovery or learner behaviour is executed or observed. Supplied numbers in m076 describe workload only; no invented false-positive percentage or detection metric is calculated.',
 '## Conservative families and preserved authority',
 comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
 'm066,m166,m361,m618 share **multi-source-SIEM-function-identification**, despite different wording, alternatives and an imported source. m312 is a related generic cloud-analysis capability contrast; no independent-family approval follows. The remaining provisional labels describe tuning/validation, flow/capture recognition, baseline detection, passive sensor copying, a DNS hypothesis, host evidence selection and a recorded-command filter. All have zero novelty/mastery credit. Compound wording, multiple source examples or paired tool functions do not establish independently scored components.',
 'Event detection highlights potentially adverse activity; alert triage validates and prioritises reports; investigation tests hypotheses and establishes context; containment limits harm; evidence handling preserves integrity/provenance; reporting follows authorised obligations; recovery restores and validates service. These are explanatory distinctions, not a universal sequence, approved canonical roles or evidence that a learner performed any step. Urgent authorised actions and evidence needs can require context-specific coordination. Policy names and exam terminology alone do not determine authority, urgency or current obligations.',
 'Exact owner content/family decisions, all three draft-comparison hashes and the five original recovery pilot-role proposals remain preserved. All 15 approved draft content revisions and 14 editorial family judgments stay separate from immutable draft flags. mtd.01 remains in m196\'s family with zero novelty;rpo.03\'s accepted clean-point distinction retains no psychometric independence, learner transfer or clean-source guarantee. MTTR glossary and coarse p048/p211 support-only limits remain. Earlier SLA, legal-role, risk-transfer, tabletop, SIEM-glossary and m709 false-ARP-reference qualifications stay exact. No approval transfers to metadata, teaching, weights, evidence or publication.',
 '## Primary-source support and inference limits',
 '[NIST SP 800-61r3](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r3.pdf),April 2025,DE.AE and RS.MA distinguishes adverse-event analysis, correlation, incident criteria and triage. RS.AN addresses investigation and preserving records/data integrity and provenance; reporting and recovery have separate outcomes. Our inference rejects an alert or tool label as a completed response and withholds one universal task order. No actual incident criteria, authority or evidence records are inspected.',
 '[NIST SP 800-94](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-94.pdf),February 2007,section2.3 describes signatures, baselines and false-positive/false-negative tuning limits. It supports the introductory anomaly and tuning distinctions, not current product performance or guaranteed detection. Heuristic terminology and combined product functions remain contextual. [RFC 7011](https://www.rfc-editor.org/rfc/rfc7011.html),section2 defines flows, observation points, records and sampling. Our inference qualifies the supplied metadata-versus-capture contrast; no exporter template, packet bytes or measured storage advantage is inspected.',
 '[Cisco SPAN documentation](https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/mgmt/management-configuration-guide/span.html) describes selected source/destination copying and oversubscription losses. It supports m709\'s no-all-packet guarantee; it does not identify the scenario\'s switch model or universally prove performance/production impact. The captured no-disruption/deep-inspection wording is not promoted to such a guarantee.',
 '[Microsoft 4688 documentation](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4688) shows the Security channel and explains that command-line inclusion requires its policy setting; the default field is empty. [Microsoft 4624 documentation](https://learn.microsoft.com/windows/security/threat-protection/auditing/event-4624) describes successful logon and network-logon context. [Microsoft System-event guidance](https://learn.microsoft.com/en-us/troubleshoot/windows-server/performance/troubleshoot-unexpected-reboots-system-event-logs) lists7045 under Service Control Manager service installation and warns to match event sources. These support channel/provider distinctions, not confirmed lateral movement or complete telemetry. [PowerShell parameter documentation](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe?view=powershell-5.1) documents EncodedCommand and a legitimate example; matching its use alone does not establish malicious intent. No current SPL query or Windows configuration is executed.',
 '[AWS foundational-source documentation](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_data-sources.html) distinguishes GuardDuty\'s analysis streams from customer-managed log access/retention and qualifies DNS coverage by resolver. It supports keeping the authored vendor-service recording confusion out of the current generic capability judgment. No customer account, all-API-call coverage, product configuration or source retention is inspected. [MITRE DNS technique](https://attack.mitre.org/techniques/T1071/004/) documents DNS use for C2,including TXT examples. Our inference treats the supplied pattern as a lead, not a verified technique instance, actual exfiltration, attribution or universal DNS threshold.',
 '## Preserved holds and release boundary',
 'All twelve preceding 5.3/5.5 feedback holds are inherited, including diligence/care timing, agreements versus performance, audit permission versus evidence, outsourcing duties, independence, certification scope, tester knowledge/permission and archived-record boundaries. Every earlier 5.1/5.2/5.4/4.5/4.6/4.8/4.3 and earlier scope, role, supplier, crypto, PKI, PFS, channel, Unicode, PBQ grammar/grading, delivery, targeting and policy-currentness limit stays exact. Earliest m305 whole scope,m046 precise contrast and m432 numbered-scope holds are explicitly tested against erasure.',
 '**KEV/BOD current-policy hold preserved exactly.** Both m174 and m262 feedback dispositions bind their existing packet paths,row revisions and full qualifications. The older BOD 22-01 teaching and previously captured September 2026 reference to BOD 26-04 do not establish the full directive, supersession details or universal deadlines. This review neither fetches/re-certifies those rules nor invents a response SLA. Their unresolved teaching boundary remains false for current-policy resolution.',
 'Private p003 question and feedback retain **sha256:f2eb1e715fa9fcda87ada668d7d17dfdf6b44840328d5ffeb460e3a342e502f2**,metadata-only/unavailable/unreviewed with null trusted identity. Local p003 is a separate residual fallback, not transferred private coverage. The existing p017 boundary remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**,unavailable/unreviewed. No private payload fetch, compilation or export. Exports contain no stems, offered choices, keys, option-indexed grading fields or learner records.',
 'Active package unchanged:**1878 records/435 identities/2954 review decisions/489 unresolved mappings/seven existing primary proposals**,SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All 25 protected hashes remain exact. Private semantics,36 unsupported local PBQ grammars,residual coverage,held qualifications,canonical metadata,taxonomy and calibration still block readiness.',
 '**NOT READY.** Local/default-off/unwired/learner-invisible. No runtime,active-package,canonical role/scope/skill/difficulty,teaching/weight,learner evidence,shadow/live write,migration,publication,cohort,deployment,activation or Phase 3 change.',
 '## Validation and delivery',
 'Run node '+scriptPath+' and npm run audit:content-mapping. Focused validation rebuilds the frozen ledger,reconciles66 prior packets,binds12 new questions/12 complete bundles,checks36 corrections/one actual snapshot replay/12 shuffles/12 meaning probes,and separately checks120/96 census rows and88/82 residuals. **'+negativeMutationChecks+' rejected mutations** cover stale sources,wrong corrections,source-only provenance,invented roles/trust/credit/captures,qualification/hold erasure,objective overlap,support overcount,private substitution,forbidden exports and activation.',
 'All 29 mapping tests,deterministic package reproduction,25 protected-file checks and git diff --check are required before the exact three-file **[skip deploy]** commit/push. The configured Vercel skip marker is verified. Delivery requires exact local HEAD=origin/main=remote refs/heads/main and artifact hashes. Git push does not establish a live deployment;unrelated dirty/generated files remain unstaged.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE44_49_OPERATIONS_NOT_READY',candidateIds:ids,newQuestionDispositions:12,newFeedbackDispositions:12,reusedQuestions:0,bankProgress,objective44:packet.objective44Denominator,objective49:packet.objective49Denominator,snapshotReplays:1,wrongCorrections:36,changedWrongCorrections:34,unchangedWrongCorrections:2,shuffleProbes:12,meaningProbes:12,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
