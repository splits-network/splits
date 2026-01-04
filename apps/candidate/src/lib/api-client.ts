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
}

// ===== EXPORTS =====

export const apiClient = new ApiClient();

export function createAuthenticatedClient(token: string): ApiClient {
    return new ApiClient(token);
}
