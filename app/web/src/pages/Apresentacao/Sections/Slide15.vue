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

/** Fatias hipotéticas disponíveis na simulação. */
const fatiasDisponiveis = [1, 2, 4];

/** Configuração inicial dos processos. */
const processos = reactive([
  { nome: "A", nice: 0, fatia: 1, cor: "#60a5fa" },
  { nome: "B", nice: 10, fatia: 1, cor: "#f59e0b" },
  { nome: "C", nice: 0, fatia: 1, cor: "#c084fc" },
]);

/** Retorna o peso associado ao nice informado. */
function obterPeso(nice) {
  return pesosNice.find((item) => item.nice === nice).peso;
}

/** Calcula a fatia virtual de um processo. */
function calcularFatiaVirtual(processo) {
  return processo.fatia * (1024 / obterPeso(processo.nice));
}

/**
 * Cria o estado inicial.
 *
 * Todos começam com vruntime igual a zero.
 * O prazo inicial é vruntime + fatia virtual.
 */
function criarEstadoInicial() {
  const dados = {};

  for (const processo of processos) {
    dados[processo.nome] = {
      cpu: 0,
      vruntime: 0,
      prazo: calcularFatiaVirtual(processo),
      restante: processo.fatia,
    };
  }

  return {
    tempoTotal: 0,
    dados,
    ultimoPasso: null,
  };
}

/** Histórico de estados para permitir voltar e avançar. */
const historico = ref([criarEstadoInicial()]);
const passoAtual = ref(0);

const estado = computed(() => historico.value[passoAtual.value]);

const primeiroPasso = computed(() => passoAtual.value === 0);

const somaPesos = computed(() =>
  processos.reduce((soma, processo) => soma + obterPeso(processo.nice), 0),
);

/**
 * Calcula serviço ideal e saldo didático considerando todos os
 * processos sempre prontos durante o tempo simulado.
 */
const linhas = computed(() =>
  processos.map((processo) => {
    const peso = obterPeso(processo.nice);
    const dados = estado.value.dados[processo.nome];

    const parcelaIdeal = peso / somaPesos.value;
    const servicoIdeal = estado.value.tempoTotal * parcelaIdeal;
    const lag = servicoIdeal - dados.cpu;

    return {
      ...processo,
      peso,
      parcelaIdeal,
      servicoIdeal,
      lag,
      elegivel: lag >= -0.000000001,
      fatiaVirtual: calcularFatiaVirtual(processo),
      ...dados,
    };
  }),
);

/**
 * Entre os processos elegíveis, escolhe o menor prazo virtual.
 *
 * Em caso de empate, mantém a ordem A → B → C.
 */
const proximaEscolha = computed(() => {
  const elegiveis = linhas.value.filter((linha) => linha.elegivel);
  const tolerancia = 0.000000001;

  if (!elegiveis.length) {
    return null;
  }

  return elegiveis.reduce((escolhido, processo) => {
    if (processo.prazo < escolhido.prazo - tolerancia) {
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

function formatarNumero(valor, casas = 2) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function formatarSaldo(valor) {
  const numero = formatarNumero(valor, 2);

  return valor > 0.000000001 ? `+${numero}` : numero;
}

function formatarNice(valor) {
  return valor > 0 ? `+${valor}` : String(valor);
}

function obterCor(nome) {
  return processos.find((processo) => processo.nome === nome).cor;
}

/** Retorna um passo. */
function passoAnterior() {
  if (!primeiroPasso.value) {
    passoAtual.value -= 1;
  }
}

/** Avança um passo de 1 ms de CPU simulado. */
function proximoPasso() {
  if (passoAtual.value < historico.value.length - 1) {
    passoAtual.value += 1;
    return;
  }

  const escolhido = proximaEscolha.value;

  if (!escolhido) {
    return;
  }

  const configuracao = processos.find(
    (processo) => processo.nome === escolhido.nome,
  );

  const tempoCpuPasso = 1;
  const peso = escolhido.peso;

  const variacaoVruntime = tempoCpuPasso * (1024 / peso);
  const vruntimeNovo = escolhido.vruntime + variacaoVruntime;

  const restanteDepois = escolhido.restante - tempoCpuPasso;
  const fatiaConcluida = restanteDepois <= 0;

  /**
   * Neste modelo, o prazo é renovado apenas quando a fatia
   * solicitada termina.
   */
  const novoPrazo = fatiaConcluida
    ? vruntimeNovo + escolhido.fatiaVirtual
    : escolhido.prazo;

  const novoRestante = fatiaConcluida
    ? configuracao.fatia
    : restanteDepois;

  const novosDados = {
    ...estado.value.dados,

    [escolhido.nome]: {
      cpu: escolhido.cpu + tempoCpuPasso,
      vruntime: vruntimeNovo,
      prazo: novoPrazo,
      restante: novoRestante,
    },
  };

  const novoEstado = {
    tempoTotal: estado.value.tempoTotal + tempoCpuPasso,
    dados: novosDados,

    ultimoPasso: {
      processo: escolhido.nome,
      peso,
      lagAntes: escolhido.lag,
      prazoUsado: escolhido.prazo,
      fatiaVirtual: escolhido.fatiaVirtual,
      vruntimeAnterior: escolhido.vruntime,
      variacaoVruntime,
      vruntimeNovo,
      fatiaConcluida,
      novoPrazo,
    },
  };

  historico.value.push(novoEstado);
  passoAtual.value += 1;
}

/** Reinicia mantendo os valores de nice e fatia selecionados. */
function reiniciar() {
  historico.value = [criarEstadoInicial()];
  passoAtual.value = 0;
}

/** Alterações de configuração reiniciam o histórico. */
function alterarConfiguracao() {
  reiniciar();
}
</script>

<template>
  <section class="slide-simulacao">
    <div class="introducao">
      <span class="categoria">SIMULAÇÃO DO EEVDF</span>

      <h1>Simulando o EEVDF</h1>

      <p class="pergunta">
        Entre A, B e C, quem está elegível e possui o menor prazo virtual?
      </p>
    </div>

    <div class="contexto">
      <div class="contexto__icone">
        <Cpu :size="20" />
      </div>

      <p>
        Os três processos permanecem prontos e disputam a mesma vCPU.
        Cada passo representa <strong>1 ms de CPU simulado</strong>.
      </p>
    </div>

    <div class="conteudo">
      <!-- Tabela -->
      <article class="painel painel--tabela">
        <div class="painel__cabecalho">
          <div class="painel__titulo">
            <div class="painel__icone painel__icone--verde">
              <Scale :size="19" />
            </div>

            <div>
              <span class="painel__categoria">PROCESSOS A, B E C</span>
              <h2>Elegibilidade e prazo virtual</h2>
            </div>
          </div>

          <div class="tempo-total">
            <span>TEMPO SIMULADO</span>
            <strong>{{ estado.tempoTotal }} ms</strong>
          </div>
        </div>

        <div class="tabela-container">
          <table>
            <thead>
              <tr>
                <th scope="col">Processo</th>
                <th scope="col">Nice</th>
                <th scope="col">Peso</th>
                <th scope="col">Fatia</th>
                <th scope="col">Ideal</th>
                <th scope="col">CPU</th>
                <th scope="col">Vruntime</th>
                <th scope="col">Saldo</th>
                <th scope="col">Elegível</th>
                <th scope="col">Prazo</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(linha, indice) in linhas"
                :key="linha.nome"
                :class="{
                  'linha--escolhida':
                    estado.ultimoPasso?.processo === linha.nome,
                }"
              >
                <td>
                  <span class="processo">
                    <i
                      class="ponto"
                      :style="{ background: linha.cor }"
                    ></i>

                    <strong>{{ linha.nome }}</strong>
                  </span>
                </td>

                <td>
                  <select
                    v-model.number="processos[indice].nice"
                    :aria-label="`Nice do processo ${linha.nome}`"
                    @change="alterarConfiguracao"
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
                  <select
                    v-model.number="processos[indice].fatia"
                    :aria-label="`Fatia do processo ${linha.nome}`"
                    @change="alterarConfiguracao"
                  >
                    <option
                      v-for="fatia in fatiasDisponiveis"
                      :key="fatia"
                      :value="fatia"
                    >
                      {{ fatia }} ms
                    </option>
                  </select>
                </td>

                <td>{{ formatarNumero(linha.servicoIdeal) }} ms</td>
                <td>{{ linha.cpu }} ms</td>
                <td>{{ formatarNumero(linha.vruntime) }}</td>

                <td
                  :class="{
                    'saldo--positivo': linha.lag >= -0.000000001,
                    'saldo--negativo': linha.lag < -0.000000001,
                  }"
                >
                  {{ formatarSaldo(linha.lag) }}
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

                <td>{{ formatarNumero(linha.prazo) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Participação ideal -->
        <div class="participacao">
          <div class="participacao__cabecalho">
            <span class="painel__categoria">PARTICIPAÇÃO IDEAL</span>
            <small>Soma dos pesos: {{ somaPesos }}</small>
          </div>

          <div
            class="barra"
            role="img"
            :aria-label="
              linhas
                .map(
                  (linha) =>
                    `${linha.nome}: ${formatarNumero(linha.parcelaIdeal * 100, 1)}%`,
                )
                .join(', ')
            "
          >
            <div
              v-for="linha in linhas"
              :key="linha.nome"
              :style="{
                width: `${linha.parcelaIdeal * 100}%`,
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
              {{ formatarNumero(linha.parcelaIdeal * 100, 1) }}%
            </span>
          </div>
        </div>

        <!-- Sequência -->
        <div class="sequencia">
          <div class="participacao__cabecalho">
            <span class="painel__categoria">SEQUÊNCIA DE EXECUÇÃO</span>
            <small>{{ estado.tempoTotal }} passo(s)</small>
          </div>

          <div
            v-if="sequencia.length"
            class="sequencia__itens"
          >
            <span
              v-for="(nome, indice) in sequencia"
              :key="indice"
              class="sequencia__item"
              :style="{ '--cor-processo': obterCor(nome) }"
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

      <!-- Explicação da escolha -->
      <article class="painel painel--calculos">
        <div class="painel__cabecalho">
          <div class="painel__titulo">
            <div class="painel__icone painel__icone--azul">
              <Calculator :size="19" />
            </div>

            <div>
              <span class="painel__categoria">ENTENDA A ESCOLHA</span>
              <h2>Saldo e prazo</h2>
            </div>
          </div>
        </div>

        <div class="formula">
          <span>FÓRMULAS DO MODELO</span>

          <code>saldo = serviço ideal − CPU recebida</code>

          <code>fatia virtual = fatia × 1024 / peso</code>

          <code>prazo = vruntime ao definir + fatia virtual</code>
        </div>

        <div class="proxima-escolha">
          <span>PRÓXIMA ESCOLHA</span>

          <template v-if="proximaEscolha">
            <strong :style="{ color: proximaEscolha.cor }">
              Processo {{ proximaEscolha.nome }}
            </strong>

            <p>
              Elegível e com o menor prazo virtual neste modelo.
            </p>
          </template>

          <p v-else>
            Nenhum processo elegível foi encontrado.
          </p>
        </div>

        <div
          v-if="estado.ultimoPasso"
          class="ultimo-passo"
          aria-live="polite"
        >
          <span class="painel__categoria">ÚLTIMO PASSO</span>

          <p>
            Processo
            <strong :style="{ color: obterCor(estado.ultimoPasso.processo) }">
              {{ estado.ultimoPasso.processo }}
            </strong>

            · saldo antes:
            <strong>{{ formatarSaldo(estado.ultimoPasso.lagAntes) }} ms</strong>
          </p>

          <p>
            Prazo utilizado:
            <strong>{{ formatarNumero(estado.ultimoPasso.prazoUsado) }}</strong>
          </p>

          <div class="conta">
            <code>
              1 × 1024 / {{ estado.ultimoPasso.peso }}
            </code>

            <ArrowRight :size="15" />

            <strong>
              +{{ formatarNumero(estado.ultimoPasso.variacaoVruntime) }}
              ms virtuais
            </strong>
          </div>

          <p>
            Vruntime:
            {{ formatarNumero(estado.ultimoPasso.vruntimeAnterior) }}
            →
            <strong>
              {{ formatarNumero(estado.ultimoPasso.vruntimeNovo) }}
            </strong>
          </p>

          <p v-if="estado.ultimoPasso.fatiaConcluida">
            Fatia concluída: prazo renovado para
            <strong>{{ formatarNumero(estado.ultimoPasso.novoPrazo) }}</strong>.
          </p>

          <p v-else>
            Fatia ainda não concluída: o prazo permanece o mesmo.
          </p>
        </div>

        <div v-else class="ultimo-passo ultimo-passo--vazio">
          <span class="painel__categoria">ÚLTIMO PASSO</span>

          <p>
            Clique em <strong>Próximo</strong> para iniciar a simulação.
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
            :disabled="!proximaEscolha"
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

    <div class="observacao">
      <p>
        <strong>Modelo didático:</strong> todos começam com vruntime zero,
        permanecem prontos e disputam uma única vCPU.
      </p>

      <p>
        O saldo é calculado como serviço ideal menos CPU recebida. As fatias
        são hipotéticas; o prazo é renovado ao concluir a fatia neste modelo.
      </p>

      <p>
        O kernel real não precisa decidir a cada 1 ms nem usar a ordem fixa
        A → B → C para desempates. Alterar nice ou fatia reinicia a simulação.
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
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.8fr);
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

table {
  width: 100%;
  min-width: 830px;
  border-collapse: collapse;
  text-align: left;
}

th,
td {
  padding: 9px 7px;
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

tr.linha--escolhida {
  background: rgba(255, 255, 255, 0.04);
}

.processo {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.processo strong {
  color: #f8fafc;
}

.ponto {
  display: inline-block;
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
}

select {
  min-width: 55px;
  padding: 6px;
  border: 1px solid rgba(226, 232, 240, 0.16);
  border-radius: 8px;
  color: #f8fafc;
  background: #101a14;
  font: inherit;
  cursor: pointer;
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
  font-size: 0.66rem;
}

.elegibilidade--sim {
  color: #86efac;
  background: rgba(30, 215, 96, 0.1);
}

.participacao,
.sequencia {
  margin-top: 16px;
}

.participacao__cabecalho {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.participacao__cabecalho small {
  color: #94a3b8;
  font-size: 0.68rem;
}

.barra {
  display: flex;
  height: 10px;
  overflow: hidden;
  margin-top: 10px;
  border-radius: 99px;
  background: rgba(148, 163, 184, 0.12);
}

.barra > div {
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
  max-height: 65px;
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
  gap: 7px;
}

.formula code,
.conta code {
  color: #d1fae5;
  font-family: monospace;
  font-size: 0.7rem;
  line-height: 1.45;
}

.proxima-escolha {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  border-color: rgba(30, 215, 96, 0.2);
  background: rgba(30, 215, 96, 0.05);
}

.proxima-escolha strong {
  font-size: 0.9rem;
}

.proxima-escolha p,
.ultimo-passo p {
  margin: 0;
  color: #aab9c9;
  font-size: 0.72rem;
  line-height: 1.45;
}

.ultimo-passo {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-height: 150px;
  margin-top: 10px;
}

.ultimo-passo strong {
  color: #f8fafc;
}

.ultimo-passo--vazio {
  justify-content: center;
}

.conta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  color: #1ed760;
}

.conta strong {
  font-size: 0.7rem;
}

.controles {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
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
  font-size: 0.7rem;
  line-height: 1.5;
}

.observacao p + p {
  margin-top: 4px;
}

.observacao strong {
  color: #cbd5e1;
}

@media (max-width: 1100px) {
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
</style>