-- Content Images table for CMS image asset management
-- Stores metadata for images uploaded to the content-images storage bucket

CREATE TABLE content_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  mime_type TEXT NOT NULL CHECK (mime_type IN (
    'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'
  )),
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  tags TEXT[] DEFAULT '{}',
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Filter by tags
CREATE INDEX idx_content_images_tags
  ON content_images USING gin (tags)
  WHERE deleted_at IS NULL;

-- List images ordered by upload date
CREATE INDEX idx_content_images_created_at
  ON content_images (created_at DESC)
  WHERE deleted_at IS NULL;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_content_images_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_content_images_updated_at
  BEFORE UPDATE ON content_images
  FOR EACH ROW
  EXECUTE FUNCTION update_content_images_updated_at();

-- Create the content-images storage bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to content-images bucket
CREATE POLICY "Public read access for content images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-images');

-- Allow authenticated uploads to content-images bucket
CREATE POLICY "Authenticated upload for content images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'content-images');

-- Allow authenticated deletes from content-images bucket
CREATE POLICY "Authenticated delete for content images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'content-images');
