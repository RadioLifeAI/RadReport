## Situação Atual
- Não há página de cadastro implementada; o link "Criar conta" em `src/pages/Login.tsx` é apenas visual.
- Backend oferece `/v1/auth/google` (GIS/id_token) e `/v1/auth/login` (demo por e‑mail sem senha), mas não há fluxo robusto de senha.

## Objetivo
- Criar página `SignUp` com o mesmo visual da Login (Hero animado, card translúcido, tokens, Light/Dark), com cadastro via:
  1) Google (GIS/FedCM) — usa `/v1/auth/google` e cria a conta automaticamente se não existir.
  2) Conta local — e‑mail + senha, confirmando termos.
- Adotar melhores práticas de segurança para armazenamento e fluxo.

## Frontend
- Nova página `src/pages/SignUp.tsx`:
  - Campos: e‑mail, senha, confirmar senha, aceitar termos, e botão “Continuar com Google”.
  - Validações: e‑mail válido, senha forte (mín. 12 chars, mistura de classes; sem listas comuns), confirmação igual.
  - UI: mostrar força da senha, toggle mostrar/ocultar, mensagens acessíveis, responsivo.
  - Ações:
    - Google: reaproveitar GIS/FedCM igual à Login, chamando `dataService.loginWithGoogleIdToken`. Caso não exista usuário, backend cria; resulta em sessão iniciada.
    - Local: `dataService.register({ email, password })` (novo método) que chama `/v1/auth/register` com CSRF. Em sucesso, inicia sessão (retorna `accessToken` + cookie `refresh`) e navega para `/app`.
- Rotas: adicionar `/signup` no router e linkar "Criar conta" da Login para lá; manter estilo uniforme.

## Backend
- Endpoints:
  - `POST /v1/auth/register` (CSRF obrigatório):
    - Payload: `{ email, password }`.
    - Normaliza e‑mail; rejeita duplicado.
    - Hash de senha com `argon2id` (memória alta, time cost, salt aleatório; versão registrada).
    - Persiste em `users` + `users_auth` (nova tabela), com auditoria mínima.
    - Emite `accessToken` e cookie `rr_refresh` seguros.
  - `POST /v1/auth/login/password` (CSRF opcional se não setar cookie; recomendado usar CSRF):
    - Compara a senha via `argon2.verify`.
    - Limite de tentativas com backoff e `locked_until`.
    - Emite tokens iguais ao fluxo de register, com CSRF quando for setar cookie.
  - (Opcional futuro) `POST /v1/auth/password/forgot` e `POST /v1/auth/password/reset` (stub dev com token expira em 15 min).
- Banco
  - `users_auth(user_id uuid PK/FK, password_hash text, password_version smallint, failed_attempts int, locked_until timestamptz, created_at/updated_at)`.
  - Índice único `users.email` já existe; garantir `lower(email)` único.
- Segurança
  - CSRF em endpoints que setam cookie.
  - Rate limit por IP e e‑mail.
  - Argon2id para senha; não logar credentials; TTL curto para access.
  - `SameSite: strict`, `HttpOnly`, `Secure` em produção; `path:'/v1/auth/refresh'`.
  - CSP/CORS já configurados.

## Entregáveis
- Página `SignUp` estilizada igual `Login` com Hero animado (componentes existentes).
- Métodos no `DataService`: `register`, `loginWithPassword`.
- Endpoints backend com validação, hashing, rate‑limit e CSRF.
- Router atualizado com `/signup`; links ajustados.

## Testes
- Fluxo Google: `/signup` → Google → cria ou entra → `/app`.
- Fluxo local: e‑mail+senha válidos → cadastro → `/app`; tentativa com e‑mail duplicado → 409.
- Testes negativos: senha fraca/curta, termos não aceitos, CSRF ausente, tentativas > limite.

## Critérios de Aceite
- Cadastro funcional com ambos os métodos; tokens e cookies seguros; UI consistente com Login.
- Sem erros bloqueantes; logs limpos de PII.

Posso iniciar a implementação agora? 