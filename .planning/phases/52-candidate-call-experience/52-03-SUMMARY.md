# Phase 52 Plan 03: Call Notification URL Routing Summary

**One-liner:** Per-participant URL routing in call notifications so candidates get candidateWebsiteUrl links instead of portalUrl

## What Was Done

### Task 1: Add candidateWebsiteUrl to CallsEventConsumer and route URLs per participant
- Added `isCandidate()` method to `DataLookupHelper` querying candidates table by user_id
- Added `candidateWebsiteUrl` constructor parameter to `CallsEventConsumer`
- Added `getJoinUrl()` and `getDetailUrl()` private helpers for URL routing
- Updated all email notification methods to build per-participant URLs using `buildCandidateStatusMap()`
- Candidates get `candidateWebsiteUrl/portal/dashboard` for detail URLs
- Candidates get `candidateWebsiteUrl/portal/calls/{id}/join` for join URLs
- Portal users continue to get `portalUrl/portal/calls/{id}` (no regression)
- Updated `domain-consumer.ts` to pass `candidateWebsiteUrl` to `CallsEventConsumer`

### Task 2: Add candidateWebsiteUrl to CallInAppNotificationService
- Added `candidateWebsiteUrl` constructor parameter to `CallInAppNotificationService`
- Added `getBaseUrl()` and `getCallActionUrl()` private helpers
- Updated all in-app notification methods with optional `isCandidate` parameter (backward-compatible)
- Updated `domain-consumer.ts` to pass `candidateWebsiteUrl` to `CallInAppNotificationService`
- Consumer passes `isCandidate` flag from candidate status map to in-app service calls

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 11950eb1 | feat(52-03): route call notification URLs per participant candidate status |
| 2 | f37b3f27 | feat(52-03): route in-app call notification URLs per participant candidate status |

## Deviations from Plan

None - plan executed exactly as written.

## Key Files

### Created
- None

### Modified
- `services/notification-service/src/helpers/data-lookup.ts` - Added `isCandidate()` method
- `services/notification-service/src/consumers/calls/consumer.ts` - Per-participant URL routing
- `services/notification-service/src/services/calls/in-app-service.ts` - Per-participant URL routing
- `services/notification-service/src/domain-consumer.ts` - Pass candidateWebsiteUrl to call services

## Verification

- TypeScript compilation passes with no errors
- All `candidateWebsiteUrl` injected via constructor in both consumer and in-app service
- No bare `this.portalUrl` URL construction outside helper methods in consumer.ts
- `domain-consumer.ts` passes `candidateWebsiteUrl` to both services
- All in-app method signatures backward-compatible (isCandidate optional, defaults false)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Added `isCandidate()` to DataLookupHelper | Follows existing pattern (chat consumer queries candidates table); centralizes candidate detection for reuse |
| Batch candidate status check via Map | Avoids N+1 queries per notification loop while keeping code simple |
| Candidates detail URL points to /portal/dashboard | Candidates don't have a call detail page in the candidate app |
| Optional isCandidate parameter | Backward-compatible - existing callers unaffected |

## Metrics

- Duration: ~7 minutes
- Completed: 2026-03-09
- Tasks: 2/2
