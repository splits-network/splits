---
phase: 50-post-migration-text-metadata-cleanup
plan: 02
subsystem: ui
tags: [text-cleanup, terminology, shared-video, portal, recording-consent, calendar]

# Dependency graph
requires:
  - phase: 48-interview-migration-cleanup
    provides: Core interview-to-call migration completed
provides:
  - Recording consent dialog with call terminology
  - Calendar preferences with call terminology
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - packages/shared-video/src/components/recording-consent.tsx
    - apps/portal/src/app/portal/integrations/components/calendar-preferences-panel.tsx

key-decisions:
  - "API endpoint paths (/interviews/calendar-preferences) left unchanged to preserve backend contract"
  - "All remaining portal 'interview' references confirmed as legitimate domain concepts (application pipeline stage, not video calls)"

patterns-established: []

# Metrics
duration: 1min
completed: 2026-03-09
---

# Phase 50 Plan 02: Recording Consent & Calendar Preferences Text Cleanup Summary

**Updated recording consent dialog and calendar preferences to use "call" terminology instead of legacy "interview" references**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-10T00:29:04Z
- **Completed:** 2026-03-10T00:30:17Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Recording consent heading changed to "This Call Will Be Recorded"
- Recording consent body and access note updated to reference "call" and "call participants"
- Calendar preferences text updated to "scheduling calls"
- Full sweep of shared-video confirmed zero remaining interview references
- Full sweep of portal confirmed all remaining interview references are legitimate domain concepts

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix recording consent text** - `8ef47034` (feat)
2. **Task 2: Fix calendar preferences text and sweep portal** - `f7061c04` (feat)

## Files Created/Modified
- `packages/shared-video/src/components/recording-consent.tsx` - Updated heading, body text, and access note from interview to call terminology
- `apps/portal/src/app/portal/integrations/components/calendar-preferences-panel.tsx` - Changed "scheduling interviews" to "scheduling calls" in user-facing description

## Decisions Made
- API endpoint paths (`/interviews/calendar-preferences`) left unchanged -- these are backend route contracts, not user-facing text
- All remaining portal "interview" references confirmed as legitimate domain concepts: application pipeline stages, notification event types, calendar event detection, ATS sync fields, dashboard stats, marketing content, privacy policy, and documentation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All shared-video components now use consistent "call" terminology
- Calendar preferences UI aligned with call-centric language
- Ready for any remaining text cleanup plans in phase 50

---
*Phase: 50-post-migration-text-metadata-cleanup*
*Completed: 2026-03-09*
