import { RefObject, useEffect, useState } from "react";

interface UseItensPorPaginaOptions {
  /** Contêiner flex-1 que envolve a tabela e a paginação para medição exata. */
  containerRef?: RefObject<HTMLElement | null>;
  /** Espaço vertical fixo estimado como fallback quando containerRef não é informado (px). */
  alturaFixa?: number;
  /** Altura de cada linha da tabela em modo amplo de 1 linha (px). */
  alturaLinha?: number;
  /** Altura de cada linha da tabela quando exibe subtítulo empilhado em telas menores (px). */
  alturaLinhaCompacta?: number;
  /** Largura abaixo da qual a tabela exibe subtítulo empilhado (px). */
  breakpointCompacto?: number;
  /** Quantidade mínima de itens exibidos por página. */
  minimo?: number;
  /** Valor inicial antes da primeira medição no cliente (evita mismatch SSR). */
  padrao?: number;
}

/**
 * Calcula dinamicamente quantas linhas cabem na área visível atual da janela sem exigir
 * rolagem vertical. Usa ResizeObserver no contêiner disponível da listagem para se
 * adaptar exatamente a qualquer resolução, escala de tela (DPI) ou quebra de cabeçalho.
 */
export function useItensPorPagina({
  containerRef,
  alturaFixa = 290,
  alturaLinha = 54,
  alturaLinhaCompacta = 57,
  breakpointCompacto = 1280,
  minimo = 2,
  padrao = 5,
}: UseItensPorPaginaOptions = {}): number {
  const [itensPorPagina, setItensPorPagina] = useState<number>(padrao);

  useEffect(() => {
    function calcular() {
      const largura = window.innerWidth;
      const linhaEfetiva =
        breakpointCompacto > 0 && largura < breakpointCompacto
          ? alturaLinhaCompacta
          : alturaLinha;

      const container = containerRef?.current;

      if (container && container.clientHeight > 0) {
        const theadEl = container.querySelector("thead");
        const alturaThead = theadEl
          ? theadEl.getBoundingClientRect().height + 2
          : largura < 1280
            ? 42
            : 48;

        const paginacaoEl = container.querySelector(
          "[data-paginacao]"
        ) as HTMLElement | null;

        let alturaPaginacao = largura < 640 ? 96 : largura < 1280 ? 58 : 65;
        if (paginacaoEl) {
          const margemTopo =
            parseFloat(window.getComputedStyle(paginacaoEl).marginTop) || 0;
          alturaPaginacao = Math.max(
            alturaPaginacao,
            paginacaoEl.getBoundingClientRect().height + margemTopo
          );
        }

        const folgaSeguranca = 8;
        const espacoLinhas =
          container.clientHeight - alturaThead - alturaPaginacao - folgaSeguranca;
        const quantidade = Math.max(minimo, Math.floor(espacoLinhas / linhaEfetiva));
        setItensPorPagina((atual) => (atual === quantidade ? atual : quantidade));
        return;
      }

      const espacoDisponivel = window.innerHeight - alturaFixa;
      const quantidade = Math.max(minimo, Math.floor(espacoDisponivel / linhaEfetiva));
      setItensPorPagina((atual) => (atual === quantidade ? atual : quantidade));
    }

    calcular();

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    const container = containerRef?.current;

    if (container && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => calcular());
      resizeObserver.observe(container);
    }

    if (container && typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(() => calcular());
      mutationObserver.observe(container, { childList: true });
    }

    window.addEventListener("resize", calcular);
    return () => {
      window.removeEventListener("resize", calcular);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [
    containerRef,
    alturaFixa,
    alturaLinha,
    alturaLinhaCompacta,
    breakpointCompacto,
    minimo,
  ]);

  return itensPorPagina;
}
