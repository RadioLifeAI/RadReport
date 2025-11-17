## Objetivo
Corrigir as últimas inconsistências do tema Light/Dark para que:
- As linhas/grade do hero mudem de cor e opacidade no Light, permanecendo visíveis e elegantes.
- Todos os textos (incluindo Footer, links e subtítulos) tenham contraste correto em ambos os temas.
- Remover quaisquer misturas de cores fixas que quebrem ao alternar o tema.

## Ações
1) Hero grid responsiva ao tema
- Adicionar um seletor `html.light .hero-horizon::before` com `--grid-line` claro e opacidade reduzida (ex.: 0.08–0.12) e gradiente topo mais suave (ex.: `rgba(34,211,238,.12)`).
- Manter a versão Dark atual (linhas navy `--grid-line` escuro + opacidade .55).

2) Padronizar textos e links
- Substituir quaisquer ocorrências de `text-foreground/90`, `text-white`, `text-black` por `text-foreground` e `text-muted` onde apropriado nas páginas Landing e Login.
- Assegurar que small/legendas e itens de lista usem `text-muted`.

3) Header/Footer temáticos
- Garantir cores de fundo com `var(--panel)`/`var(--bg)` translúcidos (sem hex fixo) e links com `text-muted`/hover `text-foreground`.

4) Botões e anéis
- No Light, reduzir saturação do `ring` ciano dos cards de preço (ex.: `ring-cyan-600/30`) e no Dark manter `ring-cyan-400/40`.
- CTA principal: manter pill preto translúcido no Dark e ajustar para cinza-escuro translúcido no Light para contraste.

5) Melhorias de acessibilidade
- Ajustar `::selection` para usar ciano translúcido no Dark e azul-claro no Light.
- Confirmar contraste AA para textos de 14px+.

## Verificação
- Alternar o tema pelo botão no header e verificar contraste no hero (linhas/grade), cartões de serviços, preços, FAQ, Footer e Login.

Confirma que posso aplicar essas alterações agora?