import { relatedConceptTagIds } from '../data/sy0701ConceptWeb.js';

export function effectiveMcqConceptTagIds(question, assignedTags = []) {
  return Array.isArray(question.conceptTagIds) ? question.conceptTagIds : assignedTags;
}

// Reserve available MCQs for a missed concept and its direct web neighbors.
export function conceptRepairAnchors(ranked, latestAttempts, count) {
  const byId = new Map(ranked.map(entry => [entry.question.id, entry.question]));
  const missedQuestionIds = new Set();
  const missedTags = new Set();
  for (const [questionId, attempt] of latestAttempts) {
    if (attempt.correct !== false || attempt.pbq || !byId.has(questionId)) continue;
    missedQuestionIds.add(questionId);
    for (const tag of byId.get(questionId).conceptTagIds || []) missedTags.add(tag);
  }
  const relatedTags = new Set([...missedTags].flatMap(relatedConceptTagIds).filter(tag => !missedTags.has(tag)));
  const selected = [];
  const used = new Set();
  const pick = (tag, preferNew) => {
    const matches = entry => !used.has(entry.question.id) && (entry.question.conceptTagIds || []).includes(tag);
    const choice = ranked.find(entry => matches(entry) && (!preferNew || !missedQuestionIds.has(entry.question.id)))
      || ranked.find(matches);
    if (choice && selected.length < count) {
      selected.push(choice);
      used.add(choice.question.id);
    }
  };
  for (const tag of missedTags) pick(tag, true);
  for (const tag of relatedTags) pick(tag, false);
  return selected;
}
