## Objetivo
Integrar o botão “Continuar com Google” ao fluxo real de autenticação, com verificação de `id_token` no backend, emissão de `access`/`refresh` seguros e proteção CSRF.

## Arquitetura
- Frontend (SPA): usa Google Identity Services para obter `id_token` (JWT) do usuário.
- Backend (Node/Express): valida `id_token` contra o `GOOGLE_CLIENT_ID`, cria/recupera usuário e emite `accessToken` + `refresh` (cookie HttpOnly, SameSite Strict, Secure em produção).

## Mudanças Propostas
### 1) Backend
- Adicionar rota: `POST /v1/auth/google` (proteção CSRF)
  - Corpo: `{ idToken: string }`
  - Verificar `id_token` com `google-auth-library` (`OAuth2Client.verifyIdToken`), `audience = GOOGLE_CLIENT_ID`.
  - Exigir `email_verified = true`; extrair `sub` (googleId), `email`, `name`, `picture`.
  - `UPSERT` em `users` (e opcionalmente `user_providers` com `provider='google'`, `provider_id=sub`).
  - Emitir `accessToken` (curto) e `refresh` em cookie: `httpOnly`, `secure`, `sameSite:'strict'`, `path:'/v1/auth/refresh'`.
- Rate-limit básico na rota Google (se já houver middleware, reutilizar; caso contrário, limite suave).
- Variáveis de ambiente: `GOOGLE_CLIENT_ID`.

### 2) Frontend
- `Login.tsx`:
  - Carregar script do Google (`https://accounts.google.com/gsi/client`) sob demanda.
  - `google.accounts.id.initialize({ client_id, callback })` e acionar `prompt()` ao clicar no botão; receber `credential` (id_token).
  - Enviar para `/v1/auth/google` com header `X-CSRF-Token` (já buscamos em `/v1/auth/csrf`).
  - Em caso de sucesso: salvar `accessToken` via `setAccessToken`, navegar para `/app`.
- `DataService`: adicionar `loginWithGoogleIdToken(idToken)` que `POST` em `/v1/auth/google`.
- `VITE_GOOGLE_CLIENT_ID`: ler de `import.meta.env` e fallback para `localStorage('rr.google.cid')` para desenvolvimento.

### 3) Segurança
- CSRF obrigatório em endpoints que setam cookie (refresh/logout/google).
- Cookies `refresh`: HttpOnly, Secure (em prod), SameSite Strict, `path:'/v1/auth/refresh'`.
- Validação de `aud` e `iss` do `id_token` e `email_verified`.
- Não armazenar segredo no front; sem exposição de tokens no console.

### 4) Critérios de Aceite
- Botão do Google efetua login real: criar/recuperar usuário e redirecionar para `/app`.
- Fluxo funciona em Light/Dark sem afetar UI.
- Tokens e cookies seguem as melhores práticas de segurança.

## Execução
Após aprovação, vou:
1. Instalar `google-auth-library` no backend.
2. Implementar `POST /v1/auth/google` (com CSRF).
3. Atualizar `DataService` e `Login.tsx` para usar Google Identity Services (carregamento do script e envio do `id_token`).
4. Validar em preview (login → `/app`).

Confirma para eu executar?