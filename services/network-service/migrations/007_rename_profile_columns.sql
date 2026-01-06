-- Migration: Rename Profile Columns
-- Description: Remove 'marketplace_' prefix from core recruiter profile fields
-- Created: 2025-12-21
--
-- These fields (industries, specialties, location, tagline, years_experience)
-- are core recruiter profile attributes, not marketplace-specific.
-- They should be populated by all recruiters regardless of marketplace participation.

-- ============================================================================
-- 1. Rename Core Profile Columns
-- ============================================================================

ALTER TABLE recruiters
    RENAME COLUMN marketplace_industries TO industries;

ALTER TABLE recruiters
    RENAME COLUMN marketplace_specialties TO specialties;

ALTER TABLE recruiters
    RENAME COLUMN marketplace_location TO location;

ALTER TABLE recruiters
    RENAME COLUMN marketplace_tagline TO tagline;

ALTER TABLE recruiters
    RENAME COLUMN marketplace_years_experience TO years_experience;

-- Update column comments
COMMENT ON COLUMN recruiters.industries IS 'Industries the recruiter specializes in';
COMMENT ON COLUMN recruiters.specialties IS 'Job types/roles the recruiter specializes in';
COMMENT ON COLUMN recruiters.location IS 'Recruiter location';
COMMENT ON COLUMN recruiters.tagline IS 'Short professional tagline/headline';
COMMENT ON COLUMN recruiters.years_experience IS 'Years of recruiting experience';

-- ============================================================================
-- 2. Update Indexes (if any exist)
-- ============================================================================

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_recruiters_marketplace_industries;
DROP INDEX IF EXISTS idx_recruiters_marketplace_specialties;
DROP INDEX IF EXISTS idx_recruiters_marketplace_location;

-- Create new indexes for filtering/searching
CREATE INDEX IF NOT EXISTS idx_recruiters_industries ON recruiters USING gin(industries);
CREATE INDEX IF NOT EXISTS idx_recruiters_specialties ON recruiters USING gin(specialties);
CREATE INDEX IF NOT EXISTS idx_recruiters_location ON recruiters(location);

-- ============================================================================
-- Notes:
-- ============================================================================
-- Fields that remain with 'marketplace_' prefix (correctly so):
-- - marketplace_enabled: Whether recruiter has opted into the marketplace
-- - marketplace_visibility: Marketplace-specific visibility setting
-- - marketplace_profile: Additional marketplace-only profile data (JSONB)
-- - show_success_metrics: Marketplace privacy setting
-- - show_contact_info: Marketplace privacy setting
