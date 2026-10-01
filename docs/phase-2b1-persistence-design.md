# Phase 2B-1: additive adaptive-learning persistence design

Date: **2026-10-02, Asia/Singapore** (database observation/recheck on 2026-10-01 UTC). Starting commit: `e16e6927b145815fc6b92c6139d6fa0ce280d9cd`, branch `main`.

## 1. Executive summary

This phase supplies an **unapplied migration**, shared validation contracts, contract tests, static SQL audit, and rollback-only local SQL tests. It prepares 23 tables: 20 in `public` and three in the new `adaptive_private` schema. It does not implement a production writer, grader, worker, publication service, or API.

**No live migration was applied. No production data was modified by this task. No learner-visible behavior changed. No shadow writes were enabled.** No catalogue rows, version activations, backfills, rewards, coins, entitlements, achievements or question-selection changes were made. This report ends Phase 2B-1; Phase 2B-2 requires a separate instruction.

Read in full before design: the [master plan](secureplus-rebrand-master-plan.md), [Phase 1 audit](phase-1-product-loop-audit.md), and [Phase 2A report](phase-2a-rto-concept-pilot.md). The master plan governs approved product decisions, the audit supplies the pre-pilot evidence, and Phase 2A supplies the implemented algorithm contract. No unresolved product-document conflict requires a behavior change. Existing repository/live differences below remain deliberately unresolved.

The design keeps immutable observations separate from rebuildable progress summaries. Trusted grading data is private; clients can submit stable answer identities through a **future authenticated server**, but cannot set correctness, mappings, set order, mastery or rewards. New catalogue activation requires human approval. The Phase 2A provisional versions remain representable and **are not promoted to approved versions**.

Validation is **static/local JavaScript only**. No local PostgreSQL service, `psql`, or container runtime was available. Migration execution, PostgreSQL syntax, RLS behavior, trigger execution, database lint/advisors and concurrent transactions remain unverified. Static checks do not substitute for those deployment gates.

## 2. Live schema baseline and drift

Authenticated, read-only Supabase metadata inspection used project `uscaqeymulsaeqxjvbfq` (SecurePlus), PostgreSQL `17.6.1.113`, region `ap-southeast-1`, status `ACTIVE_HEALTHY`. No learner histories or account rows were fetched. The repeatable SELECT is [adaptive-live-baseline.sql](../supabase/validation/adaptive-live-baseline.sql).

The initial metadata result and the identical query repeated at **2026-10-01 17:24:43 UTC** compared exactly as serialized JSON: **unchanged**. Both migration-history reads returned an empty migration list. This establishes unchanged inspected schema metadata; it does not claim that ordinary learner activity stopped during the task.

| Inspected object | Verified live baseline | Persistence consequence |
|---|---|---|
| Public tables | 16, all with RLS enabled | No `adaptive_*` tables; no `adaptive_private` schema; no naming collisions |
| Policies / indexes / constraints | 35 / 47 / 74 | Captured definitions, not inferred from checked-in SQL |
| Public function definitions | Eight: `award_cipher_coins`, `claim_cipher_daily_check_in`, `claim_referral_reward`, `consume_cipher_exam_pass`, `handle_new_user`, `purchase_cipher_coin_item`, `record_cipher_daily_challenge`, `rls_auto_enable`; all security-definer | Do not replace these functions or reuse their privilege model |
| Noninternal row triggers in public/auth | `on_auth_user_created` on `auth.users`, calling `handle_new_user` | No adaptive trigger exists; existing signup trigger left alone |
| DDL event triggers | Seven enabled: `ensure_rls`, `issue_graphql_placeholder`, `issue_pg_cron_access`, `issue_pg_graphql_access`, `issue_pg_net_access`, `pgrst_ddl_watch`, `pgrst_drop_watch` | Supplemental read-only inventory; explicit RLS/grants remain necessary despite automatic RLS and schema-cache hooks |
| Applied migrations | Management API returned `[]` twice | Existing schema is not an empty database; do not replay old setup files |
| API exposure configuration | No `pgrst.*` role settings returned; session `pgrst.db_schemas` unset | Dashboard/Data API exposure settings remain unverified; assume `public` can be exposed and secure every new table |
| Default privileges | Existing `public` defaults grant broad table/sequence/function privileges to API roles | Revoke defaults on each **new object** and explicitly grant only what it needs; do not change global defaults |

The 16 public tables are `account_deletion_requests`, `app_admins`, `attempts`, `cipher_coin_daily_activity`, `cipher_coin_transactions`, `cipher_coin_unlocks`, `feedback_reports`, `flashcard_generated_decks`, `flashcard_preferences`, `flashcard_progress`, `pbqs`, `profiles`, `question_override_history`, `question_overrides`, `referrals`, and `starred_questions`.

### Relevant repository/live discrepancies

- **Attempts:** live columns are exactly `id,user_id,question_id,question_type,title,domain,chapter,correct,score,created_at`. UUID primary key; owner FK to Auth with existing cascade deletion; `(user_id, created_at DESC)` index. There are length checks and a 0–100 score constraint. Owner SELECT/INSERT policies validate ownership and size, **not grading**. There is no revision, selected answer, concept mapping, session ID, event idempotency ID, duration, intervention, freshness or algorithm version. This agrees with the core attempts definition in `supabase/schema.sql` and Phase 1's ten-column observation.
- **Session summaries:** `server/attempts/submit.js` inserts `session_type`, `duration_seconds`, and `questions_count` into `attempts`, but live lacks those columns. It sets `question_id=session:<type>:<time>`, `question_type=session_<type>` and derives correctness from a client score. `supabase/achievements.sql` proposes the missing columns. They are not deployed and must not be assumed by a new writer. The new session/event tables keep summaries physically separate from answers; this phase does not repair the endpoint.
- **Achievements:** live lacks `achievements`, `user_achievements`, `profiles.total_stars`, `award_user_achievement` and its trigger functions despite `supabase/achievements.sql` and endpoint references. Its 412 MCQ/105 PBQ counters also differ from the current local effective bank (395/88). Do not import its rewards or bank counts into adaptive persistence.
- **Profiles/identity:** `full_name` and `avatar_id` from `schema.sql`, `academy-id.sql`, and related referral setup are absent live. Live `handle_new_user` inserts only core profile fields rather than the checked-in identity enrichment. Adaptive owners reference `auth.users.id`, not those optional profile columns. `mascot_placements` from `mascot-manager.sql` is also absent; no new dependency is introduced.
- **Coins:** live `purchase_cipher_coin_item` uses 30 coins for a PBQ and 150 for an exam pass; repository `cipher-coins.sql` uses 50/70 and a different selection catalogue. The repository's private welcome-grant function/profile trigger is absent from inspected live functions/triggers. Existing coin tables and profile coin fields do exist. No coin function was invoked, reconciled, replaced or referenced by adaptive triggers.
- **Questions/PBQs/overrides:** live `pbqs` and `question_overrides` contain JSON payloads and mutable publication metadata, not a canonical immutable full question bank. PBQ policies use free/Pro/trial/subscription/coin access; active overrides are readable by anon/authenticated. `question_override_history` records administrative changes but is not a learner answer-revision registry. None of these tables is renamed or altered. Prior Phase 1 content counts are dated evidence; this phase refreshed schema metadata, not remote publication payload inventories.
- **Flashcards:** `flashcard_progress.mastered` is an existing user-maintained card value, not trusted concept mastery. Existing deck/preferences/progress and starred-card structures remain unchanged and are not treated as concept evidence.
- **Deletion and other setup:** `account-deletion.sql`, `stripe-cancellation.sql`, `question-admin.sql`, `admin-access.sql`, `feedback.sql`, `flashcard-progress.sql`, and `starred-flashcards.sql` describe existing structures with no adaptive name collision. Their policies and lifecycle behavior are not replaced. Existing account deletion cascades differ from the proposed historical retention policy: resolve this explicitly before real records are written (section 16).

### Official guidance checked before design

Applied the Supabase and Supabase Postgres best-practices skills, including privilege, RLS, FK-index, composite-index and constraint references.

- [Securing your API](https://supabase.com/docs/guides/api/securing-your-api): grants and RLS are separate controls; both are required.
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security): owner predicates use `(select auth.uid())`; no authorization uses `user_metadata`.
- [Custom schemas](https://supabase.com/docs/guides/api/using-custom-schemas): a private schema should not be added to the exposed schema list; schema usage is not table access.
- [Supabase changelog](https://supabase.com/changelog) and [explicit API exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically): announced defaults are not evidence of this project's actual grants. The entry describes new-project changes from May 30 and planned existing-project changes from October 30, 2026. This migration explicitly revokes/grants new objects under either default.
- The current changelog also lists PostgreSQL 15.19/17.11 upgrade changes. This design adds no `ltree`, `btree_gist` or crypto extension dependencies, and does not upgrade the live 17.6 instance.

## 3. Proposed tables and relationships

All public names below have the `adaptive_` prefix. The diagram groups immutable catalogue and event tables for readability; the migration contains every FK.

```mermaid
flowchart TD
  V[Versions + private payloads] --> VS[Version sets / sealed catalogue]
  V --> VE[Activation events]
  VS --> C[Concepts + relationships]
  Q[Question revisions] --> K[Private grading keys]
  Q --> O[Stable answer components]
  Q --> QM[Versioned question mappings]
  C --> QM
  CR[Content revisions] --> CM[Versioned content mappings]
  C --> CM
  OS[Private owner counter / replay generation] --> S[Sessions + manifest items]
  VS --> S
  Q --> S
  S --> SE[Session lifecycle events]
  S --> E[Immutable answer evidence]
  QM --> E
  E --> R[Recommendations]
  R --> I[Intervention events]
  E --> T[Review tasks + task events]
  E --> P[Rebuildable concept projections]
  I --> P
  T --> P
```

## 4. Table-by-table schema

| Table | Purpose and integrity rules |
|---|---|
| `public.adaptive_versions` | Immutable mapping/algorithm/configuration IDs, payload digest, initial review status, approval actor/time and creation time. Generated-kind FKs ensure each version is used in its proper role. Pending versions cannot activate. |
| `adaptive_private.version_payloads` | Full immutable version payload, JSON object ≤1 MB; no client table privilege. Payload digests are computed/verified by the future publisher using canonical JSON. |
| `public.adaptive_version_events` | Append activate/deactivate with actor, reason and server time. Registry-row lock and event sequence serialize lifecycle order. Activation requires a sealed set and human approval; mapping entries must all be approved. |
| `public.adaptive_version_sets` | Valid mapping/algorithm/configuration triples. Requires all three full payloads. Seals mapping content against subsequent append as well as edit/delete. A revised map or threshold needs a new ID. |
| `public.adaptive_concepts` | Version + stable concept ID; exam scope, name/description, objective codes, domain/chapter/topic, aliases, node kind, review actor/time/status. Support-only nodes are representable but cannot receive mastery projections. |
| `public.adaptive_relationships` | Same-version source/target FKs, five approved relation kinds, direction and 0–1 editorial weight, review provenance/status. No self edges; bidirectional pairs use lexical endpoint order; composite PK prevents duplicates. Relationships never produce answer evidence. |
| `public.adaptive_question_revisions` | UUID revision and question ID, immutable content signature and publication provenance, published/created timestamps, question type/objectives/domain/topic/difficulty/scenario family and initial editorial record. No question text, explanation, answer flags or grading JSON. |
| `public.adaptive_question_publications` | Append active/retired events with actor/time. An active publication event is the publisher's human-approval attestation for that revision. Its initial editorial status remains historical metadata. Requires secured grading truth and answer components before activation. Retiring hides it from active catalogue reads; historical references remain. |
| `public.adaptive_answer_components` | Revision + stable option/part/blank/choice/step ID and kind. No correctness field. Components become sealed when a revision is published or referenced by a session. |
| `adaptive_private.grading_keys` | Exact immutable grading contract, full grading payload and digest for each revision. Protected even if someone accidentally exposes the schema in API settings: clients have no table grants or policies. |
| `public.adaptive_question_mappings` | Version/revision/concept key, primary/secondary role, direct/coarse precision, cognitive skill and review record. One primary max by partial unique index; exactly one for each mapped revision when sealing/using a manifest. |
| `public.adaptive_content_revisions` | Immutable content ID/kind/signature for flashcard, lesson, section, check or targeted practice. |
| `public.adaptive_content_mappings` | Mapping version/content revision/concept plus editorial approval. Same-version concept integrity. |
| `adaptive_private.owner_state` | Mutable server-only monotonic set counter, evidence generation and explicit complete-history replay boundary. No client access. |
| `public.adaptive_sessions` | Immutable owner/session header, server allocated set index, mode/source/seed, requested/actual counts and PBQ counts, version triple and server start time. Count limit 500. |
| `public.adaptive_session_items` | Ordered, unique revision manifest with owned-session FK. Deferred checks require contiguous positions, exact actual question/PBQ counts and primary mappings. Header and all items must be inserted in one transaction. |
| `public.adaptive_session_events` | Separate started/completed/interrupted/abandoned ledger with event ID, occurrence and receipt times. Completion time is the completed event time. Never a row in answer history. |
| `public.adaptive_answer_evidence` | Immutable authenticated owner, server ID/receipt sequence, client ID + submission digest, exact manifest item, stable selections, server correctness/0–1 score, derived concept-role snapshot, versions, source/mode, occurrence/receipt/duration, classification provenance, recommendation/intervention links and append-only corrections. Legacy origin is separate and never mastery eligible. |
| `public.adaptive_recommendations` | Immutable scheduling identity, owner, direct/supporting target concept/content revision, source evidence, reasons and version triple. Supporting recommendations do not make supporting-concept evidence. |
| `public.adaptive_interventions` | Immutable events linked to an owned recommendation and its exact concept/content/source/versions. Distinguishes opening, lesson steps/check, flashcard review and targeted practice; completion criteria and trusted verification are separate from a client completion claim. |
| `public.adaptive_review_tasks` | Idempotent owned scheduling key, concept, source evidence, target revision, transfer/original recall/delayed proof/maintenance/coverage shortage, reason codes, eligible time **and** set index, versions and initial status. Shortage must be unavailable with no target. |
| `public.adaptive_review_task_events` | Append scheduled/completed/skipped/postponed/cancelled/superseded events. Completed requires owned completion evidence. Postponing a due window appends an event and schedules a replacement task; no in-place due-date rewrite. |
| `public.adaptive_concept_projections` | Mutable cache keyed by owner/concept/version triple: seven states, five evidence levels, sample/diversity counts, sticky/lapse history, unresolved IDs, answer/intervention/proof/mastery times, next task, input generation, receipt watermark, replay boundary/digest, status/recompute time. Ready publication checks current generation. |

All historical tables reject UPDATE/DELETE/TRUNCATE. The service role has SELECT/INSERT on history. Version/revision identity columns also have narrow UPDATE grants because PostgreSQL row locks require them; immutable triggers still reject every actual edit. Only owner counters and projections permit mutable UPDATE behavior. Catalogue/evidence FKs use RESTRICT, never deletion cascades. Session counters may have gaps but do not go backwards or accept a client-supplied number.

Indexes cover owner/time, owner/concept, owner/session, owner/due-time and due-set, owner/event idempotency, revision and mapping lookups, incoming graph edges, task links, and projection identity. PK/unique-index left prefixes are reused instead of duplicated. Low-volume approval-actor FKs are intentionally not individually indexed; account deletion is blocked pending the explicit retention decision anyway. Query plans and index cost must be measured locally before rollout.

## 5. Safe and trusted data boundaries

Browser input is an allowlisted claim: client event UUID, session/revision/item, stable selections, qualified occurrence time and optional duration. Owner comes from a server-verified Auth user. Source, mode, set index, version triple, mappings, grading and receipt time come from server records. Clients cannot submit correctness, concept roles, mastery state, rewards, receipt timestamps, arbitrary owner IDs, provisional-mode flags or algorithm versions as authoritative values.

The server must use a **transactional PostgreSQL connection** for atomic manifests, private grading reads and evidence/cache work; a sequence of independent PostgREST requests is not an equivalent transaction. No public security-definer RPC is introduced. All new functions are invoker functions with an empty search path. Version/revision row locks use narrow service-only identity-column UPDATE grants; immutable triggers prohibit actual modifications. Only the safe `adaptive_private.version_active(text)` read helper is executable by authenticated clients; every other function is service-only. No service credentials are imported by the frontend.

The future server resolves correctness using the secured exact revision. SQL binds selections to known revision components, stamps receipt time, binds evidence to its owned session and derives concept snapshots. SQL is a defense against malformed trusted writes, **not an implemented grading engine**. Service credentials remain powerful; owner validation is mandatory in every future endpoint.

MCQ selection: `{componentId: "option-a", valueId: "option-a"}`. A PBQ selection can be `{componentId: "blank-1", valueId: "choice-rto"}`. Both IDs belong to the exact revision. No display array index is an authoritative identity. This version conservatively forces all PBQ evidence to `coarse`; reviewed per-component grading/mapping and a later schema contract are required to narrow that. Existing p048/p211 behavior is preserved.

A lesson-open event cannot be verified completion. Other client completions remain unverified until a future server evaluates explicit criteria. Even verified interventions supply context, never positive answer evidence by themselves. Self-rating a card is not proof.

## 6. RLS and Data API policy matrix

Assume `public` is Data API exposed; do not depend on a dashboard setting. `adaptive_private` must stay outside exposed schemas. Every new table, including private ones, has RLS enabled.

| Objects | Anon | Authenticated SELECT | Authenticated writes | Service role |
|---|---|---|---|---|
| Versions / version events | None | Human-approved version metadata and its lifecycle | None | Append only |
| Version sets | None | All three versions active and approved | None | Append/seal |
| Concepts / relationships / question and content mappings | None | Human-approved rows in active mapping version; referenced concepts must also be visible | None | Append before sealing |
| Question revisions / answer components | None | Currently active publication and its safe IDs | None | Append; component sealing enforced |
| Question publication events | None | Safe lifecycle metadata (no payload or grading truth) | None | Append human publication/retirement attestation |
| Content revisions | None | At least one visible approved content mapping | None | Append |
| Sessions / answers / recommendations / interventions / tasks / projections | None | `(select auth.uid()) = owner_id` **and all three versions active** | None | Immutable append; projections also update |
| Session items/events and task events | None | Owner plus visible parent session/task | None | Append |
| Private version payloads / grading keys | None | None | None | SELECT/INSERT only |
| Private owner state | None | None | None | SELECT/INSERT/UPDATE |

No learner UPDATE policies exist. Grants independently prohibit writes, including direct projection changes. Owner-scoped composite FKs prevent linking another learner's session, miss, recommendation, intervention or completion record. Catalogue policies intentionally permit shared safe catalogue reads; learner policies always include ownership.

The active-version gate prevents shadow/provisional mapping snapshots from leaking through an owned evidence row. Deactivation also hides that version's learner rows from direct Data API reads without deleting them. A future owner-checked server export can read retained inactive history if needed; do not remove the ownership check to solve historical access. Human-approved version metadata can be discoverable while inactive; it is not an active production mapping.

## 7. Idempotency, retries and corrections

1. Authenticate on the server, load the immutable owned session/revision, then run `validateClientEvidence`.
2. Normalize timestamps to UTC and selected component order. Canonicalize the **validated client payload**, hash with SHA-256 and scope the key by authenticated owner. Exclude server receipt time and derived grading from the submission digest.
3. In a transaction, use unique `(owner_id,client_event_id)`. If the key already exists, compare the stored submission digest with the normalized payload digest. Same digest returns the existing evidence ID; a different digest returns conflict. `classifyRetry` supplies the pure comparison contract, not a database endpoint.
4. On a concurrent uniqueness race, roll back the failed transaction and read/compare the winner. Never use `ON CONFLICT DO UPDATE` to overwrite a ledger event, and never silently accept `DO NOTHING` without checking the digest.
5. Session and intervention event keys, recommendation/task scheduling keys are likewise owner scoped. A duplicate scheduling key must compare semantic task payload; replacing a time window requires a new deterministic key plus a superseded event.
6. Corrections append a new event with reason and `supersedes_evidence_id`. SQL requires the same owner, session item, revision, question, occurrence and provenance. A unique superseded pointer prevents competing branches; correction chains point to already existing rows. Replay excludes superseded rows. Original legacy origins have a partial unique key so retries do not duplicate imports while corrections can retain the origin.

Offline submissions keep the revision issued with the session, even if it is later retired/deactivated. Qualified occurrence time must be at/after server session start and no more than five minutes beyond receipt; duration is bounded by elapsed time and 24 hours. These are input bounds, not a scientific validation of device clocks. Evidence outside bounds is rejected/quarantined by the future server, not silently retimed. The five-minute transport tolerance is a proposed operational limit, not a mastery threshold.

Global receipt sequence is an ordering aid, **not a commit-order guarantee**. Per-owner generation and replay locking handle late commits. Session completion must use the session event ledger; a synthetic `session:...` ID cannot satisfy the question-revision manifest FK.

## 8. Question revision and stable-option strategy

Publish only after resolving the same effective content as runtime. Preserve the actual precedence, including its non-obvious PBQ behavior:

1. Authored/imported MCQ/PBQ content; low-quality filtering.
2. Captured published snapshot merge and captured disables.
3. Editorial retirement filters and existing enhancement/review ordering (MCQ legacy enhancement before review/final feedback; PBQ review before runtime enhancement).
4. Within review: base, published, second-pass and concise-explanation patches.
5. Active live overrides: disables remove; captured identity/kind/action/timestamp matches update ordering without reapplying stale content; other upserts may supersede reviewed content. The timestamp identity shortcut does not prove payload equality.
6. Remote PBQ normalization/merge happens after overrides. The reviewed cutoff is `2026-09-05T13:32:13Z`; old/missing timestamps preserve reviewed local content and remote `is_pro`, while newer remote data can win. Apply retirement rules and test disable conflicts explicitly.

The local Phase 2A helper resolves the local effective bank only. It does not cover future live overlays. Phase 2B-2 must implement a server publication resolver with fixtures for conflicting overrides, timestamps, disables and remote payloads. It must not simply hash raw literals or raw `pbqs` rows.

Canonicalize the final resolved, unshuffled authored answer structure together with grading truth and relevant publication provenance; compute SHA-256 before assigning a revision UUID. Record the provenance steps/source and immutable private grading payload. Keep stable option IDs independent of display order; do not derive them from shuffled indices or answer correctness. Changes in semantic content, grading or component identities require a new revision. Question ID remains stable across revisions so edits do not manufacture fresh scenarios. Retain the old revision and key for historical grading/replay; append retirement rather than deleting it. The future publisher must retire a previous active revision when replacing it and serialize publication by question ID; this migration records per-revision lifecycle and does not implement a question-level publication service.

The five Phase 2A mastery concepts, supporting graph nodes and seven question mappings can be represented, but **no seed was added**. Their existing mapping/configuration/algorithm IDs are valid as provisional records. Human approval publishes a new immutable approved version ID rather than mutating a pending record in place. The immutable initial editorial record on a question is supplemented by explicit human publication events; it is not silently rewritten.

## 9. Legacy-history strategy

Preserve every existing `attempts` row and keep current reads/writes unchanged. There is no backfill in this phase. A later importer may retain source attempt ID, known question ID, recorded correctness/score and recorded timestamp with `legacy_inferred` provenance. A revision can be reconstructed only with defensible publication evidence; otherwise leave it null. Do not guess selected answers, exact response durations, interventions, concept roles, historical versions or scenario freshness.

The SQL trigger forces legacy precision to `unknown`, empty concept snapshot and no invented selections/session/intervention linkage. `eligible_for_mastery` is generated false. Historical client correctness is retained as an unverified historical claim; it is not freshly server graded. Legacy rows may support separately labelled coverage/prioritisation analysis, not `proven` or `mastered`.

A later import should use an explicitly labelled legacy version triple/payload recording uncertainty; those IDs describe the import interpretation, not the algorithm supposedly running when the attempt occurred. `owner_state.complete_evidence_from` is set by the future service at the first complete-evidence boundary. Null means no complete-history boundary has been established. The replay contract excludes legacy, coarse, superseded and pre-boundary records.

## 10. Projection rebuild strategy

The ledger is authoritative; a projection is a disposable materialized summary. No client may write it.

- On each answer or intervention insert, update the owner's generation and mark all that owner's projection versions stale in the same transaction. This covers late/out-of-order arrivals and corrections without pretending a timestamp watermark is enough.
- The worker reads a consistent snapshot of owner generation, complete-history boundary, immutable version payloads, retained revisions/mappings, answer history, verified interventions and task events. It resolves corrections and uses occurrence time, trusted set index and stable event ID for deterministic order. Recompute freshness from the full applicable history; `classification_at_ingest` is an auditable snapshot, not a permanent replay answer.
- Only complete direct answer evidence contributes to mastery. Graph edges, lesson openings, self-ratings, coarse PBQs and legacy attempts cannot create positive concept proof. Persist all relevant interventions, but feed only verified, mapped completion events into the Phase 2A adapter.
- Derive `mastered_at` from the mastery transition, since Phase 2A currently returns transitions/proven time rather than a separate persisted mastery timestamp. Use the pinned versions and original immutable mapping snapshot. Reclassification under a new mapping/algorithm produces a separate versioned projection; it does not rewrite old evidence.
- Publish only after locking `owner_state` and comparing generation with the snapshot. SQL rejects a ready cache with stale generation (`40001`). The worker retries on serialization/deadlock errors. Capture a receipt watermark and canonical input digest for diagnostics. Cross-user/mismatched-concept contradiction IDs and support-only node projections are rejected.
- Before publication, run the pure Phase 2A state machine, then `validateProjection` against the exact replay inputs. Contract checks validate structure/counts/ownership and reject legacy-only proof; they do not replace algorithm computation or certify learning effectiveness. SQL has additional minimum proof guards, not a duplicate implementation of all mastery rules.

Phase 2A requires set indices to be monotonic in occurrence order. Overlapping/offline sessions may violate that condition despite valid server allocation. **Do not renumber history or infer spaced proof to hide the conflict.** Preserve evidence, mark recomputation failed/stale, and resolve a reviewed normalization rule in Phase 2B-2. An algorithm change needs a new version. Until then these histories cannot yield a ready mastery result.

Task lifecycle writes must be included in the same owner's replay/worker transaction when updating the cached next task. The current invalidation trigger covers answers/interventions; an independent future task writer must also invalidate/rebuild the cache. This is an integration obligation, not implemented background work.

## 11. Additive rollout and rollback

1. Finish local execution/security/concurrency validation and resolve section 16 decisions before any approved production rollout.
2. Apply only this reviewed migration to an explicitly approved environment. It is empty/inactive and does not seed or activate anything. Do not bulk-run old SQL or interpret empty migration history as permission to recreate production.
3. Publish private revision keys, stable components, version payloads and catalogue rows transactionally; then seal version sets. Provisional/shadow data stays inactive. Production activation is a separate human-approved lifecycle event.
4. In Phase 2B-2, implement a compatibility writer behind a default-off server flag. Existing `attempts` behavior remains authoritative. Enable shadow writes only after explicit approval, and prevent failure in the shadow path from changing legacy rewards/access/selection.
5. Rebuild shadows asynchronously or transactionally, compare state/reasons/scheduler outputs, investigate losses/duplicates/clock conflicts/variant shortages. Existing Smart Review and all rewards/entitlements remain on the legacy system.
6. Learner-facing cutover is a later approved phase. This phase does not create the flag, writer, worker, UI integration or dual writes.

**Deactivation/roll-forward:** disable future writer/reader flags first; append version deactivation events and retire publication revisions as needed; preserve ledgers and keys. Publish a corrected new version/migration, rebuild its separate projections and compare before reactivation. Do not roll back by dropping populated tables, changing immutable rows or replaying old setup SQL. A transaction failure during initial migration application rolls back its DDL; after successful deployment use additive corrections. Rebuilding caches can use UPDATE/upsert on the same projection identity; history remains untouched.

## 12. Files changed

- `supabase/migrations/20261001170334_adaptive_learning_persistence_foundation.sql` — CLI-created, empty/inactive additive migration.
- `supabase/validation/adaptive-live-baseline.sql` — repeatable read-only metadata inspection.
- `supabase/validation/adaptive-local-checks.sql` — synthetic local transaction tests, always rolled back.
- `src/lib/learningPersistenceContracts.js` — pure shared contracts; no production imports.
- `scripts/audit-learning-persistence.mjs` — 20 named contract/replay scenarios.
- `scripts/audit-learning-migration.mjs` — 172 static SQL checks, explicitly not a PostgreSQL parser.
- `package.json` — two opt-in audit commands; no dependency changes.
- `docs/phase-2b1-persistence-design.md` — this report.

Unrelated `.gitignore`, Android, Capacitor, audit artifacts, output and review exports are excluded from the commit. The temporary CLI cache is also excluded. No existing runtime/UI/endpoint/algorithm files were changed.

## 13. Migration validation and verification results

The Supabase CLI was initially absent. After the user's continuation authorization, the official **v2.119.0** Darwin arm64 binary was downloaded to `/tmp/secureplus-cli-2.119.0/supabase`; no global/system install or project dependency was added. Official release checksum verified: `cc80ee3a681a2ae735e6d494d9defc56aa6746b487980f6eed39fed8a98f0760`. The installed temporary CLI reported `2.119.0`.

CLI help was inspected before commands: `--help`, `migration --help`, `migration new --help`, `migration list --help`, `db --help`, `db lint --help`, and `db advisors --help`. `/tmp/secureplus-cli-2.119.0/supabase migration new adaptive_learning_persistence_foundation` created the timestamped file; the timestamp was **not manually invented**. No `db push`, linked migration application, remote SQL write, reset or remote advisor command was issued.

| Exact check | Result |
|---|---|
| `npm run audit:learning-persistence` | PASS: 20 named scenarios, including authority injection, ownership, shuffled IDs, retry conflict, qualified dates, version approval, manifest limits, late replay/corrections and legacy-only proof rejection |
| `npm run audit:learning-migration` | PASS: 172 static checks over 23 tables; grants/RLS declarations, ownership policies, immutability, private keys, invoker functions, no legacy DDL/cascades, local assertion coverage |
| `npm run audit:learning-pilot` | PASS: all 24 named replays plus catalogue, validation, attribution, caps and determinism checks; real local variant shortage preserved |
| `npm run build` | PASS: Vite production build; existing >500 KB chunk warning remains (main bundle ~3.59 MB) |
| `npm run audit` | PASS: launch/security structure, coins, engagement, SEO, PWA, Deep Dives, editorial and strict question-bank checks |
| `npm run audit:editorial` | PASS within full audit: 395 active MCQs, 88 PBQs, 32 lessons, 171 generated practice questions |
| `npm run audit:qbank:strict` | PASS within full audit: 395 MCQs / 88 PBQs, no structural errors |
| `git diff --check` and staged equivalent | PASS at delivery |
| `/tmp/secureplus-cli-2.119.0/supabase migration list --local` | UNAVAILABLE: connection refused at `127.0.0.1:54322` |
| `/tmp/secureplus-cli-2.119.0/supabase db lint --local --schema public,adaptive_private --fail-on error` | UNAVAILABLE: same local database connection refusal |
| `/tmp/secureplus-cli-2.119.0/supabase db advisors --local --type all --fail-on error` | UNAVAILABLE: same local database connection refusal |
| Migration apply / rollback-only SQL checks | NOT RUN: local database and `psql` unavailable; no remote substitute used |
| Read-only live baseline repeat + `list_migrations` | PASS: exact metadata equality; 16 tables, 35 policies, 47 indexes, 74 constraints; migration list remains empty |

When an authorized disposable local Supabase environment and `psql` already exist, the intended local commands are:

```sh
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -v ON_ERROR_STOP=1 -f supabase/migrations/20261001170334_adaptive_learning_persistence_foundation.sql
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -v ON_ERROR_STOP=1 -f supabase/validation/adaptive-local-checks.sql
```

These commands target loopback only and were **not executed** here. Use a disposable database with standard Supabase roles/Auth schema, no previous adaptive objects, and no unrelated seed data. A plain PostgreSQL instance needs equivalent synthetic roles/Auth fixtures first. Do not paste the validation file into the live SQL editor: it intentionally creates synthetic users and mutates local fixtures within a rolled-back transaction.

The SQL asset checks RLS enabled; own/cross-user visibility; no anon private-key reads; denied learner writes/projection updates; uniqueness conflicts; immutable history; pending version activation failure; sealed components; server set allocation; snapshot derivation; summary separation; generation invalidation/rebuild; and legacy proof restrictions. These are prepared tests, not claimed passing database results. Two-connection races and API/schema exposure still need separate runtime verification.

## 14. Remaining risks

- PostgreSQL parser/execution, RLS policy evaluation, invoker grants, deferred constraints, trigger order and concurrency are unverified without a local database. Do not deploy based solely on regex/static checks.
- Account deletion currently expects cascading Auth deletion. Restrictive learner **and approval-actor** FKs would block deletion after new records exist. Resolve before publishing real approvers or enabling shadow writes.
- The complete trusted writer, grader, content publisher and projection adapter remain absent. Contract validation alone is not authentication or server grading. Session/task/intervention state transitions and completion eligibility need transactional service tests.
- Offline/concurrent-session chronology conflicts with the pilot's monotonic occurrence contract; device clocks are not inherently trusted. Resolve clock/quarantine/proof treatment without silently manufacturing spacing.
- Sealing blocks append/edit/delete of mapped rows, but publisher digest verification against full payload and resolved publication snapshots is an application obligation. Treat version/publication actor IDs as attestations only after verifying the real human approver server-side.
- API dashboard schema settings were not observable through catalog settings; locally verify REST/GraphQL/table/function exposure before enabling any new environment. Existing bundled/legacy answer payloads are outside this phase; this schema does not add grading-key exposure.
- Full replay cost and large per-owner histories need measured query plans, batching and lock-order tests. Worker transactions must acquire owner state before projection updates; retry serialization/deadlock failures.
- The RTO pilot lacks enough real independent scenario families to demonstrate all proof states in production. Synthetic replay successes do not solve content coverage or validate educational thresholds.

## 15. Exact Phase 2B-2 implementation steps

1. Obtain explicit Phase 2B-2 authorization and settle founder decisions below. Refresh the read-only baseline; stop on new relevant drift rather than modifying old SQL automatically.
2. Execute this migration in an authorized disposable local Supabase instance; run the SQL asset, local status/lint/advisors and actual REST/GraphQL role tests. Fix failures with reviewed changes before considering live application. Exercise two-connection duplicate keys, counter allocation, lifecycle ordering and generation invalidation.
3. Resolve account deletion/approver retention and local schema exposure. Establish real human publisher authorization independent of client metadata.
4. Build the exact publication resolver and secure grader from final runtime precedence. Generate stable option/component IDs before shuffling; bind full grading keys and immutable revisions. Verify conflicting live/local overrides and retirement behavior with fixtures. Keep PBQs coarse.
5. Create reviewed immutable version payloads and a transactional publisher. Represent current Phase 2A IDs as provisional; human-approved production records use new version IDs. Load catalogue rows before sealing. Do not auto-activate agent-reviewed data.
6. Implement an authenticated, default-off compatibility endpoint with a transactional server connection. Derive owner, allocate session/set index, persist manifest, grade exact revision, hash normalized submissions, distinguish same/conflicting retries and append corrections. Keep old `attempts` unchanged.
7. Implement intervention criteria and lifecycle transitions, deterministic review-task identities, dual eligibility checks and completion evidence validation. No reward or entitlement calls in the new path.
8. Implement the pinned-version replay adapter/worker with a complete-history boundary, correction handling, legacy/coarse exclusions, freshness recomputation, generation checks and failed/quarantined chronology handling. Test against all Phase 2A scenarios and local SQL fixtures.
9. Obtain explicit approval before any live additive migration or shadow-write enablement. Start with a bounded cohort, compare legacy and shadow results, monitor delivery loss/conflict/replay failures, and retain an immediate disable switch. Live backfill, learner-visible selection and cutover remain separate approvals/phases.

## 16. Decisions requiring founder approval

- **Retention versus account deletion:** choose a reviewed subject/approver identity and erasure strategy before any real records. The current restrictive-FK proposal prioritizes avoiding accidental history loss; it is not yet compatible with the existing deletion endpoint.
- **Human editorial approval and production versions:** approve the pilot concepts, graph, question/content mappings and publication workflow. Agent review alone cannot activate them.
- **Offline/overlapping sessions:** choose acceptable clock tolerance, quarantine behavior and proof eligibility. Any changed state-machine ordering needs an explicit new algorithm/configuration version.
- **Live application and shadow cohort:** authorize Phase 2B-2 and any later migration/writer enablement separately. This delivery grants neither.
- **Evidence thresholds and coverage:** Phase 2A weights/delays remain provisional hypotheses. Approve calibration and additional independent content before using the system to make learner-facing mastery claims.

No pending founder decision prevented preparing this inactive design. No approval is requested to mutate production as part of this delivery.
