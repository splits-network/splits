# Base stage with Node.js and pnpm
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY tsconfig.base.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-ui/package.json ./packages/shared-ui/
COPY packages/shared-api-client/package.json ./packages/shared-api-client/
COPY packages/basel-ui/package.json ./packages/basel-ui/
COPY packages/shared-video/package.json ./packages/shared-video/
COPY apps/video/package.json ./apps/video/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY apps/video ./apps/video
EXPOSE 3104
CMD ["pnpm", "--filter", "@splits-network/video", "dev"]

# Build stage
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_LIVEKIT_URL
ARG SENTRY_AUTH_TOKEN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_LIVEKIT_URL=$NEXT_PUBLIC_LIVEKIT_URL
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
COPY --from=dependencies /app ./
COPY packages/shared-types ./packages/shared-types
COPY packages/shared-config ./packages/shared-config
COPY packages/shared-api-client ./packages/shared-api-client
COPY packages/shared-ui ./packages/shared-ui
COPY packages/basel-ui ./packages/basel-ui
COPY packages/shared-video ./packages/shared-video
COPY apps/video ./apps/video
# Build shared packages in dependency order
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-api-client build
RUN pnpm --filter @splits-network/shared-ui build
RUN pnpm --filter @splits-network/basel-ui build
RUN pnpm --filter @splits-network/shared-video build
RUN pnpm --filter @splits-network/video build
# Prune to production dependencies (uses local store, no network)
RUN pnpm install --prod --frozen-lockfile

# Production stage
FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app
ENV NODE_ENV=production

# Workspace config for pnpm
COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./

# Production dependencies from build stage (no network install needed)
COPY --from=build /app/node_modules ./node_modules

# Workspace packages (symlinked from node_modules)
COPY --from=build /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=build /app/packages/shared-config/package.json ./packages/shared-config/
COPY --from=build /app/packages/shared-config/dist ./packages/shared-config/dist
COPY --from=build /app/packages/shared-api-client/package.json ./packages/shared-api-client/
COPY --from=build /app/packages/shared-api-client/dist ./packages/shared-api-client/dist
COPY --from=build /app/packages/shared-ui/package.json ./packages/shared-ui/
COPY --from=build /app/packages/shared-ui/dist ./packages/shared-ui/dist
COPY --from=build /app/packages/basel-ui/package.json ./packages/basel-ui/
COPY --from=build /app/packages/basel-ui/dist ./packages/basel-ui/dist
COPY --from=build /app/packages/shared-video/package.json ./packages/shared-video/
COPY --from=build /app/packages/shared-video/dist ./packages/shared-video/dist

# App package.json for pnpm filter
COPY --from=build /app/apps/video/package.json ./apps/video/

# Copy built artifacts
COPY --from=build /app/apps/video/.next ./apps/video/.next
COPY --from=build /app/apps/video/public ./apps/video/public
COPY --from=build /app/apps/video/next.config.mjs ./apps/video/

EXPOSE 3104
CMD ["pnpm", "--filter", "@splits-network/video", "start"]
