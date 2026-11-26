<script setup>
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock3,
  Scale,
} from "lucide-vue-next";

/** Dados hipotéticos usados no exemplo. */
const processos = [
  {
    nome: "A",
    nice: 0,
    peso: 1024,
    cpuRecebida: 4,
    cor: "#60a5fa",
  },
  {
    nome: "B",
    nice: 10,
    peso: 110,
    cpuRecebida: 0,
    cor: "#f59e0b",
  },
  {
    nome: "C",
    nice: 0,
    peso: 1024,
    cpuRecebida: 6,
    cor: "#c084fc",
  },
];

/** Tempo de CPU disponível no cenário hipotético. */
const tempoDisponivel = 10;

/** Soma dos pesos das tarefas que disputam a vCPU. */
const somaPesos = processos.reduce(
  (soma, processo) => soma + processo.peso,
  0,
);

/** Calcula parcela ideal, serviço ideal e saldo de cada processo. */
const linhas = processos.map((processo) => {
  const parcelaIdeal = processo.peso / somaPesos;
  const servicoIdeal = tempoDisponivel * parcelaIdeal;
  const saldo = servicoIdeal - processo.cpuRecebida;

  return {
    ...processo,
    parcelaIdeal,
    servicoIdeal,
    saldo,
    elegivel: saldo >= 0,
  };
});

/** Formata números no padrão brasileiro. */
function formatarNumero(valor, casas = 2) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

/** Adiciona o sinal positivo aos saldos maiores que zero. */
function formatarSaldo(valor) {
  const numero = formatarNumero(valor, 2);

  return valor > 0 ? `+${numero}` : numero;
}

/** Exibe o sinal positivo nos valores de nice maiores que zero. */
function formatarNice(valor) {
  return valor > 0 ? `+${valor}` : String(valor);
}
</script>

<template>
  <section class="slide-eevdf">
    <!-- Introdução -->
    <div class="introducao">
      <span class="categoria">ESCALONADOR EEVDF</span>

      <h1>Como funciona o EEVDF?</h1>

      <p class="pergunta">
        Como o EEVDF decide qual tarefa elegível deve executar?
      </p>
    </div>

    <!-- Contexto -->
    <div class="contexto">
      <div class="contexto__icone">
        <Scale :size="20" />
      </div>

      <p>
        O EEVDF considera a <strong>participação justa</strong> das tarefas
        e escolhe entre as elegíveis usando seus
        <strong>prazos virtuais</strong>.
      </p>
    </div>

    <div class="conteudo">
      <!-- Parcela e serviço ideal -->
      <article class="painel painel--parcela">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--verde">
            <Calculator :size="19" />
          </div>

          <div>
            <span class="painel__categoria">1 · PARCELA E SERVIÇO IDEAL</span>
            <h2>Quanto cada tarefa deveria receber?</h2>
          </div>
        </div>

        <p class="descricao">
          A, B e C permanecem prontos durante
          <strong>{{ tempoDisponivel }} ms</strong> de CPU disponível.
        </p>

        <div class="formulas">
          <div class="formula">
            parcela ideal = peso / soma dos pesos
          </div>

          <div class="formula">
            serviço ideal = tempo disponível × parcela ideal
          </div>
        </div>

        <div class="soma-pesos">
          <span>SOMA DOS PESOS</span>

          <strong>
            1024 + 110 + 1024 = {{ somaPesos }}
          </strong>
        </div>

        <div class="calculos">
          <div
            v-for="linha in linhas"
            :key="linha.nome"
            class="calculo"
            :style="{ '--cor-processo': linha.cor }"
          >
            <div class="calculo__processo">
              <span>{{ linha.nome }}</span>

              <div>
                <strong>Processo {{ linha.nome }}</strong>
                <small>
                  Nice {{ formatarNice(linha.nice) }} · peso {{ linha.peso }}
                </small>
              </div>
            </div>

            <div class="calculo__operacoes">
              <div>
                <span>Parcela ideal</span>

                <code>
                  {{ linha.peso }} / {{ somaPesos }}
                  ≈ {{ formatarNumero(linha.parcelaIdeal * 100) }}%
                </code>
              </div>

              <div>
                <span>Serviço ideal</span>

                <code>
                  {{ tempoDisponivel }} × ({{ linha.peso }} / {{ somaPesos }})
                  ≈ {{ formatarNumero(linha.servicoIdeal) }} ms
                </code>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- Saldo e prazo -->
      <div class="coluna-direita">
        <article class="painel painel--saldo">
          <div class="painel__cabecalho">
            <div class="painel__icone painel__icone--azul">
              <CheckCircle2 :size="19" />
            </div>

            <div>
              <span class="painel__categoria">2 · SALDO E ELEGIBILIDADE</span>
              <h2>Quem pode disputar a CPU?</h2>
            </div>
          </div>

          <div class="formula formula--compacta">
            saldo = serviço ideal − CPU recebida
          </div>

          <p class="descricao descricao--compacta">
            Neste retrato hipotético, A recebeu 4 ms, B recebeu 0 ms
            e C recebeu 6 ms.
          </p>

          <div class="tabela-container">
            <table>
              <thead>
                <tr>
                  <th scope="col">Processo</th>
                  <th scope="col">Ideal</th>
                  <th scope="col">Recebido</th>
                  <th scope="col">Saldo</th>
                  <th scope="col">Elegível</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="linha in linhas"
                  :key="linha.nome"
                >
                  <td>
                    <span class="nome-processo">
                      <i
                        class="ponto"
                        :style="{ background: linha.cor }"
                      ></i>

                      <strong>{{ linha.nome }}</strong>
                    </span>
                  </td>

                  <td>{{ formatarNumero(linha.servicoIdeal) }} ms</td>
                  <td>{{ linha.cpuRecebida }} ms</td>

                  <td
                    :class="{
                      'saldo--positivo': linha.saldo >= 0,
                      'saldo--negativo': linha.saldo < 0,
                    }"
                  >
                    {{ formatarSaldo(linha.saldo) }} ms
                  </td>

                  <td>
                    <span
                      class="elegibilidade"
                      :class="{
                        'elegibilidade--sim': linha.elegivel,
                      }"
                    >
                      {{ linha.elegivel ? "Sim" : "Não" }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="nota">
            A e B possuem saldo positivo. C recebeu mais CPU que seu
            serviço ideal neste exemplo.
          </p>
        </article>

        <article class="painel painel--prazo">
          <div class="painel__cabecalho">
            <div class="painel__icone painel__icone--roxo">
              <Clock3 :size="19" />
            </div>

            <div>
              <span class="painel__categoria">3 · PRAZO VIRTUAL</span>
              <h2>Quem vem primeiro?</h2>
            </div>
          </div>

          <p class="descricao descricao--compacta">
            Entre as tarefas elegíveis, o EEVDF favorece a que possui
            o menor prazo virtual.
          </p>

          <div class="formulas-prazo">
            <div class="formula">
              fatia virtual ≈ fatia de CPU × 1024 / peso
            </div>

            <div class="formula">
              prazo = vruntime ao definir + fatia virtual
            </div>
          </div>

          <div class="escolha">
            <span>Tarefas elegíveis</span>

            <ArrowRight :size="16" />

            <strong>Menor prazo virtual</strong>
          </div>

          <p class="nota">
            O prazo é definido ou renovado em momentos específicos; ele
            não precisa mudar a cada atualização do vruntime.
          </p>
        </article>
      </div>
    </div>

    <!-- Mensagem principal -->
    <div class="mensagem">
      <Scale :size="18" />

      <p>
        A parcela define o <strong>serviço ideal</strong>; o saldo ajuda a
        determinar a <strong>elegibilidade</strong>; o prazo virtual
        orienta a <strong>escolha</strong>.
      </p>
    </div>

    <p class="nota-geral">
      Cenário ilustrativo: valores arredondados. O saldo apresentado é
      serviço ideal menos CPU recebida; o kernel usa contabilidade virtual.
    </p>
  </section>
</template>

<style scoped>
.slide-eevdf {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 14px;
  color: var(--apresentacao-texto, #f8fafc);
}

.introducao {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.categoria,
.painel__categoria,
.soma-pesos span {
  color: var(--apresentacao-destaque, #1ed760);
  font-size: 0.69rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

h1 {
  margin: 0;
  font-size: clamp(2.1rem, 3.5vw, 3.8rem);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 1.08;
}

.pergunta {
  margin: 0;
  color: #cbd5e1;
  font-size: clamp(0.95rem, 1.2vw, 1.1rem);
  line-height: 1.5;
}

.contexto,
.mensagem {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 13px;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 12px;
  background: rgba(30, 215, 96, 0.06);
}

.contexto__icone,
.painel__icone {
  display: grid;
  flex-shrink: 0;
  width: 37px;
  height: 37px;
  place-items: center;
  border-radius: 10px;
}

.contexto__icone,
.painel__icone--verde {
  color: #1ed760;
  background: rgba(30, 215, 96, 0.12);
}

.painel__icone--azul {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

.painel__icone--roxo {
  color: #c084fc;
  background: rgba(192, 132, 252, 0.12);
}

.contexto p,
.mensagem p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.78rem;
  line-height: 1.45;
}

.contexto strong,
.mensagem strong {
  color: #f8fafc;
}

.conteudo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
}

.coluna-direita {
  display: grid;
  grid-template-rows: auto auto;
  gap: 14px;
  min-width: 0;
}

.painel {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(
    --apresentacao-borda,
    rgba(226, 232, 240, 0.12)
  );
  border-radius: 15px;
  background: var(--apresentacao-superficie, #101a14);
}

.painel__cabecalho {
  display: flex;
  align-items: center;
  gap: 10px;
}

h2 {
  margin: 4px 0 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.2;
}

.descricao {
  margin: 11px 0;
  color: #aab9c9;
  font-size: 0.74rem;
  line-height: 1.45;
}

.descricao--compacta {
  margin: 9px 0;
}

.descricao strong {
  color: #f8fafc;
}

.formulas,
.formulas-prazo {
  display: grid;
  gap: 6px;
}

.formula {
  padding: 8px 9px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 8px;
  color: #d1fae5;
  background: rgba(0, 0, 0, 0.16);
  font-family: monospace;
  font-size: 0.7rem;
  line-height: 1.4;
}

.formula--compacta {
  margin-top: 11px;
}

.soma-pesos {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 12px 0 9px;
}

.soma-pesos span {
  font-size: 0.62rem;
}

.soma-pesos strong {
  color: #e2e8f0;
  font-family: monospace;
  font-size: 0.76rem;
}

.calculos {
  display: grid;
  gap: 8px;
}

.calculo {
  display: grid;
  grid-template-columns: minmax(105px, 0.75fr) minmax(0, 1.5fr);
  gap: 10px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-left: 3px solid var(--cor-processo);
  border-radius: 9px;
  background: rgba(0, 0, 0, 0.13);
}

.calculo__processo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.calculo__processo > span {
  display: grid;
  flex-shrink: 0;
  width: 27px;
  height: 27px;
  place-items: center;
  border: 1px solid var(--cor-processo);
  border-radius: 8px;
  color: var(--cor-processo);
  font-size: 0.72rem;
  font-weight: 800;
}

.calculo__processo > div,
.calculo__operacoes > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.calculo__processo strong {
  color: #f8fafc;
  font-size: 0.73rem;
}

.calculo__processo small,
.calculo__operacoes span {
  color: #94a3b8;
  font-size: 0.65rem;
  line-height: 1.35;
}

.calculo__operacoes {
  display: grid;
  gap: 6px;
}

.calculo__operacoes code {
  color: #dbeafe;
  font-family: monospace;
  font-size: 0.68rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.tabela-container {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 420px;
  border-collapse: collapse;
  text-align: left;
}

th,
td {
  padding: 8px 6px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.08);
  font-size: 0.7rem;
  white-space: nowrap;
}

th {
  color: #94a3b8;
  font-weight: 700;
}

td {
  color: #cbd5e1;
}

.nome-processo {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.nome-processo strong {
  color: #f8fafc;
}

.ponto {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.saldo--positivo {
  color: #86efac;
}

.saldo--negativo {
  color: #fca5a5;
}

.elegibilidade {
  display: inline-block;
  padding: 4px 6px;
  border-radius: 6px;
  color: #fca5a5;
  background: rgba(248, 113, 113, 0.1);
  font-size: 0.65rem;
}

.elegibilidade--sim {
  color: #86efac;
  background: rgba(30, 215, 96, 0.1);
}

.nota {
  margin: 9px 0 0;
  color: #94a3b8;
  font-size: 0.68rem;
  line-height: 1.45;
}

.escolha {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 9px;
  padding: 9px;
  border: 1px solid rgba(30, 215, 96, 0.18);
  border-radius: 9px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.05);
  font-size: 0.72rem;
}

.escolha span,
.escolha strong {
  color: #e2e8f0;
}

.mensagem {
  color: #1ed760;
}

.mensagem svg {
  flex-shrink: 0;
}

.nota-geral {
  margin: -5px 0 0;
  color: #8293a7;
  font-size: 0.68rem;
  line-height: 1.4;
}

@media (max-width: 1000px) {
  .conteudo {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  h1 {
    font-size: 2.1rem;
  }

  .contexto {
    align-items: flex-start;
  }

  .painel {
    padding: 14px;
  }

  .calculo {
    grid-template-columns: 1fr;
  }
}
</style>