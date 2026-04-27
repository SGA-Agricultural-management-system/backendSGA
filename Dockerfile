# ============== STAGE 1: BUILDER ==============
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src/
COPY tsconfig.json ./
RUN npx prisma generate --schema=./src/infrastructure/database/prisma/schema.prisma
EXPOSE 8000
CMD ["npm", "run", "dev"]

# ============== STAGE 2: PRODUCTION ==============
FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S sga && adduser -S sga -u 1001 -G sga

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/infrastructure/database/prisma/schema.prisma ./prisma/

RUN npm ci --omit=dev
ENV PRISMA_SCHEMA_PATH=/app/src/infrastructure/database/prisma/schema.prisma
RUN npx prisma generate --schema=./src/infrastructure/database/prisma/schema.prisma

EXPOSE 8000
USER sga
CMD ["node", "dist/main.js"]