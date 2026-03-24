# Documentação Arquitetural — AutoFlow

Documentação arquitetural do sistema AutoFlow, cobrindo visão de componentes,
fluxos de sequência, decisões técnicas e modelo de dados.

## Índice

### Visão de Componentes
- [Diagrama de Componentes](components.md) — cloud, APIs, banco, monitoramento

### Diagramas de Sequência
- [Autenticação](sequences/auth-flow.md) — fluxo CPF → JWT via Lambda
- [Abertura de Ordem de Serviço](sequences/service-order-flow.md) — ciclo completo de OS

### RFCs — Request for Comments
| # | Título | Status |
|---|--------|--------|
| [RFC-001](rfcs/RFC-001-cloud-provider.md) | Escolha do provedor de nuvem (AWS) | Aceito |
| [RFC-002](rfcs/RFC-002-database.md) | Escolha do banco de dados (PostgreSQL) | Aceito |
| [RFC-003](rfcs/RFC-003-auth-strategy.md) | Estratégia de autenticação (Lambda + JWT) | Aceito |

### ADRs — Architecture Decision Records
| # | Título | Status |
|---|--------|--------|
| [ADR-001](adrs/ADR-001-clean-architecture.md) | Adoção de Clean Architecture | Aceito |
| [ADR-002](adrs/ADR-002-api-gateway.md) | Kong como API Gateway (DB-less) | Aceito |
| [ADR-003](adrs/ADR-003-hpa-autoscaling.md) | HPA para escalabilidade horizontal | Aceito |
| [ADR-004](adrs/ADR-004-jsonb-service-order.md) | JSONB para itens de OS (snapshot imutável) | Aceito |

### Banco de Dados
- [Diagrama ER](database/er-diagram.md) — entidades e relacionamentos
- [Justificativa e Relacionamentos](database/relationships.md) — decisões de modelagem

## Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS us-east-1                            │
│                                                                   │
│  Internet ──► Kong NLB (público)                                  │
│                  ├── POST /auth ──► Lambda (CloudFormation)       │
│                  └── /api/*    ──► EKS / NestJS                   │
│                                        │                          │
│              Lambda ──────────────────►│                          │
│                                        ▼                          │
│                                   RDS PostgreSQL                  │
│                                   (subnet privada)                │
│                                                                   │
│  New Relic ◄── métricas de: Lambda, NestJS pods, EKS nodes       │
└─────────────────────────────────────────────────────────────────┘
```

## Repos e Responsabilidades

| Repo | Responsabilidade |
|------|-----------------|
| `fiap-tech-challenge-terraform-k8s` | VPC, EKS, Kong, New Relic, namespaces |
| `fiap-tech-challenge-terraform-db` | RDS PostgreSQL |
| `fiap-tech-challenge-lambda` | Função de autenticação (SAM/CloudFormation) |
| `fiap-tech-challenge-codebase` | API NestJS + manifests Kubernetes |
