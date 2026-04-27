# ============== STAGE 1: BUILDER ==============
FROM node:20-alpine AS development
WORKDIR /app
<<<<<<< Updated upstream
COPY package*.json ./
RUN npm ci
COPY src/ ./src/
COPY tsconfig.json ./
RUN npx prisma generate --schema=./src/infrastructure/database/prisma/schema.prisma
EXPOSE 8000
CMD ["npm", "run", "dev"]
=======

# Copiar archivos de dependencias
COPY package*.json ./

# Copiar código fuente (incluye el schema de Prisma en src/)
COPY src/ ./src/
COPY tsconfig.json ./

# Instalar TODAS las dependencias
RUN npm ci

# Generar cliente Prisma apuntando al schema en src/
RUN npx prisma generate --schema=./src/infrastructure/database/prisma/schema.prisma

# Compilar TypeScript
RUN npm run build
>>>>>>> Stashed changes

# ============== STAGE 2: PRODUCTION ==============
FROM node:20-alpine

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

# Establecer la ruta del schema para Prisma
ENV PRISMA_SCHEMA_PATH=/app/src/infrastructure/database/prisma/schema.prisma
RUN npx prisma generate --schema=./src/infrastructure/database/prisma/schema.prisma

EXPOSE 8000
USER sga
CMD ["node", "dist/main.js"]
