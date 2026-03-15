-- =============================================================================
-- Call Scheduling Fields, Tags, Follow-up Tracking, Expanded Statuses
-- Phase 44-01: Foundation schema for recruiter-company call lifecycle
-- =============================================================================

-- =============================================================================
-- 1. Expand call_status enum with missed and no_show
-- NOTE: ALTER TYPE ADD VALUE cannot run inside a transaction block
-- =============================================================================
ALTER TYPE call_status ADD VALUE IF NOT EXISTS 'missed';
ALTER TYPE call_status ADD VALUE IF NOT EXISTS 'no_show';

-- =============================================================================
-- 2. Add scheduling columns to calls table (transactional from here)
-- =============================================================================
ALTER TABLE calls
    ADD COLUMN agenda TEXT,
    ADD COLUMN duration_minutes_planned INT,
    ADD COLUMN pre_call_notes TEXT,
    ADD COLUMN needs_follow_up BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN cancelled_by UUID REFERENCES users(id),
    ADD COLUMN cancel_reason TEXT;

-- Index for follow-up queries
CREATE INDEX idx_calls_needs_follow_up ON calls(needs_follow_up)
    WHERE needs_follow_up = true;

-- =============================================================================
-- 3. Call Tags lookup table
-- =============================================================================
CREATE TABLE call_tags (
    slug TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO call_tags (slug, label) VALUES
    ('intro', 'Introduction'),
    ('check-in', 'Check-in'),
    ('negotiation', 'Negotiation'),
    ('follow-up', 'Follow-up'),
    ('onboarding', 'Onboarding'),
    ('review', 'Review');

-- =============================================================================
-- 4. Call Tag Links junction table
-- =============================================================================
CREATE TABLE call_tag_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    tag_slug TEXT NOT NULL REFERENCES call_tags(slug) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_call_tag_link UNIQUE (call_id, tag_slug)
);

CREATE INDEX idx_call_tag_links_call ON call_tag_links(call_id);

-- =============================================================================
-- 5. Row Level Security
-- =============================================================================

-- call_tags: readable by all authenticated users (lookup table)
ALTER TABLE call_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_tags_select" ON call_tags
    FOR SELECT USING (auth.role() = 'authenticated');

-- call_tag_links: participant-based access (same pattern as calls)
ALTER TABLE call_tag_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_tag_links_select" ON call_tag_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_tag_links.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_tag_links_insert" ON call_tag_links
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_tag_links.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_tag_links_delete" ON call_tag_links
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_tag_links.call_id
              AND cp.user_id = auth.uid()
        )
    );

-- End of migration
