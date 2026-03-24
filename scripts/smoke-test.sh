#!/usr/bin/env bash
# Smoke test end-to-end:
#   1. Autentica o Admin via Lambda (POST /auth)  → obtém JWT
#   2. Usa o JWT numa rota protegida da codebase  (GET /api/customers)
#
# Uso:
#   ./scripts/smoke-test.sh [KONG_HOST] [ADMIN_CPF]
#
#   KONG_HOST — hostname ou URL do NLB do Kong (default: detectado via kubectl)
#               Aceita com ou sem http://
#   ADMIN_CPF — CPF do admin seedado (default: 293.085.420-00)
#
# Pré-requisitos:
#   - kubectl configurado para o cluster EKS (ou KONG_HOST passado como argumento)
#   - jq e curl instalados
set -euo pipefail

KONG_INPUT="${1:-}"
ADMIN_CPF="${2:-293.085.420-00}"

# ── Resolve Kong base URL ─────────────────────────────────────────────────────
if [ -z "$KONG_INPUT" ]; then
  echo "Detectando hostname do Kong via kubectl..."
  KONG_INPUT=$(kubectl get svc -n kong kong-kong-proxy \
    -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)

  if [ -z "$KONG_INPUT" ]; then
    echo "ERRO: Kong NLB hostname não encontrado."
    echo "      Passe o hostname como argumento: $0 <KONG_HOST>"
    exit 1
  fi
fi

# Normaliza: remove trailing slash e garante http:// uma única vez
KONG_INPUT="${KONG_INPUT%/}"
case "$KONG_INPUT" in
  http://*|https://*) BASE_URL="$KONG_INPUT" ;;
  *) BASE_URL="http://${KONG_INPUT}" ;;
esac

echo ""
echo "AutoFlow — Smoke Test"
echo "====================="
echo "Kong     : ${BASE_URL}"
echo "Admin CPF: ${ADMIN_CPF}"
echo ""

# helper: faz curl e captura body + status numa única chamada
# uso: http_call <output_var_body> <output_var_status> <curl_args...>
http_call() {
  local _body_var="$1"; local _status_var="$2"; shift 2
  local _tmpfile
  _tmpfile=$(mktemp)
  local _status
  _status=$(curl -s -o "$_tmpfile" -w "%{http_code}" "$@" --max-time 15 2>/dev/null || echo "000")
  printf -v "$_body_var"   '%s' "$(cat "$_tmpfile")"
  printf -v "$_status_var" '%s' "$_status"
  rm -f "$_tmpfile"
}

# ── 1. Autenticação via Lambda ────────────────────────────────────────────────
echo "=== 1. POST /auth (Lambda) ==="
http_call AUTH_RESPONSE HTTP_STATUS \
  -X POST "${BASE_URL}/auth" \
  -H "Content-Type: application/json" \
  -d "{\"cpf\": \"${ADMIN_CPF}\"}"

echo "  HTTP: ${HTTP_STATUS}"

if [ "$HTTP_STATUS" != "200" ]; then
  echo "  ERRO: autenticação falhou (${HTTP_STATUS})"
  echo "  Resposta: ${AUTH_RESPONSE}"
  exit 1
fi

TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.token')
USER_ROLE=$(echo "$AUTH_RESPONSE" | jq -r '.user.role')
USER_ID=$(echo "$AUTH_RESPONSE" | jq -r '.user.id')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "  ERRO: token não encontrado na resposta"
  echo "  Resposta: ${AUTH_RESPONSE}"
  exit 1
fi

echo "  Role    : ${USER_ROLE}"
echo "  User ID : ${USER_ID}"
echo "  Token   : ${TOKEN:0:40}..."
echo "  OK"

# ── 2. Rota protegida — GET /api/customers ────────────────────────────────────
echo ""
echo "=== 2. GET /api/customers (codebase — ADMIN) ==="
http_call CUSTOMERS_RESPONSE CUSTOMERS_STATUS \
  -X GET "${BASE_URL}/api/customers" \
  -H "Authorization: Bearer ${TOKEN}"

echo "  HTTP: ${CUSTOMERS_STATUS}"

if [ "$CUSTOMERS_STATUS" != "200" ]; then
  echo "  ERRO: rota protegida retornou ${CUSTOMERS_STATUS}"
  echo "  Resposta: ${CUSTOMERS_RESPONSE}"
  exit 1
fi

CUSTOMER_COUNT=$(echo "$CUSTOMERS_RESPONSE" | \
  jq 'if type=="array" then length elif .data then (.data | length) else "?" end' 2>/dev/null || echo "?")
echo "  Customers: ${CUSTOMER_COUNT}"
echo "  OK"

# ── 3. Rota protegida — sem token (deve retornar 401) ─────────────────────────
echo ""
echo "=== 3. GET /api/customers sem token (deve retornar 401) ==="
http_call _BODY UNAUTH_STATUS \
  -X GET "${BASE_URL}/api/customers"

echo "  HTTP: ${UNAUTH_STATUS}"

if [ "$UNAUTH_STATUS" = "401" ]; then
  echo "  OK (401 esperado)"
else
  echo "  AVISO: esperado 401, recebido ${UNAUTH_STATUS}"
fi

# ── Resumo ────────────────────────────────────────────────────────────────────
echo ""
echo "=== Smoke test concluído ==="
echo "Lambda /auth          : OK (${HTTP_STATUS})"
echo "GET /api/customers    : OK (${CUSTOMERS_STATUS})"
echo "Rota sem token        : ${UNAUTH_STATUS}"
