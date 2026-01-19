# Tech Challenge – FIAP (Fase 2)

API para gestão de oficina mecânica, desenvolvida como parte da Fase 2 do Tech Challenge da FIAP. 

O projeto evolui a Fase 1 com foco em qualidade, arquitetura limpa, automação e escalabilidade.

## ✨ Visão geral

Aplicação backend construída com **NestJS** e **TypeScript**, seguindo **Clean Architecture** e **Clean Code**.

O domínio contempla:

- Clientes  
- Veículos  
- Peças  
- Reparos  
- Ordens de Serviço (OS)

Inclui autenticação JWT, banco relacional com TypeORM, execução local via Docker e deploy em Kubernetes com escalabilidade automática.

## 🎯 Objetivos da Fase 2

- Refatoração com Clean Architecture  
- Separação clara de responsabilidades  
- Testes automatizados  
- Containerização com Docker  
- Orquestração com Kubernetes  
- Infraestrutura como código  
- CI/CD com GitHub Actions  
- Escalabilidade automática (HPA)  
- Documentação técnica  

## 🔑 Funcionalidades principais

- Autenticação e autorização JWT  
- CRUD de clientes, veículos, peças e reparos  
- Ciclo completo de Ordens de Serviço:
  - Abertura de OS  
  - Consulta de status  
  - Aprovação de orçamento  
  - Atualização de status  
  - Listagem ordenada por prioridade  
  - Exclusão lógica de OS finalizadas/entregues  

## 🧱 Arquitetura

Baseada em **Clean Architecture**:

- Interfaces: Controllers e DTOs  
- Application: Casos de uso  
- Domain: Entidades e regras de negócio  
- Infrastructure: Banco, auth e integrações  

## 🛠 Tecnologias

- Node.js 24  
- NestJS  
- TypeScript  
- PostgreSQL  
- TypeORM  
- Docker  
- Docker Compose  
- Kubernetes (Minikube)  
- Helm  
- Terraform  
- GitHub Actions  
- k6 (teste de carga)  


## 📁 Estrutura do repositório

```text
docs/                 # Documentação
helm/tech-challenge/ # Helm charts
infra/local/         # Terraform (ambiente local)
k8s/                  # Manifestos Kubernetes
scripts/              # Scripts de automação
src/                  # Código-fonte
test/                 # Testes
Dockerfile
docker-compose.yaml
docker-compose-dev.yaml
```
## 🐳 Execução local (Docker)
```bash
cp .env.example .env
docker-compose up -d
```
## ☸️ Kubernetes local (Minikube + Helm)
```bash
chmod +x scripts/deploy-local.sh
./scripts/deploy-local.sh
```
A URL da API será exibida ao final do script.

## Teste de carga (k6 + HPA)
```bash
BASE_URL=http://<MINIKUBE_IP>:<NODE_PORT> k6 run test/stress/k6.js
```

Monitoramento:
```bash
kubectl get hpa -w
kubectl get pods -w
```
## 🔁 CI/CD

Pipeline com GitHub Actions para:
- Build
- Testes
- Build da imagem Docker
- Push para registry

Arquivos:
`.github/workflows/`


## 🧪 Testes
```bash
npm run test
npm run test:cov
```
## 📚 Documentação da API
Swagger: http://localhost:3000/docs

## 👥 Autores
- João Miguel
- Kaike Falcão
- Matheus Hurtado
- Thalita Silva
