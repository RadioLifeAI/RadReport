## Alterações
- Backend
  1) Criar middleware CSRF com cookie `rr_csrf` e header `X-CSRF-Token`.
  2) Rota `GET /v1/auth/csrf` que gera token, seta cookie `HttpOnly+SameSite=Strict` e retorna `{csrf}`.
  3) Proteger `POST /v1/auth/refresh` e `POST /v1/auth/logout` com `requireCsrf`.
  4) Rota `POST /v1/auth/social` (dev) que aceita `{ provider, email }` e reaproveita login/email.
- Frontend
  1) Em LoginPage, chamar `/v1/auth/csrf` antes de efetuar login e salvar o token em `localStorage` para enviar no header.
  2) Botão “Continuar com Google” aciona `POST /v1/auth/social` com provider 'google' e e‑mail informado.
  3) DataService mantém suporte a `X-CSRF-Token` conforme existente.

## Segurança
- CSRF obrigatório nos endpoints que usam cookie (refresh/logout).
- Rate-limit global já ativo; manter mensagens genéricas.

## Entrega
- Arquivo novo: `server/src/middleware/csrf.ts`.
- Atualização: `server/src/routes/auth.ts` (csrf + social + proteção nos endpoints).
- Ajuste: `src/pages/LoginPage.tsx` (chamar /csrf e social login).

Aprovar para aplicar as mudanças.