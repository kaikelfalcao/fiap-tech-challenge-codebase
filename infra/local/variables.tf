variable "namespace" {
  description = "Namespace do projeto Tech Challenge"
  type        = string
  default     = "tech-challenge"
}

variable "helm_chart_path" {
  description = "Caminho para o Helm Chart da aplicação"
  type        = string
  default     = "../../helm/tech-challenge"
}
