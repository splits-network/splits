# Feature Landscape: Custom GPT Actions Backend (Applicant.Network)

**Domain:** Custom GPT with Actions for a recruiting/job marketplace (candidate-facing)
**Researched:** 2026-02-13
**Confidence:** MEDIUM-HIGH (based on codebase analysis + training knowledge of OpenAI GPT Actions; WebSearch/WebFetch unavailable for verification of latest GPT Actions API changes)

## Executive Summary

This document maps the feature landscape for a gpt-service microservice that powers a Custom GPT in the OpenAI GPT Store. The GPT is candidate-facing (Applicant.Network), allowing job seekers to search jobs, analyze resumes, check application status, and submit applications through natural language in ChatGPT.

The existing platform provides all underlying capabilities (job search, AI fit analysis, application management, document storage, RBAC). The gpt-service is a **translation layer** that bridges OpenAI's GPT Actions protocol with these existing services.

**Key insight:** The GPT does not need new domain logic. It needs (1) an OAuth2 provider flow to authenticate candidates, (2) GPT-optimized API endpoints that accept natural language parameters and return GPT-friendly responses, and (3) a confirmation safety pattern for all write operations.

---

## Table Stakes

Features users expect. Missing any of these means the GPT is non-functional or unusable in the GPT Store.

### TS-1: OpenAPI 3.0 Action Schema

**What:** A complete OpenAPI 3.0.1 YAML specification defining all GPT Actions, their parameters, response schemas, and authentication requirements.
**Why Expected:** OpenAI requires a valid OpenAPI spec to register Actions. Without it, the GPT cannot call any endpoints. This is the literal contract between ChatGPT and the backend.
**Complexity:** Medium
**Dependencies:** All endpoint designs must be finalized first
**Notes:**
- Must use OpenAPI 3.0.1 (not 3.1 -- GPT Actions parser has historically been strict about this)
- Each action needs an `operationId` that GPT uses to select which action to call
- `description` fields on operations and parameters are critical -- GPT reads these to decide when and how to call actions
- Existing starter at `docs/gpt/04_OpenAPI_Starter.yaml` is skeletal; needs full expansion
- Response schemas must be fully specified (GPT needs them to format answers)
- Maximum ~30 actions per GPT (practical limit, not hard limit)
- Parameters should use descriptive names and enums where possible to help GPT map natural language correctly

**Confidence:** HIGH for OpenAPI 3.0.1 requirement. MEDIUM for 3.0 vs 3.1 strictness (based on training data, could not verify current state).

---

### TS-2: OAuth2 Provider Flow (Account Linking)

**What:** Backend acts as an OAuth2 authorization code provider. GPT initiates OAuth flow, backend redirects to Clerk login, validates session, issues short-lived GPT access token and refresh token.
**Why Expected:** GPT Actions require OAuth2 for authenticated endpoints. Without this, the GPT can only access public data (active job listings). All personalized features (my applications, submit application, resume analysis linked to profile) require authentication.
**Complexity:** High
**Dependencies:** Clerk authentication infrastructure (existing)
**Notes:**
- **Flow:** GPT sends user to `/oauth/authorize` -> backend redirects to Clerk Hosted Login -> Clerk returns session -> backend issues GPT-specific JWT tokens
- **Token format:** Short-lived access tokens (15-30 min), longer refresh tokens (7-30 days)
- **Token storage:** `gpt_tokens` table in Supabase with columns: token_id, clerk_user_id, candidate_id, access_token_hash, refresh_token_hash, scopes, expires_at, created_at, revoked_at
- **Scopes:** `candidate:read` (view jobs, applications), `candidate:write` (submit applications), `candidate:resume` (upload/analyze resumes)
- **Required endpoints:** `GET /oauth/authorize`, `POST /oauth/token` (grant_type=authorization_code and grant_type=refresh_token), `POST /oauth/revoke`
- **Per-user isolation:** Every token is linked to a specific candidate_id. All data queries are scoped to that candidate's data only.
- OpenAI GPT Actions OAuth requires specific callback URL format: `https://chat.openai.com/aip/<plugin_id>/oauth/callback`

**Confidence:** HIGH that OAuth2 authorization code flow is required. MEDIUM on exact callback URL format (based on training knowledge, could not verify latest OpenAI docs).

---

### TS-3: Job Search via Natural Language

**What:** GPT Action endpoint that accepts natural language search parameters and returns structured job listings. Maps free-text queries ("remote React jobs in Austin paying over $120k") to structured filters against existing job search infrastructure.
**Why Expected:** Job search is the primary use case for a candidate-facing GPT. This is the reason a candidate would install the GPT.
**Complexity:** Medium
**Dependencies:** Existing `GET /api/v2/jobs` endpoint with search, commute_type, job_level, location, employment_type filters
**Notes:**
- **Endpoint:** `GET /api/v1/gpt/jobs`
- **Parameters the GPT can extract and send:**
  - `keywords` (string) -- free text search terms, maps to `search` parameter on jobs endpoint (uses PostgreSQL full-text search via `search_vector` column)
  - `location` (string) -- city, state, or "remote"
  - `commute_type` (enum: remote, hybrid_1, hybrid_2, hybrid_3, hybrid_4, in_office) -- maps directly to existing `commute_type` filter
  - `job_level` (enum: entry, mid, senior, lead, manager, director, vp, c_suite) -- maps directly to existing `job_level` filter
  - `employment_type` (string) -- full_time, part_time, contract, etc.
  - `salary_min` (number) -- minimum salary filter (requires post-query filtering since salary fields are on the job record, not indexed for range queries in current implementation)
  - `page` (number), `limit` (number) -- pagination
- **Response format:** GPT-optimized (condensed) job listings with: title, company name, location, salary range, commute type, job level, short description snippet, job_id for follow-up actions
- **Key design:** Do NOT try to parse natural language server-side. Let GPT do the NLP work -- it will extract structured parameters from the user's natural language and send them as query parameters. The OpenAPI schema descriptions guide GPT on what to extract.
- **Unauthenticated access:** Job search should work without OAuth (public data). Jobs with `status: 'active'` are already publicly visible in the existing endpoint when no clerkUserId is provided.

**Existing infrastructure to leverage:**
- `JobRepository.findJobs()` already supports: full-text search, location ilike, employment_type, commute_type overlaps, job_level, pagination, sorting
- `search_vector` tsvector column with websearch config
- Company join for company name/logo

**Confidence:** HIGH. Fully verified through codebase analysis.

---

### TS-4: Application Status Lookup

**What:** GPT Action endpoint that lets authenticated candidates check their application statuses. Returns current stage, job details, and recent activity for their applications.
**Why Expected:** Candidates asking "what's the status of my applications?" or "did I hear back from [company]?" is a core use case. Without this, the GPT cannot provide personalized value.
**Complexity:** Low
**Dependencies:** Existing `GET /api/v2/applications` endpoint, OAuth2 authentication (TS-2)
**Notes:**
- **Endpoint:** `GET /api/v1/gpt/applications`
- **Parameters:**
  - `status` (enum: active, all) -- "active" filters out terminal stages (rejected, withdrawn, expired, hired)
  - `job_id` (string, optional) -- filter to specific job
  - `page`, `limit` -- pagination
- **Response format:** Application list with: job_title, company_name, current_stage (human-readable), applied_date, last_updated, ai_review_summary (if exists)
- **Stage mapping:** Map internal stages to human-readable labels:
  - `draft` -> "Draft (not submitted)"
  - `ai_review` -> "Under AI review"
  - `ai_reviewed` -> "AI review complete - ready to submit"
  - `recruiter_proposed` -> "Proposed by recruiter (pending your response)"
  - `recruiter_review` -> "Under recruiter review"
  - `screen` -> "Screening"
  - `submitted` -> "Submitted to company"
  - `company_review` -> "Under company review"
  - `company_feedback` -> "Company provided feedback"
  - `interview` -> "Interview stage"
  - `offer` -> "Offer received"
  - `hired` -> "Hired"
  - `rejected` -> "Not selected"
  - `withdrawn` -> "Withdrawn"
  - `expired` -> "Expired"
- **Data scoping:** Query MUST be scoped to the authenticated candidate's applications only. Use `candidateId` from the GPT token to filter.

**Existing infrastructure to leverage:**
- `ApplicationServiceV2.getApplications()` with role-based scoping
- `ApplicationFilters.candidate_id` for per-candidate filtering
- Application includes: `ai_review`, `documents` via include parameter

**Confidence:** HIGH. Fully verified through codebase analysis.

---

### TS-5: Application Submission with Confirmation Safety

**What:** GPT Action endpoint that creates a new application for a job. MUST require explicit `confirmed: true` flag. First call without confirmation returns a summary for user review; second call with `confirmed: true` executes the submission.
**Why Expected:** This is the core write action. Without the confirmation pattern, OpenAI would likely reject the GPT for safety reasons, and candidates could accidentally apply to jobs. The confirmation pattern is a standard requirement for Custom GPTs with consequential actions.
**Complexity:** Medium
**Dependencies:** Existing `POST /api/v2/applications` endpoint, OAuth2 authentication (TS-2), candidate profile with resume
**Notes:**
- **Endpoint:** `POST /api/v1/gpt/applications`
- **Request body:**
  - `job_id` (string, required) -- the job to apply for
  - `cover_letter` (string, optional) -- cover letter text
  - `resume_id` (string, optional) -- specific resume to use (defaults to primary resume)
  - `confirmed` (boolean, required) -- safety flag
- **Two-phase flow:**
  1. **Phase 1 (confirmed=false or missing):** Return HTTP 200 with `action_required: "confirmation"` response containing: job title, company name, candidate's resume being used, cover letter preview, list of pre-screen questions (if any). GPT presents this to the user.
  2. **Phase 2 (confirmed=true):** Execute the application creation. Return the created application with status.
- **Error contract:**
  ```json
  {
    "error_code": "CONFIRMATION_REQUIRED",
    "message": "Please confirm you want to apply to [Job Title] at [Company].",
    "summary": {
      "job_title": "...",
      "company": "...",
      "resume": "...",
      "has_pre_screen_questions": true
    }
  }
  ```
- **Pre-screen questions:** If the job has pre-screen questions, the confirmation summary must include them so the GPT can collect answers from the candidate before final submission.
- **Duplicate prevention:** Check for existing active application for this candidate-job pair before creating.
- **Initial stage:** Applications created via GPT should start at `draft` or `ai_review` stage (following existing flow where direct candidates go to ai_review).

**Existing infrastructure to leverage:**
- `ApplicationServiceV2.createApplication()` already handles: candidate_id resolution, recruiter auto-lookup, document linking, pre-screen answer saving, audit logging, event publishing
- `ApplicationServiceV2.triggerAIReview()` for kicking off AI review after creation
- Duplicate check logic already exists in `proposeJobToCandidate`

**Confidence:** HIGH for two-phase confirmation pattern. MEDIUM on exact OpenAI `x-openai-isConsequential` header behavior (training knowledge, could not verify current spec).

**Important note on consequential flag:** OpenAI's GPT Actions support an `x-openai-isConsequential` extension in the OpenAPI spec. When set to `true` on a POST/PUT/DELETE operation, GPT will always ask the user for confirmation before calling the endpoint. When set to `false`, GPT may skip confirmation. For application submission, this MUST be `true`. However, the backend should ALSO enforce the `confirmed` flag as defense-in-depth -- do not rely solely on GPT-side confirmation.

---

### TS-6: GPT Instructions Document

**What:** A carefully crafted system prompt (instructions) for the Custom GPT that defines its personality, capabilities, rules, and behavioral constraints.
**Why Expected:** Without instructions, the GPT will not know how to use the actions effectively, when to ask for confirmation, how to present data, or what not to do. This is the "brain" configuration.
**Complexity:** Medium (writing, iteration, testing)
**Dependencies:** All endpoint designs finalized
**Notes:**
- Existing template at `docs/gpt/05_GPT_Instructions_Template.md` is minimal; needs full expansion
- Must cover:
  - Identity: "You are the Applicant.Network AI Assistant"
  - Capabilities: What actions are available and when to use them
  - Authentication guidance: When to prompt for account linking
  - Confirmation rules: Always summarize before write actions, never assume confirmation
  - Data presentation: How to format job listings, application status, fit scores
  - Limitations: What the GPT cannot do (modify existing applications, access recruiter data, process payments)
  - Privacy: Never expose internal IDs, never share data between different users
  - Error handling: How to respond when actions fail
  - Tone: Professional but approachable, recruiting-domain appropriate
- **Token budget:** GPT instructions count against context window. Keep under ~2000 tokens while being comprehensive.

**Confidence:** HIGH. This is standard Custom GPT configuration.

---

### TS-7: GPT-Friendly Error Responses

**What:** Standardized error response format that GPT can interpret and present to users in natural language. Different from the existing API error format.
**Why Expected:** GPT reads error responses and converts them to conversational text. If errors are machine-oriented (stack traces, internal codes), the GPT will present confusing messages to users.
**Complexity:** Low
**Dependencies:** None
**Notes:**
- **Error format:**
  ```json
  {
    "error_code": "HUMAN_READABLE_CODE",
    "message": "A sentence the GPT can relay to the user",
    "details": { ... }  // Optional structured data
  }
  ```
- **Standard error codes:**
  - `AUTHENTICATION_REQUIRED` -- OAuth not connected
  - `CONFIRMATION_REQUIRED` -- Write action needs confirmation
  - `NOT_FOUND` -- Resource not found
  - `ALREADY_EXISTS` -- Duplicate application
  - `VALIDATION_ERROR` -- Invalid input
  - `RATE_LIMITED` -- Too many requests
  - `INTERNAL_ERROR` -- Server error (hide details)
- **Key principle:** Error `message` should be a complete sentence that GPT can present directly. No jargon, no UUIDs, no stack traces.

**Confidence:** HIGH. Standard API design practice.

---

### TS-8: Per-User Data Isolation

**What:** Every GPT request is scoped to the authenticated candidate's data only. A candidate cannot see another candidate's applications, resumes, or personal information through the GPT.
**Why Expected:** Security fundamental. Multi-tenant data isolation is non-negotiable for a recruiting platform.
**Complexity:** Low (leverage existing RBAC)
**Dependencies:** OAuth2 authentication (TS-2), existing `resolveAccessContext`
**Notes:**
- GPT tokens contain `candidate_id` claim (set during OAuth flow)
- Every gpt-service endpoint extracts `candidate_id` from the token and passes it to downstream queries
- **No admin or recruiter scope:** GPT tokens are scoped to `candidate` role only. Even if the Clerk user has recruiter/admin roles on the portal, the GPT token should only grant candidate-level access.
- Leverage existing `resolveAccessContext()` for RBAC, but the gpt-service should additionally enforce `candidateId` scoping as defense-in-depth
- **Audit logging:** All GPT-originated actions should be tagged with `source: 'gpt'` in audit logs for forensics

**Existing infrastructure to leverage:**
- `resolveAccessContext()` already returns `candidateId` and scopes queries per role
- `ApplicationRepository.findApplications()` already filters by `candidate_id`
- `JobRepository.findJobs()` already scopes job visibility by role

**Confidence:** HIGH. Fully verified through codebase analysis.

---

### TS-9: Rate Limiting (GPT-Specific)

**What:** Per-user throttle policies specifically for GPT Action endpoints, separate from portal rate limits.
**Why Expected:** GPTs can make rapid sequential calls. Without GPT-specific rate limiting, a single user (or abuse pattern) could overload backend services. OpenAI also expects backends to handle rate limiting gracefully.
**Complexity:** Low
**Dependencies:** Existing rate limiting infrastructure (if any in api-gateway)
**Notes:**
- **Suggested limits:**
  - Job search: 30 requests/minute per user
  - Application status: 20 requests/minute per user
  - Application submission: 5 requests/minute per user
  - Resume analysis: 10 requests/minute per user
- Return HTTP 429 with `Retry-After` header and GPT-friendly error message
- Rate limits keyed on `candidate_id` from GPT token, not IP address
- Consider separate rate limit buckets for read vs write operations

**Confidence:** HIGH. Standard API practice.

---

## Differentiators

Features that set the GPT apart from competitors. Not expected, but provide significant value.

### DIFF-1: Resume Analysis and Job Fit Scoring

**What:** GPT Action endpoint that analyzes a candidate's resume against specific job postings, returning fit scores, matched/missing skills, strengths, and concerns. Leverages existing ai-service.
**Why Valuable:** This is the "killer feature" that makes the GPT more than a search tool. Candidates can ask "how well does my resume match this job?" and get detailed, actionable feedback. Most job board GPTs only do search.
**Complexity:** Medium
**Dependencies:** Existing ai-service with AI review capabilities, document-service for resume access, OAuth2 authentication (TS-2)
**Notes:**
- **Endpoint:** `POST /api/v1/gpt/resume/analyze`
- **Request body:**
  - `job_id` (string, required) -- job to analyze fit against
  - `resume_id` (string, optional) -- specific resume (defaults to primary)
- **Response:** Fit score (0-100), recommendation (strong_fit/good_fit/fair_fit/poor_fit), strengths array, concerns array, matched_skills, missing_skills, overall_summary
- **Implementation:** Create a lightweight wrapper around `AIReviewServiceV2.createReview()` that:
  1. Resolves candidate's primary resume from document-service
  2. Fetches job details with requirements
  3. Calls the existing AI analysis pipeline
  4. Returns GPT-formatted results
- **NOT an application submission:** This is purely advisory. The candidate reviews the analysis and then separately decides to apply.
- **Cost consideration:** Each analysis calls OpenAI API (gpt-4o-mini). Should track per-candidate analysis count and potentially limit to prevent abuse.

**Existing infrastructure to leverage:**
- `AIReviewServiceV2.createReview()` -- full AI analysis pipeline
- `AIReviewServiceV2.enrichApplicationData()` -- fetches job requirements, candidate resume text
- `CandidateServiceV2.getCandidatePrimaryResume()` -- finds candidate's primary resume
- Document metadata includes `extracted_text` for resume text extraction

**Confidence:** HIGH. Fully verified through codebase -- this infrastructure already exists and works.

---

### DIFF-2: Job Detail Deep Dive

**What:** GPT Action endpoint that returns comprehensive details about a specific job, including requirements, pre-screen questions, company info, and candidate fit analysis (if authenticated).
**Why Valuable:** Candidates can ask "tell me more about this job" after seeing search results. Provides the full picture without leaving ChatGPT.
**Complexity:** Low
**Dependencies:** Existing `GET /api/v2/jobs/:id` with include parameters
**Notes:**
- **Endpoint:** `GET /api/v1/gpt/jobs/{job_id}`
- **Response includes:**
  - Full job description and responsibilities
  - Requirements (mandatory and preferred, from `job_requirements` table)
  - Pre-screen questions (from `job_pre_screen_questions` table)
  - Company info (name, industry, location, description, website)
  - Salary range (if available)
  - Commute type, job level, employment type
  - Whether the candidate has already applied (if authenticated)
- **Unauthenticated:** Returns job details without candidate-specific info
- **Authenticated:** Additionally checks for existing application

**Existing infrastructure to leverage:**
- `JobRepository.findJob()` with `include` parameter supports: requirements, pre_screen_questions, applications

**Confidence:** HIGH. Straightforward wrapper around existing functionality.

---

### DIFF-3: Smart Job Recommendations

**What:** GPT endpoint that recommends jobs based on the candidate's profile and resume, without requiring a specific search query. "Show me jobs I'd be a good fit for."
**Why Valuable:** Proactive recommendations are higher engagement than reactive search. Differentiates from simple search GPTs.
**Complexity:** High
**Dependencies:** Candidate profile, primary resume, ai-service
**Notes:**
- **Endpoint:** `GET /api/v1/gpt/jobs/recommended`
- **Implementation approach:**
  1. Fetch candidate's primary resume extracted text
  2. Extract key skills, experience level, location preferences from resume
  3. Use these as search parameters against the jobs endpoint
  4. Optionally run lightweight fit scoring on top N results
- **Simpler V1 approach:** Extract keywords from resume text, use them as search terms against the full-text search index. No AI required for basic version.
- **Future V2:** Use embedding similarity between resume and job descriptions for semantic matching.
- **Performance:** Must be fast enough for GPT (< 10 seconds). Pre-computing candidate profiles/embeddings would help but adds complexity.

**Confidence:** MEDIUM. The concept is sound but implementation complexity varies significantly based on approach chosen. The simpler keyword-extraction approach is feasible with existing infrastructure.

---

### DIFF-4: Conversational Application Builder

**What:** Multi-turn conversation flow where the GPT helps the candidate build their application step by step: select resume, answer pre-screen questions, write cover letter, review, and submit.
**Why Valuable:** Transforms the GPT from a "single action" tool to a guided workflow assistant. Significantly better UX than the portal form for candidates who prefer conversation.
**Complexity:** Low (from backend perspective -- GPT handles the multi-turn logic)
**Dependencies:** TS-3 (job search), TS-5 (application submission), DIFF-2 (job details)
**Notes:**
- This is primarily a **GPT Instructions** feature, not a backend feature. The backend provides:
  1. Job details with pre-screen questions (DIFF-2)
  2. Candidate's available resumes (`GET /api/v1/gpt/resumes`)
  3. Application submission with confirmation (TS-5)
- The GPT instructions guide the conversation:
  1. "Which job?" -> Search and select
  2. "Here are the pre-screen questions" -> Collect answers
  3. "Would you like to add a cover letter?" -> Optional
  4. "Here's your application summary" -> Review
  5. "Confirm to submit" -> Execute
- **Backend endpoint needed:** `GET /api/v1/gpt/resumes` -- lists candidate's uploaded resumes (name, date, size) so GPT can ask which to use
- This differentiator is "free" if the other table-stakes features are built correctly

**Confidence:** HIGH. This is a GPT Instructions design pattern that the backend naturally supports.

---

### DIFF-5: Application Progress Notifications via GPT

**What:** When a candidate starts a conversation, the GPT proactively mentions any recent application status changes ("Since we last spoke, your application to [Company] moved to Interview stage").
**Why Valuable:** Makes the GPT feel like a personal recruiting assistant, not just a query tool.
**Complexity:** Medium
**Dependencies:** TS-4 (application status), application audit log
**Notes:**
- **Endpoint:** `GET /api/v1/gpt/notifications`
- **Implementation:** Query `application_audit_log` for recent stage changes for this candidate's applications since last GPT interaction
- **Tracking "last interaction":** Store `last_gpt_interaction_at` on the GPT token record. Update on each authenticated request.
- **Response:** Array of recent changes: `{ job_title, company, old_stage, new_stage, changed_at }`
- GPT instructions: "At the start of each conversation, call getNotifications. If there are updates, mention them before asking how to help."

**Confidence:** MEDIUM. Implementation is straightforward but "last interaction" tracking adds state management complexity.

---

### DIFF-6: Pre-Screen Question Answering via GPT

**What:** GPT collects pre-screen question answers conversationally and includes them in the application submission.
**Why Valuable:** Pre-screen questions are a common friction point in job applications. Answering them in a conversation feels more natural than filling out a form.
**Complexity:** Low
**Dependencies:** TS-5 (application submission), DIFF-2 (job details with pre-screen questions)
**Notes:**
- No separate endpoint needed. Pre-screen questions come from the job details endpoint (DIFF-2). Answers are submitted with the application (TS-5).
- Application submission body includes: `pre_screen_answers: [{ question_id, answer }]`
- GPT instructions handle the conversational flow of asking questions one by one
- Existing `ApplicationServiceV2.createApplication()` already saves pre-screen answers

**Confidence:** HIGH. Existing infrastructure fully supports this.

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in GPT backend development.

### ANTI-1: Server-Side Natural Language Processing

**What:** Building NLP/intent parsing on the backend to convert natural language queries to structured filters.
**Why Avoid:** The GPT itself IS the NLP layer. ChatGPT excels at extracting structured data from natural language. Adding a second NLP layer on the backend creates confusion, latency, and maintenance burden.
**What to Do Instead:** Design the OpenAPI schema with clear parameter descriptions and enums. Let GPT extract structured parameters from user input. The backend receives clean, typed parameters.
**Consequences if Built:** Double interpretation errors (GPT misunderstands AND backend misunderstands), increased latency, wasted development time, harder debugging.

---

### ANTI-2: Exposing Raw Internal API Responses

**What:** Returning the exact same response format from gpt-service as the internal V2 endpoints return.
**Why Avoid:** Internal API responses contain UUIDs, internal status codes, database column names, and nested objects that are meaningless to GPT. The GPT will attempt to present all of this to the user, creating confusing output.
**What to Do Instead:** Create GPT-optimized response DTOs that contain only human-meaningful data. Map internal fields to user-friendly names. Truncate long descriptions. Exclude internal IDs (or move them to a separate `_metadata` field).
**Consequences if Built:** GPT outputs like "Your application with ID 550e8400-e29b-41d4-a716-446655440000 is in stage recruiter_review for job_id 123..." instead of "Your application to Senior React Developer at TechCorp is under recruiter review."

---

### ANTI-3: Recruiter/Admin Features in V1

**What:** Building recruiter search, candidate search, split opportunities, outreach drafting in the Applicant.Network GPT.
**Why Avoid:** The v5.0 milestone scope is explicitly candidate-facing (Applicant.Network). Recruiter features (Splits.Network) are a separate future milestone. Mixing audiences in one GPT creates confused UX and complex authorization.
**What to Do Instead:** Build candidate features only. Recruiter features get their own GPT in a future milestone.
**Consequences if Built:** Scope creep, delayed launch, confused GPT behavior (is it helping candidates or recruiters?), complex token scoping.

---

### ANTI-4: File Upload Through GPT Actions

**What:** Building resume upload functionality through GPT Actions (having GPT send a file to the backend).
**Why Avoid:** GPT Actions have limited support for file uploads. The standard GPT Actions protocol sends JSON payloads, not multipart form data. While GPT can read files a user uploads to the chat, passing file content through an Action is unreliable and may hit size limits.
**What to Do Instead:** For V1, use the candidate's already-uploaded resumes from the document-service. Provide a `GET /api/v1/gpt/resumes` endpoint to list available resumes. If no resume exists, instruct the GPT to direct the candidate to upload one on Applicant.Network web portal.
**Consequences if Built:** Unreliable file transfer, size limit failures, complex multipart handling in the OpenAPI spec, potential rejection from GPT Store review.

**Confidence:** MEDIUM. GPT Actions file handling capabilities may have evolved since training cutoff. Flag for verification before implementation.

---

### ANTI-5: Autonomous Multi-Step Workflows

**What:** GPT automatically chains actions without user input (e.g., search jobs -> analyze fit -> submit application in one turn).
**Why Avoid:** Violates the confirmation safety pattern. Each write action must have explicit user confirmation. Autonomous workflows bypass this safety net and could result in unwanted applications.
**What to Do Instead:** Design the GPT instructions to pause for user input between steps. The GPT presents options, the user chooses, the GPT executes (with confirmation for writes).
**Consequences if Built:** Candidates accidentally applying to jobs, potential GPT Store rejection for unsafe write behavior, user trust erosion.

---

### ANTI-6: Caching GPT Responses

**What:** Building a response cache layer in gpt-service to cache job search results or application status.
**Why Avoid:** Job data and application statuses change frequently. Cached responses lead to stale data, which is worse than slightly slower responses. The existing Supabase queries are already fast enough.
**What to Do Instead:** Rely on database query performance (which is already good -- full-text search with tsvector, indexed columns). If performance becomes an issue, add Redis caching at the repository layer, not the GPT layer.
**Consequences if Built:** Stale job listings (job already filled), wrong application status, cache invalidation complexity, debugging nightmare ("why does the GPT show different data than the portal?").

---

### ANTI-7: Custom Chat History/Memory

**What:** Building a server-side conversation history system for the GPT to remember past interactions.
**Why Avoid:** ChatGPT already manages conversation context within a session. Cross-session memory is handled by ChatGPT's memory feature. Building a parallel system is redundant and creates consistency issues.
**What to Do Instead:** Use the `last_gpt_interaction_at` timestamp (DIFF-5) for "since last time" notifications only. Do not store conversation content.
**Consequences if Built:** Privacy concerns (storing conversation content), GDPR complications, redundant with ChatGPT's built-in memory, storage costs, sync issues.

---

## Feature Dependencies

```
Authentication Foundation:
  TS-2 (OAuth2 Provider) -- all authenticated features depend on this

Read Operations (can parallelize):
  TS-3 (Job Search) -- independent, works without auth too
  TS-4 (Application Status) -- requires TS-2
  DIFF-2 (Job Details) -- independent, works without auth too

Write Operations (require auth + read features):
  TS-5 (Application Submission) -- requires TS-2, TS-3 (find job), DIFF-2 (job details for confirmation)

AI Features (require auth + existing services):
  DIFF-1 (Resume Analysis) -- requires TS-2, existing ai-service + document-service

Configuration (requires all endpoints):
  TS-1 (OpenAPI Schema) -- requires all endpoint designs finalized
  TS-6 (GPT Instructions) -- requires all endpoints + understanding of flows

Cross-cutting:
  TS-7 (Error Responses) -- implement alongside each endpoint
  TS-8 (Data Isolation) -- implement in auth middleware
  TS-9 (Rate Limiting) -- implement in api-gateway routing

Conversational Features (require table stakes):
  DIFF-4 (Application Builder) -- requires TS-3, TS-5, DIFF-2, DIFF-6
  DIFF-5 (Notifications) -- requires TS-4
  DIFF-6 (Pre-Screen Q&A) -- requires DIFF-2, TS-5

Recommendations (require AI + search):
  DIFF-3 (Smart Recommendations) -- requires TS-2, TS-3, document-service
```

**Critical path:** TS-2 (OAuth) -> TS-3 + TS-4 + DIFF-2 (read endpoints) -> TS-5 + DIFF-1 (write + AI endpoints) -> TS-1 + TS-6 (schema + instructions)

---

## MVP Recommendation

For MVP (minimum viable GPT Store listing), prioritize:

### Must Ship (Table Stakes)

1. **TS-2: OAuth2 Provider** -- Foundation for all authenticated features
2. **TS-3: Job Search** -- Primary use case, works without auth too
3. **TS-4: Application Status** -- Core personalized feature
4. **TS-5: Application Submission** -- Core write action with confirmation
5. **TS-1: OpenAPI Schema** -- Required for GPT Store listing
6. **TS-6: GPT Instructions** -- Required for GPT to function correctly
7. **TS-7: Error Responses** -- Required for usable GPT
8. **TS-8: Data Isolation** -- Security fundamental
9. **TS-9: Rate Limiting** -- Protection against abuse

### Should Ship (High-Value Differentiators)

10. **DIFF-1: Resume Analysis** -- Killer feature, leverages existing AI infrastructure
11. **DIFF-2: Job Detail Deep Dive** -- Very low complexity, high value
12. **DIFF-6: Pre-Screen Q&A** -- Free if DIFF-2 and TS-5 are built

### Defer to Post-MVP

- **DIFF-3: Smart Recommendations** -- High complexity, significant design work needed
- **DIFF-4: Conversational Application Builder** -- GPT Instructions optimization, not backend work
- **DIFF-5: Application Notifications** -- Nice but not critical for launch

### Estimated Complexity by Phase

| Phase | Features | Complexity | Notes |
|-------|----------|------------|-------|
| Phase 1: Auth | TS-2, TS-8 | High | OAuth2 provider is the hardest part |
| Phase 2: Read | TS-3, TS-4, DIFF-2 | Low-Medium | Thin wrappers around existing endpoints |
| Phase 3: Write + AI | TS-5, DIFF-1 | Medium | Confirmation pattern, AI integration |
| Phase 4: Schema + Config | TS-1, TS-6, TS-7, TS-9 | Medium | Finalize OpenAPI spec and instructions |

**MVP timeline estimate:** 2-3 weeks for a single developer, assuming all underlying services are stable.

---

## OpenAI GPT Actions: Key Constraints and Capabilities

Summary of GPT Actions platform constraints that affect feature design.

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| OpenAPI 3.0.1 required | Must author valid spec | Use existing starter, expand incrementally |
| ~30 actions practical limit | Cannot expose every endpoint | Group related operations, prioritize |
| JSON request/response only | No file upload via actions | Use existing uploaded resumes |
| OAuth2 authorization code only | Must implement full OAuth provider | Backend-as-OAuth-provider pattern |
| GPT reads operation descriptions | Descriptions are critical for correct action selection | Write detailed, unambiguous descriptions |
| Consequential flag (x-openai-isConsequential) | Controls whether GPT asks confirmation | Set true for all POST endpoints, defense-in-depth with confirmed flag |
| Response size practical limit ~100KB | Large responses may be truncated | Paginate, summarize, limit response size |
| GPT may call actions multiple times | Idempotent design important | Duplicate checks on write operations |
| No server-sent events/streaming | Cannot push updates to GPT | Polling-based design only |
| No webhook callbacks | GPT cannot receive async notifications | All operations must be synchronous |

**Confidence:** MEDIUM overall. These constraints are based on training knowledge (pre-May 2025). OpenAI frequently updates GPT Actions capabilities. Flag for verification against current documentation before implementation.

---

## Sources

**PRIMARY SOURCES (codebase analysis -- HIGH confidence):**

- `services/ats-service/src/v2/jobs/` -- Job service, repository, routes, types
- `services/ats-service/src/v2/applications/` -- Application service, repository, routes, types
- `services/ats-service/src/v2/candidates/` -- Candidate service with resume management
- `services/ai-service/src/v2/reviews/` -- AI review service with fit analysis
- `services/document-service/src/v2/documents/` -- Document storage and metadata
- `services/search-service/src/v2/search/` -- Search service with typeahead
- `services/api-gateway/src/auth.ts` -- Clerk multi-app authentication
- `services/api-gateway/src/middleware/auth.ts` -- Auth middleware patterns
- `packages/shared-access-context/` -- resolveAccessContext for RBAC
- `packages/shared-types/` -- Shared type definitions
- `docs/gpt/` -- Existing GPT documentation (PRD, architecture, tech spec, OpenAPI starter, instructions template)
- `.planning/PROJECT.md` -- v5.0 milestone context and constraints

**TRAINING KNOWLEDGE (MEDIUM confidence -- could not verify with WebSearch/WebFetch):**

- OpenAI GPT Actions OAuth2 flow specifics
- OpenAPI 3.0.1 vs 3.1 strictness
- `x-openai-isConsequential` extension behavior
- GPT Actions file upload capabilities
- GPT Store listing requirements
- Practical limits on action count and response size
- OAuth callback URL format

**GAPS (need verification before implementation):**

- Current GPT Actions API documentation (may have changed since training cutoff)
- Exact OAuth callback URL format OpenAI expects
- Whether GPT Actions now support file uploads natively
- Whether OpenAPI 3.1 is now accepted
- Latest rate limiting best practices from OpenAI
- GPT Store review criteria for consequential actions
