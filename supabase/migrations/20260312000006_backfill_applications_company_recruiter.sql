-- Phase 1F: Backfill company_recruiter_id on existing applications
-- Copies company_recruiter_id from the job to all its applications.
-- This ensures historical data is correct before we stop writing to jobs.

UPDATE "public"."applications" a
SET "company_recruiter_id" = j."company_recruiter_id"
FROM "public"."jobs" j
WHERE a."job_id" = j."id"
  AND j."company_recruiter_id" IS NOT NULL
  AND a."company_recruiter_id" IS NULL;
