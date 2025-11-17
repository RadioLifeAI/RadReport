## 1) Estado Atual (síntese)
- Front SPA: Editor Tiptap funcional, DataService com IndexedDB, ETag, delta sync, refresh JWT e retry; templates dinâmicos com fallback local; Toasts.
- API v1: catálogo (templates/sentences/findings), delta, semântica PGVector, prefs/usage com JWT+RLS; ETag/Cache; helmet+CSP; rate-limit base; OTel; Redis hot-path; worker (embeddings/lexicon/listener).
- DB: schema robusto (RAG, logs, RLS, notify_change).

## 2) Próximas Tarefas Prioritárias
1. Implementar módulos IA e rotas `/v1/ai/*` (suggest/complete/differentials/rag/search/stt/tts/debug-context).
2. Comandos no editor + Toolbar IA + atalhos (Ctrl+J / Ctrl+Shift+J) consumindo as rotas IA.
3. Redis re-hydrate para chaves `ai:*` e `tpl:mod:*` após `notify_change`.
4. Segurança fina: rate-limit específico para `/v1/ai/*`, `Vary` headers nos GETs, CORS estrito por ambiente, RS256 (opcional em prod).
5. OpenAPI (contratos) + cliente TS gerado para o front.
6. Testes: supertest (auth/IA/RLS), vitest (DataService), k6 para IA, Playwright E2E (login→IA→offline).
7. Documentação operacional (README/env/scripts), guias de deploy (Docker/PM2) e observabilidade (dashboards/thresholds).

## 3) Implementações (escopo detalhado)
### Backend IA (server/src/ai/*)
- `SemanticSearchService.ts`: consulta IVFFlat + fallback TRGM; filtros por modalidade/órgão; topK 4–8.
- `ContextBuilder.ts`: junta prefs do usuário, passagens RAG, uso recente; sanitize para zero PII.
- `PromptBuilder.ts`: instruções CBR/RadLex PT‑BR, few-shot por modalidade, formato de saída JSON.
- `SuggestionEngine.ts`: parse do JSON do LLM, normalização de termos e medidas; validação final.
- `LLMClient.ts`: provider‑agnostic (ENV); timeouts, retry e circuit‑breaker; logging com correlationId.
- `VoiceService.ts`: adaptadores STT/TTS (stub inicial + provider futuro).
- Roteador `/v1/ai/*` com Zod schemas, JWT, rate‑limit IA e cache Redis `ai:*`.

### Editor
- `spa/src/editor/commands.ts`: insertSuggestion, insertConclusion, expandCurrentSentence, applyTemplate, voiceInsert.
- `spa/src/components/EditorAIButton.tsx`: botão/menu IA; invoca DataService; atalhos (Ctrl+J, Ctrl+Shift+J).
- `DataService`: métodos `aiSuggest`, `aiComplete`, `aiDifferentials`, `aiRagSearch`; reaproveitar refresh/retry.

### Redis e Worker
- Re-hydrate pós `notify_change()` para `tpl:mod:*`, `sent:mod:*`, `ai:suggest:*` (quando aplicável).
- Scheduler: rebuild `lexicon` (já existe) e warmup de chaves por modalidade.

### Segurança e Operação
- Rate-limit IA: 20 req/min por usuário; burst control.
- HEADERS: adicionar `Vary: Accept-Encoding, If-None-Match` nos GETs de catálogo.
- CORS por ambiente (prod/stage/dev) via ENV.
- (Opcional) RS256: script de chaves e alternância HS256→RS256 em prod.

### OpenAPI e Cliente TS
- Gerar `openapi.yaml` com `/v1/*` e `/v1/ai/*`; publicar em `server/`.
- Autogerar cliente TS para front (minimiza drift de contratos).

## 4) Testes e Qualidade
- Unit (vitest/jest): PromptBuilder (outputs), SuggestionEngine (parser/normalização), Zod schemas.
- Integração (supertest): auth flow, `/v1/ai/suggest`, RLS ativo (`SET app.user_id`).
- Carga (k6): `/v1/ai/suggest` com e sem cache (p95 ≤ 500 ms quente); catálogos (p95 ≤ 60 ms).
- E2E (Playwright): login → editor → IA (sugerir/concluir) → offline → fila usage.
- A11y: Lighthouse ≥ 90 (landing/editor); labels/atalhos revisados.

## 5) Documentação
- README: variáveis (JWT secrets, providers IA/voz, Redis, OTEL), como rodar worker/API/front, scripts k6/backup.
- ADR curtas: decisão por cache‑aside, PGVector, delta sync e zero‑PII.

## 6) Cronograma (7–10 dias)
- D1–D2: Backend IA (`SemanticSearch`, `ContextBuilder`, `PromptBuilder`, `LLMClient` stub, `SuggestionEngine`) + rotas `/v1/ai/*`.
- D3: DataService métodos IA + comandos do editor + Toolbar/atalhos.
- D4: Redis re‑hydrate + rate‑limit IA + `Vary` headers + CORS por ambiente.
- D5: OpenAPI + cliente TS; unit tests (schemas/prompt/engine).
- D6: Supertest (auth/IA/RLS), k6 IA; ajustes de latência.
- D7: Playwright E2E; Lighthouse e A11y; documentação e handoff.

## 7) Critérios de Aceite
- Rotas `/v1/ai/*` entregues, validadas por Zod, seguras por JWT/RLS e com cache quente.
- Editor com botão IA e atalhos; comandos inserem sugestão/conclusão no cursor.
- k6: catálogos p95 ≤ 60 ms; IA p95 ≤ 500 ms com Redis aquecido.
- Zero PII em trânsito e repouso; logs com correlationId apenas.
- Documentação e testes (unit/integration/E2E) disponíveis e executáveis.

Se aprovado, iniciarei a criação dos módulos IA, rotas `/v1/ai/*`, comandos do editor e demais itens conforme o cronograma acima.