# Implementação de Terraform no projeto

## 1. Contexto
- **Localização:** `infra/local`  
- **Propósito:** provisionar namespace Kubernetes e instalar o Helm chart local da aplicação.

## 2. Arquivos principais (no diretório `infra/local`)
- `main.tf` — declara providers e define recursos.  
- `variables.tf` — variáveis `namespace` e `helm_chart_path`.  
- `outputs.tf` — outputs `namespace_name` e `helm_release_name`.  
- `metrics-patch.json` — JSON Patch presente no diretório (usado externamente).  
- `terraform.tfstate` e `terraform.tfstate.backup` — estado local persistido.  
- `terraform.lock.hcl` — versões travadas dos providers.

## 3. Providers e versão do Terraform
- `required_providers` em `main.tf`: `hashicorp/kubernetes` e `hashicorp/helm`.  
- Providers configurados para usar o kubeconfig local: `config_path = "~/.kube/config"`.  
- `required_version` declarado em `main.tf` como `>= 1.5.0`.  
- `terraform.tfstate` registra `terraform_version = "1.14.3"`.

## 4. Recursos provisionados
- `resource "kubernetes_namespace" "tech_challenge"` — cria namespace com `name = var.namespace`.  
- `resource "helm_release" "tech_challenge"` — instala Helm chart apontado por `var.helm_chart_path` (valor padrão `../../helm/tech-challenge`) no namespace criado; `depends_on` explícito para o namespace.

## 5. Estado atual
- **Outputs armazenados:**  
  - `helm_release_name = "tech-challenge"`  
  - `namespace_name = "tech-challenge"`  
- **Recursos no state:** `helm_release.tech_challenge` (status `deployed`) e `kubernetes_namespace.tech_challenge`.  
- **Backup de state:** indica um estado anterior com `status = "failed"` e marcação `tainted` para o `helm_release` em uma execução anterior.  
- **Atributos sensíveis:** no `helm_release` referenciam `repository_password` (tratamento sensível em provider).

## 6. Comportamento observado / fluxo de execução
- Terraform aplica recursos diretamente no cluster apontado pelo `~/.kube/config`.  
- O Helm chart é instalado a partir de um caminho relativo no repositório.  
- O estado é mantido localmente em `infra/local/terraform.tfstate` com backup e lockfile presente.
