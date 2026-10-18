import { randomUUID } from 'node:crypto';
import { assertOwnerWritable } from './owner-guard.mjs';
import { loadCompleteSnapshot,assertSnapshotBudget,requireRuntime,digest } from './runtime-bundle.mjs';
import { executePinnedModel } from './trusted-learning-runtime.mjs';

// Internal server capability. Never accepts a browser request or learner fields.
// Used by the trusted generator and explicit disposable fixtures only.
export async function storeTrustedSessionPlan(sql,ownerId,plan,{enrollmentId=null}={}) {
 return sql.begin(async tx=>{
  const enrollment=await assertOwnerWritable(tx,ownerId,enrollmentId);
  const [r]=await tx`select adaptive_private.store_session_plan(${ownerId},${enrollment},${tx.json(plan)}) as id`;
  return r.id;
 });
}
export function createSessionPlanResolver(sql) {
 return async(ownerId,planId)=>sql.begin(async tx=>{
  const [r]=await tx`select adaptive_private.resolve_session_plan(${ownerId},${planId}) as plan`;
  return {ownerId,plan:r.plan};
 });
}
// Local trusted caller chooses policy context; clients can resolve only an opaque
// owner-scoped ID. A reduced bank never gets fabricated or duplicate filler.
// Shared pure selector used by the trusted server and local release-candidate rehearsal.
export function selectTrustedMcqRevisions({bundle,reviewPlan,evidence,requestedCount,mode,seed}) {
  const eligible=bundle.catalogue.mappings.filter(m=>m.concept_role==='primary'&&m.question_type==='mcq'&&bundle.activeRevisionIds.includes(m.revision_id));
  const seen=new Set(),ordered=[];
  for(const candidate of reviewPlan?.selected??[]){const r=eligible.find(m=>m.revision_id===candidate.questionRevision);if(r&&!seen.has(r.question_id)){seen.add(r.question_id);ordered.push(r);}}
  const exposed=new Set(evidence.map(e=>e.question_id));
  for(const r of eligible.sort((a,b)=>digest({seed,id:a.question_id}).localeCompare(digest({seed,id:b.question_id}))))if(!seen.has(r.question_id)&&!exposed.has(r.question_id)){seen.add(r.question_id);ordered.push(r);}
  // This cold-start filler preserves explicit concept and difficulty caps; no relaxation.
  const caps=bundle.config.scheduler.modes[mode==='smart_review'||mode==='targeted_review'?'smart_review':'normal'];
  const picked=[],counts={};let hard=0,remediation=0,exactRepeat=0;
  const weak=new Set(Object.values(reviewPlan.model.concepts).filter(c=>c.lastMiss&&!['proven','mastered'].includes(c.state)).map(c=>c.conceptId));
  for(const r of ordered){if(picked.length>=requestedCount)break;
   const roles=bundle.catalogue.mappings.filter(m=>m.revision_id===r.revision_id).map(m=>m.concept_id);
   if(roles.some(id=>(counts[id]??0)>=Math.floor(requestedCount*caps.conceptShare)))continue;
   if(roles.some(id=>weak.has(id))&&remediation>=Math.floor(requestedCount*caps.remediationShare))continue;
   if(exposed.has(r.question_id)&&exactRepeat>=Math.floor(requestedCount*caps.exactRepeatShare))continue;
   if(r.difficulty==='hard'&&hard>=Math.floor(requestedCount*caps.hardShare))continue;
   picked.push(r.revision_id);remediation+=Number(roles.some(id=>weak.has(id)));exactRepeat+=Number(exposed.has(r.question_id));for(const id of roles)counts[id]=(counts[id]??0)+1;hard+=Number(r.difficulty==='hard');
  }
  requireRuntime(picked.length>0,'Insufficient approved session coverage');return picked;
}

export async function generateTrustedSessionPlan({readDatabase,writeDatabase,ownerId,versions,requestedCount=10,mode='normal',source='practice',seed}) {
 requireRuntime(Number.isInteger(requestedCount)&&requestedCount>=10&&requestedCount<=30,'Session count must be 10–30');
 requireRuntime(['normal','smart_review','diagnostic','exam','targeted_review'].includes(mode)&&typeof seed==='string'&&seed.length>0&&seed.length<=200,'Invalid trusted generation context');
 const {revisionIds,enrollmentId}=await readDatabase.begin(async tx=>{
  const enrollmentId=await assertOwnerWritable(tx,ownerId);
  await assertSnapshotBudget(tx,ownerId);
  const sessions=await tx`select s.*,max(e.occurred_at) filter(where e.status in ('completed','abandoned')) as closed_at from public.adaptive_sessions s left join public.adaptive_session_events e on e.owner_id=s.owner_id and e.session_id=s.session_id where s.owner_id=${ownerId} group by s.session_id order by s.set_index limit 2001`;
  const evidence=await tx`select e.*,s.set_index,q.scenario_family,q.question_type from public.adaptive_answer_evidence e left join public.adaptive_sessions s on s.owner_id=e.owner_id and s.session_id=e.session_id left join public.adaptive_question_revisions q using(revision_id) where e.owner_id=${ownerId} order by e.receipt_index limit 10001`;
  const [state]=await tx`select evidence_generation from adaptive_private.owner_state where owner_id=${ownerId}`;
  const [clock]=await tx`select clock_timestamp() as now`;
  const snapshot=await loadCompleteSnapshot(tx,{ownerId,sessions,evidence,generation:Number(state?.evidence_generation??0),now:clock.now.toISOString(),planContext:{mode:mode==='smart_review'||mode==='targeted_review'?'smart_review':'normal',setSize:requestedCount,seed}},{versions,enrollmentId});
  const {bundle}=snapshot;
  const {plan:reviewPlan}=await executePinnedModel(snapshot);
  const revisionIds=selectTrustedMcqRevisions({bundle,reviewPlan,evidence,requestedCount,mode,seed});return {revisionIds,enrollmentId};
 });
 const plan={sessionId:randomUUID(),source,mode,seed,requestedCount,requestedPbqCount:0,revisionIds,...versions};
 const planId=await storeTrustedSessionPlan(writeDatabase,ownerId,plan,{enrollmentId});
 return {planId,actualCount:revisionIds.length,requestedCount,reasonCodes:revisionIds.length<requestedCount?['insufficient_approved_coverage']:[]};
}
export function createTrustedCompletionVerifier() {
 return async({ownerId,recommendation,event,sql})=>{
  if(!['lesson_check','targeted_practice'].includes(event.activityType))return {verified:false};
  const [r]=await sql`select adaptive_private.verify_intervention_completion(${ownerId},${recommendation.recommendation_id},${event.clientEventId},${event.occurredAt}) as verified`;
  return {verified:r.verified,criteria:r.verified?'server_graded_targeted_check_v1':null};
 };
}
