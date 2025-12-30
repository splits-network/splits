/**
 * V2 Types - Identity Service
 * Shared types for filters, updates, and responses
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

export interface OrganizationFilters {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface OrganizationUpdate {
    name?: string;
    slug?: string;
    description?: string;
    avatar_url?: string;
    status?: string;
}

export interface MembershipFilters {
    organization_id?: string;
    user_id?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface MembershipUpdate {
    role?: string;
    status?: string;
}

export interface InvitationFilters {
    organization_id?: string;
    email?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface InvitationUpdate {
    status?: string;
}

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}
