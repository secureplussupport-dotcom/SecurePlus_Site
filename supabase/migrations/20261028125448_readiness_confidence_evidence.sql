-- Read-only confidence evidence. Existing grading/mastery and old clients stay unchanged.
create function public.mcq_engine_readiness_evidence(p_user_id uuid) returns jsonb
language sql stable security invoker set search_path='' as $$
 with eligible as (
  select h.question_id,h.concept_tag,h.is_correct,h.created_at,
   coalesce(h.response->>'chapter',
    (select q->>'chapter' from mcq_engine.sessions s,jsonb_array_elements(s.questions) q
     where s.id=h.session_id and s.user_id=p_user_id and q->>'id'=h.question_id limit 1),b.payload->>'chapter') as chapter
  from mcq_engine.history h join mcq_engine.questions b on b.id=h.question_id
  where h.user_id=p_user_id and nullif(btrim(h.concept_tag),'') is not null
   and h.selected_option_id is not null and h.is_correct is not null
   and (h.session_id is not null or h.response->>'practice_source' in ('mcq-set','exam'))
 )
 select public.mcq_engine_readiness(p_user_id)||jsonb_build_object(
  'evidenceVersion',2,'correct',(select count(*) from eligible where is_correct),
  'metrics',jsonb_build_object(
   'distinctQuestions',(select count(distinct question_id) from eligible),
   'distinctConcepts',(select count(distinct concept_tag) from eligible),
   'domainsAttempted',coalesce((select jsonb_agg(chapter order by chapter) from (select distinct chapter from eligible where chapter in ('1','2','3','4','5')) d),'[]'::jsonb),
   'practiceDays',(select count(distinct (created_at at time zone 'UTC')::date) from eligible),
   'firstAttemptAt',(select min(created_at) from eligible),
   'lastPracticeAt',(select max(created_at) from eligible)))
$$;
revoke all on function public.mcq_engine_readiness_evidence(uuid) from public,anon,authenticated;
grant execute on function public.mcq_engine_readiness_evidence(uuid) to service_role;
