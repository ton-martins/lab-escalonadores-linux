/** Trata erros não previstos durante as requisições. */
function tratamentoErros(erro, request, response, next) {
  console.error("Erro inesperado na API:", erro);

  return response.status(500).json({
    erro: "Não foi possível processar a solicitação.",
  });
}

module.exports = tratamentoErros;