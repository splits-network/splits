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
├─ document-service/      # File storage (Supabase Storage)
├─ analytics-service/     # Stats, charts, metrics aggregation
├─ analytics-gateway/     # WebSocket fan-out for real-time dashboard events
├─ chat-service/          # Conversations, messages, presence queries
├─ chat-gateway/          # WebSocket fan-out for real-time messaging
└─ health-monitor/        # System health monitoring

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
3. **Single Supabase Postgres database** - only 'public' and 'analytics' schemas, no separate DBs per service
4. **Frontend calls `api-gateway` only** - never individual domain services
5. **Server-side pagination/filtering** - client-side filtering does NOT scale
6. **Nano-service philosophy** - services should be focused in purpose and do one thing well. If a new purpose is identified, it should get its own service. Small, focused services are cheaper to run and easier to maintain than bloated multi-purpose ones.

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
useEffect(() => {
    loadCandidate();
}, [id]);

// Load secondary data in parallel after primary
useEffect(() => {
    if (candidate) {
        loadApplications(); // Independent state
        loadRecruiters(); // Independent state
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
    LoadingState, // Full page/section loading
    LoadingSpinner, // Core spinner component
    SkeletonLoader, // Content placeholders
    ButtonLoading, // Button loading states
    ModalLoadingOverlay, // Modal loading
    ChartLoadingState, // Chart/analytics loading
} from "@splits-network/shared-ui";
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
{isOpen && (
    <dialog className="modal modal-open">
        <div className="modal-box">
            <ModalLoadingOverlay loading={loading}>
                <FormContent />
            </ModalLoadingOverlay>
        </div>
    </dialog>
)}

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

### React 19 Patterns (CRITICAL)

**React 19 is stricter about DOM manipulation during animations.** Follow these patterns to prevent `insertBefore` crashes:

#### Modals: Use SafeModal Component

**NEVER use the `open` attribute on `<dialog>` elements.** It conflicts with React's reconciliation.

```tsx
// ❌ BAD: Causes insertBefore errors
<dialog className="modal" open={isOpen}>
    <div className="modal-box">...</div>
</dialog>

// ✅ GOOD: Use SafeModal from @splits-network/shared-ui
import { SafeModal, SafeModalHeader, SafeModalActions } from "@splits-network/shared-ui";

<SafeModal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
    <SafeModalHeader title="Edit Profile" onClose={() => setShowModal(false)} />
    <div className="space-y-4">
        {/* Modal content */}
    </div>
    <SafeModalActions>
        <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
            Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
            Save
        </button>
    </SafeModalActions>
</SafeModal>

// ✅ ALTERNATIVE: Manual conditional rendering
{showModal && (
    <dialog className="modal modal-open">
        <div className="modal-box">...</div>
    </dialog>
)}
```

#### Badges: Stable DOM Structure

**NEVER conditionally render badges during animations.** Use CSS visibility instead.

```tsx
// ❌ BAD: Conditional rendering during animations
{count > 0 && (
    <span className="badge badge-warning">
        {count}
    </span>
)}

// ✅ GOOD: Always render, hide with CSS
<span
    className={`badge badge-warning transition-opacity duration-200 ${
        count > 0 ? "opacity-100" : "opacity-0 w-0"
    }`}
>
    {count || 0}
</span>
```

#### State Updates: Use useTransition for Non-Urgent Updates

**Wrap non-urgent state updates in `useTransition`** to prevent conflicts with animations.

```tsx
import { useTransition } from "react";

const [isPending, startTransition] = useTransition();
const [badges, setBadges] = useState({});

// ✅ GOOD: Non-urgent badge updates
startTransition(() => {
    setBadges({ recruiters: 5, payouts: 3 });
});

// ✅ GOOD: Auto-expand sections
startTransition(() => {
    setOpenSections((prev) => {
        const combined = new Set([...prev, sectionId]);
        if (combined.size === prev.size) return prev; // Guard against no-op updates
        return combined;
    });
});
```

#### Key Principles

1. **Stable DOM structure** - Avoid creating/destroying elements during animations
2. **CSS for visibility** - Use `opacity-0 w-0` instead of conditional rendering
3. **useTransition for async updates** - Mark non-urgent updates to defer them
4. **Conditional rendering at component level** - `{isOpen && <Component />}` not `<Component open={isOpen} />`
5. **No `open` attribute on dialogs** - Use `modal-open` class with conditional rendering

See commit history (Feb 2025) for examples of fixing these patterns across 37+ modals.
