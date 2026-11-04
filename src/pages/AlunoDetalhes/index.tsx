import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { buscarAlunoPorId } from "../../services/alunos";
import { listarMatriculasPorAluno } from "../../services/matriculas";
import { listarMensalidadesPorAluno } from "../../services/mensalidades";

import type { AlunoComResponsavel } from "../../types/aluno";
import type { MatriculaComDetalhes } from "../../types/matricula";
import type { MensalidadeComDetalhes } from "../../types/mensalidades";

import styles from "./AlunoDetalhes.module.css";

function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario: string): string {
  return horario.slice(0, 5);
}

function formatarValor(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const NOMES_DIAS: Record<number, string> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
};

export default function AlunoDetalhes() {
  const { id } = useParams();

  const [aluno, setAluno] = useState<AlunoComResponsavel | null>(null);

  const [matriculas, setMatriculas] = useState<
    MatriculaComDetalhes[]
  >([]);

  const [mensalidades, setMensalidades] = useState<
    MensalidadeComDetalhes[]
  >([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      if (!id) {
        if (ativo) {
          setErro("Aluno não identificado.");
          setCarregando(false);
        }

        return;
      }

      try {
        const [dadosAluno, dadosMatriculas, dadosMensalidades] =
          await Promise.all([
            buscarAlunoPorId(id),
            listarMatriculasPorAluno(id),
            listarMensalidadesPorAluno(id),
          ]);

        if (!ativo) return;

        setAluno(dadosAluno);
        setMatriculas(dadosMatriculas);
        setMensalidades(dadosMensalidades);
      } catch (error) {
        if (!ativo) return;

        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do aluno.",
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarDados();

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return <p>Carregando dados do aluno...</p>;
  }

  if (erro && !aluno) {
    return (
      <main className={styles.pagina}>
        <p className={styles.erro}>{erro}</p>

        <Link to="/alunos" className={styles.voltar}>
          Voltar para alunos
        </Link>
      </main>
    );
  }

  if (!aluno) {
    return (
      <main className={styles.pagina}>
        <p className={styles.erro}>Aluno não encontrado.</p>

        <Link to="/alunos" className={styles.voltar}>
          Voltar para alunos
        </Link>
      </main>
    );
  }

  const matriculaAtual = matriculas.find(
    (matricula) => matricula.ativo,
  );

  const diasTreino = matriculaAtual
    ? [...matriculaAtual.turmas.dias_treino]
        .sort((a, b) => a.dia_semana - b.dia_semana)
        .map((dia) => NOMES_DIAS[dia.dia_semana])
        .join(", ")
    : "";

  return (
    <main className={styles.pagina}>
      <Link to="/alunos" className={styles.voltar}>
        ← Voltar para alunos
      </Link>

      <div className={styles.cabecalho}>
        <div>
          <h1>{aluno.nome}</h1>
          <p>Informações cadastrais e histórico do aluno.</p>
        </div>

        <span
          className={
            aluno.ativo
              ? styles.statusAtivo
              : styles.statusInativo
          }
        >
          {aluno.ativo ? "Ativo" : "Inativo"}
        </span>
      </div>

      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      <div className={styles.grade}>
        <section className={styles.card}>
          <h2>Dados do aluno</h2>

          <p>
            <strong>Data de nascimento:</strong>{" "}
            {formatarData(aluno.data_nascimento)}
          </p>

          <p>
            <strong>Endereço:</strong> {aluno.endereco}
          </p>

          <p>
            <strong>Escola:</strong> {aluno.escola}
          </p>

          <p>
            <strong>Turno escolar:</strong>{" "}
            {aluno.turno_escolar === "manha" ? "Manhã" : "Tarde"}
          </p>
        </section>

        <section className={styles.card}>
          <h2>Responsável</h2>

          <p>
            <strong>Nome:</strong> {aluno.responsaveis.nome}
          </p>

          <p>
            <strong>Telefone:</strong>{" "}
            {aluno.responsaveis.telefone}
          </p>

          <p>
            <strong>Parentesco:</strong> {aluno.parentesco}
          </p>
        </section>
      </div>

      <section className={styles.card}>
        <h2>Matrícula atual</h2>

        {matriculaAtual ? (
          <>
            <p>
              <strong>Turma:</strong>{" "}
              {matriculaAtual.turmas.nome}
            </p>

            <p>
              <strong>Turno:</strong>{" "}
              {matriculaAtual.turmas.turno === "manha"
                ? "Manhã"
                : "Tarde"}
            </p>

            <p>
              <strong>Dias de treino:</strong> {diasTreino}
            </p>

            <p>
              <strong>Horário:</strong>{" "}
              {formatarHorario(
                matriculaAtual.turmas.hora_inicio,
              )}{" "}
              às{" "}
              {formatarHorario(
                matriculaAtual.turmas.hora_fim,
              )}
            </p>

            <p>
              <strong>Data da matrícula:</strong>{" "}
              {formatarData(matriculaAtual.data_inicio)}
            </p>
          </>
        ) : (
          <p>O aluno não possui matrícula ativa.</p>
        )}
      </section>

      <section className={styles.card}>
        <h2>Histórico de mensalidades</h2>

        {mensalidades.length === 0 ? (
          <p>Nenhuma mensalidade encontrada para este aluno.</p>
        ) : (
          <div className={styles.historico}>
            {mensalidades.map((mensalidade) => (
              <div
                key={mensalidade.id}
                className={styles.mensalidade}
              >
                <div>
                  <strong>
                    {mensalidade.mes_referencia.slice(0, 7)}
                  </strong>

                  <span>
                    {mensalidade.matriculas.turmas.nome}
                  </span>
                </div>

                <span>{formatarValor(mensalidade.valor)}</span>

                <span>
                  {mensalidade.situacao === "paga"
                    ? "Paga"
                    : "Pendente"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}