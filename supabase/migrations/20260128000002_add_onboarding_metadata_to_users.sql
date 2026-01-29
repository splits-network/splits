-- Add onboarding_metadata JSONB field to users table for state persistence
-- This allows users to continue onboarding across devices and browser sessions
-- Migration: Add onboarding_metadata to users table

-- Add the onboarding_metadata JSONB column with default empty object
ALTER TABLE users
ADD COLUMN onboarding_metadata JSONB DEFAULT '{}';

-- Create GIN index for efficient queries on onboarding status and analytics
-- This enables fast lookups for support queries and onboarding completion tracking
CREATE INDEX idx_users_onboarding_metadata
ON users USING GIN (onboarding_metadata);

-- Add comment for clarity on the column purpose
COMMENT ON COLUMN users.onboarding_metadata 
IS 'JSONB field storing onboarding progress, step data, and user selections for cross-device persistence. Contains status, currentStep, selectedRole, completedSteps, selectedPlan, stripePaymentInfo, recruiterData, companyData, and metadata.';

-- Update existing users to have empty onboarding_metadata (already default, but explicit for clarity)
-- This ensures all existing users start with a clean onboarding state
UPDATE users 
SET onboarding_metadata = '{}' 
WHERE onboarding_metadata IS NULL;