# Phase 43: Video App & Infrastructure - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

A dedicated full-screen video app (`apps/video/`) runs on two branded subdomains (`video.splits.network` and `video.applicant.network`). Participants join calls via magic link without Clerk authentication. The app provides the pre-call lobby, in-call experience, and post-call screen. K8s deployment with TLS and ingress for both subdomains.

</domain>

<decisions>
## Implementation Decisions

### Brand experience
- Logo + colors only differentiation between Splits Network and Applicant Network — same layout and copy, just swap logo and primary color palette
- Brand detection via Host header server-side (hostname determines brand context)
- Branded splash screen with logo and subtle loading animation while app initializes
- Unknown/unrecognized hostname defaults to Splits Network branding (graceful degradation)

### Magic-link join flow
- "Join Call" opens the video app in a new browser tab — portal stays open in background
- Magic link for everyone — all participants (including Clerk-authenticated portal users) get magic links. Video app never touches Clerk
- Expired/invalid links show a friendly branded error page explaining the link is invalid/expired. No self-service re-request
- Identity confirmation screen before joining — display participant name from token ("Joining as John Smith") before entering the call

### Video app layout
- Extract and reuse existing v9.0 video call components — pull lobby, controls, video grid from portal into shared packages for the video app
- Full pre-call lobby with: camera/mic preview, device selection (camera, mic, speakers), display name edit, and call details (expected participants, scheduled time, entity context)
- Collapsible side panel during calls showing entity context (job details, company info) and in-call notes — similar to v9.0 pattern

### App shell & navigation
- Minimal branded header with logo during lobby — disappears or minimizes during the active call
- "Call ended" screen shows: call duration, participant names, and a link back to the portal (if they came from there)
- Auto-reconnect on connection loss with "Reconnecting..." overlay — participant stays in room for a grace period
- Fully responsive for mobile browsers from day one — touch controls, responsive layout, mobile-friendly lobby

### Claude's Discretion
- In-call video layout (spotlight + strip vs equal grid) — pick based on existing v9.0 patterns and call types
- Exact splash screen animation design
- Side panel content structure and toggle behavior
- Reconnection grace period duration and retry strategy
- Mobile breakpoint behavior and touch gesture details

</decisions>

<specifics>
## Specific Ideas

- v10.0 research already decided: single `apps/video/` serving two subdomains via Host header brand detection
- v10.0 research already decided: magic-link-only auth for video app (no Clerk in video app)
- Existing v9.0 video components should be extracted to shared packages — not duplicated

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 43-video-app-infrastructure*
*Context gathered: 2026-03-08*
