/**
 * Shared API Client Factory
 *
 * Provides factory functions for creating portal and admin API clients.
 * Token is passed in by the app — no Clerk coupling in this package.
 */

import { SplitsApiClient } from '@splits-network/shared-api-client';

export type { ApiError, ApiResponse } from '@splits-network/shared-api-client';

/**
 * Get the portal API base URL from environment variables
 */
function getPortalBaseUrl(): string {
    if (typeof window === 'undefined') {
        // Server-side
        if (process.env.NEXT_PUBLIC_API_GATEWAY_URL) {
            return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_GATEWAY_URL);
        }
        const isInDocker = process.env.RUNNING_IN_DOCKER === 'true';
        return isInDocker ? 'http://api-gateway:3000' : 'http://localhost:3000';
    }
    // Client-side
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return normalizeBaseUrl(publicApiUrl);
}

/**
 * Get the admin gateway base URL from environment variables
 */
function getAdminBaseUrl(): string {
    const adminGatewayUrl = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL;
    if (adminGatewayUrl) {
        return normalizeBaseUrl(adminGatewayUrl);
    }
    return 'http://localhost:3001';
}

function normalizeBaseUrl(url: string): string {
    // Remove trailing slashes and any /api suffixes to prevent /api/api paths
    return url.replace(/\/+$/, '').replace(/\/api(?:\/v[0-9]+)?$/, '');
}

/**
 * Generic app API client wrapping SplitsApiClient with a cleaner interface.
 * Use the factory functions below rather than instantiating this directly.
 */
export class AppApiClient {
    private client: SplitsApiClient;

    constructor(baseUrl: string, token?: string) {
        this.client = new SplitsApiClient({ baseUrl, authToken: token });
    }

    setToken(token: string): void {
        this.client.setAuthToken(token);
    }

    clearToken(): void {
        this.client.clearAuthToken();
    }

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

    async put<T = any>(endpoint: string, data?: any): Promise<T> {
        const response = await this.client.put(endpoint, data);
        return response as T;
    }

    async delete<T = any>(endpoint: string): Promise<T> {
        const response = await this.client.delete(endpoint);
        return response as T;
    }
}

/**
 * Create an authenticated portal API client.
 * Token is obtained by the app via Clerk's useAuth() and passed here.
 */
export function createPortalClient(token: string): AppApiClient {
    return new AppApiClient(getPortalBaseUrl(), token);
}

/**
 * Create an authenticated admin gateway API client.
 * Token is obtained by the app via Clerk's useAuth() and passed here.
 */
export function createAdminClient(token: string): AppApiClient {
    return new AppApiClient(getAdminBaseUrl(), token);
}

/**
 * Create an unauthenticated portal API client for public routes.
 */
export function createUnauthenticatedClient(): AppApiClient {
    return new AppApiClient(getPortalBaseUrl());
}
