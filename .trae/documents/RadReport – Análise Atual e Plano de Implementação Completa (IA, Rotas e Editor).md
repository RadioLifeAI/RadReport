## Análise do Repositório (estado atual)
- Backend (server/)
  - Rotas v1: catálogo (`/templates`, `/sentences`, `/findings`), semântica (`/findings/semantic`), sync (`/sync/delta`), prefs/usage com JWT+RLS, auth (`/v1/auth/*`), helmet+CSP, rate-limit base, ETag e cache Redis em catálogos, OTel instalado.
  - Worker: embeddings/lexicon, listener de eventos e warmup básico de catálogos; IA ainda sem módulos.
  - Ausências: `server/src/ai/*`, `server/src/routes/ai.ts`, rate‑limit específico IA, `Vary` headers nos GETs.
- Front (src/)
  - DataService: ETag, refresh, retry e IndexedDB/delta; sem métodos de IA ainda.
  - Editor: Tiptap funcional; não há comandos/toolbar de IA.
- Banco (db/schema.sql)
  - Estruturas principais presentes; `embeddings_store`, `voice_commands`, `ai_suggestion_log` planejadas (não criadas).

## Tarefas Prioritárias
1) Implementar módulos IA e rotas `/v1/ai/*` (suggest/complete/differentials/rag/search/stt/tts/debug-context) com Zod/JWT/RLS/Redis + rate‑limit IA.
2) DataService: métodos IA; Editor: comandos (insertSuggestion/insertConclusion/etc) e Toolbar IA com atalhos.
3) Worker: re‑hydrate de chaves `ai:*` e catálogos após `notify_change()`.
4) Operação: `Vary` headers em GETs de catálogo; CORS por ambiente; OpenAPI + cliente TS; testes (unit/integration/k6/E2E) e README operacional.

## Implementação (arquivos a criar/alterar)
### Backend
- Add: `server/src/ai/{AIController.ts,SemanticSearchService.ts,ContextBuilder.ts,PromptBuilder.ts,SuggestionEngine.ts,LLMClient.ts,VoiceService.ts}`
- Add: `server/src/routes/ai.ts` (monta `/v1/ai/*`)
- Add: `server/src/schemas/ai/{suggest.ts,complete.ts,diff.ts,rag.ts,stt.ts,tts.ts}`
- Update: `server/src/index.ts` (registrar router IA, rate‑limit IA, Vary headers em GETs)
- Update: `server/worker/worker.ts` (re‑hydrate de `ai:*` condicionado)
- Opcional: `server/openapi.yaml`

### Front
- Add: `src/editor/commands.ts` (Tiptap commands)
- Add: `src/components/EditorAIButton.tsx`
- Update: `src/data/DataService.ts` (métodos `aiSuggest`, `aiComplete`, `aiDifferentials`, `aiRagSearch`)
- Update: `src/App.tsx`/`components/Editor.tsx` (atalhos e toolbar IA)

## Especificação de Rotas IA
- POST `/v1/ai/suggest` { text, modality, organ?, topK?≤8 } → { suggestions[], conclusion? }
- POST `/v1/ai/complete` { textPrefix, modality } → { completion }
- POST `/v1/ai/differentials` { findings:[{term, qualifiers?}], modality } → { list[] }
- GET `/v1/ai/rag/search?mod=&q=&k=8` → passagens RAG
- GET `/v1/ai/debug/context?mod=` (admin)
- POST `/v1/ai/voice/stt` → { text, commands? }, POST `/v1/ai/voice/tts` → { audioBase64|audioUrl }

## Segurança e Performance
- JWT curto/refresh já prontos; RLS por request (withUser(userId,...)).
- IA rate‑limit: 20 req/min/usuário (ENV `IA_RATE_LIMIT`).
- Cache: Redis `ai:suggest:<hash>`, `ai:complete:<hash>` TTL 5–10 min; invalidação/warmup pelo worker.
- GETs com `Vary: Accept-Encoding, If-None-Match`.

## Testes e QA
- Unit: PromptBuilder, SuggestionEngine, Zod AI schemas.
- Integração: supertest em `/v1/ai/suggest` (JWT/RLS, cache HIT/MISS, rate‑limit).
- Carga: k6 `/v1/ai/suggest` p95 ≤ 500 ms (cache quente) e catálogo p95 ≤ 60 ms.
- E2E: Playwright login→editor→IA→offline→retorno de rede.

## Cronograma (5–7 dias)
- D1–D2: Serviços IA + rotas IA
- D3: DataService + Commands + Toolbar IA/atalhos
- D4: Re‑hydrate Redis + rate‑limit IA + `Vary` headers + CORS por ambiente
- D5: OpenAPI + cliente TS
- D6–D7: Testes (unit/integration/k6/E2E) + documentação operacional

Aprova eu iniciar a criação dos arquivos acima e integrar as rotas/commands conforme este plano?