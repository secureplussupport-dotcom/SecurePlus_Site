import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash,randomUUID,randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import postgres from 'postgres';
import assert from 'node:assert/strict';
import {seedTrustedLearningFixture} from './trusted-learning-fixture.mjs';
import {storeTrustedSessionPlan} from '../../server/adaptive/session-plans.mjs';
import {startAdaptiveSession,ingestAdaptiveAnswer,recordAdaptiveSessionEvent} from '../../server/adaptive/persistence.mjs';
import {createDurableQueue} from '../../server/adaptive/durable-queue.mjs';
import {rebuildTrustedLearningOwner} from '../../server/adaptive/trusted-learning-runtime.mjs';
export const container='secureplus-4d-pg176',database='adaptive_4d_rehearsal';
export const image='supabase/postgres@sha256:4c39816ce8d9303a3aba1161c842929c73a40c7109a9ef1b644582478e31832e';
export const secret=readFileSync('/tmp/secureplus-4d-db-secret','utf8').trim();
export const url=`postgres://postgres:${secret}@127.0.0.1:55442/${database}`;
export const connect=(connection=url,max=1)=>postgres(connection,{max,prepare:false,onnotice:()=>{},connect_timeout:3,idle_timeout:2});
export const hash=x=>createHash('sha256').update(x).digest('hex');
export function docker(args,input){const r=spawnSync('docker',args,{input,encoding:'utf8',maxBuffer:32*1024*1024});if(r.status)throw Object.assign(new Error('Disposable Docker operation failed'),{detail:r.stderr.slice(-1500)});return r.stdout;}
export const psql=(sql,db=database)=>docker(['exec','-i',container,'psql','-U','postgres','-d',db,'-v','ON_ERROR_STOP=1','-At'],sql);
export const migrations=readdirSync('supabase/migrations').filter(f=>/^2026100.*\.sql$/.test(f)).sort().map(name=>({name,sql:readFileSync('supabase/migrations/'+name,'utf8'),sha256:hash(readFileSync('supabase/migrations/'+name))}));
export async function resetDatabase(){
 assert.equal(docker(['inspect',container,'--format','{{.Config.Image}}']).trim(),image);
 const admin=connect(url.replace('/'+database,'/postgres'));
 await admin.unsafe(`drop database if exists ${database} with (force)`);
 for(const role of ['adaptive_ingest_login','adaptive_worker_login','adaptive_erasure_login','adaptive_ingest','adaptive_worker','adaptive_erasure'])await admin.unsafe(`drop role if exists ${role}`);
 await admin.unsafe(`create database ${database} template postgres`);await admin.end();
 docker(['exec','-i',container,'psql','-U','supabase_admin','-d',database,'-v','ON_ERROR_STOP=1'], 'create table auth.sessions(id uuid primary key,user_id uuid not null references auth.users(id)); grant all on auth.sessions to postgres;');
 const sql=connect();
 await sql.unsafe(`
 create table public.profiles(id uuid primary key references auth.users(id),stripe_subscription_id text);
 create table public.account_deletion_requests(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id),token_hash text,used_at timestamptz,expires_at timestamptz);
 create table public.attempts(id bigint generated always as identity primary key,user_id uuid references auth.users(id),question_id text,question_type text,title text,domain text,chapter text,correct boolean,score numeric,created_at timestamptz default now());
 alter table public.profiles enable row level security;alter table public.account_deletion_requests enable row level security;alter table public.attempts enable row level security;
 revoke all on public.profiles,public.account_deletion_requests,public.attempts from public,anon,authenticated;
 create schema rehearsal_admin;revoke all on schema rehearsal_admin from public;
 create table rehearsal_admin.migrations(name text primary key,sha256 text not null);
 create table rehearsal_admin.sentinel(value text primary key);insert into rehearsal_admin.sentinel values('synthetic-pre-adaptive-preserved');
 insert into auth.users(id) values('00000000-0000-4000-8000-000000000401');
 insert into public.profiles values('00000000-0000-4000-8000-000000000401','synthetic-existing-subscription');
 insert into public.attempts(user_id,question_id,question_type,title,domain,chapter,correct,score,created_at) values
 ('00000000-0000-4000-8000-000000000401','m032','mcq','Synthetic prior miss','5','5',false,null,'2026-10-01T00:00:00Z'),
 ('00000000-0000-4000-8000-000000000401','m088','mcq','Synthetic prior success','5','5',true,null,'2026-10-01T00:01:00Z'),
 ('00000000-0000-4000-8000-000000000401','p211','pbq','Synthetic coarse partial','3','3',false,0.5,'2026-10-01T00:02:00Z');
 `);
 // Real defaults observed read-only on target: exposed-schema client grants.
 await sql.unsafe('alter default privileges for role postgres in schema public grant all on tables to anon,authenticated,service_role; alter default privileges for role postgres in schema public grant all on sequences to anon,authenticated,service_role; alter default privileges for role postgres in schema public grant execute on functions to anon,authenticated,service_role;');
 return sql;
}
export async function deploy(sql,chain=migrations){
 const legacyBefore=JSON.stringify(await sql`select to_jsonb(a) as row from public.attempts a order by id`);
 const timings=[];await sql`set lock_timeout='1s'`;await sql`set statement_timeout='10s'`;
 for(const m of chain){const [old]=await sql`select sha256 from rehearsal_admin.migrations where name=${m.name}`;
  if(old){assert.equal(old.sha256,m.sha256,'Migration checksum drift');timings.push({name:m.name,sha256:m.sha256,skipped:true});continue;}
  assert.ok(/commit;\s*$/i.test(m.sql));const text=m.sql.replace(/commit;\s*$/i,`insert into rehearsal_admin.migrations values('${m.name}','${m.sha256}');commit;`);
  const start=performance.now();await sql.unsafe(text);timings.push({name:m.name,sha256:m.sha256,elapsedMs:Math.round(performance.now()-start)});
 }
 assert.equal((await sql`select value from rehearsal_admin.sentinel`)[0].value,'synthetic-pre-adaptive-preserved');assert.equal(JSON.stringify(await sql`select to_jsonb(a) as row from public.attempts a order by id`),legacyBefore,'Legacy data unchanged');assert.equal((await sql`select stripe_subscription_id from public.profiles`)[0].stripe_subscription_id,'synthetic-existing-subscription');return timings;
}
const purposeUrls={};
export function reopenPurpose(purpose){
 const raw=connect(purposeUrls[purpose]);const db=(...args)=>db.begin(tx=>tx(...args));
 db.begin=fn=>raw.begin(async tx=>{await tx.unsafe(`set local role adaptive_${purpose}`);await tx`set local statement_timeout='10s'`;await tx`set local lock_timeout='1s'`;return fn(tx);});db.end=()=>raw.end({timeout:1});return db;
}
export async function purposeConnections(sql){
 const result={};
 for(const purpose of ['ingest','worker','erasure']){const name=`adaptive_${purpose}_login`,password=randomBytes(24).toString('hex');
  await sql.unsafe(`create role ${name} login password '${password}' nosuperuser nocreatedb nocreaterole noinherit nobypassrls;grant adaptive_${purpose} to ${name};`);
  purposeUrls[purpose]=`postgres://${name}:${password}@127.0.0.1:55442/${database}`;result[purpose]=reopenPurpose(purpose);
 }
 return result;
}
export async function fixture(sql,ingest){
 const catalogue=await seedTrustedLearningFixture(sql);
 return {catalogue,async owner(answers=10){const id=randomUUID();await sql`insert into auth.users(id) values(${id})`;const [r]=await sql`select adaptive_private.enroll_shadow(${id},clock_timestamp()+interval '1 day',gen_random_uuid()) enrollment`;
  const p={sessionId:randomUUID(),source:'practice',mode:'normal',seed:'load',requestedCount:1,requestedPbqCount:0,revisionIds:[catalogue.revisions[0].revisionId],...catalogue.versions};
  await storeTrustedSessionPlan(ingest,id,p);const s=await startAdaptiveSession(ingest,id,p),revision=catalogue.revisions[0],choice=revision.components.find(c=>c.id!==revision.gradingKey.expected[0].valueId).id;
  const start=performance.now();for(let i=0;i<answers;i++)await ingestAdaptiveAnswer(ingest,id,{clientEventId:randomUUID(),sessionId:p.sessionId,itemPosition:1,revisionId:revision.revisionId,selectedComponents:[{componentId:choice,valueId:choice}],occurredAt:new Date(Date.parse(s.startedAt)+100+i).toISOString()});
  let closed;do{closed=(await sql`select clock_timestamp() as now`)[0].now;if(closed.getTime()<Date.parse(s.startedAt)+answers+101)await new Promise(r=>setTimeout(r,25));}while(closed.getTime()<Date.parse(s.startedAt)+answers+101);
  await recordAdaptiveSessionEvent(ingest,id,{clientEventId:randomUUID(),sessionId:p.sessionId,status:'completed',occurredAt:closed.toISOString()});
  return {id,enrollment:r.enrollment,ingestMs:Math.round(performance.now()-start)};
 }};
}
export async function drainOwner(worker,owner){const queue=createDurableQueue(worker);let claims=0;const start=performance.now();
 for(;claims<6;){const job=await queue.claim(owner);if(!job){const [pending]=await worker`select count(*)::int n from adaptive_private.projection_jobs where owner_id=${owner} and status in ('queued','retry','leased')`;if(!pending.n)break;if(performance.now()-start>60000)throw new Error('Drain recovery deadline');await new Promise(r=>setTimeout(r,25));continue;}claims++;const result=await rebuildTrustedLearningOwner(worker,owner,{job});if(result.status==='ready')await queue.complete(job);else assert.equal(result.status,'rescheduled');}
 assert.ok(claims<6);return {claims,elapsedMs:Math.round(performance.now()-start)};
}
export async function inventory(sql){return {
 environment:await sql`select version() as build,current_setting('server_version') as server_version`,
 extensions:await sql`select extname,extversion from pg_extension order by extname`,
 tables:await sql`select n.nspname as schema,c.relname,c.relrowsecurity,c.relacl::text from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind='r' and (n.nspname='adaptive_private' or c.relname like 'adaptive_%') order by 1,2`,
 functions:await sql`select p.proname,pg_get_function_identity_arguments(p.oid) args,p.prosecdef,pg_get_userbyid(p.proowner) owner,p.proconfig,p.proacl::text,exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE') public_execute from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='adaptive_private' order by 1,2`,
 columns:await sql`select table_schema,table_name,column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='adaptive_private' or (table_schema='public' and table_name like 'adaptive_%') order by 1,2,ordinal_position`,
 indexes:await sql`select schemaname,tablename,indexname,indexdef from pg_indexes where schemaname='adaptive_private' or tablename like 'adaptive_%' order by 1,2,3`,
 constraints:await sql`select n.nspname as schema,c.relname,k.conname,pg_get_constraintdef(k.oid) definition from pg_constraint k join pg_class c on c.oid=k.conrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='adaptive_private' or c.relname like 'adaptive_%' order by 1,2,3`,
 triggers:await sql`select n.nspname as schema,c.relname,t.tgname,pg_get_triggerdef(t.oid) definition from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where not t.tgisinternal and (n.nspname='adaptive_private' or c.relname like 'adaptive_%') order by 1,2,3`,
 functionDigests:(await sql`select p.proname,pg_get_function_identity_arguments(p.oid) args,pg_get_functiondef(p.oid) definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='adaptive_private' order by 1,2`).map(({definition,...row})=>({...row,sha256:hash(definition)})),
 policies:await sql`select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname='adaptive_private' or tablename like 'adaptive_%' order by 1,2,3`,
 roles:await sql`select rolname,rolsuper,rolbypassrls,rolcanlogin,rolinherit,rolcreatedb,rolcreaterole from pg_roles where rolname like 'adaptive_%' order by rolname`,
 memberships:await sql`select member.rolname as member,role.rolname as role,m.inherit_option,m.set_option from pg_auth_members m join pg_roles member on member.oid=m.member join pg_roles role on role.oid=m.roleid where member.rolname like 'adaptive_%' order by 1,2`,
 };}
export function saveEvidence(name,value){writeFileSync(`docs/evidence/phase-2b4d/${name}.json`,JSON.stringify(value,null,2)+'\n');}
export async function rotatePurpose(sql,purpose){
 const oldUrl=purposeUrls[purpose],name=`adaptive_${purpose}_login`,password=randomBytes(24).toString('hex');
 await sql.unsafe(`alter role ${name} password '${password}'`);
 await sql`select pg_terminate_backend(pid) from pg_stat_activity where usename=${name}`;
 const old=connect(oldUrl);let refused=false;try{await old`select 1`;}catch{refused=true;}finally{await old.end({timeout:1});}
 purposeUrls[purpose]=`postgres://${name}:${password}@127.0.0.1:55442/${database}`;
 const current=connect(purposeUrls[purpose]);const [identity]=await current`select current_user as name`;await current.end();
 return {oldRefused:refused,newAccepted:identity.name===name};
}
