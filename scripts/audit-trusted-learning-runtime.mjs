import assert from 'node:assert/strict';
import { randomUUID,randomBytes } from 'node:crypto';
import { fork } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { createAdaptiveDatabase,closeAdaptiveDatabase } from '../server/adaptive/database.mjs';
import { seedTrustedLearningFixture } from './lib/trusted-learning-fixture.mjs';
import { storeTrustedSessionPlan,createSessionPlanResolver,generateTrustedSessionPlan,createTrustedCompletionVerifier } from '../server/adaptive/session-plans.mjs';
import { startAdaptiveSession,ingestAdaptiveAnswer,recordAdaptiveSessionEvent,recordAdaptiveIntervention } from '../server/adaptive/persistence.mjs';
import { createDurableQueue } from '../server/adaptive/durable-queue.mjs';
import { rebuildTrustedLearningOwner,executePinnedModel,createTrustedProjectionDrain } from '../server/adaptive/trusted-learning-runtime.mjs';
import { loadRuntimeBundle,loadCompleteSnapshot } from '../server/adaptive/runtime-bundle.mjs';
import { projectCompleteHistory } from '../server/adaptive/learning-projector.mjs';
import { withdrawShadow,eraseExpiredEnrollments } from '../server/adaptive/deletion.mjs';
import { createAdaptiveHandler } from '../server/adaptive/http-boundary.mjs';
import { createAdaptiveAuthenticator } from '../server/adaptive/auth.mjs';
import { createAdaptiveScheduler,createSchedulerReplayGuard } from '../server/adaptive/scheduler-boundary.mjs';

const sql=createAdaptiveDatabase({max:8}),pool=createAdaptiveDatabase({max:8});
const role=name=>{const db=(...args)=>db.begin(tx=>tx(...args));db.begin=fn=>pool.begin(async tx=>{await tx.unsafe(`set local role ${name}`);return fn(tx);});return db;};
const ingest=role('adaptive_ingest'),worker=role('adaptive_worker'),erasure=role('adaptive_erasure');
const queue=createDurableQueue(worker),cleanup={queue:createDurableQueue(erasure)};
const api=process.env.SUPABASE_LOCAL_API_URL;assert.ok(['localhost','127.0.0.1'].includes(new URL(api).hostname));
const admin=createClient(api,process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const users=[];let count=0,fixture;const checks=[];
const check=(ok,label)=>{assert.ok(ok,label);count++;checks.push(label);};
const rejects=async(fn,label)=>{await assert.rejects(fn,undefined,label);count++;checks.push(label);};
const day=86400000,base=Date.now()-40*day,iso=n=>new Date(n).toISOString();
async function owner(){const email=`runtime-${randomUUID()}@example.invalid`,password=randomBytes(24).toString('hex');const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});assert.ifError(error);const client=createClient(api,process.env.SUPABASE_LOCAL_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});const auth=await client.auth.signInWithPassword({email,password});assert.ifError(auth.error);const id=data.user.id;const [r]=await sql`select adaptive_private.enroll_shadow(${id},clock_timestamp()+interval '1 day',gen_random_uuid()) enrollment`;const u={id,token:auth.data.session.access_token,enrollmentId:r.enrollment,next:0};users.push(u);return u;}
const plan=(indexes=[0],extra={})=>({sessionId:randomUUID(),source:'practice',mode:'normal',seed:'fixture',requestedCount:indexes.length,requestedPbqCount:0,revisionIds:indexes.map(i=>fixture.revisions[i].revisionId),...fixture.versions,...extra});
async function historicalSession(u,indexes,at,extra={}){
 const p=plan(indexes,extra),planId=await storeTrustedSessionPlan(ingest,u.id,p);
 // Disposable historical fixture only: preserve trusted-role writes but replace
 // the allocation clock inside this transaction. No runtime timestamp override.
 const session=await sql.begin(async tx=>{
  await tx`alter table public.adaptive_sessions disable trigger adaptive_set_allocation`;
  const [counter]=await tx`insert into adaptive_private.owner_state(owner_id,last_set_index) values(${u.id},1) on conflict(owner_id) do update set last_set_index=adaptive_private.owner_state.last_set_index+1 returning last_set_index`;
  await tx`set local role adaptive_ingest`;
  const [s]=await tx`insert into public.adaptive_sessions(session_id,owner_id,set_index,source,mode,seed,requested_count,actual_count,requested_pbq_count,actual_pbq_count,mapping_version,algorithm_version,configuration_version,started_at) values(${p.sessionId},${u.id},${counter.last_set_index},${p.source},${p.mode},${p.seed},${p.requestedCount},${indexes.length},${p.requestedPbqCount},${p.requestedPbqCount},${p.mappingVersion},${p.algorithmVersion},${p.configurationVersion},${iso(at)}) returning *`;
  for(let i=0;i<indexes.length;i++)await tx`insert into public.adaptive_session_items values(${u.id},${s.session_id},${i+1},${p.revisionIds[i]})`;
  await tx`insert into public.adaptive_session_events(owner_id,session_id,client_event_id,status,occurred_at) values(${u.id},${s.session_id},${randomUUID()},'started',${iso(at)})`;
  await tx`set constraints all immediate`;
  await tx`set local role none`;
  await tx`alter table public.adaptive_sessions enable trigger adaptive_set_allocation`;
  return s;
 });return {p,planId,session};
}
async function answer(u,g,index,correct,at,extra={}){const r=fixture.revisions[index],id=correct?r.gradingKey.expected[0].valueId:r.components.find(c=>c.id!==r.gradingKey.expected[0].valueId).id;const input={clientEventId:randomUUID(),sessionId:g.session.session_id,itemPosition:g.p.revisionIds.indexOf(r.revisionId)+1,revisionId:r.revisionId,selectedComponents:[{componentId:id,valueId:id}],occurredAt:iso(at),...extra};return {input,result:await ingestAdaptiveAnswer(ingest,u.id,input)};}
async function observe(u,index,correct,offset,extra={}){const at=base+offset*day,g=await historicalSession(u,[index],at,extra),a=await answer(u,g,index,correct,at+100);await recordAdaptiveSessionEvent(ingest,u.id,{clientEventId:randomUUID(),sessionId:g.session.session_id,status:'completed',occurredAt:iso(at+200)});return {...g,...a};}
async function replay(u){let steps=0,rescheduled=0,last;for(;steps<5;steps++){const job=await queue.claim(u.id);if(!job)break;last=await rebuildTrustedLearningOwner(worker,u.id,{job});if(last.status==='ready')await queue.complete(job);else if(last.status==='rescheduled')rescheduled++;else throw new Error(`Unexpected replay ${last.status}`);}check(steps<5,'Durable full model terminates within five claims');return {steps,rescheduled,last};}
async function crashAfterReplay(u){return new Promise((resolve,reject)=>{const child=fork('scripts/lib/trusted-runtime-crash-worker.mjs',[],{env:{...process.env,ADAPTIVE_TEST_OWNER:u.id},stdio:['ignore','ignore','ignore','ipc']});let result;child.on('message',r=>{result=r;});const timer=setTimeout(()=>{child.kill();reject(new Error('Crash fixture timeout'));},15000);child.on('exit',code=>{clearTimeout(timer);code===0&&result?resolve(result):reject(new Error('Crash fixture failed'));});});}
async function realObserve(u,index,correct,extra={}){const p=plan([index],extra),planId=await storeTrustedSessionPlan(ingest,u.id,p),s=await startAdaptiveSession(ingest,u.id,p);const g={p,planId,session:{session_id:s.sessionId}};const a=await answer(u,g,index,correct,Date.parse(s.startedAt)+50);await new Promise(r=>setTimeout(r,75));const [clock]=await sql`select clock_timestamp() as now`;await recordAdaptiveSessionEvent(ingest,u.id,{clientEventId:randomUUID(),sessionId:s.sessionId,status:'completed',occurredAt:clock.now.toISOString()});return {...g,...a};}
const state=async u=>(await worker`select * from public.adaptive_concept_projections where owner_id=${u.id} and concept_id='recovery.rto'`)[0];
async function snapshot(u){return worker.begin(async tx=>{const sessions=await tx`select s.*,max(e.occurred_at) filter(where e.status in ('completed','abandoned')) closed_at from public.adaptive_sessions s left join public.adaptive_session_events e using(owner_id,session_id) where s.owner_id=${u.id} group by s.session_id order by s.set_index`;const evidence=await tx`select e.*,s.set_index,q.scenario_family,q.question_type from public.adaptive_answer_evidence e left join public.adaptive_sessions s using(owner_id,session_id) left join public.adaptive_question_revisions q using(revision_id) where e.owner_id=${u.id} order by e.receipt_index`;const [st]=await tx`select * from adaptive_private.owner_state where owner_id=${u.id}`;const [clock]=await tx`select clock_timestamp() as now`;return loadCompleteSnapshot(tx,{ownerId:u.id,sessions,evidence,generation:Number(st?.evidence_generation??0),now:clock.now.toISOString()},{versions:fixture.versions,enrollmentId:u.enrollmentId});});}
try{
 await sql`grant adaptive_ingest,adaptive_worker,adaptive_erasure to postgres with inherit false,set true`;
 fixture=await seedTrustedLearningFixture(sql);
 const bundle=await worker.begin(tx=>loadRuntimeBundle(tx,fixture.versions));check(bundle.config.algorithmVersion===fixture.versions.algorithmVersion,'Loads exact sealed payload triple');
 for(const variant of [{corruptDigest:'mapping'},{corruptDigest:'algorithm'},{corruptDigest:'configuration'},{malformedConfig:true},{unknownAlgorithm:true},{unapproved:true}]){const bad=await seedTrustedLearningFixture(sql,variant);await rejects(()=>worker.begin(tx=>loadRuntimeBundle(tx,bad.versions)),'Missing integrity or unsupported payload fails closed');}
 await rejects(()=>worker.begin(tx=>loadRuntimeBundle(tx,{...fixture.versions,configurationVersion:'missing-payload'})),'Missing exact payload fails closed');
 await rejects(()=>worker.begin(tx=>loadRuntimeBundle(tx,{...fixture.versions,algorithmVersion:fixture.versions.mappingVersion})),'Mismatched version kinds rejected');
 const u=await owner(),other=await owner();
 const p=plan([0,2]),id=await storeTrustedSessionPlan(ingest,u.id,p),resolver=createSessionPlanResolver(ingest);
 check((await resolver(u.id,id)).plan.sessionId===p.sessionId,'Owner resolves private immutable plan');
 await rejects(()=>resolver(other.id,id),'Foreign owner cannot resolve plan');
 await rejects(()=>storeTrustedSessionPlan(ingest,u.id,plan(),{enrollmentId:other.enrollmentId}),'Foreign enrollment cannot bind a plan');
 await rejects(()=>storeTrustedSessionPlan(ingest,u.id,{...p,revisionIds:[...p.revisionIds].reverse()}),'Reordered plan retry denied');
 await rejects(()=>storeTrustedSessionPlan(ingest,u.id,{...p,sessionId:randomUUID(),revisionIds:[p.revisionIds[0],p.revisionIds[0]]}),'Duplicate plan items denied');
 await rejects(()=>startAdaptiveSession(ingest,u.id,{...p,seed:'mutated'}),'Session cannot mutate stored plan');
 await rejects(()=>startAdaptiveSession(ingest,u.id,plan()),'Session without plan denied');
 await rejects(()=>ingest`update adaptive_private.session_plans set plan='{}' where plan_id=${id}`,'Ingest has no direct plan mutation');
 await rejects(()=>ingest`select * from adaptive_private.session_plans`,'Ingest cannot read arbitrary plans directly');
 await rejects(()=>erasure`select * from adaptive_private.intervention_proofs`,'Erasure cannot inspect graded completion proofs');
 await rejects(()=>worker`delete from adaptive_private.session_plans where plan_id=${id}`,'Worker cannot delete plan');
 await rejects(()=>sql`update adaptive_private.session_plans set plan='{}' where plan_id=${id}`,'Even admin ordinary plan updates rejected');
 const handler=createAdaptiveHandler({authenticate:createAdaptiveAuthenticator({url:api,publishableKey:process.env.SUPABASE_LOCAL_ANON_KEY}),getDatabase:async()=>ingest,resolveSessionPlan:resolver,authorizeOwner:async who=>who===u.id,readEnvironment:()=>({ADAPTIVE_RUNTIME_ENVIRONMENT:'disposable_local',ADAPTIVE_SHADOW_WRITES_ENABLED:'true',ADAPTIVE_SHADOW_WRITES_KILL_SWITCH:'false'}),readControl:async()=>({enabled:true,killSwitch:false}),verifyCompletion:createTrustedCompletionVerifier()});
 const req=payload=>new Request('http://localhost/adaptive',{method:'POST',headers:{authorization:`Bearer ${u.token}`,'content-type':'application/json'},body:JSON.stringify({operation:'session',payload})});
 check((await handler(req({planId:id,revisionIds:p.revisionIds}))).status===400,'Real Auth boundary rejects learner-selected plan fields');
 check((await handler(req({planId:id}))).status===200,'Real Auth starts stored plan through restricted ingestion');
 await rejects(()=>ingestAdaptiveAnswer(ingest,u.id,{clientEventId:randomUUID(),sessionId:p.sessionId,itemPosition:1,revisionId:fixture.revisions[3].revisionId,selectedComponents:fixture.revisions[3].gradingKey.expected,occurredAt:iso(Date.now())}),'Evidence outside plan denied');
 const generated=await generateTrustedSessionPlan({readDatabase:worker,writeDatabase:ingest,ownerId:other.id,versions:fixture.versions,seed:'cold-start'});check(generated.actualCount<=3&&generated.reasonCodes.includes('insufficient_approved_coverage'),'Trusted generator preserves caps and honest reduced count');
 // Complete model through durable output and publication phases.
 const learner=await owner();const miss=await observe(learner,0,false,0);const first=await replay(learner);check(first.rescheduled===1&&(await state(learner)).state==='learning_signal','Tasks advance generation once before cache publication');
 const [fresh]=await sql`select evidence_generation from adaptive_private.owner_state where owner_id=${learner.id}`;check((await state(learner)).input_generation===fresh.evidence_generation,'Published cache uses current resulting generation');
 const initialTasks=(await worker`select * from public.adaptive_review_tasks where owner_id=${learner.id}`).length;await queue.enqueue(learner.id);check(await queue.claim(learner.id)===null,'Completed generation remains deduplicated');check(initialTasks>=2,'Transfer and original recall both durable');
 const model=projectCompleteHistory(await snapshot(learner));check(model.plan.recommendations.some(r=>r.conceptId==='recovery.rpo'&&r.role==='supporting')&&model.plan.model.concepts['recovery.rpo'].state==='not_enough_evidence','Supporting recommendation creates no false RPO mastery');
 const snap=await snapshot(learner),reverse=structuredClone(snap);reverse.evidence.reverse();reverse.sessions.reverse();check(JSON.stringify(projectCompleteHistory(snap))===JSON.stringify(projectCompleteHistory(reverse)),'Complete model deterministic under input reordering');
 await rejects(()=>executePinnedModel(snap,{timeoutMs:1}),'CPU budget terminates actual isolated model worker');
 await rejects(()=>worker.begin(tx=>loadCompleteSnapshot(tx,{...snap,evidence:Array(10001).fill(snap.evidence[0])},{versions:fixture.versions,enrollmentId:learner.enrollmentId})),'History cap rejects whole replay without truncation');
 await rejects(()=>worker.begin(tx=>loadCompleteSnapshot(tx,{...snap,oversize:'x'.repeat(8*1024*1024)},{versions:fixture.versions,enrollmentId:learner.enrollmentId})),'Snapshot byte cap fails closed');
 const wrongBundle=structuredClone(snap);wrongBundle.bundle.catalogue.mappings=[];await rejects(async()=>projectCompleteHistory(wrongBundle),'Missing mappings fail closed');
 await observe(learner,1,true,1);await replay(learner);check((await state(learner)).state==='learning_signal','Different question in same family is not transfer');
 await observe(learner,2,true,2);await observe(learner,3,true,3);await replay(learner);check((await state(learner)).state==='improving','Two independent fresh families improve state');
 await observe(learner,4,true,6);await replay(learner);check((await state(learner)).state==='proven','Delayed independent check proves repair');
 await observe(learner,5,true,14);await observe(learner,6,true,22);await replay(learner);check((await state(learner)).state==='mastered','Later spaced check establishes mastery');
 await observe(learner,7,false,23);await replay(learner);check((await state(learner)).state==='needs_attention'&&(await state(learner)).lapse_count===1,'Post-mastery miss reverses state and tracks lapse');
 const corrected=await ingestAdaptiveAnswer(ingest,learner.id,{...miss.input,clientEventId:randomUUID(),selectedComponents:fixture.revisions[0].gradingKey.expected,supersedesEvidenceId:miss.result.evidenceId,correctionReason:'Synthetic correction'});
 const correctedAgain=await ingestAdaptiveAnswer(ingest,learner.id,{...miss.input,clientEventId:randomUUID(),selectedComponents:fixture.revisions[0].gradingKey.expected,supersedesEvidenceId:corrected.evidenceId,correctionReason:'Synthetic second correction'});
 await replay(learner);const correctionModel=projectCompleteHistory(await snapshot(learner));check(!correctionModel.plan.model.evidence.some(e=>[miss.result.evidenceId,corrected.evidenceId].includes(e.eventId))&&correctionModel.plan.model.evidence.some(e=>e.eventId===correctedAgain.evidenceId),'Entire correction chain replaces original influence');
 const pbq=await owner();await observe(pbq,12,false,0);await replay(pbq);check((await state(pbq)).state==='not_enough_evidence'&&(await state(pbq)).complete_evidence_count===0,'Complete unsupported PBQ remains coarse and excluded from mastery');
 const sticky=await owner();await observe(sticky,0,false,0);await observe(sticky,2,false,1);await observe(sticky,3,false,2);await replay(sticky);check((await state(sticky)).state==='sticky','Repeated distinct misses across sets become sticky');
 const late=await owner(),earlySession=await historicalSession(late,[0],base),lateSession=await historicalSession(late,[1],base+day);
 const later=await answer(late,lateSession,1,true,base+day+100),earlier=await answer(late,earlySession,0,false,base+100);
 for(const [g,at] of [[earlySession,base+200],[lateSession,base+day+200]])await recordAdaptiveSessionEvent(ingest,late.id,{clientEventId:randomUUID(),sessionId:g.session.session_id,status:'completed',occurredAt:iso(at)});
 await replay(late);const lateModel=projectCompleteHistory(await snapshot(late));check(lateModel.plan.model.evidence.find(e=>e.eventId===earlier.result.evidenceId).classification==='fresh_scenario'&&lateModel.plan.model.evidence.find(e=>e.eventId===later.result.evidenceId).classification==='same_scenario','Late receipts replay novelty by full occurrence history');
 await observe(sticky,4,true,3);await observe(sticky,5,true,5);await replay(sticky);check((await state(sticky)).state==='sticky','Two fresh successes do not clear sticky recovery');await observe(sticky,6,true,7);await replay(sticky);check((await state(sticky)).state==='improving','Three independent successes improve sticky state');await observe(sticky,7,true,12);await replay(sticky);check((await state(sticky)).state==='proven','Sticky proof respects longer spacing');await observe(sticky,0,true,13);await observe(sticky,8,true,27);await replay(sticky);check((await state(sticky)).state==='mastered','Sticky mastery respects fourteen-day and two-set gates');await observe(sticky,9,false,28);await replay(sticky);check((await state(sticky)).state==='sticky'&&(await state(sticky)).ever_sticky,'Sticky history survives mastery and relapse');
 const taskOwner=await owner();await observe(taskOwner,0,false,0);await replay(taskOwner);const [recallTask]=await worker`select * from public.adaptive_review_tasks where owner_id=${taskOwner.id} and task_type='original_recall'`;
 await observe(taskOwner,12,true,1);await observe(taskOwner,0,true,3);await replay(taskOwner);check((await worker`select count(*)::int n from public.adaptive_review_task_events where owner_id=${taskOwner.id} and task_id=${recallTask.task_id} and status='completed'`)[0].n===1,'Task completion is graded, gated and written once');
 const scheduledOwner=await owner();await observe(scheduledOwner,0,false,0);
 const env={ADAPTIVE_RUNTIME_ENVIRONMENT:'disposable_local',ADAPTIVE_SHADOW_WRITES_ENABLED:'true',ADAPTIVE_SHADOW_WRITES_KILL_SWITCH:'false'};
 const drain=createTrustedProjectionDrain({store:{...queue,claim:()=>queue.claim(scheduledOwner.id)},getDatabase:async()=>worker,readEnvironment:()=>env,readControl:async()=>({enabled:true,killSwitch:false})});
 const scheduler=createAdaptiveScheduler({readEnvironment:()=>env,verifyCredential:async()=>({kind:'scheduler',audience:'adaptive-worker',nonce:randomUUID(),expiresAt:Date.now()+50000}),consumeNonce:createSchedulerReplayGuard(worker),drain});
 const scheduledResponse=await scheduler(new Request('http://localhost/jobs',{method:'POST',headers:{authorization:'Scheduler synthetic-proof-0001','content-type':'application/json'},body:'{}'}));const scheduledReceipt=await scheduledResponse.json();check(scheduledResponse.status===200&&scheduledReceipt.completed===1&&(await state(scheduledOwner)).state==='learning_signal','Scheduler executes complete model and both durable phases');
 // Completion comes from a graded target, never a browser assertion.
 const interventionOwner=await owner();await observe(interventionOwner,0,false,0);await replay(interventionOwner);
 const [rec]=await worker`select * from public.adaptive_recommendations where owner_id=${interventionOwner.id} and role='direct' and content_revision_id is not null`;
 const completionInput=()=>({clientEventId:randomUUID(),recommendationId:rec.recommendation_id,eventType:'completed',activityType:'lesson_check',occurredAt:iso(Date.now())});
 const claimedCompletion=await recordAdaptiveIntervention(ingest,interventionOwner.id,completionInput(),{verifyCompletion:createTrustedCompletionVerifier()});check(!claimedCompletion.completionVerified,'Learner completion without graded evidence remains unverified');
 await rejects(()=>recordAdaptiveIntervention(ingest,interventionOwner.id,completionInput(),{verifyCompletion:async()=>({verified:true,criteria:'forged'})}),'Forged completion callback cannot bypass database proof');
 const gradedCheck=await realObserve(interventionOwner,10,true,{source:'targeted_review',mode:'targeted_review'});
 const [completionClock]=await sql`select clock_timestamp() as now`;const verifiedInput={...completionInput(),occurredAt:completionClock.now.toISOString()};
 const verified=await recordAdaptiveIntervention(ingest,interventionOwner.id,verifiedInput,{verifyCompletion:createTrustedCompletionVerifier()});check(verified.completionVerified,'Server-graded targeted check verifies configured intervention');
 check((await recordAdaptiveIntervention(ingest,interventionOwner.id,verifiedInput,{verifyCompletion:createTrustedCompletionVerifier()})).status==='retry','Verified intervention retry is idempotent');
 await realObserve(interventionOwner,8,false);await replay(interventionOwner);check((await state(interventionOwner)).state==='sticky','Miss after verified intervention becomes sticky');
 const cp=fixture.revisions[10];const wrongOption=cp.components.find(c=>c.id!==cp.gradingKey.expected[0].valueId).id;
 await ingestAdaptiveAnswer(ingest,interventionOwner.id,{...gradedCheck.input,clientEventId:randomUUID(),selectedComponents:[{componentId:wrongOption,valueId:wrongOption}],supersedesEvidenceId:gradedCheck.result.evidenceId,correctionReason:'Invalidate completion fixture'});
 await replay(interventionOwner);check(!projectCompleteHistory(await snapshot(interventionOwner)).plan.model.evidence.some(e=>e.kind==='intervention_completed'),'Corrected completion proof removes intervention influence');
 // Process exits after task commit and after cache commit, losing the response/ack.
 const crashOwner=await owner();await observe(crashOwner,0,false,0);
 const afterTasks=await crashAfterReplay(crashOwner);check(afterTasks.status==='rescheduled'&&!await state(crashOwner),'Task-phase process exit leaves no stale published cache');
 const beforeCount=(await worker`select count(*)::int n from public.adaptive_review_tasks where owner_id=${crashOwner.id}`)[0].n;
 const afterCache=await crashAfterReplay(crashOwner);check(afterCache.status==='ready'&&(await state(crashOwner)).state==='learning_signal','Follow-up process publishes full model before lost acknowledgment');
 await sql`update adaptive_private.projection_jobs set lease_until=clock_timestamp()-interval '1 second' where job_id=${afterCache.job.id}`;
 await rejects(()=>queue.complete(afterCache.job),'Old full-model lease cannot acknowledge after expiry');
 await rejects(()=>rebuildTrustedLearningOwner(worker,crashOwner.id,{job:afterCache.job}),'Stale full-model lease cannot publish');
 await replay(crashOwner);check((await worker`select count(*)::int n from public.adaptive_review_tasks where owner_id=${crashOwner.id}`)[0].n===beforeCount,'Crash/retry/lost ack converges without duplicate tasks');
 const [cacheGen]=await sql`select evidence_generation from adaptive_private.owner_state where owner_id=${crashOwner.id}`;check((await state(crashOwner)).input_generation===cacheGen.evidence_generation,'Recovered publication retains exact generation');
 // Legacy provenance is retained but cannot manufacture proof or novelty.
 const coarse=await owner();await sql`insert into public.adaptive_answer_evidence(owner_id,client_event_id,submission_sha256,question_id,mapping_version,algorithm_version,configuration_version,evidence_precision,provenance,source,mode,classification_at_ingest,classification_provenance,legacy_attempt_id) values(${coarse.id},${randomUUID()},${'f'.repeat(64)},${fixture.revisions[0].questionId},${fixture.versions.mappingVersion},${fixture.versions.algorithmVersion},${fixture.versions.configurationVersion},'unknown','legacy_inferred','legacy','legacy','unknown','legacy_unknown',${randomUUID()})`;
 await observe(coarse,0,true,0);await replay(coarse);const coarseModel=projectCompleteHistory(await snapshot(coarse));check(coarseModel.plan.model.evidence[0].classification==='exact_repeat'&&(await state(coarse)).state==='not_enough_evidence','Incomplete prior exposure prevents fabricated novelty');
 // Revoking the triple invalidates an unstarted stored plan. Restore synthetic authorization afterward.
 const stalePlan=plan(),staleId=await storeTrustedSessionPlan(ingest,other.id,stalePlan);
 await sql`insert into adaptive_private.shadow_authorizations(mapping_version,algorithm_version,configuration_version,action,actor_id) values(${fixture.versions.mappingVersion},${fixture.versions.algorithmVersion},${fixture.versions.configurationVersion},'revoke',${fixture.actor})`;
 await rejects(()=>resolver(other.id,staleId),'Revoked version plan cannot be resolved');await rejects(()=>worker.begin(tx=>loadRuntimeBundle(tx,fixture.versions)),'Revoked version triple cannot replay');
 await sql`insert into adaptive_private.shadow_authorizations(mapping_version,algorithm_version,configuration_version,action,actor_id) values(${fixture.versions.mappingVersion},${fixture.versions.algorithmVersion},${fixture.versions.configurationVersion},'authorize',${fixture.actor})`;
 // Private Data API denials are exercised with real signed-in and anonymous tokens.
 for(const table of ['session_plans','intervention_proofs'])for(const token of [u.token,other.token,process.env.SUPABASE_LOCAL_ANON_KEY]){
  const r=await fetch(`${api}/rest/v1/${table}`,{headers:{apikey:process.env.SUPABASE_LOCAL_ANON_KEY,authorization:`Bearer ${token}`,'accept-profile':'adaptive_private'}});check(!r.ok,`${table} private REST denied`);
 }
 // Stale lease and owner erasure include all plan/proof rows.
 const dying=await owner();const dyingGraph=await observe(dying,0,false,0),job=await queue.claim(dying.id);await withdrawShadow(erasure,dying.id,cleanup);await rejects(()=>rebuildTrustedLearningOwner(worker,dying.id,{job}),'Deletion fences complete runtime');await rejects(()=>resolver(dying.id,dyingGraph.planId),'Erasure removes immutable plan');
 check((await sql`select count(*)::int n from adaptive_private.session_plans where owner_id=${dying.id}`)[0].n===0,'No owner plan remains after withdrawal');
 await withdrawShadow(erasure,interventionOwner.id,cleanup);check((await sql`select count(*)::int n from adaptive_private.intervention_proofs where owner_id=${interventionOwner.id}`)[0].n===0,'Withdrawal erases server completion proofs');
 const [newEnroll]=await sql`select adaptive_private.enroll_shadow(${dying.id},clock_timestamp()+interval '1 day',gen_random_uuid()) id`;check(newEnroll.id!==dying.enrollmentId,'Re-enrollment has fresh fence');await rejects(()=>resolver(dying.id,dyingGraph.planId),'Re-enrollment cannot revive old plan');
 const expired=await owner();await observe(expired,0,false,0);await sql`update adaptive_private.shadow_enrollments set enrolled_at=clock_timestamp()-interval '2 days',expires_at=clock_timestamp()-interval '1 day' where owner_id=${expired.id}`;check((await eraseExpiredEnrollments(erasure,cleanup)).completed===1,'Expiry erases plans and graph');
 const timings=[];for(const n of [10,500]){const bench=await owner(),g=await historicalSession(bench,[0],base);const begin=performance.now();for(let i=0;i<n;i++)await answer(bench,g,0,i%3!==0,base+100+i);const ingestMs=performance.now()-begin;await recordAdaptiveSessionEvent(ingest,bench.id,{clientEventId:randomUUID(),sessionId:g.session.session_id,status:'completed',occurredAt:iso(base+1000)});const start=performance.now();const out=await replay(bench);timings.push({answers:n,ingestMs:Math.round(ingestMs),fullReplayAndAckMs:Math.round(performance.now()-start),claims:out.steps});}
 console.log(JSON.stringify({status:'PASS',assertions:count,timings,checks}));
}catch(error){console.error(`FAIL trusted runtime: ${error.code??error.name}: ${error.message}`);console.error(error.stack?.split('\n').slice(1,5).join('\n'));process.exitCode=1;}
finally{for(const u of users){try{await withdrawShadow(erasure,u.id,cleanup);await admin.auth.admin.deleteUser(u.id);}catch{}}await closeAdaptiveDatabase(pool);await closeAdaptiveDatabase(sql);}
