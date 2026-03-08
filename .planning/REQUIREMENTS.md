# Requirements: Splits Network v10.0 — Video Platform & Recruiting Calls

**Defined:** 2026-03-08
**Core Value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements

## v10.0 Requirements

Requirements for generalizing video from interview-only to platform-wide recruiting conversations, with dedicated full-screen video apps on branded subdomains. Each maps to roadmap phases.

### Data Model

- [ ] **DATA-01**: New `calls` table as universal video session entity with `call_type` enum (`interview`, `client_meeting`), polymorphic entity linking (`entity_type` + `entity_id`), and room/scheduling fields
- [ ] **DATA-02**: Existing `interviews` table references `calls` via `call_id` FK — interviews become a specialized call type with `application_id` context
- [ ] **DATA-03**: All call artifacts (recordings, transcripts, AI summaries, in-call notes) are owned by the call record, not posted to entity note tables

### Video App

- [ ] **APP-01**: Dedicated `apps/video/` Next.js app with full-screen video experience (no portal navigation chrome)
- [ ] **APP-02**: Single app serves both `video.splits.network` and `video.applicant.network` — brand detection via Host header switches logo, colors, and copy per domain
- [ ] **APP-03**: Magic-link-only auth for all participants in the video app (Clerk-authenticated users receive a magic link token before redirect)
- [ ] **APP-04**: K8s deployment with ingress rules for both `video.splits.network` and `video.applicant.network` subdomains with TLS

### Recruiter-Company Calls

- [ ] **CALL-01**: Recruiter can initiate a video call with a company contact, linked to a job, company, or general relationship
- [ ] **CALL-02**: Both participants are authenticated portal users with equal peer-to-peer roles (no host/candidate hierarchy)
- [ ] **CALL-03**: User can schedule a recruiter-company call with Google Calendar integration, selecting entity to link
- [ ] **CALL-04**: Participants receive email confirmation, reminders (24h, 1h), and cancellation/reschedule notifications for recruiting calls

### Call History

- [ ] **HIST-01**: Portal has a "Calls" section listing all calls (interviews and recruiting calls) with filtering by type, date, entity
- [ ] **HIST-02**: Call detail view shows recording, transcript, AI summary, and in-call notes — all from the call record

### AI Pipeline

- [ ] **AI-04**: AI summaries are stored on the call record and linked to the associated entity — not posted to entity note tables
- [ ] **AI-05**: Per-call-type summarizer prompts: interview summaries focus on candidate assessment, recruiting call summaries focus on business outcomes and action items
- [ ] **AI-06**: AI summary includes entity context (job title, company name, candidate names) in the prompt for better output

### In-Call Experience

- [ ] **EXP-01**: In-call context panel shows entity data alongside notes (job details, candidate profiles, company info) based on what the call is linked to

### Migration

- [ ] **MIG-01**: Existing interview video flows redirect from portal/candidate apps to `video.splits.network` / `video.applicant.network`
- [ ] **MIG-02**: Existing magic link URLs continue to work (redirect to new video app domain)
- [ ] **MIG-03**: Existing v9.0 interview data (recordings, transcripts, summaries) migrated to call-owned artifact pattern

## Future Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Real-Time & Intelligence

- **QUICK-01**: Quick/instant unscheduled calls — "Start Call" button creates instant room with push notification
- **SMART-01**: AI-suggested entity linking — transcript analysis suggests related jobs, candidates, companies
- **CLIP-01**: Recording highlights and clips — AI-generated timestamp markers for key moments

### Interview Experience v2

- **SCORE-01**: Configurable interview scorecard with structured ratings per company/job
- **SCORE-02**: Interview feedback request automation after call completion
- **ANALYTICS-01**: Interview analytics dashboard (duration, time-to-schedule, no-show rates)

### Accessibility & Advanced

- **A11Y-01**: Live captions during calls (real-time speech-to-text, opt-in)
- **SELF-01**: Self-service scheduling links (Calendly-style candidate self-booking)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Quick/instant unscheduled calls | Requires real-time push notification infrastructure not yet built |
| AI-suggested entity linking | High complexity, defer to post-v10.0 |
| Recording highlights and clips | High complexity AI pipeline extension, defer |
| Custom branding per company | Two brand modes only (Splits Network + Applicant Network) — avoids massive UI/testing complexity |
| Video voicemail / async messages | Anti-feature in recruiting context — candidates dislike async video |
| Separate services per call type | Single video-service with call_type enum — avoid fragmenting infrastructure |
| Video analytics dashboard | Need usage data before building dashboards — defer to post-v10.0 |
| Built-in virtual backgrounds | Let OS/browser handle this — building well requires specialized ML engineering |
| Real-time collaborative document editing | Own product category (CRDT/OT infrastructure) — screen share + notes panel sufficient |
| One-way / async video interviews | Universally disliked by candidates, increases drop-off 30-50%. Anti-feature. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 42 | Pending |
| DATA-02 | Phase 42 | Pending |
| DATA-03 | Phase 42 | Pending |
| APP-01 | Phase 43 | Pending |
| APP-02 | Phase 43 | Pending |
| APP-03 | Phase 43 | Pending |
| APP-04 | Phase 43 | Pending |
| CALL-01 | Phase 44 | Pending |
| CALL-02 | Phase 44 | Pending |
| CALL-03 | Phase 44 | Pending |
| CALL-04 | Phase 44 | Pending |
| HIST-01 | Phase 44 | Pending |
| HIST-02 | Phase 44 | Pending |
| EXP-01 | Phase 44 | Pending |
| AI-04 | Phase 45 | Pending |
| AI-05 | Phase 45 | Pending |
| AI-06 | Phase 45 | Pending |
| MIG-01 | Phase 46 | Pending |
| MIG-02 | Phase 46 | Pending |
| MIG-03 | Phase 46 | Pending |

**Coverage:**
- v10.0 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after roadmap creation (all 20 requirements mapped to Phases 42-46)*
