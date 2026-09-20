
import Link from 'next/link';export default function Home() {
  return (
    <div>
      <h1>Biblioteca Maria de Lourdes</h1>
      <p>Projeto funcionando!</p>
      <Link href="/livro/cadastro_livro">Ir pra Cadastro de Livro</Link>
    </div>
    
  );
}