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
COPY services/onboarding-service/package.json ./services/onboarding-service/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/onboarding-service ./services/onboarding-service
EXPOSE 3023
RUN pnpm --filter @splits-network/shared-config build && pnpm --filter @splits-network/shared-types build && pnpm --filter @splits-network/shared-logging build && pnpm --filter @splits-network/shared-fastify build
CMD ["pnpm", "--filter", "@splits-network/onboarding-service", "dev"]

# Build stage
FROM base AS build
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/onboarding-service ./services/onboarding-service
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-logging build
RUN pnpm --filter @splits-network/shared-fastify build
RUN pnpm --filter @splits-network/onboarding-service build
RUN pnpm install --prod --frozen-lockfile

# Production stage
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared-config/package.json ./packages/shared-config/
COPY --from=build /app/packages/shared-config/dist ./packages/shared-config/dist
COPY --from=build /app/packages/shared-fastify/package.json ./packages/shared-fastify/
COPY --from=build /app/packages/shared-fastify/dist ./packages/shared-fastify/dist
COPY --from=build /app/packages/shared-logging/package.json ./packages/shared-logging/
COPY --from=build /app/packages/shared-logging/dist ./packages/shared-logging/dist
COPY --from=build /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist

COPY --from=build /app/services/onboarding-service/package.json ./services/onboarding-service/
COPY --from=build /app/services/onboarding-service/dist ./services/onboarding-service/dist

EXPOSE 3023
CMD ["node", "services/onboarding-service/dist/index.js"]
