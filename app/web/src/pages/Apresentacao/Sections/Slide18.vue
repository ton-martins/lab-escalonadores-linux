<script setup>
import {
  Activity,
  ArrowRight,
  Clock3,
  Cpu,
  Repeat2,
  Terminal,
} from "lucide-vue-next";

/** Trecho do laço principal do programa CPU-bound. */
const trechoCodigo = `while (tempo_decorrido < (double) tempo_duracao) {
  trabalho += (trabalho * 3) + 1;
  iteracoes++;

  if ((iteracoes & 0xFFFFF) == 0) {
    capturar_tempo(&agora);

    tempo_decorrido =
      (agora.tv_sec - inicio.tv_sec) +
      (agora.tv_nsec - inicio.tv_nsec) / 1000000000.0;
  }
}`;
</script>

<template>
  <section class="slide-programa">
    <div class="introducao">
      <span class="categoria">IMPLEMENTAÇÃO · PROGRAMA 1</span>

      <h1>Processo CPU-bound</h1>

      <p class="pergunta">
        Como criamos uma tarefa que disputa continuamente a CPU?
      </p>
    </div>

    <div class="contexto">
      <div class="contexto__icone">
        <Cpu :size="20" />
      </div>

      <p>
        O programa <code>cpu_bound_worker.c</code> executa operações
        repetidamente durante uma duração configurada.
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
            <h2>Laço principal</h2>
          </div>
        </div>

        <p class="descricao">
          Enquanto o tempo decorrido for menor que a duração informada,
          o processo continua realizando operações.
        </p>

        <pre class="codigo"><code>{{ trechoCodigo }}</code></pre>

        <p class="nota">
          Trecho simplificado: a apresentação omite a verificação de erro
          de <code>capturar_tempo()</code>.
        </p>
      </article>

      <!-- Funcionamento -->
      <article class="painel">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--verde">
            <Repeat2 :size="19" />
          </div>

          <div>
            <span class="painel__categoria">FUNCIONAMENTO</span>
            <h2>Do início ao término</h2>
          </div>
        </div>

        <div class="passos">
          <div class="passo">
            <span class="passo__numero">01</span>

            <div>
              <strong>Receber e validar os argumentos</strong>

              <p>
                O programa recebe um nome e uma duração entre 5 e 20 segundos.
              </p>
            </div>
          </div>

          <div class="passo">
            <span class="passo__numero">02</span>

            <div>
              <strong>Executar operações</strong>

              <p>
                O laço atualiza a variável <code>trabalho</code> e conta
                as iterações realizadas.
              </p>
            </div>
          </div>

          <div class="passo">
            <span class="passo__numero">03</span>

            <div>
              <strong>Verificar o tempo decorrido</strong>

              <p>
                O relógio monotônico é consultado a cada 1.048.576 iterações,
                reduzindo a frequência dessas consultas.
              </p>
            </div>
          </div>

          <div class="passo">
            <span class="passo__numero">04</span>

            <div>
              <strong>Finalizar e registrar</strong>

              <p>
                Ao atingir a duração alvo, o programa informa o tempo
                decorrido e o total de iterações.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div class="relacao">
      <div class="relacao__icone">
        <Activity :size="19" />
      </div>

      <div>
        <span class="painel__categoria">RELAÇÃO COM O PROJETO</span>

        <p>
          O mesmo executável é iniciado separadamente para criar os
          <strong>processos A e B</strong>, que disputam a vCPU 0.
        </p>
      </div>

      <div class="relacao__processos" aria-label="Processos A e B">
        <span>A</span>
        <ArrowRight :size="15" />
        <span>B</span>
      </div>
    </div>

    <div class="observacao">
      <Clock3 :size="16" />

      <p>
        O <code>CLOCK_MONOTONIC</code> mede tempo decorrido. O tempo recebido
        de CPU pode ser menor quando o processo aguarda para executar.
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

.passos {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.passo {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.13);
}

.passo__numero {
  display: grid;
  flex-shrink: 0;
  width: 29px;
  height: 29px;
  place-items: center;
  border-radius: 8px;
  color: #86efac;
  background: rgba(30, 215, 96, 0.1);
  font-family: monospace;
  font-size: 0.7rem;
  font-weight: 700;
}

.passo strong {
  color: #f8fafc;
  font-size: 0.78rem;
}

.passo p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 0.72rem;
  line-height: 1.45;
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

.relacao__processos {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.relacao__processos span {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 9px;
  font-size: 0.78rem;
  font-weight: 800;
}

.relacao__processos span:first-child {
  color: #bfdbfe;
  background: rgba(96, 165, 250, 0.15);
}

.relacao__processos span:last-child {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.15);
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

  .relacao__processos {
    display: none;
  }
}
</style>