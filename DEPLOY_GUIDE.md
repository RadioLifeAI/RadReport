# RadReport - Configuração de Deploy para Produção (radreport.com.br)

# Build de Produção
npm run build

# Deploy para Vercel com domínio personalizado
vercel --prod

# Configurar domínio após deploy
vercel domains add radreport.com.br
vercel domains add www.radreport.com.br

# Configurar redirecionamento de www para não-www (ou vice-versa)
vercel domains redirect www.radreport.com.br radreport.com.br

# Variáveis de ambiente para produção (configure no painel Vercel)
# VITE_APP_URL=https://radreport.com.br
# VITE_API_URL=https://api.radreport.com.br
# VITE_SUPABASE_URL=https://seu-supabase.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-chave
# VITE_GOOGLE_CLIENT_ID=sua-google-client-id
# VITE_TURNSTILE_SITE_KEY=sua-turnstile-site-key
# VITE_TURNSTILE_SECRET_KEY=sua-turnstile-secret-key
# VITE_API_BASE=https://api.radreport.com.br/v1

# Comandos úteis para verificação
# vercel domains inspect radreport.com.br
# vercel logs
# vercel env ls