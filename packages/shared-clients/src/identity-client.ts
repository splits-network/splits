import { BaseClient, BaseClientConfig, ApiResponse } from './base-client';
import { User, Organization, UserRole, Membership } from '@splits-network/shared-types';

/**
 * Client for Identity Service
 */
export class IdentityClient extends BaseClient {
    constructor(config: BaseClientConfig) {
        super(config);
    }

    // User endpoints
    async getUser(userId: string): Promise<ApiResponse<User>> {
        return this.get(`/users/${userId}`);
    }

    async getUserByClerkId(clerkUserId: string): Promise<ApiResponse<User>> {
        return this.get(`/users/clerk/${clerkUserId}`);
    }

    async createUser(data: {
        clerk_user_id: string;
        email: string;
        name: string;
    }): Promise<ApiResponse<User>> {
        return this.post('/users', data);
    }

    // Organization endpoints
    async getOrganization(orgId: string): Promise<ApiResponse<Organization>> {
        return this.get(`/organizations/${orgId}`);
    }

    async createOrganization(data: {
        name: string;
        type: 'company';
    }): Promise<ApiResponse<Organization>> {
        return this.post('/organizations', data);
    }

    // User Role endpoints (entity-linked: recruiter, candidate; system-level: platform_admin)
    async getUserRoles(userId: string): Promise<ApiResponse<UserRole[]>> {
        return this.get(`/user-roles?user_id=${userId}`);
    }

    async createUserRole(data: {
        user_id: string;
        role_name: string;
        role_entity_id?: string | null;
    }): Promise<ApiResponse<UserRole>> {
        return this.post('/user-roles', data);
    }

    // Membership endpoints (org-scoped: company_admin, hiring_manager)
    async getMemberships(params: {
        organization_id?: string;
        company_id?: string;
        user_id?: string;
    }): Promise<ApiResponse<Membership[]>> {
        const query = new URLSearchParams();
        if (params.organization_id) query.set('organization_id', params.organization_id);
        if (params.company_id) query.set('company_id', params.company_id);
        if (params.user_id) query.set('user_id', params.user_id);
        return this.get(`/memberships?${query.toString()}`);
    }

    async createMembership(data: {
        user_id: string;
        role_name: string;
        organization_id: string;
        company_id?: string;
    }): Promise<ApiResponse<Membership>> {
        return this.post('/memberships', data);
    }

    async deleteMembership(membershipId: string): Promise<ApiResponse<void>> {
        return this.delete(`/memberships/${membershipId}`);
    }

    // Me endpoint
    async getCurrentUser(clerkUserId: string): Promise<ApiResponse<{
        user: User;
    }>> {
        return this.get(`/me?clerk_user_id=${clerkUserId}`);
    }
}
