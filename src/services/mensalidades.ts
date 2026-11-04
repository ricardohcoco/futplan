import { supabase } from "../lib/supabase";
import type { MensalidadeComDetalhes } from "../types/mensalidades";

export type DadosGeracaoMensalidades = {
  mesReferencia: string;
  dataVencimento: string;
};

const CAMPOS_MENSALIDADE = `
  id,
  matricula_id,
  mes_referencia,
  valor,
  data_vencimento,
  data_pagamento,
  situacao,
  matriculas (
    aluno_id,
    alunos (nome),
    turmas (nome)
  )
`;

export async function gerarMensalidades({
  mesReferencia,
  dataVencimento,
}: DadosGeracaoMensalidades): Promise<number> {
  const { data, error } = await supabase.rpc("gerar_mensalidades", {
    p_mes_referencia: mesReferencia,
    p_data_vencimento: dataVencimento,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listarMensalidades(): Promise<
  MensalidadeComDetalhes[]
> {
  const { data, error } = await supabase
    .from("mensalidades")
    .select(CAMPOS_MENSALIDADE)
    .order("mes_referencia", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((mensalidade) => {
    const matricula = Array.isArray(mensalidade.matriculas)
      ? mensalidade.matriculas[0]
      : mensalidade.matriculas;

    const aluno = Array.isArray(matricula.alunos)
      ? matricula.alunos[0]
      : matricula.alunos;

    const turma = Array.isArray(matricula.turmas)
      ? matricula.turmas[0]
      : matricula.turmas;

    return {
      ...mensalidade,
      matriculas: {
        ...matricula,
        alunos: aluno,
        turmas: turma,
      },
    };
  }) as MensalidadeComDetalhes[];
}

export async function registrarPagamento(
  mensalidadeId: string,
): Promise<void> {
  const { error } = await supabase.rpc("registrar_pagamento", {
    p_mensalidade_id: mensalidadeId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function listarMensalidadesPorAluno(
  alunoId: string,
): Promise<MensalidadeComDetalhes[]> {
  const { data, error } = await supabase
    .from("mensalidades")
    .select(`
      id,
      matricula_id,
      mes_referencia,
      valor,
      data_vencimento,
      data_pagamento,
      situacao,
      matriculas!inner (
        aluno_id,
        alunos (nome),
        turmas (nome)
      )
    `)
    .eq("matriculas.aluno_id", alunoId)
    .order("mes_referencia", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((mensalidade) => {
    const matricula = Array.isArray(mensalidade.matriculas)
      ? mensalidade.matriculas[0]
      : mensalidade.matriculas;

    const aluno = Array.isArray(matricula.alunos)
      ? matricula.alunos[0]
      : matricula.alunos;

    const turma = Array.isArray(matricula.turmas)
      ? matricula.turmas[0]
      : matricula.turmas;

    return {
      ...mensalidade,
      matriculas: {
        ...matricula,
        alunos: aluno,
        turmas: turma,
      },
    };
  }) as MensalidadeComDetalhes[];
}