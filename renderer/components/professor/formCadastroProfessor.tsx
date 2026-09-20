import { useState } from "react";
import { MdClear, MdCheck} from "react-icons/md";

export default function FormCadastroProfessor() {
    const [nome, setNome] = useState("");
    const [sobreNome, setSobreNome] = useState("");
    const [email, setEmail] = useState("");

  function salvar() {
    const professor = {
      nome,
      sobreNome,
      email,
    };

    console.log(professor);
  }

  function cancelar() {
    setNome("");
    setSobreNome("");
    setEmail("");
  }


  return (
    <div className="border-2 border-[#2e8b45] rounded-[20px] p-3 max-w-full">
      <div className="flex gap-10 mb-4">
        <div className="flex-2 bg-[#F4F8FF] border border-[#D0E0FE] rounded-[15px] p-2">
          <label className="text-xs text-[#A2ACBE] font-medium mb-2 block">
            Primeiro nome
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-[#F8FFFC] border border-[#D0E0FE] rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#A2ACBE]"
          />
        </div>
          <div className="flex-4 bg-[#F4F8FF] border border-[#D0E0FE] rounded-[15px] p-2">
          <label className="text-xs text-[#A2ACBE] font-medium mb-2 block">
            Sobrenome
          </label>
          <input
            type="text"
            value={sobreNome}
            onChange={(e) => setSobreNome(e.target.value)}
            className="w-full bg-[#F8FFFC] border border-[#D0E0FE] rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#A2ACBE]"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-[#F4F8FF] border border-[#D0E0FE] rounded-[15px] p-2">
          <label className="text-xs text-[#A2ACBE] font-medium mb-2 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border border-[#D0E0FE] rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#A2ACBE]"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          onClick={cancelar}
          className="flex items-center gap-1 bg-red-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
        >
          <MdClear size={20}/>
          Cancelar
        </button>

        <button
          onClick={salvar}
          className="flex items-center gap-1 bg-[#2e8b45] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#236c35] transition-colors"
        >
          <MdCheck size={20}/>
          Confirmar
        </button>
      </div>
    </div>
  );
}
