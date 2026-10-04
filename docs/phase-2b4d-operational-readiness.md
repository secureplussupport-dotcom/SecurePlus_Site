# Phase 2B-4D — operational readiness

Date: **4 October 2026, Asia/Singapore**. Starting commit: `cf196f8786d0392e051ae9c30084d606f46947e6`.

## Verdict: READY FOR PHASE 2B-5

The **local** operational gate passes: target-engine migration/recovery, restricted-role and API checks, backup-erasure reconciliation, central kill drills, bounded concurrency, monitoring contracts and all earlier regression suites pass. **Production remains NOT READY.** No live migration, deployment, production credential creation/change, runtime activation, version approval, cohort, learner behavior, pricing/legal or Phase 3 change occurred.

The Phase 2B-4C report and migration SHA-256 values matched the supplied baseline exactly. The master plan remains the product authority; the Phase 1 audit supplies its dated current-state evidence. No unresolved product conflict was used to change behavior. This package extends local operations without wiring a browser, API route or cron.

## Environment and parity

Read-only project metadata and SQL confirmed live release **17.6.1.113**, PostgreSQL **17.6**, `aarch64-unknown-linux-gnu`, GCC **15.2.0**, 64-bit. The official Docker Hub `supabase/postgres:17.6.1.113` image is pinned at:

`sha256:4c39816ce8d9303a3aba1161c842929c73a40c7109a9ef1b644582478e31832e`

The disposable image reports the same engine build and all five installed extension versions: `plpgsql 1.0`, `uuid-ossp 1.1`, `pgcrypto 1.3`, `pg_stat_statements 1.11`, `supabase_vault 0.3.1`. The migration principal `postgres` is **not a superuser**, matching the target. It can reference `auth.users` but cannot create Auth tables. Synthetic Auth scaffolding and full restore use separate local `supabase_admin` authority; runtime roles do not receive it.

CLI **2.119.0**, Node **24.15.0**, arm64 Docker VM with **4 CPUs / 8,307,175,424 bytes memory**. The target container is `secureplus-4d-pg176`, loopback port 55442, isolated database `adaptive_4d_rehearsal`. API rehearsal uses local PostgREST **v16.4** on loopback 55443. The established full Auth/REST/GraphQL regression stack remains separate on PostgreSQL **17.11**, `/tmp/secureplus-phase2b2-resume.5kVVpr`.

**Engine/build/installed-extension parity is established. Managed-platform parity is not.** The fixture reproduces relevant predecessor tables and synthetic MCQ, PBQ and profile data, not the entire live application/Auth schema. Actual managed Auth/PostgREST service releases, pooler/TLS, external API configuration, network policies, lifecycle and PITR are not established by this image. The live catalog has an additional `ensure_rls` event trigger; the adaptive chain explicitly enables RLS and the difference is recorded. Null catalog `pgrst` settings do not prove external gateway configuration. These remain distinct live gates, not silently passed compatibility claims.

The target lint diagnostic temporarily adds `plpgsql_check` with local recovery authority; ordinary `postgres` correctly cannot install that extension. It is diagnostic tooling, not a runtime migration or part of the five-extension parity claim. Local TCP is explicitly plaintext; TLS verification remains mandatory for a future managed-pooler adapter.

## Architecture and trust boundary

```mermaid
flowchart LR
  S[Unwired scheduler] --> C[Uncached central control read]
  C --> Q[Durable claim]
  Q --> B[Database shared control barrier]
  B --> O[Owner lock and current lease]
  O --> M[Complete pinned model]
  M --> P[Tasks and fenced publication]
  K[Administrative disable] --> X[Exclusive barrier / epoch advance]
  X --> F[Invalidate old leases]
  R[Quarantined fresh restore] --> J[External erasure journal]
  J --> E[Reconcile and verify all owner links]
  E --> A[Separate operator readmission]
```

`runtime_control` is private, RLS-enabled and seeded **disabled**. Runtime roles cannot read its raw table or enable it. A narrow reader returns only control state/epoch/times. Positive responses are not cached; unavailable, malformed, expired or clock-stale responses fail closed. The existing production/Vercel hard deny remains intact.

SQL acceptance and lease validation acquire a shared advisory transaction barrier **before owner locks**. Administrative disable takes the exclusive barrier, advances the epoch and invalidates active leases. It touches jobs only after earlier guarded transactions finish. A previous transaction may commit before disable obtains the barrier; after the disable transaction commits, no old process can claim, publish or acknowledge under its old fence. A timed-out disable is **unconfirmed**, not successful containment. Expired control is checked at statement/lease boundaries; the transaction already admitted before expiry is not magically cancelled.

The setter is granted to no runtime role. Enable TTL is bounded to 1–3,600 seconds; default 60 seconds. Renewing it advances the epoch and fences leases. Deletion, withdrawal and recovery remain available while learning work is disabled. The model, owner lock, generation protocol, immutable session plans and previous resource limits are preserved.

## Migration rehearsal and inventory

The full chain ran twice from fresh representative pre-adaptive data. Existing MCQ miss/success, coarse PBQ history and profile/subscription sentinel values survived unchanged. Each migration and its checksum-journal entry committed atomically. Re-running the deployment runner skipped matching committed entries; changed checksums failed. Raw DDL is not claimed to be idempotent.

| Migration | SHA-256 | First / second run ms |
| --- | --- | --- |
| `20261001170334_adaptive_learning_persistence_foundation.sql` | `35a3161ee7023b808ad0b88eb9b2534025adf4365e45883191c72fc2884a7790` | 59 / 68 |
| `20261002232053_adaptive_deletion_shadow_isolation.sql` | `d02f367614388d0145a1b68772c9f0873b05f2919ff5710a5fa45ef68f28be9b` | 12 / 14 |
| `20261003043634_adaptive_durable_runtime.sql` | `2e81d681c1b648850372f5a34c6f64d0481338d1b303ca844f47584de1c4634a` | 16 / 16 |
| `20261003200440_adaptive_trusted_learning_runtime.sql` | `528821f54cd881b23e6ef2fffe1f3cb704a206def618407714abdc9fae562866` | 7 / 9 |
| `20261004072830_adaptive_operational_controls.sql` | `e46f7fef2e8b07924a05646f6499055986afbef453581aeca0adb8bd7ffaad28` | 4 / 3 |

The default migration budgets are 1 second of lock waiting and 10 seconds per statement. Failure drills deliberately reduce them: statement-timeout failure took **234 ms** including preceding DDL; lock-timeout failure took **106 ms**. The tests require SQLSTATE `57014` and `55P03`, respectively. Killing an actual migration backend during its open transaction also left no adaptive schema or committed migration entry. Retrying the unchanged chain succeeded.

The evidence inventory records all adaptive columns, constraints, indexes, triggers, function-body digests, definer ownership/search paths, table/function ACLs, PUBLIC execution, RLS policies, role attributes/memberships and extension versions. Fresh resets produced identical inventories. New and prior migrations remain additive; prior migration files were not edited.

Rollback decision: abort and verify atomic rollback before commit; after commit keep runtime disabled and use a reviewed roll-forward migration. Do not rewrite committed migrations or run destructive down migrations. Disaster restore is quarantined and reconciled, not a normal feature rollback.

## Recovery and kill evidence

| Boundary | Actual proof | Recovery |
| --- | --- | --- |
| claim | SIGKILL after durable claim | 158 ms; 2 subsequent claims |
| compute | SIGKILL after full pinned computation inside its transaction | 147 ms; 2 subsequent claims |
| publication | SIGKILL after current-generation publication, before acknowledgment | 76 ms; 1 subsequent claims |
| ack | SIGKILL after acknowledgment | 4 ms; 0 subsequent claims |
| scheduler | SIGKILL during authenticated local scheduler drain after claim | 143 ms; 2 subsequent claims |
| database_restart | Actual Docker database stop/start with a live durable lease | 1749 ms |

Crash cases retained exactly two unique review tasks and a current-generation projection. Old leases could not acknowledge. The new crash matrix expires selected synthetic leases administratively to avoid five serial 30-second waits; the earlier infrastructure suite still performs the actual 30-second wall-clock expiry test. These recovery timings exclude that artificial lease-aging step and are not RTO guarantees.

The ordinary transaction-barrier drill acknowledged disable after **261 ms**, waiting for the admitted transaction. A separate real full-model child paused during computation; disable remained pending until process death rolled back the transaction, then old publication/acknowledgment was fenced. Re-enable converged without duplicate tasks. Tests also cover default-off, stale control, new ingestion rejection, global two-lease cap, owner serialization, overlapping scheduler calls, invalid learner scheduler authority, queued/retry work, durable dead-letter/quarantine and observable aggregate states.

## Backup and erasure reconciliation

A real custom-format `pg_dump` captured an **older, enabled** database with synthetic owner graphs. The erasure intent, HMAC key and trusted newest checkpoint lived outside that backup, with restricted file permissions. The append-only journal checks sequence/chain/HMAC, bounds bytes/rows, rejects symlinks and concurrent writers, and fails closed on missing authority, tampering or an older checkpoint. It is sensitive recovery data, never telemetry. Production single-writer custody, checkpoint durability/replication and legal retention remain unresolved operational dependencies.

Before restore, runtime logins were set NOLOGIN and their sessions terminated. Restore into a **fresh** database used local recovery authority. The test confirmed the backup actually resurrected the erased graph and stale enabled control, while runtime login was still denied. The operator forced central disable, authenticated the external checkpoint and replayed erasure. Every owner-linked table was checked dynamically, including plans, proofs, evidence, sessions/events, recommendations, tasks/events, projections, jobs, owner state and enrollment. Incomplete erasure resumed from its committed stage; re-enrollment received a different UUID. Completed receipts retain no owner link; runtime receipts are aggregate-only.

A material defect was found in the initial rehearsal: restoring into the existing database let pre-existing default ACLs grant client table access. The passing procedure uses a fresh target, verifies restored adaptive ACLs and PUBLIC function denial, and then proves denial through working HTTP requests. This was fixed in the recovery procedure, not hidden by accepting empty RLS results.

Actual managed backup/PITR, off-host copies, retention/disposal policy, journal/key custody, Auth-session reconciliation, Stripe and Storage cleanup still require their separately approved integration. No legal approval or policy was fabricated.

## Load method and measured limits

Each workload first ingests complete immutable synthetic history, then measures the full model, snapshot, derived writes, generation follow-up, publication and acknowledgment. One shared connection per purpose is enforced through separate real restricted logins; simultaneous owners contend for those pools and the global two-lease cap. Database sampling checks connection and lease counts every 20 ms. Purpose pools are cold at first use; the remaining runs are warm. This is a direct local TCP rehearsal, not a pooler capacity test.

| Answers per owner | Concurrent owners / samples | Batch replay ms | Owner latency min–max ms | Completed owners/s | Peak purpose connections / leases |
| --- | --- | --- | --- | --- | --- |
| 10 | 1 / 1 | 208 | 202–202 | 4.81 | 2 / 1 |
| 10 | 2 / 2 | 317 | 315–317 | 6.31 | 2 / 2 |
| 10 | 4 / 4 | 626 | 312–626 | 6.39 | 2 / 2 |
| 500 | 1 / 1 | 241 | 241–241 | 4.15 | 2 / 1 |
| 500 | 2 / 2 | 445 | 443–445 | 4.49 | 2 / 2 |
| 500 | 4 / 4 | 870 | 466–870 | 4.6 | 2 / 2 |

Cold full replay: **176 ms**, two claims. All 14 measured owners converged in two claims; no load failure or duplicate output occurred. Ingestion timings are retained separately in the machine-readable evidence; they are excluded from replay throughput. No percentiles are claimed for 1/2/4 samples. The observed range is not a tail-latency bound.

**Tested ceiling:** four concurrent owners, 500 retained answers each, one connection per purpose, two active leases. **Conservative next local operating budget:** two concurrent owners at this history size (50% of tested owner concurrency), retaining the two-lease cap. This is a local safety margin, not an extrapolated production capacity or maximum sustainable throughput. Larger history limits remain fail-closed at 10,000 answers / 2,000 sessions / 8 MiB snapshot, with a 2-second isolated model deadline and 128/32 MiB worker heap-generation limits. Production instance count, memory, pooler and scheduler overlap need their own budgets.

## Monitoring and alerts

The SQL snapshot exposes fixed aggregate gauges only. The JavaScript monitor accepts fixed events, discards incident/owner/job IDs and arbitrary fields, bounds numeric values, uses a five-minute/10,000-event window and signals saturation. It emits p95 only with at least 20 successful observations. Existing drain events now record actual publication-phase elapsed time; full replay timings above include both generation phases. Alert output has only fixed code, severity and threshold.

| Alert code | Trigger | Severity |
| --- | --- | --- |
| `queue_backlog` | `queueDepth` ≥ 100 | warning |
| `queue_age` | `oldestEligibleMs` ≥ 60000 | critical |
| `global_lease_limit` | `leases` ≥ 3 | critical |
| `expired_lease` | `expiredLeases` ≥ 1 | warning |
| `retry_backlog` | `retryDepth` ≥ 20 | warning |
| `dead_letter` | `deadLetters` ≥ 1 | critical |
| `quarantine` | `quarantined` ≥ 1 | warning |
| `erasure_age` | `oldestErasureMs` ≥ 60000 | critical |
| `expiry_backlog` | `expiryBacklog` ≥ 20 | warning |
| `retention_backlog` | `retentionBacklog` ≥ 1000 | warning |
| `lease_recovery` | `leaseRecoveries` ≥ 5 | warning |
| `generation_churn` | `generationConflicts` ≥ 100 | warning |
| `scheduler_denial` | `schedulerDenials` ≥ 10 | warning |
| `connection_failure` | `connectionFailures` ≥ 1 | critical |
| `projection_failure` | `projectionFailures` ≥ 1 | critical |
| `projection_slow` | `projectionP95Ms` ≥ 1000 | warning |
| `kill_violation` | `acceptedAfterKill` ≥ 1 | critical |
| `connection_budget` | `purposeConnections` ≥ 4 | critical |

The sampled fault-injection run raises expected dead-letter, quarantine, lease-recovery and revoked-credential connection-failure alerts; these are not load failure rates. Scheduler denial and connection failures are exercised against actual local boundaries. Kill violations remain zero; direct database tests prove no new ingestion/claim/publication after acknowledged disable. Deterministic unit tests check every threshold below/at its boundary and reject unknown/nonfinite/negative metric input. Real alert routing, paging, delivery guarantees, aggregation across instances and operational ownership remain absent.

## Validation and evidence package

| Check | Result |
| --- | --- |
| Exact-version operational database/process rehearsal | PASS, 80 assertions |
| Target PostgreSQL 17.6 + PostgREST HTTP isolation | PASS, 75 assertions; working control, real signed synthetic owners and anonymous requests |
| Control/monitor/journal tests | PASS, 5 tests including threshold boundaries and journal tampering |
| Earlier durable infrastructure | PASS, 116 assertions |
| Earlier trusted plans and complete model | PASS, 103 assertions |
| Earlier deletion/shadow isolation | PASS, 262 assertions, including the new private control table |
| Database / database boundary / pure boundary | PASS, 26 / 18 / 15 |
| Runtime / persistence / migration / pilot | PASS, 40 tests / 20 scenarios / 213 prior static checks / all pilot checks |
| Fresh five-migration reset and rollback SQL suites | PASS |
| Database lint on 17.6 and 17.11 | PASS, zero findings |
| Advisors on 17.6 | Zero WARN/ERROR; 64 INFO: 54 unused indexes, 8 policyless RLS tables, 2 unindexed fixture foreign keys |
| Advisors on 17.11 CLI fixture | Zero WARN/ERROR; 45 INFO: 38 unused indexes, 7 policyless RLS tables |
| Production build and all eight site audits | PASS; existing large-bundle warning |
| Source/bundle isolation and diff checks | PASS; existing UI/routes/account/deployment files and all earlier migrations unchanged |

INFO findings describe small synthetic workloads and intentionally inaccessible private/fixture tables. They do not prove production index usefulness. The two unindexed foreign keys belong to synthetic predecessor `attempts` and `account_deletion_requests`, not the adaptive migration. Prior static checks remain 213; new migration behavior is established by actual reset, SQL, role/process/recovery and API tests, not by claiming new static coverage.

Evidence files:

- [Validation counts, diagnostic summaries and transcript hashes](evidence/phase-2b4d/validation.json)
- [Target parity and limitations](evidence/phase-2b4d/target-parity.json)
- [Full migration/security/schema inventory and timings](evidence/phase-2b4d/migration.json)
- [Recovery matrix and kill timing](evidence/phase-2b4d/recovery.json)
- [Load runs and aggregate alerts](evidence/phase-2b4d/load.json)
- [Operational assertions and migration checksums](evidence/phase-2b4d/result.json)
- [Target API results](evidence/phase-2b4d/target-api.json)
- [Operations runbook](phase-2b4d-operations-runbook.md)

Reproduction: pull the pinned official image; run `node scripts/start-learning-rehearsal.mjs`, then `npm run audit:learning-operations:database`, `node scripts/audit-learning-target-api.mjs` and `npm run audit:learning-operations`. The destructive reset runner checks the exact disposable container/image and uses only its fixed loopback database. It must not be adapted to accept arbitrary remote URLs. Test passwords/journal files/backups stay outside Git. Final read-only inspection still found PostgreSQL 17.6 with no adaptive schema, adaptive public relation or adaptive role in production. For the established full-stack regression matrix, install all five migrations in an unlinked CLI workdir, reset locally, explicitly enable only its synthetic control for the test duration, run both rollback SQL suites and every earlier learning audit, then lint/advisors/build/site scans. Return local control to disabled afterward.

## Remaining production gates

1. Human migration/security review and explicit live authorization; target schema/event-trigger/default-ACL reconciliation and a reviewed production deployment mechanism.
2. Actual purpose credentials and pooler/TLS handshake, rotation/revocation, process lifecycle and total connection/instance budgets.
3. Real scheduler signature/provider and central-control operator integration, alert routing, escalation ownership and on-call acknowledgment.
4. Managed backup/PITR restore with independent erasure ledger/checkpoint custody, off-host retention and external Auth/Stripe/Storage reconciliation.
5. Real editorial/scenario coverage, approved model/configuration and completion criteria, cohort/retention/observation budgets and signed acceptance criteria.

The next local gate is Phase 2B-5 under its approved brief. This verdict is not permission to migrate, deploy, activate shadow writes or change learners' experience.

Documentation reviewed: [Supabase backup/restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore), [RLS and grants](https://supabase.com/docs/guides/database/postgres/row-level-security), [database functions](https://supabase.com/docs/guides/database/functions), [Data API grant change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically), [PostgreSQL minor-version change](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes). Matching an older target engine is compatibility evidence, not approval to leave that production version unchanged indefinitely.
