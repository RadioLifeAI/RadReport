## Objetivo
Entregar a integração completa de IA no RadReport conforme a arquitetura definida, com módulos server/src/ai/*, rotas /v1/ai/*, comandos do editor e DataService, mantendo zero PII, RLS e cache quente.

## Escopo por Fases
### Fase A — Backend IA
1) Criar módulos em `server/src/ai/`:
- `SemanticSearchService.ts`: consultas IVFFlat (PGVector) e fallback TRGM; filtros por modalidade/órgão; topK 4–8; métricas.
- `ContextBuilder.ts`: coleta prefs/uso do usuário, seções do editor (payload), passagens RAG (PGVector), macros frequentes; sanitize PII.
- `PromptBuilder.ts`: prompt PT‑BR laudo‑aware (CBR/RadLex), few‑shot por modalidade, controle de tamanho.
- `LLMClient.ts`: provider‑agnostic (ENV `AI_PROVIDER`, `AI_API_KEY`), timeout/retry/circuit‑breaker; logs com `X‑Correlation‑Id`.
- `SuggestionEngine.ts`: parse/validação JSON do LLM, normalização terminológica e medidas; tipos e schemas Zod.
- `VoiceService.ts`: adaptadores STT/TTS (stub inicial + providers futuros), com caching de TTS (Redis `tts:<hash>`).

2) Rotas `/v1/ai/*` (JWT + RLS + Zod + rate‑limit IA + Redis):
- `POST /v1/ai/suggest` → { text, modality, organ?, topK? } → { suggestions[], conclusion? }
- `POST /v1/ai/complete` → { textPrefix, modality } → { completion }
- `POST /v1/ai/differentials` → { findings[], modality } → { list[] }
- `GET /v1/ai/rag/search?mod=&q=&k=8` → passagens RAG
- `GET /v1/ai/debug/context` (admin)
- `POST /v1/ai/voice/stt`, `POST /v1/ai/voice/tts` (stubs funcionais)

3) Redis re‑hydrate IA:
- Worker escuta `events` e faz warmup para `ai:suggest:<hash>` quando pertinente; warmup periódico de `tpl:mod:*`, `sent:mod:*`.

### Fase B — Editor/Frontend
1) DataService:
- Métodos: `aiSuggest`, `aiComplete`, `aiDifferentials`, `aiRagSearch` (JWT + refresh + retry já prontos).
2) Tiptap Commands (`spa/src/editor/commands.ts`):
- `insertSuggestion(text)`, `insertConclusion(text)`, `expandCurrentSentence()`, `applyTemplate(id)`, `voiceInsert(text)`.
3) UI/Atalhos:
- `EditorAIButton.tsx` (botão/menu “IA”) + atalhos: `Ctrl+J` (sugerir), `Ctrl+Shift+J` (conclusão).
- Toasts em erros irrecuperáveis; loading states.

### Fase C — Segurança/Operação
- Rate‑limit IA: 20 req/min/usuário (ajustável por ENV) + burst control.
- Headers `Vary: Accept-Encoding, If-None-Match` nos GETs de catálogo.
- CORS por ambiente; RS256 opcional (chaves via Secret Manager).
- Observabilidade: OTEL spans para IA (LLM latency, RAG hits, cache HIT/MISS).

### Fase D — OpenAPI e Cliente TS
- `server/openapi.yaml` documentando `/v1/*` e `/v1/ai/*` com exemplos.
- Geração de cliente TS para o front (minimiza drift de contratos).

### Fase E — Testes e QA
- Unit (vitest/jest): PromptBuilder (formatos), SuggestionEngine (parse/normalização), Zod schemas.
- Integração (supertest): auth + `/v1/ai/suggest` com RLS; cache HIT/MISS; rate‑limit IA.
- Carga (k6): `/v1/ai/suggest` (p95 ≤ 500 ms com cache quente); catálogos (p95 ≤ 60 ms).
- E2E (Playwright): login → editor → IA (sugestão/conclusão) → offline (fila usage) → retorno de rede.

## Estrutura de Pastas/Arquivos a Criar
- `server/src/ai/AIController.ts`
- `server/src/ai/SemanticSearchService.ts`
- `server/src/ai/ContextBuilder.ts`
- `server/src/ai/PromptBuilder.ts`
- `server/src/ai/SuggestionEngine.ts`
- `server/src/ai/LLMClient.ts`
- `server/src/ai/VoiceService.ts`
- `server/src/routes/ai.ts`
- `server/src/schemas/ai/{suggest.ts,complete.ts,diff.ts,rag.ts,stt.ts,tts.ts}`
- `spa/src/editor/commands.ts`
- `spa/src/components/EditorAIButton.tsx`

## Aceitação Técnica
- Rotas `/v1/ai/*` respondem JSON válido, com validação Zod, JWT aplicado e RLS por sessão.
- Redis aquece chaves `ai:*` e catálogos (`tpl:mod:*`, `sent:mod:*`).
- Editor executa atalhos e insere textos no cursor sem quebrar o layout.
- Metas de latência: catálogo p95 ≤ 60 ms; IA p95 ≤ 500 ms (cache quente).

## Cronograma (5–7 dias)
- D1–D2: Serviços IA (SemanticSearch/Context/Prompt/LLM/Engine) + rotas /v1/ai/*
- D3: DataService + Commands + Toolbar IA e atalhos
- D4: Redis re‑hydrate + rate‑limit IA + headers Vary + CORS por ambiente
- D5: OpenAPI + cliente TS
- D6–D7: Testes (unit/integration/k6/E2E) e documentação operacional

## Requisitos de Configuração
- ENV API: `AI_PROVIDER`, `AI_API_KEY`, `IA_RATE_LIMIT=20`, `OPENAI_MODEL` (ou similar), `VARY_HEADERS=on`.
- DB/Redis: já existentes; sem PII em qualquer payload.

Se aprovado, inicio a criação dos arquivos, rotas e comandos do editor agora, com commits organizados por módulo e testes básicos inclusos.