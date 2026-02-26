-- Add dedicated column for AI-extracted structured resume metadata.
-- Keeps it separate from the processing/extraction metadata in the existing metadata JSONB field.

ALTER TABLE documents ADD COLUMN IF NOT EXISTS structured_metadata JSONB DEFAULT NULL;

COMMENT ON COLUMN documents.structured_metadata IS
    'AI-extracted structured data from document content (e.g., resume skills, experience, education). Separate from processing metadata.';

-- Migrate existing structured_data from metadata JSONB into the new column
UPDATE documents
SET structured_metadata = metadata->'structured_data',
    metadata = metadata - 'structured_data'
WHERE metadata->'structured_data' IS NOT NULL;