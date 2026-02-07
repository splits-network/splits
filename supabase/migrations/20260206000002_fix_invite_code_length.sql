-- Migration: Fix invite_code column length
-- The invite code format "SPLITS-XXXXXX" is 13 characters, not 12

ALTER TABLE recruiter_company_invitations
    ALTER COLUMN invite_code TYPE VARCHAR(13);
