/**
 * Recruiter-Company Types - V2
 * Defines types for recruiter-company relationship management
 */

export interface RecruiterCompany {
    id: string;
    recruiter_id: string;
    company_id: string;
    relationship_type: 'sourcer' | 'recruiter';
    status: 'pending' | 'active' | 'declined' | 'terminated';
    can_manage_company_jobs: boolean;
    relationship_start_date: string;
    relationship_end_date?: string;
    termination_reason?: string;
    terminated_by?: string;
    invited_by?: string;
    created_at: string;
    updated_at: string;
}

export interface RecruiterCompanyCreate {
    recruiter_id: string;
    company_id: string;
    relationship_type: 'sourcer' | 'recruiter';
    can_manage_company_jobs?: boolean;
    invited_by?: string;
}

export interface RecruiterCompanyUpdate {
    status?: 'pending' | 'active' | 'declined' | 'terminated';
    can_manage_company_jobs?: boolean;
    relationship_end_date?: string;
    termination_reason?: string;
    terminated_by?: string;
}

export interface RecruiterCompanyFilters {
    recruiter_id?: string;
    company_id?: string;
    relationship_type?: 'sourcer' | 'recruiter';
    status?: 'pending' | 'active' | 'declined' | 'terminated';
    can_manage_company_jobs?: boolean;
    search?: string; // Search recruiter or company names
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface InviteRecruiterRequest {
    recruiter_email: string;
    company_id: string;
    can_manage_company_jobs?: boolean;
    message?: string; // Optional invitation message
}

export interface AcceptInvitationRequest {
    invitation_id: string;
    accept: boolean; // true = accept, false = decline
}

export interface TerminateRelationshipRequest {
    reason: string;
}

export interface RequestConnectionRequest {
    company_id: string;
    message?: string;
    relationship_type?: 'sourcer' | 'recruiter';
}