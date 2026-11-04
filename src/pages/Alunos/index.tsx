import { useEffect, useRef, useState } from "react";
import type { AlunoComResponsavel, NovoAluno } from "../../types/aluno";
import type { NovoResponsavel } from "../../types/responsavel";

import { cadastrarResponsavel } from "../../services/responsaveis";

import {
  cadastrarAluno,
  editarAlunoComResponsavel,
  inativarAluno,
  listarAlunos,
} from "../../services/alunos";

import AlunoForm from "../../components/alunos/AlunoForm";
import AlunosList from "../../components/alunos/AlunoList";
import ResponsavelForm from "../../components/responsaveis/ResponsavelForm";

import styles from "./Alunos.module.css";

type DadosResponsavelEdicao = {
  nome: string;
  telefone: string;
};

export default function Alunos() {
  const [alunos, setAlunos] = useState<AlunoComResponsavel[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [alunoEmEdicao, setAlunoEmEdicao] =
    useState<AlunoComResponsavel | null>(null);

  const [salvandoResponsavel, setSalvandoResponsavel] = useState(false);
  const [erroResponsavel, setErroResponsavel] = useState("");
  const [mensagemResponsavel, setMensagemResponsavel] = useState("");

  const alunoFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        const dadosAlunos = await listarAlunos();
        setAlunos(dadosAlunos);
      } catch {
        setErro("Não foi possível carregar os dados da página.");
      } finally {
        setCarregando(false);
      }
    }

    void carregarDados();
  }, []);

  async function handleSalvarResponsavel(
    dados: NovoResponsavel,
  ): Promise<boolean> {
    setSalvandoResponsavel(true);
    setErroResponsavel("");
    setMensagemResponsavel("");

    try {
      await cadastrarResponsavel(dados);

      setMensagemResponsavel(
        "Responsável cadastrado com sucesso! Ele já pode ser localizado na busca do cadastro do aluno.",
      );

      return true;
    } catch (error) {
      setErroResponsavel(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o responsável.",
      );

      return false;
    } finally {
      setSalvandoResponsavel(false);
    }
  }

  async function handleSalvar(
    dados: NovoAluno,
    dadosResponsavel?: DadosResponsavelEdicao,
  ): Promise<boolean> {
    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      if (alunoEmEdicao) {
        if (!dadosResponsavel) {
          throw new Error("Os dados do responsável são obrigatórios.");
        }

        const alunoId = alunoEmEdicao.id;

        await editarAlunoComResponsavel(alunoId, dados, dadosResponsavel);

        setAlunos((anteriores) =>
          anteriores
            .map((aluno) => {
              const usaResponsavelAtualizado =
                aluno.responsavel_id === dados.responsavel_id;

              if (aluno.id === alunoId) {
                return {
                  ...aluno,
                  ...dados,
                  responsaveis: {
                    nome: dadosResponsavel.nome,
                    telefone: dadosResponsavel.telefone,
                  },
                };
              }

              if (usaResponsavelAtualizado) {
                return {
                  ...aluno,
                  responsaveis: {
                    nome: dadosResponsavel.nome,
                    telefone: dadosResponsavel.telefone,
                  },
                };
              }

              return aluno;
            })
            .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
        );
        setAlunoEmEdicao(null);
        setMensagem("O aluno e responsável foram atualizados com sucesso!");
      } else {
        const novoAluno = await cadastrarAluno(dados);

        setAlunos((anteriores) =>
          [...anteriores, novoAluno].sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR"),
          ),
        );

        setMensagem("Aluno cadastrado com sucesso!");
      }

      return true;
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar os dados do aluno.",
      );

      return false;
    } finally {
      setSalvando(false);
    }
  }

  function handleEditar(aluno: AlunoComResponsavel) {
    setAlunoEmEdicao(aluno);
    setErro("");
    setMensagem("");

    setTimeout(() => {
      alunoFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function handleCancelar() {
    setAlunoEmEdicao(null);
    setErro("");
    setMensagem("");
  }

  async function handleInativar(aluno: AlunoComResponsavel) {
    const confirmou = window.confirm(`Deseja inativar o aluno ${aluno.nome}?`);

    if (!confirmou) return;

    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      await inativarAluno(aluno.id);

      setAlunos((anteriores) =>
        anteriores.map((item) =>
          item.id === aluno.id
            ? {
                ...item,
                ativo: false,
              }
            : item,
        ),
      );

      if (alunoEmEdicao?.id === aluno.id) {
        setAlunoEmEdicao(null);
      }

      setMensagem("Aluno inativado com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível inativar o aluno.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Alunos</h1>

        <p>
          Cadastre responsáveis, alunos e consulte os registros da escolinha.
        </p>
      </header>

      <div className={styles.conteudo}>
        <ResponsavelForm
          responsavelEmEdicao={null}
          salvando={salvandoResponsavel}
          erro={erroResponsavel}
          mensagem={mensagemResponsavel}
          onSalvar={handleSalvarResponsavel}
          onCancelar={() => {}}
        />

        <div ref={alunoFormRef}>
          <AlunoForm
            key={alunoEmEdicao?.id ?? "novo"}
            alunoEmEdicao={alunoEmEdicao}
            salvando={salvando}
            erro={erro}
            mensagem={mensagem}
            onSalvar={handleSalvar}
            onCancelar={handleCancelar}
          />
        </div>

        <AlunosList
          alunos={alunos}
          carregando={carregando}
          salvando={salvando}
          onEditar={handleEditar}
          onInativar={handleInativar}
        />
      </div>
    </main>
  );
}
