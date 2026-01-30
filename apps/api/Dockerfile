# apps/api/Dockerfile

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

# Instalar herramientas necesarias
RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

# ============================================
# DEPENDENCIES STAGE
# ============================================
FROM base AS dependencies

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (dev + prod)
RUN npm ci

# ============================================
# DEVELOPMENT STAGE
# ============================================
FROM base AS development

WORKDIR /usr/src/app

# Copiar dependencias
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Comando para desarrollo (hot reload)
CMD ["npm", "run", "start:dev"]

# ============================================
# BUILD STAGE (Para producción)
# ============================================
FROM base AS builder

WORKDIR /usr/src/app

# Copiar dependencias
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# ============================================
# PRODUCTION STAGE
# ============================================
FROM base AS production

WORKDIR /usr/src/app

# Variables de entorno
ENV NODE_ENV=production
ENV TZ=America/Bogota
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Crear usuario no-root
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

# ============================================
# DESARROLLO
# ============================================

# Construir imagen de desarrollo
# docker build -t app-name-back-dev:latest \
#   --target development \
#   -f apps/api/Dockerfile \
#   ./apps/api

### Ejecutar en desarrollo (con hot reload)
# docker run -p 3001:3000 \
#   -v $(pwd)/apps/api:/usr/src/app \
#   -v /usr/src/app/node_modules \
#   --name backend-dev \
#   app-name-back-dev:latest

# ============================================
# PRODUCCIÓN
# ============================================

### Construir imagen de producción
# docker build -t app-name-back-prod:1.0.0 \
#   --target production \
#   -f apps/api/Dockerfile \
#   ./apps/api

### Ejecutar en producción
# docker run -p 3001:3000 \
#   --env-file .env.production \
#   --name backend-prod \
#   app-name-back-prod:1.0.0
