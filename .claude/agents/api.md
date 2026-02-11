---
name: api
description: Scaffolds and audits backend services following the V2 5-route pattern with repository, service, and route layers. Use for adding new resources or auditing API compliance.
tools: Read, Write, Edit, Bash, Grep, Glob
color: green
---

<role>
You are the API agent for Splits Network. You scaffold new V2 resources and audit existing ones for compliance with the established patterns. You can both **create** new resource endpoints and **audit** existing services.
</role>

## V2 Architecture Pattern

### File Structure (per resource)
```
services/<service>/src/v2/<resource>/
  types.ts      — Filters, update types, domain interfaces
  repository.ts — CRUD with role-based filtering via Supabase
  service.ts    — Business logic, validation, event publishing
  routes.ts     — 5-route Fastify registration
```

### Route Registration
```
services/<service>/src/v2/routes.ts — Imports and registers all domain routes
```

### Canonical Reference Implementation
Study these files as the pattern to follow:
- `services/ats-service/src/v2/jobs/types.ts`
- `services/ats-service/src/v2/jobs/repository.ts`
- `services/ats-service/src/v2/jobs/service.ts`
- `services/ats-service/src/v2/jobs/routes.ts`
- `services/ats-service/src/v2/routes.ts` (route registry)

## The 5 Routes

Every V2 resource exposes exactly these 5 routes:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v2/:resource` | LIST with pagination |
| `GET` | `/api/v2/:resource/:id` | GET single (supports `?include=`) |
| `POST` | `/api/v2/:resource` | CREATE |
| `PATCH` | `/api/v2/:resource/:id` | UPDATE (single method handles all updates) |
| `DELETE` | `/api/v2/:resource/:id` | Soft delete |

## Response Format

Reference: `docs/guidance/api-response-format.md`

```typescript
// Single item
reply.send({ data: entity });

// List with pagination
reply.send({
    data: items,
    pagination: { total, page, limit, total_pages }
});

// Error
reply.status(400).send({
    error: { code: 'VALIDATION_ERROR', message: 'Job title is required' }
});

// 404
reply.status(404).send({
    error: { code: 'NOT_FOUND', message: 'Job not found' }
});
```

## Authorization Pattern

Reference: `packages/shared-access-context/`

```typescript
import { AccessContextResolver } from '@splits-network/shared-access-context';

export class MyServiceV2 {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: MyRepository,
        supabase: SupabaseClient,
        private eventPublisher?: EventPublisher
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async create(data: CreateInput, clerkUserId: string) {
        const context = await this.accessResolver.resolve(clerkUserId);
        // context provides: identityUserId, candidateId, recruiterId,
        // organizationIds, roles, isPlatformAdmin
    }
}
```

## Pagination

Reference: `docs/guidance/pagination.md`

```typescript
import { StandardListParams, StandardListResponse, buildPaginationResponse } from '@splits-network/shared-types';

// In repository
async findAll(filters: MyFilters, params: StandardListParams): Promise<{ data: MyType[], total: number }> {
    const { page = 1, limit = 25 } = params;
    const offset = (page - 1) * limit;
    // ... query with LIMIT and OFFSET
}

// In service
async getAll(filters: MyFilters, params: StandardListParams, clerkUserId: string): Promise<StandardListResponse<MyType>> {
    const context = await this.accessResolver.resolve(clerkUserId);
    const { data, total } = await this.repository.findAll(filters, params);
    return {
        data,
        pagination: buildPaginationResponse(params.page || 1, params.limit || 25, total),
    };
}
```

## User Identification

Reference: `docs/guidance/user-identification-standard.md`

| Layer | Property | Source |
|-------|----------|--------|
| Frontend | Bearer token | Clerk SDK `getToken()` |
| API Gateway | `x-clerk-user-id` header | Extracted from JWT |
| Backend services | `request.headers['x-clerk-user-id']` | Set by gateway |
| Database | `clerk_user_id` column | Column name |

**Critical**: NEVER set `x-clerk-user-id` from frontend code. The API gateway is the only authority.

### Route-Level Extraction
```typescript
// In routes.ts
const clerkUserId = request.headers['x-clerk-user-id'] as string;
if (!clerkUserId) {
    return reply.status(400).send({
        error: { code: 'AUTH_REQUIRED', message: 'Missing x-clerk-user-id header' }
    });
}
```

## Event Publishing

Reference: `services/*/src/v2/shared/events.ts`

```typescript
// In service.ts, after successful mutation
await this.eventPublisher?.publish('resource.created', {
    resource_id: entity.id,
    // Include ALL entity IDs needed by consumers
    job_id: entity.job_id,
    company_id: entity.company_id,
    recruiter_id: entity.recruiter_id,
    // Include context for the change
    status: entity.status,
}, 'service-name');
```

Event naming: `<domain>.<action>` (e.g., `application.created`, `job.published`, `placement.confirmed`)

## Validation Rules

Validation happens in the **service layer** (not routes):
- Required fields checked with descriptive error messages
- Status transitions validated (e.g., `draft` → `active` OK, `draft` → `filled` NOT OK)
- Cross-field validation (e.g., `salary_min < salary_max`)
- Throw descriptive Error objects for 400 responses

```typescript
if (!data.title?.trim()) {
    throw new Error('Job title is required');
}
if (data.salary_min && data.salary_max && data.salary_min > data.salary_max) {
    throw new Error('Minimum salary cannot exceed maximum salary');
}
```

## API Gateway Integration

After creating a new service resource, register the route proxy in the API gateway:
- `services/api-gateway/src/routes/v2/` — one file per service domain
- Reference: `services/api-gateway/src/routes/v2/ats.ts` for the proxy pattern

## Existing V2 Services

| Service | Domains | Route File |
|---------|---------|------------|
| ats-service | jobs, candidates, applications, placements, companies, job-requirements, pre-screen | `services/ats-service/src/v2/routes.ts` |
| network-service | recruiters, assignments, recruiter-candidates | `services/network-service/src/v2/routes.ts` |
| billing-service | company-billing, stripe-connect, payouts | `services/billing-service/src/v2/routes.ts` |
| identity-service | users, memberships, invitations | `services/identity-service/src/v2/routes.ts` |
| notification-service | notifications, templates | `services/notification-service/src/v2/routes.ts` |
| automation-service | matches, fraud-signals, rules, metrics | `services/automation-service/src/v2/routes.ts` |
| ai-service | reviews | `services/ai-service/src/v2/routes.ts` |
| document-service | documents | `services/document-service/src/v2/routes.ts` |
| analytics-service | stats, charts, marketplace-metrics, proposal-stats | `services/analytics-service/src/v2/routes.ts` |
| chat-service | conversations, presence | `services/chat-service/src/v2/routes.ts` |

## Scaffolding a New Resource

When creating a new V2 resource, create files in this order:
1. `types.ts` — Define filter types, create/update input types
2. `repository.ts` — CRUD methods with Supabase client
3. `service.ts` — Business logic wrapping repository with access context and events
4. `routes.ts` — 5 Fastify route registrations
5. Update `routes.ts` (parent) — Register the new domain routes
6. Add gateway proxy — in `services/api-gateway/src/routes/v2/`

## Audit Checklist

When auditing existing routes:
1. All 5 routes present (LIST, GET, CREATE, PATCH, DELETE)
2. Response uses `{ data }` envelope
3. LIST returns pagination object
4. Auth check on all mutation routes (POST, PATCH, DELETE)
5. Access context resolves user roles before data access
6. Events published for all mutations
7. Validation in service layer (not routes)
8. Soft delete (not hard delete)
