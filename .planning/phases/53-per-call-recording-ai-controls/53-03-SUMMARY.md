---
phase: 53
plan: "03"
subsystem: call-creation-ui
tags: [react, daisyui, subscription-tiers, recording, ai-analysis, call-type]
requires: ["53-01"]
provides: ["call-type-selector", "recording-controls", "call-creation-modal-v2"]
affects: ["53-04"]
tech-stack:
  added: []
  patterns: ["tier-gated-ui", "context-inferred-defaults", "extracted-form-components"]
key-files:
  created:
    - apps/portal/src/components/calls/call-type-selector.tsx
    - apps/portal/src/components/calls/recording-controls.tsx
  modified:
    - apps/portal/src/components/calls/call-creation-modal.tsx
decisions:
  - "inferCallType uses defaultEntityType at modal-open time rather than entities array (which is empty before user interacts)"
  - "Starter tier shows combined Transcription & AI Analysis upgrade row rather than two disabled toggles"
  - "CallTypeSelector placed above ParticipantPicker for prominence — call type is high-context metadata"
  - "RecordingControls placed after TagPicker at bottom of form — recording is opt-in, not primary"
metrics:
  duration: "3m"
  completed: "2026-03-11"
---

# Phase 53 Plan 03: Call Creation UI — Recording & AI Controls Summary

**One-liner:** Call creation modal gains a call type dropdown (context-inferred), recording toggle with consent hint, and tier-gated transcription/AI controls with upgrade badges.

## What Was Built

Two new extracted components and an updated call-creation-modal:

**CallTypeSelector** (`call-type-selector.tsx`): A DaisyUI `select` fieldset with 4 call type options (Interview, Recruiting Call, Client Meeting, Internal Call) and an exported `inferCallType()` helper that derives a context-appropriate default from entity links.

**RecordingControls** (`recording-controls.tsx`): A `fieldset` with recording toggle, consent hint, and tier-branched transcription/AI controls. Starter users see an upgrade badge row. Pro users see transcription toggle plus AI upgrade badge. Partner users see both toggles fully functional. Upgrade badges link to `/portal/profile?section=subscription`.

**CallCreationModal** (`call-creation-modal.tsx`): Integrated both components. Added `callType`, `recordingEnabled`, `transcriptionEnabled`, `aiAnalysisEnabled` state with resets on modal open. Payload now sends dynamic `call_type` and all three boolean flags. `planTier` sourced from `useUserProfile()`.

## Decisions Made

| Decision | Rationale |
|---|---|
| inferCallType uses defaultEntityType at open time | entities array is empty on open; defaultEntityType prop carries the context |
| Starter shows one combined upgrade row | Cleaner UX than two disabled toggles with overlapping upgrade CTAs |
| CallTypeSelector before participants | Call type is context metadata set once; participants are primary interaction |
| RecordingControls at bottom | Recording is opt-in secondary feature, not a primary concern for most calls |

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- TypeScript: `npx tsc --noEmit` exits clean (0 errors)
- Both new files created with correct exports and `'use client'` directives
- DaisyUI classes used throughout (toggle, badge, select, fieldset)
- Upgrade badges use Next.js `Link` component
- All 4 call type options match `call_types` table slugs
- API payload includes `call_type`, `recording_enabled`, `transcription_enabled`, `ai_analysis_enabled`
- State resets on modal open including `inferCallType` default

## Next Phase Readiness

Plan 53-04 can proceed. The frontend now sends `recording_enabled`, `transcription_enabled`, and `ai_analysis_enabled` in the call creation payload. The backend (53-01) already accepts and validates these flags.
