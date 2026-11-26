<script setup>
import {
  ArrowRight,
  Cpu,
  GitCompareArrows,
  Scale,
  Timer,
} from "lucide-vue-next";
</script>

<template>
  <section class="slide-escalonadores">
    <!-- Introdução -->
    <div class="introducao">
      <span class="categoria">ESCALONAMENTO NO LINUX</span>

      <h1>CFS e EEVDF</h1>

      <p class="pergunta">
        Como o Linux distribui a CPU entre tarefas comuns?
      </p>
    </div>

    <!-- Contexto compartilhado -->
    <div class="contexto">
      <div class="contexto__icone">
        <Cpu :size="21" />
      </div>

      <div class="contexto__conteudo">
        <strong>Escalonamento justo e preemptivo</strong>

        <p>
          CFS e EEVDF são mecanismos usados pelo Linux para distribuir
          tempo de CPU entre tarefas comuns. Ambos consideram o peso
          associado ao valor de <code>nice</code>.
        </p>
      </div>

      <span class="contexto__politica">
        SCHED_NORMAL
      </span>
    </div>

    <!-- Comparação -->
    <div class="comparacao">
      <!-- CFS -->
      <article class="escalonador escalonador--cfs">
        <div class="escalonador__cabecalho">
          <div class="escalonador__icone escalonador__icone--cfs">
            <Scale :size="22" />
          </div>

          <div class="escalonador__titulo">
            <span class="escalonador__categoria">ESCALONAMENTO JUSTO</span>

            <h2>CFS</h2>
          </div>
        </div>

        <div class="significado">
          <span class="significado__ingles">
            Completely Fair Scheduler
          </span>

          <strong>
            Escalonador Completamente Justo
          </strong>
        </div>

        <p class="escalonador__descricao">
          Busca distribuir o tempo de CPU proporcionalmente entre as
          tarefas prontas, considerando seus pesos.
        </p>

        <div class="criterio">
          <span class="criterio__rotulo">COMO ESCOLHE?</span>

          <strong>Menor tempo virtual</strong>

          <p>
            Em linhas gerais, favorece a tarefa com menor
            <code>vruntime</code> acumulado.
          </p>
        </div>

        <div class="palavras-chave">
          <span>Justiça proporcional</span>
          <span>Tempo virtual</span>
          <span>Nice e peso</span>
        </div>
      </article>

      <!-- EEVDF -->
      <article class="escalonador escalonador--eevdf">
        <div class="escalonador__cabecalho">
          <div class="escalonador__icone escalonador__icone--eevdf">
            <Timer :size="22" />
          </div>

          <div class="escalonador__titulo">
            <span class="escalonador__categoria">ESCALONAMENTO JUSTO</span>

            <h2>EEVDF</h2>
          </div>
        </div>

        <div class="significado">
          <span class="significado__ingles">
            Earliest Eligible Virtual Deadline First
          </span>

          <strong>
            Primeiro Prazo Virtual Elegível
          </strong>
        </div>

        <p class="escalonador__descricao">
          Busca uma distribuição justa de CPU e também considera o prazo
          virtual das tarefas na escolha.
        </p>

        <div class="criterio">
          <span class="criterio__rotulo">COMO ESCOLHE?</span>

          <strong>Elegibilidade e prazo virtual</strong>

          <p>
            Entre as tarefas elegíveis, seleciona a que possui o menor
            prazo virtual.
          </p>
        </div>

        <div class="palavras-chave">
          <span>Elegibilidade</span>
          <span>Prazo virtual</span>
          <span>Nice e peso</span>
        </div>
      </article>
    </div>

    <!-- Relação com o projeto -->
    <article class="laboratorio">
      <div class="laboratorio__cabecalho">
        <div class="laboratorio__icone">
          <GitCompareArrows :size="19" />
        </div>

        <div>
          <span class="laboratorio__categoria">NO LABORATÓRIO</span>
          <h2>Comparação entre versões do kernel</h2>
        </div>
      </div>

      <div class="versoes">
        <div class="versao versao--cfs">
          <span>Kernel Linux</span>
          <strong>6.5.11</strong>
          <small>CFS</small>
        </div>

        <ArrowRight
          class="versoes__seta"
          :size="19"
          aria-hidden="true"
        />

        <div class="versao versao--eevdf">
          <span>Kernel Linux</span>
          <strong>7.0.0</strong>
          <small>EEVDF</small>
        </div>

        <p class="versoes__observacao">
          Os experimentos são executados separadamente em cada kernel
          para comparar os resultados.
        </p>
      </div>
    </article>

    <!-- Mensagem principal -->
    <div class="mensagem">
      <Scale :size="19" />

      <p>
        Ambos buscam distribuir a CPU de forma justa; a diferença está
        nos critérios usados para escolher a próxima tarefa.
      </p>
    </div>
  </section>
</template>

<style scoped>
.slide-escalonadores {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  color: var(--apresentacao-texto, #f8fafc);
}

.introducao {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.categoria,
.escalonador__categoria,
.laboratorio__categoria,
.criterio__rotulo {
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

.contexto {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px 15px;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 14px;
  background: rgba(30, 215, 96, 0.06);
}

.contexto__icone,
.laboratorio__icone {
  display: grid;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 11px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.12);
}

.contexto__conteudo {
  flex: 1;
  min-width: 0;
}

.contexto__conteudo strong {
  color: #f8fafc;
  font-size: 0.86rem;
}

.contexto__conteudo p {
  margin: 5px 0 0;
  color: #aab9c9;
  font-size: 0.78rem;
  line-height: 1.45;
}

.contexto__politica {
  flex-shrink: 0;
  padding: 7px 9px;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 8px;
  color: #86efac;
  background: rgba(30, 215, 96, 0.07);
  font-family: monospace;
  font-size: 0.72rem;
}

.comparacao {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.escalonador {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 20px;
  border: 1px solid var(
    --apresentacao-borda,
    rgba(226, 232, 240, 0.12)
  );
  border-radius: 18px;
  background: var(--apresentacao-superficie, #101a14);
}

.escalonador--cfs {
  border-top: 3px solid #60a5fa;
}

.escalonador--eevdf {
  border-top: 3px solid #f59e0b;
}

.escalonador__cabecalho {
  display: flex;
  align-items: center;
  gap: 12px;
}

.escalonador__icone {
  display: grid;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 12px;
}

.escalonador__icone--cfs {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

.escalonador__icone--eevdf {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.12);
}

.escalonador__titulo h2 {
  margin: 3px 0 0;
  color: #f8fafc;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.1;
}

.significado {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 16px;
}

.significado__ingles {
  color: #94a3b8;
  font-size: 0.76rem;
  line-height: 1.4;
}

.significado strong {
  color: #f8fafc;
  font-size: 0.92rem;
  font-weight: 650;
  line-height: 1.35;
}

.escalonador__descricao {
  margin: 13px 0;
  color: #aab9c9;
  font-size: 0.8rem;
  line-height: 1.5;
}

.criterio {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  padding: 13px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.16);
}

.criterio__rotulo {
  font-size: 0.65rem;
}

.criterio strong {
  color: #f8fafc;
  font-size: 0.84rem;
}

.criterio p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.76rem;
  line-height: 1.45;
}

code {
  color: #cbd5e1;
  font-family: monospace;
  font-size: 0.96em;
}

.palavras-chave {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 13px;
}

.palavras-chave span {
  padding: 6px 8px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 8px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.025);
  font-size: 0.68rem;
}

.laboratorio {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 18px;
  border: 1px solid var(
    --apresentacao-borda,
    rgba(226, 232, 240, 0.12)
  );
  border-radius: 15px;
  background: var(--apresentacao-superficie, #101a14);
}

.laboratorio__cabecalho {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 230px;
}

.laboratorio__cabecalho h2 {
  margin: 4px 0 0;
  color: #f8fafc;
  font-size: 0.9rem;
  font-weight: 650;
}

.versoes {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10px;
}

.versao {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 11px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.14);
  white-space: nowrap;
}

.versao span {
  color: #94a3b8;
  font-size: 0.7rem;
}

.versao strong {
  color: #f8fafc;
  font-family: monospace;
  font-size: 0.8rem;
}

.versao small {
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 0.67rem;
  font-weight: 750;
}

.versao--cfs small {
  color: #bfdbfe;
  background: rgba(96, 165, 250, 0.14);
}

.versao--eevdf small {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.14);
}

.versoes__seta {
  flex-shrink: 0;
  color: #64748b;
}

.versoes__observacao {
  margin: 0 0 0 5px;
  color: #94a3b8;
  font-size: 0.72rem;
  line-height: 1.4;
}

.mensagem {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 15px;
  border: 1px solid rgba(30, 215, 96, 0.22);
  border-radius: 12px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.08);
}

.mensagem svg {
  flex-shrink: 0;
}

.mensagem p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.82rem;
  line-height: 1.45;
}

@media (max-width: 1050px) {
  .laboratorio {
    align-items: flex-start;
    flex-direction: column;
    gap: 13px;
  }

  .versoes {
    flex-wrap: wrap;
  }

  .versoes__observacao {
    flex-basis: 100%;
    margin: 2px 0 0;
  }
}

@media (max-width: 700px) {
  .slide-escalonadores {
    gap: 14px;
  }

  h1 {
    font-size: 2.1rem;
  }

  .contexto {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .contexto__politica {
    margin-left: 55px;
  }

  .comparacao {
    grid-template-columns: 1fr;
  }

  .escalonador {
    padding: 16px;
  }

  .laboratorio {
    padding: 15px;
  }
}
</style>