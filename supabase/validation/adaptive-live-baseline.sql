-- READ ONLY. Catalog metadata only; no learner rows or grading payloads.
select jsonb_build_object(
 'tables',(select jsonb_agg(jsonb_build_object('name',c.relname,'rls',c.relrowsecurity,'columns',(select jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'not_null',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid)) order by a.attnum) from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped)) order by c.relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),
 'policies',(select jsonb_agg(to_jsonb(p) order by tablename,policyname) from pg_policies p where schemaname='public'),
 'indexes',(select jsonb_agg(to_jsonb(i) order by tablename,indexname) from pg_indexes i where schemaname='public'),
 'constraints',(select jsonb_agg(jsonb_build_object('table',c.conrelid::regclass::text,'name',c.conname,'definition',pg_get_constraintdef(c.oid)) order by c.conrelid::regclass::text,c.conname) from pg_constraint c join pg_namespace n on n.oid=c.connamespace where n.nspname='public'),
 'triggers',(select jsonb_agg(jsonb_build_object('table',t.tgrelid::regclass::text,'name',t.tgname,'definition',pg_get_triggerdef(t.oid)) order by t.tgname) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','auth') and not t.tgisinternal),
 'functions',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'args',pg_get_function_identity_arguments(p.oid),'security_definer',p.prosecdef,'definition',pg_get_functiondef(p.oid)) order by n.nspname,p.proname,p.oid) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') and p.prokind='f'),
 'grants',(select jsonb_agg(to_jsonb(g) order by table_name,grantee,privilege_type) from information_schema.role_table_grants g where table_schema='public'),
 'default_acl',(select jsonb_agg(jsonb_build_object('role',pg_get_userbyid(d.defaclrole),'schema',n.nspname,'type',d.defaclobjtype,'acl',d.defaclacl::text) order by n.nspname,d.defaclobjtype) from pg_default_acl d left join pg_namespace n on n.oid=d.defaclnamespace),
 'api_settings',(select jsonb_agg(jsonb_build_object('role',r.rolname,'settings',array(select x from unnest(s.setconfig) x where x like 'pgrst.%'))) from pg_db_role_setting s left join pg_roles r on r.oid=s.setrole where exists(select 1 from unnest(s.setconfig) x where x like 'pgrst.%')),
 'session_api_setting',current_setting('pgrst.db_schemas',true),
 'adaptive_schemas',(select jsonb_agg(nspname) from pg_namespace where nspname like 'adaptive%')
) as baseline;

-- Supplemental DDL trigger inventory (read-only).
select evtname, evtevent, evtenabled, evttags, evtfoid::regprocedure::text as function_name
from pg_event_trigger order by evtname;
