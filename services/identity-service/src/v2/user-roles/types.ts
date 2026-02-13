/**
 * User Role Domain Types
 * Entity-linked role assignments (recruiter, candidate) and system-level roles (platform_admin)
 */

export interface UserRoleFilters {
    user_id?: string;
    role_name?: string;
    page?: number;
    limit?: number;
}

export interface UserRoleCreate {
    user_id: string;
    role_name: string;
    role_entity_id?: string | null;  // Required for entity-linked roles (recruiter, candidate), null for system-level roles (platform_admin)
}

export interface UserRoleUpdate {
    role_name?: string;
}
