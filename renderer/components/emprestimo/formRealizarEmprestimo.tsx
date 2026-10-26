import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdAdd, MdCheck, MdClear, MdDelete } from "react-icons/md";
import { Professor } from "../../types/professor";
import { Turma } from "../../types/turma";
import SelectPesquisavel from "./selectpesquisavel";
import ModalConfirmarEmprestimo from "../modal/modalConfirmarEmprestimo";

// Livro ativo disponível para empréstimo (vem de window.ipc.livro.consultar)
interface LivroOpcao {
  id: number;
  titulo: string;
  editora: string;
  saldoDisponivel: number;
}

// Item da lista "Livros selecionados"
export interface ItemSelecionado {
  livroId: number;
  titulo: string;
  editora: string;
  quantidade: number;
}

const inputBase =
  "w-full h-11 bg-white border border-[#cde5d3] rounded-xl px-4 text-sm text-gray-800 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60";

export default function FormRealizarEmprestimo() {
  const router = useRouter();

  const [professorId, setProfessorId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [livroId, setLivroId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [itens, setItens] = useState<ItemSelecionado[]>([]);
  const [avisoQuantidade, setAvisoQuantidade] = useState("");

  // Professores, turmas e livros ATIVOS (o consultar já ignora inativos por padrão)
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [livros, setLivros] = useState<LivroOpcao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroEnvio, setErroEnvio] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [modalRealizar, setModalRealizar] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);

  // A data do empréstimo é sempre a data atual do sistema (não editável).
  // Calculada no cliente para evitar diferença entre servidor e navegador.
  const [dataHoje, setDataHoje] = useState("");
  useEffect(() => {
    setDataHoje(new Date().toLocaleDateString("pt-BR"));
  }, []);

  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const [respProfessores, respTurmas, respLivros] = await Promise.all([
          window.ipc.professor.consultar({ incluirInativos: false }),
          window.ipc.turma.consultar({ incluirInativos: false }),
          window.ipc.livro.consultar({ incluirInativos: false }),
        ]);

        if (!respProfessores?.success || !Array.isArray(respProfessores.data)) {
          setErro(
            respProfessores?.error || "Não foi possível carregar os professores."
          );
          return;
        }

        if (!respTurmas?.success || !Array.isArray(respTurmas.data)) {
          setErro(respTurmas?.error || "Não foi possível carregar as turmas.");
          return;
        }

        if (!respLivros?.success || !Array.isArray(respLivros.data)) {
          setErro(respLivros?.error || "Não foi possível carregar os livros.");
          return;
        }

        setProfessores(respProfessores.data);
        setTurmas(respTurmas.data);
        setLivros(
          respLivros.data
            .filter((l) => l.id !== null)
            .map((l) => ({
              id: l.id as number,
              titulo: l.titulo,
              editora: l.editora,
              saldoDisponivel: l.saldoDisponivel,
            }))
        );
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do empréstimo."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarOpcoes();
  }, []);

  // --- Regras da seleção de livros -------------------------------------
  const livroSelecionado = livros.find((l) => String(l.id) === livroId);

  // Quanto desse livro já está na lista (adicionar o mesmo livro soma)
  const jaAdicionado =
    itens.find((i) => i.livroId === livroSelecionado?.id)?.quantidade ?? 0;

  // O que ainda pode ser adicionado sem passar do saldo disponível
  const restante = livroSelecionado
    ? livroSelecionado.saldoDisponivel - jaAdicionado
    : 0;

  const podeAdicionar =
    !!livroSelecionado &&
    restante >= 1 &&
    quantidade >= 1 &&
    quantidade <= restante;

  const podeConfirmar =
    professorId !== "" && turmaId !== "" && itens.length > 0;

  function selecionarLivro(valor: string) {
    setLivroId(valor);
    setQuantidade(1);
    setAvisoQuantidade("");
  }

  function incrementar() {
    if (!livroSelecionado || quantidade >= restante) return;
    setAvisoQuantidade("");
    setQuantidade((prev) => prev + 1);
  }

  function decrementar() {
    setAvisoQuantidade("");
    setQuantidade((prev) => Math.max(1, prev - 1));
  }

  function alterarQuantidade(valor: string) {
    const val = parseInt(valor, 10);

    if (isNaN(val) || val < 1) {
      setQuantidade(1);
      setAvisoQuantidade("");
      return;
    }

    // Quantidade solicitada maior que o saldo disponível
    if (livroSelecionado && val > restante) {
      setQuantidade(Math.max(1, restante));
      setAvisoQuantidade(
        `Quantidade solicitada maior que o saldo disponível de "${livroSelecionado.titulo}" (${restante}).`
      );
      return;
    }

    setAvisoQuantidade("");
    setQuantidade(val);
  }

  function adicionarLivro() {
    if (!livroSelecionado || !podeAdicionar) return;

    setItens((atual) => {
      const existe = atual.some((i) => i.livroId === livroSelecionado.id);

      if (existe) {
        return atual.map((i) =>
          i.livroId === livroSelecionado.id
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i
        );
      }

      return [
        ...atual,
        {
          livroId: livroSelecionado.id,
          titulo: livroSelecionado.titulo,
          editora: livroSelecionado.editora,
          quantidade,
        },
      ];
    });

    setLivroId("");
    setQuantidade(1);
    setAvisoQuantidade("");
  }

  function removerLivro(id: number) {
    setItens((atual) => atual.filter((i) => i.livroId !== id));
  }

  // Clicar em "Confirmar Empréstimo" só abre o popup; nada é enviado ainda
  function abrirModalRealizar(e: React.FormEvent) {
    e.preventDefault();
    setErroEnvio("");

    if (!podeConfirmar) return;

    setModalRealizar(true);
  }

  // Executada quando o usuário confirma no popup
  async function realizarEmprestimo() {
    setModalRealizar(false);
    setErroEnvio("");
    setSalvando(true);

    try {
      // Os selects devolvem texto; o backend exige IDs numéricos inteiros.
      // A data não é enviada: o backend usa a data atual do sistema.
      const resposta = await window.ipc.emprestimo.realizar({
        professorId: Number(professorId),
        turmaId: Number(turmaId),
        itens: itens.map((item) => ({
          livroId: item.livroId,
          quantidade: item.quantidade,
        })),
      });

      // Erros do backend (inclui "Estoque insuficiente para o livro ...")
      if (!resposta.success) {
        setErroEnvio(resposta.error || "Erro ao realizar o empréstimo.");
        return;
      }

      router.push("/emprestimo?sucesso=emprestimo_realizado");
    } catch (error) {
      setErroEnvio(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o empréstimo."
      );
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    router.push("/emprestimo");
  }

  return (
    <form
      noValidate
      onSubmit={abrirModalRealizar}
      className="w-full bg-[#eef7f0] rounded-2xl p-8 shadow-xs"
    >
      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {erro}
        </div>
      )}

      {/* Professor, turma e data */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-[#cde5d3]">
        <div className="md:col-span-5">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Professor <span className="text-red-500">*</span>
          </label>
          <SelectPesquisavel
            value={professorId}
            onChange={setProfessorId}
            disabled={carregando || salvando}
            placeholder={
              carregando
                ? "Carregando professores..."
                : professores.length === 0
                ? "Nenhum professor ativo cadastrado"
                : "Selecione o professor..."
            }
            mensagemVazia="Nenhum professor encontrado."
            opcoes={professores.map((p) => ({
              value: String(p.id),
              label: `${p.primeiroNome} ${p.sobrenome}`,
            }))}
          />
        </div>

        <div className="md:col-span-4">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Turma <span className="text-red-500">*</span>
          </label>
          <SelectPesquisavel
            value={turmaId}
            onChange={setTurmaId}
            disabled={carregando || salvando}
            placeholder={
              carregando
                ? "Carregando turmas..."
                : turmas.length === 0
                ? "Nenhuma turma ativa cadastrada"
                : "Selecione a turma..."
            }
            mensagemVazia="Nenhuma turma encontrada."
            opcoes={turmas.map((t) => ({
              value: String(t.id),
              label: t.nome,
            }))}
          />
        </div>

        <div className="md:col-span-3">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Data do Empréstimo
          </label>
          <input
            type="text"
            value={dataHoje}
            disabled
            readOnly
            className={`${inputBase} bg-[#f4faf5] text-gray-700 text-center`}
          />
        </div>
      </div>

      {/* Adicionar livros */}
      <div className="pt-6">
        <h2 className="text-sm font-bold text-[#1e582d] mb-3">
          Adicionar Livros ao Empréstimo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-6">
            <label className="text-xs font-semibold text-[#1e582d] mb-2 block">
              Livro
            </label>
            <SelectPesquisavel
              value={livroId}
              onChange={selecionarLivro}
              disabled={carregando || salvando}
              placeholder={
                carregando
                  ? "Carregando livros..."
                  : livros.length === 0
                  ? "Nenhum livro ativo cadastrado"
                  : "Selecione o livro..."
              }
              mensagemVazia="Nenhum livro encontrado."
              // A busca olha o texto da opção: título e editora
              opcoes={livros.map((l) => ({
                value: String(l.id),
                label: `${l.titulo} — ${l.editora}`,
                extra:
                  l.saldoDisponivel > 0
                    ? `Saldo: ${l.saldoDisponivel}`
                    : "Sem saldo",
                desabilitada: l.saldoDisponivel <= 0,
              }))}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-[#1e582d] mb-2 block">
              Quantidade
            </label>
            <div className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl p-1 flex items-center justify-between focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/20">
              <button
                type="button"
                onClick={decrementar}
                disabled={quantidade <= 1}
                className="w-8 h-8 rounded-lg bg-[#2e8b45] text-white hover:bg-[#236c35] disabled:opacity-40 disabled:hover:bg-[#2e8b45] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
              >
                −
              </button>

              <input
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) => alterarQuantidade(e.target.value)}
                className="w-10 text-center font-bold text-sm text-gray-800 outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                type="button"
                onClick={incrementar}
                disabled={!livroSelecionado || quantidade >= restante}
                className="w-8 h-8 rounded-lg bg-[#2e8b45] text-white hover:bg-[#236c35] disabled:opacity-40 disabled:hover:bg-[#2e8b45] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
              >
                +
              </button>
            </div>
          </div>

          <div className="md:col-span-4">
            <button
              type="button"
              onClick={adicionarLivro}
              disabled={!podeAdicionar}
              className="w-full h-11 flex items-center justify-center gap-1.5 whitespace-nowrap bg-[#2e8b45] hover:bg-[#236c35] text-white rounded-xl text-sm font-medium transition-all active:scale-95 cursor-pointer disabled:bg-[#9cc9a8] disabled:hover:bg-[#9cc9a8] disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              <MdAdd size={18} />
              Adicionar ao empréstimo
            </button>
          </div>
        </div>

        {/* Saldo do livro escolhido e aviso de quantidade acima do saldo */}
        {livroSelecionado && (
          <p className="mt-2 text-sm text-[#245B2F]">
            Saldo disponível:{" "}
            <span className="font-bold">{livroSelecionado.saldoDisponivel}</span>
            {jaAdicionado > 0 && (
              <span className="text-[#5AA365]">
                {" "}
                ({jaAdicionado} já na lista · restam {restante})
              </span>
            )}
          </p>
        )}

        {avisoQuantidade && (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {avisoQuantidade}
          </div>
        )}
      </div>

      {/* Livros selecionados */}
      <div className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#1e582d] mb-2">
          Livros selecionados ({itens.length})
        </p>

        <div className="w-full bg-[#f7fbf8] border border-[#cde5d3] rounded-xl">
          {itens.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[#5AA365]">
              Nenhum livro adicionado ao empréstimo ainda.
            </p>
          ) : (
            <ul className="divide-y divide-[#cde5d3]">
              {itens.map((item) => (
                <li
                  key={item.livroId}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1e582d] truncate">
                      {item.titulo}
                    </p>
                    <p className="text-xs text-[#5AA365] truncate">
                      Editora: {item.editora}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-bold text-gray-800">
                      {item.quantidade} {item.quantidade === 1 ? "ex." : "ex."}
                    </span>

                    <button
                      type="button"
                      onClick={() => removerLivro(item.livroId)}
                      aria-label={`Remover ${item.titulo}`}
                      className="w-8 h-8 rounded-lg text-[#cf4a4a] hover:bg-red-50 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {erroEnvio && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {erroEnvio}
        </div>
      )}

      {/* Ações */}
      <div className="flex justify-end items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => setModalCancelar(true)}
          disabled={salvando}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-[#cf4a4a] hover:bg-red-600 transition-colors shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdClear size={18} />
          Cancelar
        </button>

        <button
          type="submit"
          disabled={!podeConfirmar || salvando}
          className="flex items-center gap-1.5 bg-[#2e8b45] hover:bg-[#236c35] text-white px-7 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer disabled:bg-[#9cc9a8] disabled:hover:bg-[#9cc9a8] disabled:active:scale-100 disabled:cursor-not-allowed"
        >
          <MdCheck size={18} />
          {salvando ? "Confirmando..." : "Confirmar Empréstimo"}
        </button>
      </div>

      <ModalConfirmarEmprestimo
        aberto={modalRealizar}
        titulo="Realizar empréstimo?"
        mensagem={
          <>
            Tem certeza que deseja <strong>realizar</strong> o empréstimo dos
            exemplares dos livros selecionados?
          </>
        }
        textoCancelar="Cancelar"
        textoConfirmar="Confirmar"
        onCancelar={() => setModalRealizar(false)}
        onConfirmar={realizarEmprestimo}
      />

      <ModalConfirmarEmprestimo
        aberto={modalCancelar}
        titulo="Cancelar empréstimo?"
        mensagem={
          <>
            Tem certeza que deseja <strong>cancelar</strong> o empréstimo dos
            exemplares dos livros selecionados?
          </>
        }
        textoCancelar="Não"
        textoConfirmar="Sim"
        onCancelar={() => setModalCancelar(false)}
        onConfirmar={cancelar}
      />
    </form>
  );
}
