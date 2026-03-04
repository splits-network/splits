# Phase 24: Company Enrichment APIs - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend the company update endpoint to accept new scalar fields (stage, founded_year, tagline, social links), add computed stats (open_roles_count, avg_salary) to company queries, and expose all new Phase 23 + 24 endpoints through the api-gateway.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

All areas deferred to Claude based on existing codebase patterns. Decisions made:

**Scalar field updates:**
- Partial updates (PATCH) — matches existing `CompanyUpdate` interface with optional fields and `[key: string]: any` spread
- Allow clearing fields by sending `null` — all new columns are nullable in schema
- No special URL format validation for social links — consistent with existing `website` field which has no validation
- No bounds validation on `founded_year` — DB uses SMALLINT which is sufficient constraint; trust frontend form
- Extend the existing `CompanyUpdate` type to include `stage`, `founded_year`, `tagline`, `linkedin_url`, `twitter_url`, `glassdoor_url`

**Computed stats:**
- Live computation via SQL subquery/join per request — no materialized columns needed at current scale
- `open_roles_count`: Count jobs where `status = 'active'` and `company_id` matches
- `avg_salary`: Average of `(salary_min + salary_max) / 2` across active jobs with salary data
- When no jobs exist: `open_roles_count: 0`, `avg_salary: null` — frontend handles display
- Include computed stats inline in company list and detail responses (no separate endpoint)

**Gateway routing:**
- Follow existing `registerResourceRoutes` pattern in api-gateway
- Phase 23 routes (perks, culture-tags, company junctions) live in ats-service — gateway proxies via ats service definition
- Add lookup routes (perks search/create, culture-tags search/create) to gateway
- Add company junction routes (bulk-replace, list for skills/perks/culture-tags) to gateway
- All routes require authentication — consistent with existing company endpoints

**Response shape:**
- Null fields included in response (not omitted) — consistent with Supabase `.select()` behavior
- Computed stats returned as top-level fields on company objects: `open_roles_count`, `avg_salary`
- Standard `{ data: <payload> }` envelope per api-response-format guidance

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following existing ats-service and api-gateway patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 24-company-enrichment-apis*
*Context gathered: 2026-03-03*
