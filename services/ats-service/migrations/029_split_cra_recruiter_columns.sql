-- Migration 029: Split CRA Recruiter Columns
-- Purpose: Split single recruiter_id into candidate_recruiter_id and company_recruiter_id
-- Author: GitHub Copilot
-- Date: 2026-01-16

BEGIN;

-- Step 1: Rename recruiter_id to candidate_recruiter_id (semantic clarity)
ALTER TABLE candidate_role_assignments 
RENAME COLUMN recruiter_id TO candidate_recruiter_id;

-- Step 2: Add company_recruiter_id column (nullable - not all deals have company recruiter)
ALTER TABLE candidate_role_assignments 
ADD COLUMN company_recruiter_id UUID REFERENCES recruiters(id);

-- Step 3: Add gate routing columns (Phase 2 support)
ALTER TABLE candidate_role_assignments 
ADD COLUMN current_gate TEXT CHECK (current_gate IN ('candidate_recruiter', 'company_recruiter', 'company', 'none')),
ADD COLUMN gate_sequence JSONB DEFAULT '[]',
ADD COLUMN gate_history JSONB DEFAULT '[]',
ADD COLUMN has_candidate_recruiter BOOLEAN DEFAULT FALSE,
ADD COLUMN has_company_recruiter BOOLEAN DEFAULT FALSE;

-- Step 4: Update indexes (drop old, create new)
DROP INDEX IF EXISTS idx_cra_recruiter;

CREATE INDEX idx_cra_candidate_recruiter ON candidate_role_assignments(candidate_recruiter_id) 
WHERE candidate_recruiter_id IS NOT NULL;

CREATE INDEX idx_cra_company_recruiter ON candidate_role_assignments(company_recruiter_id) 
WHERE company_recruiter_id IS NOT NULL;

CREATE INDEX idx_cra_current_gate ON candidate_role_assignments(current_gate) 
WHERE current_gate IS NOT NULL;

CREATE INDEX idx_cra_routing_flags ON candidate_role_assignments(has_candidate_recruiter, has_company_recruiter);

-- Step 5: Add comments for documentation
COMMENT ON COLUMN candidate_role_assignments.candidate_recruiter_id IS 'Recruiter representing the candidate (Closer role)';
COMMENT ON COLUMN candidate_role_assignments.company_recruiter_id IS 'Recruiter representing the company (Client/Hiring Facilitator role)';
COMMENT ON COLUMN candidate_role_assignments.current_gate IS 'Current gate in review workflow: candidate_recruiter, company_recruiter, company, or none';
COMMENT ON COLUMN candidate_role_assignments.gate_sequence IS 'Ordered list of gates for this CRA based on recruiter presence';
COMMENT ON COLUMN candidate_role_assignments.gate_history IS 'Array of gate review decisions with timestamps, reviewers, and notes';
COMMENT ON COLUMN candidate_role_assignments.has_candidate_recruiter IS 'Cached flag: true if candidate_recruiter_id is not null';
COMMENT ON COLUMN candidate_role_assignments.has_company_recruiter IS 'Cached flag: true if company_recruiter_id is not null';

-- Step 6: Update existing rows (set routing flags based on current state)
UPDATE candidate_role_assignments
SET 
    has_candidate_recruiter = (candidate_recruiter_id IS NOT NULL),
    has_company_recruiter = FALSE  -- No company recruiters exist yet
WHERE TRUE;

COMMIT;
