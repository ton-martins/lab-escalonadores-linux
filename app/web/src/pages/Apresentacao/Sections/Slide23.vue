<script setup>
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock3,
  Cpu,
  Terminal,
} from "lucide-vue-next";

const cartoes = [
  {
    titulo: "Comando de coleta",
    icone: Terminal,
    descricao: "O exemplo acompanha os processos A e B.",
    codigo: 'pidstat -u -p "$PID_A,$PID_B" 1 "$AMOSTRAS"',
    itens: [
      "-u: estatísticas de CPU",
      "-p: seleciona os PIDs",
      "1: intervalo em segundos",
      "AMOSTRAS: quantidade de relatórios",
    ],
  },
  {
    titulo: "CPU utilizada",
    icone: Cpu,
    descricao:
      "%CPU indica o uso de CPU da tarefa durante o intervalo observado.",
    itens: [
      "Exemplo: 50% em 1 s ≈ 0,5 s de CPU",
      "O valor pode variar entre as amostras",
    ],
  },
  {
    titulo: "Espera para executar",
    icone: Clock3,
    descricao:
      "%wait representa a espera da tarefa para executar na CPU.",
    itens: [
      "Não é o tempo de nanosleep()",
      "Não é o lag interno do EEVDF",
    ],
  },
  {
    titulo: "Amostras e média",
    icone: BarChart3,
    descricao:
      "Cada amostra mostra um intervalo; Average resume o período monitorado.",
    itens: [
      "Duração padrão: 10 segundos",
      "Coleta padrão: 8 amostras de 1 segundo",
      "A média não cobre necessariamente os 10 segundos completos",
    ],
  },
];

const fluxo = ["pidstat.txt", "awk", "CSV", "dashboard"];
</script>

<template>
  <section class="slide">
    <header class="introducao">
      <span class="categoria">COLETA DE MÉTRICAS</span>
      <h1>Entendendo o pidstat</h1>
      <p class="pergunta">
        Como medimos o comportamento dos processos?
      </p>
    </header>

    <div class="contexto">
      <Activity :size="20" />
      <p>
        O pidstat acompanha os PIDs durante o intervalo de coleta.
        Nos scripts, usamos as estatísticas de CPU.
      </p>
    </div>

    <div class="cartoes">
      <article
        v-for="cartao in cartoes"
        :key="cartao.titulo"
        class="cartao"
      >
        <div class="cabecalho">
          <div class="icone">
            <component :is="cartao.icone" :size="19" />
          </div>

          <h2>{{ cartao.titulo }}</h2>
        </div>

        <p>{{ cartao.descricao }}</p>

        <code v-if="cartao.codigo" class="codigo">
          {{ cartao.codigo }}
        </code>

        <ul v-if="cartao.itens.length">
          <li v-for="item in cartao.itens" :key="item">
            {{ item }}
          </li>
        </ul>
      </article>
    </div>

    <div class="fluxo" aria-label="Fluxo resumido da coleta">
      <template v-for="(item, indice) in fluxo" :key="item">
        <span>{{ item }}</span>
        <ArrowRight
          v-if="indice < fluxo.length - 1"
          :size="16"
          aria-hidden="true"
        />
      </template>
    </div>

    <p class="nota">
      Os scripts não coletam diretamente vruntime, lag ou prazo virtual
      do kernel.
    </p>
  </section>
</template>

<style scoped>
.slide { display: flex; flex-direction: column; gap: 15px; width: 100%; color: var(--apresentacao-texto, #f8fafc); }
.introducao { display: flex; flex-direction: column; gap: 8px; }
.categoria { color: var(--apresentacao-destaque, #1ed760); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.12em; }
h1 { margin: 0; font-size: clamp(2.1rem, 3.5vw, 3.8rem); font-weight: 500; letter-spacing: -0.045em; line-height: 1.08; }
.pergunta { margin: 0; color: #cbd5e1; font-size: clamp(0.95rem, 1.2vw, 1.1rem); line-height: 1.5; }
.contexto { display: flex; align-items: center; gap: 11px; padding: 12px 14px; border: 1px solid rgba(30, 215, 96, 0.2); border-radius: 12px; color: #1ed760; background: rgba(30, 215, 96, 0.06); }
.contexto svg { flex-shrink: 0; }
.contexto p { margin: 0; color: #cbd5e1; font-size: 0.8rem; line-height: 1.5; }
.cartoes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.cartao { min-width: 0; padding: 17px; border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12)); border-radius: 16px; background: var(--apresentacao-superficie, #101a14); }
.cabecalho { display: flex; align-items: center; gap: 10px; }
.icone { display: grid; flex-shrink: 0; width: 39px; height: 39px; place-items: center; border-radius: 11px; color: #1ed760; background: rgba(30, 215, 96, 0.12); }
h2 { margin: 0; color: #f8fafc; font-size: 1rem; font-weight: 650; }
.cartao p { margin: 11px 0 0; color: #aab9c9; font-size: 0.77rem; line-height: 1.5; }
.cartao ul { display: grid; gap: 5px; margin: 10px 0 0; padding-left: 18px; color: #94a3b8; font-size: 0.74rem; line-height: 1.4; }
.cartao li::marker { color: #1ed760; }
.codigo { display: block; overflow-x: auto; margin-top: 10px; padding: 10px; border: 1px solid rgba(226, 232, 240, 0.1); border-radius: 9px; color: #d1fae5; background: rgba(0, 0, 0, 0.18); font-family: monospace; font-size: 0.72rem; white-space: nowrap; }
.fluxo { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; padding: 12px; border: 1px solid rgba(30, 215, 96, 0.2); border-radius: 12px; color: #1ed760; background: rgba(30, 215, 96, 0.06); }
.fluxo span { color: #e2e8f0; font-size: 0.76rem; font-weight: 650; }
.nota { margin: 0; color: #94a3b8; font-size: 0.71rem; line-height: 1.45; }

@media (max-width: 900px) {
  .cartoes { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  h1 { font-size: 2.1rem; }
  .contexto { align-items: flex-start; }
  .cartao { padding: 15px; }
}
</style>