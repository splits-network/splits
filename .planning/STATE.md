# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements
**Current focus:** v9.0 Video Interviewing — Phase 34 Video Call Experience in progress

## Current Position

Phase: 34 of 38 (Video Call Experience)
Plan: 05 of 06
Status: In progress
Last activity: 2026-03-08 — Completed 34-05-PLAN.md (candidate interview flow)

Progress: ██████████░░░░░░░░░░ 50%

## Performance Metrics

**Cumulative (v2.0-v7.0):**
- Total plans completed: 70 (36 from v2.0-v5.0 + 20 from v6.0 + 14 from v7.0)
- v7.0: 14 plans, 6 phases

**v9.0 (current):**
- Plans completed: 9
- Phases completed: 1 (Phase 33)

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

### Pending Todos

None.

### Blockers/Concerns

- Phase 33: LiveKit K8s deployment has infrastructure risks (UDP port exposure, hostNetwork vs LoadBalancer, TURN on TCP 443). Highest-risk work -- fail fast. **Plan 01 complete -- manifests written.**
- Phase 36: LiveKit Egress to Azure Blob Storage compatibility (S3-compat API vs native Azure) needs verification during planning.
- Phase 37: Whisper API 25MB file limit for long recordings -- may need FFmpeg audio extraction fallback.

## Session Continuity

Last session: 2026-03-08
Stopped at: Completed 33-04-PLAN.md (video-service deployment gaps)
Resume file: None
Next: 34-06-PLAN.md

---
*Created: 2026-02-12*
*Last updated: 2026-03-08 (33-04 complete)*
