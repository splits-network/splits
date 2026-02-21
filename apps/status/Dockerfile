# Base stage with Node.js and pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-ui/package.json ./packages/shared-ui/
COPY packages/basel-ui/package.json ./packages/basel-ui/
COPY apps/status/package.json ./apps/status/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY apps/status ./apps/status
EXPOSE 3103
CMD ["pnpm", "--filter", "@splits-network/status", "dev"]

# Build stage
FROM base AS build
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_GATEWAY_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL
COPY --from=dependencies /app ./
COPY packages/shared-types ./packages/shared-types
COPY packages/shared-ui ./packages/shared-ui
COPY packages/basel-ui ./packages/basel-ui
COPY apps/status ./apps/status
# Build shared packages first
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-ui build
RUN pnpm --filter @splits-network/basel-ui build
# Build status app
RUN pnpm --filter @splits-network/status build

# Production stage
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app
ENV NODE_ENV=production

# Copy package files for production install
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=build /app/packages/shared-ui/package.json ./packages/shared-ui/
COPY --from=build /app/packages/basel-ui/package.json ./packages/basel-ui/
COPY --from=build /app/apps/status/package.json ./apps/status/
COPY --from=build /app/apps/status/next.config.mjs ./apps/status/

# Production install (only dependencies, no devDependencies)
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=build /app/packages/shared-ui/dist ./packages/shared-ui/dist
COPY --from=build /app/packages/basel-ui/dist ./packages/basel-ui/dist
COPY --from=build /app/apps/status/.next ./apps/status/.next
COPY --from=build /app/apps/status/public ./apps/status/public

# Create node_modules symlink for Next.js to find dependencies
RUN ln -s /app/node_modules /app/apps/status/node_modules

WORKDIR /app/apps/status

EXPOSE 3103
CMD ["pnpm", "start"]
