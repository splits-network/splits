/**
 * Admin App API Client
 *
 * Extends shared AppApiClient with the admin gateway base URL.
 * All admin API calls route through admin-gateway (port 3030).
 */

import { AppApiClient } from '@splits-network/shared-hooks';
export { AppApiClient } from '@splits-network/shared-hooks';

/**
 * Admin API client — extends shared AppApiClient with admin gateway base URL.
 * Use createAuthenticatedClient(token) rather than instantiating directly.
 */
export class AdminApiClient extends AppApiClient {
    constructor(token?: string) {
        super(AdminApiClient._getAdminBaseUrl(), token);
    }

    private static _getAdminBaseUrl(): string {
        const url = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL;
        if (url) return url.replace(/\/+$/, '');
        // Fallback: server-side uses K8s service name, client-side uses localhost
        return typeof window === 'undefined'
            ? 'http://admin-gateway:3030'
            : 'http://localhost:3030';
    }
}

/**
 * Factory: create an authenticated admin API client.
 */
export function createAuthenticatedClient(token: string): AdminApiClient {
    return new AdminApiClient(token);
}
