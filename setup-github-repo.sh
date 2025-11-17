#!/bin/bash

# Script para criar repositório no GitHub e fazer push do RadReport

echo "🚀 Criando repositório RadReport no GitHub..."
echo "=================================================="

# Verificar se estamos em um repositório git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Não estamos em um repositório Git"
    exit 1
fi

# Obter informações do projeto
PROJECT_NAME="radreport"
DESCRIPTION="Sistema inteligente de laudos radiológicos com IA - React, TypeScript, Supabase, OpenAI"

# Verificar se já tem remote
if git remote get-url origin > /dev/null 2>&1; then
    echo "📡 Já existe um remote configurado:"
    git remote get-url origin
    echo ""
    echo "Deseja sobrescrever? (s/n)"
    read -r resposta
    if [[ "$resposta" != "s" ]]; then
        echo "Operação cancelada."
        exit 0
    fi
fi

echo ""
echo "📋 Instruções para criar o repositório no GitHub:"
echo "=================================================="
echo ""
echo "1. Acesse: https://github.com/new"
echo "2. Nome do repositório: radreport"
echo "3. Descrição: $DESCRIPTION"
echo "4. Escolha: Public ou Private"
echo "5. Não inicialize com README (já temos um)"
echo "6. Clique em 'Create repository'"
echo ""
echo "Após criar, copie a URL do repositório. Exemplo:"
echo "   https://github.com/seu-usuario/radreport.git"
echo ""
echo -n "📎 Cole a URL do repositório aqui: "
read -r REPO_URL

# Adicionar remote
echo ""
echo "🔗 Configurando remote..."
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

# Fazer push
echo ""
echo "📤 Fazendo push para o GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push realizado com sucesso!"
    echo ""
    echo "🌐 URLs importantes:"
    echo "   Repositório: $REPO_URL"
    echo "   GitHub Actions: ${REPO_URL}/actions"
    echo "   Settings: ${REPO_URL}/settings"
    echo ""
    echo "🎯 Próximos passos:"
    echo "   1. Configure os secrets em: ${REPO_URL}/settings/secrets/actions"
    echo "   2. Execute: ./setup-github-secrets.sh"
    echo "   3. Monitore o deploy em: ${REPO_URL}/actions"
    echo ""
    echo "🎉 RadReport está no GitHub e pronto para deploy!"
else
    echo ""
    echo "❌ Erro ao fazer push. Verifique:"
    echo "   - Se você tem permissão no repositório"
    echo "   - Se a URL está correta"
    echo "   - Suas credenciais do GitHub"
fi