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
   *
   * Regras de negócio:
   * 1. A turma precisa existir.
   * 2. Só é possível editar turma com status "ATIVO" (uma turma inativa
   *    precisa passar pela ativação primeiro).
   * 3. O nome é validado (não pode ser vazio).
   * 4. O novo nome deve respeitar a unicidade (RN07): não pode coincidir
   *    com o nome de outra turma (ativa ou inativa).
   *
   * Relações: [RF14], [RN07], [RNF03]
   */
  public editar(id: number, input: EditarTurmaInput): Turma {
    // 1. Busca a turma
    const turma = this.turmaDAO.buscarPorId(id);
    if (!turma) {
      throw new Error('Turma não encontrada.');
    }

    // 2. Só permite editar turma ATIVA
    if (turma.status !== 'ATIVO') {
      throw new Error(
        'Não é possível editar uma turma inativa. Ative o cadastro antes de editá-la.'
      );
    }

    // 3. Valida os campos informados (reutiliza a entidade)
    const dadosAtualizados = new Turma({
      nome: input.nome,
      status: turma.status,
      dataCadastro: turma.dataCadastro,
    });
    dadosAtualizados.validarCamposObrigatorios();

    // 4. Se o nome foi alterado, valida a unicidade (RN07)
    const nomeNormalizado = dadosAtualizados.getNomeNormalizado();
    if (nomeNormalizado !== turma.getNomeNormalizado()) {
      const turmaComMesmoNome = this.turmaDAO.buscarPorNome(input.nome);
      if (turmaComMesmoNome && turmaComMesmoNome.id !== turma.id) {
        throw new Error(
          'Já existe uma turma cadastrada com esse nome. Informe um nome diferente.'
        );
      }
    }

    // 5. Atualiza o nome da entidade e persiste
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
}