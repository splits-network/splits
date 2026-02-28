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
COPY packages/shared-logging/package.json ./packages/shared-logging/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-access-context/package.json ./packages/shared-access-context/
COPY services/gpt-service/package.json ./services/gpt-service/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/gpt-service ./services/gpt-service
EXPOSE 3014
CMD ["pnpm", "--filter", "@splits-network/gpt-service", "dev"]

# Build stage
FROM base AS build
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/gpt-service ./services/gpt-service
# Build shared packages first
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-logging build
RUN pnpm --filter @splits-network/shared-fastify build
RUN pnpm --filter @splits-network/shared-access-context build
RUN pnpm --filter @splits-network/gpt-service build
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
COPY --from=build /app/packages/shared-logging/package.json ./packages/shared-logging/
COPY --from=build /app/packages/shared-logging/dist ./packages/shared-logging/dist
COPY --from=build /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=build /app/packages/shared-access-context/package.json ./packages/shared-access-context/
COPY --from=build /app/packages/shared-access-context/dist ./packages/shared-access-context/dist

# Copy built service
COPY --from=build /app/services/gpt-service/dist ./services/gpt-service/dist
COPY --from=build /app/services/gpt-service/src/openapi.yaml ./services/gpt-service/dist/openapi.yaml
COPY --from=build /app/services/gpt-service/src/v2/mcp/widgets/*.html ./services/gpt-service/dist/v2/mcp/widgets/

EXPOSE 3014
CMD ["node", "services/gpt-service/dist/index.js"]
