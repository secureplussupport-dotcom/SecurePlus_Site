import { randomUUID } from 'node:crypto';
import { assertOwnerWritable } from '../../server/adaptive/owner-guard.mjs';
// Disposable process-local CONTRACT FIXTURE, not durable queue infrastructure.
export function createTestQueue(sql) {
  const rows=new Map();
  const valid=job=>rows.get(job.id)?.lease===job.lease;
  return {
    async enqueue(ownerId) {
      return sql.begin(async tx=>{
        const enrollmentId=await assertOwnerWritable(tx,ownerId);
        const row={id:randomUUID(),ownerId,enrollmentId,lease:null}; rows.set(row.id,row); return row.id;
      });
    },
    async claim(ownerId) {
      return sql.begin(async tx=>{
        const enrollmentId=await assertOwnerWritable(tx,ownerId);
        const row=[...rows.values()].find(r=>r.ownerId===ownerId && !r.lease && r.enrollmentId===enrollmentId);
        if(!row) return null;
        row.lease=randomUUID();return {...row};
      });
    },
    async acknowledge(job) {
      return sql.begin(async tx=>{
        await assertOwnerWritable(tx,job.ownerId,job.enrollmentId);
        if(!valid(job)) throw new Error('Lease fenced');
        rows.delete(job.id);
      });
    },
    async cancelOwner(ownerId) { for(const [id,row] of rows) if(row.ownerId===ownerId) rows.delete(id); },
    async remainingOwner(ownerId) { return [...rows.values()].filter(r=>r.ownerId===ownerId).length; },
  };
}
