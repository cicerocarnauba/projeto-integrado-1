import Sidebar from '../../components/Sidebar';
import FormCadastroLivro from '../../components/livro/formCadastroLivro';

const livros = [
  { id: 1, titulo: 'O Pato e o Cachorro', editora: 'Editora', exemplares: 2, desativado: false },
  { id: 2, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
  { id: 3, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
  { id: 4, titulo: 'O Grande Morango Vermelho', editora: 'Editora', exemplares: 2, desativado: false },
  { id: 5, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
  { id: 6, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
  { id: 7, titulo: 'O Grande Morango Vermelho', editora: 'Editora', exemplares: 2, desativado: false },
  { id: 8, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
  { id: 9, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: true },
  { id: 10, titulo: 'O Grande Morango Vermelho', editora: 'Editora', exemplares: 2, desativado: false },
  { id: 11, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
];


export default function GerenciarLivros() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <p>Gerenciar livros</p>
        <div>
          <h1>Adicionar livro</h1>
          <button><span>←</span>Voltar</button>
        </div>

        <FormCadastroLivro/>
      </main>
      </div>  
    //     {/* /* <h1 className="text-3xl font-bold text-gray-800 mb-6">Gerenciar livros</h1> */ */}

    //     {/* Barra Superior */}
    //     <div className="flex items-center gap-3 mb-8">
    //       <div className="flex-1 bg-gray-50 border border-[#2e8b45] rounded-full px-5 py-2.5 flex items-center justify-between text-gray-700 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2e8b45]/30">
    //         <input 
    //           type="text" 
    //           placeholder="Barra de busca" 
    //           className="bg-transparent placeholder-gray-400 text-gray-800 outline-none w-full text-sm"
    //         />
    //         <span className="text-[#2e8b45]">🔍</span>
    //       </div>

    //       <button className="bg-[#2e8b45] p-2.5 rounded-full text-white hover:bg-[#236c35] transition-colors">
    //         <span>🌪️</span>
    //       </button>

    //       <button className="bg-[#2e8b45] px-5 py-2.5 rounded-full text-white font-medium text-sm flex items-center gap-1 hover:bg-[#236c35] transition-colors">
    //         <span>+</span> Adicionar Livro
    //       </button>
    //     </div>

    //     {/* Grid de Cards */}
    //     <div className="grid grid-cols-3 gap-6">
    //       {livros.map((livro) => (
    //         <div 
    //           key={livro.id} 
    //           className={`border-2 rounded-3xl p-5 flex flex-col justify-between h-40 shadow-sm transition-all hover:shadow-md ${
    //             livro.desativado ? 'border-gray-300 bg-gray-50 opacity-60' : 'border-[#2e8b45] bg-white'
    //           }`}
    //         >
    //           <div>
    //             <h3 className={`font-bold text-base ${livro.desativado ? 'text-gray-600' : 'text-[#2e8b45]'}`}>
    //               {livro.titulo}
    //             </h3>
    //             <p className="text-gray-500 text-xs mt-0.5">{livro.editora}</p>
    //           </div>

    //           <div className="flex items-center justify-between mt-auto">
    //             <span className={`text-xs px-3 py-1 rounded-full font-medium ${
    //               livro.desativado ? 'bg-gray-300 text-gray-700' : 'bg-[#d8f3dc] text-[#2e8b45]'
    //             }`}>
    //               {livro.exemplares} exemplares
    //             </span>

    //             <div className="text-right">
    //               {livro.desativado && (
    //                 <span className="block text-[10px] bg-gray-400 text-white px-2 py-0.5 rounded-full mb-1">
    //                   Desativado
    //                 </span>
    //               )}
    //               <button className={`text-xs font-semibold hover:underline ${
    //                 livro.desativado ? 'text-gray-500' : 'text-[#2e8b45]'
    //               }`}>
    //                 Ver detalhes &gt;
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   </main>
    // </div>
  );
}