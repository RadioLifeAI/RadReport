## Escopo da Execução
- Criar DDL de audit/outbox/sync_state (local + cloud).
- Implementar endpoints `/v1/sync/push` e `/v1/sync/pull` (idempotentes, transações por lote).
- Adicionar triggers nas tabelas de negócio para registrar operações no `audit_log` e enfileirar `outbox`.
- Ligar cadastro/login ao fluxo de replicação de usuários (upsert no cloud).
- Validar offline→online com testes.

## Passo 1 — DDL (Local e Supabase)
- Extensões:
  - `create extension if not exists pgcrypto;` (ou `uuid-ossp`).
- Tabelas base:
  - `users(user_id uuid pk, email text unique not null, name text null, picture text null, updated_at timestamptz default now())`
  - `user_providers(user_id uuid fk users, provider text, provider_id text, updated_at timestamptz default now(), primary key(user_id, provider))`
  - `users_auth(user_id uuid pk fk users, password_hash text not null, password_version smallint default 1, failed_attempts int default 0, locked_until timestamptz null, created_at timestamptz default now(), updated_at timestamptz default now())`
  - Índice: `create unique index if not exists users_email_lower_unique on users(lower(email));`
- Controle de versão nas tabelas de negócio (ex.: `templates`, `smart_sentences`, `findings`, `reports`):
  - Colunas: `version bigint default 0`, `updated_at timestamptz not null`, `updated_by uuid`.
- Sync/Audit (local):
  - `audit_log(op_id uuid pk, entity text, entity_id uuid, op_type text check(op_type in ('insert','update','delete')), payload jsonb, device_id text, user_id uuid, ts timestamptz default now())`
  - `outbox(op_id uuid pk, delivered boolean default false, ts timestamptz default now())`
  - `sync_state(id int pk default 1, last_pushed_at timestamptz, last_pulled_at timestamptz, last_seen_cloud_version bigint default 0)`
- Audit (cloud):
  - `audit_log_cloud(op_id uuid pk, entity text, entity_id uuid, op_type text, payload jsonb, device_id text, user_id uuid, ts timestamptz default now())`
- RLS no Supabase:
  - Tabelas sensíveis (`reports`, prefs) por `user_id`; views públicas para catálogos.

## Passo 2 — Triggers (Local)
- Para cada `INSERT/UPDATE/DELETE` nas tabelas de negócio:
  - Gerar `op_id = gen_random_uuid()`
  - Inserir em `audit_log` com `op_type`, `payload` (registro novo/alterado), `device_id`, `user_id`
  - Enfileirar na `outbox(op_id)`
  - Atualizar `version = version + 1`, `updated_at = now()`, `updated_by = user_id`
- Triggers Cloud (aplicadas via `/push`):
  - Ao receber lote, upsert nas tabelas, atualizar versões e registrar em `audit_log_cloud`.

## Passo 3 — Endpoints de Sync
- `POST /v1/sync/push`
  - Body: `{ ops: Array<{ op_id, entity, entity_id, op_type, payload, version, updated_at, user_id, device_id }> }`
  - Idempotência: ignorar `op_id` já aplicado
  - Transação: aplicar todo o lote ou nada
  - Resposta: `{ applied: string[] }`
- `GET /v1/sync/pull?since=<ISO>&entities=templates,smart_sentences,...`
  - Retorna `{ changes: Array<{ entity, entity_id, payload, version, updated_at }>, nextSince }`
  - Local aplica onde `incoming.version > local.version` (LWW padrão); divergências vão para `sync_conflicts` (fase 2)

## Passo 4 — Replicação de Usuários
- Após `register`/`google login`, backend faz upsert do usuário no Supabase (service role) com `{ user_id, email, name, picture }`.
- Não expor service role no front; somente backend chama Supabase.

## Passo 5 — Frontend Ajustes
- DataService: detectar online/offline; ao voltar online, chamar `/v1/sync/push` e `/v1/sync/pull` (delta incremental com `lastSync`).
- Cadastro/Login: já redireciona para `/app`; barra lateral continua a salvar `/v1/prefs` e reflete localmente.

## Passo 6 — Testes
- Offline: criar/editar laudo, templates; voltar online → `push` aplica, `pull` traz atualizações; sem perda.
- Conflitos: alterações simultâneas — aplicar LWW por `updated_at`; CRDT em fase posterior.
- Multi-dispositivo: idempotência por `op_id` e controle por `device_id`.

## Entregáveis
- Scripts SQL (local/cloud) prontos para executar no Supabase.
- Triggers (local) e endpoints `push/pull` (backend).
- Replicação de usuários e validação end‑to‑end.

## Execução
- Vou implementar DDL/Triggers/Endpoints no backend e entregar os scripts para Supabase. Em seguida, validamos com o seu ambiente já conectado ao Supabase. Confirma o início imediato?