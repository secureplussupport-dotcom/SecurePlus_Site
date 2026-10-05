# Adaptive runtime operations runbook — local rehearsal only

This runbook grants no production permission. The runtime is unwired and default-off. No named operator or approval is assumed. Operational owner, incident commander, security reviewer, privacy/retention owner and backup custodian: **unassigned; required before live use**.

## Deployment prechecks

1. Confirm the approved commit and SHA-256 of every migration, in chronological order. Reject unknown, changed or missing history. Never rerun raw non-idempotent DDL against an already migrated database. The local rehearsal journals the checksum atomically with each migration's transaction; a matching committed entry is a no-op.
2. Record actual PostgreSQL build, extensions, migration-owner privileges, role memberships, default ACLs, PUBLIC function privileges, exposed schemas, RLS, definer owner/search path and schema drift. Review target event triggers as well as ordinary table triggers. The local target image is pinned by digest; synthetic application/Auth fixtures are not a copy of production data.
3. Verify backup readability and restore to a quarantined disposable target. Keep the current erasure journal, signing key and trusted checkpoint outside database backups. A backup is not a recovery proof until restored and reconciled.
4. Set central control off. Ensure no public route, cron, learner path or production environment can invoke this local package. Verify the rollback selector remains the existing product implementation.
5. Run migration preflight with lock and statement budgets. On timeout or interrupted connection, inspect the transaction and migration journal; do not blindly retry a partially understood state. Review checksums again before an explicit retry.

## Purpose roles and credentials

The migration creates no passwords. Rehearsal provisions separate disposable `adaptive_ingest_login`, `adaptive_worker_login` and `adaptive_erasure_login` roles, each NOINHERIT and with only its matching capability membership; none is superuser, BYPASSRLS, CREATEDB or CREATEROLE. Each process pool permits one connection per purpose. Administrative migration/recovery authority is separate.

Before live work: provision reviewed real logins, verify only the intended membership, validate the actual transaction-pooler hostname/port and TLS chain/CA with certificate verification enabled, disable prepared statements, test role and timeout reset each transaction, test suspension/reconnect, and establish total instance/connection budgets. The direct local TCP test does not satisfy managed pooler/TLS or platform lifecycle gates.

Rotation procedure: disable control; drain/close old pools; provision a replacement secret through an approved secret manager; verify the new credential and role membership; revoke the old login/password and terminate its existing sessions; prove the old credential cannot reconnect; reopen only after incident/release approval. Password revocation alone does not kill existing sessions. Local test secrets must never enter Git, logs or alerts.

## Kill and incident containment

1. The authorized control operator calls the private administrative control setter with disabled state. Runtime roles cannot do this. The acknowledged database transaction is the kill boundary.
2. The setter waits for the global shared transaction barrier, flips the epoch, disables acceptance and publication, and invalidates leased jobs. An earlier transaction may commit before disable acquires that barrier. After disable commits, old epochs/fences cannot claim, publish or acknowledge.
3. If disable times out, report **kill unconfirmed**. Keep external entry points stopped, terminate affected local/server processes as appropriate, and retry under incident authority. Never report a request to disable as confirmed containment.
4. Stop scheduler invocation, close purpose pools and inspect aggregate queue/erasure metrics. Preserve raw evidence and quarantine/dead-letter work for reviewed investigation; do not delete it to make monitoring green.
5. Fresh enablement has a bounded TTL. Missing, expired, malformed or unreachable control reads deny. No positive cache is used. Renewing control advances its epoch and fences existing leases, so schedule renewals deliberately.
6. Re-enable only after confirming checksum, version, enrollment and erasure fences. Durable retry work converges through the ordinary queue. Never manually rebase an old job onto a new generation.

The JavaScript adapter stays hard-denied in production/Vercel. The local SQL control is an administrative capability, not a learner API or a deployed control service.

## Scheduler, queues and monitoring

A real scheduler must supply a verified issuer, audience, signature, expiry and one-use nonce; learner Bearer tokens are not scheduler authority. Provider integration and credentials are still required. Invocation is bounded to five claims, 20 seconds of work and a 30-second response budget. Global leases are capped at two and each owner has at most one active lease.

Queue operations use durable leases, increasing fencing tokens, generation identity and enrollment identity. Expired leases can be retried; obsolete generations are parked. Poison jobs enter dead-letter, unresolved chronology enters quarantine. Fix the cause under reviewed procedures and enqueue current facts through the trusted queue; do not reset attempt counters or edit answer correctness directly.

Use only fixed aggregate metrics and alert codes from `operational-monitor.mjs`. The window is five minutes, capped at 10,000 observations, with a saturation flag. A p95 requires at least 20 successful observations; smaller samples have no percentile claim. Never send owner/job IDs, raw payloads, tokens, URLs, SQL, exception text or arbitrary labels to monitoring. Production alert destinations, on-call coverage and escalation deadlines are unassigned. Test routing and acknowledgment before enabling a cohort.

Inspect depth/oldest eligible age, active/expired leases, retries, dead-letter/quarantine, scheduler denial, connection failures, projection latency/failure, generation conflicts, incomplete-erasure age, expiry/retention backlog and acceptance after the acknowledged kill boundary. Preserve the distinction between observation-window counters and current queue gauges.

## Backup, restore and erasure reconciliation

1. Stop entry points and workers; isolate the restore target. The rehearsal deliberately restores an older backup with enabled control. Revoke runtime LOGIN and terminate existing sessions before restore, then force disabled control in quarantine before readmission. Do not rely on the backup carrying a safe control value.
2. Restore into a fresh database, with separate recovery authority, then verify effective grants before readmission. Restoring into an existing database was shown to reapply default client grants; do not assume dump ACLs undo those grants. On the target image, ordinary `postgres` cannot recreate Supabase-owned event triggers; full restore uses local `supabase_admin`. This does not justify giving runtime roles elevated authority.
3. Verify the external journal's HMAC chain and newest independently retained checkpoint. Missing key, missing journal, truncated history, mismatched head or changed enrollment fails closed. A valid old checkpoint supplied with an old journal is not current authority; custody of the newest checkpoint is a required operator responsibility.
4. Replay every applicable erasure intent against the restored graph while control remains disabled. Resume incomplete operations using durable stages. Verify all owner-linked sessions, answers, plans, proofs, recommendations, tasks/events, projections, jobs, state and enrollment rows are absent. Completed receipts must have no owner link; aggregate runtime receipts contain no learner identifier.
5. Recheck counts, fences, metadata and deterministic replay for retained owners. Only then may an authorized operator consider bounded re-enablement. Restored Auth sessions and external billing/Storage state require their separate integration procedures; this package does not silently invent external cleanup.
6. Backup retention, old-copy disposal, legal retention basis, journal retention, key custody, off-host replication and actual managed PITR reconciliation remain explicit production dependencies. No legal policy is changed by this rehearsal.

## Rollback or roll forward

Before a migration commits: abort and verify transactional rollback and an absent journal entry. After an additive migration commits: keep the runtime disabled and roll forward with a reviewed corrective migration. Do not run destructive down migrations or rewrite committed migration files. Restore is a disaster-recovery action into quarantine, followed by erasure reconciliation; it is not an ordinary feature rollback.

The user-facing fallback is the unchanged existing learner implementation. No adaptive cache, reward, entitlement or selection output is wired to it in this phase.


## Rehearsal exit and cleanup verification

Run `npm run audit:learning-operations:cleanup` against the fixed disposable image/database to reproduce the full success, failure-after-enable and denied-verification checks. The intentional failure must exit 1, retain `FORCED_AFTER_ENABLE`, and record successful cleanup separately. The denied-verification scenario must remain FAIL even if disable committed. The harness independently reads the database after each case and writes only sanitized booleans/error codes.

The ordinary runner (`npm run audit:learning-operations:database`) first invalidates the previous result with RUNNING/UNVERIFIED markers. After either completion or a caught error, it closes workload pools, uses a fresh administrative connection to commit disabled control, then uses another fresh connection to require stored enabled=false, effective enabled=false and killSwitch=true. PASS is written only after all cleanup succeeds. A pool-close, disable or verification error is a separate cleanup failure; retain the original rehearsal error as well. Inspect both `result.json` and `final-control.json`; do not interpret the cleanup's nested PASS as a successful rehearsal.

If cleanup is FAIL, the process is externally terminated, the host stops, or the receipt remains RUNNING/UNVERIFIED, treat containment as unconfirmed. Stop any local invocation and use the fixed disposable database administration path to run `select adaptive_private.set_runtime_control(false,60);`. After that transaction commits, independently read the raw control row and `adaptive_private.read_runtime_control()` and require the three values above. Record the failure and subsequent verified recovery; do not overwrite the failed run as PASS. An expired TTL alone does not satisfy cleanup. Database unavailability or OS termination cannot be repaired by pretending that a JavaScript finalizer ran.

Both disposable databases must be independently verified disabled after any validation session. Never reuse these commands with arbitrary database URLs. Phase 2B-5 remains on hold pending independent review; this cleanup runbook grants no production action.
