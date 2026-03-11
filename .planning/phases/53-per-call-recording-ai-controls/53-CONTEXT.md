# Phase 53: Per-Call Recording & AI Controls - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Per-call recording and AI analysis toggles in the call creation form, gated by the creator's subscription tier (Free/Pro/Partner). Recording is opt-in, transcription is automatic for Pro+, AI review is opt-in for Partner only. Includes backend enforcement, upgrade prompts, and post-call detail gating. Removes call_type-driven recording/consent behavior in favor of per-call flags.

</domain>

<decisions>
## Implementation Decisions

### Recording toggle UX
- Toggle placed in bottom section of call creation form (near pre-call notes and tags)
- Default state: off (user must explicitly opt in)
- Label: "Record this call"
- When recording toggled on: inline hint below toggle — "Participants will be asked for consent before joining"
- AI Analysis toggle always visible, but disabled when recording is off (shows dependency)
- Recording available for both instant and scheduled calls
- Recording decision is creation-time only — no mid-call start/stop
- When recording is OFF: no consent banner in video app at all (clean join flow)

### Subscription tier presentation
- Disabled toggles show a badge on the toggle row (e.g., "Upgrade to Pro", "Upgrade to Partner")
- Badge is clickable, links to `/portal/profile?section=subscription`
- Free plan: combined row for transcription + AI with "Upgrade to Pro" badge
- Pro plan: AI Analysis toggle disabled with "Upgrade to Partner" badge
- Partner plan: normal toggle, no badge or special indicator
- Pro users with transcription: no indicator — transcription is silently automatic when recording is on
- Post-call detail page: locked tabs (transcript, summary) show upgrade prompts — upsell at consumption time

### Tier model
| Plan    | Recording | Transcription      | AI Review          |
|---------|-----------|--------------------|--------------------|
| Free    | opt-in    | no                 | no                 |
| Pro     | opt-in    | auto (if recorded) | no                 |
| Partner | opt-in    | auto (if recorded) | opt-in toggle      |

### Backend enforcement
- Both creation-time and pipeline-time tier checks query billing-service DB for current subscription
- Real-time enforcement — no stored entitlement snapshots
- If user downgrades between call creation and pipeline execution, current (lower) tier applies
- If user upgrades between creation and pipeline, they still don't get features unless flags were set at creation
- API rejects with 400 if a Free user tries to enable AI analysis (explicit error, not silent strip)
- Pipeline fallback: if billing-service unavailable, skip processing and retry later (don't lose recording)
- Calls table gets `recording_enabled BOOLEAN DEFAULT false` and `ai_analysis_enabled BOOLEAN DEFAULT false`

### Recording retention
- Free tier: recordings auto-delete after 7 days
- Pro/Partner: Claude's discretion (reasonable retention period)
- Email warning sent 2 days before deletion: "Your recording will be deleted in 2 days. Upgrade to keep it."
- Cleanup via daily scheduled job (cron) that deletes expired recordings from blob storage

### Call type selector
- Visible dropdown selector at top of form, after the instant/scheduled mode toggle
- All 4 types available: Interview, Recruiting Call, Client Meeting, Internal Call
- Default inferred from context: application link → Interview, company link → Client Meeting, else Recruiting Call
- User can override the inferred default (editable, not locked)
- Call type drives AI summary prompt template selection (interview focus vs business outcomes vs action items)
- Call type is categorization + AI prompt selection — no longer drives recording/consent behavior
- Recording consent banner always shown regardless of call type (including internal calls)
- Fixed list for now, but architecture should support custom types as a future capability (call_types is already a lookup table)

### Call types table changes
- Remove `requires_recording_consent` from call_types — consent is always required when recording_enabled = true
- Remove `supports_ai_summary` from call_types — AI analysis is now per-call flag gated by subscription
- Keep `default_duration_minutes` — still useful for form defaults

</decisions>

<specifics>
## Specific Ideas

- Free users who record a call see the recording tab, then see "Upgrade to Pro for automatic transcription" on the transcript tab — natural upsell after experiencing the value
- Pro users see "Upgrade to Partner" on the AI summary tab — similar progression
- The combined upgrade row for Free users should make it clear that Partner includes both transcription AND AI, so they know skipping Pro to Partner is an option

</specifics>

<deferred>
## Deferred Ideas

- Custom call types created by users — future phase (architecture supports it via lookup table)
- Mid-call recording start/stop — rejected for now (consent complexity)
- Storage limits dashboard showing usage per tier — future billing feature

</deferred>

---

*Phase: 53-per-call-recording-ai-controls*
*Context gathered: 2026-03-10*
