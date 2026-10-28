import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFirstSteps, recordFirstStep } from '../src/lib/firstSteps.js';

test('new learner has three undone steps and a next step', () => {
  const result = computeFirstSteps({});
  assert.equal(result.allDone, false);
  assert.equal(result.doneCount, 0);
  assert.equal(result.nextStep.id, 'mcq-set');
});

test('recorded steps and existing evidence both count, and the card disappears when all are done', () => {
  const recorded = recordFirstStep(recordFirstStep({}, 'mcq-set'), 'deck');
  const result = computeFirstSteps({ record: recorded, hasLessonCompletion: true });
  assert.equal(result.allDone, true);
  assert.deepEqual(result.steps.map((s) => s.done), [true, true, true]);
  // Existing evidence alone (e.g. a lesson completed before this feature) also clears that step.
  const existing = computeFirstSteps({ hasMcqAttempt: true, hasLessonCompletion: true, hasDeckActivity: true });
  assert.equal(existing.allDone, true);
});

test('recording is idempotent and rejects unknown steps', () => {
  const once = recordFirstStep({}, 'lesson');
  assert.deepEqual(recordFirstStep(once, 'lesson'), once);
  assert.deepEqual(recordFirstStep({}, 'unknown'), {});
});
