## O que será criado/alterado

### Backend (server/src)
1) ai/SemanticSearchService.ts
- Funções: `searchVectors(client, vector:number[], modality:string, k:number)`, `searchText(client, q:string, modality:string, k:number)`
- Usa PGVector (IVFFlat) com fallback TRGM; mede latência (OTEL span opcional).

2) ai/ContextBuilder.ts
- Função: `build({ text, modality, organ?, userId, topK })`
- Coleta prefs do usuário (RLS), passagens RAG via SemanticSearchService, macros frequentes; sanitize para zero PII.

3) ai/PromptBuilder.ts
- Gera prompt PT‑BR laudo‑aware (CBR/RadLex), com few‑shots por modalidade; controla tamanho de contexto.
- Métodos: `suggestion(ctx)`, `complete(prefix, modality)`, `differentials(findings, modality)`

4) ai/LLMClient.ts
- Client provider‑agnostic (ENV `AI_PROVIDER`, `AI_API_KEY`, `OPENAI_MODEL`).
- Implementa timeout, retry simples e circuit‑breaker básico; modo `mock` para desenvolvimento.

5) ai/SuggestionEngine.ts
- `parseSuggest(jsonString)` e `parseDifferentials(jsonString)`; validação com Zod; normalização terminológica/medidas.

6) ai/VoiceService.ts (stub)
- `stt({ audio, lang })` e `tts({ text, voice, rate })` com retorno mínimo e pontos de integração de providers; cache TTS por hash.

7) routes/ai.ts
- Rotas JWT+RLS+Zod+rate‑limit IA (20 req/min usuário) e cache Redis:
  - POST `/v1/ai/suggest`, `/v1/ai/complete`, `/v1/ai/differentials`
  - GET `/v1/ai/rag/search`, GET `/v1/ai/debug/context` (admin)
  - POST `/v1/ai/voice/stt`, POST `/v1/ai/voice/tts`
- Usa `authMiddleware`, `correlationIdMiddleware`, e Redis `ai:*` com TTL.
- Ajuste em `server/src/index.ts` para montar `app.use('/v1/ai', aiRouter)`.

8) schemas/ai/*.ts (Zod)
- `suggest.ts`, `complete.ts`, `diff.ts`, `rag.ts`, `stt.ts`, `tts.ts` com limites de tamanho e tipos.

### Frontend (spa/src)
1) editor/commands.ts
- Tiptap commands: `insertSuggestion`, `insertConclusion`, `expandCurrentSentence`, `applyTemplate`, `voiceInsert`.

2) components/EditorAIButton.tsx
- Botão/menu “IA” (Sugerir, Gerar conclusão, Revisar, Diferenciais) + estado de loading/erro; dispara comandos.

3) data/DataService.ts (extensão)
- Métodos: `aiSuggest({ text, modality, organ?, topK? })`, `aiComplete({ textPrefix, modality })`, `aiDifferentials({ findings, modality })`, `aiRagSearch({ q, modality, k? })` reutilizando refresh/retry existentes.

4) components/Editor.tsx (ajuste leve)
- Incluir `EditorAIButton` na toolbar e atalhos: Ctrl+J (sugerir) e Ctrl+Shift+J (conclusão).

## Segurança/Operação
- Rate‑limit específico IA (ENV `IA_RATE_LIMIT`, default 20/min). 
- Nenhum texto clínico é logado; logs usam `X‑Correlation‑Id`. 
- GETs de catálogo receberão `Vary: Accept-Encoding, If-None-Match`.

## Testes mínimos
- Unit: Zod de IA e PromptBuilder, parse do SuggestionEngine.
- Integração: supertest `/v1/ai/suggest` com JWT e cache MISS→HIT.

## Aceite
- Rotas `/v1/ai/*` ativas (mock de LLM por padrão), retornando JSON conforme especificações.
- Toolbar/atalhos de IA no editor inserindo os textos no cursor.
- Cache Redis aquecendo `ai:*` e sem PII persistida.

Confirma para eu aplicar as mudanças no repositório agora?