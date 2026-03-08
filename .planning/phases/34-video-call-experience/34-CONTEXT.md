# Phase 34: Video Call Experience - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

1:1 video interview experience within the app. Users can join from the application detail page (authenticated) or via magic link (candidates). Includes pre-join lobby with device setup, the in-call video interface, and a candidate prep page. Screen sharing, panel interviews, in-call notes, and a dedicated interviews tab are Phase 38. Recording is Phase 36. Scheduling is Phase 35.

</domain>

<decisions>
## Implementation Decisions

### Pre-join lobby
- Split layout: camera preview on one side, meeting info + controls on the other (Zoom-style)
- Show full interview context: job title, company name, interviewer name + avatar, scheduled time, candidate name, interview type (if set), expected duration (if set)
- Camera-off state in lobby: show user's profile avatar + name on dark background
- Inline browser-specific guidance when camera/mic permissions are denied (step-by-step instructions)
- Pulsing ring around camera preview for real-time audio level meter (not bars)
- Show other participant's presence status: "John is waiting" or "John hasn't joined yet" — no video preview of them, status text only
- Show elapsed waiting timer alongside participant status
- Device selection (camera, mic, speaker) available in the lobby
- Device preferences saved to localStorage and pre-selected on next interview
- Prompt user when new device detected mid-lobby ("New device detected. Switch to [device name]?")
- Background blur toggle + 3-4 preset virtual backgrounds + custom upload supported
- Background preference persisted to localStorage across sessions
- Background effects carry over from lobby into the call automatically
- Self-view is mirrored by default with a flip toggle to see how others see you
- Network quality pre-check before joining (good/fair/poor indicator)
- "Join now" button always enabled once device setup is done (no time gate in lobby)
- Quick fade transition from lobby to call (no connecting spinner)
- Browser confirm dialog on tab close during lobby
- Audio-only join allowed if no camera detected
- Listen-only join allowed if no mic detected
- Keyboard shortcuts: M for mute, V for video toggle (same shortcuts carry into call)
- Contextual tips for first-time users (dismiss-able, remembered)
- No pre-call chat in the lobby
- Display name always from profile — not editable in lobby
- Accessibility: respect OS-level settings (prefers-contrast, font size, prefers-reduced-motion)
- Mobile responsive: stacked layout instead of split on small screens

### In-call interface
- Active speaker layout: remote participant large, self-view as small picture-in-picture corner
- Self-view PiP is draggable to any corner
- Self-view can be hidden entirely via a button
- Glowing border on active speaker's video tile when they're talking
- Signal bars icon on each video tile for connection quality
- Camera-off state: show participant's profile avatar + name on dark background
- Controls bar: always visible, bottom center
- Controls: mic toggle, camera toggle, device switcher dropdown, background blur/virtual toggle, fullscreen toggle, leave button
- Background effects changeable mid-call from the controls bar
- In-call timer always visible showing elapsed call duration
- Minimal header bar at top showing job title + participant name
- Side panel text chat (collapsible) — chat messages are persisted and viewable from interview record after call
- Simple emoji reactions that float on screen briefly
- "Reconnecting..." overlay with spinner when someone's connection drops, auto-reconnect in background
- Actionable poor connection banner: "Unstable connection — try turning off your camera"
- Subtle time warning banner at 5 min before scheduled end (if duration set)
- Join/leave notification sounds (distinct chimes for each)
- Leave button requires confirmation dialog: "Are you sure you want to leave this interview?"
- When other participant leaves: "John has left the call" banner — remaining user stays in room
- Auto-update interview status: in_progress when both join, completed when call ends
- Keyboard shortcuts: same as lobby (M, V) consistent throughout
- Mobile responsive: stacked layout on mobile (remote video top, self-view below, controls bottom)
- Browser fullscreen toggle available

### Post-call experience
- Different post-call screens for interviewer vs candidate
- Interviewer post-call: call duration, 1-5 star rating (private, only visible to them), "Back to application" and "Schedule another" actions
- "Back to application" closes call tab and focuses original app tab (which auto-refreshes)
- Candidate post-call: "Thank you" message + call duration, candidate closes tab themselves
- No auto-redirect for candidates

### Candidate prep page
- Full prep page: job title, company name/logo, company description excerpt, interviewer name + photo, scheduled time
- Splits Network branded (not company-branded) — uses built-in light/dark themes
- Interactive tips checklist (checkable items): test mic, find quiet spot, have resume ready
- "Enter Lobby" button enables 10 minutes before scheduled start
- Before lobby access: show all interview info, tips, AND prominent countdown to lobby opening
- Browser compatibility check with green checkmarks (browser, camera, mic support)
- Live status: shows if interviewer is already in the room ("Jane is waiting for you")
- Mobile-first responsive design (candidates may check on phone before switching to desktop)
- Completed interview: show "This interview has ended" with call date/duration
- Cancelled interview: show "This interview has been cancelled. Please contact your recruiter."
- Unsupported browser: show message with supported browser list (Chrome, Firefox, Safari, Edge)

### Join flow & entry points
- Authenticated users: "Join Interview" button on application detail page — rich button showing scheduled time, countdown, becomes prominent when near
- Call opens in a new browser tab — full screen real estate, original app tab remains accessible
- Custom tab title ("Interview - John Doe") and relevant favicon showing call state
- Focus existing tab if user clicks "Join" when call is already open in another tab
- Original app tab shows "In call" badge/indicator, updates when call ends
- Allow rejoin after interview is marked completed (interviewer may need to continue)
- Browser confirm dialog (beforeunload) when closing call tab during active call
- Browser push notification when other person joins (if user is waiting in lobby)
- Magic link expires 24 hours after scheduled interview time
- Track analytics: join time, duration, lateness, no-show status for future reporting

### Claude's Discretion
- Exact self-view PiP size and default position
- Loading/transition states between lobby and call (beyond the "quick fade" decision)
- Exact keyboard shortcut set (beyond M and V)
- Error state UX details (network failure recovery, unsupported browser fallback)
- Speaker test button in lobby (yes/no)
- Help link for technical issues in lobby
- Wait timeout message threshold (how long before suggesting they might not be coming)
- Exact virtual background preset images
- Reaction emoji set
- Chat panel design and layout
- Post-call rating storage mechanism
- Analytics event schema

</decisions>

<specifics>
## Specific Ideas

- Lobby layout inspired by Zoom's split pre-join screen
- Video layout modeled after FaceTime/Zoom default (large remote, small self)
- Pulsing ring audio meter — modern and clean, not bouncing bars
- Prep page countdown creates anticipation without blocking early arrivals
- Waiting room provides reassurance that the system is working
- Self-view mirror toggle addresses common "which way am I facing?" confusion
- Background blur + virtual backgrounds elevate the professional feel
- Persisted chat gives both parties a record of shared links or notes
- Star rating captures immediate interviewer impression while it's fresh

</specifics>

<deferred>
## Deferred Ideas

- Dedicated interviews dashboard/list page — Phase 38 (interviews tab)
- Company-branded prep page (logo, colors) — could revisit in Phase 38 polish
- Screen sharing — Phase 38
- In-call notes panel — Phase 38
- Scheduled backup/retention for chat messages — future consideration
- Multi-round interview tracking UI — Phase 38

</deferred>

---

*Phase: 34-video-call-experience*
*Context gathered: 2026-03-08*
