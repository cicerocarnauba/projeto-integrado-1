
import { MdEdit } from "react-icons/md";
import { Professor } from "../../types/professor";
import ExcluirButton from "../ExcluirButton";
import DesativarButton from "../DesativarButton";
import AtivarButton from "../AtivarButton";

interface CardProfessorProps {
  professor: Professor;
  onEditar?: (professor: Professor) => void;
  onExcluir?: (professor: Professor) => void;
  onDesativar?: (professor: Professor) => void;
  onAtivar?: (professor: Professor) => void;
}

export default function CardProfessor({
  professor,
  onEditar,
  onExcluir,
  onDesativar,
  onAtivar,
}: CardProfessorProps) {
  const ativo = professor.status === "ATIVO" || professor.ativo === true;
  const temHistorico = professor.possuiHistorico ?? false;
  const naoPodeDesativar = professor.possuiEmprestimoPendente === true;

  return (
    <div
      className={`rounded-2xl p-5 w-full h-full min-h-[150px] flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
        ativo ? "bg-[#eef7f0]" : "bg-[#f8faf9] border border-gray-200"
      }`}
    >
      <div>
        <div className="h-7 flex items-center">
          <h3
            title={`${professor.primeiroNome} ${professor.sobrenome}`}
            className={`text-sm font-bold line-clamp-1 pr-1 ${
              ativo ? "text-[#245B2F]" : "text-gray-700"
            }`}
          >
            {professor.primeiroNome} {professor.sobrenome}
          </h3>
        </div>

        <p
          className={`text-xs mt-2 line-clamp-1 ${
            ativo ? "text-[#5AA365]" : "text-gray-500"
          }`}
        >
          {professor.email}
        </p>
      </div>

      <div className="mt-auto">
        <div className="border-t border-[#D3E8D6] my-3" />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs shrink-0 transition-colors ${
              ativo
                ? "bg-[#d8f3dc] text-[#1e582d] border border-[#c1e7c9]"
                : "bg-gray-200/80 text-gray-600 border border-gray-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                ativo ? "bg-[#2e8b45]" : "bg-gray-400"
              }`}
            />
            {ativo ? "Ativo" : "Inativo"}
          </span>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {ativo ? (
              <>
                <button
                  type="button"
                  onClick={() => onEditar?.(professor)}
                  className="flex items-center gap-1.5 bg-[#389348] text-white px-3 py-1.5 text-xs rounded-lg font-medium hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
                >
                  <MdEdit size={14} />
                  Editar
                </button>

                {temHistorico ? (
                  <DesativarButton
                    onClick={() => onDesativar?.(professor)}
                    disabled={naoPodeDesativar}
                    title={
                      naoPodeDesativar
                        ? "Não é possível desativar este professor, pois ele possui empréstimos pendentes."
                        : undefined
                    }
                  />
                ) : (
                  <ExcluirButton onClick={() => onExcluir?.(professor)} />
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  title="Professor desativado não pode ser editado"
                  className="flex items-center gap-1.5 bg-gray-200 text-gray-400 px-3 py-1.5 text-xs rounded-lg font-medium cursor-not-allowed shrink-0"
                >
                  <MdEdit size={14} />
                  Editar
                </button>

                <AtivarButton onClick={() => onAtivar?.(professor)} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}