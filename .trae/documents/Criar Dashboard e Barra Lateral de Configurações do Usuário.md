## Objetivo
Criar uma barra lateral de configurações da conta, aberta/fechada ao clicar no avatar/perfil do header do editor (dashboard). Sem alterar rotas: overlay lateral dentro do editor, com abas e conteúdos padrão (Conta, Geral, Clínica, Editor, Planos, Histórico, Ajuda, Ir para Editor, Sair).

## Arquitetura de Frontend
- Toggle no header do editor:
  - Ícone/avatar (canto superior esquerdo) aciona abrir/fechar a barra.
  - Atalhos: `Ctrl+,` para abrir; `Esc` para fechar; foco inicial no título da aba.
- Componentes:
  - `SettingsSidebar.tsx`: lista de abas com ícones (lucide-react), avatar/identidade, separadores (`--divider`).
  - `SettingsPanel.tsx`: renderiza conteúdo da aba; cabeçalho com título, descrição, ações “Salvar/Reverter”.
  - `useSettingsDrawer.ts`: hook para estado global (aberto/fechado, aba ativa), persistido em `localStorage`.
- Integração no editor:
  - Injetar `<SettingsSidebar/>` e `<SettingsPanel/>` dentro do layout do editor (overlay à esquerda 240px, conteúdo à direita responsivo).
  - “Ir para Editor” apenas fecha o painel; “Sair” chama logout.

## Conteúdos das Abas
- Conta:
  - Nome, e-mail (read-only se Google), avatar (upload — placeholder), preferências de mensagens (switches), botão “Gerenciar assinatura”.
- Geral:
  - Tema (dark/light), idioma (pt/en), notificações, modo privacidade, teclas de atalho (preview).
- Clínica:
  - Nome/logotipo da clínica (placeholder), endereço/contatos, cabeçalho/rodapé e prefixos de laudo.
- Editor:
  - Modalidade padrão, sugestões IA (on/off/nível), parâmetros de voz (nome/velocidade), estilo do editor.
- Planos:
  - Estado atual (placeholder), ações upgrade/downgrade (link externo), próximos passos de billing.
- Histórico:
  - Lista simples de uso (placeholder); filtros por período e modalidade (fase 2 pode ler `/v1/usage`).
- Ajuda:
  - Links de suporte/documentação; atalho para tutoriais.
- Ir para Editor:
  - Fecha o painel e retorna ao editor.
- Sair:
  - Logout seguro e redireciona para `/login`.

## Integrações (Frontend)
- DataService:
  - `getPrefs()` → GET `/v1/prefs`.
  - `savePrefs(prefs)` → PUT `/v1/prefs`.
  - `logout()` → POST `/v1/auth/logout` (CSRF); limpar token, navegar para `/login`.
  - `getMe()` → GET `/v1/auth/me` para nome/e-mail exibidos na barra.
- AuthProvider:
  - Fornecer `userId/email` ao cabeçalho; bloquear abertura se não autenticado.

## Backend (reuso)
- `/v1/prefs` GET/PUT já disponível.
- `/v1/auth/logout` com CSRF já disponível.
- `/v1/usage` (POST existente); leitura GET pode ficar para fase 2.

## Design e UX
- Sidebar fixa (240px) com `bg-[color:var(--panel)]/90`, `border-[color:var(--divider)]`, ícones Lucide (`User`, `Cog`, `Building`, `PenTool`, `CreditCard`, `History`, `HelpCircle`, `LayoutDashboard`, `LogOut`).
- Cabeçalhos com hero overlay discreto; feedback via Toast; estados de loading e erro.
- Acessibilidade: foco gerenciado, roles (`nav`, `region`), labels e `aria-controls`.

## Segurança
- CSRF em `logout` e salvamentos que setem cookie.
- Sanitização e limites de tamanho em campos livres; nenhuma PII sensível exibida.
- Não logar tokens; TTL curto para `accessToken` (já aplicado).

## Entregáveis
1. Hook `useSettingsDrawer.ts` e estado global.
2. `SettingsSidebar.tsx` e `SettingsPanel.tsx` com abas e ícones.
3. Seções de conteúdo com formulários e “Salvar/Reverter” (Conta/Geral/Clínica/Editor/Planos/Histórico/Ajuda).
4. Botão de perfil no header do editor para abrir/fechar.
5. DataService: `getPrefs`, `savePrefs`, `logout`, `getMe`.

## Testes
- Abrir/fechar pelo avatar e atalhos; navegação entre abas.
- Salvar prefs (tema/voz/idioma) e confirmar retorno 200 com atualização visual.
- Logout: cookie removido, volta a `/login`; tentar abrir barra sem auth bloqueia.

## Critérios de Aceite
- Barra lateral acessível somente via perfil; visual consistente e responsivo.
- Prefs carregam/salvam corretamente; editor reflete mudanças (tema/voz/estilo).
- Sem erros bloqueantes; UX suave.

Posso iniciar a implementação conforme esse plano?