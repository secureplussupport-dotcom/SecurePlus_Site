import assert from 'node:assert/strict';
import { readLearningPilotBank } from './lib/read-learning-pilot-bank.mjs';
import { publicationPipeline } from './lib/content-mapping/publication.mjs';
import { CONCEPT_TAGS } from '../src/data/sy0701ConceptTags.js';
import tagged from '../src/data/mcqConceptTagAssignments.json' with { type: 'json' };

const questions = publicationPipeline(readLearningPilotBank()).overrides([]).mcqs;
const bankIds = new Set(questions.map(row => row.id));
const knownTags = new Set(CONCEPT_TAGS.map(tag => tag.id));
assert.equal(tagged.version, 'gemini-mcq-tags-2026-10-20');
assert.match(tagged.sourceSha256, /^[0-9a-f]{64}$/);
assert.equal(questions.length, 395);
assert.equal(tagged.questionCount, 395);
assert.equal(tagged.tagCount, 170);
assert.equal(tagged.assignments.length, 395);
assert.equal(new Set(tagged.assignments.map(row => row.questionId)).size, 395);
assert.deepEqual(new Set(tagged.assignments.map(row => row.questionId)), bankIds);

for (const row of tagged.assignments) {
  assert.match(row.questionId, /^m\d+$/);
  assert(knownTags.has(row.primaryTagId));
  assert(row.secondaryTagIds.every(id => knownTags.has(id)));
  assert(row.distractorTagIds.every(id => knownTags.has(id)));
  assert.deepEqual(row.conceptTagIds, [...new Set([row.primaryTagId, ...row.secondaryTagIds])]);
  assert.equal(new Set(row.conceptTagIds).size, row.conceptTagIds.length);
  assert(['Recall', 'Application', 'Analysis'].includes(row.cognitiveLevel));
  assert(Number.isFinite(row.difficultyWeight) && row.difficultyWeight >= 1 && row.difficultyWeight <= 1.7);
}

const tagCounts = new Map();
for (const row of tagged.assignments) for (const id of row.conceptTagIds) tagCounts.set(id, (tagCounts.get(id) || 0) + 1);
assert.equal(tagCounts.size, 155);
assert(tagged.assignments.every(row => row.conceptTagIds.some(id => tagCounts.get(id) > 1)), 'Every MCQ needs a same-tag alternative');
assert(!tagged.assignments.some(row => row.questionId.startsWith('p')), 'PBQs cannot receive MCQ tags');

console.log(`PASS: ${tagged.questionCount}/395 MCQs, ${tagged.tagCount} Gemini tags; distractors excluded from mastery; PBQs excluded.`);
