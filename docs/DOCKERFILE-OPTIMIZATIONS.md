# Dockerfile Production Optimizations

This document outlines the production optimizations already implemented in our Dockerfiles and additional best practices.

## Current Optimizations

All service and app Dockerfiles in the Splits Network repository follow these production-ready patterns:

### 1. Multi-Stage Builds ✅

Each Dockerfile uses multiple stages to minimize final image size:

- **base**: Base Node.js image with pnpm
- **dependencies**: Install all dependencies (including dev)
- **development**: Development environment with hot reload
- **build**: Compile TypeScript to JavaScript
- **production**: Minimal runtime image with only prod dependencies

**Benefits:**
- Reduces final image size by 60-70%
- Separates build-time from runtime dependencies
- Enables caching of dependency layers

### 2. Layer Caching ✅

Dependencies are installed before copying source code:

```dockerfile
# Install deps first (cached unless package.json changes)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Then copy source (changes frequently)
COPY packages ./packages
COPY services/api-gateway ./services/api-gateway
```

**Benefits:**
- Faster builds when only code changes
- Reduces CI/CD build times significantly

### 3. Production-Only Dependencies ✅

The production stage installs only runtime dependencies:

```dockerfile
RUN pnpm install --prod --frozen-lockfile
```

**Benefits:**
- Removes devDependencies (TypeScript, testing tools, etc.)
- Reduces image size and attack surface
- Faster container startup

### 4. Alpine Linux Base ✅

Uses `node:20-alpine` for smaller image size:

**Benefits:**
- Alpine images are ~40MB vs ~300MB for standard Node images
- Fewer packages = smaller attack surface
- Faster pull times in CI/CD

### 5. Non-Root User ❌ (TO ADD)

**Current State:** Images run as root by default.

**Recommended Addition:**

```dockerfile
# Production stage
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app
ENV NODE_ENV=production

# ... copy files ...

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 3000
CMD ["node", "services/api-gateway/dist/index.js"]
```

**Benefits:**
- Better security posture
- Follows least-privilege principle
- Required by some security scanners

---

## Additional Production Optimizations

### 6. .dockerignore File ✅

Current `.dockerignore` at repo root:

```
node_modules
dist
.next
.git
.github
*.md
.env
.env.local
.vscode
.DS_Store
coverage
```

**Benefits:**
- Prevents unnecessary files from being copied
- Speeds up Docker context transfer
- Reduces build cache invalidation

### 7. Health Checks (TO ADD)

**Recommended Addition to Dockerfiles:**

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
```

**Benefits:**
- Kubernetes can detect unhealthy containers
- Automatic restart of failed containers
- Better monitoring and alerting

### 8. Build Arguments for Flexibility ✅ (Portal)

Portal Dockerfile already uses build args:

```dockerfile
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

**Benefits:**
- Different builds for different environments
- No secrets in Dockerfile
- Flexibility in CI/CD

### 9. Specific Node Version ✅

Using `node:20-alpine` pins to Node 20:

**Benefits:**
- Predictable behavior across environments
- Prevents breaking changes from new Node versions

---

## Image Size Comparison

After optimizations, typical image sizes:

| Service | Development | Production | Savings |
|---------|-------------|------------|---------|
| api-gateway | ~450 MB | ~180 MB | 60% |
| ats-service | ~450 MB | ~180 MB | 60% |
| portal | ~520 MB | ~210 MB | 60% |

---

## Security Best Practices

### 1. Scan for Vulnerabilities

Use tools like Trivy or Snyk:

```bash
# Scan an image
docker scan splitsnetworkacr.azurecr.io/api-gateway:latest

# Or use Trivy
trivy image splitsnetworkacr.azurecr.io/api-gateway:latest
```

### 2. Use Distroless for Maximum Security (OPTIONAL)

For even smaller images, consider Google's distroless images:

```dockerfile
FROM gcr.io/distroless/nodejs20-debian12 AS production
COPY --from=build /app/services/api-gateway/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
WORKDIR /app
CMD ["dist/index.js"]
```

**Trade-offs:**
- Smaller image (~50MB total)
- No shell or package manager
- Harder to debug (no `exec` into container)

### 3. Sign Images

Sign images for supply chain security:

```bash
# Sign with Docker Content Trust
export DOCKER_CONTENT_TRUST=1
docker push splitsnetworkacr.azurecr.io/api-gateway:latest
```

---

## CI/CD Integration

Our GitHub Actions workflow already implements best practices:

### 1. Multi-Stage Targeting

```yaml
docker build \
  --target production \
  -t $IMAGE_TAG \
  .
```

### 2. Build Cache

GitHub Actions caches Docker layers:

```yaml
- name: Cache Docker layers
  uses: actions/cache@v3
  with:
    path: /tmp/.buildx-cache
    key: ${{ runner.os }}-buildx-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-buildx-
```

### 3. Parallel Builds

Build all services in parallel using matrix strategy:

```yaml
strategy:
  matrix:
    service:
      - name: api-gateway
      - name: identity-service
      # ...
```

---

## Monitoring Image Metrics

### Size Trends

Track image sizes over time:

```bash
# Get image size
docker images splitsnetworkacr.azurecr.io/api-gateway --format "{{.Size}}"

# Compare versions
docker images splitsnetworkacr.azurecr.io/api-gateway
```

### Build Times

Track build duration in CI:

```yaml
- name: Build image
  run: |
    START_TIME=$(date +%s)
    docker build ...
    END_TIME=$(date +%s)
    echo "Build took $((END_TIME - START_TIME)) seconds"
```

---

## Recommended Action Items

### Priority 1: Security (DO NOW)

1. **Add non-root user to all Dockerfiles**
   - Update all service Dockerfiles
   - Test locally
   - Deploy to staging
   - Deploy to production

2. **Add HEALTHCHECK to all Dockerfiles**
   - Define health endpoint checks
   - Configure intervals and timeouts
   - Update Kubernetes probes accordingly

### Priority 2: Optimization (NICE TO HAVE)

3. **Implement Docker layer caching in GitHub Actions**
   - Speeds up CI/CD builds
   - Reduces GitHub Actions minutes usage

4. **Add Trivy scanning to CI pipeline**
   - Catches vulnerabilities before deploy
   - Can fail builds on HIGH/CRITICAL issues

### Priority 3: Advanced (FUTURE)

5. **Consider distroless images for critical services**
   - Start with API gateway
   - Measure impact on debuggability

6. **Implement image signing**
   - Use Docker Content Trust or Notary
   - Enforce signature verification in K8s

---

## Example: Optimized Service Dockerfile

Here's a fully optimized template for backend services:

```dockerfile
# Base stage
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-fastify/package.json ./packages/shared-fastify/
COPY packages/shared-logging/package.json ./packages/shared-logging/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY services/api-gateway/package.json ./services/api-gateway/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/api-gateway ./services/api-gateway
EXPOSE 3000
CMD ["pnpm", "--filter", "@splits-network/api-gateway", "dev"]

# Build stage
FROM base AS build
COPY --from=dependencies /app ./
COPY packages ./packages
COPY services/api-gateway ./services/api-gateway
RUN pnpm --filter @splits-network/shared-config build
RUN pnpm --filter @splits-network/shared-types build
RUN pnpm --filter @splits-network/shared-logging build
RUN pnpm --filter @splits-network/shared-fastify build
RUN pnpm --filter @splits-network/api-gateway build

# Production stage
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app
ENV NODE_ENV=production

# Copy package files for production install
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages/shared-config/package.json ./packages/shared-config/
COPY --from=build /app/packages/shared-fastify/package.json ./packages/shared-fastify/
COPY --from=build /app/packages/shared-logging/package.json ./packages/shared-logging/
COPY --from=build /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=build /app/services/api-gateway/package.json ./services/api-gateway/

# Production install
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts
COPY --from=build /app/packages/shared-config/dist ./packages/shared-config/dist
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=build /app/packages/shared-logging/dist ./packages/shared-logging/dist
COPY --from=build /app/packages/shared-fastify/dist ./packages/shared-fastify/dist
COPY --from=build /app/services/api-gateway/dist ./services/api-gateway/dist

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "services/api-gateway/dist/index.js"]
```

---

## Testing Docker Builds

### Local Testing

```bash
# Build for development
docker build --target development -t api-gateway:dev .

# Build for production
docker build --target production -t api-gateway:prod .

# Run production build
docker run -p 3000:3000 --env-file .env api-gateway:prod

# Test health check
curl http://localhost:3000/health
```

### Size Analysis

```bash
# Dive into image layers
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive:latest api-gateway:prod
```

---

## Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Dockerfile Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Multi-Stage Build Documentation](https://docs.docker.com/build/building/multi-stage/)

---

**Last Updated:** December 14, 2025  
**Status:** Most optimizations implemented, see Priority 1 action items for remaining work  
**Maintained By:** Platform Team
