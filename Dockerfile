# ============== STAGE 1: BUILDER ==============
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Copiar código fuente completo
COPY src/ ./src/
COPY tsconfig.json ./

# Instalar TODAS las dependencias
RUN npm ci

# Generar cliente Prisma
RUN npx prisma generate --schema=./src/infrastructure/database/prisma/schema.prisma

# Compilar TypeScript a JavaScript
RUN npm run build

# ============== STAGE 2: PRODUCTION ==============
FROM node:20-alpine AS production

WORKDIR /app

# Crear usuario no root
RUN addgroup -g 1001 -S sga && adduser -S sga -u 1001 -G sga

# Copiar archivos necesarios del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

# Instalar SOLO dependencias de producción
RUN npm ci --omit=dev

# Establecer la ruta del schema y regenerar Prisma para producción
ENV PRISMA_SCHEMA_PATH=/app/src/infrastructure/database/prisma/schema.prisma
RUN npx prisma generate --schema=./src/infrastructure/database/prisma/schema.prisma

EXPOSE 8000
USER sga
CMD ["node", "dist/main.js"]

# ============== STAGE 3: DEVELOPMENT ==============
FROM node:20-alpine AS development

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluye devDependencies como tsx)
RUN npm ci

# Copiar el schema de Prisma para generar el cliente
COPY src/infrastructure/database/prisma/schema.prisma ./prisma/
RUN npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 8000

# Comando por defecto para desarrollo (iniciar con tsx watch)
CMD ["npm", "run", "dev"]