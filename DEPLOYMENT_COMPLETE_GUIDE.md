# 🚀 Guia Completo de Deploy RadReport na Hostinger

## 📋 Checklist de Configuração

### ✅ 1. Configuração do Domínio (Hostinger)
- [ ] Domínio `radreport.com.br` configurado na Hostinger
- [ ] DNS apontando para os servidores da Hostinger
- [ ] Certificado SSL ativado (geralmente automático)

### ✅ 2. Configuração dos Serviços Externos
- [ ] **Supabase**: Projeto criado e configurado
- [ ] **Google OAuth**: Client ID configurado para `https://radreport.com.br`
- [ ] **Cloudflare Turnstile**: Site key configurada para produção

### ✅ 3. Secrets do GitHub
Configure todos os secrets em: https://github.com/RadioLifeAI/RadReport/settings/secrets/actions

#### Essenciais do Projeto:
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_TURNSTILE_SITE_KEY=sua-site-key-producao
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

#### Credenciais FTP (Hostinger):
```bash
FTP_HOST=ftp.radreport.com.br  # ou IP do servidor
FTP_USER=seu-usuario-ftp
FTP_PASS=sua-senha-ftp
```

### ✅ 4. Arquivos de Configuração
- [ ] `.github/workflows/deploy-hostinger.yml` - Workflow de deploy
- [ ] `public/.htaccess` - Configuração Apache para SPA
- [ ] `scripts/build-hostinger.js` - Script de build otimizado

## 🚀 Como Fazer o Deploy

### Opção 1: Deploy Automático (Recomendado)
1. Faça push para a branch `main`:
```bash
git add .
git commit -m "Deploy para produção"
git push origin main
```

2. O GitHub Actions fará automaticamente:
   - Build do projeto
   - Criação de arquivos de versão
   - Upload via FTP para Hostinger
   - Criação de tag de release

3. Acompanhe o progresso em:
https://github.com/RadioLifeAI/RadReport/actions

### Opção 2: Deploy Manual
```bash
# Build otimizado
npm run build:hostinger

# Ou deploy manual via FTP
npm run deploy:ftp
```

## 📁 Estrutura Final na Hostinger

Após o deploy, seu servidor terá:
```
/public_html/
├── index.html              # Página principal
├── assets/                 # Arquivos estáticos (CSS, JS, imagens)
│   ├── index-*.js         # JavaScript principal
│   ├── index-*.css        # CSS principal
│   └── ...                # Outros assets
├── version.json            # Informações do build
├── health.json             # Health check
└── .htaccess              # Configuração Apache
```

## 🔍 Verificação do Deploy

### 1. Verificar se o Site Está Online
- Acesse: https://radreport.com.br
- Teste: login, cadastro, navegação entre páginas

### 2. Verificar Informações do Build
- Acesse: https://radreport.com.br/version.json
- Deve mostrar: versão, hash do Git, timestamp do build

### 3. Verificar Health Check
- Acesse: https://radreport.com.br/health.json
- Deve mostrar: status "healthy" e informações do sistema

### 4. Testar Rotas da SPA
Teste estas URLs para garantir que o React Router está funcionando:
- https://radreport.com.br/login
- https://radreport.com.br/signup
- https://radreport.com.br/dashboard
- https://radreport.com.br/editor
- https://radreport.com.br/settings

## 🛠️ Solução de Problemas

### Problema: Site não carrega
1. Verifique se o DNS está propagado: `nslookup radreport.com.br`
2. Confirme se os arquivos foram enviados via FTP
3. Verifique os logs do GitHub Actions

### Problema: Páginas 404 ao atualizar
- O `.htaccess` não está configurado corretamente
- Verifique se o arquivo foi enviado para o servidor

### Problema: Autenticação não funciona
1. Verifique os secrets do Supabase
2. Confirme URLs de redirecionamento no Google OAuth
3. Verifique se o domínio está na whitelist do Supabase

### Problema: Turnstile não aparece
- Verifique se a site key está correta
- Confirme se o domínio está autorizado no Cloudflare

## 📊 Monitoramento

### GitHub Actions
- Acesse: https://github.com/RadioLifeAI/RadReport/actions
- Verifique logs de cada deploy
- Monitore duração e sucesso dos builds

### Health Check
Configure monitoramento para: https://radreport.com.br/health.json

### Versionamento
Cada deploy cria uma tag no GitHub com formato:
`v1.0.0-20241117-123456`

## 🔄 Rollback

Se precisar reverter um deploy:
1. Vá para: https://github.com/RadioLifeAI/RadReport/tags
2. Encontre a tag da versão anterior
3. Faça checkout dessa versão
4. Faça push force para main (com cuidado)

## 🚀 Próximos Passos

Após o deploy bem-sucedido, considere:
- [ ] Configurar monitoramento com UptimeRobot
- [ ] Adicionar analytics (Google Analytics, Plausible)
- [ ] Configurar backup automático do banco de dados
- [ ] Implementar CI/CD para o backend (se houver)
- [ ] Adicionar testes automatizados

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do GitHub Actions
2. Confirme todas as etapas deste guia
3. Teste as credenciais FTP manualmente
4. Verifique configurações nos serviços externos

---

**🎉 Seu RadReport está pronto para produção!**

O deploy automático está configurado e funcionando. A cada push na branch `main`, seu site será atualizado automaticamente na Hostinger.

**URLs importantes:**
- Site: https://radreport.com.br
- Version: https://radreport.com.br/version.json
- Health: https://radreport.com.br/health.json
- Repositório: https://github.com/RadioLifeAI/RadReport
- Actions: https://github.com/RadioLifeAI/RadReport/actions