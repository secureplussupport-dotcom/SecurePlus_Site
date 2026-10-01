// Local Phase 2A hypotheses, NOT scientifically validated learning thresholds.
export const LEARNING_CONFIG = freeze({
  algorithmVersion: 'concept-mastery-v1',
  configurationVersion: 'rto-pilot-config-v1',
  mappingVersion: 'sy0701-concepts-v1',
  provisional: true,
  allowedReviewStatuses: ['agent_reviewed_pending_human', 'human_reviewed'],
  mastery: {
    distinctMissesForAttention: 2,
    missesForSticky: 3,
    stickySetSpan: 2,
    freshSuccessesForImproving: 2,
    stickyFreshSuccessesForImproving: 3,
    proofDelayMs: 2 * 86400000,
    stickyProofDelayMs: 4 * 86400000,
    proofSetGap: 1,
    stickySpacedSuccesses: 2,
    stickySuccessSpacingMs: 2 * 86400000,
    masteryDelayMs: 7 * 86400000,
    stickyMasteryDelayMs: 14 * 86400000,
    masterySetGap: 2,
  },
  weights: {
    primary: 1, secondary: 0.5,
    difficulty: { easy: 0.8, medium: 1, hard: 1.2 },
    fresh_scenario: 1, same_scenario: 0.4, exact_repeat: 0.15,
    delayedRecall: 0.6,
  },
  scheduler: {
    defaultSetSize: 10,
    transferDelayMs: 0, transferSetGap: 1,
    recallDelayMs: 2 * 86400000, recallSetGap: 2,
    stickyRecallDelayMs: 86400000, stickyRecallSetGap: 1,
    provenMaintenanceMs: 7 * 86400000, masteredMaintenanceMs: 21 * 86400000,
    priority: { transfer: 50, recall: 30, sticky: 30, contradiction: 20, intervention: 10 },
    modes: {
      normal: { conceptShare: 0.3, remediationShare: 0.4, exactRepeatShare: 0.1, hardShare: 0.3 },
      smart_review: { conceptShare: 0.6, remediationShare: 1, exactRepeatShare: 0.3, hardShare: 0.4 },
    },
  },
});

export function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

export function versions(config = LEARNING_CONFIG) {
  return { algorithmVersion: config.algorithmVersion, configurationVersion: config.configurationVersion, mappingVersion: config.mappingVersion };
}
