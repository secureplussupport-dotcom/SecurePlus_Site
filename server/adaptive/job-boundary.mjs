import { rebuildAdaptiveOwner } from './projection-worker.mjs';
import { createOperationalEvents, localBoundaryEnabled } from './operations.mjs';

// Bounded drain backed by the private durable queue. No in-memory queue masquerades as
// production persistence. Store must atomically claim with a lease/fencing token,
// dedupe owner+generation+version triple, and fence all complete/retry/park calls.
export function createProjectionDrain({ store, getDatabase, project, readEnvironment = () => process.env,
  readControl = async () => ({ enabled: false, killSwitch: true }), log, clock = () => Date.now(), rebuild = rebuildAdaptiveOwner }) {
  const emit = createOperationalEvents(log);
  const enabled = async () => {
    if (!localBoundaryEnabled(readEnvironment())) return false;
    const control = await readControl(); return control?.enabled === true && control.killSwitch === false;
  };
  return async ({deadline=clock()+20000}={}) => {
    const summary = { completed: 0, retried: 0, parked: 0, disabled: false };
    if (!await enabled()) { emit('kill_switch','disabled'); return { ...summary, disabled: true }; }
    // One job at a time per drain; durable global limit remains a store duty.
    for (let n = 0; n < 5; n++) {
      if (clock()>=deadline || !await enabled()) { summary.disabled = true; emit('kill_switch','disabled'); break; }
      const job = await store.claim({ now: clock(), leaseMs: 30000 });
      if (!job) break;
      try {
        if (clock()>=deadline || !await enabled()) { await store.release(job); summary.disabled = true; break; }
        const sql = await getDatabase();
        if (clock()>=deadline || !await enabled()) { await store.release(job); summary.disabled = true; break; }
        if (!job.enrollmentId) throw Object.assign(new Error('Missing job enrollment fence'), { code: '55000' });
        const replayStarted = clock();
        const result = await rebuild(sql, job.ownerId, { enrollmentId: job.enrollmentId, job:store.durable?job:null, project: async snapshot => {
          let timer;
          try {
            const rows=await Promise.race([Promise.resolve(project(snapshot,job.versions)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error('Projection deadline'),{code:'57014'})),Math.max(1,Math.min(10000,deadline-clock())));})]);
            if(clock()>=deadline)throw Object.assign(new Error('Projection deadline'),{code:'57014'});
            return rows;
          }finally{clearTimeout(timer);}
        } });
        if (result.status === 'rescheduled') {
          summary.retried++; emit('generation_conflict','generation_changed');
        } else if (result.status === 'quarantined') {
          await store.park(job, { reason: 'chronology_conflict' }); summary.parked++; emit('quarantine', 'chronology_conflict');
        } else {
          await store.complete(job, { observedGeneration: result.inputGeneration }); summary.completed++; emit('projection_success','ok',clock()-replayStarted);
        }
      } catch (error) {
        // Cancellation/expiry has already fenced this lease. Do not attempt to
        // mutate a newer lease or let one removed owner stop the whole drain.
        if(error?.code==='55000'){emit('projection_failure','unavailable');continue;}
        const retryable = ['40001', '40P01', '53300', '57P01', '08006', 'ECONNRESET', '57014', '55P03'].includes(error?.code);
        if (retryable && Number.isSafeInteger(job.attempt) && job.attempt >= 1 && job.attempt < 5) {
          await store.retry(job, { availableAt: clock() + Math.min(60000, 1000 * 2 ** job.attempt), reason: error.code === '40001' ? 'generation_changed' : 'retryable' });
          summary.retried++; emit(error.code === '40001' ? 'generation_conflict' : 'projection_failure', 'retryable');
        } else { await store.park(job, { reason: 'poison_job' }); summary.parked++; emit('projection_failure', 'poison_job'); }
      }
    }
    return summary;
  };
}
