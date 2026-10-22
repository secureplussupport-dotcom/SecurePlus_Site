-- Dashboard activity totals are separate from the MCQ/Exam-only readiness denominator.
create or replace function public.mcq_engine_readiness(p_user_id uuid) returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare
  row record; concepts jsonb:='{}'; chapters jsonb:='{}'; item jsonb; stats jsonb;
  score integer; total integer:=0; unclassified integer; concept_rows jsonb; activity jsonb;
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
  -- Public attempt rows cover legacy practice before private event recording.
  -- Use the first private event as the cutover so mirrored rows count only once.
  with first_event as (select min(created_at) as at from mcq_engine.history where user_id=p_user_id),
  completed as (
    select is_correct from mcq_engine.history where user_id=p_user_id
    union all
    select a.correct from public.attempts a cross join first_event f
      where a.user_id=p_user_id and a.question_type='mcq' and a.correct is not null
        and (f.at is null or a.created_at<f.at)
  )
  select jsonb_build_object('total',count(*),'correct',count(*) filter(where is_correct)) into activity from completed;
  return jsonb_build_object('concepts',concept_rows,'chapters',chapters,'total',total,'unclassified',unclassified,'activity',activity);
end;
$$;

revoke all on function public.mcq_engine_readiness(uuid) from public,anon,authenticated;
grant execute on function public.mcq_engine_readiness(uuid) to service_role;
