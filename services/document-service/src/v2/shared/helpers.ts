/**
 * V2 Shared Helpers - Document Service
 * Common utilities for routing, pagination, and context
 */

import { FastifyRequest } from 'fastify';

// ============================================
// USER CONTEXT
// ============================================

export interface UserContext {
    clerkUserId: string;
}

/**
 * Validate internal service authentication
 * Allows trusted services to call endpoints without user auth
 */
export function validateInternalService(request: FastifyRequest): boolean {
    const serviceKey = request.headers['x-internal-service-key'] as string | undefined;
    const expectedKey = process.env.INTERNAL_SERVICE_KEY;
    
    if (!expectedKey) {
        return false;
    }
    
    return serviceKey === expectedKey;
}

/**
 * Extract user context from request headers.
 * Backend repositories resolve identity + role information.
 * Supports internal service calls.
 */
export function requireUserContext(request: FastifyRequest): UserContext {
    // Allow internal services to bypass user auth
    if (validateInternalService(request)) {
        return {
            clerkUserId: 'internal-service',
        };
    }

    const clerkUserId = request.headers['x-clerk-user-id'] as string;

    if (!clerkUserId) {
        throw new Error('Missing x-clerk-user-id header');
    }

    return {
        clerkUserId,
    };
}

// ============================================
// PAGINATION
// ============================================

export interface PaginationParams {
    page: number;
    limit: number;
}

/**
 * Validate and extract pagination parameters from query
 * Defaults: page=1, limit=25
 */
export function validatePaginationParams(query: Record<string, any>): PaginationParams {
    let page = parseInt(query.page || '1', 10);
    let limit = parseInt(query.limit || '25', 10);

    // Validate ranges
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 25;
    if (limit > 100) limit = 100; // Cap at 100 items per page

    return { page, limit };
}

/**
 * Build pagination response object
 */
export function buildPaginationResponse(
    page: number,
    limit: number,
    total: number
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
