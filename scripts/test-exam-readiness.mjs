import test from 'node:test';
import assert from 'node:assert/strict';
import { localReadinessEvidence, summarizeReadiness } from '../src/lib/examReadiness.js';
import { READINESS_CONCEPT_CATALOGUE } from '../src/data/readinessConceptCatalogue.js';

const event = (conceptTag, correct, extra = {}) => ({ conceptTag, correct, ch: '1', readinessSource: 'mcq-set', ...extra });
const NOW = Date.parse('2026-10-28T00:00:00.000Z');

test('no evidence gives no estimate, not a baseline score', () => {
  const profile = summarizeReadiness();
  assert.equal(profile.score, null);
  assert.equal(profile.level, 'No estimate yet');
  assert.equal(profile.confidence, 'none');
  assert.equal(profile.attempted, 0);
});

test('production catalogue: two strong concepts do not make a learner exam-ready', () => {
  // Domain 1: (100 + 32*50) / 33 = 51.5; Domain 2: (60 + 43*50) / 44 = 50.2;
  // other domains stay at 50. Weighted: 50.2, well below the old attempted-only 80.
  const profile = summarizeReadiness({ concepts: [{ tag: 'att.pwd-rainbow', score: 100, chapter: '1' }, { tag: 'arch.api-security', score: 60, chapter: '2' }] });
  assert.equal(profile.score, 50.2);
  assert.equal(profile.level, 'Growing confidence');
  assert.equal(profile.confidence, 'low');
  assert.equal(profile.attempted, 2);
  assert.equal(profile.mastered, 1);
  assert.equal(profile.domains.find((d) => d.id === '1').mastery, 51.5);
  assert.equal(profile.domains.find((d) => d.id === '1').attempted, 1);
  assert.equal(profile.domains.find((d) => d.id === '1').total, 33);
});

test('small catalogue: weighted domain mastery reconciles to the headline', () => {
  const catalogue = { 1: ['a', 'b'], 2: ['c', 'd'], 3: [], 4: [], 5: [] };
  const profile = summarizeReadiness(
    { concepts: [{ tag: 'a', score: 100, chapter: '1' }, { tag: 'c', score: 60, chapter: '2' }] },
    { catalogue },
  );
  // Domains 1 and 2 only: (12*75 + 22*55) / (12 + 22) = 62.0 after flooring.
  assert.equal(profile.score, 62.0);
  assert.equal(profile.level, 'Growing confidence');
  const reconciled = (12 * 75 + 22 * 55) / 34;
  assert.ok(Math.abs(profile.score - reconciled) <= 1);
});

test('only MCQ-set and Exam evidence updates mastery and chapter accuracy', () => {
  const rows = [event('a', true), event('a', true), event('b', false, { ch: '2', readinessSource: 'exam' }),
    event('a', false, { readinessSource: 'daily-challenge' }), event('b', true, { readinessSource: 'diagnostic' }),
    event('a', false, { pbq: true }), event('c', true, { readinessSource: undefined }), event('d', false, { readinessSource: 'exam', selected: null }), event('', true)];
  const evidence = localReadinessEvidence(rows);
  const profile = summarizeReadiness(evidence);
  assert.equal(evidence.total, 3);
  assert.deepEqual(evidence.chapters, { 1: { total: 2, correct: 2 }, 2: { total: 1, correct: 0 } });
  assert.deepEqual(profile.byChapter, { 2: 1 });
  assert.equal(profile.mastered, 1);
  assert.equal(profile.accuracy, 67); // accuracy is separate from readiness
  assert.ok(profile.score < 60); // unattempted concepts at 50 pull readiness down
  assert.equal(profile.confidence, 'low');
});

test('chronological replay clamps scores and keeps unknown-chapter concepts out of domains', () => {
  const rows = [event('a', true, { createdAt: '2026-01-03' }), event('a', false, { createdAt: '2026-01-01' }), event('a', false, { createdAt: '2026-01-02' }), event('b', false, { ch: null })];
  const profile = summarizeReadiness(localReadinessEvidence(rows));
  assert.equal(profile.unclassifiedConcepts, 1);
  assert.deepEqual(profile.byChapter, { 1: 1 });
  assert.equal(profile.score, 49.8); // attempted concept at 20, rest of its domain at 50
  assert.equal(profile.level, 'Building foundations');
});

test('repeating the same question does not inflate readiness or confidence', () => {
  const rows = Array.from({ length: 20 }, () => event('a', true, { qid: 'q1', createdAt: '2026-10-01T00:00:00.000Z' }));
  const evidence = localReadinessEvidence(rows);
  const profile = summarizeReadiness(evidence, { now: NOW });
  assert.equal(evidence.distinctQuestions, 1);
  assert.equal(profile.confidence, 'low');
  assert.notEqual(profile.level, 'Exam ready');
  assert.ok(profile.score < 60);
});

test('exam-ready label is gated by confidence, not just by the score', () => {
  const catalogue = { 1: ['a'], 2: ['b'], 3: ['c'], 4: ['d'], 5: ['e'] };
  const concepts = ['a', 'b', 'c', 'd', 'e'].map((tag, i) => ({ tag, score: 90, chapter: String(i + 1) }));
  const low = summarizeReadiness({ concepts }, { catalogue });
  assert.equal(low.score, 90);
  assert.equal(low.level, 'Above 80 on early evidence');
  const mediumEvidence = {
    concepts, total: 60, distinctQuestions: 60, distinctQuestionsKnown: true, practiceDays: 2,
    firstPracticedAt: '2026-10-18T00:00:00.000Z', lastPracticedAt: '2026-10-27T00:00:00.000Z',
  };
  const medium = summarizeReadiness(mediumEvidence, { catalogue, now: NOW });
  assert.equal(medium.confidence, 'medium');
  assert.equal(medium.level, 'Exam ready');
  const highEvidence = { ...mediumEvidence, distinctQuestions: 160, total: 160, practiceDays: 3 };
  assert.equal(summarizeReadiness(highEvidence, { catalogue, now: NOW }).confidence, 'high');
});

test('stale estimates are flagged after 14 days without practice', () => {
  const catalogue = { 1: ['a'], 2: ['b'], 3: ['c'], 4: ['d'], 5: ['e'] };
  const concepts = ['a', 'b', 'c', 'd', 'e'].map((tag, i) => ({ tag, score: 90, chapter: String(i + 1) }));
  const profile = summarizeReadiness({
    concepts, total: 60, distinctQuestions: 60, distinctQuestionsKnown: true, practiceDays: 2,
    firstPracticedAt: '2026-09-01T00:00:00.000Z', lastPracticedAt: '2026-10-01T00:00:00.000Z',
  }, { catalogue, now: NOW });
  assert.equal(profile.stale, true);
  assert.match(profile.staleNote, /complete a new set/);
  const fresh = summarizeReadiness({
    concepts, total: 60, distinctQuestions: 60, distinctQuestionsKnown: true, practiceDays: 2,
    firstPracticedAt: '2026-10-18T00:00:00.000Z', lastPracticedAt: '2026-10-27T00:00:00.000Z',
  }, { catalogue, now: NOW });
  assert.equal(fresh.stale, false);
});

test('weakest concepts per domain are the lowest attempted scores', () => {
  const profile = summarizeReadiness({
    concepts: [
      { tag: 'a', score: 20, chapter: '1' }, { tag: 'b', score: 90, chapter: '1' }, { tag: 'c', score: 40, chapter: '1' },
    ],
  }, { catalogue: { 1: ['a', 'b', 'c'], 2: [], 3: [], 4: [], 5: [] } });
  assert.deepEqual(profile.domains.find((d) => d.id === '1').weakest, [{ tag: 'a', score: 20 }, { tag: 'c', score: 40 }]);
});

test('readiness catalogue covers all five domains from the bank', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(READINESS_CONCEPT_CATALOGUE).map(([d, tags]) => [d, tags.length])),
    { 1: 33, 2: 44, 3: 29, 4: 46, 5: 19 },
  );
  assert.equal(Object.values(READINESS_CONCEPT_CATALOGUE).flat().length, 171);
});
