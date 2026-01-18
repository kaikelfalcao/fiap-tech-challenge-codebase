terraform {
  required_version = ">= 1.5.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

resource "kubernetes_namespace" "tech_challenge" {
  metadata {
    name = var.namespace
  }
}

resource "helm_release" "tech_challenge" {
  name       = "tech-challenge"
  namespace  = kubernetes_namespace.tech_challenge.metadata[0].name

  chart      = var.helm_chart_path

  depends_on = [
    kubernetes_namespace.tech_challenge
  ]
}
