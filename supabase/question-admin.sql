-- SecurePlus admin question manager.
-- Run this in Supabase SQL Editor after supabase/feedback.sql, or run it alone.

create table if not exists app_admins (
  email text primary key,
  created_at timestamptz default now(),
  check (position('@' in email) > 1)
);

insert into app_admins (email)
values ('secureplus.support@gmail.com')
on conflict (email) do nothing;

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

alter table question_overrides
add column if not exists sort_order integer;

alter table app_admins enable row level security;
alter table question_overrides enable row level security;

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

do $$
begin
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
      length(question_id) between 1 and 80
      and (sort_order is null or sort_order between 1 and 10000)
      and jsonb_typeof(payload) = 'object'
      and octet_length(payload::text) <= 30000
    );
  end if;
end $$;

create index if not exists question_overrides_status_idx
on question_overrides (status, question_kind);

create index if not exists question_overrides_updated_at_idx
on question_overrides (updated_at desc);

grant select on question_overrides to anon, authenticated;
grant insert, update, delete on question_overrides to authenticated;
grant select on app_admins to authenticated;
