-- Read-only metadata for the existing rolling quota. Limits and charging stay unchanged.
create or replace function public.practice_access_status(p_user_id uuid,p_guest_key text default null) returns jsonb
language sql security invoker set search_path='' as $$
 with flags as (
   select case when p_user_id is null then false else public.practice_is_pro(p_user_id) end as pro
 ), allocations as materialized (
   select count,created_at from mcq_engine.access_allocations
   where owner_key=coalesce(p_user_id::text,p_guest_key)
     and (p_user_id is null or created_at>now()-interval '12 hours')
 ), usage as (
   select coalesce(sum(count),0)::int used,min(created_at)+interval '12 hours' reset_at from allocations
 ), releases as (
   select created_at+interval '12 hours' as release_at,sum(count)::int questions
   from allocations,flags where p_user_id is not null and not pro group by created_at
 )
 select jsonb_build_object(
   'isPro',pro,'limit',case when p_user_id is null then 10 else 50 end,
   'remaining',case when pro then null else greatest(0,(case when p_user_id is null then 10 else 50 end)-used) end,
   'used',used,'resetAt',case when p_user_id is null then null else reset_at end,
   'maxSetSize',case when pro then 90 when p_user_id is null then 10 else 30 end,
   'passExpiresAt',(select pro_pass_expires_at from public.profiles where id=p_user_id),
   'asOf',now(),'windowHours',case when p_user_id is null then null else 12 end,
   'releases',coalesce((select jsonb_agg(jsonb_build_object('at',release_at,'questions',questions) order by release_at) from releases),'[]'::jsonb)
 ) from flags,usage;
$$;
revoke all on function public.practice_access_status(uuid,text) from public,anon,authenticated;
grant execute on function public.practice_access_status(uuid,text) to service_role;
