/** Biblioteca utilizada para observar alterações em arquivos. */
const chokidar = require("chokidar");

/** Módulo utilizado para manipular caminhos de arquivos. */
const path = require("node:path");

/** Traduz eventos do Chokidar para nomes usados pela aplicação. */
const TIPOS_EVENTO_STATUS = {
  add: "criado",
  change: "alterado",
  unlink: "removido",
};

/** Inicia o monitoramento da pasta de resultados. */
function iniciarObservadorResultados({
  diretorioResultados,
  aoAlterar,
}) {
  const observador = chokidar.watch(diretorioResultados, {
    /** Reage apenas à novas alterações, arquivos antigos não criam novos eventos */
    ignoreInitial: true,

    /** Pede ao Chokidar para esperar o arquivo terminar de ser escrito antes de informar a alteração.*/
    awaitWriteFinish: {
      /** O arquivo deve permanecer sem mudanças por pelo menos 300 milissegundos. */
      stabilityThreshold: 300,

      /** O Chokidar verifica a estabilidade a cada 100 milissegundos. */
      pollInterval: 100,
    },
  });

  observador.on("all", (evento, caminhoArquivo) => {
    /** Ignora arquivos que não representam o status de uma execução. */
    if (path.basename(caminhoArquivo) !== "status.json") {
      return;
    }

    const tipo = TIPOS_EVENTO_STATUS[evento];

    /** Ignora eventos não mapeados pela aplicação. */
    if (!tipo) {
      return;
    }

    /** Caminho relativo do arquivo dentro da pasta de resultados. */
    const arquivo = path.relative(diretorioResultados,caminhoArquivo);

    /** Informa ao gateway que houve alteração em uma execução. */
    aoAlterar({
      tipo,
      arquivo,
      detectado_em: new Date().toISOString(),
    });
  });

  /** Informa quando o monitoramento está pronto. */
  observador.on("ready", () => {
    console.log(`[Resultados] Observando: ${diretorioResultados}`);
  });

  return observador;
}

module.exports = {
  iniciarObservadorResultados,
};