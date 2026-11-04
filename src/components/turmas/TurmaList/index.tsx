import { useState } from "react";
import type { DiaSemana, TurmaComDias } from "../../../types/turma";
import styles from "./TurmaList.module.css";

type TurmaListProps = {
  turmas: TurmaComDias[];
  carregando: boolean;
  salvando: boolean;
  onEditar: (turma: TurmaComDias) => void;
  onInativar: (turma: TurmaComDias) => void;
};

type FiltroTurma = "todas" | "ativas" | "inativas";

const NOMES_DIAS: Record<DiaSemana, string> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
};

function formatarHorario(horario: string): string {
  return horario.slice(0, 5);
}

export default function TurmasList({
  turmas,
  carregando,
  salvando,
  onEditar,
  onInativar,
}: TurmaListProps) {
  const [filtro, setFiltro] = useState<FiltroTurma>("ativas");

  const turmasFiltradas = turmas.filter((turma) => {
    if (filtro === "ativas") {
      return turma.ativo;
    }

    if (filtro === "inativas") {
      return !turma.ativo;
    }

    return true;
  });

  return (
    <section className={styles.card}>
      <h2>Turmas cadastradas</h2>

      <div className={styles.filtros}>
        <button
          type="button"
          className={filtro === "ativas" ? styles.filtroAtivo : ""}
          onClick={() => setFiltro("ativas")}
        >
          Ativas
        </button>

        <button
          type="button"
          className={filtro === "inativas" ? styles.filtroAtivo : ""}
          onClick={() => setFiltro("inativas")}
        >
          Inativas
        </button>

        <button
          type="button"
          className={filtro === "todas" ? styles.filtroAtivo : ""}
          onClick={() => setFiltro("todas")}
        >
          Todas
        </button>
      </div>

      {carregando ? (
        <p>Carregando turmas...</p>
      ) : turmas.length === 0 ? (
        <p>Nenhuma turma cadastrada.</p>
      ) : turmasFiltradas.length === 0 ? (
        <p>Nenhuma turma encontrada neste filtro.</p>
      ) : (
        <ul className={styles.lista}>
          {turmasFiltradas.map((turma) => {
            const dias = [...turma.dias_treino]
              .sort((a, b) => a.dia_semana - b.dia_semana)
              .map((item) => NOMES_DIAS[item.dia_semana])
              .join(", ");

            return (
              <li key={turma.id} className={styles.item}>
                <strong>{turma.nome}</strong>

                <span>
                  Faixa etária: {turma.idade_minima} a {turma.idade_maxima} anos
                </span>

                <span>
                  Turno: {turma.turno === "manha" ? "Manhã" : "Tarde"}
                </span>

                <span>
                  Horário: {formatarHorario(turma.hora_inicio)} às{" "}
                  {formatarHorario(turma.hora_fim)}
                </span>

                <span>Dias de treino: {dias}</span>

                <span>Capacidade máxima: {turma.capacidade_maxima} alunos</span>

                <span>Situação: {turma.ativo ? "Ativa" : "Inativa"}</span>

                {turma.ativo && (
                  <div className={styles.acoes}>
                    <button
                      type="button"
                      className={styles.botaoEditar}
                      onClick={() => onEditar(turma)}
                      disabled={salvando}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className={styles.botaoInativar}
                      onClick={() => onInativar(turma)}
                      disabled={salvando}
                    >
                      Inativar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
