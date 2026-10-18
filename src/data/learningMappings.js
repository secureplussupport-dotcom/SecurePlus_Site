import { freeze } from '../lib/learningConfig.js';
import { MAPPING_VERSION, EDITORIAL_STATUS } from './learningConcepts.js';

const mapping = (questionId, hash, primaryConceptId, difficulty, scenarioFamily, cognitiveSkill, extra = {}) => ({
  questionId, questionRevision: `sha256:${hash}`, primaryConceptId, secondaryConceptIds: [],
  objectiveCodes: ['5.2'], domainId: 'sy0701.domain-5', chapterId: 'sy0701.objective-5.2',
  topicId: 'business-continuity-metrics', format: 'mcq', cognitiveSkill, difficulty, scenarioFamily,
  evidencePrecision: 'direct', editorialStatus: EDITORIAL_STATUS, mappingVersion: MAPPING_VERSION,
  provenance: 'effective_local_bank', ...extra,
});
export const QUESTION_MAPPINGS = freeze([
  mapping('m032', '072ce4c7b9f8e0f1f70dbea7320cebfb13d18d482093240eb98485850478e200', 'recovery.rto', 'easy', 'restoration-target-identification', 'interpretation'),
  mapping('m635', 'd2f6ffed09aa5b1fd7a933da2e5e531906923f96ef00c90b910b184b0cc25233', 'recovery.rto', 'easy', 'restoration-target-identification', 'identification'),
  mapping('m088', 'd828be6f37d110e5cf80620d9c7aa4b8129dbc28cbf1e221233f19baadf01158', 'recovery.rpo', 'medium', 'versioned-backup-interval', 'scenario_application'),
  mapping('m196', '064871a82f7228185d753db57a4ff070d965ea05ffbf8499a65dbad23303a600', 'recovery.mtd', 'medium', 'outer-business-interruption-limit', 'distinction'),
  mapping('m086', '314994d739ecbe82485e02f29dda4c628773b1ff363b93913182892515e52872', 'continuity.bia', 'medium', 'critical-function-impact-document', 'identification'),

]);

const content = (contentId, kind, conceptIds, extra = {}) => ({
  contentId, kind, conceptIds, mappingVersion: MAPPING_VERSION, editorialStatus: EDITORIAL_STATUS, ...extra,
});
export const CONTENT_MAPPINGS = freeze([
  content('sy0701-acronym-risk-governance-business-rto-recovery-time-objective', 'flashcard', ['recovery.rto']),
  content('sy0701-acronym-risk-governance-business-rpo-recovery-point-objective', 'flashcard', ['recovery.rpo']),
  content('sy0701-acronym-risk-governance-business-mttr-mean-time-to-repair-recover', 'flashcard', ['recovery.mttr']),
  content('sy0701-acronym-risk-governance-business-bia-business-impact-analysis', 'flashcard', ['continuity.bia']),
  content('resilience-assets-physical:recovery-metrics', 'deep_dive_section', ['recovery.rto', 'recovery.rpo', 'recovery.mttr'], {
    lessonId: 'resilience-assets-physical', sectionIndex: 1, sectionTitle: 'Recovery metrics answer different questions',
    // Stable pilot locator + checked title/index, not a claim of an existing UI anchor.
    rowLabels: ['RTO', 'RPO', 'MTTR'],
  }),
]);
export const COVERAGE_GAPS = freeze([
  { conceptId: 'recovery.rto', reason: 'insufficient_variant_coverage', detail: 'Two identification MCQs share one family; no independent post-miss application scenarios.' },
  { conceptId: 'recovery.rpo', reason: 'insufficient_variant_coverage', detail: 'Only one direct MCQ.' },
  { conceptId: 'recovery.mtd', reason: 'insufficient_variant_coverage', detail: 'Only one direct MCQ; no explicit MTD flashcard or lesson section.' },
  { conceptId: 'recovery.mttr', reason: 'insufficient_variant_coverage', detail: 'No direct MCQ. Flashcard and comparison row only.' },
  { conceptId: 'continuity.bia', reason: 'insufficient_variant_coverage', detail: 'One identification MCQ and flashcard; no dedicated BIA lesson section.' },
]);
