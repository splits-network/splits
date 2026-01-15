-- Add AI review tracking columns to applications table
-- Migration: 027 - Add ai_review_id, ai_reviewed_at, and ready_to_submit_at columns
-- Purpose: Enable candidate review of AI feedback before submission

-- Add ai_review_id column (foreign key to ai_reviews table)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS ai_review_id uuid,
ADD CONSTRAINT fk_applications_ai_review FOREIGN KEY (ai_review_id) REFERENCES public.ai_reviews(id) ON DELETE SET NULL;

-- Add ai_reviewed_at column (timestamp when AI review was completed)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS ai_reviewed_at timestamptz;

-- Add ready_to_submit_at column (timestamp when candidate marks application ready to submit)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS ready_to_submit_at timestamptz;

-- Create index on ai_review_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_ai_review_id ON public.applications(ai_review_id);

-- Create index on stage for filtering ai_reviewed applications
CREATE INDEX IF NOT EXISTS idx_applications_stage ON public.applications(stage);

-- Add comment explaining the purpose of these columns
COMMENT ON COLUMN public.applications.ai_review_id IS 'Reference to the AI review for this application (from ai_reviews table)';
COMMENT ON COLUMN public.applications.ai_reviewed_at IS 'Timestamp when AI review was completed and candidate can review feedback';
COMMENT ON COLUMN public.applications.ready_to_submit_at IS 'Timestamp when candidate manually marked application as ready to submit (after AI review)';
