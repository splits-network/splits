-- Rename firm marketplace toggles to clearer names
-- seeking_split_partners → candidate_firm
-- accepts_candidate_submissions → company_firm

-- Add new columns with data from old ones
ALTER TABLE firms ADD COLUMN candidate_firm BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE firms ADD COLUMN company_firm BOOLEAN NOT NULL DEFAULT false;

-- Copy existing data
UPDATE firms SET candidate_firm = seeking_split_partners;
UPDATE firms SET company_firm = accepts_candidate_submissions;

-- Drop old columns
ALTER TABLE firms DROP COLUMN seeking_split_partners;
ALTER TABLE firms DROP COLUMN accepts_candidate_submissions;
