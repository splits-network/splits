-- Migration: Add application_feedback table and new application stages
-- Purpose: Support AI review loop feedback and recruiter-candidate communication
-- Date: 2026-01-15

-- Add new stages to application_stage enum
ALTER TYPE application_stage ADD VALUE IF NOT EXISTS 'ai_reviewed';
ALTER TYPE application_stage ADD VALUE IF NOT EXISTS 'recruiter_request';
ALTER TYPE application_stage ADD VALUE IF NOT EXISTS 'recruiter_proposed';

-- Create application_feedback table for pre-submission communication
CREATE TABLE IF NOT EXISTS application_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    
    -- Who created this message
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    created_by_type TEXT NOT NULL CHECK (created_by_type IN (
        'candidate',
        'candidate_recruiter',
        'platform_admin'
    )),
    
    -- What type of communication
    feedback_type TEXT NOT NULL CHECK (feedback_type IN (
        'info_request',         -- Someone requested more info
        'info_response',        -- Response to info request
        'note',                 -- General comment/guidance
        'improvement_request'   -- Specific change requested
    )),
    
    -- The message
    message_text TEXT NOT NULL,
    
    -- Thread reference (which message is this responding to?)
    in_response_to_id UUID REFERENCES application_feedback(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_feedback_application 
    ON application_feedback(application_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_app_feedback_thread 
    ON application_feedback(in_response_to_id) 
    WHERE in_response_to_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_app_feedback_created_by 
    ON application_feedback(created_by_user_id);

-- Add updated_at trigger
CREATE TRIGGER update_application_feedback_updated_at
    BEFORE UPDATE ON application_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE application_feedback ENABLE ROW LEVEL SECURITY;

-- Candidates can view feedback on their applications
CREATE POLICY application_feedback_candidate_view ON application_feedback
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM applications a
            JOIN candidates c ON a.candidate_id = c.id
            WHERE a.id = application_feedback.application_id
            AND c.user_id = auth.uid()
        )
    );

-- Candidate recruiters can view feedback on their candidates' applications
CREATE POLICY application_feedback_recruiter_view ON application_feedback
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM applications a
            JOIN candidates c ON a.candidate_id = c.id
            JOIN recruiter_candidates rc ON c.id = rc.candidate_id
            JOIN recruiters r ON rc.recruiter_id = r.id
            WHERE a.id = application_feedback.application_id
            AND r.user_id = auth.uid()
            AND rc.status = 'active'
        )
    );

-- Platform admins can view all feedback
CREATE POLICY application_feedback_admin_view ON application_feedback
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.user_id = auth.uid()
            AND m.role = 'platform_admin'
        )
    );

-- Candidates can create feedback on their applications
CREATE POLICY application_feedback_candidate_create ON application_feedback
    FOR INSERT
    WITH CHECK (
        created_by_type = 'candidate'
        AND EXISTS (
            SELECT 1 FROM applications a
            JOIN candidates c ON a.candidate_id = c.id
            WHERE a.id = application_feedback.application_id
            AND c.user_id = auth.uid()
        )
    );

-- Candidate recruiters can create feedback on their candidates' applications
CREATE POLICY application_feedback_recruiter_create ON application_feedback
    FOR INSERT
    WITH CHECK (
        created_by_type = 'candidate_recruiter'
        AND EXISTS (
            SELECT 1 FROM applications a
            JOIN candidates c ON a.candidate_id = c.id
            JOIN recruiter_candidates rc ON c.id = rc.candidate_id
            JOIN recruiters r ON rc.recruiter_id = r.id
            WHERE a.id = application_feedback.application_id
            AND r.user_id = auth.uid()
            AND rc.status = 'active'
        )
    );

-- Platform admins can create feedback
CREATE POLICY application_feedback_admin_create ON application_feedback
    FOR INSERT
    WITH CHECK (
        created_by_type = 'platform_admin'
        AND EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.user_id = auth.uid()
            AND m.role = 'platform_admin'
        )
    );

-- Add comment for documentation
COMMENT ON TABLE application_feedback IS 'Stores communication between candidates, recruiters, and admins during application preparation (pre-submission phase)';
COMMENT ON COLUMN application_feedback.feedback_type IS 'Type of feedback: info_request, info_response, note, or improvement_request';
COMMENT ON COLUMN application_feedback.in_response_to_id IS 'Reference to parent message for threading conversations';
