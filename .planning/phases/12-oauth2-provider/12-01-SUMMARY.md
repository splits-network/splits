---
phase: 12-oauth2-provider
plan: 01
subsystem: database
tags: [postgres, oauth2, scopes, es256, jwt, config]

# Dependency graph
requires:
  - phase: 11-service-foundation
    provides: GPT OAuth tables (gpt_authorization_codes, gpt_sessions)
provides:
  - Scopes columns on GPT OAuth tables (TEXT[] arrays)
  - GptConfig updated for ES256 asymmetric JWT signing
  - Token TTL defaults aligned with Phase 12 decisions
affects: [12-02-oauth-endpoints, 12-03-jwt-validation, oauth2-provider]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ES256 asymmetric JWT signing with EC private key"
    - "Postgres TEXT[] for scope arrays with empty array defaults"

key-files:
  created:
    - supabase/migrations/20260221000001_add_scopes_to_gpt_oauth_tables.sql
  modified:
    - packages/shared-config/src/index.ts

key-decisions:
  - "ES256 asymmetric signing replaces symmetric jwtSecret"
  - "Access token TTL reduced to 15 min (900s) for tighter security"
  - "Auth code TTL reduced to 5 min (300s) per OAuth best practices"

patterns-established:
  - "Scopes stored as TEXT[] arrays with NOT NULL DEFAULT '{}' for gradual migration safety"
  - "granted_scopes column tracks cumulative permissions for returning user experience"

# Metrics
duration: 2min
completed: 2026-02-13
---

# Phase 12 Plan 01: Schema & Config Foundation Summary

**Added scopes columns to GPT OAuth tables and migrated GptConfig to ES256 asymmetric JWT signing with corrected TTL defaults**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-13T15:03:07Z
- **Completed:** 2026-02-13T15:05:06Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Database schema now supports granular scopes (`jobs:read`, `applications:read`, `applications:write`, `resume:read`)
- GptConfig interface migrated from symmetric `jwtSecret` to asymmetric `ecPrivateKeyBase64` for ES256 signing
- Token TTLs aligned with Phase 12 security decisions (15-min access tokens, 5-min auth codes)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add scopes columns to GPT OAuth tables** - `208f66f0` (feat)
2. **Task 2: Update GptConfig for ES256 asymmetric signing** - `5dbe1579` (feat)

## Files Created/Modified
- `supabase/migrations/20260221000001_add_scopes_to_gpt_oauth_tables.sql` - Adds scopes columns to gpt_authorization_codes and gpt_sessions tables
- `packages/shared-config/src/index.ts` - Updated GptConfig interface with ecPrivateKeyBase64 and corrected TTL defaults

## Decisions Made
None - plan executed exactly as written.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Database schema ready for OAuth2 authorization flow implementation. Config interface ready for ES256 JWT signing. Next plan can implement OAuth endpoints (`/authorize`, `/token`) using these foundations.

No blockers.

---
*Phase: 12-oauth2-provider*
*Completed: 2026-02-13*
