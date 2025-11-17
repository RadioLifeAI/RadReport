## Objetivo
As linhas que dividem seções (borders, dividers) devem acompanhar o tema Light/Dark e manter contraste adequado, como os textos.

## Abordagem
- Introduzir um token `--divider` (cores distintas em dark e light) e substituir `border-white/10`/`divide-white/10` por usos baseados em `--divider`.
- Atualizar Header/Footer, Landing, Login para usar `border-[color:var(--divider)]` e `divide-[color:var(--divider)]`.

## Arquivos
- src/design/tokens.css: adicionar `--divider` para dark/light.
- src/components/Header.tsx / Footer.tsx: trocar bordas para `var(--divider)`.
- src/pages/LandingPage.tsx: substituir bordas/divisores e inputs/botões que dependem de `border-white/10`.
- src/pages/Login.tsx: bordas de inputs/cartão e divisores.

## Critérios de Aceite
- Em Light, linhas visíveis em todas as seções e componentes, com contraste adequado.
- Em Dark, linhas sutis porém perceptíveis (sem sumir).
- Sem mudanças de lógica, apenas estilo.

Vou aplicar agora e mostrar o preview.