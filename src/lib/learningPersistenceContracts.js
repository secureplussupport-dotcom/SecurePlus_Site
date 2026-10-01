// Phase 2B-1 contracts only. Deliberately unused by production routes and UI.
// Context is trusted server state, never request JSON. SQL remains the concurrency authority.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,119}$/;
const VERSION = /^[a-z0-9][a-z0-9._-]{2,99}$/;
const CONCEPT = /^[a-z][a-z0-9_-]*\.[a-z0-9._-]+$/;
const STATES = ['not_enough_evidence', 'learning_signal', 'needs_attention', 'sticky', 'improving', 'proven', 'mastered'];
const LEVELS = ['none', 'limited', 'varied', 'retained', 'spaced'];
const VERSION_KEYS = ['mappingVersion', 'algorithmVersion', 'configurationVersion'];
const fail = message => { throw new Error(message); };
const requireThat = (condition, message) => condition || fail(message);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
function fields(value, allowed, required = allowed) {
  requireThat(object(value), 'Expected a plain object');
  for (const key of Object.keys(value)) requireThat(allowed.includes(key), `Forbidden field: ${key}`);
  for (const key of required) requireThat(Object.hasOwn(value, key), `Missing field: ${key}`);
}
function string(value, name, max = 240) {
  requireThat(typeof value === 'string' && value.trim().length > 0 && value.length <= max, `Invalid ${name}`);
  return value;
}
function uuid(value, name) { requireThat(typeof value === 'string' && UUID.test(value), `Invalid ${name}`); return value; }
function integer(value, name, min = 0, max = Number.MAX_SAFE_INTEGER) {
  requireThat(Number.isSafeInteger(value) && value >= min && value <= max, `Invalid ${name}`); return value;
}
function choice(value, choices, name) { requireThat(choices.includes(value), `Invalid ${name}`); return value; }
function strings(value, name, max = 30) {
  requireThat(Array.isArray(value) && value.length > 0 && value.length <= max && new Set(value).size === value.length, `Invalid ${name}`);
  value.forEach(v => string(v, name));
}
export function qualifiedTimestamp(value) {
  const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  requireThat(match, 'Timestamp must be ISO with an explicit timezone');
  const [, y, mo, d, h, mi, sec, zone, , zh, zm] = match;
  const date = new Date(Date.UTC(+y, +mo - 1, +d));
  const ms = Date.parse(value);
  requireThat(date.getUTCFullYear() === +y && date.getUTCMonth() === +mo - 1 && date.getUTCDate() === +d && +h < 24 && +mi < 60 && +sec < 60 &&
    (zone === 'Z' || (+zh <= 14 && +zm < 60 && (+zh < 14 || +zm === 0))) && Number.isSafeInteger(ms) && ms >= 0, 'Invalid timestamp');
  return ms;
}
export function validateConceptId(id) {
  requireThat(typeof id === 'string' && id.length <= 120 && CONCEPT.test(id), 'Invalid concept ID'); return id;
}
export function validateVersionId(id) {
  requireThat(typeof id === 'string' && VERSION.test(id), 'Invalid version ID'); return id;
}
export function validateVersions(input, context) {
  const result = {};
  VERSION_KEYS.forEach((key, i) => {
    const id = validateVersionId(input[key]);
    const version = context.catalog.versions.find(v => v.id === id && v.kind === ['mapping', 'algorithm', 'configuration'][i]);
    requireThat(version, `Unknown ${key}`);
    requireThat(context.allowProvisional === true || (version.reviewStatus === 'human_approved' && version.active === true), `Inactive or unapproved ${key}`);
    result[key] = id;
  });
  requireThat(context.catalog.versionSets.some(set => VERSION_KEYS.every(k => set[k] === result[k])), 'Unsupported version combination');
  return result;
}
const owner = context => uuid(context.authenticatedOwnerId, 'authenticated owner');
function owned(record, context, name) {
  requireThat(record && record.ownerId === owner(context), `Unknown or unowned ${name}`); return record;
}
function revision(id, context, mappingVersion) {
  uuid(id, 'question revision');
  const r = context.catalog.revisions.find(r => r.revisionId === id);
  requireThat(r && /^[mp]\d{3,6}$/.test(r.questionId), 'Unknown question revision');
  requireThat(r.mappings?.[mappingVersion]?.length, 'Revision missing mapping version');
  const mappings = r.mappings[mappingVersion];
  requireThat(mappings.filter(m => m.role === 'primary').length === 1 && new Set(mappings.map(m => m.conceptId)).size === mappings.length, 'Invalid primary/secondary roles');
  mappings.forEach(m => {
    validateConceptId(m.conceptId);
    choice(m.role, ['primary', 'secondary'], 'concept role');
    choice(m.precision, ['direct', 'coarse'], 'mapping precision');
    requireThat(context.catalog.concepts.some(c => c.id === m.conceptId && c.mappingVersion === mappingVersion && (context.allowProvisional === true || c.reviewStatus === 'human_approved')), 'Unknown mapped concept');
    requireThat(context.allowProvisional === true || m.reviewStatus === 'human_approved', 'Unapproved revision mapping');
  });
  return r;
}
export function validateSessionManifest(input, context) {
  const keys = ['ownerId', 'sessionId', 'setIndex', 'source', 'mode', 'seed', 'requestedCount', 'actualCount', 'requestedPbqCount', 'actualPbqCount', 'startedAt', 'items', ...VERSION_KEYS];
  fields(input, keys);
  owned(input, context, 'session'); uuid(input.sessionId, 'session ID');
  const versions = validateVersions(input, context);
  integer(input.setIndex, 'server allocated set index', 1);
  choice(input.source, ['practice', 'smart_review', 'diagnostic', 'exam', 'targeted_review'], 'source');
  choice(input.mode, ['normal', 'smart_review', 'diagnostic', 'exam', 'targeted_review'], 'mode');
  requireThat(input.seed === null || (typeof input.seed === 'string' && input.seed.length <= 200), 'Invalid seed');
  qualifiedTimestamp(input.startedAt);
  integer(input.requestedCount, 'requested count', 1, 500);
  integer(input.actualCount, 'actual count', 1, input.requestedCount);
  integer(input.requestedPbqCount, 'requested PBQ count', 0, input.requestedCount);
  integer(input.actualPbqCount, 'actual PBQ count', 0, Math.min(input.actualCount, input.requestedPbqCount));
  requireThat(Array.isArray(input.items) && input.items.length === input.actualCount, 'Manifest count mismatch');
  const seen = new Set(); let pbqs = 0;
  input.items.forEach((item, index) => {
    fields(item, ['position', 'revisionId']);
    requireThat(item.position === index + 1 && !seen.has(item.revisionId), 'Manifest positions/revisions must be unique');
    seen.add(item.revisionId);
    const r = revision(item.revisionId, context, versions.mappingVersion);
    requireThat(context.allowProvisional === true || r.active === true, 'Retired revision cannot start a new session');
    if (r.questionType === 'pbq') pbqs++;
  });
  requireThat(pbqs === input.actualPbqCount, 'Manifest PBQ count mismatch');
  return structuredClone(input);
}
export function validateStableSelections(input, questionRevision) {
  requireThat(Array.isArray(input) && input.length > 0 && input.length <= 100, 'Invalid selection count');
  const seen = new Set();
  const normalized = input.map(selection => {
    fields(selection, ['componentId', 'valueId']);
    for (const field of ['componentId', 'valueId']) requireThat(typeof selection[field] === 'string' && ID.test(selection[field]) && questionRevision.components.some(c => c.id === selection[field]), 'Unknown stable component identity');
    requireThat(!seen.has(selection.componentId), 'Duplicate selected component'); seen.add(selection.componentId);
    if (questionRevision.questionType === 'mcq') requireThat(input.length === 1 && selection.componentId === selection.valueId && questionRevision.components.some(c => c.id === selection.componentId && c.kind === 'option'), 'MCQ must select one stable option');
    return { ...selection };
  });
  return normalized.sort((a, b) => a.componentId < b.componentId ? -1 : a.componentId > b.componentId ? 1 : 0);
}
export function validateClientEvidence(input, context) {
  const keys = ['clientEventId', 'sessionId', 'itemPosition', 'revisionId', 'selectedComponents', 'occurredAt', 'responseDurationMs'];
  fields(input, keys, keys.filter(k => k !== 'responseDurationMs'));
  uuid(input.clientEventId, 'client event'); uuid(input.sessionId, 'session');
  const s = owned(context.sessions.find(s => s.sessionId === input.sessionId), context, 'session');
  // Historical retries keep the session's known versions even after deactivation.
  const versions = validateVersions(s, { ...context, allowProvisional: true });
  integer(input.itemPosition, 'item position', 1, s.actualCount);
  requireThat(s.items.some(i => i.position === input.itemPosition && i.revisionId === input.revisionId), 'Revision is not in session manifest');
  const r = revision(input.revisionId, { ...context, allowProvisional: true }, versions.mappingVersion);
  const occurred = qualifiedTimestamp(input.occurredAt), received = qualifiedTimestamp(context.receivedAt);
  requireThat(occurred >= qualifiedTimestamp(s.startedAt) && occurred <= received + 300000, 'Occurrence outside session/receipt bounds');
  if (input.responseDurationMs !== undefined && input.responseDurationMs !== null) integer(input.responseDurationMs, 'response duration', 0, Math.min(86400000, occurred - qualifiedTimestamp(s.startedAt)));
  return { clientEventId: input.clientEventId.toLowerCase(), sessionId: s.sessionId, itemPosition: input.itemPosition, revisionId: r.revisionId,
    selectedComponents: validateStableSelections(input.selectedComponents, r), occurredAt: new Date(occurred).toISOString(), responseDurationMs: input.responseDurationMs ?? null };
}
export function validateInterventionEvent(input, context) {
  fields(input, ['clientEventId', 'recommendationId', 'eventType', 'activityType', 'occurredAt']);
  uuid(input.clientEventId, 'client event'); uuid(input.recommendationId, 'recommendation');
  const r = owned(context.recommendations.find(r => r.recommendationId === input.recommendationId), context, 'recommendation');
  choice(input.eventType, ['shown', 'opened', 'started', 'completed', 'skipped', 'dismissed', 'postponed', 'mapping_reported'], 'intervention event');
  choice(input.activityType, ['lesson_open', 'lesson_steps', 'lesson_check', 'flashcard_review', 'targeted_practice'], 'intervention activity');
  const occurred = qualifiedTimestamp(input.occurredAt);
  requireThat(occurred >= qualifiedTimestamp(r.createdAt) && occurred <= qualifiedTimestamp(context.receivedAt) + 300000, 'Invalid intervention time');
  requireThat(r.allowedActivities.includes(input.activityType), 'Activity does not match recommended content');
  // A client completion is a claim. Only a future trusted completion evaluator may mark it verified.
  return { ...input, occurredAt: new Date(occurred).toISOString(), clientEventId: input.clientEventId.toLowerCase() };
}
function knownConcept(input, context) {
  validateConceptId(input.conceptId);
  const c = context.catalog.concepts.find(c => c.id === input.conceptId && c.mappingVersion === input.mappingVersion);
  requireThat(c, 'Unknown concept');
  requireThat(context.allowProvisional === true || c.reviewStatus === 'human_approved', 'Unapproved concept'); return c;
}
export function validateReviewTask(input, context) {
  fields(input, ['ownerId', 'taskId', 'schedulingKey', 'conceptId', 'sourceEvidenceId', 'targetRevisionId', 'taskType', 'reasonCodes', 'eligibleAt', 'eligibleSetIndex', 'initialStatus', ...VERSION_KEYS]);
  owned(input, context, 'review task'); uuid(input.taskId, 'task'); string(input.schedulingKey, 'scheduling key');
  validateVersions(input, context); knownConcept(input, context);
  const source = owned(context.evidence.find(e => e.evidenceId === input.sourceEvidenceId), context, 'source evidence');
  requireThat(source.provenance === 'complete' && source.evidencePrecision === 'direct' && source.conceptSnapshot.some(c => c.conceptId === input.conceptId) && VERSION_KEYS.every(k => source[k] === input[k]), 'Task requires matching direct evidence');
  choice(input.taskType, ['transfer', 'original_recall', 'delayed_proof', 'maintenance', 'insufficient_variant_coverage'], 'task type');
  strings(input.reasonCodes, 'reason codes'); qualifiedTimestamp(input.eligibleAt); integer(input.eligibleSetIndex, 'eligible set index', 1);
  if (input.taskType === 'insufficient_variant_coverage') requireThat(input.targetRevisionId === null && input.initialStatus === 'unavailable', 'Coverage shortage cannot invent a target');
  else {
    requireThat(input.initialStatus === 'pending', 'Invalid initial task status');
    const target = revision(input.targetRevisionId, context, input.mappingVersion);
    requireThat(target.questionType === 'mcq' && target.active && target.mappings[input.mappingVersion].some(m => m.conceptId === input.conceptId && m.precision === 'direct'), 'Target needs an active direct mapping');
    if (input.taskType === 'original_recall') requireThat(target.revisionId === source.revisionId, 'Original recall must preserve its revision');
    if (input.taskType === 'transfer') requireThat(target.questionId !== source.questionId && target.scenarioFamily !== source.scenarioFamily && !context.evidence.some(e => e.ownerId === owner(context) && (e.questionId === target.questionId || e.scenarioFamily === target.scenarioFamily)), 'Transfer must be a fresh scenario');
  }
  return structuredClone(input);
}
export function validateProjection(input, context) {
  fields(input, ['ownerId', 'conceptId', 'state', 'evidenceLevel', 'effectiveSample', 'distinctQuestions', 'distinctScenarios', 'completeEvidenceCount', 'everSticky', 'lapseCount', 'unresolvedEvidenceIds', 'lastAnswerAt', 'lastInterventionAt', 'provenAt', 'masteredAt', 'nextDueTaskId', 'inputGeneration', 'receiptWatermark', 'replayFrom', 'inputSha256', 'projectionStatus', 'recomputedAt', ...VERSION_KEYS]);
  owned(input, context, 'projection'); validateVersions(input, context);
  requireThat(knownConcept(input, context).nodeKind === 'mastery_concept', 'Support-only concept cannot receive mastery');
  choice(input.state, STATES, 'state'); choice(input.evidenceLevel, LEVELS, 'evidence level');
  choice(input.projectionStatus, ['stale', 'rebuilding', 'ready', 'failed'], 'projection status');
  requireThat(Number.isFinite(input.effectiveSample) && input.effectiveSample >= 0 && input.effectiveSample <= 1e9, 'Invalid effective sample');
  integer(input.distinctQuestions, 'distinct questions', 0, 1e6); integer(input.distinctScenarios, 'distinct scenarios', 0, input.distinctQuestions);
  integer(input.completeEvidenceCount, 'complete evidence count'); integer(input.lapseCount, 'lapse count');
  integer(input.inputGeneration, 'input generation'); integer(input.receiptWatermark, 'receipt watermark');
  requireThat(typeof input.everSticky === 'boolean' && /^[0-9a-f]{64}$/.test(input.inputSha256), 'Invalid projection diagnostics');
  requireThat(input.projectionStatus !== 'ready' || input.inputGeneration === context.inputGeneration, 'Stale replay generation');
  qualifiedTimestamp(input.replayFrom); qualifiedTimestamp(input.recomputedAt);
  for (const key of ['lastAnswerAt', 'lastInterventionAt', 'provenAt', 'masteredAt']) if (input[key] !== null) requireThat(qualifiedTimestamp(input[key]) <= qualifiedTimestamp(input.recomputedAt), 'Projection time exceeds recomputation time');
  requireThat(Array.isArray(input.unresolvedEvidenceIds) && new Set(input.unresolvedEvidenceIds).size === input.unresolvedEvidenceIds.length, 'Invalid contradictions');
  const complete = prepareReplayEvidence(context.evidence, context).filter(e => e.conceptSnapshot.some(c => c.conceptId === input.conceptId) && VERSION_KEYS.every(k => e[k] === input[k]) && e.receiptIndex <= input.receiptWatermark);
  requireThat(input.completeEvidenceCount === complete.length, 'Complete evidence count must match replay');
  input.unresolvedEvidenceIds.forEach(id => requireThat(complete.some(e => e.evidenceId === id && e.correct === false), 'Unknown contradiction'));
  if (['proven', 'mastered'].includes(input.state)) {
    requireThat(complete.length > 0 && input.unresolvedEvidenceIds.length === 0 && input.provenAt !== null, 'Legacy-only or unresolved evidence cannot prove mastery');
    requireThat(input.evidenceLevel === (input.state === 'mastered' ? 'spaced' : 'retained'), 'State/evidence level mismatch');
  }
  if (input.state === 'mastered') requireThat(input.masteredAt !== null && qualifiedTimestamp(input.masteredAt) > qualifiedTimestamp(input.provenAt), 'Mastery requires a later observation');
  if (input.nextDueTaskId !== null) requireThat(context.tasks.some(t => t.taskId === input.nextDueTaskId && t.ownerId === input.ownerId && t.conceptId === input.conceptId && VERSION_KEYS.every(k => t[k] === input[k])), 'Unknown next task');
  return structuredClone(input);
}
export function canonicalPayload(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalPayload).join(',')}]`;
  if (object(value)) return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonicalPayload(value[k])}`).join(',')}}`;
  requireThat(value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value)), 'Non-JSON payload');
  return JSON.stringify(value);
}
export function classifyRetry(existing, normalized, context) {
  if (!existing) return 'insert';
  owned(existing, context, 'idempotency record');
  requireThat(existing.clientEventId === normalized.clientEventId, 'Idempotency key mismatch');
  requireThat(existing.canonicalPayload === canonicalPayload(normalized), 'Conflicting idempotency payload');
  return 'retry';
}
export function prepareReplayEvidence(rows, context) {
  const all = rows.filter(e => e.ownerId === owner(context));
  const superseded = new Set(all.map(e => e.supersedesEvidenceId).filter(Boolean));
  const boundary = context.completeEvidenceFrom === null ? Infinity : qualifiedTimestamp(context.completeEvidenceFrom);
  return all.filter(e => !superseded.has(e.evidenceId) && e.provenance === 'complete' && e.evidencePrecision === 'direct' && qualifiedTimestamp(e.occurredAt) >= boundary)
    .sort((a, b) => qualifiedTimestamp(a.occurredAt) - qualifiedTimestamp(b.occurredAt) || a.setIndex - b.setIndex || (a.evidenceId < b.evidenceId ? -1 : a.evidenceId > b.evidenceId ? 1 : 0));
}
