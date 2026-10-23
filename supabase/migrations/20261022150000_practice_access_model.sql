alter table public.profiles add column if not exists pro_pass_expires_at timestamptz;
create table mcq_engine.access_allocations(
 id uuid primary key, owner_key text not null, user_id uuid references auth.users(id) on delete cascade,
 mode text not null check(mode in ('smart','random','exam','missed','starred','diagnostic')),
 questions jsonb not null, filters jsonb not null default '{}', count integer not null check(count between 1 and 90),
 created_at timestamptz not null default now(), completed_at timestamptz
);
create index on mcq_engine.access_allocations(owner_key,created_at);
insert into mcq_engine.access_allocations(id,owner_key,user_id,mode,questions,count,created_at,completed_at)
select s.id,s.user_id::text,s.user_id,'smart',s.questions,jsonb_array_length(s.questions),s.created_at,
 case when (select count(*) from mcq_engine.history h where h.session_id=s.id and h.user_id=s.user_id)>=jsonb_array_length(s.questions) then now() else null end
from mcq_engine.sessions s where jsonb_array_length(s.questions) between 1 and 90;

alter table mcq_engine.access_allocations enable row level security;
revoke all on mcq_engine.access_allocations from public,anon,authenticated;
grant select,insert,update,delete on mcq_engine.access_allocations to service_role;
create table public.pro_pass_purchases(
 checkout_session_id text primary key, user_id uuid not null references auth.users(id) on delete cascade,
 plan text not null check(plan in ('sprint','comprehensive')),amount integer not null,currency text not null,
 starts_at timestamptz not null, expires_at timestamptz not null,created_at timestamptz not null default now()
);
alter table public.pro_pass_purchases enable row level security;
revoke all on public.pro_pass_purchases from public,anon,authenticated;
grant select,insert on public.pro_pass_purchases to service_role;
create or replace function public.practice_is_pro(p_user_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p where p.id=p_user_id and (
 p.pro_pass_expires_at>now() or p.pro_trial_until>now() or p.subscription_status in ('active','trialing','admin_permanent')
 or (p.tier='pro' and p.pro_pass_expires_at is null)
 or exists(select 1 from public.app_admins a where lower(a.email)=lower(p.email))));
$$;
create function public.practice_access_status(p_user_id uuid,p_guest_key text default null) returns jsonb
language sql security invoker set search_path='' as $$
 with flags as(select case when p_user_id is null then false else public.practice_is_pro(p_user_id) end as pro),
 usage as(select coalesce(sum(count),0)::int used,min(created_at)+interval '12 hours' reset_at
 from mcq_engine.access_allocations where owner_key=coalesce(p_user_id::text,p_guest_key)
 and (p_user_id is null or created_at>now()-interval '12 hours'))
 select jsonb_build_object('isPro',pro,'limit',case when p_user_id is null then 10 else 50 end,
 'remaining',case when pro then null else greatest(0,(case when p_user_id is null then 10 else 50 end)-used) end,
 'used',used,'resetAt',case when p_user_id is null then null else reset_at end,
 'maxSetSize',case when pro then 90 when p_user_id is null then 10 else 30 end,
 'passExpiresAt',(select pro_pass_expires_at from public.profiles where id=p_user_id)) from flags,usage;
$$;
create function public.practice_create_set(p_user_id uuid,p_guest_key text,p_request_id uuid,p_mode text,p_questions jsonb,p_filters jsonb,p_version bigint default null) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare owner text:=coalesce(p_user_id::text,p_guest_key); prior mcq_engine.access_allocations; access jsonb; n int; v bigint;
begin
 if owner is null or length(owner)<8 then raise exception 'Invalid owner' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(owner,17));
 select * into prior from mcq_engine.access_allocations where id=p_request_id;
 if found then
  if prior.owner_key<>owner or prior.mode<>p_mode or prior.filters<>p_filters or prior.count<>jsonb_array_length(p_questions) then raise exception 'Request conflict' using errcode='22023';end if;
  return jsonb_build_object('created',true,'questions',prior.questions,'access',public.practice_access_status(p_user_id,p_guest_key),'createdAt',prior.created_at);
 end if;
 if p_mode not in ('smart','random','exam','missed','starred','diagnostic') or jsonb_typeof(p_questions)<>'array' then raise exception 'Invalid mode' using errcode='22023';end if;
 n:=jsonb_array_length(p_questions);access:=public.practice_access_status(p_user_id,p_guest_key);
 if n<1 or n>(access->>'maxSetSize')::int then raise exception 'Invalid set size' using errcode='22023';end if;
 if not (access->>'isPro')::boolean and p_filters<>'{}'::jsonb then raise exception 'Pro filters required' using errcode='42501';end if;
 if p_user_id is null and (p_mode<>'diagnostic' or n<>10) then raise exception 'Guest diagnostic only' using errcode='42501';end if;
 if not (access->>'isPro')::boolean and n>(access->>'remaining')::int then return jsonb_build_object('created',false,'quotaExceeded',true,'access',access);end if;
 if (select count(distinct q->>'id') from jsonb_array_elements(p_questions) q)<>n or exists(select 1 from jsonb_array_elements(p_questions) q where q->>'format' is distinct from 'mcq') then raise exception 'Invalid questions' using errcode='22023';end if;
 if p_user_id is not null then
  insert into mcq_engine.owners(user_id) values(p_user_id) on conflict do nothing;
  select version into v from mcq_engine.owners where user_id=p_user_id for update;
  if p_version is not null and v<>p_version then return jsonb_build_object('created',false,'retry',true);end if;
  insert into mcq_engine.sessions(id,user_id,questions) values(p_request_id,p_user_id,p_questions);
 end if;
 insert into mcq_engine.access_allocations(id,owner_key,user_id,mode,questions,filters,count) values(p_request_id,owner,p_user_id,p_mode,p_questions,p_filters,n);
 return jsonb_build_object('created',true,'questions',p_questions,'access',public.practice_access_status(p_user_id,p_guest_key),'createdAt',now());
end;
$$;
create function public.practice_owned_set(p_user_id uuid,p_request_id uuid) returns jsonb
language sql security invoker set search_path='' as $$
 select case when a.completed_at is null and not public.practice_is_pro(p_user_id) and a.created_at<=now()-interval '12 hours'
 then jsonb_build_object('expired',true) else jsonb_build_object('questions',a.questions,'mode',a.mode,'createdAt',a.created_at,'completed',a.completed_at is not null) end
 from mcq_engine.access_allocations a where id=p_request_id and user_id=p_user_id;
$$;
create function public.practice_complete_set(p_user_id uuid,p_request_id uuid) returns void
language sql security invoker set search_path='' as $$
 update mcq_engine.access_allocations set completed_at=coalesce(completed_at,now()) where id=p_request_id and user_id=p_user_id;
$$;
create function public.grant_pro_access_pass(p_user_id uuid,p_session_id text,p_plan text,p_amount int,p_currency text) returns timestamptz
language plpgsql security invoker set search_path='' as $$
declare prior public.pro_pass_purchases; begin_at timestamptz; finish timestamptz; days int;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,29));
 select * into prior from public.pro_pass_purchases where checkout_session_id=p_session_id;
 if found then
  if prior.user_id<>p_user_id or prior.plan<>p_plan or prior.amount<>p_amount or prior.currency<>p_currency then raise exception 'Purchase conflict';end if;
  return prior.expires_at;
 end if;
 if p_currency<>'usd' or not ((p_plan='sprint' and p_amount=1199) or (p_plan='comprehensive' and p_amount=2499)) then raise exception 'Invalid pass payment';end if;
 days:=case when p_plan='sprint' then 30 else 90 end;
 select greatest(now(),coalesce(pro_pass_expires_at,now())) into begin_at from public.profiles where id=p_user_id for update;
 if not found then raise exception 'Profile missing';end if;
 finish:=begin_at+make_interval(days=>days);
 insert into public.pro_pass_purchases(checkout_session_id,user_id,plan,amount,currency,starts_at,expires_at) values(p_session_id,p_user_id,p_plan,p_amount,p_currency,begin_at,finish);
 update public.profiles set pro_pass_expires_at=finish,updated_at=now() where id=p_user_id;
 return finish;
end;
$$;
-- Bookmark replacement is an owned, atomic action; direct inserts cannot bypass the cap.
alter table public.starred_questions add column if not exists archived boolean not null default false;
alter table public.starred_questions add column if not exists label text not null default '';
alter table public.starred_questions add column if not exists tags text[] not null default '{}';
create function public.practice_save_star(p_user_id uuid,p_key text,p_type text,p_id text,p_replace text default null,p_label text default '',p_tags text[] default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare pro boolean; oldest text; total int;
begin
 if p_type not in ('mcq','pbq','flashcard') or p_key<>p_type||':'||p_id or length(p_id) not between 1 and 160 or length(p_label)>80 or cardinality(p_tags)>10 or exists(select 1 from unnest(p_tags) x where length(x)>40) then raise exception 'Invalid bookmark' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,31));
 pro:=public.practice_is_pro(p_user_id);
 if not pro and (p_label<>'' or cardinality(p_tags)>0) then raise exception 'Pro organisation required' using errcode='42501';end if;
 if exists(select 1 from public.starred_questions where user_id=p_user_id and question_key=p_key and not archived) then
  update public.starred_questions set label=p_label,tags=p_tags where user_id=p_user_id and question_key=p_key;return jsonb_build_object('saved',true);
 end if;
 if p_type in ('mcq','pbq') and not pro then
  select count(*) into total from public.starred_questions where user_id=p_user_id and question_type in ('mcq','pbq') and not archived;
  if total>=10 then
   select question_key into oldest from public.starred_questions where user_id=p_user_id and question_type in ('mcq','pbq') and not archived order by created_at,question_key limit 1;
   if p_replace is distinct from oldest then return jsonb_build_object('saved',false,'replaceRequired',true,'oldest',oldest);end if;
   delete from public.starred_questions where user_id=p_user_id and question_key=oldest;
  end if;
 end if;
 insert into public.starred_questions(user_id,question_key,question_type,question_id,label,tags) values(p_user_id,p_key,p_type,p_id,p_label,p_tags) on conflict(user_id,question_key) do update set archived=false,label=excluded.label,tags=excluded.tags,created_at=now();
 return jsonb_build_object('saved',true,'replaced',oldest);
end;
$$;
create function public.practice_list_stars(p_user_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,31));
 if public.practice_is_pro(p_user_id) then
  update public.starred_questions set archived=false where user_id=p_user_id and archived;
 else
  update public.starred_questions set archived=true where user_id=p_user_id and question_key in
   (select question_key from public.starred_questions where user_id=p_user_id and question_type in ('mcq','pbq') and not archived order by created_at desc,question_key desc offset 10);
 end if;
 return coalesce((select jsonb_agg(to_jsonb(s) order by s.created_at) from public.starred_questions s where s.user_id=p_user_id and not s.archived),'[]'::jsonb);
end;
$$;
revoke insert,update on public.starred_questions from authenticated;
-- Standard content is accessible to every registered learner, including PBQs.
create policy "Registered learners can read full PBQ bank" on public.pbqs for select to authenticated using(auth.uid() is not null);
DO $grants$ DECLARE fn record; BEGIN
 FOR fn IN select oid::regprocedure signature from pg_proc where pronamespace='public'::regnamespace and proname in ('practice_access_status','practice_create_set','practice_owned_set','practice_complete_set','grant_pro_access_pass','practice_save_star','practice_is_pro','practice_list_stars') LOOP
 EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',fn.signature);
 EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',fn.signature);
 END LOOP;
END $grants$;
DO $star_types$ DECLARE c record; BEGIN
 FOR c IN SELECT conname FROM pg_constraint WHERE conrelid='public.starred_questions'::regclass AND contype='c' AND (pg_get_constraintdef(oid) like '%question_type%' OR pg_get_constraintdef(oid) like '%question_id%') LOOP
 EXECUTE format('ALTER TABLE public.starred_questions DROP CONSTRAINT %I',c.conname);
 END LOOP;
END $star_types$;
alter table public.starred_questions add constraint starred_access_type_check check(question_type in ('mcq','pbq','flashcard'));
alter table public.starred_questions add constraint starred_access_id_check check(length(question_id) between 1 and 160 and question_key=question_type||':'||question_id);

notify pgrst, 'reload schema';
