#!/bin/sh
set -e

# Se o secret estiver montado pelo Docker Compose/Swarm, exporta como env var
if [ -f /run/secrets/newrelic_license_key ]; then
  export NEW_RELIC_LICENSE_KEY="$(cat /run/secrets/newrelic_license_key)"
fi

# Executa o comando padrão (CMD)
exec "$@"
