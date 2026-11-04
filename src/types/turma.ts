export type TurnoTurma = "manha" | "tarde";

export type DiaSemana = 1 | 2 | 3 | 4 | 5;

export type Turma = {
    id: string;
    nome: string;
    idade_minima: number;
    idade_maxima: number;
    turno: TurnoTurma;
    hora_inicio: string;
    hora_fim: string;
    capacidade_maxima: number;
    ativo: boolean;
};

export type NovaTurma = Omit<Turma, "id" | "ativo"> & {
    dias_treino: DiaSemana[];
};

export type TurmaComDias = Turma & {
    dias_treino: {
        dia_semana: DiaSemana;
    }[];
};