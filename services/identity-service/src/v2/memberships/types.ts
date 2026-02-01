/**
 * Membership Domain Types
 */

export interface MembershipFilters {
    organization_id?: string;
    company_id?: string | null;
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
