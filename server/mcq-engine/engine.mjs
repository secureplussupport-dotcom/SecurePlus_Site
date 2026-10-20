// The owner's three-deck MCQ specification. No relationships or legacy SM-2 rules.
import { normalizeMcqDifficulty } from '../../src/lib/mcqDifficulty.js';
export const ENGINE_VERSION = 'mcq-three-deck-v1';

export class EngineError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function fisherYates(values, random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateSet(bank, state, count, random = Math.random) {
  if (!Number.isInteger(count) || count < 10 || count > 30) throw new EngineError('Choose 10–30 questions.');
  const questions = new Map(bank.map(q => [q.id, q]));
  if (questions.size !== bank.length || bank.some(q => q.format !== 'mcq')) throw new EngineError('Invalid MCQ catalogue.', 503);
  const mastery = new Map(state.mastery.map(row => [row.concept_tag, row.score]));
  const seen = new Map(state.history.map(row => [row.question_id, row.last_seen_at]));
  const failed = new Map(state.failed.map(row => [row.question_id, row]));
  const score = q => mastery.get(q.concept_tag) ?? 50;
  const selected = [];
  const used = new Set();
  const take = (rows, limit, deck) => {
    for (const q of rows.slice(0, limit)) { selected.push({ ...q, deck }); used.add(q.id); }
  };
  const retestTarget = Math.round(.2 * count), remediationTarget = Math.round(.3 * count);
  const eligible = state.failed.filter(row => row.cooldown_counter <= 0 && questions.has(row.question_id))
    .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.question_id.localeCompare(b.question_id))
    .map(row => questions.get(row.question_id));
  take(eligible, retestTarget, 1);
  const remediationCapacity = remediationTarget + retestTarget - selected.length;
  const unseen = bank.filter(q => !seen.has(q.id) && !used.has(q.id) && !failed.has(q.id));
  // Unencountered concepts belong in discovery; only recorded weak scores remediate.
  take(fisherYates(unseen.filter(q => mastery.has(q.concept_tag) && score(q) < 80), random)
    .sort((a, b) => score(a) - score(b)), remediationCapacity, 2);
  const discovery = unseen.filter(q => !used.has(q.id)).map(q => ({ q,
    priority: -Math.log(Math.max(Number.MIN_VALUE, 1 - random())) / (score(q) >= 80 ? .5 : 1),
  })).sort((a, b) => a.priority - b.priority).map(row => row.q);
  take(discovery, count - selected.length, 3);
  // A quarantined miss must not slip back through the exhaustion fallback.
  const fallback = bank.filter(q => seen.has(q.id) && !used.has(q.id) && (!failed.has(q.id) || failed.get(q.id).cooldown_counter <= 0))
    .sort((a, b) => score(a) - score(b) || seen.get(a.id).localeCompare(seen.get(b.id)) || a.id.localeCompare(b.id));
  take(fallback, count - selected.length, 3);
  if (selected.length !== count) throw new EngineError(`Only ${selected.length} eligible MCQs are available. Broaden your filters or finish another set while missed questions cool down.`, 409);
  return fisherYates(selected, random).map(q => ({ ...q, options: fisherYates(q.options, random) }));
}

export function learnerQuestion(q) {
  return { id: q.id, concept_tag: q.concept_tag, domain: q.domain, prompt: q.prompt,
    chapter: q.chapter, topic: q.topic, difficulty: normalizeMcqDifficulty(q.difficulty),
    options: q.options.map(({ id, text }) => ({ id, text })) };
}
