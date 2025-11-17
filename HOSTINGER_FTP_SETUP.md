# Configuração de Deploy FTP para Hostinger - RadReport

Este guia explica como configurar o deploy automático do RadReport para a Hostinger via FTP usando GitHub Actions.

## 🎯 Objetivo

Configurar deploy automático do RadReport diretamente na Hostinger quando houver push na branch `main`.

## 🔧 Secrets Necessários para FTP

Você precisa configurar os seguintes secrets no GitHub:

### 1. Credenciais FTP da Hostinger
- `FTP_HOST`: Servidor FTP (geralmente: ftp.radreport.com.br ou seu IP)
- `FTP_USER`: Usuário FTP
- `FTP_PASS`: Senha FTP

### 2. Configurações do Projeto (já devem estar configuradas)
- `VITE_SUPABASE_URL`: URL do Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `VITE_TURNSTILE_SITE_KEY`: Site key do Turnstile
- `VITE_GOOGLE_CLIENT_ID`: Client ID do Google OAuth

## 📋 Passo a Passo para Obter as Credenciais FTP

### 1. Acessar o Painel da Hostinger

1. Faça login em: https://www.hostinger.com.br
2. Vá para "Painel de Controle" → "Hospedagem"
3. Clique em "Gerenciar" no seu domínio radreport.com.br

### 2. Encontrar as Credenciais FTP

#### Opção A - Via File Manager:
1. No painel, vá para "Arquivos" → "Gerenciador de Arquivos"
2. As credenciais FTP geralmente aparecem na página inicial
3. Ou vá para "Configurações FTP" no menu lateral

#### Opção B - Via Configurações:
1. No painel, procure por "Configurações FTP" ou "FTP Accounts"
2. Lá você encontrará:
   - **Servidor/Servidor FTP**: geralmente `ftp.radreport.com.br` ou o IP do servidor
   - **Usuário**: seu usuário FTP (pode ser seu usuário da Hostinger)
   - **Senha**: senha FTP (pode ser diferente da senha da Hostinger)

### 3. Testar as Credenciais FTP

Antes de configurar no GitHub, teste as credenciais:

```bash
# Teste via terminal (se estiver no Linux/Mac)
ftp ftp.radreport.com.br

# Ou use um cliente FTP como FileZilla
# Host: ftp.radreport.com.br
# Usuário: seu_usuario
# Senha: sua_senha
# Porta: 21
```

### 4. Configurar no GitHub

1. Vá para: https://github.com/RadioLifeAI/RadReport/settings/secrets/actions
2. Clique em "New repository secret"
3. Adicione os secrets:

#### FTP_HOST
- **Name**: `FTP_HOST`
- **Value**: `ftp.radreport.com.br` (ou o IP que você encontrou)

#### FTP_USER
- **Name**: `FTP_USER`
- **Value**: Seu usuário FTP

#### FTP_PASS
- **Name**: `FTP_PASS`
- **Value**: Sua senha FTP

## 🚀 Como Funciona o Deploy

Quando você fizer push na branch `main`:

1. **Build**: O GitHub Actions compila o projeto React
2. **Versionamento**: Cria um arquivo `version.json` com informações do build
3. **FTP**: Envia todos os arquivos do `dist/` para `/public_html/` na Hostinger
4. **Tag**: Cria uma tag de release no GitHub
5. **Notificação**: Mostra informações do deploy

## 📁 Estrutura no Servidor

Após o deploy, sua hospedagem terá:
```
/public_html/
├── index.html          # Página principal
├── assets/            # Arquivos estáticos
├── version.json       # Informações do build
└── ...                # Outros arquivos do build
```

## 🔍 Verificação

Após configurar e fazer o primeiro deploy:

1. Acesse: https://radreport.com.br
2. Verifique se o site está funcionando
3. Acesse: https://radreport.com.br/version.json para ver informações do build

## 🛠️ Arquivos do Workflow

O workflow está em: `.github/workflows/deploy-hostinger.yml`

### Características:
- **Seguro**: Não apaga arquivos existentes, só sobrescreve
- **Versionado**: Cria arquivo de versão com hash do Git
- **Logs**: Mostra informações detalhadas do build
- **Tags**: Cria tags de release automáticas
- **Rollback**: Mantém histórico de versões via Git tags

## ⚠️ Importante

- **Backup**: O deploy sobrescreve arquivos, mas não apaga extras
- **Teste**: Sempre teste as credenciais FTP antes
- **Segurança**: Nunca commit credenciais diretamente no código
- **Monitoramento**: Verifique os logs do GitHub Actions após cada deploy

## 🆘 Suporte

Se tiver problemas:
1. Verifique os logs do GitHub Actions
2. Teste as credenciais FTP manualmente
3. Confirme que o domínio está apontando para a Hostinger
4. Verifique se há espaço suficiente na hospedagem

## 🔄 Alternativas

Se preferir, você pode usar:
- **GitHub CLI**: Para fazer deploy manual
- **Vercel**: Se mudar de ideia sobre a Hostinger
- **Netlify**: Outra opção de hospedagem

---

**Pronto para configurar?** Vá para o GitHub e adicione os secrets FTP agora! 🚀