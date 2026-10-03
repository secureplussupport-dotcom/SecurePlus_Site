-- Disposable local execution only. All fixture/grant changes roll back.
begin;
grant adaptive_ingest,adaptive_worker,adaptive_erasure to postgres with inherit false,set true;
do $$ declare r record;begin
 if (select count(*) from pg_roles where rolname in ('adaptive_ingest','adaptive_worker','adaptive_erasure') and not(rolcanlogin or rolsuper or rolbypassrls or rolcreatedb or rolcreaterole))<>3 then raise exception 'Invalid purpose roles';end if;
 for r in select oid from pg_proc where pronamespace='adaptive_private'::regnamespace loop
  if has_function_privilege('anon',r.oid,'execute') or has_function_privilege('authenticated',r.oid,'execute') then raise exception 'API function access leaked';end if;
 end loop;
 if exists(select 1 from pg_proc where pronamespace='adaptive_private'::regnamespace and prosecdef and (proowner<>'postgres'::regrole or not('search_path=""'=any(proconfig)))) then raise exception 'Unsafe definer ownership/search path';end if;
 if has_table_privilege('adaptive_worker','adaptive_private.grading_keys','select') or has_table_privilege('adaptive_ingest','public.adaptive_concept_projections','insert') or has_table_privilege('adaptive_erasure','public.adaptive_answer_evidence','select') then raise exception 'Purpose separation failed';end if;
 if exists(select 1 from pg_class where relnamespace='adaptive_private'::regnamespace and relkind='r' and not relrowsecurity) then raise exception 'Missing private RLS';end if;
end $$;
set local role adaptive_worker;
select * from adaptive_private.runtime_metrics();
reset role;
rollback;
\echo PASS infrastructure SQL assertions and rollback
