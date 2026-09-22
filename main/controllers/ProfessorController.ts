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
   * Regras aplicadas:
   *  - Campos obrigatórios (RNF03: mensagens claras)
   *  - RN05: e-mail único (ativos ou inativos)
   */
  public cadastrar(input: CadastrarProfessorInput): Professor {
    const professor = new Professor({
      primeiroNome: input.primeiroNome,
      sobrenome: input.sobrenome,
      email: input.email,
    });

    // Validação de campos obrigatórios e formato de e-mail
    professor.validarCamposObrigatorios();

    // Checagem "amigável" (evita chegar no SQLite na maioria dos casos)
    if (this.professorDAO.buscarPorEmail(professor.email)) {
      throw new Error(
        'E-mail já cadastrado no sistema. Informe um e-mail diferente.'
      );
    }

    // Rede de segurança contra race condition: mapeia o erro técnico do SQLite
    // para uma mensagem amigável, mantendo o RNF03.
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
   *  - Filtros independentes: nome (primeiro nome OU sobrenome), email.
   *  - Por padrão, retorna apenas ATIVOS.
   *  - `incluirInativos = true` também traz INATIVOS (RNF04).
   */
  public consultar(input: ConsultarProfessorInput): Professor[] {
    return this.professorDAO.consultar({
      nome: input.nome,
      email: input.email,
      incluirInativos: input.incluirInativos,
    });
  }

  /**
   * Apoio ao fluxo de Detalhes/Edição (não solicitado ainda,
   * mas útil para o frontend futuramente).
   */
  public buscarPorId(id: number): Professor {
    const professor = this.professorDAO.buscarPorId(id);
    if (!professor) {
      throw new Error('Professor não encontrado.');
    }
    return professor;
  }
}