-- SecurePlus internal feedback reporting.
-- Run this in Supabase SQL Editor.

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

alter table app_admins enable row level security;
alter table feedback_reports enable row level security;

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

do $$
begin
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
end $$;

create index if not exists feedback_reports_created_at_idx
on feedback_reports (created_at desc);

create index if not exists feedback_reports_status_created_at_idx
on feedback_reports (status, created_at desc);

create index if not exists feedback_reports_question_idx
on feedback_reports (question_kind, question_id);

grant select on app_admins to authenticated;
grant select, insert, update on feedback_reports to authenticated;
