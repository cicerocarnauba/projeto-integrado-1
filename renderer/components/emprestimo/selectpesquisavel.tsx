import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MdClose, MdKeyboardArrowDown } from "react-icons/md";

export interface OpcaoSelect {
  value: string;
  label: string;
  // Texto auxiliar alinhado à direita da opção (ex.: "Saldo: 3")
  extra?: string;
  desabilitada?: boolean;
}

interface SelectPesquisavelProps {
  opcoes: OpcaoSelect[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  mensagemVazia?: string;
}

// Ignora maiúsculas/minúsculas e acentos na busca
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export default function SelectPesquisavel({
  opcoes,
  value,
  onChange,
  placeholder = "Selecione...",
  disabled = false,
  mensagemVazia = "Nenhum resultado encontrado.",
}: SelectPesquisavelProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [indiceAtivo, setIndiceAtivo] = useState(0);

  const selecionada = opcoes.find((o) => o.value === value);

  const filtradas = useMemo(() => {
    const busca = normalizar(termo);
    if (!busca) return opcoes;
    return opcoes.filter((o) => normalizar(o.label).includes(busca));
  }, [opcoes, termo]);

  function abrir() {
    if (disabled) return;
    setAberto(true);
  }

  function fechar() {
    setAberto(false);
    setTermo("");
  }

  function escolher(opcao: OpcaoSelect) {
    if (opcao.desabilitada) return;
    onChange(opcao.value);
    fechar();
  }

  // Fecha ao clicar fora do componente
  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        fechar();
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  // Ao abrir ou ao filtrar, a opção ativa volta para a primeira habilitada
  useEffect(() => {
    if (!aberto) return;
    const primeira = filtradas.findIndex((o) => !o.desabilitada);
    setIndiceAtivo(primeira === -1 ? 0 : primeira);
  }, [aberto, termo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mantém a opção ativa visível ao navegar pelo teclado
  useEffect(() => {
    if (!aberto) return;
    document
      .getElementById(`${id}-opcao-${indiceAtivo}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [indiceAtivo, aberto, id]);

  function moverAtivo(direcao: 1 | -1) {
    if (filtradas.length === 0) return;

    let proximo = indiceAtivo;
    for (let i = 0; i < filtradas.length; i++) {
      proximo = (proximo + direcao + filtradas.length) % filtradas.length;
      if (!filtradas[proximo].desabilitada) break;
    }
    setIndiceAtivo(proximo);
  }

  function aoPressionarTecla(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!aberto) abrir();
      else moverAtivo(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!aberto) abrir();
      else moverAtivo(-1);
    } else if (e.key === "Enter") {
      // Evita enviar o formulário ao escolher uma opção
      e.preventDefault();
      if (aberto && filtradas[indiceAtivo]) escolher(filtradas[indiceAtivo]);
    } else if (e.key === "Escape") {
      if (aberto) {
        e.preventDefault();
        fechar();
      }
    } else if (e.key === "Tab") {
      fechar();
    }
  }

  const mostrarBotaoLimpar =
    !disabled && Boolean(selecionada || (aberto && termo.length > 0));

  function limpar(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (aberto && termo.length > 0) {
      setTermo("");
      return;
    }

    onChange("");
    setTermo("");
    setAberto(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={aberto}
        aria-controls={`${id}-lista`}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        // Fechado: mostra a opção escolhida. Aberto: mostra o que está sendo digitado.
        value={aberto ? termo : selecionada?.label ?? ""}
        placeholder={aberto && selecionada ? selecionada.label : placeholder}
        onFocus={abrir}
        onClick={abrir}
        onChange={(e) => {
          if (!aberto) setAberto(true);
          setTermo(e.target.value);
        }}
        onKeyDown={aoPressionarTecla}
        className={`w-full h-10 xl:h-12 bg-white border border-[#cde5d3] rounded-xl pl-3.5 xl:pl-4 ${
          mostrarBotaoLimpar ? "pr-16" : "pr-10"
        } text-sm xl:text-base text-gray-900 ${
          aberto && selecionada
            ? "placeholder:text-gray-500"
            : "placeholder:text-gray-400"
        } truncate outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60 disabled:cursor-not-allowed`}
      />

      {mostrarBotaoLimpar && (
        <button
          type="button"
          onMouseDown={limpar}
          title={aberto && termo.length > 0 ? "Limpar filtro" : "Limpar seleção"}
          aria-label={aberto && termo.length > 0 ? "Limpar filtro" : "Limpar seleção"}
          className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <MdClose size={17} />
        </button>
      )}

      {/* Seta sempre à mesma distância da borda direita, em todos os campos */}
      <MdKeyboardArrowDown
        size={22}
        aria-hidden="true"
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 transition-transform ${
          aberto ? "rotate-180" : ""
        }`}
      />

      {aberto && (
        <ul
          id={`${id}-lista`}
          role="listbox"
          className="absolute z-30 mt-1.5 w-full max-h-64 overflow-auto bg-white border border-[#cde5d3] rounded-xl shadow-xl py-1.5"
        >
          {filtradas.length === 0 ? (
            <li className="px-4 py-2.5 text-sm xl:text-base text-gray-500">
              {mensagemVazia}
            </li>
          ) : (
            filtradas.map((opcao, indice) => (
              <li
                key={opcao.value}
                id={`${id}-opcao-${indice}`}
                role="option"
                aria-selected={opcao.value === value}
                aria-disabled={opcao.desabilitada}
                // mouseDown (e não click) para disparar antes de o campo perder o foco
                onMouseDown={(e) => {
                  e.preventDefault();
                  escolher(opcao);
                }}
                onMouseEnter={() => !opcao.desabilitada && setIndiceAtivo(indice)}
                className={`flex items-center justify-between gap-3 px-3.5 xl:px-4 py-2 xl:py-2.5 text-sm xl:text-base ${
                  opcao.desabilitada
                    ? "text-gray-400 cursor-not-allowed"
                    : "cursor-pointer text-gray-800"
                } ${
                  indice === indiceAtivo && !opcao.desabilitada
                    ? "bg-[#eef7f0]"
                    : ""
                } ${opcao.value === value ? "font-semibold text-[#1e582d]" : ""}`}
              >
                <span className="truncate">{opcao.label}</span>
                {opcao.extra && (
                  <span className="shrink-0 text-xs font-semibold text-[#2e8b45] tabular-nums">
                    {opcao.extra}
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

