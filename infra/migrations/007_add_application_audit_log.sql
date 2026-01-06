-- Migration 007: Add Application Audit Log
-- This migration creates a comprehensive audit trail for all application actions
-- including acceptance, rejection, stage changes, and views.

-- Create audit log table for tracking application acceptance and other actions
CREATE TABLE IF NOT EXISTS application_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'accepted', 'rejected', 'stage_changed', 'viewed', 'created'
    performed_by_user_id UUID, -- Identity service user ID
    performed_by_role TEXT, -- company_admin, hiring_manager, recruiter, etc.
    company_id UUID, -- For tracking which company performed the action
    old_value JSONB, -- Previous state (if applicable)
    new_value JSONB, -- New state (if applicable)
    metadata JSONB, -- Additional context
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_application_id ON application_audit_log(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON application_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON application_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_company_id ON application_audit_log(company_id) WHERE company_id IS NOT NULL;

-- Add comments
COMMENT ON TABLE application_audit_log IS 
'Audit trail for all actions performed on applications, including acceptance, rejection, and stage changes. 
Provides compliance and security tracking for sensitive candidate data access.';

COMMENT ON COLUMN application_audit_log.action IS 
'Type of action: created, accepted, rejected, stage_changed, viewed, etc.';

COMMENT ON COLUMN application_audit_log.performed_by_user_id IS 
'User ID from identity service who performed the action';

COMMENT ON COLUMN application_audit_log.performed_by_role IS 
'Role of the user who performed the action (company_admin, hiring_manager, recruiter, platform_admin)';

COMMENT ON COLUMN application_audit_log.company_id IS 
'Company ID associated with the action (for company-side actions)';

COMMENT ON COLUMN application_audit_log.old_value IS 
'Previous state before the action (for updates/changes)';

COMMENT ON COLUMN application_audit_log.new_value IS 
'New state after the action (for updates/changes)';

COMMENT ON COLUMN application_audit_log.metadata IS 
'Additional context like candidate_id, job_id, recruiter_id, notes, etc.';

COMMENT ON COLUMN application_audit_log.ip_address IS 
'IP address of the user who performed the action (for security tracking)';

COMMENT ON COLUMN application_audit_log.user_agent IS 
'User agent string of the client (browser/app) that performed the action';
