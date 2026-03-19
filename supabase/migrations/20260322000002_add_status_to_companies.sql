-- Add status column to companies table for active/inactive tracking
-- Column and constraint may already exist from manual application; use IF NOT EXISTS / DO blocks.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'companies_status_check'
  ) THEN
    ALTER TABLE companies ADD CONSTRAINT companies_status_check CHECK (status IN ('active', 'inactive'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_companies_status ON companies (status);

-- Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
