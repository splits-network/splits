# AGENTS.md

*Document the knowledge and context used in this session so future agents stay in the know.*

# Further Context and Guidelines for V2 Services and Client Apps
The /docs/migrations/V2-ARCHITECTURE-IMPLEMENTATION_GUIDE.md outlines the high-level architecture for V2 services and clients. This document captures additional context, guidelines, and requirements to ensure consistency and proper functioning across the codebase.

## V2 Architecture Guardrails

- **Use `/me` endpoints for user-specific singletons.** When a resource represents the current user's profile (candidate, recruiter, subscription), expose a `/me` alias that resolves to their actual record via `resolveAccessContext`. This prevents accidental data leakage from filtered queries and is more performant than `?limit=1`.
  - Examples: `/v2/users/me`, `/v2/candidates/me`, `/v2/recruiters/me`, `/v2/subscriptions/me`
  - `/me` endpoints MUST be registered BEFORE generic CRUD routes to avoid route conflicts
- **Gateway/frontends use `/me` for current user lookups.** Instead of filtering with `?limit=1`, use the `/me` endpoint which is both more secure and performant.
- **Shared access context lives in `@splits-network/shared-access-context`.** Every service imports `resolveAccessContext` from that package; do not reach into `services/shared/access-context.ts`.
- **RBAC checks rely on the above.** For example, the gateway checks the `candidate` role by calling `/v2/candidates/me`—this endpoint must exist and be properly secured.

## Project Phase Status (January 2026)

- ✅ **Phase 1**: AI Review Loop - COMPLETE
- ✅ **Phase 2/3**: Gate Review System - COMPLETE (originally planned as Phase 2, implemented as Phase 3)
- ✅ **Phase 4**: Portal UI for Recruiters - COMPLETE
- ✅ **Phase 5**: 5-Role Commission Structure - COMPLETE
- ✅ **Phase 6**: Canonical Payout Architecture - COMPLETE (testing pending)

**Note**: The file `PHASE-2-READY-TO-START.md` is outdated documentation. Phase 2 (gate review) was fully implemented as Phase 3. See `PHASE-3-COMPLETE-GATE-REVIEW-SYSTEM.md` for actual implementation.

## Recruiter-Candidate Responses

- The network service V2 repository enriches recruiter-candidate rows with recruiter metadata:
  - It gathers recruiter IDs, loads the corresponding `recruiters` plus linked `users`, and fills in `recruiter_name`, `recruiter_email`, `recruiter_bio`, and `recruiter_status` when missing.
  - As a result, frontends can expect these fields without additional joins.
- `/api/v2/recruiter-candidates` returns `{ data: RecruiterRelationship[], pagination: { ... } }`. Client code should read `response.data` before mapping.

## Candidate App Notes

- `apps/candidate/src/lib/api.ts#getMyRecruiters` now unwraps the `{ data }` envelope and maps enriched recruiter metadata. Do not revert back to the legacy array response shape.
- The profile page obtains the user’s candidate record via `/api/v2/candidates?limit=1`. Keep that contract so we never regress to `/api/candidates/me`.

## Portal App Requirements (next up)

- **Always call `/api/v2/*`.** When we migrate the portal pages, every data fetch must go through the V2 gateway routes (`/api/v2/jobs`, `/api/v2/recruiter-candidates`, `/api/v2/applications`, etc.). If a page still points at `/api/*` or `/api/<domain>/me`, update it to the V2 equivalent.
- **Handle `{ data, pagination }` responses.** Many V2 endpoints wrap results in this shape; portal components should destructure `const { data } = await client.get('/api/v2/<resource>')` before iterating.
- **No client-side role checks.** The backend enforces access via `resolveAccessContext`, so portal modules shouldn't attempt to hit "recruiter-only" variants (like `/api/recruiter-candidates/me`). Use the shared API helper and trust upstream scoping.
- **Reuse shared helpers.** If the portal needs recruiter metadata, rely on the enriched fields returned by `/api/v2/recruiter-candidates`-do not re-fetch `users` directly.

### Portal API Client Base URLs

- `apps/portal/src/lib/api-client.ts` now strips any trailing `/api`/`/api/v*` before appending `/api` or `/api/v2`. This keeps routes from turning into `/api/api/*` when environments set `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_API_GATEWAY_URL` to a path that already ends in `/api`.

### API Gateway Roles Route

- `services/api-gateway/src/routes/roles/routes.ts` must forward `buildAuthHeaders(request)` to ATS when calling `/companies` or `/jobs`; without the `x-clerk-user-id` header, ATS rejects the request and the portal recruiter dashboard sees 500s when loading top roles.

### Network Service V2 Proposals

- PostgREST cannot join across schemas, so `services/network-service/src/v2/proposals/repository.ts` now fetches jobs/candidates via follow-up queries in the `ats` schema and filters company users by precomputing accessible job IDs. Any new V2 repository must avoid `*` joins inside a `schema('public')` select to prevent `PGRST100` errors.
- The canonical proposals table lives at `candidate_role_assignments`. Remember to query that table (not a nonexistent `proposals`) whenever adding new V2 proposal endpoints or migrations.

### Notification APIs

- Portal and candidate apps now expose `/api/v2/notifications/*` Next.js proxies that forward to the API Gateway V2 routes. All notification helpers (`apps/*/src/lib/ts`) call these V2 paths, using `PATCH /api/v2/notifications/:id` to mark as read, `DELETE` to dismiss, `POST /api/v2/notifications/mark-all-read`, and `GET /api/v2/notifications/unread-count`. Keep any new notification fetches on the `/api/v2` surface so we don't reintroduce the legacy `/api/notifications` calls.

### Application Include Parameters

- `/api/v2/applications/:id` supports `?include=` with comma-separated keys. Accepted values are `candidate`, `job`, `recruiter`, `documents`, `pre_screen_answers`, `audit_log`, `job_requirements`, and `ai_review`. Services must load the base application row first, then conditionally fetch each include via follow-up queries (no multi-schema joins inside a single select). Client code should favor these include flags instead of bespoke `/full` endpoints.

### Related Resources

- Do **not** invent child endpoints (e.g., `/applications/:id/pre-screen-questions`) to expose related data. If a consumer needs a related collection, follow one of two patterns:
  1. Extend the canonical parent resource’s `?include=` contract (like applications include job requirements, documents, etc.).
  2. Stand up a proper top-level resource (e.g., `/v2/job-pre-screen-questions?job_id=...`, `/v2/job-requirements?job_id=...`) and call it through `/api/v2/<resource>`.
- Query parameters such as `job_id`/`application_id` keep filtering explicit while preserving the shared access-context enforcement in each service.
- ATS now exposes full CRUD for `job_pre_screen_questions`, `job_pre_screen_answers`, and `job_requirements` at `/api/v2/<resource>` (create/update/delete go through the same access-context pipeline). Use these when persisting candidate questionnaire responses instead of patching bespoke `/applications/*` actions.
- AI reviews follow the same pattern: `/api/v2/ai-reviews` (GET with `application_id`, GET by ID, POST) and `/api/v2/ai-review-stats?job_id=` are the canonical endpoints. Never add `/applications/:id/ai-review` or other child routes—use `include=ai_review` or call the top-level resource directly.

### Dashboard Statistics Endpoint

- `/api/v2/stats` proxies to the ATS V2 stats service and accepts `scope`/`type` and `range` query parameters (e.g., `GET /api/v2/stats?scope=recruiter&range=ytd`). Recruiter scope returns the metrics used on the recruiter dashboard (active_roles, candidates_in_process, offers_pending, placements_this_month, placements_this_year, total_earnings_ytd, pending_payouts). Reuse this endpoint for new dashboard widgets instead of creating bespoke `/.../stats` routes.

### Recruiter Invitation Actions

- Network Service V2 now exposes `/v2/recruiter-candidates/:id/resend-invitation` and `/v2/recruiter-candidates/:id/cancel-invitation`. API Gateway mirrors them at `/api/v2/recruiter-candidates/:id/...`, and the portal invitations client calls these routes instead of the legacy `/api/recruiter-candidates/*` endpoints. Use these V2 actions for any future invitation management features.

### Pending Applications Dashboard Widget

- `ApiClient.getPendingApplications` now queries `/api/v2/applications?stage=screen` instead of the legacy recruiter-specific endpoint, and both the recruiter dashboard widget plus `applications/pending` page rely on that V2 data (which already includes candidate/job joins). When building new recruiter-review flows, prefer this V2 filterable endpoint instead of `/recruiters/:id/pending-applications`.

## Supabase Table Usage Audit (2025-03-08)

- Compared Supabase public tables to runtime usage in apps/services.
- Tables with no runtime usage in apps/services (only migrations/docs): `candidate_sourcers`, `marketplace_events`.
  - `candidate_sourcers`: tracks first sourcer + protection window; shared types/clients expect sourcing endpoints, but no ATS/API Gateway routes exist yet.
  - `marketplace_events`: event log for marketplace actions/analytics; no service writes/consumers found.
- Auth schema tables are Supabase-managed internals; avoid treating them as app-owned resources.
- If implementing new resources, follow V2 guardrails: top-level `/api/v2/<resource>` routes with access-context scoping (no child endpoints).

## Public Pages SEO/SSR Notes (2026-01-14)

- Public list pages now seed SSR data from the API before hydrating client lists (candidate jobs + recruiter marketplace). Avoid reintroducing client-only fetch-only shells on public routes.
- Status pages are split into server wrappers + client components and accept `initialStatuses` in `useServiceHealth`. Keep the server wrapper fetching `/api-health/*` so crawlers see real status content.

## CRA Schema Specifications (2026-01-15)

**Date:** January 16, 2026  
**Status:** 📋 AUTHORITATIVE SPECIFICATION  
**Purpose:** Define the correct CRA schema for fiscal tracking and deal management

**Authoritative Reference**: See `docs/guidance/cra-schema-specifications.md` for complete specification.

### Core Schema Principles

- **CRA is the "deal record"** tracking candidate-job pairings through gate stages, NOT the attribution ledger (that's placement_snapshot).
- **Separated recruiter roles**: `candidate_recruiter_id` (Closer - represents candidate) and `company_recruiter_id` (Client/Hiring Facilitator - represents company) are distinct marketplace roles.
- **Sourcer attribution**: **NOT stored on CRA**. Authority lives in dedicated `candidate_sourcers` and `company_sourcers` tables with permanent attribution (first recruiter wins, account-based).
- **Job owner**: `job_owner_recruiter_id` on jobs table (NOT CRA). Only recruiters receive job owner commission (company employees excluded).
- **Required fields**: `candidate_id`, `job_id`, `proposed_by` must be NOT NULL (CRA without these is meaningless).
- **Uniqueness**: Only one active CRA per (candidate_id, job_id) pair. Enforced via partial unique constraint excluding terminal states.

### Schema Quick Reference

```sql
CREATE TABLE candidate_role_assignments (
    -- Core (REQUIRED)
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL,          -- FK to candidates
    job_id UUID NOT NULL,                -- FK to jobs
    proposed_by UUID NOT NULL,           -- FK to users (tracks initiator)
    
    -- Recruiter roles (OPTIONAL)
    candidate_recruiter_id UUID,         -- Closer role
    company_recruiter_id UUID,           -- Client/Hiring Facilitator role
    
    -- NOTE: Sourcer attribution NOT stored on CRA
    -- Query via JOINs to candidate_sourcers and company_sourcers tables
    
    -- State & gates
    state TEXT NOT NULL,
    current_gate TEXT,
    gate_sequence JSONB,
    gate_history JSONB,
    
    -- Unique constraint (one active deal per candidate+job)
    UNIQUE (candidate_id, job_id) WHERE state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed')
);
```

### Critical Anti-Patterns to Avoid

1. **DO NOT store money rates on CRA** - Split percentages belong on `placement_snapshot` (immutable money ledger).
2. **DO NOT store sourcer attribution on CRA** - Use dedicated `candidate_sourcers` and `company_sourcers` tables with timestamps (permanent attribution).
3. **DO NOT store job_owner on CRA** - Store as `job_owner_recruiter_id` on jobs table (references recruiters, not users).
4. **DO NOT pay job owner commission to company employees** - Only recruiters who create job postings get job owner payout.
5. **DO NOT create child endpoints** - Use top-level `/api/v2/candidate-role-assignments` with filters, not `/applications/:id/cra`.
6. **DO NOT conflate recruiter types** - `candidate_recruiter_id` and `company_recruiter_id` are distinct roles with different permissions and revenue shares.

### Migration Path

When implementing CRA schema updates:
1. Rename `recruiter_id` → `candidate_recruiter_id`
2. Add `company_recruiter_id` column
3. **Create sourcer tables** (`candidate_sourcers`, `company_sourcers`) with UNIQUE constraints
4. Add `job_owner_recruiter_id` to jobs table (references recruiters)
5. Enforce NOT NULL on `candidate_id`, `job_id`, `proposed_by`
6. Add partial unique constraint on (candidate_id, job_id)
7. Create indexes on all new columns and tables
8. Backfill sourcer data from existing candidates/companies if columns exist
9. Create `placement_snapshot` table for money attribution

See migration scripts:
- `services/ats-service/migrations/029_split_cra_recruiter_columns.sql`
- `services/ats-service/migrations/030_create_sourcer_tables.sql`
- `services/ats-service/migrations/031_add_job_owner_recruiter.sql`
- `services/billing-service/migrations/020_create_placement_snapshot.sql`

### TypeScript Interface

```typescript
export interface CandidateRoleAssignment {
    id: string;
    candidate_id: string;                    // REQUIRED
    job_id: string;                          // REQUIRED
    proposed_by: string;                     // REQUIRED
    candidate_recruiter_id: string | null;   // Optional
    company_recruiter_id: string | null;     // Optional
    // NOTE: Sourcer attribution NOT on CRA - query via candidate_sourcers/company_sourcers tables
    state: CRAState;
    current_gate: string | null;
    // ... other fields
}
```

### Query Patterns

```sql
-- Find CRAs where recruiter represents candidate
SELECT * FROM candidate_role_assignments WHERE candidate_recruiter_id = $1;

-- Find CRAs where recruiter represents company
SELECT * FROM candidate_role_assignments WHERE company_recruiter_id = $1;

-- Check for existing deal (respects unique constraint)
SELECT * FROM candidate_role_assignments 
WHERE candidate_id = $1 AND job_id = $2 
AND state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed');

-- Gate routing (both recruiter types)
SELECT 
    cra.*,
    cr.name as candidate_recruiter_name,
    cmr.name as company_recruiter_name
FROM candidate_role_assignments cra
LEFT JOIN recruiters cr ON cr.id = cra.candidate_recruiter_id
LEFT JOIN recruiters cmr ON cmr.id = cra.company_recruiter_id
WHERE cra.id = $1;
```

### Documentation Index

- **Authoritative Spec**: `docs/guidance/cra-schema-specifications.md` (complete reference)
- **Quick Reference**: `docs/guidance/cra-schema-quick-reference.md` (developer lookup)
- **Implementation Plan**: `docs/flows/plan-applicationProposalFlowImplementationAlignment.prompt.md` (section 6.3)
- **Phase 2 Gates**: `docs/flows/PHASE-2-GATE-REVIEW-IMPLEMENTATION-PLAN.md` (schema + routing)
- **Tracking Doc**: `CRA-SCHEMA-GUIDANCE-UPDATE.md` (implementation checklist)
---

## Sourcer Permanent Attribution Tables (2026-01-16)

**Sourcer Definition:** The recruiter who first brings a candidate or company to the platform.

### Sourcer Tables Schema

```sql
-- Candidate sourcing attribution (permanent record)
CREATE TABLE candidate_sourcers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    sourcer_recruiter_id UUID NOT NULL REFERENCES recruiters(id),
    sourced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Only one sourcer per candidate (first recruiter wins)
    UNIQUE(candidate_id)
);

-- Company sourcing attribution (permanent record)
CREATE TABLE company_sourcers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sourcer_recruiter_id UUID NOT NULL REFERENCES recruiters(id),
    sourced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Only one sourcer per company (first recruiter wins)
    UNIQUE(company_id)
);

CREATE INDEX idx_candidate_sourcers_recruiter ON candidate_sourcers(sourcer_recruiter_id);
CREATE INDEX idx_company_sourcers_recruiter ON company_sourcers(sourcer_recruiter_id);
```

### Critical Business Rules

1. **Permanence**: Sourcer attribution is **permanent** while the recruiter maintains an active account
2. **One Sourcer**: Only **one sourcer** per candidate and one sourcer per company (first recruiter wins)
3. **Inactive Handling**: If sourcer's account becomes inactive, sourcer fee is **NOT paid out** (platform consumes remainder)
4. **Commission Structure**: Sourcer gets base 6% commission + bonus (0-4%) based on subscription tier
5. **No Time Limit**: Permanence is account-based, not time-based (no expiration)
6. **No Transfer**: If sourcer leaves, attribution remains but no payout (platform consumes fee, no transfer to another recruiter)

### Why Separate Tables?

- Tracks historical timestamp (when sourcing occurred)
- Enables future capabilities (e.g., handling candidate reactivation)
- Cleaner than denormalized columns on multiple tables
- Authority is explicit and cannot be accidentally overwritten
- UNIQUE constraints enforce one sourcer rule

### Query Patterns

```sql
-- Get candidate's sourcer (if exists)
SELECT 
    cs.sourcer_recruiter_id,
    r.name as sourcer_name,
    cs.sourced_at,
    r.status as sourcer_account_status
FROM candidate_sourcers cs
JOIN recruiters r ON r.id = cs.sourcer_recruiter_id
WHERE cs.candidate_id = $1;

-- Get company's sourcer (if exists)
SELECT 
    cos.sourcer_recruiter_id,
    r.name as sourcer_name,
    cos.sourced_at,
    r.status as sourcer_account_status
FROM company_sourcers cos
JOIN recruiters r ON r.id = cos.sourcer_recruiter_id
WHERE cos.company_id = $1;

-- Check if sourcer account is active before payout
SELECT 
    cs.sourcer_recruiter_id,
    r.status
FROM candidate_sourcers cs
JOIN recruiters r ON r.id = cs.sourcer_recruiter_id
WHERE cs.candidate_id = $1
  AND r.status = 'active';  -- Only pay if active
```

---

## Five-Role Commission Structure (2026-01-16)

Every placement has up to **5 commission-earning roles** (all nullable):

1. **Candidate Recruiter** ("Closer") - Represents the candidate
2. **Job Owner** ("Specs Owner") - Created the job posting (recruiter only)
3. **Company Recruiter** ("Client/Hiring Facilitator") - Represents the company
4. **Company Sourcer** ("BD") - First brought company to platform
5. **Candidate Sourcer** ("Discovery") - First brought candidate to platform

### Subscription Tier Rates

| Role | Premium ($249/mo) | Paid ($99/mo) | Free ($0/mo) |
|------|-------------------|---------------|-------------|
| Candidate Recruiter | 40% | 30% | 20% |
| Job Owner | 20% | 15% | 10% |
| Company Recruiter | 20% | 15% | 10% |
| Company Sourcer | 6% + 4% = **10%** | 6% + 2% = **8%** | **6%** |
| Candidate Sourcer | 6% + 4% = **10%** | 6% + 2% = **8%** | **6%** |
| **Platform Remainder** | **0%** | **24%** | **48%** |

### Sourcer Commission Breakdown

- **Base rate**: 6% (all tiers)
- **Premium bonus**: +4% = 10% total
- **Paid bonus**: +2% = 8% total
- **Free bonus**: +0% = 6% total
- **Only paid while sourcer account is active**

### Nullable Roles & Platform Remainder

**All roles are nullable:**
- Direct candidates (no candidate recruiter)
- Direct companies (no company recruiter)
- Companies not sourced (no company sourcer)
- Candidates not sourced (no candidate sourcer)
- Jobs created by company employees (no job owner payout)

**When role is NULL:** That commission percentage goes to platform as remainder.

**Example (Paid Plan, Direct Candidate):**
- Candidate Recruiter: NULL → 30% to platform
- Job Owner: 15%
- Company Recruiter: 15%
- Company Sourcer: 8%
- Candidate Sourcer: 8%
- **Platform Total:** 30% + 24% = 54%

### Job Owner Rules

- **Location**: `jobs.job_owner_recruiter_id` (NOT on CRA, NOT on users)
- **Type**: References `recruiters(id)` (enforces recruiter-only)
- **Nullable**: YES (company employees can create jobs without commission)
- **Business Rule**: Only recruiters who post jobs on behalf of companies get this payout
- **Company employees**: hiring_manager and company_admin do NOT receive job owner commission

### Money Snapshot at Hire (Immutable)

All commission rates and role assignments must be snapshotted in `placement_snapshot` table at hire time:

```sql
CREATE TABLE placement_snapshot (
    placement_id UUID PRIMARY KEY REFERENCES placements(id),
    
    -- Role assignments (snapshotted at hire)
    candidate_recruiter_id UUID,
    company_recruiter_id UUID,
    job_owner_recruiter_id UUID,
    candidate_sourcer_recruiter_id UUID,
    company_sourcer_recruiter_id UUID,
    
    -- Commission rates (snapshotted at hire)
    candidate_recruiter_rate DECIMAL(5,2),
    company_recruiter_rate DECIMAL(5,2),
    job_owner_rate DECIMAL(5,2),
    candidate_sourcer_rate DECIMAL(5,2),
    company_sourcer_rate DECIMAL(5,2),
    
    -- Total fee and subscription tier at hire
    total_placement_fee DECIMAL(10,2),
    subscription_tier TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Critical Rules:**
- CRA tracks deal state and role assignments (mutable during deal)
- placement_snapshot tracks money attribution (immutable after hire)
- Commission calculations ALWAYS use placement_snapshot (never live CRA data)
- If sourcer account becomes inactive after hire, payout still uses snapshotted rate

### Attribution Chain

```
Permanent Sourcer Attribution (Never Changes):
    candidate_sourcers.sourcer_recruiter_id (first recruiter wins)
    company_sourcers.sourcer_recruiter_id (first recruiter wins)
    candidate_sourcers.sourced_at (timestamp proof)
    company_sourcers.sourced_at (timestamp proof)

Deal Attribution (Live During Deal):
    candidate_role_assignments.candidate_recruiter_id (Closer role)
    candidate_role_assignments.company_recruiter_id (Client role)
    jobs.job_owner_recruiter_id (Specs Owner role)
    
Money Attribution (Immutable Snapshot at Hire):
    placement_snapshot.candidate_recruiter_id
    placement_snapshot.candidate_recruiter_rate
    placement_snapshot.company_recruiter_id
    placement_snapshot.company_recruiter_rate
    placement_snapshot.job_owner_recruiter_id
    placement_snapshot.job_owner_rate
    placement_snapshot.candidate_sourcer_recruiter_id
    placement_snapshot.candidate_sourcer_rate
    placement_snapshot.company_sourcer_recruiter_id
    placement_snapshot.company_sourcer_rate
    placement_snapshot.total_placement_fee
    placement_snapshot.subscription_tier
```

### Commission Calculation Examples

**Scenario 1: Paid Plan, All 5 Roles Filled**
```
Placement Fee: $20,000
Subscription: Paid ($99/month)

Candidate Recruiter: 30% = $6,000
Job Owner: 15% = $3,000
Company Recruiter: 15% = $3,000
Company Sourcer: 8% = $1,600
Candidate Sourcer: 8% = $1,600
Platform: 24% = $4,800

Total: 100% = $20,000 ✅
```

**Scenario 2: Premium Plan, Direct Candidate (No Candidate Recruiter)**
```
Placement Fee: $20,000
Subscription: Premium ($249/month)

Candidate Recruiter: NULL → 40% to platform
Job Owner: 20% = $4,000
Company Recruiter: 20% = $4,000
Company Sourcer: 10% = $2,000
Candidate Sourcer: 10% = $2,000
Platform: 40% (from NULL) + 0% (base) = $8,000

Total: 100% = $20,000 ✅
```

**Scenario 3: Free Plan, Inactive Company Sourcer**
```
Placement Fee: $20,000
Subscription: Free ($0/month)
Company Sourcer: INACTIVE (no payout)

Candidate Recruiter: 20% = $4,000
Job Owner: 10% = $2,000
Company Recruiter: 10% = $2,000
Company Sourcer: NULL (inactive) → 6% to platform
Candidate Sourcer: 6% = $1,200
Platform: 48% + 6% (from inactive) = $10,800

Total: 100% = $20,000 ✅
```

---

## Phase 6: Canonical Payout Architecture (2026-01-17)

**Status**: ✅ COMPLETE - Implementation Finished | ⏳ Testing Pending

**Documentation**: [PHASE-6-CANONICAL-ARCHITECTURE-COMPLETE.md](PHASE-6-CANONICAL-ARCHITECTURE-COMPLETE.md)

### Implementation Summary

Completed the canonical 4-layer payout architecture as defined in guidance documents:

**Layer 3: placement_splits** (Computed Allocations) ✅
- Added explicit `role` column (TEXT NOT NULL, CHECK constraint)
- 5 valid roles: candidate_recruiter, company_recruiter, job_owner, candidate_sourcer, company_sourcer
- Updated UNIQUE constraint: (placement_id, recruiter_id, role) - allows same recruiter in multiple roles
- New indexes: idx_placement_splits_role, idx_placement_splits_placement_role

**Layer 4: placement_payout_transactions** (Execution Tracking) ✅
- New table with 1-to-1 relationship to placement_splits (UNIQUE on placement_split_id)
- Stripe integration: stripe_transfer_id, stripe_payout_id, stripe_connect_account_id
- Status workflow: pending → processing → completed/failed
- Amount tracking: amount, stripe_fee, net_amount

### Database Migrations ✅

- **Migration 002/028**: Add role to placement_splits
  - File: `services/billing-service/migrations/002_add_role_to_placement_splits.sql`
  - Applied: Manually via Supabase (MCP had tracking table conflict)
  - Verified: Schema correct, constraints active, indexes created

- **Migration 003/029**: Create placement_payout_transactions
  - File: `services/billing-service/migrations/003_create_placement_payout_transactions.sql`
  - Applied: Via Supabase MCP (successful)
  - Verified: Table exists with all columns and constraints

### Code Implementation ✅

**New Files**:
- `PlacementSplitRepository` (72 lines) - CRUD for splits with role filtering
- `PlacementPayoutTransactionRepository` (115 lines) - Transaction tracking with Stripe integration

**Updated Files**:
- `PayoutServiceV2` - Added `createSplitsAndTransactionsForPlacement()` method
- `placement-consumer.ts` - Updated event handler to create splits + transactions
- `routes.ts` - Wired new repositories

**Event Flow**:
```
placement.created → placement-consumer.ts
  → createSplitsAndTransactionsForPlacement()
    → For each role with assigned recruiter:
      - Create placement_split (with explicit role)
      - Create placement_payout_transaction (1-to-1)
  → Publish 'placement.splits_created' event
```

### Build Verification ✅

- TypeScript types regenerated (database.types.ts)
- Build command: `pnpm build` in billing-service
- Result: ✅ 0 errors
- All imports resolve correctly
- All repositories compile successfully

### Next Steps

**Immediate Priority** ⏳:
1. Integration testing (placement.created → splits + transactions)
2. Idempotency testing (duplicate events)
3. Edge case testing (NULL roles, partial roles)
4. 1-to-1 relationship verification

**Optional Cleanup** 🟢:
1. Remove `placements.recruiter_id` column (deprecated with new architecture)
2. Update documentation in plan-implementSourcerTablesCommissionStructure.prompt.md
3. Add architecture diagrams

---