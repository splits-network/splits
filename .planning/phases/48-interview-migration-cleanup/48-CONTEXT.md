# Phase 48: Interview Migration Cleanup - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove all dead interview-era code, references, and naming from the codebase after the Phase 46 migration. This includes gateway auth-skip rules, shared-video hooks, storage bucket references, and interview-named types/fields across all packages and services. No new capabilities — pure cleanup.

</domain>

<decisions>
## Implementation Decisions

### Bucket reference cleanup
- Storage is Supabase Storage (NOT Azure Blob Storage) — `call-recordings` bucket already exists
- Sweep code, env vars, AND K8s manifests for any `interview-recordings` references
- Dead references: delete entirely. Live references: redirect to `call-recordings`
- Do NOT drop the old `interview-recordings` Supabase Storage bucket — leave for manual ops cleanup

### Gateway auth rule cleanup
- Remove interview-specific auth-skip rules from api-gateway
- Full sweep: remove any interview-specific middleware, transformers, or helpers in gateway (not just routes)
- Verify each interview proxy route is actually dead before removing — don't assume Phase 46 caught everything

### Dead hook and type cleanup
- Sweep ALL packages (shared-video, shared-types, shared-utils, etc.) for interview leftovers — not just shared-video
- Rename interview-named types to call-based naming (e.g., InterviewContext → CallContext) across all consumers
- Rename end-to-end: backend response fields AND frontend types together for consistency
- Remove dead exports/hooks that are no longer imported anywhere

### Claude's Discretion
- Which gateway auth-skip rules qualify as dead (Claude traces each route)
- Which shared-video exports are unused (Claude checks import graph)
- How aggressively to sweep beyond the explicit success criteria items

</decisions>

<specifics>
## Specific Ideas

- Phase 46 decision [46-03] noted: "Kept interview_type field name in CallContext (matches existing API response shape)" — this should now be renamed end-to-end
- Phase 46 decision [46-02] noted: "Created dedicated call recording webhook replacing unified interview+call webhook" — verify the old unified webhook code is fully removed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 48-interview-migration-cleanup*
*Context gathered: 2026-03-09*
