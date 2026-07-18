-- SecurePlus Cipher Coin economy.
-- Run this in Supabase SQL Editor after supabase/schema.sql.
-- The PBQ table is bootstrapped below when pbqs.sql has not been run yet, so
-- this migration is safe for both existing and newly created projects.
-- Balance mutations run only through service-role functions or trusted database
-- triggers, and every change is recorded in an immutable ledger.

create table if not exists public.pbqs (
  id text primary key,
  title text not null,
  type text not null,
  domain integer not null,
  is_pro boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pbqs
add column if not exists is_pro boolean not null default true,
add column if not exists payload jsonb not null default '{}'::jsonb,
add column if not exists created_at timestamptz not null default now(),
add column if not exists updated_at timestamptz not null default now();

alter table public.pbqs enable row level security;

grant select on public.pbqs to anon, authenticated;
grant insert, update, delete on public.pbqs to authenticated;

create index if not exists pbqs_type_idx on public.pbqs (type);
create index if not exists pbqs_domain_idx on public.pbqs (domain);
create index if not exists pbqs_is_pro_idx on public.pbqs (is_pro);

alter table public.profiles
add column if not exists cipher_coins integer not null default 0,
add column if not exists lifetime_cipher_coins integer not null default 0,
add column if not exists exam_passes integer not null default 0;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_cipher_coins_check') then
    alter table public.profiles
    add constraint profiles_cipher_coins_check
    check (cipher_coins >= 0 and cipher_coins <= 1000000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_lifetime_cipher_coins_check') then
    alter table public.profiles
    add constraint profiles_lifetime_cipher_coins_check
    check (lifetime_cipher_coins >= 0 and lifetime_cipher_coins <= 10000000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_exam_passes_check') then
    alter table public.profiles
    add constraint profiles_exam_passes_check
    check (exam_passes >= 0 and exam_passes <= 1000);
  end if;
end $$;

create table if not exists public.cipher_coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount <> 0 and amount between -10000 and 10000),
  balance_after integer not null check (balance_after >= 0),
  event_type text not null,
  reference_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, reference_key)
);

create table if not exists public.cipher_coin_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  unlock_type text not null check (unlock_type in ('pbq', 'exam_pass')),
  resource_id text not null,
  coin_cost integer not null check (coin_cost > 0),
  unlocked_at timestamptz not null default now(),
  consumed_at timestamptz,
  unique (user_id, unlock_type, resource_id)
);

create table if not exists public.cipher_coin_daily_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  checked_in_at timestamptz,
  check_in_streak integer not null default 0 check (check_in_streak >= 0),
  challenge_completed_at timestamptz,
  challenge_score integer,
  challenge_total integer,
  challenge_streak integer not null default 0 check (challenge_streak >= 0),
  primary key (user_id, activity_date),
  check (
    challenge_score is null
    or (
      challenge_total between 1 and 20
      and challenge_score between 0 and challenge_total
    )
  )
);

alter table public.cipher_coin_transactions enable row level security;
alter table public.cipher_coin_unlocks enable row level security;
alter table public.cipher_coin_daily_activity enable row level security;

drop policy if exists "Users can view own Cipher Coin transactions" on public.cipher_coin_transactions;
create policy "Users can view own Cipher Coin transactions"
on public.cipher_coin_transactions for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can view own Cipher Coin unlocks" on public.cipher_coin_unlocks;
create policy "Users can view own Cipher Coin unlocks"
on public.cipher_coin_unlocks for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can view own Cipher Coin activity" on public.cipher_coin_daily_activity;
create policy "Users can view own Cipher Coin activity"
on public.cipher_coin_daily_activity for select
to authenticated
using ((select auth.uid()) = user_id);

grant select on public.cipher_coin_transactions to authenticated;
grant select on public.cipher_coin_unlocks to authenticated;
grant select on public.cipher_coin_daily_activity to authenticated;
revoke insert, update, delete on public.cipher_coin_transactions from anon, authenticated;
revoke insert, update, delete on public.cipher_coin_unlocks from anon, authenticated;
revoke insert, update, delete on public.cipher_coin_daily_activity from anon, authenticated;

create index if not exists cipher_coin_transactions_user_created_idx
on public.cipher_coin_transactions (user_id, created_at desc);

create index if not exists cipher_coin_transactions_event_created_idx
on public.cipher_coin_transactions (user_id, event_type, created_at desc);

create index if not exists cipher_coin_unlocks_user_type_idx
on public.cipher_coin_unlocks (user_id, unlock_type, consumed_at);

create or replace function public.award_cipher_coins(
  target_user_id uuid,
  reward_amount integer,
  reward_event_type text,
  reward_reference_key text,
  reward_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance integer;
  next_balance integer;
  existing_transaction public.cipher_coin_transactions%rowtype;
begin
  if target_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'Missing user.');
  end if;

  if reward_amount < 1 or reward_amount > 1000 then
    return jsonb_build_object('ok', false, 'error', 'Invalid Cipher Coin reward.');
  end if;

  if reward_event_type not in (
    'onboarding_welcome',
    'daily_check_in',
    'daily_challenge',
    'daily_challenge_streak',
    'perfect_mcq',
    'referral_referrer',
    'referral_new_user',
    'admin_adjustment'
  ) then
    return jsonb_build_object('ok', false, 'error', 'Invalid reward type.');
  end if;

  if length(trim(coalesce(reward_reference_key, ''))) not between 3 and 160 then
    return jsonb_build_object('ok', false, 'error', 'Invalid reward reference.');
  end if;

  select *
  into existing_transaction
  from public.cipher_coin_transactions
  where user_id = target_user_id
    and reference_key = reward_reference_key;

  if found then
    return jsonb_build_object(
      'ok', true,
      'awarded', false,
      'amount', 0,
      'balance', existing_transaction.balance_after,
      'reason', 'already_claimed'
    );
  end if;

  select cipher_coins
  into current_balance
  from public.profiles
  where id = target_user_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Profile not found.');
  end if;

  next_balance := current_balance + reward_amount;

  update public.profiles
  set cipher_coins = next_balance,
      lifetime_cipher_coins = lifetime_cipher_coins + reward_amount,
      updated_at = now()
  where id = target_user_id;

  insert into public.cipher_coin_transactions (
    user_id,
    amount,
    balance_after,
    event_type,
    reference_key,
    metadata
  ) values (
    target_user_id,
    reward_amount,
    next_balance,
    reward_event_type,
    reward_reference_key,
    coalesce(reward_metadata, '{}'::jsonb)
  );

  return jsonb_build_object(
    'ok', true,
    'awarded', true,
    'amount', reward_amount,
    'balance', next_balance
  );
exception
  when unique_violation then
    select *
    into existing_transaction
    from public.cipher_coin_transactions
    where user_id = target_user_id
      and reference_key = reward_reference_key;

    return jsonb_build_object(
      'ok', true,
      'awarded', false,
      'amount', 0,
      'balance', coalesce(existing_transaction.balance_after, current_balance),
      'reason', 'already_claimed'
    );
end;
$$;

revoke all on function public.award_cipher_coins(uuid, integer, text, text, jsonb) from public;
revoke all on function public.award_cipher_coins(uuid, integer, text, text, jsonb) from anon;
revoke all on function public.award_cipher_coins(uuid, integer, text, text, jsonb) from authenticated;
grant execute on function public.award_cipher_coins(uuid, integer, text, text, jsonb) to service_role;

-- Every profile created after this economy is installed receives one welcome
-- grant. The ledger reference makes the reward idempotent, even if profile
-- creation is retried by an authentication callback.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.grant_new_user_cipher_welcome()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.award_cipher_coins(
    new.id,
    150,
    'onboarding_welcome',
    'onboarding_welcome:' || new.id::text,
    jsonb_build_object('source', 'academy_onboarding')
  );
  return new;
end;
$$;

revoke all on function private.grant_new_user_cipher_welcome() from public, anon, authenticated;

drop trigger if exists grant_new_user_cipher_welcome on public.profiles;
create trigger grant_new_user_cipher_welcome
after insert on public.profiles
for each row execute function private.grant_new_user_cipher_welcome();

create or replace function public.claim_cipher_daily_check_in(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  today_date date := (now() at time zone 'utc')::date;
  yesterday_date date := ((now() at time zone 'utc')::date - 1);
  previous_streak integer := 0;
  next_streak integer := 1;
  reward_amount integer := 5;
  reward_result jsonb;
  already_checked_in boolean := false;
begin
  if target_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'Missing user.');
  end if;

  select checked_in_at is not null
  into already_checked_in
  from public.cipher_coin_daily_activity
  where user_id = target_user_id
    and activity_date = today_date;

  if coalesce(already_checked_in, false) then
    select check_in_streak
    into next_streak
    from public.cipher_coin_daily_activity
    where user_id = target_user_id
      and activity_date = today_date;

    return jsonb_build_object(
      'ok', true,
      'awarded', false,
      'amount', 0,
      'streak', next_streak,
      'reason', 'already_claimed'
    );
  end if;

  select check_in_streak
  into previous_streak
  from public.cipher_coin_daily_activity
  where user_id = target_user_id
    and activity_date = yesterday_date
    and checked_in_at is not null;

  if found then
    next_streak := coalesce(previous_streak, 0) + 1;
  end if;

  if next_streak % 7 = 0 then
    reward_amount := 10;
  end if;

  insert into public.cipher_coin_daily_activity (
    user_id,
    activity_date,
    checked_in_at,
    check_in_streak
  ) values (
    target_user_id,
    today_date,
    now(),
    next_streak
  )
  on conflict (user_id, activity_date) do update
  set checked_in_at = coalesce(public.cipher_coin_daily_activity.checked_in_at, excluded.checked_in_at),
      check_in_streak = greatest(public.cipher_coin_daily_activity.check_in_streak, excluded.check_in_streak);

  reward_result := public.award_cipher_coins(
    target_user_id,
    reward_amount,
    'daily_check_in',
    'daily_check_in:' || today_date::text,
    jsonb_build_object('streak', next_streak, 'activityDate', today_date)
  );

  return reward_result || jsonb_build_object('streak', next_streak);
end;
$$;

revoke all on function public.claim_cipher_daily_check_in(uuid) from public;
revoke all on function public.claim_cipher_daily_check_in(uuid) from anon;
revoke all on function public.claim_cipher_daily_check_in(uuid) from authenticated;
grant execute on function public.claim_cipher_daily_check_in(uuid) to service_role;

create or replace function public.record_cipher_daily_challenge(
  target_user_id uuid,
  submitted_score integer,
  submitted_total integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  today_date date := (now() at time zone 'utc')::date;
  yesterday_date date := ((now() at time zone 'utc')::date - 1);
  prior_streak integer := 0;
  next_streak integer := 0;
  current_balance integer := 0;
  total_reward integer := 0;
  perfect_result jsonb := '{}'::jsonb;
  milestone_result jsonb := '{}'::jsonb;
  prior_completion timestamptz;
begin
  if target_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'Missing user.');
  end if;

  if submitted_total < 1 or submitted_total > 20 or submitted_score < 0 or submitted_score > submitted_total then
    return jsonb_build_object('ok', false, 'error', 'Invalid challenge result.');
  end if;

  select challenge_completed_at
  into prior_completion
  from public.cipher_coin_daily_activity
  where user_id = target_user_id
    and activity_date = today_date;

  if prior_completion is not null then
    select cipher_coins into current_balance from public.profiles where id = target_user_id;
    return jsonb_build_object(
      'ok', true,
      'awarded', false,
      'amount', 0,
      'balance', coalesce(current_balance, 0),
      'reason', 'already_recorded'
    );
  end if;

  if submitted_score * 5 >= submitted_total * 3 then
    select challenge_streak
    into prior_streak
    from public.cipher_coin_daily_activity
    where user_id = target_user_id
      and activity_date = yesterday_date
      and challenge_completed_at is not null;

    next_streak := case when found then coalesce(prior_streak, 0) + 1 else 1 end;
  end if;

  insert into public.cipher_coin_daily_activity (
    user_id,
    activity_date,
    challenge_completed_at,
    challenge_score,
    challenge_total,
    challenge_streak
  ) values (
    target_user_id,
    today_date,
    now(),
    submitted_score,
    submitted_total,
    next_streak
  )
  on conflict (user_id, activity_date) do update
  set challenge_completed_at = coalesce(public.cipher_coin_daily_activity.challenge_completed_at, excluded.challenge_completed_at),
      challenge_score = coalesce(public.cipher_coin_daily_activity.challenge_score, excluded.challenge_score),
      challenge_total = coalesce(public.cipher_coin_daily_activity.challenge_total, excluded.challenge_total),
      challenge_streak = greatest(public.cipher_coin_daily_activity.challenge_streak, excluded.challenge_streak);

  if submitted_score = submitted_total then
    perfect_result := public.award_cipher_coins(
      target_user_id,
      5,
      'daily_challenge',
      'daily_challenge:' || today_date::text,
      jsonb_build_object('score', submitted_score, 'total', submitted_total)
    );
    if coalesce((perfect_result ->> 'awarded')::boolean, false) then
      total_reward := total_reward + 5;
    end if;
  end if;

  if next_streak > 0 and next_streak % 5 = 0 then
    milestone_result := public.award_cipher_coins(
      target_user_id,
      5,
      'daily_challenge_streak',
      'daily_challenge_streak:' || next_streak::text,
      jsonb_build_object('streak', next_streak, 'activityDate', today_date)
    );
    if coalesce((milestone_result ->> 'awarded')::boolean, false) then
      total_reward := total_reward + 5;
    end if;
  end if;

  select cipher_coins into current_balance from public.profiles where id = target_user_id;

  return jsonb_build_object(
    'ok', true,
    'awarded', total_reward > 0,
    'amount', total_reward,
    'balance', coalesce(current_balance, 0),
    'streak', next_streak,
    'perfectReward', coalesce((perfect_result ->> 'awarded')::boolean, false),
    'milestoneReward', coalesce((milestone_result ->> 'awarded')::boolean, false)
  );
end;
$$;

revoke all on function public.record_cipher_daily_challenge(uuid, integer, integer) from public;
revoke all on function public.record_cipher_daily_challenge(uuid, integer, integer) from anon;
revoke all on function public.record_cipher_daily_challenge(uuid, integer, integer) from authenticated;
grant execute on function public.record_cipher_daily_challenge(uuid, integer, integer) to service_role;

create or replace function public.purchase_cipher_coin_item(
  target_user_id uuid,
  requested_item_type text,
  requested_resource_id text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance integer;
  next_balance integer;
  item_cost integer;
  unlock_resource_id text;
  transaction_reference text;
begin
  if target_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'Missing user.');
  end if;

  if requested_item_type not in ('pbq', 'exam_pass') then
    return jsonb_build_object('ok', false, 'error', 'Unknown Cipher Coin item.');
  end if;

  -- Lock the wallet before choosing a PBQ so rapid double taps cannot reveal
  -- two different random questions in parallel.
  select cipher_coins
  into current_balance
  from public.profiles
  where id = target_user_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Profile not found.');
  end if;

  if requested_item_type = 'pbq' then
    item_cost := 50;

    -- The first three reveals follow a shared learning path. Once these are
    -- owned, later purchases reveal a random locked Pro PBQ.
    select preferred.id
    into unlock_resource_id
    from unnest(array['p014', 'p018', 'p033']::text[]) with ordinality as preferred(id, position)
    where not exists (
      select 1
      from public.cipher_coin_unlocks
      where cipher_coin_unlocks.user_id = target_user_id
        and cipher_coin_unlocks.unlock_type = 'pbq'
        and cipher_coin_unlocks.resource_id = preferred.id
    )
    order by preferred.position
    limit 1;

    if unlock_resource_id is null then
      select candidates.id
      into unlock_resource_id
      from (
        select pbqs.id
        from public.pbqs
        where pbqs.is_pro = true
        union
        select 'p' || lpad(series.value::text, 3, '0')
        from generate_series(2, 50) as series(value)
      ) as candidates
      where candidates.id <> 'p001'
        and not exists (
          select 1
          from public.cipher_coin_unlocks
          where cipher_coin_unlocks.user_id = target_user_id
            and cipher_coin_unlocks.unlock_type = 'pbq'
            and cipher_coin_unlocks.resource_id = candidates.id
        )
      order by random()
      limit 1;
    end if;

    if unlock_resource_id is null then
      return jsonb_build_object('ok', false, 'error', 'Every available PBQ is already unlocked.');
    end if;

    transaction_reference := 'pbq_unlock:' || unlock_resource_id;
  elsif requested_item_type = 'exam_pass' then
    item_cost := 70;
    unlock_resource_id := gen_random_uuid()::text;
    transaction_reference := 'exam_pass_purchase:' || unlock_resource_id;
  end if;

  -- Keep the ownership check as a defensive guard for accounts migrated from
  -- earlier versions of the economy.
  if requested_item_type = 'pbq' and exists (
    select 1
    from public.cipher_coin_unlocks
    where user_id = target_user_id
      and unlock_type = 'pbq'
      and resource_id = unlock_resource_id
  ) then
    return jsonb_build_object(
      'ok', true,
      'purchased', false,
      'alreadyOwned', true,
      'balance', current_balance,
      'resourceId', unlock_resource_id
    );
  end if;

  if current_balance < item_cost then
    return jsonb_build_object(
      'ok', false,
      'error', 'Not enough Cipher Coins.',
      'required', item_cost,
      'balance', current_balance
    );
  end if;

  next_balance := current_balance - item_cost;

  update public.profiles
  set cipher_coins = next_balance,
      exam_passes = exam_passes + case when requested_item_type = 'exam_pass' then 1 else 0 end,
      updated_at = now()
  where id = target_user_id;

  insert into public.cipher_coin_unlocks (
    user_id,
    unlock_type,
    resource_id,
    coin_cost
  ) values (
    target_user_id,
    requested_item_type,
    unlock_resource_id,
    item_cost
  );

  insert into public.cipher_coin_transactions (
    user_id,
    amount,
    balance_after,
    event_type,
    reference_key,
    metadata
  ) values (
    target_user_id,
    -item_cost,
    next_balance,
    case when requested_item_type = 'pbq' then 'pbq_unlock' else 'exam_pass_purchase' end,
    transaction_reference,
    jsonb_build_object('itemType', requested_item_type, 'resourceId', unlock_resource_id)
  );

  return jsonb_build_object(
    'ok', true,
    'purchased', true,
    'cost', item_cost,
    'balance', next_balance,
    'itemType', requested_item_type,
    'resourceId', unlock_resource_id
  );
end;
$$;

revoke all on function public.purchase_cipher_coin_item(uuid, text, text) from public;
revoke all on function public.purchase_cipher_coin_item(uuid, text, text) from anon;
revoke all on function public.purchase_cipher_coin_item(uuid, text, text) from authenticated;
grant execute on function public.purchase_cipher_coin_item(uuid, text, text) to service_role;

create or replace function public.consume_cipher_exam_pass(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  pass_row public.cipher_coin_unlocks%rowtype;
  remaining_passes integer := 0;
begin
  select *
  into pass_row
  from public.cipher_coin_unlocks
  where user_id = target_user_id
    and unlock_type = 'exam_pass'
    and consumed_at is null
  order by unlocked_at asc
  limit 1
  for update skip locked;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'No practice exam vouchers are available.');
  end if;

  update public.cipher_coin_unlocks
  set consumed_at = now()
  where id = pass_row.id;

  update public.profiles
  set exam_passes = greatest(0, exam_passes - 1),
      updated_at = now()
  where id = target_user_id
  returning exam_passes into remaining_passes;

  return jsonb_build_object(
    'ok', true,
    'consumed', true,
    'remainingPasses', remaining_passes
  );
end;
$$;

revoke all on function public.consume_cipher_exam_pass(uuid) from public;
revoke all on function public.consume_cipher_exam_pass(uuid) from anon;
revoke all on function public.consume_cipher_exam_pass(uuid) from authenticated;
grant execute on function public.consume_cipher_exam_pass(uuid) to service_role;

-- Let free users fetch PBQs they permanently unlocked with Cipher Coins.
drop policy if exists "Free PBQs or Pro users can read PBQs" on public.pbqs;
drop policy if exists "Public users can read free PBQs" on public.pbqs;

create policy "Public users can read free PBQs"
on public.pbqs for select
to anon
using (is_pro = false);

create policy "Free PBQs or Pro users can read PBQs"
on public.pbqs for select
to authenticated
using (
  is_pro = false
  or exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and (
        profiles.tier = 'pro'
        or profiles.pro_trial_until > now()
        or coalesce(profiles.subscription_status, '') in ('active', 'trialing')
      )
  )
  or exists (
    select 1
    from public.cipher_coin_unlocks
    where cipher_coin_unlocks.user_id = (select auth.uid())
      and cipher_coin_unlocks.unlock_type = 'pbq'
      and cipher_coin_unlocks.resource_id = pbqs.id
  )
);

drop policy if exists "Question admins can read PBQs" on public.pbqs;
create policy "Question admins can read PBQs"
on public.pbqs for select
to authenticated
using (
  exists (
    select 1
    from public.app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Question admins can insert PBQs" on public.pbqs;
create policy "Question admins can insert PBQs"
on public.pbqs for insert
to authenticated
with check (
  exists (
    select 1
    from public.app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Question admins can update PBQs" on public.pbqs;
create policy "Question admins can update PBQs"
on public.pbqs for update
to authenticated
using (
  exists (
    select 1
    from public.app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Question admins can delete PBQs" on public.pbqs;
create policy "Question admins can delete PBQs"
on public.pbqs for delete
to authenticated
using (
  exists (
    select 1
    from public.app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

-- The old 7-day Pro referral trial is replaced by +100 Cipher Coins for each person.
drop index if exists public.referrals_one_new_user_per_referrer_idx;

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
  referrer_profile public.profiles%rowtype;
  referred_profile public.profiles%rowtype;
  existing_referral public.referrals%rowtype;
  referred_reward jsonb;
  referrer_reward jsonb;
  referred_balance integer := 0;
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
  from public.profiles
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
  from public.referrals
  where referred_user_id = referred_account_id;

  if found then
    select cipher_coins into referred_balance from public.profiles where id = referred_account_id;
    return jsonb_build_object(
      'ok', true,
      'alreadyClaimed', true,
      'coinsAwarded', 0,
      'cipherCoins', coalesce(referred_balance, 0)
    );
  end if;

  select *
  into referred_profile
  from public.profiles
  where id = referred_account_id
  for update;

  if not found then
    insert into public.profiles (id, email, tier, referral_code)
    values (
      referred_account_id,
      '',
      'free',
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
    )
    returning * into referred_profile;
  end if;

  insert into public.referrals (referrer_id, referred_user_id, referral_code, status)
  values (referrer_profile.id, referred_account_id, clean_referral_code, 'coins_granted');

  referred_reward := public.award_cipher_coins(
    referred_account_id,
    100,
    'referral_new_user',
    'referral:new_user:' || referred_account_id::text,
    jsonb_build_object('referrerId', referrer_profile.id)
  );

  referrer_reward := public.award_cipher_coins(
    referrer_profile.id,
    100,
    'referral_referrer',
    'referral:referrer:' || referred_account_id::text,
    jsonb_build_object('referredUserId', referred_account_id)
  );

  select cipher_coins into referred_balance from public.profiles where id = referred_account_id;

  return jsonb_build_object(
    'ok', true,
    'coinsAwarded', case when coalesce((referred_reward ->> 'awarded')::boolean, false) then 100 else 0 end,
    'cipherCoins', coalesce(referred_balance, 0),
    'referrerRewardGranted', coalesce((referrer_reward ->> 'awarded')::boolean, false)
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
