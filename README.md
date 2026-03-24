# autoflow — codebase

API de gestão de oficina mecânica do **AutoFlow**, desenvolvida com NestJS e
TypeScript seguindo Clean Architecture.

## Tecnologias

| Camada          | Tecnologia              |
| --------------- | ----------------------- |
| Runtime         | Node.js 20              |
| Framework       | NestJS + TypeScript     |
| Banco de dados  | PostgreSQL via TypeORM  |
| Containerização | Docker / Docker Compose |
| Orquestração    | Kubernetes (EKS)        |
| Observabilidade | New Relic APM           |
| CI/CD           | GitHub Actions          |

## Posição no fluxo multi-repo

```
1. k8s  (Fase 1)  →  cria EKS, namespace autoflow, kubernetes_secret app-secrets
2. db             →  cria RDS
3. lambda         →  deploya função de auth (usada pelo Kong)
4. k8s  (Fase 2)  →  configura rotas Kong (/auth → lambda, /api/* → este app)
5. codebase (este)→  lê DB do state db via S3, builda imagem, deploya no EKS
```

O pipeline (`ci-cd.yml`) lê automaticamente do S3:

- `db-infra/terraform.tfstate` → `db_address`, `db_name`, `db_username`, `db_password`

E cria/atualiza o `kubernetes_secret autoflow-secrets` no namespace `autoflow`
combinando os valores do S3 com `JWT_SECRET` e `NEWRELIC_LICENSE_KEY` do GitHub.

## Documentação Arquitetural

Documentação completa em [`docs/architecture/`](docs/architecture/README.md):

- [Diagrama de Componentes](docs/architecture/components.md)
- [Fluxo de Autenticação](docs/architecture/sequences/auth-flow.md)
- [Fluxo de Ordem de Serviço](docs/architecture/sequences/service-order-flow.md)
- [RFCs](docs/architecture/README.md#rfcs--request-for-comments) — Cloud, Banco, Auth
- [ADRs](docs/architecture/README.md#adrs--architecture-decision-records) — Clean Arch, Kong, HPA, JSONB
- [Diagrama ER](docs/architecture/database/er-diagram.md)

## Arquitetura

```
Internet
    │
    ▼ (Kong NLB)
POST /auth  →  Lambda (auth)
/api/*      →  autoflow Service (ClusterIP :80 → :3000)
                    │
                    ▼
              autoflow Deployment (2–6 réplicas, HPA)
                    │
              ┌─────┴──────┐
              │            │
         Migrations    TypeORM
              │            │
              └─────┬──────┘
                    ▼
              RDS PostgreSQL
              (subnet privada)
```

## Estrutura

```
src/
  main.ts             ← bootstrap NestJS (prefixo /api, validação, logger)
  app.module.ts       ← módulo raiz
  shared/             ← entidades base, value objects, exceções de domínio
  config/             ← env schema (Joi), database, auth, app configs
  health/             ← /api/health, /liveness, /readiness
  metrics/            ← New Relic custom metrics
  features/           ← Customer, Vehicle, Inventory, Catalog, ServiceOrder, IAM

k8s/
  namespace.yaml      ← namespace autoflow
  secret.yaml         ← TEMPLATE — o pipeline cria o secret dinamicamente
  deployment.yaml     ← 2 réplicas, probes, New Relic injection
  service.yaml        ← ClusterIP porta 80 → 3000
  hpa.yaml            ← escala de 2 a 6 réplicas (CPU 70%, mem 80%)
  migration-job.yaml  ← Job TypeORM migrations

scripts/
  (em desenvolvimento)

.github/workflows/
  ci.yml     ← lint + format + test (push/PR para main e develop)
  ci-cd.yml  ← build Docker + push + deploy EKS (push de tags v*.*.*)
```

## Secrets no GitHub

| Secret                  | Descrição                                         |
| ----------------------- | ------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | Credencial AWS Lab                                |
| `AWS_SECRET_ACCESS_KEY` | Credencial AWS Lab                                |
| `AWS_SESSION_TOKEN`     | Session token (obrigatório no Lab, expira em ~4h) |
| `JWT_SECRET`            | Segredo JWT da aplicação                          |
| `NEWRELIC_LICENSE_KEY`  | Chave de ingest New Relic                         |
| `DOCKER_USERNAME`       | Login Docker Hub (para push da imagem)            |
| `DOCKER_PASSWORD`       | Token Docker Hub                                  |

`DB_HOST`, `DB_PASS` e demais credenciais de banco **não são secrets** —
lidos automaticamente do state S3 pelo pipeline.

## CI/CD

| Evento               | Comportamento                                           |
| -------------------- | ------------------------------------------------------- |
| Push/PR em `main`    | lint + format:check + testes                            |
| Push de tag `v*.*.*` | Testa → build + push Docker → deploy EKS (com approval) |

### Fluxo do deploy (ci-cd.yml)

1. **test** — lint, format, testes
2. **docker** — `docker build`, push para `kaikelfalcao/autoflow:{tag}`
3. **deploy** — configure kubectl → lê DB do S3 tfstate → cria/atualiza `autoflow-secrets` → roda migrations (Job) → aplica manifests → `kubectl rollout` → smoke test via Kong

## Desenvolvimento local

### Opção 1 — Docker Compose (mais simples)

Sobe o app completo com banco local:

```bash
cp .env.example .env
docker compose up -d
```

A API fica disponível em `http://localhost:3000/api`.

Para modo dev com hot reload:

```bash
npm ci
cp .env.example .env
docker compose up -d autoflow-db   # só o banco
npm run start:dev
```

### Opção 2 — Apontando para o RDS de dev (AWS Lab)

Útil para testar com dados reais. Requer que os repos k8s e db estejam deployados.

```bash
# Configure as credenciais AWS em .env.local.aws (veja .env.local.aws.example)
# Execute para gerar o .env com valores do RDS real:
./scripts/local-env.sh
npm run start:dev
```

> O RDS só aceita conexões de dentro da VPC. Você precisa de um bastion host
> ou de um `kubectl port-forward` para acessar de fora do cluster.

### Testes

```bash
npm run test          # unitários
npm run test:cov      # com cobertura
npm run lint
npm run format:check
```

## Deploy manual no EKS

Para deployar sem a pipeline (usando as credenciais locais do Lab):

```bash
# 1. Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name fiap-tc-dev-eks

# 2. Leia as credenciais do banco do S3
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET="fiap-tc-tfstate-${ACCOUNT_ID}"
aws s3 cp "s3://${BUCKET}/db-infra/terraform.tfstate" /tmp/db.tfstate
DB_HOST=$(jq -r '.outputs.db_address.value'   /tmp/db.tfstate)
DB_NAME=$(jq -r '.outputs.db_name.value'      /tmp/db.tfstate)
DB_USER=$(jq -r '.outputs.db_username.value'  /tmp/db.tfstate)
DB_PASS=$(jq -r '.outputs.db_password.value'  /tmp/db.tfstate)

# 3. Crie/atualize o secret
kubectl create secret generic autoflow-secrets -n autoflow \
  --from-literal=NODE_ENV=production \
  --from-literal=DB_HOST="${DB_HOST}" \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_USER="${DB_USER}" \
  --from-literal=DB_PASS="${DB_PASS}" \
  --from-literal=DB_NAME="${DB_NAME}" \
  --from-literal=JWT_SECRET="${JWT_SECRET}" \
  --from-literal=JWT_EXPIRES_IN=1d \
  --from-literal=NEW_RELIC_ENABLED=true \
  --from-literal=NEW_RELIC_APP_NAME=autoflow-tc \
  --from-literal=NEW_RELIC_LICENSE_KEY="${NEWRELIC_LICENSE_KEY}" \
  --from-literal=NEW_RELIC_LOG_LEVEL=info \
  --dry-run=client -o yaml | kubectl apply -f -

# 4. Aplique os manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# 5. Atualize a imagem
kubectl set image deployment/autoflow \
  autoflow=kaikelfalcao/autoflow:latest -n autoflow
kubectl rollout status deployment/autoflow -n autoflow
```

## Observações sobre o secret.yaml

O arquivo `k8s/secret.yaml` é um **template de documentação** — não contém
valores reais e não é aplicado pela pipeline. O secret real é criado
diretamente pelo `ci-cd.yml` via `kubectl create secret --dry-run=client`.

Nunca commite credenciais reais no `k8s/secret.yaml`.

## Autores

- João Miguel
- Kaike Falcão
- Matheus Hurtado
- Thalita Silva
