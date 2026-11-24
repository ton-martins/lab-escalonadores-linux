const path = require("node:path");

/** Diretório da API. */
const API_DIR = path.resolve(__dirname, "..");

/** Diretório-raiz do laboratório. */
const LAB_DIR = path.resolve(API_DIR, "../..");

/** Porta HTTP utilizada pela API. */
const API_PORT = 3000;

/** Porta HTTP utilizada pelo frontend. */
const APP_PORT = 5173;

/** URL da API. */
const API_URL = `http://localhost:${API_PORT}`;

/** URL do frontend. */
const APP_URL = `http://localhost:${APP_PORT}`;

/** Diretório que armazena os resultados dos experimentos. */
const RESULTADOS_DIR = path.join(LAB_DIR, "resultados");

module.exports = Object.freeze({
  API_DIR,
  LAB_DIR,
  API_PORT,
  APP_PORT,
  API_URL,
  APP_URL,
  RESULTADOS_DIR,
});