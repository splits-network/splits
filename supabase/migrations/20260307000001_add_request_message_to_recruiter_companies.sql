-- Add request_message and terms acknowledgment columns to recruiter_companies
-- Persists the recruiter's personal message and proof they understood the terms
-- when requesting to represent a company.

ALTER TABLE recruiter_companies
ADD COLUMN request_message TEXT,
ADD COLUMN terms_acknowledged_at TIMESTAMPTZ,
ADD COLUMN terms_acknowledged_by UUID REFERENCES users(id);

COMMENT ON COLUMN recruiter_companies.request_message IS 'Personal note from the recruiter when requesting to represent a company';
COMMENT ON COLUMN recruiter_companies.terms_acknowledged_at IS 'When the requesting party acknowledged the representation terms';
COMMENT ON COLUMN recruiter_companies.terms_acknowledged_by IS 'Internal users.id of the person who acknowledged the terms';
