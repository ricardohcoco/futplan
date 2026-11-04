import { useEffect, useState } from "react";
import {
  buscarResumoMensalidades,
  contarAlunosAtivos,
  contarMatriculasAtivas,
  contarMensalidadesAtrasadas,
  contarTurmasAtivas,
} from "../../services/dashboard";
import styles from "./Home.module.css";

export default function Home() {
  const [alunosAtivos, setAlunosAtivos] = useState(0);
  const [turmasAtivas, setTurmasAtivas] = useState(0);
  const [matriculasAtivas, setMatriculasAtivas] = useState(0);
  const [mensalidadesPagas, setMensalidadesPagas] = useState(0);
  const [mensalidadesPendentes, setMensalidadesPendentes] = useState(0);
  const [mensalidadesAtrasadas, setMensalidadesAtrasadas] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          quantidadeAlunos,
          quantidadeTurmas,
          quantidadeMatriculas,
          resumoMensalidades,
          quantidadeAtrasadas,
        ] = await Promise.all([
          contarAlunosAtivos(),
          contarTurmasAtivas(),
          contarMatriculasAtivas(),
          buscarResumoMensalidades(),
          contarMensalidadesAtrasadas(),
        ]);

        setAlunosAtivos(quantidadeAlunos);
        setTurmasAtivas(quantidadeTurmas);
        setMatriculasAtivas(quantidadeMatriculas);
        setMensalidadesPagas(resumoMensalidades.pagas);
        setMensalidadesPendentes(resumoMensalidades.pendentes);
        setMensalidadesAtrasadas(quantidadeAtrasadas);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  return (
    <main className={styles.container}>
      <p className={styles.welcome}>
        Bem-vindo ao sistema de gestão da escolinha!
      </p>

      {loading && <p>Carregando...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <section className={styles.dashboard}>
          <div className={styles.secao}>
            <h2>Visão geral</h2>

            <div className={styles.cardsGestao}>
              <section className={styles.card}>
                <h3>Alunos ativos</h3>
                <strong className={styles.number}>{alunosAtivos}</strong>
              </section>

              <section className={styles.card}>
                <h3>Turmas ativas</h3>
                <strong className={styles.number}>{turmasAtivas}</strong>
              </section>

              <section className={styles.card}>
                <h3>Matrículas ativas</h3>
                <strong className={styles.number}>{matriculasAtivas}</strong>
              </section>
            </div>
          </div>

          <div className={styles.secao}>
            <h2>Mensalidades</h2>

            <div className={styles.cardsMensalidades}>
              <section className={styles.card}>
                <h3>Mensalidades do mês</h3>

                <div className={styles.paymentInfo}>
                  <p>
                    Pagas: <strong>{mensalidadesPagas}</strong>
                  </p>

                  <p>
                    Pendentes: <strong>{mensalidadesPendentes}</strong>
                  </p>
                </div>
              </section>

              <section className={styles.card}>
                <h3>Mensalidades atrasadas</h3>

                <strong className={styles.number}>
                  {mensalidadesAtrasadas}
                </strong>

                {mensalidadesAtrasadas > 0 ? (
                  <p className={styles.cardInfo}>
                    Consulte o filtro "Atrasadas" na página Mensalidades para
                    visualizar os detalhes.
                  </p>
                ) : (
                  <p className={styles.cardInfo}>
                    Nenhuma mensalidade em atraso.
                  </p>
                )}
              </section>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}