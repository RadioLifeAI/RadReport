create extension if not exists vector;
create extension if not exists pg_trgm;
create extension if not exists citext;

do $$ begin
  create type modality as enum ('TC','RM','USG','RX','Mamografia','Doppler','PET_CT','Outro');
exception when duplicate_object then null; end $$;

create table if not exists users (
  user_id uuid primary key,
  email citext unique not null,
  created_at timestamptz default now()
);

create table if not exists categories (
  category_id uuid primary key default gen_random_uuid(),
  name text not null,
  modality modality not null,
  parent_id uuid references categories(category_id) on delete set null
);

create table if not exists templates (
  template_id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(user_id),
  title text not null,
  modality modality not null,
  structure_json jsonb not null,
  version int not null default 1,
  sort_order int not null default 0,
  tags text[] default '{}',
  scope text not null default 'public',
  published boolean not null default true,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists template_versions (
  template_version_id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates(template_id) on delete cascade,
  version int not null,
  structure_json jsonb not null,
  changelog text,
  created_at timestamptz not null default now(),
  unique (template_id, version)
);

create table if not exists findings (
  finding_id uuid primary key default gen_random_uuid(),
  modality modality not null,
  category_id uuid references categories(category_id),
  description text not null,
  ready_phrase text,
  embed_vector vector(1536),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists smart_sentences (
  frase_id uuid primary key default gen_random_uuid(),
  modality modality,
  category_id uuid references categories(category_id),
  text text not null,
  variables jsonb default '{}'::jsonb,
  embed_vector vector(1536),
  tags text[] default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists user_preferences (
  user_id uuid primary key references users(user_id) on delete cascade,
  favorite_templates uuid[] default '{}',
  favorite_sentences uuid[] default '{}',
  dark_mode boolean default true,
  voice_name text,
  voice_rate numeric(4,2) default 1.0,
  style_prefs jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists usage_history (
  historico_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(user_id) on delete cascade,
  template_id uuid references templates(template_id),
  frases_usadas uuid[] default '{}',
  modality modality,
  action text not null default 'generate',
  metadata jsonb default '{}'::jsonb,
  ts timestamptz not null default now()
);

create table if not exists change_log (
  id bigserial primary key,
  entity text not null,
  entity_id uuid not null,
  op text not null,
  updated_at timestamptz not null default now()
);

create table if not exists deleted_items (
  entity text not null,
  entity_id uuid not null,
  deleted_at timestamptz not null default now(),
  primary key (entity, entity_id)
);

create index if not exists idx_templates_modality on templates(modality);
create index if not exists idx_templates_updated_at on templates(updated_at);
create index if not exists idx_templates_tags on templates using gin (tags gin_trgm_ops);
create index if not exists idx_templates_structure on templates using gin (structure_json jsonb_path_ops);

create index if not exists idx_findings_modality on findings(modality);
create index if not exists idx_findings_vector on findings using ivfflat (embed_vector vector_cosine_ops) with (lists=100);

create index if not exists idx_sentences_modality on smart_sentences(modality);
create index if not exists idx_sentences_vector on smart_sentences using ivfflat (embed_vector vector_cosine_ops) with (lists=100);
create index if not exists idx_sentences_tags on smart_sentences using gin (tags gin_trgm_ops);

create index if not exists idx_usage_user_ts on usage_history(user_id, ts desc);
create index if not exists idx_changelog_entity_time on change_log(entity, updated_at desc);

create or replace function app_user_id() returns uuid language sql stable as $$
  select nullif(current_setting('app.user_id', true),'')::uuid
$$;

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;

do $$ begin
  if not exists(select 1 from pg_trigger where tgname='tg_templates_updated_at') then
    create trigger tg_templates_updated_at before update on templates for each row execute function set_updated_at();
  end if;
  if not exists(select 1 from pg_trigger where tgname='tg_findings_updated_at') then
    create trigger tg_findings_updated_at before update on findings for each row execute function set_updated_at();
  end if;
  if not exists(select 1 from pg_trigger where tgname='tg_sentences_updated_at') then
    create trigger tg_sentences_updated_at before update on smart_sentences for each row execute function set_updated_at();
  end if;
end $$;

create or replace function log_change() returns trigger language plpgsql as $$
begin
  insert into change_log(entity, entity_id, op, updated_at) values (tg_table_name, coalesce(new.template_id,new.finding_id,new.frase_id), tg_op, now());
  return coalesce(new, old);
end $$;

do $$ begin
  if not exists(select 1 from pg_trigger where tgname='tg_templates_change') then
    create trigger tg_templates_change after insert or update on templates for each row execute function log_change();
  end if;
  if not exists(select 1 from pg_trigger where tgname='tg_findings_change') then
    create trigger tg_findings_change after insert or update on findings for each row execute function log_change();
  end if;
  if not exists(select 1 from pg_trigger where tgname='tg_sentences_change') then
    create trigger tg_sentences_change after insert or update on smart_sentences for each row execute function log_change();
  end if;
end $$;

create or replace function log_delete() returns trigger language plpgsql as $$
begin
  insert into deleted_items(entity, entity_id, deleted_at) values (tg_table_name, coalesce(old.template_id,old.finding_id,old.frase_id), now());
  insert into change_log(entity, entity_id, op, updated_at) values (tg_table_name, coalesce(old.template_id,old.finding_id,old.frase_id), 'delete', now());
  return old;
end $$;

do $$ begin
  if not exists(select 1 from pg_trigger where tgname='tg_templates_delete') then
    create trigger tg_templates_delete after delete on templates for each row execute function log_delete();
  end if;
  if not exists(select 1 from pg_trigger where tgname='tg_findings_delete') then
    create trigger tg_findings_delete after delete on findings for each row execute function log_delete();
  end if;
  if not exists(select 1 from pg_trigger where tgname='tg_sentences_delete') then
    create trigger tg_sentences_delete after delete on smart_sentences for each row execute function log_delete();
  end if;
end $$;

alter table templates enable row level security;
alter table user_preferences enable row level security;
alter table usage_history enable row level security;

do $$ begin
  if not exists(select 1 from pg_policies where polname='tpl_select') then
    create policy tpl_select on templates for select using (published and scope='public' or owner_id = app_user_id());
  end if;
  if not exists(select 1 from pg_policies where polname='tpl_modify') then
    create policy tpl_modify on templates for all to public using (owner_id = app_user_id()) with check (owner_id = app_user_id());
  end if;
  if not exists(select 1 from pg_policies where polname='prefs_rw') then
    create policy prefs_rw on user_preferences for all using (user_id = app_user_id()) with check (user_id = app_user_id());
  end if;
  if not exists(select 1 from pg_policies where polname='usage_rw') then
    create policy usage_rw on usage_history for all using (user_id = app_user_id()) with check (user_id = app_user_id());
  end if;
end $$;

create or replace function get_changes(since timestamptz, entities text[]) returns table(entity text, entity_id uuid, op text, updated_at timestamptz) language sql stable as $$
  select c.entity, c.entity_id, c.op, c.updated_at from change_log c where c.updated_at > since and (entities is null or c.entity = any(entities)) order by c.updated_at asc limit 1000
$$;

insert into categories(category_id,name,modality) values
  (gen_random_uuid(),'Abdome','USG'),
  (gen_random_uuid(),'Tórax','TC')
on conflict do nothing;

-- NOVAS ENTIDADES

create table if not exists text_blocks(
  block_id uuid primary key default gen_random_uuid(),
  modality modality,
  title text not null,
  content text not null,
  tags text[] default '{}',
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
create index if not exists idx_text_blocks_mod on text_blocks(modality);
create index if not exists idx_text_blocks_tags on text_blocks using gin(tags gin_trgm_ops);

create table if not exists recommendations(
  rec_id uuid primary key default gen_random_uuid(),
  modality modality,
  category_id uuid references categories(category_id),
  trigger_terms text[] default '{}',
  suggested_sentence uuid references smart_sentences(frase_id),
  weight numeric(6,3) default 0.5,
  updated_at timestamptz default now()
);
create index if not exists idx_recommendations_mod on recommendations(modality);

create table if not exists lexicon(
  lex_id bigserial primary key,
  modality modality not null,
  ngram text not null,
  freq int not null default 1
);
create index if not exists idx_lex_mod_ngram on lexicon(modality, ngram);

create or replace function validate_template_structure(j jsonb) returns boolean language sql immutable as $$
  select j ? 'sections' and jsonb_typeof(j->'sections')='array'
$$;
alter table templates add column if not exists structure_valid boolean generated always as (validate_template_structure(structure_json)) stored;
create index if not exists idx_templates_valid on templates(structure_valid) where structure_valid is false;

create or replace function notify_change() returns trigger language plpgsql as $$
begin
  perform pg_notify('events', json_build_object('table', tg_table_name, 'op', tg_op, 'id', coalesce(new.template_id,new.finding_id,new.frase_id), 'at', now())::text);
  return coalesce(new, old);
end $$;

do $$ begin
  if not exists(select 1 from pg_trigger where tgname='tg_templates_notify') then
    create trigger tg_templates_notify after insert or update or delete on templates for each row execute function notify_change();
  end if;
  if not exists(select 1 from pg_trigger where tgname='tg_findings_notify') then
    create trigger tg_findings_notify after insert or update or delete on findings for each row execute function notify_change();
  end if;
  if not exists(select 1 from pg_trigger where tgname='tg_sentences_notify') then
    create trigger tg_sentences_notify after insert or update or delete on smart_sentences for each row execute function notify_change();
  end if;
end $$;

create or replace view v_templates_public as
  select template_id, title, modality, structure_json, version, sort_order, tags, updated_at
  from templates
  where published and scope='public';

create or replace view v_sentences_by_mod as
  select frase_id, modality, category_id, text, variables, tags, updated_at
  from smart_sentences;

create index if not exists idx_templates_scope_pub on templates(scope, published);
create index if not exists idx_usage_mod on usage_history(modality);
create index if not exists idx_usage_meta on usage_history using gin (metadata);

-- IA: Armazenamento de embeddings para RAG
create table if not exists embeddings_store(
  entity text not null,
  entity_id uuid not null,
  modality modality not null,
  title text,
  text text not null,
  embed_vector vector(1536),
  updated_at timestamptz not null default now(),
  primary key(entity, entity_id)
);
create index if not exists idx_embed_mod on embeddings_store(modality);
create index if not exists idx_embed_vec on embeddings_store using ivfflat (embed_vector vector_cosine_ops) with (lists=100);

-- IA: comandos de voz reconhecidos
create table if not exists voice_commands(
  cmd_id uuid primary key default gen_random_uuid(),
  phrase text not null,
  intent text not null,
  slots jsonb default '{}'::jsonb,
  modality modality,
  updated_at timestamptz not null default now()
);

-- IA: preferências/estilo aprendidas do usuário (sem PII)
create table if not exists user_style_stats(
  user_id uuid primary key,
  terms jsonb default '{}'::jsonb,
  tone jsonb default '{}'::jsonb,
  last_update timestamptz not null default now()
);

-- IA: log de sugestões (somente métricas, zero PII)
create table if not exists ai_suggestion_log(
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  modality modality,
  input_len int,
  output_len int,
  latency_ms int,
  suggestion_type text,
  accepted boolean,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_sugg_user_time on ai_suggestion_log(user_id, created_at desc);