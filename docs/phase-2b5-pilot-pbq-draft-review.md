# Phase 2B-5 — component PBQ draft slice

7 October 2026, Asia/Singapore. Baseline `e5cc39f7eeacdc083cc8900a1ec6835cb5532762`. **LOCAL DESIGN ONLY; Phase 2B-5 remains NOT READY.**

The master plan remains the approved product specification, and the Phase 1 audit supplies historical implementation facts. The next bounded change addresses the pilot's missing component-level PBQ assessment designs. It does not finish Phase 2B-5 or begin Phase 3.

## Authority and exact inputs

The owner's prospective question/family delegation is recorded in [the source-attributed family decision](drafts/phase-2b5-pilot-batch-1-family-decision.md), human message `01a113bf-b3d5-7e12-bb2a-e0c3c2ddc701`. This slice is **Codex author-reviewed under that delegation**, not personally reviewed by the owner. Independent adversarial editorial review remains open; automated checks do not replace it. No new human question/family checklist is requested.

- Prior fifteen-question batch SHA-256: `91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda`.
- Active mapping package SHA-256: `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`.
- Effective bank: 395 MCQs / 88 PBQs, canonical signature `sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391`.
- New [full worksheet designs](drafts/phase-2b5-pilot-pbq-draft-2.json): exact bytes and script/report hashes are bound in [validation evidence](evidence/phase-2b5/pilot-pbq-draft-validation.json).

The existing p048/p211 mappings are coarse, with zero per-concept evidence. Batch 1 supplies only MCQ drafts. More wording/number variants would not address either the PBQ format gap or genuine independent-family shortages. This slice proposes two recovery worksheets with six separately answerable rows covering the five pilot concepts, and conservatively reuses existing draft families.

## Content, keys and scope

Every row has four choices, one best answer, and feedback for every choice. The full scenario and all answer text are in the draft JSON; indices below are zero-based. All difficulty labels are uncalibrated proposals. All secondary concept proposals are empty: context or a distractor alone creates no secondary evidence.

| Exercise / row | Primary concept | Proposed difficulty / skill | Key / author arithmetic review | Prior reasoning reused |
| --- | --- | --- | --- | --- |
| pbq.01 / rto | recovery.rto | medium / interpretation | 1; 10:00–10:50 = 50 minutes, exceeding 45 | pilot1.rto.01; recovery-exercise-time-versus-data |
| pbq.01 / rpo | recovery.rpo | easy / interpretation | 2; 09:50–10:00 = 10 minutes, within 15 | pilot1.rpo.01; recoverable-point-timeline |
| pbq.01 / mtd | recovery.mtd | medium / calculation | 0; 50 + 70 = 120 minutes, exceeding 110 by 10 | pilot1.mtd.03; technical-recovery-plus-business-reprocessing |
| pbq.02 / mttr | recovery.mttr | easy / calculation | 3; (20 + 40 + 60) / 3 = 40 minutes | pilot1.mttr.01; observed-repair-duration-average |
| pbq.02 / bia-input | continuity.bia | medium / scenario application | 0; obtain business-owner impacts and feasible alternatives | pilot1.bia.01; business-impact-input-elicitation |
| pbq.02 / bia-dependency | continuity.bia | medium / scenario application | 2; support the urgent dependent business function; no exact component budget invented | pilot1.bia.02; shared-dependency-recovery-priority |

IDs in the new batch start `draft.pilot2.`. Referenced prior IDs start `draft.pilot1.`. Proposed scope is domain 5 / objective 5.2, topic business-continuity-metrics. MTD remains supporting continuity context, not an explicitly named exam bullet. Existing canonical taxonomy choices and batch 1 metadata decisions are unchanged.

Author review checked each distractor against the stated assumptions. Exercise 1 explicitly fixes one day/time zone, the only tested usable recovery point, verified service availability, sequential reconciliation and absence of a workaround. Its data-loss window is not added to elapsed business interruption. Exercise 2 fixes a common measurement clock, known fulfillment dependency, distinct reporting needs and missing returns impacts. It supplies no exact identity budget or returns recovery target. No regulation, live service guarantee or universal identity-first rule is invented.

## Conservative adversarial family comparison

The attempt to fill repeated-lapse capacity with further MCQs would risk relabeling the same reasoning. The worksheet rows therefore explicitly retain the six prior family labels above and claim **zero new independent families**, even where the response format, scenario and numbers change. A PBQ wrapper does not make these fresh transfer evidence. Existing m032/m635 identification, m088 versioned backups, m196 outer-limit definition and m086 document identification remain separate bank comparisons; p048 ordering and p211 whole-choice designs are not replaced.

The BIA input and dependency rows reuse different existing draft reasoning, but occur in one parent exercise. They are correlated observations, not two independent successes. The RTO/MTD rows also share event facts. Future ingestion must preserve those dependencies; correctness in one row must not grant or remove evidence in another concept. All rows currently have zero mastery weight and zero eligible evidence.

The author comparison is not an independent reviewer pass. The standing monitor's separate editorial gate must check exact content, answer ambiguity, distractors, concept roles, scope, difficulty and family grouping. It may revise or reject weak rows. Any changed bytes require updated checksums and re-review. No human approval is needed for that delegated question/family work.

## References checked this slice

- [CompTIA SY0-701 objectives version 5.0](https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf), PDF page 14, objective 5.2; page 19 acronym list. BIA, RTO, RPO and MTTR are explicit; MTTR's repair/recover expansions differ, so the worksheet defines its clock instead of testing the expansion.
- [NIST SP 800-34 Rev. 1](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf), sections 3.2.1–3.2.3, printed pages 17–19 (PDF pages 31–33): service recovery versus recoverable-data age, total business interruption including required reprocessing, owner impact input and resource dependency planning. These are original hypothetical exercises, not quotations or copied exam material.
- [IBM MTTR](https://www.ibm.com/think/topics/mttr), repair-average formula; cross-checked with [IBM MTTR vs. MTBF](https://www.ibm.com/think/topics/mttr-vs-mtbf). Only the formula and consistent measurement boundary are used; authored values are independently recomputed. No inconsistent worked-example conclusion is adopted.

## Runnable contract and limits

Run `node scripts/audit-pilot-pbq-drafts.mjs`. `--write` deliberately refreshes only this slice's validation evidence.

The check rehearses the offline row-answer contract across all 128 complete choice combinations, partial/omitted answers and malformed inputs. Unanswered rows are not negative evidence. Same-parent BIA rows share an observation group. Incorrect answers cannot propagate to another row, and every result retains zero mastery weight. This rehearsal is contained in the audit, with no exported grader or runtime integration.

The existing trusted compiler is tested to reject the unsupported `parts` grammar. These are worksheet PBQ designs, not compiler-supported or deployed simulations. Later renderer, protected revision compilation, stable component identities, server-authoritative grading, attempt persistence and correlated-evidence policy need a separately tested integration. No trusted revision ID is assigned to these drafts.

The audit pins both prior input hashes and the effective-bank signature, checks all current release-manifest artifacts unchanged, and verifies that src/api/server import no draft. Number-normalized scenario-plus-row-prompt lexical comparisons cover the 483 local bank question stems and fifteen prior draft stems; their top results are recorded as a screening aid only. The explicit family comparison above controls the conservative grouping. Private p003/p017 payloads remain unavailable, so no duplicate/family completeness claim covers them.

Validation: dedicated PBQ draft contract passed; original MCQ draft audit passed; existing content mapping and learning runtime/pilot suites passed. Whitespace and deployment-skip checks passed. No new browser/build, database rehearsal or live verification is claimed for these isolated offline files.

## Remaining gates

This slice prepares content and an answer contract; active component-PBQ coverage remains zero. Independent review, trusted grammar/adapters, publication and activation gates remain open. MTD/BIA teaching gaps, repeated-lapse independent-family budgets, canonical metadata, wider bank mapping, private revision processing and calibration remain unresolved. The current twelve batch 1 metadata choices are not retrospectively owner-approved by this record.

The active bank, mappings, runtime, learner flows, production database and fifteen-minute automation are unchanged. No migration, deployment, shadow writes or live cohort is authorized. Commit/push is task-only with `[skip deploy]`.
