<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import {
  Cpu,
  Info,
  Layers,
  Pause,
  Play,
  RotateCcw,
  StepBack,
  StepForward,
} from "lucide-vue-next";

/** Etapas ilustrativas de um milissegundo cada. */
const etapas = [
  {
    inicio: 0,
    fim: 1,
    descricao:
      "Com uma vCPU, A executa. Com duas vCPUs disponíveis, A e B podem executar simultaneamente.",
  },
  {
    inicio: 1,
    fim: 2,
    descricao:
      "Na primeira situação, B recebe a vCPU. Na segunda, A e B concluem seus 2 ms de trabalho.",
  },
  {
    inicio: 2,
    fim: 3,
    descricao:
      "Com uma vCPU, A volta a executar. No segundo exemplo, A e B já terminaram.",
  },
  {
    inicio: 3,
    fim: 4,
    descricao:
      "B conclui sua execução na vCPU única. Os dois cenários finalizaram o trabalho.",
  },
];

/** Linhas de tempo dos dois cenários. */
const cenarios = [
  {
    id: "concorrencia",
    categoria: "UMA vCPU",
    titulo: "Concorrência",
    subtitulo: "As tarefas se alternam",
    linhas: [
      {
        nome: "vCPU 0",
        intervalos: ["A", "B", "A", "B"],
      },
    ],
    explicacao:
      "A e B compartilham uma vCPU. Apenas uma das tarefas executa em cada instante.",
  },
  {
    id: "paralelismo",
    categoria: "DUAS vCPUs",
    titulo: "Paralelismo",
    subtitulo: "As tarefas podem executar ao mesmo tempo",
    linhas: [
      {
        nome: "vCPU 0",
        intervalos: ["A", "A", "-", "-"],
      },
      {
        nome: "vCPU 1",
        intervalos: ["B", "B", "-", "-"],
      },
    ],
    explicacao:
      "Com duas vCPUs disponíveis simultaneamente, A e B podem executar em paralelo.",
  },
];

/** Marcas de tempo apresentadas acima das linhas. */
const marcasTempo = [0, 1, 2, 3, 4];

/** Etapa exibida na simulação. */
const etapaAtual = ref(0);

/** Indica se a animação está avançando automaticamente. */
const executando = ref(false);

/** Identificador do temporizador da animação. */
let temporizador;

/** Dados da etapa atual. */
const etapaSelecionada = computed(() => etapas[etapaAtual.value]);

/** Retorna a classe visual de cada intervalo. */
function classeIntervalo(processo) {
  if (processo === "A") {
    return "processo-a";
  }

  if (processo === "B") {
    return "processo-b";
  }

  return "intervalo-ocioso";
}

/** Retorna o texto acessível de um intervalo. */
function descricaoIntervalo(processo) {
  if (processo === "-") {
    return "Ociosa neste exemplo";
  }

  return `Processo ${processo} executando`;
}

/** Pausa o avanço automático. */
function pausarSimulacao() {
  if (temporizador !== undefined) {
    window.clearInterval(temporizador);
    temporizador = undefined;
  }

  executando.value = false;
}

/** Inicia ou reinicia o avanço automático. */
function iniciarSimulacao() {
  if (executando.value) {
    return;
  }

  if (etapaAtual.value === etapas.length - 1) {
    etapaAtual.value = 0;
  }

  executando.value = true;

  temporizador = window.setInterval(() => {
    if (etapaAtual.value < etapas.length - 1) {
      etapaAtual.value++;
    }

    if (etapaAtual.value === etapas.length - 1) {
      pausarSimulacao();
    }
  }, 4000);
}

/** Alterna entre reprodução e pausa. */
function alternarSimulacao() {
  if (executando.value) {
    pausarSimulacao();
    return;
  }

  iniciarSimulacao();
}

/** Retorna uma etapa manualmente. */
function etapaAnterior() {
  pausarSimulacao();

  if (etapaAtual.value > 0) {
    etapaAtual.value--;
  }
}

/** Avança uma etapa manualmente. */
function proximaEtapa() {
  pausarSimulacao();

  if (etapaAtual.value < etapas.length - 1) {
    etapaAtual.value++;
  }
}

/** Volta ao início e reproduz novamente. */
function reiniciarSimulacao() {
  pausarSimulacao();
  etapaAtual.value = 0;
  iniciarSimulacao();
}

onMounted(() => {
  iniciarSimulacao();
});

onBeforeUnmount(() => {
  pausarSimulacao();
});
</script>

<template>
  <article class="slide-execucao">
    <header class="slide-cabecalho">
      <span class="slide-categoria">FUNDAMENTOS</span>

      <h1>Concorrência e paralelismo</h1>

      <p>
        As tarefas precisam se alternar ou podem executar simultaneamente?
      </p>
    </header>

    <div class="cenario">
      <div class="cenario-icone">
        <Layers :size="19" :stroke-width="1.8" aria-hidden="true" />
      </div>

      <p>
        Neste exemplo, A e B precisam de <strong>2 ms de CPU cada</strong>.
        Compare o comportamento com uma e com duas vCPUs.
      </p>
    </div>

    <section class="comparacao" aria-label="Comparação entre os dois cenários">
      <article
        v-for="cenario in cenarios"
        :key="cenario.id"
        class="cenario-card"
      >
        <header class="cenario-cabecalho">
          <div>
            <span class="painel-categoria">
              {{ cenario.categoria }}
            </span>

            <h2>{{ cenario.titulo }}</h2>

            <p>{{ cenario.subtitulo }}</p>
          </div>

          <div class="cenario-cpu">
            <Cpu :size="20" :stroke-width="1.8" aria-hidden="true" />
          </div>
        </header>

        <div class="linhas-tempo">
          <div class="escala">
            <span
              v-for="marca in marcasTempo"
              :key="marca"
            >
              {{ marca }}<template v-if="marca === 4"> ms</template>
            </span>
          </div>

          <div
            v-for="linha in cenario.linhas"
            :key="linha.nome"
            class="linha-cpu"
          >
            <span class="linha-nome">
              {{ linha.nome }}
            </span>

            <div class="intervalos">
              <div
                v-for="(processo, indice) in linha.intervalos"
                :key="indice"
                class="intervalo"
                :class="[
                  classeIntervalo(processo),
                  {
                    ativo: indice === etapaAtual,
                    concluido: indice < etapaAtual,
                    futuro: indice > etapaAtual,
                  },
                ]"
                :title="
                  `${linha.nome}: ${descricaoIntervalo(processo)} entre ${indice} e ${indice + 1} ms`
                "
              >
                {{ processo }}
              </div>
            </div>
          </div>
        </div>

        <p class="cenario-explicacao">
          {{ cenario.explicacao }}
        </p>
      </article>
    </section>

    <section class="simulacao" aria-label="Andamento da simulação">
      <div class="simulacao-texto">
        <span class="painel-categoria">
          TEMPO SIMULADO: {{ etapaSelecionada.inicio }}–{{
            etapaSelecionada.fim
          }} MS
        </span>

        <p aria-live="polite">
          {{ etapaSelecionada.descricao }}
        </p>
      </div>

      <div class="controles" aria-label="Controles da simulação">
        <button
          type="button"
          :disabled="etapaAtual === 0"
          aria-label="Etapa anterior"
          title="Etapa anterior"
          @click="etapaAnterior"
        >
          <StepBack :size="16" aria-hidden="true" />
        </button>

        <button
          type="button"
          :aria-label="executando ? 'Pausar simulação' : 'Iniciar simulação'"
          :title="executando ? 'Pausar simulação' : 'Iniciar simulação'"
          @click="alternarSimulacao"
        >
          <Pause
            v-if="executando"
            :size="16"
            aria-hidden="true"
          />

          <Play
            v-else
            :size="16"
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          :disabled="etapaAtual === etapas.length - 1"
          aria-label="Próxima etapa"
          title="Próxima etapa"
          @click="proximaEtapa"
        >
          <StepForward :size="16" aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="Reiniciar simulação"
          title="Reiniciar simulação"
          @click="reiniciarSimulacao"
        >
          <RotateCcw :size="16" aria-hidden="true" />
        </button>
      </div>
    </section>

    <div class="legenda">
      <span>
        <i class="legenda-a"></i>
        Processo A
      </span>

      <span>
        <i class="legenda-b"></i>
        Processo B
      </span>

      <span>
        <i class="legenda-ociosa"></i>
        Ociosa no exemplo
      </span>
    </div>

    <div class="laboratorio">
      <Info :size="19" :stroke-width="1.8" aria-hidden="true" />

      <p>
        <strong>No laboratório:</strong>
        A, B e C são configurados para disputar a vCPU 0. Eles concorrem entre
        si nessa vCPU; a afinidade não impede que outras tarefas do sistema
        também a utilizem.
      </p>
    </div>

    <p class="observacao">
      Exemplo didático: considera vCPUs disponíveis, ignora custos de troca e
      não representa medições reais. A execução das vCPUs da VM também depende
      dos recursos disponibilizados pelo host.
    </p>
  </article>
</template>

<style scoped>
.slide-execucao {
  width: min(1220px, 100%);
  margin: 0 auto;
}

.slide-cabecalho {
  margin-bottom: clamp(1.1rem, 2vh, 1.7rem);
}

.slide-categoria,
.painel-categoria {
  display: block;
  color: var(--apresentacao-destaque, #1ed760);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.slide-cabecalho h1 {
  margin: 0.45rem 0 0;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: clamp(2rem, 3.8vw, 3.5rem);
  line-height: 1.08;
}

.slide-cabecalho > p {
  margin: 0.8rem 0 0;
  color: #d6e5db;
  font-size: clamp(0.95rem, 1.3vw, 1.1rem);
  line-height: 1.5;
}

.cenario {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(30, 215, 96, 0.22);
  border-radius: 12px;
  background: rgba(30, 215, 96, 0.07);
}

.cenario-icone,
.cenario-cpu {
  display: grid;
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 9px;
  color: var(--apresentacao-destaque, #1ed760);
  background: rgba(30, 215, 96, 0.1);
}

.cenario p {
  margin: 0;
  color: #d6e5db;
  font-size: 0.85rem;
  line-height: 1.45;
}

.cenario p strong {
  color: var(--apresentacao-texto, #f8fafc);
}

.comparacao {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.cenario-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: clamp(1rem, 1.6vw, 1.3rem);
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 16px;
  background:
    linear-gradient(
      145deg,
      rgba(20, 33, 25, 0.95),
      rgba(11, 23, 16, 0.95)
    );
}

.cenario-cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.cenario-cabecalho h2 {
  margin: 0.4rem 0 0;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: 1.2rem;
}

.cenario-cabecalho p {
  margin: 0.35rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.78rem;
  line-height: 1.4;
}

.linhas-tempo {
  display: grid;
  align-content: start;
  gap: 0.55rem;
  min-height: 112px;
  margin-top: 1.2rem;
}

.escala {
  display: flex;
  justify-content: space-between;
  padding-left: 66px;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.67rem;
}

.linha-cpu {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  align-items: center;
  gap: 0.5rem;
}

.linha-nome {
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.7rem;
  white-space: nowrap;
}

.intervalos {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.25rem;
}

.intervalo {
  display: grid;
  min-height: 38px;
  place-items: center;
  border: 2px solid transparent;
  border-radius: 7px;
  color: #07100c;
  font-size: 0.78rem;
  font-weight: 900;
  transition:
    opacity 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease;
}

.processo-a {
  background: #60a5fa;
}

.processo-b {
  background: #f59e0b;
}

.intervalo-ocioso {
  color: var(--apresentacao-texto-suave, #94a3b8);
  background: rgba(148, 163, 184, 0.12);
}

.intervalo.ativo {
  opacity: 1;
  border-color: #f8fafc;
  transform: translateY(-2px);
}

.intervalo.concluido {
  opacity: 0.75;
}

.intervalo.futuro {
  opacity: 0.3;
}

.cenario-explicacao {
  margin: auto 0 0;
  padding-top: 0.9rem;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.78rem;
  line-height: 1.5;
}

.simulacao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.9rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
}

.simulacao-texto p {
  margin: 0.4rem 0 0;
  color: #d6e5db;
  font-size: 0.78rem;
  line-height: 1.45;
}

.controles {
  display: flex;
  flex: 0 0 auto;
  gap: 0.4rem;
}

.controles button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  padding: 0;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 8px;
  color: var(--apresentacao-texto, #f8fafc);
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
}

.controles button:hover:not(:disabled) {
  border-color: var(--apresentacao-destaque, #1ed760);
  color: var(--apresentacao-destaque, #1ed760);
}

.controles button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.legenda {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.8rem;
}

.legenda span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.72rem;
}

.legenda i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.legenda-a {
  background: #60a5fa;
}

.legenda-b {
  background: #f59e0b;
}

.legenda-ociosa {
  background: #64748b;
}

.laboratorio {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  margin-top: 0.9rem;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(30, 215, 96, 0.22);
  border-radius: 11px;
  color: var(--apresentacao-destaque, #1ed760);
  background: rgba(30, 215, 96, 0.07);
}

.laboratorio svg {
  flex: 0 0 auto;
  margin-top: 0.1rem;
}

.laboratorio p {
  margin: 0;
  color: #d6e5db;
  font-size: 0.78rem;
  line-height: 1.45;
}

.laboratorio strong {
  color: var(--apresentacao-texto, #f8fafc);
}

.observacao {
  margin: 0.75rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.7rem;
  line-height: 1.4;
}

@media (max-width: 900px) {
  .comparacao {
    grid-template-columns: 1fr;
  }

  .linhas-tempo {
    min-height: auto;
  }
}

@media (max-width: 620px) {
  .slide-cabecalho h1 {
    font-size: clamp(1.8rem, 8vw, 2.5rem);
  }

  .simulacao {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>