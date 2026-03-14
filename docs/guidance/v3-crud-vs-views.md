# V3 CRUD vs Views Standard

## The Rule

**Core CRUD routes must be pure.** They are flat database operations against a single table. Nothing more. Views handle everything else.

## Core CRUD (The "Core 5")

Every V3 resource gets exactly 5 CRUD routes:

| Route | Purpose |
|-------|---------|
| `GET /api/v3/{resource}` | List with pagination/filters |
| `GET /api/v3/{resource}/:id` | Get single record by ID |
| `POST /api/v3/{resource}` | Create |
| `PATCH /api/v3/{resource}/:id` | Update |
| `DELETE /api/v3/{resource}/:id` | Delete |

### CRUD Rules — No Exceptions

1. **Flat queries only** — `select('*')` from a single table. No joins, no subqueries, no nested selects.
2. **No `?include=` parameters** — If you need related data, that's a view.
3. **No access control in the route** — CRUD routes are always `auth: 'required'` in the gateway. The service may scope by user context, but the gateway never makes CRUD optional-auth or public.
4. **No enrichment** — No computed fields, no aggregations, no permission-gated field removal.
5. **No business logic** — Create inserts a row. Update patches a row. Delete removes a row. Side effects (events, audit logs) are acceptable but the core operation stays simple.
6. **Repository stays flat** — `findAll`, `findById`, `create`, `update`, `delete`. No custom query methods on the core repository.

### Gateway Auth for CRUD

```typescript
// ALWAYS required — no exceptions
{ resource: 'jobs', auth: 'required' }
{ resource: 'applications', auth: 'required' }
{ resource: 'candidates', auth: 'required' }
```

## Views

Views are purpose-built endpoints for specific frontend needs. They live in `views/` subdirectories within each resource.

### When to Use a View

- **Joined data** — Job detail needs company name? View.
- **Public access** — Candidate job listing page? View with `auth: 'optional'`.
- **Role-scoped data** — Recruiter board vs company board? Separate views.
- **Enrichment** — Computed fields, aggregations, permission-gated fields? View.
- **Any frontend page** — If the page displays data from more than one table, it calls a view.

### View File Structure

```
services/ats-service/src/v3/jobs/
  repository.ts          # Core CRUD only — flat select('*')
  service.ts             # Core CRUD only
  routes.ts              # Core 5 + view registration
  types.ts               # Schemas
  views/
    candidate-detail.repository.ts   # Joins job + company + requirements
    candidate-detail.service.ts      # Salary visibility, status gating
    candidate-detail.route.ts        # GET /jobs/:id/view/candidate-detail
    recruiter-board.repository.ts    # Scoped job list for recruiters
    recruiter-board.route.ts         # GET /jobs/views/recruiter-board
    company-board.repository.ts      # Scoped job list for companies
    company-board.route.ts           # GET /jobs/views/company-board
```

### View URL Patterns

```
# List views — role-scoped lists with joins
GET /api/v3/{resource}/views/{view-name}

# Detail views — single record with joins/enrichment
GET /api/v3/{resource}/:id/view/{view-name}
```

### Gateway Auth for Views

Views declare their own auth level based on purpose:

```typescript
// Public-facing views — candidates browse without auth
{ path: '/jobs/views/candidate-listing', method: 'GET', auth: 'optional' }
{ path: '/jobs/:id/view/candidate-detail', method: 'GET', auth: 'optional' }

// Role-specific views — require auth
{ path: '/jobs/views/recruiter-board', method: 'GET', auth: 'required' }
{ path: '/jobs/views/company-board', method: 'GET', auth: 'required' }
```

## Frontend Rule

**If a page is public or needs joined data, call a view. Never call core CRUD.**

```typescript
// WRONG — core CRUD on a public page
const job = await apiClient.get(`/jobs/${id}`);

// RIGHT — view endpoint for public page
const job = await apiClient.get(`/jobs/${id}/view/candidate-detail`);

// WRONG — core CRUD with include params
const apps = await apiClient.get(`/applications?include=candidate,job`);

// RIGHT — view endpoint with joins
const apps = await apiClient.get(`/applications/views/recruiter-pipeline`);
```

## Summary

| Concern | Core CRUD | View |
|---------|-----------|------|
| Joins | NEVER | YES |
| Public/optional auth | NEVER | YES |
| Access control | NEVER | YES |
| Enrichment | NEVER | YES |
| `?include=` params | NEVER | N/A — views return what they need |
| Gateway auth | Always `required` | Varies by purpose |
| Repository | `select('*')` only | Custom queries with joins |
