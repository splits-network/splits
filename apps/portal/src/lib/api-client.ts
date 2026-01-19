/**
 * Portal App API Client - Simplified Version
 * 
 * This module provides a minimal wrapper around the shared API client.
 * Only complex operations that add business logic are included as named methods.
 * Simple CRUD operations should use the generic get/post/patch/delete methods directly.
 */

import { SplitsApiClient, type ApiResponse } from '@splits-network/shared-api-client';
import type { ApplicationStage } from '@splits-network/shared-types';
type DashboardStats = Record<string, any>;

/**
 * Portal API client - simplified wrapper around shared client
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
     * Remove authentication token
     */
    clearToken(): void {
        this.client.clearAuthToken();
    }

    // ===== DIRECT HTTP METHODS =====
    // Use these for simple CRUD operations

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

    // ===== COMPLEX BUSINESS LOGIC OPERATIONS ONLY =====
    // Keep only methods that add real value beyond simple HTTP calls

    /**
     * Get current user's recruiter profile
     * Uses /me endpoint for security (prevents seeing other users' data)
     */
    async getCurrentRecruiter(): Promise<{ data: any }> {
        return await this.get('/recruiters/me');
    }

    /**
     * Get current user's active subscription
     * Uses /me endpoint for security
     */
    async getCurrentSubscription(): Promise<{ data: any }> {
        return await this.get('/subscriptions/me');
    }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export a factory function for creating authenticated clients
export function createAuthenticatedClient(token: string): ApiClient {
    return new ApiClient(token);
}