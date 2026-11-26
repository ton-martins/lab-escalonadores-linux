<script setup>
import {
  ArrowRight,
  ChartNoAxesCombined,
  Cpu,
  Gauge,
  ListChecks,
  Scale,
  Timer,
} from "lucide-vue-next";

const objetivos = [
  {
    titulo: "Aproveitamento",
    descricao: "Manter a CPU ocupada quando há tarefas prontas.",
    icone: Gauge,
  },
  {
    titulo: "Justiça",
    descricao: "Distribuir oportunidades conforme a política adotada.",
    icone: Scale,
  },
  {
    titulo: "Tempo de resposta",
    descricao: "Favorecer respostas adequadas às tarefas interativas.",
    icone: Timer,
  },
  {
    titulo: "Prioridades",
    descricao: "Considerar prioridades e necessidades das tarefas.",
    icone: ChartNoAxesCombined,
  },
];
</script>

<template>
  <section class="slide">
    <div class="introducao">
      <span class="categoria">FUNDAMENTOS DO ESCALONAMENTO</span>

      <h1>Conhecendo o escalonador</h1>

      <p class="pergunta">
        Quem decide qual tarefa pronta utilizará a CPU?
      </p>
    </div>

    <div class="definicao">
      <div class="definicao__icone">
        <Cpu :size="22" />
      </div>

      <p>
        O <strong>escalonador</strong> (<em>scheduler</em>) é a parte do
        sistema operacional que seleciona uma tarefa pronta para executar,
        conforme a política de escalonamento.
      </p>
    </div>

    <div class="conteudo">
      <article class="painel painel--fluxo">
        <div class="painel__cabecalho">
          <div class="painel__icone">
            <ListChecks :size="20" />
          </div>

          <div>
            <span class="painel__categoria">DECISÃO DO SISTEMA</span>
            <h2>Da fila de prontas à CPU</h2>
          </div>
        </div>

        <p class="painel__descricao">
          Quando várias tarefas estão prontas, o escalonador decide qual
          delas terá uma oportunidade de execução.
        </p>

        <div class="fluxo">
          <div class="bloco">
            <span class="bloco__categoria">TAREFAS PRONTAS</span>

            <div class="tarefas">
              <span class="tarefa tarefa--a">A</span>
              <span class="tarefa tarefa--b">B</span>
              <span class="tarefa tarefa--c">C</span>
            </div>

            <small>Aguardam uma oportunidade</small>
          </div>

          <ArrowRight class="seta" :size="22" />

          <div class="bloco bloco--escalonador">
            <span class="bloco__categoria">ESCALONADOR</span>

            <Cpu :size="28" />

            <strong>Seleciona B</strong>

            <small>Conforme a política</small>
          </div>

          <ArrowRight class="seta" :size="22" />

          <div class="bloco">
            <span class="bloco__categoria">VCPU 0</span>

            <span class="tarefa tarefa--b tarefa--cpu">B</span>

            <small>Tarefa em execução</small>
          </div>
        </div>

        <div class="observacao">
          <strong>Em sistemas com várias CPUs:</strong>
          o kernel também procura distribuir a carga, respeitando
          restrições como a afinidade das tarefas.
        </div>
      </article>

      <article class="painel">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--azul">
            <Gauge :size="20" />
          </div>

          <div>
            <span class="painel__categoria">OBJETIVOS</span>
            <h2>O que a política considera?</h2>
          </div>
        </div>

        <p class="painel__descricao">
          Diferentes sistemas e políticas podem priorizar objetivos distintos.
        </p>

        <div class="objetivos">
          <div
            v-for="objetivo in objetivos"
            :key="objetivo.titulo"
            class="objetivo"
          >
            <div class="objetivo__icone">
              <component
                :is="objetivo.icone"
                :size="18"
              />
            </div>

            <div>
              <strong>{{ objetivo.titulo }}</strong>
              <p>{{ objetivo.descricao }}</p>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div class="mensagem">
      <Cpu :size="19" />

      <p>
        A política define os critérios de escolha. A seguir, veremos quando
        uma tarefa pode ser retirada da CPU.
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
.painel__categoria,
.bloco__categoria {
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

.definicao {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 14px 16px;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 14px;
  background: rgba(30, 215, 96, 0.06);
}

.definicao__icone,
.painel__icone,
.objetivo__icone {
  display: grid;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 11px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.12);
}

.definicao p,
.mensagem p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.86rem;
  line-height: 1.5;
}

.definicao strong {
  color: #f8fafc;
}

.conteudo {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 16px;
}

.painel {
  min-width: 0;
  padding: 20px;
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
  gap: 12px;
}

.painel__icone--azul {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

h2 {
  margin: 4px 0 0;
  font-size: 1.15rem;
  font-weight: 650;
}

.painel__descricao {
  margin: 15px 0 18px;
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.5;
}

.fluxo {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    22px
    minmax(0, 1fr)
    22px
    minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.bloco {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 13px;
  min-height: 180px;
  padding: 14px 10px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 13px;
  background: rgba(0, 0, 0, 0.16);
  text-align: center;
}

.bloco--escalonador {
  border-color: rgba(30, 215, 96, 0.3);
  color: #1ed760;
  background: rgba(30, 215, 96, 0.05);
}

.bloco strong {
  color: #f8fafc;
  font-size: 0.85rem;
}

.bloco small {
  color: #94a3b8;
  font-size: 0.7rem;
  line-height: 1.4;
}

.bloco__categoria {
  font-size: 0.64rem;
}

.tarefas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.tarefa {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 9px;
  font-size: 0.8rem;
  font-weight: 800;
}

.tarefa--a {
  color: #93c5fd;
  background: rgba(96, 165, 250, 0.17);
}

.tarefa--b {
  color: #fcd34d;
  background: rgba(245, 158, 11, 0.17);
}

.tarefa--c {
  color: #c4b5fd;
  background: rgba(167, 139, 250, 0.17);
}

.tarefa--cpu {
  width: 42px;
  height: 42px;
}

.seta {
  color: #1ed760;
}

.observacao {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-radius: 10px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.025);
  font-size: 0.76rem;
  line-height: 1.5;
}

.observacao strong {
  color: #cbd5e1;
}

.objetivos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.objetivo {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.14);
}

.objetivo__icone {
  width: 34px;
  height: 34px;
}

.objetivo strong {
  color: #f8fafc;
  font-size: 0.8rem;
}

.objetivo p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 0.74rem;
  line-height: 1.45;
}

.mensagem {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 14px 16px;
  border: 1px solid rgba(30, 215, 96, 0.22);
  border-radius: 12px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.08);
}

.mensagem svg {
  flex-shrink: 0;
}

@media (max-width: 1000px) {
  .conteudo {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .fluxo,
  .objetivos {
    grid-template-columns: 1fr;
  }

  .seta {
    justify-self: center;
    transform: rotate(90deg);
  }

  .bloco {
    min-height: 130px;
  }

  .definicao {
    align-items: flex-start;
  }

  h1 {
    font-size: 2.1rem;
  }
}
</style>