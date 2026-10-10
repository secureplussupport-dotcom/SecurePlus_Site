import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-objective48-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective48-mcqs-proposals.json',reportPath='docs/phase-2b5-objective48-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective43-mcqs-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'b50dcd8a2f4f5cf653aa5a0bca86ed4b8c2f4b5e9b57caa9b07aa33419e135da');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);
const ids=['m025','m070','m724','m098','m171','m333','m334','m627','m629','m630','m352','m022','m073','m168','m169','m170','m182','m068'];
const requested=['m022','m025','m068','m070','m073','m098','m168','m169','m170','m171','m182','m333','m334','m352','m627','m629','m630','m724'];
const candidates=c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('4.8')&&!legacyPrevious.has(r.recordId)).sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en'));
assert.deepEqual(candidates.map(r=>r.questionId),ids);assert.deepEqual([...ids].sort(),requested);assert.deepEqual(candidates.map(r=>r.priorityScore),[135,135,130,35,35,35,35,30,30,30,25,20,20,20,20,20,20,10]);
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
assert.equal(inventory.length,57);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);
const excluded=candidates.filter(r=>c.previous.has(r.recordId)),selected=candidates.filter(r=>!c.previous.has(r.recordId));
assert.deepEqual(excluded.map(r=>r.questionId),['m630','m352','m022','m168','m169','m068']);assert.equal(selected.length,12);assert(candidates.every(r=>!c.previous.has('explanation:'+r.recordId)));
const exclusions=excluded.map(r=>{const p=c.previous.get(r.recordId);return{recordId:r.recordId,sourceRevision:r.revisions.localEffective,publishedRecordSignature:r.revisions.publishedCatalogue,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),priorFamilyLabel:p.row.familyLabelProposal,reason:'current_matching_prior_substantive_question_judgment_reused_feedback_still_unreviewed',newQuestionCredit:0,newFamilyCredit:0};});
const reviews=[
  {
    "id": "m025",
    "meaning": "Choose a SHA-256 source/image comparison for the specified acquired byte-copy integrity check.",
    "hold": "HOLD hash equality as court admissibility, complete lawful acquisition, proven original authenticity or an entire unmodified custody history. Define matching data/ranges and trusted comparison inputs; handling and timestamps need documentation. Current SHA-256 copy-integrity question replaces broad admissibility and MD5 teaching. Captured MD5 acronym metadata is stale for this stem and conditional tooltip delivery is unobserved. Strongly correlate m070; one provisional copy-integrity family, no independent legal/custody skills. No disk, acquisition or hash calculation is performed.",
    "main": "Compare the defined source and acquired image bytes using a suitable trusted digest; custody and admissibility remain separate.",
    "contrasts": [
      "Photographs/serial numbers document identity and handling context, not byte equality.",
      "A transfer log supports custody history but does not compare copied bytes.",
      "Interviews may support investigation but do not validate image byte integrity."
    ],
    "role": "forensic_copy_integrity_method_choice",
    "family": "forensic_copy_integrity_comparison",
    "whole": false
  },
  {
    "id": "m070",
    "meaning": "Interpret matching source/image SHA-256 values as supporting the specified byte-copy integrity comparison.",
    "hold": "HOLD matching hashes as encryption, safe original-media reuse, complete custody, legal admissibility or proof of all prior handling. The comparison depends on actual defined byte ranges, trusted inputs and algorithm; matching values are supporting integrity evidence rather than proof of an authentic original. Current narrower result replaces generic forensic-soundness/GDPR claims. Captured GDPR acronym metadata remains stale and is not privacy-compliance proof. Same provisional family as m025; no new independence. No device, digest or custody record is tested.",
    "main": "Matching digests support the defined copy comparison; they do not encrypt data or document every transfer.",
    "contrasts": [
      "Digest comparison does not establish disk encryption.",
      "A match does not authorise reuse or overwriting of original evidence.",
      "Handling/transfer history requires a separate custody record."
    ],
    "role": "forensic_copy_integrity_result_interpretation",
    "family": "forensic_copy_integrity_comparison",
    "whole": false
  },
  {
    "id": "m724",
    "meaning": "Recognise e-discovery as the described overall preservation/collection/review/production workflow for electronic litigation information.",
    "hold": "HOLD workflow-name recognition as whole 4.8 competence or automatic legal admissibility. Preservation/hold, collection, review and authorised production have different roles; relevance, privilege, proportionality, privacy and jurisdiction-specific duties require counsel and actual authority. Snapshot-only with no authored/imported substitute; no court order, litigation data or disclosure is performed. Related hash/custody questions do not assess this whole workflow. No current jurisdiction-specific deadline or legal certification is inferred.",
    "main": "E-discovery describes this overall electronic litigation-information workflow; a hold and custody records support narrower parts.",
    "contrasts": [
      "Custody documents possession/handling; it is not the entire discovery workflow.",
      "A legal hold preserves relevant information, not all collection/review/production activities.",
      "Disk imaging is a collection method rather than the entire described workflow."
    ],
    "role": "ediscovery_workflow_name_recognition",
    "family": "ediscovery_workflow_name_recognition",
    "whole": true
  },
  {
    "id": "m098",
    "meaning": "Choose a supported policy-authorised VM snapshot explicitly including memory to retain accessible volatile state.",
    "hold": "HOLD every snapshot as including RAM, every hypervisor as supporting it, or a capture as complete/unmodified evidence with no interruption. The current premise explicitly supplies running VM, support and permission, replacing the authored unstated-VM Windows case. Settings, pause/consistency effects, export usability, timestamps, accessible state and custody require validation. Disk-only backup does not retain RAM; reboot/power-off can destroy volatile state. Safety or incident harm can override collection order. No VM snapshot or evidence export is executed.",
    "main": "Use the stipulated memory-inclusive capability and document capture settings and changes; disk-only copying omits RAM.",
    "contrasts": [
      "Disk-only copying lacks the requested volatile RAM state.",
      "Rebooting into other media can lose current volatile state.",
      "Powering off first generally loses volatile state; urgent safety needs are separate."
    ],
    "role": "supported_VM_volatile_capture_choice",
    "family": "supported_volatile_state_collection",
    "whole": false
  },
  {
    "id": "m171",
    "meaning": "Apply order of volatility by prioritising accessible volatile state before persistent disk when safe and feasible.",
    "hold": "HOLD a fixed CPU/RAM/network/process sequence for every platform, impossible register acquisition, or evidence priority overriding safety and active damage. RFC3227 gives an example system order, not one universal tool-specific sequence. Accessibility, change rate, trusted tools, clocks, collection effects, permissions and feasibility matter; collection itself changes live state. Current stem removes authored universal ordering. Correlate m098 method choice without independently scoring each memory component. No collection, shutdown or live system is executed.",
    "main": "Prioritise accessible state likely to disappear, within safety/authority/feasibility limits; document effects and timestamps.",
    "contrasts": [
      "Persistent disk first can allow accessible volatile evidence to disappear.",
      "Power loss commonly discards volatile state rather than preserving it.",
      "Persistent archives should not automatically delay accessible evidence likely to disappear from the running host."
    ],
    "role": "volatility_collection_priority_choice",
    "family": "supported_volatile_state_collection",
    "whole": false
  },
  {
    "id": "m333",
    "meaning": "Recognise hypothesis-driven proactive process-telemetry investigation as the described threat hunt.",
    "hold": "HOLD activity-name recognition as whole incident-response competence, an encoded PowerShell string as malicious intent, no alert as a universal hunt prerequisite, or no results as no compromise. Telemetry availability and event schemas vary; authored generic Event4688 ParentImage/CommandLine assertions are not guaranteed fields/configuration. A hunt may follow alerts/incidents and test benign alternatives. Current scenario removes the fixed schema assertion. No query, endpoint telemetry, detection or attribution is executed.",
    "main": "The supplied hypothesis and proactive telemetry search identify hunting; actual findings still require contextual validation.",
    "contrasts": [
      "Reacting only to a generated alert does not match this supplied proactive hypothesis.",
      "A known-file signature check alone does not test the described process relationship.",
      "Vulnerability enumeration does not itself investigate the supplied execution behaviour."
    ],
    "role": "threat_hunt_activity_recognition",
    "family": "hypothesis_driven_hunting_recognition",
    "whole": true
  },
  {
    "id": "m334",
    "meaning": "Name containment for the supplied network isolation intended to limit ransomware spread.",
    "hold": "HOLD phase naming as whole 4.8 competence, isolation as guaranteed stop of ransomware/local encryption, or mandatory evidence capture before urgent containment. Alternate interfaces/dependencies and local execution remain risks; authorisation, safety and evidence feasibility govern action. Current main removes authored guarantee and after-capture ordering. Historical Rev2 grouping is not the current framework. Shared provisional containment family with m627 and prior m022/m169, no new independence or actual containment result.",
    "main": "Network isolation is a containment activity intended to limit spread; coordinate safety, endpoint action and feasible evidence.",
    "contrasts": [
      "Preparation builds response capabilities; the supplied network isolation responds to an active incident.",
      "Detection/analysis informs the decision, but the supplied isolation is a containment action.",
      "Lessons learned evaluates and improves handling, rather than performing this immediate isolation action."
    ],
    "role": "containment_activity_name_recognition",
    "family": "active-spread-containment-before-restoration",
    "whole": true
  },
  {
    "id": "m627",
    "meaning": "Name containment for the supplied switch-port/network disconnection intended to limit spread.",
    "hold": "HOLD phase recognition as whole incident-response skill or disconnection as proof spread/encryption has stopped. Local malware, alternate paths and critical dependencies remain; use authorised feasible controls and evidence/harm balance. Imported QB1 question27 changes domain3/medium to4/easy and replaces fallback corrections; labels are uncalibrated. Same provisional family as m334 and prior m022/m169; no independent restoration or backup skill. No network or incident action is performed.",
    "main": "The supplied isolation is containment; eradication, detection and recovery have related different primary purposes.",
    "contrasts": [
      "Detection/analysis identifies and assesses activity; isolation is a response control.",
      "Eradication removes causes rather than simply disconnecting a path.",
      "Recovery returns service under verified safe conditions; disconnection alone does not."
    ],
    "role": "containment_activity_name_recognition",
    "family": "active-spread-containment-before-restoration",
    "whole": true
  },
  {
    "id": "m629",
    "meaning": "Recognise the supplied post-incident review of timeline/gaps/playbooks as lessons learned.",
    "hold": "HOLD review-name recognition as whole 4.8 competence, lessons as only occurring after every incident activity ends, or a meeting as guaranteed recurrence prevention. Improvement can happen during response; evidence, owners, actions and follow-up verification matter. Imported QB1 question29 retains stem/key but replaces fallback corrections; medium-to-easy label is uncalibrated. Strongly correlate m182 broader review/RCA distinction in one provisional family. No meeting, playbook improvement or prevention outcome is observed.",
    "main": "Lessons learned evaluates the incident and response to drive documented verified improvements; preparation can benefit from it.",
    "contrasts": [
      "Eradication removes incident causes, not the broader retrospective review.",
      "Preparation can use the results, but the supplied review is the specific lessons-learned activity.",
      "Containment limits current damage rather than reviewing response performance."
    ],
    "role": "lessons_learned_activity_recognition",
    "family": "post_incident_review_recognition",
    "whole": true
  },
  {
    "id": "m630",
    "meaning": "Reuse prior discussion-only tabletop-recognition judgment; newly review its complete feedback.",
    "hold": "HOLD the wrong-feedback implication that every simulation exercises live technical actions. Simulation is broader and can describe discussion; tabletop is the most specific match to this premise. A discussion may reveal plan gaps without testing recovery execution/readiness or proving a service deadline. Imported QB1 question30 keeps the existing provisional shared family with m068/m352, zero new question/family credit. No exercise or restoration executes.",
    "main": "Tabletop is the precise discussion-based exercise here; it can simulate a scenario without testing live technical actions.",
    "contrasts": [
      "Simulation can include discussion; an explicitly technical action exercise differs from this supplied workshop.",
      "Parallel recovery tests a recovery capability rather than this purely verbal workshop.",
      "Penetration testing validates controls through authorised adversarial methods rather than this response-plan discussion."
    ],
    "role": "reused_tabletop_parent_feedback",
    "family": "discussion-only-tabletop-recognition",
    "whole": true
  },
  {
    "id": "m352",
    "meaning": "Reuse prior discussion-only tabletop-recognition judgment; newly review all corrections after the option rewrite.",
    "hold": "HOLD tabletop recognition as full 4.8 competence, all simulation as technical system execution, or full-scale as every capability universally tested. Current technical-simulation distractor is more precise than the authored generic simulation label, but actual exercise scope defines actions. Models/games may support discussion; findings require follow-up. Shared provisional m068/m630 family and existing question judgment, zero new credit; no preparedness/recovery result or exercise is observed.",
    "main": "The premise fits a facilitated tabletop; technical operations and adversarial testing have different scoped purposes.",
    "contrasts": [
      "The offered technical simulation describes exercising technical actions; simulation in general is not exclusive of discussion.",
      "Full-scale operations mobilise scoped capabilities; no exercise necessarily tests every possible capability.",
      "A penetration test attempts authorised adversarial validation rather than the supplied response discussion."
    ],
    "role": "reused_tabletop_parent_feedback",
    "family": "discussion-only-tabletop-recognition",
    "whole": true
  },
  {
    "id": "m022",
    "meaning": "Reuse prior active-spread containment choice; newly review its main and three wrong-choice teachings.",
    "hold": "HOLD rigid containment-then-eradication/recovery sequencing as universal, or lessons learned only after response has ended. Current feedback still says lessons happen after and eradication after containment: useful scenario shorthand, not universal timing. Real activities iterate/overlap; urgent harm, authority, safety and evidence feasibility govern decisions. Isolation can leave local encryption active. Preserve existing family with m169/m334/m627 and prior IRP support context, no new approval or new question credit; no response action executes.",
    "main": "Limit supplied active spread under the plan, while coordinating feasible evidence and iterative response/improvement.",
    "contrasts": [
      "Cleaning alone may miss continuing spread; eradication and containment can overlap where justified.",
      "Premature restore can expose recovered systems; actual safety/eradication validation governs timing.",
      "A retrospective is not the immediate spread-limiting control; lessons and improvement can also occur during response."
    ],
    "role": "reused_containment_parent_feedback",
    "family": "active-spread-containment-before-restoration",
    "whole": false
  },
  {
    "id": "m073",
    "meaning": "Recognise deliberately confirmed investigation-obstructing log deletion as anti-forensics.",
    "hold": "HOLD term recognition as whole forensic competence, missing logs alone as intent/insider/sophistication proof, or the legal-hold distractor as proving a hold was absent/already preceded deletion. Current stem supplies confirmed deliberate obstruction, replacing authored inference from a gap. Retention faults are alternate explanations outside that premise. Legal holds can apply before or after loss and create separate duties; no timestamp or jurisdiction is supplied. No evidence deletion, attribution or preservation order is observed.",
    "main": "Deliberate obstruction fits anti-forensics under the confirmed premise; a log gap alone does not prove it.",
    "contrasts": [
      "Custody documents handling and is distinct from the stipulated intruder obstruction.",
      "Volatility guides collection rather than naming intentional destruction.",
      "A hold concerns preservation; the stem supplies no hold timing, so existing already-deleted-before-hold teaching is unsupported."
    ],
    "role": "anti_forensics_term_recognition",
    "family": "deliberate_investigation_obstruction_recognition",
    "whole": true
  },
  {
    "id": "m168",
    "meaning": "Reuse prior explicitly historical NIST800-61 Revision2 phase-group identification; newly review the feedback.",
    "hold": "HOLD the historical four groups as the current NIST structure or a universally linear mandatory execution order. Rev3 superseded Rev2 in April2025 and integrates CSF2.0; the stem explicitly asks Rev2 so historical naming remains supportable. Preparation/improvement are ongoing and response activities can overlap. Existing family and question judgment reused with zero credit. No current compliance or incident process is certified.",
    "main": "The offered grouping matches the explicitly historical Rev2 framework; do not present it as the current revision.",
    "contrasts": [
      "The alternative omits the named preparation group.",
      "The option does not match the historical named grouping; do not turn its ordering critique into a universal operational law.",
      "The listed relevant activities are not the four named Rev2 groups."
    ],
    "role": "reused_historical_IR_parent_feedback",
    "family": "historical-rev2-lifecycle-group-identification",
    "whole": true
  },
  {
    "id": "m169",
    "meaning": "Reuse prior authorised safe active-spread isolation choice; newly review full correction coverage.",
    "hold": "HOLD network isolation as guaranteed containment of local encryption or alternate paths, recovery only after a universally final eradication event, payment as guaranteed restore, or formatting always required. Current premise explicitly authorises isolation and excludes safety-critical dependencies, replacing an unconditional FIRST rule. Coordinate endpoint action/evidence while limiting harm; payment/legal duties depend on actual jurisdiction/authority and are not decided here. Shared containment family reused; zero new question credit, no real response or ransom action.",
    "main": "Prioritise authorised isolation for supplied active spread with feasible evidence and endpoint coordination.",
    "contrasts": [
      "Restoring during active spread risks re-exposure; validation and safe conditions govern actual recovery.",
      "Variant analysis may inform response but payment does not itself contain the supplied spread or guarantee recovery.",
      "Formatting can destroy evidence and does not first block spread to other hosts."
    ],
    "role": "reused_containment_parent_feedback",
    "family": "active-spread-containment-before-restoration",
    "whole": false
  },
  {
    "id": "m170",
    "meaning": "Recognise chain of custody as the practice documenting possession, transfers and evidence handling.",
    "hold": "HOLD custody-name recognition as whole forensics competence, complete records as guaranteed absence of tampering/legal admissibility, or an unbroken chain as universally required for all courts. Authored broad legal-required guarantee is superseded by current documentation question. Lawful authority, integrity, relevance, authenticity and jurisdiction remain distinct; record gaps require explanation rather than automatic universal exclusion. No 48-hour universal deadline or commercial-tool legal safe harbour follows. No evidence or court case is processed.",
    "main": "Custody records who handled the evidence and when/how; integrity and lawful admissibility require separate context.",
    "contrasts": [
      "Tool branding does not replace custodian/transfer documentation or establish lawful handling.",
      "A universal 48-hour limit is neither stipulated nor a custody history.",
      "Compression alone packages data without recording handling or proving integrity."
    ],
    "role": "chain_of_custody_practice_recognition",
    "family": "evidence_custody_record_recognition",
    "whole": true
  },
  {
    "id": "m182",
    "meaning": "Recognise broad response-performance review as lessons learned and root-cause analysis as one input.",
    "hold": "HOLD name recognition as whole 4.8 competence, RCA as technical-only, tabletop as only usable before an incident, hunting as impossible during response, or a review as guaranteed prevention. Root causes can include human/process/technical factors; reviews may incorporate causes and recommendations, and improvement is ongoing. Current main narrows old claims; m629 strongly correlates in one provisional review family. No meeting, RCA, playbook change or improvement outcome is tested.",
    "main": "The described broader evaluation is lessons learned; root-cause analysis informs it without being identical.",
    "contrasts": [
      "A tabletop discusses a hypothetical scenario and can use lessons from a real event at different times.",
      "RCA examines underlying causes, including process/human factors, within a broader response review.",
      "Hunting searches for threats; it can occur during/after incidents but is not this supplied performance review."
    ],
    "role": "lessons_learned_activity_recognition",
    "family": "post_incident_review_recognition",
    "whole": true
  },
  {
    "id": "m068",
    "meaning": "Reuse prior discussion-only tabletop-recognition judgment; newly review all corrections.",
    "hold": "HOLD tabletop naming as actual response/recovery readiness, red teaming as always more intensive or only live compromise, penetration testing as guaranteed successful compromise, or chaos engineering as production-only. Actual scopes and authority govern methods; tabletop is most specific here. Current chaos correction removes the authored production-only claim, while red-team comparative intensity remains qualified. Shared m352/m630 family reused with zero question/family credit. No exercise, failure experiment or exploit executes.",
    "main": "The stipulated purely discussed scenario is a tabletop; other scoped methods do not match this premise.",
    "contrasts": [
      "Penetration testing attempts authorised adversarial validation without guaranteed compromise.",
      "Red teaming uses adversarial objectives and may use scoped simulations; intensity is not universally greater.",
      "Chaos engineering uses controlled failure experiments in approved environments, not necessarily production."
    ],
    "role": "reused_tabletop_parent_feedback",
    "family": "discussion-only-tabletop-recognition",
    "whole": true
  }
];
assert.deepEqual(reviews.map(r=>r.id),ids);
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();
const scope=r=>r.whole?{assessedCodes:[],contextCodes:['4.8'],status:'held_whole_numbered_name_or_historical_group_recognition'}:{assessedCodes:['4.8'],contextCodes:[],status:'inferred_narrow_response_or_collection_choice_pending_owner_not_whole_objective'};
const sourceChecks=candidates.map((row,i)=>{
 const s=c.questions.get(row.recordId),q=s.q,shuffled=shuffle(q);assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);assert.equal(q.correct,s.preQuestion.correct);
 assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
 for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
 if(i<3){assert.equal(s.snapshots.length,1);assert.equal(s.captures.length,1);const replay=publicationPipeline(c.bank).overrides(s.snapshots).mcqs.find(x=>x.id===q.id),{_baseOrder,_adminOrder,...semantics}=replay;assert.equal(sig(semantics),row.revisions.localEffective);assert.equal(s.pub._adminOrder,s.captures[0].sort_order);assert.equal(s.authored===null,i===2);}
 else{assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert(s.authored);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);assert.equal(q.correct,s.authored.correct);}
 return{recordId:row.recordId,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:i<3,sourceLayerDisposition:i===2?'snapshot_only_no_authored_or_imported_substitute':i<2?'authored_then_captured_snapshot_then_effective_editorial':'authored_equals_preeditorial_then_effective_editorial',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',authoredMissingWrongCorrections:s.authored===null?null:!s.authored.wrongFeedback,optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0},status:'source_inspection_no_additional_question_credit'};
});
assert.equal(sourceChecks.filter(r=>r.snapshotReplayChecked).length,3);assert.equal(candidates.filter(r=>r.flags.stemChanged).length,12);assert.equal(candidates.filter(r=>r.flags.optionsChanged).length,7);assert.deepEqual(candidates.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m627','m629','m630']);
const questionProposals=selected.map(row=>{
 const i=ids.indexOf(row.questionId),r=reviews[i],check=sourceChecks[i];
 return{recordId:row.recordId,questionId:r.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourceInspectionRevision:sig(check),assessedUnderstanding:r.meaning,contentQualification:r.hold,objectiveScopeProposal:scope(r),skillRoleProposal:r.role,numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:r.family,familyStatus:'provisional_comparison_no_independence_approval',difficultyObserved:check.difficultyObserved,difficultyDisposition:'source_label_uncalibrated'};
});
const explanationProposals=candidates.map((row,i)=>{
 const s=c.questions.get(row.recordId),q=s.q,r=reviews[i],indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct),prior=c.previous.get(row.recordId);
 assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
 return{recordId:'explanation:'+row.recordId,kind:'explanation_bundle',parentId:row.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:row.revisions.localEffective,parentPublishedRevision:row.revisions.publishedCatalogue,parentDispositionStatus:prior?'existing_matching_question_judgment_reused':'new_question_judgment_in_this_packet',reusedParentDispositionRevision:prior?sig(prior.row):null,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:r.main,contentQualification:r.hold,objectiveScopeProposal:scope(r),withheldPreciseContrast:r.role+'_limits',roleProposal:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:r.contrasts[k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId)),broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('4.8')),old=broad.filter(r=>c.previous.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id));
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
assert.equal(broad.length,130);assert.equal(old.length,15);assert.deepEqual(counts(old),{glossary_definition:7,mcq:6,pbq:2});assert.equal(selectedIds.size,30);assert.equal(remaining.length,85);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,9);
assert.deepEqual(remaining.filter(r=>r.kind==='pbq').map(r=>r.id),['pbq:p007','pbq:p009','pbq:p030','pbq:p034','pbq:p040','pbq:p084','pbq:p099']);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,priorQuestions=bankRows.filter(r=>c.previous.has(r.recordId)),legacyQuestions=bankRows.filter(r=>legacyPrevious.has(r.recordId)),priorFeedback=bankRows.filter(r=>legacyPrevious.has('explanation:'+r.recordId));
assert.equal(priorQuestions.length,319);assert.equal(legacyQuestions.length,277);assert.equal(priorFeedback.length,277);
const combinedQuestions=new Set([...priorQuestions.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=bankRows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
assert.equal(combinedQuestions.size,331);assert.equal(combinedFeedback.size,295);assert.equal(paired.length,295);assert.equal(paired.filter(r=>r.kind==='mcq').length,279);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,legacyTrackedPriorQuestions:legacyQuestions.length,legacyTrackedCombinedQuestions:legacyQuestions.length+questionProposals.length,legacyTrackedCombinedMcqs:legacyQuestions.filter(r=>r.kind==='mcq').length+questionProposals.length,legacyTrackedLocalPbqs:legacyQuestions.filter(r=>r.kind==='pbq').length,olderQuestionOnlyDispositions:olderQuestions.length,allPacketPriorQuestions:priorQuestions.length,newQuestions:questionProposals.length,allPacketCombinedQuestions:combinedQuestions.size,remainingQuestionDispositions:483-combinedQuestions.size,combinedMcqs:bankRows.filter(r=>r.kind==='mcq'&&combinedQuestions.has(r.recordId)).length,combinedLocalPbqs:bankRows.filter(r=>r.kind==='pbq'&&combinedQuestions.has(r.recordId)).length,newFeedbackBundles:18,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.combinedMcqs,303);assert.equal(bankProgress.combinedLocalPbqs,28);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,36);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective43HeldDispositions:base.explanationProposals.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal})),olderQuestionPacketBindings:olderQuestions.map(r=>({recordId:r.recordId,priorPacketPath:r.priorPacketPath,priorDispositionRevision:r.priorDispositionRevision,status:'existing_limits_preserved_no_full_feedback_or_approval_inherited'}))};
assert.equal(priorHolds.objective43HeldDispositions.length,19);assert(priorHolds.objective43HeldDispositions.find(r=>r.recordId==='explanation:mcq:m174').contentQualification.includes('26-04'));
const comparisonSpecs=[
 {ids:['m025','m070','m170','m724'],meaning:'m025/m070 share copy-integrity comparison teaching; custody-name recognition and the overall e-discovery name are different narrower tasks. Hashes, lawful authority, custody, preservation and production support different safeguards without independently proving admissibility. No separate legal/custody/crypto components or new family credit.'},
 {ids:['m098','m171'],meaning:'Supported memory-inclusive VM capture is a method choice; accessible volatile-state priority is a principle choice. Correlate collection teaching without granting independent RAM/register/process skills or assuming every platform/tool supports a snapshot.'},
 {ids:['m022','m169','m334','m627','m168'],meaning:'m022/m169 prior containment action choices and m334/m627 narrower containment labels overlap in one provisional active-spread family. Historical Rev2 group naming is distinct from a current executable plan. Preserve safety, authority, local-encryption, feasible-evidence and iterative response holds; no restoration/RTO/RPO or independent network components.'},
 {ids:['m068','m352','m630','m629','m182','m333','m073'],meaning:'m068/m352/m630 share the existing discussion-only tabletop family; no new question credit. m629/m182 strongly correlate in one provisional post-incident review family, with RCA part of a broader review. Hypothesis-driven hunting and stipulated deliberate anti-forensics are related investigation labels but differ from executed findings or exercises. No topic-based independent readiness, attribution or prevention proof.'}
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids.map(id=>'mcq:'+id),comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get('mcq:'+id),p=c.previous.get('mcq:'+id);return{recordId:s.row.recordId,sourceRevision:s.record.sourceSignature,localRevision:s.row.revisions.localEffective,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
const sourceBindings=[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective43-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective43-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)},...inventory.map(({path,sha256})=>({path,sha256}))];
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'009d5c211aaf98af8577653cc507a38e369f1f25',sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,legacyTrackedPriorQuestions:277},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences,status:'current_revision_bound_existing_question_judgments_no_new_credit_or_full_feedback_inference'},bankSignature:c.ledger.bankSignature,selectionPolicy:'Requested objective4.8 candidate set, ranked by existing structural triage then ID; all prior substantive packets reconciled before new question credit',candidateQuestionRecordIds:candidates.map(r=>r.recordId),selectedQuestionRecordIds:selected.map(r=>r.recordId),selectedFeedbackRecordIds:candidates.map(r=>'explanation:'+r.recordId),questionExclusions:exclusions,sourceChecks,questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorHolds,objective48Census:census,objective48Denominator:{broadCandidates:130,legacyPriorDispositions:7,allPacketPriorDispositions:15,newQuestionDispositions:12,newFeedbackDispositions:18,newAgentDispositions:30,combinedAgentDispositions:45,remaining:85,remainingByKind:counts(remaining)},remainingObjective48RecordIds:remaining.map(r=>r.id),bankProgress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},privateBoundary:{p017Revision:'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42',payloadReviewed:false,trustedRevisionId:null,localPilotFallbackDoesNotTransferToPrivate:true},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
function validate(value){
 assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);
 assert.equal(new Set(value.selectedQuestionRecordIds).size,12);assert.equal(value.questionProposals.length,12);assert.equal(value.explanationProposals.length,18);
 assert(value.questionProposals.every(r=>!c.previous.has(r.recordId)));assert(value.explanationProposals.every(r=>!legacyPrevious.has(r.recordId)));
 for(const r of value.questionProposals){const s=c.questions.get(r.recordId);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);}
 for(const r of value.explanationProposals){const s=c.questions.get(r.parentId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.record.localRevisionSignature);assert.equal(r.mainCorrectionRevision,sig(s.q.exp));assert.equal(r.wrongFeedbackRevision,sig(s.q.wrongFeedback));assert.equal(r.distractorCorrections.length,3);}
 // Every exported decision is checked against independently rebuilt current sources and fixed review judgments.
 const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);
}
let completedNegativeChecks;validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet);assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<12;i++){
 reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);reject(p=>p.questionProposals[i].trustedRevisionId=p.questionProposals[i].revisions.trustedCompilerObserved);reject(p=>p.questionProposals[i].contentQualification='');reject(p=>p.questionProposals[i].primaryConceptProposal='invented');reject(p=>p.questionProposals[i].humanApproved=true);reject(p=>p.questionProposals[i].newFamilyCredit=1);reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);reject(p=>p.questionProposals[i].familyLabelProposal='independent');reject(p=>p.questionProposals[i].objectiveScopeProposal={assessedCodes:['4.8'],contextCodes:[],status:'approved'});
}
for(let i=0;i<18;i++){
 reject(p=>p.sourceChecks[i].snapshotReplayChecked=!p.sourceChecks[i].snapshotReplayChecked);reject(p=>p.sourceChecks[i].revisions.authored=p.sourceChecks[i].revisions.authored===null?p.sourceChecks[i].revisions.preEditorialSnapshotMerged:null);reject(p=>p.sourceChecks[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);reject(p=>p.sourceChecks[i].optionShuffleProbe.feedbackRemapChecked=false);reject(p=>p.sourceChecks[i].sourcePriority=0);
 reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%18].sourceRevision);reject(p=>p.explanationProposals[i].parentLocalRevision='stale');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');reject(p=>p.explanationProposals[i].mainCorrectionRevision='stale');reject(p=>p.explanationProposals[i].deliveryGate='all_before_submit');reject(p=>p.explanationProposals[i].approvedRemediation=true);
 for(let k=0;k<3;k++){reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].assessedSecondary=true);}
}
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);for(const path of holdPaths)reject(p=>{let r=p.priorHolds;for(const k of path.slice(0,-1))r=r[k];r[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{let old=p.priorHolds;for(let i=0;i<10;i++)old=old.inheritedHolds;old=old.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
for(let i=0;i<6;i++){reject(p=>p.questionExclusions[i].newQuestionCredit=1);reject(p=>p.questionExclusions[i].priorDispositionRevision='stale');}
for(let i=0;i<42;i++)reject(p=>p.allPacketReconciliation.olderQuestions[i].priorDispositionRevision='stale');
reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.allPacketReconciliation.olderQuestions.push(p.allPacketReconciliation.olderQuestions[0]));reject(p=>p.allPacketReconciliation.supportOnlyReferences[0].status='fully_reviewed');reject(p=>p.questionProposals.push({...p.questionProposals[0],recordId:excluded[0].recordId}));reject(p=>p.questionExclusions.pop());reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=331);reject(p=>p.objective48Census.pop());reject(p=>p.objective48Denominator.remaining=0);reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
completedNegativeChecks=negativeMutationChecks;
const exported={...packet,negativeMutationChecks};validate(exported);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const report=[
 '# Phase 2B-5 — objective 4.8 MCQs and full feedback',
 '**NOT READY.** Finite local draft review only. Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. A pending agent disposition records a judgment and its limits; it is not owner approval or a learner-scoring change. Only this packet, report and focused audit change. MCQ means multiple-choice question; a feedback bundle contains the main explanation and all three wrong-choice corrections. A hold keeps a claim unapproved without changing the current learner content.',
 '## Selection and exclusions',
 'All **18** requested local candidates were inspected in existing priority order: **'+ids.join(', ')+'**. Scores: **135, 135, 130, 35, 35, 35, 35, 30, 30, 30, 25, 20, 20, 20, 20, 20, 20, 10**. Priority is a structural reading cue, not correctness, ambiguity resolution or approval. Every current stem, option, key, main explanation and wrong correction was read with available authored/imported, captured snapshot and effective source layers.',
 '**Twelve new question judgments:** '+selected.map(r=>r.questionId).join(', ')+'. **Eighteen new complete feedback judgments**, including feedback for the six already-reviewed parents. Sufficient local source/revision evidence exists for these finite judgments; zero additional stale/private/insufficient-source deferrals. Ambiguities remain held, not automatically cleared.',
 '**Six questions excluded from new question credit** because older substantive packets already contain matching current judgments. Their feedback was not fully reviewed in those packets, so the eighteen feedback bundles remain eligible for this slice. Exact local/published revisions, packet paths, row signatures and prior family labels are bound in questionExclusions. No prior owner approval or support-concept approval is inherited.',
 '| Reused question | Earlier substantive packet | Existing judgment | New credit |\n| --- | --- | --- | --- |\n'+exclusions.map(r=>'| '+r.recordId+' | '+r.priorPacketPath+' | '+r.priorFamilyLabel+' | Feedback only; zero question/family |').join('\n'),
 '## Reconciliation: keep question and feedback totals separate',
 '**All 57 existing substantive proposal packets** were inventoried, hashed and their current record references checked. Both array and older dictionary sourceBindings were verified. Four older packets contain **42 distinct question-only dispositions** missing from the recent frozen ledger overlays: objective52-pilot-mapping-proposals, objective34-semantic-proposals, recovery-overlap-semantic-proposals and contextual-recovery-dispositions. These are **30 MCQs + 12 local PBQs**, with current matching local/published revisions. Their existing decisions are reused; none is new review work or approval. Duplicate references earn no extra coverage, including p211 in two older packets. Seventeen cross-packet reference occurrences are recorded without extra credit; repeated minimal unit references also earn none.',
 'Older instructional/teaching dependencies are not automatically full current-unit or main-plus-all-wrong-feedback reviews. Twelve unmatched link/context-only reference occurrences are recorded separately, including five explanation links and keywords:forensics-recovery. Those five minimal links do not add five full feedback bundles. No shared ledger/helper or historical packet is rewritten to hide the distinction. Objective52 has no own sourceBindings field; later dictionary-bound packets pin its exact file hash, and its question rows independently match current local/published revisions.',
 '| Coverage view | Before | Added here | After | Remaining |\n| --- | ---: | ---: | ---: | ---: |\n| Legacy tracked question judgments | 277 | 12 | 289/483 | 194 |\n| All-packet question judgments, including older question-only rows | 319 | 12 | 331/483 | 152 |\n| Full feedback bundles | 277 | 18 | 295/483 | 188 |\n| Complete question plus full-feedback pairs | 277 | 18 completed pairs | 295/483 | 188 |',
 'All-packet question judgments comprise **303/395 MCQs + 28/88 local PBQs**, leaving **92 MCQs + 60 PBQs** without a question disposition. Full pairs comprise **279 MCQs + 16 local PBQs**, leaving **116 MCQs + 72 PBQs** without full feedback. The legacy tracked view comprises **273 MCQs + 16 PBQs**. Six older question-only parents gain their missing full feedback here; **36 older question-only dispositions still lack a full feedback review**. These totals measure pending local judgments, not calibrated mastery or approved questions.',
 'Objective4.8 broad union: **130 records; 15 prior + 30 new = 45 pending dispositions; 85 remain**. Fifteen prior means seven glossary definitions, the six reused MCQs and two PBQ question judgments (p004,p043). All eighteen tagged MCQ questions now have a current pending question judgment, and all eighteen MCQ feedback bundles have a full pending judgment. Remaining: **seven PBQ question judgments** (p007,p009,p030,p034,p040,p084,p099), **nine PBQ feedback bundles** (including p004,p043), and **69 support/instructional records**. A prior PBQ semantic/context judgment is not a completed grammar, grading or feedback audit.',
 '| Remaining kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
 'The bank question denominator stays **483 local assessments**. Two private variants, nine starter assessments and two guest demos remain separate. Shuffles, comparison references, support links and machine inventory do not add reviewed questions.',
 '## Individual decisions, alternate readings and holds',
 reviews.map((r,i)=>'**'+r.id+' — '+(excluded.some(q=>q.questionId===r.id)?'existing question reused; new full feedback':'new question and full feedback')+'.** '+r.meaning+'\n\n'+r.hold+'\n\nMain teaching: '+r.main+'\n\nWrong-choice contrasts, in current wrong-choice order: '+r.contrasts.map((t,k)=>(k+1)+'. '+t).join(' ')).join('\n\n'),
 'The new questions have four narrow provisional activity choices (m025,m070,m098,m171) and eight held name-recognition scopes (m724,m333,m334,m627,m629,m073,m170,m182). The six reused question rows retain their existing unapproved judgments; feedback qualifications do not rewrite them. No whole objective, component skill, concept role or independent evidence is approved.',
 '## Source precedence and correction delivery',
 '**Three actual snapshot publication-pipeline replays** reproduce current effective semantics and captured ordering: m025,m070,m724. m025/m070 have authored content then one captured snapshot before editorial review. m724 is snapshot-only, with null authored revision; false authored-relative change flags do not establish unchanged content. No authored/imported substitute is invented. All other fifteen authored/imported revisions equal preeditorial revisions before effective editorial changes. All eighteen effective revisions differ from preeditorial, while keyed positions remain unchanged; unchanged positions do not imply unchanged decision meaning.',
 'Authored-relative stem-change flags, twelve: **m025,m070,m098,m171,m333,m334,m022,m073,m168,m169,m170,m182**. Option-change flags, seven: **m025,m070,m098,m171,m333,m334,m352**. m724 also changes materially from its snapshot source but has no authored comparison. m025/m070 narrow admissibility/forensic-soundness to a defined hash comparison; m724 names the overall discovery workflow. m098 adds explicit VM/support/permission; m171 removes a universal detailed acquisition order. m333 removes a universal event-schema premise; m334 names a supplied containment action. m022 removes generic NIST ordering; m073 supplies confirmed deliberate obstruction; m168 explicitly names historical Rev2; m169 supplies authorised isolation/no safety dependency; m170 narrows legal admissibility to custody documentation. m182 has a spelling-level stem change alongside narrower RCA teaching; a structural stem flag alone does not establish a new decision.',
 'm627/m629/m630 are imported **QB1 questions27/29/30**. Their source medium labels become effective easy; source domain3 becomes4. m025 authored hard → captured easy → effective medium; m070 authored hard → captured easy → effective easy; m098 hard → medium; m171 hard → medium; m333 hard → medium; m334 medium → easy; m073 hard → easy; m182 medium → easy. m724 stays source/effective medium. Labels are observed uncalibrated metadata, not scoring decisions. Captured m025 MD5 and m070 GDPR acronym lists remain semantically stale; tooltip delivery was not observed and no metadata/link fix is made.',
 'Authored sources for **m171,m333,m334,m352,m168,m169,m170,m182** lack their own wrongFeedback field; the effective editorial layer supplies specific corrections. Imported m627/m629/m630 replace three generic fallback corrections each with specific contrasts. m025/m070 captured payloads retain sparse/empty older corrections before editorial precedence. All **54 current wrong-choice corrections**, eighteen main explanations and eighteen parent/feedback revisions are separately bound. One deterministic shuffle per candidate preserves the keyed decision and remaps every wrong correction: **18 shuffle/remap probes**. A probe is not an independent question or semantic family.',
 'Feedback remains conditional on actual practice selection, submission and entitlement; wrong teaching depends on the selected wrong choice. Main explanation and offered correction wording are reviewed here, not an observed learner outcome. No browser pool/set/guest path, entitlement, tooltip, disabled option, actual VM capture/hash, chain of custody, evidence acquisition, investigation, isolation, meeting, hunt query, disclosure or court result is executed.',
 '## Family comparisons and primary references',
 comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
 '**Four provisional shared groups:** m025/m070 copy-integrity comparison; m022/m169/m334/m627 active-spread containment (action choices versus narrower labels); existing m068/m352/m630 discussion-only tabletop recognition; m629/m182 post-incident review. m098/m171 collection teaching is correlated but method choice and priority principle differ. Custody, discovery, historical grouping, hunting and deliberate obstruction labels are distinct tasks, not independent operational outcomes. No canonical merge or extra evidence is inferred from a topic tag.',
 '[NIST SP800-61r3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) superseded Rev2 in April2025 and uses CSF2.0. The [current publication](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r3.pdf) treats response and ongoing improvement across risk-management activities. The [Rev2 source](https://csrc.nist.gov/pubs/sp/800/61/r2/final) remains appropriate historical context for m168 because its stem explicitly specifies that revision. Our inference keeps current planning separate from historical group-name recall; no universal sequential response rule or current compliance is certified.',
 '[NIST SP800-86](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-86.pdf) §3.1.2 distinguishes digest comparison and evidence-handling records. Its [publication scope](https://csrc.nist.gov/pubs/sp/800/86/final) is IT forensic guidance, not a complete investigation procedure or legal advice. Our inference supports narrow copy-integrity/custody judgments, without importing its historical MD5/SHA-1 examples as current algorithm approval or treating records as court guarantees.',
 '[RFC3227](https://www.rfc-editor.org/rfc/rfc3227.html) §2.1 gives an example volatility order; §§2.3–2.4 and4.1 discuss privacy/jurisdiction and handling documentation. Our m098/m171 inference retains system-specific accessibility, live-state changes, authority and safety; a named snapshot capability is a supplied premise, not verified platform support.',
 '[FEMA discussion-based exercise guidance](https://emilms.fema.gov/is_0360/groups/434.html) includes tabletop discussion of a hypothetical simulated emergency. Our inference uses tabletop as the most specific exercise name while holding simulation-is-always-technical and universal intensity/capability divisions. No exercise result establishes recovery readiness.',
 '[US Courts current Civil Rules](https://www.uscourts.gov/forms-rules/current-rules-practice-procedure/federal-rules-civil-procedure) identify the federal district-court scope. The [December2025 official rules](https://www.uscourts.gov/sites/default/files/document/federal-rules-of-civil-procedure.pdf) Rule34 addresses electronically stored information production and Rule37(e) addresses loss of information that should have been preserved for anticipated/conducted litigation, with specific conditions. These support distinguishing preservation and production, not universal international deadlines, automatic admissibility or case-specific legal conclusions. The m073 correction supplies no hold timing; its already-deleted-before-hold claim remains held.',
 '## Preserved gates and remaining coverage',
 'All **nineteen objective4.3 precise holds** remain, including STIX/TAXII compatibility, intelligence trust, CVSS versions/context, scan coverage, KEV/BOD current-policy uncertainty, dependency applicability and post-patch verification. In particular, m174/m262 do not acquire verified current deadlines: the previously inspected [CISA September11 2026 bulletin](https://content.govdelivery.com/accounts/USDHSCISA/bulletins/429c4f7) names BOD26-04, while the full directive/supersession details were unavailable in that review. This slice preserves that source-bound unresolved hold; it does not re-certify the full directive or infer current obligations.',
 'All twelve 4.1, eight 3.3, fourteen 3.2 and eleven 3.1 holds remain through the exact inherited chain, alongside prior2.5/2.4/2.3/2.2, actor/supplier, cryptographic/PKI/PFS, channels/Unicode, PBQ grammar/grading, delivery and targeting qualifications. Older contextual and recovery packet limits stay bound too. Support references from those packets do not grant new canonical roles, approval or full current-unit coverage. Existing owner pilot decisions are unchanged, and no new judgment inherits pilot approval.',
 'Private p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, unavailable/unreviewed with null trusted identity. Objective52 has a separate local p017 fallback judgment; it does not review, replace or transfer trust to the private variant. No private payload fetch/export/substitution occurs. No stem, choice, key, option-indexed answer payload or learner data is exported by the new packet.',
 'Active package stays **1878 records / 435 identities / 489 unresolved mappings / 2954 review decisions / seven existing primary proposals**, SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All **25 protected release hashes** remain unchanged. Thirty-six unsupported local PBQ grammars, protected private review, remaining full feedback/support coverage, owner decisions and calibration still block readiness.',
 '**NOT READY.** Local/offline/default-off/unwired/learner-invisible. No active-package edit, runtime behavior, canonical concept/role/family, objective tag, skill, difficulty, link, weight, publication, activation, shadow write, private processing, live write, migration, cohort, deployment or Phase3 change. The finite review slice can finish while the larger phase remains incomplete.',
 '## Validation and delivery',
 'Run node '+scriptPath+' and npm run audit:content-mapping. The focused audit rebuilds the frozen ledger, checks all57 packet inventories/current references and old dictionary bindings, reconciles six exclusions and42 older question-only judgments, validates all18 source inspections, three snapshot replays, eighteen main and54 wrong corrections, eighteen shuffle probes, exact130-record census and separate bank/feedback counts. **'+negativeMutationChecks+' rejected mutations** exercise stale/trusted substitutions, captures/replays, erased current/inherited holds, reused-parent credit, missing inventories, duplicate coverage, support-link overcount, wrong corrections, unsupported scope/roles/approval/weights, private fallback substitution, export leakage and activation. Every current and inherited precise hold is independently removable in a rejection probe.',
 'All29 mapping tests plus deterministic package verification, all25 protected checksums and git diff --check are required before the task-only **[skip deploy]** commit/push. Final delivery must compare local HEAD, origin/main and remote refs/heads/main exactly. Browser/live/private delivery remains unverified by design; this document records local validation, not production activation.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE48_MCQS_NOT_READY',candidateIds:ids,newQuestionIds:selected.map(r=>r.questionId),reusedQuestionIds:excluded.map(r=>r.questionId),newQuestionDispositions:12,newFeedbackDispositions:18,bankProgress,objective48:packet.objective48Denominator,snapshotReplays:3,wrongCorrections:54,shuffleProbes:18,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
