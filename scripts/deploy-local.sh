#!/usr/bin/env bash
set -euo pipefail

RELEASE_NAME="${RELEASE_NAME:-tech-challenge}"
NAMESPACE="${NAMESPACE:-tech-challenge}"
IMAGE_NAME="${IMAGE_NAME:-kaikelfalcao/tech-challenge-api-fase-2}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
CHART_PATH="${CHART_PATH:-./helm/tech-challenge}"

# -------------------------
# Pré-checagens
# -------------------------
for cmd in minikube kubectl helm docker; do
  command -v $cmd >/dev/null 2>&1 || {
    echo "❌ Comando '$cmd' não encontrado"
    exit 1
  }
done

# -------------------------
# Minikube
# -------------------------
if ! minikube status >/dev/null 2>&1; then
  echo "🚀 Iniciando Minikube..."
  minikube start --driver=docker
fi

# Pré-carregar imagens para acelerar deploy
minikube image load "${IMAGE_NAME}:${IMAGE_TAG}"
minikube image load postgres:16

# -------------------------
# Metrics Server
# -------------------------
echo "📊 Habilitando metrics-server..."
minikube addons enable metrics-server
kubectl rollout status deployment/metrics-server -n kube-system

# -------------------------
# Deploy via Helm
# -------------------------
echo "☸️  Deploy da aplicação com Helm..."
helm upgrade --install "${RELEASE_NAME}" "${CHART_PATH}" \
  --namespace "${NAMESPACE}" \
  --create-namespace \
  --set app.image.repository="${IMAGE_NAME}" \
  --set app.image.tag="${IMAGE_TAG}" \
  --atomic \
  --wait \
  --timeout 300s

# -------------------------
# Esperar Postgres ficar pronto
# -------------------------
echo "⏳ Aguardando Postgres ficar pronto..."
kubectl wait --for=condition=Ready pod -l app=postgres -n "${NAMESPACE}" --timeout=120s

# -------------------------
# Esperar API ficar pronto
# -------------------------
echo "⏳ Aguardando API ficar pronta..."
kubectl wait --for=condition=Ready pod -l app=tech-challenge-api -n "${NAMESPACE}" --timeout=180s

# -------------------------
# Descobre URL da aplicação
# -------------------------
MINIKUBE_IP=$(minikube ip)
NODE_PORT=$(kubectl get svc tech-challenge-api -n "${NAMESPACE}" -o jsonpath='{.spec.ports[0].nodePort}')

echo
echo "======================================"
echo "✅ Deploy concluído com sucesso"
echo "🌐 API disponível em:"
echo "👉 http://${MINIKUBE_IP}:${NODE_PORT}"
echo "======================================"
