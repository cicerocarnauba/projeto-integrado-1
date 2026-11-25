/**
 * Classes responsivas padronizadas das colunas âncora (lado direito) das tabelas.
 * Mantém "Ações", "Status" e "Exemplares" alinhados entre telas sem causar
 * rolagem horizontal ou corte de botões em monitores menores.
 */
export const TABLE_COL_CLASSES = {
  acoes: "w-[204px] xl:w-[224px] 2xl:w-[244px]",
  status: "w-[152px] xl:w-[172px] 2xl:w-[192px]",
  statusCurto: "w-[134px] xl:w-[156px] 2xl:w-[180px]",
  exemplares: "w-[164px] xl:w-[184px] 2xl:w-[212px]",
  avaria: "w-[114px] xl:w-[128px] 2xl:w-[140px]",
  dataRetirada: "w-[128px] 2xl:w-[136px]",
  dataDevolucao: "w-[144px] 2xl:w-[156px]",
} as const;
