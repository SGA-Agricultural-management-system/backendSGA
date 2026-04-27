# ============== STAGE 1: BUILDER ==============
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY src/ ./src/
COPY tsconfig.json ./
RUN npm ci
RUN npx prisma generate --schema=./src/infrastructure/database/prisma/schema.prisma
RUN npm run build

# ============== STAGE 2: PRODUCTION ==============
FROM node:20-alpine AS production

# Instalar OpenSSL 1.1 (compatibilidad con Prisma Engine en Alpine)
RUN apk add --no-cache openssl1.1-compat

WORKDIR /app

RUN addgroup -g 1001 -S sga && adduser -S sga -u 1001 -G sga

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

RUN npm ci --omit=dev

ENV PRISMA_SCHEMA_PATH=/app/src/infrastructure/database/prisma/schema.prisma
RUN npx prisma generate --schema=./src/infrastructure/database/prisma/schema.prisma

EXPOSE 8000
USER sga
CMD ["node", "dist/main.js"]

# ============== STAGE 3: DEVELOPMENT ==============
FROM node:20-alpine AS development

# Instalar OpenSSL 1.1 (compatibilidad con Prisma)
RUN apk add --no-cache openssl1.1-compat

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY src/infrastructure/database/prisma/schema.prisma ./prisma/
RUN npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 8000
CMD ["npm", "run", "dev"]