import Link from "next/link";

import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import Sidebar from "../../components/Sidebar";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";

import CardProfessor from "../../components/professor/cardProfessor";
import Paginacao from "../../components/Paginacao";
import ModalDesativar from "../../components/modal/modalDesativar";

import { MdAdd } from "react-icons/md";

// ===================== INÍCIO MOCK (só para teste) =====================
// Ajuste o caminho para onde está o seu professoresMock.
import { professoresMock } from "../../mocks/professores-mock";

// true = usa dados mocados; false = usa o back de verdade (window.ipc)
const USAR_MOCK = true;

// "banco" em memória: as alterações valem até recarregar o app
const bancoMock: any[] = professoresMock.map((p) => ({
  ...p,
  possuiHistorico: p.statusEmprestimoProf !== "nunca_fez_emprestimo",
}));

function desativarMock(id: number): {
  success: boolean;
  data?: any;
  error?: string;
} {
  const p = bancoMock.find((x) => x.id === id);
  if (!p) return { success: false, error: "Professor não encontrado." };

  if (p.statusEmprestimoProf === "tem_emprestimo_atualmente") {
    return {
      success: false,
      error:
        "Não é possível desativar este professor, pois ele possui empréstimos pendentes.",
    };
  }

  p.status = "INATIVO";
  p.ativo = false;
  return { success: true, data: p };
}
// ====================== FIM MOCK (só para teste) =======================

export default function GerenciarProfessores() {
  const router = useRouter();
  const mostrarSucesso = router.query.sucesso === "1";
  const sucessoEdicao =
    router.query.sucesso === "editado" || router.query.aviso === "editado";

  const [professores, setPofessores] = useState<any[]>([]);
  const [carregado, setCarregado] = useState(true);
  const [erro, setErro] = useState("");

  const [termoBusca, setTermoBusca] = useState("");
  const [incluirInativos, setIncluirInativos] = useState<boolean>(false);
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>("alfabetica");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 6; // 4 linhas x 3 colunas

  // Ativação (HU12) - ainda sem modal ligado
  const [professorParaAtivar, setProfessorParaAtivar] = useState<any | null>(
    null,
  );
  const [sucessoAtivacao, setSucessoAtivacao] = useState("");

  // Desativação (HU11)
  const [professorParaDesativar, setProfessorParaDesativar] = useState<
    any | null
  >(null);
  const [desativando, setDesativando] = useState(false);
  const [sucessoDesativacao, setSucessoDesativacao] = useState("");
  const [avisoBloqueio, setAvisoBloqueio] = useState("");
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca]);

  useEffect(() => {
    async function carregarProfessores() {
      try {
        setErro("");

        // MOCK: remover este bloco quando o back real estiver pronto
        if (USAR_MOCK) {
          setPofessores(
            bancoMock.filter((p) => incluirInativos || p.status === "ATIVO"),
          );
          return;
        }

        // REAL: consulta no back
        const resposta = await window.ipc.professor.consultar({
          nome: termoBusca,
          email: termoBusca,
          incluirInativos: incluirInativos,
        });

        if (!resposta.success) {
          setErro(resposta.error || "Erro ao carregar professores.");
          return;
        }

        setPofessores(resposta.data || []);
      } catch (error) {
        const mensagem =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os professores.";

        setErro(mensagem);
      } finally {
        setCarregado(false);
      }
    }

    carregarProfessores();
  }, [termoBusca, incluirInativos, recarregar]);

  async function handleConfirmarDesativacao() {
    if (!professorParaDesativar || desativando) return;

    setDesativando(true);
    setSucessoDesativacao("");
    setAvisoBloqueio("");

    try {
      // MOCK: trocar pela linha REAL quando o back estiver pronto
      const resposta = USAR_MOCK
        ? desativarMock(professorParaDesativar.id)
        : await window.ipc.professor.desativar(professorParaDesativar.id);

      // REAL (versão final, sem mock):
      // const resposta = await window.ipc.professor.desativar(
      //   professorParaDesativar.id,
      // );

      if (!resposta.success) {
        setAvisoBloqueio(
          resposta.error || "Não foi possível desativar o professor.",
        );
        return;
      }

      setSucessoDesativacao("Professor desativado com sucesso!");
      setRecarregar((n) => n + 1);
    } catch (error) {
      setAvisoBloqueio(
        error instanceof Error
          ? error.message
          : "Não foi possível desativar o professor.",
      );
    } finally {
      setDesativando(false);
      setProfessorParaDesativar(null);
    }
  }

  const professoresExibidos = [...professores].sort((a, b) => {
    if (a.status === "ATIVO" && b.status !== "ATIVO") return -1;
    if (a.status !== "ATIVO" && b.status === "ATIVO") return 1;

    if (ordenacao === "recentes") {
      return (b.id ?? 0) - (a.id ?? 0);
    }
    const nomeA = `${a.primeiroNome} ${a.sobrenome}`;
    const nomeB = `${b.primeiroNome} ${b.sobrenome}`;
    return nomeA.localeCompare(nomeB, "pt-BR");
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(professoresExibidos.length / ITENS_POR_PAGINA),
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const professoresPaginados = professoresExibidos.slice(
    inicio,
    inicio + ITENS_POR_PAGINA,
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 px-8 pt-6 pb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Gerenciar professores
        </h1>

        {mostrarSucesso && (
          <div className="bg-[#d8f3dc] text-[#2e8b45] px-4 py-2.5 rounded-xl mb-4 text-sm font-medium flex items-center gap-2">
            ✓ Professor cadastrado com sucesso!
          </div>
        )}

        {sucessoEdicao && (
          <div className="bg-[#d8f3dc] text-[#2e8b45] px-4 py-2.5 rounded-xl mb-4 text-sm font-medium flex items-center gap-2">
            ✓ Professor editado com sucesso!
          </div>
        )}

        {sucessoDesativacao && (
          <div className="bg-[#d8f3dc] text-[#2e8b45] px-4 py-2.5 rounded-xl mb-4 text-sm font-medium flex items-center gap-2">
            ✓ {sucessoDesativacao}
          </div>
        )}

        {avisoBloqueio && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl mb-4 text-sm font-medium flex items-center gap-2">
            ⚠ {avisoBloqueio}
          </div>
        )}

        {/* Barra de busca e botão de adicionar */}
        <div className="flex items-start gap-4 mb-5 w-full">
          <SearchBar
            placeholder="Pesquisar professor por nome ou e-mail..."
            valorBusca={termoBusca}
            onChangeBusca={setTermoBusca}
            ordenacao={ordenacao}
            onChangeOrdenacao={setOrdenacao}
            incluirInativos={incluirInativos}
            onToggleInativos={setIncluirInativos}
            labelCheckbox="Incluir inativos"
          />

          <Link
            href="/professor/cadastro_professor"
            className="h-11 px-6 flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-medium text-sm hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer"
          >
            <MdAdd size={18} />
            Adicionar professor
          </Link>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl mb-4 text-xs font-medium">
            {erro}
          </div>
        )}

        {carregado ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">Carregando professores...</p>
          </div>
        ) : professores.length === 0 ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">
              Nenhum professor cadastrado.
            </p>
          </div>
        ) : (
          <div
            key={`${termoBusca}-${incluirInativos}-${ordenacao}-${paginaAtual}`}
            className="animate-fade-in duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {professoresPaginados.map((professor) => (
                <CardProfessor
                  key={professor.id}
                  professor={professor}
                  onEditar={(p) => router.push(`/professor/${p.id}`)}
                  onAtivar={(p) => setProfessorParaAtivar(p)}
                  onDesativar={(p) => {
                    setSucessoDesativacao("");
                    setAvisoBloqueio("");
                    setProfessorParaDesativar(p);
                  }}
                />
              ))}
            </div>

            <Paginacao
              paginaAtual={paginaAtual}
              totalItens={professoresExibidos.length}
              itensPorPagina={ITENS_POR_PAGINA}
              nomeEntidade="professores"
              nomeEntidadeSingular="professor"
              aoMudarPagina={setPaginaAtual}
            />
          </div>
        )}
      </main>

     

      <ModalDesativar
        aberto={professorParaDesativar !== null}
        titulo="Desativar registro?"
        mensagem={
          <>
            Tem certeza que deseja desativar o professor:
            <br />
            <span className="font-semibold text-[#cf4a4a]">
              {professorParaDesativar?.primeiroNome}{" "}
              {professorParaDesativar?.sobrenome}
            </span>
          </>
        }
        onConfirmar={handleConfirmarDesativacao}
        onCancelar={() => setProfessorParaDesativar(null)}
      />
    </div>
  );
}
