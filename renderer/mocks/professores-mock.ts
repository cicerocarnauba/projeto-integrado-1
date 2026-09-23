import { Professor } from "../types/professor";

export const professoresMock: Professor[] = [
    {
        id: 1,
        primeiroNome: "João",
        sobrenome: "Silva",
        email: "joao@email.com",
        status: "ATIVO",
        ativo: true,
        statusEmprestimoProf: "nunca_fez_emprestimo"
    },
    {
        id: 2,
        primeiroNome: "Maria",
        sobrenome: "Santos",
        email: "maria@email.com",
        status: "ATIVO",
        ativo: true,
        statusEmprestimoProf: "tem_emprestimo_historico"
    },
    {
        id: 3,
        primeiroNome: "Pedro",
        sobrenome: "Oliveira",
        email: "pedro@email.com",
        status: "ATIVO",
        ativo: true,
        statusEmprestimoProf: "tem_emprestimo_atualmente"
    },
];