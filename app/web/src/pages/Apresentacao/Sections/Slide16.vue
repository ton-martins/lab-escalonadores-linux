<script setup>
import { computed, ref } from "vue";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Cpu,
  HardDrive,
  Network,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-vue-next";

/** Cenário escolhido para a decisão final. */
const cenario = ref("continuar");

/** Etapa atualmente exibida. */
const etapaAtual = ref(0);

/** Etapas compartilhadas pelos dois cenários. */
const etapasIniciais = [
  {
    titulo: "A está executando",
    descricao:
      "O processo A utiliza a vCPU 0. O processo B está pronto e aguarda uma oportunidade.",
    cpu: "A",
    estadoA: "Executando",
    estadoB: "Pronto",
  },
  {
    titulo: "O temporizador sinaliza",
    descricao:
      "Um evento do temporizador gera uma interrupção enquanto A está executando.",
    cpu: "Interrupção",
    estadoA: "Executando",
    estadoB: "Pronto",
  },
  {
    titulo: "O kernel trata a interrupção",
    descricao:
      "A CPU passa o controle ao kernel, que trata o evento e contabiliza o uso da CPU.",
    cpu: "Kernel",
    estadoA: "Executando",
    estadoB: "Pronto",
  },
  {
    titulo: "A execução é reavaliada",
    descricao:
      "Conforme a política de escalonamento e o estado das tarefas, o kernel pode manter A ou decidir executar outra tarefa.",
    cpu: "Kernel",
    estadoA: "Executando",
    estadoB: "Pronto",
  },
];

/** Resultado final conforme o cenário selecionado. */
const etapaFinal = computed(() => {
  if (cenario.value === "continuar") {
    return {
      titulo: "A continua executando",
      descricao:
        "Neste cenário, não há troca de tarefa. Após o tratamento da interrupção, A continua utilizando a vCPU.",
      cpu: "A",
      estadoA: "Executando",
      estadoB: "Pronto",
    };
  }

  return {
    titulo: "B assume a vCPU",
    descricao:
      "Neste cenário, o kernel decide executar B. A volta ao estado de pronto e ocorre uma troca de contexto.",
    cpu: "B",
    estadoA: "Pronto",
    estadoB: "Executando",
  };
});

/** Lista completa de etapas do cenário atual. */
const etapas = computed(() => [...etapasIniciais, etapaFinal.value]);

/** Informações exibidas na etapa selecionada. */
const etapa = computed(() => etapas.value[etapaAtual.value]);

const primeiraEtapa = computed(() => etapaAtual.value === 0);

const ultimaEtapa = computed(
  () => etapaAtual.value === etapas.value.length - 1,
);

/** Seleciona um cenário e retorna ao início. */
function selecionarCenario(novoCenario) {
  cenario.value = novoCenario;
  etapaAtual.value = 0;
}

/** Retorna uma etapa. */
function etapaAnterior() {
  if (!primeiraEtapa.value) {
    etapaAtual.value -= 1;
  }
}

/** Avança uma etapa. */
function proximaEtapa() {
  if (!ultimaEtapa.value) {
    etapaAtual.value += 1;
  }
}

/** Reinicia o cenário selecionado. */
function reiniciar() {
  etapaAtual.value = 0;
}
</script>

<template>
  <section class="slide-temporizador">
    <!-- Introdução -->
    <div class="introducao">
      <span class="categoria">TEMPORIZADOR E ESCALONAMENTO</span>

      <h1>Como o sistema compartilha a CPU?</h1>

      <p class="pergunta">
        Se A está executando continuamente, como o kernel pode decidir
        que é hora de executar B?
      </p>
    </div>

    <!-- Definição -->
    <div class="contexto">
      <div class="contexto__icone">
        <Activity :size="20" />
      </div>

      <p>
        Uma <strong>interrupção</strong> faz a CPU suspender temporariamente
        o fluxo atual para que o sistema trate um evento.
      </p>

      <div class="fontes-interrupcao">
        <span>
          <Clock3 :size="14" />
          Temporizador
        </span>

        <span>
          <HardDrive :size="14" />
          Armazenamento
        </span>

        <span>
          <Network :size="14" />
          Rede
        </span>
      </div>
    </div>

    <div class="conteudo">
      <!-- Fluxo -->
      <article class="painel painel--fluxo">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--verde">
            <Clock3 :size="19" />
          </div>

          <div>
            <span class="painel__categoria">SIMULAÇÃO MANUAL</span>
            <h2>Do temporizador à decisão</h2>
          </div>
        </div>

        <p class="descricao">
          Escolha o resultado e avance para acompanhar o fluxo.
        </p>

        <div class="cenarios" aria-label="Cenário da simulação">
          <button
            type="button"
            :class="{ 'cenario--ativo': cenario === 'continuar' }"
            :aria-pressed="cenario === 'continuar'"
            @click="selecionarCenario('continuar')"
          >
            A continua
          </button>

          <button
            type="button"
            :class="{ 'cenario--ativo': cenario === 'trocar' }"
            :aria-pressed="cenario === 'trocar'"
            @click="selecionarCenario('trocar')"
          >
            B assume
          </button>
        </div>

        <div class="fluxo">
          <template
            v-for="(item, indice) in etapas"
            :key="indice"
          >
            <div
              class="etapa"
              :class="{
                'etapa--atual': indice === etapaAtual,
                'etapa--concluida': indice < etapaAtual,
              }"
            >
              <span class="etapa__numero">
                <CheckCircle2
                  v-if="indice < etapaAtual"
                  :size="15"
                />

                <template v-else>
                  {{ indice + 1 }}
                </template>
              </span>

              <strong>{{ item.titulo }}</strong>

              <span
                v-if="indice === etapaAtual"
                class="etapa__indicador"
                aria-hidden="true"
              ></span>
            </div>

            <div
              v-if="indice < etapas.length - 1"
              class="fluxo__seta"
              aria-hidden="true"
            >
              <ArrowDown :size="14" />
            </div>
          </template>
        </div>

        <div
          class="explicacao"
          aria-live="polite"
        >
          <strong>{{ etapa.titulo }}</strong>
          <p>{{ etapa.descricao }}</p>
        </div>

        <div class="controles" aria-label="Controles da simulação">
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

      <!-- Cenário e configuração -->
      <div class="coluna-direita">
        <article class="painel">
          <div class="painel__cabecalho">
            <div class="painel__icone painel__icone--azul">
              <Cpu :size="19" />
            </div>

            <div>
              <span class="painel__categoria">ESTADO DO CENÁRIO</span>
              <h2>Processos e vCPU</h2>
            </div>
          </div>

          <div class="processos">
            <div
              class="processo processo--a"
              :class="{
                'processo--ativo': etapa.estadoA === 'Executando',
              }"
            >
              <span class="processo__letra">A</span>

              <div>
                <strong>Processo A</strong>
                <small>{{ etapa.estadoA }}</small>
              </div>
            </div>

            <div class="cpu">
              <Cpu :size="20" />

              <span>vCPU 0</span>
              <strong>{{ etapa.cpu }}</strong>
            </div>

            <div
              class="processo processo--b"
              :class="{
                'processo--ativo': etapa.estadoB === 'Executando',
              }"
            >
              <span class="processo__letra">B</span>

              <div>
                <strong>Processo B</strong>
                <small>{{ etapa.estadoB }}</small>
              </div>
            </div>
          </div>

          <div class="destaque">
            <CheckCircle2 :size="17" />

            <p>
              Uma interrupção <strong>não obriga</strong> o kernel a trocar
              de processo.
            </p>
          </div>
        </article>

        <article class="painel">
          <div class="painel__cabecalho">
            <div class="painel__icone painel__icone--roxo">
              <Activity :size="19" />
            </div>

            <div>
              <span class="painel__categoria">CONFIGURAÇÃO DO KERNEL</span>
              <h2>Frequência dos ticks</h2>
            </div>
          </div>

          <p class="descricao">
            <code>CONFIG_HZ</code> está relacionado à frequência básica
            dos ticks do temporizador, definida na configuração do kernel.
          </p>

          <div class="configuracao">
            <div>
              <span>EXEMPLO HIPOTÉTICO</span>
              <strong>CONFIG_HZ = 1000</strong>
            </div>

            <ArrowRight :size="17" />

            <div>
              <span>INTERVALO NOMINAL</span>
              <strong>1 ms por tick</strong>
            </div>
          </div>

          <p class="nota">
            Esse valor não determina uma troca de tarefa a cada 1 ms.
            Dependendo da configuração, o Linux pode omitir ticks em
            determinadas situações.
          </p>
        </article>
      </div>
    </div>

    <!-- Mensagem principal -->
    <div class="mensagem">
      <Clock3 :size="18" />

      <p>
        O temporizador oferece oportunidades para o kernel contabilizar
        o uso da CPU e reavaliar a execução. O escalonamento também pode
        ocorrer em outros momentos.
      </p>
    </div>
  </section>
</template>

<style scoped>
.slide-temporizador {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 15px;
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

.contexto,
.mensagem {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 14px;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 12px;
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

.contexto p {
  flex: 1;
}

.contexto strong,
.mensagem strong {
  color: #f8fafc;
}

.fontes-interrupcao {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.fontes-interrupcao span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 8px;
  color: #aab9c9;
  background: rgba(0, 0, 0, 0.12);
  font-size: 0.68rem;
  white-space: nowrap;
}

.fontes-interrupcao svg {
  color: #1ed760;
}

.conteudo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}

.coluna-direita {
  display: grid;
  align-content: start;
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

.descricao,
.nota {
  color: #94a3b8;
  font-size: 0.74rem;
  line-height: 1.45;
}

.descricao {
  margin: 11px 0;
}

.cenarios {
  display: flex;
  gap: 7px;
  margin-bottom: 11px;
}

.cenarios button,
.controles button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  padding: 7px 10px;
  border: 1px solid rgba(226, 232, 240, 0.15);
  border-radius: 9px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.025);
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
}

.cenarios .cenario--ativo,
.controles .botao--principal {
  border-color: rgba(30, 215, 96, 0.4);
  color: #86efac;
  background: rgba(30, 215, 96, 0.1);
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

button:focus-visible {
  outline: 2px solid #f8fafc;
  outline-offset: 3px;
}

.fluxo {
  display: flex;
  flex-direction: column;
}

.etapa {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 35px;
  padding: 6px 9px;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-radius: 9px;
  background: rgba(0, 0, 0, 0.14);
}

.etapa--atual {
  border-color: rgba(30, 215, 96, 0.5);
  background: rgba(30, 215, 96, 0.08);
}

.etapa__numero {
  display: grid;
  flex-shrink: 0;
  width: 23px;
  height: 23px;
  place-items: center;
  border: 1px solid rgba(226, 232, 240, 0.14);
  border-radius: 7px;
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 750;
}

.etapa--concluida .etapa__numero,
.etapa--atual .etapa__numero {
  color: #1ed760;
  border-color: rgba(30, 215, 96, 0.3);
}

.etapa strong {
  flex: 1;
  color: #cbd5e1;
  font-size: 0.74rem;
  font-weight: 600;
}

.etapa--atual strong {
  color: #f8fafc;
}

.etapa__indicador {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1ed760;
}

.fluxo__seta {
  display: flex;
  justify-content: center;
  height: 15px;
  color: #64748b;
}

.explicacao {
  min-height: 73px;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid rgba(30, 215, 96, 0.15);
  border-radius: 9px;
  background: rgba(30, 215, 96, 0.05);
}

.explicacao strong {
  color: #86efac;
  font-size: 0.76rem;
}

.explicacao p {
  margin: 5px 0 0;
  color: #aab9c9;
  font-size: 0.72rem;
  line-height: 1.4;
}

.controles {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
}

.processos {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(95px, 0.75fr) minmax(0, 1fr);
  gap: 8px;
  margin-top: 14px;
}

.processo,
.cpu {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 70px;
  padding: 9px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 10px;
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
  width: 31px;
  height: 31px;
  place-items: center;
  border-radius: 9px;
  font-size: 0.8rem;
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

.processo > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.processo strong,
.cpu strong {
  color: #f8fafc;
  font-size: 0.72rem;
}

.processo small,
.cpu span {
  color: #94a3b8;
  font-size: 0.67rem;
}

.cpu {
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  color: #1ed760;
  text-align: center;
}

.destaque {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 10px;
  border: 1px solid rgba(30, 215, 96, 0.16);
  border-radius: 9px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.05);
}

.destaque svg {
  flex-shrink: 0;
}

.destaque p {
  margin: 0;
  color: #aab9c9;
  font-size: 0.73rem;
  line-height: 1.4;
}

.destaque strong {
  color: #f8fafc;
}

code {
  color: #d1fae5;
  font-family: monospace;
}

.configuracao {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 10px;
  color: #1ed760;
  background: rgba(0, 0, 0, 0.15);
}

.configuracao > div {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}

.configuracao span {
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 700;
}

.configuracao strong {
  color: #f8fafc;
  font-family: monospace;
  font-size: 0.78rem;
}

.nota {
  margin: 10px 0 0;
  font-size: 0.7rem;
}

.mensagem {
  color: #1ed760;
}

.mensagem svg {
  flex-shrink: 0;
}

@media (max-width: 1050px) {
  .contexto {
    flex-wrap: wrap;
  }

  .fontes-interrupcao {
    flex-basis: 100%;
    margin-left: 50px;
  }

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

  .fontes-interrupcao {
    margin-left: 0;
  }

  .painel {
    padding: 14px;
  }

  .processos {
    grid-template-columns: 1fr;
  }

  .configuracao {
    align-items: flex-start;
    flex-direction: column;
  }

  .configuracao > svg {
    transform: rotate(90deg);
  }
}
</style>