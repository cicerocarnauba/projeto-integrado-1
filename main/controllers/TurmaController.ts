import { Turma } from '../entities/Turma.ts';
import { TurmaDAO } from '../daos/TurmaDAO.ts';

export interface CadastrarTurmaInput {
  nome: string;
}

export interface ConsultarTurmaInput {
  nome?: string;
  incluirInativos?: boolean;
}

// GRASP Controller: ponto de entrada das operações de Turma
// GRASP Creator: é quem cria instâncias de Turma
export class TurmaController {
  constructor(private turmaDAO: TurmaDAO) {}

  /**
   * RF12 — Cadastrar Turma
   */
  public cadastrar(input: CadastrarTurmaInput): Turma {
    const turma = new Turma({
      nome: input.nome,
    });

    turma.validarCamposObrigatorios();

    if (this.turmaDAO.buscarPorNome(turma.nome)) {
      throw new Error(
        'Já existe uma turma cadastrada com esse nome. Informe um nome diferente.'
      );
    }

    try {
      return this.turmaDAO.inserir(turma);
    } catch (error) {
      const msg = (error as Error).message ?? '';
      if (msg.includes('UNIQUE constraint failed')) {
        throw new Error(
          'Já existe uma turma cadastrada com esse nome. Informe um nome diferente.'
        );
      }
      throw error;
    }
  }

  /**
   * RF13 — Consultar Turma
   */
  public consultar(input: ConsultarTurmaInput): Turma[] {
    return this.turmaDAO.consultar({
      nome: input.nome,
      incluirInativos: input.incluirInativos,
    });
  }

  /**
   * Apoio ao fluxo de Detalhes/Edição.
   */
  public buscarPorId(id: number): Turma {
    const turma = this.turmaDAO.buscarPorId(id);
    if (!turma) {
      throw new Error('Turma não encontrada.');
    }
    return turma;
  }

  /**
   * HU18 — Ativar Turma
   *
   * Regras de negócio:
   * 1. A turma precisa existir.
   * 2. Só faz sentido ativar uma turma com status "INATIVO".
   * 3. A ativação não exige nenhuma informação adicional — os dados
   *    permanecem os mesmos de antes da desativação.
   *
   * Relações: [RF18], [RN04], [RNF03]
   */
  public ativar(id: number): Turma {
    // 1. Busca a turma
    const turma = this.turmaDAO.buscarPorId(id);
    if (!turma) {
      throw new Error('Turma não encontrada.');
    }

    // 2. Só permite ativar quem está INATIVO
    if (turma.status === 'ATIVO') {
      throw new Error('Esta turma já está ativa.');
    }

    // 3. Ativa (a entidade já tem o método `ativar()`)
    turma.ativar();
    this.turmaDAO.atualizarStatus(id, 'ATIVO');

    return turma;
  }
}