-- Diagnostic previews are separate from registered practice allowances.
-- Snapshots expire after seven days; only the signed browser can claim one.
create table mcq_engine.guest_diagnostics (
 id uuid primary key, owner_key text not null, questions jsonb not null,
 created_at timestamptz not null default now(), imported_user uuid references auth.users(id) on delete cascade,
 imported_answers jsonb, response jsonb
);
create index on mcq_engine.guest_diagnostics(owner_key,created_at);
create unique index guest_diagnostic_one_baseline on mcq_engine.guest_diagnostics(imported_user) where imported_user is not null;
alter table mcq_engine.guest_diagnostics enable row level security;
revoke all on mcq_engine.guest_diagnostics from public,anon,authenticated;
grant select,insert,update,delete on mcq_engine.guest_diagnostics to service_role;

create function public.guest_diagnostic_create(p_guest_key text,p_request_id uuid,p_questions jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare prior mcq_engine.guest_diagnostics;
begin
 if p_guest_key is null or p_guest_key not like 'guest:%' then raise exception 'Invalid browser' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_guest_key,43));
 select * into prior from mcq_engine.guest_diagnostics where id=p_request_id;
 if found then
  if prior.owner_key<>p_guest_key or prior.created_at<now()-interval '7 days' then raise exception 'Diagnostic unavailable' using errcode='22023';end if;
  return jsonb_build_object('questions',prior.questions);
 end if;
 if (select count(*) from mcq_engine.guest_diagnostics where owner_key=p_guest_key and created_at>now()-interval '1 hour')>=10 then
  raise exception 'Please wait before starting another diagnostic' using errcode='P0001';
 end if;
 if jsonb_typeof(p_questions)<>'array' or jsonb_array_length(p_questions)<>10 or
 (select count(distinct q->>'id') from jsonb_array_elements(p_questions) q)<>10 or
 exists(select 1 from jsonb_array_elements(p_questions) q where q->>'format' is distinct from 'mcq' or q->>'difficulty' is distinct from 'core' or nullif(q->>'concept_tag','') is null) then
 raise exception 'Invalid diagnostic' using errcode='22023';end if;
 delete from mcq_engine.guest_diagnostics where owner_key=p_guest_key and imported_user is null and created_at<now()-interval '7 days';
 insert into mcq_engine.guest_diagnostics(id,owner_key,questions) values(p_request_id,p_guest_key,p_questions);
 return jsonb_build_object('questions',p_questions);
end;
$$;

create function public.guest_diagnostic_import(p_user_id uuid,p_guest_key text,p_request_id uuid,p_answers jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare run mcq_engine.guest_diagnostics; q jsonb; opt uuid; event uuid; result jsonb; rows jsonb:='[]'; stamp timestamptz; i int:=0;
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
 -- Validate every answer before any grading or progress mutation.
 for q in select value from jsonb_array_elements(run.questions) loop
  select (a->>'selected_option_id')::uuid into opt from jsonb_array_elements(p_answers) a where a->>'question_id'=q->>'id';
  if opt is null or not exists(select 1 from jsonb_array_elements(q->'options') o where o->>'id'=opt::text) then raise exception 'Invalid option' using errcode='22023';end if;
 end loop;
 for q in select value from jsonb_array_elements(run.questions) loop
  select (a->>'selected_option_id')::uuid into opt from jsonb_array_elements(p_answers) a where a->>'question_id'=q->>'id';
  event:=md5(p_request_id::text||':'||(q->>'id'))::uuid;
  result:=public.mcq_engine_answer_sourced(p_user_id,event,null,q->>'id',opt,q,null,'diagnostic');
  stamp:=now()+i*interval '1 millisecond';i:=i+1;
  -- Preserve answer order for streak replay (all imports share a transaction).
  update mcq_engine.history set created_at=stamp,response=response||'{"guest_diagnostic":true}'::jsonb where event_id=event and user_id=p_user_id;
  insert into public.attempts(id,user_id,question_id,question_type,title,domain,chapter,correct,created_at)
  values(event,p_user_id,q->>'id','mcq',q->>'prompt',q->>'domain',q->>'chapter',(result->>'is_correct')::boolean,stamp);
  rows:=rows||jsonb_build_array(jsonb_build_object('qid',q->>'id','correct',result->'is_correct','title',q->>'prompt','ch',q->>'chapter','conceptTag',q->>'concept_tag','mcq',true,'readinessSource','diagnostic','createdAt',stamp));
 end loop;
 result:=jsonb_build_object('attempts',rows,'imported',true);
 update mcq_engine.guest_diagnostics set imported_user=p_user_id,imported_answers=p_answers,response=result where id=p_request_id;
 return result;
end;
$$;
revoke all on function public.guest_diagnostic_create(text,uuid,jsonb),public.guest_diagnostic_import(uuid,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.guest_diagnostic_create(text,uuid,jsonb),public.guest_diagnostic_import(uuid,text,uuid,jsonb) to service_role;
notify pgrst,'reload schema';

-- One diagnostic miss recommends recall cards until that concept is answered correctly.
create function public.guest_diagnostic_focus(p_user_id uuid) returns jsonb
language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(concept_tag),'[]') from (
 select distinct h.concept_tag from mcq_engine.history h
 where h.user_id=p_user_id and h.response->>'guest_diagnostic'='true' and not h.is_correct
 and not exists(select 1 from mcq_engine.history later where later.user_id=h.user_id and later.concept_tag=h.concept_tag and later.is_correct and later.created_at>h.created_at)
 ) tags;
$$;
revoke all on function public.guest_diagnostic_focus(uuid) from public,anon,authenticated;
grant execute on function public.guest_diagnostic_focus(uuid) to service_role;
notify pgrst,'reload schema';
