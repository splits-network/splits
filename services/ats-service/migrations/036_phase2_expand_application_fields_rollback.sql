-- Rollback: Remove Phase 2 application fields 
-- Rollback for Phase 2 of consolidating application flow

-- Drop indexes first
DROP INDEX IF EXISTS idx_applications_placement_id;
DROP INDEX IF EXISTS idx_applications_stage;
DROP INDEX IF EXISTS idx_applications_submitted_at;
DROP INDEX IF EXISTS idx_applications_hired_at;

-- Remove the new fields added in Phase 2
ALTER TABLE public.applications
DROP COLUMN IF EXISTS internal_notes,
DROP COLUMN IF EXISTS cover_letter,
DROP COLUMN IF EXISTS salary,
DROP COLUMN IF EXISTS submitted_at,
DROP COLUMN IF EXISTS hired_at,
DROP COLUMN IF EXISTS placement_id;