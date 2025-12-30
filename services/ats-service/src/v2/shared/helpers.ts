/**
 * V2 Helper Functions
 * 
 * Shared utilities used across all V2 services.
 */

import { FastifyRequest } from 'fastify';

/**
 * Extract user context from request headers if available.
 * Returns null when the request is anonymous (public endpoint).
 */
export function getUserContext(request: FastifyRequest): { clerkUserId: string } | null {
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;

    if (!clerkUserId) {
        return null;
    }

    return { clerkUserId };
}

/**
 * Extract and validate user context from request headers
 * @throws Error if x-clerk-user-id header is missing
 */
export function requireUserContext(request: FastifyRequest): {
    clerkUserId: string;
} {
    const context = getUserContext(request);

    if (!context) {
        throw new Error('Missing x-clerk-user-id header');
    }

    return context;
}
