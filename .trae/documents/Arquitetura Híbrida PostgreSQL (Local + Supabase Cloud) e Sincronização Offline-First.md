## Visão Geral
- Meta: manter um banco PostgreSQL local 100% funcional offline e sincronizar com o master na nuvem (Supabase) quando a conectividade voltar, sem perda de dados.
- Camadas: App (SPA) → Node/Express (API local) → Postgres local; na nuvem, Node/Express (ou Supabase edge) → Supabase Postgres.

## Componentes de Dados
- Postgres Local (Primary para uso offline)
  - Tabelas de negócio (templates, smart_sentences, findings, reports, etc.) alinhadas ao schema cloud.
  - `audit_log`: registrar operações idempotentes (INSERT/UPDATE/DELETE) com `op_id (uuid)`, `entity`, `entity_id`, `op_type`, `payload jsonb`, `device_id`, `ts`, `user_id`.
  - `outbox`: fila de eventos a sincronizar (aponta para registros do `audit_log`).
  - `sync_state`: controle (`last_pushed_at`, `last_pulled_at`, `last_seen_cloud_version`).
  - Colunas de versão em tabelas principais: `version bigint default 0`, `updated_at timestamptz not null`, `updated_by uuid`.
- Supabase Cloud (Master)
  - Mesmo schema das tabelas de negócio.
  - `audit_log_cloud`: registro consolidado (para rastreabilidade/forense).
  - Políticas RLS (Row-Level Security) por `user_id`/`tenant_id`.

## Estratégia de Sincronização
- Pull (local ← cloud):
  1) Local chama `/v1/sync/pull?since=<timestamp>`.
  2) Cloud retorna lista de mudanças com `entity`, `entity_id`, `payload`, `version`, `updated_at`.
  3) Local aplica mudanças se `incoming.version > local.version` (LWW sem perda de dados). Conflitos vão para `sync_conflicts`.
- Push (local → cloud):
  1) Worker local lê `outbox` em lotes (
     `limit=100`).
  2) Posta em `/v1/sync/push` com `op_id`, `payload`, `version` atual.
  3) Cloud aplica via transação; incrementa `version` e registra em `audit_log_cloud`. Responde `applied_op_ids`.
  4) Local marca `outbox` como `delivered`/remove.
- Conflitos:
  - Critério: `incoming.version` ≤ `cloud.version` → `conflict` (já foi aplicado ou divergente).
  - Resolução: LWW por `updated_at` padrão; para campos textuais de laudo, opcional CRDT (fase 2) ou merge com flags.

## Triggers e Segurança
- Triggers (Local):
  - Em `INSERT/UPDATE/DELETE` nas tabelas de negócio:
    - Registrar no `audit_log` e enfileirar `outbox`.
    - Atualizar `version = version + 1`, `updated_at=now()`, `updated_by=user_id`.
- Triggers (Cloud):
  - Ao aplicar mudanças de `push`, atualizar `audit_log_cloud` e versões.
- RLS (Supabase):
  - Políticas por `user_id`/`tenant_id` para tabelas sensíveis.
  - Tokens JWT emitidos pelo seu backend com claims compatíveis (ou Supabase auth se preferir).

## API de Sync
- Local/Cloud endpoints (Node/Express):
  - `POST /v1/sync/push` body: `{ ops: Array<{ op_id, entity, entity_id, op_type, payload, version, updated_at, user_id, device_id }> }`
  - `GET /v1/sync/pull?since=...&entities=...` → `{ changes: [...], nextSince }`
  - Idempotência por `op_id`; transações por lote.
- Segurança:
  - CSRF nos endpoints que setam cookies; rate-limit por IP; assinatura de payload opcional com HMAC se necessário.

## Integração App (Front)
- Offline-first já existente:
  - SPA usa IndexedDB (DataService) e ETags; mantém laudos/frases offline.
- Ajuste:
  - Em modo offline, gravar operações no IndexedDB e refletir no Postgres local via API.
  - Ao voltar a conectividade, DataService chama `/v1/sync/push` e `/v1/sync/pull` (delta incremental).

## Migração para Supabase
- Passos:
  1) Criar projeto Supabase e importar schema (DDL alinhado), incluindo RLS.
  2) Configurar `DATABASE_URL` no backend cloud e chave de serviço Supabase segura.
  3) Desativar plugins WAL externos (não necessários); usar sync por aplicação (outbox/audit).
  4) Provisionar índices críticos (`lower(email)`, `version/updated_at`).

## Observabilidade
- Logs sem PII; correlação por `op_id` e `correlation_id` (já no middleware).
- Métricas: latência de sync, tamanho de lote, taxa de conflitos.

## Testes
- Caso 1: offline total → criar/editar laudo → voltar online → `push` aplicado, `pull` traz atualizações; sem perda.
- Caso 2: conflitos de edição → LWW padronizado; CRDT (fase 2) para edições simultâneas em laudos.
- Caso 3: multi-dispositivo → `device_id` diferente; idempotência por `op_id`.

## Entregáveis
- DDL completo (local/cloud) com `audit_log`, `outbox`, versões e índices.
- Endpoints `/v1/sync/push`/`/v1/sync/pull` no backend (local/cloud) com transações e idempotência.
- Triggers (local/cloud) para outbox/audit e atualização de versões.
- Config Supabase (RLS, envs) e documentação de setup.

Confirma que posso começar implementando a camada de sync (outbox/audit, endpoints push/pull) e os triggers no banco local e no Supabase?