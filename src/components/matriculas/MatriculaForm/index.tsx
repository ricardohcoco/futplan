import { useState, type FormEvent } from "react";
import type { Aluno, AlunoComResponsavel } from "../../../types/aluno";
import type {
  NovaMatricula,
  MatriculaComDetalhes,
} from "../../../types/matricula";
import type { TurmaComDias } from "../../../types/turma";
import AlunoSearch from "../AlunoSearch";
import styles from "./MatriculaForm.module.css";

type MatriculaFormProps = {
  alunos: Aluno[];
  turmas: TurmaComDias[];
  matriculas: MatriculaComDetalhes[];
  salvando: boolean;
  onSalvar: (dados: NovaMatricula) => Promise<boolean>;
};

export default function MatriculaForm({
  alunos,
  turmas,
  matriculas,
  salvando,
  onSalvar,
}: MatriculaFormProps) {
  const [alunoSelecionado, setAlunoSelecionado] =
    useState<AlunoComResponsavel | null>(null);

  const [turmaId, setTurmaId] = useState("");
  const [erroFormulario, setErroFormulario] = useState("");
  const [chaveAlunoSearch, setChaveAlunoSearch] = useState(0);

  const alunosAtivos = alunos.filter((aluno) => aluno.ativo);
  const turmasAtivas = turmas.filter((turma) => turma.ativo);

  function calcularVagasRestantes(turma: TurmaComDias): number {
    const matriculasAtivas = matriculas.filter(
      (matricula) =>
        matricula.turma_id === turma.id && matricula.ativo
    ).length;

    return Math.max(0, turma.capacidade_maxima - matriculasAtivas);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroFormulario("");

    if (!alunoSelecionado || !turmaId) {
      setErroFormulario("Selecione um aluno e uma turma.");
      return;
    }

    const cadastrou = await onSalvar({
      aluno_id: alunoSelecionado.id,
      turma_id: turmaId,
    });

    if (cadastrou) {
      setAlunoSelecionado(null);
      setTurmaId("");

      // Recria o campo de busca para limpar seu estado interno.
      setChaveAlunoSearch((chaveAtual) => chaveAtual + 1);
    }
  }

  return (
    <section className={styles.card}>
      <h2>Nova matrícula</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <AlunoSearch
          key={chaveAlunoSearch}
          alunoSelecionado={alunoSelecionado}
          disabled={salvando}
          onSelecionar={setAlunoSelecionado}
        />

        <label className={styles.campo}>
          Turma

          <select
            value={turmaId}
            onChange={(event) => setTurmaId(event.target.value)}
            disabled={salvando}
            required
          >
            <option value="">Selecione uma turma</option>

            {turmasAtivas.map((turma) => {
              const vagasRestantes = calcularVagasRestantes(turma);

              return (
                <option
                  key={turma.id}
                  value={turma.id}
                  disabled={vagasRestantes === 0}
                >
                  {turma.nome} —{" "}
                  {turma.turno === "manha" ? "Manhã" : "Tarde"} —{" "}
                  {turma.hora_inicio.slice(0, 5)} às{" "}
                  {turma.hora_fim.slice(0, 5)} —{" "}
                  {vagasRestantes === 0
                    ? "Sem vagas"
                    : `${vagasRestantes} ${
                        vagasRestantes === 1
                          ? "vaga restante"
                          : "vagas restantes"
                      }`}
                </option>
              );
            })}
          </select>
        </label>

        {erroFormulario && (
          <p className={styles.erro}>{erroFormulario}</p>
        )}

        <button
          className={styles.botaoSalvar}  
          type="submit"
          disabled={
            salvando ||
            alunosAtivos.length === 0 ||
            turmasAtivas.length === 0
          }
        >
          {salvando ? "Salvando..." : "Cadastrar matrícula"}
        </button>
      </form>
    </section>
  );
}