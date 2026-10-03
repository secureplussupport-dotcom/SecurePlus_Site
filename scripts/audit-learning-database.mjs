import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readPublicationFixtures } from './lib/read-publication-fixtures.mjs';
import { QUESTION_MAPPINGS } from '../src/data/learningMappings.js';
import { resolvePublication } from '../server/adaptive/publication.mjs';
import { compileRevision } from '../server/adaptive/revision.mjs';
import { createAdaptiveDatabase, closeAdaptiveDatabase } from '../server/adaptive/database.mjs';
import {
  AdaptiveConflictError,
  ingestAdaptiveAnswer,
  persistAdaptiveRecommendation,
  persistAdaptiveReviewTask,
  recordAdaptiveIntervention,
  recordAdaptiveTaskEvent,
  startAdaptiveSession,
} from '../server/adaptive/persistence.mjs';
import { rebuildAdaptiveOwner } from '../server/adaptive/projection-worker.mjs';
import { canonicalPayload } from '../src/lib/learningPersistenceContracts.js';

const required = ['ADAPTIVE_DATABASE_URL', 'SUPABASE_LOCAL_API_URL', 'SUPABASE_LOCAL_ANON_KEY', 'SUPABASE_LOCAL_JWT_SECRET'];
for (const key of required) assert.ok(process.env[key], `Missing ${key}`);
const ids = {
  ownerA: '00000000-0000-4000-8000-000000000001', ownerB: '00000000-0000-4000-8000-000000000002',
  actor: '00000000-0000-4000-8000-000000000100', sessionA: '00000000-0000-4000-8000-000000000201',
  sessionB: '00000000-0000-4000-8000-000000000202', eventA: '00000000-0000-4000-8000-000000000301',
  eventB: '00000000-0000-4000-8000-000000000302', correction: '00000000-0000-4000-8000-000000000303',
  content: '00000000-0000-4000-8000-000000000401', intervention: '00000000-0000-4000-8000-000000000402',
  ownerBSession: '00000000-0000-4000-8000-000000000501', ownerBEvent: '00000000-0000-4000-8000-000000000502',
};
const versions = { mappingVersion: 'local-map-v1', algorithmVersion: 'local-algo-v1', configurationVersion: 'local-config-v1' };
const b64url = value => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
const jwt = ownerId => {
  const encoded = `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ iss: 'supabase-demo', aud: 'authenticated', role: 'authenticated', sub: ownerId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 })}`;
  return `${encoded}.${createHmac('sha256', process.env.SUPABASE_LOCAL_JWT_SECRET).update(encoded).digest('base64url')}`;
};
const api = async (path, { ownerId, method = 'GET', body, profile } = {}) => {
  const token = ownerId ? jwt(ownerId) : process.env.SUPABASE_LOCAL_ANON_KEY;
  const headers = { apikey: process.env.SUPABASE_LOCAL_ANON_KEY, authorization: `Bearer ${token}` };
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (profile) headers['accept-profile'] = profile;
  return fetch(`${process.env.SUPABASE_LOCAL_API_URL}/rest/v1/${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
};

const sql = createAdaptiveDatabase({ max: 6 });
let assertions = 0;
const check = (condition, message) => { assert.ok(condition, message); assertions += 1; };

try {
  const [{ count }] = await sql`select count(*)::int as count from public.adaptive_versions`;
  assert.equal(count, 0, 'Database audit requires a freshly reset disposable database');
  const { assets, pipeline } = readPublicationFixtures();
  const publication = resolvePublication(assets, pipeline);
  const questions = ['m032', 'm635'].map(questionId => publication.mcqs.find(question => question.id === questionId));
  const revisions = questions.map(question => compileRevision(question, 'mcq', publication.provenance[`mcq:${question.id}`]));

  await sql.begin(async tx => {
    await tx`insert into auth.users(id,email) values (${ids.ownerA},'adaptive-db-a@example.invalid'),(${ids.ownerB},'adaptive-db-b@example.invalid')`;
    await tx`insert into adaptive_private.editorial_actors(actor_id,actor_kind,login_user_id,provenance_code) values (${ids.actor},'human_editor',${ids.ownerA},'local-database-audit')`;
    await tx`
      insert into public.adaptive_versions(version_id,version_kind,payload_sha256,review_status,approved_by,approved_at) values
      (${versions.mappingVersion},'mapping',${'a'.repeat(64)},'human_approved',${ids.actor},clock_timestamp()),
      (${versions.algorithmVersion},'algorithm',${'b'.repeat(64)},'human_approved',${ids.actor},clock_timestamp()),
      (${versions.configurationVersion},'configuration',${'c'.repeat(64)},'human_approved',${ids.actor},clock_timestamp()),
      ('local-pending-v1','mapping',${'d'.repeat(64)},'agent_reviewed_pending_human',null,null)
    `;
    for (const versionId of Object.values(versions)) await tx`insert into adaptive_private.version_payloads(version_id,payload) values (${versionId},${tx.json({ fixture: true, versionId })})`;
    await tx`
      insert into public.adaptive_concepts(mapping_version,concept_id,exam_scope,name,description,objective_codes,domain_id,chapter_id,topic_id,node_kind,review_status,reviewed_by,reviewed_at)
      values (${versions.mappingVersion},'recovery.rto','SY0-701','RTO','Disposable local fixture',${['5.2']},'sy0701.domain-5','sy0701.objective-5.2','business-continuity-metrics','mastery_concept','human_approved',${ids.actor},clock_timestamp())
    `;
    for (const revision of revisions) {
      const mapping = QUESTION_MAPPINGS.find(item => item.questionId === revision.questionId);
      await tx`
        insert into public.adaptive_question_revisions(revision_id,question_id,question_type,content_signature,publication_source,publication_steps,published_at,objective_codes,domain_id,topic_id,difficulty,scenario_family,review_status,reviewed_by,reviewed_at)
        values (${revision.revisionId},${revision.questionId},'mcq',${`sha256:${revision.contentSha256}`},'effective_local_bank',${revision.provenance.map(step => step.stage)},clock_timestamp(),${mapping.objectiveCodes},${mapping.domainId},${mapping.topicId},${mapping.difficulty},${mapping.scenarioFamily},'human_approved',${ids.actor},clock_timestamp())
      `;
      for (const component of revision.components) await tx`
        insert into public.adaptive_answer_components(revision_id,component_id,component_kind) values (${revision.revisionId},${component.id},${component.kind})
      `;
      const protectedPayload = { compiledRevision: revision };
      const digest = createHmac('sha256', 'local-audit-integrity').update(canonicalPayload(protectedPayload)).digest('hex');
      await tx`
        insert into adaptive_private.grading_keys(revision_id,grading_contract,grading_payload,payload_sha256)
        values (${revision.revisionId},'pilot-revision-v1',${tx.json(protectedPayload)},${digest})
      `;
      await tx`
        insert into public.adaptive_question_mappings(mapping_version,revision_id,concept_id,concept_role,precision,cognitive_skill,model_revision_key,review_status,reviewed_by,reviewed_at)
        values (${versions.mappingVersion},${revision.revisionId},'recovery.rto','primary','direct',${mapping.cognitiveSkill},${mapping.questionRevision},'human_approved',${ids.actor},clock_timestamp())
      `;
    }
    await tx`
      insert into public.adaptive_content_revisions(content_revision_id,content_id,content_kind,content_signature)
      values (${ids.content},'deep-dive-rto','lesson',${`sha256:${'e'.repeat(64)}`})
    `;
    await tx`
      insert into public.adaptive_content_mappings(mapping_version,content_revision_id,concept_id,review_status,reviewed_by,reviewed_at)
      values (${versions.mappingVersion},${ids.content},'recovery.rto','human_approved',${ids.actor},clock_timestamp())
    `;
    await tx`insert into public.adaptive_version_sets(mapping_version,algorithm_version,configuration_version) values (${versions.mappingVersion},${versions.algorithmVersion},${versions.configurationVersion})`;
    for (const versionId of Object.values(versions)) await tx`
      insert into public.adaptive_version_events(version_id,action,actor_id,reason) values (${versionId},'activate',${ids.actor},'Disposable rollback/reset-only database audit')
    `;
    for (const revision of revisions) await tx`insert into public.adaptive_question_publications(revision_id,status,actor_id) values (${revision.revisionId},'active',${ids.actor})`;
    await tx`insert into adaptive_private.shadow_authorizations(mapping_version,algorithm_version,configuration_version,action,actor_id) values (${versions.mappingVersion},${versions.algorithmVersion},${versions.configurationVersion},'authorize',${ids.actor})`;
    for (const owner of [ids.ownerA,ids.ownerB]) await tx`select adaptive_private.enroll_shadow(${owner},clock_timestamp()+interval '7 days',gen_random_uuid())`;
    await tx`insert into adaptive_private.owner_state(owner_id,last_set_index,evidence_generation) values (${ids.ownerB},0,0)`;
  });

  const plan = (sessionId, revisionId) => ({ sessionId, source: 'practice', mode: 'normal', seed: 'database-audit', requestedCount: 1, requestedPbqCount: 0, revisionIds: [revisionId], ...versions });
  const [sessionA, sessionB] = await Promise.all([
    startAdaptiveSession(sql, ids.ownerA, plan(ids.sessionA, revisions[0].revisionId)),
    startAdaptiveSession(sql, ids.ownerA, plan(ids.sessionB, revisions[1].revisionId)),
  ]);
  assert.deepEqual([sessionA.setIndex, sessionB.setIndex].sort(), [1, 2]); assertions += 1;

  const occurredAt = new Date(Math.max(Date.parse(sessionA.startedAt), Date.parse(sessionB.startedAt)) + 2000).toISOString();
  const expected = revisions[0].gradingKey.expected;
  const wrongId = revisions[0].components.find(component => component.kind === 'option' && component.id !== expected[0].valueId).id;
  const answerA = { clientEventId: ids.eventA, sessionId: ids.sessionA, itemPosition: 1, revisionId: revisions[0].revisionId, selectedComponents: [{ componentId: wrongId, valueId: wrongId }], occurredAt, responseDurationMs: 500 };
  const concurrent = await Promise.all([ingestAdaptiveAnswer(sql, ids.ownerA, answerA), ingestAdaptiveAnswer(sql, ids.ownerA, answerA)]);
  check(concurrent.some(result => result.status === 'inserted') && concurrent.some(result => result.status === 'retry'), 'Concurrent identical answer must become insert plus retry');
  const inserted = concurrent.find(result => result.status === 'inserted');
  assert.equal(inserted.correct, false); assertions += 1;
  await assert.rejects(() => ingestAdaptiveAnswer(sql, ids.ownerA, { ...answerA, selectedComponents: expected }), AdaptiveConflictError); assertions += 1;

  const corrected = await ingestAdaptiveAnswer(sql, ids.ownerA, { ...answerA, clientEventId: ids.correction, selectedComponents: expected, supersedesEvidenceId: inserted.evidenceId, correctionReason: 'Correct local grading fixture' });
  check(corrected.correct && corrected.classification === 'fresh_scenario', 'Correction must preserve occurrence classification and append corrected grading');
  const answerB = { clientEventId: ids.eventB, sessionId: ids.sessionB, itemPosition: 1, revisionId: revisions[1].revisionId, selectedComponents: revisions[1].gradingKey.expected, occurredAt: new Date(Date.parse(occurredAt) + 1000).toISOString(), responseDurationMs: 500 };
  const evidenceB = await ingestAdaptiveAnswer(sql, ids.ownerA, answerB);
  assert.equal(evidenceB.classification, 'same_scenario'); assertions += 1;

  const recommendation = await persistAdaptiveRecommendation(sql, ids.ownerA, {
    conceptId: 'recovery.rto', contentRevisionId: ids.content, sourceEvidenceId: inserted.evidenceId,
    role: 'direct', reasonCodes: ['incorrect_direct_evidence'], ...versions,
  });
  assert.equal(recommendation.status, 'inserted'); assertions += 1;
  const recommendationRetry = await persistAdaptiveRecommendation(sql, ids.ownerA, {
    conceptId: 'recovery.rto', contentRevisionId: ids.content, sourceEvidenceId: inserted.evidenceId,
    role: 'direct', reasonCodes: ['incorrect_direct_evidence'], ...versions,
  });
  check(recommendationRetry.status === 'retry' && recommendationRetry.recommendationId === recommendation.recommendationId, 'Recommendation retry must preserve deterministic identity');
  const intervention = await recordAdaptiveIntervention(sql, ids.ownerA, {
    clientEventId: ids.intervention, recommendationId: recommendation.recommendationId,
    eventType: 'completed', activityType: 'lesson_steps', occurredAt: new Date(Date.parse(occurredAt) + 500).toISOString(),
  }, { verifyCompletion: async () => ({ verified: true, criteria: 'All locally seeded lesson steps completed' }) });
  check(intervention.status === 'inserted' && intervention.completionVerified, 'Trusted lesson completion must persist as verified');
  const task = await persistAdaptiveReviewTask(sql, ids.ownerA, {
    conceptId: 'recovery.rto', sourceEvidenceId: inserted.evidenceId, targetRevisionId: revisions[0].revisionId,
    taskType: 'original_recall', reasonCodes: ['retest_in_next_sets'], eligibleAt: occurredAt,
    eligibleSetIndex: sessionA.setIndex, initialStatus: 'pending', ...versions,
  });
  assert.equal(task.status, 'inserted'); assertions += 1;
  const taskEvent = await recordAdaptiveTaskEvent(sql, ids.ownerA, {
    taskId: task.taskId, status: 'completed', completionEvidenceId: corrected.evidenceId, occurredAt,
  });
  assert.equal(taskEvent.status, 'inserted'); assertions += 1;

  const ownerRead = await api('adaptive_sessions?select=session_id,set_index&order=set_index', { ownerId: ids.ownerA });
  check(ownerRead.status === 403, 'Owner cannot read private shadow sessions');
  const foreignRead = await api('adaptive_sessions?select=session_id', { ownerId: ids.ownerB });
  check(foreignRead.status === 403, 'Other authenticated user cannot read shadow sessions');
  const versionsRead = await api('adaptive_versions?select=version_id', { ownerId: ids.ownerA });
  check(versionsRead.status === 403, 'All adaptive version metadata stays internal');
  const forgedWrite = await api('adaptive_answer_evidence', { ownerId: ids.ownerA, method: 'POST', body: {} });
  check(forgedWrite.status >= 400, 'Authenticated browser must not insert answer evidence');
  const privateRead = await api('grading_keys?select=*', { ownerId: ids.ownerA, profile: 'adaptive_private' });
  check(privateRead.status >= 400, 'Private grading schema must not be exposed through REST');
  const anonRead = await api('adaptive_question_revisions?select=revision_id');
  check(anonRead.status >= 400, 'Anonymous role must not read adaptive catalogue');

  const explain = await sql`
    explain (analyze, buffers, format json)
    select evidence_id from public.adaptive_answer_evidence where owner_id=${ids.ownerA} order by occurred_at,evidence_id
  `;
  check(JSON.stringify(explain).includes('adaptive_evidence_owner_time'), 'Owner replay query should use the owner/time index');

  const replay = await rebuildAdaptiveOwner(sql, ids.ownerA, { now: new Date(Date.parse(answerB.occurredAt) + 1000).toISOString(), project: () => { throw new Error('Overlapping sessions must quarantine before projection'); } });
  check(replay.status === 'quarantined' && replay.reasonCodes.includes('overlapping_sessions'), 'Overlapping concurrent sessions must persist quarantine instead of projecting mastery');

  const ownerBSession = await startAdaptiveSession(sql, ids.ownerB, plan(ids.ownerBSession, revisions[0].revisionId));
  const ownerBOccurredAt = new Date(Date.parse(ownerBSession.startedAt) + 2000).toISOString();
  const ownerBEvidence = await ingestAdaptiveAnswer(sql, ids.ownerB, {
    clientEventId: ids.ownerBEvent, sessionId: ids.ownerBSession, itemPosition: 1,
    revisionId: revisions[0].revisionId, selectedComponents: revisions[0].gradingKey.expected,
    occurredAt: ownerBOccurredAt, responseDurationMs: 500,
  });
  const readyReplay = await rebuildAdaptiveOwner(sql, ids.ownerB, {
    now: new Date(Date.parse(ownerBOccurredAt) + 1000).toISOString(),
    project: snapshot => [{
      ownerId: ids.ownerB, conceptId: 'recovery.rto', ...versions,
      state: 'learning_signal', evidenceLevel: 'limited', effectiveSample: 1,
      distinctQuestions: 1, distinctScenarios: 1, completeEvidenceCount: 1,
      everSticky: false, lapseCount: 0, unresolvedEvidenceIds: [],
      lastAnswerAt: ownerBOccurredAt, lastInterventionAt: null, provenAt: null,
      masteredAt: null, nextDueTaskId: null, inputGeneration: snapshot.generation,
    }],
  });
  check(readyReplay.status === 'ready' && readyReplay.projectionCount === 1 && readyReplay.promotionAllowed === false, 'Generation-safe replay must publish a ready cache without authorizing promotion');
  const [projection] = await sql`select projection_status,state,input_generation from public.adaptive_concept_projections where owner_id=${ids.ownerB} and concept_id='recovery.rto'`;
  check(projection?.projection_status === 'ready' && projection.state === 'learning_signal', 'Ready replay must persist the projected concept state');
  assert.equal(ownerBEvidence.correct, true); assertions += 1;

  await sql.begin(async tx => {
    await tx`set local role service_role`;
    const [op] = await tx`select adaptive_private.begin_erasure(${ids.ownerA},'withdrawal') as id`;
    await tx`select adaptive_private.cancel_owner_jobs(${ids.ownerA})`;
    await tx`select adaptive_private.advance_erasure(${op.id},'jobs_cancelled')`;
    await tx`select adaptive_private.erase_operation(${op.id})`;
    await tx`select adaptive_private.advance_erasure(${op.id},'completed')`;
    check((await tx`select count(*)::int as n from public.adaptive_answer_evidence where owner_id=${ids.ownerA}`)[0].n===0,'Scoped lifecycle removes evidence');
  });
  const [{ ownerACount }] = await sql`select count(*)::int as "ownerACount" from public.adaptive_sessions where owner_id=${ids.ownerA}`;
  const [{ ownerBCount }] = await sql`select count(*)::int as "ownerBCount" from adaptive_private.owner_state where owner_id=${ids.ownerB}`;
  assert.equal(ownerACount, 0); assert.equal(ownerBCount, 1); assertions += 2;
  await sql`delete from auth.users where id=${ids.ownerA}`;
  const [actor] = await sql`select login_user_id from adaptive_private.editorial_actors where actor_id=${ids.actor}`;
  assert.equal(actor.login_user_id, null); assertions += 1;

  console.log(`PASS adaptive local database runtime: ${assertions} assertions; migration, transactions, retries, grading, recommendations, interventions, review tasks, projection, REST/RLS, index use, and deletion verified.`);
} finally {
  await closeAdaptiveDatabase(sql);
}
