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
await db.close();
console.log('PASS disposable PostgreSQL: migration, scores, 30-answer delay, idempotency, rollback, owner isolation, stale plan rejection, snapshot grading, RLS/grants.');
