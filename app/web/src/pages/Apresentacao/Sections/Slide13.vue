<script setup>
import { computed, reactive, ref } from "vue";
import {
  ArrowRight,
  Calculator,
  Cpu,
  RotateCcw,
  Scale,
  SkipBack,
  SkipForward,
} from "lucide-vue-next";

/** Pesos associados aos valores de nice no Linux. */
const pesosNice = [
  { nice: -20, peso: 88761 },
  { nice: -19, peso: 71755 },
  { nice: -18, peso: 56483 },
  { nice: -17, peso: 46273 },
  { nice: -16, peso: 36291 },
  { nice: -15, peso: 29154 },
  { nice: -14, peso: 23254 },
  { nice: -13, peso: 18705 },
  { nice: -12, peso: 14949 },
  { nice: -11, peso: 11916 },

  { nice: -10, peso: 9548 },
  { nice: -9, peso: 7620 },
  { nice: -8, peso: 6100 },
  { nice: -7, peso: 4904 },
  { nice: -6, peso: 3906 },
  { nice: -5, peso: 3121 },
  { nice: -4, peso: 2501 },
  { nice: -3, peso: 1991 },
  { nice: -2, peso: 1586 },
  { nice: -1, peso: 1277 },

  { nice: 0, peso: 1024 },
  { nice: 1, peso: 820 },
  { nice: 2, peso: 655 },
  { nice: 3, peso: 526 },
  { nice: 4, peso: 423 },
  { nice: 5, peso: 335 },
  { nice: 6, peso: 272 },
  { nice: 7, peso: 215 },
  { nice: 8, peso: 172 },
  { nice: 9, peso: 137 },

  { nice: 10, peso: 110 },
  { nice: 11, peso: 87 },
  { nice: 12, peso: 70 },
  { nice: 13, peso: 56 },
  { nice: 14, peso: 45 },
  { nice: 15, peso: 36 },
  { nice: 16, peso: 29 },
  { nice: 17, peso: 23 },
  { nice: 18, peso: 18 },
  { nice: 19, peso: 15 },
];

/** Processos utilizados na simulação. */
const processos = reactive([
  { nome: "A", nice: 0, cor: "#60a5fa" },
  { nome: "B", nice: 10, cor: "#f59e0b" },
  { nome: "C", nice: 0, cor: "#c084fc" },
]);

/** Retorna o peso correspondente a um valor de nice. */
function obterPeso(nice) {
  return pesosNice.find((item) => item.nice === nice).peso;
}

/** Cria o estado inicial da simulação. */
function criarEstadoInicial() {
  return {
    tempoTotal: 0,

    cpu: {
      A: 0,
      B: 0,
      C: 0,
    },

    vruntime: {
      A: 0,
      B: 0,
      C: 0,
    },

    ultimoPasso: null,
  };
}

/**
 * O histórico permite retornar aos passos anteriores
 * sem perder os valores já calculados.
 */
const historico = ref([criarEstadoInicial()]);

/** Índice do passo atualmente exibido. */
const passoAtual = ref(0);

/** Estado da simulação na posição selecionada. */
const estado = computed(() => historico.value[passoAtual.value]);

/** Soma dos pesos dos três processos. */
const somaPesos = computed(() =>
  processos.reduce((soma, processo) => soma + obterPeso(processo.nice), 0),
);

/** Dados de cada processo para exibição na tabela. */
const linhas = computed(() =>
  processos.map((processo) => {
    const peso = obterPeso(processo.nice);

    const parcelaIdeal = (peso / somaPesos.value) * 100;

    const tempoCpu = estado.value.cpu[processo.nome];

    const parcelaRecebida =
      estado.value.tempoTotal > 0
        ? (tempoCpu / estado.value.tempoTotal) * 100
        : null;

    return {
      ...processo,
      peso,
      parcelaIdeal,
      tempoCpu,
      parcelaRecebida,
      vruntime: estado.value.vruntime[processo.nome],
    };
  }),
);

/**
 * Seleciona o menor vruntime.
 *
 * Em caso de empate, mantém a ordem fixa A → B → C.
 * Essa regra existe apenas para a simulação didática.
 */
const proximaEscolha = computed(() => {
  const tolerancia = 0.000000001;

  return processos.reduce((escolhido, processo) => {
    const vruntimeEscolhido = estado.value.vruntime[escolhido.nome];
    const vruntimeProcesso = estado.value.vruntime[processo.nome];

    if (vruntimeProcesso < vruntimeEscolhido - tolerancia) {
      return processo;
    }

    return escolhido;
  });
});

/** Sequência de processos executados até o passo atual. */
const sequencia = computed(() =>
  historico.value
    .slice(1, passoAtual.value + 1)
    .map((item) => item.ultimoPasso.processo),
);

/** Indica se a simulação está no início. */
const primeiroPasso = computed(() => passoAtual.value === 0);

/** Formata números no padrão brasileiro. */
function formatarNumero(valor, casasDecimais = 2) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  });
}

/** Exibe o sinal positivo nos valores de nice maiores que zero. */
function formatarNice(valor) {
  return valor > 0 ? `+${valor}` : String(valor);
}

/** Retorna à etapa anterior. */
function passoAnterior() {
  if (!primeiroPasso.value) {
    passoAtual.value -= 1;
  }
}

/** Avança uma etapa de 1 ms simulado. */
function proximoPasso() {
  /**
   * Se o usuário retornou a um passo anterior,
   * reutiliza o próximo estado já calculado.
   */
  if (passoAtual.value < historico.value.length - 1) {
    passoAtual.value += 1;
    return;
  }

  const processo = proximaEscolha.value;

  const peso = obterPeso(processo.nice);

  const vruntimeAnterior = estado.value.vruntime[processo.nome];

  /** Cada etapa representa 1 ms de CPU no modelo didático. */
  const tempoCpuPasso = 1;

  const variacaoVruntime = tempoCpuPasso * (1024 / peso);

  const novoEstado = {
    tempoTotal: estado.value.tempoTotal + tempoCpuPasso,

    cpu: {
      ...estado.value.cpu,
      [processo.nome]:
        estado.value.cpu[processo.nome] + tempoCpuPasso,
    },

    vruntime: {
      ...estado.value.vruntime,
      [processo.nome]:
        vruntimeAnterior + variacaoVruntime,
    },

    ultimoPasso: {
      processo: processo.nome,
      peso,
      tempoCpu: tempoCpuPasso,
      vruntimeAnterior,
      variacaoVruntime,
      vruntimeNovo: vruntimeAnterior + variacaoVruntime,
    },
  };

  historico.value.push(novoEstado);
  passoAtual.value += 1;
}

/** Reinicia a simulação mantendo os valores de nice selecionados. */
function reiniciar() {
  historico.value = [criarEstadoInicial()];
  passoAtual.value = 0;
}

/** Reinicia o histórico quando um valor de nice é alterado. */
function alterarNice() {
  reiniciar();
}

/** Retorna a cor associada a um processo. */
function obterCor(nome) {
  return processos.find((processo) => processo.nome === nome).cor;
}
</script>

<template>
  <section class="slide-simulacao">
    <!-- Introdução -->
    <div class="introducao">
      <span class="categoria">SIMULAÇÃO DO CFS</span>

      <h1>Simulando o CFS</h1>

      <p class="pergunta">
        Como o peso influencia a escolha entre A, B e C?
      </p>
    </div>

    <!-- Contexto -->
    <div class="contexto">
      <div class="contexto__icone">
        <Cpu :size="20" />
      </div>

      <p>
        Os três processos permanecem <strong>prontos</strong> e disputam
        a mesma vCPU. A cada passo, a tarefa escolhida recebe
        <strong>1 ms de CPU simulado</strong>.
      </p>
    </div>

    <div class="conteudo">
      <!-- Tabela dos processos -->
      <article class="painel painel--processos">
        <div class="painel__cabecalho">
          <div class="painel__titulo">
            <div class="painel__icone painel__icone--verde">
              <Scale :size="19" />
            </div>

            <div>
              <span class="painel__categoria">PROCESSOS A, B E C</span>
              <h2>Pesos e tempos de execução</h2>
            </div>
          </div>

          <div class="tempo-total">
            <span>TEMPO SIMULADO</span>
            <strong>{{ estado.tempoTotal }} ms</strong>
          </div>
        </div>

        <div class="tabela-container">
          <table class="tabela">
            <thead>
              <tr>
                <th scope="col">Processo</th>
                <th scope="col">Nice</th>
                <th scope="col">Peso</th>
                <th scope="col">Parcela ideal</th>
                <th scope="col">CPU recebida</th>
                <th scope="col">Vruntime</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="linha in linhas"
                :key="linha.nome"
                :class="{
                  'linha--escolhida':
                    estado.ultimoPasso?.processo === linha.nome,
                }"
              >
                <td>
                  <div class="nome-processo">
                    <span
                      class="ponto"
                      :style="{ background: linha.cor }"
                    ></span>

                    <strong>{{ linha.nome }}</strong>
                  </div>
                </td>

                <td>
                  <select
                    v-model.number="
                      processos.find(
                        (processo) => processo.nome === linha.nome,
                      ).nice
                    "
                    :aria-label="`Nice do processo ${linha.nome}`"
                    @change="alterarNice"
                  >
                    <option
                      v-for="item in pesosNice"
                      :key="item.nice"
                      :value="item.nice"
                    >
                      {{ formatarNice(item.nice) }}
                    </option>
                  </select>
                </td>

                <td>{{ linha.peso }}</td>

                <td>
                  {{ formatarNumero(linha.parcelaIdeal, 1) }}%
                </td>

                <td>
                  {{ linha.tempoCpu }} ms

                  <span class="tabela__secundario">
                    {{
                      linha.parcelaRecebida === null
                        ? "—"
                        : `${formatarNumero(linha.parcelaRecebida, 1)}%`
                    }}
                  </span>
                </td>

                <td>
                  {{ formatarNumero(linha.vruntime, 2) }} ms
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Participação ideal -->
        <div class="participacao">
          <div class="participacao__cabecalho">
            <span class="painel__categoria">PARTICIPAÇÃO IDEAL</span>

            <small>
              Soma dos pesos: {{ somaPesos }}
            </small>
          </div>

          <div
            class="barra"
            role="img"
            :aria-label="
              linhas
                .map(
                  (linha) =>
                    `${linha.nome}: ${formatarNumero(linha.parcelaIdeal, 1)}%`,
                )
                .join(', ')
            "
          >
            <div
              v-for="linha in linhas"
              :key="linha.nome"
              class="barra__parte"
              :style="{
                width: `${linha.parcelaIdeal}%`,
                background: linha.cor,
              }"
            ></div>
          </div>

          <div class="legenda">
            <span
              v-for="linha in linhas"
              :key="linha.nome"
            >
              <i
                class="ponto"
                :style="{ background: linha.cor }"
              ></i>

              {{ linha.nome }}:
              {{ formatarNumero(linha.parcelaIdeal, 1) }}%
            </span>
          </div>
        </div>

        <!-- Sequência -->
        <div class="sequencia">
          <div class="sequencia__cabecalho">
            <span class="painel__categoria">SEQUÊNCIA DE EXECUÇÃO</span>

            <small>
              {{ estado.tempoTotal }} passo(s)
            </small>
          </div>

          <div
            v-if="sequencia.length"
            class="sequencia__itens"
            aria-label="Sequência de processos executados"
          >
            <span
              v-for="(nome, indice) in sequencia"
              :key="indice"
              class="sequencia__item"
              :style="{
                '--cor-processo': obterCor(nome),
              }"
              :title="`Passo ${indice + 1}: processo ${nome}`"
            >
              {{ nome }}
            </span>
          </div>

          <p v-else class="sequencia__vazia">
            Nenhum processo executou ainda.
          </p>
        </div>
      </article>

      <!-- Cálculos -->
      <article class="painel painel--calculos">
        <div class="painel__cabecalho">
          <div class="painel__titulo">
            <div class="painel__icone painel__icone--azul">
              <Calculator :size="19" />
            </div>

            <div>
              <span class="painel__categoria">ENTENDA A ESCOLHA</span>
              <h2>Cálculo do vruntime</h2>
            </div>
          </div>
        </div>

        <div class="formula">
          <span>FÓRMULA</span>

          <code>
            Δvruntime = tempo de CPU × 1024 / peso
          </code>
        </div>

        <div class="proxima-escolha">
          <span>PRÓXIMA ESCOLHA DO MODELO</span>

          <div>
            <strong
              class="proxima-escolha__processo"
              :style="{ color: proximaEscolha.cor }"
            >
              Processo {{ proximaEscolha.nome }}
            </strong>

            <span class="proxima-escolha__motivo">
              Menor vruntime, considerando a regra de empate
            </span>
          </div>
        </div>

        <div
          v-if="estado.ultimoPasso"
          class="ultimo-passo"
          aria-live="polite"
        >
          <span class="painel__categoria">ÚLTIMO PASSO</span>

          <p>
            O processo
            <strong
              :style="{
                color: obterCor(estado.ultimoPasso.processo),
              }"
            >
              {{ estado.ultimoPasso.processo }}
            </strong>
            recebeu {{ estado.ultimoPasso.tempoCpu }} ms de CPU.
          </p>

          <div class="conta">
            <code>
              {{ estado.ultimoPasso.tempoCpu }} × 1024 /
              {{ estado.ultimoPasso.peso }}
            </code>

            <ArrowRight :size="16" />

            <strong>
              +{{ formatarNumero(estado.ultimoPasso.variacaoVruntime, 2) }}
              ms
            </strong>
          </div>

          <p class="ultimo-passo__resultado">
            Vruntime:
            <strong>
              {{ formatarNumero(estado.ultimoPasso.vruntimeAnterior, 2) }}
            </strong>

            →

            <strong>
              {{ formatarNumero(estado.ultimoPasso.vruntimeNovo, 2) }}
              ms
            </strong>
          </p>
        </div>

        <div v-else class="ultimo-passo ultimo-passo--vazio">
          <span class="painel__categoria">ÚLTIMO PASSO</span>

          <p>
            Clique em <strong>Próximo</strong> para executar o primeiro passo.
          </p>
        </div>

        <div class="controles" aria-label="Controles da simulação">
          <button
            type="button"
            :disabled="primeiroPasso"
            @click="passoAnterior"
          >
            <SkipBack :size="15" />
            Anterior
          </button>

          <button
            type="button"
            class="botao--principal"
            @click="proximoPasso"
          >
            Próximo
            <SkipForward :size="15" />
          </button>

          <button
            type="button"
            @click="reiniciar"
          >
            <RotateCcw :size="15" />
            Reiniciar
          </button>
        </div>
      </article>
    </div>

    <!-- Limites do modelo -->
    <div class="observacao">
      <p>
        <strong>Modelo didático:</strong> todos começam com vruntime igual
        a zero e permanecem prontos. Em caso de empate, a simulação usa a
        ordem fixa A → B → C.
      </p>

      <p>
        O kernel real não precisa trocar de tarefa a cada 1 ms nem usar
        essa regra de desempate. Alterar um nice reinicia a simulação.
      </p>
    </div>
  </section>
</template>

<style scoped>
.slide-simulacao {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  color: var(--apresentacao-texto, #f8fafc);
}

.introducao {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.categoria,
.painel__categoria,
.formula > span,
.proxima-escolha > span,
.tempo-total span {
  color: var(--apresentacao-destaque, #1ed760);
  font-size: 0.7rem;
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

.contexto {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 13px;
  background: rgba(30, 215, 96, 0.06);
}

.contexto__icone,
.painel__icone {
  display: grid;
  flex-shrink: 0;
  width: 39px;
  height: 39px;
  place-items: center;
  border-radius: 11px;
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

.contexto p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.8rem;
  line-height: 1.5;
}

.contexto strong {
  color: #f8fafc;
}

.conteudo {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 0.8fr);
  gap: 15px;
}

.painel {
  min-width: 0;
  padding: 18px;
  border: 1px solid var(
    --apresentacao-borda,
    rgba(226, 232, 240, 0.12)
  );
  border-radius: 16px;
  background: var(--apresentacao-superficie, #101a14);
}

.painel__cabecalho,
.painel__titulo {
  display: flex;
  align-items: center;
}

.painel__cabecalho {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.painel__titulo {
  gap: 10px;
}

.painel h2 {
  margin: 4px 0 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.2;
}

.tempo-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  flex-shrink: 0;
}

.tempo-total span {
  font-size: 0.62rem;
}

.tempo-total strong {
  color: #f8fafc;
  font-size: 0.86rem;
}

.tabela-container {
  overflow-x: auto;
}

.tabela {
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
  text-align: left;
}

.tabela th {
  padding: 10px 8px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.12);
  color: #94a3b8;
  font-size: 0.67rem;
  font-weight: 700;
  white-space: nowrap;
}

.tabela td {
  padding: 10px 8px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.08);
  color: #cbd5e1;
  font-size: 0.75rem;
  white-space: nowrap;
}

.tabela tbody tr {
  transition: background 0.2s ease;
}

.tabela tbody tr.linha--escolhida {
  background: rgba(255, 255, 255, 0.04);
}

.nome-processo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nome-processo strong {
  color: #f8fafc;
}

.ponto {
  display: inline-block;
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
}

.tabela select {
  min-width: 62px;
  padding: 6px 7px;
  border: 1px solid rgba(226, 232, 240, 0.16);
  border-radius: 8px;
  color: #f8fafc;
  background: #101a14;
  font: inherit;
  cursor: pointer;
}

.tabela__secundario {
  display: block;
  margin-top: 3px;
  color: #8293a7;
  font-size: 0.66rem;
}

.participacao,
.sequencia {
  margin-top: 17px;
}

.participacao__cabecalho,
.sequencia__cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.participacao__cabecalho small,
.sequencia__cabecalho small {
  color: #94a3b8;
  font-size: 0.68rem;
}

.barra {
  display: flex;
  height: 11px;
  overflow: hidden;
  margin-top: 10px;
  border-radius: 99px;
  background: rgba(148, 163, 184, 0.12);
}

.barra__parte {
  min-width: 1px;
}

.legenda {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 9px;
}

.legenda span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 0.7rem;
}

.sequencia__itens {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  max-height: 72px;
  overflow-y: auto;
  margin-top: 10px;
}

.sequencia__item {
  display: grid;
  width: 27px;
  height: 27px;
  place-items: center;
  border: 1px solid var(--cor-processo);
  border-radius: 7px;
  color: var(--cor-processo);
  background: rgba(255, 255, 255, 0.025);
  font-size: 0.68rem;
  font-weight: 800;
}

.sequencia__vazia {
  margin: 10px 0 0;
  color: #8293a7;
  font-size: 0.73rem;
}

.formula,
.proxima-escolha,
.ultimo-passo {
  padding: 12px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.15);
}

.formula {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formula code,
.conta code {
  color: #d1fae5;
  font-family: monospace;
  font-size: 0.75rem;
  line-height: 1.5;
}

.proxima-escolha {
  margin-top: 10px;
  border-color: rgba(30, 215, 96, 0.2);
  background: rgba(30, 215, 96, 0.05);
}

.proxima-escolha > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 8px;
}

.proxima-escolha__processo {
  font-size: 0.93rem;
}

.proxima-escolha__motivo {
  color: #94a3b8;
  font-size: 0.71rem;
  line-height: 1.4;
}

.ultimo-passo {
  min-height: 155px;
  margin-top: 10px;
}

.ultimo-passo p {
  margin: 9px 0 0;
  color: #aab9c9;
  font-size: 0.75rem;
  line-height: 1.45;
}

.ultimo-passo p strong {
  color: #f8fafc;
}

.ultimo-passo--vazio {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.conta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  color: #1ed760;
}

.conta strong {
  color: #f8fafc;
  font-size: 0.76rem;
}

.ultimo-passo__resultado {
  padding-top: 8px;
  border-top: 1px solid rgba(226, 232, 240, 0.08);
}

.controles {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 13px;
}

.controles button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 37px;
  padding: 8px 10px;
  border: 1px solid rgba(226, 232, 240, 0.16);
  border-radius: 9px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.025);
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
}

.controles .botao--principal {
  border-color: rgba(30, 215, 96, 0.4);
  color: #86efac;
  background: rgba(30, 215, 96, 0.1);
}

.controles button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

button:focus-visible,
select:focus-visible {
  outline: 2px solid #f8fafc;
  outline-offset: 3px;
}

.observacao {
  padding: 11px 14px;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
}

.observacao p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.71rem;
  line-height: 1.5;
}

.observacao p + p {
  margin-top: 4px;
}

.observacao strong {
  color: #cbd5e1;
}

@media (max-width: 1050px) {
  .conteudo {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .slide-simulacao {
    gap: 14px;
  }

  h1 {
    font-size: 2.1rem;
  }

  .contexto {
    align-items: flex-start;
  }

  .painel {
    padding: 15px;
  }

  .painel__cabecalho {
    align-items: flex-start;
    flex-direction: column;
  }

  .tempo-total {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>