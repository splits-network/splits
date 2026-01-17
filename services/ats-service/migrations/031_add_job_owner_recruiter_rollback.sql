-- Rollback for Migration 031: Add Job Owner Recruiter
-- Purpose: Remove job_owner_recruiter_id from jobs table
-- Author: GitHub Copilot
-- Date: 2026-01-16

BEGIN;

-- Step 1: Drop index
DROP INDEX IF EXISTS idx_jobs_owner_recruiter;

-- Step 2: Drop column
ALTER TABLE jobs 
DROP COLUMN IF EXISTS job_owner_recruiter_id;

COMMIT;
