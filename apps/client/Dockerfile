# apps/client/Dockerfile

# ============================================
# ARGUMENTOS DE BUILD
# ============================================
ARG NODE_VERSION=22

# ============================================
# BASE IMAGE
# ============================================
FROM node:${NODE_VERSION}-alpine AS base

# Zona horaria
ENV TZ=America/Bogota
RUN apk add --no-cache tzdata && \
  ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && \
  echo $TZ > /etc/timezone

RUN apk add --no-cache libc6-compat

WORKDIR /app

# ============================================
# DEPENDENCIES STAGE
# ============================================
FROM base AS dependencies

COPY package.json package-lock.json* ./
RUN npm ci

# ============================================
# DEVELOPMENT STAGE
# ============================================
FROM base AS development

WORKDIR /app

# Copiar dependencias
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Exponer puerto
EXPOSE 4000

# Comando para desarrollo (hot reload)
CMD ["npm", "run", "dev"]

# ============================================
# BUILD STAGE (Para producción)
# ============================================
FROM base AS builder

WORKDIR /app

# Copiar dependencias
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Variables de build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build de Next.js (requiere output: 'standalone' en next.config.js)
RUN npm run build

# ============================================
# PRODUCTION STAGE
# ============================================
FROM base AS production

WORKDIR /app

# Variables de entorno
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

# ============================================
# DESARROLLO
# ============================================

### Construir imagen de desarrollo
# docker build -t bonnadona-hub-front-dev:latest \
#   --target development \
#   -f apps/client/Dockerfile \
#   ./apps/client

### Ejecutar en desarrollo (con hot reload)
# docker run -p 4001:4000 \
#   -v $(pwd)/apps/client:/app \
#   -v /app/node_modules \
#   -v /app/.next \
#   --name frontend-dev \
#   bonnadona-hub-front-dev:latest

# ============================================
# PRODUCCIÓN
# ============================================

### Construir imagen de producción
# docker build -t bonnadona-hub-front-prod:1.0.0 \
#   --target production \
#   -f apps/client/Dockerfile \
#   ./apps/client

### Ejecutar en producción
# docker run -p 4001:4000 \
#   --env-file .env.production \
#   --name frontend-prod \
#   bonnadona-hub-front-prod:1.0.0
