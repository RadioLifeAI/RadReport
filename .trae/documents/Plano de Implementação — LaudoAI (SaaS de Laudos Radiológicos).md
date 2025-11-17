## Visão Geral
RadReport AI (LaudoAI) é um assistente web para criação e edição de laudos radiológicos, com ditado por voz, comandos rápidos e edição inteligente. O sistema não armazena dados de pacientes; opera apenas com texto desidentificado e exportação para sistemas institucionais.

## Escopo (MVP → V1)
- MVP: editor rico + templates/macros + ditado em tempo real + estruturação automática Achados/Conclusão + comandos rápidos + exportar PDF/DOCX + histórico de versões (sem PII) + preferências de estilo por usuário.
- V1: sugestões contextuais por modalidade, verificação de consistência, personalização contínua, integração opcional (webhook/REST) com RIS/EMR, modo revisão.

## Stack Técnica
- Frontend: React + TypeScript + Vite, Tiptap (ProseMirror) como RTE, Zustand/Redux para estado, WebSocket para streaming.
- Voz: Web Speech API (fallback local) para baixa latência + STT médico streaming no backend (Whisper/Deepgram/GCP) para acurácia; fusão parcial→final.
- Backend: Node.js (NestJS/Express) + WebSocket; Workers para LLM/STT; fila (BullMQ/Redis) para tarefas.
- IA: LLM especializado em radiologia (prompting com regras de privacidade), reescrita/estruturação/sugestões; verificador de consistência (regra + LLM); motor de comandos por intenção.
- Dados: Postgres (templates, macros, preferências, versões de laudo sem PII), Redis (sessão/tempo real). Armazenamento de exportações temporárias em S3-compatível com expiração.
- Build/QA: Vitest/Jest, Playwright e2e, eslint/prettier, SAST/DAST.

## Arquitetura
- App SPA comunica via REST + WS com API Gateway.
- Serviços: Auth, Templates/Macros, Editor/Laudo (versões/auditoria), Voz/STT, LLM Orchestrator, Export (PDF/DOCX), Integrações (webhook/HL7 FHIR minimal), Telemetria.
- Sem PII: bloqueio de campos sensíveis na UI e no backend; filtros de PII no pipeline de voz/LLM.

## Modelo de Dados (simplificado)
- users(id, email, nome_opcional, preferências_estilo, created_at)
- templates(id, owner_id|null, modalidade, título, conteúdo_struct, público)
- macros(id, owner_id|null, chave, modalidade, conteúdo_rich)
- reports(id, owner_id, modalidade, status, conteúdo_rich, versão_atual, created_at, updated_at) — sem PII
- report_versions(id, report_id, número, conteúdo_rich, mudanças, created_at)
- audit_log(id, user_id, entidade, ação, meta, created_at)
- preferences(id, user_id, termo→sinônimo, macros_favoritas[])

## Editor Rico (Tiptap)
- Extensões: Bold/Italic/Underline, Listas, Tabelas, Heading, Snippets, Placeholders de seção.
- Estruturas: nós Section(Achados/Conclusão), BlockQuote, Checklist.
- DnD: arrastar de Biblioteca de Macros/Templates para o editor.
- Comandos: palette (⌘/Ctrl+K) e por voz.

## Voz e Comandos
- Streaming local (Web Speech) com partials imediatos; confirmação posterior do STT médico.
- Gramática de comandos:
  - "inserir macro <chave>"
  - "template <modalidade>"
  - "ir para <seção>"
  - "estilo <formal|objetivo|expandido>"
  - "gerar conclusão"
  - "verificar consistência"
- Parser: regex + classificação por intenção (mínimo LLM-lite). Segurança: sandbox, whitelists.

## Motor de IA (LLM)
- Funções:
  - Estruturar ditado em Achados/Conclusão conforme modalidade
  - Reescrever em estilos: formal/objetivo/expandido
  - Normalizar terminologia (mapeamento KB + regras)
  - Sugerir macros/contexto com base no texto atual
- Prompt base (resumo): regras de desidentificação, formato fixo Markdown, PT-BR técnico, não inventar dados, pedir esclarecimentos técnicos.

## Banco de Dados Contextual
- KB de terminologia/mapeamentos (sinônimos→termo preferido), por modalidade.
- Biblioteca de frases por modalidade/órgão com tags.
- Índices para busca por prefixo e relevância; cache em Redis.

## Exportação
- PDF: `pdfmake` ou render server-side via `puppeteer` (HTML→PDF) com cabeçalho/rodapé e numeração.
- DOCX: `docx` (template com estilos padrão RadReport).
- Download direto; opção de criptografia/expiração.

## Segurança e Compliance
- OAuth2/OIDC + MFA opcional; RBAC básico (radiologista, revisor, admin).
- Criptografia em trânsito (TLS) e em repouso (Postgres TDE/colunas sensíveis).
- RLS em Postgres por owner_id; auditoria de ações.
- PII Guard: detectores de PII no frontend e backend; bloqueio e redacção.
- Política de retenção: versões e logs sem PII; exportações temporárias com TTL.

## Telemetria e Métricas
- Tempo médio para gerar laudo; número de edições pós-sugestão; taxa de adoção de macros; latência STT/LLM.
- Observabilidade: OpenTelemetry, logs estruturados, rastreamento de sessões sem PII.

## APIs Principais
- POST `/auth/login`
- GET/POST `/templates`, `/macros`
- POST `/reports` | GET `/reports/:id` | POST `/reports/:id/versions` | POST `/reports/:id/export`
- WS `/stream`: eventos `stt.partial`, `stt.final`, `command.exec`, `ai.suggest`, `editor.update`.

## Telas
- Login
- Editor (pane duplo: Editor e Biblioteca)
- Biblioteca (Templates/Macros, busca, favoritos)
- Histórico/Versões + comparação de diffs
- Preferências de estilo (sinônimos, intensidade de formalidade)

## Fluxos Principais
1) Ditado→Parcial STT→Estruturação LLM→Edição→Conclusão gerada→Revisão→Exportar.
2) Comando "inserir macro …"→inserção exata no cursor.
3) "Verificar consistência"→lista de alertas e Quick-Fixes.

## Critérios de Aceite (MVP)
- Ditado com texto parcial <300 ms e confirmação final pelo STT médico.
- Editor com Bold/Italic/Underline, listas, headings, tabelas e DnD de macros.
- Comandos funcionais: inserir macro, ir para seção, gerar conclusão, trocar estilo.
- Exportar PDF e DOCX idênticos ao preview.
- Histórico de versões por laudo; auditoria de ações; zero PII persistida.

## Roadmap & Marcos
- S1: Setup, Auth, Editor (Tiptap), Templates/Macros, Export DOCX/PDF.
- S2: STT streaming + fusão parcial/final, comandos por voz, sugestões básicas.
- S3: Consistência terminológica (KB), modo revisão, preferências por usuário.
- S4: Integrações externas (webhook/FHIR mínimo), hardening segurança e métricas.

## Riscos & Mitigações
- Acurácia do STT médico: fallback para correção manual + dicionário médico custom.
- Latência LLM: pré-carregar prompts, usar streaming e cache.
- Privacidade: bloqueio PII em todos os pontos, testes de canário.

## Itens Abertos para Confirmação
- Preferência de provedor STT (Whisper, Deepgram, GCP, Azure).
- Biblioteca RTE: Tiptap ok? (alternativas: Slate/Quill).
- Padrões de estilo institucional (fonte, cabeçalhos) para exportação.
- Idiomas além de PT-BR?

## Anexo — Prompt Base do LLM (resumo)
"Você é LaudoAI…" Regras: sem PII; formato Markdown com **Achados** e **Conclusão**; não inventar achados; pedir esclarecimentos técnicos quando necessário; estilos: formal/objetivo/expandido; normalizar terminologia segundo KB. Placeholders: {modalidade}, {texto_fonte}, {preferências_estilo}, {nivel_intervenção}."