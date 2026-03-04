---
phase: 22-schema-and-types
plan: 02
subsystem: database
tags: [typescript, shared-types, company-profile, perks, culture-tags, company-stage]

# Dependency graph
requires:
  - phase: 22-schema-and-types
    provides: Database migration creating perks, culture_tags, company_perks, company_culture_tags, company_skills tables and CompanyStage CHECK constraint

provides:
  - CompanyStage union type (8 values matching DB CHECK constraint)
  - Perk and CultureTag interfaces mirroring Skill structure
  - CompanyPerk, CompanyCultureTag, CompanySkill junction types with enrichment fields
  - Extended Company interface with stage, founded_year, tagline, linkedin_url, twitter_url, glassdoor_url
  - All new types exported from shared-types index

affects:
  - 23-api (ats-service routes/repositories need these types)
  - 24-frontend (UI components consuming company profile types)
  - 25-search (company search/filtering using CompanyStage)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Junction type pattern: FK fields + optional enrichment field (e.g., perk?: Perk) following CandidateSkill/JobSkill pattern"
    - "Lookup interface pattern: mirrors Skill interface exactly (id, name, slug, is_approved, created_by?, created_at)"
    - "CompanyStage as Title Case union type with spaces matching DB CHECK constraint display-ready values"

key-files:
  created: []
  modified:
    - packages/shared-types/src/models.ts
    - packages/shared-types/src/index.ts

key-decisions:
  - "CompanyStage uses Title Case with spaces ('Series A' not 'series_a') — display-ready values that match the database CHECK constraint verbatim"
  - "Perk and CultureTag mirror Skill interface exactly — consistent lookup table structure across the codebase"
  - "Junction types include optional enrichment fields (perk?, culture_tag?, skill?) following the established CandidateSkill/JobSkill pattern"

patterns-established:
  - "Lookup table type: id, name, slug, is_approved, created_by?, created_at — all new lookup tables follow this shape"
  - "Junction type with enrichment: FK fields + optional typed join (e.g., perk?: Perk) for service-layer enrichment"

# Metrics
duration: 1min
completed: 2026-03-03
---

# Phase 22 Plan 02: Schema & Types — Shared Types Summary

**CompanyStage union, Perk/CultureTag lookup interfaces, and CompanyPerk/CompanyCultureTag/CompanySkill junction types added to shared-types with Company interface extended by 6 new optional profile fields**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-03T22:41:33Z
- **Completed:** 2026-03-03T22:42:22Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `CompanyStage` union type with 8 values exactly matching the database CHECK constraint (Title Case with spaces)
- Extended `Company` interface with 6 new optional fields: `stage`, `founded_year`, `tagline`, `linkedin_url`, `twitter_url`, `glassdoor_url`
- Added `Perk` and `CultureTag` interfaces mirroring the existing `Skill` interface structure
- Added `CompanyPerk`, `CompanyCultureTag`, `CompanySkill` junction types following the `CandidateSkill`/`JobSkill` enrichment pattern
- All 6 new types exported from `shared-types/src/index.ts`; package builds cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Add CompanyStage, lookup, and junction types to models.ts** - `e2eff7ea` (feat)
2. **Task 2: Export new types from index.ts and verify build** - `77008c24` (feat)

## Files Created/Modified

- `packages/shared-types/src/models.ts` - CompanyStage type, extended Company interface, Perk, CultureTag, CompanyPerk, CompanyCultureTag, CompanySkill
- `packages/shared-types/src/index.ts` - Named exports for all 6 new types

## Decisions Made

- CompanyStage values use Title Case with spaces (`'Series A'`, not `'series_a'`) because they match the database CHECK constraint verbatim and are display-ready without transformation
- New lookup interfaces (Perk, CultureTag) mirror Skill exactly to maintain consistency across all lookup tables
- Junction types include optional enrichment fields (`perk?`, `culture_tag?`, `skill?`) following the established `CandidateSkill`/`JobSkill` pattern used throughout the codebase

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All shared types are available for downstream consumers
- ATS service (Phase 23) can import and use `CompanyStage`, `Perk`, `CultureTag`, `CompanyPerk`, `CompanyCultureTag`, `CompanySkill` for repository/route implementations
- Frontend (Phase 24) can import these types for company profile UI components
- No blockers or concerns

---
*Phase: 22-schema-and-types*
*Completed: 2026-03-03*
