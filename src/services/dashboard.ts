import { supabase } from "../lib/supabase";

function obterDataAtualBrasilia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function contarAlunosAtivos(): Promise<number> {
  const { count, error } = await supabase
    .from("alunos")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true);

  if (error) {
    throw new Error("Não foi possível carregar os dados do dashboard.");
  }

  return count ?? 0;
}

export async function contarTurmasAtivas(): Promise<number> {
  const { count, error } = await supabase
    .from("turmas")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true);

  if (error) {
    throw new Error("Não foi possível carregar as turmas.");
  }

  return count ?? 0;
}

export async function contarMatriculasAtivas(): Promise<number> {
  const { count, error } = await supabase
    .from("matriculas")
    .select("*", { count: "exact", head: true })
    .is("data_encerramento", null);

  if (error) {
    throw new Error("Não foi possível carregar as matrículas.");
  }

  return count ?? 0;
}

type ResumoMensalidades = {
  pagas: number;
  pendentes: number;
};

export async function buscarResumoMensalidades(): Promise<ResumoMensalidades> {
  const hoje = obterDataAtualBrasilia();
  const mesReferencia = `${hoje.slice(0, 7)}-01`;

  const { data, error } = await supabase
    .from("mensalidades")
    .select("situacao")
    .eq("mes_referencia", mesReferencia);

  if (error) {
    throw new Error("Não foi possível carregar as mensalidades.");
  }

  const pagas = data.filter(
    (mensalidade) => mensalidade.situacao === "paga"
  ).length;

  const pendentes = data.filter(
    (mensalidade) => mensalidade.situacao === "pendente"
  ).length;

  return {
    pagas,
    pendentes,
  };
}

export async function contarMensalidadesAtrasadas(): Promise<number> {
  const hoje = obterDataAtualBrasilia();

  const { count, error } = await supabase
    .from("mensalidades")
    .select("*", { count: "exact", head: true })
    .eq("situacao", "pendente")
    .lt("data_vencimento", hoje);

  if (error) {
    throw new Error("Não foi possível carregar as mensalidades atrasadas.");
  }

  return count ?? 0;
}