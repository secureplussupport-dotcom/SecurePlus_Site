import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
const packetPath='docs/drafts/phase-2b5-pilot-resource-draft-8.json',reportPath='docs/phase-2b5-pilot-resource-draft-8-review.md';
const read=f=>JSON.parse(readFileSync(f)),hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex'),p=read(packetPath);
assert.equal(hash(packetPath),'2729569a27dd8890d6d5a0fdabc1bd7335ddcdc5f318cff40cfcf4e4ca410b52');
for(const [f,h] of Object.entries(p.sourceBindings))assert.equal(hash(f),h,f+' comparison drift');
assert.equal(p.baselineCommit,'06d180005063de0cd4bb9da6487a57524bb56859');assert.equal(p.status,'LOCAL_RTO_RESOURCE_DRAFT_MTD_CEILING_NOT_READY');assert.equal(p.newQuestions,1);
for(const k of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(p[k],false);for(const k of ['newFamilyCredit','eligibleEvidence'])assert.equal(p[k],0);
const bank=readLearningPilotBank(),all=[...bank.mcqs,...bank.pbqs],matrix=read('docs/drafts/phase-2b5-contextual-recovery-dispositions.json'),b1=read('docs/drafts/phase-2b5-pilot-batch-1.json'),b4=read('docs/drafts/phase-2b5-pilot-batch-4.json');assert.equal(all.length,483);assert.equal(contentSignature(bank),p.bankSignature);
const screen=new RegExp(p.discovery.screenPattern,'i'),selected=all.filter(q=>screen.test(JSON.stringify(q))).map(q=>q.id).sort();assert.deepEqual(p.discovery.screenIds,selected);assert.equal(selected.length,133);assert.equal(contentSignature(selected),'sha256:81cd72eea2b485eeb33c7bca2140c4211f1b260837bca4c6147ceee5359f7c35');assert.equal(p.discovery.screenSignature,contentSignature(selected));
assert.deepEqual(p.discovery.fullyInspected.map(r=>r.id),['m022','m023','m032','m076','m086','m088','m091','m169','m173','m177','m188','m196','m203','m244','m374','m425','m604','m627','m635','m645','m731','p004','p025','p026','p048','p060','p211']);for(const r of p.discovery.fullyInspected){assert(selected.includes(r.id));assert.equal(r.sourceRevision,contentSignature(all.find(q=>q.id===r.id)));}
const inventory=matrix.pilotGapMatrix.flatMap(m=>[...m.effectiveDirect,...m.offlineDrafts].map(q=>({id:q.id,sourceRevision:q.sourceRevision,concept:m.conceptId,family:q.familyLabel,assessedDecision:q.assessedDecision})));
assert.equal(inventory.length,26);assert.deepEqual(p.discovery.pilotComparisons.map(({comparison,...r})=>r),inventory);for(const r of p.discovery.pilotComparisons)assert(r.comparison.length>60);
assert.deepEqual(p.discovery.worksheetRowsCompared,matrix.pilotGapMatrix.flatMap(m=>m.offlineWorksheetRows.map(q=>({id:q.id,family:q.familyLabel,reusesDraft:q.reusesDraft,sourceRevision:q.sourceRevision,independentFamilyCredit:0}))));assert.equal(p.discovery.worksheetRowsCompared.length,6);
assert.equal(p.questions.length,1);const q=p.questions[0];assert.equal(p.questionRevisions[q.id],contentSignature(q));assert.equal(p.questionRevisions[q.id],'sha256:dba2f8da1eb56a200d0626255ad4f5a304de54e745c823b63a0edf85482b5a48');
function validateQuestion(item){
 assert.equal(item.id,'draft.pilot8.rto.01');assert.equal(item.primaryConceptProposal,'recovery.rto');assert.deepEqual(item.secondaryConceptProposals,[]);assert.deepEqual(item.objectiveCodes,['5.2']);assert.equal(item.objectiveScope,'explicit_bia_bullet');assert.deepEqual(item.contextObjectiveCodes,['3.4']);assert.equal(item.format,'mcq');assert.equal(item.difficulty,'hard');assert.equal(item.difficultyStatus,'proposed_uncalibrated');assert.equal(item.cognitiveSkill,'scenario_application');
 for(const k of ['familyIndependenceApproved','humanApproved','published','activationAllowed'])assert.equal(item[k],false);for(const k of ['newFamilyCredit','masteryWeight'])assert.equal(item[k],0);assert.equal(item.editorialStatus,'codex_reviewed_under_delegation');assert(item.reviewer.includes('not personal human review'));assert.equal(item.scenarioFamilyProposal,'exclusive-recovery-resource-deadline-feasibility');assert.equal(item.familyRelation,'proposed_distinct_reasoning_pending_independent_gate');assert.deepEqual(item.sourceRefs,['sy0701-objectives','nist-800-34']);
 assert.deepEqual(item.testModel,{outageMinute:0,exclusiveResourceCount:1,preemptionAllowed:false,parallelAllowed:false,jobs:[{id:'dispatch',durationMinutes:25,rtoMinutes:30},{id:'invoicing',durationMinutes:20,rtoMinutes:40}]});
 for(const text of ['same instant','30-minute RTO','40-minute RTO','from that outage','validated and usable','25 minutes for dispatch and 20 minutes for invoicing','including all validation','available immediately','only one job at a time','cannot overlap or be interrupted','no dependencies on each other','no acceptable alternative','targets remain fixed'])assert(item.stem.includes(text),'Missing recovery assumption '+text);
 assert.equal(item.options.length,4);assert.equal(new Set(item.options).size,4);assert.equal(item.correctOption,2);assert.equal(item.optionFeedback.length,4);assert(item.optionFeedback.every(s=>s.length>90));assert.match(item.options[2],/^Neither serial order meets both RTOs/);assert.match(item.optionFeedback[0],/25 \+ 20 = 45.*40-minute/);assert.match(item.optionFeedback[1],/20 \+ 25 = 45.*30-minute/);assert.match(item.optionFeedback[3],/cannot run.*concurrently/);
 const orders=[item.testModel.jobs,[...item.testModel.jobs].reverse()].map(jobs=>{let elapsed=0;return jobs.map(job=>({service:job.id,completionMinute:elapsed+=job.durationMinutes,rtoMinute:job.rtoMinutes,met:elapsed<=job.rtoMinutes}));});
 assert.deepEqual(orders.map(o=>o.map(j=>j.completionMinute)),[[25,45],[20,45]]);assert.deepEqual(orders.map(o=>o.map(j=>j.met)),[[true,false],[true,false]]);assert(orders.every(order=>order.some(j=>!j.met)));assert(item.testModel.jobs.every(j=>j.durationMinutes<=j.rtoMinutes));return orders;
}
const orders=validateQuestion(q);for(const patch of [{correctOption:0},{stem:q.stem.replace('only one job at a time','two concurrent jobs')},{testModel:{...q.testModel,jobs:[{...q.testModel.jobs[0],durationMinutes:15},q.testModel.jobs[1]]}},{scenarioFamilyProposal:'serial-recovery-dependency-budget'},{masteryWeight:1},{newFamilyCredit:1},{familyIndependenceApproved:true},{published:true},{humanApproved:true},{secondaryConceptProposals:['recovery.mtd']}])assert.throws(()=>validateQuestion({...q,...patch}));
assert.deepEqual(q.comparisonIds,inventory.map(r=>r.id).concat(['p048','p026','p211']));
assert.match(b1.questions.find(q=>q.id==='draft.pilot1.rto.02').familyRationale,/critical-path budgeting/);assert.match(all.find(q=>q.id==='p048').scenario,/one restoration at a time/);assert.match(all.find(q=>q.id==='p211').explanation,/Test recovery controls against RTO and RPO/);
assert.deepEqual(p.rejectedIdeas.map(r=>r.id),['rto-parallel-join-budget','rto-reset-clock-at-dr-declaration','mtd-residual-reprocessing-budget','mtd-fixed-cutoff-calendar-window','mtd-insurance-or-budget-exception']);assert.equal(p.rejectedIdeas.filter(r=>r.concept==='recovery.mtd').length,3);for(const r of p.rejectedIdeas){assert(r.disposition.startsWith('reject_'));assert(r.reason.length>100);assert(r.comparisonIds.every(id=>inventory.some(r=>r.id===id)||all.some(q=>q.id===id)||p.discovery.worksheetRowsCompared.some(r=>r.id===id)));}
assert.equal(p.remainingLimits.acceptedNewMtdDrafts,0);assert.equal(p.remainingLimits.approvedNewIndependentFamilies,0);assert.equal(p.remainingLimits.rtoStickyRelapseDeficitInUnchangedRehearsal,3);assert.equal(p.remainingLimits.mtdStickyRelapseDeficitInUnchangedRehearsal,3);for(const k of ['projectionUpdated','psychometricIndependenceVerified','calibratedDifficulty'])assert.equal(p.remainingLimits[k],false);assert.equal(p.remainingLimits.notReady,true);assert.deepEqual(p.remainingLimits.privateBoundary,matrix.privateBoundary);
// ponytail: normalized lexical overlap is a copy screen, never a semantic family verdict.
const text=q=>[q.stem,q.q,q.title,q.scenario,q.question,q.diagram,q.logData,...(q.options??q.opts??q.choices??[])].filter(x=>typeof x==='string').join(' ');
function grams(s){const words=s.toLowerCase().replace(/\d+(?:\.\d+)?/g,'number').match(/[a-z]+/g)??[];return new Set(words.slice(0,-2).map((_,i)=>words.slice(i,i+3).join(' ')));}
const proposed=grams(text(q)),comparisons=[...all,...b1.questions,...b4.questions];
const overlap=comparisons.map(old=>{const oldGrams=grams(text(old)),intersection=[...proposed].filter(g=>oldGrams.has(g)).length;return {id:old.id,sourceRevision:contentSignature(old),score:Number((intersection/(proposed.size+oldGrams.size-intersection)).toFixed(6))};}).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,6);assert(overlap[0].score<0.25,'Potential copied wording needs manual review');assert.equal(comparisons.length,504);
const manifest=read('docs/evidence/phase-2b5/release-checksums.json');for(const [f,h] of Object.entries(manifest.files))assert.equal(hash(f),h,f+' active artifact changed');for(const root of ['src','api','server'])for(const f of readdirSync(root,{recursive:true}).filter(f=>/\.(jsx?|mjs)$/.test(f)))assert(!readFileSync(root+'/'+f,'utf8').includes('pilot-resource-draft-8'),'Runtime imported offline draft');
const sourceLinks=p.sources.map(s=>`[${s.title}](${s.url}), checked ${s.checkedOn}: ${s.locator}. ${s.accuracyUse}`).join('\n\n');
const report=`# Phase 2B-5 — RTO resource-feasibility draft and MTD discovery ceiling

Baseline \`06d180005063de0cd4bb9da6487a57524bb56859\`. **LOCAL_RTO_RESOURCE_DRAFT_MTD_CEILING_NOT_READY.** One original offline RTO MCQ; zero MTD drafts, zero new-family credit, zero mastery weight and zero eligible evidence. Codex review under the owner's prospective delegation, not personal human review. Independent monitor gate pending. No publication, active-bank/mapping/runtime/private/live changes. Master-plan requirements and Phase1 historical facts remain unchanged; no behavior conflict is introduced.

## Selection and complete comparison boundary

The exposure rehearsal identifies RTO/MTD sticky-relapse deficits of three provisional families each. That motivates discovery; it does not authorize numeric rewrites or prove a missing assessed decision. Compare the complete bound26-item pilot inventory (five effective direct MCQs,21 offline MCQs) and six worksheet rows, preserving exact revisions,24 family labels, prior owner decisions and later agent proposals. Worksheets reuse existing families and supply no novelty credit. The JSON contains one comparison for every pilot item. Broader candidates are considered below; this is not an exhaustive semantic-absence claim across private/live or all effective-bank content.

Run the explicit broad pattern over all483 effective local questions, including options/feedback; retain133 IDs (selection signature \`${p.discovery.screenSignature}\`). Read all133 stems/scenarios for triage and fully inspect the27 relevant/adjacent answer records listed in the packet: complete keys, wrong feedback, PBQ items/diagrams/logs and explanatory logic. Shared cryptographic keys, vulnerability priorities and incident ordering are contextual false positives; do not adopt pilot roles from those words. The relevant restoration set includes m032/m635/m088/m196/m086/m177 and p026/p048/p211, with SLA/capacity/governance/priority/containment controls checked as adjacent comparisons. Effective signatures and the inherited source file bindings reproduce this exact selection. Effective bank \`${p.bankSignature}\` and active mapping package remain unchanged.

## Proposed assessed decision and hard overlap review

Question \`${q.id}\` tests whether **two independent services' fixed recovery deadlines can both be met when their restoration jobs share one exclusive resource**. Individual job durations fit their own targets; checking both complete serial schedules reveals the capacity infeasibility. This is narrower than a generic recovery-time calculation and proposes family \`${q.scenarioFamilyProposal}\`. Hard/scenario_application is uncalibrated metadata: the load is integrating two service deadlines, waiting time and resource exclusivity, not difficult vocabulary or advanced scheduling theory. No scheduling algorithm or resource-purchase guarantee is taught.

The nearest collisions are substantial and disclosed:

- batch1 rto.02 already calls its fixed one-service serial dependency calculation critical-path budgeting. Merely changing it to parallel branches is rejected. This draft instead tests both orders for independently recoverable services with different targets and demonstrates that reordering cannot satisfy their joint plan.
- p048 explicitly permits one restoration at a time and orders supplied targets. It gives no restoration durations or completion feasibility. Its target-order answer is not proof that the resource can meet every RTO; this draft supplies the missing job durations and disproves that inference.
- batch1 bia.02 derives an enabling dependency's priority; here neither service enables the other. Batch4 bia.02 checks a workaround's workload shortfall and asks for owner impacts; here the accepted targets are fixed and no workaround/backlog-impact inference is made.
- batch1 mtd.03 adds system restoration and business reprocessing for one process; the new item sets no MTD or reprocessing budget. p026 verifies the stipulated activation/validation sequence, and p211 chooses a combined RTO/RPO/retention design; neither checks both schedules against shared restore-resource capacity.

These distinctions support an **agent-proposed editorial decision**, not empirically independent evidence. A broader recovery-budget/priority family could subsume this item. The independent gate may merge or reject it; all independence approval and family-credit flags stay false/zero. No exposure projection is updated or shortage reduced by this draft. The unchanged RTO/MTD sticky-relapse deficits remain3/3.

## Complete local MCQ

${q.stem}

${q.options.map((s,i)=>`${i+1}. ${s}`).join('\n')}

**Key: option3 (zero-based2).** ${q.explanation}

| Option | Feedback |
| --- | --- |
${q.optionFeedback.map((s,i)=>`| ${i+1} | ${s} |`).join('\n')}

The model fixes one immediately available appliance, no overlap/preemption, independent services, no acceptable alternative and validation inside each duration. Both RTO clocks start at the same outage and accepted targets remain fixed. Dispatch-first completion25/45 fails invoicing40; invoicing-first20/45 fails dispatch30. Both independent durations25≤30 and20≤40 fit, so checking them individually is inadequate. Exactly two permitted orders exist, neither meets both. No absent startup/validation/network time, changed clock or universal recovery guarantee is assumed. Revising capacity/durations requires a new validated plan; the question does not prescribe a purchase or approve a target waiver.

## Rejected RTO/MTD ideas and ceiling

| Idea | Disposition and comparison |
| --- | --- |
${p.rejectedIdeas.map(r=>`| ${r.id} | ${r.reason} Compare ${r.comparisonIds.join(', ')}. |`).join('\n')}

No accepted MTD decision survives this bounded pass. Its residual-time arithmetic and calendar-limit reading are variants of existing assessed decisions; insurance/exception framing mainly assesses existing risk/governance/BIA reasoning. MTD stays supporting context, not a newly explicit syllabus bullet. This ceiling is preferable to inflating a deficit with generic variants. It does not establish that no useful MTD question can ever be authored; any later candidate must add a specific defensible decision and survive these full comparisons.

## Authoritative scope and accuracy

${sourceLinks}

Objective5.2 explicitly includes BIA/RTO. Objective3.4 includes recovery testing and resource-capacity context. The proposed resource-feasibility inference is ours, grounded in the stipulated scenario; no official objective reassignment or official exam question is claimed. MTD is not a separately named objective5.2 bullet. NIST is a dated background guide, not a claim about current organizational law or mandatory time limits. All job values and operational constraints are fictional explicit question facts.

## Reproducible check, exact bindings and remaining gate

Run \`node scripts/audit-pilot-resource-draft-8.mjs\`. It pins source bytes and draft revision, reproduces133 candidate IDs and27 inspected revisions, binds all26 pilot comparisons and six worksheet rows, evaluates both job orders from the explicit test model, and checks the stem/key/feedback against those assumptions. Adversarial mutations reject altered timing, parallelism, key, family, secondary attribution, independence, evidence or publication flags. The normalized three-word copy screen covers483 bank +21 pilot draft questions (504 comparisons); it replaces numeric literals before overlap calculation. Its top matches below are lexical signals only, not semantic independence evidence; explicit manual comparisons above determine the authoring proposal.

| Copy-screen item | Jaccard score | Source revision |
| --- | --- | --- |
${overlap.map(r=>`| ${r.id} | ${r.score} | \`${r.sourceRevision}\` |`).join('\n')}

Packet SHA-256 \`${hash(packetPath)}\`; item revision \`${p.questionRevisions[q.id]}\`. Source bindings include the approved master/Phase1 audit, complete pilot matrix, prior draft/worksheet/owner files, rehearsal, existing helper/runtime files and active release manifest. All25 active release hashes remain unchanged. Private p017 remains \`${p.remainingLimits.privateBoundary.selectedSourceRevision}\`, payload unavailable and trustedRevisionId=null, no refreshed read/fallback substitution. Current canonical/role/scope/difficulty/teaching decisions, qualification, family calibration and rollout remain open. **NOT READY.** Commit/push only packet/report/check with [skip deploy]; preserve unrelated changes.
`;
if(process.argv.includes('--write-report'))writeFileSync(reportPath,report);else assert.equal(readFileSync(reportPath,'utf8'),report,'Report drift');
console.log(JSON.stringify({status:'PASS_LOCAL_RTO_RESOURCE_DRAFT_MTD_CEILING_NOT_READY',packetSha256:hash(packetPath),reportSha256:hash(reportPath),auditSha256:hash('scripts/audit-pilot-resource-draft-8.mjs'),itemRevision:p.questionRevisions[q.id],newQuestions:1,newMtdQuestions:0,newFamilyCredit:0,eligibleEvidence:0,screened:133,fullyInspected:27,pilotComparisons:26,copyComparisons:504,maximumLexicalOverlap:overlap[0].score,orders,activeFilesUnchanged:Object.keys(manifest.files).length}));
