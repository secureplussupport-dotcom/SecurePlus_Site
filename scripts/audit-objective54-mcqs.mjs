import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-objective54-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective54-mcqs-proposals.json',reportPath='docs/phase-2b5-objective54-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective45-mcqs-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'214ab24f55b58022a05cae9b198fb09a6a863c282a8f2fe0691d2387b12643c6');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);assert.equal(c.ledger.rows.filter(r=>legacyPrevious.has(r.recordId)).length,331);
const ids=["m030", "m082", "m085", "m090", "m092", "m099", "m186", "m187", "m376", "m379", "m393", "m641"];
const candidates=ids.map(id=>c.ledger.rows.find(r=>r.recordId==='mcq:'+id));
assert.equal(new Set(ids).size,12);assert(candidates.every(r=>r&&r.kind==='mcq'&&r.objectiveCodesObserved.includes('5.4')));
// The supplied order is a set order, not a structural-priority ranking.
assert.deepEqual(candidates.map(r=>r.priorityScore),[35,20,35,35,35,20,20,20,20,25,10,40]);
const rankedIds=[...candidates].sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en')).map(r=>r.questionId);
assert.deepEqual(rankedIds,['m641','m030','m085','m090','m092','m379','m082','m099','m186','m187','m376','m393']);
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
assert.equal(inventory.length,61);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);
const excluded=candidates.filter(r=>c.previous.has(r.recordId)),selected=candidates.filter(r=>!c.previous.has(r.recordId));
assert.deepEqual(excluded,[]);assert.equal(selected.length,12);assert(candidates.every(r=>!c.previous.has('explanation:'+r.recordId)));
const exclusions=excluded.map(r=>{const p=c.previous.get(r.recordId);return{recordId:r.recordId,sourceRevision:r.revisions.localEffective,publishedRecordSignature:r.revisions.publishedCatalogue,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),priorFamilyLabel:p.row.familyLabelProposal,reason:'current_matching_prior_substantive_question_judgment_reused_feedback_still_unreviewed',newQuestionCredit:0,newFamilyCredit:0};});
const priorInventory=base.allPacketReconciliation.inventory;
assert.deepEqual(inventory.filter(r=>r.path!==basePath),priorInventory);
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorBank.length,373);assert.equal(priorFeedback.length,337);
const broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('5.4')),oldBroad=broad.filter(r=>c.previous.has(r.id));
assert.deepEqual(c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('5.4')&&!c.previous.has(r.recordId)).map(r=>r.questionId).sort(),[...ids].sort());
const reviews=[
  {
    "id": "m030",
    "meaning": "Recognise erasure for the supplied valid deletion request, qualifying grounds and absence of a retention exception.",
    "hold": "HOLD a request as automatically deleting every record instantly, including every backup. Current stem supplies EU establishment and grounds rather than customer nationality alone. Actual records, exceptions, identity and recipients require assessment; no real deletion or compliance outcome is observed. Related m090 tests retention handling, not independent erasure competence.",
    "main": "Erasure is conditional; the supplied conditions support its name without granting a universal deletion guarantee.",
    "contrasts": [
      "Access provides processing information and a copy rather than the requested deletion.",
      "Rectification corrects inaccurate or incomplete data rather than exercising this deletion right.",
      "Restriction limits processing rather than requiring erasure."
    ],
    "family": "qualified_erasure_right_recognition"
  },
  {
    "id": "m082",
    "meaning": "Recognise HIPAA in the explicitly covered US hospital and electronic patient-record context.",
    "hold": "HOLD all US health-related data or apps as within HIPAA, or a framework name as proving safeguards. PHI means protected health information. Privacy and electronic-PHI security differ; GDPR, PCI and SOX may also apply to other activities. Two retained wrong corrections remain broad and must not exclude overlapping health/payment records. Same provisional recognition family as m376; no records, transmission or compliance control tested.",
    "main": "Covered-entity and relevant business-associate scope matters; electronic PHI invokes the Security Rule.",
    "contrasts": [
      "GDPR can govern qualifying processing too, but is not the supplied US covered-healthcare regime.",
      "PCI targets payment-card security; medical billing may involve both, so this is a contextual contrast.",
      "SOX concerns public-company financial reporting, not the specifically asked healthcare privacy/security framework."
    ],
    "family": "covered_healthcare_HIPAA_framework_recognition"
  },
  {
    "id": "m085",
    "meaning": "Identify the controller from its supplied decision over processing purposes and means, against an instructed cloud processor.",
    "hold": "HOLD ownership, job title, contract label or breach fault as determining every processing role. Actual functions and essential decisions matter; a provider can have other controller or joint-controller activities. Joint status does not arise only from a formal agreement, and processors retain obligations. Current options remove the old joint-controller contrast. No contract, cloud service or responsibility allocation is assessed.",
    "main": "The supplied organisation determines why and how; the instructed supplier acts as processor for this processing.",
    "contrasts": [
      "A processor follows instructions rather than deciding the stated purposes and means.",
      "The data subject is the identifiable individual, not the organisation setting the processing purpose.",
      "The supervisory authority oversees compliance rather than operating this processing."
    ],
    "family": "functional_controller_processor_role_recognition"
  },
  {
    "id": "m090",
    "meaning": "Choose record-specific retention-exception assessment and explanation for the supplied valid erasure request.",
    "hold": "HOLD a retention duty for certain records as blanket rejection or indefinite storage of everything. Actual applicable duty, scope, duration and permitted use require verification; explain retained versus erased records in the real process. Outsourcing does not erase controller responsibilities. The effective row changes the old erasure-name recall to a conditional response, related to m030 without independence approval. No record is retained, moved or deleted.",
    "main": "Review which records meet the supplied exception, erase where required, and explain the applicable retention.",
    "contrasts": [
      "A valid legal exception can prevent erasure of specific records; it is not overridden by deleting all.",
      "Some required retention does not justify rejecting the entire request without examining its scope.",
      "Moving data to a processor does not remove controller responsibilities."
    ],
    "family": "erasure_legal_retention_exception_response"
  },
  {
    "id": "m092",
    "meaning": "Apply the supplied awareness-based notification policy using available required facts and later supplements.",
    "hold": "HOLD a universal 72-hour clock for every alert or every legal regime. The stem stipulates a triggered policy; awareness is not full root-cause certainty. Controller-to-authority risk thresholds differ from high-risk communication to individuals and processor-to-controller duties. Late reasons do not confer a free extension. One combined decision, related to m187; no report, recipient or notification sent.",
    "main": "Do not wait for complete forensics or reset the supplied clock; provide available required information and supplement promptly.",
    "contrasts": [
      "A complete forensic report is not necessary before the supplied reporting window expires.",
      "Root-cause confirmation does not replace the stipulated awareness trigger.",
      "A triggered reporting duty is not dependent on individuals requesting notice."
    ],
    "family": "conditional_breach_notification_timing"
  },
  {
    "id": "m099",
    "meaning": "Recognise PCI DSS as the industry security standard for the supplied payment-card context.",
    "hold": "HOLD PCI DSS as a statute, universal certification, or scope determined by outsourcing/encryption/tokenisation alone. Actual card-data environment, systems affecting its security, provider boundaries and validation obligations require assessment. Retained HIPAA/SOX corrections are contextual contrasts, not proof those regimes cannot overlap. Compare prior m637 DLP capability without a family merge or independent compliance credit; no card data or version-specific control tested.",
    "main": "PCI DSS covers payment-card security and systems affecting it; applicability depends on the assessed environment.",
    "contrasts": [
      "HIPAA concerns covered PHI activities; mixed health/payment operations may involve both.",
      "SOX concerns financial-reporting integrity, distinct from the payment-card security standard asked about.",
      "ISO 27001 concerns an information-security management system generally, rather than this card-specific standard."
    ],
    "family": "payment_card_security_standard_recognition"
  },
  {
    "id": "m186",
    "meaning": "Recognise GDPR from the supplied EU establishment and relevant non-EU offering or monitoring activities.",
    "hold": "HOLD citizenship or residence alone, mere website accessibility, or a named regulation as proof of whole compliance scope. Actual establishment, activities, processing and exceptions require analysis. The old broad nationality and penalty claims are removed, not recertified; multiple regimes can coexist. No real territorial determination or penalty assessment.",
    "main": "Scope follows qualifying establishment and activities rather than an EU passport alone.",
    "contrasts": [
      "HIPAA concerns covered US health-information activities rather than this EU personal-data framework.",
      "PCI DSS concerns payment-card security rather than the described general personal-data regulation.",
      "SOX concerns financial reporting and related controls rather than the described data-protection framework."
    ],
    "family": "GDPR_territorial_activity_scope_recognition"
  },
  {
    "id": "m187",
    "meaning": "Recall 72 hours where feasible from the expressly supplied Article 33 awareness-based authority-notification procedure.",
    "hold": "HOLD waiting until the target, every breach triggering identical duties, or affected individuals universally receiving a 72-hour notice. Authority notification has a risk exception; individual communication uses a high-risk test and its own exceptions. Processor duties differ; awareness is not full forensics, and delay needs reasons. Same provisional timing family as m092, not independent incident competence. No notification is made.",
    "main": "The stipulated authority procedure uses the qualified 72-hour target, with prompt action and distinct individual-notice conditions.",
    "contrasts": [
      "24 hours is not the specified numeric target, though unnecessary delay is not permitted.",
      "48 hours is not the specified number, even though earlier prompt action may be appropriate.",
      "Seven days is not the default target; a delay requires justification rather than an automatic extension."
    ],
    "family": "conditional_breach_notification_timing"
  },
  {
    "id": "m376",
    "meaning": "Recognise HIPAA from the explicitly covered hospital PHI and electronic-PHI context.",
    "hold": "HOLD every health datum, US patient citizenship or disclosure as automatically covered or lawful. Privacy and electronic-PHI security scopes differ; education records and mixed activities need actual assessment. Authored notification deadlines, penalty totals and criminal-liability shorthand are removed, not verified as universal current rules. Same provisional family as m082; no healthcare record, disclosure or safeguard assessed.",
    "main": "HIPAA applies to the supplied covered context; Privacy covers PHI and Security specifically addresses electronic PHI.",
    "contrasts": [
      "PCI DSS targets card-data security; it is not the specified federal healthcare framework.",
      "FERPA concerns education records; the stem explicitly supplies a covered-hospital context.",
      "GDPR may also apply to qualifying activities, but does not name this US healthcare framework."
    ],
    "family": "covered_healthcare_HIPAA_framework_recognition"
  },
  {
    "id": "m379",
    "meaning": "Recognise purpose limitation as the principle concerning incompatible reuse of personal data.",
    "hold": "HOLD the unchanged stem as implying any new legal basis automatically permits incompatible reuse. Article 6(4) compatibility and qualifying consent or law require assessment; compatible use does not remove other obligations. Old separate-consent-for-all-marketing teaching is removed, not universally certified. This wording remains an explicit unresolved hold, with only principle recognition recorded. No repurposing, consent or marketing activity approved.",
    "main": "Assess the new purpose and its lawful conditions; naming purpose limitation does not itself authorise reuse.",
    "contrasts": [
      "Minimisation concerns necessary collection, distinct from compatibility of later purposes.",
      "Storage limitation concerns retention duration rather than the permitted purpose.",
      "Accuracy concerns correctness and currency rather than why data is reused."
    ],
    "family": "purpose_limitation_principle_recognition"
  },
  {
    "id": "m393",
    "meaning": "Recognise portability from structured machine-readable receipt and transfer, subject to the qualifying feedback conditions.",
    "hold": "HOLD the broad unchanged stem as encompassing every record, derived analysis, guaranteed lossless transfer or mandatory system compatibility. Qualifying provided data, automation and consent/contract conditions matter; observed data and derived data differ. Direct transfer is conditional on feasibility and other rights. One calendar month is not universally 30 days; extensions and fee exceptions require conditions. Explicit unresolved stem-scope hold; no export, recipient processing or original deletion approved.",
    "main": "Portability concerns qualifying provided data; scope and response conditions limit the general transfer description.",
    "contrasts": [
      "Erasure concerns deletion rather than delivery for transfer; portability does not require deleting the original.",
      "Rectification corrects inaccurate data rather than enabling machine-readable transfer.",
      "Restriction limits processing rather than naming this receipt-and-transfer right."
    ],
    "family": "qualified_portability_right_recognition"
  },
  {
    "id": "m641",
    "meaning": "Recognise a regulatory driver from the explicitly stipulated applicable legal requirement.",
    "hold": "HOLD every healthcare rule as mandating AES, a generic scenario as proof of actual legal applicability, or contractual and voluntary drivers as mutually exclusive in practice. Imported algorithm mandate is removed; the generic supplied premise is not a current encryption-law certification. Benchmarks can be incorporated into contracts or law. No organisation, policy, algorithm or compliance implementation assessed.",
    "main": "A stipulated legal duty is a regulatory driver; actual requirements must be established rather than inferred from a sector label.",
    "contrasts": [
      "A voluntary risk-tolerance choice does not create the supplied legal duty.",
      "An SLA is a contractual service commitment, distinct from the stipulated legal driver, though both can coexist.",
      "A recommendation is not automatically mandatory; adoption into law or contract requires separate evidence."
    ],
    "family": "stipulated_regulatory_driver_recognition"
  }
];
assert.deepEqual(reviews.map(r=>r.id),ids);
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();

const sourceChecks=candidates.map(row=>{
 const s=c.questions.get(row.recordId),q=s.q,pre=s.preQuestion,shuffled=shuffle(q);
 assert(s.authored);assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);
 assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);assert.equal(q.correct,pre.correct);
 assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
 for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
 assert.notEqual(sig(q.exp),sig(pre.exp));assert.notEqual(sig(q.wrongFeedback),sig(pre.wrongFeedback??null));
 const unchangedWrongCorrectionCount=q.opts.map((_,j)=>j).filter(j=>j!==q.correct&&pre.wrongFeedback?.[j]===q.wrongFeedback[j]).length;
 return{recordId:row.recordId,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:false,sourceLayerDisposition:row.flags.importedSource?'imported_authored_equals_preeditorial_then_effective_editorial':'authored_equals_preeditorial_then_effective_editorial',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',authoredMissingWrongCorrections:!s.authored.wrongFeedback,stemChangedFromPreeditorial:sig(q.q)!==sig(pre.q),optionsChangedFromPreeditorial:sig(q.opts)!==sig(pre.opts),mainCorrectionChanged:true,wrongCorrectionsChanged:true,changedWrongCorrectionCount:3-unchangedWrongCorrectionCount,unchangedWrongCorrectionCount,optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0},status:'source_inspection_no_additional_question_credit'};
});
assert.equal(sourceChecks.filter(r=>r.snapshotReplayChecked).length,0);assert.equal(sourceChecks.filter(r=>r.stemChangedFromPreeditorial).length,10);assert.equal(sourceChecks.filter(r=>r.optionsChangedFromPreeditorial).length,5);assert.equal(candidates.filter(r=>r.flags.stemChanged).length,10);assert.equal(candidates.filter(r=>r.flags.optionsChanged).length,5);assert.deepEqual(candidates.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m641']);assert.equal(sourceChecks.filter(r=>r.authoredMissingWrongCorrections).length,5);
assert.equal(sourceChecks.reduce((n,r)=>n+r.changedWrongCorrectionCount,0),32);assert.equal(sourceChecks.reduce((n,r)=>n+r.unchangedWrongCorrectionCount,0),4);
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
assert.equal(broad.length,115);assert.equal(oldBroad.length,15);assert.deepEqual(counts(oldBroad),{glossary_definition:15});assert.equal(selectedIds.size,24);assert.equal(remaining.length,76);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,2);assert.equal(remaining.filter(r=>r.kind==='pbq').length,2);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,combinedQuestions=new Set([...priorBank.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=bankRows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
assert.equal(combinedQuestions.size,385);assert.equal(combinedFeedback.size,349);assert.equal(paired.length,349);assert.equal(paired.filter(r=>r.kind==='mcq').length,333);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,olderQuestionOnlyDispositions:olderQuestions.length,allPacketPriorQuestions:priorBank.length,newQuestions:questionProposals.length,allPacketCombinedQuestions:combinedQuestions.size,remainingQuestionDispositions:483-combinedQuestions.size,combinedMcqs:bankRows.filter(r=>r.kind==='mcq'&&combinedQuestions.has(r.recordId)).length,combinedLocalPbqs:bankRows.filter(r=>r.kind==='pbq'&&combinedQuestions.has(r.recordId)).length,newFeedbackBundles:12,priorFullFeedback:priorFeedback.length,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.combinedMcqs,357);assert.equal(bankProgress.combinedLocalPbqs,28);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,36);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective45HeldDispositions:base.explanationProposals.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal})),olderQuestionPacketBindings:olderQuestions.map(r=>({recordId:r.recordId,priorPacketPath:r.priorPacketPath,priorDispositionRevision:r.priorDispositionRevision,status:'existing_limits_preserved_no_full_feedback_or_approval_inherited'}))};
assert.equal(priorHolds.objective45HeldDispositions.length,13);
const comparisonSpecs=[
  {
    "ids": [
      "m030",
      "m090",
      "m393",
      "m379"
    ],
    "meaning": "Erasure naming, record-specific retention response, qualifying portability and purpose limitation are distinct decisions. Their shared GDPR context does not approve a whole-regulation family or independent skills; the portability and purpose wording holds persist."
  },
  {
    "ids": [
      "m082",
      "m376",
      "m641"
    ],
    "meaning": "The two explicitly covered HIPAA recognitions share one provisional family. Generic regulatory-driver recognition is different and cannot supply an encryption mandate or current compliance result."
  },
  {
    "ids": [
      "m092",
      "m187",
      "m186"
    ],
    "meaning": "Notification policy application and conditional numeric recall share one provisional timing family; territorial-activity recognition is separate. Awareness, recipient and risk qualifications prevent an unconditional all-breach clock."
  },
  {
    "ids": [
      "m085",
      "m389"
    ],
    "meaning": "Functional controller/processor role recognition differs from the prior privacy-preserving synthetic-test-data choice. Neither a provider name nor synthetic-data label establishes actual legal roles, anonymity or a compliance exemption."
  },
  {
    "ids": [
      "m099",
      "m637"
    ],
    "meaning": "Payment-card standard recognition differs from prior sensitive-data DLP capability. A detected card pattern is not scope, successful prevention or PCI compliance; product and legal contexts may overlap without merging families."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids.map(id=>'mcq:'+id),comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get('mcq:'+id),p=c.previous.get('mcq:'+id);return{recordId:s.row.recordId,sourceRevision:s.record.sourceSignature,localRevision:s.row.revisions.localEffective,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
const sourceBindings=[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective45-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective45-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)},...inventory.map(({path,sha256})=>({path,sha256}))];
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'4f8e3c6363c43e87023882f2729df13ea371890b',sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,legacyTrackedPriorQuestions:331},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences,status:'current_revision_bound_existing_question_judgments_no_new_credit_or_full_feedback_inference'},bankSignature:c.ledger.bankSignature,selectionPolicy:'Requested objective5.4 candidate set in supplied order; existing structural ranking recorded separately; all prior substantive packets reconciled before new question credit',structuralPriorityQuestionIds:rankedIds,candidateQuestionRecordIds:candidates.map(r=>r.recordId),selectedQuestionRecordIds:selected.map(r=>r.recordId),selectedFeedbackRecordIds:candidates.map(r=>'explanation:'+r.recordId),questionExclusions:exclusions,ambiguousPremiseOrContrastHolds:['mcq:m379','mcq:m393'],ambiguityDisposition:'qualified_pending_owner_not_resolved_or_approved',sourceChecks,questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorHolds,objective54Census:census,objective54Denominator:{broadCandidates:115,allPacketPriorDispositions:15,newQuestionDispositions:12,newFeedbackDispositions:12,newAgentDispositions:24,combinedAgentDispositions:39,remaining:76,remainingByKind:counts(remaining)},remainingObjective54RecordIds:remaining.map(r=>r.id),bankProgress,unchangedObjective45Progress:base.objective45Denominator,unchangedObjective46Progress:base.unchangedObjective46Progress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},privateBoundary:{p017Revision:'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42',payloadReviewed:false,trustedRevisionId:null,localPilotFallbackDoesNotTransferToPrivate:true},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
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
 reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);reject(p=>p.questionProposals[i].trustedRevisionId=p.questionProposals[i].revisions.trustedCompilerObserved);reject(p=>p.questionProposals[i].contentQualification='');reject(p=>p.questionProposals[i].primaryConceptProposal='invented');reject(p=>p.questionProposals[i].humanApproved=true);reject(p=>p.questionProposals[i].newFamilyCredit=1);reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);reject(p=>p.questionProposals[i].familyLabelProposal='independent');reject(p=>p.questionProposals[i].objectiveScopeProposal={assessedCodes:['5.4'],contextCodes:[],status:'approved'});reject(p=>p.questionProposals[i].skillRoleProposal='invented');reject(p=>p.questionProposals[i].difficultyDisposition='calibrated');
}
for(let i=0;i<12;i++){
 reject(p=>p.sourceChecks[i].snapshotReplayChecked=!p.sourceChecks[i].snapshotReplayChecked);reject(p=>p.sourceChecks[i].revisions.authored=p.sourceChecks[i].revisions.authored===null?p.sourceChecks[i].revisions.preEditorialSnapshotMerged:null);reject(p=>p.sourceChecks[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);reject(p=>p.sourceChecks[i].optionShuffleProbe.feedbackRemapChecked=false);reject(p=>p.sourceChecks[i].sourcePriority=0);
 reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%12].sourceRevision);reject(p=>p.explanationProposals[i].parentLocalRevision='stale');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');reject(p=>p.explanationProposals[i].objectiveScopeProposal={assessedCodes:['5.4']});reject(p=>p.explanationProposals[i].mainCorrectionRevision='stale');reject(p=>p.explanationProposals[i].deliveryGate='all_before_submit');reject(p=>p.explanationProposals[i].approvedRemediation=true);
 for(let k=0;k<3;k++){reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].assessedSecondary=true);}
}
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);for(const path of holdPaths)reject(p=>{let r=p.priorHolds;for(const k of path.slice(0,-1))r=r[k];r[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{let old=p.priorHolds;for(let i=0;i<14;i++)old=old.inheritedHolds;old=old.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
for(let i=0;i<42;i++)reject(p=>p.allPacketReconciliation.olderQuestions[i].priorDispositionRevision='stale');
reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.allPacketReconciliation.olderQuestions.push(p.allPacketReconciliation.olderQuestions[0]));reject(p=>p.allPacketReconciliation.supportOnlyReferences[0].status='fully_reviewed');reject(p=>p.questionProposals.push({...p.questionProposals[0],recordId:ids[0]}));reject(p=>p.questionExclusions.push({recordId:'mcq:'+ids[0],newQuestionCredit:1}));reject(p=>p.ambiguousPremiseOrContrastHolds.pop());reject(p=>p.ambiguityDisposition='cleared');reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=373);reject(p=>p.objective54Census.pop());reject(p=>p.objective54Denominator.remaining=0);reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
reject(p=>p.unchangedObjective45Progress.remaining=0);reject(p=>p.unchangedObjective46Progress.remaining=0);reject(p=>p.structuralPriorityQuestionIds.reverse());reject(p=>p.sourceChecks[1].unchangedWrongCorrectionCount=0);reject(p=>p.sourceChecks[5].changedWrongCorrectionCount=3);
completedNegativeChecks=negativeMutationChecks;
const exported={...packet,negativeMutationChecks};validate(exported);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const report=[
 '# Phase 2B-5 — objective 5.4 MCQs and complete feedback',
 '**NOT READY.** Review date: **11 October 2026**. Finite local draft only. Baseline **'+packet.baselineCommit+'**; packet SHA-256 **'+hashFile(packetPath)+'**. A disposition is a recorded judgment pending owner review. A hold preserves an unresolved claim; it does not fix learner content. Complete feedback means the main explanation and all three wrong-choice corrections. Only the packet, report and focused audit are added.',
 '## Authority and finite selection',
 'The master plan and Phase 1 audit were read in full in this continuing session. Approved product decisions follow the master plan; the audit supplies historical implementation evidence. Current bound sources were checked again. No unresolved authority conflict affects this finite local review. Canonical mappings and scoring need separate human approval.',
 'Requested order: **'+ids.join(', ')+'**. This is the supplied set order, not descending structural priority. Scores in that order: **35,20,35,35,35,20,20,20,20,25,10,40**. Separately ranked structural order: **'+rankedIds.join(', ')+'**. Structural priority is an inspection aid, not quality or calibrated difficulty. Every effective stem, option, key, main and wrong correction was compared with actual authored/imported and preeditorial sources.',
 '**12 new question judgments + 12 new complete feedback judgments = 24 pending rows.** All **61** existing substantive packets were hashed and reconciled first. None of the selected questions or paired feedback has a prior current substantive judgment. No duplicate credit, stale matching row, private substitution or source-insufficient deferral. m379 purpose-reuse and m393 portability-scope wording remain explicit unresolved holds; their qualified local judgments do not clear ambiguity. All twelve are local source-bound pending dispositions, not approved evidence.',
 'Every new objectiveScopeProposal, skillRoleProposal and feedback roleProposal is null. Primary concepts and trusted identities remain null; secondary/link arrays are empty. Weights and family credit are zero, approvals/publication/activation/evidence are false, and difficulty is an observed uncalibrated label. Naming a law, right or deadline does not demonstrate operational compliance skill.',
 '## Prior reconciliation and separate coverage',
 '**42 older distinct question-only judgments (30 MCQs + 12 local PBQs)** are reused history outside the recent frozen-ledger overlays. Seventeen cross-packet reference occurrences receive no duplicate coverage. Twelve unmatched minimal link/context references, including five explanation links, do not constitute complete feedback or full instructional-unit review. Thirty-six older question-only judgments still lack complete feedback. All packet/current row bindings, the ledger and the active package remain unchanged.',
 '| Pending local coverage | Before | New | After | Remaining |\n| --- | ---: | ---: | ---: | ---: |\n| Questions across all packets | 373 | 12 | 385/483 | 98 |\n| Complete feedback | 337 | 12 | 349/483 | 134 |\n| Question and complete feedback pairs | 337 | 12 | 349/483 | 134 |',
 'Question coverage is **357/395 MCQs + 28/88 local PBQs**, leaving **38 MCQs + 60 PBQs**. Complete pairs are **333 MCQs + 16 PBQs**, leaving **62 MCQs + 72 PBQs** without complete feedback. The 483 local assessments exclude two private variants, nine starters and two guest demos. Support links, comparisons and shuffles create no question coverage.',
 'Objective5.4 broad union: **115 records; 15 prior + 24 new = 39 pending dispositions; 76 remain**. Prior15 consists of substantive glossary-definition judgments. The four objective52 BIA/MTTR/RPO/RTO flashcard references have brief mapping rationales, not full content understanding. Their current revisions are bound as support-only references; they remain among residual flashcards. This adapts apparent19 coverage down to15, without altering historical packets or granting new teaching-role credit. The packet binds all115 census rows and all76 residual IDs. All12 effective objective5.4 MCQs and paired feedback now have pending judgments. This closes the finite MCQ inventory, not the broader objective or approval process.',
 'Remaining: **two local PBQs**, **two PBQ feedback bundles**, **72 support/instructional records**. PBQ IDs: **'+remaining.filter(r=>r.kind==='pbq').map(r=>r.id).join(', ')+'**. Objective4.5 remains **63/169 pending dispositions,106 remaining**; objective4.6 remains **89/151,62 remaining**. Neither receives new review or credit.',
 '| Remaining objective5.4 kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
 '## Individual judgments and all wrong-choice contrasts',
 reviews.map(r=>'**'+r.id+' — new question and complete feedback.** '+r.meaning+'\n\n'+r.hold+'\n\nMain teaching: '+r.main+'\n\nWrong-choice contrasts, in current wrong-choice order: '+r.contrasts.map((t,k)=>(k+1)+'. '+t).join(' ')).join('\n\n'),
 'Each question supplies one keyed decision. Conditions explained in feedback, such as recipient/risk, retained-record scope, identity or automated processing, do not become independently assessed components. These judgments neither change original wording nor certify real compliance.',
 '## Source precedence and conditional delivery',
 '**No selected snapshots, captured overrides or snapshot publication replays.** All12 have actual authored sources equal to preeditorial revisions. m641 is imported QB1 question41; its repeated generic corrections become specific effective contrasts. Fabricated capture/replay metadata is rejected. Authored rows **m186,m187,m376,m379,m393** lack wrongFeedback; effective editorial supplies their15 corrections.',
 '**10 effective stems and five option arrays differ from preeditorial.** Stems m379/m393 remain unchanged; m099 stem change is spelling normalisation. Changed option arrays: m030,m085,m090,m092,m379. All keys retain their positions; all12 main explanations and all12 whole wrong-feedback bundles differ. Of36 individual wrong corrections, **32 are new or changed and four unchanged**: m082 PCI/SOX and m099 HIPAA/SOX. Those retained contrasts are read fully and qualified for overlapping activities. All12 mains,36 choice/correction bindings,12 parent/feedback revisions and **12 deterministic shuffle/remap probes** are verified, with zero independent/family credit.',
 'Current editorial narrows erasure grounds, covered-healthcare premises, functional processing roles, record-specific retention, triggered awareness-based notification, territorial scope and portability conditions. It removes authored unconditional deletion/notification, broad citizenship, marketing-consent, penalty and AES-mandate shorthand. Removed claims are not silently recertified as correct or current.',
 '| Question | Authored/preeditorial domain and difficulty | Effective domain and difficulty |\n| --- | --- | --- |\n'+candidates.map(row=>{const s=c.questions.get(row.recordId);return'| '+row.questionId+' | '+s.preQuestion.ch+' / '+s.preQuestion.difficulty+' | '+s.q.ch+' / '+s.q.difficulty+' |';}).join('\n'),
 'Only m641 domain changes (3→5). Five difficulty labels change: m030 medium→easy; m085 hard→medium; m090 easy→medium; m092 hard→medium; m641 medium→easy. These observed source changes are not approved retags or calibration. Static practice, shuffle, feedback and launch-selector bindings match prior delivery. Feedback remains conditional on selection, submission, entitlement and the submitted wrong choice. Browser pool/set/guest paths and actual legal duties, notices, requests, records, provider contracts or transfer outcomes are unverified.',
 '## Provisional family comparisons and source support',
 comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
 'm082/m376 share a provisional covered-healthcare recognition label; m092/m187 share a provisional conditional-notification timing label. Different wording and option shuffles do not establish independent scenarios. Other labels distinguish narrow decisions, without canonical merge, approved independence, whole-objective scope or new learning credit. Prior m389 synthetic-data and m637 DLP qualifications remain intact.',
 'The following primary sources support the narrow distinctions; the row-specific implications and holds are reviewer inferences. They are not a jurisdiction-wide legal opinion or approval of an actual organisation.',
 '[GDPR text](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng), Articles3,5,6,17,20,33–34, supports establishment/activity scope, conditional rights, purpose compatibility and separate notification recipients. Our inference preserves the supplied premises and withholds blanket citizenship, all-record erasure, any-basis reuse and unconditional deadline claims. The retrieved text identifies its original publication/current-version context; future or jurisdiction-specific changes are not certified.',
 '[EDPB individual-rights guidance](https://www.edpb.europa.eu/sme/be-compliant/respect-individuals-rights_en) distinguishes qualifying portability data, observed versus derived information, feasible direct transmission and response/extension conditions. Our inference keeps m393 broad wording pending rather than promising every datum or lossless transfer; m030/m090 remain conditional rights judgments.',
 '[EDPB controller/processor guidelines07/2020](https://www.edpb.europa.eu/system/files/documents/2023-10/EDPB_guidelines_202007_controllerprocessor_final_en.pdf) treats roles functionally for particular processing, distinguishes essential means and retains processor obligations. Our inference avoids making ownership, breach blame or a formal agreement the sole test in m085.',
 '[EDPB breach guidelines9/2022](https://www.edpb.europa.eu/system/files/2023-04/edpb_guidelines_202209_personal_data_breach_notification_v2.0_en.pdf) addresses awareness, phased information, authority risk thresholds and distinct high-risk individual communication. Our inference limits m092/m187 to their qualified procedure, without resetting awareness to root-cause completion or making 72 hours an automatic individual-notice deadline.',
 '[HHS Privacy Rule overview](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html) and [Security Rule overview](https://www.hhs.gov/hipaa/for-professionals/security/index.html) distinguish covered entities/relevant business associates, PHI and electronic PHI. Our inference qualifies m082/m376 to their supplied covered context. No historic fine, criminal-liability shorthand or proposed/current algorithm mandate is endorsed by m641.',
 '[PCI SSC standard overview](https://www.pcisecuritystandards.org/standards/pci-dss/) includes payment-card environments and systems affecting their security. Our inference preserves m099 industry-standard scope and overlapping-regime limits; a standard name, outsourced processor or data-pattern match is not assessed compliance.',
 '## Preserved holds and release boundary',
 'All13 objective4.5 held feedback dispositions are inherited exactly, including DNS resolver, 802.1X/NAC, SPF/DMARC, Unix permissions, DLP/TLS visibility and family limits. The completed objective4.6 final eleven and first eighteen, and earlier4.8/4.3/4.1/3.3/3.2/3.1/2.5/2.4/2.3/2.2/actor/supplier/crypto/PKI/PFS/channel/Unicode/PBQ grammar/grading/delivery/targeting holds remain. m305 whole scope,m046 precise contrast,m432 whole numbered scope, older42 source bindings, recovery limits and KEV/BOD26-04 policy uncertainty stay protected. No prior pilot approval transfers.',
 'Private p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, unavailable/unreviewed with null trusted identity. Prior objective52 local fallback does not review or approve the private variant. No private fetch, export or substitution; no stems, offered choices, keys, option-indexed answers or learner records are exported.',
 'Active package unchanged: **1878 records /435 identities /2954 review decisions /489 unresolved mappings /seven existing primary proposals**. SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All25 protected release hashes remain. Thirty-six unsupported local PBQ grammars, private review, remaining content/feedback/support coverage, substantive holds, owner decisions and calibration still block readiness.',
 '**NOT READY.** Local/offline/default-off/unwired/learner-invisible. No runtime, active-package, canonical concept/role/scope/skill/difficulty/teaching/weight, learner evidence, shadow write, live write, migration, cohort, deployment, activation or Phase3 change.',
 '## Validation and delivery',
 'Run node '+scriptPath+' and npm run audit:content-mapping. The focused audit rebuilds/matches the frozen ledger; verifies all61 prior packet/current bindings, exact12-question set and separate structural rank, actual authored/imported comparisons,12 mains,36 wrong corrections,12 shuffle probes,115 census rows,76 residual IDs and separate question/feedback counts. **'+negativeMutationChecks+' rejected mutations** cover stale/trusted substitution, fake snapshot/capture claims, corrected-count inflation, current/inherited hold erasure, ambiguity clearing, invented scope/roles/calibration/approvals/weights, duplicate or omitted coverage, forbidden exports, private fallback transfer and activation.',
 'All29 mapping tests, deterministic package verification, all25 protected hashes and git diff --check are required before an exact three-file **[skip deploy]** commit. Delivery requires local HEAD=origin/main=remote refs/heads/main. The marker is checked using configured Vercel ignoreCommand; a Git push does not establish live deployment. Browser/live/private delivery stays unverified, and unrelated dirty/generated files remain unstaged.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE54_MCQS_NOT_READY',candidateIds:ids,newQuestionDispositions:12,newFeedbackDispositions:12,bankProgress,objective54:packet.objective54Denominator,unchangedObjective45:packet.unchangedObjective45Progress,unchangedObjective46:packet.unchangedObjective46Progress,snapshotReplays:0,wrongCorrections:36,changedWrongCorrections:32,unchangedWrongCorrections:4,shuffleProbes:12,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
