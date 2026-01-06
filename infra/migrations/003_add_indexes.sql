-- Add indexes for common query patterns
-- Phase 1: Performance optimization for recruiter and company filtering

-- ===== Identity Schema =====

-- Index for looking up users by Clerk ID (used on every auth request)
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);

-- Index for lookups by user_id + organization (used in user context resolution)
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_org ON memberships(user_id, organization_id);

-- ===== ATS Schema =====

-- Index for filtering jobs by status and company
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON jobs(company_id, status);

-- Index for candidate lookups by email
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_created_by ON candidates(created_by_user_id);

-- Index for applications filtering by recruiter, job, and stage
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_recruiter_id ON applications(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_job_stage ON applications(job_id, stage);
CREATE INDEX IF NOT EXISTS idx_applications_recruiter_stage ON applications(recruiter_id, stage);

-- Index for placements filtering by recruiter, company, and date
CREATE INDEX IF NOT EXISTS idx_placements_recruiter_id ON placements(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_placements_company_id ON placements(company_id);
CREATE INDEX IF NOT EXISTS idx_placements_job_id ON placements(job_id);
CREATE INDEX IF NOT EXISTS idx_placements_hired_at ON placements(hired_at DESC);
CREATE INDEX IF NOT EXISTS idx_placements_recruiter_hired_at ON placements(recruiter_id, hired_at DESC);
CREATE INDEX IF NOT EXISTS idx_placements_company_hired_at ON placements(company_id, hired_at DESC);

-- ===== Network Schema =====

-- Index for recruiter lookups by user_id (very common)
CREATE INDEX IF NOT EXISTS idx_recruiters_user_id ON recruiters(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiters_status ON recruiters(status);

-- Index for role assignments - critical for recruiter-specific job filtering
CREATE INDEX IF NOT EXISTS idx_role_assignments_job_id ON role_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_recruiter_id ON role_assignments(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_recruiter_job ON role_assignments(recruiter_id, job_id);

-- ===== Billing Schema =====

-- Index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_recruiter_id ON subscriptions(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Composite index for active subscriptions by recruiter
CREATE INDEX IF NOT EXISTS idx_subscriptions_recruiter_status ON subscriptions(recruiter_id, status);

-- Comments explaining index usage
COMMENT ON INDEX idx_jobs_company_status IS 'Supports company-specific job listings filtered by status';
COMMENT ON INDEX idx_applications_job_stage IS 'Supports job pipeline views showing applications by stage';
COMMENT ON INDEX idx_applications_recruiter_stage IS 'Supports recruiter dashboards showing their applications by stage';
COMMENT ON INDEX idx_role_assignments_recruiter_job IS 'Critical for /api/roles endpoint - filters jobs by recruiter assignments';
COMMENT ON INDEX idx_placements_recruiter_hired_at IS 'Supports recruiter earnings reports and stats, sorted by hire date';
