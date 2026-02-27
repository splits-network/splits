-- Enable pgvector extension for semantic similarity matching
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to the unified search index
ALTER TABLE search.search_index
    ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- HNSW index for cosine similarity (better for real-time incremental inserts)
CREATE INDEX IF NOT EXISTS search_index_embedding_hnsw
    ON search.search_index
    USING hnsw (embedding vector_cosine_ops);
