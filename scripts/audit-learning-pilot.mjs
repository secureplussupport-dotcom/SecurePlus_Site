import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readLearningPilotBank, contentSignature } from './lib/read-learning-pilot-bank.mjs';
import { LEARNING_CONCEPTS, SUPPORT_NODES, CONCEPT_RELATIONSHIPS, MAPPING_VERSION } from '../src/data/learningConcepts.js';
import { QUESTION_MAPPINGS, CONTENT_MAPPINGS } from '../src/data/learningMappings.js';
import { LEARNING_CONFIG, versions } from '../src/lib/learningConfig.js';
import { normalizeLearningEvidence } from '../src/lib/learningEvidence.js';
import { calculateConceptMastery } from '../src/lib/conceptMastery.js';
import { scheduleConceptReview } from '../src/lib/reviewScheduler.js';
import { SY0701_ACRONYM_CARDS } from '../src/data/sy0701AcronymFlashcards.js';
import { CONCEPT_DEEP_DIVES } from '../src/data/conceptDeepDives.js';
import { SY0701_OBJECTIVES } from '../src/data/sy0701DeepDiveMap.js';

const { mcqs, pbqs } = readLearningPilotBank();
const active = new Map([...mcqs, ...pbqs].map(q => [q.id, q]));
const conceptIds = new Set(LEARNING_CONCEPTS.map(c => c.id));
const graphIds = new Set([...conceptIds, ...SUPPORT_NODES.map(n => n.id)]);
assert.equal(conceptIds.size, 5);
assert.equal(new Set(QUESTION_MAPPINGS.map(m => m.questionId)).size, QUESTION_MAPPINGS.length);
for (const c of LEARNING_CONCEPTS) {
  assert(c.description && c.name && c.topicId && c.chapterId && c.editorialStatus);
  assert.equal(c.mappingVersion, MAPPING_VERSION);
  c.objectiveCodes.forEach(code => assert(SY0701_OBJECTIVES[code]));
}
for (const e of CONCEPT_RELATIONSHIPS) {
  assert(graphIds.has(e.sourceConceptId) && graphIds.has(e.targetConceptId));
  assert(['commonly_confused_with', 'contrasts_with', 'prerequisite_for', 'part_of', 'applied_with'].includes(e.type));
  assert(['bidirectional', 'forward'].includes(e.direction));
  assert(e.editorialWeight > 0 && e.editorialWeight <= 1 && e.reviewStatus);
  assert.equal(e.mappingVersion, MAPPING_VERSION);
}
for (const m of QUESTION_MAPPINGS) {
  const q = active.get(m.questionId);
  assert(q, `${m.questionId}: missing/disabled question`);
  assert.equal(m.questionRevision, contentSignature(q), `${m.questionId}: effective content changed; re-review mapping`);
  assert.equal(m.difficulty, q.difficulty);
  assert(m.objectiveCodes.includes(q.objective));
  assert.equal(m.domainId, `sy0701.domain-${q.ch}`);
  assert.equal(m.chapterId, `sy0701.objective-${q.objective}`);
}
for (const c of CONTENT_MAPPINGS) {
  assert(c.conceptIds.every(id => conceptIds.has(id)));
  assert.equal(c.mappingVersion, MAPPING_VERSION);
  if (c.kind === 'flashcard') assert(SY0701_ACRONYM_CARDS.some(card => card.id === c.contentId));
  else {
    const section = CONCEPT_DEEP_DIVES.find(l => l.id === c.lessonId)?.sections[c.sectionIndex];
    assert.equal(section?.title, c.sectionTitle);
    c.rowLabels.forEach(label => assert(section.table.rows.some(row => row[0] === label)));
  }
}
// Discovery is a census only. It never becomes an evidence attribution rule.
const mentions = [...active.values()].filter(q => /\b(RTO|RPO|MTD|MTTR|BIA)\b|recovery (time|point) objective|maximum tolerable downtime|business impact analysis|mean time to (repair|recover)/i.test(JSON.stringify(q))).map(q => q.id).sort();
assert.deepEqual(mentions, QUESTION_MAPPINGS.map(m => m.questionId).sort(), 'Review newly discovered pilot content explicitly');
assert.equal(QUESTION_MAPPINGS.find(m => m.questionId === 'm032').scenarioFamily, QUESTION_MAPPINGS.find(m => m.questionId === 'm635').scenarioFamily);
assert.equal(QUESTION_MAPPINGS.filter(m => m.primaryConceptId === 'recovery.mttr').length, 0);

// Abstract evidence fixtures, NOT authored questions or additions to the bank.
const fixtureMappings = Array.from({ length: 8 }, (_, i) => ({
  ...QUESTION_MAPPINGS[0], questionId: `fixture.rto.${i + 1}`, questionRevision: `fixture-revision-${i + 1}`,
  scenarioFamily: `synthetic-independent-family-${i + 1}`, difficulty: i === 7 ? 'hard' : 'medium', provenance: 'synthetic_fixture',
}));
const mappings = [...QUESTION_MAPPINGS, ...fixtureMappings];
const base = Date.parse('2026-10-01T00:00:00Z');
const day = 86400000, hour = 3600000;
const answer = (eventId, questionId, correct, offset, setIndex, extra = {}) => ({
  eventId, kind: 'answer', questionId, questionRevision: mappings.find(m => m.questionId === questionId).questionRevision,
  correct, occurredAt: base + offset, setIndex, ...extra,
});
const miss = answer('miss', 'm032', false, 0, 0);
const retry = answer('retry', 'm032', true, 60000, 0);
const fresh1 = answer('fresh-1', 'fixture.rto.1', true, hour, 1);
const fresh2 = answer('fresh-2', 'fixture.rto.2', true, 2 * hour, 2);
const delayed = answer('retention', 'm032', true, 3 * day, 3);
const mastered = answer('mastery', 'm032', true, 11 * day, 5);
const learning = { eventId: 'lesson', kind: 'intervention_completed', conceptId: 'recovery.rto',
  contentId: 'resilience-assets-physical:recovery-metrics', sourceEventId: 'miss', occurredAt: base + hour, setIndex: 1 };
const postLearningMiss = answer('after-lesson-miss', 'fixture.rto.1', false, 2 * hour, 2, { interventionId: 'lesson' });
const sticky = [miss, learning, postLearningMiss];
const stickyRecovery = [...sticky,
  answer('sticky-fresh-1', 'fixture.rto.2', true, day, 3),
  answer('sticky-fresh-2', 'fixture.rto.3', true, 3 * day, 4),
  answer('sticky-fresh-3', 'fixture.rto.4', true, 5 * day, 5),
];
const proven = [miss, fresh1, fresh2, delayed];
const standard = { mappings, now: base + 20 * day, setIndex: 20, seed: 'replay-v1' };
function checkVersions(value) {
  for (const [key, expected] of Object.entries(versions())) assert.equal(value[key], expected);
}
function assertReplay(name, history, expected, options = {}) {
  const context = { ...standard, ...options };
  const result = scheduleConceptReview(history, context);
  const state = result.model.concepts['recovery.rto'];
  assert.equal(state.state, expected.state, name);
  assert.equal(state.evidenceLevel, expected.level, name);
  assert.deepEqual(state.unresolvedContradictions, expected.contradictions, name);
  assert(state.transitions.some(t => t.reason === expected.reason), `${name}: transition reason`);
  assert.equal(result.model.concepts['recovery.rpo'].state, 'not_enough_evidence');
  assert.equal(result.model.concepts['recovery.rpo'].effectiveSampleSize, 0);
  const transfer = result.tasks.find(t => t.kind === 'transfer');
  const recall = result.tasks.find(t => t.kind === 'original_recall');
  assert.equal(transfer.status, expected.transfer ?? 'eligible', `${name}: transfer`);
  assert.equal(recall.questionId, expected.original ?? 'm032', `${name}: original`);
  assert.equal(recall.status, expected.recall ?? 'eligible', `${name}: recall status`);
  if (transfer.status === 'eligible') {
    assert(transfer.questionId.startsWith('fixture.rto.'));
    assert(!history.some(e => e.questionId === transfer.questionId));
    assert.notEqual(transfer.questionId, recall.questionId);
  }
  const support = result.recommendations.find(r => r.conceptId === 'recovery.rpo');
  assert.equal(support.role, 'supporting');
  assert.equal(support.reason, 'commonly_confused_with');
  assert(support.content.some(c => c.contentId.endsWith('rpo-recovery-point-objective')));
  assert.equal(support.createsMasteryEvidence, false);
  [result, result.model, state, transfer, recall, support, ...result.model.evidence].forEach(checkVersions);
  // Every named replay checks deterministic output and immutable input.
  const before = JSON.stringify(history);
  assert.deepEqual(scheduleConceptReview([...history].reverse(), context), result, `${name}: ordered replay`);
  assert.deepEqual(scheduleConceptReview(history, context), result, `${name}: deterministic replay`);
  assert.equal(JSON.stringify(history), before);
  console.log(`PASS ${name}: ${state.state} / ${state.evidenceLevel}; transfer=${transfer.status}; recall=${recall.status}`);
  return result;
}
const early = { state: 'learning_signal', level: 'limited', contradictions: ['miss'], reason: 'first_or_isolated_miss' };
assertReplay('01 first RTO miss', [miss], early);
const immediate = assertReplay('02 immediate exact retry', [miss, retry], early);
assert.equal(immediate.model.evidence[1].classification, 'exact_repeat');
assert(immediate.model.concepts['recovery.rto'].observations.some(o => o.reason === 'exact_recall_cannot_establish_proof'));
assertReplay('03 fresh RTO success', [miss, fresh1], early);
assertReplay('04 multiple fresh successes', [miss, fresh1, fresh2], { state: 'improving', level: 'varied', contradictions: ['miss'], reason: 'multiple_fresh_successes', transfer: 'completed' });
assertReplay('05 delayed retention', proven, { state: 'proven', level: 'retained', contradictions: [], reason: 'varied_delayed_repair_resolves_contradictions', transfer: 'completed', recall: 'completed' });
assertReplay('06 second distinct miss', [miss, answer('miss-2', 'm635', false, hour, 1)], { state: 'needs_attention', level: 'limited', contradictions: ['miss', 'miss-2'], reason: 'distinct_question_misses', original: 'm635' });
assertReplay('07 miss after learning', sticky, { state: 'sticky', level: 'limited', contradictions: ['miss', 'after-lesson-miss'], reason: 'miss_after_intervention', original: 'fixture.rto.1' });
assertReplay('08a sticky insufficient recovery', stickyRecovery.slice(0, -1), { state: 'sticky', level: 'limited', contradictions: ['miss', 'after-lesson-miss'], reason: 'miss_after_intervention', original: 'fixture.rto.1' });
assertReplay('08b sticky varied recovery', stickyRecovery, { state: 'improving', level: 'varied', contradictions: ['miss', 'after-lesson-miss'], reason: 'sticky_varied_recovery', transfer: 'completed', original: 'fixture.rto.1' });
assertReplay('08c sticky spaced proof', [...stickyRecovery, answer('sticky-retention', 'fixture.rto.1', true, 10 * day, 6)], { state: 'proven', level: 'retained', contradictions: [], reason: 'varied_delayed_repair_resolves_contradictions', transfer: 'completed', recall: 'completed', original: 'fixture.rto.1' });
assertReplay('09 recent contradiction blocks proof', [miss, fresh1, fresh2, answer('contradiction', 'fixture.rto.3', false, day, 3), answer('delayed-after-miss', 'm032', true, 4 * day, 4)], { state: 'needs_attention', level: 'limited', contradictions: ['miss', 'contradiction'], reason: 'distinct_question_misses', original: 'fixture.rto.3' });
assertReplay('10 relapse after proven', [...proven, answer('relapse', 'fixture.rto.3', false, 4 * day, 4)], { state: 'needs_attention', level: 'limited', contradictions: ['relapse'], reason: 'relapse_after_proven', original: 'fixture.rto.3' });
assertReplay('11a mastered', [...proven, mastered], { state: 'mastered', level: 'spaced', contradictions: [], reason: 'spaced_retention_after_proven', transfer: 'completed', recall: 'completed' });
assertReplay('11b relapse after mastered', [...proven, mastered, answer('late-relapse', 'fixture.rto.3', false, 12 * day, 6)], { state: 'needs_attention', level: 'limited', contradictions: ['late-relapse'], reason: 'relapse_after_mastered', original: 'fixture.rto.3' });
assertReplay('12 RPO support without RPO evidence', [miss], early);
assertReplay('13 duplicate and out-of-order evidence', [fresh2, miss, fresh1, miss, fresh1], { state: 'improving', level: 'varied', contradictions: ['miss'], reason: 'multiple_fresh_successes', transfer: 'completed' });
const shortage = assertReplay('14 actual bank variant shortage', [miss], { ...early, transfer: 'unavailable' }, { mappings: QUESTION_MAPPINGS });
assert(shortage.tasks.find(t => t.kind === 'transfer').reasons.includes('insufficient_variant_coverage'));
assertReplay('15 deterministic same-input replay', [miss, retry, fresh1], early);

// Additional boundary and negative cases; these guard against optimistic proof.
assertReplay('same-family different question is not transfer', [miss, answer('same-family', 'm635', true, day, 1)], early);
assertReplay('two successes separated by days still need an extra check', [miss, fresh1, answer('second-late', 'fixture.rto.2', true, 5 * day, 2)], { state: 'improving', level: 'varied', contradictions: ['miss'], reason: 'multiple_fresh_successes', transfer: 'completed' });
assertReplay('calendar and set gates', [miss], { ...early, transfer: 'waiting', recall: 'waiting' }, { now: base, setIndex: 0 });
assertReplay('time passed without new set', [miss], { ...early, transfer: 'waiting', recall: 'waiting' }, { now: base + 3 * day, setIndex: 0 });
assertReplay('sets advanced without time', [miss], { ...early, recall: 'waiting' }, { now: base, setIndex: 10 });
assertReplay('continued misses become sticky', [miss, answer('repeat-miss', 'm032', false, hour, 1), answer('third-miss', 'm032', false, 2 * hour, 2)], { state: 'sticky', level: 'limited', contradictions: ['miss', 'repeat-miss', 'third-miss'], reason: 'continued_misses_across_sets' });
const noGraph = calculateConceptMastery([miss], standard);
assert.deepEqual(noGraph, scheduleConceptReview([miss], { ...standard, relationships: [] }).model);
for (const q of ['p211', 'p048']) for (const correct of [true, false]) {
  const coarse = calculateConceptMastery([answer(`coarse-${q}`, q, correct, 0, 0)], standard);
  assert(Object.values(coarse.concepts).every(c => c.state === 'not_enough_evidence' && c.effectiveSampleSize === 0));
}
assert.throws(() => calculateConceptMastery([miss, { ...miss, correct: true }], standard), /Conflicting duplicate/);
assert.throws(() => calculateConceptMastery([{ ...miss, questionRevision: 'unknown' }], standard), /Unknown revision/);
assert.throws(() => calculateConceptMastery([{ ...miss, configurationVersion: 'unknown' }], standard), /Incompatible/);
assert.throws(() => calculateConceptMastery([{ ...miss, correct: 'false' }], standard), /correctness/);
assert.throws(() => calculateConceptMastery([{ ...miss, occurredAt: '2026-10-01' }], standard), /Invalid/);
assert.throws(() => calculateConceptMastery([miss], { ...standard, now: undefined }), /Invalid now/);
assert.throws(() => calculateConceptMastery([miss, { ...learning, sourceEventId: 'missing' }], standard), /Invalid intervention source/);
assert.throws(() => calculateConceptMastery([{ ...miss, interventionId: 'missing' }], standard), /Invalid intervention linkage/);
assert.throws(() => calculateConceptMastery([miss], { ...standard, mappings: mappings.map(m => ({ ...m, editorialStatus: 'unreviewed' })) }), /Unreviewed/);
assert.throws(() => calculateConceptMastery([fresh1, answer('bad-set', 'm032', false, day, 0)], standard), /monotonic/);
const future = calculateConceptMastery([miss, fresh1], { ...standard, now: base });
assert.deepEqual(future.deferredEventIds, ['fresh-1']);
assert.equal(future.concepts['recovery.rto'].freshSuccessesAfterRepair, 0);
const spoofed = normalizeLearningEvidence([{ ...miss, primaryConceptId: 'recovery.rpo', classification: 'fresh_scenario' }, { ...retry, classification: 'fresh_scenario' }], standard);
assert.equal(spoofed.events[0].primaryConceptId, 'recovery.rto');
assert.equal(spoofed.events[1].classification, 'exact_repeat');

// Hard caps hold even when the pool cannot fill; no relaxation or unrelated fill.
const existing = ['fixture.rto.5', 'fixture.rto.6', 'fixture.rto.7'];
const normal = scheduleConceptReview([miss], { ...standard, existingQuestionIds: existing });
assert.equal(normal.selected.length, 0);
assert(normal.tasks.every(t => t.reasons.includes('concept_limit')));
const smart = scheduleConceptReview([miss], { ...standard, existingQuestionIds: existing, mode: 'smart_review' });
assert.equal(smart.selected.length, 2);
const tiny = scheduleConceptReview([miss], { ...standard, setSize: 1 });
assert.equal(tiny.selected.length, 0);
const onlyHard = mappings.filter(m => !m.questionId.startsWith('fixture.') || m.difficulty === 'hard');
const hardLimited = scheduleConceptReview([miss], { ...standard, mappings: onlyHard, config: { ...LEARNING_CONFIG, configurationVersion: 'test-zero-hard', scheduler: { ...LEARNING_CONFIG.scheduler, modes: { normal: { conceptShare: 1, remediationShare: 1, exactRepeatShare: 1, hardShare: 0 } } } } });
assert(hardLimited.tasks.find(t => t.kind === 'transfer').reasons.includes('difficulty_limit'));
assert(!hardLimited.selected.some(q => q.difficulty === 'hard'));
const repeatCapped = scheduleConceptReview([miss, retry], { ...standard, existingQuestionIds: ['m032'] });
assert(repeatCapped.tasks.find(t => t.kind === 'original_recall').reasons.includes('exact_repeat_limit'));
const maintenance = scheduleConceptReview([...proven, mastered], { ...standard, now: base + 40 * day, setIndex: 10 });
assert.equal(maintenance.tasks.find(t => t.kind === 'maintenance').status, 'eligible');
// Extra proof and retention boundaries: elapsed time alone cannot manufacture success.
const merelyWaited = calculateConceptMastery([miss, fresh1, fresh2], { ...standard, now: base + 100 * day });
assert.equal(merelyWaited.concepts['recovery.rto'].state, 'improving');
const recentRehearsal = calculateConceptMastery([...proven, answer('rehearsal', 'm032', true, 10 * day, 5), answer('too-soon', 'm032', true, 11 * day, 6)], standard);
assert.equal(recentRehearsal.concepts['recovery.rto'].state, 'mastered'); // Day 10 itself is a valid seven-day check.
const recentBeforeDue = calculateConceptMastery([...proven, answer('rehearsal-before-due', 'm032', true, 9 * day, 4), answer('too-soon', 'm032', true, 11 * day, 6)], standard);
assert.equal(recentBeforeDue.concepts['recovery.rto'].state, 'proven');
const proofRehearsal = calculateConceptMastery([miss, fresh1, fresh2, answer('early-rehearsal', 'm032', true, day, 3), answer('too-soon-proof', 'm032', true, 2 * day, 4)], standard);
assert.equal(proofRehearsal.concepts['recovery.rto'].state, 'improving');
const recallFirstHistory = [miss, answer('recall-before-transfer', 'm032', true, 3 * day, 2), answer('new-1', 'fixture.rto.1', true, 4 * day, 3), answer('new-2', 'fixture.rto.2', true, 5 * day, 4)];
const nextProof = scheduleConceptReview(recallFirstHistory, standard);
assert.equal(nextProof.tasks.find(t => t.kind === 'original_recall').status, 'completed');
assert.equal(nextProof.tasks.find(t => t.kind === 'delayed_proof').status, 'eligible');
const rpoMiss = answer('rpo-miss', 'm088', false, 0, 0);
const beforeSupport = calculateConceptMastery([rpoMiss], standard).concepts['recovery.rpo'];
const afterSupport = scheduleConceptReview([rpoMiss, answer('rto-later', 'm032', false, hour, 1)], standard).model.concepts['recovery.rpo'];
assert.deepEqual(afterSupport, beforeSupport);
const paired = { ...fixtureMappings[0], secondaryConceptIds: ['recovery.rpo'] };
const directSecondary = calculateConceptMastery([answer('paired', paired.questionId, false, 0, 0)], { ...standard, mappings: [paired] });
assert.equal(directSecondary.concepts['recovery.rto'].effectiveSampleSize, 1);
assert.equal(directSecondary.concepts['recovery.rpo'].effectiveSampleSize, 0.5);
assert.equal(directSecondary.concepts['recovery.rpo'].state, 'learning_signal');
const stickyProofHistory = [...stickyRecovery, answer('sticky-retention', 'fixture.rto.1', true, 10 * day, 6)];
assert.equal(calculateConceptMastery([...stickyProofHistory, answer('too-early-sticky-mastery', 'm032', true, 18 * day, 8)], standard).concepts['recovery.rto'].state, 'proven');
assert.equal(calculateConceptMastery([...stickyProofHistory, answer('sticky-mastery', 'm032', true, 25 * day, 8)], { ...standard, now: base + 26 * day }).concepts['recovery.rto'].state, 'mastered');
const interventionSchedule = scheduleConceptReview([miss, learning], { ...standard, now: base + hour, setIndex: 1 });
assert.equal(interventionSchedule.tasks.find(t => t.kind === 'transfer').eligibleAfterSetIndex, 2);
assert.equal(interventionSchedule.tasks.find(t => t.kind === 'transfer').interventionId, 'lesson');
const cappedRemediation = scheduleConceptReview([miss], { ...standard, config: { ...LEARNING_CONFIG, configurationVersion: 'test-zero-remediation', scheduler: { ...LEARNING_CONFIG.scheduler, modes: { normal: { conceptShare: 1, remediationShare: 0, exactRepeatShare: 1, hardShare: 1 } } } } });
assert.equal(cappedRemediation.selected.length, 0);
assert(cappedRemediation.tasks.every(t => t.reasons.includes('remediation_limit')));

const partialCoverage = scheduleConceptReview([miss], { ...standard, mappings: [...QUESTION_MAPPINGS, fixtureMappings[0]] });
const partialTask = partialCoverage.tasks.find(t => t.kind === 'transfer');
assert.equal(partialTask.status, 'eligible');
assert.equal(partialTask.coverage.missingFamilies, 1);
assert(partialTask.reasons.includes('insufficient_variant_coverage'));
const secondaryCapsMappings = mappings.map(m => existing.includes(m.questionId) ? { ...m, primaryConceptId: 'recovery.rpo', secondaryConceptIds: ['recovery.rto'] } : m);
assert.equal(scheduleConceptReview([miss], { ...standard, mappings: secondaryCapsMappings, existingQuestionIds: existing }).selected.length, 0);
// Verify the pilot has not been wired into existing learner flows.
assert(!/from\s+['"][^'"]*(learningConcepts|learningMappings|learningEvidence|learningConfig|conceptMastery|reviewScheduler)/.test(readFileSync('src/App.jsx', 'utf8')));
console.log(`PASS catalogue: ${LEARNING_CONCEPTS.length} concepts, ${CONCEPT_RELATIONSHIPS.length} edges, ${QUESTION_MAPPINGS.length} effective mappings, ${CONTENT_MAPPINGS.length} content links (${mcqs.length} MCQs / ${pbqs.length} PBQs searched)`);
console.log('PASS all replay, validation, non-attribution, cap and determinism checks. Local synthetic prototype only.');
