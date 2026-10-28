import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeSmartReview } from '../src/lib/smartReviewSummary.js';

const bank = [
  { id: 'q1', concept_tag: 'att.phishing', ch: '2' },
  { id: 'q2', concept_tag: 'cry.pki-ca', ch: '1' },
];

test('due, cooling, next retest and weakest concept come from engine state', () => {
  const engineState = {
    failed: [
      { question_id: 'q1', cooldown_counter: 0 },
      { question_id: 'q2', cooldown_counter: 7 },
      { question_id: 'q3', cooldown_counter: 30 },
    ],
    mastery: [
      { concept_tag: 'att.phishing', score: 15 },
      { concept_tag: 'cry.pki-ca', score: 70 },
      { concept_tag: 'sec.cia-triad', score: 90 },
    ],
  };
  const result = summarizeSmartReview({ engineState, bank });
  assert.equal(result.available, true);
  assert.equal(result.due, 1);
  assert.equal(result.coolingDown, 2);
  assert.equal(result.nextRetestIn, 7); // smallest cooldown among cooling-down questions
  assert.equal(result.conceptsToReview, 2);
  assert.deepEqual(result.weakest, { tag: 'att.phishing', score: 15, domain: '2' });
});

test('no cooling-down questions means no next-retest figure, not zero', () => {
  const result = summarizeSmartReview({ engineState: { failed: [{ question_id: 'q1', cooldown_counter: 0 }], mastery: [] }, bank });
  assert.equal(result.nextRetestIn, null);
  assert.equal(result.due, 1);
});

test('guests and local users get rules but no invented live figures', () => {
  const result = summarizeSmartReview({ engineState: null, bank });
  assert.equal(result.available, false);
  assert.equal(result.due, 0);
  assert.equal(result.nextRetestIn, null);
  assert.equal(result.weakest, null);
  assert.ok(result.rules.length >= 4);
});
