import { supabase } from "../lib/supabase";
import type { NovaTurma, TurmaComDias } from "../types/turma";

const CAMPOS_TURMA = `
    id,
    nome,
    idade_minima,
    idade_maxima,
    turno,
    hora_inicio,
    hora_fim,
    capacidade_maxima,
    ativo,
    dias_treino (
        dia_semana
    )
`;

export async function listarTurmas(): Promise<TurmaComDias[]> {
    const { data, error } = await supabase
        .from("turmas")
        .select(CAMPOS_TURMA)
        .order("nome", { ascending: true });
    
    if (error) {
        throw new Error ("Não foi possível carregar as turmas.");
    }

    return data as TurmaComDias[];
}

export async function cadastrarTurma(
    turma: NovaTurma
): Promise<TurmaComDias> {
    const { data: turmaId, error } = await supabase.rpc(
        "cadastrar_turma",
        {
            p_nome: turma.nome,
            p_idade_minima: turma.idade_minima,
            p_idade_maxima: turma.idade_maxima,
            p_turno: turma.turno,
            p_hora_inicio: turma.hora_inicio,
            p_hora_fim: turma.hora_fim,
            p_capacidade_maxima: turma.capacidade_maxima,
            p_dias_treino: turma.dias_treino,
        }
    );

    if (error || !turmaId) {
        throw new Error("Não foi possível cadastrar a turma.");
    }

    const { data, error: consultaError } = await supabase
        .from ("turmas")
        .select(CAMPOS_TURMA)
        .eq("id", turmaId)
        .single();

    if (consultaError || !data) {
        throw new Error(
            "A turma foi cadastrada, mas não foi possível carregar seus dados. Atualize a página."
        );
    }

    return data as TurmaComDias;
}

export async function editarTurma(
    id: string,
    turma: NovaTurma
): Promise<TurmaComDias> {
    const { error } = await supabase.rpc("editar_turma", {
        p_turma_id: id,
        p_nome: turma.nome,
        p_idade_minima: turma.idade_minima,
        p_idade_maxima: turma.idade_maxima,
        p_turno: turma.turno,
        p_hora_inicio: turma.hora_inicio,
        p_hora_fim: turma.hora_fim,
        p_capacidade_maxima: turma.capacidade_maxima,
        p_dias_treino: turma.dias_treino,
    });

    if (error) {
        throw new Error("Não foi possível atualizar a turma.");
    }

    const { data, error: consultaError } = await supabase
        .from("turmas")
        .select(CAMPOS_TURMA)
        .eq("id", id)
        .single();
    
    if (consultaError || !data) {
        throw new Error(
            "A turma foi atualizada, mas não foi possível carregar seus dados. Atualize a página."
        );
    }

    return data as TurmaComDias;
}

export async function inativarTurma(id: string): Promise<void> {
    const { error } = await supabase.rpc("inativar_turma", {
        p_turma_id: id,
    });

    if (error) {
        throw new Error(error.message);
    }
}