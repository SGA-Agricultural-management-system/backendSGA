# ============== STAGE 1: BUILDER (Alpine es ligero para compilar) ==============
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY src/ ./src/
COPY tsconfig.json ./
RUN npm ci
RUN npx prisma generate --schema=./src/infrastructure/database/prisma/schema.prisma
RUN npm run build

# ============== STAGE 2: PRODUCTION (Debian 11 – incluye libssl1.1) ==============
FROM node:20-bullseye-slim AS production

WORKDIR /app

RUN addgroup --gid 1001 sga && adduser --uid 1001 --gid 1001 --disabled-password --gecos "" sga

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

# ============== STAGE 3: DEVELOPMENT (Debian 11 – idóneo para Prisma) ==============
FROM node:20-bullseye-slim AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY src/infrastructure/database/prisma/schema.prisma ./prisma/
RUN npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 8000
CMD ["npm", "run", "dev"]