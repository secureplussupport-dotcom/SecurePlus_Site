-- SecurePlus Academy ID profile setup.
-- Run this in the Supabase SQL Editor after supabase/schema.sql.

alter table profiles
add column if not exists full_name text,
add column if not exists avatar_id varchar(50) not null default 'default-cipher';

create index if not exists profiles_avatar_id_idx
on profiles (avatar_id);

drop policy if exists "Users can update own academy identity" on profiles;
create policy "Users can update own academy identity"
on profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke update on profiles from anon;
revoke update on profiles from authenticated;
grant update (full_name, avatar_id) on profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_id, tier, referral_code)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')), ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'avatar_id'), ''), 'default-cipher'),
    'free',
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  )
  on conflict (id) do update
  set full_name = coalesce(excluded.full_name, profiles.full_name),
      avatar_id = coalesce(excluded.avatar_id, profiles.avatar_id),
      updated_at = now();

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;
