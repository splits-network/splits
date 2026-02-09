-- Migration: Rename application_feedback to application_notes and expand capabilities
-- This migration:
-- 1. Renames the table from application_feedback to application_notes
-- 2. Expands created_by_type to include company-side users
-- 3. Renames feedback_type to note_type and adds new types
-- 4. Adds visibility column for controlling who can see notes
-- 5. Adds trigger to update application search_vector when notes change

-- Step 1: Rename table
ALTER TABLE public.application_feedback RENAME TO application_notes;

-- Step 2: Rename feedback_type column to note_type
ALTER TABLE public.application_notes RENAME COLUMN feedback_type TO note_type;

-- Step 3: Drop old constraints
ALTER TABLE public.application_notes DROP CONSTRAINT IF EXISTS application_feedback_created_by_type_check;
ALTER TABLE public.application_notes DROP CONSTRAINT IF EXISTS application_feedback_feedback_type_check;

-- Step 4: Add expanded created_by_type constraint
ALTER TABLE public.application_notes ADD CONSTRAINT application_notes_created_by_type_check
  CHECK (created_by_type IN (
    'candidate',
    'candidate_recruiter',
    'company_recruiter',
    'hiring_manager',
    'company_admin',
    'platform_admin'
  ));

-- Step 5: Add expanded note_type constraint
ALTER TABLE public.application_notes ADD CONSTRAINT application_notes_note_type_check
  CHECK (note_type IN (
    'info_request',
    'info_response',
    'note',
    'improvement_request',
    'stage_transition',
    'interview_feedback',
    'general'
  ));

-- Step 6: Add visibility column with default 'shared'
ALTER TABLE public.application_notes ADD COLUMN visibility TEXT NOT NULL DEFAULT 'shared'
  CHECK (visibility IN ('shared', 'company_only', 'candidate_only'));

-- Step 7: Rename existing indexes to match new table name
ALTER INDEX IF EXISTS idx_app_feedback_application RENAME TO idx_app_notes_application;
ALTER INDEX IF EXISTS idx_app_feedback_created_by RENAME TO idx_app_notes_created_by;
ALTER INDEX IF EXISTS idx_app_feedback_thread RENAME TO idx_app_notes_thread;

-- Step 8: Add new index for visibility filtering
CREATE INDEX IF NOT EXISTS idx_app_notes_visibility
  ON public.application_notes(application_id, visibility, created_at DESC);

-- Step 9: Handle trigger renaming (PostgreSQL doesn't support IF EXISTS with ALTER TRIGGER)
DO $$
BEGIN
  -- Check if the old trigger exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_application_feedback_updated_at' 
    AND event_object_table = 'application_notes'
  ) THEN
    DROP TRIGGER update_application_feedback_updated_at ON public.application_notes;
  END IF;
  
  -- Create the new trigger with correct name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_application_notes_updated_at' 
    AND event_object_table = 'application_notes'
  ) THEN
    CREATE TRIGGER update_application_notes_updated_at
      BEFORE UPDATE ON public.application_notes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Step 10: Rename foreign key constraints to match new table name
ALTER TABLE public.application_notes
  RENAME CONSTRAINT application_feedback_application_id_fkey
  TO application_notes_application_id_fkey;

ALTER TABLE public.application_notes
  RENAME CONSTRAINT application_feedback_created_by_user_id_fkey
  TO application_notes_created_by_user_id_fkey;

ALTER TABLE public.application_notes
  RENAME CONSTRAINT application_feedback_in_response_to_id_fkey
  TO application_notes_in_response_to_id_fkey;

ALTER TABLE public.application_notes
  RENAME CONSTRAINT application_feedback_pkey
  TO application_notes_pkey;

-- Step 11: Update table comment
COMMENT ON TABLE public.application_notes IS 'Stores notes and communication between all parties during application lifecycle';
COMMENT ON COLUMN public.application_notes.note_type IS 'Type of note: info_request, info_response, note, improvement_request, stage_transition, interview_feedback, or general';
COMMENT ON COLUMN public.application_notes.visibility IS 'Controls who can see the note: shared (all parties), company_only (company-side users), or candidate_only (candidate-side users)';

-- Step 12: Create placeholder function for future search integration
-- Notes can be searched directly via the application_notes table
-- This is a no-op placeholder that can be enhanced later if needed
CREATE OR REPLACE FUNCTION update_application_search_from_notes()
RETURNS TRIGGER AS $$
BEGIN
  -- No-op for now - notes are searchable directly via the notes table
  -- Future enhancement: integrate with application search_vector
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 13: Create trigger (no-op for now, but infrastructure is in place)
DROP TRIGGER IF EXISTS update_search_on_note_change ON application_notes;
CREATE TRIGGER update_search_on_note_change
AFTER INSERT OR UPDATE OR DELETE ON application_notes
FOR EACH ROW EXECUTE FUNCTION update_application_search_from_notes();

-- Step 14: Migrate existing application notes from text columns to new table (if columns exist)
-- This is wrapped in a DO block to safely check for column existence
DO $$
BEGIN
  -- Only attempt migration if notes column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'notes'
  ) THEN
    INSERT INTO application_notes (
      application_id,
      created_by_user_id,
      created_by_type,
      note_type,
      visibility,
      message_text,
      created_at,
      updated_at
    )
    SELECT
      a.id as application_id,
      COALESCE(c.user_id, a.candidate_id) as created_by_user_id,
      'candidate' as created_by_type,
      'general' as note_type,
      'shared' as visibility,
      a.notes as message_text,
      a.updated_at as created_at,
      a.updated_at as updated_at
    FROM applications a
    LEFT JOIN candidates c ON c.id = a.candidate_id
    WHERE a.notes IS NOT NULL
      AND a.notes != ''
      AND NOT EXISTS (
        SELECT 1 FROM application_notes an
        WHERE an.application_id = a.id
          AND an.message_text = a.notes
      );
  END IF;

  -- Only attempt migration if recruiter_notes column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'recruiter_notes'
  ) THEN
    INSERT INTO application_notes (
      application_id,
      created_by_user_id,
      created_by_type,
      note_type,
      visibility,
      message_text,
      created_at,
      updated_at
    )
    SELECT
      a.id as application_id,
      COALESCE(r.user_id, a.candidate_recruiter_id) as created_by_user_id,
      'candidate_recruiter' as created_by_type,
      'general' as note_type,
      'shared' as visibility,
      a.recruiter_notes as message_text,
      a.updated_at as created_at,
      a.updated_at as updated_at
    FROM applications a
    LEFT JOIN recruiters r ON r.id = a.candidate_recruiter_id
    WHERE a.recruiter_notes IS NOT NULL
      AND a.recruiter_notes != ''
      AND a.candidate_recruiter_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM application_notes an
        WHERE an.application_id = a.id
          AND an.message_text = a.recruiter_notes
      );
  END IF;

  -- Only attempt migration if internal_notes column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'internal_notes'
  ) THEN
    INSERT INTO application_notes (
      application_id,
      created_by_user_id,
      created_by_type,
      note_type,
      visibility,
      message_text,
      created_at,
      updated_at
    )
    SELECT
      a.id as application_id,
      (
        SELECT m.user_id
        FROM companies c
        JOIN memberships m ON m.organization_id = c.identity_organization_id
        WHERE c.id = j.company_id
          AND m.role = 'company_admin'
          AND m.deleted_at IS NULL
        LIMIT 1
      ) as created_by_user_id,
      'company_admin' as created_by_type,
      'general' as note_type,
      'company_only' as visibility,
      a.internal_notes as message_text,
      a.updated_at as created_at,
      a.updated_at as updated_at
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.internal_notes IS NOT NULL
      AND a.internal_notes != ''
      AND NOT EXISTS (
        SELECT 1 FROM application_notes an
        WHERE an.application_id = a.id
          AND an.message_text = a.internal_notes
      );
  END IF;
END $$;

-- Step 15: Drop old note columns from applications table (if they exist)
ALTER TABLE public.applications DROP COLUMN IF EXISTS notes;
ALTER TABLE public.applications DROP COLUMN IF EXISTS recruiter_notes;
ALTER TABLE public.applications DROP COLUMN IF EXISTS candidate_notes;
ALTER TABLE public.applications DROP COLUMN IF EXISTS internal_notes;
