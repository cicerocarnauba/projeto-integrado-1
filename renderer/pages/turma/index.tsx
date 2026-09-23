import Link from "next/link";

import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import Sidebar from "../../components/Sidebar";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";
import CardTurma from "../../components/turma/cardTurma";
import Paginacao from "../../components/Paginacao";

import { MdAdd } from "react-icons/md";

export default function GerenciarTurmas() {
  const router = useRouter();
  const mostrarSucesso = router.query.sucesso === "1";

  const [turmas, setTurma] = useState<any[]>([]);
  const [carregada, setCarregada] = useState(true);
  const [erro, setErro] = useState("");

  const [termoBusca, setTermoBusca] = useState("");
  const [incluirInativos, setIncluirInativos] = useState<boolean>(false);
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>("alfabetica");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 12; // 4 linhas x 3 colunas

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca]);

  useEffect(() => {
    async function carregarTurmas() {
      try {
        setErro("");

        const resposta = await window.ipc?.turma?.consultar({
          nome: termoBusca,
          incluirInativos: incluirInativos,
        });

        if (!resposta) return;

        if (!resposta.success){
          setErro(resposta.error || "Erro ao carregar turmas.");
          return;
        }

        setTurma(resposta.data || []);
      } catch(error) {
        const mensagem = 
          error instanceof Error
            ? error.message
            : "Não foi possível carregar turmas."

        setErro(mensagem);
      } finally {
        setCarregada(false);
      }
    }

    carregarTurmas();
  }, [termoBusca, incluirInativos]);

  const turmasExibidas = [...turmas].sort((a, b) => {
    if (a.status === "ATIVO" && b.status !== "ATIVO") return -1;
    if (a.status !== "ATIVO" && b.status === "ATIVO") return 1;

    if (ordenacao === "recentes") {
      return (b.id ?? 0) - (a.id ?? 0);
    }
    return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(turmasExibidas.length / ITENS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const turmasPaginadas = turmasExibidas.slice(
    inicio,
    inicio + ITENS_POR_PAGINA
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 px-8 pt-6 pb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Gerenciar turmas
        </h1>

        {mostrarSucesso && (
          <div className="bg-[#d8f3dc] text-[#2e8b45] px-4 py-2.5 rounded-xl mb-4 text-sm font-medium flex items-center gap-2">
            ✓ Turma cadastrada com sucesso!
          </div>
        )}

        {/* Barra de busca e botão de adicionar */}
        <div className="flex items-start gap-4 mb-5 w-full">
          <SearchBar 
            placeholder="Pesquisar turmas por nome." 
            valorBusca={termoBusca}
            onChangeBusca={setTermoBusca}
            ordenacao={ordenacao}
            onChangeOrdenacao={setOrdenacao}
            incluirInativos={incluirInativos}
            onToggleInativos={setIncluirInativos}
            labelCheckbox="Incluir inativos"
          />

          <Link
            href="/turma/cadastro_turma"
            className="h-11 px-6 flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-medium text-sm hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer"
          >
            <MdAdd size={18} />
            Adicionar turma
          </Link>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl mb-4 text-xs font-medium">
            {erro}
          </div>
        )}
        
        {carregada ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">
              Carregando turmas...
            </p>
          </div>
        ): turmas.length === 0 ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">
              Nenhuma turma cadastrada.
            </p>
          </div>
        ) : (
          <div
            key={`${termoBusca}-${incluirInativos}-${ordenacao}-${paginaAtual}`}
            className="animate-fade-in duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {turmasPaginadas.map((turma) => (
                <CardTurma
                  key={turma.id}
                  turma={turma}
                />
              ))}
            </div>

            <Paginacao
              paginaAtual={paginaAtual}
              totalItens={turmasExibidas.length}
              itensPorPagina={ITENS_POR_PAGINA}
              nomeEntidade="turmas"
              nomeEntidadeSingular="turma"
              aoMudarPagina={setPaginaAtual}
            />
          </div>
        )}
      </main>
    </div>
  );
}