#!/bin/bash

# RadReport Deploy Script - Configuração para radreport.com.br
# Este script ajuda a configurar o projeto para produção

echo "🚀 RadReport Deploy Configuration Script"
echo "======================================"
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto RadReport"
    exit 1
fi

echo "📋 Configuração para radreport.com.br"
echo ""

# Função para solicitar informação com validação
ask_for_input() {
    local prompt=$1
    local default=$2
    local input
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        echo "${input:-$default}"
    else
        read -p "$prompt: " input
        echo "$input"
    fi
}

# Função para criar arquivo de ambiente
create_env_file() {
    local env_type=$1
    local filename=".env.$env_type"
    
    echo "📝 Criando arquivo $filename..."
    
    cat > "$filename" << EOF
# RadReport - Configuração $env_type (radreport.com.br)
# Gerado em $(date)

# ==============================================
# FRONTEND CONFIGURATION
# ==============================================

VITE_APP_URL=https://radreport.com.br
VITE_API_URL=https://api.radreport.com.br

# Supabase Configuration
VITE_SUPABASE_URL=$(ask_for_input "Supabase URL (produção)" "https://sua-url-supabase.supabase.co")
VITE_SUPABASE_ANON_KEY=$(ask_for_input "Supabase Anon Key (produção)")

# Google OAuth Configuration
VITE_GOOGLE_AUTH_ENABLED=true
VITE_GOOGLE_CLIENT_ID=$(ask_for_input "Google Client ID (produção)")

# Cloudflare Turnstile Configuration
VITE_TURNSTILE_SITE_KEY=$(ask_for_input "Turnstile Site Key (produção)")
VITE_TURNSTILE_SECRET_KEY=$(ask_for_input "Turnstile Secret Key (produção)")

# API Configuration
VITE_API_BASE=https://api.radreport.com.br/v1

# ==============================================
# BACKEND CONFIGURATION
# ==============================================

NODE_ENV=production
PORT=8787
ALLOWED_ORIGIN=https://radreport.com.br

# Google OAuth Server
GOOGLE_CLIENT_ID=$(grep "VITE_GOOGLE_CLIENT_ID" "$filename" | cut -d'=' -f2)
GOOGLE_CLIENT_SECRET=$(ask_for_input "Google Client Secret (produção)")

# Supabase Service Role
SUPABASE_SERVICE_ROLE_KEY=$(ask_for_input "Supabase Service Role Key (produção)")
SUPABASE_URL=$(grep "VITE_SUPABASE_URL" "$filename" | cut -d'=' -f2)

# Turnstile Server
TURNSTILE_SECRET_KEY=$(grep "VITE_TURNSTILE_SECRET_KEY" "$filename" | cut -d'=' -f2)
EOF

    echo "✅ Arquivo $filename criado com sucesso!"
    echo ""
}

# Menu principal
echo "Escolha uma opção:"
echo "1. Criar configuração de produção (.env.production)"
echo "2. Criar configuração de staging (.env.staging)"
echo "3. Verificar configuração atual"
echo "4. Mostrar checklist de deploy"
echo "5. Sair"
echo ""

choice=$(ask_for_input "Opção" "1")

case $choice in
    1)
        create_env_file "production"
        echo "📋 Próximos passos:"
        echo "1. Configure as variáveis no painel do seu serviço de hospedagem"
        echo "2. Configure DNS na Hostinger para radreport.com.br"
        echo "3. Configure Supabase Auth com as URLs de produção"
        echo "4. Configure Google Cloud Console com o domínio radreport.com.br"
        echo "5. Configure Cloudflare Turnstile com radreport.com.br"
        ;;
    2)
        create_env_file "staging"
        echo "📋 Configuração de staging criada!"
        ;;
    3)
        echo "🔍 Configuração atual:"
        echo ""
        echo "Arquivos de ambiente existentes:"
        ls -la .env* 2>/dev/null || echo "Nenhum arquivo .env encontrado"
        echo ""
        echo "Configuração do Vite:"
        grep -A 5 "server:" vite.config.ts 2>/dev/null || echo "vite.config.ts não encontrado"
        echo ""
        echo "Domínio configurado: radreport.com.br"
        ;;
    4)
        echo "📋 CHECKLIST DE DEPLOY PARA radreport.com.br"
        echo "======================================"
        echo ""
        echo "🔧 CONFIGURAÇÕES NECESSÁRIAS:"
        echo "□ 1. Obter chaves de produção do Supabase"
        echo "□ 2. Obter chaves de produção do Google Cloud"
        echo "□ 3. Criar widget no Cloudflare Turnstile"
        echo "□ 4. Configurar DNS na Hostinger"
        echo "□ 5. Testar todos os fluxos de autenticação"
        echo ""
        echo "📄 DOCUMENTAÇÃO CRIADA:"
        echo "✅ CLOUDFLARE_TURNSTILE_PRODUCTION_SETUP.md"
        echo "✅ .env.production.example"
        echo "✅ vercel.json (configuração de deploy)"
        echo ""
        echo "🚀 COMANDOS PARA DEPLOY:"
        echo "npm run build"
        echo "vercel --prod"
        ;;
    5)
        echo "👋 Até logo!"
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "🎉 Script concluído!"
echo "Consulte CLOUDFLARE_TURNSTILE_PRODUCTION_SETUP.md para instruções detalhadas."