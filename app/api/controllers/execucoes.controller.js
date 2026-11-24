const { RESULTADOS_DIR } = require("../config/ambiente");
const resultadosService = require("../services/resultados.service");

/** Lista todas as execuções disponíveis. */
async function listar(request, response, next) {
  try {
    const execucoes = await resultadosService.listarExecucoes(RESULTADOS_DIR,);

    return response.status(200).json({
      consultado_em: new Date().toISOString(),
      total: execucoes.length,
      execucoes,
    });
  } catch (erro) {
    return next(erro);
  }
}

/** Retorna os detalhes de uma execução específica. */
async function obterDetalhes(request, response, next) {
  try {
    const { escalonador, experimento, id } = request.params;

    const detalhes = await resultadosService.obterDetalhesExecucao(
      RESULTADOS_DIR,
      escalonador,
      experimento,
      id,
    );

    if (!detalhes) {
      return response.status(404).json({
        erro: "Execução não encontrada.",
      });
    }

    return response.status(200).json(detalhes);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = {
  listar,
  obterDetalhes,
};