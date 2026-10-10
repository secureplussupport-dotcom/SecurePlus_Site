import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-objective52-risk-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective52-risk-mcqs-proposals.json',reportPath='docs/phase-2b5-objective52-risk-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective54-mcqs-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'e31325107be83ea819bd3806b761e1e8dfb6a8da029dedc7d9ed8ea5891f30b2');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective45-mcqs-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);assert.equal(c.ledger.rows.filter(r=>legacyPrevious.has(r.recordId)).length,343);
const ids=["m029", "m189", "m373", "m081", "m651", "m031", "m604", "m087", "m655", "m188", "m733", "m089", "m374", "m605", "m644", "m731"];
const candidates=ids.map(id=>c.ledger.rows.find(r=>r.recordId==='mcq:'+id));
assert.equal(new Set(ids).size,16);assert(candidates.every(r=>r&&r.kind==='mcq'&&r.objectiveCodesObserved.includes('5.2')));
// The supplied order is a set order, not a structural-priority ranking.
assert.deepEqual(candidates.map(r=>r.priorityScore),[20,20,20,35,55,120,40,10,40,20,130,20,10,55,45,130]);
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
assert.equal(inventory.length,62);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);
const excluded=candidates.filter(r=>c.previous.has(r.recordId)),selected=candidates.filter(r=>!c.previous.has(r.recordId));
assert.equal(excluded.length,16);assert.deepEqual(selected,[]);assert(candidates.every(r=>!c.previous.has('explanation:'+r.recordId)));
const exclusions=excluded.map(r=>{const p=c.previous.get(r.recordId);return{recordId:r.recordId,sourceRevision:r.revisions.localEffective,publishedRecordSignature:r.revisions.publishedCatalogue,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),priorFamilyLabel:p.row.familyLabelProposal,reason:'current_matching_prior_substantive_question_judgment_reused_feedback_still_unreviewed',newQuestionCredit:0,newFamilyCredit:0};});
const priorInventory=base.allPacketReconciliation.inventory;
assert.deepEqual(inventory.filter(r=>r.path!==basePath),priorInventory);
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorBank.length,385);assert.equal(priorFeedback.length,349);
const broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('5.2')),oldBroad=broad.filter(r=>c.previous.has(r.id));
assert.equal(c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('5.2')).length,21);
const pilotPath='docs/drafts/phase-2b5-objective52-pilot-mapping-proposals.json',pilot=readJson(pilotPath);
assert(candidates.every(r=>c.previous.get(r.recordId).path===pilotPath));
const preservedPilotQuestionProposals=pilot.questionProposals.filter(r=>r.disposition==='direct_pilot_proposal');
assert.deepEqual(preservedPilotQuestionProposals.map(r=>r.questionId),['m032','m086','m088','m196','m635']);
for(const r of preservedPilotQuestionProposals){assert.equal(r.sourceRevision,c.records.get(r.recordId).localRevisionSignature);assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);assert.equal(r.humanApproved,false);assert.equal(r.masteryWeight,0);}
verifySourceBindings(pilot.draftComparisons);assert.equal(hashFile(pilotPath),'de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c');
const draft=readJson(pilot.draftComparisons[0].path),clean=draft.questions.find(r=>r.id==='draft.pilot1.rpo.03');
const pilotBoundary={preservedPilotQuestionProposals,ownerContentDecisionBinding:{path:'docs/drafts/phase-2b5-pilot-batch-1-content-decision.md',sha256:hashFile('docs/drafts/phase-2b5-pilot-batch-1-content-decision.md')},ownerFamilyDecisionBinding:{path:'docs/drafts/phase-2b5-pilot-batch-1-family-decision.md',sha256:hashFile('docs/drafts/phase-2b5-pilot-batch-1-family-decision.md')},draftComparisons:pilot.draftComparisons,ownerReservedChoices:pilot.ownerReservedChoices,approvedContentRevisionsPreserved:true,approvedFamilyJudgmentsPreserved:true,newPilotRoleCredit:0,roleWeightTeachingPublicationApprovalTransferred:false,recoveryBoundary:'MTD is the outer business-interruption limit; RTO is the service-restoration target; RPO concerns recoverable data age. One contrast does not supply independently assessed secondary evidence. MTD remains supporting scope, not an explicit BIA exam bullet.',cleanPointBoundary:{recordId:clean.id,draftQuestionRevision:sig(clean),familyRationale:clean.familyRationale,accuracyCheck:clean.accuracyCheck,priorBankRecordId:'mcq:m088',priorBankRevision:c.records.get('mcq:m088').localRevisionSignature,hold:'Owner accepted the clean-point reasoning distinction from tested successful version cadence. This is editorial judgment, not psychometric independence, learner transfer or a clean-source guarantee.'},mttrGlossaryBoundary:pilot.instructionalProposals.find(r=>r.recordId==='glossary:mttr'),coarseRecoveryPbqBoundary:pilot.questionProposals.filter(r=>['pbq:p048','pbq:p211'].includes(r.recordId))};
const reviews=[
  {
    "id": "m029",
    "meaning": "Use the supplied asset value, exposure fraction and annual event rate to calculate expected annual financial loss.",
    "hold": "HOLD a 0.10 events/year rate as universally the same as a 10% chance of at least one event, or expected loss as a guaranteed budget or realised saving. Current wording fixes the rate unit; value, exposure, frequency and dependence are supplied assumptions, not measurements. One combined arithmetic decision, sharing the prior ALE family with m189/m373; no BIA or recovery role.",
    "main": "First calculate loss per event: $500,000 \u00d7 0.60 = $300,000. Then annualise: $300,000 \u00d7 0.10/year = $30,000/year.",
    "contrasts": [
      "The single-event loss has not yet been multiplied by annual event frequency.",
      "Applying annual rate to the whole asset omits the partial-loss exposure fraction.",
      "The full asset value ignores both partial exposure and the supplied event rate."
    ],
    "family": "asset-exposure-frequency-loss-calculation"
  },
  {
    "id": "m189",
    "meaning": "Annualise the supplied partial single-event loss using the stated annual rate.",
    "hold": "HOLD the annual rate as a guaranteed event schedule, or positive expected benefits as sufficient approval to buy a control. The authored eliminate-risk investment shortcut is removed. Annual rate is interpreted per year from its name; no currency conversion, estimator validation or real budget. Same prior ALE family as m029/m373.",
    "main": "\u00a3500,000 \u00d7 0.40 = \u00a3200,000/event; multiplying by 0.25 events/year gives \u00a350,000/year.",
    "contrasts": [
      "The exposure-adjusted loss is per event, not annualised yet.",
      "Asset value alone applies neither exposure nor annual frequency.",
      "Asset value times annual rate leaves out the 40% exposure factor."
    ],
    "family": "asset-exposure-frequency-loss-calculation"
  },
  {
    "id": "m373",
    "meaning": "Calculate ALE from the supplied value, exposure and annual rate without adding an unasked control decision.",
    "hold": "HOLD the single annual expected value as tail-loss protection, a forecast guarantee or proof of cost justification. Authored control-benefit example is removed; its keywords confer no extra assessed calculation or BIA role. Same prior ALE family despite changed numbers/currency; assumptions and model quality remain untested.",
    "main": "\u00a31,000,000 \u00d7 0.30 = \u00a3300,000/event; \u00a3300,000 \u00d7 0.50/year = \u00a3150,000/year.",
    "contrasts": [
      "Multiplying asset value by annual rate skips exposure.",
      "Single-event loss needs the annual frequency multiplier.",
      "The larger amount is not the product of the three supplied factors."
    ],
    "family": "asset-exposure-frequency-loss-calculation"
  },
  {
    "id": "m081",
    "meaning": "Subtract residual expected annual loss and annual control cost from original expected annual loss.",
    "hold": "HOLD negative expected financial benefit as a universal instruction to reject a control or waive mandatory duties. The current stem explicitly excludes other benefits and obligations and supplies residual loss; it no longer assumes complete loss elimination. Annual cost and benefit must share a time basis. Same prior net-benefit family as m651; no real investment decision.",
    "main": "Gross annual loss reduction is $40,000 \u2212 $10,000 = $30,000. Subtract $50,000 annual cost for \u2212$20,000/year.",
    "contrasts": [
      "Gross reduction is before paying for the control.",
      "Residual expected loss is what remains, not net benefit.",
      "This subtracts cost from the whole original loss and incorrectly ignores residual loss."
    ],
    "family": "net-annual-control-benefit"
  },
  {
    "id": "m651",
    "meaning": "Calculate annual net benefit when supplied annual event frequency changes and single-event loss stays fixed.",
    "hold": "HOLD a one-time appliance purchase as automatically equal to total annual cost, estimated event rates as guaranteed savings, or an alternate firewall as proven prevention. Effective wording supplies total annual cost and constant SLE rather than conflating annual chance, frequency and capex. Same prior net-benefit family as m081; the intermediate arithmetic is not separate assessed skill.",
    "main": "Original ALE is $200,000 \u00d7 0.10/year = $20,000/year; residual is $2,000/year. Gross reduction $18,000 less annual cost $5,000 gives $13,000/year.",
    "contrasts": [
      "Residual ALE is before subtracting it and the annual control cost from the original estimate.",
      "Gross reduction omits the annual control cost.",
      "Original ALE is not the net change after residual loss and cost."
    ],
    "family": "net-annual-control-benefit"
  },
  {
    "id": "m031",
    "meaning": "Recognise the specified insurance purchase as transfer of covered financial consequences.",
    "hold": "HOLD insurance as eliminating the threat, all loss, business interruption or legal accountability, or outsourcing as automatically transferring every duty. Actual coverage, exclusions, deductibles, limits and performance require review. Retained mitigation correction is an example, not guaranteed MFA/encryption effectiveness. Captured authored hard\u2192snapshot easy is metadata only. Same prior transfer family as m604.",
    "main": "Coverage shifts specified financial consequences; remaining exposure and responsibilities still need treatment.",
    "contrasts": [
      "Avoidance stops or declines the activity; this purchase retains it.",
      "Mitigation adds controls to reduce likelihood or impact; the supplied insurance purchase is classified by covered consequence transfer.",
      "Acceptance knowingly retains risk with authority and monitoring; this purchase arranges coverage instead."
    ],
    "family": "insurance-risk-transfer-identification"
  },
  {
    "id": "m604",
    "meaning": "Classify the described covered-loss insurance purchase as transfer.",
    "hold": "HOLD comprehensive insurance wording as full coverage, a software flaw as repaired by buying a policy, or purchase as a complete risk programme. Current narrowed stem removes assumed economic superiority. Terms, remaining duties and disruption matter. Same prior family as m031, not another independent scenario.",
    "main": "Insurance shifts covered loss subject to its terms; the underlying flaw and other consequences can remain.",
    "contrasts": [
      "The activity continues instead of being discontinued.",
      "The purchase does not itself remove the software flaw or reduce its exploitability.",
      "Arranging covered-loss transfer is different from bearing the whole loss without that transfer."
    ],
    "family": "insurance-risk-transfer-identification"
  },
  {
    "id": "m087",
    "meaning": "Recognise discontinuing the risk-creating service as avoidance of that defined exposure.",
    "hold": "HOLD stopping one activity as eliminating every organisational risk, existing liability or transition exposure. All three wrong corrections are unchanged: mitigation/transfer may coexist, and acceptance is not literally no governance action. Monitoring, accountability and obligations remain. Same prior avoidance family as m655; no service is shut down.",
    "main": "Avoidance discontinues the defined activity; unrelated risks and existing obligations remain.",
    "contrasts": [
      "Mitigation reduces likelihood or impact while retaining the activity; it is not the described discontinuation.",
      "Transfer shifts specified consequences rather than discontinuing the activity or eliminating all duties.",
      "Acceptance retains the activity and knowingly bears risk; it can still involve documentation and monitoring."
    ],
    "family": "activity-discontinuation-avoidance"
  },
  {
    "id": "m655",
    "meaning": "Recognise cancelling a planned risk-creating feature as avoidance.",
    "hold": "HOLD cancellation as proof of legal compliance or absence of every privacy exposure. Existing data, dependencies, obligations and alternative activity need separate analysis; this does not establish a particular privacy-law requirement. Same prior avoidance family as m087, no new independent family for changing the sector or noun.",
    "main": "Cancelling this feature removes that activity as an exposure source, not all privacy risk.",
    "contrasts": [
      "Mitigation reduces risk while retaining an activity; this feature is cancelled.",
      "The supplied action does not allocate covered consequences to a third party.",
      "Acceptance would retain and knowingly bear the exposure rather than cancel the feature."
    ],
    "family": "activity-discontinuation-avoidance"
  },
  {
    "id": "m188",
    "meaning": "Recognise documented retention of assessed risk by the supplied authorised owner within tolerance and without a mandatory remediation duty.",
    "hold": "HOLD treatment cost exceeding a simple financial estimate as sufficient authority, documentation as legal exemption, or acceptance as forever/no monitoring. The stem now supplies authority, tolerance, no mandatory duty, monitoring and review. Actual assessment and duties remain unverified; acceptance may coexist with existing controls. Same prior acceptance family as m733.",
    "main": "Accept within the supplied conditions, retaining accountable ownership, rationale, monitoring and review triggers.",
    "contrasts": [
      "Avoidance stops the activity; the organisation continues it.",
      "The described decision adds no further risk-reduction treatment; existing controls may still operate.",
      "No insurer or contractual consequence allocation is described."
    ],
    "family": "authorized-risk-acceptance"
  },
  {
    "id": "m733",
    "meaning": "Select documented monitored acceptance as a response the authorised owner can choose under the explicit tolerance and duty premises.",
    "hold": "HOLD acceptance as the only permissible choice, ignored status quo, high control cost as automatically outweighing all mission consequences, or insurance as eliminating the threat. Current stem supplies authorised choice, approved tolerance and absent mandatory remediation; it does not approve a real exception. Snapshot-only source, same prior acceptance family as m188.",
    "main": "Document the conditional acceptance and reassess changes; low estimated treatment benefit does not override duties.",
    "contrasts": [
      "Avoidance may be possible but is not automatically required under the supplied acceptable-risk premise.",
      "Installing every available control disregards assessed cost, disruption and benefit.",
      "Insurance can transfer covered financial consequences without removing the underlying threat or all responsibility."
    ],
    "family": "authorized-risk-acceptance"
  },
  {
    "id": "m089",
    "meaning": "Apply the supplied likelihood-impact score and local categories, interpreting the score as the product used in feedback.",
    "hold": "HOLD one universal 3\u00d73 threshold scheme, ordinal multiplication as calibrated probability/money, or a generic Critical category imposed on this matrix. Stem supplies values and thresholds but leaves multiplication explicit in feedback rather than naming the score rule; preserve this narrow premise hold. Score5 cannot arise from 1\u20133 integer products, not an invented missing outcome. Prior matrix family retained.",
    "main": "Using the stated teaching rule, 3 \u00d7 2 = 6, classified High by the supplied ranges. This is a local score, not a financial loss estimate.",
    "contrasts": [
      "Low covers the supplied 1\u20132 range rather than this score.",
      "Medium covers 3\u20134; the taught product is 6.",
      "Critical is not among this matrix\u2019s supplied categories; other organisations may define it differently."
    ],
    "family": "organization-defined-risk-matrix"
  },
  {
    "id": "m374",
    "meaning": "Classify the supplied control as mitigation and insurance as transfer in one paired-response decision.",
    "hold": "HOLD a \u00a3200,000 unspecified-duration control cost compared with \u00a3180,000/year as automatically negative ROI, or a \u00a350,000/year policy as superior. Cost horizon, total operating costs, coverage and benefits are not supplied for that comparison. The authored ROI conclusion is removed. Both responses may coexist, and one paired key does not yield two independently scored skills.",
    "main": "A reduces likelihood or impact; B transfers covered financial consequences. Classification does not select the best investment.",
    "contrasts": [
      "The control reduces exposure without discontinuing activity; insurance is not simple acceptance.",
      "The control changes exposure, while insurance retains activity and transfers specified consequences.",
      "These labels reverse the supplied reduction and transfer mechanisms."
    ],
    "family": "paired-risk-treatment-classification"
  },
  {
    "id": "m605",
    "meaning": "Distinguish the supplied broad strategic willingness to take risk from specific acceptable tolerance boundaries.",
    "hold": "HOLD every framework using the two terms identically, appetite as a permission to violate obligations, or board terminology as an actual quantified threshold. Current stem removes the imported definitive-threshold ambiguity; terminology and operational limits need the adopted framework. Retain the prior strategic-appetite family without new canonical role.",
    "main": "Appetite expresses broad willingness in pursuing objectives; tolerance applies more specific acceptable limits.",
    "contrasts": [
      "Tolerance concerns specific boundaries rather than the broad strategic stance stated here.",
      "Residual risk is exposure remaining after controls, not overall willingness.",
      "A register records risks and management details, rather than being the willingness itself."
    ],
    "family": "strategic-risk-appetite-distinction"
  },
  {
    "id": "m644",
    "meaning": "Identify the metric for monetary loss from one event, distinct from annual frequency and a loss fraction.",
    "hold": "HOLD recognising SLE as validating the asset value/exposure estimate, proving a total real-world loss model, or assessing an ALE computation. Asset value times exposure is the supplied introductory model; indirect loss, multiple assets and uncertainty need actual modelling. No data centre damage or financial record inspected.",
    "main": "SLE is monetary loss per event; in the teaching model it is asset value multiplied by the dimensionless exposure fraction.",
    "contrasts": [
      "ALE incorporates annual event frequency as well as event loss.",
      "ARO is expected events per year rather than money lost per event.",
      "Exposure factor is a fraction of value lost, not the resulting monetary loss."
    ],
    "family": "single-loss-expectancy-identification"
  },
  {
    "id": "m731",
    "meaning": "Request a documented authorised temporary exception through the supplied governance process with interim controls and review conditions.",
    "hold": "HOLD business need as authorising continued noncompliance, requesting as granting approval, a tested replacement as proven installed, or an internal waiver as overriding law/contract. Actual authorised decision, permitted deviation, interim control efficacy, accountable owner and expiry/review triggers remain unverified. Snapshot-only; AES keyword creates no encryption skill or universal mandate.",
    "main": "Use the approved risk-assessed exception process; ownership, interim controls and review/expiry matter, and the request may be refused.",
    "contrasts": [
      "Usefulness is not permission for undocumented noncompliance.",
      "A permanent ownerless exemption removes accountability and reassessment.",
      "A vendor purchase or waiver does not transfer all organisational responsibility."
    ],
    "family": "authorized-time-bounded-risk-exception"
  }
];
assert.deepEqual(reviews.map(r=>r.id),ids);
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();

const sourceChecks=candidates.map(row=>{
 const s=c.questions.get(row.recordId),q=s.q,pre=s.preQuestion,shuffled=shuffle(q);
 assert.equal(s.authored===null,['m731','m733'].includes(q.id));
 if(s.snapshots.length){assert.equal(s.snapshots.length,1);assert.equal(s.captures.length,1);const replay=publicationPipeline(c.bank).overrides(s.snapshots).mcqs.find(x=>x.id===q.id),{_baseOrder,_adminOrder,...semantics}=replay;assert.equal(sig(semantics),row.revisions.localEffective);assert.equal(s.pub._adminOrder,s.captures[0].sort_order);}
 else{assert(s.authored);assert.equal(s.captures.length,0);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);}
 assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);assert.equal(q.correct,pre.correct);
 assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
 for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
 assert.notEqual(sig(q.exp),sig(pre.exp));const unchangedWrongCorrectionCount=q.opts.map((_,j)=>j).filter(j=>j!==q.correct&&pre.wrongFeedback?.[j]===q.wrongFeedback[j]).length;
 return{recordId:row.recordId,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:s.snapshots.length>0,sourceLayerDisposition:s.authored===null?'snapshot_only_no_authored_or_imported_substitute':s.snapshots.length?'authored_then_captured_snapshot_then_effective_editorial':row.flags.importedSource?'imported_authored_equals_preeditorial_then_effective_editorial':'authored_equals_preeditorial_then_effective_editorial',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',authoredMissingWrongCorrections:s.authored===null?null:!s.authored.wrongFeedback,stemChangedFromPreeditorial:sig(q.q)!==sig(pre.q),optionsChangedFromPreeditorial:sig(q.opts)!==sig(pre.opts),mainCorrectionChanged:true,wrongCorrectionsChanged:sig(q.wrongFeedback)!==sig(pre.wrongFeedback??null),changedWrongCorrectionCount:3-unchangedWrongCorrectionCount,unchangedWrongCorrectionCount,optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0},status:'source_inspection_no_additional_question_credit'};
});
assert.equal(sourceChecks.filter(r=>r.snapshotReplayChecked).length,3);assert.equal(sourceChecks.filter(r=>r.stemChangedFromPreeditorial).length,13);assert.equal(sourceChecks.filter(r=>r.optionsChangedFromPreeditorial).length,6);assert.equal(candidates.filter(r=>r.flags.stemChanged).length,11);assert.equal(candidates.filter(r=>r.flags.optionsChanged).length,4);assert.deepEqual(candidates.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m651','m604','m655','m605','m644']);assert.equal(sourceChecks.filter(r=>r.authoredMissingWrongCorrections).length,4);
assert.equal(sourceChecks.filter(r=>r.wrongCorrectionsChanged).length,15);assert.equal(sourceChecks.reduce((n,r)=>n+r.changedWrongCorrectionCount,0),44);assert.equal(sourceChecks.reduce((n,r)=>n+r.unchangedWrongCorrectionCount,0),4);
const arithmeticChecks=[];
for(const [id,value,exposure,rate,loss,currency]of [['m029',500000,.6,.1,30000,'$'],['m189',500000,.4,.25,50000,'£'],['m373',1000000,.3,.5,150000,'£']]){
 assert.equal(value*exposure*rate,loss);const s=c.questions.get('mcq:'+id);assert.equal(s.q.opts[s.q.correct],currency+loss.toLocaleString('en-US'));arithmeticChecks.push({recordId:s.row.recordId,stemRevision:sig(s.q.q),formula:'asset_value_times_exposure_fraction_times_annual_event_rate',units:'money_per_event_times_events_per_year_yields_money_per_year',suppliedModelArithmeticVerified:true,estimateNotGuaranteedRealisedLoss:true,noIndependentIntermediateSkillCredit:true});
}
for(const [id,before,after,cost,benefit]of [['m081',40000,10000,50000,-20000],['m651',200000*.1,200000*.01,5000,13000]]){
 assert.equal(before-after-cost,benefit);const s=c.questions.get('mcq:'+id);assert.equal(s.q.opts[s.q.correct],(benefit<0?'-':'')+'$'+Math.abs(benefit).toLocaleString('en-US'));arithmeticChecks.push({recordId:s.row.recordId,stemRevision:sig(s.q.q),formula:'original_ALE_minus_residual_ALE_minus_total_annual_control_cost',units:'all_terms_money_per_year',suppliedModelArithmeticVerified:true,estimateNotGuaranteedRealisedSavings:true,annualCostNotUnqualifiedOneTimePurchase:true,noIndependentIntermediateSkillCredit:true});
}
assert.equal(3*2,6);assert(6>=6&&6<=9);assert.equal(c.questions.get('mcq:m089').q.opts[c.questions.get('mcq:m089').q.correct],'High');arithmeticChecks.push({recordId:'mcq:m089',stemRevision:sig(c.questions.get('mcq:m089').q.q),formula:'likelihood_score_times_impact_score',units:'local_ordinal_score_not_probability_or_money',suppliedModelArithmeticVerified:true,scoreRuleInFeedbackStemInterpretationHeld:true});
const questionReassessments=candidates.map((row,i)=>{
 const r=reviews[i],p=c.previous.get(row.recordId);assert.equal(p.row.familyLabelProposal,r.family);assert.equal(p.row.primaryConceptProposal,null);
 return{recordId:row.recordId,sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),assessedUnderstanding:r.meaning,contentQualification:r.hold,familyLabelProposal:r.family,familyStatus:'existing_provisional_label_preserved_no_independence_approval',objectiveScopeProposal:null,skillRoleProposal:null,numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,newQuestionCredit:0,newFamilyCredit:0,masteryWeight:0,humanApproved:false,published:false,independentEvidence:false,difficultyObserved:row.kind==='mcq'?c.questions.get(row.recordId).q.difficulty:null,difficultyDisposition:'source_label_uncalibrated'};
});
const questionProposals=[]; // Existing source-bound question judgments are reassessed without new coverage.
const explanationProposals=candidates.map((row,i)=>{
 const s=c.questions.get(row.recordId),q=s.q,r=reviews[i],indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct),prior=c.previous.get(row.recordId);
 assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
 return{recordId:'explanation:'+row.recordId,kind:'explanation_bundle',parentId:row.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:row.revisions.localEffective,parentPublishedRevision:row.revisions.publishedCatalogue,parentDispositionStatus:prior?'existing_matching_question_judgment_reused':'new_question_judgment_in_this_packet',reusedParentDispositionRevision:prior?sig(prior.row):null,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:r.main,contentQualification:r.hold,objectiveScopeProposal:null,withheldPreciseContrast:r.family+'_limits',roleProposal:null,deliveryUnderstanding:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:r.contrasts[k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id));
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
assert.equal(broad.length,141);assert.equal(oldBroad.length,42);assert.deepEqual(counts(oldBroad),{glossary_definition:15,mcq:21,pbq:6});assert.equal(selectedIds.size,16);assert.equal(remaining.length,83);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,12);assert.equal(remaining.filter(r=>r.kind==='pbq').length,1);
const privateBroad=broad.filter(r=>r.id.startsWith('private:'));assert.deepEqual(privateBroad.map(r=>r.id),['private:explanation:pbq:p017','private:pbq:p017']);assert(privateBroad.every(r=>remaining.includes(r)));assert.equal(broad.length-privateBroad.length,139);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:r.id.startsWith('private:')?'unavailable_private_semantics_not_reviewed':c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,combinedQuestions=new Set([...priorBank.map(r=>r.recordId),...questionProposals.map(r=>r.recordId)]),combinedFeedback=new Set([...priorFeedback.map(r=>'explanation:'+r.recordId),...explanationProposals.map(r=>r.recordId)]),paired=bankRows.filter(r=>combinedQuestions.has(r.recordId)&&combinedFeedback.has('explanation:'+r.recordId));
assert.equal(combinedQuestions.size,385);assert.equal(combinedFeedback.size,365);assert.equal(paired.length,365);assert.equal(paired.filter(r=>r.kind==='mcq').length,349);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,olderQuestionOnlyDispositions:olderQuestions.length,allPacketPriorQuestions:priorBank.length,newQuestions:questionProposals.length,allPacketCombinedQuestions:combinedQuestions.size,remainingQuestionDispositions:483-combinedQuestions.size,combinedMcqs:bankRows.filter(r=>r.kind==='mcq'&&combinedQuestions.has(r.recordId)).length,combinedLocalPbqs:bankRows.filter(r=>r.kind==='pbq'&&combinedQuestions.has(r.recordId)).length,newFeedbackBundles:16,priorFullFeedback:priorFeedback.length,fullFeedbackCombined:combinedFeedback.size,fullFeedbackRemaining:483-combinedFeedback.size,completeQuestionFeedbackPairs:paired.length,remainingOlderQuestionOnlyWithoutFullFeedback:olderQuestions.filter(r=>!combinedFeedback.has('explanation:'+r.recordId)).length};
assert.equal(bankProgress.combinedMcqs,357);assert.equal(bankProgress.combinedLocalPbqs,28);assert.equal(bankProgress.remainingOlderQuestionOnlyWithoutFullFeedback,20);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective54HeldDispositions:base.explanationProposals.map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal})),olderQuestionPacketBindings:olderQuestions.map(r=>({recordId:r.recordId,priorPacketPath:r.priorPacketPath,priorDispositionRevision:r.priorDispositionRevision,status:'existing_limits_preserved_no_full_feedback_or_approval_inherited'}))};
assert.equal(priorHolds.objective54HeldDispositions.length,12);
const comparisonSpecs=[
  {
    "ids": [
      "m029",
      "m189",
      "m373",
      "m644"
    ],
    "meaning": "The three ALE calculations keep one prior asset-exposure-frequency family. SLE naming is a different decision, though shared vocabulary and intermediate arithmetic do not create independent components or a BIA role."
  },
  {
    "ids": [
      "m081",
      "m651",
      "m374"
    ],
    "meaning": "The two annual net-benefit questions keep one prior family. Paired response classification does not assess ROI, and m374 lacks comparable control-cost horizon. Positive or negative expected benefit is not governance approval."
  },
  {
    "ids": [
      "m031",
      "m604",
      "m374",
      "m188",
      "m733",
      "m087",
      "m655"
    ],
    "meaning": "Insurance recognition, acceptance and activity discontinuation each retain their earlier paired shared families; the paired mitigation/transfer choice is one combined decision. Residual risk, duties and cost alone prevent blanket transfer or acceptance claims."
  },
  {
    "ids": [
      "m605",
      "m089",
      "m731",
      "m032",
      "m086",
      "m088",
      "m196",
      "m635"
    ],
    "meaning": "Broad appetite, local matrix application and exception governance are different prior decisions. The five direct recovery/BIA proposals remain exact pending roles; ALE/risk words do not promote them. MTD/RTO/RPO boundaries and usable-clean-point versus tested version cadence remain separate."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids.map(id=>'mcq:'+id),comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const s=c.questions.get('mcq:'+id),p=c.previous.get('mcq:'+id);return{recordId:s.row.recordId,sourceRevision:s.record.sourceSignature,localRevision:s.row.revisions.localEffective,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null};}),newFamilyCredit:0,independenceApproved:false}));
const sourceBindings=[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective54-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective54-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)},...inventory.map(({path,sha256})=>({path,sha256})),pilotBoundary.ownerContentDecisionBinding,pilotBoundary.ownerFamilyDecisionBinding,{path:'docs/phase-2b5-objective52-pilot-mapping-review.md',sha256:hashFile('docs/phase-2b5-objective52-pilot-mapping-review.md')},...pilot.draftComparisons.map(({path,sha256})=>({path,sha256}))];
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'e383afca1253d4695c8aa603d4e8be47c3ab5356',sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,legacyTrackedPriorQuestions:343},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences,status:'current_revision_bound_existing_question_judgments_no_new_credit_or_full_feedback_inference'},bankSignature:c.ledger.bankSignature,selectionPolicy:'Requested objective5.2 nonpilot candidate set in supplied order; existing structural ranking recorded separately; all prior substantive packets reconciled before new question credit',structuralPriorityQuestionIds:rankedIds,candidateQuestionRecordIds:candidates.map(r=>r.recordId),selectedQuestionRecordIds:selected.map(r=>r.recordId),selectedFeedbackRecordIds:candidates.map(r=>'explanation:'+r.recordId),questionExclusions:exclusions,ambiguousPremiseOrContrastHolds:['mcq:m089','mcq:m374','mcq:m731'],ambiguityDisposition:'qualified_pending_owner_not_resolved_or_approved',sourceChecks,arithmeticChecks,questionReassessments,pilotBoundary,questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorHolds,objective52Census:census,objective52Denominator:{broadCandidates:141,localCandidates:139,privateMetadataOnlyCandidates:2,allPacketPriorDispositions:42,newQuestionDispositions:0,reassessedQuestionsNoNewCredit:16,newFeedbackDispositions:16,newAgentDispositions:16,combinedAgentDispositions:58,remaining:83,remainingLocal:81,remainingPrivateMetadataOnly:2,remainingByKind:counts(remaining)},remainingObjective52RecordIds:remaining.map(r=>r.id),bankProgress,unchangedObjective54Progress:base.objective54Denominator,unchangedObjective45Progress:base.unchangedObjective45Progress,unchangedObjective46Progress:base.unchangedObjective46Progress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},privateBoundary:{p017Revision:'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42',payloadReviewed:false,trustedRevisionId:null,localPilotFallbackDoesNotTransferToPrivate:true},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};
function validate(value){
 assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);
 assert.equal(new Set(value.selectedQuestionRecordIds).size,0);assert.equal(value.questionProposals.length,0);assert.equal(value.explanationProposals.length,16);
 assert(value.questionProposals.every(r=>!c.previous.has(r.recordId)));assert(value.explanationProposals.every(r=>!legacyPrevious.has(r.recordId)));
 for(const r of value.questionProposals){const s=c.questions.get(r.recordId);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);}
 for(const r of value.explanationProposals){const s=c.questions.get(r.parentId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.record.localRevisionSignature);assert.equal(r.mainCorrectionRevision,sig(s.q.exp));assert.equal(r.wrongFeedbackRevision,sig(s.q.wrongFeedback));assert.equal(r.distractorCorrections.length,3);}
 // Every exported decision is checked against independently rebuilt current sources and fixed review judgments.
 const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);
}
let completedNegativeChecks;validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet);assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<16;i++){
 reject(p=>p.questionReassessments[i].sourceRevision=p.sourceChecks[i].revisions.preEditorialSnapshotMerged);reject(p=>p.questionReassessments[i].trustedRevisionId=p.sourceChecks[i].revisions.trustedCompilerObserved);reject(p=>p.questionReassessments[i].contentQualification='');reject(p=>p.questionReassessments[i].primaryConceptProposal='invented');reject(p=>p.questionReassessments[i].humanApproved=true);reject(p=>p.questionReassessments[i].newFamilyCredit=1);reject(p=>p.questionReassessments[i].numberOfKeyedDecisions=2);reject(p=>p.questionReassessments[i].familyLabelProposal='independent');reject(p=>p.questionReassessments[i].objectiveScopeProposal={assessedCodes:['5.2'],contextCodes:[],status:'approved'});reject(p=>p.questionReassessments[i].skillRoleProposal='invented');reject(p=>p.questionReassessments[i].difficultyDisposition='calibrated');
}
for(let i=0;i<16;i++){
 reject(p=>p.sourceChecks[i].snapshotReplayChecked=!p.sourceChecks[i].snapshotReplayChecked);reject(p=>p.sourceChecks[i].revisions.authored=p.sourceChecks[i].revisions.authored===null?p.sourceChecks[i].revisions.preEditorialSnapshotMerged:null);reject(p=>p.sourceChecks[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);reject(p=>p.sourceChecks[i].optionShuffleProbe.feedbackRemapChecked=false);reject(p=>p.sourceChecks[i].sourcePriority=0);
 reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%16].sourceRevision);reject(p=>p.explanationProposals[i].parentLocalRevision='stale');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');reject(p=>p.explanationProposals[i].objectiveScopeProposal={assessedCodes:['5.2']});reject(p=>p.explanationProposals[i].mainCorrectionRevision='stale');reject(p=>p.explanationProposals[i].deliveryGate='all_before_submit');reject(p=>p.explanationProposals[i].approvedRemediation=true);
 for(let k=0;k<3;k++){reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');reject(p=>p.explanationProposals[i].distractorCorrections[k].assessedSecondary=true);}
}
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);for(const path of holdPaths)reject(p=>{let r=p.priorHolds;for(const k of path.slice(0,-1))r=r[k];r[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{let old=p.priorHolds;for(let i=0;i<15;i++)old=old.inheritedHolds;old=old.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
for(let i=0;i<42;i++)reject(p=>p.allPacketReconciliation.olderQuestions[i].priorDispositionRevision='stale');
reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.allPacketReconciliation.olderQuestions.push(p.allPacketReconciliation.olderQuestions[0]));reject(p=>p.allPacketReconciliation.supportOnlyReferences[0].status='fully_reviewed');reject(p=>p.questionProposals.push({...p.questionReassessments[0],newQuestionCredit:1}));reject(p=>p.questionExclusions.push({recordId:'mcq:'+ids[0],newQuestionCredit:1}));reject(p=>p.ambiguousPremiseOrContrastHolds.pop());reject(p=>p.ambiguityDisposition='cleared');reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.bankProgress.allPacketCombinedQuestions=483);reject(p=>p.bankProgress.fullFeedbackCombined=373);reject(p=>p.objective52Census.pop());reject(p=>p.objective52Denominator.remaining=0);reject(p=>p.privateBoundary.payloadReviewed=true);reject(p=>p.privateBoundary.localPilotFallbackDoesNotTransferToPrivate=false);reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.sourceBindings[0].sha256='stale');for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
reject(p=>p.unchangedObjective45Progress.remaining=0);reject(p=>p.unchangedObjective46Progress.remaining=0);reject(p=>p.structuralPriorityQuestionIds.reverse());reject(p=>p.sourceChecks[5].unchangedWrongCorrectionCount=0);reject(p=>p.sourceChecks[7].changedWrongCorrectionCount=3);
reject(p=>p.questionReassessments[0].newQuestionCredit=1);reject(p=>p.pilotBoundary.roleWeightTeachingPublicationApprovalTransferred=true);reject(p=>p.pilotBoundary.cleanPointBoundary.hold='');reject(p=>p.pilotBoundary.recoveryBoundary='');reject(p=>p.pilotBoundary.preservedPilotQuestionProposals[0].primaryConceptProposal=null);reject(p=>p.pilotBoundary.mttrGlossaryBoundary.conceptLinkProposals=['recovery.mttr']);reject(p=>p.objective52Denominator.remainingPrivateMetadataOnly=0);reject(p=>p.objective52Census.find(r=>r.recordId==='private:pbq:p017').status='reviewed');reject(p=>p.arithmeticChecks[0].units='probability');reject(p=>p.arithmeticChecks[4].annualCostNotUnqualifiedOneTimePurchase=false);reject(p=>p.arithmeticChecks[5].scoreRuleInFeedbackStemInterpretationHeld=false);
completedNegativeChecks=negativeMutationChecks;
const exported={...packet,negativeMutationChecks};validate(exported);
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const report=[
 '# Phase 2B-5 — objective 5.2 risk-treatment and quantification feedback',
 '**NOT READY.** Review date: **11 October 2026**. Finite local/offline review only. Baseline **'+packet.baselineCommit+'**; packet SHA-256 **'+hashFile(packetPath)+'**. A disposition records a judgment pending remaining editorial/metadata gates. A hold preserves a limitation and does not repair learner content. Complete feedback comprises the main explanation and all three wrong-choice corrections. Only this packet, report and focused audit are added.',
 '## Authority, overlap and finite selection',
 'The master plan and Phase 1 audit were read in full earlier in this continuing session. Product decisions follow the master plan; the audit supplies historical implementation evidence. Current source bindings were rechecked. The local content/family delegation authorises this review; it does not approve canonical roles, calibrated difficulty, teaching links, scope, weights or publication. No unresolved authority conflict affects this isolated local slice.',
 'Requested order: **'+ids.join(', ')+'**. It is a supplied group order, not structural rank. Scores: **20,20,20,35,55,120,40,10,40,20,130,20,10,55,45,130**. Separate structural rank: **'+rankedIds.join(', ')+'**. Priority is only an inspection aid. Every effective stem, choice, key, main and wrong correction was compared against the actual authored/imported or captured snapshot and preeditorial source.',
 '**All16 questions already have current matching question-only judgments** in the prior objective52 pilot-mapping packet. Those source-bound judgments and family labels are reused with **zero new question credit**. The packet records16 richer reassessments separately, plus16 reused-parent exclusions; questionProposals is empty. Prior broad reasoning is not inferred to be full feedback, semantic clearance, current metadata approval or learner evidence. None of these16 paired full-feedback bundles was substantively reviewed before this slice.',
 '**0 new questions +16 new complete feedback bundles =16 new pending catalogue dispositions.** All62 earlier substantive packets, including dictionary-bound older judgments, are reconciled before credit. No stale selected row, duplicate feedback credit, private substitution or source-insufficient deferral. m089 score-rule premise, m374 cost-horizon inference and m731 waiver authority remain explicit holds. Retained corrections in m031/m087 receive narrower contextual qualifications. No hold is cleared.',
 'New objectiveScopeProposal, skillRoleProposal and feedback roleProposal stay null; primary concepts/trusted identities stay null, secondary/link arrays empty, weights/family credit zero, approval/publication/evidence/activation false. Difficulty is an uncalibrated source label. One paired key, intermediate arithmetic or feedback contrast does not create independently scored component skills.',
 '## Exact all-packet coverage and objective census',
 '**42 older distinct question-only judgments (30 MCQs+12 local PBQs)** remain current historical coverage. Seventeen duplicate cross-packet references add nothing. Twelve minimal link/context references, including five pilot explanation links and four flashcard links, remain outside full-feedback or full-unit coverage. Completing16 older MCQ feedback bundles reduces older question-only rows still lacking complete feedback from36 to20. Historical packets, frozen ledger and active package are unchanged.',
 '| Pending local coverage | Before | New here | After | Remaining |\n| --- | ---: | ---: | ---: | ---: |\n| All-packet question judgments | 385 | 0 | 385/483 | 98 |\n| Complete feedback | 349 | 16 | 365/483 | 118 |\n| Question and full-feedback pairs | 349 | 16 | 365/483 | 118 |',
 'Question coverage stays **357/395 MCQs+28/88 local PBQs**, leaving38 MCQs+60 PBQs. Complete pairs become **349 MCQs+16 PBQs**, leaving **46 MCQs+72 PBQs** without complete feedback. The483 local-assessment denominator excludes two private alternatives, nine starters and two guest demos. A reassessment, shuffle, support link or draft comparison creates no question/family coverage.',
 'Objective5.2 whole catalogue union: **141 records**, comprising **139 local records+two private metadata-only records**. Prior42 substantive pending dispositions consist of **21 MCQs+six local PBQs+15 glossary definitions**. Add16 full-feedback dispositions for **58/141**, leaving **83:81 local+two private**. All21 local MCQs already have question judgments. This slice completes feedback for the16 nonpilot MCQs, while the five direct-pilot MCQ feedback bundles remain brief historical links pending full review. Six local PBQ feedback bundles also remain; no new local PBQ question coverage is claimed.',
 'Private residuals are **private:pbq:p017** and **private:explanation:pbq:p017**, not an unreviewed seventh local PBQ. The packet binds all141 census rows, all83 residual IDs and their exact current revisions. Local p017 fallback has its own earlier question judgment; it does not substitute for the selected private revision or its feedback. All four brief prior pilot flashcard references remain residual support records. No original whole-unit review is silently inferred.',
 '| Remaining whole objective5.2 kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
 'The12 remaining explanation bundles are **five local pilot-MCQ bundles+six local PBQ bundles+one private bundle**. The one remaining PBQ-kind record is private metadata only. Other local support/instructional residuals total70. Objective5.4 stays **39/115 pending dispositions,76 remaining**; objective4.5 **63/169,106 remaining**; objective4.6 **89/151,62 remaining**. No new credit or review in those objectives.',
 '## Question reassessment and all feedback contrasts',
 reviews.map(r=>'**'+r.id+' — reused question, new complete feedback.** '+r.meaning+'\n\n'+r.hold+'\n\nMain teaching: '+r.main+'\n\nWrong-choice contrasts, in current wrong-choice order: '+r.contrasts.map((t,k)=>(k+1)+'. '+t).join(' ')).join('\n\n'),
 '## Arithmetic, source precedence and conditional delivery',
 '**Six calculation probes** independently check three ALE results, two annual net-benefit results and the matrix application against the current keyed option. Inputs are supplied teaching assumptions; probes export revision/formula/unit verification without option indices or grading fields. SLE is money/event, exposure is a dimensionless fraction, ARO is events/year, and ALE is money/year. A frequency is not universally a probability of at least one event. Actual uncertainty, correlation, repeated-event loss, tail severity and estimator accuracy remain outside this narrow model.',
 'm029 checks $500,000×0.60×0.10/year=$30,000/year; m189 checks £500,000×0.40×0.25/year=£50,000/year; m373 checks £1,000,000×0.30×0.50/year=£150,000/year. m081 checks $40,000−$10,000−$50,000=−$20,000/year. m651 checks SLE unchanged, original $20,000/year, residual $2,000/year, gross reduction $18,000/year and net $13,000/year after $5,000 annual cost. m089 uses the feedback-taught multiplication3×2=6 and supplied High range; the score-rule omission remains held. m644 identifies a unit, not an additional computation. m374 receives no numerical ROI conclusion.',
 '**Three captured/snapshot publication replays: m031,m733,m731.** Each exact capture order and replayed effective semantics match the real editorial/publication pipeline. m031 has an authored hard label, then snapshot/effective easy; its retained mitigation correction is unchanged. m733/m731 are snapshot-only, with no authored/imported substitute. Their frozen authored-comparison flags falsely imply no changes because authored is null; actual snapshot-to-effective stems/options/main/wrong corrections are directly compared. Fake snapshot or capture metadata fails validation.',
 '**Five actual imported sources:** m651 QB2 question1; m604 QB1 question4; m655 QB2 question5; m605 QB1 question5; m644 QB1 question44. Each import equals its preeditorial source. Generic repeated corrections are replaced by specific contrasts. Authored rows m189,m373,m188,m374 lack wrongFeedback; effective editorial supplies their12 wrong corrections.',
 '**13 effective stems and six option sets change versus preeditorial; frozen authored-comparison flags identify11 stems and four option sets.** m087,m374,m644 stems are unchanged; m189/m373/m031 stem changes are spelling normalisation. Options change for m081,m651,m733,m605,m644,m731. All16 key positions are unchanged and all16 mains change. Fifteen whole wrong bundles change; m087 wrong bundle is entirely unchanged. **44 individual corrections are new/changed, four unchanged:** one m031 mitigation correction and all three m087 corrections. All48 choice/correction bindings,16 parent/feedback revisions and16 deterministic shuffle/remap probes are checked with zero family credit.',
 '| Question | Authored domain/difficulty | Preeditorial domain/difficulty | Effective domain/difficulty |\n| --- | --- | --- | --- |\n'+candidates.map(row=>{const s=c.questions.get(row.recordId);return'| '+row.questionId+' | '+(s.authored?s.authored.ch+'/'+s.authored.difficulty:'absent')+' | '+s.preQuestion.ch+'/'+s.preQuestion.difficulty+' | '+s.q.ch+'/'+s.q.difficulty+' |';}).join('\n'),
 'Only m651 (3→5) and m644 (4→5) change preeditorial domain. Seven difficulty labels change: m373 easy→medium; m081/m089 hard→medium; m651 medium→hard; m604/m655/m644 medium→easy. m031 authored hard→snapshot easy is separate. These are source observations, not approved retags or calibrated skill levels.',
 'Static practice, option-shuffle, wrong-feedback and launch-selector bindings match earlier reviewed delivery. Feedback is conditional on selection, submission, entitlement and the selected wrong choice. No browser pool/set/guest path, financial dataset, insurer contract, service shutdown, risk-owner action, board decision, accepted exception or live control efficacy is observed.',
 '## Family and pilot boundaries',
 comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
 'Existing labels are preserved exactly: ALE m029/m189/m373; net benefit m081/m651; transfer m031/m604; avoidance m087/m655; acceptance m188/m733. New reasoning detail does not create additional independent families. Matrix, paired treatment, appetite, SLE naming and exception governance retain their distinct prior labels. These16 remain outside the five pilot canonical concepts; financial impact or BIA vocabulary supplies no pilot role.',
 'The five direct pilot question proposals are copied unchanged as preserved historical decisions, with exact revisions: **m032/m635 RTO; m086 BIA; m088 RPO; m196 MTD**. Historical primary-role proposals are not current owner approval, and are not new reassessment fields. MTD remains supporting continuity context rather than an explicit exam BIA bullet. MTTR glossary combines repair/response boundaries and remains withheld; existing coarse p048/p211 support-only proposals stay unchanged with zero component evidence.',
 'MTD is the outer business-interruption limit; RTO is the service-restoration target; RPO concerns recoverable data age. Meeting one boundary cannot compensate for another, and a distractor or teaching mention provides no independently assessed secondary concept. The old pilot role/scope/difficulty choices remain pending.',
 'Exact owner content and family decision records and all three draft comparison hashes are pinned. Fifteen owner-approved draft content revisions and fourteen owner family judgments remain preserved separately from the immutable draft flags. mtd.01 remains in m196’s existing family, zero novelty credit. rpo.03’s clean-point reasoning distinction from m088’s tested successful version cadence remains accepted editorial judgment with its caveat: **not psychometric independence, learner transfer or a guaranteed clean source**. No new roles, teaching approval, weights, publication or canonical identities are inferred from that authority.',
 '## Primary-source support and inference limits',
 '[NIST IR8286r1](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=960491), December2025, describes risk appetite/tolerance, local exposure thresholds and response options including partial consequence transfer and residual-risk monitoring. Our inference keeps insurance, avoidance and authorised acceptance conditional, preserves context-specific matrix categories and avoids transferring every duty or treating cost alone as authority. The supplied examples are narrow terminology applications, not real risk acceptance or purchasing recommendations.',
 '[Current NIST IR8286A revision page](https://csrc.nist.gov/pubs/ir/8286/a/r1/final) identifies the December2025 revision as superseding the2021 report. The older PDF was found withdrawn and is not treated as current authority. The numerical results here are independently recomputed from source assumptions; model validity, real probability/frequency estimates and loss distributions are not claimed. The current revision page and PDF front matter were retrievable, but focused searches in the detailed PDF failed; unseen contents are not used as formula authority.',
 '## Preserved holds and release boundary',
 'All12 objective5.4 holds, including m379 purpose wording and m393 portability scope, are inherited exactly; all13 objective4.5 and final11/first18 objective4.6 held feedback dispositions remain. All earlier4.8/4.3/4.1/3.3/3.2/3.1/2.5/2.4/2.3/2.2/actor/supplier/crypto/PKI/PFS/channel/Unicode/PBQ grammar/grading/delivery/targeting holds, m305 whole scope,m046 precise contrast,m432 whole numbered scope, older42 source bindings, recovery boundaries and KEV/BOD26-04 current-policy uncertainty remain protected. No prior hold is erased or approval transferred.',
 'Private p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, unavailable/unreviewed with null trusted identity. Its explanation is also unavailable. No private fetch, payload export or local substitute. Review exports contain no stems, offered choices, keys, option-indexed grading fields or learner records.',
 'Active package unchanged: **1878 records/435 identities/2954 review decisions/489 unresolved mappings/seven existing primary proposals**, SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All25 protected release hashes remain. Thirty-six unsupported local PBQ grammars, private semantics, remaining feedback/support coverage, owner metadata decisions, substantive holds, taxonomy and calibration still block readiness.',
 '**NOT READY.** Local/default-off/unwired/learner-invisible. No runtime, active package, canonical role/scope/skill/difficulty, teaching/weight, learner evidence, shadow write, live write, publication, migration, cohort, deployment, activation or Phase3 change.',
 '## Validation and delivery',
 'Run node '+scriptPath+' and npm run audit:content-mapping. Focused verification rebuilds/matches the frozen ledger; reconciles all62 prior packets/current rows,16 reused parents,16 full feedback bundles,48 corrections,three snapshot/capture replays,16 shuffles,six arithmetic probes,141 census rows,83 residuals and exact private/local denominators. **'+negativeMutationChecks+' rejected mutations** cover stale/trusted substitutions, false question credit, invented pilot roles, recovery/clean-point/MTTR holds, fake capture/replay metadata, correction inflation, inherited/current hold erasure, ambiguity clearance, incorrect units/time basis, duplicates, support overcount, forbidden exports, private substitution and activation.',
 'All29 mapping tests and deterministic package reproduction, all25 protected checksums and git diff --check are required before an exact three-file **[skip deploy]** commit/push. Delivery requires local HEAD=origin/main=remote refs/heads/main. The configured Vercel ignoreCommand skip marker is verified. A source push does not establish deployment; unrelated dirty/generated files remain unstaged, and browser/live/private delivery remains unchecked.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE52_RISK_MCQS_NOT_READY',candidateIds:ids,newQuestionDispositions:0,reassessedExistingQuestions:16,newFeedbackDispositions:16,bankProgress,objective52:packet.objective52Denominator,unchangedObjective54:packet.unchangedObjective54Progress,snapshotReplays:3,wrongCorrections:48,changedWrongCorrections:44,unchangedWrongCorrections:4,shuffleProbes:16,arithmeticProbes:6,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
