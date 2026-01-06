# V2 Services Event-Driven Audit

## Overview
- After removing every V1 path, we re-ran the audit across all `services/*/src/v2` modules (and their event consumers) to verify no synchronous cross-service dependencies survived.
- Goal: document the remaining V2 code that still talks to peer services over HTTP/REST and outline the events/read models required so each domain service can rely exclusively on local projections plus asynchronous events.

## Snapshot of Required Changes
- **AI Service** – `AIReviewServiceV2` pulls full application/job/candidate context from ATS via HTTP before every review, and the domain consumer depends on that enrichment.
- **Network Service** – `RecruiterCandidateServiceV2` mutates ATS candidates directly through an `AtsClient` when candidates accept invites; needs events instead of PATCH/POST hops.
- **Notification Service** – every event handler plus `EmailLookupHelper` hydrate context by calling Identity, ATS, and Network through an internal `ServiceRegistry`.
- **Automation Service** – the V2 `AIReviewService` still shells out to the AI service over REST even though the newer domain-consumer path expects a pure event-driven trigger.
- **Other V2 services (ATS, Identity, Billing, Document)** – no synchronous inter-service calls detected; they already rely on repositories + events only.

## Findings by Service

### AI Service (`services/ai-service`)
- `services/ai-service/src/v2/reviews/service.ts:45-171` (`enrichInputIfNeeded`) calls `fetch(${ATS_SERVICE_URL}/api/v2/applications/:id?include=job,candidate,job_requirements,documents,pre_screen_answers)` every time we need to populate an `AIReviewInput`. This makes AI reviews depend on ATS uptime and couples the schema to ATS responses.
- The event consumer in `services/ai-service/src/domain-consumer.ts:139` and `:192` invokes `aiReviewService.enrichApplicationData` immediately after receiving `application.created` or `application.stage_changed`. Because the event payloads only contain IDs, every consumer message results in synchronous ATS calls.
- **Migration plan**
  1. Extend ATS V2 to publish an `application.snapshot.updated` (or similar) event whenever applications, candidates, jobs, requirements, documents, or pre-screen answers change. Include the full shape AI needs (resume text, requirements, recruiter linkage).
  2. Add a lightweight read model inside AI service (e.g., Postgres tables populated by the new snapshot events) so `enrichInputIfNeeded` can look up local state instead of calling 
  3. Update the domain consumer to fail fast when payloads are incomplete and rely on the read model; only fall back to ATS HTTP while the migration is in progress.

### Network Service (`services/network-service`)
- `services/network-service/src/v2/recruiter-candidates/service.ts:12-204` still instantiates the shared `AtsClient` (imported via `../../clients`, which resolves to `packages/shared-clients/src/ats-client.ts`). During `acceptInvitationByToken` the service:
  - Calls `atsClient.linkCandidateToUser` to POST `candidates/:id/link-user` (L185).
  - Fetches `/candidates/:id` (L193) and then PATCHes the ATS candidate to attach `recruiter_id` (L196).
  - Emits `candidate.sourced` only after the direct write succeeds.
- This introduces tight coupling to ATS endpoints and causes transactional complexity (network-service can't tell if ATS accepted the link without polling).
- **Migration plan**
  1. Teach ATS V2 to listen for `candidate.consent_given`, `candidate.invited`, and `candidate.invitation_cancelled` events (which network-service already emits) and have ATS update its `candidates` table accordingly.
  2. If ATS needs additional context (e.g., `user_id`), include it in the existing recruiter-candidate events so network-service never has to call `/candidates/:id`.
  3. Remove `AtsClient` from V2 once ATS consumes the new events; legacy `services/network-service/src/service.ts` paths will also need a V2 equivalent or event bridge.

### Notification Service (`services/notification-service`)
- `services/notification-service/src/clients.ts:7-68` defines a generic `ServiceClient` that makes raw `fetch` calls into Identity, ATS, and  Every V2 notification path uses this client through the shared `ServiceRegistry`.
- `services/notification-service/src/helpers/email-lookup.ts:30-212` (`EmailLookupHelper`) is effectively an HTTP orchestrator: resolving emails requires GET `/users/:id`, `/users/by-clerk-id/:clerkUserId`, `/recruiters/:id`, `/candidates/:id`, and `/organizations/:id/memberships`.
- Each event handler (applications, candidates, placements, proposals, invitations, recruiter-submission, collaboration) repeatedly calls those clients. Examples:
  - `services/notification-service/src/consumers/applications/consumer.ts:25-1100` fetches ATS jobs/candidates/companies for every stage change, recruiter submission, AI review, and withdrawal event, often multiple times per message.
  - `services/notification-service/src/consumers/candidates/consumer.ts:25-256` fetches ATS candidate records and Network recruiter profiles before sending ownership/conflict emails.
  - Similar patterns exist in `consumers/proposals/consumer.ts`, `consumers/placements/consumer.ts`, `consumers/invitations/consumer.ts`, and `consumers/recruiter-submission/consumer.ts`.
- **Migration plan**
  1. Introduce event streams for identity data (`user.created|updated`, `organization.membership.updated`) so notification-service can maintain a local projection of emails, names, and organization roles.
  2. Enhance ATS and network events (`application.*`, `candidate.*`, `recruiter.*`, `proposal.*`, `placement.*`) to carry the contextual fields the email templates need (job title, company name, recruiter contact info, candidate email).
  3. Build read models inside notification-service keyed by `application_id`, `candidate_id`, `job_id`, etc., hydrated from those events.
  4. Once projections exist, delete `ServiceRegistry` + `EmailLookupHelper` HTTP flows and have consumers read from the local cache; only external email vendors should be called synchronously.

### Automation Service (`services/automation-service`)
- `services/automation-service/src/v2/ai-review/service.ts:19-96` still shells out to `${AI_SERVICE_URL}/v2/ai-reviews` with `fetch` and an internal service key whenever an automation flow wants to trigger an AI review.
- The updated domain consumer (`services/automation-service/src/v2/shared/domain-consumer.ts:20-78`) instantiates this class even though the handler currently ignores AI review events, meaning the wiring is incomplete and we still have a code path that relies on synchronous HTTP.
- **Migration plan**
  1. Drop the direct call; emit an `ai_review.requested` (or extend `application.stage_changed`) event with the needed IDs whenever automation wants a review.
  2. Let the AI service consume that event (it already listens for `application.stage_changed`) so no automation code needs REST fallbacks.
  3. Delete the unused `AIReviewService` shim after verifying AI service handles the new event contracts.

### Services Already Isolated
- **ATS Service (`services/ats-service/src/v2/**/*`)** – all modules operate on repositories scoped to ATS schemas and rely on RabbitMQ domain consumers; no HTTP clients detected.
- **Identity Service (`services/identity-service/src/v2/**/*`)**, **Billing Service (`services/billing-service/src/v2/**/*`)**, and **Document Service (`services/document-service/src/v2/**/*`)** – only touch their own databases plus storage providers and emit events through the shared publisher.

## Migration Backlog & Next Steps
1. **Design payload-rich events**
   - From ATS: `application.snapshot.updated`, `candidate.document.processed`, and `job.requirements.updated` so AI + notifications never call 
   - From Identity: `user.updated`, `organization.membership.updated` for notification projections.
   - From Network: ensure `candidate.invited/consent_given/consent_declined` include `user_id`, recruiter metadata, and timestamps so ATS can update without HTTP callbacks.
2. **Provision local read models**
   - Stand up projection tables inside AI and notification services fed by the above events.
   - Backfill initial snapshots (one-time ETL or replay) so we can remove the HTTP calls without losing data.
3. **Delete synchronous clients**
   - Remove the `AtsClient` dependency from `services/network-service/src/v2/recruiter-candidates/service.ts` once ATS reacts to recruiter-candidate events.
   - Remove `services/notification-service/src/clients.ts` and collapse `EmailLookupHelper` onto the new projections.
   - Remove `services/automation-service/src/v2/ai-review/service.ts` after AI service handles the requested events.
4. **Audit for stragglers**
   - After the above changes, rerun this audit to ensure no `fetch`/`ServiceClient` references remain under `services/*/src/v2`.

Addressing these gaps will keep V2 compliant with the event-driven guardrails: every service processes domain events, updates its own read models, and emits downstream events instead of coupling directly to peer REST APIs.
