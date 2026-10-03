-- Phase 2B-4B: additive, unseeded, local review only. No login/password provisioned.
begin;
create role adaptive_ingest nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create role adaptive_worker nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create role adaptive_erasure nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
grant usage on schema public,adaptive_private to adaptive_ingest,adaptive_worker,adaptive_erasure;

create table adaptive_private.projection_jobs (
  job_id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  enrollment_id uuid not null,
  evidence_generation bigint not null check(evidence_generation>=0),
  mapping_version text not null,
  algorithm_version text not null,
  configuration_version text not null,
  status text not null default 'queued' check(status in ('queued','leased','retry','completed','quarantined','dead_letter','parked')),
  attempt integer not null default 0 check(attempt between 0 and 5),
  eligible_at timestamptz not null default clock_timestamp(),
  lease_until timestamptz,
  fence bigint not null default 0,
  jitter_ms integer not null default 0 check(jitter_ms between 0 and 500),
  reason text not null default 'ok' check(reason in ('ok','retryable','generation_changed','chronology_conflict','poison_job','lease_expired','disabled','authorization_revoked')),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  unique(owner_id,enrollment_id,evidence_generation,mapping_version,algorithm_version,configuration_version),
  foreign key(mapping_version,algorithm_version,configuration_version) references public.adaptive_version_sets(mapping_version,algorithm_version,configuration_version),
  check((status='leased')=(lease_until is not null))
);
create index projection_jobs_versions on adaptive_private.projection_jobs(mapping_version,algorithm_version,configuration_version);
create index projection_jobs_runnable on adaptive_private.projection_jobs(eligible_at,created_at) where status in ('queued','retry','leased');
create unique index projection_jobs_owner_lease on adaptive_private.projection_jobs(owner_id) where status='leased';
create sequence adaptive_private.job_fence_seq;
alter table adaptive_private.projection_jobs enable row level security;
revoke all on adaptive_private.projection_jobs from public,anon,authenticated,service_role;
revoke all on sequence adaptive_private.job_fence_seq from public,anon,authenticated,service_role;

-- Privacy-safe aggregate receipts; no owner, job, generation or payload field.
create table adaptive_private.runtime_receipts (
 incident_id uuid primary key default gen_random_uuid(),
 event text not null check(event in ('enqueue','deduplicated','claim','lease_recovery','acknowledge','retry','quarantine','dead_letter','park','cancellation','generation_conflict')),
 count integer not null check(count between 0 and 1000000),
 created_at timestamptz not null default clock_timestamp()
);
create index runtime_receipt_retention on adaptive_private.runtime_receipts(created_at);
alter table adaptive_private.runtime_receipts enable row level security;
revoke all on adaptive_private.runtime_receipts from public,anon,authenticated,service_role;
create function adaptive_private.record_runtime_receipt(code text,n integer default 1) returns void
language sql security definer set search_path='' as $$
 insert into adaptive_private.runtime_receipts(event,count) values(code,least(n,1000000))
$$;
revoke all on function adaptive_private.record_runtime_receipt(text,integer) from public,anon,authenticated,service_role;
create function adaptive_private.runtime_metrics() returns table(event text,count bigint)
language plpgsql security definer set search_path='' as $$
begin
 delete from adaptive_private.runtime_receipts where incident_id in (select incident_id from adaptive_private.runtime_receipts where created_at<clock_timestamp()-interval '14 days' order by created_at limit 1000);
 return query select r.event,sum(r.count)::bigint from adaptive_private.runtime_receipts r where created_at>=clock_timestamp()-interval '14 days' group by r.event;
end $$;
revoke all on function adaptive_private.runtime_metrics() from public,anon,authenticated,service_role;
grant execute on function adaptive_private.runtime_metrics() to adaptive_worker;

-- No queue caller can choose a generation or version absent from owned history.
create function adaptive_private.enqueue_owner(target uuid) returns table(job_id uuid,deduplicated boolean)
language plpgsql security definer set search_path='' as $$
declare enrollment uuid; generation bigint; v record; inserted uuid;
begin
 enrollment:=adaptive_private.assert_owner_writable(target);
 select evidence_generation into generation from adaptive_private.owner_state where owner_id=target;
 if generation is null then return; end if;
 for v in select distinct s.mapping_version,s.algorithm_version,s.configuration_version from public.adaptive_sessions s where s.owner_id=target loop
  if not adaptive_private.shadow_allowed(v.mapping_version,v.algorithm_version,v.configuration_version) then continue; end if;
  inserted:=null;
  insert into adaptive_private.projection_jobs(owner_id,enrollment_id,evidence_generation,mapping_version,algorithm_version,configuration_version)
   values(target,enrollment,generation,v.mapping_version,v.algorithm_version,v.configuration_version)
   on conflict(owner_id,enrollment_id,evidence_generation,mapping_version,algorithm_version,configuration_version) do nothing
   returning projection_jobs.job_id into inserted;
  if inserted is not null then job_id:=inserted;deduplicated:=false;
  else select j.job_id into job_id from adaptive_private.projection_jobs j where j.owner_id=target and j.enrollment_id=enrollment and j.evidence_generation=generation and j.mapping_version=v.mapping_version and j.algorithm_version=v.algorithm_version and j.configuration_version=v.configuration_version;deduplicated:=true;end if;
  perform adaptive_private.record_runtime_receipt(case when deduplicated then 'deduplicated' else 'enqueue' end);
  return next;
 end loop;
end $$;
create function adaptive_private.enqueue_generation() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' or new.evidence_generation<>old.evidence_generation then perform adaptive_private.enqueue_owner(new.owner_id);end if;
 return null;
end $$;
create trigger adaptive_generation_queue after insert or update of evidence_generation on adaptive_private.owner_state for each row execute function adaptive_private.enqueue_generation();
-- This scoped trigger can invalidate caches without giving ingestion projection writes.
create or replace function adaptive_private.invalidate_projections() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 perform adaptive_private.assert_owner_writable(new.owner_id);
 insert into adaptive_private.owner_state(owner_id,evidence_generation) values(new.owner_id,1)
 on conflict(owner_id) do update set evidence_generation=adaptive_private.owner_state.evidence_generation+1,replay_status='idle',quarantine_reasons='{}';
 update public.adaptive_concept_projections set projection_status='stale' where owner_id=new.owner_id;
 return null;
end $$;
create trigger adaptive_session_event_replay after insert on public.adaptive_session_events for each row execute function adaptive_private.invalidate_projections();
create trigger adaptive_task_replay after insert on public.adaptive_review_tasks for each row execute function adaptive_private.invalidate_projections();
create trigger adaptive_task_event_replay after insert on public.adaptive_review_task_events for each row execute function adaptive_private.invalidate_projections();

-- Candidates are read without row locks. Try owner first, then try the global
-- claim mutex; neither wait can invert erasure's owner -> job ordering.
create function adaptive_private.claim_job(target uuid default null) returns setof adaptive_private.projection_jobs
language plpgsql security definer set search_path='' as $$
declare candidate record; j adaptive_private.projection_jobs; enrollment uuid;
begin
 if target is not null then perform adaptive_private.assert_owner_writable(target);end if;
 for candidate in select * from (
  select distinct on (queued.owner_id) queued.job_id,queued.owner_id,queued.eligible_at,queued.created_at
  from adaptive_private.projection_jobs queued join adaptive_private.shadow_enrollments e on e.owner_id=queued.owner_id and e.enrollment_id=queued.enrollment_id
  where (target is null or queued.owner_id=target) and e.expires_at>clock_timestamp()
    and not exists(select 1 from adaptive_private.erasure_operations x where x.owner_id=queued.owner_id)
    and ((queued.status in ('queued','retry') and queued.eligible_at<=clock_timestamp()) or (queued.status='leased' and queued.lease_until<=clock_timestamp()))
  order by queued.owner_id,queued.evidence_generation desc,queued.created_at,queued.job_id
 ) candidates order by eligible_at,created_at,job_id limit 100 loop
  if not pg_catalog.pg_try_advisory_xact_lock(pg_catalog.hashtextextended(candidate.owner_id::text,7919)) then continue;end if;
  if not pg_catalog.pg_try_advisory_xact_lock(7919,4402) then return;end if;
  if exists(select 1 from adaptive_private.erasure_operations where owner_id=candidate.owner_id) then continue;end if;
  select enrollment_id into enrollment from adaptive_private.shadow_enrollments where owner_id=candidate.owner_id and expires_at>clock_timestamp();
  if enrollment is null then continue;end if;
  -- Recover expired owner leases before the partial unique-index claim.
  update adaptive_private.projection_jobs set status=case when attempt>=5 then 'dead_letter' else 'retry' end,
   lease_until=null,fence=nextval('adaptive_private.job_fence_seq'::regclass),reason='lease_expired',updated_at=clock_timestamp()
   where owner_id=candidate.owner_id and status='leased' and lease_until<=clock_timestamp();
  if found then perform adaptive_private.record_runtime_receipt('lease_recovery');end if;
  update adaptive_private.projection_jobs set status='parked',reason='generation_changed',updated_at=clock_timestamp()
   where owner_id=candidate.owner_id and status in ('queued','retry') and evidence_generation<>(select evidence_generation from adaptive_private.owner_state where owner_id=candidate.owner_id);
  if found then perform adaptive_private.record_runtime_receipt('generation_conflict');end if;
  select * into j from adaptive_private.projection_jobs where job_id=candidate.job_id for update;
  if not found or j.status not in ('queued','retry') or j.eligible_at>clock_timestamp() then continue;end if;
  if j.enrollment_id<>enrollment or not adaptive_private.shadow_allowed(j.mapping_version,j.algorithm_version,j.configuration_version) then
   update adaptive_private.projection_jobs set status='parked',reason='authorization_revoked',updated_at=clock_timestamp() where job_id=j.job_id;continue;
  end if;
  if j.evidence_generation<>(select evidence_generation from adaptive_private.owner_state where owner_id=j.owner_id) then
   update adaptive_private.projection_jobs set status='parked',reason='generation_changed',updated_at=clock_timestamp() where job_id=j.job_id;perform adaptive_private.record_runtime_receipt('generation_conflict');continue;
  end if;
  if exists(select 1 from adaptive_private.projection_jobs where owner_id=j.owner_id and status='leased') then continue;end if;
  if (select count(*) from adaptive_private.projection_jobs where status='leased' and lease_until>clock_timestamp())>=2 then return;end if;
  update adaptive_private.projection_jobs set status='leased',attempt=attempt+1,lease_until=clock_timestamp()+interval '30 seconds',fence=nextval('adaptive_private.job_fence_seq'::regclass),updated_at=clock_timestamp()
   where job_id=j.job_id and attempt<5 returning * into j;
  if found then perform adaptive_private.record_runtime_receipt('claim');return next j;return;end if;
 end loop;
end $$;

create function adaptive_private.assert_job(id uuid, token bigint, target uuid, enrollment uuid, generation bigint, require_generation boolean default true) returns void
language plpgsql security definer set search_path='' as $$
declare j adaptive_private.projection_jobs;
begin
 perform adaptive_private.assert_owner_writable(target,enrollment);
 select * into j from adaptive_private.projection_jobs where job_id=id and owner_id=target for update;
 if id is null or token is null or enrollment is null or generation is null or not found or j.status<>'leased' or j.fence<>token or j.enrollment_id<>enrollment or j.evidence_generation<>generation or j.lease_until<=clock_timestamp() then raise exception 'Job lease fenced' using errcode='55000';end if;
 if not adaptive_private.shadow_allowed(j.mapping_version,j.algorithm_version,j.configuration_version) then raise exception 'Shadow authorization revoked' using errcode='55000';end if;
 if require_generation and j.evidence_generation<>(select evidence_generation from adaptive_private.owner_state where owner_id=target) then raise exception 'Generation changed' using errcode='40001';end if;
end $$;
create function adaptive_private.finish_job(id uuid,token bigint,target uuid,enrollment uuid,generation bigint,outcome text,why text default 'ok') returns void
language plpgsql security definer set search_path='' as $$
declare attempts integer; delay_ms integer;
begin
 if outcome not in ('completed','retry','release','quarantined','dead_letter','parked') or why not in ('ok','retryable','generation_changed','chronology_conflict','poison_job','disabled') then raise exception 'Invalid job outcome' using errcode='22023';end if;
 perform adaptive_private.assert_job(id,token,target,enrollment,generation,outcome='completed');
 select attempt into attempts from adaptive_private.projection_jobs where job_id=id;
 delay_ms:=floor(random()*501)::integer;
 update adaptive_private.projection_jobs set status=case when outcome in ('retry','release') and attempts>=5 then 'dead_letter' when outcome='release' then 'retry' else outcome end,
  reason=why,lease_until=null,fence=nextval('adaptive_private.job_fence_seq'::regclass),jitter_ms=delay_ms,
  eligible_at=case when outcome in ('retry','release') then clock_timestamp()+make_interval(secs=>power(2,attempts)+delay_ms/1000.0) else eligible_at end,updated_at=clock_timestamp() where job_id=id;
 perform adaptive_private.record_runtime_receipt(case when outcome='completed' then 'acknowledge' when outcome='quarantined' then 'quarantine' when outcome='parked' then 'park' when outcome in ('retry','release') then case when attempts>=5 then 'dead_letter' else 'retry' end else outcome end);
end $$;
create function adaptive_private.cancel_owner_jobs(target uuid) returns bigint
language plpgsql security definer set search_path='' as $$
declare n bigint;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target::text,7919));
 if not exists(select 1 from adaptive_private.erasure_operations where owner_id=target) then raise exception 'Erasure block required' using errcode='42501';end if;
 delete from adaptive_private.projection_jobs where owner_id=target;get diagnostics n=row_count;perform adaptive_private.record_runtime_receipt('cancellation',least(n,1000000)::integer);return n;
end $$;
create function adaptive_private.remaining_owner_jobs(target uuid) returns bigint
language sql security definer set search_path='' as $$ select count(*) from adaptive_private.projection_jobs where owner_id=target $$;
-- DB-level completion check cannot be bypassed by a no-op cancellation adapter.
create function adaptive_private.require_erased_jobs() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.stage in ('jobs_cancelled','graph_erased','completed') and exists(select 1 from adaptive_private.projection_jobs where owner_id=old.owner_id) then raise exception 'Owned jobs remain' using errcode='55000';end if;
 return new;
end $$;
create trigger adaptive_erasure_jobs before update on adaptive_private.erasure_operations for each row execute function adaptive_private.require_erased_jobs();
-- Even a direct worker-role projection write requires a live matching lease.
create function adaptive_private.guard_worker_publication() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if current_user='adaptive_worker' then
  perform adaptive_private.assert_job(nullif(current_setting('adaptive.job_id',true),'')::uuid,nullif(current_setting('adaptive.job_fence',true),'')::bigint,new.owner_id,
   nullif(current_setting('adaptive.enrollment_id',true),'')::uuid,new.input_generation);
  if not exists(select 1 from adaptive_private.projection_jobs where job_id=nullif(current_setting('adaptive.job_id',true),'')::uuid
    and mapping_version=new.mapping_version and algorithm_version=new.algorithm_version and configuration_version=new.configuration_version) then raise exception 'Job version mismatch' using errcode='55000';end if;
 end if;
 return new;
end $$;
create trigger ab_adaptive_worker_fence before insert or update on public.adaptive_concept_projections for each row execute function adaptive_private.guard_worker_publication();

-- Every worker-owned output/state mutation is fenced, not only cache rows.
create function adaptive_private.guard_worker_output() returns trigger
language plpgsql security invoker set search_path='' as $$
declare j adaptive_private.projection_jobs; row_data jsonb:=to_jsonb(new);
begin
 if current_user='adaptive_worker' then
  select * into j from adaptive_private.projection_jobs where job_id=nullif(current_setting('adaptive.job_id',true),'')::uuid;
  perform adaptive_private.assert_job(j.job_id,nullif(current_setting('adaptive.job_fence',true),'')::bigint,new.owner_id,j.enrollment_id,j.evidence_generation);
  if row_data ? 'mapping_version' and row(row_data->>'mapping_version',row_data->>'algorithm_version',row_data->>'configuration_version') is distinct from row(j.mapping_version,j.algorithm_version,j.configuration_version) then raise exception 'Job version mismatch' using errcode='55000';end if;
 end if;
 return new;
end $$;
create trigger ab_adaptive_worker_fence before insert or update on adaptive_private.owner_state for each row execute function adaptive_private.guard_worker_output();
do $$ declare item text;begin
 foreach item in array array['adaptive_recommendations','adaptive_review_tasks','adaptive_review_task_events'] loop
  execute format('create trigger ab_adaptive_worker_fence before insert or update on public.%I for each row execute function adaptive_private.guard_worker_output()',item);
 end loop;
end $$;

-- Purpose roles are RLS-bound (not BYPASSRLS); no role can approve a catalogue.
do $$ declare r record;begin
 for r in select tablename from pg_tables where schemaname='public' and tablename like 'adaptive_%' loop
  execute format('grant select on public.%I to adaptive_ingest,adaptive_worker',r.tablename);
  execute format('create policy adaptive_runtime_read on public.%I for select to adaptive_ingest,adaptive_worker using(true)',r.tablename);
 end loop;
 for r in select unnest(array['adaptive_sessions','adaptive_session_items','adaptive_session_events','adaptive_answer_evidence','adaptive_interventions']) as name loop
  execute format('grant insert on public.%I to adaptive_ingest',r.name);
  execute format('create policy adaptive_ingest_append on public.%I for insert to adaptive_ingest with check(true)',r.name);
 end loop;
 for r in select unnest(array['adaptive_recommendations','adaptive_review_tasks','adaptive_review_task_events','adaptive_concept_projections']) as name loop
  execute format('grant insert on public.%I to adaptive_worker',r.name);
  execute format('create policy adaptive_worker_append on public.%I for insert to adaptive_worker with check(true)',r.name);
 end loop;
end $$;
grant update on public.adaptive_concept_projections to adaptive_worker;
create policy adaptive_worker_update on public.adaptive_concept_projections for update to adaptive_worker using(true) with check(true);
grant select on adaptive_private.owner_state to adaptive_ingest,adaptive_worker;
grant insert(owner_id,last_set_index) on adaptive_private.owner_state to adaptive_ingest;
grant insert(owner_id) on adaptive_private.owner_state to adaptive_worker;
grant update(last_set_index) on adaptive_private.owner_state to adaptive_ingest;
grant update(complete_evidence_from,replay_status,quarantine_reasons,last_replay_at,last_replay_sha256) on adaptive_private.owner_state to adaptive_worker;
create policy adaptive_owner_read on adaptive_private.owner_state for select to adaptive_ingest,adaptive_worker using(true);
create policy adaptive_owner_insert on adaptive_private.owner_state for insert to adaptive_ingest,adaptive_worker with check(true);
create policy adaptive_owner_update on adaptive_private.owner_state for update to adaptive_ingest,adaptive_worker using(true) with check(true);
grant select on adaptive_private.grading_keys to adaptive_ingest;
create policy adaptive_ingest_keys on adaptive_private.grading_keys for select to adaptive_ingest using(true);
grant select on adaptive_private.version_payloads to adaptive_worker;
create policy adaptive_worker_payloads on adaptive_private.version_payloads for select to adaptive_worker using(true);
-- Eligibility helpers reveal only a boolean/enrollment fence, not consent or
-- erasure records. Their existing empty search paths are preserved.
alter function adaptive_private.shadow_allowed(text,text,text) security definer;
alter function adaptive_private.assert_owner_writable(uuid,uuid) security definer;
revoke select on public.adaptive_concept_projections from adaptive_ingest;
grant select on adaptive_private.erasure_operations,adaptive_private.shadow_enrollments to adaptive_erasure;
create policy adaptive_erasure_read on adaptive_private.erasure_operations for select to adaptive_erasure using(true);
create policy adaptive_erasure_enrollment_read on adaptive_private.shadow_enrollments for select to adaptive_erasure using(true);
grant select on adaptive_private.projection_jobs to adaptive_worker;
create policy adaptive_worker_jobs on adaptive_private.projection_jobs for select to adaptive_worker using(true);
grant usage on sequence public.adaptive_answer_evidence_receipt_index_seq to adaptive_ingest;
-- Invoker helpers and trigger functions needed by the existing transactional writers.
grant execute on function adaptive_private.assert_owner_writable(uuid,uuid),adaptive_private.shadow_allowed(text,text,text) to adaptive_ingest,adaptive_worker;
-- Trigger functions cannot be invoked as ordinary functions. Grants are explicit.
do $$ declare r record;begin
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='adaptive_private' and p.prorettype='trigger'::regtype loop
  execute format('grant execute on function %s to adaptive_ingest,adaptive_worker',r.signature);
 end loop;
end $$;
grant execute on function adaptive_private.enqueue_owner(uuid) to adaptive_ingest,adaptive_worker,service_role;
grant execute on function adaptive_private.claim_job(uuid),adaptive_private.assert_job(uuid,bigint,uuid,uuid,bigint,boolean),adaptive_private.finish_job(uuid,bigint,uuid,uuid,bigint,text,text) to adaptive_worker,service_role;
grant execute on function adaptive_private.cancel_owner_jobs(uuid),adaptive_private.remaining_owner_jobs(uuid) to adaptive_erasure,service_role;
grant execute on function adaptive_private.begin_erasure(uuid,text,uuid),adaptive_private.confirm_account_erasure(uuid,uuid,text),adaptive_private.erase_operation(uuid),adaptive_private.advance_erasure(uuid,text),adaptive_private.fail_erasure(uuid),adaptive_private.revoke_erasure_sessions(uuid) to adaptive_erasure;
revoke all on all functions in schema adaptive_private from public,anon,authenticated;
-- Existing service-role fixtures remain supported; the runtime adapter refuses it.
grant execute on function adaptive_private.guard_worker_publication() to service_role;
create table adaptive_private.scheduler_nonces (
 nonce_sha256 text primary key check(nonce_sha256 ~ '^[0-9a-f]{64}$'), expires_at timestamptz not null
);
create index scheduler_nonce_expiry on adaptive_private.scheduler_nonces(expires_at);
alter table adaptive_private.scheduler_nonces enable row level security;
revoke all on adaptive_private.scheduler_nonces from public,anon,authenticated,service_role;
create function adaptive_private.consume_scheduler_nonce(digest text,expiry timestamptz) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if expiry<=clock_timestamp() or expiry>clock_timestamp()+interval '60 seconds' or digest !~ '^[0-9a-f]{64}$' then return false;end if;
 perform pg_catalog.pg_advisory_xact_lock(7919,4403);
 delete from adaptive_private.scheduler_nonces where expires_at<=clock_timestamp();
 if (select count(*) from adaptive_private.scheduler_nonces)>=120 then return false;end if;
 insert into adaptive_private.scheduler_nonces values(digest,expiry) on conflict do nothing;
 return found;
end $$;
revoke all on function adaptive_private.consume_scheduler_nonce(text,timestamptz) from public,anon,authenticated;
grant execute on function adaptive_private.consume_scheduler_nonce(text,timestamptz) to adaptive_worker;
commit;
