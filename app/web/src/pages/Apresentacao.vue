<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const slideAtual = ref(0);
const totalSlides = 28;

const slides = [
  "Apresentação",
  "Arquitetura de Sistemas Operacionais",
  "Do programa ao processo",
  "Processos e threads",
  "Concorrência e paralelismo",
  "Memória virtual",
  "Alocação dinâmica",
  "Proteção e falhas de página",
  "Estados de execução",
  "Fundamentos do escalonamento",
  "Políticas de escalonamento",
  "CFS e vruntime",
  "CFS, nice e pesos",
  "EEVDF: lag e elegibilidade",
  "EEVDF em ação",
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

const fasesEstados = [
  {
    titulo: "Criação",
    descricao: "O kernel cria as tarefas A, B e C.",
    tarefas: { A: "criado", B: "criado", C: "criado" },
  },
  {
    titulo: "Fila de prontas",
    descricao: "As três tarefas estão aptas a disputar a vCPU 0.",
    tarefas: { A: "pronto", B: "pronto", C: "pronto" },
  },
  {
    titulo: "A executa",
    descricao: "A ocupa a vCPU 0; B e C aguardam na fila de prontas.",
    tarefas: { A: "execucao", B: "pronto", C: "pronto" },
  },
  {
    titulo: "Preempção",
    descricao: "A retorna ao estado pronto e B recebe a vCPU 0.",
    tarefas: { A: "pronto", B: "execucao", C: "pronto" },
  },
  {
    titulo: "C executa",
    descricao: "C recebe CPU para realizar uma pequena rajada de trabalho.",
    tarefas: { A: "pronto", B: "pronto", C: "execucao" },
  },
  {
    titulo: "C aguarda",
    descricao: "C chama nanosleep() e entra em espera; A passa a executar.",
    tarefas: { A: "execucao", B: "pronto", C: "espera" },
  },
  {
    titulo: "B executa",
    descricao: "A é preemptada; B recebe a vCPU enquanto C ainda espera.",
    tarefas: { A: "pronto", B: "execucao", C: "espera" },
  },
  {
    titulo: "Despertar de C",
    descricao: "O temporizador termina; C volta ao estado pronto.",
    tarefas: { A: "execucao", B: "pronto", C: "pronto" },
  },
  {
    titulo: "Término",
    descricao: "A, B e C concluem a duração alvo e finalizam.",
    tarefas: { A: "finalizado", B: "finalizado", C: "finalizado" },
  },
];

const faseEstado = ref(0);
let temporizadorEstados;

const faseAtual = computed(() => fasesEstados[faseEstado.value]);

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

  temporizadorEstados = window.setInterval(() => {
    faseEstado.value = (faseEstado.value + 1) % fasesEstados.length;
  }, 1100);
}

function pararSimulacaoEstados() {
  if (temporizadorEstados) {
    window.clearInterval(temporizadorEstados);
    temporizadorEstados = undefined;
  }
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

watch(slideAtual, (indice) => {
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
            <h1>Arquitetura de um Sistema Operacional</h1>
            <p class="question">
              O que acontece entre executar um comando e utilizar a CPU?
            </p>
          </div>

          <div class="architecture-layout">
            <div class="architecture-stack">
              <div class="layer application-layer">
                <span>Espaço do usuário</span>
                <strong>Aplicações e scripts</strong>
                <p>Terminal, Bash, compilador, programas e dashboard.</p>
              </div>

              <div class="arrow-down">↓ chamadas de sistema</div>

              <div class="layer kernel-layer">
                <span>Modo privilegiado</span>
                <strong>Kernel Linux</strong>

                <div class="kernel-services">
                  <span>Processos</span>
                  <span>Memória</span>
                  <span>Arquivos</span>
                  <span>Escalonador</span>
                  <span>Drivers</span>
                </div>
              </div>

              <div class="arrow-down">↓ acesso controlado</div>

              <div class="layer hardware-layer">
                <span>Camada física</span>
                <strong>Hardware</strong>

                <div class="hardware-items">
                  <span>CPU</span>
                  <span>RAM</span>
                  <span>Disco</span>
                  <span>Rede</span>
                  <span>Temporizador</span>
                </div>
              </div>
            </div>

            <aside class="scenario-panel">
              <span class="panel-label">EXEMPLO PRÁTICO</span>
              <code>./scripts/exp1.sh 10</code>

              <ol>
                <li>O Bash interpreta o script.</li>
                <li>O script solicita execução dos programas.</li>
                <li>O kernel cria e gerencia as tarefas.</li>
                <li>O escalonador decide quem recebe CPU.</li>
                <li>Os programas registram e devolvem resultados.</li>
              </ol>

              <p class="note">
                Aplicações não controlam diretamente a CPU: elas solicitam
                serviços ao kernel.
              </p>
            </aside>
          </div>
        </article>

        <!-- Slide 3 -->
        <article v-else-if="slideAtual === 2" key="slide-3" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">PROCESSOS</span>
            <h1>Do programa ao processo</h1>
            <p class="question">
              O que o kernel cria quando um programa começa a executar?
            </p>
          </div>

          <div class="process-flow">
            <div class="flow-card executable">
              <span class="panel-label">ARQUIVO NO DISCO</span>
              <strong>cpu_bound_worker</strong>
              <code>binário executável</code>
            </div>

            <div class="flow-arrow">execve() →</div>

            <div class="flow-card kernel-create">
              <span class="panel-label">KERNEL</span>
              <strong>Cria o processo</strong>
              <p>PID, permissões, contexto e espaço virtual.</p>
            </div>

            <div class="flow-arrow">→</div>

            <div class="flow-card process-box">
              <span class="panel-label">PROCESSO</span>
              <strong>PID 8156</strong>

              <div class="memory-regions">
                <span>Código</span>
                <span>Dados</span>
                <span>Área dinâmica</span>
                <span>Pilha</span>
              </div>

              <div class="thread-line">
                <span>Thread principal</span>
                <span>PC · registradores · pilha</span>
              </div>
            </div>
          </div>

          <div class="three-columns">
            <div class="panel">
              <span class="panel-label">CONTEXTO DE SOFTWARE</span>
              <p>PID, estado, permissões, arquivos abertos e prioridade.</p>
            </div>

            <div class="panel">
              <span class="panel-label">ESPAÇO VIRTUAL</span>
              <p>Endereços lógicos próprios, separados de outros processos.</p>
            </div>

            <div class="panel">
              <span class="panel-label">CONTEXTO DE HARDWARE</span>
              <p>PC, registradores e pilha usados enquanto a thread executa.</p>
            </div>
          </div>

          <p class="bottom-message">
            Um processo é mais que “um programa em execução”: é o ambiente
            isolado e gerenciado pelo kernel para executar um programa.
          </p>
        </article>

        <!-- Slide 4 -->
        <article v-else-if="slideAtual === 3" key="slide-4" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">PROCESSOS E THREADS</span>
            <h1>Recursos compartilhados e fluxos independentes</h1>
            <p class="question">
              O que o processo compartilha e o que cada thread precisa possuir?
            </p>
          </div>

          <div class="thread-layout">
            <div class="process-container">
              <span class="container-title">Processo P</span>

              <div class="shared-area">
                <strong>Recursos compartilhados</strong>
                <div>
                  <span>Espaço virtual</span>
                  <span>Código</span>
                  <span>Dados globais</span>
                  <span>Área dinâmica</span>
                  <span>Arquivos abertos</span>
                </div>
              </div>

              <div class="thread-cards">
                <div class="thread-card">
                  <strong>Thread 1</strong>
                  <span>PC próprio</span>
                  <span>Registradores próprios</span>
                  <span>Pilha própria</span>
                  <span>Estado próprio</span>
                </div>

                <div class="thread-card">
                  <strong>Thread 2</strong>
                  <span>PC próprio</span>
                  <span>Registradores próprios</span>
                  <span>Pilha própria</span>
                  <span>Estado próprio</span>
                </div>
              </div>
            </div>

            <aside class="panel explanation-panel">
              <span class="panel-label">IDEIA PRINCIPAL</span>
              <p>
                O processo funciona como um contêiner lógico de recursos.
                Threads são fluxos independentes de execução dentro dele.
              </p>

              <hr />

              <p>
                No laboratório, cada trabalhador possui essencialmente uma
                thread principal. Assim, A, B e C representam fluxos de
                execução diretamente comparáveis pelo escalonador.
              </p>
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
            <h1>Isolamento entre processos</h1>
            <p class="question">
              Como processos usam a mesma RAM sem sobrescrever os dados uns dos outros?
            </p>
          </div>

          <div class="memory-layout">
            <div class="virtual-process">
              <span class="panel-label">PROCESSO A</span>
              <h2>Endereços virtuais</h2>

              <div class="virtual-map">
                <span>Código</span>
                <span>Dados</span>
                <span>Área dinâmica</span>
                <span>Pilha</span>
              </div>

              <small>0x7fff...</small>
            </div>

            <div class="memory-arrow">
              <strong>MMU</strong>
              <span>tabelas de páginas</span>
              <b>→</b>
            </div>

            <div class="physical-memory">
              <span class="panel-label">RAM FÍSICA</span>
              <h2>Frames</h2>

              <div class="frames">
                <span>Frame 24</span>
                <span>Frame 47</span>
                <span>Frame 93</span>
                <span>Frame 108</span>
              </div>
            </div>

            <div class="memory-arrow">
              <strong>MMU</strong>
              <span>tabelas de páginas</span>
              <b>←</b>
            </div>

            <div class="virtual-process">
              <span class="panel-label">PROCESSO B</span>
              <h2>Endereços virtuais</h2>

              <div class="virtual-map">
                <span>Código</span>
                <span>Dados</span>
                <span>Área dinâmica</span>
                <span>Pilha</span>
              </div>

              <small>0x7fff...</small>
            </div>
          </div>

          <div class="three-columns">
            <div class="panel">
              <span class="panel-label">ENDEREÇO VIRTUAL</span>
              <p>Cada processo enxerga seu próprio espaço lógico de memória.</p>
            </div>

            <div class="panel">
              <span class="panel-label">ENDEREÇO FÍSICO</span>
              <p>A RAM é organizada em frames físicos compartilhados pelo sistema.</p>
            </div>

            <div class="panel">
              <span class="panel-label">ISOLAMENTO</span>
              <p>A MMU aplica o mapeamento definido pelo kernel para cada processo.</p>
            </div>
          </div>
        </article>

        <!-- Slide 7 -->
        <article v-else-if="slideAtual === 6" key="slide-7" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">ALOCAÇÃO DINÂMICA</span>
            <h1>Do malloc às páginas de memória</h1>
            <p class="question">
              Quando um programa solicita 400 bytes, quem fornece essa memória?
            </p>
          </div>

          <div class="allocation-layout">
            <section class="panel code-panel">
              <span class="panel-label">PROGRAMA C</span>
              <pre><code>int *vetor = malloc(
  100 * sizeof(*vetor)
);

vetor[0] = 10;

free(vetor);</code></pre>

              <p>
                Em uma arquitetura comum, <code>int</code> ocupa 4 bytes:
                <strong>100 × 4 = 400 bytes</strong>.
              </p>
            </section>

            <section class="panel allocator-panel">
              <span class="panel-label">ALOCADOR DA BIBLIOTECA C</span>
              <h2>Área dinâmica</h2>

              <div class="page-view">
                <span class="page-title">Página virtual de 4 KiB</span>
                <div class="page-segments">
                  <span class="metadata">metadados</span>
                  <span class="allocation">vetor: 400 B</span>
                  <span class="free-space">espaço livre</span>
                </div>
              </div>

              <p>
                O alocador divide páginas já disponíveis em blocos menores para
                atender chamadas como <code>malloc()</code>.
              </p>
            </section>
          </div>

          <div class="bottom-message">
            <strong>malloc()</strong> entrega um bloco lógico ao programa.
            <strong>O kernel administra páginas</strong>, não cada variável ou
            bloco individual criado pelo código C.
          </div>
        </article>

        <!-- Slide 8 -->
        <article v-else-if="slideAtual === 7" key="slide-8" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">PROTEÇÃO DE MEMÓRIA</span>
            <h1>Falhas de página e violações de acesso</h1>
            <p class="question">
              O que ocorre quando uma thread tenta acessar um endereço de memória?
            </p>
          </div>

          <div class="decision-tree">
            <div class="tree-node start-node">
              <code>vetor[0] = 10</code>
              <span>tentativa de acesso</span>
            </div>

            <div class="tree-arrow">↓</div>

            <div class="tree-node mmu-node">
              <strong>MMU consulta a tabela de páginas</strong>
              <span>o endereço virtual é válido e permitido?</span>
            </div>

            <div class="tree-branches">
              <div class="branch">
                <span class="branch-label success">Válido e residente</span>
                <div class="tree-arrow">↓</div>
                <div class="tree-node success-node">
                  <strong>Acesso realizado</strong>
                  <span>a instrução continua</span>
                </div>
              </div>

              <div class="branch">
                <span class="branch-label warning">Válido, mas ausente da RAM</span>
                <div class="tree-arrow">↓</div>
                <div class="tree-node warning-node">
                  <strong>Falha de página</strong>
                  <span>kernel mapeia ou busca a página</span>
                </div>
              </div>

              <div class="branch">
                <span class="branch-label danger">Inválido ou sem permissão</span>
                <div class="tree-arrow">↓</div>
                <div class="tree-node danger-node">
                  <strong>Violação de acesso</strong>
                  <span>normalmente SIGSEGV</span>
                </div>
              </div>
            </div>
          </div>

          <div class="highlight-strip">
            Uma falha de página pode ser normal. Uma violação de proteção não é
            uma “alocação inválida detectada pelo malloc”, mas uma violação no
            mapeamento ou nas permissões de memória.
          </div>
        </article>

        <!-- Slide 9 -->
        <article v-else-if="slideAtual === 8" key="slide-9" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">CICLO DE VIDA</span>
            <h1>Estados de execução de uma tarefa</h1>
            <p class="question">
              Como uma tarefa deixa a CPU, aguarda um evento e volta a executar?
            </p>
          </div>

          <div class="state-simulation">
            <div class="simulation-header">
              <div>
                <span class="panel-label">SIMULAÇÃO AUTOMÁTICA</span>
                <h2>{{ faseAtual.titulo }}</h2>
                <p>{{ faseAtual.descricao }}</p>
              </div>

              <span class="simulation-progress">
                {{ faseEstado + 1 }} / {{ fasesEstados.length }}
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
                marker-end="url(#arrowhead)"
              />

              <path
                d="M530 120 H640"
                class="state-arrow"
                marker-end="url(#arrowhead)"
              />

              <path
                d="M790 175 V265"
                class="state-arrow"
                marker-end="url(#arrowhead)"
              />

              <path
                d="M645 325 H530"
                class="state-arrow"
                marker-end="url(#arrowhead)"
              />

              <path
                d="M405 265 V180"
                class="state-arrow"
                marker-end="url(#arrowhead)"
              />

              <path
                d="M920 120 H1000"
                class="state-arrow"
                marker-end="url(#arrowhead)"
              />

              <text x="272" y="102" class="arrow-text">admissão</text>
              <text x="558" y="102" class="arrow-text">despacho</text>
              <text x="810" y="225" class="arrow-text">I/O, sleep ou evento</text>
              <text x="545" y="307" class="arrow-text">evento concluído</text>
              <text x="335" y="225" class="arrow-text">preempção</text>
              <text x="922" y="102" class="arrow-text">término</text>

              <g :class="{ active: estadoAtivo('criado') }">
                <rect x="55" y="70" width="185" height="100" rx="50" class="state-node" />
                <text x="147" y="126" class="state-title">Criado</text>
              </g>

              <g :class="{ active: estadoAtivo('pronto') }">
                <rect x="320" y="70" width="210" height="100" rx="50" class="state-node" />
                <text x="425" y="126" class="state-title">Pronto</text>
              </g>

              <g :class="{ active: estadoAtivo('execucao') }">
                <rect x="640" y="70" width="280" height="100" rx="50" class="state-node" />
                <text x="780" y="126" class="state-title">Em execução</text>
              </g>

              <g :class="{ active: estadoAtivo('espera') }">
                <rect x="640" y="270" width="185" height="100" rx="50" class="state-node" />
                <text x="732" y="326" class="state-title">Em espera</text>
              </g>

              <g :class="{ active: estadoAtivo('finalizado') }">
                <rect x="930" y="70" width="155" height="100" rx="50" class="state-node" />
                <text x="1007" y="126" class="state-title">Finalizado</text>
              </g>
            </svg>

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

            <p class="simulation-note">
              Simulação didática: representa eventos típicos, não uma amostra
              real coletada pelo pidstat.
            </p>
          </div>
        </article>

        <!-- Slide 10 -->
        <article v-else-if="slideAtual === 9" key="slide-10" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">ESCALONAMENTO</span>
            <h1>Como o kernel escolhe a próxima tarefa?</h1>
            <p class="question">
              Quando A, B e C estão prontas, qual delas deve executar na vCPU 0?
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
                <span class="process-c muted">C em espera</span>
              </div>
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
              <strong>A → vCPU 0</strong>
            </div>
          </div>

          <div class="policy-grid compact-policy-grid">
            <div class="policy-card">
              <strong>FCFS</strong>
              <p>Atende primeiro quem entrou primeiro na fila.</p>
            </div>

            <div class="policy-card">
              <strong>Round Robin</strong>
              <p>Alterna tarefas prontas por fatias de tempo.</p>
            </div>

            <div class="policy-card">
              <strong>Prioridades</strong>
              <p>Favorece tarefas com maior prioridade relativa.</p>
            </div>

            <div class="policy-card">
              <strong>SJF / SRTF</strong>
              <p>Favorece menor rajada estimada de CPU.</p>
            </div>

            <div class="policy-card">
              <strong>Justiça</strong>
              <p>Busca distribuição proporcional de serviço.</p>
            </div>

            <div class="policy-card">
              <strong>Tempo real</strong>
              <p>Prioriza cumprimento de prazos definidos.</p>
            </div>
          </div>

          <div class="metrics-row">
            <span>Tempo de resposta</span>
            <span>Tempo de espera</span>
            <span>Tempo de retorno</span>
            <span>Vazão</span>
            <span>Utilização</span>
            <span>Justiça</span>
          </div>
        </article>

        <!-- Slide 11 -->
        <article v-else-if="slideAtual === 10" key="slide-11" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">POLÍTICAS</span>
            <h1>A mesma carga, decisões diferentes</h1>
            <p class="question">
              Por que a mesma fila de prontas pode produzir resultados diferentes?
            </p>
          </div>

          <div class="shared-scenario">
            <span class="panel-label">CENÁRIO COMUM</span>
            <div>
              <span class="process-a">A pronta</span>
              <span class="process-b">B executando</span>
              <span class="process-c">C retorna da espera</span>
            </div>
          </div>

          <div class="policy-results">
            <div class="policy-result">
              <strong>FCFS</strong>
              <div class="mini-timeline">
                <span class="process-b">B continua</span>
                <span class="process-a">A</span>
                <span class="process-c">C</span>
              </div>
              <p>C pode aguardar tarefas que chegaram antes.</p>
            </div>

            <div class="policy-result">
              <strong>Round Robin</strong>
              <div class="mini-timeline">
                <span class="process-b">B</span>
                <span class="process-a">A</span>
                <span class="process-c">C</span>
              </div>
              <p>C entra na rotação após a fatia atual.</p>
            </div>

            <div class="policy-result">
              <strong>Prioridades</strong>
              <div class="mini-timeline">
                <span class="process-b">B</span>
                <span class="process-c">C</span>
                <span class="process-a">A</span>
              </div>
              <p>Se C for mais prioritária, pode executar antes.</p>
            </div>

            <div class="policy-result">
              <strong>SRTF</strong>
              <div class="mini-timeline">
                <span class="process-b">B</span>
                <span class="process-c">C</span>
                <span class="process-a">A</span>
              </div>
              <p>C pode ser escolhida por possuir rajada curta estimada.</p>
            </div>

            <div class="policy-result">
              <strong>Justiça proporcional</strong>
              <div class="mini-timeline">
                <span class="process-b">B</span>
                <span class="process-a">A</span>
                <span class="process-c">C</span>
              </div>
              <p>A decisão considera pesos e serviço já recebido.</p>
            </div>
          </div>

          <div class="bottom-message">
            Não existe política universalmente melhor: sistemas interativos,
            servidores, lotes e tarefas de tempo real possuem objetivos diferentes.
          </div>
        </article>

        <!-- Slide 12 -->
        <article v-else-if="slideAtual === 11" key="slide-12" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">CFS</span>
            <h1>Justiça por tempo virtual</h1>
            <p class="question">
              Como dividir a CPU sem depender apenas de uma fila FIFO?
            </p>
          </div>

          <div class="cfs-layout">
            <section class="panel">
              <span class="panel-label">TAREFAS PRONTAS</span>

              <div class="vruntime-list">
                <div>
                  <span class="process-b">B</span>
                  <strong>vruntime: 36</strong>
                  <small>menor valor</small>
                </div>

                <div>
                  <span class="process-a">A</span>
                  <strong>vruntime: 40</strong>
                  <small>recebeu mais serviço virtual</small>
                </div>

                <div class="disabled">
                  <span class="process-c">C</span>
                  <strong>em espera</strong>
                  <small>não participa</small>
                </div>
              </div>
            </section>

            <section class="panel cfs-choice">
              <span class="panel-label">DECISÃO DO CFS</span>
              <h2>Menor vruntime</h2>
              <div class="selection-ring process-b">B</div>
              <p>
                O CFS tende a escolher a tarefa pronta que recebeu menos serviço
                virtual proporcionalmente.
              </p>
            </section>
          </div>

          <div class="formula-strip">
            <code>Δvruntime ≈ Δtempo_real × (1024 / peso)</code>
          </div>

          <div class="three-columns">
            <div class="panel">
              <span class="panel-label">vruntime</span>
              <p>Tempo de CPU normalizado pelo peso da tarefa.</p>
            </div>

            <div class="panel">
              <span class="panel-label">PESO</span>
              <p>Representa a participação proporcional esperada.</p>
            </div>

            <div class="panel">
              <span class="panel-label">PREEMPÇÃO</span>
              <p>Permite reavaliar a decisão para preservar justiça.</p>
            </div>
          </div>
        </article>

        <!-- Slide 13 -->
        <article v-else-if="slideAtual === 12" key="slide-13" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">CFS E NICE</span>
            <h1>Prioridade altera a proporção de CPU</h1>
            <p class="question">
              Por que A recebe mais CPU que B com nice 0 e nice 10?
            </p>
          </div>

          <div class="weight-layout">
            <section class="panel">
              <span class="panel-label">ENTRADAS</span>

              <div class="weight-rows">
                <div class="weight-row process-a">
                  <span>Processo A</span>
                  <strong>nice 0</strong>
                  <b>peso 1024</b>
                </div>

                <div class="weight-row process-b">
                  <span>Processo B</span>
                  <strong>nice 10</strong>
                  <b>peso 110</b>
                </div>
              </div>

              <p>
                O kernel mapeia o valor de <code>nice</code> para uma tabela de
                pesos. Nice não é uma porcentagem direta.
              </p>
            </section>

            <section class="panel calculation-panel">
              <span class="panel-label">PARTICIPAÇÃO ESPERADA</span>

              <code>A = 1024 / (1024 + 110) = 90,3%</code>
              <code>B = 110 / (1024 + 110) = 9,7%</code>

              <div class="share-bars">
                <span class="share-a">A — 90,3%</span>
                <span class="share-b">B — 9,7%</span>
              </div>
            </section>
          </div>

          <div class="vruntime-example">
            <span class="panel-label">EXEMPLO COM 1 ms DE EXECUÇÃO</span>

            <div>
              <strong>A:</strong>
              <code>Δvruntime = 1 × (1024 / 1024) = 1,00</code>
            </div>

            <div>
              <strong>B:</strong>
              <code>Δvruntime = 1 × (1024 / 110) = 9,31</code>
            </div>
          </div>

          <p class="bottom-message">
            B continua executando. Ele não está em inanição: possui menor
            participação proporcional, mas não é removido permanentemente da disputa.
          </p>
        </article>

        <!-- Slide 14 -->
        <article v-else-if="slideAtual === 13" key="slide-14" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">EEVDF</span>
            <h1>Elegibilidade e prazo virtual</h1>
            <p class="question">
              Antes de escolher a próxima tarefa, quais tarefas podem disputar a CPU?
            </p>
          </div>

          <div class="eevdf-flow">
            <div class="eevdf-step">
              <span>1</span>
              <strong>Serviço ideal</strong>
              <p>CPU que cada tarefa deveria receber pelo seu peso.</p>
            </div>

            <div class="flow-arrow">→</div>

            <div class="eevdf-step">
              <span>2</span>
              <strong>lag</strong>
              <p>Diferença entre serviço ideal e serviço recebido.</p>
            </div>

            <div class="flow-arrow">→</div>

            <div class="eevdf-step">
              <span>3</span>
              <strong>Elegibilidade</strong>
              <p>Tarefas com lag positivo ou zero podem disputar.</p>
            </div>

            <div class="flow-arrow">→</div>

            <div class="eevdf-step">
              <span>4</span>
              <strong>Prazo virtual</strong>
              <p>Menor prazo virtual vence entre as elegíveis.</p>
            </div>
          </div>

          <div class="lag-table panel">
            <span class="panel-label">DECISÃO DIDÁTICA</span>

            <table>
              <thead>
                <tr>
                  <th>Processo</th>
                  <th>lag</th>
                  <th>Elegível?</th>
                  <th>Prazo virtual</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td class="process-a">A</td>
                  <td>+4</td>
                  <td>Sim</td>
                  <td>135</td>
                </tr>

                <tr class="disabled">
                  <td class="process-b">B</td>
                  <td>-4</td>
                  <td>Não</td>
                  <td>—</td>
                </tr>

                <tr>
                  <td class="process-c">C</td>
                  <td>+1</td>
                  <td>Sim</td>
                  <td>118</td>
                </tr>
              </tbody>
            </table>

            <p>
              C é escolhida: está elegível e possui o menor prazo virtual.
            </p>
          </div>

          <div class="highlight-strip">
            <strong>lag não é tempo de espera.</strong>
            É a diferença entre o serviço ideal e o serviço que a tarefa recebeu.
          </div>
        </article>

        <!-- Slide 15 -->
        <article v-else-if="slideAtual === 14" key="slide-15" class="slide">
          <div class="slide-heading">
            <span class="eyebrow">EEVDF EM AÇÃO</span>
            <h1>A, B e C em uma decisão completa</h1>
            <p class="question">
              Como lag e prazo virtual mudam a cada decisão do escalonador?
            </p>
          </div>

          <div class="eevdf-decisions">
            <section class="decision-card">
              <span class="panel-label">DECISÃO 1</span>
              <h2>C é selecionada</h2>

              <div class="decision-values">
                <span class="process-a">A: lag +3 · VD 130</span>
                <span class="process-b muted">B: lag -2 · inelegível</span>
                <span class="process-c">C: lag +1 · VD 118</span>
              </div>

              <strong>C possui o menor prazo virtual elegível.</strong>
            </section>

            <section class="decision-card">
              <span class="panel-label">DECISÃO 2</span>
              <h2>A é selecionada</h2>

              <div class="decision-values">
                <span class="process-a">A: lag +3 · VD 130</span>
                <span class="process-b muted">B: lag -1 · inelegível</span>
                <span class="process-c muted">C: lag -1 · inelegível</span>
              </div>

              <strong>A é a única tarefa elegível.</strong>
            </section>

            <section class="decision-card">
              <span class="panel-label">DECISÃO 3</span>
              <h2>C é selecionada novamente</h2>

              <div class="decision-values">
                <span class="process-a muted">A: lag -1 · inelegível</span>
                <span class="process-b">B: lag +2 · VD 126</span>
                <span class="process-c">C: lag +1 · VD 123</span>
              </div>

              <strong>C vence por possuir o menor prazo virtual.</strong>
            </section>
          </div>

          <div class="formula-strip">
            <code>lag = serviço ideal − serviço recebido</code>
          </div>

          <p class="bottom-message">
            Os valores são didáticos. O objetivo é visualizar que tarefas
            inelegíveis não somem: elas recuperam elegibilidade à medida que as
            demais recebem serviço.
          </p>
        </article>

        <!-- Slide 16 -->
        <article v-else-if="slideAtual === 15" key="slide-16" class="slide">
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

        <!-- Slide 17 -->
        <article v-else-if="slideAtual === 16" key="slide-17" class="slide">
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

        <!-- Slide 18 -->
        <article v-else-if="slideAtual === 17" key="slide-18" class="slide">
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

        <!-- Slide 19 -->
        <article v-else-if="slideAtual === 18" key="slide-19" class="slide">
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

        <!-- Slide 20 -->
        <article v-else-if="slideAtual === 19" key="slide-20" class="slide">
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

        <!-- Slide 21 -->
        <article v-else-if="slideAtual === 20" key="slide-21" class="slide">
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

        <!-- Slide 22 -->
        <article v-else-if="slideAtual === 21" key="slide-22" class="slide">
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

        <!-- Slide 23 -->
        <article v-else-if="slideAtual === 22" key="slide-23" class="slide">
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
              <code>lag_A ≈ lag_B</code>
              <p>
                Pesos iguais produzem a mesma expectativa de serviço proporcional
                entre as tarefas prontas.
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

        <!-- Slide 24 -->
        <article v-else-if="slideAtual === 23" key="slide-24" class="slide">
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

        <!-- Slide 25 -->
        <article v-else-if="slideAtual === 24" key="slide-25" class="slide">
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

              <div class="two-share">
                <span class="process-a">A: 50%</span>
                <span class="process-b">B: 50%</span>
              </div>
            </section>

            <section class="panel">
              <span class="panel-label">C PRONTA</span>
              <code>R(t) = { A, B, C }</code>
              <code>W_total = 3072</code>

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
        </article>

        <!-- Slide 26 -->
        <article v-else-if="slideAtual === 25" key="slide-26" class="slide">
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

        <!-- Slide 27 -->
        <article v-else-if="slideAtual === 26" key="slide-27" class="slide">
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

        <!-- Slide 28 -->
        <article v-else key="slide-28" class="slide">
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
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
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

.metrics-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.metrics-row span {
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--presentation-border);
  border-radius: 999px;
  color: var(--presentation-muted);
  font-size: 0.74rem;
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

@media (max-width: 900px) {
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