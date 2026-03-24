# ADR-003 — HPA para Escalabilidade Horizontal

| Campo        | Valor                                 |
| ------------ | ------------------------------------- |
| **Status**   | Aceito                                |
| **Data**     | 2024                                  |
| **Contexto** | Escalabilidade dos pods NestJS no EKS |

## Contexto

A API AutoFlow pode ter variação de carga durante o dia (horário de pico na oficina
vs. fim de expediente). Os pods NestJS são stateless (JWT stateless, sem sessão
server-side), o que torna a escalabilidade horizontal natural.

Requisitos:

- Escalar automaticamente baseado em uso de CPU/memória
- Reduzir custo fora do horário de pico (scale down)
- Manter disponibilidade durante picos (scale out)

## Opções Consideradas

### HPA (Horizontal Pod Autoscaler)

**Prós:**

- Nativo no Kubernetes — sem instalação adicional
- Suportado pelo EKS sem configuração extra
- Baseado em métricas padrão (CPU, memória) ou customizadas (com metrics-server)
- Idempotente — Kubernetes gerencia o ciclo de vida dos pods

**Contras:**

- Scale out tem latência (~1-2 min para novos pods ficarem prontos)
- Requer `metrics-server` instalado no cluster (incluído no EKS por padrão)
- Não escala para zero (mínimo 1 pod)

### VPA (Vertical Pod Autoscaler)

**Prós:**

- Ajusta requests/limits automaticamente

**Contras:**

- Requer restart dos pods para aplicar mudanças
- Não aumenta número de instâncias — não resolve picos de tráfego horizontal
- Menos estável que HPA

### KEDA (Kubernetes Event-driven Autoscaling)

**Prós:**

- Escala baseado em eventos (filas SQS, métricas customizadas)
- Pode escalar para zero

**Contras:**

- Instalação adicional (CRDs + operator)
- Mais complexo para o caso de uso simples (CPU-based)
- Overkill para a fase atual do projeto

### Sem autoscaling (réplicas fixas)

**Contras:**

- Desperdício de recursos em horário ocioso
- Sem resiliência a picos de carga

## Decisão

**HPA com base em CPU** foi adotado para os pods NestJS no namespace `autoflow`.

## Configuração

```yaml
# HorizontalPodAutoscaler
minReplicas: 1
maxReplicas: 5
targetCPUUtilizationPercentage: 70

# Deployment resource requests
resources:
  requests:
    cpu: '250m'
    memory: '256Mi'
  limits:
    cpu: '500m'
    memory: '512Mi'
```

## Consequências

### Positivas

- Scale out automático quando CPU > 70% — sem intervenção manual
- Scale in automático em períodos ociosos (economia de custo no Lab)
- Pods stateless + JWT → nenhum estado precisa ser migrado entre réplicas
- `maxReplicas: 5` protege o RDS de sobrecarga de conexões

### Negativas / Mitigações

- **Conexões ao RDS**: cada pod mantém pool de conexões TypeORM. Com 5 pods × pool_size conexões, atingir o limite do RDS `db.t3.micro` (85 conexões) é possível. Mitigação: `pool_size` configurado conservadoramente no TypeORM
- **Scale out lento**: novos pods levam ~30-60s para iniciar o NestJS. Mitigação: `readinessProbe` garante que o pod só recebe tráfego quando pronto
- **Scale to zero não suportado**: mínimo 1 pod sempre ativo. Aceitável para sistema de produção (disponibilidade contínua)
