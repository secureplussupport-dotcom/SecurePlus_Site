// Disposable child-process fixture. IPC stays in the parent test; nothing logged.
import { createAdaptiveDatabase } from '../../server/adaptive/database.mjs';
import { createDurableQueue } from '../../server/adaptive/durable-queue.mjs';
import { rebuildAdaptiveOwner } from '../../server/adaptive/projection-worker.mjs';
const pool=createAdaptiveDatabase({max:1});
const db=(...args)=>db.begin(tx=>tx(...args));
db.begin=fn=>pool.begin(async tx=>{await tx`set local role adaptive_worker`;return fn(tx);});
try {
 const job=await createDurableQueue(db).claim(process.env.ADAPTIVE_TEST_OWNER);
 if(!job)process.exit(2);
 const crash=()=>new Promise(()=>process.send({job},()=>process.exit(0)));
 if(process.env.ADAPTIVE_TEST_CRASH==='compute')await rebuildAdaptiveOwner(db,job.ownerId,{job,enrollmentId:job.enrollmentId,now:new Date(Date.now()+2000).toISOString(),project:crash});
 else await crash();
}catch{process.exit(3);}
