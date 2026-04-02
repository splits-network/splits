# Development stage
FROM node:22-slim AS development

# Install system dependencies for pdf-parse and pnpm
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm

WORKDIR /app

# Copy monorepo files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./

# Copy service and packages
COPY services/document-processing-service/ ./services/document-processing-service/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared packages for ESM resolution
RUN pnpm --filter @splits-network/shared-config build && pnpm --filter @splits-network/shared-types build && pnpm --filter @splits-network/shared-logging build && pnpm --filter @splits-network/shared-fastify build && pnpm --filter @splits-network/shared-access-context build && pnpm --filter @splits-network/shared-job-queue build

# Expose port
EXPOSE 3008

# Start in development mode with watch
CMD ["pnpm", "--filter", "@splits-network/document-processing-service", "dev"]

# Production stage
FROM node:22-slim AS production

# Install system dependencies for pdf-parse
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm

WORKDIR /app

# Copy monorepo files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./

# Copy service and packages
COPY services/document-processing-service/ ./services/document-processing-service/
COPY packages/ ./packages/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Build shared packages first
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-logging build
RUN pnpm --filter @splits-network/shared-fastify build
RUN pnpm --filter @splits-network/shared-access-context build
RUN pnpm --filter @splits-network/shared-job-queue build

# Then build the service
RUN pnpm --filter @splits-network/document-processing-service build

# Prune to production dependencies after build
RUN pnpm --filter @splits-network/document-processing-service --prod deploy /tmp/pruned

# Copy pruned production files back
RUN rm -rf node_modules && mv /tmp/pruned/node_modules ./node_modules

# Create non-root user
RUN groupadd -r docprocessor && useradd -r -g docprocessor docprocessor

# Create pnpm cache directory with proper permissions before switching user
RUN mkdir -p /home/docprocessor/.local/share/pnpm && \
    chown -R docprocessor:docprocessor /home/docprocessor && \
    chown -R docprocessor:docprocessor /app

USER docprocessor

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3008/health || exit 1

# Expose port
EXPOSE 3008

# Start the service directly with node
CMD ["node", "services/document-processing-service/dist/index.js"]