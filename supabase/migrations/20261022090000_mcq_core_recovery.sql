-- Update only unanswered slots; answer snapshots, grades and session size remain intact.
create function public.mcq_engine_recover_session(p_user_id uuid,p_session_id uuid,p_version bigint,p_questions jsonb) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare previous jsonb; current_version bigint; q jsonb; answer record;
begin
  select version into current_version from mcq_engine.owners where user_id=p_user_id for update;
  if current_version is null or current_version<>p_version then return false; end if;
  select questions into previous from mcq_engine.sessions where id=p_session_id and user_id=p_user_id for update;
  if previous is null then return false; end if;
  if jsonb_typeof(p_questions) is distinct from 'array' or jsonb_array_length(p_questions)<>jsonb_array_length(previous) then
    raise exception 'Invalid recovery set size' using errcode='22023';
  end if;
  if (select count(distinct item->>'id') from jsonb_array_elements(p_questions) item)<>jsonb_array_length(previous) then
    raise exception 'Duplicate recovery question' using errcode='22023';
  end if;
  for answer in select h.question_id from mcq_engine.history h where h.user_id=p_user_id and h.session_id=p_session_id loop
    if exists(select 1 from jsonb_array_elements(previous) with ordinality old(q,i)
      where old.q->>'id'=answer.question_id and old.q is distinct from p_questions->(old.i::integer-1)) then
      raise exception 'Answered question is immutable' using errcode='22023';
    end if;
  end loop;
  for q in select * from jsonb_array_elements(p_questions) loop
    if q->>'format' is distinct from 'mcq' or nullif(q->>'id','') is null then
      raise exception 'MCQs only' using errcode='22023';
    end if;
    insert into mcq_engine.questions(id,payload) values(q->>'id',q) on conflict(id) do nothing;
  end loop;
  if previous is distinct from p_questions then
    update mcq_engine.sessions set questions=p_questions where id=p_session_id and user_id=p_user_id;
    update mcq_engine.owners set version=version+1 where user_id=p_user_id;
  end if;
  return true;
end;
$$;
revoke all on function public.mcq_engine_recover_session(uuid,uuid,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.mcq_engine_recover_session(uuid,uuid,bigint,jsonb) to service_role;
