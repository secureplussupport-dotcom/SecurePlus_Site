# Phase 2B-2: independent runtime kernels; database execution blocked

Date: 2026-10-02. Starting commit: `a208ebfa4ec971e6d1e2b1cd8b6e06ae14be354f` on `main`.

## 1. Executive summary

**INCOMPLETE — NOT DEPLOYABLE.** Local Supabase initialization succeeded, but startup and status failed because neither Docker nor Podman is installed. The brief requires explicit authorization before installing system software. Authorization was requested; none was received during this implementation. No runtime or system package was installed. Database-dependent implementation stopped as instructed.

This partial delivery adds independently tested, unwired server modules for effective publication precedence, stable pilot answer identities, pure grading, conservative chronology preflight, and a default-off local shadow runner. It does **not** deliver authenticated database grading, transactional session/evidence ingestion, deletion repair, durable editorial actors, intervention/task persistence, or the projection worker.

| Required statement | Verified outcome |
| --- | --- |
| Migration executed locally | **No** — local database unavailable |
| Local SQL validation passed | **No** — not executed |
| Actual database role / REST / RLS testing | **No** — unavailable; static checks are not a substitute |
| Live Supabase mutations | **None** — metadata SELECTs only |
| Shadow writing enabled | **No application path is connected or enabled**; tests invoke an in-memory callback only |
| Production shadow flag | No production environment setting was changed or inspected; the new runner defaults off and hard-denies production |
| Learner-visible behavior changed | **No** — no application, API, selection, reward, access or UI code changed |
| Versions activated / human approval granted | **None** |

Authority remains the approved master plan, Phase 1 current-state audit, Phase 2A provisional learning model, and Phase 2B-1 proposed persistence design, with this phase's explicit working decisions controlling deletion and chronology. No approved product behavior was changed.

## 2. Local Supabase environment and versions

Host: Darwin arm64. Node `v24.15.0`; npm `11.12.1`. Existing CLI: `/tmp/secureplus-cli-2.119.0/supabase`, version `2.119.0`. CLI help was inspected before `init`, `start`, and `status`.

Disposable, unlinked workspace: `/tmp/secureplus-phase2b2-local.4enZ7G`. No production data, credentials, database connection, or migration was copied there.

```sh
/tmp/secureplus-cli-2.119.0/supabase init --workdir /tmp/secureplus-phase2b2-local.4enZ7G
env DOCKER_HOST=unix:///var/run/docker.sock /tmp/secureplus-cli-2.119.0/supabase start --workdir /tmp/secureplus-phase2b2-local.4enZ7G
env DOCKER_HOST=unix:///var/run/docker.sock /tmp/secureplus-cli-2.119.0/supabase status --workdir /tmp/secureplus-phase2b2-local.4enZ7G
```

Initialization passed. Both runtime commands exited 1. Startup returned `DockerLifecycleInspectError`; status returned `StatusDbInspectError` with `linked_project: null`. Shared cause:

```text
docker: command not found (podman also not found) — install Docker Desktop or Podman and ensure it is on PATH
```

Docker Desktop, OrbStack, Docker/Podman/Colima executables, and usual Docker sockets were absent. PostgreSQL was also unavailable. Live Supabase was not used as a substitute.

Both Supabase skills were applied. The current official [local development guide](https://supabase.com/docs/guides/local-development/cli-workflows) and [Supabase changelog](https://supabase.com/changelog) were consulted. The guide requires a running container runtime. No `link`, remote `db pull`, `db push`, migration application, or backfill was performed.

## 3. Migration changes and reasons

**No migration changes.** The existing unapplied `20261001170334_adaptive_learning_persistence_foundation.sql` remains a proposed 23-table foundation. Its 172 static checks pass, but PostgreSQL syntax, dependencies, trigger behavior, grants, RLS, and concurrency have not been executed.

The new decisions require database changes, especially Auth-user deletion and durable editorial actors. Making those changes without executing them would violate the brief's database-blocker fallback. Resume by modifying this unapplied migration, not by stacking corrective migrations.

The existing local SQL validation fixture creates synthetic human-approved versions and activates them. **Do not run that fixture unchanged under this phase's no-activation restriction.** Its fixtures must be revised and locally verified when database work resumes. No such fixture or activation was executed here.

## 4. Account-deletion resolution

The **policy decision is resolved; implementation is not**. Confirmed learner deletion must delete or irreversibly anonymize all owned adaptive sessions, answers, recommendations, interventions, tasks, projections, and private owner state. Shared catalogs must survive. Identifiable history must not remain associated with the deleted learner.

The existing restrictive Auth foreign keys and immutable delete guards can block that outcome. They were not changed or tested. A privileged atomic deletion mechanism must reconcile append-only ordinary operations with the account deletion promise, enforce a narrow owned scope, and prevent callers from forging deletion authority. Verify deletion of a synthetic learner with complete history plus survival of another learner and shared catalog before claiming this requirement complete.

## 5. Editorial-actor model

**Blocked, not implemented.** The next migration revision must add a durable private editorial actor independent of ordinary learner profiles. Approval rows should reference that durable actor. Login associations may be removed when the login account is deleted, while minimal approval provenance remains auditable.

Actor creation and approval authority must be server-controlled; learner `user_metadata` cannot grant it. No personal actor data should become accessible through the Data API. The private model, retention fields, grants, and deletion tests remain outstanding. No pending mapping was labelled human-approved.

## 6. Effective-publication resolver

Implemented pure server kernel: `server/adaptive/publication.mjs`. It takes trusted source assets and enhancement/normalization functions, then follows the current application order:

1. Authored/imported records and low-quality exclusions.
2. Captured snapshot upserts/disables.
3. Editorial retirement.
4. Existing MCQ enhancement → review → feedback, and PBQ review → enhancement.
5. Active overrides in supplied application order, including disables, captured-row protection, sort order, payload ID correction, and last-row precedence.
6. Remote PBQ normalization, retirement filter, reviewed cutoff, merge, and final enhancement when the remote capability is present.

Each source stage and final result records a SHA-256 fingerprint in provenance. These outputs contain private answer content and must not be returned directly to learners.

Tests execute the existing application override/merge functions as a separate oracle. Baseline equality covers all **395 active MCQs and 88 PBQs**. Fixtures cover captured and new overrides, disables, retirement, old/cutoff-equal/missing-date/new remote PBQs, conflicting override/remote content, and remote-disabled operation.

Verified current-state edge case: a non-retired remote PBQ can reappear after a local disable because the remote merge follows the local bank. This kernel preserves that behavior. Changing its precedence would be a separate product change.

**Remaining:** deployable trusted asset packaging, remote-source acquisition, atomic revision/catalog publication, historical revision retention, and publication authorization. Audit helpers evaluate trusted repository source solely as a local oracle; production modules do not import those helpers or evaluate request input. A final production publication service is not complete.

## 7. Stable answer-identity design

Implemented `server/adaptive/revision.mjs`, grammar `pilot-revision-v1`:

- MCQ and whole-choice PBQ IDs hash the question ID, component kind, and exact option text before display shuffling. Duplicate option text is rejected as ambiguous.
- Ordering PBQs retain authored item identity through a deterministic hashed ID; positions have separate stable IDs. Every position must reference one unique valid item.
- Option-indexed feedback and grading truth are normalized onto stable components. Reordering options with correspondingly reordered feedback and grading indices preserves the canonical signature and revision.
- Semantic content, feedback, and grading changes produce a new SHA-256 signature and deterministic version-8 UUID. Full content hashes must be checked alongside revision IDs when durable storage is implemented.
- Administrative sort order, remote update timestamps, and access metadata do not create answer revisions. Entitlement decisions remain external and unchanged.
- Learner views use an explicit allowlist and omit keys, expected answers, explanations, feedback, source payloads, and publication provenance.

All seven Phase 2A questions compile. `p211` and `p048` remain **coarse**, regardless of correctness. General SELECT & FILL, blanks, targets and other component grammars deliberately fail closed; they are not implemented or advertised as supported. No full-bank concept tagging occurred.

## 8. Trusted grading flow

Implemented **pure grading kernel only**. It checks revision integrity, validates stable selection membership and shape, computes whole-question correctness and a 0/1 score, and returns only correctness, score and precision. Displayed indices, foreign components, forged fields, invalid ordering, and altered revision/key payloads are rejected.

It does **not authenticate a caller**, load protected rows, authorize an owned manifest, resolve sealed mappings, or derive durable exposure history. Those are required responsibilities of the future transactional service. No endpoint was added, no protected-storage claim is made, and no service credential or connection string was introduced. The kernels are not imported by frontend or production API code.

## 9. Session transaction

**Not implemented or tested.** Required: authenticated owner resolution, transactionally allocated set index, pinned versions, immutable manifest, exact requested/actual composition, start event, complete rollback on any invalid item, and simultaneous session-start tests. Existing Phase 2B-1 contracts and static SQL checks remain supporting work only.

## 10. Evidence-ingestion transaction

**Not implemented or tested.** Required: one atomic transaction for owned manifest resolution, exact revision grading, sealed concept snapshot, full-history freshness, immutable evidence, owner generation increment, and projection invalidation. Independent PostgREST writes were not substituted for atomicity. Legacy attempts remain authoritative and untouched.

## 11. Idempotency and correction behavior

The existing pure persistence contract audit still passes normalized retry/conflict and correction filtering tests. This does not establish race safety. No real concurrent insert, replay response, unique-key conflict handler, correction transaction, or durable supersession chain was exercised.

The chronology preflight accepts a late correction using its original occurrence time and a later receipt time, and includes correction metadata in the input digest. It does not resolve corrections or replace the projection worker. Corrections must eventually append and supersede; overwriting evidence remains prohibited.

## 12. Intervention and review-task persistence

**Not implemented.** Existing pure contracts distinguish shown/opened/started/completed/skipped/dismissed/postponed/mapping-reported events and activity types, but no runtime persists or verifies them.

The future runtime must verify completion of lesson steps/checks, card review, and targeted practice through trusted criteria. Opening content and client completion claims are not verified completion. Interventions must never create positive mastery evidence. Persist deterministic transfer, original recall, delayed proof, maintenance and coverage-shortage tasks with both time and set-index gates, consistent with the Phase 2A scheduler.

## 13. Projection worker

**Not implemented.** The Phase 2A engine and Phase 2B-1 replay contracts still pass their deterministic synthetic tests. This delivery adds only chronology preflight; no database snapshot loader, receipt watermark transaction, projection/task commit, generation compare-and-swap, or durable retry worker exists.

Remaining replay work must resolve supersession, preserve complete exposure history when classifying novelty, honor complete-history boundaries, exclude legacy/coarse evidence from mastery, retain contradictions/sticky history/relapse, use pinned version payloads, and atomically publish only against an unchanged owner generation. No worker grants rewards or access.

## 14. Quarantine treatment for overlapping/offline sessions

Implemented pure `assessReplayChronology` with policy `chronology-quarantine-v1`. Input must eventually come from an authenticated owned database snapshot. It rejects foreign owners, mismatched set/session references, duplicate identities, and malformed timestamps.

It conservatively quarantines the supplied owner history when any of these machine-readable reasons apply:

- `session_clock_conflict`
- `trusted_set_order_conflict`
- `overlapping_sessions`
- `evidence_clock_conflict`
- `occurrence_set_order_conflict`
- `ambiguous_simultaneous_evidence`

An earlier open session overlapping a later one is ambiguous. Interrupted/resumed activity in a single session is permitted; resuming an earlier set after a later set produces quarantine. Out-of-order receipts and offline delayed delivery alone do not establish a conflict. No records are deleted, rewritten or retimed. Sorted original metadata yields an input-order-independent digest.

Preflight returns either `quarantined` or `ready_for_replay`, **never a ready projection**, and always `promotionAllowed: false`: only a future validated worker can make a promotion decision. Quarantine is tested locally but not persisted. Future changes to this treatment require a new algorithm/configuration version and an explicit policy binding in that version's payload. Existing Phase 2A versions were not silently rewritten.

## 15. Shadow feature flag and kill switch

Implemented unwired `server/adaptive/shadow.mjs`. Missing configuration denies writes. The runner requires all of:

```text
ADAPTIVE_SHADOW_WRITES_ENABLED=true
ADAPTIVE_SHADOW_WRITES_KILL_SWITCH=false
ADAPTIVE_RUNTIME_ENVIRONMENT=disposable_local
NODE_ENV must not be production
VERCEL_ENV must be absent
```

These values are used only as an injected in-memory test fixture. No environment file or deployment setting was changed. The browser supplies no configuration to the runner; it takes no request arguments. Production and Vercel environments are hard-denied even if the enable flag is set.

Environment configuration is reread before every operation. Set the enable flag to `false` or the kill switch to `true` to stop future starts; already running operations are not cancelled. There is no adaptive data to delete in this implementation. Failures return a safe failure status and log only a fixed code plus a random incident UUID. Raw exceptions, learner IDs and answer contents are not logged, and logger failures cannot escape.

This callback runner is **not a wired shadow integration**. Future legacy integration must commit its authoritative result before independently invoking authenticated adaptive work. No production route calls this module.

## 16. RLS and cross-user test results

**Actual RLS/REST tests unavailable.** The new tests reject cross-owner chronology inputs and foreign answer components in memory. The existing persistence tests reject forged owner/correctness/concept fields and unowned session references. These are JavaScript contract checks, not authenticated database tests.

The required two-user/two-device database tests, private grading-key reads, projection write denial, pending-catalog invisibility, user deletion, editorial privacy, and transaction rollback checks remain outstanding. No database isolation guarantee is inferred from static inspection.

## 17. Performance and concurrency results

**No database measurements available.** Session/ingestion latency, projection rebuild at small/medium/large histories, EXPLAIN plans, index use, lock ordering, duplicate races, concurrent set allocation and generation conflicts were not tested. Fast execution of the pure test suite is not a proxy for these measurements. No optimization or production-scale claim is made.

## 18. Files changed

| File | Purpose |
| --- | --- |
| `server/adaptive/publication.mjs` | Pure final-precedence resolver and provenance fingerprints |
| `server/adaptive/revision.mjs` | Pilot stable components, canonical revisions, safe views and grading |
| `server/adaptive/chronology.mjs` | Conservative deterministic chronology preflight |
| `server/adaptive/shadow.mjs` | Default-off local-only failure-isolated runner |
| `scripts/lib/read-authored-bank.mjs` | Expose raw authored/imported/exclusion assets to audit helpers; preserve existing reader behavior |
| `scripts/lib/read-publication-fixtures.mjs` | Existing application-function oracle for local tests |
| `scripts/audit-learning-runtime.mjs` | Publication, identity, grading, chronology, shadow and import-boundary tests |
| `package.json` | Add `audit:learning-runtime` |
| `docs/phase-2b2-shadow-runtime.md` | This status and verification report |

Unrelated `.gitignore`, Android, Capacitor, temporary Supabase files, audit artifacts, output and review exports remain outside the commit. No database migration, runtime API, UI, content mapping, algorithm/configuration payload or production flag changed.

## 19. Verification results

| Check | Result |
| --- | --- |
| CLI help/version and disposable `init` | PASS, CLI 2.119.0 |
| Local Supabase `start` / `status` | FAIL, missing Docker/Podman runtime |
| Local migration application, validation SQL, migration list | UNAVAILABLE, no local database |
| Local lint, database advisors, REST/RLS tests | UNAVAILABLE, no local database |
| `npm run audit:learning-runtime` | PASS, 39 pure scenarios; includes publication, stable-answer, grading, chronology and shadow tests |
| New authenticated grading, session/ingestion transactions, races, projection worker, deletion | NOT IMPLEMENTED / UNAVAILABLE under blocker fallback |
| `npm run audit:learning-persistence` | PASS, 20 contract scenarios |
| `npm run audit:learning-migration` | PASS, 172 **static** checks across 23 tables |
| `npm run audit:learning-pilot` | PASS, replay/validation/non-attribution/caps/determinism and pilot inventory |
| `npm run build` | PASS; existing large-bundle warning remains |
| `npm run audit` | PASS, all eight included audits |
| `audit:launch`, `audit:coins`, `audit:engagement` | PASS as part of `npm run audit` |
| `audit:seo`, `audit:pwa`, `audit:deep-dives` | PASS as part of `npm run audit` |
| `audit:editorial` | PASS as part of `npm run audit`; 395 MCQs / 88 PBQs / 32 lessons / 171 generated practice questions |
| `audit:qbank:strict` | PASS as part of `npm run audit` |
| `git diff --check` | PASS |
| Final read-only live metadata comparison | PASS, exact equality with this run's starting metadata snapshot and event-trigger inventory |

Build and audit logs are temporary local files `/tmp/secureplus-phase2b2-{build,audit,runtime}.log`, not committed artifacts. Tests do not certify factual content accuracy or live database coverage.

Read-only live comparison used `supabase/validation/adaptive-live-baseline.sql`, executing its catalog SELECT and supplemental event-trigger SELECT separately. Final metadata is unchanged: **16 public tables, 35 policies, 47 indexes, 74 constraints, and seven event triggers**. The full compared object also includes columns/defaults, function definitions, grants/default ACLs, regular triggers, and exposed API settings where visible. There is no adaptive schema and the read-only migration inventory is empty. No learner records or private answer payloads were fetched. This confirms the compared schema metadata remained unchanged; it is not a production data audit.

## 20. Remaining risks

The blocking risk is an unexecuted persistence design, including known deletion incompatibility. Neither this report nor passing JavaScript/static audits makes it deployable. Server asset packaging and authenticated transactional boundaries remain absent. New canonical UUID revisions also need an explicit bridge to the Phase 2A content-hash mappings; existing mappings were not silently repointed. Unsupported PBQ grammars fail closed. Chronology policy must be pinned and stored consistently with the future worker. Original SQL fixtures must be aligned with the no-activation restriction before execution. RTO variant coverage is still insufficient; no extra transfer variants were fabricated.

## 21. Exact live-deployment plan

**There is no executable live deployment package yet. Do not apply the current migration.** Required sequence before proposing live deployment:

1. Obtain the requested container-runtime installation authorization or use an already authorized working local runtime. Start a disposable unlinked Supabase stack with synthetic data only.
2. Resume database-dependent work: repair the unapplied migration, implement deletion and private actors, align non-activating SQL fixtures, and execute migration/validation/lint plus actual API-role tests.
3. Implement trusted asset packaging, protected grading, atomic sessions/ingestion/corrections, intervention verification, task persistence and generation-safe projection rebuilding. Persist only a pending, inactive local pilot.
4. Run the full two-user/two-device ownership, retry/race, correction, offline chronology, deletion and performance matrix. Document results and query plans. Rerun all applicable audits and a read-only live metadata diff.
5. Deliver a reviewed, complete package with tested migration/rollback instructions and obtain **separate explicit live migration approval**. Reconcile current live schema drift and existing integration mismatches first.
6. Only after that approval, arrange an appropriate backup/recovery point and apply the reviewed additive migration through the approved migration mechanism. Verify grants/RLS/private API exposure and leave all production versions inactive and shadow writes disabled.
7. Any production shadow cohort or activation requires a subsequent explicit instruction, human-reviewed mapping approval, version activation authorization, monitoring/retention decisions, and a separately reviewed change to the hard production-deny guard. None is part of this delivery.

## 22. Rollback and disable procedure

No live rollback is needed: no live mutation occurred. The new kernels have no production caller. To remove this partial package, revert only its task commit while preserving unrelated changes. Do not delete or modify production data.

For future local callback use, set `ADAPTIVE_SHADOW_WRITES_ENABLED=false` or `ADAPTIVE_SHADOW_WRITES_KILL_SWITCH=true`; future operations stop without deleting evidence. A future live implementation must document and test connection/pool behavior, in-flight transactions, generation recovery, actor retention and account deletion before rollout. Do not use destructive schema rollback as a substitute for disabling writes.

## 23. Founder approvals required before live deployment

The immediate prerequisite is explicit approval to install a container runtime; this comes from the user's brief, not an inferred skill approval requirement. Until supplied, the database-dependent portion remains blocked.

Later approvals must cover the completed tested live migration, human editorial review and version approval, any shadow cohort, and any activation/learner-facing rollout. Phase 2A thresholds remain provisional. The learner-deletion and editorial-separation product decisions are already authorized and do not need to be reopened; their implementation still requires local proof.

**Delivery status remains Phase 2B-2 incomplete. No live shadow rollout is authorized or underway.**
