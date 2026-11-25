#define _POSIX_C_SOURCE 200809L // Habilita as interfaces do padrão POSIX.1-2008 nos cabeçalhos.

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <stdint.h>
#include <unistd.h>
#include <errno.h>

#define PERIODO_MS 100L
#define TRABALHO_MS 10L
#define PAUSA_MS (PERIODO_MS - TRABALHO_MS)

int capturar_tempo(struct timespec *momento)
{
  if (clock_gettime(CLOCK_MONOTONIC, momento) != 0) {
    perror("Erro ao capturar instante nanométrico do sistema.");
    return 1;
  }
  
  return 0;
}

int main(int argc, char *argv[])
{
  if (argc != 3) {
    printf("\nChamada inválida!");
    printf("\nExemplo de uso: %s <nome_processo> <tempo_duracao>", argv[0]);
    printf("\nO tempo de duração deve ser 5 a 20 segundos.\n\n");
    return 1;
  }
  
  const char *nome_processo = argv[1];
  char *ponteiro;
  
  errno = 0;
  long tempo_duracao = strtol(argv[2], &ponteiro, 10);
  
  if (
    ponteiro == argv[2] ||
    *ponteiro != '\0' ||
    errno != 0 ||
    tempo_duracao < 5 ||
    tempo_duracao > 20
  ) {
    printf("Tempo de duração inválido! Digite um tempo entre 5 e 20 segundos.\n");
    return 1;
  }
  
  printf("\n\n=== Processo periódico iniciado ===\n");
  printf("Nome do Processo: %s\n", nome_processo);
  printf("PID do Processo: %d\n", getpid());
  printf("Duração Alvo: %ld segundos.\n", tempo_duracao);
  printf("Período do Ciclo: %ld milissegundos.\n", PERIODO_MS);
  printf("Trabalho por Ciclo: %ld milissegundos.\n", TRABALHO_MS);
  printf("Pausa por Ciclo: %ld milissegundos.\n", PAUSA_MS);
  fflush(stdout);
  
  struct timespec agora, inicio, inicio_ciclo;
  struct timespec pausa = {
    .tv_sec = 0,
    .tv_nsec = PAUSA_MS * 1000000L
  };
  volatile uint64_t trabalho = 0;
  uint64_t iteracoes = 0;
  uint64_t ciclos = 0;
  double tempo_decorrido = 0.0;
  
  if (capturar_tempo(&inicio) != 0) {
      return 1;
  }
  
  while (tempo_decorrido < (double) tempo_duracao) {
    if (capturar_tempo(&inicio_ciclo) != 0) {
        return 1;
    }
    double tempo_trabalho = 0.0;
    
    while(tempo_trabalho < (double) TRABALHO_MS / 1000.0) {
      trabalho += (trabalho*3) + 1;
      iteracoes++;
      
      if ((iteracoes & 0xFFFF) == 0) {
        if (capturar_tempo(&agora) != 0) {
            return 1;
        }
        tempo_trabalho = (agora.tv_sec - inicio_ciclo.tv_sec) + 
                        (agora.tv_nsec - inicio_ciclo.tv_nsec) / 1000000000.0;
      }
    }
    
    ciclos++;
    
    if (nanosleep(&pausa, NULL) != 0) {
      perror("Erro em nanosleep");
      return 1;
    }
    
    if (capturar_tempo(&agora) != 0) {
        return 1;
    }
    
    tempo_decorrido = (agora.tv_sec - inicio.tv_sec) +
                      (agora.tv_nsec - inicio.tv_nsec) / 1000000000.0;
  }
  
  printf("=== Processo periódico finalizado ===\n");
  printf("Tempo real decorrido: %.4f segundos\n", tempo_decorrido);
  printf("Ciclos realizados: %llu\n", (unsigned long long) ciclos);
  printf("Total de iterações: %llu\n", (unsigned long long) iteracoes);
  
  return 0;
}
