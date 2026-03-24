-- ============================================================
-- v13.0 Content System Enhancement: Schema Phase
-- Adds page_type enum column, content_tags lookup table,
-- content_page_tags junction table, migrates category data,
-- and drops the legacy category column.
-- Covers SCHEMA-01 through SCHEMA-04.
-- ============================================================

-- ============================================================
-- Section 1: Add page_type column to content_pages
-- ============================================================

ALTER TABLE content_pages
    ADD COLUMN page_type TEXT NOT NULL DEFAULT 'page';

ALTER TABLE content_pages
    ADD CONSTRAINT content_pages_page_type_check
    CHECK (page_type IN ('blog', 'article', 'help', 'partner', 'press', 'legal', 'page'));

-- Index for filtering by page_type (e.g. listing all blog posts)
CREATE INDEX idx_content_pages_page_type ON content_pages(page_type) WHERE deleted_at IS NULL;

-- Composite index for app + page_type on published pages (most common query pattern)
CREATE INDEX idx_content_pages_app_page_type ON content_pages(app, page_type)
    WHERE deleted_at IS NULL AND status = 'published';

-- ============================================================
-- Section 2: Create content_tags lookup table
-- ============================================================

-- Content tags lookup table (mirrors perks/culture_tags pattern from v7.0)
CREATE TABLE content_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_tags_slug ON content_tags(slug);
-- Trigram index for typeahead search (pg_trgm already enabled)
CREATE INDEX idx_content_tags_name_trgm ON content_tags USING gin(name gin_trgm_ops);

-- ============================================================
-- Section 3: Create content_page_tags junction table
-- ============================================================

CREATE TABLE content_page_tags (
    page_id UUID NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (page_id, tag_id)
);

CREATE INDEX idx_content_page_tags_page ON content_page_tags(page_id);
CREATE INDEX idx_content_page_tags_tag ON content_page_tags(tag_id);

-- ============================================================
-- Section 4: Migrate category data to page_type, then drop category
-- ============================================================

DO $$
BEGIN
    -- Map existing category values to the new page_type enum values
    -- Uses LOWER(TRIM(category)) for case-insensitive, whitespace-tolerant matching

    -- Blog variants
    UPDATE content_pages
    SET page_type = 'blog'
    WHERE LOWER(TRIM(category)) IN ('blog', 'blog post', 'blog-post');

    -- Article variants
    UPDATE content_pages
    SET page_type = 'article'
    WHERE LOWER(TRIM(category)) IN ('article', 'articles');

    -- Help / FAQ variants
    UPDATE content_pages
    SET page_type = 'help'
    WHERE LOWER(TRIM(category)) IN ('help', 'help center', 'faq');

    -- Partner variants
    UPDATE content_pages
    SET page_type = 'partner'
    WHERE LOWER(TRIM(category)) IN ('partner', 'partners', 'partner spotlight');

    -- Press / News variants
    UPDATE content_pages
    SET page_type = 'press'
    WHERE LOWER(TRIM(category)) IN ('press', 'press release', 'news');

    -- Legal variants
    UPDATE content_pages
    SET page_type = 'legal'
    WHERE LOWER(TRIM(category)) IN ('legal', 'terms', 'privacy');

    -- Everything else (including NULL) stays as the DEFAULT 'page' value
END $$;

-- Drop the legacy category column and its index now that data is migrated
DROP INDEX IF EXISTS idx_content_pages_category;
ALTER TABLE content_pages DROP COLUMN category;

-- ============================================================
-- Section 5: Row Level Security
-- ============================================================

ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_page_tags ENABLE ROW LEVEL SECURITY;

-- Content tags: authenticated users can read, anyone authenticated can insert new tags
CREATE POLICY "content_tags_select" ON content_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "content_tags_insert" ON content_tags FOR INSERT TO authenticated WITH CHECK (true);

-- Service role bypass for content tags (backend services use service_role key)
CREATE POLICY "content_tags_service_role" ON content_tags FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Content page tags: authenticated users can manage all junction rows
CREATE POLICY "content_page_tags_select" ON content_page_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "content_page_tags_insert" ON content_page_tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "content_page_tags_update" ON content_page_tags FOR UPDATE TO authenticated USING (true);
CREATE POLICY "content_page_tags_delete" ON content_page_tags FOR DELETE TO authenticated USING (true);

-- Service role bypass for content page tags
CREATE POLICY "content_page_tags_service_role" ON content_page_tags FOR ALL TO service_role USING (true) WITH CHECK (true);
