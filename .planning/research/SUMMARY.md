# Project Research Summary

**Project:** v10.0 Video Platform & Recruiting Calls
**Domain:** Generalizing interview-only video infrastructure to a multi-purpose recruiting call platform
**Researched:** 2026-03-08
**Confidence:** HIGH

## Executive Summary

v10.0 generalizes the stable v9.0 video interview system into a platform that supports multiple call types -- starting with recruiter-to-company calls. The existing infrastructure (LiveKit, recording, transcription, AI summarization, shared-video component library) is production-proven and reusable. No new external libraries are needed. The work is a data model evolution, a new thin Next.js app (`apps/video/`), and careful refactoring of interview-coupled code -- not a technology bet.

The recommended approach is: create a new `calls` table alongside the existing `interviews` table, build a dedicated video app served from two subdomains (`video.splits.network` and `video.applicant.network`), and use magic-link-only authentication in the video app to sidestep all Clerk cross-domain complexity. The existing interview flow continues working unchanged throughout. New call types use the new `calls` table and new `/api/v2/calls/` routes. This parallel-table strategy avoids a risky big-bang migration while delivering the generalized platform.

The primary risks are: (1) the deep coupling of `application_id` throughout video-service and ai-service, which means every function that resolves call context must be audited and potentially made polymorphic, (2) cross-subdomain authentication confusion if Clerk cookies do not share across `*.splits.network`, and (3) scope creep once a dedicated video app exists and stakeholders see a blank canvas. All three are manageable with the phased approach outlined below.

## Key Findings

### Recommended Stack

No new libraries are needed. The video app (`apps/video/`) is a standard Next.js 16 app using the same dependency versions as portal and candidate. It imports `shared-video`, `shared-api-client`, `shared-types`, `shared-ui`, and `basel-ui` from the monorepo. The backend changes are entirely within the existing `video-service` (Fastify + LiveKit SDK + Supabase + RabbitMQ) and `ai-service`.

**Core technologies (all existing):**
- **Next.js 16 + React 19:** New `apps/video/` app, identical stack to other apps
- **LiveKit (client + server SDK):** Already handles rooms, tokens, recording, egress -- no changes
- **shared-video package:** VideoLobby, VideoRoom, VideoControls, NotesPanel -- reused directly
- **Supabase Postgres:** New `calls` table + supporting tables via migration
- **RabbitMQ:** New `call.*` events alongside existing `interview.*` events

**What NOT to add:**
- No Clerk in the video app (magic-link-only auth eliminates cross-domain cookie issues)
- No separate API gateway (video app calls existing `api.splits.network`)
- No WebSocket library (LiveKit provides the real-time layer)
- No `@tanstack/react-query` (video app fetches context once, then is purely real-time)

See: `.planning/research/STACK.md` for full dependency tables and version pinning.

### Expected Features

**Must have (table stakes -- P0/P1):**
- **TS-02: Generalized Call Entity** -- New `calls` table with polymorphic entity linking (P0, critical path)
- **TS-01: Recruiter-to-Company Video Calls** -- New call type for recruiter + company contact discussions
- **TS-04: Scheduling for Recruiting Calls** -- Extend existing SchedulingService to non-interview calls
- **TS-07: Call Notifications** -- Email templates for call scheduling, reminders, cancellation
- **TS-03: Entity-Linked AI Summaries** -- Route summaries to jobs/companies instead of only applications
- **TS-05: Dedicated Video App** -- Clean `window.open()` experience at `video.splits.network`
- **TS-06: Call History** -- List/filter all calls (interviews + recruiting calls) in portal

**Should have (differentiators -- P2):**
- **DF-01: Multi-Brand Video** -- Candidates join on `video.applicant.network` with neutral branding
- **DF-02: Contextual AI Summaries** -- Entity-aware prompts that tailor output per call type
- **DF-04: In-Call Context Panel** -- Show job/company/candidate data alongside notes during calls

**Defer to post-v10.0 (P3):**
- **DF-05: Quick Call (instant/unscheduled)** -- Requires real-time notification infrastructure
- **DF-03: Call-to-Entity Smart Linking** -- AI-suggested entity tagging, high complexity
- **DF-06: Recording Highlights/Clips** -- Significant AI pipeline extension

**Anti-features (do NOT build):**
- Separate backend service per call type (fragments video infrastructure)
- Real-time collaborative document editing in calls (own product category)
- Video voicemail / async video messages (anti-pattern candidates dislike)
- Custom branding per company (massive UI/testing complexity for little value)
- Video analytics dashboard (no data volume yet to make it meaningful)
- Built-in virtual backgrounds (OS-level solutions are better)

See: `.planning/research/FEATURES-video-platform.md` for full feature analysis and dependency graph.

### Architecture Approach

The architecture adds a parallel `calls` data layer and a new thin frontend app without disrupting the existing interview system. The `calls` table uses polymorphic entity linking (`entity_type` + `entity_id`) rather than multiple nullable FKs, supporting future entity types without schema changes. The video-service gains a new `calls/` module alongside the existing `interviews/` module, with shared LiveKit and recording utilities extracted into a `shared/` directory. The video app detects brand via HTTP Host header and themes accordingly.

**Data model resolution:** STACK.md initially recommended adding `call_type` to the existing `interviews` table (making `application_id` nullable). ARCHITECTURE.md and FEATURES.md recommend a new `calls` table. **The new table approach is the correct choice** because: (1) making `application_id` nullable would break 15+ existing queries that assume it is present, (2) interview-specific columns (round_name, interview_type enum, reschedule logic) do not apply to other call types, (3) a parallel table lets existing interview code remain completely untouched, and (4) it follows the project's nano-service philosophy of clean separation. The STACK.md recommendation to modify `interviews` is rejected.

**Major components:**
1. **`calls` + `call_participants` + `call_access_tokens` tables** -- New data layer with polymorphic entity linking (`entity_type` + `entity_id`)
2. **`apps/video/`** -- Dedicated Next.js 16 app, two subdomains, magic-link-only auth, brand-aware theming via Host header
3. **`video-service/src/v2/calls/`** -- New module for call CRUD, token generation, lifecycle management
4. **`video-service/src/v2/shared/`** -- Extracted LiveKit JWT generation and recording logic (entity-agnostic)
5. **AI pipeline call-type dispatcher** -- Routes to interview vs. meeting summarization strategies with per-type prompts
6. **Portal integration** -- "Schedule Call" buttons on company/job pages, call history list, `window.open()` to video app

See: `.planning/research/ARCHITECTURE.md` for data model SQL, component diagrams, and migration bridge strategy.

### Critical Pitfalls

1. **`application_id` hard-coupling (Critical)** -- 20+ references across video-service and ai-service assume `application_id` exists and use it to resolve job/company context. Every function must be audited. Prevention: new `calls` table sidesteps this entirely; build polymorphic `CallContextResolver` that dispatches by call type for shared utilities.

2. **Big-bang rename refactoring (Critical)** -- Renaming `interviews` to `calls` across the codebase would touch 20+ files, break sent email links, break API consumers, and destroy git blame. Prevention: keep `interviews` table and routes as-is; add `calls` as a parallel system; redirect old URLs with 301/308.

3. **Cross-subdomain auth confusion (Critical)** -- Clerk cookies are domain-scoped. Portal user clicks "Join Call" and lands on `video.splits.network` without a session. Prevention: video app uses magic-link-only auth (no Clerk). Portal generates a short-lived token, redirects to video app, video app exchanges token for LiveKit JWT.

4. **AI pipeline assumes interview data shape (Critical)** -- Transcription prompts reference "candidate" and "interview," summary posts to `application_notes`. Non-interview calls would crash or produce nonsensical output. Prevention: per-call-type summarizer strategies; disable recording on new call types until AI pipeline is updated.

5. **Recording access control breaks (Critical)** -- Access verification traces `application -> job -> company -> membership`. No application means 500 errors or security holes. Prevention: polymorphic `hasRecordingAccess()` dispatcher; default to participants-only for new call types.

6. **Feature creep (Moderate)** -- A dedicated video app invites stakeholders to request virtual backgrounds, breakout rooms, chat, file sharing. Prevention: hard scope boundary -- v10.0 delivers generalized call types and feature parity with v9.0 interviews. One new call type. No new video features. Cap at ~20 plans.

See: `.planning/research/PITFALLS-video-platform.md` for all 13 pitfalls with detection criteria and phase warnings.

## Implications for Roadmap

Based on the dependency graph from FEATURES, the build order from ARCHITECTURE, and the phase warnings from PITFALLS, here is the recommended phase structure.

### Phase 1: Data Model & Service Foundation
**Rationale:** Everything depends on the generalized call entity (TS-02 is P0 critical path). Must land first.
**Delivers:** `calls`, `call_participants`, `call_access_tokens` tables via migration. New `calls/` module in video-service with CRUD routes. Shared LiveKit/recording utilities extracted from interview code into `shared/`. `/api/v2/calls` proxy routes in api-gateway with appropriate auth bypass patterns.
**Addresses:** TS-02 (Generalized Call Entity)
**Avoids:** Pitfall 1 (application_id coupling -- sidesteps entirely with new table), Pitfall 10 (migration risk -- additive only, no existing table changes), Pitfall 2 (rename everything -- keeps interviews untouched)

### Phase 2: Video App Shell & Infrastructure
**Rationale:** The dedicated video app is the delivery vehicle for all call types. Must exist before portal/candidate integration.
**Delivers:** `apps/video/` scaffolded with brand detection via Host header, full-screen layout, both auth paths (portal token exchange + magic link). K8s deployment, ingress rules for `video.splits.network` and `video.applicant.network`, TLS certificates via cert-manager. Port 3104 in dev.
**Addresses:** TS-05 (Dedicated Video App), DF-01 (Multi-Brand -- infrastructure only)
**Avoids:** Pitfall 3 (cross-subdomain auth -- magic-link-only approach eliminates the problem entirely)

### Phase 3: Recruiter-Company Calls
**Rationale:** The first new call type. Exercises the entire generalized pipeline: creation, scheduling, notifications, video, notes.
**Delivers:** Recruiter-to-company call creation from portal UI, scheduling with calendar integration via existing SchedulingService, call notification emails (new templates, not modifying interview ones), in-call experience via video app, post-call notes linked to jobs/companies via polymorphic entity linking.
**Addresses:** TS-01 (Recruiter-Company Calls), TS-04 (Scheduling), TS-07 (Notifications)
**Avoids:** Pitfall 6 (notification templates -- new templates from scratch), Pitfall 9 (feature creep -- one call type only)

### Phase 4: shared-video Generalization & Portal Integration
**Rationale:** Now that both call types work, generalize the shared-video types and wire up portal UI for managing all calls.
**Delivers:** `CallContext` type alongside `InterviewContext` (backward-compatible alias), updated hooks (`useCallToken` alongside `useInterviewToken`), "Schedule Call" buttons on company/job detail pages, call history list view in portal with filtering by type/date/company, `window.open()` flow from portal to video app.
**Addresses:** TS-06 (Call History), shared-video backward-compatible type evolution
**Avoids:** Pitfall 7 (interview-centric types -- union types with call_type discriminator, not making everything optional), Pitfall 8 (auth bypass rules -- duplicate patterns for new `/api/v2/calls/` routes)

### Phase 5: AI Pipeline Generalization
**Rationale:** Recording and transcription for new call types. Requires per-call-type summarizer strategies. Deferred until basic calls work because recording can be safely disabled for new call types initially.
**Delivers:** Call-type-aware AI pipeline dispatcher, meeting-focused summarization prompt (distinct from interview prompt), entity-linked summary storage (job notes, company notes -- not just application_notes), polymorphic recording access control for non-interview calls.
**Addresses:** TS-03 (Entity-Linked AI Summaries), DF-02 (Contextual AI Summaries)
**Avoids:** Pitfall 4 (interview-shaped AI prompts -- separate strategies per call type), Pitfall 5 (recording access control -- polymorphic hasRecordingAccess())

### Phase 6: Candidate Migration & Polish
**Rationale:** Move candidate interview experience to the video app. This is the riskiest change to existing users (redirecting live magic links) and benefits from all prior phases being stable.
**Delivers:** Magic link emails point to `video.applicant.network` instead of candidate app, candidate app interview routes redirect with 301/308 (token forwarded), DF-04 (In-Call Context Panel) with entity data alongside notes, removal of interview pages from portal/candidate apps.
**Addresses:** DF-01 (Multi-Brand -- candidate-facing completion), DF-04 (In-Call Context Panel)
**Avoids:** Pitfall 13 (bookmark/redirect breakage -- permanent redirects with token forwarding, old URLs work indefinitely)

### Phase Ordering Rationale

- **Data model first** because every other phase depends on the `calls` table existing. This is the critical path identified in the FEATURES dependency graph.
- **Video app before recruiter-company calls** because calls need a place to render. The app is the delivery vehicle.
- **Recruiter-company calls before shared-video generalization** because building the new call type reveals exactly which types and hooks need generalizing. Design follows usage, not speculation.
- **AI pipeline after basic calls work** because recording can be disabled for new call types initially (safe default per Pitfall 4 prevention), and the pipeline changes are complex enough to warrant their own phase.
- **Candidate migration last** because it is the riskiest change to existing users (redirecting live magic links) and benefits from all prior phases being stable.
- **Total estimated scope: ~18-22 plans across 6 phases.** This stays within the Pitfall 9 boundary of ~20 plans.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 1 (Data Model):** The polymorphic entity linking pattern (`entity_type` + `entity_id`) needs validation against query patterns. How will call listing queries efficiently join to entity tables for display names? Index strategy needs attention.
- **Phase 2 (Video App):** If requirements change to need Clerk auth in the video app (instead of magic-link-only), cross-subdomain Clerk session behavior needs hands-on testing with wildcard cookie domains.
- **Phase 5 (AI Pipeline):** Per-call-type prompt engineering needs iteration. The "meeting summary" prompt does not exist yet and will require tuning against real call transcripts.

**Phases with standard patterns (skip deep research):**
- **Phase 3 (Recruiter-Company Calls):** Follows existing interview creation/scheduling patterns exactly. Well-documented in codebase.
- **Phase 4 (Portal Integration):** Standard list views, buttons, and `window.open()`. Established UI patterns with StandardListParams/StandardListResponse.
- **Phase 6 (Candidate Migration):** Redirect patterns are straightforward. The risk is operational (already-sent emails), not technical.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero new libraries. All versions verified against existing package.json files in the monorepo. |
| Features | HIGH | Built on direct codebase analysis of v9.0 + domain knowledge of recruiting workflows. Feature dependency graph is clear and validated against code coupling points. |
| Architecture | HIGH | New `calls` table approach validated against all existing schema, routes, and service code. Migration bridge strategy avoids touching existing interview system. |
| Pitfalls | HIGH | Every pitfall traces to specific code locations with line-level references. The `application_id` coupling audit identified 20+ references exhaustively. |

**Overall confidence:** HIGH

### Gaps to Address

- **Polymorphic entity query performance:** The `entity_type` + `entity_id` pattern does not use database-level FK enforcement. Query patterns for "all calls for company X" need an index strategy. The composite index proposed in ARCHITECTURE.md is likely sufficient, but should be validated with realistic data volumes during Phase 1.
- **Call series / recurring calls:** FEATURES mentions recurring recruiter-company calls (weekly pipeline reviews). The data model does not yet include a recurrence mechanism. Decide during Phase 3 planning whether to defer or include.
- **Host header behind nginx ingress:** STACK.md flags MEDIUM confidence on whether `headers().get('host')` in Next.js server components returns the correct value behind the K8s nginx ingress controller. Should be verified in staging during Phase 2 before relying on it for brand detection.
- **Clerk fallback path:** If the magic-link-only approach for the video app is later rejected and Clerk auth is required, the wildcard cookie domain setup (`*.splits.network`) needs testing. Not researched because the strong recommendation is to avoid Clerk in the video app entirely.
- **Summary storage for non-interview calls:** Where do meeting summaries live? FEATURES suggests a polymorphic `entity_type` + `entity_id` pattern on a new `call_summaries` table. ARCHITECTURE suggests extending the existing notes infrastructure. Needs resolution during Phase 5 planning.

## Sources

### Primary (HIGH confidence -- direct codebase analysis)
- `services/video-service/src/v2/` -- all interview routes, services, repository, types, recording, tokens
- `services/ai-service/src/v2/transcription/` -- AI pipeline, summarizer, consumer
- `services/api-gateway/src/index.ts` -- auth bypass patterns (10 regex rules), proxy routes
- `packages/shared-video/src/` -- components, hooks, types, exports
- `apps/portal/src/app/portal/interview/` -- portal interview client implementation
- `apps/candidate/src/app/(public)/interview/` -- candidate magic link interview client
- `supabase/migrations/` -- 5 interview-related migrations (schema source of truth)
- `infra/k8s/ingress.yaml` -- production ingress with 8+ domains, TLS cert pattern
- `.planning/v9.0-MILESTONE-AUDIT.md` -- v9.0 audit results (33 requirements, all satisfied, 4 bugs found and fixed)

### Secondary (MEDIUM confidence -- domain knowledge)
- Recruiting platform video patterns (Greenhouse, Lever, BreezyHR integration approaches)
- Dedicated video app UX patterns (Zoom, Google Meet, Teams window management)
- Multi-brand/white-label SaaS deployment patterns
- Business video call workflows in recruiting context (intake calls, pipeline reviews, strategy calls)

---
*Research completed: 2026-03-08*
*Ready for roadmap: yes*
