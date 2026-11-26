<template>
  <article class="slide-apresentacao">
    <div class="conteudo">
      <div class="texto">
        <span class="destaque">SISTEMAS OPERACIONAIS</span>

        <h1>
          Escalonamento de Processos
          <strong>no Linux</strong>
        </h1>

        <p>
          Uma análise prática de processos, concorrência, CFS, EEVDF,
          prioridades e responsividade.
        </p>

        <div class="tecnologias">
          <span>Ubuntu</span>
          <span>Linux</span>
          <span>C</span>
          <span>Node.js</span>
          <span>Vue</span>
        </div>
      </div>

      <div class="ilustracao" aria-label="Processos concorrendo pela vCPU 0">
        <div class="orbita orbita-interna"></div>
        <div class="orbita orbita-media"></div>
        <div class="orbita orbita-externa"></div>

        <div class="cpu">
          <span>vCPU 0</span>
          <strong>Escalonador</strong>
        </div>

        <span class="processo processo-a">A</span>
        <span class="processo processo-b">B</span>
        <span class="processo processo-c">C</span>
      </div>
    </div>

    <footer class="rodape">
      <span>Universidade Salvador — UNIFACS</span>
      <span>Laboratório experimental com CFS e EEVDF</span>
    </footer>
  </article>
</template>

<style scoped>
.slide-apresentacao {
  display: grid;
  width: min(1220px, 100%);
  min-height: min(600px, 65vh);
  align-content: space-between;
}

.conteudo {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  align-items: center;
  gap: 3rem;
}

.destaque {
  display: block;
  margin-bottom: 0.8rem;
  color: var(--apresentacao-destaque);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.texto h1 {
  margin: 0;
  color: var(--apresentacao-texto);
  font-size: clamp(3rem, 6vw, 5.8rem);
  line-height: 1.05;
}

.texto h1 strong {
  display: block;
  color: var(--apresentacao-destaque);
}

.texto p {
  max-width: 650px;
  margin: 1.2rem 0 0;
  color: var(--apresentacao-texto-suave);
  font-size: 1.15rem;
  line-height: 1.7;
}

.tecnologias {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.8rem;
}

.tecnologias span {
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--apresentacao-borda);
  border-radius: 999px;
  color: #d6e5db;
  font-size: 0.78rem;
  background: rgba(255, 255, 255, 0.03);
}

.ilustracao {
  position: relative;
  min-height: 360px;
}

.orbita {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid rgba(30, 215, 96, 0.24);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.orbita-interna {
  width: 190px;
  height: 190px;
}

.orbita-media {
  width: 280px;
  height: 280px;
}

.orbita-externa {
  width: 355px;
  height: 355px;
  border-style: dashed;
}

.cpu {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 138px;
  height: 138px;
  place-content: center;
  border-radius: 50%;
  text-align: center;
  background: #13281b;
  box-shadow: 0 0 60px rgba(30, 215, 96, 0.18);
  transform: translate(-50%, -50%);
}

.cpu span {
  color: var(--apresentacao-texto-suave);
  font-size: 0.76rem;
}

.cpu strong {
  margin-top: 0.3rem;
}

.processo {
  position: absolute;
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border: 2px solid currentColor;
  border-radius: 50%;
  font-weight: 900;
  background: #0b1710;
}

.processo-a {
  top: 24px;
  left: 16%;
  color: #60a5fa;
}

.processo-b {
  right: 16%;
  bottom: 46px;
  color: #f59e0b;
}

.processo-c {
  top: 45%;
  right: 4%;
  color: #34d399;
}

.rodape {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3rem;
  color: var(--apresentacao-texto-suave);
  font-size: 0.78rem;
}

@media (max-width: 900px) {
  .conteudo {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .ilustracao {
    min-height: 300px;
  }

  .orbita-externa {
    width: 280px;
    height: 280px;
  }

  .orbita-media {
    width: 230px;
    height: 230px;
  }

  .orbita-interna {
    width: 170px;
    height: 170px;
  }
}

@media (max-width: 620px) {
  .texto h1 {
    font-size: clamp(2.4rem, 10vw, 3.5rem);
  }

  .rodape {
    flex-direction: column;
    gap: 0.4rem;
  }
}
</style>