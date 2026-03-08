# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements
**Current focus:** v9.0 Video Interviewing — Phase 38 in progress

## Current Position

Phase: 38 of 38 (Panel, Notes & Polish)
Plan: 1 of 4
Status: In progress
Last activity: 2026-03-08 — Completed 38-01-PLAN.md (Backend migration and API)

Progress: ████████████████████████ 99%

## Performance Metrics

**Cumulative (v2.0-v7.0):**
- Total plans completed: 70 (36 from v2.0-v5.0 + 20 from v6.0 + 14 from v7.0)
- v7.0: 14 plans, 6 phases

**v9.0 (current):**
- Plans completed: 34
- Phases completed: 5 (Phases 33-37), Phase 38 in progress

## Accumulated Context

### Decisions

See .planning/PROJECT.md Key Decisions table for full cumulative list.

Recent: LiveKit over Daily/Twilio/100ms (self-hostable on existing K8s, zero per-minute costs, full data control).

| Decision | Phase | Rationale |
|----------|-------|-----------|
| hostNetwork for LiveKit media | 33-01 | Simpler than LoadBalancer for UDP on AKS, avoids NAT traversal |
| Official Docker Hub images for LiveKit | 33-01 | Open source, no need for ACR |
| Egress on dedicated node pool | 33-01 | Isolate CPU-heavy encoding from general workloads |
| Extended interview_type enum (panel, debrief) | 33-01 | Supports multi-interviewer and post-interview workflows |
| video-service on port 3019 | 33-02 | Next available port after gamification-service (3018) |
| Room name format: interview-{uuid} | 33-02 | Unique, predictable, no PII exposure |
| Auth bypass for /join endpoint | 33-03 | Magic link candidates have no Clerk session |
| Lazy room name assignment | 33-03 | Room name set on first token generation if not already present |
| Sequential queries for context enrichment | 34-01 | Simpler than complex joins, negligible overhead for once-per-session token endpoint |
| User names from DB not Clerk API | 34-01 | Self-contained backend, no external API during token generation |
| Manual device enumeration in lobby | 34-02 | LiveKit MediaDeviceSelect requires room context, lobby has none |
| Web Audio API for lobby audio meter | 34-02 | LiveKit BarVisualizer requires room context, lobby uses raw tracks |
| isTrackReference guard for VideoTrack | 34-03 | useTracks returns placeholder union type; narrow before passing to VideoTrack |
| Always-visible controls bar | 34-03 | Professional interview context needs instant mute access |
| LiveKitRoom conditional mount (never in lobby) | 34-04 | Avoids premature WebRTC negotiation during lobby |
| New-tab interview via window.open | 34-04 | Preserves application context in original tab |
| Self-fetch interview in detail header | 34-04 | Follows existing AI score self-fetch pattern |
| Splits Network branding on candidate prep page | 34-05 | Not company-branded per CONTEXT.md deferred items |
| Lobby gate at 10 minutes before start | 34-05 | Prevents early access while allowing reasonable arrival |
| No auto-redirect for candidate post-call | 34-05 | Candidates close tab themselves; no redirect destination |
| meeting_platform as TEXT not enum | 35-01 | Easier to extend than PostgreSQL enum |
| Reschedule requests in separate table | 35-01 | Preserves audit trail of multiple reschedule attempts |
| working_days as ISO day numbers | 35-01 | International compatibility (1=Monday, 7=Sunday) |
| Channel token connectionId:calendarId for webhooks | 35-02 | Simple routing without DB lookup |
| Webhook receivers always return success | 35-02 | Prevent provider retry storms on processing errors |
| Gateway wildcard sufficient for scheduling routes | 35-03 | Existing app.all('/api/v2/interviews/*') catches all new endpoints |
| validateMagicLinkToken separate method | 35-03 | Reschedule requests need token validation without LiveKit JWT |
| Busy slots as input parameter | 35-03 | Frontend orchestrates calendar API; scheduling service receives pre-fetched busy data |
| Optional applicationId/applicationStage props | 35-04 | Backward compat with candidate toolbar which has no application context |
| Client-side slot computation from free/busy | 35-04 | Simpler than backend endpoint; slots capped at 100 |
| Interview events by "Interview:" prefix | 35-05 | Simple string convention, no DB lookup for rendering |
| Accent color for interview events | 35-05 | Visual distinction from regular calendar events |
| Join button 10-min pre-start window | 35-05 | Consistent with lobby gate timing from 34-05 |
| Stage promotion dialog on non-interview apps | 35-05 | User confirmation before changing application stage |
| Clerk-to-UUID resolution for calendar prefs | 35-06 | user_calendar_preferences FK requires internal UUID, not clerk ID |
| PUT method in gateway video proxy | 35-06 | Gateway switch only had GET/POST/PATCH/DELETE |
| Toast ref timer with cleanup | 35-06 | Prevent memory leaks on unmount for auto-dismiss |
| BaselWizardModal for reschedule, plain modal for cancel | 35-07 | Multi-step flow needs wizard; single-step cancel doesn't |
| Best-effort calendar event deletion on cancel | 35-07 | Don't block interview cancellation if calendar API fails |
| Company admins as interviewer recipients | 35-08 | Resolved via identity_organization_id, consistent with job notification pattern |
| All interview notifications use 'both' channel | 35-08 | High-priority events need email + in-app visibility |
| croner for in-process cron over K8s CronJob | 35-09 | 5-minute interval too frequent for K8s CronJob overhead |
| Reminder deduplication via notification_log | 35-09 | Prevents duplicate reminders on overlapping job runs |
| Available slots uses working hours, no busy slots | 35-10 | Simple approach for candidate-initiated reschedule |
| 60-second setInterval for countdown polling | 35-10 | Per CONTEXT.md guidance, no WebSocket needed |
| Azure credentials on both egress and video-service | 36-02 | Video-service orchestrates egress requests, needs credentials to pass per-request |
| emptyDir 10Gi for egress temp storage | 36-02 | Ephemeral encoding files, no need for PVC |
| H264_720P_30 preset for egress encoding | 36-01 | 1280x720, 30fps, H264/OPUS -- matches LiveKit built-in preset |
| Protobuf constructors for LiveKit egress types | 36-01 | livekit-server-sdk v2.9 uses proto3 Message classes |
| 90-day recording retention with 30-day tier transition | 36-02 | Hot→Cool at 30 days, delete at 90 per CONTEXT.md |
| Interviewer-only recording start/stop | 36-03 | Only interviewer participant role can control recording |
| Dual auth on consent endpoint | 36-03 | Magic link token OR Clerk header for candidate/authenticated user consent |
| Participant-gated blob URL | 36-03 | Only interview participants see recording blob URL |
| Warning-themed consent card | 36-04 | Draws attention without being alarming (bg-warning/5) |
| Recording opt-in per interview | 36-04 | Default unchecked; auto-record means auto-start IF enabled |
| SAS URL helper as reusable module | 36-05 | Avoids duplication between playback and download endpoints |
| Company admin auth via app->job->company chain | 36-05 | Sequential queries, consistent with existing token endpoint pattern |
| 1-hour SAS token expiry | 36-05 | Balances security with reasonable viewing session length |
| Task 1 changes already in codebase from 36-05 | 36-06 | Frontend recording integration was done as part of 36-05 component work |
| Transcript segments as JSONB | 37-01 | Flexible schema for speaker diarization without separate table overhead |
| Six-state pipeline status | 37-01 | Granular step display per CONTEXT.md locked decision (incl posting) |
| Gap-based speaker alternation heuristic | 37-02 | Whisper-1 lacks diarization; gap > 1s triggers speaker switch |
| Interview creator as AI note author | 37-02 | Valid FK required; platform_admin type + interview_summary note_type distinguishes AI |
| FFmpeg 64kbps/16kHz for large recordings | 37-02 | Keeps under Whisper 25MB while preserving speech quality |
| Upsert note design (one per participant per interview) | 38-01 | Auto-save friendly, no duplicate rows |
| Cross-table posting for interview notes | 38-01 | video-service directly inserts into application_notes |
| Round numbering by chronological position | 38-01 | 1-based from scheduled_at order |

### Pending Todos

None.

### Blockers/Concerns

- Phase 33: LiveKit K8s deployment has infrastructure risks (UDP port exposure, hostNetwork vs LoadBalancer, TURN on TCP 443). Highest-risk work -- fail fast. **Plan 01 complete -- manifests written.**
- Phase 36: LiveKit Egress to Azure Blob Storage compatibility (S3-compat API vs native Azure) needs verification during planning.
- Phase 37: Whisper API 25MB file limit handled via FFmpeg audio extraction fallback. ✓ Resolved.

## Session Continuity

Last session: 2026-03-08
Stopped at: Completed 38-01-PLAN.md
Resume file: None
Next: 38-02-PLAN.md

---
*Created: 2026-02-12*
*Last updated: 2026-03-08 (Phase 38 Plan 01 complete)*
