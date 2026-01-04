/**
 * Candidate App API Client
 *
 * Provides a clean wrapper around the shared SplitsApiClient.
 * All data fetching uses generic HTTP methods for consistency with the portal.
 */

import { SplitsApiClient } from '@splits-network/shared-api-client';
import { normalizeDocuments } from './document-utils';

/**
 * Candidate API client - wrapper around the shared Splits client
 */
export class ApiClient {
    private client: SplitsApiClient;

    constructor(token?: string) {
        this.client = new SplitsApiClient();
        if (token) {
            this.client.setAuthToken(token);
        }
    }

    /**
     * Set authentication token
     */
    setToken(token: string): void {
        this.client.setAuthToken(token);
    }

    /**
     * Clear authentication token
     */
    clearToken(): void {
        this.client.clearAuthToken();
    }

    // ===== GENERIC HTTP METHODS =====

    async get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T> {
        const response = await this.client.get(endpoint, options?.params);
        return response as T;
    }

    async post<T = any>(endpoint: string, data?: any): Promise<T> {
        const response = await this.client.post(endpoint, data);
        return response as T;
    }

    async patch<T = any>(endpoint: string, data?: any): Promise<T> {
        const response = await this.client.patch(endpoint, data);
        return response as T;
    }

    async delete<T = any>(endpoint: string): Promise<T> {
        const response = await this.client.delete(endpoint);
        return response as T;
    }

    // ===== DOCUMENT METHODS =====

    async uploadDocument(formData: FormData): Promise<any> {
        return this.client.uploadDocument(formData);
    }

    // ===== CANDIDATE METHODS =====

    async getCandidateById(id: string): Promise<any> {
        const response = await this.client.get(`/v2/candidates/${id}`);
        return response;
    }

    async getDashboardStats(): Promise<any> {
        const response = await this.client.get('/v2/stats', { scope: 'candidate' });
        return response;
    }

    async getRecentApplications(): Promise<any[]> {
        const response = await this.client.get('/v2/applications', { 
            limit: 5, 
            sort_by: 'created_at',
            sort_order: 'desc'
        });
        return response.data || [];
    }

    // ===== INVITATION METHODS =====

    async getInvitationByToken(token: string): Promise<any> {
        // Token-based endpoint doesn't need auth
        const tempClient = new SplitsApiClient();
        const response = await tempClient.get(`/v2/invitations/token/${token}`);
        return response;
    }

    async acceptInvitation(token: string): Promise<any> {
        const response = await this.client.post(`/v2/invitations/token/${token}/accept`);
        return response;
    }

    async declineInvitation(token: string, reason?: string): Promise<any> {
        const response = await this.client.post(`/v2/invitations/token/${token}/decline`, { reason });
        return response;
    }

    // ===== APPLICATION METHODS =====

    async updateApplication(id: string, data: any): Promise<any> {
        const response = await this.client.patch(`/v2/applications/${id}`, data);
        return response;
    }

    async withdrawApplication(id: string, reason?: string): Promise<any> {
        const response = await this.client.post(`/v2/applications/${id}/withdraw`, { reason });
        return response;
    }

    // ===== RECRUITER METHODS =====

    async getMyRecruiters(): Promise<any> {
        const response = await this.client.get('/v2/recruiter-candidates');
        return response;
    }

    // ===== PROFILE METHODS =====

    async getMyProfile(): Promise<any> {
        const response = await this.client.get('/v2/candidates', { limit: 1 });
        return response.data?.[0] || null;
    }

    async updateMyProfile(data: any): Promise<any> {
        // Get current user's candidate ID first
        const profile = await this.getMyProfile();
        if (!profile?.id) {
            throw new Error('Candidate profile not found');
        }
        const response = await this.client.patch(`/v2/candidates/${profile.id}`, data);
        return response;
    }
}

// ===== EXPORTS =====

// Create a singleton instance for default export
const defaultClient = new ApiClient();

export default defaultClient;
export const apiClient = defaultClient;

export function createAuthenticatedClient(token: string): ApiClient {
    return new ApiClient(token);
}
