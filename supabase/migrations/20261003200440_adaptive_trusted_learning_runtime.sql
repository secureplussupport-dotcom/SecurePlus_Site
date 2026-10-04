-- Phase 2B-4C. Unseeded local validation only; no runtime route or activation.
begin;
create table adaptive_private.session_plans (
 plan_id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete restrict,
 enrollment_id uuid not null,
 session_id uuid not null unique,
 plan jsonb not null check(jsonb_typeof(plan)='object' and pg_column_size(plan)<=262144),
 items jsonb not null check(jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 500 and pg_column_size(items)<=1048576),
 created_at timestamptz not null default clock_timestamp(),
 unique(owner_id,plan_id), unique(owner_id,session_id)
);
create table adaptive_private.intervention_proofs (
 owner_id uuid not null references auth.users(id) on delete restrict,
 enrollment_id uuid not null,
 client_event_id uuid not null,
 recommendation_id uuid not null,
 evidence_ids uuid[] not null check(cardinality(evidence_ids) between 1 and 30),
 occurred_at timestamptz not null,
 primary key(owner_id,client_event_id),
 foreign key(owner_id,recommendation_id) references public.adaptive_recommendations(owner_id,recommendation_id) on delete restrict
);
create index intervention_proofs_recommendation on adaptive_private.intervention_proofs(owner_id,recommendation_id);
do $$ declare t text;begin
 foreach t in array array['session_plans','intervention_proofs'] loop
  execute format('alter table adaptive_private.%I enable row level security',t);
  execute format('revoke all on adaptive_private.%I from public,anon,authenticated,service_role,adaptive_ingest,adaptive_worker,adaptive_erasure',t);
  execute format('grant select on adaptive_private.%I to adaptive_worker',t);
  execute format('create policy trusted_runtime_read on adaptive_private.%I for select to adaptive_worker using(true)',t);
  execute format('create trigger immutable before update or delete on adaptive_private.%I for each row execute function adaptive_private.reject_owned_change()',t);
  execute format('create trigger no_truncate before truncate on adaptive_private.%I for each statement execute function adaptive_private.reject_change()',t);
 end loop;
end $$;
-- A server capability, never a browser API. Components are derived from the DB.
create function adaptive_private.store_session_plan(target uuid,enrollment uuid,document jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare id uuid; item jsonb; manifest jsonb:='[]'::jsonb; position integer:=0; pbqs integer:=0; q public.adaptive_question_revisions; components jsonb; previous adaptive_private.session_plans;
begin
 perform adaptive_private.assert_owner_writable(target,enrollment);
 if jsonb_typeof(document) is distinct from 'object' or pg_column_size(document)>262144
  or (select count(*) from jsonb_object_keys(document))<>10
  or not(document ?& array['sessionId','source','mode','seed','requestedCount','requestedPbqCount','revisionIds','mappingVersion','algorithmVersion','configurationVersion'])
  or jsonb_typeof(document->'revisionIds') is distinct from 'array' or jsonb_array_length(document->'revisionIds') not between 1 and 500
  or not adaptive_private.shadow_allowed(document->>'mappingVersion',document->>'algorithmVersion',document->>'configurationVersion') then raise exception 'Invalid trusted plan' using errcode='23514';end if;
 select * into previous from adaptive_private.session_plans where owner_id=target and session_id=(document->>'sessionId')::uuid;
 if found then
  if previous.enrollment_id<>enrollment or previous.plan<>document then raise exception 'Plan retry conflict' using errcode='23514';end if;
  return previous.plan_id;
 end if;
 if document->>'source' not in ('practice','smart_review','diagnostic','exam','targeted_review') or document->>'mode' not in ('normal','smart_review','diagnostic','exam','targeted_review')
  or (document->>'requestedCount')::integer not between jsonb_array_length(document->'revisionIds') and 500
  or (document->>'requestedPbqCount')::integer not between 0 and (document->>'requestedCount')::integer then raise exception 'Invalid plan composition' using errcode='23514';end if;
 if (select count(distinct value) from jsonb_array_elements(document->'revisionIds'))<>jsonb_array_length(document->'revisionIds') then raise exception 'Duplicate plan item' using errcode='23514';end if;
 for item in select value from jsonb_array_elements(document->'revisionIds') loop
  select * into strict q from public.adaptive_question_revisions where revision_id=(item#>>'{}')::uuid and review_status='human_approved';
  if (select status from public.adaptive_question_publications where revision_id=q.revision_id order by event_index desc limit 1) is distinct from 'active'
   or not exists(select 1 from public.adaptive_question_mappings where mapping_version=document->>'mappingVersion' and revision_id=q.revision_id and concept_role='primary' and review_status='human_approved') then raise exception 'Unapproved plan revision' using errcode='23514';end if;
  select jsonb_agg(jsonb_build_object('id',component_id,'kind',component_kind) order by component_id) into components from (select component_id,component_kind from public.adaptive_answer_components where revision_id=q.revision_id order by component_id limit 201) c;
  if components is null or jsonb_array_length(components)>200 then raise exception 'Missing plan components' using errcode='23514';end if;
  position:=position+1;pbqs:=pbqs+(q.question_type='pbq')::integer;
  manifest:=manifest||jsonb_build_array(jsonb_build_object('position',position,'revisionId',q.revision_id,'questionId',q.question_id,'components',components));
 end loop;
 if pbqs>(document->>'requestedPbqCount')::integer then raise exception 'PBQ count mismatch' using errcode='23514';end if;
 insert into adaptive_private.session_plans(owner_id,enrollment_id,session_id,plan,items) values(target,enrollment,(document->>'sessionId')::uuid,document,manifest) returning plan_id into id;
 return id;
end $$;
create function adaptive_private.resolve_session_plan(target uuid,id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare p adaptive_private.session_plans;
begin
 select * into strict p from adaptive_private.session_plans where owner_id=target and plan_id=id;
 perform adaptive_private.assert_owner_writable(target,p.enrollment_id);
 if not adaptive_private.shadow_allowed(p.plan->>'mappingVersion',p.plan->>'algorithmVersion',p.plan->>'configurationVersion') then raise exception 'Plan version no longer authorized' using errcode='55000';end if;
 return p.plan;
end $$;
create function adaptive_private.check_trusted_plan() returns trigger
language plpgsql security definer set search_path='' as $$
declare s public.adaptive_sessions; p adaptive_private.session_plans; actual jsonb;
begin
 select * into strict s from public.adaptive_sessions where owner_id=new.owner_id and session_id=new.session_id;
 select * into p from adaptive_private.session_plans where owner_id=new.owner_id and session_id=new.session_id;
 -- Earlier service-role local fixtures are retained; restricted ingestion has no bypass.
 if not found then
  if current_setting('role')='adaptive_ingest' then raise exception 'Trusted immutable plan required' using errcode='23514';end if;
  return null;
 end if;
 perform adaptive_private.assert_owner_writable(s.owner_id,p.enrollment_id);
 select jsonb_build_object('sessionId',s.session_id,'source',s.source,'mode',s.mode,'seed',s.seed,'requestedCount',s.requested_count,'requestedPbqCount',s.requested_pbq_count,
  'revisionIds',jsonb_agg(i.revision_id order by i.position),'mappingVersion',s.mapping_version,'algorithmVersion',s.algorithm_version,'configurationVersion',s.configuration_version)
  into actual from public.adaptive_session_items i where i.owner_id=s.owner_id and i.session_id=s.session_id;
 if actual is distinct from p.plan then raise exception 'Session differs from immutable plan' using errcode='23514';end if;
 return null;
end $$;
create constraint trigger trusted_session_plan after insert on public.adaptive_sessions deferrable initially deferred for each row execute function adaptive_private.check_trusted_plan();
create constraint trigger trusted_item_plan after insert on public.adaptive_session_items deferrable initially deferred for each row execute function adaptive_private.check_trusted_plan();

-- Server-graded targeted checks are the only implemented completion criterion.
-- No page-open, elapsed time or learner self-rating can satisfy this function.
create function adaptive_private.verify_intervention_completion(target uuid,rec uuid,event uuid,at_time timestamptz) returns boolean
language plpgsql security definer set search_path='' as $$
declare r public.adaptive_recommendations; rule jsonb; ids uuid[]; enrollment uuid; required integer;
begin
 enrollment:=adaptive_private.assert_owner_writable(target);
 select * into strict r from public.adaptive_recommendations where owner_id=target and recommendation_id=rec and role='direct';
 select p.payload->'interventions'->c.content_id into rule from adaptive_private.version_payloads p join public.adaptive_content_revisions c on c.content_revision_id=r.content_revision_id where p.version_id=r.configuration_version;
 if rule is null or rule->>'criterion'<>'server_graded_targeted_check_v1' then return false;end if;
 required:=(rule->>'minimumCorrect')::integer;
 if required not between 1 and 30 or jsonb_typeof(rule->'revisionIds') is distinct from 'array' or at_time<r.created_at or at_time>clock_timestamp()+interval '5 minutes' then return false;end if;
 select array_agg(x.evidence_id) into ids from (
  select distinct on(e.revision_id) e.evidence_id from public.adaptive_answer_evidence e
  join adaptive_private.session_plans p on p.owner_id=e.owner_id and p.session_id=e.session_id and p.enrollment_id=enrollment
  where e.owner_id=target and e.correct and e.eligible_for_mastery and e.source='targeted_review' and e.occurred_at>r.created_at and e.occurred_at<=at_time
   and rule->'revisionIds' ? e.revision_id::text
   and row(e.mapping_version,e.algorithm_version,e.configuration_version)=row(r.mapping_version,r.algorithm_version,r.configuration_version)
   and not exists(select 1 from public.adaptive_answer_evidence newer where newer.owner_id=target and newer.supersedes_evidence_id=e.evidence_id)
  order by e.revision_id,e.receipt_index desc limit 30
 ) x;
 if coalesce(cardinality(ids),0)<required then return false;end if;
 insert into adaptive_private.intervention_proofs values(target,enrollment,event,rec,ids,at_time) on conflict(owner_id,client_event_id) do nothing;
 return exists(select 1 from adaptive_private.intervention_proofs where owner_id=target and client_event_id=event and recommendation_id=rec and occurred_at=at_time);
end $$;
create function adaptive_private.guard_intervention_proof() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if current_setting('role')='adaptive_ingest' and new.completion_verified and not exists(
  select 1 from adaptive_private.intervention_proofs where owner_id=new.owner_id and client_event_id=new.client_event_id and recommendation_id=new.recommendation_id and occurred_at=new.occurred_at
 ) then raise exception 'Server completion proof required' using errcode='23514';end if;
 return new;
end $$;
create trigger adaptive_intervention_proof before insert on public.adaptive_interventions for each row execute function adaptive_private.guard_intervention_proof();

-- Owner graph erasure extends the existing scoped eraser without granting it.
alter function adaptive_private.erase_owned_graph(uuid) rename to erase_owned_graph_4b;
create function adaptive_private.erase_owned_graph(target_owner uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_owner::text,7919));
 perform set_config('adaptive_private.deletion_owner',target_owner::text,true);
 delete from adaptive_private.intervention_proofs where owner_id=target_owner;
 delete from adaptive_private.session_plans where owner_id=target_owner;
 return adaptive_private.erase_owned_graph_4b(target_owner);
end $$;
revoke all on function adaptive_private.erase_owned_graph_4b(uuid),adaptive_private.erase_owned_graph(uuid) from public,anon,authenticated,service_role,adaptive_ingest,adaptive_worker,adaptive_erasure;
revoke all on all functions in schema adaptive_private from public,anon,authenticated;
grant execute on function adaptive_private.store_session_plan(uuid,uuid,jsonb),adaptive_private.resolve_session_plan(uuid,uuid),adaptive_private.verify_intervention_completion(uuid,uuid,uuid,timestamptz) to adaptive_ingest;

create or replace function adaptive_private.validate_recommendation() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare e public.adaptive_answer_evidence;
begin
  select * into strict e from public.adaptive_answer_evidence where owner_id=new.owner_id and evidence_id=new.source_evidence_id;
  if not e.eligible_for_mastery or row(new.mapping_version,new.algorithm_version,new.configuration_version)
      is distinct from row(e.mapping_version,e.algorithm_version,e.configuration_version)
    or not (e.concept_snapshot @> jsonb_build_array(jsonb_build_object('conceptId',new.concept_id)) or (new.role='supporting' and exists(select 1 from public.adaptive_relationships g where g.mapping_version=new.mapping_version and g.review_status='human_approved' and ((g.target_concept_id=new.concept_id and e.concept_snapshot @> jsonb_build_array(jsonb_build_object('conceptId',g.source_concept_id))) or (g.source_concept_id=new.concept_id and (g.direction='bidirectional' or g.relationship_type='prerequisite_for') and e.concept_snapshot @> jsonb_build_array(jsonb_build_object('conceptId',g.target_concept_id))))))) then
    raise exception 'Recommendation requires matching complete direct evidence' using errcode='23514';
  end if;
  if new.content_revision_id is not null and not exists(
    select 1 from public.adaptive_content_mappings m where m.mapping_version=new.mapping_version
      and m.content_revision_id=new.content_revision_id and m.concept_id=new.concept_id and m.review_status='human_approved'
  ) then
    raise exception 'Recommendation content must have an approved concept mapping' using errcode='23514';
  end if;
  return new;
end;
$$;
-- Atomic derived-output phase. It validates a current lease before any write,
-- uses only that job's owner/version, and parks that lease if writes advance
-- generation. The already-enqueued current generation publishes in a follow-up.
create function adaptive_private.apply_learning_outputs(id uuid,token bigint,target uuid,enrollment uuid,generation bigint,output jsonb) returns boolean
language plpgsql security definer set search_path='' as $$
declare j adaptive_private.projection_jobs; r jsonb; t uuid; current_generation bigint;
begin
 perform adaptive_private.assert_job(id,token,target,enrollment,generation);
 select * into strict j from adaptive_private.projection_jobs where job_id=id;
 if jsonb_typeof(output) is distinct from 'object' or pg_column_size(output)>1048576
  or jsonb_typeof(output->'recommendations') is distinct from 'array' or jsonb_array_length(output->'recommendations')>300
  or jsonb_typeof(output->'tasks') is distinct from 'array' or jsonb_array_length(output->'tasks')>300
  or jsonb_typeof(output->'events') is distinct from 'array' or jsonb_array_length(output->'events')>1000 then raise exception 'Output limit' using errcode='23514';end if;
 for r in select value from jsonb_array_elements(output->'recommendations') loop
  if r->>'key' !~ '^runtime-rec:[0-9a-f]{64}$' or exists(select 1 from public.adaptive_recommendations x where x.owner_id=target and x.scheduling_key=r->>'key' and row(x.concept_id,x.content_revision_id,x.source_evidence_id,x.role,x.reason_codes,x.mapping_version,x.algorithm_version,x.configuration_version) is distinct from row(r->>'conceptId',(r->>'contentRevisionId')::uuid,(r->>'sourceEvidenceId')::uuid,r->>'role',array(select jsonb_array_elements_text(r->'reasons')),j.mapping_version,j.algorithm_version,j.configuration_version)) then raise exception 'Recommendation identity conflict' using errcode='23514';end if;
  if not exists(select 1 from public.adaptive_recommendations where owner_id=target and scheduling_key=r->>'key') then
   insert into public.adaptive_recommendations(owner_id,scheduling_key,concept_id,content_revision_id,source_evidence_id,role,reason_codes,mapping_version,algorithm_version,configuration_version)
   values(target,r->>'key',r->>'conceptId',(r->>'contentRevisionId')::uuid,(r->>'sourceEvidenceId')::uuid,r->>'role',array(select jsonb_array_elements_text(r->'reasons')),j.mapping_version,j.algorithm_version,j.configuration_version);
  end if;
 end loop;
 for r in select value from jsonb_array_elements(output->'tasks') loop
  if r->>'key' !~ '^runtime-task:[0-9a-f]{64}$' or exists(select 1 from public.adaptive_review_tasks x where x.owner_id=target and x.scheduling_key=r->>'key' and row(x.concept_id,x.source_evidence_id,x.target_revision_id,x.task_type,x.reason_codes,x.eligible_at,x.eligible_set_index,x.initial_status,x.mapping_version,x.algorithm_version,x.configuration_version) is distinct from row(r->>'conceptId',(r->>'sourceEvidenceId')::uuid,(r->>'targetRevisionId')::uuid,r->>'taskType',array(select jsonb_array_elements_text(r->'reasons')),(r->>'eligibleAt')::timestamptz,(r->>'eligibleSetIndex')::bigint,r->>'initialStatus',j.mapping_version,j.algorithm_version,j.configuration_version)) then raise exception 'Task identity conflict' using errcode='23514';end if;
  if not exists(select 1 from public.adaptive_review_tasks where owner_id=target and scheduling_key=r->>'key') then
   insert into public.adaptive_review_tasks(owner_id,scheduling_key,concept_id,source_evidence_id,target_revision_id,task_type,reason_codes,eligible_at,eligible_set_index,initial_status,mapping_version,algorithm_version,configuration_version)
   values(target,r->>'key',r->>'conceptId',(r->>'sourceEvidenceId')::uuid,(r->>'targetRevisionId')::uuid,r->>'taskType',array(select jsonb_array_elements_text(r->'reasons')),(r->>'eligibleAt')::timestamptz,(r->>'eligibleSetIndex')::bigint,r->>'initialStatus',j.mapping_version,j.algorithm_version,j.configuration_version);
  end if;
 end loop;
 for r in select value from jsonb_array_elements(output->'events') loop
  if r->>'key' !~ '^runtime-event:[0-9a-f]{64}$' or exists(select 1 from public.adaptive_review_task_events x where x.owner_id=target and x.event_key=r->>'key' and row(x.task_id,x.status,x.completion_evidence_id,x.occurred_at) is distinct from row((r->>'taskId')::uuid,r->>'status',(r->>'completionEvidenceId')::uuid,(r->>'occurredAt')::timestamptz)) then raise exception 'Task event identity conflict' using errcode='23514';end if;
  if not exists(select 1 from public.adaptive_review_task_events where owner_id=target and event_key=r->>'key') then
   select task_id into strict t from public.adaptive_review_tasks where owner_id=target and task_id=(r->>'taskId')::uuid
    and row(mapping_version,algorithm_version,configuration_version)=row(j.mapping_version,j.algorithm_version,j.configuration_version);
   insert into public.adaptive_review_task_events(owner_id,task_id,event_key,status,completion_evidence_id,occurred_at)
    values(target,t,r->>'key',r->>'status',(r->>'completionEvidenceId')::uuid,(r->>'occurredAt')::timestamptz);
  end if;
 end loop;
 perform adaptive_private.assert_job(id,token,target,enrollment,generation,false);
 select evidence_generation into current_generation from adaptive_private.owner_state where owner_id=target;
 if current_generation<>generation then
  perform adaptive_private.finish_job(id,token,target,enrollment,generation,'parked','generation_changed');
  return true;
 end if;
 return false;
end $$;
revoke all on function adaptive_private.apply_learning_outputs(uuid,bigint,uuid,uuid,bigint,jsonb) from public,anon,authenticated,service_role;
grant execute on function adaptive_private.apply_learning_outputs(uuid,bigint,uuid,uuid,bigint,jsonb) to adaptive_worker;
commit;
