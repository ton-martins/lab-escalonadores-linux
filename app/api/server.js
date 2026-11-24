/** Módulo nativo para criação do servidor HTTP. */
const http = require("node:http");

/** Biblioteca utilizada para comunicação em tempo real. */
const { Server } = require("socket.io");

const app = require("./app");

const {
  API_PORT,
  API_URL,
  APP_URL,
  RESULTADOS_DIR,
} = require("./config/ambiente");

const {
  configurarGatewaySocket,
} = require("./realtime/socket.gateway");

const {
  iniciarObservadorResultados,
} = require("./observers/resultados.observer");

/** Servidor HTTP que entrega a aplicação Express. */
const servidorHttp = http.createServer(app);

/** Servidor Socket.IO conectado ao mesmo servidor HTTP. */
const io = new Server(servidorHttp, {
  cors: {
    origin: APP_URL,
    methods: ["GET", "POST"],
  },
});

/** Configura os eventos de conexão e emissão do Socket.IO. */
const gatewaySocket = configurarGatewaySocket(io);

/** Inicia o monitoramento dos arquivos de resultados. */
const observadorResultados = iniciarObservadorResultados({
  diretorioResultados: RESULTADOS_DIR,
  aoAlterar: gatewaySocket.notificarAlteracaoResultados,
});

/** Evita que o processo de encerramento seja executado mais de uma vez. */
let encerrando = false;

/** Encerra conexões e recursos da API. */
async function encerrarServidor(sinal) {
  if (encerrando) {
    return;
  }

  encerrando = true;

  console.log(`\n[API] Sinal ${sinal} recebido. Encerrando...`);

  try {
    await observadorResultados.close();

    io.close();

    servidorHttp.close((erro) => {
      if (erro) {
        console.error("[API] Erro durante o encerramento:", erro);
        process.exit(1);
      }

      console.log("[API] Encerrada corretamente.");
      process.exit(0);
    });
  } catch (erro) {
    console.error("[API] Erro durante o encerramento:", erro);
    process.exit(1);
  }
}

/** Trata o encerramento pelo atalho Ctrl + C. */
process.once("SIGINT", () => encerrarServidor("SIGINT"));

/** Trata solicitações de encerramento do sistema operacional. */
process.once("SIGTERM", () => encerrarServidor("SIGTERM"));

/** Inicia a API HTTP e o Socket.IO. */
servidorHttp.listen(API_PORT, () => {
  console.log(`API disponível em ${API_URL}`);
});