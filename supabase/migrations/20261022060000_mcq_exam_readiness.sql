-- Activity provenance is descriptive. Existing mastery and selection stay unchanged.
create function public.mcq_engine_answer_sourced(p_user_id uuid,p_event_id uuid,p_session_id uuid,p_question_id text,p_option_id uuid,p_standalone jsonb,p_elapsed_ms integer,p_source text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare result jsonb; seen boolean; chapter text;
begin
  if p_source is null or p_source not in ('mcq-set','exam','daily-challenge','diagnostic') then
    raise exception 'Invalid activity source' using errcode='22023';
  end if;
  insert into mcq_engine.owners(user_id) values(p_user_id) on conflict do nothing;
  perform 1 from mcq_engine.owners where user_id=p_user_id for update;
  select exists(select 1 from mcq_engine.history where user_id=p_user_id and
    (event_id=p_event_id or (p_session_id is not null and session_id=p_session_id and question_id=p_question_id))) into seen;
  if p_elapsed_ms is null then
    result:=public.mcq_engine_answer(p_user_id,p_event_id,p_session_id,p_question_id,p_option_id,p_standalone);
  else
    result:=public.mcq_engine_answer_paced(p_user_id,p_event_id,p_session_id,p_question_id,p_option_id,p_standalone,p_elapsed_ms);
  end if;
  if not seen then
    if p_session_id is null then chapter:=p_standalone->>'chapter';
    else
      select q->>'chapter' into chapter from mcq_engine.sessions s, jsonb_array_elements(s.questions) q
        where s.id=p_session_id and s.user_id=p_user_id and q->>'id'=p_question_id;
    end if;
    result:=result || jsonb_build_object('practice_source',case when p_session_id is not null then 'mcq-set' else p_source end,'chapter',chapter);
    update mcq_engine.history set response=result where user_id=p_user_id and event_id=p_event_id;
  end if;
  return result;
end;
$$;

-- Replay only eligible evidence through the existing mastery rule (50, +20/-35,
-- clamped 0..100). Daily Challenge, diagnostics and unlabelled standalone history
-- cannot influence readiness. Historical owned sets are identifiable and included.
create function public.mcq_engine_readiness(p_user_id uuid) returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare
  row record; concepts jsonb:='{}'; chapters jsonb:='{}'; item jsonb; stats jsonb;
  score integer; total integer:=0; unclassified integer; concept_rows jsonb;
begin
  for row in
    select h.concept_tag,h.is_correct,
      coalesce(h.response->>'chapter',
        (select q->>'chapter' from mcq_engine.sessions s,jsonb_array_elements(s.questions) q
          where s.id=h.session_id and s.user_id=p_user_id and q->>'id'=h.question_id limit 1),
        b.payload->>'chapter') as chapter
    from mcq_engine.history h join mcq_engine.questions b on b.id=h.question_id
    where h.user_id=p_user_id and nullif(btrim(h.concept_tag),'') is not null
      and (h.session_id is not null or h.response->>'practice_source' in ('mcq-set','exam'))
    order by h.created_at,h.event_id
  loop
    item:=concepts->row.concept_tag;
    score:=greatest(0,least(100,coalesce((item->>'score')::integer,50)+case when row.is_correct then 20 else -35 end));
    concepts:=jsonb_set(concepts,array[row.concept_tag],jsonb_build_object('score',score,'chapter',row.chapter));
    total:=total+1;
    if row.chapter in ('1','2','3','4','5') then
      stats:=chapters->row.chapter;
      chapters:=jsonb_set(chapters,array[row.chapter],jsonb_build_object(
        'total',coalesce((stats->>'total')::integer,0)+1,
        'correct',coalesce((stats->>'correct')::integer,0)+case when row.is_correct then 1 else 0 end));
    end if;
  end loop;
  select coalesce(jsonb_agg(jsonb_build_object('tag',key,'score',(value->>'score')::integer,'chapter',value->>'chapter') order by key),'[]') into concept_rows from jsonb_each(concepts);
  select count(*) into unclassified from mcq_engine.history where user_id=p_user_id and session_id is null and response->>'practice_source' is null;
  return jsonb_build_object('concepts',concept_rows,'chapters',chapters,'total',total,'unclassified',unclassified);
end;
$$;
revoke all on function public.mcq_engine_answer_sourced(uuid,uuid,uuid,text,uuid,jsonb,integer,text) from public,anon,authenticated;
revoke all on function public.mcq_engine_readiness(uuid) from public,anon,authenticated;
grant execute on function public.mcq_engine_answer_sourced(uuid,uuid,uuid,text,uuid,jsonb,integer,text) to service_role;
grant execute on function public.mcq_engine_readiness(uuid) to service_role;
