---
phase: 26-company-card-redesign
plan: "01"
subsystem: ui
tags: [react, typescript, daisy-ui, company-card, grid-card, portal]

# Dependency graph
requires:
  - phase: 22-schema-and-types
    provides: stage, founded_year, tagline, social URLs on company model
  - phase: 24-company-enrichment-apis
    provides: open_roles_count, avg_salary computed fields in company list API

provides:
  - Company interface extended with 8 new profile fields (stage, founded_year, tagline, social URLs, open_roles_count, avg_salary)
  - formatSalary() helper (integer to $Xk display string)
  - companyFoundedYear() and companyTagline() helpers
  - Grid card with editorial layout: hiring badge, founded year, tagline section, 4-stat row

affects:
  - 26-02 (list card redesign will follow same pattern)
  - 26-03 (company detail panel may reference same fields)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Marketplace/my-companies conditional rendering via isMarketplace flag throughout helpers and card components"
    - "formatSalary() converts raw integer cents-per-year to $Xk display string"

key-files:
  created: []
  modified:
    - apps/portal/src/app/portal/companies/types.ts
    - apps/portal/src/app/portal/companies/components/shared/helpers.ts
    - apps/portal/src/app/portal/companies/components/grid/grid-card.tsx
    - apps/portal/src/app/portal/companies/components/grid/grid-card-stats.tsx

key-decisions:
  - "stage kept as string (not enum) in portal Company interface — API returns plain string, portal is display-only"
  - "Tagline replaces description in card About section — tagline is purpose-built for card display"
  - "Founded year replaces added-ago timestamp for marketplace tab — more meaningful context for recruiters browsing"
  - "Hiring badge shown only when open_roles_count > 0 (not just non-null) to avoid false positives"

patterns-established:
  - "4-stat MarketplaceStats: Open Roles (primary), Size (secondary), Stage (accent), Avg Salary (warning)"
  - "Showcase editorial pattern: kicker + badge header, logo/name block, location+founded row, tagline, stats, footer"

# Metrics
duration: 12min
completed: 2026-03-04
---

# Phase 26 Plan 01: Company Card Redesign Summary

**Company grid card redesigned to showcase editorial layout with industry kicker, hiring badge, founded year, tagline About section, and 4-stat row (Open Roles, Size, Stage, Avg Salary)**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-04T00:30:13Z
- **Completed:** 2026-03-04T00:42:00Z
- **Tasks:** 2/2
- **Files modified:** 4

## Accomplishments

- Extended `Company` interface with 8 new fields: `stage`, `founded_year`, `tagline`, `linkedin_url`, `twitter_url`, `glassdoor_url`, `open_roles_count`, `avg_salary`
- Added `formatSalary()`, `companyFoundedYear()`, and `companyTagline()` helpers to shared helpers module
- Redesigned grid card header: green hiring badge when `open_roles_count > 0` (marketplace); status badge preserved for my-companies
- Location row now shows `Est. {founded_year}` with calendar icon (marketplace); falls back to added-ago for my-companies
- Tagline replaces description in About section with `line-clamp-2`
- Stats row expanded from 2 stats (Size, Industry) to 4 (Open Roles, Size, Stage, Avg Salary) with colored icon squares

## Task Commits

1. **Task 1: Extend Company type with new profile fields** - `78eb5dab` (feat)
2. **Task 2: Redesign grid card header, stats row, and tagline section** - `013a942b` (feat)

## Files Created/Modified

- `apps/portal/src/app/portal/companies/types.ts` - Company interface extended with 8 new optional fields
- `apps/portal/src/app/portal/companies/components/shared/helpers.ts` - Added formatSalary, companyFoundedYear, companyTagline helpers
- `apps/portal/src/app/portal/companies/components/grid/grid-card.tsx` - Editorial layout: hiring badge, founded year, tagline section
- `apps/portal/src/app/portal/companies/components/grid/grid-card-stats.tsx` - 4-stat MarketplaceStats (Open Roles, Size, Stage, Avg Salary)

## Decisions Made

- `stage` kept as `string` (not enum) in portal Company interface — the API returns it as a plain string and the portal only displays it, so importing the backend enum would add an unnecessary coupling
- Tagline replaces description in the card About section — tagline is a purpose-built short descriptor suited for card display; description may be long-form
- Founded year replaces added-ago for marketplace tab — recruiters browsing the marketplace find company age more informative than when the record was created
- Hiring badge conditioned on `open_roles_count > 0` (not just non-null) to avoid showing "Hiring" for companies with 0 open roles

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Company type and grid card are updated; ready for 26-02 (list card redesign)
- `formatSalary` is available in shared helpers for any future card or detail panel usage
- Both marketplace and my-companies tabs build cleanly with no type errors

---
*Phase: 26-company-card-redesign*
*Completed: 2026-03-04*
