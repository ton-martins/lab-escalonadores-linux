/** Função utilizada para criar estados reativos no Vue. */
import { ref } from "vue";

import {
  listarExecucoes as listarExecucoesApi,
  obterDetalhesExecucao,
} from "../services/api.service";

import {
  conectarSocket,
  desconectarSocket,
  observarAlteracoesResultados,
} from "../services/socket.service";

/** Centraliza o estado e as ações relacionadas às execuções. */
export function useExecucoes() {
  /** Lista de execuções retornada pela API. */
  const execucoes = ref([]);

  /** Execução escolhida para exibição detalhada. */
  const execucaoSelecionada = ref(null);

  /** Indica o carregamento da lista de execuções. */
  const carregando = ref(false);

  /** Indica o carregamento dos detalhes de uma execução. */
  const carregandoDetalhes = ref(false);

  /** Armazena mensagens de erro para a interface. */
  const erro = ref(null);

  /** Indica o estado da conexão em tempo real. */
  const statusTempoReal = ref("desconectado");

  /** Registra quando os dados foram atualizados. */
  const atualizadoEm = ref(null);

  /** Armazena a função que remove o listener Socket.IO. */
  let removerObservador = null;

  /** Armazena a conexão Socket.IO utilizada pelo composable. */
  let conexaoSocket = null;

  /** Busca a lista atual de execuções na API. */
  async function listarExecucoes() {
    carregando.value = true;
    erro.value = null;

    try {
      const resposta = await listarExecucoesApi();

      execucoes.value = resposta.execucoes;
      atualizadoEm.value = resposta.consultado_em;
    } catch (erroCapturado) {
      erro.value = erroCapturado.message;
    } finally {
      carregando.value = false;
    }
  }

  /** Busca e seleciona os detalhes de uma execução. */
  async function selecionarExecucao(execucao) {
    carregandoDetalhes.value = true;
    erro.value = null;

    try {
      const detalhes = await obterDetalhesExecucao({
        escalonador: execucao.escalonador,
        experimento: execucao.experimento,
        id: execucao.id,
      });

      execucaoSelecionada.value = detalhes;
    } catch (erroCapturado) {
      erro.value = erroCapturado.message;
    } finally {
      carregandoDetalhes.value = false;
    }
  }

  /** Remove a execução atualmente selecionada. */
  function limparSelecao() {
    execucaoSelecionada.value = null;
  }


  /** Atualiza o estado quando o Socket.IO conecta à API. */
  function tratarConexaoSocket() {
    statusTempoReal.value = "conectado";
  }

  /** Atualiza o estado quando o Socket.IO desconecta da API. */
  function tratarDesconexaoSocket() {
    statusTempoReal.value = "desconectado";
  }

  /** Atualiza os dados após uma alteração nos resultados. */
  async function atualizarAposAlteracao() {
    await listarExecucoes();

    if (execucaoSelecionada.value) {
      await selecionarExecucao(execucaoSelecionada.value);
    }
  }

  /** Inicia a comunicação em tempo real com a API. */
  function iniciarTempoReal() {
    if (conexaoSocket) {
      return;
    }

    statusTempoReal.value = "conectando";

    conexaoSocket = conectarSocket();

    conexaoSocket.on("connect", tratarConexaoSocket);
    conexaoSocket.on("disconnect", tratarDesconexaoSocket);

    if (conexaoSocket.connected) {
      tratarConexaoSocket();
    }

    removerObservador = observarAlteracoesResultados(
      atualizarAposAlteracao,
    );
  }

    /** Encerra listeners e a conexão em tempo real. */
  function encerrarTempoReal() {
    if (removerObservador) {
      removerObservador();
      removerObservador = null;
    }

    if (conexaoSocket) {
      conexaoSocket.off("connect", tratarConexaoSocket);
      conexaoSocket.off("disconnect", tratarDesconexaoSocket);

      desconectarSocket();

      conexaoSocket = null;
    }

    statusTempoReal.value = "desconectado";
  }

  /** Carrega os dados iniciais e inicia o tempo real. */
  async function iniciar() {
    iniciarTempoReal();

    await listarExecucoes();
  }

  return {
    execucoes,
    execucaoSelecionada,
    carregando,
    carregandoDetalhes,
    erro,
    statusTempoReal,
    atualizadoEm,
    listarExecucoes,
    selecionarExecucao,
    limparSelecao,
    iniciar,
    encerrarTempoReal,
  };
}