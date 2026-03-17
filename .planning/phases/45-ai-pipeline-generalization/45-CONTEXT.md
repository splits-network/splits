# Phase 45: AI Pipeline Generalization - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend the existing v9.0 AI pipeline (transcription + summarization) to work for all call types. Per-call-type prompts produce relevant output (interview assessment vs business meeting recap). Recordings, transcripts, and summaries are stored on call records, not entity note tables. No new call types or UI pages — this phase generalizes the existing pipeline.

</domain>

<decisions>
## Implementation Decisions

### Summary output format
- Every summary starts with a one-line TL;DR for quick scanning in list views
- Recruiting call summaries focus on action items & outcomes (key decisions, next steps, follow-ups)
- Interview summary structure is Claude's discretion (extend what v9.0 already produces)
- Output format is markdown (renders in portal UI, human-readable)
- No regeneration — summaries are one-shot only

### Prompt strategy
- Prompt routing is by `call_type` field — simple lookup (interview prompt vs client_meeting prompt)
- Entity context injected into prompts: participant names & roles, entity details (job title, company name, stage), and call metadata (duration, tags, purpose)
- Prompt templates stored as code constants in ai-service (changes require deploy)
- Whether to extract action items as a separate structured field is Claude's discretion

### Pipeline trigger & flow
- Auto-trigger for all call types — every recorded call automatically transcribes and summarizes
- Error handling (auto-retry behavior) is Claude's discretion based on existing v9.0 patterns
- Call detail UI shows step-by-step pipeline status: Recording → Transcribing → Summarizing → Complete

### Summary storage & linking
- Summaries stored in existing `call_summaries` table (JSONB `summary` column with unique per call_id)
- JSONB shape is rich metadata: includes `tldr`, `content` (markdown), `call_type`, `prompt_version`, `model`
- All artifacts (recordings, transcripts, summaries) are call-owned only — never copied to entity note tables
- Summaries accessible from both entity pages (via entity call tabs) and call detail page
- Entity page summary preview depth is Claude's discretion

### Claude's Discretion
- Interview summary section structure (extend v9.0 patterns)
- Whether action items are extracted as separate structured field or inline in markdown
- Error handling and retry strategy (follow v9.0 patterns)
- Entity page summary preview format (TL;DR only vs expandable)
- Exact JSONB metadata fields beyond tldr/content/call_type/model

</decisions>

<specifics>
## Specific Ideas

- TL;DR examples: "Strong candidate, recommend advance to next round" (interview) or "Agreed to 3 new job postings, follow-up next Tuesday" (recruiting call)
- Pipeline status should be visible step-by-step in the call detail UI so users know where processing is at

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 45-ai-pipeline-generalization*
*Context gathered: 2026-03-08*
