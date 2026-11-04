export type SituacaoMensalidade = "pendente" | "paga";

export type Mensalidade = {
    id: string;
    matricula_id: string;
    mes_referencia: string;
    valor: number;
    data_vencimento: string;
    data_pagamento: string | null;
    situacao: SituacaoMensalidade;
};

export type MensalidadeComDetalhes = Mensalidade & {
    matriculas: {
        aluno_id: string;
        alunos: {
            nome: string;
        };
        turmas: {
            nome: string;
        };
    };
};

