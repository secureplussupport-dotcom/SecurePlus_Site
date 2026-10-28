// Smart Review transparency for the MCQ setup screen. Pure function of
// the engine state (cloud users) plus the question bank, so it is testable
// without the app. Guests and local users have no engine state, so they get
// the rules with no live figures — never invented ones.
//
// Engine facts (from server/mcq-engine/engine.mjs and its migrations):
// - A set is 20% due retests, 30% unseen weak-concept questions, 50% new
//   discovery. Two consecutive misses on a concept make its next test a
//   Core question when one is available.
// - A missed question enters a 30-answer cooldown. Every graded MCQ answer
//   decrements every cooling-down question by 1. Answering a missed
//   question correctly removes it from the missed queue.

export const SMART_REVIEW_RULES = Object.freeze([
  'A set mixes 20% due retests, 30% unseen weak-concept questions, and 50% new discovery.',
  'A missed question returns after 30 other MCQ answers.',
  'Answering a missed question correctly removes it from your missed queue.',
  'Two consecutive misses on a concept make its next test a Core question, when one is available.',
  'Concepts at 80 or above count as mastered and leave the weak-concept list.',
]);

export function summarizeSmartReview({ engineState = null, bank = [] } = {}) {
  const failed = Array.isArray(engineState?.failed) ? engineState.failed : [];
  const mastery = Array.isArray(engineState?.mastery) ? engineState.mastery : [];
  const due = failed.filter((row) => Number(row.cooldown_counter) <= 0).length;
  const cooling = failed.filter((row) => Number(row.cooldown_counter) > 0);
  const nextRetestIn = cooling.length
    ? Math.min(...cooling.map((row) => Number(row.cooldown_counter)))
    : null;
  const conceptsToReview = new Set([
    ...mastery.filter((row) => Number(row.score) < 80).map((row) => row.concept_tag),
  ]).size;
  // Weakest concept: lowest mastery score. Its domain comes from the bank
  // (first question with that concept tag); unknown when not in the bank.
  let weakest = null;
  if (mastery.length) {
    const lowest = [...mastery].sort((a, b) => Number(a.score) - Number(b.score) || String(a.concept_tag).localeCompare(String(b.concept_tag)))[0];
    const question = bank.find((q) => q.concept_tag === lowest.concept_tag || (Array.isArray(q.conceptTagIds) && q.conceptTagIds.includes(lowest.concept_tag)));
    weakest = { tag: lowest.concept_tag, score: Number(lowest.score), domain: question?.ch ? String(question.ch) : null };
  }
  return {
    available: engineState != null,
    due, coolingDown: cooling.length, nextRetestIn, conceptsToReview, weakest,
    rules: SMART_REVIEW_RULES,
  };
}
