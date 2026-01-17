-- Migration 030: Create Sourcer Tables (FIXED VERSION)
-- Purpose: Create company_sourcers table and fix candidate_sourcers field naming
-- Decision 1: Rename sourcer_user_id to sourcer_recruiter_id (align with spec)
-- Decision 3: Single permanent model (remove protection window logic)
-- Fix: Handle existing data with missing recruiter records
-- Author: GitHub Copilot
-- Date: 2026-01-16

BEGIN;

-- Step 1: First, let's check and clean up any orphaned candidate_sourcers
-- Delete candidate_sourcers where sourcer_user_id doesn't have a matching recruiter
DELETE FROM candidate_sourcers
WHERE sourcer_user_id NOT IN (SELECT user_id FROM recruiters WHERE user_id IS NOT NULL);

-- Step 2: Add new column with correct name
ALTER TABLE candidate_sourcers 
ADD COLUMN sourcer_recruiter_id UUID;

-- Step 3: Populate new column from existing data (user_id -> recruiter.id lookup)
UPDATE candidate_sourcers cs
SET sourcer_recruiter_id = r.id
FROM recruiters r
WHERE r.user_id = cs.sourcer_user_id;

-- Step 4: Add NOT NULL constraint now that data is populated
ALTER TABLE candidate_sourcers
ALTER COLUMN sourcer_recruiter_id SET NOT NULL;

-- Step 5: Drop old column
ALTER TABLE candidate_sourcers
DROP COLUMN sourcer_user_id;

-- Step 6: Add foreign key constraint
ALTER TABLE candidate_sourcers
ADD CONSTRAINT candidate_sourcers_sourcer_recruiter_id_fkey 
FOREIGN KEY (sourcer_recruiter_id) REFERENCES recruiters(id) ON DELETE RESTRICT;

-- Step 7: Update index
DROP INDEX IF EXISTS idx_candidate_sourcers_user;

CREATE INDEX idx_candidate_sourcers_recruiter ON candidate_sourcers(sourcer_recruiter_id);

-- Step 8: Create company_sourcers table (permanent attribution)
CREATE TABLE IF NOT EXISTS company_sourcers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sourcer_recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE RESTRICT,
    sourced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one sourcer per company (first wins)
    CONSTRAINT unique_company_sourcer UNIQUE (company_id)
);

-- Step 9: Create indexes for company_sourcers
CREATE INDEX IF NOT EXISTS idx_company_sourcers_company ON company_sourcers(company_id);
CREATE INDEX IF NOT EXISTS idx_company_sourcers_recruiter ON company_sourcers(sourcer_recruiter_id);
CREATE INDEX IF NOT EXISTS idx_company_sourcers_sourced_at ON company_sourcers(sourced_at);

-- Step 10: Add comments for documentation
COMMENT ON TABLE company_sourcers IS 'Permanent attribution of company sourcing - first recruiter wins, account-based (not time-based)';
COMMENT ON COLUMN company_sourcers.company_id IS 'Company that was sourced (unique - only one sourcer per company)';
COMMENT ON COLUMN company_sourcers.sourcer_recruiter_id IS 'Recruiter who first brought this company to the platform (BD role)';
COMMENT ON COLUMN company_sourcers.sourced_at IS 'Timestamp when company was first sourced (proof of attribution)';

COMMENT ON TABLE candidate_sourcers IS 'Permanent attribution of candidate sourcing - first recruiter wins, account-based (not time-based)';
COMMENT ON COLUMN candidate_sourcers.sourcer_recruiter_id IS 'Recruiter who first brought this candidate to the platform (Discovery role)';

-- Step 11: Add RLS policies (if RLS is enabled)
ALTER TABLE company_sourcers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS company_sourcers_admin_all ON company_sourcers;
DROP POLICY IF EXISTS company_sourcers_recruiter_own ON company_sourcers;
DROP POLICY IF EXISTS company_sourcers_company_own ON company_sourcers;

-- Platform admins see all
CREATE POLICY company_sourcers_admin_all ON company_sourcers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN memberships m ON m.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND m.role = 'platform_admin'
        )
    );

-- Recruiters see their own sourcing records
CREATE POLICY company_sourcers_recruiter_own ON company_sourcers
    FOR SELECT
    TO authenticated
    USING (
        sourcer_recruiter_id IN (
            SELECT r.id FROM recruiters r
            JOIN users u ON u.id = r.user_id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Company users see their company's sourcer (if exists)
CREATE POLICY company_sourcers_company_own ON company_sourcers
    FOR SELECT
    TO authenticated
    USING (
        company_id IN (
            SELECT m.organization_id FROM users u
            JOIN memberships m ON m.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

COMMIT;
