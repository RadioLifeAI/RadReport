## Contexto
- A biblioteca antiga (platform.js / gapi.auth2) está descontinuada. O caminho recomendado é Google Identity Services (GIS) com suporte a FedCM.
- O servidor deve validar o `id_token` (JWT) com `GOOGLE_CLIENT_ID` e emitir `access`/`refresh` com proteções de segurança.

## O que vamos fazer
### Frontend (GIS/FedCM)
- Carregar `https://accounts.google.com/gsi/client` e inicializar `google.accounts.id` com `client_id` e `use_fedcm_for_prompt: true`.
- Renderizar botão padrão do Google OU usar o botão custom atual com `prompt()` (mantendo o design). Callback recebe `credential` (id_token).
- Enviar o `id_token` para `/v1/auth/google` via `DataService.loginWithGoogleIdToken`, com `X-CSRF-Token` obtido em `/v1/auth/csrf`.
- Variáveis: `VITE_GOOGLE_CLIENT_ID` no front; fallback dev via `localStorage('rr.google.cid')`.

### Backend (verificação segura)
- Rota `POST /v1/auth/google` (CSRF obrigatório):
  - Validar `id_token` com `google-auth-library` (`verifyIdToken`) OU fallback em `https://oauth2.googleapis.com/tokeninfo` (já implementado, reforçar checks `aud`, `iss`, `email_verified`).
  - `UPSERT` usuário por e-mail e mapear provedor em `user_providers(provider='google', provider_id=sub)`.
  - Emitir `accessToken` curto e cookie `rr_refresh` (`HttpOnly`, `SameSite:'strict'`, `Secure` em prod, `path:'/v1/auth/refresh'`).
  - Rate-limit específico para `/v1/auth/google` (ex.: 30/min por IP).

### Segurança e CSP
- Helmet CSP: incluir `connect-src` para `https://accounts.google.com`, `https://oauth2.googleapis.com`, `https://www.googleapis.com` e `script-src` para `https://accounts.google.com/gsi/client`.
- CORS: garantir `origin` permitido (ex.: `http://localhost:5173`) e `credentials:true`.
- Não logar tokens/PII; manter TTLs curtos.

### Configuração
- Backend: `GOOGLE_CLIENT_ID`.
- Frontend: `VITE_GOOGLE_CLIENT_ID`.

### Testes
- Fluxo: abrir `/login` → clicar “Continuar com Google” → aceitar → backend valida → recebe `accessToken` → redireciona `/app`.
- Testar rejeições: `aud` errado, e-mail não verificado, CSRF ausente.

### Entregáveis
- Código do front usando GIS/FedCM e botão renderizado/`prompt`.
- Backend validando `id_token` e emitindo tokens com cookies seguros.
- Ajustes de CSP, env e rate-limit.

Posso aplicar agora e te mostrar o preview com o botão do Google integrado e o fluxo completo?