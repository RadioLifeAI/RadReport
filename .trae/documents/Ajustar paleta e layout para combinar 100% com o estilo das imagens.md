## Objetivo
Aplicar uma paleta mais profunda e contrastada (dark navy + cyan/indigo) e reforçar o visual premium da landing/login para ficar alinhado com as imagens enviadas, mantendo textos e configuração atuais.

## Escopo
- Apenas aparência (tokens, CSS e classes). Sem alterar lógica, dados nem rotas.
- Reaproveitar Tailwind já configurado e tokens existentes.

## Mudanças Propostas
### 1) Paleta mais escura (tokens)
- Atualizar `src/design/tokens.css`:
  - `--bg: #050d18`, `--panel: #091423`, `--text: #e8eef6`, `--muted: #8da2b6`, `--border: #0e2237`
  - `--accent: #22d3ee` (cyan), `--accent2: #6366f1` (indigo)
  - Adicionar `--vignette: inset 0 0 120px rgba(0,0,0,.55)` e `--glow-cyan: 0 10px 30px rgba(34,211,238,.25)`

### 2) Hero “dark neon”
- Em `src/pages/LandingPage.tsx` e `src/styles.css`:
  - Fundo com 3 camadas: radial cyan/indigo + grade sutil + vinheta escurecendo as bordas
  - Horizonte/grade 3D com `repeating-linear-gradient` + `perspective` (efeito da referência)
  - CTA em pill escuro com leve glow (sem mudar o texto)

### 3) Serviços com gradientes curvos
- Substituir cards por blocos com gradiente diagonal (cyan→indigo), sombra suave e ícone `lucide-react` (somente decorativo), mantendo títulos e descrições atuais.

### 4) Planos (pricing)
- Cartões mais escuros, anel azul-ciano no plano central, preço grande, lista com ícones de check.
- Botão de ação com cyan sólido e `shadow-glow`.

### 5) FAQ e Assistente
- Accordion com separadores mais escuros e hover sutil.
- Caixa do assistente com borda translúcida e fundo preto/30.

### 6) Header e Footer
- Navbar translúcida mais escura com borda inferior suave.
- Botão “Entrar” com contorno cyan e hover controlado.

### 7) Tailwind e utilitários
- Usar classes existentes de Tailwind; sem novos plugins além dos já instalados.
- Ajustar classes para evitar `bg-*-*/opacity` sobre CSS vars onde necessário.

## Critérios de Aceite
- Fundo geral mais escuro (navy profundo) e contraste igual ao das imagens.
- Hero com grid/grade e vinheta visíveis.
- Cards de serviços em gradiente; pricing com destaque no card central.
- Sem alterações em comportamento; apenas visual.

## Verificação
- Abrir `/` e `/login` e confirmar a harmonização de cores e contraste.
- Ignorar o aviso de `/v1/auth/me` (backend); não impacta o visual.

Confirmando, aplico os ajustes e mostro o preview imediatamente.