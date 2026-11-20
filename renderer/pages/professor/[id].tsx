import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../../components/Sidebar";
import { Professor } from "../../types/professor";
import { MdArrowBack } from "react-icons/md";
import FormEditarProfessor from "../../components/professor/formEditarProfessor";

export default function EditarProfessor() {
  const router = useRouter();

  const [professor, setProfessor] = useState<Professor | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const id = Number(router.query.id);

    if (!Number.isInteger(id) || id <= 0) {
      setErro("Professor não identificado.");
      setCarregando(false);
      return;
    }

    async function carregarProfessor() {
      try {
        const resposta = await window.ipc.professor.buscarPorId(id);

        if (!resposta.success || !resposta.data) {
          setErro(resposta.error || "Professor não encontrado.");
          return;
        }

        setProfessor(resposta.data as Professor);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o professor.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarProfessor();
  }, [router.isReady, router.query.id]);

  const inativo = professor !== null && professor.status !== "ATIVO";

  return (
    <div className="flex min-h-screen bg-[#f8fbf9]">
      <Sidebar />

      <main className="flex-1 min-w-0 px-8 lg:px-10 py-7 flex flex-col animate-fade-in">
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-gray-900">
              Editar informações do professor
            </h1>

            <button
              type="button"
              onClick={() => router.push("/professor")}
              className="h-11 px-5 inline-flex items-center justify-center gap-2 bg-[#2e8b45] text-white rounded-xl text-[15px] font-semibold hover:bg-[#236c35] transition-all shadow-sm cursor-pointer shrink-0 active:scale-95"
            >
              <MdArrowBack size={19} />
              Voltar
            </button>
          </div>

          <div>
            {carregando ? (
              <div className="w-full bg-white border border-[#cfe5d4] rounded-2xl p-12 text-center text-[#1e582d] shadow-xs">
                <p className="text-base font-medium">Carregando professor...</p>
              </div>
            ) : erro ? (
              <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-[15px] text-red-700">
                {erro}
              </div>
            ) : inativo ? (
              <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-[15px] text-red-700">
                Apenas professores com status &quot;Ativo&quot; podem ser editados. Reative
                o cadastro antes de editar.
              </div>
            ) : (
              professor && (
                <FormEditarProfessor key={professor.id} professor={professor} />
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
