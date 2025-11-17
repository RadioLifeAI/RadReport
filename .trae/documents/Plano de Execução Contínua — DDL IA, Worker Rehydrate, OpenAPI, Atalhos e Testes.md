## Status
- IA backend e rotas /v1/ai/* criadas (mock LLM; validação Zod; rate‑limit IA; cache Redis).
- Editor com botão IA e métodos no DataService implantados.

## Próximos Passos (esta rodada)
1) Banco (DDL IA)
- Atualizar `db/schema.sql` criando:
  - `embeddings_store(entity text, entity_id uuid, modality modality, title text, text text, embed_vector vector(1536), updated_at timestamptz, primary key(entity, entity_id))`
  - `voice_commands(cmd_id uuid pk, phrase text, intent text, slots jsonb, modality modality, updated_at timestamptz)`
  - `user_style_stats(user_id uuid pk, terms jsonb, tone jsonb, last_update timestamptz)`
  - `ai_suggestion_log(id uuid pk, user_id uuid, modality modality, input_len int, output_len int, latency_ms int, suggestion_type text, accepted boolean, created_at timestamptz)`
- Índices: IVFFlat na `embed_vector`, BTREE em `modality`; RLS conforme escopo; NOTIFY opcional.

2) Worker (re‑hydrate IA)
- `server/worker/worker.ts`:
  - Após eventos relevantes (templates/sentences/findings), aquecer chaves `tpl:mod:*`, `sent:mod:*`.
  - Adicionar tarefa de warmup para `ai:suggest:*` quando houver entradas populares (hash de exemplos fixos por modalidade).

3) OpenAPI + Cliente TS
- `server/openapi.yaml` cobrindo `/v1/*` e `/v1/ai/*` com exemplos.
- (Opcional) script para gerar cliente TS para o front.

4) Editor — Atalhos
- Adicionar listeners para `Ctrl+J` (sugestão) e `Ctrl+Shift+J` (conclusão) chamando DataService + commands.

5) Tests
- Unit: Zod de IA; PromptBuilder e SuggestionEngine (parsers).
- Integração: supertest `/v1/ai/suggest` (JWT mock) validando MISS→HIT de cache.

## Aceite
- DDL aplicada no arquivo; worker com re‑hydrate básico; OpenAPI inicial disponível; atalhos ativos; testes mínimos incluídos.

Confirmando, aplico as mudanças acima agora.