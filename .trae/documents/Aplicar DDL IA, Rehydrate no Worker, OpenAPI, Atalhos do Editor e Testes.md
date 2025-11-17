## Objetivo
Finalizar a integração de IA criando DDL do banco, rehydrate de cache no worker, documentação OpenAPI, atalhos do editor e testes mínimos.

## Alterações Planejadas
1) Banco (db/schema.sql)
- Adicionar tabelas:
  - embeddings_store(entity text, entity_id uuid, modality modality, title text, text text, embed_vector vector(1536), updated_at timestamptz, primary key(entity, entity_id))
  - voice_commands(cmd_id uuid primary key, phrase text, intent text, slots jsonb, modality modality, updated_at timestamptz)
  - user_style_stats(user_id uuid primary key, terms jsonb, tone jsonb, last_update timestamptz)
  - ai_suggestion_log(id uuid primary key, user_id uuid, modality modality, input_len int, output_len int, latency_ms int, suggestion_type text, accepted boolean, created_at timestamptz)
- Índices: IVFFlat em embed_vector (cosine), BTREE em modality; RLS conforme escopo; triggers opcional de NOTIFY.

2) Worker (server/worker/worker.ts)
- Funções de rehydrate/warmup:
  - warmTpl(mod): carrega v_templates_public e seta `tpl:mod:<mod>`
  - warmSent(mod): carrega v_sentences_by_mod e seta `sent:mod:<mod>`
  - warmAISuggestSamples(): para entradas populares por modalidade gerar e setar `ai:suggest:<hash>` usando LLM mock
- Integrar no listener `events` e em um agendador periódico (10–15 min).

3) OpenAPI (server/openapi.yaml)
- Documentar `/v1/*` e `/v1/ai/*` (schemas de request/response, exemplos, auth JWT, cookies de refresh, headers ETag/Vary).
- Incluir informações de segurança (TLS, CORS, rate‑limit) e server URL por ambiente.

4) Editor — Atalhos
- `src/components/Editor.tsx`: adicionar listeners de teclado
  - Ctrl+J → chamar DataService.aiSuggest e inserir texto (commands.ts)
  - Ctrl+Shift+J → DataService.aiComplete e inserir conclusão
- Manter acessibilidade: tooltips com atalhos e foco preservado.

5) Testes
- `server/tests/ai.suggest.test.ts` (supertest):
  - fluxo: login → POST /v1/ai/suggest → 200 com JSON válido; repetir para observar cache HIT (tempo/headers ou latência medida)
- `spa/tests/DataService.ai.test.ts`: mock fetch; validar retry/refresh e parse de retorno dos métodos IA.

## Critérios de Aceite
- DDL adicionada; migrações aplicáveis sem quebrar existentes.
- Worker aquece `tpl:*`, `sent:*` e `ai:suggest:*` sem erros; listener ativo.
- OpenAPI disponível com exemplos; compilável em editor OpenAPI.
- Atalhos funcionam no editor (Ctrl+J/Ctrl+Shift+J) sem colidir com outros atalhos.
- Testes básicos passam localmente; documentação mínima (README trechos) atualizada.

## Considerações de Segurança
- Zero PII mantido em DDL e logs.
- RLS intacto; IA rate‑limit inalterado (20/min, configurável por IA_RATE_LIMIT).
- Nenhum conteúdo clínico persistido nos caches `ai:*` além de sugestões genéricas.

Confirma para eu aplicar estas alterações agora?