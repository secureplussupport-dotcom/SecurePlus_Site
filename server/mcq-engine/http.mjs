import { randomUUID } from 'node:crypto';
import { getBearerToken, getJsonBody, getSupabaseAdmin, json, requireJsonContentType } from '../../api/_utils.js';
import { ENGINE_VERSION, EngineError, generateSet, learnerQuestion } from './engine.mjs';
import { loadCatalogue } from './catalogue.mjs';
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

export function createMcqHandler({ admin = getSupabaseAdmin, enabled = () => process.env.MCQ_ENGINE_ENABLED === 'true', catalogue = loadCatalogue } = {}) {
  return async (req, res) => {
    res.setHeader('cache-control', 'no-store');
    if (req.method !== 'POST') { res.setHeader('allow', 'POST'); return json(res, 405, { error: 'Method not allowed.' }); }
    if (!enabled()) return json(res, 503, { error: 'The new MCQ engine is awaiting activation.' });
    try {
      const token = getBearerToken(req);
      if (!token) return json(res, 401, { error: 'Sign in to save MCQ progress.' });
      const client = admin();
      const { data: auth, error } = await client.auth.getUser(token);
      if (error || !auth?.user || auth.user.is_anonymous) return json(res, 401, { error: 'Sign in again to continue.' });
      const userId = auth.user.id;
      requireJsonContentType(req);
      const body = await getJsonBody(req, { throwSafeErrors: true });
      const operation = req.query?.operation;
      if (operation === 'state') return json(res, 200, await rpc(client, 'mcq_engine_state', { p_user_id: userId }));
      if (operation === 'resume') {
        if (!uuid(body.session_id)) throw new EngineError('Invalid session.');
        const plan = await rpc(client, 'mcq_engine_session', { p_user_id: userId, p_session_id: body.session_id });
        if (!plan) throw new EngineError('Saved set not found.', 404);
        return json(res, 200, { session_id: body.session_id, version: ENGINE_VERSION, questions: plan.questions.map(learnerQuestion), answers: plan.answers });
      }
      if (operation === 'generate') {
        const count = body.set_size;
        if (!Number.isInteger(count) || count < 10 || count > 30) throw new EngineError('Choose 10–30 questions.');
        const filters = body.filters || {};
        if (filters.chapter && !/^[1-5]$/.test(filters.chapter)) throw new EngineError('Invalid chapter.');
        const difficulty = normalizeMcqDifficulty(filters.difficulty);
        if (filters.difficulty && (typeof filters.difficulty !== 'string' || !MCQ_DIFFICULTIES.includes(difficulty))) throw new EngineError('Invalid difficulty.');
        if (filters.topic && (typeof filters.topic !== 'string' || filters.topic.length > 200)) throw new EngineError('Invalid topic.');
        const bank = (await catalogue(client)).filter(q => q.concept_tag &&
          (!filters.chapter || q.chapter === filters.chapter) && (!difficulty || normalizeMcqDifficulty(q.difficulty) === difficulty) && (!filters.topic || q.topic === filters.topic));
        for (let attempt = 0; attempt < 3; attempt++) {
          const state = await rpc(client, 'mcq_engine_state', { p_user_id: userId });
          const questions = generateSet(bank, state, count);
          const id = randomUUID();
          if (await rpc(client, 'mcq_engine_create_session', { p_user_id: userId, p_session_id: id, p_version: state.version, p_questions: questions })) {
            return json(res, 200, { session_id: id, version: ENGINE_VERSION, questions: questions.map(learnerQuestion) });
          }
        }
        throw new EngineError('Progress changed while building this set. Please retry.', 409);
      }
      if (operation === 'answer') {
        if (!uuid(body.event_id) || (body.session_id != null && !uuid(body.session_id)) || !uuid(body.selected_option_id) ||
          typeof body.question_id !== 'string' || !/^m[a-z0-9_-]+$/i.test(body.question_id)) throw new EngineError('Invalid MCQ answer.');
        if (body.elapsed_ms != null && (!Number.isInteger(body.elapsed_ms) || body.elapsed_ms < 0 || body.elapsed_ms > 86400000)) throw new EngineError('Invalid question pacing.');
        let standalone = null;
        if (!body.session_id) {
          standalone = (await catalogue(client)).find(q => q.id === body.question_id);
          if (!standalone) throw new EngineError('This MCQ is unavailable.', 404);
        }
        return json(res, 200, await rpc(client, body.elapsed_ms == null ? 'mcq_engine_answer' : 'mcq_engine_answer_paced', { p_user_id: userId, p_event_id: body.event_id,
          p_session_id: body.session_id || null, p_question_id: body.question_id, p_option_id: body.selected_option_id, p_standalone: standalone, ...(body.elapsed_ms == null ? {} : { p_elapsed_ms: body.elapsed_ms }) }));
      }
      return json(res, 404, { error: 'MCQ endpoint not found.' });
    } catch (error) {
      return json(res, error.status || 503, { error: error.status ? error.message : 'MCQ service is unavailable. Please retry.' });
    }
  };
}

export default createMcqHandler();
