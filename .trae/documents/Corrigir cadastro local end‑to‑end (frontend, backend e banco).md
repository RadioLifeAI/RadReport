## Causas prováveis
- Backend indisponível (Connection refused) ou `VITE_API_BASE` apontando para o endpoint incorreto.
- DB sem tabelas/EXTENSION necessárias (`users`, `user_providers`, `users_auth`, `pgcrypto` ou `uuid-ossp`).
- CSRF ausente no `POST /v1/auth/register` (o front tenta buscar `/v1/auth/csrf`, mas precisa do backend ativo).

## Plano de Ajuste
### 1) Ambiente e servidor
- Iniciar o backend na porta `8787` com envs:
  - `NODE_ENV=development`
  - `PORT=8787`
  - `ALLOWED_ORIGIN=http://localhost:5173`
  - `GOOGLE_CLIENT_ID=...`
  - `DATABASE_URL=postgres://...`
- Front: confirmar `VITE_API_BASE=http://localhost:8787/v1` ou configurar proxy em `vite.config.ts` para manter `/v1` relativo.

### 2) Banco de Dados (migração mínima)
- Executar criação/ajuste das tabelas e extensões:
  - `create extension if not exists pgcrypto;` ou `uuid-ossp` (conforme função usada).
  - `create table if not exists users(user_id uuid primary key, email text unique not null, updated_at timestamptz not null default now());`
  - `create unique index if not exists users_email_lower_unique on users(lower(email));`
  - `create table if not exists user_providers(user_id uuid references users(user_id) on delete cascade, provider text, provider_id text, updated_at timestamptz, primary key(user_id, provider));`
  - `create table if not exists users_auth(user_id uuid primary key references users(user_id) on delete cascade, password_hash text not null, password_version smallint not null default 1, failed_attempts int not null default 0, locked_until timestamptz null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());`

### 3) Backend /v1/auth/register
- Garantir que o endpoint:
  - Valide e‑mail (regex), senha (mín. 12 chars), CSRF.
  - Use `gen_random_uuid()` (pgcrypto) ou `uuid_generate_v4()` (uuid-ossp) — escolher uma e garantir a EXTENSION.
  - Faça UPSERT em `users`, e INSERT em `users_auth` com hash scrypt.
  - Emita `accessToken`/cookie `rr_refresh` e retorne 201/200.
  - Retorne 409 `EMAIL_EXISTS` para e‑mail já cadastrado.

### 4) Front SignUp
- Confirmar que `dataService.register`:
  - Busca `/v1/auth/csrf` e envia `X-CSRF-Token`.
  - Chama `POST /v1/auth/register` com JSON `{ email, password }`.
  - Em sucesso, redireciona para `/app`.
- UI: manter validações cliente (senha forte, confirmação, termos) e mensagens de erro (409, 400 etc.).

### 5) Testes end‑to‑end
- Caso novo:
  - Preencher e‑mail e senha forte → “Criar conta” → receber 200/201 e ir para `/app`.
- Caso duplicado:
  - Repetir com e‑mail existente → ver 409 `EMAIL_EXISTS` e mensagem UI.
- Logout:
  - Abrir perfil → “Sair” → voltar para `/login`.

### 6) Observabilidade e erros
- Log controlado (sem PII) nos endpoints de auth.
- Confirmar CORS/CSP já configurados.

## Critérios de Aceite
- Cadastro local cria usuário e inicia sessão, redirecionando ao editor.
- Erros tratados com mensagens adequadas; sem `ERR_CONNECTION_REFUSED` (backend ativo).