## Objetivo
Replicar o Hero Section moderno (fundos animados) na página de Login, mantendo o formulário central, contraste AA e compatibilidade Light/Dark.

## Abordagem
- Reaproveitar os componentes já criados (AnimatedGradient, AnimatedBlobsLayer, ParticlesLayer, HeroImageBackground).
- Não criar novos arquivos: integrar os fundos diretamente em `src/pages/Login.tsx` como camadas absolutas atrás do card.
- Fornecer uma variável simples para alternar o tipo de background (gradient | image | blobs | particles) e `imageSrc` opcional.

## Mudanças Propostas em `src/pages/Login.tsx`
1) Estrutura
- Envolver toda a página em um container `relative min-h-screen`.
- Inserir, antes do formulário, o fundo de acordo com a variante escolhida, e a grade `hero-horizon` + vinheta.
- Manter o formulário como conteúdo em `z-10` com fundo translúcido baseado em `var(--panel)`.

2) Variante de fundo
- Adicionar uma constante no componente: `const variant: 'gradient'|'image'|'blobs'|'particles' = 'blobs'`.
- Renderizar condicionalmente: `<AnimatedGradient/>`, `<HeroImageBackground src="/sua-imagem.jpg"/>`, `<AnimatedBlobsLayer/>` ou `<ParticlesLayer/>`.

3) Acessibilidade e contraste
- Garantir texto/inputs com `text-foreground`/`text-muted` e bordas `var(--divider)`.
- Responsividade intacta e Light/Dark já respeitados pelos tokens.

## Critérios de Aceite
- Login ocupa 100vh, com fundo animado e formulário legível ao centro.
- Alternar tema mantém contraste correto.
- Troca de variante rápida via constante.

Posso aplicar esses ajustes agora e mostrar o preview?