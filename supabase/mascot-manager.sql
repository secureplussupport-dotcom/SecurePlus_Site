-- SecurePlus Mascot Manager.
-- Run this entire file once in Supabase SQL Editor.

create table if not exists public.app_admins (
  email text primary key,
  created_at timestamptz not null default now(),
  check (position('@' in email) > 1)
);

insert into public.app_admins (email)
values ('secureplus.support@gmail.com')
on conflict (email) do nothing;

create table if not exists public.mascot_placements (
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
  constraint mascot_placements_page_check check (
    page_key in ('dashboard','mcq','pbq','exam','daily','pricing','objectives')
  ),
  constraint mascot_placements_animation_check check (
    animation in ('idle','blink','correct','wrong','unlock','streak','thinking','tip')
  ),
  constraint mascot_placements_anchor_check check (
    anchor in (
      'top-left','top-center','top-right',
      'middle-left','middle-center','middle-right',
      'bottom-left','bottom-center','bottom-right'
    )
  ),
  constraint mascot_placements_size_check check (size between 64 and 180),
  constraint mascot_placements_speed_check check (speed in ('slow','normal','fast')),
  constraint mascot_placements_x_offset_check check (x_offset between -120 and 120),
  constraint mascot_placements_y_offset_check check (y_offset between -120 and 120),
  constraint mascot_placements_message_check check (char_length(message) <= 120)
);

alter table public.app_admins enable row level security;
alter table public.mascot_placements enable row level security;

drop policy if exists "Admins can view own admin marker" on public.app_admins;
create policy "Admins can view own admin marker"
on public.app_admins for select
to authenticated
using (
  lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Visitors can read published mascot placements" on public.mascot_placements;
create policy "Visitors can read published mascot placements"
on public.mascot_placements for select
to anon, authenticated
using (enabled = true);

drop policy if exists "Admins can read all mascot placements" on public.mascot_placements;
create policy "Admins can read all mascot placements"
on public.mascot_placements for select
to authenticated
using (
  exists (
    select 1
    from public.app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Admins can insert mascot placements" on public.mascot_placements;
create policy "Admins can insert mascot placements"
on public.mascot_placements for insert
to authenticated
with check (
  exists (
    select 1
    from public.app_admins
    where lower(app_admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  and updated_by = (select auth.uid())
);

drop policy if exists "Admins can update mascot placements" on public.mascot_placements;
create policy "Admins can update mascot placements"
on public.mascot_placements for update
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
  and updated_by = (select auth.uid())
);

create index if not exists mascot_placements_enabled_idx
on public.mascot_placements (enabled, page_key);

grant select on public.app_admins to authenticated;
grant select on public.mascot_placements to anon, authenticated;
grant insert, update on public.mascot_placements to authenticated;
grant all on public.mascot_placements to service_role;
