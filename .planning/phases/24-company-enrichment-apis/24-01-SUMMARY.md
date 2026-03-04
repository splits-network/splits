---
phase: 24-company-enrichment-apis
plan: 01
subsystem: api
tags: [supabase, typescript, fastify, companies, jobs, computed-stats]

requires:
  - phase: 22-company-profile-schema
    provides: Migration 20260303000006_company_profile_enhancement.sql adding stage, founded_year, tagline, linkedin_url, twitter_url, glassdoor_url columns to companies table

provides:
  - CompanyUpdate type extended with 6 new optional nullable scalar fields (API-11)
  - findCompanies returns open_roles_count and avg_salary per company (API-12, API-13)
  - findCompany returns open_roles_count and avg_salary for single company (API-12, API-13)

affects:
  - 24-company-enrichment-apis plan 02 (gateway/frontend integration)
  - apps/portal company detail and list pages

tech-stack:
  added: []
  patterns:
    - "Secondary Supabase query pattern: fetch primary entity, then batch-query jobs by IDs for computed stats"
    - "In-memory stats accumulation: iterate jobRows once, build statsMap keyed by company_id"
    - "avg_salary uses Math.round to return clean integers for currency display"

key-files:
  created: []
  modified:
    - services/ats-service/src/v2/companies/types.ts
    - services/ats-service/src/v2/companies/repository.ts

key-decisions:
  - "No application-layer validation for stage — DB CHECK constraint (companies_stage_check) enforces valid values"
  - "Secondary jobs query batched by company IDs (not per-company) in findCompanies to avoid N+1"
  - "avg_salary rounds to integer via Math.round — no floating point decimals in currency"
  - "open_roles_count counts only status='active' jobs; avg_salary averages only active jobs with non-null salary bounds"

patterns-established:
  - "Computed stats pattern: secondary query after primary list fetch, accumulate in statsMap, merge before return"

duration: 5min
completed: 2026-03-03
---

# Phase 24 Plan 01: Company Enrichment APIs (Backend Types + Stats) Summary

**Extended CompanyUpdate type with 6 new scalar fields and augmented company queries with computed open_roles_count and avg_salary from jobs table via secondary Supabase query.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-03T00:00:00Z
- **Completed:** 2026-03-03T00:05:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- CompanyUpdate interface gains stage, founded_year, tagline, linkedin_url, twitter_url, glassdoor_url — all optional and nullable, enabling PATCH to both set and clear fields
- findCompanies enriches each company with open_roles_count and avg_salary via a single batched jobs query (no N+1)
- findCompany enriches single company with same computed stats via targeted jobs query
- avg_salary returns null when no active jobs have salary data; open_roles_count returns 0 when no active jobs exist

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend CompanyUpdate type with new scalar fields** - `73eb83ae` (feat)
2. **Task 2: Add computed stats to findCompanies and findCompany** - `8a1f6bb3` (feat)

## Files Created/Modified
- `services/ats-service/src/v2/companies/types.ts` - Added 6 new optional nullable fields to CompanyUpdate interface
- `services/ats-service/src/v2/companies/repository.ts` - Secondary jobs query in findCompanies (batched) and findCompany (single), computing open_roles_count and avg_salary

## Decisions Made
- No application-layer validation for `stage` — DB CHECK constraint (`companies_stage_check`) enforces the 8 valid values and returns a Postgres constraint violation on bad input, consistent with how other constrained columns work in the codebase
- Batched jobs query in `findCompanies` avoids N+1: extract all company IDs from primary result, single `.in('company_id', companyIds)` query, accumulate stats in-memory via statsMap
- `avg_salary` rounded to integer with `Math.round` — currency display doesn't need floating point precision
- Salary average computed as `(salary_min + salary_max) / 2` per job, then averaged across qualifying active jobs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ats-service backend for API-11, API-12, API-13 is complete
- PATCH /companies/:id already passes through the entire updates object via spread — new scalar fields will persist automatically
- GET /companies and GET /companies/:id now return computed stats — gateway and portal can consume them immediately
- Ready for plan 24-02 (gateway routes and portal UI integration)

---
*Phase: 24-company-enrichment-apis*
*Completed: 2026-03-03*
