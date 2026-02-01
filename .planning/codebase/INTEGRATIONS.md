# External Integrations

**Analysis Date:** 2026-01-31

## APIs & External Services

**Authentication & Identity:**
- **Clerk** - User authentication and account management
  - SDK: `@clerk/backend` (backend), `@clerk/nextjs` (frontend)
  - Portal App Keys: `SPLITS_CLERK_PUBLISHABLE_KEY`, `SPLITS_CLERK_SECRET_KEY`, `SPLITS_CLERK_JWKS_URL`
  - Candidate App Keys: `APP_CLERK_PUBLISHABLE_KEY`, `APP_CLERK_SECRET_KEY`, `APP_CLERK_JWKS_URL`
  - Webhook verification: Svix library in `identity-service` for Clerk webhook handling
  - Webhook endpoint: `POST /v2/webhooks/clerk` in `identity-service`

**Payment Processing:**
- **Stripe** - Payment processing and billing
  - SDK: `stripe` (Node.js backend)
  - Frontend: `@stripe/stripe-js`, `@stripe/react-stripe-js`
  - Auth: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
  - Webhook secret: `STRIPE_WEBHOOK_SECRET`
  - Webhook consumer: `billing-service` handles events (subscription, transfers, payouts)
  - Webhook events handled: `customer.subscription.*`, `account.updated`, `transfer.*`, `payout.*`
  - Location: `services/billing-service/src/services/webhooks/service.ts`

**Email & Notifications:**
- **Resend** - Transactional email service
  - SDK: `resend` (Node.js)
  - Auth: `RESEND_API_KEY`
  - From Email: `RESEND_FROM_EMAIL` (default: noreply@updates.splits.network)
  - Service: `notification-service` sends templated emails
  - Email templates in: `services/notification-service/src/templates/`
  - Supports: application updates, placement notifications, proposals, invitations, chat notifications

**AI & ML:**
- **OpenAI** - AI-powered candidate-job matching and analysis
  - SDK: `openai` (Node.js)
  - Auth: `OPENAI_API_KEY`
  - Model: `OPENAI_MODEL` (configurable, default: gpt-3.5-turbo)
  - Service: `ai-service` provides AI review endpoints
  - Location: `services/ai-service/src/`

## Data Storage

**Databases:**
- **Supabase PostgreSQL** - Single unified database
  - Connection: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - Client: `@supabase/supabase-js`
  - Schema-per-service pattern: Each service owns its schema
  - Cross-schema JOINs allowed between services
  - Vault integration: Encrypted secrets storage in Supabase Vault
  - Migrations: SQL files in `infra/migrations/` (vault setup, helpers)

**File Storage:**
- **Supabase Storage** - Document and file storage
  - Used by: `document-service` for file uploads and retrieval
  - Client: `@supabase/supabase-js` storage API
  - Features: File type detection, multipart upload support
  - Location: `services/document-service/src/`

**Caching:**
- **Redis** - In-memory caching and rate limiting
  - Client: `ioredis` (api-gateway only)
  - Used by: API Gateway for caching and rate limiting
  - Docker: `redis:7-alpine`
  - Connection: `REDIS_URL` or localhost:6379 for dev

## Message Queue & Event Streaming

**Event Bus:**
- **RabbitMQ** - Asynchronous event publishing and consumption
  - Client: `amqplib`
  - Connection: `RABBITMQ_URL` (default: amqp://localhost:5672 or Docker service URL)
  - Docker: `rabbitmq:3-management-alpine`
  - Event patterns: Domain events published by services, consumed by subscribers
  - Used for: Notification triggers, workflow orchestration, data synchronization
  - Management UI: Port 15672 (locally)

## Authentication & Identity

**Auth Provider:**
- **Clerk** - Primary authentication provider
  - Implementation: JWT tokens issued by Clerk, verified by API Gateway
  - Flow: Frontend sends Clerk JWT → API Gateway validates → Extracts `clerkUserId` → Sets `x-clerk-user-id` header
  - Backend: All services read user identification from `x-clerk-user-id` request header
  - Webhooks: Clerk sends user/org events to identity-service via Svix
  - Portal app and Candidate app have separate Clerk instances

**Authorization:**
- **V2 Access Context** - Role-based access control
  - Package: `@splits-network/shared-access-context`
  - Function: `resolveAccessContext(clerkUserId, supabase)` retrieves user roles and filters
  - Usage: Applied automatically in service repositories for data filtering

## Monitoring & Observability

**Error Tracking:**
- **Sentry** - Error and exception monitoring
  - Backend: `@sentry/node` in all services
  - Frontend: `@sentry/nextjs` in Next.js apps
  - Auth: `SENTRY_DSN`, `SENTRY_RELEASE` environment variables
  - Configuration: Optional - services initialize only if DSN is provided
  - Services with Sentry: identity-service, ats-service, billing-service, network-service, ai-service, notification-service, automation-service

**Metrics:**
- **Prometheus** - Metrics collection (limited usage)
  - Client: `prom-client` in automation-service only
  - Purpose: Service health and performance metrics

**Logs:**
- **Console-based logging** via `@splits-network/shared-logging`
  - Pretty-print in development mode
  - Structured logging in production
  - Service name and context included in all logs

## CI/CD & Deployment

**Hosting:**
- **Kubernetes** - Container orchestration in production
  - Raw YAML manifests in `infra/` directory
  - Docker images built from Dockerfiles in each service directory

**Containerization:**
- **Docker** - Service containerization
  - Multi-stage builds (development and production targets)
  - Docker Compose for local development
  - Base images: alpine, node:*-alpine

**CI Pipeline:**
- Not explicitly configured in examined files
- GitHub Actions workflows may exist in `.github/` directory

## Environment Configuration

**Required Environment Variables:**

*Database:*
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key for client operations
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for backend operations
- `DATABASE_URL` - Raw PostgreSQL connection string (optional, can use Supabase URL)

*Authentication:*
- `SPLITS_CLERK_PUBLISHABLE_KEY` - Portal app public key
- `SPLITS_CLERK_SECRET_KEY` - Portal app secret key
- `SPLITS_CLERK_JWKS_URL` - Portal app JWKS endpoint
- `APP_CLERK_PUBLISHABLE_KEY` - Candidate app public key
- `APP_CLERK_SECRET_KEY` - Candidate app secret key
- `APP_CLERK_JWKS_URL` - Candidate app JWKS endpoint

*Payment:*
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

*Email:*
- `RESEND_API_KEY` - Resend email service API key
- `RESEND_FROM_EMAIL` - From address for emails (default provided)

*AI:*
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_MODEL` - Model selection (default: gpt-3.5-turbo)

*Infrastructure:*
- `RABBITMQ_URL` - RabbitMQ connection URL
- `REDIS_URL` - Redis connection URL (optional)
- `NODE_ENV` - Environment (development, production)
- `PORT` - Service port

*Observability:*
- `SENTRY_DSN` - Sentry error tracking endpoint (optional)
- `SENTRY_RELEASE` - Release version for Sentry (optional)

*Secrets location:*
- `.env` file (development only, contains non-secret configs)
- Supabase Vault (production, encrypted at rest)
- Secrets stored in Vault: `clerk_publishable_key`, `clerk_secret_key`, `clerk_jwks_url`, `stripe_secret_key`, `stripe_webhook_secret`, `stripe_publishable_key`, `resend_api_key`

## Webhooks & Callbacks

**Incoming Webhooks (Services Listen):**

- **Clerk Webhooks** → `identity-service`
  - Endpoint: `POST /v2/webhooks/clerk`
  - Events: User creation, org updates, membership changes
  - Verification: Svix library validates webhook signature
  - Location: `services/identity-service/src/v2/webhooks/routes.ts`

- **Stripe Webhooks** → `billing-service`
  - Endpoint: Webhook route in billing-service (specific path TBD from code)
  - Events: Subscription created/updated/deleted, account updates, transfers, payouts
  - Verification: Stripe SDK validates webhook signature
  - Location: `services/billing-service/src/services/webhooks/service.ts`

**Outgoing Webhooks (Services Emit):**
- **RabbitMQ Events** - All services publish domain events to RabbitMQ
- **Email Delivery** - Notification service sends emails via Resend (async via RabbitMQ)
- No outgoing webhooks to external systems detected

## Cross-Service Communication

**HTTP APIs:**
- Services expose REST APIs via Fastify
- Frontend communicates only with API Gateway (reverse proxy at port 3000)
- Services do NOT call each other via HTTP (event-driven instead)

**Event-Driven:**
- RabbitMQ broker for asynchronous communication
- Services publish events: `EventPublisher` in each service's `v2/shared/events.ts`
- Services consume events: `DomainEventConsumer` subscribes to RabbitMQ queues
- Example: Placement created → ATS publishes → Notification service consumes → Sends email

---

*Integration audit: 2026-01-31*
