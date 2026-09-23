import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";
import { Livro } from "../../types/livro";
import CardLivro from "../../components/livro/cardLivro";
import Paginacao from "../../components/Paginacao";
import { useRouter } from "next/router";
import { MdAdd } from "react-icons/md";

export default function GerenciarLivros() {
  const router = useRouter();
  const mostrarSucesso = router.query.sucesso === "1";

  const [listaLivros, setListaLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [termoBusca, setTermoBusca] = useState("");
  const [incluirInativos, setIncluirInativos] = useState<boolean>(false);
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>("alfabetica");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 12; // 4 linhas x 3 colunas

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
  }, [termoBusca, incluirInativos]);

  const livrosFiltrados = incluirInativos
    ? listaLivros
    : listaLivros.filter((livro) => livro.status === "ATIVO");

  const livrosExibidos = [...livrosFiltrados].sort((a, b) => {
    if (a.status === "ATIVO" && b.status !== "ATIVO") return -1;
    if (a.status !== "ATIVO" && b.status === "ATIVO") return 1;

    if (ordenacao === "recentes") {
      return (b.id ?? 0) - (a.id ?? 0);
    }
    return (a.titulo || "").localeCompare(b.titulo || "", "pt-BR");
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(livrosExibidos.length / ITENS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const livrosPaginados = livrosExibidos.slice(
    inicio,
    inicio + ITENS_POR_PAGINA
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 px-8 pt-6 pb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Gerenciar livros
        </h1>

        {mostrarSucesso && (
          <div className="bg-[#d8f3dc] text-[#2e8b45] px-4 py-2.5 rounded-xl mb-4 text-sm font-medium flex items-center gap-2">
            ✓ Livro cadastrado com sucesso!
          </div>
        )}

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
            <p className="text-base font-medium">
              Carregando livros...
            </p>
          </div>
        ) : livrosExibidos.length === 0 ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">
              Nenhum livro cadastrado.
            </p>
          </div>
        ) : (
          <div
            key={`${termoBusca}-${incluirInativos}-${ordenacao}-${paginaAtual}`}
            className="animate-fade-in duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {livrosPaginados.map((livro) => (
                <CardLivro key={livro.id} livro={livro} />
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
      </main>
    </div>
  );
}
