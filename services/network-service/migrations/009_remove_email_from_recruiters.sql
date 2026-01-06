-- Migration: Remove Email from Recruiters Table
-- Description: Email is already on users table, remove from recruiters
-- Created: 2026-01-04

-- ============================================================================
-- Remove Email from Recruiters Table
-- ============================================================================

ALTER TABLE recruiters
    DROP COLUMN IF EXISTS email;
