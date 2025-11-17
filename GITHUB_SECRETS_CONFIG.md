# Configuração de Secrets do GitHub Actions para RadReport

Este arquivo contém a lista de todos os secrets necessários para o deploy automático do RadReport.

## Secrets do Frontend (Vercel)

### Supabase
- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

### Google OAuth
- `VITE_GOOGLE_CLIENT_ID`: Client ID do Google OAuth

### Cloudflare Turnstile
- `VITE_TURNSTILE_SITE_KEY`: Site key do Turnstile para produção

## Secrets do Backend (API)

### Supabase
- `SUPABASE_URL`: URL do Supabase (mesma do frontend)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key do Supabase (para backend)

### Cloudflare Turnstile
- `TURNSTILE_SECRET_KEY`: Secret key do Turnstile para validação no backend

### Google OAuth
- `GOOGLE_CLIENT_ID`: Client ID do Google OAuth (mesmo do frontend)
- `GOOGLE_CLIENT_SECRET`: Client secret do Google OAuth

### JWT
- `JWT_SECRET`: Secret para assinatura de JWT tokens

## Configuração do Vercel

### Tokens de Deploy
- `VERCEL_TOKEN`: Token do Vercel para deploy automático
- `VERCEL_ORG_ID`: ID da organização no Vercel
- `VERCEL_PROJECT_ID`: ID do projeto frontend no Vercel
- `VERCEL_API_PROJECT_ID`: ID do projeto API no Vercel

## Como obter os valores:

### Supabase
1. Acesse seu projeto no Supabase
2. Vá para Settings > API
3. Copie a Project URL e anon key
4. Copie a service_role key (apenas para backend)

### Google Cloud Console
1. Acesse https://console.cloud.google.com
2. Vá para APIs & Services > Credentials
3. Copie o Client ID e Client Secret

### Cloudflare Turnstile
1. Acesse https://dash.cloudflare.com
2. Vá para Turnstile
3. Copie o site key e secret key do widget criado para radreport.com.br

### Vercel
1. Acesse https://vercel.com/account/tokens
2. Crie um novo token
3. Vá para seu projeto e copie os IDs da organização e projeto

### JWT Secret
- Gere uma string aleatória segura de pelo menos 32 caracteres
- Use: `openssl rand -base64 32`

## Configuração no GitHub

1. Vá para Settings > Secrets and variables > Actions
2. Clique em "New repository secret"
3. Adicione cada secret com seu respectivo valor