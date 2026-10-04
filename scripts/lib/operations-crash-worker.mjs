import {createAdaptiveScheduler,createSchedulerReplayGuard} from '../../server/adaptive/scheduler-boundary.mjs';
import {createTrustedProjectionDrain} from '../../server/adaptive/trusted-learning-runtime.mjs';
import {randomUUID} from 'node:crypto';
import {createAdaptiveDatabase} from '../../server/adaptive/database.mjs';
import {createDurableQueue} from '../../server/adaptive/durable-queue.mjs';
import {rebuildTrustedLearningOwner,executePinnedModel} from '../../server/adaptive/trusted-learning-runtime.mjs';
import {rebuildAdaptiveOwner} from '../../server/adaptive/projection-worker.mjs';
import {loadCompleteSnapshot,assertSnapshotBudget} from '../../server/adaptive/runtime-bundle.mjs';
const raw=createAdaptiveDatabase({max:1});const db=(...args)=>db.begin(tx=>tx(...args));db.begin=fn=>raw.begin(async tx=>{await tx`set local role adaptive_worker`;return fn(tx);});
const queue=createDurableQueue(db),phase=process.argv[2];
const pause=(stage,job)=>new Promise(()=>process.send({stage,job}));
try{
 if(phase==='scheduler'){
  const store={...queue,claim:async()=>{const job=await queue.claim(process.env.ADAPTIVE_TEST_OWNER);await pause('scheduler',job);}};
  const drain=createTrustedProjectionDrain({store,getDatabase:async()=>db,readControl:async()=>({enabled:true,killSwitch:false})});
  const scheduler=createAdaptiveScheduler({verifyCredential:async nonce=>({kind:'scheduler',audience:'adaptive-worker',nonce,expiresAt:Date.now()+30000}),consumeNonce:createSchedulerReplayGuard(db),drain});
  await scheduler(new Request('http://localhost/fixture',{method:'POST',headers:{'content-type':'application/json',authorization:'Scheduler '+randomUUID()},body:'{}'}));
 }
 const job=await queue.claim(process.env.ADAPTIVE_TEST_OWNER);if(!job)throw new Error('No work');
 if(phase==='claim')await pause('claim',job);
 if(phase==='compute')await rebuildAdaptiveOwner(db,job.ownerId,{job,enrollmentId:job.enrollmentId,checkSnapshotBudget:assertSnapshotBudget,prepareSnapshot:(tx,s)=>loadCompleteSnapshot(tx,s,job),project:async s=>{await executePinnedModel(s);await pause('compute',job);}});
 const result=await rebuildTrustedLearningOwner(db,job.ownerId,{job});
 if(phase==='publication')await pause(result.status,job);
 if(result.status==='ready')await queue.complete(job);
 await pause('ack',job);
}catch{process.exit(1);}
