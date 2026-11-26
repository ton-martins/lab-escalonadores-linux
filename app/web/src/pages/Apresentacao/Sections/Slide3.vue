<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import {
  Activity,
  Clock3,
  Cpu,
  Layers,
  ListChecks,
  Pause,
  Play,
  RotateCcw,
  StepBack,
  StepForward,
} from "lucide-vue-next";

/** Etapas ilustrativas da execução em uma única vCPU. */
const etapas = [
  {
    titulo: "A executa",
    descricao:
      "A ocupa a vCPU 0. B está pronto e C aguarda um evento.",
    estados: {
      A: "execucao",
      B: "pronto",
      C: "espera",
    },
  },
  {
    titulo: "B recebe a CPU",
    descricao:
      "O kernel seleciona B. A volta ao estado de pronto e C continua em espera.",
    estados: {
      A: "pronto",
      B: "execucao",
      C: "espera",
    },
  },
  {
    titulo: "C fica pronto",
    descricao:
      "O evento aguardado por C termina. C volta ao estado de pronto enquanto B continua executando.",
    estados: {
      A: "pronto",
      B: "execucao",
      C: "pronto",
    },
  },
  {
    titulo: "C recebe a CPU",
    descricao:
      "O escalonador seleciona C. A e B permanecem prontos para executar.",
    estados: {
      A: "pronto",
      B: "pronto",
      C: "execucao",
    },
  },
];

/** Processo exibido em cada linha da simulação. */
const processos = [
  {
    nome: "A",
    cor: "#60a5fa",
  },
  {
    nome: "B",
    cor: "#f59e0b",
  },
  {
    nome: "C",
    cor: "#34d399",
  },
];

/** Conceitos resumidos na parte inferior do slide. */
const conceitos = [
  {
    titulo: "Compartilhamento",
    descricao: "As tarefas compartilham os recursos do sistema.",
    icone: Layers,
  },
  {
    titulo: "Espera",
    descricao: "Enquanto uma tarefa aguarda, outra pode executar.",
    icone: Clock3,
  },
  {
    titulo: "Escalonamento",
    descricao: "O kernel escolhe entre as tarefas prontas.",
    icone: ListChecks,
  },
];

/** Etapa atual da simulação. */
const etapaAtual = ref(0);

/** Indica se a simulação está avançando automaticamente. */
const executando = ref(false);

/** Identificador do temporizador da animação. */
let temporizador;

/** Dados da etapa exibida. */
const etapaSelecionada = computed(() => etapas[etapaAtual.value]);

/** Identifica o processo que está executando na etapa atual. */
const processoEmExecucao = computed(() => {
  return processos.find((processo) => {
    return etapaSelecionada.value.estados[processo.nome] === "execucao";
  });
});

/** Converte o estado interno em texto para exibição. */
function textoEstado(estado) {
  const estados = {
    pronto: "Pronto",
    execucao: "Em execução",
    espera: "Em espera",
  };

  return estados[estado] ?? estado;
}

/** Interrompe o avanço automático da simulação. */
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

/** Avança manualmente uma etapa. */
function proximaEtapa() {
  pausarSimulacao();

  if (etapaAtual.value < etapas.length - 1) {
    etapaAtual.value++;
  }
}

/** Retorna manualmente uma etapa. */
function etapaAnterior() {
  pausarSimulacao();

  if (etapaAtual.value > 0) {
    etapaAtual.value--;
  }
}

/** Retorna ao início e começa novamente. */
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
  <article class="slide-multitarefa">
    <header class="slide-cabecalho">
      <span class="slide-categoria">FUNDAMENTOS</span>

      <h1>Sistemas multitarefa</h1>

      <p>
        Como vários programas avançam se precisam compartilhar a mesma CPU?
      </p>
    </header>

    <div class="introducao">
      <Activity :size="19" :stroke-width="1.8" aria-hidden="true" />

      <p>
        Em sistemas multitarefa, vários processos podem estar ativos ao mesmo
        tempo. Quando mais de um está pronto, o sistema operacional precisa
        decidir qual receberá a CPU.
      </p>
    </div>

    <section class="simulacao" aria-labelledby="titulo-simulacao">
      <div class="simulacao-cabecalho">
        <div>
          <span class="painel-categoria">CENÁRIO ILUSTRATIVO</span>

          <h2 id="titulo-simulacao">
            {{ etapaSelecionada.titulo }}
          </h2>

          <p aria-live="polite">
            {{ etapaSelecionada.descricao }}
          </p>
        </div>

        <div class="etapa-contador">
          Etapa {{ etapaAtual + 1 }} / {{ etapas.length }}
        </div>
      </div>

      <div class="fluxo">
        <!-- Estados dos processos. -->
        <div class="processos">
          <span class="grupo-titulo">PROCESSOS</span>

          <div
            v-for="processo in processos"
            :key="processo.nome"
            class="processo"
            :class="{
              'processo-executando':
                etapaSelecionada.estados[processo.nome] === 'execucao',
              'processo-espera':
                etapaSelecionada.estados[processo.nome] === 'espera',
            }"
            :style="{ '--cor-processo': processo.cor }"
          >
            <div class="processo-identificacao">
              <span class="processo-letra">
                {{ processo.nome }}
              </span>

              <strong>Processo {{ processo.nome }}</strong>
            </div>

            <span class="processo-estado">
              {{ textoEstado(etapaSelecionada.estados[processo.nome]) }}
            </span>
          </div>
        </div>

        <div class="conector" aria-hidden="true">
          <span>→</span>
        </div>

        <!-- Representação do escalonador. -->
        <div class="kernel">
          <div class="kernel-icone">
            <ListChecks :size="25" :stroke-width="1.8" aria-hidden="true" />
          </div>

          <span class="grupo-titulo">KERNEL</span>

          <strong>Escalonador</strong>

          <p>
            Escolhe uma tarefa entre as que estão prontas.
          </p>
        </div>

        <div class="conector" aria-hidden="true">
          <span>→</span>
        </div>

        <!-- Processo selecionado para a CPU. -->
        <div class="cpu">
          <div class="cpu-icone">
            <Cpu :size="25" :stroke-width="1.8" aria-hidden="true" />
          </div>

          <span class="grupo-titulo">PROCESSADOR</span>

          <strong>vCPU 0</strong>

          <div
            v-if="processoEmExecucao"
            class="cpu-processo"
            :style="{ '--cor-processo': processoEmExecucao.cor }"
          >
            Processo {{ processoEmExecucao.nome }}
          </div>
        </div>
      </div>

      <div class="simulacao-rodape">
        <p>
          Simulação didática: a sequência não representa uma coleta real do
          laboratório.
        </p>

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
      </div>
    </section>

    <section class="conceitos" aria-label="Conceitos principais">
      <div
        v-for="conceito in conceitos"
        :key="conceito.titulo"
        class="conceito"
      >
        <div class="conceito-icone">
          <component
            :is="conceito.icone"
            :size="19"
            :stroke-width="1.8"
            aria-hidden="true"
          />
        </div>

        <div>
          <strong>{{ conceito.titulo }}</strong>

          <p>
            {{ conceito.descricao }}
          </p>
        </div>
      </div>
    </section>

    <p class="observacao">
      No próximo slide: quando há mais de uma CPU disponível, as tarefas
      podem executar simultaneamente?
    </p>
  </article>
</template>

<style scoped>
.slide-multitarefa {
  width: min(1220px, 100%);
  margin: 0 auto;
}

.slide-cabecalho {
  margin-bottom: clamp(1.1rem, 2vh, 1.7rem);
}

.slide-categoria,
.painel-categoria,
.grupo-titulo {
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

.introducao {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(30, 215, 96, 0.22);
  border-radius: 12px;
  color: var(--apresentacao-destaque, #1ed760);
  background: rgba(30, 215, 96, 0.07);
}

.introducao svg {
  flex: 0 0 auto;
  margin-top: 0.1rem;
}

.introducao p {
  margin: 0;
  color: #d6e5db;
  font-size: 0.86rem;
  line-height: 1.5;
}

.simulacao {
  padding: clamp(1rem, 1.6vw, 1.3rem);
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 18px;
  background:
    linear-gradient(
      145deg,
      rgba(20, 33, 25, 0.95),
      rgba(11, 23, 16, 0.95)
    );
}

.simulacao-cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.simulacao-cabecalho h2 {
  margin: 0.4rem 0 0;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: 1.15rem;
}

.simulacao-cabecalho p {
  margin: 0.4rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.8rem;
  line-height: 1.45;
}

.etapa-contador {
  flex: 0 0 auto;
  padding: 0.4rem 0.6rem;
  border-radius: 999px;
  color: var(--apresentacao-destaque, #1ed760);
  font-size: 0.72rem;
  background: rgba(30, 215, 96, 0.1);
}

.fluxo {
  display: grid;
  grid-template-columns:
    minmax(0, 1.3fr)
    auto
    minmax(0, 0.8fr)
    auto
    minmax(0, 0.7fr);
  align-items: center;
  gap: 0.8rem;
  margin-top: 1rem;
}

.processos {
  display: grid;
  gap: 0.5rem;
}

.processos > .grupo-titulo {
  margin-bottom: 0.2rem;
}

.processo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-left: 3px solid var(--cor-processo);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.025);
  transition:
    border-color 0.25s ease,
    background 0.25s ease,
    opacity 0.25s ease;
}

.processo-executando {
  border-color: var(--cor-processo);
  background: color-mix(
    in srgb,
    var(--cor-processo) 10%,
    transparent
  );
}

.processo-espera {
  opacity: 0.65;
}

.processo-identificacao {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}

.processo-identificacao strong {
  color: var(--apresentacao-texto, #f8fafc);
  font-size: 0.78rem;
  white-space: nowrap;
}

.processo-letra {
  display: grid;
  flex: 0 0 27px;
  width: 27px;
  height: 27px;
  place-items: center;
  border-radius: 7px;
  color: var(--cor-processo);
  font-size: 0.78rem;
  font-weight: 800;
  background: color-mix(
    in srgb,
    var(--cor-processo) 13%,
    transparent
  );
}

.processo-estado {
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.7rem;
  text-align: right;
}

.conector {
  color: var(--apresentacao-destaque, #1ed760);
  font-size: 1.5rem;
  font-weight: 700;
}

.kernel,
.cpu {
  display: flex;
  min-height: 175px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 14px;
  text-align: center;
  background: rgba(255, 255, 255, 0.025);
}

.kernel {
  border-color: rgba(30, 215, 96, 0.3);
  background: rgba(30, 215, 96, 0.06);
}

.kernel-icone,
.cpu-icone,
.conceito-icone {
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: var(--apresentacao-destaque, #1ed760);
  background: rgba(30, 215, 96, 0.1);
}

.kernel-icone,
.cpu-icone {
  width: 44px;
  height: 44px;
  margin-bottom: 0.7rem;
}

.kernel > strong,
.cpu > strong {
  margin-top: 0.4rem;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: 0.95rem;
}

.kernel > p {
  max-width: 190px;
  margin: 0.55rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.72rem;
  line-height: 1.4;
}

.cpu-processo {
  margin-top: 0.75rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--cor-processo);
  border-radius: 8px;
  color: var(--cor-processo);
  font-size: 0.76rem;
  font-weight: 800;
  background: color-mix(
    in srgb,
    var(--cor-processo) 10%,
    transparent
  );
}

.simulacao-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.simulacao-rodape p {
  margin: 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.7rem;
  line-height: 1.4;
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

.conceitos {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.conceito {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.8rem;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
}

.conceito-icone {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
}

.conceito strong {
  display: block;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: 0.8rem;
}

.conceito p {
  margin: 0.3rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.73rem;
  line-height: 1.4;
}

.observacao {
  margin: 0.8rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.72rem;
  line-height: 1.4;
}

@media (max-width: 900px) {
  .fluxo {
    grid-template-columns: 1fr;
  }

  .conector {
    text-align: center;
    transform: rotate(90deg);
  }

  .kernel,
  .cpu {
    min-height: 140px;
  }
}

@media (max-width: 620px) {
  .slide-cabecalho h1 {
    font-size: clamp(1.8rem, 8vw, 2.5rem);
  }

  .conceitos {
    grid-template-columns: 1fr;
  }

  .simulacao-rodape {
    align-items: flex-start;
    flex-direction: column;
  }

  .processo-identificacao strong {
    white-space: normal;
  }
}
</style>