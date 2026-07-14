-- SecurePlus remote PBQ bank.
-- Run this in Supabase SQL Editor after the base schema.

create table if not exists pbqs (
  id text primary key,
  title text not null,
  type text not null,
  domain integer not null,
  is_pro boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table pbqs
add column if not exists is_pro boolean not null default true,
add column if not exists payload jsonb not null default '{}'::jsonb,
add column if not exists created_at timestamptz not null default now(),
add column if not exists updated_at timestamptz not null default now();

alter table pbqs enable row level security;

grant select on pbqs to anon, authenticated;
grant insert, update, delete on pbqs to authenticated;

drop policy if exists "Free PBQs or Pro users can read PBQs" on pbqs;
create policy "Free PBQs or Pro users can read PBQs"
on pbqs for select
to anon, authenticated
using (
  is_pro = false
  or exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.tier = 'pro'
  )
);

drop policy if exists "Question admins can read PBQs" on pbqs;
create policy "Question admins can read PBQs"
on pbqs for select
to authenticated
using (
  exists (
    select 1
    from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Question admins can insert PBQs" on pbqs;
create policy "Question admins can insert PBQs"
on pbqs for insert
to authenticated
with check (
  exists (
    select 1
    from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Question admins can update PBQs" on pbqs;
create policy "Question admins can update PBQs"
on pbqs for update
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

drop policy if exists "Question admins can delete PBQs" on pbqs;
create policy "Question admins can delete PBQs"
on pbqs for delete
to authenticated
using (
  exists (
    select 1
    from app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

create index if not exists pbqs_type_idx on pbqs (type);
create index if not exists pbqs_domain_idx on pbqs (domain);
create index if not exists pbqs_is_pro_idx on pbqs (is_pro);
