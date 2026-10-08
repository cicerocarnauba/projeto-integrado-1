import { Livro } from '../entities/Livro.ts';
import { LivroDAO } from '../daos/LivroDAO.ts';

export interface CadastrarLivroInput {
  titulo: string;
  editora: string;
  quantidadeTotal: number;
}

export interface ConsultarLivroInput {
  titulo?: string;
  editora?: string;
  termo?: string;
  incluirInativos?: boolean;
}

export interface EditarLivroInput {
  id: number;
  titulo: string;
  editora: string;
  quantidadeTotal: number;
}

export interface LivroConsultaDTO {
  id: number | null;
  titulo: string;
  editora: string;
  quantidadeTotal: number;
  quantidadeEmprestada: number;
  saldoDisponivel: number;
  status: 'ATIVO' | 'INATIVO';
  dataCadastro: Date;
  dataAtualizacao: Date;
  possuiHistorico: boolean;
}

export interface ResultadoExclusaoLivroDTO {
  acao: 'EXCLUIDO' | 'DESATIVADO';
  mensagem: string;
  id: number;
  livro?: LivroConsultaDTO;
}

export interface DesativarLivroDTO {
  mensagem: string;
  livro: LivroConsultaDTO;
}

export interface AtivarLivroDTO {
  mensagem: string;
  livro: LivroConsultaDTO;
}

// GRASP Controller: ponto de entrada das operações de Livro

// GRASP Creator: é quem cria instâncias de Livro
export class LivroController {
  constructor(private livroDAO: LivroDAO) {}

  /**
   * RF01 — Cadastrar Livro
   * Regras aplicadas:
   *  - Campos obrigatórios e quantidade total maior que zero (RN03, RNF03)
   *  - RN06: unicidade por combinação de Título e Editora (comparando com Ativos ou Inativos)
   */
  public cadastrar(input: CadastrarLivroInput): Livro {
    const livro = new Livro({
      titulo: input.titulo,
      editora: input.editora,
      quantidadeTotal: input.quantidadeTotal,
    });

    // Validações da entidade (Information Expert)
    livro.validarCamposObrigatorios();

    // RN06: Checagem amigável de unicidade no acervo.
    // Usa os valores normalizados (lowercase + trim) da entidade para garantir
    // case-insensitivity completa mesmo com caracteres acentuados, que o
    // LOWER() do SQLite não trata (RNF04).
    if (this.livroDAO.buscarPorTituloEEditora(livro.getTituloNormalizado(), livro.getEditoraNormalizada())) {
      throw new Error(
        'Já existe um livro cadastrado com este título e editora. Informe um título ou editora diferente.'
      );
    }

    // Rede de segurança contra race condition: mapeia o erro técnico do SQLite (UNIQUE constraint)
    // para uma mensagem amigável ao usuário (RNF03).
    try {
      return this.livroDAO.inserir(livro);
    } catch (error) {
      const msg = (error as Error).message ?? '';
      if (msg.includes('UNIQUE constraint failed')) {
        throw new Error(
          'Já existe um livro cadastrado com este título e editora. Informe um título ou editora diferente.'
        );
      }
      throw error;
    }
  }

  /**
   * RF04 — Consultar Livro
   * - Retorna a listagem dos livros de acordo com os filtros informados (título, editora ou termo geral).
   * - Por padrão retorna apenas livros ATIVOS. Se `incluirInativos: true`, inclui também INATIVOS (RN04).
   * - Inclui o cálculo do saldo disponível em cada livro (RN03: saldo = quantidadeTotal - quantidadeEmprestada).
   * - Buscas tratam equivalência ignorando caixa e espaços extras (RNF04).
   */
  public consultar(input?: ConsultarLivroInput): LivroConsultaDTO[] {
    const filtro = input ?? {};
    const livros = this.livroDAO.consultar({
      titulo: filtro.titulo,
      editora: filtro.editora,
      termo: filtro.termo,
      incluirInativos: filtro.incluirInativos,
    });

    return livros.map((livro) => this.toDTO(livro));
  }

  /**
   * RF02 — Editar Livro
   * Regras aplicadas:
   *  - Só permite editar livro existente e com status "Ativo".
   *  - Valida unicidade Título + Editora na edição (RN06) — não pode coincidir com outro livro ("Ativo" ou "Inativo").
   *  - Valida regra: nova quantidade não pode ser inferior à quantidade emprestada no momento da edição (RN03).
   *  - Valida regra: se a quantidade total for reduzida a exatamente zero, muda o status para "Inativo" automaticamente (RN03).
   */
  public editar(input: EditarLivroInput): LivroConsultaDTO {
    if (!input.id || !Number.isInteger(input.id)) {
      throw new Error('ID do livro inválido para edição.');
    }

    const livro = this.livroDAO.buscarPorId(input.id);
    if (!livro) {
      throw new Error('Livro não encontrado no acervo.');
    }

    // Regra: só permite editar livro com status "Ativo"
    if (livro.status !== 'ATIVO') {
      throw new Error(
        'Apenas livros com status "Ativo" podem ser editados. Livros inativos precisam ser reativados primeiro.'
      );
    }

    // Regra: unicidade Título + Editora na edição (RN06)
    // Verifica se já existe outro livro cadastrado com o mesmo título e editora (ativo ou inativo),
    // ignorando o próprio livro que está sendo editado.
    const tituloNorm = (input.titulo ?? '').trim().toLowerCase();
    const editoraNorm = (input.editora ?? '').trim().toLowerCase();
    const livroExistente = this.livroDAO.buscarPorTituloEEditora(tituloNorm, editoraNorm);

    if (livroExistente && livroExistente.id !== livro.id) {
      throw new Error(
        'Já existe outro livro cadastrado com este título e editora. Informe um título ou editora diferente.'
      );
    }

    // Aplica alterações e validações na entidade (Information Expert)
    livro.editar({
      titulo: input.titulo,
      editora: input.editora,
      quantidadeTotal: input.quantidadeTotal,
    });

    // Rede de segurança contra race condition no SQLite (RNF03)
    try {
      this.livroDAO.atualizar(livro);
    } catch (error) {
      const msg = (error as Error).message ?? '';
      if (msg.includes('UNIQUE constraint failed')) {
        throw new Error(
          'Já existe outro livro cadastrado com este título e editora. Informe um título ou editora diferente.'
        );
      }
      throw error;
    }

    return this.toDTO(livro);
  }

  /**
   * RF03 / RN04 — Excluir Livro
   * Regras aplicadas:
   *  - A bibliotecária pede para excluir um livro; a regra de negócio decide sozinha entre Exclusão e Desativação.
   *  - Se a entidade NÃO possui histórico de empréstimos, a desativação não é permitida,
   *    devendo ser realizada a exclusão definitiva do banco de dados (DELETE).
   *  - Se JÁ EXISTE histórico de empréstimos, o sistema realiza a desativação (status muda para "Inativo")
   *    em vez de excluir, para preservar a rastreabilidade dos empréstimos antigos.
   *  - Caso o livro não seja encontrado, rejeita com mensagem clara (RNF03).
   */
  public excluir(id: number): ResultadoExclusaoLivroDTO {
    if (!id || !Number.isInteger(id) || id <= 0) {
      throw new Error('ID do livro inválido para exclusão.');
    }

    const livro = this.livroDAO.buscarPorId(id);
    if (!livro) {
      throw new Error('Livro não encontrado no acervo.');
    }

    const temHistorico = this.livroDAO.possuiHistoricoEmprestimos(id);

    if (!temHistorico) {
      // Sem histórico de empréstimos: exclusão definitiva obrigatória (DELETE)
      this.livroDAO.excluir(id);
      return {
        acao: 'EXCLUIDO',
        mensagem: 'Livro excluído com sucesso do acervo.',
        id,
      };
    }

    // Com histórico de empréstimos: desativação lógica (status = 'INATIVO')
    livro.desativar();
    this.livroDAO.atualizar(livro);

    return {
      acao: 'DESATIVADO',
      mensagem: 'Livro possui histórico de empréstimos e foi desativado para preservar os registros.',
      id,
      livro: this.toDTO(livro),
    };
  }

  /**
   * HU04 / RN04 — Desativar Livro Manualmente
   * Regras aplicadas:
   *  - Só é possível desativar um livro com status "Ativo" (Conversa da HU04).
   *  - A desativação NÃO depende de o livro ter ou não histórico — diferente da exclusão.
   *  - Bloqueada se houver algum empréstimo com status "Pendente" associado ao livro.
   *  - O livro passa a ter status "Inativo" e não aparece nas operações do dia a dia,
   *    mas permanece consultável no histórico (RF04 com incluirInativos: true).
   */
  public desativar(id: number): DesativarLivroDTO {
    if (!id || !Number.isInteger(id) || id <= 0) {
      throw new Error('ID do livro inválido para desativação.');
    }

    const livro = this.livroDAO.buscarPorId(id);
    if (!livro) {
      throw new Error('Livro não encontrado no acervo.');
    }

    if (livro.status !== 'ATIVO') {
      throw new Error('Apenas livros com status "Ativo" podem ser desativados.');
    }

    if (this.livroDAO.possuiEmprestimoPendente(id)) {
      throw new Error(
        'Não é possível desativar este livro, pois ele possui empréstimos pendentes.'
      );
    }

    livro.desativar();
    this.livroDAO.atualizar(livro);

    return {
      mensagem: 'Livro desativado com sucesso.',
      livro: this.toDTO(livro),
    };
  }

  /**
   * HU05 — Ativar Livro
   * Regras aplicadas:
   *  - Só é possível ativar um livro com status "Inativo".
   *  - O status muda para "Ativo" com a nova quantidade informada.
   *  - Caso o livro não seja encontrado, rejeita com mensagem clara (RNF03).
   */
  public ativar(id: number, quantidadeTotal: number): AtivarLivroDTO {
    if (!id || !Number.isInteger(id) || id <= 0) {
      throw new Error('ID do livro inválido para ativação.');
    }

    if (
      quantidadeTotal === undefined ||
      quantidadeTotal === null ||
      typeof quantidadeTotal !== 'number' ||
      isNaN(quantidadeTotal)
    ) {
      throw new Error('Informe a nova quantidade de exemplares para ativar o livro.');
    }

    if (!Number.isInteger(quantidadeTotal) || quantidadeTotal <= 0) {
      throw new Error('A quantidade deve ser um número inteiro maior que zero.');
    }

    const livro = this.livroDAO.buscarPorId(id);
    if (!livro) {
      throw new Error('Livro não encontrado no acervo.');
    }

    if (livro.status === 'ATIVO') {
      throw new Error('Este livro já está ativo.');
    }

    livro.ativar(quantidadeTotal);
    this.livroDAO.atualizar(livro);

    return {
      mensagem: 'Livro ativado com sucesso.',
      livro: this.toDTO(livro),
    };
  }

  /**
   * Monta o DTO do livro, incluindo `possuiHistorico` (usado pelo front
   * para decidir entre habilitar "Desativar" ou "Excluir").
   */
  private toDTO(livro: Livro): LivroConsultaDTO {
    return {
      id: livro.id,
      titulo: livro.titulo,
      editora: livro.editora,
      quantidadeTotal: livro.quantidadeTotal,
      quantidadeEmprestada: livro.quantidadeEmprestada,
      saldoDisponivel: livro.getSaldoDisponivel(),
      status: livro.status,
      dataCadastro: livro.dataCadastro,
      dataAtualizacao: livro.dataAtualizacao,
      possuiHistorico:
        livro.id !== null &&
        this.livroDAO.possuiHistoricoEmprestimos(livro.id),
    };
  }
}
