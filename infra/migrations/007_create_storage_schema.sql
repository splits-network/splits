-- Migration: Create documents schema for document management
-- Service: document-service
-- Date: 2024-12-14

-- Create documents schema (use 'documents' instead of 'storage' which is reserved by Supabase)
CREATE SCHEMA IF NOT EXISTS documents;

-- Grant usage to service_role
GRANT USAGE ON SCHEMA documents TO service_role;

-- Create entity_type enum
CREATE TYPE entity_type AS ENUM (
    'candidate',
    'job',
    'application',
    'company',
    'placement',
    'contract',
    'invoice'
);

-- Create document_type enum
CREATE TYPE document_type AS ENUM (
    'resume',
    'cover_letter',
    'job_description',
    'company_document',
    'contract',
    'invoice',
    'receipt',
    'agreement',
    'other'
);

-- Create processing_status enum
CREATE TYPE processing_status AS ENUM (
    'pending',
    'processing',
    'processed',
    'failed'
);

-- Create documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type entity_type NOT NULL,
    entity_id UUID NOT NULL,
    document_type document_type NOT NULL,
    filename VARCHAR(500) NOT NULL,
    storage_path TEXT NOT NULL,
    bucket_name VARCHAR(100) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by_user_id UUID,
    processing_status processing_status DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create indexes for common queries
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_type ON documents(document_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_uploader ON documents(uploaded_by_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_created ON documents(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_processing ON documents(processing_status) WHERE deleted_at IS NULL;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON documents TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA documents TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA documents TO service_role;

-- Add RLS policies (optional for now, can enable later)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything
CREATE POLICY service_role_all ON documents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE documents IS 'Universal document storage metadata for all entities';
COMMENT ON COLUMN entity_type IS 'Type of entity this document is attached to';
COMMENT ON COLUMN entity_id IS 'UUID of the entity (candidate_id, job_id, etc.)';
COMMENT ON COLUMN document_type IS 'Category of document (resume, contract, etc.)';
COMMENT ON COLUMN storage_path IS 'Full path in Supabase Storage bucket';
COMMENT ON COLUMN bucket_name IS 'Supabase Storage bucket name';
COMMENT ON COLUMN processing_status IS 'Document processing status for text extraction, etc.';
COMMENT ON COLUMN metadata IS 'Extracted metadata, tags, and processing results';
