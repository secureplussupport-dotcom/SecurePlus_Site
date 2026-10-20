-- Replacement MCQ engine. Private answer keys and state, service-only RPCs.
-- No existing adaptive tables, tags, attempts or PBQ content are dropped.
create schema mcq_engine;
revoke all on schema mcq_engine from public, anon, authenticated;
grant usage on schema mcq_engine to service_role;

create table mcq_engine.owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  version bigint not null default 0
);
create table mcq_engine.questions (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create table mcq_engine.mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_tag text not null,
  score integer not null default 50 check (score between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, concept_tag)
);
create table mcq_engine.failed_buffer (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references mcq_engine.questions(id),
  cooldown_counter integer not null default 30,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);
create table mcq_engine.sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  questions jsonb not null check (jsonb_typeof(questions) = 'array'),
  created_at timestamptz not null default now()
);
create index mcq_sessions_owner on mcq_engine.sessions(user_id, created_at);
create table mcq_engine.history (
  event_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references mcq_engine.questions(id),
  session_id uuid references mcq_engine.sessions(id) on delete cascade,
  concept_tag text,
  selected_option_id uuid not null,
  is_correct boolean not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, session_id, question_id)
);
create index mcq_history_owner_question on mcq_engine.history(user_id, question_id, created_at desc);

alter table mcq_engine.owners enable row level security;
alter table mcq_engine.questions enable row level security;
alter table mcq_engine.mastery enable row level security;
alter table mcq_engine.failed_buffer enable row level security;
alter table mcq_engine.sessions enable row level security;
alter table mcq_engine.history enable row level security;
revoke all on all tables in schema mcq_engine from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema mcq_engine to service_role;

create function public.mcq_engine_state(p_user_id uuid) returns jsonb
language sql security invoker set search_path = '' as $$
  select jsonb_build_object(
    'version', coalesce((select version from mcq_engine.owners where user_id=p_user_id),0),
    'mastery', coalesce((select jsonb_agg(jsonb_build_object('concept_tag',concept_tag,'score',score)) from mcq_engine.mastery where user_id=p_user_id),'[]'::jsonb),
    'failed', coalesce((select jsonb_agg(jsonb_build_object('question_id',question_id,'cooldown_counter',cooldown_counter,'created_at',created_at)) from mcq_engine.failed_buffer where user_id=p_user_id),'[]'::jsonb),
    'history', coalesce((select jsonb_agg(to_jsonb(h)) from (select question_id,max(created_at) as last_seen_at from mcq_engine.history where user_id=p_user_id group by question_id) h),'[]'::jsonb)
  );
$$;

create function public.mcq_engine_create_session(p_user_id uuid,p_session_id uuid,p_version bigint,p_questions jsonb) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare current_version bigint; q jsonb;
begin
  insert into mcq_engine.owners(user_id) values(p_user_id) on conflict do nothing;
  select version into current_version from mcq_engine.owners where user_id=p_user_id for update;
  if exists(select 1 from mcq_engine.sessions where id=p_session_id and user_id=p_user_id) then return true; end if;
  if current_version<>p_version then return false; end if;
  if jsonb_typeof(p_questions)<>'array' or jsonb_array_length(p_questions) not between 10 and 30 then raise exception 'Invalid set size' using errcode='22023'; end if;
  if (select count(distinct item->>'id') from jsonb_array_elements(p_questions) item)<>jsonb_array_length(p_questions) then raise exception 'Duplicate question' using errcode='22023'; end if;
  for q in select * from jsonb_array_elements(p_questions) loop
    if q->>'format' is distinct from 'mcq' or q->>'id' is null then raise exception 'MCQs only' using errcode='22023'; end if;
    insert into mcq_engine.questions(id,payload) values(q->>'id',q) on conflict(id) do update set payload=excluded.payload,updated_at=now();
  end loop;
  insert into mcq_engine.sessions(id,user_id,questions) values(p_session_id,p_user_id,p_questions);
  return true;
end;
$$;

-- session_id pins generated questions and makes each answer idempotent.
-- Standalone MCQs (random/exam/diagnostic) use a stable event_id on retries.
create function public.mcq_engine_answer(p_user_id uuid,p_event_id uuid,p_session_id uuid,p_question_id text,p_option_id uuid,p_standalone jsonb default null) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare q jsonb; opt jsonb; prior mcq_engine.history; correct boolean; result jsonb; next_score integer; tag text;
begin
  insert into mcq_engine.owners(user_id) values(p_user_id) on conflict do nothing;
  perform 1 from mcq_engine.owners where user_id=p_user_id for update;
  select * into prior from mcq_engine.history where user_id=p_user_id and
    (event_id=p_event_id or (p_session_id is not null and session_id=p_session_id and question_id=p_question_id));
  if found then
    if prior.question_id<>p_question_id or prior.selected_option_id<>p_option_id or prior.session_id is distinct from p_session_id then raise exception 'Answer already submitted' using errcode='23505'; end if;
    return prior.response;
  end if;
  if p_session_id is not null then
    select item into q from mcq_engine.sessions s cross join lateral jsonb_array_elements(s.questions) item
      where s.id=p_session_id and s.user_id=p_user_id and item->>'id'=p_question_id;
  else
    q:=p_standalone;
  end if;
  if q is null or q->>'format' is distinct from 'mcq' or q->>'id' is distinct from p_question_id then raise exception 'Question not in owned session' using errcode='22023'; end if;
  select item into opt from jsonb_array_elements(q->'options') item where item->>'id'=p_option_id::text;
  if opt is null then raise exception 'Unknown option ID' using errcode='22023'; end if;
  correct:=(opt->>'is_correct')::boolean; tag:=q->>'concept_tag';
  insert into mcq_engine.questions(id,payload) values(p_question_id,q) on conflict(id) do nothing;
  update mcq_engine.failed_buffer set cooldown_counter=greatest(0,cooldown_counter-1) where user_id=p_user_id;
  if tag is not null then
    insert into mcq_engine.mastery(user_id,concept_tag,score) values(p_user_id,tag,case when correct then 70 else 15 end)
      on conflict(user_id,concept_tag) do update set score=greatest(0,least(100,mcq_engine.mastery.score+case when correct then 20 else -35 end)),updated_at=now()
      returning score into next_score;
  end if;
  if not correct then
    insert into mcq_engine.failed_buffer(user_id,question_id,cooldown_counter) values(p_user_id,p_question_id,30)
      on conflict(user_id,question_id) do update set cooldown_counter=30;
  else
    delete from mcq_engine.failed_buffer where user_id=p_user_id and question_id=p_question_id;
  end if;
  select jsonb_build_object('is_correct',correct,'correct_option_id',item->>'id','explanation',q->>'explanation',
    'selected_feedback',opt->>'feedback','concept_tag',tag,'concept_score',next_score) into result
    from jsonb_array_elements(q->'options') item where (item->>'is_correct')::boolean;
  if result is null then raise exception 'Missing answer key' using errcode='22023'; end if;
  insert into mcq_engine.history(event_id,user_id,question_id,session_id,concept_tag,selected_option_id,is_correct,response)
    values(p_event_id,p_user_id,p_question_id,p_session_id,tag,p_option_id,correct,result);
  update mcq_engine.owners set version=version+1 where user_id=p_user_id;
  return result;
end;
$$;

-- Read a resumable plan only through a verified server owner identity.
create function public.mcq_engine_session(p_user_id uuid,p_session_id uuid) returns jsonb
language sql security invoker set search_path = '' as $$
  select jsonb_build_object('questions',questions,'answers',coalesce((select jsonb_agg(jsonb_build_object('question_id',h.question_id,'selected_option_id',h.selected_option_id,'response',h.response)) from mcq_engine.history h where h.user_id=p_user_id and h.session_id=p_session_id),'[]'::jsonb))
  from mcq_engine.sessions where id=p_session_id and user_id=p_user_id;
$$;

revoke all on function public.mcq_engine_state(uuid) from public, anon, authenticated;
revoke all on function public.mcq_engine_create_session(uuid,uuid,bigint,jsonb) from public, anon, authenticated;
revoke all on function public.mcq_engine_answer(uuid,uuid,uuid,text,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.mcq_engine_session(uuid,uuid) from public, anon, authenticated;
grant execute on function public.mcq_engine_state(uuid),public.mcq_engine_create_session(uuid,uuid,bigint,jsonb),public.mcq_engine_answer(uuid,uuid,uuid,text,uuid,jsonb),public.mcq_engine_session(uuid,uuid) to service_role;
