# Codebase Structure

**Analysis Date:** 2026-01-31

## Directory Layout

```
splits.network/
├── apps/                          # User-facing frontend applications
│   ├── portal/                    # Main authenticated app (Next.js 16, App Router)
│   ├── candidate/                 # Candidate-facing portal
│   └── corporate/                 # Marketing website
├── services/                      # Backend microservices (Fastify + TypeScript)
│   ├── api-gateway/               # Request router, auth, rate limiting
│   ├── ats-service/               # Jobs, candidates, applications, placements
│   ├── network-service/           # Recruiters, assignments, proposals
│   ├── identity-service/          # Users, organizations, memberships
│   ├── billing-service/           # Plans, subscriptions, Stripe
│   ├── notification-service/      # Event-driven email (Resend)
│   ├── automation-service/        # AI matching, fraud detection
│   ├── ai-service/                # AI candidate-job fit analysis
│   ├── document-service/          # File storage (Supabase Storage)
│   ├── document-processing-service/  # PDF parsing, document processing
│   ├── chat-service/              # Real-time chat infrastructure
│   ├── chat-gateway/              # WebSocket chat routing
│   └── analytics-service/         # Event analytics and metrics
├── packages/                      # Shared code (NOT independently deployable)
│   ├── shared-types/              # TypeScript interfaces, domain models
│   ├── shared-config/             # Environment config loader
│   ├── shared-logging/            # Structured logging setup
│   ├── shared-fastify/            # Fastify plugin builders, error handler
│   ├── shared-clients/            # Typed HTTP clients for service-to-service calls
│   ├── shared-access-context/     # RBAC context resolver (Clerk → roles/memberships)
│   ├── shared-api-client/         # Frontend HTTP client wrapper
│   ├── shared-job-queue/          # RabbitMQ job queue abstraction
│   └── shared-ui/                 # Reusable React components (DaisyUI)
├── docs/                          # Project documentation
│   ├── guidance/                  # API standards, form controls, pagination patterns
│   ├── flows/                     # User journey diagrams and business flows
│   ├── event-driven/              # Event catalog and async patterns
│   ├── stripe/                    # Stripe payment integration docs
│   ├── design/                    # Design system and UI guidelines
│   ├── deployment/                # K8s deployment instructions
│   └── implementation-plans/      # Detailed implementation guides
├── infra/                         # Infrastructure as Code
│   └── k8s/                       # Kubernetes manifests (raw YAML)
└── CLAUDE.md                      # Project guidance for Claude Code
```

## Directory Purposes

**apps/portal:**
- Purpose: Main authenticated application for recruiters and companies
- Contains: Next.js 16 App Router pages, React components, client hooks, utility functions
- Key files: `src/app/layout.tsx` (root), `src/app/portal/` (authenticated routes), `src/components/` (UI), `src/lib/` (utilities)

**apps/candidate:**
- Purpose: Candidate-facing job browsing and application interface
- Contains: Job listings, application status, candidate profile management
- Key files: `src/app/page.tsx` (candidate home), `src/components/` (job cards, application forms)

**apps/corporate:**
- Purpose: Marketing landing page and feature information
- Contains: Marketing content, pricing, features overview (public, no auth)
- Key files: `src/app/page.tsx` (landing), `src/components/sections/` (marketing sections)

**services/api-gateway:**
- Purpose: Single entry point for all frontend requests
- Contains: Authentication middleware (Clerk JWT validation), service client pool, route registration, rate limiting
- Key files: `src/index.ts` (server setup), `src/auth.ts` (JWT validation), `src/routes/v2/routes.ts` (route registration)

**services/ats-service:**
- Purpose: Applicant Tracking System - jobs, candidates, applications, placements
- Contains: V2 service layer with standardized patterns
- Key files: `src/v2/routes.ts` (route registration), `src/v2/{jobs,candidates,applications,placements}/` (domain folders)

**services/network-service:**
- Purpose: Recruiter network - recruiters, assignments, proposals, splits tracking
- Contains: Recruiter profiles, job assignments, fee negotiations, placement attribution
- Key files: `src/v2/` (V2 domain structure)

**services/identity-service:**
- Purpose: User identity and organization management
- Contains: User accounts, organizations, memberships, roles
- Key files: Legacy and V2 routes, membership validation

**services/billing-service:**
- Purpose: Subscription management and payment processing
- Contains: Plans, subscriptions, Stripe integration, invoice generation, payouts
- Key files: `src/v2/` (subscriptions, plans), `src/stripe/` (Stripe webhook handlers)

**services/notification-service:**
- Purpose: Event-driven email notifications
- Contains: Email templates, Resend SDK integration, event consumers
- Key files: `src/consumers/` (event listeners), `src/templates/` (email HTML templates)

**services/automation-service:**
- Purpose: AI-powered matching, fraud detection, workflow automation
- Contains: Job-candidate matching logic, fraud scoring, match review workflows
- Key files: `src/v2/` (matching endpoints), `src/shared/` (AI service clients)

**services/ai-service:**
- Purpose: AI-powered candidate-job fit analysis
- Contains: LLM integration, fit scoring, explanation generation
- Key files: API integration with AI providers

**services/document-service:**
- Purpose: File storage and management using Supabase Storage
- Contains: Upload/download handlers, file metadata, presigned URLs
- Key files: `src/v2/` (document endpoints)

**services/document-processing-service:**
- Purpose: Parse and extract data from PDFs and documents
- Contains: PDF parsing, resume extraction, document analysis
- Key files: Job queue consumers, document parsing logic

**services/chat-service:**
- Purpose: Persistent chat message storage and retrieval
- Contains: Message repository, conversation threads, message indexing
- Key files: `src/v2/` (message CRUD endpoints)

**services/chat-gateway:**
- Purpose: WebSocket routing for real-time chat
- Contains: WebSocket server, connection management, message broadcasting
- Key files: Connection/subscription handlers

**packages/shared-types:**
- Purpose: Single source of truth for TypeScript interfaces
- Contains: Domain models (Job, Candidate, Application, etc.), DTOs, filters, enum definitions
- Key files: `src/index.ts` (export barrel)

**packages/shared-config:**
- Purpose: Centralized environment variable loading
- Contains: Config loaders for base settings, Clerk, RabbitMQ, Redis, Supabase
- Key files: `src/loaders.ts` (loadBaseConfig, loadMultiClerkConfig, etc.)

**packages/shared-logging:**
- Purpose: Structured logging setup
- Contains: Logger factory, log level management, pretty-print in dev
- Key files: `src/index.ts` (createLogger function)

**packages/shared-fastify:**
- Purpose: Common Fastify server configuration
- Contains: buildServer function, error handler, plugin setup
- Key files: `src/index.ts` (buildServer)

**packages/shared-clients:**
- Purpose: Typed HTTP clients for service-to-service calls
- Contains: Client factories for each domain service
- Key files: `src/` (service-specific clients)

**packages/shared-access-context:**
- Purpose: Role-based access control context resolution
- Contains: AccessContext interface, AccessContextResolver class, resolveAccessContext function
- Key files: `src/index.ts` (all logic in one file)

**packages/shared-api-client:**
- Purpose: Frontend HTTP wrapper around api-gateway
- Contains: SplitsApiClient class with get/post/patch/delete methods
- Key files: `src/index.ts` (SplitsApiClient class)

**packages/shared-job-queue:**
- Purpose: Job queue abstraction (RabbitMQ backend)
- Contains: JobQueue class, job publishing/consuming patterns
- Key files: `src/index.ts` (JobQueue interface and implementation)

**packages/shared-ui:**
- Purpose: Reusable React components built with DaisyUI
- Contains: Button, form inputs, modals, layout components
- Key files: `src/components/` (component files)

## Key File Locations

**Entry Points:**

- `apps/portal/src/app/layout.tsx` - Portal root layout, ClerkProvider setup
- `apps/candidate/src/app/layout.tsx` - Candidate app root
- `apps/corporate/src/app/layout.tsx` - Corporate (marketing) app root
- `services/api-gateway/src/index.ts` - API gateway server startup
- `services/ats-service/src/index.ts` - ATS service server startup
- `services/identity-service/src/index.ts` - Identity service server startup

**Configuration:**

- `CLAUDE.md` - Project guidance and architecture overview (checked into repo)
- `.env.example` (or similar) - Environment variable template
- `package.json` (monorepo root) - pnpm workspaces, build scripts
- `tsconfig.json` (monorepo root) - Shared TypeScript config
- `turbo.json` (or similar) - Build orchestration config

**Core Logic:**

- `packages/shared-access-context/src/index.ts` - AccessContext resolution (RBAC)
- `packages/shared-types/src/index.ts` - All domain types
- `services/ats-service/src/v2/` - V2 pattern for all ATS endpoints
- `services/api-gateway/src/routes/v2/routes.ts` - Route registration to domain services
- `services/identity-service/src/` - User/org/membership repositories

**Testing:**

- `services/*/tests/` - Service-level test files (Jest/Vitest)
- `services/*/src/**/*.test.ts` - Unit tests co-located with source (if used)

## Naming Conventions

**Files:**
- `kebab-case` for all filenames (e.g., `user-profile.tsx`, `api-client.ts`, `job-service.ts`)
- Exception: React components use PascalCase for component files (e.g., `UserProfile.tsx`) but import paths remain kebab-case
- Services use `service.ts`, repositories use `repository.ts`, routes use `routes.ts` pattern

**Directories:**
- `kebab-case` for directory names (e.g., `api-gateway`, `ats-service`, `shared-types`)
- Domain folders inside V2 services use plural nouns (e.g., `jobs/`, `candidates/`, `applications/`)
- Nested domain folders use same pattern (e.g., `application-feedback/`, `job-pre-screen-questions/`)

**Functions:**
- `camelCase` for all function names (e.g., `resolveAccessContext`, `buildPaginationResponse`)
- Async functions do NOT have `async` prefix (e.g., `getJobs` not `asyncGetJobs`)

**Variables & Constants:**
- `camelCase` for variables (e.g., `clerkUserId`, `accessContext`, `pageSize`)
- `SCREAMING_SNAKE_CASE` for environment variables (e.g., `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `SUPABASE_URL`)

**Types:**
- `PascalCase` for all type names (e.g., `JobFilters`, `ApplicationUpdate`, `AccessContext`)
- Interfaces: `JobRepository`, `ServiceConfig`
- Enums: `ApplicationStage`, `PlacementStatus`

## Where to Add New Code

**New Feature (e.g., new domain entity like "Referrals"):**
- Primary code: Create `services/ats-service/src/v2/referrals/` with `types.ts`, `repository.ts`, `service.ts`, `routes.ts`
- Register routes: Add `registerReferralRoutes()` call to `services/ats-service/src/v2/routes.ts`
- Register in gateway: Add route to `services/api-gateway/src/routes/v2/routes.ts`
- Types: Add Referral interface to `packages/shared-types/src/index.ts`
- Tests: Create `services/ats-service/tests/referrals.test.ts`

**New API Endpoint (existing resource):**
- Location: Add method to existing service class (e.g., `JobServiceV2`)
- Route: Add route function to `services/ats-service/src/v2/jobs/routes.ts`
- Validation: Add filter types to `services/ats-service/src/v2/jobs/types.ts`

**New Frontend Page:**
- Location: Create `apps/portal/src/app/portal/{feature}/page.tsx` for authenticated, or `apps/portal/src/app/{feature}/page.tsx` for public
- Components: Create `apps/portal/src/components/{feature}/` for page-specific components
- Shared components: Add reusable components to `packages/shared-ui/src/components/`
- Data loading: Use `createAuthenticatedClient(token)` from `@/lib/api-client`

**New Shared Utility:**
- Simple utility (logging, config): Add to existing shared package (e.g., `packages/shared-config/`)
- Domain-agnostic logic: Create new shared package at `packages/shared-{name}/src/`
- Add to monorepo: Create `package.json` with name `@splits-network/shared-{name}`
- Export from root `index.ts` file

**New Backend Service (e.g., analytics-service):**
- Structure: Follow same pattern as ATS service
- Entry point: `services/analytics-service/src/index.ts` with Fastify server setup
- V2 routes: `services/analytics-service/src/v2/routes.ts`
- Register in gateway: Call new service from `services/api-gateway/src/routes/v2/routes.ts`
- Shared resources: Reference `@splits-network/shared-config`, `@splits-network/shared-logging`, etc.

**Adding Tests:**
- Location: Co-locate with source (e.g., `src/v2/jobs/service.test.ts`) OR in `tests/` directory
- Pattern: Use Jest/Vitest with `describe`, `it`, `expect`
- Mocking: Mock Supabase client, RabbitMQ publisher
- Example: See `services/ats-service/tests/` for patterns

## Special Directories

**`docs/guidance/`:**
- Purpose: Shared design patterns and API standards
- Generated: Manual updates (not auto-generated)
- Committed: Yes
- Key files: `api-response-format.md`, `pagination.md`, `user-identification-standard.md`, `form-controls.md`

**`docs/event-driven/`:**
- Purpose: Event type catalog and flow documentation
- Generated: Manual
- Committed: Yes
- Key files: Event definitions, consumer mappings

**`docs/implementation-plans/`:**
- Purpose: Detailed guides for implementing features
- Generated: No (human-created design docs)
- Committed: Yes
- Usage: Reference when implementing new services or features

**`infra/k8s/`:**
- Purpose: Kubernetes deployment manifests
- Generated: No (hand-authored YAML)
- Committed: Yes
- Structure: One folder per service containing `deployment.yaml`, `service.yaml`, `configmap.yaml`

**`.planning/codebase/`:**
- Purpose: Codebase analysis documents (this directory)
- Generated: By `/gsd:map-codebase` command
- Committed: No (temporary, for planning tool)
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, STACK.md, INTEGRATIONS.md

**`node_modules/`, `dist/`, `.next/`:**
- Purpose: Build artifacts and dependencies
- Generated: Yes (from build/install)
- Committed: No (in `.gitignore`)

**`.claude/`, `.github/`:**
- Purpose: Automation and CI/CD configuration
- Generated: No (hand-authored)
- Committed: Yes
- Contents: GSD command definitions, GitHub Actions workflows, skills definitions

---

*Structure analysis: 2026-01-31*
