## Objetivo
Deixar o projeto totalmente preparado para usar Login com Google quando você tiver o domínio e o Client ID, mantendo o funcionamento local agora.

## Alterações Planejadas (sem segredos no repositório)
- Frontend: ler `VITE_GOOGLE_CLIENT_ID` e habilitar/ocultar o botão do Google automaticamente.
- Fallback dev: aceitar `localStorage('rr.google.cid')` para testar sem `.env` (ex.: `localStorage.setItem('rr.google.cid','YOUR_CLIENT_ID.apps.googleusercontent.com')`).
- Backend: continuar validando `id_token` com `GOOGLE_CLIENT_ID`; retornar erro de configuração se faltar.
- Feature flag (frontend): `VITE_GOOGLE_AUTH_ENABLED=true|false` para esconder o botão quando não houver Client ID.
- Segurança: CSP/CORS/CSRF/cookies já ajustados; manter sem segredos commitados.

## Variáveis de Ambiente
- Front (Vite):
  - `VITE_GOOGLE_CLIENT_ID` (opcional em dev; pode usar `localStorage`)
  - `VITE_GOOGLE_AUTH_ENABLED` (default `true`)
- Back:
  - `GOOGLE_CLIENT_ID`
  - `ALLOWED_ORIGIN` (em dev: `http://localhost:5173`)

## Fluxo Local Agora (sem domínio)
- Para testar o botão:
  1) `localStorage.setItem('rr.google.cid','YOUR_CLIENT_ID.apps.googleusercontent.com')`
  2) Abrir `/login` e clicar “Continuar com Google”
  3) Back valida `id_token` e redireciona `/app`
- Sem Client ID, o botão fica oculto ao usuário.

## Quando tiver o Domínio
- Crie o OAuth Client do tipo “Aplicativo da Web”.
- Authorized JavaScript origins:
  - Dev: `http://localhost:5173`, `http://127.0.0.1:5173`
  - Prod: `https://seu-dominio` (e variantes necessárias)
- Redirect URIs: não são necessários para GIS/id_token; apenas se usar “code flow”.
- Defina:
  - Front: `VITE_GOOGLE_CLIENT_ID=...`
  - Back: `GOOGLE_CLIENT_ID=...`
  - CORS: `ALLOWED_ORIGIN=https://seu-dominio`

## Critérios de Aceite
- Com Client ID ausente, UI oculta o Google login sem erros.
- Com Client ID (via localStorage ou env), fluxo GIS funciona e termina em `/app`.
- Nenhum segredo commitado; apenas variáveis em runtime.

Posso aplicar os ajustes (feature flag, leitura de env/localStorage e ocultação automática do botão) agora?