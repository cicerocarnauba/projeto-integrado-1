import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PageShell from "../../components/PageShell";
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
    <PageShell
      titulo="Editar informações do professor"
      acaoTopo={
        <button
          type="button"
          onClick={() => router.push("/professor")}
          className="h-10 xl:h-11 px-4 xl:px-5 inline-flex items-center justify-center gap-2 bg-[#2e8b45] text-white rounded-xl text-sm xl:text-base font-semibold hover:bg-[#236c35] transition-all shadow-sm cursor-pointer shrink-0 active:scale-95"
        >
          <MdArrowBack size={19} />
          Voltar
        </button>
      }
    >
      <div>
        {carregando ? (
          <div className="w-full bg-white border border-[#cfe5d4] rounded-2xl p-10 text-center text-[#1e582d] shadow-xs">
            <p className="text-base font-medium">Carregando professor...</p>
          </div>
        ) : erro ? (
          <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-base text-red-700">
            {erro}
          </div>
        ) : inativo ? (
          <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-base text-red-700">
            Apenas professores com status &quot;Ativo&quot; podem ser editados. Reative
            o cadastro antes de editar.
          </div>
        ) : (
          professor && (
            <FormEditarProfessor key={professor.id} professor={professor} />
          )
        )}
      </div>
    </PageShell>
  );
}
