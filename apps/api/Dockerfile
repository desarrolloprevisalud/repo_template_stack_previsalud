# apps/api/Dockerfile
FROM node:22-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

# ========================================
# STAGE 1: Dependencies
# ========================================
FROM base AS deps

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluye devDependencies para build)
RUN npm ci --only=production=false

# ========================================
# STAGE 2: Builder
# ========================================
FROM base AS builder

WORKDIR /usr/src/app

# Copiar dependencias desde deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# ========================================
# STAGE 3: Runner (Producción)
# ========================================
FROM base AS runner

WORKDIR /usr/src/app

# Configurar Node para producción
ENV NODE_ENV=production

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copiar dependencias de producción
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/node_modules ./node_modules

# Copiar código compilado
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/dist ./dist

# Copiar package.json
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/package*.json ./

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "dist/main.js"]
