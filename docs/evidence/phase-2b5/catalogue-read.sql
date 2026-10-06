-- Read only. Run through the authenticated management connector, not a browser.
-- Do not replace these allowlisted projections with SELECT * or payload output.
select jsonb_build_object(
 'observed_at',clock_timestamp(),
 'adaptive_schema_present',to_regnamespace('adaptive_private') is not null,
 'overrides',(select jsonb_agg(jsonb_build_object(
   'question_kind',question_kind,'question_id',question_id,
   'action',action,'status',status,'sort_order',sort_order,'updated_at',updated_at,
   'payload_sha256',encode(sha256(convert_to(payload::text,'UTF8')),'hex')
 ) order by question_kind,question_id) from public.question_overrides),
 'pbqs',(select jsonb_agg(jsonb_build_object(
   'id',id,'title',title,'type',type,'domain',domain,'is_pro',is_pro,
   'updated_at',updated_at,'objective',payload->'appQuestion'->>'objective',
   'payload_sha256',encode(sha256(convert_to(payload::text,'UTF8')),'hex'),
   'app_question_sha256',encode(sha256(convert_to((payload->'appQuestion')::text,'UTF8')),'hex')
 ) order by id) from public.pbqs),
 'catalogue_tables',(select jsonb_agg(table_name order by table_name)
   from information_schema.tables where table_schema='public'
   and (table_name in ('pbqs','question_overrides','question_override_history')
   or table_name ilike '%content%' or table_name ilike '%lesson%' or table_name ilike '%concept%'))
) as proof;
