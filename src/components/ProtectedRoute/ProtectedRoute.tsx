import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Header from "../Header";

type AccessStatus = "loading" | "authorized" | "unauthorized";

export default function ProtectedRoute() {
  const [status, setStatus] = useState<AccessStatus>("loading");

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        setStatus("unauthorized");
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("id")
        .eq("id", user.id)
        .eq("ativo", true)
        .maybeSingle();

      if (!active) return;

      setStatus(!error && data ? "authorized" : "unauthorized");
    }

    void checkAccess();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setStatus("unauthorized");
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return <p>Verificando acesso...</p>;
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
