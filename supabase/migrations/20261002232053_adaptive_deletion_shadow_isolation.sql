-- Phase 2B-4A. Local-only review package; no seeds, approvals or activation.
begin;
-- Shadow is internal even when a catalogue version has publication events.
do $$ declare r record; begin
  for r in select schemaname,tablename,policyname from pg_policies
    where (schemaname='public' and tablename like 'adaptive_%') or schemaname='adaptive_private'
  loop execute format('drop policy %I on %I.%I',r.policyname,r.schemaname,r.tablename); end loop;
  for r in select schemaname,tablename from pg_tables
    where (schemaname='public' and tablename like 'adaptive_%') or schemaname='adaptive_private'
  loop execute format('revoke all on table %I.%I from public,anon,authenticated',r.schemaname,r.tablename); end loop;
end $$;
revoke all on schema adaptive_private from public,anon,authenticated;
revoke all on all functions in schema adaptive_private from public,anon,authenticated;

create table adaptive_private.shadow_authorizations (
  event_index bigint generated always as identity primary key,
  mapping_version text not null,
  algorithm_version text not null,
  configuration_version text not null,
  action text not null check(action in ('authorize','revoke')),
  actor_id uuid not null references adaptive_private.editorial_actors(actor_id),
  created_at timestamptz not null default clock_timestamp(),
  foreign key(mapping_version,algorithm_version,configuration_version)
    references public.adaptive_version_sets(mapping_version,algorithm_version,configuration_version)
);
create index shadow_authorization_versions on adaptive_private.shadow_authorizations(mapping_version,algorithm_version,configuration_version,event_index desc);
create index shadow_authorization_actor on adaptive_private.shadow_authorizations(actor_id);
create function adaptive_private.check_shadow_authorization() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  perform 1 from public.adaptive_versions where version_id in (new.mapping_version,new.algorithm_version,new.configuration_version) order by version_id for update;
  if not exists(select 1 from adaptive_private.editorial_actors where actor_id=new.actor_id and actor_kind='human_editor' and retired_at is null) then
    raise exception 'Human editorial authority required' using errcode='23514';
  end if;
  if new.action='authorize' and (
    (select count(*) from public.adaptive_versions where version_id in(new.mapping_version,new.algorithm_version,new.configuration_version) and review_status='human_approved')<>3
    or exists(select 1 from public.adaptive_concepts where mapping_version=new.mapping_version and review_status<>'human_approved')
    or exists(select 1 from public.adaptive_relationships where mapping_version=new.mapping_version and review_status<>'human_approved')
    or exists(select 1 from public.adaptive_question_mappings where mapping_version=new.mapping_version and review_status<>'human_approved')
    or exists(select 1 from public.adaptive_content_mappings where mapping_version=new.mapping_version and review_status<>'human_approved')
  ) then raise exception 'Private shadow requires human-approved catalogue and versions' using errcode='23514'; end if;
  new.created_at:=clock_timestamp();
  return new;
end $$;
create trigger shadow_authorization_guard before insert on adaptive_private.shadow_authorizations for each row execute function adaptive_private.check_shadow_authorization();
create trigger shadow_authorization_immutable before update or delete on adaptive_private.shadow_authorizations for each row execute function adaptive_private.reject_change();
create trigger shadow_authorization_no_truncate before truncate on adaptive_private.shadow_authorizations for each statement execute function adaptive_private.reject_change();
create function adaptive_private.shadow_allowed(m text,a text,c text) returns boolean
language sql stable security invoker set search_path='' as $$
  select coalesce((select action='authorize' from adaptive_private.shadow_authorizations where mapping_version=m and algorithm_version=a and configuration_version=c order by event_index desc limit 1),false)
$$;
create or replace function adaptive_private.validate_session_versions() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if not adaptive_private.shadow_allowed(new.mapping_version,new.algorithm_version,new.configuration_version) then
    raise exception 'Private shadow version set not authorized' using errcode='23514';
  end if;
  return new;
end $$;

create table adaptive_private.shadow_enrollments (
  owner_id uuid primary key references auth.users(id) on delete restrict,
  enrollment_id uuid not null unique default gen_random_uuid(),
  consent_reference uuid not null,
  enrolled_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null,
  check(expires_at>enrolled_at and expires_at<=enrolled_at+interval '30 days')
);
create index shadow_enrollment_expiry on adaptive_private.shadow_enrollments(expires_at);
-- Owner is deliberately not an Auth FK: a crash after Auth deletion must be
-- resumable. Completion removes the owner and request links, leaving a receipt.
create table adaptive_private.erasure_operations (
  operation_id uuid primary key default gen_random_uuid(),
  owner_id uuid unique,
  confirmation_request_id uuid,
  reason text not null check(reason in ('account','withdrawal','expiry')),
  stage text not null default 'writes_blocked' check(stage in ('writes_blocked','jobs_cancelled','graph_erased','external_done','auth_deleted','completed')),
  failed_retryable boolean not null default false,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  check((stage='completed')=(owner_id is null))
);

create function adaptive_private.assert_owner_writable(target uuid, expected_enrollment uuid default null) returns uuid
language plpgsql security invoker set search_path='' as $$
declare enrollment uuid;
begin
  if target is null then raise exception 'Owner required' using errcode='22004'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target::text,7919));
  if exists(select 1 from adaptive_private.erasure_operations where owner_id=target) then
    raise exception 'Adaptive owner blocked' using errcode='55000';
  end if;
  select enrollment_id into enrollment from adaptive_private.shadow_enrollments where owner_id=target and expires_at>clock_timestamp();
  if enrollment is null or (expected_enrollment is not null and expected_enrollment<>enrollment) then
    raise exception 'Shadow enrollment unavailable' using errcode='55000';
  end if;
  return enrollment;
end $$;
create function adaptive_private.guard_owner_write() returns trigger
language plpgsql security invoker set search_path='' as $$
declare row_data jsonb:=to_jsonb(new);
begin
  if tg_op='UPDATE' and new.owner_id is distinct from old.owner_id then raise exception 'Owner immutable' using errcode='55000'; end if;
  perform adaptive_private.assert_owner_writable(new.owner_id);
  if row_data ? 'mapping_version' and not adaptive_private.shadow_allowed(row_data->>'mapping_version',row_data->>'algorithm_version',row_data->>'configuration_version') then
    raise exception 'Shadow version authorization withdrawn' using errcode='23514';
  end if;
  return new;
end $$;
do $$ declare item text; begin
  foreach item in array array['adaptive_sessions','adaptive_session_items','adaptive_session_events','adaptive_answer_evidence','adaptive_recommendations','adaptive_interventions','adaptive_review_tasks','adaptive_review_task_events','adaptive_concept_projections'] loop
    execute format('create trigger aa_adaptive_owner_guard before insert or update on public.%I for each row execute function adaptive_private.guard_owner_write()',item);
  end loop;
end $$;
create trigger aa_adaptive_owner_guard before insert or update on adaptive_private.owner_state for each row execute function adaptive_private.guard_owner_write();

create function adaptive_private.enroll_shadow(target uuid, expiry timestamptz, consent uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target::text,7919));
  if exists(select 1 from adaptive_private.erasure_operations where owner_id=target) then raise exception 'Owner blocked' using errcode='55000'; end if;
  if consent is null or expiry<=clock_timestamp() or expiry>clock_timestamp()+interval '30 days' then raise exception 'Bounded consent period required' using errcode='23514'; end if;
  insert into adaptive_private.shadow_enrollments(owner_id,expires_at,consent_reference) values(target,expiry,consent) returning enrollment_id into result;
  return result;
end $$;

create function adaptive_private.begin_erasure(target uuid, purpose text, confirmation uuid default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid; valid boolean;
begin
  if target is null or purpose not in ('account','withdrawal','expiry') then raise exception 'Invalid erasure scope' using errcode='22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target::text,7919));
  select operation_id into result from adaptive_private.erasure_operations where owner_id=target;
  if result is not null and purpose<>'account' then return result; end if;
  -- A confirmed account request is checked even on retry; no caller-selected owner in the HTTP adapter.
  if purpose='account' then
    if to_regclass('public.account_deletion_requests') is null then raise exception 'Confirmation schema unavailable' using errcode='55000'; end if;
    execute 'select exists(select 1 from public.account_deletion_requests where id=$1 and user_id=$2 and used_at is not null)' into valid using confirmation,target;
    if not valid then raise exception 'Confirmed account request required' using errcode='42501'; end if;
  elsif purpose='expiry' and not exists(select 1 from adaptive_private.shadow_enrollments where owner_id=target and expires_at<=clock_timestamp()) then
    raise exception 'Enrollment has not expired' using errcode='55000';
  elsif purpose='withdrawal' and not exists(select 1 from adaptive_private.shadow_enrollments where owner_id=target) then
    raise exception 'No enrollment to withdraw' using errcode='55000';
  end if;
  select operation_id into result from adaptive_private.erasure_operations where owner_id=target;
  if result is not null then
    update adaptive_private.erasure_operations set reason='account',confirmation_request_id=confirmation where operation_id=result;
    return result;
  end if;
  insert into adaptive_private.erasure_operations(owner_id,reason,confirmation_request_id) values(target,purpose,confirmation) returning operation_id into result;
  return result;
end $$;
create function adaptive_private.erase_owned_graph(target_owner uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare deleted_rows bigint; deleted_total bigint := 0;
begin
  if target_owner is null then
    raise exception 'Learner owner is required' using errcode='22004';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_owner::text, 7919));
  perform pg_catalog.set_config('adaptive_private.deletion_owner', target_owner::text, true);
  set constraints all deferred;

  delete from public.adaptive_concept_projections where owner_id=target_owner;
  get diagnostics deleted_rows = row_count; deleted_total := deleted_total + deleted_rows;
  delete from public.adaptive_review_task_events where owner_id=target_owner;
  get diagnostics deleted_rows = row_count; deleted_total := deleted_total + deleted_rows;
  delete from public.adaptive_review_tasks where owner_id=target_owner;
  get diagnostics deleted_rows = row_count; deleted_total := deleted_total + deleted_rows;
  delete from public.adaptive_interventions where owner_id=target_owner;
  get diagnostics deleted_rows = row_count; deleted_total := deleted_total + deleted_rows;
  delete from public.adaptive_recommendations where owner_id=target_owner;
  get diagnostics deleted_rows = row_count; deleted_total := deleted_total + deleted_rows;
  delete from public.adaptive_answer_evidence where owner_id=target_owner;
  get diagnostics deleted_rows = row_count; deleted_total := deleted_total + deleted_rows;
  delete from public.adaptive_session_events where owner_id=target_owner;
  get diagnostics deleted_rows = row_count; deleted_total := deleted_total + deleted_rows;
  delete from public.adaptive_session_items where owner_id=target_owner;
  get diagnostics deleted_rows = row_count; deleted_total := deleted_total + deleted_rows;
  delete from public.adaptive_sessions where owner_id=target_owner;
  get diagnostics deleted_rows = row_count; deleted_total := deleted_total + deleted_rows;
  delete from adaptive_private.owner_state where owner_id=target_owner;
  get diagnostics deleted_rows = row_count; deleted_total := deleted_total + deleted_rows;

  if exists(
    select 1 from public.adaptive_sessions where owner_id=target_owner
    union all select 1 from public.adaptive_answer_evidence where owner_id=target_owner
    union all select 1 from public.adaptive_recommendations where owner_id=target_owner
    union all select 1 from public.adaptive_interventions where owner_id=target_owner
    union all select 1 from public.adaptive_review_tasks where owner_id=target_owner
    union all select 1 from public.adaptive_concept_projections where owner_id=target_owner
    union all select 1 from adaptive_private.owner_state where owner_id=target_owner
  ) then
    raise exception 'Learner adaptive deletion was incomplete' using errcode='P0001';
  end if;
  return jsonb_build_object('ownerId',target_owner,'deletedRows',deleted_total);
end;
$$;


-- The old broad service-only primitive is no longer callable by the runtime.
revoke execute on function adaptive_private.delete_learner_data(uuid) from service_role;
revoke all on function adaptive_private.erase_owned_graph(uuid) from public,anon,authenticated,service_role;
create function adaptive_private.erase_operation(op uuid) returns void
language plpgsql security definer set search_path='' as $$
declare r adaptive_private.erasure_operations;
begin
  select * into strict r from adaptive_private.erasure_operations where operation_id=op;
  if r.stage='completed' then return; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(r.owner_id::text,7919));
  select * into strict r from adaptive_private.erasure_operations where operation_id=op for update;
  if r.stage not in ('jobs_cancelled','graph_erased') then raise exception 'Cancel and fence jobs first' using errcode='55000'; end if;
  perform adaptive_private.erase_owned_graph(r.owner_id);
  delete from adaptive_private.shadow_enrollments where owner_id=r.owner_id;
  update adaptive_private.erasure_operations set stage='graph_erased',failed_retryable=false,updated_at=clock_timestamp() where operation_id=op;
end $$;

create function adaptive_private.advance_erasure(op uuid, next_stage text) returns void
language plpgsql security definer set search_path='' as $$
declare r adaptive_private.erasure_operations;
begin
  select * into strict r from adaptive_private.erasure_operations where operation_id=op;
  if r.stage='completed' then return; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(r.owner_id::text,7919));
  select * into strict r from adaptive_private.erasure_operations where operation_id=op for update;
  if next_stage=r.stage then return; end if;
  if not ((r.stage='writes_blocked' and next_stage='jobs_cancelled')
    or (r.stage='graph_erased' and next_stage='external_done' and r.reason='account')
    or (r.stage='external_done' and next_stage='auth_deleted' and r.reason='account')
    or (r.stage='auth_deleted' and next_stage='completed' and r.reason='account')
    or (r.stage='graph_erased' and next_stage='completed' and r.reason<>'account')) then
    raise exception 'Invalid deletion transition' using errcode='55000';
  end if;
  if next_stage in ('auth_deleted','completed') and r.reason='account' and exists(select 1 from auth.users where id=r.owner_id) then raise exception 'Auth deletion not verified' using errcode='55000'; end if;
  if next_stage='completed' then
    -- Re-run the scoped graph eraser as a final assertion, without permitting new writes.
    perform adaptive_private.erase_owned_graph(r.owner_id);
    if exists(select 1 from adaptive_private.shadow_enrollments where owner_id=r.owner_id) then raise exception 'Enrollment remains' using errcode='55000'; end if;
  end if;
  update adaptive_private.erasure_operations set stage=next_stage,failed_retryable=false,updated_at=clock_timestamp(),
    owner_id=case when next_stage='completed' then null else owner_id end,
    confirmation_request_id=case when next_stage='completed' then null else confirmation_request_id end where operation_id=op;
end $$;
create function adaptive_private.fail_erasure(op uuid) returns void
language sql security definer set search_path='' as $$
  update adaptive_private.erasure_operations set failed_retryable=true,updated_at=clock_timestamp() where operation_id=op and stage<>'completed'
$$;
-- Scoped session revocation is retryable without retaining a bearer token.
create function adaptive_private.revoke_erasure_sessions(op uuid) returns void
language plpgsql security definer set search_path='' as $$
declare r adaptive_private.erasure_operations;
begin
  select * into strict r from adaptive_private.erasure_operations where operation_id=op;
  if r.reason<>'account' or r.stage<>'graph_erased' then raise exception 'Confirmed account erasure required' using errcode='55000'; end if;
  delete from auth.sessions where user_id=r.owner_id;
end $$;

do $$ declare item text; begin
  foreach item in array array['shadow_authorizations','shadow_enrollments','erasure_operations'] loop
    execute format('alter table adaptive_private.%I enable row level security',item);
    execute format('revoke all on table adaptive_private.%I from public,anon,authenticated,service_role',item);
    execute format('grant select on table adaptive_private.%I to service_role',item);
  end loop;
end $$;
grant insert on adaptive_private.shadow_authorizations to service_role;
revoke all on sequence adaptive_private.shadow_authorizations_event_index_seq from public,anon,authenticated;
grant usage,select on sequence adaptive_private.shadow_authorizations_event_index_seq to service_role;
revoke all on all functions in schema adaptive_private from public,anon,authenticated;
grant execute on function adaptive_private.assert_owner_writable(uuid,uuid),adaptive_private.guard_owner_write(),adaptive_private.shadow_allowed(text,text,text),adaptive_private.check_shadow_authorization(),adaptive_private.enroll_shadow(uuid,timestamptz,uuid),adaptive_private.begin_erasure(uuid,text,uuid),adaptive_private.erase_operation(uuid),adaptive_private.advance_erasure(uuid,text),adaptive_private.fail_erasure(uuid),adaptive_private.revoke_erasure_sessions(uuid) to service_role;
create function adaptive_private.confirm_account_erasure(target uuid, verified_session uuid, token_digest text) returns uuid
language plpgsql security definer set search_path='' as $$
declare request_row record; result uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target::text,7919));
  if not exists(select 1 from auth.sessions where id=verified_session and user_id=target) then raise exception 'Session unavailable' using errcode='42501'; end if;
  execute 'select id,used_at,expires_at from public.account_deletion_requests where user_id=$1 and token_hash=$2 for update' into request_row using target,token_digest;
  if request_row.id is null then raise exception 'Confirmation unavailable' using errcode='42501'; end if;
  if request_row.used_at is not null then
    select operation_id into result from adaptive_private.erasure_operations where owner_id=target and confirmation_request_id=request_row.id;
    if result is null then raise exception 'Confirmation consumed' using errcode='42501'; end if;
    return result;
  end if;
  if request_row.expires_at<=clock_timestamp() then raise exception 'Confirmation expired' using errcode='42501'; end if;
  execute 'update public.account_deletion_requests set used_at=clock_timestamp() where id=$1' using request_row.id;
  return adaptive_private.begin_erasure(target,'account',request_row.id);
end $$;
revoke all on function adaptive_private.confirm_account_erasure(uuid,uuid,text) from public,anon,authenticated;
grant execute on function adaptive_private.confirm_account_erasure(uuid,uuid,text) to service_role;
commit;
