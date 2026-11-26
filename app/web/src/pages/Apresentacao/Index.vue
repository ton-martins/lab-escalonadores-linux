<script setup>
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";

/** Procura os arquivos de slides dentro da pasta Sections. */
const arquivosSlides = import.meta.glob("./Sections/Slide*.vue");

/** Exibido quando um slide ainda não está disponível. */
const SlideIndisponivel = defineComponent({
  name: "SlideIndisponivel",

  setup() {
    return () =>
      h(
        "div",
        { class: "slide-indisponivel" },
        "Este slide ainda não está disponível. Confira o arquivo correspondente."
      );
  },
});

/** Prepara as 30 posições da apresentação. */
const slides = Array.from({ length: 30 }, (_, indice) => {
  const numero = indice + 1;
  const caminho = `./Sections/Slide${numero}.vue`;
  const carregarSlide = arquivosSlides[caminho];

  return {
    numero,

    componente: carregarSlide
      ? defineAsyncComponent({
          loader: carregarSlide,
          errorComponent: SlideIndisponivel,
        })
      : SlideIndisponivel,
  };
});

/** Índice do slide exibido. */
const slideAtual = ref(0);

/** Quantidade total de slides. */
const totalSlides = slides.length;

/** Dados do slide selecionado. */
const slideSelecionado = computed(() => slides[slideAtual.value]);

/** Avança para o próximo slide. */
function avancar() {
  if (slideAtual.value < totalSlides - 1) {
    slideAtual.value++;
  }
}

/** Retorna ao slide anterior. */
function voltar() {
  if (slideAtual.value > 0) {
    slideAtual.value--;
  }
}

/** Abre um slide pelo índice. */
function irPara(indice) {
  if (indice >= 0 && indice < totalSlides) {
    slideAtual.value = indice;
  }
}

/** Permite navegar pela apresentação usando o teclado. */
function lidarTeclado(evento) {
  const elemento = evento.target;

  /** Preserva o comportamento normal de campos editáveis. */
  if (
    elemento?.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(elemento?.tagName)
  ) {
    return;
  }

  if (evento.key === "ArrowRight") {
    evento.preventDefault();
    avancar();
  }

  if (evento.key === "ArrowLeft") {
    evento.preventDefault();
    voltar();
  }

  if (evento.key === "Home") {
    evento.preventDefault();
    irPara(0);
  }

  if (evento.key === "End") {
    evento.preventDefault();
    irPara(totalSlides - 1);
  }
}

onMounted(() => {
  window.addEventListener("keydown", lidarTeclado);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", lidarTeclado);
});
</script>

<template>
  <main class="apresentacao">
    <section class="apresentacao-conteudo">
      <div class="slide-area">
        <div class="slide-corpo">
          <Transition name="slide" mode="out-in">
            <component
              :is="slideSelecionado.componente"
              :key="slideSelecionado.numero"
            />
          </Transition>
        </div>

        <div
          class="contador"
          :aria-label="`Slide ${slideAtual + 1} de ${totalSlides}`"
        >
          <strong>{{ slideAtual + 1 }}</strong>
          <span>/ {{ totalSlides }}</span>
        </div>
      </div>
    </section>

    <footer class="apresentacao-controles">
      <button
        type="button"
        class="botao-navegacao"
        :disabled="slideAtual === 0"
        @click="voltar"
      >
        ← Anterior
      </button>

      <nav class="indicadores" aria-label="Navegação entre slides">
        <button
          v-for="slide in slides"
          :key="slide.numero"
          type="button"
          class="indicador"
          :class="{ ativo: slideAtual === slide.numero - 1 }"
          :aria-label="`Ir para o slide ${slide.numero}`"
          :aria-current="
            slideAtual === slide.numero - 1 ? 'step' : undefined
          "
          @click="irPara(slide.numero - 1)"
        ></button>
      </nav>

      <button
        type="button"
        class="botao-navegacao principal"
        :disabled="slideAtual === totalSlides - 1"
        @click="avancar"
      >
        Próximo →
      </button>
    </footer>
  </main>
</template>

<style scoped>
.apresentacao {
  --apresentacao-fundo: #07100c;
  --apresentacao-superficie: #101a14;
  --apresentacao-borda: rgba(226, 232, 240, 0.12);
  --apresentacao-texto: #f8fafc;
  --apresentacao-texto-suave: #94a3b8;
  --apresentacao-destaque: #1ed760;

  /*
   * Altura aproximada do header principal do App.vue.
   * Podemos ajustar esse valor conforme a altura real do seu header.
   */
  --altura-header-app: 70px;

  display: grid;
  grid-template-rows: 1fr auto;
  min-height: calc(100vh - var(--altura-header-app));
  min-height: calc(100dvh - var(--altura-header-app));
  color: var(--apresentacao-texto);

  background:
    radial-gradient(
      circle at 20% -10%,
      rgba(30, 215, 96, 0.14),
      transparent 28rem
    ),
    radial-gradient(
      circle at 90% 15%,
      rgba(96, 165, 250, 0.1),
      transparent 24rem
    ),
    var(--apresentacao-fundo);
}

.apresentacao-conteudo {
  display: grid;
  place-items: center;
  padding: 2rem 4vw;
}

/*
 * O contador fica na segunda coluna, ao lado do conteúdo.
 * Assim, ele não se sobrepõe ao título nem precisa ser repetido nos slides.
 */
.slide-area {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 1rem;
  width: min(1280px, 100%);
}

.slide-corpo {
  min-width: 0;
}

.contador {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-top: 1.55rem;
  white-space: nowrap;
}

.contador strong {
  color: var(--apresentacao-destaque);
  font-size: 0.95rem;
}

.contador span {
  color: var(--apresentacao-texto-suave);
  font-size: 0.8rem;
}

.apresentacao-controles {
  display: flex;
  min-height: 74px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 4vw;
  border-top: 1px solid var(--apresentacao-borda);
  background: rgba(7, 16, 12, 0.86);
}

.botao-navegacao {
  min-width: 120px;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--apresentacao-borda);
  border-radius: 10px;
  color: var(--apresentacao-texto);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
}

.botao-navegacao:hover:not(:disabled) {
  border-color: var(--apresentacao-destaque);
}

.botao-navegacao.principal {
  border-color: var(--apresentacao-destaque);
  color: #06100a;
  background: var(--apresentacao-destaque);
}

.botao-navegacao:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.indicadores {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
}

.indicador {
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #334155;
  cursor: pointer;
}

.indicador.ativo {
  width: 22px;
  border-radius: 999px;
  background: var(--apresentacao-destaque);
}

:deep(.slide-indisponivel) {
  padding: 2rem;
  color: var(--apresentacao-texto-suave);
  text-align: center;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

@media (max-width: 620px) {
  .apresentacao-conteudo {
    padding: 1.5rem 1rem;
  }

  .slide-area {
    gap: 0.5rem;
  }

  .contador {
    margin-top: 1.4rem;
  }

  .apresentacao-controles {
    padding: 1rem;
  }

  .indicadores {
    display: none;
  }

  .botao-navegacao {
    min-width: auto;
  }
}
</style>