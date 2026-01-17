# Candidate Role Assignment (CRA) Schema Specifications

**Date:** January 16, 2026  
**Status:** 📋 AUTHORITATIVE SPECIFICATION  
**Purpose:** Define the correct CRA schema for fiscal tracking and deal management

---

## Executive Summary

The CandidateRoleAssignment (CRA) table is the **deal record** and **wiring harness** for each candidate-job pairing. It tracks:
- Who represents the candidate (candidate recruiter - "Closer" role)
- Who represents the company (company recruiter - "Client/Hiring Facilitator" role)
- Who initiated the deal (proposed_by)
- Deal state and progression through gates
- Attribution metadata for payout calculations

**Key Principle:** CRA is the deal record, NOT the attribution ledger. Money snapshots live in placement/payout tables.

---

## 1. Core Schema Requirements

### 1.1 Required Columns (NOT NULL)

```sql
-- Core deal identifiers (REQUIRED)
candidate_id UUID NOT NULL REFERENCES candidates(id)
job_id UUID NOT NULL REFERENCES jobs(id)

-- Deal initiator
proposed_by UUID NOT NULL REFERENCES users(id)  -- Who initiated this CRA
```

**Rationale:** A CRA without candidate or job is not a deal. These are the minimum required fields.

### 1.2 Recruiter Role Columns (NULLABLE)

```sql
-- Candidate representation (optional)
candidate_recruiter_id UUID REFERENCES recruiters(id)  -- Represents candidate ("Closer")

-- Company representation (optional)
company_recruiter_id UUID REFERENCES recruiters(id)    -- Represents company ("Client/Hiring Facilitator")
```

**Rationale:** 
- Not all deals involve recruiters (candidate can apply directly, company can hire directly)
- Separates the two distinct roles in the marketplace
- Enables proper gate routing and fee splitting

**Migration Path:**
```sql
-- Deprecate ambiguous recruiter_id
ALTER TABLE candidate_role_assignments RENAME COLUMN recruiter_id TO candidate_recruiter_id;

-- Add company recruiter column
ALTER TABLE candidate_role_assignments ADD COLUMN company_recruiter_id UUID REFERENCES recruiters(id);
```

### 1.3 Sourcer Attribution Tables (REQUIRED FOR PERMANENCE)

**Sourcer Definition:** The recruiter who first brings a candidate or company to the platform.

**Critical Business Rules:**
- Sourcer attribution is **permanent** while the recruiter maintains an active account
- Only **one sourcer** per candidate and one sourcer per company (first recruiter wins)
- If sourcer's account becomes inactive, sourcer fee is NOT paid out (platform consumes remainder)
- Sourcer gets base 6% commission + bonus (2-4%) based on subscription tier

**Separate Tables Required:**
```sql
-- Candidate sourcing attribution (permanent record)
CREATE TABLE candidate_sourcers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    sourcer_recruiter_id UUID NOT NULL REFERENCES recruiters(id),
    sourced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Only one sourcer per candidate
    UNIQUE(candidate_id)
);

-- Company sourcing attribution (permanent record)
CREATE TABLE company_sourcers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sourcer_recruiter_id UUID NOT NULL REFERENCES recruiters(id),
    sourced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Only one sourcer per company
    UNIQUE(company_id)
);

CREATE INDEX idx_candidate_sourcers_recruiter ON candidate_sourcers(sourcer_recruiter_id);
CREATE INDEX idx_company_sourcers_recruiter ON company_sourcers(sourcer_recruiter_id);
```

**Why Separate Tables:**
- Tracks historical timestamp (when sourcing occurred)
- Enables future capabilities (e.g., handling candidate reactivation)
- Cleaner than denormalized columns on multiple tables
- Authority is explicit and cannot be accidentally overwritten

**DO NOT add sourcer columns to CRA** - CRA is the deal record, not the attribution ledger. Query sourcer data via JOIN when needed for commission calculations.

### 1.4 Job Owner (Posting Creator - Recruiter Only)

**Job Owner Definition:** The recruiter who created the job posting. This is the "Specs Owner" role in the commission structure.

**Critical Business Rules:**
- Job owner must be a **recruiter** (not company_admin or hiring_manager)
- Company employees do NOT receive job owner commissions
- Job owner gets 10-20% commission based on subscription tier
- Only recruiters who post jobs on behalf of companies get this payout

**Recommended Schema:**
```sql
-- On jobs table (NULLABLE - company employees can create jobs without payout)
ALTER TABLE jobs ADD COLUMN job_owner_recruiter_id UUID REFERENCES recruiters(id);

-- On placement/payout tables (money snapshot at hire)
ALTER TABLE placements ADD COLUMN job_owner_recruiter_id_snapshot UUID;
ALTER TABLE placements ADD COLUMN job_owner_rate_snapshot DECIMAL(5,2);
```

**Rationale:**
- Renamed from `job_poster_id` to `job_owner_recruiter_id` for clarity
- References `recruiters` table (not `users`) to enforce recruiter-only rule
- NULLABLE because company employees can create jobs (but don't get commission)
- Money snapshot at hire prevents changes from affecting historical payouts

---

## 2. Commission Structure & Fiscal Attribution

### 2.1 Five-Role Commission Model

Every placement has up to **5 commission-earning roles** (all nullable):

1. **Candidate Recruiter** ("Closer") - Represents the candidate
2. **Job Owner** ("Specs Owner") - Created the job posting (recruiter only)
3. **Company Recruiter** ("Client/Hiring Facilitator") - Represents the company
4. **Company Sourcer** ("BD") - First brought company to platform
5. **Candidate Sourcer** ("Discovery") - First brought candidate to platform

### 2.2 Subscription Tier Rates

**Premium Plan ($249/month):**
- Candidate Recruiter: 40%
- Job Owner: 20%
- Company Recruiter: 20%
- Company Sourcer: 6% + 4% bonus = 10%
- Candidate Sourcer: 6% + 4% bonus = 10%
- **Platform Remainder:** 0% (100% paid to roles)

**Paid Plan ($99/month):**
- Candidate Recruiter: 30%
- Job Owner: 15%
- Company Recruiter: 15%
- Company Sourcer: 6% + 2% bonus = 8%
- Candidate Sourcer: 6% + 2% bonus = 8%
- **Platform Remainder:** 24%

**Free Plan ($0/month):**
- Candidate Recruiter: 20%
- Job Owner: 10%
- Company Recruiter: 10%
- Company Sourcer: 6%
- Candidate Sourcer: 6%
- **Platform Remainder:** 48%

### 2.3 Nullable Roles & Platform Remainder

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

### 2.4 Sourcer Permanence Rules

**While Sourcer Has Active Account:**
- Candidate sourcer receives commission on ALL placements involving that candidate
- Company sourcer receives commission on ALL placements involving that company
- Sourcing attribution is permanent (first recruiter wins, no changes)

**If Sourcer Account Becomes Inactive:**
- Sourcer commission is NOT paid out
- Sourcer percentage goes to platform as remainder
- Attribution record remains (for potential reactivation in future)

**No Multiple Sourcers:**
- One candidate sourcer per candidate (first wins)
- One company sourcer per company (first wins)
- Future: may handle candidate "reactivation" but not implemented yet

### 2.5 Money Snapshot at Hire (Immutable)

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
    subscription_tier TEXT, -- 'premium' | 'paid' | 'free'
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Critical Rules:**
- CRA tracks deal state and role assignments (mutable during deal)
- placement_snapshot tracks money attribution (immutable after hire)
- Commission calculations ALWAYS use placement_snapshot (never live CRA data)
- If sourcer account becomes inactive after hire, payout still uses snapshotted rate

---

## 3. Gate Routing Columns

These columns support the gate review workflow (Phase 2):

```sql
-- Current gate state
current_gate TEXT CHECK (current_gate IN ('candidate_recruiter', 'company_recruiter', 'company', 'none'))

-- Gate progression path
gate_sequence JSONB DEFAULT '[]'  
-- Example: ['candidate_recruiter', 'company_recruiter', 'company']

-- Gate decision history
gate_history JSONB DEFAULT '[]'
-- Example: [
--   {
--     "gate": "candidate_recruiter",
--     "action": "approved",
--     "timestamp": "2026-01-16T10:00:00Z",
--     "reviewer_user_id": "uuid",
--     "notes": "Strong candidate"
--   }
-- ]

-- Routing metadata (cached for performance)
has_candidate_recruiter BOOLEAN DEFAULT FALSE
has_company_recruiter BOOLEAN DEFAULT FALSE

-- Indexes
CREATE INDEX idx_cra_current_gate ON candidate_role_assignments(current_gate) WHERE current_gate IS NOT NULL;
CREATE INDEX idx_cra_routing_flags ON candidate_role_assignments(has_candidate_recruiter, has_company_recruiter);
```

---

## 4. State Machine

### 3.1 CRA States

```sql
CREATE TYPE candidate_role_assignment_state AS ENUM (
    -- Proposal & Gate Review Phase
    'proposed',                    -- Deal created, determining routing
    'awaiting_candidate_recruiter', -- At candidate recruiter gate
    'awaiting_company_recruiter',   -- At company recruiter gate
    'awaiting_company',             -- At company gate
    'under_review',                 -- Gate actively reviewing
    'info_requested',               -- Gate requested more info
    
    -- Deal Pipeline Phase
    'submitted_to_company',         -- Passed all gates, in company's hands
    'screen',                       -- Phone screening
    'in_process',                   -- Interview process
    'offer',                        -- Offer extended
    'hired',                        -- Deal closed successfully
    
    -- Terminal States
    'rejected',                     -- Rejected by a gate or company
    'declined',                     -- Candidate declined
    'withdrawn',                    -- Candidate withdrew
    'timed_out'                     -- Proposal expired without response
);
```

### 3.2 State Transitions

```
proposed → awaiting_{first_gate} → ... → submitted_to_company → in_process → offer → hired
         ↓
       {rejected, declined, withdrawn, timed_out}
```

---

## 5. Uniqueness Constraint

**CRITICAL:** Enforce one active deal per candidate-job pair:

```sql
-- Add unique constraint for active deals
CREATE UNIQUE INDEX idx_cra_unique_active_deal 
ON candidate_role_assignments(candidate_id, job_id) 
WHERE state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed');
```

**Rationale:** Prevents duplicate deals and ensures fiscal clarity. Multiple recruiters can propose, but only one deal can be active at a time.

---

## 6. Complete Schema

### 5.1 Full Table Definition

```sql
CREATE TABLE candidate_role_assignments (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core deal identifiers (REQUIRED)
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Recruiter roles (OPTIONAL)
    candidate_recruiter_id UUID REFERENCES recruiters(id),  -- Represents candidate ("Closer")
    company_recruiter_id UUID REFERENCES recruiters(id),    -- Represents company ("Client/Hiring Facilitator")
    
    -- NOTE: Sourcer attribution NOT stored on CRA
    -- Query via JOINs to candidate_sourcers and company_sourcers tables
    
    -- Deal initiator (REQUIRED)
    proposed_by UUID NOT NULL REFERENCES users(id),
    
    -- State machine
    state candidate_role_assignment_state NOT NULL DEFAULT 'proposed',
    
    -- Gate routing (Phase 2)
    current_gate TEXT CHECK (current_gate IN ('candidate_recruiter', 'company_recruiter', 'company', 'none')),
    gate_sequence JSONB DEFAULT '[]',
    gate_history JSONB DEFAULT '[]',
    has_candidate_recruiter BOOLEAN DEFAULT FALSE,
    has_company_recruiter BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    proposed_at TIMESTAMPTZ DEFAULT NOW(),
    response_due_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    timed_out_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    proposal_notes TEXT,
    response_notes TEXT,
    
    -- Uniqueness: one active deal per candidate-job pair
    CONSTRAINT unique_active_deal UNIQUE (candidate_id, job_id) 
        DEFERRABLE INITIALLY DEFERRED  -- Allows temporary violations during state transitions
);

-- Indexes
CREATE INDEX idx_cra_candidate ON candidate_role_assignments(candidate_id);
CREATE INDEX idx_cra_job ON candidate_role_assignments(job_id);
CREATE INDEX idx_cra_candidate_recruiter ON candidate_role_assignments(candidate_recruiter_id);
CREATE INDEX idx_cra_company_recruiter ON candidate_role_assignments(company_recruiter_id);
CREATE INDEX idx_cra_state ON candidate_role_assignments(state);
CREATE INDEX idx_cra_current_gate ON candidate_role_assignments(current_gate) WHERE current_gate IS NOT NULL;
CREATE INDEX idx_cra_routing_flags ON candidate_role_assignments(has_candidate_recruiter, has_company_recruiter);
```

### 5.2 TypeScript Interface

```typescript
export interface CandidateRoleAssignment {
    // Core identifiers
    id: string;
    candidate_id: string;
    job_id: string;
    
    // Recruiter roles
    candidate_recruiter_id: string | null;  // Represents candidate ("Closer")
    company_recruiter_id: string | null;    // Represents company ("Client/Hiring Facilitator")
    
    // NOTE: Sourcer attribution NOT on CRA - query via candidate_sourcers/company_sourcers tables
    
    // Deal initiator
    proposed_by: string;  // User who initiated this CRA
    
    // State machine
    state: CandidateRoleAssignmentState;
    
    // Gate routing
    current_gate: 'candidate_recruiter' | 'company_recruiter' | 'company' | 'none' | null;
    gate_sequence: string[];  // e.g., ['candidate_recruiter', 'company_recruiter', 'company']
    gate_history: GateHistoryEntry[];
    has_candidate_recruiter: boolean;
    has_company_recruiter: boolean;
    
    // Timestamps
    proposed_at: Date;
    response_due_at?: Date | null;
    accepted_at?: Date | null;
    declined_at?: Date | null;
    timed_out_at?: Date | null;
    submitted_at?: Date | null;
    closed_at?: Date | null;
    created_at: Date;
    updated_at: Date;
    
    // Metadata
    proposal_notes?: string | null;
    response_notes?: string | null;
}

interface GateHistoryEntry {
    gate: 'candidate_recruiter' | 'company_recruiter' | 'company';
    action: 'approved' | 'denied' | 'info_requested';
    timestamp: string;  // ISO 8601
    reviewer_user_id: string;
    notes?: string;
}
```

---

## 7. Migration Strategy

### Step 1: Rename ambiguous recruiter_id

```sql
-- Rename recruiter_id to candidate_recruiter_id
ALTER TABLE candidate_role_assignments 
RENAME COLUMN recruiter_id TO candidate_recruiter_id;

-- Update all references (indexes, foreign keys)
ALTER INDEX idx_cra_recruiter RENAME TO idx_cra_candidate_recruiter;
```

### Step 2: Add company recruiter column

```sql
ALTER TABLE candidate_role_assignments 
ADD COLUMN company_recruiter_id UUID REFERENCES recruiters(id);

CREATE INDEX idx_cra_company_recruiter ON candidate_role_assignments(company_recruiter_id);
```

### Step 3: Create sourcer tables (REQUIRED)

```sql
-- Candidate sourcing attribution
CREATE TABLE candidate_sourcers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    sourcer_recruiter_id UUID NOT NULL REFERENCES recruiters(id),
    sourced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id)
);

-- Company sourcing attribution
CREATE TABLE company_sourcers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sourcer_recruiter_id UUID NOT NULL REFERENCES recruiters(id),
    sourced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id)
);

CREATE INDEX idx_candidate_sourcers_recruiter ON candidate_sourcers(sourcer_recruiter_id);
CREATE INDEX idx_company_sourcers_recruiter ON company_sourcers(sourcer_recruiter_id);

-- Backfill existing sourcer data from candidates/companies tables if columns exist
-- (See migration script for backfill logic)
```

### Step 4: Make core columns NOT NULL

```sql
-- Ensure no existing null values
UPDATE candidate_role_assignments 
SET candidate_id = '00000000-0000-0000-0000-000000000000'::uuid 
WHERE candidate_id IS NULL;

UPDATE candidate_role_assignments 
SET job_id = '00000000-0000-0000-0000-000000000000'::uuid 
WHERE job_id IS NULL;

-- Add NOT NULL constraints
ALTER TABLE candidate_role_assignments 
ALTER COLUMN candidate_id SET NOT NULL,
ALTER COLUMN job_id SET NOT NULL;
```

### Step 5: Add gate routing columns

```sql
-- See section 2 for full gate routing schema
ALTER TABLE candidate_role_assignments 
ADD COLUMN current_gate TEXT CHECK (current_gate IN ('candidate_recruiter', 'company_recruiter', 'company', 'none')),
ADD COLUMN gate_sequence JSONB DEFAULT '[]',
ADD COLUMN gate_history JSONB DEFAULT '[]',
ADD COLUMN has_candidate_recruiter BOOLEAN DEFAULT FALSE,
ADD COLUMN has_company_recruiter BOOLEAN DEFAULT FALSE;
```

### Step 6: Add uniqueness constraint

```sql
-- Add unique constraint for active deals
CREATE UNIQUE INDEX idx_cra_unique_active_deal 
ON candidate_role_assignments(candidate_id, job_id) 
WHERE state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed');
```

---

## 8. Data Model Relationships

### 7.1 CRA as the "Wiring Harness"

```
CandidateRoleAssignment (CRA) is the deal record that connects:

┌─────────────────────────────────────────────────────────────┐
│                  CANDIDATE ROLE ASSIGNMENT                  │
│                      (The Deal Record)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  candidate_id ────────────────────► candidates             │
│  job_id ──────────────────────────► jobs                   │
│                                                             │
│  candidate_recruiter_id ──────────► recruiters (Closer)    │
│  company_recruiter_id ────────────► recruiters (Client)    │
│                                                             │
│  proposed_by ──────────────────────► users (Initiator)     │
│                                                             │
│  state + timestamps + notes + gate routing                 │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ Query via JOIN
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
┌──────────────────────┐          ┌──────────────────────┐
│  candidate_sourcers  │          │  company_sourcers    │
├──────────────────────┤          ├──────────────────────┤
│  candidate_id ────┐  │          │  company_id ─────┐   │
│  sourcer_rec_id   │  │          │  sourcer_rec_id  │   │
│  sourced_at       │  │          │  sourced_at      │   │
└───────────────────┼──┘          └──────────────────┼───┘
                    │                                │
                    └──────────► recruiters ◄────────┘
                              (Permanent Attribution)
```

### 7.2 Attribution Chain

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

---

## 9. Anti-Patterns to Avoid

### ❌ Don't: Store money rates on CRA
```sql
-- WRONG - Rates change over time, CRA is not immutable
ALTER TABLE candidate_role_assignments ADD COLUMN recruiter_fee_percent DECIMAL(5,2);
```

**Why:** CRA state changes throughout deal lifecycle. Money snapshots must be immutable and belong in placement/payout tables.

### ❌ Don't: Store sourcer attribution on CRA or candidates/companies tables
```sql
-- WRONG - Sourcer is permanent, needs dedicated table with timestamp
ALTER TABLE candidate_role_assignments ADD COLUMN candidate_sourcer_id UUID;
-- OR
ALTER TABLE candidates ADD COLUMN sourcer_recruiter_id UUID;
```

**Why:** Sourcer attribution is permanent and needs historical proof (timestamp). Separate tables enable future capabilities (reactivation handling) and prevent accidental overwrites.

### ❌ Don't: Allow multiple active deals per candidate-job
```sql
-- WRONG - No uniqueness constraint
CREATE TABLE candidate_role_assignments (
    candidate_id UUID NOT NULL,
    job_id UUID NOT NULL,
    -- Missing UNIQUE constraint
);
```

**Why:** Creates fiscal ambiguity. Which deal gets credit for the hire? Must enforce one active deal per pair.

### ❌ Don't: Make candidate_id or job_id nullable
```sql
-- WRONG - CRA without candidate or job is meaningless
candidate_id UUID,  -- Should be NOT NULL
job_id UUID         -- Should be NOT NULL
```

**Why:** A CRA represents a specific deal between a candidate and a job. Both are required for correctness.

---

## 10. Query Patterns

### 9.1 Find Active Deals for Candidate

```sql
SELECT cra.*, 
       j.title as job_title,
       c.name as company_name,
       cr.name as candidate_recruiter_name,
       cor.name as company_recruiter_name
FROM candidate_role_assignments cra
JOIN jobs j ON cra.job_id = j.id
JOIN companies c ON j.company_id = c.id
LEFT JOIN recruiters cr ON cra.candidate_recruiter_id = cr.id
LEFT JOIN recruiters cor ON cra.company_recruiter_id = cor.id
WHERE cra.candidate_id = $1
  AND cra.state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed');
```

### 9.2 Find Deals at Specific Gate

```sql
SELECT cra.*, 
       c.name as candidate_name,
       j.title as job_title
FROM candidate_role_assignments cra
JOIN candidates c ON cra.candidate_id = c.id
JOIN jobs j ON cra.job_id = j.id
WHERE cra.current_gate = 'candidate_recruiter'
  AND cra.state = 'awaiting_candidate_recruiter'
  AND cra.candidate_recruiter_id IN (
      SELECT id FROM recruiters WHERE user_id = $1  -- Current user's recruiter ID
  );
```

### 10.3 Sourcer Attribution Queries

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

-- Get all deals involving a sourcer (for commission calculation)
SELECT 
    cra.*,
    c.name as candidate_name,
    j.title as job_title,
    co.name as company_name
FROM candidate_role_assignments cra
JOIN candidates c ON c.id = cra.candidate_id
JOIN jobs j ON j.id = cra.job_id
JOIN companies co ON co.id = j.company_id
LEFT JOIN candidate_sourcers cs ON cs.candidate_id = cra.candidate_id
LEFT JOIN company_sourcers cos ON cos.company_id = co.id
WHERE cs.sourcer_recruiter_id = $1 OR cos.sourcer_recruiter_id = $1;

-- Check if sourcer account is active before payout
SELECT 
    cs.sourcer_recruiter_id,
    r.status
FROM candidate_sourcers cs
JOIN recruiters r ON r.id = cs.sourcer_recruiter_id
WHERE cs.candidate_id = $1
  AND r.status = 'active';  -- Only pay if active
```

### 10.4 Gate Routing Determination

```typescript
async determineGateRouting(jobId: string, candidateId: string): Promise<GateRouting> {
    // Check for active candidate recruiter relationship
    const candidateRecruiter = await supabase
        .from('recruiter_candidates')
        .select('recruiter_id')
        .eq('candidate_id', candidateId)
        .eq('status', 'active')
        .maybeSingle();

    // Check for company recruiter assignment on job
    const job = await supabase
        .from('jobs')
        .select('recruiter_id')  // This becomes company_recruiter_id
        .eq('id', jobId)
        .single();

    const hasCandidateRecruiter = !!candidateRecruiter?.data?.recruiter_id;
    const hasCompanyRecruiter = !!job?.data?.recruiter_id;

    // Build gate sequence
    const gateSequence: string[] = [];
    if (hasCandidateRecruiter) gateSequence.push('candidate_recruiter');
    if (hasCompanyRecruiter) gateSequence.push('company_recruiter');
    gateSequence.push('company');

    return {
        firstGate: gateSequence[0],
        gateSequence,
        hasCandidateRecruiter,
        hasCompanyRecruiter,
        candidateRecruiterId: candidateRecruiter?.data?.recruiter_id,
        companyRecruiterId: job?.data?.recruiter_id,
    };
}
```

---

## 11. Related Documentation

- [Application Flow Alignment](../flows/plan-applicationProposalFlowImplementationAlignment.prompt.md) - Overall workflow
- [Phase 2 Gate Review Implementation](../flows/PHASE-2-GATE-REVIEW-IMPLEMENTATION-PLAN.md) - Gate system details
- [Recruiter to Recruiter Collaboration](../business-logic/recruiter-to-recruiter-collaboration.md) - Fee splitting
- [Service Architecture Pattern](./service-architecture-pattern.md) - Repository/service patterns

---

## 12. Questions & Answers

**Q:** Should candidate_recruiter_id and company_recruiter_id both be stored on CRA?  
**A:** Yes. 100%. They represent distinct roles in the deal and enable proper gate routing and fee splitting.

**Q:** Should CRA store sourcer IDs?  
**A:** No. Sourcer attribution is permanent and belongs in dedicated `candidate_sourcers` and `company_sourcers` tables with timestamps. Query via JOIN when needed for commission calculations.

**Q:** Should job_owner_recruiter_id be on CRA?  
**A:** No. Store on jobs table as `job_owner_recruiter_id`. Only recruiters can be job owners (company employees don't get commission). Snapshot at hire time in `placement_snapshot`.

**Q:** What happens if sourcer leaves platform?  
**A:** Sourcer commission is NOT paid out. That percentage goes to platform as remainder. Attribution record remains (for potential future reactivation).

**Q:** Can a candidate have multiple sourcers?  
**A:** No. Only one sourcer per candidate (first recruiter wins). Same for companies. Unique constraint enforces this.

**Q:** How long is sourcer attribution valid?  
**A:** Permanent while sourcer maintains active account. Not time-based - tied to account status.

**Q:** Should candidate_id and job_id be nullable?  
**A:** No. These are required for a CRA to exist. Use NOT NULL constraints.

**Q:** How do I enforce one deal per candidate-job pair?  
**A:** Add unique constraint on (candidate_id, job_id) filtered to active states only.

---

**Document Status:** ✅ AUTHORITATIVE SPECIFICATION  
**Last Updated:** January 16, 2026  
**Approved By:** Engineering Team

