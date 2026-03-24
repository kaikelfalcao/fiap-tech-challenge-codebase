# Diagrama de Componentes — AutoFlow

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              AWS us-east-1                               │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     VPC (10.0.0.0/16)                             │   │
│  │                                                                    │   │
│  │  Subnets Públicas                  Subnets Privadas               │   │
│  │  ┌─────────────────┐               ┌─────────────────────────┐   │   │
│  │  │  Kong NLB       │               │  EKS Cluster            │   │   │
│  │  │  (Load Balancer)│               │  ┌───────────────────┐  │   │   │
│  │  │                 │──────────────►│  │ Namespace: kong    │  │   │   │
│  │  │  :80  → HTTP    │               │  │  Kong Gateway Pod  │  │   │   │
│  │  │  :443 → HTTPS   │               │  └───────────────────┘  │   │   │
│  │  └─────────────────┘               │                          │   │   │
│  │                                    │  ┌───────────────────┐  │   │   │
│  │                                    │  │ Namespace:autoflow │  │   │   │
│  │                                    │  │  NestJS Pods (HPA) │  │   │   │
│  │                                    │  │  min:1  max:5      │  │   │   │
│  │                                    │  └───────────────────┘  │   │   │
│  │                                    │                          │   │   │
│  │                                    │  ┌───────────────────┐  │   │   │
│  │                                    │  │ Namespace:newrelic │  │   │   │
│  │                                    │  │  nri-bundle Pods   │  │   │   │
│  │                                    │  └───────────────────┘  │   │   │
│  │                                    └─────────────────────────┘   │   │
│  │                                                                    │   │
│  │                                    ┌─────────────────────────┐   │   │
│  │                                    │  RDS PostgreSQL 15       │   │   │
│  │                                    │  (subnet privada, SG)    │   │   │
│  │                                    └─────────────────────────┘   │   │
│  │                                                                    │   │
│  │                                    ┌─────────────────────────┐   │   │
│  │                                    │  Lambda: autoflow-auth   │   │   │
│  │                                    │  (Node.js, VPC, SAM)     │   │   │
│  │                                    └─────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  S3: fiap-tc-tfstate-{ACCOUNT_ID}                                        │
│  (state compartilhado entre k8s, db, lambda, codebase)                   │
└─────────────────────────────────────────────────────────────────────────┘

         │                              │
         ▼                              ▼
  New Relic (SaaS)              GitHub Actions
  (métricas, logs,              (CI/CD pipelines)
   alertas)
```

## Componentes Detalhados

### Internet → Kong NLB

```
Cliente HTTP/HTTPS
       │
       ▼
  AWS NLB (público)
  ┌────────────────────────────────────────────┐
  │ Kong Gateway (DB-less, Ingress Controller)  │
  │                                             │
  │  Route: POST /auth                          │
  │    └──► Plugin aws-lambda                   │
  │          └──► Lambda autoflow-auth-homolog  │
  │                                             │
  │  Route: /api/*                              │
  │    └──► Service: autoflow.autoflow.svc      │
  │          └──► NestJS :3000                  │
  └────────────────────────────────────────────┘
```

### NestJS API (Namespace: autoflow)

```
NestJS Application
├── Módulos
│   ├── IAMModule        → /api/iam     (usuários, login interno)
│   ├── CustomerModule   → /api/customers
│   ├── VehicleModule    → /api/vehicles
│   ├── CatalogModule    → /api/catalog
│   ├── InventoryModule  → /api/inventory
│   └── ServiceOrderModule → /api/service-orders
│
├── Guards
│   └── JwtAuthGuard     → valida Bearer token (HS256, JWT_SECRET)
│
└── Infrastructure
    └── TypeORM ──► RDS PostgreSQL
```

### Lambda — Autenticação

```
Lambda: autoflow-auth-homolog
├── Runtime: Node.js 20
├── Trigger: Kong aws-lambda plugin (POST /auth)
├── Input:  { "tax_id": "CPF" }
├── Lógica: consulta iam_users via RDS, valida CPF
└── Output: { "token": "eyJ..." }  (JWT assinado, HS256)
```

### New Relic Observabilidade

```
nri-bundle (Helm, namespace: newrelic)
├── newrelic-infrastructure  → métricas de nós EKS
├── nri-kube-events          → eventos Kubernetes
├── newrelic-logging         → logs de todos os pods
└── kube-state-metrics       → estado dos recursos K8s

APM (NestJS):
└── newrelic agent npm       → traces, erros, throughput

APM (Lambda):
└── newrelic lambda layer    → invocações, erros, duration
```

### Repositórios e Responsabilidades

| Repo            | Tecnologia        | Responsabilidade                              |
| --------------- | ----------------- | --------------------------------------------- |
| `terraform-k8s` | Terraform + Helm  | VPC, EKS, Kong, New Relic, namespace autoflow |
| `terraform-db`  | Terraform         | RDS PostgreSQL (subnets privadas)             |
| `lambda`        | AWS SAM / Node.js | Função de autenticação CPF→JWT                |
| `codebase`      | NestJS + TypeORM  | API REST, migrations, manifests K8s           |

### Segredos e Configuração

```
kubernetes_secret: autoflow-secrets (namespace: autoflow)
├── DB_HOST        ← lido do state S3 db-infra
├── DB_PORT        ← 5432
├── DB_NAME        ← autoflow
├── DB_USER        ← autoflow
├── DB_PASS        ← random_password (state S3 db-infra)
├── JWT_SECRET     ← GitHub Secret CODEBASE
└── NEW_RELIC_*    ← GitHub Secret CODEBASE
```
