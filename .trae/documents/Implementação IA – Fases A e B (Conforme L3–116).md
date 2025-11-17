## Escopo Imediato
Implementar exatamente os itens das linhas L3–L116 do documento selecionado, em duas frentes paralelas.

## Fase A — Backend IA (server/src)
1) Criar módulos em `server/src/ai/`:
- `SemanticSearchService.ts`: consultas PGVector (IVFFlat) + fallback TRGM; filtros por modalidade/órgão; topK 4–8; métricas (OTEL spans e logs com X-Correlation-Id).
- `ContextBuilder.ts`: montar contexto com prefs do usuário (RLS), passagens RAG (`embeddings_store`), macros/frases frequentes, e payload do editor; sanitize PII.
- `PromptBuilder.ts`: prompt PT‑BR laudo‑aware (CBR/RadLex), few‑shot por modalidade; saída JSON padronizada.
- `LLMClient.ts`: client provider‑agnostic (ENV `AI_PROVIDER`, `AI_API_KEY`, `OPENAI_MODEL`), timeout, retry e circuit‑breaker; streaming opcional.
- `SuggestionEngine.ts`: parse/validação (Zod) do JSON do LLM; normalização terminológica e medidas; classificação `phrase|macro|edit`.
- `VoiceService.ts`: adaptadores STT/TTS (stub inicial + pontos de integração com providers); cache TTS em Redis `tts:<hash>`.

2) Rotas `/v1/ai/*` (JWT + RLS + Zod + rate-limit IA + Redis):
- `POST /v1/ai/suggest` { text, modality, organ?, topK? } → { suggestions[], conclusion? }
- `POST /v1/ai/complete` { textPrefix, modality } → { completion }
- `POST /v1/ai/differentials` { findings[], modality } → { list[] }
- `GET /v1/ai/rag/search?mod=&q=&k=8` → passagens RAG
- `GET /v1/ai/debug/context` (admin)
- `POST /v1/ai/voice/stt`, `POST /v1/ai/voice/tts` (stubs funcionais)

3) Redis re‑hydrate IA:
- Worker assina `events` (NOTIFY) e aquece `tpl:mod:*`, `sent:mod:*`; adiciona rotina para re-hydrate de `ai:suggest:<hash>` quando aplicável; warmup periódico (cron).

## Fase B — Editor/Frontend (spa/src)
1) DataService: métodos `aiSuggest`, `aiComplete`, `aiDifferentials`, `aiRagSearch` reutilizando JWT+refresh+retry existentes.
2) Comandos Tiptap (`spa/src/editor/commands.ts`): `insertSuggestion`, `insertConclusion`, `expandCurrentSentence`, `applyTemplate`, `voiceInsert`.
3) UI/Atalhos: `EditorAIButton.tsx` com menu (“Sugerir”, “Gerar conclusão”, “Revisar”, “Diferenciais”) e atalhos: Ctrl+J (sugerir), Ctrl+Shift+J (conclusão). Toasts e loading states.

## Segurança/Operação
- Rate‑limit IA: 20 req/min/usuário (ENV `IA_RATE_LIMIT`) + burst control.
- GETs com `Vary: Accept-Encoding, If-None-Match`.
- CORS por ambiente; RS256 opcional em produção.
- OTEL: spans para IA (LLM latency, RAG hits, cache HIT/MISS); logs com `correlationId`.

## OpenAPI e Cliente TS
- Gerar `server/openapi.yaml` cobrindo `/v1/*` e `/v1/ai/*`; gerar cliente TS para o front (evita drift de contratos).

## Testes e QA
- Unit (vitest/jest): PromptBuilder, SuggestionEngine, Zod schemas.
- Integração (supertest): auth + `/v1/ai/suggest` com RLS; cache HIT/MISS; rate‑limit IA.
- Carga (k6): `/v1/ai/suggest` (p95 ≤ 500 ms com cache quente); catálogos (p95 ≤ 60 ms).
- E2E (Playwright): login → editor → IA (sugestão/conclusão) → offline (fila usage) → retorno de rede.

## Critérios de Aceite
- Rotas `/v1/ai/*` válidas, com validação Zod, JWT/refresh, RLS por sessão e cache quente.
- Editor executa comandos e atalhos sem quebrar layout; inserções no cursor corretas.
- Redis aquece `ai:*` e catálogos; worker faz re-hydrate pós `notify_change()`.
- Metas de latência: catálogo p95 ≤ 60 ms; IA p95 ≤ 500 ms (cache aquecido).

## Cronograma (5–7 dias)
- D1–D2: Serviços IA + rotas `/v1/ai/*`.
- D3: DataService + Commands + Toolbar IA/atalhos.
- D4: Re‑hydrate Redis + rate‑limit IA + headers Vary + CORS por ambiente.
- D5: OpenAPI + cliente TS.
- D6–D7: Testes (unit/integration/k6/E2E) + documentação operacional.

## Pré‑requisitos/ENV
- `AI_PROVIDER`, `AI_API_KEY`, `OPENAI_MODEL`, `IA_RATE_LIMIT=20`, `VARY_HEADERS=on` (além de `DATABASE_URL`, `REDIS_URL`, JWT secrets).