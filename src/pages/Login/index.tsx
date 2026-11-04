import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signOut } from "../../services/auth";
import { supabase } from "../../lib/supabase";
import styles from "./Login.module.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email.trim(), password);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Não foi possível confirmar a autenticação.");
        return;
      }

      const { data, error: userError } = await supabase
        .from("usuarios")
        .select("id, nome, perfil, ativo")
        .eq("id", user.id)
        .maybeSingle();

      if (userError || !data || !data.ativo) {
        await signOut();
        setError("Sua conta não está autorizada a acessar o FutPlan.");
        return;
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao realizar login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>FutPlan</h1>
        <p>Entre com sua conta para acessar o sistema.</p>

        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
