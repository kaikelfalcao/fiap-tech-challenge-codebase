# ADR-002 — Kong como API Gateway (DB-less)

| Campo        | Valor                                       |
| ------------ | ------------------------------------------- |
| **Status**   | Aceito                                      |
| **Data**     | 2024                                        |
| **Contexto** | Roteamento e autenticação de entrada no EKS |

## Contexto

O AutoFlow precisa de um API Gateway que:

- Roteia `POST /auth` para a Lambda de autenticação
- Roteia `/api/*` para os pods NestJS
- Funcione dentro do EKS como Ingress Controller
- Não adicione componente de banco de dados separado (AWS Lab tem restrições)
- Seja configurável via Terraform/Helm

## Opções Consideradas

### Kong (DB-less, Ingress Controller)

**Prós:**

- Modo DB-less: configuração via CRDs Kubernetes e `KongIngress` — sem banco de dados externo
- Plugin `aws-lambda` nativo — integração direta com Lambda sem código adicional
- Funciona como Ingress Controller padrão no EKS
- Helm chart oficial (`kong/kong`) bem mantido
- Rate limiting, autenticação, logging disponíveis como plugins

**Contras:**

- Configuração via CRDs tem curva de aprendizado
- Sem UI admin em modo DB-less (admin API é somente leitura)

### AWS API Gateway (serviço gerenciado)

**Prós:**

- Totalmente gerenciado pela AWS
- Integração nativa com Lambda

**Contras:**

- Não funciona como Ingress Controller no EKS — precisaria de dois gateways
- Custo por requisição
- LabRole pode ter restrições para criar APIs Gateway
- Não suporta `custom domain` sem certificado ACM (complexidade adicional)

### Nginx Ingress Controller

**Prós:**

- Padrão amplamente usado no Kubernetes
- Simples de configurar

**Contras:**

- Sem plugin `aws-lambda` nativo — precisaria de código proxy adicional para /auth
- Sem plugins de rate limiting, auth, etc. sem configuração extra

### Traefik

**Prós:**

- Configuração automática via Docker/Kubernetes labels
- Dashboard embutido

**Contras:**

- Plugins menos maduros que Kong
- Sem plugin aws-lambda nativo

## Decisão

**Kong 2.38 em modo DB-less como Ingress Controller** foi escolhido.

O plugin `aws-lambda` elimina a necessidade de código proxy para `/auth`, e o modo
DB-less remove a dependência de banco de dados externo para o gateway.

## Configuração

```
Helm: kong/kong 2.38
Namespace: kong
Modo: DB-less (declarative config via KongIngress CRDs)

Routes:
  POST /auth   → Plugin: aws-lambda → autoflow-auth-homolog
  /api/*       → Service: autoflow.autoflow.svc.cluster.local:3000
```

## Consequências

### Positivas

- Zero banco de dados adicional para o gateway
- Configuração como código (KongIngress CRDs no Terraform)
- `aws-lambda` plugin invoca a Lambda diretamente — sem hop adicional
- NLB criado automaticamente pelo Kong helm chart (tipo `LoadBalancer`)

### Negativas / Mitigações

- **Admin API somente leitura em DB-less**: mudanças de config requerem redeploy do Terraform. Aceitável — mudanças de rotas são raras e controladas via IaC
- **CRDs Terraform**: recursos `kubernetes_manifest` para KongIngress requerem que o cluster exista antes do apply (Fase 1 → Fase 2)
