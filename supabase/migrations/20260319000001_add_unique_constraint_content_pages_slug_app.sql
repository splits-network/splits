-- Add unique constraint on content_pages(slug, app) to prevent duplicate records
-- that cause PGRST116 errors when querying with .maybeSingle()

-- Step 1: Deduplicate existing records — keep the most recently updated row per (slug, app)
DELETE FROM content_pages
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY slug, app ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST) AS rn
        FROM content_pages
        WHERE deleted_at IS NULL
    ) ranked
    WHERE rn > 1
);

-- Step 2: Add unique constraint (only on non-deleted rows via partial index)
CREATE UNIQUE INDEX IF NOT EXISTS content_pages_slug_app_unique
    ON content_pages (slug, app)
    WHERE deleted_at IS NULL;
