<script setup>
import {
  ArrowDown,
  ArrowRight,
  ChartNoAxesCombined,
  Cpu,
  FileBarChart,
  HardDrive,
  Layers3,
  Monitor,
  Settings2,
} from "lucide-vue-next";

const etapas = [
  {
    numero: "01",
    titulo: "Executar",
    descricao: "Os scripts iniciam os processos do experimento.",
    icone: Cpu,
  },
  {
    numero: "02",
    titulo: "Coletar",
    descricao: "O pidstat registra métricas durante a execução.",
    icone: FileBarChart,
  },
  {
    numero: "03",
    titulo: "Visualizar",
    descricao: "A API e a dashboard apresentam os resultados.",
    icone: ChartNoAxesCombined,
  },
];
</script>

<template>
  <section class="slide-implementacao">
    <!-- Introdução -->
    <div class="introducao">
      <span class="categoria">IMPLEMENTAÇÃO DO PROJETO</span>

      <h1>Ambiente dos experimentos</h1>

      <p class="pergunta">
        Como criamos um ambiente para comparar CFS e EEVDF?
      </p>
    </div>

    <!-- Contexto -->
    <div class="contexto">
      <div class="contexto__icone">
        <Monitor :size="20" />
      </div>

      <p>
        O laboratório utiliza uma <strong>máquina virtual Ubuntu</strong>
        com duas versões do kernel. Os mesmos programas e scripts são
        executados separadamente em cada uma delas.
      </p>
    </div>

    <div class="conteudo">
      <!-- Ambiente e kernels -->
      <article class="painel">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--verde">
            <Layers3 :size="19" />
          </div>

          <div>
            <span class="painel__categoria">INFRAESTRUTURA</span>
            <h2>Máquina virtual e kernels</h2>
          </div>
        </div>

        <div class="ambiente">
          <div class="ambiente__camada">
            <div class="ambiente__icone">
              <Monitor :size="18" />
            </div>

            <div>
              <strong>Computador hospedeiro</strong>
              <small>Executa o VirtualBox</small>
            </div>
          </div>

          <div class="ambiente__seta" aria-hidden="true">
            <ArrowDown :size="15" />
          </div>

          <div class="ambiente__camada ambiente__camada--vm">
            <div class="ambiente__icone">
              <Cpu :size="18" />
            </div>

            <div>
              <strong>Máquina virtual Ubuntu</strong>
              <small>4 vCPUs · 8 GB de RAM</small>
            </div>
          </div>

          <div class="ambiente__seta" aria-hidden="true">
            <ArrowDown :size="15" />
          </div>

          <div class="grub">
            <div class="grub__cabecalho">
              <HardDrive :size="17" />

              <div>
                <strong>GRUB</strong>
                <small>Escolha do kernel durante a inicialização</small>
              </div>
            </div>

            <div class="kernels">
              <div class="kernel kernel--cfs">
                <span>KERNEL LINUX</span>
                <strong>6.5.11</strong>
                <small>CFS</small>
              </div>

              <div class="kernel kernel--eevdf">
                <span>KERNEL LINUX</span>
                <strong>7.0.0</strong>
                <small>EEVDF</small>
              </div>
            </div>
          </div>
        </div>

        <p class="painel__nota">
          Apenas um kernel é executado por vez. Para alternar entre eles,
          é necessário reiniciar a VM.
        </p>
      </article>

      <!-- Execução -->
      <article class="painel">
        <div class="painel__cabecalho">
          <div class="painel__icone painel__icone--azul">
            <Settings2 :size="19" />
          </div>

          <div>
            <span class="painel__categoria">FLUXO DO LABORATÓRIO</span>
            <h2>Da execução à dashboard</h2>
          </div>
        </div>

        <p class="descricao">
          Em cada kernel, executamos os experimentos e registramos os
          resultados para comparação.
        </p>

        <div class="etapas">
          <template
            v-for="(etapa, indice) in etapas"
            :key="etapa.numero"
          >
            <div class="etapa">
              <span class="etapa__numero">{{ etapa.numero }}</span>

              <div class="etapa__icone">
                <component
                  :is="etapa.icone"
                  :size="18"
                />
              </div>

              <div class="etapa__conteudo">
                <strong>{{ etapa.titulo }}</strong>
                <p>{{ etapa.descricao }}</p>
              </div>
            </div>

            <div
              v-if="indice < etapas.length - 1"
              class="etapas__seta"
              aria-hidden="true"
            >
              <ArrowDown :size="15" />
            </div>
          </template>
        </div>

        <div class="afinidade">
          <div class="afinidade__icone">
            <Cpu :size="17" />
          </div>

          <p>
            Os processos dos experimentos são configurados para disputar
            a <strong>vCPU 0</strong>.
          </p>
        </div>

        <p class="painel__nota">
          A afinidade limita onde esses processos podem executar, mas não
          reserva a vCPU exclusivamente para eles.
        </p>
      </article>
    </div>

    <!-- Mensagem final -->
    <div class="mensagem">
      <ArrowRight :size="18" />

      <p>
        O mesmo projeto é executado em cada kernel; os resultados são
        armazenados e apresentados na dashboard.
      </p>
    </div>

    <p class="nota-geral">
      A comparação ocorre entre versões diferentes do kernel; além do
      escalonamento, outras diferenças podem influenciar as medições.
    </p>
  </section>
</template>

<style scoped>
.slide-implementacao {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 15px;
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
.mensagem {
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
.ambiente__icone,
.etapa__icone,
.afinidade__icone {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  border-radius: 10px;
}

.contexto__icone,
.painel__icone {
  width: 39px;
  height: 39px;
}

.contexto__icone,
.painel__icone--verde {
  color: #1ed760;
  background: rgba(30, 215, 96, 0.12);
}

.painel__icone--azul {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

.contexto p,
.mensagem p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.8rem;
  line-height: 1.5;
}

.contexto strong,
.mensagem strong {
  color: #f8fafc;
}

.conteudo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.painel {
  display: flex;
  flex-direction: column;
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
  color: #f8fafc;
  font-size: 1.05rem;
  font-weight: 650;
  line-height: 1.2;
}

.descricao {
  margin: 13px 0;
  color: #aab9c9;
  font-size: 0.77rem;
  line-height: 1.5;
}

.ambiente {
  display: flex;
  flex-direction: column;
  margin-top: 15px;
}

.ambiente__camada {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 57px;
  padding: 10px 12px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.14);
}

.ambiente__camada--vm {
  border-color: rgba(30, 215, 96, 0.22);
  background: rgba(30, 215, 96, 0.04);
}

.ambiente__icone {
  width: 34px;
  height: 34px;
  color: #1ed760;
  background: rgba(30, 215, 96, 0.1);
}

.ambiente__camada > div:last-child,
.grub__cabecalho > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ambiente__camada strong,
.grub__cabecalho strong {
  color: #f8fafc;
  font-size: 0.8rem;
}

.ambiente__camada small,
.grub__cabecalho small {
  color: #94a3b8;
  font-size: 0.7rem;
}

.ambiente__seta,
.etapas__seta {
  display: flex;
  justify-content: center;
  height: 20px;
  color: #64748b;
}

.grub {
  padding: 12px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.14);
}

.grub__cabecalho {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #c084fc;
}

.kernels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 11px;
}

.kernel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 10px;
  border: 1px solid rgba(226, 232, 240, 0.09);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.025);
}

.kernel--cfs {
  border-left: 3px solid #60a5fa;
}

.kernel--eevdf {
  border-left: 3px solid #f59e0b;
}

.kernel > span {
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.kernel strong {
  color: #f8fafc;
  font-family: monospace;
  font-size: 0.85rem;
}

.kernel small {
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 0.66rem;
  font-weight: 750;
}

.kernel--cfs small {
  color: #bfdbfe;
  background: rgba(96, 165, 250, 0.14);
}

.kernel--eevdf small {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.14);
}

.painel__nota {
  margin: 12px 0 0;
  color: #8293a7;
  font-size: 0.71rem;
  line-height: 1.45;
}

.etapas {
  display: flex;
  flex-direction: column;
}

.etapa {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 65px;
  padding: 10px 12px;
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.14);
}

.etapa__numero {
  color: #64748b;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
}

.etapa__icone {
  width: 35px;
  height: 35px;
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.etapa__conteudo strong {
  color: #f8fafc;
  font-size: 0.8rem;
}

.etapa__conteudo p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 0.72rem;
  line-height: 1.4;
}

.afinidade {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 14px;
  padding: 11px;
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 10px;
  background: rgba(96, 165, 250, 0.05);
}

.afinidade__icone {
  width: 32px;
  height: 32px;
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.afinidade p {
  margin: 0;
  color: #aab9c9;
  font-size: 0.75rem;
  line-height: 1.45;
}

.afinidade strong {
  color: #f8fafc;
}

.mensagem {
  color: #1ed760;
}

.mensagem svg {
  flex-shrink: 0;
}

.nota-geral {
  margin: -6px 0 0;
  color: #8293a7;
  font-size: 0.69rem;
  line-height: 1.4;
}

@media (max-width: 900px) {
  .conteudo {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .slide-implementacao {
    gap: 13px;
  }

  h1 {
    font-size: 2.1rem;
  }

  .contexto {
    align-items: flex-start;
  }

  .painel {
    padding: 15px;
  }

  .kernels {
    grid-template-columns: 1fr;
  }
}
</style>