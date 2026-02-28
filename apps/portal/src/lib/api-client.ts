/**
 * Portal App API Client
 *
 * Thin re-export wrapper around @splits-network/shared-hooks.
 * Adds portal-specific business methods on top of the shared client.
 * 42 portal files import from this module — the public surface is stable.
 */

import { AppApiClient } from '@splits-network/shared-hooks';
export { AppApiClient } from '@splits-network/shared-hooks';

/**
 * Portal API client — extends shared AppApiClient with portal-specific business methods.
 * Use createAuthenticatedClient(token) or createUnauthenticatedClient() rather than
 * instantiating directly.
 */
export class ApiClient extends AppApiClient {
    constructor(token?: string) {
        // Forward to AppApiClient(baseUrl, token) where baseUrl is resolved from env vars.
        super(ApiClient._getPortalBaseUrl(), token);
    }

    private static _getPortalBaseUrl(): string {
        if (typeof window === 'undefined') {
            if (process.env.NEXT_PUBLIC_API_GATEWAY_URL) {
                return process.env.NEXT_PUBLIC_API_GATEWAY_URL.replace(/\/+$/, '').replace(/\/api(?:\/v[0-9]+)?$/, '');
            }
            const isInDocker = process.env.RUNNING_IN_DOCKER === 'true';
            return isInDocker ? 'http://api-gateway:3000' : 'http://localhost:3000';
        }
        const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        return publicApiUrl.replace(/\/+$/, '').replace(/\/api(?:\/v[0-9]+)?$/, '');
    }

    // ===== PORTAL-SPECIFIC BUSINESS METHODS =====

    /**
     * Get current user's recruiter profile.
     * Uses /me endpoint for security (prevents seeing other users' data).
     */
    async getCurrentRecruiter(): Promise<{ data: any }> {
        return await this.get('/recruiters/me');
    }

    /**
     * Get current user's active subscription.
     * Uses /me endpoint for security.
     */
    async getCurrentSubscription(): Promise<{ data: any }> {
        return await this.get('/subscriptions/me');
    }
}

// Singleton unauthenticated client — used for public API access
export const apiClient = new ApiClient();

/**
 * Factory: create an authenticated portal API client.
 * Replaces createPortalClient from shared-hooks with a portal-specific ApiClient
 * so all 42 consumers retain access to portal business methods (getCurrentRecruiter, etc.).
 */
export function createAuthenticatedClient(token: string): ApiClient {
    return new ApiClient(token);
}

/**
 * Factory: create an unauthenticated portal API client for public routes.
 */
export function createUnauthenticatedClient(): ApiClient {
    return new ApiClient();
}
