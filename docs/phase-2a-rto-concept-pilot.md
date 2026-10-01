# Phase 2A — local RTO concept-mastery pilot

Date: **1 October 2026, Asia/Singapore**. Starting commit: `829f2f6ef633e9127159221619e8943c218af7a2` on `main`.

The master plan and Phase 1 audit were read in full. Product decisions follow the master plan; current-state facts follow the audit, with the local content pipeline rechecked here. The Phase 2A brief explicitly limits this implementation to pure, local modules and synthetic replays. **No database, migration, entitlement, learner-visible UI, rewards, or production question-selection changes were made. Existing Smart Review remains unchanged.**

The pilot implements Diagnose → Understand → Strengthen → Prove as evidence → state/reasons → direct and supporting content → transfer/recall/proof tasks. It demonstrates deterministic rule behavior, not educational effectiveness. **All numeric mastery weights, counts, intervals and scheduling limits are provisional hypotheses, not scientifically validated thresholds.**

Important result: the effective local bank has two RTO identification questions in **one scenario family**. It cannot supply the independent post-miss scenarios needed for proof. The real-bank replay therefore reports `insufficient_variant_coverage`. Abstract synthetic fixtures exercise the later states without pretending to be real authored questions.

## 1. Implemented concept catalogue

`src/data/learningConcepts.js` defines five stable IDs. Every record includes a name, description, objectives, canonical domain, objective/chapter grouping, topic, aliases, editorial status and mapping version.

| Stable ID | Name / meaning | Relevant objectives |
|---|---|---|
| `recovery.rto` | Recovery Time Objective: targeted restoration time | 5.2; application in 3.4 |
| `recovery.rpo` | Recovery Point Objective: acceptable data-loss window | 5.2; application in 3.4 |
| `recovery.mtd` | Maximum Tolerable Downtime: outer business-interruption limit | 5.2 |
| `recovery.mttr` | Mean Time to Repair / Recover: observed average repair/recovery duration | 5.2 |
| `continuity.bia` | Business Impact Analysis: critical functions and disruption impacts informing recovery planning | 5.2 |

Canonical home: `sy0701.domain-5`; chapter/objective grouping: `sy0701.objective-5.2`; topic: `business-continuity-metrics`. A question can apply the same concept in another domain: p211 uses domain 3/objective 3.4. Concept IDs are independent of both domain and chapter numbering. This uses the master plan's objective-level grouping without redefining the application's existing five “chapters” or publishing a new competency percentage.

Versions:

- Mapping: `sy0701-concepts-v1`.
- Algorithm: `concept-mastery-v1`.
- Configuration: `rto-pilot-config-v1`.

Review status is honestly `agent_reviewed_pending_human`. The implementation agent inspected the effective local content; **human editorial approval has not occurred**. The local configuration permits this status for the prototype only. Human review and a production-specific approval gate remain prerequisites for learner-facing recommendations. Aliases are display/discovery metadata and never create evidence.

## 2. Implemented relationship graph

Twelve stored edges, each with source, target, type, direction, editorial weight, review status and mapping version:

| Relationship | Direction | Editorial weight |
|---|---|---:|
| RTO / RPO `commonly_confused_with` | Both ways | 1.0 |
| RTO / MTTR `contrasts_with` | Both ways | 0.9 |
| RTO / MTD `contrasts_with` | Both ways | 0.9 |
| BIA → each of RTO/RPO/MTD/MTTR `prerequisite_for` | Forward, four edges | 0.8 |
| Each recovery metric → business continuity metrics `part_of` | Forward, four edges | 0.5 |
| RPO / backup frequency `applied_with` | Both ways | 0.8 |

`continuity.metrics` is an explicit support-only topic node; `recovery.backup-frequency` is an explicit support-only concept node. Neither receives a mastery projection. They prevent dangling graph references without expanding the five-concept evidence scope.

The recommendation helper may traverse an incoming prerequisite to recommend BIA support for a recovery metric. Every related recommendation is labeled `supporting`, with `createsMasteryEvidence: false`. The calculator never uses graph edges or content keywords. Removing the graph yields identical mastery output. An RTO miss preserves both an untouched RPO state and a previously established RPO state in the audit.

## 3. Reviewed question mappings

`src/data/learningMappings.js` is an external mapping catalogue; it does not mutate the question bank. Each mapping contains the exact question ID, a committed SHA-256 signature of the complete effective local question, primary/secondary roles, objectives/domain/chapter/topic, format, cognitive skill, difficulty, scenario family, precision, review status and mapping version.

The audit rebuilds the local effective bank through authored/imported content, captured publication merges/disables, editorial retirement, legacy MCQ enhancement, editorial overlays, final MCQ feedback completion, and PBQ enhancement. It compares each committed signature against that result. Signatures are **not automatically updated** when content changes: a mismatch requires review. The search covers all 395 effective MCQs and 88 PBQs, not raw literals alone.

| Question | Primary | Secondary | Format / skill / difficulty | Scenario family and decision |
|---|---|---|---|---|
| m032 | RTO | None | MCQ / interpretation / easy | `restoration-target-identification` |
| m635 | RTO | None | MCQ / identification / easy | Same family as m032; changing four hours to six hours is not independent transfer |
| m088 | RPO | None | MCQ / application / medium | `versioned-backup-interval` |
| m196 | MTD | None | MCQ / distinction / medium | `outer-business-interruption-limit`; BIA is context, other metrics are distractors |
| m086 | BIA | None | MCQ / identification / medium | `critical-function-impact-document`; RTO/RPO appear in explanatory support |
| p211 | RTO, coarse context | RPO, coarse context | PBQ / application / medium | `combined-recovery-and-retention-design` |
| p048 | RTO, coarse context | None | PBQ / sequence / medium | `supplied-recovery-priority-ordering` |

p048 was the additional effective-bank match beyond the six required IDs. It orders hospital services using supplied BIA recovery targets. That task does not independently diagnose whether the learner understands BIA or distinguishes the recovery metrics.

**PBQ limitation:** p211 combines recovery time, recoverable data and WORM retention into one selected answer set. A whole-question result cannot locate the misunderstood requirement. p048's persisted attempt lacks item-level ordering evidence. Both retain their mappings and events as `coarse`; **neither correct nor incorrect coarse results change any individual concept state**. No WORM mistake is silently reclassified as an RTO mistake. A future reviewed component-grading contract is required before using these results more precisely.

No distractor/explanation-only concept was assigned secondary evidence. The local normalizer supports genuine direct secondary roles with a smaller evidence weight, tested using a clearly synthetic mapping.

Coverage boundary: this phase makes no remote requests. It uses the captured publication data in the repository. Phase 1's authenticated live observations remain dated evidence; this report does not claim to have refreshed live overrides or private PBQs. Future publication/runtime integration must resolve a question's final revision after live overlays as well.

## 4. Flashcard and Deep Dive mappings

Four existing standalone cards are mapped directly:

| Concept | Active card ID |
|---|---|
| RTO | `sy0701-acronym-risk-governance-business-rto-recovery-time-objective` |
| RPO | `sy0701-acronym-risk-governance-business-rpo-recovery-point-objective` |
| MTTR | `sy0701-acronym-risk-governance-business-mttr-mean-time-to-repair-recover` |
| BIA | `sy0701-acronym-risk-governance-business-bia-business-impact-analysis` |

One section mapping, `resilience-assets-physical:recovery-metrics`, identifies the existing lesson `resilience-assets-physical`, section index 1, title **Recovery metrics answer different questions**, rows RTO/RPO/MTTR. The audit checks the actual section title and row labels. This is a pilot locator, not a claim that the current UI implements a section URL anchor.

An RTO miss recommends its direct card and comparison section, plus RPO/MTTR support cards and the BIA prerequisite card. MTD support is named but has no mapped content; an empty content array is an explicit absence, not a fabricated resource. Graph grouping nodes also may have no content. No existing paid/free access is consulted or changed; the returned objects are local editorial recommendations, not launch authorization.

## 5. Missing scenario and learning-content coverage

- **RTO:** two easy identification questions, one family. After missing either, neither question is a fresh independent family. At least two additional independently reviewed families are needed for the provisional ordinary recovery path; sticky recovery needs three fresh families after its latest miss. More variants are needed to support repeated lapses without exhausting novelty.
- **RPO:** one direct application MCQ; no independent post-miss variant.
- **MTD:** one direct distinction MCQ; no explicit active MTD card or lesson section found.
- **MTTR:** no direct MCQ; only a card and comparison row.
- **BIA:** one identification MCQ and card; no dedicated BIA teaching section found in the active lesson bodies.
- p048/p211 are not substitutes for precise independent concept evidence.
- Existing lesson-generated checks are not automatically counted as independent scenarios or connected to mastery. Their exposure, answer reveal and limited UI display need separate review.

The replay file contains eight `fixture.rto.*` mapping records with abstract independent family labels. They have no authored stems or options and exist only inside the audit. They are never exported into the app or represented as active-bank coverage.

## 6. Evidence contract and state-transition rules

`normalizeLearningEvidence` accepts an in-memory array and an explicitly injected `now`. Answer events require stable event ID, kind, question ID/revision, boolean correctness, occurrence timestamp, and practice-set index. They may link an intervention. Normalization adds mapping-bound primary/secondary roles, family, difficulty, precision, provenance, classification and all three versions. Caller-supplied roles or freshness cannot override the mapping/history.

Completed-intervention events require a mapped content ID, target concept, source miss ID, occurrence time and set index. The source must be a preceding direct miss for that concept. Completion is an explicit synthetic fact in this phase, not inferred from opening a page or self-rating a card, and adds no positive mastery evidence.

Events sort by occurrence time, set index, then lexical event ID. Identical semantic event IDs deduplicate; conflicting duplicates fail. Versions, mapping review status, revisions, types, timestamps, chronology and intervention links are validated. Set indices must be monotonic in occurrence order. UTC/offset-qualified timestamps or epoch milliseconds are accepted; locale/zone-less dates and missing clocks fail. Future evidence is deferred until the injected clock reaches it.

Classification uses the whole replay history:

- Previously seen question ID, even at a new revision: `exact_repeat`.
- New question in a previously seen family: `same_scenario`.
- New question and new family: `fresh_scenario`.

This is conservative lifetime novelty, not merely “different from the last question.” It requires complete history; truncated or legacy history is not safe input for production proof.

### Provisional state rules

| State / transition | Rule | Principal reason code |
|---|---|---|
| `not_enough_evidence` | No direct evidence, or early correct-only evidence below the varied threshold | No invented initial transition |
| `learning_signal` | First/isolated miss | `first_or_isolated_miss` |
| `needs_attention` | Misses on two distinct questions, absent sticky criteria | `distinct_question_misses` |
| `sticky` | Miss after a completed linked-concept intervention, or three unresolved misses spanning at least two set-index increments | `miss_after_intervention`, `continued_misses_across_sets` |
| `improving` | Two fresh successful families after the latest miss; three if ever sticky | `multiple_fresh_successes`, `sticky_varied_recovery` |
| `proven` | An additional correct check after those fresh successes; at least two days since both the previous concept answer and latest fresh success, and a later set; four days if sticky | `varied_delayed_repair_resolves_contradictions` or `varied_success_and_delayed_check` |
| `mastered` | Another correct answer at least seven days after proof and the previous concept answer, and at least two sets after proof; fourteen days if sticky | `spaced_retention_after_proven` |
| Relapse | Miss after Proven/Mastered → Needs attention, or Sticky if sticky history exists; reset recovery/proof | `relapse_after_proven`, `relapse_after_mastered` |

Sticky proof additionally requires two separated successful observations with at least two days between counted observations. Sticky history persists across recovery and relapse. Every miss resets fresh recovery and spaced-success counters. Unresolved contradiction IDs remain visible through Improving; the required varied-plus-delayed repair explicitly resolves them at proof. A new miss opens a new contradiction and prevents promotion. Waiting without answering never promotes a state.

Exact recall and same-family successes never count toward the fresh threshold. An immediate exact retry records `exact_recall_cannot_establish_proof`; a second wording in the same family records `same_family_not_independent`. Delayed recall can provide the additional retention check **only after** enough independent successes. Rehearsing shortly before a supposed retention check postpones its eligibility.

Evidence levels are qualitative: `none`, `limited`, `varied`, `retained`, `spaced`. They describe the observed evidence, not a calibrated probability or exam-pass score. The numeric effective sample sum is diagnostic only: primary/secondary multipliers 1/0.5; easy/medium/hard 0.8/1/1.2; fresh/same-family/exact-success 1/0.4/0.15, delayed exact success 0.6. Misses retain full role/difficulty weight. State transitions use the explicit count/diversity/spacing rules rather than converting that sum into a percentage. Repeated successes can increase this diagnostic sum without increasing the qualitative evidence level.

All tuning values live in `src/lib/learningConfig.js`; graph editorial weights remain editorial data. No component contains new learning logic.

## 7. Scheduling rules

`scheduleConceptReview` replays the same evidence and returns a plan only. It is not called by production selection.

After each concept's latest miss it creates distinct stable tasks:

1. **Transfer:** an unseen question in an unseen family with the same primary concept. Earliest eligibility is the next set after the miss or a later completed intervention. Both time and set gates must pass. Seeded stable tie-breaking chooses among equivalent candidates.
2. **Original recall:** exact missed ID and revision, after two days and two sets; sticky history shortens this to one day and one set. Priority is discounted by the exact-repeat factor. An immediate retry does not complete this delayed task.

Transfer coverage reports the required, achieved and available fresh-family counts, including a missing-family count. With no variant it returns `unavailable` / `insufficient_variant_coverage`, not an unrelated question. If some variants exist but cannot satisfy the full recovery budget, it can schedule one while retaining the shortage reason.

After the fresh-success threshold, a separate `delayed_proof` task remains until proof is established, even if original recall finished earlier. A due original recall can cover that check without selecting a duplicate in the same set. Proven/Mastered concepts with prior misses get maintenance tasks at seven/twenty-one days since their latest direct answer. Maintenance does not bypass stricter sticky mastery requirements. This scheduler is deliberately scoped to concepts with a recorded miss; a future general maintenance policy for correct-only histories is not implemented.

Priorities: base transfer 50, recall 30; sticky +30, unresolved contradictions +20, prior intervention +10. Recall/proof-check priority is multiplied by 0.15. The ordered queue includes reason codes, evidence/intervention IDs, both eligibility gates, revision, versions, and waiting/unavailable/completed/blocked status.

| Hard composition limit | Ordinary practice | Dedicated Smart Review |
|---|---:|---:|
| One tested concept's share | 30% | 60% |
| Total remediation | 40% | 100% |
| Exact repeats | 10% | 30% |
| Hard questions | 30% | 40% |

Limits use `floor(setSize × share)` and never relax to fill a set. Existing selection consumes capacity, including legitimate secondary concepts. Unknown existing IDs fail rather than bypass counting. Very small sets may permit zero items. This is a remediation planner, not a full blueprint-balanced set generator; unrelated normal-practice filler is intentionally absent. Production entitlement filtering, session persistence and delivery are outside Phase 2A.

## 8. Automated replay results

Run `npm run audit:learning-pilot`. Every named replay asserts final state, evidence level, transition reason, exact unresolved IDs, transfer availability/validity, original recall ID/status, RPO supporting content without RPO attribution, versions, deterministic output, reversed input ordering and input immutability.

| Required history | Observed outcome |
|---|---|
| 1. First RTO miss | Learning signal / limited; variant and delayed original tasks |
| 2. Immediate exact success | Still Learning signal; no proof |
| 3. One fresh success | Still Learning signal; more independent evidence needed |
| 4. Multiple fresh successes | Improving / varied; contradiction remains until delayed repair |
| 5. Delayed retention | Proven / retained; contradictions resolved |
| 6. Second distinct RTO miss | Needs attention / limited |
| 7. Miss after learning | Sticky / limited |
| 8. Sticky recovery | Two fresh successes insufficient; three → Improving; later spaced check → Proven |
| 9. Recent contradiction | Blocks proof and resets recovery |
| 10. Proven relapse | Needs attention; new contradiction and review tasks |
| 11. Mastered relapse | Mastered first established, then reversed to Needs attention |
| 12. RPO support | RPO recommended; its state and evidence remain unchanged |
| 13. Duplicate/out-of-order events | Same deduplicated, chronologically replayed state |
| 14. Actual RTO coverage | Transfer unavailable; `insufficient_variant_coverage`; original recall retained |
| 15. Same inputs | Structurally identical full replay and schedule |

Additional checks cover same-family non-transfer, a required extra delayed observation, separate calendar/set gates, three repeated misses across sets, coarse PBQ exclusion on success and failure, invalid/conflicting events, unknown revisions, unreviewed mappings, future events, fabricated freshness/roles, smaller legitimate secondary weights, sticky mastery delay, recent rehearsal, intervention scheduling, strict mode/difficulty/repetition/remediation limits, maintenance eligibility and proof scheduling after early recall. There are 24 named replay cases plus boundary/validation assertions.

### Verification commands

| Command | Result |
|---|---|
| `npm run audit:learning-pilot` | PASS; all named replays and boundary checks; five concepts, twelve edges, seven active question mappings, five content mappings |
| `npm run build` | PASS; Vite 8.1.0, 152 modules, `main-Bfv92kCm.js`, same application bundle filename as Phase 1; existing >500 kB chunk warning remains |
| `npm run audit` | PASS; all eight existing chained audits |
| `npm run audit:editorial` | PASS; separately run; 395 active MCQs, 88 PBQs, 32 lessons, 171 generated checks |
| `npm run audit:qbank:strict` | PASS; separately run; no structural errors |
| `git diff --check` | PASS |
| `git diff --cached --check` | PASS before commit |

Source isolation is also checked in the pilot audit. The final staged manifest contains only the Phase 2A modules, audit/helper, package command and this report. Production application, existing content, server and Supabase paths are unchanged. No remote database tool, SQL mutation, migration, or production attempt writer was used. This is a local-source/pure-replay verification, not a new live browser release or a measured learning outcome.

## 9. Files changed

- `src/data/learningConcepts.js` — canonical concepts and graph.
- `src/data/learningMappings.js` — question signatures, roles, content links and gaps.
- `src/lib/learningConfig.js` — immutable provisional configuration and version helpers.
- `src/lib/learningEvidence.js` — normalization, validation, ordering, deduplication and derived novelty.
- `src/lib/conceptMastery.js` — pure state machine, reasons, contradictions and qualitative evidence.
- `src/lib/reviewScheduler.js` — local task planning, supporting content, time/set gates and caps.
- `scripts/lib/read-learning-pilot-bank.mjs` — effective local bank reconstruction and stable signatures.
- `scripts/audit-learning-pilot.mjs` — actual-content validation and synthetic replays.
- `package.json` — adds only the dedicated `audit:learning-pilot` command.
- `docs/phase-2a-rto-concept-pilot.md` — this report.

Unrelated `.gitignore`, Android/Capacitor files, existing audit artifacts, output and review exports remain unstaged and unmodified by the implementation.

## 10. Known limitations

1. Human mapping/scenario-independence approval remains outstanding. No production wiring is appropriate yet.
2. Real content cannot support the proof ladder. Synthetic success validates rule execution, not content sufficiency, transfer, retention or pass rates.
3. A correct delayed multiple-choice answer may still reflect guessing; the deterministic labels are provisional, not psychological ground truth.
4. The local engine trusts synthetic correctness and explicit completion events. It is not an authenticated grading service and must not award rewards.
5. Full-history novelty and monotonic set indices need durable server contracts before cross-device use. Existing truncated attempts cannot supply them reliably.
6. Mapping signatures are fail-closed for local content drift. Live overlays and historical revisions need a publication registry in Phase 2B.
7. PBQ component diagnosis, real intervention tracking, misconception tags and legacy inference are not implemented.
8. No learner-level persistence, runtime shadow ingestion, statistical calibration, analytics ingestion or UI is added. The planner does not resolve access, generate whole normal sets, or schedule correct-only maintenance histories.
9. New configurations require a new configuration version; the helper accepts injected configs for tests, so callers remain responsible for immutable version discipline.

## 11. Exact Phase 2B database requirements

**Design requirements only; no migration files or database work in Phase 2A.** Confirm the live schema and applied migrations before writing a deployment plan. Preserve existing attempt rows and behavior during additive shadow rollout.

| Logical record | Required fields and invariants |
|---|---|
| Concept/mapping catalogue | Stable concept ID; definition/objectives/domain/chapter/topic; immutable mapping version; human review status/actor/time; relationship endpoints/type/direction/weight; support-only node kind |
| Question revisions | Question ID + immutable revision/signature; exact published grading payload or secured reference; publication time/status; no deletion of revisions referenced by evidence; final local/live merge provenance |
| Question/content mappings | Revision + mapping version + primary/secondary roles; scenario family, skill, difficulty, precision; content/lesson section IDs and versions; unique reviewed mapping per revision/version; unknown revisions quarantined rather than mapped to today's content |
| Answer event ledger | Server ID; authenticated owner; client event ID; question/revision; session ID and monotonic owner set index; stable selected option or component identities; server-graded correctness and score scale; source/mode; occurred-at and received-at; mapping snapshot/version, provenance, intervention/recommendation link; unique `(owner, client_event_id)` |
| Completion/intervention ledger | Owner/event ID; concept/content revision; source miss and recommendation IDs; started/completed/skipped/postponed event type; actual occurrence and receipt times; explicit reviewed completion criteria; completion alone must never create positive mastery |
| Session manifest/summary | Owner/session ID; monotonic practice-set index; mode, seed, requested/actual counts and question revision manifest; start/end times; separate from answer events so summaries cannot enter MCQ history |
| Review task ledger | Owner/task ID; source event, concept, transfer/original/proof/maintenance type; target ID/revision or shortage; time AND set eligibility; status and outcome; algorithm/config/mapping versions; idempotent rescheduling and completion |
| Rebuildable projection | Unique owner/concept/algorithm/config/mapping version; state and evidence level; underlying effective sample and diversity counters; sticky/lapse history; unresolved evidence IDs; last answer/intervention/proof; processed-event watermark, recompute status and due tasks |
| Version registry | Immutable full configuration payload/digest and algorithm identifier; reproducible mapping references; changing weights or editorial assignments creates a new version, not an in-place historical rewrite |

Ownership and trust requirements:

- Ownership RLS on every exposed learner table; server-derived owner; users cannot edit another learner's evidence or write trusted mastery projections.
- Trusted grading resolves the exact historical question revision and original option/component identity, not the current shuffled display index. Validate session membership, access and allowed timestamps; keep client occurrence time distinct from server receipt time.
- Atomically deduplicate ingestion and reject conflicting duplicate IDs. Preserve raw immutable facts; corrections are appended and trigger replay. Support offline retry and out-of-order arrival without letting old events overwrite a newer projection silently.
- Allocate monotonic set indices centrally or define a deterministic cross-device ordering rule. Do not accept arbitrary client set increments as spaced-practice proof.
- Derive repeat/family classifications from durable exposure history; do not trust a client `fresh_scenario` flag. Maintain full-history exposure even if ordinary UI history is paginated.
- Store graded PBQ part results before introducing step-level concept evidence. Keep p211/p048 coarse until a reviewed grading/mapping contract exists.
- Index owner/time, owner/concept, owner/due gates, event idempotency keys, question revision and projection-version keys. Add foreign keys and role/precision constraints without deleting legacy data.
- Label old attempts as legacy/inferred. Do not invent lost timing, interventions, distractor choices or fresh scenarios; legacy-only evidence cannot establish proof.
- Resolve the audited session-summary schema discrepancy separately. Do not bundle coin-price reconciliation, unlock changes or entitlement changes into the mastery deployment.
- Test two-device/reload equivalence, late arrivals, conflicting retries, ownership denial, revision drift, projection rebuilds and rollback. First persist shadow output only; existing selection/rewards remain authoritative until a later approved rollout.

## 12. Decisions still requiring founder approval

No unresolved requirement conflict blocks the **local** prototype. The brief authorizes configurable provisional rules; it does not approve their production use.

Before production rollout, decide:

1. Human editorial owner and approval process for concept roles, scenario independence and the missing RTO/MTD/MTTR/BIA material.
2. Acceptable evidence budgets and delays, including this conservative lifetime-novelty rule and extra caution after sticky history. Calibrate with evidence rather than shortening thresholds to improve appearance.
3. What constitutes a completed learning intervention; how cross-device sessions/sets and interrupted practice should count.
4. How to handle legacy history and communicate insufficient evidence without presenting invented confidence.
5. Ownership, observation window and measurable gates for live shadow evaluation: incorrect flags, variant shortages, repeat share, missed events and misleading recommendations.
6. Later-phase free remediation/guest access policy and separately reviewed coin-price reconciliation. The already-approved five free PBQs, Domain 1 lessons and exam cap are not reopened here.

Stop at Phase 2A. Phase 2B remains a documented next step, not an implemented database change.
