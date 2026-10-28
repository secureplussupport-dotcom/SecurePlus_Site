import { practiceActivity } from './dashboardMetrics.js';
import { READINESS_CONCEPT_CATALOGUE } from '../data/readinessConceptCatalogue.js';

// Exam readiness, rebuilt to be explainable and hard to overstate.
//
// One-sentence formula (shown in the UI, and it must stay true):
//   Every concept starts at 50. Correct answers raise it, misses lower it.
//   Readiness is the exam-weighted average of ALL concepts in the bank —
//   unattempted concepts stay at 50, so readiness rises only as a learner
//   covers more of the exam, not just by doing well on a first set.
//
// What readiness is NOT:
//   - Accuracy (correct / attempted) is shown separately and is never
//     blended into readiness. A learner can be 90% accurate on 10 questions
//     and still be far from exam-ready.
//   - Lesson or flashcard completion does not change readiness directly.
//     Learning shows up when the learner next answers MCQs.
//   - No language model or black-box model is involved. Every figure in the
//     breakdown must reconcile to the headline within 1 point (rounding).

export const READINESS_BASELINE = 50;
export const READINESS_MASTERY_THRESHOLD = 80;
export const DOMAIN_WEIGHTS = Object.freeze({ 1: 12, 2: 22, 3: 18, 4: 28, 5: 20 });
export const READINESS_EXPLANATION =
  'Your readiness is the exam-weighted average of all concepts. Every concept starts at 50. ' +
  'Correct answers raise it, misses lower it. Unattempted concepts stay at 50, so readiness ' +
  'rises only as you cover more of the exam. Accuracy is shown separately and is not blended into readiness.';

const VALID_CHAPTER = /^[1-5]$/;
const floor1 = (value) => Math.floor(value * 10) / 10;
const isValidConcept = (c) =>
  c && c.tag && Number.isFinite(c.score) && c.score >= 0 && c.score <= 100;

// Readiness uses the same mastery rule, replayed over MCQ sets and Exams only.
export function localReadinessEvidence(attempts = []) {
  const concepts = new Map(), chapters = {};
  const questionIds = new Set();
  let hasQuestionId = false;
  const practiceDates = [];
  let firstPracticedAt = null, lastPracticedAt = null;
  let total = 0;
  for (const event of [...attempts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))) {
    if ((Object.hasOwn(event, 'selected') && event.selected == null) || event.pbq || !['mcq-set', 'exam'].includes(event.readinessSource || (event.exam ? 'exam' : '')) || typeof event.correct !== 'boolean' || !event.conceptTag) continue;
    const previous = concepts.get(event.conceptTag);
    concepts.set(event.conceptTag, { tag: event.conceptTag, score: Math.max(0, Math.min(100, (previous?.score ?? 50) + (event.correct ? 20 : -35))), chapter: String(event.ch || '') });
    if (/^[1-5]$/.test(String(event.ch))) {
      const stats = chapters[event.ch] ||= { correct: 0, total: 0 };
      stats.total++; if (event.correct) stats.correct++;
    }
    if (event.qid != null && event.qid !== '') { hasQuestionId = true; questionIds.add(String(event.qid)); }
    const at = event.createdAt ? new Date(event.createdAt) : null;
    if (at && !Number.isNaN(at.getTime())) {
      practiceDates.push(at.toISOString().slice(0, 10));
      if (!firstPracticedAt || at < firstPracticedAt) firstPracticedAt = at;
      if (!lastPracticedAt || at > lastPracticedAt) lastPracticedAt = at;
    }
    total++;
  }
  return {
    concepts: [...concepts.values()], chapters, total, unclassified: 0,
    activity: practiceActivity(attempts),
    distinctQuestions: questionIds.size,
    distinctQuestionsKnown: hasQuestionId,
    practiceDays: new Set(practiceDates).size,
    firstPracticedAt: firstPracticedAt ? firstPracticedAt.toISOString() : null,
    lastPracticedAt: lastPracticedAt ? lastPracticedAt.toISOString() : null,
  };
}

export function readinessConfidence(input = {}) {
  const {
    attempted, domainsAttempted, distinctQuestions, distinctQuestionsKnown,
    practiceDays, firstPracticedAt, total, now,
  } = input;
  if (!attempted) return 'none';
  const sampleKnown = distinctQuestionsKnown ?? distinctQuestions != null;
  const sample = sampleKnown ? (distinctQuestions ?? 0) : (total ?? 0);
  const first = firstPracticedAt ? new Date(firstPracticedAt) : null;
  const daysSinceFirst = first && !Number.isNaN(first.getTime()) && now != null
    ? Math.floor((now - first.getTime()) / 86400000) : null;
  // High confidence needs verified distinct questions, all domains, and
  // practice spread over time. Legacy cloud snapshots without distinct
  // question counts can never reach High; they are capped at Medium below.
  if (sampleKnown && sample >= 150 && domainsAttempted === 5 &&
    practiceDays != null && practiceDays >= 3 && daysSinceFirst != null && daysSinceFirst >= 7) {
    return 'high';
  }
  const daysMet = sampleKnown
    ? practiceDays != null && practiceDays >= 2
    : true; // legacy snapshots have no practice-day field; Medium is the cap
  if (domainsAttempted === 5 && sample >= 50 && daysMet) return 'medium';
  return 'low';
}

const CONFIDENCE_LABELS = Object.freeze({
  none: 'No estimate yet', low: 'Early estimate', medium: 'Moderate confidence', high: 'High confidence',
});

export function summarizeReadiness(evidence = {}, options = {}) {
  const catalogue = options.catalogue ?? READINESS_CONCEPT_CATALOGUE;
  const now = options.now != null ? options.now : Date.now();
  const concepts = (evidence.concepts || []).filter(isValidConcept);
  const chapters = evidence.chapters || {};
  const attempted = concepts.length;
  const mastered = concepts.filter((c) => c.score >= READINESS_MASTERY_THRESHOLD).length;

  // Per-domain concept maps: catalogue tags start at the baseline, attempted
  // scores overlay them. An attempted tag not in the catalogue for its
  // domain is added to that domain rather than dropped.
  const byDomain = {};
  for (const domain of Object.keys(DOMAIN_WEIGHTS)) {
    byDomain[domain] = new Map((catalogue?.[domain] || []).map((tag) => [tag, READINESS_BASELINE]));
  }
  const attemptedByDomain = {};
  const unmasteredByChapter = {};
  let unclassifiedConcepts = 0;
  for (const concept of concepts) {
    const domain = VALID_CHAPTER.test(concept.chapter) ? concept.chapter : null;
    if (!domain) { unclassifiedConcepts++; continue; }
    byDomain[domain].set(concept.tag, concept.score);
    attemptedByDomain[domain] = (attemptedByDomain[domain] || 0) + 1;
    if (concept.score < READINESS_MASTERY_THRESHOLD) {
      unmasteredByChapter[domain] = (unmasteredByChapter[domain] || 0) + 1;
    }
  }

  const domains = Object.keys(DOMAIN_WEIGHTS).map((domain) => {
    const entries = [...byDomain[domain].entries()];
    const rawMastery = entries.length ? entries.reduce((sum, [, score]) => sum + score, 0) / entries.length : null;
    const attemptedInDomain = attemptedByDomain[domain] || 0;
    const stats = chapters[domain];
    const weakest = concepts
      .filter((c) => c.chapter === domain)
      .sort((a, b) => a.score - b.score || String(a.tag).localeCompare(String(b.tag)))
      .slice(0, 2)
      .map((c) => ({ tag: c.tag, score: c.score }));
    return {
      id: domain, weight: DOMAIN_WEIGHTS[domain],
      mastery: rawMastery == null ? null : floor1(rawMastery),
      attempted: attemptedInDomain, total: entries.length,
      unattempted: entries.length - attemptedInDomain,
      accuracy: stats?.total ? Math.round((stats.correct / stats.total) * 100) : null,
      weakest,
    };
  });

  // Weighted average over domains that have a mastery value. With the
  // production catalogue every domain has one, so weights sum to 100 and
  // no renormalisation changes the result. Renormalisation only matters
  // for a partial (e.g. test) catalogue.
  const weighted = domains.filter((d) => d.mastery != null);
  const weightSum = weighted.reduce((sum, d) => sum + d.weight, 0);
  const rawScore = weightSum
    ? weighted.reduce((sum, d) => sum + d.weight * d.mastery, 0) / weightSum
    : null;
  const score = attempted && rawScore != null ? floor1(rawScore) : null;

  const domainsAttempted = Object.keys(attemptedByDomain).filter((d) => VALID_CHAPTER.test(d)).length;
  const distinctQuestions = evidence.distinctQuestions ?? evidence.distinct_questions ?? null;
  const distinctQuestionsKnown = evidence.distinctQuestionsKnown ?? distinctQuestions != null;
  const practiceDays = evidence.practiceDays ?? evidence.practice_days ?? null;
  const firstPracticedAt = evidence.firstPracticedAt ?? evidence.first_practiced_at ?? null;
  const lastPracticedAt = evidence.lastPracticedAt ?? evidence.last_practiced_at ?? null;
  const confidence = readinessConfidence({
    attempted, domainsAttempted, distinctQuestions, distinctQuestionsKnown,
    practiceDays, firstPracticedAt, total: evidence.total ?? 0, now,
  });
  const sample = distinctQuestionsKnown ? (distinctQuestions ?? 0) : (evidence.total ?? 0);
  const last = lastPracticedAt ? new Date(lastPracticedAt) : null;
  const stale = Boolean(last && !Number.isNaN(last.getTime()) && now - last.getTime() > 14 * 86400000);

  let level;
  if (!attempted || score == null) level = 'No estimate yet';
  else if (score >= 80) level = confidence === 'medium' || confidence === 'high' ? 'Exam ready' : 'Above 80 on early evidence';
  else if (score >= 70) level = 'Nearly ready';
  else if (score >= 50) level = 'Growing confidence';
  else level = 'Building foundations';

  const chapterTotals = Object.values(chapters).reduce(
    (sum, stats) => ({ total: sum.total + (stats?.total || 0), correct: sum.correct + (stats?.correct || 0) }),
    { total: 0, correct: 0 },
  );
  const accuracy = chapterTotals.total ? Math.round((chapterTotals.correct / chapterTotals.total) * 100) : null;

  return {
    score, mean: score, attempted, mastered, unmastered: attempted - mastered,
    byChapter: unmasteredByChapter,
    activity: evidence.activity || null, chapters, unclassified: evidence.unclassified || 0,
    unclassifiedConcepts, level, confidence, confidenceLabel: CONFIDENCE_LABELS[confidence],
    sampleQuestions: sample, distinctQuestionsKnown, practiceDays,
    firstPracticedAt, lastPracticedAt, stale,
    staleNote: stale ? 'Stale — complete a new set to refresh your estimate.' : null,
    domains, accuracy,
    totalCataloguePairs: Object.values(catalogue || {}).reduce((sum, tags) => sum + tags.length, 0),
    explanation: READINESS_EXPLANATION,
  };
}
