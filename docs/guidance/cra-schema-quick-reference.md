# CRA Schema Quick Reference

**Date:** January 16, 2026  
**Purpose:** Quick lookup for CRA schema structure and usage

---

## Core Columns (Required)

| Column | Type | Constraint | Purpose |
|--------|------|------------|---------|
| `candidate_id` | UUID | NOT NULL | Who is applying |
| `job_id` | UUID | NOT NULL | What job they're applying to |
| `proposed_by` | UUID | NOT NULL | User who initiated this CRA |

**Rule:** These three are ALWAYS required. No deal without them.

---

## Recruiter Roles (Optional)

| Column | Type | Role | Description |
|--------|------|------|-------------|
| `candidate_recruiter_id` | UUID | Closer | Represents the candidate |
| `company_recruiter_id` | UUID | Client/Hiring Facilitator | Represents the company |

**Rule:** Both are nullable. Direct applications have neither. Some deals have one, some have both.

**Phase 2:** Gate routing uses these to determine approval path.

---

## Sourcer Attribution (Separate Tables)

**Sourcer attribution is NOT stored on CRA.** Instead, query via `candidate_sourcers` and `company_sourcers` tables.

| Table | Purpose |
|-------|----------|
| `candidate_sourcers` | Permanent tracking of who sourced the candidate |
| `company_sourcers` | Permanent tracking of who sourced the company |

**Rule:** Sourcer attribution is **permanent while recruiter has active account**. Authority lives in dedicated tables with timestamps, NOT on CRA.

**Query Example:**
```sql
-- Get candidate's sourcer
SELECT cs.*, r.name as sourcer_name, r.status
FROM candidate_sourcers cs
JOIN recruiters r ON r.id = cs.sourcer_recruiter_id
WHERE cs.candidate_id = $1;
```

**Commission:** Base 6% + bonus (0-4%) based on subscription tier. Only paid while sourcer account is active.

See [Sourcer Tables Schema](#sourcer-tables-schema) section below for full table definitions.

---

## State Machine

```
proposed → awaiting_{gate} → submitted_to_company → in_process → offer → hired
         ↓
       {rejected, declined, withdrawn, timed_out}
```

**Active States:** `proposed`, `awaiting_*`, `under_review`, `info_requested`, `submitted_to_company`, `screen`, `in_process`, `offer`

**Terminal States:** `hired`, `rejected`, `declined`, `withdrawn`, `timed_out`, `closed`

---

## Gate Routing Columns (Phase 2)

| Column | Type | Purpose |
|--------|------|---------|
| `current_gate` | TEXT | Which gate is reviewing now |
| `gate_sequence` | JSONB | Full gate path: `['candidate_recruiter', 'company_recruiter', 'company']` |
| `gate_history` | JSONB | Decision log with timestamps, notes, reviewers |
| `has_candidate_recruiter` | BOOLEAN | Cached flag for query performance |
| `has_company_recruiter` | BOOLEAN | Cached flag for query performance |

---

## Constraints

### Unique Constraint (Active Deals)
```sql
UNIQUE (candidate_id, job_id) 
WHERE state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed')
```

**Rule:** Only one active deal per candidate-job pair. Historical/closed deals don't violate this.

---

## Common Anti-Patterns ❌

### ❌ Don't: Conflate candidate_recruiter_id and company_recruiter_id
```typescript
// WRONG
const recruiterId = cra.recruiter_id;  // Which recruiter?
```

```typescript
// CORRECT
const candidateRep = cra.candidate_recruiter_id;  // Candidate's recruiter
const companyRep = cra.company_recruiter_id;      // Company's recruiter
```

### ❌ Don't: Store money rates on CRA
```sql
-- WRONG
ALTER TABLE candidate_role_assignments ADD COLUMN fee_percent DECIMAL;
```

**Why:** CRA state changes. Money must be immutable. Use placement_snapshot.

### ❌ Don't: Store sourcer attribution on CRA
```sql
-- WRONG - Sourcer attribution belongs in separate tables
ALTER TABLE candidate_role_assignments ADD COLUMN candidate_sourcer_id UUID;
ALTER TABLE candidate_role_assignments ADD COLUMN company_sourcer_id UUID;
```

```sql
-- CORRECT - Use dedicated tables with timestamps
CREATE TABLE candidate_sourcers (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL UNIQUE,
    sourcer_recruiter_id UUID NOT NULL,
    sourced_at TIMESTAMPTZ
);
```

**Why:** Sourcer attribution is permanent and needs historical proof (timestamp). Separate tables enable future capabilities (reactivation handling) and prevent accidental overwrites.

### ❌ Don't: Allow nullable candidate_id or job_id
```sql
-- WRONG
candidate_id UUID,  -- Should be NOT NULL
job_id UUID         -- Should be NOT NULL
```

---

## Query Patterns

### Get candidate's sourcer
```sql
SELECT cs.*, r.name as sourcer_name, r.status as sourcer_status
FROM candidate_sourcers cs
JOIN recruiters r ON r.id = cs.sourcer_recruiter_id
WHERE cs.candidate_id = $1;
```

### Get company's sourcer
```sql
SELECT cos.*, r.name as sourcer_name, r.status as sourcer_status
FROM company_sourcers cos
JOIN recruiters r ON r.id = cos.sourcer_recruiter_id
WHERE cos.company_id = $1;
```

### Find deals for candidate recruiter
```sql
SELECT * FROM candidate_role_assignments
WHERE candidate_recruiter_id = $1
  AND state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed');
```

### Find deals for company recruiter
```sql
SELECT * FROM candidate_role_assignments
WHERE company_recruiter_id = $1
  AND state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed');
```

### Find deals at specific gate
```sql
SELECT * FROM candidate_role_assignments
WHERE current_gate = 'candidate_recruiter'
  AND state = 'awaiting_candidate_recruiter'
  AND candidate_recruiter_id IN (
      SELECT id FROM recruiters WHERE user_id = $1
  );
```

### Check for existing active deal
```sql
SELECT id FROM candidate_role_assignments
WHERE candidate_id = $1
  AND job_id = $2
  AND state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed')
LIMIT 1;
```

---

## TypeScript Interface

```typescript
export interface CandidateRoleAssignment {
    // Core identifiers (REQUIRED)
    id: string;
    candidate_id: string;
    job_id: string;
    
    // Recruiter roles (OPTIONAL)
    candidate_recruiter_id: string | null;  // Represents candidate (Closer)
    company_recruiter_id: string | null;    // Represents company (Client/Hiring Facilitator)
    
    // NOTE: Sourcer attribution NOT on CRA
    // Query via candidate_sourcers/company_sourcers tables
    
    // Deal initiator (REQUIRED)
    proposed_by: string;  // User who initiated this CRA
    
    // State machine
    state: CandidateRoleAssignmentState;
    
    // Gate routing (Phase 2)
    current_gate: 'candidate_recruiter' | 'company_recruiter' | 'company' | 'none' | null;
    gate_sequence: string[];
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
```

---

## Decision Tree

### When creating CRA, determine recruiters:

```
1. Is there an active recruiter_candidates relationship?
   → YES: Set candidate_recruiter_id
   → NO: Leave candidate_recruiter_id as NULL

2. Does jobs.recruiter_id exist for this job?
   → YES: Set company_recruiter_id = jobs.recruiter_id
   → NO: Leave company_recruiter_id as NULL

3. Who initiated this CRA?
   → ALWAYS set proposed_by (candidate, recruiter, or admin)
```

### Gate routing sequence:

```
1. has_candidate_recruiter = TRUE?
   → YES: Add 'candidate_recruiter' to gate_sequence

2. has_company_recruiter = TRUE?
   → YES: Add 'company_recruiter' to gate_sequence

3. Always add 'company' as final gate

4. Set firstGate = gate_sequence[0]
5. Set current_gate = firstGate
6. Set state = 'awaiting_{firstGate}'
```

---

## Migration Checklist

When implementing this schema:

- [ ] Create migration to split recruiter_id into candidate_recruiter_id
- [ ] Add company_recruiter_id column
- [ ] Create candidate_sourcers table (permanent sourcer attribution)
- [ ] Create company_sourcers table (permanent sourcer attribution)
- [ ] Add job_owner_recruiter_id to jobs table (NOT on CRA)
- [ ] Add NOT NULL constraints to candidate_id, job_id, proposed_by
- [ ] Add unique constraint on (candidate_id, job_id) for active deals
- [ ] Create indexes on all recruiter columns and sourcer tables
- [ ] Update TypeScript types in shared-types package
- [ ] Regenerate Supabase types: `pnpm supabase:types`
- [ ] Update service layer to query sourcer tables (no CRA columns)
- [ ] Update repository queries to use new columns
- [ ] Update API routes to accept new field names
- [ ] Test all scenarios: candidate-only, company-only, both, neither
- [ ] Backfill sourcer data if candidates/companies had sourcer columns
- [ ] Create placement_snapshot table for immutable money attribution

---

## Related Documentation

- **Authoritative Spec:** [docs/guidance/cra-schema-specifications.md](docs/guidance/cra-schema-specifications.md)
- **Implementation Plan:** [docs/flows/plan-applicationProposalFlowImplementationAlignment.prompt.md](docs/flows/plan-applicationProposalFlowImplementationAlignment.prompt.md)
- **Phase 2 Gates:** [docs/flows/PHASE-2-GATE-REVIEW-IMPLEMENTATION-PLAN.md](docs/flows/PHASE-2-GATE-REVIEW-IMPLEMENTATION-PLAN.md)

---

**Quick Reference Version:** 2.0 (Updated with sourcer tables & commission structure)  
**Last Updated:** January 16, 2026

