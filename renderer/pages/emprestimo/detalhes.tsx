
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  MdArrowBack,
  MdCalendarToday,
  MdMenuBook,
  MdOutlineSchool,
  MdUndo,
} from "react-icons/md";
import PageShell from "../../components/PageShell";
import EstadoLista from "../../components/EstadoLista";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";
import Paginacao from "../../components/Paginacao";
import { useItensPorPagina } from "../../hooks/useItensPorPagina";
import ToastFeedback from "../../components/ToastFeedback";
import ListaItensEmprestimo from "../../components/emprestimo/listaItensEmprestimo";
import ModalDevolverExemplares from "../../components/modal/modalDevolverExemplares";
import { formatarData } from "../../components/emprestimo/listaEmprestimo";
import { EmprestimoDetalhe, ItemEmprestimo } from "../../types/emprestimo";
import { calcularPendente } from "../../utils/emprestimoItem";
import ModalDevolverTodos from "../../components/modal/modalDevolverTodosEmprestimo";

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

  // Devolução de exemplares (modal)
  const [itemParaDevolver, setItemParaDevolver] =
    useState<ItemEmprestimo | null>(null);
  const [salvandoDevolucao, setSalvandoDevolucao] = useState(false);
  const [erroDevolucao, setErroDevolucao] = useState("");

  const [modalDevolverTodosAberto, setModalDevolverTodosAberto] = useState(false);
  const [salvandoDevolverTodos, setSalvandoDevolverTodos] = useState(false);
  const [erroDevolverTodos, setErroDevolverTodos] = useState("");

  const fecharFeedback = useCallback(() => setFeedback(""), []);
  const fecharErro = useCallback(() => setErro(""), []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca]);

  // Aviso vindo da tela de avaria (?sucesso=avaria_registrada).
  // Limpa o parâmetro da URL para não reaparecer ao recarregar a página.
  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.sucesso === "avaria_registrada") {
      setFeedback("Avaria registrada com sucesso!");
      router.replace(`/emprestimo/detalhes?id=${id}`, undefined, {
        shallow: true,
      });
    }
  }, [router.isReady, router.query.sucesso, id]);

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

  function abrirDevolucao(item: ItemEmprestimo) {
    setErroDevolucao("");
    setItemParaDevolver(item);
  }

  function fecharDevolucao() {
    if (salvandoDevolucao) return;
    setErroDevolucao("");
    setItemParaDevolver(null);
  }

  async function recarregarEmprestimo(idEmprestimo: number, mensagemPadrao: string) {
    const atualizado = await window.ipc.emprestimo.buscarPorId(idEmprestimo);

    if (atualizado?.success && atualizado.data) {
      setEmprestimo(atualizado.data);
      setFeedback(
        atualizado.data.status === "CONCLUIDO"
          ? "Todos os exemplares foram devolvidos. Empréstimo concluído e movido para o histórico!"
          : mensagemPadrao
      );
    } else {
      setErro(
        "Devolução registrada, mas não foi possível atualizar a tela. Recarregue a página."
      );
    }
  }

  function abrirDevolverTodos() {
    setErroDevolverTodos("");
    setModalDevolverTodosAberto(true);
  }

  function fecharDevolverTodos() {
    if (salvandoDevolverTodos) return;
    setModalDevolverTodosAberto(false);
  }

  async function confirmarDevolverTodos() {
    if (!emprestimo) return;

    setErroDevolverTodos("");
    setSalvandoDevolverTodos(true);

    try {
      const pendentes = (emprestimo.itens ?? []).filter(
        (item) => item.status === "PENDENTE" && calcularPendente(item) > 0
      );

      // Sequencial (e não Promise.all) para evitar condição de corrida
      // na conclusão automática do empréstimo no back.
      for (const item of pendentes) {
        const resposta = await window.ipc.emprestimo.devolverItem(
          emprestimo.id,
          item.id,
          { quantidadeDevolvida: calcularPendente(item) }
        );

        if (!resposta?.success) {
          // Atualiza a tela para refletir o que já foi devolvido antes da falha
          await recarregarEmprestimo(emprestimo.id, "Devolução parcial realizada.");
          setErroDevolverTodos(
            `Falha ao devolver "${item.livroTitulo}": ${
              resposta?.error || "erro desconhecido"
            }`
          );
          return;
        }
      }

      setModalDevolverTodosAberto(false);
      await recarregarEmprestimo(
        emprestimo.id,
        "Todos os exemplares devolvidos com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao devolver todos:", error);
      setErroDevolverTodos(
        error instanceof Error
          ? error.message
          : "Não foi possível devolver os exemplares."
      );
    } finally {
      setSalvandoDevolverTodos(false);
    }
  }

  async function confirmarDevolucao(quantidade: number) {
    if (!itemParaDevolver || !emprestimo) return;

    setErroDevolucao("");
    setSalvandoDevolucao(true);

    try {
      const resposta = await window.ipc.emprestimo.devolverItem(
        emprestimo.id,
        itemParaDevolver.id,
        { quantidadeDevolvida: quantidade }
      );

      // Erros de regra do back (quantidade acima do pendente, item já baixado etc.)
      // aparecem dentro do próprio modal.
      if (!resposta?.success) {
        setErroDevolucao(
          resposta?.error || "Não foi possível registrar a devolução."
        );
        return;
      }

      const devolucaoTotal = resposta.data?.quantidadePendente === 0;

      setItemParaDevolver(null);

      await recarregarEmprestimo(
        emprestimo.id,
        devolucaoTotal
          ? "Devolução total do item registrada com sucesso!"
          : "Devolução parcial registrada com sucesso!"
      );

    } catch (error) {
      console.error("Erro ao registrar devolução:", error);
      setErroDevolucao(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a devolução."
      );
    } finally {
      setSalvandoDevolucao(false);
    }
  }

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

  const containerListaRef = useRef<HTMLDivElement>(null);
  const itensPorPagina = useItensPorPagina({
    containerRef: containerListaRef,
    alturaFixa: 330,
    alturaLinha: 58,
    alturaLinhaCompacta: 58,
    breakpointCompacto: 1536,
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(itensExibidos.length / itensPorPagina)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const inicio = (paginaAtual - 1) * itensPorPagina;

  const itensPaginados = itensExibidos.slice(
    inicio,
    inicio + itensPorPagina
  );

  const exemplaresPendentes =
    emprestimo?.status === "PENDENTE"
      ? (emprestimo.itens ?? [])
          .filter((item) => item.status === "PENDENTE")
          .reduce((total, item) => total + calcularPendente(item), 0)
      : 0;

  const devolverTodosDesabilitado =
    emprestimo?.status !== "PENDENTE" || exemplaresPendentes === 0;

  return (
    <PageShell
      titulo="Detalhes do empréstimo"
      acaoTopo={
        <button
          type="button"
          onClick={() => router.push("/emprestimo")}
          className="h-10 xl:h-11 px-4 xl:px-5 inline-flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-semibold text-sm xl:text-base hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer shrink-0 active:scale-95"
        >
          <MdArrowBack size={19} />
          Voltar
        </button>
      }
    >
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
        <div ref={containerListaRef} className="flex-1 min-h-0 flex flex-col">
          <EstadoLista mensagem="Carregando empréstimo..." />
        </div>
      ) : !emprestimo ? (
        <div ref={containerListaRef} className="flex-1 min-h-0 flex flex-col">
          <EstadoLista mensagem={erro || "Empréstimo não encontrado."} />
        </div>
      ) : (
        <>
          {/* Resumo estruturado do empréstimo */}
          <section className="bg-white border border-[#cfe5d4] rounded-2xl px-4 sm:px-5 xl:px-6 py-2.5 xl:py-3.5 mb-2.5 xl:mb-4 shadow-xs shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <div className="flex flex-wrap items-center gap-2.5 xl:gap-3">
                <h2 className="text-lg xl:text-xl font-bold text-[#1e582d]">
                  Prof. {emprestimo.professorNome}
                </h2>
                <span className="inline-flex items-center gap-1.5 xl:gap-2 px-3 py-0.5 xl:px-3.5 xl:py-1 rounded-xl bg-[#eef7f0] border border-[#cde5d4] text-xs xl:text-sm font-semibold text-[#1e582d]">
                  <MdOutlineSchool size={17} className="text-[#2e8b45] shrink-0" />
                  {emprestimo.turmaNome}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 xl:gap-5 text-sm xl:text-base text-gray-700">
                <span className="inline-flex items-center gap-1.5 xl:gap-2">
                  <MdCalendarToday size={16} className="text-[#2e8b45] shrink-0" />
                  <span>
                    <strong className="font-semibold text-[#1e582d]">
                      {emprestimo.status === "CANCELADO"
                        ? "Solicitação: "
                        : "Retirada: "}
                    </strong>
                    <span className="tabular-nums">
                      {formatarData(
                        emprestimo.dataRetirada instanceof Date
                          ? emprestimo.dataRetirada.toISOString()
                          : emprestimo.dataRetirada
                      )}
                    </span>
                  </span>
                </span>

                {emprestimo.dataDevolucao ? (
                  <span className="inline-flex items-center gap-1.5 xl:gap-2">
                    <MdCalendarToday size={16} className="text-[#2e8b45] shrink-0" />
                    <span>
                      <strong className="font-semibold text-[#1e582d]">
                        {emprestimo.status === "CANCELADO"
                          ? "Cancelamento: "
                          : "Devolução: "}
                      </strong>
                      <span className="tabular-nums">
                        {formatarData(
                          emprestimo.dataDevolucao instanceof Date
                            ? emprestimo.dataDevolucao.toISOString()
                            : emprestimo.dataDevolucao
                        )}
                      </span>
                    </span>
                  </span>
                ) : null}

                <span className="inline-flex items-center gap-1.5 xl:gap-2">
                  <MdMenuBook size={17} className="text-[#2e8b45] shrink-0" />
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {emprestimo.quantidadeExemplares}{" "}
                    <span className="font-medium text-gray-700">
                      {emprestimo.quantidadeExemplares === 1
                        ? "exemplar"
                        : "exemplares"}
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* Busca e botão visual de devolver todos */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3.5 mb-2.5 xl:mb-3.5 w-full shrink-0">
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
              onClick={abrirDevolverTodos}
              className={`h-10 xl:h-11 px-4 sm:px-5 xl:px-6 inline-flex items-center justify-center rounded-xl font-semibold text-sm xl:text-base whitespace-nowrap gap-2 shrink-0 transition-all ${
                devolverTodosDesabilitado
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#2e8b45] text-white shadow-sm hover:bg-[#236c35] cursor-pointer active:scale-95"
              }`}
            >
              <MdUndo size={19} />
              Devolver todos
            </button>
          </div>

          <div ref={containerListaRef} className="flex-1 min-h-0 flex flex-col">
            {itensExibidos.length === 0 ? (
              <EstadoLista
                mensagem={
                  termoBusca.trim()
                    ? `Nenhum livro encontrado para "${termoBusca}".`
                    : "Este empréstimo não possui livros."
                }
              />
            ) : (
              <div
                key={`${ordenacao}-${paginaAtual}`}
                className="animate-fade-in duration-300 flex flex-col min-h-0"
              >
                <ListaItensEmprestimo
                  itens={itensPaginados}
                  statusEmprestimo={emprestimo.status}
                  onDevolver={abrirDevolucao}
                  onRegistrarAvaria={(item) =>
                    router.push(
                      `/emprestimo/avaria?id=${emprestimo.id}&itemId=${item.id}`
                    )
                  }
                />

                <Paginacao
                  paginaAtual={paginaAtual}
                  totalItens={itensExibidos.length}
                  totalBalao={exemplaresPendentes}
                  itensPorPagina={itensPorPagina}
                  nomeEntidade="exemplares pendentes"
                  nomeEntidadeSingular="exemplar pendente"
                  aoMudarPagina={setPaginaAtual}
                />
              </div>
            )}
          </div>
        </>
      )}

        <ModalDevolverExemplares
          aberto={itemParaDevolver !== null}
          item={itemParaDevolver}
          salvando={salvandoDevolucao}
          erroExterno={erroDevolucao}
          onCancelar={fecharDevolucao}
          onConfirmar={confirmarDevolucao}
        />
        
        <ModalDevolverTodos
          aberto={modalDevolverTodosAberto}
          salvando={salvandoDevolverTodos}
          erro={erroDevolverTodos}
          onCancelar={fecharDevolverTodos}
          onConfirmar={confirmarDevolverTodos}
        />
    </PageShell>
  );
}
