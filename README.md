# Sistema de Gerenciamento de Acervo de Biblioteca Escolar
> **Creche Maria de Lourdes — Município de Piquet Carneiro**

Sistema desktop offline desenvolvido para facilitar e digitalizar o controle de acervo e empréstimos de livros na Creche Maria de Lourdes, substituindo o controle manual em cadernos físicos por uma aplicação instalável moderna e ágil.

---

## Arquitetura e Tecnologias

* **Aplicação Desktop**: [Nextron](https://github.com/saltyshiomix/nextron) (integração entre Next.js e Electron)
* **Frontend (Telas)**: Next.js (React) com estilização em Tailwind CSS
* **Backend (Lógica Local)**: Node.js nativo do Electron, executando regras de negócio e validações
* **Banco de Dados**: SQLite (arquivo .db local, sem necessidade de instalar servidor de banco)
* **Conteiner de Desenvolvimento**: Docker (dockerfile + docker-compose.yml)
* **Integração Contínua**: GitHub Actions com validação estrita de Conventional Commits

---

## Estrutura do Repositório

```text
.
├── .github/
│   └── workflows/
│       └── conventional-commits.yml   # Pipeline CI para validação de commits
├── main/                              # Processo Principal do Electron (Backend / Node.js)
│   └── .gitkeep                       # Conexão com SQLite e regras
├── renderer/                          # Processo de Renderização (Frontend / Next.js)
│   └── .gitkeep                       # Telas, componentes e Tailwind CSS
├── dockerfile                         # Container Node 20 com ferramentas para SQLite
├── docker-compose.yml                 # Orquestração do ambiente de desenvolvimento
├── .commitlintrc.json                 # Regras de Conventional Commits
├── .editorconfig                      # Padronização de formatação entre editores
├── .gitignore                         # Arquivos ignorados pelo Git
├── package.json                       # Scripts e dependências do projeto
└── README.md                          # Guia do Repositório
```

---

## Como Executar o Projeto

### Pré-requisitos
* [Node.js 20+](https://nodejs.org/) instalado na máquina (ou Docker).

### Guia de Desenvolvimento Passo a Passo 

#### Frontend (pasta `renderer/`)
1. **Estrutura de Páginas**: Criar as rotas e telas dentro da pasta `renderer/pages/` (ou `renderer/app/`).
2. **Componentes de Interface**: Desenvolver componentes reutilizáveis (tabelas de listagem, formulários, modais de confirmação e filtros) com React e Tailwind CSS.
3. **Comunicação com o Backend**: Invocar as operações do sistema via IPC (`window.ipc.invoke`), exibindo os dados retornados e tratando mensagens de validação para a usuária.
4. **Isolamento**: O frontend não acessa arquivos locais nem o banco diretamente; todas as operações devem solicitar dados ao backend via IPC.

#### Backend (pasta `main/`)
1. **Gerenciamento do Electron**: Configurar o arquivo `main/background.ts` para inicializar a janela desktop e o ciclo de vida do aplicativo.
2. **Persistência com SQLite**: Configurar o driver de banco de dados (como `better-sqlite3`) para gerenciar a criação de tabelas e operações no arquivo local `.db`.
3. **Regras de Negócio e Validações**: Implementar toda a lógica do sistema (cálculos de estoque, verificações de duplicidade e integridade dos dados).
4. **Exposição dos Serviços via IPC**: Registrar os manipuladores no processo principal (`ipcMain.handle(...)`) e expô-los com segurança no `main/preload.ts` para que as telas possam chamá-los.

#### Fluxo de Integração (Front <-> Back)
* **No Frontend**: `const resultado = await window.ipc.invoke('cadastrar-livro', dadosDoLivro);`
* **No Backend**: `ipcMain.handle('cadastrar-livro', async (event, dados) => { /* valida regras e grava no SQLite */ });`

### Modo Desenvolvimento Local
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie a aplicação desktop em modo de desenvolvimento (com hot-reload):
   ```bash
   npm run dev
   ```

### Executando com Docker
Se preferir rodar o ambiente de desenvolvimento isolado em contêiner:
```bash
docker compose up -d
```

### Gerando os Executáveis Desktop (.exe e .AppImage)

Os arquivos compilados finais são gerados automaticamente dentro da pasta `dist/`.

* **Gerar instalador para Windows (.exe):**
  ```bash
  npm run build:win
  ```
  Gera o instalador NSIS completo (`dist/LivroPiqueT Setup 1.0.0.exe`).

* **Gerar executável para Linux (.AppImage):**
  ```bash
  npm run build:linux
  ```
  Gera o executável portátil (`dist/LivroPiqueT-1.0.0.AppImage`).

* **Gerar todos os executáveis configurados:**
  ```bash
  npm run build
  ```

> [!NOTE]
> **Atenção:** Os arquivos executáveis gerados na pasta `dist/` **não são e nem devem ser enviados para o Git** (já estão protegidos pelo `.gitignore`). O repositório armazena apenas o código-fonte. O executável para a creche deve ser distribuído diretamente aos usuários ou anexado na aba de **Releases** do GitHub.

---

## Fluxo de Branches e Proteção da `main`

Para manter a estabilidade do projeto, adotamos o seguinte fluxo:

1. **Branch `main` (Produção/Estável)**:
   * **Bloqueada para push direto**. Qualquer tentativa de `git push origin main` será cancelada automaticamente por um Git hook local e pelas regras do GitHub.
   * Modificações na `main` são feitas **exclusivamente através de Pull Requests (PR)** aprovados.

2. **Branch `develop` (Integração)**:
   * Branch padrão para envio de novas funcionalidades integradas e testes em conjunto.
   * Permite push direto dos membros da equipe.

3. **Branches de Funcionalidades (`feature/...`)**:
   * Sempre crie uma nova branch a partir da `develop`:
     ```bash
     git checkout develop
     git pull origin develop
     git checkout -b feature/nome-da-sua-feature
     ```
   * Conclua sua funcionalidade, teste os commits e abra um Pull Request para a `develop`.

---

## Padrão de Commits (Conventional Commits)

O repositório possui uma pipeline de CI no **GitHub Actions** que valida todos os commits enviados em **Pushes** e **Pull Requests**. Commits fora do padrão **serão rejeitados**.

### Estrutura da Mensagem:
```text
<tipo>(<escopo opcional>): <descrição objetiva>
```

### Tipos Permitidos:
| Tipo | Quando Usar | Exemplo |
| :--- | :--- | :--- |
| `feat` | Uma nova funcionalidade | `feat(livros): adicionar listagem de acervo ativo` |
| `fix` | Correção de um bug | `fix(emprestimos): corrigir cálculo de saldo disponível` |
| `docs` | Alterações puramente na documentação | `docs: atualizar exemplos no README` |
| `style` | Formatação de código que não altera significado | `style: aplicar identação e remover ponto e vírgula` |
| `refactor` | Mudança de código que não corrige bug nem adiciona feature | `refactor: simplificar consulta de professores` |
| `test` | Adição ou correção de testes | `test(turmas): adicionar testes unitários de validação` |
| `build` | Mudanças que afetam o build ou dependências externas | `build: adicionar dependência do better-sqlite3` |
| `ci` | Mudanças nas configurações de CI (GitHub Actions) | `ci: ajustar workflow de validação de commits` |
| `chore` | Tarefas rotineiras que não alteram código de produção | `chore: atualizar regras do .gitignore` |
| `revert` | Reversão de um commit anterior | `revert: reverter commit anterior` |

### Exemplos Práticos:
* [Válido] `feat(livro): implementar validacao de duplicidade por titulo e editora`
* [Válido] `fix: impedir exclusao de turma com emprestimo pendente`
* [Válido] `docs: incluir instrucoes de build do executavel`
* [Inválido] `subindo alteracoes` (Sem tipo válido)
* [Inválido] `adicionado tela` (Não segue a convenção tipo: mensagem)
* [Inválido] `WIP` (Proibido)

### Testando seus commits localmente:
Você pode testar se a sua mensagem de commit é válida antes de fazer o push:
```bash
npm run lint:commit:last
```
