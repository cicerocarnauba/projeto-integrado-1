import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

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
        placeholder={placeholder}
        onFocus={abrir}
        onClick={abrir}
        onChange={(e) => {
          if (!aberto) setAberto(true);
          setTermo(e.target.value);
        }}
        onKeyDown={aoPressionarTecla}
        // pr-10 reserva o espaço da seta: o texto nunca passa por baixo dela
        className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl pl-4 pr-10 text-sm text-gray-800 placeholder:text-gray-600 truncate outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60 disabled:cursor-not-allowed"
      />

      {/* Seta sempre à mesma distância da borda direita, em todos os campos */}
      <MdKeyboardArrowDown
        size={20}
        aria-hidden="true"
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 transition-transform ${
          aberto ? "rotate-180" : ""
        }`}
      />

      {aberto && (
        <ul
          id={`${id}-lista`}
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-60 overflow-auto bg-white border border-[#cde5d3] rounded-xl shadow-lg py-1"
        >
          {filtradas.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">{mensagemVazia}</li>
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
                className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${
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
                  <span className="shrink-0 text-xs text-[#5AA365]">
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

