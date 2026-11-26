<script setup>
import {
  Boxes,
  Cpu,
  Database,
  FolderOpen,
  Network,
  ShieldCheck,
} from "lucide-vue-next";

/** Funcionalidades exibidas na expansão visual do kernel. */
const funcionalidadesKernel = [
  {
    titulo: "Processos e threads",
    descricao: "Cria e administra tarefas e seus recursos.",
    icone: Boxes,
  },
  {
    titulo: "Escalonamento",
    descricao: "Distribui o uso das CPUs entre tarefas prontas.",
    icone: Cpu,
  },
  {
    titulo: "Memória",
    descricao: "Gerencia espaços virtuais e mapeamentos.",
    icone: Database,
  },
  {
    titulo: "Arquivos e dispositivos",
    descricao: "Oferece acesso controlado a arquivos e I/O.",
    icone: FolderOpen,
  },
  {
    titulo: "Rede",
    descricao: "Disponibiliza recursos de comunicação.",
    icone: Network,
  },
  {
    titulo: "Proteção",
    descricao: "Aplica permissões e isolamento.",
    icone: ShieldCheck,
  },
];

/** Características apresentadas na parte inferior do slide. */
const caracteristicasSistema = [
  {
    titulo: "Monotarefa",
    descricao: "Uma tarefa de usuário por vez.",
  },
  {
    titulo: "Multitarefa",
    descricao: "Várias tarefas compartilham os recursos.",
  },
  {
    titulo: "Multiprocessamento",
    descricao: "Uso de múltiplas CPUs lógicas disponíveis.",
  },
];
</script>

<template>
  <article class="slide-arquitetura">
    <header class="slide-cabecalho">
      <span class="slide-categoria">FUNDAMENTOS</span>

      <h1>Arquitetura de um sistema computacional</h1>

      <p>
        Como as aplicações utilizam os recursos do computador de forma
        controlada?
      </p>
    </header>

    <div class="arquitetura">
      <!-- Camadas do sistema computacional. -->
      <section class="camadas" aria-label="Camadas do sistema computacional">
        <div class="camada camada-aplicacoes">
          <span class="camada-categoria">ESPAÇO DO USUÁRIO</span>

          <strong>Aplicações e shell</strong>

          <p>
            Programas executam instruções e solicitam serviços quando
            necessário.
          </p>
        </div>

        <div class="ligacao-vertical" aria-hidden="true">
          <span>↓</span>
          <small>chamadas de sistema</small>
        </div>

        <div class="camada camada-kernel">
          <span class="camada-categoria">MODO PRIVILEGIADO</span>

          <strong>Kernel</strong>

          <p>
            Núcleo do sistema operacional, responsável por gerenciar recursos
            e oferecer serviços.
          </p>
        </div>

        <div class="ligacao-vertical" aria-hidden="true">
          <span>↓</span>
          <small>gerência dos recursos</small>
        </div>

        <div class="camada camada-hardware">
          <span class="camada-categoria">RECURSOS DO COMPUTADOR</span>

          <strong>Hardware</strong>

          <div class="hardware-itens">
            <span>CPU</span>
            <span>RAM</span>
            <span>Disco</span>
            <span>Rede</span>
          </div>
        </div>
      </section>

      <!-- Expansão visual da camada kernel. -->
      <section
        class="kernel-painel"
        aria-labelledby="titulo-funcionalidades-kernel"
      >
        <div class="kernel-painel-cabecalho">
          <span class="painel-categoria">NÚCLEO DO SISTEMA</span>

          <h2 id="titulo-funcionalidades-kernel">
            Funcionalidades do kernel
          </h2>

          <p>
            O kernel coordena recursos e disponibiliza serviços para as
            aplicações.
          </p>
        </div>

        <div class="funcionalidades">
          <div
            v-for="funcionalidade in funcionalidadesKernel"
            :key="funcionalidade.titulo"
            class="funcionalidade"
          >
            <div class="funcionalidade-icone">
              <component
                :is="funcionalidade.icone"
                :size="19"
                :stroke-width="1.8"
                aria-hidden="true"
              />
            </div>

            <div class="funcionalidade-texto">
              <strong>{{ funcionalidade.titulo }}</strong>

              <p>
                {{ funcionalidade.descricao }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Introdução às características que serão aprofundadas no próximo slide. -->
    <section class="caracteristicas" aria-label="Características de sistemas">
      <div
        v-for="caracteristica in caracteristicasSistema"
        :key="caracteristica.titulo"
        class="caracteristica"
      >
        <strong>{{ caracteristica.titulo }}</strong>

        <span>{{ caracteristica.descricao }}</span>
      </div>
    </section>

    <p class="observacao">
      A CPU executa instruções comuns diretamente. As chamadas de sistema são
      usadas quando a aplicação precisa solicitar um serviço ao kernel.
    </p>
  </article>
</template>

<style scoped>
.slide-arquitetura {
  width: min(1220px, 100%);
  margin: 0 auto;
}

.slide-cabecalho {
  margin-bottom: clamp(1.25rem, 2.5vh, 2rem);
}

.slide-categoria,
.painel-categoria,
.camada-categoria {
  display: block;
  color: var(--apresentacao-destaque, #1ed760);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.slide-cabecalho h1 {
  margin: 0.45rem 0 0;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: clamp(2rem, 3.8vw, 3.5rem);
  line-height: 1.08;
}

.slide-cabecalho > p {
  margin: 0.8rem 0 0;
  color: #d6e5db;
  font-size: clamp(0.95rem, 1.3vw, 1.1rem);
  line-height: 1.5;
}

.arquitetura {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.25fr);
  align-items: stretch;
  gap: 2rem;
}

.camadas {
  display: grid;
  align-content: center;
}

.camada {
  position: relative;
  padding: 1rem 1.15rem;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.025);
}

.camada strong {
  display: block;
  margin-top: 0.4rem;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: 1.05rem;
}

.camada p {
  margin: 0.45rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.82rem;
  line-height: 1.45;
}

.camada-kernel {
  border-color: rgba(30, 215, 96, 0.45);
  background: rgba(30, 215, 96, 0.08);
}

/* Linha que conecta a camada kernel ao painel de funcionalidades. */
.camada-kernel::after {
  position: absolute;
  top: 50%;
  right: -2rem;
  width: 2rem;
  height: 2px;
  background: rgba(30, 215, 96, 0.65);
  content: "";
}

.ligacao-vertical {
  display: flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  color: var(--apresentacao-destaque, #1ed760);
}

.ligacao-vertical span {
  font-size: 1.1rem;
  font-weight: 800;
}

.ligacao-vertical small {
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.7rem;
}

.hardware-itens {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.65rem;
}

.hardware-itens span {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 7px;
  color: #d6e5db;
  font-size: 0.72rem;
}

.kernel-painel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(1rem, 1.8vw, 1.4rem);
  border: 1px solid rgba(30, 215, 96, 0.25);
  border-radius: 18px;
  background:
    linear-gradient(
      145deg,
      rgba(20, 33, 25, 0.95),
      rgba(11, 23, 16, 0.95)
    );
}

.kernel-painel-cabecalho h2 {
  margin: 0.4rem 0 0;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: clamp(1.15rem, 1.7vw, 1.45rem);
}

.kernel-painel-cabecalho p {
  margin: 0.45rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.82rem;
  line-height: 1.45;
}

.funcionalidades {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 1rem;
}

.funcionalidade {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
}

.funcionalidade-icone {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 9px;
  color: var(--apresentacao-destaque, #1ed760);
  background: rgba(30, 215, 96, 0.1);
}

.funcionalidade-texto {
  min-width: 0;
}

.funcionalidade-texto strong {
  display: block;
  color: var(--apresentacao-texto, #f8fafc);
  font-size: 0.8rem;
  line-height: 1.35;
}

.funcionalidade-texto p {
  margin: 0.3rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.73rem;
  line-height: 1.4;
}

.caracteristicas {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.caracteristica {
  display: grid;
  gap: 0.3rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
}

.caracteristica strong {
  color: var(--apresentacao-destaque, #1ed760);
  font-size: 0.78rem;
}

.caracteristica span {
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.75rem;
  line-height: 1.4;
}

.observacao {
  margin: 0.85rem 0 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.72rem;
  line-height: 1.45;
}

@media (max-width: 900px) {
  .arquitetura {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .camada-kernel::after {
    display: none;
  }
}

@media (max-width: 620px) {
  .funcionalidades,
  .caracteristicas {
    grid-template-columns: 1fr;
  }

  .slide-cabecalho h1 {
    font-size: clamp(1.8rem, 8vw, 2.5rem);
  }
}
</style>