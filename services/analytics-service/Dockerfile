# Base stage with Node.js and pnpm
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-fastify/package.json ./packages/shared-fastify/
COPY packages/shared-logging/package.json ./packages/shared-logging/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-access-context/package.json ./packages/shared-access-context/
COPY packages/shared-job-queue/package.json ./packages/shared-job-queue/
COPY services/analytics-service/package.json ./services/analytics-service/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/analytics-service ./services/analytics-service
EXPOSE 3010
CMD ["pnpm", "--filter", "@splits-network/analytics-service", "dev"]

# Build stage
FROM base AS build
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/analytics-service ./services/analytics-service
# Reinstall to ensure workspace links are properly established after copying source
RUN pnpm install --frozen-lockfile
# Build shared packages first in dependency order
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-logging build
RUN pnpm --filter @splits-network/shared-fastify build
RUN pnpm --filter @splits-network/shared-job-queue build
RUN pnpm --filter @splits-network/shared-access-context build
# Then build service
RUN pnpm --filter @splits-network/analytics-service build
# Prune to production dependencies (uses local store, no network)
RUN pnpm install --prod --frozen-lockfile

# Production stage
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Production dependencies from build stage (no network install needed)
COPY --from=build /app/node_modules ./node_modules

# Copy built service
COPY --from=build /app/services/analytics-service/dist ./services/analytics-service/dist

EXPOSE 3010
CMD ["node", "services/analytics-service/dist/index.js"]
