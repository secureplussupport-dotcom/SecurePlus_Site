-- Optional, descriptive pacing on existing private answer events. No scoring/selection changes.
create function public.mcq_engine_answer_paced(p_user_id uuid,p_event_id uuid,p_session_id uuid,p_question_id text,p_option_id uuid,p_standalone jsonb,p_elapsed_ms integer) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare result jsonb; seen boolean;
begin
  if p_elapsed_ms is null or p_elapsed_ms < 0 or p_elapsed_ms > 86400000 then
    raise exception 'Invalid question pacing' using errcode='22023';
  end if;
  insert into mcq_engine.owners(user_id) values(p_user_id) on conflict do nothing;
  perform 1 from mcq_engine.owners where user_id=p_user_id for update;
  select exists(select 1 from mcq_engine.history where user_id=p_user_id and
    (event_id=p_event_id or (p_session_id is not null and session_id=p_session_id and question_id=p_question_id))) into seen;
  result:=public.mcq_engine_answer(p_user_id,p_event_id,p_session_id,p_question_id,p_option_id,p_standalone);
  if not seen then
    result:=result || jsonb_build_object('elapsed_ms',p_elapsed_ms);
    update mcq_engine.history set response=result where user_id=p_user_id and event_id=p_event_id;
  end if;
  return result;
end;
$$;
revoke all on function public.mcq_engine_answer_paced(uuid,uuid,uuid,text,uuid,jsonb,integer) from public,anon,authenticated;
grant execute on function public.mcq_engine_answer_paced(uuid,uuid,uuid,text,uuid,jsonb,integer) to service_role;
