# Roadmap: Splits Network

## Milestones

- [x] **v2.0 Global Search** - Phases 1-3 (shipped 2026-02-13)
- [x] **v3.0 Platform Admin Restructure** - Phases 4-7 (shipped 2026-02-13)
- [x] **v4.0 Commute Types & Job Levels** - Phases 8-10 (shipped 2026-02-13)
- [x] **v5.0 Custom GPT / Applicant Network** - Phases 11-15 (shipped 2026-02-13)
- [x] **v6.0 Admin App Extraction** - Phases 16-21 (shipped 2026-02-27)
- [x] **v7.0 Company Profile Enhancement** - Phases 22-27 (shipped 2026-03-04)
- [ ] ~~**v8.0 Company Experience Enhancement** - Phases 28-32 (shelved)~~
- [x] **v9.0 Video Interviewing** - Phases 33-41 (shipped 2026-03-08)
- [ ] **v10.0 Video Platform & Recruiting Calls** - Phases 42-46 (in progress)

## Phases

<details>
<summary>v2.0-v6.0 (Phases 1-21) - See MILESTONES.md</summary>

Completed milestones documented in .planning/MILESTONES.md

</details>

<details>
<summary>v7.0 Company Profile Enhancement (Phases 22-27) - Complete</summary>

- [x] **Phase 22: Schema & Types** - Database tables, columns, RLS, and TypeScript types for all new company data
- [x] **Phase 23: Lookup APIs** - Search/create endpoints for perks and culture tags, plus junction CRUD
- [x] **Phase 24: Company Enrichment APIs** - Scalar field updates, computed stats, and gateway routing
- [x] **Phase 25: Company Settings UI** - Form sections for all new fields in company settings
- [x] **Phase 26: Company Card Redesign** - Grid card, detail panel, and description section
- [x] **Phase 27: Search Index Enrichment** - Triggers to index new fields into company search vector

</details>

<details>
<summary>v8.0 Company Experience Enhancement (Phases 28-32) - Shelved</summary>

Shelved in favor of v9.0 Video Interviewing. Requirements preserved in REQUIREMENTS-v8.md if resuming.

- [ ] ~~**Phase 28: Schema & Types** - Migration for invited status, invited_by/invited_at columns~~
- [ ] ~~**Phase 29: Invite API & Event** - Invite endpoint in matching-service, RabbitMQ event~~
- [ ] ~~**Phase 30: Notifications** - In-app and email notifications for invite lifecycle~~
- [ ] ~~**Phase 31: Portal UI** - Invite button, invited badge, role-aware tabs, top matches widget~~
- [ ] ~~**Phase 32: Candidate UI** - Invited badge on match cards, sort invited to top~~

</details>

<details>
<summary>v9.0 Video Interviewing (Phases 33-41) - Complete</summary>

- [x] **Phase 33: Infrastructure** - LiveKit K8s deployment, video-service scaffold, database schema, token system, gateway routes
- [x] **Phase 34: Video Call Experience** - 1:1 calls, lobby, controls, magic link join, in-app join, candidate prep page
- [x] **Phase 35: Scheduling & Notifications** - Calendar integration, stage triggers, cancel/reschedule, email and in-app notifications
- [x] **Phase 36: Recording & Playback** - LiveKit Egress, Azure Blob Storage, playback UI, consent, event pipeline
- [x] **Phase 37: AI Pipeline** - Transcription via Whisper, structured summary, auto-post to application notes
- [x] **Phase 38: Panel, Notes & Polish** - Panel interviews, screen share, in-call notes, interviews tab, multi-round tracking
- [x] **Phase 39: Integration Wiring & Auth Fixes** - Gateway auth bypasses, LiveKit webhook config, candidate notes dual-auth
- [x] **Phase 40: Candidate Magic-Link Bug Fixes** - Recording consent token location, notes load-on-mount array mismatch
- [x] **Phase 41: Schedule & Recording Bug Fixes** - Empty participants array on schedule, recording status field mismatch

</details>

### v10.0 Video Platform & Recruiting Calls

**Milestone Goal:** Generalize video from interview-only to platform-wide recruiting conversations, with a dedicated full-screen video app on branded subdomains and recruiter-company calls as the first new call type.

- [x] **Phase 42: Call Data Model & Service Layer** - calls table, call_participants, call_access_tokens, call-service microservice, gateway routes
- [x] **Phase 43: Video App & Infrastructure** - apps/video/ with brand detection, magic-link auth, K8s deployment, dual-subdomain ingress
- [x] **Phase 44: Recruiter-Company Calls & Portal Integration** - Call creation, scheduling, notifications, call history, in-call context panel
- [ ] **Phase 45: AI Pipeline Generalization** - Per-call-type summarizers, entity-linked summary storage, polymorphic recording access
- [ ] **Phase 46: Interview Migration** - Redirect existing interview flows to video app, magic link URL continuity, data migration to call-owned artifacts

## Phase Details

### Phase 42: Call Data Model & Service Layer
**Goal**: A generalized call entity exists in the database and a new call-service can create, read, and manage calls with polymorphic entity linking independent of the interview system
**Depends on**: Nothing (foundation phase for v10.0)
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. A call record can be created via API with a `call_type` of `interview` or `client_meeting` and linked to any entity type (application, job, company)
  2. Call participants are tracked in `call_participants` with role and join status, supporting both Clerk-authenticated users and magic-link participants
  3. Call artifacts (recordings, transcripts, summaries, notes) are stored on the call record, not on entity-specific note tables
  4. Existing interview creation also creates a linked call record via `call_id` FK, maintaining backward compatibility
**Plans:** 4 plans
Plans:
- [x] 42-01-PLAN.md — Database migration: call tables, enums, indexes, RLS, interview FK
- [x] 42-02-PLAN.md — call-service scaffold, TypeScript types, repository layer
- [x] 42-03-PLAN.md — Service layer, Fastify routes, token service, RabbitMQ events
- [x] 42-04-PLAN.md — Dockerfile, K8s deployment, gateway routing

### Phase 43: Video App & Infrastructure
**Goal**: A dedicated full-screen video app runs on two branded subdomains, and participants can join calls via magic link without Clerk authentication
**Depends on**: Phase 42
**Requirements**: APP-01, APP-02, APP-03, APP-04
**Success Criteria** (what must be TRUE):
  1. Navigating to `video.splits.network` renders a full-screen video experience with Splits Network branding (no portal navigation chrome)
  2. Navigating to `video.applicant.network` renders the same video experience with Applicant Network branding (different logo, colors, copy)
  3. A portal user clicking "Join Call" receives a magic-link token and is redirected to the video app, where the token is exchanged for a LiveKit room JWT
  4. Both subdomains have working TLS certificates and K8s ingress rules in production
**Plans:** 4 plans
Plans:
- [x] 43-01-PLAN.md — App scaffold with brand detection, themes, and gateway token exchange route
- [x] 43-02-PLAN.md — Magic-link join flow with token exchange, identity confirmation, error pages
- [x] 43-03-PLAN.md — Video call experience with shared-video components, type adapter, side panel
- [x] 43-04-PLAN.md — Dockerfile, K8s deployment, ingress rules for both subdomains

### Phase 44: Recruiter-Company Calls & Portal Integration
**Goal**: Recruiters can schedule and conduct video calls with company contacts, and all users can browse their full call history (interviews and recruiting calls) in the portal
**Depends on**: Phase 43
**Requirements**: CALL-01, CALL-02, CALL-03, CALL-04, HIST-01, HIST-02, EXP-01
**Success Criteria** (what must be TRUE):
  1. Recruiter can initiate a video call with a company contact from a job or company detail page, with the call linked to the relevant entity
  2. Both participants join as equal peers (no host/candidate hierarchy) and the in-call experience shows entity context (job details, company info) in a side panel
  3. Recruiter can schedule a call with Google Calendar integration and the selected entity link
  4. Both participants receive email confirmation, 24h and 1h reminders, and cancellation/reschedule notifications
  5. Portal has a "Calls" section listing all calls with filtering by type, date, and entity, with detail views showing recording, transcript, AI summary, and notes
**Plans:** 12 plans
Plans:
- [x] 44-01-PLAN.md — Database migration: scheduling fields, tags, follow-up tracking, expanded statuses
- [x] 44-02-PLAN.md — Call-service extensions: scheduling logic, authorization, stats, search, tags
- [x] 44-03-PLAN.md — Notification consumer and email templates for call lifecycle
- [x] 44-04-PLAN.md — Reminder scheduler: 24h/1h/5min reminders, instant call timeout, no-show detection
- [x] 44-05-PLAN.md — Google Calendar integration: event CRUD for calls, availability endpoint
- [x] 44-06-PLAN.md — Portal call list page: sidebar nav, table/grid views, filters, stats bar
- [x] 44-07-PLAN.md — Call creation modal: participant picker, entity linker, scheduling panel, tags
- [x] 44-08-PLAN.md — Call detail page: recording/transcript/summary tabs, synced playback, context panel
- [x] 44-09-PLAN.md — Entity-scoped call tabs on company and job detail pages
- [x] 44-10-PLAN.md — Video app context panel: Context/Chat/History tabs, role-aware content
- [x] 44-11-PLAN.md — Post-call summary screen and chat widget call integration
- [x] 44-12-PLAN.md — In-app notifications: toasts, notification bell, real-time call events

### Phase 45: AI Pipeline Generalization
**Goal**: Recording, transcription, and AI summarization work for all call types with context-aware prompts that produce relevant output per call type
**Depends on**: Phase 44
**Requirements**: AI-04, AI-05, AI-06
**Success Criteria** (what must be TRUE):
  1. After a recruiter-company call recording completes, the AI pipeline transcribes and summarizes it without manual intervention
  2. Interview summaries focus on candidate assessment (strengths, concerns, recommendation) while recruiting call summaries focus on business outcomes and action items
  3. AI summary prompts include entity context (job title, company name, participant names) for better output quality
  4. Summaries are stored on the call record and linked to the associated entity -- not posted to entity note tables
**Plans:** 4 plans
Plans:
- [ ] 45-01-PLAN.md — Call recording pipeline in video-service: recording service, webhook, routes
- [ ] 45-02-PLAN.md — Generalized AI pipeline in ai-service: per-call-type prompts, entity context, call transcript/summary storage
- [ ] 45-03-PLAN.md — Gateway routing for call recordings and call-service playback URL endpoint
- [ ] 45-04-PLAN.md — Portal UI: pipeline status stepper, TL;DR + markdown summary rendering

### Phase 46: Interview Migration
**Goal**: Existing interview video flows redirect to the dedicated video app, and all historical interview data is migrated to the call-owned artifact pattern
**Depends on**: Phase 45
**Requirements**: MIG-01, MIG-02, MIG-03
**Success Criteria** (what must be TRUE):
  1. Clicking "Join Interview" in the portal redirects to `video.splits.network` instead of the in-portal interview page
  2. Candidate magic link URLs from previously-sent emails still work, redirecting to `video.applicant.network` with the token forwarded
  3. Existing v9.0 interview recordings, transcripts, and summaries are accessible through the call-owned artifact pattern
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 42 -> 43 -> 44 -> 45 -> 46

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 22. Schema & Types | v7.0 | 2/2 | Complete | 2026-03-03 |
| 23. Lookup APIs | v7.0 | 3/3 | Complete | 2026-03-03 |
| 24. Company Enrichment APIs | v7.0 | 2/2 | Complete | 2026-03-03 |
| 25. Company Settings UI | v7.0 | 2/2 | Complete | 2026-03-04 |
| 26. Company Card Redesign | v7.0 | 3/3 | Complete | 2026-03-04 |
| 27. Search Index Enrichment | v7.0 | 2/2 | Complete | 2026-03-04 |
| ~~28. Schema & Types~~ | ~~v8.0~~ | — | Shelved | — |
| ~~29. Invite API & Event~~ | ~~v8.0~~ | — | Shelved | — |
| ~~30. Notifications~~ | ~~v8.0~~ | — | Shelved | — |
| ~~31. Portal UI~~ | ~~v8.0~~ | — | Shelved | — |
| ~~32. Candidate UI~~ | ~~v8.0~~ | — | Shelved | — |
| 33. Infrastructure | v9.0 | 4/4 | Complete | 2026-03-08 |
| 34. Video Call Experience | v9.0 | 6/6 | Complete | 2026-03-07 |
| 35. Scheduling & Notifications | v9.0 | 10/10 | Complete | 2026-03-08 |
| 36. Recording & Playback | v9.0 | 6/6 | Complete | 2026-03-08 |
| 37. AI Pipeline | v9.0 | 3/3 | Complete | 2026-03-08 |
| 38. Panel, Notes & Polish | v9.0 | 4/4 | Complete | 2026-03-08 |
| 39. Integration Wiring & Auth Fixes | v9.0 | 2/2 | Complete | 2026-03-08 |
| 40. Candidate Magic-Link Bug Fixes | v9.0 | 2/2 | Complete | 2026-03-08 |
| 41. Schedule & Recording Bug Fixes | v9.0 | 2/2 | Complete | 2026-03-08 |
| 42. Call Data Model & Service Layer | v10.0 | 4/4 | Complete | 2026-03-08 |
| 43. Video App & Infrastructure | v10.0 | 4/4 | Complete | 2026-03-08 |
| 44. Recruiter-Company Calls & Portal Integration | v10.0 | 12/12 | Complete | 2026-03-09 |
| 45. AI Pipeline Generalization | v10.0 | 0/4 | Not started | - |
| 46. Interview Migration | v10.0 | 0/TBD | Not started | - |
