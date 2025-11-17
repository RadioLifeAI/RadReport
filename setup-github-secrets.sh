#!/bin/bash

# Script para configurar secrets do GitHub Actions
# Uso: ./setup-github-secrets.sh

echo "🚀 Configurador de Secrets do GitHub Actions para RadReport"
echo "=================================================="
echo ""

# Verificar se o GitHub CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado."
    echo "Instale em: https://cli.github.com/"
    echo "Ou configure manualmente em: Settings > Secrets and variables > Actions"
    exit 1
fi

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo "❌ Você não está autenticado no GitHub CLI."
    echo "Execute: gh auth login"
    exit 1
fi

# Obter o repositório atual
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
if [ -z "$REPO" ]; then
    echo "❌ Não foi possível obter o repositório atual."
    echo "Certifique-se de estar em um repositório Git ou execute:"
    echo "gh repo set-default <usuario>/<repositorio>"
    exit 1
fi

echo "📁 Repositório: $REPO"
echo ""

# Função para adicionar secret
add_secret() {
    local name=$1
    local description=$2
    local value=""
    
    echo "🔑 Configurando: $name"
    echo "   Descrição: $description"
    echo -n "   Valor (deixe vazio para pular): "
    read -s value
    echo ""
    
    if [ -n "$value" ]; then
        echo -n "$value" | gh secret set "$name" -R "$REPO"
        echo "   ✅ Configurado com sucesso!"
    else
        echo "   ⏭️  Pulado"
    fi
    echo ""
}

echo "Por favor, insira os valores dos secrets quando solicitado."
echo "Deixe vazio para pular um secret."
echo ""
echo "ℹ️  Para obter os valores, consulte: GITHUB_SECRETS_CONFIG.md"
echo ""

# Secrets do Frontend
add_secret "VITE_SUPABASE_URL" "URL do projeto Supabase"
add_secret "VITE_SUPABASE_ANON_KEY" "Chave anônima do Supabase"
add_secret "VITE_GOOGLE_CLIENT_ID" "Client ID do Google OAuth"
add_secret "VITE_TURNSTILE_SITE_KEY" "Site key do Cloudflare Turnstile"

# Secrets do Backend
add_secret "SUPABASE_URL" "URL do Supabase (backend)"
add_secret "SUPABASE_SERVICE_ROLE_KEY" "Service role key do Supabase"
add_secret "TURNSTILE_SECRET_KEY" "Secret key do Cloudflare Turnstile"
add_secret "GOOGLE_CLIENT_ID" "Client ID do Google OAuth (backend)"
add_secret "GOOGLE_CLIENT_SECRET" "Client secret do Google OAuth"
add_secret "JWT_SECRET" "Secret para JWT tokens"

# Secrets do Vercel
add_secret "VERCEL_TOKEN" "Token do Vercel para deploy"
add_secret "VERCEL_ORG_ID" "ID da organização no Vercel"
add_secret "VERCEL_PROJECT_ID" "ID do projeto frontend no Vercel"
add_secret "VERCEL_API_PROJECT_ID" "ID do projeto API no Vercel"

echo "🎉 Configuração concluída!"
echo ""
echo "Para verificar os secrets configurados:"
echo "gh secret list -R $REPO"
echo ""
echo "Para testar o workflow manualmente:"
echo "gh workflow run deploy.yml -R $REPO"