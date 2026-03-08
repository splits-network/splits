# Feature Landscape: v10.0 Video Platform & Recruiting Calls

**Domain:** Generalizing video from interview-only to platform-wide recruiting calls
**Researched:** 2026-03-08
**Confidence:** HIGH (building on proven v9.0 foundation; patterns well-understood from codebase analysis)

## Context: What v9.0 Already Built

Before defining v10.0 features, here is what exists and works today:

| Capability | Implementation | Location |
|-----------|---------------|----------|
| 1:1 and panel video calls | LiveKit + `shared-video` package | `packages/shared-video/`, `apps/portal/src/app/portal/interview/` |
| Pre-join lobby with device check | `VideoLobby` component | `packages/shared-video/src/components/video-lobby.tsx` |
| Screen sharing, mute, camera, connection quality | `VideoRoom`, `VideoControls` | `packages/shared-video/src/components/` |
| Interview scheduling with Google Calendar | `SchedulingService`, scheduling routes | `services/video-service/src/v2/interviews/scheduling-service.ts` |
| Magic link join for candidates | Token-based auth, dual-auth pattern | `services/video-service/src/v2/interviews/token-service.ts` |
| Server-side recording with consent | `RecordingService` with LiveKit Egress to S3 | `services/video-service/src/v2/interviews/recording-service.ts` |
| AI transcription (Whisper) and summarization (GPT) | AI pipeline via RabbitMQ events | `services/ai-service/` |
| AI summary auto-posted as application notes | Event-driven post to `application_notes` | Phase 37 |
| In-call notes panel with auto-save | `NotesPanel` with `MarkdownEditor` | `packages/shared-video/src/components/notes-panel.tsx` |
| Interviews tab on application detail | Phase 38 UI | `apps/portal/` |

**Key observation:** Everything in v9.0 is tightly coupled to the `Interview` entity and `application_id`. Types like `InterviewContext`, `InterviewType`, `ParticipantRole` are interview-specific. The `shared-video` package exports interview-specific hooks (`useInterviewToken`, `useInterviewNotes`). Generalizing to "recruiting calls" requires abstracting these while preserving backward compatibility.

---

## Table Stakes

Features users expect for v10.0. Missing these makes the generalization feel incomplete.

### TS-01: Recruiter-to-Company Video Calls

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Recruiters and company contacts discuss candidates, roles, split terms, and placement strategy. Currently this happens on external tools (Zoom, Google Meet, phone). Bringing it in-platform captures context. |
| **Complexity** | MEDIUM |
| **Dependencies** | v9.0 video infrastructure (LiveKit, `shared-video` package) |
| **What It Means** | A new call type (`recruiting_call`, `strategy_call`, `intake_call`) alongside existing interview types. Participants are recruiter + company user (not candidates). No `application_id` required -- calls can be about general relationship, a specific job, or multiple candidates. |
| **Key Differences from Interviews** | No candidate participant. No magic link needed (both parties are authenticated portal users). Notes link to jobs, companies, or split agreements rather than applications. No "interviewer"/"candidate" roles -- both are equal participants. |

### TS-02: Generalized Call Entity (Beyond Interviews)

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Cannot add recruiter-company calls without a call model that is not interview-specific. The current `interviews` table is tightly coupled to `application_id` (required field). |
| **Complexity** | HIGH |
| **Dependencies** | Database schema design, service refactoring |
| **What It Means** | Either (a) a new `calls` table that is parent to both interviews and recruiting calls, or (b) making `application_id` nullable on `interviews` and adding new linking columns. Option (a) is architecturally cleaner. The `calls` table holds room_name, scheduled_at, recording fields, etc. The `interviews` table becomes a child with `call_id` + `application_id`. A new `recruiting_calls` table links calls to jobs, companies, or split agreements. |
| **Recommendation** | Option (a): New `calls` table as the universal video session. This avoids polluting the interview model with non-interview concerns and follows the nano-service philosophy. |

### TS-03: Entity-Linked AI Summaries

| Aspect | Detail |
|--------|--------|
| **Why Expected** | v9.0 posts AI summaries to `application_notes`. Recruiter-company calls are not about a single application -- they discuss jobs, companies, candidates. Summaries must link to the relevant business entities. |
| **Complexity** | MEDIUM |
| **Dependencies** | TS-02 (generalized call entity), existing AI pipeline |
| **What It Means** | When scheduling a recruiter-company call, the user selects what the call is about: a specific job, a company relationship, a candidate pipeline review. The AI summary is then posted to the appropriate entity's notes (job notes, company notes, or a new "recruiting notes" concept). The AI prompt includes entity context for better summarization. |
| **Key Design Decision** | Summaries should link to entities via a polymorphic `entity_type` + `entity_id` pattern rather than hardcoded foreign keys. This supports future entity types without schema changes. |

### TS-04: Scheduling Recruiter-Company Calls

| Aspect | Detail |
|--------|--------|
| **Why Expected** | If you have video calls, you need to schedule them. The existing `SchedulingService` and calendar integration must extend to non-interview calls. |
| **Complexity** | LOW |
| **Dependencies** | TS-02, existing scheduling infrastructure |
| **What It Means** | Reuse `SchedulingService.getAvailableSlots()` and calendar event creation. New scheduling UI that does not require selecting an application. Instead: select a company contact, optionally link to a job or candidate, set time and duration. Calendar event created for both parties. |

### TS-05: Dedicated Video App (Separate Window Experience)

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Zoom, Teams, and Google Meet all open calls in a dedicated window or app. Users expect the video call to be a focused, full-screen experience separate from the main portal navigation. The current implementation already uses a dedicated route (`/portal/interview/[id]`) with a full-screen layout, but it runs inside the portal app's shell. |
| **Complexity** | MEDIUM |
| **Dependencies** | `shared-video` package, TS-02 |
| **What It Means** | The video call experience should open in its own browser window/tab with a clean, distraction-free layout. No portal sidebar, no navigation chrome. Just the call, controls, and optional notes panel. This is partially how it works today (the interview page is full-screen `h-screen`), but it should be an intentional, `window.open()` pattern rather than navigating within the portal. The dedicated window approach means: (1) user can keep the portal open for reference while on a call, (2) closing the call window does not navigate away from their work context, (3) the video experience can be a lightweight page that loads fast. |
| **Implementation Pattern** | A `window.open('/call/[id]', '_blank', 'width=1200,height=800')` from the portal. The `/call/[id]` route is a minimal page that renders only the `VideoRoom` component stack. Could live in `apps/portal` as a separate layout or in a dedicated `apps/video` app. |

### TS-06: Call History and Management

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Users need to find past calls, review recordings, access summaries. Interviews have this via the application detail page. Recruiter-company calls need their own access point. |
| **Complexity** | MEDIUM |
| **Dependencies** | TS-02, TS-03 |
| **What It Means** | A "Calls" or "Meetings" section in the portal where users see all their calls (both interviews and recruiting calls). Filterable by type, date, company, job. Links to recordings, transcripts, and summaries. Essentially a dedicated list view with the standard pagination/filtering patterns. |

### TS-07: Call Notifications and Reminders

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Same notification infrastructure as interviews (confirmation, reminders, cancellation) but for recruiter-company calls. |
| **Complexity** | LOW |
| **Dependencies** | TS-02, existing notification templates |
| **What It Means** | New email templates for recruiting call notifications. Reuse the existing `notification-service` consumer pattern. RabbitMQ events: `call.scheduled`, `call.rescheduled`, `call.cancelled`, `call.reminder`. Templates are simpler than interview ones (no candidate-specific language). |

---

## Differentiators

Features that set Splits Network apart. Not required for launch but create competitive advantage.

### DF-01: Multi-Brand Video Experience (video.applicant.network)

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | Candidates join video calls on `video.applicant.network` with neutral, professional branding rather than `splits.network` which reveals the financial marketplace. Candidates feel like they are interviewing with the company, not participating in a split-fee transaction. This is a genuine differentiator -- no competing ATS offers white-labeled video per audience. |
| **Complexity** | HIGH |
| **Dependencies** | TS-02, TS-05 |
| **What It Means** | A separate Next.js app (`apps/video` or similar) deployed to `video.applicant.network`. This app only renders the video call experience (lobby, room, post-call). No portal navigation, no marketplace features. Branding uses neutral colors and "Applicant Network" identity rather than "Splits Network". Magic links for candidates point to this domain. Authenticated users (recruiters, company contacts) can also use this app -- they just get different branding context based on their auth status. The same LiveKit room is used regardless of which domain users join from. |
| **Key Architectural Decision** | The `shared-video` package already provides all video components. The video app is a thin shell that imports `shared-video` components and provides branding/theming. The backend does not change -- both domains hit the same `api-gateway` and `video-service`. Domain selection happens at the frontend routing/link generation level. |

### DF-02: Contextual AI Summaries Linked to Business Entities

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | Instead of generic meeting transcripts, AI summaries are structured around recruiting context: "Candidate strengths discussed", "Split terms proposed", "Job requirements clarified", "Next steps agreed". The AI knows what entity the call is about and tailors the summary accordingly. No other recruiting platform does this. |
| **Complexity** | MEDIUM |
| **Dependencies** | TS-02, TS-03, existing AI pipeline |
| **What It Means** | The AI summarization prompt includes context about the call's linked entities (job title, company name, candidate name, split agreement terms). The summary is structured differently per call type: interview summaries focus on candidate assessment; recruiting call summaries focus on business outcomes and action items. Summaries are auto-posted to the relevant entity's activity feed or notes. |

### DF-03: Call-to-Entity Smart Linking

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | During or after a call, participants can link the call to entities mentioned (specific candidates, jobs, split agreements). The system can suggest entities based on AI analysis of the conversation. This creates a connected knowledge graph of calls and business entities. |
| **Complexity** | HIGH |
| **Dependencies** | TS-02, TS-03, DF-02 |
| **What It Means** | Post-call UI allows tagging the call with related entities. AI can analyze the transcript and suggest: "You mentioned John Smith (candidate) and the Senior Developer role at Acme Corp." Users confirm or modify. These links make calls searchable and traceable: "Show me all calls where we discussed this candidate." |

### DF-04: In-Call Context Panel

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | During a recruiter-company call, show relevant context alongside the video: the job posting details, candidate profiles being discussed, split agreement terms. This replaces the tab-switching users currently do. Interviews already have a notes panel -- this extends the concept to show entity data alongside notes. |
| **Complexity** | MEDIUM |
| **Dependencies** | TS-02, existing notes panel |
| **What It Means** | The right-side panel (currently notes only) becomes a tabbed panel: Notes | Job Details | Candidates | Split Terms. Tabs are context-aware based on what the call is linked to. Content is read-only reference data pulled from existing APIs. The notes tab remains for freeform note-taking. |

### DF-05: Quick Call (Instant, Unscheduled)

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | Sometimes recruiters and company contacts need to jump on a call right now without scheduling. A "Start Call" button on a company contact's profile or job detail page creates an instant room and sends a notification to the other party. Like a phone call, not a meeting. |
| **Complexity** | MEDIUM |
| **Dependencies** | TS-02, real-time notification infrastructure |
| **What It Means** | Bypass scheduling entirely. Create a call record + LiveKit room instantly. Send a push notification or in-app alert to the other party with a "Join Now" link. If they do not join within 5 minutes, the room auto-closes. The call record is still created for tracking and can still be recorded/transcribed. |

### DF-06: Recording Highlights and Clips

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | Rather than watching a full 60-minute recording, users can view AI-generated highlights or create short clips of key moments. The AI identifies important segments (decisions made, concerns raised, action items) and creates timestamp markers. |
| **Complexity** | HIGH |
| **Dependencies** | Existing recording + transcription pipeline |
| **What It Means** | The AI pipeline produces both a summary and a set of highlight timestamps. The recording player supports jumping to highlights. Users can clip segments (start/end timestamps) and share them as standalone URLs. Clips reference the original recording without duplicating storage. |

---

## Anti-Features

Things to deliberately NOT build in v10.0. These are commonly requested but counterproductive.

### AF-01: Separate Call Service per Call Type

| Why Avoided | What to Do Instead |
|-------------|-------------------|
| Creating `interview-service`, `recruiting-call-service`, `strategy-call-service` as separate backend services fragments the video infrastructure. Each would need its own recording, transcription, scheduling, and notification wiring. Violates DRY massively. | Single `video-service` with a unified `calls` table. Call types are distinguished by a `call_type` enum. Type-specific behavior lives in thin service classes that share the same repository, recording service, and room infrastructure. |

### AF-02: Real-Time Collaborative Document Editing in Calls

| Why Avoided | What to Do Instead |
|-------------|-------------------|
| Building Google-Docs-style collaborative editing during calls (shared agendas, live split term negotiation docs) is a massive undertaking requiring CRDT or OT infrastructure. It is its own product category. The notes panel already provides adequate in-call note-taking. | Keep the notes panel as-is (personal notes per participant, auto-saved). For shared documents, users can screen-share a Google Doc or use the in-call context panel to view read-only entity data. |

### AF-03: Video Voicemail / Async Video Messages

| Why Avoided | What to Do Instead |
|-------------|-------------------|
| "Leave a video message if they don't answer" sounds useful but creates an entirely new content type, playback experience, and notification flow. Async video in recruiting context (one-way interviews) is already established as an anti-pattern that candidates dislike. Extending it to recruiter-company communication adds complexity without clear value. | If a quick call is missed, send a text-based notification with an option to reschedule. The existing notification infrastructure handles this well. |

### AF-04: Custom Branding per Company

| Why Avoided | What to Do Instead |
|-------------|-------------------|
| Allowing each company to customize the video call branding (their logo, colors, fonts) sounds like a differentiator but creates massive UI/testing complexity. Each company's branding must be validated, stored, and dynamically applied. Edge cases (dark logo on dark background, oversized logos, brand-conflicting colors) multiply. | Two branding modes only: "Splits Network" branding (for portal users) and "Applicant Network" branding (for candidates on video.applicant.network). Companies are represented by their name in the call header, not custom theming. |

### AF-05: Video Call Analytics Dashboard (v10.0 scope)

| Why Avoided | What to Do Instead |
|-------------|-------------------|
| Building analytics (average call duration, calls per recruiter, time-to-connect, recording usage rates) requires data volume to be meaningful. v10.0 is extending the call types -- analytics should come after there is enough data to analyze. Building dashboards before the feature is adopted means building for hypothetical usage patterns. | Track the underlying data (call duration, participant count, recording usage) in the call records. Defer the analytics UI to a future milestone when there is 3+ months of data across call types. |

### AF-06: Built-In Virtual Backgrounds

| Why Avoided | What to Do Instead |
|-------------|-------------------|
| Virtual backgrounds require GPU-accelerated segmentation models running in the browser. They are CPU-intensive, drain laptop batteries, cause frame drops on lower-end machines, and create uncanny-valley artifacts. Every major video platform has them, but implementing them well is a specialized ML engineering effort. | Let the browser/OS handle this. macOS, Windows 11, and most webcam software now offer system-level background blur/replacement. Document this as a user tip rather than building it. If demand is overwhelming, use LiveKit's background processing plugin (if available) rather than building from scratch. |

---

## Feature Dependencies

```
EXISTING v9.0 FOUNDATION
    |
    v
[TS-02: Generalized Call Entity]  <-- CRITICAL PATH, everything depends on this
    |
    +---> [TS-01: Recruiter-Company Calls]
    |         |
    |         +---> [TS-04: Scheduling]
    |         +---> [TS-07: Notifications]
    |         +---> [DF-05: Quick Call]
    |
    +---> [TS-03: Entity-Linked AI Summaries]
    |         |
    |         +---> [DF-02: Contextual AI Summaries]
    |         +---> [DF-03: Call-to-Entity Smart Linking]
    |
    +---> [TS-05: Dedicated Video App]
    |         |
    |         +---> [DF-01: Multi-Brand (video.applicant.network)]
    |
    +---> [TS-06: Call History & Management]
    |
    +---> [DF-04: In-Call Context Panel]

[Existing Recording + Transcription Pipeline]
    |
    +---> [DF-06: Recording Highlights & Clips]
```

### Dependency Notes

- **TS-02 is the critical path.** Every v10.0 feature depends on generalizing the call model. This must be Phase 1 of v10.0.
- **TS-01, TS-04, TS-07 form a cohesive unit.** Recruiter-company calls need scheduling and notifications together. These should be a single phase.
- **TS-05 and DF-01 are related but separable.** The dedicated video app (opening calls in a new window) is table stakes. Multi-brand deployment to `video.applicant.network` is a differentiator that builds on it.
- **DF-03 and DF-06 are high-complexity differentiators** that should be deferred to late phases or post-v10.0.
- **TS-03 can ship with simple entity linking first**, then DF-02 adds AI-powered contextual summaries on top.

---

## Backward Compatibility Requirements

v10.0 must NOT break v9.0 interview functionality. These constraints are non-negotiable:

| Constraint | Why | How |
|-----------|-----|-----|
| Existing interview URLs must keep working | Users have bookmarked interview links, magic links are in sent emails | `/portal/interview/[id]` routes remain functional, redirect or proxy to new call routes |
| `InterviewContext` type must remain valid | `shared-video` components depend on it | New `CallContext` type extends or wraps `InterviewContext`. Existing components accept either. |
| Interview-specific AI summaries still post to `application_notes` | Existing workflow depends on this | The AI pipeline checks call type: interviews post to application notes, recruiting calls post to entity-appropriate notes |
| Recording and transcription pipelines are unchanged | Already proven, working infrastructure | Recording and transcription operate on calls generically. The call type determines where summaries are posted, not how recordings are processed. |
| Magic link join flow is unchanged for candidates | Candidates already use magic links for interviews | Magic links continue to work. For candidate-facing calls, links point to `video.applicant.network` (when deployed) or fall back to existing portal routes. |

---

## MVP Recommendation for v10.0

### Must Ship (v10.0 Core)

1. **TS-02: Generalized Call Entity** -- Database migration creating `calls` table, refactoring `video-service` to use it, backward-compatible interview support
2. **TS-01: Recruiter-Company Calls** -- New call type with authenticated-only participants (no magic links needed)
3. **TS-04: Scheduling for Recruiting Calls** -- Extend scheduling UI and service to non-interview calls
4. **TS-07: Call Notifications** -- Email templates for recruiting call scheduling/reminders
5. **TS-03: Entity-Linked AI Summaries** -- Summaries linked to jobs/companies instead of only applications
6. **TS-05: Dedicated Video App** -- Clean window.open() call experience
7. **TS-06: Call History** -- List view for all calls with filtering

### Should Ship (v10.0 Enhanced)

8. **DF-01: Multi-Brand (video.applicant.network)** -- Candidate-facing video on separate domain
9. **DF-02: Contextual AI Summaries** -- Entity-aware AI prompts for better summaries
10. **DF-04: In-Call Context Panel** -- Show entity data alongside notes during calls

### Defer to Post-v10.0

11. **DF-05: Quick Call** -- Requires real-time notification infrastructure that may not exist yet
12. **DF-03: Call-to-Entity Smart Linking** -- AI-suggested entity linking is high complexity
13. **DF-06: Recording Highlights** -- Requires significant AI pipeline extension

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Risk | Priority |
|---------|------------|---------------------|------|----------|
| TS-02: Generalized Call Entity | HIGH | HIGH | HIGH (migration risk) | P0 |
| TS-01: Recruiter-Company Calls | HIGH | MEDIUM | LOW | P1 |
| TS-04: Scheduling | HIGH | LOW | LOW | P1 |
| TS-07: Notifications | MEDIUM | LOW | LOW | P1 |
| TS-03: Entity-Linked AI Summaries | HIGH | MEDIUM | MEDIUM | P1 |
| TS-05: Dedicated Video App | MEDIUM | MEDIUM | LOW | P1 |
| TS-06: Call History | MEDIUM | MEDIUM | LOW | P1 |
| DF-01: Multi-Brand | HIGH | HIGH | MEDIUM (infra/DNS) | P2 |
| DF-02: Contextual AI Summaries | HIGH | MEDIUM | LOW | P2 |
| DF-04: In-Call Context Panel | MEDIUM | MEDIUM | LOW | P2 |
| DF-05: Quick Call | MEDIUM | MEDIUM | MEDIUM | P3 |
| DF-03: Smart Linking | MEDIUM | HIGH | MEDIUM | P3 |
| DF-06: Recording Highlights | LOW | HIGH | HIGH | P3 |

**Priority key:**
- P0: Must complete first (everything else depends on it)
- P1: Core v10.0 features that constitute the generalized video platform
- P2: Differentiators that should ship with v10.0 if timeline allows
- P3: Defer to post-v10.0

---

## Recruiter-Company Call Behavior Patterns

Based on how business video calls work in recruiting platforms and CRMs:

### Call Types in Recruiting Context

| Call Type | Participants | Linked To | Purpose | Duration |
|-----------|-------------|-----------|---------|----------|
| Intake Call | Recruiter + Hiring Manager | Job | Understand role requirements, culture, compensation | 30-60 min |
| Pipeline Review | Recruiter + Company Contact | Job + Candidates | Review submitted candidates, discuss progress | 15-30 min |
| Strategy Call | Recruiter + Company Contact | Company | Relationship building, discuss future hiring needs | 30-60 min |
| Split Negotiation | Recruiter + Recruiter | Split Agreement | Discuss split terms, candidate ownership | 15-30 min |
| Debrief | Recruiter + Interviewers | Application | Post-interview discussion about candidate | 15-30 min |

### Expected UX Patterns

1. **Both parties are authenticated portal users.** No magic links needed for recruiter-company calls. Both join via the portal with Clerk auth.
2. **Equal participant model.** Unlike interviews (interviewer/candidate hierarchy), recruiting calls are peer-to-peer. No "host" concept needed -- either party can start/stop recording, share screen, take notes.
3. **Entity context visible during call.** When discussing a specific job, the job title and key details should be visible in the call UI. When discussing candidates, candidate summaries should be accessible.
4. **Post-call action items.** Recruiting calls often produce action items: "send 3 more candidates by Friday", "update the job description", "schedule follow-up next week". The AI summary should extract these.
5. **Call series.** Recruiters have recurring calls with company contacts (weekly pipeline reviews). Support scheduling recurring calls linked to the same entity.

### Dedicated Video App Patterns

How platforms handle the "meeting window" experience:

1. **Zoom pattern:** `window.open()` to a minimal route. The meeting window has its own controls bar, no app navigation. Closing the window ends the call. The main app remains open for reference.
2. **Google Meet pattern:** Full browser tab with a clean layout. Side panels for chat, people, activities. No app chrome beyond the meeting itself.
3. **Teams pattern:** Calls pop out into their own window. The main Teams window shows a compact "In a call" indicator.

**Recommendation for Splits Network:** Follow the Zoom pattern. Use `window.open('/call/[id]', ...)` to open calls in a sized popup window. The portal shows a compact "In a call with [Name]" indicator bar. The call window is self-contained with the `shared-video` component stack. This gives users the focused video experience while keeping their portal work context intact.

---

## Sources

**Codebase analysis (HIGH confidence):**
- `packages/shared-video/src/` -- full component and hook inventory
- `services/video-service/src/v2/interviews/` -- service, types, repository, recording, scheduling
- `apps/portal/src/app/portal/interview/[id]/interview-client.tsx` -- current call implementation pattern
- `.planning/v9.0-MILESTONE-AUDIT.md` -- complete v9.0 feature inventory (33 requirements, all satisfied)
- `.planning/research/FEATURES.md` -- v9.0 feature research (table stakes, differentiators, anti-features)
- `.planning/research/PITFALLS-video-interviewing.md` -- v9.0 pitfalls research

**Domain knowledge (MEDIUM confidence -- based on training data, not verified against current product pages):**
- Recruiting platform video call patterns (Greenhouse, Lever, BreezyHR integration approaches)
- Dedicated video app UX patterns (Zoom, Google Meet, Teams window management)
- Business video call workflows in recruiting context
- Multi-brand/white-label SaaS patterns

---
*Feature research for: v10.0 Video Platform & Recruiting Calls*
*Researched: 2026-03-08*
