import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../../components/Sidebar";
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
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8 flex flex-col animate-fade-in">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">
            Editar detalhes do livro
          </h1>

          <button
            type="button"
            onClick={() => router.push("/livro")}
            className="flex items-center gap-1.5 bg-[#2e8b45] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#236c35] transition-all shadow-sm cursor-pointer"
          >
            <MdArrowBack size={18} />
            Voltar
          </button>
        </div>

        <div>
          {carregando ? (
            <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
              <p className="text-base font-medium">Carregando livro...</p>
            </div>
          ) : erro ? (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          ) : inativo ? (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Apenas livros com status "Ativo" podem ser editados. Reative o
              livro antes de editar.
            </div>
          ) : (
            livro && <FormEditarLivro key={livro.id} livro={livro} />
          )}
        </div>
      </main>
    </div>
  );
}
