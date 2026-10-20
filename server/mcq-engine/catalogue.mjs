import { createHash } from 'node:crypto';
import base from './base-catalogue.json' with { type: 'json' };
import assignments from '../../src/data/mcqConceptTagAssignments.json' with { type: 'json' };
import { effectiveMcqConceptTagIds } from '../../src/lib/mcqConceptReview.js';
import { isCapturedOverride } from '../../src/data/sy0701PublishedSnapshot.js';
import { isMcqEditoriallyActive } from '../../src/data/sy0701EditorialReview.js';
import { EngineError } from './engine.mjs';

const assigned = new Map(assignments.assignments.map(row => [row.questionId, row]));
export function optionId(question, index) {
  const hex = createHash('sha256').update(JSON.stringify([question.id, question.q, question.opts, question.correct, index])).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function effectiveCatalogue(overrides = []) {
  const byId = new Map(base.map(q => [q.id, { ...q }]));
  for (const row of overrides) {
    if (row.status !== 'active' || row.question_kind !== 'mcq') continue;
    if (row.action === 'disable') { byId.delete(row.question_id); continue; }
    if (!isMcqEditoriallyActive({ id: row.question_id }) || isCapturedOverride(row)) continue;
    byId.set(row.question_id, { ...byId.get(row.question_id), ...row.payload, id: row.question_id });
  }
  return [...byId.values()].map(q => {
    const tags = effectiveMcqConceptTagIds(q, assigned.get(q.id)?.conceptTagIds || [], assignments.version);
    const primary = assigned.get(q.id)?.primaryTagId;
    const concept = tags.includes(primary) ? primary : tags[0];
    if (!q.q || !Array.isArray(q.opts) || q.opts.length < 2 || !Number.isInteger(q.correct) || !q.opts[q.correct]) throw new EngineError(`MCQ ${q.id} needs valid content in Question Manager.`, 503);
    // A deliberately untagged question remains available to manual practice,
    // but cannot create an invented mastery concept.
    return { id: q.id, format: 'mcq', concept_tag: concept || null, domain: `Domain ${q.ch}`,
      chapter: q.ch, topic: q.topic, difficulty: q.difficulty, prompt: q.q,
      explanation: q.exp || '', options: q.opts.map((text, index) => ({ id: optionId(q, index), text, is_correct: index === q.correct,
        feedback: q.wrongFeedback?.[index] || '' })) };
  });
}

export async function loadCatalogue(supabase) {
  const { data, error } = await supabase.from('question_overrides')
    .select('question_id,question_kind,status,action,payload,updated_at').eq('status', 'active').eq('question_kind', 'mcq').limit(2000);
  if (error) throw new EngineError('Question Manager content could not be loaded. Please try again.', 503);
  return effectiveCatalogue(data || []);
}
