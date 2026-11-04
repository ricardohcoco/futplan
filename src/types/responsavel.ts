export type Responsavel = {
    id: string;
    nome: string;
    telefone: string;
    consentimento_lgpd: boolean;
    data_consentimento: string | null;
};

export type NovoResponsavel = {
    nome: string;
    telefone: string;
    consentimento_lgpd: boolean;
};

export type EdicaoResponsavel = {
    nome: string;
    telefone: string;
};