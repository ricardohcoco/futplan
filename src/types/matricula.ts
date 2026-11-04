export type NovaMatricula = {
    aluno_id: string;
    turma_id: string;
};

export type Matricula = {
    id: string;
    aluno_id: string;
    turma_id: string;
    data_inicio: string;
    data_encerramento: string | null;
    ativo: boolean;
};

export type MatriculaComDetalhes = Matricula & {
    alunos: {
        nome: string;
    };
    turmas: {
        nome: string;
        turno: "manha" | "tarde";
        hora_inicio: string;
        hora_fim: string;
        dias_treino: {
            dia_semana: number;
        }[];
    };
};