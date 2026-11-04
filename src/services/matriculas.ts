import { supabase } from "../lib/supabase";
import type { MatriculaComDetalhes, NovaMatricula } from "../types/matricula";

const CAMPOS_MATRICULA = `
    id,
    aluno_id,
    turma_id,
    data_inicio,
    data_encerramento,
    ativo,
    alunos(nome),
    turmas(nome, turno, hora_inicio, hora_fim, dias_treino(dia_semana))
`;

type MatriculaRetornada = Omit<
  MatriculaComDetalhes,
  "alunos" | "turmas"
> & {
  alunos:
    | MatriculaComDetalhes["alunos"]
    | MatriculaComDetalhes["alunos"][];
  turmas:
    | MatriculaComDetalhes["turmas"]
    | MatriculaComDetalhes["turmas"][];
};

function normalizarMatricula(
  matricula: MatriculaRetornada
): MatriculaComDetalhes {
  return {
    ...matricula,
    alunos: Array.isArray(matricula.alunos)
      ? matricula.alunos[0]
      : matricula.alunos,
    turmas: Array.isArray(matricula.turmas)
      ? matricula.turmas[0]
      : matricula.turmas,
  };
}

export async function listarMatriculas(): Promise<MatriculaComDetalhes[]> {
    const { data, error } = await supabase
        .from("matriculas")
        .select(CAMPOS_MATRICULA)
        .order("data_inicio", { ascending: false });

    if (error) {
        throw new Error("Não foi possível carregar as matrículas.");
    }

    return (data as MatriculaRetornada[]).map(normalizarMatricula);
}

export async function cadastrarMatricula(
    matricula: NovaMatricula
): Promise<MatriculaComDetalhes> {
    const { data: matriculaId, error } = await supabase.rpc(
        "cadastrar_matricula",
        {
            p_aluno_id: matricula.aluno_id,
            p_turma_id: matricula.turma_id,
        }
    );

    if (error || !matriculaId) {
        throw new Error(
            error?.message ?? "Não foi possível cadastrar a matrícula."
        );
    }

    const { data, error: consultaError } = await supabase
        .from("matriculas")
        .select(CAMPOS_MATRICULA)
        .eq("id", matriculaId)
        .single();
    
    if (consultaError || !data) {
        throw new Error(
            "A matrícula foi cadastrada, mas não foi possível carregar seus dados. Atualize a página."
        );
    }

    return normalizarMatricula(data as MatriculaRetornada);
}

export async function encerrarMatricula(id: string): Promise<MatriculaComDetalhes> {
    const { error } = await supabase.rpc("encerrar_matricula", {
        p_matricula_id: id,
    });

    if (error) {
        throw new Error(error.message);
    }

    const { data, error: consultaError } = await supabase
        .from("matriculas")
        .select(CAMPOS_MATRICULA)
        .eq("id", id)
        .single();

    if (consultaError || !data) {
        throw new Error(
            "A matrícula foi encerrada, mas não foi possível carregar seus dados. Atualize a página."
        );
    }

    return normalizarMatricula(data as MatriculaRetornada);
}

export async function listarMatriculasPorAluno(
    alunoId: string,
): Promise<MatriculaComDetalhes[]> {
    const { data, error } = await supabase
        .from("matriculas")
        .select(CAMPOS_MATRICULA)
        .eq("aluno_id", alunoId)
        .order("data_inicio", {ascending: false});

    if (error) {
        throw new Error("Não foi possível carregar as matrículas do aluno.")
    }

    return (data as MatriculaRetornada[]).map(normalizarMatricula);
}