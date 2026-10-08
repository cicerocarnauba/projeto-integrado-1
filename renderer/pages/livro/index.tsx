import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";
import { Livro } from "../../types/livro";
import CardLivro from "../../components/livro/cardLivro";
import Paginacao from "../../components/Paginacao";
import { useRouter } from "next/router";
import { MdAdd } from "react-icons/md";

import ModalExcluir from "../../components/modal/modalExcluir";
import ModalAtivarLivro from "../../components/modal/ModalAtivaLivro";
import ModalDesativar from "../../components/modal/modalDesativar";
import ToastFeedback from "../../components/ToastFeedback";

export default function GerenciarLivros() {
  const router = useRouter();
  const sucesso = router.query.sucesso;
  const mensagemSucesso =
    sucesso === "1"
      ? "Livro cadastrado com sucesso!"
      : sucesso === "editado"
        ? "Livro editado com sucesso!"
        : sucesso === "editado_inativo"
          ? "Livro editado com sucesso. Com 0 exemplares, ele foi desativado."
          : null;

  const [listaLivros, setListaLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");


  const [livroParaExcluir, setLivroParaExcluir] = useState<Livro | null>(null);
  const [livroExcluindo, setLivroExcluindo] = useState<number | null>(null);
  const [livroParaAtivar, setLivroParaAtivar] = useState<Livro | null>(null);
  const [livroParaDesativar, setLivroParaDesativar] = useState<Livro | null>(null);


  const [termoBusca, setTermoBusca] = useState("");
  const [incluirInativos, setIncluirInativos] = useState<boolean>(false);
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>("alfabetica");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 9; // 4 linhas x 3 colunas

  const [excluindo, setExcluindo] = useState(false);
  const [recarregar, setRecarregar] = useState(0);
  // const [feedback, setFeedback] = useState<{
  //   tipo: "sucesso" | "erro";
  //   texto: string;
  // } | null>(null);

  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      setFeedback("");
    }, 2500);
  
    return () => clearTimeout(timer);
  }, [feedback]);

   useEffect(() => {
    const sucesso = router.query.sucesso;

    if (sucesso === "1") {
      setFeedback("Livro cadastrado com sucesso!");
    }

    if (sucesso === "editado") {
      setFeedback("Livro editado com sucesso!");
    }
  }, [router.query.sucesso]);


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
  }, [termoBusca]);

  useEffect(() => {
    async function carregarLivros() {
      try {
        const resposta = await window.ipc.livro.consultar({
          termo: termoBusca,
          incluirInativos: incluirInativos,
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
  }, [termoBusca, incluirInativos, recarregar]);

  const livrosExibidos = [...listaLivros].sort((a, b) => {
    if (a.status === "ATIVO" && b.status !== "ATIVO") return -1;
    if (a.status !== "ATIVO" && b.status === "ATIVO") return 1;

    if (ordenacao === "recentes") {
      return (b.id ?? 0) - (a.id ?? 0);
    }
    return (a.titulo || "").localeCompare(b.titulo || "", "pt-BR");
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(livrosExibidos.length / ITENS_POR_PAGINA),
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const livrosPaginados = livrosExibidos.slice(
    inicio,
    inicio + ITENS_POR_PAGINA,
  );

  // Mesma regra do card: Desativar quando o livro tem histórico de empréstimos
  const livroTemHistorico = livroParaExcluir
    ? (livroParaExcluir.possuiHistorico ??
      (livroParaExcluir.quantidadeEmprestada ?? 0) > 0)
    : false;

  async function confirmarExclusao() {
    if (!livroParaExcluir) return;

    setExcluindo(true);
    setFeedback("Livro excluído com successo!");

    try {
      const resposta = await window.ipc.livro.excluir(livroParaExcluir.id);

      // if (!resposta.success) {
      //   setFeedback({
      //     tipo: "erro",
      //     texto: resposta.error || "Não foi possível excluir o livro.",
      //   });
      //   return;
      // }

      // O backend decide sozinho entre excluir e desativar, e já manda a mensagem pronta
      // setFeedback({
      //   tipo: "sucesso",
      //   texto:
      //     resposta.data?.mensagem ||
      //     (resposta.data?.acao === "DESATIVADO"
      //       ? "Livro desativado com sucesso."
      //       : "Livro excluído com sucesso."),
      // });
      setRecarregar((n) => n + 1);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o livro."
      )
    } finally {
      setExcluindo(false);
      setLivroParaExcluir(null);
    }
  }

  function confirmarAtivacao(quantidadeTotal: number) {
    // Subtarefa 3: aqui entra a chamada ao backend
    // quando o canal existir.
    console.log("Ativar livro:", livroParaAtivar?.id, quantidadeTotal);
    setLivroParaAtivar(null);
  }
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 min-w-0 px-8 pt-6 pb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Gerenciar livros
        </h1>

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

        {/* Barra de busca e botão de adicionar */}
        <div className="flex items-start gap-4 mb-5 w-full">
          <SearchBar
            placeholder="Pesquisar livro por título ou editora..."
            valorBusca={termoBusca}
            onChangeBusca={setTermoBusca}
            ordenacao={ordenacao}
            onChangeOrdenacao={setOrdenacao}
            incluirInativos={incluirInativos}
            onToggleInativos={setIncluirInativos}
            labelCheckbox="Incluir inativos"
          />

          <Link
            href="/livro/cadastro_livro"
            className="h-11 px-6 flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-medium text-sm hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer shrink-0 active:scale-95"
          >
            <MdAdd size={18} />
            Adicionar Livro
          </Link>
        </div>

        {/* Lista de livros ou mensagens de estado */}
        {carregando ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">Carregando livros...</p>
          </div>
        ) : livrosExibidos.length === 0 ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">Nenhum livro cadastrado.</p>
          </div>
        ) : (
          <div
            key={`${termoBusca}-${incluirInativos}-${ordenacao}-${paginaAtual}`}
            className="animate-fade-in duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {livrosPaginados.map((livro) => (
                <CardLivro
                  key={livro.id}
                  livro={livro}
                  onEditar={(l) => router.push(`/livro/${l.id}`)}
                  onDesativar={(livro) => setLivroParaDesativar(livro)}
                  onAtivar={(livro) => setLivroParaAtivar(livro)}
                  onExcluir={(livro) => setLivroParaExcluir(livro)}
                />
              ))}
            </div>

            <Paginacao
              paginaAtual={paginaAtual}
              totalItens={livrosExibidos.length}
              itensPorPagina={ITENS_POR_PAGINA}
              nomeEntidade="livros"
              nomeEntidadeSingular="livro"
              aoMudarPagina={setPaginaAtual}
            />
          </div>
        )}


        <ModalExcluir
          aberto={livroParaExcluir !== null}
          mensagem={
            livroParaExcluir ? (
              <div className="text-sm">
                Tem certeza que deseja excluir a livro?
                <span className="block font-bold text-gray-800 text-xs mt-0.75">
                  Título:{" "}
                  <span className="text-sm font-normal text-gray-600">
                    {livroParaExcluir.titulo}
                  </span>
                </span>
                 <span className="block font-bold text-gray-800 text-xs">
                  Editora:{" "}
                  <span className="text-sm font-normal text-gray-600">
                    {livroParaExcluir.editora} 
                  </span>
                </span>
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
          mensagem={
            livroParaDesativar ? (
              <>
                Tem certeza que deseja desativar o livro:
                <span className="block font-bold text-gray-800 text-xs mt-0.75">
                  Título:{" "}
                  <span className="text-sm font-normal text-gray-600">
                    {livroParaDesativar.titulo}
                  </span>
                </span>
                 <span className="block font-bold text-gray-800 text-xs">
                  Editora:{" "}
                  <span className="text-sm font-normal text-gray-600">
                    {livroParaDesativar.editora} 
                  </span>
                </span>
              </>
            ) : ""
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
      </main>
    </div>
  );
}
