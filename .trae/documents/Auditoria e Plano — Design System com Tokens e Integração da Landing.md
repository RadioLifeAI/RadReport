## Auditoria do que já temos
- Frontend (React + Vite + TS): editor funcional com Tiptap, macros, templates, histórico local e export DOCX/PDF.
  - Voz: Web Speech API (pt‑BR) com comandos (inserir macro, template, estilo, gerar conclusão) — src/components/VoiceButton.tsx:12‑18,24‑27.
  - Editor: barras básicas + geração de conclusão heurística — src/components/Editor.tsx:36‑43 e src/App.tsx:94‑111.
  - Exportações: DOCX/PDF — src/App.tsx:51‑67 e 81‑83.
  - Templates/macros iniciais — src/lib/templates.ts:10‑39.
- Landing estática pronta em `public/landing/` (HTML/CSS/JS) com hero, serviços, depoimentos, FAQ e footer.
- Estilo: duas bases de CSS com variáveis próprias (src/styles.css e public/landing/styles.css), sem design system unificado.
- Integrações atuais: nenhuma dependência externa além de Web Speech no browser e geração local de DOCX. Sem auth, sem API, sem roteamento entre app e landing.

## Lacunas e riscos
- Tokens de design inconsistentes entre app e landing (cores, espaçamento, raio, sombras).
- Alternância de tema definida no JS da landing, mas sem tema claro implementado.
- Landing não integrada à SPA (rota/link nativo). Sem medição de performance/acessibilidade automatizada.

## Proposta — Design System com Tokens
Criar um design system mínimo compartilhado entre app e landing.
- Arquivos novos:
  1) src/design/tokens.css — tokens de cor, tipografia, espaçamento, raio, sombras, transições; variações `.light`.
  2) src/design/tokens.ts — export de escala de spacing, radii, z‑index e helpers para TS.
- Refatorações (semânticas e seguras):
  - Importar tokens em src/styles.css e public/landing/styles.css e substituir variáveis locais por tokens globais.
  - Implementar `.light` com contraste AA e sincronizar o toggle de tema (documentElement.classList.toggle('light')).

### Conteúdo proposto (resumo)
- tokens.css
```
:root{--bg:#0b1220;--panel:#0f1628;--text:#e5e7eb;--muted:#9aa8bf;--accent:#06b6d4;--accent2:#4f46e5;--radius-sm:8px;--radius-md:14px;--radius-lg:22px;--shadow-1:0 6px 20px rgba(6,182,212,.25);--shadow-2:0 10px 30px rgba(0,0,0,.35);--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--fs-xxl:clamp(2.4rem,5vw+1rem,4.5rem);--fs-xl:clamp(1.6rem,2.2vw+1rem,2.2rem)}
:root.light{--bg:#f7fafc;--panel:#ffffff;--text:#0b1220;--muted:#475569;--accent:#036f8a;--accent2:#4338ca}
```
- tokens.ts
```
export const space=[4,8,12,16,24,32] as const
export const radii={sm:8,md:14,lg:22} as const
export const z={menu:1000,modal:1100}
```

## Integração da landing com o app
- Opção A (rápida): manter `public/landing/index.html` como rota estática (`/landing`) servida pelo Vite; adicionar link “Landing” no app ou redireciono inicial.
- Opção B (SPA): mover o conteúdo para um componente React e expor rota `/landing` com React Router; compartilhar tokens e tema automaticamente.

## Melhorias de acessibilidade/performance
- Reaplicar tokens e contrastes na landing e app; garantir foco visível unificado.
- Reduzir JS da landing (já leve); adicionar `prefers-reduced-motion` (já aplicado) e `aria-current` na navegação ativa.
- Lighthouse alvo ≥ 90 em Performance e A11y.

## Entregáveis
1) src/design/tokens.css e src/design/tokens.ts
2) Atualização de src/styles.css e public/landing/styles.css para consumir tokens.
3) Integração de tema claro (toggle funcional).
4) Link/rota para a landing a partir do app.

## Plano de execução
1) Adicionar tokens (css/ts) e importar nos dois estilos.
2) Substituir variáveis locais por tokens (busca e troca segura).
3) Implementar `.light` e sincronizar o toggle (landing e app).
4) Integração `/landing`: opção A (estática) ou B (SPA). Padrão: A.
5) Passar Lighthouse e ajustes finos.

Confirma que devo aplicar a Opção A (rota estática `/landing`) e criar os arquivos de tokens com as substituições sugeridas? Após sua confirmação, executo as mudanças e valido no preview.