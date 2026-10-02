import { startAdaptiveSession, ingestAdaptiveAnswer, recordAdaptiveIntervention, recordAdaptiveSessionEvent } from './persistence.mjs';
import { createOperationalEvents, localBoundaryEnabled } from './operations.mjs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fields = {
  session: ['planId'],
  answer: ['clientEventId', 'sessionId', 'itemPosition', 'revisionId', 'selectedComponents', 'occurredAt', 'responseDurationMs'],
  intervention: ['clientEventId', 'recommendationId', 'eventType', 'activityType', 'occurredAt'],
  session_event: ['clientEventId', 'sessionId', 'status', 'occurredAt'],
};
class InvalidRequest extends Error {}
function exact(value, allowed) {
  if (!value || Object.getPrototypeOf(value) !== Object.prototype || Object.keys(value).some(k => !allowed.includes(k))) throw new InvalidRequest();
}
async function readRequest(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new InvalidRequest();
  const reader = request.body?.getReader();
  if (!reader) throw new InvalidRequest();
  let bytes = 0; const chunks = [];
  try {
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      bytes += value.byteLength;
      if (bytes > 32768) throw new InvalidRequest();
      chunks.push(Buffer.from(value));
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { await reader.cancel().catch(() => {}); throw new InvalidRequest(); }
  finally { reader.releaseLock(); }
}
const response = (status, body) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

// Fetch-style handler supported by Vercel's Node runtime. No /api file exports
// it in this phase. All dependencies are server capabilities, not request fields.
export function createAdaptiveHandler({ authenticate, getDatabase, resolveSessionPlan, authorizeOwner = async () => false,
  readEnvironment = () => process.env, readControl = async () => ({ enabled: false, killSwitch: true }),
  verifyCompletion, log } = {}) {
  const emit = createOperationalEvents(log);
  const permitted = async () => {
    if (!localBoundaryEnabled(readEnvironment())) return false;
    const control = await readControl();
    return control?.enabled === true && control.killSwitch === false;
  };
  return async request => {
    const started = performance.now();
    try {
      if (!await permitted()) { emit('kill_switch', 'disabled'); return response(503, { status: 'disabled' }); }
      if (request.method !== 'POST') return response(405, { status: 'rejected' });
      const token = request.headers.get('authorization')?.match(/^Bearer ([^\s]{1,8192})$/i)?.[1];
      if (!token) { emit('runtime_rejected', 'unauthenticated'); return response(401, { status: 'rejected' }); }
      const user = await authenticate(token);
      if (!user || !UUID.test(user.id)) { emit('runtime_rejected', 'unauthenticated'); return response(401, { status: 'rejected' }); }
      const ownerId = user.id.toLowerCase();
      if (!await authorizeOwner(ownerId)) { emit('runtime_rejected', 'ineligible'); return response(403, { status: 'rejected' }); }
      const body = await readRequest(request);
      exact(body, ['operation', 'payload']);
      if (!Object.hasOwn(fields, body.operation)) throw new InvalidRequest();
      exact(body.payload, fields[body.operation]);
      // Capture no trusted plan from a browser. Its opaque ID resolves only in
      // an owner-scoped, server-created immutable plan store (not yet deployed).
      let plan;
      if (body.operation === 'session') {
        if (!UUID.test(body.payload.planId)) throw new InvalidRequest();
        plan = await resolveSessionPlan(ownerId, body.payload.planId);
        if (!plan || plan.ownerId !== ownerId) throw new InvalidRequest();
      }
      if (!await permitted()) { emit('kill_switch', 'disabled'); return response(503, { status: 'disabled' }); }
      const sql = await getDatabase();
      // Recheck after any pool acquisition; kill switch stops future starts.
      if (!await permitted()) { emit('kill_switch', 'disabled'); return response(503, { status: 'disabled' }); }
      let result, receiptId;
      if (body.operation === 'session') { result = await startAdaptiveSession(sql, ownerId, plan.plan); receiptId = result.sessionId; }
      if (body.operation === 'answer') { result = await ingestAdaptiveAnswer(sql, ownerId, body.payload); receiptId = result.evidenceId; }
      if (body.operation === 'intervention') { result = await recordAdaptiveIntervention(sql, ownerId, body.payload, { verifyCompletion }); receiptId = result.interventionId; }
      if (body.operation === 'session_event') { result = await recordAdaptiveSessionEvent(sql, ownerId, body.payload); receiptId = result.eventId; }
      emit(result.status === 'retry' ? 'idempotent_retry' : 'runtime_accepted', 'ok', performance.now() - started);
      // Shadow output cannot influence legacy scores, selections or mastery UI.
      return response(200, { status: 'accepted', receiptId });
    } catch (error) {
      if (error instanceof InvalidRequest) { emit('runtime_rejected', 'invalid_request'); return response(400, { status: 'rejected' }); }
      if (error?.code === 'adaptive_conflict') { emit('runtime_rejected', 'conflict'); return response(409, { status: 'conflict' }); }
      const incidentId = emit('transaction_failure', 'unavailable', performance.now() - started);
      return response(503, { status: 'unavailable', incidentId });
    }
  };
}
