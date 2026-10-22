// Run against disposable PostgreSQL in WASM; never connects to a live database.
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { randomUUID } from 'node:crypto';
import { createMcqHandler } from '../server/mcq-engine/http.mjs';
import assert from 'node:assert/strict';
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
  create schema auth; create table auth.users(id uuid primary key);
  insert into auth.users values('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');`);
await db.exec(readFileSync('supabase/migrations/20261019163949_mcq_three_deck_engine.sql', 'utf8'));
await db.exec(readFileSync('supabase/migrations/20261021163006_mcq_result_concept_streaks.sql', 'utf8'));
await db.exec(readFileSync('supabase/migrations/20261022030000_mcq_question_pacing.sql','utf8'));
await db.exec(readFileSync('supabase/migrations/20261022060000_mcq_exam_readiness.sql','utf8'));
await db.exec(readFileSync('supabase/migrations/20261022090000_mcq_core_recovery.sql','utf8'));
await db.exec('create table public.attempts(user_id uuid,question_type text,correct boolean,created_at timestamptz);grant select on public.attempts to service_role;');
await db.exec(readFileSync('supabase/migrations/20261022110000_dashboard_practice_metrics.sql','utf8'));
const user = '00000000-0000-4000-8000-000000000001', other = '00000000-0000-4000-8000-000000000002';
const sid = '00000000-0000-4000-8000-000000000010', good = '00000000-0000-4000-8000-000000000020', bad = '00000000-0000-4000-8000-000000000021';
const questions = Array.from({ length: 40 }, (_, i) => ({ id: `m${i}`, format: 'mcq', concept_tag: 'risk.bia-rto-rpo', options: [{ id: good, text: 'yes', is_correct: true }, { id: bad, text: 'no', is_correct: false }], explanation: 'Why' }));
const scalar = async (sql, params = []) => Object.values((await db.query(sql, params)).rows[0])[0];
const state = id => scalar('select public.mcq_engine_state($1)', [id]);
const answer = (i, option, event = i + 100) => scalar('select public.mcq_engine_answer($1,$2,$3,$4,$5,$6)', [user, `00000000-0000-4000-8000-${String(event).padStart(12, '0')}`, null, `m${i}`, option, JSON.stringify(questions[i])]);
assert.equal(await scalar('select public.mcq_engine_create_session($1,$2,0,$3)', [user, sid, JSON.stringify(questions.slice(0, 10))]), true);
const first = await answer(0, bad); assert.equal(first.concept_score, 15);
assert.equal((await state(user)).failed[0].cooldown_counter, 30);
assert.equal((await state(user)).concept_streaks.find(row=>row.concept_tag==='risk.bia-rto-rpo').wrong_streak,1);
assert.deepEqual(await answer(0, bad), first); assert.equal((await state(user)).version, 1);
await assert.rejects(answer(0, good), /already submitted/i);
for (let i = 1; i <= 29; i++) await answer(i, good);
assert.equal((await state(user)).failed[0].cooldown_counter, 1);
await answer(30, good); assert.equal((await state(user)).failed[0].cooldown_counter, 0);
await answer(0, good, 999); assert.equal((await state(user)).failed.length, 0);
assert.equal((await state(user)).mastery[0].score, 100);
assert.equal((await state(user)).concept_streaks[0].wrong_streak,0);
assert.equal((await answer(0, bad, 1001)).concept_score, 65);
assert.equal((await answer(0, bad, 1002)).concept_score, 30);
assert.equal((await state(user)).concept_streaks[0].wrong_streak,2);
assert.deepEqual((await state(other)).concept_streaks,[]);
assert.equal((await answer(0, bad, 1003)).concept_score, 0);
assert.equal((await answer(0, bad, 1004)).concept_score, 0);
assert.equal((await state(user)).failed[0].cooldown_counter, 30);
assert.equal((await state(other)).version, 0);
assert.equal(await scalar('select public.mcq_engine_session($1,$2)', [other, sid]), null);
assert.equal(await scalar('select public.mcq_engine_create_session($1,$2,0,$3)', [user, '00000000-0000-4000-8000-000000000011', JSON.stringify(questions.slice(0, 10))]), false);
const before = await state(user);
await assert.rejects(scalar('select public.mcq_engine_answer($1,$2,$3,$4,$5,null)', [user, '00000000-0000-4000-8000-000000009999', sid, 'm0', '00000000-0000-4000-8000-000000000099']), /Unknown option/i);
assert.deepEqual(await state(user), before);
// Force a failure after score/cooldown updates; the RPC must roll everything back.
await assert.rejects(scalar('select public.mcq_engine_answer($1,$2,null,$3,$4,$5)',
  [other,'00000000-0000-4000-8000-000000000100','m0',bad,JSON.stringify(questions[0])]), /duplicate key/i);
assert.deepEqual((await state(other)).mastery, []);
assert.deepEqual((await state(other)).failed, []);
assert.equal((await state(other)).version, 0);
// Immutable session snapshot still grades the old question after bank edits.
await db.query("update mcq_engine.questions set payload='{}' where id='m1'");
assert.equal((await scalar('select public.mcq_engine_answer($1,$2,$3,$4,$5,null)', [user, '00000000-0000-4000-8000-000000008888', sid, 'm1', good])).is_correct, true);
for (const role of ['anon', 'authenticated']) {
  await db.exec(`set role ${role}`);
  await assert.rejects(db.query('select public.mcq_engine_state($1)', [user]), /permission denied/i);
  await assert.rejects(db.query('select * from mcq_engine.questions'), /permission denied/i);
  await db.exec('reset role');
}
// End-to-end API -> selector -> actual PostgreSQL functions -> sanitized response.
await db.exec('set role service_role');
let actor=user;
const service={auth:{getUser:async()=>({data:{user:{id:actor}}})},rpc:async(name,args)=>{
  const params=Object.values(args);
  try{return {data:await scalar(`select public.${name}(${params.map((_,i)=>`$${i+1}`).join(',')})`,params.map(v=>v&&typeof v==='object'?JSON.stringify(v):v))};}
  catch(error){return {error};}
}};
const handler=createMcqHandler({enabled:()=>true,admin:()=>service,catalogue:async()=>{
  const {effectiveCatalogue}=await import('../server/mcq-engine/catalogue.mjs');return effectiveCatalogue();
}});
const call=async(operation,body)=>{
  let output;const res={setHeader(){},end(value){output=JSON.parse(value);}};
  await handler({method:'POST',headers:{authorization:'Bearer local-test','content-type':'application/json'},query:{operation},body},res);
  return {status:res.statusCode,output};
};
const plan=await call('generate',{set_size:10});assert.equal(plan.status,200);assert.equal(plan.output.questions.length,10);
assert(!JSON.stringify(plan.output).includes('is_correct'));
const owned=await scalar('select public.mcq_engine_session($1,$2)',[user,plan.output.session_id]);
const selected=owned.questions[0];
const body={session_id:plan.output.session_id,event_id:randomUUID(),question_id:selected.id,selected_option_id:selected.options.find(o=>!o.is_correct).id};
const graded=await call('answer',body);assert.equal(graded.status,200);assert.equal(graded.output.is_correct,false);
assert.deepEqual((await call('answer',body)).output,graded.output);
assert.equal((await state(user)).failed.find(row=>row.question_id===selected.id).cooldown_counter,30);
actor=other;assert.equal((await call('resume',{session_id:plan.output.session_id})).status,404);
await db.exec('reset role');
await answer(0,good,2001);
assert.equal((await state(user)).concept_streaks.find(row=>row.concept_tag==='risk.bia-rto-rpo').wrong_streak,0);
await answer(0,bad,2002);
assert.equal((await state(user)).concept_streaks.find(row=>row.concept_tag==='risk.bia-rto-rpo').wrong_streak,1);
await answer(0,bad,2003);
assert.equal((await state(user)).concept_streaks.find(row=>row.concept_tag==='risk.bia-rto-rpo').wrong_streak,2);
// A correct answer on another tag must not reset this concept's streak.
const qOther={...questions[1],concept_tag:'ops.logs-syslog'};
await scalar('select public.mcq_engine_answer($1,$2,null,$3,$4,$5)',[other,randomUUID(),'m1',bad,JSON.stringify(qOther)]);
await scalar('select public.mcq_engine_answer($1,$2,null,$3,$4,$5)',[other,randomUUID(),'m2',good,JSON.stringify(questions[2])]);
const crossSession='00000000-0000-4000-8000-000000000033';
assert.equal(await scalar('select public.mcq_engine_create_session($1,$2,$3,$4)',[other,crossSession,(await state(other)).version,JSON.stringify([{...questions[0],concept_tag:'ops.logs-syslog'},...questions.slice(1,10)])]),true);
const event=randomUUID();
await scalar('select public.mcq_engine_answer($1,$2,$3,$4,$5,null)',[other,event,crossSession,'m0',bad]);
assert.equal((await state(other)).concept_streaks.find(row=>row.concept_tag==='ops.logs-syslog').wrong_streak,2);
const beforeReplay=await state(other);
await scalar('select public.mcq_engine_answer($1,$2,$3,$4,$5,null)',[other,event,crossSession,'m0',bad]);
assert.deepEqual(await state(other),beforeReplay);

// Pacing is descriptive, atomic and immutable on retries; scoring is identical.
const paceEvent=randomUUID();
const pacedArgs=[user,paceEvent,null,'m0',good,JSON.stringify(questions[0]),72000];
const scoreBefore=(await state(user)).mastery.find(r=>r.concept_tag==='risk.bia-rto-rpo').score;
const paced=await scalar('select public.mcq_engine_answer_paced($1,$2,$3,$4,$5,$6,$7)',pacedArgs);
assert.equal(paced.elapsed_ms,72000);assert.equal(paced.concept_score,Math.min(100,scoreBefore+20));
const paceState=await state(user);
assert.deepEqual(await scalar('select public.mcq_engine_answer_paced($1,$2,$3,$4,$5,$6,$7)',[...pacedArgs.slice(0,6),1000]),paced);
assert.deepEqual(await state(user),paceState);
assert.equal((await scalar('select public.mcq_engine_answer($1,$2,$3,$4,$5,$6)',pacedArgs.slice(0,6))).elapsed_ms,72000);
const historical=await scalar('select public.mcq_engine_answer_paced($1,$2,$3,$4,$5,$6,$7)',[other,event,crossSession,'m0',bad,null,1000]);
assert.equal(historical.elapsed_ms,undefined); // No invented backfill on legacy events.
await assert.rejects(scalar('select public.mcq_engine_answer_paced($1,$2,$3,$4,$5,$6,$7)',[user,randomUUID(),null,'m0',good,JSON.stringify(questions[0]),-1]),/Invalid question pacing/);
assert.deepEqual(await state(user),paceState);
for(const role of ['anon','authenticated']){
  await db.exec(`set role ${role}`);
  await assert.rejects(scalar('select public.mcq_engine_answer_paced($1,$2,$3,$4,$5,$6,$7)',pacedArgs),/permission denied/);
  await db.exec('reset role');
}
const pacedSessionEvent=randomUUID();
const pacedSession=await scalar('select public.mcq_engine_answer_paced($1,$2,$3,$4,$5,$6,$7)',[user,pacedSessionEvent,sid,'m9',bad,null,32500]);
assert.equal(pacedSession.elapsed_ms,32500);
const resumedPacing=await scalar('select public.mcq_engine_session($1,$2)',[user,sid]);
assert.equal(resumedPacing.answers.find(row=>row.question_id==='m9').response.elapsed_ms,32500);
const pacingReplayState=await state(user);
assert.equal((await scalar('select public.mcq_engine_answer_paced($1,$2,$3,$4,$5,$6,$7)',[user,randomUUID(),sid,'m9',bad,null,1000])).elapsed_ms,32500);
assert.deepEqual(await state(user),pacingReplayState);
console.log('PASS pacing: exact elapsed storage, unchanged scores, replay immutability, legacy unknowns, invalid rollback, service-only grants.');

// Readiness has a separate, source-scoped mastery denominator and no legacy guesses.
const readinessUser='00000000-0000-4000-8000-000000000003';
await db.query('insert into auth.users values($1)',[readinessUser]);
const readiness=()=>scalar('select public.mcq_engine_readiness($1)',[readinessUser]);
assert.deepEqual((await readiness()).concepts,[]);
const sourced=async(tag,correct,source,chapter='1',eventId=randomUUID())=>{
  const q={...questions[0],concept_tag:tag,chapter};
  return scalar('select public.mcq_engine_answer_sourced($1,$2,null,$3,$4,$5,$6,$7)',[readinessUser,eventId,'m0',correct?good:bad,JSON.stringify(q),1234,source]);
};
await sourced('a',true,'mcq-set');await sourced('a',true,'exam');
await sourced('b',false,'exam','2');
await sourced('a',false,'daily-challenge');await sourced('b',true,'diagnostic');
const report=await readiness();
assert.deepEqual(report.concepts,[{tag:'a',score:90,chapter:'1'},{tag:'b',score:15,chapter:'2'}]);
assert.deepEqual(report.chapters,{'1':{total:2,correct:2},'2':{total:1,correct:0}});assert.equal(report.total,3);
assert.notEqual((await state(readinessUser)).mastery.find(c=>c.concept_tag==='a').score,90);
const sourceEvent=randomUUID();const original=await sourced('b',true,'diagnostic','3',sourceEvent);
assert.deepEqual(await sourced('b',true,'mcq-set','1',sourceEvent),original);
assert.deepEqual((await readiness()).concepts,report.concepts); // Retry cannot reclassify a diagnostic.
assert.equal((await readiness()).activity.total,6);
await scalar('select public.mcq_engine_answer($1,$2,null,$3,$4,$5)',[readinessUser,randomUUID(),'m0',good,JSON.stringify({...questions[0],concept_tag:'legacy'})]);
assert.equal((await readiness()).unclassified,1);assert.equal((await readiness()).concepts.length,2);
const legacySession=randomUUID();
await scalar('select public.mcq_engine_create_session($1,$2,$3,$4)',[readinessUser,legacySession,(await state(readinessUser)).version,JSON.stringify(questions.slice(0,10).map(q=>({...q,concept_tag:'owned',chapter:'4'})))]);
await scalar('select public.mcq_engine_answer($1,$2,$3,$4,$5,null)',[readinessUser,randomUUID(),legacySession,'m0',good]);
assert.equal((await readiness()).concepts.find(c=>c.tag==='owned').score,70);
assert.deepEqual((await readiness()).chapters['4'],{total:1,correct:1});
// Service-only endpoints, owner derived from auth, both legacy and new RPC paths.
for(const role of ['anon','authenticated']){
  await db.exec(`set role ${role}`);
  await assert.rejects(readiness(),/permission denied/);
  await assert.rejects(sourced('a',true,'mcq-set'),/permission denied/);
  await db.exec('reset role');
}
await assert.rejects(sourced('a',true,'invented'),/Invalid activity source/);
assert.equal((await readiness()).total,4);
actor=readinessUser;
const apiReadiness=await call('readiness',{user_id:user});assert.equal(apiReadiness.status,200);assert.deepEqual(apiReadiness.output,await readiness());
actor=other;assert.notDeepEqual((await call('readiness',{user_id:readinessUser})).output,await readiness());
console.log('PASS readiness: scoped mastery replay, chapter evidence, legacy exclusion, owned legacy sets, immutable source, auth ownership and restricted grants.');

// A streak formed inside a pinned set changes only the next encounter with that tag.
const recoveryUser='00000000-0000-4000-8000-000000000004';
await db.query('insert into auth.users values($1)',[recoveryUser]);
actor=recoveryUser;
const recoveryQuestions=Array.from({length:10},(_,i)=>({...questions[i],id:`mrecovery${i}`,concept_tag:i<3?'recover':'other',chapter:'1',topic:'Recovery test',difficulty:'applied',practice_filters:{chapter:'1'}}));
const core={...recoveryQuestions[2],id:'mrecoverycore',difficulty:'core'};
const recoverySid=randomUUID();
await scalar('select public.mcq_engine_create_session($1,$2,0,$3)',[recoveryUser,recoverySid,JSON.stringify(recoveryQuestions)]);
const recoveryHandler=createMcqHandler({enabled:()=>true,admin:()=>service,catalogue:async()=>[...recoveryQuestions,core]});
const recoveryCall=async(question,index,sessionId=recoverySid)=>{
  let output;const res={setHeader(){},end(value){output=JSON.parse(value);}};
  const request={event_id:randomUUID(),session_id:sessionId,question_id:question.id,selected_option_id:index?good:bad,practice_source:'mcq-set'};
  await recoveryHandler({method:'POST',headers:{authorization:'Bearer test','content-type':'application/json'},query:{operation:'answer'},body:request},res);
  assert.equal(res.statusCode,200);return {output,request};
};
const firstMiss=await recoveryCall(recoveryQuestions[0],0);
assert.equal(firstMiss.output.session_questions[2].difficulty,'applied');
const secondMiss=await recoveryCall(recoveryQuestions[1],0);
assert.equal(secondMiss.output.session_questions[2].id,core.id);
assert.equal(secondMiss.output.session_questions[2].difficulty,'core');
assert.equal(secondMiss.output.session_questions.length,10);
assert(!JSON.stringify(secondMiss.output.session_questions).includes('is_correct'));
assert(!JSON.stringify(secondMiss.output.session_questions).includes('explanation'));
const recoveredPlan=await scalar('select public.mcq_engine_session($1,$2)',[recoveryUser,recoverySid]);
assert.deepEqual(recoveredPlan.questions.slice(0,2),recoveryQuestions.slice(0,2));
assert.equal(recoveredPlan.questions[2].id,core.id);
// A lost response returns the already-updated plan without grading twice.
let replayOutput;const replayRes={setHeader(){},end(value){replayOutput=JSON.parse(value);}};
const recoveryVersion=(await state(recoveryUser)).version;
await recoveryHandler({method:'POST',headers:{authorization:'Bearer test','content-type':'application/json'},query:{operation:'answer'},body:secondMiss.request},replayRes);
assert.deepEqual(replayOutput,secondMiss.output);assert.equal((await state(recoveryUser)).version,recoveryVersion);
await recoveryCall(core,1);
assert.equal((await state(recoveryUser)).concept_streaks.find(s=>s.concept_tag==='recover').wrong_streak,0);
const finalPlan=await scalar('select public.mcq_engine_session($1,$2)',[recoveryUser,recoverySid]);
const replace=(qs,i,q)=>qs.map((old,index)=>index===i?q:old);
await assert.rejects(scalar('select public.mcq_engine_recover_session($1,$2,$3,$4)',[recoveryUser,recoverySid,(await state(recoveryUser)).version,JSON.stringify(replace(finalPlan.questions,0,{...recoveryQuestions[0],prompt:'changed'}))]),/immutable/);
assert.equal(await scalar('select public.mcq_engine_recover_session($1,$2,$3,$4)',[other,recoverySid,(await state(other)).version,JSON.stringify(finalPlan.questions)]),false);
assert.equal(await scalar('select public.mcq_engine_recover_session($1,$2,-1,$3)',[recoveryUser,recoverySid,JSON.stringify(finalPlan.questions)]),false);
for(const role of ['anon','authenticated']){
  await db.exec(`set role ${role}`);
  await assert.rejects(scalar('select public.mcq_engine_recover_session($1,$2,0,$3)',[recoveryUser,recoverySid,JSON.stringify(finalPlan.questions)]),/permission denied/);
  await db.exec('reset role');
}
// Skipping around the set must recover the next forward encounter, not an earlier slot.
const jumpedSid=randomUUID();
const jumpedQuestions=recoveryQuestions.map((q,i)=>({...q,concept_tag:i<5?'recover':'other'}));
await scalar('select public.mcq_engine_create_session($1,$2,$3,$4)',[recoveryUser,jumpedSid,(await state(recoveryUser)).version,JSON.stringify(jumpedQuestions)]);
await recoveryCall(jumpedQuestions[1],0,jumpedSid);
const jumped=await recoveryCall(jumpedQuestions[3],0,jumpedSid);
assert.equal(jumped.output.session_questions[4].difficulty,'core');
assert.equal(jumped.output.session_questions[0].difficulty,'applied');
console.log('PASS Core recovery: live-session second miss, Core substitution, source snapshots, resumed plan, retry idempotence, correct reset, stale/foreign rejection and grants.');

// Overall metrics include all MCQ activities and legacy practice, without mirrored duplicates.
const countsBefore=(await readiness()).activity;
await db.query("insert into public.attempts values($1,'mcq',true,'2000-01-01'),($1,'pbq',true,'2000-01-01'),($1,'mcq',true,'2099-01-01')",[readinessUser]);
const totals=(await readiness()).activity;
assert.equal(totals.total,countsBefore.total+1);assert.equal(totals.correct,countsBefore.correct+1);
assert.equal((await readiness()).concepts.length,3); // Metrics do not alter readiness.
console.log('PASS dashboard metrics: all MCQ event sources, repeats, legacy cutover, no PBQs or mirrored double credit.');
await db.close();
console.log('PASS disposable PostgreSQL: migration, scores, 30-answer delay, idempotency, rollback, owner isolation, stale plan rejection, snapshot grading, RLS/grants.');
