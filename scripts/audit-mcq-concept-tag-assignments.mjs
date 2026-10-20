import assert from 'node:assert/strict';
import { readLearningPilotBank } from './lib/read-learning-pilot-bank.mjs';
import { publicationPipeline } from './lib/content-mapping/publication.mjs';
import { CONCEPT_TAGS } from '../src/data/sy0701ConceptTags.js';
import { normalizeMcqDifficulty } from '../src/lib/mcqDifficulty.js';
import tagged from '../src/data/mcqConceptTagAssignments.json' with { type: 'json' };
import ownerRetag from '../docs/question-bank/owner-primary-retag-m001-m100.json' with { type: 'json' };

const questions = publicationPipeline(readLearningPilotBank()).overrides([]).mcqs;
const bankIds = new Set(questions.map(row => row.id));
const bankById = new Map(questions.map(row => [row.id, row]));
const knownTags = new Set(CONCEPT_TAGS.map(tag => tag.id));
assert.equal(tagged.version, 'gemini-mcq-tags-2026-10-20');
assert.match(tagged.sourceSha256, /^[0-9a-f]{64}$/);
assert.equal(questions.length, 395);
assert.equal(tagged.questionCount, 395);
assert.equal(tagged.tagCount, 170);
assert.equal(tagged.assignments.length, 395);
assert.equal(new Set(tagged.assignments.map(row => row.questionId)).size, 395);
assert.deepEqual(new Set(tagged.assignments.map(row => row.questionId)), bankIds);
assert.equal(ownerRetag.questionCount, 100);
assert.match(ownerRetag.sourceSha256, /^[0-9a-f]{64}$/);
assert.deepEqual(ownerRetag.assignments.map(row => row.questionId), Array.from({ length: 100 }, (_, index) => `m${String(index + 1).padStart(3, '0')}`));
const retagById = new Map(ownerRetag.assignments.map(row => [row.questionId, row]));
for (const row of ownerRetag.assignments) {
  const question = bankById.get(row.questionId);
  assert(question, `${row.questionId}: original MCQ exists`);
  assert.equal(row.chapter, question.ch);
  assert.equal(row.topic, question.topic);
  assert.equal(row.suppliedDifficulty, normalizeMcqDifficulty(question.difficulty));
  assert(knownTags.has(row.primaryTagId));
}

for (const row of tagged.assignments) {
  assert.match(row.questionId, /^m\d+$/);
  assert(knownTags.has(row.primaryTagId));
  assert(row.secondaryTagIds.every(id => knownTags.has(id)));
  assert(row.distractorTagIds.every(id => knownTags.has(id)));
  assert.deepEqual(row.conceptTagIds, [...new Set([row.primaryTagId, ...row.secondaryTagIds])]);
  assert.equal(new Set(row.conceptTagIds).size, row.conceptTagIds.length);
  assert(['Recall', 'Application', 'Analysis'].includes(row.cognitiveLevel));
  assert(Number.isFinite(row.difficultyWeight) && row.difficultyWeight >= 1 && row.difficultyWeight <= 1.7);
  const retag = retagById.get(row.questionId);
  if (retag) {
    assert.equal(row.primaryTagId, retag.primaryTagId, `${row.questionId}: owner primary tag`);
    assert.deepEqual(row.secondaryTagIds, [], `${row.questionId}: no secondary mastery tags`);
    assert.deepEqual(row.conceptTagIds, [retag.primaryTagId], `${row.questionId}: one counted tag`);
  }
}

const tagCounts = new Map();
for (const row of tagged.assignments) for (const id of row.conceptTagIds) tagCounts.set(id, (tagCounts.get(id) || 0) + 1);
assert(tagCounts.size > 0);
assert(!tagged.assignments.some(row => row.questionId.startsWith('p')), 'PBQs cannot receive MCQ tags');

console.log(`PASS: ${tagged.questionCount}/395 MCQs; ${ownerRetag.questionCount} owner-retagged with one primary tag; distractors excluded from mastery; PBQs excluded.`);
