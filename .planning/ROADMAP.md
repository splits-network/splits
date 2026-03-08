# Roadmap: Splits Network

## Milestones

- [x] **v2.0 Global Search** - Phases 1-3 (shipped 2026-02-13)
- [x] **v3.0 Platform Admin Restructure** - Phases 4-7 (shipped 2026-02-13)
- [x] **v4.0 Commute Types & Job Levels** - Phases 8-10 (shipped 2026-02-13)
- [x] **v5.0 Custom GPT / Applicant Network** - Phases 11-15 (shipped 2026-02-13)
- [x] **v6.0 Admin App Extraction** - Phases 16-21 (shipped 2026-02-27)
- [x] **v7.0 Company Profile Enhancement** - Phases 22-27 (shipped 2026-03-04)
- [ ] ~~**v8.0 Company Experience Enhancement** - Phases 28-32 (shelved)~~
- [ ] **v9.0 Video Interviewing** - Phases 33-38 (active)

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

### v9.0 Video Interviewing (Active)

**Milestone Goal:** Add in-app video interviewing powered by self-hosted LiveKit -- schedule, conduct, record, transcribe, and AI-summarize interviews directly within the recruiting workflow.

- [x] **Phase 33: Infrastructure** - LiveKit K8s deployment, video-service scaffold, database schema, token system, gateway routes
- [x] **Phase 34: Video Call Experience** - 1:1 calls, lobby, controls, magic link join, in-app join, candidate prep page
- [ ] **Phase 35: Scheduling & Notifications** - Calendar integration, stage triggers, cancel/reschedule, email and in-app notifications
- [ ] **Phase 36: Recording & Playback** - LiveKit Egress, Azure Blob Storage, playback UI, consent, event pipeline
- [ ] **Phase 37: AI Pipeline** - Transcription via Whisper, structured summary, auto-post to application notes
- [ ] **Phase 38: Panel, Notes & Polish** - Panel interviews, screen share, in-call notes, interviews tab, multi-round tracking

## Phase Details

### Phase 33: Infrastructure
**Goal**: LiveKit is running on K8s and video-service can create interview records, issue tokens, and route through the gateway
**Depends on**: Nothing (foundation phase for v9.0)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06
**Success Criteria** (what must be TRUE):
  1. LiveKit Server is deployed on AKS with TURN on TCP 443 and media connections succeed from a restrictive network
  2. LiveKit Egress service is deployed on a dedicated node pool with resource guarantees
  3. Creating an interview via video-service API returns an interview record with status `scheduled` linked to an application
  4. A magic link token can be exchanged for a LiveKit room JWT without requiring Clerk authentication
  5. All video-service endpoints are accessible through api-gateway
**Plans:** 4 plans
Plans:
- [x] 33-01-PLAN.md — LiveKit K8s manifests + interviews database schema
- [x] 33-02-PLAN.md — video-service scaffold with interview CRUD
- [x] 33-03-PLAN.md — Token system (magic links + LiveKit JWT) + gateway routing
- [x] 33-04-PLAN.md — Docker-compose, CI/CD workflows, and K8s env vars for video-service

### Phase 34: Video Call Experience
**Goal**: Users can conduct 1:1 video interviews within the app with a professional pre-join and in-call experience
**Depends on**: Phase 33
**Requirements**: ROOM-01, ROOM-02, ROOM-05, ROOM-06, JOIN-01, JOIN-02, JOIN-03
**Success Criteria** (what must be TRUE):
  1. Authenticated user can click "Join Interview" on an application detail page and enter a working 1:1 video call
  2. Candidate can open a magic link from an email, see job details and interviewer info on a prep page, and join the call without creating an account
  3. Both participants see a pre-join lobby with camera preview, mic test, and device selection before entering the room
  4. During the call, participants can mute/unmute, toggle camera, switch devices, see connection quality, and leave the call
**Plans:** 6 plans
Plans:
- [x] 34-01-PLAN.md — Shared video package scaffold, hooks, types + token endpoint enrichment
- [x] 34-02-PLAN.md — Lobby components (split layout, device selector, audio meter, waiting indicator)
- [x] 34-03-PLAN.md — Room components (active speaker layout, controls bar, connection quality, post-call)
- [x] 34-04-PLAN.md — Portal interview page with state machine + Join Interview button
- [x] 34-05-PLAN.md — Candidate prep page + magic link interview flow
- [x] 34-06-PLAN.md — Integration verification and build validation

### Phase 35: Scheduling & Notifications
**Goal**: Users can schedule, reschedule, and cancel interviews with Google Calendar and Microsoft Outlook sync, and all participants are notified at every step
**Depends on**: Phase 34
**Requirements**: SCHED-01, SCHED-02, SCHED-03, SCHED-04, NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04
**Success Criteria** (what must be TRUE):
  1. User can schedule an interview from the application detail page, creating both a Google Calendar event (with join link) and an interviews DB record
  2. Moving an application to the `interview` stage prompts the user to schedule an interview
  3. User can cancel or reschedule an interview, which updates the calendar event and notifies all participants
  4. Scheduling UI shows interviewer free/busy slots from Google Calendar to prevent double-booking
  5. Participants receive email confirmation when scheduled, reminders at 24h and 1h before, and notification on cancellation/reschedule
**Plans:** 10 plans
Plans:
- [ ] 35-01-PLAN.md — Database schema extensions (calendar linking, working hours, reschedule tracking)
- [ ] 35-02-PLAN.md — Integration-service calendar extensions (update/delete, ICS, webhooks)
- [ ] 35-03-PLAN.md — Video-service scheduling APIs (reschedule, slots, gateway routes)
- [ ] 35-04-PLAN.md — ScheduleInterviewModal overhaul (platform choice, slots, auto-title)
- [ ] 35-05-PLAN.md — Calendar page enhancements (slot-click, app linking, interview styling)
- [ ] 35-06-PLAN.md — Integrations page calendar preferences + stage trigger toast
- [ ] 35-07-PLAN.md — Reschedule and cancel flows (modals, dialogs, calendar sync)
- [ ] 35-08-PLAN.md — Notification consumer + email templates (scheduled, cancelled, rescheduled)
- [ ] 35-09-PLAN.md — Interview reminder system (24h, 1h, 10min scheduled job)
- [ ] 35-10-PLAN.md — Candidate reschedule flow + in-app countdown notifications

### Phase 36: Recording & Playback
**Goal**: Interviews are recorded server-side with consent, stored durably, and can be played back from the application page
**Depends on**: Phase 34
**Requirements**: REC-01, REC-02, REC-03, INT-03
**Success Criteria** (what must be TRUE):
  1. When recording is enabled, all participants see a recording consent indicator throughout the call
  2. Completed recordings are stored in Azure Blob Storage with lifecycle rules (Hot to Cool at 30 days, 90-day retention)
  3. User can play back a recording from the application page
  4. An `interview.recording_ready` RabbitMQ event is published when a recording completes, enabling downstream processing
**Plans**: TBD

### Phase 37: AI Pipeline
**Goal**: Completed interview recordings are automatically transcribed and summarized, with summaries posted as application notes
**Depends on**: Phase 36
**Requirements**: AI-01, AI-02, AI-03
**Success Criteria** (what must be TRUE):
  1. After a recording completes, ai-service transcribes it asynchronously via Whisper without manual trigger
  2. The transcript is summarized into a structured format (key points, strengths, concerns, overall impression)
  3. The AI summary is auto-posted as an `interview_summary` note on the application, visible in application notes
**Plans**: TBD

### Phase 38: Panel, Notes & Polish
**Goal**: The interview experience supports multi-party calls, screen sharing, in-call note-taking, and a dedicated interviews tab with full history
**Depends on**: Phase 35, Phase 37
**Requirements**: ROOM-03, ROOM-04, INT-01, INT-02, INT-04
**Success Criteria** (what must be TRUE):
  1. User can conduct a panel interview with 3-6+ simultaneous participants
  2. Any participant can share their screen during a video call
  3. Interviewer can take notes in a side panel during the call, which are auto-saved and posted to application notes when the call ends
  4. Application detail page has a dedicated interviews tab showing all interviews chronologically with status, recordings, transcripts, and summaries
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 33 -> 34 -> 35 -> 36 -> 37 -> 38

Note: Phase 35 (Scheduling) depends on Phase 34. Phase 36 (Recording) depends on Phase 34 but is independent of Phase 35, so they could theoretically run in parallel. Phase 37 (AI) depends on Phase 36. Phase 38 depends on Phases 35 and 37.

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
| 35. Scheduling & Notifications | v9.0 | 0/10 | Pending | — |
| 36. Recording & Playback | v9.0 | 0/TBD | Pending | — |
| 37. AI Pipeline | v9.0 | 0/TBD | Pending | — |
| 38. Panel, Notes & Polish | v9.0 | 0/TBD | Pending | — |
