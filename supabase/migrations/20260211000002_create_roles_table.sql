-- Migration: Create roles table for centralized role definitions
-- Part of the roles/user_roles refactor to replace scattered role derivation logic

-- Step 1: Create the roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Add table comments
COMMENT ON TABLE public.roles IS 'Centralized role definitions with permissions. System roles cannot be deleted or renamed.';
COMMENT ON COLUMN public.roles.name IS 'Unique role identifier used as FK in user_roles: platform_admin, company_admin, hiring_manager, recruiter, candidate';
COMMENT ON COLUMN public.roles.permissions IS 'JSONB permission capabilities for this role. Used for future fine-grained access control.';
COMMENT ON COLUMN public.roles.is_system IS 'System roles (true) cannot be deleted or renamed. Custom roles (false) can be managed by admins.';

-- Step 3: Seed the 5 system roles with permissions
INSERT INTO public.roles (name, display_name, description, permissions, is_system) VALUES
(
    'platform_admin',
    'Platform Admin',
    'Manages the Splits Network platform. Full access to all data, user management, and system configuration.',
    '{
        "jobs": { "create": true, "read": true, "update": true, "delete": true },
        "applications": { "create": true, "read": true, "update_stage": true, "approve_reject": true },
        "candidates": { "read": true, "create": true, "view_contact_info": true },
        "placements": { "create": true, "read": true, "view_fees": true },
        "organization": { "manage_settings": true, "invite_members": true, "remove_members": true },
        "billing": { "manage_subscription": true, "view_earnings": true, "manage_plans": true },
        "analytics": { "platform_wide": true, "company_wide": true, "personal": true },
        "admin": { "manage_users": true, "manage_recruiters": true, "system_settings": true }
    }'::jsonb,
    true
),
(
    'company_admin',
    'Company Admin',
    'Full control over a hiring company: jobs, candidates, applications, placements, team management, and company settings.',
    '{
        "jobs": { "create": true, "read": true, "update": true, "delete": true },
        "applications": { "create": true, "read": true, "update_stage": true, "approve_reject": true },
        "candidates": { "read": true, "create": true, "view_contact_info": true },
        "placements": { "create": true, "read": true, "view_fees": true },
        "organization": { "manage_settings": true, "invite_members": true, "remove_members": true },
        "billing": { "manage_subscription": true, "view_earnings": false, "manage_plans": false },
        "analytics": { "platform_wide": false, "company_wide": true, "personal": true },
        "admin": { "manage_users": false, "manage_recruiters": false, "system_settings": false }
    }'::jsonb,
    true
),
(
    'hiring_manager',
    'Hiring Manager',
    'Collaborates on hiring within a company. Can review candidates and manage pipeline stages but cannot create jobs or manage team.',
    '{
        "jobs": { "create": false, "read": true, "update": false, "delete": false },
        "applications": { "create": false, "read": true, "update_stage": true, "approve_reject": true },
        "candidates": { "read": true, "create": false, "view_contact_info": true },
        "placements": { "create": false, "read": true, "view_fees": false },
        "organization": { "manage_settings": false, "invite_members": false, "remove_members": false },
        "billing": { "manage_subscription": false, "view_earnings": false, "manage_plans": false },
        "analytics": { "platform_wide": false, "company_wide": false, "personal": true },
        "admin": { "manage_users": false, "manage_recruiters": false, "system_settings": false }
    }'::jsonb,
    true
),
(
    'recruiter',
    'Recruiter',
    'Sources and submits candidates for open roles. Earns fees for successful placements. Marketplace access to all active jobs.',
    '{
        "jobs": { "create": false, "read": true, "update": false, "delete": false },
        "applications": { "create": true, "read": true, "update_stage": false, "approve_reject": false },
        "candidates": { "read": true, "create": true, "view_contact_info": true },
        "placements": { "create": false, "read": true, "view_fees": true },
        "organization": { "manage_settings": false, "invite_members": false, "remove_members": false },
        "billing": { "manage_subscription": true, "view_earnings": true, "manage_plans": false },
        "analytics": { "platform_wide": false, "company_wide": false, "personal": true },
        "admin": { "manage_users": false, "manage_recruiters": false, "system_settings": false }
    }'::jsonb,
    true
),
(
    'candidate',
    'Candidate',
    'Job seeker with a user account. Can view their own applications and manage their profile.',
    '{
        "jobs": { "create": false, "read": true, "update": false, "delete": false },
        "applications": { "create": false, "read": true, "update_stage": false, "approve_reject": false },
        "candidates": { "read": true, "create": false, "view_contact_info": false },
        "placements": { "create": false, "read": true, "view_fees": false },
        "organization": { "manage_settings": false, "invite_members": false, "remove_members": false },
        "billing": { "manage_subscription": false, "view_earnings": false, "manage_plans": false },
        "analytics": { "platform_wide": false, "company_wide": false, "personal": true },
        "admin": { "manage_users": false, "manage_recruiters": false, "system_settings": false }
    }'::jsonb,
    true
)
ON CONFLICT (name) DO NOTHING;

-- Step 4: Add index for active roles lookup
CREATE INDEX IF NOT EXISTS idx_roles_active ON public.roles(is_active) WHERE is_active = true;

-- Step 5: Verify seed data
DO $$
DECLARE
    role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count FROM public.roles WHERE is_system = true;
    IF role_count < 5 THEN
        RAISE EXCEPTION 'Expected 5 system roles, found %', role_count;
    END IF;
    RAISE NOTICE 'Successfully created roles table with % system roles', role_count;
END $$;
