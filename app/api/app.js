/** Framework utilizado para criar a aplicação HTTP. */
const express = require("express");

/** Middleware que permite requisições do frontend Vue. */
const cors = require("cors");

const { APP_URL } = require("./config/ambiente");
const apiRoutes = require("./routes/api.routes");
const tratamentoErros = require("./middleware/tratamento-erros");

const app = express();

/** Permite que o frontend em localhost:5173 acesse a API. */
app.use(
  cors({
    origin: APP_URL,
  }),
);

/** Registra todas as rotas com o prefixo /api. */
app.use("/api", apiRoutes);

/** Trata erros encaminhados pelos controllers. */
app.use(tratamentoErros);

module.exports = app;