<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

const slideAtual = ref(0);
const totalSlides = 29;

const slides = [
  "Apresentação",
  "Arquitetura de um sistema computacional",
  "Do programa ao processo",
  "Processos e threads",
  "Concorrência e paralelismo",
  "Memória virtual",
  "Alocação dinâmica",
  "Proteção e falhas de página",
  "Estados de execução",
  "Fundamentos do escalonamento",
  "Onde CFS e EEVDF se encaixam",
  "Temporizador e reavaliação",
  "CFS: conceitos e pesos",
  "Simulação do CFS",
  "EEVDF: conceitos e elegibilidade",
  "Simulação do EEVDF",
  "CFS × EEVDF",
  "Ambiente experimental",
  "Afinidade de CPU",
  "Cargas de trabalho",
  "cpu_bound_worker",
  "io_bound_simulator",
  "Scripts Bash",
  "Experimento 1",
  "Experimento 2",
  "Experimento 3",
  "Coleta com pidstat",
  "API e tempo real",
  "Dashboard",
];

const politicas = [
  {
    nome: "FCFS",
    descricao: "Atende primeiro quem entrou primeiro na fila.",
    funcionamento: "First Come, First Served: a próxima tarefa é a primeira que chegou à fila de prontas.",
    preempcao: "Não preemptiva: a tarefa continua até terminar ou bloquear.",
    exemplo: "Se A chega antes de B e C, A executa primeiro; as demais aguardam sua vez.",
    vantagem: "Simples de compreender e implementar.",
    limitacao: "Uma tarefa longa pode fazer tarefas curtas esperarem bastante.",
  },
  {
    nome: "Round Robin",
    descricao: "Alterna tarefas prontas por fatias de tempo.",
    funcionamento: "Cada tarefa recebe uma oportunidade de execução por uma fatia; se continuar pronta, volta à fila.",
    preempcao: "Preemptiva: a fatia pode terminar antes de a tarefa concluir.",
    exemplo: "Com fatias de 2 ms, A executa até 2 ms, depois B e depois C, conforme a ordem da fila.",
    vantagem: "Oferece oportunidades frequentes às tarefas prontas.",
    limitacao: "Fatias muito pequenas podem causar muitas trocas de contexto.",
  },
  {
    nome: "Prioridades",
    descricao: "Favorece tarefas com maior prioridade relativa.",
    funcionamento: "A escolha considera a prioridade atribuída às tarefas prontas.",
    preempcao: "Pode ser preemptiva ou não, conforme a política adotada.",
    exemplo: "Se C tem prioridade maior que A e B, C pode ser escolhida antes delas.",
    vantagem: "Permite favorecer tarefas consideradas mais importantes.",
    limitacao: "Tarefas de baixa prioridade podem esperar demais, dependendo da política.",
  },
  {
    nome: "SJF",
    descricao: "Escolhe a menor rajada conhecida ou estimada.",
    funcionamento: "A próxima tarefa é a que possui a menor rajada de CPU prevista.",
    preempcao: "Não preemptivo na versão clássica.",
    exemplo: "Entre rajadas estimadas de 2 ms e 6 ms, escolhe a de 2 ms.",
    vantagem: "Pode reduzir a espera média de tarefas curtas.",
    limitacao: "O tempo futuro de CPU geralmente precisa ser estimado.",
  },
  {
    nome: "Justiça proporcional",
    descricao: "Busca distribuição proporcional de serviço.",
    funcionamento: "Divide as oportunidades de CPU considerando pesos e serviço já recebido.",
    preempcao: "A implementação pode reavaliar e preemptar tarefas.",
    exemplo: "Com pesos iguais, A e B tendem a dividir a CPU disponível em torno de 50% para cada.",
    vantagem: "Busca equilíbrio de longo prazo conforme os pesos.",
    limitacao: "Uma divisão justa não garante resposta em um prazo rígido.",
  },
  {
    nome: "SRTF",
    descricao: "Favorece o menor tempo restante estimado.",
    funcionamento: "Compara a tarefa atual com as tarefas prontas e pode escolher uma rajada restante menor.",
    preempcao: "Preemptivo: uma nova tarefa mais curta pode interromper a atual.",
    exemplo: "Se C precisa de 1 ms e A ainda precisa de 4 ms, C pode executar primeiro.",
    vantagem: "Pode reduzir a espera média de tarefas curtas.",
    limitacao: "Depende de estimativas e pode prolongar a espera de tarefas longas.",
  },
];

const criterios = [
  { nome: "Utilização da CPU", descricao: "Proporção do tempo em que a CPU está ocupada.", funcionamento: "Indica quanto da capacidade disponível foi usada em um intervalo.", exemplo: "Uma vCPU ocupada por 8 ms em 10 ms tem utilização de 80%.", limitacao: "Alta utilização, isoladamente, não garante boa resposta." },
  { nome: "Vazão", descricao: "Trabalhos concluídos por unidade de tempo.", funcionamento: "Conta quantos trabalhos terminam em determinado intervalo.", exemplo: "Concluir 20 trabalhos em 10 segundos representa 2 por segundo.", limitacao: "Não informa quanto cada usuário esperou." },
  { nome: "Tempo de CPU", descricao: "Tempo efetivamente executado pela tarefa.", funcionamento: "Soma os períodos em que a tarefa ocupou a CPU.", exemplo: "Duas execuções de 2 ms totalizam 4 ms de CPU.", limitacao: "É diferente do tempo decorrido no relógio." },
  { nome: "Tempo de espera", descricao: "Tempo em que a tarefa está pronta aguardando CPU.", funcionamento: "Acumula a espera na fila de prontas.", exemplo: "B fica pronta por 3 ms até receber a CPU.", limitacao: "Não é o mesmo que o tempo bloqueada aguardando I/O." },
  { nome: "Tempo de resposta", descricao: "Intervalo até o início da resposta observada.", funcionamento: "Mede o tempo entre um evento ou solicitação e o começo da resposta.", exemplo: "Da chegada de uma solicitação até a primeira resposta.", limitacao: "A definição exata depende do evento e da métrica adotados." },
  { nome: "Tempo de retorno", descricao: "Intervalo entre início e conclusão do trabalho.", funcionamento: "Inclui execução, espera por CPU e possíveis bloqueios.", exemplo: "Um trabalho iniciado em 0 e concluído em 12 ms teve retorno de 12 ms.", limitacao: "Não indica isoladamente a responsividade inicial." },
  { nome: "Justiça", descricao: "Distribuição coerente com a política e os pesos.", funcionamento: "Compara o serviço recebido com a participação considerada justa.", exemplo: "Duas tarefas prontas de peso igual tendem a receber parcelas semelhantes.", limitacao: "Justiça proporcional não significa tempo igual em qualquer instante." },
];

const politicaSelecionada = ref(null);
const botaoFecharPolitica = ref(null);
let elementoAnteriorModal = null;

async function abrirPolitica(politica) {
  elementoAnteriorModal = document.activeElement;
  politicaSelecionada.value = politica;
  await nextTick();
  botaoFecharPolitica.value?.focus();
}

function fecharPolitica() {
  politicaSelecionada.value = null;
  nextTick(() => elementoAnteriorModal?.focus());
}

/** Pesos de nice -20 a +19, conforme a tabela do kernel Linux. */
const pesosNice = [
  88761, 71755, 56483, 46273, 36291,
  29154, 23254, 18705, 14949, 11916,
  9548, 7620, 6100, 4904, 3906,
  3121, 2501, 1991, 1586, 1277,
  1024, 820, 655, 526, 423,
  335, 272, 215, 172, 137,
  110, 87, 70, 56, 45,
  36, 29, 23, 18, 15,
];

const valoresNice = Array.from({ length: 40 }, (_, i) => i - 20);
const linhasPesos = Array.from({ length: 20 }, (_, i) => ({
  niceA: i - 20,
  pesoA: pesosNice[i],
  niceB: i,
  pesoB: pesosNice[i + 20],
}));
const configuracoes = reactive({
  cfs: [
    { nome: "A", nice: 0, fatia: 4 },
    { nome: "B", nice: 0, fatia: 4 },
    { nome: "C", nice: 0, fatia: 2 },
  ],
  eevdf: [
    { nome: "A", nice: 0, fatia: 4 },
    { nome: "B", nice: 0, fatia: 4 },
    { nome: "C", nice: 0, fatia: 2 },
  ],
});

function pesoDeNice(nice) {
  return pesosNice[Number(nice) + 20];
}

function formatarNumero(valor, casas = 2) {
  return Number(valor).toFixed(casas).replace(".", ",");
}

/** Estado didático independente para cada escalonador. */
const simulacoes = reactive({
  cfs: { tempo: 0, tarefas: [], historico: [], ultimo: null, ativa: false, velocidade: 700 },
  eevdf: { tempo: 0, tarefas: [], historico: [], ultimo: null, ativa: false, velocidade: 700 },
});
const processoDetalhadoCfs = ref("A");
const tarefaDetalhadaCfs = computed(() =>
  simulacoes.cfs.tarefas.find((tarefa) => tarefa.nome === processoDetalhadoCfs.value),
);
const proximaTarefaCfs = computed(() => escolherTarefa("cfs"));
const processoDetalhadoEevdf = ref("A");
const tarefaDetalhadaEevdf = computed(() =>
  simulacoes.eevdf.tarefas.find((tarefa) => tarefa.nome === processoDetalhadoEevdf.value),
);
const proximaTarefaEevdf = computed(() => escolherTarefa("eevdf"));
const temporizadoresSimulacao = { cfs: undefined, eevdf: undefined };
const EPSILON = 1e-9;

function pararSimulacao(tipo) {
  if (temporizadoresSimulacao[tipo] !== undefined) {
    window.clearInterval(temporizadoresSimulacao[tipo]);
    temporizadoresSimulacao[tipo] = undefined;
  }
  simulacoes[tipo].ativa = false;
}

function reiniciarSimulacao(tipo) {
  pararSimulacao(tipo);
  const simulacao = simulacoes[tipo];
  simulacao.tempo = 0;
  simulacao.historico = [];
  simulacao.ultimo = null;
  simulacao.tarefas = configuracoes[tipo].map((config) => {
    const peso = pesoDeNice(config.nice);
    return {
      nome: config.nome,
      nice: Number(config.nice),
      peso,
      fatia: Number(config.fatia),
      cpu: 0,
      vruntime: 0,
      basePrazo: 0,
      prazo: Number(config.fatia) * 1024 / peso,
    };
  });
}

function pesoTotal(tipo) {
  return simulacoes[tipo].tarefas.reduce((total, tarefa) => total + tarefa.peso, 0);
}

function parcelaIdeal(tipo, tarefa) {
  const total = pesoTotal(tipo);
  return total ? tarefa.peso / total : 0;
}

/** Lag em tempo de serviço, no cenário simplificado com todas as tarefas prontas. */
function lagDidatico(tipo, tarefa) {
  return simulacoes[tipo].tempo * parcelaIdeal(tipo, tarefa) - tarefa.cpu;
}

function tarefaElegivel(tipo, tarefa) {
  return lagDidatico(tipo, tarefa) >= -EPSILON;
}

function escolherTarefa(tipo) {
  const tarefas = simulacoes[tipo].tarefas;
  if (!tarefas.length) return null;
  if (tipo === "cfs") {
    return [...tarefas].sort((a, b) => a.vruntime - b.vruntime || a.nome.localeCompare(b.nome))[0];
  }
  const elegiveis = tarefas.filter((tarefa) => tarefaElegivel(tipo, tarefa));
  return elegiveis.sort((a, b) => a.prazo - b.prazo || a.nome.localeCompare(b.nome))[0] ?? null;
}

/** Um passo representa 1 ms simulado, não um evento medido do kernel. */
function executarPasso(tipo) {
  const simulacao = simulacoes[tipo];
  const tarefa = escolherTarefa(tipo);
  if (!tarefa) {
    pararSimulacao(tipo);
    return;
  }
  const anterior = tarefa.vruntime;
  const incremento = 1024 / tarefa.peso;
  const prazoEscolhido = tarefa.prazo;
  const lagAntes = lagDidatico(tipo, tarefa);
  tarefa.cpu += 1;
  tarefa.vruntime += incremento;
  simulacao.tempo += 1;
  simulacao.ultimo = { nome: tarefa.nome, anterior, incremento, atual: tarefa.vruntime, prazoEscolhido, lagAntes };
  simulacao.historico.push(tarefa.nome);
  if (simulacao.historico.length > 30) simulacao.historico.shift();

  // Neste modelo, ao alcançar o prazo, uma nova fatia gera outro prazo.
  if (tipo === "eevdf" && tarefa.vruntime + EPSILON >= tarefa.prazo) {
    tarefa.basePrazo = tarefa.vruntime;
    tarefa.prazo = tarefa.basePrazo + tarefa.fatia * 1024 / tarefa.peso;
  }
}

function iniciarSimulacao(tipo) {
  if (simulacoes[tipo].ativa) return;
  simulacoes[tipo].ativa = true;
  temporizadoresSimulacao[tipo] = window.setInterval(
    () => executarPasso(tipo),
    simulacoes[tipo].velocidade,
  );
}

function alternarSimulacao(tipo) {
  if (simulacoes[tipo].ativa) pararSimulacao(tipo);
  else iniciarSimulacao(tipo);
}

function selecionarCenario(tipo, diferentes) {
  configuracoes[tipo].forEach((config) => {
    config.nice = diferentes && config.nome === "B" ? 10 : 0;
  });
  reiniciarSimulacao(tipo);
}

watch(() => configuracoes.cfs, () => reiniciarSimulacao("cfs"), { deep: true, flush: "sync" });
watch(() => configuracoes.eevdf, () => reiniciarSimulacao("eevdf"), { deep: true, flush: "sync" });
watch(() => simulacoes.cfs.velocidade, () => {
  if (simulacoes.cfs.ativa) { pararSimulacao("cfs"); iniciarSimulacao("cfs"); }
});
watch(() => simulacoes.eevdf.velocidade, () => {
  if (simulacoes.eevdf.ativa) { pararSimulacao("eevdf"); iniciarSimulacao("eevdf"); }
});
reiniciarSimulacao("cfs");
reiniciarSimulacao("eevdf");

const sequenciasEstados = {
  fcfs: [
    { tempo: 0, titulo: "A recebe a CPU", descricao: "A e B estavam prontas; C já estava em espera. A é escolhida primeiro.", tarefas: { A: "execucao", B: "pronto", C: "espera" }, fila: ["B"], transicoes: ["despacho"] },
    { tempo: 2, titulo: "C fica pronta", descricao: "A espera de C termina. Sem preempção, A continua executando e C entra após B na fila.", tarefas: { A: "execucao", B: "pronto", C: "pronto" }, fila: ["B", "C"], transicoes: ["despertar"] },
    { tempo: 6, titulo: "A termina", descricao: "A conclui seus 6 ms de CPU; B é despachada.", tarefas: { A: "finalizado", B: "execucao", C: "pronto" }, fila: ["C"], transicoes: ["termino", "despacho"] },
    { tempo: 10, titulo: "B termina", descricao: "B conclui seus 4 ms de CPU; C recebe a vCPU.", tarefas: { A: "finalizado", B: "finalizado", C: "execucao" }, fila: [], transicoes: ["termino", "despacho"] },
    { tempo: 11, titulo: "C termina", descricao: "C conclui seu 1 ms de CPU; o cenário termina.", tarefas: { A: "finalizado", B: "finalizado", C: "finalizado" }, fila: [], transicoes: ["termino"] },
  ],
  rr: [
    { tempo: 0, titulo: "A recebe a CPU", descricao: "A e B estavam prontas; C já estava em espera. A recebe uma fatia de até 2 ms.", tarefas: { A: "execucao", B: "pronto", C: "espera" }, fila: ["B"], transicoes: ["despacho"] },
    { tempo: 2, titulo: "C desperta e A é preemptada", descricao: "C entra na fila antes de A voltar ao final; B recebe a vCPU.", tarefas: { A: "pronto", B: "execucao", C: "pronto" }, fila: ["C", "A"], transicoes: ["despertar", "preempcao", "despacho"] },
    { tempo: 4, titulo: "B é preemptada", descricao: "B usa sua fatia e retorna à fila; C recebe a vCPU.", tarefas: { A: "pronto", B: "pronto", C: "execucao" }, fila: ["A", "B"], transicoes: ["preempcao", "despacho"] },
    { tempo: 5, titulo: "C termina", descricao: "C conclui seu 1 ms de CPU; A recebe a próxima fatia.", tarefas: { A: "execucao", B: "pronto", C: "finalizado" }, fila: ["B"], transicoes: ["termino", "despacho"] },
    { tempo: 7, titulo: "A é preemptada", descricao: "A retorna à fila ainda precisando de CPU; B executa.", tarefas: { A: "pronto", B: "execucao", C: "finalizado" }, fila: ["A"], transicoes: ["preempcao", "despacho"] },
    { tempo: 9, titulo: "B termina", descricao: "B conclui seu trabalho; A recebe a CPU novamente.", tarefas: { A: "execucao", B: "finalizado", C: "finalizado" }, fila: [], transicoes: ["termino", "despacho"] },
    { tempo: 11, titulo: "A termina", descricao: "A conclui seus 6 ms de CPU; o cenário termina.", tarefas: { A: "finalizado", B: "finalizado", C: "finalizado" }, fila: [], transicoes: ["termino"] },
  ],
};
const intervalosEstados = {
  fcfs: [{ nome: "A", inicio: 0, fim: 6 }, { nome: "B", inicio: 6, fim: 10 }, { nome: "C", inicio: 10, fim: 11 }],
  rr: [{ nome: "A", inicio: 0, fim: 2 }, { nome: "B", inicio: 2, fim: 4 }, { nome: "C", inicio: 4, fim: 5 }, { nome: "A", inicio: 5, fim: 7 }, { nome: "B", inicio: 7, fim: 9 }, { nome: "A", inicio: 9, fim: 11 }],
};
const modoEstados = ref("fcfs");
const fasesEstados = computed(() => sequenciasEstados[modoEstados.value]);
const faseEstado = ref(0);
const simulacaoAtiva = ref(false);
let temporizadorEstados;
const faseAtual = computed(() => fasesEstados.value[faseEstado.value]);

function corProcesso(processo) {
  const paleta = [
    "#60a5fa",
    "#f59e0b",
    "#34d399",
    "#f472b6",
    "#a78bfa",
    "#22d3ee",
  ];

  const indice = processo.charCodeAt(0) % paleta.length;

  return paleta[indice];
}

function avancar() {
  slideAtual.value = (slideAtual.value + 1) % totalSlides;
}

function voltar() {
  slideAtual.value =
    slideAtual.value === 0 ? totalSlides - 1 : slideAtual.value - 1;
}

function irPara(indice) {
  slideAtual.value = indice;
}

function iniciarSimulacaoEstados() {
  pararSimulacaoEstados();
  faseEstado.value = 0;
  continuarSimulacaoEstados();
}

function pararSimulacaoEstados() {
  if (temporizadorEstados !== undefined) {
    window.clearInterval(temporizadorEstados);
    temporizadorEstados = undefined;
  }
  simulacaoAtiva.value = false;
}

function continuarSimulacaoEstados() {
  if (simulacaoAtiva.value || faseEstado.value === fasesEstados.value.length - 1) return;
  simulacaoAtiva.value = true;
  temporizadorEstados = window.setInterval(() => {
    if (faseEstado.value < fasesEstados.value.length - 1) faseEstado.value++;
    if (faseEstado.value === fasesEstados.value.length - 1) pararSimulacaoEstados();
  }, 4000);
}

function mudarFaseEstado(direcao) {
  pararSimulacaoEstados();
  faseEstado.value = Math.max(0, Math.min(fasesEstados.value.length - 1, faseEstado.value + direcao));
}

function estadoAtivo(estado) {
  return Object.values(faseAtual.value.tarefas).includes(estado);
}

function estadoProcesso(processo) {
  return faseAtual.value.tarefas[processo];
}

function textoEstado(estado) {
  const textos = {
    criado: "Criado",
    pronto: "Pronto",
    execucao: "Em execução",
    espera: "Em espera",
    finalizado: "Finalizado",
  };

  return textos[estado];
}

function lidarTeclado(evento) {
  if (politicaSelecionada.value) {
    if (evento.key === "Escape") {
      evento.preventDefault();
      fecharPolitica();
    }
    return;
  }

  if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(evento.target?.tagName)) return;

  if (evento.key === "ArrowRight" || evento.key === " ") {
    evento.preventDefault();
    avancar();
  }

  if (evento.key === "ArrowLeft") {
    evento.preventDefault();
    voltar();
  }

  if (evento.key === "Home") {
    evento.preventDefault();
    irPara(0);
  }

  if (evento.key === "End") {
    evento.preventDefault();
    irPara(totalSlides - 1);
  }
}

watch(modoEstados, () => {
  if (slideAtual.value === 8) iniciarSimulacaoEstados();
  else faseEstado.value = 0;
});

watch(slideAtual, (indice) => {
  if (politicaSelecionada.value) fecharPolitica();
  if (indice !== 13) pararSimulacao("cfs");
  if (indice !== 15) pararSimulacao("eevdf");
  if (indice === 8) {
    iniciarSimulacaoEstados();
    return;
  }

  pararSimulacaoEstados();
});

onMounted(() => {
  window.addEventListener("keydown", lidarTeclado);

  if (slideAtual.value === 8) {
    iniciarSimulacaoEstados();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", lidarTeclado);
  pararSimulacaoEstados();
  pararSimulacao("cfs");
  pararSimulacao("eevdf");
});
</script>

<template>
  <main class="presentation">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">◉</span>

        <div>
          <strong>Laboratório de Escalonamento</strong>
          <span>CFS, EEVDF e concorrência no Linux</span>
        </div>
      </div>

      <div class="slide-counter">
        <span>{{ slideAtual + 1 }}</span>
        <small>/ {{ totalSlides }}</small>
      </div>
    </header>

    <section class="stage">
      <Transition name="slide" mode="out-in">
        <!-- Slide 1 -->
        <article v-if="slideAtual === 0" key="slide-1" class="slide cover-slide">
          <div class="cover-grid">
            <div class="cover-copy">
              <span class="eyebrow">SISTEMAS OPERACIONAIS</span>

              <h1>
                Escalonamento de Processos
                <strong>no Linux</strong>
              </h1>

              <p>
                Uma análise prática de processos, concorrência, CFS, EEVDF,
                prioridades e responsividade.
              </p>

              <div class="cover-tags">
                <span>Ubuntu</span>
                <span>Linux</span>
                <span>C</span>
                <span>Node.js</span>
                <span>Vue</span>
              </div>
            </div>

            <div class="cover-orbit">
              <div class="orbit orbit-a"></div>
              <div class="orbit orbit-b"></div>
              <div class="orbit orbit-c"></div>

              <div class="cover-cpu">
                <span>vCPU 0</span>
                <strong>Scheduler</strong>
              </div>

              <span
                class="cover-process process-a"
                :style="{ '--process-color': corProcesso('A') }"
              >
                A
              </span>

              <span
                class="cover-process process-b"
                :style="{ '--process-color': corProcesso('B') }"
              >
                B
              </span>

              <span
                class="cover-process process-c"
                :style="{ '--process-color': corProcesso('C') }"
              >
                C
              </span>
            </div>
          </div>

          <footer class="cover-footer">
            <span>Universidade Salvador — UNIFACS</span>
            <span>Laboratório experimental com CFS e EEVDF</span>
          </footer>
        </article>

        <!-- Slide 2 -->
        <article v-else-if="slideAtual === 1" key="slide-2" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">FUNDAMENTOS</span>
            <h1>Arquitetura de um sistema computacional</h1>
            <p class="question">Como aplicações, sistema operacional e hardware trabalham juntos?</p>
          </div>
          <div class="architecture-layout">
            <div class="architecture-stack">
              <div class="layer application-layer">
                <span>ESPAÇO DO USUÁRIO</span><strong>Aplicações e shell</strong>
                <p>Programas executam instruções em modo usuário; o shell é uma aplicação para interpretar comandos.</p>
              </div>
              <div class="arrow-down">↓ solicitações pela interface de chamadas de sistema</div>
              <div class="layer kernel-layer">
                <span>MODO PRIVILEGIADO</span><strong>Kernel</strong>
                <div class="kernel-services"><span>Processos</span><span>Memória</span><span>Arquivos</span><span>Escalonamento</span><span>Drivers</span></div>
              </div>
              <div class="arrow-down">↓ gerência e acesso controlado</div>
              <div class="layer hardware-layer">
                <span>RECURSOS FÍSICOS OU VIRTUAIS</span><strong>Hardware</strong>
                <div class="hardware-items"><span>CPU</span><span>RAM</span><span>Disco</span><span>Rede</span><span>Temporizador</span></div>
              </div>
            </div>
            <aside class="panel diagram-explainer">
              <span class="panel-label">EXEMPLO · INICIAR UM PROGRAMA</span>
              <ol>
                <li>Uma pessoa digita um comando no shell.</li>
                <li>O shell solicita ao kernel a criação e a execução do programa.</li>
                <li>O kernel organiza memória, recursos e escalonamento.</li>
                <li>A CPU executa as instruções do programa.</li>
              </ol>
              <p>A CPU executa instruções comuns da aplicação diretamente; chamadas de sistema são usadas quando ela precisa solicitar serviços ao kernel.</p>
            </aside>
          </div>
        </article>

        <!-- Slide 3 -->
        <article v-else-if="slideAtual === 2" key="slide-3" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">PROCESSOS</span>
            <h1>Do programa ao processo</h1>
            <p class="question">O que o kernel administra quando um programa é iniciado?</p>
          </div>
          <div class="process-flow">
            <div class="flow-card executable"><span class="panel-label">PROGRAMA</span><strong>Arquivo executável</strong><p>Instruções e dados armazenados.</p></div>
            <div class="flow-arrow">→</div>
            <div class="flow-card kernel-create"><span class="panel-label">KERNEL</span><strong>Criação e carregamento</strong><p>Organiza os recursos e a imagem do programa.</p></div>
            <div class="flow-arrow">→</div>
            <div class="flow-card process-box"><span class="panel-label">PROCESSO</span><strong>Ambiente de execução</strong><p>Recursos, espaço virtual e uma ou mais threads.</p></div>
          </div>
          <div class="three-columns">
            <section class="panel"><span class="panel-label">CONTEXTO DE SOFTWARE</span><p>Identificação, estado, permissões, prioridade e recursos administrados pelo kernel.</p></section>
            <section class="panel"><span class="panel-label">ESPAÇO DE ENDEREÇAMENTO</span><p>Regiões virtuais para código, dados, área dinâmica e pilhas.</p></section>
            <section class="panel"><span class="panel-label">CONTEXTO DE EXECUÇÃO</span><p>Cada thread possui posição no código e registradores; seu estado é preservado para retomada.</p></section>
          </div>
          <div class="highlight-strip"><strong>PCB:</strong> modelo conceitual das informações administrativas. No Linux elas são distribuídas em estruturas do kernel, incluindo <code>task_struct</code>.</div>
          <p class="simulation-note">No Linux, criar um processo e carregar um programa são etapas distintas: <code>execve()</code> substitui a imagem de um processo existente.</p>
        </article>

        <!-- Slide 4 -->
        <article v-else-if="slideAtual === 3" key="slide-4" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">PROCESSOS E THREADS</span>
            <h1>Recursos compartilhados e fluxos independentes</h1>
            <p class="question">O que pertence ao processo e o que pertence a cada thread?</p>
          </div>
          <div class="thread-layout">
            <div class="process-container">
              <span class="container-title">Processo · unidade de recursos e isolamento</span>
              <div class="shared-area">
                <strong>Recursos compartilhados</strong>
                <div><span>Espaço virtual</span><span>Código</span><span>Dados globais</span><span>Área dinâmica</span><span>Arquivos</span></div>
              </div>
              <div class="thread-cards">
                <div class="thread-card"><strong>Thread 1</strong><span>Posição no código</span><span>Registradores</span><span>Pilha própria</span><span>Estado de execução</span></div>
                <div class="thread-card"><strong>Thread 2</strong><span>Posição no código</span><span>Registradores</span><span>Pilha própria</span><span>Estado de execução</span></div>
              </div>
            </div>
            <aside class="panel explanation-panel">
              <span class="panel-label">NO LINUX</span>
              <p><strong>Threads</strong> são fluxos de execução que o kernel pode escalonar separadamente.</p>
              <p>Threads do mesmo processo compartilham dados e precisam coordenar acessos. Uma pilha própria não é uma barreira absoluta entre elas.</p>
              <p>Processos distintos podem se comunicar por pipes, sockets ou memória explicitamente compartilhada.</p>
              <p>No laboratório, A e B são processos separados; cada worker possui sua thread principal.</p>
            </aside>
          </div>
        </article>

        <!-- Slide 5 -->
        <article v-else-if="slideAtual === 4" key="slide-5" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">EXECUÇÃO</span>
            <h1>Concorrência e paralelismo</h1>
            <p class="question">
              Como duas threads se comportam com uma ou várias vCPUs?
            </p>
          </div>

          <div class="comparison-grid">
            <section class="panel concurrency-panel">
              <span class="panel-label">UMA vCPU — CONCORRÊNCIA</span>
              <h2>Alternância ao longo do tempo</h2>

              <div class="cpu-track">
                <span class="cpu-label">vCPU 0</span>
                <div class="timeline">
                  <span class="time-block process-a">T1</span>
                  <span class="time-block process-b">T2</span>
                  <span class="time-block process-a">T1</span>
                  <span class="time-block process-b">T2</span>
                  <span class="time-block process-a">T1</span>
                </div>
              </div>

              <p>
                Apenas uma thread ocupa a vCPU em cada instante. A sensação de
                simultaneidade vem da alternância rápida.
              </p>
            </section>

            <section class="panel parallelism-panel">
              <span class="panel-label">DUAS vCPUS — PARALELISMO</span>
              <h2>Execução simultânea real</h2>

              <div class="multi-cpu">
                <div class="cpu-track">
                  <span class="cpu-label">vCPU 0</span>
                  <div class="timeline">
                    <span class="time-block process-a full">T1 executando</span>
                  </div>
                </div>

                <div class="cpu-track">
                  <span class="cpu-label">vCPU 1</span>
                  <div class="timeline">
                    <span class="time-block process-b full">T2 executando</span>
                  </div>
                </div>
              </div>

              <p>
                Threads diferentes podem executar em paralelo, desde que haja
                mais de uma CPU lógica disponível.
              </p>
            </section>
          </div>

          <div class="highlight-strip">
            <strong>Regra:</strong>
            uma mesma thread pode migrar entre vCPUs ao longo do tempo, mas não
            pode executar simultaneamente em duas vCPUs.
          </div>

          <div class="lab-callout">
            No laboratório, A, B e C são limitados à vCPU 0. Portanto, eles
            concorrem entre si; não executam em paralelo.
          </div>
        </article>

        <!-- Slide 6 -->
        <article v-else-if="slideAtual === 5" key="slide-6" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">MEMÓRIA VIRTUAL</span>
            <h1>Do endereço virtual à RAM</h1>
            <p class="question">Como processos diferentes podem usar o mesmo endereço virtual com segurança?</p>
          </div>
          <div class="memory-diagram">
            <section class="panel memory-example">
              <span class="panel-label">PROCESSO A</span>
              <strong>Endereço virtual 0x1000</strong>
              <span>↓ tabela de páginas A</span><code>página virtual → frame 24</code>
            </section>
            <section class="panel mmu-example">
              <span class="panel-label">CPU · MMU</span>
              <strong>Traduz e verifica permissões</strong>
              <p>O kernel configura os mapeamentos e mantém as tabelas.</p>
            </section>
            <section class="panel memory-example">
              <span class="panel-label">PROCESSO B</span>
              <strong>Endereço virtual 0x1000</strong>
              <span>↓ tabela de páginas B</span><code>página virtual → frame 47</code>
            </section>
          </div>
          <div class="panel ram-example">
            <span class="panel-label">RAM FÍSICA · FRAMES ILUSTRATIVOS</span>
            <div class="ram-frames">
              <div><small>Frame 03</small><strong>Kernel</strong></div>
              <div class="ram-a"><small>Frame 24</small><strong>Processo A</strong></div>
              <div><small>Frame 32</small><strong>Outros dados</strong></div>
              <div class="ram-b"><small>Frame 47</small><strong>Processo B</strong></div>
              <div><small>Frame 80</small><strong>Livre / outro uso</strong></div>
            </div>
            <p>O mesmo endereço virtual pode apontar para frames diferentes. Alguns mapeamentos podem ser compartilhados intencionalmente.</p>
          </div>
          <p class="simulation-note">O desenho é ilustrativo: a RAM não é dividida em faixas fixas e contíguas para cada processo ou para o kernel.</p>
        </article>

        <!-- Slide 7 -->
        <article v-else-if="slideAtual === 6" key="slide-7" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">ALOCAÇÃO DINÂMICA</span>
            <h1>Do malloc às páginas de memória</h1>
            <p class="question">Como uma solicitação de 400 bytes se relaciona com páginas e frames?</p>
          </div>
          <div class="allocation-layout">
            <section class="panel code-panel">
              <span class="panel-label">PROGRAMA C</span>
              <pre><code>int *vetor = malloc(100 * sizeof(*vetor));

if (vetor != NULL) {
  vetor[0] = 10;
  free(vetor);
}</code></pre>
              <p>Se <code>int</code> ocupar 4 bytes, a solicitação é de 400 bytes. <code>malloc()</code> pode falhar e retornar <code>NULL</code>.</p>
            </section>
            <section class="panel allocator-panel">
              <span class="panel-label">ALOCADOR · KERNEL · RAM</span>
              <ol>
                <li>A biblioteca procura um bloco virtual disponível.</li>
                <li>Se necessário, solicita mais memória ao kernel.</li>
                <li>O programa recebe um endereço virtual; frames podem ser associados sob demanda.</li>
              </ol>
              <span class="panel-label">EXEMPLO · PÁGINAS DE 4 KiB</span>
              <div class="pages-illustration">
                <div><span>Página virtual 1</span><strong>256 bytes</strong></div>
                <div><span>Página virtual 2</span><strong>144 bytes</strong></div>
              </div>
              <p>Exemplo ilustrativo: o bloco contínuo de 400 bytes atravessa duas páginas, que podem apontar para frames diferentes.</p>
            </section>
          </div>
          <div class="highlight-strip"><strong>free():</strong> libera o bloco para o alocador; isso não garante devolução imediata ao kernel.</div>
          <p class="simulation-note">Uma página cheia não obriga nova solicitação ao kernel; o alocador pode usar outra região disponível ou um bloco que atravesse páginas.</p>
        </article>

        <!-- Slide 8 -->
        <article v-else-if="slideAtual === 7" key="slide-8" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">PROTEÇÃO DE MEMÓRIA</span>
            <h1>Proteção e falhas de página</h1>
            <p class="question">O que acontece quando uma thread acessa um endereço virtual?</p>
          </div>
          <div class="three-columns protection-cases">
            <section class="panel">
              <span class="panel-label">1 · ACESSO PERMITIDO</span><h2>Página presente</h2>
              <p>A MMU traduz o endereço e verifica as permissões. O acesso prossegue.</p>
            </section>
            <section class="panel">
              <span class="panel-label">2 · PÁGINA AUSENTE</span><h2>Falha tratável</h2>
              <p>Uma falha de página transfere o controle ao kernel, que pode providenciar o mapeamento ou buscar os dados.</p>
            </section>
            <section class="panel">
              <span class="panel-label">3 · ACESSO INVÁLIDO</span><h2>Violação de acesso</h2>
              <p>O kernel pode enviar <strong>SIGSEGV</strong>: sinal que, por padrão, encerra o processo.</p>
            </section>
          </div>
          <div class="comparison-grid protection-responsibilities">
            <section class="panel"><span class="panel-label">HARDWARE + KERNEL</span><p>A CPU e a MMU verificam tradução e permissões; o kernel configura os mapeamentos e trata as falhas.</p></section>
            <section class="panel"><span class="panel-label">THREADS + PROGRAMA</span><p>Threads do mesmo processo compartilham o espaço virtual. O programa precisa respeitar limites e sincronizar dados compartilhados.</p></section>
          </div>
          <p class="bottom-message">Uma falha de página pode ser resolvida. Já um acesso fora de um objeto pode corromper dados sem gerar SIGSEGV, se a página continuar acessível.</p>
          <p class="simulation-note">Quando precisa aguardar um evento, uma tarefa pode deixar a CPU para outra tarefa pronta.</p>
        </article>

        <!-- Slide 9 -->
        <article v-else-if="slideAtual === 8" key="slide-9" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">CICLO DE VIDA</span>
            <h1>Estados de execução de uma tarefa</h1>
            <p class="question">
              Em sistemas multiprogramáveis, várias tarefas podem estar prontas; a política de escalonamento define os critérios para escolher qual receberá a CPU.
            </p>
          </div>

          <div class="state-simulation">
            <div class="state-mode-selector" role="group" aria-label="Política da simulação">
              <button type="button" :class="{ active: modoEstados === 'fcfs' }" :aria-pressed="modoEstados === 'fcfs'" @click="modoEstados = 'fcfs'">Não preemptivo · FCFS</button>
              <button type="button" :class="{ active: modoEstados === 'rr' }" :aria-pressed="modoEstados === 'rr'" @click="modoEstados = 'rr'">Preemptivo · Round Robin</button>
            </div>
            <p class="simulation-note">Uma vCPU: A pronta precisa de 6 ms; B pronta precisa de 4 ms; C já está em espera, desperta aos 2 ms e precisa de 1 ms. No Round Robin, a fatia é 2 ms.</p>
            <div class="simulation-header">
              <div>
                <span class="panel-label">SIMULAÇÃO AUTOMÁTICA</span>
                <h2>{{ faseAtual.titulo }}</h2>
                <p>{{ faseAtual.descricao }}</p>
              </div>

              <span class="simulation-progress">
                {{ faseAtual.tempo }} ms · evento {{ faseEstado + 1 }} / {{ fasesEstados.length }}
              </span>
            </div>

            <svg
              class="state-diagram"
              viewBox="0 0 1100 470"
              role="img"
              aria-label="Fluxo de estados de um processo"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="8"
                  refX="9"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0,0 L10,4 L0,8 Z" fill="#36d399" />
                </marker>
              </defs>

              <path
                d="M240 120 H320"
                class="state-arrow"
                :class="{ 'arrow-active': faseAtual.transicoes.includes('admissao') }"
                marker-end="url(#arrowhead)"
              />

              <path
                d="M530 120 H640"
                class="state-arrow"
                :class="{ 'arrow-active': faseAtual.transicoes.includes('despacho') }"
                marker-end="url(#arrowhead)"
              />

              <path
                d="M790 175 V265"
                class="state-arrow"
                :class="{ 'arrow-active': faseAtual.transicoes.includes('espera') }"
                marker-end="url(#arrowhead)"
              />

              <path
                d="M640 320 H425 V170"
                class="state-arrow"
                :class="{ 'arrow-active': faseAtual.transicoes.includes('despertar') }"
                marker-end="url(#arrowhead)"
              />

              <path
                d="M700 170 V220 H480 V170"
                class="state-arrow"
                :class="{ 'arrow-active': faseAtual.transicoes.includes('preempcao') }"
                marker-end="url(#arrowhead)"
              />

              <path
                d="M890 120 H950"
                class="state-arrow"
                :class="{ 'arrow-active': faseAtual.transicoes.includes('termino') }"
                marker-end="url(#arrowhead)"
              />

              <text x="272" y="102" class="arrow-text">admissão</text>
              <text x="558" y="102" class="arrow-text">despacho</text>
              <text x="810" y="225" class="arrow-text">I/O, sleep ou evento</text>
              <text x="535" y="305" class="arrow-text">evento concluído</text>
              <text x="590" y="210" class="arrow-text">preempção</text>
              <text x="920" y="102" class="arrow-text">término</text>

              <g :class="{ active: estadoAtivo('criado') }">
                <rect x="55" y="70" width="185" height="100" rx="50" class="state-node" />
                <text x="147" y="126" class="state-title">Criado</text>
              </g>

              <g :class="{ active: estadoAtivo('pronto') }">
                <rect x="320" y="70" width="210" height="100" rx="50" class="state-node" />
                <text x="425" y="126" class="state-title">Pronto</text>
              </g>

              <g :class="{ active: estadoAtivo('execucao') }">
                <rect x="640" y="70" width="250" height="100" rx="50" class="state-node" />
                <text x="765" y="126" class="state-title">Em execução</text>
              </g>

              <g :class="{ active: estadoAtivo('espera') }">
                <rect x="640" y="270" width="185" height="100" rx="50" class="state-node" />
                <text x="732" y="326" class="state-title">Em espera</text>
              </g>

              <g :class="{ active: estadoAtivo('finalizado') }">
                <rect x="950" y="70" width="145" height="100" rx="50" class="state-node" />
                <text x="1022" y="126" class="state-title">Finalizado</text>
              </g>
            </svg>

            <div class="state-current">
              <span>vCPU 0: <strong>{{ Object.keys(faseAtual.tarefas).find((nome) => faseAtual.tarefas[nome] === 'execucao') ?? 'ociosa' }}</strong></span>
              <span>Fila de prontas: <strong>{{ faseAtual.fila.length ? faseAtual.fila.join(' → ') : 'vazia' }}</strong></span>
            </div>
            <div class="process-state-cards">
              <div
                v-for="processo in ['A', 'B', 'C']"
                :key="processo"
                class="process-state-card"
                :style="{ '--process-color': corProcesso(processo) }"
              >
                <span>Processo {{ processo }}</span>
                <strong>{{ textoEstado(estadoProcesso(processo)) }}</strong>
              </div>
            </div>

            <div class="state-timeline">
              <span v-for="(intervalo, indice) in intervalosEstados[modoEstados]" :key="indice"
                :style="{ flex: intervalo.fim - intervalo.inicio, backgroundColor: corProcesso(intervalo.nome), opacity: faseAtual.tempo >= intervalo.fim ? 1 : (faseAtual.tempo >= intervalo.inicio ? 0.7 : 0.25) }">
                {{ intervalo.nome }} · {{ intervalo.inicio }}–{{ intervalo.fim }}
              </span>
            </div>
            <div class="simulation-controls" aria-label="Controles da simulação">
              <button type="button" @click="mudarFaseEstado(-1)" :disabled="faseEstado === 0">Anterior</button>
              <button v-if="simulacaoAtiva" type="button" @click="pararSimulacaoEstados">Pausar</button>
              <button v-else type="button" @click="continuarSimulacaoEstados" :disabled="faseEstado === fasesEstados.length - 1">Continuar</button>
              <button type="button" @click="mudarFaseEstado(1)" :disabled="faseEstado === fasesEstados.length - 1">Próximo</button>
              <button type="button" @click="iniciarSimulacaoEstados">Reiniciar</button>
            </div>

            <p class="simulation-note">
              Simulação didática: sem outras tarefas ou custo de troca. No Round Robin, C entra na fila antes de A retornar no instante 2 ms. Não preemptivo não significa ausência de interrupções. O relógio visual é independente do tempo simulado.
            </p>
          </div>
        </article>

        <!-- Slide 10 -->
        <article v-else-if="slideAtual === 9" key="slide-10" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">ESCALONAMENTO</span>
            <h1>Como o kernel escolhe a próxima tarefa?</h1>
            <p class="question">
              Quando há tarefas prontas, como decidir quem executa na vCPU 0?
            </p>
          </div>

          <div class="scheduler-flow">
            <div class="scheduler-box">
              <span class="panel-label">EVENTO</span>
              <strong>Preempção, bloqueio, término ou despertar</strong>
            </div>

            <div class="flow-arrow">→</div>

            <div class="scheduler-box queue-box">
              <span class="panel-label">TAREFAS PRONTAS</span>
              <div class="queue-processes">
                <span class="process-a">A</span>
                <span class="process-b">B</span>
              </div>
              <small>C está em espera e não disputa a CPU.</small>
            </div>

            <div class="flow-arrow">→</div>

            <div class="scheduler-box policy-box">
              <span class="panel-label">POLÍTICA</span>
              <strong>Seleciona uma candidata</strong>
              <small>prioridade, serviço, prazo ou ordem</small>
            </div>

            <div class="flow-arrow">→</div>

            <div class="scheduler-box cpu-box">
              <span class="panel-label">DESPACHO</span>
              <strong>Exemplo: A → vCPU 0</strong>
            </div>
          </div>

          <div class="highlight-strip"><strong>Critério:</strong> o que avaliar · <strong>Política:</strong> regra de escolha · <strong>Despacho:</strong> iniciar ou retomar a tarefa escolhida.</div>
          <h2 class="card-group-title">Políticas de escalonamento</h2>
          <div class="policy-grid compact-policy-grid">
            <button
              v-for="politica in politicas"
              :key="politica.nome"
              type="button"
              class="policy-card policy-trigger"
              aria-haspopup="dialog"
              @click="abrirPolitica(politica)"
            >
              <strong>{{ politica.nome }}</strong>
              <p>{{ politica.descricao }}</p>
              <small>Selecionar para saber mais →</small>
            </button>
          </div>

          <Teleport to="body">
            <div v-if="politicaSelecionada" class="policy-overlay" @click.self="fecharPolitica">
              <section
                class="policy-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="policy-title"
                @keydown.esc.stop.prevent="fecharPolitica"
                @keydown.tab.prevent="botaoFecharPolitica?.focus()"
              >
                <div class="policy-dialog-header">
                  <div>
                    <span class="panel-label">{{ politicaSelecionada.preempcao ? 'POLÍTICA DE ESCALONAMENTO' : 'CRITÉRIO OU MÉTRICA' }}</span>
                    <h2 id="policy-title">{{ politicaSelecionada.nome }}</h2>
                  </div>
                  <button ref="botaoFecharPolitica" type="button" aria-label="Fechar" @click="fecharPolitica">×</button>
                </div>
                <dl>
                  <dt>Como funciona</dt><dd>{{ politicaSelecionada.funcionamento }}</dd>
                  <template v-if="politicaSelecionada.preempcao"><dt>Preempção</dt><dd>{{ politicaSelecionada.preempcao }}</dd></template>
                  <dt>Exemplo</dt><dd>{{ politicaSelecionada.exemplo }}</dd>
                  <template v-if="politicaSelecionada.vantagem"><dt>Vantagem</dt><dd>{{ politicaSelecionada.vantagem }}</dd></template>
                  <dt>Limitação</dt><dd>{{ politicaSelecionada.limitacao }}</dd>
                </dl>
              </section>
            </div>
          </Teleport>

          <h2 class="card-group-title">Critérios e métricas</h2>
          <div class="metrics-row">
            <button v-for="criterio in criterios" :key="criterio.nome" type="button" aria-haspopup="dialog" @click="abrirPolitica(criterio)">{{ criterio.nome }}</button>
          </div>
        </article>

        <!-- Slide 11 -->
        <article v-else-if="slideAtual === 10" key="slide-11" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">ESCALONAMENTO JUSTO</span>
            <h1>Onde CFS e EEVDF se encaixam?</h1>
            <p class="question">Como os escalonadores do laboratório compartilham a CPU?</p>
          </div>
          <div class="scheduler-overview">
            <div class="overview-level">Sistema de tempo compartilhado</div>
            <span class="overview-arrow">↓</span>
            <div class="overview-level">Escalonamento justo e proporcional no Linux</div>
            <span class="overview-arrow">↓</span>
            <div class="comparison-grid scheduler-comparison">
              <section class="panel">
                <span class="panel-label">CFS · LINUX 6.5</span>
                <h2>Tempo virtual</h2>
                <p>Favorece, em linhas gerais, a tarefa pronta com menor <code>vruntime</code>.</p>
              </section>
              <section class="panel">
                <span class="panel-label">EEVDF · LINUX 7</span>
                <h2>Elegibilidade e prazo</h2>
                <p>Verifica o <code>lag</code> e escolhe pelo menor prazo virtual entre as tarefas elegíveis.</p>
              </section>
            </div>
          </div>
          <div class="highlight-strip">Ambos são preemptivos. O <code>nice</code> influencia o peso e a participação proporcional esperada; não são uma simples fila Round Robin.</div>
          <p class="simulation-note">Os valores reais dependem também das tarefas concorrentes e da configuração do sistema.</p>
        </article>

        <!-- Slide 12 -->
        <article v-else-if="slideAtual === 11" key="slide-12" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">TEMPORIZADOR</span>
            <h1>Quando o kernel reavalia a execução?</h1>
            <p class="question">Como o kernel recupera o controle enquanto uma tarefa executa?</p>
          </div>

          <div class="scheduler-flow timer-flow">
            <div class="scheduler-box"><span class="panel-label">1 · USUÁRIO</span><strong>A executa na vCPU</strong></div>
            <div class="flow-arrow">→</div>
            <div class="scheduler-box"><span class="panel-label">2 · EVENTO</span><strong>Temporizador gera um tick</strong></div>
            <div class="flow-arrow">→</div>
            <div class="scheduler-box"><span class="panel-label">3 · KERNEL</span><strong>Contabiliza o tempo de A</strong></div>
            <div class="flow-arrow">→</div>
            <div class="scheduler-box"><span class="panel-label">4 · DECISÃO</span><strong>A continua ou outra tarefa executa</strong></div>
          </div>

          <div class="comparison-grid timer-details">
            <section class="panel">
              <span class="panel-label">FREQUÊNCIA NOMINAL DO TICK</span>
              <h2>CONFIG_HZ</h2>
              <code>Exemplo: CONFIG_HZ=250 → 1000 / 250 = 4 ms</code>
              <p>É uma configuração do kernel, não a frequência em GHz da CPU física.</p>
              <code>grep '^CONFIG_HZ=' /boot/config-$(uname -r)</code>
            </section>
            <section class="panel">
              <span class="panel-label">REAVALIAÇÃO</span>
              <h2>O tick não obriga uma troca</h2>
              <p>O kernel pode manter A. Bloqueio, término e despertar também podem provocar avaliações.</p>
              <p>Em algumas configurações, ticks podem ser suprimidos em certas situações.</p>
            </section>
          </div>
          <p class="simulation-note">250 Hz é apenas um exemplo; a configuração e os intervalos observados dependem do kernel e do ambiente virtual.</p>
        </article>

        <!-- Slide 13 -->
        <article v-else-if="slideAtual === 12" key="slide-13" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">CFS · CONCEITOS</span>
            <h1>Justiça por tempo virtual</h1>
            <p class="question">Como o CFS distribui a CPU quando as tarefas têm prioridades diferentes?</p>
          </div>

          <div class="comparison-grid cfs-concept-layout">
            <section class="panel">
              <span class="panel-label">NICE E PESO</span>
              <p>O kernel associa cada valor de nice a um peso. Um peso maior representa uma participação proporcional maior na disputa pela CPU.</p>
              <table>
                <thead><tr><th>Nice</th><th>Peso</th></tr></thead>
                <tbody>
                  <tr v-for="nice in [-20, -10, 0, 10, 19]" :key="nice">
                    <td>{{ nice }}</td><td>{{ pesoDeNice(nice) }}</td>
                  </tr>
                </tbody>
              </table>
              <details class="nice-details">
                <summary>Ver tabela completa: nice −20 a +19</summary>
                <table>
                  <thead><tr><th>Nice</th><th>Peso</th><th>Nice</th><th>Peso</th></tr></thead>
                  <tbody>
                    <tr v-for="linha in linhasPesos" :key="linha.niceA">
                      <td>{{ linha.niceA }}</td><td>{{ linha.pesoA }}</td>
                      <td>{{ linha.niceB }}</td><td>{{ linha.pesoB }}</td>
                    </tr>
                  </tbody>
                </table>
              </details>
            </section>

            <section class="panel">
              <span class="panel-label">VRUNTIME</span>
              <h2>Tempo de CPU ajustado pelo peso</h2>
              <div class="vruntime-example">
                <code>Δvruntime ≈ Δtempo de CPU × 1024 / peso</code>
                <code>nice 0 · 1 ms → 1 × 1024 / 1024 = 1 ms</code>
                <code>nice 10 · 1 ms → 1 × 1024 / 110 ≈ 9,31 ms</code>
              </div>
              <p>Para o mesmo tempo de CPU, a tarefa de peso menor acumula vruntime mais rapidamente.</p>
              <p>Em linhas gerais, o CFS favorece a tarefa pronta com o menor vruntime.</p>
            </section>
          </div>
          <div class="highlight-strip">O CFS busca uma distribuição proporcional de CPU ao longo do tempo.</div>
        </article>

        <!-- Slide 14 -->
        <article v-else-if="slideAtual === 13" key="slide-14" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">CFS · SIMULAÇÃO</span>
            <h1>Observe a distribuição de CPU</h1>
            <p class="question">Como o nice altera a parcela ideal e o avanço do vruntime?</p>
          </div>

          <div class="simulator panel">
            <div class="simulator-top">
              <span class="panel-label">A, B E C SEMPRE PRONTOS · UMA VCPU</span>
              <div class="simulator-presets">
                <button type="button" @click="selecionarCenario('cfs', false)">Pesos iguais</button>
                <button type="button" @click="selecionarCenario('cfs', true)">B com nice 10</button>
              </div>
            </div>
            <div class="simulator-table-wrap">
              <table>
                <thead><tr><th>Processo</th><th>Nice</th><th>Peso</th><th>Parcela ideal</th><th>CPU recebida</th><th>Vruntime</th></tr></thead>
                <tbody>
                  <tr v-for="(tarefa, indice) in simulacoes.cfs.tarefas" :key="tarefa.nome">
                    <td :style="{ color: corProcesso(tarefa.nome) }">{{ tarefa.nome }}</td>
                    <td>
                      <select v-model.number="configuracoes.cfs[indice].nice" :aria-label="'Nice do processo ' + tarefa.nome">
                        <option v-for="nice in valoresNice" :key="nice" :value="nice">{{ nice }}</option>
                      </select>
                    </td>
                    <td>{{ tarefa.peso }}</td>
                    <td>{{ formatarNumero(parcelaIdeal('cfs', tarefa) * 100, 4) }}%</td>
                    <td>{{ tarefa.cpu }} ms</td>
                    <td>{{ formatarNumero(tarefa.vruntime, 4) }} ms</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="simulator-share" aria-label="Participação ideal de CPU">
              <span v-for="tarefa in simulacoes.cfs.tarefas" :key="tarefa.nome" :style="{ flex: tarefa.peso, backgroundColor: corProcesso(tarefa.nome) }" :title="tarefa.nome + ': ' + formatarNumero(parcelaIdeal('cfs', tarefa) * 100) + '%'"></span>
            </div>
            <div class="simulator-result" aria-live="polite">
              <span>Tempo simulado: <strong>{{ simulacoes.cfs.tempo }} ms</strong></span>
              <span v-if="escolherTarefa('cfs')">Próxima escolha simplificada: <strong>{{ escolherTarefa('cfs').nome }}</strong> · menor vruntime</span>
              <span v-if="simulacoes.cfs.ultimo">
                Último passo: {{ simulacoes.cfs.ultimo.nome }} ·
                {{ formatarNumero(simulacoes.cfs.ultimo.anterior, 4) }} + {{ formatarNumero(simulacoes.cfs.ultimo.incremento, 4) }}
                = {{ formatarNumero(simulacoes.cfs.ultimo.atual, 4) }} ms virtuais
              </span>
            </div>
            <div class="simulator-timeline" aria-label="Últimos 30 passos">
              <span v-for="(nome, indice) in simulacoes.cfs.historico" :key="indice" :style="{ backgroundColor: corProcesso(nome) }">{{ nome }}</span>
              <small v-if="!simulacoes.cfs.historico.length">A linha do tempo aparecerá aqui.</small>
            </div>
            <div class="simulation-controls">
              <button type="button" @click="alternarSimulacao('cfs')">{{ simulacoes.cfs.ativa ? 'Pausar' : 'Iniciar' }}</button>
              <button type="button" @click="executarPasso('cfs')" :disabled="simulacoes.cfs.ativa">Próximo passo</button>
              <button type="button" @click="reiniciarSimulacao('cfs')">Reiniciar</button>
              <label>Velocidade
                <select v-model.number="simulacoes.cfs.velocidade">
                  <option :value="1500">Lenta</option><option :value="700">Normal</option><option :value="300">Rápida</option>
                </select>
              </label>
            </div>
            <section class="calculos-simulacao" aria-labelledby="titulo-calculos-cfs">
              <div class="calculos-simulacao-header">
                <div>
                  <span class="panel-label">DETALHAMENTO DO MODELO</span>
                  <h2 id="titulo-calculos-cfs">Entenda os cálculos</h2>
                </div>
                <label>
                  Processo
                  <select v-model="processoDetalhadoCfs">
                    <option v-for="tarefa in simulacoes.cfs.tarefas" :key="tarefa.nome" :value="tarefa.nome">{{ tarefa.nome }}</option>
                  </select>
                </label>
              </div>

              <div v-if="tarefaDetalhadaCfs" class="calculos-simulacao-layout">
                <div class="calculos-simulacao-list">
                  <p>
                    <strong>1. Nice e peso:</strong>
                    nice {{ tarefaDetalhadaCfs.nice }} → peso {{ tarefaDetalhadaCfs.peso }}
                  </p>
                  <p>
                    <strong>2. Parcela ideal:</strong>
                    {{ tarefaDetalhadaCfs.peso }} / {{ pesoTotal('cfs') }} × 100
                    ≈ {{ formatarNumero(parcelaIdeal('cfs', tarefaDetalhadaCfs) * 100, 4) }}%
                  </p>
                  <p>
                    <strong>3. Serviço ideal neste modelo:</strong>
                    {{ simulacoes.cfs.tempo }} ms × {{ formatarNumero(parcelaIdeal('cfs', tarefaDetalhadaCfs) * 100, 4) }}%
                    ≈ {{ formatarNumero(simulacoes.cfs.tempo * parcelaIdeal('cfs', tarefaDetalhadaCfs), 4) }} ms
                  </p>
                  <p>
                    <strong>4. Fator virtual:</strong>
                    1024 / {{ tarefaDetalhadaCfs.peso }}
                    ≈ {{ formatarNumero(1024 / tarefaDetalhadaCfs.peso, 4) }}
                  </p>
                  <p>
                    <strong>5. Vruntime acumulado:</strong>
                    {{ tarefaDetalhadaCfs.cpu }} ms × 1024 / {{ tarefaDetalhadaCfs.peso }}
                    ≈ {{ formatarNumero(tarefaDetalhadaCfs.vruntime, 4) }} ms virtuais
                  </p>
                  <p v-if="simulacoes.cfs.ultimo?.nome === tarefaDetalhadaCfs.nome">
                    <strong>Último passo de {{ tarefaDetalhadaCfs.nome }}:</strong>
                    {{ formatarNumero(simulacoes.cfs.ultimo.anterior, 4) }} +
                    {{ formatarNumero(simulacoes.cfs.ultimo.incremento, 4) }} ≈
                    {{ formatarNumero(simulacoes.cfs.ultimo.atual, 4) }} ms virtuais
                  </p>
                  <small>O cálculo acumulado parte de zero neste modelo; todas as tarefas permanecem prontas e mudar o nice reinicia o histórico.</small>
                </div>

                <aside class="decisao-simulacao" aria-label="Comparação para a próxima escolha do CFS">
                  <span class="panel-label">PRÓXIMA ESCOLHA</span>
                  <strong v-if="proximaTarefaCfs">Processo {{ proximaTarefaCfs.nome }}</strong>
                  <span v-else>Sem tarefa pronta no modelo.</span>
                  <ul>
                    <li v-for="tarefa in simulacoes.cfs.tarefas" :key="tarefa.nome">
                      <b :style="{ color: corProcesso(tarefa.nome) }">{{ tarefa.nome }}</b>
                      <span>vruntime {{ formatarNumero(tarefa.vruntime, 4) }} ms virtuais</span>
                    </li>
                  </ul>
                  <small>O modelo escolhe o menor vruntime. Em empate exato, usa ordem alfabética. Os valores mostrados são arredondados.</small>
                </aside>
              </div>
            </section>
            <p class="simulation-note">Cada passo representa 1 ms simulado. Mudar o nice reinicia o histórico. A barra mostra a parcela ideal, não a medida. A escolha e a preempção são simplificadas; não reproduzem todos os detalhes do kernel.</p>
          </div>
        </article>

        <!-- Slide 15 -->
        <article v-else-if="slideAtual === 14" key="slide-15" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">EEVDF · CONCEITOS</span>
            <h1>Da parcela ideal ao prazo virtual</h1>
            <p class="question">Como construir os valores usados pelo escalonador?</p>
          </div>

          <div class="eevdf-concept-grid">
            <section class="panel eevdf-concept-card">
              <span class="panel-label">1 · PARCELA IDEAL</span>
              <h2>Quanto cada tarefa recebe?</h2>
              <p>O peso representa a participação proporcional esperada enquanto as tarefas disputam a CPU.</p>
              <div class="eevdf-concept-formula">
                <code>parcela ideal = peso da tarefa / soma dos pesos</code>
              </div>
              <p>O resultado é uma proporção. Para obter tempo, multiplicamos pela CPU disponível no intervalo.</p>
            </section>

            <section class="panel eevdf-concept-card">
              <span class="panel-label">2 · PRAZO VIRTUAL</span>
              <h2>Qual é o prazo?</h2>
              <div class="eevdf-concept-formula">
                <small>Converter a fatia para a escala virtual:</small>
                <code>fatia virtual ≈ fatia de CPU × 1024 / peso</code>
                <small>Calcular o aumento do tempo virtual:</small>
                <code>Δvruntime ≈ CPU executada × 1024 / peso</code>
                <small>Somar o aumento ao vruntime anterior. Ao definir ou renovar o prazo:</small>
                <code>prazo = vruntime da tarefa + fatia virtual</code>
              </div>
              <p>A fatia pode seguir o padrão do kernel ou ser personalizada quando a interface permitir.</p>
            </section>

            <section class="panel eevdf-concept-card">
              <span class="panel-label">3 · LAG E ELEGIBILIDADE</span>
              <h2>Quem pode disputar?</h2>
              <div class="eevdf-concept-formula">
                <code>serviço ideal = CPU disponível × parcela ideal</code>
                <code>lag didático = serviço ideal − CPU recebida</code>
              </div>
              <p><strong>Lag negativo:</strong> adiantada, não elegível.</p>
              <p><strong>Lag zero ou positivo:</strong> equilibrada ou atrasada, elegível.</p>
            </section>
          </div>

          <div class="highlight-strip">
            <strong>Decisão:</strong> verificar a elegibilidade pelo lag; entre as tarefas elegíveis, escolher o menor prazo virtual.
          </div>
          <p class="simulation-note">
            A conta de serviço ideal é didática para um intervalo com o mesmo conjunto de tarefas prontas.
            O Linux usa contabilidade virtual ponderada; o prazo não é um horário real.
          </p>
        </article>

        <!-- Slide 16 -->
        <article v-else-if="slideAtual === 15" key="slide-16" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">EEVDF · SIMULAÇÃO</span>
            <h1>Elegibilidade e prazo virtual</h1>
            <p class="question">Como peso, lag e fatia hipotética influenciam a próxima escolha?</p>
          </div>

          <div class="simulator panel">
            <div class="simulator-top">
              <span class="panel-label">A, B E C SEMPRE PRONTOS · UMA VCPU</span>
              <div class="simulator-presets">
                <button type="button" @click="selecionarCenario('eevdf', false)">Pesos iguais</button>
                <button type="button" @click="selecionarCenario('eevdf', true)">B com nice 10</button>
              </div>
            </div>
            <div class="simulator-table-wrap">
              <table>
                <thead><tr><th>Processo</th><th>Nice</th><th>Peso</th><th>Fatia*</th><th>Parcela</th><th>Serviço ideal</th><th>CPU</th><th>Vruntime</th><th>Lag*</th><th>Elegível</th><th>Prazo*</th></tr></thead>
                <tbody>
                  <tr v-for="(tarefa, indice) in simulacoes.eevdf.tarefas" :key="tarefa.nome" :class="{ 'simulation-ineligible': !tarefaElegivel('eevdf', tarefa) }">
                    <td :style="{ color: corProcesso(tarefa.nome) }">{{ tarefa.nome }}</td>
                    <td><select v-model.number="configuracoes.eevdf[indice].nice" :aria-label="'Nice do processo ' + tarefa.nome"><option v-for="nice in valoresNice" :key="nice" :value="nice">{{ nice }}</option></select></td>
                    <td>{{ tarefa.peso }}</td>
                    <td><select v-model.number="configuracoes.eevdf[indice].fatia" :aria-label="'Fatia hipotética do processo ' + tarefa.nome"><option v-for="fatia in [1, 2, 4, 8]" :key="fatia" :value="fatia">{{ fatia }} ms</option></select></td>
                    <td>{{ formatarNumero(parcelaIdeal('eevdf', tarefa) * 100) }}%</td>
                    <td>{{ formatarNumero(simulacoes.eevdf.tempo * parcelaIdeal('eevdf', tarefa), 4) }} ms</td>
                    <td>{{ tarefa.cpu }} ms</td>
                    <td>{{ formatarNumero(tarefa.vruntime, 4) }}</td>
                    <td>{{ formatarNumero(lagDidatico('eevdf', tarefa), 4) }}</td>
                    <td>{{ tarefaElegivel('eevdf', tarefa) ? 'Sim' : 'Não' }}</td>
                    <td :title="'Base virtual ' + formatarNumero(tarefa.basePrazo, 4) + ' + fatia virtual ' + formatarNumero(tarefa.fatia * 1024 / tarefa.peso, 4)">{{ formatarNumero(tarefa.prazo, 4) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="simulator-share" aria-label="Participação ideal de CPU">
              <span v-for="tarefa in simulacoes.eevdf.tarefas" :key="tarefa.nome" :style="{ flex: tarefa.peso, backgroundColor: corProcesso(tarefa.nome) }" :title="tarefa.nome + ': ' + formatarNumero(parcelaIdeal('eevdf', tarefa) * 100) + '%'"></span>
            </div>
            <div class="simulator-result" aria-live="polite">
              <span>Tempo simulado: <strong>{{ simulacoes.eevdf.tempo }} ms</strong></span>
              <span v-if="escolherTarefa('eevdf')">Próxima escolha simplificada: <strong>{{ escolherTarefa('eevdf').nome }}</strong> · elegível e menor prazo</span>
              <span v-if="simulacoes.eevdf.ultimo">
                Último passo: {{ simulacoes.eevdf.ultimo.nome }} · lag antes {{ formatarNumero(simulacoes.eevdf.ultimo.lagAntes) }} ms · prazo usado {{ formatarNumero(simulacoes.eevdf.ultimo.prazoEscolhido) }} ·
                Δvruntime = {{ formatarNumero(simulacoes.eevdf.ultimo.incremento) }}
              </span>
            </div>
            <div class="simulator-timeline" aria-label="Últimos 30 passos">
              <span v-for="(nome, indice) in simulacoes.eevdf.historico" :key="indice" :style="{ backgroundColor: corProcesso(nome) }">{{ nome }}</span>
              <small v-if="!simulacoes.eevdf.historico.length">A linha do tempo aparecerá aqui.</small>
            </div>
            <div class="simulation-controls">
              <button type="button" @click="alternarSimulacao('eevdf')">{{ simulacoes.eevdf.ativa ? 'Pausar' : 'Iniciar' }}</button>
              <button type="button" @click="executarPasso('eevdf')" :disabled="simulacoes.eevdf.ativa">Próximo passo</button>
              <button type="button" @click="reiniciarSimulacao('eevdf')">Reiniciar</button>
              <label>Velocidade
                <select v-model.number="simulacoes.eevdf.velocidade">
                  <option :value="1500">Lenta</option><option :value="700">Normal</option><option :value="300">Rápida</option>
                </select>
              </label>
            </div>
            <section class="calculos-simulacao" aria-labelledby="titulo-calculos-simulacao">
              <div class="calculos-simulacao-header">
                <div>
                  <span class="panel-label">DETALHAMENTO DO MODELO</span>
                  <h2 id="titulo-calculos-simulacao">Entenda os cálculos</h2>
                </div>
                <label>
                  Processo
                  <select v-model="processoDetalhadoEevdf">
                    <option v-for="tarefa in simulacoes.eevdf.tarefas" :key="tarefa.nome" :value="tarefa.nome">{{ tarefa.nome }}</option>
                  </select>
                </label>
              </div>

              <div v-if="tarefaDetalhadaEevdf" class="calculos-simulacao-layout">
                <div class="calculos-simulacao-list">
                  <p>
                    <strong>1. Parcela ideal:</strong>
                    {{ tarefaDetalhadaEevdf.peso }} / {{ pesoTotal('eevdf') }} × 100
                    ≈ {{ formatarNumero(parcelaIdeal('eevdf', tarefaDetalhadaEevdf) * 100, 4) }}%
                  </p>
                  <p>
                    <strong>2. Serviço ideal:</strong>
                    {{ simulacoes.eevdf.tempo }} ms × {{ formatarNumero(parcelaIdeal('eevdf', tarefaDetalhadaEevdf) * 100, 4) }}%
                    ≈ {{ formatarNumero(simulacoes.eevdf.tempo * parcelaIdeal('eevdf', tarefaDetalhadaEevdf), 4) }} ms
                  </p>
                  <p>
                    <strong>3. Lag didático:</strong>
                    {{ formatarNumero(simulacoes.eevdf.tempo * parcelaIdeal('eevdf', tarefaDetalhadaEevdf), 4) }}
                    − {{ tarefaDetalhadaEevdf.cpu }} ms
                    ≈ {{ formatarNumero(lagDidatico('eevdf', tarefaDetalhadaEevdf), 4) }} ms ·
                    {{ tarefaElegivel('eevdf', tarefaDetalhadaEevdf) ? 'elegível' : 'não elegível' }}
                  </p>
                  <p>
                    <strong>4. Fatia virtual:</strong>
                    {{ tarefaDetalhadaEevdf.fatia }} ms × 1024 / {{ tarefaDetalhadaEevdf.peso }}
                    ≈ {{ formatarNumero(tarefaDetalhadaEevdf.fatia * 1024 / tarefaDetalhadaEevdf.peso, 4) }} ms virtuais
                  </p>
                  <p>
                    <strong>5. Vruntime acumulado:</strong>
                    {{ tarefaDetalhadaEevdf.cpu }} ms × 1024 / {{ tarefaDetalhadaEevdf.peso }}
                    ≈ {{ formatarNumero(tarefaDetalhadaEevdf.vruntime, 4) }} ms virtuais
                  </p>
                  <p>
                    <strong>6. Prazo virtual atual:</strong>
                    base {{ formatarNumero(tarefaDetalhadaEevdf.basePrazo, 4) }} +
                    fatia virtual {{ formatarNumero(tarefaDetalhadaEevdf.fatia * 1024 / tarefaDetalhadaEevdf.peso, 4) }}
                    ≈ {{ formatarNumero(tarefaDetalhadaEevdf.prazo, 4) }} ms virtuais
                  </p>
                  <small>A base é o vruntime da tarefa quando o prazo foi definido ou renovado; ela pode ser diferente do vruntime atual.</small>
                </div>

                <aside class="decisao-simulacao" aria-label="Comparação para a próxima escolha">
                  <span class="panel-label">PRÓXIMA ESCOLHA</span>
                  <strong v-if="proximaTarefaEevdf">Processo {{ proximaTarefaEevdf.nome }}</strong>
                  <span v-else>Sem tarefa elegível no modelo.</span>
                  <ul>
                    <li v-for="tarefa in simulacoes.eevdf.tarefas" :key="tarefa.nome">
                      <b :style="{ color: corProcesso(tarefa.nome) }">{{ tarefa.nome }}</b>
                      <span v-if="tarefaElegivel('eevdf', tarefa)">elegível · prazo {{ formatarNumero(tarefa.prazo, 4) }}</span>
                      <span v-else>não elegível</span>
                    </li>
                  </ul>
                  <small>Entre as elegíveis, vence o menor prazo. Em empate exato, este modelo usa ordem alfabética.</small>
                </aside>
              </div>
            </section>
            <p class="simulation-note">* Valores hipotéticos: lag em ms de serviço (ideal − recebido), fatia em ms e prazo em unidades virtuais. A fatia não é medida nem atribuída por ser periódica. O prazo é renovado ao atingir a fatia neste modelo discreto. Alterar nice ou fatia reinicia a simulação.</p>
          </div>
        </article>


        <!-- Slide 17 -->
        <article v-else-if="slideAtual === 16" key="slide-17" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">COMPARAÇÃO</span>
            <h1>CFS e EEVDF: duas formas de selecionar tarefas</h1>
            <p class="question">
              O que o EEVDF acrescenta à ideia de justiça do CFS?
            </p>
          </div>

          <div class="scheduler-comparison">
            <section class="panel scheduler-side">
              <span class="panel-label">CFS — KERNEL 6.5.11</span>
              <h2>Ordenação por vruntime</h2>

              <div class="algorithm">
                <span>A, B e C prontas</span>
                <b>↓</b>
                <span>ordenar por vruntime</span>
                <b>↓</b>
                <strong>menor vruntime → vCPU</strong>
              </div>
            </section>

            <section class="panel scheduler-side">
              <span class="panel-label">EEVDF — KERNEL 7.0</span>
              <h2>Elegibilidade e prazo virtual</h2>

              <div class="algorithm">
                <span>A, B e C prontas</span>
                <b>↓</b>
                <span>calcular lag</span>
                <b>↓</b>
                <span>filtrar elegíveis</span>
                <b>↓</b>
                <strong>menor prazo virtual → vCPU</strong>
              </div>
            </section>
          </div>

          <div class="comparison-table panel">
            <table>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>CFS</th>
                  <th>EEVDF</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Referência</td>
                  <td>vruntime</td>
                  <td>lag e prazo virtual</td>
                </tr>
                <tr>
                  <td>Filtro inicial</td>
                  <td>Tarefas prontas</td>
                  <td>Tarefas elegíveis</td>
                </tr>
                <tr>
                  <td>Seleção final</td>
                  <td>Menor vruntime</td>
                  <td>Menor prazo virtual</td>
                </tr>
                <tr>
                  <td>nice</td>
                  <td>Define peso</td>
                  <td>Continua definindo peso</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <!-- Slide 18 -->
        <article v-else-if="slideAtual === 17" key="slide-18" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">AMBIENTE EXPERIMENTAL</span>
            <h1>Uma VM, dois kernels</h1>
            <p class="question">
              Como comparar CFS e EEVDF sem alterar o restante do ambiente?
            </p>
          </div>

          <div class="vm-layout">
            <div class="vm-stack">
              <div class="vm-layer">Host Windows</div>
              <div class="flow-arrow">↓</div>
              <div class="vm-layer">Oracle VirtualBox</div>
              <div class="flow-arrow">↓</div>
              <div class="vm-layer vm-ubuntu">
                <strong>Ubuntu 24.04.5 LTS</strong>
                <span>4 vCPUs · 8 GiB RAM · 35 GiB disco</span>
              </div>
              <div class="flow-arrow">↓</div>
              <div class="vm-layer grub-layer">
                <strong>GRUB</strong>
                <span>seleção do kernel no boot</span>
              </div>
            </div>

            <div class="kernel-options">
              <div class="kernel-option cfs-option">
                <span>Linux 6.5.11</span>
                <strong>CFS</strong>
                <small>experimentos em resultados/cfs</small>
              </div>

              <div class="kernel-option eevdf-option">
                <span>Linux 7.0.0-43</span>
                <strong>EEVDF</strong>
                <small>experimentos em resultados/eevdf</small>
              </div>
            </div>
          </div>

          <div class="highlight-strip">
            O escalonador é código do kernel carregado no boot. Alternar entre
            CFS e EEVDF exige reinicializar a VM e escolher outro kernel.
          </div>
        </article>

        <!-- Slide 19 -->
        <article v-else-if="slideAtual === 18" key="slide-19" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">AFINIDADE DE CPU</span>
            <h1>Por que todos disputam a vCPU 0?</h1>
            <p class="question">
              Se a VM possui quatro vCPUs, por que limitar A, B e C a apenas uma?
            </p>
          </div>

          <div class="cpu-affinity-grid">
            <div class="vcpu process-vcpu">
              <strong>vCPU 0</strong>
              <div class="process-stack">
                <span class="process-a">A</span>
                <span class="process-b">B</span>
                <span class="process-c">C</span>
              </div>
              <small>disputa controlada</small>
            </div>

            <div class="vcpu">
              <strong>vCPU 1</strong>
              <small>demais tarefas do sistema</small>
            </div>

            <div class="vcpu">
              <strong>vCPU 2</strong>
              <small>demais tarefas do sistema</small>
            </div>

            <div class="vcpu">
              <strong>vCPU 3</strong>
              <small>demais tarefas do sistema</small>
            </div>
          </div>

          <div class="command-panel">
            <code>taskset -c 0 ./bin/cpu_bound_worker A 10</code>
            <span>→</span>
            <code>taskset -pc &lt;PID&gt;</code>
          </div>

          <div class="three-columns">
            <div class="panel">
              <span class="panel-label">SEM AFINIDADE</span>
              <p>A, B e C poderiam executar em vCPUs diferentes, em paralelo.</p>
            </div>

            <div class="panel">
              <span class="panel-label">COM AFINIDADE</span>
              <p>A, B e C só podem executar na vCPU 0 e precisam alternar.</p>
            </div>

            <div class="panel">
              <span class="panel-label">LIMITE</span>
              <p>Afinidade não torna a vCPU 0 exclusiva do experimento.</p>
            </div>
          </div>
        </article>

        <!-- Slide 20 -->
        <article v-else-if="slideAtual === 19" key="slide-20" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">CARGAS DE TRABALHO</span>
            <h1>Dois comportamentos para observar o escalonador</h1>
            <p class="question">
              Por que não basta executar somente processos CPU-bound?
            </p>
          </div>

          <div class="comparison-grid">
            <section class="panel workload-card">
              <span class="panel-label">CPU-BOUND</span>
              <h2>cpu_bound_worker</h2>

              <div class="workload-track cpu-workload">
                <span>trabalho</span>
                <span>trabalho</span>
                <span>trabalho</span>
                <span>trabalho</span>
              </div>

              <p>
                Executa cálculos continuamente enquanto estiver escalonado.
                Quando perde a CPU, permanece pronto.
              </p>
            </section>

            <section class="panel workload-card">
              <span class="panel-label">I/O-BOUND SIMULADO</span>
              <h2>io_bound_simulator</h2>

              <div class="workload-track io-workload">
                <span>10 ms CPU</span>
                <span>90 ms espera</span>
                <span>10 ms CPU</span>
                <span>90 ms espera</span>
              </div>

              <p>
                Alterna trabalho curto e espera voluntária com
                <code>nanosleep()</code>.
              </p>
            </section>
          </div>

          <div class="highlight-strip">
            O segundo programa não realiza I/O real de disco ou rede. Ele simula
            o padrão de comportamento de tarefas que trabalham e aguardam eventos.
          </div>
        </article>

        <!-- Slide 21 -->
        <article v-else-if="slideAtual === 20" key="slide-21" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">PROGRAMA 1</span>
            <h1>cpu_bound_worker: carga contínua de CPU</h1>
            <p class="question">
              Como criar uma carga que permaneça pronta durante todo o experimento?
            </p>
          </div>

          <div class="worker-layout">
            <section class="panel code-panel">
              <span class="panel-label">LÓGICA SIMPLIFICADA</span>
              <pre><code>capturar_tempo(&inicio);

while (tempo_decorrido &lt; duracao) {
  trabalho += (trabalho * 3) + 1;
  iteracoes++;

  periodicamente:
    capturar_tempo(&agora);
}</code></pre>
            </section>

            <section class="panel worker-explanation">
              <span class="panel-label">COMPORTAMENTO</span>

              <ul>
                <li>Possui uma thread principal.</li>
                <li>Executa cálculos aritméticos continuamente.</li>
                <li>Não chama <code>sleep()</code>.</li>
                <li>Usa <code>CLOCK_MONOTONIC</code>.</li>
                <li>Registra iterações e tempo real decorrido.</li>
              </ul>
            </section>
          </div>

          <div class="timeline-explanation panel">
            <span class="panel-label">TEMPO REAL ≠ TEMPO DE CPU</span>

            <div class="dual-timeline">
              <span>Relógio:</span>
              <div>
                <b>0 s</b>
                <i></i>
                <b>10 s</b>
              </div>

              <span>A recebe CPU:</span>
              <div class="cpu-slices">
                <em class="process-a"></em>
                <em class="process-a"></em>
                <em class="process-a"></em>
                <em class="process-a"></em>
              </div>
            </div>

            <p>
              Dois processos podem terminar perto de 10 segundos de relógio,
              mesmo que cada um tenha recebido aproximadamente metade da CPU.
            </p>
          </div>
        </article>

        <!-- Slide 22 -->
        <article v-else-if="slideAtual === 21" key="slide-22" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">PROGRAMA 2</span>
            <h1>io_bound_simulator: trabalho periódico e espera</h1>
            <p class="question">
              Como simular uma tarefa que executa brevemente e aguarda eventos?
            </p>
          </div>

          <div class="periodic-layout">
            <section class="panel periodic-cycle">
              <span class="panel-label">CICLO CONFIGURADO</span>
              <h2>100 ms</h2>

              <div class="period-blocks">
                <span class="work-block">10 ms de CPU</span>
                <span class="sleep-block">90 ms de nanosleep()</span>
              </div>

              <code>TRABALHO_MS = 10</code>
              <code>PAUSA_MS = 90</code>
            </section>

            <section class="panel state-cycle">
              <span class="panel-label">MUDANÇA DE ESTADOS</span>

              <div class="small-state-flow">
                <span>Pronto</span>
                <b>→</b>
                <span>Em execução</span>
                <b>→</b>
                <span>Em espera</span>
                <b>→</b>
                <span>Pronto</span>
              </div>

              <p>
                Quando <code>nanosleep()</code> termina, C não volta
                diretamente à CPU: volta ao estado pronto e disputa uma nova decisão.
              </p>
            </section>
          </div>

          <div class="highlight-strip">
            10 ms de trabalho e 90 ms de pausa representam uma intenção de carga.
            O percentual efetivo de CPU depende da rapidez com que C é escalonada.
          </div>
        </article>

        <!-- Slide 23 -->
        <article v-else-if="slideAtual === 22" key="slide-23" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">AUTOMAÇÃO</span>
            <h1>Scripts Bash: da execução ao resultado estruturado</h1>
            <p class="question">
              Como garantir que cada cenário seja medido e registrado da mesma forma?
            </p>
          </div>

          <div class="pipeline">
            <span>expN.sh</span>
            <b>→</b>
            <span>detectar kernel</span>
            <b>→</b>
            <span>compilar C</span>
            <b>→</b>
            <span>taskset / nice</span>
            <b>→</b>
            <span>pidstat</span>
            <b>→</b>
            <span>CSV / JSON</span>
          </div>

          <div class="three-columns">
            <div class="panel">
              <span class="panel-label">EXECUÇÃO</span>
              <p>GCC compila os programas; Bash inicia e aguarda os processos.</p>
            </div>

            <div class="panel">
              <span class="panel-label">COLETA</span>
              <p>pidstat mede CPU e espera por PID em intervalos regulares.</p>
            </div>

            <div class="panel">
              <span class="panel-label">EVIDÊNCIAS</span>
              <p>Logs, afinidade, metadados, CSVs e status ficam preservados.</p>
            </div>
          </div>

          <div class="file-tree panel">
            <span class="panel-label">ESTRUTURA GERADA</span>
            <pre>resultados/
├── cfs/
│   └── exp1/20261120_222346/
│       ├── pidstat.txt
│       ├── amostras.csv
│       ├── resumo.csv
│       └── status.json
└── eevdf/
    └── exp1/&lt;execucao_id&gt;/</pre>
          </div>
        </article>

        <!-- Slide 24 -->
        <article v-else-if="slideAtual === 23" key="slide-24" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">EXPERIMENTO 1</span>
            <h1>Divisão equilibrada entre duas cargas CPU-bound</h1>
            <p class="question">
              Dois processos com o mesmo peso dividem a vCPU de forma semelhante?
            </p>
          </div>

          <div class="experiment-config">
            <span class="process-a">A · CPU-bound · nice 0 · peso 1024</span>
            <span class="process-b">B · CPU-bound · nice 0 · peso 1024</span>
            <span>vCPU 0 · 10 segundos</span>
          </div>

          <div class="experiment-columns">
            <section class="panel">
              <span class="panel-label">CFS</span>
              <code>W_A = W_B = 1024</code>
              <code>Δvruntime_A = Δvruntime_B</code>
              <p>
                Com pesos iguais, a tarefa que executou menos tende a possuir
                menor vruntime e receber a próxima oportunidade.
              </p>
            </section>

            <section class="panel">
              <span class="panel-label">EEVDF</span>
              <code>serviço ideal_A = serviço ideal_B</code>
              <code>parcela ideal_A = parcela ideal_B = 50%</code>
              <p>
                Pesos iguais produzem parcelas ideais iguais; os lags podem
                ser diferentes em cada instante.
              </p>
            </section>
          </div>

          <div class="formula-strip">
            <code>CPU_A = 1024 / (1024 + 1024) = 50%</code>
            <code>CPU_B = 1024 / (1024 + 1024) = 50%</code>
          </div>

          <p class="bottom-message">
            Hipótese: A e B devem apresentar médias próximas de 50%, com espera
            relevante em ambos por disputarem uma única vCPU.
          </p>
        </article>

        <!-- Slide 25 -->
        <article v-else-if="slideAtual === 24" key="slide-25" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">EXPERIMENTO 2</span>
            <h1>Pesos diferentes e participação proporcional</h1>
            <p class="question">
              Como CFS e EEVDF tratam A com nice 0 e B com nice 10?
            </p>
          </div>

          <div class="experiment-config">
            <span class="process-a">A · CPU-bound · nice 0 · peso 1024</span>
            <span class="process-b">B · CPU-bound · nice 10 · peso 110</span>
            <span>vCPU 0 · 10 segundos</span>
          </div>

          <div class="experiment-columns">
            <section class="panel">
              <span class="panel-label">CFS — DECISÃO</span>
              <code>Δv_A = Δt × (1024 / 1024)</code>
              <code>Δv_B = Δt × (1024 / 110)</code>

              <p>
                Para o mesmo tempo real, B acumula vruntime mais rapidamente.
                Assim, A pode executar mais tempo antes de perder a posição relativa.
              </p>
            </section>

            <section class="panel">
              <span class="panel-label">EEVDF — DECISÃO</span>
              <code>lag_i = serviço ideal_i − serviço recebido_i</code>

              <p>
                Se A receber mais que sua participação ideal, seu lag tende a
                reduzir; se B receber menos, seu lag tende a crescer e B recupera
                elegibilidade.
              </p>
            </section>
          </div>

          <div class="share-bars large-shares">
            <span class="share-a">A: 1024 / 1134 = 90,3%</span>
            <span class="share-b">B: 110 / 1134 = 9,7%</span>
          </div>

          <p class="bottom-message">
            Hipótese: A recebe a maior parte da CPU; B continua executando e não
            entra em inanição.
          </p>
        </article>

        <!-- Slide 26 -->
        <article v-else-if="slideAtual === 25" key="slide-26" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">EXPERIMENTO 3</span>
            <h1>Responsividade de uma tarefa periódica</h1>
            <p class="question">
              O que ocorre quando C retorna à fila enquanto A e B saturam a vCPU?
            </p>
          </div>

          <div class="experiment-config">
            <span class="process-a">A · CPU-bound · peso 1024</span>
            <span class="process-b">B · CPU-bound · peso 1024</span>
            <span class="process-c">C · periódica · peso 1024</span>
          </div>

          <div class="dynamic-shares">
            <section class="panel">
              <span class="panel-label">C EM ESPERA</span>
              <code>R(t) = { A, B }</code>
              <code>W_total = 2048</code>
              <p>Participação ideal enquanto A e B disputam a vCPU.</p>

              <div class="two-share">
                <span class="process-a">A: 50%</span>
                <span class="process-b">B: 50%</span>
              </div>
            </section>

            <section class="panel">
              <span class="panel-label">C PRONTA</span>
              <code>R(t) = { A, B, C }</code>
              <code>W_total = 3072</code>
              <p>Referência ideal enquanto as três tarefas estão prontas.</p>

              <div class="three-share">
                <span class="process-a">A: 33,3%</span>
                <span class="process-b">B: 33,3%</span>
                <span class="process-c">C: 33,3%</span>
              </div>
            </section>
          </div>

          <div class="experiment-columns">
            <section class="panel">
              <span class="panel-label">CFS</span>
              <p>
                Quando C acorda, volta ao conjunto de tarefas prontas. Sua posição
                relativa de vruntime influencia quando receberá a vCPU.
              </p>
            </section>

            <section class="panel">
              <span class="panel-label">EEVDF</span>
              <p>
                Quando C acorda, lag e prazo virtual definem se ela está elegível
                e quão cedo pode voltar a executar.
              </p>
            </section>
          </div>

          <p class="bottom-message">
            A referência “45% / 45% / 10%” não é uma garantia. A CPU efetiva de C
            depende de sua latência ao despertar, preempções e duração real das pausas.
          </p>
          <p class="simulation-note">
            C usa nanosleep() para simular espera: não realiza I/O real. Usar menos CPU durante as pausas não indica, por si só, prejuízo causado pelo escalonador.
            Os valores de %CPU e %wait do pidstat não medem diretamente a latência entre o despertar e a retomada de C.
          </p>
        </article>

        <!-- Slide 27 -->
        <article v-else-if="slideAtual === 26" key="slide-27" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">MEDIÇÃO</span>
            <h1>Coleta de métricas com pidstat</h1>
            <p class="question">
              Como observar os efeitos do escalonamento sem ler estruturas internas do kernel?
            </p>
          </div>

          <div class="pidstat-layout">
            <section class="panel terminal-panel">
              <span class="panel-label">AMOSTRA BRUTA</span>
              <pre>Horário     PID    %usr  %wait  %CPU  CPU  Command
22:24:31    8156   44.55  54.46 44.55   0   cpu_bound_worker
22:24:31    8157   45.54  54.46 45.54   0   cpu_bound_worker
22:24:31    8158    9.90   1.98  9.90   0   io_bound_simulator</pre>
            </section>

            <section class="panel">
              <span class="panel-label">COLUNAS PRINCIPAIS</span>

              <ul class="metric-list">
                <li><strong>%usr</strong><span>código executado em espaço de usuário</span></li>
                <li><strong>%system</strong><span>código do kernel em nome da tarefa</span></li>
                <li><strong>%wait</strong><span>tempo reportado aguardando execução</span></li>
                <li><strong>%CPU</strong><span>uso total de CPU no intervalo</span></li>
                <li><strong>CPU</strong><span>vCPU usada na amostra</span></li>
              </ul>
            </section>
          </div>

          <div class="pipeline data-pipeline">
            <span>pidstat.txt</span>
            <b>→</b>
            <span>amostras.csv</span>
            <b>→</b>
            <span>resumo.csv</span>
            <b>→</b>
            <span>dashboard</span>
          </div>

          <p class="bottom-message">
            pidstat mede efeitos observáveis: uso de CPU e espera. Ele não expõe
            diretamente vruntime, lag ou prazos virtuais internos.
          </p>
        </article>

        <!-- Slide 28 -->
        <article v-else-if="slideAtual === 27" key="slide-28" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">ARQUITETURA DA APLICAÇÃO</span>
            <h1>API, eventos e dashboard em tempo real</h1>
            <p class="question">
              Como a dashboard identifica novas execuções sem recarregar a página?
            </p>
          </div>

          <div class="app-architecture">
            <div class="app-node">
              <strong>Scripts Bash</strong>
              <span>geram CSV e JSON</span>
            </div>

            <div class="app-arrow">→</div>

            <div class="app-node">
              <strong>resultados/</strong>
              <span>fonte de dados auditável</span>
            </div>

            <div class="app-arrow">→</div>

            <div class="app-node">
              <strong>Chokidar</strong>
              <span>observa status.json</span>
            </div>

            <div class="app-arrow">→</div>

            <div class="app-node socket-node">
              <strong>Socket.IO</strong>
              <span>evento resultados:alterados</span>
            </div>
          </div>

          <div class="http-flow">
            <div class="http-card">
              <span class="panel-label">HTTP REST</span>
              <code>GET /api/execucoes</code>
              <code>GET /api/execucoes/:id</code>
              <p>Entrega dados completos para a interface.</p>
            </div>

            <div class="http-card">
              <span class="panel-label">EXPRESS + NODE</span>
              <p>
                Lê CSV e JSON, normaliza dados e responde aos endpoints da API.
              </p>
            </div>

            <div class="http-card">
              <span class="panel-label">VUE</span>
              <p>
                Recebe o evento em tempo real e realiza uma nova requisição HTTP.
              </p>
            </div>
          </div>

          <div class="highlight-strip">
            Socket.IO avisa que algo mudou. A API REST entrega os dados completos.
          </div>
        </article>

        <!-- Slide 29 -->
        <article v-else key="slide-29" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">VISUALIZAÇÃO</span>
            <h1>Dashboard: da métrica à análise</h1>
            <p class="question">
              Como transformar arquivos de medição em evidências sobre o escalonamento?
            </p>
          </div>

          <div class="dashboard-mock">
            <aside class="mock-sidebar">
              <span class="panel-label">EXECUÇÕES</span>

              <div class="mock-execution active">
                <strong>Exp3 — CFS</strong>
                <span>concluída · 22:24:28</span>
              </div>

              <div class="mock-execution">
                <strong>Exp2 — CFS</strong>
                <span>concluída · 22:24:12</span>
              </div>

              <div class="mock-execution">
                <strong>Exp1 — EEVDF</strong>
                <span>concluída · 10:15:30</span>
              </div>
            </aside>

            <section class="mock-content">
              <div class="mock-context">
                <div>
                  <span>Kernel</span>
                  <strong>6.5.11-060511-generic</strong>
                </div>

                <div>
                  <span>vCPU alvo</span>
                  <strong>0</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong class="success-text">Concluída</strong>
                </div>
              </div>

              <div class="mock-processes">
                <div
                  v-for="processo in ['A', 'B', 'C']"
                  :key="processo"
                  class="mock-process"
                  :style="{ '--process-color': corProcesso(processo) }"
                >
                  <span>Processo {{ processo }}</span>
                  <strong>
                    {{ processo === "C" ? "9,7%" : processo === "A" ? "45,0%" : "45,3%" }}
                  </strong>
                  <small>CPU média</small>
                </div>
              </div>

              <div class="mock-charts">
                <div class="chart-placeholder">
                  <span>CPU por processo</span>
                  <svg viewBox="0 0 300 110">
                    <polyline
                      points="0,55 40,49 80,52 120,46 160,50 200,45 240,49 300,47"
                      fill="none"
                      stroke="#60a5fa"
                      stroke-width="4"
                    />
                    <polyline
                      points="0,58 40,52 80,55 120,50 160,54 200,49 240,53 300,51"
                      fill="none"
                      stroke="#f59e0b"
                      stroke-width="4"
                    />
                    <polyline
                      points="0,94 40,89 80,92 120,86 160,91 200,84 240,90 300,86"
                      fill="none"
                      stroke="#34d399"
                      stroke-width="4"
                    />
                  </svg>
                </div>

                <div class="chart-placeholder">
                  <span>Espera por processo</span>
                  <svg viewBox="0 0 300 110">
                    <polyline
                      points="0,44 40,50 80,46 120,52 160,48 200,54 240,49 300,52"
                      fill="none"
                      stroke="#60a5fa"
                      stroke-width="4"
                    />
                    <polyline
                      points="0,42 40,48 80,44 120,50 160,46 200,52 240,47 300,50"
                      fill="none"
                      stroke="#f59e0b"
                      stroke-width="4"
                    />
                    <polyline
                      points="0,92 40,94 80,89 120,95 160,90 200,94 240,88 300,92"
                      fill="none"
                      stroke="#34d399"
                      stroke-width="4"
                    />
                  </svg>
                </div>
              </div>
            </section>
          </div>

          <div class="bottom-message">
            A dashboard organiza a análise; os arquivos brutos do pidstat
            permanecem disponíveis para auditoria e validação.
          </div>
        </article>
      </Transition>
    </section>

    <footer class="controls">
      <button type="button" class="nav-button" @click="voltar">
        ← Anterior
      </button>

      <div class="dots">
        <button
          v-for="(_, indice) in slides"
          :key="indice"
          type="button"
          class="dot"
          :class="{ active: indice === slideAtual }"
          :title="slides[indice]"
          @click="irPara(indice)"
        ></button>
      </div>

      <button type="button" class="nav-button primary" @click="avancar">
        Próximo →
      </button>
    </footer>
  </main>
</template>

<style scoped>
.presentation {
  --presentation-bg: #07100c;
  --presentation-surface: #101a14;
  --presentation-surface-soft: #142119;
  --presentation-border: rgba(226, 232, 240, 0.12);
  --presentation-border-strong: rgba(226, 232, 240, 0.22);
  --presentation-text: #f8fafc;
  --presentation-muted: #94a3b8;
  --presentation-accent: #1ed760;
  --presentation-accent-soft: rgba(30, 215, 96, 0.15);
  --presentation-danger: #fb7185;
  --presentation-warning: #fbbf24;

  min-height: 100vh;
  color: var(--presentation-text);
  background:
    radial-gradient(circle at 20% -10%, rgba(30, 215, 96, 0.14), transparent 28rem),
    radial-gradient(circle at 90% 15%, rgba(96, 165, 250, 0.1), transparent 24rem),
    var(--presentation-bg);
}

.topbar,
.controls {
  position: fixed;
  right: 0;
  left: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4vw;
  border-color: var(--presentation-border);
  background: rgba(7, 16, 12, 0.86);
  backdrop-filter: blur(18px);
}

.topbar {
  top: 0;
  height: 76px;
  border-bottom: 1px solid var(--presentation-border);
}

.controls {
  bottom: 0;
  min-height: 74px;
  gap: 1rem;
  border-top: 1px solid var(--presentation-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  color: #04120a;
  background: var(--presentation-accent);
  box-shadow: 0 0 22px rgba(30, 215, 96, 0.24);
}

.brand div {
  display: grid;
  gap: 0.15rem;
}

.brand strong {
  font-size: 0.86rem;
}

.brand span:not(.brand-mark) {
  font-size: 0.7rem;
  color: var(--presentation-muted);
}

.slide-counter {
  color: var(--presentation-accent);
  font-weight: 800;
}

.slide-counter small {
  color: var(--presentation-muted);
  font-weight: 500;
}

.stage {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 112px 4vw 106px;
}

.slide {
  width: min(1220px, 100%);
  animation: enter 0.35s ease both;
}

.slide-heading {
  margin-bottom: 2rem;
}

.eyebrow,
.panel-label {
  display: block;
  margin-bottom: 0.65rem;
  color: var(--presentation-accent);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.slide h1 {
  max-width: 1000px;
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 1.08;
  letter-spacing: -0.055em;
}

.slide h2 {
  margin: 0.4rem 0 1rem;
  font-size: clamp(1.15rem, 2vw, 1.7rem);
}

.question {
  max-width: 850px;
  margin: 0.85rem 0 0;
  color: #d6e5db;
  font-size: clamp(1rem, 1.6vw, 1.22rem);
}

.panel {
  padding: 1.1rem;
  border: 1px solid var(--presentation-border);
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(20, 33, 25, 0.95), rgba(11, 23, 16, 0.95));
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.14);
}

.panel p {
  color: var(--presentation-muted);
  line-height: 1.65;
}

.panel code,
code {
  color: #d1fae5;
  font-family: "SFMono-Regular", Consolas, monospace;
}

.bottom-message,
.highlight-strip,
.lab-callout {
  margin-top: 1.25rem;
  padding: 1rem 1.2rem;
  border: 1px solid rgba(30, 215, 96, 0.22);
  border-radius: 14px;
  color: #cfe8d8;
  background: var(--presentation-accent-soft);
}

.cover-slide {
  display: grid;
  min-height: 600px;
  align-content: space-between;
}

.cover-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  align-items: center;
  gap: 3rem;
}

.cover-copy h1 {
  font-size: clamp(3rem, 6vw, 5.8rem);
}

.cover-copy h1 strong {
  display: block;
  color: var(--presentation-accent);
}

.cover-copy p {
  max-width: 650px;
  color: var(--presentation-muted);
  font-size: 1.2rem;
  line-height: 1.7;
}

.cover-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.8rem;
}

.cover-tags span {
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--presentation-border);
  border-radius: 999px;
  color: #d6e5db;
  font-size: 0.78rem;
  background: rgba(255, 255, 255, 0.03);
}

.cover-orbit {
  position: relative;
  min-height: 360px;
}

.orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid rgba(30, 215, 96, 0.24);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.orbit-a {
  width: 190px;
  height: 190px;
}

.orbit-b {
  width: 280px;
  height: 280px;
}

.orbit-c {
  width: 355px;
  height: 355px;
  border-style: dashed;
}

.cover-cpu {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 138px;
  height: 138px;
  place-content: center;
  border-radius: 50%;
  text-align: center;
  background: #13281b;
  box-shadow: 0 0 60px rgba(30, 215, 96, 0.18);
  transform: translate(-50%, -50%);
}

.cover-cpu span {
  color: var(--presentation-muted);
  font-size: 0.76rem;
}

.cover-cpu strong {
  margin-top: 0.3rem;
  font-size: 1rem;
}

.cover-process {
  position: absolute;
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border: 2px solid var(--process-color);
  border-radius: 50%;
  color: var(--process-color);
  font-weight: 900;
  background: #0b1710;
  box-shadow: 0 0 25px color-mix(in srgb, var(--process-color) 35%, transparent);
}

.process-a {
  color: #60a5fa;
}

.process-b {
  color: #f59e0b;
}

.process-c {
  color: #34d399;
}

.cover-process.process-a {
  top: 24px;
  left: 16%;
}

.cover-process.process-b {
  right: 16%;
  bottom: 46px;
}

.cover-process.process-c {
  top: 45%;
  right: 4%;
}

.cover-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3rem;
  color: var(--presentation-muted);
  font-size: 0.78rem;
}

.architecture-layout,
.thread-layout,
.memory-layout,
.worker-layout,
.periodic-layout,
.pidstat-layout {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 1.2rem;
}

.architecture-stack {
  display: grid;
  gap: 0.45rem;
}

.layer {
  padding: 1.2rem 1.4rem;
  border: 1px solid var(--presentation-border);
  border-radius: 16px;
}

.layer span {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.72rem;
  color: var(--presentation-muted);
  text-transform: uppercase;
}

.layer strong {
  font-size: 1.1rem;
}

.layer p {
  margin-bottom: 0;
  color: var(--presentation-muted);
}

.application-layer {
  background: rgba(96, 165, 250, 0.08);
}

.kernel-layer {
  border-color: rgba(30, 215, 96, 0.34);
  background: rgba(30, 215, 96, 0.1);
}

.hardware-layer {
  background: rgba(251, 191, 36, 0.08);
}

.kernel-services,
.hardware-items,
.memory-regions,
.hardware-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.85rem;
}

.kernel-services span,
.hardware-items span,
.memory-regions span {
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
  color: #d6e5db;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
}

.arrow-down,
.flow-arrow,
.app-arrow {
  display: grid;
  place-items: center;
  color: var(--presentation-accent);
  font-weight: 800;
}

.scenario-panel {
  padding: 1.4rem;
  border: 1px solid var(--presentation-border);
  border-radius: 20px;
  background: rgba(12, 27, 18, 0.86);
}

.scenario-panel code {
  display: block;
  padding: 0.9rem;
  border-radius: 10px;
  background: #06100a;
}

.scenario-panel ol {
  padding-left: 1.2rem;
  color: #d6e5db;
  line-height: 1.7;
}

.note {
  padding: 0.8rem;
  border-left: 3px solid var(--presentation-accent);
  color: var(--presentation-muted);
  background: rgba(30, 215, 96, 0.08);
}

.process-flow {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1.3fr;
  align-items: center;
  gap: 0.8rem;
}

.flow-card {
  min-height: 180px;
  padding: 1.2rem;
  border: 1px solid var(--presentation-border);
  border-radius: 18px;
  background: var(--presentation-surface);
}

.flow-card strong,
.flow-card code {
  display: block;
  margin-top: 0.5rem;
}

.executable {
  background: rgba(96, 165, 250, 0.08);
}

.kernel-create {
  background: rgba(30, 215, 96, 0.08);
}

.process-box {
  background: rgba(167, 139, 250, 0.08);
}

.thread-line {
  display: grid;
  gap: 0.3rem;
  margin-top: 0.8rem;
  color: var(--presentation-muted);
  font-size: 0.78rem;
}

.three-columns,
.comparison-grid,
.experiment-columns,
.dynamic-shares {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.three-columns .panel,
.experiment-columns .panel,
.dynamic-shares .panel {
  padding: 1.1rem;
}

.process-container {
  padding: 1.25rem;
  border: 1px solid rgba(167, 139, 250, 0.28);
  border-radius: 22px;
  background: rgba(167, 139, 250, 0.06);
}

.container-title {
  color: #c4b5fd;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.shared-area {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px dashed rgba(167, 139, 250, 0.35);
  border-radius: 15px;
}

.shared-area div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.8rem;
}

.shared-area span {
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
  color: #ddd6fe;
  font-size: 0.76rem;
  background: rgba(167, 139, 250, 0.14);
}

.thread-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
  margin-top: 1rem;
}

.thread-card {
  display: grid;
  gap: 0.35rem;
  padding: 0.9rem;
  border: 1px solid var(--presentation-border);
  border-radius: 13px;
  background: #0a150e;
}

.thread-card span {
  color: var(--presentation-muted);
  font-size: 0.76rem;
}

.explanation-panel {
  padding: 1.25rem;
}

.explanation-panel hr {
  border: 0;
  border-top: 1px solid var(--presentation-border);
  margin: 1.2rem 0;
}

.comparison-grid {
  grid-template-columns: repeat(2, 1fr);
  margin-top: 0;
}

.concurrency-panel,
.parallelism-panel {
  padding: 1.3rem;
}

.cpu-track {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 0.7rem;
  align-items: center;
  margin-top: 1rem;
}

.cpu-label {
  color: var(--presentation-muted);
  font-size: 0.78rem;
}

.timeline {
  display: flex;
  min-height: 48px;
  overflow: hidden;
  border-radius: 9px;
  background: #07100c;
}

.time-block {
  display: grid;
  flex: 1;
  place-items: center;
  color: #06100a;
  font-size: 0.76rem;
  font-weight: 800;
}

.time-block.process-a {
  background: #60a5fa;
}

.time-block.process-b {
  background: #f59e0b;
}

.time-block.full {
  min-width: 100%;
}

.multi-cpu {
  display: grid;
  gap: 0.4rem;
}

.memory-layout {
  grid-template-columns: 1fr auto 0.85fr auto 1fr;
  align-items: center;
}

.virtual-process,
.physical-memory {
  min-height: 270px;
  padding: 1.1rem;
  border: 1px solid var(--presentation-border);
  border-radius: 18px;
  background: var(--presentation-surface);
}

.virtual-map {
  display: grid;
  gap: 0.35rem;
  margin: 1rem 0;
}

.virtual-map span {
  padding: 0.7rem;
  border-radius: 8px;
  color: #d6e5db;
  font-size: 0.78rem;
  background: rgba(96, 165, 250, 0.1);
}

.virtual-process small {
  color: var(--presentation-muted);
}

.memory-arrow {
  display: grid;
  gap: 0.3rem;
  place-items: center;
  color: var(--presentation-muted);
  font-size: 0.72rem;
  text-align: center;
}

.memory-arrow strong {
  color: var(--presentation-accent);
}

.memory-arrow b {
  color: var(--presentation-accent);
  font-size: 2rem;
}

.frames {
  display: grid;
  gap: 0.5rem;
  margin-top: 1rem;
}

.frames span {
  padding: 0.8rem;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 10px;
  color: #d1fae5;
  background: rgba(30, 215, 96, 0.08);
}

.allocation-layout {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 1rem;
}

.code-panel,
.allocator-panel {
  padding: 1.2rem;
}

pre {
  overflow: auto;
  margin: 0;
  padding: 1rem;
  border-radius: 12px;
  color: #d1fae5;
  background: #06100a;
}

.page-view {
  margin-top: 1rem;
}

.page-title {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--presentation-muted);
  font-size: 0.75rem;
}

.page-segments {
  display: flex;
  min-height: 92px;
  overflow: hidden;
  border: 1px solid var(--presentation-border);
  border-radius: 11px;
}

.page-segments span {
  display: grid;
  place-items: center;
  padding: 0.5rem;
  font-size: 0.72rem;
  text-align: center;
}

.metadata {
  width: 18%;
  background: rgba(244, 114, 182, 0.18);
}

.allocation {
  width: 30%;
  color: #06100a;
  background: #34d399;
}

.free-space {
  flex: 1;
  color: var(--presentation-muted);
  background: rgba(255, 255, 255, 0.04);
}

.decision-tree {
  display: grid;
  justify-items: center;
}

.tree-node {
  display: grid;
  gap: 0.35rem;
  min-width: 260px;
  padding: 1rem;
  border: 1px solid var(--presentation-border);
  border-radius: 14px;
  text-align: center;
  background: var(--presentation-surface);
}

.tree-node span {
  color: var(--presentation-muted);
  font-size: 0.78rem;
}

.start-node {
  border-color: rgba(96, 165, 250, 0.4);
}

.mmu-node {
  border-color: rgba(30, 215, 96, 0.4);
}

.tree-arrow {
  margin: 0.5rem 0;
  color: var(--presentation-accent);
  font-size: 1.4rem;
}

.tree-branches {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  gap: 1rem;
}

.branch {
  display: grid;
  justify-items: center;
}

.branch-label {
  font-size: 0.76rem;
  font-weight: 800;
}

.success {
  color: #34d399;
}

.warning {
  color: var(--presentation-warning);
}

.danger {
  color: var(--presentation-danger);
}

.success-node {
  border-color: rgba(52, 211, 153, 0.4);
}

.warning-node {
  border-color: rgba(251, 191, 36, 0.4);
}

.danger-node {
  border-color: rgba(251, 113, 133, 0.4);
}

.state-simulation {
  padding: 1.35rem;
  border: 1px solid var(--presentation-border);
  border-radius: 22px;
  background: rgba(8, 22, 14, 0.78);
}

.simulation-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.simulation-header h2 {
  margin: 0;
}

.simulation-header p {
  margin-bottom: 0;
  color: var(--presentation-muted);
}

.simulation-progress {
  padding: 0.5rem 0.7rem;
  border-radius: 999px;
  color: var(--presentation-accent);
  font-size: 0.78rem;
  background: var(--presentation-accent-soft);
}

.state-diagram {
  width: 100%;
  max-height: 430px;
  margin-top: 0.7rem;
}

.state-arrow {
  fill: none;
  stroke: #36d399;
  stroke-width: 2;
  opacity: 0.38;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: opacity 0.25s ease, stroke-width 0.25s ease;
}

.state-arrow.arrow-active {
  opacity: 1;
  stroke-width: 5;
  filter: drop-shadow(0 0 5px rgba(30, 215, 96, 0.55));
}

.simulation-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.simulation-controls button {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--presentation-border-strong);
  border-radius: 8px;
  color: var(--presentation-text);
  background: var(--presentation-surface);
}

.simulation-controls button:hover:not(:disabled) {
  border-color: var(--presentation-accent);
}

.simulation-controls button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.state-node {
  fill: #101a14;
  stroke: rgba(226, 232, 240, 0.18);
  stroke-width: 3;
  transition: 0.35s ease;
}

g.active .state-node {
  fill: rgba(30, 215, 96, 0.12);
  stroke: #1ed760;
  filter: drop-shadow(0 0 12px rgba(30, 215, 96, 0.28));
}

.state-title {
  fill: #f8fafc;
  font-size: 18px;
  font-weight: 800;
  text-anchor: middle;
  dominant-baseline: middle;
}

.arrow-text {
  fill: #94a3b8;
  font-size: 13px;
  text-anchor: middle;
}

.process-state-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.process-state-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  border: 1px solid color-mix(in srgb, var(--process-color) 35%, transparent);
  border-left: 4px solid var(--process-color);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
}

.process-state-card span {
  color: var(--presentation-muted);
  font-size: 0.78rem;
}

.process-state-card strong {
  color: var(--process-color);
}

.simulation-note {
  margin: 1rem 0 0;
  color: var(--presentation-muted);
  font-size: 0.74rem;
}

.scheduler-flow,
.eevdf-flow,
.pipeline,
.app-architecture {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 0.6rem;
}

.scheduler-box,
.eevdf-step,
.app-node {
  display: grid;
  flex: 1;
  gap: 0.5rem;
  min-height: 130px;
  padding: 1rem;
  border: 1px solid var(--presentation-border);
  border-radius: 16px;
  background: var(--presentation-surface);
}

.scheduler-box small,
.eevdf-step p,
.app-node span {
  color: var(--presentation-muted);
  font-size: 0.76rem;
}

.queue-processes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.queue-processes span {
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.policy-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  margin-top: 1rem;
}

.policy-card {
  padding: 0.9rem;
  border: 1px solid var(--presentation-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
}

.policy-card p {
  margin: 0.45rem 0 0;
  color: var(--presentation-muted);
  font-size: 0.78rem;
  line-height: 1.5;
}

.policy-trigger {
  width: 100%;
  color: var(--presentation-text);
  text-align: left;
  cursor: pointer;
}

.policy-trigger:hover,
.policy-trigger:focus-visible {
  border-color: var(--presentation-accent);
  outline: 2px solid transparent;
}

.policy-trigger small {
  display: block;
  margin-top: 0.65rem;
  color: var(--presentation-accent);
}

.policy-overlay {
  --presentation-border: rgba(226, 232, 240, 0.12);
  --presentation-muted: #94a3b8;
  --presentation-accent: #1ed760;
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.78);
}

.policy-dialog {
  width: min(620px, 100%);
  max-height: min(85vh, 800px);
  overflow-y: auto;
  padding: 1.5rem;
  border: 1px solid var(--presentation-border);
  border-radius: 18px;
  color: #f8fafc;
  background: #101a14;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
}

.policy-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.policy-dialog-header h2 {
  margin: 0;
}

.policy-dialog-header button {
  width: 38px;
  height: 38px;
  border: 1px solid var(--presentation-border);
  border-radius: 9px;
  color: #f8fafc;
  font-size: 1.5rem;
  background: transparent;
  cursor: pointer;
}

.policy-dialog dl {
  display: grid;
  gap: 0.4rem;
  margin: 1.25rem 0 0;
}

.policy-dialog dt {
  margin-top: 0.6rem;
  color: var(--presentation-accent);
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
}

.policy-dialog dd {
  margin: 0;
  color: #e2e8f0;
  line-height: 1.5;
}

.policy-comparison,
.timer-details {
  margin-top: 1rem;
}

.policy-comparison .panel,
.timer-details .panel {
  padding: 1.1rem;
}

.policy-comparison p,
.timer-details p {
  color: var(--presentation-muted);
  line-height: 1.5;
}

.timeline-with-times {
  margin: 1.2rem 0 2rem;
}

.timeline-blocks {
  display: flex;
  overflow: hidden;
  height: 48px;
  border-radius: 9px;
}

.timeline-blocks span {
  display: grid;
  min-width: 0;
  place-items: center;
  color: #07100c;
  font-weight: 800;
}

.timeline-blocks .process-a { background: #60a5fa; }
.timeline-blocks .process-b { background: #f59e0b; }
.timeline-blocks .process-c { background: #34d399; }

.timeline-labels {
  position: relative;
  color: var(--presentation-muted);
  font-size: 0.72rem;
}

.timeline-labels span {
  position: absolute;
  top: 0.35rem;
  transform: translateX(-50%);
}

.timeline-labels span:first-child { transform: none; }
.timeline-labels span:last-child { transform: translateX(-100%); }

.metrics-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.metrics-row button {
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--presentation-border);
  border-radius: 999px;
  color: var(--presentation-muted);
  font-size: 0.74rem;
  background: var(--presentation-surface);
  cursor: pointer;
}

.metrics-row button:hover,
.metrics-row button:focus-visible {
  border-color: var(--presentation-accent);
  color: var(--presentation-text);
}

.shared-scenario {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--presentation-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
}

.shared-scenario div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.shared-scenario div span,
.experiment-config span {
  padding: 0.45rem 0.65rem;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.05);
}

.policy-results {
  display: grid;
  gap: 0.65rem;
  margin-top: 1rem;
}

.policy-result {
  display: grid;
  grid-template-columns: 170px 1fr 1.2fr;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--presentation-border);
  border-radius: 13px;
  background: var(--presentation-surface);
}

.policy-result p {
  margin: 0;
  color: var(--presentation-muted);
  font-size: 0.8rem;
}

.mini-timeline {
  display: flex;
  min-height: 34px;
  overflow: hidden;
  border-radius: 7px;
}

.mini-timeline span {
  display: grid;
  flex: 1;
  place-items: center;
  color: #06100a;
  font-size: 0.7rem;
  font-weight: 800;
}

.mini-timeline .process-a {
  background: #60a5fa;
}

.mini-timeline .process-b {
  background: #f59e0b;
}

.mini-timeline .process-c {
  background: #34d399;
}

.cfs-layout,
.weight-layout,
.pidstat-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.cfs-layout .panel,
.weight-layout .panel {
  padding: 1.2rem;
}

.vruntime-list {
  display: grid;
  gap: 0.6rem;
}

.vruntime-list > div {
  display: grid;
  grid-template-columns: 45px 1fr auto;
  gap: 0.6rem;
  align-items: center;
  padding: 0.8rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}

.vruntime-list small {
  color: var(--presentation-muted);
  font-size: 0.7rem;
}

.disabled,
.muted {
  opacity: 0.46;
}

.cfs-choice {
  display: grid;
  place-items: center;
  text-align: center;
}

.selection-ring {
  display: grid;
  width: 130px;
  height: 130px;
  place-items: center;
  margin: 0.7rem 0;
  border: 4px solid currentColor;
  border-radius: 50%;
  font-size: 2.2rem;
  font-weight: 900;
  box-shadow: 0 0 30px currentColor;
}

.formula-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(30, 215, 96, 0.28);
  border-radius: 12px;
  background: rgba(30, 215, 96, 0.08);
}

.weight-rows {
  display: grid;
  gap: 0.7rem;
}

.weight-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  padding: 0.9rem;
  border-left: 4px solid currentColor;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}

.calculation-panel {
  display: grid;
  align-content: start;
  gap: 1rem;
}

.share-bars {
  display: flex;
  min-height: 54px;
  overflow: hidden;
  border-radius: 10px;
}

.share-bars span {
  display: grid;
  place-items: center;
  color: #07100c;
  font-size: 0.78rem;
  font-weight: 900;
}

.share-a {
  flex: 9.03;
  background: #60a5fa;
}

.share-b {
  flex: 0.97;
  background: #f59e0b;
}

.vruntime-example {
  display: grid;
  gap: 0.55rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--presentation-border);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.025);
}

.eevdf-flow {
  align-items: stretch;
}

.eevdf-step span {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  color: #06100a;
  font-weight: 900;
  background: var(--presentation-accent);
}

.lag-table {
  margin-top: 1rem;
  padding: 1.1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.7rem;
  border-bottom: 1px solid var(--presentation-border);
  text-align: left;
}

th {
  color: var(--presentation-muted);
  font-size: 0.72rem;
  text-transform: uppercase;
}

.lag-table p {
  margin: 0.9rem 0 0;
  color: var(--presentation-accent);
}

.eevdf-decisions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.9rem;
}

.decision-card {
  padding: 1rem;
  border: 1px solid var(--presentation-border);
  border-radius: 16px;
  background: var(--presentation-surface);
}

.decision-values {
  display: grid;
  gap: 0.45rem;
  margin: 1rem 0;
}

.decision-values span {
  padding: 0.55rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.77rem;
}

.scheduler-comparison {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.scheduler-side {
  padding: 1.2rem;
}

.algorithm {
  display: grid;
  gap: 0.6rem;
  margin-top: 1rem;
  text-align: center;
}

.algorithm span,
.algorithm strong {
  padding: 0.75rem;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.05);
}

.algorithm b {
  color: var(--presentation-accent);
}

.comparison-table {
  margin-top: 1rem;
  padding: 0.9rem;
}

.vm-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.4rem;
}

.vm-stack {
  display: grid;
  justify-items: center;
}

.vm-layer {
  width: min(420px, 100%);
  padding: 0.9rem;
  border: 1px solid var(--presentation-border);
  border-radius: 12px;
  text-align: center;
  background: var(--presentation-surface);
}

.vm-ubuntu {
  display: grid;
  gap: 0.35rem;
  border-color: rgba(30, 215, 96, 0.3);
}

.vm-ubuntu span,
.grub-layer span {
  color: var(--presentation-muted);
  font-size: 0.76rem;
}

.grub-layer {
  display: grid;
  gap: 0.35rem;
  border-color: rgba(251, 191, 36, 0.3);
}

.kernel-options {
  display: grid;
  gap: 1rem;
  align-content: center;
}

.kernel-option {
  display: grid;
  gap: 0.35rem;
  padding: 1.3rem;
  border: 1px solid var(--presentation-border);
  border-radius: 18px;
}

.kernel-option span,
.kernel-option small {
  color: var(--presentation-muted);
}

.cfs-option {
  background: rgba(96, 165, 250, 0.08);
}

.eevdf-option {
  background: rgba(30, 215, 96, 0.08);
}

.cpu-affinity-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;
}

.vcpu {
  display: grid;
  min-height: 220px;
  align-content: space-between;
  padding: 1rem;
  border: 1px solid var(--presentation-border);
  border-radius: 17px;
  color: var(--presentation-muted);
  background: var(--presentation-surface);
}

.vcpu strong {
  color: var(--presentation-text);
}

.process-vcpu {
  border-color: rgba(30, 215, 96, 0.5);
  background: rgba(30, 215, 96, 0.09);
}

.process-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.process-stack span {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 2px solid currentColor;
  border-radius: 50%;
  font-weight: 900;
}

.command-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.7rem;
  margin-top: 1rem;
  padding: 0.85rem;
  border: 1px solid var(--presentation-border);
  border-radius: 12px;
  background: #06100a;
}

.command-panel span {
  color: var(--presentation-accent);
}

.workload-card {
  padding: 1.2rem;
}

.workload-track {
  display: flex;
  min-height: 68px;
  overflow: hidden;
  margin: 1rem 0;
  border-radius: 10px;
}

.workload-track span {
  display: grid;
  place-items: center;
  color: #06100a;
  font-size: 0.72rem;
  font-weight: 900;
}

.cpu-workload span {
  flex: 1;
  background: #60a5fa;
}

.io-workload span:nth-child(odd) {
  width: 18%;
  background: #34d399;
}

.io-workload span:nth-child(even) {
  flex: 1;
  color: var(--presentation-muted);
  background: rgba(255, 255, 255, 0.07);
}

.dual-timeline {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.65rem;
  align-items: center;
}

.dual-timeline > span {
  color: var(--presentation-muted);
  font-size: 0.76rem;
}

.dual-timeline > div {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.dual-timeline i {
  flex: 1;
  height: 2px;
  background: var(--presentation-border-strong);
}

.cpu-slices em {
  flex: 1;
  height: 18px;
  border-radius: 4px;
  background: #60a5fa;
}

.periodic-layout {
  grid-template-columns: 1fr 1fr;
}

.periodic-cycle,
.state-cycle {
  padding: 1.2rem;
}

.period-blocks {
  display: flex;
  min-height: 80px;
  overflow: hidden;
  margin: 1rem 0;
  border-radius: 10px;
}

.period-blocks span {
  display: grid;
  place-items: center;
  font-size: 0.76rem;
  font-weight: 800;
}

.work-block {
  width: 18%;
  color: #06100a;
  background: #34d399;
}

.sleep-block {
  flex: 1;
  color: var(--presentation-muted);
  background: rgba(255, 255, 255, 0.06);
}

.periodic-cycle code {
  display: block;
  margin-top: 0.4rem;
}

.small-state-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  margin: 1rem 0;
}

.small-state-flow span {
  padding: 0.5rem;
  border: 1px solid var(--presentation-border);
  border-radius: 8px;
}

.small-state-flow b {
  color: var(--presentation-accent);
}

.pipeline {
  flex-wrap: wrap;
  margin: 1rem 0;
}

.pipeline span {
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--presentation-border);
  border-radius: 9px;
  color: #d6e5db;
  font-size: 0.78rem;
  background: var(--presentation-surface);
}

.pipeline b {
  color: var(--presentation-accent);
}

.file-tree {
  padding: 1.1rem;
  margin-top: 1rem;
}

.experiment-config {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.experiment-config span {
  font-size: 0.78rem;
}

.experiment-columns,
.dynamic-shares {
  grid-template-columns: repeat(2, 1fr);
  margin-top: 0;
}

.experiment-columns code,
.dynamic-shares code {
  display: block;
  margin-top: 0.45rem;
}

.large-shares {
  margin-top: 1rem;
}

.two-share,
.three-share {
  display: flex;
  overflow: hidden;
  margin-top: 1rem;
  border-radius: 9px;
}

.two-share span,
.three-share span {
  display: grid;
  flex: 1;
  min-height: 54px;
  place-items: center;
  color: #06100a;
  font-size: 0.76rem;
  font-weight: 900;
}

.two-share .process-a,
.three-share .process-a {
  background: #60a5fa;
}

.two-share .process-b,
.three-share .process-b {
  background: #f59e0b;
}

.three-share .process-c {
  background: #34d399;
}

.terminal-panel,
.pidstat-layout .panel {
  padding: 1.1rem;
}

.metric-list {
  display: grid;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.metric-list li {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 0.6rem;
  padding-bottom: 0.55rem;
  border-bottom: 1px solid var(--presentation-border);
}

.metric-list strong {
  color: var(--presentation-accent);
}

.metric-list span {
  color: var(--presentation-muted);
  font-size: 0.8rem;
}

.data-pipeline {
  margin-top: 1rem;
}

.app-architecture {
  margin-bottom: 1rem;
}

.app-node {
  text-align: center;
}

.socket-node {
  border-color: rgba(30, 215, 96, 0.4);
  background: rgba(30, 215, 96, 0.08);
}

.http-flow {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.http-card {
  padding: 1rem;
  border: 1px solid var(--presentation-border);
  border-radius: 15px;
  background: var(--presentation-surface);
}

.http-card code {
  display: block;
  margin: 0.55rem 0;
  font-size: 0.76rem;
}

.http-card p {
  color: var(--presentation-muted);
  font-size: 0.82rem;
  line-height: 1.55;
}

.dashboard-mock {
  display: grid;
  grid-template-columns: 250px 1fr;
  overflow: hidden;
  border: 1px solid var(--presentation-border);
  border-radius: 20px;
  background: #08120c;
}

.mock-sidebar {
  display: grid;
  align-content: start;
  gap: 0.7rem;
  padding: 1rem;
  border-right: 1px solid var(--presentation-border);
  background: #0b1710;
}

.mock-execution {
  display: grid;
  gap: 0.25rem;
  padding: 0.8rem;
  border: 1px solid transparent;
  border-radius: 10px;
}

.mock-execution.active {
  border-color: rgba(30, 215, 96, 0.35);
  background: rgba(30, 215, 96, 0.1);
}

.mock-execution span {
  color: var(--presentation-muted);
  font-size: 0.7rem;
}

.mock-content {
  padding: 1rem;
}

.mock-context,
.mock-processes,
.mock-charts {
  display: grid;
  gap: 0.8rem;
}

.mock-context {
  grid-template-columns: repeat(3, 1fr);
}

.mock-context div,
.mock-process {
  display: grid;
  gap: 0.35rem;
  padding: 0.8rem;
  border: 1px solid var(--presentation-border);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
}

.mock-context span,
.mock-process small {
  color: var(--presentation-muted);
  font-size: 0.68rem;
  text-transform: uppercase;
}

.success-text {
  color: var(--presentation-accent);
}

.mock-processes {
  grid-template-columns: repeat(3, 1fr);
  margin-top: 0.8rem;
}

.mock-process {
  border-top: 3px solid var(--process-color);
}

.mock-process strong {
  color: var(--process-color);
  font-size: 1.4rem;
}

.mock-charts {
  grid-template-columns: repeat(2, 1fr);
  margin-top: 0.8rem;
}

.chart-placeholder {
  padding: 0.8rem;
  border: 1px solid var(--presentation-border);
  border-radius: 11px;
  color: var(--presentation-muted);
  background: rgba(255, 255, 255, 0.02);
}

.chart-placeholder span {
  font-size: 0.74rem;
}

.chart-placeholder svg {
  width: 100%;
  margin-top: 0.65rem;
}

.nav-button {
  min-width: 120px;
  padding: 0.68rem 0.9rem;
  border: 1px solid var(--presentation-border-strong);
  border-radius: 10px;
  color: var(--presentation-text);
  background: rgba(255, 255, 255, 0.04);
  transition: 0.2s ease;
}

.nav-button:hover {
  border-color: var(--presentation-accent);
  background: rgba(30, 215, 96, 0.1);
}

.nav-button.primary {
  border-color: var(--presentation-accent);
  color: #06100a;
  background: var(--presentation-accent);
}

.dots {
  display: flex;
  max-width: min(45vw, 620px);
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
}

.dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #334155;
}

.dot.active {
  width: 22px;
  border-radius: 999px;
  background: var(--presentation-accent);
}

@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.cfs-concept-layout > .panel {
  padding: 1.25rem;
}

.eevdf-concept-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.eevdf-concept-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.4rem;
}

.eevdf-concept-card h2 {
  margin: 0;
}

.eevdf-concept-card p {
  margin: 0;
  color: var(--presentation-muted);
  line-height: 1.5;
}

.eevdf-concept-card .panel-label {
  margin-bottom: 0;
}

.eevdf-concept-card p strong {
  color: var(--presentation-text);
}

.eevdf-concept-formula {
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid var(--presentation-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.035);
}

.eevdf-concept-formula code {
  overflow-wrap: anywhere;
  color: var(--presentation-text);
}

.eevdf-concept-formula small {
  color: var(--presentation-muted);
  line-height: 1.4;
}

.calculos-simulacao {
  margin-top: 1.25rem;
  padding: 1.15rem;
  border: 1px solid var(--presentation-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
}

.calculos-simulacao-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.calculos-simulacao-header h2 {
  margin: 0;
}

.calculos-simulacao-header label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--presentation-muted);
  font-size: 0.85rem;
}

.calculos-simulacao-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(220px, 1fr);
  gap: 1rem;
}

.calculos-simulacao-list {
  display: grid;
  align-content: start;
  gap: 0.65rem;
}

.calculos-simulacao-list p {
  margin: 0;
  color: var(--presentation-muted);
  font-size: 0.82rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.calculos-simulacao-list strong {
  color: var(--presentation-text);
}

.calculos-simulacao-list small,
.decisao-simulacao small {
  color: var(--presentation-muted);
  line-height: 1.5;
}

.decisao-simulacao {
  display: grid;
  align-content: start;
  gap: 0.7rem;
  padding: 1rem;
  border: 1px solid rgba(30, 215, 96, 0.24);
  border-radius: 12px;
  background: rgba(30, 215, 96, 0.06);
}

.decisao-simulacao .panel-label {
  margin-bottom: 0;
}

.decisao-simulacao > strong {
  color: var(--presentation-accent);
}

.decisao-simulacao ul {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.decisao-simulacao li {
  display: flex;
  gap: 0.55rem;
  color: var(--presentation-muted);
  font-size: 0.8rem;
}

.nice-details {
  margin-top: 1rem;
  color: var(--presentation-muted);
}

.nice-details summary {
  color: var(--presentation-accent);
  cursor: pointer;
}

.nice-details table {
  margin-top: 0.75rem;
}

.nice-details th,
.nice-details td {
  padding: 0.35rem 0.55rem;
}

.simulator {
  padding: 1.15rem;
}

.simulator-top,
.simulator-presets,
.simulator-result {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.7rem;
}

.simulator-top {
  justify-content: space-between;
}

.simulator-presets button,
.simulator select {
  padding: 0.42rem 0.55rem;
  border: 1px solid var(--presentation-border-strong);
  border-radius: 8px;
  color: var(--presentation-text);
  background: #101a14;
}

.simulator-presets button {
  cursor: pointer;
}

.simulator-presets button:hover {
  border-color: var(--presentation-accent);
}

.simulator-table-wrap {
  width: 100%;
  margin-top: 0.8rem;
  overflow-x: auto;
}

.simulator table {
  min-width: 720px;
  font-size: 0.8rem;
}

.simulator th,
.simulator td {
  padding: 0.55rem 0.4rem;
  white-space: nowrap;
}

.simulator .simulation-ineligible {
  opacity: 0.62;
}

.simulator-share {
  display: flex;
  overflow: hidden;
  height: 13px;
  margin-top: 1rem;
  border-radius: 999px;
  background: #243128;
}

.simulator-share span {
  min-width: 2px;
}

.simulator-result {
  display: grid;
  gap: 0.4rem;
  margin-top: 1rem;
  color: var(--presentation-muted);
  font-size: 0.82rem;
}

.simulator-result strong {
  color: var(--presentation-accent);
}

.simulator-timeline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  min-height: 30px;
  margin-top: 0.8rem;
}

.simulator-timeline span {
  display: grid;
  width: 27px;
  height: 27px;
  place-items: center;
  border-radius: 5px;
  color: #07100c;
  font-size: 0.72rem;
  font-weight: 800;
}

.simulator-timeline small {
  color: var(--presentation-muted);
}

.simulation-controls label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--presentation-muted);
  font-size: 0.8rem;
}

.diagram-explainer ol,
.allocator-panel ol {
  display: grid;
  gap: 0.65rem;
  padding-left: 1.25rem;
  color: var(--presentation-muted);
  line-height: 1.5;
}

.memory-diagram {
  display: grid;
  grid-template-columns: 1fr 0.9fr 1fr;
  gap: 1rem;
}

.memory-example,
.mmu-example {
  display: grid;
  align-content: start;
  gap: 0.65rem;
}

.memory-example > span:not(.panel-label) {
  color: var(--presentation-muted);
  font-size: 0.8rem;
}

.memory-example .panel-label,
.mmu-example .panel-label {
  margin: 0;
}

.ram-example {
  margin-top: 1rem;
}

.ram-frames {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.6rem;
}

.ram-frames > div {
  display: grid;
  gap: 0.35rem;
  padding: 0.75rem;
  border: 1px solid var(--presentation-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.035);
}

.ram-frames small {
  color: var(--presentation-muted);
}

.ram-a { border-color: rgba(96, 165, 250, 0.6) !important; }
.ram-b { border-color: rgba(245, 158, 11, 0.6) !important; }

.pages-illustration {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
}

.pages-illustration > div {
  display: grid;
  gap: 0.5rem;
  padding: 0.85rem;
  border: 1px solid var(--presentation-border-strong);
  border-radius: 10px;
  background: rgba(30, 215, 96, 0.08);
}

.pages-illustration span {
  color: var(--presentation-muted);
  font-size: 0.78rem;
}

.protection-cases h2,
.protection-responsibilities p {
  margin-top: 0.5rem;
}

.state-mode-selector,
.state-current {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.75rem;
}

.state-mode-selector button {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--presentation-border-strong);
  border-radius: 9px;
  color: var(--presentation-text);
  background: var(--presentation-surface);
  cursor: pointer;
}

.state-mode-selector button.active {
  border-color: var(--presentation-accent);
  color: var(--presentation-accent);
  background: rgba(30, 215, 96, 0.1);
}

.state-current {
  color: var(--presentation-muted);
  font-size: 0.85rem;
}

.state-current strong {
  color: var(--presentation-text);
}

.state-timeline {
  display: flex;
  overflow: hidden;
  min-height: 34px;
  margin-top: 0.85rem;
  border-radius: 8px;
}

.state-timeline span {
  display: grid;
  min-width: 0;
  place-items: center;
  color: #07100c;
  font-size: 0.7rem;
  font-weight: 800;
  white-space: nowrap;
}

.card-group-title {
  margin: 1.2rem 0 0.5rem;
  color: var(--presentation-text);
  font-size: 1rem;
}

.scheduler-overview {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
}

.overview-level {
  width: min(650px, 100%);
  padding: 0.9rem;
  border: 1px solid var(--presentation-border);
  border-radius: 12px;
  text-align: center;
  background: var(--presentation-surface);
}

.overview-arrow {
  color: var(--presentation-accent);
  font-size: 1.25rem;
}

.scheduler-overview .scheduler-comparison {
  width: 100%;
}

@media (max-width: 900px) {
  .memory-diagram {
    grid-template-columns: 1fr;
  }

  .ram-frames {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .calculos-simulacao-layout {
    grid-template-columns: 1fr;
  }

  .eevdf-concept-grid {
    grid-template-columns: 1fr;
  }

  .cover-grid,
  .architecture-layout,
  .thread-layout,
  .memory-layout,
  .allocation-layout,
  .worker-layout,
  .periodic-layout,
  .pidstat-layout,
  .vm-layout,
  .dashboard-mock {
    grid-template-columns: 1fr;
  }

  .process-flow {
    grid-template-columns: 1fr;
  }

  .process-flow .flow-arrow {
    transform: rotate(90deg);
  }

  .comparison-grid,
  .scheduler-comparison,
  .cfs-layout,
  .weight-layout,
  .http-flow {
    grid-template-columns: 1fr;
  }

  .three-columns,
  .policy-grid,
  .eevdf-decisions {
    grid-template-columns: repeat(2, 1fr);
  }

  .memory-arrow {
    transform: rotate(90deg);
  }

  .cpu-affinity-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .mock-sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--presentation-border);
  }

  .app-architecture,
  .scheduler-flow,
  .eevdf-flow {
    flex-wrap: wrap;
  }

  .app-arrow,
  .scheduler-flow > .flow-arrow,
  .eevdf-flow > .flow-arrow {
    transform: rotate(90deg);
  }
}

@media (max-width: 620px) {
  .topbar {
    padding: 0 1rem;
  }

  .brand div {
    display: none;
  }

  .stage {
    padding: 98px 1rem 108px;
  }

  .controls {
    padding: 0 1rem;
  }

  .dots {
    display: none;
  }

  .nav-button {
    min-width: auto;
  }

  .cover-orbit {
    min-height: 280px;
  }

  .orbit-c {
    width: 270px;
    height: 270px;
  }

  .orbit-b {
    width: 220px;
    height: 220px;
  }

  .thread-cards,
  .three-columns,
  .policy-grid,
  .eevdf-decisions,
  .process-state-cards,
  .mock-context,
  .mock-processes,
  .mock-charts {
    grid-template-columns: 1fr;
  }

  .tree-branches,
  .experiment-columns,
  .dynamic-shares {
    grid-template-columns: 1fr;
  }

  .policy-result {
    grid-template-columns: 1fr;
  }

  .cover-footer {
    display: grid;
  }
}
</style>
