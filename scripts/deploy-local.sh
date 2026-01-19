#!/bin/bash

set -e

# -------------------------------
# Configurações
# -------------------------------
RELEASE_NAME="tech-challenge"
NAMESPACE="default"
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
CHART_DIR="$SCRIPT_DIR/../helm/tech-challenge"

IMAGES=("kaikelfalcao/tech-challenge-api-fase-2:latest" "postgres:16")
API_PORT=30000  # NodePort definido no Helm chart

# -------------------------------
# Inicia Minikube e habilita addons
# -------------------------------
echo "🚀 Iniciando Minikube..."
minikube start --cpus=4 --memory=8192
echo "🔧 Habilitando metrics-server..."
minikube addons enable metrics-server
echo "✅ Minikube iniciado"

# Corrige o metrics-server para Minikube
echo "🔧 Ajustando metrics-server para Minikube..."
kubectl rollout restart deployment metrics-server -n kube-system
kubectl -n kube-system patch deployment metrics-server --type='json' -p='[
  {"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value":"--kubelet-insecure-tls"},
  {"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value":"--kubelet-preferred-address-types=InternalIP"}
]'
sleep 5
echo "✅ Metrics-server ajustado"

# -------------------------------
# Verifica Helm
# -------------------------------
if ! command -v helm &> /dev/null; then
    echo "Helm não encontrado. Instalando Helm..."
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi
echo "✅ Helm disponível"

# -------------------------------
# Cria namespace
# -------------------------------
kubectl get namespace $NAMESPACE >/dev/null 2>&1 || kubectl create namespace $NAMESPACE

# -------------------------------
# Carrega imagens Docker locais no Minikube
# -------------------------------
for IMAGE in "${IMAGES[@]}"; do
    echo "📥 Carregando imagem $IMAGE no Minikube..."
    minikube image load $IMAGE
done
echo "✅ Todas as imagens carregadas"

# -------------------------------
# Instala ou atualiza Helm chart
# -------------------------------
echo "☸️ Deploy da aplicação com Helm..."
helm upgrade --install "${RELEASE_NAME}" "${CHART_DIR}" \
  --namespace "${NAMESPACE}" \
  --create-namespace \
  --atomic \
  --wait \
  --timeout 300s \
  --set app.image.repository="kaikelfalcao/tech-challenge-api-fase-2" \
  --set app.image.tag="latest"

echo "✅ Chart instalado"

# -------------------------------
# Espera pods ficarem prontos
# -------------------------------
echo "⏳ Aguardando pods começarem a ser criados..."
until kubectl get pods -n $NAMESPACE >/dev/null 2>&1; do sleep 2; done

echo "⏳ Aguardando todos os pods ficarem prontos (até 180s)..."
kubectl wait --for=condition=ready pod --all -n $NAMESPACE --timeout=180s

# -------------------------------
# Espera Service da API
# -------------------------------
echo "⏳ Aguardando Service da API..."
until kubectl get svc tech-challenge-api -n $NAMESPACE >/dev/null 2>&1; do sleep 2; done

NODE_IP=$(minikube ip)
NODE_PORT=$(kubectl get svc tech-challenge-api -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}')
echo "🌐 Acesse sua API em: http://$NODE_IP:$NODE_PORT"

# -------------------------------
# Mostra HPA
# -------------------------------
if kubectl get hpa -n $NAMESPACE >/dev/null 2>&1; then
    echo "📊 Status do HPA:"
    kubectl get hpa -n $NAMESPACE
fi
