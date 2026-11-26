<script setup>
import { computed, nextTick, ref } from "vue";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Clock3,
  Cpu,
  Scale,
  TableProperties,
  X,
} from "lucide-vue-next";

/** Pesos associados aos valores de nice no Linux. */
const pesosNice = [
  { nice: -20, peso: 88761 },
  { nice: -19, peso: 71755 },
  { nice: -18, peso: 56483 },
  { nice: -17, peso: 46273 },
  { nice: -16, peso: 36291 },
  { nice: -15, peso: 29154 },
  { nice: -14, peso: 23254 },
  { nice: -13, peso: 18705 },
  { nice: -12, peso: 14949 },
  { nice: -11, peso: 11916 },

  { nice: -10, peso: 9548 },
  { nice: -9, peso: 7620 },
  { nice: -8, peso: 6100 },
  { nice: -7, peso: 4904 },
  { nice: -6, peso: 3906 },
  { nice: -5, peso: 3121 },
  { nice: -4, peso: 2501 },
  { nice: -3, peso: 1991 },
  { nice: -2, peso: 1586 },
  { nice: -1, peso: 1277 },

  { nice: 0, peso: 1024 },
  { nice: 1, peso: 820 },
  { nice: 2, peso: 655 },
  { nice: 3, peso: 526 },
  { nice: 4, peso: 423 },
  { nice: 5, peso: 335 },
  { nice: 6, peso: 272 },
  { nice: 7, peso: 215 },
  { nice: 8, peso: 172 },
  { nice: 9, peso: 137 },

  { nice: 10, peso: 110 },
  { nice: 11, peso: 87 },
  { nice: 12, peso: 70 },
  { nice: 13, peso: 56 },
  { nice: 14, peso: 45 },
  { nice: 15, peso: 36 },
  { nice: 16, peso: 29 },
  { nice: 17, peso: 23 },
  { nice: 18, peso: 18 },
  { nice: 19, peso: 15 },
];

/** Valores utilizados no exemplo do slide. */
const processoA = {
  nome: "A",
  nice: 0,
  peso: 1024,
};

const processoB = {
  nome: "B",
  nice: 10,
  peso: 110,
};

/** Soma dos pesos das tarefas que disputam a vCPU. */
const somaPesos = processoA.peso + processoB.peso;

/** Participação ideal de cada tarefa no cenário apresentado. */
const parcelaA = (processoA.peso / somaPesos) * 100;
const parcelaB = (processoB.peso / somaPesos) * 100;

/** Variação do vruntime para 1 ms de CPU recebido. */
const variacaoA = 1 * (1024 / processoA.peso);
const variacaoB = 1 * (1024 / processoB.peso);

/** Divide a tabela em quatro grupos de dez valores. */
const gruposNice = computed(() => {
  const grupos = [];

  for (let inicio = 0; inicio < pesosNice.length; inicio += 10) {
    grupos.push(pesosNice.slice(inicio, inicio + 10));
  }

  return grupos;
});

/** Referências utilizadas para abrir e fechar o modal. */
const modalNice = ref(null);
const botaoConsultar = ref(null);

/** Formata números de acordo com o padrão brasileiro. */
function formatarNumero(valor, casasDecimais) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  });
}

/** Exibe o sinal positivo nos valores de nice maiores que zero. */
function formatarNice(valor) {
  return valor > 0 ? `+${valor}` : String(valor);
}

/** Abre a tabela completa de nice e pesos. */
async function abrirTabelaNice() {
  await nextTick();

  if (modalNice.value && !modalNice.value.open) {
    modalNice.value.showModal();
  }
}

/** Fecha a tabela de nice e pesos. */
function fecharTabelaNice() {
  modalNice.value?.close();
}

/** Devolve o foco ao botão que abriu o modal. */
function restaurarFoco() {
  botaoConsultar.value?.focus();
}
</script>

<template>
  <section class="slide-cfs">
    <!-- Introdução -->
    <div class="introducao">
      <div class="introducao__conteudo">
        <span class="categoria">ESCALONADOR CFS</span>

        <h1>Como funciona o CFS?</h1>

        <p class="pergunta">
          Como o CFS distribui a CPU quando A e B possuem prioridades diferentes?
        </p>
      </div>

      <button
        ref="botaoConsultar"
        type="button"
        class="botao-tabela"
        @click="abrirTabelaNice"
      >
        <TableProperties :size="17" />
        Consultar tabela de nice
      </button>
    </div>

    <!-- Contexto -->
    <div class="contexto">
      <div class="contexto__icone">
        <Cpu :size="20" />
      </div>

      <p>
        Neste exemplo, os processos <strong>A e B</strong> estão sempre prontos
        e disputam a mesma vCPU. O CFS busca uma distribuição de CPU
        proporcional aos seus pesos.
      </p>
    </div>

    <!-- Passos do CFS -->
    <div class="passos">
      <!-- Passo 1 -->
      <article class="cartao">
        <div class="cartao__cabecalho">
          <div class="cartao__icone cartao__icone--azul">
            <Scale :size="19" />
          </div>

          <div>
            <span class="cartao__etapa">PASSO 1</span>
            <h2>Nice e peso</h2>
          </div>
        </div>

        <p class="cartao__descricao">
          O kernel associa cada valor de <code>nice</code> a um peso.
          Um peso maior representa uma participação relativa maior.
        </p>

        <div class="processos">
          <div class="processo processo--a">
            <div class="processo__cabecalho">
              <span class="processo__letra">A</span>
              <strong>Processo A</strong>
            </div>

            <div class="processo__valores">
              <div>
                <span>Nice</span>
                <strong>{{ processoA.nice }}</strong>
              </div>

              <ArrowRight :size="15" />

              <div>
                <span>Peso</span>
                <strong>{{ processoA.peso }}</strong>
              </div>
            </div>
          </div>

          <div class="processo processo--b">
            <div class="processo__cabecalho">
              <span class="processo__letra">B</span>
              <strong>Processo B</strong>
            </div>

            <div class="processo__valores">
              <div>
                <span>Nice</span>
                <strong>+{{ processoB.nice }}</strong>
              </div>

              <ArrowRight :size="15" />

              <div>
                <span>Peso</span>
                <strong>{{ processoB.peso }}</strong>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- Passo 2 -->
      <article class="cartao">
        <div class="cartao__cabecalho">
          <div class="cartao__icone cartao__icone--verde">
            <Calculator :size="19" />
          </div>

          <div>
            <span class="cartao__etapa">PASSO 2</span>
            <h2>Parcela justa ideal</h2>
          </div>
        </div>

        <p class="cartao__descricao">
          A participação esperada de cada tarefa é seu peso dividido
          pela soma dos pesos.
        </p>

        <div class="formula">
          parcela ideal = peso da tarefa / soma dos pesos
        </div>

        <div class="calculos">
          <div class="calculo calculo--a">
            <span>A</span>

            <code>
              {{ processoA.peso }} / {{ somaPesos }}
            </code>

            <strong>{{ formatarNumero(parcelaA, 1) }}%</strong>
          </div>

          <div class="calculo calculo--b">
            <span>B</span>

            <code>
              {{ processoB.peso }} / {{ somaPesos }}
            </code>

            <strong>{{ formatarNumero(parcelaB, 1) }}%</strong>
          </div>
        </div>

        <div
          class="barra"
          role="img"
          :aria-label="`Parcela ideal: A ${formatarNumero(parcelaA, 1)}%, B ${formatarNumero(parcelaB, 1)}%`"
        >
          <div
            class="barra__a"
            :style="{ width: `${parcelaA}%` }"
          ></div>

          <div
            class="barra__b"
            :style="{ width: `${parcelaB}%` }"
          ></div>
        </div>

        <div class="barra__legenda">
          <span>
            <i class="ponto ponto--a"></i>
            A: {{ formatarNumero(parcelaA, 1) }}%
          </span>

          <span>
            <i class="ponto ponto--b"></i>
            B: {{ formatarNumero(parcelaB, 1) }}%
          </span>
        </div>
      </article>

      <!-- Passo 3 -->
      <article class="cartao">
        <div class="cartao__cabecalho">
          <div class="cartao__icone cartao__icone--roxo">
            <Clock3 :size="19" />
          </div>

          <div>
            <span class="cartao__etapa">PASSO 3</span>
            <h2>Atualizar o vruntime</h2>
          </div>
        </div>

        <p class="cartao__descricao">
          O tempo de CPU recebido é convertido em tempo virtual conforme
          o peso da tarefa.
        </p>

        <div class="formula">
          Δvruntime = tempo de CPU × 1024 / peso
        </div>

        <p class="exemplo__titulo">
          Variação para <strong>1 ms de CPU recebido por cada tarefa</strong>:
        </p>

        <div class="exemplos">
          <div class="exemplo exemplo--a">
            <span>A</span>

            <code>1 × 1024 / 1024</code>

            <strong>{{ formatarNumero(variacaoA, 0) }} ms</strong>
          </div>

          <div class="exemplo exemplo--b">
            <span>B</span>

            <code>1 × 1024 / 110</code>

            <strong>≈ {{ formatarNumero(variacaoB, 2) }} ms</strong>
          </div>
        </div>

        <p class="cartao__nota">
          B acumula tempo virtual mais rapidamente porque possui peso menor.
        </p>
      </article>

      <!-- Passo 4 -->
      <article class="cartao">
        <div class="cartao__cabecalho">
          <div class="cartao__icone cartao__icone--laranja">
            <Cpu :size="19" />
          </div>

          <div>
            <span class="cartao__etapa">PASSO 4</span>
            <h2>Escolher a tarefa</h2>
          </div>
        </div>

        <p class="cartao__descricao">
          O CFS compara o tempo virtual acumulado pelas tarefas prontas.
        </p>

        <div class="escolha">
          <span>REGRA GERAL</span>

          <strong>Menor vruntime</strong>

          <ArrowRight :size="18" />

          <strong>Tarefa favorecida</strong>
        </div>

        <div class="detalhe">
          <BookOpen :size="17" />

          <p>
            A escolha busca aproximar a distribuição real da parcela ideal
            ao longo do tempo.
          </p>
        </div>

        <p class="cartao__nota">
          A troca não precisa ocorrer instantaneamente: o momento da
          preempção também depende da implementação.
        </p>
      </article>
    </div>

    <!-- Mensagem final -->
    <div class="mensagem">
      <Scale :size="19" />

      <p>
        O peso influencia a parcela justa e a velocidade de crescimento
        do <code>vruntime</code>.
      </p>
    </div>

    <p class="nota-geral">
      Cenário simplificado: as porcentagens são referências ideais para
      A e B sempre prontos na mesma vCPU, não garantias para intervalos curtos.
    </p>

    <!-- Modal de nice -->
    <dialog
      ref="modalNice"
      class="modal"
      aria-labelledby="titulo-modal-nice"
      aria-describedby="descricao-modal-nice"
      @close="restaurarFoco"
    >
      <div class="modal__conteudo">
        <div class="modal__cabecalho">
          <div>
            <span class="categoria">REFERÊNCIA DO KERNEL LINUX</span>

            <h2 id="titulo-modal-nice">
              Tabela de nice e pesos
            </h2>

            <p id="descricao-modal-nice">
              Valores de −20 a +19. Os pesos de A e B estão destacados.
            </p>
          </div>

          <button
            type="button"
            class="modal__fechar"
            aria-label="Fechar tabela de nice"
            @click="fecharTabelaNice"
          >
            <X :size="19" />
          </button>
        </div>

        <div class="modal__legenda">
          <span>
            <i class="ponto ponto--a"></i>
            Processo A: nice 0
          </span>

          <span>
            <i class="ponto ponto--b"></i>
            Processo B: nice +10
          </span>
        </div>

        <div class="tabelas">
          <table
            v-for="(grupo, indice) in gruposNice"
            :key="indice"
          >
            <caption class="visualmente-oculto">
              Valores de nice de {{ formatarNice(grupo[0].nice) }}
              a {{ formatarNice(grupo[grupo.length - 1].nice) }}
            </caption>

            <thead>
              <tr>
                <th scope="col">Nice</th>
                <th scope="col">Peso</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in grupo"
                :key="item.nice"
                :class="{
                  'linha--a': item.nice === processoA.nice,
                  'linha--b': item.nice === processoB.nice,
                }"
              >
                <td>{{ formatarNice(item.nice) }}</td>
                <td>{{ item.peso }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal__rodape">
          <p>
            Um valor de nice menor corresponde a um peso maior nessa tabela.
          </p>

          <button
            type="button"
            class="botao-fechar"
            @click="fecharTabelaNice"
          >
            Fechar tabela
          </button>
        </div>
      </div>
    </dialog>
  </section>
</template>

<style scoped>
.slide-cfs {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  color: var(--apresentacao-texto, #f8fafc);
}

.introducao {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.introducao__conteudo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.categoria,
.cartao__etapa,
.escolha > span {
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

.botao-tabela,
.botao-fechar,
.modal__fechar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(30, 215, 96, 0.3);
  border-radius: 10px;
  color: #a7f3c2;
  background: rgba(30, 215, 96, 0.08);
  font: inherit;
  cursor: pointer;
}

.botao-tabela {
  flex-shrink: 0;
  min-height: 42px;
  padding: 10px 12px;
  font-size: 0.76rem;
  font-weight: 650;
}

.botao-tabela:hover,
.botao-fechar:hover,
.modal__fechar:hover {
  border-color: rgba(30, 215, 96, 0.65);
  background: rgba(30, 215, 96, 0.14);
}

button:focus-visible {
  outline: 2px solid #f8fafc;
  outline-offset: 3px;
}

.contexto {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 13px;
  background: rgba(30, 215, 96, 0.06);
}

.contexto__icone,
.cartao__icone {
  display: grid;
  flex-shrink: 0;
  width: 39px;
  height: 39px;
  place-items: center;
  border-radius: 11px;
}

.contexto__icone,
.cartao__icone--verde {
  color: #1ed760;
  background: rgba(30, 215, 96, 0.12);
}

.contexto p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.8rem;
  line-height: 1.5;
}

.contexto strong {
  color: #f8fafc;
}

.passos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.cartao {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(
    --apresentacao-borda,
    rgba(226, 232, 240, 0.12)
  );
  border-radius: 16px;
  background: var(--apresentacao-superficie, #101a14);
}

.cartao__cabecalho {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cartao__icone--azul {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

.cartao__icone--roxo {
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.12);
}

.cartao__icone--laranja {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.12);
}

.cartao h2 {
  margin: 4px 0 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.2;
}

.cartao__descricao {
  margin: 11px 0;
  color: #aab9c9;
  font-size: 0.76rem;
  line-height: 1.45;
}

code {
  color: #dbeafe;
  font-family: monospace;
  font-size: 0.96em;
}

.processos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: auto;
}

.processo {
  padding: 10px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.15);
}

.processo--a {
  border-left: 3px solid #60a5fa;
}

.processo--b {
  border-left: 3px solid #f59e0b;
}

.processo__cabecalho {
  display: flex;
  align-items: center;
  gap: 8px;
}

.processo__cabecalho strong {
  color: #e2e8f0;
  font-size: 0.76rem;
}

.processo__letra {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border-radius: 7px;
  font-size: 0.7rem;
  font-weight: 800;
}

.processo--a .processo__letra {
  color: #bfdbfe;
  background: rgba(96, 165, 250, 0.15);
}

.processo--b .processo__letra {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.15);
}

.processo__valores {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  color: #64748b;
}

.processo__valores > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.processo__valores span {
  color: #94a3b8;
  font-size: 0.65rem;
}

.processo__valores strong {
  color: #f8fafc;
  font-family: monospace;
  font-size: 0.85rem;
}

.formula {
  padding: 9px 10px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 9px;
  color: #d1fae5;
  background: rgba(0, 0, 0, 0.17);
  font-family: monospace;
  font-size: 0.72rem;
  line-height: 1.4;
}

.calculos,
.exemplos {
  display: grid;
  gap: 6px;
  margin-top: 9px;
}

.calculo,
.exemplo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
  font-size: 0.73rem;
}

.calculo > span,
.exemplo > span {
  display: grid;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 800;
}

.calculo--a > span,
.exemplo--a > span {
  color: #bfdbfe;
  background: rgba(96, 165, 250, 0.15);
}

.calculo--b > span,
.exemplo--b > span {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.15);
}

.calculo code,
.exemplo code {
  flex: 1;
}

.calculo strong,
.exemplo strong {
  color: #f8fafc;
  font-size: 0.76rem;
  white-space: nowrap;
}

.barra {
  display: flex;
  height: 8px;
  overflow: hidden;
  margin-top: 10px;
  border-radius: 99px;
  background: rgba(148, 163, 184, 0.12);
}

.barra__a {
  background: #60a5fa;
}

.barra__b {
  background: #f59e0b;
}

.barra__legenda,
.modal__legenda {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 8px;
}

.barra__legenda span,
.modal__legenda span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 0.68rem;
}

.ponto {
  display: inline-block;
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
}

.ponto--a {
  background: #60a5fa;
}

.ponto--b {
  background: #f59e0b;
}

.exemplo__titulo {
  margin: 10px 0 0;
  color: #94a3b8;
  font-size: 0.7rem;
  line-height: 1.4;
}

.exemplo__titulo strong {
  color: #cbd5e1;
}

.cartao__nota {
  margin: 10px 0 0;
  color: #94a3b8;
  font-size: 0.7rem;
  line-height: 1.45;
}

.escolha {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 10px;
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 10px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.06);
  text-align: center;
}

.escolha > span {
  flex-basis: 100%;
  font-size: 0.64rem;
}

.escolha strong {
  color: #e2e8f0;
  font-size: 0.76rem;
}

.detalhe {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  color: #60a5fa;
}

.detalhe svg {
  flex-shrink: 0;
}

.detalhe p {
  margin: 0;
  color: #aab9c9;
  font-size: 0.73rem;
  line-height: 1.4;
}

.mensagem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border: 1px solid rgba(30, 215, 96, 0.22);
  border-radius: 11px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.08);
}

.mensagem svg {
  flex-shrink: 0;
}

.mensagem p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.8rem;
  line-height: 1.45;
}

.nota-geral {
  margin: -7px 0 0;
  color: #8293a7;
  font-size: 0.69rem;
  line-height: 1.4;
}

/* Modal */

.modal {
  position: fixed;
  inset: 0;
  width: min(900px, calc(100% - 32px));
  max-width: calc(100% - 32px);
  max-height: min(90vh, 720px);
  margin: auto;
  padding: 0;
  overflow: auto;
  border: 1px solid rgba(226, 232, 240, 0.16);
  border-radius: 18px;
  color: #f8fafc;
  background: #101a14;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.modal::backdrop {
  background: rgba(0, 0, 0, 0.75);
}

.modal__conteudo {
  padding: 22px;
}

.modal__cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.modal__cabecalho h2 {
  margin: 7px 0 0;
  color: #f8fafc;
  font-size: 1.45rem;
  font-weight: 650;
}

.modal__cabecalho p {
  margin: 7px 0 0;
  color: #94a3b8;
  font-size: 0.8rem;
  line-height: 1.45;
}

.modal__fechar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
}

.modal__legenda {
  margin: 17px 0;
}

.modal__legenda span {
  font-size: 0.75rem;
}

.tabelas {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.12);
  font-size: 0.76rem;
}

th,
td {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.07);
  text-align: left;
}

th {
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.035);
  font-size: 0.68rem;
}

td {
  color: #cbd5e1;
  font-family: monospace;
}

tbody tr:last-child td {
  border-bottom: 0;
}

.linha--a td {
  color: #bfdbfe;
  background: rgba(96, 165, 250, 0.15);
  font-weight: 700;
}

.linha--b td {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.15);
  font-weight: 700;
}

.modal__rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 18px;
}

.modal__rodape p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.75rem;
  line-height: 1.45;
}

.botao-fechar {
  flex-shrink: 0;
  min-height: 38px;
  padding: 8px 12px;
  font-size: 0.75rem;
}

.visualmente-oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .introducao {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 700px) {
  .slide-cfs {
    gap: 14px;
  }

  h1 {
    font-size: 2.1rem;
  }

  .contexto {
    align-items: flex-start;
  }

  .passos {
    grid-template-columns: 1fr;
  }

  .tabelas {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 450px) {
  .processos {
    grid-template-columns: 1fr;
  }

  .modal__conteudo {
    padding: 16px;
  }

  .modal__rodape {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>