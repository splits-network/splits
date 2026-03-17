-- Migration: Drop deprecated columns from jobs table
--
-- company_recruiter_id: moved to applications table (per-application attribution)
-- job_owner_id: removed entirely; only job_owner_recruiter_id is used
--
-- These columns are no longer written to or read from in application code.

-- Drop foreign key constraint first
ALTER TABLE "public"."jobs"
  DROP CONSTRAINT IF EXISTS "fk_jobs_company_recruiter_id";

-- Drop indexes
DROP INDEX IF EXISTS "public"."idx_jobs_company_recruiter_id";

-- Drop columns
ALTER TABLE "public"."jobs"
  DROP COLUMN IF EXISTS "company_recruiter_id",
  DROP COLUMN IF EXISTS "job_owner_id";
