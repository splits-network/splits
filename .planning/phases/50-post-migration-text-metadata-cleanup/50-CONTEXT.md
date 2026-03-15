# Phase 50: Post-Migration Text & Metadata Cleanup - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix all remaining "interview" references in user-facing text, API documentation, internal variable names, and notification metadata keys. Application pipeline stage "interview" is a legitimate domain concept and is excluded.

</domain>

<decisions>
## Implementation Decisions

### Recording consent text
- Change heading to "This Call Will Be Recorded"
- Change body to "This call will be recorded, transcribed, and summarized using AI."
- Keep it simple — no access/permission info added
- Quick audit of entire shared-video package for any other "interview" strings

### Metadata key format
- Underscore format wins: `call.recording_ready` (matches RabbitMQ routing key)
- Notification metadata eventType changes from `call.recording.ready` to `call.recording_ready`
- Audit ALL call event metadata keys for underscore vs dot inconsistency (not just recording_ready)
- Fix all mismatches found — don't defer any to a later phase
- Fix error log messages to match actual routing key format for debugging clarity

### Sweep scope
- Full grep sweep for "interview" across all services and packages
- Rename internal variable names (e.g., calendar component `interview` boolean flags) to `call`
- Fix log messages that reference old event key formats
- **Exclude:** Application pipeline stage "interview" — legitimate domain concept, stays as-is
- **Exclude:** Database enum values for application stages

### Swagger & API docs
- Video-service description changes to "Internal video call service for Splits Network"
- Audit ALL service Swagger descriptions for stale "interview" references
- Fix any found across api-gateway, ai-service, notification-service, call-service

### Claude's Discretion
- Exact replacement text for any other "interview" strings found during sweep
- Whether to combine small fixes into one plan or split by concern area
- Handling edge cases where "interview" might be ambiguous (context-dependent decision)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — straightforward rename/consistency work guided by the decisions above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 50-post-migration-text-metadata-cleanup*
*Context gathered: 2026-03-09*
