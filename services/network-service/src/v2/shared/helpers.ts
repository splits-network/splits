/**
 * V2 Helper Functions
 * 
 * Shared utilities used across all V2 services.
 */

import { FastifyRequest } from 'fastify';

/**
 * Extract and validate user context from request headers
 * @throws Error if x-clerk-user-id header is missing
 */
export function requireUserContext(request: FastifyRequest): {
    clerkUserId: string;
} {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;

    if (!clerkUserId) {
        throw new Error('Missing x-clerk-user-id header');
    }

    return { clerkUserId };
}

/**
 * Extract optional user context from request headers
 * Used for public endpoints that enhance functionality when authenticated
 * @returns clerkUserId if present, undefined otherwise
 */
export function getOptionalUserContext(request: FastifyRequest): {
    clerkUserId?: string;
} {
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    return { clerkUserId };
}
