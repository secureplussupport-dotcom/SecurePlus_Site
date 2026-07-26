-- Secure, single-use account deletion requests.
-- Run this once in Supabase SQL Editor before deploying the matching API routes.

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  email_delivery_id text,
  created_at timestamptz not null default now(),
  check (char_length(token_hash) = 64),
  check (expires_at > created_at)
);

alter table public.account_deletion_requests
  add column if not exists email_delivery_id text,
  add column if not exists used_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

create index if not exists account_deletion_requests_user_created_idx
  on public.account_deletion_requests (user_id, created_at desc);

create unique index if not exists account_deletion_requests_one_pending_idx
  on public.account_deletion_requests (user_id)
  where used_at is null;

create index if not exists account_deletion_requests_expiry_idx
  on public.account_deletion_requests (expires_at)
  where used_at is null;

alter table public.account_deletion_requests enable row level security;

-- Browser clients must never read or mutate deletion tokens. The Vercel API
-- uses the service role, which bypasses RLS, after verifying the signed-in user.
revoke all on table public.account_deletion_requests from anon, authenticated;
revoke all on table public.account_deletion_requests from public;
grant usage on schema public to service_role;
grant all on table public.account_deletion_requests to service_role;

-- Make the table and its explicit service-role grant visible to PostgREST
-- immediately, including projects using Supabase's newer opt-in Data API grants.
notify pgrst, 'reload schema';
