-- Persist SecurePlus flashcard mastery, generated decks, and preferences.
-- Run this once in the Supabase SQL Editor.

create table if not exists public.flashcard_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  mastered boolean not null default false,
  review_count integer not null default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id),
  constraint flashcard_progress_card_id_check
    check (length(card_id) between 1 and 180),
  constraint flashcard_progress_review_count_check
    check (review_count between 0 and 10000)
);

create table if not exists public.flashcard_generated_decks (
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id text not null,
  title text not null,
  color text,
  default_mode text not null default 'definition',
  include_terms boolean not null default true,
  include_acronyms boolean not null default true,
  card_ids text[] not null,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, deck_id),
  constraint flashcard_generated_decks_id_check
    check (length(deck_id) between 1 and 160),
  constraint flashcard_generated_decks_title_check
    check (length(title) between 1 and 80),
  constraint flashcard_generated_decks_mode_check
    check (default_mode in ('definition', 'acronym', 'example')),
  constraint flashcard_generated_decks_card_ids_check
    check (
      cardinality(card_ids) between 1 and 30
      and length(array_to_string(card_ids, ',')) between 1 and 5400
    ),
  constraint flashcard_generated_decks_color_check
    check (color is null or length(color) <= 32)
);

create table if not exists public.flashcard_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_mode text,
  inventory_visibility jsonb not null default '{"starred":true,"generated":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint flashcard_preferences_mode_check
    check (default_mode is null or default_mode in ('definition', 'acronym', 'example')),
  constraint flashcard_preferences_visibility_check
    check (
      jsonb_typeof(inventory_visibility) = 'object'
      and pg_column_size(inventory_visibility) <= 1000
    )
);

alter table public.flashcard_progress enable row level security;
alter table public.flashcard_generated_decks enable row level security;
alter table public.flashcard_preferences enable row level security;

grant select, insert, update on public.flashcard_progress to authenticated;
grant select, insert, update, delete on public.flashcard_generated_decks to authenticated;
grant select, insert, update on public.flashcard_preferences to authenticated;

drop policy if exists "Users can view own flashcard progress" on public.flashcard_progress;
create policy "Users can view own flashcard progress"
on public.flashcard_progress for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own flashcard progress" on public.flashcard_progress;
create policy "Users can insert own flashcard progress"
on public.flashcard_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own flashcard progress" on public.flashcard_progress;
create policy "Users can update own flashcard progress"
on public.flashcard_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view own generated flashcard decks" on public.flashcard_generated_decks;
create policy "Users can view own generated flashcard decks"
on public.flashcard_generated_decks for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own generated flashcard decks" on public.flashcard_generated_decks;
create policy "Users can insert own generated flashcard decks"
on public.flashcard_generated_decks for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own generated flashcard decks" on public.flashcard_generated_decks;
create policy "Users can update own generated flashcard decks"
on public.flashcard_generated_decks for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own generated flashcard decks" on public.flashcard_generated_decks;
create policy "Users can delete own generated flashcard decks"
on public.flashcard_generated_decks for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can view own flashcard preferences" on public.flashcard_preferences;
create policy "Users can view own flashcard preferences"
on public.flashcard_preferences for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own flashcard preferences" on public.flashcard_preferences;
create policy "Users can insert own flashcard preferences"
on public.flashcard_preferences for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own flashcard preferences" on public.flashcard_preferences;
create policy "Users can update own flashcard preferences"
on public.flashcard_preferences for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists flashcard_progress_user_reviewed_idx
on public.flashcard_progress (user_id, last_reviewed_at desc);

create index if not exists flashcard_generated_decks_user_saved_idx
on public.flashcard_generated_decks (user_id, saved_at desc);
