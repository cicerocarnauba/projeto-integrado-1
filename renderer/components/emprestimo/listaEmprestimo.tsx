import { MdChecklist, MdClose } from "react-icons/md";
import { Emprestimo, StatusEmprestimo } from "../../types/emprestimo";

interface ListaEmprestimoProps {
  emprestimos: Emprestimo[];
  modo: "pendentes" | "historico";
  onVerDetalhes?: (emprestimo: Emprestimo) => void;
  onCancelar?: (emprestimo: Emprestimo) => void;
}

export const formatarData = (iso?: string | null) =>
  iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString("pt-BR") : "—";

const STATUS_STYLE: Record<StatusEmprestimo, { label: string; badge: string; dot: string }> = {
  PENDENTE: {
    label: "Pendente",
    badge: "bg-[#fff4d6] text-[#b45309] border-[#fde3a1]",
    dot: "bg-[#f59e0b]",
  },
  CONCLUIDO: {
    label: "Concluído",
    badge: "bg-[#d8f3dc] text-[#1e582d] border-[#c1e7c9]",
    dot: "bg-[#2e8b45]",
  },
  CANCELADO: {
    label: "Cancelado",
    badge: "bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]",
    dot: "bg-[#dc2626]",
  },
};

export function StatusBadge({ status }: { status: StatusEmprestimo }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs border ${s.badge}`}
    >
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function ListaEmprestimo({
  emprestimos,
  modo,
  onVerDetalhes,
  onCancelar,
}: ListaEmprestimoProps) {
  const historico = modo === "historico";

  return (
    <div className="w-full bg-white border border-[#D3E8D6] rounded-2xl overflow-hidden shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#ebf5ed] border-b border-[#c8decb] text-sm font-semibold text-[#23582c]">
              <th className="py-3.5 px-4 sm:px-6">Professor responsável</th>
              <th className="py-3.5 px-3 hidden md:table-cell">Turma</th>
              <th className="py-3.5 px-3 hidden lg:table-cell">Data retirada</th>
              {historico && (
                <th className="py-3.5 px-3 hidden lg:table-cell">Data devolução</th>
              )}
              <th className="py-3.5 px-3 text-center">Exemplares emprestados</th>
              <th className="py-3.5 px-3 text-center w-32">
                {historico ? "Status" : "Status do empréstimo"}
              </th>
              <th className={`py-3.5 px-4 text-center ${historico ? "w-[150px]" : "w-[250px]"}`}>
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E6F0E8]">
            {emprestimos.length === 0 && (
              <tr>
                <td
                  colSpan={historico ? 7 : 6}
                  className="py-10 text-center text-sm text-gray-500"
                >
                  {historico
                    ? "Nenhum empréstimo concluído ou cancelado."
                    : "Nenhum empréstimo pendente."}
                </td>
              </tr>
            )}

            {emprestimos.map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-[#f6fbf7]">
                <td className="py-3 px-4 sm:px-6">
                  <span className="text-sm font-medium text-gray-900 block">
                    {e.professorNome}
                  </span>
                  <span className="block md:hidden text-xs text-gray-500 mt-0.5">
                    {e.turmaNome}
                  </span>
                </td>
                <td className="py-3 px-3 hidden md:table-cell text-sm text-gray-700">
                  {e.turmaNome}
                </td>
                <td className="py-3 px-3 hidden lg:table-cell text-sm text-gray-700 tabular-nums">
                  {formatarData(  
                      e.dataRetirada instanceof Date
                      ? e.dataRetirada.toISOString()
                      : e.dataRetirada
                    )}
                </td>
                {historico && (
                  <td className="py-3 px-3 hidden lg:table-cell text-sm text-gray-700 tabular-nums">
                    {formatarData(  
                      e.dataDevolucao instanceof Date
                      ? e.dataDevolucao.toISOString()
                      : e.dataDevolucao
                    )}
                  </td>
                )}
                <td className="py-3 px-3 text-center text-sm font-medium text-gray-900">
                  {e.quantidadeExemplares}{" "}
                  {e.quantidadeExemplares === 1 ? "exemplar" : "exemplares"}
                </td>
                <td className="py-3 px-3 text-center">
                  <StatusBadge status={e.status} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onVerDetalhes?.(e)}
                      className="flex items-center gap-1.5 bg-[#389348] text-white px-3 py-1.5 text-xs rounded-lg font-medium hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
                    >
                      <MdChecklist size={15} />
                      Ver detalhes
                    </button>

                    {!historico && (
                      <button
                        type="button"
                        onClick={() => onCancelar?.(e)}
                        className="flex items-center gap-1.5 bg-[#dc3b3b] text-white px-3 py-1.5 text-xs rounded-lg font-medium hover:bg-[#c42e2e] transition-colors cursor-pointer shrink-0"
                      >
                        <MdClose size={15} />
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
