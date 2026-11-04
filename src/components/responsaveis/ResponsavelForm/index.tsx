import { useState, type FormEvent } from "react";
import type { NovoResponsavel, Responsavel } from "../../../types/responsavel";
import styles from "../ResponsavelForm/ResponsavelForm.module.css";

type ResponsavelFormProps = {
  responsavelEmEdicao: Responsavel | null;
  salvando: boolean;
  erro: string;
  mensagem: string;
  onSalvar: (dados: NovoResponsavel) => Promise<boolean>;
  onCancelar: () => void;
};

export default function ResponsavelForm({
  responsavelEmEdicao,
  salvando,
  erro,
  mensagem,
  onSalvar,
  onCancelar,
}: ResponsavelFormProps) {
  const [nome, setNome] = useState(responsavelEmEdicao?.nome ?? "");
  const [telefone, setTelefone] = useState(responsavelEmEdicao?.telefone ?? "");
  const [consentimentoLgpd, setConsentimentoLgpd] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nomeValidado = nome.trim();
    const telefoneValidado = telefone.trim();

    if (!nomeValidado || !telefoneValidado) return;

    if (!responsavelEmEdicao && !consentimentoLgpd) return;

    const salvou = await onSalvar({
      nome: nomeValidado,
      telefone: telefoneValidado,
      consentimento_lgpd: responsavelEmEdicao
        ? responsavelEmEdicao.consentimento_lgpd
        : consentimentoLgpd,
    });

    if (salvou) {
      setNome("");
      setTelefone("");
      setConsentimentoLgpd(false);
    }
  }

  function handleCancelar() {
    setNome("");
    setTelefone("");
    onCancelar();
    setConsentimentoLgpd(false);
  }

  return (
    <section className={styles.card}>
      <h2>{responsavelEmEdicao ? "Editar responsável" : "Cadastrar responsável"}</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="nome">Nome completo</label>
        <input
          id="nome"
          type="text"
          maxLength={100}
          required
          value={nome}
          onChange={(event) => setNome(event.target.value)}
        />

        <label htmlFor="telefone">Telefone</label>
        <input
          id="telefone"
          type="tel"
          maxLength={20}
          required
          value={telefone}
          onChange={(event) => setTelefone(event.target.value)}
        />

        {!responsavelEmEdicao && (
          <label className={styles.consentimento}>
            <input
              type="checkbox"
              checked={consentimentoLgpd}
              onChange={(event) => setConsentimentoLgpd(event.target.checked)}
              required
            />

            <span>
              Declaro que o responsável está ciente e autoriza o tratamento dos
              dados pessoais necessários para a gestão do aluno no FutPlan.
            </span>
          </label>
        )}

        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}

        {mensagem && (
          <p className={styles.sucesso} role="status">
            {mensagem}
          </p>
        )}

        <div className={styles.acoesFormulario}>
          <button type="submit" disabled={salvando}>
            {salvando
              ? "Salvando..."
              : responsavelEmEdicao
                ? "Salvar alterações"
                : "Cadastrar responsável"}
          </button>

          {responsavelEmEdicao && (
            <button
              type="button"
              className={styles.botaoSecundario}
              onClick={handleCancelar}
              disabled={salvando}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
