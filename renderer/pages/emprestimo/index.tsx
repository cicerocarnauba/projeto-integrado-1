import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { MdAdd } from "react-icons/md";
import PageShell from "../../components/PageShell";
import EstadoLista from "../../components/EstadoLista";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";
import Paginacao from "../../components/Paginacao";
import { useItensPorPagina } from "../../hooks/useItensPorPagina";
import ToastFeedback from "../../components/ToastFeedback";
import ListaEmprestimo from "../../components/emprestimo/listaEmprestimo";
import ModalConfirmarAcao from "../../components/modal/ModalConfirmacaoEmprestimo";
import { Emprestimo } from "../../types/emprestimo";
import type { ItemEmprestimoConsultaDTO } from "../../../main/entities/ConsultaEmprestimo";

type Aba = "pendentes" | "concluidos" | "cancelados";

interface GrupoEmprestimo {
  emprestimo: Emprestimo;
  itens: ItemEmprestimoConsultaDTO[];
}

export default function GerenciarEmprestimos() {
  const router = useRouter();

  const [lista, setLista] = useState<ItemEmprestimoConsultaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [recarregar, setRecarregar] = useState(0);

  const [termoBusca, setTermoBusca] = useState("");
  const [aba, setAba] = useState<Aba>("pendentes");
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>("recentes");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [emprestimoParaCancelar, setEmprestimoParaCancelar] =
    useState<Emprestimo | null>(null);

  // Aviso vindo do formulário (?sucesso=emprestimo_realizado).
  // Limpa o parâmetro da URL para não reaparecer ao recarregar a página.
  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.sucesso === "emprestimo_realizado") {
      setFeedback("Empréstimo realizado com sucesso!");
      router.replace("/emprestimo", undefined, { shallow: true });
    }
  }, [router.isReady, router.query.sucesso]);

  // useCallback mantém as funções estáveis: o ToastFeedback usa onClose num
  // useEffect e, sem isso, o tempo de exibição reiniciaria a cada renderização.
  const fecharFeedback = useCallback(() => setFeedback(""), []);
  const fecharErro = useCallback(() => setErro(""), []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca, aba]);

  useEffect(() => {
    async function carregarEmprestimos() {
      try {
        const resposta = await window.ipc.emprestimo.consultar();

        if (resposta?.success && Array.isArray(resposta.data)) {
          setLista(resposta.data);
        } else {
          setErro(resposta?.error || "Erro ao consultar empréstimos.");
          setLista([]);
        }
      } catch (error) {
        console.error("Erro ao chamar o IPC de empréstimos:", error);
        setLista([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarEmprestimos();
  }, [recarregar]);

  async function confirmarCancelamento() {
    if (!emprestimoParaCancelar) return;

    const emprestimo = emprestimoParaCancelar;
    setEmprestimoParaCancelar(null);

    try {
      const resposta = await window.ipc?.emprestimo?.cancelar(emprestimo.id);

      if (!resposta?.success) {
        setErro(resposta?.error || "Erro ao cancelar empréstimo.");
        return;
      }

      setRecarregar((n) => n + 1);
      setFeedback("Empréstimo cancelado com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cancelar o empréstimo."
      );
    }
  }

  
const gruposPorEmprestimo = lista.reduce<Map<number, GrupoEmprestimo>>(
  (grupos, item) => {
    let grupo = grupos.get(item.emprestimoId);

    if (!grupo) {
      grupo = {
        emprestimo: {
          id: item.emprestimoId,
          professorNome: item.professorNome,
          turmaNome: item.turmaNome,
          dataRetirada: new Date(item.dataRetirada).toISOString(),
          quantidadeExemplares: 0,
          status: item.status,
          dataDevolucao: item.dataDevolucao,
        },
        itens: [],
      };

      grupos.set(item.emprestimoId, grupo);
    }

    grupo.emprestimo.quantidadeExemplares += item.quantidadeRetirada;

    grupo.itens.push(item);

    return grupos;
  },
  new Map<number, GrupoEmprestimo>()
);


const normalizarTexto = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

const termo = normalizarTexto(termoBusca);
const termoNumerico = termo.replace(/\D/g, "");

const emprestimosAgrupados = Array.from(
  gruposPorEmprestimo.values()
);

const emprestimosComBaixas = new Set(
  emprestimosAgrupados
    .filter(({ itens }) => itens.some((item) =>
      item.quantidadeDevolvida !== 0 ||
      item.quantidadePerdida !== 0 ||
      item.quantidadeDanificada !== 0
    ))
    .map(({ emprestimo }) => emprestimo.id)
);

const filtradosPorAba = emprestimosAgrupados
  .filter(({ emprestimo }) =>
    aba === "pendentes"
      ? emprestimo.status === "PENDENTE"
      : aba === "concluidos"
        ? emprestimo.status === "CONCLUIDO"
        : emprestimo.status === "CANCELADO"
  )
  .filter(({ emprestimo }) => {
    if (!termo) return true;

    const professor = normalizarTexto(emprestimo.professorNome);
    const turma = normalizarTexto(emprestimo.turmaNome);

    const data = new Date(emprestimo.dataRetirada);

    const formatosData = Number.isNaN(data.getTime())
      ? []
      : [
          data.toLocaleDateString("pt-BR"),
          data.toISOString().slice(0, 10),
        ];

    const dataCorresponde = formatosData.some((formato) => {
      const dataNormalizada = normalizarTexto(formato);
      const dataNumerica = formato.replace(/\D/g, "");

      return (
        dataNormalizada.includes(termo) ||
        (termoNumerico.length > 0 &&
          dataNumerica.includes(termoNumerico))
      );
    });

    return (
      professor.includes(termo) ||
      turma.includes(termo) ||
      dataCorresponde
    );
  })
  .map(({ emprestimo }) => emprestimo);

  const emprestimosExibidos = [...filtradosPorAba].sort((a, b) => {
    if (ordenacao === "recentes") {
      if (aba !== "pendentes") {
        const dataA = a.dataDevolucao ? new Date(a.dataDevolucao).getTime() : 0;
        const dataB = b.dataDevolucao ? new Date(b.dataDevolucao).getTime() : 0;
        return dataB - dataA || b.id - a.id;
      }
      return (b.id ?? 0) - (a.id ?? 0);
    }
    return (a.professorNome || "").localeCompare(b.professorNome || "", "pt-BR");
  });

  const totalPendentes = useMemo(
    () =>
      emprestimosAgrupados.filter(
        ({ emprestimo }) => emprestimo.status === "PENDENTE"
      ).length,
    [emprestimosAgrupados]
  );

  const totalConcluidos = useMemo(
    () =>
      emprestimosAgrupados.filter(
        ({ emprestimo }) => emprestimo.status === "CONCLUIDO"
      ).length,
    [emprestimosAgrupados]
  );

  const totalCancelados = useMemo(
    () =>
      emprestimosAgrupados.filter(
        ({ emprestimo }) => emprestimo.status === "CANCELADO"
      ).length,
    [emprestimosAgrupados]
  );

  const itensPorPagina = useItensPorPagina();

  const totalPaginas = Math.max(
    1,
    Math.ceil(emprestimosExibidos.length / itensPorPagina)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const emprestimosPaginados = emprestimosExibidos.slice(
    inicio,
    inicio + itensPorPagina
  );

  const abaClass = (ativa: boolean) =>
    `pb-2.5 px-1 text-[15.5px] font-semibold border-b-[3px] transition-colors cursor-pointer inline-flex items-center gap-2 whitespace-nowrap ${
      ativa
        ? "text-[#1e582d] border-[#2e8b45]"
        : "text-gray-500 border-transparent hover:text-gray-800 hover:border-[#cde5d4]"
    }`;

  const nomeAba =
    aba === "pendentes"
      ? "pendente"
      : aba === "concluidos"
        ? "concluído"
        : "cancelado";

  return (
    <PageShell titulo="Gerenciar empréstimos">
      <ToastFeedback mensagem={feedback} tipo="sucesso" onClose={fecharFeedback} />
      <ToastFeedback mensagem={erro} tipo="erro" onClose={fecharErro} />

      <div className="flex flex-wrap gap-6 sm:gap-8 border-b border-[#D3E8D6] mb-3.5">
        <button
          type="button"
          className={abaClass(aba === "pendentes")}
          onClick={() => setAba("pendentes")}
        >
          <span>Empréstimos Pendentes</span>
          <span
            className={`inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full tabular-nums ${
              aba === "pendentes"
                ? "bg-[#d8f3dc] text-[#1e582d]"
                : "bg-gray-200/80 text-gray-600"
            }`}
          >
            {totalPendentes}
          </span>
        </button>
        <button
          type="button"
          className={abaClass(aba === "concluidos")}
          onClick={() => setAba("concluidos")}
        >
          <span>Empréstimos Concluídos</span>
          <span
            className={`inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full tabular-nums ${
              aba === "concluidos"
                ? "bg-[#d8f3dc] text-[#1e582d]"
                : "bg-gray-200/80 text-gray-600"
            }`}
          >
            {totalConcluidos}
          </span>
        </button>
        <button
          type="button"
          className={abaClass(aba === "cancelados")}
          onClick={() => setAba("cancelados")}
        >
          <span>Empréstimos Cancelados</span>
          <span
            className={`inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full tabular-nums ${
              aba === "cancelados"
                ? "bg-[#d8f3dc] text-[#1e582d]"
                : "bg-gray-200/80 text-gray-600"
            }`}
          >
            {totalCancelados}
          </span>
        </button>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 mb-3.5 w-full">
        <SearchBar
          placeholder="Pesquisar por professor, turma ou data..."
          valorBusca={termoBusca}
          onChangeBusca={setTermoBusca}
          ordenacao={ordenacao}
          onChangeOrdenacao={setOrdenacao}
        />

        <button
          type="button"
          onClick={() => router.push("/emprestimo/novo")}
          className="h-11 px-5 sm:px-6 inline-flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-semibold text-[15px] hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer shrink-0 active:scale-95"
        >
          <MdAdd size={20} />
          Realizar empréstimo
        </button>
      </div>

      {carregando ? (
        <EstadoLista mensagem="Carregando empréstimos..." />
      ) : emprestimosExibidos.length === 0 ? (
        <EstadoLista
          mensagem={
            termoBusca.trim()
              ? `Nenhum empréstimo ${nomeAba} encontrado para "${termoBusca}".`
              : `Nenhum empréstimo ${nomeAba}.`
          }
        />
      ) : (
          <div
            key={`${aba}-${ordenacao}-${paginaAtual}`}
            className="animate-fade-in duration-300"
          >
            <ListaEmprestimo
              modo={aba}
              emprestimos={emprestimosPaginados}
              emprestimosComBaixas={emprestimosComBaixas}
              onVerDetalhes={(e) => router.push(`/emprestimo/detalhes?id=${e.id}`)}
              onCancelar={(e) => setEmprestimoParaCancelar(e)}
            />

            <Paginacao
              paginaAtual={paginaAtual}
              totalItens={emprestimosExibidos.length}
              itensPorPagina={itensPorPagina}
              nomeEntidade={
                aba === "pendentes"
                  ? "empréstimos pendentes"
                  : aba === "concluidos"
                    ? "empréstimos concluídos"
                    : "empréstimos cancelados"
              }
              nomeEntidadeSingular={`empréstimo ${nomeAba}`}
              aoMudarPagina={setPaginaAtual}
            />
          </div>
        )}

        <ModalConfirmarAcao
          aberto={emprestimoParaCancelar !== null}
          titulo="Cancelar empréstimo?"
          variante="perigo"
          textoConfirmar="Cancelar empréstimo"
          mensagem={
            emprestimoParaCancelar ? (
              <div>
                <p>Tem certeza que deseja cancelar este empréstimo?</p>
                <div className="mt-3 rounded-xl bg-[#eef7f0] border border-[#d5ead9] p-3.5 space-y-1 text-[14.5px]">
                  <p>
                    <span className="font-semibold text-[#1e582d]">Professor: </span>
                    <span className="text-gray-800">{emprestimoParaCancelar.professorNome}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#1e582d]">Turma: </span>
                    <span className="text-gray-800">{emprestimoParaCancelar.turmaNome}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#1e582d]">Data de retirada: </span>
                    <span className="text-gray-800 tabular-nums">
                      {new Date(emprestimoParaCancelar.dataRetirada).toLocaleDateString("pt-BR")}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#1e582d]">Exemplares: </span>
                    <span className="text-gray-800 tabular-nums">
                      {emprestimoParaCancelar.quantidadeExemplares}{" "}
                      {emprestimoParaCancelar.quantidadeExemplares === 1
                        ? "exemplar"
                        : "exemplares"}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              ""
            )
          }
          onCancelar={() => setEmprestimoParaCancelar(null)}
          onConfirmar={confirmarCancelamento}
        />
    </PageShell>
  );
}
