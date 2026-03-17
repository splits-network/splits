# Onboarding Service

Handles all onboarding flows with **atomic database transactions** — no cross-service HTTP race conditions.

## Port

3023

## Flows

| Flow | Endpoint | Tables |
|------|----------|--------|
| Business | `POST /api/v3/onboarding/business` | organizations, memberships, companies, company_billing_profiles, users |

## Key Design Decision

This service writes directly to tables owned by other services (identity, ats, billing) because onboarding requires **transactional atomicity** across those domains. The alternative — sequential HTTP calls to each service — caused race conditions where downstream services couldn't see records created milliseconds earlier.

## Adding New Flows

1. Create `src/v3/<flow>/types.ts`, `service.ts`, `routes.ts`
2. Register in `src/v3/routes.ts`
3. If the flow needs atomic multi-table writes, create a Postgres RPC function via migration
4. Update gateway to proxy the endpoint to this service
