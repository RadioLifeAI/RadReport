## Objetivo
Deixar o Footer elegante, moderno e animado, alinhado ao Hero: fundo animado leve, vinheta/grade coerentes, links claros e ícones sociais. Manter contraste AA no Light/Dark.

## Abordagem
- Reutilizar as camadas existentes: AnimatedGradient e ParticlesLayer como plano de fundo do Footer, com opacidade discreta.
- Adicionar uma barra superior animada (linha gradient animada) e sutil glow no topo.
- Enriquecer o conteúdo: colunas de links e redes sociais com `lucide-react`.
- Usar `--divider`, `--bg`, `--panel`, `--text` para tema.

## Mudanças
1) `src/components/Footer.tsx`
- Tornar `footer` `relative` e `overflow-hidden`.
- Incluir `<AnimatedGradient />` e `<ParticlesLayer count={80} />` como camadas de fundo.
- Adicionar barra superior animada e seção com 3 colunas (produto, recursos, contato) e redes sociais.

2) `src/styles.css`
- Adicionar classes utilitárias do footer: `.footer-bar` e `.footer-top-glow` reutilizando `@keyframes rrGradient` já existente e tokens.

## Critérios de Aceite
- Footer visualmente moderno, com animação suave e sem prejudicar legibilidade.
- Funciona em Light/Dark e é responsivo.

Se estiver de acordo, aplico as alterações e mostro o preview.