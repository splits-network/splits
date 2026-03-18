-- Fix: Add missing FK constraint and index for applications.company_recruiter_id on production.
-- The column was added by 20260312000001 but the constraint and index failed to apply.
-- Uses IF NOT EXISTS / NOT EXISTS guards so this is safe to run on environments where they already exist.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'applications_company_recruiter_id_fkey'
  ) THEN
    ALTER TABLE "public"."applications"
      ADD CONSTRAINT "applications_company_recruiter_id_fkey"
      FOREIGN KEY ("company_recruiter_id")
      REFERENCES "public"."recruiters"("id")
      ON UPDATE RESTRICT ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_applications_company_recruiter_id"
  ON "public"."applications" ("company_recruiter_id")
  WHERE "company_recruiter_id" IS NOT NULL;

-- Reload PostgREST schema cache so the new FK is immediately available for joins
NOTIFY pgrst, 'reload schema';
