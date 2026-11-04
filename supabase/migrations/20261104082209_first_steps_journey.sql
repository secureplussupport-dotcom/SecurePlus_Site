begin;
create table public.learner_first_steps (
 user_id uuid primary key references auth.users(id) on delete cascade,
 mcq_completed boolean not null default false,
 lesson_completed boolean not null default false,
 deck_completed boolean not null default false,
 completed_at timestamptz,
 celebration_seen_at timestamptz,
 reward_day date,
 check ((completed_at is null and reward_day is null) or (completed_at is not null and reward_day is not null and mcq_completed and lesson_completed and deck_completed)),
 check (celebration_seen_at is null or completed_at is not null)
);
alter table public.learner_first_steps enable row level security;
revoke all on public.learner_first_steps from anon,authenticated;
grant select on public.learner_first_steps to authenticated;
create policy "Read own first steps" on public.learner_first_steps for select to authenticated using ((select auth.uid())=user_id);

create function public.sync_first_steps(p_mcq boolean default false,p_lesson boolean default false,p_deck boolean default false,p_acknowledge boolean default false,p_timezone text default 'UTC')
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 owner_id uuid:=auth.uid();
 row_value public.learner_first_steps;
 local_day date;
 finished boolean;
begin
 if owner_id is null then raise exception 'Sign in required' using errcode='42501';end if;
 if not exists(select 1 from auth.users where id=owner_id and created_at>='2026-11-04T00:00:00Z'::timestamptz) then return jsonb_build_object('eligible',false);end if;
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=p_timezone) then raise exception 'Invalid timezone' using errcode='22023';end if;
 local_day:=(now() at time zone p_timezone)::date;
 insert into public.learner_first_steps(user_id) values(owner_id) on conflict(user_id) do nothing;
 select * into row_value from public.learner_first_steps where user_id=owner_id for update;
 row_value.mcq_completed:=row_value.mcq_completed or coalesce(p_mcq,false);
 row_value.lesson_completed:=row_value.lesson_completed or coalesce(p_lesson,false);
 row_value.deck_completed:=row_value.deck_completed or coalesce(p_deck,false);
 finished:=row_value.mcq_completed and row_value.lesson_completed and row_value.deck_completed;
 if finished and row_value.completed_at is null then row_value.completed_at:=now();row_value.reward_day:=local_day;end if;
 if finished and p_acknowledge then row_value.celebration_seen_at:=coalesce(row_value.celebration_seen_at,now());end if;
 update public.learner_first_steps set mcq_completed=row_value.mcq_completed,lesson_completed=row_value.lesson_completed,deck_completed=row_value.deck_completed,
 completed_at=row_value.completed_at,celebration_seen_at=row_value.celebration_seen_at,reward_day=row_value.reward_day where user_id=owner_id;
 return to_jsonb(row_value)||jsonb_build_object('eligible',true);
end;
$$;
revoke all on function public.sync_first_steps(boolean,boolean,boolean,boolean,text) from public,anon;
grant execute on function public.sync_first_steps(boolean,boolean,boolean,boolean,text) to authenticated;
commit;
