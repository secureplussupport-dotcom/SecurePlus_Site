import { createOperationalEvents } from './operations.mjs';

const jobFromRow = r => r && ({ id:r.job_id, ownerId:r.owner_id, enrollmentId:r.enrollment_id,
  generation:Number(r.evidence_generation), attempt:r.attempt, fence:String(r.fence), leaseUntil:r.lease_until,
  versions:{mappingVersion:r.mapping_version,algorithmVersion:r.algorithm_version,configurationVersion:r.configuration_version} });
export async function assertJobLease(tx, job, requireGeneration=true) {
  await tx`select adaptive_private.assert_job(${job.id},${job.fence}::bigint,${job.ownerId},${job.enrollmentId},${job.generation},${requireGeneration})`;
}
export async function bindJobLease(tx, job) {
  await assertJobLease(tx,job);
  await tx`select set_config('adaptive.job_id',${job.id},true),set_config('adaptive.job_fence',${job.fence},true),set_config('adaptive.enrollment_id',${job.enrollmentId},true)`;
}
// SQL functions, not this JavaScript instance, own deduplication/concurrency/time.
export function createDurableQueue(sql,{log}={}) {
  const emit=createOperationalEvents(log);
  const finish=async(job,outcome,reason='ok')=>{
    await sql`select adaptive_private.finish_job(${job.id},${job.fence}::bigint,${job.ownerId},${job.enrollmentId},${job.generation},${outcome},${reason})`;
    emit(outcome==='completed'?'job_acknowledged':outcome==='retry'?'job_retry':outcome==='quarantined'?'quarantine':outcome==='release'?'job_released':'job_parked',reason);
  };
  return {
    durable:true,
    async enqueue(ownerId){const rows=await sql`select * from adaptive_private.enqueue_owner(${ownerId})`;for(const r of rows)emit(r.deduplicated?'job_deduplicated':'job_enqueued');return rows.map(r=>r.job_id);},
    async claim(input={}) {const target=typeof input==='string'?input:null;const [row]=await sql`select * from adaptive_private.claim_job(${target}::uuid)`;if(row){emit('job_claimed');if(row.reason==='lease_expired')emit('lease_recovered');}return jobFromRow(row)??null;},
    async complete(job,{observedGeneration=job.generation}={}){if(observedGeneration!==job.generation)throw Object.assign(new Error('Generation changed'),{code:'40001'});return finish(job,'completed');},
    acknowledge:job=>finish(job,'completed'),
    retry:(job,{reason='retryable'}={})=>finish(job,'retry',reason),
    release:job=>finish(job,'release','disabled'),
    park:(job,{reason='poison_job'}={})=>finish(job,reason==='chronology_conflict'?'quarantined':'dead_letter',reason),
    async cancelOwner(owner){const [r]=await sql`select adaptive_private.cancel_owner_jobs(${owner}) as count`;emit('job_cancelled');return Number(r.count);},
    async remainingOwner(owner){const [r]=await sql`select adaptive_private.remaining_owner_jobs(${owner}) as count`;return Number(r.count);},
  };
}
