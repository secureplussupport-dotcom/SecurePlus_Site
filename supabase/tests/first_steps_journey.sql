-- Synthetic identities only; every row is rolled back at the end.
begin;
select set_config('secureplus_test.user_a',gen_random_uuid()::text,true);
select set_config('secureplus_test.user_b',gen_random_uuid()::text,true);
select set_config('secureplus_test.user_old',gen_random_uuid()::text,true);
insert into auth.users(id,aud,role,email,raw_user_meta_data,created_at,updated_at)
select current_setting('secureplus_test.'||key)::uuid,'authenticated','authenticated',key||'@journey-test.invalid','{"name":"Journey test"}'::jsonb,created,now()
from(values('user_a',now()),('user_b',now()),('user_old','2026-11-03T12:00:00Z'::timestamptz)) t(key,created);

set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('secureplus_test.user_b'),true);
select public.sync_first_steps(false,true,false,false,'Asia/Singapore');
select set_config('request.jwt.claim.sub',current_setting('secureplus_test.user_a'),true);
do $$declare a jsonb;b jsonb;begin
 a:=public.sync_first_steps(true,false,false,false,'Asia/Singapore');
 if (a->>'completed_at') is not null then raise exception 'Partial steps must not earn completion';end if;
 a:=public.sync_first_steps(false,true,true,false,'Asia/Singapore');
 if (a->>'completed_at') is null or (a->>'reward_day')<>((now() at time zone 'Asia/Singapore')::date)::text then raise exception 'Expected exactly one dated completion reward';end if;
 b:=public.sync_first_steps(false,false,false,false,'Pacific/Pago_Pago');
 if a<>b then raise exception 'Retry changed completion or regressed steps';end if;
 b:=public.sync_first_steps(false,false,false,true,'Asia/Singapore');
 if b->>'celebration_seen_at' is null then raise exception 'Acknowledgement was not persisted';end if;
 if public.sync_first_steps(false,false,false,true,'Asia/Singapore')<>b then raise exception 'Acknowledgement must be idempotent';end if;
 if (select count(*) from public.learner_first_steps)<>1 then raise exception 'RLS exposed another account';end if;
 begin
  update public.learner_first_steps set mcq_completed=false where user_id=auth.uid();
  raise exception 'Direct writes must be denied';
 exception when insufficient_privilege then null;end;
 begin
  perform public.sync_first_steps(false,false,false,false,'invalid-timezone');
  raise exception 'Invalid timezone accepted';
 exception when invalid_parameter_value then null;end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('secureplus_test.user_b'),true);
do $$begin
 if (select mcq_completed from public.learner_first_steps) then raise exception 'Cross-account progress was changed';end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('secureplus_test.user_old'),true);
do $$begin
 if public.sync_first_steps(true,true,true)->>'eligible'<>'false' then raise exception 'Existing account incorrectly enrolled';end if;
end $$;
select set_config('request.jwt.claim.sub','',true);
do $$begin
 begin perform public.sync_first_steps();raise exception 'Missing identity accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role anon;
do $$begin
 begin perform public.sync_first_steps();raise exception 'Anonymous RPC allowed';exception when insufficient_privilege then null;end;
 begin perform 1 from public.learner_first_steps;raise exception 'Anonymous read allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
