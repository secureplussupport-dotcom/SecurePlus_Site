import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createMcqHandler } from '../server/mcq-engine/http.mjs';
import { effectiveCatalogue, optionId } from '../server/mcq-engine/catalogue.mjs';
import { generateSet } from '../server/mcq-engine/engine.mjs';

const user = '00000000-0000-4000-8000-000000000001';
const id = '00000000-0000-4000-8000-000000000002';
const invoke = async (handler, operation, body = {}, token = 'verified') => {
  let output; const headers = {};
  const res = { setHeader: (k, v) => { headers[k] = v; }, end: data => { output = JSON.parse(data); } };
  await handler({ method: 'POST', query: { operation }, headers: { authorization: token ? `Bearer ${token}` : '', 'content-type': 'application/json' }, body }, res);
  return { status: res.statusCode, output, headers };
};
const state = { version: 0, mastery: [], failed: [], history: [] };
test('catalogue covers 395 MCQs and versioned manager edits preserve primary selection', () => {
  const bank = effectiveCatalogue(); assert.equal(bank.length, 395); assert(bank.every(q => q.format === 'mcq' && q.concept_tag));
  const q = bank.find(q => q.id === 'm032'); assert.equal(q.concept_tag, 'risk.bia-rto-rpo');
  const row = { question_id: 'm032', question_kind: 'mcq', status: 'active', action: 'upsert', updated_at: '2099-01-01', payload: { taggingVersion: 'gemini-mcq-tags-2026-10-20', conceptTagIds: ['iam.mfa'] } };
  assert.equal(effectiveCatalogue([row]).find(q => q.id === 'm032').concept_tag, 'iam.mfa');
  assert(!effectiveCatalogue([{ ...row, action: 'disable' }]).some(q => q.id === 'm032'));
});
test('disabled calls and malformed guest generation cannot reach storage', async () => {
  const admin = () => { throw new Error('Storage must not open'); };
  assert.equal((await invoke(createMcqHandler({ admin, enabled: () => false }), 'generate')).status, 503);
  assert.equal((await invoke(createMcqHandler({ admin, enabled: () => true }), 'generate', {}, '')).status, 400);
});
test('server-generated sets strip secrets and owner identity ignores submitted user_id', async () => {
  let persisted;
  const client = { auth: { getUser: async () => ({ data: { user: { id: user } } }) }, rpc: async (name, args) => {
    assert.equal(args.p_user_id, user);
    if (name === 'mcq_engine_state') return { data: state };
    if(name==='practice_access_status')return {data:{isPro:false,maxSetSize:30,remaining:50}};
    if (name === 'practice_create_set') { persisted = args; return { data: {created:true,questions:args.p_questions} }; }
    throw new Error(name);
  } };
  const handler = createMcqHandler({ enabled: () => true, admin: () => client, catalogue: async () => effectiveCatalogue() });
  const result = await invoke(handler, 'generate', { user_id: id, set_size: 30 });
  assert.equal(result.status, 200); assert.equal(result.output.questions.length, 30);
  assert.equal(persisted.p_questions.length, 30); assert(persisted.p_questions[0].options.some(o => o.is_correct));
  for (const q of result.output.questions) {
    assert.deepEqual(Object.keys(q.options[0]).sort(), ['id', 'text']);
    assert(!Object.hasOwn(q, 'explanation')); assert(!Object.hasOwn(q, 'correct'));
  }
  assert.equal(result.headers['cache-control'], 'no-store');
  assert.equal((await invoke(handler, 'generate', { set_size: 50 })).status, 400);
  assert.equal((await invoke(handler, 'answer', { question_id: 'p001', event_id: id, selected_option_id: id })).status, 400);
});
test('generation retries state races; errors fail closed rather than reverting to the old algorithm', async () => {
  let writes = 0;
  const client = { auth: { getUser: async () => ({ data: { user: { id: user } } }) }, rpc: async (name,args) => ({ data: name==='practice_access_status'?{isPro:false,maxSetSize:30,remaining:50}:name === 'mcq_engine_state' ? state : {created:++writes>1,questions:args.p_questions} }) };
  const result = await invoke(createMcqHandler({ enabled: () => true, admin: () => client, catalogue: async () => effectiveCatalogue() }), 'generate', { set_size: 10 });
  assert.equal(result.status, 200); assert.equal(writes, 2);
});
test('answer submission delegates grading to the transaction with a pinned session', async () => {
  let args;
  const client = { auth: { getUser: async () => ({ data: { user: { id: user } } }) }, rpc: async (name, payload) => {
    if(name==='mcq_engine_state')return {data:state};
    if(name==='practice_owned_set')return {data:{questions:[],mode:'smart',completed:false}};
    if(name==='mcq_engine_session')return {data:{questions:[],answers:[]}};
    assert.equal(name, 'mcq_engine_answer'); args = payload;
    return { data: { is_correct: true, correct_option_id: id, explanation: 'After answer only.' } };
  } };
  const result = await invoke(createMcqHandler({ enabled: () => true, admin: () => client }), 'answer', { event_id: id, session_id: id, question_id: 'm032', selected_option_id: id, correct: false });
  assert.equal(result.status, 200); assert.equal(result.output.is_correct, true);
  assert.equal(args.p_standalone, null); assert.equal(args.p_user_id, user); assert(!Object.hasOwn(args, 'correct'));
});
test('browser projection binds option UUIDs and standalone option IDs match server revisions', async () => {
  const source = readFileSync('src/lib/mcqEngineClient.js', 'utf8')
    .replace("import { getSupabaseAccessToken } from './supabaseClient.js';", "const getSupabaseAccessToken=async()=>null;")
    .replace("import.meta.env.VITE_MCQ_ENGINE_ENABLED === 'true'", 'true');
  const client = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const bank = effectiveCatalogue();
  const set = generateSet(bank, state, 10);
  for (const q of set) {
    const projected = client.practiceQuestion({ ...q, options: q.options.map(({ id, text }) => ({ id, text })) }, id);
    assert.deepEqual(projected.optionIds, q.options.map(o => o.id));
    assert(!Object.hasOwn(projected, 'correct'));
  }
  const raw = { id: 'mtest', q: 'Q', opts: ['A', 'B'], correct: 1 };
  assert.equal(await client.standaloneOptionId(raw, 1), optionId(raw, 1));
  const shuffled = { ...raw, opts: ['B', 'A'], correct: 0, originalOptions: raw.opts, originalCorrect: 1, originalOptionIndexes: [1, 0] };
  assert.equal(await client.standaloneOptionId(shuffled, 0), optionId(raw, 1));
});


test('optional pacing is bounded, owner-bound and routed to atomic recording; invalid input never reaches RPC',async()=>{
  const calls=[];
  const client={auth:{getUser:async()=>({data:{user:{id:user}}})},rpc:async(name,args)=>{calls.push({name,args});return {data:{is_correct:true,elapsed_ms:args.p_elapsed_ms}};}};
  const bank=effectiveCatalogue();const q=bank[0];
  const handler=createMcqHandler({enabled:()=>true,admin:()=>client,catalogue:async()=>bank});
  const body={event_id:id,question_id:q.id,selected_option_id:q.options[0].id,elapsed_ms:72000,user_id:id};
  assert.equal((await invoke(handler,'answer',body)).status,200);
  assert.equal(calls[0].name,'mcq_engine_answer_paced');assert.equal(calls[0].args.p_user_id,user);assert.equal(calls[0].args.p_elapsed_ms,72000);
  for(const elapsed_ms of [-1,0.5,'12',86400001])assert.equal((await invoke(handler,'answer',{...body,elapsed_ms})).status,400);
  assert.equal(calls.length,1);
  const legacy={...body};delete legacy.elapsed_ms;
  await invoke(handler,'answer',legacy);assert.equal(calls[1].name,'mcq_engine_answer');
});

test('readiness is authenticated and source labels are validated before storage',async()=>{
  const calls=[];
  const client={auth:{getUser:async()=>({data:{user:{id:user}}})},rpc:async(name,args)=>{calls.push({name,args});return {data:{concepts:[],chapters:{}}};}};
  const bank=effectiveCatalogue(),q=bank[0];
  const handler=createMcqHandler({enabled:()=>true,admin:()=>client,catalogue:async()=>bank});
  const body={event_id:id,question_id:q.id,selected_option_id:q.options[0].id,practice_source:'exam'};
  assert.equal((await invoke(handler,'answer',{...body,practice_source:'pbq'})).status,400);assert.equal(calls.length,0);
  assert.equal((await invoke(handler,'answer',body)).status,200);assert.equal(calls[0].name,'mcq_engine_answer_sourced');assert.equal(calls[0].args.p_source,'exam');assert.equal(calls[0].args.p_elapsed_ms,null);
  assert.equal((await invoke(handler,'readiness',{user_id:id})).status,200);assert.equal(calls[1].name,'mcq_engine_readiness');assert.equal(calls[1].args.p_user_id,user);
  assert.equal((await invoke(handler,'readiness',{},'')).status,401);
});
