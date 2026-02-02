-- Add profile image support to users table
-- Migration: 20260201000001_add_profile_image_support

-- Add 'profile_image' to document_type enum
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'profile_image';

-- Add 'profile_image' to entity_type enum
ALTER TYPE public.entity_type ADD VALUE IF NOT EXISTS 'profile_image';

-- Add profile image fields to users table
ALTER TABLE public.users 
ADD COLUMN profile_image_url TEXT,
ADD COLUMN profile_image_path TEXT; -- Storage path for deletion/management

-- Update the updated_at trigger to handle new columns
-- (trigger already exists from baseline migration)

-- Create profile-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images', 
  'profile-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for profile images storage
-- Users can upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Profile images are publicly viewable
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Users can update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own profile images  
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add comment for clarity
COMMENT ON COLUMN public.users.profile_image_url IS 'Public URL for user profile image stored in Supabase Storage';
COMMENT ON COLUMN public.users.profile_image_path IS 'Storage path for profile image management and deletion';