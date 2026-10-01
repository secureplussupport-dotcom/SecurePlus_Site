import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { QUESTION_MAPPINGS } from '../src/data/learningMappings.js';
import { calculateConceptMastery } from '../src/lib/conceptMastery.js';
import { versions } from '../src/lib/learningConfig.js';
import { validateVersionId, validateConceptId, qualifiedTimestamp, validateVersions, validateSessionManifest, validateStableSelections, validateClientEvidence, validateInterventionEvent, validateReviewTask, validateProjection, classifyRetry, canonicalPayload, prepareReplayEvidence } from '../src/lib/learningPersistenceContracts.js';
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const v = versions(), ownerId = id(1), conceptId = 'recovery.rto';
const context = {
  authenticatedOwnerId: ownerId, receivedAt: '2026-10-01T12:01:00Z', inputGeneration: 1, completeEvidenceFrom: '2026-10-01T12:00:00Z',
  catalog: {
    versions: Object.entries(v).map(([key, value]) => ({ id: value, kind: key.replace('Version', ''), reviewStatus: 'human_approved', active: true })),
    versionSets: [v], concepts: [{ id: conceptId, mappingVersion: v.mappingVersion, nodeKind: 'mastery_concept', reviewStatus: 'human_approved' }],
    revisions: [10, 11, 12].map((n, i) => ({ revisionId: id(n), questionId: `m00${i + 1}`, questionType: 'mcq', active: true, scenarioFamily: `scenario-${i}`,
      components: [{ id: 'option-a', kind: 'option' }, { id: 'option-b', kind: 'option' }], mappings: { [v.mappingVersion]: [{ conceptId, role: 'primary', precision: 'direct', reviewStatus: 'human_approved' }] } })),
  }, sessions: [], recommendations: [], evidence: [], tasks: [],
};
const session = { ownerId, sessionId: id(2), setIndex: 1, source: 'practice', mode: 'normal', seed: 'deterministic', requestedCount: 1, actualCount: 1, requestedPbqCount: 0, actualPbqCount: 0, startedAt: '2026-10-01T12:00:00Z', items: [{ position: 1, revisionId: id(10) }], ...v };
context.sessions.push(session);
const answer = { clientEventId: id(3), sessionId: id(2), itemPosition: 1, revisionId: id(10), selectedComponents: [{ componentId: 'option-b', valueId: 'option-b' }], occurredAt: '2026-10-01T12:00:30Z', responseDurationMs: 20000 };
const evidence = { ...v, ownerId, evidenceId: id(4), revisionId: id(10), questionId: 'm001', scenarioFamily: 'scenario-0', provenance: 'complete', evidencePrecision: 'direct', conceptSnapshot: [{ conceptId, role: 'primary' }], occurredAt: answer.occurredAt, setIndex: 1, receiptIndex: 1, correct: false, supersedesEvidenceId: null };
context.evidence.push(evidence);
const recommendation = { ownerId, recommendationId: id(5), createdAt: '2026-10-01T12:00:31Z', allowedActivities: ['lesson_open', 'lesson_steps'] };
context.recommendations.push(recommendation);
const intervention = { clientEventId: id(6), recommendationId: id(5), eventType: 'completed', activityType: 'lesson_steps', occurredAt: '2026-10-01T12:00:50Z' };
const task = { ownerId, taskId: id(7), schedulingKey: 'miss:4:transfer:v1', conceptId, sourceEvidenceId: id(4), targetRevisionId: id(11), taskType: 'transfer', reasonCodes: ['fresh_transfer'], eligibleAt: '2026-10-02T12:00:30Z', eligibleSetIndex: 2, initialStatus: 'pending', ...v };
const projection = { ownerId, conceptId, state: 'learning_signal', evidenceLevel: 'limited', effectiveSample: 1, distinctQuestions: 1, distinctScenarios: 1, completeEvidenceCount: 1, everSticky: false, lapseCount: 0, unresolvedEvidenceIds: [id(4)], lastAnswerAt: answer.occurredAt, lastInterventionAt: null, provenAt: null, masteredAt: null, nextDueTaskId: null, inputGeneration: 1, receiptWatermark: 1, replayFrom: context.completeEvidenceFrom, inputSha256: 'a'.repeat(64), projectionStatus: 'ready', recomputedAt: context.receivedAt, ...v };
let count = 0;
function test(name, run) { run(); count++; console.log(`PASS ${name}`); }
const rejects = fn => assert.throws(fn);
test('Phase 2A identifiers are representable', () => { Object.values(v).forEach(validateVersionId); validateConceptId(conceptId); });
test('Invalid version and concept IDs fail', () => { ['', 'x', 'with spaces', '../v1'].forEach(x => rejects(() => validateVersionId(x))); ['rto', '.rto', 'RTO.recovery'].forEach(x => rejects(() => validateConceptId(x))); });
test('Unknown, wrong-kind, inactive, unapproved versions fail production gate', () => {
  validateVersions(v, context);
  for (const key of Object.keys(v)) rejects(() => validateVersions({ ...v, [key]: 'unknown-v1' }, context));
  for (const change of [{ active: false }, { reviewStatus: 'agent_reviewed_pending_human' }, { kind: 'mapping' }]) {
    const c = structuredClone(context); Object.assign(c.catalog.versions[0], change); rejects(() => validateVersions(v, c));
  }
  const c = structuredClone(context); c.catalog.versions.forEach(x => x.reviewStatus = 'agent_reviewed_pending_human');
  validateVersions(v, { ...c, allowProvisional: true });
});
test('Qualified timestamps reject normalization traps, unqualified dates and bad offsets', () => {
  assert.equal(qualifiedTimestamp('2026-10-01T20:00:00+08:00'), qualifiedTimestamp('2026-10-01T12:00:00Z'));
  for (const time of ['2026-02-30T12:00:00Z', '2026-10-01T24:00:00Z', '2026-10-01T12:00:00+14:01', '2026-10-01 12:00:00', 123, '2026-10-01']) rejects(() => qualifiedTimestamp(time));
});
test('Valid server session manifest and immutable input', () => { const before = canonicalPayload(session); validateSessionManifest(session, context); assert.equal(canonicalPayload(session), before); });
test('Manifest ownership, counts, positions, revisions and ordering reject invalid data', () => {
  for (const change of [{ ownerId: id(9) }, { setIndex: 0 }, { actualCount: 501 }, { requestedPbqCount: -1 }, { actualPbqCount: 1 }, { items: [] }, { items: [{ position: 2, revisionId: id(10) }] }, { items: [{ position: 1, revisionId: id(99) }] }]) rejects(() => validateSessionManifest({ ...session, ...change }, context));
});
test('Stable selections survive display shuffling', () => {
  const a = validateClientEvidence(answer, context), c = structuredClone(context); c.catalog.revisions[0].components.reverse();
  assert.deepEqual(validateClientEvidence(answer, c), a);
  rejects(() => validateStableSelections([{ componentId: 1, valueId: 1 }], c.catalog.revisions[0]));
  rejects(() => validateStableSelections([{ componentId: 'option-a', valueId: 'option-b' }], c.catalog.revisions[0]));
});
test('PBQ identities preserved without granting concept precision', () => {
  const r = { questionType: 'pbq', components: [{ id: 'blank:1', kind: 'blank' }, { id: 'choice:rto', kind: 'choice' }] };
  assert.equal(validateStableSelections([{ componentId: 'blank:1', valueId: 'choice:rto' }], r).length, 1);
  rejects(() => validateStableSelections([{ componentId: 'blank:1', valueId: 'unknown' }], r));
});
test('Client authority injection fails for every trusted field', () => {
  for (const key of ['ownerId', 'correct', 'score', 'setIndex', 'masteryState', 'conceptSnapshot', 'conceptRoles', 'mappingVersion', 'classification', 'rewards', 'receivedAt', 'allowProvisional']) rejects(() => validateClientEvidence({ ...answer, [key]: true }, context));
});
test('Unknown, unowned and mismatched sessions/revisions fail', () => {
  for (const change of [{ sessionId: id(99) }, { revisionId: id(11) }, { itemPosition: 2 }]) rejects(() => validateClientEvidence({ ...answer, ...change }, context));
  rejects(() => validateClientEvidence(answer, { ...context, authenticatedOwnerId: id(9) }));
});
test('Durations and future dates are bounded', () => {
  for (const change of [{ responseDurationMs: -1 }, { responseDurationMs: 1.5 }, { responseDurationMs: 31000 }, { responseDurationMs: Infinity }, { occurredAt: '2026-10-01T13:00:00Z' }]) rejects(() => validateClientEvidence({ ...answer, ...change }, context));
});
test('Historical retries remain valid after catalogue deactivation', () => {
  const c = structuredClone(context); c.catalog.versions.forEach(v => v.active = false); c.catalog.revisions[0].active = false;
  validateClientEvidence(answer, c); rejects(() => validateSessionManifest(session, c));
});
test('Retry returns existing identity; changed answer conflicts; canonical key order is stable', () => {
  const normalized = validateClientEvidence(answer, context);
  const old = { ownerId, clientEventId: answer.clientEventId, canonicalPayload: canonicalPayload(normalized) };
  assert.equal(classifyRetry(null, normalized, context), 'insert');
  assert.equal(classifyRetry(old, normalized, context), 'retry');
  const reordered = Object.fromEntries(Object.entries(normalized).reverse()); assert.equal(canonicalPayload(normalized), canonicalPayload(reordered));
  rejects(() => classifyRetry(old, { ...normalized, responseDurationMs: 19000 }, context));
  rejects(() => classifyRetry({ ...old, ownerId: id(9) }, normalized, context));
});
test('Intervention completion claims cannot supply verification, criteria or proof', () => {
  validateInterventionEvent(intervention, context);
  for (const key of ['completionVerified', 'completionCriteria', 'ownerId', 'conceptId', 'masteryState']) rejects(() => validateInterventionEvent({ ...intervention, [key]: true }, context));
  rejects(() => validateInterventionEvent({ ...intervention, activityType: 'flashcard_review' }, context));
});
test('Tasks preserve both time and set gates and source ownership', () => {
  validateReviewTask(task, context); assert.equal(task.eligibleSetIndex, 2);
  rejects(() => validateReviewTask({ ...task, eligibleSetIndex: 0 }, context));
  rejects(() => validateReviewTask({ ...task, sourceEvidenceId: id(99) }, context));
  rejects(() => validateReviewTask({ ...task, targetRevisionId: id(10) }, context));
});
test('Insufficient coverage remains unavailable; original recall is exact revision', () => {
  validateReviewTask({ ...task, taskType: 'insufficient_variant_coverage', targetRevisionId: null, initialStatus: 'unavailable' }, context);
  rejects(() => validateReviewTask({ ...task, taskType: 'insufficient_variant_coverage' }, context));
  validateReviewTask({ ...task, taskType: 'original_recall', targetRevisionId: id(10) }, context);
});
test('Projection counts, generation, contradictions and support-only nodes are checked', () => {
  validateProjection(projection, context);
  for (const change of [{ inputGeneration: 0 }, { completeEvidenceCount: 0 }, { unresolvedEvidenceIds: [id(99)] }, { distinctScenarios: 2 }, { nextDueTaskId: id(99) }]) rejects(() => validateProjection({ ...projection, ...change }, context));
  const c = structuredClone(context); c.catalog.concepts[0].nodeKind = 'topic'; rejects(() => validateProjection(projection, c));
});
test('Legacy-only records cannot establish proven/mastered; missing boundary excludes proof', () => {
  const legacy = { ...context, evidence: [{ ...evidence, provenance: 'legacy_inferred' }] };
  for (const state of ['proven', 'mastered']) rejects(() => validateProjection({ ...projection, state, evidenceLevel: state === 'proven' ? 'retained' : 'spaced', completeEvidenceCount: 0, unresolvedEvidenceIds: [], provenAt: answer.occurredAt }, legacy));
  assert.deepEqual(prepareReplayEvidence(context.evidence, { ...context, completeEvidenceFrom: null }), []);
});
test('Late arrivals reorder replay; corrections supersede and coarse/foreign evidence stays excluded', () => {
  const later = { ...evidence, evidenceId: id(20), occurredAt: '2026-10-01T12:00:40Z', setIndex: 2 };
  const correction = { ...evidence, evidenceId: id(21), supersedesEvidenceId: evidence.evidenceId, correct: true };
  const rows = [later, evidence, correction, { ...evidence, evidenceId: id(22), provenance: 'legacy_inferred' }, { ...evidence, evidenceId: id(23), evidencePrecision: 'coarse' }, { ...evidence, ownerId: id(9) }];
  const replay = prepareReplayEvidence(rows, context);
  assert.deepEqual(replay.map(e => e.evidenceId), [id(21), id(20)]);
  assert.deepEqual(prepareReplayEvidence([...rows].reverse(), context), replay);
});
test('Actual Phase 2A calculator rebuilds identical state from reordered complete history', () => {
  const raw = ['m032', 'm088'].map((questionId, index) => ({
    eventId: id(30 + index), kind: 'answer', questionId,
    questionRevision: QUESTION_MAPPINGS.find(m => m.questionId === questionId).questionRevision,
    correct: false, occurredAt: `2026-10-0${index + 1}T12:00:00Z`, setIndex: index + 1,
  }));
  const a = calculateConceptMastery(raw, { now: '2026-10-03T12:00:00Z' });
  assert.deepEqual(calculateConceptMastery([...raw].reverse(), { now: '2026-10-03T12:00:00Z' }), a);
  assert.ok(a.evidence.length === 2);
});
console.log(`${count} persistence contract scenarios passed. Canonical fixture SHA256: ${createHash('sha256').update(canonicalPayload(answer)).digest('hex')}`);
