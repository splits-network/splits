-- Rollback for Migration 001: Create Placement Snapshot
-- Purpose: Remove placement_snapshot table
-- Author: GitHub Copilot
-- Date: 2026-01-16

BEGIN;

-- Drop table (CASCADE removes all indexes, constraints, policies)
DROP TABLE IF EXISTS placement_snapshot CASCADE;

COMMIT;
