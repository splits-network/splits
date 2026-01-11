/**
 * User Domain Types
 */

export interface UserFilters {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    limit?: number;
    clerk_user_id?: string;
}

export interface UserUpdate {
    email?: string;
    name?: string;
    avatar_url?: string;
    status?: string;
    onboarding_status?: string;
    onboarding_step?: number;
    onboarding_completed_at?: string;
}
