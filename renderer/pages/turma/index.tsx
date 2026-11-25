import Link from "next/link";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";

import PageShell from "../../components/PageShell";
import EstadoLista from "../../components/EstadoLista";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";
import AbasStatus, { StatusAba } from "../../components/AbasStatus";
import ListaTurma from "../../components/turma/listaTurma";
import Paginacao from "../../components/Paginacao";
import { useItensPorPagina } from "../../hooks/useItensPorPagina";

import ModalExcluir from "../../components/modal/modalExcluir";
import ModalAtivar from "../../components/modal/modalAtivar";
import ModalDesativar from "../../components/modal/modalDesativar";


import { MdAdd } from "react-icons/md";

import { Turma } from "../../types/turma";
import ToastFeedback from "../../components/ToastFeedback";

export default function GerenciarTurmas() {
  const router = useRouter();
  // const mostrarSucesso = router.query.sucesso === "1";

  const [turmas, setTurma] = useState<any[]>([]);
  const [carregada, setCarregada] = useState(true);
  const [erro, setErro] = useState("");
  
  const [termoBusca, setTermoBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<StatusAba>("ATIVO");
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>("alfabetica");
  const [recarregar, setRecarregar] = useState(0);
  
  const [turmaParaExcluir, setTurmaParaExcluir] = useState<Turma | null>(null);
  const [turmaExcluindo, setTurmaExcluindo] = useState<number | null>(null);
  const [turmaParaAtivar, setTurmaParaAtivar] = useState<Turma | null>(null);
  const [turmaParaDesativar, setTurmaParaDesativar] = useState<Turma | null>(null);

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
      setFeedback("Turma cadastrada com sucesso!");
      router.replace("/turma", undefined, { shallow: true });
    } else if (sucesso === "editado") {
      setFeedback("Turma editada com sucesso!");
      router.replace("/turma", undefined, { shallow: true });
    } else if (sucesso === "editado_inativo") {
      setAbaAtiva("INATIVO");
      setFeedback("Turma editada com sucesso!");
      router.replace("/turma", undefined, { shallow: true });
    }
  }, [router.isReady, router.query.sucesso]);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const containerListaRef = useRef<HTMLDivElement>(null);
  const itensPorPagina = useItensPorPagina({
    containerRef: containerListaRef,
    alturaLinha: 54,
    alturaLinhaCompacta: 50,
    breakpointCompacto: 1280,
  });

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca, abaAtiva]);

  useEffect(() => {
    async function carregarTurmas() {
      try {
        setErro("");

        const resposta = await window.ipc?.turma?.consultar({
          nome: termoBusca,
          incluirInativos: true,
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
  }, [termoBusca, recarregar]);

  const turmasFiltradasPorAba = turmas.filter((t) =>
    abaAtiva === "ATIVO" ? t.status === "ATIVO" : t.status !== "ATIVO"
  );

  const turmasExibidas = [...turmasFiltradasPorAba].sort((a, b) => {
    if (ordenacao === "recentes") {
      return (b.id ?? 0) - (a.id ?? 0);
    }
    return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(turmasExibidas.length / itensPorPagina)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const turmasPaginadas = turmasExibidas.slice(
    inicio,
    inicio + itensPorPagina
  );

  const handleExcluir = async (turma: Turma) => {
    try {
      const resposta = await window.ipc?.turma?.excluir(turma.id);

      if (!resposta?.success) {
       setErro(resposta?.error || "Erro ao excluir turma.");
       return; 
      }

      setRecarregar((n) => n + 1);
      setFeedback("Turma excluída com sucesso!");

    } catch (error) {
      setErro(
        error instanceof Error
        ? error.message
        : "Não foi possível excluir a turma."
      )
    }
  };
  

  const handleDesativar = async (turma: Turma) => {
    try {
      const resposta = await window.ipc?.turma?.desativar(turma.id);

      if (!resposta?.success) {
       setErro(resposta?.error || "Erro ao desativar turma.");
       return; 
      }
      
      setRecarregar((n) => n + 1);
      setFeedback("Turma desativada com sucesso!");

    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível desativar a turma."
      )
    }
  };
  
  const handleAtivar = async (turma: Turma) => {
    try {
      const resposta = await window.ipc?.turma?.ativar(turma.id);

      if (!resposta?.success) {
       setErro(resposta?.error || "Erro ao ativar turma.");
       return; 
      }

      setRecarregar((n) => n + 1);
      setFeedback("Turma ativada com sucesso!");
      
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível ativar a turma."
      )
    }
  };

  const totalAtivos = turmas.filter((t) => t.status === "ATIVO").length;
  const totalInativos = turmas.length - totalAtivos;

  return (
    <PageShell titulo="Gerenciar turmas">
      {/* Abas de status: Turmas Ativas e Turmas Inativas */}
      <AbasStatus
        abaAtiva={abaAtiva}
        onChangeAba={setAbaAtiva}
        labelAtivos="Turmas Ativas"
        labelInativos="Turmas Inativas"
        totalAtivos={totalAtivos}
        totalInativos={totalInativos}
      />

      {/* Barra de busca e botão de adicionar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3.5 mb-2.5 xl:mb-3.5 w-full shrink-0">
        <SearchBar
          placeholder="Pesquisar turmas por nome..."
          valorBusca={termoBusca}
          onChangeBusca={setTermoBusca}
          ordenacao={ordenacao}
          onChangeOrdenacao={setOrdenacao}
        />

        <Link
          href="/turma/cadastro_turma"
          className="h-10 xl:h-11 px-4 sm:px-5 xl:px-6 inline-flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-semibold text-sm xl:text-base hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer shrink-0 active:scale-95"
        >
          <MdAdd size={20} />
          Adicionar turma
        </Link>
      </div>

      {feedback && (
        <ToastFeedback
          mensagem={feedback}
          tipo="sucesso"
          onClose={() => setFeedback("")}
        />
      )}

      {erro && (
        <ToastFeedback
          mensagem={erro}
          tipo="erro"
          onClose={() => setErro("")}
        />
      )}

      <div ref={containerListaRef} className="flex-1 min-h-0 flex flex-col">
        {carregada ? (
          <EstadoLista mensagem="Carregando turmas..." />
        ) : turmasExibidas.length === 0 ? (
          <EstadoLista
            mensagem={
              termoBusca.trim()
                ? `Nenhuma turma ${abaAtiva === "ATIVO" ? "ativa" : "inativa"} encontrada para "${termoBusca}".`
                : `Nenhuma turma ${abaAtiva === "ATIVO" ? "ativa" : "inativa"} cadastrada.`
            }
          />
        ) : (
          <div
            key={`${abaAtiva}-${ordenacao}-${paginaAtual}`}
            className="animate-fade-in duration-300 flex flex-col min-h-0"
          >
            <ListaTurma
              turmas={turmasPaginadas}
              turmaExcluindo={turmaExcluindo}
              onEditar={(turma) => {
                router.push({
                  pathname: "/turma/editar_turma",
                  query: { id: turma.id },
                });
              }}
              onDesativar={(turma) => setTurmaParaDesativar(turma)}
              onAtivar={(turma) => setTurmaParaAtivar(turma)}
              onExcluir={(turma) => setTurmaParaExcluir(turma)}
            />

            <Paginacao
              paginaAtual={paginaAtual}
              totalItens={turmasExibidas.length}
              itensPorPagina={itensPorPagina}
              nomeEntidade={abaAtiva === "ATIVO" ? "turmas ativas" : "turmas inativas"}
              nomeEntidadeSingular={abaAtiva === "ATIVO" ? "turma ativa" : "turma inativa"}
              aoMudarPagina={setPaginaAtual}
            />
          </div>
        )}
      </div>

        <ModalExcluir
          aberto={turmaParaExcluir !== null}
          titulo="Excluir turma?"
          mensagem={
            turmaParaExcluir ? (
              <div>
                <p>Tem certeza que deseja excluir esta turma?</p>
                <div className="mt-3 rounded-xl bg-[#eef7f0] border border-[#d5ead9] p-3.5 text-sm">
                  <span className="font-semibold text-[#1e582d]">Nome: </span>
                  <span className="text-gray-800">{turmaParaExcluir.nome}</span>
                </div>
              </div>
            ) : (
              ""
            )
          }
          onCancelar={() => setTurmaParaExcluir(null)}
          onConfirmar={async () => {
            if (!turmaParaExcluir) return;

            const turma = turmaParaExcluir;

            setTurmaExcluindo(turmaParaExcluir.id);
            setTurmaParaExcluir(null);

            setTimeout(async () => {
              await handleExcluir(turma);
              setTurmaExcluindo(null);
            }, 200);
          }}
        />

        <ModalDesativar
          aberto={turmaParaDesativar !== null}
          titulo="Desativar turma?"
          mensagem={
            turmaParaDesativar ? (
              <div>
                <p>Tem certeza que deseja desativar esta turma?</p>
                <div className="mt-3 rounded-xl bg-[#eef7f0] border border-[#d5ead9] p-3.5 text-sm">
                  <span className="font-semibold text-[#1e582d]">Nome: </span>
                  <span className="text-gray-800">{turmaParaDesativar.nome}</span>
                </div>
              </div>
            ) : (
              ""
            )
          }
          onCancelar={() => setTurmaParaDesativar(null)}
          onConfirmar={async () => {
            if (!turmaParaDesativar) return;

            const turma = turmaParaDesativar;

            setTurmaParaDesativar(null);

            await handleDesativar(turma);
          }}
        />

        <ModalAtivar
          aberto={turmaParaAtivar !== null}
          titulo="Ativar turma?"
          mensagem={
            turmaParaAtivar ? (
              <div>
                <p>Tem certeza que deseja ativar esta turma?</p>
                <div className="mt-3 rounded-xl bg-[#eef7f0] border border-[#d5ead9] p-3.5 text-sm">
                  <span className="font-semibold text-[#1e582d]">Nome: </span>
                  <span className="text-gray-800">{turmaParaAtivar.nome}</span>
                </div>
              </div>
            ) : (
              ""
            )
          }
          onCancelar={() => setTurmaParaAtivar(null)}
          onConfirmar={async () => {
            if (!turmaParaAtivar) return;

            const turma = turmaParaAtivar;

            setTurmaParaAtivar(null);

            await handleAtivar(turma);
          }}
        />
    </PageShell>
  );
}