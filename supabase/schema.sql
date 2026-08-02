-- SecurePlus Supabase schema and security policies.
-- Run in Supabase SQL Editor for a new project, then run pbqs.sql and
-- cipher-coins.sql. The latter replaces the legacy referral-trial function
-- below with the current +100 Cipher Coin referral reward.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_id varchar(50) not null default 'default-cipher',
  tier text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  subscription_cancel_at_period_end boolean not null default false,
  subscription_current_period_end timestamptz,
  referral_code text,
  pro_trial_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text,
add column if not exists subscription_status text,
add column if not exists subscription_cancel_at_period_end boolean not null default false,
add column if not exists subscription_current_period_end timestamptz,
add column if not exists referral_code text,
add column if not exists pro_trial_until timestamptz,
add column if not exists full_name text,
add column if not exists avatar_id varchar(50) not null default 'default-cipher';

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
  sort_order integer,
  status text not null default 'active',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (question_kind, question_id)
);

create table if not exists question_override_history (
  id uuid primary key default gen_random_uuid(),
  question_kind text not null,
  question_id text not null,
  change_type text not null,
  previous_override jsonb,
  next_override jsonb,
  changed_by uuid references auth.users(id) on delete set null,
  changed_by_email text,
  created_at timestamptz default now()
);

alter table question_overrides
add column if not exists sort_order integer;

alter table profiles enable row level security;
alter table attempts enable row level security;
alter table referrals enable row level security;
alter table starred_questions enable row level security;
alter table app_admins enable row level security;
alter table feedback_reports enable row level security;
alter table question_overrides enable row level security;
alter table question_override_history enable row level security;

drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can update own academy identity" on profiles;
create policy "Users can update own academy identity"
on profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke update on profiles from anon;
revoke update on profiles from authenticated;
grant update (full_name, avatar_id) on profiles to authenticated;

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

drop policy if exists "Admins can view question override history" on question_override_history;
create policy "Admins can view question override history"
on question_override_history for select
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
  insert into public.profiles (id, email, full_name, avatar_id, tier, referral_code)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')), ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'avatar_id'), ''), 'default-cipher'),
    'free',
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  )
  on conflict (id) do update
  set full_name = coalesce(excluded.full_name, profiles.full_name),
      avatar_id = coalesce(excluded.avatar_id, profiles.avatar_id),
      updated_at = now();

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
      and (sort_order is null or sort_order between 1 and 10000)
      and pg_column_size(payload) <= 50000
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'question_override_history_kind_check') then
    alter table question_override_history
    add constraint question_override_history_kind_check
    check (question_kind in ('mcq', 'pbq'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'question_override_history_change_type_check') then
    alter table question_override_history
    add constraint question_override_history_change_type_check
    check (change_type in ('add', 'change', 'delete', 'revert'));
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

create or replace function public.claim_referral_reward(
  referred_account_id uuid,
  raw_referral_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_referral_code text;
  referrer_profile profiles%rowtype;
  referred_profile profiles%rowtype;
  existing_referral referrals%rowtype;
  referrer_existing_referral referrals%rowtype;
  referred_trial_until timestamptz;
  referrer_trial_until timestamptz;
  referrer_has_paid_pro boolean;
begin
  clean_referral_code := upper(
    left(
      regexp_replace(coalesce(raw_referral_code, ''), '[^A-Za-z0-9_-]', '', 'g'),
      32
    )
  );

  if referred_account_id is null then
    return jsonb_build_object('ok', false, 'error', 'Missing referred user.');
  end if;

  if clean_referral_code = '' then
    return jsonb_build_object('ok', false, 'error', 'Referral code is required.');
  end if;

  select *
  into referrer_profile
  from profiles
  where referral_code = clean_referral_code
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Referral code was not found.');
  end if;

  if referrer_profile.id = referred_account_id then
    return jsonb_build_object('ok', false, 'error', 'You cannot use your own referral code.');
  end if;

  select *
  into existing_referral
  from referrals
  where referred_user_id = referred_account_id;

  if found then
    select *
    into referred_profile
    from profiles
    where id = referred_account_id;

    return jsonb_build_object(
      'ok', true,
      'alreadyClaimed', true,
      'proTrialUntil', referred_profile.pro_trial_until
    );
  end if;

  select *
  into referrer_existing_referral
  from referrals
  where referrer_id = referrer_profile.id;

  if found then
    return jsonb_build_object('ok', false, 'error', 'This referral code has already been used.');
  end if;

  select *
  into referred_profile
  from profiles
  where id = referred_account_id
  for update;

  if not found then
    insert into profiles (id, email, tier, referral_code)
    values (
      referred_account_id,
      '',
      'free',
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
    )
    returning * into referred_profile;
  end if;

  referred_trial_until := greatest(
    coalesce(referred_profile.pro_trial_until, now()),
    now()
  ) + interval '7 days';

  referrer_has_paid_pro :=
    referrer_profile.tier = 'pro'
    and coalesce(referrer_profile.subscription_status, '') in ('active', 'trialing');

  if not referrer_has_paid_pro then
    referrer_trial_until := greatest(
      coalesce(referrer_profile.pro_trial_until, now()),
      now()
    ) + interval '7 days';
  end if;

  insert into referrals (referrer_id, referred_user_id, referral_code, status)
  values (
    referrer_profile.id,
    referred_account_id,
    clean_referral_code,
    case
      when referrer_has_paid_pro then 'referred_trial_granted'
      else 'trial_granted'
    end
  );

  update profiles
  set
    pro_trial_until = referred_trial_until,
    updated_at = now()
  where id = referred_account_id;

  if not referrer_has_paid_pro then
    update profiles
    set
      pro_trial_until = referrer_trial_until,
      updated_at = now()
    where id = referrer_profile.id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'trialDays', 7,
    'proTrialUntil', referred_trial_until,
    'referrerRewardGranted', not referrer_has_paid_pro
  );
exception
  when unique_violation then
    return jsonb_build_object(
      'ok', false,
      'error', 'This referral reward has already been claimed.'
    );
end;
$$;

revoke all on function public.claim_referral_reward(uuid, text) from public;
revoke all on function public.claim_referral_reward(uuid, text) from anon;
revoke all on function public.claim_referral_reward(uuid, text) from authenticated;
grant execute on function public.claim_referral_reward(uuid, text) to service_role;

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

create index if not exists question_override_history_created_at_idx
on question_override_history (created_at desc);

create index if not exists question_override_history_question_idx
on question_override_history (question_kind, question_id, created_at desc);

grant select on app_admins to authenticated;
grant select, insert, update on feedback_reports to authenticated;
grant select on question_overrides to anon, authenticated;
grant insert, update, delete on question_overrides to authenticated;
grant select on question_override_history to authenticated;
grant all on question_overrides to service_role;
grant all on question_override_history to service_role;
grant select on app_admins to service_role;

-- Global mascot placements managed from the root-only Mascot Manager.
create table if not exists mascot_placements (
  page_key text primary key,
  enabled boolean not null default false,
  animation text not null default 'idle',
  anchor text not null default 'bottom-right',
  size integer not null default 112,
  speed text not null default 'normal',
  x_offset integer not null default 0,
  y_offset integer not null default 0,
  message text not null default '',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (page_key in ('dashboard','mcq','pbq','exam','daily','pricing','objectives')),
  check (animation in ('idle','blink','correct','wrong','unlock','streak','thinking','tip')),
  check (anchor in ('top-left','top-center','top-right','middle-left','middle-center','middle-right','bottom-left','bottom-center','bottom-right')),
  check (size between 64 and 180),
  check (speed in ('slow','normal','fast')),
  check (x_offset between -120 and 120),
  check (y_offset between -120 and 120),
  check (char_length(message) <= 120)
);

alter table mascot_placements enable row level security;

drop policy if exists "Visitors can read published mascot placements" on mascot_placements;
create policy "Visitors can read published mascot placements"
on mascot_placements for select
to anon, authenticated
using (enabled = true);

drop policy if exists "Admins can read all mascot placements" on mascot_placements;
create policy "Admins can read all mascot placements"
on mascot_placements for select
to authenticated
using (
  exists (
    select 1 from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Admins can insert mascot placements" on mascot_placements;
create policy "Admins can insert mascot placements"
on mascot_placements for insert
to authenticated
with check (
  exists (
    select 1 from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  and updated_by = (select auth.uid())
);

drop policy if exists "Admins can update mascot placements" on mascot_placements;
create policy "Admins can update mascot placements"
on mascot_placements for update
to authenticated
using (
  exists (
    select 1 from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1 from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  and updated_by = (select auth.uid())
);

create index if not exists mascot_placements_enabled_idx
on mascot_placements (enabled, page_key);

grant select on mascot_placements to anon, authenticated;
grant insert, update on mascot_placements to authenticated;
grant all on mascot_placements to service_role;

-- Short-lived, single-use account deletion confirmations. Browser clients have
-- no direct access; only authenticated server routes using service_role may use it.
create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  email_delivery_id text,
  created_at timestamptz not null default now(),
  check (char_length(token_hash) = 64),
  check (expires_at > created_at)
);

alter table public.account_deletion_requests
  add column if not exists email_delivery_id text,
  add column if not exists used_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

create index if not exists account_deletion_requests_user_created_idx
  on public.account_deletion_requests (user_id, created_at desc);

create unique index if not exists account_deletion_requests_one_pending_idx
  on public.account_deletion_requests (user_id)
  where used_at is null;

create index if not exists account_deletion_requests_expiry_idx
  on public.account_deletion_requests (expires_at)
  where used_at is null;

alter table public.account_deletion_requests enable row level security;
revoke all on table public.account_deletion_requests from anon, authenticated;
revoke all on table public.account_deletion_requests from public;
grant usage on schema public to service_role;
grant all on table public.account_deletion_requests to service_role;
notify pgrst, 'reload schema';
