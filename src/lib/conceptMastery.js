import { LEARNING_CONFIG, versions } from './learningConfig.js';
import { LEARNING_CONCEPTS } from '../data/learningConcepts.js';
import { normalizeLearningEvidence } from './learningEvidence.js';

export function calculateConceptMastery(raw, options = {}) {
  const config = options.config ?? LEARNING_CONFIG;
  const catalogue = options.concepts ?? LEARNING_CONCEPTS;
  const normalized = normalizeLearningEvidence(raw, { ...options, config, concepts: catalogue });
  const rules = config.mastery;
  const concepts = Object.fromEntries(catalogue.map(c => {
    const state = {
      conceptId: c.id, state: 'not_enough_evidence', evidenceLevel: 'none',
      effectiveSampleSize: 0, distinctQuestions: 0, distinctScenarios: 0,
      freshSuccessesAfterRepair: 0, spacedSuccessesAfterRepair: 0,
      everSticky: false, lapseCount: 0, unresolvedContradictions: [],
      lastMiss: null, lastTestedAt: null, lastIntervention: null, provenAt: null,
      transitions: [], observations: [], ...versions(config),
    };
    const answers = normalized.events.filter(e => e.kind === 'answer' && e.evidencePrecision === 'direct' && e.conceptRoles.some(r => r.conceptId === c.id));
    const interventions = normalized.events.filter(e => e.kind === 'intervention_completed' && e.conceptId === c.id);
    const questions = new Set(), scenarios = new Set(), missedQuestions = new Set();
    let recovery = [], firstMissSet = null, lastSpacedSuccess = null, provenSet = null;
    const transition = (next, reason, event) => {
      state.observations.push({ eventId: event.eventId, reason });
      if (state.state !== next) {
        state.transitions.push({ from: state.state, to: next, reason, eventId: event.eventId, occurredAt: event.occurredAt });
        state.state = next;
      }
    };
    for (const event of answers) {
      const role = event.conceptRoles.find(r => r.conceptId === c.id).role;
      const intervention = interventions.filter(i => i.occurredAt < event.occurredAt).at(-1) ?? null;
      const previousTest = state.lastTestedAt;
      state.lastIntervention = intervention;
      state.lastTestedAt = event.occurredAt;
      questions.add(event.questionId); scenarios.add(event.scenarioFamily);
      const delayed = previousTest !== null && event.occurredAt - previousTest >= rules.proofDelayMs;
      const independence = event.correct ? (delayed && event.classification === 'exact_repeat' ? config.weights.delayedRecall : config.weights[event.classification]) : 1;
      state.effectiveSampleSize += config.weights[role] * config.weights.difficulty[event.difficulty] * independence;
      if (!event.correct) {
        const wasProven = ['proven', 'mastered'].includes(state.state);
        const previousState = state.state;
        if (wasProven) state.lapseCount++;
        state.provenAt = null; provenSet = null;
        if (firstMissSet === null) firstMissSet = event.setIndex;
        missedQuestions.add(event.questionId);
        state.unresolvedContradictions.push(event.eventId);
        const postIntervention = intervention && (!state.lastMiss || intervention.occurredAt > state.lastMiss.occurredAt);
        const continuedMisses = state.unresolvedContradictions.length >= rules.missesForSticky && event.setIndex - firstMissSet >= rules.stickySetSpan;
        state.everSticky ||= Boolean(postIntervention || continuedMisses);
        recovery = []; lastSpacedSuccess = null;
        state.freshSuccessesAfterRepair = 0; state.spacedSuccessesAfterRepair = 0;
        state.lastMiss = event;
        const next = state.everSticky ? 'sticky' : wasProven || missedQuestions.size >= rules.distinctMissesForAttention ? 'needs_attention' : 'learning_signal';
        transition(next, wasProven ? `relapse_after_${previousState}` : postIntervention ? 'miss_after_intervention' : continuedMisses ? 'continued_misses_across_sets' : state.everSticky ? 'sticky_miss' : next === 'needs_attention' ? 'distinct_question_misses' : 'first_or_isolated_miss', event);
        continue;
      }
      if (state.state === 'mastered') {
        state.observations.push({ eventId: event.eventId, reason: 'maintenance_success' });
        continue;
      }
      if (state.state === 'proven') {
        const delay = state.everSticky ? rules.stickyMasteryDelayMs : rules.masteryDelayMs;
        if (event.occurredAt - state.provenAt >= delay && previousTest !== null && event.occurredAt - previousTest >= delay && event.setIndex - provenSet >= rules.masterySetGap) transition('mastered', 'spaced_retention_after_proven', event);
        else state.observations.push({ eventId: event.eventId, reason: 'mastery_retention_not_due' });
        continue;
      }
      const priorFresh = recovery.at(-1);
      const priorFreshCount = recovery.length;
      if (event.classification === 'fresh_scenario') recovery.push(event);
      state.freshSuccessesAfterRepair = recovery.length;
      if (lastSpacedSuccess === null || event.occurredAt - lastSpacedSuccess >= rules.stickySuccessSpacingMs) {
        state.spacedSuccessesAfterRepair++;
        lastSpacedSuccess = event.occurredAt;
      }
      const required = state.everSticky ? rules.stickyFreshSuccessesForImproving : rules.freshSuccessesForImproving;
      const delay = state.everSticky ? rules.stickyProofDelayMs : rules.proofDelayMs;
      // A separate delayed observation after the required fresh successes is mandatory.
      const canProve = priorFresh && priorFreshCount >= required &&
        previousTest !== null && event.occurredAt - previousTest >= delay &&
        event.occurredAt - priorFresh.occurredAt >= delay && event.setIndex - priorFresh.setIndex >= rules.proofSetGap &&
        (!state.lastMiss || event.occurredAt - state.lastMiss.occurredAt >= delay) &&
        (!state.everSticky || state.spacedSuccessesAfterRepair >= rules.stickySpacedSuccesses);
      if (canProve) {
        const hadContradiction = state.unresolvedContradictions.length > 0;
        state.unresolvedContradictions = [];
        state.provenAt = event.occurredAt; provenSet = event.setIndex;
        firstMissSet = null; missedQuestions.clear();
        transition('proven', hadContradiction ? 'varied_delayed_repair_resolves_contradictions' : 'varied_success_and_delayed_check', event);
      } else if (recovery.length >= required) {
        transition('improving', state.everSticky ? 'sticky_varied_recovery' : 'multiple_fresh_successes', event);
      } else {
        state.observations.push({ eventId: event.eventId, reason: event.classification === 'exact_repeat' ? 'exact_recall_cannot_establish_proof' : event.classification === 'same_scenario' ? 'same_family_not_independent' : 'fresh_success_below_threshold' });
      }
    }
    state.lastIntervention = interventions.at(-1) ?? null;
    state.distinctQuestions = questions.size; state.distinctScenarios = scenarios.size;
    state.effectiveSampleSize = Number(state.effectiveSampleSize.toFixed(3));
    state.evidenceLevel = state.state === 'mastered' ? 'spaced' : state.state === 'proven' ? 'retained' : state.state === 'improving' ? 'varied' : answers.length ? 'limited' : 'none';
    return [c.id, state];
  }));
  return { concepts, evidence: normalized.events, deferredEventIds: normalized.deferredEventIds, now: normalized.now, ...versions(config) };
}
