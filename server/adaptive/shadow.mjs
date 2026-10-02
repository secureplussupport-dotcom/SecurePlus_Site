import { randomUUID } from 'node:crypto';

// Hard production deny for this phase; no setting in a browser request is read.
// A future separately approved rollout must deliberately replace this guard.
export function shadowWritesAllowed(env = process.env) {
  return env.ADAPTIVE_SHADOW_WRITES_ENABLED === 'true' && env.ADAPTIVE_SHADOW_WRITES_KILL_SWITCH === 'false' &&
    env.ADAPTIVE_RUNTIME_ENVIRONMENT === 'disposable_local' && env.NODE_ENV !== 'production' && !env.VERCEL_ENV;
}

// This is an unwired, local-only runner, not a substitute for an authenticated
// atomic ingestion transaction. Legacy callers must commit their own result first.
export function createShadowRunner({ readEnvironment = () => process.env, write, log = () => {} }) {
  if (typeof write !== 'function') throw new Error('Missing shadow operation');
  return async function runShadow() {
    try {
      if (!shadowWritesAllowed(readEnvironment())) return { status: 'disabled' };
      await write();
      return { status: 'written' };
    } catch {
      // Never log exception text, learner IDs, answers, or caller-controlled IDs.
      const incidentId = randomUUID();
      try { log({ code: 'adaptive_shadow_failed', incidentId }); } catch { /* telemetry must not break legacy flow */ }
      return { status: 'failed', incidentId };
    }
  };
}
