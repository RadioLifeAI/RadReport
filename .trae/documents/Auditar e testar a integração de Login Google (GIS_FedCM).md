## Escopo
Auditar envs e código, e executar testes end‑to‑end locais (sem alterar lógica) para validar: leitura dos envs, exibição do botão, obtenção de `id_token`, verificação no backend e navegação para `/app`.

## Auditoria de Ambiente
1. Front (.env.local)
- Verificar `VITE_GOOGLE_CLIENT_ID` não vazio e formato `...apps.googleusercontent.com`.
- `VITE_GOOGLE_AUTH_ENABLED=true` após preenchimento.
- `VITE_API_BASE=/v1` em dev.
2. Server (server/.env)
- `GOOGLE_CLIENT_ID` igual ao front.
- `ALLOWED_ORIGIN=http://localhost:5173`.
- `NODE_ENV=development` e `PORT=8787`.
- `GOOGLE_CLIENT_SECRET` vazio (aceitável no fluxo GIS/id_token).

## Auditoria de Código
- Front: `Login.tsx` carrega `gsi/client`, inicializa `google.accounts.id` e envia `id_token` via `DataService.loginWithGoogleIdToken`.
- DataService: inclui CSRF, armazena `accessToken`, oculta botão se não houver client id.
- Backend: `POST /v1/auth/google` valida `aud/iss/email_verified`, emite tokens e cookie seguro; rate‑limit ativo.
- CSP/CORS: script e endpoints do Google permitidos; origem do front liberada.

## Testes de Funcionamento (dev)
1) Reiniciar front e backend.
2) Abrir `/login` e confirmar:
- Botão “Continuar com Google” visível.
- Script GIS carregado sem erros.
3) Clicar no botão e validar:
- Prompt do Google aparece.
- Após aceitar, request `POST /v1/auth/google` retorna 200 com `accessToken`.
- Cookie `rr_refresh` setado; redireciona para `/app`.
4) Chamar `/v1/auth/me` com bearer e confirmar `userId`.

## Testes Negativos
- Aud inválida: alterar temporariamente `VITE_GOOGLE_CLIENT_ID` e validar 401 `AUD_MISMATCH`.
- CSRF ausente: simular falta de header e esperar 403.

## Critérios de Aceite
- Botão visível com envs presentes; login completo leva ao `/app`.
- Cookies e tokens corretos; nenhum erro bloqueante no console.

Se aprovar, executo a auditoria com leitura de arquivos, reinício dos servidores, navegação e validações de rede com preview local.