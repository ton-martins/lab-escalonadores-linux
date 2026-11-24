/** Função utilizada para criar uma conexão Socket.IO no navegador. */
import { io } from "socket.io-client";

/** Endereço do servidor Socket.IO da API. */
import { SOCKET_URL } from "../config/ambiente";

/** Conexão Socket.IO atual da dashboard. */
let socket = null;

/** Retorna a conexão Socket.IO única da aplicação. */
function obterSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
    });
  }

  return socket;
}

/** Conecta a dashboard ao servidor Socket.IO. */
export function conectarSocket() {
  const conexao = obterSocket();

  if (!conexao.connected) {
    conexao.connect();
  }

  return conexao;
}

/** Observa alterações em resultados enviadas pela API. */
export function observarAlteracoesResultados(aoAlterar) {
  const conexao = conectarSocket();

  conexao.on("resultados:alterados", aoAlterar);

  return () => {
    conexao.off("resultados:alterados", aoAlterar);
  };
}

/** Encerra a conexão Socket.IO ativa. */
export function desconectarSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}