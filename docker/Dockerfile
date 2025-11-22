ARG NODE_VERSION=20.14.0

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/template

COPY package*.json ./
RUN npm ci --only=production=false

COPY . .

RUN npx prisma generate
RUN npm run build


FROM node:${NODE_VERSION}-alpine AS production

RUN apk add --no-cache curl

WORKDIR /usr/src/template

COPY --from=builder /usr/src/template/node_modules ./node_modules
COPY --from=builder /usr/src/template/dist ./dist
COPY --from=builder /usr/src/template/generated ./generated
COPY --from=builder /usr/src/template/package*.json ./
COPY --from=builder /usr/src/template/prisma ./prisma
COPY --from=builder /usr/src/template/.env ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "-r", "module-alias/register", "dist/index.js"]