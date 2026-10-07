# Phase 2B-5 — bounded objective 3.4 assessment review

7 October 2026. Baseline `3fada82e998ade0c1a33b6385bace618aa92325c`. **Three effective local assessments reviewed; local proposals only. Phase 2B-5 and production remain NOT READY.**

The selection is every effective local MCQ/PBQ whose current objective metadata equals 3.4: m177, p026 and p211. Read each complete stem/scenario/diagram, options or ordering items, key and all feedback. This is completeness for that current metadata selection, not all semantically relevant bank questions, private/live revisions or the entire objective blueprint. Published-snapshot/editorial/feedback precedence comes from the existing effective-bank reader; raw authored questions are not used as substitutes. The master plan remains the approved specification and the Phase 1 audit the historical implementation evidence.

## Exact versions

- [Semantic proposal JSON](drafts/phase-2b5-objective34-semantic-proposals.json): SHA-256 `ceb33e92b12cde3c0a2c19f6d089f7b88f6cacf3263c86efc491f8b5b88cdaa2`.
- Unchanged active mapping package: `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`.
- Effective local bank: `sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391`, 395 MCQs / 88 PBQs.
- Existing objective 5.2 proposal: `de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c`.
- Existing unit-scope packet: `18d9b7fc2114672c02d14eeeff23db5a36a2f5528b36c005262be50fdf9f09fb`.
- Pending owner packet: `01f96e9c4edff2ef61d25c296fb96c585ad1a00db0709f47c0d261b7fbb5d953`; unchanged, no boxes checked.

The JSON also pins canonical-definition/current-mapping source files and earlier draft batches. Each question stores its local semantic revision separately from its captured published-record revision. Source-record ordering metadata can change the latter without changing the former; neither replaces a trusted compiler ID.

| Question | Exact local semantic revision | Captured published-record revision |
| --- | --- | --- |
| m177 | `sha256:2e89d8324231ae6f8409c567e81ab5fcf483d7cf26de2d03f674dd9a8a174f8b` | `sha256:130c3e1866be5e83816ebcc844897f19faf0fe5e449b2b1a78f455377caf1c5e` |
| p026 | `sha256:330dec138ad30780f639184c307ffa4f842c337a9c0d41ee4d66e1c935e12a7d` | `sha256:11ece8d248047097c1f2896fc3af53cb047ab1bb8d0c5b518f39d859e2b174c0` |
| p211 | `sha256:bf0a42cc62da920122329a6253d9aaff8fd5f9a35038153d581650e132be81c3` | `sha256:62894e03c5f39c75b69713ef7c7ad5205ce73da9f42097744f159636f8758f91` |

## Semantic roles and conservative families

| Exact assessment | Required reasoning | Proposed role / family |
| --- | --- | --- |
| m177, observed easy MCQ | Identify changed-since-full differential backup semantics and full-plus-latest-differential restore set; distinguish incremental/full/snapshot | Primary=null, secondary=[]; **unresolved mastery identity**. Family label `differential-backup-restore-set-identification` describes this existing question only. No RTO/RPO role: no elapsed restoration target or data-loss-window comparison is required. |
| p026, observed medium ORDERING PBQ | After life safety is already addressed, order impact assessment, authorized activation, restore, validation, planned cutover and retrospective under the supplied dependencies | Primary=null, secondary=[]; support context `sy0701.term.bcp` / `sy0701.term.drp` only. Family label `authorized-recovery-validation-before-cutover-sequence`. No BIA analysis or per-metric result is isolated. |
| p211, observed medium SCENARIO PBQ | Choose one complete recovery/retention design satisfying service return, 15-minute data-loss bound and protection against early administrative alteration/deletion | Primary=null, secondary=[]; RTO/RPO support links only. Preserve `combined-recovery-and-retention-design`, already used in the existing pilot/objective-5.2 proposal. Retention reasoning remains unresolved; no per-component success is manufactured. |

The taxonomy contains only five existing **pending-human mastery identities**. Its objective nodes are topics, and generated term nodes are **pending supporting concepts**, not approved new mastery identities. m177's precise backup understanding has no suitable existing mastery identity; naming its objective or noticing a backup term cannot fill that gap. p026's BCP/DRP links use existing support nodes without promoting them or adopting their broad inherited codes. No new canonical ID is invented.

**WORM collision:** `sy0701.term.worm` is named “Worm,” with malware scope 2.4/4.1. It is not write-once/read-many storage. p211 needs immutable retention reasoning; mapping it to that node would be wrong despite the shared case-insensitive spelling/slug. Reject that link and keep the storage identity unresolved. This is a recorded taxonomy blocker, not a code fix or a new retention concept. p211's existing coarse RTO-primary/RPO-secondary labels stay untouched; this support-only proposal agrees with the separately pending role correction in the objective-5.2 packet.

Distribution remains **one easy MCQ, two medium PBQs, zero hard assessments** in this selection. Three descriptive reasoning labels cover three existing questions; two newly assigned labels describe previously unclassified items, while p211 reuses its existing label. **Zero new questions, zero independently approved new families, zero eligible evidence.** Different formats or settings alone cannot create novelty.

Compared m177 with m088 and earlier RPO timeline/corruption/log-chain drafts: identifying a backup type differs from choosing a recoverable point or testing a loss bound, but no psychometric independence is claimed. Compared p026 with p048's supplied-priority sorting and the serial-RTO runbook draft: their recovery/ordering themes overlap; retain conservative whole-response families rather than splitting steps into independent successes. p211 retains its existing mixed-design family rather than creating a second family because it is reviewed under 3.4.

The runnable lexical screen compares against all 483 effective questions, 21 prior MCQ drafts and six worksheet rows, excluding the same question. It normalizes numbers and reports the top three candidates; a number-only rewrite scores 1. Read the closest candidates, including m116/m045/m091 and p064, rather than treating shared words as duplicates. Hash/password/SLA identification and vulnerability-program ordering are different tasks from backup identification and the stated recovery sequence. Scores remain only a screen: no whole-bank semantic-independence or unavailable-private-content claim.

## Grammar, private boundary and teaching dependencies

All three exact local grammars compile without runtime changes and match captured trusted IDs: m177 `e6fc50f8-f1dc-8a1e-84d6-01100ba73a36`; p026 `183cc013-d5f5-8e33-9bfb-5e70f07262f3`; p211 `b6ef4a30-8fa1-8d38-ab20-eded240d827a`. Compilation does not approve content, mappings or ingestion. Both PBQs remain **coarse**. Ordering-item labels and whole-choice options are compiler components, not separately attributable concept outcomes; component evidence and every proposal's weight stay zero. No unsupported local grammar was found among these three; wider component adapters remain outside this slice.

Private p017 remains separately bound to `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, with payload unavailable, primary=null, secondary=[], trusted revision=null and no fresh source read. Its local fallback cannot substitute for the selected private bytes or prove their grammar. No private record was added to the three-question local selection.

Ten exact source-bound teaching dependencies are proposed, all zero-weight and browser-unobserved:

- The three questions' own explanation bundles: useful post-answer feedback, not fresh practice or additional families. p026's individual explanations are conditional feedback, not per-concept grading.
- BCP/DRP cards and glossary definitions: four definition units that explain plan purpose; they do not alone teach a defensible activation/validation/cutover runbook. Glossary definitions require actual tooltip opening.
- `section:forensics-recovery:2`: distinguishes journal/snapshot/replica/backup and their failure domains; it does not explicitly teach differential restore sets or administrator-resistant WORM enforcement.
- `section:resilience-assets-physical:1`: clarifies RTO/RPO/MTTR/MTBF; supports recovery requirements without supplying retention implementation or isolated PBQ evidence.
- m088's explanation bundle: retained versions and replication/deletion support, already bound as T11 in the scope packet. No new scope approval or standalone differential-backup lesson is implied.

Read each actual dependency text and pin its exact source revision in JSON. Their objective-scope proposals remain null in this dependency list; the separate current-unit scope packet keeps its own proposed values unchanged. Available text is not evidence of actual reading, accessible delivery or learner mastery. No whole lesson/deck is linked merely because of its title.

## Gaps where future drafts could matter

For this tagged selection, there is only a definition/restore-set MCQ and no independently attributable recovery PBQ component evidence. A different backup filename or timeline would not solve transfer coverage. Future planning should prioritize an isolated, defensible failure-domain/recoverability decision or recovery-test interpretation; compare it against m088 and the earlier corruption/log-chain/availability families before calling it new. A workflow-teaching gap exists beyond BCP/DRP definitions, and protected-retention teaching/identity remains unresolved.

Capacity planning, platform diversity/multi-cloud shared dependencies, recovery-testing methods and power continuity have no direct assessment **inside this three-question selection**. They are candidate draft areas only: first review cross-objective questions before declaring a bank-wide gap or commissioning variants. Single-concept MCQs or explicitly graded components could isolate understanding; existing mixed PBQ success cannot supply it. No draft is commissioned or authored by this census, and no shortage budget is declared satisfied.

[Official SY0-701 objectives v5.0](https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf), checked 7 October 2026, place continuity, sites, testing, backups, capacity, diversity and power under 3.4 (PDF page 9). The detailed role/gap judgments above are inferences from our inspected local selection, not claims that the objectives approve a canonical identity or dictate one universal failover order. p211's retention requirement is scenario context, not a new explicitly named 3.4 WORM bullet. No scope relocation is adopted.

## Checks and verdict

Run `node scripts/audit-objective34-semantic.mjs`. It verifies the complete three-question selection, exact local/published/compiler identities, observed metadata, p211 reuse, taxonomy-node kinds, the malware/storage collision, ten teaching hashes, separate private p017 boundary, zero flags/weights, runtime non-import and 25 unchanged release files. Negative cases reject RPO/topic promotion on m177, BIA secondary credit on p026, malware Worm on p211, positive PBQ weight and stale local revision. Lexical candidates are printed deterministically.

Passed: dedicated audit/reproduction, existing objective-5.2 mapping and owner-packet audits, all 29 content-mapping tests and byte reproduction, staged whitespace and Vercel `[skip deploy]` check. No new browser, build, database rehearsal, live catalogue refresh or deployment is claimed for these isolated proposal files.

**NOT READY.** Canonical granularity/roles and current scope/difficulty decisions, independent semantics, private processing, teaching adoption, component attribution, wider coverage/calibration and separately authorized rollout remain open. Active package counts stay 1,878 records / 435 taxonomy nodes / 2,954 queue rows; bank, mappings, runtime, owner decisions, publication and learner flows remain unchanged. Commit/push is task-only with `[skip deploy]`; no live action is authorized.
