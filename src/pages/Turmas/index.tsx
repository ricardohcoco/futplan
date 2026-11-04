import { useEffect, useState } from "react";
import type { NovaTurma, TurmaComDias } from "../../types/turma";
import {
  cadastrarTurma,
  editarTurma,
  inativarTurma,
  listarTurmas,
} from "../../services/turmas";
import styles from "./Turmas.module.css";
import TurmaForm from "../../components/turmas/TurmaForm";
import TurmasList from "../../components/turmas/TurmaList";

export default function Turmas() {
  const [turmas, setTurmas] = useState<TurmaComDias[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [turmaEmEdicao, setTurmaEmEdicao] = useState<TurmaComDias | null>(null);

  useEffect(() => {
    async function carregarTurmas() {
      try {
        const dados = await listarTurmas();
        setTurmas(dados);
      } catch {
        setErro("Não foi possível carregar as turmas.");
      } finally {
        setCarregando(false);
      }
    }

    void carregarTurmas();
  }, []);

  async function handleSalvar(dados: NovaTurma): Promise<boolean> {
    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      if (turmaEmEdicao) {
        const turmaAtualizada = await editarTurma(turmaEmEdicao.id, dados);

        setTurmas((anteriores) =>
          anteriores
            .map((turma) =>
              turma.id === turmaAtualizada.id ? turmaAtualizada : turma,
            )
            .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
        );

        setTurmaEmEdicao(null);
        setMensagem("Turma atualizada com sucesso!");
      } else {
        const novaTurma = await cadastrarTurma(dados);

        setTurmas((anteriores) =>
          [...anteriores, novaTurma].sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR"),
          ),
        );

        setMensagem("Turma cadastrada com sucesso!");
      }

      return true;
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a turma.",
      );
      return false;
    } finally {
      setSalvando(false);
    }
  }

  function handleEditar(turma: TurmaComDias) {
    setTurmaEmEdicao(turma);
    setErro("");
    setMensagem("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelar() {
    setTurmaEmEdicao(null);
    setErro("");
    setMensagem("");
  }

  async function handleInativar(turma: TurmaComDias) {
    const confirmou = window.confirm(
        `Deseja inativar a turma ${turma.nome}?`
    );

    if (!confirmou) return;

    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
        await inativarTurma(turma.id);

        setTurmas((anteriores) =>
            anteriores.map((item) =>
            item.id === turma.id ? { ...item, ativo: false } : item
            )
        );

        if (turmaEmEdicao?.id === turma.id) {
            setTurmaEmEdicao(null);
        }

        setMensagem("Turma inativada com sucesso!");
    } catch (error) {
        setErro(
            error instanceof Error
            ? error.message
            : "Não foi possível inativar a turma."
        );
    } finally {
        setSalvando(false);
    }
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Turmas</h1>
        <p>Cadastre e consulte as turmas da escolinha.</p>
      </header>

      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      {mensagem && (
        <p className={styles.sucesso} role="status">
          {mensagem}
        </p>
      )}

      <TurmaForm
        key={turmaEmEdicao?.id ?? "nova"}
        turmaEmEdicao={turmaEmEdicao} 
        salvando={salvando} 
        onSalvar={handleSalvar}
        onCancelar={handleCancelar} 
      />

      <TurmasList 
        turmas={turmas} 
        carregando={carregando}
        salvando={salvando}
        onEditar={handleEditar}
        onInativar={handleInativar}
      />
    </main>
  );
}
