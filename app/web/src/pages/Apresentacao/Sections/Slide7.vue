<script setup>
import { computed, ref } from "vue";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CircleHelp,
  Cpu,
  FileQuestion,
  HardDrive,
  MemoryStick,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-vue-next";

/** Etapas do cenário ilustrativo. */
const etapas = [
  {
    titulo: "A está em execução",
    descricao:
      "O processo A utiliza a vCPU 0 enquanto o processo B aguarda no estado de pronto.",
    estadoA: "Executando",
    estadoB: "Pronto",
    cpu: "A",
  },
  {
    titulo: "A acessa uma página",
    descricao:
      "A tenta acessar uma página que não está disponível na RAM. A CPU transfere o controle ao kernel para tratar a falha de página.",
    estadoA: "Executando",
    estadoB: "Pronto",
    cpu: "A / kernel",
  },
  {
    titulo: "A leitura é iniciada",
    descricao:
      "Neste exemplo, a página está no SSD. O kernel inicia a leitura e A fica em espera pela conclusão da operação.",
    estadoA: "Em espera",
    estadoB: "Pronto",
    cpu: "Escalonador",
  },
  {
    titulo: "B utiliza a vCPU",
    descricao:
      "Enquanto A aguarda a leitura, o escalonador pode selecionar B para executar na vCPU 0.",
    estadoA: "Em espera",
    estadoB: "Executando",
    cpu: "B",
  },
  {
    titulo: "A leitura termina",
    descricao:
      "A página fica disponível na RAM. O kernel coloca A no estado de pronto, aguardando uma próxima oportunidade de execução.",
    estadoA: "Pronto",
    estadoB: "Executando",
    cpu: "B",
  },
];

/** Índice da etapa exibida atualmente. */
const etapaAtual = ref(0);

/** Informações da etapa exibida. */
const etapa = computed(() => etapas[etapaAtual.value]);

/** Indica se a simulação está na primeira etapa. */
const primeiraEtapa = computed(() => etapaAtual.value === 0);

/** Indica se a simulação está na última etapa. */
const ultimaEtapa = computed(
  () => etapaAtual.value === etapas.length - 1,
);

/** Retorna para a etapa anterior. */
function etapaAnterior() {
  if (!primeiraEtapa.value) {
    etapaAtual.value -= 1;
  }
}

/** Avança para a próxima etapa. */
function proximaEtapa() {
  if (!ultimaEtapa.value) {
    etapaAtual.value += 1;
  }
}

/** Retorna a simulação à primeira etapa. */
function reiniciar() {
  etapaAtual.value = 0;
}
</script>

<template>
  <section class="slide-falha">
    <div class="slide-falha__introducao">
      <span class="slide-falha__categoria">
        MEMÓRIA E ESCALONAMENTO
      </span>

      <h1>Falha de página e espera</h1>

      <p class="slide-falha__pergunta">
        O que acontece quando uma tarefa precisa de uma página que ainda
        não está na RAM?
      </p>
    </div>

    <div class="contexto">
      <div class="contexto__icone">
        <FileQuestion :size="20" />
      </div>

      <p>
        Neste cenário, a página solicitada por <strong>A</strong> está no SSD.
        Enquanto a leitura acontece, <strong>B</strong> pode utilizar a vCPU.
      </p>
    </div>

    <div class="conteudo">
      <!-- Etapas do fluxo -->
      <article class="painel painel--fluxo">
        <div class="painel__cabecalho">
          <div class="painel__icone">
            <FileQuestion :size="19" />
          </div>

          <div>
            <span class="painel__categoria">FLUXO DA SIMULAÇÃO</span>
            <h2>Do acesso à retomada</h2>
          </div>
        </div>

        <div class="lista-etapas">
          <template
            v-for="(item, indice) in etapas"
            :key="item.titulo"
          >
            <div
              class="etapa"
              :class="{
                'etapa--atual': indice === etapaAtual,
                'etapa--concluida': indice < etapaAtual,
              }"
            >
              <span class="etapa__numero">
                <Check
                  v-if="indice < etapaAtual"
                  :size="15"
                />

                <template v-else>
                  {{ indice + 1 }}
                </template>
              </span>

              <span class="etapa__titulo">
                {{ item.titulo }}
              </span>

              <span
                v-if="indice === etapaAtual"
                class="etapa__indicador"
                aria-hidden="true"
              ></span>
            </div>

            <div
              v-if="indice < etapas.length - 1"
              class="lista-etapas__seta"
              aria-hidden="true"
            >
              <ArrowDown :size="15" />
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
      </article>

      <!-- Cenário de execução -->
      <article class="painel painel--cenario">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--azul">
            <Cpu :size="19" />
          </div>

          <div>
            <span class="painel__categoria">CENÁRIO ILUSTRATIVO</span>
            <h2>Processos, vCPU e memória</h2>
          </div>
        </div>

        <div class="processos">
          <!-- Processo A -->
          <div
            class="processo processo--a"
            :class="{
              'processo--ativo': etapa.estadoA === 'Executando',
            }"
          >
            <div class="processo__identificacao">
              <span class="processo__letra">A</span>

              <div>
                <strong>Processo A</strong>
                <small>Solicita a página</small>
              </div>
            </div>

            <span class="processo__estado">
              {{ etapa.estadoA }}
            </span>
          </div>

          <!-- Processo B -->
          <div
            class="processo processo--b"
            :class="{
              'processo--ativo': etapa.estadoB === 'Executando',
            }"
          >
            <div class="processo__identificacao">
              <span class="processo__letra">B</span>

              <div>
                <strong>Processo B</strong>
                <small>Aguarda ou executa</small>
              </div>
            </div>

            <span class="processo__estado">
              {{ etapa.estadoB }}
            </span>
          </div>
        </div>

        <!-- Recursos envolvidos -->
        <div class="recursos">
          <div class="recurso recurso--cpu">
            <div class="recurso__icone">
              <Cpu :size="20" />
            </div>

            <span>vCPU 0</span>
            <strong>{{ etapa.cpu }}</strong>
          </div>

          <ArrowRight
            class="recursos__seta"
            :size="18"
            aria-hidden="true"
          />

          <div
            class="recurso recurso--ssd"
            :class="{
              'recurso--atividade':
                etapaAtual === 2 || etapaAtual === 3,
            }"
          >
            <div class="recurso__icone">
              <HardDrive :size="20" />
            </div>

            <span>SSD</span>

            <strong>
              {{
                etapaAtual === 2 || etapaAtual === 3
                  ? "Lendo página"
                  : etapaAtual === 4
                    ? "Leitura concluída"
                    : "Página armazenada"
              }}
            </strong>
          </div>

          <ArrowRight
            class="recursos__seta"
            :size="18"
            aria-hidden="true"
          />

          <div
            class="recurso recurso--ram"
            :class="{
              'recurso--disponivel': etapaAtual === 4,
            }"
          >
            <div class="recurso__icone">
              <MemoryStick :size="20" />
            </div>

            <span>RAM</span>

            <strong>
              {{
                etapaAtual === 4
                  ? "Página disponível"
                  : "Aguardando página"
              }}
            </strong>
          </div>
        </div>

        <!-- Linha do tempo -->
        <div class="linha-tempo">
          <div class="linha-tempo__cabecalho">
            <div>
              <span class="painel__categoria">USO DA VCPU</span>
              <h3>O que acontece ao longo do tempo?</h3>
            </div>

            <span class="linha-tempo__etapa">
              {{ etapaAtual + 1 }} / {{ etapas.length }}
            </span>
          </div>

          <div class="trilha">
            <div class="trilha__rotulo">
              vCPU 0
            </div>

            <div class="trilha__blocos">
              <div class="trilha__bloco trilha__bloco--a">
                A
              </div>

              <div
                class="trilha__bloco trilha__bloco--kernel"
                :class="{
                  'trilha__bloco--futuro': etapaAtual < 1,
                }"
              >
                Kernel
              </div>

              <div
                class="trilha__bloco trilha__bloco--b"
                :class="{
                  'trilha__bloco--futuro': etapaAtual < 3,
                }"
              >
                B pode executar
              </div>
            </div>
          </div>

          <div class="trilha">
            <div class="trilha__rotulo">
              Processo A
            </div>

            <div class="trilha__blocos">
              <div class="trilha__bloco trilha__bloco--a">
                Executando
              </div>

              <div
                class="trilha__bloco trilha__bloco--espera"
                :class="{
                  'trilha__bloco--futuro': etapaAtual < 2,
                }"
              >
                Em espera
              </div>

              <div
                class="trilha__bloco trilha__bloco--pronto"
                :class="{
                  'trilha__bloco--futuro': etapaAtual < 4,
                }"
              >
                Pronto
              </div>
            </div>
          </div>

          <p>
            A volta ao estado de pronto, mas não precisa executar imediatamente.
          </p>
        </div>
      </article>
    </div>

    <div class="rodape-slide">
      <div class="observacao">
        <CircleHelp :size="17" />

        <p>
          <strong>Nem toda falha de página exige leitura do disco.</strong>
          O exemplo mostra especificamente uma página que precisa ser
          carregada do SSD.
        </p>
      </div>

      <!-- Controles manuais -->
      <div
        class="controles"
        aria-label="Controles da simulação"
      >
        <button
          type="button"
          class="controle"
          :disabled="primeiraEtapa"
          @click="etapaAnterior"
        >
          <SkipBack :size="16" />
          Anterior
        </button>

        <button
          type="button"
          class="controle controle--principal"
          :disabled="ultimaEtapa"
          @click="proximaEtapa"
        >
          Próximo
          <SkipForward :size="16" />
        </button>

        <button
          type="button"
          class="controle"
          @click="reiniciar"
        >
          <RotateCcw :size="16" />
          Reiniciar
        </button>
      </div>
    </div>

    <p class="mensagem-final">
      Os estados indicam se uma tarefa está executando, pronta para disputar
      a CPU ou aguardando um evento.
    </p>
  </section>
</template>

<style scoped>
.slide-falha {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 17px;
  color: var(--apresentacao-texto, #f8fafc);
}

.slide-falha__introducao {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slide-falha__categoria,
.painel__categoria {
  color: var(--apresentacao-destaque, #1ed760);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.slide-falha h1 {
  margin: 0;
  font-size: clamp(2.1rem, 3.5vw, 3.8rem);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 1.08;
}

.slide-falha__pergunta {
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

.contexto__icone {
  display: grid;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 11px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.12);
}

.contexto p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.82rem;
  line-height: 1.5;
}

.contexto strong {
  color: #f8fafc;
}

.conteudo {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.3fr);
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

.painel__icone--azul {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

.painel h2 {
  margin: 4px 0 0;
  color: #f8fafc;
  font-size: 1.08rem;
  font-weight: 650;
  line-height: 1.2;
}

.lista-etapas {
  display: flex;
  flex-direction: column;
}

.etapa {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 7px 10px;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.14);
  transition:
    border-color 0.25s ease,
    background 0.25s ease;
}

.etapa--atual {
  border-color: rgba(30, 215, 96, 0.55);
  background: rgba(30, 215, 96, 0.09);
}

.etapa--concluida .etapa__numero {
  color: #1ed760;
  border-color: rgba(30, 215, 96, 0.3);
}

.etapa__numero {
  display: grid;
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  place-items: center;
  border: 1px solid rgba(226, 232, 240, 0.15);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 750;
}

.etapa--atual .etapa__numero {
  color: #1ed760;
  border-color: rgba(30, 215, 96, 0.4);
}

.etapa__titulo {
  flex: 1;
  color: #cbd5e1;
  font-size: 0.78rem;
  font-weight: 600;
}

.etapa--atual .etapa__titulo {
  color: #f8fafc;
}

.etapa__indicador {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1ed760;
  box-shadow: 0 0 12px rgba(30, 215, 96, 0.6);
}

.lista-etapas__seta {
  display: flex;
  justify-content: center;
  height: 18px;
  color: #64748b;
}

.explicacao {
  min-height: 79px;
  margin-top: 13px;
  padding: 12px;
  border: 1px solid rgba(30, 215, 96, 0.15);
  border-radius: 11px;
  background: rgba(30, 215, 96, 0.05);
}

.explicacao strong {
  color: #86efac;
  font-size: 0.78rem;
}

.explicacao p {
  margin: 6px 0 0;
  color: #aab9c9;
  font-size: 0.75rem;
  line-height: 1.45;
}

.processos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.processo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  padding: 11px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.15);
  transition:
    border-color 0.25s ease,
    background 0.25s ease;
}

.processo--a.processo--ativo {
  border-color: rgba(96, 165, 250, 0.5);
  background: rgba(96, 165, 250, 0.07);
}

.processo--b.processo--ativo {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.07);
}

.processo__identificacao {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.processo__letra {
  display: grid;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
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

.processo__identificacao > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.processo__identificacao strong {
  color: #f8fafc;
  font-size: 0.77rem;
}

.processo__identificacao small {
  color: #94a3b8;
  font-size: 0.67rem;
}

.processo__estado {
  flex-shrink: 0;
  padding: 5px 7px;
  border-radius: 7px;
  color: #cbd5e1;
  background: rgba(148, 163, 184, 0.1);
  font-size: 0.67rem;
  font-weight: 650;
}

.recursos {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    20px
    minmax(0, 1fr)
    20px
    minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  margin-top: 12px;
}

.recurso {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 105px;
  padding: 10px 7px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.14);
  text-align: center;
  transition:
    border-color 0.25s ease,
    background 0.25s ease;
}

.recurso__icone {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.1);
}

.recurso--cpu .recurso__icone {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

.recurso--atividade {
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.06);
}

.recurso--atividade .recurso__icone {
  color: #fbbf24;
}

.recurso--disponivel {
  border-color: rgba(30, 215, 96, 0.45);
  background: rgba(30, 215, 96, 0.06);
}

.recurso--disponivel .recurso__icone {
  color: #1ed760;
}

.recurso span {
  color: #94a3b8;
  font-size: 0.68rem;
}

.recurso strong {
  color: #e2e8f0;
  font-size: 0.72rem;
  line-height: 1.3;
}

.recursos__seta {
  color: #64748b;
}

.linha-tempo {
  margin-top: 14px;
  padding: 13px;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.14);
}

.linha-tempo__cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.linha-tempo h3 {
  margin: 5px 0 0;
  color: #f8fafc;
  font-size: 0.82rem;
  font-weight: 650;
}

.linha-tempo__etapa {
  flex-shrink: 0;
  padding: 4px 7px;
  border-radius: 7px;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.1);
  font-size: 0.68rem;
}

.trilha {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.trilha__rotulo {
  color: #94a3b8;
  font-size: 0.7rem;
}

.trilha__blocos {
  display: flex;
  min-width: 0;
  gap: 4px;
}

.trilha__bloco {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 29px;
  padding: 5px;
  border-radius: 7px;
  color: #e2e8f0;
  font-size: 0.66rem;
  font-weight: 650;
  text-align: center;
  transition: opacity 0.25s ease;
}

.trilha__bloco--a {
  color: #bfdbfe;
  background: rgba(96, 165, 250, 0.18);
}

.trilha__bloco--kernel {
  color: #ddd6fe;
  background: rgba(167, 139, 250, 0.18);
}

.trilha__bloco--b {
  flex: 1.8;
  color: #fde68a;
  background: rgba(245, 158, 11, 0.18);
}

.trilha__bloco--espera {
  flex: 1.5;
  color: #fecaca;
  background: rgba(248, 113, 113, 0.15);
}

.trilha__bloco--pronto {
  color: #bbf7d0;
  background: rgba(30, 215, 96, 0.15);
}

.trilha__bloco--futuro {
  opacity: 0.2;
}

.linha-tempo p {
  margin: 11px 0 0;
  color: #94a3b8;
  font-size: 0.7rem;
  line-height: 1.4;
}

.rodape-slide {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.observacao {
  display: flex;
  flex: 1;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 13px;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-radius: 11px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.025);
}

.observacao svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: #60a5fa;
}

.observacao p {
  margin: 0;
  font-size: 0.73rem;
  line-height: 1.45;
}

.observacao strong {
  color: #e2e8f0;
}

.controles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
}

.controle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  padding: 8px 10px;
  border: 1px solid rgba(226, 232, 240, 0.16);
  border-radius: 9px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.025);
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
}

.controle:hover:not(:disabled) {
  border-color: rgba(30, 215, 96, 0.45);
  color: #f8fafc;
}

.controle--principal {
  border-color: rgba(30, 215, 96, 0.4);
  color: #86efac;
  background: rgba(30, 215, 96, 0.1);
}

.controle:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.controle:focus-visible {
  outline: 2px solid #f8fafc;
  outline-offset: 3px;
}

.mensagem-final {
  margin: -5px 0 0;
  color: #8293a7;
  font-size: 0.74rem;
  line-height: 1.4;
}

@media (max-width: 1050px) {
  .conteudo {
    grid-template-columns: 1fr;
  }

  .rodape-slide {
    flex-direction: column;
  }

  .controles {
    justify-content: flex-start;
  }
}

@media (max-width: 600px) {
  .slide-falha {
    gap: 14px;
  }

  .slide-falha h1 {
    font-size: 2.1rem;
  }

  .contexto {
    align-items: flex-start;
  }

  .painel {
    padding: 15px;
  }

  .processos {
    grid-template-columns: 1fr;
  }

  .recursos {
    grid-template-columns: 1fr;
  }

  .recursos__seta {
    justify-self: center;
    transform: rotate(90deg);
  }

  .recurso {
    min-height: 85px;
  }

  .trilha {
    grid-template-columns: 1fr;
    gap: 5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none !important;
  }
}
</style>