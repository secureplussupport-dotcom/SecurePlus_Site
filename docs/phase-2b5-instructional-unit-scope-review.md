# Phase 2B-5 — current instructional-unit scope proposals

7 October 2026. Baseline `63c3c63d7d5e6030c1f6257d7d4b6fc924718586`. **19 units inspected; 18 scope proposals, one withheld. Agent review only; owner and independent scope gates pending. Phase 2B-5 remains NOT READY.**

This packet assigns proposed syllabus scope to the actual unit text, separately from broad deck/lesson/page labels. It does not change those labels, canonical concepts, active support links, content, delivery, weights or approval records. The master plan remains the approved specification and the Phase 1 audit the historical current-state evidence. No product conflict or behavior change is introduced.

## Exact versions and pending owner packet

- [Unit-scope proposal JSON](drafts/phase-2b5-instructional-unit-scope-proposals.json): SHA-256 `18d9b7fc2114672c02d14eeeff23db5a36a2f5528b36c005262be50fdf9f09fb`.
- Original 19-unit mapping proposals: `de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c`.
- Unchanged active package: `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`.
- Unchanged [27-choice owner packet](phase-2b5-pilot-owner-decision-packet.md): `01f96e9c4edff2ef61d25c296fb96c585ad1a00db0709f47c0d261b7fbb5d953`.
- Existing delivery census: `c57fea32997f551560a2846433b108131a3844e3c713f620f4b7ed51ae14207a`.

Each T-row preserves the same locator/order as the owner packet. JSON pins parent revision, exact keyword subunit revision where relevant, reviewed unit text, and observed parent codes separately from proposed unit codes. It also binds the eight existing delivery source files and four exact renderer/function slices with anchors, line locators and revision signatures. Main-practice feedback uses the complete MCQPractice function, including its submit state and Pro feedback check. Local semantic hashes are not substituted for published-record identities or trusted revision IDs.

The old proposals' `objectiveCodesProposal=null` and all old boxes remain untouched. These are **new review bytes**, not consent or an automatic update to C-TEACHING-SCOPE-HOLD. Keeping that old hold cannot approve this new packet. A later scope decision needs deliberate binding to the new packet hash and unchanged comparison/package hashes. No approval is requested in this implementation chat; the monitoring chat can present the result. Prospective question/family delegation does not turn these current teaching-scope proposals into human approval.

## Why these objective codes

[CompTIA's official SY0-701 objectives, v5.0](https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf) were checked on 7 October 2026. PDF page 14, objective 5.2, names BIA and RTO/RPO/MTTR/MTBF; PDF page 9, objective 3.4, includes backup frequency, recovery and replication. The unit matches below are **editorial inferences from the inspected local text**. MTD remains supporting BIA/continuity context, not an explicit named bullet. A bare metric definition is assigned 5.2 here; it does not automatically teach an architecture technique, incident-response process, hardening, physical security, assurance, vendors or compliance.

| Unit | Inspected teaching | Proposed scope | Why / delivery condition |
| --- | --- | --- | --- |
| T01 | RTO acronym card | 5.2 | Defines the service-return target; choose this card in definition/acronym mode. |
| T02 | RTO glossary definition | 5.2 | Defines acceptable restoration time; only revealed through an opened matching tooltip. |
| T03 | RPO acronym card | 5.2 | Defines data-loss tolerance in time; broad business-document deck codes are not unit scope. |
| T04 | RPO glossary definition | 5.2 | Same specific metric meaning; page-reference objective unions do not tag the definition. |
| T05 | MTTR repair/recover card | 5.2 | Defines average repair/restoration time, not incident-response time. |
| T06 | MTTR repair/respond glossary | **null; withheld** | Actual name and text mix restoring equipment with responding to an incident. Reachability does not resolve that ambiguity. |
| T07 | BIA acronym card | 5.2 | Critical functions and downtime impacts; no vendor/compliance/governance lesson is taught by the card. |
| T08 | BIA glossary definition | 5.2 | Critical operations, dependencies, downtime limits and impacts; conditional tooltip support. |
| T09 | m032 explanation and wrong feedback | 5.2 | RTO/data-loss/average contrasts clarify recovery metrics after submission. |
| T10 | m086 explanation and wrong feedback | 5.2 | BIA informs plans/targets; an IRP distractor does not teach incident-response processes. |
| T11 | m088 explanation and wrong feedback | **5.2 and 3.4** | Four-hour RPO versus three-hour versioned backups; actual replication/deletion and usable-history reasoning supports backup scope beyond the parent question's 5.2 label. |
| T12 | m196 explanation and wrong feedback | **5.2, supporting context** | Outer business tolerance versus restoration target; does not invent an explicit MTD bullet. |
| T13 | m635 explanation and wrong feedback | 5.2 | Restoration target versus data loss, average repair and annual frequency; contrasts are support, not new mastery attribution. |
| T14 | Recovery-metrics table, resilience section 1 | 5.2 | Four rows distinguish RTO/RPO/MTTR/MTBF. No MTD row; BIA alias is not BIA-process teaching. Compare tabs control which row is shown. |
| T15 | Risk/resilience guide's exact RTO definition | 5.2 | Target restoration time; keyword index 3 requires selecting RTO. Other guide terms and assurance scope are outside the unit. |
| T16 | Same guide's exact RPO definition | 5.2 | Data-loss tolerance; keyword index 4 requires selecting RPO. No whole-guide scope inherited. |
| T17 | Resilience/assets guide's exact RTO definition | 5.2 | Target restoration time; keyword index 0 is the initial tab after an eligible lesson opens. Parent physical/security/hardening tags do not follow from this definition. |
| T18 | Same guide's exact RPO definition | 5.2 | Data-loss tolerance; keyword index 1 requires selecting RPO. No architecture mechanism is specified in the isolated definition. |
| T19 | Forensics/recovery guide's exact RPO definition | 5.2 | Data-loss tolerance; keyword index 2 requires selecting RPO. Parent investigation/incident-response codes do not describe this text. |

All eighteen non-null proposals include 5.2. Only T11 additionally proposes 3.4, justified by its actual backup-frequency/recovery/replication explanation. This is not a reclassification of question m088 or its lesson/deck. Seventeen single-code proposals include one supporting-context unit (T12); T06 remains excluded with no concept links. Existing concept-link proposals and support roles are preserved; no additional MTBF canonical concept/link is created from T14's fourth row.

## Reachability is not observed teaching

Inspected all nineteen units' complete local text, the actual renderer branches and the source-bound delivery census. All have conditional source paths; **zero have browser-observed delivery or verified learner exposure in this slice**. No new browser/live/private inspection or learner records were obtained. Semantic scope can be proposed from text while actual delivery stays unobserved; that cannot supply exposure or mastery credit.

- **Cards:** the risk-governance-business deck contains the four exact cards. Definition mode shows meaning on the front; acronym mode reveals it on the back. Learners must reach the card; example-only mode filters these four out because none has an example. Self-rating is not trusted mastery evidence.
- **Glossary:** a token must be rendered through GlossaryText, then clicked or keyboard-activated to reveal the definition. Static reference counts prove neither an opened tooltip nor a lesson. All four glossary definitions remain only conditionally available; T06 is semantically withheld even if a tooltip can open.
- **Post-answer support:** in the inspected main-practice path, the question must be selected in the set, an answer submitted and `user.tier === "pro"` for `current.exp` to appear. A wrong-feedback entry appears only for the selected wrong answer. The complete bundle is source-bound but is not shown at once, nor a fresh assessment. This is one inspected path; no claim that every quiz/diagnostic uses these exact question IDs or the same entitlement.
- **Lesson terms/table:** these three lessons are outside the free-preview lesson (`web-social-dns-attacks`), so their current open path requires Pro. Definitions appear in Guided lesson / Exam keywords; only the selected term is shown. The risk/resilience guide's RTO/RPO entries are indices 3/4, outside the generated practice's first-three keyword slice. Their lesson tabs remain reachable. Resilience RTO is the initial tab; the other reviewed terms require selecting their tab. No generated practice question is adopted as evidence here.
- **Table:** section index 1 has no body, so DeepDiveReadableBites returns null. The adjacent `activeSection.table` comparison renderer supplies the teaching. Initially it shows RTO; other metrics require their tabs. The scope covers the inspected table text, not a claim that every row was read together. The displayed broad parent objective chip is observed metadata, not proof of unit scope.

These paths establish available conditional source capability, rather than mere dead text. Runtime selection, entitlement, browser rendering, accessibility/usability and actual reading were not rehearsed. No scope is inferred solely from lesson titles, aliases, inherited labels, explanation keyword frequency or source availability.

## Adversarial checks and limits

The author pass rejected inherited deck/lesson objective unions, promotion of an IRP mention into 4.8, an explicit-bullet claim for MTD, repair/respond conflation, whole-guide attribution from one definition and exposure claims from source references. It caught and corrected an initial description that incorrectly treated resilience RTO as a noninitial keyword: that definition is index 0. Its finalized delivery condition and runnable negative case bind that distinction. This remains author review, not the independent scope gate.

Run `node scripts/audit-instructional-unit-scope.mjs`. The minimal audit recomputes exact local parent/unit/subunit and renderer revisions, verifies source fingerprints, unchanged concept links/roles, the 19-row census, proposed codes/withheld unit, keyword indices/first-three status, false approvals/exposure and zero weights. Negative cases reject inherited codes, MTTR scope promotion, explicit MTD scope, missing subunit, a false initial-tab condition, human approval, positive weight, stale parent and browser-observed claims. All 25 active release-manifest files and the original pending owner packet must stay byte-identical.

Passed: dedicated unit-scope audit including nine negative cases, existing objective-5.2 mapping audit and owner-packet audit. Staged whitespace and Vercel `[skip deploy]` checks passed before push. No new build, database/runtime rehearsal, live delivery verification or deployment is claimed for isolated proposal files. Task-only commit/push preserves unrelated work.

**NOT READY.** Current owner metadata decisions and this new scope binding remain pending; MTTR definition repair, wider taxonomy/relationships, private processing, compiler/adapters, coverage/calibration, teaching adoption and separate rollout authorization remain open. No active mapping, learner delivery, publication, migration, activation, shadow write or cohort change is authorized by this artifact.
