<script setup>
import { computed, ref } from "vue";
import {
  ArrowRight,
  Cpu,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Timer,
  UserRoundCog,
} from "lucide-vue-next";

const etapas = [
  {
    titulo: "A está em execução",
    descricao:
      "A utiliza a vCPU 0, enquanto B está pronto para executar.",
    estadoA: "Executando",
    estadoB: "Pronto",
    cpu: "A",
  },
  {
    titulo: "A preempção é decidida",
    descricao:
      "A política determina que é o momento de retirar A da CPU e executar B.",
    estadoA: "Executando",
    estadoB: "Pronto",
    cpu: "Kernel",
  },
  {
    titulo: "Ocorre a troca de contexto",
    descricao:
      "O kernel salva o contexto necessário de A e restaura o de B. A volta ao estado de pronto.",
    estadoA: "Pronto",
    estadoB: "Pronto",
    cpu: "Troca de contexto",
  },
  {
    titulo: "B começa a executar",
    descricao:
      "B utiliza a vCPU. A continua pronto e pode voltar a executar em uma próxima escolha.",
    estadoA: "Pronto",
    estadoB: "Executando",
    cpu: "B",
  },
];

const etapaAtual = ref(0);

const etapa = computed(() => etapas[etapaAtual.value]);
const primeiraEtapa = computed(() => etapaAtual.value === 0);
const ultimaEtapa = computed(
  () => etapaAtual.value === etapas.length - 1,
);

function etapaAnterior() {
  if (!primeiraEtapa.value) {
    etapaAtual.value -= 1;
  }
}

function proximaEtapa() {
  if (!ultimaEtapa.value) {
    etapaAtual.value += 1;
  }
}

function reiniciar() {
  etapaAtual.value = 0;
}
</script>

<template>
  <section class="slide">
    <div class="introducao">
      <span class="categoria">TIPOS DE ESCALONAMENTO</span>

      <h1>Escalonamento preemptivo</h1>

      <p class="pergunta">
        O que acontece quando o sistema interrompe uma tarefa para executar outra?
      </p>
    </div>

    <div class="definicao">
      <div class="definicao__icone">
        <Pause :size="20" />
      </div>

      <p>
        Na <strong>preempção</strong>, o sistema pode retirar uma tarefa da
        CPU antes de ela terminar, conforme a política adotada.
      </p>
    </div>

    <div class="conteudo">
      <!-- Simulação -->
      <article class="painel">
        <div class="painel__cabecalho">
          <div class="painel__icone">
            <Cpu :size="20" />
          </div>

          <div>
            <span class="painel__categoria">SIMULAÇÃO MANUAL</span>
            <h2>A é preemptado para B executar</h2>
          </div>
        </div>

        <div class="processos">
          <div
            class="processo processo--a"
            :class="{ 'processo--ativo': etapa.estadoA === 'Executando' }"
          >
            <span class="processo__letra">A</span>

            <div class="processo__dados">
              <strong>Processo A</strong>
              <small>{{ etapa.estadoA }}</small>
            </div>
          </div>

          <div class="cpu">
            <Cpu :size="23" />
            <span>vCPU 0</span>
            <strong>{{ etapa.cpu }}</strong>
          </div>

          <div
            class="processo processo--b"
            :class="{ 'processo--ativo': etapa.estadoB === 'Executando' }"
          >
            <span class="processo__letra">B</span>

            <div class="processo__dados">
              <strong>Processo B</strong>
              <small>{{ etapa.estadoB }}</small>
            </div>
          </div>
        </div>

        <div class="linha">
          <div class="linha__cabecalho">
            <strong>Linha de execução</strong>
            <span>Etapa {{ etapaAtual + 1 }} de {{ etapas.length }}</span>
          </div>

          <div class="linha__blocos">
            <div class="linha__bloco linha__bloco--a">A executa</div>

            <div
              class="linha__bloco linha__bloco--kernel"
              :class="{ 'linha__bloco--futuro': etapaAtual < 1 }"
            >
              Decisão
            </div>

            <div
              class="linha__bloco linha__bloco--kernel"
              :class="{ 'linha__bloco--futuro': etapaAtual < 2 }"
            >
              Troca
            </div>

            <div
              class="linha__bloco linha__bloco--b"
              :class="{ 'linha__bloco--futuro': etapaAtual < 3 }"
            >
              B executa
            </div>
          </div>
        </div>

        <div class="explicacao" aria-live="polite">
          <strong>{{ etapa.titulo }}</strong>
          <p>{{ etapa.descricao }}</p>
        </div>

        <div class="controles">
          <button
            type="button"
            :disabled="primeiraEtapa"
            @click="etapaAnterior"
          >
            <SkipBack :size="15" />
            Anterior
          </button>

          <button
            type="button"
            class="botao--principal"
            :disabled="ultimaEtapa"
            @click="proximaEtapa"
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

      <!-- Conceitos -->
      <article class="painel">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--azul">
            <UserRoundCog :size="20" />
          </div>

          <div>
            <span class="painel__categoria">RESPONSABILIDADES</span>
            <h2>Decidir e executar a troca</h2>
          </div>
        </div>

        <div class="conceitos">
          <div class="conceito">
            <strong>Escalonador</strong>

            <p>
              Aplica a política e seleciona a tarefa que deve executar.
            </p>
          </div>

          <div class="conceito">
            <strong>Despachante (<em>dispatcher</em>)</strong>

            <p>
              Realiza a transição para a tarefa escolhida, incluindo a
              troca de contexto.
            </p>
          </div>

          <div class="conceito">
            <strong>Troca de contexto</strong>

            <p>
              O kernel preserva o estado necessário da tarefa anterior e
              restaura o da próxima tarefa.
            </p>
          </div>
        </div>

        <div class="politicas">
          <span class="painel__categoria">EXEMPLOS PREEMPTIVOS</span>

          <div class="politicas__lista">
            <span>Circular (Round Robin)</span>
            <span>Menor tempo restante</span>
            <span>Prioridade preemptiva</span>
          </div>

          <p>
            Múltiplas filas também podem ser organizadas de forma preemptiva.
          </p>
        </div>
      </article>
    </div>

    <div class="mensagem">
      <Timer :size="19" />

      <p>
        A preempção permite que outra tarefa execute mesmo que A ainda
        não tenha terminado.
      </p>
    </div>
  </section>
</template>

<style scoped>
.slide {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  color: var(--apresentacao-texto, #f8fafc);
}

.introducao {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.categoria,
.painel__categoria {
  color: var(--apresentacao-destaque, #1ed760);
  font-size: 0.72rem;
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

.definicao,
.mensagem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 13px;
  background: rgba(30, 215, 96, 0.06);
}

.definicao__icone,
.painel__icone {
  display: grid;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 11px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.12);
}

.definicao p,
.mensagem p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.83rem;
  line-height: 1.5;
}

.definicao strong {
  color: #f8fafc;
}

.conteudo {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 16px;
}

.painel {
  min-width: 0;
  padding: 19px;
  border: 1px solid var(
    --apresentacao-borda,
    rgba(226, 232, 240, 0.12)
  );
  border-radius: 18px;
  background: var(--apresentacao-superficie, #101a14);
}

.painel__cabecalho {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 16px;
}

.painel__icone--azul {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

h2 {
  margin: 4px 0 0;
  font-size: 1.08rem;
  font-weight: 650;
}

.processos {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(105px, 0.8fr) minmax(0, 1fr);
  align-items: stretch;
  gap: 8px;
}

.processo,
.cpu {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  min-height: 72px;
  padding: 10px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.14);
}

.processo--a.processo--ativo {
  border-color: rgba(96, 165, 250, 0.5);
  background: rgba(96, 165, 250, 0.07);
}

.processo--b.processo--ativo {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.07);
}

.processo__letra {
  display: grid;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 9px;
  font-size: 0.85rem;
  font-weight: 800;
}

.processo--a .processo__letra {
  color: #93c5fd;
  background: rgba(96, 165, 250, 0.15);
}

.processo--b .processo__letra {
  color: #fcd34d;
  background: rgba(245, 158, 11, 0.15);
}

.processo__dados {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.processo__dados strong,
.cpu strong {
  color: #f8fafc;
  font-size: 0.76rem;
}

.processo__dados small,
.cpu span {
  color: #94a3b8;
  font-size: 0.7rem;
}

.cpu {
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  color: #1ed760;
  text-align: center;
}

.cpu strong {
  line-height: 1.3;
}

.linha {
  margin-top: 13px;
  padding: 12px;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.14);
}

.linha__cabecalho {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.linha__cabecalho strong {
  color: #e2e8f0;
  font-size: 0.76rem;
}

.linha__cabecalho span {
  color: #94a3b8;
  font-size: 0.68rem;
}

.linha__blocos {
  display: flex;
  gap: 5px;
}

.linha__bloco {
  display: grid;
  flex: 1;
  min-height: 34px;
  padding: 5px;
  place-items: center;
  border-radius: 7px;
  font-size: 0.68rem;
  font-weight: 650;
  text-align: center;
  transition: opacity 0.25s ease;
}

.linha__bloco--a {
  color: #bfdbfe;
  background: rgba(96, 165, 250, 0.18);
}

.linha__bloco--b {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.18);
}

.linha__bloco--kernel {
  color: #ddd6fe;
  background: rgba(167, 139, 250, 0.18);
}

.linha__bloco--futuro {
  opacity: 0.2;
}

.explicacao {
  min-height: 82px;
  margin-top: 13px;
  padding: 12px;
  border: 1px solid rgba(30, 215, 96, 0.16);
  border-radius: 10px;
  background: rgba(30, 215, 96, 0.05);
}

.explicacao strong {
  color: #86efac;
  font-size: 0.8rem;
}

.explicacao p {
  margin: 6px 0 0;
  color: #aab9c9;
  font-size: 0.75rem;
  line-height: 1.45;
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

.controles button:focus-visible {
  outline: 2px solid #f8fafc;
  outline-offset: 3px;
}

.conceitos {
  display: grid;
  gap: 9px;
}

.conceito {
  padding: 12px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.14);
}

.conceito strong {
  color: #f8fafc;
  font-size: 0.8rem;
}

.conceito p,
.politicas p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 0.75rem;
  line-height: 1.45;
}

.politicas {
  margin-top: 15px;
}

.politicas__lista {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 10px 0;
}

.politicas__lista span {
  padding: 6px 8px;
  border: 1px solid rgba(30, 215, 96, 0.18);
  border-radius: 8px;
  color: #bbf7d0;
  background: rgba(30, 215, 96, 0.06);
  font-size: 0.7rem;
}

.mensagem {
  color: #1ed760;
}

.mensagem svg {
  flex-shrink: 0;
}

@media (max-width: 950px) {
  .conteudo {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  h1 {
    font-size: 2.1rem;
  }

  .definicao {
    align-items: flex-start;
  }

  .processos {
    grid-template-columns: 1fr;
  }

  .cpu {
    min-height: 70px;
  }

  .linha__blocos {
    flex-wrap: wrap;
  }

  .linha__bloco {
    min-width: 40%;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>