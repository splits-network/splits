-- Fix: Add missing FK constraint for applications.company_recruiter_id
-- This fixes the "Could not find a relationship between 'applications' and 'recruiters'" error

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
    
    RAISE NOTICE 'Added missing FK constraint: applications_company_recruiter_id_fkey';
  ELSE
    RAISE NOTICE 'FK constraint applications_company_recruiter_id_fkey already exists';
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS "idx_applications_company_recruiter_id"
  ON "public"."applications" ("company_recruiter_id")
  WHERE "company_recruiter_id" IS NOT NULL;

-- Reload PostgREST schema cache so the new FK is immediately available for joins
NOTIFY pgrst, 'reload schema';

-- Verify the constraint was created
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conname = 'applications_company_recruiter_id_fkey';