-- Allow users to save individual flashcards into their curated starred set.
-- Run this once in the Supabase SQL Editor for existing SecurePlus projects.

alter table public.starred_questions
drop constraint if exists starred_questions_type_check;

alter table public.starred_questions
add constraint starred_questions_type_check
check (
  question_type in ('mcq', 'pbq', 'flashcard')
  and length(question_id) between 1 and 160
  and question_key = question_type || ':' || question_id
);

drop policy if exists "Users can insert own starred questions" on public.starred_questions;
create policy "Users can insert own starred questions"
on public.starred_questions for insert
to authenticated
with check (
  auth.uid() is not null
  and auth.uid() = user_id
  and question_type in ('mcq', 'pbq', 'flashcard')
  and length(question_id) between 1 and 160
  and question_key = question_type || ':' || question_id
);
