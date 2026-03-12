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
COPY packages/shared-api-client/package.json ./packages/shared-api-client/
COPY packages/shared-hooks/package.json ./packages/shared-hooks/
COPY packages/shared-ui/package.json ./packages/shared-ui/
COPY packages/shared-charts/package.json ./packages/shared-charts/
COPY packages/basel-ui/package.json ./packages/basel-ui/
COPY apps/admin/package.json ./apps/admin/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY apps/admin ./apps/admin
EXPOSE 3200
CMD ["pnpm", "--filter", "@splits-network/admin", "dev"]

# Build stage
FROM base AS build
ARG NEXT_PUBLIC_ADMIN_GATEWAY_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_ADMIN_GATEWAY_URL=$NEXT_PUBLIC_ADMIN_GATEWAY_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Clerk redirect URLs - static values inlined at build time for client-side SDK
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/secure
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/secure
COPY --from=dependencies /app ./
# Copy package source files (needed for Next.js transpilePackages)
COPY packages/shared-types ./packages/shared-types
COPY packages/shared-config ./packages/shared-config
COPY packages/shared-api-client ./packages/shared-api-client
COPY packages/shared-hooks ./packages/shared-hooks
COPY packages/shared-ui ./packages/shared-ui
COPY packages/shared-charts ./packages/shared-charts
COPY packages/basel-ui ./packages/basel-ui
COPY apps/admin ./apps/admin
# Build shared packages first (in dependency order)
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-api-client build
RUN pnpm --filter @splits-network/shared-ui build
RUN pnpm --filter @splits-network/shared-charts build
RUN pnpm --filter @splits-network/basel-ui build
RUN pnpm --filter @splits-network/shared-hooks build
# Then build admin app
RUN pnpm --filter @splits-network/admin build
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
COPY --from=build /app/packages/shared-hooks/package.json ./packages/shared-hooks/
COPY --from=build /app/packages/shared-hooks/dist ./packages/shared-hooks/dist
COPY --from=build /app/packages/shared-ui/package.json ./packages/shared-ui/
COPY --from=build /app/packages/shared-ui/dist ./packages/shared-ui/dist
COPY --from=build /app/packages/shared-charts/package.json ./packages/shared-charts/
COPY --from=build /app/packages/shared-charts/dist ./packages/shared-charts/dist
COPY --from=build /app/packages/basel-ui/package.json ./packages/basel-ui/
COPY --from=build /app/packages/basel-ui/dist ./packages/basel-ui/dist

# App package.json for pnpm filter
COPY --from=build /app/apps/admin/package.json ./apps/admin/

# Copy built artifacts
COPY --from=build /app/apps/admin/.next ./apps/admin/.next
COPY --from=build /app/apps/admin/public ./apps/admin/public
COPY --from=build /app/apps/admin/next.config.mjs ./apps/admin/

EXPOSE 3200
CMD ["pnpm", "--filter", "@splits-network/admin", "start"]
