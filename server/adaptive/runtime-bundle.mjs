import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { canonicalPayload } from '../../src/lib/learningPersistenceContracts.js';
import { LEARNING_CONFIG } from '../../src/lib/learningConfig.js';
import { assessReplayChronology } from './chronology.mjs';

export const digest = value => createHash('sha256').update(canonicalPayload(value)).digest('hex');
export const requireRuntime = (ok, message) => { if (!ok) throw Object.assign(new Error(message), {code:'adaptive_runtime_invalid'}); };
export const RUNTIME_LIMITS = Object.freeze({evidence:10000,sessions:2000,history:10000,catalogue:2000,bytes:8*1024*1024,cpuMs:2000});
export function algorithmContract() {
  const files=['../../src/lib/learningEvidence.js','../../src/lib/conceptMastery.js','../../src/lib/reviewScheduler.js','./learning-projector.mjs','./runtime-bundle.mjs','./session-plans.mjs','./trusted-learning-runtime.mjs'];
  return {implementation:'secureplus-phase2a-v1',modules:Object.fromEntries(files.map(name=>[name,createHash('sha256').update(readFileSync(new URL(name,import.meta.url))).digest('hex')]))};
}
const bounded = (rows, max) => { requireRuntime(rows.length<=max,'Retained history exceeds replay limit');return rows; };
export async function assertSnapshotBudget(tx,ownerId) {
  let bytes=0;
  for(const table of ['public.adaptive_sessions','public.adaptive_answer_evidence','adaptive_private.session_plans','adaptive_private.intervention_proofs','public.adaptive_interventions','public.adaptive_recommendations','public.adaptive_review_tasks','public.adaptive_review_task_events','public.adaptive_session_events']) {
    const [size]=await tx`select count(*)::int as n,coalesce(sum(octet_length(row_to_json(t)::text)),0)::bigint as bytes from (select * from ${tx(table)} where owner_id=${ownerId} limit ${RUNTIME_LIMITS.history+1}) t`;
    requireRuntime(size.n<=RUNTIME_LIMITS.history,'Retained history exceeds replay limit');
    bytes+=Number(size.bytes);requireRuntime(bytes<=RUNTIME_LIMITS.bytes,'Retained history exceeds byte budget');
  }
}
export async function loadRuntimeBundle(tx, versions) {
  const {mappingVersion:m,algorithmVersion:a,configurationVersion:c}=versions;
  const rows=await tx`select v.*,p.payload from public.adaptive_versions v join adaptive_private.version_payloads p using(version_id) where v.version_id in (${m},${a},${c})`;
  requireRuntime(rows.length===3,'Missing pinned version payload');
  const get=(id,kind)=>{const r=rows.find(x=>x.version_id===id);requireRuntime(r?.version_kind===kind&&r.review_status==='human_approved'&&r.approved_by&&r.approved_at&&digest(r.payload)===r.payload_sha256,'Unapproved or mismatched version payload');return r.payload;};
  const mapping=get(m,'mapping'),algorithm=get(a,'algorithm'),configuration=get(c,'configuration');
  requireRuntime(canonicalPayload(algorithm)===canonicalPayload(algorithmContract()),'Unsupported pinned algorithm implementation');
  requireRuntime(mapping.contract==='catalogue-v1'&&mapping.mappingVersion===m,'Malformed mapping payload');
  const config=configuration.config;
  requireRuntime(config&&config.mappingVersion===m&&config.algorithmVersion===a&&config.configurationVersion===c&&canonicalPayload(config.allowedReviewStatuses)===canonicalPayload(['human_reviewed']),'Configuration versions or approvals mismatch');
  // Validate complete configuration shape and finite bounded numeric rules; no defaults.
  const shape=(actual,template)=>{requireRuntime(actual&&typeof actual==='object'&&!Array.isArray(actual),'Malformed configuration');for(const [key,value] of Object.entries(template)){
    requireRuntime(Object.hasOwn(actual,key),'Missing configuration field');
    if(typeof value==='number')requireRuntime(Number.isFinite(actual[key])&&actual[key]>=0&&actual[key]<=1e10,'Invalid numeric configuration');
    else if(value&&typeof value==='object'&&!Array.isArray(value))shape(actual[key],value);
    else if(!Array.isArray(value))requireRuntime(typeof actual[key]===typeof value,'Invalid configuration field type');
  }};shape(config,LEARNING_CONFIG);
  for(const caps of Object.values(config.scheduler.modes))for(const share of Object.values(caps))requireRuntime(share>=0&&share<=1,'Invalid composition share');
  for(const [name,value] of Object.entries(config.mastery))requireRuntime(Number.isSafeInteger(value)&&value>0,'Invalid mastery threshold');
  const limit=RUNTIME_LIMITS.catalogue+1;
  const concepts=bounded(await tx`select * from public.adaptive_concepts where mapping_version=${m} order by concept_id limit ${limit}`,RUNTIME_LIMITS.catalogue);
  const relationships=bounded(await tx`select * from public.adaptive_relationships where mapping_version=${m} order by source_concept_id,target_concept_id,relationship_type limit ${limit}`,RUNTIME_LIMITS.catalogue);
  const mappings=bounded(await tx`select m.*,q.question_id,q.question_type,q.scenario_family,q.difficulty,q.content_signature from public.adaptive_question_mappings m join public.adaptive_question_revisions q using(revision_id) where m.mapping_version=${m} order by m.revision_id,m.concept_role,m.concept_id limit ${limit}`,RUNTIME_LIMITS.catalogue);
  const contents=bounded(await tx`select m.*,c.content_id,c.content_kind,c.content_signature from public.adaptive_content_mappings m join public.adaptive_content_revisions c using(content_revision_id) where m.mapping_version=${m} order by m.content_revision_id,m.concept_id limit ${limit}`,RUNTIME_LIMITS.catalogue);
  requireRuntime(concepts.length>0&&mappings.length>0&&[...concepts,...relationships,...mappings,...contents].every(r=>r.review_status==='human_approved'),'Catalogue lacks approval or mappings');
  // Payload pins the complete sealed catalogue, not a best-effort live lookup.
  const catalogue={concepts,relationships,mappings,contents};
  const manifest=JSON.parse(JSON.stringify(catalogue));
  for(const edge of manifest.relationships)edge.editorial_weight=Number(edge.editorial_weight);
  requireRuntime(mapping.catalogueSha256===digest(manifest),'Catalogue payload differs from pinned rows');
  const [allowed]=await tx`select adaptive_private.shadow_allowed(${m},${a},${c}) as allowed`;
  requireRuntime(allowed.allowed,'Pinned triple is not authorized');
  const active=await tx`select distinct on(p.revision_id) p.revision_id,p.status from public.adaptive_question_publications p where exists(select 1 from public.adaptive_question_mappings m where m.mapping_version=${m} and m.revision_id=p.revision_id) order by p.revision_id,p.event_index desc limit ${limit}`;
  return {versions,config,configuration,catalogue,activeRevisionIds:active.filter(r=>r.status==='active').map(r=>r.revision_id)};
}
export async function loadCompleteSnapshot(tx,snapshot,job) {
  const owner=snapshot.ownerId;
  bounded(snapshot.evidence,RUNTIME_LIMITS.evidence);bounded(snapshot.sessions,RUNTIME_LIMITS.sessions);
  const bundle=await loadRuntimeBundle(tx,job.versions);
  const history={};
  for(const [name,table] of Object.entries({plans:'adaptive_private.session_plans',proofs:'adaptive_private.intervention_proofs',interventions:'public.adaptive_interventions',recommendations:'public.adaptive_recommendations',tasks:'public.adaptive_review_tasks',taskEvents:'public.adaptive_review_task_events',sessionEvents:'public.adaptive_session_events'})) {
    history[name]=bounded(await tx`select * from ${tx(table)} where owner_id=${owner} limit ${RUNTIME_LIMITS.history+1}`,RUNTIME_LIMITS.history);
  }
  const result=JSON.parse(JSON.stringify({...snapshot,...history,bundle,enrollmentId:job.enrollmentId}));
  requireRuntime(Buffer.byteLength(JSON.stringify(result))<=RUNTIME_LIMITS.bytes,'Replay payload exceeds byte budget');
  const chronology=assessReplayChronology({ownerId:owner,now:result.now,
    sessions:result.sessions.map(s=>({ownerId:owner,sessionId:s.session_id,setIndex:Number(s.set_index),startedAt:s.started_at,closedAt:s.closed_at??null})),
    evidence:result.evidence.filter(e=>e.session_id).map(e=>({ownerId:owner,evidenceId:e.evidence_id,sessionId:e.session_id,setIndex:Number(e.set_index),occurredAt:e.occurred_at,receivedAt:e.received_at,supersedesEvidenceId:e.supersedes_evidence_id}))});
  requireRuntime(chronology.status==='ready_for_replay','Chronology must be resolved before trusted planning');
  return result;
}
