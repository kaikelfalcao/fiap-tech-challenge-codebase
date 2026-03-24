# RFC-001 — Escolha do Provedor de Nuvem

| Campo       | Valor         |
| ----------- | ------------- |
| **Status**  | Aceito        |
| **Autores** | Time AutoFlow |
| **Data**    | 2024          |

## Contexto

O AutoFlow precisa de infraestrutura cloud para hospedar a API, banco de dados,
função de autenticação e monitoramento. A escolha do provedor impacta custo,
familiaridade da equipe, disponibilidade de serviços gerenciados e restrições do
ambiente acadêmico (FIAP AWS Academy / AWS Lab).

## Opções Consideradas

### AWS (Amazon Web Services)

**Prós:**

- Ambiente AWS Academy disponível para o projeto (Lab com LabRole)
- Serviços gerenciados maduros: EKS, RDS, Lambda, NLB
- Ampla documentação e comunidade
- Integração nativa entre serviços (IAM, VPC, S3)
- Free tier generoso para Lambda e outros serviços

**Contras:**

- Credenciais do Lab expiram em ~4h (limitação do AWS Academy)
- LabRole restringe criação de IAM roles (sem IRSA nativo)
- Custo elevado em produção real

### GCP (Google Cloud Platform)

**Prós:**

- GKE é considerado o Kubernetes mais maduro dos hyperscalers
- Melhor experiência de desenvolvedor para Kubernetes

**Contras:**

- Sem ambiente acadêmico disponível para o projeto
- Maior curva de aprendizado para o time
- Sem restricões de IAM que afetariam o design

### Azure

**Prós:**

- AKS bem integrado com Azure DevOps
- Familiar para equipes Microsoft

**Contras:**

- Sem ambiente acadêmico disponível
- Menor familiaridade do time com Azure

## Decisão

**AWS** foi escolhido.

O principal fator decisivo foi a disponibilidade do **AWS Academy Lab**, que fornece
créditos e acesso a serviços AWS para o projeto acadêmico sem custo adicional.

## Consequências

### Positivas

- Deploy em ambiente real AWS (não simulado)
- Uso de EKS, RDS PostgreSQL, Lambda e NLB como serviços gerenciados
- Terraform com provider `hashicorp/aws` — IaC padrão do mercado
- S3 para armazenar state Terraform compartilhado entre repos

### Negativas / Mitigações

- **Credenciais expiram em ~4h**: mitigado com script `set-github-secrets.sh refresh` que atualiza os 4 repos em segundos
- **LabRole sem criação de IAM**: mitigado com `enable_irsa = false` e uso da LabRole existente em todos os módulos Terraform
- **Session token obrigatório**: pipeline usa `AWS_SESSION_TOKEN` como secret adicional (sem equivalente em produção real com OIDC)
