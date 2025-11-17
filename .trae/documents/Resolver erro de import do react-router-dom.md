## Diagnóstico
- O erro ocorre porque `react-router-dom` não está instalado no projeto. O Vite não consegue resolver o módulo importado em `src/routes.tsx` e também em `Header.tsx` e `LandingPage.tsx`.
- O código usa a API `createBrowserRouter`/`RouterProvider` (React Router v6.4+), compatível com React 18 já presente.

## Ações Propostas
1. Instalar a dependência correta do roteador
   - Com npm:
     - `npm i react-router-dom@^6`
   - Observação: os tipos já vêm embutidos no pacote v6; não é necessário `@types/react-router-dom`.
2. Reiniciar o servidor de desenvolvimento
   - Parar o processo atual e iniciar novamente: `npm run dev`.
3. Verificação rápida do código
   - Confirmar que `src/routes.tsx` usa `createBrowserRouter`/`RouterProvider` (ok).
   - Confirmar que só há imports de `react-router-dom` em `src/routes.tsx`, `src/components/Header.tsx` e `src/pages/LandingPage.tsx` (ok).
4. Testes manuais
   - Acessar `/` (Landing) → clicar em “Entrar” → `/login` → após login, navegar para `/app`.

## Critérios de Aceite
- Overlay do Vite desaparece e não há mais “Failed to resolve import \"react-router-dom\"”.
- App carrega a Landing normalmente, e as navegações com `<Link>` funcionam.
- Nenhum erro adicional de tipagem/compilação relacionado ao roteador.

Confirma que posso executar a instalação e reiniciar o dev server agora?