import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gradePilotCheck } from '../src/pilots/sec01/checks.js';

const lesson = JSON.parse(readFileSync('src/pilots/sec01/lesson.json', 'utf8'));
const vocabulary = JSON.parse(readFileSync('src/data/mcqConceptTagVocabulary.json', 'utf8'));
test('SEC-01 keeps the proposed three concepts and one check per concept', () => {
  assert.equal(lesson.lesson_id, 'SEC-01');
  assert.equal(lesson.pilot_only, true);
  assert.deepEqual(lesson.mapped_tags, ['sec.cia-triad', 'sec.non-repudiation', 'sec.defense-in-depth']);
  assert(lesson.mapped_tags.every(tag => vocabulary.includes(tag)));
  assert.deepEqual(lesson.content.micro_checks.map(check => check.target_tag), lesson.mapped_tags);
  assert.equal(new Set(lesson.content.micro_checks.map(check => check.check_id)).size, 3);
  assert.deepEqual(lesson.content.micro_checks.map(check => check.correct_index), [1, 2, 1]);
});
test('micro-check feedback grades every choice correctly and rejects invalid choices', () => {
  for (const check of lesson.content.micro_checks) {
    assert.equal(new Set(check.options).size, 4);
    assert(check.explanation.length > 50);
    check.options.forEach((_, choice) => assert.equal(gradePilotCheck(check, choice), choice === check.correct_index));
    for (const invalid of [-1, 4, 0.5, NaN, null, undefined, '1']) {
      assert.throws(() => gradePilotCheck(check, invalid), RangeError);
    }
  }
});
