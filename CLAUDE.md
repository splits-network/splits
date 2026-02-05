# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Splits Network is a **split-fee recruiting marketplace** with a **microservice-first** architecture and a **Next.js portal** frontend. The platform connects recruiters, hiring companies, and candidates in a marketplace model.

## Common Commands

```bash
# Install dependencies (from repo root)
pnpm install

# Development
pnpm --filter @splits-network/<name> dev    # Run a specific service/app in dev mode
pnpm --filter @splits-network/portal dev    # Run portal at localhost:3100
pnpm --filter @splits-network/ats-service dev

# Build
pnpm --filter @splits-network/<name> build  # Build specific package
pnpm build                                   # Build all (packages → services → apps)

# Testing
pnpm --filter @splits-network/<name> test   # Test specific service
pnpm test                                    # Test all

# Linting
pnpm --filter @splits-network/<name> lint
```

## Architecture

### Monorepo Structure

```
apps/                     # User-facing frontends ONLY
├─ portal/                # Main authenticated app (Next.js 16, App Router)
├─ candidate/             # Candidate-facing portal
└─ corporate/             # Marketing site

services/                 # Backend APIs (Fastify + TypeScript)
├─ api-gateway/           # Routes to domain services, auth (Clerk JWT), rate limiting
├─ identity-service/      # Users, orgs, memberships
├─ ats-service/           # Jobs, candidates, applications, placements
├─ network-service/       # Recruiters, assignments, proposals
├─ billing-service/       # Plans, subscriptions, Stripe, payouts
├─ notification-service/  # Event-driven email (Resend)
├─ automation-service/    # AI matching, fraud detection
├─ ai-service/            # AI-powered candidate-job fit analysis
└─ document-service/      # File storage (Supabase Storage)

packages/                 # Shared code (NOT directly deployable)
├─ shared-types/          # Domain types, DTOs
├─ shared-config/         # Config/env loader
├─ shared-logging/        # Logging utilities
├─ shared-fastify/        # Fastify plugins, common middleware
├─ shared-clients/        # Typed HTTP/SDK clients
├─ shared-access-context/ # V2 RBAC - resolveAccessContext()
├─ shared-api-client/     # Frontend API client
├─ shared-ui/             # Standardized UI components (loading, browse, markdown, etc.)
└─ shared-job-queue/      # Job queue abstraction (RabbitMQ)
```

### Key Architecture Rules

1. **No backend logic in `apps/`** - all APIs go in `services/*`
2. **No HTTP calls between services** - use direct database queries or RabbitMQ events
3. **Single Supabase Postgres database** - schema-per-service pattern with cross-schema JOINs allowed
4. **Frontend calls `api-gateway` only** - never individual domain services
5. **Server-side pagination/filtering** - client-side filtering does NOT scale

### V2 API Pattern (Use for Most Services)

V2 services (ATS, Network, Billing, Document, Notification, Automation, AI) follow standardized patterns:

```
services/<service>/src/v2/
├── shared/              # EventPublisher, helpers, pagination
├── <domain>/            # e.g., jobs/, candidates/
│   ├── types.ts         # Filters, update types
│   ├── repository.ts    # CRUD with role-based filtering
│   └── service.ts       # Validation, events
└── routes.ts            # All V2 routes
```

**5-Route Pattern per Resource:**
- `GET /v2/:resource` - LIST with pagination
- `GET /v2/:resource/:id` - GET single
- `POST /v2/:resource` - CREATE
- `PATCH /v2/:resource/:id` - UPDATE (single method handles all updates)
- `DELETE /v2/:resource/:id` - Soft delete

**V2 Authorization (Access Context):**
```typescript
import { resolveAccessContext } from '@splits-network/shared-access-context';

async list(clerkUserId: string, filters: Filters) {
  const context = await resolveAccessContext(clerkUserId, this.supabase);
  // Role-based filtering applied automatically
}
```

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS, DaisyUI, Clerk auth
- **Backend**: Fastify, TypeScript, Supabase Postgres
- **Infra**: Kubernetes (raw YAML), Redis, RabbitMQ
- **3rd Party**: Clerk (auth), Stripe (payments), Resend (email)

## Guidance Documents

Key standards in `docs/guidance/`:
- `api-response-format.md` - All responses use `{ data: <payload> }` envelope
- `form-controls.md` - Use `fieldset` wrapper, no `-bordered` suffixes
- `pagination.md` - StandardListParams/StandardListResponse
- `user-identification-standard.md` - Always use `clerkUserId`, never set headers from frontend
- `loading-patterns-usage-guide.md` - Standardized loading components (use `@splits-network/shared-ui`)
- `loading-states-patterns.md` - Comprehensive loading patterns audit and analysis

## Naming Conventions

- **Files/folders**: kebab-case (e.g., `user-profile.tsx`, `api-client/`)
- **Variables/functions**: camelCase
- **Icons**: FontAwesome inline (`<i className='fa-duotone fa-regular fa-icon'>`)

## Critical Patterns

### Frontend Data Loading (Progressive)
```tsx
// Load primary data immediately
useEffect(() => { loadCandidate(); }, [id]);

// Load secondary data in parallel after primary
useEffect(() => {
  if (candidate) {
    loadApplications();  // Independent state
    loadRecruiters();    // Independent state
  }
}, [candidate]);
```

### API Response Format
```typescript
// Backend - ALWAYS wrap in data envelope
reply.send({ data: payload });

// List responses include pagination
reply.send({ data: items, pagination: { total, page, limit, total_pages } });
```

### User Identification
- Frontend: Send only Authorization Bearer token (Clerk JWT)
- API Gateway: Extract from JWT, set `x-clerk-user-id` header
- Backend: Read `request.headers['x-clerk-user-id']`

### Loading States (Standardized)

**ALWAYS use components from `@splits-network/shared-ui` for loading states.**

```tsx
import {
    LoadingState,           // Full page/section loading
    LoadingSpinner,         // Core spinner component
    SkeletonLoader,         // Content placeholders
    ButtonLoading,          // Button loading states
    ModalLoadingOverlay,    // Modal loading
    ChartLoadingState,      // Chart/analytics loading
} from '@splits-network/shared-ui';
```

**Common Patterns:**

```tsx
// Full page loading
if (loading) {
    return <LoadingState message="Loading candidates..." />;
}

// Form button
<button disabled={submitting} className="btn btn-primary">
    <ButtonLoading loading={submitting} text="Save" loadingText="Saving..." />
</button>

// Modal loading
<dialog open={isOpen} className="modal">
    <div className="modal-box">
        <ModalLoadingOverlay loading={loading}>
            <FormContent />
        </ModalLoadingOverlay>
    </div>
</dialog>

// Chart loading
if (loading) {
    return <ChartLoadingState height={300} />;
}

// List skeleton (predictable layout)
if (loading) {
    return <SkeletonList count={10} variant="text-block" gap="gap-4" />;
}
```

**Size Guidelines:**
- `xs` - Inline actions, icon buttons
- `sm` - Form buttons, submissions
- `md` - Charts, content areas, modals
- `lg` - Full page loading

**Never manually create loading spinners.** Use standardized components for consistency.

See [docs/guidance/loading-patterns-usage-guide.md](./docs/guidance/loading-patterns-usage-guide.md) for complete documentation.
