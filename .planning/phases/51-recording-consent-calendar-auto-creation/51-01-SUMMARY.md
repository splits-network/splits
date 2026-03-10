# Phase 51 Plan 01: Recording Consent Data Pipeline Summary

**One-liner:** Wire call_types.requires_recording_consent through call-service detail response and video app adapter to enable VideoLobby consent banner

## Metadata

- **Phase:** 51-recording-consent-calendar-auto-creation
- **Plan:** 01
- **Subsystem:** video, call-service
- **Tags:** recording-consent, call-types, video-lobby
- **Duration:** ~1min
- **Completed:** 2026-03-10

## What Was Done

### Task 1: Add recording_consent_required to call detail response
- Added `recording_consent_required?: boolean` to `CallDetail` interface in call-service types
- Added call_types lookup query in `getCallDetail()` to fetch `requires_recording_consent` by slug
- Defaults to `true` (show consent banner) when call_type row not found
- **Commit:** 6483684d

### Task 2: Wire recording consent through video app
- Added `recording_consent_required?: boolean` to video app's `CallDetail` type
- Changed call-adapter from hardcoded `recording_enabled: false` to `call.recording_consent_required ?? true`
- Added `recordingEnabled={callContext.recording_enabled}` prop to both VideoLobby renders (lobby + connecting states)
- **Commit:** 6a0146a4

## Key Files

### Created
None.

### Modified
- `services/call-service/src/v2/types.ts` — CallDetail interface extended
- `services/call-service/src/v2/repository.ts` — call_types lookup in getCallDetail()
- `apps/video/src/lib/types.ts` — CallDetail interface extended
- `apps/video/src/lib/call-adapter.ts` — recording_enabled derived from call data
- `apps/video/src/components/call-experience.tsx` — recordingEnabled prop passed to VideoLobby

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Separate query for call_types (not a join) | call_types is a tiny lookup table; separate query keeps getCall() simple |
| Default to true when data missing | Safety default: show consent banner rather than skip it |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- [x] `pnpm --filter @splits-network/call-service build` -- no errors
- [x] `pnpm --filter @splits-network/video build` -- no errors
- [x] call-adapter.ts: recording_enabled NOT hardcoded to false
- [x] call-experience.tsx: recordingEnabled prop passed to VideoLobby in both locations
- [x] repository.ts: call_types queried for requires_recording_consent
