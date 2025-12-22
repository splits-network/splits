// DTOs for API requests and responses

// Identity DTOs
export interface UserProfileDTO {
    id: string;
    email: string;
    name: string;
    memberships: MembershipDTO[];
    onboarding_status?: string;
    onboarding_step?: number;
    onboarding_completed_at?: Date;
}

export interface MembershipDTO {
    id: string;
    organization_id: string;
    organization_name: string;
    role: string;
}

// ATS DTOs
export interface CreateJobDTO {
    title: string;
    department?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    fee_percentage: number;
    description?: string;
    status?: string;
}

export interface JobDTO {
    id: string;
    company_id: string;
    company_name: string;
    title: string;
    department?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    fee_percentage: number;
    description?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface SubmitCandidateDTO {
    job_id: string;
    full_name: string;
    email: string;
    linkedin_url?: string;
    notes?: string;
}

export interface CandidateDTO {
    id: string;
    full_name: string;
    email: string;
    linkedin_url?: string;
    created_at: string;
}

export interface ApplicationDTO {
    id: string;
    job_id: string;
    job_title: string;
    candidate_id: string;
    candidate_name: string;
    candidate_email: string;
    recruiter_id?: string;
    recruiter_name?: string;
    stage: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface UpdateApplicationStageDTO {
    stage: string;
    notes?: string;
}

export interface AcceptApplicationDTO {
    application_id: string;
}

export interface CreatePlacementDTO {
    application_id: string;
    salary: number;
    fee_percentage: number;
}

export interface PlacementDTO {
    id: string;
    job_id: string;
    job_title: string;
    candidate_id: string;
    candidate_name: string;
    company_id: string;
    company_name: string;
    recruiter_id: string;
    recruiter_name: string;
    hired_at: string;
    salary: number;
    fee_percentage: number;
    fee_amount: number;
    recruiter_share: number;
    platform_share: number;
    created_at: string;
}

// Network DTOs
export interface RecruiterDTO {
    id: string;
    user_id: string;
    name: string;
    email: string;
    status: string;
    bio?: string;
    created_at: string;
}

export interface AssignRecruiterDTO {
    job_id: string;
    recruiter_id: string;
}

// Marketplace DTOs
export interface UpdateMarketplaceProfileDTO {
    marketplace_enabled?: boolean;
    marketplace_visibility?: 'public' | 'limited' | 'hidden';
    industries?: string[];
    specialties?: string[];
    location?: string;
    tagline?: string;
    years_experience?: number;
    marketplace_profile?: Record<string, any>;
    show_success_metrics?: boolean;
    show_contact_info?: boolean;
}

export interface MarketplaceRecruiterDTO {
    id: string;
    user_id: string;
    name: string;
    email?: string; // Only if show_contact_info is true
    phone?: string; // Only if show_contact_info is true
    marketplace_tagline?: string;
    marketplace_industries?: string[];
    marketplace_specialties?: string[];
    marketplace_location?: string;
    marketplace_years_experience?: number;
    marketplace_profile?: Record<string, any>;
    bio?: string;
    // Success metrics (only if show_success_metrics is true)
    total_placements?: number;
    success_rate?: number;
    average_time_to_hire?: number;
    reputation_score?: number;
    created_at: string;
}

export interface CreateConnectionRequestDTO {
    recruiter_id: string;
    message?: string;
}

export interface RespondToConnectionDTO {
    status: 'accepted' | 'declined';
}

export interface SendMarketplaceMessageDTO {
    connection_id: string;
    message: string;
}

export interface MarketplaceConnectionDTO {
    id: string;
    candidate_user_id: string;
    candidate_name?: string;
    recruiter_id: string;
    recruiter_name?: string;
    status: 'pending' | 'accepted' | 'declined';
    message?: string;
    unread_count?: number;
    created_at: string;
    updated_at: string;
    responded_at?: string;
}

export interface MarketplaceMessageDTO {
    id: string;
    connection_id: string;
    sender_user_id: string;
    sender_name?: string;
    sender_type: 'candidate' | 'recruiter';
    message: string;
    read_at?: string;
    created_at: string;
}

export interface MarketplaceSearchFilters {
    industries?: string[];
    specialties?: string[];
    location?: string;
    search?: string; // Text search in name, tagline, bio
    page?: number;
    limit?: number;
    sort_by?: 'reputation_score' | 'total_placements' | 'created_at' | 'years_experience';
    sort_order?: 'asc' | 'desc';
}

// Billing DTOs
export interface SubscriptionDTO {
    id: string;
    recruiter_id: string;
    plan_id: string;
    plan_name: string;
    status: string;
    current_period_start?: string;
    current_period_end?: string;
    cancel_at?: string;
}

// Common response wrappers
export interface ApiResponse<T> {
    data: T;
    meta?: Record<string, any>;
}

export interface ApiError {
    error: {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}
