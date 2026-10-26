-- Preserve existing claimed previews, permissions and legacy grading. No user data is rewritten.
create or replace function public.guest_diagnostic_import(p_user_id uuid,p_guest_key text,p_request_id uuid,p_answers jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare run mcq_engine.guest_diagnostics; q jsonb; opt uuid; event uuid; result jsonb; rows jsonb:='[]'; stamp timestamptz; i int:=0; answer jsonb; skipped boolean; preview boolean;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,43));
 select * into run from mcq_engine.guest_diagnostics where id=p_request_id for update;
 if not found or run.owner_key<>p_guest_key or run.created_at<now()-interval '7 days' then raise exception 'Diagnostic expired or unavailable' using errcode='22023';end if;
 if run.imported_user is not null then
  if run.imported_user<>p_user_id or run.imported_answers<>p_answers then raise exception 'Diagnostic already claimed' using errcode='22023';end if;
  return run.response;
 end if;
 if exists(select 1 from mcq_engine.guest_diagnostics where imported_user=p_user_id) then
  return jsonb_build_object('attempts','[]'::jsonb,'alreadyImported',true);
 end if;
 if jsonb_typeof(p_answers)<>'array' or jsonb_array_length(p_answers)<>10 or
 (select count(distinct a->>'question_id') from jsonb_array_elements(p_answers) a)<>10 then raise exception 'Complete all ten answers' using errcode='22023';end if;
 -- Every answer is checked against the owned server snapshot before mutation.
 for q in select value from jsonb_array_elements(run.questions) loop
  select a into answer from jsonb_array_elements(p_answers) a where a->>'question_id'=q->>'id';
  if answer is null or (answer->>'skipped' is not null and jsonb_typeof(answer->'skipped')<>'boolean') then raise exception 'Invalid answer' using errcode='22023';end if;
  skipped:=coalesce((answer->>'skipped')::boolean,false);
  opt:=(answer->>'selected_option_id')::uuid;
  if skipped then
   if opt is not null then raise exception 'Skipped answers cannot select an option' using errcode='22023';end if;
  elsif opt is null or not exists(select 1 from jsonb_array_elements(q->'options') o where o->>'id'=opt::text) then
   raise exception 'Invalid option' using errcode='22023';
  end if;
 end loop;
 preview:=not exists(select 1 from jsonb_array_elements(run.questions) item where item->>'diagnostic_only' is distinct from 'true');

 for q in select value from jsonb_array_elements(run.questions) loop
  select a into answer from jsonb_array_elements(p_answers) a where a->>'question_id'=q->>'id';
  -- New previews create learning priorities, never graded history or retest IDs.
  if preview or coalesce((answer->>'skipped')::boolean,false) then continue;end if;
  opt:=(answer->>'selected_option_id')::uuid;
  event:=md5(p_request_id::text||':'||(q->>'id'))::uuid;
  result:=public.mcq_engine_answer_sourced(p_user_id,event,null,q->>'id',opt,q,null,'diagnostic');
  stamp:=now()+i*interval '1 millisecond';i:=i+1;
  -- Preserve answer order for streak replay (all imports share a transaction).
  update mcq_engine.history set created_at=stamp,response=response||'{"guest_diagnostic":true}'::jsonb where event_id=event and user_id=p_user_id;
  insert into public.attempts(id,user_id,question_id,question_type,title,domain,chapter,correct,created_at)
  values(event,p_user_id,q->>'id','mcq',q->>'prompt',q->>'domain',q->>'chapter',(result->>'is_correct')::boolean,stamp);
  rows:=rows||jsonb_build_array(jsonb_build_object('qid',q->>'id','correct',result->'is_correct','title',q->>'prompt','ch',q->>'chapter','conceptTag',q->>'concept_tag','mcq',true,'readinessSource','diagnostic','createdAt',stamp));
 end loop;
 if preview then
  insert into mcq_engine.owners(user_id) values(p_user_id) on conflict do nothing;
  update mcq_engine.owners set version=version+1 where user_id=p_user_id;
 end if;
 result:=jsonb_build_object('attempts',rows,'imported',true,'preview',preview);
 update mcq_engine.guest_diagnostics set imported_user=p_user_id,imported_answers=p_answers,response=result where id=p_request_id;
 return result;
end;
$$;

-- A skipped or unfamiliar preview topic is a learning interest, not an incorrect attempt.
create or replace function public.guest_diagnostic_focus(p_user_id uuid) returns jsonb
language sql stable security invoker set search_path='' as $$
 with candidates as (
  select h.concept_tag,h.created_at from mcq_engine.history h
  where h.user_id=p_user_id and h.response->>'guest_diagnostic'='true' and not h.is_correct
  union all
  select q->>'concept_tag',r.created_at from mcq_engine.guest_diagnostics r
  cross join lateral jsonb_array_elements(r.questions) q
  cross join lateral jsonb_array_elements(r.imported_answers) a
  where r.imported_user=p_user_id and a->>'question_id'=q->>'id'
  and (a->>'skipped'='true' or exists(select 1 from jsonb_array_elements(q->'options') o
    where o->>'id'=a->>'selected_option_id' and o->>'is_correct'='false'))
 )
 select coalesce(jsonb_agg(concept_tag order by concept_tag),'[]'::jsonb) from (
  select distinct c.concept_tag from candidates c where c.concept_tag is not null
  and not exists(select 1 from mcq_engine.history later where later.user_id=p_user_id
   and later.concept_tag=c.concept_tag and later.is_correct and later.created_at>c.created_at)
 ) priorities;
$$;
create or replace function public.mcq_engine_state(p_user_id uuid) returns jsonb
language sql security invoker set search_path = '' as $$
  select jsonb_build_object(
    'diagnostic_weak_tags',public.guest_diagnostic_focus(p_user_id),
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

revoke all on function public.guest_diagnostic_import(uuid,text,uuid,jsonb),public.guest_diagnostic_focus(uuid),public.mcq_engine_state(uuid) from public,anon,authenticated;
grant execute on function public.guest_diagnostic_import(uuid,text,uuid,jsonb),public.guest_diagnostic_focus(uuid),public.mcq_engine_state(uuid) to service_role;
notify pgrst,'reload schema';
