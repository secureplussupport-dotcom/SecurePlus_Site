import assert from 'node:assert/strict';
import { previewInspection } from './lib/mcq-preview-inspection.mjs';

const state = { mastery: [{ concept_tag: 'risk.bia-rto-rpo', score: 15 }], failed: [], history: [{ question_id: 'm032' }] };
const plan = { questions: [1, 2, 3].map((deck, index) => ({ id: index ? `m00${index}` : 'm032', deck, concept_tag: 'risk.bia-rto-rpo', explanation: 'private explanation', options: [{ is_correct: true, text: 'private option' }] })) };
const inspection = previewInspection(state, plan);
assert.deepEqual(inspection.questions.map(q => q.deck), ['Retest', 'Remediation', 'Discovery']);
assert.equal(inspection.questions[0].primaryTag, 'risk.bia-rto-rpo');
assert(Array.isArray(inspection.questions[0].secondaryTags));
assert.equal(inspection.mastery[0].score, 15);
assert(!JSON.stringify(inspection).includes('private'));
assert(!JSON.stringify(inspection).includes('is_correct'));
assert(!Object.hasOwn(previewInspection(state), 'questions'));
console.log('PASS preview: actual deck labels and tag roles, current scores, no answer keys.');
