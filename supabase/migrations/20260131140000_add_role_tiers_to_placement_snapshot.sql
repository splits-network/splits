-- Add per-role subscription tiers to placement_snapshot

BEGIN;

ALTER TABLE placement_snapshot
    ADD COLUMN IF NOT EXISTS candidate_recruiter_tier TEXT,
    ADD COLUMN IF NOT EXISTS company_recruiter_tier TEXT,
    ADD COLUMN IF NOT EXISTS job_owner_tier TEXT,
    ADD COLUMN IF NOT EXISTS candidate_sourcer_tier TEXT,
    ADD COLUMN IF NOT EXISTS company_sourcer_tier TEXT;

ALTER TABLE placement_snapshot
    ADD CONSTRAINT placement_snapshot_candidate_recruiter_tier_check
    CHECK (candidate_recruiter_tier IS NULL OR candidate_recruiter_tier IN ('free', 'paid', 'premium'));

ALTER TABLE placement_snapshot
    ADD CONSTRAINT placement_snapshot_company_recruiter_tier_check
    CHECK (company_recruiter_tier IS NULL OR company_recruiter_tier IN ('free', 'paid', 'premium'));

ALTER TABLE placement_snapshot
    ADD CONSTRAINT placement_snapshot_job_owner_tier_check
    CHECK (job_owner_tier IS NULL OR job_owner_tier IN ('free', 'paid', 'premium'));

ALTER TABLE placement_snapshot
    ADD CONSTRAINT placement_snapshot_candidate_sourcer_tier_check
    CHECK (candidate_sourcer_tier IS NULL OR candidate_sourcer_tier IN ('free', 'paid', 'premium'));

ALTER TABLE placement_snapshot
    ADD CONSTRAINT placement_snapshot_company_sourcer_tier_check
    CHECK (company_sourcer_tier IS NULL OR company_sourcer_tier IN ('free', 'paid', 'premium'));

COMMIT;
