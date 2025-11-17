## Arquivos e Mudanças
- server/db/schema.sql
  - Extensions: pgcrypto
  - Tabelas: users, user_providers, users_auth, audit_log, outbox, sync_state, audit_log_cloud
  - Índices: users_email_lower_unique
  - Colunas de versão nas tabelas de negócio (version, updated_at, updated_by)
- server/db/triggers.sql
  - Triggers para INSERT/UPDATE/DELETE nas tabelas de negócio
  - Funções: registrar em audit_log, enfileirar outbox, incrementar version
- server/src/routes/sync.ts
  - POST /v1/sync/push (idempotente por op_id, transação por lote)
  - GET /v1/sync/pull?since=...&entities=...
- server/src/cloud/supabase.ts
  - Cliente Supabase (service role) via env SUPABASE_URL/SUPABASE_SERVICE_KEY
  - Função upsertUser({ user_id, email, name, picture })
- server/src/routes/auth.ts (ajuste leve)
  - Após register/google login: chamar upsertUser no Supabase de forma assíncrona
- src/data/DataService.ts (frontend)
  - Métodos: pushOps(ops), pullChanges(since), scheduleSync quando voltar online
  - Usar lastSync existente para delta
- vite.config.ts (opcional, dev)
  - Proxy /v1 → http://localhost:8787 para manter VITE_API_BASE=/v1

## Scripts Supabase
- supabase/schema.sql: igual ao server/db/schema.sql (sem triggers de outbox; cloud recebe via /push)
- supabase/rls.sql: políticas RLS básicas por user_id/tenant_id nas tabelas sensíveis

## Fluxo de Funcionamento
- Offline: app grava via API local → triggers populam outbox/audit
- Online: DataService chama /v1/sync/push e /v1/sync/pull; backend aplica no Supabase e retorna mudanças
- Conflitos: LWW por updated_at; CRDT (fase 2) para laudos se necessário

## Variáveis de Ambiente
- Backend local: DATABASE_URL, ALLOWED_ORIGIN, PORT, SUPABASE_URL, SUPABASE_SERVICE_KEY
- Frontend: VITE_API_BASE (ou proxy), flags de sync (opcional)

## Testes
- Criar/editar laudo offline → voltar online → sincronizar sem perda
- Cadastro/login → redirecionar /app; usuário replicado no Supabase
- Auditoria: ops aparecem no audit_log_cloud

Posso criar esses arquivos e implementar agora conforme acima?