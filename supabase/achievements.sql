-- SecurePlus achievements and star balance setup.
-- Run this in the Supabase SQL Editor after supabase/schema.sql.

create table if not exists achievements (
  id varchar(50) primary key,
  title varchar(100) not null,
  description text not null,
  star_value int not null check (star_value between 1 and 5)
);

create table if not exists user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id varchar(50) not null references achievements(id),
  unlocked_at timestamptz not null default timezone('utc'::text, now()),
  primary key (user_id, achievement_id)
);

alter table profiles
add column if not exists total_stars int not null default 0;

alter table attempts
add column if not exists session_type text,
add column if not exists duration_seconds integer,
add column if not exists questions_count integer;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_total_stars_check') then
    alter table profiles
    add constraint profiles_total_stars_check
    check (total_stars >= 0 and total_stars <= 30);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'attempts_session_summary_check') then
    alter table attempts
    add constraint attempts_session_summary_check
    check (
      (session_type is null or session_type in ('exam', 'practice', 'pbq'))
      and (duration_seconds is null or duration_seconds >= 0)
      and (questions_count is null or questions_count between 1 and 500)
    );
  end if;
end $$;

create or replace function trigger_increment_user_stars()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update profiles
  set total_stars = least(
    30,
    coalesce(total_stars, 0) + coalesce((select star_value from achievements where id = new.achievement_id), 0)
  )
  where id = new.user_id;
  return new;
end;
$$;

revoke all on function trigger_increment_user_stars() from public;
revoke all on function trigger_increment_user_stars() from anon;
revoke all on function trigger_increment_user_stars() from authenticated;

drop trigger if exists on_achievement_unlocked on user_achievements;
create trigger on_achievement_unlocked
after insert on user_achievements
for each row
execute function trigger_increment_user_stars();

insert into achievements (id, title, description, star_value) values
('century_streak', 'Century Streak', 'Reach a 100-day study streak.', 5),
('fortress_builder', 'Fortress Builder', 'Maintain a 30-day study streak.', 3),
('flawless_victory', 'Flawless Victory', 'Score 100% on a full-length Exam Mode (min. 50 questions).', 5),
('domain_master', 'Domain Master', 'Get 100% correct in a single study session for any chapter.', 2),
('speed_demon', 'Speed Demon', 'Complete a full-length Exam Mode in under 10 minutes with a passing score (>= 80%).', 5),
('blitz_run', 'Blitz Run', 'Complete a 10-question MCQ session in under 90 seconds with 100% accuracy.', 3),
('pbq_crusher', 'PBQ Crusher', 'Complete all 105 PBQ simulations.', 4),
('no_stone_unturned', 'No Stone Unturned', 'Practice 100% of the active 412 MCQ question bank.', 3)
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    star_value = excluded.star_value;

alter table achievements enable row level security;
alter table user_achievements enable row level security;

drop policy if exists "Anyone can read achievement definitions" on achievements;
create policy "Anyone can read achievement definitions"
on achievements for select
to anon, authenticated
using (true);

drop policy if exists "Users can view own achievement unlocks" on user_achievements;
create policy "Users can view own achievement unlocks"
on user_achievements for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function award_user_achievement(target_user_id uuid, target_achievement_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
begin
  if target_user_id is null or target_achievement_id is null then
    return false;
  end if;

  insert into user_achievements (user_id, achievement_id)
  values (target_user_id, target_achievement_id)
  on conflict do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count > 0;
end;
$$;

revoke all on function award_user_achievement(uuid, text) from public;
revoke all on function award_user_achievement(uuid, text) from anon;
revoke all on function award_user_achievement(uuid, text) from authenticated;
grant execute on function award_user_achievement(uuid, text) to service_role;

grant select on achievements to anon, authenticated;
grant select on user_achievements to authenticated;
revoke insert, update, delete on user_achievements from anon, authenticated;
