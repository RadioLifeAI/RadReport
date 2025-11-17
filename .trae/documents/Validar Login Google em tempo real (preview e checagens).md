## Passos de Validação
- Abrir o preview em `/login`
- Você clica em “Continuar com Google” para gerar o `id_token`
- Eu monitoro o console/erros e verifico se o backend responde 200 e redireciona para `/app`
- Se aparecer erro, ajusto rapidamente (aud, CSRF, CSP, CORS)

## O que vou checar
- Botão visível (flag/env ok)
- Script GIS carregado
- Chamada `POST /v1/auth/google` e cookie `rr_refresh`
- `GET /v1/auth/me` com bearer após login

## Resultado esperado
- Login concluído sem erros bloqueantes
- Navegação para `/app`

Posso abrir o preview e acompanhar agora?