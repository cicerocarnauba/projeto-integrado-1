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
}
