# Phase 53: Per-Call Recording & AI Controls - Research

**Researched:** 2026-03-10
**Domain:** Call creation UX, subscription tier gating, AI pipeline enforcement, recording lifecycle
**Confidence:** HIGH — all findings verified against actual codebase

## Summary

Phase 53 adds per-call recording and AI analysis toggles to the call creation form, replaces call_type-driven recording/consent behavior with per-call flags, and gates features by the creator's subscription tier (Free/Pro/Partner). The work spans four areas: (1) database migration to add `recording_enabled` and `ai_analysis_enabled` columns to `calls`, and clean up deprecated `call_types` columns; (2) backend enforcement in call-service (creation-time validation) and ai-service (pipeline-time tier check); (3) call creation modal UI changes; and (4) post-call detail page gating for transcript/summary tabs.

The codebase already has all the foundational pieces in place: the calls table, call_types lookup table, subscription model with `PlanTier` (`starter | pro | partner`), and the `planTier` field exposed from `UserProfileContext`. The AI pipeline in `ai-service` currently processes all recordings without tier checks — adding tier enforcement means the pipeline must query billing-service's DB (subscriptions + plans tables) to read the creator's current subscription. The retention cleanup job is net-new functionality that belongs in notification-service (following the existing cron job pattern), calling out to Supabase storage to delete expired blobs.

**Primary recommendation:** Follow the exact patterns already established — service-role DB queries for billing lookups in ai-service, K8s CronJob YAML + Node job script in notification-service for retention cleanup, DaisyUI toggle component for the form UI, and a new migration file for the schema changes.

## Standard Stack

### Core (already in use — no new installs needed)
| Library | Purpose | Where |
|---------|---------|-------|
| Supabase JS client | DB queries, storage signed URLs | All services |
| Fastify | Route handlers | call-service, ai-service |
| Resend | Email notifications | notification-service |
| DaisyUI | Toggle/badge UI components | apps/portal |
| `@clerk/nextjs` `useAuth` | Token for API calls | apps/portal |

### No New Dependencies Required
All required infrastructure (subscription queries, storage, email, cron jobs) is already wired. This phase adds logic and UI on top of existing plumbing.

## Architecture Patterns

### Project Structure Changes
```
supabase/migrations/
  20260310000002_add_call_recording_flags.sql   # NEW: add recording/ai flags, remove call_types cols

services/call-service/src/v2/
  types.ts                                       # MODIFY: add recording_enabled, ai_analysis_enabled to Call, CreateCallInput
  repository.ts                                  # MODIFY: persist new fields in createCall()
  routes.ts                                      # MODIFY: accept + forward new fields from POST /api/v2/calls
  service.ts                                     # MODIFY: tier validation on createCall()
  shared/billing-client.ts                       # NEW: helper to query billing DB for creator's tier

services/ai-service/src/v2/call-pipeline/
  service.ts                                     # MODIFY: check ai_analysis_enabled + tier before processing
  repository.ts                                  # MODIFY: read recording_enabled, ai_analysis_enabled from calls

services/notification-service/src/
  jobs/expire-recording-cleanup.ts               # NEW: daily job to delete expired Free-tier recordings
  services/recording-expiry/service.ts           # NEW: business logic for expiry email + delete

infra/k8s/notification-service/cronjobs/
  expire-recording-cleanup.yaml                  # NEW: K8s CronJob for daily run

apps/portal/src/components/calls/
  call-creation-modal.tsx                        # MODIFY: add call type selector, recording toggle, AI toggle
  recording-controls.tsx                         # NEW: extracted toggle section component

apps/portal/src/app/portal/calls/[id]/
  call-detail-client.tsx                         # MODIFY: tab gating based on call flags + tier
  components/recording-tab.tsx                   # MODIFY: "no recording" state when recording_enabled=false
  components/transcript-tab.tsx                  # MODIFY: locked state with upgrade prompt
  components/summary-tab.tsx                     # MODIFY: locked state with upgrade prompt
```

### Pattern 1: Subscription Tier Lookup in ai-service
The ai-service has no billing-service HTTP dependency (architecture rule: no HTTP between services). It must query the billing DB directly using a service-role key. The call record already contains `created_by` (internal UUID). The lookup path is: `calls.created_by` → `users.id` → `subscriptions.user_id` → join `plans.tier`.

```typescript
// services/ai-service/src/v2/call-pipeline/repository.ts (add method)
async getCreatorTier(callId: string): Promise<'starter' | 'pro' | 'partner'> {
    const { data: call } = await this.supabase
        .from('calls')
        .select('created_by, recording_enabled, ai_analysis_enabled')
        .eq('id', callId)
        .single();

    if (!call?.created_by) return 'starter';

    const { data: sub } = await this.supabase
        .from('subscriptions')
        .select('plan:plans(tier)')
        .eq('user_id', call.created_by)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return (sub?.plan as any)?.tier || 'starter';
}
```

Then in `CallPipelineService.processRecording()`:
- If `recording_enabled = false` on the call: skip pipeline entirely (should never trigger since recording never started)
- If tier = `starter`: skip transcription and summarization; mark transcript/summary as not applicable
- If tier = `pro`: transcribe only, skip summarization
- If tier = `partner` AND `ai_analysis_enabled = true`: full pipeline (transcript + summary)
- If billing-service DB unavailable: log error, skip processing, emit retry event

### Pattern 2: Tier Check in call-service at Creation Time
The call-service's `createCall` method in `service.ts` already resolves the user ID. Add tier enforcement before saving:

```typescript
// services/call-service/src/v2/service.ts — in createCall()
if (input.ai_analysis_enabled) {
    const tier = await this.repository.getCreatorTier(resolvedUserId);
    if (tier !== 'partner') {
        throw Object.assign(
            new Error('AI analysis requires a Partner subscription'),
            { statusCode: 400 },
        );
    }
}
```

The `getCreatorTier` method in `CallRepository` queries subscriptions + plans using the same pattern as ai-service.

### Pattern 3: Call Creation Modal — Recording Controls UI
The existing `call-creation-modal.tsx` is 434 lines. The recording controls section should be extracted to a separate `recording-controls.tsx` component (respecting the 200-line max file rule). The section appears after the `<TagPicker />` in the bottom section.

Toggle pattern using DaisyUI (no custom click-outside handlers):
```tsx
// recording-controls.tsx
<fieldset>
    <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
        Recording
    </legend>
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm">Record this call</span>
        <input type="checkbox" className="toggle toggle-primary"
               checked={recordingEnabled} onChange={...} />
    </label>
    {recordingEnabled && (
        <p className="text-sm text-base-content/50 mt-2">
            Participants will be asked for consent before joining
        </p>
    )}
</fieldset>
```

For disabled tier states with upgrade badge — use DaisyUI `badge` on the toggle row:
```tsx
// Free user seeing disabled AI analysis + transcription row
<label className="flex items-center justify-between opacity-60 cursor-not-allowed">
    <div>
        <span className="text-sm">Transcription & AI Analysis</span>
    </div>
    <Link href="/portal/profile?section=subscription">
        <span className="badge badge-warning text-xs">Upgrade to Pro</span>
    </Link>
</label>
```

### Pattern 4: Call Type Selector
The form currently hardcodes `call_type: 'recruiting_call'` in `handleSubmit`. Replace with a select dropdown at top of form:

```tsx
// In call-creation-modal.tsx, after mode toggle:
<fieldset>
    <legend>Call Type</legend>
    <select value={callType} onChange={(e) => setCallType(e.target.value)} className="select w-full">
        <option value="recruiting_call">Recruiting Call</option>
        <option value="interview">Interview</option>
        <option value="client_meeting">Client Meeting</option>
        <option value="internal_call">Internal Call</option>
    </select>
</fieldset>
```

Context-inferred defaults: when `defaultEntityType === 'application'` → `interview`; when `defaultEntityType === 'company'` → `client_meeting`; else → `recruiting_call`.

### Pattern 5: Post-Call Tab Gating
`call-detail-client.tsx` currently renders all three tabs unconditionally. The tab gating requires knowing:
1. `call.recording_enabled` — show recording tab vs. empty state
2. The current user's tier — unlock transcript and summary tabs

The `useCallDetail` hook returns the `call` object. Add `recording_enabled` and `ai_analysis_enabled` to the `Call` type and have the API return them. For tier, use `useUserProfile().planTier` already available in context.

Tab rendering logic:
```tsx
// In call-detail-client.tsx
const { planTier } = useUserProfile();
const canSeeTranscript = call.recording_enabled && planTier !== 'starter';
const canSeeSummary = call.recording_enabled && call.ai_analysis_enabled && planTier === 'partner';

// On locked transcript tab — show upgrade prompt instead of TranscriptTab:
{activeTab === 'transcript' && !canSeeTranscript && (
    <LockedTabUpgrade
        message={planTier === 'starter'
            ? 'Upgrade to Pro for automatic transcription'
            : 'Transcription not available — this call was not recorded'}
        href="/portal/profile?section=subscription"
        upgradeLabel={planTier === 'starter' ? 'Upgrade to Pro' : undefined}
    />
)}
```

### Pattern 6: Recording Retention Cleanup Job
Follows the exact same pattern as `send-recruiter-reminders.ts` + its K8s CronJob YAML.

```typescript
// services/notification-service/src/jobs/expire-recording-cleanup.ts
// Runs daily. Finds recordings where:
//   - call.created_by user is on starter plan
//   - call_recordings.created_at < now() - 7 days  (delete)
//   - call_recordings.created_at between now() - 5 days and now() - 4 days  (warn email)
```

K8s schedule: `"0 3 * * *"` (3 AM UTC daily). Service-role key required to access storage.

The 2-day warning email: sent when recording is 5 days old (7 - 2 = 5). Check `notification_log` for dedup to avoid sending twice.

### Pattern 7: call_types Table Cleanup
Via migration: remove `requires_recording_consent` and `supports_ai_summary` columns. The TypeScript `CallType` interface in `services/call-service/src/v2/types.ts` must be updated to match. The `repository.ts` `getCallDetail` currently reads `requires_recording_consent` from `call_types` and sets `recording_consent_required` on the detail — this code must be removed.

### Anti-Patterns to Avoid
- **HTTP calls between services for tier lookup:** ai-service must query billing DB directly, not call billing-service's API
- **Storing entitlement snapshots:** no caching of tier on the call record — always query current subscription
- **Silent stripping of flags:** a Free user sending `ai_analysis_enabled: true` gets a 400, not a silent ignore
- **Inline tier logic in routes.ts:** put tier validation in service.ts, not in the route handler
- **Custom toggle UI:** use DaisyUI `toggle toggle-primary`, not a custom div with click handlers

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Toggle UI | Custom div-based toggle | DaisyUI `<input type="checkbox" className="toggle toggle-primary">` |
| Subscription lookup | Custom REST call from ai-service to billing-service | Direct Supabase query with service-role key |
| Cron job scheduling | K8s-level scheduling logic | Existing CronJob YAML pattern in `infra/k8s/notification-service/cronjobs/` |
| Upgrade link badges | Custom styled badge | DaisyUI `badge badge-warning` |
| Billing tier in frontend | New API call on form open | `useUserProfile().planTier` from existing context |

## Common Pitfalls

### Pitfall 1: call-detail-client.tsx Exceeds 200-Line Limit
**What goes wrong:** Adding tab gating logic and `LockedTabUpgrade` component inline pushes the file beyond 200 lines.
**How to avoid:** Extract `LockedTabUpgrade` as a separate component. The tab gating conditional is 5 lines; the component itself is the bulk.

### Pitfall 2: call_types FK Constraint on calls Table
**What goes wrong:** Removing columns from `call_types` or adding new call types requires care because `calls.call_type` is a FK reference to `call_types(slug)`. The migration must add `internal_call` to call_types data if it isn't present, and add any new call type slugs before they're used.
**Current state:** `call_types` rows: `interview`, `client_meeting`, `internal_call`, `recruiting_call`. All four required by the phase are already seeded. Verify no migration is needed for new slugs.
**How to avoid:** Check the migration file `20260314000001_add_recruiting_call_type.sql` — all 4 types exist. Only column removals needed.

### Pitfall 3: Repository.ts Still Reading Removed Columns
**What goes wrong:** After the migration drops `requires_recording_consent` and `supports_ai_summary` from `call_types`, the existing code in `repository.ts` `getCallDetail()` (lines 123-133) will fail at runtime querying those columns.
**How to avoid:** Remove that entire `call_types` lookup block from `getCallDetail()` and remove `recording_consent_required` from the `CallDetail` interface.

### Pitfall 4: ai-service Pipeline Trigger Has No Flag Check
**What goes wrong:** The current `processRecording` entry point in ai-service receives a `call.recording_ended` event. If `recording_enabled = false`, theoretically no recording was started — but defensively, the pipeline should bail early if `recording_enabled = false` on the call record, in case the event was published in error.
**How to avoid:** As the first step in `processRecording`, read `recording_enabled` and `ai_analysis_enabled` from the calls table and short-circuit if `recording_enabled = false`.

### Pitfall 5: Billing DB Cross-Service Query Setup
**What goes wrong:** ai-service's `CallPipelineRepository` uses one Supabase client. A separate query to `subscriptions` and `plans` tables will work with the same service-role key since it's the same database. No second client needed.
**How to avoid:** Reuse `this.supabase` (service-role) for the tier lookup — it already has access to all tables.

### Pitfall 6: Pro Plan + Silent Transcription Confusion
**What goes wrong:** Pro users with `recording_enabled = true` automatically get transcription — but there's no toggle for it. The pipeline must infer: if tier = `pro` and `recording_enabled = true`, run transcription automatically. If `ai_analysis_enabled = false` (or tier != partner), skip summarization.
**How to avoid:** Pipeline decision tree: `if (!call.recording_enabled) return; if (tier === 'starter') return; transcribe(); if (tier === 'partner' && call.ai_analysis_enabled) summarize();`

### Pitfall 7: Recording Retention Job Needs Blob Deletion, Not Just Row Deletion
**What goes wrong:** Deleting the `call_recordings` DB row does not delete the file from Supabase storage. Storage accumulates indefinitely.
**How to avoid:** Job must: (1) get `blob_url` from the row, (2) call `supabase.storage.from('call-recordings').remove([storagePath])`, (3) then delete the DB row. Order matters: storage first, then DB (on failure, row remains and retry is safe).

### Pitfall 8: Form State in CallCreationModal When Modal Re-opens
**What goes wrong:** The `useEffect` that syncs `defaultMode` and resets state on `isOpen` change (lines 80-105) does not reset `callType`, `recordingEnabled`, or `aiAnalysisEnabled`.
**How to avoid:** Add all new state fields to the reset block in that `useEffect`.

## Code Examples

### Migration: Add Columns to calls, Remove from call_types
```sql
-- supabase/migrations/20260310000002_add_call_recording_flags.sql

-- Add per-call recording control flags
ALTER TABLE calls
    ADD COLUMN recording_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN ai_analysis_enabled BOOLEAN NOT NULL DEFAULT false;

-- Remove call_type-driven behavior columns (replaced by per-call flags)
ALTER TABLE call_types
    DROP COLUMN IF EXISTS requires_recording_consent,
    DROP COLUMN IF EXISTS supports_ai_summary;
```

### call-service: Validate Tier at Creation
```typescript
// services/call-service/src/v2/service.ts — createCall() addition
if (input.ai_analysis_enabled) {
    const tier = await this.getCreatorTier(resolvedUserId);
    if (tier !== 'partner') {
        throw Object.assign(
            new Error('AI analysis requires a Partner subscription'),
            { statusCode: 400 },
        );
    }
}

private async getCreatorTier(internalUserId: string): Promise<'starter' | 'pro' | 'partner'> {
    // Queries subscriptions + plans using service-role Supabase client
    return this.repository.getCreatorTier(internalUserId);
}
```

### Frontend: Tier-Aware Recording Controls
```tsx
// apps/portal/src/components/calls/recording-controls.tsx
import { useUserProfile } from '@/contexts';
import Link from 'next/link';

interface RecordingControlsProps {
    recordingEnabled: boolean;
    aiAnalysisEnabled: boolean;
    onRecordingChange: (v: boolean) => void;
    onAiAnalysisChange: (v: boolean) => void;
}

export function RecordingControls({
    recordingEnabled, aiAnalysisEnabled,
    onRecordingChange, onAiAnalysisChange
}: RecordingControlsProps) {
    const { planTier } = useUserProfile();
    const canRecord = true;  // All tiers can record
    const canTranscribe = planTier !== 'starter';
    const canAiAnalysis = planTier === 'partner';

    return (
        <fieldset>
            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-3">
                Recording
            </legend>
            {/* Recording toggle — all tiers */}
            <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Record this call</span>
                <input type="checkbox" className="toggle toggle-primary toggle-sm"
                       checked={recordingEnabled}
                       onChange={(e) => onRecordingChange(e.target.checked)} />
            </label>
            {recordingEnabled && (
                <p className="text-sm text-base-content/50 mb-2">
                    Participants will be asked for consent before joining
                </p>
            )}
            {/* Transcription + AI row */}
            {planTier === 'starter' ? (
                <div className="flex items-center justify-between py-2 opacity-60">
                    <span className="text-sm">Transcription & AI Analysis</span>
                    <Link href="/portal/profile?section=subscription">
                        <span className="badge badge-warning text-xs">Upgrade to Pro</span>
                    </Link>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between py-2 text-sm text-base-content/50">
                        <span>Transcription</span>
                        <span className="text-xs">Auto when recorded</span>
                    </div>
                    <label className={`flex items-center justify-between py-2 ${!recordingEnabled ? 'opacity-40' : ''}`}>
                        <span className="text-sm font-medium">AI Analysis</span>
                        {canAiAnalysis ? (
                            <input type="checkbox" className="toggle toggle-primary toggle-sm"
                                   checked={aiAnalysisEnabled}
                                   disabled={!recordingEnabled}
                                   onChange={(e) => onAiAnalysisChange(e.target.checked)} />
                        ) : (
                            <Link href="/portal/profile?section=subscription">
                                <span className="badge badge-warning text-xs">Upgrade to Partner</span>
                            </Link>
                        )}
                    </label>
                </>
            )}
        </fieldset>
    );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `call_types.requires_recording_consent` drives consent banner | `calls.recording_enabled` flag drives consent (Phase 53) | Now | Decouples call categorization from consent logic |
| `call_types.supports_ai_summary` gates AI features | Per-call `ai_analysis_enabled` + subscription tier check (Phase 53) | Now | Enables per-call control vs. type-level global setting |
| Hardcoded `call_type: 'recruiting_call'` in creation form | User-selectable call type with context-inferred default (Phase 53) | Now | Aligns call type to actual purpose for better AI prompts |

**Deprecated/outdated after this phase:**
- `CallType.requires_recording_consent`: dropped from DB and TypeScript types
- `CallType.supports_ai_summary`: dropped from DB and TypeScript types
- `CallDetail.recording_consent_required`: remove from interface (was derived from call_types)
- Hardcoded `'recruiting_call'` in `call-creation-modal.tsx` handleSubmit

## Open Questions

1. **Retention period for Pro/Partner**
   - What we know: Free = 7 days. Partner context says Pro/Partner is Claude's discretion.
   - What's unclear: Exact number of days.
   - Recommendation: 90 days for Pro, unlimited for Partner. Implement the 7-day Free cleanup job now with a `max_age_days` configurable per-tier. Partner gets `null` (no expiry) in the query.

2. **How does video-app (LiveKit) know to start recording?**
   - What we know: The video app is a separate app. Recording is triggered somehow — Phase 36/37 wired this.
   - What's unclear: Does the video app read `recording_enabled` from the call record when joining, or is recording started manually?
   - Recommendation: Before implementing, check video-app source for the recording start logic. The consent banner behavior will depend on whether `recording_enabled` is passed in the token or fetched via the call detail endpoint.

3. **Where is the consent banner shown (video app)?**
   - What we know: The CONTEXT.md says "when recording is OFF: no consent banner at all (clean join flow)". The video app is separate from portal.
   - What's unclear: The video app was built in Phase 43-52. Does it already read a consent flag?
   - Recommendation: Check `apps/video/` or the video-service for where consent logic lives before touching portal. This may require a cross-app change not scoped to Phase 53.

## Sources

### Primary (HIGH confidence)
- `services/call-service/src/v2/types.ts` — full call domain type model
- `services/call-service/src/v2/service.ts` — createCall() pattern
- `services/call-service/src/v2/repository.ts` — DB query patterns
- `services/billing-service/src/v2/subscriptions/repository.ts` — `findByUserId` with plan join
- `services/billing-service/src/v2/plans/types.ts` — `PlanTier = 'starter' | 'pro' | 'partner'`
- `services/ai-service/src/v2/call-pipeline/service.ts` — full pipeline flow
- `services/ai-service/src/v2/call-pipeline/repository.ts` — Supabase patterns for call context
- `services/ai-service/src/v2/call-pipeline/prompt-templates.ts` — call type-driven prompts
- `apps/portal/src/components/calls/call-creation-modal.tsx` — current form structure
- `apps/portal/src/contexts/user-profile-context.tsx` — `planTier` availability
- `supabase/migrations/20260312000001_create_call_tables.sql` — full schema
- `supabase/migrations/20260314000001_add_recruiting_call_type.sql` — 4th call type seeded
- `infra/k8s/notification-service/cronjobs/send-recruiter-reminders.yaml` — CronJob pattern
- `services/notification-service/src/jobs/send-recruiter-reminders.ts` — job script pattern
- `apps/portal/src/app/portal/calls/[id]/call-detail-client.tsx` — tab structure

## Metadata

**Confidence breakdown:**
- Schema changes: HIGH — migration pattern clear, columns identified
- Backend tier enforcement: HIGH — subscription join pattern exists in billing-service repository
- Frontend UX: HIGH — DaisyUI toggles, planTier from context, all established patterns
- AI pipeline changes: HIGH — service.ts flow fully traced
- Retention job: HIGH — exact CronJob + script pattern exists in notification-service
- Video app consent banner: LOW — not researched; video app source not examined

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable codebase, no fast-moving external deps)
