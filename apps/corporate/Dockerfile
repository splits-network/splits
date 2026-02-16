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
COPY packages/memphis-ui ./packages/memphis-ui
COPY apps/corporate ./apps/corporate
# Build shared packages first
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-ui build
RUN pnpm --filter @splits-network/memphis-ui build
# Build corporate site
RUN pnpm --filter @splits-network/corporate build

# Production stage
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app
ENV NODE_ENV=production

# Copy package files for production install
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=build /app/packages/shared-ui/package.json ./packages/shared-ui/
COPY --from=build /app/packages/memphis-ui/package.json ./packages/memphis-ui/
COPY --from=build /app/apps/corporate/package.json ./apps/corporate/
COPY --from=build /app/apps/corporate/next.config.mjs ./apps/corporate/

# Production install (only dependencies, no devDependencies)
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=build /app/packages/shared-ui/dist ./packages/shared-ui/dist
COPY --from=build /app/packages/memphis-ui/dist ./packages/memphis-ui/dist
COPY --from=build /app/apps/corporate/.next ./apps/corporate/.next
COPY --from=build /app/apps/corporate/public ./apps/corporate/public

# Create node_modules symlink for Next.js to find dependencies
RUN ln -s /app/node_modules /app/apps/corporate/node_modules

WORKDIR /app/apps/corporate

EXPOSE 3102
CMD ["pnpm", "start"]
