/**
 * V2 Helper Functions
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
 * Build pagination response
 */
export function buildPaginationResponse(
    total: number,
    page: number,
    limit: number
): {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
} {
    return {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
    };
}

/**
 * Validate pagination params
 */
export function validatePaginationParams(page?: number, limit?: number): {
    page: number;
    limit: number;
} {
    const validatedPage = Math.max(1, page || 1);
    const validatedLimit = Math.min(100, Math.max(1, limit || 25));

    return {
        page: validatedPage,
        limit: validatedLimit,
    };
}
