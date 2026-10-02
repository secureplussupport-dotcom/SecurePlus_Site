# Phase 2B-2: adaptive shadow-runtime foundation

Date: 2026-10-02. Starting commit: `a2efefd` on `main`.

## Executive status

**LOCAL FOUNDATION COMPLETE; NOT DEPLOYED OR PRODUCTION-READY.**

The additive migration and runtime foundation now execute against a disposable local Supabase stack. The work proves the core database boundary, transaction behavior, real Data API isolation, protected grading, idempotency, recommendation/intervention/task persistence, projection publication, quarantine, and learner deletion. It remains deliberately disconnected from the application and production Supabase.

| Required boundary | Result |
| --- | --- |
| Migration executed locally | PASS on PostgreSQL 17.11 |
| SQL validation fixture | PASS; all synthetic changes rolled back |
| Real REST/JWT/RLS tests | PASS with two synthetic users |
| Database concurrency | PASS for set allocation and identical answer retries |
| Live Supabase mutations | None |
| Production shadow writes | Disabled and hard-denied |
| Application/API/UI wiring | None |
| Learner-visible behavior | Unchanged |
| Production versions activated | None |

This phase completes a testable local persistence package. It does not authorize a live migration, a learner cohort, production shadow writes, mastery promotion, or any change to legacy scoring and rewards.

## Local environment

- Host: Darwin arm64
- Node: `v24.15.0`; npm: `11.12.1`
- Supabase CLI: `2.119.0`
- Container runtime: Colima with Docker CLI
- Local PostgreSQL: `17.11`
- Disposable unlinked workspace: `/tmp/secureplus-phase2b2-resume.5kVVpr`

The first Docker Desktop attempt could not complete its privileged helper installation without an administrator password. Colima supplied the compatible local container runtime instead. No production credentials or learner data were used.

Current Supabase local-development, RLS, changelog, and PostgreSQL breaking-change guidance was reviewed. The migration does not use the affected PostgreSQL 17 features identified in that guidance.

## Migration and data model

The revised migration creates 24 additive tables across `public` and `adaptive_private`. It modifies no existing application table.

Material changes from the earlier proposal:

- Durable private editorial actors are independent of ordinary Auth accounts. Removing an editor login clears the optional login association while preserving minimal approval provenance.
- Human-approved records and version lifecycle events require an active durable human editorial actor.
- `model_revision_key` bridges the canonical runtime UUID revision to the Phase 2A content-hash mapping.
- New sessions require an active human-approved version set, and every manifest revision must be actively published.
- Recommendation, intervention, review-task, task-event, and projection integrity are enforced by database triggers.
- Owner replay status, quarantine reasons, replay digest, replay time, generation, and complete-evidence boundary are durable.
- Foreign-key indexes were added for the database advisor findings.
- A narrow private account-deletion function removes one learner's adaptive graph atomically while preserving shared catalogue and editorial history.

The migration contains no production catalogue seed and activates no real version. Synthetic activation occurs only in disposable tests and is removed by reset or transaction rollback.

## Runtime modules

### Database boundary

`server/adaptive/database.mjs` uses the pinned `postgres@3.4.9` driver. A direct pool is allowed only when `ADAPTIVE_RUNTIME_ENVIRONMENT=disposable_local`, the URL is loopback, and neither production nor Vercel is active. This intentionally prevents the local validation adapter from becoming an accidental production database path.

### Transactional persistence

`server/adaptive/persistence.mjs` implements:

- Server-allocated per-owner set indices and immutable manifests.
- Grading from the protected compiled revision stored in the private schema.
- Stable answer validation and server-derived exposure classification.
- Concurrent idempotent answer handling: identical retries return the original result; conflicting reuse is rejected.
- Append-only corrections that preserve the original occurrence classification.
- Deterministic recommendation and review-task identity.
- Content-compatible interventions with injected trusted completion verification.
- Review-task events whose completion evidence must satisfy the time gate, set-index gate, version identity, concept, target revision, direct precision, and correctness requirements.

The new executable audit exposed and fixed a first-insert recommendation bug: the insert did not return the fields immediately used for identity verification. Both initial insertion and deterministic retry now execute successfully against PostgreSQL.

### Projection worker

`server/adaptive/projection-worker.mjs`:

- Locks one owner's replay state.
- Loads a versioned immutable snapshot.
- Runs chronology assessment before projection.
- Persists machine-readable quarantine instead of projecting ambiguous overlapping histories.
- Calls an injected version-pinned projector.
- Publishes cache rows only for the unchanged evidence generation.
- Always returns `promotionAllowed: false`.

The local database audit verifies both branches: overlapping sessions persist quarantine, while a clean single-session history publishes a `ready` `learning_signal` projection. This worker is a cache rebuilder; it does not grant access, coins, rewards, or mastery promotion.

## Account deletion and editorial provenance

`adaptive_private.delete_learner_data(uuid)` is a private `SECURITY DEFINER` function with a blank search path, advisory owner lock, transaction-scoped deletion authority, explicit table list, and service-role-only execution. Ordinary history remains immutable.

Executable checks prove that:

- The selected learner's sessions, evidence, recommendations, interventions, tasks, projections, and owner state are removed.
- A second learner survives.
- Shared concepts, revisions, mappings, and versions survive.
- Deleting the editor's Auth login sets the private actor login association to null.
- Approval provenance continues to reference the durable actor.

This is a hard-delete design for adaptive learner records. The live product's broader account-deletion flow still needs a separately reviewed integration transaction before deployment.

## RLS and API isolation

The local audit signs real JWTs and calls the local PostgREST endpoint. It verifies:

- An owner can read their own adaptive session rows.
- A different authenticated user receives no owner rows.
- A pending version is hidden.
- An authenticated browser cannot insert adaptive evidence.
- The private grading schema is unavailable through the Data API.
- Anonymous catalogue reads are denied.

Database security advisors report four informational `rls_enabled_no_policy` notices for private service-only tables: editorial actors, grading keys, owner state, and version payloads. These tables have RLS enabled, no client grants, and no client policy by design. No warning or error-level security finding was reported.

## Database integrity and concurrency evidence

The executable database audit covers 28 assertions:

- Two concurrent session starts allocate distinct set indices.
- Two concurrent identical answers resolve to one insert plus one retry.
- Reusing the client event ID with different content is rejected.
- Protected grading returns the expected wrong/correct results.
- Corrections append and preserve historical classification.
- Exposure history classifies a related scenario as `same_scenario`.
- Recommendation insertion and deterministic retry succeed.
- Trusted lesson completion persists as verified.
- Original-recall task completion accepts only qualifying evidence.
- Overlapping session chronology persists quarantine.
- Clean chronology publishes a generation-matched ready projection.
- RLS/API, index use, deletion, and durable actor behavior pass.

`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` confirms that the owner replay query uses `adaptive_evidence_owner_time`. Performance advisors show only expected unused-index information on the freshly reset database; prior unindexed-foreign-key findings are resolved.

This is correctness and query-plan evidence on a tiny synthetic data set. It is not a production latency, throughput, pool-capacity, or large-history benchmark.

## Verification matrix

| Check | Result |
| --- | --- |
| `supabase db reset --local` | PASS; migration applies on PostgreSQL 17.11 |
| `adaptive-local-checks.sql` | PASS; synthetic changes rolled back |
| `supabase db lint --local --schema public,adaptive_private --level warning --fail-on error` | PASS; no schema errors |
| Supabase security advisors | PASS; four intentional private-table info notices only |
| Supabase performance advisors | PASS; fresh-database unused-index info only |
| `npm run audit:learning-database` | PASS; 28 executable assertions |
| `npm run audit:learning-runtime` | PASS; 40 pure scenarios |
| `npm run audit:learning-persistence` | PASS; 20 contract scenarios |
| `npm run audit:learning-migration` | PASS; 189 static checks across 24 tables |
| `npm run audit:learning-pilot` | PASS |
| `npm run build` | PASS; existing large-bundle warning |
| `npm run audit` | PASS |
| `git diff --check` | PASS |

`npm audit --omit=dev` still reports one low and one moderate transitive advisory through the existing pinned `posthog-js@1.395.0` dependency (`dompurify` and `fflate`). The new pinned `postgres` dependency is not the source. Updating analytics dependencies is separate work because it can change production tracking behavior.

## Files in this continuation

| File | Purpose |
| --- | --- |
| `supabase/migrations/20261001170334_adaptive_learning_persistence_foundation.sql` | Revised 24-table persistence, actors, integrity, deletion, indexes, grants and RLS |
| `supabase/validation/adaptive-local-checks.sql` | Transactional local SQL assertions and rollback |
| `server/adaptive/database.mjs` | Disposable-local direct database gate and pool |
| `server/adaptive/persistence.mjs` | Trusted transaction and persistence services |
| `server/adaptive/projection-worker.mjs` | Owner-locked quarantine and projection publication |
| `scripts/audit-learning-database.mjs` | Executable PostgreSQL, REST/RLS and concurrency audit |
| `scripts/audit-learning-runtime.mjs` | Adds production-deny database-boundary coverage |
| `scripts/audit-learning-migration.mjs` | Updated 24-table static guard audit |
| `package.json`, `package-lock.json` | Database audit command and pinned driver |
| `docs/phase-2b2-shadow-runtime.md` | This evidence and deployment boundary |

Unrelated Android, Capacitor, generated artifacts, output, review exports, `.gitignore`, and Supabase temporary files remain outside the task commit.

## Remaining risks and next gate

The main risk has shifted from an unexecuted database design to an unintegrated local foundation. Before any live deployment:

1. Human-review the migration, runtime boundaries, deletion semantics, and this evidence report.
2. Reconcile the migration against current live schema metadata and create a reviewed backup/rollback runbook.
3. Decide the production server execution architecture. The current direct database adapter intentionally hard-denies production and must not be weakened casually.
4. Prepare human-approved mapping, algorithm, configuration, question, and content publication payloads. No agent may self-approve them.
5. Obtain separate explicit approval for the live additive migration. Apply it with all versions inactive and shadow writes disabled.
6. Re-run grants, RLS, private-schema exposure, deletion, and query-plan checks in the approved environment using synthetic accounts.
7. Obtain a later, separate approval for a bounded shadow cohort, monitoring, retention, incident response, and kill-switch operation.

Do not move directly to Phase 2C learner-facing personalization. The commercially important moat is the quality of the learning loop, but shipping an opaque algorithm without production observability and reviewed concept mappings creates trust and retention risk. The next investable milestone is a safe, measurable shadow cohort with zero influence on learner outcomes.

## Disable and rollback

There is no live rollback because no live mutation occurred. The modules have no production caller.

For future local shadow execution, set `ADAPTIVE_SHADOW_WRITES_ENABLED=false` or `ADAPTIVE_SHADOW_WRITES_KILL_SWITCH=true`. The current runtime also refuses production and Vercel environments. A future live rollout must use disable-first operations; destructive schema rollback must not be the incident response.

**Final Phase 2B-2 status: locally complete and evidence-backed; not deployed, not learner-visible, and not authorized for production shadow use.**
