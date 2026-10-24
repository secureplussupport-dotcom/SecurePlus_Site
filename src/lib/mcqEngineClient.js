import { getSupabaseAccessToken } from './supabaseClient.js';

export const mcqEngineEnabled = import.meta.env.VITE_MCQ_ENGINE_ENABLED === 'true';

// Only concurrent access reads are shared, scoped to the current bearer token.
// Never cache generated sets, learner state or authorisation decisions.
const accessRequests = new Map();
let guestCookieReady = false;

async function sendEngineRequest(operation, body, token) {
  // The same event ID is reused if a response is lost after its transaction commits.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(`/api/sessions/${operation}`, { method: 'POST',
        headers: { 'content-type': 'application/json', ...(token?{authorization:`Bearer ${token}`}:{}) }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) {
        if (!token && operation === 'generate' && response.status === 400) guestCookieReady = false;
        throw Object.assign(new Error(result.error || 'Unable to save MCQ progress.'), { status: response.status });
      }
      if (!token && operation === 'access') guestCookieReady = true;
      if(result.access)window.dispatchEvent(new Event('practice-access-changed'));
      return result;
    } catch (error) {
      if (attempt || (error.status && error.status < 500) || operation === 'generate') throw error;
    }
  }
}

export async function mcqEngineRequest(operation, body = {}) {
  const token = await getSupabaseAccessToken();
  if (!token && !['access','generate'].includes(operation)) throw new Error('Sign in again to save your MCQ progress.');
  if (operation !== 'access') return sendEngineRequest(operation, body, token);
  const key = token || 'guest';
  if (!accessRequests.has(key)) {
    const request = sendEngineRequest(operation, body, token).finally(() => accessRequests.delete(key));
    accessRequests.set(key, request);
  }
  return accessRequests.get(key);
}

// Establish the signed cookie while the guest reads the page, without spending quota.
export function prepareGuestDiagnostic() {
  return guestCookieReady ? Promise.resolve() : mcqEngineRequest('access');
}

export function practiceQuestion(q, sessionId) {
  return { id: q.id, q: q.prompt, ch: q.chapter, topic: q.topic, difficulty: q.difficulty,
    conceptTagIds: [q.concept_tag], opts: q.options.map(o => o.text), optionIds: q.options.map(o => o.id),
    engineSessionId: sessionId };
}

// Stable UUIDs match the server's source revision and original option index.
export async function standaloneOptionId(question, selectedIndex) {
  const index = question.originalOptionIndexes?.[selectedIndex] ?? selectedIndex;
  const source = question.originalOptions || question.opts;
  const correct = question.originalCorrect ?? question.correct;
  const bytes = new TextEncoder().encode(JSON.stringify([question.id, question.q, source, correct, index]));
  const hex = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function recordStandaloneMcq(question, selectedIndex, elapsedMs = null, source = null) {
  if (!mcqEngineEnabled || selectedIndex == null) return null;
  question.engineAnswerEventId ||= crypto.randomUUID();
  return mcqEngineRequest('answer', { event_id: question.engineAnswerEventId, question_id: question.id,
    selected_option_id: question.optionIds?.[selectedIndex] ?? await standaloneOptionId(question, selectedIndex), ...(question.engineAllocationId?{allocation_id:question.engineAllocationId}:{}), ...(elapsedMs == null ? {} : {elapsed_ms: elapsedMs}), ...(source ? {practice_source: source} : {}) });
}
