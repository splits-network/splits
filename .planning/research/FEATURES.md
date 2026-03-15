# Feature Research: Video Interviewing for Recruiting Platform

**Domain:** In-app video interviewing for split-fee recruiting marketplace
**Researched:** 2026-03-07
**Confidence:** HIGH (well-understood domain, extensive industry precedent)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 1:1 video calls | Core function of video interviewing | HIGH | WebRTC or provider SDK required; this is the hardest single feature. Use a managed provider, not DIY. |
| Join via magic link (no account required) | Candidates should never need to create an account just to interview | MEDIUM | Token-based auth separate from Clerk. Candidate portal already exists but magic links serve external/new candidates. |
| Join from within the app (authenticated) | Recruiters, hiring managers expect seamless in-app join | LOW | Wraps the same video room in an authenticated context. |
| Calendar event creation with video link | Scheduling must produce a calendar event with a join URL | LOW | Already partially built via `schedule-interview-modal.tsx` and Google Calendar integration. Enhance to also create interview DB record. |
| Email notifications for scheduled interviews | Participants need confirmation emails with join links and times | LOW | Resend infrastructure already exists. Add interview-specific templates. |
| Interview recording | Recruiters expect to record for review; candidates expect to be notified of recording | MEDIUM | Requires server-side recording via provider API. Storage costs are real -- plan for them. |
| Recording playback | Useless to record if you cannot play it back | LOW | Video player component pointing at stored recording URL. |
| Interview status tracking | Users need to see: scheduled, in-progress, completed, cancelled, no-show | LOW | New `interviews` table with status enum. Mirrors existing stage patterns in the codebase. |
| Time zone handling | Participants are often in different time zones; scheduling must display correctly | LOW | Already handled in calendar context via `Intl.DateTimeFormat`. Extend to interview display. |
| Duration selection | Interviews have standard durations (30m, 45m, 60m, 90m) | LOW | Already built in `schedule-interview-modal.tsx`. |
| Cancellation and rescheduling | Interviews get moved constantly; must support cancel + reschedule flows | MEDIUM | Calendar event update/delete + notification cascade + status update. |
| Multiple attendees (panel interviews) | Panel interviews are standard in recruiting (hiring manager + team members) | MEDIUM | Room must support 3-6+ simultaneous video streams. Scales complexity of both UI and provider costs. |
| Waiting room / lobby | Interviewers often join late or need prep time; candidates should not see an empty room | LOW | Most managed video providers support this natively. |
| Microphone and camera controls | Mute, camera off, device selection | LOW | Standard WebRTC controls. Every video provider SDK includes these out of the box. |
| Screen sharing | Interviewers present job details; candidates may demo work | MEDIUM | Requires `getDisplayMedia` API. Provider-dependent complexity. |
| Connection quality indicator | Users need to know if their connection is degrading before it drops | LOW | Most video SDKs expose connection stats. Display as simple icon/indicator. |
| Pre-call device check | "Test your camera and mic" before entering the room | MEDIUM | Standalone component that tests media devices before joining. Prevents "can you hear me?" loops. |

### Differentiators (Competitive Advantage)

Features that set the product apart in recruiting context. Not required but highly valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI transcription of interviews | Eliminates manual note-taking. Creates searchable record. Enables AI summary. | HIGH | Requires speech-to-text pipeline (Deepgram, AssemblyAI, or OpenAI Whisper). Process async from recording for accuracy and cost. |
| AI interview summary | Distills 60-minute interview into structured summary: key points, concerns, strengths, overall impression | MEDIUM | Depends on transcription. Use GPT/Claude to summarize transcript. `ai-service` already exists with similar patterns. |
| Summary auto-posted as application note | Summary flows into existing workflow without extra clicks. Reviewers see it in context alongside other notes. | LOW | Write to `application_notes` with new `note_type` value (e.g., `interview_summary`). Existing table and creation flow. Requires migration to add enum value. |
| Dedicated interviews tab on application detail | All interview history in one place: scheduled, completed, recordings, transcripts, summaries | MEDIUM | New UI tab + backend endpoint. Aggregates interview records for an application. |
| Stage-triggered scheduling | Moving an application to "interview" stage automatically prompts scheduling | LOW | Hook into existing stage transition flow in `actions-toolbar.tsx`. Show schedule modal when stage changes to `interview`. |
| Interviewer notes during call | Real-time note-taking panel alongside video, saved to application on call end | MEDIUM | Textarea synced to backend. Auto-saved periodically. Posted as application note when call ends. |
| Interview scorecard / structured rating | Configurable evaluation form (communication, technical, culture fit) with numeric ratings | MEDIUM | Configurable per-company or per-job. Stored alongside interview record. Enables comparison across candidates. |
| Automated reminder emails | 24h and 1h reminders before interview with join link and prep details | LOW | Scheduled jobs via existing aftercare reminder pattern. Resend templates. |
| Interview feedback request | After interview completes, prompt interviewer(s) to submit structured feedback | LOW | RabbitMQ event on interview completion triggers notification to interviewers. |
| Calendar availability checking | Show interviewer's free/busy slots when scheduling to avoid double-booking | MEDIUM | Already have calendar read access via Google combo provider. Surface busy times in scheduling UI. |
| Multi-round interview tracking | Track Interview 1 (Phone Screen), Interview 2 (Technical), etc. as separate records under same application | LOW | Multiple interview records per application_id. UI shows chronological list with round labels. |
| Candidate interview prep page | Landing page for candidates with job details, interviewer info, company overview, what to expect | LOW | Candidate portal (`apps/candidate`) already exists. Add interview prep route accessible via magic link. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Explicitly do NOT build these in v1.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Custom-built video infrastructure (DIY WebRTC) | "We want full control over the video stack" | WebRTC at scale is enormously complex: TURN/STUN servers, SFU architecture, codec negotiation, NAT traversal, bandwidth adaptation, cross-browser compatibility. Companies like Daily, Twilio, and Vonage have 50+ engineers working on this full-time. Building in-house is a multi-year undertaking. | Use a managed video provider (Daily.co, LiveKit Cloud, Twilio Video, 100ms). Pay per-minute, get reliability, scalability, and cross-platform support for free. |
| One-way / async video interviews | "Candidates record answers to preset questions on their own time" | Universally disliked by candidates. Creates impersonal experience. Increases application drop-off rates by 30-50% (widely reported in recruiting industry). Major ATS platforms have deprioritized or removed these features. Damages employer brand. | Stick to live video interviews. If async feedback is needed, use the existing application notes system. If async video is demanded later, build as a clearly separate, optional feature -- never as the default. |
| Real-time AI coaching during interview | "Give the interviewer live suggestions or talking points" | Ethically questionable. Legally risky in jurisdictions with recording/monitoring laws. Creates distraction for interviewer. Candidates would be uncomfortable if they knew. Undermines the human element of interviewing. | Provide AI summary AFTER the interview is completed. Keep the live interaction authentically human. |
| Custom video quality / 4K streaming | "We want crystal clear 4K video" | Diminishing returns past 720p for talking-head interviews. Bandwidth costs explode (4K is ~16x the data of 720p). Mobile users on cellular data suffer. Forces minimum bandwidth requirements that exclude candidates with poor internet. | Let the managed video provider handle adaptive bitrate. 720p default with automatic quality adjustment is the industry standard. |
| Scheduling without calendar integration | "Just let users pick a time slot from a list" | Creates calendar conflicts and double-bookings. Interviewers already live in Google Calendar or Outlook. Disconnected scheduling means they check two systems. Every standalone scheduler eventually gets abandoned for "just send a calendar invite." | Always create calendar events. If no calendar connected, prompt to connect before scheduling. Already enforced in current `schedule-interview-modal.tsx` design. |
| Unlimited recording storage | "Store all recordings forever" | Video storage costs grow unboundedly. A 60-minute 720p recording is ~500MB-1GB. 1,000 interviews = 500GB-1TB. At cloud storage rates ($0.02-0.03/GB/month), this reaches $10-30/month per 1,000 interviews, compounding monthly. Compliance risk: storing candidate video indefinitely creates GDPR/CCPA exposure. | Set retention policy: 90 days default (configurable per company). Archive to cold storage after retention period. Auto-delete after 1 year unless specifically flagged for retention. Warn users before deletion. |
| Live transcription displayed to all participants | "Show real-time captions during the interview" | Latency and accuracy issues create distraction. Misheard words displayed live undermine conversational flow. Real-time STT is significantly more expensive than async processing. Accuracy at ~85-90% real-time vs ~95-98% async creates a worse experience. | Transcribe asynchronously from the recording after the interview ends. Much higher accuracy, lower cost. Offer live captions ONLY as an opt-in accessibility feature if needed. |
| Built-in whiteboard or code editor | "Technical interviews need collaborative coding" | Massive scope increase. Collaborative code editors are their own product category (CoderPad, HackerRank, CodeSandbox). Quality expectations are set by these dedicated tools. Building even a basic version takes months. | Support screen sharing as the low-cost alternative for technical discussions. For structured coding interviews, link to or integrate with existing tools (CoderPad, HackerRank) in the interview description. Revisit in v2+ only if clear demand. |

## Feature Dependencies

```
[Google Calendar Integration] (EXISTING)
    |
    v
[Interview Scheduling] (enhance schedule-interview-modal)
    |
    +---> [Calendar Event Creation] (EXISTING, add interview DB record)
    +---> [Email Notifications] (EXISTING Resend infra, new templates)
    +---> [Automated Reminders] (scheduled jobs)
    |
    v
[Video Room Infrastructure] (managed provider SDK integration)
    |
    +---> [Magic Link Join] (token-based, no-auth access)
    +---> [In-App Join] (authenticated access)
    +---> [Panel Support] (multi-participant rooms)
    +---> [Waiting Room / Lobby]
    +---> [Screen Sharing]
    +---> [Pre-Call Device Check]
    +---> [Basic Controls] (mute, camera, leave)
    |
    v
[Recording] (server-side via provider API)
    |
    v
[Recording Storage] (S3/GCS + retention policy)
    |
    v
[AI Transcription] (async speech-to-text processing)
    |
    v
[AI Summary Generation] (transcript -> structured summary)
    |
    v
[Application Note Integration] (EXISTING table, new note_type)

[Application Stage Management] (EXISTING)
    |
    +---> [Stage-Triggered Scheduling] (hook into 'interview' stage transition)

[Interview Status Tracking] (new interviews table)
    +---> [Dedicated Interviews Tab on Application]
    +---> [Multi-Round Interview Tracking]
```

### Dependency Notes

- **Interview Scheduling requires Calendar Integration:** Already built. The `schedule-interview-modal.tsx` creates Google Calendar events with video conference links. Enhancement needed: also create an `interviews` record in the Splits DB alongside the calendar event, linking interview to application.
- **AI Transcription requires Recording:** Cannot transcribe without recorded audio. Recording is a hard prerequisite. The transcription pipeline should be triggered by a RabbitMQ event when recording becomes available.
- **AI Summary requires Transcription:** Summary is generated from transcript text, not directly from audio. This is a sequential dependency.
- **Application Note Integration requires AI Summary:** The summary text is what gets posted as a note. Low complexity because `application_notes` table and creation flow already exist. Requires adding `interview_summary` to the `ApplicationNoteType` enum (migration + shared-types update).
- **Stage-Triggered Scheduling requires Stage Management:** Already built. When an application moves to the `interview` stage via `actions-toolbar.tsx`, trigger the schedule-interview modal or display a prompt. The stage transition machinery is established.
- **Magic Link Join requires Video Room:** The magic link resolves to a video room. Room must exist first.
- **Panel Support requires Video Room:** Multi-participant is a room capacity configuration, not a fundamentally separate feature.
- **Interviews Tab requires Interview Status Tracking:** Need interview records with statuses before you can render a meaningful tab.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed for "we have video interviewing."

- [ ] **Interview scheduling with calendar sync** -- Enhance existing `schedule-interview-modal.tsx` to also create an `interviews` table record. Link interview to application via `application_id`.
- [ ] **Video room (1:1)** -- Integrate a managed video provider. Room creation via backend service, join via frontend SDK component.
- [ ] **Magic link join (no account)** -- Token-based URL that grants room access without Clerk authentication. Embedded in calendar invite and confirmation email.
- [ ] **In-app join (authenticated)** -- "Join Interview" button on application detail page and calendar event. Authenticated via Clerk.
- [ ] **Basic controls** -- Mute, camera toggle, leave call, device selection. All provided by video provider SDK.
- [ ] **Waiting room** -- Candidate waits until interviewer admits them. Prevents awkward empty-room experience.
- [ ] **Recording** -- Server-side recording via provider API. Store in cloud storage (S3 or GCS). Save recording URL to interview record.
- [ ] **Recording playback** -- Video player on interview detail showing the recording.
- [ ] **Interview status tracking** -- New `interviews` table with status enum: `scheduled`, `in_progress`, `completed`, `cancelled`, `no_show`. Update status via webhooks from video provider.
- [ ] **Email notifications** -- Interview scheduled confirmation, interview reminder (24h before), interview cancelled. Use existing Resend infrastructure with new templates.
- [ ] **Interview section on application detail** -- Show interview info (date/time, status, join link, recording) on application detail page. Can be a section rather than a full tab for v1.
- [ ] **Stage-triggered scheduling** -- When application moves to `interview` stage, prompt the user to schedule an interview. Integrate with existing `actions-toolbar.tsx` flow.

### Add After Validation (v1.x)

Features to add once core video interviewing is working and seeing adoption.

- [ ] **Panel interviews (3+ participants)** -- Upgrade room capacity. Add multi-attendee scheduling UI with multiple email inputs. Trigger: users request panel support for hiring committee interviews.
- [ ] **AI transcription** -- Process recordings through speech-to-text service (Deepgram or AssemblyAI). Store transcript alongside interview record. Trigger: recordings are being actively used and users want searchable content.
- [ ] **AI summary + application note posting** -- Summarize transcript into structured format, auto-post as `interview_summary` note type to `application_notes`. Trigger: transcription is working.
- [ ] **Dedicated interviews tab** -- Full tab on application detail showing all interviews chronologically with recordings, transcripts, summaries. Trigger: multiple interviews per application becoming common.
- [ ] **Screen sharing** -- Enable display sharing in video rooms. Trigger: user feedback requesting it for technical discussions.
- [ ] **Pre-call device check** -- Test camera/mic/speaker before joining room. Reduces "can you hear me?" issues. Trigger: support tickets about audio/video problems.
- [ ] **Interviewer notes during call** -- Side panel for real-time note-taking, auto-saved, posted to application notes on call end. Trigger: users requesting in-call note-taking instead of using separate tools.
- [ ] **Calendar availability checking** -- Show interviewer's free/busy slots in the scheduling UI. Trigger: scheduling conflict complaints.
- [ ] **Automated 1h reminders** -- Add 1-hour reminder in addition to 24h. Trigger: no-show rate data.
- [ ] **Cancellation and rescheduling flow** -- Full cancel/reschedule workflow with calendar event update, notification cascade, and status update. Trigger: manual workarounds becoming painful.

### Future Consideration (v2+)

Features to defer until video interviewing product-market fit is established.

- [ ] **Interview scorecard / structured evaluation** -- Configurable rating forms per job or company. Defer: requires company-specific customization, significant UI design, and scoring system.
- [ ] **Multi-round interview tracking with labels** -- Named interview rounds (Phone Screen, Technical, Cultural Fit). Defer: v1 can track multiple interviews per application without formal round naming.
- [ ] **Candidate interview prep page** -- Landing page with job details, interviewer bios, company info, tips. Defer: nice-to-have, not blocking adoption.
- [ ] **Interview feedback request automation** -- Auto-prompt interviewers for structured feedback after call ends. Defer: more valuable with scorecard system.
- [ ] **Interview analytics dashboard** -- Average interview duration, time-to-schedule, no-show rates, interviews-per-hire. Defer: need data volume first.
- [ ] **Live captions (accessibility)** -- Real-time speech-to-text displayed as captions during call. Defer: requires real-time STT which is more complex and expensive than async processing.
- [ ] **Interview scheduling links (self-service)** -- Recruiter shares a link, candidate picks from available slots. Defer: Calendly-like functionality is a significant product in itself.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Video room (1:1) | HIGH | HIGH | P1 |
| Interview scheduling + calendar | HIGH | LOW | P1 |
| Magic link join | HIGH | MEDIUM | P1 |
| In-app join | HIGH | LOW | P1 |
| Recording | HIGH | MEDIUM | P1 |
| Recording playback | MEDIUM | LOW | P1 |
| Interview status tracking | HIGH | LOW | P1 |
| Email notifications (scheduled, reminder, cancelled) | HIGH | LOW | P1 |
| Waiting room | MEDIUM | LOW | P1 |
| Basic controls (mute, camera, leave) | HIGH | LOW | P1 |
| Stage-triggered scheduling | MEDIUM | LOW | P1 |
| Interview section on application detail | MEDIUM | LOW | P1 |
| Panel interviews | HIGH | MEDIUM | P2 |
| AI transcription | HIGH | HIGH | P2 |
| AI summary + app note | HIGH | MEDIUM | P2 |
| Screen sharing | MEDIUM | LOW | P2 |
| Pre-call device check | MEDIUM | MEDIUM | P2 |
| Cancel/reschedule flow | MEDIUM | MEDIUM | P2 |
| Automated reminders (1h) | MEDIUM | LOW | P2 |
| Interviewer notes during call | MEDIUM | MEDIUM | P2 |
| Dedicated interviews tab | MEDIUM | MEDIUM | P2 |
| Calendar availability | MEDIUM | MEDIUM | P2 |
| Interview scorecard | MEDIUM | HIGH | P3 |
| Multi-round tracking with labels | LOW | LOW | P3 |
| Candidate prep page | LOW | LOW | P3 |
| Interview analytics | LOW | MEDIUM | P3 |
| Live captions | LOW | HIGH | P3 |
| Self-service scheduling links | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch -- core video interviewing loop
- P2: Should have, add once core is adopted -- enhances value significantly
- P3: Nice to have, future consideration -- valuable but not blocking adoption

## Competitor Feature Analysis

| Feature | Greenhouse | Lever | BreezyHR | Spark Hire | Our Approach |
|---------|-----------|-------|----------|-----------|--------------|
| Live video interviews | Via Zoom/Teams integration (no native) | Via integrations only | Native in-app video | Native video (live + one-way) | Native in-app video rooms via managed provider |
| Calendar sync | Google + Outlook | Google + Outlook | Google + Outlook | Google + Outlook | Google (built), Outlook (future) |
| Interview scheduling | Self-scheduling links, coordinator workflows | Coordinator workflows | Built-in scheduler | Built-in scheduler | Calendar-integrated scheduling with stage triggers |
| Recording | Depends on Zoom/Teams | Depends on integration | Yes (native) | Yes (native) | Server-side via provider API |
| AI transcription | Via add-ons (Metaview, BrightHire) | Via add-ons | No native | No native | Built-in async transcription |
| AI summary | Via add-ons (BrightHire, Metaview) | Via add-ons | No | No | Built-in, auto-posted as application note |
| Scorecards | Yes (structured, configurable) | Yes (structured) | Yes (basic) | Yes (basic) | Deferred to v2 |
| Panel support | Via Zoom/Teams | Via integrations | Yes | Limited | v1.x (post-launch) |
| Magic link (no account needed) | N/A (uses Zoom/Teams links) | N/A | Yes | Yes | Yes -- core feature |
| Candidate prep | Limited | Limited | No | No | Deferred to v2 |
| One-way (async) video | No | No | No | Yes (core feature) | Explicitly not building (anti-feature) |

**Key competitive insight:** Most enterprise ATS platforms (Greenhouse, Lever) do NOT have native video. They rely on Zoom/Teams integrations, which means the video experience is fragmented -- users leave the ATS to conduct interviews, then manually sync notes back. Building native video with integrated recording, AI transcription, and automatic application note posting is a genuine differentiator. The user never leaves Splits Network. BreezyHR is the closest competitor with native video but lacks AI features. Spark Hire has native video but focuses heavily on one-way interviews (which candidates dislike).

## Integration Points with Existing Splits Network Features

These existing features directly support or are impacted by video interviewing:

| Existing Feature | How It Integrates | Dependencies |
|-----------------|-------------------|--------------|
| Application stages (`interview` stage) | Stage transition to `interview` triggers scheduling prompt | `actions-toolbar.tsx`, stage management |
| Google Calendar combo provider | Calendar event creation already works. Enhance to create interview DB record alongside calendar event. | `schedule-interview-modal.tsx`, integration service |
| `application_notes` table | AI summaries post here as new `interview_summary` note type | Migration to add enum value, `ApplicationNoteType` in shared-types |
| RabbitMQ event system | Interview lifecycle events (scheduled, started, completed, recording_ready) flow through existing event infrastructure | Event publisher/consumer patterns |
| Resend email infrastructure | Interview notification templates use existing email pipeline | Notification service, email templates |
| `ai-service` | Transcription processing and summary generation extend existing AI service | New consumer for `interview.recording_ready` events |
| `actions-toolbar.tsx` | "Schedule Interview" action button, "Join Interview" button | Application detail page |
| Candidate portal (`apps/candidate`) | Magic link interview join routes through candidate app (or standalone route) | Candidate app routing |
| In-app notifications | Interview reminders, status updates via existing notification system | Notification service |
| `CalendarProvider` context | Interview events appear in calendar views alongside other events | Calendar components |

## Sources

**Codebase analysis (HIGH confidence):**
- `apps/portal/src/components/basel/scheduling/schedule-interview-modal.tsx` -- existing scheduling wizard
- `apps/portal/src/components/basel/calendar/calendar-context.tsx` -- calendar integration patterns
- `packages/shared-types/src/models.ts` -- `ApplicationStage`, `ApplicationNoteType` enums
- `services/ai-service/src/index.ts` -- AI service architecture and capabilities
- `apps/portal/src/app/portal/applications/components/shared/actions-toolbar.tsx` -- stage transition UI

**Domain expertise (HIGH confidence):**
- Video interviewing in recruiting is a well-established domain with clear feature expectations
- Managed video provider integration patterns are well-documented
- AI transcription and summarization are proven patterns in recruiting tools

**Industry knowledge (MEDIUM confidence -- based on training data, not verified against current product pages):**
- Greenhouse, Lever, BreezyHR, Spark Hire feature sets
- Candidate preferences regarding one-way vs live video interviews
- Recording storage cost estimates
- Drop-off rates for one-way video interviews

---
*Feature research for: Video Interviewing in Recruiting Platform*
*Researched: 2026-03-07*
