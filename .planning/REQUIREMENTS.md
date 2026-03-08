# Requirements: Splits Network v9.0 — Video Interviewing

**Defined:** 2026-03-07
**Core Value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements

## v9.0 Requirements

Requirements for in-app video interviewing powered by self-hosted LiveKit. Each maps to roadmap phases.

### Infrastructure

- [x] **INFRA-01**: LiveKit server deployed on K8s with TURN/STUN support and UDP port exposure
- [x] **INFRA-02**: LiveKit Egress service deployed on K8s for server-side recording (dedicated node pool)
- [x] **INFRA-03**: New `video-service` Fastify microservice following V2 patterns (repository, service, routes)
- [x] **INFRA-04**: `interviews` database table with status enum (`scheduled`, `in_progress`, `completed`, `cancelled`, `no_show`), linked to `applications` via `application_id`
- [x] **INFRA-05**: Interview access token system for magic link join (separate from Clerk auth)
- [x] **INFRA-06**: Gateway routes for video-service endpoints through api-gateway

### Video Room

- [x] **ROOM-01**: User can conduct a 1:1 video call within the app using LiveKit React components
- [x] **ROOM-02**: User sees a pre-join lobby with device check (camera, mic, speaker test) and waiting room before entering
- [x] **ROOM-03**: User can share their screen during a video call
- [x] **ROOM-04**: User can conduct panel interviews with 3-6+ simultaneous participants
- [x] **ROOM-05**: User can mute/unmute mic, toggle camera, select devices, and leave the call
- [x] **ROOM-06**: User sees a connection quality indicator during the call

### Scheduling

- [x] **SCHED-01**: User can schedule an interview from the application detail page, creating both a Google Calendar event and an `interviews` DB record
- [x] **SCHED-02**: Moving an application to `interview` stage prompts the user to schedule an interview
- [x] **SCHED-03**: User can cancel or reschedule an interview, triggering calendar event updates and notification cascade
- [x] **SCHED-04**: Scheduling UI shows interviewer free/busy slots from Google Calendar to prevent double-booking

### Participant Access

- [x] **JOIN-01**: Candidate can join an interview via magic link (no account required) — token-based URL in calendar invite and email
- [x] **JOIN-02**: Authenticated user can join an interview via "Join Interview" button on application detail page
- [x] **JOIN-03**: Candidate sees an interview prep landing page with job details, interviewer info, and join button

### Recording & Playback

- [x] **REC-01**: Interviews are recorded server-side via LiveKit Egress with recording consent indicator
- [x] **REC-02**: Recordings are stored in Azure Blob Storage with configurable retention policy (90-day default)
- [x] **REC-03**: User can play back interview recordings from the interviews tab

### AI Pipeline

- [x] **AI-01**: Completed interview recordings are transcribed asynchronously via ai-service (Whisper)
- [x] **AI-02**: Transcripts are summarized into structured format (key points, strengths, concerns, overall impression) via ai-service
- [x] **AI-03**: AI summary is auto-posted as an `interview_summary` note type to `application_notes`

### Notifications

- [x] **NOTIF-01**: Participants receive email confirmation when an interview is scheduled (with join link)
- [x] **NOTIF-02**: Participants receive automated reminder emails (24h and 1h before interview)
- [x] **NOTIF-03**: Participants are notified when an interview is cancelled or rescheduled
- [x] **NOTIF-04**: In-app notifications for interview lifecycle events (scheduled, reminder, completed, recording ready)

### Application Integration

- [x] **INT-01**: Application detail page has a dedicated interviews tab showing all interviews with status, recordings, transcripts, and summaries
- [x] **INT-02**: Interviewer can take notes in a side panel during the call, auto-saved and posted to application notes on call end
- [x] **INT-03**: `interview.recording_ready` RabbitMQ event triggers the AI transcription + summary pipeline
- [x] **INT-04**: Multiple interviews per application are tracked chronologically (multi-round support)

## Future Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Interview Experience v2

- **SCORE-01**: Configurable interview scorecard with structured ratings per company/job
- **SCORE-02**: Interview feedback request automation after call completion
- **ANALYTICS-01**: Interview analytics dashboard (duration, time-to-schedule, no-show rates)

### Accessibility & Advanced

- **A11Y-01**: Live captions during calls (real-time speech-to-text, opt-in)
- **SELF-01**: Self-service scheduling links (Calendly-style candidate self-booking)
- **LABEL-01**: Named interview rounds (Phone Screen, Technical, Cultural Fit) with formal round labels

## Out of Scope

| Feature | Reason |
|---------|--------|
| One-way / async video interviews | Universally disliked by candidates, increases drop-off 30-50%. Anti-feature. |
| Custom-built WebRTC infrastructure | LiveKit handles all media. Don't build SFU/TURN from scratch. |
| Real-time AI coaching during interview | Ethically questionable, legally risky, undermines human interaction |
| 4K video streaming | Diminishing returns past 720p for interviews. Let LiveKit handle adaptive bitrate. |
| Built-in whiteboard / code editor | Massive scope. Screen sharing covers technical discussions. Use external tools. |
| Unlimited recording storage | Unbounded cost and GDPR/CCPA exposure. 90-day retention with cold storage archival. |
| Live transcription for all participants | Real-time STT is 85-90% accuracy vs 95-98% async. Higher cost, worse experience. Defer as accessibility opt-in. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 33 | Complete |
| INFRA-02 | Phase 33 | Complete |
| INFRA-03 | Phase 33 | Complete |
| INFRA-04 | Phase 33 | Complete |
| INFRA-05 | Phase 33 | Complete |
| INFRA-06 | Phase 33 | Complete |
| ROOM-01 | Phase 34 | Complete |
| ROOM-02 | Phase 34 | Complete |
| ROOM-03 | Phase 38 | Complete |
| ROOM-04 | Phase 38 | Complete |
| ROOM-05 | Phase 34 | Complete |
| ROOM-06 | Phase 34 | Complete |
| SCHED-01 | Phase 35 | Complete |
| SCHED-02 | Phase 35 | Complete |
| SCHED-03 | Phase 35 | Complete |
| SCHED-04 | Phase 35 | Complete |
| JOIN-01 | Phase 34 | Complete |
| JOIN-02 | Phase 34 | Complete |
| JOIN-03 | Phase 34 | Complete |
| REC-01 | Phase 36 | Complete |
| REC-02 | Phase 36 | Complete |
| REC-03 | Phase 36 | Complete |
| AI-01 | Phase 37 | Complete |
| AI-02 | Phase 37 | Complete |
| AI-03 | Phase 37 | Complete |
| NOTIF-01 | Phase 35 | Complete |
| NOTIF-02 | Phase 35 | Complete |
| NOTIF-03 | Phase 35 | Complete |
| NOTIF-04 | Phase 35 | Complete |
| INT-01 | Phase 38 | Complete |
| INT-02 | Phase 38 | Complete |
| INT-03 | Phase 36 | Complete |
| INT-04 | Phase 38 | Complete |

**Coverage:**
- v9.0 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after roadmap creation (all 33 requirements mapped)*
