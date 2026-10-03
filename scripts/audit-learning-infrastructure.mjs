import assert from 'node:assert/strict';
import { randomUUID,randomBytes } from 'node:crypto';
import { fork } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { createAdaptiveDatabase,closeAdaptiveDatabase } from '../server/adaptive/database.mjs';
import { createDurableQueue } from '../server/adaptive/durable-queue.mjs';
import { startAdaptiveSession,ingestAdaptiveAnswer,recordAdaptiveSessionEvent } from '../server/adaptive/persistence.mjs';
import { rebuildAdaptiveOwner } from '../server/adaptive/projection-worker.mjs';
import { withdrawShadow,eraseExpiredEnrollments,resumeAdaptiveErasure } from '../server/adaptive/deletion.mjs';
import { createProductionShapedDatabase,closeProductionShapedPools } from '../server/adaptive/production-database.mjs';
import { createAdaptiveScheduler,createSchedulerReplayGuard } from '../server/adaptive/scheduler-boundary.mjs';
import { createProjectionDrain } from '../server/adaptive/job-boundary.mjs';
import postgres from 'postgres';

const sql=createAdaptiveDatabase({max:12}), pool=createAdaptiveDatabase({max:12});
const asRole=role=>{const db=(...args)=>db.begin(tx=>tx(...args));db.begin=fn=>pool.begin(async tx=>{await tx.unsafe(`set local role ${role}`);await tx`set local statement_timeout='5s'`;return fn(tx);});return db;};
const ingest=asRole('adaptive_ingest'),worker=asRole('adaptive_worker'),erasure=asRole('adaptive_erasure');
const logs=[],q=createDurableQueue(worker,{log:r=>logs.push(r)}),deleteQueue=createDurableQueue(erasure,{log:r=>logs.push(r)});
const v={mappingVersion:'local-map-v1',algorithmVersion:'local-algo-v1',configurationVersion:'local-config-v1'};
let n=0;const check=(value,label)=>{assert.ok(value,label);n++;};
const rejects=async(fn,label)=>{await assert.rejects(fn,undefined,label);n++;};
const pause=()=>{let resolve;return {promise:new Promise(r=>resolve=r),resolve:()=>resolve()};};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const owners=[];let revision,compiled;
async function owner(){const id=randomUUID();owners.push(id);await sql`insert into auth.users(id) values(${id})`;await sql`select adaptive_private.enroll_shadow(${id},clock_timestamp()+interval '1 day',gen_random_uuid())`;return id;}
async function graph(id,answers=1,db=ingest){
 const session=await startAdaptiveSession(db,id,{sessionId:randomUUID(),source:'practice',mode:'normal',seed:null,requestedCount:1,requestedPbqCount:0,revisionIds:[revision],...v});
 const selected=compiled.components.find(c=>c.kind==='option'&&c.id!==compiled.gradingKey.expected[0].valueId).id;
 let evidence;
 for(let i=0;i<answers;i++)evidence=await ingestAdaptiveAnswer(db,id,{clientEventId:randomUUID(),sessionId:session.sessionId,itemPosition:1,revisionId:revision,selectedComponents:[{componentId:selected,valueId:selected}],occurredAt:new Date(Date.parse(session.startedAt)+100+i).toISOString()});
 return {session,evidence};
}
const cleanup={queue:deleteQueue};
async function crashedJob(id,mode){
 return new Promise((resolve,reject)=>{
  const child=fork('scripts/lib/adaptive-crash-worker.mjs',[],{env:{...process.env,ADAPTIVE_TEST_OWNER:id,ADAPTIVE_TEST_CRASH:mode},stdio:['ignore','ignore','ignore','ipc']});
  let job;child.on('message',message=>{job=message.job;});
  const timer=setTimeout(()=>{child.kill();reject(new Error('Crash fixture deadline'));},10000);
  child.on('exit',code=>{clearTimeout(timer);code===0&&job?resolve(job):reject(new Error('Crash fixture failed'));});
 });
}
const jobRow=async job=>(await sql`select * from adaptive_private.projection_jobs where job_id=${job.id}`)[0];
async function expire(job){await sql`update adaptive_private.projection_jobs set lease_until=clock_timestamp()-interval '1 second' where job_id=${job.id}`;}
const claimed=async id=>{for(let i=0;i<4;i++){const j=await q.claim(id);if(j)return j;}throw new Error('Expected eligible claim');};
const project=(id,evidence)=>snapshot=>[{ownerId:id,conceptId:'recovery.rto',...v,state:'learning_signal',evidenceLevel:'limited',effectiveSample:1,distinctQuestions:1,distinctScenarios:1,completeEvidenceCount:1,everSticky:false,lapseCount:0,unresolvedEvidenceIds:[evidence.evidenceId],lastAnswerAt:snapshot.evidence.at(-1).occurred_at.toISOString(),lastInterventionAt:null,provenAt:null,masteredAt:null,nextDueTaskId:null,inputGeneration:snapshot.generation}];
try{
 // Local harness only: Supabase postgres is a managed non-superuser. Creator
 // membership has ADMIN but SET false on PG17; opt in to role impersonation.
 await sql`grant adaptive_ingest,adaptive_worker,adaptive_erasure to postgres with inherit false, set true`;
 const [source]=await sql`select revision_id,grading_payload from adaptive_private.grading_keys limit 1`;revision=source.revision_id;compiled=source.grading_payload.compiledRevision;
 for(const role of ['adaptive_ingest','adaptive_worker','adaptive_erasure']){
  const [r]=await sql`select * from pg_roles where rolname=${role}`;
  check(r&&!r.rolcanlogin&&!r.rolsuper&&!r.rolbypassrls&&!r.rolcreaterole&&!r.rolcreatedb,`${role} has no login or elevated authority`);
  await rejects(()=>asRole(role).begin(tx=>tx`select * from auth.users`),'No raw Auth data');
  await rejects(()=>asRole(role).begin(tx=>tx`insert into adaptive_private.shadow_authorizations default values`),'No self authorization');
  await rejects(()=>asRole(role).begin(tx=>tx`select adaptive_private.enroll_shadow(gen_random_uuid(),clock_timestamp()+interval '1 day',gen_random_uuid())`),'No self enrollment');
  await rejects(()=>asRole(role).begin(tx=>tx`select adaptive_private.erase_owned_graph(gen_random_uuid())`),'No broad eraser');
 }
 await rejects(()=>worker`select * from adaptive_private.grading_keys`,'Worker has no grading key');
 await rejects(()=>ingest`select * from adaptive_private.version_payloads`,'Ingestion has no model payload');
 await rejects(()=>erasure`select * from public.adaptive_answer_evidence`,'Erasure cannot read raw evidence');
 await rejects(()=>ingest`select * from adaptive_private.projection_jobs`,'Ingest cannot inspect queue');
 await rejects(()=>ingest`select * from adaptive_private.claim_job(null)`,'Ingest cannot claim jobs');
 await rejects(()=>worker`select adaptive_private.begin_erasure(gen_random_uuid(),'withdrawal')`,'Worker cannot erase');
 await rejects(()=>worker`insert into public.adaptive_answer_evidence default values`,'Worker cannot forge answers');
 await rejects(()=>ingest`insert into public.adaptive_concept_projections default values`,'Ingest cannot publish predictions');
 const a=await owner(),b=await owner(),c=await owner();
 await rejects(()=>ingest`insert into adaptive_private.owner_state(owner_id,evidence_generation) values(${a},900)`,'Ingest cannot forge generation');
 await rejects(()=>worker`insert into adaptive_private.owner_state(owner_id,evidence_generation) values(${a},900)`,'Worker cannot forge generation');
 await rejects(()=>worker`select * from adaptive_private.shadow_enrollments`,'Worker cannot read consent records');const ga=await graph(a);await graph(b);await graph(c);
 await rejects(()=>worker`update adaptive_private.owner_state set replay_status='ready' where owner_id=${a}`,'Unleased worker cannot change replay state');
 check((await sql`select count(*)::int n from adaptive_private.projection_jobs where owner_id=${a}`)[0].n>=2,'Commit automatically enqueues without JavaScript follow-up');
 const generation=(await sql`select evidence_generation from adaptive_private.owner_state where owner_id=${a}`)[0].evidence_generation;
 const enqueueStart=performance.now();await Promise.all(Array.from({length:12},()=>q.enqueue(a)));
 check((await sql`select count(*)::int n from adaptive_private.projection_jobs where owner_id=${a} and evidence_generation=${generation}`)[0].n===1,'Concurrent enqueue deduplicates durable identity');
 const enqueueMs=performance.now()-enqueueStart;
 const before=(await sql`select count(*)::int n from adaptive_private.projection_jobs where owner_id=${a}`)[0].n;
 await rejects(()=>sql.begin(async tx=>{await tx`select adaptive_private.assert_owner_writable(${a})`;await tx`update adaptive_private.owner_state set evidence_generation=evidence_generation+1 where owner_id=${a}`;throw new Error('Crash before commit');}),'Evidence/enqueue rollback atomic');
 check((await sql`select count(*)::int n from adaptive_private.projection_jobs where owner_id=${a}`)[0].n===before,'Rollback leaves no phantom job');
 const claimStart=performance.now();const claims=await Promise.all(Array.from({length:12},(_,i)=>q.claim([a,b,c][i%3])));
 const leased=claims.filter(Boolean);check(new Set(leased.map(j=>j.id)).size===leased.length,'Concurrent claimers never duplicate job');
 // Try-lock contention can return no job. Fill the available slots on later invocations.
 for(const id of [a,b,c]){const j=await q.claim(id);if(j)leased.push(j);}
 check(leased.length===2 && new Set(leased.map(j=>j.ownerId)).size===2,'DB enforces global two and per-owner one');
 const claimMs=performance.now()-claimStart;
 check((await jobRow(leased[0])).lease_until-Date.now()>28000,'Lease starts at thirty seconds');
 check(await q.claim(leased[0].ownerId)===null,'Same owner cannot hold a second lease');
 check(await q.claim([a,b,c].find(id=>!leased.some(j=>j.ownerId===id)))===null,'Third owner waits for global capacity');
 const ackStart=performance.now();await q.complete(leased[0]);const ackMs=performance.now()-ackStart;await q.complete(leased[1]);
 await rejects(()=>q.complete(leased[0]),'Completed lease cannot acknowledge twice');
 const remaining=[a,b,c].find(id=>!leased.some(j=>j.ownerId===id));let j=await claimed(remaining);const stale={...j};
 await expire(j);await rejects(()=>q.complete(j),'Expired lease cannot acknowledge');await rejects(()=>q.retry(j),'Expired lease cannot retry');await rejects(()=>q.release(j),'Expired lease cannot release');
 j=await claimed(remaining);check(BigInt(j.fence)>BigInt(stale.fence)&&j.attempt===2,'Crash before ack recovers with monotonic fence');
 await rejects(()=>q.complete(stale),'Recovered lease rejects old worker');
 await q.retry(j);let r=await jobRow(j);check(r.status==='retry'&&r.jitter_ms>=0&&r.jitter_ms<=500&&r.eligible_at-Date.now()>3000,'Database retry time and bounded jitter');
 for(let attempt=3;attempt<=5;attempt++){
  await sql`update adaptive_private.projection_jobs set eligible_at=clock_timestamp()-interval '1 second' where job_id=${j.id}`;
  j=await claimed(remaining);check(j.attempt===attempt,'Attempt counter persists across new queue instances');await q.retry(j);
 }
 check((await jobRow(j)).status==='dead_letter','Fifth failure dead-letters');check(await q.claim(remaining)===null,'Exhausted job never reclaims');
 for(const id of [a,b,c])await withdrawShadow(erasure,id,cleanup);
 // Owner lock does not stall other owners, nor let a queued claimant invert deletion.
 const d=await owner(),e=await owner();await graph(d);await graph(e);const entered=pause(),release=pause();
 const hold=sql.begin(async tx=>{await tx`select adaptive_private.assert_owner_writable(${d})`;entered.resolve();await release.promise;});await entered.promise;
 const parallel=await q.claim();check(parallel&&parallel.ownerId!==d,'Global claim skips locked owner');await q.complete(parallel);
 release.resolve();await hold;
 const jd=await claimed(d);await q.park(jd,{reason:'chronology_conflict'});check((await jobRow(jd)).status==='quarantined','Quarantine is distinct and not retried');
 await withdrawShadow(erasure,d,cleanup);await withdrawShadow(erasure,e,cleanup);
 // Computation crashed before publication: no cache, lease recovery can recompute.
 const f=await owner();const gf=await graph(f);let jf=await claimed(f);
 await rejects(()=>rebuildAdaptiveOwner(worker,f,{job:jf,enrollmentId:jf.enrollmentId,now:new Date(Date.now()+2000).toISOString(),project:()=>{throw new Error('Synthetic process crash');}}),'Crash rolls back publication');
 check((await sql`select count(*)::int n from public.adaptive_concept_projections where owner_id=${f}`)[0].n===0,'No partial projection');
 // Advance only local synthetic lease time while holding the owner lock, as wall-clock expiry would.
 await expire(jf);await rejects(()=>rebuildAdaptiveOwner(worker,f,{job:jf,enrollmentId:jf.enrollmentId,project:()=>[]}), 'Stale worker cannot begin publication');
 jf=await claimed(f);let computeStarted=pause(),computeDone=pause();
 const publication=rebuildAdaptiveOwner(worker,f,{job:jf,enrollmentId:jf.enrollmentId,now:new Date(Date.now()+2000).toISOString(),project:async snapshot=>{computeStarted.resolve();await computeDone.promise;return project(f,gf.evidence)(snapshot);}});
 await computeStarted.promise;
 // Queue row is intentionally locked by publisher; deletion waits for owner first.
 let erased=false;const deletion=withdrawShadow(erasure,f,cleanup).then(r=>{erased=true;return r;});await sleep(60);check(!erased,'Deletion waits safely for publication owner lock');computeDone.resolve();check((await publication).status==='ready','Valid live lease publishes');check((await deletion).status==='completed','Deletion wins after publication');
 check(await deleteQueue.remainingOwner(f)===0,'All queue states removed on deletion');await rejects(()=>q.complete(jf),'Cancelled publisher cannot acknowledge');
 // Published cache plus lost acknowledgment is replayable without duplicate rows.
 const lost=await owner();const glost=await graph(lost);const lostJob=await claimed(lost);
 await rebuildAdaptiveOwner(worker,lost,{job:lostJob,enrollmentId:lostJob.enrollmentId,now:new Date(Date.now()+2000).toISOString(),project:project(lost,glost.evidence)});
 await expire(lostJob);const replacement=await claimed(lost);
 await rebuildAdaptiveOwner(worker,lost,{job:replacement,enrollmentId:replacement.enrollmentId,now:new Date(Date.now()+2000).toISOString(),project:project(lost,glost.evidence)});await q.complete(replacement);
 check((await sql`select count(*)::int n from public.adaptive_concept_projections where owner_id=${lost}`)[0].n===1,'Crash after publication safely repeats one cache row');
 await rejects(()=>q.complete(lostJob),'Lost acknowledgment cannot complete replacement lease');await withdrawShadow(erasure,lost,cleanup);
 // Real clock expiry during computation: final fence check rolls the whole transaction back.
 const aging=await owner();await graph(aging);const agingJob=await claimed(aging);
 await rejects(()=>rebuildAdaptiveOwner(worker,aging,{job:agingJob,enrollmentId:agingJob.enrollmentId,now:new Date(Date.now()+2000).toISOString(),project:async()=>{await sleep(30100);return [];}}),'Lease expiring during computation cannot publish or mark replay ready');
 check((await sql`select replay_status from adaptive_private.owner_state where owner_id=${aging}`)[0].replay_status==='idle','Expired publication rolls back replay state');
 await withdrawShadow(erasure,aging,cleanup);
 // Actual worker-process exit, both after claim and inside a replay transaction.
 for(const mode of ['claim','compute']){
  const id=await owner();await graph(id);const dead=await crashedJob(id,mode);
  check((await jobRow(dead)).status==='leased','Process exit leaves durable lease for recovery');
  check((await sql`select count(*)::int n from public.adaptive_concept_projections where owner_id=${id}`)[0].n===0,'Terminated process publishes no partial cache');
  await expire(dead);const recovered=await claimed(id);check(BigInt(recovered.fence)>BigInt(dead.fence),'Independent process recovers with new fencing token');
  await q.complete(recovered);await withdrawShadow(erasure,id,cleanup);
 }
 // Jobs include delayed, parked and dead-letter records; no filtering in erasure count.
 const g=await owner();await graph(g,5);
 const states=['queued','retry','parked','dead_letter','quarantined'];const rows=await sql`select job_id from adaptive_private.projection_jobs where owner_id=${g} order by created_at`;
 for(let i=0;i<states.length;i++)await sql`update adaptive_private.projection_jobs set status=${states[i]},eligible_at=clock_timestamp()+interval '1 hour' where job_id=${rows[i].job_id}`;
 check(await deleteQueue.remainingOwner(g)>=5,'Remaining count covers all durable job states');
 const [op]=await erasure`select adaptive_private.begin_erasure(${g},'withdrawal') id`;
 await rejects(()=>erasure`select adaptive_private.advance_erasure(${op.id},'jobs_cancelled')`,'Database independently rejects false cancellation attestation');
 check((await resumeAdaptiveErasure(erasure,op.id,{queue:{cancelOwner:async()=>{},remainingOwner:async()=>0}})).status==='retryable','No-op queue cannot bypass SQL completion guard');
 check((await resumeAdaptiveErasure(erasure,op.id,cleanup)).status==='completed','Retry removes every durable state');check(await deleteQueue.remainingOwner(g)===0,'No owner remains in jobs');
 const h=await owner();await graph(h);const jh=await claimed(h);await withdrawShadow(erasure,h,cleanup);
 await sql`select adaptive_private.enroll_shadow(${h},clock_timestamp()+interval '1 day',gen_random_uuid())`;await graph(h);await rejects(()=>q.complete(jh),'Re-enrollment cannot revive old job');
 await sql`update adaptive_private.shadow_enrollments set enrolled_at=clock_timestamp()-interval '2 days',expires_at=clock_timestamp()-interval '1 day' where owner_id=${h}`;
 check((await eraseExpiredEnrollments(erasure,cleanup)).completed===1,'Expiry removes durable jobs');
 // Later evidence cannot be published under a previously claimed generation.
 const changed=await owner();const changedGraph=await graph(changed);const changedJob=await claimed(changed);
 await recordAdaptiveSessionEvent(ingest,changed,{clientEventId:randomUUID(),sessionId:changedGraph.session.sessionId,status:'completed',occurredAt:new Date(Date.now()+2000).toISOString()});
 await rejects(()=>q.complete(changedJob),'New generation rejects stale acknowledgment');
 await rejects(()=>rebuildAdaptiveOwner(worker,changed,{job:changedJob,enrollmentId:changedJob.enrollmentId,project:()=>[]}), 'New generation rejects stale projection');
 await q.retry(changedJob,{reason:'generation_changed'});const nextJob=await claimed(changed);check(nextJob.generation>changedJob.generation,'New generation remains durably eligible');await q.complete(nextJob);await withdrawShadow(erasure,changed,cleanup);
 // Separate authenticated scheduler, durable one-use replay barrier.
 const env={ADAPTIVE_RUNTIME_ENVIRONMENT:'disposable_local',ADAPTIVE_SHADOW_WRITES_ENABLED:'true',ADAPTIVE_SHADOW_WRITES_KILL_SWITCH:'false'};
 let drains=0;const nonce=randomUUID(),proof='fixture-scheduler-proof-0001';
 const scheduler=createAdaptiveScheduler({readEnvironment:()=>env,verifyCredential:async token=>token===proof?{kind:'scheduler',audience:'adaptive-worker',nonce,expiresAt:Date.now()+50000}:null,consumeNonce:createSchedulerReplayGuard(worker),drain:async()=>{drains++;return {completed:1,ownerId:a,credential:proof};},log:r=>logs.push(r)});
 const request=(authorization=`Scheduler ${proof}`,body='{}')=>new Request('http://localhost/scheduler',{method:'POST',headers:{authorization,'content-type':'application/json'},body});
 check((await scheduler(request(''))).status===401,'Missing scheduler credential denied');check((await scheduler(request('Bearer '+proof))).status===401,'Learner bearer scheme denied');check((await scheduler(request('Scheduler wrong-credential-123'))).status===401,'Invalid scheduler credential denied');
 check((await scheduler(request(undefined,'x'.repeat(1025)))).status===401,'Oversized scheduler body denied');check((await scheduler(request(undefined,JSON.stringify({ownerId:a})))).status===401,'Caller cannot pick jobs');
 check((await scheduler(request(undefined,'true'))).status===401,'Scheduler requires an empty JSON object');
 const receipt=await scheduler(request());const receiptText=await receipt.text();check(receipt.status===200&&!receiptText.includes(a)&&!receiptText.includes(proof),'Valid scheduler returns aggregate receipt only');check((await scheduler(request())).status===401&&drains===1,'Replay rejected durably');
 const scheduledOwner=await owner();await graph(scheduledOwner);await sleep(150);
 const realDrain=createProjectionDrain({store:{...q,claim:()=>q.claim(scheduledOwner)},getDatabase:async()=>worker,project:()=>[],readEnvironment:()=>env,readControl:async()=>({enabled:true,killSwitch:false}),log:r=>logs.push(r)});
 const realScheduler=createAdaptiveScheduler({readEnvironment:()=>env,verifyCredential:async()=>({kind:'scheduler',audience:'adaptive-worker',nonce:randomUUID(),expiresAt:Date.now()+50000}),consumeNonce:createSchedulerReplayGuard(worker),drain:realDrain});
 const scheduled=await realScheduler(request());const scheduledBody=await scheduled.json();check(scheduled.status===200&&scheduledBody.completed===1,`Authenticated scheduler executes real durable claim, fenced replay and acknowledgment: ${JSON.stringify(scheduledBody)} / ${logs.slice(-3).map(r=>r.event+':'+r.reason).join(',')}`);await withdrawShadow(erasure,scheduledOwner,cleanup);
 const skewed=await owner();await graph(skewed);await sleep(150);const skewJob=await claimed(skewed);
 const SystemDate=globalThis.Date;
 try{
  // Simulate an application clock one minute behind database receipt time.
  globalThis.Date=class extends SystemDate{constructor(...args){super(...(args.length?args:[SystemDate.now()-60000]));}};
  check((await rebuildAdaptiveOwner(worker,skewed,{job:skewJob,enrollmentId:skewJob.enrollmentId,project:()=>[]})).status==='ready','Default replay clock is immune to host clock skew');
 }finally{globalThis.Date=SystemDate;}
 await q.complete(skewJob);await withdrawShadow(erasure,skewed,cleanup);
 const denied=createAdaptiveScheduler({readEnvironment:()=>({...env,VERCEL_ENV:'production'})});check((await denied(request())).status===503,'Scheduler hard-denies production');
 const killed=createProjectionDrain({store:{claim:()=>{throw new Error('Must not claim');}},readEnvironment:()=>env,readControl:async()=>({enabled:false,killSwitch:true})});check((await killed()).disabled,'Kill denies claims');
 // Real restricted LOGIN only in disposable test, password stays in memory.
 const password=randomBytes(32).toString('base64url'),login='adaptive_ingest_login';
 await sql.unsafe(`create role ${login} login noinherit nosuperuser nocreatedb nocreaterole nobypassrls password '${password}'`);
 await sql.unsafe(`grant adaptive_ingest to ${login}`);
 const local=new URL(process.env.ADAPTIVE_DATABASE_URL);local.username=login;local.password=password;
 const config={mode:'production_shape_validation',purpose:'ingest',connectionString:`postgresql://${login}.abcdefghijklmnopqrst:synthetic-password-not-real@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,max:1,tls:{rejectUnauthorized:true,ca:'-----BEGIN CERTIFICATE-----\nSYNTHETIC\n-----END CERTIFICATE-----'}};
 let driverOptions;
 const factory=(_url,options)=>{driverOptions=options;return postgres(local.toString(),{...options,ssl:false});};
 const adapter=createProductionShapedDatabase(config,{env,driverFactory:factory,log:r=>logs.push(r)});
 check(driverOptions.prepare===false&&driverOptions.max_pipeline===1&&driverOptions.max===1&&driverOptions.ssl.rejectUnauthorized===true,'Adapter requires verified TLS, bounded pool, no prepared statements');
 const [identity]=await adapter`select current_user,session_user,current_setting('statement_timeout') as statement_timeout,current_setting('lock_timeout') as lock_timeout`;
 check(identity.current_user==='adaptive_ingest'&&identity.session_user===login&&identity.statement_timeout==='5s'&&identity.lock_timeout==='1s','Real restricted login sets purpose and timeouts per transaction');
 const z=await owner();await graph(z,1,adapter); // Full ingestion through the restricted-login adapter.
 await rejects(()=>adapter`select * from auth.users`,'Production-shaped adapter enforces actual negative privilege');
 const [again]=await adapter`select current_user`;check(again.current_user==='adaptive_ingest','Role reestablished in next transaction');
 check(createProductionShapedDatabase(config,{env,driverFactory:factory})===adapter,'One module-scoped pool per purpose');
 const occupied=pause(),free=pause();const occupying=adapter.begin(async()=>{occupied.resolve();await free.promise;});await occupied.promise;
 const acquireStart=performance.now();await rejects(()=>adapter`select 1`,'Pool acquire has bounded wait');check(performance.now()-acquireStart<4000,'Acquire fails within three seconds plus local overhead');free.resolve();await occupying;
 check((await adapter`select 1 as ok`)[0].ok===1,'Timed-out waiter releases late reservation safely');
 const tables=await worker`select * from adaptive_private.runtime_metrics()`;check(tables.some(r=>r.event==='enqueue')&&tables.some(r=>r.event==='cancellation'),'Automatic SQL queue events produce aggregate metrics');
 for(const patch of [{max:2},{max:0},{purpose:'postgres'},{tls:{rejectUnauthorized:false,ca:config.tls.ca}},{connectionString:config.connectionString.replace('6543','5432')},{connectionString:config.connectionString+'?sslmode=disable'},{connectionString:config.connectionString.replace('adaptive_ingest_login','postgres')},{connectionString:config.connectionString.replace('pooler.supabase.com','evil.invalid')},{connectionString:config.connectionString.replace('synthetic-password-not-real','eyJservice-role-token')},{mode:'enabled'}])await rejects(async()=>createProductionShapedDatabase({...config,...patch},{env,driverFactory:factory}),'Unsafe connection configuration denied');
 for(const patch of [{NODE_ENV:'production'},{VERCEL:'1'},{VERCEL_ENV:'preview'},{VITE_ADAPTIVE_DATABASE_URL:'redacted'},{ADAPTIVE_RUNTIME_ENVIRONMENT:'production'}])await rejects(async()=>createProductionShapedDatabase(config,{env:{...env,...patch},driverFactory:factory}),'Unsafe execution environment denied');
 await closeProductionShapedPools();await rejects(()=>adapter`select 1`,'Closed adapter cannot reopen silently');
 await sql.unsafe(`drop role ${login}`);
 // Small/medium replay measurements are local fixture costs, not capacity evidence.
 const timings=[];
 for(const size of [10,500]){const id=await owner();const t=performance.now();await graph(id,size);const ingestMs=performance.now()-t;const job=await claimed(id);const replayStart=performance.now();await rebuildAdaptiveOwner(worker,id,{job,enrollmentId:job.enrollmentId,now:new Date(Date.now()+5000).toISOString(),project:()=>[]});await q.complete(job);timings.push({answers:size,ingestMs:Math.round(ingestMs),replayAndAckMs:Math.round(performance.now()-replayStart)});await withdrawShadow(erasure,id,cleanup);}
 const logText=JSON.stringify(logs);check(!logText.includes(password)&&!logText.includes(proof)&&owners.every(id=>!logText.includes(id))&&!logText.includes('postgresql://'),'Operational events contain no credentials or owner data');
 for(const id of owners){await withdrawShadow(erasure,id,cleanup);await sql`delete from auth.users where id=${id}`;}
 console.log(JSON.stringify({status:'PASS',assertions:n,timings:{concurrentEnqueue12Ms:Math.round(enqueueMs),concurrentClaimsMs:Math.round(claimMs),ackMs:Math.round(ackMs),replays:timings}}));
}catch(error){console.error(`FAIL infrastructure: ${error.code??error.name}: ${error.message}`);process.exitCode=1;}
finally{for(const id of owners){await withdrawShadow(erasure,id,cleanup).catch(()=>{});}
 await closeProductionShapedPools();await closeAdaptiveDatabase(sql);await closeAdaptiveDatabase(pool);}
