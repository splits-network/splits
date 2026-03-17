/**
 * Recruiter Codes Types - V2
 * Types for recruiter referral code management and usage tracking
 */

export interface RecruiterCode {
    id: string;
    recruiter_id: string;
    code: string;
    label?: string;
    status: 'active' | 'inactive';
    is_default: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    // Enriched data
    recruiter?: {
        id: string;
        user: {
            name: string;
            email: string;
            profile_image_url?: string;
        };
    };
    // Aggregated
    usage_count?: number;
    // Settings
    expiry_date?: string;
    max_uses?: number;
    uses_remaining?: number;
}

export interface RecruiterCodeFilters {
    recruiter_id?: string;
    status?: 'active' | 'inactive';
    search?: string;
    is_default?: string;
    expiry_status?: string;
    has_usage_limit?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface CreateRecruiterCodeRequest {
    label?: string;
    is_default?: boolean;
    expiry_date?: string;
    max_uses?: number;
    uses_remaining?: number;
}

export interface RecruiterCodeUpdate {
    label?: string;
    status?: 'active' | 'inactive';
    is_default?: boolean;
    expiry_date?: string | null;
    max_uses?: number | null;
    uses_remaining?: number | null;
}

export interface RecruiterCodeLogEntry {
    id: string;
    recruiter_code_id: string;
    recruiter_id: string;
    user_id: string;
    signup_type?: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    // Enriched
    user?: {
        name: string;
        email: string;
    };
    recruiter_code?: {
        code: string;
        label?: string;
    };
}

export interface LogCodeUsageRequest {
    code: string;
    signup_type?: string;
    ip_address?: string;
    user_agent?: string;
}

export interface RecruiterCodeLookupResult {
    id: string;
    code: string;
    recruiter_id: string;
    is_valid: boolean;
    recruiter?: {
        id: string;
        name: string;
        profile_image_url?: string;
    };
    error_message?: string;
}
