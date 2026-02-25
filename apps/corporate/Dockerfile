# Base stage with Node.js and pnpm
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY tsconfig.base.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-ui/package.json ./packages/shared-ui/
COPY packages/basel-ui/package.json ./packages/basel-ui/
COPY packages/memphis-ui/package.json ./packages/memphis-ui/
COPY apps/corporate/package.json ./apps/corporate/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY apps/corporate ./apps/corporate
EXPOSE 3102
CMD ["pnpm", "--filter", "@splits-network/corporate", "dev"]

# Build stage
FROM base AS build
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
COPY --from=dependencies /app ./
COPY packages/shared-types ./packages/shared-types
COPY packages/shared-ui ./packages/shared-ui
COPY packages/basel-ui ./packages/basel-ui
COPY packages/memphis-ui ./packages/memphis-ui
COPY apps/corporate ./apps/corporate
# Reinstall to ensure workspace links are properly established after copying source
RUN pnpm install --frozen-lockfile
# Build shared packages first
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-ui build
RUN pnpm --filter @splits-network/basel-ui build
RUN pnpm --filter @splits-network/memphis-ui build
# Build corporate site
RUN pnpm --filter @splits-network/corporate build
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

# App package.json for pnpm filter
COPY --from=build /app/apps/corporate/package.json ./apps/corporate/

# Copy built artifacts
COPY --from=build /app/apps/corporate/.next ./apps/corporate/.next
COPY --from=build /app/apps/corporate/public ./apps/corporate/public
COPY --from=build /app/apps/corporate/next.config.mjs ./apps/corporate/

# Create node_modules symlink for Next.js to find dependencies
RUN ln -s /app/node_modules /app/apps/corporate/node_modules

WORKDIR /app/apps/corporate

EXPOSE 3102
CMD ["pnpm", "start"]
