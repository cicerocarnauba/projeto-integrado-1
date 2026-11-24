import { useEffect, useState } from "react";
import { MdClear, MdReplay } from "react-icons/md";
import { ItemEmprestimo } from "../../types/emprestimo";
import { calcularPendente } from "../../utils/emprestimoItem";

interface ModalDevolverExemplaresProps {
  aberto: boolean;
  item: ItemEmprestimo | null;
  salvando?: boolean;
  /** Erro vindo do back (será usado na integração, subtarefa 6). */
  erroExterno?: string;
  onCancelar: () => void;
  onConfirmar: (quantidade: number) => void;
}

export default function ModalDevolverExemplares({
  aberto,
  item,
  salvando = false,
  erroExterno = "",
  onCancelar,
  onConfirmar,
}: ModalDevolverExemplaresProps) {
  // O campo guarda texto para permitir apagar e digitar livremente
  const [valor, setValor] = useState("0");
  // Só mostra erro depois que a pessoa mexe no campo
  const [tocou, setTocou] = useState(false);

  useEffect(() => {
    if (aberto) {
      setValor("0");
      setTocou(false);
    }
  }, [aberto, item?.id]);

  if (!aberto || !item) {
    return null;
  }

  const pendente = calcularPendente(item);
  const devolvida = item.quantidadeDevolvida ?? 0;
  const { quantidadePerdida: perdida, quantidadeDanificada: danificada } = item;

  const quantidade = valor.trim() === "" ? NaN : Number(valor);

  // --- Validações -------------------------------------------------------
  let erro = "";
  if (Number.isNaN(quantidade) || !Number.isInteger(quantidade)) {
    erro = "Informe uma quantidade válida.";
  } else if (quantidade < 1) {
    erro = "A quantidade deve ser de pelo menos 1 exemplar.";
  } else if (quantidade > pendente) {
    erro = `A quantidade informada (${quantidade}) é maior que o pendente (${pendente}).`;
  }

  const valido = erro === "";
  const baseContador = Number.isNaN(quantidade) ? 0 : quantidade;

  const avarias = [
    perdida > 0 ? `${perdida} - Perdido` : "",
    danificada > 0 ? `${danificada} - Danificado` : "",
  ].filter(Boolean);

  function alterar(texto: string) {
    setTocou(true);
    setValor(texto);
  }

  function incrementar() {
    if (baseContador >= pendente) return;
    setTocou(true);
    setValor(String(baseContador + 1));
  }

  function decrementar() {
    setTocou(true);
    setValor(String(Math.max(0, baseContador - 1)));
  }

  function confirmar() {
    if (!valido || salvando) return;
    onConfirmar(quantidade);
  }

  const btnContador =
    "w-10 h-10 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white disabled:opacity-30 disabled:hover:bg-[#eef7f0] disabled:hover:text-[#1e582d] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-lg cursor-pointer select-none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !salvando) onCancelar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-white border border-[#dcece0] rounded-2xl shadow-2xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-900">
          Devolver os exemplares?
        </h2>

        <p className="mt-2 text-base text-gray-600 leading-relaxed">
          Informe a quantidade de exemplares devolvidos deste livro:
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
            <span className="text-gray-800">
              {avarias.length > 0 ? avarias.join(", ") : "Sem avaria"}
            </span>
          </p>

          {/* Retirada / devolvida / pendente */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 mt-2 border-t border-[#cde5d3] text-sm tabular-nums">
            <span>
              <strong className="font-semibold text-[#1e582d]">Retirados: </strong>
              <span className="text-gray-800">{item.quantidadeEmprestada}</span>
            </span>
            <span>
              <strong className="font-semibold text-[#1e582d]">Devolvidos: </strong>
              <span className="text-gray-800">{devolvida}</span>
            </span>
            <span>
              <strong className="font-semibold text-[#1e582d]">Pendentes: </strong>
              <span className="font-bold text-gray-900">{pendente}</span>
            </span>
          </div>
        </div>

        <label className="block mt-5 mb-2 text-base font-semibold text-[#1e582d]">
          Quantidade de exemplares que serão devolvidos
        </label>

        <div className="w-full h-12 bg-white border border-[#cde5d3] rounded-xl p-1 flex items-center justify-between focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/20">
          <button
            type="button"
            onClick={decrementar}
            disabled={baseContador <= 0 || salvando}
            aria-label="Diminuir quantidade"
            className={btnContador}
          >
            −
          </button>

          <input
            type="number"
            min={0}
            max={pendente}
            value={valor}
            disabled={salvando}
            onChange={(e) => alterar(e.target.value)}
            className="flex-1 text-center font-bold text-base text-gray-900 tabular-nums outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            type="button"
            onClick={incrementar}
            disabled={baseContador >= pendente || salvando}
            aria-label="Aumentar quantidade"
            className={btnContador}
          >
            +
          </button>
        </div>

        {tocou && !valido && (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erro}
          </div>
        )}

        {erroExterno && (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erroExterno}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            disabled={salvando}
            className="h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdClear size={17} />
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmar}
            disabled={!valido || salvando}
            className="h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-sm font-semibold text-white bg-[#2e8b45] hover:bg-[#236c35] transition-colors cursor-pointer disabled:bg-[#9cc9a8] disabled:hover:bg-[#9cc9a8] disabled:cursor-not-allowed"
          >
            <MdReplay size={17} />
            {salvando ? "Devolvendo..." : "Devolver"}
          </button>
        </div>
      </div>
    </div>
  );
}
