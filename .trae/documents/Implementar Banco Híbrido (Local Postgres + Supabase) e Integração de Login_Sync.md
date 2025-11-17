## Objetivo
Criar e integrar um banco de dados híbrido: Postgres local (offline‑first) + Supabase cloud (master), com login funcionando e sincronização bidirecional (push/pull) sem perda de dados.

## Estrutura de Dados (DDL)
### Comum (local e cloud)
- `users(user_id uuid pk, email text unique not null, name text null, picture text null, updated_at timestamptz default now())`
- `user_providers(user_id uuid fk users, provider text, provider_id text, updated_at timestamptz default now(), primary key(user_id, provider))`
- `users_auth(user_id uuid pk fk users, password_hash text not null, password_version smallint default 1, failed_attempts int default 0, locked_until timestamptz null, created_at timestamptz default now(), updated_at timestamptz default now())`
- Índices: `create unique index users_email_lower_unique on users(lower(email));`
- Habilitar `pgcrypto` (para `gen_random_uuid()`) OU `uuid-ossp` (para `uuid_generate_v4()`).

### Tabelas de negócio (exemplos existentes)
- `templates`, `smart_sentences`, `findings`, `reports` — incluir colunas `version bigint default 0`, `updated_at timestamptz not null`, `updated_by uuid` para controle de sync.

### Sync/Audit (local)
- `audit_log(op_id uuid pk, entity text, entity_id uuid, op_type text, payload jsonb, device_id text, user_id uuid, ts timestamptz default now())`
- `outbox(op_id uuid pk, delivered boolean default false, ts timestamptz default now())`
- `sync_state(id int pk default 1, last_pushed_at timestamptz, last_pulled_at timestamptz, last_seen_cloud_version bigint default 0)`

### Audit (cloud)
- `audit_log_cloud(op_id uuid pk, entity text, entity_id uuid, op_type text, payload jsonb, device_id text, user_id uuid, ts timestamptz default now())`

## Supabase (Cloud)
- Criar projeto e executar DDL acima (schema idêntico ao local).
- Ativar RLS nas tabelas sensíveis (ex.: `reports`, `templates` públicos via view; `users` restrito). Políticas por `user_id`.
- Service role key será usada apenas pelo backend para sync (NUNCA no frontend).

## Backend (Local API) – Ajustes
- Login local permanece em `/v1/auth/*` (email/senha e Google GIS). 
- Ao criar/atualizar usuário local, replicar mudanças para Supabase (async) usando service role:
  - `POST /v1/cloud/users/upsert` interno (ou direto via lib Supabase no servidor).
- Endpoints de sync:
  - `POST /v1/sync/push` (local→cloud): envia lotes do `outbox` com `audit_log`.
  - `GET /v1/sync/pull?since=<ts>&entities=...` (cloud→local): retorna mudanças com `version`/`updated_at`.
- Triggers (local): em `INSERT/UPDATE/DELETE` nas tabelas de negócio, preencher `audit_log` e `outbox`, incrementar `version`, atualizar `updated_at`/`updated_by`.
- Triggers (cloud): aplicar `push`, atualizar tabelas e registrar em `audit_log_cloud` (transações por lote, idempotência por `op_id`).

## Frontend (App)
- DataService:
  - Detectar online/offline; quando voltar online, chamar `push` e `pull` (delta incremental).
  - Fluxo de cadastro/login: ao sucesso, redirecionar `/app`; a replicação cloud é responsabilidade do backend.
- Editor e barra lateral: continuam funcionando offline; preferências salvas localmente e sincronizadas quando online.

## Segurança
- CSRF nos endpoints que setam cookies (login/logout/refresh).
- Cookies: `HttpOnly`, `SameSite='strict'`, `Secure` em produção, `path='/v1/auth/refresh'`.
- RLS no Supabase; acesso administrativo apenas via service role no backend.
- Idempotência por `op_id` nos endpoints de sync.

## Observabilidade
- Correlação por `op_id` e `correlation_id` (middleware existente).
- Métricas: contagem de ops aplicadas, conflitos, latência.

## Passos de Execução
1) Provisionar DDL no Supabase (extensions + tabelas + índices + RLS básica).
2) Garantir DDL idêntico no Postgres local (já automatizado no boot do servidor).
3) Implementar triggers no local para outbox/audit e incrementar versões.
4) Implementar endpoints `/v1/sync/push` e `/v1/sync/pull` no backend, com transações e idempotência.
5) Adicionar replicação de usuários para cloud após cadastro/login.
6) Validar fluxo offline→online (laudos e entidades) e login/cadastro.

## Critérios de Aceite
- Cadastro/login funcionam e entram no editor.
- Modificações offline são aplicadas no Postgres local.
- Ao voltar online, `push`/`pull` sincronizam com Supabase sem perda de dados.

Posso começar criando as tabelas de audit/outbox e os endpoints `push/pull` no backend, além de scripts SQL para o Supabase? 