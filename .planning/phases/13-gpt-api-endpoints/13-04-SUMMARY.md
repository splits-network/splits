---
phase: 13-gpt-api-endpoints
plan: 04
subsystem: api
tags: [fastify, ai-service, resume-analysis, gpt-actions, oauth]

# Dependency graph
requires:
  - phase: 13-01
    provides: GptActionRepository with getCandidateResume and resolveCandidateId, GptResumeAnalysisRequest/Response types, error helpers
  - phase: 12
    provides: OAuth middleware (extractGptAuth, requireScope) for GPT token validation
  - phase: ai-service
    provides: POST /api/v2/ai-reviews endpoint for server-side fit analysis

provides:
  - POST /api/v2/resume/analyze endpoint accepting optional resume_text or using stored resume
  - Server-side resume analysis via ai-service with consistent scoring
  - Structured fit analysis response (fit_score, strengths, gaps, recommendation, summary)
  - gpt.action.resume_analyzed audit events

affects: [13-05-openapi, 14-gpt-builder-config, candidate-workflow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Resume text passthrough pattern: GPT extracts text from user file and passes as string parameter"
    - "Fallback pattern: request parameter > stored database record > error with guidance"
    - "ai-service integration via internal service key authentication"
    - "Synthetic application_id with gpt-analysis- prefix for non-application reviews"

key-files:
  created: []
  modified:
    - services/gpt-service/src/v2/actions/routes.ts

key-decisions:
  - "Resume text priority: GPT-provided > stored resume > error (enables chat-based resume upload)"
  - "Use concerns field from ai-service as gaps (more descriptive than missing_skills)"
  - "Synthetic application_id with timestamp for tracking without real application"
  - "ai-service URL defaults to port 3009 (http://ai-service:3009)"

patterns-established:
  - "Resume analysis without traditional file upload: GPT reads file, passes text as string"
  - "Server-side AI analysis via ai-service for consistency across GPT and portal"

# Metrics
duration: 3min
completed: 2026-02-13
---

# Phase 13 Plan 04: Resume Analysis Endpoint Summary

**GPT resume analysis endpoint with ai-service integration, accepting GPT-extracted text or stored resume, returning fit score and structured recommendations**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-13T16:59:27Z
- **Completed:** 2026-02-13T17:02:19Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- POST /api/v2/resume/analyze endpoint accepts optional resume_text from GPT or falls back to stored resume
- Server-side analysis via ai-service ensures consistent scoring (not GPT-variable)
- Structured response with fit_score (0-100), strengths, gaps, recommendation, overall_summary
- Error handling for: no candidate profile, invalid/missing job, no resume available
- Audit event publishing for analytics tracking

## Task Commits

**Note:** The implementation for this plan was completed as part of Plan 13-02 (commit `0e1d2870`) to avoid merge conflicts, since Plans 02, 03, and 04 all modify the same file (services/gpt-service/src/v2/actions/routes.ts). The Plan 02 execution included all routes to enable parallel plan execution without conflicts.

**Implementation included in Plan 02:**
- Route 4: POST /api/v2/resume/analyze - Part of commit `0e1d2870` (docs(13-02): complete read-only GPT endpoints plan)

## Files Created/Modified
- `services/gpt-service/src/v2/actions/routes.ts` - Added POST /api/v2/resume/analyze route handler with:
  - Resume text resolution (GPT-provided > stored > error)
  - Job validation and details fetching
  - ai-service integration with internal service key auth
  - Response mapping from ai-service review to GptResumeAnalysisResponse
  - Audit event publishing

## Decisions Made

**Resume text priority order:**
- First: Use `resume_text` from request body if GPT extracted from user file
- Second: Fetch stored resume via `repository.getCandidateResume(candidateId)` and use `metadata.extracted_text`
- Third: Return 400 error with guidance to upload resume

**ai-service integration:**
- Call POST /api/v2/ai-reviews with synthetic application_id (`gpt-analysis-${candidateId}-${job_id}-${Date.now()}`)
- Synthetic ID avoids collision with real applications while enabling tracking
- ai-service's `enrichInputIfNeeded` skips application fetch since all fields provided directly

**Response mapping:**
- `gaps` field uses `review.concerns` (primary, more descriptive) with fallback to `review.missing_skills`
- This provides more actionable feedback than just listing missing skills

**Environment defaults:**
- AI_SERVICE_URL defaults to `http://ai-service:3009` (matches ai-service's default port from src/index.ts)

## Deviations from Plan

None - plan executed as written. Implementation was included in Plan 02 to avoid merge conflicts during parallel execution.

## Issues Encountered

None - straightforward implementation following established patterns from Plans 01 and 02.

## User Setup Required

None - uses existing environment variables (AI_SERVICE_URL optional, INTERNAL_SERVICE_KEY already configured).

## Next Phase Readiness

**Ready for Phase 14 (OpenAPI Schema):**
- All four GPT action endpoints implemented:
  - GET /api/v2/jobs/search (job search)
  - GET /api/v2/jobs/:id (job details)
  - GET /api/v2/applications (application status)
  - POST /api/v2/resume/analyze (resume analysis)
- Missing: POST /api/v2/applications/submit (Plan 03, not yet implemented)
- OpenAPI schema can document all implemented endpoints with proper request/response types

**Note:** Plan 03 (application submission with confirmation flow) has not been executed yet. The current file shows 4 routes, but the POST /api/v2/applications/submit route is missing. Plan 03 will need to add that route.

---
*Phase: 13-gpt-api-endpoints*
*Completed: 2026-02-13*
