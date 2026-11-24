/** Configura a comunicação em tempo real da API. */
function configurarGatewaySocket(io) {
  /** Registra a conexão de uma dashboard. */
  io.on("connection", (socket) => {
    console.log(`[Socket] Dashboard conectada: ${socket.id}`);

    /** Registra o encerramento da conexão da dashboard. */
    socket.on("disconnect", (motivo) => {
      console.log(
        `[Socket] Dashboard desconectada: ${socket.id} (${motivo})`,
      );
    });
  });

  /** Notifica todas as dashboards sobre alterações nos resultados. */
  function notificarAlteracaoResultados(alteracao) {
    io.emit("resultados:alterados", alteracao);
  }

  return {
    notificarAlteracaoResultados,
  };
}

module.exports = {
  configurarGatewaySocket,
};