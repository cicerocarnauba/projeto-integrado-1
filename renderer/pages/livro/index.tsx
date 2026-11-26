import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageShell from "../../components/PageShell";
import EstadoLista from "../../components/EstadoLista";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";
import AbasStatus, { StatusAba } from "../../components/AbasStatus";
import { Livro } from "../../types/livro";
import ListaLivro from "../../components/livro/listaLivro";
import Paginacao from "../../components/Paginacao";
import { useItensPorPagina } from "../../hooks/useItensPorPagina";
import { useRouter } from "next/router";
import { MdAdd } from "react-icons/md";

import ModalExcluir from "../../components/modal/modalExcluir";
import ModalAtivarLivro from "../../components/modal/ModalAtivaLivro";
import ModalDesativar from "../../components/modal/modalDesativar";
import ToastFeedback from "../../components/ToastFeedback";

export default function GerenciarLivros() {
  const router = useRouter();

  const [listaLivros, setListaLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [livroParaExcluir, setLivroParaExcluir] = useState<Livro | null>(null);
  const [livroExcluindo, setLivroExcluindo] = useState<number | null>(null);
  const [livroParaAtivar, setLivroParaAtivar] = useState<Livro | null>(null);
  const [livroParaDesativar, setLivroParaDesativar] = useState<Livro | null>(null);

  const [termoBusca, setTermoBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<StatusAba>("ATIVO");
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>("alfabetica");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const containerListaRef = useRef<HTMLDivElement>(null);
  const itensPorPagina = useItensPorPagina({
    containerRef: containerListaRef,
    alturaLinha: 54,
    alturaLinhaCompacta: 55,
    breakpointCompacto: 1280,
  });

  const [excluindo, setExcluindo] = useState(false);
  const [recarregar, setRecarregar] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      setFeedback("");
    }, 2500);
  
    return () => clearTimeout(timer);
  }, [feedback]);

   useEffect(() => {
    if (!router.isReady) return;
    const sucesso = router.query.sucesso;

    if (sucesso === "1") {
      setFeedback("Livro cadastrado com sucesso!");
      router.replace("/livro", undefined, { shallow: true });
    } else if (sucesso === "editado") {
      setFeedback("Livro editado com sucesso!");
      router.replace("/livro", undefined, { shallow: true });
    } else if (sucesso === "editado_inativo") {
      setAbaAtiva("INATIVO");
      setFeedback("Livro editado com sucesso. Com 0 exemplares, ele foi desativado.");
      router.replace("/livro", undefined, { shallow: true });
    }
  }, [router.isReady, router.query.sucesso]);


  const handleExcluir = async (livro: Livro) => {
    try {
      const resposta = await window.ipc?.livro?.excluir(livro.id);

      if (!resposta?.success) {
        setErro(resposta?.error || "Erro ao excluir o livro.");
        return; 
      }

      setListaLivros((livrosAtuais) =>
        livrosAtuais.filter((item) => item.id !== livro.id)
      );

      setFeedback("Livro excluído com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o livro."
      );
    }
  };

  const handleAtivar = async (livro: Livro) => {
    try {
      const resposta = await window.ipc?.livro?.ativar(livro.id, livro.quantidadeTotal);

      if (!resposta?.success) {
        setErro(resposta?.error || "Erro ao ativar livro.");
        return; 
      }

      setRecarregar((n) => n + 1);
      setFeedback("Livro ativado com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível ativar o livro."
      );
    }
  };

  const handleDesativar = async (livro: Livro) => {
    try {
      const resposta = await window.ipc?.livro?.desativar(livro.id);

      if (!resposta?.success) {
        setErro(resposta?.error || "Erro ao desativar livro.");
        return; 
      }
      
      setRecarregar((n) => n + 1);
      setFeedback("Livro desativado com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível desativar o livro."
      );
    }
  };

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca, abaAtiva]);

  useEffect(() => {
    async function carregarLivros() {
      try {
        const resposta = await window.ipc.livro.consultar({
          termo: termoBusca,
          incluirInativos: true,
        });

        if (resposta?.success && Array.isArray(resposta.data)) {
          // Mapeia os dados do backend para satisfazer a interface Livro
          const livrosFormatados: Livro[] = resposta.data.map((item) => ({
            ...item,
            ativo: item.status === "ATIVO",
            statusEmprestimo:
              item.saldoDisponivel > 0 ? "DISPONIVEL" : "INDISPONIVEL",
          })) as unknown as Livro[];

          setListaLivros(livrosFormatados);
        } else {
          console.error("Erro ao consultar livros:", resposta?.error);
          setListaLivros([]);
        }
      } catch (error) {
        console.error("Erro ao chamar o IPC de livros:", error);
        setListaLivros([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarLivros();
  }, [termoBusca, recarregar]);

  const livrosFiltradosPorAba = listaLivros.filter((livro) =>
    abaAtiva === "ATIVO"
      ? livro.status === "ATIVO" || livro.ativo === true
      : livro.status !== "ATIVO" && livro.ativo !== true
  );

  const livrosExibidos = [...livrosFiltradosPorAba].sort((a, b) => {
    if (ordenacao === "recentes") {
      return (b.id ?? 0) - (a.id ?? 0);
    }
    return (a.titulo || "").localeCompare(b.titulo || "", "pt-BR");
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(livrosExibidos.length / itensPorPagina),
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const totalAtivos = listaLivros.filter(
    (livro) => livro.status === "ATIVO" || livro.ativo === true
  ).length;
  const totalInativos = listaLivros.length - totalAtivos;

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const livrosPaginados = livrosExibidos.slice(
    inicio,
    inicio + itensPorPagina,
  );
  return (
    <PageShell titulo="Gerenciar livros">
      <ToastFeedback
        mensagem={feedback}
        tipo="sucesso"
        onClose={() => setFeedback("")}
      />

      <ToastFeedback
        mensagem={erro}
        tipo="erro"
        onClose={() => setErro("")}
      />

      {/* Abas de status: Livros Ativos e Livros Inativos */}
      <AbasStatus
        abaAtiva={abaAtiva}
        onChangeAba={setAbaAtiva}
        labelAtivos="Livros Ativos"
        labelInativos="Livros Inativos"
        totalAtivos={totalAtivos}
        totalInativos={totalInativos}
      />

      {/* Barra de busca e botão de adicionar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3.5 mb-2.5 xl:mb-3.5 w-full shrink-0">
        <SearchBar
          placeholder="Pesquisar livro por título ou editora..."
          valorBusca={termoBusca}
          onChangeBusca={setTermoBusca}
          ordenacao={ordenacao}
          onChangeOrdenacao={setOrdenacao}
        />

        <Link
          href="/livro/cadastro_livro"
          className="h-10 xl:h-11 px-4 sm:px-5 xl:px-6 inline-flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-semibold text-sm xl:text-base hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer shrink-0 active:scale-95"
        >
          <MdAdd size={20} />
          Adicionar livro
        </Link>
      </div>

      {/* Lista de livros ou mensagens de estado */}
      <div ref={containerListaRef} className="flex-1 min-h-0 flex flex-col">
        {carregando ? (
          <EstadoLista carregando mensagem="Carregando livros..." />
        ) : livrosExibidos.length === 0 ? (
          <EstadoLista
            termoBusca={termoBusca}
            onLimparBusca={() => setTermoBusca("")}
            mensagem={
              termoBusca.trim()
                ? `Nenhum livro ${abaAtiva === "ATIVO" ? "ativo" : "inativo"} encontrado para "${termoBusca}".`
                : `Nenhum livro ${abaAtiva === "ATIVO" ? "ativo" : "inativo"} cadastrado.`
            }
          />
        ) : (
          <div
            key={`${abaAtiva}-${ordenacao}-${paginaAtual}`}
            className="animate-fade-in duration-300 flex flex-col min-h-0"
          >
            <ListaLivro
              livros={livrosPaginados}
              livroExcluindo={livroExcluindo}
              onEditar={(l) => router.push(`/livro/editar_livro?id=${l.id}`)}
              onDesativar={(livro) => setLivroParaDesativar(livro)}
              onAtivar={(livro) => setLivroParaAtivar(livro)}
              onExcluir={(livro) => setLivroParaExcluir(livro)}
            />

            <Paginacao
              paginaAtual={paginaAtual}
              totalItens={livrosExibidos.length}
              itensPorPagina={itensPorPagina}
              nomeEntidade={abaAtiva === "ATIVO" ? "livros ativos" : "livros inativos"}
              nomeEntidadeSingular={abaAtiva === "ATIVO" ? "livro ativo" : "livro inativo"}
              aoMudarPagina={setPaginaAtual}
            />
          </div>
        )}
      </div>

        <ModalExcluir
          aberto={livroParaExcluir !== null}
          titulo="Excluir livro?"
          mensagem={
            livroParaExcluir ? (
              <div>
                <p>Tem certeza que deseja excluir este livro?</p>
                <div className="mt-3 rounded-xl bg-[#eef7f0] border border-[#d5ead9] p-3.5 space-y-1 text-sm">
                  <p>
                    <span className="font-semibold text-[#1e582d]">Título: </span>
                    <span className="text-gray-800">{livroParaExcluir.titulo}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#1e582d]">Editora: </span>
                    <span className="text-gray-800">{livroParaExcluir.editora}</span>
                  </p>
                </div>
              </div>
            ) : (
              ""
            )
          }
          onCancelar={() => setLivroParaExcluir(null)}
          onConfirmar={async () => {
            if (!livroParaExcluir) return;

            const livro = livroParaExcluir;

            setLivroExcluindo(livroParaExcluir.id);
            setLivroParaExcluir(null);

            setTimeout(async () => {
              await handleExcluir(livro);
              setLivroExcluindo(null);
            }, 200);
          }}
        />

        <ModalDesativar
          aberto={livroParaDesativar !== null}
          titulo="Desativar livro?"
          aviso="Atenção: ao desativar o livro, a quantidade total de exemplares será zerada."
          mensagem={
            livroParaDesativar ? (
              <div>
                <p>Tem certeza que deseja desativar este livro?</p>
                <div className="mt-3 rounded-xl bg-[#eef7f0] border border-[#d5ead9] p-3.5 space-y-1 text-sm">
                  <p>
                    <span className="font-semibold text-[#1e582d]">Título: </span>
                    <span className="text-gray-800">{livroParaDesativar.titulo}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#1e582d]">Editora: </span>
                    <span className="text-gray-800">{livroParaDesativar.editora}</span>
                  </p>
                </div>
              </div>
            ) : (
              ""
            )
          }
          onCancelar={() => setLivroParaDesativar(null)}
          onConfirmar={async () => {
            if (!livroParaDesativar) return;

            const livro = livroParaDesativar;

            setLivroParaDesativar(null);

            await handleDesativar(livro)
          }}
        />
        
        

        <ModalAtivarLivro
          livro={livroParaAtivar}
          onCancelar={() => setLivroParaAtivar(null)}
          onConfirmar={async (quantidadeTotal) => {
            if (!livroParaAtivar) return;

            const livro = livroParaAtivar;

            setLivroParaAtivar(null);

            try {
              const resposta = await window.ipc?.livro?.ativar(
                livro.id,
                quantidadeTotal
              );

              if (!resposta?.success) {
                setErro(resposta?.error || "Erro ao ativar livro.");
                return;
              }

              setRecarregar((n) => n + 1);
              setFeedback("Livro ativado com sucesso!");
            } catch (error) {
              setErro(
                error instanceof Error
                  ? error.message
                  : "Não foi possível ativar o livro."
              );
            }
          }}
        />
    </PageShell>
  );
}
