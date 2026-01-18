<!-- prettier-ignore -->
 <div style="text-align:center">
  <h1>Tech Challenge - FIAP</h1>

<p>
  <img src="https://img.shields.io/static/v1?label=Node&message=24.11.0&color=red&style=for-the-badge" alt="Node version"/>
  <img src="https://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=orange&style=for-the-badge" alt="status"/>
</p>
</div>

## ✨ Sobre este projeto

API construída com NestJS e TypeScript seguindo princípios de arquitetura limpa. O objetivo desta fase é demonstrar separação de responsabilidades, testes automatizados e integração com um banco relacional via TypeORM. O domínio modela um sistema de gestão (clientes, veículos, peças, reparos e ordens de serviço) com autenticação JWT.

Objetivos desta fase:
- Validar a organização em camadas (presentation/application/domain/infra).
- Implementar repositórios como gateway para persistência (TypeORM).
- Cobertura de testes unitários e integração.
- Provisionamento e execução local via Docker.
- Preparar artefatos para deploy (imagem Docker / manifests Kubernetes).
- Documentar arquitetura e decisões técnicas.
- CI/CD básico (GitHub Actions).

## 🔑 Principais funcionalidades

- Autenticação e autorização (JWT)
- CRUD de clientes, usuários, veículos e peças
- Gestão de ordens de serviço e reparos
- Camadas separadas (controllers, usecases, domain, infra)
- Migrations e seed via TypeORM
- Testes unitários e de integração com Jest

## 🚀 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js v24.x (ou compatível com o projeto)
- npm (incluído com Node)
- Docker & Docker Compose (para banco e serviços auxiliares)
- Git

## 🧭 Passo a passo — Instalação e execução

1. Clone o repositório

```zsh
git clone https://github.com/kaikelfalcao/tech-challenge.git
cd tech-challenge
```

2. Copie as variáveis de ambiente

```zsh
cp .env.example .env
```

3. Instale dependências

```zsh
npm install
```

4. Subir serviços via Docker (Postgres, Redis, etc.)

```zsh
docker-compose up -d
# ao subir os containers, a aplicação também já inicia automaticamente
# a rota da API é apresentada no console onde o docker sobe
```

5. Caso queira executar os testes

```zsh
npm run test
npm run test:cov # para teste de cobertura
```

## 🔍 Configuração Local do Sonar
1. Com o Container do Sonar em execução, acesse http://localhost:9000
2. Faça o login no Sonar. No primeiro acesso, os dados serão:
User: admin
Senha: admin

1. Na tela principal, vá em Create Project > Local
2. Escolha um Project Name e um Project Key
3. Selecione Set Up default e clique em Create Project
4. Selecione a opção para analisar o projeto localmente (Locally)
5. Escolha um token name e um tempo de expiração. Ex: tech-challenge
6. Um token será gerado para o token name escolhido. Copie esse token para atualizar o .env do projeto

No arquivo .env inclua a informação do token gerado:

```zsh
SONAR_TOKEN=(token gerado aqui)
```
No arquivo sonar-project.js insira o token name escolhido nos seguintes campos:
```zsh 
sonarqubeScanner(
    serverUrl: DEFAULT_SONAR_URL,
    options: {
      ...existing code
      'sonar.projectKey': 'seu-tokenname-aqui',
      'sonar.projectName': 'seu-token-name-aqui',
      ...existing code
      }
  },
  () => {}
);
```
No terminal, execute o seguinte comando:
```zsh
npm run sonar
```
## 📁 Estrutura resumida do projeto

- src/ — código fonte (camadas: application, domain, infra, interface/nestjs)
- src/application — casos de uso e orquestração
- src/domain — entidades, value objects, erros e contratos (repositórios)
- src/infra — implementação concreta (TypeORM, auth, config, nestjs)
- src/infra/nestjs/modules/ — módulos e controllers expostos pela API
- src/infra/typeorm/ — configuração TypeORM, entities (ORM), mappers e repositórios
- test/ — configuração de testes e testes end-to-end

## 🏗️ Arquitetura proposta

Camadas principais (ordem de uso / responsabilidade):

1. Apresentação (src/infra/nestjs/modules/...) — controllers, DTOs, filtros (ex.: global-exception.filter.ts)
2. Aplicação (src/application) — casos de uso, validações e orquestração (ex.: base.usecase.ts, usecases/*)
3. Domínio (src/domain) — entidades, value objects, contratos de repositório e regras de negócio
4. Infraestrutura (src/infra) — implementação concreta dos contratos do domínio (TypeORM, auth, config)
5. Externos — banco de dados (Postgres), serviços de autenticação e cache

Componentes da aplicação:

- Módulos NestJS: customer, part, repair, service-order, vehicle, auth (ver src/infra/nestjs/modules)
- Repositórios TypeORM: implementações em src/infra/typeorm/repositories
- Mappers entre entidades do domínio e entidades ORM: src/infra/typeorm/mappers
- Entidades ORM: src/infra/typeorm/entities
- Configuração centralizada: src/infra/config/*
- Autenticação: src/infra/auth/* (JWT strategy e guard)

Infraestrutura provisionada (proposta / usada localmente):

- PostgreSQL (via docker-compose)
- Serviço de aplicação containerizado (imagem Docker)
- Observabilidade e qualidade: SonarQube (documentado neste repositório)

Fluxo de deploy (resumido):
1. Build da imagem Docker: docker build -t <registry>/tech-challenge:<tag> .
2. Push para registry: docker push <registry>/tech-challenge:<tag>3
3. Aplicar manifests Kubernetes (Deployment, Service, ConfigMap/Secret, Ingress) ou usar Helm chart

## 💠 CI/CD (GitHub Actions)

<img src="https://img.shields.io/static/v1?label=CI%2FCD&message=GitHub%20Actions&color=purple&style=for-the-badge" alt="ci/cd"></img> <img src="https://img.shields.io/static/v1?label=Docker&message=Build&color=blue&style=for-the-badge" alt="docker build"></img> <img src="https://img.shields.io/static/v1?label=Quality&message=SonarQube&color=teal&style=for-the-badge" alt="sonar"></img>

Este repositório utiliza GitHub Actions para CI/CD (workflows no diretório .github/workflows/). Principais etapas automatizadas sugeridas:
ci.yml — install, lint, test, coverage report
build-and-push.yml — build da imagem Docker e push para registry (usando GITHUB_REGISTRY ou outro)
deploy.yml — deploy automático para ambientes (ex.: cluster Kubernetes) mediante aprovação/branches protegidas
sonar-scan.yml — executar SonarQube scanner com SONAR_TOKEN definido nas Secrets do repositório

Exemplo rápido:
Adicione Secrets no repositório: DOCKER_REGISTRY, DOCKER_USERNAME, DOCKER_PASSWORD, SONAR_TOKEN, KUBE_CONFIG (se necessário)
Workflows irão executar automaticamente em PRs / pushes conforme configurado

## 🛠️ Instruções
Execução local
1. Copie variáveis de ambiente:
```zsh
cp .env.example .env
```
2. Instale dependências:
```zsh
npm install
```
3. Suba serviços via Docker:
```zsh
docker-compose up -d
```
4. Rode a aplicação em modo desenvolvimento
```zsh
npm run start:dev
```
5. Testes:
```zsh
npm run test
npm run test:cov
```
## 🖥️ Arquivos importantes:
- Código fonte: src/
- Módulos NestJS: src/infra/nestjs/modules/
- Repositórios TypeORM: src/infra/typeorm/repositories/
- Mappers: src/infra/typeorm/mappers/

## ☸️ Deploy em Kubernetes (exemplo)
1. Build e push da imagem:
```zsh
docker build -t <registry>/tech-challenge:<tag> .
docker push <registry>/tech-challenge:<tag>
```
2. Aplique manifests Kubernetes (ex.: deployment.yaml, service.yaml):
```zsh
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```
3. Checar rollout:
```zsh
kubectl rollout status deployment/tech-challenge-deployment -n tech-challenge
```
## 📚 APIs / Documentação 
Swagger:  (a incluir)

## 🧪 Qualidade e testes
- Testes: Jest (npm run test)
- Cobertura: relatórios em test/coverage/
- Sonar: instruções para rodar scanner locais estão documentadas; defina SONAR_TOKEN no .env e execute npm run sonar

## 🔗 Observações de implementação (gateway entre app e banco)
- A aplicação implementa padrão de gateway para acesso a dados:
- Interfaces de repositório definidas em src/domain/repositories/
- Implementações concretas com TypeORM em src/infra/typeorm/repositories/ (ex.: typeorm-customer.repository.ts)
- Mappers localizados em src/infra/typeorm/mappers/ convertem entre entidades do domínio e entidades ORM (src/infra/typeorm/entities/)
- Isso garante que a camada de domínio não dependa de detalhes da persistência — o repositório atua como gateway permitindo troca de implementação (ex.: outro ORM ou mocks para testes)

## 🗂️ Estrutura resumida do projeto
- src/ — código fonte (camadas: application, domain, infra, interface/nestjs)
- src/infra/nestjs/modules/ — controllers e módulos expostos pela API
- src/infra/typeorm/ — configuração TypeORM, entidades ORM, mappers e repositórios
- test/ — testes
- docker-compose.yml — serviços locais (Postgres, Redis, etc)

## 👥 Autores
- João Miguel
- Kaike Falcão
- Matheus Hurtado
- Thalita Silva

## 🤝 Como contribuir

1. Fork o projeto
2. Crie uma branch feature/xxx
3. Faça suas mudanças e inclua testes
4. Abra um Pull Request descrevendo as alterações

Leia `docs/CODING_STANDARDS.md` para convenções de código e `docs/GIT_STANDARD.md` para fluxo de Git.

---