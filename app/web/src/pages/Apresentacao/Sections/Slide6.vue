<script setup>
import { computed, ref } from "vue";
import {
  ArrowDown,
  ArrowRight,
  Boxes,
  Cpu,
  Database,
  HardDrive,
  Layers3,
  MemoryStick,
  RefreshCcw,
  ShieldCheck,
} from "lucide-vue-next";

/** Processos e mapeamentos usados nesta simulação didática. */
const processos = [
  {
    nome: "A",
    cor: "#60a5fa",
    frame: "04",
    enderecoFisico: "0x4F00",
  },
  {
    nome: "B",
    cor: "#f59e0b",
    frame: "07",
    enderecoFisico: "0x7F00",
  },
];

/** Frames ilustrativos da memória física. */
const frames = [
  {
    id: "kernel",
    titulo: "Frame 03",
    categoria: "Kernel",
    cor: "#1ed760",
    descricao:
      "Exemplo de um frame utilizado pelo kernel. Suas estruturas e tabelas de páginas podem ocupar vários frames.",
  },
  {
    id: "a",
    titulo: "Frame 04",
    categoria: "Dados de A",
    cor: "#60a5fa",
    descricao:
      "Neste exemplo, a página virtual iniciada em 0x1000 do processo A está mapeada para o frame iniciado em 0x4000.",
  },
  {
    id: "b",
    titulo: "Frame 07",
    categoria: "Dados de B",
    cor: "#f59e0b",
    descricao:
      "Neste exemplo, a página virtual iniciada em 0x1000 do processo B está mapeada para o frame iniciado em 0x7000.",
  },
  {
    id: "outro",
    titulo: "Outros frames",
    categoria: "Demais usos",
    cor: "#94a3b8",
    descricao:
      "Representam frames disponíveis ou utilizados por outras páginas do sistema.",
  },
];

const processoSelecionado = ref("A");
const frameSelecionado = ref("a");

/** Guarda as traduções presentes na TLB simulada. */
const traducoesTlb = ref([]);

/** Guarda o resultado do último acesso realizado. */
const ultimoAcesso = ref(null);

const processoAtual = computed(() =>
  processos.find((processo) => processo.nome === processoSelecionado.value),
);

const frameAtual = computed(() =>
  frames.find((frame) => frame.id === frameSelecionado.value),
);

const acessoAtual = computed(() => {
  if (ultimoAcesso.value?.processo !== processoSelecionado.value) {
    return null;
  }

  return ultimoAcesso.value;
});

/** Seleciona o processo que fará o próximo acesso. */
function selecionarProcesso(nome) {
  processoSelecionado.value = nome;
  frameSelecionado.value = nome.toLowerCase();
  ultimoAcesso.value = null;
}

/** Simula uma tradução de endereço. */
function executarAcesso() {
  const processo = processoSelecionado.value;

  const encontrouNaTlb = traducoesTlb.value.includes(processo);

  ultimoAcesso.value = {
    processo,
    encontrouNaTlb,
  };

  if (!encontrouNaTlb) {
    traducoesTlb.value.push(processo);
  }

  frameSelecionado.value = processo.toLowerCase();
}

/** Remove as traduções da TLB simulada. */
function limparTlb() {
  traducoesTlb.value = [];
  ultimoAcesso.value = null;
}
</script>

<template>
  <section class="slide-memoria">
    <div class="slide-memoria__introducao">
      <span class="slide-memoria__categoria">MEMÓRIA VIRTUAL</span>

      <h1>Do endereço virtual à RAM</h1>

      <p class="slide-memoria__pergunta">
        Como a CPU encontra na memória física os dados solicitados por um processo?
      </p>
    </div>

    <div class="aviso-kernel">
      <div class="aviso-kernel__icone">
        <ShieldCheck :size="20" />
      </div>

      <div>
        <strong>O kernel mantém os mapeamentos e as permissões.</strong>

        <span>
          A MMU utiliza essas informações para traduzir os endereços durante a execução.
        </span>
      </div>
    </div>

    <div class="fluxo-memoria">
      <!-- Processo e endereço virtual -->
      <article class="painel painel--processo">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--azul">
            <Boxes :size="20" />
          </div>

          <div>
            <span class="painel__etapa">1 · PROCESSO</span>
            <h2>Endereço virtual</h2>
          </div>
        </div>

        <p class="painel__descricao">
          Escolha um processo para simular seu acesso à memória.
        </p>

        <div class="seletor-processos">
          <button
            v-for="processo in processos"
            :key="processo.nome"
            type="button"
            class="botao-processo"
            :class="{
              'botao-processo--ativo':
                processoSelecionado === processo.nome,
            }"
            :style="{ '--cor-processo': processo.cor }"
            :aria-pressed="processoSelecionado === processo.nome"
            @click="selecionarProcesso(processo.nome)"
          >
            <span class="ponto-processo"></span>
            Processo {{ processo.nome }}
          </button>
        </div>

        <div class="endereco-virtual">
          <span class="endereco-virtual__legenda">
            Endereço solicitado
          </span>

          <strong>0x1F00</strong>

          <div class="endereco-virtual__partes">
            <div>
              <span>Página virtual</span>
              <strong>0x1000</strong>
            </div>

            <div>
              <span>Deslocamento</span>
              <strong>0xF00</strong>
            </div>
          </div>
        </div>

        <p class="painel__observacao">
          Os processos A e B usam o mesmo endereço virtual, cada um em seu
          próprio espaço de endereçamento.
        </p>

        <button
          type="button"
          class="botao-acesso"
          @click="executarAcesso"
        >
          <Cpu :size="16" />

          Simular acesso de {{ processoSelecionado }}

          <ArrowRight :size="16" />
        </button>
      </article>

      <div class="conexao" aria-hidden="true">
        <ArrowRight :size="20" />
      </div>

      <!-- MMU, TLB e tabelas -->
      <article class="painel painel--traducao">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--verde">
            <Cpu :size="20" />
          </div>

          <div>
            <span class="painel__etapa">2 · TRADUÇÃO</span>
            <h2>MMU e tabelas</h2>
          </div>
        </div>

        <p class="painel__descricao">
          A MMU é o componente de hardware que traduz o endereço e verifica
          as permissões de acesso.
        </p>

        <div class="bloco-traducao">
          <div class="bloco-traducao__cabecalho">
            <div>
              <span class="bloco-traducao__titulo">TLB</span>

              <p>Cache de traduções recentes</p>
            </div>

            <button
              type="button"
              class="botao-limpar"
              title="Limpar TLB simulada"
              aria-label="Limpar TLB simulada"
              @click="limparTlb"
            >
              <RefreshCcw :size="15" />
            </button>
          </div>

          <div class="tlb-entradas">
            <span
              v-for="processo in processos"
              :key="processo.nome"
              class="tlb-entrada"
              :class="{
                'tlb-entrada--presente':
                  traducoesTlb.includes(processo.nome),
              }"
            >
              {{ processo.nome }}:
              {{
                traducoesTlb.includes(processo.nome)
                  ? "tradução presente"
                  : "sem tradução"
              }}
            </span>
          </div>
        </div>

        <div class="seta-vertical" aria-hidden="true">
          <ArrowDown :size="17" />
        </div>

        <div class="bloco-traducao">
          <span class="bloco-traducao__titulo">Tabelas de páginas</span>

          <p>
            Quando a tradução não está na TLB, a MMU consulta as tabelas
            associadas ao processo.
          </p>

          <div class="etapas-tabela">
            <span>Diretório</span>
            <ArrowRight :size="13" />
            <span>Tabela</span>
            <ArrowRight :size="13" />
            <span>Frame</span>
          </div>
        </div>

        <div
          class="resultado-acesso"
          :class="{
            'resultado-acesso--ativo': acessoAtual,
          }"
          aria-live="polite"
        >
          <template v-if="acessoAtual">
            <strong>
              {{
                acessoAtual.encontrouNaTlb
                  ? "Tradução encontrada na TLB"
                  : "Tradução obtida pela tabela de páginas"
              }}
            </strong>

            <span>
              Processo {{ processoAtual.nome }}:
              0x1F00 → {{ processoAtual.enderecoFisico }}
            </span>
          </template>

          <template v-else>
            <strong>Aguardando acesso</strong>

            <span>
              Clique em “Simular acesso” para acompanhar a tradução.
            </span>
          </template>
        </div>
      </article>

      <div class="conexao" aria-hidden="true">
        <ArrowRight :size="20" />
      </div>

      <!-- Memória física -->
      <article class="painel painel--ram">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--laranja">
            <MemoryStick :size="20" />
          </div>

          <div>
            <span class="painel__etapa">3 · MEMÓRIA FÍSICA</span>
            <h2>Frames da RAM</h2>
          </div>
        </div>

        <p class="painel__descricao">
          A página virtual é associada a um frame da memória física.
        </p>

        <div class="lista-frames">
          <button
            v-for="frame in frames"
            :key="frame.id"
            type="button"
            class="frame"
            :class="{
              'frame--ativo': frameSelecionado === frame.id,
            }"
            :style="{ '--cor-frame': frame.cor }"
            :aria-pressed="frameSelecionado === frame.id"
            @click="frameSelecionado = frame.id"
          >
            <span class="frame__indicador"></span>

            <span class="frame__conteudo">
              <strong>{{ frame.titulo }}</strong>
              <small>{{ frame.categoria }}</small>
            </span>

            <HardDrive :size="16" />
          </button>
        </div>

        <div class="detalhe-frame" aria-live="polite">
          <strong :style="{ color: frameAtual.cor }">
            {{ frameAtual.titulo }} · {{ frameAtual.categoria }}
          </strong>

          <p>{{ frameAtual.descricao }}</p>
        </div>
      </article>
    </div>

    <div class="resumo-traducao">
      <Layers3 :size="19" />

      <p>
        Com páginas de <strong>4 KiB</strong>, a tradução altera a página
        para o frame correspondente. O deslocamento
        <strong>0xF00</strong> permanece igual.
      </p>
    </div>

    <p class="nota">
      Exemplo didático: os frames são ilustrativos, e a TLB foi simplificada
      para demonstrar o reaproveitamento de traduções.
    </p>
  </section>
</template>

<style scoped>
.slide-memoria {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 18px;
  color: var(--apresentacao-texto, #f8fafc);
}

.slide-memoria__introducao {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slide-memoria__categoria,
.painel__etapa {
  color: var(--apresentacao-destaque, #1ed760);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.slide-memoria h1 {
  margin: 0;
  font-size: clamp(2.2rem, 3.6vw, 3.8rem);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 1.08;
}

.slide-memoria__pergunta {
  margin: 0;
  color: #cbd5e1;
  font-size: clamp(0.95rem, 1.2vw, 1.1rem);
  line-height: 1.5;
}

.aviso-kernel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border: 1px solid rgba(30, 215, 96, 0.24);
  border-radius: 14px;
  background: rgba(30, 215, 96, 0.07);
}

.aviso-kernel__icone {
  display: grid;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 11px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.12);
}

.aviso-kernel > div:last-child {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: baseline;
  font-size: 0.83rem;
  line-height: 1.5;
}

.aviso-kernel span {
  color: var(--apresentacao-texto-suave, #94a3b8);
}

.fluxo-memoria {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20px minmax(0, 1.15fr) 20px minmax(
      0,
      1fr
    );
  align-items: stretch;
  gap: 8px;
}

.painel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--apresentacao-borda, rgba(226, 232, 240, 0.12));
  border-radius: 18px;
  background: var(--apresentacao-superficie, #101a14);
}

.painel__cabecalho {
  display: flex;
  align-items: center;
  gap: 11px;
}

.painel__icone {
  display: grid;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
}

.painel__icone--azul {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

.painel__icone--verde {
  color: #1ed760;
  background: rgba(30, 215, 96, 0.12);
}

.painel__icone--laranja {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}

.painel h2 {
  margin: 4px 0 0;
  font-size: 1.15rem;
  font-weight: 650;
  line-height: 1.2;
}

.painel__descricao {
  min-height: 38px;
  margin: 14px 0;
  color: var(--apresentacao-texto-suave, #94a3b8);
  font-size: 0.82rem;
  line-height: 1.5;
}

.conexao {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1ed760;
}

.seletor-processos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.botao-processo,
.botao-acesso,
.botao-limpar,
.frame {
  font: inherit;
  cursor: pointer;
}

.botao-processo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 8px;
  border: 1px solid rgba(226, 232, 240, 0.14);
  border-radius: 10px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.025);
  font-size: 0.78rem;
  font-weight: 650;
}

.botao-processo--ativo {
  border-color: var(--cor-processo);
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.06);
}

.ponto-processo {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cor-processo);
}

.endereco-virtual {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 13px;
  padding: 14px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
}

.endereco-virtual__legenda {
  color: #94a3b8;
  font-size: 0.72rem;
}

.endereco-virtual > strong {
  color: #f8fafc;
  font-family: monospace;
  font-size: 1.5rem;
}

.endereco-virtual__partes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 7px;
}

.endereco-virtual__partes > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.endereco-virtual__partes span {
  color: #94a3b8;
  font-size: 0.7rem;
}

.endereco-virtual__partes strong {
  color: #dbeafe;
  font-family: monospace;
  font-size: 0.88rem;
}

.painel__observacao {
  margin: 12px 0;
  color: #94a3b8;
  font-size: 0.76rem;
  line-height: 1.45;
}

.botao-acesso {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  margin-top: auto;
  padding: 9px 12px;
  border: 1px solid #1ed760;
  border-radius: 10px;
  color: #06210e;
  background: #1ed760;
  font-size: 0.8rem;
  font-weight: 750;
}

.botao-acesso:hover {
  background: #4be17e;
}

.bloco-traducao {
  padding: 12px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.16);
}

.bloco-traducao__cabecalho {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.bloco-traducao__titulo {
  color: #f8fafc;
  font-size: 0.82rem;
  font-weight: 750;
}

.bloco-traducao p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 0.75rem;
  line-height: 1.45;
}

.botao-limpar {
  display: grid;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid rgba(226, 232, 240, 0.15);
  border-radius: 8px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.03);
}

.botao-limpar:hover {
  color: #1ed760;
  border-color: rgba(30, 215, 96, 0.5);
}

.tlb-entradas {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.tlb-entrada {
  padding: 5px 7px;
  border-radius: 7px;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.1);
  font-size: 0.68rem;
}

.tlb-entrada--presente {
  color: #86efac;
  background: rgba(30, 215, 96, 0.12);
}

.seta-vertical {
  display: flex;
  justify-content: center;
  padding: 4px 0;
  color: #1ed760;
}

.etapas-tabela {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 10px;
  color: #86efac;
  font-size: 0.72rem;
}

.etapas-tabela span {
  padding: 5px 7px;
  border: 1px solid rgba(30, 215, 96, 0.16);
  border-radius: 7px;
  background: rgba(30, 215, 96, 0.05);
}

.resultado-acesso {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 12px;
  padding: 11px 12px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 10px;
  background: rgba(148, 163, 184, 0.05);
}

.resultado-acesso--ativo {
  border-color: rgba(30, 215, 96, 0.25);
  background: rgba(30, 215, 96, 0.06);
}

.resultado-acesso strong {
  font-size: 0.76rem;
}

.resultado-acesso span {
  color: #94a3b8;
  font-size: 0.73rem;
  line-height: 1.4;
}

.lista-frames {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.frame {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 48px;
  padding: 8px 10px;
  border: 1px solid rgba(226, 232, 240, 0.11);
  border-radius: 10px;
  color: #94a3b8;
  background: rgba(0, 0, 0, 0.16);
  text-align: left;
}

.frame--ativo {
  border-color: var(--cor-frame);
  background: rgba(255, 255, 255, 0.05);
}

.frame__indicador {
  align-self: stretch;
  width: 4px;
  border-radius: 4px;
  background: var(--cor-frame);
}

.frame__conteudo {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.frame__conteudo strong {
  color: #f8fafc;
  font-size: 0.76rem;
}

.frame__conteudo small {
  color: #94a3b8;
  font-size: 0.7rem;
}

.detalhe-frame {
  margin-top: 10px;
  padding: 11px;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
}

.detalhe-frame strong {
  font-size: 0.74rem;
}

.detalhe-frame p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 0.72rem;
  line-height: 1.45;
}

.resumo-traducao {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 15px;
  border: 1px solid rgba(30, 215, 96, 0.22);
  border-radius: 12px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.08);
}

.resumo-traducao svg {
  flex-shrink: 0;
}

.resumo-traducao p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.82rem;
  line-height: 1.45;
}

.resumo-traducao strong {
  color: #f8fafc;
}

.nota {
  margin: -7px 0 0;
  color: #8293a7;
  font-size: 0.7rem;
  line-height: 1.4;
}

button:focus-visible {
  outline: 2px solid #f8fafc;
  outline-offset: 3px;
}

@media (max-width: 1000px) {
  .fluxo-memoria {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .conexao {
    transform: rotate(90deg);
  }

  .painel__descricao {
    min-height: auto;
  }
}

@media (max-width: 600px) {
  .slide-memoria {
    gap: 14px;
  }

  .painel {
    padding: 15px;
  }

  .aviso-kernel {
    align-items: flex-start;
  }

  .slide-memoria h1 {
    font-size: 2.1rem;
  }
}
</style>