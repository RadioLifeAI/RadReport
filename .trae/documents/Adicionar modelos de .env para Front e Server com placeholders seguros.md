## Objetivo
Criar arquivos de exemplo de variáveis de ambiente, prontos para você colar o Client ID e o Secret do Google, sem expor segredos.

## Arquivos a criar
- `.env.local` (frontend/Vite): com placeholders e flag desativada até preencher
- `server/.env` (backend/Express): com placeholders e origem de dev

## Conteúdo planejado
### .env.local
- `VITE_GOOGLE_AUTH_ENABLED=false` (ativa depois de preencher)
- `VITE_GOOGLE_CLIENT_ID=` (cole seu Client ID)
- `VITE_API_BASE=/v1`

### server/.env
- `NODE_ENV=development`
- `PORT=8787`
- `ALLOWED_ORIGIN=http://localhost:5173`
- `GOOGLE_CLIENT_ID=` (cole seu Client ID)
- `GOOGLE_CLIENT_SECRET=` (preencha somente se usar OAuth “code flow”)

## Racional
- Flag `VITE_GOOGLE_AUTH_ENABLED=false` evita exibir o botão com Client ID vazio
- Placeholders permitem colar valores sem tocar em código

## Após preencher
- Mudar `VITE_GOOGLE_AUTH_ENABLED=true` no `.env.local`
- Reiniciar o dev server do front e do backend

Confirma que posso criar esses dois arquivos agora?