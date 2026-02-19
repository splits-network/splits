# Base stage with Node.js and pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY packages/shared-api-client/package.json ./packages/shared-api-client/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-ui/package.json ./packages/shared-ui/
COPY packages/basel-ui/package.json ./packages/basel-ui/
COPY packages/memphis-ui/package.json ./packages/memphis-ui/
COPY apps/candidate/package.json ./apps/candidate/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY apps/candidate ./apps/candidate
EXPOSE 3101
CMD ["pnpm", "--filter", "@splits-network/candidate", "dev"]

# Build stage
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_GATEWAY_URL
ARG NEXT_PUBLIC_CHAT_GATEWAY_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG SENTRY_AUTH_TOKEN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL
ENV NEXT_PUBLIC_CHAT_GATEWAY_URL=$NEXT_PUBLIC_CHAT_GATEWAY_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
# Clerk redirect URLs - static values inlined at build time for client-side SDK
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/portal/dashboard
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/portal/dashboard
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/portal/dashboard
ENV NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/portal/dashboard
COPY --from=dependencies /app ./
# Copy package source files (needed for Next.js transpilePackages)
COPY packages/shared-api-client ./packages/shared-api-client
COPY packages/shared-config ./packages/shared-config
COPY packages/shared-types ./packages/shared-types
COPY packages/shared-ui ./packages/shared-ui
COPY packages/basel-ui ./packages/basel-ui
COPY packages/memphis-ui ./packages/memphis-ui
COPY apps/candidate ./apps/candidate
# Build shared packages first (in dependency order - types/config first, then api-client which depends on them)
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-api-client build
RUN pnpm --filter @splits-network/shared-ui build
RUN pnpm --filter @splits-network/basel-ui build
RUN pnpm --filter @splits-network/memphis-ui build
# Then build candidate (will transpile packages from source)
RUN pnpm --filter @splits-network/candidate build

# Production stage
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app
ENV NODE_ENV=production

# Copy package files for production install
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages/shared-api-client/package.json ./packages/shared-api-client/
COPY --from=build /app/packages/shared-config/package.json ./packages/shared-config/
COPY --from=build /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=build /app/packages/shared-ui/package.json ./packages/shared-ui/
COPY --from=build /app/packages/basel-ui/package.json ./packages/basel-ui/
COPY --from=build /app/packages/memphis-ui/package.json ./packages/memphis-ui/
COPY --from=build /app/apps/candidate/package.json ./apps/candidate/

# Production install (only dependencies, no devDependencies)
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts
COPY --from=build /app/packages/shared-api-client/dist ./packages/shared-api-client/dist
COPY --from=build /app/packages/shared-config/dist ./packages/shared-config/dist
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=build /app/packages/shared-ui/dist ./packages/shared-ui/dist
COPY --from=build /app/packages/basel-ui/dist ./packages/basel-ui/dist
COPY --from=build /app/packages/memphis-ui/dist ./packages/memphis-ui/dist
COPY --from=build /app/apps/candidate/.next ./apps/candidate/.next
COPY --from=build /app/apps/candidate/public ./apps/candidate/public
COPY --from=build /app/apps/candidate/next.config.mjs ./apps/candidate/

EXPOSE 3101
CMD ["pnpm", "--filter", "@splits-network/candidate", "start"]
