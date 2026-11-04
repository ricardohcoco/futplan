import styles from "./MensalidadesFiltros.module.css";

export type SituacaoFiltro = "" | "pendente" | "atrasada" | "paga";

type MensalidadesFiltrosProps = {
  mes: string;
  situacao: SituacaoFiltro;
  onAlterarMes: (mes: string) => void;
  onAlterarSituacao: (situacao: SituacaoFiltro) => void;
  onLimpar: () => void;
};

export default function MensalidadesFiltros({
  mes,
  situacao,
  onAlterarMes,
  onAlterarSituacao,
  onLimpar,
}: MensalidadesFiltrosProps) {
  return (
    <div className={styles.filtros}>
      <div className={styles.campoFiltro}>
        <label htmlFor="mesFiltro">Mês de referência</label>

        <input
          id="mesFiltro"
          type="month"
          value={mes}
          onChange={(event) => onAlterarMes(event.target.value)}
        />
      </div>

      <div className={styles.campoFiltro}>
        <label htmlFor="situacaoFiltro">Situação</label>

        <select
          id="situacaoFiltro"
          value={situacao}
          onChange={(event) =>
            onAlterarSituacao(event.target.value as SituacaoFiltro)
          }
        >
          <option value="pendente">Pendentes</option>
          <option value="atrasada">Atrasadas</option>
          <option value="paga">Pagas</option>
          <option value="">Todas</option>
        </select>
      </div>

      <button
        className={styles.botaoLimpar}
        type="button"
        onClick={onLimpar}
      >
        Limpar filtros
      </button>
    </div>
  );
}