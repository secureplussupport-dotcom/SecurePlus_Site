import { diagnosticSet, diagnosticQuestion } from './diagnostic.mjs';
import { guestOwner, accessRpc, chooseAccessSet, ownedSet, guestQuestion } from './access.mjs';
import { randomUUID } from 'node:crypto';
import { getBearerToken, getJsonBody, getSupabaseAdmin, json, requireJsonContentType } from '../../api/_utils.js';
import { ENGINE_VERSION, EngineError, generateSet, learnerQuestion, prioritizeCoreRecovery } from './engine.mjs';
import { loadCatalogue } from './catalogue.mjs';
import { PRO_MAX_SET_SIZE } from '../../src/lib/accessModel.js';
import { normalizeMcqDifficulty, MCQ_DIFFICULTIES } from '../../src/lib/mcqDifficulty.js';

const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
async function rpc(client, name, args) {
  const { data, error } = await client.rpc(name, args);
  if (error) {
    if (error.code === '23505') throw new EngineError('This answer has already been submitted.', 409);
    if (error.code === '22023') throw new EngineError('This question or option is no longer valid. Reload the set.', 400);
    throw new EngineError('MCQ progress could not be saved. Please retry.', 503);
  }
  return data;
}

// Reconcile pending questions after grading, including retries of a lost response.
async function recoverPendingQuestions(client, userId, sessionId, currentQuestionId, catalogue) {
  for(let attempt=0;attempt<3;attempt++) {
    const state=await rpc(client,'mcq_engine_state',{p_user_id:userId});
    const plan=await rpc(client,'mcq_engine_session',{p_user_id:userId,p_session_id:sessionId});
    if(!plan)throw new EngineError('Saved set not found.',404);
    const answered=new Set(plan.answers.map(row=>row.question_id));
    const currentIndex=plan.questions.findIndex(q=>q.id===currentQuestionId);
    const pendingIndexes=plan.questions.map((q,i)=>i).filter(i=>!answered.has(plan.questions[i].id))
      .sort((a,b)=>Number(a<=currentIndex)-Number(b<=currentIndex) || a-b);
    const pending=pendingIndexes.map(i=>plan.questions[i]);
    if(!pending.some(q=>(state.concept_streaks || []).some(s=>s.concept_tag===q.concept_tag && s.wrong_streak>=2)))return plan.questions;
    const common=key=>new Set(plan.questions.map(q=>q[key])).size===1?plan.questions[0]?.[key]:undefined;
    const filters=plan.questions[0]?.practice_filters || {chapter:common('chapter'),topic:common('topic'),difficulty:common('difficulty')};
    const bank=(await catalogue(client)).filter(q=>q.concept_tag && !answered.has(q.id) &&
      (!filters.chapter || q.chapter===filters.chapter) &&
      (!filters.topic || q.topic===filters.topic) &&
      (!filters.difficulty || normalizeMcqDifficulty(q.difficulty)===normalizeMcqDifficulty(filters.difficulty)));
    const recovered=prioritizeCoreRecovery(pending,bank,state);
    const replacements=new Map(pendingIndexes.map((slot,i)=>[slot,recovered[i]]));
    const questions=plan.questions.map((q,i)=>replacements.get(i) || q);
    if(JSON.stringify(questions)===JSON.stringify(plan.questions))return questions;
    if(await rpc(client,'mcq_engine_recover_session',{p_user_id:userId,p_session_id:sessionId,p_version:state.version,p_questions:questions}))return questions;
  }
  throw new EngineError('Progress changed while preparing Core recovery. Please retry.',409);
}

export function createMcqHandler({ admin = getSupabaseAdmin, enabled = () => process.env.MCQ_ENGINE_ENABLED === 'true', catalogue = loadCatalogue } = {}) {
  return async (req, res) => {
    res.setHeader('cache-control', 'no-store');
    if (req.method !== 'POST') { res.setHeader('allow', 'POST'); return json(res, 405, { error: 'Method not allowed.' }); }
    if (!enabled()) return json(res, 503, { error: 'The new MCQ engine is awaiting activation.' });
    try {
      const token = getBearerToken(req);
      if (!token) {
        if (!['generate','access'].includes(req.query?.operation)) return json(res,401,{error:'Create an account to save progress.'});
        requireJsonContentType(req);const body=await getJsonBody(req,{throwSafeErrors:true});
        if(req.query.operation==='generate'&&(body.mode!=='diagnostic'||body.set_size!==10||!uuid(body.request_id)))throw new EngineError('Guests can try a 10-question diagnostic.');
        const client=admin(),key=guestOwner(req,res);
        if(req.query.operation==='access')return json(res,200,await accessRpc(client,'practice_access_status',{p_user_id:null,p_guest_key:key}));
        if(body.mode!=='diagnostic'||body.set_size!==10||!uuid(body.request_id))throw new EngineError('Guests can try a 10-question diagnostic.');
        const questions=diagnosticSet(await catalogue(client));
        const diagnostic=await accessRpc(client,'guest_diagnostic_create',{p_guest_key:key,p_request_id:body.request_id,p_questions:questions});
        return json(res,200,{session_id:body.request_id,questions:diagnostic.questions.map(diagnosticQuestion)});
      }
      const client = admin();
      const { data: auth, error } = await client.auth.getUser(token);
      if (error || !auth?.user || auth.user.is_anonymous) return json(res, 401, { error: 'Sign in again to continue.' });
      const userId = auth.user.id;
      requireJsonContentType(req);
      const body = await getJsonBody(req, { throwSafeErrors: true });
      const operation = req.query?.operation;
      if(operation==='diagnostic-import'){
        if(!uuid(body.session_id)||!Array.isArray(body.answers)||body.answers.length!==10||
          body.answers.some(a=>!a||typeof a.question_id!=='string'||!uuid(a.selected_option_id)))throw new EngineError('Invalid diagnostic results.');
        const key=guestOwner(req,res);
        return json(res,200,await accessRpc(client,'guest_diagnostic_import',{p_user_id:userId,p_guest_key:key,p_request_id:body.session_id,p_answers:body.answers}));
      }
      if(operation==='exam-review'){
        if(!uuid(body.session_id))throw new EngineError('Invalid exam.');const plan=await ownedSet(client,userId,body.session_id);
        if(plan.mode!=='exam'||!plan.completed)throw new EngineError('Submit the exam before reviewing answers.',403);
        return json(res,200,{questions:plan.questions.map(guestQuestion)});
      }
      if (operation === 'access') return json(res,200,await accessRpc(client,'practice_access_status',{p_user_id:userId}));
      if (operation === 'complete') {if(!uuid(body.session_id))throw new EngineError('Invalid session.');await ownedSet(client,userId,body.session_id);await accessRpc(client,'practice_complete_set',{p_user_id:userId,p_request_id:body.session_id});return json(res,200,{ok:true});}
      if (operation === 'star') {
        if(body.action==='list')return json(res,200,{stars:await accessRpc(client,'practice_list_stars',{p_user_id:userId})});
        if(typeof body.key!=='string'||body.key.length>180)throw new EngineError('Invalid bookmark.');
        if(body.action==='remove'){const {error}=await client.from('starred_questions').delete().eq('user_id',userId).eq('question_key',body.key);if(error)throw new EngineError('Unable to remove bookmark.',503);return json(res,200,{saved:false});}
        if(body.action!=='save'||!Array.isArray(body.tags||[])||(body.tags||[]).some(x=>typeof x!=='string'))throw new EngineError('Invalid bookmark action.');
        await accessRpc(client,'practice_list_stars',{p_user_id:userId});
        return json(res,200,await accessRpc(client,'practice_save_star',{p_user_id:userId,p_key:body.key,p_type:body.type,p_id:body.id,p_replace:body.replace||null,p_label:body.label||'',p_tags:body.tags||[]}));
      }
      if (operation === 'readiness') return json(res, 200, await rpc(client, 'mcq_engine_readiness', { p_user_id: userId }));
      if (operation === 'state') {
        const state=await rpc(client,'mcq_engine_state',{p_user_id:userId});
        const {data,error}=await client.rpc('guest_diagnostic_focus',{p_user_id:userId});
        if(error)throw new EngineError('Concept review could not be loaded. Please retry.',503);
        return json(res,200,{...state,diagnostic_weak_tags:data});
      }
      if (operation === 'resume') {
        if (!uuid(body.session_id)) throw new EngineError('Invalid session.');
        const allocation=await ownedSet(client,userId,body.session_id);
        const plan = await rpc(client, 'mcq_engine_session', { p_user_id: userId, p_session_id: body.session_id });
        if (!plan) throw new EngineError('Saved set not found.', 404);
        return json(res, 200, { session_id: body.session_id, version: ENGINE_VERSION, questions: plan.questions.map(learnerQuestion), answers: plan.answers,mode:allocation.mode,createdAt:allocation.createdAt });
      }
      if (operation === 'generate') {
        const count=body.set_size,mode=body.mode||'smart';
        if(!Number.isInteger(count)||count<1||count>PRO_MAX_SET_SIZE)throw new EngineError('Choose a valid set size.');
        if(!['smart','random','exam','missed','starred'].includes(mode))throw new EngineError('Invalid practice mode.');
        const filters=Object.fromEntries(Object.entries(body.filters||{}).filter(([,v])=>v!=null&&v!==''));
        if(Object.keys(filters).some(k=>!['chapter','difficulty','topic'].includes(k)))throw new EngineError('Invalid filters.');
        if(mode==='exam'&&Object.keys(filters).length)throw new EngineError('Exam Mode uses an unfiltered mix.');
        if(filters.chapter&&!/^[1-5]$/.test(filters.chapter))throw new EngineError('Invalid chapter.');
        const difficulty=normalizeMcqDifficulty(filters.difficulty);
        if(filters.difficulty&&(typeof filters.difficulty!=='string'||!MCQ_DIFFICULTIES.includes(difficulty)))throw new EngineError('Invalid difficulty.');
        if(filters.topic&&(typeof filters.topic!=='string'||filters.topic.length>200))throw new EngineError('Invalid topic.');
        const id=body.request_id||randomUUID();if(!uuid(id))throw new EngineError('Invalid generation request.');
        // Independent owner-bound reads overlap; the atomic write still checks version/quota.
        const [access,available,initialState,stars]=await Promise.all([
          accessRpc(client,'practice_access_status',{p_user_id:userId}),
          catalogue(client),
          rpc(client,'mcq_engine_state',{p_user_id:userId}),
          mode==='starred'?accessRpc(client,'practice_list_stars',{p_user_id:userId}):null,
        ]);
        if(count>access.maxSetSize)throw new EngineError(`Choose 1–${access.maxSetSize} questions.`);
        if(!access.isPro&&Object.keys(filters).length)throw new EngineError('Custom filters are available with Pro.',403);
        let bank=available.filter(q=>q.concept_tag&&(!filters.chapter||q.chapter===filters.chapter)&&(!difficulty||normalizeMcqDifficulty(q.difficulty)===difficulty)&&(!filters.topic||q.topic===filters.topic));
        if(mode==='starred'){const ids=new Set(stars.filter(r=>r.question_type==='mcq').map(r=>r.question_id));bank=bank.filter(q=>ids.has(q.id));}
        for(let attempt=0;attempt<3;attempt++){
          const state=attempt===0?initialState:await rpc(client,'mcq_engine_state',{p_user_id:userId});
          const questions=chooseAccessSet(bank,state,count,mode,access.isPro).map(q=>({...q,practice_filters:filters}));
          const result=await accessRpc(client,'practice_create_set',{p_user_id:userId,p_guest_key:null,p_request_id:id,p_mode:mode,p_questions:questions,p_filters:filters,p_version:state.version});
          if(result.quotaExceeded)return json(res,429,{error:`This set needs ${count} questions; ${result.access.remaining} remain in your rolling 12-hour allowance.`,access:result.access});
          if(result.created)return json(res,200,{session_id:id,version:ENGINE_VERSION,mode,questions:result.questions.map(learnerQuestion),access:result.access,createdAt:result.createdAt});
        }
        throw new EngineError('Progress changed while building this set. Please retry.',409);
      }
      if (operation === 'answer') {
        if (!uuid(body.event_id) || (body.session_id != null && !uuid(body.session_id)) || !uuid(body.selected_option_id) ||
          typeof body.question_id !== 'string' || !/^m[a-z0-9_-]+$/i.test(body.question_id)) throw new EngineError('Invalid MCQ answer.');
        if (body.elapsed_ms != null && (!Number.isInteger(body.elapsed_ms) || body.elapsed_ms < 0 || body.elapsed_ms > 86400000)) throw new EngineError('Invalid question pacing.');
        if (body.practice_source != null && !['mcq-set','exam','daily-challenge','diagnostic'].includes(body.practice_source)) throw new EngineError('Invalid activity source.');
        let allocation=null;
        if(body.session_id)allocation=await ownedSet(client,userId,body.session_id);
        if(body.allocation_id){if(!uuid(body.allocation_id))throw new EngineError('Invalid exam.');allocation=await ownedSet(client,userId,body.allocation_id);}
        let standalone = null;
        if (!body.session_id) {
          standalone = allocation?allocation.questions.find(q=>q.id===body.question_id):(await catalogue(client)).find(q => q.id === body.question_id);
          if (!standalone) throw new EngineError('This MCQ is unavailable.', 404);
        }
        const evaluation = await rpc(client, body.practice_source != null ? 'mcq_engine_answer_sourced' : body.elapsed_ms == null ? 'mcq_engine_answer' : 'mcq_engine_answer_paced', { p_user_id: userId, p_event_id: body.event_id,
          p_session_id: body.session_id || null, p_question_id: body.question_id, p_option_id: body.selected_option_id, p_standalone: standalone, ...(body.practice_source != null ? { p_elapsed_ms: body.elapsed_ms ?? null, p_source: body.practice_source } : body.elapsed_ms == null ? {} : { p_elapsed_ms: body.elapsed_ms }) });
        if(body.session_id && allocation?.mode==='smart')evaluation.session_questions=(await recoverPendingQuestions(client,userId,body.session_id,body.question_id,catalogue)).map(learnerQuestion);
        return json(res,200,evaluation);
      }
      return json(res, 404, { error: 'MCQ endpoint not found.' });
    } catch (error) {
      return json(res, error.status || 503, { error: error.status ? error.message : 'MCQ service is unavailable. Please retry.' });
    }
  };
}

export default createMcqHandler();
