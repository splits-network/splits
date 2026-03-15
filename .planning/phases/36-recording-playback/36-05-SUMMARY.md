---
phase: 36-recording-playback
plan: 05
subsystem: api, ui
tags: [azure-blob, sas-url, video-player, recording-playback, html5-video]

requires:
  - phase: 36-01
    provides: Recording schema with blob_url, duration, status fields
  - phase: 36-02
    provides: Azure Blob Storage lifecycle policy and container config
  - phase: 36-03
    provides: Recording start/stop routes and webhook handler
  - phase: 36-04
    provides: Recording consent UX and state hooks

provides:
  - SAS URL generation helper for time-limited Azure Blob access
  - Playback and download URL endpoints with participant/admin authorization
  - InterviewRecordingCard component with expiry warning
  - InterviewRecordingPlayer with native HTML5 video controls
  - JoinInterviewButton integration showing recordings for completed interviews

affects: [36-06-integration]

tech-stack:
  added: ["@azure/storage-blob"]
  patterns: [sas-url-generation, recording-access-authorization]

key-files:
  created:
    - services/video-service/src/v2/interviews/sas-url-helper.ts
    - apps/portal/src/app/portal/applications/[id]/components/interview-recording-card.tsx
    - apps/portal/src/app/portal/applications/[id]/components/interview-recording-player.tsx
  modified:
    - services/video-service/src/v2/interviews/recording-routes.ts
    - services/video-service/src/v2/interviews/repository.ts
    - services/video-service/src/v2/routes.ts
    - services/video-service/package.json
    - apps/portal/src/app/portal/applications/[id]/components/join-interview-button.tsx

key-decisions:
  - "SAS URL helper extracted as reusable module for playback and download"
  - "Company admin authorization via application->job->company->member role chain"
  - "1-hour SAS token expiry for playback, content-disposition header for downloads"

patterns-established:
  - "SAS URL generation: generateSasUrl(azureConfig, options) pattern"
  - "Recording access: participant OR company admin authorization"

duration: 4min
completed: 2026-03-08
---

# Phase 36 Plan 05: Recording Playback Summary

**SAS URL endpoints with participant/admin auth, recording card with expiry badges, and HTML5 video player on application detail page**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-08T07:13:38Z
- **Completed:** 2026-03-08T07:17:38Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Time-limited SAS URL endpoints for secure recording playback and download
- Authorization check allowing interview participants and company admins
- Recording card with date, duration, participants, and 90-day expiry warning badges
- Native HTML5 video player in DaisyUI modal with loading/error states
- JoinInterviewButton now renders recording card for completed interviews

## Task Commits

Each task was committed atomically:

1. **Task 1: SAS URL endpoint for secure playback** - `db142c5f` (feat)
2. **Task 2: Recording card and video player on application page** - `5b3e7f13` (feat)

## Files Created/Modified
- `services/video-service/src/v2/interviews/sas-url-helper.ts` - Reusable SAS URL generation with blob path extraction
- `services/video-service/src/v2/interviews/recording-routes.ts` - Added playback-url and download-url endpoints
- `services/video-service/src/v2/interviews/repository.ts` - Added isCompanyAdminForInterview method
- `services/video-service/src/v2/routes.ts` - Pass Azure config to recording routes
- `services/video-service/package.json` - Added @azure/storage-blob dependency
- `apps/portal/src/app/portal/applications/[id]/components/interview-recording-card.tsx` - Recording card with play/download and expiry
- `apps/portal/src/app/portal/applications/[id]/components/interview-recording-player.tsx` - HTML5 video player in modal
- `apps/portal/src/app/portal/applications/[id]/components/join-interview-button.tsx` - Extended to show recording card

## Decisions Made
- SAS URL helper extracted as standalone module (`sas-url-helper.ts`) to avoid duplication between playback and download
- Company admin authorization traces application -> job -> company -> member role chain (sequential queries, consistent with existing token endpoint pattern)
- 1-hour SAS token expiry balances security with reasonable viewing time
- Download endpoint sets content-disposition header for browser download behavior

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Playback and download endpoints ready for integration testing
- Recording card renders in application detail page context
- Plan 06 can wire recording fields into GET interview response for parent component data flow

---
*Phase: 36-recording-playback*
*Completed: 2026-03-08*
