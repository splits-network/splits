# Phase 48: Interview Migration Cleanup - Research

**Researched:** 2026-03-09
**Domain:** Codebase cleanup / dead code removal
**Confidence:** HIGH

## Summary

This phase is pure codebase cleanup -- removing interview-era naming, dead hooks, dead auth-skip rules, and legacy bucket references. No new libraries or external dependencies are involved. All changes are internal find-and-replace or delete operations.

Research identified **6 categories** of interview-era remnants across the codebase, with clear boundaries between dead code (delete) and live domain concepts (keep). The most important finding is a **broken LiveKit webhook URL** in `infra/k8s/livekit/livekit-config.yaml` that still points to the deleted `/api/v2/interviews/recording/webhook` path while the actual handler lives at `/api/v2/calls/recording/webhook`.

**Primary recommendation:** Group work into 3 plans: (1) gateway auth rules + LiveKit config fix, (2) shared-video hook/type rename, (3) bucket reference rename across services + infra.

## Inventory of Interview-Era Remnants

### Category 1: Gateway Auth-Skip Rules (DEAD -- delete)

All in `services/api-gateway/src/index.ts` lines 476-531:

| Rule | Route | Status | Evidence |
|------|-------|--------|----------|
| Interview join | `POST /api/v2/interviews/join` | DEAD | No handler exists in video-service. Video app uses `/api/v2/calls/exchange-token` |
| Reschedule request | `POST /api/v2/interviews/:id/reschedule-request` | DEAD | No handler exists |
| Available slots | `GET /api/v2/interviews/:id/available-slots` | DEAD | No handler exists |
| Recording consent | `POST /api/v2/interviews/:id/recording/consent` | DEAD | No handler exists |
| Recording webhook | `POST /api/v2/interviews/recording/webhook` | DEAD | Handler at `/calls/recording/webhook` only |
| Interview notes | `PUT/GET /api/v2/interviews/:id/notes` | DEAD | No handler exists |

**Verification method:** `grep -r "interviews" services/video-service/src --include="*.ts"` returns zero route registrations. All video-service routes use `/api/v2/calls/` prefix now.

**No interview-specific proxy routes exist** in `services/api-gateway/src/routes/` (no `video.ts` file). Only the auth-skip rules in `index.ts` remain.

### Category 2: LiveKit Webhook URL (BROKEN -- fix urgently)

`infra/k8s/livekit/livekit-config.yaml` line 27:
```yaml
webhook:
    urls:
        - http://video-service:3019/api/v2/interviews/recording/webhook
```

The actual handler is at `/api/v2/calls/recording/webhook` (registered in `services/video-service/src/v2/calls/call-recording-webhook.ts` line 21).

**This means LiveKit egress webhooks are hitting a 404.** Recording completion events are NOT reaching video-service. This is likely why recording status may not update properly in production.

### Category 3: Shared-Video Interview Naming (LIVE code -- rename)

These hooks/components are exported from `packages/shared-video` and used by `apps/video`:

**Dead exports (not imported anywhere):**
- `useRecordingState` (`hooks/use-recording-state.ts`) -- uses `/api/v2/interviews/` URLs, params named `interviewId`, `isInterviewer`
- `useCallToken` (`hooks/use-call-token.ts`) -- uses `/interviews/` URLs, param named `interviewId`
- `useCallNotes` (`hooks/use-call-notes.ts`) -- uses `/api/v2/interviews/` URLs
- `NotesPanel` (`components/notes-panel.tsx`) -- prop named `interviewId`, text says "Interview Notes"
- `RecordingConsent` (`components/recording-consent.tsx`) -- text says "This Interview Will Be Recorded"

**Live exports with interview naming (need rename):**
- `CallContext.interview_type` field in `types.ts` line 6 -- used by `apps/video/src/lib/call-adapter.ts` which maps `call.call_type` to `interview_type`
- `video-lobby.tsx` -- `formatInterviewType()` function, destructures `interview_type`, text "Join Interview"
- `participant-sidebar.tsx` -- default role fallback `'interviewer'`, label text "Interviewer"
- `post-call-summary.tsx` -- heading "Interview Ended"

### Category 4: Bucket Name References (LIVE code -- rename)

All references to `interview-recordings` bucket name that need updating to `call-recordings`:

| File | Line | Context |
|------|------|---------|
| `services/video-service/src/v2/shared/signed-url-helper.ts` | 3 | `const BUCKET = 'interview-recordings'` |
| `services/video-service/src/index.ts` | 132 | Fallback: `'interview-recordings'` |
| `services/ai-service/src/v2/call-pipeline/repository.ts` | 10 | `const RECORDING_BUCKET = 'interview-recordings'` |
| `services/call-service/src/v2/artifact-repository.ts` | 157, 176 | `.from('interview-recordings')` and path extraction |
| `infra/k8s/video-service/deployment.yaml` | 80 | `value: "interview-recordings"` |
| `.env` | 76 | `SUPABASE_S3_BUCKET=interview-recordings` |

**IMPORTANT:** Per CONTEXT.md decision, do NOT drop the old `interview-recordings` Supabase Storage bucket. Only rename code references. The actual bucket in Supabase stays for manual ops cleanup.

**IMPORTANT:** The `call-recordings` bucket must already exist in Supabase Storage before deployment. The user confirmed it does exist per CONTEXT.md.

### Category 5: Video-Service Description (cosmetic -- fix)

`services/video-service/src/index.ts` line 76:
```typescript
description: "Internal video interview service for Splits Network",
```
Should be: `"Internal video call service for Splits Network"`

### Category 6: Notification-Service & Portal References (KEEP -- live domain)

These are NOT dead interview-era code. They reference the application stage named `interview` which is a valid business concept in the pipeline (`screen -> submitted -> company_review -> interview -> offer -> hired`):

- `notification-service/src/consumers/applications/consumer.ts` -- `case 'interview':` stage handler
- `notification-service/src/services/applications/service.ts` -- `sendCandidateInterviewInvite`, `sendRecruiterInterviewScheduled`
- `notification-service/src/templates/applications/` -- interview stage email templates
- `apps/portal/src/app/portal/applications/lib/permission-utils.ts` -- interview stage permissions
- `apps/portal/src/lib/utils/badge-styles.ts` -- interview stage badge
- `apps/portal/src/components/basel/calendar/` -- calendar interview event detection

**Also KEEP:**
- `packages/shared-types/src/models.ts` -- `interview` stage value, `interview_feedback`/`interview_summary`/`interview_note` note types (used by the application pipeline, not the deleted interview system)
- `packages/shared-types/src/ats-integrations.ts` -- `sync_interviews` (ATS integration config)
- `packages/shared-types/src/proposals.ts` -- `interview` proposal action type
- `ai-service/src/v2/call-pipeline/prompt-templates.ts` -- `interview` call type prompt (this IS the renamed system -- interview is now a call_type)

## Architecture Patterns

### Pattern: Bucket Reference Rename
**What:** Replace hardcoded bucket name string with constant, update all consumers
**When to use:** When renaming storage bucket references across services

```typescript
// Before (scattered hardcoded strings)
const BUCKET = 'interview-recordings';
.from('interview-recordings')

// After (consistent constant)
const BUCKET = 'call-recordings';
.from('call-recordings')
```

### Pattern: Dead Auth-Skip Rule Removal
**What:** Remove auth bypass rules from gateway for routes that no longer exist
**When to use:** After removing backend route handlers

The gateway auth-skip section in `index.ts` has comment blocks explaining each rule. Delete the entire block for dead routes (lines 476-531 interview-specific rules), keeping the call-related rules that follow.

### Pattern: Type Field Rename End-to-End
**What:** Rename a type field across the full stack (type definition -> adapter -> component consumers)
**When to use:** When a field name carries legacy naming

For `interview_type` -> `call_type`:
1. Update `packages/shared-video/src/types.ts` -- rename field
2. Update `apps/video/src/lib/call-adapter.ts` -- update mapping
3. Update all components that destructure the field

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Finding dead exports | Manual inspection | `grep -r "useRecordingState" apps/ packages/ --include="*.ts" --include="*.tsx"` | Grep confirms zero imports = safe to delete |
| Verifying route liveness | Assumption | Check video-service route registrations | Phase 46 may have left partial cleanup |

## Common Pitfalls

### Pitfall 1: Confusing Interview Stage with Interview System
**What goes wrong:** Deleting references to the `interview` application stage thinking they're dead interview-era code
**Why it happens:** The word "interview" appears in both the deleted interview system AND the live application pipeline stage
**How to avoid:** Only touch code in these areas: api-gateway auth rules, shared-video package, bucket references, LiveKit config, video-service description. Leave notification-service, portal application code, and shared-types alone.
**Warning signs:** If the file is in `notification-service/src/templates/applications/` or `portal/applications/`, it's the live stage system.

### Pitfall 2: Renaming Bucket Without Bucket Existing
**What goes wrong:** Code references `call-recordings` bucket but it doesn't exist in Supabase Storage
**Why it happens:** Code rename happens before bucket creation
**How to avoid:** User confirmed `call-recordings` bucket already exists. Verify with: the bucket must exist before deploying renamed code.

### Pitfall 3: Breaking LiveKit Webhook by Only Fixing Config
**What goes wrong:** Updating the LiveKit config URL but not the gateway auth-skip for the new URL
**Why it happens:** The gateway already has a `calls/recording/webhook` auth-skip (line 519-522), so this is actually fine. Just update the LiveKit config.
**How to avoid:** Verify the gateway auth-skip for `/api/v2/calls/recording/webhook` exists (it does, lines 519-522).

### Pitfall 4: Shared-Video Package Build Break
**What goes wrong:** Renaming types in shared-video breaks video app build
**Why it happens:** `apps/video` imports from `@splits-network/shared-video` -- if type names change, consumers must update simultaneously
**How to avoid:** Rename in shared-video types AND update call-adapter.ts in video app in the same plan. Build both packages to verify.

## Open Questions

1. **Is the LiveKit webhook actually broken in production?**
   - What we know: Config points to `/interviews/recording/webhook`, handler is at `/calls/recording/webhook`
   - What's unclear: Whether there's a gateway proxy or redirect we haven't found
   - Recommendation: Fix it regardless -- the config should match the handler

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection via grep and file reads
- All findings verified against actual source files

## Metadata

**Confidence breakdown:**
- Inventory completeness: HIGH - systematic grep across entire codebase
- Dead vs live classification: HIGH - verified import graphs for all shared-video exports
- Bucket reference list: HIGH - exhaustive grep for `interview-recordings`

**Research date:** 2026-03-09
**Valid until:** N/A (codebase-specific, not library-dependent)
