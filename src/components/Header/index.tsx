import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "../../services/auth";
import styles from "./Header.module.css";

export default function Header() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      alert("Não foi possível sair. Tente novamente.");
    }
  }

  return (
  <header className={styles.header}>
    <h1 className={styles.logo}>FutPlan</h1>

    <nav className={styles.nav}>
      <NavLink
        to="/"
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.active : ""}`
        }
      >
        Início
      </NavLink>

      <NavLink
        to="/alunos"
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.active : ""}`
        }
      >
        Alunos
      </NavLink>

      <NavLink
        to="/turmas"
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.active : ""}`
        }
      >
        Turmas
      </NavLink>

      <NavLink
        to="/matriculas"
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.active : ""}`
        }
      >
        Matrículas
      </NavLink>

      <NavLink
        to="/mensalidades"
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.active : ""}`
        }
      >
        Mensalidades
      </NavLink>
    </nav>

    <button className={styles.logout} onClick={handleLogout}>
      Sair
    </button>
  </header>
);
}
