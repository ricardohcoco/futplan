import { supabase } from "../lib/supabase";
import type { AlunoComResponsavel, NovoAluno } from "../types/aluno";

const CAMPOS_ALUNO = `
    id,
    nome,
    data_nascimento,
    endereco,
    escola,
    turno_escolar,
    responsavel_id,
    parentesco,
    ativo,
    criado_em,
    responsaveis!alunos_responsavel_id_fkey (
        nome,
        telefone
    )
`;

type DadosResponsavelEdicao = {
  nome: string;
  telefone: string;
}

export async function listarAlunos(): Promise<AlunoComResponsavel[]> {
  const { data, error } = await supabase
    .from("alunos")
    .select(CAMPOS_ALUNO)
    .order("nome", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os alunos.");
  }

  return data.map((aluno) => ({
    ...aluno,
    responsaveis: Array.isArray(aluno.responsaveis)
      ? aluno.responsaveis[0]
      : aluno.responsaveis,
  })) as AlunoComResponsavel[];
}

export async function cadastrarAluno(
  aluno: NovoAluno,
): Promise<AlunoComResponsavel> {
  const { data, error } = await supabase
    .from("alunos")
    .insert(aluno)
    .select(CAMPOS_ALUNO)
    .single();

  if (error) {
    throw new Error("Não foi possível cadastrar o aluno.");
  }

  return {
    ...data,
    responsaveis: Array.isArray(data.responsaveis)
      ? data.responsaveis[0]
      : data.responsaveis,
  } as AlunoComResponsavel;
}

export async function editarAluno(
  id: string,
  aluno: NovoAluno
): Promise<AlunoComResponsavel> {
  const { data, error } = await supabase
    .from("alunos")
    .update(aluno)
    .eq("id", id)
    .select(CAMPOS_ALUNO)
    .single();

  if (error) {
    throw new Error("Não foi possível atualizar o aluno.");
  }

  return {
    ...data,
    responsaveis: Array.isArray(data.responsaveis)
    ? data.responsaveis[0]
    : data.responsaveis,
  } as AlunoComResponsavel;
}

export async function editarAlunoComResponsavel(
  id: string,
  aluno: NovoAluno,
  responsavel: DadosResponsavelEdicao,
): Promise<void> {
  const { error } = await supabase.rpc("editar_aluno_com_responsavel", {
    p_aluno_id: id,
    p_nome_aluno: aluno.nome,
    p_data_nascimento: aluno.data_nascimento,
    p_endereco: aluno.endereco,
    p_escola: aluno.escola,
    p_turno_escolar: aluno.turno_escolar,
    p_parentesco: aluno.parentesco,
    p_responsavel_id: aluno.responsavel_id,
    p_nome_responsavel: responsavel.nome,
    p_telefone_responsavel: responsavel.telefone,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function inativarAluno(id: string): Promise<void> {
  const { error } = await supabase.rpc("inativar_aluno", {
    p_aluno_id: id,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function buscarAlunoPorId(
  id: string,
): Promise<AlunoComResponsavel> {
  const { data, error } = await supabase
    .from("alunos")
    .select(CAMPOS_ALUNO)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Não foi possível carregar os dados do aluno.")
  }

  return {
    ...data,
    responsaveis: Array.isArray(data.responsaveis)
    ? data.responsaveis[0]
    : data.responsaveis,
  } as AlunoComResponsavel;
}

export async function buscarAlunosAtivos(
  busca: string
): Promise<AlunoComResponsavel[]> {
  const termo = busca.trim();

  if (termo.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from("alunos")
    .select(CAMPOS_ALUNO)
    .eq("ativo", true)
    .ilike("nome", `%${termo}%`)
    .order("nome", { ascending: true })
    .limit(10);

  if (error) {
    throw new Error("Não foi possível buscar os alunos.");
  }

  return data.map((aluno) => ({
    ...aluno,
    responsaveis: Array.isArray(aluno.responsaveis)
      ? aluno.responsaveis[0]
      : aluno.responsaveis,
  })) as AlunoComResponsavel[];
}