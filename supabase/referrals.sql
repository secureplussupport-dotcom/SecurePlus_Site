-- SecurePlus referral program setup.
-- Run this once in Supabase SQL Editor if the Referrals page says setup is missing.

alter table profiles
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

alter table referrals enable row level security;

drop policy if exists "Users can view own referrals" on referrals;
create policy "Users can view own referrals"
on referrals for select
to authenticated
using (
  auth.uid() is not null
  and (auth.uid() = referrer_id or auth.uid() = referred_user_id)
);

do $$
begin
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
