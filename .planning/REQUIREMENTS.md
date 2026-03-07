# Requirements: Splits Network v9.0 — Video Interviewing

**Defined:** 2026-03-07
**Core Value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements

## v9.0 Requirements

Requirements for in-app video interviewing powered by self-hosted LiveKit. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: LiveKit server deployed on K8s with TURN/STUN support and UDP port exposure
- [ ] **INFRA-02**: LiveKit Egress service deployed on K8s for server-side recording (dedicated node pool)
- [ ] **INFRA-03**: New `video-service` Fastify microservice following V2 patterns (repository, service, routes)
- [ ] **INFRA-04**: `interviews` database table with status enum (`scheduled`, `in_progress`, `completed`, `cancelled`, `no_show`), linked to `applications` via `application_id`
- [ ] **INFRA-05**: Interview access token system for magic link join (separate from Clerk auth)
- [ ] **INFRA-06**: Gateway routes for video-service endpoints through api-gateway

### Video Room

- [ ] **ROOM-01**: User can conduct a 1:1 video call within the app using LiveKit React components
- [ ] **ROOM-02**: User sees a pre-join lobby with device check (camera, mic, speaker test) and waiting room before entering
- [ ] **ROOM-03**: User can share their screen during a video call
- [ ] **ROOM-04**: User can conduct panel interviews with 3-6+ simultaneous participants
- [ ] **ROOM-05**: User can mute/unmute mic, toggle camera, select devices, and leave the call
- [ ] **ROOM-06**: User sees a connection quality indicator during the call

### Scheduling

- [ ] **SCHED-01**: User can schedule an interview from the application detail page, creating both a Google Calendar event and an `interviews` DB record
- [ ] **SCHED-02**: Moving an application to `interview` stage prompts the user to schedule an interview
- [ ] **SCHED-03**: User can cancel or reschedule an interview, triggering calendar event updates and notification cascade
- [ ] **SCHED-04**: Scheduling UI shows interviewer free/busy slots from Google Calendar to prevent double-booking

### Participant Access

- [ ] **JOIN-01**: Candidate can join an interview via magic link (no account required) — token-based URL in calendar invite and email
- [ ] **JOIN-02**: Authenticated user can join an interview via "Join Interview" button on application detail page
- [ ] **JOIN-03**: Candidate sees an interview prep landing page with job details, interviewer info, and join button

### Recording & Playback

- [ ] **REC-01**: Interviews are recorded server-side via LiveKit Egress with recording consent indicator
- [ ] **REC-02**: Recordings are stored in Azure Blob Storage with configurable retention policy (90-day default)
- [ ] **REC-03**: User can play back interview recordings from the interviews tab

### AI Pipeline

- [ ] **AI-01**: Completed interview recordings are transcribed asynchronously via ai-service (Whisper)
- [ ] **AI-02**: Transcripts are summarized into structured format (key points, strengths, concerns, overall impression) via ai-service
- [ ] **AI-03**: AI summary is auto-posted as an `interview_summary` note type to `application_notes`

### Notifications

- [ ] **NOTIF-01**: Participants receive email confirmation when an interview is scheduled (with join link)
- [ ] **NOTIF-02**: Participants receive automated reminder emails (24h and 1h before interview)
- [ ] **NOTIF-03**: Participants are notified when an interview is cancelled or rescheduled
- [ ] **NOTIF-04**: In-app notifications for interview lifecycle events (scheduled, reminder, completed, recording ready)

### Application Integration

- [ ] **INT-01**: Application detail page has a dedicated interviews tab showing all interviews with status, recordings, transcripts, and summaries
- [ ] **INT-02**: Interviewer can take notes in a side panel during the call, auto-saved and posted to application notes on call end
- [ ] **INT-03**: `interview.recording_ready` RabbitMQ event triggers the AI transcription + summary pipeline
- [ ] **INT-04**: Multiple interviews per application are tracked chronologically (multi-round support)

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
| (populated by roadmapper) | | |

**Coverage:**
- v9.0 requirements: 30 total
- Mapped to phases: 0
- Unmapped: 30

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after initial definition*
