---
phase: 13-gpt-api-endpoints
plan: 03
subsystem: api
tags: [gpt, oauth, typescript, fastify, confirmation-flow]

# Dependency graph
requires:
  - phase: 13-gpt-api-endpoints
    plan: 01
    provides: GPT action types, helpers, repository, confirmation token store
provides:
  - POST /api/v2/applications/submit with two-step confirmation safety
  - Pre-screen question validation and collection
  - Duplicate application blocking with date reporting
  - Audit event publishing for application submissions
affects: [openapi-spec-generation, gpt-builder-configuration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Two-step confirmation flow (CONFIRMATION_REQUIRED → confirmed + token)
    - Pre-screen question validation before submission
    - Race condition guard with duplicate check
    - Audit event publishing with error tolerance

key-files:
  created: []
  modified:
    - services/gpt-service/src/v2/actions/routes.ts
    - services/gpt-service/src/v2/routes.ts

key-decisions:
  - "Two-step confirmation prevents accidental AI-driven submissions"
  - "Required pre-screen questions block submission until answered"
  - "Duplicate check includes original application date in error message"
  - "Confirmation token validated for user ownership (security)"
  - "Event publishing failures logged but don't fail request"

patterns-established:
  - "Path A (confirmed falsy): Validate, generate token, return summary"
  - "Path B (confirmed true): Validate token, execute, publish event"
  - "Pre-screen validation: return questions if missing, support partial completion"
  - "Race condition guard: re-check duplicates before final submission"

# Metrics
duration: 4min
completed: 2026-02-13
---

# Phase 13 Plan 03: Application Submission Endpoint Summary

**POST /api/v2/applications/submit with two-step confirmation safety pattern, pre-screen validation, and duplicate blocking**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-13T16:58:45Z
- **Completed:** 2026-02-13T17:03:02Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Implemented POST /api/v2/applications/submit with comprehensive two-step confirmation flow
- Path A (first call): validates job, checks duplicates, validates pre-screen questions, generates confirmation token, returns detailed summary
- Path B (confirmed=true): validates token ownership, re-checks duplicates, creates application, saves answers, publishes event
- Pre-screen question validation with smart error responses (all questions if none provided, missing questions if partial)
- Duplicate application blocking with original application date in error message
- Confirmation token security validation (user ownership check)
- Audit event publishing with error tolerance (logs but doesn't fail request)
- Race condition guard with duplicate check before final submission
- Comprehensive error handling with GPT-friendly structured errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement POST /api/v2/applications/submit with confirmation safety** - `ed9e9350` (feat)

## Files Created/Modified
- `services/gpt-service/src/v2/actions/routes.ts` - Added Route 4 (POST /api/v2/applications/submit) with 275 lines implementing two-step confirmation
- `services/gpt-service/src/v2/routes.ts` - Wired eventPublisher through to registerActionRoutes config

## Decisions Made

1. **Two-step confirmation safety pattern** - First call returns CONFIRMATION_REQUIRED with detailed summary (job, requirements, answers, warnings). Second call with confirmed=true + token executes. Prevents accidental AI submissions.

2. **Pre-screen question validation strategy** - If required questions missing AND no answers provided at all, return ALL required questions. If some answers provided but required ones missing, return ONLY missing questions. Supports conversational collection.

3. **Duplicate application date reporting** - Error message includes `You already applied to this job on ${date}` so GPT can tell user exactly when they applied. Better UX than generic "already applied".

4. **Token ownership validation** - Validates token.clerkUserId === request.gptAuth!.clerkUserId before executing. Security guard against token theft/replay.

5. **Event publishing error tolerance** - If eventPublisher.publish() fails, log error but don't fail the request. Application submission succeeded, audit event is secondary.

6. **Race condition guard** - Re-check duplicate AFTER token validation, BEFORE createApplication(). Guards against parallel submissions with same token.

7. **Requirements summary truncation** - Top 5 mandatory requirements only in confirmation summary. Keeps GPT response concise.

8. **Optional question warnings** - If optional pre-screen questions not answered, add to warnings array. User can proceed but knows they skipped optional fields.

## Deviations from Plan

None - plan executed exactly as written. All 9 steps in Path A and all 9 steps in Path B implemented per specification.

## Issues Encountered

None - types, helpers, and repository methods from Plan 01 worked seamlessly. Confirmation token store functioned correctly. Event publishing integrated cleanly.

## User Setup Required

None - uses existing confirmation token store (in-memory Map from Plan 01) and EventPublisher wiring from v2/routes.ts.

## Next Phase Readiness

Application submission endpoint complete. Phase 13 can now move to:
- Plan 04: Resume analysis endpoint (if not already complete)
- Phase 14: OpenAPI spec generation and GPT Builder configuration

POST /api/v2/applications/submit is the most complex GPT endpoint (275 lines) and the only write action. Two-step confirmation pattern successfully prevents accidental AI-driven submissions while maintaining smooth conversational UX.

**Blockers:** None

**Concerns:** Confirmation token store is in-memory - tokens lost on service restart. Acceptable for Phase 13 (15-min TTL, low GPT usage, restart unlikely mid-flow). If needed later, can migrate to Redis or Supabase table.

---
*Phase: 13-gpt-api-endpoints*
*Completed: 2026-02-13*
