import { useEffect, useState } from "react";

import {
  consultarConfiguracao,
  definirValorMensalidade,
} from "../../services/configuracoes";

import {
  gerarMensalidades,
  listarMensalidades,
  registrarPagamento,
  type DadosGeracaoMensalidades,
} from "../../services/mensalidades";

import {
  getPerfilUsuario,
  type PerfilUsuario,
} from "../../services/auth";

import type { MensalidadeComDetalhes } from "../../types/mensalidades";

import ValorMensalidadeForm from "../../components/mensalidades/ValorMensalidadeForm";
import GeracaoMensalidadesForm from "../../components/mensalidades/GeracaoMensalidadesForm";
import MensalidadesList from "../../components/mensalidades/MensalidadesList";

import MensalidadesFiltros, {
  type SituacaoFiltro,
} from "../../components/mensalidades/MensalidadesFiltros";

import styles from "./Mensalidades.module.css";

function obterHojeBrasilia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function Mensalidades() {
  const [valorAtual, setValorAtual] = useState<number | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  const [mensalidades, setMensalidades] = useState<
    MensalidadeComDetalhes[]
  >([]);

  const [mesFiltro, setMesFiltro] = useState("");
  const [situacaoFiltro, setSituacaoFiltro] =
    useState<SituacaoFiltro>("pendente");

  const [carregando, setCarregando] = useState(true);
  const [carregandoMensalidades, setCarregandoMensalidades] =
    useState(false);

  const [salvando, setSalvando] = useState(false);
  const [gerando, setGerando] = useState(false);

  const [registrandoPagamento, setRegistrandoPagamento] = useState<
    string | null
  >(null);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarMensalidades() {
    setCarregandoMensalidades(true);

    try {
      const dados = await listarMensalidades();
      setMensalidades(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as mensalidades.",
      );
    } finally {
      setCarregandoMensalidades(false);
    }
  }

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const [configuracao, perfilUsuario, dadosMensalidades] =
          await Promise.all([
            consultarConfiguracao(),
            getPerfilUsuario(),
            listarMensalidades(),
          ]);

        setValorAtual(configuracao?.valor_mensalidade ?? null);
        setPerfil(perfilUsuario);
        setMensalidades(dadosMensalidades);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados das mensalidades.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarDadosIniciais();
  }, []);

  async function handleSalvar(valor: number): Promise<boolean> {
    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      await definirValorMensalidade(valor);

      setValorAtual(valor);
      setMensagem("Valor da mensalidade salvo com sucesso!");

      return true;
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o valor.",
      );

      return false;
    } finally {
      setSalvando(false);
    }
  }

  async function handleGerar(
    dados: DadosGeracaoMensalidades,
  ): Promise<boolean> {
    const confirmou = window.confirm(
      `Deseja gerar as mensalidades de ${dados.mesReferencia.slice(0, 7)}? ` +
        "Essa operação criará cobranças no banco de dados.",
    );

    if (!confirmou) {
      return false;
    }

    setGerando(true);
    setErro("");
    setMensagem("");

    try {
      const quantidade = await gerarMensalidades(dados);

      await carregarMensalidades();

      setMensagem(
        `${quantidade} mensalidade(s) criada(s) com sucesso!`,
      );

      return true;
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar as mensalidades.",
      );

      return false;
    } finally {
      setGerando(false);
    }
  }

  async function handleRegistrarPagamento(
    mensalidadeId: string,
  ): Promise<void> {
    const confirmou = window.confirm(
      "Confirma o recebimento desta mensalidade? A data de hoje será registrada automaticamente.",
    );

    if (!confirmou) {
      return;
    }

    setRegistrandoPagamento(mensalidadeId);
    setErro("");
    setMensagem("");

    try {
      await registrarPagamento(mensalidadeId);

      await carregarMensalidades();

      setMensagem("Pagamento registrado com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar o pagamento.",
      );
    } finally {
      setRegistrandoPagamento(null);
    }
  }

  const hoje = obterHojeBrasilia();

  const mensalidadesFiltradas = mensalidades.filter(
    (mensalidade) => {
      const correspondeMes =
        !mesFiltro ||
        mensalidade.mes_referencia.slice(0, 7) === mesFiltro;

      const atrasada =
        mensalidade.situacao === "pendente" &&
        mensalidade.data_vencimento < hoje;

      let correspondeSituacao = true;

      if (situacaoFiltro === "paga") {
        correspondeSituacao = mensalidade.situacao === "paga";
      }

      if (situacaoFiltro === "pendente") {
        correspondeSituacao =
          mensalidade.situacao === "pendente" && !atrasada;
      }

      if (situacaoFiltro === "atrasada") {
        correspondeSituacao = atrasada;
      }

      return correspondeMes && correspondeSituacao;
    },
  );

  function handleLimparFiltros() {
    setMesFiltro("");
    setSituacaoFiltro("");
  }

  if (carregando) {
    return <p>Carregando dados...</p>;
  }

  return (
    <main className={styles.pagina}>
      <h1 className={styles.titulo}>Mensalidades</h1>

      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      {mensagem && (
        <p className={styles.mensagem} role="status">
          {mensagem}
        </p>
      )}

      {perfil === "gestor" && (
        <>
          <ValorMensalidadeForm
            key={valorAtual === null ? "sem-valor" : valorAtual}
            valorAtual={valorAtual}
            salvando={salvando}
            onSalvar={handleSalvar}
          />

          <GeracaoMensalidadesForm
            gerando={gerando}
            onGerar={handleGerar}
          />
        </>
      )}

      <MensalidadesFiltros
        mes={mesFiltro}
        situacao={situacaoFiltro}
        onAlterarMes={setMesFiltro}
        onAlterarSituacao={setSituacaoFiltro}
        onLimpar={handleLimparFiltros}
      />

      <MensalidadesList
        mensalidades={mensalidadesFiltradas}
        carregando={carregandoMensalidades}
        registrandoPagamento={registrandoPagamento}
        onRegistrarPagamento={handleRegistrarPagamento}
      />
    </main>
  );
}