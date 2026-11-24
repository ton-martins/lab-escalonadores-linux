<script setup>
/** Componentes e estado de rota do Vue Router. */
import {
  RouterLink,
  RouterView,
  useRoute,
} from "vue-router";

/** Ícones utilizados no cabeçalho. */
import {
  Cpu,
  LayoutDashboard,
  Presentation,
} from "lucide-vue-next";

const route = useRoute();

/** Páginas disponíveis na navegação principal. */
const navegacao = [
  {
    titulo: "Apresentação",
    nomeRota: "apresentacao",
    icone: Presentation,
  },
  {
    titulo: "Dashboard",
    nomeRota: "dashboard",
    icone: LayoutDashboard,
  },
];
</script>

<template>
  <div class="app-shell">
    <header
      class="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--background-color)]"
    >
      <div
        class="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--highlight-color)] text-black"
          >
            <Cpu :size="21" :stroke-width="2.5" />
          </div>

          <div class="min-w-0">
            <h1 class="truncate text-sm font-semibold">
              Laboratório de Escalonamento
            </h1>

            <p class="text-xs text-[var(--text-secondary-color)]">
              CFS e EEVDF
            </p>
          </div>
        </div>

        <nav class="app-panel-muted hidden items-center gap-1 p-1 sm:flex">
          <RouterLink
            v-for="item in navegacao"
            :key="item.nomeRota"
            :to="{ name: item.nomeRota }"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
            :class="
              route.name === item.nomeRota
                ? 'bg-[var(--accent-hover-color)] text-[var(--text-primary-color)]'
                : 'text-[var(--text-secondary-color)] hover:bg-[var(--accent-hover-color)] hover:text-[var(--text-primary-color)]'
            "
          >
            <component :is="item.icone" :size="16" />
            {{ item.titulo }}
          </RouterLink>
        </nav>

        <span
          class="hidden rounded-full bg-[var(--highlight-soft-color)] px-3 py-1.5 text-xs font-medium text-[var(--highlight-color)] md:block"
        >
          Ambiente local
        </span>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>