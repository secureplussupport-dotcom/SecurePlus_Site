import { LEARNING_CONFIG, versions } from './learningConfig.js';
import { LEARNING_CONCEPTS } from '../data/learningConcepts.js';
import { QUESTION_MAPPINGS, CONTENT_MAPPINGS } from '../data/learningMappings.js';

export function timestamp(value, label = 'time') {
  // Never parse locale-dependent or zone-less date strings, or supply a hidden clock.
  const result = typeof value === 'number' ? value : typeof value === 'string' && /T.*(Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;
  if (!Number.isSafeInteger(result) || result < 0) throw new Error(`Invalid ${label}`);
  return result;
}
const requireString = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${label}`);
  return value;
};
// Prefer trusted format metadata; numeric MCQ IDs retain legacy exposure when metadata is absent.
export function isMcqIdentity({questionId,format}) {
  return typeof questionId === 'string' && !/^p\d+$/i.test(questionId) && (format === undefined ? /^m\d+$/i.test(questionId) : format === 'mcq');
}

export function validateMappings(mappings, concepts, config) {
  const ids = new Set(concepts.map(c => c.id));
  const seen = new Set();
  for (const m of mappings) {
    if (m.format !== 'mcq' || !isMcqIdentity(m)) throw new Error('Adaptive mappings must be MCQ-only');
    const key = `${m.questionId}@${m.questionRevision}`;
    if (seen.has(key)) throw new Error(`Duplicate mapping ${key}`);
    seen.add(key);
    for (const field of ['questionId', 'questionRevision', 'scenarioFamily']) requireString(m[field], field);
    if (!ids.has(m.primaryConceptId) || !Array.isArray(m.secondaryConceptIds) || m.secondaryConceptIds.some(id => !ids.has(id) || id === m.primaryConceptId) || new Set(m.secondaryConceptIds).size !== m.secondaryConceptIds.length) throw new Error(`Invalid concept roles ${key}`);
    if (!Object.hasOwn(config.weights.difficulty, m.difficulty) || !['direct', 'coarse'].includes(m.evidencePrecision)) throw new Error(`Invalid mapping evidence ${key}`);
    if (m.mappingVersion !== config.mappingVersion || !config.allowedReviewStatuses.includes(m.editorialStatus)) throw new Error(`Unreviewed or incompatible mapping ${key}`);
  }
}

// Raw input has no authority over concept roles, independence, or versions.
// Duplicate IDs must describe the same semantic event; conflicts fail closed.
export function normalizeLearningEvidence(raw, {
  now, mappings = QUESTION_MAPPINGS, concepts = LEARNING_CONCEPTS,
  contentMappings = CONTENT_MAPPINGS, config = LEARNING_CONFIG, priorExposure = [],
} = {}) {
  const clock = timestamp(now, 'now');
  validateMappings(mappings, concepts, config);
  const byRevision = new Map(mappings.map(m => [`${m.questionId}@${m.questionRevision}`, m]));
  const byId = new Map();
  for (const input of raw) {
    const eventId = requireString(input.eventId, 'eventId');
    const occurredAt = timestamp(input.occurredAt, 'occurredAt');
    if (!Number.isSafeInteger(input.setIndex) || input.setIndex < 0) throw new Error(`Invalid setIndex ${eventId}`);
    for (const [key, value] of Object.entries(versions(config))) if (input[key] !== undefined && input[key] !== value) throw new Error(`Incompatible ${key} ${eventId}`);
    let event = { eventId, kind: input.kind, occurredAt, setIndex: input.setIndex, ...versions(config) };
    if (input.kind === 'answer') {
      if ((input.format !== undefined && input.format !== 'mcq') || (input.questionType !== undefined && input.questionType !== 'mcq')) throw new Error('Adaptive answers must be MCQ-only');
      const m = byRevision.get(`${input.questionId}@${input.questionRevision}`);
      if (!m || typeof input.correct !== 'boolean') throw new Error(`Unknown revision or invalid correctness ${eventId}`);
      event = { ...event, format: 'mcq', questionId: m.questionId, questionRevision: m.questionRevision,
        primaryConceptId: m.primaryConceptId, secondaryConceptIds: [...m.secondaryConceptIds],
        conceptRoles: [{ conceptId: m.primaryConceptId, role: 'primary' }, ...m.secondaryConceptIds.map(conceptId => ({ conceptId, role: 'secondary' }))],
        correct: input.correct, scenarioFamily: m.scenarioFamily, difficulty: m.difficulty,
        evidencePrecision: m.evidencePrecision, provenance: m.provenance,
        interventionId: input.interventionId ?? null,
      };
    } else if (input.kind === 'intervention_completed') {
      const link = contentMappings.find(c => c.contentId === input.contentId && c.conceptIds.includes(input.conceptId) && c.mappingVersion === config.mappingVersion && config.allowedReviewStatuses.includes(c.editorialStatus));
      if (!link || !concepts.some(c => c.id === input.conceptId)) throw new Error(`Unknown intervention content ${eventId}`);
      event = { ...event, conceptId: input.conceptId, contentId: input.contentId, sourceEventId: requireString(input.sourceEventId, 'sourceEventId') };
    } else throw new Error(`Unknown event kind ${eventId}`);
    const previous = byId.get(eventId);
    if (previous && JSON.stringify(previous) !== JSON.stringify(event)) throw new Error(`Conflicting duplicate ${eventId}`);
    byId.set(eventId, event);
  }
  const sorted = [...byId.values()].sort((a, b) => a.occurredAt - b.occurredAt || a.setIndex - b.setIndex || compareIds(a.eventId, b.eventId));
  let lastSet = -1;
  // Trusted full-history adapters may conservatively retain exposure from
  // incomplete or differently versioned history without awarding evidence.
  const mcqExposure = priorExposure.filter(e => isMcqIdentity({questionId:e.questionId,format:e.questionType??e.format??mappings.find(m=>m.questionId===e.questionId)?.format}));
  const seenQuestions = new Set(mcqExposure.map(e => e.questionId).filter(Boolean));
  const seenScenarios = new Set(mcqExposure.map(e => e.scenarioFamily).filter(Boolean));
  for (const event of sorted) {
    if (event.setIndex < lastSet) throw new Error('Set index must be monotonic with occurrence time');
    lastSet = event.setIndex;
    if (event.kind === 'intervention_completed') {
      const source = byId.get(event.sourceEventId);
      if (!source || source.kind !== 'answer' || source.correct || source.evidencePrecision !== 'direct' || !source.conceptRoles.some(r => r.conceptId === event.conceptId) || source.occurredAt >= event.occurredAt) throw new Error(`Invalid intervention source ${event.eventId}`);
    } else {
      if (event.interventionId) {
        const link = byId.get(event.interventionId);
        if (!link || link.kind !== 'intervention_completed' || link.occurredAt >= event.occurredAt || !event.conceptRoles.some(r => r.conceptId === link.conceptId)) throw new Error(`Invalid intervention linkage ${event.eventId}`);
      }
      // Question identity (not revision) prevents a minor edit from becoming fresh evidence.
      event.classification = seenQuestions.has(event.questionId) ? 'exact_repeat' : seenScenarios.has(event.scenarioFamily) ? 'same_scenario' : 'fresh_scenario';
      seenQuestions.add(event.questionId);
      seenScenarios.add(event.scenarioFamily);
    }
  }
  return { events: sorted.filter(e => e.occurredAt <= clock), deferredEventIds: sorted.filter(e => e.occurredAt > clock).map(e => e.eventId), now: clock, ...versions(config) };
}

export function compareIds(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
