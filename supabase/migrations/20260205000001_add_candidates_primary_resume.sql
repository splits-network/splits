-- Add primary_resume_id to candidates table
-- This allows candidates to designate one resume as their primary/default resume

ALTER TABLE candidates 
ADD COLUMN primary_resume_id UUID REFERENCES documents(id);

-- Add index for performance
CREATE INDEX idx_candidates_primary_resume ON candidates(primary_resume_id);

-- Add constraint to ensure primary resume is a candidate's own resume document
ALTER TABLE candidates
ADD CONSTRAINT check_primary_resume_belongs_to_candidate 
CHECK (
    primary_resume_id IS NULL OR 
    (
        SELECT COUNT(*) 
        FROM documents 
        WHERE id = primary_resume_id 
        AND entity_type = 'candidate' 
        AND entity_id = candidates.id
        AND document_type = 'resume'
    ) = 1
);

-- Add comment
COMMENT ON COLUMN candidates.primary_resume_id IS 'Reference to primary resume document for this candidate (must be entity_type=candidate, document_type=resume, entity_id=this candidate)';