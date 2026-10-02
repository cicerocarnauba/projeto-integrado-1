import { Professor } from '../entities/Professor.ts';
import { ProfessorDAO } from '../daos/ProfessorDAO.ts';

export interface CadastrarProfessorInput {
  primeiroNome: string;
  sobrenome: string;
  email: string;
}

export interface ConsultarProfessorInput {
  nome?: string;
  email?: string;
  incluirInativos?: boolean;
}

// GRASP Controller: ponto de entrada das operações de Professor
// GRASP Creator: é quem cria instâncias de Professor
export class ProfessorController {
  constructor(private professorDAO: ProfessorDAO) {}

  /**
   * RF07 — Cadastrar Professor
   */
  public cadastrar(input: CadastrarProfessorInput): Professor {
    const professor = new Professor({
      primeiroNome: input.primeiroNome,
      sobrenome: input.sobrenome,
      email: input.email,
    });

    professor.validarCamposObrigatorios();

    if (this.professorDAO.buscarPorEmail(professor.email)) {
      throw new Error(
        'E-mail já cadastrado no sistema. Informe um e-mail diferente.'
      );
    }

    try {
      return this.professorDAO.inserir(professor);
    } catch (error) {
      const msg = (error as Error).message ?? '';
      if (msg.includes('UNIQUE constraint failed')) {
        throw new Error(
          'E-mail já cadastrado no sistema. Informe um e-mail diferente.'
        );
      }
      throw error;
    }
  }

  /**
   * RF09 — Consultar Professor
   */
  public consultar(input: ConsultarProfessorInput): Professor[] {
    return this.professorDAO.consultar({
      nome: input.nome,
      email: input.email,
      incluirInativos: input.incluirInativos,
    });
  }

  /**
   * Apoio ao fluxo de Detalhes/Edição.
   */
  public buscarPorId(id: number): Professor {
    const professor = this.professorDAO.buscarPorId(id);
    if (!professor) {
      throw new Error('Professor não encontrado.');
    }
    return professor;
  }

  /**
   * HU10 — Excluir Professor
   *
   * Regra de negócio:
   * 1. Se o professor NÃO existe → erro.
   * 2. Se possui empréstimo PENDENTE → bloqueia a operação (RNF03).
   * 3. Se possui histórico de empréstimos → desativação lógica (status = INATIVO).
   * 4. Se NÃO possui histórico → exclusão física do banco de dados.
   *
   * Relações: [RF10], [RN04], [RNF03]
   */
  public excluir(id: number): { tipo: 'EXCLUSAO' | 'DESATIVACAO'; professor: Professor } {
    const professor = this.professorDAO.buscarPorId(id);
    if (!professor) {
      throw new Error('Professor não encontrado.');
    }

    if (this.professorDAO.possuiEmprestimoPendente(id)) {
      throw new Error(
        'Não é possível excluir ou desativar este professor, pois ele possui empréstimos pendentes.'
      );
    }

    if (this.professorDAO.possuiHistoricoEmprestimos(id)) {
      professor.inativar();
      this.professorDAO.atualizarStatus(id, 'INATIVO');
      return { tipo: 'DESATIVACAO', professor };
    }

    this.professorDAO.excluir(id);
    return { tipo: 'EXCLUSAO', professor };
  }
}