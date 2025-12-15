import { BaseClient, BaseClientConfig } from './base-client';
import { User, Organization, Membership } from '@splits-network/shared-types';

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

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
        type: 'company' | 'platform';
    }): Promise<ApiResponse<Organization>> {
        return this.post('/organizations', data);
    }

    // Membership endpoints
    async getUserMemberships(userId: string): Promise<ApiResponse<Membership[]>> {
        return this.get(`/users/${userId}/memberships`);
    }

    async createMembership(data: {
        user_id: string;
        organization_id: string;
        role: string;
    }): Promise<ApiResponse<Membership>> {
        return this.post('/memberships', data);
    }

    // Me endpoint
    async getCurrentUser(clerkUserId: string): Promise<ApiResponse<{
        user: User;
        memberships: Membership[];
    }>> {
        return this.get(`/me?clerk_user_id=${clerkUserId}`);
    }
}
