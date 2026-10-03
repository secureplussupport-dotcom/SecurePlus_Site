// Run after audit:learning-database in a reset disposable local Supabase stack.
import assert from 'node:assert/strict';
import { randomUUID,randomBytes,createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { createAdaptiveDatabase,closeAdaptiveDatabase } from '../server/adaptive/database.mjs';
import { createAdaptiveDeletionAuthenticator } from '../server/adaptive/auth.mjs';
import { assertOwnerWritable } from '../server/adaptive/owner-guard.mjs';
import * as persistence from '../server/adaptive/persistence.mjs';
import { rebuildAdaptiveOwner } from '../server/adaptive/projection-worker.mjs';
import { beginConfirmedAccountErasure,resumeAdaptiveErasure,resumePendingErasures,eraseExpiredEnrollments,withdrawShadow,createAdaptiveDeletionHandler,adaptiveDeletionInstalled } from '../server/adaptive/deletion.mjs';
import { createAccountCleanup } from '../server/adaptive/account-cleanup.mjs';
import { createDurableQueue } from '../server/adaptive/durable-queue.mjs';

const url=process.env.SUPABASE_LOCAL_API_URL;
assert.ok(['localhost','127.0.0.1'].includes(new URL(url).hostname));
const sql=createAdaptiveDatabase({max:8});
// Real concurrent runtime transactions execute with service_role privileges.
const pool=createAdaptiveDatabase({max:8});
const runtime=(...args)=>runtime.begin(tx=>tx(...args));
runtime.begin=fn=>pool.begin(async tx=>{await tx`set local role service_role`;return fn(tx);});
runtime.end=options=>pool.end(options);
const admin=createClient(url,process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const authenticate=createAdaptiveDeletionAuthenticator({url,publishableKey:process.env.SUPABASE_LOCAL_ANON_KEY});
const queue=createDurableQueue(runtime), logs=[];
let count=0; const check=(ok,label)=>{assert.ok(ok,label);count++;};
const rejects=async(fn,label)=>{await assert.rejects(fn,undefined,label);count++;};
const versions={mappingVersion:'local-map-v1',algorithmVersion:'local-algo-v1',configurationVersion:'local-config-v1'};
const actor='00000000-0000-4000-8000-000000000100';
const fixtureOwner='00000000-0000-4000-8000-000000000002';
const clients=[];
async function makeUser(enroll=true){
 const email=`erase-${randomUUID()}@example.invalid`,password=randomBytes(32).toString('base64url');
 const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});assert.ifError(error);
 const client=createClient(url,process.env.SUPABASE_LOCAL_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const result=await client.auth.signInWithPassword({email,password});assert.ifError(result.error);
 const token=result.data.session.access_token,user=await authenticate(token);assert.ok(user?.sessionId);
 if(enroll)await runtime`select adaptive_private.enroll_shadow(${user.id},clock_timestamp()+interval '7 days',gen_random_uuid())`;
 const record={...user,token,email,password,refreshToken:result.data.session.refresh_token};clients.push(record);return record;
}
async function confirmation(user){
 const token=randomBytes(32).toString('base64url'),hash=createHash('sha256').update(token).digest('hex');
 await sql`insert into public.account_deletion_requests(user_id,token_hash,expires_at) values(${user.id},${hash},clock_timestamp()+interval '15 minutes')`;
 return token;
}
const stripeCalls=[];
const cleanup=createAccountCleanup({supabase:admin,queue,stripe:{subscriptions:{cancel:async subscription=>{stripeCalls.push(subscription);return {status:'canceled'};}}},log:r=>logs.push(r)});
const pause=()=>{let resolve;return {promise:new Promise(r=>resolve=r),resolve:()=>resolve()};};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let revision,compiled;
const plan=()=>({sessionId:randomUUID(),source:'practice',mode:'normal',seed:null,requestedCount:1,requestedPbqCount:0,revisionIds:[revision],...versions});
async function graph(user){
 const input=plan(),session=await persistence.startAdaptiveSession(runtime,user.id,input);
 const wrong=compiled.components.find(c=>c.kind==='option'&&c.id!==compiled.gradingKey.expected[0].valueId).id;
 const answer={clientEventId:randomUUID(),sessionId:session.sessionId,itemPosition:1,revisionId:revision,selectedComponents:[{componentId:wrong,valueId:wrong}],occurredAt:new Date(Date.parse(session.startedAt)+100).toISOString()};
 const evidence=await persistence.ingestAdaptiveAnswer(runtime,user.id,answer);
 const recommendationInput={conceptId:'recovery.rto',contentRevisionId:'00000000-0000-4000-8000-000000000401',sourceEvidenceId:evidence.evidenceId,role:'direct',reasonCodes:['local_test'],...versions};
 const recommendation=await persistence.persistAdaptiveRecommendation(runtime,user.id,recommendationInput);
 const interventionInput={clientEventId:randomUUID(),recommendationId:recommendation.recommendationId,eventType:'opened',activityType:'lesson_open',occurredAt:answer.occurredAt};
 await persistence.recordAdaptiveIntervention(runtime,user.id,interventionInput);
 const taskInput={conceptId:'recovery.rto',sourceEvidenceId:evidence.evidenceId,targetRevisionId:revision,taskType:'original_recall',reasonCodes:['local_test'],eligibleAt:answer.occurredAt,eligibleSetIndex:session.setIndex,initialStatus:'pending',...versions};
 const task=await persistence.persistAdaptiveReviewTask(runtime,user.id,taskInput);
 const taskEventInput={taskId:task.taskId,status:'scheduled',occurredAt:answer.occurredAt};
 await persistence.recordAdaptiveTaskEvent(runtime,user.id,taskEventInput);
 return {input,session,answer,evidence,recommendationInput,interventionInput,taskInput,taskEventInput};
}
const projected=(user,g,snapshot)=>[{ownerId:user.id,conceptId:'recovery.rto',...versions,state:'learning_signal',evidenceLevel:'limited',effectiveSample:1,distinctQuestions:1,distinctScenarios:1,completeEvidenceCount:1,everSticky:false,lapseCount:0,unresolvedEvidenceIds:[g.evidence.evidenceId],lastAnswerAt:g.answer.occurredAt,lastInterventionAt:null,provenAt:null,masteredAt:null,nextDueTaskId:null,inputGeneration:snapshot.generation}];
async function absent(owner){
 const tables=await sql`select table_schema,table_name from information_schema.columns where column_name='owner_id' and ((table_schema='public' and table_name like 'adaptive_%') or table_schema='adaptive_private')`;
 for(const table of tables){const [r]=await sql`select count(*)::int as n from ${sql(table.table_schema+'.'+table.table_name)} where owner_id=${owner}`;assert.equal(r.n,0,table.table_name);}
 check(await queue.remainingOwner(owner)===0,'No identifiable graph or job remains');
}
try{
 await sql`create extension if not exists pg_graphql`;
 // Local test only: prove collection visibility, not just disabled introspection.
 await sql.unsafe("comment on schema public is '@graphql({\"introspection\": true})'");
 await sql.unsafe(readFileSync('supabase/account-deletion.sql','utf8'));
 // Minimal local application-owned profile fixture, not a production schema change.
 await sql`create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,stripe_subscription_id text)`;
 await sql`alter table public.profiles enable row level security`;
 await sql`revoke all on public.profiles from public,anon,authenticated`;
 await sql`grant all on public.profiles to service_role`;
 await sql`notify pgrst,'reload schema'`;
 const [source]=await sql`select q.revision_id,g.grading_payload from public.adaptive_question_revisions q join adaptive_private.grading_keys g using(revision_id) limit 1`;
 revision=source.revision_id;compiled=source.grading_payload.compiledRevision;
 const a=await makeUser(),b=await makeUser(),c=await makeUser();
 check(a.id!==b.id && a.sessionId!==b.sessionId,'Two actual Auth users and independent sessions');
 // Activation is neither necessary nor sufficient for private authorization.
 for(const version of Object.values(versions))await sql`insert into public.adaptive_version_events(version_id,action,actor_id,reason) values(${version},'deactivate',${actor},'Local separation test')`;
 await sql`insert into public.profiles(id,stripe_subscription_id) values(${a.id},'sub_local_fixture')`;
 const g=await graph(a),gb=await graph(b),gc=await graph(c);
 check(g.session.sessionId && gb.session.sessionId,'Shadow writes work while versions are learner-inactive');
 await sql`insert into adaptive_private.shadow_authorizations(mapping_version,algorithm_version,configuration_version,action,actor_id) values(${versions.mappingVersion},${versions.algorithmVersion},${versions.configurationVersion},'revoke',${actor})`;
 await rejects(()=>persistence.startAdaptiveSession(runtime,b.id,plan()),'No session without private authorization');
 await rejects(()=>persistence.ingestAdaptiveAnswer(runtime,b.id,{...gb.answer,clientEventId:randomUUID()}),'Authorization revocation also rejects existing-session evidence');
 await sql`insert into adaptive_private.shadow_authorizations(mapping_version,algorithm_version,configuration_version,action,actor_id) values(${versions.mappingVersion},${versions.algorithmVersion},${versions.configurationVersion},'authorize',${actor})`;
 await rejects(()=>sql.begin(async tx=>{
   await tx`insert into adaptive_private.version_payloads(version_id,payload) values('local-pending-v1','{}')`;
   await tx`insert into public.adaptive_version_sets(mapping_version,algorithm_version,configuration_version) values('local-pending-v1',${versions.algorithmVersion},${versions.configurationVersion})`;
   await tx`insert into adaptive_private.shadow_authorizations(mapping_version,algorithm_version,configuration_version,action,actor_id) values('local-pending-v1',${versions.algorithmVersion},${versions.configurationVersion},'authorize',${actor})`;
 }), 'Pending human approval cannot authorize shadow');
 const tables=await sql`select schemaname,tablename from pg_tables where (schemaname='public' and tablename like 'adaptive_%') or schemaname='adaptive_private'`;
 for(const user of [a,b,null])for(const table of tables){
  const headers={apikey:process.env.SUPABASE_LOCAL_ANON_KEY,authorization:`Bearer ${user?.token??process.env.SUPABASE_LOCAL_ANON_KEY}`,'accept-profile':table.schemaname};
  const r=await fetch(`${url}/rest/v1/${table.tablename}?select=*`,{headers});
  check([401,403,406].includes(r.status),`REST denies ${table.tablename} for owner/cross/anon`);
  if(table.schemaname==='public'){
   const w=await fetch(`${url}/rest/v1/${table.tablename}`,{method:'POST',headers:{...headers,'content-type':'application/json'},body:'{}'});
   check([401,403].includes(w.status),`Browser writes denied ${table.tablename}`);
  }
 }
 // Explicitly exercise RLS itself as defense in depth if a grant is reintroduced.
 await sql.begin(async tx=>{
  await tx`grant select on public.adaptive_sessions to authenticated`;
  await tx`set local role authenticated`;
  await tx`select set_config('request.jwt.claim.sub',${a.id},true)`;
  check((await tx`select count(*)::int as n from public.adaptive_sessions`)[0].n===0,'RLS denies even with accidental SELECT grant');
  await tx`reset role`;await tx`revoke select on public.adaptive_sessions from authenticated`;
 });
 for(const user of [a,b,null]){
  const headers={apikey:process.env.SUPABASE_LOCAL_ANON_KEY,authorization:`Bearer ${user?.token??process.env.SUPABASE_LOCAL_ANON_KEY}`,'content-type':'application/json'};
  const control=await fetch(`${url}/graphql/v1`,{method:'POST',headers,body:JSON.stringify({query:'{ __typename }'})});
  const controlBody=await control.json();check(controlBody.data?.__typename==='Query','GraphQL endpoint works');
  const introspection=await fetch(`${url}/graphql/v1`,{method:'POST',headers,body:JSON.stringify({query:'{ __schema { queryType { fields { name } } } }'})});
  const schema=await introspection.json();
  check(Array.isArray(schema.data?.__schema?.queryType?.fields) && !schema.data.__schema.queryType.fields.some(f=>/adaptive|grading|shadow|erasure|editorial|owner_state|version_payload|projectionJobs|schedulerNonces|runtimeReceipts/i.test(f.name)),'GraphQL actual schema contains no adaptive collections');
  for(const field of ['adaptiveSessionsCollection','adaptive_sessionsCollection','gradingKeysCollection','shadowEnrollmentsCollection','erasureOperationsCollection','projectionJobsCollection','schedulerNoncesCollection','runtimeReceiptsCollection']){
   const r=await fetch(`${url}/graphql/v1`,{method:'POST',headers,body:JSON.stringify({query:`{ ${field} { edges { node { id } } } }`})});
   const body=await r.json();check(body.errors?.length>0 && !body.data?.[field],`GraphQL hides ${field}`);
  }
 }
 // Raw and forged authority is rejected; no broad service eraser remains.
 await rejects(()=>runtime.begin(tx=>tx`select adaptive_private.delete_learner_data(${a.id})`),'Old unrestricted eraser revoked');
 await rejects(()=>runtime.begin(tx=>tx`select adaptive_private.begin_erasure(${a.id},'account',gen_random_uuid())`),'Unconfirmed deletion denied');
 const token=await confirmation(a);
 await rejects(()=>beginConfirmedAccountErasure(runtime,b,token),'Confirmation cannot select another owner');
 const started=pause(),release=pause();
 const held={begin:fn=>runtime.begin(async tx=>{await assertOwnerWritable(tx,a.id);started.resolve();await release.promise;return fn(tx);})};
 const write=persistence.startAdaptiveSession(held,a.id,plan());await started.promise;
 let deletionFinished=false;
 const deletion=beginConfirmedAccountErasure(runtime,a,token).then(id=>{deletionFinished=true;return id;});
 await wait(100);check(!deletionFinished,'Deletion waits for writer holding owner lock');
 check((await persistence.startAdaptiveSession(runtime,b.id,plan())).sessionId,'Different owner remains writable during contention');
 release.resolve();await write;const op=await deletion;
 check(await beginConfirmedAccountErasure(runtime,a,token)===op,'Confirmed deletion retry uses same durable operation');
 for(const fn of [()=>persistence.startAdaptiveSession(runtime,a.id,g.input),()=>persistence.ingestAdaptiveAnswer(runtime,a.id,g.answer),()=>persistence.recordAdaptiveSessionEvent(runtime,a.id,{clientEventId:randomUUID(),sessionId:g.session.sessionId,status:'completed',occurredAt:g.answer.occurredAt}),()=>persistence.persistAdaptiveRecommendation(runtime,a.id,g.recommendationInput),()=>persistence.recordAdaptiveIntervention(runtime,a.id,g.interventionInput),()=>persistence.persistAdaptiveReviewTask(runtime,a.id,g.taskInput),()=>persistence.recordAdaptiveTaskEvent(runtime,a.id,g.taskEventInput),()=>rebuildAdaptiveOwner(runtime,a.id,{project:()=>[]}),()=>queue.enqueue(a.id),()=>queue.claim(a.id)])await rejects(fn,'Every writer and retry rejects after deletion begins');
 await rejects(()=>runtime.begin(tx=>tx`insert into adaptive_private.owner_state(owner_id) values(${a.id}) on conflict(owner_id) do update set last_set_index=0`),'SQL trigger blocks bypass');
 const failed=await resumeAdaptiveErasure(runtime,op,{...cleanup,cancelSubscription:async()=>{throw new Error('private-token email answer');}});
 check(failed.status==='retryable','Partial external failure is retryable');
 const [state]=await sql`select stage,failed_retryable from adaptive_private.erasure_operations where operation_id=${op}`;
 check(state.stage==='graph_erased' && state.failed_retryable,'Checkpoint survives failure and keeps block');
 await rejects(()=>persistence.startAdaptiveSession(runtime,a.id,plan()),'Erased graph cannot be recreated on failed cleanup');
 const signOutFailure=await resumeAdaptiveErasure(runtime,op,{...cleanup,deleteAuthUser:async()=>{throw new Error('Auth temporary failure');}});
 check(signOutFailure.status==='retryable','Auth failure after global session revocation is resumable');
 check((await sql`select count(*)::int as n from auth.sessions where user_id=${a.id}`)[0].n===0,'All Auth sessions revoked before Auth deletion');
 await rejects(()=>beginConfirmedAccountErasure(runtime,a,token),'Outstanding JWT cannot confirm after session revocation');
 const refreshClient=createClient(url,process.env.SUPABASE_LOCAL_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 check(!!(await refreshClient.auth.refreshSession({refresh_token:a.refreshToken})).error,'Revoked session cannot refresh');
 const afterDelete=await resumeAdaptiveErasure(runtime,op,{...cleanup,deleteAuthUser:async owner=>{await cleanup.deleteAuthUser(owner);throw new Error('Crash after Auth deletion');}});
 check(afterDelete.status==='retryable','Crash after Auth removal remains resumable');
 check((await resumePendingErasures(runtime,cleanup)).completed===1,'Resume continues after Auth deletion without bearer token');
 check((await resumeAdaptiveErasure(runtime,op,cleanup)).status==='completed','Completed operation retry idempotent');
 await absent(a.id);
 check(stripeCalls.includes('sub_local_fixture'),'Subscription cleanup ran using server-owned profile');
 check((await sql`select count(*)::int as n from public.profiles where id=${a.id}`)[0].n===0,'Application profile cascades with Auth deletion');
 check(!(await authenticate(a.token)),'Deleted Auth identity fails remote verification');
 // Projection publishing first finishes under the same lock, then erasure wins.
 await queue.enqueue(c.id);await queue.enqueue(c.id);const lease=await queue.claim(c.id);
 const projecting=pause(),finishProjection=pause();
 const worker=rebuildAdaptiveOwner(runtime,c.id,{enrollmentId:lease.enrollmentId,now:new Date(Date.now()+2000).toISOString(),project:async snapshot=>{projecting.resolve();await finishProjection.promise;return projected(c,gc,snapshot);}});
 await projecting.promise;let erasureStarted=false;
 const withdrawal=runtime`select adaptive_private.begin_erasure(${c.id},'withdrawal') as id`.then(rows=>{erasureStarted=true;return rows[0].id;});
 await wait(100);check(!erasureStarted,'Deletion waits for projection publication transaction');
 finishProjection.resolve();check((await worker).status==='ready','In-flight projection commits before deletion');
 const withdrawalOp=await withdrawal;
 const incomplete=await resumeAdaptiveErasure(runtime,withdrawalOp,{...cleanup,queue:{cancelOwner:async()=>{},remainingOwner:owner=>queue.remainingOwner(owner)}});
 check(incomplete.status==='retryable','Cannot report completion while identifiable jobs remain');
 check((await sql`select stage from adaptive_private.erasure_operations where operation_id=${withdrawalOp}`)[0].stage==='writes_blocked','Failed cancellation preserves durable write block');
 check((await resumeAdaptiveErasure(runtime,withdrawalOp,cleanup)).status==='completed','Withdrawal cancels queued and leased jobs then erases');
 await rejects(()=>queue.acknowledge(lease),'Old lease cannot acknowledge after cancellation');
 await rejects(()=>rebuildAdaptiveOwner(runtime,c.id,{enrollmentId:lease.enrollmentId,project:()=>[]}), 'Old worker cannot recreate projection');
 await absent(c.id);
 const repeatWithdrawals=await Promise.all([withdrawShadow(runtime,c.id,cleanup),withdrawShadow(runtime,c.id,cleanup)]);
 check(repeatWithdrawals.every(r=>r.status==='completed'),'Concurrent repeated withdrawal stays erased');
 check((await admin.auth.admin.getUserById(c.id)).data.user?.id===c.id,'Withdrawal preserves ordinary account');
 // Explicit new consent creates a fresh fence; an old lease remains invalid.
 await runtime`select adaptive_private.enroll_shadow(${c.id},clock_timestamp()+interval '7 days',gen_random_uuid())`;
 await rejects(()=>rebuildAdaptiveOwner(runtime,c.id,{enrollmentId:lease.enrollmentId,project:()=>[]}), 'New enrollment never revives old jobs');
 check((await withdrawShadow(runtime,c.id,cleanup)).status==='completed','Fresh enrollment erased again');
 const expiring=await makeUser();await graph(expiring);await queue.enqueue(expiring.id);
 await sql`update adaptive_private.shadow_enrollments set enrolled_at=clock_timestamp()-interval '2 days',expires_at=clock_timestamp()-interval '1 day' where owner_id=${expiring.id}`;
 await rejects(()=>persistence.startAdaptiveSession(runtime,expiring.id,plan()),'Expiry stops writes before scanner runs');
 check((await eraseExpiredEnrollments(runtime,cleanup)).completed===1,'Expired enrollment erased through lifecycle');await absent(expiring.id);
 check((await sql`select count(*)::int as n from public.adaptive_sessions where owner_id=${b.id}`)[0].n>0,'Other learner graph survives');
 check((await sql`select count(*)::int as n from public.adaptive_question_revisions`)[0].n===2,'Shared catalogue survives');
 check((await sql`select actor_id from adaptive_private.editorial_actors where actor_id=${actor}`)[0]?.actor_id===actor,'Durable editorial provenance survives');
 // Probe a genuinely absent adaptive schema inside a rolled-back rename.
 await rejects(()=>sql.begin(async tx=>{await tx`alter schema adaptive_private rename to adaptive_probe`;check(!await adaptiveDeletionInstalled(tx),'Missing schema capability is false');throw new Error('rollback probe');}),'Probe transaction rolled back');
 const body=JSON.stringify(logs);
 check(clients.every(u=>![u.id,u.token,u.email,u.password,u.refreshToken].some(value=>body.includes(value))) && !body.includes('private-token'),'No sensitive operational logs');
 const handler=createAdaptiveDeletionHandler({authenticate,getDatabase:async()=>runtime,cleanup,readEnvironment:()=>({ADAPTIVE_RUNTIME_ENVIRONMENT:'disposable_local'} )});
 const request=(payload,bearer=b.token)=>new Request('http://localhost/delete',{method:'POST',headers:{authorization:`Bearer ${bearer}`,'content-type':'application/json'},body:JSON.stringify(payload)});
 check((await handler(request({deletionToken:'x'.repeat(43),ownerId:a.id}))).status===400,'Deletion HTTP rejects owner injection');
 check((await handler(request({deletionToken:'x'.repeat(43)},'invalid'))).status===401,'Deletion HTTP rejects invalid Auth');
 const denied=createAdaptiveDeletionHandler({readEnvironment:()=>({NODE_ENV:'production'})});
 check((await denied(request({}))).status===503,'Production deletion adapter remains hard-disabled');
 const viaHttp=await makeUser();
 const httpToken=await confirmation(viaHttp);
 const httpResult=await handler(request({deletionToken:httpToken},viaHttp.token));
 check(httpResult.status===200 && (await httpResult.json()).status==='completed','Confirmed Auth HTTP path completes local account erasure');
 await absent(viaHttp.id);
 // Clean remaining real accounts with the same erasure machinery.
 await withdrawShadow(runtime,b.id,cleanup);
 for(const user of clients){const {error}=await admin.auth.admin.deleteUser(user.id);if(error && error.code!=='user_not_found')throw error;}
 check((await sql`select count(*)::int as n from adaptive_private.erasure_operations where stage='completed' and (owner_id is not null or confirmation_request_id is not null)`)[0].n===0,'Completed receipts retain no subject link');
 console.log(`PASS deletion/shadow isolation: ${count} assertions; real Auth/REST/GraphQL, role transactions, races, erasure retries, retention and durable queue fencing.`);
}catch(error){console.error(`FAIL deletion/shadow isolation: ${error.code??error.name}: ${error.message}`);process.exitCode=1;}
finally{await closeAdaptiveDatabase(sql);await closeAdaptiveDatabase(runtime);}
