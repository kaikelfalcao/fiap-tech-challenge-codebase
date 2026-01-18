param(
  [string]$ReleaseName = "tech-challenge",
  [string]$Namespace = "tech-challenge",
  [string]$ImageName = "tech-challenge-api",
  [string]$ImageTag = "latest",
  [string]$ChartPath = "./helm/tech-challenge"
)

# Garante que o minikube está de pé
minikube status | Out-Null

# Build da imagem
docker build -t "$ImageName`:$ImageTag" .

# Carrega imagem no minikube
minikube image load "$ImageName`:$ImageTag"

# Deploy/upgrade via Helm
helm upgrade --install $ReleaseName $ChartPath `
  -n $Namespace --create-namespace `
  --set app.image.repository=$ImageName `
  --set app.image.tag=$ImageTag

# Status
kubectl get pods -n $Namespace
kubectl get svc -n $Namespace
