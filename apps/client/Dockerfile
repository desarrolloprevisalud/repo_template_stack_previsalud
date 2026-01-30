# apps/client/Dockerfile
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

# ========================================
# STAGE 1: Dependencies
# ========================================
FROM base AS deps

COPY package.json package-lock.json* ./
RUN npm ci

# ========================================
# STAGE 2: Builder
# ========================================
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Build de Next.js (requiere output: 'standalone' en next.config.js)
RUN npm run build

# ========================================
# STAGE 3: Runner (Producción)
# ========================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Copiar archivos standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 4000

ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
