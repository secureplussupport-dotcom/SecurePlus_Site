import assert from 'node:assert/strict';
import { conceptRepairAnchors, effectiveMcqConceptTagIds } from '../src/lib/mcqConceptReview.js';
import assignments from '../src/data/mcqConceptTagAssignments.json' with { type: 'json' };

const tagsById = new Map(assignments.assignments.map(row => [row.questionId, row.conceptTagIds]));
const entry = id => ({ question: { id, conceptTagIds: tagsById.get(id) || [] } });
const ranked = [
  entry('m088'),
  entry('m032'),
  entry('m635'),
];
assert.ok(tagsById.get('m032').includes('recovery.rto'));
assert.ok(tagsById.get('m635').includes('recovery.rto'));
assert.ok(tagsById.get('m088').includes('recovery.rpo'));
assert.deepEqual(effectiveMcqConceptTagIds({ id: 'm032' }, tagsById.get('m032')), tagsById.get('m032'));
assert.deepEqual(effectiveMcqConceptTagIds({ id: 'm032', conceptTagIds: [] }, tagsById.get('m032')), []);
const missedRto = new Map([['m032', { correct: false }]]);

assert.deepEqual(conceptRepairAnchors(ranked, missedRto, 10).map(item => item.question.id), ['m635', 'm032', 'm088']);
assert.deepEqual(conceptRepairAnchors(ranked, missedRto, 1).map(item => item.question.id), ['m635']);
assert.deepEqual(conceptRepairAnchors(ranked, missedRto, 2).map(item => item.question.id), ['m635', 'm032']);
assert.deepEqual(conceptRepairAnchors(ranked.filter(item => item.question.id !== 'm635'), missedRto, 10).map(item => item.question.id), ['m032', 'm088']);
assert.deepEqual(conceptRepairAnchors(ranked, new Map([['m032', { correct: true }]]), 10), []);
assert.deepEqual(conceptRepairAnchors(ranked, new Map([['p003', { correct: false, pbq: true }]]), 10), []);

console.log('Smart Review MCQ concept repair passed.');
