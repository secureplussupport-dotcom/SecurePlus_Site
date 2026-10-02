// Run after audit:learning-database, only on its disposable loopback fixture.
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createAdaptiveDatabase, closeAdaptiveDatabase } from '../server/adaptive/database.mjs';
import { createAdaptiveAuthenticator } from '../server/adaptive/auth.mjs';
import { createAdaptiveHandler } from '../server/adaptive/http-boundary.mjs';

const apiUrl = process.env.SUPABASE_LOCAL_API_URL;
assert.ok(['localhost', '127.0.0.1'].includes(new URL(apiUrl).hostname), 'Requires loopback Auth');
// Single local pool; every transaction additionally pins its role explicitly.
const sql = createAdaptiveDatabase({ max: 1 });
const begin = sql.begin;
sql.begin = fn => begin(async tx => { await tx`set local role service_role`; return fn(tx); });
const fixtureOwner = '00000000-0000-4000-8000-000000000002';
const env = { ADAPTIVE_SHADOW_WRITES_ENABLED: 'true', ADAPTIVE_SHADOW_WRITES_KILL_SWITCH: 'false', ADAPTIVE_RUNTIME_ENVIRONMENT: 'disposable_local' };
let count = 0; const check = (ok, label) => { assert.ok(ok, label); count++; };
try {
  await sql`set role service_role`;
  const admin = createClient(apiUrl, process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const password = randomBytes(32).toString('base64url');
  const email = `adaptive-boundary-${randomUUID()}@example.invalid`;
  const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  check(!createError && created?.user, 'Local fixture Auth setup');
  const ownerId = created.user.id;
  const client = createClient(apiUrl, process.env.SUPABASE_LOCAL_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  check(!error && data?.session, 'Real local Auth session');
  const token = data.session.access_token;
  const authenticate = createAdaptiveAuthenticator({ url: apiUrl, publishableKey: process.env.SUPABASE_LOCAL_ANON_KEY });
  check((await authenticate(token))?.id === ownerId, 'Verified local Auth identity');
  const [row] = await sql`select s.*,i.revision_id,g.grading_payload from public.adaptive_sessions s join public.adaptive_session_items i using(owner_id,session_id) join adaptive_private.grading_keys g using(revision_id) where s.owner_id=${fixtureOwner} order by s.set_index limit 1`;
  const sessionId = randomUUID(), planId = randomUUID();
  const plan = { sessionId, source: 'practice', mode: 'normal', seed: null, requestedCount: 1, requestedPbqCount: 0, revisionIds: [row.revision_id], mappingVersion: row.mapping_version, algorithmVersion: row.algorithm_version, configurationVersion: row.configuration_version };
  const logs = [];
  const handler = createAdaptiveHandler({ authenticate, getDatabase: async () => sql, readEnvironment: () => env,
    readControl: async () => ({ enabled: true, killSwitch: false }), authorizeOwner: async id => id === ownerId,
    resolveSessionPlan: async (id, requested) => id === ownerId && requested === planId ? { ownerId, plan } : null, log: record => logs.push(record) });
  const request = (operation, payload, bearer = token) => new Request('http://localhost/adaptive', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${bearer}` }, body: JSON.stringify({ operation, payload }) });
  check((await handler(request('session', { planId }, 'invalid-token'))).status === 401, 'Invalid bearer rejected by real Auth');
  const sessions = await Promise.all([handler(request('session', { planId })), handler(request('session', { planId }))]);
  const receipts = await Promise.all(sessions.map(r => r.json()));
  check(sessions.every(r => r.status === 200) && receipts.every(r => r.receiptId === sessionId), 'Concurrent identical session retry');
  const [started] = await sql`select set_index,started_at from public.adaptive_sessions where session_id=${sessionId}`;
  const [owner] = await sql`select last_set_index from adaptive_private.owner_state where owner_id=${ownerId}`;
  check(Number(owner.last_set_index) === Number(started.set_index), 'Retry did not allocate another set');
  const originalMode = plan.mode; plan.mode = 'exam';
  check((await handler(request('session', { planId }))).status === 409, 'Conflicting session retry'); plan.mode = originalMode;
  const answer = { clientEventId: randomUUID(), sessionId, itemPosition: 1, revisionId: row.revision_id,
    selectedComponents: row.grading_payload.compiledRevision.gradingKey.expected, occurredAt: new Date(started.started_at.getTime() + 100).toISOString(), responseDurationMs: 50 };
  const replies = await Promise.all([handler(request('answer', answer)), handler(request('answer', answer))]);
  const bodies = await Promise.all(replies.map(r => r.json()));
  check(replies.every(r => r.status === 200) && JSON.stringify(bodies[0]) === JSON.stringify(bodies[1]), 'Identical answer retries return identical safe receipts');
  check(Object.keys(bodies[0]).sort().join(',') === 'receiptId,status', 'No score, grading key or mastery returned');
  const other = row.grading_payload.compiledRevision.components.find(c => c.kind === 'option' && c.id !== answer.selectedComponents[0].valueId).id;
  check((await handler(request('answer', { ...answer, selectedComponents: [{ componentId: other, valueId: other }] }))).status === 409, 'Conflicting answer retry');
  check((await handler(request('answer', { ...answer, ownerId: randomUUID() }))).status === 400, 'Owner injection');
  check((await handler(request('answer', { ...answer, clientEventId: randomUUID(), sessionId: row.session_id }))).status === 503, 'Real authenticated user cannot reference another owner session');
  const lifecycle = { clientEventId: randomUUID(), sessionId, status: 'completed', occurredAt: new Date(Date.parse(answer.occurredAt) + 100).toISOString() };
  const first = await handler(request('session_event', lifecycle)), second = await handler(request('session_event', lifecycle));
  check(first.status === 200 && second.status === 200 && JSON.stringify(await first.json()) === JSON.stringify(await second.json()), 'Session close retry');
  check((await handler(request('session_event', { ...lifecycle, status: 'abandoned' }))).status === 409, 'Conflicting lifecycle retry');
  env.ADAPTIVE_SHADOW_WRITES_KILL_SWITCH = 'true';
  check((await handler(request('answer', { ...answer, clientEventId: randomUUID() }))).status === 503, 'Kill switch stops future database work');
  const serialized = JSON.stringify(logs);
  check(!serialized.includes(ownerId) && !serialized.includes(token) && !serialized.includes(password) && !serialized.includes(answer.selectedComponents[0].valueId), 'Operational logs contain no identifiers, credentials or answer selections');
  check(logs.some(record => record.event === 'idempotent_retry'), 'Retry telemetry');
  await sql`select adaptive_private.delete_learner_data(${ownerId})`;
  await admin.auth.admin.deleteUser(ownerId);
  const [{ remaining }] = await sql`select count(*)::int as remaining from public.adaptive_sessions where owner_id=${ownerId}`;
  check(remaining === 0, 'Explicit local adaptive cleanup before Auth deletion');
  console.log(`PASS production boundary local integration: ${count} assertions with real Auth, PostgreSQL transactions and retry races.`);
} finally { await closeAdaptiveDatabase(sql); }
