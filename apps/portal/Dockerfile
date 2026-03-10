# Base stage with Node.js and pnpm
# Force rebuild: 2025-12-21-001
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY tsconfig.base.json ./
COPY packages/shared-api-client/package.json ./packages/shared-api-client/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-ui/package.json ./packages/shared-ui/
COPY packages/shared-hooks/package.json ./packages/shared-hooks/
COPY packages/basel-ui/package.json ./packages/basel-ui/
COPY packages/chat-ui/package.json ./packages/chat-ui/
COPY packages/memphis-ui/package.json ./packages/memphis-ui/
COPY packages/shared-gamification/package.json ./packages/shared-gamification/
COPY packages/shared-video/package.json ./packages/shared-video/
COPY apps/portal/package.json ./apps/portal/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY apps/portal ./apps/portal
EXPOSE 3100
CMD ["pnpm", "--filter", "@splits-network/portal", "dev"]

# Build stage
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CHAT_GATEWAY_URL
ARG NEXT_PUBLIC_CANDIDATE_APP_URL
ARG NEXT_PUBLIC_VIDEO_APP_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG SENTRY_AUTH_TOKEN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CHAT_GATEWAY_URL=$NEXT_PUBLIC_CHAT_GATEWAY_URL
ENV NEXT_PUBLIC_CANDIDATE_APP_URL=$NEXT_PUBLIC_CANDIDATE_APP_URL
ENV NEXT_PUBLIC_VIDEO_APP_URL=$NEXT_PUBLIC_VIDEO_APP_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
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
COPY packages/shared-hooks ./packages/shared-hooks
COPY packages/basel-ui ./packages/basel-ui
COPY packages/chat-ui ./packages/chat-ui
COPY packages/memphis-ui ./packages/memphis-ui
COPY packages/shared-gamification ./packages/shared-gamification
COPY packages/shared-video ./packages/shared-video
COPY apps/portal ./apps/portal
# Copy press content (MDX articles read at runtime by server components)
COPY content ./content
# Build shared packages first (in dependency order - types/config first, then api-client which depends on them)
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-api-client build
RUN pnpm --filter @splits-network/shared-ui build
RUN pnpm --filter @splits-network/shared-hooks build
RUN pnpm --filter @splits-network/basel-ui build
RUN pnpm --filter @splits-network/chat-ui build
RUN pnpm --filter @splits-network/memphis-ui build
RUN pnpm --filter @splits-network/shared-gamification build
RUN pnpm --filter @splits-network/shared-video build
# Then build portal (will transpile packages from source)
RUN pnpm --filter @splits-network/portal build
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
COPY --from=build /app/packages/shared-hooks/package.json ./packages/shared-hooks/
COPY --from=build /app/packages/shared-hooks/dist ./packages/shared-hooks/dist
COPY --from=build /app/packages/basel-ui/package.json ./packages/basel-ui/
COPY --from=build /app/packages/basel-ui/dist ./packages/basel-ui/dist
COPY --from=build /app/packages/chat-ui/package.json ./packages/chat-ui/
COPY --from=build /app/packages/chat-ui/dist ./packages/chat-ui/dist
COPY --from=build /app/packages/memphis-ui/package.json ./packages/memphis-ui/
COPY --from=build /app/packages/memphis-ui/dist ./packages/memphis-ui/dist
COPY --from=build /app/packages/shared-gamification/package.json ./packages/shared-gamification/
COPY --from=build /app/packages/shared-gamification/dist ./packages/shared-gamification/dist
COPY --from=build /app/packages/shared-video/package.json ./packages/shared-video/
COPY --from=build /app/packages/shared-video/dist ./packages/shared-video/dist

# App package.json for pnpm filter
COPY --from=build /app/apps/portal/package.json ./apps/portal/

# Copy built artifacts
COPY --from=build /app/apps/portal/.next ./apps/portal/.next
COPY --from=build /app/apps/portal/public ./apps/portal/public
COPY --from=build /app/apps/portal/next.config.mjs ./apps/portal/

# Press content (MDX articles read at runtime by server components)
COPY --from=build /app/content ./content

EXPOSE 3100
CMD ["pnpm", "--filter", "@splits-network/portal", "start"]
