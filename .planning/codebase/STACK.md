# Technology Stack

**Analysis Date:** 2026-01-31

## Languages

**Primary:**
- TypeScript 5.9.3 - All backend services, frontend apps, and shared packages

**Secondary:**
- JavaScript - Package scripts and build automation
- SQL - Database migrations and Supabase schema definitions

## Runtime

**Environment:**
- Node.js 20.0.0 or higher
- Runs in Docker containers for services, Next.js embedded for frontend apps

**Package Manager:**
- pnpm 9.14.4
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Frontend:**
- Next.js 16.1.0 (App Router) - `apps/portal`, `apps/candidate`, `apps/corporate`
- React 19.2.1 - UI component framework
- TailwindCSS 4.1.17 - Utility-first CSS styling
- DaisyUI 5.5.8 - Component library on top of TailwindCSS

**Backend:**
- Fastify 5.6.2 - Core HTTP server framework for all backend services
- @fastify/swagger 9.5.0 - OpenAPI/Swagger documentation
- @fastify/swagger-ui 5.2.3 - Swagger UI for API documentation
- @fastify/http-proxy 11.4.1 - HTTP proxying for API Gateway
- @fastify/multipart 9.0.1 - File upload handling
- @fastify/oauth2 8.1.0 - OAuth2 authentication support
- @fastify/rate-limit 10.1.1 - Rate limiting for API Gateway

**Animation & UI:**
- GSAP 3.14.2 - Advanced animation library
- @gsap/react 2.1.2 - React wrapper for GSAP
- chart.js 4.5.1 - Data visualization
- react-chartjs-2 5.3.1 - React bindings for Chart.js
- @uiw/react-md-editor 4.0.0 - Markdown editor component
- @uiw/react-markdown-preview 5.1.5 - Markdown preview component

**Testing:**
- Vitest 3.0.0 - Unit testing framework (`identity-service` only currently)
- @vitest/coverage-v8 3.0.0 - Code coverage reporting

**Build/Dev Tools:**
- tsx 4.19.2 - TypeScript execution and file watching for development
- TypeScript Compiler (tsc) - Builds with TypeScript project references (-b flag)

## Key Dependencies

**Critical Infrastructure:**
- @supabase/supabase-js 2.47.10 - 2.86.2 - Supabase client for database and auth operations
- amqplib 0.10.3 - 0.10.9 - RabbitMQ client for event messaging
- ioredis 5.8.2 - Redis client for API Gateway caching (api-gateway only)

**Authentication & Authorization:**
- @clerk/backend 2.4.0 - Clerk backend SDK for identity verification
- @clerk/nextjs 6.36.5 - Clerk integration for Next.js
- jsonwebtoken 9.0.2 - JWT token handling for API Gateway
- svix 1.40.0 - Clerk webhook verification (`identity-service`)

**Payment & Billing:**
- stripe 20.0.0 - Stripe API client for payment processing (`billing-service`)
- @stripe/stripe-js 8.6.4 - Stripe client library for frontend
- @stripe/react-stripe-js 5.5.0 - React components for Stripe integration

**Email & Notifications:**
- resend 6.5.2 - Email service API for transactional emails (`notification-service`)

**AI & ML:**
- openai 4.82.1 - OpenAI API client for AI-powered features (`ai-service`)

**Observability & Monitoring:**
- @sentry/node 10.32.1 - Sentry error tracking for backend services
- @sentry/nextjs 10.32.1 - Sentry integration for Next.js frontend
- prom-client 15.1.3 - Prometheus metrics client (`automation-service`)

**Utilities & Helpers:**
- uuid 11.0.3 - UUID generation (`identity-service`, `document-service`)
- date-fns 4.1.0 - Date manipulation utilities (`automation-service`)
- file-type 21.1.1 - File type detection (`document-service`)
- dotenv 16.4.7 - Environment variable loading (`shared-config`)
- form-data 4.0.5 - FormData handling for multipart requests (`api-gateway`)
- server-only 0.0.1 - Ensures code only runs on server (`shared-config`)

## Configuration

**Environment:**
- Configuration loaded from environment variables via `@splits-network/shared-config`
- Supabase Vault stores encrypted secrets (clerk keys, stripe keys, resend API key)
- Only database connection credentials in `.env` file
- Environment files: `.env`, `.env.example`, `.env.docker.example`

**Build:**
- TypeScript configuration: `tsconfig.base.json` (ES2022 target, composite projects)
- Each service/app has own `tsconfig.json` extending base
- Next.js apps use `--webpack` flag explicitly in dev/build commands
- No additional webpack config files detected (default Next.js webpack)

**TypeScript Settings:**
```
- Target: ES2022
- Module: commonjs
- Strict mode: enabled
- Composite projects: enabled (for monorepo)
- Source maps: enabled
- Declaration maps: enabled
```

## Platform Requirements

**Development:**
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose (for running full stack locally)
- PostgreSQL (provided by Supabase)

**Production:**
- Kubernetes (raw YAML configuration in `infra/` directory)
- Redis instance for caching
- RabbitMQ instance for event messaging
- Supabase PostgreSQL database
- External services: Clerk, Stripe, Resend, OpenAI, Sentry

**Container Infrastructure:**
- Multi-stage Docker builds for services (development and production targets)
- Alpine Linux base images for minimal size
- Docker Compose for local development orchestration

---

*Stack analysis: 2026-01-31*
