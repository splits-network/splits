-- Migration: Add granular permissions JSONB to recruiter_companies
--
-- Purpose:
-- 1. Replace the single can_manage_company_jobs boolean with a granular permissions model
-- 2. Allow company admins to assign specific access levels to connected recruiters
-- 3. Backfill existing data: can_manage_company_jobs=true maps to all permissions granted
--
-- Permissions schema:
--   can_view_jobs          - View company job listings (default: true for all active relationships)
--   can_create_jobs        - Create new job listings for the company
--   can_edit_jobs          - Edit existing job listings
--   can_advance_candidates - Advance candidates through pre-offer application stages
--   can_view_applications  - View applications submitted to company jobs
--   can_submit_candidates  - Submit candidates to company job listings

BEGIN;

-- 1. Add permissions JSONB column with sensible defaults
ALTER TABLE recruiter_companies
ADD COLUMN permissions JSONB NOT NULL DEFAULT '{
    "can_view_jobs": true,
    "can_create_jobs": false,
    "can_edit_jobs": false,
    "can_advance_candidates": true,
    "can_view_applications": true,
    "can_submit_candidates": true
}'::jsonb;

-- 2. Backfill: recruiters with can_manage_company_jobs=true get full permissions
UPDATE recruiter_companies
SET permissions = '{
    "can_view_jobs": true,
    "can_create_jobs": true,
    "can_edit_jobs": true,
    "can_advance_candidates": true,
    "can_view_applications": true,
    "can_submit_candidates": true
}'::jsonb
WHERE can_manage_company_jobs = true;

-- 3. Add comments
COMMENT ON COLUMN recruiter_companies.permissions IS 'Granular permission flags controlling what the recruiter can do for this company. Replaces can_manage_company_jobs boolean.';

-- 4. Add a check constraint to ensure permissions contains valid keys
ALTER TABLE recruiter_companies
ADD CONSTRAINT chk_permissions_valid_keys CHECK (
    permissions ?& ARRAY[
        'can_view_jobs',
        'can_create_jobs',
        'can_edit_jobs',
        'can_advance_candidates',
        'can_view_applications',
        'can_submit_candidates'
    ]
);

COMMIT;
