-- Add 'profile_image' to document enums
-- Migration: 20260201000002_add_profile_image_document_type

-- Add the new enum values if they don't exist
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'profile_image';
ALTER TYPE public.entity_type ADD VALUE IF NOT EXISTS 'profile_image';
