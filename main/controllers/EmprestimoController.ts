import { Emprestimo } from '../entities/Emprestimo.ts';
import { ItemEmprestimo } from '../entities/ItemEmprestimo.ts';
import { EmprestimoDAO } from '../daos/EmprestimoDAO.ts';
import { LivroDAO } from '../daos/LivroDAO.ts';
import { ProfessorDAO } from '../daos/ProfessorDAO.ts';
import { TurmaDAO } from '../daos/TurmaDAO.ts';

export interface RealizarEmprestimoInput {
  professorId: number;
  turmaId: number;
  itens: Array<{ livroId: number; quantidade: number }>;
}

// GRASP Controller: ponto de entrada da operação de realizar empréstimo
export class EmprestimoController {
  constructor(
    private emprestimoDAO: EmprestimoDAO,
    private livroDAO: LivroDAO,
    private professorDAO: ProfessorDAO,
    private turmaDAO: TurmaDAO
  ) {}

  /**
   * HU19 — Realizar Empréstimo
   *
   * Regras de negócio:
   * 1. O professor precisa existir e estar ATIVO.
   * 2. A turma precisa existir e estar ATIVA.
   * 3. Cada livro precisa existir e estar ATIVO.
   * 4. A quantidade solicitada de cada livro não pode exceder o saldo disponível.
   * 5. A data de retirada é a data atual do sistema (não editável).
   * 6. O empréstimo é criado com status PENDENTE.
   * 7. Ao registrar, o saldo disponível de cada livro é reduzido
   *    (quantidade_emprestada é incrementada).
   *
   * Relações: [RF20], [RN01], [RN02], [RN03], [RNF03]
   */
  public realizar(input: RealizarEmprestimoInput): Emprestimo {
    // 1. Valida o professor
    const professor = this.professorDAO.buscarPorId(input.professorId);
    if (!professor) {
      throw new Error('Professor não encontrado.');
    }
    if (professor.status !== 'ATIVO') {
      throw new Error('Não é possível realizar empréstimo para um professor inativo.');
    }

    // 2. Valida a turma
    const turma = this.turmaDAO.buscarPorId(input.turmaId);
    if (!turma) {
      throw new Error('Turma não encontrada.');
    }
    if (turma.status !== 'ATIVO') {
      throw new Error('Não é possível realizar empréstimo para uma turma inativa.');
    }

    // 3. Valida se há pelo menos um item
    if (!input.itens || input.itens.length === 0) {
      throw new Error('É necessário informar pelo menos um livro para o empréstimo.');
    }

    // 4. Valida cada item (livro existe, está ATIVO e tem saldo suficiente)
    const itens: ItemEmprestimo[] = [];

    for (const itemInput of input.itens) {
      const livro = this.livroDAO.buscarPorId(itemInput.livroId);
      if (!livro) {
        throw new Error(`Livro não encontrado (ID ${itemInput.livroId}).`);
      }
      if (livro.status !== 'ATIVO') {
        throw new Error(`O livro "${livro.titulo}" está inativo e não pode ser emprestado.`);
      }
      if (!Number.isInteger(itemInput.quantidade) || itemInput.quantidade <= 0) {
        throw new Error(`A quantidade do livro "${livro.titulo}" deve ser um número inteiro maior que zero.`);
      }

      const saldo = livro.getSaldoDisponivel();
      if (itemInput.quantidade > saldo) {
        throw new Error(
          `Estoque insuficiente para o livro "${livro.titulo}". Saldo disponível: ${saldo}, solicitado: ${itemInput.quantidade}.`
        );
      }

      itens.push(
        new ItemEmprestimo({
          livroId: itemInput.livroId,
          quantidadeRetirada: itemInput.quantidade,
        })
      );
    }

    // 5. Cria o empréstimo com a data atual
    const emprestimo = new Emprestimo({
      professorId: input.professorId,
      turmaId: input.turmaId,
      dataRetirada: new Date(),
      status: 'PENDENTE',
      itens,
    });

    // 6. Persiste o empréstimo e os itens (transação atômica)
    const emprestimoSalvo = this.emprestimoDAO.inserir(emprestimo);

    // 7. Atualiza o saldo de cada livro (incrementa quantidade_emprestada)
    for (const item of emprestimoSalvo.itens) {
      this.livroDAO.incrementarEmprestada(item.livroId, item.quantidadeRetirada);
    }

    return emprestimoSalvo;
  }
}