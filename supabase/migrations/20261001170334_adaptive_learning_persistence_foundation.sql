-- Phase 2B-1 DESIGN: unapplied, additive, inactive. No changes to legacy tables.
-- Apply only in an explicitly approved later phase. No catalogue seed/activation.
begin;
create schema adaptive_private;
revoke all on schema adaptive_private from public, anon, authenticated;
grant usage on schema adaptive_private to service_role;

create table public.adaptive_versions (
  version_id text primary key check (version_id ~ '^[a-z0-9][a-z0-9._-]{2,99}$'),
  version_kind text not null check (version_kind in ('mapping','algorithm','configuration')),
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  review_status text not null default 'pending' check (review_status in ('pending','agent_reviewed_pending_human','human_approved')),
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (version_id, version_kind),
  check ((review_status = 'human_approved') = (approved_by is not null and approved_at is not null)),
  check (approved_at is null or approved_at >= created_at)
);
create table adaptive_private.version_payloads (
  version_id text primary key references public.adaptive_versions(version_id) on delete restrict,
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) <= 1048576)
);
-- Lifecycle is append-only. Approval of a pending version requires a NEW version ID.
create table public.adaptive_version_events (
  event_index bigint generated always as identity primary key,
  version_id text not null references public.adaptive_versions(version_id) on delete restrict,
  action text not null check (action in ('activate','deactivate')),
  actor_id uuid not null references auth.users(id) on delete restrict,
  reason text not null check (length(reason) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index adaptive_version_events_latest on public.adaptive_version_events(version_id, event_index desc);
create table public.adaptive_version_sets (
  mapping_version text not null,
  algorithm_version text not null,
  configuration_version text not null,
  mapping_kind text generated always as ('mapping'::text) stored,
  algorithm_kind text generated always as ('algorithm'::text) stored,
  configuration_kind text generated always as ('configuration'::text) stored,
  primary key (mapping_version, algorithm_version, configuration_version),
  foreign key (mapping_version,mapping_kind) references public.adaptive_versions(version_id,version_kind) on delete restrict,
  foreign key (algorithm_version,algorithm_kind) references public.adaptive_versions(version_id,version_kind) on delete restrict,
  foreign key (configuration_version,configuration_kind) references public.adaptive_versions(version_id,version_kind) on delete restrict
);
create table public.adaptive_concepts (
  mapping_version text not null,
  mapping_kind text generated always as ('mapping'::text) stored,
  concept_id text not null check (concept_id ~ '^[a-z][a-z0-9_-]*[.][a-z0-9._-]+$' and length(concept_id) <= 120),
  exam_scope text not null check (length(exam_scope) between 1 and 50),
  name text not null check (length(name) between 1 and 160),
  description text not null check (length(description) between 1 and 2000),
  objective_codes text[] not null,
  domain_id text not null,
  chapter_id text not null,
  topic_id text not null,
  node_kind text not null check (node_kind in ('mastery_concept','supporting_concept','topic')),
  aliases text[] not null default '{}',
  review_status text not null check (review_status in ('pending','agent_reviewed_pending_human','human_approved')),
  reviewed_by uuid references auth.users(id) on delete restrict,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (mapping_version,concept_id),
  foreign key (mapping_version,mapping_kind) references public.adaptive_versions(version_id,version_kind) on delete restrict,
  check (cardinality(objective_codes) between 1 and 28),
  check (review_status <> 'human_approved' or (reviewed_by is not null and reviewed_at is not null))
);
create table public.adaptive_relationships (
  mapping_version text not null,
  source_concept_id text not null,
  target_concept_id text not null,
  relationship_type text not null check (relationship_type in ('commonly_confused_with','contrasts_with','prerequisite_for','part_of','applied_with')),
  direction text not null check (direction in ('forward','bidirectional')),
  editorial_weight numeric not null check (editorial_weight > 0 and editorial_weight <= 1),
  review_status text not null check (review_status in ('pending','agent_reviewed_pending_human','human_approved')),
  review_provenance text not null check (length(review_provenance) between 1 and 1000),
  reviewed_by uuid references auth.users(id) on delete restrict,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (mapping_version,source_concept_id,target_concept_id,relationship_type),
  foreign key (mapping_version,source_concept_id) references public.adaptive_concepts on delete restrict,
  foreign key (mapping_version,target_concept_id) references public.adaptive_concepts on delete restrict,
  check (source_concept_id <> target_concept_id),
  check (direction <> 'bidirectional' or source_concept_id < target_concept_id),
  check (review_status <> 'human_approved' or (reviewed_by is not null and reviewed_at is not null))
);
create index adaptive_relationships_target on public.adaptive_relationships(mapping_version,target_concept_id);

-- Safe metadata ONLY. No stem explanations, answer flags or grading JSON here.
create table public.adaptive_question_revisions (
  revision_id uuid primary key default gen_random_uuid(),
  question_id text not null check (question_id ~ '^[mp][0-9]{3,6}$'),
  question_type text not null check (question_type in ('mcq','pbq')),
  content_signature text not null check (content_signature ~ '^sha256:[0-9a-f]{64}$'),
  publication_source text not null check (length(publication_source) between 1 and 100),
  publication_steps text[] not null check (cardinality(publication_steps) between 1 and 20),
  published_at timestamptz not null,
  objective_codes text[] not null check (cardinality(objective_codes) between 1 and 28),
  domain_id text not null, topic_id text not null,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  scenario_family text not null check (length(scenario_family) between 1 and 160),
  review_status text not null check (review_status in ('pending','agent_reviewed_pending_human','human_approved')),
  reviewed_by uuid references auth.users(id) on delete restrict,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (question_id,content_signature),
  unique (revision_id,question_id),
  check ((question_type='mcq' and question_id like 'm%') or (question_type='pbq' and question_id like 'p%')),
  check (review_status <> 'human_approved' or (reviewed_by is not null and reviewed_at is not null))
);
create table public.adaptive_question_publications (
  event_index bigint generated always as identity primary key,
  revision_id uuid not null references public.adaptive_question_revisions on delete restrict,
  status text not null check (status in ('active','retired')),
  actor_id uuid not null references auth.users(id) on delete restrict,
  occurred_at timestamptz not null default now()
);
create index adaptive_question_publications_latest on public.adaptive_question_publications(revision_id,event_index desc);
create table public.adaptive_answer_components (
  revision_id uuid not null references public.adaptive_question_revisions on delete restrict,
  component_id text not null check (component_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,119}$'),
  component_kind text not null check (component_kind in ('option','part','blank','choice','step')),
  primary key (revision_id,component_id)
);
create table adaptive_private.grading_keys (
  revision_id uuid primary key references public.adaptive_question_revisions on delete restrict,
  grading_contract text not null check (length(grading_contract) between 1 and 100),
  grading_payload jsonb not null check (jsonb_typeof(grading_payload) = 'object' and pg_column_size(grading_payload) <= 1048576),
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);
create table public.adaptive_question_mappings (
  mapping_version text not null,
  revision_id uuid not null references public.adaptive_question_revisions on delete restrict,
  concept_id text not null,
  concept_role text not null check (concept_role in ('primary','secondary')),
  precision text not null check (precision in ('direct','coarse')),
  cognitive_skill text not null check (length(cognitive_skill) between 1 and 100),
  review_status text not null check (review_status in ('pending','agent_reviewed_pending_human','human_approved')),
  reviewed_by uuid references auth.users(id) on delete restrict,
  reviewed_at timestamptz,
  primary key (mapping_version,revision_id,concept_id),
  foreign key (mapping_version,concept_id) references public.adaptive_concepts on delete restrict,
  check (review_status <> 'human_approved' or (reviewed_by is not null and reviewed_at is not null))
);
create unique index adaptive_question_one_primary on public.adaptive_question_mappings(mapping_version,revision_id) where concept_role='primary';
create index adaptive_question_mappings_concept on public.adaptive_question_mappings(mapping_version,concept_id);
create index adaptive_question_mappings_revision on public.adaptive_question_mappings(revision_id);
create table public.adaptive_content_revisions (
  content_revision_id uuid primary key default gen_random_uuid(),
  content_id text not null check (length(content_id) between 1 and 200),
  content_kind text not null check (content_kind in ('flashcard','lesson','lesson_section','lesson_check','targeted_practice')),
  content_signature text not null check (content_signature ~ '^sha256:[0-9a-f]{64}$'),
  unique (content_id,content_signature)
);
create table public.adaptive_content_mappings (
  mapping_version text not null,
  content_revision_id uuid not null references public.adaptive_content_revisions on delete restrict,
  concept_id text not null,
  review_status text not null check (review_status in ('pending','agent_reviewed_pending_human','human_approved')),
  reviewed_by uuid references auth.users(id) on delete restrict,
  reviewed_at timestamptz,
  primary key (mapping_version,content_revision_id,concept_id),
  foreign key (mapping_version,concept_id) references public.adaptive_concepts on delete restrict,
  check (review_status <> 'human_approved' or (reviewed_by is not null and reviewed_at is not null))
);
create index adaptive_content_mappings_concept on public.adaptive_content_mappings(mapping_version,concept_id);
create index adaptive_content_mappings_revision on public.adaptive_content_mappings(content_revision_id);

create table adaptive_private.owner_state (
  owner_id uuid primary key references auth.users(id) on delete restrict,
  last_set_index bigint not null default 0 check (last_set_index >= 0),
  evidence_generation bigint not null default 0 check (evidence_generation >= 0),
  complete_evidence_from timestamptz
);
create table public.adaptive_sessions (
  session_id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  set_index bigint not null default 0 check (set_index > 0),
  source text not null check (source in ('practice','smart_review','diagnostic','exam','targeted_review')),
  mode text not null check (mode in ('normal','smart_review','diagnostic','exam','targeted_review')),
  seed text check (length(seed) <= 200),
  requested_count integer not null check (requested_count between 1 and 500),
  actual_count integer not null check (actual_count between 1 and 500 and actual_count <= requested_count),
  requested_pbq_count integer not null check (requested_pbq_count between 0 and requested_count),
  actual_pbq_count integer not null check (actual_pbq_count between 0 and actual_count and actual_pbq_count <= requested_pbq_count),
  mapping_version text not null, algorithm_version text not null, configuration_version text not null,
  started_at timestamptz not null default now(),
  unique (owner_id,session_id), unique (owner_id,set_index),
  foreign key (mapping_version,algorithm_version,configuration_version) references public.adaptive_version_sets on delete restrict
);
create table public.adaptive_session_items (
  owner_id uuid not null, session_id uuid not null,
  position integer not null check (position between 1 and 500),
  revision_id uuid not null references public.adaptive_question_revisions on delete restrict,
  primary key (owner_id,session_id,position),
  unique (owner_id,session_id,revision_id),
  unique (owner_id,session_id,position,revision_id),
  foreign key (owner_id,session_id) references public.adaptive_sessions(owner_id,session_id) on delete restrict
);
create index adaptive_session_items_revision on public.adaptive_session_items(revision_id);
create table public.adaptive_session_events (
  event_id uuid primary key default gen_random_uuid(),
  owner_id uuid not null, session_id uuid not null,
  client_event_id uuid not null,
  status text not null check (status in ('started','completed','interrupted','abandoned')),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  unique (owner_id,client_event_id),
  foreign key (owner_id,session_id) references public.adaptive_sessions(owner_id,session_id) on delete restrict,
  check (occurred_at <= received_at + interval '5 minutes')
);
create index adaptive_session_events_session on public.adaptive_session_events(owner_id,session_id,occurred_at);

create table public.adaptive_answer_evidence (
  evidence_id uuid primary key default gen_random_uuid(),
  receipt_index bigint generated always as identity unique,
  owner_id uuid not null references auth.users(id) on delete restrict,
  client_event_id uuid not null,
  submission_sha256 text not null check (submission_sha256 ~ '^[0-9a-f]{64}$'),
  session_id uuid, item_position integer, revision_id uuid,
  question_id text,
  selected_components jsonb,
  correct boolean,
  score_fraction numeric check (score_fraction between 0 and 1),
  score_scale text not null default 'unit_interval' check (score_scale='unit_interval'),
  mapping_version text not null, algorithm_version text not null, configuration_version text not null,
  concept_snapshot jsonb not null default '[]' check (jsonb_typeof(concept_snapshot)='array'),
  evidence_precision text not null check (evidence_precision in ('direct','coarse','unknown')),
  provenance text not null check (provenance in ('complete','legacy_inferred')),
  eligible_for_mastery boolean generated always as (provenance='complete' and evidence_precision='direct') stored,
  source text not null check (source in ('practice','smart_review','diagnostic','exam','targeted_review','legacy')),
  mode text not null check (mode in ('normal','smart_review','diagnostic','exam','targeted_review','legacy')),
  occurred_at timestamptz,
  received_at timestamptz not null default now(),
  response_duration_ms integer check (response_duration_ms between 0 and 86400000),
  classification_at_ingest text not null check (classification_at_ingest in ('exact_repeat','same_scenario','fresh_scenario','unknown')),
  classification_provenance text not null check (classification_provenance in ('server_history_snapshot','legacy_unknown')),
  recommendation_id uuid, intervention_id uuid,
  supersedes_evidence_id uuid,
  correction_reason text,
  legacy_attempt_id uuid,
  unique (owner_id,evidence_id), unique (owner_id,client_event_id), unique (owner_id,supersedes_evidence_id),
  foreign key (owner_id,session_id,item_position,revision_id) references public.adaptive_session_items(owner_id,session_id,position,revision_id) on delete restrict,
  foreign key (revision_id,question_id) references public.adaptive_question_revisions(revision_id,question_id) on delete restrict,
  foreign key (owner_id,supersedes_evidence_id) references public.adaptive_answer_evidence(owner_id,evidence_id) on delete restrict,
  foreign key (mapping_version,algorithm_version,configuration_version) references public.adaptive_version_sets on delete restrict,
  check (supersedes_evidence_id is null or (supersedes_evidence_id <> evidence_id and correction_reason is not null and length(correction_reason) between 1 and 1000)),
  check (occurred_at is null or occurred_at <= received_at + interval '5 minutes'),
  check (selected_components is null or (jsonb_typeof(selected_components)='array' and jsonb_array_length(selected_components) between 1 and 100 and pg_column_size(selected_components) <= 64000)),
  check ((provenance='complete' and session_id is not null and item_position is not null and revision_id is not null and question_id is not null and selected_components is not null and correct is not null and occurred_at is not null and evidence_precision <> 'unknown' and classification_provenance='server_history_snapshot' and classification_at_ingest <> 'unknown' and legacy_attempt_id is null)
    or (provenance='legacy_inferred' and legacy_attempt_id is not null and classification_at_ingest='unknown' and classification_provenance='legacy_unknown' and source='legacy' and mode='legacy'))
);
create unique index adaptive_legacy_origin on public.adaptive_answer_evidence(owner_id,legacy_attempt_id) where supersedes_evidence_id is null;
create index adaptive_evidence_owner_time on public.adaptive_answer_evidence(owner_id,occurred_at,evidence_id);
create index adaptive_evidence_session on public.adaptive_answer_evidence(owner_id,session_id,item_position,revision_id);
create index adaptive_evidence_revision on public.adaptive_answer_evidence(revision_id,question_id);
create index adaptive_evidence_versions on public.adaptive_answer_evidence(mapping_version,algorithm_version,configuration_version);

create table public.adaptive_recommendations (
  recommendation_id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  scheduling_key text not null check (length(scheduling_key) between 1 and 240),
  concept_id text not null, content_revision_id uuid references public.adaptive_content_revisions on delete restrict,
  source_evidence_id uuid not null,
  role text not null check (role in ('direct','supporting')),
  reason_codes text[] not null check (cardinality(reason_codes) between 1 and 30),
  mapping_version text not null, algorithm_version text not null, configuration_version text not null,
  created_at timestamptz not null default now(),
  unique (owner_id,recommendation_id), unique (owner_id,scheduling_key),
  foreign key (mapping_version,concept_id) references public.adaptive_concepts on delete restrict,
  foreign key (mapping_version,algorithm_version,configuration_version) references public.adaptive_version_sets on delete restrict,
  foreign key (owner_id,source_evidence_id) references public.adaptive_answer_evidence(owner_id,evidence_id) on delete restrict
);
create table public.adaptive_interventions (
  intervention_id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  client_event_id uuid not null,
  submission_sha256 text not null check (submission_sha256 ~ '^[0-9a-f]{64}$'),
  recommendation_id uuid not null,
  concept_id text not null,
  content_revision_id uuid not null references public.adaptive_content_revisions on delete restrict,
  source_evidence_id uuid not null,
  event_type text not null check (event_type in ('shown','opened','started','completed','skipped','dismissed','postponed','mapping_reported')),
  activity_type text not null check (activity_type in ('lesson_open','lesson_steps','lesson_check','flashcard_review','targeted_practice')),
  completion_criteria text,
  completion_verified boolean not null default false,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  mapping_version text not null, algorithm_version text not null, configuration_version text not null,
  unique (owner_id,intervention_id), unique (owner_id,client_event_id),
  foreign key (owner_id,recommendation_id) references public.adaptive_recommendations(owner_id,recommendation_id) on delete restrict,
  foreign key (owner_id,source_evidence_id) references public.adaptive_answer_evidence(owner_id,evidence_id) on delete restrict,
  foreign key (mapping_version,concept_id) references public.adaptive_concepts on delete restrict,
  foreign key (mapping_version,algorithm_version,configuration_version) references public.adaptive_version_sets on delete restrict,
  check (occurred_at <= received_at + interval '5 minutes'),
  check (not completion_verified or (event_type='completed' and activity_type <> 'lesson_open' and completion_criteria is not null and length(completion_criteria) between 1 and 2000))
);
alter table public.adaptive_answer_evidence add constraint adaptive_evidence_recommendation_fk foreign key (owner_id,recommendation_id) references public.adaptive_recommendations(owner_id,recommendation_id) on delete restrict;
alter table public.adaptive_answer_evidence add constraint adaptive_evidence_intervention_fk foreign key (owner_id,intervention_id) references public.adaptive_interventions(owner_id,intervention_id) on delete restrict;
create index adaptive_interventions_time on public.adaptive_interventions(owner_id,occurred_at);
create index adaptive_interventions_concept on public.adaptive_interventions(owner_id,concept_id,occurred_at);

create table public.adaptive_review_tasks (
  task_id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  scheduling_key text not null check (length(scheduling_key) between 1 and 240),
  concept_id text not null,
  source_evidence_id uuid not null,
  target_revision_id uuid references public.adaptive_question_revisions on delete restrict,
  task_type text not null check (task_type in ('transfer','original_recall','delayed_proof','maintenance','insufficient_variant_coverage')),
  reason_codes text[] not null check (cardinality(reason_codes) between 1 and 30),
  eligible_at timestamptz not null, eligible_set_index bigint not null check (eligible_set_index > 0),
  initial_status text not null check (initial_status in ('pending','unavailable')),
  mapping_version text not null, algorithm_version text not null, configuration_version text not null,
  created_at timestamptz not null default now(),
  unique (owner_id,task_id), unique (owner_id,scheduling_key),
  foreign key (owner_id,source_evidence_id) references public.adaptive_answer_evidence(owner_id,evidence_id) on delete restrict,
  foreign key (mapping_version,concept_id) references public.adaptive_concepts on delete restrict,
  foreign key (mapping_version,algorithm_version,configuration_version) references public.adaptive_version_sets on delete restrict,
  check ((task_type='insufficient_variant_coverage' and target_revision_id is null and initial_status='unavailable') or (task_type <> 'insufficient_variant_coverage' and target_revision_id is not null and initial_status='pending'))
);
create index adaptive_tasks_due_time on public.adaptive_review_tasks(owner_id,eligible_at);
create index adaptive_tasks_due_set on public.adaptive_review_tasks(owner_id,eligible_set_index);
create index adaptive_tasks_concept on public.adaptive_review_tasks(owner_id,concept_id);
create table public.adaptive_review_task_events (
  event_id uuid primary key default gen_random_uuid(),
  owner_id uuid not null, task_id uuid not null,
  event_key text not null check (length(event_key) between 1 and 240),
  status text not null check (status in ('scheduled','completed','skipped','postponed','cancelled','superseded')),
  completion_evidence_id uuid,
  occurred_at timestamptz not null default now(),
  unique (owner_id,event_key),
  foreign key (owner_id,task_id) references public.adaptive_review_tasks(owner_id,task_id) on delete restrict,
  foreign key (owner_id,completion_evidence_id) references public.adaptive_answer_evidence(owner_id,evidence_id) on delete restrict,
  check ((status='completed') = (completion_evidence_id is not null))
);
create index adaptive_task_events_task on public.adaptive_review_task_events(owner_id,task_id,occurred_at);

create table public.adaptive_concept_projections (
  owner_id uuid not null references auth.users(id) on delete restrict,
  concept_id text not null,
  mapping_version text not null, algorithm_version text not null, configuration_version text not null,
  state text not null check (state in ('not_enough_evidence','learning_signal','needs_attention','sticky','improving','proven','mastered')),
  evidence_level text not null check (evidence_level in ('none','limited','varied','retained','spaced')),
  effective_sample numeric not null check (effective_sample >= 0 and effective_sample <= 1000000000),
  distinct_questions integer not null check (distinct_questions between 0 and 1000000),
  distinct_scenarios integer not null check (distinct_scenarios between 0 and distinct_questions),
  complete_evidence_count integer not null check (complete_evidence_count >= 0),
  ever_sticky boolean not null, lapse_count integer not null check (lapse_count >= 0),
  unresolved_evidence_ids uuid[] not null default '{}',
  last_answer_at timestamptz, last_intervention_at timestamptz, proven_at timestamptz, mastered_at timestamptz,
  next_due_task_id uuid,
  input_generation bigint not null check (input_generation >= 0),
  receipt_watermark bigint not null check (receipt_watermark >= 0),
  replay_from timestamptz not null,
  input_sha256 text not null check (input_sha256 ~ '^[0-9a-f]{64}$'),
  projection_status text not null check (projection_status in ('stale','rebuilding','ready','failed')),
  recomputed_at timestamptz not null default now(),
  primary key (owner_id,concept_id,mapping_version,algorithm_version,configuration_version),
  foreign key (mapping_version,concept_id) references public.adaptive_concepts on delete restrict,
  foreign key (mapping_version,algorithm_version,configuration_version) references public.adaptive_version_sets on delete restrict,
  foreign key (owner_id,next_due_task_id) references public.adaptive_review_tasks(owner_id,task_id) on delete restrict,
  check (state not in ('proven','mastered') or (complete_evidence_count > 0 and cardinality(unresolved_evidence_ids)=0 and proven_at is not null)),
  check (state <> 'mastered' or (mastered_at is not null and mastered_at > proven_at))
);

-- All trusted writes occur in one server transaction using the service role.
-- These helpers are INVOKER: none turns an authenticated client into a privileged writer.
create function adaptive_private.reject_change() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  raise exception 'Adaptive history is immutable; append a correction or lifecycle event' using errcode='55000';
end;
$$;
create function adaptive_private.version_active(id text) returns boolean
language sql stable security invoker set search_path = '' as $$
  select exists(select 1 from public.adaptive_versions v where v.version_id=id
    and v.review_status='human_approved'
    and (select e.action from public.adaptive_version_events e where e.version_id=id order by e.event_index desc limit 1)='activate');
$$;
create function adaptive_private.check_activation() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  -- Lock the registry row to serialize competing lifecycle changes.
  perform 1 from public.adaptive_versions where version_id=new.version_id for update;
  if new.action='activate' and not exists(select 1 from public.adaptive_versions
      where version_id=new.version_id and review_status='human_approved') then
    raise exception 'Human approval required for activation' using errcode='23514';
  end if;
  if new.action='activate' and not exists(select 1 from public.adaptive_version_sets where new.version_id in (mapping_version,algorithm_version,configuration_version)) then
    raise exception 'Seal version set before activation' using errcode='23514';
  end if;
  if new.action='activate' and (
    exists(select 1 from public.adaptive_concepts where mapping_version=new.version_id and review_status<>'human_approved')
    or exists(select 1 from public.adaptive_relationships where mapping_version=new.version_id and review_status<>'human_approved')
    or exists(select 1 from public.adaptive_question_mappings where mapping_version=new.version_id and review_status<>'human_approved')
    or exists(select 1 from public.adaptive_content_mappings where mapping_version=new.version_id and review_status<>'human_approved')) then
    raise exception 'Unapproved catalogue entries cannot be activated' using errcode='23514';
  end if;
  new.event_index := nextval('public.adaptive_version_events_event_index_seq'::regclass);
  new.created_at := clock_timestamp();
  return new;
end;
$$;
create trigger adaptive_activation_guard before insert on public.adaptive_version_events
for each row execute function adaptive_private.check_activation();

create function adaptive_private.allocate_set() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  insert into adaptive_private.owner_state(owner_id,last_set_index) values(new.owner_id,1)
    on conflict(owner_id) do update set last_set_index=adaptive_private.owner_state.last_set_index+1
    returning last_set_index into new.set_index;
  new.started_at := clock_timestamp();
  return new;
end;
$$;
create trigger adaptive_set_allocation before insert on public.adaptive_sessions
for each row execute function adaptive_private.allocate_set();

create function adaptive_private.check_manifest() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare s public.adaptive_sessions; n integer; pbqs integer; last_position integer;
begin
  select * into strict s from public.adaptive_sessions where owner_id=new.owner_id and session_id=new.session_id;
  select count(*), count(*) filter(where q.question_type='pbq'), max(i.position) into n,pbqs,last_position
    from public.adaptive_session_items i join public.adaptive_question_revisions q using(revision_id)
    where i.owner_id=s.owner_id and i.session_id=s.session_id;
  if n<>s.actual_count or pbqs<>s.actual_pbq_count or last_position<>n then
    raise exception 'Manifest count/composition/positions mismatch' using errcode='23514';
  end if;
  if exists(select 1 from public.adaptive_session_items i where i.owner_id=s.owner_id and i.session_id=s.session_id
    and not exists(select 1 from public.adaptive_question_mappings m where m.mapping_version=s.mapping_version
      and m.revision_id=i.revision_id and m.concept_role='primary')) then
    raise exception 'Manifest requires one primary mapping per revision' using errcode='23514';
  end if;
  return null;
end;
$$;
create constraint trigger adaptive_session_manifest after insert on public.adaptive_sessions
  deferrable initially deferred for each row execute function adaptive_private.check_manifest();
create constraint trigger adaptive_item_manifest after insert on public.adaptive_session_items
  deferrable initially deferred for each row execute function adaptive_private.check_manifest();

create function adaptive_private.validate_answer() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare s public.adaptive_sessions; q public.adaptive_question_revisions; previous_evidence public.adaptive_answer_evidence;
  component jsonb; snapshot jsonb; component_count integer;
begin
  new.received_at := clock_timestamp();
  if new.provenance='complete' then
    select * into strict s from public.adaptive_sessions where owner_id=new.owner_id and session_id=new.session_id;
    select * into strict q from public.adaptive_question_revisions where revision_id=new.revision_id;
    if not exists(select 1 from adaptive_private.grading_keys where revision_id=new.revision_id) then
      raise exception 'Complete evidence requires immutable grading truth' using errcode='23514';
    end if;
    if row(new.mapping_version,new.algorithm_version,new.configuration_version,new.source,new.mode)
      is distinct from row(s.mapping_version,s.algorithm_version,s.configuration_version,s.source,s.mode)
      or new.question_id is distinct from q.question_id or new.occurred_at<s.started_at
      or new.response_duration_ms > extract(epoch from (new.occurred_at-s.started_at))*1000 then
      raise exception 'Evidence must match its trusted session/revision' using errcode='23514';
    end if;
    select jsonb_agg(jsonb_build_object('conceptId',m.concept_id,'role',m.concept_role,'precision',m.precision) order by m.concept_role,m.concept_id)
      into snapshot from public.adaptive_question_mappings m where m.mapping_version=s.mapping_version and m.revision_id=q.revision_id;
    if snapshot is null then raise exception 'Missing revision mapping' using errcode='23514'; end if;
    new.concept_snapshot := snapshot;
    -- Current PBQs have no reviewed component-to-concept grading contract. Always coarse.
    new.evidence_precision := case when q.question_type='pbq' or exists(select 1 from public.adaptive_question_mappings m
      where m.mapping_version=s.mapping_version and m.revision_id=q.revision_id and m.precision='coarse') then 'coarse' else 'direct' end;
    if jsonb_typeof(new.selected_components) is distinct from 'array' then
      raise exception 'Selected components must be an array' using errcode='23514';
    end if;
    for component in select value from jsonb_array_elements(new.selected_components) loop
      if jsonb_typeof(component)<>'object' or not (component ? 'componentId')
        or (select count(*) from jsonb_object_keys(component))<>2 or not(component ? 'valueId')
        or jsonb_typeof(component->'componentId')<>'string' or jsonb_typeof(component->'valueId')<>'string'
        or not exists(select 1 from public.adaptive_answer_components c where c.revision_id=q.revision_id and c.component_id=component->>'componentId')
        or not exists(select 1 from public.adaptive_answer_components c where c.revision_id=q.revision_id and c.component_id=component->>'valueId') then
        raise exception 'Unknown stable answer identity' using errcode='23514';
      end if;
      if q.question_type='mcq' and ((component->>'componentId')<>(component->>'valueId') or not exists(
        select 1 from public.adaptive_answer_components c where c.revision_id=q.revision_id and c.component_id=component->>'componentId' and c.component_kind='option')) then
        raise exception 'MCQ requires a stable option identity' using errcode='23514';
      end if;
    end loop;
    select count(distinct value->>'componentId') into component_count from jsonb_array_elements(new.selected_components);
    if component_count<>jsonb_array_length(new.selected_components) or (q.question_type='mcq' and component_count<>1) then
      raise exception 'Duplicate components or invalid MCQ selection count' using errcode='23514';
    end if;
  else
    -- Historical rows cannot acquire manufactured answer identities or concept proof.
    if new.session_id is not null or new.item_position is not null or new.selected_components is not null
       or new.response_duration_ms is not null or new.recommendation_id is not null or new.intervention_id is not null then
      raise exception 'Legacy evidence cannot invent missing evidence' using errcode='23514';
    end if;
    new.evidence_precision := 'unknown'; new.concept_snapshot := '[]';
  end if;
  if new.supersedes_evidence_id is not null then
    select * into strict previous_evidence from public.adaptive_answer_evidence where owner_id=new.owner_id and evidence_id=new.supersedes_evidence_id;
    if row(new.session_id,new.item_position,new.revision_id,new.question_id,new.occurred_at,new.provenance)
      is distinct from row(previous_evidence.session_id,previous_evidence.item_position,previous_evidence.revision_id,previous_evidence.question_id,previous_evidence.occurred_at,previous_evidence.provenance) then
      raise exception 'Correction must describe the same historical observation' using errcode='23514';
    end if;
  end if;
  return new;
end;
$$;
create trigger adaptive_answer_validation before insert on public.adaptive_answer_evidence
for each row execute function adaptive_private.validate_answer();

create function adaptive_private.validate_intervention() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare r public.adaptive_recommendations;
begin
  new.received_at := clock_timestamp();
  select * into strict r from public.adaptive_recommendations where owner_id=new.owner_id and recommendation_id=new.recommendation_id;
  if row(new.concept_id,new.content_revision_id,new.source_evidence_id,new.mapping_version,new.algorithm_version,new.configuration_version)
    is distinct from row(r.concept_id,r.content_revision_id,r.source_evidence_id,r.mapping_version,r.algorithm_version,r.configuration_version) then
    raise exception 'Intervention must match its recommendation' using errcode='23514';
  end if;
  return new;
end;
$$;
create trigger adaptive_intervention_validation before insert on public.adaptive_interventions
for each row execute function adaptive_private.validate_intervention();

create function adaptive_private.invalidate_projections() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  -- One per-owner lock serializes inserts with publication of rebuilt projections.
  insert into adaptive_private.owner_state(owner_id,evidence_generation) values(new.owner_id,1)
    on conflict(owner_id) do update set evidence_generation=adaptive_private.owner_state.evidence_generation+1;
  update public.adaptive_concept_projections set projection_status='stale' where owner_id=new.owner_id;
  return null;
end;
$$;
create trigger adaptive_answer_replay after insert on public.adaptive_answer_evidence
for each row execute function adaptive_private.invalidate_projections();
create trigger adaptive_intervention_replay after insert on public.adaptive_interventions
for each row execute function adaptive_private.invalidate_projections();

create function adaptive_private.validate_projection() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare generation bigint; boundary timestamptz;
begin
  if tg_op='UPDATE' and row(new.owner_id,new.concept_id,new.mapping_version,new.algorithm_version,new.configuration_version)
    is distinct from row(old.owner_id,old.concept_id,old.mapping_version,old.algorithm_version,old.configuration_version) then
    raise exception 'Projection identity cannot change' using errcode='23514';
  end if;
  select evidence_generation,complete_evidence_from into generation,boundary from adaptive_private.owner_state where owner_id=new.owner_id for update;
  if new.projection_status='ready' and (generation is null or new.input_generation<>generation) then
    raise exception 'Projection generation changed; replay required' using errcode='40001';
  end if;
  if not exists(select 1 from public.adaptive_concepts where mapping_version=new.mapping_version
    and concept_id=new.concept_id and node_kind='mastery_concept') then
    raise exception 'Support-only nodes cannot receive mastery projections' using errcode='23514';
  end if;
  if exists(select 1 from unnest(new.unresolved_evidence_ids) id where not exists(select 1 from public.adaptive_answer_evidence e
    where e.owner_id=new.owner_id and e.evidence_id=id and e.concept_snapshot @> jsonb_build_array(jsonb_build_object('conceptId',new.concept_id)))) then
    raise exception 'Contradiction ownership/concept mismatch' using errcode='23514';
  end if;
  if new.state in ('proven','mastered') and not exists(select 1 from public.adaptive_answer_evidence e
    where e.owner_id=new.owner_id and e.eligible_for_mastery and e.receipt_index<=new.receipt_watermark
      and e.mapping_version=new.mapping_version and e.algorithm_version=new.algorithm_version and e.configuration_version=new.configuration_version
      and boundary is not null and e.occurred_at>=boundary
      and e.concept_snapshot @> jsonb_build_array(jsonb_build_object('conceptId',new.concept_id))) then
    raise exception 'Legacy-only evidence cannot establish proof' using errcode='23514';
  end if;
  if new.next_due_task_id is not null and not exists(select 1 from public.adaptive_review_tasks t where t.owner_id=new.owner_id and t.task_id=new.next_due_task_id
    and row(t.concept_id,t.mapping_version,t.algorithm_version,t.configuration_version)=row(new.concept_id,new.mapping_version,new.algorithm_version,new.configuration_version)) then
    raise exception 'Projection task mismatch' using errcode='23514';
  end if;
  new.recomputed_at := clock_timestamp();
  return new;
end;
$$;
create trigger adaptive_projection_validation before insert or update on public.adaptive_concept_projections
for each row execute function adaptive_private.validate_projection();


-- A version set seals its mapping catalogue. New rows require a new mapping version.
create function adaptive_private.guard_mapping_append() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.adaptive_versions where version_id=new.mapping_version for update;
  if exists(select 1 from public.adaptive_version_sets where mapping_version=new.mapping_version) then
    raise exception 'Mapping version is sealed; publish a new version' using errcode='55000';
  end if;
  return new;
end;
$$;
create function adaptive_private.seal_version_set() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.adaptive_versions where version_id in(new.mapping_version,new.algorithm_version,new.configuration_version) order by version_id for update;
  if (select count(*) from adaptive_private.version_payloads where version_id in(new.mapping_version,new.algorithm_version,new.configuration_version))<>3 then
    raise exception 'Full immutable version payloads required before sealing' using errcode='23514';
  end if;
  if exists(select 1 from public.adaptive_question_mappings where mapping_version=new.mapping_version group by revision_id having count(*) filter(where concept_role='primary')<>1) then
    raise exception 'Each mapped revision needs exactly one primary concept' using errcode='23514';
  end if;
  return new;
end;
$$;
create trigger adaptive_versions_seal before insert on public.adaptive_version_sets
for each row execute function adaptive_private.seal_version_set();
create function adaptive_private.publish_question() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.adaptive_question_revisions where revision_id=new.revision_id for update;
  if new.status='active' and (not exists(select 1 from adaptive_private.grading_keys where revision_id=new.revision_id)
    or not exists(select 1 from public.adaptive_answer_components where revision_id=new.revision_id)) then
    raise exception 'Publishing requires a secured grading key and stable components' using errcode='23514';
  end if;
  -- The service verifies a human publication approver before recording actor_id.
  new.event_index := nextval('public.adaptive_question_publications_event_index_seq'::regclass);
  new.occurred_at := clock_timestamp();
  return new;
end;
$$;
create trigger adaptive_question_publication before insert on public.adaptive_question_publications
for each row execute function adaptive_private.publish_question();
create function adaptive_private.guard_component_append() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.adaptive_question_revisions where revision_id=new.revision_id for update;
  if exists(select 1 from public.adaptive_question_publications where revision_id=new.revision_id)
    or exists(select 1 from public.adaptive_session_items where revision_id=new.revision_id) then
    raise exception 'Referenced/published revisions cannot acquire answer components' using errcode='55000';
  end if;
  return new;
end;
$$;
create trigger adaptive_components_sealed before insert on public.adaptive_answer_components
for each row execute function adaptive_private.guard_component_append();
create trigger adaptive_concepts_sealed before insert on public.adaptive_concepts
for each row execute function adaptive_private.guard_mapping_append();
create trigger adaptive_relationships_sealed before insert on public.adaptive_relationships
for each row execute function adaptive_private.guard_mapping_append();
create trigger adaptive_question_mappings_sealed before insert on public.adaptive_question_mappings
for each row execute function adaptive_private.guard_mapping_append();
create trigger adaptive_content_mappings_sealed before insert on public.adaptive_content_mappings
for each row execute function adaptive_private.guard_mapping_append();

-- Query/FK indexes not already covered by a leftmost primary/unique index.
create index adaptive_version_sets_algorithm on public.adaptive_version_sets(algorithm_version);
create index adaptive_version_sets_configuration on public.adaptive_version_sets(configuration_version);
create index adaptive_sessions_versions on public.adaptive_sessions(mapping_version,algorithm_version,configuration_version);
create index adaptive_recommendations_concept on public.adaptive_recommendations(owner_id,concept_id,created_at);
create index adaptive_recommendations_source on public.adaptive_recommendations(owner_id,source_evidence_id);
create index adaptive_recommendations_mapping on public.adaptive_recommendations(mapping_version,concept_id);
create index adaptive_recommendations_content on public.adaptive_recommendations(content_revision_id);
create index adaptive_interventions_recommendation on public.adaptive_interventions(owner_id,recommendation_id);
create index adaptive_interventions_source on public.adaptive_interventions(owner_id,source_evidence_id);
create index adaptive_interventions_mapping on public.adaptive_interventions(mapping_version,concept_id);
create index adaptive_interventions_content on public.adaptive_interventions(content_revision_id);
create index adaptive_tasks_source on public.adaptive_review_tasks(owner_id,source_evidence_id);
create index adaptive_tasks_target on public.adaptive_review_tasks(target_revision_id);
create index adaptive_tasks_mapping on public.adaptive_review_tasks(mapping_version,concept_id);
create index adaptive_task_events_completion on public.adaptive_review_task_events(owner_id,completion_evidence_id);
create index adaptive_projections_mapping on public.adaptive_concept_projections(mapping_version,concept_id);
create index adaptive_projections_task on public.adaptive_concept_projections(owner_id,next_due_task_id);
create index adaptive_evidence_recommendation on public.adaptive_answer_evidence(owner_id,recommendation_id);
create index adaptive_evidence_intervention on public.adaptive_answer_evidence(owner_id,intervention_id);

alter table public.adaptive_versions enable row level security;
revoke all on table public.adaptive_versions from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_versions to service_role;
create trigger adaptive_versions_immutable before update or delete on public.adaptive_versions
for each row execute function adaptive_private.reject_change();
create trigger adaptive_versions_no_truncate before truncate on public.adaptive_versions
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_versions to authenticated;
create policy adaptive_versions_read on public.adaptive_versions for select to authenticated using (review_status='human_approved');

alter table adaptive_private.version_payloads enable row level security;
revoke all on table adaptive_private.version_payloads from public, anon, authenticated, service_role;
grant select, insert on table adaptive_private.version_payloads to service_role;
create trigger version_payloads_immutable before update or delete on adaptive_private.version_payloads
for each row execute function adaptive_private.reject_change();
create trigger version_payloads_no_truncate before truncate on adaptive_private.version_payloads
for each statement execute function adaptive_private.reject_change();

alter table public.adaptive_version_events enable row level security;
revoke all on table public.adaptive_version_events from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_version_events to service_role;
create trigger adaptive_version_events_immutable before update or delete on public.adaptive_version_events
for each row execute function adaptive_private.reject_change();
create trigger adaptive_version_events_no_truncate before truncate on public.adaptive_version_events
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_version_events to authenticated;
create policy adaptive_version_events_read on public.adaptive_version_events for select to authenticated using (exists(select 1 from public.adaptive_versions v where v.version_id=adaptive_version_events.version_id and v.review_status='human_approved'));

alter table public.adaptive_version_sets enable row level security;
revoke all on table public.adaptive_version_sets from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_version_sets to service_role;
create trigger adaptive_version_sets_immutable before update or delete on public.adaptive_version_sets
for each row execute function adaptive_private.reject_change();
create trigger adaptive_version_sets_no_truncate before truncate on public.adaptive_version_sets
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_version_sets to authenticated;
create policy adaptive_version_sets_read on public.adaptive_version_sets for select to authenticated using (adaptive_private.version_active(mapping_version) and adaptive_private.version_active(algorithm_version) and adaptive_private.version_active(configuration_version));

alter table public.adaptive_concepts enable row level security;
revoke all on table public.adaptive_concepts from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_concepts to service_role;
create trigger adaptive_concepts_immutable before update or delete on public.adaptive_concepts
for each row execute function adaptive_private.reject_change();
create trigger adaptive_concepts_no_truncate before truncate on public.adaptive_concepts
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_concepts to authenticated;
create policy adaptive_concepts_read on public.adaptive_concepts for select to authenticated using (review_status='human_approved' and adaptive_private.version_active(mapping_version));

alter table public.adaptive_relationships enable row level security;
revoke all on table public.adaptive_relationships from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_relationships to service_role;
create trigger adaptive_relationships_immutable before update or delete on public.adaptive_relationships
for each row execute function adaptive_private.reject_change();
create trigger adaptive_relationships_no_truncate before truncate on public.adaptive_relationships
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_relationships to authenticated;
create policy adaptive_relationships_read on public.adaptive_relationships for select to authenticated using (review_status='human_approved' and adaptive_private.version_active(mapping_version) and exists(select 1 from public.adaptive_concepts c where c.mapping_version=adaptive_relationships.mapping_version and c.concept_id=source_concept_id) and exists(select 1 from public.adaptive_concepts c where c.mapping_version=adaptive_relationships.mapping_version and c.concept_id=target_concept_id));

alter table public.adaptive_question_revisions enable row level security;
revoke all on table public.adaptive_question_revisions from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_question_revisions to service_role;
create trigger adaptive_question_revisions_immutable before update or delete on public.adaptive_question_revisions
for each row execute function adaptive_private.reject_change();
create trigger adaptive_question_revisions_no_truncate before truncate on public.adaptive_question_revisions
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_question_revisions to authenticated;
create policy adaptive_question_revisions_read on public.adaptive_question_revisions for select to authenticated using ((select p.status from public.adaptive_question_publications p where p.revision_id=adaptive_question_revisions.revision_id order by p.event_index desc limit 1)='active');

alter table public.adaptive_question_publications enable row level security;
revoke all on table public.adaptive_question_publications from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_question_publications to service_role;
create trigger adaptive_question_publications_immutable before update or delete on public.adaptive_question_publications
for each row execute function adaptive_private.reject_change();
create trigger adaptive_question_publications_no_truncate before truncate on public.adaptive_question_publications
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_question_publications to authenticated;
create policy adaptive_question_publications_read on public.adaptive_question_publications for select to authenticated using (true);

alter table public.adaptive_answer_components enable row level security;
revoke all on table public.adaptive_answer_components from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_answer_components to service_role;
create trigger adaptive_answer_components_immutable before update or delete on public.adaptive_answer_components
for each row execute function adaptive_private.reject_change();
create trigger adaptive_answer_components_no_truncate before truncate on public.adaptive_answer_components
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_answer_components to authenticated;
create policy adaptive_answer_components_read on public.adaptive_answer_components for select to authenticated using (exists(select 1 from public.adaptive_question_revisions q where q.revision_id=adaptive_answer_components.revision_id));

alter table adaptive_private.grading_keys enable row level security;
revoke all on table adaptive_private.grading_keys from public, anon, authenticated, service_role;
grant select, insert on table adaptive_private.grading_keys to service_role;
create trigger grading_keys_immutable before update or delete on adaptive_private.grading_keys
for each row execute function adaptive_private.reject_change();
create trigger grading_keys_no_truncate before truncate on adaptive_private.grading_keys
for each statement execute function adaptive_private.reject_change();

alter table public.adaptive_question_mappings enable row level security;
revoke all on table public.adaptive_question_mappings from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_question_mappings to service_role;
create trigger adaptive_question_mappings_immutable before update or delete on public.adaptive_question_mappings
for each row execute function adaptive_private.reject_change();
create trigger adaptive_question_mappings_no_truncate before truncate on public.adaptive_question_mappings
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_question_mappings to authenticated;
create policy adaptive_question_mappings_read on public.adaptive_question_mappings for select to authenticated using (review_status='human_approved' and adaptive_private.version_active(mapping_version) and exists(select 1 from public.adaptive_concepts c where c.mapping_version=adaptive_question_mappings.mapping_version and c.concept_id=adaptive_question_mappings.concept_id));

alter table public.adaptive_content_revisions enable row level security;
revoke all on table public.adaptive_content_revisions from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_content_revisions to service_role;
create trigger adaptive_content_revisions_immutable before update or delete on public.adaptive_content_revisions
for each row execute function adaptive_private.reject_change();
create trigger adaptive_content_revisions_no_truncate before truncate on public.adaptive_content_revisions
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_content_revisions to authenticated;
create policy adaptive_content_revisions_read on public.adaptive_content_revisions for select to authenticated using (exists(select 1 from public.adaptive_content_mappings m where m.content_revision_id=adaptive_content_revisions.content_revision_id));

alter table public.adaptive_content_mappings enable row level security;
revoke all on table public.adaptive_content_mappings from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_content_mappings to service_role;
create trigger adaptive_content_mappings_immutable before update or delete on public.adaptive_content_mappings
for each row execute function adaptive_private.reject_change();
create trigger adaptive_content_mappings_no_truncate before truncate on public.adaptive_content_mappings
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_content_mappings to authenticated;
create policy adaptive_content_mappings_read on public.adaptive_content_mappings for select to authenticated using (review_status='human_approved' and adaptive_private.version_active(mapping_version) and exists(select 1 from public.adaptive_concepts c where c.mapping_version=adaptive_content_mappings.mapping_version and c.concept_id=adaptive_content_mappings.concept_id));

alter table adaptive_private.owner_state enable row level security;
revoke all on table adaptive_private.owner_state from public, anon, authenticated, service_role;
grant select, insert, update on table adaptive_private.owner_state to service_role;

alter table public.adaptive_sessions enable row level security;
revoke all on table public.adaptive_sessions from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_sessions to service_role;
create trigger adaptive_sessions_immutable before update or delete on public.adaptive_sessions
for each row execute function adaptive_private.reject_change();
create trigger adaptive_sessions_no_truncate before truncate on public.adaptive_sessions
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_sessions to authenticated;
create policy adaptive_sessions_read on public.adaptive_sessions for select to authenticated using ((select auth.uid()) = owner_id and adaptive_private.version_active(adaptive_sessions.mapping_version) and adaptive_private.version_active(adaptive_sessions.algorithm_version) and adaptive_private.version_active(adaptive_sessions.configuration_version));

alter table public.adaptive_session_items enable row level security;
revoke all on table public.adaptive_session_items from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_session_items to service_role;
create trigger adaptive_session_items_immutable before update or delete on public.adaptive_session_items
for each row execute function adaptive_private.reject_change();
create trigger adaptive_session_items_no_truncate before truncate on public.adaptive_session_items
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_session_items to authenticated;
create policy adaptive_session_items_read on public.adaptive_session_items for select to authenticated using ((select auth.uid()) = owner_id and exists(select 1 from public.adaptive_sessions s where s.owner_id=adaptive_session_items.owner_id and s.session_id=adaptive_session_items.session_id));

alter table public.adaptive_session_events enable row level security;
revoke all on table public.adaptive_session_events from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_session_events to service_role;
create trigger adaptive_session_events_immutable before update or delete on public.adaptive_session_events
for each row execute function adaptive_private.reject_change();
create trigger adaptive_session_events_no_truncate before truncate on public.adaptive_session_events
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_session_events to authenticated;
create policy adaptive_session_events_read on public.adaptive_session_events for select to authenticated using ((select auth.uid()) = owner_id and exists(select 1 from public.adaptive_sessions s where s.owner_id=adaptive_session_events.owner_id and s.session_id=adaptive_session_events.session_id));

alter table public.adaptive_answer_evidence enable row level security;
revoke all on table public.adaptive_answer_evidence from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_answer_evidence to service_role;
create trigger adaptive_answer_evidence_immutable before update or delete on public.adaptive_answer_evidence
for each row execute function adaptive_private.reject_change();
create trigger adaptive_answer_evidence_no_truncate before truncate on public.adaptive_answer_evidence
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_answer_evidence to authenticated;
create policy adaptive_answer_evidence_read on public.adaptive_answer_evidence for select to authenticated using ((select auth.uid()) = owner_id and adaptive_private.version_active(adaptive_answer_evidence.mapping_version) and adaptive_private.version_active(adaptive_answer_evidence.algorithm_version) and adaptive_private.version_active(adaptive_answer_evidence.configuration_version));

alter table public.adaptive_recommendations enable row level security;
revoke all on table public.adaptive_recommendations from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_recommendations to service_role;
create trigger adaptive_recommendations_immutable before update or delete on public.adaptive_recommendations
for each row execute function adaptive_private.reject_change();
create trigger adaptive_recommendations_no_truncate before truncate on public.adaptive_recommendations
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_recommendations to authenticated;
create policy adaptive_recommendations_read on public.adaptive_recommendations for select to authenticated using ((select auth.uid()) = owner_id and adaptive_private.version_active(adaptive_recommendations.mapping_version) and adaptive_private.version_active(adaptive_recommendations.algorithm_version) and adaptive_private.version_active(adaptive_recommendations.configuration_version));

alter table public.adaptive_interventions enable row level security;
revoke all on table public.adaptive_interventions from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_interventions to service_role;
create trigger adaptive_interventions_immutable before update or delete on public.adaptive_interventions
for each row execute function adaptive_private.reject_change();
create trigger adaptive_interventions_no_truncate before truncate on public.adaptive_interventions
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_interventions to authenticated;
create policy adaptive_interventions_read on public.adaptive_interventions for select to authenticated using ((select auth.uid()) = owner_id and adaptive_private.version_active(adaptive_interventions.mapping_version) and adaptive_private.version_active(adaptive_interventions.algorithm_version) and adaptive_private.version_active(adaptive_interventions.configuration_version));

alter table public.adaptive_review_tasks enable row level security;
revoke all on table public.adaptive_review_tasks from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_review_tasks to service_role;
create trigger adaptive_review_tasks_immutable before update or delete on public.adaptive_review_tasks
for each row execute function adaptive_private.reject_change();
create trigger adaptive_review_tasks_no_truncate before truncate on public.adaptive_review_tasks
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_review_tasks to authenticated;
create policy adaptive_review_tasks_read on public.adaptive_review_tasks for select to authenticated using ((select auth.uid()) = owner_id and adaptive_private.version_active(adaptive_review_tasks.mapping_version) and adaptive_private.version_active(adaptive_review_tasks.algorithm_version) and adaptive_private.version_active(adaptive_review_tasks.configuration_version));

alter table public.adaptive_review_task_events enable row level security;
revoke all on table public.adaptive_review_task_events from public, anon, authenticated, service_role;
grant select, insert on table public.adaptive_review_task_events to service_role;
create trigger adaptive_review_task_events_immutable before update or delete on public.adaptive_review_task_events
for each row execute function adaptive_private.reject_change();
create trigger adaptive_review_task_events_no_truncate before truncate on public.adaptive_review_task_events
for each statement execute function adaptive_private.reject_change();
grant select on table public.adaptive_review_task_events to authenticated;
create policy adaptive_review_task_events_read on public.adaptive_review_task_events for select to authenticated using ((select auth.uid()) = owner_id and exists(select 1 from public.adaptive_review_tasks t where t.owner_id=adaptive_review_task_events.owner_id and t.task_id=adaptive_review_task_events.task_id));

alter table public.adaptive_concept_projections enable row level security;
revoke all on table public.adaptive_concept_projections from public, anon, authenticated, service_role;
grant select, insert, update on table public.adaptive_concept_projections to service_role;
grant select on table public.adaptive_concept_projections to authenticated;
create policy adaptive_concept_projections_read on public.adaptive_concept_projections for select to authenticated using ((select auth.uid()) = owner_id and adaptive_private.version_active(adaptive_concept_projections.mapping_version) and adaptive_private.version_active(adaptive_concept_projections.algorithm_version) and adaptive_private.version_active(adaptive_concept_projections.configuration_version));

-- SELECT FOR UPDATE requires an UPDATE privilege. Permit the identity column solely
-- for trigger row locking; immutable BEFORE UPDATE triggers still reject all edits.
grant update (version_id) on table public.adaptive_versions to service_role;
grant update (revision_id) on table public.adaptive_question_revisions to service_role;

-- Public catalogue policies are intentionally SELECT-only. Learner policies always bind owner_id.
-- Explicit sequence/function privileges neutralize project-dependent default grants.
revoke all on all sequences in schema adaptive_private from public, anon, authenticated;
revoke all on sequence public.adaptive_version_events_event_index_seq from public, anon, authenticated, service_role;
grant usage, select on sequence public.adaptive_version_events_event_index_seq to service_role;
revoke all on sequence public.adaptive_question_publications_event_index_seq from public, anon, authenticated, service_role;
grant usage, select on sequence public.adaptive_question_publications_event_index_seq to service_role;
revoke all on sequence public.adaptive_answer_evidence_receipt_index_seq from public, anon, authenticated, service_role;
grant usage, select on sequence public.adaptive_answer_evidence_receipt_index_seq to service_role;
revoke all on all functions in schema adaptive_private from public, anon, authenticated;
grant execute on all functions in schema adaptive_private to service_role;
-- USAGE permits name resolution only; no private table privileges or RLS policies are granted.
grant usage on schema adaptive_private to authenticated;
grant execute on function adaptive_private.version_active(text) to authenticated;
commit;
