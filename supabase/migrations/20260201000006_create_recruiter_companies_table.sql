-- Migration: Create recruiter_companies table and migrate from company_sourcers
--
-- Purpose:
-- 1. Replace company_sourcers with unified recruiter_companies table
-- 2. Support both sourcer attribution (1 per company) and recruiter relationships (N per company)
-- 3. Add relationship status tracking with audit trail
-- 4. Enable job management permissions for company recruiters

BEGIN;

-- 1. Create recruiter_companies table
CREATE TABLE IF NOT EXISTS recruiter_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('sourcer', 'recruiter')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'declined', 'terminated')),
    can_manage_company_jobs BOOLEAN NOT NULL DEFAULT false,
    
    -- Relationship lifecycle
    relationship_start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    relationship_end_date TIMESTAMPTZ,
    
    -- Audit trail
    termination_reason TEXT,
    terminated_by UUID REFERENCES users(id),
    invited_by UUID REFERENCES users(id),
    
    -- Standard timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add indexes for performance
CREATE INDEX idx_recruiter_companies_recruiter_id ON recruiter_companies(recruiter_id);
CREATE INDEX idx_recruiter_companies_company_id ON recruiter_companies(company_id);
CREATE INDEX idx_recruiter_companies_status ON recruiter_companies(status);
CREATE INDEX idx_recruiter_companies_type_status ON recruiter_companies(relationship_type, status);

-- 3. Add unique constraints
-- One active sourcer per company
CREATE UNIQUE INDEX idx_recruiter_companies_unique_active_sourcer 
    ON recruiter_companies(company_id) 
    WHERE relationship_type = 'sourcer' AND status = 'active';

-- One active relationship per recruiter-company-type combination
CREATE UNIQUE INDEX idx_recruiter_companies_unique_active_relationship 
    ON recruiter_companies(recruiter_id, company_id, relationship_type) 
    WHERE status = 'active';

-- 4. Add table and column comments
COMMENT ON TABLE recruiter_companies IS 'Unified table for recruiter-company relationships including sourcer attribution and active recruiting relationships';
COMMENT ON COLUMN recruiter_companies.relationship_type IS 'Type of relationship: sourcer (permanent attribution) or recruiter (active relationship)';
COMMENT ON COLUMN recruiter_companies.status IS 'Relationship status: pending (invitation sent), active (can work), declined (invitation rejected), terminated (ended)';
COMMENT ON COLUMN recruiter_companies.can_manage_company_jobs IS 'Permission to create, edit, delete jobs for this company';
COMMENT ON COLUMN recruiter_companies.relationship_start_date IS 'When relationship began (sourced_at for sourcers, accepted_at for recruiters)';
COMMENT ON COLUMN recruiter_companies.relationship_end_date IS 'When relationship ended (null for active relationships)';
COMMENT ON COLUMN recruiter_companies.termination_reason IS 'Reason for relationship termination (company_decision, recruiter_decision, account_deactivated, etc.)';
COMMENT ON COLUMN recruiter_companies.terminated_by IS 'User who terminated the relationship (null for system terminations)';
COMMENT ON COLUMN recruiter_companies.invited_by IS 'Company user who invited the recruiter (null for sourcer relationships)';

-- 5. Migrate existing data from company_sourcers
INSERT INTO recruiter_companies (
    recruiter_id, 
    company_id, 
    relationship_type, 
    status, 
    can_manage_company_jobs,
    relationship_start_date,
    created_at,
    updated_at
)
SELECT 
    sourcer_recruiter_id,
    company_id,
    'sourcer',
    'active',
    false, -- Sourcers don't get job management permissions by default
    sourced_at,
    created_at,
    updated_at
FROM company_sourcers
WHERE sourcer_recruiter_id IS NOT NULL
ON CONFLICT DO NOTHING; -- In case migration runs multiple times

-- 6. Drop the old company_sourcers table
DROP TABLE IF EXISTS company_sourcers;

-- 7. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recruiter_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for automatic timestamp updates
CREATE TRIGGER trigger_recruiter_companies_updated_at
    BEFORE UPDATE ON recruiter_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_recruiter_companies_updated_at();

COMMIT;