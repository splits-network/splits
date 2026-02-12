# Base stage with Node.js and pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
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
CMD ["pnpm", "--filter", "@splits-network/analytics-gateway", "dev"]

# Build stage
FROM base AS build
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/analytics-gateway ./services/analytics-gateway
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-logging build
RUN pnpm --filter @splits-network/analytics-gateway build

# Production stage
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages/shared-config/package.json ./packages/shared-config/
COPY --from=build /app/packages/shared-logging/package.json ./packages/shared-logging/
COPY --from=build /app/services/analytics-gateway/package.json ./services/analytics-gateway/

RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/packages/shared-config/dist ./packages/shared-config/dist
COPY --from=build /app/packages/shared-logging/dist ./packages/shared-logging/dist
COPY --from=build /app/services/analytics-gateway/dist ./services/analytics-gateway/dist

EXPOSE 3025
CMD ["node", "services/analytics-gateway/dist/index.js"]
