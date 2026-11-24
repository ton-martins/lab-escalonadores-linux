<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  Filter,
  Radio,
  RefreshCcw,
  Workflow,
} from "lucide-vue-next";

import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

import { Line } from "vue-chartjs";

import { useExecucoes } from "../composables/useExecucoes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

/** Configuração visual dos processos exibidos na dashboard. */
const processos = {
  A: {
    titulo: "Processo A",
    cor: "#38bdf8",
    corSuave: "rgba(56, 189, 248, 0.14)",
    corTexto: "#7dd3fc",
  },
  B: {
    titulo: "Processo B",
    cor: "#f59e0b",
    corSuave: "rgba(245, 158, 11, 0.14)",
    corTexto: "#fcd34d",
  },
  C: {
    titulo: "Processo C",
    cor: "#1ed760",
    corSuave: "rgba(30, 215, 96, 0.14)",
    corTexto: "#86efac",
  },
};

/** Nomes amigáveis para os experimentos. */
const nomesExperimentos = {
  exp1: "Exp. 1 — divisão equilibrada",
  exp2: "Exp. 2 — prioridades distintas",
  exp3: "Exp. 3 — responsividade",
};

/** Nomes amigáveis para os tipos de carga. */
const nomesTiposCarga = {
  cpu_bound: "CPU-bound",
  io_bound_simulated: "I/O-bound simulado",
};

const {
  execucoes,
  execucaoSelecionada,
  carregando,
  carregandoDetalhes,
  erro,
  statusTempoReal,
  atualizadoEm,
  listarExecucoes,
  selecionarExecucao,
  limparSelecao,
  iniciar,
  encerrarTempoReal,
} = useExecucoes();

/** Filtros aplicados ao histórico de execuções. */
const filtroEscalonador = ref("todos");
const filtroExperimento = ref("todos");

/** Retorna a configuração visual de um processo. */
function obterProcesso(processo) {
  return processos[processo] ?? {
    titulo: `Processo ${processo}`,
    cor: "#94a3b8",
    corSuave: "rgba(148, 163, 184, 0.14)",
    corTexto: "#cbd5e1",
  };
}

/** Retorna o nome amigável de um experimento. */
function nomeExperimento(experimento) {
  return nomesExperimentos[experimento] ?? experimento;
}

/** Retorna o nome amigável de um tipo de carga. */
function nomeTipoCarga(tipoCarga) {
  return nomesTiposCarga[tipoCarga] ?? tipoCarga;
}

/** Formata valores percentuais exibidos na interface. */
function formatarPercentual(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "—";
  }

  return `${numero.toFixed(2)}%`;
}

/** Formata datas no padrão brasileiro. */
function formatarData(valor) {
  if (!valor) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(valor));
}

/** Cria uma chave única para uma execução. */
function chaveExecucao(execucao) {
  return [
    execucao.escalonador,
    execucao.experimento,
    execucao.id,
  ].join("-");
}

/** Retorna a média de CPU de todos os processos de uma execução. */
function mediaCpuExecucao(execucao) {
  const resumo = execucao.resumo ?? [];

  if (!resumo.length) {
    return "—";
  }

  const media =
    resumo.reduce(
      (acumulado, processo) =>
        acumulado + Number(processo.cpu_media ?? 0),
      0,
    ) / resumo.length;

  return formatarPercentual(media);
}

/** Retorna as classes visuais de cada estado de execução. */
function classeStatus(status) {
  if (status === "concluida") {
    return "bg-[var(--highlight-soft-color)] text-[var(--highlight-color)]";
  }

  if (status === "executando") {
    return "bg-amber-400/10 text-amber-300";
  }

  return "bg-[var(--surface-muted-color)] text-[var(--text-secondary-color)]";
}

/** Retorna o texto amigável de cada estado. */
function textoStatus(status) {
  if (status === "concluida") {
    return "Concluída";
  }

  if (status === "executando") {
    return "Executando";
  }

  return "Sem status";
}

/** Retorna o estado visual da conexão Socket.IO. */
const configuracaoTempoReal = computed(() => {
  if (statusTempoReal.value === "conectado") {
    return {
      texto: "Atualização em tempo real",
      classe:
        "bg-[var(--highlight-soft-color)] text-[var(--highlight-color)]",
    };
  }

  if (statusTempoReal.value === "conectando") {
    return {
      texto: "Conectando em tempo real",
      classe: "bg-amber-400/10 text-amber-300",
    };
  }

  return {
    texto: "Atualização desconectada",
    classe:
      "bg-[var(--surface-muted-color)] text-[var(--text-secondary-color)]",
  };
});

/** Retorna os escalonadores disponíveis para o filtro. */
const escalonadoresDisponiveis = computed(() => {
  return [...new Set(execucoes.value.map((execucao) => execucao.escalonador))]
    .filter(Boolean)
    .sort();
});

/** Retorna os experimentos disponíveis para o filtro. */
const experimentosDisponiveis = computed(() => {
  return [...new Set(execucoes.value.map((execucao) => execucao.experimento))]
    .filter(Boolean)
    .sort();
});

/** Aplica os filtros selecionados à lista de execuções. */
const execucoesFiltradas = computed(() => {
  return execucoes.value.filter((execucao) => {
    const correspondeEscalonador =
      filtroEscalonador.value === "todos"
      || execucao.escalonador === filtroEscalonador.value;

    const correspondeExperimento =
      filtroExperimento.value === "todos"
      || execucao.experimento === filtroExperimento.value;

    return correspondeEscalonador && correspondeExperimento;
  });
});

/** Conta as execuções realizadas com CFS. */
const totalCfs = computed(() => {
  return execucoes.value.filter(
    (execucao) => execucao.escalonador === "cfs",
  ).length;
});

/** Conta as execuções realizadas com EEVDF. */
const totalEevdf = computed(() => {
  return execucoes.value.filter(
    (execucao) => execucao.escalonador === "eevdf",
  ).length;
});

/** Retorna os dados resumidos da execução selecionada. */
const resumoSelecionado = computed(() => {
  return execucaoSelecionada.value?.resumo ?? [];
});

/** Retorna as amostras da execução selecionada. */
const amostrasSelecionadas = computed(() => {
  return execucaoSelecionada.value?.amostras ?? [];
});

/** Ordena os processos da execução selecionada. */
const processosSelecionados = computed(() => {
  return [...resumoSelecionado.value].sort((processoA, processoB) => {
    return processoA.processo.localeCompare(processoB.processo);
  });
});

/** Obtém um token CSS definido no style.css. */
function obterTokenCss(nome, valorPadrao) {
  const valor = getComputedStyle(document.documentElement)
    .getPropertyValue(nome)
    .trim();

  return valor || valorPadrao;
}

/** Cria os dados utilizados pelos gráficos Chart.js. */
function criarDadosGrafico(campo, titulo) {
  const amostras = amostrasSelecionadas.value;

  if (!amostras.length) {
    return {
      labels: [],
      datasets: [],
    };
  }

  const horarios = [...new Set(amostras.map((amostra) => amostra.horario))];

  const processosPresentes = [
    ...new Set(amostras.map((amostra) => amostra.processo)),
  ].sort();

  return {
    labels: horarios,
    datasets: processosPresentes.map((processo) => {
      const configuracao = obterProcesso(processo);

      return {
        label: `${configuracao.titulo} · ${titulo}`,
        data: horarios.map((horario) => {
          const amostra = amostras.find(
            (item) =>
              item.horario === horario
              && item.processo === processo,
          );

          return amostra ? amostra[campo] : null;
        }),
        borderColor: configuracao.cor,
        backgroundColor: configuracao.corSuave,
        pointBackgroundColor: configuracao.cor,
        pointBorderColor: "#121212",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2.5,
        tension: 0.35,
        fill: false,
      };
    }),
  };
}

/** Dados do gráfico de CPU por processo. */
const dadosGraficoCpu = computed(() => {
  return criarDadosGrafico("cpu_percentual", "Uso de CPU");
});

/** Dados do gráfico de espera por processo. */
const dadosGraficoEspera = computed(() => {
  return criarDadosGrafico("espera_percentual", "Tempo de espera");
});

/** Configuração compartilhada pelos gráficos. */
const opcoesGrafico = computed(() => {
  const corTexto = obterTokenCss("--text-secondary-color", "#b3b3b3");
  const corBorda = obterTokenCss("--border-color", "#2a2a2a");
  const corPainel = obterTokenCss("--accent-color", "#181818");

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        labels: {
          color: corTexto,
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            family: "Inter, ui-sans-serif, system-ui",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: corPainel,
        borderColor: corBorda,
        borderWidth: 1,
        titleColor: "#ffffff",
        bodyColor: corTexto,
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: corTexto,
          maxRotation: 0,
        },
        grid: {
          color: corBorda,
        },
        border: {
          color: corBorda,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        ticks: {
          color: corTexto,
          callback: (valor) => `${valor}%`,
        },
        grid: {
          color: corBorda,
        },
        border: {
          color: corBorda,
        },
      },
    },
  };
});

/** Busca novamente as execuções disponíveis. */
async function atualizarDashboard() {
  await listarExecucoes();
}

/** Busca e exibe os detalhes de uma execução. */
async function abrirExecucao(execucao) {
  await selecionarExecucao(execucao);
}

/** Inicializa a dashboard e seleciona a execução mais recente. */
async function iniciarDashboard() {
  await iniciar();

  if (execucoes.value.length) {
    await selecionarExecucao(execucoes.value[0]);
  }
}

/** Remove a seleção se ela deixar de atender aos filtros. */
watch([filtroEscalonador, filtroExperimento], () => {
  const execucaoAindaVisivel = execucoesFiltradas.value.some(
    (execucao) =>
      chaveExecucao(execucao)
      === chaveExecucao(execucaoSelecionada.value ?? {}),
  );

  if (!execucaoAindaVisivel) {
    limparSelecao();
  }
});

onMounted(() => {
  void iniciarDashboard();
});

onUnmounted(() => {
  encerrarTempoReal();
});
</script>

<template>
  <section class="mx-auto max-w-7xl space-y-6 px-5 py-7 lg:px-8 lg:py-9">
    <section class="app-panel relative overflow-hidden px-6 py-7 lg:px-8">
      <div
        class="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-[var(--highlight-color)] opacity-[0.05] blur-3xl"
      />

      <div
        class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
      >
        <div class="max-w-2xl">
          <p class="eyebrow flex items-center gap-2">
            <Activity :size="15" />
            Monitoramento experimental
          </p>

          <h2 class="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Resultados do escalonamento Linux
          </h2>

          <p class="mt-3 text-sm leading-6 text-[var(--text-secondary-color)]">
            Compare as execuções realizadas sob os escalonadores CFS e EEVDF.
            Os resultados são atualizados ao término de novos experimentos.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <span
            class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
            :class="configuracaoTempoReal.classe"
          >
            <Radio :size="14" />
            {{ configuracaoTempoReal.texto }}
          </span>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-muted-color)] px-3.5 py-2 text-sm font-medium text-[var(--text-primary-color)] transition hover:bg-[var(--accent-hover-color)] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="carregando"
            @click="atualizarDashboard"
          >
            <RefreshCcw :size="16" :class="{ 'animate-spin': carregando }" />
            Atualizar
          </button>
        </div>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="app-panel app-panel-hover p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-[var(--text-muted-color)]">
              Execuções registradas
            </p>

            <p class="mt-2 text-3xl font-semibold">
              {{ execucoes.length }}
            </p>
          </div>

          <div class="rounded-xl bg-[var(--surface-muted-color)] p-2.5 text-[var(--text-secondary-color)]">
            <Database :size="19" />
          </div>
        </div>
      </article>

      <article class="app-panel app-panel-hover p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-[var(--text-muted-color)]">
              Execuções CFS
            </p>

            <p class="mt-2 text-3xl font-semibold">
              {{ totalCfs }}
            </p>
          </div>

          <div class="rounded-xl bg-[var(--surface-muted-color)] p-2.5 text-[var(--text-secondary-color)]">
            <Workflow :size="19" />
          </div>
        </div>
      </article>

      <article class="app-panel app-panel-hover p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-[var(--text-muted-color)]">
              Execuções EEVDF
            </p>

            <p class="mt-2 text-3xl font-semibold">
              {{ totalEevdf }}
            </p>
          </div>

          <div class="rounded-xl bg-[var(--surface-muted-color)] p-2.5 text-[var(--text-secondary-color)]">
            <Cpu :size="19" />
          </div>
        </div>
      </article>

      <article class="app-panel app-panel-hover p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-[var(--text-muted-color)]">
              Última atualização
            </p>

            <p class="mt-2 text-sm font-semibold">
              {{ atualizadoEm ? formatarData(atualizadoEm) : "Sem dados" }}
            </p>
          </div>

          <div class="rounded-xl bg-[var(--surface-muted-color)] p-2.5 text-[var(--text-secondary-color)]">
            <Clock3 :size="19" />
          </div>
        </div>
      </article>
    </section>

    <section class="app-panel p-5 lg:p-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="eyebrow flex items-center gap-2">
            <Filter :size="15" />
            Filtros
          </p>

          <h3 class="mt-2 text-lg font-semibold">
            Histórico de execuções
          </h3>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <label class="grid gap-1.5">
            <span class="text-xs font-medium text-[var(--text-secondary-color)]">
              Escalonador
            </span>

            <select
              v-model="filtroEscalonador"
              class="rounded-lg border border-[var(--border-color)] bg-[var(--surface-muted-color)] px-3 py-2 text-sm text-[var(--text-primary-color)] outline-none transition focus:border-[var(--highlight-color)]"
            >
              <option value="todos">Todos os escalonadores</option>

              <option
                v-for="escalonador in escalonadoresDisponiveis"
                :key="escalonador"
                :value="escalonador"
              >
                {{ escalonador.toUpperCase() }}
              </option>
            </select>
          </label>

          <label class="grid gap-1.5">
            <span class="text-xs font-medium text-[var(--text-secondary-color)]">
              Experimento
            </span>

            <select
              v-model="filtroExperimento"
              class="rounded-lg border border-[var(--border-color)] bg-[var(--surface-muted-color)] px-3 py-2 text-sm text-[var(--text-primary-color)] outline-none transition focus:border-[var(--highlight-color)]"
            >
              <option value="todos">Todos os experimentos</option>

              <option
                v-for="experimento in experimentosDisponiveis"
                :key="experimento"
                :value="experimento"
              >
                {{ nomeExperimento(experimento) }}
              </option>
            </select>
          </label>
        </div>
      </div>
    </section>

    <p
      v-if="erro"
      class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
    >
      {{ erro }}
    </p>

    <section class="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
      <article class="app-panel overflow-hidden">
        <div class="border-b border-[var(--border-color)] px-5 py-4 lg:px-6">
          <p class="text-sm font-semibold">Execuções disponíveis</p>

          <p class="mt-1 text-sm text-[var(--text-secondary-color)]">
            Selecione uma execução para visualizar seus detalhes.
          </p>
        </div>

        <div
          v-if="carregando"
          class="px-6 py-10 text-center text-sm text-[var(--text-secondary-color)]"
        >
          Carregando execuções...
        </div>

        <div
          v-else-if="!execucoesFiltradas.length"
          class="px-6 py-10 text-center text-sm text-[var(--text-secondary-color)]"
        >
          Nenhuma execução encontrada para os filtros selecionados.
        </div>

        <div v-else class="divide-y divide-[var(--border-color)]">
          <button
            v-for="execucao in execucoesFiltradas"
            :key="chaveExecucao(execucao)"
            type="button"
            class="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--accent-hover-color)] lg:px-6"
            :class="
              chaveExecucao(execucaoSelecionada ?? {})
              === chaveExecucao(execucao)
                ? 'bg-[var(--accent-hover-color)]'
                : ''
            "
            @click="abrirExecucao(execucao)"
          >
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-medium">
                  {{ nomeExperimento(execucao.experimento) }}
                </p>

                <span
                  class="rounded-md bg-[var(--surface-muted-color)] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary-color)]"
                >
                  {{ execucao.escalonador }}
                </span>
              </div>

              <p class="mt-1 text-xs text-[var(--text-muted-color)]">
                {{ formatarData(execucao.iniciado_em) }}
              </p>
            </div>

            <div class="hidden text-right sm:block">
              <p class="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted-color)]">
                Média por processo
              </p>

              <p class="mt-1 text-sm font-semibold">
                {{ mediaCpuExecucao(execucao) }}
              </p>
            </div>

            <span
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              :class="classeStatus(execucao.status)"
            >
              <CheckCircle2 :size="13" />
              {{ textoStatus(execucao.status) }}
            </span>
          </button>
        </div>
      </article>

      <article class="app-panel p-5 lg:p-6">
        <template v-if="execucaoSelecionada">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="eyebrow">Execução selecionada</p>

              <h3 class="mt-2 text-lg font-semibold">
                {{ nomeExperimento(execucaoSelecionada.experimento) }}
              </h3>
            </div>

            <span
              class="rounded-md bg-[var(--surface-muted-color)] px-2.5 py-1 text-xs font-bold uppercase text-[var(--text-secondary-color)]"
            >
              {{ execucaoSelecionada.escalonador }}
            </span>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <div class="app-panel-muted p-4">
              <p class="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted-color)]">
                Kernel
              </p>

              <p class="mt-2 break-words text-sm font-semibold">
                {{ resumoSelecionado[0]?.kernel ?? "—" }}
              </p>
            </div>

            <div class="app-panel-muted p-4">
              <p class="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted-color)]">
                vCPU alvo
              </p>

              <p class="mt-2 text-sm font-semibold">
                {{ resumoSelecionado[0]?.vcpu ?? "—" }}
              </p>
            </div>
          </div>

          <div class="app-panel-muted mt-4 flex items-start gap-3 p-4">
            <div class="rounded-lg bg-[var(--accent-hover-color)] p-2 text-[var(--highlight-color)]">
              <Clock3 :size="17" />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-medium">
                Iniciada em
                {{ formatarData(execucaoSelecionada.iniciado_em) }}
              </p>

              <p class="mt-1 text-xs text-[var(--text-secondary-color)]">
                Atualizada em
                {{ formatarData(execucaoSelecionada.atualizado_em) }}
              </p>
            </div>
          </div>
        </template>

        <div
          v-else
          class="flex min-h-52 items-center justify-center text-center"
        >
          <div>
            <Database
              class="mx-auto text-[var(--text-muted-color)]"
              :size="30"
            />

            <p class="mt-3 text-sm text-[var(--text-secondary-color)]">
              Selecione uma execução para ver seus detalhes.
            </p>
          </div>
        </div>
      </article>
    </section>

    <section class="app-panel p-5 lg:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="eyebrow">Processos da execução</p>

          <h3 class="mt-2 text-xl font-semibold">
            Distribuição de recursos
          </h3>
        </div>

        <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-secondary-color)]">
          <span
            v-for="processo in processosSelecionados"
            :key="processo.processo"
            class="inline-flex items-center gap-1.5"
          >
            <span
              class="h-2.5 w-2.5 rounded-full"
              :style="{ backgroundColor: obterProcesso(processo.processo).cor }"
            />

            {{ obterProcesso(processo.processo).titulo }}
          </span>
        </div>
      </div>

      <div
        v-if="carregandoDetalhes"
        class="app-panel-muted mt-6 px-4 py-8 text-center text-sm text-[var(--text-secondary-color)]"
      >
        Carregando detalhes da execução...
      </div>

      <div
        v-else-if="!processosSelecionados.length"
        class="app-panel-muted mt-6 px-4 py-8 text-center text-sm text-[var(--text-secondary-color)]"
      >
        Não há dados de processo para exibir.
      </div>

      <div v-else class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="processo in processosSelecionados"
          :key="processo.processo"
          class="app-panel-muted relative overflow-hidden p-5"
        >
          <span
            class="absolute inset-x-0 top-0 h-1"
            :style="{ backgroundColor: obterProcesso(processo.processo).cor }"
          />

          <div class="flex items-start justify-between gap-4">
            <div>
              <h4 class="font-semibold">
                {{ obterProcesso(processo.processo).titulo }}
              </h4>

              <p class="mt-1 text-sm text-[var(--text-secondary-color)]">
                {{ nomeTipoCarga(processo.tipo_carga) }}
              </p>
            </div>

            <span
              class="rounded-md px-2 py-1 text-xs font-semibold"
              :style="{
                backgroundColor: obterProcesso(processo.processo).corSuave,
                color: obterProcesso(processo.processo).corTexto,
              }"
            >
              nice {{ processo.nice }}
            </span>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p class="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted-color)]">
                CPU média
              </p>

              <p class="mt-1 text-xl font-semibold">
                {{ formatarPercentual(processo.cpu_media) }}
              </p>
            </div>

            <div>
              <p class="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted-color)]">
                Espera média
              </p>

              <p class="mt-1 text-xl font-semibold">
                {{ formatarPercentual(processo.espera_media) }}
              </p>
            </div>
          </div>

          <div class="mt-6 border-t border-[var(--border-color)] pt-4 text-xs text-[var(--text-muted-color)]">
            PID {{ processo.pid }} · vCPU {{ processo.vcpu }}
          </div>
        </article>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="app-panel p-5 lg:p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="eyebrow">Uso de CPU</p>

            <h3 class="mt-2 text-lg font-semibold">
              CPU por processo
            </h3>

            <p class="mt-1 text-sm text-[var(--text-secondary-color)]">
              Percentual de CPU observado pelo pidstat.
            </p>
          </div>

          <div class="rounded-xl bg-[var(--surface-muted-color)] p-2.5 text-[var(--text-secondary-color)]">
            <BarChart3 :size="19" />
          </div>
        </div>

        <div
          v-if="dadosGraficoCpu.datasets.length"
          class="mt-6 h-72"
        >
          <Line
            :data="dadosGraficoCpu"
            :options="opcoesGrafico"
          />
        </div>

        <div
          v-else
          class="mt-6 flex h-72 items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] text-sm text-[var(--text-secondary-color)]"
        >
          Selecione uma execução para visualizar o gráfico.
        </div>
      </article>

      <article class="app-panel p-5 lg:p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="eyebrow">Tempo de espera</p>

            <h3 class="mt-2 text-lg font-semibold">
              Espera por processo
            </h3>

            <p class="mt-1 text-sm text-[var(--text-secondary-color)]">
              Percentual de espera observado pelo pidstat.
            </p>
          </div>

          <div class="rounded-xl bg-[var(--surface-muted-color)] p-2.5 text-[var(--text-secondary-color)]">
            <Activity :size="19" />
          </div>
        </div>

        <div
          v-if="dadosGraficoEspera.datasets.length"
          class="mt-6 h-72"
        >
          <Line
            :data="dadosGraficoEspera"
            :options="opcoesGrafico"
          />
        </div>

        <div
          v-else
          class="mt-6 flex h-72 items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] text-sm text-[var(--text-secondary-color)]"
        >
          Selecione uma execução para visualizar o gráfico.
        </div>
      </article>
    </section>
  </section>
</template>