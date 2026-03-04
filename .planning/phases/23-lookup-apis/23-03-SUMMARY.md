---
phase: 23
plan: 03
subsystem: ats-service
tags: [junction-tables, company-skills, company-perks, company-culture-tags, bulk-replace, fastify]
requires: [22-01, 22-02]
provides:
  - company-skills junction CRUD (list + bulk-replace)
  - company-perks junction CRUD (list + bulk-replace)
  - company-culture-tags junction CRUD (list + bulk-replace)
  - culture-tags lookup routes (registered, plan 02 deferred)
affects: [25-settings-ui]
tech-stack:
  added: []
  patterns:
    - delete-then-insert atomic bulk-replace (mirrors candidate-skills)
    - shared SupabaseClient via getSupabase() across junction repositories
key-files:
  created:
    - services/ats-service/src/v2/company-skills/repository.ts
    - services/ats-service/src/v2/company-skills/service.ts
    - services/ats-service/src/v2/company-skills/routes.ts
    - services/ats-service/src/v2/company-perks/repository.ts
    - services/ats-service/src/v2/company-perks/service.ts
    - services/ats-service/src/v2/company-perks/routes.ts
    - services/ats-service/src/v2/company-culture-tags/repository.ts
    - services/ats-service/src/v2/company-culture-tags/service.ts
    - services/ats-service/src/v2/company-culture-tags/routes.ts
  modified:
    - services/ats-service/src/v2/routes.ts
decisions:
  - "Max caps per company: 50 skills, 30 perks, 20 culture tags"
  - "Junction repos take SupabaseClient directly (injected from parent lookup repo's getSupabase())"
  - "Culture-tags lookup routes registered here since plan 02 deferred routes.ts modification"
metrics:
  duration: "2m 15s"
  completed: "2026-03-03"
---

# Phase 23 Plan 03: Company Junction Modules Summary

**One-liner:** Three atomic bulk-replace junction modules (company_skills, company_perks, company_culture_tags) mirroring the candidate-skills pattern, plus culture-tags lookup route registration.

## What Was Built

Created three company junction modules, each following the established candidate-skills delete-then-insert bulk-replace pattern:

**company-skills:** Links companies to the shared `skills` table. Max 50 per company. Routes: `GET /api/v2/company-skills?company_id=X` and `PUT /api/v2/companies/:companyId/skills`.

**company-perks:** Links companies to the `perks` lookup table. Max 30 per company. Routes: `GET /api/v2/company-perks?company_id=X` and `PUT /api/v2/companies/:companyId/perks`.

**company-culture-tags:** Links companies to the `culture_tags` lookup table. Max 20 per company. Routes: `GET /api/v2/company-culture-tags?company_id=X` and `PUT /api/v2/companies/:companyId/culture-tags`.

Each module consists of repository (Supabase queries with joined lookup data), service (validation + cap enforcement), and routes (Fastify handlers with requireUserContext).

Also registered the culture-tags lookup routes in `routes.ts` (plan 02 was told to skip this).

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 101e4d74 | feat(23-03): add company-skills junction module |
| 2 | eca19ff9 | feat(23-03): add company-perks and company-culture-tags junction modules |
| 3 | 32373712 | feat(23-03): register all Phase 23 modules in v2 routes |

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written.

### Parallel Plan Coordination

Plan 02 (culture-tags lookup) was told to skip `routes.ts` modification. This plan detected that culture-tags was not registered in routes.ts and added it alongside the junction module registrations, as instructed.

Plan 01 (perks lookup) had already added perk registration to routes.ts before this plan ran, so perk routes were not duplicated.

## Architecture Notes

- Junction repositories accept an injected `SupabaseClient` (not url/key), sharing the connection from their parent lookup repository (`skillRepository.getSupabase()`, `perkRepository.getSupabase()`, `cultureTagRepository.getSupabase()`)
- Sending an empty array to any bulk-replace endpoint clears all linked items (delete runs, insert skipped)
- All list endpoints return junction rows with joined lookup data via Supabase foreign key expansion

## Next Phase Readiness

Phase 25 (Settings UI) can now call these endpoints to atomically manage a company's skills, perks, and culture tags. All endpoints are authenticated via `requireUserContext`.
