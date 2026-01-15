output "namespace_name" {
  description = "Namespace utilizado pelo Helm Release"
  value       = kubernetes_namespace.tech_challenge.metadata[0].name
}

output "helm_release_name" {
  description = "Nome da release Helm"
  value       = helm_release.tech_challenge.name
}
