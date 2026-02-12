-- Migration: Deprecate memberships table
-- The user_roles table is now the single source of truth for all role assignments.
-- Renaming rather than dropping provides a safety net during the launch period.
-- This table can be fully dropped after a 30-day verification period.

-- Step 1: Rename the table to indicate deprecation
ALTER TABLE IF EXISTS public.memberships RENAME TO _deprecated_memberships;

-- Step 2: Add a comment explaining the deprecation
COMMENT ON TABLE public._deprecated_memberships IS 'DEPRECATED 2026-02-11: Replaced by user_roles table. Data preserved for rollback safety. Safe to drop after 2026-03-11.';
