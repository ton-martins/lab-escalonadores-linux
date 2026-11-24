/** Funções utilizadas para configurar rotas no Vue. */
import {
  createRouter,
  createWebHistory,
} from "vue-router";

import Dashboard from "../pages/Dashboard.vue";
import Apresentacao from "../pages/Apresentacao.vue";

/** Define as páginas acessíveis pela aplicação. */
const routes = [
  {
    path: "/",
    name: "apresentacao",
    component: Apresentacao,
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: Dashboard,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

/** Cria o roteador da aplicação. */
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;