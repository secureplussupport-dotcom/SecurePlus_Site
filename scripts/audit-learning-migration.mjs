import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const migration = readdirSync('supabase/migrations').filter(n => n.endsWith('_adaptive_learning_persistence_foundation.sql'));
assert.equal(migration.length, 1);
const sql = readFileSync(`supabase/migrations/${migration[0]}`, 'utf8');
const tables = [...sql.matchAll(/create table ([\w.]+) \(([\s\S]*?)\n\);/g)].map(([, name, body]) => ({ name, body }));
let checks = 0;
function check(ok, name) { assert.ok(ok, name); checks++; }
check(tables.length === 23, 'Expected 23 additive tables');
check(sql.includes('begin;') && sql.trim().endsWith('commit;'), 'Atomic migration');
check(!/security\s+definer|alter\s+default\s+privileges|on delete cascade|create\s+(?:or replace\s+)?view/i.test(sql), 'No privilege escalation, default ACL changes, history cascades or exposed views');
const mutations = [...sql.matchAll(/(?:create table|alter table|create policy \w+ on|grant [^;]+ on table|revoke [^;]+ on table)\s+([\w.]+)/gi)].map(m => m[1]);
check(mutations.every(n => n.startsWith('public.adaptive_') || n.startsWith('adaptive_private.')), 'All table DDL/ACL targets are new adaptive tables');
for (const { name, body } of tables) {
  const short = name.split('.')[1], mutable = ['adaptive_private.owner_state', 'public.adaptive_concept_projections'].includes(name);
  check(sql.includes(`alter table ${name} enable row level security;`), `${name} RLS`);
  check(sql.includes(`revoke all on table ${name} from public, anon, authenticated, service_role;`), `${name} explicit grants`);
  check(sql.includes(`grant select, insert${mutable ? ', update' : ''} on table ${name} to service_role;`), `${name} least privilege service writes`);
  if (!mutable) {
    check(sql.includes(`create trigger ${short}_immutable before update or delete on ${name}`), `${name} immutable rows`);
    check(sql.includes(`create trigger ${short}_no_truncate before truncate on ${name}`), `${name} immutable history`);
  }
  if (name.startsWith('public.') && body.includes('owner_id')) check(sql.includes(`create policy ${short}_read on ${name} for select to authenticated using ((select auth.uid()) = owner_id`), `${name} owner policy`);
  if (name.startsWith('adaptive_private.')) check(!sql.includes(`grant select on table ${name} to authenticated`), `${name} no client read`);
}
check(!/create policy[^;]+for (insert|update|delete|all)/i.test(sql), 'Clients have no write policies');
check(!/grant\s+(?:all|insert|update|delete)[^;]+to (?:public|anon|authenticated);/i.test(sql), 'No client write grants');
for (const fn of [...sql.matchAll(/create function ([\w.]+)\([^)]*\) returns [\s\S]*?\n\$\$;/g)]) {
  check(fn[0].includes("security invoker set search_path = ''"), `${fn[1]} invoker/safe search path`);
}
for (const fragment of ['unique (owner_id,client_event_id)', 'submission_sha256', 'supersedes_evidence_id', 'eligible_set_index', 'eligible_at', 'adaptive_set_allocation', 'deferrable initially deferred', 'adaptive_answer_replay', 'adaptive_intervention_replay', 'evidence_generation', 'Mapping version is sealed', 'Human approval required', 'Legacy-only evidence cannot establish proof', 'adaptive_session_events']) check(sql.includes(fragment), `Guard: ${fragment}`);
for (const { name, body } of tables.filter(t => /concepts|question_revisions|answer_components|question_mappings/.test(t.name))) check(!/grading_payload|answer_key|correct_answer/.test(body), `${name} no grading truth`);
check(sql.includes('revoke all on all functions in schema adaptive_private from public, anon, authenticated;'), 'No default PUBLIC function execution');
check(sql.includes('grant execute on function adaptive_private.version_active(text) to authenticated;'), 'Only safe read helper callable');
check(!readFileSync('src/App.jsx', 'utf8').includes('learningPersistenceContracts'), 'Production App does not import contracts');
const validations = readFileSync('supabase/validation/adaptive-local-checks.sql', 'utf8');
for (const name of ['cross-user', 'immutable', 'pending versions hidden', 'no grading columns', 'summaries never enter', 'rolled back', 'projection cache can be rebuilt']) check(validations.includes(name), `Executable local assertion: ${name}`);
// Lexical sanity only; not a PostgreSQL parser or an execution/security proof.
check((sql.match(/\$\$/g) ?? []).length % 2 === 0, 'Balanced dollar quotes');
check(!/\b(?:drop|truncate)\s+table\b/i.test(sql), 'No destructive migration DDL');
console.log(`PASS ${checks} static migration checks across ${tables.length} new tables. PostgreSQL syntax, RLS execution, concurrency, lint and advisors require a local database.`);
