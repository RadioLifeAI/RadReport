## Diagnóstico (inconsistências encontradas)
- Front → API base: chamadas `fetch` usam `VITE_API_BASE=/v1`, causando `net::ERR_ABORTED` no dev sem proxy; ideal apontar para `http://localhost:8787/v1` ou configurar proxy do Vite.
- `/v1/auth/me` retorna apenas `userId`; a UI de conta precisa `email`/`name` para preencher avatar e dados.
- Barra lateral de conta: `SettingsPanel` tenta ler `email` mas seta sempre `null`; depende do ajuste do payload de `/auth/me`.
- Google Login: validação via `tokeninfo` está ok para MVP, mas faltam campos de perfil no backend; CSP/CORS já ajustados.
- DB: endpoints usam `user_providers`, mas a tabela pode não existir; `users.email` deve ser único por `lower(email)`; garantir `users_auth` criada em migração (hoje criada on-demand).
- Landing/Login/SignUp: visuais consistentes; `Login.tsx` já importa `Link` (corrigido). Hero e Footer atualizados.

## Plano de Ajustes
### 1) Configuração de ambiente e API base
- Dev: alterar `.env.local` → `VITE_API_BASE=http://localhost:8787/v1`.
- Server: confirmar `ALLOWED_ORIGIN=http://localhost:5173`.
- Opcional: adicionar `server.proxy` em `vite.config.ts` para `/v1` apontar ao backend.

### 2) Auth payload e DataService
- Backend `/v1/auth/me`: incluir `email` e `name` (quando disponíveis), mantendo `userId`.
- Front: `dataService.me()` passa a repassar `email/name` para UI.
- Ajustar `SettingsSidebar`/`SettingsPanel` para mostrar `email` real e nome.

### 3) Preferências e barra lateral
- `dataService.getPrefs/savePrefs/logout`: já criados; ligar os campos dos formulários a `/v1/prefs` (dark_mode, voice_rate, default_modality, clinic_name, lang).
- Abertura da barra apenas via avatar/perfil no editor; fechar com `Esc`/backdrop.

### 4) Google Login (GIS/FedCM)
- Backend: quando validar `id_token`, mapear e persistir `name`/`email/picture` em `users`/`user_providers`.
- Front: exibir avatar inicial com primeira letra do e‑mail; quando `picture` existir, mostrar miniatura.

### 5) Banco de Dados
- DDL de migração:
  - `create table if not exists user_providers(user_id uuid references users(user_id) on delete cascade, provider text, provider_id text, updated_at timestamptz, primary key(user_id, provider));`
  - `create unique index if not exists users_email_lower_unique on users(lower(email));`
  - Consolidar criação de `users_auth` (já on-demand) em migração oficial.

### 6) Uploads de avatar e logotipo (fase seguinte)
- Front: campos com upload (placeholder por ora).
- Backend: endpoint de upload assinado (S3 ou disco) com validação de tipo/tamanho; salvar URL em `users` e `clinic_settings`.

### 7) Testes e verificação
- Dev: com API base ajustada, validar:
  - Login por e‑mail e por Google → `/app`.
  - Cadastro local → `/app`.
  - Abrir barra lateral pelo avatar → alterar prefs (tema/voz/modality) → salvar OK.
  - Logout → `/login`.

## Entregáveis
- Ajuste de env/proxy para API base.
- Backend `/auth/me` com `userId/email/name` e consistência com Google.
- DDL adicional (user_providers, unique index lower(email)).
- UI da barra lateral preenchendo dados reais de conta.

## Critérios de Aceite
- Todas as páginas (Landing/Login/SignUp/Editor) funcionam com backend ativo e sem `ERR_ABORTED`.
- Barra lateral exibe e salva dados do usuário; fecha pelo `Esc`/backdrop.
- Login/Logout/Cadastro operam com cookies/CSRF corretos; Google Login cria/recupera conta e preenche `email/name`.

Confirma que posso aplicar as alterações acima (env, backend `/auth/me`, DDL e pequenos ajustes no front) e validar em preview?