-- Phase 1A: Add company_recruiter_id to applications table
-- This enables per-application company recruiter attribution instead of per-job.
-- Multiple company recruiters can now compete to fill the same role via different applications.

ALTER TABLE "public"."applications"
  ADD COLUMN "company_recruiter_id" uuid;

ALTER TABLE "public"."applications"
  ADD CONSTRAINT "applications_company_recruiter_id_fkey"
  FOREIGN KEY ("company_recruiter_id")
  REFERENCES "public"."recruiters"("id")
  ON UPDATE RESTRICT ON DELETE RESTRICT;

CREATE INDEX "idx_applications_company_recruiter_id"
  ON "public"."applications" ("company_recruiter_id")
  WHERE "company_recruiter_id" IS NOT NULL;

COMMENT ON COLUMN "public"."applications"."company_recruiter_id"
  IS 'Recruiter representing the company for this specific application. Set when a company recruiter submits a candidate. Per-application, not per-job.';
