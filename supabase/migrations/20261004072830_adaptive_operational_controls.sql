-- Local Phase 2B-4D rehearsal. No login, enablement, endpoint or production change.
begin;
create table adaptive_private.runtime_control (
 singleton boolean primary key default true check(singleton),
 enabled boolean not null default false,
 epoch bigint not null default 0 check(epoch>=0),
 valid_until timestamptz not null default '-infinity',
 updated_at timestamptz not null default clock_timestamp()
);
insert into adaptive_private.runtime_control(singleton) values(true);
alter table adaptive_private.runtime_control enable row level security;
revoke all on adaptive_private.runtime_control from public,anon,authenticated,service_role,adaptive_ingest,adaptive_worker,adaptive_erasure;
alter table adaptive_private.projection_jobs add column control_epoch bigint not null default 0;

-- All acceptance/publication transactions hold a shared barrier before owner locks.
-- Disable takes its exclusive counterpart: when it returns, earlier writes have
-- committed or rolled back and every old lease is fenced. It never waits on owners.
create function adaptive_private.require_runtime_control() returns bigint
language plpgsql security definer set search_path='' as $$
declare c adaptive_private.runtime_control;
begin
 perform pg_catalog.pg_advisory_xact_lock_shared(7919,4404);
 select * into strict c from adaptive_private.runtime_control where singleton;
 if not c.enabled or c.valid_until<=clock_timestamp() then raise exception 'Runtime disabled' using errcode='55000';end if;
 return c.epoch;
end $$;
create function adaptive_private.read_runtime_control() returns jsonb
language sql security definer set search_path='' as $$
 select jsonb_build_object('enabled',enabled and valid_until>clock_timestamp(),'killSwitch',not(enabled and valid_until>clock_timestamp()),'epoch',epoch,'validUntil',valid_until,'observedAt',clock_timestamp()) from adaptive_private.runtime_control where singleton
$$;
-- Administrative capability only: deliberately granted to no runtime role.
create function adaptive_private.set_runtime_control(allow_run boolean,ttl_seconds integer default 60) returns bigint
language plpgsql security definer set search_path='' as $$
declare result bigint;
begin
 if allow_run is null or ttl_seconds not between 1 and 3600 then raise exception 'Invalid control' using errcode='22023';end if;
 perform pg_catalog.pg_advisory_xact_lock(7919,4404);
 update adaptive_private.runtime_control set enabled=allow_run,epoch=epoch+1,valid_until=case when allow_run then clock_timestamp()+make_interval(secs=>ttl_seconds) else '-infinity'::timestamptz end,updated_at=clock_timestamp() returning epoch into result;
 update adaptive_private.projection_jobs set status=case when attempt>=5 then 'dead_letter' else 'retry' end,lease_until=null,fence=nextval('adaptive_private.job_fence_seq'),reason='disabled',eligible_at=clock_timestamp(),updated_at=clock_timestamp() where status='leased';
 return result;
end $$;

alter function adaptive_private.assert_owner_writable(uuid,uuid) rename to assert_owner_writable_4c;
create function adaptive_private.assert_owner_writable(target uuid,expected_enrollment uuid default null) returns uuid
language plpgsql security invoker set search_path='' as $$
begin
 perform adaptive_private.require_runtime_control();
 return adaptive_private.assert_owner_writable_4c(target,expected_enrollment);
end $$;
alter function adaptive_private.claim_job(uuid) rename to claim_job_4c;
create function adaptive_private.claim_job(target uuid default null) returns setof adaptive_private.projection_jobs
language plpgsql security definer set search_path='' as $$
declare epoch bigint; j adaptive_private.projection_jobs;
begin
 epoch:=adaptive_private.require_runtime_control();
 for j in select * from adaptive_private.claim_job_4c(target) loop
  update adaptive_private.projection_jobs set control_epoch=epoch where job_id=j.job_id returning * into j;
  return next j;
 end loop;
end $$;
alter function adaptive_private.assert_job(uuid,bigint,uuid,uuid,bigint,boolean) rename to assert_job_4c;
create function adaptive_private.assert_job(id uuid,token bigint,target uuid,enrollment uuid,generation bigint,require_generation boolean default true) returns void
language plpgsql security definer set search_path='' as $$
declare epoch bigint;
begin
 epoch:=adaptive_private.require_runtime_control();
 perform adaptive_private.assert_job_4c(id,token,target,enrollment,generation,require_generation);
 if not exists(select 1 from adaptive_private.projection_jobs where job_id=id and control_epoch=epoch) then raise exception 'Control epoch fenced' using errcode='55000';end if;
end $$;
-- The invoker wrapper needs the old owner guard, whose only effect is validation.
-- Old claim/assert entry points are revoked to prevent bypass of the new fence.
revoke all on function adaptive_private.claim_job_4c(uuid),adaptive_private.assert_job_4c(uuid,bigint,uuid,uuid,bigint,boolean) from public,anon,authenticated,service_role,adaptive_ingest,adaptive_worker,adaptive_erasure;
revoke all on function adaptive_private.require_runtime_control(),adaptive_private.read_runtime_control(),adaptive_private.set_runtime_control(boolean,integer),adaptive_private.assert_owner_writable(uuid,uuid),adaptive_private.claim_job(uuid),adaptive_private.assert_job(uuid,bigint,uuid,uuid,bigint,boolean) from public,anon,authenticated,service_role,adaptive_ingest,adaptive_worker,adaptive_erasure;
grant execute on function adaptive_private.require_runtime_control(),adaptive_private.read_runtime_control(),adaptive_private.assert_owner_writable(uuid,uuid) to adaptive_ingest,adaptive_worker,service_role;
grant execute on function adaptive_private.claim_job(uuid),adaptive_private.assert_job(uuid,bigint,uuid,uuid,bigint,boolean) to adaptive_worker,service_role;

-- Aggregate-only operational snapshot. No owner/job IDs or arbitrary labels.
create function adaptive_private.operational_metrics() returns jsonb
language sql security definer set search_path='' as $$
 select jsonb_build_object(
 'queueDepth',(select count(*) from adaptive_private.projection_jobs where status in ('queued','retry')),
 'oldestEligibleMs',(select coalesce(greatest(0,extract(epoch from clock_timestamp()-min(eligible_at))*1000),0)::bigint from adaptive_private.projection_jobs where status in ('queued','retry') and eligible_at<=clock_timestamp()),
 'leases',(select count(*) from adaptive_private.projection_jobs where status='leased' and lease_until>clock_timestamp()),
 'expiredLeases',(select count(*) from adaptive_private.projection_jobs where status='leased' and lease_until<=clock_timestamp()),
 'retryDepth',(select count(*) from adaptive_private.projection_jobs where status='retry'),
 'deadLetters',(select count(*) from adaptive_private.projection_jobs where status='dead_letter'),
 'quarantined',(select count(*) from adaptive_private.projection_jobs where status='quarantined'),
 'incompleteErasures',(select count(*) from adaptive_private.erasure_operations where stage<>'completed'),
 'oldestErasureMs',(select coalesce(greatest(0,extract(epoch from clock_timestamp()-min(created_at))*1000),0)::bigint from adaptive_private.erasure_operations where stage<>'completed'),
 'expiryBacklog',(select count(*) from adaptive_private.shadow_enrollments where expires_at<=clock_timestamp()),
 'retentionBacklog',(select count(*) from adaptive_private.runtime_receipts where created_at<clock_timestamp()-interval '14 days'),
 'dbConnections',(select count(*) from pg_stat_activity where datname=current_database()),
 'leaseRecoveries',(select coalesce(sum(count),0) from adaptive_private.runtime_receipts where event='lease_recovery' and created_at>clock_timestamp()-interval '5 minutes'),
 'generationConflicts',(select coalesce(sum(count),0) from adaptive_private.runtime_receipts where event='generation_conflict' and created_at>clock_timestamp()-interval '5 minutes'))
$$;
revoke all on function adaptive_private.operational_metrics() from public,anon,authenticated,service_role,adaptive_ingest,adaptive_erasure;
grant execute on function adaptive_private.operational_metrics() to adaptive_worker;
commit;
