<script setup>
import {
  ArrowLeftRight,
  Boxes,
  Cpu,
  Layers,
  Share2,
  ShieldCheck,
} from "lucide-vue-next";

/** Processos utilizados no exemplo didático. */
const processos = [
  {
    nome: "A",
    cor: "#60a5fa",
    threads: ["A1", "A2"],
  },
  {
    nome: "B",
    cor: "#f59e0b",
    threads: ["B1", "B2"],
  },
];
</script>

<template>
  <article class="slide-processos">
    <header class="slide-cabecalho">
      <span class="slide-categoria">PROCESSOS E THREADS</span>

      <h1>Processos, threads e memória</h1>

      <p>
        O que o kernel administra e onde ficam os dados utilizados pelo
        programa?
      </p>
    </header>

    <!-- Informações administrativas mantidas pelo kernel. -->
    <section
      class="kernel"
      aria-label="Informações administrativas do kernel"
    >
      <div class="kernel-icone">
        <ShieldCheck :size="21" :stroke-width="1.8" aria-hidden="true" />
      </div>

      <div class="kernel-texto">
        <span class="painel-categoria">MEMÓRIA PROTEGIDA DO KERNEL</span>

        <strong>Estruturas de controle e administração</strong>

        <p>
          O kernel mantém informações para administrar processos, threads,
          memória e recursos.
        </p>
      </div>

      <div class="kernel-itens">
        <span>Identificadores e estados</span>
        <span>Escalonamento</span>
        <span>Mapeamentos de memória</span>
        <span>Arquivos abertos</span>
      </div>
    </section>

    <div class="ligacao-kernel" aria-hidden="true">
      <span>administra e acompanha</span>
    </div>

    <!-- Espaços virtuais de usuário dos processos. -->
    <section
      class="processos"
      aria-label="Espaços virtuais dos processos A e B"
    >
      <div
        v-for="processo in processos"
        :key="processo.nome"
        class="processo"
        :style="{ '--cor-processo': processo.cor }"
      >
        <div class="processo-cabecalho">
          <div class="processo-identificacao">
            <div class="processo-icone">
              <Boxes :size="19" :stroke-width="1.8" aria-hidden="true" />
            </div>

            <div>
              <span class="processo-categoria">PROCESSO</span>

              <h2>Processo {{ processo.nome }}</h2>
            </div>
          </div>

          <span class="processo-etiqueta">
            Espaço virtual {{ processo.nome }}
          </span>
        </div>

        <div class="memoria-usuario">
          <div class="memoria-titulo">
            <Layers :size="16" :stroke-width="1.8" aria-hidden="true" />

            <strong>Memória de usuário</strong>
          </div>

          <div class="memoria-itens">
            <span>Código</span>
            <span>Dados globais</span>
            <span>Área dinâmica</span>
            <span>Pilhas de usuário</span>
          </div>
        </div>

        <div class="threads">
          <div
            v-for="thread in processo.threads"
            :key="thread"
            class="thread"
          >
            <div class="thread-titulo">
              <Cpu :size="16" :stroke-width="1.8" aria-hidden="true" />

              <strong>Thread {{ thread }}</strong>
            </div>

            <span>Fluxo de execução</span>
            <span>Pilha de usuário própria</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Contexto da thread durante e após a execução. -->
    <div class="contexto">
      <Cpu :size="18" :stroke-width="1.8" aria-hidden="true" />

      <p>
        <strong>Contexto de execução:</strong>
        enquanto uma thread executa, seus registradores estão na CPU. O kernel
        preserva o estado necessário para retomá-la.
      </p>
    </div>

    <!-- Comunicação entre threads e entre processos. -->
    <section class="comunicacao" aria-label="Comunicação entre tarefas">
      <div class="comunicacao-card">
        <div class="comunicacao-icone">
          <Share2 :size="18" :stroke-width="1.8" aria-hidden="true" />
        </div>

        <div>
          <strong>Entre threads</strong>

          <p>
            Compartilham o espaço virtual do processo e precisam coordenar
            alterações em dados comuns.
          </p>
        </div>
      </div>

      <div class="comunicacao-card">
        <div class="comunicacao-icone">
          <ArrowLeftRight
            :size="18"
            :stroke-width="1.8"
            aria-hidden="true"
          />
        </div>

        <div>
          <strong>Entre processos</strong>

          <p>
            Possuem espaços virtuais separados e podem usar pipes, sockets ou
            memória compartilhada explicitamente.
          </p>
        </div>
      </div>
    </section>

    <p class="observacao">
      O PCB é um modelo conceitual das informações administrativas mantidas
      pelo kernel. As duas threads por processo são ilustrativas: nos workers
      atuais do laboratório, cada processo possui uma thread principal.
    </p>
  </article>
</template>

<style scoped>
.slide-processos {
  width: min(1220px, 100%);
  margin: 0 auto;
}

.slide-cabecalho {
  margin-bottom: clamp(1rem, 2vh, 1.5rem);
}

.slide-categoria,
.painel-categoria,
.processo-categoria {
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.slide-categoria,
.painel-categoria {
  color: var(--apresentacao-destaque, #1ed760);
}

.slide-cabecalho h1 {
  margin: 0.45rem 0 0;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: clamp(2rem, 3.8vw, 3.5rem);
  line-height: 1.08;
}

.slide-cabecalho > p {
  margin: 0.75rem 0 0;
  color: #d6e5db;
  font-size: clamp(0.95rem, 1.3vw, 1.1rem);
  line-height: 1.45;
}

/* Kernel */

.kernel {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(30, 215, 96, 0.35);
  border-radius: 14px;
  background: rgba(30, 215, 96, 0.07);
}

.kernel-icone,
.processo-icone,
.comunicacao-icone {
  display: grid;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 10px;
}

.kernel-icone,
.comunicacao-icone {
  color: var(--apresentacao-destaque, #1ed760);
  background: rgba(30, 215, 96, 0.1);
}

.kernel-texto {
  flex: 1;
  min-width: 0;
}

.kernel-texto > strong {
  display: block;
  margin-top: 0.35rem;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: 0.92rem;
}

.kernel-texto p {
  margin: 0.3rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.74rem;
  line-height: 1.4;
}

.kernel-itens {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.4rem;
  max-width: 450px;
}

.kernel-itens span {
  padding: 0.35rem 0.5rem;
  border: 1px solid rgba(30, 215, 96, 0.18);
  border-radius: 7px;
  color: #d6e5db;
  font-size: 0.68rem;
  white-space: nowrap;
}

.ligacao-kernel {
  display: flex;
  min-height: 32px;
  align-items: center;
  justify-content: center;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.68rem;
}

.ligacao-kernel span::before {
  margin-right: 0.4rem;
  color: var(--apresentacao-destaque, #1ed760);
  content: "↓";
}

/* Processos */

.processos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.processo {
  min-width: 0;
  padding: 1rem;
  border: 1px solid
    color-mix(in srgb, var(--cor-processo) 35%, transparent);
  border-radius: 15px;
  background:
    linear-gradient(
      145deg,
      rgba(20, 33, 25, 0.95),
      rgba(11, 23, 16, 0.95)
    );
}

.processo-cabecalho,
.processo-identificacao {
  display: flex;
  align-items: center;
}

.processo-cabecalho {
  justify-content: space-between;
  gap: 0.75rem;
}

.processo-identificacao {
  min-width: 0;
  gap: 0.65rem;
}

.processo-icone {
  color: var(--cor-processo);
  background: color-mix(
    in srgb,
    var(--cor-processo) 12%,
    transparent
  );
}

.processo-categoria {
  color: var(--cor-processo);
}

.processo-cabecalho h2 {
  margin: 0.3rem 0 0;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: 1rem;
}

.processo-etiqueta {
  flex: 0 0 auto;
  padding: 0.35rem 0.5rem;
  border: 1px solid
    color-mix(in srgb, var(--cor-processo) 25%, transparent);
  border-radius: 7px;
  color: var(--cor-processo);
  font-size: 0.68rem;
}

/* Memória de usuário */

.memoria-usuario {
  margin-top: 0.85rem;
  padding: 0.7rem;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
}

.memoria-titulo,
.thread-titulo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--cor-processo);
}

.memoria-titulo strong,
.thread-titulo strong {
  color: var(--apresentacao-texto, #f8fafc);
  font-size: 0.75rem;
}

.memoria-itens {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.55rem;
}

.memoria-itens span {
  padding: 0.25rem 0.4rem;
  border-radius: 6px;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.68rem;
  background: rgba(255, 255, 255, 0.04);
}

/* Threads */

.threads {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin-top: 0.65rem;
}

.thread {
  display: grid;
  align-content: start;
  gap: 0.35rem;
  min-width: 0;
  padding: 0.7rem;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
}

.thread span {
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.68rem;
  line-height: 1.35;
}

/* Contexto de execução */

.contexto {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  margin-top: 0.85rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 10px;
  color: var(--apresentacao-destaque, #1ed760);
  background: rgba(30, 215, 96, 0.06);
}

.contexto svg {
  flex: 0 0 auto;
}

.contexto p {
  margin: 0;
  color: #d6e5db;
  font-size: 0.75rem;
  line-height: 1.45;
}

.contexto strong {
  color: var(--apresentacao-texto, #f8fafc);
}

/* Comunicação */

.comunicacao {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.comunicacao-card {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.8rem;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
}

.comunicacao-icone {
  width: 34px;
  height: 34px;
}

.comunicacao-card strong {
  color: var(--apresentacao-texto, #f8fafc);
  font-size: 0.78rem;
}

.comunicacao-card p {
  margin: 0.35rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.72rem;
  line-height: 1.4;
}

.observacao {
  margin: 0.75rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.7rem;
  line-height: 1.4;
}

@media (max-width: 900px) {
  .kernel {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .kernel-itens {
    justify-content: flex-start;
    max-width: none;
  }

  .processos,
  .comunicacao {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .slide-cabecalho h1 {
    font-size: clamp(1.8rem, 8vw, 2.5rem);
  }

  .processo-cabecalho {
    align-items: flex-start;
    flex-direction: column;
  }

  .processo-etiqueta {
    margin-left: 2.7rem;
  }
}
</style>