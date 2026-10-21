-- Read-only result evidence. Preserve existing scores, scheduling and service-only access.
-- Only the latest two concept answers are needed; the streak is capped at two.
create index if not exists mcq_history_owner_concept on mcq_engine.history(user_id,concept_tag,created_at desc,event_id desc);

create or replace function public.mcq_engine_state(p_user_id uuid) returns jsonb
language sql security invoker set search_path = '' as $$
  select jsonb_build_object(
    'version', coalesce((select version from mcq_engine.owners where user_id=p_user_id),0),
    'mastery', coalesce((select jsonb_agg(jsonb_build_object('concept_tag',concept_tag,'score',score)) from mcq_engine.mastery where user_id=p_user_id),'[]'::jsonb),
    'failed', coalesce((select jsonb_agg(jsonb_build_object('question_id',question_id,'cooldown_counter',cooldown_counter,'created_at',created_at)) from mcq_engine.failed_buffer where user_id=p_user_id),'[]'::jsonb),
    'concept_streaks', coalesce((
      select jsonb_agg(jsonb_build_object('concept_tag',concept_tag,'wrong_streak',wrong_streak))
      from (
        select concept_tag, case when (array_agg(is_correct order by recency))[1] then 0
          else count(*) filter (where not is_correct) end as wrong_streak
        from (
          select concept_tag,is_correct,row_number() over (
            partition by concept_tag order by created_at desc,event_id desc
          ) as recency
          from mcq_engine.history where user_id=p_user_id and concept_tag is not null
        ) recent where recency<=2 group by concept_tag
      ) streaks
    ),'[]'::jsonb),
    'history', coalesce((select jsonb_agg(to_jsonb(h)) from (select question_id,max(created_at) as last_seen_at from mcq_engine.history where user_id=p_user_id group by question_id) h),'[]'::jsonb)
  );
$$;

revoke all on function public.mcq_engine_state(uuid) from public, anon, authenticated;
grant execute on function public.mcq_engine_state(uuid) to service_role;
