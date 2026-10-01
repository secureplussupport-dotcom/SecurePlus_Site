-- LOCAL ONLY: run after the new migration in a disposable Supabase database.
-- Synthetic fixtures, no production IDs/data. Everything rolls back.
\set ON_ERROR_STOP on
begin;
create schema adaptive_test;
grant usage on schema adaptive_test to anon, authenticated, service_role;
create function adaptive_test.assert_ok(ok boolean, message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',message; end if; end;
$$;
create function adaptive_test.expect_error(statement text, expected text) returns void language plpgsql as $$
begin
  begin execute statement;
  exception when others then
    if sqlstate=expected then return; end if;
    raise exception 'Expected SQLSTATE %, got %: %',expected,sqlstate,sqlerrm;
  end;
  raise exception 'Expected SQLSTATE %, statement succeeded',expected;
end;
$$;

grant execute on all functions in schema adaptive_test to anon, authenticated, service_role;

insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-000000000001','adaptive-local-a@example.invalid'),
 ('00000000-0000-4000-8000-000000000002','adaptive-local-b@example.invalid');
insert into public.adaptive_versions(version_id,version_kind,payload_sha256,review_status,approved_by,approved_at) values
 ('local-map-v1','mapping',repeat('a',64),'human_approved','00000000-0000-4000-8000-000000000001',now()),
 ('local-algo-v1','algorithm',repeat('b',64),'human_approved','00000000-0000-4000-8000-000000000001',now()),
 ('local-config-v1','configuration',repeat('c',64),'human_approved','00000000-0000-4000-8000-000000000001',now()),
 ('local-pending-v1','mapping',repeat('d',64),'agent_reviewed_pending_human',null,null);
insert into adaptive_private.version_payloads(version_id,payload) select version_id,'{"fixture":true}' from public.adaptive_versions;
insert into public.adaptive_concepts(mapping_version,concept_id,exam_scope,name,description,objective_codes,domain_id,chapter_id,topic_id,node_kind,review_status,reviewed_by,reviewed_at) values
 ('local-map-v1','recovery.rto','SY0-701','RTO','Local fixture',array['3.4'],'3','3.4','recovery','mastery_concept','human_approved','00000000-0000-4000-8000-000000000001',now());
insert into public.adaptive_question_revisions(revision_id,question_id,question_type,content_signature,publication_source,publication_steps,published_at,objective_codes,domain_id,topic_id,difficulty,scenario_family,review_status) values
 ('00000000-0000-4000-8000-000000000010','m001','mcq','sha256:'||repeat('e',64),'local fixture',array['authored'],now(),array['3.4'],'3','recovery','medium','local-family','pending');
insert into public.adaptive_answer_components values ('00000000-0000-4000-8000-000000000010','option-a','option');
insert into adaptive_private.grading_keys(revision_id,grading_contract,grading_payload,payload_sha256) values
 ('00000000-0000-4000-8000-000000000010','synthetic-v1','{"correct":"option-a"}',repeat('f',64));
insert into public.adaptive_question_mappings(mapping_version,revision_id,concept_id,concept_role,precision,cognitive_skill,review_status,reviewed_by,reviewed_at) values
 ('local-map-v1','00000000-0000-4000-8000-000000000010','recovery.rto','primary','direct','apply','human_approved','00000000-0000-4000-8000-000000000001',now());
insert into public.adaptive_version_sets(mapping_version,algorithm_version,configuration_version) values ('local-map-v1','local-algo-v1','local-config-v1');
insert into public.adaptive_version_events(version_id,action,actor_id,reason) select version_id,'activate','00000000-0000-4000-8000-000000000001','Local approval fixture' from public.adaptive_versions where review_status='human_approved';
insert into public.adaptive_question_publications(revision_id,status,actor_id) values ('00000000-0000-4000-8000-000000000010','active','00000000-0000-4000-8000-000000000001');

set local role service_role;
insert into public.adaptive_sessions(session_id,owner_id,set_index,source,mode,requested_count,actual_count,requested_pbq_count,actual_pbq_count,mapping_version,algorithm_version,configuration_version) values
 ('00000000-0000-4000-8000-000000000020','00000000-0000-4000-8000-000000000001',9999,'practice','normal',1,1,0,0,'local-map-v1','local-algo-v1','local-config-v1');
insert into public.adaptive_session_items values ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000020',1,'00000000-0000-4000-8000-000000000010');
set constraints all immediate;
select adaptive_test.assert_ok((select set_index=1 from public.adaptive_sessions),'server overwrites arbitrary set index');
insert into public.adaptive_answer_evidence(evidence_id,owner_id,client_event_id,submission_sha256,session_id,item_position,revision_id,question_id,selected_components,correct,mapping_version,algorithm_version,configuration_version,evidence_precision,provenance,source,mode,occurred_at,classification_at_ingest,classification_provenance) values
 ('00000000-0000-4000-8000-000000000030','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000040',repeat('a',64),'00000000-0000-4000-8000-000000000020',1,'00000000-0000-4000-8000-000000000010','m001','[{"componentId":"option-a","valueId":"option-a"}]',false,'local-map-v1','local-algo-v1','local-config-v1','direct','complete','practice','normal',clock_timestamp(),'fresh_scenario','server_history_snapshot');
select adaptive_test.assert_ok((select concept_snapshot->0->>'conceptId'='recovery.rto' from public.adaptive_answer_evidence),'mapping snapshot derived by database');
select adaptive_test.expect_error($q$insert into public.adaptive_answer_evidence(owner_id,client_event_id,submission_sha256,mapping_version,algorithm_version,configuration_version,evidence_precision,provenance,source,mode,classification_at_ingest,classification_provenance,legacy_attempt_id) values ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000040',repeat('b',64),'local-map-v1','local-algo-v1','local-config-v1','unknown','legacy_inferred','legacy','legacy','unknown','legacy_unknown','00000000-0000-4000-8000-000000000050')$q$,'23505');
select adaptive_test.expect_error('update public.adaptive_answer_evidence set correct=true','42501');
select adaptive_test.expect_error('delete from public.adaptive_question_revisions','42501');
select adaptive_test.expect_error('update public.adaptive_versions set version_id=version_id','55000');
select adaptive_test.expect_error('update public.adaptive_question_revisions set revision_id=revision_id','55000');
select adaptive_test.expect_error($q$insert into public.adaptive_version_events(version_id,action,actor_id,reason) values ('local-pending-v1','activate','00000000-0000-4000-8000-000000000001','must fail')$q$,'23514');
select adaptive_test.expect_error($q$insert into public.adaptive_answer_components values ('00000000-0000-4000-8000-000000000010','option-b','option')$q$,'55000');

insert into public.adaptive_concept_projections(owner_id,concept_id,mapping_version,algorithm_version,configuration_version,state,evidence_level,effective_sample,distinct_questions,distinct_scenarios,complete_evidence_count,ever_sticky,lapse_count,unresolved_evidence_ids,input_generation,receipt_watermark,replay_from,input_sha256,projection_status) values
 ('00000000-0000-4000-8000-000000000001','recovery.rto','local-map-v1','local-algo-v1','local-config-v1','learning_signal','limited',1,1,1,1,false,0,array['00000000-0000-4000-8000-000000000030'::uuid],1,1,now(),repeat('a',64),'ready');
select adaptive_test.expect_error('update public.adaptive_concept_projections set input_generation=0','40001');
select adaptive_test.expect_error($q$update public.adaptive_concept_projections set state='proven',proven_at=now(),unresolved_evidence_ids='{}'$q$,'23514');
insert into public.adaptive_session_events(owner_id,session_id,client_event_id,status,occurred_at) values ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000020','00000000-0000-4000-8000-000000000041','completed',clock_timestamp());
select adaptive_test.assert_ok((select count(*)=1 from public.adaptive_answer_evidence),'session summaries never enter answer ledger');
insert into public.adaptive_answer_evidence(owner_id,client_event_id,submission_sha256,mapping_version,algorithm_version,configuration_version,evidence_precision,provenance,source,mode,classification_at_ingest,classification_provenance,legacy_attempt_id) values ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000042',repeat('b',64),'local-map-v1','local-algo-v1','local-config-v1','direct','legacy_inferred','legacy','legacy','unknown','legacy_unknown','00000000-0000-4000-8000-000000000050');
select adaptive_test.assert_ok((select not eligible_for_mastery from public.adaptive_answer_evidence where provenance='legacy_inferred'),'legacy cannot become mastery evidence');
select adaptive_test.assert_ok((select projection_status='stale' from public.adaptive_concept_projections),'new arrivals invalidate projections');
update public.adaptive_concept_projections set input_generation=2,projection_status='ready';
select adaptive_test.assert_ok((select projection_status='ready' from public.adaptive_concept_projections),'projection cache can be rebuilt');

reset role;
-- Triggers protect immutable records even from accidental owner-level edits.
select adaptive_test.expect_error('update public.adaptive_answer_evidence set correct=true','55000');
select adaptive_test.expect_error('delete from public.adaptive_question_revisions','55000');
select adaptive_test.expect_error('truncate public.adaptive_answer_evidence cascade','55000');
select adaptive_test.assert_ok(not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where (n.nspname='public' and c.relname like 'adaptive_%' or n.nspname='adaptive_private') and c.relkind='r' and not c.relrowsecurity),'RLS enabled on every new table');
select adaptive_test.assert_ok(not exists(select 1 from information_schema.columns where table_schema='public' and table_name in('adaptive_concepts','adaptive_question_revisions','adaptive_answer_components','adaptive_question_mappings') and column_name in('grading_payload','correct_answer','answer_key')),'safe catalogue has no grading columns');

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select adaptive_test.assert_ok((select count(*)=2 from public.adaptive_answer_evidence),'owner can read own evidence');
select adaptive_test.assert_ok((select count(*)=0 from public.adaptive_versions where version_id='local-pending-v1'),'pending versions hidden');
select adaptive_test.assert_ok((select count(*)=1 from public.adaptive_concepts),'approved active catalogue readable');
select adaptive_test.expect_error('select * from adaptive_private.grading_keys','42501');
select adaptive_test.expect_error('update public.adaptive_concept_projections set state=''mastered''','42501');
select adaptive_test.expect_error('update public.adaptive_answer_evidence set correct=true','42501');
select adaptive_test.expect_error('insert into public.adaptive_answer_evidence default values','42501');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select adaptive_test.assert_ok((select count(*)=0 from public.adaptive_answer_evidence),'cross-user evidence hidden');
select adaptive_test.assert_ok((select count(*)=0 from public.adaptive_sessions),'cross-user sessions hidden');
select adaptive_test.assert_ok((select count(*)=0 from public.adaptive_session_items),'cross-user manifests hidden');
select adaptive_test.assert_ok((select count(*)=0 from public.adaptive_concept_projections),'cross-user projections hidden');
reset role;
set local role anon;
select adaptive_test.expect_error('select * from public.adaptive_question_revisions','42501');
select adaptive_test.expect_error('select * from adaptive_private.grading_keys','42501');
reset role;
rollback;
\echo 'PASS local adaptive SQL assertions (all synthetic changes rolled back)'
