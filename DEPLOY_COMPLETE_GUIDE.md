# 🚀 Guia Completo de Deploy do RadReport

Este guia ensina como fazer o deploy do RadReport para produção no domínio radreport.com.br

## 📋 Pré-requisitos

### 1. Domínio e DNS (Hostinger)
- Domínio: `radreport.com.br` já configurado na Hostinger
- Configurar DNS na Hostinger para apontar para Vercel

### 2. Contas Necessárias
- GitHub com repositório do RadReport
- Vercel (conta pro recomendada)
- Supabase (projeto configurado)
- Google Cloud Console (OAuth configurado)
- Cloudflare (Turnstile configurado)

## 🔧 Configuração Inicial

### 1. Preparar o Projeto
```bash
# Verificar se está tudo funcionando localmente
npm run dev

# Testar build local
npm run build
```

### 2. Configurar Variáveis de Ambiente
```bash
# Executar script de configuração
./deploy-setup.sh

# Ou configurar manualmente:
cp .env.production.example .env.production
# Editar .env.production com valores de produção
```

### 3. Configurar GitHub Secrets
```bash
# Executar script interativo
./setup-github-secrets.sh

# Ou configurar manualmente em:
# GitHub > Settings > Secrets and variables > Actions
```

## 📋 Secrets Necessários

### Frontend (Vercel)
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
VITE_TURNSTILE_SITE_KEY=0x4AAAAAA...
```

### Backend (API)
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
TURNSTILE_SECRET_KEY=0x4AAAAAA...
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
JWT_SECRET=seu-jwt-secret-aleatorio
```

### Vercel (Deploy)
```env
VERCEL_TOKEN=seu-vercel-token
VERCEL_ORG_ID=sua-org-id
VERCEL_PROJECT_ID=seu-project-id
VERCEL_API_PROJECT_ID=seu-api-project-id
```

## 🚀 Deploy Automático (GitHub Actions)

### 1. Workflow de Deploy
O arquivo `.github/workflows/deploy.yml` já está configurado com:
- Testes automatizados
- Build de produção
- Deploy para Vercel (frontend)
- Deploy da API (backend)

### 2. Acionando Deploy
```bash
# Push para main/master dispara deploy automático
git push origin main

# Ou manualmente via GitHub CLI
gh workflow run deploy.yml
```

### 3. Monitorar Deploy
```bash
# Ver status do workflow
gh run list --workflow=deploy.yml

# Ver logs em tempo real
gh run watch --exit-status
```

## 🌐 Configuração de Domínio

### 1. Vercel
1. Acesse seu projeto no Vercel
2. Vá para Settings > Domains
3. Adicione `radreport.com.br`
4. Siga as instruções de DNS

### 2. Hostinger DNS
Configure os registros DNS na Hostinger:
```
Type: A
Name: @
Value: 76.76.19.61 (IP do Vercel)

Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: CNAME  
Name: api
Value: cname.vercel-dns.com
```

### 3. Configurações nos Serviços

#### Supabase
- Authentication > URL Configuration:
  - Site URL: `https://radreport.com.br`
  - Redirect URLs: `https://radreport.com.br/auth/callback`

#### Google Cloud Console
- APIs & Services > Credentials:
  - Authorized JavaScript origins: `https://radreport.com.br`
  - Authorized redirect URIs: `https://radreport.com.br/auth/callback`

#### Cloudflare Turnstile
- Criar novo site com domínio: `radreport.com.br`
- Obter novas chaves de produção

## 🔍 Testes Pós-Deploy

### 1. Testar Site Principal
```bash
curl -I https://radreport.com.br
```

### 2. Testar API
```bash
curl https://api.radreport.com.br/api/health
```

### 3. Testar Autenticação
- Acessar `https://radreport.com.br/login`
- Testar login com Google
- Verificar Turnstile CAPTCHA

### 4. Testar Funcionalidades
- Criar conta local
- Fazer login/logout
- Navegar pelo dashboard
- Testar editor

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Deploy Falhou
```bash
# Ver logs no GitHub Actions
gh run view --log

# Verificar secrets
gh secret list
```

#### 2. Erro de CORS
- Verificar configuração em `api/server.ts`
- Certificar que domínio está na whitelist

#### 3. Autenticação Falhando
- Verificar URLs de redirect no Supabase
- Verificar Google OAuth origins
- Verificar JWT secret

#### 4. Turnstile Não Funciona
- Verificar chaves de produção
- Verificar domínio configurado no Cloudflare

## 📊 Monitoramento

### 1. Vercel Analytics
- Ativar em Vercel Dashboard > Analytics

### 2. Vercel Logs
- Monitorar em real-time
- Configurar alertas

### 3. GitHub Actions
- Monitorar workflows
- Configurar notificações

## 🔒 Segurança

### 1. Verificações de Segurança
- HTTPS ativado (Vercel faz automaticamente)
- Headers de segurança configurados
- Rate limiting implementado

### 2. Backup
- Configurar backup do banco Supabase
- Backup de arquivos importantes

## 🔄 Rollback

### Rollback Rápido
```bash
# Reverter para commit anterior
git revert HEAD

# Push para main (dispara novo deploy)
git push origin main
```

### Rollback no Vercel
1. Acesse Vercel Dashboard
2. Vá para Deployments
3. Escolha deployment anterior
4. Clique em "Promote to Production"

## 📞 Suporte

### Documentação
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [GitHub Actions Docs](https://docs.github.com/actions)

### Comunidades
- Vercel Community
- Supabase Discord
- GitHub Community

---

**Última atualização:** $(date)
**Versão:** 1.0.0