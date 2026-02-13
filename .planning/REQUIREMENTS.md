# Requirements: Custom GPT (Applicant Network)

**Defined:** 2026-02-13
**Core Value:** Candidates interact with Applicant.Network via natural language through a Custom GPT in ChatGPT.

## v1 Requirements

### Infrastructure

- [x] **INFRA-01**: gpt-service microservice scaffold (Fastify, TypeScript, health check, shared packages)
- [x] **INFRA-02**: Database migration with OAuth tables (gpt_authorization_codes, gpt_refresh_tokens, gpt_oauth_events)
- [x] **INFRA-03**: Environment configuration (GPT_CLIENT_ID, GPT_CLIENT_SECRET, GPT_JWT_SECRET, token expiry settings)

### Authentication

- [x] **AUTH-01**: OAuth2 authorize endpoint redirects to Clerk login and issues authorization code
- [x] **AUTH-02**: OAuth2 token endpoint exchanges authorization code for access token + refresh token
- [x] **AUTH-03**: OAuth2 token refresh endpoint issues new access token from refresh token (with rotation)
- [x] **AUTH-04**: OAuth2 token revocation endpoint invalidates refresh tokens
- [x] **AUTH-05**: api-gateway routes /api/v1/gpt/* to gpt-service with Clerk auth bypass
- [x] **AUTH-06**: gpt-service validates GPT access tokens and extracts clerk_user_id
- [x] **AUTH-07**: CORS configuration allows ChatGPT origins for OAuth endpoints

### Endpoints

- [x] **ENDP-01**: Job search endpoint accepts keywords, location, commute type, job level and returns GPT-formatted results
- [x] **ENDP-02**: Job details endpoint returns comprehensive job info including requirements, pre-screen questions, and company details
- [x] **ENDP-03**: Application status endpoint returns candidate's applications with human-readable status and job context
- [x] **ENDP-04**: Application submission endpoint with confirmation safety pattern (CONFIRMATION_REQUIRED on first call, executes on confirmed=true)
- [x] **ENDP-05**: Application submission accepts pre-screen question answers collected conversationally by GPT
- [x] **ENDP-06**: Resume analysis endpoint parses candidate resume and scores fit against a specific job posting
- [x] **ENDP-07**: All endpoints use resolveAccessContext() with candidate-scoped data isolation

### Configuration

- [x] **CONF-01**: OpenAPI 3.0.1 schema defining all GPT Actions with operationIds, descriptions, and OAuth2 security scheme
- [x] **CONF-02**: OpenAPI schema served at /api/v1/gpt/openapi.yaml endpoint
- [x] **CONF-03**: GPT Instructions document covering all action scenarios, confirmation rules, and error handling
- [x] **CONF-04**: x-openai-isConsequential annotation on all write action operations

### Hardening

- [x] **HARD-01**: Kubernetes deployment manifest for gpt-service
- [x] **HARD-02**: GPT-specific rate limiting per user in api-gateway
- [x] **HARD-03**: Token cleanup job expiring old authorization codes and revoked refresh tokens
- [x] **HARD-04**: Audit logging for all GPT OAuth events and action executions via RabbitMQ

## Out of Scope

| Feature | Reason |
|---------|--------|
| Splits.Network GPT features (recruiter search, candidate search, split opportunities) | Future milestone -- separate audience, separate GPT |
| Contract execution via GPT | Too risky for v1 |
| Payment processing via GPT | Too risky for v1 |
| Fully autonomous submissions | All writes require explicit confirmation |
| GPT Store publishing | v5.0 builds the backend; store listing is a separate step |
| File upload through GPT Actions | GPT Actions have limited file support; use existing uploaded resumes |
| Smart job recommendations (profile-based matching) | High complexity, defer to v5.1 |
| Application progress notifications | Nice but not critical for launch |
| Custom chat history/memory | ChatGPT handles conversation context natively |
| Server-side NLP for query parsing | GPT IS the NLP layer; backend receives structured params |
| Response caching | Jobs/applications change frequently; stale data worse than latency |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 11 | Complete |
| INFRA-02 | Phase 11 | Complete |
| INFRA-03 | Phase 11 | Complete |
| AUTH-01 | Phase 12 | Complete |
| AUTH-02 | Phase 12 | Complete |
| AUTH-03 | Phase 12 | Complete |
| AUTH-04 | Phase 12 | Complete |
| AUTH-05 | Phase 12 | Complete |
| AUTH-06 | Phase 12 | Complete |
| AUTH-07 | Phase 12 | Complete |
| ENDP-01 | Phase 13 | Complete |
| ENDP-02 | Phase 13 | Complete |
| ENDP-03 | Phase 13 | Complete |
| ENDP-04 | Phase 13 | Complete |
| ENDP-05 | Phase 13 | Complete |
| ENDP-06 | Phase 13 | Complete |
| ENDP-07 | Phase 13 | Complete |
| CONF-01 | Phase 14 | Complete |
| CONF-02 | Phase 14 | Complete |
| CONF-03 | Phase 14 | Complete |
| CONF-04 | Phase 14 | Complete |
| HARD-01 | Phase 15 | Complete |
| HARD-02 | Phase 15 | Complete |
| HARD-03 | Phase 15 | Complete |
| HARD-04 | Phase 15 | Complete |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-13 (Phase 15 complete, all requirements met)*
