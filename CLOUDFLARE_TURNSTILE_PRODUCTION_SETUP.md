# 🛡️ Cloudflare Turnstile - Configuração para radreport.com.br

## 📋 **Passo a Passo para Configurar Turnstile em Produção**

### **1. Acessar Dashboard Cloudflare**
```
1. Acesse: https://dash.cloudflare.com
2. Faça login com sua conta
3. Vá para: Turnstile (no menu lateral)
```

### **2. Criar Widget de Produção**
```
1. Clique em: "Add widget"
2. Nome do widget: "RadReport Production"
3. Tipo de widget: "Managed" (recomendado)
4. Domínios permitidos:
   - radreport.com.br
   - www.radreport.com.br
   - https://radreport.com.br
   - https://www.radreport.com.br
```

### **3. Configurações Recomendadas**
```
🔧 Configurações do Widget:
- Modo: Managed (recomendado)
- Aparência: Auto (detecta tema do site)
- Tamanho: Normal
- Idioma: Portuguese (Brazil)
- Tempo de expiração: 300 segundos (padrão)
```

### **4. Obter as Chaves**
```
📋 Após criar o widget, copie:
- Site Key: (começa com 0x...)
- Secret Key: (mantenha segura!)

⚠️ IMPORTANTE: Nunca commite a Secret Key!
```

### **5. Configurar no Projeto**

**Arquivo `.env.local` (para testes locais):**
```bash
# Mantenha as chaves de teste para desenvolvimento
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
VITE_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

**Variáveis de Ambiente do Servidor (produção):**
```bash
# Configure no painel do seu hospedagem (Vercel, Netlify, etc)
VITE_TURNSTILE_SITE_KEY=sua-site-key-real
VITE_TURNSTILE_SECRET_KEY=sua-secret-key-real
TURNSTILE_SECRET_KEY=sua-secret-key-real
```

### **6. Configurar DNS na Hostinger**
```
📍 Configurações de DNS para radreport.com.br:

Tipo: A
Nome: @ (radreport.com.br)
Valor: [IP do seu servidor/deploy]
TTL: 3600

Tipo: A  
Nome: www (www.radreport.com.br)
Valor: [IP do seu servidor/deploy]
TTL: 3600

Tipo: CNAME
Nome: api (api.radreport.com.br)
Valor: [URL do seu backend]
TTL: 3600
```

### **7. Configurar nos Outros Serviços**

**Supabase Auth Settings:**
```
Site URL: https://radreport.com.br
Redirect URLs:
- https://radreport.com.br/auth/callback
- https://www.radreport.com.br/auth/callback
```

**Google Cloud Console:**
```
Authorized JavaScript origins:
- https://radreport.com.br
- https://www.radreport.com.br

Authorized redirect URIs:
- https://radreport.com.br/auth/callback
- https://www.radreport.com.br/auth/callback
```

### **8. Deploy e Teste**
```bash
# Testar em produção
1. Faça deploy do seu projeto
2. Acesse: https://radreport.com.br/signup
3. Verifique se o Turnstile aparece
4. Complete um cadastro de teste
5. Verifique os logs do servidor
```

## 🔍 **Verificação de Funcionamento**

### **Checklist de Testes:**
- [ ] Widget aparece no formulário
- [ ] Validação server-side funciona
- [ ] Erros são tratados corretamente
- [ ] Logs mostram "✅ Turnstile verification successful"
- [ ] Formulário só envia após validação

### **Logs para Monitorar:**
```bash
# Frontend (navegador)
"Turnstile verification success: XXXX.DUMMY.TOKEN.XXXX"

# Backend (servidor)
"🔍 Verificando token Turnstile..."
"✅ Turnstile verification successful"
```

## 🚨 **Boas Práticas de Segurança**

### **Nunca Faça:**
- ❌ Commite chaves secretas no repositório
- ❌ Use mesmas chaves para dev e produção
- ❌ Exponha secret keys no client-side
- ❌ Compartilhe chaves entre projetos

### **Sempre Faça:**
- ✅ Use variáveis de ambiente para chaves
- ✅ Configure CORS apropriadamente
- ✅ Valide tokens no servidor
- ✅ Monitore uso e anomalias
- ✅ Rotacione chaves periodicamente

## 📚 **Referências da Documentação**
- [Cloudflare Turnstile - Get Started](https://developers.cloudflare.com/turnstile/get-started/)
- [Testing Turnstile](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
- [Hostname Management](https://developers.cloudflare.com/turnstile/get-started/#hostname-management)

---

**💡 Dica:** Crie o widget de produção apenas quando estiver pronto para publicar. Use as chaves de teste durante todo o desenvolvimento!