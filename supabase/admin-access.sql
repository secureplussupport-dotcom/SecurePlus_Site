-- SecurePlus admin access bootstrap.
-- Run this in the Supabase SQL Editor after schema.sql, or anytime you need to
-- restore the main owner account's admin marker and permanent Pro profile tier.

create table if not exists public.app_admins (
  email text primary key,
  created_at timestamptz default now(),
  check (position('@' in email) > 1)
);

insert into public.app_admins (email)
values ('secureplus.support@gmail.com')
on conflict (email) do nothing;

alter table public.app_admins enable row level security;

drop policy if exists "Admins can view own admin marker" on public.app_admins;
create policy "Admins can view own admin marker"
on public.app_admins
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

grant select on public.app_admins to authenticated;
grant select on public.app_admins to service_role;

update public.profiles
set tier = 'pro',
    subscription_status = coalesce(nullif(subscription_status, ''), 'admin_permanent'),
    updated_at = now()
where lower(email) = lower('secureplus.support@gmail.com');
