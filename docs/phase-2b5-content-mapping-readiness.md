# Phase 2B-5 content mapping readiness

Date: 2026-10-06. Baseline: `96d206d1190070a374c34a366b824151205ceed6`.

**Verdict: NOT READY.** The reproducible census, proposal tooling and editorial queue are available, but full semantic mapping is incomplete. This report does not mark Phase 2B-5 mapping complete, claim human approval, authorize a migration, or authorize live adaptive learning or Phase 3.

The approved requirements remain `docs/secureplus-rebrand-master-plan.md`; `docs/phase-1-product-loop-audit.md` supplies the historical implementation baseline. No unresolved product conflict required a behavior change. This work changes only offline scripts, package commands and documentation/evidence. The browser, routed APIs, database migrations and existing adaptive runtime are unchanged.

## Deliverables

- [Review guide](evidence/phase-2b5/review-guide.md): counting rules, review procedure, schema and privacy limitations.
- [Mapping package](evidence/phase-2b5/mapping-package.json): exact source revisions, existing trusted question IDs where supported, proposed concept links, evidence scope, exclusions, matrices and open decisions.
- [Prioritized editorial queue](evidence/phase-2b5/review-queue.md): every decision remains open.
- [Artifact checksums](evidence/phase-2b5/checksums.json) and [release checksums](evidence/phase-2b5/release-checksums.json).
- [Validation](evidence/phase-2b5/validation.json): current checks and final local runtime controls.
- [Read-only catalogue SQL](evidence/phase-2b5/catalogue-read.sql), captured metadata, RLS metadata and local fingerprint reconciliation in the evidence directory.

## Authoritative scope and precedence

The generator executes the actual pure publication functions extracted from `src/App.jsx`, together with the same authored/imported bank, captured publication and editorial enhancement pipeline used by the app. Raw authored records are never treated as the final revision. Captured matching overrides supply ordering without restoring stale payloads. A newer uncaptured override supersedes the local revision; inactive drafts do not. Disable and editorial retirement are separate states. Remote PBQs use the production timestamp/cutoff rule and merge after overrides.

A regression fixture explicitly records the existing behavior that a later remote PBQ can be appended after an override removed its local record. No current observed PBQ disable conflict was found, and that behavior was not changed. Future publication conflicts must be reviewed rather than silently resolving them in this audit.

This is a source-level delivery census with authenticated database metadata reconciliation. No fresh browser session was used to prove individual role delivery. Management access does not establish anonymous/free/Pro visibility. RLS metadata restricts the two stored Pro PBQs to eligible authenticated callers; local fallback and private variants are separate records. No accounts, learner histories or grading payloads were exported.

Production catalogue inspection observed 56 active override records and two PBQ records. All 56 override payload fingerprints and capture identities match the local snapshot. Two override records disable MCQs. The private `p003` and `p017` publications are newer than the editorial cutoff and differ from the local payloads. Their exact opaque parent payload hashes are preserved, while semantic mapping and trusted compilation remain unreviewed. The connector is available: this is deliberately limited metadata inspection, not a claim that the production source is disconnected. The private explanations carry their parent payload hash, explicitly not an independently extracted explanation hash.

The inspection found `question_overrides`, `question_override_history` and `pbqs` as the matching public catalogue tables. History author records, storage objects, external drafts and user-created content were not read. Production still has no `adaptive_private` schema. None of these observations proves completeness across every production storage location.

## Census and coverage

| Category | Count | Interpretation |
| --- | ---: | --- |
| Effective local MCQs | 395 | Exact active local publication revisions |
| Effective local PBQs | 88 | Includes local fallbacks for the two private alternatives |
| Later private PBQ variants | 2 | Alternative role-dependent publications, not two extra simultaneous questions |
| Explanation bundles | 485 | 483 local plus two opaque private parent-bound bundles |
| Flashcards | 313 | Acronym and term cards; not learner-created cards |
| Flashcard deck containers | 29 | Overlap their constituent cards |
| Deep Dive lessons | 32 | Overlap the sections, keyword guides, traps and checks below |
| Lesson sections | 106 | Beyond-textbook scope retained explicitly |
| Keyword guides / trap bundles | 32 / 32 | Support content only |
| Lesson checks | 128 | 32 self-checks plus 96 actually displayed generated questions |
| Public instructional/SEO pages | 16 | Separate coarse inventory; no approved persistence adapter |
| Intervention selectors | 3 | Weak-area deck, starter deck and daily challenge selectors reuse existing content |
| Total overlapping records | 1,661 | Not a count of independent questions or learning opportunities |
| Excluded/source-layer records | 1,205 | Includes retired, disabled, raw superseded layers, unused helper outputs and unavailable external scope |

The generated practice helper produces 171 questions, but the app displays only the first three per lesson: 96 active and 75 excluded. Another 337 helper-generated cards are not delivered by the app. Both groups are excluded from active coverage. Raw-layer exclusions overlap identities and must not be interpreted as 1,205 removed questions.

Only seven question revisions carry an existing pilot primary-concept proposal: five MCQs and two coarse PBQs. **478 question revisions remain unresolved**: 390 MCQs, 86 local PBQs and the two private variants. Literal terms and objective tags are explicitly low-confidence candidates, not inferred primary concepts or semantic coverage. Their mastery weight is zero.

There are 373 catalogue nodes: five existing pending-human mastery concepts, 28 proposed objective topics and 340 proposed supporting terms. Proposed support terms are not automatically promoted to mastery concepts. The 368 new node identities require synonym, ambiguity, scope and granularity review before any canonical version can be approved.

The existing compiler produces trusted IDs for 447 local question revisions and rejects 36. Unsupported formats/fields remain catalogue-only with null trusted IDs and an explicit queue item. Source signatures and trusted semantic hashes use distinct namespaces. No runtime content UUID was fabricated. Existing schema-supported instructional kinds are labeled; pages, explanations, guides, containers and selectors have no approved persistence adapter.

## Gaps and decisions

The queue has **2,523 open decisions: P0 4; P1 911; P2 1,608**. Decisions overlap records.

- P0: review the two private revisions and reconcile their two local fallbacks. Bind any future mapping to the exact private revision.
- P1: resolve 476 local question concept/family mappings; explicitly review all seven existing pilot mappings; review 368 proposed taxonomy nodes; handle 36 unsupported trusted revisions; resolve 19 missing objective assignments on pages/selectors; and address independent-family shortages for all five existing mastery concepts.
- P2: review 1,176 instructional records, 63 missing mapped interventions and 369 nodes without a mapped direct assessment. Supporting nodes need not become mastery nodes.

No scenario family has human approval. A different ID, matching keyword or a later appearance does not establish novelty. Existing RTO MCQs share one identification family; none of the five pilot concepts has sufficient independently reviewed variants to justify broad transfer coverage. Coarse PBQs emit no per-concept mastery weight.

MCQ domain distribution is 85/92/53/107/58. Against the repository's 12/22/18/28/20 percent blueprint weights, the differences are +9.52/+1.29/-4.58/-0.91/-5.32 percentage points. This describes bank balance, not exam readiness or adaptive sampling policy. Domain 1 is overrepresented and domains 3 and 5 underrepresented. Objective/concept/type/confidence/novelty/family matrices are in the package. Inherited lesson/deck objectives are broad candidates and must not inflate semantic coverage.

Exact duplicate stem, duplicate identity, orphan concept/reference, stale or retired mapping, and domain conflict detectors are exercised with adversarial fixtures. Current exact-stem duplicates and domain conflicts were not detected. Near-duplicate semantics and synonym collisions require editorial review; exact hashing cannot rule them out.

## Validation and reproduction

Passed on the current source:

- `npm run build`; all eight `npm run audit` site audits, including editorial and strict question-bank checks. Build retains the existing chunk-size warning.
- `npm run audit:content-mapping`: 13 tests plus byte-for-byte regeneration and hash checks.
- Learning pilot checks; 20 persistence scenarios; 213 static migration checks.
- 69 runtime/boundary/operations unit tests.
- Fresh disposable database: 26 database, 116 infrastructure, 103 trusted-runtime, 262 deletion/shadow-isolation and 18 boundary-database assertions.
- Source import scans keep the package outside browser/API imports; privacy checks reject grading/answer-bearing export fields and question stems. Existing live code and migration files are unchanged.
- Final controls on both the PostgreSQL 17.6 rehearsal target and local Auth stack: stored enabled false, effective enabled false, kill switch true.

The first legacy database-audit attempt correctly rejected the populated disposable database. Only the known local Supabase stack was reset; all five database suites then passed. The approved operational backup/restore/load rehearsal was not repeated because this package changes no runtime or migration code. Its baseline artifacts remain unchanged; operations unit regressions passed. This is not a new production-scale load claim.

Offline package reproduction:

```sh
npm run build:content-mapping
npm run audit:content-mapping
```

For fingerprint reconciliation, set `ADAPTIVE_DATABASE_URL` privately to a disposable loopback PostgreSQL instance and run `node scripts/reconcile-content-catalogue.mjs`, then rebuild the package. The program rejects non-loopback hosts and uses a read-only transaction. It compares local JSON objects through PostgreSQL's actual `jsonb::text` representation, not an approximated JavaScript serializer. Production evidence refresh uses only the supplied SELECT query through the authenticated connector; any changed snapshot requires rebuilding and re-reviewing the package.

To reproduce database regressions, use a fresh disposable Supabase instance with the five existing adaptive migrations, supply the existing local audit environment variables without printing credentials, temporarily enable only its local test control, then run `audit:learning-database`, `audit:learning-infrastructure`, `audit:learning-trusted-runtime`, `audit:learning-deletion-shadow`, and `audit:learning-boundary:database` in that order. Always disable and verify the local control in a finally block. Never substitute a production URL.

## Remaining gates

Full semantic mapping must be completed against the exact effective revisions, including secured inspection of the two private variants. An editor must approve canonical granularity, primary/secondary roles, objective specificity, weights, family independence, novelty and intervention usefulness, and record decisions against this immutable package hash. No human approval is implied by generated proposals or passing tests.

A later runtime integration needs separately approved adapters for unsupported content kinds/grammars, complete validated version publication, and the existing production-readiness/operations gates. No live migration, activation, shadow cohort, learner change, deployment, pricing/legal change or Phase 3 work was performed or authorized here.
