<script setup>
import {
  Activity,
  ArrowRight,
  Cpu,
  FileJson,
  Monitor,
  Server,
} from "lucide-vue-next";

const cartoes = [
  {
    titulo: "Experimentos",
    icone: Cpu,
    descricao:
      "Os scripts compilam os programas, iniciam os processos e executam a coleta.",
    itens: [
      "A e B: CPU-bound",
      "C: espera simulada no experimento 3",
    ],
  },
  {
    titulo: "Arquivos de resultados",
    icone: FileJson,
    descricao:
      "Cada execução possui um diretório com dados e metadados.",
    itens: [
      "status.json: andamento",
      "resumo.csv e amostras.csv: métricas",
    ],
  },
  {
    titulo: "API Node.js",
    icone: Server,
    descricao:
      "A API lê os resultados e disponibiliza consultas HTTP.",
    itens: [
      "Express organiza as rotas",
      "Os dados são enviados em JSON",
    ],
  },
  {
    titulo: "Aplicação Vue",
    icone: Monitor,
    descricao:
      "A interface apresenta a apresentação e a dashboard.",
    itens: [
      "A dashboard consulta a API",
      "Socket.IO informa alterações",
    ],
  },
];

const fluxo = ["Scripts", "Arquivos", "API", "Aplicação Vue"];
</script>

<template>
  <section class="slide">
    <header class="introducao">
      <span class="categoria">ARQUITETURA DA APLICAÇÃO</span>
      <h1>Dos experimentos à dashboard</h1>
      <p class="pergunta">
        Como os resultados chegam ao navegador?
      </p>
    </header>

    <div class="contexto">
      <Activity :size="20" />
      <p>
        Os arquivos de cada execução conectam os experimentos à aplicação web.
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

        <ul>
          <li v-for="item in cartao.itens" :key="item">
            {{ item }}
          </li>
        </ul>
      </article>
    </div>

    <div class="fluxo" aria-label="Fluxo da aplicação">
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
      A API faz a ponte entre os arquivos no servidor e a interface
      no navegador.
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