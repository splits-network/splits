FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/candidate/package.json ./apps/candidate/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/candidate/node_modules ./apps/candidate/node_modules
COPY --from=deps /app/packages ./packages
COPY apps/candidate ./apps/candidate
COPY tsconfig.base.json ./

WORKDIR /app/apps/candidate

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/candidate/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/candidate/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/candidate/.next/static ./apps/candidate/.next/static

USER nextjs

EXPOSE 3101

ENV PORT=3101
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/candidate/server.js"]
