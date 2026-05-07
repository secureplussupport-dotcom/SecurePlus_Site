-- SecurePlus Supabase schema and security policies.
-- Run in Supabase SQL Editor for a new project.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  tier text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
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

alter table profiles enable row level security;
alter table attempts enable row level security;

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, tier)
  values (new.id, new.email, 'free')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

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
      or subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')
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
end $$;

create index if not exists profiles_stripe_customer_id_idx
on profiles (stripe_customer_id);

create index if not exists profiles_stripe_subscription_id_idx
on profiles (stripe_subscription_id);

create index if not exists attempts_user_id_created_at_idx
on attempts (user_id, created_at desc);
