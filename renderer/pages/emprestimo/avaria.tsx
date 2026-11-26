import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MdArrowBack, MdCheck, MdClear } from "react-icons/md";
import PageShell from "../../components/PageShell";
import EstadoLista from "../../components/EstadoLista";
import ToastFeedback from "../../components/ToastFeedback";
import ModalConfirmarAcao from "../../components/modal/modalConfirmarEmprestimo";
import { EmprestimoDetalhe, ItemEmprestimo } from "../../types/emprestimo";
import { calcularPendente } from "../../utils/emprestimoItem";
import { registrarAvaria } from "../../utils/emprestimoAvaria";

// Rota: /emprestimo/avaria?id=<emprestimoId>&itemId=<itemId>

interface ContadorProps {
  rotulo: string;
  valor: number;
  max: number;
  desabilitado?: boolean;
  onChange: (novo: number) => void;
}

function Contador({ rotulo, valor, max, desabilitado, onChange }: ContadorProps) {
  const botao =
    "w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white disabled:opacity-30 disabled:hover:bg-[#eef7f0] disabled:hover:text-[#1e582d] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-base xl:text-lg cursor-pointer select-none";

  return (
    <div className="flex-1 min-w-[220px]">
      <span className="block text-sm xl:text-base font-semibold text-[#1e582d] mb-1.5 xl:mb-2">
        {rotulo}
      </span>
      <div className="w-full h-10 xl:h-12 p-1 flex items-center justify-between bg-white border border-[#cde5d3] rounded-xl shadow-2xs">
        <button
          type="button"
          aria-label={`Diminuir ${rotulo}`}
          className={botao}
          disabled={desabilitado || valor <= 0}
          onClick={() => onChange(valor - 1)}
        >
          −
        </button>
        <span className="text-sm xl:text-base font-bold text-gray-900 tabular-nums">
          {valor}
        </span>
        <button
          type="button"
          aria-label={`Aumentar ${rotulo}`}
          className={botao}
          disabled={desabilitado || valor >= max}
          onClick={() => onChange(valor + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

function CampoLeitura({
  rotulo,
  valor,
  centralizado = false,
}: {
  rotulo: string;
  valor: string | number;
  centralizado?: boolean;
}) {
  return (
    <div className="min-w-0">
      <span className="block text-sm xl:text-base font-semibold text-[#1e582d] mb-1.5 xl:mb-2">
        {rotulo}
      </span>
      <div
        className={`h-10 xl:h-12 px-3.5 xl:px-4 flex items-center bg-[#f4faf5] border border-[#cde5d3] rounded-xl text-sm xl:text-base text-gray-700 font-medium truncate ${
          centralizado ? "justify-center tabular-nums" : ""
        }`}
      >
        <span className="truncate">{valor}</span>
      </div>
    </div>
  );
}

export default function RegistrarAvaria() {
  const router = useRouter();

  const emprestimoId = Number(router.query.id);
  const itemId = Number(router.query.itemId);

  const [emprestimo, setEmprestimo] = useState<EmprestimoDetalhe | null>(null);
  const [item, setItem] = useState<ItemEmprestimo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [perdidos, setPerdidos] = useState(0);
  const [danificados, setDanificados] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const fecharErro = useCallback(() => setErro(""), []);

  useEffect(() => {
    if (!router.isReady) return;

    if (
      !Number.isSafeInteger(emprestimoId) || emprestimoId <= 0 ||
      !Number.isSafeInteger(itemId) || itemId <= 0
    ) {
      setErro("Empréstimo ou item inválido.");
      setCarregando(false);
      return;
    }

    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      try {
        const resposta = await window.ipc.emprestimo.buscarPorId(emprestimoId);
        if (cancelado) return;

        if (resposta?.success && resposta.data) {
          const dados: EmprestimoDetalhe = resposta.data;
          setEmprestimo(dados);
          setItem((dados.itens ?? []).find((i) => i.id === itemId) ?? null);
        } else {
          setErro(resposta?.error || "Não foi possível carregar o empréstimo.");
        }
      } catch (error) {
        if (cancelado) return;
        console.error("Erro ao carregar empréstimo:", error);
        setErro("Não foi possível carregar o empréstimo.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [router.isReady, emprestimoId, itemId]);

  const pendente = item ? calcularPendente(item) : 0;
  const soma = perdidos + danificados;
  const somaInvalida = soma > pendente;
  const registrarDesabilitado = soma === 0 || somaInvalida || salvando;

  // Bloqueios: só item PENDENTE, de empréstimo PENDENTE, com saldo pendente.
  const bloqueado =
    !!emprestimo &&
    !!item &&
    (emprestimo.status !== "PENDENTE" || item.status !== "PENDENTE" || pendente <= 0);

  function voltar() {
    router.push(`/emprestimo/detalhes?id=${emprestimoId}`);
  }

  async function confirmar() {
    if (!item || salvando || registrarDesabilitado) return;

    setSalvando(true);
    try {
      const resposta = await registrarAvaria(emprestimoId, item.id, {
        quantidadePerdida: perdidos,
        quantidadeDanificada: danificados,
      });

      if (!resposta?.success) {
        setModalAberto(false);
        setErro(resposta?.error || "Não foi possível registrar a avaria.");
        return;
      }

      // A tela de detalhes recarrega o empréstimo e exibe o toast de sucesso.
      router.push(
        `/emprestimo/detalhes?id=${emprestimoId}&sucesso=avaria_registrada`
      );
    } catch (error) {
      console.error("Erro ao registrar avaria:", error);
      setModalAberto(false);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a avaria."
      );
    } finally {
      setSalvando(false);
    }
  }

  const resumoAvaria = [
    perdidos > 0 ? `${perdidos} - Perdido` : null,
    danificados > 0 ? `${danificados} - Danificado` : null,
  ]
    .filter(Boolean)
    .join("; ");

  return (
    <PageShell
      titulo="Registrar avaria"
      acaoTopo={
        <button
          type="button"
          onClick={voltar}
          className="h-10 xl:h-11 px-4 xl:px-5 inline-flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-semibold text-sm xl:text-base hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer shrink-0 active:scale-95"
        >
          <MdArrowBack size={19} />
          Voltar
        </button>
      }
    >
      <ToastFeedback mensagem={erro} tipo="erro" onClose={fecharErro} />

      {carregando ? (
        <EstadoLista carregando mensagem="Carregando item..." />
      ) : !emprestimo || !item ? (
        <EstadoLista mensagem={erro || "Item do empréstimo não encontrado."} />
      ) : bloqueado ? (
        <EstadoLista mensagem="Não é possível registrar avaria para este item." />
      ) : (
        <section className="w-full bg-[#eef7f0] border border-[#cfe5d4] rounded-2xl p-5 sm:p-6 xl:p-8 shadow-xs">
          <div className="space-y-4 xl:space-y-5">
            <CampoLeitura rotulo="Título do livro" valor={item.livroTitulo} />

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 xl:gap-6">
              <div className="sm:col-span-8">
                <CampoLeitura rotulo="Editora" valor={item.editora} />
              </div>
              <div className="sm:col-span-4">
                <CampoLeitura
                  rotulo="Exemplares emprestados"
                  valor={pendente}
                  centralizado
                />
              </div>
            </div>
          </div>

          <hr className="my-4 xl:my-6 border-[#cde5d3]" />

          <h2 className="text-base xl:text-lg font-bold text-[#1e582d] mb-2.5 xl:mb-3.5">
            Avarias
          </h2>

          <div className="flex flex-wrap gap-4 xl:gap-6">
            <Contador
              rotulo="Exemplares perdidos"
              valor={perdidos}
              max={pendente - danificados}
              onChange={setPerdidos}
              desabilitado={salvando}
            />
            <Contador
              rotulo="Exemplares danificados"
              valor={danificados}
              max={pendente - perdidos}
              onChange={setDanificados}
              desabilitado={salvando}
            />
          </div>

          <p className="mt-3.5 xl:mt-4 text-xs xl:text-sm text-[#245B2F]">
            Exemplares pendentes neste empréstimo:{" "}
            <span className="font-bold tabular-nums">{pendente}</span>
            {soma > 0 && !somaInvalida && (
              <span className="text-[#2e8b45] font-medium">
                {" "}
                ({soma} {soma === 1 ? "selecionado" : "selecionados"} · restam{" "}
                {pendente - soma})
              </span>
            )}
          </p>

          {somaInvalida ? (
            <div
              role="alert"
              className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
            >
              A soma de perdidos e danificados não pode ser maior que os
              exemplares pendentes ({pendente}).
            </div>
          ) : null}

          <div className="mt-6 xl:mt-7 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={voltar}
              disabled={salvando}
              className="h-10 xl:h-11 inline-flex items-center justify-center gap-2 px-5 xl:px-6 rounded-xl text-sm xl:text-base font-semibold text-white bg-[#cf4a4a] hover:bg-[#b83a3a] transition-colors shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdClear size={19} />
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              disabled={registrarDesabilitado}
              className="h-10 xl:h-11 inline-flex items-center justify-center gap-2 bg-[#2e8b45] hover:bg-[#236c35] text-white px-6 xl:px-7 rounded-xl text-sm xl:text-base font-semibold transition-all shadow-sm active:scale-95 cursor-pointer disabled:bg-[#9cc9a8] disabled:hover:bg-[#9cc9a8] disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              <MdCheck size={19} />
              {salvando ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </section>
      )}

      <ModalConfirmarAcao
        aberto={modalAberto}
        titulo="Registrar avaria?"
        textoConfirmar="Registrar"
        mensagem={
          item ? (
            <div>
              <p>
                Tem certeza que deseja registrar os exemplares do livro com
                avaria?
              </p>
              <div className="mt-3 rounded-xl bg-[#eef7f0] border border-[#d5ead9] p-3.5 space-y-1 text-sm">
                <p>
                  <span className="font-semibold text-[#1e582d]">Título: </span>
                  <span className="text-gray-800">{item.livroTitulo}</span>
                </p>
                <p>
                  <span className="font-semibold text-[#1e582d]">Editora: </span>
                  <span className="text-gray-800">{item.editora}</span>
                </p>
                <p>
                  <span className="font-semibold text-[#1e582d]">Avaria: </span>
                  <span className="text-gray-800">{resumoAvaria}</span>
                </p>
              </div>
            </div>
          ) : (
            ""
          )
        }
        onCancelar={() => {
          if (!salvando) setModalAberto(false);
        }}
        onConfirmar={confirmar}
      />
    </PageShell>
  );
}
