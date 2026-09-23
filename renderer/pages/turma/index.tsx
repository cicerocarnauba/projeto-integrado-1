import Link from "next/link";

import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/Searchbar";
import CardTurma from "../../components/turma/cardTurma"


import { MdAdd } from "react-icons/md";

export default function GerenciarTurmas() {
  const router = useRouter();
  const mostrarSucesso = router.query.sucesso === "1";

  const [turmas, setTurma] = useState<any[]>([]);
  const [carregada, setCarregada] = useState(true);
  const [erro, setErro] = useState("");

  const [termoBusca, setTermoBusca] = useState("");
  const [incluirInativos, setIncluirInativos] = useState<boolean>(false);

  useEffect(() => {
    async function carregarTurmas() {
      try {
        setErro("");

        const resposta = await window.ipc.turma.consultar({
          nome: termoBusca,
          incluirInativos: incluirInativos,
        });

        if (!resposta.success){
          setErro(resposta.error);
          return;
        }

        setTurma(resposta.data);
      } catch(error) {
        const mensagem = 
          error instanceof Error
            ? error.message
            : "Não foi possível carregar turmas."

        setErro(mensagem);
      } finally {
        setCarregada(false);
      }
    }

    carregarTurmas();
  }, [termoBusca, incluirInativos])

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Gerenciar turmas
        </h1>

        {mostrarSucesso && (
          <div className="bg-[#d8f3dc] text-[#2e8b45] px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
            ✓ Turma cadastrada com sucesso!
          </div>
        )}

        {/* Barra de busca e botão de adicionar */}
        <div className="flex items-center gap-4 mb-8 w-full">
          <SearchBar 
            placeholder="Pesquisar turmas por nome." 
            valorBusca={termoBusca}
            onChangeBusca={setTermoBusca}
            incluirInativos={incluirInativos}
            onToggleInativos={setIncluirInativos}
            labelCheckbox="Incluir inativos"
          />

          <Link
            href="/turma/cadastro_turma"
            className="h-11 px-6 flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-medium text-sm hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer"
          >
            <MdAdd size={18} />
            Adicionar turma
          </Link>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {erro}
          </div>
        )}
        
        {carregada ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">
              Carregando turmas...
            </p>
          </div>
        ): turmas.length === 0 ? (
          <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
            <p className="text-base font-medium">
              Nenhuma turma cadastrada.
            </p>
          </div>
        ) : (
          <div
            key={`${termoBusca}-${incluirInativos}`}
            className="animate-fade-in duration-1000">
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {turmas.map((turma) => (
                <CardTurma
                  key={turma.id}
                  turma={turma}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}