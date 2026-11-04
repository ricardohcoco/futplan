import { useState } from "react";
import styles from "./ValorMensalidadeForm.module.css";

type ValorMensalidadeFormProps = {
    valorAtual: number | null;
    salvando: boolean;
    onSalvar: (valor: number) => Promise<boolean>;
};

export default function ValorMensalidadeForm({
    valorAtual,
    salvando,
    onSalvar,
}: ValorMensalidadeFormProps) {
    const [valor, setValor] = useState(valorAtual === null ? "" : String(valorAtual));
    const [erroFormulario, setErroFormulario] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErroFormulario("");

        const valorNumerico = Number(valor);

        if (!valor.trim() || !Number.isFinite(valorNumerico) || valorNumerico <= 0) {
            setErroFormulario("Informe um valor maior que zero.");
            return;
        }

        await onSalvar(valorNumerico);
    }

    return (
        <form className={styles.formulario} onSubmit={handleSubmit}>
            <h2>Valor padrão da mensalidade</h2>
            <p>
                Este valor será utilizado nas próximas gerações de mensalidades.
                Cobranças já criadas manterão seus valores originais.
            </p>

            <label htmlFor="valorMensalidade">Valor (R$)</label>

            <input
                id="valorMensalidade"
                type="number"
                min="0.01"
                step="0.01"
                value={valor}
                onChange={(event) => setValor(event.target.value)}
                placeholder="Ex.: 150,00"
                disabled={salvando}
                required
            />

            {erroFormulario && (
                <p className={styles.erro}>{erroFormulario}</p>
            )}

            <button type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar valor"}
            </button>
        </form>
    )
}