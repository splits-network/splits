# CRA Schema Guidance Documentation Update

**Date:** January 16, 2026  
**Status:** ✅ DOCUMENTATION COMPLETE  
**Purpose:** Track updates to CRA schema guidance documents

---

## Overview

Updated all guidance documents to reflect the **correct CRA schema specifications** with separated recruiter roles, sourcer attribution, and proper constraints.

**Key Changes:**
1. Split ambiguous `recruiter_id` into `candidate_recruiter_id` and `company_recruiter_id`
2. Added optional sourcer fields (`candidate_sourcer_id`, `company_sourcer_id`) as denormalized convenience
3. Documented that `job_poster_id` belongs on jobs table, NOT CRA
4. Enforced NOT NULL on `candidate_id` and `job_id`
5. Added unique constraint on (candidate_id, job_id) for active deals
6. Clarified separation: CRA = deal record, placement_snapshot = money ledger
7. Documented `proposed_by` as deal initiator (distinct from recruiter roles)
8. **NEW:** Created permanent sourcer attribution tables (`candidate_sourcers`, `company_sourcers`)
9. **NEW:** Documented 5-role commission structure across 3 subscription tiers
10. **NEW:** Clarified job owner field is recruiter-only (no payout to company employees)
11. **NEW:** Added placement_snapshot table for immutable money attribution

---

## Documents Updated

### 1. ✅ **NEW:** CRA Schema Specifications (Authoritative)
**File:** `docs/guidance/cra-schema-specifications.md`  
**Status:** Created from scratch  
**Purpose:** Definitive reference for CRA table structure and usage

**Contents:**
- Complete SQL schema with all columns
- TypeScript interface definitions
- Migration strategy (8 steps)
- Data model relationships diagram
- Gate routing query patterns
- Anti-patterns to avoid
- Q&A section addressing common questions

**Key Sections:**
- Section 1: Core Schema Requirements (required vs. nullable columns)
- Section 2: Gate Routing Columns (Phase 2 workflow support)
- Section 3: State Machine (CRA lifecycle states)
- Section 4: Uniqueness Constraint (one active deal per pair)
- Section 5: Complete Schema (full table DDL)
- Section 6: Migration Strategy (step-by-step ALTER TABLE commands)
- Section 7: Data Model Relationships (CRA as "wiring harness")
- Section 8: Anti-Patterns to Avoid (what NOT to do)
- Section 9: Query Patterns (examples for common operations)

---

### 2. ✅ Application/Proposal Flow Implementation Alignment
**File:** `docs/flows/plan-applicationProposalFlowImplementationAlignment.prompt.md`  
**Lines Updated:** 580-630  
**Changes:**

Added comprehensive schema updates section:
```sql
-- Split recruiter_id into candidate_recruiter_id and company_recruiter_id
ALTER TABLE candidate_role_assignments RENAME COLUMN recruiter_id TO candidate_recruiter_id;
ALTER TABLE candidate_role_assignments ADD COLUMN company_recruiter_id UUID REFERENCES recruiters(id);

-- Add sourcer fields
ALTER TABLE candidate_role_assignments ADD COLUMN candidate_sourcer_id UUID REFERENCES recruiters(id);
ALTER TABLE candidate_role_assignments ADD COLUMN company_sourcer_id UUID REFERENCES recruiters(id);

-- Enforce constraints
ALTER TABLE candidate_role_assignments ALTER COLUMN candidate_id SET NOT NULL;
ALTER TABLE candidate_role_assignments ALTER COLUMN job_id SET NOT NULL;
ALTER TABLE candidate_role_assignments ALTER COLUMN proposed_by SET NOT NULL;

-- Unique constraint
CREATE UNIQUE INDEX idx_cra_unique_active_deal 
ON candidate_role_assignments(candidate_id, job_id) 
WHERE state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed');

-- Indexes
CREATE INDEX idx_cra_candidate_recruiter ON candidate_role_assignments(candidate_recruiter_id);
CREATE INDEX idx_cra_company_recruiter ON candidate_role_assignments(company_recruiter_id);
CREATE INDEX idx_cra_candidate_sourcer ON candidate_role_assignments(candidate_sourcer_id);
CREATE INDEX idx_cra_company_sourcer ON candidate_role_assignments(company_sourcer_id);
```

Added documentation notes:
- Explained each recruiter role (Closer vs Client/Hiring Facilitator)
- Documented sourcer fields as denormalized convenience
- Noted that money snapshots belong in placements table
- Referenced authoritative specification document

---

### 3. ✅ Phase 2 Gate Review Implementation Plan
**File:** `docs/flows/PHASE-2-GATE-REVIEW-IMPLEMENTATION-PLAN.md`  
**Sections Updated:**

#### A. Database Schema Changes (Lines 80-150)
Added complete CRA schema update section with:
- Recruiter role separation migration
- Sourcer field additions
- Required field constraints
- Uniqueness constraint
- All necessary indexes
- Column comments explaining purpose

#### B. Gate Routing Service (Lines 200-280)
Updated `determineRouting()` method to:
- Return both `candidateRecruiterId` and `companyRecruiterId`
- Document that these get stored in separate CRA columns
- Add inline comments explaining the distinction

#### C. Gate Permission Validation (Lines 280-320)
Updated `validateGatePermission()` to:
- Query both `candidate_recruiter_id` and `company_recruiter_id` from CRA
- Use proper JOIN syntax for recruiter relationships
- Add CRITICAL comment referencing schema specification document

---

## Schema Comparison

### ❌ Old Schema (Incorrect)
```sql
CREATE TABLE candidate_role_assignments (
    id UUID PRIMARY KEY,
    candidate_id UUID,                      -- Nullable (wrong)
    job_id UUID,                            -- Nullable (wrong)
    recruiter_id UUID,                      -- Ambiguous (wrong)
    proposed_by UUID,
    state TEXT,
    -- No uniqueness constraint
    -- No sourcer fields
);
```

### ✅ New Schema (Correct)
```sql
CREATE TABLE candidate_role_assignments (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL,                     -- Required ✅
    job_id UUID NOT NULL,                           -- Required ✅
    candidate_recruiter_id UUID,                    -- Candidate's rep (Closer) ✅
    company_recruiter_id UUID,                      -- Company's rep (Client/Hiring Facilitator) ✅
    proposed_by UUID NOT NULL,                      -- Deal initiator ✅
    -- NOTE: Sourcer attribution stored in separate tables (candidate_sourcers, company_sourcers)
    state TEXT NOT NULL DEFAULT 'proposed',
    -- Gate routing columns
    current_gate TEXT,
    gate_sequence JSONB,
    gate_history JSONB,
    has_candidate_recruiter BOOLEAN,
    has_company_recruiter BOOLEAN,
    -- Timestamps
    proposed_at, response_due_at, accepted_at, declined_at, 
    timed_out_at, submitted_at, closed_at,
    created_at, updated_at,
    -- Metadata
    proposal_notes TEXT,
    response_notes TEXT,
    -- Constraints
    CONSTRAINT unique_active_deal UNIQUE (candidate_id, job_id)  ✅
);
```

---

## Key Principles Documented

### 1. Role Separation
- **`candidate_recruiter_id`** = Represents the candidate ("Closer" in deal terminology)
- **`company_recruiter_id`** = Represents the company ("Client/Hiring Facilitator")
- **`proposed_by`** = User who initiated this CRA (could be candidate, recruiter, or admin)

**Why separate?** Different roles, different responsibilities, different fee splits. Phase 2 gate routing requires storing both.

### 2. Sourcer Attribution (Permanent Tables)
- **Sourcer tables** = `candidate_sourcers` and `company_sourcers` with timestamps (REQUIRED)
- **Permanence** = Attribution permanent while recruiter has active account (not time-based)
- **Uniqueness** = One sourcer per candidate/company (first recruiter wins, UNIQUE constraint)
- **Inactive handling** = If sourcer account inactive, commission NOT paid out (platform consumes remainder)
- **Money snapshot** = `placement_snapshot.{candidate_sourcer_recruiter_id, candidate_sourcer_rate, company_sourcer_recruiter_id, company_sourcer_rate}`

**Why separate tables?** Tracks historical timestamp (when sourcing occurred), enables future capabilities (e.g., handling candidate reactivation), cleaner than denormalized columns, authority is explicit.

### 3. Money vs. Deal Records
- **CRA** = Deal record and state machine (who, what, status, gates)
- **Placement/Payout** = Immutable money snapshot (locked at hire, no disputes)

**Why separate?** CRA state changes throughout lifecycle. Money must be immutable for fiscal clarity.

### 4. Required Fields
- `candidate_id` NOT NULL - can't have a deal without a candidate
- `job_id` NOT NULL - can't have a deal without a job
- `proposed_by` NOT NULL - must track who initiated the deal

### 5. Uniqueness Constraint
```sql
UNIQUE (candidate_id, job_id) WHERE state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed')
```

**Why?** Prevents duplicate active deals. Only one deal can be in progress per candidate-job pair at a time. Historical/closed deals don't violate this (filtered out by WHERE clause).

---

## Migration Path

### Step 1: Rename existing column
```sql
ALTER TABLE candidate_role_assignments 
RENAME COLUMN recruiter_id TO candidate_recruiter_id;
```

**Impact:** Existing `recruiter_id` values become candidate recruiter by default (safer assumption).

### Step 2: Add company recruiter column
```sql
ALTER TABLE candidate_role_assignments 
ADD COLUMN company_recruiter_id UUID REFERENCES recruiters(id);

CREATE INDEX idx_cra_company_recruiter ON candidate_role_assignments(company_recruiter_id);
```

**Impact:** Adds new nullable column. Existing records have NULL company_recruiter_id until backfilled.

### Step 3: Backfill company recruiter (optional)
```sql
-- Option A: Query jobs table to find company recruiter
UPDATE candidate_role_assignments cra
SET company_recruiter_id = j.recruiter_id
FROM jobs j
WHERE cra.job_id = j.id
  AND j.recruiter_id IS NOT NULL
  AND cra.company_recruiter_id IS NULL;

-- Option B: Leave NULL if not originally tracked
-- (most accurate for historical data)
```

### Step 4: Create sourcer tables (REQUIRED)
```sql
-- Candidate sourcing attribution (permanent record)
CREATE TABLE candidate_sourcers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    sourcer_recruiter_id UUID NOT NULL REFERENCES recruiters(id),
    sourced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id)  -- Only one sourcer per candidate
);

-- Company sourcing attribution (permanent record)
CREATE TABLE company_sourcers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sourcer_recruiter_id UUID NOT NULL REFERENCES recruiters(id),
    sourced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id)  -- Only one sourcer per company
);

CREATE INDEX idx_candidate_sourcers_recruiter ON candidate_sourcers(sourcer_recruiter_id);
CREATE INDEX idx_company_sourcers_recruiter ON company_sourcers(sourcer_recruiter_id);
```

### Step 5: Add constraints
```sql
-- Make core fields required
ALTER TABLE candidate_role_assignments 
ALTER COLUMN candidate_id SET NOT NULL,
ALTER COLUMN job_id SET NOT NULL,
ALTER COLUMN proposed_by SET NOT NULL;

-- Add uniqueness constraint
CREATE UNIQUE INDEX idx_cra_unique_active_deal 
ON candidate_role_assignments(candidate_id, job_id) 
WHERE state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed');
```

### Step 6: Add job owner field (recruiter-only payout)
```sql
-- Job owner field on jobs table (NOT on CRA)
ALTER TABLE jobs 
ADD COLUMN job_owner_recruiter_id UUID REFERENCES recruiters(id);

CREATE INDEX idx_jobs_owner_recruiter ON jobs(job_owner_recruiter_id);

COMMENT ON COLUMN jobs.job_owner_recruiter_id IS 'Recruiter who created job posting (gets Specs Owner commission). NULL for company employee-created jobs.';
```

### Step 7: Create placement snapshot table (money attribution)
```sql
-- Immutable money snapshot at hire time
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

---

## Implementation Checklist

### Documentation ✅
- [x] Create authoritative CRA schema specification document
- [x] Update Application/Proposal Flow alignment plan
- [x] Update Phase 2 Gate Review implementation plan
- [x] Document role separation (candidate_recruiter vs company_recruiter)
- [x] Document sourcer attribution model (convenience vs authority)
- [x] Document CRA vs placement_snapshot separation

### Migration Scripts (Pending)
- [ ] Create migration: `services/ats-service/migrations/029_split_cra_recruiter_columns.sql`
- [ ] Create migration: `services/ats-service/migrations/030_create_sourcer_tables.sql`
- [ ] Create migration: `services/ats-service/migrations/031_add_job_owner_recruiter.sql`
- [ ] Create migration: `services/billing-service/migrations/020_create_placement_snapshot.sql`
- [ ] Test migrations on dev database
- [ ] Backfill existing records with appropriate recruiter assignments
- [ ] Backfill sourcer data from existing candidates/companies if columns exist
- [ ] Verify all indexes and constraints created correctly

### Type Definitions (Pending)
- [ ] Update `packages/shared-types/src/candidate-role-assignments.ts`
- [ ] Regenerate Supabase types: `pnpm supabase:types`
- [ ] Update CandidateRoleAssignmentCreateInput interface
- [ ] Update CandidateRoleAssignment interface
- [ ] Update EnrichedCandidateRoleAssignment interface

### Service Layer (Pending)
- [ ] Update `services/ats-service/src/v2/candidate-role-assignments/service.ts`
- [ ] Update create() to accept both recruiter IDs
- [ ] Update proposeAssignment() to determine recruiter type
- [ ] Add findByCandidateRecruiter() method
- [ ] Add findByCompanyRecruiter() method

### Repository Layer (Pending)
- [ ] Update `services/ats-service/src/v2/candidate-role-assignments/repository.ts`
- [ ] Update create() insert to use new column names
- [ ] Update all queries referencing recruiter_id
- [ ] Add queries for each recruiter type

### API Routes (Pending)
- [ ] Update `services/ats-service/src/v2/candidate-role-assignments/routes.ts`
- [ ] Update POST schema to accept candidate_recruiter_id and company_recruiter_id
- [ ] Update response schemas to include both recruiter IDs
- [ ] Update Fastify validation schemas

### Testing (Pending)
- [ ] Test service.create() with candidate_recruiter_id only
- [ ] Test service.create() with company_recruiter_id only
- [ ] Test service.create() with both recruiter IDs
- [ ] Test gate routing stores both IDs correctly
- [ ] Test findByCandidateRecruiter() and findByCompanyRecruiter()
- [ ] Verify unique constraint prevents duplicate active deals

---

## Questions Addressed

### Q: Why split recruiter_id into two columns?
**A:** They represent distinct roles in the marketplace:
- **Candidate recruiter** ("Closer") - Represents the candidate, gets Closer fee
- **Company recruiter** ("Client/Hiring Facilitator") - Represents the company, gets Client fee

Phase 2 gate routing requires tracking both. A single `recruiter_id` is ambiguous and prevents proper fee splitting.

### Q: Should sourcer fields be on CRA?
**A:** Optional but recommended as denormalized convenience:
- **Pro:** Performance (fewer joins), historical safety (snapshot at deal start)
- **Con:** Potential staleness (if global sourcer changes mid-deal)
- **Authority:** `candidates.candidate_sourcer_id` and `companies.company_sourcer_id`
- **Money snapshot:** `placement_snapshot` at hire time is immutable source of truth

### Q: Should job_poster_id be on CRA?
**A:** No. Store on jobs table. Poster is a property of the job, not the deal. Only snapshot at hire if poster can change mid-deal (rare).

### Q: Should money rates be on CRA?
**A:** No. CRA is mutable state machine. Money rates must be immutable and belong in placement/payout tables. Snapshot rates when placement is created (hire event).

### Q: Why make candidate_id and job_id NOT NULL?
**A:** A CRA without candidate or job is meaningless. These are the minimum required fields for a deal to exist.

### Q: How do I enforce one active deal per candidate-job pair?
**A:** Use partial unique constraint:
```sql
UNIQUE (candidate_id, job_id) WHERE state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed')
```
Only active deals are constrained. Historical/closed deals don't violate uniqueness.

### Q: Should sourcer attribution be stored on CRA?
**A:** No. Use separate `candidate_sourcers` and `company_sourcers` tables:
- **Permanent attribution**: Tracks sourcer with timestamp (when sourcing occurred)
- **First wins**: UNIQUE constraint ensures only one sourcer per candidate/company
- **Account-based**: Permanence tied to recruiter account status (not time-based)
- **Inactive handling**: If sourcer account inactive, commission NOT paid out (platform consumes)
- **Query via JOIN**: When needed for commission calculations, JOIN from CRA

### Q: What happens if a sourcer leaves the platform?
**A:** Their sourcer commission is NOT paid out - the platform consumes that percentage as remainder. Attribution record remains (for potential future reactivation), but no payout while account is inactive.

### Q: Can a candidate have multiple sourcers?
**A:** No. Only one sourcer per candidate (first recruiter wins). Same for companies. The UNIQUE constraint enforces this. In the future we may handle "reactivation" scenarios, but not implemented yet.

### Q: How are commission rates calculated across the 5 roles?
**A:** Depends on subscription tier:
- **Premium ($249/month)**: 40% + 20% + 20% + 10% + 10% = 100% (0% platform remainder)
- **Paid ($99/month)**: 30% + 15% + 15% + 8% + 8% = 76% (24% platform remainder)
- **Free ($0/month)**: 20% + 10% + 10% + 6% + 6% = 52% (48% platform remainder)

All 5 roles are nullable. If a role is NULL, that commission goes to platform as remainder.

### Q: Should job_owner_recruiter_id be on CRA?
**A:** No. Store on jobs table as `job_owner_recruiter_id` (references recruiters, NOT users). Job owner is a property of the job, not the deal. Only recruiters get job owner commission - company employees (hiring_manager, company_admin) do NOT receive payout.

---

## Next Steps

1. **Review & Approve:** Team reviews new schema specifications
2. **Create Migration:** Write migration script with proper data backfill
3. **Update Types:** Regenerate TypeScript types from Supabase
4. **Update Code:** Modify service/repository/routes to use new columns
5. **Test Thoroughly:** Verify all scenarios (candidate-only, company-only, both)
6. **Deploy:** Apply migration to dev → staging → production

---

**Documentation Status:** ✅ COMPLETE (Updated with sourcer tables & commission structure)  
**Implementation Status:** 📋 PENDING  
**Approval Status:** ⏳ AWAITING REVIEW

---

**Last Updated:** January 16, 2026 (Session 2: Sourcer tables & commission structure)  
**Updated By:** GitHub Copilot  
**Related Documents:**
- [CRA Schema Specifications](docs/guidance/cra-schema-specifications.md) - Authoritative reference
- [Application/Proposal Flow](docs/flows/plan-applicationProposalFlowImplementationAlignment.prompt.md) - Updated section 6.3
- [Phase 2 Gate Review](docs/flows/PHASE-2-GATE-REVIEW-IMPLEMENTATION-PLAN.md) - Updated database schema and service implementation

