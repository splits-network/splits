/**
 * V2 Shared Helpers - Billing Service
 * Common utilities for routing, pagination, and context
 */

import { FastifyRequest } from 'fastify';
import type { AccessContext } from './access';

// ============================================
// USER CONTEXT
// ============================================

export interface UserContext {
    clerkUserId: string;
}

const BILLING_ADMIN_ROLES = ['platform_admin', 'company_admin'];

/**
 * Extract user context from request headers
 * Set by API Gateway after auth verification
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

export function isBillingAdmin(access: AccessContext): boolean {
    return access.isPlatformAdmin || access.roles.some((role) => BILLING_ADMIN_ROLES.includes(role));
}

export function requireBillingAdmin(access: AccessContext): void {
    if (!isBillingAdmin(access)) {
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
