FROM node:20-slim

# Install system dependencies for pdf-parse and pnpm
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src/ ./src/

# Build the application
RUN pnpm build

# Create non-root user
RUN groupadd -r docprocessor && useradd -r -g docprocessor docprocessor
RUN chown -R docprocessor:docprocessor /app
USER docprocessor

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3006/health || exit 1

# Expose port
EXPOSE 3006

# Start the service
CMD ["pnpm", "start"]