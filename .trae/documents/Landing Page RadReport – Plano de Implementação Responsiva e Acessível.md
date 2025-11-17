## Objetivo
Entregar uma landing page moderna, responsiva e acessível, com visual escuro e destaques em ciano, replicando a estética das imagens de referência (hero com grid futurista, cards com gradiente e sombra, tabela de planos, FAQs e CTA), usando apenas HTML5, CSS3 moderno e JS leve.

## Estrutura de Páginas/Seções
1) Header (sticky)
- Logo em SVG à esquerda
- Navegação com dropdown “Visão geral” + links “Tutoriais”, “Chat IA”, “Contato”
- Ações à direita: alternância de tema (ícone) e botão “Entrar”
- Acessível: `<header>`, `<nav>`, skip-link, ARIA para dropdown e botão móvel

2) Hero
- Título grande multi-linha, subtítulo, botão CTA “Experimente gratuitamente”
- Fundo: gradiente escuro + grid 3D (CSS + pseudo-elemento) + partículas leves (opcional, reduzido por `prefers-reduced-motion`)

3) Recursos / Serviços
- Grade 3×2 de cards com gradientes (rosado/azul), ícone (SVG), título e descrição
- Interações: hover eleva, brilho sutil no contorno, foco visível

4) Depoimentos ou Cases
- Carrossel simples ou grid responsivo com 3 depoimentos (foto opcional, nome, cargo, citação com `<blockquote><cite>`)
- Controles com botões anteriores/próximos e `aria-live="polite"`

5) Planos (se aplicável ao visual de referência)
- 3 cards (Básico/Pro/Premium) com preço, lista de benefícios, CTA
- Toggle anual/mensal (switch acessível)

6) FAQ
- Acordeão de perguntas; semântico com `<details><summary>`

7) Footer
- Logo reduzida, links úteis (Privacidade, Termos, Contato), redes sociais e telefone
- Copyright e créditos; cor de fundo escuro

## Arquitetura de Código
- `index.html`: markup semântico com landmarks e ordem de headings
- `styles.css`: tokens e utilitários
  - Cores: `--bg:#0b1220`, `--panel:#0f1628`, `--text:#e5e7eb`, `--muted:#94a3b8`, `--accent:#06b6d4`, gradientes dos cards
  - Tipografia: clamp para h1/h2/p; `font-feature-settings` e `font-synthesis` desativado
  - Layout: container central com `max-inline-size`, grid responsivo com `auto-fit,minmax`
  - Acessibilidade: foco visível, contraste AA/AAA, `prefers-reduced-motion`
- `app.js`: interações leves
  - Menu móvel (hambúrguer), dropdown do header, acordeão (se não usar `<details>`), carrossel básico (IntersectionObserver)

## Fidelidade Visual
- Hero: heading tamanho `clamp(2.5rem, 5vw + 1rem, 4.5rem)`; subtítulo com largura medida (60ch)
- Grid de fundo: `radial-gradient` + linhas com `conic-gradient`/`linear-gradient` repetido; bordas arredondadas e sombras suaves nas cards
- Botão CTA: pílula com gradiente leve, sombra interna, hover com glow

## Responsividade
- Mobile-first; breakpoints em 480/768/1024/1440
- Navegação colapsa para menu lateral
- Cards passam de 1→2→3 colunas
- Imagens responsivas `srcset/sizes` (se usadas); uso preferencial de SVGs inline

## Acessibilidade (WCAG)
- Contraste mínimo AA em textos e botões
- Foco visível, `:focus-visible`
- `aria-expanded`, `aria-controls` em dropdown/toggles
- `role="navigation"` e landmarks corretos
- `prefers-reduced-motion` desativa partículas e transições pesadas
- Navegação por teclado completa

## Performance
- Sem libs; JS < 8 KB
- Imagens otimizadas e lazy (se houver)
- Preload do logo SVG inline
- CSS único minificado pelo pipeline existente

## Entregáveis
- `public/landing/index.html`
- `public/landing/styles.css`
- `public/landing/app.js`
- SVGs de ícones (inline) e assets de fundo (CSS puro quando possível)

## Critérios de Aceite
- Pixel-approx da referência (hero, cards de serviços, pricing, FAQ, CTA)
- CLS ~0, carregamento rápido; Lighthouse Performance/Accessibility ≥ 90
- Navegação e componentes operáveis via teclado; foco claro
- Layout fluido em 360–1440px

## Próximos Passos (execução)
1) Montar HTML semântico completo das seções
2) Aplicar tema, tipografia e grid; implementar hero com fundo em CSS
3) Implementar cards/gradientes e microinterações
4) Depoimentos + controles acessíveis
5) FAQ (`<details>`) e Footer
6) JS leve para dropdown/menu/carrossel e testes de acessibilidade
7) Ajustes finos de responsividade e otimizações (Lighthouse)

Confirma a implementação conforme esse plano? Após aprovação, entrego os 3 arquivos prontos e conecto a rota `/landing` no projeto atual sem afetar o editor.