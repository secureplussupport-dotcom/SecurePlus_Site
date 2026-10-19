import { CONCEPT_TAGS } from '../data/sy0701ConceptTags.js';

const knownTagIds = new Set(CONCEPT_TAGS.map(tag => tag.id));

export function effectiveMcqConceptTagIds(question, assignedTags = [], taggingVersion) {
  // Older Question Manager saves contain IDs from the retired catalogue.
  // A save made with this version (including an intentional empty list) wins.
  const tags = question.taggingVersion === taggingVersion && Array.isArray(question.conceptTagIds)
    ? question.conceptTagIds : assignedTags;
  return [...new Set(tags.filter(id => knownTagIds.has(id)))];
}

// Reserve available MCQs for the exact concepts missed, then repeat the missed item.
export function conceptRepairAnchors(ranked, latestAttempts, count) {
  const byId = new Map(ranked.map(entry => [entry.question.id, entry.question]));
  const missedQuestionIds = new Set();
  const missedTags = new Set();
  for (const [questionId, attempt] of latestAttempts) {
    if (attempt.correct !== false || attempt.pbq || !byId.has(questionId)) continue;
    missedQuestionIds.add(questionId);
    for (const tag of byId.get(questionId).conceptTagIds || []) missedTags.add(tag);
  }
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
  // One new same-tag question comes first; keep room for the original miss.
  let firstTag;
  for (const tag of missedTags) {
    const before = selected.length;
    pick(tag, true);
    if (selected.length > before) { firstTag = tag; break; }
  }
  // Keep each missed MCQ in review until its latest answer is correct.
  for (const entry of ranked) {
    if (missedQuestionIds.has(entry.question.id) && !used.has(entry.question.id) && selected.length < count) {
      selected.push(entry);
      used.add(entry.question.id);
    }
  }
  for (const tag of missedTags) if (tag !== firstTag) pick(tag, true);
  return selected;
}
