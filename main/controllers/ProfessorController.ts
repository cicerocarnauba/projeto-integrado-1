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

/**
 * DTO retornado por `consultar` e `buscarPorId`.
 * Contém todos os campos da entidade Professor + o booleano `possuiHistorico`
 * calculado sob demanda, usado pelo front para decidir entre
 * habilitar "Desativar" ou "Excluir".
 */
export interface ProfessorDTO {
  id: number | null;
  primeiroNome: string;
  sobrenome: string;
  email: string;
  status: 'ATIVO' | 'INATIVO';
  dataCadastro: Date;
  dataAtualizacao: Date;
  possuiHistorico: boolean;
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
   * Retorna DTO com `possuiHistorico` em cada item.
   */
  public consultar(input: ConsultarProfessorInput): ProfessorDTO[] {
    const professores = this.professorDAO.consultar({
      nome: input.nome,
      email: input.email,
      incluirInativos: input.incluirInativos,
    });
    return professores.map((p) => this.toDTO(p));
  }

  /**
   * Apoio ao fluxo de Detalhes/Edição.
   * Retorna DTO com `possuiHistorico`.
   */
  public buscarPorId(id: number): ProfessorDTO {
    const professor = this.professorDAO.buscarPorId(id);
    if (!professor) {
      throw new Error('Professor não encontrado.');
    }
    return this.toDTO(professor);
  }

  /**
   * HU10 — Excluir Professor
   *
   * Regras:
   * 1. O professor precisa existir.
   * 2. Se houver empréstimo PENDENTE associado → bloqueia.
   * 3. Se houver histórico → desativação lógica (status = INATIVO).
   * 4. Se NÃO houver histórico → exclusão física do banco de dados.
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
   */
  public editar(id: number, input: EditarProfessorInput): Professor {
    const professor = this.professorDAO.buscarPorId(id);
    if (!professor) {
      throw new Error('Professor não encontrado.');
    }

    if (professor.status !== 'ATIVO') {
      throw new Error(
        'Não é possível editar um professor inativo. Reative o cadastro antes de editá-lo.'
      );
    }

    const dadosAtualizados = new Professor({
      primeiroNome: input.primeiroNome,
      sobrenome: input.sobrenome,
      email: input.email,
      status: professor.status,
      dataCadastro: professor.dataCadastro,
    });
    dadosAtualizados.validarCamposObrigatorios();

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

  /**
   * HU12 — Reativar Professor
   *
   * Regras de negócio:
   * 1. O professor precisa existir.
   * 2. Só faz sentido reativar um professor com status "INATIVO".
   * 3. A reativação não exige nenhuma informação adicional — os dados
   *    permanecem os mesmos de antes da desativação.
   * 4. O e-mail continua sendo chave única (RN05), mas como não é alterado
   *    na reativação, não precisa ser revalidado.
   *
   * Relações: [RF12], [RN04], [RNF03]
   */
  public reativar(id: number): Professor {
    const professor = this.professorDAO.buscarPorId(id);
    if (!professor) {
      throw new Error('Professor não encontrado.');
    }

    if (professor.status === 'ATIVO') {
      throw new Error('Este professor já está ativo.');
    }

    professor.ativar();
    this.professorDAO.atualizarStatus(id, 'ATIVO');

    return professor;
  }

  /**
   * HU11 — Desativar Professor
   *
   * Regras de negócio:
   * 1. O professor precisa existir.
   * 2. Só faz sentido desativar um professor com status "ATIVO".
   * 3. A operação é bloqueada se houver empréstimo "Pendente" associado.
   * 4. A desativação só é permitida se o professor possuir histórico de
   *    empréstimos. Se NÃO possuir histórico, deve ser realizada a exclusão.
   * 5. O status muda para "INATIVO".
   *
   * Relações: [RF11], [RN04], [RNF03]
   */
  public desativar(id: number): Professor {
    const professor = this.professorDAO.buscarPorId(id);
    if (!professor) {
      throw new Error('Professor não encontrado.');
    }

    if (professor.status !== 'ATIVO') {
      throw new Error('Este professor já está inativo.');
    }

    if (this.professorDAO.possuiEmprestimoPendente(id)) {
      throw new Error(
        'Não é possível desativar este professor, pois ele possui empréstimos pendentes.'
      );
    }

    if (!this.professorDAO.possuiHistoricoEmprestimos(id)) {
      throw new Error(
        'Este professor não possui histórico de empréstimos. Utilize a opção "Excluir" para removê-lo definitivamente.'
      );
    }

    professor.inativar();
    this.professorDAO.atualizarStatus(id, 'INATIVO');

    return professor;
  }

  /**
   * Monta o DTO do professor, incluindo `possuiHistorico` (usado pelo front
   * para decidir entre habilitar "Desativar" ou "Excluir").
   */
  private toDTO(professor: Professor): ProfessorDTO {
    return {
      id: professor.id,
      primeiroNome: professor.primeiroNome,
      sobrenome: professor.sobrenome,
      email: professor.email,
      status: professor.status,
      dataCadastro: professor.dataCadastro,
      dataAtualizacao: professor.dataAtualizacao,
      possuiHistorico:
        professor.id !== null &&
        this.professorDAO.possuiHistoricoEmprestimos(professor.id),
    };
  }
}