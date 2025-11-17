## O Que Falta Para Fechar o Banco
- Normalizar conteúdo reutilizável e recomendações:
  - Tabela `text_blocks` para blocos de texto reutilizáveis por modalidade e tags
  - Tabela `recommendations` para sugestões orientadas por contexto
- Autocomplete e cache assistidos pelo banco:
  - Tabela `lexicon` com n‑grams por modalidade para pré‑popular Redis
- Notificação em tempo real para invalidação de cache:
  - Função `notify_change()` com `pg_notify('events', payload_json)`
  - Triggers em `templates`, `findings`, `smart_sentences`
- Views de leitura rápida para mobile:
  - `v_templates_public` filtrando `published/scope`
  - `v_sentences_by_mod` agrupando por modalidade e categoria
- Regras e segurança adicionais:
  - RLS em `template_versions` (via join), `smart_sentences` somente leitura pública
  - Check de estrutura de template: função `validate_template_structure(jsonb)` + constraint
- Otimizações:
  - Índices adicionais: `(scope, published)`, `usage_history (modality)`, GIN em `usage_history.metadata`
  - Particionamento opcional de `usage_history` por mês

## Mudanças Que Vou Aplicar
1) Atualizar `db/schema.sql` adicionando:
- Tabelas `text_blocks`, `recommendations`, `lexicon`
- Views `v_templates_public`, `v_sentences_by_mod`
- Funções `notify_change()`, `validate_template_structure(jsonb)`
- Triggers `tg_*_notify` para três entidades
- Índices adicionais citados
- Política RLS de leitura em `template_versions` via view
2) Incluir exemplos de consultas essenciais:
- Busca semântica em achados e frases
- Delta sync com `get_changes`
- Autocomplete por prefixo via `lexicon`

## DDL Resumida (será inserida no arquivo)
```sql
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
  perform pg_notify('events', json_build_object('table', tg_table_name, 'op', tg_op,
      'id', coalesce(new.template_id,new.finding_id,new.frase_id), 'at', now())::text);
  return coalesce(new, old);
end $$;

-- Triggers de notify para três entidades
create trigger tg_templates_notify after insert or update or delete on templates for each row execute function notify_change();
create trigger tg_findings_notify after insert or update or delete on findings for each row execute function notify_change();
create trigger tg_sentences_notify after insert or update or delete on smart_sentences for each row execute function notify_change();

create or replace view v_templates_public as
  select template_id, title, modality, structure_json, version, sort_order, tags, updated_at
  from templates
  where published and scope='public';

create or replace view v_sentences_by_mod as
  select frase_id, modality, category_id, text, variables, tags, updated_at
  from smart_sentences;

-- Índices adicionais
create index if not exists idx_templates_scope_pub on templates(scope, published);
create index if not exists idx_usage_mod on usage_history(modality);
create index if not exists idx_usage_meta on usage_history using gin (metadata);

-- Particionamento opcional de usage_history por mês (esqueleto)
-- create table usage_history_y2025m11 partition of usage_history for values from ('2025-11-01') to ('2025-12-01');
```

## Consultas Essenciais (para reference)
```sql
-- Semântica em achados
select finding_id, description
from findings
order by embed_vector <=> :qvec
limit 20;

-- Semântica em frases
select frase_id, text
from smart_sentences
where modality = :mod
order by embed_vector <=> :qvec
limit 20;

-- Delta sync (templates e frases)
select * from get_changes(:since, array['templates','smart_sentences']);

-- Autocomplete via lexicon
select ngram from lexicon where modality=:mod and ngram ilike :prefix||'%' order by freq desc limit 8;
```

## Benefícios
- Leitura ainda mais rápida via views, índices e cache por notificação
- Catálogo ampliado (text blocks e recomendações) para IA sugerir rápido
- Autocomplete híbrido: dicionário local/Redis + PGVector quando necessário
- Validade de templates garantida por constraint

Aprovo a execução dessas mudanças no arquivo `db/schema.sql` e a criação lógica das novas entidades para completar o banco?