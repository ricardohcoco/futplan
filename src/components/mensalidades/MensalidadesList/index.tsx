import type { MensalidadeComDetalhes } from "../../../types/mensalidades";
import styles from "./MensalidesList.module.css";

type MensalidadesListProps = {
    mensalidades: MensalidadeComDetalhes[];
    carregando: boolean;
    registrandoPagamento: string | null;
    onRegistrarPagamento: (mensalidade: string) => Promise<void>;
};

function formatarData(data: string): string {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function formatarMesReferencia(data: string): string {
    const [ano, mes] = data.split("-");
    return `${mes}/${ano}`;
}

function formatarValor(valor: number): string {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function estaAtrasada(dataVencimento: string): boolean {
    const hoje = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    return dataVencimento < hoje;
}

export default function MensalidadesList({
    mensalidades,
    carregando,
    registrandoPagamento,
    onRegistrarPagamento,
}: MensalidadesListProps) {
    if (carregando) {
        return <p>Carregando mensalidades...</p>;
    }

    return (
        <section className={styles.container}>
            <h2>Mensalidades cadastradas</h2>

            {mensalidades.length === 0 ? (
                <p>Nenhuma mensalidade cadastrada.</p>
            ) : (
                <div className={styles.lista}>
                    {mensalidades.map((mensalidade) => (
                        <article
                            key={mensalidade.id}
                            className={styles.card}
                        >
                            <h3>{mensalidade.matriculas.alunos.nome}</h3>

                            <p>
                                <strong>Turma:</strong>{" "}
                                {mensalidade.matriculas.turmas.nome}
                            </p>

                            <p>
                                <strong>Referência:</strong>{" "}
                                {formatarMesReferencia(mensalidade.mes_referencia)}
                            </p>

                            <p>
                                <strong>Valor:</strong>{" "}
                                {formatarValor(mensalidade.valor)}
                            </p>

                            <p>
                                <strong>Vencimento:</strong>{" "}
                                {formatarData(mensalidade.data_vencimento)}
                            </p>

                            <p>
                                <strong>Situação:</strong>{" "}
                                {mensalidade.situacao === "paga" 
                                ? "Paga" 
                                : estaAtrasada(mensalidade.data_vencimento)
                                    ? "Atrasada"
                                    : "Pendente"}
                            </p>

                            {mensalidade.data_pagamento && (
                                <p>
                                    <strong>Pagamento:</strong>{" "}
                                    {formatarData(mensalidade.data_pagamento)}
                                </p>
                            )}

                            {mensalidade.situacao === "pendente" && (
                                <button
                                    className={styles.botaoPagamento}
                                    type="button"
                                    disabled={registrandoPagamento !== null}
                                    onClick={() => onRegistrarPagamento(mensalidade.id)}
                                >
                                    {registrandoPagamento === mensalidade.id
                                    ? "Registrando" 
                                    : "Registrar pagamento"}
                                </button>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}