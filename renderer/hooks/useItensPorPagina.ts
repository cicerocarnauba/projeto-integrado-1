import { useEffect, useState } from "react";

interface UseItensPorPaginaOptions {
  /** Espaço vertical ocupado por cabeçalho, abas, busca, thead e paginação (px). */
  alturaFixa?: number;
  /** Altura média de cada linha da tabela (px). */
  alturaLinha?: number;
  /** Quantidade mínima de itens exibidos por página. */
  minimo?: number;
  /** Valor inicial usado antes da primeira medição no cliente (evita mismatch SSR). */
  padrao?: number;
}

/**
 * Calcula dinamicamente quantas linhas cabem na altura atual da janela sem exigir
 * rolagem vertical. Atualiza automaticamente ao redimensionar a janela.
 */
export function useItensPorPagina({
  alturaFixa = 320,
  alturaLinha = 53,
  minimo = 3,
  padrao = 10,
}: UseItensPorPaginaOptions = {}): number {
  const [itensPorPagina, setItensPorPagina] = useState<number>(padrao);

  useEffect(() => {
    function calcular() {
      const espacoDisponivel = window.innerHeight - alturaFixa;
      const quantidade = Math.max(minimo, Math.floor(espacoDisponivel / alturaLinha));
      setItensPorPagina((atual) => (atual === quantidade ? atual : quantidade));
    }

    calcular();
    window.addEventListener("resize", calcular);
    return () => window.removeEventListener("resize", calcular);
  }, [alturaFixa, alturaLinha, minimo]);

  return itensPorPagina;
}
