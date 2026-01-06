-- Migration: Fix recruiter_id FK constraints to point to recruiters.id
-- Date: 2025-12-20
-- Description: Corrects the FK constraints for recruiter_id fields to reference
--              recruiters.id instead of users.id

-- ============================================================================
-- PART 1: Fix applications.recruiter_id
-- ============================================================================

-- Step 1: Drop the incorrect FK constraint
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_recruiter_id_fkey;

-- Step 2: Migrate existing data from user_id to recruiter_id
-- This updates all applications that have a recruiter_id (which was user_id)
-- to use the corresponding recruiter_id from recruiters
UPDATE applications a
SET recruiter_id = r.id
FROM users u
JOIN recruiters r ON u.id = r.user_id
WHERE a.recruiter_id = u.id;

-- Step 3: Add the correct FK constraint
ALTER TABLE applications 
ADD CONSTRAINT applications_recruiter_id_fkey 
FOREIGN KEY (recruiter_id) REFERENCES recruiters(id);

-- ============================================================================
-- PART 2: Fix placements.recruiter_id
-- ============================================================================

-- Step 1: Drop the incorrect FK constraint
ALTER TABLE placements 
DROP CONSTRAINT IF EXISTS placements_recruiter_id_fkey;

-- Step 2: Migrate existing data (if any)
UPDATE placements p
SET recruiter_id = r.id
FROM users u
JOIN recruiters r ON u.id = r.user_id
WHERE p.recruiter_id = u.id;

-- Step 3: Add the correct FK constraint
ALTER TABLE placements 
ADD CONSTRAINT placements_recruiter_id_fkey 
FOREIGN KEY (recruiter_id) REFERENCES recruiters(id);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify applications now reference recruiters correctly
SELECT 
    a.id,
    a.recruiter_id,
    r.id as recruiter_match,
    r.user_id,
    u.email
FROM applications a
JOIN recruiters r ON a.recruiter_id = r.id
JOIN users u ON r.user_id = u.id
WHERE a.recruiter_id IS NOT NULL
LIMIT 5;

-- Verify FK constraints are correct
SELECT 
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'ats'
    AND kcu.column_name = 'recruiter_id';
