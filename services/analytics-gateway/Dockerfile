# Base stage with Node.js and pnpm
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY tsconfig.base.json ./
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logging/package.json ./packages/shared-logging/
COPY services/analytics-gateway/package.json ./services/analytics-gateway/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/analytics-gateway ./services/analytics-gateway
EXPOSE 3025
RUN pnpm --filter @splits-network/shared-config build && pnpm --filter @splits-network/shared-logging build
CMD ["pnpm", "--filter", "@splits-network/analytics-gateway", "dev"]

# Build stage
FROM base AS build
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/analytics-gateway ./services/analytics-gateway
# Build shared packages first
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-logging build
RUN pnpm --filter @splits-network/analytics-gateway build
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
COPY --from=build /app/packages/shared-logging/package.json ./packages/shared-logging/
COPY --from=build /app/packages/shared-logging/dist ./packages/shared-logging/dist

# Copy built service
COPY --from=build /app/services/analytics-gateway/package.json ./services/analytics-gateway/
COPY --from=build /app/services/analytics-gateway/dist ./services/analytics-gateway/dist

EXPOSE 3025
CMD ["node", "services/analytics-gateway/dist/index.js"]
