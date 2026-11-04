import { useState, useRef } from "react";
import type { Responsavel } from "../../../types/responsavel";
import { buscarResponsaveis } from "../../../services/responsaveis";
import styles from "./ResponsavelSearch.module.css";

type ResponsavelSelecionado = {
  id: string;
  nome: string;
  telefone: string;
};

type ResponsavelSearchProps = {
  responsavelSelecionado: ResponsavelSelecionado | null;
  onSelecionar: (responsavel: Responsavel) => void;
};

export default function ResponsavelSearch({
  responsavelSelecionado,
  onSelecionar,
}: ResponsavelSearchProps) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Responsavel[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState("");

  const ultimaBuscaId = useRef(0);

  async function handleBuscar(valor: string) {
    setBusca(valor);
    setErro("");

    const buscaId = ++ultimaBuscaId.current;

    if (valor.trim().length < 2) {
      setResultados([]);
      setBuscando(false);
      return;
    }

    try {
      setBuscando(true);

      const dados = await buscarResponsaveis(valor);

      if (buscaId !== ultimaBuscaId.current) {
        return;
      }

      setResultados(dados);
    } catch (error) {
      if (buscaId !== ultimaBuscaId.current) {
        return;
      }

      setResultados([]);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível buscar os responsáveis.",
      );
    } finally {
      if (buscaId === ultimaBuscaId.current) {
        setBuscando(false);
      }
    }
  }

  function handleSelecionar(responsavel: Responsavel) {
    ++ultimaBuscaId.current;

    onSelecionar(responsavel);
    setBusca("");
    setResultados([]);
    setErro("");
    setBuscando(false);
  }

  return (
    <div className={styles.container}>
      <label htmlFor="busca-responsavel">Responsável</label>

      <input
        id="busca-responsavel"
        type="text"
        value={busca}
        onChange={(event) => void handleBuscar(event.target.value)}
        placeholder="Digite pelo menos 2 letras do nome"
        autoComplete="off"
      />

      {buscando && (
        <p className={styles.informacao}>Buscando responsáveis...</p>
      )}

      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      {!buscando &&
        busca.trim().length >= 2 &&
        resultados.length === 0 &&
        !erro && (
          <p className={styles.informacao}>Nenhum responsável encontrado.</p>
        )}

      {resultados.length > 0 && (
        <div className={styles.resultados}>
          {resultados.map((responsavel) => (
            <button
              key={responsavel.id}
              type="button"
              className={styles.resultado}
              onClick={() => handleSelecionar(responsavel)}
            >
              <strong>{responsavel.nome}</strong>
              <span>{responsavel.telefone}</span>
            </button>
          ))}
        </div>
      )}

      {responsavelSelecionado && (
        <div className={styles.selecionado}>
          <span>Responsável selecionado</span>

          <strong>{responsavelSelecionado.nome}</strong>

          <span>{responsavelSelecionado.telefone}</span>
        </div>
      )}
    </div>
  );
}
