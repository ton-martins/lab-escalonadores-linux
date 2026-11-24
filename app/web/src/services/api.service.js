/** Endereço-base da API HTTP. */
import { API_BASE_URL } from "../config/ambiente";

/** Executa uma requisição HTTP para a API. */
async function requisitar(caminho) {
  const resposta = await fetch(`${API_BASE_URL}${caminho}`);

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.erro ?? "Não foi possível consultar a API.",
    );
  }

  return dados;
}

/** Consulta o estado atual da API. */
export function obterHealth() {
  return requisitar("/health");
}

/** Lista todas as execuções disponíveis. */
export function listarExecucoes() {
  return requisitar("/execucoes");
}

/** Consulta os detalhes de uma execução específica. */
export function obterDetalhesExecucao({
  escalonador,
  experimento,
  id,
}) {
  return requisitar(
    `/execucoes/${encodeURIComponent(escalonador)}/${encodeURIComponent(experimento)}/${encodeURIComponent(id)}`,
  );
}