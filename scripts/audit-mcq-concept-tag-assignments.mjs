import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readLearningPilotBank, contentSignature } from './lib/read-learning-pilot-bank.mjs';
import { publicationPipeline } from './lib/content-mapping/publication.mjs';
import { CONCEPT_TAGS } from '../src/data/sy0701ConceptWeb.js';
import tagged from '../src/data/mcqConceptTagAssignments.json' with { type: 'json' };

assert.equal(tagged.status, 'mixed_owner_approved_and_codex_tagged_mcq_metadata');
assert.match(tagged.draftSha256, /^[0-9a-f]{64}$/);
const proof = JSON.parse(readFileSync('docs/evidence/phase-2b5/private-catalogue-read.json'));
const reconciliation = JSON.parse(readFileSync('docs/evidence/phase-2b5/private-reconciliation.json'));
const safeOverrides = proof.overrides.filter(row => reconciliation.overrides.some(x =>
  x.id === row.question_id && x.kind === row.question_kind && x.capturedSignatureMatches && x.payloadMatches));
const questions = publicationPipeline(readLearningPilotBank()).overrides(safeOverrides).mcqs;
const byQuestion = new Map(questions.map(question => [question.id, question]));
const knownTags = new Set(CONCEPT_TAGS.map(tag => tag.id));
assert.equal(questions.length, 395);
assert.equal(tagged.assignments.length, 395);
assert.equal(new Set(tagged.assignments.map(row => row.questionId)).size, 395);
assert.deepEqual(new Set(tagged.assignments.map(row => row.questionId)), new Set(questions.map(row => row.id)));
assert.equal(tagged.assignments.reduce((n, row) => n + row.conceptTagIds.length, 0), tagged.tagAssignments);
assert.equal(tagged.assignments.filter(row => row.reviewStatus === 'owner_approved').length, 120);
assert.equal(tagged.assignments.filter(row => row.reviewStatus === 'codex_tagged_pending_owner_review').length, 275);
for (const row of tagged.assignments) {
  assert(row.questionId.startsWith('m'));
  assert.equal(row.sourceSignature, contentSignature(byQuestion.get(row.questionId)));
  assert(row.conceptTagIds.length > 0 && row.conceptTagIds.every(id => knownTags.has(id)));
  assert.equal(new Set(row.conceptTagIds).size, row.conceptTagIds.length);
}
console.log(`PASS: 395/395 source-bound MCQs, ${tagged.tagAssignments} tags; 120 owner-approved, 275 Codex-tagged pending review; PBQs excluded.`);
