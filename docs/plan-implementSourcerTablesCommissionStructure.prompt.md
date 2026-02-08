# Implementation Plan: Sourcer Tables & Five-Role Commission Structure

**Date:** January 16, 2026  
**Status:** 📋 PLANNING - Awaiting User Decisions  
**Purpose:** Implement permanent sourcer attribution tables and five-role commission structure

---

## Executive Summary

This plan implements the sourcer permanent attribution model and five-role commission structure as documented in the CRA schema specifications. The implementation spans database schema updates, TypeScript type changes, V2 domain creation, business logic implementation, and frontend integration.

**Key Changes:**
- Split CRA `recruiter_id` into `candidate_recruiter_id` and `company_recruiter_id`
- Add permanent sourcer attribution tables (`candidate_sourcers`, `company_sourcers`)
- Add `job_owner_recruiter_id` to jobs table
- Create immutable `placement_snapshot` table for money attribution
- Build five-role commission calculator (5 roles × 3 subscription tiers)

**Timeline:** 5 weeks (7 phases)  
**Complexity:** HIGH - Database schema changes, business logic, cross-service coordination

---

## Critical Decisions Required

### ⚠️ Decision 1: Sourcer Field Naming Convention

**Context:** Existing `candidate_sourcers` table uses `sourcer_user_id`, but specification requires `sourcer_recruiter_id`

**Location:** `services/ats-service/src/v2/candidate-sourcers/repository.ts` line 56

**Options:**

**Option A: Align Code with Spec (RECOMMENDED)**  this is the selected option
- Update migration to rename `sourcer_user_id` → `sourcer_recruiter_id`
- Update all queries in candidate-sourcers repository
- Update TypeScript interface
- Reflects correct relationship (sourcer is a recruiter, not just a user)

**Option B: Align Spec with Code**
- Update all documentation to use `sourcer_user_id`
- Keep existing field name
- Less work but technically less accurate (sourcers are recruiters)

**Recommendation:** Option A
- Spec is authoritative reference
- Field name should reflect business relationship (recruiter attribution)
- Better long-term maintainability

**Impact:**
- Migration script: Add `ALTER TABLE candidate_sourcers RENAME COLUMN sourcer_user_id TO sourcer_recruiter_id`
- Repository: Update 10+ query references
- TypeScript: Update interface definition
- Existing data: Unaffected (column rename is safe)

---

### ⚠️ Decision 2: Billing Migrations Location

**Context:** Billing service has no `migrations/` folder. Need to place `placement_snapshot` migration.

**Options:**

**Option A: Service-Specific Migrations (RECOMMENDED)**  this is the selected option
- Create `services/billing-service/migrations/` folder
- Place `001_create_placement_snapshot.sql` there
- Migration numbering starts at 001
- Keeps billing schema changes with billing service

**Option B: Centralized Infrastructure**
- Use `infra/migrations/` folder
- Place `021_create_placement_snapshot.sql` there (or next available number)
- Migration numbering continues infrastructure sequence
- All DB changes in one location

**Recommendation:** Option A
- Service-specific migrations are clearer
- Better separation of concerns
- Matches ATS service pattern
- Easier to track service-specific schema evolution

**Impact:**
- Folder creation: `services/billing-service/migrations/`
- CI/CD: May need deployment script updates
- Documentation: Update migration guide with billing service pattern

---

### ⚠️ Decision 3: Protection Window vs Permanent Attribution

**Context:** Existing `candidate_sourcers` has Phase 2 protection window logic (365 days). Spec says permanent attribution (account-based, no expiration).

**Location:** `services/ats-service/src/v2/candidate-sourcers/` has protection expiration checks

**Options:**

**Option A: Single Permanent Model** this is the selected option
- Remove protection window logic entirely
- All sourcer attribution is permanent (account-based)
- Simpler to maintain
- Loses Phase 2 time-based protection feature

**Option B: Dual System (RECOMMENDED)**
- Keep protection window as separate Phase 2 feature
- Add permanent sourcer attribution as new feature
- Two parallel systems for different use cases
- More complex but preserves existing work

**Option C: Merged Concept**
- Permanent attribution with optional time-based override
- Add `protection_expires_at` field to sourcer tables
- NULL = permanent, timestamp = time-based
- Most flexible but most complex

**Recommendation:** Option B
- Preserves Phase 2 work (don't throw away existing features)
- Protection window useful for specific business scenarios
- Permanent sourcer for commission/payout permanence
- Different purposes: protection (candidate safety) vs attribution (commission rights)

**Impact:**
- Phase 2 protection logic: Keep as-is
- Permanent sourcer: New parallel implementation
- Documentation: Clarify two separate concepts
- Business logic: Two query paths depending on use case

---

## Implementation Phases

### Phase 1: Database Schema - ATS Service (Week 1)

**Goal:** Update ATS schema with split recruiter roles, sourcer tables, job owner tracking, and gate routing

#### Migration 029: Split CRA Recruiter Columns

**File:** `services/ats-service/migrations/029_split_cra_recruiter_columns.sql`

**Purpose:**
- Rename `recruiter_id` → `candidate_recruiter_id` (represents candidate)
- Add `company_recruiter_id` (represents company)
- Add gate routing columns for Phase 2 gate review workflow

**SQL:**
```sql
-- Migration 029: Split CRA Recruiter Columns and Add Gate Routing
-- Date: 2026-01-16
-- Purpose: Separate candidate and company recruiter roles on CRA
-- Dependencies: None

BEGIN;

-- Step 1: Rename recruiter_id to candidate_recruiter_id (clarifies role)
ALTER TABLE candidate_role_assignments 
RENAME COLUMN recruiter_id TO candidate_recruiter_id;

-- Step 2: Add company recruiter column (nullable - direct company relationships allowed)
ALTER TABLE candidate_role_assignments 
ADD COLUMN company_recruiter_id UUID REFERENCES recruiters(id);

-- Step 3: Add gate routing columns for Phase 2 workflow
ALTER TABLE candidate_role_assignments 
ADD COLUMN current_gate TEXT CHECK (current_gate IN ('candidate_recruiter', 'company_recruiter', 'company', 'none')),
ADD COLUMN gate_sequence JSONB DEFAULT '[]',
ADD COLUMN gate_history JSONB DEFAULT '[]',
ADD COLUMN has_candidate_recruiter BOOLEAN DEFAULT FALSE,
ADD COLUMN has_company_recruiter BOOLEAN DEFAULT FALSE;

-- Step 4: Update indexes (rename + add new)
ALTER INDEX idx_cra_recruiter RENAME TO idx_cra_candidate_recruiter;
CREATE INDEX idx_cra_company_recruiter ON candidate_role_assignments(company_recruiter_id);
CREATE INDEX idx_cra_current_gate ON candidate_role_assignments(current_gate) WHERE current_gate IS NOT NULL;
CREATE INDEX idx_cra_routing_flags ON candidate_role_assignments(has_candidate_recruiter, has_company_recruiter);

-- Step 5: Add column comments
COMMENT ON COLUMN candidate_role_assignments.candidate_recruiter_id IS 'Recruiter representing the candidate (Closer role)';
COMMENT ON COLUMN candidate_role_assignments.company_recruiter_id IS 'Recruiter representing the company (Client/Hiring Facilitator role)';
COMMENT ON COLUMN candidate_role_assignments.current_gate IS 'Current gate in review workflow';

COMMIT;
```

**Rollback:**
```sql
-- Rollback 029
BEGIN;
DROP INDEX IF EXISTS idx_cra_routing_flags;
DROP INDEX IF EXISTS idx_cra_current_gate;
DROP INDEX IF EXISTS idx_cra_company_recruiter;
ALTER INDEX idx_cra_candidate_recruiter RENAME TO idx_cra_recruiter;
ALTER TABLE candidate_role_assignments DROP COLUMN IF EXISTS has_company_recruiter;
ALTER TABLE candidate_role_assignments DROP COLUMN IF EXISTS has_candidate_recruiter;
ALTER TABLE candidate_role_assignments DROP COLUMN IF EXISTS gate_history;
ALTER TABLE candidate_role_assignments DROP COLUMN IF EXISTS gate_sequence;
ALTER TABLE candidate_role_assignments DROP COLUMN IF EXISTS current_gate;
ALTER TABLE candidate_role_assignments DROP COLUMN IF EXISTS company_recruiter_id;
ALTER TABLE candidate_role_assignments RENAME COLUMN candidate_recruiter_id TO recruiter_id;
COMMIT;
```

**Testing:**
```sql
-- Test split columns
SELECT 
    id, 
    candidate_recruiter_id, 
    company_recruiter_id,
    current_gate,
    has_candidate_recruiter,
    has_company_recruiter
FROM candidate_role_assignments 
LIMIT 5;

-- Verify indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'candidate_role_assignments';
```

---

#### Migration 030: Create Sourcer Tables

**File:** `services/ats-service/migrations/030_create_sourcer_tables.sql`

**Purpose:**
- Fix `candidate_sourcers` field name (sourcer_user_id → sourcer_recruiter_id) *if Decision 1 = Option A*
- Create `company_sourcers` table
- Add UNIQUE constraints (one sourcer per entity)
- Add indexes for performance

**SQL (Option A - Rename Field):**
```sql
-- Migration 030: Create Sourcer Tables with Permanent Attribution
-- Date: 2026-01-16
-- Purpose: Add permanent sourcer attribution for commission tracking
-- Dependencies: Migration 029 (uses recruiters table)
-- Decision: Field name = sourcer_recruiter_id (aligns with spec)

BEGIN;

-- Step 1: Fix existing candidate_sourcers field name (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'candidate_sourcers' 
        AND column_name = 'sourcer_user_id'
    ) THEN
        ALTER TABLE candidate_sourcers 
        RENAME COLUMN sourcer_user_id TO sourcer_recruiter_id;
    END IF;
END $$;

-- Step 2: Create candidate_sourcers table (if not exists)
CREATE TABLE IF NOT EXISTS candidate_sourcers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    sourcer_recruiter_id UUID NOT NULL REFERENCES recruiters(id),
    sourced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Only one sourcer per candidate (first wins)
    CONSTRAINT unique_candidate_sourcer UNIQUE(candidate_id)
);

-- Step 3: Create company_sourcers table
CREATE TABLE company_sourcers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sourcer_recruiter_id UUID NOT NULL REFERENCES recruiters(id),
    sourced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Only one sourcer per company (first wins)
    CONSTRAINT unique_company_sourcer UNIQUE(company_id)
);

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_sourcers_recruiter 
ON candidate_sourcers(sourcer_recruiter_id);

CREATE INDEX idx_company_sourcers_recruiter 
ON company_sourcers(sourcer_recruiter_id);

-- Step 5: Add table comments
COMMENT ON TABLE candidate_sourcers IS 'Permanent attribution: tracks recruiter who first sourced candidate to platform';
COMMENT ON TABLE company_sourcers IS 'Permanent attribution: tracks recruiter who first sourced company to platform';
COMMENT ON COLUMN candidate_sourcers.sourcer_recruiter_id IS 'Recruiter who sourced this candidate (permanent while account active)';
COMMENT ON COLUMN company_sourcers.sourcer_recruiter_id IS 'Recruiter who sourced this company (permanent while account active)';

COMMIT;
```

**SQL (Option B - Keep sourcer_user_id):**
*(Similar but keep existing field name, update spec instead)*

**Rollback:**
```sql
-- Rollback 030
BEGIN;
DROP TABLE IF EXISTS company_sourcers CASCADE;
-- Note: candidate_sourcers may exist from previous version, don't drop
COMMIT;
```

**Testing:**
```sql
-- Test candidate_sourcers structure
\d candidate_sourcers

-- Test company_sourcers structure
\d company_sourcers

-- Test UNIQUE constraints
INSERT INTO candidate_sourcers (candidate_id, sourcer_recruiter_id) 
VALUES ('uuid1', 'uuid2');
-- Should fail: duplicate candidate_id
INSERT INTO candidate_sourcers (candidate_id, sourcer_recruiter_id) 
VALUES ('uuid1', 'uuid3');

-- Test indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('candidate_sourcers', 'company_sourcers');
```

---

#### Migration 031: Add Job Owner Recruiter

**File:** `services/ats-service/migrations/031_add_job_owner_recruiter.sql`

**Purpose:**
- Add `job_owner_recruiter_id` to jobs table
- Enforce recruiter-only constraint (company employees excluded)
- Track who created job posting for commission purposes

**SQL:**
```sql
-- Migration 031: Add Job Owner Recruiter Tracking
-- Date: 2026-01-16
-- Purpose: Track recruiter who created job posting for commission attribution
-- Dependencies: Migration 029 (uses recruiters table)

BEGIN;

-- Step 1: Add job_owner_recruiter_id column (nullable - company employees can create jobs)
ALTER TABLE jobs 
ADD COLUMN job_owner_recruiter_id UUID REFERENCES recruiters(id);

-- Step 2: Add index for performance
CREATE INDEX idx_jobs_owner_recruiter ON jobs(job_owner_recruiter_id);

-- Step 3: Add column comment
COMMENT ON COLUMN jobs.job_owner_recruiter_id IS 'Recruiter who created this job posting (Specs Owner role). NULL if created by company employee. Only recruiters receive job owner commission.';

COMMIT;
```

**Rollback:**
```sql
-- Rollback 031
BEGIN;
DROP INDEX IF EXISTS idx_jobs_owner_recruiter;
ALTER TABLE jobs DROP COLUMN IF EXISTS job_owner_recruiter_id;
COMMIT;
```

**Testing:**
```sql
-- Test column added
\d jobs

-- Test nullable constraint (company employees can create jobs)
INSERT INTO jobs (title, company_id, job_owner_recruiter_id) 
VALUES ('Test Job', 'company_uuid', NULL);

-- Test foreign key constraint
INSERT INTO jobs (title, company_id, job_owner_recruiter_id) 
VALUES ('Test Job 2', 'company_uuid', 'invalid_recruiter_uuid');
-- Should fail: foreign key violation
```

---

### Phase 2: Database Schema - Billing Service (Week 1)

**Goal:** Create placement_snapshot table for immutable money attribution

#### Migration 001: Create Placement Snapshot

**File:** `services/billing-service/migrations/001_create_placement_snapshot.sql` *(if Decision 2 = Option A)*  
**OR:** `infra/migrations/021_create_placement_snapshot.sql` *(if Decision 2 = Option B)*

**Purpose:**
- Create immutable money snapshot table
- Store all 5 role IDs and rates at hire time
- Source of truth for commission calculations

**SQL:**
```sql
-- Migration 001: Create Placement Snapshot Table
-- Date: 2026-01-16
-- Purpose: Immutable money attribution snapshot at placement hire
-- Dependencies: ATS migrations 029-031 (uses CRA, sourcer, job owner fields)

BEGIN;

-- Step 1: Create placement_snapshot table
CREATE TABLE placement_snapshot (
    -- Primary key
    placement_id UUID PRIMARY KEY REFERENCES placements(id) ON DELETE CASCADE,
    
    -- Role assignments (nullable - all roles optional)
    candidate_recruiter_id UUID,          -- Closer role
    company_recruiter_id UUID,            -- Client/Hiring Facilitator role
    job_owner_recruiter_id UUID,          -- Specs Owner role
    candidate_sourcer_recruiter_id UUID,  -- Discovery role
    company_sourcer_recruiter_id UUID,    -- BD role
    
    -- Commission rates (snapshotted at hire - immutable)
    candidate_recruiter_rate DECIMAL(5,2),
    company_recruiter_rate DECIMAL(5,2),
    job_owner_rate DECIMAL(5,2),
    candidate_sourcer_rate DECIMAL(5,2),
    company_sourcer_rate DECIMAL(5,2),
    
    -- Total fee and subscription tier
    total_placement_fee DECIMAL(10,2) NOT NULL,
    subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('premium', 'paid', 'free')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_rates CHECK (
        candidate_recruiter_rate IS NULL OR (candidate_recruiter_rate >= 0 AND candidate_recruiter_rate <= 100)
    ),
    CONSTRAINT valid_fee CHECK (total_placement_fee > 0)
);

-- Step 2: Add indexes for role lookups (commission calculation queries)
CREATE INDEX idx_placement_snapshot_candidate_recruiter ON placement_snapshot(candidate_recruiter_id);
CREATE INDEX idx_placement_snapshot_company_recruiter ON placement_snapshot(company_recruiter_id);
CREATE INDEX idx_placement_snapshot_job_owner ON placement_snapshot(job_owner_recruiter_id);
CREATE INDEX idx_placement_snapshot_candidate_sourcer ON placement_snapshot(candidate_sourcer_recruiter_id);
CREATE INDEX idx_placement_snapshot_company_sourcer ON placement_snapshot(company_sourcer_recruiter_id);

-- Step 3: Add table comment
COMMENT ON TABLE placement_snapshot IS 'Immutable money attribution snapshot at placement hire. Source of truth for commission calculations. Never updated after creation.';

COMMIT;
```

**Rollback:**
```sql
-- Rollback 001
BEGIN;
DROP TABLE IF EXISTS placement_snapshot CASCADE;
COMMIT;
```

**Testing:**
```sql
-- Test table structure
\d placement_snapshot

-- Test constraints
INSERT INTO placement_snapshot (
    placement_id, 
    total_placement_fee, 
    subscription_tier,
    candidate_recruiter_rate
) VALUES (
    'placement_uuid',
    20000.00,
    'paid',
    30.00
);

-- Test rate validation (should fail)
INSERT INTO placement_snapshot (
    placement_id, 
    total_placement_fee, 
    subscription_tier,
    candidate_recruiter_rate
) VALUES (
    'placement_uuid2',
    20000.00,
    'paid',
    150.00  -- > 100, should fail
);
```

---

### Phase 3: TypeScript Types (Week 2)

**Goal:** Update shared types to reflect new schema

#### File 1: Update CandidateRoleAssignment Interface

**File:** `packages/shared-types/src/candidate-role-assignments.ts`

**Changes:**
```typescript
// BEFORE (OLD - remove recruiter_id)
export interface CandidateRoleAssignment {
    id: string;
    candidate_id: string;
    job_id: string;
    recruiter_id: string | null;  // ❌ Remove this
    proposed_by: string;
    state: CRAState;
    // ... other fields
}

// AFTER (NEW - split recruiter roles + gate routing)
export interface CandidateRoleAssignment {
    id: string;
    candidate_id: string;
    job_id: string;
    
    // Split recruiter roles
    candidate_recruiter_id: string | null;  // ✅ Represents candidate (Closer)
    company_recruiter_id: string | null;    // ✅ Represents company (Client)
    
    proposed_by: string;
    state: CRAState;
    
    // Gate routing (Phase 2)
    current_gate: 'candidate_recruiter' | 'company_recruiter' | 'company' | 'none' | null;
    gate_sequence: string[];
    gate_history: GateHistoryEntry[];
    has_candidate_recruiter: boolean;
    has_company_recruiter: boolean;
    
    // ... other fields
}

export interface GateHistoryEntry {
    gate: 'candidate_recruiter' | 'company_recruiter' | 'company';
    action: 'approved' | 'denied' | 'info_requested';
    timestamp: string;  // ISO 8601
    reviewer_user_id: string;
    notes?: string;
}

// Update filters
export interface CandidateRoleAssignmentFilters {
    candidate_id?: string;
    job_id?: string;
    candidate_recruiter_id?: string;  // ✅ Updated
    company_recruiter_id?: string;     // ✅ New
    state?: CRAState;
    current_gate?: string;
    // ... other filters
}
```

---

#### File 2: Fix CandidateSourcer Interface

**File:** `packages/shared-types/src/candidate-sourcers.ts`

**Changes (if Decision 1 = Option A):**
```typescript
// BEFORE (OLD - wrong field name)
export interface CandidateSourcer {
    id: string;
    candidate_id: string;
    sourcer_user_id: string;  // ❌ Wrong name
    sourced_at: Date;
    created_at: Date;
}

// AFTER (NEW - correct field name)
export interface CandidateSourcer {
    id: string;
    candidate_id: string;
    sourcer_recruiter_id: string;  // ✅ Correct - references recruiters table
    sourced_at: Date;
    created_at: Date;
}
```

---

#### File 3: Create CompanySourcer Interface

**File:** `packages/shared-types/src/company-sourcers.ts` (NEW FILE)

**Content:**
```typescript
/**
 * Company Sourcer - Permanent Attribution
 * 
 * Tracks the recruiter who first brought a company to the platform.
 * 
 * Business Rules:
 * - First wins: Only one sourcer per company (UNIQUE constraint)
 * - Permanent: Attribution permanent while recruiter account is active
 * - Commission: Base 6% + bonus (Premium +4%, Paid +2%, Free +0%)
 * - Inactive: If sourcer account inactive, no payout (platform consumes fee)
 */

export interface CompanySourcer {
    id: string;
    company_id: string;
    sourcer_recruiter_id: string;  // References recruiters(id)
    sourced_at: Date;              // Timestamp when sourcing occurred
    created_at: Date;
}

export interface CompanySourcerCreate {
    company_id: string;
    sourcer_recruiter_id: string;
}

export interface CompanySourcerFilters {
    company_id?: string;
    sourcer_recruiter_id?: string;
}
```

---

#### File 4: Create PlacementSnapshot Interface

**File:** `packages/shared-types/src/placement-snapshot.ts` (NEW FILE)

**Content:**
```typescript
/**
 * Placement Snapshot - Immutable Money Attribution
 * 
 * Created once at placement hire. Never updated.
 * Source of truth for commission calculations.
 * 
 * Five Roles (all nullable):
 * 1. Candidate Recruiter (Closer) - 40/30/20%
 * 2. Job Owner (Specs) - 20/15/10%
 * 3. Company Recruiter (Client) - 20/15/10%
 * 4. Company Sourcer (BD) - 10/8/6%
 * 5. Candidate Sourcer (Discovery) - 10/8/6%
 */

export type SubscriptionTier = 'premium' | 'paid' | 'free';

export interface PlacementSnapshot {
    // Primary key
    placement_id: string;
    
    // Role assignments (all nullable)
    candidate_recruiter_id: string | null;
    company_recruiter_id: string | null;
    job_owner_recruiter_id: string | null;
    candidate_sourcer_recruiter_id: string | null;
    company_sourcer_recruiter_id: string | null;
    
    // Commission rates (0-100, nullable)
    candidate_recruiter_rate: number | null;
    company_recruiter_rate: number | null;
    job_owner_rate: number | null;
    candidate_sourcer_rate: number | null;
    company_sourcer_rate: number | null;
    
    // Total fee and tier
    total_placement_fee: number;
    subscription_tier: SubscriptionTier;
    
    // Metadata
    created_at: Date;
}

export interface PlacementSnapshotCreate {
    placement_id: string;
    candidate_recruiter_id: string | null;
    company_recruiter_id: string | null;
    job_owner_recruiter_id: string | null;
    candidate_sourcer_recruiter_id: string | null;
    company_sourcer_recruiter_id: string | null;
    candidate_recruiter_rate: number | null;
    company_recruiter_rate: number | null;
    job_owner_rate: number | null;
    candidate_sourcer_rate: number | null;
    company_sourcer_rate: number | null;
    total_placement_fee: number;
    subscription_tier: SubscriptionTier;
}

/**
 * Five-role commission rates by subscription tier
 */
export const COMMISSION_RATES: Record<SubscriptionTier, {
    candidate_recruiter: number;
    job_owner: number;
    company_recruiter: number;
    candidate_sourcer: number;
    company_sourcer: number;
    platform_remainder: number;
}> = {
    premium: {
        candidate_recruiter: 40,
        job_owner: 20,
        company_recruiter: 20,
        candidate_sourcer: 10,  // 6% base + 4% bonus
        company_sourcer: 10,    // 6% base + 4% bonus
        platform_remainder: 0
    },
    paid: {
        candidate_recruiter: 30,
        job_owner: 15,
        company_recruiter: 15,
        candidate_sourcer: 8,   // 6% base + 2% bonus
        company_sourcer: 8,     // 6% base + 2% bonus
        platform_remainder: 24
    },
    free: {
        candidate_recruiter: 20,
        job_owner: 10,
        company_recruiter: 10,
        candidate_sourcer: 6,   // 6% base + 0% bonus
        company_sourcer: 6,     // 6% base + 0% bonus
        platform_remainder: 48
    }
};
```

---

#### Regenerate Supabase Types

**Command:**
```bash
cd packages/shared-types
pnpm supabase:types
```

**Verify:**
```bash
# Check database/ats.types.ts includes new columns
grep "candidate_recruiter_id" src/database/ats.types.ts
grep "company_recruiter_id" src/database/ats.types.ts
grep "job_owner_recruiter_id" src/database/ats.types.ts
```

---

### Phase 4: V2 Repository Updates (Week 2)

**Goal:** Update repositories to use new schema

#### Repository 1: Update CandidateRoleAssignment Repository

**File:** `services/ats-service/src/v2/candidate-role-assignments/repository.ts`

**Changes:**
```typescript
// Update all queries to use split recruiter fields

async list(clerkUserId: string, filters: CandidateRoleAssignmentFilters) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const query = this.supabase
        .from('candidate_role_assignments')
        .select('*');
        
    // Role-based filtering with BOTH recruiter types
    if (context.role === 'recruiter') {
        // Recruiters see CRAs where they represent EITHER candidate OR company
        query.or(`candidate_recruiter_id.eq.${context.recruiterId},company_recruiter_id.eq.${context.recruiterId}`);
    } else if (context.isCompanyUser) {
        // Company users see CRAs for their company's jobs
        const jobIds = await this.getCompanyJobIds(context.accessibleCompanyIds);
        query.in('job_id', jobIds);
    }
    // Platform admins see everything (no filter)
    
    // Apply field-specific filters
    if (filters.candidate_recruiter_id) {
        query.eq('candidate_recruiter_id', filters.candidate_recruiter_id);
    }
    if (filters.company_recruiter_id) {
        query.eq('company_recruiter_id', filters.company_recruiter_id);
    }
    
    return query;
}

async update(id: string, clerkUserId: string, updates: CandidateRoleAssignmentUpdate) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const query = this.supabase
        .from('candidate_role_assignments')
        .update(updates)
        .eq('id', id);
        
    // Permission check for updates
    if (context.role === 'recruiter') {
        // Recruiters can only update CRAs where they're assigned
        query.or(`candidate_recruiter_id.eq.${context.recruiterId},company_recruiter_id.eq.${context.recruiterId}`);
    }
    
    return query.select().single();
}
```

---

#### Repository 2: Fix CandidateSourcer Repository

**File:** `services/ats-service/src/v2/candidate-sourcers/repository.ts`

**Changes (if Decision 1 = Option A):**
```typescript
// Line 56: Fix field name
async create(clerkUserId: string, data: CandidateSourcerCreate) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const { data: sourcer, error } = await this.supabase
        .from('candidate_sourcers')
        .insert({
            candidate_id: data.candidate_id,
            sourcer_recruiter_id: context.recruiterId,  // ✅ Fixed from sourcer_user_id
            sourced_at: new Date().toISOString()
        })
        .select()
        .single();
        
    if (error) throw error;
    return sourcer;
}

// Remove protection window logic (if Decision 3 = Option A or B)
// OR keep it as separate feature (if Decision 3 = Option B)

// Add active status checking
async isSourcerActive(candidateId: string): Promise<boolean> {
    const { data } = await this.supabase
        .from('candidate_sourcers')
        .select(`
            sourcer_recruiter_id,
            recruiters:sourcer_recruiter_id (
                status
            )
        `)
        .eq('candidate_id', candidateId)
        .single();
        
    return data?.recruiters?.status === 'active';
}
```

---

#### Repository 3: Create CompanySourcer Repository

**File:** `services/ats-service/src/v2/company-sourcers/repository.ts` (NEW FILE)

**Content:**
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { CompanySourcer, CompanySourcerCreate, CompanySourcerFilters } from '@splits-network/shared-types';

export class CompanySourcerRepository {
    constructor(private supabase: SupabaseClient) {}

    async list(clerkUserId: string, filters: CompanySourcerFilters) {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        const query = this.supabase
            .from('company_sourcers')
            .select('*');
            
        // Role-based filtering
        if (context.role === 'recruiter') {
            // Recruiters see only companies they sourced
            query.eq('sourcer_recruiter_id', context.recruiterId);
        } else if (context.isCompanyUser) {
            // Company users see their company's sourcer
            query.in('company_id', context.accessibleCompanyIds);
        }
        // Platform admins see everything
        
        // Apply filters
        if (filters.company_id) {
            query.eq('company_id', filters.company_id);
        }
        if (filters.sourcer_recruiter_id) {
            query.eq('sourcer_recruiter_id', filters.sourcer_recruiter_id);
        }
        
        return query;
    }

    async getById(id: string, clerkUserId: string) {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        const query = this.supabase
            .from('company_sourcers')
            .select('*')
            .eq('id', id);
            
        // Same role-based filtering as list()
        if (context.role === 'recruiter') {
            query.eq('sourcer_recruiter_id', context.recruiterId);
        } else if (context.isCompanyUser) {
            query.in('company_id', context.accessibleCompanyIds);
        }
        
        return query.single();
    }

    async create(clerkUserId: string, data: CompanySourcerCreate) {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        // Only recruiters and admins can create sourcer records
        if (context.role !== 'recruiter' && context.role !== 'platform_admin') {
            throw new Error('Only recruiters can create sourcer attributions');
        }
        
        const { data: sourcer, error } = await this.supabase
            .from('company_sourcers')
            .insert({
                company_id: data.company_id,
                sourcer_recruiter_id: context.recruiterId,
                sourced_at: new Date().toISOString()
            })
            .select()
            .single();
            
        if (error) {
            // Check for UNIQUE constraint violation (company already has sourcer)
            if (error.code === '23505') {
                throw new Error('Company already has a sourcer (first wins rule)');
            }
            throw error;
        }
        
        return sourcer;
    }

    async delete(id: string, clerkUserId: string) {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        // Only platform admins can delete sourcer attributions (permanent record)
        if (context.role !== 'platform_admin') {
            throw new Error('Only platform admins can delete sourcer attributions');
        }
        
        const { error } = await this.supabase
            .from('company_sourcers')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
    }

    // Helper: Check if sourcer is active
    async isSourcerActive(companyId: string): Promise<boolean> {
        const { data } = await this.supabase
            .from('company_sourcers')
            .select(`
                sourcer_recruiter_id,
                recruiters:sourcer_recruiter_id (
                    status
                )
            `)
            .eq('company_id', companyId)
            .single();
            
        return data?.recruiters?.status === 'active';
    }

    // Helper: Get sourcer for company
    async getByCompanyId(companyId: string): Promise<CompanySourcer | null> {
        const { data } = await this.supabase
            .from('company_sourcers')
            .select('*')
            .eq('company_id', companyId)
            .single();
            
        return data;
    }
}
```

---

#### Repository 4: Update Jobs Repository

**File:** `services/ats-service/src/v2/jobs/repository.ts`

**Changes:**
```typescript
// Add job_owner_recruiter_id to select queries
async list(clerkUserId: string, filters: JobFilters) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const query = this.supabase
        .from('jobs')
        .select('*, job_owner_recruiter_id');  // ✅ Add to select
        
    // ... existing role-based filtering
    
    return query;
}

// Add job_owner_recruiter_id to create method
async create(clerkUserId: string, data: JobCreate) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    // Set job_owner_recruiter_id if user is a recruiter
    let jobOwnerRecruiterId = null;
    if (context.role === 'recruiter') {
        jobOwnerRecruiterId = context.recruiterId;
    }
    
    const { data: job, error } = await this.supabase
        .from('jobs')
        .insert({
            ...data,
            job_owner_recruiter_id: jobOwnerRecruiterId
        })
        .select()
        .single();
        
    if (error) throw error;
    return job;
}

// Allow updating job_owner_recruiter_id (admin only)
async update(id: string, clerkUserId: string, updates: JobUpdate) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    // Only platform admins can change job owner
    if (updates.job_owner_recruiter_id && context.role !== 'platform_admin') {
        delete updates.job_owner_recruiter_id;
    }
    
    // ... existing update logic
}
```

---

### Phase 5: Service Layer Updates (Week 3)

**Goal:** Update service layer for new business logic

#### Service 1: Update CandidateRoleAssignment Service

**File:** `services/ats-service/src/v2/candidate-role-assignments/service.ts`

**Changes:**
```typescript
// Update validation for split recruiter roles
validateCreate(data: CandidateRoleAssignmentCreate) {
    // At least one recruiter required (candidate OR company)
    if (!data.candidate_recruiter_id && !data.company_recruiter_id) {
        throw new Error('At least one recruiter (candidate or company) is required');
    }
    
    // Validate recruiter IDs exist
    // ... existing validation
}

// Update event payloads
async create(clerkUserId: string, data: CandidateRoleAssignmentCreate) {
    const cra = await this.repository.create(clerkUserId, data);
    
    // Publish event with split roles
    await this.eventPublisher?.publish('candidate_role_assignment.created', {
        craId: cra.id,
        candidateId: cra.candidate_id,
        jobId: cra.job_id,
        candidateRecruiterId: cra.candidate_recruiter_id,  // ✅ Updated
        companyRecruiterId: cra.company_recruiter_id,      // ✅ New
        proposedBy: cra.proposed_by
    });
    
    return cra;
}
```

---

#### Service 2: Update Placements Service

**File:** `services/ats-service/src/v2/placements/service.ts`

**Changes:**
```typescript
import { CompanySourcerRepository } from '../company-sourcers/repository';
import { CandidateSourcerRepository } from '../candidate-sourcers/repository';

export class PlacementServiceV2 {
    constructor(
        private repository: PlacementRepository,
        private companySourcerRepo: CompanySourcerRepository,
        private candidateSourcerRepo: CandidateSourcerRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async create(clerkUserId: string, data: PlacementCreate) {
        // ... existing validation
        
        // Create placement
        const placement = await this.repository.create(clerkUserId, data);
        
        // Gather attribution for snapshot
        const attribution = await this.gatherAttribution(
            data.candidate_id,
            data.job_id,
            data.candidate_role_assignment_id
        );
        
        // Publish event with all 5 roles
        await this.eventPublisher?.publish('placement.created', {
            placementId: placement.id,
            candidateId: data.candidate_id,
            jobId: data.job_id,
            ...attribution  // Include all 5 role IDs
        });
        
        return placement;
    }

    private async gatherAttribution(
        candidateId: string,
        jobId: string,
        craId: string
    ) {
        // 1. Get CRA for candidate_recruiter_id and company_recruiter_id
        const cra = await this.supabase
            .from('candidate_role_assignments')
            .select('candidate_recruiter_id, company_recruiter_id')
            .eq('id', craId)
            .single();
            
        // 2. Get job for job_owner_recruiter_id
        const job = await this.supabase
            .from('jobs')
            .select('job_owner_recruiter_id, company_id')
            .eq('id', jobId)
            .single();
            
        // 3. Get candidate sourcer (check if active)
        const candidateSourcer = await this.candidateSourcerRepo.getByCompanyId(candidateId);
        const candidateSourcerActive = candidateSourcer 
            ? await this.candidateSourcerRepo.isSourcerActive(candidateId)
            : false;
            
        // 4. Get company sourcer (check if active)
        const companySourcer = await this.companySourcerRepo.getByCompanyId(job.data.company_id);
        const companySourcerActive = companySourcer
            ? await this.companySourcerRepo.isSourcerActive(job.data.company_id)
            : false;
            
        return {
            candidate_recruiter_id: cra.data.candidate_recruiter_id,
            company_recruiter_id: cra.data.company_recruiter_id,
            job_owner_recruiter_id: job.data.job_owner_recruiter_id,
            candidate_sourcer_recruiter_id: candidateSourcerActive ? candidateSourcer.sourcer_recruiter_id : null,
            company_sourcer_recruiter_id: companySourcerActive ? companySourcer.sourcer_recruiter_id : null
        };
    }
}
```

---

### Phase 6: Commission Calculator (Week 4)

**Goal:** Build five-role commission logic in billing service

#### Domain: Create PlacementSnapshot Domain

**Files:**
- `services/billing-service/src/v2/placement-snapshot/repository.ts`
- `services/billing-service/src/v2/placement-snapshot/service.ts`
- `services/billing-service/src/v2/placement-snapshot/types.ts`

**Repository:**
```typescript
// services/billing-service/src/v2/placement-snapshot/repository.ts

export class PlacementSnapshotRepository {
    constructor(private supabase: SupabaseClient) {}

    async create(data: PlacementSnapshotCreate): Promise<PlacementSnapshot> {
        const { data: snapshot, error } = await this.supabase
            .from('placement_snapshot')
            .insert(data)
            .select()
            .single();
            
        if (error) throw error;
        return snapshot;
    }

    async getByPlacementId(placementId: string): Promise<PlacementSnapshot | null> {
        const { data } = await this.supabase
            .from('placement_snapshot')
            .select('*')
            .eq('placement_id', placementId)
            .single();
            
        return data;
    }
}
```

**Service:**
```typescript
// services/billing-service/src/v2/placement-snapshot/service.ts

import { COMMISSION_RATES } from '@splits-network/shared-types';

export class PlacementSnapshotService {
    constructor(
        private repository: PlacementSnapshotRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async createSnapshot(
        placementId: string,
        roleIds: {
            candidate_recruiter_id: string | null;
            company_recruiter_id: string | null;
            job_owner_recruiter_id: string | null;
            candidate_sourcer_recruiter_id: string | null;
            company_sourcer_recruiter_id: string | null;
        },
        totalFee: number,
        subscriptionTier: SubscriptionTier
    ): Promise<PlacementSnapshot> {
        // Calculate rates for each role
        const rates = COMMISSION_RATES[subscriptionTier];
        
        // Create snapshot
        const snapshot = await this.repository.create({
            placement_id: placementId,
            ...roleIds,
            candidate_recruiter_rate: roleIds.candidate_recruiter_id ? rates.candidate_recruiter : null,
            company_recruiter_rate: roleIds.company_recruiter_id ? rates.company_recruiter : null,
            job_owner_rate: roleIds.job_owner_recruiter_id ? rates.job_owner : null,
            candidate_sourcer_rate: roleIds.candidate_sourcer_recruiter_id ? rates.candidate_sourcer : null,
            company_sourcer_rate: roleIds.company_sourcer_recruiter_id ? rates.company_sourcer : null,
            total_placement_fee: totalFee,
            subscription_tier: subscriptionTier
        });
        
        // Publish event
        await this.eventPublisher?.publish('placement_snapshot.created', {
            placementId,
            subscriptionTier
        });
        
        return snapshot;
    }
}
```

---

#### Update: Payouts Service with Commission Calculator

**File:** `services/billing-service/src/v2/payouts/service.ts`

**Changes:**
```typescript
export class PayoutServiceV2 {
    constructor(
        private repository: PayoutRepository,
        private snapshotRepo: PlacementSnapshotRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async createPayoutsForPlacement(placementId: string) {
        // Get immutable snapshot (source of truth)
        const snapshot = await this.snapshotRepo.getByPlacementId(placementId);
        if (!snapshot) {
            throw new Error('Placement snapshot not found');
        }
        
        const payouts: PayoutCreate[] = [];
        
        // Calculate payout for each role (if not null)
        if (snapshot.candidate_recruiter_id && snapshot.candidate_recruiter_rate) {
            payouts.push({
                recruiter_id: snapshot.candidate_recruiter_id,
                placement_id: placementId,
                amount: (snapshot.total_placement_fee * snapshot.candidate_recruiter_rate) / 100,
                role: 'candidate_recruiter',
                status: 'pending'
            });
        }
        
        if (snapshot.company_recruiter_id && snapshot.company_recruiter_rate) {
            payouts.push({
                recruiter_id: snapshot.company_recruiter_id,
                placement_id: placementId,
                amount: (snapshot.total_placement_fee * snapshot.company_recruiter_rate) / 100,
                role: 'company_recruiter',
                status: 'pending'
            });
        }
        
        if (snapshot.job_owner_recruiter_id && snapshot.job_owner_rate) {
            payouts.push({
                recruiter_id: snapshot.job_owner_recruiter_id,
                placement_id: placementId,
                amount: (snapshot.total_placement_fee * snapshot.job_owner_rate) / 100,
                role: 'job_owner',
                status: 'pending'
            });
        }
        
        // Sourcer payouts (only if active - already checked in snapshot creation)
        if (snapshot.candidate_sourcer_recruiter_id && snapshot.candidate_sourcer_rate) {
            payouts.push({
                recruiter_id: snapshot.candidate_sourcer_recruiter_id,
                placement_id: placementId,
                amount: (snapshot.total_placement_fee * snapshot.candidate_sourcer_rate) / 100,
                role: 'candidate_sourcer',
                status: 'pending'
            });
        }
        
        if (snapshot.company_sourcer_recruiter_id && snapshot.company_sourcer_rate) {
            payouts.push({
                recruiter_id: snapshot.company_sourcer_recruiter_id,
                placement_id: placementId,
                amount: (snapshot.total_placement_fee * snapshot.company_sourcer_rate) / 100,
                role: 'company_sourcer',
                status: 'pending'
            });
        }
        
        // Create all payouts
        const created = await Promise.all(
            payouts.map(p => this.repository.create('system', p))
        );
        
        // Publish event
        await this.eventPublisher?.publish('payouts.created', {
            placementId,
            payoutCount: created.length,
            totalAmount: created.reduce((sum, p) => sum + p.amount, 0)
        });
        
        return created;
    }

    // Helper: Calculate platform remainder
    calculatePlatformRemainder(snapshot: PlacementSnapshot): number {
        const totalPaid = [
            snapshot.candidate_recruiter_rate,
            snapshot.company_recruiter_rate,
            snapshot.job_owner_rate,
            snapshot.candidate_sourcer_rate,
            snapshot.company_sourcer_rate
        ].reduce((sum, rate) => sum + (rate || 0), 0);
        
        const remainderPercent = 100 - totalPaid;
        return (snapshot.total_placement_fee * remainderPercent) / 100;
    }
}
```

---

### Phase 7: Integration (Week 5)

**Goal:** Wire up API Gateway and frontend

#### API Gateway: Add Company Sourcers Routes

**File:** `services/api-gateway/src/routes/v2/ats.ts`

**Changes:**
```typescript
// Add company-sourcers routes (5-route CRUD pattern)
app.get('/api/v2/company-sourcers', {
    preHandler: requireRoles(['recruiter', 'company_admin', 'platform_admin'], services)
}, async (request, reply) => {
    const response = await services.ats.get('/api/v2/company-sourcers', {
        headers: buildAuthHeaders(request)
    });
    return reply.send(response.data);
});

app.get('/api/v2/company-sourcers/:id', {
    preHandler: requireRoles(['recruiter', 'company_admin', 'platform_admin'], services)
}, async (request, reply) => {
    const { id } = request.params as { id: string };
    const response = await services.ats.get(`/api/v2/company-sourcers/${id}`, {
        headers: buildAuthHeaders(request)
    });
    return reply.send(response.data);
});

app.post('/api/v2/company-sourcers', {
    preHandler: requireRoles(['recruiter', 'platform_admin'], services)
}, async (request, reply) => {
    const response = await services.ats.post('/api/v2/company-sourcers', request.body, {
        headers: buildAuthHeaders(request)
    });
    return reply.code(201).send(response.data);
});

app.delete('/api/v2/company-sourcers/:id', {
    preHandler: requireRoles(['platform_admin'], services)
}, async (request, reply) => {
    const { id } = request.params as { id: string };
    await services.ats.delete(`/api/v2/company-sourcers/${id}`, {
        headers: buildAuthHeaders(request)
    });
    return reply.code(204).send();
});
```

---

#### Frontend: Update CRA Components

**Files:**
- `apps/portal/src/components/cra-card.tsx` (example)
- `apps/portal/src/app/portal/placements/[id]/page.tsx` (example)

**Changes:**
```tsx
// Display split recruiter roles
<div className="stats shadow">
    <div className="stat">
        <div className="stat-title">Candidate Recruiter</div>
        <div className="stat-value text-sm">
            {cra.candidate_recruiter_name || 'Direct'}
        </div>
        <div className="stat-desc">Closer role</div>
    </div>
    <div className="stat">
        <div className="stat-title">Company Recruiter</div>
        <div className="stat-value text-sm">
            {cra.company_recruiter_name || 'Direct'}
        </div>
        <div className="stat-desc">Client/Hiring Facilitator role</div>
    </div>
</div>

// Display sourcer attribution
<div className="alert alert-info">
    <i className="fa-duotone fa-regular fa-lightbulb"></i>
    <div>
        <div className="font-semibold">Sourcer Attribution</div>
        <div className="text-sm">
            Candidate sourced by: {candidateSourcer?.recruiter_name || 'Platform'}
            <br />
            Company sourced by: {companySourcer?.recruiter_name || 'Platform'}
        </div>
    </div>
</div>

// Display commission breakdown
<div className="card bg-base-100 shadow">
    <div className="card-body">
        <h3 className="card-title">Commission Breakdown</h3>
        <div className="space-y-2">
            {snapshot.candidate_recruiter_rate && (
                <div className="flex justify-between">
                    <span>Candidate Recruiter ({snapshot.candidate_recruiter_rate}%)</span>
                    <span className="font-semibold">
                        ${((snapshot.total_placement_fee * snapshot.candidate_recruiter_rate) / 100).toLocaleString()}
                    </span>
                </div>
            )}
            {snapshot.job_owner_rate && (
                <div className="flex justify-between">
                    <span>Job Owner ({snapshot.job_owner_rate}%)</span>
                    <span className="font-semibold">
                        ${((snapshot.total_placement_fee * snapshot.job_owner_rate) / 100).toLocaleString()}
                    </span>
                </div>
            )}
            {/* ... other roles ... */}
            <div className="divider"></div>
            <div className="flex justify-between font-bold">
                <span>Platform Remainder</span>
                <span>${platformRemainder.toLocaleString()}</span>
            </div>
        </div>
    </div>
</div>
```

---

## Testing Checklist

### Database Testing
- [ ] Run all migrations in dev environment
- [ ] Test migration rollbacks
- [ ] Verify UNIQUE constraints work (duplicate sourcer attempts fail)
- [ ] Verify foreign keys work (invalid recruiter IDs fail)
- [ ] Test indexes improve query performance
- [ ] Test cross-schema queries (placement snapshot + CRA + sourcers)

### Repository Testing
- [ ] Test split recruiter role filtering (candidate vs company)
- [ ] Test sourcer active status checking
- [ ] Test company sourcer CRUD operations
- [ ] Test placement snapshot creation
- [ ] Test role-based access control (recruiters see own, admins see all)

### Service Testing
- [ ] Test CRA validation with split roles
- [ ] Test placement attribution gathering (all 5 roles)
- [ ] Test commission calculator for all 3 subscription tiers
- [ ] Test NULL role handling (platform remainder calculation)
- [ ] Test inactive sourcer handling (no payout)

### Integration Testing
- [ ] End-to-end placement flow (create → snapshot → payouts)
- [ ] Test API Gateway routes (company-sourcers)
- [ ] Test frontend displays (split recruiters, sourcers, commission breakdown)

### Performance Testing
- [ ] Load test snapshot creation at scale (1000+ placements)
- [ ] Query performance with new indexes
- [ ] Commission calculation performance

---

## Rollback Plan

### Phase-by-Phase Rollback

**Phase 7 (Frontend/API Gateway):**
- Revert API Gateway route changes
- Revert frontend component changes
- No database impact

**Phase 6 (Commission Calculator):**
- Remove placement snapshot service
- Remove commission calculator from payouts service
- No database impact

**Phase 5 (Service Layer):**
- Revert service method changes
- Revert event payloads
- No database impact

**Phase 4 (Repositories):**
- Revert repository query changes
- Remove company sourcer repository
- No database impact

**Phase 3 (TypeScript Types):**
- Revert shared type changes
- Regenerate Supabase types from old schema
- No database impact

**Phase 2 (Billing Migration):**
- Run rollback script for placement_snapshot
- `DROP TABLE placement_snapshot CASCADE`

**Phase 1 (ATS Migrations):**
- Run rollback scripts in reverse order
- Migration 031: Drop job_owner_recruiter_id
- Migration 030: Drop company_sourcers (keep candidate_sourcers)
- Migration 029: Rename candidate_recruiter_id → recruiter_id, drop company_recruiter_id

---

## Timeline

| Week | Phase | Focus | Deliverables |
|------|-------|-------|--------------|
| 1 | Phases 1-2 | Database Schema | 4 migrations (ATS + Billing) |
| 2 | Phases 3-4 | Types & Repositories | 4 type updates, 4 repository updates |
| 3 | Phase 5 | Service Layer | 2 service updates, snapshot creation |
| 4 | Phase 6 | Commission Calculator | Snapshot domain, five-role calculator |
| 5 | Phase 7 | Integration & Testing | API Gateway, frontend, tests |

---

## Success Criteria

**Phase 1-2 Complete:**
- [ ] All 4 migrations deployed successfully
- [ ] Tables created with correct structure
- [ ] UNIQUE constraints enforced
- [ ] Indexes created
- [ ] Rollback tested

**Phase 3-4 Complete:**
- [ ] TypeScript types updated
- [ ] Supabase types regenerated
- [ ] All repositories using new schema
- [ ] Role-based filtering working
- [ ] Company sourcers domain functional

**Phase 5-6 Complete:**
- [ ] Placement snapshot created at hire
- [ ] All 5 roles correctly resolved
- [ ] Commission calculator working
- [ ] Sourcer active status checked
- [ ] NULL roles properly handled

**Phase 7 Complete:**
- [ ] API Gateway routes working
- [ ] Frontend displays all 5 roles
- [ ] Commission breakdown UI accurate
- [ ] Integration tests passing
- [ ] Performance tests passing

---

## Risk Mitigation

### Risk 1: Field Name Mismatch Breaking Existing Code
**Mitigation:** 
- Use dual-support period (accept both field names)
- Gradual migration of queries
- Comprehensive testing before full rollout

### Risk 2: Snapshot Creation Performance
**Mitigation:**
- Async snapshot creation (don't block placement)
- Batch processing for bulk placements
- Load testing before production

### Risk 3: Commission Calculation Errors
**Mitigation:**
- Extensive unit tests for all scenarios
- Manual verification of first 100 calculations
- Audit trail for debugging

### Risk 4: Frontend Breaking Changes
**Mitigation:**
- Feature flags for new UI
- Gradual rollout to users
- Quick rollback capability

---

## Next Steps

1. **User Decisions:** Answer 3 critical questions (field naming, billing migrations location, protection window)
2. **Start Phase 1:** Create ATS migrations (029, 030, 031)
3. **Test Migrations:** Deploy to dev, verify structure
4. **Continue Phases:** Follow 5-week timeline
5. **Production Deploy:** Phased rollout with monitoring

---

**Document Status:** 📋 DRAFT - Awaiting User Decisions  
**Last Updated:** January 16, 2026  
**Estimated Effort:** 5 weeks (7 phases, ~25 tasks)
