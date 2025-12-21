# Base stage with Node.js and pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY apps/corporate/package.json ./apps/corporate/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY apps/corporate ./apps/corporate
EXPOSE 3102
CMD ["pnpm", "--filter", "@splits-network/corporate", "dev"]

# Build stage
FROM base AS build
ARG NEXT_PUBLIC_APP_URL
ARG SENTRY_AUTH_TOKEN
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
COPY --from=dependencies /app ./
COPY apps/corporate ./apps/corporate
# Build corporate site
RUN pnpm --filter @splits-network/corporate build

# Production stage
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app
ENV NODE_ENV=production

# Copy package files for production install
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/apps/corporate/package.json ./apps/corporate/
COPY --from=build /app/apps/corporate/next.config.mjs ./apps/corporate/

# Production install (only dependencies, no devDependencies)
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=build /app/apps/corporate/.next ./apps/corporate/.next
COPY --from=build /app/apps/corporate/public ./apps/corporate/public

# Create node_modules symlink for Next.js to find dependencies
RUN ln -s /app/node_modules /app/apps/corporate/node_modules

WORKDIR /app/apps/corporate

EXPOSE 3102
CMD ["pnpm", "start"]
