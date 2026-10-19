import assert from 'node:assert/strict';
import { conceptRepairAnchors, effectiveMcqConceptTagIds } from '../src/lib/mcqConceptReview.js';
import { MCQ_TAGGING_VERSION } from '../src/data/sy0701ConceptTags.js';
import assignments from '../src/data/mcqConceptTagAssignments.json' with { type: 'json' };

const tagsById = new Map(assignments.assignments.map(row => [row.questionId, row.conceptTagIds]));
const entry = id => ({ question: { id, conceptTagIds: tagsById.get(id) || [] } });
const ranked = [entry('m088'), entry('m002'), entry('m032'), entry('m635')];
const missed = new Map([['m032', { correct: false }]]);

assert.deepEqual(effectiveMcqConceptTagIds({ id: 'm032' }, tagsById.get('m032'), MCQ_TAGGING_VERSION), tagsById.get('m032'));
assert.deepEqual(effectiveMcqConceptTagIds({ id: 'm032', conceptTagIds: ['recovery.rto'] }, tagsById.get('m032'), MCQ_TAGGING_VERSION), tagsById.get('m032'));
assert.deepEqual(effectiveMcqConceptTagIds({ id: 'm032', conceptTagIds: [], taggingVersion: MCQ_TAGGING_VERSION }, tagsById.get('m032'), MCQ_TAGGING_VERSION), []);
assert.deepEqual(effectiveMcqConceptTagIds({ id: 'm032', conceptTagIds: ['unknown.tag', 'risk.bia-rto-rpo'], taggingVersion: MCQ_TAGGING_VERSION }, tagsById.get('m032'), MCQ_TAGGING_VERSION), ['risk.bia-rto-rpo']);
assert.deepEqual(conceptRepairAnchors(ranked, missed, 10).map(item => item.question.id), ['m088', 'm032', 'm635']);
assert.deepEqual(conceptRepairAnchors(ranked, missed, 1).map(item => item.question.id), ['m088']);
assert.deepEqual(conceptRepairAnchors(ranked, missed, 2).map(item => item.question.id), ['m088', 'm032']);
assert.deepEqual(conceptRepairAnchors(ranked, missed, 3).map(item => item.question.id), ['m088', 'm032', 'm635']);
assert.deepEqual(conceptRepairAnchors(ranked, new Map([['m032', { correct: true }]]), 10), []);
assert.deepEqual(conceptRepairAnchors(ranked, new Map([['p003', { correct: false, pbq: true }]]), 10), []);
assert(!conceptRepairAnchors(ranked, missed, 10).some(item => item.question.id === 'm002'));

console.log('Smart Review exact-tag MCQ repair passed; no related-concept selection.');
