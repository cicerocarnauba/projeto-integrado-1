import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PageShell from "../../components/PageShell";
import FormEditarLivro from "../../components/livro/formEditarLivro";
import { Livro } from "../../types/livro";
import { MdArrowBack } from "react-icons/md";

export default function EditarLivro() {
  const router = useRouter();

  const [livro, setLivro] = useState<Livro | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const id = Number(router.query.id);

    if (!Number.isInteger(id) || id <= 0) {
      setErro("Livro não identificado.");
      setCarregando(false);
      return;
    }

    async function carregarLivro() {
      try {
        // Não existe canal livro:buscarPorId, então consulta incluindo inativos e filtra pelo id
        const resposta = await window.ipc.livro.consultar({
          incluirInativos: true,
        });

        if (!resposta?.success || !Array.isArray(resposta.data)) {
          setErro(resposta?.error || "Não foi possível carregar o livro.");
          return;
        }

        const encontrado = resposta.data.find((item) => item.id === id);

        if (!encontrado) {
          setErro("Livro não encontrado no acervo.");
          return;
        }

        setLivro({
          ...encontrado,
          id,
          ativo: encontrado.status === "ATIVO",
        });
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o livro.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarLivro();
  }, [router.isReady, router.query.id]);

  const inativo = livro !== null && livro.status !== "ATIVO";

  return (
    <PageShell
      titulo="Editar detalhes do livro"
      maxWidthClass="w-full max-w-5xl"
      acaoTopo={
        <button
          type="button"
          onClick={() => router.push("/livro")}
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
            <p className="text-base font-medium">Carregando livro...</p>
          </div>
        ) : erro ? (
          <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-base text-red-700">
            {erro}
          </div>
        ) : inativo ? (
          <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-base text-red-700">
            Apenas livros com status &quot;Ativo&quot; podem ser editados. Reative o
            livro antes de editar.
          </div>
        ) : (
          livro && <FormEditarLivro key={livro.id} livro={livro} />
        )}
      </div>
    </PageShell>
  );
}
