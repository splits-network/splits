-- Content Pages table for the CMS system
-- Stores structured page content as composable JSON blocks
-- Serves portal, candidate, and corporate apps

CREATE TABLE content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  app TEXT NOT NULL CHECK (app IN ('portal', 'candidate', 'corporate')),
  title TEXT NOT NULL,
  description TEXT,
  og_image TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  author TEXT,
  read_time TEXT,
  blocks JSONB NOT NULL DEFAULT '[]',
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(slug, app)
);

-- Public lookups by app + slug (most common query)
CREATE INDEX idx_content_pages_app_slug ON content_pages(app, slug) WHERE deleted_at IS NULL;

-- List pages by app + status
CREATE INDEX idx_content_pages_app_status ON content_pages(app, status) WHERE deleted_at IS NULL;

-- Filter published pages by category
CREATE INDEX idx_content_pages_category ON content_pages(app, category) WHERE deleted_at IS NULL AND status = 'published';

-- Order published pages by date
CREATE INDEX idx_content_pages_published_at ON content_pages(published_at DESC) WHERE deleted_at IS NULL AND status = 'published';

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_content_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_content_pages_updated_at
  BEFORE UPDATE ON content_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_content_pages_updated_at();
