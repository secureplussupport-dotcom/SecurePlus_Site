# Phase 2B-5 content mapping readiness

Date: 2026-10-07. Source-selection baseline: `4f17b410a67308e2868c119b67e32a88d504cea8`. Census baseline: `967365f33737950c6057a1130a896f5b6a86e162`. Original operational baseline: `96d206d1190070a374c34a366b824151205ceed6`.

**Verdict: NOT READY.** The census omissions identified by the independent review are remediated. The reproducible census, proposal tooling and editorial queue are available, but full semantic mapping is incomplete. This report does not mark Phase 2B-5 mapping complete, claim human approval, authorize a migration, or authorize live adaptive learning or Phase 3.

The approved requirements remain `docs/secureplus-rebrand-master-plan.md`; `docs/phase-1-product-loop-audit.md` supplies the historical implementation baseline. No unresolved product conflict required a behavior change. This work changes only offline scripts, package commands and documentation/evidence. The browser, routed APIs, database migrations and existing adaptive runtime are unchanged.

## Deliverables

- [Review guide](evidence/phase-2b5/review-guide.md): counting rules, review procedure, schema and privacy limitations.
- [Mapping package](evidence/phase-2b5/mapping-package.json): exact source revisions, existing trusted question IDs where supported, proposed concept links, evidence scope, exclusions, matrices and open decisions.
- [Delivered support/selector inventory](evidence/phase-2b5/delivery-inventory.md): all 162 glossary revisions, lexical source links, 14 guest teaching records, and 26 delivered selectors with source locations, inputs, targets and determinism boundaries.
- [Recorded source selections](evidence/phase-2b5/source-selection-decisions.json): the two owner choices, exact selected/nonselected revisions and residual follow-ups.
- [Next editorial batch](evidence/phase-2b5/review-batch.md): five pilot identities and 28 objective topics with plain-language pending choices.
- [Private p017 processing evidence](evidence/phase-2b5/private-p017-processing.json): read-only current fingerprint confirmation and the protected compiler-handoff blocker.
- [Prioritized editorial queue](evidence/phase-2b5/review-queue.md): every decision remains open.
- [Artifact checksums](evidence/phase-2b5/checksums.json) and [release checksums](evidence/phase-2b5/release-checksums.json).
- [Validation](evidence/phase-2b5/validation.json): current checks and final local runtime controls.
- [Read-only catalogue SQL](evidence/phase-2b5/catalogue-read.sql), captured metadata, RLS metadata and local fingerprint reconciliation in the evidence directory.

## Authoritative scope and precedence

The generator executes the actual pure publication functions extracted from `src/App.jsx`, together with the same authored/imported bank, captured publication and editorial enhancement pipeline used by the app. Raw authored records are never treated as the final revision. Captured matching overrides supply ordering without restoring stale payloads. A newer uncaptured override supersedes the local revision; inactive drafts do not. Disable and editorial retirement are separate states. Remote PBQs use the production timestamp/cutoff rule and merge after overrides.

A regression fixture explicitly records the existing behavior that a later remote PBQ can be appended after an override removed its local record. No current observed PBQ disable conflict was found, and that behavior was not changed. Future publication conflicts must be reviewed rather than silently resolving them in this audit.

This is a source-level delivery census with authenticated database metadata reconciliation. No fresh browser session was used to prove individual role delivery. Management access does not establish anonymous/free/Pro visibility. RLS metadata restricts the two stored Pro PBQs to eligible authenticated callers; local fallback and private variants are separate records. No accounts, learner histories or grading payloads were exported.

Previously captured whole-catalogue evidence (2026-10-06 01:45:12 UTC; **not refreshed as a whole during this slice**) observed 56 active override records and two PBQ records. All 56 override payload fingerprints and capture identities match the local snapshot. Two override records disable MCQs. The private `p003` and `p017` publications are newer than the editorial cutoff and differ from the local payloads. Their exact opaque parent payload hashes are preserved, while semantic mapping and trusted compilation remain unreviewed. That capture used authenticated metadata inspection. Those whole-catalogue observations are historical. The source-selection slice refreshed only p017 fingerprint/schema metadata as described below; it did not inspect learner records or refresh the entire catalogue. The private explanations carry their parent payload hash, explicitly not an independently extracted explanation hash.

The inspection found `question_overrides`, `question_override_history` and `pbqs` as the matching public catalogue tables. History author records, storage objects, external drafts and user-created content were not read. The captured inspection found no `adaptive_private` schema. None of these observations proves completeness across every production storage location.

## Census and coverage

| Category | Count | Interpretation |
| --- | ---: | --- |
| Effective local MCQs | 395 | Exact active local publication revisions |
| Effective local PBQs | 88 | Includes local fallbacks for the two private alternatives |
| Later private PBQ variants | 2 | Alternative role-dependent publications, not two extra simultaneous questions |
| Signup starter questions | 9 | Separately authored experience-level questions; also general diagnostic fallbacks |
| Explanation bundles | 494 | 483 bank, nine starter, and two opaque private parent-bound bundles |
| Flashcards | 313 | Acronym and term cards; not learner-created cards |
| Flashcard deck containers | 29 | Overlap their constituent cards |
| Deep Dive lessons | 32 | Overlap the sections, keyword guides, traps and checks below |
| Lesson sections | 106 | Beyond-textbook scope retained explicitly |
| Keyword guides / trap bundles | 32 / 32 | Support content only |
| Lesson checks | 128 | 32 self-checks plus 96 actually displayed generated questions |
| Public instructional/SEO pages | 16 | Separate coarse inventory; no approved persistence adapter |
| Glossary definitions | 162 | Exact per-definition hashes, stable term identities, source locations and conditional delivery |
| Guest teaching demo records | 14 | Two assessments, one card, two explanations, two feedback bundles, one hint, three fixed review paths and three teaching prompts |
| Intervention selectors | 26 | Delivered algorithms and navigation selectors; no learner-specific outputs |
| Total overlapping records | 1,878 | Not a count of independent questions or learning opportunities |
| Excluded/source-layer records | 1,209 | Includes retired, disabled, raw superseded layers, unused helper outputs and unavailable external scope |

The generated practice helper produces 171 questions, but the app displays only the first three per lesson: 96 active and 75 excluded. Another 337 helper-generated cards are not delivered by the app. Both groups are excluded from active coverage. Raw-layer exclusions overlap identities and must not be interpreted as 1,209 removed questions.

Only seven question revisions carry an existing pilot primary-concept proposal: five MCQs and two coarse PBQs. **489 question revisions remain unresolved**: 390 bank MCQs, nine signup starter questions, 86 local PBQs, two private variants and the two guest demo assessments. Literal terms and objective tags are explicitly low-confidence candidates, not inferred primary concepts or semantic coverage. Their mastery weight is zero.

There are 435 catalogue nodes: five existing pending-human mastery concepts, 28 proposed objective topics and 402 proposed supporting terms. Proposed support terms are not automatically promoted to mastery concepts. The 430 new node identities require synonym, ambiguity, scope and granularity review before any canonical version can be approved.

The existing compiler produces trusted IDs for 447 local question revisions and rejects 36. Unsupported formats/fields remain catalogue-only with null trusted IDs and an explicit queue item. Source signatures and trusted semantic hashes use distinct namespaces. No runtime content UUID was fabricated. Existing schema-supported instructional kinds are labeled; pages, explanations, glossary definitions, starter identities, guides, containers and selectors have no approved persistence adapter.

## Census remediation and completeness boundary

The original package omitted inline glossary definitions and most delivered selectors. Each glossary entry now has a stable term identity, a hash of its exact authored definition, a term-plus-definition revision signature, source line, and links bound to exact referencing record signatures. The extraction uses the actual renderer's formatting and term-boundary rules. Definitions, question/feedback text and learner data are not copied into the review exports.

Of the 162 definitions, 136 occur in the current question/lesson corpus. Including flashcards and signup starters yields 153 with local references. Nine have no observed local reference: CORS, CSIRT, DER, DNAT, GRC, HOTP, MTTD, P12 and PFX. All 162 remain conditional-support records: private/live text can introduce a term, so absence from the inspected corpus does not justify claiming an entry is genuinely unused. Those nine have explicit P1 decisions instead of fabricated retirement. Objective proposals are unions of referencing source tags, not validated per-definition objective mappings. All glossary weights are zero.

The selector registry covers weak and starter decks; daily challenges; Deep Dive recommendations; flashcard-related lessons; Smart Review; next PBQ/deck; random/starred decks; general/signup diagnostics; MCQ launch and result paths; exams; PBQ browsing/random practice; dashboard weak-area actions; Cipher routing; lesson search/steps/end actions; related-PBQ routing; flashcard browsing/pass navigation; glossary lookup; and guest PBQ preview. Each record binds source units, dependency hashes, delivery call sites, input categories, output kinds and deterministic/time/random boundaries. No actual learner selection instance is exported. The nine signup questions were discovered while tracing the diagnostic selectors and have their own question/explanation records rather than being hidden inside an App-file hash.

The final review also identified `GuestFeaturePreview`, reached from the default unauthenticated root through `GuestDashboardGate` and `GuestFeatureShowcaseCard`. It contains independently authored teaching; the existing `guest-pbq-preview` selector only navigates to real bank content and cannot represent this demo. Fourteen separate revisions now bind the MFA definition, access-control MCQ/feedback, solution and distractor explanations, ordering PBQ/feedback/hint, three hardcoded review paths and three Deep Dive prompts. Three selectors bind the complete preview function and guest reachability chain, review dictionary selection and lesson prompt selection. Source units include exact anchors, line locations and hashes; per-topic value hashes distinguish each fixed path/prompt without exporting its body.

These marketing demos remain outside adaptive evidence: null trusted revision IDs, zero mastery weights and explicitly unresolved objective/concept scope. The PBQ is coarse and reveals the next step through a hint; it cannot establish independent unaided transfer. The review percentages and miss signals are synthetic illustrations, not learner measurements. The clock/pause/progress illustration contains no authored question or subject teaching and has its own source-bound exclusion. No product behavior or marketing copy changed. The glossary's 153-reference count still describes the explicitly inspected question/lesson/card/starter corpus; it does not claim a new semantic link to these demos.

Explicit selector exclusions distinguish the unwired adaptive scheduler/model, non-learning admin/account/cosmetic actions, and learner-specific saved/personalized instances. Source-level coverage is reviewed against the current delivery files; no claim is made that static analysis can prove every future selector. `delivery-surface-review.json` deliberately fails closed on a change to a reviewed delivery source. Regeneration alone cannot bless such a change: the inventory must be reviewed and that guard deliberately updated. Tests also reject removed glossary/selector rows, changed per-definition/selector revisions, orphan usage links, missing manifest sources and unreviewed selector-scope changes. The guard is an agent inventory checkpoint, not human editorial approval.

## Recorded PBQ source selections

The unchanged owner record selects local `p003` and private Supabase `p017`, and describes each pair as testing the same skill through materially different assessments. The deterministic reader pins the original record SHA-256 `943b06eb101db5d1616cf0cd5289b798c0ce984700993b8561e8537cf2988ec0` and its reviewed package SHA-256 `2704b7fb7ccf4ecf2042edc4ac1f0015abd9ed4d12059dee5e664562be9c7ad5`. Exact selected/nonselected source signatures and the original commits remain separate from this regenerated package's checksum. A changed record, source or contradictory choice fails closed until deliberately rebound to a new human review.

Two source choices and two pair-comparison aspects are reconciled. The two old mixed `private_variant` queue entries are replaced with precise residual follow-ups. No concept mapping, mastery weight, family independence or live-publication approval is inferred. Selecting local p003 does not override its newer private publication for eligible live callers. Selecting private p017 does not erase the delivered local fallback. All four question revisions and four explanation bundles remain in the census. The open queue remains the same size because each mixed entry retains a distinct unanswered follow-up; its priority distribution changes.

Read-only authenticated p017 metadata on 2026-10-07 at 07:22 Singapore time confirmed the selected payload fingerprint `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`. The appQuestion fingerprint also matches the captured revision. An object with array-shaped choices is not proof of complete compiler support. The actual protected payload was not retrieved or compiled: the available MCP connector returns serialized tool results, and this session has no protected in-memory handoff to the existing Node compiler without putting that payload into tool arguments or a file. This is an execution-path blocker, not a disconnected database or an unsupported-grammar claim. Private p017 retains null trusted revision/content IDs. The tested helper can compile privately supplied normalized input and returns only hashes/IDs or bounded failure statuses; its successful tests use synthetic content, not private p017.

The next batch contains the five pilot identities and 28 objective topics. Identity, granularity, exact objective/role, family independence and intervention decisions are still pending. The original human record is preserved unchanged; no approval is self-referential or extended to the regenerated package.

## Gaps and decisions

The queue has **2,954 open decisions: P0 3; P1 1,070; P2 1,881**. Decisions overlap records.

- P0: review/validate both delivered private revisions and their semantic/compilation scope, plus resolve the local p003 source-selection/live-delivery divergence through a separately authorized publication decision. The two source choices are already answered.
- P1: decide future handling of the nonselected but delivered p017 fallback; resolve 476 bank question concept/family mappings and nine starter mappings; explicitly review all seven pilot mappings; review 430 proposed taxonomy nodes; handle 36 unsupported trusted revisions; resolve 83 missing objective assignments; review the 14 guest demo scopes and marketing learner claims; confirm delivery/use of nine locally unreferenced glossary entries; and address independent-family shortages for all five existing mastery concepts.
- P2: review 1,393 instructional records, 57 missing mapped interventions and 431 nodes without a mapped direct assessment. Supporting nodes need not become mastery nodes.

No scenario family has human approval. A different ID, matching keyword or a later appearance does not establish novelty. Existing RTO MCQs share one identification family; none of the five pilot concepts has sufficient independently reviewed variants to justify broad transfer coverage. Coarse PBQs emit no per-concept mastery weight.

MCQ domain distribution is 85/92/53/107/58. Against the repository's 12/22/18/28/20 percent blueprint weights, the differences are +9.52/+1.29/-4.58/-0.91/-5.32 percentage points. This describes bank balance, not exam readiness or adaptive sampling policy. Domain 1 is overrepresented and domains 3 and 5 underrepresented. Objective/concept/type/confidence/novelty/family matrices are in the package. Inherited lesson/deck objectives are broad candidates and must not inflate semantic coverage.

Exact duplicate stem, duplicate identity, orphan concept/reference, stale or retired mapping, and domain conflict detectors are exercised with adversarial fixtures. Current exact-stem duplicates and domain conflicts were not detected. Near-duplicate semantics and synonym collisions require editorial review; exact hashing cannot rule them out.

## Validation and reproduction

Passed for this source-selection slice:

- `npm run audit:content-mapping`: 28 tests, byte-for-byte regeneration and artifact hashes.
- `npm run audit:learning-runtime`: 40 tests covering the existing compiler, runtime and isolation behavior; learning-pilot replay/catalogue checks.
- Focused adversarial tests reject stale baseline/decision/source hashes, nonexistent or contradictory selected revisions, semantic approvals, private payload export fields, changed human records and unverified private compilation. They preserve actual publication precedence, all alternative explanations, null private IDs, and honest absent/drift/unsupported outcomes. The compiler's successful private-path test is synthetic only.
- `git diff --check`, source import/privacy checks, release-manifest validation and the Vercel deployment-skip check.
- Fresh read-only local control checks: stored enabled false, effective enabled false and kill switch true on the PostgreSQL 17.6 rehearsal target and local Auth stack.

Two focused reproduction tests failed before this slice consumed the human choices; all five added tests now pass. The prior census baseline passed build, all eight site audits, 20 persistence scenarios, 213 static migration checks, 69 runtime/boundary/operations tests and 525 local database assertions. Those broader suites and the operational backup/restore/load rehearsal were not repeated for these offline-only changes. Their dated evidence is retained in validation.json as prior evidence, not a new run. No app, routed API, runtime compiler, database migration or operational adapter was changed. No live migration or production write was performed.

Offline package reproduction:

```sh
npm run build:content-mapping
npm run audit:content-mapping
```

For fingerprint reconciliation, set `ADAPTIVE_DATABASE_URL` privately to a disposable loopback PostgreSQL instance and run `node scripts/reconcile-content-catalogue.mjs`, then rebuild the package. The program rejects non-loopback hosts and uses a read-only transaction. It compares local JSON objects through PostgreSQL's actual `jsonb::text` representation, not an approximated JavaScript serializer. Production evidence refresh uses only the supplied SELECT query through the authenticated connector; any changed snapshot requires rebuilding and re-reviewing the package.

To reproduce database regressions, use a fresh disposable Supabase instance with the five existing adaptive migrations, supply the existing local audit environment variables without printing credentials, temporarily enable only its local test control, then run `audit:learning-database`, `audit:learning-infrastructure`, `audit:learning-trusted-runtime`, `audit:learning-deletion-shadow`, and `audit:learning-boundary:database` in that order. Always disable and verify the local control in a finally block. Never substitute a production URL.

## Remaining gates

The approval package remains on hold. The two recorded PBQ source choices are incorporated; private p017 trusted processing and full semantic mapping must be completed against the exact effective revisions, including secured inspection of the two private variants. An editor must approve canonical granularity, primary/secondary roles, objective specificity, weights, family independence, novelty and intervention usefulness, and record decisions against this immutable package hash. No human approval is implied by generated proposals or passing tests.

A later runtime integration needs separately approved adapters for unsupported content kinds/grammars, complete validated version publication, and the existing production-readiness/operations gates. No live migration, activation, shadow cohort, learner change, deployment, pricing/legal change or Phase 3 work was performed or authorized here.

## Exact source-selection slice files

- `scripts/lib/content-mapping/editorial-selections.mjs` — pinned decision reader/validator and metadata-only private compiler helper.
- `scripts/lib/content-mapping/package.mjs` — separate source choices, residual queues, processing status and provenance inputs.
- `scripts/build-content-mapping.mjs` — generated selection ledger, 33-identity batch, guide and checksum updates.
- `scripts/audit-content-mapping.mjs` — reproductions, stale/contradictory approval checks, unchanged precedence and private-boundary tests.
- `docs/phase-2b5-content-mapping-readiness.md` — this updated report.
- `docs/evidence/phase-2b5/private-p017-processing.json` — fresh read-only metadata evidence and the processing blocker.
- `docs/evidence/phase-2b5/source-selection-decisions.json` — generated exact choices and reconciled/residual aspect ledger.
- `docs/evidence/phase-2b5/review-batch.md` — next five-pilot/28-topic review batch.
- `docs/evidence/phase-2b5/mapping-package.json` — regenerated package and matrices.
- `docs/evidence/phase-2b5/delivery-inventory.md` — corrected source-choice versus semantic-review wording.
- `docs/evidence/phase-2b5/review-guide.md` — instructions for already recorded choices and the next batch.
- `docs/evidence/phase-2b5/review-queue.md` — precise remaining decisions.
- `docs/evidence/phase-2b5/checksums.json` — generated artifact hashes.
- `docs/evidence/phase-2b5/validation.json` — current checks separated from historical broader regressions.
- `docs/evidence/phase-2b5/release-checksums.json` — complete checksum manifest excluding itself.

`docs/phase-2b5-editorial-review-record.md` is unchanged and included as an input in the release manifest.
