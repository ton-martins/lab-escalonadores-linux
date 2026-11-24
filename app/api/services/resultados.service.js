/** Módulo nativo para leitura assíncrona de arquivos e diretórios.*/
const fs = require("node:fs/promises");

/** Módulo nativo para montagem de caminhos de diretórios.*/
const path = require("node:path");

/** Função utilizada para converter arquivos CSV em objetos JavaScript.*/
const { parse } = require("csv-parse/sync");

/** Retorna os nomes dos subdiretórios de um diretório. */
async function listarSubdiretorios(diretorio) {
  try {
    const itens = await fs.readdir(diretorio, {
      withFileTypes: true,
    });

    return itens
      .filter((item) => item.isDirectory())
      .map((item) => item.name);
  } catch (erro) {
    if (erro.code === "ENOENT") {
      return [];
    }

    throw erro;
  }
}

/** Lê um arquivo JSON e retorna null caso ele não exista. */
async function lerJsonOpcional(caminhoArquivo) {
  try {
    const conteudo = await fs.readFile(caminhoArquivo, "utf8");

    return JSON.parse(conteudo);
  } catch (erro) {
    if (erro.code === "ENOENT") {
      return null;
    }

    throw erro;
  }
}

/** Converte os campos numéricos de uma linha do resumo. */
function normalizarResumo(linha) {
  return {
    ...linha,
    duracao_segundos: Number(linha.duracao_segundos),
    vcpu: Number(linha.vcpu),
    pid: Number(linha.pid),
    nice: Number(linha.nice),
    cpu_media: Number(linha.cpu_media),
    espera_media: Number(linha.espera_media),
  };
}

/** Converte os campos numéricos de uma amostra do pidstat. */
function normalizarAmostra(linha) {
  return {
    ...linha,
    pid: Number(linha.pid),
    cpu_percentual: Number(linha.cpu_percentual),
    espera_percentual: Number(linha.espera_percentual),
    vcpu: Number(linha.vcpu),
  };
}

/** Lê um CSV opcional e normaliza suas linhas. */
async function lerCsvOpcional(
  diretorioExecucao,
  nomeArquivoCsv,
  normalizadorDados,
) {
  try {
    const caminhoCsv = path.join(diretorioExecucao, nomeArquivoCsv);

    const conteudo = await fs.readFile(caminhoCsv, "utf8");

    const linhas = parse(conteudo, {
      columns: true,
      skip_empty_lines: true,
    });

    return linhas.map((linha) => normalizadorDados(linha));
  } catch (erro) {
    if (erro.code === "ENOENT") {
      return [];
    }

    throw erro;
  }
}

/** Lista todas as execuções salvas no laboratório. */
async function listarExecucoes(diretorioResultados) {
    const execucoes = [];
    const escalonadores = await listarSubdiretorios(diretorioResultados);
    
    for (const escalonador of escalonadores) {
        const diretorioEscalonador = path.join(diretorioResultados, escalonador);
        const experimentos = await listarSubdiretorios(diretorioEscalonador);
        
        for (const experimento of experimentos) {
            const diretorioExperimento = path.join(diretorioEscalonador, experimento);
            const idsExecucoes = await listarSubdiretorios(diretorioExperimento);
            
            for (const id of idsExecucoes) {
                const diretorioExecucao = path.join(diretorioExperimento, id);
                const status = await lerJsonOpcional(path.join(diretorioExecucao, "status.json"));
                const resumo = await lerCsvOpcional(diretorioExecucao, "resumo.csv",normalizarResumo);
            
                execucoes.push({
                  id,
                  escalonador,
                  experimento,
                  status: status?.status ?? "sem_status",
                  iniciado_em: status?.iniciado_em ?? null,
                  atualizado_em: status?.atualizado_em ?? null,
                  resumo,
                });
            }
        }
    }
    
    return execucoes.sort((a,b) => b.id.localeCompare(a.id));
}

/** Retorna os detalhes de uma execução ou null caso ela não exista. */
async function obterDetalhesExecucao(
  diretorioResultados,
  escalonador,
  experimento,
  id,
) {
  const diretorioExecucao = path.join(
    diretorioResultados,
    escalonador,
    experimento,
    id,
  );

  try {
    const informacoes = await fs.stat(diretorioExecucao);

    if (!informacoes.isDirectory()) {
      return null;
    }
  } catch (erro) {
    if (erro.code === "ENOENT") {
      return null;
    }

    throw erro;
  }

  const [status, resumo, amostras] = await Promise.all([
    lerJsonOpcional(path.join(diretorioExecucao, "status.json")),
    lerCsvOpcional(diretorioExecucao,"resumo.csv",normalizarResumo),
    lerCsvOpcional(diretorioExecucao,"amostras.csv",normalizarAmostra),
  ]);

  return {
    id,
    escalonador,
    experimento,
    status: status?.status ?? "sem_status",
    iniciado_em: status?.iniciado_em ?? null,
    atualizado_em: status?.atualizado_em ?? null,
    resumo,
    amostras,
  };
}

module.exports = {
  listarExecucoes,
  obterDetalhesExecucao,
};
