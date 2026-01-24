/**
 * Portal App API Client - Simplified Version
 * 
 * This module provides a minimal wrapper around the shared API client.
 * Only complex operations that add business logic are included as named methods.
 * Simple CRUD operations should use the generic get/post/patch/delete methods directly.
 */

import { SplitsApiClient, type ApiResponse } from '@splits-network/shared-api-client';
import type { ApplicationStage } from '@splits-network/shared-types';

// Billing and subscription types
type DashboardStats = Record<string, any>;

interface Plan {
    id: string;
    name: string;
    slug: string;
    price_monthly: string;
    features: {
        candidate_submissions?: boolean;
        basic_analytics?: boolean;
        advanced_analytics?: boolean;
        ai_matching?: boolean;
        priority_support?: boolean;
        api_access?: boolean;
        white_label?: boolean;
        applications_per_month: number;
    };
    is_active: boolean;
}

interface LocalSubscription {
    id: string;
    user_id: string;
    plan_id: string;
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired';
    current_period_start?: string;
    current_period_end?: string;
    cancel_at?: string;
    canceled_at?: string;
    plan?: Plan;
}

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

    // ===== SUBSCRIPTION & BILLING METHODS =====
    
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export a factory function for creating authenticated clients
export function createAuthenticatedClient(token: string): ApiClient {
    return new ApiClient(token);
}