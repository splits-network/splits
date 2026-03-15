---
phase: 51-recording-consent-calendar-auto-creation
verified: 2026-03-09T22:00:00Z
status: passed
score: 5/5 must-haves verified
gaps: []
human_verification:
  - test: "Create a scheduled call in the portal and verify a Google Calendar event appears for participants"
    expected: "Calendar event is created with correct title, time, duration, and join URL"
    why_human: "Requires live Google Calendar integration and OAuth tokens"
  - test: "Join a video call for an interview/client_meeting type and verify recording consent banner appears in the lobby"
    expected: "RecordingConsent component displays with checkbox; Join button is disabled until consent is given"
    why_human: "Requires running video app with LiveKit connection to verify visual rendering and consent gate behavior"
---

# Phase 51: Recording Consent & Calendar Auto-Creation Verification Report

**Phase Goal:** Recording consent banner displays during calls and Google Calendar events are auto-created when calls are scheduled
**Verified:** 2026-03-09
**Status:** PASSED
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Recording consent banner appears in the video lobby when a call has recording enabled | VERIFIED | `call-adapter.ts:19` maps `recording_consent_required` to `recording_enabled`; `call-experience.tsx:157,169` passes `recordingEnabled={callContext.recording_enabled}` to both VideoLobby renders; `video-lobby.tsx:236-246` conditionally renders `RecordingConsent` component; `video-lobby.tsx:274` disables Join button until consent given |
| 2 | The banner is NOT shown for internal_call type calls (requires_recording_consent: false) | VERIFIED | `repository.ts:123-127` queries `call_types` table for `requires_recording_consent` by slug; value propagates through `CallDetail.recording_consent_required` to `CallContext.recording_enabled`; `video-lobby.tsx:236` only renders `RecordingConsent` when `recordingEnabled` is truthy |
| 3 | A Google Calendar event is automatically created for each participant when a scheduled call is created | VERIFIED | `use-create-call.ts:71-110` defines `createCalendarEvents` that POSTs to `/integrations/calendar/calls` with call metadata and filtered participants; `call-creation-modal.tsx:119-130` calls it after scheduled call creation |
| 4 | Calendar creation failure does not block call creation or show errors to the user | VERIFIED | `use-create-call.ts:106-109` wraps entire function in try/catch with `console.warn` only; `call-creation-modal.tsx:127-129` adds `.catch(() => {})` for unhandled rejection; calendar call is NOT awaited |
| 5 | Instant calls do NOT trigger calendar event creation | VERIFIED | `call-creation-modal.tsx:119` guards with `mode === 'scheduled' && schedule` -- instant calls skip the block entirely |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `services/call-service/src/v2/types.ts` | `recording_consent_required` on CallDetail | VERIFIED | Line 173: `recording_consent_required?: boolean` on CallDetail interface |
| `services/call-service/src/v2/repository.ts` | call_types lookup in getCallDetail | VERIFIED | Lines 123-133: queries `call_types` table by slug, defaults to `true` |
| `apps/video/src/lib/types.ts` | `recording_consent_required` on CallDetail | VERIFIED | Line 38: `recording_consent_required?: boolean` |
| `apps/video/src/lib/call-adapter.ts` | Maps recording_consent_required to recording_enabled | VERIFIED | Line 19: `recording_enabled: call.recording_consent_required ?? true` (not hardcoded false) |
| `apps/video/src/components/call-experience.tsx` | Passes recordingEnabled to VideoLobby | VERIFIED | Lines 157 and 169: both VideoLobby renders include `recordingEnabled={callContext.recording_enabled}` |
| `packages/shared-video/src/components/video-lobby.tsx` | Accepts recordingEnabled, renders RecordingConsent | VERIFIED | Prop on line 27; conditional render on line 236; join gate on line 274 |
| `packages/shared-video/src/components/recording-consent.tsx` | Substantive consent UI | VERIFIED | 41 lines, renders warning banner with checkbox, no stubs |
| `apps/portal/src/hooks/use-create-call.ts` | createCalendarEvents function | VERIFIED | Lines 71-110: POSTs to `/integrations/calendar/calls`, filters email-only participants, try/catch with console.warn |
| `apps/portal/src/components/calls/call-creation-modal.tsx` | Calls createCalendarEvents after scheduled call creation | VERIFIED | Lines 119-130: fire-and-forget call guarded by `mode === 'scheduled' && schedule` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `repository.ts` getCallDetail | `call_types` table | Supabase query by slug | WIRED | Lines 123-127: `.from('call_types').select('requires_recording_consent').eq('slug', call.call_type)` |
| `call-adapter.ts` | `CallDetail.recording_consent_required` | Direct property mapping | WIRED | Line 19: `call.recording_consent_required ?? true` |
| `call-experience.tsx` | `VideoLobby` | `recordingEnabled` prop | WIRED | Both render sites (lobby + connecting) pass the prop |
| `VideoLobby` | `RecordingConsent` | Conditional render + consent state | WIRED | Lines 236-246: renders when `recordingEnabled`, line 274: gates join button |
| `call-creation-modal.tsx` | Calendar API | `createCalendarEvents` from hook | WIRED | Line 51: destructured from `useCreateCall()`; line 120: called with call data |
| `use-create-call.ts` | `/integrations/calendar/calls` | Authenticated POST | WIRED | Lines 97-105: `client.post('/integrations/calendar/calls', {...})` |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | - | - | - | - |

### Human Verification Required

### 1. Recording Consent Banner Visual

**Test:** Join a video call for an interview or client_meeting type call
**Expected:** Recording consent banner appears in the lobby with "This Call Will Be Recorded" heading, consent checkbox, and Join button is disabled until checkbox is checked
**Why human:** Requires running video app with LiveKit to verify visual rendering and consent gate behavior

### 2. Calendar Event Auto-Creation

**Test:** Create a scheduled call from the portal with two participants who have Google Calendar connected
**Expected:** A Google Calendar event appears on each participant's calendar with correct title, time, duration, and join URL
**Why human:** Requires live Google Calendar OAuth integration and connected accounts

### 3. Calendar Failure Resilience

**Test:** Create a scheduled call when no participants have Google Calendar connected
**Expected:** Call is created successfully with no user-visible error; console shows a warning
**Why human:** Requires monitoring browser console during call creation

### Gaps Summary

No gaps found. All five observable truths are verified at the code level. The recording consent data pipeline flows correctly from `call_types` table through `call-service` repository, through the video app adapter, into the `VideoLobby` component which renders the `RecordingConsent` component and gates the Join button. The calendar auto-creation fires as a background POST after scheduled call creation, with proper error swallowing and instant-call exclusion.

---

_Verified: 2026-03-09_
_Verifier: Claude (basel-gsd-verifier)_
