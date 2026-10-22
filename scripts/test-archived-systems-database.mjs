import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role;
 create table public.profiles(id int,cipher_coins int);
 insert into public.profiles values(1,150);
 create table public.cipher_coin_unlocks(resource_id text);insert into public.cipher_coin_unlocks values('p014');
 create table public.mascot_placements(id int);insert into public.mascot_placements values(1);
 grant insert,update,delete on public.mascot_placements to authenticated,service_role;
 create function public.archive_test_trigger() returns trigger language plpgsql as $$begin return new;end$$;
 create trigger grant_new_user_cipher_welcome after insert on public.profiles for each row execute function public.archive_test_trigger();`);
const names=['award_cipher_coins','claim_cipher_daily_check_in','record_cipher_daily_challenge','purchase_cipher_coin_item','consume_cipher_exam_pass','claim_referral_reward'];
for(const n of names)await db.exec(`create function public.${n}() returns jsonb language sql as $$select '{}'::jsonb$$;grant execute on function public.${n}() to anon,authenticated,service_role;`);
const migration=readFileSync('supabase/migrations/20261022120000_archive_coin_and_mascot_systems.sql','utf8');
await db.exec(migration);await db.exec(migration); // Safe to rerun.
for(const role of ['anon','authenticated','service_role'])for(const n of names){
 const {rows}=await db.query(`select has_function_privilege($1,$2,'execute') as allowed`,[role,`public.${n}()`]);
 assert.equal(rows[0].allowed,false);
}
assert.equal((await db.query("select count(*)::int n from pg_trigger where tgname='grant_new_user_cipher_welcome'")).rows[0].n,0);
assert.equal((await db.query("select has_table_privilege('authenticated','public.mascot_placements','update') allowed")).rows[0].allowed,false);
assert.equal((await db.query('select cipher_coins from public.profiles')).rows[0].cipher_coins,150);
assert.equal((await db.query('select resource_id from public.cipher_coin_unlocks')).rows[0].resource_id,'p014');
assert.equal((await db.query('select count(*)::int n from public.mascot_placements')).rows[0].n,1);
await db.exec('drop table public.mascot_placements;');await db.exec(migration); // Missing historical mascot setup is fine.
await db.close();
console.log('Archive migration passed: API execution/write grants revoked, welcome trigger removed, data retained, idempotent and missing-table safe.');
