/**
 * Shared types for the recruiter-company invitation wizard pages
 */

export interface RecruiterCompanyPermissions {
    can_view_jobs: boolean;
    can_create_jobs: boolean;
    can_edit_jobs: boolean;
    can_advance_candidates: boolean;
    can_view_applications: boolean;
    can_submit_candidates: boolean;
}

export const DEFAULT_PERMISSIONS: RecruiterCompanyPermissions = {
    can_view_jobs: true,
    can_create_jobs: false,
    can_edit_jobs: false,
    can_advance_candidates: true,
    can_view_applications: true,
    can_submit_candidates: true,
};

export interface InvitationRelationship {
    id: string;
    recruiter_id: string;
    company_id: string;
    relationship_type: 'sourcer' | 'recruiter';
    status: 'pending' | 'active' | 'declined' | 'terminated';
    permissions: RecruiterCompanyPermissions;
    invited_by?: string;
    request_message?: string;
    terms_acknowledged_at?: string;
    created_at: string;
    invitation_message?: string;
    recruiter: {
        id: string;
        user_id: string;
        bio?: string;
        tagline?: string;
        phone?: string;
        user: {
            name: string;
            email: string;
        };
    };
    company: {
        id: string;
        name: string;
        industry?: string;
        headquarters_location?: string;
        description?: string;
        website?: string;
    };
}

export interface WizardStep {
    num: string;
    label: string;
    icon: string;
}
