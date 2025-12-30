/**
 * V2 Shared Helpers - Notification Service
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
 * Extract user context from request headers (Clerk only).
 * Role resolution happens via Supabase joins in the repository layer.
 */
export function requireUserContext(request: FastifyRequest): UserContext {
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
