import { useState, type FormEvent } from "react";
import type {
  AlunoComResponsavel,
  NovoAluno,
  TurnoEscolar,
} from "../../../types/aluno";
import type { Responsavel } from "../../../types/responsavel";
import styles from "./AlunoForm.module.css";
import { calcularIdade } from "../../../utils/calcularIdade";
import ResponsavelSearch from "../../responsaveis/ResponsavelSearch";

type DadosResponsaveisEdicao = {
  nome: string;
  telefone: string;
};

type AlunoFormProps = {
  alunoEmEdicao: AlunoComResponsavel | null;
  salvando: boolean;
  onSalvar: (
    dados: NovoAluno,
    dadosResponsavel?: DadosResponsaveisEdicao,
  ) => Promise<boolean>;
  onCancelar: () => void;
  erro: string;
  mensagem: string;
};

type ResponsavelSelecionado = {
  id: string;
  nome: string;
  telefone: string;
};

export default function AlunoForm({
  alunoEmEdicao,
  salvando,
  onSalvar,
  onCancelar,
  erro,
  mensagem,
}: AlunoFormProps) {
  const [nome, setNome] = useState(alunoEmEdicao?.nome ?? "");

  const [dataNascimento, setDataNascimento] = useState(
    alunoEmEdicao?.data_nascimento ?? "",
  );

  const [endereco, setEndereco] = useState(alunoEmEdicao?.endereco ?? "");

  const [escola, setEscola] = useState(alunoEmEdicao?.escola ?? "");

  const [turnoEscolar, setTurnoEscolar] = useState<TurnoEscolar>(
    alunoEmEdicao?.turno_escolar ?? "manha",
  );

  const [responsavelId, setResponsavelId] = useState(
    alunoEmEdicao?.responsavel_id ?? "",
  );

  const [parentesco, setParentesco] = useState(alunoEmEdicao?.parentesco ?? "");

  const [erroIdade, setErroIdade] = useState("");

  const responsavelInicial: ResponsavelSelecionado | null = alunoEmEdicao
    ? {
        id: alunoEmEdicao.responsavel_id,
        nome: alunoEmEdicao.responsaveis.nome,
        telefone: alunoEmEdicao.responsaveis.telefone,
      }
    : null;

  const [responsavelSelecionado, setResponsavelSelecionado] =
    useState<ResponsavelSelecionado | null>(responsavelInicial);

  const [nomeResponsavel, setNomeResponsavel] = useState(
    alunoEmEdicao?.responsaveis.nome ?? "",
  );

  const [telefoneResponsavel, setTelefoneResponsavel] = useState(
    alunoEmEdicao?.responsaveis.telefone ?? "",
  );

  function handleSelecionarResponsavel(responsavel: Responsavel) {
    setResponsavelSelecionado({
      id: responsavel.id,
      nome: responsavel.nome,
      telefone: responsavel.telefone,
    });

    setResponsavelId(responsavel.id);
    setNomeResponsavel(responsavel.nome);
    setTelefoneResponsavel(responsavel.telefone);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dados: NovoAluno = {
      nome: nome.trim(),
      data_nascimento: dataNascimento,
      endereco: endereco.trim(),
      escola: escola.trim(),
      turno_escolar: turnoEscolar,
      responsavel_id: responsavelId,
      parentesco: parentesco.trim(),
    };

    if (
      !dados.nome ||
      !dados.data_nascimento ||
      !dados.endereco ||
      !dados.escola ||
      !dados.responsavel_id ||
      !dados.parentesco
    ) {
      return;
    }

    const idade = calcularIdade(dados.data_nascimento);

    if (!alunoEmEdicao && (idade < 5 || idade > 15)) {
      setErroIdade("O aluno deve ter entre 5 e 15 anos completos.");
      return;
    }

    if (
      alunoEmEdicao &&
      dados.data_nascimento !== alunoEmEdicao.data_nascimento &&
      (idade < 5 || idade > 15)
    ) {
      setErroIdade(
        "A nova data de nascimento deve corresponder a uma idade entre 5 e 15 anos completos.",
      );
      return;
    }

    setErroIdade("");

    if (
      alunoEmEdicao &&
      (!nomeResponsavel.trim() || !telefoneResponsavel.trim())
    ) {
      return;
    }

    const salvou = await onSalvar(
      dados,
      alunoEmEdicao
        ? {
            nome: nomeResponsavel.trim(),
            telefone: telefoneResponsavel.trim(),
          }
        : undefined,
    );

    if (salvou) {
      setNome("");
      setDataNascimento("");
      setEndereco("");
      setEscola("");
      setTurnoEscolar("manha");
      setResponsavelId("");
      setResponsavelSelecionado(null);
      setNomeResponsavel("");
      setTelefoneResponsavel("");
      setParentesco("");
    }
  }

  return (
    <section className={styles.card}>
      <h2>{alunoEmEdicao ? "Editar aluno" : "Novo aluno"}</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="aluno-nome">Nome completo</label>

        <input
          id="aluno-nome"
          type="text"
          maxLength={100}
          required
          value={nome}
          onChange={(event) => setNome(event.target.value)}
        />

        <label htmlFor="aluno-nascimento">Data de nascimento</label>

        <input
          id="aluno-nascimento"
          type="date"
          required
          value={dataNascimento}
          onChange={(event) => {
            setDataNascimento(event.target.value);
            setErroIdade("");
          }}
        />

        {erroIdade && (
          <p className={styles.erro} role="alert">
            {erroIdade}
          </p>
        )}

        <label htmlFor="aluno-endereco">Endereço</label>

        <input
          id="aluno-endereco"
          type="text"
          required
          value={endereco}
          onChange={(event) => setEndereco(event.target.value)}
        />

        <label htmlFor="aluno-escola">Escola</label>

        <input
          id="aluno-escola"
          type="text"
          maxLength={100}
          required
          value={escola}
          onChange={(event) => setEscola(event.target.value)}
        />

        <label htmlFor="aluno-turno">Turno escolar</label>

        <select
          id="aluno-turno"
          value={turnoEscolar}
          onChange={(event) =>
            setTurnoEscolar(event.target.value as TurnoEscolar)
          }
        >
          <option value="manha">Manhã</option>
          <option value="tarde">Tarde</option>
        </select>

        <ResponsavelSearch
          responsavelSelecionado={responsavelSelecionado}
          onSelecionar={handleSelecionarResponsavel}
        />

        {alunoEmEdicao && responsavelSelecionado && (
          <>
            <label htmlFor="responsavel-nome">Nome do responsável</label>

            <input
              id="responsavel-nome"
              type="text"
              maxLength={100}
              required
              value={nomeResponsavel}
              onChange={(event) => setNomeResponsavel(event.target.value)}
            />

            <label htmlFor="responsavel-telefone">
              Telefone do responsável
            </label>

            <input
              id="responsavel-telefone"
              type="tel"
              maxLength={20}
              required
              value={telefoneResponsavel}
              onChange={(event) => setTelefoneResponsavel(event.target.value)}
            />

            <p className={styles.avisoResponsavel}>
              Alterações nos dados do responsável serão refletidas em todos os
              alunos vinculados a ele.
            </p>
          </>
        )}

        <label htmlFor="aluno-parentesco">Parentesco do responsável</label>

        <input
          id="aluno-parentesco"
          type="text"
          maxLength={30}
          placeholder="Ex.: mãe, pai, avó"
          required
          value={parentesco}
          onChange={(event) => setParentesco(event.target.value)}
        />

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

        <div className={styles.acoesFormulario}>
          <button
            type="submit"
            disabled={salvando || (!alunoEmEdicao && !responsavelSelecionado)}
          >
            {salvando
              ? "Salvando..."
              : alunoEmEdicao
                ? "Salvar alterações"
                : "Cadastrar aluno"}
          </button>

          {alunoEmEdicao && (
            <button
              type="button"
              className={styles.botaoSecundario}
              onClick={onCancelar}
              disabled={salvando}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
