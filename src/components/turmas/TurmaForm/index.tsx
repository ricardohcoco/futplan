import { useState, type FormEvent } from "react";
import type {
  DiaSemana,
  NovaTurma,
  TurnoTurma,
  TurmaComDias,
} from "../../../types/turma";
import styles from "./TurmaForm.module.css";

type TurmaFormProps = {
  turmaEmEdicao: TurmaComDias | null;
  salvando: boolean;
  onSalvar: (dados: NovaTurma) => Promise<boolean>;
  onCancelar: () => void;
};

const DIAS: { valor: DiaSemana; nome: string }[] = [
  { valor: 1, nome: "Segunda-feira" },
  { valor: 2, nome: "Terça-feira" },
  { valor: 3, nome: "Quarta-feira" },
  { valor: 4, nome: "Quinta-feira" },
  { valor: 5, nome: "Sexta-feira" },
];

const HORARIOS: Record<TurnoTurma, { inicio: string; fim: string }[]> = {
  manha: [
    { inicio: "08:00", fim: "09:00" },
    { inicio: "09:00", fim: "10:00" },
    { inicio: "10:00", fim: "11:00" },
  ],
  tarde: [
    { inicio: "14:00", fim: "15:00" },
    { inicio: "15:00", fim: "16:00" },
    { inicio: "16:00", fim: "17:00" },
  ],
};

export default function TurmaForm({
  turmaEmEdicao,
  salvando,
  onSalvar,
  onCancelar,
}: TurmaFormProps) {
  const [nome, setNome] = useState(turmaEmEdicao?.nome ?? "");
  const [idadeMinima, setIdadeMinima] = useState(
    turmaEmEdicao?.idade_minima ?? 5,
  );
  const [idadeMaxima, setIdadeMaxima] = useState(
    turmaEmEdicao?.idade_maxima ?? 15,
  );
  const [turno, setTurno] = useState<TurnoTurma>(
    turmaEmEdicao?.turno ?? "manha",
  );
  const [horarioInicio, setHorarioInicio] = useState(
    turmaEmEdicao?.hora_inicio.slice(0, 5) ?? "08:00",
  );
  const [capacidade, setCapacidade] = useState(
    turmaEmEdicao?.capacidade_maxima ?? 20,
  );
  const [diasTreino, setDiasTreino] = useState<DiaSemana[]>(
    turmaEmEdicao?.dias_treino.map((item) => item.dia_semana) ?? [],
  );
  const [erroFormulario, setErroFormulario] = useState("");

  function handleTurnoChange(novoTurno: TurnoTurma) {
    setTurno(novoTurno);
    setHorarioInicio(HORARIOS[novoTurno][0].inicio);
  }

  function handleDiaChange(dia: DiaSemana, marcado: boolean) {
    setDiasTreino((anteriores) =>
      marcado
        ? [...anteriores, dia]
        : anteriores.filter((item) => item !== dia),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const horario = HORARIOS[turno].find(
      (item) => item.inicio === horarioInicio,
    );

    if (!horario) {
      setErroFormulario("Selecione um horário válido.");
      return;
    }

    if (idadeMinima > idadeMaxima) {
      setErroFormulario(
        "A idade mínima não pode ser maior que a idade máxima.",
      );
      return;
    }

    if (diasTreino.length === 0) {
      setErroFormulario("Selecione pelo menos um dia de treino.");
      return;
    }

    if (!nome.trim()) {
      setErroFormulario("Informe o nome da turma.");
      return;
    }

    setErroFormulario("");

    const dados: NovaTurma = {
      nome: nome.trim(),
      idade_minima: idadeMinima,
      idade_maxima: idadeMaxima,
      turno,
      hora_inicio: horario.inicio,
      hora_fim: horario.fim,
      capacidade_maxima: capacidade,
      dias_treino: [...diasTreino].sort((a, b) => a - b),
    };

    const salvou = await onSalvar(dados);

    if (salvou) {
      setNome("");
      setIdadeMinima(5);
      setIdadeMaxima(15);
      setTurno("manha");
      setHorarioInicio("08:00");
      setCapacidade(20);
      setDiasTreino([]);
    }
  }

  return (
    <section className={styles.card}>
      <h2>{turmaEmEdicao ? "Editar turma" : "Nova turma"}</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="turma-nome">Nome da turma</label>
        <input
          id="turma-nome"
          type="text"
          maxLength={100}
          required
          value={nome}
          onChange={(event) => setNome(event.target.value)}
        />
        <div className={styles.duasColunas}>
          <div className={styles.campo}>
            <label htmlFor="turma-idade-minima">Idade mínima</label>
            <input
              id="turma-idade-minima"
              type="number"
              min={5}
              max={15}
              required
              value={idadeMinima}
              onChange={(event) => setIdadeMinima(Number(event.target.value))}
            />
          </div>
          <div className={styles.campo}>
            <label htmlFor="turma-idade-maxima">Idade máxima</label>
            <input
              id="turma-idade-maxima"
              type="number"
              min={5}
              max={15}
              required
              value={idadeMaxima}
              onChange={(event) => setIdadeMaxima(Number(event.target.value))}
            />
          </div>
        </div>
        <div className={styles.duasColunas}>
          <div className={styles.campo}>
            <label htmlFor="turma-turno">Turno</label>
            <select
              id="turma-turno"
              value={turno}
              onChange={(event) =>
                handleTurnoChange(event.target.value as TurnoTurma)
              }
            >
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
            </select>
          </div>
          <div className={styles.campo}>
            <label htmlFor="turma-horario">Horário de treino</label>
            <select
              id="turma-horario"
              value={horarioInicio}
              onChange={(event) => setHorarioInicio(event.target.value)}
            >
              {HORARIOS[turno].map((horario) => (
                <option key={horario.inicio} value={horario.inicio}>
                  {horario.inicio} às {horario.fim}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label htmlFor="turma-capacidade">Capacidade máxima</label>
        <input
          id="turma-capacidade"
          type="number"
          min={1}
          max={20}
          required
          value={capacidade}
          onChange={(event) => setCapacidade(Number(event.target.value))}
        />
        <fieldset className={styles.dias}>
          <legend>Dias de treino</legend>

          <div className={styles.opcoesDias}>
            {DIAS.map((dia) => (
              <label key={dia.valor} className={styles.opcaoDia}>
                <input
                  type="checkbox"
                  checked={diasTreino.includes(dia.valor)}
                  onChange={(event) =>
                    handleDiaChange(dia.valor, event.target.checked)
                  }
                />
                {dia.nome}
              </label>
            ))}
          </div>
        </fieldset>

        {erroFormulario && (
          <p className={styles.erro} role="alert">
            {erroFormulario}
          </p>
        )}

        <div className={styles.acoesFormulario}>
          <button type="submit" disabled={salvando}>
            {salvando
              ? "Salvando..."
              : turmaEmEdicao
                ? "Salvar alterações"
                : "Cadastrar turma"}
          </button>

          {turmaEmEdicao && (
            <button
              type="button"
              className={styles.botaoSecundario}
              onClick={onCancelar}
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
