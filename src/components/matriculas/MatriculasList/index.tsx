import { useState } from "react";
import type { MatriculaComDetalhes } from "../../../types/matricula";
import styles from "./MatriculasList.module.css";

type MatriculasListProps = {
  matriculas: MatriculaComDetalhes[];
  carregando: boolean;
  salvando: boolean;
  onEncerrar: (matricula: MatriculaComDetalhes) => void;
};

type FiltroMatricula = "todas" | "ativas" | "encerradas";

function formatarHorario(horario: string): string {
  return horario.slice(0, 5);
}

function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function MatriculasList({
  matriculas,
  carregando,
  salvando,
  onEncerrar,
}: MatriculasListProps) {
  const [filtro, setFiltro] = useState<FiltroMatricula>("ativas");

  const matriculasFiltradas = matriculas.filter((matricula) => {
    if (filtro === "ativas") {
      return matricula.ativo;
    }

    if (filtro === "encerradas") {
      return !matricula.ativo;
    }

    return true;
  });

  if (carregando) {
    return <p>Carregando matrículas...</p>;
  }

  return (
    <section className={styles.card}>
      <h2>Matrículas cadastradas</h2>

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
          className={filtro === "encerradas" ? styles.filtroAtivo : ""}
          onClick={() => setFiltro("encerradas")}
        >
          Encerradas
        </button>

        <button
          type="button"
          className={filtro === "todas" ? styles.filtroAtivo : ""}
          onClick={() => setFiltro("todas")}
        >
          Todas
        </button>
      </div>

      {matriculas.length === 0 ? (
        <p>Nenhuma matrícula cadastrada.</p>
      ) : matriculasFiltradas.length === 0 ? (
        <p>Nenhuma matrícula encontrada neste filtro.</p>
      ) : (
        <ul className={styles.lista}>
          {matriculasFiltradas.map((matricula) => (
            <li key={matricula.id} className={styles.item}>
              <h3>{matricula.alunos.nome}</h3>

              <p>
                <strong>Turma:</strong> {matricula.turmas.nome}
              </p>

              <p>
                <strong>Turno:</strong>{" "}
                {matricula.turmas.turno === "manha" ? "Manhã" : "Tarde"}
              </p>

              <p>
                <strong>Horário:</strong>{" "}
                {formatarHorario(matricula.turmas.hora_inicio)} às{" "}
                {formatarHorario(matricula.turmas.hora_fim)}
              </p>

              <p>
                <strong>Data da matrícula:</strong>{" "}
                {formatarData(matricula.data_inicio)}
              </p>

              <p>
                <strong>Situação:</strong>{" "}
                {matricula.ativo ? "Ativa" : "Encerrada"}
              </p>

              {!matricula.ativo && matricula.data_encerramento && (
                <p>
                  <strong>Data de encerramento:</strong>{" "}
                  {formatarData(matricula.data_encerramento)}
                </p>
              )}

              {matricula.ativo && (
                <button
                  type="button"
                  className={styles.botaoEncerrar}
                  onClick={() => onEncerrar(matricula)}
                  disabled={salvando}
                >
                  Encerrar matrícula
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
