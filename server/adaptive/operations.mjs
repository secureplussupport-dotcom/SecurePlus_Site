import { randomUUID } from 'node:crypto';

const events = new Set(['runtime_accepted', 'runtime_rejected', 'idempotent_retry', 'transaction_failure', 'projection_success', 'projection_failure', 'quarantine', 'generation_conflict', 'kill_switch', 'deletion_complete', 'deletion_failure', 'job_enqueued', 'job_deduplicated', 'job_claimed', 'lease_recovered', 'job_acknowledged', 'job_retry', 'job_released', 'job_parked', 'job_cancelled', 'scheduler_denied', 'connection_denied', 'connection_failure']);
const reasons = new Set(['ok', 'disabled', 'unauthenticated', 'ineligible', 'invalid_request', 'conflict', 'unavailable', 'retryable', 'poison_job', 'generation_changed', 'chronology_conflict']);

// No payload spreading, external correlation IDs, exception messages or user IDs.
export function createOperationalEvents(sink = () => {}) {
  return (event, reason = 'ok', durationMs = 0) => {
    const record = { event: events.has(event) ? event : 'runtime_rejected', reason: reasons.has(reason) ? reason : 'unavailable',
      incidentId: randomUUID(), count: 1, durationMs: Number.isFinite(durationMs) ? Math.max(0, Math.min(3600000, Math.round(durationMs))) : 0 };
    try { Promise.resolve(sink(record)).catch(() => {}); } catch { /* Monitoring cannot affect authoritative flows. */ }
    return record.incidentId;
  };
}

// The Phase 2B-2 hard production deny remains intact. A future reviewed rollout
// must deliberately supply a production adapter; no environment flag alone does it.
export function localBoundaryEnabled(env) {
  return env?.ADAPTIVE_SHADOW_WRITES_ENABLED === 'true' && env.ADAPTIVE_SHADOW_WRITES_KILL_SWITCH === 'false' &&
    env.ADAPTIVE_RUNTIME_ENVIRONMENT === 'disposable_local' && env.NODE_ENV !== 'production' && !env.VERCEL_ENV;
}

export async function preserveLegacyResult(legacyResult, shadow) {
  try { await shadow(); } catch { /* Never substitute shadow output for legacy output. */ }
  return legacyResult;
}
