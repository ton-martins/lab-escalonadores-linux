<script setup>
import {
  Activity,
  ArrowRight,
  Clock3,
  Cpu,
  Moon,
  Repeat2,
  Terminal,
} from "lucide-vue-next";

/** Trecho simplificado do ciclo de trabalho e espera. */
const trechoCodigo = `while (tempo_decorrido < tempo_duracao) {
  while (tempo_trabalho < TRABALHO_MS / 1000.0) {
    trabalho += (trabalho * 3) + 1;
    iteracoes++;

    // Periodicamente, atualiza tempo_trabalho.
  }

  ciclos++;

  nanosleep(&pausa, NULL);

  // Atualiza o tempo total decorrido.
}`;
</script>

<template>
  <section class="slide-programa">
    <div class="introducao">
      <span class="categoria">IMPLEMENTAÇÃO · PROGRAMA 2</span>

      <h1>I/O-bound simulado</h1>

      <p class="pergunta">
        Como simulamos uma tarefa que alterna entre execução e espera?
      </p>
    </div>

    <div class="contexto">
      <div class="contexto__icone">
        <Activity :size="20" />
      </div>

      <p>
        O programa <code>io_bound_simulator.c</code> alterna um intervalo
        de trabalho com uma pausa. Ele simula esse comportamento sem
        realizar uma operação real de leitura ou escrita nesse ciclo.
      </p>
    </div>

    <div class="conteudo">
      <!-- Código -->
      <article class="painel">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--azul">
            <Terminal :size="19" />
          </div>

          <div>
            <span class="painel__categoria">ALGORITMO</span>
            <h2>Ciclo de trabalho e pausa</h2>
          </div>
        </div>

        <p class="descricao">
          O laço externo controla a duração total. Em cada ciclo, o
          programa trabalha, pausa e verifica o tempo decorrido.
        </p>

        <pre class="codigo"><code>{{ trechoCodigo }}</code></pre>

        <p class="nota">
          Trecho simplificado: a apresentação omite cálculos de tempo e
          verificações de erro presentes no código original.
        </p>
      </article>

      <!-- Fluxo -->
      <article class="painel">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--verde">
            <Repeat2 :size="19" />
          </div>

          <div>
            <span class="painel__categoria">COMPORTAMENTO</span>
            <h2>Um ciclo ilustrativo</h2>
          </div>
        </div>

        <div class="ciclo">
          <div class="ciclo__etapa ciclo__etapa--trabalho">
            <div class="ciclo__icone">
              <Cpu :size="18" />
            </div>

            <span>TRABALHO</span>
            <strong>10 ms</strong>
            <small>Intervalo alvo</small>
          </div>

          <ArrowRight
            class="ciclo__seta"
            :size="18"
            aria-hidden="true"
          />

          <div class="ciclo__etapa ciclo__etapa--pausa">
            <div class="ciclo__icone">
              <Moon :size="18" />
            </div>

            <span>PAUSA</span>
            <strong>90 ms</strong>
            <small><code>nanosleep()</code></small>
          </div>
        </div>

        <div class="duracao">
          <span>PERÍODO NOMINAL</span>
          <strong>10 ms + 90 ms = 100 ms</strong>
        </div>

        <div class="passos">
          <div class="passo">
            <span class="passo__numero">01</span>

            <p>
              Executa operações até o intervalo alvo de trabalho transcorrer.
            </p>
          </div>

          <div class="passo">
            <span class="passo__numero">02</span>

            <p>
              Chama <code>nanosleep()</code> e aguarda o término da pausa.
            </p>
          </div>

          <div class="passo">
            <span class="passo__numero">03</span>

            <p>
              Após a espera, volta a ficar apto a executar e inicia outro ciclo
              quando for escalonado.
            </p>
          </div>
        </div>
      </article>
    </div>

    <div class="relacao">
      <div class="relacao__icone">
        <Cpu :size="19" />
      </div>

      <div>
        <span class="painel__categoria">RELAÇÃO COM O PROJETO</span>

        <p>
          No experimento 3, esse programa é iniciado como
          <strong>processo C</strong>, enquanto A e B executam a carga
          CPU-bound.
        </p>
      </div>

      <span class="processo-c">C</span>
    </div>

    <div class="observacao">
      <Clock3 :size="16" />

      <p>
        Os 10 ms são medidos como tempo decorrido, não como tempo garantido
        de CPU. A pausa solicitada também pode terminar mais tarde, conforme
        o escalonamento.
      </p>
    </div>
  </section>
</template>

<style scoped>
.slide-programa {
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
.relacao,
.observacao {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 14px;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 12px;
  background: rgba(30, 215, 96, 0.06);
}

.contexto__icone,
.painel__icone,
.relacao__icone {
  display: grid;
  flex-shrink: 0;
  width: 39px;
  height: 39px;
  place-items: center;
  border-radius: 11px;
}

.contexto__icone,
.painel__icone--verde,
.relacao__icone {
  color: #1ed760;
  background: rgba(30, 215, 96, 0.12);
}

.painel__icone--azul {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

.contexto p,
.relacao p,
.observacao p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.78rem;
  line-height: 1.5;
}

code {
  color: #d1fae5;
  font-family: monospace;
}

.conteudo {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
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

.painel__cabecalho {
  display: flex;
  align-items: center;
  gap: 10px;
}

h2 {
  margin: 4px 0 0;
  font-size: 1.05rem;
  font-weight: 650;
}

.descricao {
  margin: 13px 0;
  color: #aab9c9;
  font-size: 0.77rem;
  line-height: 1.5;
}

.codigo {
  max-width: 100%;
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.28);
}

.codigo code {
  color: #d1fae5;
  font-size: 0.73rem;
  line-height: 1.65;
}

.nota {
  margin: 10px 0 0;
  color: #8293a7;
  font-size: 0.7rem;
  line-height: 1.4;
}

.ciclo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  margin-top: 15px;
}

.ciclo__etapa {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 13px 10px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.14);
  text-align: center;
}

.ciclo__etapa--trabalho {
  border-top: 3px solid #c084fc;
}

.ciclo__etapa--pausa {
  border-top: 3px solid #60a5fa;
}

.ciclo__icone {
  display: grid;
  width: 33px;
  height: 33px;
  place-items: center;
  border-radius: 9px;
}

.ciclo__etapa--trabalho .ciclo__icone {
  color: #c084fc;
  background: rgba(192, 132, 252, 0.12);
}

.ciclo__etapa--pausa .ciclo__icone {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

.ciclo__etapa > span {
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.ciclo__etapa > strong {
  color: #f8fafc;
  font-size: 1rem;
}

.ciclo__etapa > small {
  color: #94a3b8;
  font-size: 0.67rem;
}

.ciclo__seta {
  color: #1ed760;
}

.duracao {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid rgba(30, 215, 96, 0.17);
  border-radius: 9px;
  background: rgba(30, 215, 96, 0.05);
}

.duracao span {
  color: #1ed760;
  font-size: 0.63rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.duracao strong {
  color: #e2e8f0;
  font-family: monospace;
  font-size: 0.73rem;
}

.passos {
  display: grid;
  gap: 7px;
  margin-top: 11px;
}

.passo {
  display: flex;
  align-items: flex-start;
  gap: 9px;
}

.passo__numero {
  display: grid;
  flex-shrink: 0;
  width: 23px;
  height: 23px;
  place-items: center;
  border-radius: 7px;
  color: #86efac;
  background: rgba(30, 215, 96, 0.1);
  font-family: monospace;
  font-size: 0.65rem;
  font-weight: 700;
}

.passo p {
  margin: 2px 0 0;
  color: #aab9c9;
  font-size: 0.72rem;
  line-height: 1.4;
}

.relacao > div:nth-child(2) {
  flex: 1;
}

.relacao p {
  margin-top: 4px;
}

.relacao strong {
  color: #f8fafc;
}

.processo-c {
  display: grid;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 9px;
  color: #e9d5ff;
  background: rgba(192, 132, 252, 0.15);
  font-size: 0.8rem;
  font-weight: 800;
}

.observacao {
  color: #60a5fa;
  border-color: rgba(96, 165, 250, 0.16);
  background: rgba(96, 165, 250, 0.05);
}

.observacao svg {
  flex-shrink: 0;
}

.observacao p {
  color: #aab9c9;
  font-size: 0.72rem;
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

  .contexto,
  .relacao,
  .observacao {
    align-items: flex-start;
  }

  .painel {
    padding: 15px;
  }
}
</style>