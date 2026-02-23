# ---------- Builder ----------
FROM node:24-alpine3.22 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ---------- Runtime ----------
FROM node:24-alpine3.22 AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_LICENSE_KEY=${NEW_RELIC_LICENSE_KEY}
ENV NEW_RELIC_APP_NAME="core-monitoring-logs"
ENV NEW_RELIC_LOG=stdout
ENV NEW_RELIC_LOG_LEVEL=info
ENV NEW_RELIC_AGENT_ENABLED=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_APPLICATION_LOGGING_ENABLED=true
ENV NEW_RELIC_APPLICATION_LOGGING_FORWARDING_ENABLED=true
ENV NEW_RELIC_APPLICATION_LOGGING_METRICS_ENABLED=true
ENV NEW_RELIC_APPLICATION_LOGGING_LOCAL_DECORATING_ENABLED=false
ENV NEW_RELIC_APPLICATION_LOGGING_FORWARDING_MAX_SAMPLE_STORED=1000
ENV LOG_LEVEL=info
ENV NODE_OPTIONS=--max-old-space-size=2048


COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

RUN mkdir -p /usr/src/app/logs

COPY docker-entrypoint.sh /usr/src/app/docker-entrypoint.sh
RUN chmod +x /usr/src/app/docker-entrypoint.sh

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["sh", "/usr/src/app/docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
