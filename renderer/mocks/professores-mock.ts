import { Professor } from "../types/professor";

export const professoresMock: Professor[] = [
    {
        id: 1,
        nome: "João",
        sobrenome: "Silva",
        email: "joao@email.com",
        ativo: true,
        statusEmprestimoProf: "nunca_fez_emprestimo"
    },
    {
        id: 2,
        nome: "Maria",
        sobrenome: "Santos",
        email: "maria@email.com",
        ativo: true,
        statusEmprestimoProf: "tem_emprestimo_historico"
    },
    {
        id: 3,
        nome: "Pedro",
        sobrenome: "Oliveira",
        email: "pedro@email.com",
        ativo: true,
        statusEmprestimoProf: "tem_emprestimo_atualmente"
    },
];