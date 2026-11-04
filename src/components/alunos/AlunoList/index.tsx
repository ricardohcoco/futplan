import { useState } from "react";
import type { AlunoComResponsavel } from "../../../types/aluno";
import styles from "./AlunoList.module.css";
import { Link } from "react-router-dom";

type AlunosListProps = {
  alunos: AlunoComResponsavel[];
  carregando: boolean;
  salvando: boolean;
  onEditar: (aluno: AlunoComResponsavel) => void;
  onInativar: (aluno: AlunoComResponsavel) => void;
};

type FiltroAluno = "todos" | "ativos" | "inativos";

export default function AlunosList({
  alunos,
  carregando,
  salvando,
  onEditar,
  onInativar,
}: AlunosListProps) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroAluno>("ativos");

  const alunosFiltrados = alunos.filter((aluno) => {
    const correspondeBusca = aluno.nome
      .toLowerCase()
      .includes(busca.trim().toLowerCase());

    const correspondeFiltro =
      filtro === "todos" ||
      (filtro === "ativos" && aluno.ativo) ||
      (filtro === "inativos" && !aluno.ativo);

    return correspondeBusca && correspondeFiltro;
  });

  return (
    <section className={styles.card}>
      <h2>Alunos cadastrados</h2>

      <div className={styles.busca}>
        <label htmlFor="busca-aluno">Buscar aluno</label>

        <input
          id="busca-aluno"
          type="search"
          placeholder="Digite o nome do aluno..."
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />
      </div>

      <div className={styles.filtros}>
        <button
          type="button"
          className={filtro === "ativos" ? styles.filtroAtivo : ""}
          onClick={() => setFiltro("ativos")}
        >
          Ativos
        </button>

        <button
          type="button"
          className={filtro === "inativos" ? styles.filtroAtivo : ""}
          onClick={() => setFiltro("inativos")}
        >
          Inativos
        </button>

        <button
          type="button"
          className={filtro === "todos" ? styles.filtroAtivo : ""}
          onClick={() => setFiltro("todos")}
        >
          Todos
        </button>
      </div>

      {carregando ? (
        <p>Carregando alunos...</p>
      ) : alunos.length === 0 ? (
        <p>Nenhum aluno cadastrado.</p>
      ) : alunosFiltrados.length === 0 ? (
        <p>Nenhum aluno encontrado para essa busca.</p>
      ) : (
        <ul className={styles.lista}>
          {alunosFiltrados.map((aluno) => (
            <li key={aluno.id} className={styles.item}>
              <Link to={`/alunos/${aluno.id}`} className={styles.linkAluno}>
                {aluno.nome}
              </Link>

              <span>
                Responsável: {aluno.responsaveis.nome ?? "Não informado"}
              </span>

              <span>Parentesco: {aluno.parentesco ?? "Não informado"}</span>

              <span>
                Turno escolar:{" "}
                {aluno.turno_escolar === "manha" ? "Manhã" : "Tarde"}
              </span>

              <span>Situação: {aluno.ativo ? "Ativo" : "Inativo"}</span>

              {aluno.ativo && (
                <div className={styles.acoes}>
                  <button
                    type="button"
                    className={styles.botaoEditar}
                    onClick={() => onEditar(aluno)}
                    disabled={salvando}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className={styles.botaoInativar}
                    onClick={() => onInativar(aluno)}
                    disabled={salvando}
                  >
                    Inativar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
