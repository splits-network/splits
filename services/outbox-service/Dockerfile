# Base stage with Node.js and pnpm
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY tsconfig.base.json ./
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-fastify/package.json ./packages/shared-fastify/
COPY packages/shared-job-queue/package.json ./packages/shared-job-queue/
COPY packages/shared-logging/package.json ./packages/shared-logging/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY services/outbox-service/package.json ./services/outbox-service/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/outbox-service ./services/outbox-service
EXPOSE 3013
RUN pnpm --filter @splits-network/shared-config build && pnpm --filter @splits-network/shared-types build && pnpm --filter @splits-network/shared-logging build && pnpm --filter @splits-network/shared-fastify build && pnpm --filter @splits-network/shared-job-queue build
CMD ["pnpm", "--filter", "@splits-network/outbox-service", "dev"]

# Build stage
FROM base AS build
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/outbox-service ./services/outbox-service
# Build shared packages first
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-logging build
RUN pnpm --filter @splits-network/shared-fastify build
RUN pnpm --filter @splits-network/shared-job-queue build
# Then build service
RUN pnpm --filter @splits-network/outbox-service build
# Prune to production dependencies (uses local store, no network)
RUN pnpm install --prod --frozen-lockfile

# Production stage
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Production dependencies from build stage (no network install needed)
COPY --from=build /app/node_modules ./node_modules

# Workspace packages (symlinked from node_modules)
COPY --from=build /app/packages/shared-config/package.json ./packages/shared-config/
COPY --from=build /app/packages/shared-config/dist ./packages/shared-config/dist
COPY --from=build /app/packages/shared-fastify/package.json ./packages/shared-fastify/
COPY --from=build /app/packages/shared-fastify/dist ./packages/shared-fastify/dist
COPY --from=build /app/packages/shared-job-queue/package.json ./packages/shared-job-queue/
COPY --from=build /app/packages/shared-job-queue/dist ./packages/shared-job-queue/dist
COPY --from=build /app/packages/shared-logging/package.json ./packages/shared-logging/
COPY --from=build /app/packages/shared-logging/dist ./packages/shared-logging/dist
COPY --from=build /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist

# Copy built service
COPY --from=build /app/services/outbox-service/package.json ./services/outbox-service/
COPY --from=build /app/services/outbox-service/dist ./services/outbox-service/dist

EXPOSE 3013
CMD ["node", "services/outbox-service/dist/index.js"]
