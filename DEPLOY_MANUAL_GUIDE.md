# 📋 Guia de Deploy Manual RadReport para Hostinger

## 🎯 Objetivo
Deploy manual do RadReport para a Hostinger via FTP, sem automação do GitHub Actions.

## 🚀 Como Usar o Deploy Manual

### Opção 1: Comando Simples (Recomendado)
```bash
npm run deploy:hostinger:manual
```

### Opção 2: Passo a Passo
```bash
# 1. Build otimizado
npm run build:hostinger

# 2. Deploy manual (interativo)
node scripts/deploy-manual.js
```

## 📋 Passo a Passo do Deploy Manual

### 1. Preparar o Deploy
Execute o comando:
```bash
npm run deploy:hostinger:manual
```

### 2. Informações do Projeto
O script mostrará:
- ✅ Versão do projeto
- ✅ Hash do Git
- ✅ Branch atual

### 3. Confirmação
Confirme que deseja continuar com o deploy:
```
Deseja continuar com o deploy? (s/n): s
```

### 4. Credenciais FTP
O script solicitará:
```
Servidor FTP (ex: ftp.radreport.com.br): ftp.radreport.com.br
Usuário FTP: seu_usuario_ftp
Senha FTP: ********
```

### 5. Teste de Conexão
O script testará automaticamente a conexão FTP.

### 6. Build do Projeto
O script executará automaticamente:
```bash
npm run build:hostinger
```

### 7. Confirmação de Arquivos
O script mostrará os arquivos que serão enviados:
```
Arquivos a serem enviados (5):
  📄 index.html (2.3 KB)
  📂 assets/ (1.2 MB)
  📄 version.json (0.5 KB)
  📄 health.json (0.3 KB)
  📄 .htaccess (1.1 KB)
```

### 8. Confirme o Upload
```
Confirmar upload destes arquivos? (s/n): s
```

### 9. Diretório Remoto
Escolha o diretório (ou pressione Enter para padrão):
```
Diretório remoto (deixe vazio para /public_html/): 
```

### 10. Upload via FTP
O script fará o upload de todos os arquivos.

### 11. Verificação Final
O script mostrará:
```
✅ Deploy concluído com sucesso! 🎉

📋 Resumo do deploy:
   🌐 Servidor: ftp.radreport.com.br
   📁 Diretório: /public_html/
   🔢 Versão: 0.1.0
   🔤 Git Hash: abc1234
   ⏰ Timestamp: 2024-11-17T12:34:56.789Z

🔗 URLs para verificar:
   Site: https://radreport.com.br
   Versão: https://radreport.com.br/version.json
   Health: https://radreport.com.br/health.json
```

## 🔍 Verificação Após Deploy

### 1. Verificar Site Principal
Acesse: https://radreport.com.br

### 2. Verificar Informações do Build
Acesse: https://radreport.com.br/version.json

### 3. Verificar Health Check
Acesse: https://radreport.com.br/health.json

### 4. Testar Rotas da SPA
Teste estas URLs:
- https://radreport.com.br/login
- https://radreport.com.br/signup
- https://radreport.com.br/dashboard
- https://radreport.com.br/editor
- https://radreport.com.br/settings

## 🛠️ Onde Encontrar as Credenciais FTP

### Hostinger
1. Acesse: https://www.hostinger.com.br
2. Vá para: Painel de Controle → Hospedagem
3. Clique em: Gerenciar → Arquivos → Configurações FTP
4. As credenciais geralmente são:
   - **Servidor**: `ftp.radreport.com.br` (ou IP)
   - **Usuário**: Seu usuário da Hostinger
   - **Senha**: Senha FTP (pode ser diferente da senha da Hostinger)

### Alternativa via File Manager
Se não tiver as credenciais FTP, você pode:
1. Acessar o File Manager da Hostinger
2. Fazer upload manual dos arquivos da pasta `dist/`
3. Extrair para a pasta `public_html/`

## ⚠️ Importante

### Antes do Deploy
- [ ] Certifique-se de que o build foi bem-sucedido
- [ ] Teste localmente com `npm run preview`
- [ ] Verifique se todas as variáveis de ambiente estão configuradas

### Durante o Deploy
- [ ] Mantenha a conexão com internet estável
- [ ] Não feche o terminal durante o upload
- [ ] Aguarde a confirmação de sucesso

### Após o Deploy
- [ ] Teste todas as funcionalidades do site
- [ ] Verifique se o login está funcionando
- [ ] Confirme que as rotas da SPA estão OK
- [ ] Teste o Google OAuth e Turnstile

## 🆘 Solução de Problemas

### Erro: "Conexão FTP falhou"
- Verifique se o servidor FTP está correto
- Confirme usuário e senha
- Teste com FileZilla ou outro cliente FTP

### Erro: "Pasta dist não encontrada"
- Execute `npm run build:hostinger` primeiro
- Verifique se o build foi concluído com sucesso

### Erro: "Upload falhou"
- Verifique espaço em disco na Hostinger
- Confirme permissões de escrita no diretório
- Teste conexão FTP manualmente

### Site não carrega após deploy
- Verifique se o `.htaccess` foi enviado
- Confirme se o domínio está apontando correto
- Teste acessar diretamente arquivos estáticos

## 🔄 Alternativas Manuais

Se o script falhar, você pode usar:

### FileZilla (Cliente FTP)
1. Baixe e instale FileZilla
2. Configure com suas credenciais FTP
3. Conecte e arraste arquivos da pasta `dist/` para `public_html/`

### File Manager (Hostinger)
1. Acesse o File Manager no painel da Hostinger
2. Navegue até `public_html/`
3. Faça upload dos arquivos da pasta `dist/`

### Comandos FTP Manual
```bash
# Conectar
ftp ftp.radreport.com.br

# Login
user seu_usuario
sua_senha

# Comandos
binary
cd public_html
lcd dist
prompt off
mput *.*
quit
```

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do deploy
2. Teste as credenciais FTP manualmente
3. Confirme se o build foi bem-sucedido
4. Verifique configurações no painel da Hostinger

---

**✅ Deploy manual configurado com sucesso!**

Use `npm run deploy:hostinger:manual` quando quiser fazer deploy para a Hostinger. O processo é interativo e guiado passo a passo. 🚀