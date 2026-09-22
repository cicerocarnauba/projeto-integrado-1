export type StatusCadastro = 'ATIVO' | 'INATIVO';

// Entity — Information Expert: sabe validar seus próprios dados
export class Turma {
  id: number | null;
  nome: string;
  status: StatusCadastro;
  dataCadastro: Date;
  dataAtualizacao: Date;

  constructor(props: {
    id?: number | null;
    nome: string;
    status?: StatusCadastro;
    dataCadastro?: Date;
    dataAtualizacao?: Date;
  }) {
    this.id = props.id ?? null;
    this.nome = props.nome.trim();
    this.status = props.status ?? 'ATIVO';
    this.dataCadastro = props.dataCadastro ?? new Date();
    this.dataAtualizacao = props.dataAtualizacao ?? new Date();
  }

  // RN07 — chave única normalizada (case-insensitive, sem espaços nas pontas)
  public getNomeNormalizado(): string {
    return this.nome.trim().toLowerCase();
  }

  // Validação de campos obrigatórios (RF12)
  public validarCamposObrigatorios(): void {
    if (!this.nome) {
      throw new Error('O campo "Nome" é obrigatório.');
    }
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