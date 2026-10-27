import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MdAdd } from "react-icons/md";
import Sidebar from "../../components/Sidebar";
import SearchBar, { TipoOrdenacao } from "../../components/Searchbar";
import Paginacao from "../../components/Paginacao";
import ToastFeedback from "../../components/ToastFeedback";
import ListaEmprestimo from "../../components/emprestimo/listaEmprestimo";
import ModalConfirmarAcao from "../../components/modal/ModalConfirmacaoEmprestimo";
import { Emprestimo } from "../../types/emprestimo";
import type { ItemEmprestimoConsultaDTO } from "../../../main/entities/ConsultaEmprestimo";

type Aba = "pendentes" | "historico";

const ITENS_POR_PAGINA = 10;
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
          dataDevolucao: null,
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

const filtradosPorAba = emprestimosAgrupados
  .filter(({ emprestimo }) =>
    aba === "pendentes"
      ? emprestimo.status === "PENDENTE"
      : emprestimo.status !== "PENDENTE"
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
      return (b.id ?? 0) - (a.id ?? 0);
    }
    return (a.professorNome || "").localeCompare(b.professorNome || "", "pt-BR");
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(emprestimosExibidos.length / ITENS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const emprestimosPaginados = emprestimosExibidos.slice(
    inicio,
    inicio + ITENS_POR_PAGINA
  );

  const abaClass = (ativa: boolean) =>
    `pb-3 px-1 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
      ativa
        ? "text-[#389348] border-[#389348]"
        : "text-gray-500 border-transparent hover:text-gray-700"
    }`;

  const nomeAba = aba === "pendentes" ? "pendente" : "concluído ou cancelado";

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 min-w-0 px-8 pt-6 pb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Gerenciar empréstimos
        </h1>

        <ToastFeedback mensagem={feedback} tipo="sucesso" onClose={fecharFeedback} />
        <ToastFeedback mensagem={erro} tipo="erro" onClose={fecharErro} />

        <div className="flex gap-8 border-b border-[#E6F0E8] mb-4">
          <button
            type="button"
            className={abaClass(aba === "pendentes")}
            onClick={() => setAba("pendentes")}
          >
            Empréstimos Pendentes
          </button>
          <button
            type="button"
            className={abaClass(aba === "historico")}
            onClick={() => setAba("historico")}
          >
            Concluídos e Cancelados
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4 w-full">
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
            className="h-11 px-6 flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-medium text-sm hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer shrink-0 active:scale-95"
          >
            <MdAdd size={18} />
            Realizar empréstimo
          </button>
        </div>

        {carregando ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">Carregando empréstimos...</p>
          </div>
        ) : emprestimosExibidos.length === 0 ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">
              {termoBusca.trim()
                ? `Nenhum empréstimo ${nomeAba} encontrado para "${termoBusca}".`
                : `Nenhum empréstimo ${nomeAba}.`}
            </p>
          </div>
        ) : (
          <div
            key={`${termoBusca}-${aba}-${ordenacao}-${paginaAtual}`}
            className="animate-fade-in duration-300"
          >
            <ListaEmprestimo
              modo={aba}
              emprestimos={emprestimosPaginados}
              onVerDetalhes={(e) => router.push(`/emprestimo/detalhes?id=${e.id}`)}
              onCancelar={(e) => setEmprestimoParaCancelar(e)}
            />

            <Paginacao
              paginaAtual={paginaAtual}
              totalItens={emprestimosExibidos.length}
              itensPorPagina={ITENS_POR_PAGINA}
              nomeEntidade={aba === "pendentes" ? "empréstimos pendentes" : "empréstimos"}
              nomeEntidadeSingular={aba === "pendentes" ? "empréstimo pendente" : "empréstimo"}
              aoMudarPagina={setPaginaAtual}
            />
          </div>
        )}

        <ModalConfirmarAcao
          aberto={emprestimoParaCancelar !== null}
          titulo="Cancelar empréstimo"
          variante="perigo"
          textoConfirmar="Cancelar empréstimo"
          mensagem={
            emprestimoParaCancelar ? (
              <>
                Tem certeza que deseja cancelar este empréstimo?
                <span className="block font-bold text-gray-800 text-xs mt-1">
                  Professor:{" "}
                  <span className="text-sm font-normal text-gray-600">
                    {emprestimoParaCancelar.professorNome}
                  </span>
                </span>
                <span className="block font-bold text-gray-800 text-xs">
                  Turma:{" "}
                  <span className="text-sm font-normal text-gray-600">
                    {emprestimoParaCancelar.turmaNome}
                  </span>
                </span>
                <span className="block font-bold text-gray-800 text-xs">
                  Data Reirada:{" "}
                  <span className="text-sm font-normal text-gray-600">
                    {new Date(emprestimoParaCancelar.dataRetirada).toLocaleDateString("pt-BR")}
                  </span>
                </span>
                <span className="block font-bold text-gray-800 text-xs">
                  Exemplares Emprestados:{" "}
                  <span className="text-sm font-normal text-gray-600">
                    {emprestimoParaCancelar.quantidadeExemplares}{" "}
                    {emprestimoParaCancelar.quantidadeExemplares === 1
                      ? "exemplar"
                      : "exemplares"
                    }
                  </span>
                </span>
              </>
            ) : (
              ""
            )
          }
          onCancelar={() => setEmprestimoParaCancelar(null)}
          onConfirmar={confirmarCancelamento}
        />
      </main>
    </div>
  );
}
