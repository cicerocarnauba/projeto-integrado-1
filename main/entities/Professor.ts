export type StatusCadastro = 'ATIVO' | 'INATIVO';

// Entity — Information Expert: sabe validar seus próprios dados
export class Professor {
  id: number | null;
  primeiroNome: string;
  sobrenome: string;
  email: string;
  status: StatusCadastro;
  dataCadastro: Date;
  dataAtualizacao: Date;

  constructor(props: {
    id?: number | null;
    primeiroNome: string;
    sobrenome: string;
    email: string;
    status?: StatusCadastro;
    dataCadastro?: Date;
    dataAtualizacao?: Date;
  }) {
    this.id = props.id ?? null;
    this.primeiroNome = props.primeiroNome.trim();
    this.sobrenome = props.sobrenome.trim();
    this.email = props.email.trim().toLowerCase();
    this.status = props.status ?? 'ATIVO';
    this.dataCadastro = props.dataCadastro ?? new Date();
    this.dataAtualizacao = props.dataAtualizacao ?? new Date();
  }

  // RN05 — Chave única: e-mail como identificador
  public getEmailNormalizado(): string {
    return this.email.toLowerCase().trim();
  }

  public getNomeCompleto(): string {
    return `${this.primeiroNome} ${this.sobrenome}`.trim();
  }

  // Validação de campos obrigatórios (RF07)
  public validarCamposObrigatorios(): void {
    if (!this.primeiroNome) {
      throw new Error('O campo "Primeiro Nome" é obrigatório.');
    }
    if (!this.sobrenome) {
      throw new Error('O campo "Sobrenome" é obrigatório.');
    }
    if (!this.email) {
      throw new Error('O campo "E-mail" é obrigatório.');
    }
    if (!this.isEmailValido()) {
      throw new Error('O e-mail informado não possui um formato válido.');
    }
  }

  private isEmailValido(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  // HU10 — Bloqueio de exclusão/desativação se houver empréstimo pendente
  public podeSerExcluido(possuiEmprestimoPendente: boolean): boolean {
    return !possuiEmprestimoPendente;
  }

  public podeSerDesativado(possuiEmprestimoPendente: boolean): boolean {
    return !possuiEmprestimoPendente;
  }

  // HU08 — Editar Professor
  // Atualiza os campos editáveis (primeiro nome, sobrenome e e-mail).
  // A validação de unicidade do e-mail é responsabilidade do Controller (RN05).
  public atualizarDados(props: {
    primeiroNome: string;
    sobrenome: string;
    email: string;
  }): void {
    this.primeiroNome = props.primeiroNome.trim();
    this.sobrenome = props.sobrenome.trim();
    this.email = props.email.trim().toLowerCase();
    this.dataAtualizacao = new Date();
  }

  // Comportamento de ciclo de vida
  public ativar(): void {
    this.status = 'ATIVO';
    this.dataAtualizacao = new Date();
  }

  public inativar(): void {
    this.status = 'INATIVO';
    this.dataAtualizacao = new Date();
  }
}