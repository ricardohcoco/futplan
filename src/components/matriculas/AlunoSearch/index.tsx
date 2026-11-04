import { useRef, useState } from "react";
import { buscarAlunosAtivos } from "../../../services/alunos";
import type { AlunoComResponsavel } from "../../../types/aluno";
import styles from "./AlunoSearch.module.css";

type AlunoSearchProps = {
  alunoSelecionado: AlunoComResponsavel | null;
  disabled?: boolean;
  onSelecionar: (aluno: AlunoComResponsavel | null) => void;
};

export default function AlunoSearch({
  alunoSelecionado,
  disabled = false,
  onSelecionar,
}: AlunoSearchProps) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<AlunoComResponsavel[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState("");

  const ultimaBuscaId = useRef(0);

  async function handleBusca(valor: string) {
    setBusca(valor);
    setErro("");

    if (alunoSelecionado) {
      onSelecionar(null);
    }

    const termo = valor.trim();

    if (termo.length < 2) {
      ultimaBuscaId.current += 1;
      setResultados([]);
      setBuscando(false);
      return;
    }

    const buscaId = ++ultimaBuscaId.current;

    try {
      setBuscando(true);

      const alunos = await buscarAlunosAtivos(termo);

      if (buscaId !== ultimaBuscaId.current) {
        return;
      }

      setResultados(alunos);
    } catch (error) {
      if (buscaId !== ultimaBuscaId.current) {
        return;
      }

      setResultados([]);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível buscar os alunos."
      );
    } finally {
      if (buscaId === ultimaBuscaId.current) {
        setBuscando(false);
      }
    }
  }

  function handleSelecionar(aluno: AlunoComResponsavel) {
    ultimaBuscaId.current += 1;

    onSelecionar(aluno);
    setBusca(aluno.nome);
    setResultados([]);
    setErro("");
    setBuscando(false);
  }

  return (
    <div className={styles.container}>
      <label htmlFor="alunoBusca">Aluno</label>

      <input
        id="alunoBusca"
        type="text"
        value={busca}
        placeholder="Digite o nome do aluno"
        autoComplete="off"
        disabled={disabled}
        onChange={(event) => handleBusca(event.target.value)}
      />

      {!alunoSelecionado && busca.trim().length === 1 && (
        <p className={styles.ajuda}>
          Digite pelo menos 2 letras para buscar.
        </p>
      )}

      {buscando && <p className={styles.ajuda}>Buscando alunos...</p>}

      {erro && <p className={styles.erro}>{erro}</p>}

      {!buscando &&
        !erro &&
        !alunoSelecionado &&
        busca.trim().length >= 2 &&
        resultados.length === 0 && (
          <p className={styles.ajuda}>Nenhum aluno encontrado.</p>
        )}

      {resultados.length > 0 && !alunoSelecionado && (
        <div className={styles.resultados}>
          {resultados.map((aluno) => (
            <button
              key={aluno.id}
              type="button"
              className={styles.resultado}
              onClick={() => handleSelecionar(aluno)}
            >
              {aluno.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}