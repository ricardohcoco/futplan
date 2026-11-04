import { supabase } from "../lib/supabase";
import type { NovoResponsavel, Responsavel, EdicaoResponsavel } from "../types/responsavel";

const CAMPOS_RESPONSAVEL = "id, nome, telefone, consentimento_lgpd, data_consentimento";

export async function listarResponsaveis(): Promise<Responsavel[]> {
    const { data, error } = await supabase  
        .from("responsaveis")
        .select(CAMPOS_RESPONSAVEL)
        .order("nome", { ascending: true });

    if (error) {
        throw new Error("Não foi possível carregar os responsáveis.");
    }

    return data;
}

export async function cadastrarResponsavel(
    responsavel: NovoResponsavel,
): Promise<Responsavel> {
    const { data, error } = await supabase
        .from("responsaveis")
        .insert(responsavel)
        .select(CAMPOS_RESPONSAVEL)
        .single();
    
    if (error) {
        throw new Error("Não foi possível cadastrar o responsável.");
    }

    return data;
}

export async function editarResponsavel(
    id: string,
    responsavel: EdicaoResponsavel,
): Promise<Responsavel> {
    const { data, error } = await supabase
        .from("responsaveis")
        .update(responsavel)
        .eq("id", id)
        .select(CAMPOS_RESPONSAVEL)
        .single();
    
    if (error) {
        throw new Error ("Não foi possível atualizar o responsável.");
    }

    return data;
}

export async function buscarResponsaveis(
  busca: string,
): Promise<Responsavel[]> {
  const termo = busca.trim();

  if (termo.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from("responsaveis")
    .select(CAMPOS_RESPONSAVEL)
    .eq("ativo", true)
    .ilike("nome", `%${termo}%`)
    .order("nome", { ascending: true })
    .limit(10);

  if (error) {
    throw new Error("Não foi possível buscar os responsáveis.");
  }

  return data;
}