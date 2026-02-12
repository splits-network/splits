/**
 * User Role Domain Types
 * Entity-linked role assignments (recruiter, candidate)
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
    role_entity_id: string;
}

export interface UserRoleUpdate {
    role_name?: string;
}
