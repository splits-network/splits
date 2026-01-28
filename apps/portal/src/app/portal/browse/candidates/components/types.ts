export interface MarketplaceProfile {
    bio_rich?: string;
    specialties?: string[];
    industries?: string[];
    availability?: string;
    preferred_salary?: number;
    preferred_currency?: string;
}

export interface Candidate {
    id: string;
    full_name: string;
    description?: string; // Legacy field, prefer bio
    bio?: string;
    email: string;
    phone?: string;
    current_title?: string;
    current_company?: string;
    location?: string;
    skills?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    github_url?: string;
    verification_status?: 'verified' | 'pending' | 'failed' | 'unverified';
    is_new?: boolean;
    has_other_active_recruiters?: boolean;
    other_active_recruiters_count?: number;
    is_sourcer?: boolean;
    has_active_relationship?: boolean;
    has_pending_invitation?: boolean;
    created_at: string;
    updated_at?: string;
    
    // Preferences & Visibility
    marketplace_visibility?: 'public' | 'private' | 'hidden';
    marketplace_profile?: MarketplaceProfile;
    show_email?: boolean;
    show_phone?: boolean;
    show_location?: boolean;
    show_current_company?: boolean;
    show_salary_expectations?: boolean;
    
    // Career Preferences
    desired_salary_min?: number;
    desired_salary_max?: number;
    desired_job_type?: string;
    open_to_remote?: boolean;
    open_to_relocation?: boolean;
    availability?: string;
}

export interface RecruiterCandidate {
    id: string;
    recruiter_id: string;
    candidate_id: string;
    status: string;
    invited_at: string;
    invitation_expires_at: string;
    consent_given: boolean;
    consent_given_at?: string;
    declined_at?: string;
    declined_reason?: string;
    created_at: string;
    updated_at: string;
}

export interface CandidateFilters {
    scope?: "mine" | "all";
    open_to_remote?: boolean;
    desired_job_type?: string;
    verification_status?: string;
}
