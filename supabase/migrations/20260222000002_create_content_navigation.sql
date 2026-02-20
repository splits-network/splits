-- Content Navigation table for CMS-managed header/footer links
-- Stores navigation config as JSONB per app + location
-- 6 rows total: 3 apps (portal, candidate, corporate) x 2 locations (header, footer)

CREATE TABLE content_navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app TEXT NOT NULL CHECK (app IN ('portal', 'candidate', 'corporate')),
  location TEXT NOT NULL CHECK (location IN ('header', 'footer')),
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(app, location)
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_content_navigation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_content_navigation_updated_at
  BEFORE UPDATE ON content_navigation
  FOR EACH ROW
  EXECUTE FUNCTION update_content_navigation_updated_at();
