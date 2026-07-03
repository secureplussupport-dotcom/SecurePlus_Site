-- SecurePlus Supabase schema and security policies.
-- Run in Supabase SQL Editor for a new project.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  tier text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  referral_code text,
  pro_trial_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text,
add column if not exists subscription_status text,
add column if not exists referral_code text,
add column if not exists pro_trial_until timestamptz;

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null references auth.users(id) on delete cascade,
  referral_code text not null,
  status text default 'trial_granted',
  created_at timestamptz default now(),
  unique (referred_user_id)
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  question_type text,
  title text,
  domain text,
  chapter text,
  correct boolean not null,
  score numeric,
  created_at timestamptz default now()
);

create table if not exists starred_questions (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_key text not null,
  question_type text not null,
  question_id text not null,
  created_at timestamptz default now(),
  primary key (user_id, question_key)
);

create table if not exists app_admins (
  email text primary key,
  created_at timestamptz default now(),
  check (position('@' in email) > 1)
);

insert into app_admins (email)
values ('secureplus.support@gmail.com')
on conflict (email) do nothing;

create table if not exists feedback_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  contact_email text,
  question_kind text not null,
  question_id text not null,
  chapter text,
  difficulty text,
  title text not null,
  selected_answer text,
  correct_answer text,
  issue_type text not null default 'other',
  message text not null,
  page_url text,
  user_agent text,
  status text not null default 'open',
  owner_notes text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists question_overrides (
  id uuid primary key default gen_random_uuid(),
  question_kind text not null,
  question_id text not null,
  action text not null default 'upsert',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (question_kind, question_id)
);

alter table profiles enable row level security;
alter table attempts enable row level security;
alter table referrals enable row level security;
alter table starred_questions enable row level security;
alter table app_admins enable row level security;
alter table feedback_reports enable row level security;
alter table question_overrides enable row level security;

drop policy if exists "Users can update own profile" on profiles;

drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
on profiles for select
to authenticated
using (auth.uid() is not null and auth.uid() = id);

drop policy if exists "Users can view own attempts" on attempts;
create policy "Users can view own attempts"
on attempts for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can insert own attempts" on attempts;
create policy "Users can insert own attempts"
on attempts for insert
to authenticated
with check (
  auth.uid() is not null
  and auth.uid() = user_id
  and length(question_id) between 1 and 40
  and (question_type is null or length(question_type) <= 40)
  and (title is null or length(title) <= 200)
  and (domain is null or length(domain) <= 80)
  and (chapter is null or length(chapter) <= 40)
  and (score is null or (score >= 0 and score <= 100))
);

drop policy if exists "Users can view own starred questions" on starred_questions;
create policy "Users can view own starred questions"
on starred_questions for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can insert own starred questions" on starred_questions;
create policy "Users can insert own starred questions"
on starred_questions for insert
to authenticated
with check (
  auth.uid() is not null
  and auth.uid() = user_id
  and question_type in ('mcq', 'pbq')
  and length(question_id) between 1 and 80
  and question_key = question_type || ':' || question_id
);

drop policy if exists "Users can delete own starred questions" on starred_questions;
create policy "Users can delete own starred questions"
on starred_questions for delete
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can view own referrals" on referrals;
create policy "Users can view own referrals"
on referrals for select
to authenticated
using (
  auth.uid() is not null
  and (auth.uid() = referrer_id or auth.uid() = referred_user_id)
);

drop policy if exists "Admins can view own admin marker" on app_admins;
create policy "Admins can view own admin marker"
on app_admins for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Authenticated users can insert own feedback reports" on feedback_reports;
create policy "Authenticated users can insert own feedback reports"
on feedback_reports for insert
to authenticated
with check (
  auth.uid() is not null
  and (user_id is null or user_id = auth.uid())
  and length(question_kind) between 1 and 20
  and length(question_id) between 1 and 80
  and length(title) between 1 and 500
  and length(message) between 20 and 4000
  and status = 'open'
);

drop policy if exists "Admins can view feedback reports" on feedback_reports;
create policy "Admins can view feedback reports"
on feedback_reports for select
to authenticated
using (
  exists (
    select 1
    from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Admins can update feedback reports" on feedback_reports;
create policy "Admins can update feedback reports"
on feedback_reports for update
to authenticated
using (
  exists (
    select 1
    from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  and status in ('open', 'reviewing', 'resolved')
);

drop policy if exists "Anyone can read active question overrides" on question_overrides;
create policy "Anyone can read active question overrides"
on question_overrides for select
to anon, authenticated
using (status = 'active');

drop policy if exists "Admins can insert question overrides" on question_overrides;
create policy "Admins can insert question overrides"
on question_overrides for insert
to authenticated
with check (
  exists (
    select 1
    from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Admins can update question overrides" on question_overrides;
create policy "Admins can update question overrides"
on question_overrides for update
to authenticated
using (
  exists (
    select 1
    from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Admins can delete question overrides" on question_overrides;
create policy "Admins can delete question overrides"
on question_overrides for delete
to authenticated
using (
  exists (
    select 1
    from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, tier, referral_code)
  values (
    new.id,
    new.email,
    'free',
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_tier_check') then
    alter table profiles
    add constraint profiles_tier_check
    check (tier in ('free', 'pro'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_subscription_status_check') then
    alter table profiles
    add constraint profiles_subscription_status_check
    check (
      subscription_status is null
      or subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'attempts_score_check') then
    alter table attempts
    add constraint attempts_score_check
    check (score is null or (score >= 0 and score <= 100));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'attempts_text_size_check') then
    alter table attempts
    add constraint attempts_text_size_check
    check (
      length(question_id) between 1 and 40
      and (question_type is null or length(question_type) <= 40)
      and (title is null or length(title) <= 200)
      and (domain is null or length(domain) <= 80)
      and (chapter is null or length(chapter) <= 40)
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'starred_questions_type_check') then
    alter table starred_questions
    add constraint starred_questions_type_check
    check (
      question_type in ('mcq', 'pbq')
      and length(question_id) between 1 and 80
      and question_key = question_type || ':' || question_id
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'feedback_reports_status_check') then
    alter table feedback_reports
    add constraint feedback_reports_status_check
    check (status in ('open', 'reviewing', 'resolved'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'feedback_reports_issue_type_check') then
    alter table feedback_reports
    add constraint feedback_reports_issue_type_check
    check (
      issue_type in (
        'inaccurate_answer',
        'obvious_answer',
        'confusing_context',
        'typo',
        'bad_explanation',
        'technical_bug',
        'other'
      )
    );
  end if;

  alter table feedback_reports
  drop constraint if exists feedback_reports_size_check;

  alter table feedback_reports
  add constraint feedback_reports_size_check
  check (
    length(question_kind) between 1 and 20
    and length(question_id) between 1 and 80
    and (chapter is null or length(chapter) <= 40)
    and (difficulty is null or length(difficulty) <= 40)
    and length(title) between 1 and 500
    and length(message) between 20 and 4000
    and (page_url is null or length(page_url) <= 900)
    and (user_agent is null or length(user_agent) <= 500)
  );

  if not exists (select 1 from pg_constraint where conname = 'question_overrides_kind_check') then
    alter table question_overrides
    add constraint question_overrides_kind_check
    check (question_kind in ('mcq', 'pbq'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'question_overrides_action_check') then
    alter table question_overrides
    add constraint question_overrides_action_check
    check (action in ('upsert', 'disable'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'question_overrides_status_check') then
    alter table question_overrides
    add constraint question_overrides_status_check
    check (status in ('active', 'archived'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'question_overrides_size_check') then
    alter table question_overrides
    add constraint question_overrides_size_check
    check (
      length(question_id) between 1 and 120
      and pg_column_size(payload) <= 50000
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_referral_code_key') then
    alter table profiles
    add constraint profiles_referral_code_key
    unique (referral_code);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'referrals_no_self_referral_check') then
    alter table referrals
    add constraint referrals_no_self_referral_check
    check (referrer_id <> referred_user_id);
  end if;
end $$;

update profiles
set referral_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
where referral_code is null;

create index if not exists profiles_stripe_customer_id_idx
on profiles (stripe_customer_id);

create index if not exists profiles_stripe_subscription_id_idx
on profiles (stripe_subscription_id);

create index if not exists attempts_user_id_created_at_idx
on attempts (user_id, created_at desc);

create index if not exists starred_questions_user_id_created_at_idx
on starred_questions (user_id, created_at desc);

create index if not exists profiles_referral_code_idx
on profiles (referral_code);

create index if not exists referrals_referrer_id_created_at_idx
on referrals (referrer_id, created_at desc);

create unique index if not exists referrals_one_new_user_per_referrer_idx
on referrals (referrer_id);

create index if not exists feedback_reports_created_at_idx
on feedback_reports (created_at desc);

create index if not exists feedback_reports_status_created_at_idx
on feedback_reports (status, created_at desc);

create index if not exists feedback_reports_question_idx
on feedback_reports (question_kind, question_id);

create index if not exists question_overrides_status_idx
on question_overrides (status, question_kind);

create index if not exists question_overrides_updated_at_idx
on question_overrides (updated_at desc);

grant select on app_admins to authenticated;
grant select, insert, update on feedback_reports to authenticated;
grant select on question_overrides to anon, authenticated;
grant insert, update, delete on question_overrides to authenticated;
