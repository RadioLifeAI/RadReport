## Objetivo
Aplicar as mudanças no repositório: módulos IA em `server/src/ai/*`, rotas `/v1/ai/*`, comandos/toolbar do editor e integrações no DataService, mantendo zero PII, RLS e cache quente.

## Passos (Ordem de Execução)
1) Backend IA
- Criar módulos: `SemanticSearchService`, `ContextBuilder`, `PromptBuilder`, `LLMClient`, `SuggestionEngine`, `VoiceService`.
- Adicionar roteador `/v1/ai/*` com validação Zod, JWT, rate‑limit e cache Redis.
- Atualizar worker para re‑hydrate de `ai:*` e catálogos após `notify_change()`.

2) Frontend/Editor
- DataService: métodos `aiSuggest`, `aiComplete`, `aiDifferentials`, `aiRagSearch`.
- Tiptap: `insertSuggestion`, `insertConclusion`, `expandCurrentSentence`, `applyTemplate`, `voiceInsert`.
- Toolbar IA e atalhos: `Ctrl+J` (sugerir) e `Ctrl+Shift+J` (conclusão).

3) Segurança e Operação
- Rate‑limit IA (20 req/min/usuário por padrão).
- Headers `Vary` nos GETs; CORS por ambiente.
- OTEL spans para IA (latência LLM, RAG hits, cache HIT/MISS).

4) Documentação e Testes
- OpenAPI para `/v1/*` e `/v1/ai/*`; gerar cliente TS.
- Tests: unit (Prompt/Engine/Zod), integração (supertest) e carga (k6 IA); E2E (Playwright) básico do fluxo IA.

## Critérios de Aceite
- Rotas `/v1/ai/*` operacionais e validadas; comandos do editor executando com atalhos; cache quente e metas de latência atingidas.

Confirma para eu executar agora essas alterações no repositório?