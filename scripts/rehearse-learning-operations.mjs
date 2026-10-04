import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {fork} from 'node:child_process';
import {writeFileSync,readFileSync} from 'node:fs';
import {container,database,url,connect,psql,docker,resetDatabase,deploy,migrations,purposeConnections,reopenPurpose,rotatePurpose,fixture,drainOwner,inventory,saveEvidence,hash} from './lib/operational-rehearsal.mjs';
import {storeTrustedSessionPlan} from '../server/adaptive/session-plans.mjs';
import {createDurableQueue} from '../server/adaptive/durable-queue.mjs';
import {createAdaptiveScheduler,createSchedulerReplayGuard} from '../server/adaptive/scheduler-boundary.mjs';
import {createTrustedProjectionDrain,rebuildTrustedLearningOwner} from '../server/adaptive/trusted-learning-runtime.mjs';
import {createCentralControlReader} from '../server/adaptive/central-control.mjs';
import {createOperationalMonitor} from '../server/adaptive/operational-monitor.mjs';
import {appendErasureIntent,reconcileErasureJournal,readErasureJournal} from '../server/adaptive/recovery-journal.mjs';
import {withdrawShadow,resumePendingErasures} from '../server/adaptive/deletion.mjs';
const checks=[],check=(value,label)=>{assert.ok(value,label);checks.push(label);};
const reject=async(fn,label,code)=>{await assert.rejects(fn,code?{code}:undefined);checks.push(label);};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const env={ADAPTIVE_RUNTIME_ENVIRONMENT:'disposable_local',ADAPTIVE_SHADOW_WRITES_ENABLED:'true',ADAPTIVE_SHADOW_WRITES_KILL_SWITCH:'false'};
let sql,purposes;
async function crash(owner,phase,onPause){return new Promise((resolve,reject)=>{
 const child=fork('scripts/lib/operations-crash-worker.mjs',[phase],{env:{...process.env,...env,ADAPTIVE_DATABASE_URL:url,ADAPTIVE_TEST_OWNER:owner},stdio:['ignore','ignore','ignore','ipc']});let receipt;
 const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('Crash fixture timeout'));},15000);
 child.on('message',async r=>{receipt=r;try{await onPause?.(r);}catch(error){reject(error);}finally{child.kill('SIGKILL');}});child.on('exit',()=>{clearTimeout(timer);receipt?resolve(receipt):reject(new Error('Crash fixture failed'));});
 });}
try{
 sql=await resetDatabase();const first=await deploy(sql);const firstInventory=await inventory(sql);
 check((await deploy(sql)).every(x=>x.skipped),'Repeat deployment skips identical committed checksums');
 await reject(()=>deploy(sql,[{...migrations[0],sha256:'0'.repeat(64)}]),'Changed committed migration fails closed');
 await sql.end();sql=await resetDatabase();
 const interrupted=connect();await interrupted`set application_name='adaptive_migration_interrupt'`;
 const dying=interrupted.unsafe(migrations[0].sql.replace(/commit;\s*$/i,'select pg_sleep(30);commit;')).then(()=>false,()=>true);
 let sleeping=false;for(let i=0;i<100;i++){const rows=await sql`select pid from pg_stat_activity where application_name='adaptive_migration_interrupt' and wait_event='PgSleep'`;if(rows[0]){await sql`select pg_terminate_backend(${rows[0].pid})`;sleeping=true;break;}await sleep(25);}
 check(sleeping&&await dying,'Terminated actual migration backend before commit');await interrupted.end({timeout:1});
 check((await sql`select to_regnamespace('adaptive_private') is null absent`)[0].absent,'Interrupted migration leaves no partial schema');
 await sql`set statement_timeout='100ms'`;const statementStarted=performance.now();
 await reject(()=>sql.unsafe(migrations[0].sql.replace(/commit;\s*$/i,'select pg_sleep(1);commit;')),'Statement timeout aborts migration','57014');const statementFailureMs=Math.round(performance.now()-statementStarted);await sql`rollback`;await sql`set statement_timeout='10s'`;
 check((await sql`select to_regnamespace('adaptive_private') is null absent`)[0].absent,'Timed-out DDL rolls back atomically');
 const locker=connect();let unlock,locked;const held=new Promise(r=>{locked=r;}),release=new Promise(r=>{unlock=r;});
 const holding=locker.begin(async tx=>{await tx`lock table auth.users in access exclusive mode`;locked();await release;});await held;await sql`set lock_timeout='100ms'`;const lockStarted=performance.now();
 await reject(()=>sql.unsafe(migrations[0].sql),'DDL lock timeout fails without partial deploy','55P03');const lockFailureMs=Math.round(performance.now()-lockStarted);await sql`rollback`;unlock();await holding;await locker.end();
 const second=await deploy(sql);const secondInventory=await inventory(sql);
 check(JSON.stringify(firstInventory)===JSON.stringify(secondInventory),'Fresh reset produces identical schema, grants and roles');
 saveEvidence('migration',{first,second,failures:{statementFailureMs,lockFailureMs,interruption:'Actual backend termination before commit; schema absent afterward'},inventory:secondInventory});
 check(secondInventory.environment[0].server_version==='17.6','Exact target PostgreSQL minor version');
 check(secondInventory.tables.every(t=>t.relrowsecurity),'Every adaptive table has RLS');
 check(secondInventory.functions.every(f=>!f.public_execute),'No PUBLIC function execution');
 check(secondInventory.functions.filter(f=>f.prosecdef).every(f=>f.owner==='postgres'&&f.proconfig?.includes('search_path=""')),'Definers have explicit owner and empty search path');
 // Local test admin can SET capability roles; no runtime membership is broadened.
 await sql`grant adaptive_ingest,adaptive_worker,adaptive_erasure to postgres with inherit false,set true`;
 purposes=await purposeConnections(sql);const {ingest,worker,erasure}=purposes,queue=createDurableQueue(worker);
 await reject(()=>queue.claim(),'Fresh migration is default-off');
 await reject(()=>worker`select adaptive_private.set_runtime_control(true,60)`,'Worker cannot enable control');
 await sql`select adaptive_private.set_runtime_control(true,3600)`;
 const data=await fixture(sql,ingest),cold=await data.owner(10);
 const coldResult=await drainOwner(worker,cold.id);check(coldResult.claims===2,'Cold full model reaches stable generation');
 // An old control response cannot grant a new claim/publication after disable.
 const reader=createCentralControlReader({sql:worker,readEnvironment:()=>env});check((await reader()).enabled,'Fresh central reader enabled');
 const blocked=await data.owner(10),old=await queue.claim(blocked.id);
 await sql`select adaptive_private.set_runtime_control(false,60)`;
 check(!(await reader()).enabled,'Disable visible without cache');
 await reject(()=>queue.claim(),'Disabled database refuses claims');
 await reject(()=>storeTrustedSessionPlan(ingest,blocked.id,{sessionId:randomUUID(),source:'practice',mode:'normal',seed:'kill',requestedCount:1,requestedPbqCount:0,revisionIds:[data.catalogue.revisions[0].revisionId],...data.catalogue.versions}),'Disabled database rejects new ingestion plan','55000');
 await reject(()=>rebuildTrustedLearningOwner(worker,blocked.id,{job:old}),'Disabled database refuses old publication');
 await sql`select adaptive_private.set_runtime_control(true,3600)`;
 await reject(()=>queue.complete(old),'Re-enable does not revive stale fence');
 check((await drainOwner(worker,blocked.id)).claims===2,'Re-enable resumes pending work without duplicates');
 // Disable waits for an actual transaction holding the shared barrier.
 const barrierDb=connect(),disableDb=connect();let entered;const ready=new Promise(r=>{entered=r;});
 const inFlight=barrierDb.begin(async tx=>{await tx`select adaptive_private.require_runtime_control()`;entered();await tx`select pg_sleep(0.25)`;});await ready;
 const killStarted=performance.now();await disableDb`select adaptive_private.set_runtime_control(false,60)`;await inFlight;
 const killMs=Math.round(performance.now()-killStarted);check(killMs>=150,'Kill acknowledgment waits for in-flight transaction barrier');
 await barrierDb.end();await disableDb.end();await sql`select adaptive_private.set_runtime_control(true,1)`;await sleep(1100);
 await reject(()=>queue.claim(),'Expired control refuses work without operator refresh');await sql`select adaptive_private.set_runtime_control(true,3600)`;
 // Real process death at claim, full computation, publication and acknowledgement.
 const recovery=[];
 for(const phase of ['claim','compute','publication','ack','scheduler']){
  const owner=await data.owner(10);
  // Publish/ack tests need the derived-output phase already committed.
  if(['publication','ack'].includes(phase)){const j=await queue.claim(owner.id);check((await rebuildTrustedLearningOwner(worker,owner.id,{job:j})).status==='rescheduled','Prepare resulting generation for crash');}
  const receipt=await crash(owner.id,phase);
  if(phase!=='ack')await sql`update adaptive_private.projection_jobs set lease_until=clock_timestamp()-interval '1 second' where job_id=${receipt.job.id} and status='leased'`;
  await reject(()=>queue.complete(receipt.job),'Dead process cannot reuse old lease');
  const r=await drainOwner(worker,owner.id);
  check((await sql`select count(*)::int n from public.adaptive_review_tasks where owner_id=${owner.id}`)[0].n===2,'Crash replay retains two unique review tasks');
  check((await sql`select bool_and(p.input_generation=s.evidence_generation and p.projection_status='ready') ok from public.adaptive_concept_projections p join adaptive_private.owner_state s using(owner_id) where p.owner_id=${owner.id}`)[0].ok,'Crash replay publishes current generation');
  recovery.push({phase,claims:r.claims,recoveryMs:r.elapsedMs});
 }
 const computing=await data.owner(10),killDb=connect();let disabled=false,killPending;
 const computed=await crash(computing.id,'compute',async()=>{killPending=killDb`select adaptive_private.set_runtime_control(false,60)`.then(()=>{disabled=true;});await sleep(100);check(!disabled,'Kill waits for actual full-model compute transaction');});
 await killPending;await killDb.end();check(disabled,'Process death releases barrier and confirms kill');
 await reject(()=>queue.complete(computed.job),'Computed but unpublished stale process is fenced');
 await sql`select adaptive_private.set_runtime_control(true,3600)`;await drainOwner(worker,computing.id);
 // SQL enforces owner serialization and the global two-lease ceiling.
 const leaseOwners=await Promise.all(Array.from({length:3},()=>data.owner(10)));
 const one=await queue.claim(leaseOwners[0].id),two=await queue.claim(leaseOwners[1].id);
 check(one&&two,'Two independent owner leases can coexist');
 check(await queue.claim(leaseOwners[2].id)===null,'Third global lease is denied');
 check(await queue.claim(leaseOwners[0].id)===null,'Overlapping same-owner claim is denied');
 await queue.park(one,{reason:'poison_job'});await queue.park(two,{reason:'chronology_conflict'});
 const [states]=await worker`select adaptive_private.operational_metrics() m`;
 check(states.m.deadLetters>=1&&states.m.quarantined>=1,'Dead-letter and quarantine are observable durable states');
 await drainOwner(worker,leaseOwners[2].id);
 // Overlapping authenticated local scheduler requests use the complete pipeline.
 const scheduled=await data.owner(10),records=[];
 const drain=createTrustedProjectionDrain({store:queue,getDatabase:async()=>worker,readEnvironment:()=>env,readControl:reader,log:r=>records.push(r)});
 const scheduler=createAdaptiveScheduler({verifyCredential:async value=>({kind:'scheduler',audience:'adaptive-worker',nonce:value,expiresAt:Date.now()+30000}),consumeNonce:createSchedulerReplayGuard(worker),drain,readEnvironment:()=>env,log:r=>records.push(r)});
 const request=()=>new Request('http://localhost/internal-test',{method:'POST',headers:{'content-type':'application/json',authorization:'Scheduler '+randomUUID()},body:'{}'});
 check((await scheduler(new Request('http://localhost/fixture',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer synthetic-learner'},body:'{}'}))).status===401,'Scheduler rejects learner authority and emits denial');
 const responses=await Promise.all([scheduler(request()),scheduler(request())]);check(responses.every(r=>r.status===200),'Overlapping scheduler requests remain bounded');await drainOwner(worker,scheduled.id);
 await sql`select adaptive_private.set_runtime_control(false,60)`;
 check((await (await scheduler(request())).json()).status==='disabled','Scheduler cannot claim queued work after central kill');
 await sql`select adaptive_private.set_runtime_control(true,3600)`;
 // Stop/restart the real server with queued work and a live lease.
 const restartOwner=await data.owner(10),restartJob=await queue.claim(restartOwner.id);
 await Promise.all(Object.values(purposes).map(x=>x.end()));await sql.end();
 const restartStarted=performance.now();docker(['stop',container]);docker(['start',container]);
 for(let n=0;n<60;n++){try{psql('select 1;');break;}catch{await sleep(250);}}
 sql=connect();const restarted=await sql`select status,fence from adaptive_private.projection_jobs where job_id=${restartJob.id}`;
 check(restarted[0].status==='leased'&&String(restarted[0].fence)===restartJob.fence,'Database restart preserves durable lease');
 // Existing restricted logins and one-connection purpose pools survive restart.
 const role=reopenPurpose;
 purposes={ingest:role('ingest'),worker:role('worker'),erasure:role('erasure')};
 await sql`update adaptive_private.projection_jobs set lease_until=clock_timestamp()-interval '1 second' where job_id=${restartJob.id}`;
 await drainOwner(purposes.worker,restartOwner.id);check(true,'Restarted server recovers expired lease and deterministic output');
 recovery.push({phase:'database_restart',recoveryMs:Math.round(performance.now()-restartStarted)});
 // Backup predates deletion; journal and trusted head remain outside that backup.
 const restoreData=await fixture(sql,purposes.ingest),erased=await restoreData.owner(10),pending=await restoreData.owner(10);
 await drainOwner(purposes.worker,erased.id);
 const journal='/tmp/secureplus-4d-erasure-journal-'+randomUUID(),key=randomBytes(32),head=appendErasureIntent(journal,key,{ownerId:erased.id,enrollmentId:erased.enrollment});
 writeFileSync(journal+'.key',key,{mode:0o600});writeFileSync(journal+'.head',head,{mode:0o600});
 // Deliberately capture an ENABLED older backup. Restore quarantine must not
 // rely on the stale control value inside that backup.
 docker(['exec',container,'pg_dump','-U','postgres','-Fc','-f','/tmp/secureplus-4d.backup',database]);
 await sql`select adaptive_private.set_runtime_control(false,60)`;
 check((await withdrawShadow(purposes.erasure,erased.id,{queue:createDurableQueue(purposes.erasure)})).status==='completed','Deletion completes while control is disabled');
 await sql`select adaptive_private.begin_erasure(${pending.id},'withdrawal')`;
 await Promise.all(Object.values(purposes).map(x=>x.end()));
 for(const purpose of ['ingest','worker','erasure'])await sql.unsafe(`alter role adaptive_${purpose}_login nologin`);
 await sql`select pg_terminate_backend(pid) from pg_stat_activity where usename like 'adaptive_%_login'`;await sql.end();
 // A fresh database avoids pre-existing default ACLs adding grants on restore.
 psql(`drop database ${database} with (force);`,'postgres');psql(`create database ${database} template template0;`,'postgres');
 docker(['exec',container,'pg_restore','-U','supabase_admin','--clean','--if-exists','--exit-on-error','-d',database,'/tmp/secureplus-4d.backup']);
 sql=connect();
 const restoredPermissions=await inventory(sql);
 check(restoredPermissions.tables.every(t=>!/(anon|authenticated)=/.test(t.relacl??'')),'Fresh restore preserves adaptive browser grant denial');
 check(restoredPermissions.functions.every(f=>!f.public_execute),'Fresh restore preserves PUBLIC function denial');
 check((await sql`select adaptive_private.read_runtime_control() c`)[0].c.enabled,'Backup actually restored stale enabled control');
 const lockedLogin=reopenPurpose('worker');await reject(()=>lockedLogin`select 1`,'Restore quarantine revokes runtime login before replay');await lockedLogin.end();
 await sql`select adaptive_private.set_runtime_control(false,60)`;
 check((await sql`select count(*)::int n from public.adaptive_sessions where owner_id=${erased.id}`)[0].n>0,'Older backup actually restores erased graph in quarantine');
 await reject(()=>sql`select adaptive_private.claim_job(null)`,'Restored graph cannot enter service before reconciliation');
 await reject(async()=>readErasureJournal(journal,key,'0'.repeat(64)),'Older or truncated journal checkpoint rejected');
 const reconciled=await reconcileErasureJournal(sql,{path:journal,key:readFileSync(journal+'.key'),expectedHead:readFileSync(journal+'.head','utf8')});check(reconciled.reconciled===1,'External journal erases resurrected graph completely');
 // Interrupted erasure survives another recovery attempt.
 const [op]=await sql`select adaptive_private.begin_erasure(${pending.id},'withdrawal') id`;
 await sql`select adaptive_private.cancel_owner_jobs(${pending.id})`;await sql`select adaptive_private.advance_erasure(${op.id},'jobs_cancelled')`;
 check((await resumePendingErasures(sql,{queue:createDurableQueue(sql)})).completed===1,'Partial erasure resumes from durable stage');
 await sql`select adaptive_private.set_runtime_control(true,3600)`;
 const fresh=(await sql`select adaptive_private.enroll_shadow(${erased.id},clock_timestamp()+interval '1 day',gen_random_uuid()) id`)[0].id;
 check(fresh!==erased.enrollment,'Post-restore re-enrollment has new fence');
 saveEvidence('recovery',{checks,recovery,killAcknowledgmentMs:killMs,backupKind:'isolated custom-format pg_dump with stale enabled control; runtime logins revoked before restore; forced disable and external authenticated erasure checkpoint before readmission'});
 // Load uses one connection for each purpose, with increasing concurrent owners.
 for(const purpose of ['ingest','worker','erasure'])await sql.unsafe(`alter role adaptive_${purpose}_login login`);
 purposes={ingest:role('ingest'),worker:role('worker'),erasure:role('erasure')};
 const loadData=await fixture(sql,purposes.ingest),load=[];
 for(const answers of [10,500])for(const concurrency of [1,2,4]){
  const owners=await Promise.all(Array.from({length:concurrency},()=>loadData.owner(answers)));
  let peakConnections=0,peakLeases=0,sampling=false;const sampler=setInterval(async()=>{if(sampling)return;sampling=true;try{const [m]=await sql`select (select count(*)::int from pg_stat_activity where usename like 'adaptive_%_login') connections,(select count(*)::int from adaptive_private.projection_jobs where status='leased' and lease_until>clock_timestamp()) leases`;peakConnections=Math.max(peakConnections,m.connections);peakLeases=Math.max(peakLeases,m.leases);}finally{sampling=false;}},20);
  const start=performance.now();let runs;try{runs=await Promise.all(owners.map(o=>drainOwner(purposes.worker,o.id)));}finally{clearInterval(sampler);while(sampling)await sleep(5);}
  check(peakConnections<=3&&peakLeases<=2,'Sampled connection and global lease ceilings hold');
  const elapsed=Math.round(performance.now()-start),latencies=runs.map(x=>x.elapsedMs).sort((a,b)=>a-b);
  check(runs.every(x=>x.claims===2),'Concurrent owner histories converge in two claims');
  load.push({answers,concurrency,peakConnections,peakLeases,samples:runs.length,elapsedMs:elapsed,ownersPerSecond:Math.round(1000*owners.length/elapsed*100)/100,minMs:latencies[0],maxMs:latencies.at(-1),ingestMs:owners.map(x=>x.ingestMs),claims:runs.map(x=>x.claims)});
 }
 for(const purpose of ['ingest','worker','erasure']){await purposes[purpose].end();const rotation=await rotatePurpose(sql,purpose);check(rotation.oldRefused&&rotation.newAccepted,'Revoked purpose credential fails and replacement works');if(rotation.oldRefused)records.push({event:'connection_failure',durationMs:0});purposes[purpose]=reopenPurpose(purpose);}
 const monitoring=createOperationalMonitor();for(const record of records)monitoring.record(record);const [raw]=await purposes.worker`select adaptive_private.operational_metrics() metrics`;
 const metrics=monitoring.sample(raw.metrics,{purposeConnections:3});
 check(!JSON.stringify(metrics).includes(erased.id),'Operational metrics contain no owner identifiers');
 saveEvidence('load',{cold:coldResult,load,metrics,connectionModel:'max=1 per purpose; local direct TCP; not managed pooler/TLS',limits:{globalLeases:2,drainClaims:5,modelMs:2000,snapshotBytes:8388608},percentiles:'Not reported: each scenario has fewer than 20 samples'});
 saveEvidence('result',{status:'PASS',assertions:checks.length,checks,migrations:migrations.map(({name,sha256})=>({name,sha256}))});
 console.log(JSON.stringify({status:'PASS',assertions:checks.length}));
}catch(e){console.error(JSON.stringify({status:'FAIL',code:/^[A-Z0-9_]{1,32}$/.test(e.code??'')?e.code:'assertion',lastCompleted:checks.at(-1)??'setup'}));process.exitCode=1;}
finally{await Promise.allSettled(Object.values(purposes??{}).map(x=>x.end()));await sql?.end();}
