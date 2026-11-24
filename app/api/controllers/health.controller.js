/** Retorna o estado atual da API. */
function obterHealth(request, response) {
  response.status(200).json({
    status: "online",
    servico: "dashboard-api",
    verificado_em: new Date().toISOString(),
  });
}

module.exports = {
  obterHealth,
};