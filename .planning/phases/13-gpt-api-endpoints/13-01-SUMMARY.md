---
phase: 13-gpt-api-endpoints
plan: 01
subsystem: api
tags: [gpt, oauth, typescript, supabase, fastify]

# Dependency graph
requires:
  - phase: 12-oauth-provider
    provides: OAuth2 authentication infrastructure, opaque token validation, GPT session management
provides:
  - GPT action types (request/response interfaces for all 5 endpoints)
  - Error response builder with structured error codes
  - Job/application formatters for GPT-friendly output
  - Confirmation token store (in-memory, 15-minute expiry)
  - GptActionRepository with 9 query methods for jobs, applications, documents
affects: [13-02, 13-03, 13-04, ai-service-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Two-step confirmation flow with ephemeral tokens
    - GPT-friendly response formatting (medium detail, concise)
    - Candidate-scoped data isolation via resolveAccessContext

key-files:
  created:
    - services/gpt-service/src/v2/actions/types.ts
    - services/gpt-service/src/v2/actions/helpers.ts
    - services/gpt-service/src/v2/actions/repository.ts
  modified:
    - services/gpt-service/src/v2/routes.ts

key-decisions:
  - "In-memory confirmation token store (15-minute expiry, crypto.randomUUID with gpt_confirm_ prefix)"
  - "Hardcoded 5 results per page for job search (keeps GPT responses concise)"
  - "Active application stages filter by default (9 active stages vs 2 inactive)"
  - "Salary range formatting: $XXk-$XXk, $XXk+, Up to $XXk, or null"

patterns-established:
  - "gptError() builder for consistent { error: { code, message, suggestion?, required_scope? } } responses"
  - "formatJobForGpt() maps raw Supabase rows to GPT-friendly format with summary truncation"
  - "formatStageLabel() maps internal stages to human-readable labels"

# Metrics
duration: 2min
completed: 2026-02-13
---

# Phase 13 Plan 01: GPT Action Foundation Layer Summary

**TypeScript types, Supabase repository with 9 query methods, error helpers, and confirmation token store for GPT action endpoints**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-13T17:59:22Z
- **Completed:** 2026-02-13T18:01:40Z
- **Tasks:** 2
- **Files modified:** 3 created, 1 modified

## Accomplishments
- Complete type definitions for all 5 GPT action endpoints (job search, job details, application status, application submission, resume analysis)
- GptActionRepository with candidate-scoped queries: searchJobs, getJobDetail, getApplicationsForCandidate, checkDuplicateApplication, createApplication, savePreScreenAnswers, getPreScreenQuestions, getCandidateResume, resolveCandidateId
- Error response builder and GPT-friendly formatters (job summary, stage labels, salary ranges)
- Confirmation token store with 15-minute expiry for two-step submission flow

## Task Commits

Each task was committed atomically:

1. **Task 1: Create types, error helpers, and confirmation token store** - `b27c3b85` (feat)
2. **Task 2: Create GptActionRepository and wire into route registration** - `51022d04` (feat)

## Files Created/Modified
- `services/gpt-service/src/v2/actions/types.ts` - Request/response types for all GPT endpoints, error codes, confirmation token
- `services/gpt-service/src/v2/actions/helpers.ts` - gptError(), formatJobForGpt(), formatStageLabel(), confirmation token store (in-memory Map)
- `services/gpt-service/src/v2/actions/repository.ts` - GptActionRepository with 9 Supabase query methods
- `services/gpt-service/src/v2/routes.ts` - Instantiate actionRepository, ready for Plans 02-04

## Decisions Made

1. **In-memory confirmation token store** - Used Map with crypto.randomUUID() for ephemeral tokens. 15-minute expiry matches context decisions. Tokens deleted on expiry check. Simple, fast, scales fine for GPT usage patterns.

2. **Hardcoded 5 results per page** - Keeps GPT responses concise in chat. Explicitly per CONTEXT.md decision. No pagination parameter exposed to avoid overwhelming users.

3. **Active stages filter by default** - getApplicationsForCandidate() filters to 9 active stages (draft, submitted, company_review, interview, offer, ai_review, screen, recruiter_proposed, recruiter_request) unless `include_inactive: true`. Matches context decision for cleaner default UX.

4. **Salary range formatting** - Three formats: "$XXk-$XXk" (both exist), "$XXk+" (min only), "Up to $XXk" (max only), null (neither). Conversational, GPT-friendly.

5. **Search filter precedence** - textSearch on search_vector for keywords, ilike on location ONLY when keywords not provided (avoid conflict). Same pattern as ats-service JobRepository.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all queries compiled cleanly, types validated, repository pattern matched ats-service precedents.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Foundation layer complete. Plans 02-04 can now implement route handlers:
- 13-02: Job search and job details endpoints
- 13-03: Application status and submission endpoints (uses confirmation token store)
- 13-04: Resume analysis endpoint (calls ai-service)

Repository ready for use, types exported, helpers available, routes.ts wired for action route registration.

**Blockers:** None

**Concerns:** Confirmation token store is in-memory - tokens lost on service restart. Acceptable for Phase 13 (15-min TTL, low GPT usage). If needed later, can migrate to Redis or Supabase table.

---
*Phase: 13-gpt-api-endpoints*
*Completed: 2026-02-13*
