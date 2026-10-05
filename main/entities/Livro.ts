export type StatusCadastro = 'ATIVO' | 'INATIVO';

// Entity — Information Expert: sabe validar seus próprios dados para o cadastro do livro (RF01)
export class Livro {
  id: number | null;
  titulo: string;
  editora: string;
  quantidadeTotal: number;
  quantidadeEmprestada: number;
  status: StatusCadastro;
  dataCadastro: Date;
  dataAtualizacao: Date;

  constructor(props: {
    id?: number | null;
    titulo: string;
    editora: string;
    quantidadeTotal: number;
    quantidadeEmprestada?: number;
    status?: StatusCadastro;
    dataCadastro?: Date;
    dataAtualizacao?: Date;
  }) {
    this.id = props.id ?? null;
    this.titulo = props.titulo.trim();
    this.editora = props.editora.trim();
    this.quantidadeTotal = props.quantidadeTotal;
    this.quantidadeEmprestada = props.quantidadeEmprestada ?? 0;
    this.status = props.status ?? 'ATIVO';
    this.dataCadastro = props.dataCadastro ?? new Date();
    this.dataAtualizacao = props.dataAtualizacao ?? new Date();
  }

  // RN03 — Saldo Disponível = Quantidade Total de Cópias − Quantidade de Cópias Emprestadas.
  // No momento do cadastro inicial, como quantidadeEmprestada é 0, o saldo disponível é igual ao total de cópias.
  public getSaldoDisponivel(): number {
    return Math.max(0, this.quantidadeTotal - this.quantidadeEmprestada);
  }

  // RN06 — Chave única: combinação de Título e Editora (case-insensitive, sem espaços nas extremidades)
  public getTituloNormalizado(): string {
    return this.titulo.trim().toLowerCase();
  }

  public getEditoraNormalizada(): string {
    return this.editora.trim().toLowerCase();
  }

  public getChaveUnica(): string {
    return `${this.getTituloNormalizado()}::${this.getEditoraNormalizada()}`;
  }

  // Validação de campos obrigatórios e integridade cadastral (RF01, RN03, RNF03)
  public validarCamposObrigatorios(): void {
    if (!this.titulo) {
      throw new Error('O campo "Título" é obrigatório.');
    }
    if (!this.editora) {
      throw new Error('O campo "Editora" é obrigatório.');
    }
    if (
      this.quantidadeTotal === undefined ||
      this.quantidadeTotal === null ||
      !Number.isInteger(this.quantidadeTotal) ||
      this.quantidadeTotal <= 0
    ) {
      throw new Error('A "Quantidade Total de Cópias" deve ser um número inteiro maior que zero.');
    }
    if (
      this.quantidadeEmprestada < 0 ||
      !Number.isInteger(this.quantidadeEmprestada) ||
      this.quantidadeEmprestada > this.quantidadeTotal
    ) {
      throw new Error('A quantidade de cópias emprestadas deve ser um número inteiro entre 0 e a quantidade total.');
    }
  }

  /**
   * RF02 / RN03 — Regras de Edição de Livro (Information Expert):
   * - Só é possível editar um livro com status "Ativo"; livros "Inativos" precisam passar pela reativação primeiro.
   * - Título e Editora são obrigatórios.
   * - A nova quantidade total não pode ser negativa e deve ser um número inteiro.
   * - A nova quantidade não pode ser inferior à quantidade de cópias já emprestadas no momento da edição.
   * - Se a quantidade total for reduzida a exatamente zero, o sistema muda o status para "Inativo" automaticamente.
   */
  public editar(props: {
    titulo: string;
    editora: string;
    quantidadeTotal: number;
  }): void {
    if (this.status !== 'ATIVO') {
      throw new Error(
        'Apenas livros com status "Ativo" podem ser editados. Livros inativos precisam ser reativados primeiro.'
      );
    }

    const novoTitulo = props.titulo ? props.titulo.trim() : '';
    const novaEditora = props.editora ? props.editora.trim() : '';

    if (!novoTitulo) {
      throw new Error('O campo "Título" é obrigatório.');
    }
    if (!novaEditora) {
      throw new Error('O campo "Editora" é obrigatório.');
    }

    if (
      props.quantidadeTotal === undefined ||
      props.quantidadeTotal === null ||
      !Number.isInteger(props.quantidadeTotal) ||
      props.quantidadeTotal < 0
    ) {
      throw new Error('A "Quantidade Total de Cópias" deve ser um número inteiro maior ou igual a zero.');
    }

    if (props.quantidadeTotal < this.quantidadeEmprestada) {
      throw new Error(
        `A nova quantidade total (${props.quantidadeTotal}) não pode ser inferior à quantidade de cópias já emprestadas (${this.quantidadeEmprestada}).`
      );
    }

    this.titulo = novoTitulo;
    this.editora = novaEditora;
    this.quantidadeTotal = props.quantidadeTotal;

    // RN03: Caso o valor editado resulte em exatamente zero, o sistema deve inativar automaticamente o livro.
    if (this.quantidadeTotal === 0) {
      this.status = 'INATIVO';
    }

    this.dataAtualizacao = new Date();
  }

  /**
   * RN04 — Desativação lógica do livro:
   * Altera o status para "INATIVO" e atualiza a data de modificação,
   * preservando a rastreabilidade dos dados históricos.
   */
  public desativar(): void {
    this.status = 'INATIVO';
    this.dataAtualizacao = new Date();
  }

  /**
   * HU05 / RN04 — Ativação de Livro Inativo (Information Expert):
   * Altera o status para "ATIVO", define a nova quantidade total de cópias
   * e renova a data de atualização.
   */
  public ativar(novaQuantidadeTotal: number): void {
    if (this.status !== 'INATIVO') {
      throw new Error('Apenas livros com status "Inativo" podem ser ativados.');
    }

    if (
      novaQuantidadeTotal === undefined ||
      novaQuantidadeTotal === null ||
      !Number.isInteger(novaQuantidadeTotal) ||
      novaQuantidadeTotal <= 0
    ) {
      throw new Error(
        'A "Quantidade Total de Cópias" deve ser um número inteiro maior que zero.'
      );
    }

    if (novaQuantidadeTotal < this.quantidadeEmprestada) {
      throw new Error(
        `A nova quantidade total (${novaQuantidadeTotal}) não pode ser inferior à quantidade de cópias já emprestadas (${this.quantidadeEmprestada}).`
      );
    }

    this.quantidadeTotal = novaQuantidadeTotal;
    this.status = 'ATIVO';
    this.dataAtualizacao = new Date();
  }
}

