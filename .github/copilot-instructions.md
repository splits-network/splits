
# Splits Network – Copilot Instructions

These instructions tell GitHub Copilot (and Copilot Chat) how to behave when working in the **Splits Network** repository.

Splits Network is a **split-fee recruiting marketplace** with a **microservice-first** architecture and a **Next.js portal** frontend.

Copilot should prioritize **clarity, strong domain boundaries, and minimal magic**.

We should only be using @latest versions of packages unless there's a specific reason not to.

IMPORTANT: DO NOT MAKE ASSUMPTIONS, YOU MUST INVESTIGATE THE CURRENT CODEBASE AND DOCUMENTATION BEFORE SUGGESTING ANYTHING.

EXTREMELY IMPORTANT: We need to ensure our files are single responsibility, easy to read, and maintainable.  So don't put everything in one file or function.

**Current State:** This project is actively under development with functional services and frontends. The core architecture is established and several services are operational. When generating code, follow the existing patterns in the codebase and reference `docs/guidance/` for standards.

File nameing conventions: kebab-case for files and folders, PascalCase for React components, camelCase for variables and functions.

---

## 1. Monorepo Layout & Mental Model

The repo is organized by **responsibility**, not by technology.

```txt
/ (repo root)
├─ apps/                     # User-facing frontends ONLY
│  ├─ portal/                # Main authenticated app (Next.js 16, App Router)
│  ├─ candidate/             # Candidate-facing portal (Next.js)
│  └─ corporate/             # Marketing/corporate site (Next.js)
│
├─ services/                 # Backend services / APIs / workers
│  ├─ api-gateway/           # Public API entrypoint; routes to domain services
│  ├─ identity-service/      # Users, orgs, memberships (Clerk bridge)
│  ├─ ats-service/           # Jobs, candidates, applications, placements
│  ├─ network-service/       # Recruiters, assignments, basic stats
│  ├─ billing-service/       # Plans, subscriptions, Stripe, payouts
│  ├─ notification-service/  # Event-driven email (Resend)
│  ├─ automation-service/    # AI matching, fraud detection, metrics
│  ├─ ai-service/            # AI-powered candidate-job fit analysis
│  └─ document-service/      # File storage and processing (Supabase Storage)
│
├─ packages/                 # Shared code, NOT directly deployable
│  ├─ shared-types/          # Domain types, DTOs
│  ├─ shared-config/         # Config/env loader
│  ├─ shared-logging/        # Logging utilities
│  ├─ shared-fastify/        # Fastify plugins, common middleware
│  ├─ shared-clients/        # Typed HTTP/SDK clients for services
│  ├─ shared-access-context/ # Access context resolution (V2 RBAC)
│  └─ shared-job-queue/      # Job queue abstraction (RabbitMQ)
│
├─ infra/
│  └─ k8s/                   # Raw Kubernetes YAML (Deployments, Services, Ingress)
│
└─ docs/                     # PRDs, architecture, API contracts, design docs
```

**Key rules for Copilot:**

1. **Do NOT put backend logic in `apps/`.**  
   - All APIs and business logic go in `services/*`.  
   - Next.js app should call `api-gateway`, not talk directly to domain services.
2. **Treat each service as independent with NO direct service-to-service HTTP calls.**  
   - Services share a single Supabase database backend with schema-per-service design
   - For data access: Use direct database queries to any schema (cross-schema JOINs allowed)
   - For coordination: Use RabbitMQ events for asynchronous communication between services
   - **NEVER make HTTP calls between backend services** - this creates tight coupling and reliability issues
   - Frontend apps only call `api-gateway`, which may proxy to services as needed
3. **Use shared packages** instead of copy-pasting common code.
4. **Follow V2 API Architecture** (implemented in ATS, Network, Billing, Document, Notification, Automation services):
   - Use standardized 5-route pattern (LIST, GET, CREATE, UPDATE, DELETE)
   - Implement domain-based folder structure under `v2/`
   - Use shared access context from `@splits-network/shared-access-context`
   - No `/me` endpoints - use filtered queries with access context
   - Single update methods with smart validation
   - Direct Supabase queries with role-based scoping
4. **ALWAYS use server-side filtering, searching, pagination, and sorting for list views.**
   - Client-side filtering does NOT scale and will cause performance issues with large datasets.
   - **Use standardized types** from `@splits-network/shared-types`:
     - `StandardListParams` for query parameters: `{ page?: number; limit?: number; search?: string; filters?: Record<string, any>; include?: string; sort_by?: string; sort_order?: 'asc' | 'desc' }`
     - `StandardListResponse<T>` for responses: `{ data: T[]; pagination: PaginationResponse }`
   - Backend endpoints MUST support query parameters: `?page=1&limit=25&search=query&sort_by=field&sort_order=asc`
   - Backend should return enriched data with JOINs (e.g., applications with candidate, job, company data)
   - Frontend should use pagination controls and pass all filters to the server
   - Search should be debounced (300ms delay) to avoid excessive API calls
   - Example response format using `StandardListResponse<T>`:
     ```json
     {
       "data": [...],
       "pagination": {
         "total": 1000,
         "page": 1,
         "limit": 25,
         "total_pages": 40
       }
     }
     ```

---

## 2. Core Technologies & Integrations

Copilot should assume and suggest the following stack:

- **Frontend**
  - Next.js 16 (App Router) in `apps/portal`.
  - React + TypeScript.
  - TailwindCSS + DaisyUI for UI and theming.
  - Clerk for auth components (sign-in, sign-up, user profile), these should be custom pages/components, not clerk provided components.
  - FontAwesome for icons. inline (<i className='fa-solid fa-icon'></>) not react objects

- **Backend**
  - Node.js (current LTS) with **Fastify** in all services.
  - TypeScript for all services.
  - REST APIs with OpenAPI documentation.

- **Data & Infra**
  - **Single Supabase Postgres database** shared across all services:
    - Services use **schema-per-service** pattern: `*`, `*`, `*`, `*`, `*`, `*`
    - Each service owns its schema and migrations but can query other schemas directly
    - Cross-schema JOINs are allowed and encouraged for data enrichment
    - Supabase project-ref: `einhgkqmxbkgdohwfayv`
    - Use Supabase MCP tools for database operations when available
  - **Service Communication Pattern**:
    - ✅ **Direct database queries**: Services query their own schema or cross-schema JOINs for data needs
    - ✅ **RabbitMQ events**: Asynchronous coordination and notifications between services
    - ❌ **HTTP service-to-service calls**: Avoid at all costs - creates coupling and reliability issues
  - **Database Schema Pattern for User Access (V2)**:
    - `users` table contains `clerk_user_id` (text) column - the source of truth for Clerk IDs
    - Other tables (e.g., `candidates`, `recruiters`) have `user_id` (UUID) which is a foreign key to `users.id`
    - **V2 Services use shared access context** from `@splits-network/shared-access-context`:
      - Import `resolveAccessContext(clerkUserId, supabase)` to get user context with roles
      - Access context includes internal UUID, memberships, and scoped filtering logic
      - Repository methods use access context to filter queries (e.g., candidates see their own data, recruiters see assigned data, company users see org data)
    - **V1 Services (legacy)**: Still use direct Clerk ID resolution pattern above
    - Example V2 pattern:
      ```typescript
      import { resolveAccessContext } from '@splits-network/shared-access-context';
      
      // V2 Repository method
      async list(clerkUserId: string, filters: CandidateFilters) {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        // Access context handles role-based filtering automatically
        const query = this.supabase
          
          .from('candidates')
          .select('*');
          
        // Apply role-based filters from context
        if (context.role === 'recruiter') {
          query.eq('user_id', context.userId);
        } else if (context.role === 'company_admin') {
          query.in('company_id', context.accessibleCompanyIds);
        }
        // Platform admins see everything (no filter)
        
        return query;
      }
      ```
  - Kubernetes with raw YAML manifests (no Helm).
  - Redis for caching and rate limiting.
  - RabbitMQ for domain events.

- **Monorepo & Workflow**
  - **pnpm workspaces** for dependency management.
  - Commands:
    - `pnpm install` – install all dependencies (run from root).
    - `pnpm --filter <service-name> build` – build a specific service.
    - `pnpm --filter <service-name> dev` – run a service in dev mode.
    - `pnpm --filter <service-name> test` – run tests for a service.
  - Each service has its own `package.json` and can be built independently.

- **3rd Parties**
  - Clerk – authentication and user 
  - Stripe – recruiter subscription 
  - Resend – transactional email, used by `notification-service`.

Copilot should **prefer these tools by default** when generating new code.

---

## 3. Service Responsibilities (for Copilot)

When editing or generating code, Copilot should respect these boundaries:

### 3.1 `services/api-gateway`

- Verifies Clerk JWT.
- Resolves user + org (via `identity-service`).
- Applies coarse auth (recruiter vs company vs admin).
- Applies rate limiting (Redis).
- Routes requests to domain services.
- Optionally aggregates data for dashboard endpoints.

**Gateway rule:**  
No domain-specific business logic here. It should mostly proxy and enforce auth/limits.

### 3.2 `services/identity-service`

- Owns:
  - `users`
  - `organizations`
  - `memberships`
- Syncs users from Clerk (`clerk_user_id`).
- **V1**: Returns `/me` and memberships (legacy)
- **V2**: Not yet implemented - still uses legacy endpoints

Copilot: keep this service focused on identity, not ATS or billing concerns.

### 3.3 `services/ats-service`

- Owns ATS domain:
  - Companies (optionally linked to `organizations`)
  - Jobs / roles
  - Candidates
  - Applications (candidate ↔ job)
  - Stages and notes
  - Placements (Phase 1: single recruiter per placement)
- **V2 Implementation Complete**: Uses standardized 5-route pattern
  - `/v2/jobs`, `/v2/companies`, `/v2/candidates`, `/v2/applications`, `/v2/placements`
  - Domain-based folder structure under `src/v2/`
  - Direct Supabase queries with role-based scoping
  - Single update methods with smart validation

Copilot:  
**For new ATS features, use V2 patterns**. Extend existing V2 routes or add new V2 resources following the 5-route pattern. Anything about recruiter permissions or subscriptions belongs to `network-service` or `billing-service`.

### 3.4 `services/network-service`

- Owns recruiter-centric data:
  - `recruiters`
  - `role_assignments`
  - `candidate_role_assignments` (proposals)
- **V2 Implementation Complete**: Uses standardized 5-route pattern
  - `/v2/recruiters`, `/v2/assignments`, `/v2/recruiter-candidates`, `/v2/reputation`, `/v2/proposals`
  - Domain-based folder structure under `src/v2/`
  - Enriched queries with recruiter metadata
  - Marketplace visibility and capacity management
- Answers questions like:
  - "Which jobs is this recruiter allowed to see?"
  - "Is this user an active recruiter?"

Copilot:  
**For new network features, use V2 patterns**. Extend existing V2 routes following the 5-route pattern. Do not add ATS-like logic here. Stay focused on recruiters and their marketplace relationships.

### 3.5 `services/billing-service`

- Owns Stripe integration and subscription state:
  - `plans`
  - `subscriptions`
  - `payouts` - recruiter payment tracking
- **V2 Implementation Complete**: Uses standardized 5-route pattern
  - `/v2/plans`, `/v2/subscriptions`, `/v2/payouts`
  - Role-aware access (recruiters see their own, billing admins see all)
  - Event publishing for all lifecycle hooks
- Handles Stripe webhooks
- Provides subscription status to `api-gateway` for gating recruiter features
- Manages payout processing and tracking

Copilot:  
**For new billing features, use V2 patterns**. All subscription logic (free vs paid recruiter, plan changes, etc.) and payout processing belongs here.

### 3.6 `services/notification-service`

- Listens to RabbitMQ events from other services
- Sends transactional email using **Resend**
- **V2 Implementation Complete**: Uses standardized 5-route pattern
  - `/v2/notifications`, `/v2/templates`
  - User-scoped notification access
  - Template management for email content
- Example events:
  - `application.created`
  - `application.stage_changed`
  - `placement.created`

Copilot:  
**For new notification features, use V2 patterns**. Do not embed SMTP logic elsewhere. Email sending should flow through notification-service and Resend.

### 3.7 `services/automation-service`

- AI-assisted candidate-job matching with explainable scoring
- Fraud detection and anomaly monitoring
- Rule-based automation execution with human approval workflows
- Marketplace metrics aggregation and health scoring
- **V2 Implementation Complete**: Uses standardized 5-route pattern
  - `/v2/matches`, `/v2/fraud`, `/v2/rules`, `/v2/metrics`
  - Admin-gated access for sensitive operations
  - Event-driven automation triggers
- Handles:
  - Match generation and review
  - Fraud signal detection and admin workflows
  - Automated actions (stage advances, notifications, etc.)
  - Daily metrics and analytics

Copilot:  
**For new automation features, use V2 patterns**. This service orchestrates intelligent automation and monitoring. Keep it focused on matching, fraud detection, automation rules, and metrics - not core ATS or billing logic.

### 3.8 `services/ai-service`

- AI-powered candidate-job fit analysis and scoring
- **V2 Implementation Complete**: Uses standardized 5-route pattern
  - `/v2/reviews` - Generate and retrieve AI reviews
  - Event-driven architecture - publishes `ai_review.completed` events
  - No direct service-to-service HTTP calls
- Handles:
  - Resume analysis and skill extraction
  - Job requirement matching
  - Fit scoring with confidence levels
  - Review recommendations (good_fit, poor_fit, etc.)
- Dependencies: Document text extraction required for quality analysis
- Event flow: Triggered by application creation → analyzes fit → publishes results

Copilot:  
**For new AI features, use V2 patterns**. This service owns AI analysis logic. Do not make HTTP calls to other services - use database queries and events only.

### 3.9 `services/document-service`

- Universal document storage using Supabase Storage
- **V2 Implementation Complete**: Uses standardized 5-route pattern
  - `/v2/documents`
  - Role-based access to documents
  - Pre-signed URL generation and validation
- Handles uploads for:
  - Candidate resumes and cover letters
  - Job descriptions and company documents
  - Contracts and agreements (future)
- Provides secure pre-signed URLs for uploads/downloads
- File type validation and size limits
- Multi-entity attachments (candidates, jobs, applications, companies)
- **CRITICAL**: Document text extraction pipeline needed (see section 10.1)

Copilot:  
**For new document features, use V2 patterns**. All file storage operations should go through this service. Do not implement file handling in other services.

---

## 4. Frontend Guidelines (`apps/portal`)

When Copilot generates React/Next.js code:

1. **Routing**
   - Use Next.js 16 **App Router** (`app/` directory, server components first where reasonable).
   - All authenticated routes MUST be placed in the `(authenticated)` route group folder: `app/(authenticated)/`.
   - Keep routes grouped by domain:
     - `(authenticated)/portal/dashboard`, `(authenticated)/roles`, `(authenticated)/roles/[id]`, `(authenticated)/candidates`, `(authenticated)/placements`, `(authenticated)/admin`, etc.
   - NEVER create duplicate route groups like `(dashboard)` - always use `(authenticated)` for protected pages.

2. **Data Fetching & Performance** ⚠️ **CRITICAL FOR PAGE SPEED**
   - Use fetch / Axios to call **`/api/v2/*`** routes through `api-gateway`, not individual services
   - **shared-api-client automatically prepends `/api/v2` to all requests** - frontend calls use simple paths like `/candidates`, not `/api/v2/candidates`
   - Handle auth via Clerk (session, tokens) and send bearer token to gateway
   - **V2 API Response Format**: All V2 endpoints return `{ data: <payload>, pagination?: <pagination> }`
   - **No `/me` endpoints**: Use filtered queries (e.g., `/api/v2/candidates?limit=1` for current user)
   
   **Progressive Loading Pattern** (REQUIRED for all detail/list pages):
   - **Load critical data first**: Fetch primary entity (candidate, job, application) immediately to show page structure (~100-200ms).
   - **Async load secondary data**: Use multiple independent `useEffect` hooks to load related data in parallel (applications, relationships, stats).
   - **Individual loading states**: Each section should have its own loading state and spinner. Never block entire page while loading secondary data.
   - **Lazy load modal/drawer data**: Only fetch data when user opens a modal or drawer. Don't load data "just in case".
   - **Error boundaries per section**: Errors in one section shouldn't break the entire page. Show error state for that section only.
   
   **Backend Query Optimization**:
   - **Use enriched endpoints with SQL JOINs**: Create endpoints that return related data in a single query (e.g., `/candidates/:id/applications-with-jobs`) to eliminate N+1 query problems.
   - **Never rely on sequential API calls**: If you need job data for 10 applications, the backend should JOIN and return enriched data, not force 10 separate API calls.
   - **Prefer server-side enrichment**: Backend services should use Supabase `.select('*, related_table(*)')` syntax to fetch related data in one query.
   
   **Example** (V2 Pattern for candidate detail page):
   ```tsx
   // ✅ CORRECT - V2 Progressive loading with independent states
   const [candidate, setCandidate] = useState(null);
   const [loading, setLoading] = useState(true);
   const [applications, setApplications] = useState([]);
   const [applicationsLoading, setApplicationsLoading] = useState(true);
   const [recruiters, setRecruiters] = useState([]);
   const [recruitersLoading, setRecruitersLoading] = useState(true);
   
   // Load primary data immediately (V2 API)
   useEffect(() => {
     async function loadCandidate() {
       const res = await client.get(`/api/v2/candidates/${id}`);
       setCandidate(res.data);
       setLoading(false);
     }
     loadCandidate();
   }, [id]);
   
   // Load secondary data in parallel (V2 APIs)
   useEffect(() => {
     async function loadApplications() {
       // V2 API with enriched data - applications WITH job data
       const res = await client.get(`/api/v2/applications?candidate_id=${id}&include=job,recruiter`);
       setApplications(res.data);
       setApplicationsLoading(false);
     }
     if (candidate) loadApplications();
   }, [candidate]);
   
   useEffect(() => {
     async function loadRecruiters() {
       // V2 API with enriched recruiter metadata
       const res = await client.get(`/api/v2/recruiter-candidates?candidate_id=${id}`);
       setRecruiters(res.data);
       setRecruitersLoading(false);
     }
     if (candidate) loadRecruiters();
   }, [candidate]);
   ```
   
   **Performance Impact**:
   - Time to first content: 100-200ms (vs 3-5s with monolithic loading)
   - Time to full page: 500ms-1s (vs 5-10s with sequential calls)
   - Network requests: 4-5 requests (vs 15-20+ with N+1 queries)
   
   **Anti-patterns to AVOID**:
   - ❌ Loading all data in one monolithic `useEffect` that blocks page render
   - ❌ Sequential API calls where each waits for the previous to complete
   - ❌ N+1 query patterns (1 query for list + N queries for details)
   - ❌ Loading modal data upfront when user might never open the modal
   - ❌ Single loading state for entire page causing blank screen until all data loads

3. **UI & Styling**
   - Use TailwindCSS utility classes and **DaisyUI** components (e.g. `btn`, `card`, `badge`, `alert`).
   - Prefer clean, utility-style UI similar to Lever:
     - Lots of whitespace.
     - Simple cards and tables.
     - Subtle borders and status pills.

4. **Forms & Validation**
   - Use controlled components or `react-hook-form` if already present.
   - Validate required fields (e.g., candidate name/email, job title) both client-side and server-side.
   - **IMPORTANT**: Follow the form control patterns defined in [`docs/guidance/form-controls.md`](../docs/guidance/form-controls.md).
     - Always use `fieldset` wrapper, NOT `form-control`
     - Use simple label markup: `<label className="label">Text</label>`
     - Never use `-bordered` suffixes on inputs, selects, or textareas

5. **No Business Logic in Components**
   - Components should orchestrate calls to the gateway and display data.
   - Domain rules (allowed stage transitions, fee calculations, etc.) belong in services.

---

## 5. V2 Backend Architecture Patterns

**IMPORTANT**: For services with V2 implementations (ATS, Network, Billing, Document, Notification, Automation, AI), always use V2 patterns. Only use V1 patterns for services not yet migrated (Identity).

### 5.1 V2 Folder Structure (Domain-Based)

```
services/ats-service/src/v2/
├── shared/                 # Shared V2 utilities
│   ├── events.ts           # EventPublisher class
│   ├── helpers.ts          # requireUserContext, validation
│   └── pagination.ts       # PaginationParams, PaginationResponse
├── jobs/                   # Jobs domain
│   ├── types.ts            # JobFilters, JobUpdate
│   ├── repository.ts       # Job CRUD methods (~100-150 lines)
│   └── service.ts          # JobServiceV2 with validation
├── companies/              # Companies domain
│   ├── types.ts            # CompanyFilters, CompanyUpdate
│   ├── repository.ts       # Company CRUD methods
│   └── service.ts          # CompanyServiceV2
├── candidates/             # Candidates domain (etc.)
└── routes.ts               # All V2 routes (imports from domains)
```

### 5.2 V2 Standardized 5-Route Pattern

**Every V2 resource** follows this exact pattern:

```typescript
// 1. LIST - Role-scoped collection  
GET /v2/:resource?search=X&status=Y&sort_by=Z&page=1&limit=25
Response: { data: [...], pagination: { total, page, limit, total_pages } }

// 2. GET BY ID - Single resource
GET /v2/:resource/:id?include=related1,related2
Response: { data: {...} }

// 3. CREATE - New resource
POST /v2/:resource
Body: { field1: value1, field2: value2, ... }
Response: { data: {...} }

// 4. UPDATE - Single method handles ALL updates
PATCH /v2/:resource/:id
Body: { field1: newValue1, status: newStatus, ... }
Response: { data: {...} }

// 5. DELETE - Soft delete
DELETE /v2/:resource/:id
Response: { data: { message: 'Deleted successfully' } }
```

### 5.3 V2 Repository Pattern

```typescript
import { resolveAccessContext } from '@splits-network/shared-access-context';

export class CandidateRepositoryV2 {
  constructor(private supabase: SupabaseClient) {}

  async list(clerkUserId: string, filters: CandidateFilters) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const query = this.supabase
      
      .from('candidates')
      .select('*');
      
    // Role-based filtering from access context
    if (context.role === 'candidate') {
      query.eq('user_id', context.userId);
    } else if (context.role === 'recruiter') {
      // Filter to assigned candidates via recruiter_candidates
      const { data: assignments } = await this.supabase
        
        .from('recruiter_candidates')
        .select('candidate_id')
        .eq('recruiter_user_id', context.userId);
      query.in('id', assignments?.map(a => a.candidate_id) || []);
    } else if (context.isCompanyUser) {
      query.in('company_id', context.accessibleCompanyIds);
    }
    // Platform admins see everything (no filter)
    
    // Apply search/sorting filters
    if (filters.search) {
      query.ilike('name', `%${filters.search}%`);
    }
    
    return query;
  }

  async update(id: string, clerkUserId: string, updates: CandidateUpdate) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const query = this.supabase
      
      .from('candidates')
      .update(updates)
      .eq('id', id);
      
    // Apply same role-based filtering for updates
    if (context.role === 'candidate') {
      query.eq('user_id', context.userId);
    }
    
    return query.select().single();
  }
}
```

### 5.4 V2 Service Pattern (Single Update Method)

```typescript
export class CandidateServiceV2 {
  constructor(
    private repository: CandidateRepositoryV2,
    private events: EventPublisher
  ) {}

  async update(id: string, clerkUserId: string, updates: CandidateUpdate) {
    // Smart validation based on what's being updated
    if (updates.status) {
      this.validateStatusTransition(updates.status);
    }
    if (updates.email) {
      await this.validateEmailUnique(updates.email);
    }
    
    const updated = await this.repository.update(id, clerkUserId, updates);
    
    // Publish events after successful update
    await this.events.publish('candidate.updated', {
      candidateId: id,
      changes: Object.keys(updates),
      updatedBy: clerkUserId
    });
    
    return updated;
  }
}
```

---

## 6. Legacy Backend Code Style & Patterns (V1)

**Note**: Use these patterns only for services not yet migrated to V2 (Identity service).

Copilot should follow these patterns for V1 services:

1. **Fastify Setup**
   - Use a central `buildServer` function (if present) per service.
   - Register routes in feature-specific modules (e.g., `routes/jobs.ts`, `routes/applications.ts`).

2. **Layering**
   - Controller/route handlers: translate HTTP ↔ DTO / service calls.
   - Service layer: domain logic (e.g., `AtsService`, `BillingService`).
   - Data layer: repository functions that talk to Postgres (via Supabase client or pg library).

3. **Error Handling**
   - Use appropriate HTTP status codes:
     - `400` for validation issues.
     - `401`/`403` for auth/permission issues.
     - `404` when a resource is not found.
     - `409` for conflicts (e.g., duplicate submissions).
   - Prefer structured errors over generic `Error` when practical.
   - Return errors in standard format: `{ error: { code: "ERROR_CODE", message: "..." } }`

4. **API Response Format**
   - **ALL successful responses MUST use**: `reply.send({ data: <payload> })`
   - **NEVER return unwrapped data**: `reply.send(payload)` is incorrect
   - See `docs/guidance/api-response-format.md` for complete standard
   - API Gateway proxies responses as-is, so backend services MUST wrap correctly
   - Frontend clients expect and unwrap the `{ data: ... }` envelope

5. **TypeScript**
   - Use explicit types and interfaces for:
     - Request DTOs.
     - Response DTOs.
     - Domain models.
   - Reuse shared types from `packages/shared-types` wherever possible.

6. **Config & Secrets**
   - Use `packages/shared-config` to load environment variables.
   - Never hardcode API keys (Stripe, Resend, Clerk, etc.).
   - Assume Kubernetes Secrets are wired to env vars.

7. **Database Migrations**
   - Each service owns migrations for its schema only.
   - Use Supabase migration tools or SQL migration files.
   - Never create hard foreign keys across schemas unless absolutely necessary.
   - Prefer referencing by ID and resolving via service calls.
   - Example: `companies.identity_organization_id` references `organizations.id` logically, not via DB FK.

8. **User Identification Standards** ⚠️ **CRITICAL**
   - **Frontend apps** (Portal, Candidate): 
     - Send **ONLY** Authorization Bearer token (Clerk JWT)
     - **NEVER** manually set `x-clerk-user-id` or user ID headers
   - **API Gateway**:
     - Extract Clerk user ID from verified JWT
     - **ALWAYS** use `req.auth.clerkUserId` when setting `x-clerk-user-id` header to backend services
     - **NEVER** use `req.auth.userId` (internal ID) when setting headers
   - **Backend Services**:
     - Extract user ID from headers: `const clerkUserId = request.headers['x-clerk-user-id'] as string;`
     - **ALWAYS** use variable name `clerkUserId` (not `userId`) for clarity
     - **NEVER** use `x-user-email` header for authentication (removed - security risk)
     - Look up candidates/recruiters by Clerk user ID, not email
   - See `docs/guidance/user-identification-standard.md` for complete implementation guide

9. **Authorization & RBAC**
   - **V2 Services**: Use shared access context from `@splits-network/shared-access-context`
     - Repository methods call `resolveAccessContext(clerkUserId, supabase)` to get user roles and filtering logic
     - Backend services apply role-based filtering in Supabase queries
     - No authorization middleware needed - access control is data-level
   - **V1 Services (legacy)**: API Gateway enforces authorization using `services/api-gateway/src/rbac.ts`
     - Backend services trust headers from api-gateway: `x-clerk-user-id`, `x-user-role`
     - Services focus on business logic, gateway handles RBAC

---

## 6. Authorization & RBAC

### V2 Authorization (Access Context Pattern)

**V2 services** (ATS, Network, Billing, Document, Notification, Automation, AI) use shared access context for data-level authorization:

```typescript
import { resolveAccessContext } from '@splits-network/shared-access-context';

// In repository methods
const context = await resolveAccessContext(clerkUserId, supabase);
// Context includes: userId, role, memberships, accessibleCompanyIds, etc.

// Apply role-based filtering in Supabase queries
if (context.role === 'candidate') {
  query.eq('user_id', context.userId); // See only own data
} else if (context.role === 'company_admin') {
  query.in('company_id', context.accessibleCompanyIds); // See company data
}
// Platform admins see everything (no filter)
```

**Benefits**:
- No `/me` endpoints needed - filtered queries handle user-scoped access
- Consistent access control across all V2 services
- Data-level security - impossible to bypass with malformed requests
- Single source of truth for role resolution

### V1 Authorization (Gateway Middleware - Legacy)

**V1 services** (Identity) use centralized authorization in `services/api-gateway/src/rbac.ts`. Backend services **MUST NOT** implement authorization - they should trust the API Gateway.

**Single Source of Truth**: API Gateway enforces all RBAC via the `requireRoles()` middleware.

**Flow**:
1. Request hits API Gateway
2. Clerk JWT verified, user context loaded (memberships)
3. `requireRoles()` middleware checks authorization:
   - Check memberships for company-affiliated roles (fast path)
   - Check network service for independent recruiters
   - Deny if no match
4. If authorized, request proxied to backend service with headers:
   - `x-clerk-user-id`: User ID
   - `x-user-role`: Role (for logging)
5. Backend service processes request without authorization checks

**V2 Backend Service Pattern**:
```typescript
// ✅ CORRECT - V2 uses access context for data-level authorization
export class CandidateRepositoryV2 {
  async list(clerkUserId: string, filters: CandidateFilters) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const query = this.supabase.from('candidates').select('*');
    
    // Access context handles role-based filtering
    if (context.role === 'candidate') {
      query.eq('user_id', context.userId);
    } else if (context.isRecruiter) {
      // Filter to assigned candidates
      const assignments = await this.getRecruiterAssignments(context.userId);
      query.in('id', assignments.map(a => a.candidate_id));
    }
    
    return query;
  }
}
```

**V1 Backend Service Pattern (Legacy)**:
```typescript
// ❌ WRONG - Do not check authorization in V1 backend services
if (!isRecruiter(userId)) {
  throw new ForbiddenError('Only recruiters can access this');
}

// ✅ CORRECT - Trust the gateway, focus on business logic
// If request made it here, user is authorized
const candidates = await candidateRepository.list(userId);
```

### 6.2 requireRoles() Middleware

Use `requireRoles()` as preHandler on all protected endpoints in `api-gateway`.

**Signature**:
```typescript
requireRoles(allowedRoles: UserRole[], services?: ServiceRegistry)
```

**Parameters**:
- `allowedRoles`: Array of roles that can access this endpoint
  - `'platform_admin'`: Platform administrators
  - `'company_admin'`: Company administrators
  - `'hiring_manager'`: Hiring managers
  - `'recruiter'`: Recruiters (both affiliated and independent)
- `services`: **REQUIRED** when allowing recruiters to enable network service check

**Example**:
```typescript
import { requireRoles } from '../rbac';

export async function candidatesRoutes(
  app: FastifyInstance, 
  services: ServiceRegistry
) {
  // Protected endpoint - requires recruiter or admin
  app.get('/api/candidates', {
    preHandler: requireRoles(
      ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'],
      services  // ← CRITICAL: Pass services for recruiter check
    ),
    schema: { /* ... */ }
  }, async (request, reply) => {
    // User is authorized if we reach here
    const data = await atsService().get('/candidates', /* ... */);
    return reply.send({ data });
  });
}
```

**Critical Rules**:
- **ALWAYS pass `services` parameter** when allowing recruiters or candidates
- Without services parameter, independent recruiters and candidates (no memberships) will be denied
- Services parameter enables network service check for recruiters and ATS service check for candidates

### 6.3 Role Helpers

Helper functions in `rbac.ts` check user roles. These are used by frontend components and can be used in route handlers when needed.

**Available Helpers**:
```typescript
// Check if user is platform admin
function isPlatformAdmin(memberships: MembershipRecord[]): boolean

// Check if user is company admin (for specific or any org)
function isCompanyAdmin(
  memberships: MembershipRecord[], 
  orgId?: string
): boolean

// Check if user is hiring manager (for specific or any org)
function isHiringManager(
  memberships: MembershipRecord[], 
  orgId?: string
): boolean

// Check if user is company user (admin or hiring manager)
function isCompanyUser(
  memberships: MembershipRecord[], 
  orgId?: string
): boolean

// Check if user is recruiter (membership or network service)
async function isRecruiter(
  memberships: MembershipRecord[], 
  userId: string,
  networkService: NetworkServiceClient
): Promise<boolean>
```

**Usage Pattern**:
```typescript
// In route handler, after requireRoles() has authorized
const userMemberships = request.auth.memberships || [];
const userId = request.auth.userId;

// Check specific role for business logic
if (isCompanyAdmin(userMemberships, orgId)) {
  // Allow company admin to see all org candidates
  query.organizationId = orgId;
} else if (await isRecruiter(userMemberships, userId, services.network)) {
  // Limit independent recruiter to their assigned candidates
  query.recruiterId = userId;
}
```

**Note**: Role helpers are for **business logic**, not authorization. Authorization is enforced by `requireRoles()` middleware.

### 6.4 Independent Recruiters

Independent recruiters are users without company affiliations (no memberships).

**Storage**: `recruiters` table
**Identification**: `GET /recruiters/by-user/:userId` returns recruiter with `status: 'active'`
**Authorization**: Network service check in `requireRoles()` grants access

**Why Network Service Check**:
- Recruiters can exist without company memberships
- They need access to marketplace jobs and candidates
- `memberships` won't include them
- Must query network service to verify recruiter status

**Pattern**:
```typescript
// ✅ CORRECT - Services parameter enables network check
app.get('/api/jobs', {
  preHandler: requireRoles(['recruiter', 'company_admin'], services),
}, async (request, reply) => {
  // Independent recruiters can access this
});

// ❌ WRONG - No services parameter = independent recruiters denied
app.get('/api/jobs', {
  preHandler: requireRoles(['recruiter', 'company_admin']),
}, async (request, reply) => {
  // Independent recruiters will get 403 Forbidden
});
```

### 6.4.1 Candidates

Candidates are authenticated users with profiles in the ATS service but no memberships.

**Storage**: `candidates` table
**Identification**: `GET /candidates?email={email}` returns candidate profile
**Authorization**: ATS service check in `requireRoles()` grants access

**Why ATS Service Check**:
- Candidates don't have company affiliations (no memberships)
- They need access to their profile and recruiter relationships
- `memberships` won't include them
- Must query ATS service to verify candidate profile exists

**Pattern**:
```typescript
// ✅ CORRECT - Services parameter enables ATS check
app.get('/api/candidates/me/recruiters', {
  preHandler: requireRoles(['candidate'], services),
}, async (request, reply) => {
  // Candidates with profiles can access this
});

// ❌ WRONG - No services parameter = candidates denied
app.get('/api/candidates/me/recruiters', {
  preHandler: requireRoles(['candidate']),
}, async (request, reply) => {
  // Candidates will get 403 Forbidden
});
```

### 6.5 Backend Service Implementation

Backend services (ATS, network, billing, etc.) **MUST NOT** check authorization.

**Correct Pattern**:
```typescript
// services/ats-service/src/routes.ts
export async function candidatesRoutes(app: FastifyInstance) {
  app.get('/candidates', async (request, reply) => {
    // Gateway already authorized - trust it
    const userId = request.headers['x-clerk-user-id'] as string;
    const userRole = request.headers['x-user-role'] as string;
    
    // Business logic only
    const candidates = await candidateRepository.listForUser(userId);
    return reply.send({ data: candidates });
  });
}
```

**Incorrect Pattern**:
```typescript
// ❌ WRONG - Do not check roles in backend services
export async function candidatesRoutes(app: FastifyInstance) {
  app.get('/candidates', async (request, reply) => {
    const userRole = request.headers['x-user-role'] as string;
    
    // This duplicates gateway authorization and will cause bugs
    if (!['recruiter', 'admin'].includes(userRole)) {
      return reply.code(403).send({ 
        error: 'Forbidden: Only recruiters and admins can list candidates' 
      });
    }
    
    // Business logic...
  });
}
```

**Why No Service-Level Authorization**:
- Duplicates logic (harder to maintain)
- Creates inconsistencies (gateway allows, service denies)
- Violates separation of concerns
- Makes debugging harder (multiple auth points)
- Gateway already enforced RBAC before proxying

**Service Responsibility**:
- Process business logic
- Access data layer
- Return results
- Trust gateway has authorized request

### 6.6 Common Patterns

**Pattern 1: Read Operations** (candidates, jobs, applications)
```typescript
app.get('/api/candidates', {
  preHandler: requireRoles(
    ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'],
    services
  ),
}, async (request, reply) => { /* ... */ });
```

**Pattern 2: Write Operations** (create, update)
```typescript
app.post('/api/candidates', {
  preHandler: requireRoles(['recruiter', 'platform_admin'], services),
}, async (request, reply) => { /* ... */ });
```

**Pattern 3: Admin-Only Operations**
```typescript
app.delete('/api/users/:id', {
  preHandler: requireRoles(['platform_admin']),
  // No services needed - platform_admin always in memberships
}, async (request, reply) => { /* ... */ });
```

**Pattern 4: Company-Scoped Operations**
```typescript
app.get('/api/companies/:companyId/jobs', {
  preHandler: requireRoles(
    ['company_admin', 'hiring_manager', 'platform_admin'],
    services
  ),
}, async (request, reply) => {
  // Additional business logic check (not authorization)
  const memberships = request.auth.memberships || [];
  const companyId = request.params.companyId;
  
  if (!isPlatformAdmin(memberships) && 
      !isCompanyUser(memberships, companyId)) {
    throw new ForbiddenError('Access denied to this company');
  }
  
  // Proceed with business logic...
});
```

---

## 7. Events, Redis, and Resend

### 6.1 Events (RabbitMQ)

Copilot should:

- Encourage small, domain-oriented events.
- Use consistent naming like `application.created`, `application.stage_changed`, `placement.created`.
- Include IDs and minimal context, not whole objects.

### 6.2 Redis

- Use Redis for rate limiting and simple caching where needed.
- Do not use Redis as a primary data store.

### 6.3 Resend (Email)

- All email sending should go through `notification-service` and **Resend**.
- Use the Resend Node SDK if available in the repo; otherwise use their HTTP API.
- Keep email content simple and transactional in Phase 1 (no heavy templating engine unless added to the project).

---

## 7. CI/CD & Infra Expectations

Copilot should assume:

- CI/CD is done via **GitHub Actions** workflows (`.github/workflows/*.yml`).
- Docker images are built for each service/app.
- `infra/k8s/**` contains raw Kubernetes manifests for Deployments, Services, and Ingress.
- Deploy steps run `kubectl apply -f infra/k8s/<service>/` with updated image tags.

When suggesting infra changes:

- Prefer editing existing YAML manifests instead of inventing Helm charts.
- Keep manifests explicit and readable.

---

## 8. Initial Setup & Getting Started

When setting up new services or apps:

1. **New Service Setup**
   - Create directory under `services/<service-name>/`.
   - Add `package.json` with workspace reference: `"name": "@splits-network/<service-name>"`.
   - Create `src/` directory with `index.ts` or `server.ts` entry point.
   - Add `tsconfig.json` extending shared config if available.
   - Create `Dockerfile` for containerization.
   - Add corresponding Kubernetes manifests in `infra/k8s/<service-name>/`.

2. **New Schema Setup**
   - Use Supabase MCP tools or SQL migrations.
   - Create schema: `CREATE SCHEMA IF NOT EXISTS <service_schema>;`
   - Store migrations in service directory (e.g., `services/ats-service/migrations/`).
   - Document schema ownership in service README.

3. **References**
   - **V2 Architecture**: See `docs/migration/v2/V2-ARCHITECTURE-IMPLEMENTATION-GUIDE.md` for complete V2 patterns
   - **V2 Progress**: See `docs/migration/v2/V2-IMPLEMENTATION-PROGRESS.md` for implementation status
   - **V2 Context**: See `AGENTS.md` for additional V2 guidelines and requirements
   - See `docs/splits-network-architecture.md` for detailed service responsibilities
   - See `docs/splits-network-phase1-prd.md` for Phase 1 scope and data models
   - See `docs/guidance/form-controls.md` for form implementation standards
   - See `docs/guidance/user-roles-and-permissions.md` for comprehensive RBAC, user roles, capabilities, restrictions, API endpoints, and workflows
   - See `docs/guidance/api-response-format.md` for API response format standards (all endpoints must comply)
   - See `docs/guidance/pagination.md` for pagination implementation standards
   - See `docs/guidance/grid-table-view-switching.md` for implementing grid/table view toggles
   - See `docs/guidance/service-architecture-pattern.md` for service layer patterns
   - Check `.vscode/mcp.json` for configured Supabase MCP server

---

## 9. How to Help the Human Best

Copilot should prioritize:

1. **V2 patterns first** - For services with V2 implementations, always suggest V2 approaches
2. **Small, focused suggestions** that respect the existing patterns
3. **Completing existing code** over generating large new abstractions
4. **Using existing helpers** from `packages/*` and `@splits-network/shared-access-context`
5. **Explaining assumptions in comments** when generating complex logic
6. **Checking V2 docs first** – reference `docs/migration/v2/` and `AGENTS.md` for V2 patterns

When working with services:

**V2 Services** (ATS, Network, Billing, Document, Notification, Automation, AI):
- Use standardized 5-route pattern
- Use domain-based folder structure under `v2/`
- Use shared access context for authorization
- Single update methods with smart validation
- Direct Supabase queries with role-based filtering
- Event-driven coordination (no HTTP service calls)

**V1 Services** (Identity - not yet migrated):
- Use legacy patterns until V2 migration
- Follow gateway-based authorization

When unsure about a domain decision, Copilot should lean toward:

- **V2 standardized patterns** over custom solutions
- Thin controllers with business logic in services
- Clear domain separation
- Simple, explicit data models
- Explicit > implicit (prefer obvious code over clever abstractions)

Splits Network should feel like a **clean, well-structured recruiting and payouts platform** with **consistent, predictable APIs**, not a ball of mud.

---

## 10. Critical Known Issues ⚠️

### 10.1 Document Text Extraction Bug (BLOCKING AI REVIEWS)

**Status:** Critical bug discovered January 2, 2026  
**Impact:** AI reviews fail because resume text cannot be read  
**Documentation:** `docs/implementation-plans/ai-flow-gap-analysis.md` section 2.1

**Problem:**
AI service expects `document.extracted_text` as a direct property, but the database schema stores extracted text in `document.metadata.extracted_text` (JSONB field). This causes all AI reviews to fail with "no resume text available."

**Database Schema:**
```sql
-- documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    filename VARCHAR,
    storage_path TEXT,
    processing_status processing_status DEFAULT 'pending',  -- enum: pending/processing/processed/failed
    metadata JSONB DEFAULT '{}',  -- ✅ Text stored here as metadata.extracted_text
    -- ❌ NO extracted_text column exists!
);
```

**Root Cause:**
Document processing service doesn't exist yet. Documents are stored but no text extraction pipeline processes them from `processing_status='pending'` to `'processed'` with extracted text in `metadata.extracted_text`.

**Current Code:**
```typescript
// services/ai-service/src/v2/reviews/service.ts - CORRECTLY reads from metadata
if (primaryResume && primaryResume.metadata?.extracted_text) {
    resumeText = primaryResume.metadata.extracted_text;
} else {
    console.warn('No resume text available for analysis');
    // Falls back to job description analysis only
}
```

**Implementation Required:**
Document processing service needs to be implemented:
1. Create separate `document-processing-service` (CPU-intensive operations)
2. Add dependencies: `pdf-parse` (PDFs), `mammoth` (DOCX), OpenAI embeddings
3. Listen for `document.uploaded` events via RabbitMQ
4. Process documents asynchronously: extract text → store in `metadata.extracted_text`
5. Update `processing_status`: pending → processing → processed/failed
6. Publish `document.processed` event when complete
7. Process 99+ existing pending documents retroactively

See `docs/guidance/document-processing-service.md` for complete implementation guide.

**Important Rules:**
- ✅ Always access document text via `document.metadata?.extracted_text`
- ✅ Check `document.processing_status` before expecting text
- ✅ Use optional chaining for JSONB fields: `metadata?.property`
- ❌ Never expect `extracted_text` as direct property on document
- ❌ Don't assume existing documents have extracted text (99 documents need processing)

**Related Components:**
- `services/ai-service/src/v2/reviews/service.ts` - needs immediate fix
- `services/ats-service/src/v2/applications/repository.ts` - correctly returns metadata field
- `services/document-service/` - needs text extraction implementation
- `documents` table - JSONB metadata structure
