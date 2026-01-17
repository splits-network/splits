-- Migration 001: Create Placement Snapshot
-- Purpose: Immutable money attribution for five-role commission structure
-- Author: GitHub Copilot
-- Date: 2026-01-16

BEGIN;

-- Step 1: Create placement_snapshot table (money ledger)
CREATE TABLE placement_snapshot (
    placement_id UUID PRIMARY KEY,
    
    -- All 5 role IDs (nullable - not all roles present in every deal)
    candidate_recruiter_id UUID,
    company_recruiter_id UUID,
    job_owner_recruiter_id UUID,
    candidate_sourcer_recruiter_id UUID,
    company_sourcer_recruiter_id UUID,
    
    -- All 5 commission rates (percentage, nullable to match role IDs)
    candidate_recruiter_rate DECIMAL(5,2),
    company_recruiter_rate DECIMAL(5,2),
    job_owner_rate DECIMAL(5,2),
    candidate_sourcer_rate DECIMAL(5,2),
    company_sourcer_rate DECIMAL(5,2),
    
    -- Total placement fee and subscription tier at hire time
    total_placement_fee DECIMAL(10,2) NOT NULL,
    subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('premium', 'paid', 'free')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints: rates must be valid percentages
    CONSTRAINT valid_candidate_recruiter_rate CHECK (candidate_recruiter_rate IS NULL OR (candidate_recruiter_rate >= 0 AND candidate_recruiter_rate <= 100)),
    CONSTRAINT valid_company_recruiter_rate CHECK (company_recruiter_rate IS NULL OR (company_recruiter_rate >= 0 AND company_recruiter_rate <= 100)),
    CONSTRAINT valid_job_owner_rate CHECK (job_owner_rate IS NULL OR (job_owner_rate >= 0 AND job_owner_rate <= 100)),
    CONSTRAINT valid_candidate_sourcer_rate CHECK (candidate_sourcer_rate IS NULL OR (candidate_sourcer_rate >= 0 AND candidate_sourcer_rate <= 100)),
    CONSTRAINT valid_company_sourcer_rate CHECK (company_sourcer_rate IS NULL OR (company_sourcer_rate >= 0 AND company_sourcer_rate <= 100)),
    
    -- Constraint: total fee must be positive
    CONSTRAINT valid_placement_fee CHECK (total_placement_fee > 0)
);

-- Step 2: Create indexes for queries
CREATE INDEX idx_placement_snapshot_candidate_recruiter ON placement_snapshot(candidate_recruiter_id) 
WHERE candidate_recruiter_id IS NOT NULL;

CREATE INDEX idx_placement_snapshot_company_recruiter ON placement_snapshot(company_recruiter_id) 
WHERE company_recruiter_id IS NOT NULL;

CREATE INDEX idx_placement_snapshot_job_owner ON placement_snapshot(job_owner_recruiter_id) 
WHERE job_owner_recruiter_id IS NOT NULL;

CREATE INDEX idx_placement_snapshot_candidate_sourcer ON placement_snapshot(candidate_sourcer_recruiter_id) 
WHERE candidate_sourcer_recruiter_id IS NOT NULL;

CREATE INDEX idx_placement_snapshot_company_sourcer ON placement_snapshot(company_sourcer_recruiter_id) 
WHERE company_sourcer_recruiter_id IS NOT NULL;

CREATE INDEX idx_placement_snapshot_created_at ON placement_snapshot(created_at);
CREATE INDEX idx_placement_snapshot_tier ON placement_snapshot(subscription_tier);

-- Step 3: Add comments for documentation
COMMENT ON TABLE placement_snapshot IS 'Immutable money attribution snapshot at hire time - source of truth for commission calculations';
COMMENT ON COLUMN placement_snapshot.placement_id IS 'Foreign key to placements table (1:1 relationship)';
COMMENT ON COLUMN placement_snapshot.candidate_recruiter_id IS 'Snapshot of candidate recruiter (Closer role) at hire time';
COMMENT ON COLUMN placement_snapshot.company_recruiter_id IS 'Snapshot of company recruiter (Client/Hiring Facilitator role) at hire time';
COMMENT ON COLUMN placement_snapshot.job_owner_recruiter_id IS 'Snapshot of job owner (Specs Owner role) at hire time';
COMMENT ON COLUMN placement_snapshot.candidate_sourcer_recruiter_id IS 'Snapshot of candidate sourcer (Discovery role) at hire time';
COMMENT ON COLUMN placement_snapshot.company_sourcer_recruiter_id IS 'Snapshot of company sourcer (BD role) at hire time';
COMMENT ON COLUMN placement_snapshot.candidate_recruiter_rate IS 'Commission rate percentage for candidate recruiter (Premium: 40%, Paid: 30%, Free: 20%)';
COMMENT ON COLUMN placement_snapshot.company_recruiter_rate IS 'Commission rate percentage for company recruiter (Premium: 20%, Paid: 15%, Free: 10%)';
COMMENT ON COLUMN placement_snapshot.job_owner_rate IS 'Commission rate percentage for job owner (Premium: 20%, Paid: 15%, Free: 10%)';
COMMENT ON COLUMN placement_snapshot.candidate_sourcer_rate IS 'Commission rate percentage for candidate sourcer (Premium: 10%, Paid: 8%, Free: 6%)';
COMMENT ON COLUMN placement_snapshot.company_sourcer_rate IS 'Commission rate percentage for company sourcer (Premium: 10%, Paid: 8%, Free: 6%)';
COMMENT ON COLUMN placement_snapshot.total_placement_fee IS 'Total placement fee at hire time (immutable)';
COMMENT ON COLUMN placement_snapshot.subscription_tier IS 'Subscription tier at hire time: premium, paid, or free';

-- Step 4: Add RLS policies (if RLS is enabled)
ALTER TABLE placement_snapshot ENABLE ROW LEVEL SECURITY;

-- Platform admins see all snapshots
CREATE POLICY placement_snapshot_admin_all ON placement_snapshot
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

-- Billing admins see all snapshots
CREATE POLICY placement_snapshot_billing_all ON placement_snapshot
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN memberships m ON m.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND m.role = 'billing_admin'
        )
    );

-- Recruiters see snapshots where they have a role
CREATE POLICY placement_snapshot_recruiter_own ON placement_snapshot
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM recruiters r
            JOIN users u ON u.id = r.user_id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND (
                r.id = placement_snapshot.candidate_recruiter_id OR
                r.id = placement_snapshot.company_recruiter_id OR
                r.id = placement_snapshot.job_owner_recruiter_id OR
                r.id = placement_snapshot.candidate_sourcer_recruiter_id OR
                r.id = placement_snapshot.company_sourcer_recruiter_id
            )
        )
    );

COMMIT;
