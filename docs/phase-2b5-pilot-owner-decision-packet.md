# Current pilot mapping decisions — plain-English owner packet

7 October 2026. Baseline `25aa73629cbd56a3b0b3be895f64dd65d65d7ed4`. **Prepared for presentation in “Vet Security+ SY0-701 questions”; no decision requested in the implementation chat. All choices remain pending. Phase 2B-5 is NOT READY.**

A tag is a label for one understanding, such as “how soon service must return.” A primary tag names what a question actually checks. A secondary tag is another understanding independently required to solve it; a term appearing in a distractor is insufficient. A support link connects an explanation or lesson to that understanding. Reading support gives no mastery credit.

## What any choice authorizes

Every blank box below is a proposed default, not consent. An authenticated owner reply choosing an ID and the exact hashes authorizes **only a separate local record of that editorial decision after verifying the bytes**. It does not edit the source snapshot or adopt the decision into active mappings. Keep, revise and reject are separate explicit choices; unchecked lines stay pending. For a grouped set on one decision axis, the owner may name only specific question IDs, concepts or teaching rows; omitted members stay pending. Nothing implies approval of another axis.

**None of these publish/activate anything.** No bank change, deployment, learner delivery, mastery evidence, graph-weight approval, migration, production/shadow write or cohort enrollment follows from checking a box. Any later integration must be separately authorized and validated. Agent-written checkmarks, silence, elapsed time and passing checks are not approval.

The owner's prospective delegation permits future local question/content/family decisions. It does **not** approve these current canonical identities, concept roles, difficulty/skills or scope. Batch 1 content and fourteen family judgments were approved separately; mtd.01 still shares m196's family with zero novelty. Those completed decisions are not being resubmitted. Batch 4's independent offline gate likewise does not approve these current metadata choices. New draft batches, wider taxonomy, private payloads and publication are outside this packet.

## Exact source versions

A SHA-256 is a fingerprint of a file. Changing even one byte changes it; the reply must refer to the reviewed version. “P” below means the mapping proposal packet; “A” the active package; “B1” the first draft batch. Every choice binds this full source table, including C for canonical definitions and M for current pilot labels. Local semantic revision hashes and captured published-record hashes remain distinct inside P.

| Source | Exact file | SHA-256 |
| --- | --- | --- |
| P | [phase-2b5-objective52-pilot-mapping-proposals.json](drafts/phase-2b5-objective52-pilot-mapping-proposals.json) | `de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c` |
| A | [mapping-package.json](evidence/phase-2b5/mapping-package.json) | `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97` |
| B1 | [phase-2b5-pilot-batch-1.json](drafts/phase-2b5-pilot-batch-1.json) | `91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda` |
| C | [learningConcepts.js](../src/data/learningConcepts.js) | `90dfc8eda4cd0c5231fc7e35e66516e818bfc6720331eef6c0125f340c9085ac` |
| M | [learningMappings.js](../src/data/learningMappings.js) | `ff0ce6342b951dde794cc5ca3bb8d37122fa3037f6dad9fe942fe88961689c7d` |
| B1 choices | [phase-2b5-pilot-batch-1-review.md](drafts/phase-2b5-pilot-batch-1-review.md) | `fd63463a94aeb4879ec3fe0983a835d9fd99ba2bc482acf1e9a5b03aaf18c91e` |
| P review | [phase-2b5-objective52-pilot-mapping-review.md](phase-2b5-objective52-pilot-mapping-review.md) | `e92e52e2e4a282aabcbbe8fc9856c5eca9f0264cbe00fc189591712de02e8934` |
| Delegation | [phase-2b5-pilot-batch-1-family-decision.md](drafts/phase-2b5-pilot-batch-1-family-decision.md) | `f52a03d0c01659b282346b4d0a9056e493427564350ed7bb633e206c1df4d0dd` |
| Approved plan | [secureplus-rebrand-master-plan.md](secureplus-rebrand-master-plan.md) | `2a5c20f1a1584b4117a0b44f6446db04e265a34cf1870910d5cd8be00752e19c` |
| Implementation audit | [phase-1-product-loop-audit.md](phase-1-product-loop-audit.md) | `5d1a2ad1180e96d428e8b77f97841b1eb2c11659235c8450ba40d80ba78b5c10` |

## C-IDENTITY/ROLE — separate names, question roles and metadata

These names would let a future approved learning system distinguish five skills. Each C-ID choice approves only the exact ID, name, description and alias in C; its objective codes, organization labels, relationships and weights are **not** included.

- [ ] **C-ID-RTO** — Keep `recovery.rto`, Recovery Time Objective: the target time to restore acceptable service. Example: a usable checkout restored after 45 minutes misses a 30-minute target. Authorizes recording that identity/definition only.
- [ ] **C-ID-RPO** — Keep `recovery.rpo`, Recovery Point Objective: acceptable recent-data loss expressed as a time window. Example: failure at 09:20 with a usable point at 08:55 leaves a 25-minute window. Authorizes recording that identity/definition only.
- [ ] **C-ID-MTD** — Keep `recovery.mtd`, Maximum Tolerable Downtime: outer business-interruption limit before unacceptable harm. Example: technical recovery plus required reconciliation lasts 6.5 hours against a six-hour limit. Authorizes recording that identity/definition only.
- [ ] **C-ID-MTTR** — Keep `recovery.mttr`, Mean Time to Repair / Recover: observed average repair/recovery time using comparable boundaries. Example: completed repairs of 20, 30 and 40 minutes average 30; it is not a restoration deadline. Authorizes recording that identity/definition only.
- [ ] **C-ID-BIA** — Keep `continuity.bia`, Business Impact Analysis: identify critical functions and disruption impacts to inform recovery planning. Example: an identity service matters because fulfillment depends on it, even without direct revenue. Authorizes recording that identity/definition only.

- [ ] **C-ROLE** — Keep the five direct MCQ primary tags in the table below, with no secondary or support tags. Authorizes recording only those exact revision-bound question roles; a future review could target the named skill after a miss. A role approval does not approve a difficulty, scope, family or weight.
- [ ] **C-CURRENT-D** — Keep the existing difficulty values shown below as editorial labels, still uncalibrated. Authorizes recording difficulty only; “medium” does not establish measured exam difficulty.
- [ ] **C-CURRENT-SKILL** — Keep the five exact cognitive-skill labels in M shown below. Authorizes recording reasoning labels only; e.g. “identification” means recognizing the right metric/document. P's prose skill descriptions explain these judgments, not new replacement enum values.

| Exact current MCQ | Primary proposal / no secondary | Difficulty default | Skill default in M | Learner meaning |
| --- | --- | --- | --- | --- |
| m032 | `recovery.rto` | easy | interpretation | Read the service-return requirement. |
| m635 | `recovery.rto` | easy | identification | Recognize a service-return target. |
| m088 | `recovery.rpo` | medium | scenario_application | Choose backup cadence under the stated tested-recovery assumptions. |
| m196 | `recovery.mtd` | medium | distinction | Separate business tolerance from technical targets. |
| m086 | `continuity.bia` | medium | identification | Recognize the business-impact analysis document. |

- [ ] **C-CURRENT-SCOPE** — Keep those five MCQs as objective 5.2 / domain `sy0701.domain-5` / chapter `sy0701.objective-5.2` / topic `business-continuity-metrics`, with m032/m635/m088/m086 explicit BIA-bullet scope and m196 **supporting context, not an explicit MTD exam bullet**. Authorizes recording only that question placement/scope. Example: MTD may clarify BIA without advertising an additional named exam objective.
- [ ] **C-CANONICAL-SCOPE** — Keep C's concept placement: RTO/RPO objective codes `[5.2,3.4]`; MTD/MTTR/BIA `[5.2]`; all five domain `sy0701.domain-5`, chapter `sy0701.objective-5.2`, topic `business-continuity-metrics`. MTD remains supporting context. Authorizes recording those exact concept organization/scope labels only. The retained objective-5.2 chapter groups this pilot; it does not reassign objective-3.4 question p211 to domain 5. No graph-edge approval follows.

This expands old **C-IDENTITY/ROLE** into independent axes. There is no direct MTTR bank MCQ to approve here; future draft content cannot substitute for a current revision. Current family independence is outside these role choices.

## C-COARSE — whole-answer PBQs stay contextual

A whole simulation answer may mix several skills, so it cannot show which one was understood. These choices approve P's proposed future support-only role correction as an editorial decision, while leaving M's existing coarse labels untouched until separately authorized integration. They do not approve inherited PBQ scope/difficulty or produce component evidence.

- [ ] **C-COARSE-P048** — Record p048 as context links to `recovery.rto` and `continuity.bia`, with primary=null, secondary=[], zero evidence. Example: sorting supplied recovery priorities does not prove that the learner independently understands RTO or BIA.
- [ ] **C-COARSE-P211** — Record p211 as context links to `recovery.rto` and `recovery.rpo`, with primary=null, secondary=[], zero evidence. Example: one recovery/retention design choice cannot isolate service timing from data recovery or retention reasoning. Its observed objective remains 3.4, not reassigned here.

## C-TEACHING — links, exclusion and scope are separate

Teaching rows T01–T19 below identify P's `instructionalProposals` array in its exact current order. Their parent/subunit hashes in P bind the text; a keyword row approves only that term's definition, not the complete guide. Conditional glossary support means a tooltip actually opens, not merely that a term appears somewhere.

- [ ] **C-TEACHING-LINKS** — Record the eighteen non-withheld rows' exact concept links and support roles below. Authorizes local support-link approval only, no objective-scope approval or mastery credit. Example: an RTO explanation could help explain a miss; reading it would not count as a fresh correct answer. To split, name T-row IDs.
- [ ] **C-TEACHING-WITHHOLD** — Record T06 `glossary:mttr` as withheld with no concept links until its repair/respond definition boundary is resolved and the revised text is rebound. Authorizes that exclusion judgment only; does not approve or repair the definition. Example: responding to an incident is not necessarily restoring usable service.
- [ ] **C-TEACHING-SCOPE-HOLD** — Keep `objectiveCodesProposal=null` for all nineteen units. Authorizes recording a **hold**, not approved scope or a completed scope gate. Their inherited deck/lesson objectives remain observations. There is no exact unit-scope proposal to approve in P. Any chosen replacement scope needs a separate revision-bound proposal; link approval must not silently adopt broad parent scope.

| Row | Exact unit locator in P | Concept links | Support role |
| --- | --- | --- | --- |
| T01 | `flashcard:sy0701-acronym-risk-governance-business-rto-recovery-time-objective` | `recovery.rto` | `definition_support` |
| T02 | `glossary:rto` | `recovery.rto` | `conditional_definition_support` |
| T03 | `flashcard:sy0701-acronym-risk-governance-business-rpo-recovery-point-objective` | `recovery.rpo` | `definition_support` |
| T04 | `glossary:rpo` | `recovery.rpo` | `conditional_definition_support` |
| T05 | `flashcard:sy0701-acronym-risk-governance-business-mttr-mean-time-to-repair-recover` | `recovery.mttr` | `definition_support` |
| T06 | `glossary:mttr` | none | `withhold_pending_definition_boundary` |
| T07 | `flashcard:sy0701-acronym-risk-governance-business-bia-business-impact-analysis` | `continuity.bia` | `definition_support` |
| T08 | `glossary:bia` | `continuity.bia` | `conditional_definition_support` |
| T09 | `explanation:mcq:m032` | `recovery.rto` | `post_answer_support` |
| T10 | `explanation:mcq:m086` | `continuity.bia` | `post_answer_support` |
| T11 | `explanation:mcq:m088` | `recovery.rpo` | `post_answer_support` |
| T12 | `explanation:mcq:m196` | `recovery.mtd` | `post_answer_support` |
| T13 | `explanation:mcq:m635` | `recovery.rto` | `post_answer_support` |
| T14 | `section:resilience-assets-physical:1` | `recovery.rto`, `recovery.rpo`, `recovery.mttr` | `metric_contrast_support` |
| T15 | `keywords:risk-resilience-governance / RTO` | `recovery.rto` | `exact_keyword_definition_support` |
| T16 | `keywords:risk-resilience-governance / RPO` | `recovery.rpo` | `exact_keyword_definition_support` |
| T17 | `keywords:resilience-assets-physical / RTO` | `recovery.rto` | `exact_keyword_definition_support` |
| T18 | `keywords:resilience-assets-physical / RPO` | `recovery.rpo` | `exact_keyword_definition_support` |
| T19 | `keywords:forensics-recovery / RPO` | `recovery.rpo` | `exact_keyword_definition_support` |

The recovery table T14 links only RTO/RPO/MTTR: it has no MTD row, and a BIA alias does not teach BIA. No new dedicated MTD/BIA draft teaching is included in these current-link decisions.

## C-BATCH1 — unchanged twelve choices, independently selectable

Only batch 1 is covered here; short IDs below start `draft.pilot1.`. The owner already approved question content and family decisions. A T choice records primary roles with empty secondary lists. A D choice records the exact difficulty/skill pair for the specified three drafts, not measured performance; each member/pair can be split explicitly. S choices record syllabus placement only. None approves canonical identities or publishes the drafts.

- [ ] **T-RTO** — Keep rto.01, rto.02, rto.03 primary=`recovery.rto`, secondary=[]. Authorizes recording only those concept roles; learner meaning is the matching C-ID example above.
- [ ] **T-RPO** — Keep rpo.01, rpo.02, rpo.03 primary=`recovery.rpo`, secondary=[]. Authorizes recording only those concept roles; learner meaning is the matching C-ID example above.
- [ ] **T-MTD** — Keep mtd.01, mtd.02, mtd.03 primary=`recovery.mtd`, secondary=[]. Authorizes recording only those concept roles; learner meaning is the matching C-ID example above.
- [ ] **T-MTTR** — Keep mttr.01, mttr.02, mttr.03 primary=`recovery.mttr`, secondary=[]. Authorizes recording only those concept roles; learner meaning is the matching C-ID example above.
- [ ] **T-BIA** — Keep bia.01, bia.02, bia.03 primary=`continuity.bia`, secondary=[]. Authorizes recording only those concept roles; learner meaning is the matching C-ID example above.

- [ ] **D-RTO** — Keep rto.01 medium/interpretation, rto.02 medium/calculation, rto.03 hard/evidence_evaluation. Authorizes recording these proposed difficulty/skill pairs only.
- [ ] **D-RPO** — Keep rpo.01 easy/interpretation, rpo.02 medium/scenario_application, rpo.03 hard/evidence_evaluation. Authorizes recording these proposed difficulty/skill pairs only.
- [ ] **D-MTD** — Keep mtd.01 easy/interpretation, mtd.02 medium/scenario_application, mtd.03 hard/calculation. Authorizes recording these proposed difficulty/skill pairs only.
- [ ] **D-MTTR** — Keep mttr.01 easy/calculation, mttr.02 medium/interpretation, mttr.03 hard/evidence_evaluation. Authorizes recording these proposed difficulty/skill pairs only.
- [ ] **D-BIA** — Keep bia.01 easy/scenario_application, bia.02 medium/scenario_application, bia.03 hard/evidence_evaluation. Authorizes recording these proposed difficulty/skill pairs only.

Skill meanings: interpretation = explain supplied facts; calculation = work out a value; scenario_application = apply a concept; evidence_evaluation = judge what evidence supports. Example: adding required recovery steps is calculation; checking whether an availability claim establishes an outage bound is evidence evaluation. “Hard” denotes proposed reasoning demand, not proven exam difficulty.

- [ ] **S-COMMON** — Keep all fifteen as MCQs under objective 5.2 / domain `sy0701.domain-5` / chapter `sy0701.objective-5.2` / topic `business-continuity-metrics`. RTO/RPO/MTTR/BIA use explicit BIA-bullet scope. Authorizes only those organization/format/scope labels; MTD's supporting classification is separate below.
- [ ] **S-MTD** — Keep mtd.01–03 as supporting continuity context under objective 5.2, without claiming MTD is an explicitly listed exam bullet. Authorizes that supporting classification only; it does not approve their primary tags or difficulty.

## Reply binding for the monitoring chat

This is a review artifact, not a request to approve in the implementation chat. The monitor can present the exact packet and its SHA-256. Any later human response must identify this packet hash plus P/A/B1 (and C/M for canonical/current-label choices), chosen IDs, keep/revise/reject, and any exact affected records. An explicit natural-language decision with clear scope also counts; an agent-created checked document does not. A revised proposal must be reviewed at its new hash; do not transfer approval silently to changed bytes.

Example **format only, no consent expressed**: “Packet SHA: …; P: …; A: …; B1: …; C: …; M: …; decision C-ROLE; choice revise; affected m196; requested primary … / secondary …; reason …”. This packet intentionally contains no checked boxes and no approval parser or integration system.

## Checks and remaining blockers

Run `node scripts/audit-pilot-owner-decisions.mjs`. It verifies this source table against exact current files, complete 27-choice IDs, blank boxes, batch-1 label agreement, nineteen exact teaching locators, the null-scope hold, zero approvals/weights in source proposals and unchanged active release files. Passed: this packet check, its four adversarial document cases, the existing mapping-slice audit and original pilot-draft audit. Source hashes bind this translation to their reviewed snapshots; all 25 active release files remain identical. Whitespace and the Vercel skip marker were also checked before push. Commit only this packet and its minimal audit with `[skip deploy]`.

Still open: actual authenticated current metadata decisions; nineteen teaching-unit scope proposals/approval; ambiguous MTTR glossary definition; wider canonical taxonomy and relationships; private selected payload processing; trusted compiler/adapters and PBQ component evidence; publication/coverage budgets; learner calibration and separate rollout authorization. Approving any or all eligible decisions here does not make Phase 2B-5 or production ready. **NOT READY; no live changes.**
