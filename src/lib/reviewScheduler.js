import { LEARNING_CONFIG, versions } from './learningConfig.js';
import { LEARNING_CONCEPTS } from '../data/learningConcepts.js';
import { QUESTION_MAPPINGS, CONTENT_MAPPINGS } from '../data/learningMappings.js';
import { calculateConceptMastery } from './conceptMastery.js';
import { compareIds } from './learningEvidence.js';

// Relationship recommendations are retired; default to direct concept support only.
export function recommendConceptSupport(conceptId, {
  contentMappings = CONTENT_MAPPINGS, config = LEARNING_CONFIG,
} = {}) {
  const approved = x => x.mappingVersion === config.mappingVersion && config.allowedReviewStatuses.includes(x.editorialStatus ?? x.reviewStatus);
  return [{ conceptId, role: 'direct', reason: 'direct_concept_review', editorialWeight: 1,
    content: contentMappings.filter(c => approved(c) && c.conceptIds.includes(conceptId)),
    createsMasteryEvidence: false, ...versions(config) }];
}
function seededOrder(seed, id) {
  // Stable integer hash for tie-breaking only; no randomness or wall clock.
  let value = 2166136261;
  for (const char of `${seed}:${id}`) value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
  return value;
}

export function scheduleConceptReview(raw, options = {}) {
  const { config = LEARNING_CONFIG, mappings = QUESTION_MAPPINGS, concepts = LEARNING_CONCEPTS,
    setIndex, setSize = config.scheduler.defaultSetSize, mode = 'normal', seed = 'rto-pilot', existingQuestionIds = [] } = options;
  const caps = config.scheduler.modes[mode];
  if (!caps || !Number.isSafeInteger(setIndex) || setIndex < 0 || !Number.isSafeInteger(setSize) || setSize < 1) throw new Error('Invalid scheduler context');
  const model = calculateConceptMastery(raw, { ...options, config, mappings, concepts });
  if (model.evidence.some(e => e.setIndex > setIndex)) throw new Error('Scheduler set index precedes evidence');
  const answers = model.evidence.filter(e => e.kind === 'answer');
  const seenIds = new Set([...answers, ...(options.priorExposure ?? [])].map(e => e.questionId));
  const seenFamilies = new Set([...answers, ...(options.priorExposure ?? [])].map(e => e.scenarioFamily));
  const tasks = [], recommendations = [];
  for (const state of Object.values(model.concepts)) {
    if (!state.lastMiss) continue;
    const miss = state.lastMiss;
    const extraPriority = (state.everSticky ? config.scheduler.priority.sticky : 0) +
      (state.unresolvedContradictions.length ? config.scheduler.priority.contradiction : 0) +
      (state.lastIntervention ? config.scheduler.priority.intervention : 0);
    const common = { conceptId: state.conceptId, sourceEventId: miss.eventId, interventionId: state.lastIntervention?.eventId ?? null,
      unresolvedContradictions: [...state.unresolvedContradictions], ...versions(config) };
    const makeTask = (kind, candidates, eligibleAfterAt, eligibleAfterSetIndex, priority) => ({
      ...common, taskId: `${miss.eventId}:${state.conceptId}:${kind}`, kind,
      candidates: candidates.map(m => ({ questionId: m.questionId, questionRevision: m.questionRevision, difficulty: m.difficulty })),
      questionId: candidates[0]?.questionId ?? null, questionRevision: candidates[0]?.questionRevision ?? null,
      eligibleAfterAt, eligibleAfterSetIndex, priority, status: 'pending', reasons: [],
    });
    const direct = mappings.filter(m => m.primaryConceptId === state.conceptId && m.evidencePrecision === 'direct' && m.active !== false);
    const variants = direct.filter(m => !seenIds.has(m.questionId) && !seenFamilies.has(m.scenarioFamily))
      .sort((a, b) => seededOrder(seed, a.questionId) - seededOrder(seed, b.questionId) || compareIds(a.questionId, b.questionId));
    const anchor = state.lastIntervention && state.lastIntervention.occurredAt > miss.occurredAt ? state.lastIntervention : miss;
    const transfer = makeTask('transfer', variants, anchor.occurredAt + config.scheduler.transferDelayMs, anchor.setIndex + config.scheduler.transferSetGap, config.scheduler.priority.transfer + extraPriority);
    const requiredFresh = state.everSticky ? config.mastery.stickyFreshSuccessesForImproving : config.mastery.freshSuccessesForImproving;
    transfer.coverage = { requiredFresh, achievedFresh: state.freshSuccessesAfterRepair,
      availableFreshFamilies: new Set(variants.map(m => m.scenarioFamily)).size };
    transfer.coverage.missingFamilies = Math.max(0, requiredFresh - transfer.coverage.achievedFresh - transfer.coverage.availableFreshFamilies);
    if (transfer.coverage.missingFamilies) transfer.reasons.push('insufficient_variant_coverage');
    const recall = makeTask('original_recall', mappings.filter(m => m.questionId === miss.questionId && m.questionRevision === miss.questionRevision && m.active !== false),
      miss.occurredAt + (state.everSticky ? config.scheduler.stickyRecallDelayMs : config.scheduler.recallDelayMs),
      miss.setIndex + (state.everSticky ? config.scheduler.stickyRecallSetGap : config.scheduler.recallSetGap),
      (config.scheduler.priority.recall + extraPriority) * config.weights.exact_repeat);
    recall.reasons.push('exact_repeat_discount');
    const recoveryAnswers = answers.filter(e => e.correct && e.occurredAt > miss.occurredAt && e.conceptRoles.some(r => r.conceptId === state.conceptId));
    if (recoveryAnswers.some(e => e.questionId === miss.questionId && e.occurredAt >= recall.eligibleAfterAt && e.setIndex >= recall.eligibleAfterSetIndex)) {
      recall.status = 'completed'; recall.reasons.push('delayed_original_recall_completed');
    }
    if (['proven', 'mastered'].includes(state.state)) {
      transfer.status = 'completed'; transfer.reasons.push('transfer_and_retention_established');
      // Maintenance is separate from the original miss's recall obligation.
      const interval = state.state === 'mastered' ? config.scheduler.masteredMaintenanceMs : config.scheduler.provenMaintenanceMs;
      tasks.push(makeTask('maintenance', direct, state.lastTestedAt + interval, answers.filter(e => e.evidencePrecision === 'direct' && e.conceptRoles.some(r => r.conceptId === state.conceptId)).at(-1).setIndex + config.mastery.proofSetGap, config.scheduler.priority.recall));
    } else if (state.freshSuccessesAfterRepair >= (state.everSticky ? config.mastery.stickyFreshSuccessesForImproving : config.mastery.freshSuccessesForImproving)) {
      transfer.status = 'completed'; transfer.reasons.push('fresh_transfer_requirement_met');
      const lastAnswer = answers.filter(e => e.evidencePrecision === 'direct' && e.conceptRoles.some(r => r.conceptId === state.conceptId)).at(-1);
      tasks.push(makeTask('delayed_proof', direct,
        lastAnswer.occurredAt + (state.everSticky ? config.mastery.stickyProofDelayMs : config.mastery.proofDelayMs),
        lastAnswer.setIndex + config.mastery.proofSetGap, (config.scheduler.priority.recall + extraPriority) * config.weights.exact_repeat));
    } else if (!variants.length) {
      transfer.status = 'unavailable';
    }
    tasks.push(transfer, recall);
    recommendations.push(...recommendConceptSupport(state.conceptId, options).map(r => ({ ...r, sourceConceptId: state.conceptId, sourceEventId: miss.eventId })));
  }
  const limits = Object.fromEntries(Object.entries(caps).map(([key, share]) => [key, Math.floor(setSize * share)]));
  const byId = new Map(mappings.map(m => [m.questionId, m]));
  const testedConcepts = qid => { const m = byId.get(qid); return [m.primaryConceptId, ...m.secondaryConceptIds]; };
  const selectedIds = new Set(existingQuestionIds);
  if (selectedIds.size !== existingQuestionIds.length || selectedIds.size > setSize) throw new Error('Invalid existing selection');
  const counts = { concept: {}, hard: 0, exactRepeat: 0, remediation: 0 };
  for (const id of selectedIds) {
    const m = byId.get(id);
    if (!m) throw new Error(`Unknown existing question ${id}; supply its mapping`);
    for (const id of testedConcepts(m.questionId)) counts.concept[id] = (counts.concept[id] ?? 0) + 1;
    counts.hard += Number(m.difficulty === 'hard');
    counts.exactRepeat += Number(seenIds.has(id));
    counts.remediation += Number(testedConcepts(m.questionId).some(id => model.concepts[id]?.lastMiss));
  }
  const selected = [];
  tasks.sort((a, b) => b.priority - a.priority || Number(b.kind === 'original_recall') - Number(a.kind === 'original_recall') || compareIds(a.taskId, b.taskId));
  for (const task of tasks) {
    if (task.status !== 'pending') continue;
    if (task.kind === 'delayed_proof' && tasks.some(t => t.conceptId === task.conceptId && t.kind === 'original_recall' && t.status === 'eligible' && model.now >= task.eligibleAfterAt && setIndex >= task.eligibleAfterSetIndex)) {
      task.status = 'covered_by_original_recall'; task.reasons.push('original_recall_can_check_retention'); continue;
    }
    if (model.now < task.eligibleAfterAt) task.reasons.push('waiting_for_time');
    if (setIndex < task.eligibleAfterSetIndex) task.reasons.push('waiting_for_set');
    if (task.reasons.some(r => r.startsWith('waiting_'))) { task.status = 'waiting'; continue; }
    let excluded = [];
    const candidate = task.candidates.find(q => {
      const reasons = [];
      if (selectedIds.has(q.questionId)) reasons.push('already_in_set');
      if (selectedIds.size >= setSize) reasons.push('set_full');
      if (testedConcepts(q.questionId).some(id => (counts.concept[id] ?? 0) >= limits.conceptShare)) reasons.push('concept_limit');
      if (counts.remediation >= limits.remediationShare) reasons.push('remediation_limit');
      if (q.difficulty === 'hard' && counts.hard >= limits.hardShare) reasons.push('difficulty_limit');
      if (seenIds.has(q.questionId) && counts.exactRepeat >= limits.exactRepeatShare) reasons.push('exact_repeat_limit');
      excluded.push(...reasons);
      return !reasons.length;
    });
    if (!candidate) { task.status = 'blocked'; task.reasons.push(...new Set(excluded)); continue; }
    task.status = 'eligible'; task.questionId = candidate.questionId; task.questionRevision = candidate.questionRevision;
    task.reasons.push(task.kind === 'transfer' ? 'fresh_primary_concept_scenario' : 'spaced_recall_due');
    selected.push({ ...candidate, taskId: task.taskId, conceptId: task.conceptId }); selectedIds.add(candidate.questionId);
    for (const id of testedConcepts(candidate.questionId)) counts.concept[id] = (counts.concept[id] ?? 0) + 1;
    counts.remediation++; counts.hard += Number(candidate.difficulty === 'hard'); counts.exactRepeat += Number(seenIds.has(candidate.questionId));
  }
  return { model, tasks, recommendations, selected, mode, seed, setIndex, setSize, limits, counts, ...versions(config) };
}
