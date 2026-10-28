
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  MdArrowBack,
  MdCalendarToday,
  MdMenuBook,
  MdOutlineSchool,
  MdUndo,
} from "react-icons/md";
import Sidebar from "../../components/Sidebar";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";
import Paginacao from "../../components/Paginacao";
import ToastFeedback from "../../components/ToastFeedback";
import ListaItensEmprestimo from "../../components/emprestimo/listaItensEmprestimo";
import { formatarData } from "../../components/emprestimo/listaEmprestimo";
import { EmprestimoDetalhe } from "../../types/emprestimo";

const ITENS_POR_PAGINA = 10;

export default function DetalhesEmprestimo() {
  const router = useRouter();

  const id = Number(router.query.id);

  const [emprestimo, setEmprestimo] =
    useState<EmprestimoDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");

  const [termoBusca, setTermoBusca] = useState("");
  const [ordenacao, setOrdenacao] =
    useState<TipoOrdenacao>("alfabetica");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const fecharFeedback = useCallback(() => setFeedback(""), []);
  const fecharErro = useCallback(() => setErro(""), []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca]);

  useEffect(() => {
    if (!router.isReady) return;

    if (!Number.isSafeInteger(id) || id <= 0) {
      setErro("ID do empréstimo inválido.");
      setEmprestimo(null);
      setCarregando(false);
      return;
    }

    let cancelado = false;

    async function carregarEmprestimo() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await window.ipc.emprestimo.buscarPorId(id);

        if (cancelado) return;

        if (resposta?.success && resposta.data) {
          setEmprestimo(resposta.data);
        } else {
          setEmprestimo(null);
          setErro(
            resposta?.error || "Não foi possível carregar o empréstimo."
          );
        }
      } catch (error) {
        if (cancelado) return;

        console.error("Erro ao carregar empréstimo:", error);
        setEmprestimo(null);
        setErro("Não foi possível carregar o empréstimo.");
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    carregarEmprestimo();

    return () => {
      cancelado = true;
    };
  }, [router.isReady, id]);

  const termo = termoBusca.trim().toLocaleLowerCase("pt-BR");

  const itensFiltrados = (emprestimo?.itens ?? []).filter(
    (item) =>
      !termo ||
      item.livroTitulo.toLocaleLowerCase("pt-BR").includes(termo) ||
      item.editora.toLocaleLowerCase("pt-BR").includes(termo)
  );

  const itensExibidos = [...itensFiltrados].sort((a, b) => {
    if (ordenacao === "recentes") {
      return (b.id ?? 0) - (a.id ?? 0);
    }

    return (a.livroTitulo || "").localeCompare(
      b.livroTitulo || "",
      "pt-BR"
    );
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(itensExibidos.length / ITENS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;

  const itensPaginados = itensExibidos.slice(
    inicio,
    inicio + ITENS_POR_PAGINA
  );

  const exemplaresPendentes =
    emprestimo?.status === "PENDENTE"
      ? (emprestimo.itens ?? [])
          .filter((item) => item.status === "PENDENTE")
          .reduce((total, item) => total + item.quantidadeEmprestada, 0)
      : 0;

  const devolverTodosDesabilitado =
    emprestimo?.status !== "PENDENTE" ||exemplaresPendentes === 0;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 min-w-0 px-8 pt-6 pb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Detalhes do empréstimo
          </h1>

          <button
            type="button"
            onClick={() => router.push("/emprestimo")}
            className="h-11 px-6 flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-medium text-sm hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer shrink-0 active:scale-95"
          >
            <MdArrowBack size={18} />
            Voltar
          </button>
        </div>

        <ToastFeedback
          mensagem={feedback}
          tipo="sucesso"
          onClose={fecharFeedback}
        />

        <ToastFeedback
          mensagem={erro}
          tipo="erro"
          onClose={fecharErro}
        />

        {carregando ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">
              Carregando empréstimo...
            </p>
          </div>
        ) : !emprestimo ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">
              {erro || "Empréstimo não encontrado."}
            </p>
          </div>
        ) : (
          <>
            {/* Cabeçalho do empréstimo */}
            <section className="flex flex-wrap items-start justify-between gap-3 bg-[#ebf5ed] rounded-2xl px-6 py-5 mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#23582c]">
                  Prof. {emprestimo.professorNome}
                </h2>

                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-[#4a9a5a]">
                  <span className="flex items-center gap-1.5">
                    <MdCalendarToday size={16} />
                    Retirada: {formatarData(  
                      emprestimo.dataRetirada instanceof Date
                      ? emprestimo.dataRetirada.toISOString()
                      : emprestimo.dataRetirada
                    )}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <MdMenuBook size={16} />
                    {emprestimo.quantidadeExemplares}{" "}
                    {emprestimo.quantidadeExemplares === 1
                      ? "exemplar"
                      : "exemplares"}
                  </span>
                </p>
              </div>

              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-[#D3E8D6] text-sm font-medium text-[#23582c]">
                <MdOutlineSchool size={18} />
                {emprestimo.turmaNome}
              </span>
            </section>

            {/* Busca e botão visual de devolver todos */}
            <div className="flex items-center gap-4 mb-4 w-full">
              <SearchBar
                placeholder="Pesquisar por título ou editora..."
                valorBusca={termoBusca}
                onChangeBusca={setTermoBusca}
                ordenacao={ordenacao}
                onChangeOrdenacao={setOrdenacao}
              />

              <button
                type="button"
                disabled={devolverTodosDesabilitado}
                className={`h-11 px-6 flex items-center justify-center rounded-xl font-medium text-sm whitespace-nowrap gap-2 shrink-0 ${
                  devolverTodosDesabilitado
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#2e8b45] text-white shadow-sm"
                }`}
              >
                <MdUndo size={18} />
                Devolver todos
              </button>
            </div>

            {itensExibidos.length === 0 ? (
              <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
                <p className="text-base font-medium">
                  {termoBusca.trim()
                    ? `Nenhum livro encontrado para "${termoBusca}".`
                    : "Este empréstimo não possui livros."}
                </p>
              </div>
            ) : (
              <div
                key={`${termoBusca}-${ordenacao}-${paginaAtual}`}
                className="animate-fade-in duration-300"
              >
                <ListaItensEmprestimo 
                  itens={itensPaginados} 
                  statusEmprestimo={emprestimo.status} 
                />

                <Paginacao
                  paginaAtual={paginaAtual}
                  totalItens={itensExibidos.length}
                  totalBalao={exemplaresPendentes}
                  itensPorPagina={ITENS_POR_PAGINA}
                  nomeEntidade="exemplares pendentes"
                  nomeEntidadeSingular="exemplar pendente"
                  aoMudarPagina={setPaginaAtual}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
