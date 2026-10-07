# Phase 2B-5 — six original pilot MCQ drafts

7 October 2026, Asia/Singapore. Baseline `08b77cd10f618a06dc8e05baa6f6da8344a0258c`. **Offline author review complete; independent editorial gate pending. Phase 2B-5 remains incomplete and production NOT READY.**

This bounded slice adds six original MCQs: one MTD, two MTTR, two BIA and one RPO. Four proposed medium and two proposed hard questions; all difficulty/skill and concept/scope metadata remain proposals. No additional RTO variant was needed for this slice: recovery-path arithmetic and service/data separation already have drafts. The master plan remains the approved product specification; the Phase 1 audit supplies implementation history. No unresolved product conflict was found or behavior changed.

## Exact review binding and authority

- [Batch 4](drafts/phase-2b5-pilot-batch-4.json): `7be45316dda58c45685e06c9d2062a58b6dfda6b56b898d7050ff2b28412714e`.
- Unchanged active mapping package: `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`.
- Effective local bank: `sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391`, 395 MCQs / 88 PBQs.
- Prior MCQ batch: `91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda`.
- Prior worksheet designs: `94adaf1c9ca90370636bc3c8c20a6e51156964a4f1871905d23a88cbe9d5ae02`.
- Prior teaching drafts: `84757c5c7bec067e5baee182487525f3f843aa9e709af257b307be0c1655a921`.
- Bounded objective 5.2 mapping proposals: `de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c`.

The [standing human delegation record](drafts/phase-2b5-pilot-batch-1-family-decision.md) binds human message `01a113bf-b3d5-7e12-bb2a-e0c3c2ddc701` in chat `01a0ec5b-7f84-71f1-920b-7b0cd42850d2`, turn `01a113bf-b154-7c83-96b0-1023ff85e229`: “you dont need my approval for the next questions or family tags anymore. just execute.” This permits prospective local authoring and family classification. These six are **Codex-reviewed under that delegation**, not exact questions personally human-reviewed. It does not approve current canonical identities/roles, historical pending metadata, publication or live activation. Original approval snapshots remain unchanged.

## Reasoning and family comparison

Reviewed the effective local bank, all fifteen prior MCQs, both worksheets and their six rows, and all three teaching drafts. Re-read all local recovery/backup/impact candidates, including m032, m086, m088, m177, m196, m635, p026, p048 and p211. Private p003/p017 content remains unavailable; no comparison against unseen payloads is claimed. Comparing a teaching example does not make it an assessment family.

| Draft suffix | Key / reasoning | Closest existing reasoning and proposed distinction | Proposed skill / difficulty |
| --- | --- | --- | --- |
| mtd.01 | C: min(3,8,10) = 3 hours | m196 / batch 1 mtd.01 read one outer limit. Reconcile several accepted impact constraints for the same process and clock. Not a new timestamp on the single-limit item. | Application / medium |
| mttr.01 | B: 20-minute completed-repair mean; separately disclose the ongoing 240-minute case | Batch 1 mttr.02 has a completed outlier; mttr.03 changes boundaries. This case concerns a valid subset mean and an unfinished observation with no known endpoint. | Evidence evaluation / hard |
| mttr.02 | D: 10×30 = 300; 30×15 = 450 minutes | Batch 1 mean, tail and clock questions do not compare totals across changing counts. Both clocks stay comparable; lower mean can coexist with more recorded interruption. | Interpretation / medium |
| bia.01 | A: count the same $8,000 process loss once; retain both dependencies | m086 names BIA; batch 1 gathers inputs, prioritizes dependencies or refreshes scope. Reconcile overlapping loss reports without confusing resource count with distinct consequences. Not an ALE/SLE formula question. | Application / medium |
| bia.02 | C: 50−20 = 30 orders left after one hour | Batch 1 mtd.02 stipulates an accepted effective workaround; bia.03 changes scope. Test measured workaround capacity against a fixed accepted workload. Related theme explicitly retained for scrutiny. | Application / medium |
| rpo.01 | B: contiguous reconstruction reaches 12:20; 25-minute window exceeds 15-minute RPO | m177 has backup-chain knowledge; batch 1 rpo.01 supplies the point and rpo.03 excludes corrupt copies. Derive the point by following a chain before evaluating the window. Related recoverability theme retained for scrutiny. | Calculation / hard |

**Counts:** six original questions, six author-classified distinct-family proposals, zero explicitly reused families in this packet. **Zero independently gated new families and zero eligible evidence** at this record. New labels alone do not confer independence. The independent monitor may merge or reject a proposal, especially workaround-capacity and log-chain reasoning. No psychometric independence or demonstrated learner transfer is claimed. Earlier fourteen exact owner family decisions are neither changed nor extended to these bytes.

## Separate adversarial author pass

After initial drafting, performed a separate author pass against the comparison set, keys, clocks, alternatives and family rationales. This is a second pass by the implementation agent, **not an independent reviewer**; the monitor's gate must assess the final hash separately.

- Corrected the unfinished-time/divisor distractor in mttr.01 from 80 to **100**: (60+240)/3 = 100. The correct completed-repair mean stays 20; 75 is the other error, treating the unfinished observation as completed and dividing by four.
- Challenged whether the open case makes the displayed mean wrong. It does not under the stated dashboard definition. The unsupported conclusion about *all four* is wrong. Feedback states both points and leaves final duration unknown.
- Tested overlap/containment assumptions in mttr.02. The stem requires no overlapping outages, complete containment and no other downtime before summing repair durations. No causal rollout claim or future failure forecast survives.
- Tested the two BIA items for unrelated arithmetic. Each asks whether a process-impact assessment is defensible, with verified duplicated consequences or a measured alternative below the accepted workload. No asset price, attack frequency, invented tolerance or revenue forecast substitutes for the stated impact evidence.
- Tested RPO ambiguity: the chain rule, missing interval, valid earlier blocks, absence of another path, date and timezone are explicit. Later timestamps cannot bypass this stipulated rule. The 25-minute window is potentially unrecoverable data time, not proof that transactions populated every minute.
- Tested MTD clock/category ambiguity: one process, one outage-to-acceptable-operation clock, every owner-accepted limit mandatory, no workaround. The minimum satisfies all three; maximum, mean and finance-only responses each violate the earliest limit.
- Did not retain weaker additional candidates: another weighted-average MTTR item would reuse the average family; another serial recovery budget would reuse existing reasoning. No novelty credit for rejected ideas.

All six retained questions have four options and individual feedback for every choice. Distractors represent specific errors: using the largest/mean impact limit, mixing ongoing elapsed time with completed observations, ignoring changing repair counts, double-counting the same loss, confusing completed volume with backlog, or treating the latest log timestamp as reconstructible. Each is wrong under explicit scenario facts; no vendor behavior or external business rule is left unstated. Their plausibility and proposed difficulty still require independent editorial review and learner calibration.

## Factual and syllabus checks

[CompTIA's official SY0-701 objectives, v5.0](https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf), PDF page 14, explicitly list BIA, RTO, RPO and mean time to repair under objective 5.2. **MTD is supporting BIA/continuity context, not an explicit new syllabus bullet.** The acronym list also expands MTTR as recover; both MTTR drafts define their failure-to-verified-business-usability clock and do not silently substitute respond, technician-start or server-boot clocks.

[NIST SP 800-34 Rev. 1](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf), sections 3.2.1–3.2.3, printed pages 16–19, supports process-owner input, time-dependent impacts, dependencies, viable alternatives, business tolerance and recoverable data points. The minimum-constraint, duplicate-loss and capacity conclusions are inferences from our explicitly supplied hypothetical facts. Section 5.1.2, printed pages 44–45, explains restoration using required backup components; it is supporting context, **not a specification of a universal database-log protocol**. The log tool's no-gap rule is stated in the question itself.

[IBM's MTTR explanation](https://www.ibm.com/think/topics/mttr) and [MTTR/MTBF comparison](https://www.ibm.com/think/topics/mttr-vs-mtbf) support total repair duration divided by repair count and comparable clock definitions. Recomputed our own arithmetic; did not adopt the inconsistent worked-example final sentence noted in the first packet. Completed-only dashboard selection is a scenario-defined contract; separate disclosure of an open case and the total-versus-mean distinction follow from those facts, not a claimed universal reporting policy.

## Validation and remaining gate

Run `node scripts/audit-pilot-batch-4.mjs`; `--write` refreshes only its [deterministic validation record](evidence/phase-2b5/pilot-batch-4-validation.json). The audit pins comparison hashes, keys/feedback, numerical premises and answers, log continuity, negative approval/schema cases, MTD scope, zero weights, no active mappings/imports, and all 25 unchanged release-manifest files. It screens each draft against all 483 effective questions, 15 earlier MCQs, six worksheet rows, three teaching drafts and five sibling questions with number-normalized token Jaccard, threshold 0.65. A numeric-only rewrite fixture scores 1. This lexical screen cannot approve semantic independence; top matches include exact comparison revisions.

Passed before push: dedicated audit/write-and-reproduce, original pilot-draft audit, all 29 content-mapping tests plus byte reproduction, learning-pilot replay/validation audit, whitespace and Vercel `[skip deploy]` check. These isolated offline additions do not claim a new browser/build, runtime/database rehearsal or production inspection.

All drafts are zero-weight, unpublished and learner-invisible. Active mappings, package/queue counts, current bank, canonical tags, runtime, private source decisions and previous packets remain unchanged. Independent gate, canonical/scope decisions, component compiler/adapters, teaching publication, coverage budgets and calibration remain outstanding. Commit/push uses `[skip deploy]`. **NOT READY** for publication, deployment, migration, adaptive activation, shadow writes or cohorts.
