# LivroCMEI — Sistema de Gerenciamento de Acervo de Biblioteca Escolar
> **CEMEI Professora Maria de Lourdes Demasceno Marques — Município de Piquet Carneiro**

Aplicação desktop 100% offline desenvolvida para digitalizar e facilitar o controle de acervo e empréstimos de livros da biblioteca escolar, substituindo o registro manual em cadernos físicos por uma interface instalável, rápida e acessível.

---

## Funcionalidades

* **Gerenciar Empréstimos**: registro de empréstimos com múltiplos livros, consulta por abas (Pendentes, Concluídos e Cancelados), visualização de detalhes, devolução parcial ou total de exemplares e cancelamento com regras de integridade.
* **Gerenciar Livros**: cadastro, edição, controle de total de exemplares e saldo disponível, exclusão (quando sem histórico) e ativação/desativação.
* **Gerenciar Professores**: cadastro, edição, validação de e-mail único, exclusão (quando sem histórico) e ativação/desativação.
* **Gerenciar Turmas**: cadastro, edição, exclusão (quando sem histórico) e ativação/desativação.
* **Usabilidade e Offline**: busca e ordenação em todas as listagens, paginação dinâmica adaptada à altura da janela, ícones locais via `react-icons` e banco SQLite local sem dependência de internet.

---

## Arquitetura e Tecnologias

* **Aplicação Desktop**: [Nextron](https://github.com/saltyshiomix/nextron) (Electron + Next.js)
* **Frontend (Renderer)**: Next.js 16, React 19, TypeScript, Tailwind CSS v4 e `react-icons`
* **Backend (Main)**: Node.js no processo principal do Electron, organizado em camadas (`entities`, `daos`, `controllers`, `ipc`)
* **Banco de Dados**: SQLite local via `better-sqlite3`
* **Testes**: Node Test Runner (`node:test`) com TypeScript nativo
* **Integração Contínua**: GitHub Actions com validação de Conventional Commits

---

## Estrutura do Repositório

```text
.
├── .github/workflows/           # Pipelines CI (validação de commits)
├── .githooks/                   # Hooks locais do Git (commitlint e proteção da main)
├── main/                        # Processo Principal do Electron (Backend / Node.js)
│   ├── controllers/             # Regras de negócio e orquestração
│   ├── daos/                    # Acesso a dados no SQLite
│   ├── database/                # Conexão, schema e migrações locais
│   ├── entities/                # Entidades e validações de domínio
│   ├── helpers/                 # Auxiliares de janela do Electron
│   ├── ipc/                     # Handlers ipcMain por módulo
│   ├── main.ts                  # Ponto de entrada do Electron
│   └── preload.ts / preload.cjs # Ponte segura contextBridge (window.ipc)
├── renderer/                    # Processo de Renderização (Frontend / Next.js)
│   ├── components/              # Componentes compartilhados, tabelas, formulários e modais
│   ├── hooks/                   # Hooks customizados (ex.: paginação dinâmica)
│   ├── pages/                   # Rotas da aplicação (início, empréstimo, livro, professor, turma)
│   ├── public/                  # Ativos estáticos e ícones locais
│   ├── styles/                  # Estilos globais e Tailwind CSS v4
│   ├── types/                   # Tipagens TypeScript do frontend
│   └── utils/                   # Utilitários de layout e cálculos de interface
├── tests/                       # Suíte de testes unitários (node:test)
├── electron-builder.yml         # Configuração dos executáveis desktop
├── dockerfile / docker-compose.yml
├── .commitlintrc.json           # Regras de Conventional Commits
├── package.json                 # Scripts e dependências do projeto
└── README.md
```

---

## Como Executar o Projeto

### Pré-requisitos
* [Node.js 22.6+](https://nodejs.org/) (recomendado Node.js 24+, necessário para `--experimental-transform-types` nos scripts `dev` e `test`).

### Modo Desenvolvimento Local
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie a aplicação desktop em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

### Scripts Disponíveis
| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o Electron + Next.js em modo de desenvolvimento |
| `npm test` | Executa toda a suíte de testes unitários (`tests/*.test.ts`) |
| `npm run build` | Gera os pacotes de produção configurados |
| `npm run build:win` | Gera o instalador para Windows em `dist/` (`.exe`) |
| `npm run build:linux` | Gera o executável portátil para Linux em `dist/` (`.AppImage`) |
| `npm run lint:commit:last` | Valida a última mensagem de commit com o commitlint |

> [!NOTE]
> Os executáveis compilados em `dist/` não são versionados no Git (protegidos pelo `.gitignore`). A distribuição para a creche deve ser feita pelos binários gerados ou pela aba **Releases** do GitHub.

---

## Comunicação entre Frontend e Backend (IPC)

O frontend não acessa o banco SQLite diretamente. Toda operação passa pela ponte tipada exposta em `main/preload.ts` (`window.ipc`) e registrada nos handlers em `main/ipc/`:

* **Frontend**: `const resposta = await window.ipc.livro.cadastrar({ titulo, editora, quantidadeTotal });`
* **Backend**: `ipcMain.handle('livro:cadastrar', async (_event, dados) => { ... });`

Os módulos expostos seguem o padrão de namespace: `window.ipc.livro`, `window.ipc.professor`, `window.ipc.turma` e `window.ipc.emprestimo`.

---

## Fluxo de Branches e Proteção da `main`

1. **Branch `main` (Produção/Estável)**:
   * Bloqueada para push direto. Alterações entram apenas via Pull Request aprovado.
2. **Branch `develop` (Integração)**:
   * Branch principal de integração das funcionalidades da equipe.
3. **Branches de trabalho (`feature/...`, `fix/...`, `refactor/...`)**:
   * Crie sempre a partir da `develop`:
     ```bash
     git checkout develop
     git pull origin develop
     git checkout -b feature/nome-da-funcionalidade
     ```
   * Ao finalizar, valide os testes (`npm test`) e abra um Pull Request para a `develop`.

---

## Padrão de Commits (Conventional Commits)

O repositório valida automaticamente os commits no GitHub Actions e nos hooks locais:

```text
<tipo>(<escopo opcional>): <descrição objetiva>
```

| Tipo | Quando Usar | Exemplo |
| :--- | :--- | :--- |
| `feat` | Nova funcionalidade | `feat(livro): adicionar filtro por status` |
| `fix` | Correção de bug | `fix(emprestimo): corrigir calculo de saldo disponivel` |
| `docs` | Alterações de documentação | `docs: atualizar instrucoes no README` |
| `style` | Ajustes visuais ou de formatação | `style(tabelas): padronizar alinhamento das colunas` |
| `refactor` | Refatoração sem alterar comportamento | `refactor(ui): extrair componente PageShell` |
| `test` | Adição ou ajuste de testes | `test(turma): adicionar testes unitarios de CRUD` |
| `build` | Alterações de build ou dependências | `build: atualizar configuracao do electron-builder` |
| `ci` | Ajustes de pipelines CI | `ci: ajustar workflow de validacao de commits` |
| `chore` | Tarefas rotineiras e manutenção | `chore: atualizar regras do .gitignore` |
| `revert` | Reversão de commit anterior | `revert: desfazer alteracao anterior` |
