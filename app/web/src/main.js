/** Função utilizada para criar a aplicação Vue. */
import { createApp } from "vue";

/** Estilos globais compartilhados entre as páginas. */
import "./style.css";

import App from "./App.vue";
import router from "./router";

/** Cria a aplicação usando App.vue como componente raiz. */
const app = createApp(App);

/** Registra o Vue Router na aplicação. */
app.use(router);

/** Renderiza a aplicação no elemento #app do index.html. */
app.mount("#app");