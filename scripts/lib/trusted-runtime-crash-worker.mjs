// Disposable process-exit fixture, never imported by a runtime route.
import {createAdaptiveDatabase} from '../../server/adaptive/database.mjs';
import {createDurableQueue} from '../../server/adaptive/durable-queue.mjs';
import {rebuildTrustedLearningOwner} from '../../server/adaptive/trusted-learning-runtime.mjs';
const pool=createAdaptiveDatabase({max:1});
const sql=(...args)=>sql.begin(tx=>tx(...args));sql.begin=fn=>pool.begin(async tx=>{await tx`set local role adaptive_worker`;return fn(tx);});
const queue=createDurableQueue(sql),owner=process.env.ADAPTIVE_TEST_OWNER;
try{const job=await queue.claim(owner);if(!job)throw new Error('No job');const result=await rebuildTrustedLearningOwner(sql,owner,{job});process.send({job,status:result.status},()=>process.exit(0));}
catch{process.exit(1);}
