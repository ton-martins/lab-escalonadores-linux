# Laboratório de Escalonamento Linux: CFS e EEVDF

Este projeto implementa um laboratório para observar e comparar o comportamento dos escalonadores CFS e EEVDF do Linux.

Os experimentos executam processos concorrentes em uma única vCPU, coletam métricas com `pidstat` e armazenam os resultados em arquivos CSV e JSON. Uma aplicação Vue exibe os dados, gráficos e atualizações em tempo real.

## Objetivos

- Comparar execuções sob CFS e EEVDF.
- Observar a divisão de CPU entre processos CPU-bound.
- Demonstrar o efeito do valor `nice` na prioridade de processos.
- Simular um processo I/O-bound por meio de períodos de trabalho e pausa.
- Visualizar resultados por meio de uma dashboard com Vue, Express, Socket.IO e Chart.js.

## Tecnologias

### Sistema operacional e experimentos

- Ubuntu 24.04.5 LTS
- Kernel Linux 6.5.11 para experimentos com CFS
- Kernel Linux 7.0.0-43 para experimentos com EEVDF
- C
- GCC
- Bash
- `taskset`
- `pidstat`
- `awk`

### Dashboard

- Node.js
- Express
- Socket.IO
- Chokidar
- Vue 3
- Vue Router
- Vite
- Tailwind CSS
- Chart.js
- Lucide Icons

## Estrutura do projeto

```text
lab/
├── app/
│   ├── api/
│   │   ├── config/
│   │   │   └── ambiente.js
│   │   ├── controllers/
│   │   │   ├── execucoes.controller.js
│   │   │   └── health.controller.js
│   │   ├── middleware/
│   │   │   └── tratamento-erros.js
│   │   ├── observers/
│   │   │   └── resultados.observer.js
│   │   ├── realtime/
│   │   │   └── socket.gateway.js
│   │   ├── routes/
│   │   │   └── api.routes.js
│   │   ├── services/
│   │   │   └── resultados.service.js
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── package.json
│   │   └── package-lock.json
│   │
│   └── web/
│       ├── src/
│       │   ├── composables/
│       │   │   └── useExecucoes.js
│       │   ├── config/
│       │   │   └── ambiente.js
│       │   ├── pages/
│       │   │   ├── Apresentacao.vue
│       │   │   └── Dashboard.vue
│       │   ├── router/
│       │   │   └── index.js
│       │   ├── services/
│       │   │   ├── api.service.js
│       │   │   └── socket.service.js
│       │   ├── App.vue
│       │   ├── main.js
│       │   └── style.css
│       ├── .gitignore
│       ├── index.html
│       ├── package.json
│       ├── package-lock.json
│       └── vite.config.js
│
├── bin/
│   ├── cpu_bound_worker
│   └── io_bound_simulator
│
├── resultados/
│   ├── cfs/
│   └── eevdf/
│
├── scripts/
│   ├── exp1.sh
│   ├── exp2.sh
│   └── exp3.sh
│
├── src/
│   ├── cpu_bound_worker.c
│   └── io_bound_simulator.c
│
└── README.md
```

As pastas `node_modules/` não aparecem na estrutura porque são geradas automaticamente pelo `npm`.

## Pré-requisitos

O laboratório foi desenvolvido para Ubuntu 24.04 LTS em arquitetura x86_64.

Configuração recomendada da máquina virtual:

```text
Memória RAM: 8 GB
vCPUs: 4
Disco: 35 GB ou mais
Controlador gráfico: VMSVGA
Memória de vídeo: 128 MB
```

Os processos dos experimentos são fixados na vCPU `0`. As demais vCPUs permitem executar a dashboard, navegador, editor e serviços do sistema com menor interferência na coleta.

Instale as dependências do sistema:

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

Verifique as ferramentas:

```bash
gcc --version
pidstat -V
taskset --version
git --version
curl --version
```

## Kernels utilizados

O laboratório utiliza dois kernels para comparar escalonadores.

| Kernel | Escalonador estudado |
| --- | --- |
| Linux 6.5.11 | CFS |
| Linux 7.0.0-43 | EEVDF |

O EEVDF substituiu o CFS no Linux a partir da versão 6.6. Por isso, o kernel 6.5.11 é utilizado para representar o comportamento do CFS, enquanto o kernel 7.0.0-43 representa o EEVDF.

### Verificar o kernel em execução

```bash
uname -r
```

Exemplo para CFS:

```text
6.5.11-060511-generic
```

Exemplo para EEVDF:

```text
7.0.0-43-generic
```

## Instalação do kernel 6.5.11 para CFS

Crie um diretório para os pacotes:

```bash
mkdir -p ~/kernels/cfs-6.5.11
cd ~/kernels/cfs-6.5.11
```

Defina a origem dos arquivos:

```bash
BASE="https://kernel.ubuntu.com/mainline/v6.5.11/amd64"
```

Baixe os pacotes e as somas de verificação:

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

Verifique a integridade dos arquivos:

```bash
sha256sum -c CHECKSUMS
```

Instale o kernel:

```bash
sudo dpkg -i \
  linux-headers-6.5.11-060511_6.5.11-060511.202311151304_all.deb \
  linux-headers-6.5.11-060511-generic_6.5.11-060511.202311151304_amd64.deb \
  linux-modules-6.5.11-060511-generic_6.5.11-060511.202311151304_amd64.deb \
  linux-image-unsigned-6.5.11-060511-generic_6.5.11-060511.202311151304_amd64.deb
```

Confirme os kernels instalados:

```bash
ls -1 /boot/vmlinuz-*
```

## Configuração do GRUB

Edite a configuração do GRUB:

```bash
sudo nano /etc/default/grub
```

Defina estas opções:

```text
GRUB_TIMEOUT_STYLE=menu
GRUB_TIMEOUT=10
```

Atualize a configuração:

```bash
sudo update-grub
```

Reinicie a máquina:

```bash
sudo reboot
```

No menu do GRUB, selecione o kernel desejado antes de iniciar o Ubuntu.

```text
Linux 6.5.11  → CFS
Linux 7.0.0-43 → EEVDF
```

## Observação sobre VirtualBox Guest Additions

Em algumas instalações do VirtualBox, o kernel 6.5.11 pode iniciar em modo texto ou apresentar tela preta após o login gráfico.

Use o controlador gráfico `VMSVGA` na configuração da máquina virtual. Depois, com o kernel 6.5.11 em execução, reinsira e instale as Guest Additions.

No VirtualBox:

```text
Dispositivos → Inserir imagem de CD dos Adicionais para Convidado
```

No terminal da máquina virtual:

```bash
sudo mkdir -p /mnt/vboxadditions

sudo mount /dev/sr0 /mnt/vboxadditions

sudo sh /mnt/vboxadditions/VBoxLinuxAdditions.run

sudo reboot
```

Após reiniciar, confirme o kernel:

```bash
uname -r
```

## Instalação do Node.js

O frontend e a API utilizam Node.js 24.

Instale o NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash
```

Recarregue o terminal:

```bash
source ~/.bashrc
```

Instale e selecione o Node.js 24:

```bash
nvm install 24
nvm alias default 24
```

Verifique a instalação:

```bash
node --version
npm --version
```

## Instalação das dependências da aplicação

Na API:

```bash
cd ~/lab/app/api
npm ci
```

No frontend:

```bash
cd ~/lab/app/web
npm ci
```

Para validar vulnerabilidades de dependências usadas em produção:

```bash
cd ~/lab/app/api
npm audit --omit=dev
```

## Programas em C

### `cpu_bound_worker.c`

Representa um processo CPU-bound.

O programa executa cálculos continuamente durante um período definido, mantendo demanda constante de CPU. Ele é usado nos três experimentos.

Uso direto:

```bash
./bin/cpu_bound_worker A 10
```

Parâmetros:

```text
A  → nome lógico do processo
10 → duração em segundos
```

### `io_bound_simulator.c`

Representa um processo I/O-bound simulado.

O programa alterna períodos de trabalho de CPU e pausa:

```text
Período total:      100 ms
Trabalho por ciclo:  10 ms
Pausa por ciclo:     90 ms
```

A pausa com `nanosleep()` simula o comportamento de um processo que frequentemente aguarda I/O, rede ou outro recurso externo.

Uso direto:

```bash
./bin/io_bound_simulator C 10
```

## Experimentos

Os scripts compilam os programas, criam uma execução identificada por data e hora, iniciam os processos na vCPU `0`, coletam métricas com `pidstat` e salvam os resultados.

Antes da primeira execução, torne os scripts executáveis:

```bash
chmod +x ~/lab/scripts/*.sh
```

### Experimento 1: divisão equilibrada

Dois processos CPU-bound com a mesma prioridade.

```bash
cd ~/lab
./scripts/exp1.sh 10
```

Configuração:

```text
Processo A: CPU-bound, nice 0
Processo B: CPU-bound, nice 0
vCPU: 0
```

Resultado esperado:

```text
A e B dividem aproximadamente 50% da vCPU cada.
```

### Experimento 2: prioridades distintas

Dois processos CPU-bound com prioridades diferentes.

```bash
cd ~/lab
./scripts/exp2.sh 10
```

Configuração:

```text
Processo A: CPU-bound, nice 0
Processo B: CPU-bound, nice 10
vCPU: 0
```

Resultado esperado:

```text
A recebe uma parcela maior de CPU.
B continua executando, porém recebe menos tempo de CPU.
```

### Experimento 3: responsividade

Dois processos CPU-bound e um processo I/O-bound simulado.

```bash
cd ~/lab
./scripts/exp3.sh 10
```

Configuração:

```text
Processo A: CPU-bound, nice 0
Processo B: CPU-bound, nice 0
Processo C: I/O-bound simulado, nice 0
vCPU: 0
```

Resultado esperado:

```text
A e B dividem a maior parte da CPU disponível.
C utiliza menos CPU, pois alterna períodos de trabalho e pausa.
```

## Organização dos resultados

Cada execução cria uma pasta identificada por data e hora:

```text
resultados/
└── cfs/
    └── exp1/
        └── 20261120_231245/
            ├── afinidade.txt
            ├── amostras.csv
            ├── metadados.txt
            ├── pidstat.txt
            ├── processo_A.log
            ├── processo_B.log
            ├── resumo.csv
            └── status.json
```

Os resultados do EEVDF seguem a mesma estrutura:

```text
resultados/eevdf/exp1/<id_execucao>/
```

### Arquivos gerados

| Arquivo | Finalidade |
| --- | --- |
| `status.json` | Estado da execução, identificador, kernel e horários. |
| `metadados.txt` | Informações do cenário, kernel, compilador e duração. |
| `afinidade.txt` | Confirmação da afinidade dos processos com a vCPU `0`. |
| `pidstat.txt` | Saída completa e detalhada do `pidstat`. |
| `amostras.csv` | Amostras individuais de CPU e espera por processo. |
| `resumo.csv` | Médias finais consolidadas por processo. |
| `processo_A.log` | Saída do processo A. |
| `processo_B.log` | Saída do processo B. |
| `processo_C.log` | Saída do processo C, presente apenas no experimento 3. |

## API

A API Express lê os arquivos da pasta `resultados/` e os disponibiliza para o frontend.

Inicie a API:

```bash
cd ~/lab/app/api
npm run dev
```

A API será iniciada em:

```text
http://localhost:3000
```

### Endpoints

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| `GET` | `/api/health` | Confirma que a API está ativa. |
| `GET` | `/api/execucoes` | Lista todas as execuções disponíveis. |
| `GET` | `/api/execucoes/:escalonador/:experimento/:id` | Retorna detalhes, resumo e amostras de uma execução. |

Exemplos:

```text
http://localhost:3000/api/health
```

```text
http://localhost:3000/api/execucoes
```

```text
http://localhost:3000/api/execucoes/cfs/exp1/20261120_231245
```

## Comunicação em tempo real

A API monitora alterações em arquivos `status.json` usando Chokidar.

```text
status.json é criado ou alterado
        ↓
Chokidar detecta a alteração
        ↓
Socket.IO emite "resultados:alterados"
        ↓
Dashboard consulta novamente a API
        ↓
Dados e gráficos são atualizados
```

O Socket.IO não transmite todos os resultados. Ele apenas notifica que houve alteração. A dashboard então usa HTTP para consultar os dados atuais.

## Frontend

Inicie o frontend Vue em outro terminal:

```bash
cd ~/lab/app/web
npm run dev
```

O Vite exibirá um endereço semelhante a:

```text
http://localhost:5173
```

Acesse esse endereço no navegador.

A dashboard apresenta:

- quantidade total de execuções;
- quantidade de execuções CFS e EEVDF;
- filtros por escalonador e experimento;
- lista de execuções disponíveis;
- detalhes da execução selecionada;
- distribuição de CPU e espera por processo;
- gráficos de CPU por processo;
- gráficos de espera por processo;
- atualização automática via Socket.IO.

## Execução completa

Use três terminais.

### Terminal 1: API

```bash
cd ~/lab/app/api
npm run dev
```

### Terminal 2: frontend

```bash
cd ~/lab/app/web
npm run dev
```

### Terminal 3: experimentos

```bash
cd ~/lab
./scripts/exp1.sh 10
```

Após a conclusão da execução, a API detectará a alteração em `status.json` e a dashboard será atualizada automaticamente.

## Validação da aplicação

Para gerar a versão de produção do frontend:

```bash
cd ~/lab/app/web
npm run build
```

Para encerrar a API iniciada pelo Nodemon:

```text
Ctrl + C
```

A API encerra corretamente:

```text
1. Fecha o observador Chokidar;
2. Fecha as conexões Socket.IO;
3. Fecha o servidor HTTP;
4. Finaliza o processo.
```