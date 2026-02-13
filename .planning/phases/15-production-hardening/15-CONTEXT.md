# Phase 15: Production Hardening - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Make gpt-service production-ready with Kubernetes deployment manifests, per-user rate limiting in api-gateway, automated token cleanup via cron job, and webhook signature verification. Existing audit event coverage is already comprehensive from Phases 11-13 -- verify it works end-to-end but don't expand scope.

</domain>

<decisions>
## Implementation Decisions

### Rate Limiting Thresholds
- Moderate overall: 30 requests/min per user for read endpoints (job search, job details, application status)
- Tiered limits: 10 requests/min per user for expensive endpoints (resume analysis, application submission)
- Enforcement at api-gateway level (existing pattern, not gpt-service middleware)
- Rate limit response: standard 429 with Retry-After header (GPT Instructions already handle 429 gracefully)

### Token Cleanup Policy
- Scheduled K8s CronJob (not in-process timer)
- Run every 6 hours
- Retention period: 30 days after expiry/revocation before deletion
- Clean up: expired authorization codes, revoked refresh tokens, expired sessions
- Do NOT purge gpt_oauth_events -- keep audit events indefinitely

### Deployment Sizing
- Follow same K8s deployment pattern as other services (existing manifest structure)
- 2 replicas for redundancy
- Resource limits: match other Fastify services (Claude reviews and matches)
- Add gpt-service to existing deploy-aks GitHub Actions workflow (not a separate workflow)
- Health check probes follow existing patterns

### Audit Event Coverage
- Existing events from Phases 11-13 are comprehensive -- no expansion needed
- Verify existing publishers and consumer work end-to-end
- Add Clerk webhook signature verification using svix library (deferred from Phase 12-06)
- New environment variable: CLERK_WEBHOOK_SECRET for svix signature verification
- Add to GitHub environment secrets alongside existing GPT secrets

### Claude's Discretion
- Exact resource limits (CPU/memory) based on reviewing other service manifests
- CronJob implementation details (container image, command structure)
- Rate limiting middleware implementation (Redis-based or in-memory, following existing gateway patterns)
- Token cleanup SQL query structure and batch sizing

</decisions>

<specifics>
## Specific Ideas

- Rate limiting should use the same mechanism already in api-gateway for other services
- CronJob should be a standalone K8s manifest, not embedded in the service deployment
- Webhook verification uses the svix library (Clerk's recommended approach)
- The deploy-aks workflow addition should mirror how other services are added (same Docker build, push, deploy steps)

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 15-production-hardening*
*Context gathered: 2026-02-13*
