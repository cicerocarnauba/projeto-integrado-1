/**
 * Larguras padronizadas das colunas âncora (lado direito) das tabelas do sistema.
 * Mantém "Ações", "Status" e "Exemplares" alinhados na mesma posição entre telas,
 * sempre preservando largura mínima confortável para a coluna principal à esquerda.
 */
export const TABLE_COL_WIDTHS = {
  acoes: "244px",
  status: "192px",
  exemplares: "212px",
  avaria: "140px",
  dataRetirada: "136px",
  dataDevolucao: "156px",
} as const;
