/**
 * Membership Domain Types
 * Org-scoped role assignments (company_admin, hiring_manager, platform_admin)
 */

export interface MembershipFilters {
    user_id?: string;
    role_name?: string;
    organization_id?: string;
    company_id?: string;
    page?: number;
    limit?: number;
}

export interface MembershipCreate {
    user_id: string;
    role_name: string;
    organization_id: string;
    company_id?: string | null;
}

export interface MembershipUpdate {
    role_name?: string;
    company_id?: string | null;
}
