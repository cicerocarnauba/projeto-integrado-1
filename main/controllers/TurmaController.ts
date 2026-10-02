import { Turma } from '../entities/Turma.ts';
import { TurmaDAO } from '../daos/TurmaDAO.ts';

export interface CadastrarTurmaInput {
  nome: string;
}

export interface ConsultarTurmaInput {
  nome?: string;
  incluirInativos?: boolean;
}

export interface EditarTurmaInput {
  nome: string;
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
   */
  public ativar(id: number): Turma {
    const turma = this.turmaDAO.buscarPorId(id);
    if (!turma) {
      throw new Error('Turma não encontrada.');
    }

    if (turma.status === 'ATIVO') {
      throw new Error('Esta turma já está ativa.');
    }

    turma.ativar();
    this.turmaDAO.atualizarStatus(id, 'ATIVO');

    return turma;
  }

  /**
   * HU14 — Editar Turma
   */
  public editar(id: number, input: EditarTurmaInput): Turma {
    const turma = this.turmaDAO.buscarPorId(id);
    if (!turma) {
      throw new Error('Turma não encontrada.');
    }

    if (turma.status !== 'ATIVO') {
      throw new Error(
        'Não é possível editar uma turma inativa. Ative o cadastro antes de editá-la.'
      );
    }

    const dadosAtualizados = new Turma({
      nome: input.nome,
      status: turma.status,
      dataCadastro: turma.dataCadastro,
    });
    dadosAtualizados.validarCamposObrigatorios();

    const nomeNormalizado = dadosAtualizados.getNomeNormalizado();
    if (nomeNormalizado !== turma.getNomeNormalizado()) {
      const turmaComMesmoNome = this.turmaDAO.buscarPorNome(input.nome);
      if (turmaComMesmoNome && turmaComMesmoNome.id !== turma.id) {
        throw new Error(
          'Já existe uma turma cadastrada com esse nome. Informe um nome diferente.'
        );
      }
    }

    turma.atualizarNome(input.nome);

    try {
      this.turmaDAO.atualizar(turma);
    } catch (error) {
      const msg = (error as Error).message ?? '';
      if (msg.includes('UNIQUE constraint failed')) {
        throw new Error(
          'Já existe uma turma cadastrada com esse nome. Informe um nome diferente.'
        );
      }
      throw error;
    }

    return turma;
  }

  /**
   * HU17 — Desativar Turma
   *
   * Regras de negócio:
   * 1. A turma precisa existir.
   * 2. Só faz sentido desativar uma turma com status "ATIVO".
   * 3. A operação é bloqueada se houver empréstimo "Pendente" associado.
   * 4. A desativação só é permitida se a turma possuir histórico de
   *    empréstimos. Se NÃO possuir histórico, apenas a exclusão definitiva
   *    é possível.
   * 5. O status muda para "INATIVO" e a turma deixa de aparecer nas
   *    operações do dia a dia, mas permanece visível no histórico.
   *
   * Relações: [RF17], [RN04], [RNF03]
   */
  public desativar(id: number): Turma {
    // 1. Busca a turma
    const turma = this.turmaDAO.buscarPorId(id);
    if (!turma) {
      throw new Error('Turma não encontrada.');
    }

    // 2. Só permite desativar quem está ATIVO
    if (turma.status !== 'ATIVO') {
      throw new Error('Esta turma já está inativa.');
    }

    // 3. Bloqueia se houver empréstimo pendente
    if (this.turmaDAO.possuiEmprestimoPendente(id)) {
      throw new Error(
        'Não é possível desativar esta turma, pois ela possui empréstimos pendentes.'
      );
    }

    // 4. Só permite desativar se houver histórico; caso contrário,
    //    a operação correta é a exclusão definitiva.
    if (!this.turmaDAO.possuiHistoricoEmprestimos(id)) {
      throw new Error(
        'Esta turma não possui histórico de empréstimos. Utilize a opção "Excluir" para removê-la definitivamente.'
      );
    }

    // 5. Desativa
    turma.inativar();
    this.turmaDAO.atualizarStatus(id, 'INATIVO');

    return turma;
  }
}