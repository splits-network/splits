-- Create search schema for unified search infrastructure
-- Part of Phase 01 - Search Infrastructure (Plan 01)

-- Create search schema
CREATE SCHEMA IF NOT EXISTS search;

-- Create unified search_index table for global search
CREATE TABLE IF NOT EXISTS search.search_index (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    title text NOT NULL DEFAULT '',
    subtitle text NOT NULL DEFAULT '',
    context text NOT NULL DEFAULT '',
    search_vector tsvector,
    metadata jsonb NOT NULL DEFAULT '{}',
    organization_id uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT search_index_entity_unique UNIQUE (entity_type, entity_id)
);

-- Add table comment for documentation
COMMENT ON TABLE search.search_index IS 'Unified search index for global search. Synced from entity tables via triggers. entity_type: candidate, job, company, recruiter, application, placement, recruiter_candidate';

-- Create GIN index on search_vector for full-text search performance
CREATE INDEX search_index_search_vector_idx
    ON search.search_index USING GIN (search_vector);

-- Create supporting indexes for filtering
CREATE INDEX search_index_entity_type_idx
    ON search.search_index (entity_type);

CREATE INDEX search_index_organization_id_idx
    ON search.search_index (organization_id);

CREATE INDEX search_index_updated_at_idx
    ON search.search_index (updated_at DESC);

-- Grant permissions following existing patterns
GRANT USAGE ON SCHEMA search TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA search TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA search GRANT ALL ON TABLES TO anon, authenticated, service_role;
