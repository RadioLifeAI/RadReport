# Configuração de Secrets do GitHub Actions para RadReport

Este guia explica como configurar os secrets necessários para o deploy automático do RadReport via GitHub Actions.

## Secrets Necessários

Você precisa configurar os seguintes secrets no seu repositório GitHub:

### 1. Secrets do Supabase
- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

### 2. Secrets do Cloudflare Turnstile
- `VITE_TURNSTILE_SITE_KEY`: Site key do Turnstile para produção

### 3. Secrets do Google OAuth
- `VITE_GOOGLE_CLIENT_ID`: Client ID do Google OAuth

### 4. Secrets do Vercel
- `VERCEL_TOKEN`: Token de acesso ao Vercel
- `VERCEL_ORG_ID`: ID da organização no Vercel
- `VERCEL_PROJECT_ID`: ID do projeto frontend no Vercel
- `VERCEL_API_PROJECT_ID`: ID do projeto API no Vercel

## Como Configurar os Secrets

1. Vá para o repositório: https://github.com/RadioLifeAI/RadReport
2. Clique em "Settings" (Configurações)
3. No menu lateral, clique em "Secrets and variables" > "Actions"
4. Clique em "New repository secret"
5. Adicione cada secret com seu respectivo valor

## Onde Encontrar os Valores

### Supabase
- Acesse seu projeto no Supabase
- Vá para Settings > API
- Copie a URL do projeto e a Anon Key

### Cloudflare Turnstile
- Acesse o dashboard do Cloudflare
- Vá para Turnstile > Seu site
- Copie o site key (não o secret key)

### Google OAuth
- Acesse Google Cloud Console
- Vá para APIs & Services > Credentials
- Copie o Client ID do OAuth 2.0

### Vercel
- Acesse seu dashboard no Vercel
- Vá para Settings > Tokens
- Crie um novo token
- Para os IDs de projeto, vá para cada projeto e copie o ID da URL

## Notas Importantes

- O deploy será acionado automaticamente quando você fizer push para a branch main
- O workflow inclui testes, build e deploy para produção
- Certifique-se de que todos os secrets estejam configurados antes de fazer push

## Testando o Deploy

Após configurar todos os secrets:
1. Faça uma pequena alteração no código
2. Faça commit e push para a branch main
3. Acesse a aba "Actions" no GitHub para monitorar o progresso
4. O deploy deve completar em alguns minutos