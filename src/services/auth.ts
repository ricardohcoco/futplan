import { supabase } from "../lib/supabase";

export async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new Error("E-mail ou senha inválidos.");
    }
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error("Não foi possível encerrar a sessão.");
    }
}

export type PerfilUsuario = "gestor" | "administrativo";

export async function getPerfilUsuario(): Promise<PerfilUsuario> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("perfil")
    .eq("id", user.id)
    .eq("ativo", true)
    .single();

  if (error || !data) {
    throw new Error("Não foi possível identificar o perfil do usuário.");
  }

  return data.perfil as PerfilUsuario;
}