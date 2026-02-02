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
    profile_image_url?: string;  // Add new profile image URL field
    profile_image_path?: string; // Add storage path for management
    status?: string;
    onboarding_status?: string;
    onboarding_step?: number;
    onboarding_completed_at?: string;
}

export interface ProfileImageUpdate {
    profile_image_url: string;
    profile_image_path: string;
}
