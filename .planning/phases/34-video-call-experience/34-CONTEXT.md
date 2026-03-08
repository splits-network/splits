# Phase 34: Video Call Experience - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

1:1 video interview experience within the app. Users can join from the application detail page (authenticated) or via magic link (candidates). Includes pre-join lobby with device setup, the in-call video interface, and a candidate prep page. Screen sharing, panel interviews, in-call notes, and a dedicated interviews tab are Phase 38. Recording is Phase 36. Scheduling is Phase 35.

</domain>

<decisions>
## Implementation Decisions

### Pre-join lobby
- Split layout: camera preview on one side, meeting info + controls on the other (Zoom-style)
- Show full interview context: job title, company name, interviewer name + avatar, scheduled time, candidate name
- Mic test via real-time audio level meter (bouncing bars) — no record-and-playback
- Show other participant's presence status: "John is waiting" or "John hasn't joined yet"
- Device selection (camera, mic, speaker) available in the lobby

### In-call interface
- Active speaker layout: remote participant large, self-view as small picture-in-picture corner
- Signal bars icon on each video tile for connection quality indication
- Camera-off state: show participant's profile avatar + name on dark background
- Controls bar placement: Claude's discretion (always visible vs auto-hide)

### Candidate prep page
- Full prep page before lobby: job title, company info, interviewer name + photo, scheduled time
- Splits Network branded (not company-branded)
- Include helpful tips checklist: test mic, find quiet spot, have resume ready
- Early access: show prep page with countdown timer — candidate can enter lobby when time comes

### Join flow & entry points
- Authenticated users: "Join Interview" button on the application detail page (dedicated interviews page is Phase 38)
- Call opens in a new browser tab — full screen real estate, original app tab remains accessible
- Solo join: waiting room with "waiting for [name]" status and their info
- Post-call: summary screen showing call duration, then redirect/close

### Claude's Discretion
- Controls bar behavior (always visible vs auto-hide on timer)
- Exact self-view pip size and position
- Loading/transition states between lobby and call
- Error states (browser permission denied, network failure, unsupported browser)
- Mobile responsiveness approach
- Post-call summary screen design and redirect timing

</decisions>

<specifics>
## Specific Ideas

- Lobby layout inspired by Zoom's split pre-join screen
- Video layout modeled after FaceTime/Zoom default (large remote, small self)
- Prep page countdown creates anticipation without blocking early arrivals
- Waiting room provides reassurance that the system is working

</specifics>

<deferred>
## Deferred Ideas

- Dedicated interviews dashboard/list page — Phase 38 (interviews tab)
- Company-branded prep page (logo, colors) — could revisit in Phase 38 polish
- Screen sharing — Phase 38
- In-call notes panel — Phase 38

</deferred>

---

*Phase: 34-video-call-experience*
*Context gathered: 2026-03-07*
