---
phase: 15-production-hardening
plan: 01
subsystem: infra
tags: [k8s, cronjob, svix, webhook, oauth, token-cleanup, deployment]

# Dependency graph
requires:
  - phase: 12-oauth-provider
    provides: "OAuth tables (gpt_authorization_codes, gpt_refresh_tokens, gpt_sessions) and webhook handler"
  - phase: 11-gpt-service-scaffold
    provides: "gpt-service K8s deployment and service manifests"
provides:
  - "2-replica gpt-service deployment with CLERK_WEBHOOK_SECRET"
  - "Token cleanup CronJob running every 6 hours (30-day retention)"
  - "Svix webhook signature verification on Clerk webhooks"
  - "Deploy workflow with gpt-secrets clerk-webhook-secret and CronJob deployment"
affects: []

# Tech tracking
tech-stack:
  added: [svix]
  patterns: [cronjob-token-cleanup, webhook-signature-verification]

key-files:
  created:
    - "infra/k8s/gpt-service/cronjobs/token-cleanup.yaml"
    - "services/gpt-service/src/jobs/token-cleanup.ts"
  modified:
    - "infra/k8s/gpt-service/deployment.yaml"
    - "services/gpt-service/src/v2/oauth/webhook-handler.ts"
    - "services/gpt-service/src/v2/routes.ts"
    - "services/gpt-service/src/index.ts"
    - "services/gpt-service/package.json"
    - ".github/workflows/deploy-aks.yml"

key-decisions:
  - "2 replicas safe for gpt-service (audit consumer uses exclusive queues)"
  - "30-day retention for expired OAuth artifacts before cleanup"
  - "1000-row batch limit on cleanup queries to avoid large transactions"
  - "Skip webhook verification in dev when CLERK_WEBHOOK_SECRET not configured"
  - "gpt_oauth_events kept indefinitely (no cleanup)"

patterns-established:
  - "CronJob token cleanup: same pattern as ats-service guarantee completion job"
  - "Svix webhook verification: verify headers before processing payload"

# Metrics
duration: 3min
completed: 2026-02-13
---

# Phase 15 Plan 01: GPT Service Production Hardening Summary

**2-replica deployment, 6-hour token cleanup CronJob, svix webhook signature verification, and deploy workflow updates**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-13T18:51:31Z
- **Completed:** 2026-02-13T18:54:42Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- gpt-service deployment updated to 2 replicas for redundancy with CLERK_WEBHOOK_SECRET env var
- Token cleanup CronJob runs every 6 hours, deleting expired auth codes, revoked refresh tokens, and expired sessions older than 30 days
- Clerk webhook endpoint now verifies signatures using svix before processing user.deleted events
- Deploy workflow creates CLERK_WEBHOOK_SECRET in gpt-secrets and applies CronJob manifests

## Task Commits

Each task was committed atomically:

1. **Task 1: K8s deployment update + token cleanup job + CronJob manifest** - `bf9df920` (feat)
2. **Task 2: Svix webhook verification + deploy workflow updates** - `20fc53a1` (feat)

## Files Created/Modified
- `infra/k8s/gpt-service/deployment.yaml` - Updated to 2 replicas, added CLERK_WEBHOOK_SECRET env var
- `infra/k8s/gpt-service/cronjobs/token-cleanup.yaml` - K8s CronJob running every 6 hours
- `services/gpt-service/src/jobs/token-cleanup.ts` - Standalone cleanup script for 3 OAuth tables
- `services/gpt-service/src/v2/oauth/webhook-handler.ts` - Svix signature verification before payload processing
- `services/gpt-service/src/v2/routes.ts` - Pass clerkWebhookSecret to webhook handler
- `services/gpt-service/src/index.ts` - Read CLERK_WEBHOOK_SECRET from env and pass to routes
- `services/gpt-service/package.json` - Added svix dependency
- `.github/workflows/deploy-aks.yml` - clerk-webhook-secret in gpt-secrets, CronJob deployment step

## Decisions Made
- 2 replicas safe because audit consumer uses exclusive queues (only one consumer gets each message)
- 30-day retention before cleanup (auth codes, revoked tokens, expired sessions)
- Batch limit of 1000 rows per cleanup query to avoid large transactions
- Skip webhook verification in development when CLERK_WEBHOOK_SECRET is not configured (log warning)
- Do NOT clean up gpt_oauth_events (keep audit trail indefinitely)

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

User must add `CLERK_WEBHOOK_SECRET` GitHub environment secret:
- Source: Clerk Dashboard -> Webhooks -> Signing Secret (whsec_...)
- Used by: gpt-service webhook endpoint for signature verification

## Next Phase Readiness
- gpt-service is production-hardened with redundancy, automated maintenance, and security
- Ready for Phase 15-02 if applicable

---
*Phase: 15-production-hardening*
*Completed: 2026-02-13*
