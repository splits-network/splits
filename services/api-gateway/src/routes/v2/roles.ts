import { UserRole } from '../../auth';

export const ATS_VIEW_ROLES: UserRole[] = [
    'candidate',
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];

export const ATS_COMPANY_VIEW_ROLES: UserRole[] = [
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];

export const ATS_CANDIDATE_VIEW_ROLES: UserRole[] = [
    'candidate',
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];

export const ATS_MANAGE_ROLES: UserRole[] = ['company_admin', 'hiring_manager', 'platform_admin'];

export const ATS_DELETE_ROLES: UserRole[] = ['company_admin', 'platform_admin'];

export const ATS_CANDIDATE_MANAGE_ROLES: UserRole[] = ['recruiter', 'company_admin', 'platform_admin'];

export const ATS_PLACEMENT_ROLES: UserRole[] = ['recruiter', 'company_admin', 'platform_admin'];

export const AUTHENTICATED_ROLES: UserRole[] = [
    'candidate',
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];

export const ATS_AI_TRIGGER_ROLES: UserRole[] = [
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];

export const NETWORK_VIEW_ROLES: UserRole[] = [
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];

export const NETWORK_ASSIGNMENT_ROLES: UserRole[] = ['company_admin', 'platform_admin'];

export const NETWORK_ADMIN_ROLES: UserRole[] = ['platform_admin'];

export const NETWORK_TEAM_ROLES: UserRole[] = ['recruiter', 'company_admin', 'platform_admin'];

export const BILLING_VIEW_ROLES: UserRole[] = ['platform_admin'];

export const BILLING_SUBSCRIPTION_ROLES: UserRole[] = ['recruiter', 'company_admin', 'platform_admin'];

export const IDENTITY_ADMIN_ROLES: UserRole[] = ['platform_admin'];

export const AUTOMATION_ADMIN_ROLES: UserRole[] = ['platform_admin'];
