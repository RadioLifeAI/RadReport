# 🏥 RadReport - Sistema Inteligente de Laudos Radiológicos

![RadReport Banner](https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20medical%20software%20banner%20with%20radiology%20theme%2C%20blue%20and%20white%20colors%2C%20stethoscope%20and%20x-ray%20images%2C%20professional%20medical%20interface%2C%20clean%20design&image_size=landscape_16_9)

## 🎯 Sobre

O **RadReport** é um sistema completo e inteligente para criação de laudos radiológicos, desenvolvido com tecnologias modernas e integração de IA para auxiliar radiologistas no dia a dia.

## ✨ Funcionalidades Principais

### 🔐 **Autenticação Enterprise**
- ✅ Login com Google OAuth (One-Tap e FedCM)
- ✅ Autenticação tradicional com email/senha
- ✅ Segurança com JWT, CSRF protection e rate limiting
- ✅ Integração completa com Supabase Auth

### 📝 **Editor de Laudos Profissional**
- ✅ Editor rico com formatação completa
- ✅ Templates por modalidade (TC, RM, US, RX, Mamografia)
- ✅ Macros rápidas e atalhos de teclado
- ✅ Exportação em PDF e DOCX
- ✅ Versionamento automático de laudos

### 🤖 **Assistente de IA Avançado**
- ✅ Sugestões contextuais baseadas em conteúdo
- ✅ Completude automática de textos médicos
- ✅ Busca semântica em findings radiológicos
- ✅ Reconhecimento de voz (STT) e síntese (TTS)
- ✅ Geração de diferenciais diagnósticos

### 🔄 **Sistema Híbrido Offline-First**
- ✅ Banco local PostgreSQL com sincronização
- ✅ Funcionamento offline com sync automático
- ✅ Resolução inteligente de conflitos
- ✅ Cache Redis para performance otimizada

### 🛡️ **Segurança e Compliance**
- ✅ Cloudflare Turnstile (CAPTCHA inteligente)
- ✅ Rate limiting por IP e usuário
- ✅ Proteção contra SQL injection e XSS
- ✅ Audit trail completo de ações
- ✅ Conformidade com LGPD/GDPR

## 🚀 Tecnologias Utilizadas

### **Frontend**
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Estilização)
- TipTap (Editor de texto)
- Framer Motion (Animações)
- Zustand (State management)

### **Backend**
- Node.js + Express + TypeScript
- Supabase (Banco de dados PostgreSQL)
- Redis (Cache e sessões)
- JWT (Autenticação)
- OpenAI API (IA)

### **Infraestrutura**
- Vercel (Hospedagem frontend e API)
- GitHub Actions (CI/CD)
- Cloudflare Turnstile (Segurança)
- Google Cloud (OAuth)

## 📋 Requisitos

- Node.js 20.x ou superior
- npm ou pnpm
- Conta no Supabase
- Conta no Google Cloud (para OAuth)
- Conta no Cloudflare (para Turnstile)

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/radreport.git
cd radreport
```

### 2. Instale as dependências
```bash
npm install
cd api && npm install && cd ..
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure suas chaves no arquivo .env
```

### 4. Configure o banco de dados
- Crie um projeto no Supabase
- Execute as migrations em `supabase/migrations/`
- Configure as políticas de RLS

### 5. Configure os serviços externos
- **Google OAuth**: Configure no Google Cloud Console
- **Cloudflare Turnstile**: Crie um widget no dashboard
- **Supabase**: Configure URLs de redirect

### 6. Execute o projeto
```bash
# Frontend (terminal 1)
npm run dev

# Backend API (terminal 2)
cd api && npm run dev
```

## 🎯 Deploy em Produção

O projeto está configurado para deploy automático via GitHub Actions:

1. Configure os secrets no GitHub
2. Faça push para a branch `main`
3. O deploy será realizado automaticamente na Vercel

**Domínio oficial**: `https://radreport.com.br`

## 🔐 Configuração de Secrets

Configure os seguintes secrets no GitHub:

### Frontend
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_TURNSTILE_SITE_KEY`

### Backend
- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SECRET_KEY`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`

### Vercel
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Use o script `./setup-github-secrets.sh` para facilitar a configuração.

## 📚 Documentação

- [Guia Completo de Deploy](DEPLOY_COMPLETE_GUIDE.md)
- [Configuração de Secrets](GITHUB_SECRETS_CONFIG.md)
- [OpenAPI Specification](server/openapi.yaml)

## 🧪 Testes

```bash
# Testes de carga
npm run test:k6

# Testes de API
curl -X GET http://localhost:8787/api/health
```

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Acessibilidade, SEO)
- **Core Web Vitals**: Excelente em todas métricas
- **Time to Interactive**: < 2 segundos
- **First Contentful Paint**: < 1 segundo

## 🔒 Segurança

- Autenticação de dois fatores (2FA) disponível
- Criptografia de dados em repouso e em trânsito
- Conformidade com LGPD (Lei Geral de Proteção de Dados)
- Auditoria completa de acessos

## 🎨 Design System

- Design tokens para consistência visual
- Dark/Light mode automático
- Responsividade total (mobile, tablet, desktop)
- Acessibilidade WCAG 2.1 nível AA

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Crie uma issue no GitHub
- Consulte a documentação
- Verifique os logs de erro

---

**🏥 RadReport - Tecnologia ao serviço da medicina radiológica**

Desenvolvido com ❤️ para radiologistas e profissionais de saúde.