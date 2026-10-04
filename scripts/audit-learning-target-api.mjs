import assert from 'node:assert/strict';
import {randomBytes,randomUUID,createHmac} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {connect,container,database,docker,saveEvidence} from './lib/operational-rehearsal.mjs';
const sql=connect(),password=randomBytes(24).toString('hex'),key=randomBytes(32).toString('hex'),name='secureplus-4d-rest';
const jwt=ownerId=>{const parts=[{alg:'HS256',typ:'JWT'},{role:'authenticated',sub:ownerId,exp:Math.floor(Date.now()/1000)+60}].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url'));return parts.join('.')+'.'+createHmac('sha256',key).update(parts.join('.')).digest('base64url');};
let assertions=0;
try{
 await sql.unsafe(`do $$ begin if not exists(select 1 from pg_roles where rolname='rehearsal_authenticator') then create role rehearsal_authenticator login noinherit;end if;end $$;alter role rehearsal_authenticator password '${password}';grant anon,authenticated to rehearsal_authenticator;create table if not exists public.rehearsal_api_control(value integer);truncate public.rehearsal_api_control;insert into public.rehearsal_api_control values(1);alter table public.rehearsal_api_control enable row level security;drop policy if exists control_read on public.rehearsal_api_control;create policy control_read on public.rehearsal_api_control for select to anon,authenticated using(true);grant select on public.rehearsal_api_control to anon,authenticated;`);
 const ip=docker(['inspect',container,'--format','{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}']).trim();assert.match(ip,/^172\.[0-9.]+$/);
 spawnSync('docker',['rm','-f',name],{stdio:'ignore'});
 const started=spawnSync('docker',['run','-d','--name',name,'-p','127.0.0.1:55443:3000','-e','PGRST_DB_URI','-e','PGRST_JWT_SECRET','-e','PGRST_DB_SCHEMAS=public','-e','PGRST_DB_ANON_ROLE=anon','public.ecr.aws/supabase/postgrest:v16.4'],{env:{...process.env,PGRST_DB_URI:`postgres://rehearsal_authenticator:${password}@${ip}:5432/${database}`,PGRST_JWT_SECRET:key},stdio:'ignore'});assert.equal(started.status,0);
 for(let i=0;i<80;i++){try{const r=await fetch('http://127.0.0.1:55443/rehearsal_api_control');if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const tables=await sql`select table_name from information_schema.tables where table_schema='public' and table_name like 'adaptive_%'`;
 const owners=await sql`select distinct owner_id from public.adaptive_sessions order by owner_id limit 2`;assert.equal(owners.length,2);
 for(const token of [null,jwt(owners[0].owner_id),jwt(owners[1].owner_id)]){
  const headers=token?{authorization:`Bearer ${token}`} : {};
  const control=await fetch('http://127.0.0.1:55443/rehearsal_api_control',{headers});assert.equal(control.status,200);assert.deepEqual(await control.json(),[{value:1}]);assertions++;
  for(const t of tables){const r=await fetch(`http://127.0.0.1:55443/${t.table_name}?select=*`,{headers});assert.ok([401,403,404].includes(r.status));assertions++;}
  for(const table of ['runtime_control','session_plans','intervention_proofs','projection_jobs']){const r=await fetch(`http://127.0.0.1:55443/${table}?select=*`,{headers:{...headers,'accept-profile':'adaptive_private'}});assert.equal(r.status,406);assertions++;}
 }
 const result={status:'PASS',assertions,postgres:'17.6',postgrest:'v16.4',roles:['anonymous','signed synthetic owner','signed synthetic foreign owner'],scope:'Working HTTP control; all public adaptive tables and selected private controls denied. Real Auth issuer coverage is supplied by the separate CLI stack suite.'};saveEvidence('target-api',result);console.log(JSON.stringify(result));
}catch{console.error(JSON.stringify({status:'FAIL',assertions}));process.exitCode=1;}
finally{spawnSync('docker',['rm','-f',name],{stdio:'ignore'});await sql.unsafe('drop table if exists public.rehearsal_api_control;drop role if exists rehearsal_authenticator;').catch(()=>{});await sql.end();}
