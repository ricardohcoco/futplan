import { useState, type FormEvent } from "react";
import type { DadosGeracaoMensalidades } from "../../../services/mensalidades";
import styles from "./GeracaoMensalidadesForm.module.css";

type GeracaoMensalidadesFormProps = {
    gerando: boolean;
    onGerar: (dados: DadosGeracaoMensalidades) => Promise<boolean>;
};

export default function GeracaoMensalidadesForm({
    gerando,
    onGerar,
}: GeracaoMensalidadesFormProps) {
    const [mes, setMes] = useState("");
    const [vencimento, setVencimento] = useState("");
    const [erroFormulario, setErroFormulario] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErroFormulario("");

        if (!mes || !vencimento) {
            setErroFormulario("Informe o mês de referência e o vencimento.");
            return;
        }

        if (vencimento.slice(0, 7) !== mes) {
            setErroFormulario(
                "A data de vencimento deve pertence ao mês de referência."
            );
            return;    
        }

        await onGerar({
            mesReferencia: `${mes}-01`,
            dataVencimento: vencimento,
        });
    }

    return (
       <form className={styles.formulario} onSubmit={handleSubmit}>
            <h2>Gerar mensalidades</h2>

            <p>
                Selecione o mês de referência e a data de vencimento das cobranças.
            </p>

            <label htmlFor="mesReferencia">Mês de referência</label>
            <input
                id="mesReferencia"
                type="month"
                value={mes}
                onChange={(event) => setMes(event.target.value)}
                disabled={gerando}
                required
            />

            <label htmlFor="dataVencimento">Data de vencimento</label>
            <input
                id="dataVencimento"
                type="date"
                value={vencimento}
                onChange={(event) => setVencimento(event.target.value)}
                disabled={gerando}
                required
            />

            {erroFormulario && (
                <p className={styles.erro} role="alert">
                    {erroFormulario}
                </p>
            )}

            <button type="submit" disabled={gerando}>
                {gerando ? "Gerando..." : "Gerar mensalidades"}
            </button>
       </form> 
    );
}