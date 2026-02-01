# Architecture

**Analysis Date:** 2026-01-31

## Pattern Overview

**Overall:** Microservice-first architecture with a monorepo structure. Domain services expose REST APIs (via Fastify) with V2 standardized patterns. A centralized API gateway routes frontend requests and enforces authentication. Single Supabase Postgres database with schema-per-service pattern enables cross-service queries. Event-driven communication via RabbitMQ allows async service-to-service coordination without direct HTTP coupling.

**Key Characteristics:**
- Domain-driven service design (ATS, Network, Billing, Automation, AI, Document, Notification, Identity)
- Shared packages for cross-cutting concerns (logging, config, Fastify plugins, types, access control)
- Frontend-agnostic backend (mobile/web can both call api-gateway)
- Role-based access control (RBAC) with AccessContext resolved from Clerk JWT
- Event-driven async operations reduce inter-service coupling
- No backend logic in frontend apps (all logic in services)

## Layers

**API Gateway:**
- Purpose: Single entry point for all frontend requests, JWT validation, request routing, rate limiting
- Location: `services/api-gateway/src/`
- Contains: Auth middleware, Clerk JWT validation, service client initialization, route registration, error handling
- Depends on: Identity service (for JWT verification), domain services via HTTP clients
- Used by: All frontend apps (Portal, Candidate, Corporate)

**Domain Services (Fastify REST APIs):**
- Purpose: Core business logic organized by domain (jobs, candidates, recruiters, placements, billing, etc.)
- Location: `services/{ats-service,network-service,billing-service,automation-service,ai-service,notification-service,document-service,identity-service,chat-service,document-processing-service}/src/`
- Contains: V2 routes, services, repositories, domain models
- Depends on: Supabase Postgres client, shared packages (logging, config, fastify, types), RabbitMQ for events
- Used by: API gateway routes to them via HTTP clients in `shared-clients`

**Shared Packages:**
- Purpose: Reusable code across all services and apps
- Location: `packages/{shared-types,shared-config,shared-logging,shared-fastify,shared-clients,shared-access-context,shared-api-client,shared-job-queue,shared-ui}/src/`
- Contains: Type definitions, environment config loaders, logging setup, Fastify plugin builders, HTTP clients for service-to-service calls, access control logic, UI components, job queue abstraction
- Depends on: External libraries (Supabase, Fastify, Clerk, etc.)
- Used by: All services and apps

**Frontend Apps (Next.js):**
- Purpose: User-facing interfaces for different personas (recruiters, companies, candidates)
- Location: `apps/{portal,candidate,corporate}/src/`
- Contains: Next.js App Router pages, React components, hooks, client-side state management, SSR/SSG logic
- Depends on: Clerk auth SDK, shared API client, shared UI components, shared types
- Used by: End users via browser

**Database:**
- Purpose: Single source of truth for all data across services
- Location: Supabase Postgres (schema-per-service pattern)
- Contains: Users, organizations, memberships, jobs, candidates, applications, placements, billing data, chat messages, documents
- Cross-schema queries allowed for data consistency (e.g., ATS service can JOIN with Network service tables)

## Data Flow

**Frontend Request Flow:**

1. Frontend app (Portal/Candidate/Corporate) makes HTTP request with Clerk JWT token
2. API Gateway validates JWT, extracts `clerkUserId`, sets `x-clerk-user-id` header
3. Gateway routes request to appropriate domain service (e.g., `/api/v2/jobs` → ATS Service)
4. Domain service receives request, extracts user ID from header
5. Repository layer loads AccessContext (resolveAccessContext) from Clerk user ID → Internal user ID + roles/memberships
6. Repository applies role-based filtering to database query
7. Service layer applies business logic (validation, transformations)
8. Response wrapped in `{ data: payload, pagination?: {...} }` envelope
9. Gateway returns response to frontend

**Event-Driven Flow:**

1. Service writes data to database + publishes event to RabbitMQ exchange
2. Event has structure: `{ event_id, event_type, timestamp, source_service, payload }`
3. RabbitMQ topic routing sends event to interested services (e.g., `job.created` → Notification Service)
4. Consuming service listens on queue, processes event asynchronously
5. Consuming service updates its own database schema or triggers side effects (emails, webhooks, etc.)

**Database Access Pattern:**

- All database access goes through Supabase client (Node.js SDK)
- Services use repositories for encapsulation (`src/v2/{domain}/repository.ts`)
- Repositories expose typed, pagination-aware query methods
- Access control applied at repository level (filters by organization, recruiter, candidate based on context)
- V2 services use AccessContextResolver for consistent permission checking

**State Management:**

- **Frontend Client State:** React hooks (`useState`, `useContext`) for UI-local state (modals, form values)
- **Frontend Data Loading:** useEffect pattern - load primary data first, then secondary data in parallel
- **Backend State:** Supabase database is single source of truth
- **Cache:** Redis used for rate limiting and potential session management (not shown as active in routes)
- **Events:** RabbitMQ provides eventual consistency across services

## Key Abstractions

**AccessContext:**
- Purpose: Encapsulates user's identity, roles, memberships, and scoping for permission checks
- Examples: `packages/shared-access-context/src/index.ts`
- Pattern: `AccessContextResolver` class initialized with Supabase client, `resolve(clerkUserId)` returns full context with identity user ID, recruiter ID, candidate ID, org IDs, company IDs, roles, admin flag

**V2 Service Pattern (Standardized):**
- Purpose: Consistent structure across domain services
- Examples: `services/ats-service/src/v2/jobs/`, `services/ats-service/src/v2/applications/`
- Pattern: Each domain has `types.ts` (filters/updates), `repository.ts` (DB access), `service.ts` (business logic), `routes.ts` (HTTP endpoints)
- Routes follow 5-endpoint pattern: LIST, GET, CREATE, UPDATE (PATCH), DELETE

**Repository:**
- Purpose: Data access encapsulation with role-based filtering
- Examples: `services/ats-service/src/v2/jobs/repository.ts`, `services/ats-service/src/v2/candidates/repository.ts`
- Pattern: Constructor takes Supabase credentials, methods return `RepositoryListResponse<T>` for paginated queries or single objects
- Always applies AccessContext filtering at query level (recruiter sees only assigned jobs, companies see only their jobs)

**EventPublisher:**
- Purpose: Async event publishing to RabbitMQ with consistent envelope format
- Examples: `services/ats-service/src/v2/shared/events.ts`
- Pattern: Class manages RabbitMQ connection, `publish(eventType, payload)` sends to exchange with topic routing key

**ApiClient (Frontend):**
- Purpose: Type-safe HTTP wrapper for calling api-gateway
- Examples: `apps/portal/src/lib/api-client.ts`, `packages/shared-api-client/src/`
- Pattern: Factory function `createAuthenticatedClient(token)` returns client with token set; generic `get/post/patch/delete` methods for simple CRUD; named methods for complex business operations

## Entry Points

**Frontend Entry Points:**

**Portal (Main App):**
- Location: `apps/portal/src/app/layout.tsx`
- Triggers: User navigates to https://splits.network
- Responsibilities: Root layout with ClerkProvider, authentication wrapper, theme initializer, toast provider, analytics setup

**Candidate Portal:**
- Location: `apps/candidate/src/app/layout.tsx`
- Triggers: User navigates to candidate-facing subdomain
- Responsibilities: Candidate-specific UI (jobs view, applications, profile)

**Corporate Marketing:**
- Location: `apps/corporate/src/app/layout.tsx`
- Triggers: Marketing funnel traffic
- Responsibilities: Landing page, pricing, feature info (no auth required)

**Backend Entry Points:**

**API Gateway:**
- Location: `services/api-gateway/src/index.ts`
- Triggers: Frontend HTTP request with Clerk JWT
- Responsibilities: Authenticate request, route to service, return response with consistent envelope

**Domain Services (e.g., ATS):**
- Location: `services/ats-service/src/index.ts`
- Triggers: API Gateway routes request (e.g., `/api/v2/jobs` → ATS Service)
- Responsibilities: Run Fastify server, register V2 routes, initialize database clients, set up event publishing

## Error Handling

**Strategy:** Consistent error envelope format across all services for frontend predictability

**Patterns:**

- **Client Errors (400-499):** Validation failures, missing required fields, unauthorized access
  - Response format: `{ error: { message: string, code?: string, details?: any } }`
  - Example: Missing job title → `{ error: { message: "Job title is required" } }`

- **Server Errors (500+):** Unexpected failures, database issues, service unavailability
  - Logged with Sentry if DSN provided
  - Response format: `{ error: { message: "Internal server error", code: "INTERNAL_ERROR" } }`
  - Never expose stack traces in production

- **Async Error Handling:** EventPublisher logs errors but doesn't crash service
  - Failed event publishing leaves error log for manual replay
  - Events stored in database for audit trail

- **Frontend Error Handling:** Catch blocks dispatch to toast/notification system
  - Example: `catch (error) { toast.error(error.message) }`

## Cross-Cutting Concerns

**Logging:**
- Framework: `shared-logging` package exports `createLogger()` factory
- Pattern: Structured logging with service name, environment-based verbosity (debug in dev, info in prod)
- Usage: `logger.info({ key: value }, 'message')` - outputs JSON for log aggregation

**Validation:**
- Backend: Each service validates at repository or service layer before DB write
  - Example: `JobService.createJob()` checks required fields before insert
- Frontend: React form validation before API call (optimistic UX) + backend re-validates on receipt

**Authentication:**
- Clerk JWT token from frontend → API Gateway extracts and validates
- Gateway sets `x-clerk-user-id` header for all downstream services
- Services read header instead of making auth calls (no circular dependency)

**Authorization (RBAC):**
- AccessContext resolved once per request, contains roles + memberships
- Services check context.roles + context.organizationIds/companyIds before allowing operations
- Example: Only organization members can view/edit jobs for that org
- Platform admins (isPlatformAdmin flag) bypass most checks

**Rate Limiting:**
- API Gateway registers Fastify rate-limit plugin with Redis backend
- Per-IP limits enforced before routing to services

---

*Architecture analysis: 2026-01-31*
