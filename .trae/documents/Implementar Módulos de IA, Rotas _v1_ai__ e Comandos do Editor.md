## Objetivo
Criar os módulos `server/src/ai/*`, expor rotas `/v1/ai/*`, e integrar comandos no editor (toolbar + atalhos + DataService) mantendo zero PII, RLS e cache quente.

## Estrutura de Arquivos
- server/src/ai/
  - AIController.ts (controlador central das rotas IA)
  - SemanticSearchService.ts (PGVector + fallback TRGM)
  - ContextBuilder.ts (contexto do laudo + prefs + RAG)
  - PromptBuilder.ts (prompts internos – CBR/RadLex, few-shot)
  - SuggestionEngine.ts (parse/normalização de saída LLM; RadLex/medidas)
  - LLMClient.ts (provider-agnostic; timeouts; streaming opcional)
  - VoiceService.ts (STT/TTS adaptadores; fallback WASM indicado)
- server/src/routes/ai.ts (roteamento `/v1/ai/*`)
- server/src/schemas/ai/*.ts (Zod para suggest/complete/differentials/voice)
- spa/src/data/DataService.ts (novos métodos aiSuggest/aiComplete/aiDifferentials/aiRagSearch)
- spa/src/editor/commands.ts (Tiptap commands: insertSuggestion, insertConclusion, expandCurrentSentence, applyTemplate, voiceInsert)
- spa/src/components/EditorAIButton.tsx (botão/menus IA; atalhos Ctrl+J / Ctrl+Shift+J)

## Rotas e Regras (v1)
- POST /v1/ai/suggest (JWT)
  - body: { text, modality, organ?, topK?=6 }
  - fluxo: ContextBuilder → SemanticSearchService(k) → PromptBuilder → LLMClient → SuggestionEngine
  - cache: Redis `ai:suggest:<hash(text,mod,topK)>` TTL 5–10 min
- POST /v1/ai/complete (JWT)
  - body: { textPrefix, modality }
  - usa LLM rápido (temperatura baixa); cache 2–5 min
- POST /v1/ai/differentials (JWT)
  - body: { findings:[{term, qualifiers?}], modality }
  - retorna top diferenciais + justificativas curtas
- GET /v1/ai/rag/search?mod=<>&q=<>&k=8 (JWT)
  - retorna passagens semânticas de `embeddings_store`
- GET /v1/ai/debug/context (admin) (JWT)
  - retorna o contexto montado (sem PII) p/ troubleshooting
- POST /v1/ai/voice/stt (JWT)
  - body: { audio, lang }
  - responde { text, commands? } (intents pré-definidos)
- POST /v1/ai/voice/tts (JWT)
  - body: { text, voice?, rate? }
  - responde { audioBase64|audioUrl }

## Zod Schemas
- aiSuggestSchema: { text: string.max(4000), modality: string, organ?: string, topK?: number<=8 }
- aiCompleteSchema: { textPrefix: string.max(400), modality: string }
- aiDiffSchema: { findings: [{ term: string, qualifiers?: string[] }], modality: string }
- aiRagSearchSchema: { q: string, modality: string, k?: number<=8 }
- sttSchema: { audio: string(base64)|streamRef, lang: 'pt-BR' }
- ttsSchema: { text: string.max(1000), voice?: string, rate?: number(0.8–1.2) }

## Segurança
- JWT curto + refresh já implementado (reutilizar middleware auth)
- RLS: usar `withUser(req.user.id, ...)` dentro dos serviços que acessam PG
- Rate-limit: reforço por rota em `/v1/ai/*` (ex.: 20 req/min/user)
- Zero PII: filtragem de entrada; logs apenas com correlationId e dimensões agregadas; cache sem conteúdo sensível

## Caching
- Redis hot-path: `ai:suggest:<hash>`, `ai:complete:<hash>`, `ai:diff:<hash>`
- Invalidação: worker re-hydrate quando `notify_change()` em entidades de conhecimento (templates/sentences/findings/embeddings_store)

## Implementação por Fases
1) Backend IA
- Criar `SemanticSearchService` com consultas IVFFlat e TRGM fallback
- Criar `ContextBuilder` (coleta prefs, uso, RAG topK, modo/órgão)
- Criar `PromptBuilder` (instruções + few-shot CBR/PT-BR + RadLex)
- Integrar `LLMClient` (provider dummy/ENV) e `SuggestionEngine`
- Expor rotas `/v1/ai/*` com Zod + rate-limit + cache

2) Editor e DataService
- DataService: métodos `aiSuggest/aiComplete/aiDifferentials/aiRagSearch`
- Commands Tiptap: `insertSuggestion`, `insertConclusion`, `expandCurrentSentence`
- Toolbar IA (EditorAIButton) + atalhos (Ctrl+J / Ctrl+Shift+J)

3) Testes e Validação
- Supertest: rotas `/v1/ai/*` com JWT e RLS ativo
- k6: `/v1/ai/suggest` com cache vs. sem cache (metas p95 ≤ 500 ms hot-path)
- E2E: editor executando “Gerar sugestão” e “Gerar conclusão”

## Critérios de Aceite
- Rotas `/v1/ai/*` funcionais com validação Zod e rate-limit IA
- ContextBuilder monta contexto sem PII e com RAG topK
- Editor possui atalhos e botão IA; comandos inserem texto no cursor
- Redis aquece chaves `ai:*` e worker re-hydrate após mudanças

## Observações
- Inicialmente o LLMClient pode retornar mock/eco controlado (para ver UI). Depois trocar por provider real via ENV.
- STT/TTS: protótipo com stub retornando texto/áudio fake; em seguida integrar provider.

Confirma para eu criar os arquivos/módulos acima e integrar as rotas/commands nesta rodada?