import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { effectiveCatalogue } from '../server/mcq-engine/catalogue.mjs';
import { diagnosticPool, diagnosticSet, diagnosticQuestion } from '../server/mcq-engine/diagnostic.mjs';
import { createMcqHandler } from '../server/mcq-engine/http.mjs';
import { generateSet } from '../server/mcq-engine/engine.mjs';
import { diagnosticRows } from '../src/lib/guestDiagnosticProgress.js';
import { personalisedFlashcards } from '../src/lib/flashcardConcepts.js';
const bank=effectiveCatalogue();
test('30 concise Core MCQs, six concepts per domain; each shuffled set has two per domain',()=>{
 const pool=diagnosticPool(bank);assert.equal(pool.length,30);assert.equal(new Set(pool.map(q=>q.id)).size,30);
 for(const ch of [1,2,3,4,5])assert.equal(new Set(pool.filter(q=>+q.chapter===ch).map(q=>q.concept_tag)).size,6);
 for(let i=0;i<40;i++){
  const set=diagnosticSet(bank);assert.equal(set.length,10);
  for(const ch of [1,2,3,4,5])assert.equal(set.filter(q=>+q.chapter===ch).length,2);
  for(const q of set){assert.equal(q.difficulty,'core');assert(q.prompt.length<=240);assert(q.options.every(o=>o.text.length<=140));assert(q.explanation);}
 }
 const q=diagnosticQuestion(diagnosticSet(bank)[0]);assert(!JSON.stringify(q).includes('is_correct'));assert(!Object.hasOwn(q,'feedback'));assert(q.explanation);assert(Number.isInteger(q.correct));
 assert.equal(diagnosticPool([]).length,30);
 assert(pool.every(q=>q.diagnostic_only===true&&!bank.some(real=>real.id===q.id)));
 const known=new Set(JSON.parse(readFileSync('src/data/mcqConceptTagVocabulary.json','utf8')));
 assert(pool.every(q=>known.has(q.concept_tag)&&bank.some(real=>real.concept_tag===q.concept_tag)));
 assert(pool.every(q=>q.options.length===3&&q.options.filter(o=>o.is_correct).length===1));
});
test('legacy browser session ownership, atomic server grading, idempotent import, mastery, retests and one-miss flashcards',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);
 create table public.attempts(id uuid primary key,user_id uuid references auth.users(id),question_id text,question_type text,title text,domain text,chapter text,correct boolean,created_at timestamptz default now());grant all on public.attempts to service_role;`);
 for(const file of ['20261019163949_mcq_three_deck_engine','20261021163006_mcq_result_concept_streaks','20261022030000_mcq_question_pacing','20261022060000_mcq_exam_readiness','20261024012841_guest_diagnostic_handoff','20261026053909_beginner_diagnostic_skips'])await db.exec(readFileSync(`supabase/migrations/${file}.sql`,'utf8'));
 const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0];
 const u=randomUUID(),other=randomUUID(),id=randomUUID(),key='guest:verified-browser';
 await db.query('insert into auth.users values($1),($2)',[u,other]);
 const set=[1,2,3,4,5].flatMap(ch=>bank.filter(q=>+q.chapter===ch&&q.difficulty==='core').slice(0,2)),payload=JSON.stringify(set),answers=set.map(q=>({question_id:q.id,selected_option_id:q.options.find(o=>!o.is_correct).id}));
 const create=(session=id,owner=key)=>scalar('select public.guest_diagnostic_create($1,$2,$3)',[owner,session,payload]);
 await create();assert.deepEqual((await create()).questions,set);
 await assert.rejects(create(id,'guest:other'),/Invalid|unavailable/i);
 const claim=(actor=u,owner=key,a=answers)=>scalar('select public.guest_diagnostic_import($1,$2,$3,$4)',[actor,owner,id,JSON.stringify(a)]);
 await assert.rejects(claim(u,'guest:other'),/unavailable/i);
 const invalid=answers.map((a,i)=>i===9?{...a,selected_option_id:randomUUID()}:a);
 await assert.rejects(claim(u,key,invalid),/Invalid option/);
 assert.equal(await scalar('select count(*)::int from mcq_engine.history'),0);
 await assert.rejects(claim(u,key,answers.slice(1)),/Complete all ten/);
 const result=await claim();assert.equal(result.attempts.length,10);assert(result.attempts.every(r=>r.correct===false));
 assert.deepEqual(await claim(),result);
 assert.equal(await scalar('select count(*)::int from mcq_engine.history'),10);assert.equal(await scalar('select count(*)::int from public.attempts'),10);
 await assert.rejects(claim(other),/claimed/);
 const state=await scalar('select public.mcq_engine_state($1)',[u]);assert.equal(state.failed.length,10);assert(state.mastery.every(row=>row.score===15));assert(state.failed.every(row=>row.cooldown_counter>0));
 const focus=await scalar('select public.guest_diagnostic_focus($1)',[u]);assert.equal(focus.length,10);
 const cards=focus.map((tag,i)=>({id:i,concept_tags:[tag]}));assert.equal(personalisedFlashcards({...state,diagnostic_weak_tags:focus},cards).length,10);
 const q=set[0];await scalar('select public.mcq_engine_answer_sourced($1,$2,null,$3,$4,$5,null,$6)',[u,randomUUID(),q.id,q.options.find(o=>o.is_correct).id,JSON.stringify(q),'mcq-set']);
 assert(!(await scalar('select public.guest_diagnostic_focus($1)',[u])).includes(q.concept_tag));
 // Snapshot edits after generation cannot rewrite the stored grade.
 assert.equal((await claim()).attempts[0].correct,false);
 const next=randomUUID();await create(next);assert.equal((await scalar('select public.guest_diagnostic_import($1,$2,$3,$4)',[u,key,next,JSON.stringify(answers)])).alreadyImported,true);
 for(let i=0;i<8;i++)await create(randomUUID());await assert.rejects(create(randomUUID()),/wait/i);
 for(const role of ['anon','authenticated']){await db.exec(`set role ${role}`);await assert.rejects(create(randomUUID()),/permission denied/);await assert.rejects(claim(),/permission denied/);await db.exec('reset role');}
 await db.query("update mcq_engine.guest_diagnostics set created_at=now()-interval '8 days' where id=$1",[id]);await assert.rejects(claim(),/expired/);
 }finally{await db.close();}
});
test('guest API creates only bounded snapshots; import requires auth and valid option IDs',async()=>{
 process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-only';
 const {guestOwner}=await import('../server/mcq-engine/access.mjs');let cookie;
 guestOwner({headers:{},query:{}},{setHeader:(k,v)=>cookie=v});cookie=cookie.split(';')[0];
 const names=[];let actor=randomUUID();const client={auth:{getUser:async()=>({data:{user:{id:actor}}})},rpc:async(name,args)=>{names.push(name);return {data:name==='guest_diagnostic_create'?{questions:args.p_questions}:{attempts:[]}};}};
 const handler=createMcqHandler({admin:()=>client,enabled:()=>true,catalogue:async()=>bank});
 const call=async(operation,body,auth=false)=>{let output;const res={setHeader(){},end:r=>output=JSON.parse(r)};await handler({method:'POST',headers:{'content-type':'application/json',cookie,...(auth?{authorization:'Bearer fixture'}:{})},query:{operation},body},res);return {status:res.statusCode,output};};
 assert.equal((await call('generate',{mode:'diagnostic',set_size:30,request_id:randomUUID()})).status,400);
 const generated=await call('generate',{mode:'diagnostic',set_size:10,request_id:randomUUID()});assert.equal(generated.status,200);assert.equal(generated.output.questions.length,10);assert.deepEqual(names,['guest_diagnostic_create']);
 const body={session_id:generated.output.session_id,answers:generated.output.questions.map(q=>({question_id:q.id,selected_option_id:q.options[0].id}))};
 assert.equal((await call('diagnostic-import',body)).status,401);
 assert.equal((await call('diagnostic-import',{...body,answers:[]},true)).status,400);
 assert.equal((await call('diagnostic-import',body,true)).status,200);assert.equal(names.at(-1),'guest_diagnostic_import');
 const skippedBody={...body,answers:body.answers.map(a=>({...a,selected_option_id:null,skipped:true}))};
 assert.equal((await call('diagnostic-import',skippedBody,true)).status,200);
 assert.equal((await call('diagnostic-import',{...skippedBody,answers:skippedBody.answers.map((a,i)=>i?a:{...a,selected_option_id:body.answers[0].selected_option_id})},true)).status,400);
 assert.equal((await call('diagnostic-import',{...skippedBody,answers:skippedBody.answers.map((a,i)=>i?a:{...a,skipped:'true'})},true)).status,400);
});

test('skip serialization never invents a wrong answer or submits unchecked questions',()=>{
 const questions=diagnosticSet();
 const draft={questions,request_id:randomUUID(),startedAt:Date.now(),checked:{0:true,1:true},skipped:{0:true},answers:{0:null,1:questions[1].correct}};
 const rows=diagnosticRows(draft);
 assert.equal(rows.length,2);assert.equal(rows[0].skipped,true);assert.equal(rows[0].selectedOptionId,null);assert.equal(rows[0].correct,null);
 assert.equal(rows[1].correct,true);assert.equal(rows[1].selectedOptionId,questions[1].options[questions[1].correct].id);
 assert(rows.every(row=>row.diagnosticOnly));assert.deepEqual(diagnosticRows(null),[]);
});

test('beginner preview skips persist as learning priorities, not grades; isolation, rollback and real MCQ remediation',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);
 create table public.attempts(id uuid primary key,user_id uuid references auth.users(id),question_id text,question_type text,title text,domain text,chapter text,correct boolean,created_at timestamptz default now());grant all on public.attempts to service_role;`);
 for(const file of ['20261019163949_mcq_three_deck_engine','20261021163006_mcq_result_concept_streaks','20261022030000_mcq_question_pacing','20261022060000_mcq_exam_readiness','20261024012841_guest_diagnostic_handoff','20261026053909_beginner_diagnostic_skips'])await db.exec(readFileSync(`supabase/migrations/${file}.sql`,'utf8'));
 const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0];
 const u=randomUUID(),other=randomUUID(),mixedUser=randomUUID(),id=randomUUID(),key='guest:beginner';
 await db.query('insert into auth.users values($1),($2),($3)',[u,other,mixedUser]);
 const set=diagnosticSet();const skipped=set.map(q=>({question_id:q.id,skipped:true,selected_option_id:null}));
 await scalar('select public.guest_diagnostic_create($1,$2,$3)',[key,id,JSON.stringify(set)]);
 const claim=(actor=u,owner=key,answers=skipped,session=id)=>scalar('select public.guest_diagnostic_import($1,$2,$3,$4)',[actor,owner,session,JSON.stringify(answers)]);
 await assert.rejects(claim(u,'guest:foreign'),/unavailable/i);
 await assert.rejects(claim(u,key,skipped.slice(1)),/ten/i);
 await assert.rejects(claim(u,key,skipped.map((a,i)=>i? a:{...a,selected_option_id:set[0].options[0].id})),/Skipped/);
 await assert.rejects(claim(u,key,skipped.map((a,i)=>i? a:{...a,skipped:false})),/Invalid option/);
 await assert.rejects(claim(u,key,skipped.map((a,i)=>i? a:{...a,question_id:'foreign'})),/Invalid answer/);
 await assert.rejects(claim(u,key,skipped.map((a,i)=>i? a:{...a,skipped:'true'})),/Invalid answer/);
 assert.equal(await scalar('select count(*)::int from mcq_engine.owners'),0);
 assert.equal(await scalar('select count(*)::int from mcq_engine.guest_diagnostics where imported_user is not null'),0);
 const result=await claim();assert.equal(result.preview,true);assert.deepEqual(result.attempts,[]);assert.deepEqual(await claim(),result);
 await assert.rejects(claim(other),/claimed/);await assert.rejects(claim(u,key,skipped.map((a,i)=>i?a:{...a,skipped:false,selected_option_id:set[0].options[0].id})),/claimed/);
 const state=await scalar('select public.mcq_engine_state($1)',[u]);assert.equal(state.version,1);assert.equal(state.diagnostic_weak_tags.length,10);
 assert.deepEqual(state.mastery,[]);assert.deepEqual(state.failed,[]);assert.deepEqual(state.history,[]);
 assert.deepEqual((await scalar('select public.mcq_engine_readiness($1)',[u])).concepts,[]);
 assert.equal(await scalar('select count(*)::int from public.attempts'),0);
 assert.equal(await scalar('select count(*)::int from mcq_engine.history'),0);
 assert.deepEqual(await scalar('select public.guest_diagnostic_focus($1)',[other]),[]);
 assert.equal(personalisedFlashcards(state,set.map(q=>({concept_tags:[q.concept_tag]}))).length,10);
 const planned=generateSet(bank,state,30);assert(planned.some(q=>q.deck===2&&state.diagnostic_weak_tags.includes(q.concept_tag)));
 assert(planned.every(q=>!q.diagnostic_only&&!q.id.startsWith('diag-')));
 // Real correct evidence clears a learning priority; the preview itself never grants mastery.
 const real=bank.find(q=>q.concept_tag===set[0].concept_tag);
 await scalar('select public.mcq_engine_answer_sourced($1,$2,null,$3,$4,$5,null,$6)',[u,randomUUID(),real.id,real.options.find(o=>o.is_correct).id,JSON.stringify(real),'mcq-set']);
 assert(!(await scalar('select public.guest_diagnostic_focus($1)',[u])).includes(real.concept_tag));
 const mixedId=randomUUID(),mixed=set.map((q,i)=>i===0?{question_id:q.id,skipped:true,selected_option_id:null}:{question_id:q.id,selected_option_id:q.options.find(o=>o.is_correct===(i!==1)).id});
 await scalar('select public.guest_diagnostic_create($1,$2,$3)',[key,mixedId,JSON.stringify(set)]);
 const mixedResult=await claim(mixedUser,key,mixed,mixedId);assert.deepEqual(mixedResult.attempts,[]);
 assert.equal((await scalar('select public.guest_diagnostic_focus($1)',[mixedUser])).length,2);
 assert.deepEqual((await scalar('select public.mcq_engine_state($1)',[mixedUser])).mastery,[]);
 for(const role of ['anon','authenticated']){await db.exec(`set role ${role}`);await assert.rejects(claim(),/permission denied/);await assert.rejects(scalar('select public.guest_diagnostic_focus($1)',[u]),/permission denied/);await db.exec('reset role');}
 }finally{await db.close();}
});
