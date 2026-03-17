# Phase 44: Recruiter-Company Calls & Portal Integration - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Recruiters and company contacts can initiate, schedule, and conduct video calls with each other, with calls linked to companies and/or jobs. The portal gets a top-level "Calls" section for browsing all call types (including interviews) with filtering, detail views, and entity-scoped call tabs. Notifications cover the full call lifecycle. AI pipeline generalization and interview migration are separate phases (45, 46).

</domain>

<decisions>
## Implementation Decisions

### Call initiation flow
- Available from both job detail pages and company detail pages
- Also accessible from a global action in the chat widget header (list header when no active chat, active chat header when chatting)
- From entity pages: smart defaults pre-fill entity link and suggest known contacts
- From chat widget: pre-fills with chat recipient; from chat list header: blank form
- Participant picker: select from existing company contacts OR enter email for someone not in system
- New email contacts: prompted to create account, but magic link provided regardless
- Both instant ("Call Now") and scheduled calls supported
- Both recruiters AND business users can initiate calls
- Business users can search any recruiter (not limited to matched recruiters)
- Business users can link calls to their company or pick one of their jobs
- Multi-participant supported (not limited to 1:1)
- Call creation UI: modal/drawer overlay (stays in context of current page)
- Entity linking optional when initiated from global action or chat
- Instant calls: recruiter redirected to video app immediately; other participants notified via email + in-app notification
- Quick confirmation step before instant call starts ("Call [Name]?")
- Show online/offline status using existing presence system in call modal
- Reschedule/cancel: only the person who scheduled can reschedule or cancel
- Reschedule auto-updates — no confirmation step, new time communicated directly

### Scheduling
- Slot-based scheduling from Google Calendar availability (both participants' calendars)
- Falls back to free-form date/time picker if either participant hasn't connected Google Calendar
- Duration field: 15 / 30 / 45 / 60 min options (no hard cutoff, shown in calendar event)
- Optional agenda/notes field included in scheduling modal — text included in confirmation email
- Google Calendar event created for both parties with magic link join URL
- Calendar events auto-synced: reschedule updates event, cancel deletes event
- "Join Call" button appears ~5 min before scheduled time in portal
- Pre-call notes: scheduler can add private notes/talking points visible only to them

### Call tags/labels
- Optional purpose tags beyond call_type: intro, check-in, negotiation, etc.
- Tags set at creation time only (not editable after)
- Tags filterable in call list

### In-call context panel
- Three tabs: Context | Chat | History
- Collapsible panel (toggle to show/hide), open by default on desktop
- Panel remembers last active tab per user (persisted preference)
- **Context tab**: company info (name, logo, industry, size, contacts), job details (if job-linked), active job count/open positions for the company, pre-call agenda (scheduler-only editable), job summary stats
- **Chat tab**: uses existing real-time chat infrastructure — same messaging thread, not a separate call-scoped chat
- When initiated from chat: call inherits chat's entity context (candidates, recruiters, applications linked to the chat)
- **History tab**: recent interactions (last 5-10) with "View all" link
- Role-aware content: panel adapts based on viewer's role (Claude's discretion on specifics)
- Magic-link guests: reduced panel — Chat tab only, no entity context or history
- Read-only entity info (no quick-edit from panel)
- Video controls (screen share, mute, camera) stay in bottom video controls bar only
- No entity link: prompt to optionally link, fall back to participant profiles if declined
- Shared chat components across all apps (when attachment support added, propagates everywhere)

### Post-call experience
- Post-call summary screen in video app: duration, participants, link to recording (when ready)
- "Schedule follow-up" action on post-call summary (same participants/entity pre-filled)
- "View in Portal" link to call detail page

### Call history & detail views
- Top-level "Calls" sidebar item in portal navigation (both recruiters and business users)
- Uses existing standard list pattern (table/grid/split views) — reference: roles feature
- Unified list: interviews and recruiting calls together, filterable by type
- Mixed list with status filter (upcoming and past calls in same list)
- Filters: call type, date range, entity (company/job), status, tags (purpose labels)
- Text search: filter by participant name, entity name, or agenda content
- Stats overview at top: upcoming calls count, calls this week/month, avg call duration, calls needing follow-up
- Role-scoped: each role sees calls relevant to them (filtered by participation and entity access)
- Entity-scoped call tabs on company and job detail pages (full list with filters, not simplified)
- Detail view: tabs for Recording | Transcript | Summary, with side panel showing entity context
- Synced playback: click transcript line jumps to that timestamp in recording
- AI summary includes extractable action items that can be converted to tasks
- Follow-up tracking: AI action items + manual "needs follow-up" flag (both)
- Post-call notes: separate section for participant reflections after the call (visibility: Claude's discretion)
- Participant attendance details: join/leave times, duration per participant
- Related calls section: shows other calls with same participants or entity
- Processing indicator for pending recording/summary ("Recording processing...", "Summary generating...")
- Post-call summary links directly to portal detail view
- Missed calls: just a status value, no special prominence
- Tags: set at creation, filterable, not editable after
- No export functionality for now
- Admin app: all-platform call visibility with moderation tools (flag, review, take action)

### Notifications
- Brand-aware emails using existing notification service
- **Scheduled call confirmation**: date/time + timezone, participant names, entity context, agenda (if provided), direct join button + portal link
- **Reminders**: simplified — "Your call with [Name] is in [time]" + join button (24h and 1h before)
- **5-min "starting soon"**: in-app toast with Join button
- **Instant call notification**: email + in-app; toast with Accept/Decline buttons; urgency level: Claude's discretion
- **Decline notification**: caller notified when someone declines
- **Join notification**: toast when another participant joins a scheduled call
- **Timeout**: unanswered instant calls auto-marked as missed after timeout (Claude picks duration)
- **No-show detection**: auto-mark as no-show after grace period for scheduled calls, notify both participants
- **Reschedule**: email with new time directly (no confirmation step), calendar event auto-updated
- **Cancellation**: who cancelled + optional reason (Claude's discretion on reason field)
- **Recording/summary ready**: email + in-app notification with link to detail view (no summary preview in email, just link)
- No immediate post-call email — only notify when recording/summary ready
- Magic-link guests: same notification cadence as authenticated users
- Fixed notification defaults — no user configuration
- In-app + email only (no browser push)
- Channels: notification bell + toast for time-sensitive events (instant calls, starting soon, participant joined)

### Claude's Discretion
- Call rate limiting approach (if any)
- Chat-to-call context linking (whether call record links back to originating chat thread)
- Instant call urgency level in notifications
- Role-aware content specifics (what each role sees in Context tab)
- History tab scope (calls only vs all interactions)
- Post-call notes visibility (private vs shared)
- In-call quick actions (schedule follow-up, tag call)
- Hover preview on call list items
- Bulk actions on call list
- Call sharing with team members
- Cancellation reason field inclusion
- Instant call timeout duration
- No-show grace period duration

</decisions>

<specifics>
## Specific Ideas

- Chat widget header is the global call action point — "Call Now" icon in chat list header AND in active chat header (different defaults: blank form vs pre-filled with chat recipient)
- Chat system's existing context (linked candidates, recruiters, applications) flows into call context automatically when call initiated from chat — no re-linking needed
- In-call chat IS the regular messaging thread — messages before, during, and after the call all in one place
- Shared chat components across apps — when attachment support is added later, it propagates to video app too
- Use existing presence components to show online/offline status in call modal
- Use existing standard list pattern (table/grid/split views) from roles feature as reference for call list
- Existing notification service handles brand-aware email delivery
- Existing real-time chat infrastructure reused in video app panel

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 44-recruiter-company-calls-portal-integration*
*Context gathered: 2026-03-08*
