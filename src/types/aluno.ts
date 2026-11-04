export type TurnoEscolar = "manha" | "tarde";

export type Aluno = {
    id: string;
    nome: string;
    data_nascimento: string;
    endereco: string;
    escola: string;
    turno_escolar: TurnoEscolar;
    responsavel_id: string;
    parentesco: string;
    ativo: boolean;
    criado_em: string;
};

export type NovoAluno = Pick<
    Aluno,
    | "nome"
    | "data_nascimento"
    | "endereco"
    | "escola"
    | "turno_escolar"
    | "responsavel_id"
    | "parentesco"
>;

export type AlunoComResponsavel = Aluno & {
    responsaveis: {
        nome: string;
        telefone: string;
    };
};