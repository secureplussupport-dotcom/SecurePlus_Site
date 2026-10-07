# Phase 2B-5 — RTO resource-feasibility draft and MTD discovery ceiling

Baseline `06d180005063de0cd4bb9da6487a57524bb56859`. **LOCAL_RTO_RESOURCE_DRAFT_MTD_CEILING_NOT_READY.** One original offline RTO MCQ; zero MTD drafts, zero new-family credit, zero mastery weight and zero eligible evidence. Codex review under the owner's prospective delegation, not personal human review. Independent monitor gate pending. No publication, active-bank/mapping/runtime/private/live changes. Master-plan requirements and Phase1 historical facts remain unchanged; no behavior conflict is introduced.

## Selection and complete comparison boundary

The exposure rehearsal identifies RTO/MTD sticky-relapse deficits of three provisional families each. That motivates discovery; it does not authorize numeric rewrites or prove a missing assessed decision. Compare the complete bound26-item pilot inventory (five effective direct MCQs,21 offline MCQs) and six worksheet rows, preserving exact revisions,24 family labels, prior owner decisions and later agent proposals. Worksheets reuse existing families and supply no novelty credit. The JSON contains one comparison for every pilot item. Broader candidates are considered below; this is not an exhaustive semantic-absence claim across private/live or all effective-bank content.

Run the explicit broad pattern over all483 effective local questions, including options/feedback; retain133 IDs (selection signature `sha256:81cd72eea2b485eeb33c7bca2140c4211f1b260837bca4c6147ceee5359f7c35`). Read all133 stems/scenarios for triage and fully inspect the27 relevant/adjacent answer records listed in the packet: complete keys, wrong feedback, PBQ items/diagrams/logs and explanatory logic. Shared cryptographic keys, vulnerability priorities and incident ordering are contextual false positives; do not adopt pilot roles from those words. The relevant restoration set includes m032/m635/m088/m196/m086/m177 and p026/p048/p211, with SLA/capacity/governance/priority/containment controls checked as adjacent comparisons. Effective signatures and the inherited source file bindings reproduce this exact selection. Effective bank `sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391` and active mapping package remain unchanged.

## Proposed assessed decision and hard overlap review

Question `draft.pilot8.rto.01` tests whether **two independent services' fixed recovery deadlines can both be met when their restoration jobs share one exclusive resource**. Individual job durations fit their own targets; checking both complete serial schedules reveals the capacity infeasibility. This is narrower than a generic recovery-time calculation and proposes family `exclusive-recovery-resource-deadline-feasibility`. Hard/scenario_application is uncalibrated metadata: the load is integrating two service deadlines, waiting time and resource exclusivity, not difficult vocabulary or advanced scheduling theory. No scheduling algorithm or resource-purchase guarantee is taught.

The nearest collisions are substantial and disclosed:

- batch1 rto.02 already calls its fixed one-service serial dependency calculation critical-path budgeting. Merely changing it to parallel branches is rejected. This draft instead tests both orders for independently recoverable services with different targets and demonstrates that reordering cannot satisfy their joint plan.
- p048 explicitly permits one restoration at a time and orders supplied targets. It gives no restoration durations or completion feasibility. Its target-order answer is not proof that the resource can meet every RTO; this draft supplies the missing job durations and disproves that inference.
- batch1 bia.02 derives an enabling dependency's priority; here neither service enables the other. Batch4 bia.02 checks a workaround's workload shortfall and asks for owner impacts; here the accepted targets are fixed and no workaround/backlog-impact inference is made.
- batch1 mtd.03 adds system restoration and business reprocessing for one process; the new item sets no MTD or reprocessing budget. p026 verifies the stipulated activation/validation sequence, and p211 chooses a combined RTO/RPO/retention design; neither checks both schedules against shared restore-resource capacity.

These distinctions support an **agent-proposed editorial decision**, not empirically independent evidence. A broader recovery-budget/priority family could subsume this item. The independent gate may merge or reject it; all independence approval and family-credit flags stay false/zero. No exposure projection is updated or shortage reduced by this draft. The unchanged RTO/MTD sticky-relapse deficits remain3/3.

## Complete local MCQ

In a site-outage recovery exercise, dispatch and invoicing fail at the same instant. Dispatch has a 30-minute RTO; invoicing has a 40-minute RTO. Both clocks run from that outage until each service is validated and usable. Tested restore jobs take 25 minutes for dispatch and 20 minutes for invoicing, including all validation. Both jobs require the same restore appliance, which is available immediately but can run only one job at a time. Jobs cannot overlap or be interrupted; the services have no dependencies on each other and no acceptable alternative is available. The accepted targets remain fixed. Which assessment of the current recovery plan is correct?

1. Dispatch first meets both RTOs because each individual restore duration is below its service target.
2. Invoicing first meets both RTOs because completing the shorter job first removes dispatch waiting time.
3. Neither serial order meets both RTOs; revise and retest the recovery capacity or job durations.
4. Starting both jobs together meets both RTOs because their separate tested durations remain unchanged.

**Key: option3 (zero-based2).** Dispatch first finishes at 25 minutes, but invoicing then finishes at 45 and misses its 40-minute RTO. Invoicing first finishes at 20 minutes, but dispatch then finishes at 45 and misses its 30-minute RTO. Individually short jobs do not demonstrate that the shared resource can meet both outage-to-usable-service targets. Reordering alone cannot fix this plan; a changed capacity or duration must be validated against the fixed targets.

| Option | Feedback |
| --- | --- |
| 1 | Dispatch completes within 30 minutes, but invoicing waits for it and finishes at 25 + 20 = 45 minutes, later than its 40-minute target. |
| 2 | Invoicing completes in 20 minutes, but dispatch then finishes at 20 + 25 = 45 minutes, later than its 30-minute target. The shorter job does not eliminate waiting. |
| 3 | Correct: both permitted orders leave the second service late. Revise and retest the resource plan or durations; do not treat an approved target as proof that the current plan meets it. |
| 4 | The single appliance cannot run these jobs concurrently. Separate-job timings do not validate a parallel plan with a resource that is unavailable. |

The model fixes one immediately available appliance, no overlap/preemption, independent services, no acceptable alternative and validation inside each duration. Both RTO clocks start at the same outage and accepted targets remain fixed. Dispatch-first completion25/45 fails invoicing40; invoicing-first20/45 fails dispatch30. Both independent durations25≤30 and20≤40 fit, so checking them individually is inadequate. Exactly two permitted orders exist, neither meets both. No absent startup/validation/network time, changed clock or universal recovery guarantee is assumed. Revising capacity/durations requires a new validated plan; the question does not prescribe a purchase or approve a target waiver.

## Rejected RTO/MTD ideas and ceiling

| Idea | Disposition and comparison |
| --- | --- |
| rto-parallel-join-budget | The approved serial draft already expressly frames its reasoning as critical-path budgeting. Replacing addition with a branch maximum alone does not establish a new independent assessed decision; do not relabel scheduling arithmetic to fill the exposure deficit. Compare draft.pilot1.rto.02, p026. |
| rto-reset-clock-at-dr-declaration | Existing end-to-end dependency budgeting and measurement-boundary questions already require the specified start/end contract. New names and a declaration delay are insufficient novelty. Compare draft.pilot1.rto.02, draft.pilot1.mttr.03, p026. |
| mtd-residual-reprocessing-budget | Reverses the same technical-recovery-plus-business-reprocessing inequality. Arithmetic direction is not a new family. Compare draft.pilot1.mtd.03, draft.pilot2.pbq.01:mtd. |
| mtd-fixed-cutoff-calendar-window | Reads the same outer business limit or earliest accepted impact constraint using clock notation. Does not introduce a genuinely different understanding beyond existing limit-reading/constraint families. Compare m196, draft.pilot1.mtd.01, draft.pilot4.mtd.01. |
| mtd-insurance-or-budget-exception | The answer turns on risk transfer/exception governance and impact reassessment, already represented; it would not provide clean new direct MTD evidence. MTD remains supporting BIA context, not a separate named exam bullet. Compare m188, m374, m604, m731, draft.pilot1.mtd.02, draft.pilot1.bia.03. |

No accepted MTD decision survives this bounded pass. Its residual-time arithmetic and calendar-limit reading are variants of existing assessed decisions; insurance/exception framing mainly assesses existing risk/governance/BIA reasoning. MTD stays supporting context, not a newly explicit syllabus bullet. This ceiling is preferable to inflating a deficit with generic variants. It does not establish that no useful MTD question can ever be authored; any later candidate must add a specific defensible decision and survive these full comparisons.

## Authoritative scope and accuracy

[CompTIA Security+ SY0-701 Exam Objectives, Version 5.0](https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf), checked 2026-10-07: PDF page14: objective5.2 BIA/RTO; page9: objective3.4 capacity planning and recovery testing. RTO is an explicit BIA bullet. Shared-resource recovery feasibility is our scenario application of that target with capacity context, not an official question or objective reassignment. MTD is not an explicit named bullet.

[NIST SP800-34 Rev.1, Contingency Planning Guide for Federal Information Systems](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf), checked 2026-10-07: Printed pages17-20: sections3.2.1-3.2.3 and3.4.1; PDF pages31-34. Background guidance links restoration targets, resources, priorities and recovery strategies. The one-appliance nonpreemptive job model and durations are explicit hypothetical facts, not a claimed NIST scheduling prescription or federal requirement.

Objective5.2 explicitly includes BIA/RTO. Objective3.4 includes recovery testing and resource-capacity context. The proposed resource-feasibility inference is ours, grounded in the stipulated scenario; no official objective reassignment or official exam question is claimed. MTD is not a separately named objective5.2 bullet. NIST is a dated background guide, not a claim about current organizational law or mandatory time limits. All job values and operational constraints are fictional explicit question facts.

## Reproducible check, exact bindings and remaining gate

Run `node scripts/audit-pilot-resource-draft-8.mjs`. It pins source bytes and draft revision, reproduces133 candidate IDs and27 inspected revisions, binds all26 pilot comparisons and six worksheet rows, evaluates both job orders from the explicit test model, and checks the stem/key/feedback against those assumptions. Adversarial mutations reject altered timing, parallelism, key, family, secondary attribution, independence, evidence or publication flags. The normalized three-word copy screen covers483 bank +21 pilot draft questions (504 comparisons); it replaces numeric literals before overlap calculation. Its top matches below are lexical signals only, not semantic independence evidence; explicit manual comparisons above determine the authoring proposal.

| Copy-screen item | Jaccard score | Source revision |
| --- | --- | --- |
| draft.pilot1.rto.02 | 0.0125 | `sha256:44d18f20dfc792c96ecb837abb87e42bce9ec7fa3e0cb37e1b0e73938ad4ca51` |
| draft.pilot1.mttr.02 | 0.008368 | `sha256:6b8679aa2003b8d4d2b0cbb3efcfb73690ba3ee5ec6b193dc83abe323b5e8670` |
| draft.pilot1.rto.03 | 0.008264 | `sha256:db8a7a5ae700c89cd4c7cff82de19a62f744d292e8e52bdc39c758d79df04f1c` |
| draft.pilot4.rpo.01 | 0.00823 | `sha256:0bb25eecfea655b2e031ba7f1c74a6b0cb276aeff92478e9ad55d430a2283ad6` |
| draft.pilot1.rpo.03 | 0.007752 | `sha256:34a7642f2690c7365f268645017ea09679e39ef82209d69fa4e2f57326304027` |
| draft.pilot1.mttr.01 | 0.004975 | `sha256:d3c914af3e5a18c71bef0ba80515f7ddf4ef7990fb28c1f563506774ab0ed629` |

Packet SHA-256 `2729569a27dd8890d6d5a0fdabc1bd7335ddcdc5f318cff40cfcf4e4ca410b52`; item revision `sha256:dba2f8da1eb56a200d0626255ad4f5a304de54e745c823b63a0edf85482b5a48`. Source bindings include the approved master/Phase1 audit, complete pilot matrix, prior draft/worksheet/owner files, rehearsal, existing helper/runtime files and active release manifest. All25 active release hashes remain unchanged. Private p017 remains `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, payload unavailable and trustedRevisionId=null, no refreshed read/fallback substitution. Current canonical/role/scope/difficulty/teaching decisions, qualification, family calibration and rollout remain open. **NOT READY.** Commit/push only packet/report/check with [skip deploy]; preserve unrelated changes.
