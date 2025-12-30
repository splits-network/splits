/**
 * User Domain Types
 */

export interface UserFilters {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    limit?: number;
}

export interface UserUpdate {
    email?: string;
    full_name?: string;
    avatar_url?: string;
    status?: string;
}
