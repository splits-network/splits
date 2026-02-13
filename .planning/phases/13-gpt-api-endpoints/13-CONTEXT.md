# Phase 13: GPT API Endpoints - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Backend API endpoints in gpt-service that ChatGPT calls via OAuth access tokens: job search, job details, application status, application submission (with confirmation safety), and resume fit analysis. All endpoints enforce candidate-scoped data isolation via the authenticated token's clerk_user_id.

</domain>

<decisions>
## Implementation Decisions

### Response formatting
- Structured JSON responses (objects/arrays) — GPT formats conversationally using its instructions
- Medium detail for job search results: title, company, location, commute type, posted date, salary range, job level, and 1-2 sentence summary
- 5 results per page (keeps GPT responses concise in chat)
- Application status defaults to active applications only (pending, interviewing, offered) — user can explicitly request rejected/withdrawn

### Confirmation flow
- Two-step submission: first call returns CONFIRMATION_REQUIRED with detailed summary
- Confirmation summary includes: job title, company, key requirements, pre-screen answers provided, and any missing info warnings
- Required pre-screen questions MUST be answered before submission — reject without answers and return the question list so GPT can collect answers conversationally
- Confirmation token expires after 15 minutes (enough time for user to review and ask follow-ups)
- Duplicate applications are blocked — return error with "You already applied to this job on [date]"

### Resume analysis
- Server-side analysis via ai-service (consistent scoring, not GPT-variable)
- Endpoint accepts optional `resume_text` parameter — if provided, use it for analysis (GPT extracts text from user-uploaded file in chat)
- If `resume_text` not provided, fall back to stored resume from document-service
- If neither exists, return error with guidance to upload at applicant.network/portal/profile
- Output: numeric fit score (0-100), list of strengths, list of gaps, overall recommendation
- This is NOT "file upload via GPT Actions" — it's the GPT reading a user's file and passing extracted text as a string parameter

### Error responses
- Structured error objects: `{ error: { code: 'NOT_FOUND', message: '...', suggestion: '...' } }`
- 403 scope errors include `required_scope` field so GPT can guide re-authorization
- 401 auth errors are specific: `TOKEN_EXPIRED`, `TOKEN_REVOKED`, `TOKEN_INVALID` — GPT tells user to reconnect
- Standard HTTP status codes (400, 401, 403, 404, 409, 500)

### Claude's Discretion
- Rate limiting: defer to Phase 15 or add basic per-endpoint limits — Claude picks based on phase split
- Exact error message wording
- Internal service call patterns (how gpt-service calls ats-service, document-service, ai-service)
- Pagination metadata format

</decisions>

<specifics>
## Specific Ideas

- Resume text passthrough: ChatGPT can read files uploaded in the chat and pass extracted text as a string parameter — this enables resume analysis without traditional file upload
- Duplicate application blocking should include the original application date so the GPT can tell the user when they applied
- Pre-screen question collection happens conversationally in ChatGPT — the endpoint returns the questions, GPT asks the user, then resubmits with answers

</specifics>

<deferred>
## Deferred Ideas

- Resume upload via GPT file attachment (native file upload through GPT Actions) — revisit when GPT Actions file support matures
- Smart job recommendations based on profile matching — v5.1

</deferred>

---

*Phase: 13-gpt-api-endpoints*
*Context gathered: 2026-02-13*
