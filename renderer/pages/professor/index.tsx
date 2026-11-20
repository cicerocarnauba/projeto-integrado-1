
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import PageShell from "../../components/PageShell";
import EstadoLista from "../../components/EstadoLista";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";
import AbasStatus, { StatusAba } from "../../components/AbasStatus";

import ListaProfessor from "../../components/professor/listaProfessor";
import Paginacao from "../../components/Paginacao";
import { useItensPorPagina } from "../../hooks/useItensPorPagina";
import ModalDesativar from "../../components/modal/modalDesativar";
import ModalAtivar from "../../components/modal/modalAtivar";
import ModalExcluir from "../../components/modal/modalExcluir";
import ToastFeedback from "../../components/ToastFeedback";

import { MdAdd } from "react-icons/md";

export default function GerenciarProfessores() {
  const router = useRouter();
  const [feedbackUrl, setFeedbackUrl] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const { sucesso, aviso } = router.query;

    if (sucesso === "1") {
      setFeedbackUrl("Professor cadastrado com sucesso!");
      router.replace("/professor", undefined, { shallow: true });
    } else if (sucesso === "editado" || aviso === "editado") {
      setFeedbackUrl("Professor editado com sucesso!");
      router.replace("/professor", undefined, { shallow: true });
    }
  }, [router.isReady, router.query]);

  const [professores, setProfessores] = useState<any[]>([]);
  const [carregado, setCarregado] = useState(true);
  const [erro, setErro] = useState("");

  const [termoBusca, setTermoBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<StatusAba>("ATIVO");
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>("alfabetica");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = useItensPorPagina();

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
  const [professorExcluindo, setProfessorExcluindo] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [sucessoExclusao, setSucessoExclusao] = useState("");

  const [recarregar, setRecarregar] = useState(0);

  function limparMensagens() {
    setFeedbackUrl("");
    setSucessoAtivacao("");
    setErroAtivacao("");
    setSucessoDesativacao("");
    setSucessoExclusao("");
    setAvisoBloqueio("");
  }

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca, abaAtiva]);

  useEffect(() => {
    async function carregarProfessores() {
      try {
        setErro("");

        const resposta = await window.ipc.professor.consultar({
          nome: termoBusca,
          email: termoBusca,
          incluirInativos: true,
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
  }, [termoBusca, recarregar]);

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

    const professor = professorParaExcluir;
    setExcluindo(true);
    setProfessorExcluindo(professor.id);
    setProfessorParaExcluir(null);
    limparMensagens();

    setTimeout(async () => {
      try {
        const resposta = await window.ipc.professor.excluir(
          professor.id,
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
        setProfessorExcluindo(null);
      }
    }, 200);
  }

  const professoresFiltradosPorAba = professores.filter((p) =>
    abaAtiva === "ATIVO" ? p.status === "ATIVO" : p.status !== "ATIVO"
  );

  const professoresExibidos = [...professoresFiltradosPorAba].sort((a, b) => {
    if (ordenacao === "recentes") {
      return (b.id ?? 0) - (a.id ?? 0);
    }
    const nomeA = `${a.primeiroNome} ${a.sobrenome}`;
    const nomeB = `${b.primeiroNome} ${b.sobrenome}`;
    return nomeA.localeCompare(nomeB, "pt-BR");
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(professoresExibidos.length / itensPorPagina),
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const totalAtivos = professores.filter((p) => p.status === "ATIVO").length;
  const totalInativos = professores.length - totalAtivos;

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const professoresPaginados = professoresExibidos.slice(
    inicio,
    inicio + itensPorPagina,
  );

  return (
    <PageShell titulo="Gerenciar professores">
      <ToastFeedback
        mensagem={
          sucessoDesativacao ||
          sucessoExclusao ||
          sucessoAtivacao ||
          feedbackUrl
        }
        tipo="sucesso"
        onClose={() => {
          setSucessoDesativacao("");
          setSucessoExclusao("");
          setSucessoAtivacao("");
          setFeedbackUrl("");
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

      {/* Abas de status: Professores Ativos e Professores Inativos */}
      <AbasStatus
        abaAtiva={abaAtiva}
        onChangeAba={setAbaAtiva}
        labelAtivos="Professores Ativos"
        labelInativos="Professores Inativos"
        totalAtivos={totalAtivos}
        totalInativos={totalInativos}
      />

      {/* Barra de busca e botão de adicionar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 mb-3.5 w-full">
        <SearchBar
          placeholder="Pesquisar professor por nome ou e-mail..."
          valorBusca={termoBusca}
          onChangeBusca={setTermoBusca}
          ordenacao={ordenacao}
          onChangeOrdenacao={setOrdenacao}
        />

        <Link
          href="/professor/cadastro_professor"
          className="h-11 px-5 sm:px-6 inline-flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-semibold text-[15px] hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer shrink-0 active:scale-95"
        >
          <MdAdd size={20} />
          Adicionar professor
        </Link>
      </div>

      {carregado ? (
        <EstadoLista mensagem="Carregando professores..." />
      ) : professoresExibidos.length === 0 ? (
        <EstadoLista
          mensagem={
            termoBusca.trim()
              ? `Nenhum professor ${abaAtiva === "ATIVO" ? "ativo" : "inativo"} encontrado para "${termoBusca}".`
              : `Nenhum professor ${abaAtiva === "ATIVO" ? "ativo" : "inativo"} cadastrado.`
          }
        />
      ) : (
          <div
            key={`${abaAtiva}-${ordenacao}-${paginaAtual}`}
            className="animate-fade-in duration-300"
          >
            <ListaProfessor
              professores={professoresPaginados}
              professorExcluindo={professorExcluindo}
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
              itensPorPagina={itensPorPagina}
              nomeEntidade={abaAtiva === "ATIVO" ? "professores ativos" : "professores inativos"}
              nomeEntidadeSingular={abaAtiva === "ATIVO" ? "professor ativo" : "professor inativo"}
              aoMudarPagina={setPaginaAtual}
            />
          </div>
        )}

      <ModalDesativar
        aberto={professorParaDesativar !== null}
        titulo="Desativar professor?"
        mensagem={
          <div>
            <p>Tem certeza que deseja desativar este professor?</p>
            <div className="mt-3 rounded-xl bg-[#eef7f0] border border-[#d5ead9] p-3.5 space-y-1 text-[14.5px]">
              <p>
                <span className="font-semibold text-[#1e582d]">Nome: </span>
                <span className="text-gray-800">
                  {professorParaDesativar?.primeiroNome}{" "}
                  {professorParaDesativar?.sobrenome}
                </span>
              </p>
              <p>
                <span className="font-semibold text-[#1e582d]">E-mail: </span>
                <span className="text-gray-800">{professorParaDesativar?.email}</span>
              </p>
            </div>
          </div>
        }
        onConfirmar={handleConfirmarDesativacao}
        onCancelar={() => setProfessorParaDesativar(null)}
      />

      <ModalAtivar
        aberto={professorParaAtivar !== null}
        titulo="Ativar professor?"
        mensagem={
          <div>
            <p>Tem certeza que deseja ativar este professor?</p>
            <div className="mt-3 rounded-xl bg-[#eef7f0] border border-[#d5ead9] p-3.5 space-y-1 text-[14.5px]">
              <p>
                <span className="font-semibold text-[#1e582d]">Nome: </span>
                <span className="text-gray-800">
                  {professorParaAtivar?.primeiroNome}{" "}
                  {professorParaAtivar?.sobrenome}
                </span>
              </p>
              <p>
                <span className="font-semibold text-[#1e582d]">E-mail: </span>
                <span className="text-gray-800">{professorParaAtivar?.email}</span>
              </p>
            </div>
          </div>
        }
        onConfirmar={handleConfirmarAtivacao}
        onCancelar={() => setProfessorParaAtivar(null)}
      />

      <ModalExcluir
        aberto={professorParaExcluir !== null}
        titulo="Excluir professor?"
        mensagem={
          <div>
            <p>Tem certeza que deseja excluir este professor?</p>
            <div className="mt-3 rounded-xl bg-[#eef7f0] border border-[#d5ead9] p-3.5 space-y-1 text-[14.5px]">
              <p>
                <span className="font-semibold text-[#1e582d]">Nome: </span>
                <span className="text-gray-800">
                  {professorParaExcluir?.primeiroNome}{" "}
                  {professorParaExcluir?.sobrenome}
                </span>
              </p>
              <p>
                <span className="font-semibold text-[#1e582d]">E-mail: </span>
                <span className="text-gray-800">{professorParaExcluir?.email}</span>
              </p>
            </div>
          </div>
        }
        onConfirmar={handleConfirmarExclusao}
        onCancelar={() => setProfessorParaExcluir(null)}
      />
    </PageShell>
  );
}
