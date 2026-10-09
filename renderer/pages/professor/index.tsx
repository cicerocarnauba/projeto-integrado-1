
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Sidebar from "../../components/Sidebar";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";

import ListaProfessor from "../../components/professor/listaProfessor";
import Paginacao from "../../components/Paginacao";
import ModalDesativar from "../../components/modal/modalDesativar";
import ModalAtivar from "../../components/modal/modalAtivar";
import ModalExcluir from "../../components/modal/modalExcluir";
import ToastFeedback from "../../components/ToastFeedback";

import { MdAdd } from "react-icons/md";

export default function GerenciarProfessores() {
  const router = useRouter();
  const mostrarSucesso = router.query.sucesso === "1";
  const sucessoEdicao =
    router.query.sucesso === "editado" || router.query.aviso === "editado";

  const [professores, setProfessores] = useState<any[]>([]);
  const [carregado, setCarregado] = useState(true);
  const [erro, setErro] = useState("");

  const [termoBusca, setTermoBusca] = useState("");
  const [incluirInativos, setIncluirInativos] = useState<boolean>(false);
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>("alfabetica");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 8; // 8 itens por página na visualização em lista

  // Ativação (HU12)
  const [professorParaAtivar, setProfessorParaAtivar] = useState<any | null>(
    null,
  );
  const [ativando, setAtivando] = useState(false);
  const [sucessoAtivacao, setSucessoAtivacao] = useState("");
  const [erroAtivacao, setErroAtivacao] = useState("");

  // Desativação (HU11)
  const [professorParaDesativar, setProfessorParaDesativar] = useState<
    any | null
  >(null);
  const [desativando, setDesativando] = useState(false);
  const [sucessoDesativacao, setSucessoDesativacao] = useState("");
  const [avisoBloqueio, setAvisoBloqueio] = useState("");

  // Exclusão
  const [professorParaExcluir, setProfessorParaExcluir] = useState<any | null>(
    null,
  );
  const [excluindo, setExcluindo] = useState(false);
  const [sucessoExclusao, setSucessoExclusao] = useState("");

  const [recarregar, setRecarregar] = useState(0);

  function limparMensagens() {
    setSucessoAtivacao("");
    setErroAtivacao("");
    setSucessoDesativacao("");
    setSucessoExclusao("");
    setAvisoBloqueio("");
  }

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca]);

  useEffect(() => {
    async function carregarProfessores() {
      try {
        setErro("");

        const resposta = await window.ipc.professor.consultar({
          nome: termoBusca,
          email: termoBusca,
          incluirInativos: incluirInativos,
        });

        if (!resposta.success) {
          setErro(resposta.error || "Erro ao carregar professores.");
          return;
        }

        setProfessores(resposta.data || []);
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
    limparMensagens();

    try {
      const resposta = await window.ipc.professor.desativar(
        professorParaDesativar.id,
      );

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

  async function handleConfirmarAtivacao() {
    if (!professorParaAtivar || ativando) return;

    setAtivando(true);
    limparMensagens();

    try {
      const resposta = await window.ipc.professor.reativar(
        professorParaAtivar.id,
      );

      if (!resposta.success) {
        setErroAtivacao(
          resposta.error || "Não foi possível ativar o professor.",
        );
        return;
      }

      setSucessoAtivacao("Professor ativado com sucesso!");
      setRecarregar((n) => n + 1);
    } catch (error) {
      setErroAtivacao(
        error instanceof Error
          ? error.message
          : "Não foi possível ativar o professor.",
      );
    } finally {
      setAtivando(false);
      setProfessorParaAtivar(null);
    }
  }

  async function handleConfirmarExclusao() {
    if (!professorParaExcluir || excluindo) return;

    setExcluindo(true);
    limparMensagens();

    try {
      const resposta = await window.ipc.professor.excluir(
        professorParaExcluir.id,
      );

      if (!resposta.success) {
        setAvisoBloqueio(
          resposta.error || "Não foi possível excluir o professor.",
        );
        return;
      }

      setSucessoExclusao("Professor excluído com sucesso!");
      setRecarregar((n) => n + 1);
    } catch (error) {
      setAvisoBloqueio(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o professor.",
      );
    } finally {
      setExcluindo(false);
      setProfessorParaExcluir(null);
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

      <main className="flex-1 min-w-0 px-8 pt-6 pb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Gerenciar professores
        </h1>

        <ToastFeedback
          mensagem={
            sucessoDesativacao ||
            sucessoExclusao ||
            sucessoAtivacao ||
            (mostrarSucesso ? "Professor cadastrado com sucesso!" : "") ||
            (sucessoEdicao ? "Professor editado com sucesso!" : "")
          }
          tipo="sucesso"
          onClose={() => {
            setSucessoDesativacao("");
            setSucessoExclusao("");
            setSucessoAtivacao("");
          }}
        />

        <ToastFeedback
          mensagem={avisoBloqueio || erroAtivacao || erro}
          tipo="erro"
          onClose={() => {
            setAvisoBloqueio("");
            setErroAtivacao("");
            setErro("");
          }}
        />

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
            <ListaProfessor
              professores={professoresPaginados}
              onEditar={(p) => router.push(`/professor/${p.id}`)}
              onAtivar={(p) => {
                limparMensagens();
                setProfessorParaAtivar(p);
              }}
              onDesativar={(p) => {
                limparMensagens();
                setProfessorParaDesativar(p);
              }}
              onExcluir={(p) => {
                limparMensagens();
                setProfessorParaExcluir(p);
              }}
            />

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
            <span className="block font-bold text-gray-800 text-xs mt-0.75">
              Nome:{" "}
              <span className="text-sm font-normal text-gray-600">
                {professorParaDesativar?.primeiroNome}{" "}
                {professorParaDesativar?.sobrenome}
              </span>
            </span>
            <span className="block font-bold text-gray-800 text-xs mt-0.75">
              Email:{" "}
              <span className="text-sm font-normal text-gray-600">
                {professorParaDesativar?.email}
              </span>
            </span>
          </>
        }
        onConfirmar={handleConfirmarDesativacao}
        onCancelar={() => setProfessorParaDesativar(null)}
      />

      <ModalAtivar
        aberto={professorParaAtivar !== null}
        titulo="Ativar registro?"
        mensagem={
          <>
            Tem certeza que deseja ativar o professor:
            <br />
            <span className="block font-bold text-gray-800 text-xs mt-0.75">
              Nome:{" "}
              <span className="text-sm font-normal text-gray-600">
                {professorParaAtivar?.primeiroNome}{" "}
                {professorParaAtivar?.sobrenome}
              </span>
            </span>
            <span className="block font-bold text-gray-800 text-xs mt-0.75">
              Email:{" "}
              <span className="text-sm font-normal text-gray-600">
                {professorParaAtivar?.email}
              </span>
            </span>
          </>
        }
        onConfirmar={handleConfirmarAtivacao}
        onCancelar={() => setProfessorParaAtivar(null)}
      />

      <ModalExcluir
        aberto={professorParaExcluir !== null}
        titulo="Excluir registro?"
        mensagem={
          <>
            Tem certeza que deseja excluir o professor:
            <br />
            <span className="block font-bold text-gray-800 text-xs mt-0.75">
              Nome:{" "}
              <span className="text-sm font-normal text-gray-600">
                {professorParaExcluir?.primeiroNome}{" "}
                {professorParaExcluir?.sobrenome}
              </span>
            </span>
            <span className="block font-bold text-gray-800 text-xs mt-0.75">
              Email:{" "}
              <span className="text-sm font-normal text-gray-600">
                {professorParaExcluir?.email}
              </span>
            </span>
          </>
        }
        onConfirmar={handleConfirmarExclusao}
        onCancelar={() => setProfessorParaExcluir(null)}
      />
    </div>
  );
}
