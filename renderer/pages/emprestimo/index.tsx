import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import ToastFeedback from "../../components/ToastFeedback";
import { MdAdd } from "react-icons/md";

// Versão MÍNIMA e provisória de /emprestimo, só para dar acesso ao formulário
// de "Realizar empréstimo" (HU19). A listagem completa é de outra task/dev e
// vai substituir este arquivo.
export default function GerenciarEmprestimos() {
  const router = useRouter();
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  // Mostra o aviso quando chega do formulário (?sucesso=emprestimo_realizado)
  // e limpa o parâmetro da URL para não reaparecer ao recarregar a página.
  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.sucesso === "emprestimo_realizado") {
      setMensagemSucesso("Empréstimo realizado com sucesso!");
      router.replace("/emprestimo", undefined, { shallow: true });
    }
  }, [router.isReady, router.query.sucesso]);

  // useCallback mantém a função estável: o ToastFeedback usa ela num useEffect
  // e, sem isso, o tempo de exibição reiniciaria a cada renderização.
  const fecharToast = useCallback(() => setMensagemSucesso(""), []);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 min-w-0 p-8 flex flex-col animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">
            Gerenciar empréstimos
          </h1>

          <button
            type="button"
            onClick={() => router.push("/emprestimo/novo")}
            className="flex items-center gap-1.5 bg-[#2e8b45] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#236c35] transition-all shadow-sm cursor-pointer"
          >
            <MdAdd size={18} />
            Realizar empréstimo
          </button>
        </div>

        <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
          <p className="text-base font-medium">
            Nenhum empréstimo realizado ainda.
          </p>
        </div>
      </main>

      <ToastFeedback
        mensagem={mensagemSucesso}
        tipo="sucesso"
        onClose={fecharToast}
      />
    </div>
  );
}
