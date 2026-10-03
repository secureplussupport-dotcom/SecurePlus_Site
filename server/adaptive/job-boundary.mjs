import { rebuildAdaptiveOwner } from './projection-worker.mjs';
import { createOperationalEvents, localBoundaryEnabled } from './operations.mjs';

// Adapter contract for a FUTURE durable queue. No in-memory queue masquerades as
// production persistence. Store must atomically claim with a lease/fencing token,
// dedupe owner+generation+version triple, and fence all complete/retry/park calls.
export function createProjectionDrain({ store, getDatabase, project, readEnvironment = () => process.env,
  readControl = async () => ({ enabled: false, killSwitch: true }), log, clock = () => Date.now(), rebuild = rebuildAdaptiveOwner }) {
  const emit = createOperationalEvents(log);
  const enabled = async () => {
    if (!localBoundaryEnabled(readEnvironment())) return false;
    const control = await readControl(); return control?.enabled === true && control.killSwitch === false;
  };
  return async () => {
    const summary = { completed: 0, retried: 0, parked: 0, disabled: false };
    if (!await enabled()) return { ...summary, disabled: true };
    // One job at a time per drain; durable global limit remains a store duty.
    for (let n = 0; n < 5; n++) {
      if (!await enabled()) { summary.disabled = true; break; }
      const job = await store.claim({ now: clock(), leaseMs: 30000 });
      if (!job) break;
      try {
        if (!await enabled()) { await store.release(job); summary.disabled = true; break; }
        const sql = await getDatabase();
        if (!await enabled()) { await store.release(job); summary.disabled = true; break; }
        if (!job.enrollmentId) throw Object.assign(new Error('Missing job enrollment fence'), { code: '55000' });
        const result = await rebuild(sql, job.ownerId, { enrollmentId: job.enrollmentId, project: snapshot => project(snapshot, job.versions) });
        if (result.status === 'quarantined') {
          await store.park(job, { reason: 'chronology_conflict' }); summary.parked++; emit('quarantine', 'chronology_conflict');
        } else {
          await store.complete(job, { observedGeneration: result.inputGeneration }); summary.completed++; emit('projection_success');
        }
      } catch (error) {
        const retryable = ['40001', '40P01', '53300', '57P01', '08006', 'ECONNRESET'].includes(error?.code);
        if (retryable && Number.isSafeInteger(job.attempt) && job.attempt >= 1 && job.attempt < 5) {
          await store.retry(job, { availableAt: clock() + Math.min(60000, 1000 * 2 ** job.attempt), reason: error.code === '40001' ? 'generation_changed' : 'retryable' });
          summary.retried++; emit(error.code === '40001' ? 'generation_conflict' : 'projection_failure', 'retryable');
        } else { await store.park(job, { reason: 'poison_job' }); summary.parked++; emit('projection_failure', 'poison_job'); }
      }
    }
    return summary;
  };
}
