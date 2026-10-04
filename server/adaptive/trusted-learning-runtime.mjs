import { Worker } from 'node:worker_threads';
import { rebuildAdaptiveOwner } from './projection-worker.mjs';
import { loadCompleteSnapshot,assertSnapshotBudget,RUNTIME_LIMITS,requireRuntime } from './runtime-bundle.mjs';
import { createProjectionDrain } from './job-boundary.mjs';

export function executePinnedModel(snapshot,{timeoutMs=RUNTIME_LIMITS.cpuMs}={}) {
 requireRuntime(Number.isInteger(timeoutMs)&&timeoutMs>0&&timeoutMs<=RUNTIME_LIMITS.cpuMs,'Invalid model deadline');
 return new Promise((resolve,reject)=>{
  const worker=new Worker(new URL('./model-worker.mjs',import.meta.url),{workerData:snapshot,env:{},resourceLimits:{maxOldGenerationSizeMb:128,maxYoungGenerationSizeMb:32},execArgv:[]});
  let settled=false;
  const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);void worker.terminate();error?reject(error):resolve(value);};
  const fail=code=>Object.assign(new Error('Pinned model unavailable'),{code});
  const timer=setTimeout(()=>finish(fail('57014')),timeoutMs);
  worker.on('message',message=>finish(message.error?fail(message.error):null,message.result));
  worker.on('error',()=>finish(fail('adaptive_runtime_invalid')));
  worker.on('exit',()=>{if(!settled)finish(fail('adaptive_runtime_invalid'));});
 });
}

export async function rebuildTrustedLearningOwner(sql,ownerId,{job,enrollmentId=job?.enrollmentId,now=null}={}) {
 requireRuntime(job?.ownerId===ownerId&&enrollmentId===job.enrollmentId,'Trusted runtime requires an owned durable lease');
 let output;
 return rebuildAdaptiveOwner(sql,ownerId,{job,enrollmentId,now,
  checkSnapshotBudget:assertSnapshotBudget,
  prepareSnapshot:(tx,snapshot)=>loadCompleteSnapshot(tx,snapshot,job),
  project:async snapshot=>{output=await executePinnedModel(snapshot);return output.projections;},
  persistOutputs:async tx=>{
   const [row]=await tx`select adaptive_private.apply_learning_outputs(${job.id},${job.fence}::bigint,${ownerId},${enrollmentId},${job.generation},${tx.json({recommendations:output.recommendations,tasks:output.tasks,events:output.events})}) as rescheduled`;
   return row.rescheduled;
  },
 });
}

export function createTrustedProjectionDrain({store,getDatabase,readEnvironment,readControl,log,clock}) {
 return createProjectionDrain({store,getDatabase,readEnvironment,readControl,log,clock,rebuild:rebuildTrustedLearningOwner});
}
