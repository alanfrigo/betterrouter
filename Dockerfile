# syntax=docker/dockerfile:1.7
ARG NODE_IMAGE=node:22-bookworm-slim
ARG NPM_REGISTRY=https://registry.npmjs.org/
ARG APP_VERSION=unknown

FROM ${NODE_IMAGE} AS base
WORKDIR /app


FROM base AS builder
ARG NPM_REGISTRY

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install \
      --registry="${NPM_REGISTRY}" \
      --fetch-retries=5 \
      --fetch-retry-factor=2 \
      --fetch-retry-mintimeout=10000 \
      --fetch-retry-maxtimeout=120000 \
      --fetch-timeout=300000

COPY . ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM ${NODE_IMAGE} AS runner
ARG APP_VERSION
WORKDIR /app


LABEL org.opencontainers.image.title="betterrouter" \
      org.opencontainers.image.version="${APP_VERSION}"

ENV NODE_ENV=production
ENV PORT=20128
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATA_DIR=/app/data
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright
ENV HOME=/home/node

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/custom-server.js ./custom-server.js
COPY --from=builder /app/open-sse ./open-sse
# Next file tracing can omit sibling files; MITM runs server.js as a separate process.
COPY --from=builder /app/src/mitm ./src/mitm
# Standalone node_modules may omit deps only required by the MITM child process.
COPY --from=builder /app/node_modules/node-forge ./node_modules/node-forge
# Ensure `next` is available at runtime in case tracing did not include it.
COPY --from=builder /app/node_modules/next ./node_modules/next
# sql.js loads dist/sql-wasm.wasm by path at runtime; tracing only follows JS imports,
# so the last-resort DB driver would abort with ENOENT on the missing binary.
COPY --from=builder /app/node_modules/sql.js ./node_modules/sql.js
# node-machine-id is createRequire-loaded at runtime; tracing omits it.
COPY --from=builder /app/node_modules/node-machine-id ./node_modules/node-machine-id
# Browser CLI/assets and dynamically loaded native bindings are not fully traced.
COPY --from=builder /app/node_modules/playwright ./node_modules/playwright
COPY --from=builder /app/node_modules/playwright-core ./node_modules/playwright-core
COPY --from=builder /app/node_modules/wreq-js ./node_modules/wreq-js
COPY --from=builder /app/node_modules/@wreq-js ./node_modules/@wreq-js
COPY --from=builder /app/node_modules/tiktoken ./node_modules/tiktoken
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/node_modules/@img ./node_modules/@img

RUN apt-get update && apt-get install -y --no-install-recommends gosu ca-certificates && \
    node node_modules/playwright/cli.js install --with-deps chromium && \
    rm -rf /var/lib/apt/lists/* && chmod -R a+rX /opt/playwright && \
    mkdir -p /app/data /app/data-home && chown -R node:node /app && \
    ln -s /app/data-home /home/node/.9router && \
    ln -s /app/data-home /root/.9router && \
    printf '#!/bin/sh\nset -e\nchown -R node:node /app/data /app/data-home\nexec gosu node "$@"\n' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

EXPOSE 20128

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "custom-server.js"]
