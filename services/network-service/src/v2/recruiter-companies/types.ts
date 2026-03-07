/**
 * Recruiter-Company Types - V2
 * Defines types for recruiter-company relationship management
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

export interface RecruiterCompany {
    id: string;
    recruiter_id: string;
    company_id: string;
    relationship_type: 'sourcer' | 'recruiter';
    status: 'pending' | 'active' | 'declined' | 'terminated';
    permissions: RecruiterCompanyPermissions;
    relationship_start_date: string;
    relationship_end_date?: string;
    termination_reason?: string;
    terminated_by?: string;
    invited_by?: string;
    request_message?: string;
    terms_acknowledged_at?: string;
    terms_acknowledged_by?: string;
    created_at: string;
    updated_at: string;
}

export interface RecruiterCompanyCreate {
    recruiter_id: string;
    company_id: string;
    relationship_type: 'sourcer' | 'recruiter';
    permissions?: RecruiterCompanyPermissions;
    invited_by?: string;
    request_message?: string;
}

export interface RecruiterCompanyUpdate {
    status?: 'pending' | 'active' | 'declined' | 'terminated';
    permissions?: RecruiterCompanyPermissions;
    relationship_end_date?: string;
    termination_reason?: string;
    terminated_by?: string;
}

export interface RecruiterCompanyFilters {
    recruiter_id?: string;
    company_id?: string;
    relationship_type?: 'sourcer' | 'recruiter';
    status?: 'pending' | 'active' | 'declined' | 'terminated';
    search?: string; // Search recruiter or company names
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface InviteRecruiterRequest {
    relationship_type?: 'sourcer' | 'recruiter';
    recruiter_id: string;
    company_id: string;
    permissions?: RecruiterCompanyPermissions;
    message?: string; // Optional invitation message
}

export interface AcceptInvitationRequest {
    invitation_id: string;
    accept: boolean; // true = accept, false = decline
    permissions?: RecruiterCompanyPermissions; // Company sets permissions when accepting
}

export interface TerminateRelationshipRequest {
    reason: string;
}

export interface RequestConnectionRequest {
    company_id: string;
    message?: string;
    relationship_type?: 'sourcer' | 'recruiter';
}