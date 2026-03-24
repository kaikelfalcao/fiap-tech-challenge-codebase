#!/usr/bin/env bash
# Deploy manual da codebase no EKS (equivalente à pipeline ci-cd.yml).
#
# Uso:
#   ./scripts/local-deploy.sh [TAG]
#
#   TAG  — tag da imagem Docker (default: local-YYYYMMDD-HHMM)
#          Exemplos: ./scripts/local-deploy.sh v1.2.3
#                    ./scripts/local-deploy.sh latest
#
# Pré-requisitos:
#   - .env.local preenchido (AWS creds + JWT_SECRET + NEWRELIC_LICENSE_KEY)
#   - docker login (docker hub) para push da imagem
#   - kubectl, jq, curl instalados
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ROOT_DIR}/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERRO: .env.local não encontrado."
  echo "      Execute: cd ../k8s && ./scripts/set-github-secrets.sh local"
  exit 1
fi
# shellcheck source=/dev/null
source "$ENV_FILE"

# ── Configuração ──────────────────────────────────────────────────────────────
IMAGE_NAME="kaikelfalcao/autoflow"
IMAGE_TAG="${1:-local-$(date '+%Y%m%d-%H%M')}"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"
K8S_CLUSTER="fiap-tc-dev-eks"
K8S_NAMESPACE="autoflow"
K8S_DEPLOYMENT="autoflow"

echo ""
echo "AutoFlow Codebase — Deploy local → EKS"
echo "======================================="
echo "Imagem  : ${IMAGE_NAME}:${IMAGE_TAG}"
echo "Cluster : ${K8S_CLUSTER}"
echo "Região  : ${REGION}"
echo ""

# ── 1. Lê DB do tfstate S3 ────────────────────────────────────────────────────
echo "=== 1. Lendo DB outputs do tfstate ==="
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
TFSTATE_BUCKET="fiap-tc-tfstate-${ACCOUNT_ID}"

aws s3 cp "s3://${TFSTATE_BUCKET}/db-infra/terraform.tfstate" /tmp/db.tfstate
DB_HOST=$(jq -r '.outputs.db_address.value'  /tmp/db.tfstate)
DB_NAME=$(jq -r '.outputs.db_name.value'     /tmp/db.tfstate)
DB_USER=$(jq -r '.outputs.db_username.value' /tmp/db.tfstate)
DB_PASS=$(jq -r '.outputs.db_password.value' /tmp/db.tfstate)
echo "  DB_HOST : ${DB_HOST}"
echo "  DB_NAME : ${DB_NAME}"

# ── 2. Build + push Docker ────────────────────────────────────────────────────
echo ""
echo "=== 2. Docker build + push ==="
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .
docker push "${IMAGE_NAME}:${IMAGE_TAG}"
echo "  ✓ ${IMAGE_NAME}:${IMAGE_TAG}"

# ── 3. Configura kubectl ──────────────────────────────────────────────────────
echo ""
echo "=== 3. Configurando kubectl ==="
aws eks update-kubeconfig --region "${REGION}" --name "${K8S_CLUSTER}"
echo "  ✓ kubeconfig atualizado"

# ── 4. Namespace ──────────────────────────────────────────────────────────────
echo ""
echo "=== 4. Namespace ==="
kubectl apply -f k8s/namespace.yaml

# ── 5. Kubernetes secret ──────────────────────────────────────────────────────
echo ""
echo "=== 5. Atualizando autoflow-secrets ==="
kubectl create secret generic autoflow-secrets \
  -n "${K8S_NAMESPACE}" \
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
echo "  ✓ secret aplicado"

# ── 6. Migrations ─────────────────────────────────────────────────────────────
echo ""
echo "=== 6. Migrations ==="
kubectl delete job autoflow-migration -n "${K8S_NAMESPACE}" 2>/dev/null || true

sed "s|IMAGE_PLACEHOLDER|${IMAGE_NAME}:${IMAGE_TAG}|g" \
  k8s/migration-job.yaml | kubectl apply -f -

echo "  Aguardando migrations..."
kubectl wait --for=condition=complete job/autoflow-migration \
  -n "${K8S_NAMESPACE}" --timeout=180s

kubectl logs -n "${K8S_NAMESPACE}" job/autoflow-migration

# ── 7. Manifests ──────────────────────────────────────────────────────────────
echo ""
echo "=== 7. Aplicando manifests ==="
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# ── 8. Atualiza imagem + rollout ──────────────────────────────────────────────
echo ""
echo "=== 8. Rollout ==="
kubectl set image deployment/"${K8S_DEPLOYMENT}" \
  autoflow="${IMAGE_NAME}:${IMAGE_TAG}" \
  -n "${K8S_NAMESPACE}"

kubectl rollout status deployment/"${K8S_DEPLOYMENT}" \
  -n "${K8S_NAMESPACE}" --timeout=300s
echo "  ✓ rollout concluído"

# ── 9. Smoke test ─────────────────────────────────────────────────────────────
echo ""
echo "=== 9. Smoke test ==="
KONG_HOST=$(kubectl get svc -n kong kong-kong-proxy \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)

if [ -z "$KONG_HOST" ]; then
  echo "  AVISO: Kong NLB hostname não disponível, pulando smoke test."
else
  bash "$(dirname "$0")/smoke-test.sh" "$KONG_HOST" || \
    echo "  AVISO: smoke test falhou (deploy concluído, verifique manualmente)"
fi

# ── Resumo ────────────────────────────────────────────────────────────────────
echo ""
echo "=== Deploy concluído ==="
echo "Imagem deployada : ${IMAGE_NAME}:${IMAGE_TAG}"
if [ -n "${KONG_HOST:-}" ]; then
  echo "Kong endpoint    : http://${KONG_HOST}"
fi
kubectl get pods -n "${K8S_NAMESPACE}"
