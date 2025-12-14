# Base stage with Node.js and pnpm
FROM node:20-alpine AS base
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
COPY services/document-service/package.json ./services/document-service/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/document-service ./services/document-service
EXPOSE 3006
CMD ["pnpm", "--filter", "@splits-network/document-service", "dev"]

# Build stage
FROM base AS build
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/document-service ./services/document-service
# Build shared packages first
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-logging build
RUN pnpm --filter @splits-network/shared-fastify build
# Then build service
RUN pnpm --filter @splits-network/document-service build

# Production stage
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app
ENV NODE_ENV=production

# Copy package files for production install
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages/shared-config/package.json ./packages/shared-config/
COPY --from=build /app/packages/shared-fastify/package.json ./packages/shared-fastify/
COPY --from=build /app/packages/shared-logging/package.json ./packages/shared-logging/
COPY --from=build /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=build /app/services/document-service/package.json ./services/document-service/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=build /app/packages/shared-config/dist ./packages/shared-config/dist
COPY --from=build /app/packages/shared-fastify/dist ./packages/shared-fastify/dist
COPY --from=build /app/packages/shared-logging/dist ./packages/shared-logging/dist
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=build /app/services/document-service/dist ./services/document-service/dist

WORKDIR /app/services/document-service
EXPOSE 3006
CMD ["node", "dist/index.js"]
