import Sidebar from '../../components/Sidebar';
import FormCadastroLivro from '../../components/livro/formCadastroLivro';

// const livros = [
//   { id: 1, titulo: 'O Pato e o Cachorro', editora: 'Editora', exemplares: 2, desativado: false },
//   { id: 2, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
//   { id: 3, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
//   { id: 4, titulo: 'O Grande Morango Vermelho', editora: 'Editora', exemplares: 2, desativado: false },
//   { id: 5, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
//   { id: 6, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
//   { id: 7, titulo: 'O Grande Morango Vermelho', editora: 'Editora', exemplares: 2, desativado: false },
//   { id: 8, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
//   { id: 9, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: true },
//   { id: 10, titulo: 'O Grande Morango Vermelho', editora: 'Editora', exemplares: 2, desativado: false },
//   { id: 11, titulo: 'Titulo do Livro', editora: 'Editora', exemplares: 2, desativado: false },
// ];


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
  );
}