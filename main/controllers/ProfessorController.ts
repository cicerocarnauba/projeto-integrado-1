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

export interface EditarProfessorInput {
  primeiroNome: string;
  sobrenome: string;
  email: string;
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

  /**
   * HU08 — Editar Professor
   *
   * Regras de negócio:
   * 1. O professor precisa existir.
   * 2. Só é possível editar professor com status "ATIVO".
   * 3. Os campos (primeiro nome, sobrenome, e-mail) são validados.
   * 4. Se o e-mail for alterado, a unicidade deve ser validada (RN05):
   *    o novo e-mail não pode pertencer a outro registro (ativo ou inativo).
   *
   * Relações: [RF08], [RN05], [RNF03]
   */
  public editar(id: number, input: EditarProfessorInput): Professor {
    // 1. Busca o professor
    const professor = this.professorDAO.buscarPorId(id);
    if (!professor) {
      throw new Error('Professor não encontrado.');
    }

    // 2. Só permite editar professor ATIVO
    if (professor.status !== 'ATIVO') {
      throw new Error(
        'Não é possível editar um professor inativo. Reative o cadastro antes de editá-lo.'
      );
    }

    // 3. Valida os campos informados (reutiliza a entidade)
    const dadosAtualizados = new Professor({
      primeiroNome: input.primeiroNome,
      sobrenome: input.sobrenome,
      email: input.email,
      status: professor.status,
      dataCadastro: professor.dataCadastro,
    });
    dadosAtualizados.validarCamposObrigatorios();

    // 4. Se o e-mail foi alterado, valida a unicidade (RN05)
    const emailNormalizado = dadosAtualizados.email;
    if (emailNormalizado !== professor.email) {
      const professorComMesmoEmail =
        this.professorDAO.buscarPorEmail(emailNormalizado);
      if (professorComMesmoEmail && professorComMesmoEmail.id !== professor.id) {
        throw new Error(
          'E-mail já cadastrado no sistema. Informe um e-mail diferente.'
        );
      }
    }

    // 5. Atualiza os dados da entidade e persiste
    professor.atualizarDados({
      primeiroNome: input.primeiroNome,
      sobrenome: input.sobrenome,
      email: input.email,
    });

    try {
      this.professorDAO.atualizar(professor);
    } catch (error) {
      const msg = (error as Error).message ?? '';
      if (msg.includes('UNIQUE constraint failed')) {
        throw new Error(
          'E-mail já cadastrado no sistema. Informe um e-mail diferente.'
        );
      }
      throw error;
    }

    return professor;
  }
}