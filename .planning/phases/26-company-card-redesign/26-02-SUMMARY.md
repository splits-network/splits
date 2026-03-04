---
phase: 26-company-card-redesign
plan: "02"
subsystem: ui
tags: [react, nextjs, daisyui, basel-ui, company-cards, junction-data, company-skills, company-perks]

# Dependency graph
requires:
  - phase: 26-01
    provides: GridCard and GridView components with editorial layout redesign

provides:
  - Tech Stack section on company grid cards (outline BaselBadge, max 6, +N more)
  - Perks section on company grid cards (secondary BaselBadge, max 4, +N more)
  - Junction data fetching in GridView via /company-skills and /company-perks per company
  - tagMap state: Record<companyId, { skills: string[], perks: string[] }>

affects:
  - 26-03 (list card redesign — same pattern for tag sections)
  - Any future grid card feature work

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Promise.all batching over company IDs for parallel junction data fetch"
    - "tagMap state pattern: Record<id, { skills, perks }> for O(1) card lookup"
    - "Marketplace-only conditional fetch with cancelled flag cleanup"

key-files:
  created: []
  modified:
    - apps/portal/src/app/portal/companies/components/grid/grid-view.tsx
    - apps/portal/src/app/portal/companies/components/grid/grid-card.tsx

key-decisions:
  - "Junction data fetched in GridView not GridCard — avoids N individual component fetches, enables single useEffect with cleanup"
  - "tagMap keyed by company ID, passed as techStack/perks string arrays to each card"
  - "Marketplace-only tag sections — my-companies tab does not surface junction tags on cards"
  - "Tech stack max 6, perks max 4 — keeps card height reasonable"

patterns-established:
  - "Grid view owns junction data fetch; passes name arrays down to cards as props"
  - "Overflow indicators use text-sm font-semibold text-base-content/40 (not text-xs per typography rule)"

# Metrics
duration: 15min
completed: 2026-03-04
---

# Phase 26 Plan 02: Company Card Tags Summary

**Company grid cards now surface tech stack (outline badges, max 6) and perks (secondary badges, max 4) fetched from junction APIs in the grid view**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-04T00:22:00Z
- **Completed:** 2026-03-04T00:37:40Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- GridView fetches `/company-skills` and `/company-perks` for each visible marketplace company via `Promise.all`, storing name arrays in a `tagMap` state keyed by company ID
- GridCard accepts `techStack?: string[]` and `perks?: string[]` props and renders two new conditional sections between the stats row and footer
- Tech Stack section uses `BaselBadge variant="outline"` with max 6 items and "+N more" overflow indicator
- Perks section uses `BaselBadge color="secondary"` with max 4 items and "+N more" overflow indicator
- Both sections are guarded by `isMarketplace &&` — my-companies tab shows no tag sections

## Task Commits

1. **Tasks 1 & 2: Junction data fetch + tag sections on card** - `2375523a` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `apps/portal/src/app/portal/companies/components/grid/grid-view.tsx` - Added `useAuth`, `useEffect`, `tagMap` state, junction fetching, and `techStack`/`perks` props on GridCard
- `apps/portal/src/app/portal/companies/components/grid/grid-card.tsx` - Added `techStack` and `perks` props, Tech Stack section, Perks section

## Decisions Made

- Tasks 1 and 2 committed together in a single atomic commit — they are tightly coupled (view fetches, card displays) and have no independent value.
- tagMap cleanup uses cancelled flag pattern (same as company-detail.tsx fetchDetail) for safe async teardown.
- Overflow "+N more" text uses `text-sm` not `text-xs` per typography rules (Rule 9).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 9 - Typography] Changed overflow text from text-xs to text-sm**
- **Found during:** Task 2 (implementing overflow indicator)
- **Issue:** Plan specified `text-xs` for the "+N more" overflow spans, which violates the typography rule (minimum readable size is text-sm)
- **Fix:** Used `text-sm font-semibold text-base-content/40` instead of `text-xs`
- **Files modified:** apps/portal/src/app/portal/companies/components/grid/grid-card.tsx
- **Committed in:** 2375523a

---

**Total deviations:** 1 auto-fixed (1 typography)
**Impact on plan:** Minor typography correction — no scope creep.

## Issues Encountered

None - plan executed cleanly. API response shape confirmed from company-tags-section.tsx reference: `{ skill: { id, name } }` and `{ perk: { id, name } }`.

## Next Phase Readiness

- Grid card tag sections complete
- Pattern established for list card (26-03): same tagMap approach, same BaselBadge variants
- No blockers

---
*Phase: 26-company-card-redesign*
*Completed: 2026-03-04*
