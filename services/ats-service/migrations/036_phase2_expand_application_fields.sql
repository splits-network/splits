-- Migration: Add Phase 2 application fields for enhanced lifecycle tracking
-- Phase 2 of consolidating application flow

-- Add new fields for enhanced application lifecycle
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS cover_letter TEXT,
ADD COLUMN IF NOT EXISTS salary INTEGER,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS hired_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS placement_id UUID;

-- Add comments for new fields
COMMENT ON COLUMN public.applications.internal_notes IS 'Internal company notes about the application';
COMMENT ON COLUMN public.applications.cover_letter IS 'Candidate cover letter for the application';
COMMENT ON COLUMN public.applications.salary IS 'Candidate requested salary (in dollars)';
COMMENT ON COLUMN public.applications.submitted_at IS 'When application was submitted to company';
COMMENT ON COLUMN public.applications.hired_at IS 'When candidate was hired (terminal state)';
COMMENT ON COLUMN public.applications.placement_id IS 'Reference to placement record when hired';

-- Create index for placement_id foreign key
CREATE INDEX IF NOT EXISTS idx_applications_placement_id ON public.applications(placement_id);

-- Create index for stage filtering (performance optimization)
CREATE INDEX IF NOT EXISTS idx_applications_stage ON public.applications(stage);

-- Create index for submitted_at filtering
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON public.applications(submitted_at);

-- Create index for hired_at filtering  
CREATE INDEX IF NOT EXISTS idx_applications_hired_at ON public.applications(hired_at);