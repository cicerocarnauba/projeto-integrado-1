import {useState} from 'react';

export default function FormCadastroLivro() {
    const [titulo, setTitulo] = useState('');
    const [editora, setEditora] = useState('');
    const [quantidadeTotal, setQuantidadeTotal] = useState(0);
    

    function salvar() {
        const livro = {
        titulo,
        editora,
        quantidadeTotal,
        };

        console.log(livro);
    }

    function cancelar() {
        setTitulo('');
        setEditora('');
        setQuantidadeTotal(0);
    }

    function incrementar() {
        setQuantidadeTotal(quantidadeTotal + 1);
    }

    function decrementar() {
        if (quantidadeTotal > 0) {
            setQuantidadeTotal(quantidadeTotal- 1);
        }
    }


    return (
        <div>
            <input
            type = 'text'
            value = {titulo}
            onChange = { (e) => setTitulo(e.target.value) }
        />
        <p> Você digitou : {titulo}</p>

        
            <input
            type = 'text'
            value = {editora}
            onChange = { (e) => setEditora(e.target.value) }
        />
        <p> Você digitou : {editora}</p>

       
        <button onClick={decrementar}>-</button>
        <span>{quantidadeTotal}</span>
        <button onClick={incrementar}>+</button>

        
        <button onClick={salvar}>Salvar</button>
        <button onClick={cancelar}>Cancelar</button>
        
        </div>

    );
}