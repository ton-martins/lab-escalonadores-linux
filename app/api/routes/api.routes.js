/** Framework utilizado para criar rotas e endpoints HTTP. */
const express = require("express");
const healthController = require("../controllers/health.controller");
const execucoesController = require("../controllers/execucoes.controller");

const router = express.Router();

/** Retorna o estado atual da API. */
router.get("/health", healthController.obterHealth);

/** Lista todas as execuções. */
router.get("/execucoes", execucoesController.listar);

/** Retorna os detalhes de uma execução. */
router.get("/execucoes/:escalonador/:experimento/:id",execucoesController.obterDetalhes);

module.exports = router;