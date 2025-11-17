## Objetivo
Garantir que, ao alternar entre Light/Dark, todos os textos e superfícies se ajustem corretamente, com contraste perfeito. Resolver casos onde, no Light, textos ficam escuros sobre fundo escuro (ex.: landing e footer).

## Problema-raiz
- A landing usa cores fixas (hex) no fundo do hero (`#0b1220`, `#0f1628`), então quando o tema muda para Light os textos ficam escuros (`--text` claro → escuro) sobre um fundo que continua escuro.
- Alguns fundos (header/footer) usam cores estáticas, não derivadas dos tokens.

## Ações Propostas
1) Tokens temáticos
- Adicionar `--grid-line` aos tokens e ajustar `:root.light` para um tom sutil no Light.

2) Fundo da Landing orientado a tokens
- Alterar `.rr-landing` para usar `var(--bg)` e `var(--panel)` no gradiente, no lugar dos hex fixos.
- Ajustar as camadas do hero (vinheta/grade) para referenciar tokens (ex.: `--grid-line`) e reduzir a opacidade da grade no Light.

3) Header/Footer temáticos
- Trocar fundos estáticos para `var(--panel)`/`var(--bg)` com transparência sutil.
- Garantir que os textos usem `text-foreground`/`text-muted` (ou classes `rr-*` baseadas em tokens) e não cores fixas.

4) CTA e botões
- Garantir que os CTAs usem cores de token (ciano/indigo) e tenham estados hover/active visíveis em ambos os temas.

5) Revisão de textos
- Passar por Landing, Header, Footer e Login substituindo qualquer `text-*` literal não temático por `text-foreground`/`text-muted`.

## Critérios de Aceite
- Em Light, o hero fica claro (bg claro), textos escuros e legíveis; em Dark, hero escuro, textos claros.
- Footer e Header permanecem legíveis em ambos os temas.
- Nenhuma regressão de layout.

## Verificação
- Rodar a aplicação, alternar o tema no botão do header e validar contraste das seções (Hero, Serviços, Planos, FAQ, Footer) e Login.

Confirmando, aplico as mudanças e mostro o preview com o contraste corrigido.