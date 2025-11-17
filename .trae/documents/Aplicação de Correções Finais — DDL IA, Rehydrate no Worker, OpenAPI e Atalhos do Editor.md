## Alterações que vou aplicar agora
1) Banco (db/schema.sql)
- Adicionar tabelas IA: embeddings_store, voice_commands, user_style_stats, ai_suggestion_log
- Criar índices (IVFFlat/BTREE) e políticas RLS compatíveis (somente leitura pública quando aplicável)

2) Worker (server/worker/worker.ts)
- Funções de warmup: `warmTemplates(mod)`, `warmSentences(mod)` e `warmAISuggestSamples()`
- Integrar no listener de NOTIFY e agendar a cada 10–15 min

3) OpenAPI (server/openapi.yaml)
- Documentar rotas v1 e v1/ai com exemplos mínimos (request/response), auth JWT e headers relevantes

4) Editor — atalhos
- `src/components/Editor.tsx`: listeners para Ctrl+J (sugestão) e Ctrl+Shift+J (conclusão) utilizando DataService + comandos

Garantias: zero PII, RLS preservado, cache quente, sem quebra de compatibilidade