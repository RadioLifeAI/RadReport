## Visão Geral
Implementar Worker de embeddings e gerador de lexicon, instrumentação de métricas (OpenTelemetry), scripts de carga, hardening de segurança (CSP/headers/rate-limit), ações de A11y/Mobile e plano de QA/DR. Sem alterar o modelo de dados já entregue.

## Entregáveis por Módulo
### 1) Worker de Embeddings e Lexicon
- Estrutura:
  - `server/worker/worker.ts`: processa eventos do Postgres (LISTEN `events`), reidexa embeddings.
  - `server/worker/embeddings.ts`: cliente de provedor (pluggable) – `EMB_PROVIDER=local|openai|azure|gcp`, `EMB_API_KEY`.
  - `server/worker/lexicon.ts`: job periódico para gerar n-grams (1–3) de `smart_sentences.text` e `findings.description`, grava em `lexicon` e preenche Redis `auto:<mod>:<prefix>`.
- Lógica:
  - Ao receber `entity=smart_sentences|findings` com `op in (insert, update)` → (re)calcular `embed_vector` via provedor; `UPDATE ... SET embed_vector=$1`.
  - Job `*/10min`:
    - `INSERT ... ON CONFLICT` em `lexicon(modality, ngram)` com `freq = freq + count`.
    - Recarregar Redis para prefixes mais frequentes por modalidade.
- Config:
  - ENV obrigatórios: `DATABASE_URL`, `REDIS_URL`, `EMB_PROVIDER`, `EMB_API_KEY`, `LEXICON_TOPN=2000`.
  - Execução: `npm run worker` (script novo) e PM2/systemd em produção.

### 2) Métricas e Tracing (OpenTelemetry)
- Arquivos:
  - `server/src/telemetry.ts`: inicializa NodeSDK com instrumentations `http`, `express`, `pg`.
  - Exporter OTLP: `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318`.
  - Recursos: `service.name=radreport-api`, `service.version` do `package.json`.
- Middlewares:
  - `correlationId` em cada request (header `X-Correlation-Id`, fallback UUID).
  - Logs estruturados (nível info/warn/error) – pino ou console JSON leve.
- Dashboards (Grafana/Kibana):
  - KPIs: p50/p95/p99 por rota, taxa de erro, hit ratio de cache (`X-Cache`), latência PG/Redis.

### 3) Testes de Carga (≥ 500 RPS catálogo; p95 < 60 ms)
- Scripts:
  - `scripts/k6-templates.js`: bombardeia `GET /v1/templates?mod=TC`.
  - `scripts/k6-delta.js`: `POST /v1/sync/delta` com `since` variável.
  - `scripts/k6-semantic.js`: `POST /v1/findings/semantic` com vetor dummy.
- Execução:
  - `k6 run -e BASE_URL=http://localhost:8787 scripts/k6-templates.js`.
- Metas:
  - catálogos com Redis: p95 ≤ 60 ms; erro% < 0.5%.

### 4) Hardening Semana 4
- Segurança:
  - `helmet` + CSP estrita (self + img CDNs necessários); `Referrer-Policy`, `Permissions-Policy` mínimos.
  - Refinar `rate-limit` por rota: catálogo (elevado), semântica e delta (moderado), prefs/usage (baixo).
  - Tuning `express.json({ limit: '512kb' })` e timeouts.
  - CORS fechado a domínios de produção.
  - Rotação de chaves: variáveis em secret manager.
- Observabilidade:
  - Atributos de span: `route`, `user_id (hash)`, `cache_hit`.
  - Exportar métricas de GC/heap/número de conexões.

### 5) Acessibilidade e Mobile Readiness
- Landing/Editor:
  - Verificar contraste com tokens; adicionar `aria-label` em botões ícones; foco visível; landmarks coerentes.
  - Responsividade já entregue; revisar pontos de quebra: 480/768/1024.
  - Lighthouse alvo ≥ 90 (Perf/A11y/Best Practices/SEO em landing).
- Offline PWA (opcional):
  - `service worker` para static assets e replays da fila de `usage`.

### 6) QA: Degradação e DR
- Degradação:
  - Redis off → API retorna `X-Cache: bypass`, mantém metas p95 ≤ 120 ms.
  - Embeddings provider off → marcar `X-Degraded: semantic`, fallback TRGM.
- DR catálogo:
  - Scripts `scripts/backup.sh` (pg_dump de catálogo público) e `scripts/restore.sh`.
  - Backup diário com retenção 7/30 dias.

## Mudanças de Código (planejadas)
- Adicionar:
  - `server/src/telemetry.ts`, `server/worker/*`, `scripts/k6-*.js`, `scripts/backup.sh`, `scripts/restore.sh`.
- Atualizar:
  - `server/src/index.ts` para importar `telemetry.ts`, `helmet`, CSP e cabeçalhos, e `X-Cache` header.
  - `server/package.json` scripts: `worker`, `k6:templates`, `k6:delta`, `k6:semantic`.

## Configuração (ENV)
- API: `PORT`, `ALLOWED_ORIGIN`, `DATABASE_URL`, `REDIS_URL`, `OTEL_EXPORTER_OTLP_ENDPOINT`.
- Worker: `EMB_PROVIDER`, `EMB_API_KEY`, `LEXICON_TOPN`.

## Critérios de Aceite
- Worker atualiza `embed_vector` e popula `lexicon`; Redis recebe prefixes por modalidade.
- Métricas exportadas (latência por rota, PG, Redis, taxa de erro).
- k6 atinge 500 RPS no catálogo com p95 ≤ 60 ms (ambiente com Redis).
- API com CSP/headers e rate-limit refinado; CORS estrito em produção.
- Lighthouse A11y/Perf ≥ 90 na landing; editor responsivo.
- Backup/restore catalog testado.

## Cronograma
- Semana 3: worker+lexicon, OTEL, k6 scripts, dashboards.
- Semana 4: segurança/headers, rate-limit fino, A11y/Mobile, QA degradação e DR, documentação final.

Confirma para eu aplicar as mudanças (adicionar arquivos do worker, telemetria, scripts k6 e hardening da API) agora?