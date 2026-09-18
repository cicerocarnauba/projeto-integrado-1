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
   * Regras aplicadas:
   *  - Campos obrigatórios (RNF03: mensagens claras)
   *  - RN07: nome único (ativas ou inativas)
   */
  public cadastrar(input: CadastrarTurmaInput): Turma {
    const turma = new Turma({
      nome: input.nome,
    });

    turma.validarCamposObrigatorios();

    // Checagem "amigável"
    if (this.turmaDAO.buscarPorNome(turma.nome)) {
      throw new Error(
        'Já existe uma turma cadastrada com esse nome. Informe um nome diferente.'
      );
    }

    // Rede de segurança contra race condition (RNF03)
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
   *  - Filtro por nome (parcial).
   *  - Por padrão, retorna apenas ATIVAS.
   *  - `incluirInativos = true` também traz INATIVAS (RNF04).
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
}