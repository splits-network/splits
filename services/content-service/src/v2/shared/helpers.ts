/**
 * V2 Helper Functions
 *
 * Shared utilities used across all V2 services.
 */

import { FastifyRequest } from 'fastify';

/**
 * Validate internal service authentication.
 * Returns true if request has valid internal service key.
 */
function validateInternalService(request: FastifyRequest): boolean {
    const internalServiceKey = request.headers['x-internal-service-key'] as string | undefined;
    const expectedKey = process.env.INTERNAL_SERVICE_KEY;

    if (!expectedKey) return false;

    return internalServiceKey === expectedKey;
}

/**
 * Extract user context from request headers if available.
 * Returns null when the request is anonymous (public endpoint).
 */
export function getUserContext(request: FastifyRequest): { clerkUserId: string } | null {
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;

    if (!clerkUserId) return null;

    return { clerkUserId };
}

/**
 * Extract and validate user context from request headers.
 * Allows internal service authentication to bypass user auth.
 * @throws Error if neither x-clerk-user-id nor valid x-internal-service-key is present
 */
export function requireUserContext(request: FastifyRequest): { clerkUserId: string } {
    if (validateInternalService(request)) {
        return { clerkUserId: 'internal-service' };
    }

    const context = getUserContext(request);

    if (!context) {
        throw new Error('Missing x-clerk-user-id header');
    }

    return context;
}
