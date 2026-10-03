import { assertOwnerWritable } from './owner-guard.mjs';
import { createHash } from 'node:crypto';
import { canonicalPayload, qualifiedTimestamp, validateStableSelections } from '../../src/lib/learningPersistenceContracts.js';
import { gradeRevision } from './revision.mjs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VERSION = /^[a-z0-9][a-z0-9._-]{2,99}$/;
const SOURCES = new Set(['practice', 'smart_review', 'diagnostic', 'exam', 'targeted_review']);
const MODES = new Set(['normal', 'smart_review', 'diagnostic', 'exam', 'targeted_review']);
const sha256 = value => createHash('sha256').update(value).digest('hex');
const requireThat = (ok, message) => { if (!ok) throw new Error(message); };

export class AdaptiveConflictError extends Error {
  constructor(message) { super(message); this.name = 'AdaptiveConflictError'; this.code = 'adaptive_conflict'; }
}

function exactFields(value, allowed) {
  requireThat(value && typeof value === 'object' && !Array.isArray(value), 'Expected an object');
  for (const key of Object.keys(value)) requireThat(allowed.includes(key), `Forbidden field: ${key}`);
}

function uuid(value, name) { requireThat(typeof value === 'string' && UUID.test(value), `Invalid ${name}`); return value.toLowerCase(); }
function version(value, name) { requireThat(typeof value === 'string' && VERSION.test(value), `Invalid ${name}`); return value; }
function integer(value, name, min, max) { requireThat(Number.isSafeInteger(value) && value >= min && value <= max, `Invalid ${name}`); return value; }

function normalizeSessionPlan(plan) {
  const allowed = ['sessionId', 'source', 'mode', 'seed', 'requestedCount', 'requestedPbqCount', 'revisionIds', 'mappingVersion', 'algorithmVersion', 'configurationVersion'];
  exactFields(plan, allowed);
  const revisionIds = plan.revisionIds;
  requireThat(Array.isArray(revisionIds) && revisionIds.length >= 1 && revisionIds.length <= 500 && new Set(revisionIds).size === revisionIds.length, 'Invalid session revisions');
  revisionIds.forEach(id => uuid(id, 'revision ID'));
  requireThat(SOURCES.has(plan.source) && MODES.has(plan.mode), 'Invalid session source or mode');
  requireThat(plan.seed == null || (typeof plan.seed === 'string' && plan.seed.length <= 200), 'Invalid session seed');
  integer(plan.requestedCount, 'requested count', revisionIds.length, 500);
  integer(plan.requestedPbqCount, 'requested PBQ count', 0, plan.requestedCount);
  return {
    sessionId: uuid(plan.sessionId, 'session ID'), source: plan.source, mode: plan.mode, seed: plan.seed ?? null,
    requestedCount: plan.requestedCount, requestedPbqCount: plan.requestedPbqCount,
    revisionIds: revisionIds.map(id => id.toLowerCase()),
    mappingVersion: version(plan.mappingVersion, 'mapping version'),
    algorithmVersion: version(plan.algorithmVersion, 'algorithm version'),
    configurationVersion: version(plan.configurationVersion, 'configuration version'),
  };
}

export async function startAdaptiveSession(sql, authenticatedOwnerId, input) {
  const ownerId = uuid(authenticatedOwnerId, 'authenticated owner');
  const plan = normalizeSessionPlan(input);
  return sql.begin(async tx => {
    // Match the deletion lock and serialize retry/allocation for this owner.
    await assertOwnerWritable(tx, ownerId);
    const [existing] = await tx`select * from public.adaptive_sessions where owner_id=${ownerId} and session_id=${plan.sessionId}`;
    if (existing) {
      const items = await tx`select revision_id from public.adaptive_session_items where owner_id=${ownerId} and session_id=${plan.sessionId} order by position`;
      const previous = { sessionId: existing.session_id, source: existing.source, mode: existing.mode, seed: existing.seed,
        requestedCount: existing.requested_count, requestedPbqCount: existing.requested_pbq_count,
        revisionIds: items.map(i => i.revision_id), mappingVersion: existing.mapping_version,
        algorithmVersion: existing.algorithm_version, configurationVersion: existing.configuration_version };
      if (canonicalPayload(previous) !== canonicalPayload(plan)) throw new AdaptiveConflictError('Conflicting session retry');
      return { status: 'retry', sessionId: existing.session_id, ownerId, setIndex: Number(existing.set_index), startedAt: existing.started_at.toISOString(), revisionIds: plan.revisionIds };
    }
    const revisions = await tx`
      select revision_id, question_type
      from public.adaptive_question_revisions
      where revision_id in ${tx(plan.revisionIds)}
    `;
    requireThat(revisions.length === plan.revisionIds.length, 'Unknown session revision');
    const byId = new Map(revisions.map(row => [row.revision_id, row]));
    const actualPbqCount = plan.revisionIds.filter(id => byId.get(id)?.question_type === 'pbq').length;
    requireThat(actualPbqCount <= plan.requestedPbqCount, 'Actual PBQ count exceeds requested count');
    const [session] = await tx`
      insert into public.adaptive_sessions(
        session_id, owner_id, set_index, source, mode, seed,
        requested_count, actual_count, requested_pbq_count, actual_pbq_count,
        mapping_version, algorithm_version, configuration_version
      ) values (
        ${plan.sessionId}, ${ownerId}, 1, ${plan.source}, ${plan.mode}, ${plan.seed},
        ${plan.requestedCount}, ${plan.revisionIds.length}, ${plan.requestedPbqCount}, ${actualPbqCount},
        ${plan.mappingVersion}, ${plan.algorithmVersion}, ${plan.configurationVersion}
      ) returning session_id, owner_id, set_index, started_at
    `;
    for (let index = 0; index < plan.revisionIds.length; index += 1) {
      await tx`
        insert into public.adaptive_session_items(owner_id, session_id, position, revision_id)
        values (${ownerId}, ${plan.sessionId}, ${index + 1}, ${plan.revisionIds[index]})
      `;
    }
    await tx`insert into public.adaptive_session_events(owner_id,session_id,client_event_id,status,occurred_at)
      values (${ownerId},${plan.sessionId},${plan.sessionId},'started',${session.started_at})`;
    await tx`set constraints all immediate`;
    return {
      status: 'inserted',
      sessionId: session.session_id,
      ownerId: session.owner_id,
      setIndex: Number(session.set_index),
      startedAt: session.started_at.toISOString(),
      revisionIds: [...plan.revisionIds],
    };
  });
}

function normalizeAnswer(input) {
  const allowed = ['clientEventId', 'sessionId', 'itemPosition', 'revisionId', 'selectedComponents', 'occurredAt', 'responseDurationMs', 'supersedesEvidenceId', 'correctionReason'];
  exactFields(input, allowed);
  qualifiedTimestamp(input.occurredAt);
  if (input.responseDurationMs != null) integer(input.responseDurationMs, 'response duration', 0, 86400000);
  if (input.supersedesEvidenceId != null) uuid(input.supersedesEvidenceId, 'superseded evidence');
  requireThat((input.supersedesEvidenceId == null) === (input.correctionReason == null), 'Correction identity and reason must be supplied together');
  if (input.correctionReason != null) requireThat(typeof input.correctionReason === 'string' && input.correctionReason.length >= 1 && input.correctionReason.length <= 1000, 'Invalid correction reason');
  return {
    clientEventId: uuid(input.clientEventId, 'client event'),
    sessionId: uuid(input.sessionId, 'session'), itemPosition: integer(input.itemPosition, 'item position', 1, 500),
    revisionId: uuid(input.revisionId, 'revision'), selectedComponents: input.selectedComponents,
    occurredAt: new Date(qualifiedTimestamp(input.occurredAt)).toISOString(), responseDurationMs: input.responseDurationMs ?? null,
    supersedesEvidenceId: input.supersedesEvidenceId?.toLowerCase() ?? null, correctionReason: input.correctionReason ?? null,
  };
}

function safeEvidence(row, status) {
  return {
    status,
    evidenceId: row.evidence_id,
    correct: row.correct,
    score: Number(row.score_fraction),
    evidencePrecision: row.evidence_precision,
    classification: row.classification_at_ingest,
    receivedAt: row.received_at.toISOString(),
  };
}

export async function ingestAdaptiveAnswer(sql, authenticatedOwnerId, input) {
  const ownerId = uuid(authenticatedOwnerId, 'authenticated owner');
  const answer = normalizeAnswer(input);
  const submissionSha256 = sha256(canonicalPayload(answer));
  const readRetry = async () => sql.begin(async tx => {
    await assertOwnerWritable(tx, ownerId);
    const [existing] = await tx`
      select evidence_id, submission_sha256, correct, score_fraction, evidence_precision, classification_at_ingest, received_at
      from public.adaptive_answer_evidence
      where owner_id=${ownerId} and client_event_id=${answer.clientEventId}
    `;
    if (!existing) return null;
    if (existing.submission_sha256 !== submissionSha256) throw new AdaptiveConflictError('Client event ID was already used for a different answer');
    return safeEvidence(existing, 'retry');
  });
  try {
    return await sql.begin(async tx => {
    await assertOwnerWritable(tx, ownerId);
    const [existing] = await tx`
      select evidence_id, submission_sha256, correct, score_fraction, evidence_precision, classification_at_ingest, received_at
      from public.adaptive_answer_evidence
      where owner_id=${ownerId} and client_event_id=${answer.clientEventId}
    `;
    if (existing) {
      if (existing.submission_sha256 !== submissionSha256) throw new AdaptiveConflictError('Client event ID was already used for a different answer');
      return safeEvidence(existing, 'retry');
    }

    const [record] = await tx`
      select s.owner_id, s.source, s.mode, s.mapping_version, s.algorithm_version, s.configuration_version,
        s.started_at, s.set_index, q.revision_id, q.question_id, q.question_type, q.content_signature,
        q.scenario_family, g.grading_payload
      from public.adaptive_sessions s
      join public.adaptive_session_items i on i.owner_id=s.owner_id and i.session_id=s.session_id
      join public.adaptive_question_revisions q on q.revision_id=i.revision_id
      join adaptive_private.grading_keys g on g.revision_id=q.revision_id
      where s.owner_id=${ownerId} and s.session_id=${answer.sessionId}
        and i.position=${answer.itemPosition} and i.revision_id=${answer.revisionId}
    `;
    requireThat(record, 'Unknown or unowned session item');
    const startedAt = new Date(record.started_at);
    requireThat(new Date(answer.occurredAt) >= startedAt, 'Answer predates the session');
    requireThat(answer.responseDurationMs == null || answer.responseDurationMs <= new Date(answer.occurredAt) - startedAt, 'Response duration exceeds session age');

    const components = await tx`
      select component_id as id, component_kind as kind
      from public.adaptive_answer_components where revision_id=${answer.revisionId}
      order by component_id
    `;
    const compiled = record.grading_payload?.compiledRevision;
    requireThat(compiled && compiled.revisionId === record.revision_id && compiled.questionId === record.question_id &&
      compiled.questionType === record.question_type && `sha256:${compiled.contentSha256}` === record.content_signature,
    'Protected grading revision does not match the published revision');
    requireThat(canonicalPayload(compiled.components.map(({ id, kind }) => ({ id, kind })).sort((a, b) => a.id.localeCompare(b.id))) ===
      canonicalPayload(components.map(({ id, kind }) => ({ id, kind }))), 'Protected grading components do not match the public identities');
    const selected = validateStableSelections(answer.selectedComponents, compiled);
    const graded = gradeRevision(compiled, selected);

    let classification = 'fresh_scenario';
    if (answer.supersedesEvidenceId) {
      const [previous] = await tx`
        select classification_at_ingest from public.adaptive_answer_evidence
        where owner_id=${ownerId} and evidence_id=${answer.supersedesEvidenceId}
      `;
      requireThat(previous, 'Unknown correction target');
      classification = previous.classification_at_ingest;
    } else {
      const exposure = await tx`
        select q.question_id, q.scenario_family
        from public.adaptive_answer_evidence e
        join public.adaptive_question_revisions q on q.revision_id=e.revision_id
        where e.owner_id=${ownerId} and e.provenance='complete'
        order by e.receipt_index
      `;
      classification = exposure.some(row => row.question_id === record.question_id) ? 'exact_repeat' :
        exposure.some(row => row.scenario_family === record.scenario_family) ? 'same_scenario' : 'fresh_scenario';
    }

    const [inserted] = await tx`
      insert into public.adaptive_answer_evidence(
        owner_id, client_event_id, submission_sha256, session_id, item_position, revision_id, question_id,
        selected_components, correct, score_fraction, mapping_version, algorithm_version, configuration_version,
        evidence_precision, provenance, source, mode, occurred_at, response_duration_ms,
        classification_at_ingest, classification_provenance, supersedes_evidence_id, correction_reason
      ) values (
        ${ownerId}, ${answer.clientEventId}, ${submissionSha256}, ${answer.sessionId}, ${answer.itemPosition}, ${answer.revisionId}, ${record.question_id},
        ${tx.json(selected)}, ${graded.correct}, ${graded.score}, ${record.mapping_version}, ${record.algorithm_version}, ${record.configuration_version},
        ${graded.evidencePrecision}, 'complete', ${record.source}, ${record.mode}, ${answer.occurredAt}, ${answer.responseDurationMs},
        ${classification}, 'server_history_snapshot', ${answer.supersedesEvidenceId}, ${answer.correctionReason}
      ) returning evidence_id, correct, score_fraction, evidence_precision, classification_at_ingest, received_at
    `;
    return safeEvidence(inserted, 'inserted');
    });
  } catch (error) {
    if (error?.code !== '23505') throw error;
    const retry = await readRetry();
    if (retry) return retry;
    throw error;
  }
}

// Session lifecycle is separate from question evidence and never creates proof.
export async function recordAdaptiveSessionEvent(sql, authenticatedOwnerId, input) {
  const ownerId = uuid(authenticatedOwnerId, 'authenticated owner');
  exactFields(input, ['clientEventId', 'sessionId', 'status', 'occurredAt']);
  const value = { clientEventId: uuid(input.clientEventId, 'client event'), sessionId: uuid(input.sessionId, 'session'),
    status: input.status, occurredAt: new Date(qualifiedTimestamp(input.occurredAt)).toISOString() };
  requireThat(['completed', 'abandoned'].includes(value.status), 'Invalid session lifecycle event');
  return sql.begin(async tx => {
    await assertOwnerWritable(tx, ownerId);
    const [existing] = await tx`select * from public.adaptive_session_events where owner_id=${ownerId} and client_event_id=${value.clientEventId}`;
    if (existing) {
      if (existing.session_id !== value.sessionId || existing.status !== value.status || existing.occurred_at.toISOString() !== value.occurredAt) throw new AdaptiveConflictError('Conflicting session event retry');
      return { status: 'retry', eventId: existing.event_id };
    }
    const [event] = await tx`
      insert into public.adaptive_session_events(owner_id,session_id,client_event_id,status,occurred_at)
      select ${ownerId},session_id,${value.clientEventId},${value.status},${value.occurredAt}::timestamptz
      from public.adaptive_sessions where owner_id=${ownerId} and session_id=${value.sessionId}
        and started_at<=${value.occurredAt}::timestamptz and ${value.occurredAt}::timestamptz<=clock_timestamp()+interval '5 minutes'
      returning event_id
    `;
    requireThat(event, 'Invalid or unowned session lifecycle event');
    // A late close can resolve chronology quarantine; schedule a fresh replay.
    await tx`update adaptive_private.owner_state set evidence_generation=evidence_generation+1,replay_status='idle',quarantine_reasons='{}' where owner_id=${ownerId}`;
    await tx`update public.adaptive_concept_projections set projection_status='stale' where owner_id=${ownerId}`;
    return { status: 'inserted', eventId: event.event_id };
  });
}

function normalizedVersions(input) {
  return {
    mappingVersion: version(input.mappingVersion, 'mapping version'),
    algorithmVersion: version(input.algorithmVersion, 'algorithm version'),
    configurationVersion: version(input.configurationVersion, 'configuration version'),
  };
}

export async function persistAdaptiveRecommendation(sql, authenticatedOwnerId, input) {
  const ownerId = uuid(authenticatedOwnerId, 'authenticated owner');
  const allowed = ['conceptId', 'contentRevisionId', 'sourceEvidenceId', 'role', 'reasonCodes', 'mappingVersion', 'algorithmVersion', 'configurationVersion'];
  exactFields(input, allowed);
  const versionIds = normalizedVersions(input);
  requireThat(typeof input.conceptId === 'string' && input.conceptId.length <= 120, 'Invalid concept ID');
  if (input.contentRevisionId != null) uuid(input.contentRevisionId, 'content revision');
  uuid(input.sourceEvidenceId, 'source evidence');
  requireThat(['direct', 'supporting'].includes(input.role), 'Invalid recommendation role');
  requireThat(Array.isArray(input.reasonCodes) && input.reasonCodes.length >= 1 && input.reasonCodes.length <= 30 && input.reasonCodes.every(code => typeof code === 'string' && code.length >= 1), 'Invalid recommendation reasons');
  const identity = { ownerId, conceptId: input.conceptId, contentRevisionId: input.contentRevisionId ?? null, sourceEvidenceId: input.sourceEvidenceId, role: input.role, reasonCodes: [...input.reasonCodes].sort(), ...versionIds };
  const schedulingKey = `recommendation:${sha256(canonicalPayload(identity))}`;
  return sql.begin(async tx => {
    await assertOwnerWritable(tx, ownerId);
    const [inserted] = await tx`
      insert into public.adaptive_recommendations(owner_id,scheduling_key,concept_id,content_revision_id,source_evidence_id,role,reason_codes,mapping_version,algorithm_version,configuration_version)
      values (${ownerId},${schedulingKey},${input.conceptId},${input.contentRevisionId ?? null},${input.sourceEvidenceId},${input.role},${identity.reasonCodes},${versionIds.mappingVersion},${versionIds.algorithmVersion},${versionIds.configurationVersion})
      on conflict(owner_id,scheduling_key) do nothing
      returning recommendation_id,created_at,concept_id,content_revision_id,source_evidence_id,role,reason_codes,mapping_version,algorithm_version,configuration_version
    `;
    const row = inserted ?? (await tx`
      select recommendation_id,created_at,concept_id,content_revision_id,source_evidence_id,role,reason_codes,mapping_version,algorithm_version,configuration_version
      from public.adaptive_recommendations where owner_id=${ownerId} and scheduling_key=${schedulingKey}
    `)[0];
    requireThat(row && row.concept_id === input.conceptId && row.source_evidence_id === input.sourceEvidenceId, 'Recommendation identity conflict');
    return { status: inserted ? 'inserted' : 'retry', recommendationId: row.recommendation_id, createdAt: row.created_at.toISOString() };
  });
}

export async function recordAdaptiveIntervention(sql, authenticatedOwnerId, input, { verifyCompletion } = {}) {
  const ownerId = uuid(authenticatedOwnerId, 'authenticated owner');
  exactFields(input, ['clientEventId', 'recommendationId', 'eventType', 'activityType', 'occurredAt']);
  const normalized = {
    clientEventId: uuid(input.clientEventId, 'client event'), recommendationId: uuid(input.recommendationId, 'recommendation'),
    eventType: input.eventType, activityType: input.activityType, occurredAt: new Date(qualifiedTimestamp(input.occurredAt)).toISOString(),
  };
  requireThat(['shown', 'opened', 'started', 'completed', 'skipped', 'dismissed', 'postponed', 'mapping_reported'].includes(normalized.eventType), 'Invalid intervention event');
  requireThat(['lesson_open', 'lesson_steps', 'lesson_check', 'flashcard_review', 'targeted_practice'].includes(normalized.activityType), 'Invalid intervention activity');
  const submissionSha256 = sha256(canonicalPayload(normalized));
  const write = async () => sql.begin(async tx => {
    await assertOwnerWritable(tx, ownerId);
    const [existing] = await tx`select intervention_id,submission_sha256,completion_verified,received_at from public.adaptive_interventions where owner_id=${ownerId} and client_event_id=${normalized.clientEventId}`;
    if (existing) {
      if (existing.submission_sha256 !== submissionSha256) throw new AdaptiveConflictError('Client event ID was already used for a different intervention');
      return { status: 'retry', interventionId: existing.intervention_id, completionVerified: existing.completion_verified, receivedAt: existing.received_at.toISOString() };
    }
    const [recommendation] = await tx`
      select r.*,c.content_kind from public.adaptive_recommendations r
      left join public.adaptive_content_revisions c on c.content_revision_id=r.content_revision_id
      where r.owner_id=${ownerId} and r.recommendation_id=${normalized.recommendationId}
    `;
    requireThat(recommendation?.content_revision_id, 'Unknown recommendation or missing mapped content');
    const allowedByContent = {
      flashcard: ['flashcard_review'], lesson: ['lesson_open', 'lesson_steps', 'lesson_check'],
      lesson_section: ['lesson_open', 'lesson_steps', 'lesson_check'], lesson_check: ['lesson_check'], targeted_practice: ['targeted_practice'],
    };
    requireThat(allowedByContent[recommendation.content_kind]?.includes(normalized.activityType), 'Activity does not match recommended content');
    let completionVerified = false, completionCriteria = null;
    if (normalized.eventType === 'completed' && normalized.activityType !== 'lesson_open' && typeof verifyCompletion === 'function') {
      const result = await verifyCompletion({ ownerId, recommendation, event: normalized, sql: tx });
      if (result?.verified === true) {
        requireThat(typeof result.criteria === 'string' && result.criteria.length >= 1 && result.criteria.length <= 2000, 'Verified completion requires bounded criteria');
        completionVerified = true; completionCriteria = result.criteria;
      }
    }
    const [inserted] = await tx`
      insert into public.adaptive_interventions(owner_id,client_event_id,submission_sha256,recommendation_id,concept_id,content_revision_id,source_evidence_id,event_type,activity_type,completion_criteria,completion_verified,occurred_at,mapping_version,algorithm_version,configuration_version)
      values (${ownerId},${normalized.clientEventId},${submissionSha256},${recommendation.recommendation_id},${recommendation.concept_id},${recommendation.content_revision_id},${recommendation.source_evidence_id},${normalized.eventType},${normalized.activityType},${completionCriteria},${completionVerified},${normalized.occurredAt},${recommendation.mapping_version},${recommendation.algorithm_version},${recommendation.configuration_version})
      returning intervention_id,completion_verified,received_at
    `;
    return { status: 'inserted', interventionId: inserted.intervention_id, completionVerified: inserted.completion_verified, receivedAt: inserted.received_at.toISOString() };
  });
  try { return await write(); } catch (error) {
    if (error?.code !== '23505') throw error;
    return sql.begin(async tx => {
      await assertOwnerWritable(tx, ownerId);
    const [row] = await tx`select intervention_id,submission_sha256,completion_verified,received_at from public.adaptive_interventions where owner_id=${ownerId} and client_event_id=${normalized.clientEventId}`;
    if (!row || row.submission_sha256 !== submissionSha256) throw new AdaptiveConflictError('Conflicting intervention retry');
    return { status: 'retry', interventionId: row.intervention_id, completionVerified: row.completion_verified, receivedAt: row.received_at.toISOString() };
    });
  }
}

export async function persistAdaptiveReviewTask(sql, authenticatedOwnerId, input) {
  const ownerId = uuid(authenticatedOwnerId, 'authenticated owner');
  exactFields(input, ['conceptId', 'sourceEvidenceId', 'targetRevisionId', 'taskType', 'reasonCodes', 'eligibleAt', 'eligibleSetIndex', 'initialStatus', 'mappingVersion', 'algorithmVersion', 'configurationVersion']);
  const versionIds = normalizedVersions(input);
  requireThat(typeof input.conceptId === 'string' && input.conceptId.length >= 1 && input.conceptId.length <= 120, 'Invalid concept ID');
  requireThat(Array.isArray(input.reasonCodes) && input.reasonCodes.length >= 1 && input.reasonCodes.length <= 30 && input.reasonCodes.every(code => typeof code === 'string' && code.length >= 1), 'Invalid task reasons');
  requireThat(['pending', 'unavailable'].includes(input.initialStatus), 'Invalid initial task status');
  const normalized = {
    ownerId, conceptId: input.conceptId, sourceEvidenceId: uuid(input.sourceEvidenceId, 'source evidence'),
    targetRevisionId: input.targetRevisionId == null ? null : uuid(input.targetRevisionId, 'target revision'),
    taskType: input.taskType, reasonCodes: [...input.reasonCodes].sort(), eligibleAt: new Date(qualifiedTimestamp(input.eligibleAt)).toISOString(),
    eligibleSetIndex: integer(input.eligibleSetIndex, 'eligible set index', 1, Number.MAX_SAFE_INTEGER), initialStatus: input.initialStatus, ...versionIds,
  };
  requireThat(['transfer', 'original_recall', 'delayed_proof', 'maintenance', 'insufficient_variant_coverage'].includes(normalized.taskType), 'Invalid review task');
  const schedulingKey = `review:${sha256(canonicalPayload(normalized))}`;
  return sql.begin(async tx => {
    await assertOwnerWritable(tx, ownerId);
    const [inserted] = await tx`
      insert into public.adaptive_review_tasks(owner_id,scheduling_key,concept_id,source_evidence_id,target_revision_id,task_type,reason_codes,eligible_at,eligible_set_index,initial_status,mapping_version,algorithm_version,configuration_version)
      values (${ownerId},${schedulingKey},${normalized.conceptId},${normalized.sourceEvidenceId},${normalized.targetRevisionId},${normalized.taskType},${normalized.reasonCodes},${normalized.eligibleAt},${normalized.eligibleSetIndex},${normalized.initialStatus},${versionIds.mappingVersion},${versionIds.algorithmVersion},${versionIds.configurationVersion})
      on conflict(owner_id,scheduling_key) do nothing returning task_id
    `;
    const taskId = inserted?.task_id ?? (await tx`select task_id from public.adaptive_review_tasks where owner_id=${ownerId} and scheduling_key=${schedulingKey}`)[0]?.task_id;
    requireThat(taskId, 'Review task idempotency conflict');
    return { status: inserted ? 'inserted' : 'retry', taskId, schedulingKey };
  });
}

export async function recordAdaptiveTaskEvent(sql, authenticatedOwnerId, input) {
  const ownerId = uuid(authenticatedOwnerId, 'authenticated owner');
  exactFields(input, ['taskId', 'status', 'completionEvidenceId', 'occurredAt']);
  const normalized = { taskId: uuid(input.taskId, 'task'), status: input.status, completionEvidenceId: input.completionEvidenceId == null ? null : uuid(input.completionEvidenceId, 'completion evidence'), occurredAt: new Date(qualifiedTimestamp(input.occurredAt)).toISOString() };
  requireThat(['scheduled', 'completed', 'skipped', 'postponed', 'cancelled', 'superseded'].includes(normalized.status), 'Invalid task event');
  const eventKey = `task-event:${sha256(canonicalPayload({ ownerId, ...normalized }))}`;
  return sql.begin(async tx => {
    await assertOwnerWritable(tx, ownerId);
    const [row] = await tx`
      insert into public.adaptive_review_task_events(owner_id,task_id,event_key,status,completion_evidence_id,occurred_at)
      values (${ownerId},${normalized.taskId},${eventKey},${normalized.status},${normalized.completionEvidenceId},${normalized.occurredAt})
      on conflict(owner_id,event_key) do nothing returning event_id
    `;
    const eventId = row?.event_id ?? (await tx`select event_id from public.adaptive_review_task_events where owner_id=${ownerId} and event_key=${eventKey}`)[0]?.event_id;
    requireThat(eventId, 'Task event idempotency conflict');
    return { status: row ? 'inserted' : 'retry', eventId };
  });
}
