import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readLearningPilotBank, contentSignature } from './lib/read-learning-pilot-bank.mjs';
import { publicationPipeline } from './lib/content-mapping/publication.mjs';
import { CONCEPT_TAGS } from '../src/data/sy0701ConceptWeb.js';
import approved from '../src/data/mcqConceptTagAssignments.json' with { type: 'json' };

assert.equal(approved.status, 'owner_approved_for_mcq_tag_metadata');
assert.match(approved.draftSha256, /^[0-9a-f]{64}$/);
const proof = JSON.parse(readFileSync('docs/evidence/phase-2b5/private-catalogue-read.json'));
const reconciliation = JSON.parse(readFileSync('docs/evidence/phase-2b5/private-reconciliation.json'));
const safeOverrides = proof.overrides.filter(row => reconciliation.overrides.some(x =>
  x.id === row.question_id && x.kind === row.question_kind && x.capturedSignatureMatches && x.payloadMatches));
const questions = publicationPipeline(readLearningPilotBank()).overrides(safeOverrides).mcqs;
const byQuestion = new Map(questions.map(question => [question.id, question]));
const knownTags = new Set(CONCEPT_TAGS.map(tag => tag.id));
assert.equal(questions.length, 395);
assert.equal(approved.assignments.length, 120);
assert.equal(new Set(approved.assignments.map(row => row.questionId)).size, 120);
assert.equal(approved.assignments.reduce((n, row) => n + row.conceptTagIds.length, 0), 138);
for (const row of approved.assignments) {
  assert(row.questionId.startsWith('m'));
  assert.equal(row.sourceSignature, contentSignature(byQuestion.get(row.questionId)));
  assert(row.conceptTagIds.length > 0 && row.conceptTagIds.every(id => knownTags.has(id)));
}
console.log('PASS: 120 owner-approved MCQs, 138 source-bound tags; 275 missing-tag MCQs and all PBQs excluded.');
