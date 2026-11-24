#!/usr/bin/env bash

set -euo pipefail
export LC_ALL=C

# ======================================================================
# Exp1: dois processos CPU-bound, mesma prioridade, mesma vCPU.
# ======================================================================

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJETO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

FONTE="$PROJETO_DIR/src/cpu_bound_worker.c"
BINARIO="$PROJETO_DIR/bin/cpu_bound_worker"

DURACAO="${1:-10}"
CENARIO="exp1"
VCPU=0
NICE_A=0
NICE_B=0

KERNEL="$(uname -r)"

case "$KERNEL" in
    "6.5.11-060511-generic") ESCALONADOR="cfs" ;;
    "7.0.0-43-generic") ESCALONADOR="eevdf" ;;
    *)
        echo "Erro: kernel não reconhecido: $KERNEL"
        exit 1
        ;;
esac

EXECUCAO_ID="$(date +%Y%m%d_%H%M%S)"
RESULTADO_DIR="$PROJETO_DIR/resultados/$ESCALONADOR/$CENARIO/$EXECUCAO_ID"

if ! [[ "$DURACAO" =~ ^[0-9]+$ ]]; then
    echo "Erro: a duração deve conter apenas números."
    exit 1
fi

if (( DURACAO < 5 || DURACAO > 20 )); then
    echo "Erro: a duração deve estar entre 5 e 20 segundos."
    exit 1
fi

if [[ ! -f "$FONTE" ]]; then
    echo "Erro: arquivo-fonte não encontrado: $FONTE"
    exit 1
fi

for comando in gcc taskset pidstat awk; do
    if ! command -v "$comando" > /dev/null 2>&1; then
        echo "Erro: comando não encontrado: $comando"
        exit 1
    fi
done

AMOSTRAS=$(( DURACAO - 2 ))

mkdir -p "$PROJETO_DIR/bin" "$RESULTADO_DIR"

# ----------------------------------------------------------------------
# Status da execução para a dashboard
# ----------------------------------------------------------------------

INICIO="$(date --iso-8601=seconds)"
STATUS_ARQUIVO="$RESULTADO_DIR/status.json"

registrar_status() {
    local status="$1"
    local atualizado
    local temporario="$STATUS_ARQUIVO.$$"

    atualizado="$(date --iso-8601=seconds)"

    cat > "$temporario" <<EOF
{
  "status": "$status",
  "execucao_id": "$EXECUCAO_ID",
  "experimento": "$CENARIO",
  "escalonador": "$ESCALONADOR",
  "kernel": "$KERNEL",
  "iniciado_em": "$INICIO",
  "atualizado_em": "$atualizado"
}
EOF

    mv "$temporario" "$STATUS_ARQUIVO"
}

encerrar_processos() {
    local pid

    for pid in "${PID_A:-}" "${PID_B:-}" "${PID_C:-}"; do
        if [[ -n "$pid" ]] && kill -0 "$pid" 2> /dev/null; then
            kill "$pid" 2> /dev/null || true
        fi
    done
}

marcar_falha() {
    local codigo="$1"

    trap - ERR INT TERM
    encerrar_processos
    registrar_status "falhou"
    exit "$codigo"
}

marcar_interrompida() {
    local codigo="$1"

    trap - ERR INT TERM
    encerrar_processos
    registrar_status "interrompida"
    exit "$codigo"
}

registrar_status "executando"

trap 'marcar_falha $?' ERR
trap 'marcar_interrompida 130' INT
trap 'marcar_interrompida 143' TERM

# ----------------------------------------------------------------------
# Compilação
# ----------------------------------------------------------------------

echo "=== Exp1: dois processos CPU-bound com mesma prioridade ==="
echo "Escalonador detectado: $ESCALONADOR"
echo "Kernel em execução: $KERNEL"
echo "Duração: $DURACAO segundos"
echo

echo "[1/3] Compilando cpu_bound_worker..."

gcc -Wall -Wextra -Wpedantic -O3 \
    "$FONTE" \
    -o "$BINARIO"

# ----------------------------------------------------------------------
# Metadados
# ----------------------------------------------------------------------

VCPUS="$(nproc)"

{
    echo "execucao_id=$EXECUCAO_ID"
    echo "experimento=$CENARIO"
    echo "escalonador=$ESCALONADOR"
    echo "inicio=$INICIO"
    echo "kernel=$KERNEL"
    echo "duracao_segundos=$DURACAO"
    echo "vcpu_alvo=$VCPU"
    echo "processo_a=cpu_bound"
    echo "processo_b=cpu_bound"
    echo "nice_a=$NICE_A"
    echo "nice_b=$NICE_B"
    echo "vcpus_disponiveis=$VCPUS"
} > "$RESULTADO_DIR/metadados.txt"

# ----------------------------------------------------------------------
# Execução concorrente
# ----------------------------------------------------------------------

echo "[2/3] Iniciando processos A e B na vCPU $VCPU..."

taskset -c "$VCPU" "$BINARIO" A "$DURACAO" \
    > "$RESULTADO_DIR/processo_A.log" 2>&1 &
PID_A=$!

taskset -c "$VCPU" "$BINARIO" B "$DURACAO" \
    > "$RESULTADO_DIR/processo_B.log" 2>&1 &
PID_B=$!

{
    echo "pid_a=$PID_A"
    echo "pid_b=$PID_B"
} >> "$RESULTADO_DIR/metadados.txt"

echo "Processo A: PID $PID_A"
echo "Processo B: PID $PID_B"

sleep 0.2

{
    taskset -pc "$PID_A"
    taskset -pc "$PID_B"
} > "$RESULTADO_DIR/afinidade.txt"

# ----------------------------------------------------------------------
# Monitoramento
# ----------------------------------------------------------------------

echo "[3/3] Coletando $AMOSTRAS amostras com pidstat..."

pidstat -u -p "$PID_A,$PID_B" 1 "$AMOSTRAS" \
    > "$RESULTADO_DIR/pidstat.txt"

wait "$PID_A"
wait "$PID_B"

FIM="$(date --iso-8601=seconds)"
echo "fim=$FIM" >> "$RESULTADO_DIR/metadados.txt"

obter_media() {
    local pid="$1"

    awk -v pid="$pid" '
        $1 == "Average:" && $3 == pid {
            print $8, $7
            exit
        }
    ' "$RESULTADO_DIR/pidstat.txt"
}

MEDIA_A="$(obter_media "$PID_A")"
MEDIA_B="$(obter_media "$PID_B")"

if [[ -z "$MEDIA_A" || -z "$MEDIA_B" ]]; then
    echo "Erro: não foi possível extrair as médias do pidstat."
    exit 1
fi

read -r CPU_A ESPERA_A <<< "$MEDIA_A"
read -r CPU_B ESPERA_B <<< "$MEDIA_B"

# ----------------------------------------------------------------------
# Arquivos para a dashboard
# ----------------------------------------------------------------------

{
    echo "escalonador,experimento,kernel,inicio,fim,duracao_segundos,vcpu,processo,pid,tipo_carga,nice,cpu_media,espera_media"

    printf "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%.2f,%.2f\n" \
        "$ESCALONADOR" "$CENARIO" "$KERNEL" "$INICIO" "$FIM" \
        "$DURACAO" "$VCPU" "A" "$PID_A" "cpu_bound" "$NICE_A" \
        "$CPU_A" "$ESPERA_A"

    printf "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%.2f,%.2f\n" \
        "$ESCALONADOR" "$CENARIO" "$KERNEL" "$INICIO" "$FIM" \
        "$DURACAO" "$VCPU" "B" "$PID_B" "cpu_bound" "$NICE_B" \
        "$CPU_B" "$ESPERA_B"
} > "$RESULTADO_DIR/resumo.csv"

{
    echo "escalonador,experimento,horario,processo,pid,cpu_percentual,espera_percentual,vcpu"

    awk \
        -v escalonador="$ESCALONADOR" \
        -v experimento="$CENARIO" \
        -v pid_a="$PID_A" \
        -v pid_b="$PID_B" '
        $1 != "Average:" && ($3 == pid_a || $3 == pid_b) {
            processo = ($3 == pid_a ? "A" : "B")

            printf "%s,%s,%s,%s,%s,%.2f,%.2f,%s\n",
                escalonador, experimento, $1, processo,
                $3, $8, $7, $9
        }
    ' "$RESULTADO_DIR/pidstat.txt"
} > "$RESULTADO_DIR/amostras.csv"

registrar_status "concluida"
trap - ERR INT TERM

echo
echo "=== Resumo ==="
printf "%-10s %-10s %-14s %-16s\n" \
    "Processo" "PID" "CPU média" "Espera média"

printf "%-10s %-10s %10.2f%% %13.2f%%\n" \
    "A" "$PID_A" "$CPU_A" "$ESPERA_A"

printf "%-10s %-10s %10.2f%% %13.2f%%\n" \
    "B" "$PID_B" "$CPU_B" "$ESPERA_B"

echo
echo "Concluído."
echo "Resultados: $RESULTADO_DIR"
