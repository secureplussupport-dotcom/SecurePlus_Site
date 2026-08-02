-- Stripe membership cancellation support.
-- Run this in Supabase SQL Editor after schema.sql if your profiles table
-- already exists. It lets the app show when a subscription is scheduled to
-- stop renewing.

alter table public.profiles
add column if not exists subscription_cancel_at_period_end boolean not null default false,
add column if not exists subscription_current_period_end timestamptz;

create index if not exists profiles_subscription_current_period_end_idx
on public.profiles (subscription_current_period_end);
