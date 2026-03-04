# Phase 24: Company Enrichment APIs - Research

**Researched:** 2026-03-03
**Domain:** ats-service company repository + api-gateway routing
**Confidence:** HIGH

## Summary

Phase 24 is entirely within the existing ats-service and api-gateway. No new services, no new dependencies, no new migrations — the schema work was done in Phase 23 migration `20260303000006_company_profile_enhancement.sql`.

The work divides cleanly into two parts:

**24-01 (ats-service):** Extend `CompanyUpdate` type to include the 6 new scalar fields already in the DB (`stage`, `founded_year`, `tagline`, `linkedin_url`, `twitter_url`, `glassdoor_url`), and augment `findCompanies` / `findCompany` repository methods to join `jobs` and compute `open_roles_count` and `avg_salary` inline.

**24-02 (api-gateway):** Add all Phase 23 and 24 routes that are missing from `ats.ts`. Currently `company-perks`, `company-culture-tags`, `company-skills`, `perks`, and `culture-tags` have no gateway representation. The junction bulk-replace routes (`PUT /companies/:companyId/perks|skills|culture-tags`) and the lookup search/create routes (`GET/POST /perks`, `GET/POST /culture-tags`) all need gateway proxies.

**Primary recommendation:** Implement computed stats via a secondary Supabase query in the repository (post-fetch join), not via a DB view or materialized column. This is consistent with how `application_count` is computed in `jobs/repository.ts` and how `firm_placement_stats` views are used in `network-service` — but for company stats at this scale a two-query pattern (fetch companies, then aggregate stats) is appropriate.

## Standard Stack

No new libraries required. All work uses the existing stack.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | existing | DB queries | Already used in all repositories |
| Fastify | existing | HTTP routing | Existing service framework |

### Supporting
None — no new packages needed.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Secondary query for computed stats | DB view (like `firm_placement_stats`) | View adds migration overhead; not warranted at this scale. Two-query approach already used in `jobs/repository.ts` for `application_count` |
| Secondary query for computed stats | PostgREST embedded aggregate `jobs(count)` | PostgREST embedded aggregates require Supabase >= 2.x and return raw counts without filter support (can't filter `status = 'active'`). Verified not a viable pattern here |

**Installation:** None required.

## Architecture Patterns

### Recommended Project Structure
No new files needed beyond modifying existing ones.

```
services/ats-service/src/v2/
├── companies/
│   ├── types.ts          # MODIFY: extend CompanyUpdate with new fields
│   ├── repository.ts     # MODIFY: add computed stats to findCompanies + findCompany
│   └── service.ts        # No change needed
services/api-gateway/src/routes/v2/
└── ats.ts                # MODIFY: add Phase 23 + 24 gateway routes
```

### Pattern 1: Extending CompanyUpdate Type

The existing `CompanyUpdate` interface uses optional fields + `[key: string]: any` spread. Add the 6 new columns as explicit optional fields. The `updateCompany` repository method already passes the entire update object through with `{ ...updates, updated_at: ... }` — no changes needed to repository update logic.

```typescript
// services/ats-service/src/v2/companies/types.ts
export interface CompanyUpdate {
    name?: string;
    description?: string;
    website?: string;
    status?: string;
    stage?: string | null;
    founded_year?: number | null;
    tagline?: string | null;
    linkedin_url?: string | null;
    twitter_url?: string | null;
    glassdoor_url?: string | null;
    [key: string]: any;
}
```

**Key insight:** `null` values pass through to Supabase which sets the column to NULL. This is the intended behavior for clearing fields. No special null-stripping logic needed.

**Stage constraint:** DB enforces `CHECK (stage = ANY (ARRAY['Seed', 'Series A', 'Series B', 'Series C', 'Growth', 'Public', 'Bootstrapped', 'Non-Profit']))`. A bad value returns a Postgres constraint violation which the repository already propagates as a thrown error. No application-layer validation needed — DB is the guard.

### Pattern 2: Computed Stats in Repository

Use a secondary query pattern (consistent with `jobs/repository.ts` `application_count`). Fetch companies first, then aggregate stats for the returned set of company IDs.

```typescript
// In findCompanies — after fetching companies:
const companyIds = companies.map(c => c.id);
const { data: statsRows } = await this.supabase
    .from('jobs')
    .select('company_id, status, salary_min, salary_max')
    .in('company_id', companyIds);

const statsMap: Record<string, { open_roles_count: number; salary_sum: number; salary_count: number }> = {};
for (const job of statsRows || []) {
    if (!statsMap[job.company_id]) {
        statsMap[job.company_id] = { open_roles_count: 0, salary_sum: 0, salary_count: 0 };
    }
    if (job.status === 'active') {
        statsMap[job.company_id].open_roles_count++;
        if (job.salary_min != null && job.salary_max != null) {
            statsMap[job.company_id].salary_sum += (job.salary_min + job.salary_max) / 2;
            statsMap[job.company_id].salary_count++;
        }
    }
}

return companies.map(c => ({
    ...c,
    open_roles_count: statsMap[c.id]?.open_roles_count ?? 0,
    avg_salary: statsMap[c.id]?.salary_count > 0
        ? statsMap[c.id].salary_sum / statsMap[c.id].salary_count
        : null,
}));
```

For `findCompany` (single record), a direct SQL aggregate is cleaner:

```typescript
const { data: stats } = await this.supabase
    .from('jobs')
    .select('status, salary_min, salary_max')
    .eq('company_id', id);

const activeJobs = (stats || []).filter(j => j.status === 'active');
const salaryJobs = activeJobs.filter(j => j.salary_min != null && j.salary_max != null);
company.open_roles_count = activeJobs.length;
company.avg_salary = salaryJobs.length > 0
    ? salaryJobs.reduce((sum, j) => sum + (j.salary_min + j.salary_max) / 2, 0) / salaryJobs.length
    : null;
```

**Verified:** Live DB query `SELECT COUNT(j.id) FILTER (WHERE j.status = 'active') AS open_roles_count, AVG((j.salary_min + j.salary_max) / 2.0) FILTER (WHERE j.status = 'active' AND j.salary_min IS NOT NULL AND j.salary_max IS NOT NULL) AS avg_salary FROM companies c LEFT JOIN jobs j ON j.company_id = c.id GROUP BY c.id` returns correct results with `open_roles_count: 0` and `avg_salary: null` for companies without active jobs.

### Pattern 3: Gateway Routes for Phase 23 + 24 Endpoints

The gateway's `registerResourceRoutes` handles standard CRUD (GET list, GET :id, POST, PATCH :id, DELETE :id). For non-standard routes, write explicit proxy functions following the existing `registerCompanyContactRoutes` pattern.

**Routes that need gateway coverage:**

| Route | Method | Pattern | Notes |
|-------|--------|---------|-------|
| `/api/v2/perks` | GET | `registerResourceRoutes` (list only) | Search typeahead |
| `/api/v2/perks` | POST | `registerResourceRoutes` | Find-or-create |
| `/api/v2/culture-tags` | GET | `registerResourceRoutes` (list only) | Search typeahead |
| `/api/v2/culture-tags` | POST | `registerResourceRoutes` | Find-or-create |
| `/api/v2/company-perks` | GET | `registerResourceRoutes` (list only) | `?company_id=` required |
| `/api/v2/company-skills` | GET | `registerResourceRoutes` (list only) | `?company_id=` required |
| `/api/v2/company-culture-tags` | GET | `registerResourceRoutes` (list only) | `?company_id=` required |
| `/api/v2/companies/:companyId/perks` | PUT | explicit proxy | Bulk-replace pattern |
| `/api/v2/companies/:companyId/skills` | PUT | explicit proxy | Bulk-replace pattern |
| `/api/v2/companies/:companyId/culture-tags` | PUT | explicit proxy | Bulk-replace pattern |

**Important path collision note:** `registerResourceRoutes` registers `GET /api/v2/company-perks` and `GET /api/v2/company-perks/:id`. The junction resources don't have a meaningful `:id` GET route (they use composite PKs), but `registerResourceRoutes` will register it anyway — this is harmless since the ats-service will return 404 for that path. Alternatively, register only GET list and let the explicit bulk-replace PUT be the write path.

**Existing `registerBulkReplaceRoutes` function** in `ats.ts` already handles the `candidate-skills` and `job-skills` PUT bulk-replace pattern. The company junction bulk-replace routes follow the identical pattern.

```typescript
// Example: company perks bulk-replace in registerBulkReplaceRoutes
app.put(
    '/api/v2/companies/:companyId/perks',
    { preHandler: requireAuth() },
    async (request: FastifyRequest, reply: FastifyReply) => {
        const { companyId } = request.params as { companyId: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().put(
            `/api/v2/companies/${companyId}/perks`,
            request.body,
            correlationId,
            buildAuthHeaders(request)
        );
        return reply.send(data);
    }
);
```

### Pattern 4: ATS_RESOURCES Array Additions

Simple lookup resources (perks, culture-tags, company-perks, company-skills, company-culture-tags) can be added to `ATS_RESOURCES` to get list + CRUD routes for free via `registerResourceRoutes`. However, the list-only resources (company-perks, company-skills, company-culture-tags) don't need DELETE/:id or POST since those operations go through the bulk-replace PUT route.

Simplest approach: add all five to `ATS_RESOURCES` which registers the full CRUD set. The routes that aren't used (DELETE, PATCH for junction tables) will simply proxy to ats-service which either returns 404 or the service handles them. No harm in having extra routes.

### Anti-Patterns to Avoid

- **Don't add a DB view for computed stats:** The `firm_placement_stats` view pattern is appropriate for public marketplace profiles that are queried frequently and need caching. Company stats are internal-facing and queried within authenticated contexts — a secondary query is fine.
- **Don't validate `stage` in application code:** The DB CHECK constraint `companies_stage_check` already enforces the valid values. Adding application-layer validation duplicates the constraint and risks drift.
- **Don't strip `null` values before update:** Callers send `null` to clear fields. The Supabase client passes `null` as SQL NULL. The current `updateCompany` spreads the entire `updates` object — no filtering needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Computed counts | Materialized column + trigger | Secondary query on jobs table | No migration needed, consistent with `application_count` pattern already in codebase |
| Gateway proxy functions | Custom HTTP client | `atsService().put(...)` etc. | `ServiceRegistry` client already handles auth headers, correlation IDs, error forwarding |

## Common Pitfalls

### Pitfall 1: Path Collision in Gateway

**What goes wrong:** Registering `PUT /api/v2/companies/:companyId/perks` AFTER `registerResourceRoutes` for companies will conflict because `registerResourceRoutes` already registered `PATCH /api/v2/companies/:id`. The `/companies/:id` catch-all will shadow the more specific `/companies/:companyId/perks` if the sub-resource routes are registered after.

**Why it happens:** Fastify resolves routes by specificity — but `/companies/:companyId/perks` is more specific than `/companies/:id` because it has a suffix segment `/perks`. In practice Fastify will correctly route these. However the existing pattern in `registerAtsRoutes` already calls sub-resource registration functions BEFORE `registerResourceRoutes` to be explicit.

**How to avoid:** Register company junction PUT routes inside `registerBulkReplaceRoutes` which is called first in `registerAtsRoutes`.

### Pitfall 2: Missing `status` Column Filter for `open_roles_count`

**What goes wrong:** Counting ALL jobs for a company (not filtering by `status = 'active'`) gives inflated counts including paused/filled/closed roles.

**Why it happens:** Easy to forget the filter when writing the secondary query.

**How to avoid:** Explicitly filter `status === 'active'` in the JavaScript aggregation loop (not in the Supabase query, since we're fetching all jobs and computing client-side for the list case).

### Pitfall 3: `avg_salary` Returns `0` Instead of `null` When No Data

**What goes wrong:** Division-by-zero or returning `0` as avg when no jobs have salary data.

**Why it happens:** Averaging an empty array without null-checking `salary_count`.

**How to avoid:** Guard with `salaryJobs.length > 0` before computing average; return `null` otherwise. Confirmed behavior: `AVG()` on empty set returns NULL in SQL.

### Pitfall 4: `founded_year` Type Coercion

**What goes wrong:** Frontend sends `founded_year` as a string (query params are always strings); service passes string to DB which rejects because column type is `SMALLINT`.

**Why it happens:** HTTP bodies are parsed as JSON so `founded_year` arrives as a number. No issue here — the field is in the request body (JSON), not query params.

**How to avoid:** No action needed for PATCH body. If `founded_year` were ever a query param it would need `parseInt()`. It's not, so this is a non-issue.

## Code Examples

Verified patterns from live codebase:

### Existing Bulk-Replace Gateway Pattern (from ats.ts)
```typescript
// Source: services/api-gateway/src/routes/v2/ats.ts
app.put(
    '/api/v2/job-skills/job/:jobId/bulk-replace',
    { preHandler: requireAuth() },
    async (request: FastifyRequest, reply: FastifyReply) => {
        const { jobId } = request.params as { jobId: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().put(
            `/api/v2/job-skills/job/${jobId}/bulk-replace`,
            request.body,
            correlationId,
            buildAuthHeaders(request)
        );
        return reply.send(data);
    }
);
```

### Existing ATS_RESOURCES Pattern for Simple CRUD
```typescript
// Source: services/api-gateway/src/routes/v2/ats.ts
const ATS_RESOURCES: ResourceDefinition[] = [
    { name: 'skills', service: 'ats', basePath: '/skills', tag: 'skills' },
    { name: 'candidate-skills', service: 'ats', basePath: '/candidate-skills', tag: 'candidate-skills' },
    // ... add perks, culture-tags, company-perks, company-skills, company-culture-tags here
];
```

### Company Repository Secondary Stats Query (verified SQL)
```sql
-- Verified working in live DB:
SELECT
    c.id,
    COUNT(j.id) FILTER (WHERE j.status = 'active') AS open_roles_count,
    AVG((j.salary_min + j.salary_max) / 2.0)
        FILTER (WHERE j.status = 'active' AND j.salary_min IS NOT NULL AND j.salary_max IS NOT NULL) AS avg_salary
FROM companies c
LEFT JOIN jobs j ON j.company_id = c.id
GROUP BY c.id
LIMIT 3;
-- Returns: open_roles_count: 0, avg_salary: null for no active jobs; correct counts/averages otherwise
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual DB edits | Supabase migrations | Always | Schema changes in `supabase/migrations/` |
| Monolithic company type | Extended CompanyUpdate with new optional fields | Phase 24 | Minimal — just add fields |

**Deprecated/outdated:**
- None in this phase's scope.

## Open Questions

1. **Gateway `perks`/`culture-tags` POST returns 200 vs 201**
   - What we know: ats-service returns 201 on create and 200 on find (find-or-create logic in `PerkService.findOrCreate`). `registerResourceRoutes` in gateway always returns `.code(201)` for POST.
   - What's unclear: Should the gateway preserve the 200 vs 201 distinction, or is 201 always fine?
   - Recommendation: Accept gateway always returning 201 for POST. The status code distinction (200 vs 201) is only meaningful if the frontend needs to know whether an item was newly created. Given current usage patterns, this is not a concern. The gateway's `registerResourceRoutes` already does `.code(201)` for all POSTs — use it.

2. **`company-perks`/`company-skills`/`company-culture-tags` via `registerResourceRoutes` — unnecessary routes**
   - What we know: `registerResourceRoutes` registers GET list, GET :id, POST, PATCH :id, DELETE :id. For junction tables, only GET list and PUT bulk-replace are used.
   - What's unclear: Is it acceptable to have proxy routes that will return ats-service errors (not 404)?
   - Recommendation: Add to `ATS_RESOURCES` for the list GET only; the extra routes are harmless proxies. The ats-service routes only define GET and PUT — extra CRUD routes proxied to ats will simply return 404 from ats. Acceptable.

## Sources

### Primary (HIGH confidence)
- Live codebase: `services/ats-service/src/v2/companies/` — all files read directly
- Live codebase: `services/api-gateway/src/routes/v2/ats.ts` — read directly
- Live codebase: `services/api-gateway/src/routes/v2/common.ts` — `registerResourceRoutes` implementation
- Live DB query: Verified `stage`, `founded_year`, `tagline`, `linkedin_url`, `twitter_url`, `glassdoor_url` columns exist and are nullable
- Live DB query: Verified `companies_stage_check` constraint values
- Live DB query: Verified aggregate SQL for `open_roles_count` and `avg_salary` produces correct results
- Migration `20260303000006_company_profile_enhancement.sql` — schema source of truth for Phase 23

### Secondary (MEDIUM confidence)
- Pattern cross-reference: `jobs/repository.ts` `application_count` secondary query pattern
- Pattern cross-reference: `network-service/src/v2/firms/repository.ts` `firm_placement_stats` view pattern

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries, all existing tools
- Architecture: HIGH — directly verified from live codebase and DB
- Pitfalls: HIGH — discovered from reading existing code patterns and live DB verification

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable domain)
