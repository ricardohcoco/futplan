import { supabase } from "../lib/supabase";
import type { Configuracao } from "../types/configuracao";

export async function consultarConfiguracao(): Promise<Configuracao | null> {
    const { data, error } = await supabase
        .from("configuracoes")
        .select("id, valor_mensalidade")
        .eq("id", 1)
        .maybeSingle();

    if (error) {
        throw new Error("Não foi possível consultar o valor da mensalidade.");
    }

    return data;
}

export async function definirValorMensalidade(
    valor: number
) : Promise<void> {
    const { error } = await supabase.rpc("definir_valor_mensalidade", {
        p_valor: valor,
    });

    if (error) {
        throw new Error(error.message);
    }
}