# ✅ CONFIGURAÇÃO GOOGLE OAUTH - CHECKLIST DEFINITIVO

## 📋 URLs de Redirect Necessárias

### 🔴 SUPABASE DASHBOARD (Authentication → Providers → Google)

Adicione EXATAMENTE estas URLs:

```
http://localhost:5173/auth/callback
http://localhost:5173/auth/callback/
http://localhost:5173
http://localhost:5173/
```

### 🔴 GOOGLE CLOUD CONSOLE (APIs & Services → Credentials → OAuth 2.0)

Adicione EXATAMENTE estas URLs em "Authorized redirect URIs":

```
http://localhost:5173/auth/callback
http://localhost:5173/auth/callback/
```

⚠️ **IMPORTANTE**: Google NÃO aceita URLs com hash (#)

## 🔍 Teste Rápido de Diagnóstico

### 1. Teste no Console do Navegador

```javascript
// Teste 1: Verificar sessão
supabase.auth.getSession().then(x => console.log('Sessão:', x))

// Teste 2: Verificar configuração
console.log('Origem:', window.location.origin)
console.log('Redirect URL:', `${window.location.origin}/auth/callback`)

// Teste 3: Iniciar OAuth manualmente
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
}).then(result => console.log('OAuth URL:', result.data.url))
```

### 2. Resultados Esperados

✅ **SUCESSO**: 
- Sessão retorna usuário autenticado
- OAuth gera URL válida
- Redirecionamento funciona

❌ **FALHA**:
- `session: null` → Problema no callback
- `redirect_to not allowed` → URLs não configuradas
- Loop infinito → URLs inconsistentes

## 🛠️ Configurações Atuais do Projeto

### Porta Atual: 5173 (Vite default)
### URLs de Callback: 
- `http://localhost:5173/auth/callback`

### Arquivos de Configuração:
- `src/lib/supabase.ts` → Função `signInWithGoogle()`
- `src/hooks/useAuth.tsx` → Handler `onAuthStateChange`
- `src/pages/AuthCallback.tsx` → Página de callback simplificada

## 🚨 Erros Comuns e Soluções

### Erro: "Processando autenticação..." travado
**Causa**: Callback URLs não configuradas ou inconsistentes
**Solução**: Verificar checklist acima

### Erro: "redirect_to not allowed"
**Causa**: URL não está na whitelist do Supabase
**Solução**: Adicionar `http://localhost:5173/auth/callback` no Supabase

### Erro: Loop infinito de login
**Causa**: URLs diferentes entre Supabase e Google
**Solução**: Garantir URLs idênticas em ambos os serviços

## 📱 Teste Completo

1. Acesse: `http://localhost:5173/login`
2. Clique em "Continuar com Google"
3. Autorize o aplicativo
4. Você deve ser redirecionado para `/app`

Se travar na tela "Processando autenticação...", verifique o console para:
- Logs do `AuthCallback`
- Logs do `onAuthStateChange`
- Mensagens de erro específicas

## 🔧 Arquivos Importantes para Verificar

```bash
# Verificar configuração do Supabase
grep -r "signInWithOAuth" src/

# Verificar auth state handler
grep -r "onAuthStateChange" src/

# Verificar redirect URLs
grep -r "auth/callback" src/
```

Está tudo configurado corretamente no código. Agora precisamos garantir que as URLs estejam configuradas nos dashboards do Supabase e Google Cloud.