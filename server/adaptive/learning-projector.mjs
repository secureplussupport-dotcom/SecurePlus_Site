import { scheduleConceptReview } from '../../src/lib/reviewScheduler.js';
import { digest,requireRuntime } from './runtime-bundle.mjs';
const iso=value=>value==null?null:new Date(value).toISOString();
const matches=(r,v)=>r.mapping_version===v.mappingVersion&&r.algorithm_version===v.algorithmVersion&&r.configuration_version===v.configurationVersion;
const key=(kind,value)=>`${kind}:${digest(value)}`;

// Pure adapter: no database, clock, credential, or browser authority.
export function projectCompleteHistory(snapshot) {
 const {bundle,ownerId,enrollmentId}=snapshot,{config,catalogue,versions}=bundle;
 const concepts=catalogue.concepts.filter(c=>c.node_kind==='mastery_concept').map(c=>({id:c.concept_id}));
 const mappings=[];
 for(const row of catalogue.mappings.filter(r=>r.concept_role==='primary')){
  const roles=catalogue.mappings.filter(r=>r.revision_id===row.revision_id);
  mappings.push({questionId:row.question_id,questionRevision:row.revision_id,primaryConceptId:row.concept_id,secondaryConceptIds:roles.filter(r=>r.concept_role==='secondary').map(r=>r.concept_id),scenarioFamily:row.scenario_family,difficulty:row.difficulty,evidencePrecision:row.question_type==='pbq'||roles.some(r=>r.precision==='coarse')?'coarse':'direct',editorialStatus:'human_reviewed',mappingVersion:versions.mappingVersion,provenance:'complete',active:bundle.activeRevisionIds.includes(row.revision_id)});
 }
 const contentMappings=catalogue.contents.map(c=>({contentId:c.content_id,contentRevisionId:c.content_revision_id,conceptIds:[c.concept_id],mappingVersion:versions.mappingVersion,editorialStatus:'human_reviewed'}));
 const relationships=catalogue.relationships.map(r=>({sourceConceptId:r.source_concept_id,targetConceptId:r.target_concept_id,type:r.relationship_type,direction:r.direction,editorialWeight:Number(r.editorial_weight),mappingVersion:versions.mappingVersion,editorialStatus:'human_reviewed'}));
 for(const session of snapshot.sessions.filter(s=>matches(s,versions))){
  const plan=snapshot.plans.find(p=>p.session_id===session.session_id&&p.owner_id===ownerId&&p.enrollment_id===enrollmentId);
  requireRuntime(plan&&plan.plan.mappingVersion===versions.mappingVersion&&plan.plan.algorithmVersion===versions.algorithmVersion&&plan.plan.configurationVersion===versions.configurationVersion,'Session has no matching immutable enrollment plan');
 }
 const byId=new Map(snapshot.evidence.map(e=>[e.evidence_id,e]));
 const superseded=new Set();
 for(const e of snapshot.evidence){let p=e;const chain=new Set([e.evidence_id]);while(p.supersedes_evidence_id){requireRuntime(!chain.has(p.supersedes_evidence_id),'Correction cycle');chain.add(p.supersedes_evidence_id);const old=byId.get(p.supersedes_evidence_id);requireRuntime(old&&old.owner_id===ownerId&&old.session_id===e.session_id&&old.revision_id===e.revision_id&&old.occurred_at===e.occurred_at,'Incomplete correction chain');superseded.add(old.evidence_id);p=old;}}
 const effective=snapshot.evidence.filter(e=>!superseded.has(e.evidence_id));
 const raw=[],priorExposure=[];
 for(const e of effective){
  if(e.provenance!=='complete'||!matches(e,versions)){
   priorExposure.push({questionId:e.question_id,scenarioFamily:e.scenario_family});continue;
  }
  const session=snapshot.sessions.find(s=>s.session_id===e.session_id);
  const plan=snapshot.plans.find(p=>p.session_id===e.session_id&&p.owner_id===ownerId&&p.enrollment_id===enrollmentId);
  requireRuntime(session&&plan,'Evidence has no enrollment-bound immutable plan');
  const item=plan.items.find(i=>i.position===e.item_position&&i.revisionId===e.revision_id);
  requireRuntime(item&&Array.isArray(e.selected_components)&&e.selected_components.every(c=>item.components.some(i=>i.id===c.componentId)&&item.components.some(i=>i.id===c.valueId)),'Evidence outside immutable plan');
  const mapping=mappings.find(m=>m.questionRevision===e.revision_id);
  requireRuntime(mapping&&typeof e.correct==='boolean','Missing retained evidence mapping');
  // Persisted PBQ precision must never be silently upgraded by a mapping.
  if(e.evidence_precision!=='direct')mapping.evidencePrecision='coarse';
  raw.push({eventId:e.evidence_id,kind:'answer',questionId:e.question_id,questionRevision:e.revision_id,correct:e.correct,occurredAt:e.occurred_at,setIndex:Number(session.set_index),...versions});
 }
 for(const event of snapshot.interventions){
  if(!matches(event,versions)||!event.completion_verified||event.event_type!=='completed')continue;
  const proof=snapshot.proofs.find(p=>p.client_event_id===event.client_event_id&&p.recommendation_id===event.recommendation_id&&p.enrollment_id===enrollmentId);
  const source=effective.find(e=>e.evidence_id===event.source_evidence_id&&!e.correct&&e.evidence_precision==='direct');
  // Correcting away a source miss or its graded completion invalidates its influence.
  if(!source||!proof||!proof.evidence_ids.every(id=>effective.some(e=>e.evidence_id===id&&e.correct&&e.eligible_for_mastery)))continue;
  const content=catalogue.contents.find(c=>c.content_revision_id===event.content_revision_id);
  const rec=snapshot.recommendations.find(r=>r.recommendation_id===event.recommendation_id);
  if(!content||rec?.role!=='direct')continue;
  const setIndex=Math.max(1,...snapshot.sessions.filter(s=>Date.parse(s.started_at)<=Date.parse(event.occurred_at)).map(s=>Number(s.set_index)));
  raw.push({eventId:event.intervention_id,kind:'intervention_completed',conceptId:event.concept_id,contentId:content.content_id,sourceEventId:source.evidence_id,occurredAt:event.occurred_at,setIndex,...versions});
 }
 const options={now:snapshot.now,config,concepts,mappings,contentMappings,relationships,priorExposure,setIndex:Math.max(0,...snapshot.sessions.map(s=>Number(s.set_index)))+1,setSize:10,mode:'normal',seed:'trusted-runtime-v1',...(snapshot.planContext??{})};
 const plan=scheduleConceptReview(raw,options);
 const recommendations=[];
 for(const r of plan.recommendations){
  if(!catalogue.concepts.some(c=>c.concept_id===r.conceptId))continue;
  for(const content of r.content.length?r.content:[null]){
   const value={conceptId:r.conceptId,contentRevisionId:content?.contentRevisionId??null,sourceEvidenceId:r.sourceEventId,role:r.role,reasons:[r.reason]};
   recommendations.push({...value,key:key('runtime-rec',{...value,...versions})});
  }
 }
 const tasks=[];
 for(const t of plan.tasks){
  if(t.status==='completed')continue;
  const shortage=!t.questionRevision;
  // Scheduling identity excludes current eligibility/display reasons and time of replay.
  const value={conceptId:t.conceptId,sourceEvidenceId:t.sourceEventId,targetRevisionId:t.questionRevision,taskType:shortage?'insufficient_variant_coverage':t.kind,reasons:[shortage?'insufficient_variant_coverage':t.kind==='transfer'?'fresh_primary_concept_scenario':'spaced_recall_due'],eligibleAt:iso(t.eligibleAfterAt),eligibleSetIndex:t.eligibleAfterSetIndex,initialStatus:shortage?'unavailable':'pending'};
  tasks.push({...value,key:key('runtime-task',{...value,...versions})});
 }
 const events=[];
 for(const t of snapshot.tasks.filter(t=>matches(t,versions))){
  if(snapshot.taskEvents.some(e=>e.task_id===t.task_id&&['completed','cancelled','superseded'].includes(e.status)))continue;
  const completion=effective.filter(e=>matches(e,versions)&&e.correct&&e.eligible_for_mastery&&e.revision_id===t.target_revision_id&&Date.parse(e.occurred_at)>=Date.parse(t.eligible_at)&&Number(e.set_index)>=Number(t.eligible_set_index)).sort((a,b)=>Date.parse(a.occurred_at)-Date.parse(b.occurred_at)||a.evidence_id.localeCompare(b.evidence_id))[0];
  const obsolete=!tasks.some(x=>x.key===t.scheduling_key);
  if(!completion&&!obsolete)continue;
  const value={taskId:t.task_id,status:completion?'completed':'superseded',completionEvidenceId:completion?.evidence_id??null,occurredAt:completion?.occurred_at??snapshot.evidence.reduce((last,e)=>e.occurred_at&&e.occurred_at>last?e.occurred_at:last,t.created_at)};
  events.push({...value,key:key('runtime-event',value)});
 }
 const projections=Object.values(plan.model.concepts).map(state=>({ownerId,conceptId:state.conceptId,...versions,state:state.state,evidenceLevel:state.evidenceLevel,effectiveSample:state.effectiveSampleSize,distinctQuestions:state.distinctQuestions,distinctScenarios:state.distinctScenarios,completeEvidenceCount:plan.model.evidence.filter(e=>e.kind==='answer'&&e.evidencePrecision==='direct'&&e.conceptRoles.some(r=>r.conceptId===state.conceptId)).length,everSticky:state.everSticky,lapseCount:state.lapseCount,unresolvedEvidenceIds:state.unresolvedContradictions,lastAnswerAt:iso(state.lastTestedAt),lastInterventionAt:iso(state.lastIntervention?.occurredAt),provenAt:iso(state.provenAt),masteredAt:state.state==='mastered'?iso(state.transitions.findLast(t=>t.to==='mastered')?.occurredAt):null,nextDueTaskId:null,inputGeneration:snapshot.generation}));
 return {projections,recommendations,tasks,events,plan,diagnostics:{effectiveAnswers:effective.length,excludedFromMastery:effective.filter(e=>!e.eligible_for_mastery||!matches(e,versions)).length}};
}
