// Synthetic disposable catalogue. These actors/approvals never leave localhost.
import { randomUUID } from 'node:crypto';
import { compileRevision } from '../../server/adaptive/revision.mjs';
import { LEARNING_CONFIG } from '../../src/lib/learningConfig.js';
import { algorithmContract,digest } from '../../server/adaptive/runtime-bundle.mjs';
export async function seedTrustedLearningFixture(sql,options={}) {
 const suffix=randomUUID().slice(0,8),actor=randomUUID(),login=randomUUID(),content=randomUUID();
 const versions={mappingVersion:`test-map-${suffix}`,algorithmVersion:`test-algo-${suffix}`,configurationVersion:`test-config-${suffix}`};
 const config={...structuredClone(LEARNING_CONFIG),...versions,allowedReviewStatuses:['human_reviewed']};
 const revisions=Array.from({length:12},(_,i)=>compileRevision({id:`m${9000+i}`,q:`Synthetic ${suffix} scenario ${i}`,opts:['Synthetic correct','Synthetic incorrect'],correct:0,ch:'5',topic:'Synthetic RTO',difficulty:'medium',objective:'5.2'},'mcq',[{stage:'disposable_fixture'}]));
 await sql`insert into auth.users(id) values(${login})`;
 await sql`insert into adaptive_private.editorial_actors(actor_id,actor_kind,login_user_id,provenance_code) values(${actor},'human_editor',${login},'disposable-4c-fixture')`;
 // Catalogue payload hashes are computed only after rows exist. The versions are
 // inserted with their immutable digests in one transaction using predicted rows.
 const algorithm=algorithmContract(),configuration={config,interventions:{'test-rto-lesson':{criterion:'server_graded_targeted_check_v1',minimumCorrect:1,revisionIds:[revisions[10].revisionId]}}};
 if(options.malformedConfig)configuration.config.mastery.proofDelayMs=null;
 if(options.unknownAlgorithm)algorithm.implementation='unrecognized';
 // Reserve mapping version until exact catalogue serialization is available:
 // create all rows in a transaction and compute its hash before commit, using a
 // deferred fixture-only version insert whose final payload is staged below.
 await sql.begin(async tx=>{
  // Synthetic admin fixture only: timestamps are fixed so the sealed digest can
  // be assembled before inserting immutable records. Runtime never disables guards.
  const [{now}]=await tx`select now() as now`;
  const stamp=now.toISOString();
  const concepts=['recovery.rto','recovery.rpo'].map(id=>({mapping_version:versions.mappingVersion,mapping_kind:'mapping',concept_id:id,exam_scope:'SY0-701',name:id,description:'Disposable synthetic concept',objective_codes:['5.2'],domain_id:'sy0701.domain-5',chapter_id:'sy0701.objective-5.2',topic_id:'business-continuity-metrics',node_kind:'mastery_concept',aliases:[],review_status:'human_approved',reviewed_by:actor,reviewed_at:stamp,created_at:stamp}));
  const relationships=[{mapping_version:versions.mappingVersion,source_concept_id:'recovery.rpo',target_concept_id:'recovery.rto',relationship_type:'commonly_confused_with',direction:'bidirectional',editorial_weight:1,review_status:'human_approved',review_provenance:'Synthetic test only',reviewed_by:actor,reviewed_at:stamp,created_at:stamp}];
  const mappings=revisions.map((r,i)=>({mapping_version:versions.mappingVersion,revision_id:r.revisionId,concept_id:'recovery.rto',concept_role:'primary',precision:'direct',cognitive_skill:'application',model_revision_key:`sha256:${r.contentSha256}`,review_status:'human_approved',reviewed_by:actor,reviewed_at:stamp,question_id:r.questionId,question_type:r.questionType,scenario_family:i===1?'family-0':`family-${i}`,difficulty:'medium',content_signature:`sha256:${r.contentSha256}`})).sort((a,b)=>a.revision_id.localeCompare(b.revision_id));
  const contents=[{mapping_version:versions.mappingVersion,content_revision_id:content,concept_id:'recovery.rto',review_status:'human_approved',reviewed_by:actor,reviewed_at:stamp,content_id:'test-rto-lesson',content_kind:'lesson',content_signature:`sha256:${digest({suffix})}`}];
  const mapping={contract:'catalogue-v1',mappingVersion:versions.mappingVersion,catalogueSha256:digest({concepts:concepts.sort((a,b)=>a.concept_id.localeCompare(b.concept_id)),relationships,mappings,contents})};
  for(const [kind,payload] of Object.entries({mapping,algorithm,configuration})){
   const id=versions[`${kind}Version`],approved=!(options.unapproved&&kind==='algorithm');
   await tx`insert into public.adaptive_versions(version_id,version_kind,payload_sha256,review_status,approved_by,approved_at,created_at) values(${id},${kind},${options.corruptDigest===kind?'0'.repeat(64):digest(payload)},${approved?'human_approved':'pending'},${approved?actor:null},${approved?stamp:null},${stamp})`;
   await tx`insert into adaptive_private.version_payloads(version_id,payload) values(${id},${tx.json(payload)})`;
  }
  for(const c of concepts){const {mapping_kind,...row}=c;await tx`insert into public.adaptive_concepts ${tx(row)}`;}
  for(const row of relationships)await tx`insert into public.adaptive_relationships ${tx(row)}`;
  for(const r of revisions){const m=mappings.find(m=>m.revision_id===r.revisionId);
   await tx`insert into public.adaptive_question_revisions(revision_id,question_id,question_type,content_signature,publication_source,publication_steps,published_at,objective_codes,domain_id,topic_id,difficulty,scenario_family,review_status,reviewed_by,reviewed_at) values(${r.revisionId},${r.questionId},${r.questionType},${`sha256:${r.contentSha256}`},'disposable_fixture',${['disposable_fixture']},${stamp},${['5.2']},'sy0701.domain-5','business-continuity-metrics','medium',${m.scenario_family},'human_approved',${actor},${stamp})`;
   for(const c of r.components)await tx`insert into public.adaptive_answer_components values(${r.revisionId},${c.id},${c.kind})`;
   await tx`insert into adaptive_private.grading_keys(revision_id,grading_contract,grading_payload,payload_sha256) values(${r.revisionId},'pilot-revision-v1',${tx.json({compiledRevision:r})},${digest({compiledRevision:r})})`;
   const {question_id,question_type,scenario_family,difficulty,content_signature,...row}=m;await tx`insert into public.adaptive_question_mappings ${tx(row)}`;
  }
  await tx`insert into public.adaptive_content_revisions values(${content},'test-rto-lesson','lesson',${contents[0].content_signature})`;
  const {content_id,content_kind,content_signature,...cm}=contents[0];await tx`insert into public.adaptive_content_mappings ${tx(cm)}`;
  await tx`insert into public.adaptive_version_sets(mapping_version,algorithm_version,configuration_version) values(${versions.mappingVersion},${versions.algorithmVersion},${versions.configurationVersion})`;
  if(!options.unapproved)for(const id of Object.values(versions))await tx`insert into public.adaptive_version_events(version_id,action,actor_id,reason) values(${id},'activate',${actor},'Disposable fixture only')`;
  for(const r of revisions)await tx`insert into public.adaptive_question_publications(revision_id,status,actor_id) values(${r.revisionId},'active',${actor})`;
  if(!options.unapproved)await tx`insert into adaptive_private.shadow_authorizations(mapping_version,algorithm_version,configuration_version,action,actor_id) values(${versions.mappingVersion},${versions.algorithmVersion},${versions.configurationVersion},'authorize',${actor})`;
 });
 return {versions,config,revisions,actor,login,content};
}
