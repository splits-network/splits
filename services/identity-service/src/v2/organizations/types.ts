/**
 * Organization Domain Types
 */

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
