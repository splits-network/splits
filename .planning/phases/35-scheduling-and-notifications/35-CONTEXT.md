# Phase 35: Scheduling & Notifications - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can schedule, reschedule, and cancel interviews with Google Calendar and Microsoft Outlook sync. All participants are notified at every step via email and in-app notifications. Extends the existing ScheduleInterviewModal and calendar page — not building from scratch.

</domain>

<decisions>
## Implementation Decisions

### Scheduling flow
- Extend the existing `ScheduleInterviewModal` (3-step wizard) — not a new UI
- Add ability to schedule interviews from the calendar page (`/portal/calendar`) via clicking empty time slots or the "New Event" button
- Calendar page slot-click opens the existing `CreateEventModal` with a new "Link to application" toggle — when linked, event becomes an interview
- Application search supports both candidate name and job title, scoped to company-wide applications (not just the user's own)
- Linking to an application auto-switches event type to "Interview" and creates an interviews DB record if Splits Network Video is chosen
- Meeting platform choice: Google Meet, Microsoft Teams, or Splits Network Video (LiveKit). Only Splits Network Video creates an interviews DB record
- Default interview duration: 30 minutes (user can change)
- Interview title: always auto-generated ("Interview: [Candidate Name] - [Job Title]"), not user-editable
- Calendar event description: rich details (job title, candidate name, application link, join link, notes) — same for all attendees
- Candidate email auto-added as attendee; user can add more interviewers
- Pre-filled time from slot click is adjustable in the modal
- Multiple interviews allowed per application (multi-round hiring)
- Block scheduling for applications in terminal states (rejected, hired, withdrawn)
- Scheduling is one-at-a-time, no bulk scheduling
- Interview events on calendar: distinct styling (unique color/icon) to differentiate from regular events
- Calendar event detail panel: rich interview info (candidate, job, join button, reschedule/cancel actions)
- "Join Interview" button available directly on calendar events (not just application page) when call window is active

### Reschedule & cancellation
- Reschedule: pre-filled modal with current details, user changes what they need
- Cancellation: confirmation dialog with optional reason field; reason included in notifications
- Cancel/reschedule available from both application detail page and calendar page
- Both candidates and interviewers can request reschedule
- Candidate reschedule: available via link in confirmation email AND on the prep page
- Candidate proposes 2-3 preferred time slots from a list of interviewer's available slots (30-min increments, next 2 weeks, candidate's local timezone)
- Limit: candidates can request reschedule max 2 times, then option is removed
- Original interview time stays until interviewer accepts a new time ("Reschedule requested" badge shown)

### Calendar integration
- Both Google Calendar and Microsoft Outlook fully supported from the start
- Scheduling allowed without a connected calendar (DB-only mode with .ics file attachment in confirmation email)
- Free/busy checks primary interviewer only (not all attendees — panel is Phase 38)
- Calendar sync-back via webhooks: time changes and cancellations sync from external calendar to interview record
- External calendar event deletion auto-cancels the interview record and notifies participants
- Calendar selection for free/busy: configured on integrations page (`/portal/integrations`), not in the scheduling modal
- Default: primary calendar only included for free/busy; user opts in to additional calendars
- Working hours: configurable on integrations page — same hours every day, user selects which days are working days (no preset Mon-Fri default)
- No minimum booking notice, no buffer between interviews
- Available slots shown as a list in 30-min increments (not a visual grid)

### Stage trigger behavior
- Moving application to "interview" stage: toast notification ("Don't forget to schedule an interview") with link to schedule — appears once on stage change only
- Stage change always allowed regardless of calendar connection status
- No other stage transitions trigger interview behavior
- Application stage stays on "interview" after call ends — user advances manually
- Scheduling from calendar page: if application isn't at "interview" stage, prompt "Move to interview stage?"
- Cancelled interview has no effect on application stage

### Notification design
- Channels: email + in-app for all notification types
- Reminders: 24 hours, 1 hour, and 10 minutes before the interview — all via both email and in-app
- 10-minute reminder: includes prominent "Join Now" CTA linking to video call or meeting link
- Reminders sent for all meeting platforms (Google Meet, Teams, and Splits Network Video)
- In-app notifications: show countdown ("Interview in 55 minutes", "Interview starting now")
- Candidate emails: rich with prep info (date/time, job title, company name, interviewer name, join link, prep page link)
- Interviewer emails: different content — includes candidate name, resume link, application link, job details
- Reschedule request from candidate: immediate email + in-app notification to interviewer
- Reschedule acceptance: full confirmation email to candidate with updated details
- Cancellation notification: includes reason if one was provided
- Interview notifications use the existing in-app notification system (no separate section)
- All emails: Splits Network branded (not company-branded)

### Claude's Discretion
- Webhook implementation details for calendar sync-back (Google vs Microsoft webhook APIs)
- .ics file generation approach for no-calendar mode
- Toast notification component choice and positioning
- Available slot calculation algorithm
- In-app countdown implementation (polling vs real-time)
- Email template layout and exact copy
- Reschedule request form design

</decisions>

<specifics>
## Specific Ideas

- Existing `ScheduleInterviewModal` at `apps/portal/src/components/basel/scheduling/schedule-interview-modal.tsx` is the starting point — extend it
- Existing `CreateEventModal` at `apps/portal/src/components/basel/calendar/create-event-modal.tsx` gains "Link to application" feature
- Calendar page at `/portal/calendar` already exists with week/agenda views — add slot-click scheduling
- Calendar integration config belongs on `/portal/integrations` page, not in scheduling modals
- The existing `useScheduledInterview` hook already detects scheduled interviews for applications

</specifics>

<deferred>
## Deferred Ideas

- Robust per-user notification preferences (toggle individual notification types) — future milestone
- Company-branded interview emails — future phase
- Panel interview scheduling with multi-attendee free/busy — Phase 38
- Bulk interview scheduling — not planned

</deferred>

---

*Phase: 35-scheduling-and-notifications*
*Context gathered: 2026-03-07*
