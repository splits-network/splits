---
phase: 12-oauth2-provider
plan: 06
status: complete
duration: ~4 min
commits:
  - e3b689e0  # feat(12-06): add Connected Apps section to candidate profile page
  - 80c238b6  # feat(12-06): create Clerk webhook handler for account deletion
---

## What was built

1. **Connected Apps section on profile page** - New card in the right column of the candidate profile showing active GPT sessions with:
   - Robot icon and "AI Job Copilot" label per session
   - Connected date, last active date, and expiry date
   - Scope badges showing granted permissions
   - Per-session revoke button with loading state
   - Loading spinner and empty state handling

2. **Clerk webhook handler** - New endpoint at `/api/v2/webhooks/clerk` in gpt-service that:
   - Handles `user.deleted` events by revoking all GPT sessions
   - Ignores non-deletion events gracefully (returns 200)
   - Logs webhook processing events
   - TODO for webhook signature verification (Phase 15)

## Key decisions

- Used `x-gpt-clerk-user-id` header for profile page → gpt-service auth (avoids gateway auth bypass conflict)
- Direct webhook endpoint rather than RabbitMQ consumer (identity-service doesn't publish user.deleted events)
- Deferred webhook signature verification to Phase 15 (Production Hardening)

## Files modified

- `apps/candidate/src/app/portal/profile/page.tsx` (modified - added Connected Apps card)
- `services/gpt-service/src/v2/oauth/webhook-handler.ts` (created)
- `services/gpt-service/src/v2/routes.ts` (modified - registered webhook routes)
