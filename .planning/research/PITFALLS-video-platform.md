# Domain Pitfalls: Generalizing Video Interviews to Multi-Purpose Video Platform

**Domain:** Extending a stable, interview-specific video system to support multiple call types
**Researched:** 2026-03-08
**Context:** v9.0 shipped 44 plans across 9 phases. 3 audit rounds found and fixed 4 bugs. System is stable. Now generalizing for recruiter-company calls and a dedicated video app.

---

## Critical Pitfalls

Mistakes that cause regressions, data loss, or require rewrites.

### Pitfall 1: Hardcoded `application_id` as the Universal FK

**What goes wrong:** The entire data model uses `application_id` as the mandatory foreign key on the `interviews` table. Every context query traces `interview -> application -> job -> company`. Recruiter-company calls have no application -- they are about a job or a business relationship, not a candidate. If you try to shoehorn a fake application_id or make it nullable without updating every downstream consumer, you break the context chain.

**Why it happens:** The system was correctly built interview-first. The `application_id` is used in:
- `InterviewRepository.findByApplicationId()` (listing)
- `InterviewRepository.findByIdWithContext()` (job/company resolution via application -> job -> company)
- `InterviewService.createInterview()` (validates application exists, resolves candidate from application)
- `TranscriptionRepository.getInterviewWithContext()` (job context for AI summaries)
- `TranscriptionRepository.postSummaryNote()` (posts summary to application_notes)
- `InterviewRepository.postNotesToApplication()` (interview notes -> application notes)
- `InterviewRepository.isCompanyAdminForInterview()` (access control via application -> job -> company)
- Recording access control in `recording-routes.ts` (verifies company admin via application)
- All event payloads include `application_id`
- API routes require `application_id` as a query parameter for listing

**Consequences:** Making `application_id` nullable is the easy part. The hard part is that 15+ functions assume it exists and use it to resolve context. If any single function is missed, you get null reference errors in production for non-interview calls.

**Prevention:**
1. Introduce a polymorphic context model: a `call_type` column (enum: `interview`, `recruiter_call`, etc.) alongside an optional `context_entity_id` + `context_entity_type` pair
2. Create a `CallContextResolver` that dispatches to different context-resolution strategies based on call type
3. Audit EVERY function that touches `application_id` before migrating -- the list above is exhaustive based on current code
4. Write the migration to keep `application_id` for existing rows (NOT NULL for interview type) while allowing NULL for new types
5. Add a CHECK constraint: `(call_type = 'interview' AND application_id IS NOT NULL) OR (call_type != 'interview')`

**Detection:** Search for `application_id` in video-service and ai-service. Current count: 20+ references across repository, service, routes, and recording modules.

**Which phase should address it:** First phase -- data model generalization. Everything else builds on this.

---

### Pitfall 2: Breaking Interview Flows During "Rename Everything" Refactoring

**What goes wrong:** The instinct is to rename `interviews` table to `calls` or `video_sessions`, rename `InterviewRepository` to `CallRepository`, rename all types, routes, etc. This creates a massive, risky changeset that touches every layer simultaneously. Meanwhile, existing interview links, bookmarked URLs, email links with `/interview/[id]` paths, and API consumers all break.

**Why it happens:** Clean naming feels important. "We're generalizing, so names should be general." But the v9.0 system has:
- `POST /api/v2/interviews/*` routes (20+ endpoints in api-gateway)
- `InterviewContext`, `InterviewWithParticipants`, `InterviewWithContext`, `InterviewWithFullContext` types in shared-video package
- `useInterviewToken`, `useInterviewNotes`, `useRecordingState` hooks
- `interview-client.tsx` in both portal and candidate apps
- API gateway auth bypass rules matching `/api/v2/interviews/` patterns (10 regex patterns)
- LiveKit room names prefixed with `interview-`
- Recording storage paths: `recordings/${interviewId}/`
- Email templates referencing "interview" language
- Notification job: `send-interview-reminders`
- RabbitMQ events: `interview.created`, `interview.cancelled`, `interview.recording_ready`

**Consequences:** A big-bang rename creates:
- Broken links in already-sent emails (magic link URLs with interview paths)
- API versioning headaches (old clients calling old paths)
- Git blame becomes useless for the entire video stack
- Merge conflicts if any hotfixes are needed during the rename
- Risk of missing one reference and getting a runtime error

**Prevention:**
1. DO NOT rename the `interviews` database table. Add a `call_type` column and keep the table name. The table name is an implementation detail, not a user-facing concept.
2. Keep all existing API routes as-is. Add new routes for the new call types (e.g., `/api/v2/calls/*` for the generalized API)
3. If you must create generalized code, build a new layer that wraps the existing one rather than renaming the existing one
4. Old URLs (`/interview/[id]`) should redirect to new video app with a 301
5. Create adapter types: `type CallSession = Interview` (alias, not new type) during transition

**Detection:** If a PR touches more than 20 files and most changes are renames, it is this pitfall.

**Which phase should address it:** Plan the naming strategy in the data model phase. Execute as incremental additive changes, never a bulk rename.

---

### Pitfall 3: Dual-Subdomain App with Shared Auth State Confusion

**What goes wrong:** The new video app serves two subdomains (e.g., `interview.splits.network` and `call.splits.network`) from one Next.js codebase. Clerk auth is configured per-domain, and auth state (cookies, tokens) does not automatically share across subdomains. Magic link auth (for candidates) and Clerk auth (for authenticated users) already coexist in the current system, but adding a second subdomain creates edge cases: a user authenticated on `portal.splits.network` clicks a link to `interview.splits.network` and gets a login prompt because Clerk's session cookie is domain-scoped.

**Why it happens:** Clerk session cookies are typically set on the exact domain, not a wildcard. The current system avoids this because interview pages live inside the portal and candidate apps (same domain). Moving them to a separate domain breaks the implicit session sharing.

**Consequences:**
- Authenticated recruiters get prompted to log in again when joining their own interview
- "Join interview" buttons in portal stop working seamlessly
- Double-auth flows frustrate users
- Session cookie conflicts if wildcard domain is misconfigured

**Prevention:**
1. Configure Clerk with a wildcard cookie domain (`*.splits.network`) so sessions persist across subdomains
2. Verify this works in development (localhost subdomains are tricky -- may need `lvh.me` or similar)
3. For the transition period, make the video app accept a `token` query parameter as an alternative to cookie-based auth (similar to existing magic link flow)
4. Test the full flow: portal -> click "Join" -> lands on video app subdomain -> already authenticated
5. Keep the magic link flow unchanged for candidates (they never use Clerk)

**Detection:** Test cross-subdomain navigation manually before going to production. If `getAuth()` returns null on the video app when the user is logged into the portal, this pitfall has hit.

**Which phase should address it:** Early phase -- app scaffolding and auth configuration. Must be verified before building any UI in the new app.

---

### Pitfall 4: AI Pipeline Assumes Interview-Shaped Data

**What goes wrong:** The transcription and summary pipeline in `ai-service` is hardwired to interview semantics. The `TranscriptionRepository.getInterviewWithContext()` method resolves job context via `application -> job`. The `SummaryService.generateSummary()` prompt says "You are summarizing a video interview transcript for a recruiter" and structures output around "candidate responses to job requirements." For a recruiter-company call about filling a position, this prompt makes no sense.

**Why it happens:** The AI pipeline was built specifically for interviews (Phase 37). The prompt engineering, context resolution, and output posting are all interview-specific.

**Specific hardcoded assumptions:**
- Repository: `getInterviewWithContext()` traverses application -> job -> company
- Summarizer prompt: "The candidate interviewed for the role: ${jobTitle}"
- Summary sections: "Key Discussion Points", "Strengths", "Concerns" (candidate evaluation framing)
- Output: `postSummaryNote()` inserts into `application_notes` table with `note_type: 'interview_summary'`
- Consumer: `domain-consumer.ts` listens for `interview.recording_ready` event

**Consequences:** If you enable recording on recruiter-company calls without updating the AI pipeline:
- Context resolution crashes (no application_id -> no job context)
- If it somehow gets a transcript, the summary prompt produces nonsensical output
- Summary tries to post to `application_notes` but there is no application
- The summary reads like a candidate evaluation when it should be a business call summary

**Prevention:**
1. Create call-type-specific summary strategies: `InterviewSummarizer`, `RecruiterCallSummarizer`
2. Each strategy provides its own context resolution, prompt template, and output destination
3. The pipeline dispatcher checks `call_type` and routes to the correct strategy
4. For recruiter-company calls, summaries might post to a `call_notes` table or to the job's activity feed instead of `application_notes`
5. Do NOT try to make one prompt handle all call types -- the framing is fundamentally different

**Detection:** If the summary prompt still contains "candidate" or "interview" language when processing a non-interview call, this pitfall has been triggered.

**Which phase should address it:** After data model generalization but before enabling recording on new call types. Can be deferred if recording is initially disabled for non-interview calls (safe default).

---

### Pitfall 5: Recording Access Control Breaks for Non-Interview Calls

**What goes wrong:** Recording access control currently uses a chain: participant check OR company admin check. The company admin check traces `application -> job -> company -> company_members`. For non-interview calls, there is no application, so this chain breaks. Recordings become either inaccessible (if the function throws) or unprotected (if the function is bypassed).

**Why it happens:** The `verifyRecordingAccess()` function in `recording-routes.ts` and `isCompanyAdminForInterview()` in the repository are both interview-specific:

```typescript
async isCompanyAdminForInterview(applicationId: string, userId: string): Promise<boolean> {
    // application -> job -> company -> check membership
}
```

**Consequences:**
- If left unchanged: recordings of recruiter-company calls return 500 errors when anyone tries to play them
- If naively "fixed" by removing the company admin check: security hole where anyone could access recordings
- If the function silently returns false for missing applications: only direct participants can view recordings, locking out managers and admins who should have access

**Prevention:**
1. Replace `isCompanyAdminForInterview()` with a polymorphic `hasRecordingAccess()` that dispatches based on call type
2. For interview calls: keep existing application -> job -> company chain
3. For recruiter-company calls: define who has access (both parties + firm admins?)
4. Add integration tests for recording access with each call type
5. Default to restrictive access (participants only) for new call types until access rules are fully defined

**Detection:** Try to play a recording for a non-interview call as a non-participant. If it 500s or returns "not found," this pitfall has been hit.

**Which phase should address it:** Same phase as recording generalization. Must be designed before recordings are enabled for new call types.

---

## Moderate Pitfalls

Mistakes that cause delays, regressions, or tech debt.

### Pitfall 6: Notification System Assumes Interview Context

**What goes wrong:** The notification service has interview-specific email templates (`interviewer-emails.ts`, `candidate-emails.ts`, `reminder-emails.ts`) and a scheduled job (`send-interview-reminders`). These templates reference "interview," "candidate," "job title," and "company name." For recruiter-company calls, the notification should say "call" not "interview" and the context is different (no candidate, different relationship).

**Prevention:**
1. Create a notification template strategy per call type
2. Share layout/styling but use different copy
3. The reminder job should query all upcoming calls, not just interviews
4. Add a `call_type` filter to the reminder query so the correct template is used

**Which phase should address it:** When adding notifications for new call types. Can be deferred by initially not sending notifications for non-interview calls.

---

### Pitfall 7: Shared-Video Package Types Are Interview-Centric

**What goes wrong:** The `shared-video` package exports `InterviewContext`, `TokenResult`, `useInterviewToken`, `useInterviewNotes` -- all named and typed around interviews. The `InterviewContext` type includes `interview_type` (screening, technical, etc.) and `job` (id, title, company_name). These fields do not apply to recruiter-company calls. If you force-fit the new call type into `InterviewContext`, you end up with `job: { id: '', title: '', company_name: '' }` for non-interview calls, which looks broken in the UI.

**Prevention:**
1. Create a generalized `CallContext` type that is a union or superset
2. The `job` field becomes optional or lives in a `context` discriminated union
3. Add type aliases: `type InterviewContext = CallContext & { call_type: 'interview'; job: ... }`
4. UI components should conditionally render based on `call_type` -- show job info for interviews, show call purpose/agenda for other types
5. Do NOT just make every field optional and check for null everywhere -- that leads to "null city" UI code

**Which phase should address it:** During shared-video package generalization, before building new call type UI.

---

### Pitfall 8: API Gateway Auth Bypass Rules Are Pattern-Matched to Interview Paths

**What goes wrong:** The API gateway has 10 regex patterns in `index.ts` that bypass Clerk auth for specific interview routes (magic link join, recording webhook, consent, notes with magic link, etc.). If new call-type routes use different URL patterns, the auth bypass rules need updating. If they use the same `/api/v2/interviews/` prefix (to avoid a rewrite), the rules work but the naming is misleading.

**Specific patterns currently bypassed:**
- `POST /api/v2/interviews/join`
- `POST /api/v2/interviews/recording/webhook`
- `POST /api/v2/interviews/:id/reschedule-request`
- `GET /api/v2/interviews/:id/available-slots`
- `POST /api/v2/interviews/:id/recording/consent`
- `PUT|GET /api/v2/interviews/:id/notes`

**Prevention:**
1. If adding new routes under a `/api/v2/calls/` prefix, duplicate the auth bypass patterns for call-specific routes that also use magic links
2. Better: keep video-related routes under the existing `/api/v2/interviews/` prefix and add `/api/v2/calls/` only for truly new endpoints
3. Document which routes are auth-bypassed and why in a comment block (already partially done)

**Which phase should address it:** During API route planning, before implementing new routes.

---

### Pitfall 9: Feature Creep -- "While We're Building a Video App..."

**What goes wrong:** The scope is "generalize interviews to multi-purpose calls and move to a dedicated app." But once a dedicated video app exists, feature requests pile up: screen recording, virtual backgrounds, breakout rooms, waiting rooms, chat integration, file sharing during calls, multi-party calls beyond 2 people, call scheduling from the video app directly, etc.

**Why it happens:** A dedicated video app creates an expectation of a "complete" video product. Stakeholders see the blank canvas and fill it with features.

**Consequences:** The milestone balloons from a reasonable scope to 40+ plans (a repeat of v9.0's scope). The generalization -- the actual goal -- gets delayed by feature work.

**Prevention:**
1. Define a hard scope boundary: "v10.0 delivers generalized call types and a dedicated video app. Feature parity with v9.0 interviews. One new call type (recruiter-company). No new video features."
2. Create a "v11.0 Video Features" parking lot for feature requests
3. The video app should initially be a thin shell that renders the same `shared-video` components -- not a platform for new features
4. Measure success by: "Can a recruiter schedule and conduct a call with a company contact?" not by feature count

**Detection:** If the roadmap has more than 20 plans, scope has crept.

**Which phase should address it:** Roadmap creation. Enforce scope boundaries during planning.

---

### Pitfall 10: Migration Breaks Existing Data

**What goes wrong:** Adding columns like `call_type` with a default value is safe. But if the migration also restructures tables (e.g., moving `application_id` to a junction table, or splitting `interviews` into `calls` + `interview_details`), existing data must be migrated. With production data, this is risky: long-running migrations can lock tables, incorrect data transforms can corrupt records, and rollback is difficult.

**Prevention:**
1. Prefer additive migrations: add `call_type` column with default `'interview'`, add nullable `context_entity_id` and `context_entity_type` columns
2. Do NOT rename or restructure existing columns in the first migration
3. Backfill new columns in a separate migration that runs after the schema change
4. Test migrations against a copy of production data, not just empty tables
5. Keep the `application_id` column as-is (even if redundant for new call types) rather than removing it

**Which phase should address it:** Data model phase. Use the project's existing migration patterns (additive ALTER TABLE statements, as seen in the 5 existing interview migrations).

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 11: LiveKit Room Name Prefix Hardcoded

**What goes wrong:** Room names are generated as `interview-${crypto.randomUUID()}`. For non-interview calls, this prefix is misleading in LiveKit dashboards and logs. Minor, but makes debugging harder.

**Prevention:** Use `call-${crypto.randomUUID()}` or `${callType}-${crypto.randomUUID()}` for new call types. Keep existing interview room names unchanged.

**Which phase should address it:** During call creation service implementation.

---

### Pitfall 12: Recording Storage Path Assumes Interview Structure

**What goes wrong:** Recording files are stored at `recordings/${interviewId}/${interviewId}.mp4`. This works for any call type (it is just an ID), but the path is under a flat `recordings/` prefix. If you want to organize by call type later, you need to migrate files.

**Prevention:** Use `recordings/${callType}/${callId}/${callId}.mp4` for new calls. Leave existing recordings in place. The signed URL generation is path-based, so existing URLs continue to work.

**Which phase should address it:** When implementing recording for new call types.

---

### Pitfall 13: Candidate App Redirect Could Break Bookmarks

**What goes wrong:** Candidates access interviews via magic link URLs like `candidate.splits.network/interview/[token]`. When the interview UI moves to the video app, these URLs need to redirect. If the redirect is not implemented or is implemented incorrectly (302 instead of 301, wrong destination URL, token not forwarded), candidates get a 404 or lose their auth token.

**Prevention:**
1. Add a permanent redirect (308 to preserve POST method, or 301 for GET) in the candidate app
2. Forward the magic token in the redirect URL
3. Keep the redirect in place indefinitely -- magic link emails already sent cannot be updated
4. Test with an actual magic link token to verify end-to-end flow

**Which phase should address it:** When deploying the new video app and removing interview UI from portal/candidate apps.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Data model generalization | Pitfall 1 (application_id FK), Pitfall 10 (migration risk) | Additive migration, polymorphic context resolver, audit all application_id references |
| New video app scaffolding | Pitfall 3 (cross-subdomain auth), Pitfall 13 (redirects) | Wildcard cookie domain, test cross-domain auth, implement redirects early |
| API route generalization | Pitfall 2 (rename everything), Pitfall 8 (auth bypass) | Additive routes, keep existing paths, duplicate auth bypass patterns |
| Shared-video package updates | Pitfall 7 (interview-centric types) | Union types with call_type discriminator, conditional rendering |
| Recording for new call types | Pitfall 5 (access control), Pitfall 12 (storage paths) | Polymorphic access check, type-prefixed storage paths |
| AI pipeline generalization | Pitfall 4 (interview-shaped prompts) | Per-call-type summary strategies, defer recording on new types until ready |
| Notifications | Pitfall 6 (interview templates) | Template strategy per call type, defer initially |
| Scope management | Pitfall 9 (feature creep) | Hard scope boundary, parking lot for future features |

## Sources

- Direct codebase analysis of:
  - `services/video-service/src/v2/interviews/` (repository, service, types, routes, recording, token, webhook)
  - `services/ai-service/src/v2/transcription/` (repository, summarizer)
  - `services/api-gateway/src/index.ts` (auth bypass patterns)
  - `services/notification-service/src/templates/interviews/` (email templates)
  - `packages/shared-video/src/` (types, hooks, components, index)
  - `apps/portal/src/app/portal/interview/` (interview client)
  - `apps/candidate/src/app/(public)/interview/` (candidate interview client)
  - `supabase/migrations/` (5 interview-related migrations)
  - `.planning/v9.0-MILESTONE-AUDIT.md` (audit results)
