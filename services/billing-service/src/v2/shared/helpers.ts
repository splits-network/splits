/**
 * V2 Shared Helpers - Billing Service
 * Common utilities for routing, pagination, and context
 */

import { FastifyRequest } from 'fastify';

// ============================================
// USER CONTEXT
// ============================================

export interface UserContext {
    userId: string;
    clerkUserId: string;
    role: string;
    organizationId?: string;
}

const BILLING_ADMIN_ROLES = ['platform_admin', 'billing_admin'];

/**
 * Extract user context from request headers
 * Set by API Gateway after auth verification
 */
export function requireUserContext(request: FastifyRequest): UserContext {
    const userId = request.headers['x-user-id'] as string;
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    const role = request.headers['x-user-role'] as string;
    const organizationId = request.headers['x-organization-id'] as string | undefined;

    if (!userId || !clerkUserId) {
        throw new Error('Missing user context headers');
    }

    return {
        userId,
        clerkUserId,
        role,
        organizationId,
    };
}

export function isBillingAdmin(role?: string): boolean {
    if (!role) return false;
    return BILLING_ADMIN_ROLES.includes(role);
}

export function requireBillingAdmin(context: UserContext): void {
    if (!isBillingAdmin(context.role)) {
        throw new Error('Insufficient permissions for billing admin operation');
    }
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
