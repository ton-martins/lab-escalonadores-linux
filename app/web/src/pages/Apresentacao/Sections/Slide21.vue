<script setup>
import {
  Activity,
  ArrowRight,
  BarChart3,
  Cpu,
  FileJson,
  Terminal,
} from "lucide-vue-next";

const processos = [
  { nome: "A", tipo: "CPU-bound", nice: "0", cor: "#60a5fa" },
  { nome: "B", tipo: "CPU-bound", nice: "+10", cor: "#f59e0b" },
];

const atividades = [
  {
    titulo: "Preparar",
    descricao:
      "Identifica o kernel, valida a duração e os valores de nice; em seguida compila o código C.",
  },
  {
    titulo: "Executar",
    descricao:
      "Inicia os processos na vCPU 0 e confirma o nice efetivo de cada PID.",
  },
  {
    titulo: "Coletar",
    descricao:
      "O pidstat registra amostras por segundo; o awk extrai os valores para os arquivos CSV.",
  },
  {
    titulo: "Registrar",
    descricao:
      "Salva os resultados por execução e atualiza o status consumido pela dashboard.",
  },
];
</script>

<template>
  <section class="slide">
    <header class="introducao">
      <span class="categoria">IMPLEMENTAÇÃO · EXPERIMENTO 2</span>

      <h1>Experimento 2: prioridades diferentes</h1>

      <p class="pergunta">
        Como os pesos influenciam a disputa entre duas tarefas CPU-bound?
      </p>
    </header>

    <div class="contexto">
      <Cpu :size="20" />

      <p>
        A e B executam o mesmo programa na vCPU 0, com valores de nice
        diferentes na configuração padrão.
      </p>
    </div>

    <div class="conteudo">
      <!-- Cenário -->
      <article class="painel">
        <div class="cabecalho">
          <div class="icone">
            <Activity :size="19" />
          </div>

          <div>
            <span class="categoria">CENÁRIO</span>
            <h2>Processos na vCPU 0</h2>
          </div>
        </div>

        <div class="processos">
          <div
            v-for="processo in processos"
            :key="processo.nome"
            class="processo"
            :style="{ '--cor-processo': processo.cor }"
          >
            <span class="letra">{{ processo.nome }}</span>

            <div>
              <strong>Processo {{ processo.nome }}</strong>
              <small>{{ processo.tipo }}</small>
            </div>

            <span class="nice">
              nice padrão {{ processo.nice }}
            </span>
          </div>
        </div>

        <div class="destaque">
          <BarChart3 :size="18" />

          <p>
            Com nice 0 e +10 e ambas sempre prontas, os pesos 1024 e 110
            indicam parcelas ideais de aproximadamente 90,3% para A e
            9,7% para B.
          </p>
        </div>

        <p class="nota">
          Os valores de nice podem ser alterados; a afinidade não reserva
          a vCPU exclusivamente para os processos.
        </p>
      </article>

      <!-- Script -->
      <article class="painel">
        <div class="cabecalho">
          <div class="icone icone--azul">
            <Terminal :size="19" />
          </div>

          <div>
            <span class="categoria">AUTOMAÇÃO</span>
            <h2>O que o script faz?</h2>
          </div>
        </div>

        <div class="atividades">
          <div
            v-for="(item, indice) in atividades"
            :key="item.titulo"
            class="atividade"
          >
            <span>{{ indice + 1 }}</span>

            <div>
              <strong>{{ item.titulo }}</strong>
              <p>{{ item.descricao }}</p>
            </div>
          </div>
        </div>

        <div class="comando">
          <span>EXECUÇÃO PADRÃO</span>
          <code>./scripts/exp2.sh 10</code>
        </div>
      </article>
    </div>

    <div class="rodape">
      <FileJson :size="18" />

      <p>
        <strong>Resultados:</strong>
        <code>status.json</code>,
        <code>resumo.csv</code>,
        <code>amostras.csv</code>,
        <code>pidstat.txt</code>, metadados e logs.
      </p>

      <ArrowRight :size="16" />
    </div>

    <p class="nota">
      As parcelas são referências ideais, não garantias. A configuração
      pode ser alterada por variáveis de ambiente.
    </p>
  </section>
</template>

<style scoped>
.slide {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  color: var(--apresentacao-texto, #f8fafc);
}

.introducao {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.categoria,
.comando span {
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
.rodape {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 14px;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 12px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.06);
}

.contexto svg,
.rodape svg {
  flex-shrink: 0;
}

.contexto p,
.rodape p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.8rem;
  line-height: 1.5;
}

.rodape p {
  flex: 1;
}

.rodape strong {
  color: #f8fafc;
}

code {
  color: #d1fae5;
  font-family: monospace;
}

.conteudo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.painel {
  min-width: 0;
  padding: 18px;
  border: 1px solid var(
    --apresentacao-borda,
    rgba(226, 232, 240, 0.12)
  );
  border-radius: 16px;
  background: var(--apresentacao-superficie, #101a14);
}

.cabecalho {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icone {
  display: grid;
  flex-shrink: 0;
  width: 39px;
  height: 39px;
  place-items: center;
  border-radius: 11px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.12);
}

.icone--azul {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

h2 {
  margin: 4px 0 0;
  color: #f8fafc;
  font-size: 1.05rem;
  font-weight: 650;
}

.processos,
.atividades {
  display: grid;
  gap: 8px;
  margin-top: 15px;
}

.processo,
.atividade {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.14);
}

.processo {
  border-left: 3px solid var(--cor-processo);
}

.letra,
.atividade > span {
  display: grid;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
}

.letra {
  color: var(--cor-processo);
  background: rgba(255, 255, 255, 0.05);
}

.atividade > span {
  color: #86efac;
  background: rgba(30, 215, 96, 0.1);
}

.processo > div,
.atividade > div {
  flex: 1;
  min-width: 0;
}

.processo strong,
.atividade strong {
  display: block;
  color: #f8fafc;
  font-size: 0.78rem;
}

.processo small,
.atividade p {
  display: block;
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 0.72rem;
  line-height: 1.4;
}

.nice {
  color: #cbd5e1;
  font-size: 0.7rem;
  white-space: nowrap;
}

.destaque {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 13px;
  padding: 11px;
  border: 1px solid rgba(30, 215, 96, 0.18);
  border-radius: 10px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.05);
}

.destaque svg {
  flex-shrink: 0;
}

.destaque p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.74rem;
  line-height: 1.45;
}

.nota {
  margin: 0;
  color: #94a3b8;
  font-size: 0.7rem;
  line-height: 1.45;
}

.painel .nota {
  margin-top: 11px;
}

.comando {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 13px;
  padding: 10px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.16);
}

.comando code {
  overflow-x: auto;
  font-size: 0.73rem;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .conteudo {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  h1 {
    font-size: 2.1rem;
  }

  .painel {
    padding: 15px;
  }

  .contexto,
  .rodape {
    align-items: flex-start;
  }

  .processo {
    flex-wrap: wrap;
  }
}
</style>