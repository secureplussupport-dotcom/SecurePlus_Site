import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createAdaptiveHandler } from '../server/adaptive/http-boundary.mjs';
import { createAdaptiveAuthenticator } from '../server/adaptive/auth.mjs';
import { createOperationalEvents, localBoundaryEnabled, preserveLegacyResult } from '../server/adaptive/operations.mjs';
import { createProjectionDrain } from '../server/adaptive/job-boundary.mjs';

const ownerId = '00000000-0000-4000-8000-000000000002';
const env = { ADAPTIVE_SHADOW_WRITES_ENABLED: 'true', ADAPTIVE_SHADOW_WRITES_KILL_SWITCH: 'false', ADAPTIVE_RUNTIME_ENVIRONMENT: 'disposable_local', NODE_ENV: 'test' };
const control = async () => ({ enabled: true, killSwitch: false });
const request = (payload = { operation: 'answer', payload: {} }, headers = {}) => new Request('http://localhost/adaptive', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer test-token', ...headers }, body: JSON.stringify(payload) });
const make = overrides => createAdaptiveHandler({ readEnvironment: () => env, readControl: control, authenticate: async () => ({ id: ownerId }), authorizeOwner: async () => true, getDatabase: async () => { throw new Error('sensitive answer secret token'); }, ...overrides });

test('default configuration and every production environment deny before authentication/DB', async () => {
  const forbidden = () => { throw new Error('must never run'); };
  assert.equal((await createAdaptiveHandler({ authenticate: forbidden, getDatabase: forbidden })(request())).status, 503);
  for (const changed of [{ NODE_ENV: 'production' }, { VERCEL_ENV: 'production' }, { VERCEL_ENV: 'preview' }, { ADAPTIVE_SHADOW_WRITES_ENABLED: undefined }, { ADAPTIVE_SHADOW_WRITES_KILL_SWITCH: 'true' }]) assert.equal(localBoundaryEnabled({ ...env, ...changed }), false);
});
test('unauthenticated, invalid, anonymous and excluded users cannot enter persistence', async () => {
  assert.equal((await make()(request({}, { authorization: '' }))).status, 401);
  assert.equal((await make({ authenticate: async () => null })(request())).status, 401);
  assert.equal((await make({ authenticate: async () => ({ id: 'forged' }) })(request())).status, 401);
  assert.equal((await make({ authorizeOwner: async () => false })(request())).status, 403);
});
test('owner, correctness, concepts, versions and exposure are forbidden at boundary', async () => {
  for (const field of ['ownerId', 'correct', 'conceptId', 'mappingVersion', 'algorithmVersion', 'configurationVersion', 'classification', 'setIndex', 'allowProvisional', 'completionVerified', 'supersedesEvidenceId']) {
    assert.equal((await make()(request({ operation: 'answer', payload: { [field]: 'forged' } }))).status, 400);
  }
  assert.equal((await make()(request({ operation: 'recommendation', payload: {} }))).status, 400);
  assert.equal((await make()(request({ operation: 'answer', payload: {}, ownerId }))).status, 400);
});
test('bounded JSON rejects oversized, malformed and non-JSON requests', async () => {
  assert.equal((await make()(request({ padding: 'x'.repeat(40000) }))).status, 400);
  assert.equal((await make()(new Request('http://localhost/adaptive', { method: 'POST', headers: { authorization: 'Bearer token', 'content-type': 'application/json' }, body: '{' }))).status, 400);
  assert.equal((await make()(request({}, { 'content-type': 'text/plain' }))).status, 400);
});
test('kill switch is checked again after auth and before opening a database', async () => {
  let enabled = true, opens = 0;
  const handler = make({ readControl: async () => ({ enabled, killSwitch: false }), authenticate: async () => { enabled = false; return { id: ownerId }; }, getDatabase: async () => { opens++; } });
  assert.equal((await handler(request())).status, 503); assert.equal(opens, 0);
});
test('server session plans are owner-scoped and client plans are rejected', async () => {
  let received;
  const handler = make({ resolveSessionPlan: async (owner, id) => { received = [owner, id]; return { ownerId: 'another-owner' }; } });
  assert.equal((await handler(request({ operation: 'session', payload: { planId: ownerId } }))).status, 400);
  assert.deepEqual(received, [ownerId, ownerId]);
  assert.equal((await handler(request({ operation: 'session', payload: { planId: ownerId, revisionIds: [] } }))).status, 400);
});
test('Supabase Auth getUser is called remotely with bearer token and never trusts metadata', async () => {
  const calls = [];
  const authenticate = createAdaptiveAuthenticator({ url: 'https://fixture.supabase.co', publishableKey: 'fixture-public-key', fetchImpl: async (url, init) => {
    calls.push([String(url), new Headers(init.headers).get('authorization')]);
    return Response.json({ id: ownerId, email: 'private@example.invalid', user_metadata: { role: 'admin' }, is_anonymous: false });
  } });
  assert.deepEqual(await authenticate('signed-test-token'), { id: ownerId });
  assert.deepEqual(calls, [['https://fixture.supabase.co/auth/v1/user', 'Bearer signed-test-token']]);
  const anonymous = createAdaptiveAuthenticator({ url: 'https://fixture.supabase.co', publishableKey: 'fixture-public-key', fetchImpl: async () => Response.json({ id: ownerId, is_anonymous: true }) });
  assert.equal(await anonymous('token'), null);
});
test('transaction failure exposes no error contents and legacy result survives', async () => {
  const logs = [], result = await make({ log: item => logs.push(item) })(request());
  assert.equal(result.status, 503);
  const body = await result.json(); assert.deepEqual(Object.keys(body).sort(), ['incidentId', 'status']);
  assert.ok(!JSON.stringify([body, logs]).includes('sensitive'));
  const legacy = { score: 80, saved: true };
  assert.equal(await preserveLegacyResult(legacy, async () => { throw new Error('adaptive failure'); }), legacy);
});
test('operational logger allowlists fields/codes and ignores sink failures', async () => {
  const logs = [], emit = createOperationalEvents(record => logs.push(record));
  emit('learner@example.invalid', 'secret-token', NaN, { ownerId, answer: 'private' });
  assert.deepEqual(Object.keys(logs[0]).sort(), ['count', 'durationMs', 'event', 'incidentId', 'reason']);
  assert.ok(!JSON.stringify(logs).includes(ownerId)); assert.equal(logs[0].reason, 'unavailable');
  assert.doesNotThrow(() => createOperationalEvents(() => { throw new Error('sink failure'); })('deletion_failure'));
  createOperationalEvents(async () => { throw new Error('async sink failure'); })('deletion_failure');
  await new Promise(resolve => setImmediate(resolve));
});

function jobs(outcomes, overrides = {}) {
  let index = 0; const calls = [];
  const store = { claim: async () => index < outcomes.length ? { ownerId, enrollmentId: ownerId, attempt: 1, versions: {}, index: index++ } : null,
    complete: async (...args) => calls.push(['complete', ...args]), park: async (...args) => calls.push(['park', ...args]),
    retry: async (...args) => calls.push(['retry', ...args]), release: async (...args) => calls.push(['release', ...args]) };
  const drain = createProjectionDrain({ store, getDatabase: async () => ({}), project: () => [], readEnvironment: () => env, readControl: control, clock: () => 1000,
    rebuild: async () => { const value = outcomes[index - 1]; if (value instanceof Error) throw value; return value; }, ...overrides });
  return { drain, calls };
}
test('projection poison job is parked without blocking a different job', async () => {
  const { drain, calls } = jobs([new Error('private answer'), { status: 'ready', inputGeneration: 2 }]);
  assert.deepEqual(await drain(), { completed: 1, retried: 0, parked: 1, disabled: false });
  assert.deepEqual(calls.map(c => c[0]), ['park', 'complete']);
});
test('projection generation conflicts back off; quarantine never becomes success', async () => {
  const { drain, calls } = jobs([Object.assign(new Error('secret'), { code: '40001' }), { status: 'quarantined', reasonCodes: ['overlapping_sessions'] }]);
  assert.deepEqual(await drain(), { completed: 0, retried: 1, parked: 1, disabled: false });
  assert.equal(calls[0][2].availableAt, 3000); assert.equal(calls[1][2].reason, 'chronology_conflict');
});
test('projection drain has bounded work and production kill gate', async () => {
  const { drain } = jobs(Array.from({ length: 12 }, () => ({ status: 'ready', inputGeneration: 1 })));
  assert.equal((await drain()).completed, 5);
  const blocked = jobs([new Error('must not execute')], { readEnvironment: () => ({ ...env, NODE_ENV: 'production' }) });
  assert.equal((await blocked.drain()).disabled, true); assert.equal(blocked.calls.length, 0);
});
test('worker kill switch releases a claimed job before execution', async () => {
  let controls = 0;
  const { drain, calls } = jobs([new Error('must not execute')], { readControl: async () => ({ enabled: ++controls < 3, killSwitch: false }) });
  assert.equal((await drain()).disabled, true); assert.equal(calls[0][0], 'release');
});
test('account deletion remains an explicit integration blocker', () => {
  const deletion = readFileSync('server/account/delete.js', 'utf8');
  assert.ok(deletion.includes('auth.admin.deleteUser'));
  assert.ok(!deletion.includes('delete_learner_data'));
  assert.ok(readFileSync('supabase/migrations/20261001170334_adaptive_learning_persistence_foundation.sql', 'utf8').includes('on delete restrict'));
});
test('browser and routed APIs have no new adaptive server imports or credentials', () => {
  const walk = path => readdirSync(path, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${path}/${e.name}`) : [`${path}/${e.name}`]);
  for (const file of walk('src').filter(f => /\.(jsx?|mjs|ts)$/.test(f))) assert.ok(!/server\/adaptive|ADAPTIVE_DATABASE_URL|SUPABASE_SERVICE_ROLE_KEY/.test(readFileSync(file, 'utf8')), file);
  for (const file of walk('api')) assert.ok(!readFileSync(file, 'utf8').includes('server/adaptive'), file);
});
