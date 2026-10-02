-- READ ONLY: safe before or after migration. Catalogs only; no learner data.
-- Do not confuse zero rows before migration with passing post-migration checks.
select jsonb_build_object(
  'server_version', current_setting('server_version'),
  'adaptive_tables', (select jsonb_agg(jsonb_build_object('schema',n.nspname,'table',c.relname,'rls',c.relrowsecurity) order by n.nspname,c.relname)
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where c.relkind='r' and (n.nspname='adaptive_private' or (n.nspname='public' and c.relname like 'adaptive_%'))),
  'adaptive_functions', (select jsonb_agg(jsonb_build_object('name',p.proname,'definer',p.prosecdef,'owner',pg_get_userbyid(p.proowner),'settings',p.proconfig,
      'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE')) order by p.proname)
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='adaptive_private'),
  'private_client_grants', (select jsonb_agg(to_jsonb(g) order by table_name,grantee,privilege_type)
    from information_schema.role_table_grants g where table_schema='adaptive_private' and grantee in ('PUBLIC','anon','authenticated')),
  'adaptive_policies', (select jsonb_agg(to_jsonb(p) order by schemaname,tablename,policyname) from pg_policies p
    where schemaname='adaptive_private' or (schemaname='public' and tablename like 'adaptive_%')),
  'auth_foreign_keys', (select jsonb_agg(jsonb_build_object('table',conrelid::regclass::text,'definition',pg_get_constraintdef(oid)) order by conrelid::regclass::text,conname)
    from pg_constraint where confrelid='auth.users'::regclass),
  'extensions', (select jsonb_agg(jsonb_build_object('name',extname,'version',extversion) order by extname) from pg_extension),
  'exposed_schema_setting',current_setting('pgrst.db_schemas',true)
) as readiness_metadata;
