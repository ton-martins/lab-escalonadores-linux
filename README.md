# Laboratório de Escalonamento Linux

### Comparação entre CFS e EEVDF

[![Ubuntu](https://img.shields.io/badge/Ubuntu-24.04%20LTS-E95420?logo=ubuntu&logoColor=white)](https://ubuntu.com/)
[![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Linux](https://img.shields.io/badge/Linux-CFS%20%7C%20EEVDF-FCC624?logo=linux&logoColor=black)](https://www.kernel.org/)

Este projeto implementa um laboratório para estudar e comparar o comportamento dos mecanismos de escalonamento **CFS** e **EEVDF** no Linux.

Os experimentos executam processos concorrentes em uma mesma vCPU, coletam métricas com `pidstat` e armazenam os resultados em arquivos CSV e JSON. Uma aplicação web apresenta os conceitos, as simulações e os resultados coletados.

---

## Sumário

- [Visão geral](#visão-geral)
- [Experimentos](#experimentos)
- [Arquitetura da aplicação](#arquitetura-da-aplicação)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Kernels utilizados](#kernels-utilizados)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Instalação da aplicação](#instalação-da-aplicação)
- [Execução dos experimentos](#execução-dos-experimentos)
- [Resultados](#resultados)
- [API](#api)
- [Comunicação em tempo real](#comunicação-em-tempo-real)
- [Aplicação web](#aplicação-web)
- [Metodologia e limitações](#metodologia-e-limitações)

---

## Visão geral

O laboratório foi desenvolvido para relacionar conceitos de sistemas operacionais com a observação prática do escalonamento de processos.

A aplicação reúne:

- **Apresentação:** conteúdos, diagramas e simulações sobre sistemas operacionais e escalonamento.
- **Experimentos:** programas em C e scripts Bash para criar cargas concorrentes.
- **Coleta:** registro de métricas de CPU e espera com `pidstat`.
- **Dashboard:** consulta e visualização dos resultados por execução.

### Objetivos

- Observar a divisão de CPU entre processos CPU-bound.
- Demonstrar a influência do valor `nice` na distribuição de CPU.
- Simular uma tarefa que alterna trabalho e espera.
- Comparar resultados obtidos com CFS e EEVDF.
- Apresentar os dados por meio de uma aplicação web.

---

## Experimentos

| Experimento | Cenário | Configuração padrão |
| --- | --- | --- |
| **Experimento 1** | Duas tarefas CPU-bound com mesma prioridade. | A: nice `0` · B: nice `0` |
| **Experimento 2** | Duas tarefas CPU-bound com prioridades diferentes. | A: nice `0` · B: nice `+10` |
| **Experimento 3** | Duas tarefas CPU-bound e uma tarefa com espera simulada. | A: nice `0` · B: nice `0` · C: nice `0` |

Em todos os cenários, os processos são configurados para executar na **vCPU 0**.

### Programas

| Programa | Finalidade |
| --- | --- |
| `cpu_bound_worker.c` | Executa operações repetidamente durante o tempo configurado. |
| `io_bound_simulator.c` | Alterna trabalho e pausas com `nanosleep()`, simulando uma tarefa que aguarda. |

O programa I/O-bound é uma **simulação**: suas pausas representam períodos de espera, mas o ciclo não realiza uma operação real de leitura ou escrita em disco.

---

## Arquitetura da aplicação

```text
┌──────────────────────────────────────────────────────────────┐
│                      EXPERIMENTOS                            │
│                                                              │
│  Programas em C → Scripts Bash → pidstat                     │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    RESULTADOS                                │
│                                                              │
│  status.json · resumo.csv · amostras.csv · logs              │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       API                                    │
│                                                              │
│  Node.js · Express · Chokidar · Socket.IO                    │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    APLICAÇÃO WEB                             │
│                                                              │
│  Vue · Apresentação · Dashboard · Gráficos                   │
└──────────────────────────────────────────────────────────────┘
```

### Tecnologias

| Área | Tecnologias |
| --- | --- |
| **Sistema e experimentos** | Ubuntu, Linux, C, GCC, Bash, `taskset`, `pidstat`, `awk` |
| **API** | Node.js, Express, Socket.IO, Chokidar, `csv-parse` |
| **Frontend** | Vue 3, Vue Router, Vite, Tailwind CSS, Chart.js, Lucide |

---

## Estrutura do projeto

```text
lab/
├── app/
│   ├── api/
│   │   ├── config/
│   │   │   └── ambiente.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── observers/
│   │   ├── realtime/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── package.json
│   │   └── package-lock.json
│   │
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── composables/
│       │   ├── config/
│       │   ├── pages/
│       │   │   ├── Apresentacao/
│       │   │   │   ├── Sections/
│       │   │   │   │   └── Slide*.vue
│       │   │   │   └── Index.vue
│       │   │   └── Dashboard.vue
│       │   ├── router/
│       │   ├── services/
│       │   ├── App.vue
│       │   ├── main.js
│       │   └── style.css
│       ├── index.html
│       ├── package.json
│       ├── package-lock.json
│       └── vite.config.js
│
├── bin/                         # Binários gerados pela compilação
├── docs/                        # Documentos do projeto, quando disponíveis
├── resultados/
│   ├── cfs/
│   └── eevdf/
├── scripts/
│   ├── exp1.sh
│   ├── exp2.sh
│   └── exp3.sh
├── src/
│   ├── cpu_bound_worker.c
│   └── io_bound_simulator.c
├── .gitignore
└── README.md
```

> Diretórios vazios, como `bin/` e `docs/`, podem não aparecer em um clone do repositório. Os scripts criam os diretórios necessários para os resultados e binários.

---

## Pré-requisitos

O ambiente utilizado no laboratório possui:

| Item | Configuração |
| --- | --- |
| Sistema operacional | Ubuntu 24.04 LTS |
| Arquitetura | x86_64 |
| Virtualização | VirtualBox |
| Memória | 8 GB de RAM |
| Processamento | 4 vCPUs |
| Armazenamento | 35 GB |
| Vídeo | VMSVGA com 128 MB |

Os experimentos utilizam a vCPU `0`. As demais vCPUs podem ser usadas pelo sistema e pelos aplicativos, mas essa configuração **não isola completamente** a vCPU utilizada nos testes.

### Dependências do sistema

No Ubuntu, instale as ferramentas necessárias:

```bash
sudo apt update

sudo apt install -y \
  build-essential \
  sysstat \
  util-linux \
  curl \
  git \
  wget \
  dkms
```

Verifique as instalações:

```bash
gcc --version
pidstat -V
taskset --version
git --version
curl --version
```

### Node.js

A API e o frontend utilizam **Node.js 24** e `npm`.

---

## Kernels utilizados

O laboratório foi configurado com as seguintes versões:

| Kernel | Mecanismo estudado |
| --- | --- |
| `6.5.11-060511-generic` | CFS |
| `7.0.0-43-generic` | EEVDF |

O Linux iniciou a transição do CFS para o EEVDF na versão 6.6. Neste projeto, os dois kernels acima são utilizados como ambientes de comparação.

Para verificar o kernel em execução:

```bash
uname -r
```

Os scripts reconhecem **essas versões exatas**. Se outro kernel estiver em execução, os scripts informarão que a versão não é reconhecida.

> O kernel 6.5.11 utilizado aqui é um pacote mainline para fins de estudo. Consulte a [documentação do Ubuntu sobre builds mainline](https://wiki.ubuntu.com/Kernel/MainlineBuilds) antes de utilizá-lo em outro ambiente.

---

## Configuração do ambiente

### 1. Obter o projeto

Clone o repositório:

```bash
git clone https://github.com/ton-martins/lab-escalonadores-linux.git ~/lab
cd ~/lab
```

### 2. Verificar os kernels instalados

Liste as imagens disponíveis:

```bash
ls -1 /boot/vmlinuz-*
```

Confirme qual kernel está em execução:

```bash
uname -r
```

Os passos abaixo descrevem a instalação do kernel `6.5.11` utilizado no laboratório. Para reproduzir também o ambiente EEVDF com os scripts atuais, o kernel `7.0.0-43-generic` precisa estar instalado e disponível no GRUB.

### 3. Instalar o kernel 6.5.11

Crie o diretório dos pacotes:

```bash
mkdir -p ~/kernels/cfs-6.5.11
cd ~/kernels/cfs-6.5.11
```

Defina a origem:

```bash
BASE="https://kernel.ubuntu.com/mainline/v6.5.11/amd64"
```

Baixe o arquivo de verificação e os pacotes:

```bash
wget -c "$BASE/CHECKSUMS"

wget -c \
  "$BASE/linux-headers-6.5.11-060511_6.5.11-060511.202311151304_all.deb"

wget -c \
  "$BASE/linux-headers-6.5.11-060511-generic_6.5.11-060511.202311151304_amd64.deb"

wget -c \
  "$BASE/linux-modules-6.5.11-060511-generic_6.5.11-060511.202311151304_amd64.deb"

wget -c \
  "$BASE/linux-image-unsigned-6.5.11-060511-generic_6.5.11-060511.202311151304_amd64.deb"
```

Verifique as somas dos arquivos baixados:

```bash
sha256sum -c CHECKSUMS
```

Confirme que os quatro pacotes `.deb` aparecem como `SUCESSO`. O arquivo `CHECKSUMS` também pode conter linhas que não são entradas de soma reconhecidas pelo comando.

Instale os pacotes:

```bash
sudo dpkg -i \
  linux-headers-6.5.11-060511_6.5.11-060511.202311151304_all.deb \
  linux-headers-6.5.11-060511-generic_6.5.11-060511.202311151304_amd64.deb \
  linux-modules-6.5.11-060511-generic_6.5.11-060511.202311151304_amd64.deb \
  linux-image-unsigned-6.5.11-060511-generic_6.5.11-060511.202311151304_amd64.deb
```

Confira novamente as imagens:

```bash
ls -1 /boot/vmlinuz-*
```

> A imagem instalada é identificada como `unsigned`. A inicialização pode depender da configuração de Secure Boot do ambiente.

### 4. Configurar o GRUB

O GRUB permite escolher o kernel durante a inicialização.

Edite o arquivo:

```bash
sudo nano /etc/default/grub
```

Configure a exibição do menu:

```text
GRUB_TIMEOUT_STYLE=menu
GRUB_TIMEOUT=10
```

Atualize a configuração:

```bash
sudo update-grub
```

Reinicie:

```bash
sudo reboot
```

No menu do GRUB, acesse **Opções avançadas para Ubuntu** e selecione o kernel desejado.

Após iniciar, confirme a versão:

```bash
uname -r
```

### 5. Configurar as Guest Additions, se necessário

No ambiente utilizado, foi necessário reinstalar as VirtualBox Guest Additions com o kernel `6.5.11` em execução para restaurar a interface gráfica.

Na configuração de vídeo da VM, utilize o controlador **VMSVGA**. Depois, no menu do VirtualBox, selecione:

```text
Dispositivos → Inserir imagem de CD dos Adicionais para Convidado
```

Com o kernel `6.5.11` iniciado, execute:

```bash
sudo mkdir -p /mnt/vboxadditions
sudo mount /dev/sr0 /mnt/vboxadditions
sudo sh /mnt/vboxadditions/VBoxLinuxAdditions.run
sudo reboot
```

O dispositivo de CD pode ter outro nome em ambientes diferentes.

---

## Instalação da aplicação

### 1. Instalar Node.js com NVM

Instale o NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash
```

Carregue a configuração no terminal:

```bash
source ~/.bashrc
```

Instale e selecione o Node.js 24:

```bash
nvm install 24
nvm alias default 24
```

Confira as versões:

```bash
node --version
npm --version
```

### 2. Instalar dependências da API

```bash
cd ~/lab/app/api
npm ci
```

### 3. Instalar dependências do frontend

```bash
cd ~/lab/app/web
npm ci
```

Cada aplicação possui seu próprio `package.json` e `package-lock.json`. As pastas `node_modules/` são geradas localmente e não precisam ser versionadas.

### 4. Iniciar a API

Em um terminal:

```bash
cd ~/lab/app/api
npm run dev
```

Endereço padrão:

```text
http://localhost:3000
```

### 5. Iniciar o frontend

Em outro terminal:

```bash
cd ~/lab/app/web
npm run dev
```

Acesse no navegador o endereço informado pelo Vite, normalmente:

```text
http://localhost:5173
```

A aplicação abre na apresentação e permite navegar para a dashboard pelo cabeçalho.

---

## Execução dos experimentos

Antes da primeira execução, conceda permissão aos scripts:

```bash
cd ~/lab
chmod +x scripts/exp1.sh scripts/exp2.sh scripts/exp3.sh
```

A duração padrão é de **10 segundos**. Também é possível informar uma duração entre **5 e 20 segundos** como argumento.

### Experimento 1 — Mesma prioridade

```bash
./scripts/exp1.sh 10
```

| Processo | Carga | Nice padrão |
| --- | --- | --- |
| A | CPU-bound | `0` |
| B | CPU-bound | `0` |

Com pesos iguais e condições equivalentes, espera-se uma divisão aproximadamente equilibrada da CPU entre A e B.

### Experimento 2 — Prioridades diferentes

```bash
./scripts/exp2.sh 10
```

| Processo | Carga | Nice padrão |
| --- | --- | --- |
| A | CPU-bound | `0` |
| B | CPU-bound | `+10` |

No modelo ideal, quando ambos permanecem prontos e disputam a mesma CPU, os pesos associados a esses valores indicam uma parcela maior para A.

### Experimento 3 — Cargas diferentes

```bash
./scripts/exp3.sh 10
```

| Processo | Carga | Nice padrão |
| --- | --- | --- |
| A | CPU-bound | `0` |
| B | CPU-bound | `0` |
| C | I/O-bound simulado | `0` |

O processo C alterna períodos de trabalho e pausa, enquanto A e B executam a carga CPU-bound.

### Personalizar valores de nice

Na versão dos scripts que aceita variáveis de ambiente, é possível alterar o nice para uma execução:

```bash
NICE_A=0 NICE_B=10 ./scripts/exp2.sh 10
```

No experimento 3:

```bash
NICE_A=0 NICE_B=5 NICE_C=10 ./scripts/exp3.sh 10
```

Os valores permitidos vão de `-20` a `+19`. Valores negativos normalmente exigem permissões adicionais.

A alteração dos valores pode mudar o cenário original: por exemplo, valores diferentes para A e B fazem o experimento 1 deixar de representar uma comparação de prioridades iguais.

---

## Resultados

Cada execução é armazenada em uma pasta identificada por data e hora:

```text
resultados/
├── cfs/
│   └── exp1/
│       └── <id-da-execucao>/
│           ├── afinidade.txt
│           ├── amostras.csv
│           ├── metadados.txt
│           ├── pidstat.txt
│           ├── processo_A.log
│           ├── processo_B.log
│           ├── resumo.csv
│           └── status.json
└── eevdf/
    └── exp1/
        └── <id-da-execucao>/
```

No experimento 3, também é gerado `processo_C.log`.

### Arquivos

| Arquivo | Finalidade |
| --- | --- |
| `status.json` | Estado da execução, identificação, kernel e horários. |
| `metadados.txt` | Informações sobre o cenário, kernel, duração, processos e configuração. |
| `afinidade.txt` | Afinidade consultada para os processos. |
| `pidstat.txt` | Relatório coletado pelo `pidstat`. |
| `amostras.csv` | Amostras de CPU e espera por processo. |
| `resumo.csv` | Médias consolidadas por processo. |
| `processo_*.log` | Saída dos programas executados. |

### Métricas

| Métrica | Significado |
| --- | --- |
| `%CPU` | Uso de CPU atribuído à tarefa durante o intervalo observado. |
| `%wait` | Tempo associado à espera da tarefa para executar na CPU. |

O `%wait` não representa o tempo em que o processo permanece em `nanosleep()`. Os scripts também não coletam diretamente o `vruntime`, o `lag` ou o prazo virtual interno do escalonador.

Para a duração padrão de 10 segundos, os scripts solicitam 8 amostras com intervalo de 1 segundo. A média do `pidstat` corresponde ao período monitorado, não necessariamente à duração completa do programa.

---

## API

A API lê os arquivos de `resultados/` e disponibiliza os dados em JSON.

### Endpoints

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| `GET` | `/api/health` | Consulta o estado da API. |
| `GET` | `/api/execucoes` | Lista as execuções disponíveis. |
| `GET` | `/api/execucoes/:escalonador/:experimento/:id` | Consulta os detalhes de uma execução. |

Exemplos:

```text
http://localhost:3000/api/health
```

```text
http://localhost:3000/api/execucoes
```

```text
http://localhost:3000/api/execucoes/cfs/exp1/<id-da-execucao>
```

Substitua `<id-da-execucao>` pelo nome de uma pasta existente em `resultados/`.

---

## Comunicação em tempo real

O Chokidar monitora os arquivos `status.json`. Quando uma alteração é detectada, a API emite o evento `resultados:alterados` pelo Socket.IO.

```text
Script altera status.json
          │
          ▼
Chokidar detecta a alteração
          │
          ▼
Socket.IO emite uma notificação
          │
          ▼
A aplicação consulta os dados atualizados pela API
```

A notificação informa que houve uma alteração; os dados de resumo e amostras continuam disponíveis pelas rotas HTTP da API.

---

## Aplicação web

A aplicação possui duas áreas principais:

| Área | Conteúdo |
| --- | --- |
| **Apresentação** | Conceitos, diagramas e simulações sobre sistemas operacionais e escalonamento. |
| **Dashboard** | Execuções, métricas e gráficos dos resultados disponíveis. |

### Execução completa

Utilize três terminais:

**Terminal 1 — API**

```bash
cd ~/lab/app/api
npm run dev
```

**Terminal 2 — frontend**

```bash
cd ~/lab/app/web
npm run dev
```

**Terminal 3 — experimento**

```bash
cd ~/lab
./scripts/exp1.sh 10
```

Após iniciar os serviços, acesse o endereço informado pelo Vite e abra a dashboard.

### Build do frontend

Para verificar a geração da versão de produção:

```bash
cd ~/lab/app/web
npm run build
```

---

## Metodologia e limitações

Para comparar execuções, mantenha equivalentes:

- experimento e duração;
- programas e quantidade de processos;
- valores de `nice`;
- afinidade de CPU;
- configuração da máquina virtual;
- condições gerais do ambiente.

Repita os testes e preserve os resultados individuais para observar variações entre execuções.

Os resultados descrevem o comportamento **observado neste laboratório**. Outras tarefas da VM, o computador hospedeiro e as diferenças entre as versões dos kernels podem influenciar as medições. A afinidade com a vCPU 0 não garante uso exclusivo dessa vCPU.