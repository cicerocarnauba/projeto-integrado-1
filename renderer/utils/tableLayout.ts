/**
 * Classes responsivas padronizadas das colunas âncora (lado direito) das tabelas.
 * Calibradas para o início real de cada breakpoint (1280px em `xl` e 1536px em `2xl`,
 * como telas Full HD 1920×1080 com escala de 125% no Windows), preservando largura
 * ampla na coluna principal à esquerda sem cortar botões nem exigir rolagem.
 */
export const TABLE_COL_CLASSES = {
  acoes: "w-[204px] xl:w-[220px] 2xl:w-[224px]",
  acaoUnica: "w-[114px] xl:w-[122px] 2xl:w-[126px]",
  status: "w-[156px] xl:w-[176px] 2xl:w-[178px]",
  statusCurto: "w-[130px] xl:w-[148px] 2xl:w-[156px]",
  exemplares: "w-[168px] xl:w-[192px] 2xl:w-[194px]",
  avaria: "w-[114px] xl:w-[126px] 2xl:w-[132px]",
  dataRetirada: "w-[132px] 2xl:w-[142px]",
  dataDevolucao: "w-[144px] 2xl:w-[154px]",
} as const;
