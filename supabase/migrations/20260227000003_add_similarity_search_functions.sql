-- RPC function: find candidates most similar to a job's embedding
CREATE OR REPLACE FUNCTION search.find_similar_candidates(
    p_job_embedding vector(1536),
    p_limit int DEFAULT 50
)
RETURNS TABLE (entity_id uuid, similarity float8) AS $$
    SELECT si.entity_id, 1 - (si.embedding <=> p_job_embedding) AS similarity
    FROM search.search_index si
    WHERE si.entity_type = 'candidate'
      AND si.embedding IS NOT NULL
    ORDER BY si.embedding <=> p_job_embedding
    LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- RPC function: find jobs most similar to a candidate's embedding
CREATE OR REPLACE FUNCTION search.find_similar_jobs(
    p_candidate_embedding vector(1536),
    p_limit int DEFAULT 50
)
RETURNS TABLE (entity_id uuid, similarity float8) AS $$
    SELECT si.entity_id, 1 - (si.embedding <=> p_candidate_embedding) AS similarity
    FROM search.search_index si
    WHERE si.entity_type = 'job'
      AND si.embedding IS NOT NULL
    ORDER BY si.embedding <=> p_candidate_embedding
    LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- RPC function: update embedding for a search index entity
CREATE OR REPLACE FUNCTION public.update_search_embedding(
    p_entity_type text,
    p_entity_id uuid,
    p_embedding vector(1536)
)
RETURNS void AS $$
    UPDATE search.search_index
    SET embedding = p_embedding
    WHERE entity_type = p_entity_type
      AND entity_id = p_entity_id;
$$ LANGUAGE sql VOLATILE;

-- Grant execute to service_role only (internal use by matching-service)
GRANT EXECUTE ON FUNCTION search.find_similar_candidates TO service_role;
GRANT EXECUTE ON FUNCTION search.find_similar_jobs TO service_role;
GRANT EXECUTE ON FUNCTION public.update_search_embedding TO service_role;
