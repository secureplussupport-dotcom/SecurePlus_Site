-- SecurePlus referral program setup.
-- Run this once in Supabase SQL Editor if the Referrals page says setup is missing.

alter table profiles
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
